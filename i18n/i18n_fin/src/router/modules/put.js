/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'
const putRouter = {
	path: '/put',
	name: 'Put',
	component: Layout,
	redirect: '/put/putList',
	meta: {
		title: '放单',
		icon: 'el-icon-put'
	},
	children: [
		{
			path: 'putList',
			component: () => import('@/views/railway/order/orderList/putList'),
			name: 'RailwayPutList',
			meta: { title: '放单列表', keepAlive: true, isMenu: true }
		},
		{
			path: 'putDetail/:oid',
			component: () => import('@/views/railway/order/orderList/putList/detail'),
			name: 'RailwayPutDetail',
			meta: {
				title: '放单详情',
				// activeMenu: '/order/order/hblTakeList',
				keepAlive: true,
				isUseCache: true
			},
			hidden: true
		}
	]
}

export default putRouter
