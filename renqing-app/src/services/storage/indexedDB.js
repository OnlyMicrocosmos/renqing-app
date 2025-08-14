const DB_NAME = 'HumanAccountDB'
const DB_VERSION = 3

// 数据库实例
let dbInstance = null

/**
 * 初始化数据库
 * @returns {Promise<IDBDatabase>} 数据库实例
 */
export const initDB = () => {
  return new Promise((resolve, reject) => {
    // 如果已经初始化，直接返回
    if (dbInstance) {
      resolve(dbInstance)
      return
    }
    
    // 打开数据库
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    // 数据库打开成功
    request.onsuccess = (event) => {
      dbInstance = event.target.result
      console.log(`数据库 ${DB_NAME} v${DB_VERSION} 打开成功`)
      resolve(dbInstance)
    }
    
    // 数据库打开失败
    request.onerror = (event) => {
      console.error('数据库打开失败:', event.target.error)
      reject(`数据库打开失败: ${event.target.error}`)
    }
    
    // 数据库版本升级
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      const oldVersion = event.oldVersion
      const newVersion = event.newVersion
      
      console.log(`数据库升级: v${oldVersion} → v${newVersion}`)
      
      // 从0开始初始化数据库结构
      if (oldVersion < 1) {
        // 用户数据存储
        if (!db.objectStoreNames.contains('user')) {
          const userStore = db.createObjectStore('user', { keyPath: 'id' })
          userStore.createIndex('email', 'email', { unique: true })
          console.log('创建 user 存储')
        }
        
        // 事件数据存储
        if (!db.objectStoreNames.contains('events')) {
          const eventsStore = db.createObjectStore('events', { keyPath: 'id' })
          eventsStore.createIndex('date', 'date', { unique: false })
          eventsStore.createIndex('contactId', 'contactId', { unique: false })
          eventsStore.createIndex('type', 'type', { unique: false })
          console.log('创建 events 存储')
        }
        
        // 联系人数据存储
        if (!db.objectStoreNames.contains('contacts')) {
          const contactsStore = db.createObjectStore('contacts', { keyPath: 'id' })
          contactsStore.createIndex('name', 'name', { unique: false })
          contactsStore.createIndex('phone', 'phone', { unique: true })
          contactsStore.createIndex('email', 'email', { unique: true })
          console.log('创建 contacts 存储')
        }
      }
      
      // 版本2升级：添加设置存储
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('settings')) {
          const settingsStore = db.createObjectStore('settings', { keyPath: 'key' })
          console.log('创建 settings 存储')
          
          // 初始化默认设置
          const transaction = event.target.transaction
          settingsStore.add({ key: 'currency', value: 'CNY' })
          settingsStore.add({ key: 'theme', value: 'light' })
          settingsStore.add({ key: 'reminderDays', value: 3 })
        }
      }
      
      // 版本3升级：添加同步队列
      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncQueueStore = db.createObjectStore('syncQueue', { 
            keyPath: 'id',
            autoIncrement: true 
          })
          
          syncQueueStore.createIndex('type', 'type', { unique: false })
          syncQueueStore.createIndex('status', 'status', { unique: false })
          syncQueueStore.createIndex('createdAt', 'createdAt', { unique: false })
          
          console.log('创建 syncQueue 存储')
        }
      }
    }
    
    // 数据库阻塞事件
    request.onblocked = (event) => {
      console.warn('数据库被其他页面阻塞，请关闭其他打开此网站的页面')
    }
  })
}

/**
 * 获取数据库实例
 * @returns {Promise<IDBDatabase>}
 */
export const getDB = async () => {
  if (!dbInstance) {
    await initDB()
  }
  return dbInstance
}

/**
 * 保存数据到指定存储
 * @param {string} storeName 存储名称
 * @param {Object|Array} data 要保存的数据
 * @param {string} [mode='readwrite'] 事务模式
 * @returns {Promise<void>}
 */
export const saveToDB = async (storeName, data, mode = 'readwrite') => {
  try {
    const db = await getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], mode)
      const store = transaction.objectStore(storeName)
      
      // 清除现有数据
      const clearRequest = store.clear()
      
      clearRequest.onsuccess = () => {
        // 处理数组数据
        if (Array.isArray(data)) {
          const requests = data.map(item => {
            return new Promise((itemResolve, itemReject) => {
              const addRequest = store.add(item)
              addRequest.onsuccess = () => itemResolve()
              addRequest.onerror = (event) => itemReject(event.target.error)
            })
          })
          
          // 等待所有添加操作完成
          Promise.all(requests)
            .then(() => resolve())
            .catch(error => reject(error))
        } 
        // 处理对象数据
        else if (typeof data === 'object' && data !== null) {
          const addRequest = store.add(data)
          addRequest.onsuccess = () => resolve()
          addRequest.onerror = (event) => reject(event.target.error)
        } 
        // 处理其他类型
        else {
          resolve() // 非对象和数组，直接resolve
        }
      }
      
      clearRequest.onerror = (event) => {
        reject(`清除存储失败: ${event.target.error}`)
      }
    })
  } catch (error) {
    console.error('保存数据失败:', error)
    throw new Error(`保存数据到 ${storeName} 失败: ${error.message}`)
  }
}

