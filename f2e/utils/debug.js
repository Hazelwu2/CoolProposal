const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * console log 工具
 * 僅在 development 模式下顯示 console
 * @date 2022-06-12
 * @param {any} ...params 任何傳的東西會拆解到 console
 * @returns {any} 拆解後的內容
 */
export default {
  $log: (...params) => isDevelopment && console.log(`[🤔]`, ...params),
  $warn: (...params) => isDevelopment && console.warn('[🤔]', ...params),
  $error: (...params) => isDevelopment && console.error('[🤔]', ...params)
}
