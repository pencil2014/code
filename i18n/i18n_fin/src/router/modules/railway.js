/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const chargeRouter = {
	path: '/railway',
	component: Layout,
	redirect: '/railway/order/',
	name: 'Railway',
	meta: {
		title: '铁路',
		icon: 'el-icon-railway'
	},
	children: [
		{
			path: 'order',
			component: () => import('@/views/railway/order/index'), // Parent router-view
			name: 'RailwayOrder',
			meta: { title: '订单' },
			alwaysShow: true,
			children: [
				{
					path: 'orderList',
					component: () => import('@/views/railway/order/orderList'),
					name: 'RailwayOrderList',
					meta: { title: '订单列表', keepAlive: true, isMenu: true }
				},
				{
					path: 'jointList',
					component: () => import('@/views/railway/order/orderList/jointList'),
					name: 'RailwayJointList',
					meta: { title: '协同列表', keepAlive: true, isMenu: true }
				},


				{
					path: 'hblPrint',
					component: () => import('@/views/railway/order/orderList/orderBook/components/hblPrint'),
					name: 'RailwayHblPrint',
					meta: { title: '订单详情-HBL打印' },
					hidden: true
				},

				{
					path: 'fclOrderDetail/:orderNo',
					component: () => import('@/views/railway/order/orderList/fcl/detail'),
					name: 'RailwayFclOrderDetail',
					meta: { title: '整柜订单详情', activeMenu: '/order/order/lclOrderList' },
					hidden: true
				}
			]
		}
	]
}

export default chargeRouter
