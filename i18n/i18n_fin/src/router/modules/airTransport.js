/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const chargeRouter = {
	path: '/airTransport',
	component: Layout,
	redirect: '/airTransport/order/',
	name: 'AirTransport',
	meta: {
		title: '空运',
		icon: 'el-icon-air-transpor'
	},
	children: [
		{
			path: 'order',
			component: () => import('@/views/airTransport/order/index'),
			name: 'AirTransportOrder',
			meta: { title: '订单' },
			alwaysShow: true,
			children: [
				{
					path: 'orderList',
					component: () => import('@/views/airTransport/order/orderList'),
					name: 'AirTransportOrderList',
					meta: { title: '订单列表', keepAlive: true, isMenu: true }
				},
				{
					path: 'jointList',
					component: () => import('@/views/airTransport/order/jointList'),
					name: 'AirTransportJointList',
					meta: { title: '协同订单', keepAlive: true, isMenu: true }
				},
				{
					path: "orderReport",
					component: () => import("@/views/airTransport/order/orderReport/index"),
					name: "AirTransportOrderReport",
					meta: {
						title: "订单报表",
						isMenu: true
					}
				},
			]
		},
		{
      path: 'airFreight',
      component: () => import('@/views/airTransport/freight/index'),
      name: 'AirFreight',
      meta: { title: '运价' },
      alwaysShow: true,
      children: [
        {
          path: 'airFreightMaintenance',
          component: () => import('@/views/airTransport/freight/maintain/index.vue'),
          name: 'AirFreightMaintenance',
          meta: { title: '空运价维护', keepAlive: true, isMenu: true }
        },
				{
          path: 'airFreightMaintenanceDetail',
          component: () => import('@/views/airTransport/freight/maintain/components/detail'),
          name: 'AirFreightMaintenanceDetail',
          meta: { 
            title: '运价维护-详情',
            keepAlive: true,
            isUseCache: true,
            activeMenu: '/airTransport/airFreight/airFreightMaintenance',
          },
          hidden: true
        },
				{
          path: 'airFreightRateImport',
          component: () => import('@/views/airTransport/freight/routeImport'),
          name: 'AirFreightRateImport',
          meta: { title: '批量导入', isMenu: true }
        },
        {
          path: 'airFreightRateImportDetail',
          component: () => import('@/views/airTransport/freight/routeImport/routeImportDetail'),
          name: 'AirFreightRateImportDetail',
          meta: { title: '批量导入-详情', activeMenu: '/charge/maintain/freightRateImport' },
          hidden: true
        },
        {
          path: 'airSurchargeTemplate',
          component: () => import('@/views/airTransport/freight/inquiry/surchargeTemplate.vue'),
          name: 'AirSurchargeTemplate',
          meta: { title: '空运价-附加费', keepAlive: true, isMenu: true }
        },
      ]
    },
		{
      path: 'airFreightInquiryMain',
      component: () => import('@/views/airTransport/freight/index'),
      name: 'AirFreightInquiryMain',
      meta: { title: '运价查询' },
      alwaysShow: true,
      children: [
				{
          path: 'airFreightInquiry',
          component: () => import('@/views/airTransport/freight/inquiry/index.vue'),
          name: 'AirFreightInquiry',
          meta: { title: '空运价查询', keepAlive: true, isMenu: true }
        },
				{
          path: 'airFreightInquiryDetail',
          component: () => import('@/views/airTransport/freight/inquiry/components/detail'),
          name: 'AirFreightInquiryDetail',
          meta: { 
            title: '运价查询-详情',
            keepAlive: true,
            isUseCache: true,
            activeMenu: '/airTransport/airFreightInquiryMain/airFreightInquiry',
          },
          hidden: true
        },
      ]
    }
	]
}

export default chargeRouter
