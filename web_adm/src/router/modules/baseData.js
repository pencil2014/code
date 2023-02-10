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
		{
			path: 'commonData',
			component: () => import('@/views/baseData/commonData/'), // Parent router-view
			name: 'CommonData',
			meta: { title: '通用基础数据' },
			alwaysShow: true,
			children: [
				{
					path: 'currency',
					component: () => import('@/views/baseData/commonData/currency'),
					name: 'Currency',
					meta: { title: '币别信息', isMenu: true }
				},
				{
					path: 'exchangeRate',
					component: () => import('@/views/baseData/commonData/exchangeRate/indexTabs'), // @/views/baseData/commonData/exchangeRate/config
					name: 'ExchangeRate',
					meta: { title: '汇率管理', isMenu: true, keepAlive: true, isUseCache: true } // 汇率配置
				},
				{
					path: 'exception',
					component: () => import('@/views/baseData/commonData/exception/indexTabs'), 
					name: 'Exception',
					meta: { title: '异常类型', isMenu: true, keepAlive: true, isUseCache: true } // 异常类型
				},
				{
					path: 'exchangeRateConfig',
					component: () => import('@/views/baseData/commonData/exchangeRate'),
					name: 'ExchangeRateConfig',
					meta: { title: '查看汇率', isMenu: true, keepAlive: true, isUseCache: true }
				},
				{
					path: 'taxRate',
					component: () => import('@/views/baseData/commonData/taxRate'),
					name: 'TaxRate',
					meta: { title: '税率配置', isMenu: true, keepAlive: true }
				},
				// 改为字典，git提交记录：删除费用类别配置
				{
				  path: 'feeClass',
				  component: () => import('@/views/baseData/commonData/feeItem/class'),
				  name: 'FeeClass',
          meta: { title: '费用类别', isMenu: true, keepAlive: true },
				},
				{
					path: 'feeItem',
					component: () => import('@/views/baseData/commonData/feeItem'),
					name: 'FeeItem',
					meta: { title: '费用项', isMenu: true, keepAlive: true, isUseCache: true }
				},
				{
					path: 'specialFeeitemLimit',
					component: () => import('@/views/baseData/shippingData/specialFeeitemLimit'),
					name: 'SpecialFeeitemLimit',
          meta: { title: '专项管理费用', isMenu: true, keepAlive: true }
				},
        {
					path: 'markManage',
					component: () => import('@/views/baseData/commonData/markManage'),
					name: 'MarkManage',
					meta: { title: '标识管理', isMenu: true }
				},
				{
					path: 'feeItemDetail',
					component: () => import('@/views/baseData/commonData/feeItem/detail'),
					name: 'FeeItemDetail',
					meta: { title: '费用科目-详情' },
					hidden: true
				},
				// {
				//   path: 'companyBankAcct',
				//   component: () => import('@/views/baseData/commonData/companyBankAcct'),
				//   name: 'CompanyBankAcct',
				//   meta: { title: '银行信息' },
				// },
				{
					path: 'country',
					component: () => import('@/views/baseData/commonData/country'),
					name: 'Country',
					meta: { title: '国家', isMenu: true }
				},
				{
					path: 'city',
					component: () => import('@/views/baseData/commonData/city'),
					name: 'City',
					meta: { title: '城市', isMenu: true }
				},
				{
					path: 'holiday',
					component: () => import('@/views/baseData/commonData/holiday'),
					name: 'Holiday',
					meta: { title: '节假日', isMenu: true }
				},
				{
					path: 'dict',
					component: () => import('@/views/baseData/commonData/dict'),
					name: 'Dict',
					meta: { title: '数据字典', isMenu: true, keepAlive: true }
				},
				{
					path: 'baseConfig',
					component: () => import('@/views/baseData/commonData/baseConfig'),
					name: 'BaseConfig',
					meta: { title: '系统配置项', isMenu: true, keepAlive: true }
				},
				{
					path: 'expressConfig',
					component: () => import('@/views/baseData/commonData/expressConfig'),
					name: 'ExpressConfig',
					meta: { title: '快递配置', isMenu: true, keepAlive: true }
				}
			]
		},
		{
			path: 'shippingData',
			component: () => import('@/views/baseData/shippingData/'),
			name: 'ShippingData',
			meta: { title: '海运基础信息' },
			alwaysShow: true,
			children: [
				{
					path: 'port',
					component: () => import('@/views/baseData/shippingData/port'),
					name: 'Port',
					meta: { title: '海运港口', isMenu: true, keepAlive: true, isUseCache: true }
				},
				{
					path: 'systemLine',
					component: () => import('@/views/baseData/shippingData/systemLine/main.vue'),
					name: 'SystemLine',
					meta: { title: '海运航线', isMenu: true }
				},
				{
					path: 'shippingCarrier',
					component: () => import('@/views/baseData/shippingData/shippingCarrier'),
					name: 'ShippingCarrier',
					meta: { title: '船司信息', isMenu: true }
				},
				{
					path: 'shipTerms',
					component: () => import('@/views/baseData/shippingData/shipTerms'),
					name: 'ShipTerms',
					meta: { title: '运输条款', isMenu: true }
				}
			]
		},
		{
			path: 'railData',
			component: () => import('@/views/baseData/railData/'),
			name: 'RailData',
			meta: { title: '铁路基础信息' },
			alwaysShow: true,
			children: [
				{
					path: 'port',
					component: () => import('@/views/baseData/railData/port'),
					name: 'RailPort',
					meta: { title: '铁路站点', isMenu: true, keepAlive: true, isUseCache: true }
				}
			]
		},
    {
			path: 'airData',
			component: () => import('@/views/baseData/airData/'),
			name: 'AirData',
			meta: { title: '空运基础信息' },
			alwaysShow: true,
			children: [
				{
					path: 'port',
					component: () => import('@/views/baseData/airData/port'),
					name: 'AirPort',
					meta: { title: '空运港口', isMenu: true, keepAlive: true, isUseCache: true }
				}
			]
		}
	]
}

export default baseDataRouter
