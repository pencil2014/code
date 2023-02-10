/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const chargeRouter = {
	path: '/wms',
	component: Layout,
	redirect: '/wms/basic/',
	name: 'Wms',
	meta: {
		title: '仓储管理',
		icon: 'el-icon-sea-shipping'
	},
	children: [
		{
			path: 'basic',
			component: () => import('@/views/wms/basic/index'), // Parent router-view
			name: 'Basic',
			meta: { title: '基本信息' },
			alwaysShow: true,
			children: [
				{
					path: 'yard',
					component: () => import('@/views/wms/basic/yard'),
					name: 'Yard',
					meta: { title: '码头堆场', keepAlive: true, isMenu: true }
				},
				{
					path: 'fee',
					component: () => import('@/views/wms/basic/fee'),
					name: 'Fee',
					meta: { title: '费用模板', keepAlive: true, isMenu: true }
				},
				{
					path: 'feeDetail',
					component: () => import('@/views/wms/basic/fee/detail'),
					name: 'FeeDetail',
					meta: { title: '模板详情', keepAlive: true, isMenu: true }
				}
			]
		},
		{
			path: 'warehouse',
			component: () => import('@/views/wms/warehouse'),
			name: 'Warehouse',
			meta: { title: '仓库管理' },
			alwaysShow: true,
			children: [
				{
					path: 'warehouseList',
					component: () => import('@/views/wms/warehouse/warehouseList'),
					name: 'WarehouseList',
					meta: { title: '仓库列表', keepAlive: true, isMenu: true }
				},
				{
					path: 'materialMaint',
					component: () => import('@/views/wms/warehouse/materialMaint'),
					name: 'MaterialMaint',
					meta: { title: '辅材维护', keepAlive: true, isMenu: true }
				},
				{
					path: 'materialstorage',
					component: () => import('@/views/wms/warehouse/materialstorage'),
					name: 'Materialstorage',
					meta: { title: '辅材储存', keepAlive: true, isMenu: true }
				},
        {
					path: 'warehouseStaff',
					component: () => import('@/views/wms/warehouse/warehouseStaff'),
					name: 'WarehouseStaff',
					meta: { title: '仓库员工', keepAlive: true, isMenu: true }
				}, {
					path: 'warehouseStaffDetail',
					component: () => import('@/views/wms/warehouse/warehouseStaff/detail'),
					name: 'WarehouseStaffDetail',
					meta: { title: '仓库员工详情', keepAlive: true, isMenu: true }
				}
			]
		},
		{
			path: 'bound',
			component: () => import('@/views/wms/bound'), // Parent router-view
			name: 'Bound',
			meta: { title: '出入库管理' },
			alwaysShow: true,
			children: [
				{
					path: 'inBound',
					component: () => import('@/views/wms/bound/inBound'),
					name: 'InBound',
					meta: { title: '入库管理', keepAlive: true, isMenu: true }
				},
        {
					path: 'inBoundAdd',
					component: () => import('@/views/wms/bound/inBound/detailDialog'),
					name: 'InBoundAdd',
					meta: { title: '新增入库信息', keepAlive: true, isMenu: true }
				},
        {
					path: 'inBoundDetail',
					component: () => import('@/views/wms/bound/inBound/detailDialog'),
					name: 'InBoundDetail',
					meta: { title: '入库详情', keepAlive: false, isMenu: true }
				},
				{
					path: 'outBound',
					component: () => import('@/views/wms/bound/outBound'),
					name: 'OutBound',
					meta: { title: '出库管理', keepAlive: true, isMenu: true }
				},
        {
					path: 'outBoundAdd',
					component: () => import('@/views/wms/bound/outBound/detailDialog'),
					name: 'OutBoundAdd',
					meta: { title: '新增出库信息', keepAlive: true, isMenu: true }
				},
        {
					path: 'outBoundDetail',
					component: () => import('@/views/wms/bound/outBound/detailDialog'),
					name: 'OutBoundDetail',
					meta: { title: '出库详情', keepAlive: false, isMenu: true }
				},
				{
					path: 'customerInventory',
					component: () => import('@/views/wms/bound/customerInventory'),
					name: 'CustomerInventory',
					meta: { title: '客户库存管理', keepAlive: true, isMenu: true }
				},
				{
					path: 'inventoryDetail',
					component: () => import('@/views/wms/bound/customerInventory/detail'),
					name: 'InventoryDetail',
					meta: { title: '出库单明细', keepAlive: true, isMenu: true }
				}
			]
		},
		{
			path: 'assign',
			component: () => import('@/views/wms/assign/index'), // Parent router-view
			name: 'Assign',
			meta: { title: '派工管理' },
			alwaysShow: true,
			children: [
				{
					path: 'class',
					component: () => import('@/views/wms/assign/class'),
					name: 'Class',
					meta: { title: '作业班组', keepAlive: true, isMenu: true }
				},
				{
					path: 'classDetail',
					component: () => import('@/views/wms/assign/class/detail'),
					name: 'ClassDetail',
					meta: { title: '班组详情', keepAlive: true, isMenu: true }
				},
				{
					path: 'send',
					component: () => import('@/views/wms/assign/send'),
					name: 'Send',
					meta: { title: '作业派工', keepAlive: true, isMenu: true }
				},
				{
					path: 'sendDetail',
					component: () => import('@/views/wms/assign/send/detail'),
					name: 'SendDetail',
					meta: { title: '派工详情', keepAlive: true, isMenu: true }
				}
			]
		},
		{
			path: 'integrated',
			component: () => import('@/views/wms/integrated/index'), // Parent router-view
			name: 'Integrated',
			meta: { title: '综合查询' },
			alwaysShow: true,
			children: [
				{
					path: 'car',
					component: () => import('@/views/wms/integrated/car'),
					name: 'Car',
					meta: { title: '车队统计', keepAlive: true, isMenu: true }
				},

				{
					path: 'house',
					component: () => import('@/views/wms/integrated/house'),
					name: 'House',
					meta: { title: '理货统计', keepAlive: true, isMenu: true }
				}
			]
		},
		{
			path: 'convoy',
			component: () => import('@/views/wms/convoy/index'), // Parent router-view
			name: 'Convoy',
			meta: { title: '车队管理' },
			alwaysShow: true,
			children: [
				{
					path: 'carList',
					component: () => import('@/views/wms/convoy/carList'),
					name: 'CarList',
					meta: { title: '车辆列表', keepAlive: true, isMenu: true }
				},
				{
					path: 'carDetail',
					component: () => import('@/views/wms/convoy/carList/detail'),
					name: 'CarDetail',
					meta: { title: '车辆详情', keepAlive: true, isMenu: true }
				}
			]
		}
	]
}

export default chargeRouter