/**
 * 从指定存储获取所有数据
 * @param {string} storeName 存储名称
 * @returns {Promise<Array>}
 */
export const getFromDB = async (storeName) => {
  try {
    const db = await getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()
      
      request.onsuccess = (event) => {
        resolve(event.target.result || [])
      }
      
      request.onerror = (event) => {
        reject(`获取数据失败: ${event.target.error}`)
      }
    })
  } catch (error) {
    console.error('获取数据失败:', error)
    throw new Error(`从 ${storeName} 获取数据失败: ${error.message}`)
  }
}

/**
 * 获取单条数据
 * @param {string} storeName 存储名称
 * @param {*} key 主键值
 * @returns {Promise<Object|null>}
 */
export const getItem = async (storeName, key) => {
  try {
    const db = await getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)
      
      request.onsuccess = (event) => {
        resolve(event.target.result || null)
      }
      
      request.onerror = (event) => {
        reject(`获取数据失败: ${event.target.error}`)
      }
    })
  } catch (error) {
    console.error('获取单项数据失败:', error)
    throw new Error(`从 ${storeName} 获取单项数据失败: ${error.message}`)
  }
}

/**
 * 添加或更新数据
 * @param {string} storeName 存储名称
 * @param {Object} item 要添加或更新的数据
 * @returns {Promise<void>}
 */
export const putItem = async (storeName, item) => {
  try {
    const db = await getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(item)
      
      request.onsuccess = () => {
        resolve()
      }
      
      request.onerror = (event) => {
        reject(`保存数据失败: ${event.target.error}`)
      }
    })
  } catch (error) {
    console.error('保存数据失败:', error)
    throw new Error(`保存数据到 ${storeName} 失败: ${error.message}`)
  }
}

/**
 * 删除数据
 * @param {string} storeName 存储名称
 * @param {*} key 主键值
 * @returns {Promise<void>}
 */
export const deleteItem = async (storeName, key) => {
  try {
    const db = await getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)
      
      request.onsuccess = () => {
        resolve()
      }
      
      request.onerror = (event) => {
        reject(`删除数据失败: ${event.target.error}`)
      }
    })
  } catch (error) {
    console.error('删除数据失败:', error)
    throw new Error(`从 ${storeName} 删除数据失败: ${error.message}`)
  }
}

/**
 * 查询数据
 * @param {string} storeName 存储名称
 * @param {string} indexName 索引名称
 * @param {*} value 查询值
 * @returns {Promise<Array>}
 */
export const queryByIndex = async (storeName, indexName, value) => {
  try {
    const db = await getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(value)
      
      request.onsuccess = (event) => {
        resolve(event.target.result || [])
      }
      
      request.onerror = (event) => {
        reject(`查询数据失败: ${event.target.error}`)
      }
    })
  } catch (error) {
    console.error('查询数据失败:', error)
    throw new Error(`在 ${storeName} 中查询数据失败: ${error.message}`)
  }
}

/**
 * 获取设置项
 * @param {string} key 设置键名
 * @returns {Promise<*>} 设置值
 */
export const getSetting = async (key) => {
  try {
    const setting = await getItem('settings', key)
    return setting ? setting.value : null
  } catch (error) {
    console.error('获取设置失败:', error)
    return null
  }
}

/**
 * 保存设置项
 * @param {string} key 设置键名
 * @param {*} value 设置值
 * @returns {Promise<void>}
 */
export const saveSetting = async (key, value) => {
  try {
    await putItem('settings', { key, value })
  } catch (error) {
    console.error('保存设置失败:', error)
    throw new Error('保存设置失败')
  }
}

/**
 * 添加操作到同步队列
 * @param {string} type 操作类型 ('event' | 'contact' | 'user')
 * @param {string} action 操作类型 ('create' | 'update' | 'delete')
 * @param {Object} data 相关数据
 * @returns {Promise<void>}
 */
export const addToSyncQueue = async (type, action, data) => {
  try {
    const db = await getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      
      const queueItem = {
        type,
        action,
        data,
        status: 'pending',
        attempts: 0,
        createdAt: new Date().toISOString(),
        lastAttempt: null
      }
      
      const request = store.add(queueItem)
      
      request.onsuccess = () => {
        console.log(`已添加到同步队列: ${type} ${action}`)
        resolve()
      }
      
      request.onerror = (event) => {
        reject(`添加到同步队列失败: ${event.target.error}`)
      }
    })
  } catch (error) {
    console.error('添加到同步队列失败:', error)
    throw new Error('添加到同步队列失败')
  }
}

