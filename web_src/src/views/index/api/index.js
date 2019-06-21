/**
 * 集中管理请求接口
 */
import fetch from './request'

// 注册验证码
export const registerVerify = params => fetch('/user/verify', params, 'POST')
// 注册
export const register = params => fetch('/user/register', params, 'POST')
// 登录
export const login = params => fetch('/user/login', params, 'POST')
// 基本表格
export const basictable = params => fetch('/api/basic-table', params, 'GET')
// 高级表格
export const searchtable = params => fetch('/api/search-table', params, 'GET')
