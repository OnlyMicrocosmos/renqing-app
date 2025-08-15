// src/utils/reminder.js
import { useAuthStore } from '@/stores/auth.store'
import { useEventStore } from '@/stores/event.store'
import dateUtil from './date.js'

let reminderInterval = null
let isInitialized = false

/**
 * 初始化提醒服务
 */
export const initReminderService = () => {
  // 确保单次初始化
  if (isInitialized) {
    console.log('Reminder service already initialized')
    return
  }
  
  // 清除现有定时器（避免重复初始化）
  if (reminderInterval) {
    clearInterval(reminderInterval)
    reminderInterval = null
  }
  
  // 检查浏览器通知权限
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.warn('This browser does not support required features for notifications')
    isInitialized = true
    return
  }
  
  // 请求通知权限（兼容不同浏览器实现）
  const requestPermissionAndInit = () => {
    try {
      // 立即检查一次提醒
      checkReminders()
      
      // 设置定时检查提醒
      reminderInterval = setInterval(checkReminders, 60 * 1000) // 每分钟检查一次
      
      isInitialized = true
      console.log('Reminder service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize reminder service:', error)
      isInitialized = false
    }
  }
  
  try {
    if (Notification.permission !== 'granted') {
      // 使用Promise方式处理权限请求
      new Promise((resolve) => {
        Notification.requestPermission().then(permission => resolve(permission))
      }).then(permission => {
        if (permission !== 'granted') {
          console.warn('Notification permission denied')
          isInitialized = true
          return
        }
        requestPermissionAndInit()
      })
      return
    } else {
      requestPermissionAndInit()
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    isInitialized = true
    return
  }
}

/**
 * 停止提醒服务
 */
export const stopReminderService = () => {
  if (reminderInterval) {
    clearInterval(reminderInterval)
    reminderInterval = null
  }
  isInitialized = false
}

/**
 * 设置登出处理程序
 */
export const setupReminderLogoutHandler = () => {
  const authStore = useAuthStore()
  
  // 监听登出事件
  authStore.$onAction(({ name, after }) => {
    if (name === 'logout') {
      after(() => {
        stopReminderService()
      })
    }
  })
}

/**
 * 计算提醒时间
 * @param {Date|string} eventDate - 事件日期
 * @param {number} daysBefore - 提前提醒天数
 * @returns {Date} 提醒日期
 */
export const calculateReminderTime = (eventDate, daysBefore) => {
  const event = new Date(eventDate)
  const reminderDate = new Date(event)
  reminderDate.setDate(event.getDate() - daysBefore)
  return reminderDate
}

/**
 * 检查是否需要提醒
 * @param {Object} event - 事件对象
 * @returns {boolean} 是否需要提醒
 */
const shouldNotify = (event) => {
  if (!event.remindBefore || event.reminded) return false
  
  const now = new Date()
  const reminderTime = calculateReminderTime(event.date, event.remindBefore)
  return now >= reminderTime
}

/**
 * 生成提醒消息
 * @param {Object} event - 事件对象
 * @returns {Object} 提醒消息对象
 */
const generateReminder = (event) => {
  const eventDate = new Date(event.date)
  const daysLeft = dateUtil.diff(new Date(), eventDate, 'days')
  
  let message = ''
  let urgency = 'normal'
  
  if (daysLeft === 0) {
    message = `今天有${event.type === 'given' ? '送礼' : '收礼'}事件：${event.title}`
    urgency = 'high'
  } else if (daysLeft === 1) {
    message = `明天有${event.type === 'given' ? '送礼' : '收礼'}事件：${event.title}`
    urgency = 'high'
  } else {
    message = `${daysLeft}天后有${event.type === 'given' ? '送礼' : '收礼'}事件：${event.title}`
    urgency = daysLeft <= 3 ? 'medium' : 'normal'
  }
  
  return {
    id: `reminder-${event.id}-${Date.now()}`,
    title: '人情往来提醒',
    message,
    eventId: event.id,
    date: new Date(),
    read: false,
    urgency
  }
}

/**
 * 检查并发送提醒
 */
const checkReminders = async () => {
  try {
    const eventStore = useEventStore()
    const now = new Date()
    
    // 如果事件未加载或上次加载超过1小时，重新加载
    if (eventStore.events.length === 0 || 
        !eventStore.lastLoaded || 
        (now - new Date(eventStore.lastLoaded)) > 3600000) {
      await eventStore.loadEvents()
    }
    
    // 过滤需要提醒的事件
    const pendingEvents = eventStore.events.filter(event => {
      return !event.reminded && shouldNotify(event)
    })
    
    // 如果没有需要提醒的事件，直接返回
    if (pendingEvents.length === 0) {
      return
    }
    
    // 生成并发送提醒
    const eventsToUpdate = []
    
    for (const event of pendingEvents) {
      const reminder = generateReminder(event)
      showReminder(reminder)
      eventsToUpdate.push({ ...event, reminded: true })
      
      console.log(`Reminder sent for event: ${event.title}`)
    }
    
    // 批量更新事件提醒状态
    if (eventStore.updateEvents) {
      await eventStore.updateEvents(eventsToUpdate)
    }
    
  } catch (error) {
    console.error('Error checking reminders:', error)
  }
}

/**
 * 显示系统提醒
 * @param {Object} reminder - 提醒对象
 */
const showReminder = (reminder) => {
  if (Notification.permission === 'granted') {
    new Notification(reminder.title, {
      body: reminder.message,
      icon: '/favicon.ico',
      tag: reminder.id
    })
  } else {
    // 备用控制台提醒
    console.log(`${reminder.title}: ${reminder.message}`)
  }
}

/**
 * 获取即将到来的提醒
 * @param {number} [days=7] - 天数范围
 * @returns {Promise<Array>} 提醒列表
 */
export const getUpcomingReminders = async (days = 7) => {
  try {
    const eventStore = useEventStore()
    
    // 确保事件已加载
    if (eventStore.events.length === 0) {
      await eventStore.loadEvents()
    }
    
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(now.getDate() + days)
    
    return eventStore.events
      .filter(event => {
        const eventDate = new Date(event.date)
        return eventDate > now && eventDate <= futureDate
      })
      .map(event => generateReminder(event))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  } catch (error) {
    console.error('Error getting upcoming reminders:', error)
    return []
  }
}