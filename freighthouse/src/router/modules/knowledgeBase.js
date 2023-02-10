/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const knowledgeBaseRouter = {
  path: '/knowledgeBase',
  component: Layout,
  name: 'KnowledgeBase',
  meta: {
    title: '知识库',
    icon: 'el-icon-charge'
  },
  children: [
    {
      path: 'productNameLibrary',
      component: () => import('@/views/knowledgeBase/index'),
      name: 'ProductNameLibrary',
      meta: { title: '品名库' },
      alwaysShow: true,
      children: [
        {
          path: 'classList',
          component: () => import('@/views/knowledgeBase/productNameLibrary/classList/index.vue'),
          name: 'ClassList',
          meta: { title: '分类列表', keepAlive: true, isMenu: true }
        },
        {
          path: 'cargoNameList',
          component: () => import("@/views/order/cargoName/list/index"),
          name: 'CargoNameList',
          meta: { title: '品名列表', keepAlive: true, isMenu: true }
        }
      ]
    }
  ]
}

export default knowledgeBaseRouter
