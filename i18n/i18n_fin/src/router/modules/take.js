/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'
const takeRouter = {
	path: '/take',
	name: 'Take',
	component: Layout,
	redirect: '/take/hblTakeList',
	meta: {
		title: '取单',
		icon: 'el-icon-take'
	},
	children: [
		{
			path: 'mblTakeList',
			component: () => import('@/views/railway/order/orderList/takeList/mbl'),
			name: 'RailwayMblTakeList',
			meta: { title: 'MBL取单列表', keepAlive: true, isMenu: true }
		},
		{
			path: 'hblTakeList',
			component: () => import('@/views/railway/order/orderList/takeList'),
			name: 'RailwayHblTakeList',
			meta: { title: 'HBL取单列表', keepAlive: true, isMenu: true }
		},
		{
			path: 'hblPageManage',
			component: () => import('@/views/railway/order/orderList/takeList/page'),
			name: 'RailwayHblPageManage',
			meta: { title: 'HBL提单纸管理', keepAlive: true, isMenu: true }
		},
		{
			path: 'tradeTakeList',
			component: () => import('@/views/railway/order/orderList/takeList/trade'),
			name: 'RailwayTradeTakeList',
			meta: { title: '贸易单证取单列表', keepAlive: true, isMenu: true }
		},
		{
			path: 'mblTakeDetail/:oid',
			component: () => import('@/views/railway/order/orderList/takeList/mblDetail'),
			name: 'MblRailwayTakeDetail',
			meta: {
				title: '取单详情',
				// activeMenu: '/order/order/hblTakeList',
				keepAlive: true,
				isUseCache: true
			},
			hidden: true
		},
		{
			path: 'takeDetail/:oid',
			component: () => import('@/views/railway/order/orderList/takeList/detail'),
			name: 'RailwayTakeDetail',
			meta: {
				title: '取单详情',
				// activeMenu: '/order/order/hblTakeList',
				keepAlive: true,
				isUseCache: true
			},
			hidden: true
		},
		{
			path: 'hblPageDetail',
			component: () => import('@/views/railway/order/orderList/takeList/pageManage/page/detail'),
			name: 'RailwayHblPageDetail',
			meta: {
				title: '提单纸详情',
				// activeMenu: '/order/order/hblTakeList',
				keepAlive: true,
				isUseCache: true
			},
			hidden: true
		},
		{
			path: 'tradeTakeDetail/:oid',
			component: () => import('@/views/railway/order/orderList/takeList/tradeDetail'),
			name: 'RailwayTradeTakeDetail',
			meta: {
				title: '取单详情',
				// activeMenu: '/order/order/hblTakeList',
				keepAlive: true,
				isUseCache: true
			},
			hidden: true
		},
	]
}

export default takeRouter
