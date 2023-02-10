import Layout from '@/layout'

const bkgRouter = {
	path: '/bkg',
	component: Layout,
	redirect: '/bkg/',
	name: 'BKG',
	meta: {
		title: '商务订舱',
		icon: 'el-icon-predict-manage'
	},
	alwaysShow: true,
	children: [
		{
			path: 'bkgSaleConfig',
			component: () => import('@/views/bkg/bkgSaleConfig/bkgSaleConfigList/index'),
			name: 'BkgSaleConfig',
			meta: { title: '业务配置', isMenu: true },
		},
		{
			path: 'castManage',
			component: () => import('@/views/bkg/forecast/index'),
			name: 'CastManage',
			meta: { title: '预测管理' },
			alwaysShow: true,
			children: [
				{
					path: 'bkgForeCastLine',
					component: () => import('@/views/bkg/forecastLine/list/index'),
					name: 'BkgForeCastLine',
					meta: { title: '商务预报', isMenu: true },
				},
				{
					path: 'applyForeCastLine',
					component: () => import('@/views/bkg/forecastLine/list/applyLine'),
					name: 'ApplyForeCastLine',
					meta: { title: '预报申领', isMenu: true },
				},
				{
					path: 'foreCast',
					component: () => import('@/views/bkg/forecast/forecastList/index'),
					name: 'ForeCast',
					meta: { title: '舱位预测', isMenu: true },
				},
				{
					path: 'businessCast',
					component: () => import('@/views/bkg/forecast/forecastList/businessCast'),
					name: 'BusinessCast',
					meta: { title: '预测审批', isMenu: true },
				},
				{
					path: 'forecastStatistic',
					component: () => import('@/views/bkg/forecastStatistic/index'),
					name: 'ForecastStatistic',
					meta: { title: '预测汇总', isMenu: true },
				},
			]
		},

		{
			path: 'stockManage',
			component: () => import('@/views/bkg/statisticList/index'),
			name: 'StockManage',
			meta: { title: '现舱管理' },
			alwaysShow: true,
			children: [
				{
					path: 'bkgStockApply',
					component: () => import('@/views/bkg/stockApply/apply/index'),
					name: 'BkgStockApply',
					meta: { title: '现舱申领', isMenu: true },
				},
				{
					path: 'statisticList',
					component: () => import('@/views/bkg/statisticList/list/index'),
					name: 'StatisticList',
					meta: { title: '现舱发布', isMenu: true },
				}
			]
		},
		{
			path: 'applyManage',
			component: () => import('@/views/bkg/stockManage/index'),
			name: 'ApplyManage',
			meta: { title: '申领管理' },
			alwaysShow: true,
			children: [
				{
					path: 'bkgApplyManage',
					component: () => import('@/views/bkg/stockManage/sale/index'),
					name: 'BkgApplyManage',
					meta: { title: '申领列表', isMenu: true },
				},
				{
					path: 'bkgStockManage',
					component: () => import('@/views/bkg/stockManage/employee/index'),
					name: 'BkgStockManage',
					meta: { title: '申领审批', isMenu: true },
				},
				{
					path: 'stockReturnManage',
					component: () => import('@/views/bkg/stockManage/employee/stockReturn'),
					name: 'StockReturnManage',
					meta: { title: '退舱审批' },
				},
				{
					path: 'stockReturn',
					component: () => import('@/views/bkg/stockManage/sale/stockReturn'),
					name: 'StockReturn',
					meta: { title: '退舱列表', isMenu: true },
				},
				{
					path: 'stockAllotDetail',
					component: () => import('@/views/bkg/stockManage/employee/components/stockAllotDetail'),
					name: 'StockAllotDetail',
					meta: { title: '申领详情', keepAlive: true },
					hidden: true
				},
				
				{
					path: 'stockApplyDetail',
					component: () => import('@/views/bkg/stockManage/sale/components/stockApplyDetail'),
					name: 'StockApplyDetail',
					meta: { title: '申领详情', keepAlive: true },
					hidden: true
				},
			]
		},
		// {
		// 	path: 'noticeManage',
		// 	component: () => import('@/views/bkg/stockNotice/index'),
		// 	name: 'NoticeManage',
		// 	meta: { title: '消息管理' },
		// 	alwaysShow: true,
		// 	children: [
		// 		{
		// 			path: 'bkgNoticeManage',
		// 			component: () => import('@/views/bkg/stockNotice/employee/index'),
		// 			name: 'BkgNoticeManage',
		// 			meta: { title: '消息发布' },
		// 		},
		// 		{
		// 			path: 'bkgManageList',
		// 			component: () => import('@/views/bkg/stockNotice/sale/index'),
		// 			name: 'BkgManageList',
		// 			meta: { title: '消息查看' },
		// 		},
		// 	]
		// },
		{
			path: 'bkgManageList',
			component: () => import('@/views/bkg/stockNotice/sale/index'),
			name: 'BkgManageList',
			meta: { title: '消息查看' },
			hidden: true
		},
		{
			path: 'bkgNoticeManage',
			component: () => import('@/views/bkg/stockNotice/employee/index'),
			name: 'BkgNoticeManage',
			meta: { title: '消息发布', isMenu: true },
		},
		{
			path: 'bkgNoticeList',
			component: () => import('@/views/bkg/stockNotice/employee/list'),
			name: 'BkgNoticeList',
			meta: { title: '系统消息', isMenu: true },
		},
		{
			path: 'bkgLineManage',
			component: () => import('@/views/bkg/lineManage/list/index'),
			name: 'BkgLineManage',
			meta: { title: '航线管理', isMenu: true },
		},
		
	]
}

export default bkgRouter
