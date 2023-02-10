/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const chargeRouter = {
	path: '/order',
	component: Layout,
	redirect: '/order/order/',
	name: 'SeaShipping',
	meta: {
		title: '海运',
		icon: 'el-icon-sea-shipping'
	},
	children: [
		{
			path: 'order',
			component: () => import('@/views/order/order/index'), // Parent router-view
			name: 'Order',
			meta: { title: '订单' },
			alwaysShow: true,
			children: [
				{
					path: 'oldCargoGmSeaFreight',
					component: () => import('@/views/charge/chargeSearch/seaFreight/cargoGm'),
					name: 'OldSeaFreight',
					meta: { title: '海运价查询', keepAlive: true, isMenu: true }
				},
				{
					path: 'cargoGmSeaFreight',
					component: () => import('@/views/charge/chargeSearch/seaFreight/dagIndex'),
					name: 'CargoGmSeaFreight',
					meta: { title: '大掌柜运价查询', keepAlive: true, isMenu: true, dialFullWidth: true }
				},
				{
					path: 'orderList',
					component: () => import('@/views/order/order/orderList'),
					name: 'OrderList',
					meta: { title: '订单列表', keepAlive: true, isMenu: true }
				},
				{
					path: 'jointList',
					component: () => import('@/views/order/order/jointList'),
					name: 'JointList',
					meta: { title: '协同订单', keepAlive: true, isMenu: true }
				},
				// {
				// 	path: 'jointOrderDetail/:orderNo',
				// 	component: () => import('@/views/order/order/orderList/detail'),
				// 	name: 'JointOrderDetail',
				// 	meta: {
				// 		title: '订单详情',
				// 		activeMenu: '/order/order/jointList',
				// 		keepAlive: true,
				// 		isUseCache: true
				// 	},
				// 	hidden: true
				// },
				{
					path: 'siList',
					component: () => import('@/views/order/order/orderList/si'),
					name: 'SiList',
					meta: { title: '补料列表', keepAlive: true, isMenu: true }
				},
				{
					path: 'importBill',
					component: () => import('@/views/order/order/orderList/importBill/index'),
					name: 'ImportBill',
					meta: { title: '账单列表', keepAlive: true, isMenu: true }
				},
				{
					path: 'siDetail/:blId',
					component: () => import('@/views/order/order/orderList/si/detail'),
					name: 'SiDetail',
					meta: {
						title: '补料详情',
						activeMenu: '/order/order/siList',
						keepAlive: true,
						isUseCache: true
					},
					hidden: true
				},
				// {
				//   path: "blFinList",
				//   component: () => import("@/views/order/order/orderList/blFinList"),
				//   name: "BlFinList",
				//   meta: {
				//     title: "放单审核列表",
				//     keepAlive: true,
				//     isMenu: true,
				//     icon: "el-icon-audit"
				//   }
				// },
				{
					path: 'factoryDisagree',
					component: () => import('@/views/order/order/orderList/factoryDisagree/index'),
					name: 'FactoryDisagree',
					meta: {
						title: '工厂不同意',
						keepAlive: true,
						isMenu: true,
						icon: 'el-icon-put-apply'
					}
				},
				{
					path: 'factoryDisagreeApplyDetail',
					component: () => import('@/views/order/order/orderList/factoryDisagree/applyDetail'),
					name: 'FactoryDisagreeApplyDetail',
					meta: {
						title: '发起申请',
						activeMenu: '/order/order/factoryDisagree',
						keepAlive: true
					},
					hidden: true
				},
				// {
				//   path: "cargoNameList",
				//   component: () => import("@/views/order/cargoName/list/index"),
				//   name: "CargoNameList",
				//   meta: {
				//     title: "品名列表",
				//     keepAlive: true,
				//     isMenu: true,
				//     icon: "el-icon-put-apply"
				//   }
				// },
				{
					path: 'blFinApplyList',
					// component: () => import("@/views/order/order/orderList/blFinApplyList"),
					component: () => import('@/views/order/putApply/list/index'),
					name: 'BlFinApplyList',
					meta: {
						title: '放单申请列表',
						keepAlive: true,
						isMenu: true,
						icon: 'el-icon-put-apply'
					}
				},
				{
					path: 'blFinApplyDetail',
					component: () => import('@/views/order/order/orderList/blFinApplyList/applyDetail'),
					name: 'BlFinApplyDetail',
					meta: {
						title: '放单申请',
						activeMenu: '/order/order/blFinApplyList',
						keepAlive: true
					},
					hidden: true
				},
				{
					path: 'siDnList',
					component: () => import('@/views/order/order/orderList/siDnList'),
					name: 'SiDnList',
					meta: { title: '费用审核列表', keepAlive: true, isMenu: true }
				},
				{
					path: 'siDnDetail',
					component: () => import('@/views/order/order/orderList/siDnList/detail'),
					name: 'SiDnDetail',
					meta: {
						title: '费用审核详情',
						activeMenu: '/order/order/siDnList',
						keepAlive: true,
						isUseCache: true
					},
					hidden: true
				},
				{
					path: 'lclAuditList',
					component: () => import('@/views/order/order/orderList/lcl/audit/index'),
					name: 'LclAuditList',
					meta: { title: '订仓审核列表', keepAlive: true, isMenu: true }
				},
				{
					path: 'lclAuditDetail',
					component: () => import('@/views/order/order/orderList/lcl/audit/detail'),
					name: 'LclAuditDetail',
					meta: {
						title: '订仓列表-审核',
						activeMenu: '/order/order/lclAuditList',
						keepAlive: true,
						isUseCache: true
					},
					hidden: true
				},
				{
					path: 'lclOrderList',
					component: () => import('@/views/order/order/orderList/lcl/orderList/index'),
					name: 'LclOrderList',
					meta: { title: '散货订仓列表', keepAlive: true, isMenu: true }
				},
				{
					path: 'orderReport',
					component: () => import('@/views/order/order/orderList/orderReport/index'),
					name: 'OrderReport',
					meta: {
						title: '订单报表',
						// keepAlive: true,
						isMenu: true
					}
				},
				{
					path: 'shipBlList',
					component: () => import('@/views/order/order/blList/index'),
					name: 'ShipBlList',
					meta: {
						title: '提单列表',
						keepAlive: true,
						isMenu: true
					}
				},
				{
					path: 'shipBlInfoList',
					component: () => import('@/views/order/order/blList/blInfoList'),
					name: 'ShipBlInfoList',
					meta: {
						title: '提单信息列表',
						keepAlive: true,
						isMenu: true
					}
				},
				{
					path: 'onlineBkgList',
					component: () => import('@/views/order/createBooking/list/bkg/index'),
					name: 'OnlineBkgList',
					meta: {
						title: '在线订舱列表',
						keepAlive: true,
						isMenu: true
					}
				},
				{
					path: 'onlineSiList',
					component: () => import('@/views/order/createBooking/list/si/index'),
					name: 'OnlineSiList',
					meta: {
						title: '在线补料列表',
						keepAlive: true,
						isMenu: true
					}
				},
				{
					path: 'onlineVgmList',
					component: () => import('@/views/order/vgm/list/index'),
					name: 'OnlineVgmList',
					meta: {
						title: '在线VGM列表',
						keepAlive: true,
						isMenu: true
					}
				},
				{
					path: 'rpaSiList',
					component: () => import('@/views/order/createBooking/list/robot/index'),
					name: 'RpaSiList',
					meta: {
						title: 'RPA补料列表',
						keepAlive: true,
						isMenu: true
					}
				}
			]
		},
		{
			path: 'book',
			component: () => import('@/views/order/order/bookShip'), // Parent router-view
			name: 'Book',
			meta: { title: '订舱' },
			alwaysShow: true,
			children: [
				{
					path: 'bookShip',
					component: () => import('@/views/order/order/bookShip/book'),
					name: 'BookShip',
					meta: { title: '订舱查询', keepAlive: true, isMenu: true }
				},
				{
					path: 'booking',
					component: () => import('@/views/order/createBooking/booking/index'), // Parent router-view
					name: 'Booking',
					meta: {
						title: '订舱申请',
						activeMenu: '/order/book/bookShip'
					},
					hidden: true
				},
				{
					path: 'packing',
					component: () => import('@/views/order/createBooking/packing/index'), // Parent router-view
					name: 'Packing',
					meta: {
						title: '补料申请',
						activeMenu: '/order/order/siList'
					},
					hidden: true
				},
				{
					path: 'robotPacking',
					component: () => import('@/views/order/createBooking/robot/index'), // Parent router-view
					name: 'RobotPacking',
					meta: {
						title: '机器人补料',
						activeMenu: '/order/order/siList'
					},
					hidden: true
				},
				{
					path: 'onlineVgm',
					component: () => import('@/views/order/vgm/vgm/index'), // Parent router-view
					name: 'OnlineVgm',
					meta: {
						title: 'VGM申请',
						activeMenu: '/order/order/orderList'
					},
					hidden: true
				},
				{
					path: 'soList',
					component: () => import('@/views/order/order/soList'),
					name: 'SoLost',
					meta: { title: 'SO列表', keepAlive: true, isMenu: true }
				}
			]
		},
		{
			path: 'postList',
			component: () => import('@/views/order/order/postList'),
			name: 'PostList',
			meta: { title: '寄单管理', keepAlive: true, isMenu: true }
		},
		{
			path: 'postDetail',
			component: () => import('@/views/order/order/postList/components/detail'),
			name: 'PostDetail',
			meta: {
				title: '寄单详情',
				activeMenu: '/order/postList',
				keepAlive: true
			},
			hidden: true
		},
		{
			path: 'postPrint',
			component: () => import('@/views/order/order/postList/components/components/print'),
			name: 'postPrint',
			meta: {
				title: '签收单打印预览',
				activeMenu: '/order/postList',
				keepAlive: true
			},
			hidden: true
		},
		{
			path: 'postListCheckData',
			component: () => import('@/views/finance/supplierBill/supplierBillList/components/supplierBillDetail'),
			name: 'PostListCheckData',
			meta: {
				title: '寄单-账单数据',
				activeMenu: '/order/postList',
				keepAlive: true
			},
			hidden: true
		},
		{
			path: 'postListChecking',
			component: () => import('@/views/finance/supplierBill/supplierBillList/components/accountChecking'),
			name: 'PostListChecking',
			meta: {
				title: '寄单-对账',
				activeMenu: '/order/postList',
				keepAlive: true
			},
			hidden: true
		},
		{
			path: 'postListCheckResult',
			component: () => import('@/views/finance/supplierBill/supplierBillList/components/diffResult'),
			name: 'PostListCheckResult',
			meta: {
				title: '寄单-对账结果',
				activeMenu: '/order/postList',
				keepAlive: true
			},
			hidden: true
		},
		{
			path: 'workException',
			component: () => import('@/views/order/order/workException'),
			name: 'WorkException',
			meta: { title: '异常管理', isMenu: true, icon: 'el-icon-work-exception', keepAlive: true }
		},
		{
			path: 'workExceptionDetail',
			component: () => import('@/views/order/order/workException/detail'),
			name: 'WorkExceptionDetail',
			meta: {
				title: '异常管理详情',
				activeMenu: '/order/workException',
				keepAlive: true,
				isUseCache: true
			},
			hidden: true
		},
		{
			path: 'warehouse',
			component: () => import('@/views/order/warehouse/index'), // Parent router-view
			name: 'WarehouseIndex',
			meta: { title: '仓库', icon: 'el-icon-warehouse-index' },
			alwaysShow: true,
			children: [
				{
					path: 'warehouseInfo',
					component: () => import('@/views/order/warehouse/warehouseInfo'),
					name: 'WarehouseInfo',
					meta: { title: '仓库信息', isMenu: true }
				},
				{
					path: 'add',
					component: () => import('@/views/order/warehouse/warehouseInfo/add'),
					name: 'Add',
					meta: { title: '新增仓库' },
					hidden: true
				},
				{
					path: 'edit',
					component: () => import('@/views/order/warehouse/warehouseInfo/add'),
					name: 'Edit',
					meta: { title: '编辑仓库' },
					hidden: true
				},
				{
					path: 'warehouseIn',
					component: () => import('@/views/order/warehouse/warehouseIn'),
					name: 'WarehouseIn',
					meta: { title: '进仓信息', isMenu: true }
				},
				{
					path: 'warehouseOut',
					component: () => import('@/views/order/warehouse/warehouseOut'),
					name: 'WarehouseOut',
					meta: { title: '出仓信息', isMenu: true }
				},
				{
					path: 'warehouseCargo',
					component: () => import('@/views/order/warehouse/warehouseCargo'),
					name: 'WarehouseCargo',
					meta: { title: '库存信息', isMenu: true, keepAlive: true }
				},
				{
					path: 'warehouseCargoDetail',
					component: () => import('@/views/order/warehouse/warehouseCargo/detail'),
					name: 'WarehouseCargoDetail',
					meta: { title: '库存详情' },
					hidden: true
				}
			]
		},
		{
			path: 'audit',
			component: () => import('@/views/order/audit/index'), // Parent router-view
			name: 'AuditIndex',
			meta: { title: '审计中心', icon: 'el-icon-audit-index' },
			alwaysShow: true,
			children: [
				{
					path: 'cust',
					component: () => import('@/views/order/audit/cust'),
					name: 'Cust',
					meta: {
						title: '委托单位审核列表',
						isMenu: true,
						keepAlive: true
					}
				}
			]
		},
		{
			path: 'wh',
			component: () => import('@/views/order/order/orderList/wh'), // Parent router-view
			name: 'Wh',
			meta: { title: '海外仓', icon: 'el-icon-warehouse-index' },
			alwaysShow: true,
			children: [
				{
					path: 'orderList',
					component: () => import('@/views/order/order/orderList/wh/orderList'),
					name: 'WhOrderList',
					meta: { title: '订单列表', keepAlive: true, isMenu: true }
				},
				{
					path: 'jointList',
					component: () => import('@/views/order/order/orderList/wh/jointList'),
					name: 'WhJointList',
					meta: { title: '协同单列表', keepAlive: true, isMenu: true }
				}
			]
		}
	]
}

export default chargeRouter
