import Loadable from '@/components/loadable' //懒加载组件\
import React from 'react'
import { Redirect } from 'react-router-dom'
import picture from './pages/picture'

const home = Loadable(() => import('./pages/home')) //首页面板
const folder = Loadable(() => import('./pages/folder')) //基本表单
// const picture = Loadable(() => import('./pages/picture')) //基本表单
const delegation = Loadable(() => import('./pages/delegation')) //分布表单
const delegationEdit = Loadable(() => import('./pages/delegation/edit')) //分布表单

export default [
  { path: '/home', name: 'dashboard', component: home },
  { path: '/folder', name: 'basicForm', component: folder },
  { path: '/picture', name: 'basicForm', component: picture },
  { path: '/delegation/list', name: '委托分配', component: delegation },
  { path: '/delegation/create', name: '委托分配', component: delegationEdit },
  { path: '/delegation/edit/:id', name: '委托分配', component: delegationEdit },
  { path: '/', name: 'dashboard', component: () => <Redirect to="/home" /> },
]
