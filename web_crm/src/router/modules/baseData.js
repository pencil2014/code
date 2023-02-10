/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const baseDataRouter = {
	path: '/baseData',
	component: Layout,
	redirect: '/baseData/',
	name: 'BaseData',
	meta: {
		title: '基础数据',
		icon: 'el-icon-data-base'
	},
	children: [
		// {
		// 	path: 'railData',
		// 	component: () => import('@/views/baseData/railData/'),
		// 	name: 'RailData',
		// 	meta: { title: '铁路基础信息' },
		// 	alwaysShow: true,
		// 	children: [
		// 		{
		// 			path: 'port',
		// 			component: () => import('@/views/baseData/railData/port'),
		// 			name: 'RailPort',
		// 			meta: { title: '铁路站点', isMenu: true, keepAlive: true, isUseCache: true }
		// 		}
		// 	]
		// },
    // {
	// 		path: 'airData',
	// 		component: () => import('@/views/baseData/airData/'),
	// 		name: 'AirData',
	// 		meta: { title: '空运基础信息' },
	// 		alwaysShow: true,
	// 		children: [
	// 			{
	// 				path: 'port',
	// 				component: () => import('@/views/baseData/airData/port'),
	// 				name: 'AirPort',
	// 				meta: { title: '空运港口', isMenu: true, keepAlive: true, isUseCache: true }
	// 			}
	// 		]
	// 	}
	]
}

export default baseDataRouter
