import axios from 'axios'
axios.defaults.timeout = 5000
axios.defaults.baseURL = 'http://auction.niuweb.com.cn/'
axios.defaults.withCredentials = true

//请求拦截
axios.interceptors.request.use((config) => {
  return config
}, (err) => {
  return Promise.reject(err)
})

//响应拦截//
axios.interceptors.response.use((res) => {
  return res
}, (err) => {
  return Promise.reject(err)
})

export const APILogin = (mail: string, password: string) => axios.post<{
  code: number,
  data: {
    userInfo: {
      id: string,
      avatar: string,
      name: string,
      nickName: string
    },
    clientToken: string
  }
}>('/user/login', { mail, password })