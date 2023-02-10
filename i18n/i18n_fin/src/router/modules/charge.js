/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const chargeRouter = {
  path: '/charge',
  component: Layout,
  redirect: '/charge/maintain/',
  name: 'Charge',
  meta: {
    title: '运价',
    icon: 'el-icon-charge'
  },
  children: [
    {
      path: 'maintain',
      component: () => import('@/views/charge/maintain/index'), // Parent router-view
      name: 'Maintain',
      meta: { title: '运价维护' },
      alwaysShow: true,
      children: [
        {
          path: 'mainRoute',
          component: () => import('@/views/charge/maintain/mainRoute'),
          name: 'MainRoute',
          meta: { title: '海运出口整箱', keepAlive: true, isMenu: true }
        },
        {
          path: 'mainRouteDetail',
          component: () => import('@/views/charge/maintain/mainRoute/detail'),
          name: 'MainRouteDetail',
          meta: { 
            title: '海运出口整箱-详情',
            keepAlive: true,
            isUseCache: true,
            activeMenu: '/charge/maintain/mainRoute',
          },
          hidden: true
        },
        {
          path: 'feederRoute',
          component: () => import('@/views/charge/maintain/feederRoute'),
          name: 'FeederRoute',
          meta: { title: '海运整箱驳船费', keepAlive: true, isMenu: true },
        },
        {
          path: 'feederRouteDetail',
          component: () => import('@/views/charge/maintain/feederRoute/detail'),
          name: 'FeederRouteDetail',
          meta: { 
            title: '海运整箱驳船费-详情',
            keepAlive: true,
            isUseCache: true,
            activeMenu: '/charge/maintain/feederRoute',
          },
          hidden: true
        },
        {
          path: 'surcharge',
          component: () => import('@/views/charge/maintain/surcharge'),
          name: 'Surcharge',
          meta: { title: '附加费模板管理', isMenu: true }
        },
        {
          path: 'weightLimit',
          component: () => import('@/views/charge/maintain/weightLimit'),
          name: 'WeightLimit',
          meta: { title: '限重模板管理', isMenu: true }
        },
        {
          path: 'routeImport',
          component: () => import('@/views/charge/maintain/routeImport'),
          name: 'RouteImport',
          meta: { title: '批量导入', isMenu: true }
        },
        {
          path: 'routeImportDetail',
          component: () => import('@/views/charge/maintain/routeImport/routeImportDetail'),
          name: 'RouteImportDetail',
          meta: { title: '批量导入-详情', activeMenu: '/charge/maintain/routeImport' },
          hidden: true
        }
      ]
    },
    {
      path: 'chargeSearch',
      component: () => import('@/views/charge/chargeSearch/index'),
      name: 'ChargeSearch',
      meta: { title: '运价查询' },
      alwaysShow: true,
      children: [
        {
          path: 'seaFreight',
          component: () => import('@/views/charge/chargeSearch/seaFreight'),
          name: 'SeaFreight',
          meta: { title: '海运价查询', keepAlive: true, isMenu: true }
        },
        {
          path: 'seaFreightDetail',
          component: () => import('@/views/charge/chargeSearch/seaFreight/seaFreightDetail'),
          name: 'SeaFreightDetail',
          meta: { 
            title: '海运价-详情',
            keepAlive: true,
            isUseCache: true,
            activeMenu: '/charge/chargeSearch/seaFreight'
          },
          hidden: true
        },
        {
          path: 'seaFreightPrice',
          component: () => import('@/views/charge/chargeSearch/seaFreight/seaFreightPrice'),
          name: 'SeaFreightPrice',
          meta: { title: '报价单' },
          hidden: true
        },
        {
          path: 'bargeFee',
          component: () => import('@/views/charge/chargeSearch/bargeFee'),
          name: 'BargeFee',
          meta: { title: '驳船费查询', keepAlive: true, isMenu: true }
        },
        {
          path: 'bargeFeeDetail',
          component: () => import('@/views/charge/chargeSearch/bargeFee/detail'),
          name: 'BargeFeeDetail',
          meta: { 
            title: '驳船费查询-详情',
            keepAlive: true,
            isUseCache: true,
            activeMenu: '/charge/chargeSearch/bargeFee'
          },
          hidden: true
        },
        {
          path: 'overseasFreight',
          component: () => import('@/views/charge/chargeSearch/overseasFreight'),
          name: 'OverseasFreight',
          meta: { title: '海外询价', keepAlive: true, isMenu: true }
        },
        {
          path: 'overseasFreightTem',
          component: () => import('@/views/charge/chargeSearch/overseasFreight/index-tem.vue'),
          name: 'OverseasFreightTem',
          meta: { title: '报价模板管理', keepAlive: true, isMenu: true }
        },
        {
          path: 'overseasFreightDetaile',
          component: () => import('@/views/charge/chargeSearch/overseasFreight/components/detail.vue'),
          name: 'OverseasFreightDetaile',
          meta: { title: '海外询价-详情', keepAlive: false, isUseCache: false,activeMenu: '/charge/chargeSearch/overseasFreight' }
        },
      ]
    }
  ]
}

export default chargeRouter
