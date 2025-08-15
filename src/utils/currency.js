// src/utils/currency.js

/**
 * 货币格式化工具
 * 支持多种货币格式和自定义选项
 */
const currencyUtils = {
  /**
   * 格式化货币金额
   * @param {number|string} value - 金额数值
   * @param {Object} options - 格式化选项
   * @param {string} [options.currency='CNY'] - 货币代码 (CNY, USD, EUR等)
   * @param {string} [options.locale='zh-CN'] - 地区格式
   * @param {number} [options.precision=2] - 小数位数
   * @returns {string} 格式化后的货币字符串
   */
  format(value, options = {}) {
    const {
      currency = 'CNY',
      locale = 'zh-CN',
      precision = 2
    } = options;
    
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return '¥0.00';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    }).format(numericValue);
  },
  
  /**
   * 转换为数字（去除货币符号）
   * @param {string} currencyString - 格式化的货币字符串
   * @returns {number} 数值
   */
  parse(currencyString) {
    // 移除所有非数字字符（保留小数点和负号）
    const numericString = currencyString.replace(/[^\d.-]/g, '');
    return parseFloat(numericString) || 0;
  },
  
  /**
   * 人民币格式化（快捷方法）
   * @param {number} value - 金额
   * @returns {string} 格式化后的RMB字符串
   */
  rmb(value) {
    return this.format(value, { currency: 'CNY' });
  },
  
  /**
   * 美元格式化（快捷方法）
   * @param {number} value - 金额
   * @returns {string} 格式化后的USD字符串
   */
  usd(value) {
    return this.format(value, { currency: 'USD', locale: 'en-US' });
  },
  
  /**
   * 计算人情平衡值
   * @param {number} received - 收礼总额
   * @param {number} given - 送礼总额
   * @returns {string} 格式化后的平衡值（带符号）
   */
  balance(received, given) {
    const balanceValue = received - given;
    return this.format(balanceValue, {
      currency: 'CNY',
      signDisplay: balanceValue >= 0 ? 'exceptZero' : 'always'
    });
  }
};

// 导出单独的函数
export const formatCurrency = (value, options) => currencyUtils.format(value, options);

export default currencyUtils;