import Loadable from '@/components/loadable' //懒加载组件\
import React from 'react'
import { Redirect } from 'react-router-dom'


const home = Loadable(() => import('./pages/home')) //首页面板
const picture = Loadable(() => import('./pages/picture')) //基本表单
const delegation = Loadable(() => import('./pages/delegation')) //分布表单
const delegationEdit = Loadable(() => import('./pages/delegation/edit')) //分布表单
// const basicTable = Loadable(() => import('./pages/basic-table')) //基本表格
// const searchTable = Loadable(() => import('./pages/search-table')) //高级表格
// const echarts = Loadable(() => import('./pages/charts/echarts')) //echarts图表
// const viser = Loadable(() => import('./pages/charts/viser')) //echarts图表

export default [
  { path: '/home', name: 'dashboard', component: home },
  { path: '/picture', name: 'basicForm', component: picture },
  { path: '/delegation/list', name: '委托分配', component: delegation },
  { path: '/delegation/create', name: '委托分配', component: delegationEdit },
  { path: '/delegation/edit/:id', name: '委托分配', component: delegationEdit },
  // { path: '/table/basic-table', name: 'basicTable', component: basicTable },
  // { path: '/table/search-table', name: 'searchTable', component: searchTable },
  // { path: '/charts/echarts', name: 'echarts', component: echarts },
  // { path: '/charts/viser', name: 'viser', component: viser }
  { path: '/', name: 'dashboard', component: () => <Redirect to="/home" /> },
]