/**
 * 获取待同步的队列项
 * @param {number} [limit=10] 获取数量
 * @returns {Promise<Array>}
 */
export const getPendingSyncItems = async (limit = 10) => {
  try {
    const db = await getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['syncQueue'], 'readonly')
      const store = transaction.objectStore('syncQueue')
      const index = store.index('status')
      
      // 获取所有待处理项
      const request = index.getAll('pending')
      
      request.onsuccess = (event) => {
        let items = event.target.result || []
        
        // 按创建时间排序
        items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        
        // 限制返回数量
        if (limit && items.length > limit) {
          items = items.slice(0, limit)
        }
        
        resolve(items)
      }
      
      request.onerror = (event) => {
        reject(`获取同步队列失败: ${event.target.error}`)
      }
    })
  } catch (error) {
    console.error('获取同步队列失败:', error)
    return []
  }
}

/**
 * 更新队列项状态
 * @param {number} id 队列项ID
 * @param {string} status 新状态 ('pending', 'processing', 'completed', 'failed')
 * @param {string} [error=null] 错误信息
 * @returns {Promise<void>}
 */
export const updateSyncItemStatus = async (id, status, error = null) => {
  try {
    const db = await getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      
      // 获取当前项
      const getRequest = store.get(id)
      
      getRequest.onsuccess = (event) => {
        const item = event.target.result
        if (!item) {
          reject('队列项不存在')
          return
        }
        
        // 更新项
        item.status = status
        item.lastAttempt = new Date().toISOString()
        
        if (status === 'processing') {
          item.attempts = (item.attempts || 0) + 1
        }
        
        if (error) {
          item.error = error
        }
        
        // 保存更新
        const putRequest = store.put(item)
        
        putRequest.onsuccess = () => {
          resolve()
        }
        
        putRequest.onerror = (putEvent) => {
          reject(`更新队列项失败: ${putEvent.target.error}`)
        }
      }
      
      getRequest.onerror = (event) => {
        reject(`获取队列项失败: ${event.target.error}`)
      }
    })
  } catch (error) {
    console.error('更新队列项状态失败:', error)
    throw new Error('更新队列项状态失败')
  }
}

/**
 * 删除已完成的队列项
 * @param {number} [days=7] 保留天数
 * @returns {Promise<void>}
 */
export const cleanupSyncQueue = async (days = 7) => {
  try {
    const db = await getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      const index = store.index('status')
      
      // 获取所有已完成或失败的项
      const request = index.getAll(IDBKeyRange.bound('completed', 'failed'))
      
      request.onsuccess = (event) => {
        const items = event.target.result || []
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)
        
        const deletePromises = items
          .filter(item => new Date(item.lastAttempt) < cutoffDate)
          .map(item => {
            return new Promise((itemResolve, itemReject) => {
              const deleteRequest = store.delete(item.id)
              deleteRequest.onsuccess = () => itemResolve()
              deleteRequest.onerror = (delEvent) => itemReject(delEvent.target.error)
            })
          })
        
        Promise.all(deletePromises)
          .then(() => {
            console.log(`清理了 ${deletePromises.length} 条旧的同步队列项`)
            resolve()
          })
          .catch(error => reject(`清理队列失败: ${error}`))
      }
      
      request.onerror = (event) => {
        reject(`获取队列项失败: ${event.target.error}`)
      }
    })
  } catch (error) {
    console.error('清理同步队列失败:', error)
    // 失败时不中断主流程
  }
}

// 添加事件相关的导出函数
export const getEvents = async () => {
  return await getFromDB('events');
};

export const saveEvent = async (event) => {
  return await putItem('events', event);
};

export const deleteEvent = async (eventId) => {
  return await deleteItem('events', eventId);
};

// 添加联系人相关的导出函数
export const getContacts = async () => {
  return await getFromDB('contacts');
};

export const saveContact = async (contact) => {
  return await putItem('contacts', contact);
};

export const deleteContact = async (contactId) => {
  return await deleteItem('contacts', contactId);
};

/**
 * 导出数据库工具函数
 */
export default {
  initDB,
  getDB,
  saveToDB,
  getFromDB,
  getItem,
  putItem,
  deleteItem,
  queryByIndex,
  getSetting,
  saveSetting,
  addToSyncQueue,
  getPendingSyncItems,
  updateSyncItemStatus,
  cleanupSyncQueue,
  // 事件相关函数
  getEvents,
  saveEvent,
  deleteEvent,
  // 联系人相关函数
  getContacts,
  saveContact,
  deleteContact
}