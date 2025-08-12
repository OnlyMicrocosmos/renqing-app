// src/utils/validator.js

/**
 * 表单验证工具
 * 提供通用验证规则和错误处理
 */
export default {
  /**
   * 验证规则集合
   */
  rules: {
    required: (value) => !!value || '此项为必填项',
    email: (value) => {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return pattern.test(value) || '请输入有效的电子邮箱';
    },
    phone: (value) => {
      const pattern = /^1[3-9]\d{9}$/;
      return pattern.test(value) || '请输入有效的手机号码';
    },
    minLength: (min) => (value) => 
      value.length >= min || `至少需要${min}个字符`,
    maxLength: (max) => (value) => 
      value.length <= max || `不能超过${max}个字符`,
    minValue: (min) => (value) => 
      parseFloat(value) >= min || `值不能小于${min}`,
    maxValue: (max) => (value) => 
      parseFloat(value) <= max || `值不能大于${max}`,
    dateFormat: (value) => {
      const pattern = /^\d{4}-\d{2}-\d{2}$/;
      return pattern.test(value) || '日期格式应为 YYYY-MM-DD';
    },
    futureDate: (value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(value) >= today || '日期不能早于今天';
    },
    passwordMatch: (password, confirm) => 
      password === confirm || '两次输入的密码不一致'
  },

  /**
   * 验证表单字段
   * @param {Object} field - 字段配置
   * @param {string} field.value - 字段值
   * @param {Array} field.rules - 验证规则数组
   * @returns {string|boolean} 错误消息或true
   */
  validateField(field) {
    if (!field.rules) return true;
    
    for (const rule of field.rules) {
      const result = rule(field.value);
      if (result !== true) return result;
    }
    
    return true;
  },

  /**
   * 验证整个表单
   * @param {Object} form - 表单对象 { fieldName: { value, rules } }
   * @returns {Object} 验证结果 { valid: boolean, errors: { field: message } }
   */
  validateForm(form) {
    const errors = {};
    let isValid = true;
    
    for (const [fieldName, field] of Object.entries(form)) {
      const result = this.validateField(field);
      
      if (result !== true) {
        errors[fieldName] = result;
        isValid = false;
      }
    }
    
    return { valid: isValid, errors };
  },

  /**
   * 生成事件表单验证规则
   * @returns {Object} 事件表单验证配置
   */
  getEventValidation() {
    return {
      title: {
        value: '',
        rules: [
          this.rules.required,
          this.rules.minLength(2),
          this.rules.maxLength(50)
        ]
      },
      date: {
        value: '',
        rules: [
          this.rules.required,
          this.rules.dateFormat,
          this.rules.futureDate
        ]
      },
      amount: {
        value: '',
        rules: [
          this.rules.required,
          this.rules.minValue(1),
          this.rules.maxValue(1000000)
        ]
      },
      contactId: {
        value: '',
        rules: [this.rules.required]
      }
    };
  },

  /**
   * 生成联系人表单验证规则
   * @returns {Object} 联系人表单验证配置
   */
  getContactValidation() {
    return {
      name: {
        value: '',
        rules: [
          this.rules.required,
          this.rules.minLength(2),
          this.rules.maxLength(20)
        ]
      },
      phone: {
        value: '',
        rules: [this.rules.phone]
      },
      email: {
        value: '',
        rules: [this.rules.email]
      },
      relationship: {
        value: '',
        rules: [this.rules.required]
      }
    };
  },

  /**
   * 生成认证表单验证规则
   * @returns {Object} 认证表单验证配置
   */
  getAuthValidation() {
    return {
      email: {
        value: '',
        rules: [
          this.rules.required,
          this.rules.email
        ]
      },
      password: {
        value: '',
        rules: [
          this.rules.required,
          this.rules.minLength(6),
          this.rules.maxLength(20)
        ]
      },
      confirmPassword: {
        value: '',
        rules: [
          (value, form) => this.rules.passwordMatch(value, form.password.value)
        ]
      }
    };
  },

  /**
   * 提取第一个错误消息
   * @param {Object} errors - 错误对象
   * @returns {string} 第一个错误消息
   */
  getFirstError(errors) {
    return Object.values(errors)[0] || '';
  }
};