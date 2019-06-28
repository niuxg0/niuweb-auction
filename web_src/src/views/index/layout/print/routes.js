import Loadable from '@/components/loadable'

const delegation = Loadable(() => import('./pages/delegation'))

export default [
  { path: '/print/delegation/:staffs', component: delegation },
]
