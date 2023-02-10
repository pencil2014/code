/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const emplAbatement = {
  path: '/emplAbatement',
  component: Layout,
  redirect: '/emplAbatement/',
  name: 'EmplAbatement',
  meta: {
    title: '员工扣减',
    icon: 'el-icon-s-order'
  },
  children: [
    {
      path: 'emplAbatementList',
      component: () => import('@/views/finance/emplAbatement/index'),
      name: 'emplAbatementList',
      meta: { title: '员工扣减' },
   },
 ]
}


export default emplAbatement
