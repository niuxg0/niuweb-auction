import Cookies from 'js-cookie'

export default {
  /**
   * 登录成功
   * @param {登录成功后的返回信息} res
   * @param {登录成功后的回调} callback
   */
  login(res, callback) {
    localStorage.setItem('clientToken', res.clientToken)
    localStorage.setItem('userInfo', JSON.stringify(res.userInfo))
    if (callback) callback()
  },

  /**
   * 是否已登录
   */
  loggedIn() {
    return !!localStorage.getItem('clientToken')
  },

  /**
   * 获取登录后的sessionID
   */
  getToken() {
    return localStorage.getItem('clientToken') || '{}'
  },

  /**
   * 获取登录后的用户信息
   */
  getUserInfo() {
    return localStorage.getItem('userInfo') || '{}'
  },

  /**
   * 退出登录
   * @param {退出登录后的回调} cb
   */
  logout(cb) {
    localStorage.removeItem('clientToken')
    localStorage.removeItem('userInfo')
    if (cb) cb()
  }
}
