/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const financeRouter = {
	path: '/finance',
	component: Layout,
	redirect: '/finance/settlement/settlementList',
	name: 'Finance',
	meta: {
		title: '财务',
		icon: 'el-icon-finance'
	},
	children: [
		{
			path: 'otherFeeList',
			component: () => import('@/views/finance/otherFeeList/index'),
			name: 'OtherFeeList',
			meta: { title: '订单费用' },
			alwaysShow: true,
			children: [
				{
					path: 'feeClosedModifyFeeList',
					component: () => import('@/views/finance/otherFeeList/feeClosedModifyFeeList/indexTabs'),
					name: 'FeeClosedModifyFeeList',
					meta: { title: '调费申请', keepAlive: true, isMenu: true } //activeMenu: '/finance/otherFeeList/feeClosedModifyFeeList'
				},
				{
					path: 'feeClosedModifyFeeDetail',
					component: () => import('@/views/finance/otherFeeList/feeClosedModifyFeeList/components/feeClosedModifyFeeDetail'),
					name: 'FeeClosedModifyFeeDetail',
					meta: { title: '调费详情', keepAlive: true, isUseCache: true, },
					hidden: true
				},
				{
					path: 'feeClosedModifyFeeApply',
					component: () => import('@/views/finance/orderFee/orderFee/components/components/feeClosedModifyFeeApply'),
					name: 'FeeClosedModifyFeeApply',
					meta: { title: '关账调费', keepAlive: true, isUseCache: true, },
					hidden: true
				},
				{
					path: 'mySpecialList',
					component: () => import('@/views/finance/otherFeeList/mySpecialList'),
					name: 'MySpecialList',
					meta: { title: '专项管理费', keepAlive: true, isMenu: true } // activeMenu: '/finance/otherFeeList/mySpecialList'
				},
				{
					path: 'billList',
					component: () => import('@/views/finance/bill/billList/indexTabs'),
					name: 'BillList',
					meta: { title: '客户账单', keepAlive: true, isMenu: true } // activeMenu: '/finance/otherFeeList/billList'
				},
				{
					path: 'billDetail',
					component: () => import('@/views/finance/orderFee/orderFee/components/billDetail'),
					name: 'BillDetail',
					meta: { title: '账单详情', keepAlive: true, isUseCache: true, },
					hidden: true
				},
				// {
				// 	path: 'seaBillList',
				// 	component: () => import('@/views/finance/seaBill/SeaBillList'),
				// 	name: 'SeaBillList',
				// 	meta: { title: '海运账单', keepAlive: true }
				// },

        // 海运商务   
				{
					path: 'seaCommerceList',
					component: () => import('@/views/finance/seaBill/seaCommerceList'),
					name: 'SeaCommerceList',
          meta: { title: '费用审核列表', keepAlive: true, isMenu: true } // activeMenu: '/finance/otherFeeList/seaCommerceList'
				},
				{
					path: 'paymentRequest',
					component: () => import('@/views/finance/seaBill/seaCommerceList/components/paymentRequest'),
					name: 'PaymentRequest',
					meta: { title: '付款申请', keepAlive: true, isUseCache: true, isUseCache: true },
					hidden: true
				},
				{
          path: 'paymentRequestDetail',
          component: () => import('@/views/finance/seaBill/seaCommerceList/components/paymentRequestDetail'),
          name: 'PaymentRequestDetail',
          meta: { title: '结算申请详情', keepAlive: true, isUseCache: true, isUseCache: true },
          hidden: true
        },
				{
					path: 'balanceLoss',
					component: () => import('@/views/finance/seaBill/seaCommerceList/components/balanceLoss'),
					name: 'BalanceLoss',
					meta: { title: '亏损冲抵', keepAlive: true, isUseCache: true },
					hidden: true
				},
				{
					path: 'summaryBillDetail',
					component: () => import('@/views/finance/seaBill/seaCommerceList/components/summaryBillDetail'),
					name: 'SummaryBillDetail',
					meta: { title: '月度数据明细', keepAlive: true, isUseCache: true },
					hidden: true
        },
        {
          path: 'specailBillDetail',
          component: () => import('@/views/finance/seaBill/seaCommerceList/components/shLienMonthDetail'),
          name: 'SpecailBillDetail',
          meta: { title: '特种柜月度数据', keepAlive: true, isUseCache: true },
          hidden: true
        },
				{
          path: 'shLienMonthDetail',
          component: () => import('@/views/finance/seaBill/seaCommerceList/components/shLienMonthDetail'),
          name: 'ShLienMonthDetail',
          meta: { title: '航线月度数据', keepAlive: true, isUseCache: true },
          hidden: true
        },
				{
					path: 'shLienSettleAuditDetail',
					component: () => import('@/views/finance/seaBill/seaCommerceList/components/shLienSettleAuditDetail'),
					name: 'ShLienSettleAuditDetail',
          meta: { title: '审核日志', keepAlive: true, isUseCache: true },
					hidden: true
				},
				{
					path: 'hedgeDetail',
					component: () => import('@/views/finance/seaBill/seaCommerceList/components/hedgeDetail'),
					name: 'HedgeDetail',
					meta: { title: '对冲详情', keepAlive: true, isUseCache: true },
					hidden: true
				},
				{
					path: 'confirmBillDetail',
					component: () => import('@/views/finance/seaBill/seaCommerceList/components/confirmBillDetail'),
					name: 'ConfirmBillDetail',
					meta: { title: '确认账单详情', keepAlive: true, isUseCache: true },
					hidden: true
				},

        // 空运商务
        {
          path: 'seaCommerceListAir',
          component: () => import('@/views/finance/seaBill/seaCommerceList'),
          name: 'SeaCommerceListAir',
          meta: { title: '费用审核列表', keepAlive: true, isMenu: true } // activeMenu: '/finance/otherFeeList/seaCommerceList'
        },

				{
					path: 'settlementBillMergeList',
					component: () => import('@/views/finance/settlement/settlementBillMergeList'),
					name: 'SettlementBillMergeList',
					meta: { title: '对账单合并', keepAlive: true, isUseCache: true, isMenu: true }
				},
				{
					path: 'writeoffDzgMonitor',
					component: () => import('@/views/finance/otherFeeList/writeoffDzgMonitor'),
					name: 'WriteoffDzgMonitor',
					meta: { title: '大掌柜核销', keepAlive: true, isUseCache: true, isMenu: true }
				},
				{
					path: 'feeTemplateList',
					component: () => import('@/views/finance/orderFee/feeTemplateList'),
					name: 'FeeTemplateList',
					meta: { title: '费用模板', keepAlive: true, isMenu: true }
				},
				{
					path: 'addFeeTemplate',
					component: () => import('@/views/finance/orderFee/feeTemplateList/components/addFeeTemplate'),
					name: 'AddFeeTemplate',
					meta: { title: '新增费用模板', keepAlive: true, isUseCache: true },
					hidden: true
				},
				{
					path: 'feeTemplateDetail',
					component: () => import('@/views/finance/orderFee/feeTemplateList/components/addFeeTemplate'),
					name: 'FeeTemplateDetail',
					meta: { title: '费用模板详情', keepAlive: true, isUseCache: true },
					hidden: true
				},
				{
					path: 'usaFeeCompareList',
					component: () => import('@/views/finance/otherFeeList/usaFeeCompareList'),
					name: 'UsaFeeCompareList',
					meta: { title: '美国系统对账', keepAlive: true, isMenu: true } // activeMenu: '/finance/otherFeeList/billList'
				},
			]
		},
		{
			path: 'settlement',
			component: () => import('@/views/finance/settlement/index'),
			name: 'Settlement',
			meta: { title: '结算单' },
			alwaysShow: true,
			children: [
				{
					path: 'feeList',
					component: () => import('@/views/finance/settlement/feeList/indexTabs'),
					name: 'SettlementFeeList',
					meta: { title: '费用列表', keepAlive: true, isMenu: true } // activeMenu: '/finance/settlement/feeList'
				},
				// {
				// 	path: 'orderFee/:orderNo',
				// 	component: () => import('@/views/finance/orderFee/orderFee'),
				// 	name: 'OrderFee',
				// 	meta: { title: '订单详情-费用', keepAlive: true, isUseCache: true },
				// 	hidden: true
				// },
				{
					path: 'settlementList',
					component: () => import('@/views/finance/settlement/settlementList'),
					name: 'SettlementList',
					meta: { title: '结算单列表', keepAlive: true, isMenu: true } // activeMenu: '/finance/settlement/settlementList'
				},
				{
					path: 'settlementDetail',
					component: () => import('@/views/finance/settlement/components/settlementDetail'),
					name: 'SettlementDetail',
					meta: { title: '结算单详情', keepAlive: true, isUseCache: true },
					hidden: true
        },
        {
          path: 'receiLossSettleFeeDetail',
          component: () => import('@/views/finance/settlement/components/settleFeeDetail'),
          name: 'ReceiLossSettleFeeDetail',
          meta: { title: '坏账申请费用明细', keepAlive: true },
          hidden: true
        },
        {
          path: 'gedgingSettleFeeDetail',
          component: () => import('@/views/finance/settlement/components/settleFeeDetail'),
          name: 'GedgingSettleFeeDetail',
          meta: { title: '对冲费用明细', keepAlive: true },
          hidden: true
        },
				{
					path: 'createSettlement',
					component: () => import('@/views/finance/settlement/components/settlementDetail'),
					name: 'CreateSettlement',
					meta: { title: '结算单生成', keepAlive: true, isUseCache: true },
					hidden: true
				},
				{
					path: 'settlementBillList',
					component: () => import('@/views/finance/settlement/components/components/settlementBillList'),
					name: 'SettlementBillList',
					meta: { title: '结算单对账单列表', keepAlive: true, isUseCache: true },
					hidden: true
				},
				{
					path: 'settlementBillDetail',
					component: () => import('@/views/finance/settlement/components/components/settlementBillDetail'),
					name: 'SettlementBillDetail',
					meta: { title: '结算单对账单详情', keepAlive: true, isUseCache: true },
					hidden: true
				},
				{
					path: 'batchBillDetail',
					component: () => import('@/views/finance/settlement/components/components/batchBillDetail'),
					name: 'BatchBillDetail',
					meta: { title: '批量打印单票账单', keepAlive: true, isUseCache: true },
					hidden: true
				},
				{
					path: 'settlementPayApply',
					component: () => import('@/views/finance/settlement/settlementList/components/settlementPayApply'),
					name: 'SettlementPayApply',
					meta: { title: '结算付款申请', keepAlive: true, isUseCache: true, dialFullWidth: true },
					hidden: true
				},
				{
					path: 'finBillList',
					component: () => import('@/views/finance/finBill/finBillList'),
					name: 'FinBillList',
					meta: { title: '费用单列表', keepAlive: true, isMenu: true } // activeMenu: '/finance/settlement/finBillList'
				},
				{
					path: 'finBillListDetail',
					component: () => import('@/views/finance/finBill/finBillList/components/finBillDetail'),
					name: 'FinBillListDetail',
					meta: { title: '费用单详情', keepAlive: true, dialFullWidth: true },
					hidden: true
				},
				{
					path: 'finBillListAdd',
					component: () => import('@/views/finance/finBill/finBillList/components/addFinBill'),
					name: 'FinBillListAdd',
					meta: { title: '费用单新增', keepAlive: true },
					hidden: true
				}
			]
		},
		{
			path: 'gedging',
			component: () => import('@/views/finance/gedging/index'),
			name: 'Gedging',
			meta: { title: '对冲' },
			alwaysShow: true,
			children: [
				{
					path: 'gedgingList',
					component: () => import('@/views/finance/gedging/gedgingList/indexTabs'),
					name: 'GedgingList',
					meta: { title: '对冲列表', keepAlive: true, isMenu: true } // activeMenu: '/finance/gedging/gedgingList'
				},
				// {
				//   path: 'gedgingList',
				//   component: () => import('@/views/finance/gedging/gedgingList'),
				//   name: 'GedgingList',
				//   meta: { title: '对冲申请列表', keepAlive: true }
				// },
				// {
				//   path: 'gedgingWriteOffList',
				//   component: () => import('@/views/finance/otherWriteOff/gedgingWriteOffList'),
				//   name: 'GedgingWriteOffList',
				//   meta: { title: '对冲核销列表', keepAlive: true }
        // },
        {
          path: 'gedgingDetail',
          component: () => import('@/views/finance/gedging/components/gedgingDetail'),
          name: 'GedgingDetail',
          meta: { title: '对冲详情', keepAlive: true, isUseCache: true, },
          hidden: true
        },
        {
          path: 'gedgingPrintPage',
          component: () => import('@/views/finance/components/printPage/index'),
          name: 'GedgingPrintPage',
          meta: { title: '对冲明细打印', keepAlive: true, isUseCache: true, },
          hidden: true
        },
				{
					path: 'createGedging',
					component: () => import('@/views/finance/gedging/components/gedgingDetail'),
					name: 'CreateGedging',
					meta: { title: '对冲申请', keepAlive: true, isUseCache: true },
					hidden: true
				},
				{
					path: 'settleOrderBaddebtList',
					component: () => import('@/views/finance/otherWriteOff/settleOrderBaddebtList'),
					name: 'SettleOrderBaddebtList',
          meta: { title: '坏账申请', keepAlive: true }
				},
				{
					path: 'badOrderDetail',
					component: () => import('@/views/finance/otherWriteOff/settleOrderBaddebtList/components/badOrderDetail'),
					name: 'BadOrderDetail',
					meta: { title: '提成预销单详情', keepAlive: true, },
					hidden: true
        },
        {
          path: 'badOrderPrintPage',
          component: () => import('@/views/finance/components/printPage/writeoffNopaySettleOrder'),
          name: 'BadOrderPrintPage',
          meta: { title: '提成预销单打印', keepAlive: true, isUseCache: true, },
          hidden: true
        },
				{
					path: 'badApplyDetail',
					component: () => import('@/views/finance/otherWriteOff/settleOrderBaddebtList/components/badApplyDetail'),
					name: 'BadApplyDetail',
          meta: { title: '坏账申请详情', keepAlive: true,},
					hidden: true
				},
				{
					path: 'settleOrderBadDetail',
          component: () => import('@/views/finance/otherWriteOff/settleOrderBaddebtList/components/badApplyDetail'),
					name: 'SettleOrderBadDetail',
          meta: { title: '坏账申请核销详情', keepAlive: true, },
					hidden: true
				},
				{
					path: 'settleOrderBadApply',
					component: () => import('@/views/finance/otherWriteOff/settleOrderBaddebtList/components/receiLossApply'),
					name: 'SettleOrderBadApply', 
          meta: { title: '坏账申请', keepAlive: true },
					hidden: true
				},
				{
					path: 'receiLossFeeQuery',
					component: () => import('@/views/finance/otherWriteOff/settleOrderBaddebtList/components/receiLossFeeQuery'),
					name: 'ReceiLossFeeQuery',
          meta: { title: '坏账申请费用查询', keepAlive: true },
					hidden: true
				},
			]
		},
		{
			path: 'receivable',
			component: () => import('@/views/finance/receivable/index'),
			name: 'Receivable',
			meta: { title: '应收' },
			alwaysShow: true,
			children: [
				{
					path: 'regWriteoff',
					component: () => import('@/views/finance/receivable/regWriteoff'),
					name: 'RegWriteoff',
					meta: { title: '收款登记', keepAlive: true, isMenu: true } // activeMenu: '/finance/receivable/regWriteoff'
				},
				// {
				// 	path: 'regDetail',
				// 	component: () => import('@/views/finance/receivable/reg/detail'),
				// 	name: 'RegDetail',
				// 	meta: { title: '收款登记详情', keepAlive: true },
				// 	hidden: true
        // },
        {
          path: 'regWriteoffDetail',
          component: () => import('@/views/finance/receivable/reg/components/regWriteoffDetail'),
          name: 'RegWriteoffDetail',
          meta: { title: '收款登记核销', keepAlive: true },
          hidden: true
        },
        // 创建核销-只能存在一个创建页面，所以为方便记忆，使用 writeoffRecvDetail
				{
					path: 'writeoffRecvDetail',
					component: () => import('@/views/finance/receivable/reg/components/writeoffRecvDetail'),
					name: 'WriteoffRecvDetail',
					meta: { title: '收款核销', keepAlive: true, dialFullWidth: true },
					hidden: true
        },
        // 从费用列表关联收款登记核销
        {
          path: 'writeoffRecvFromFeeDetail',
          component: () => import('@/views/finance/receivable/reg/components/writeoffRecvFromFeeDetail'),
          name: 'WriteoffRecvFromFeeDetail',
          meta: { title: '费用关联核销', keepAlive: true, dialFullWidth: true },
          hidden: true
        },
        // 核销详情-会同时存在多个详情页，所以为方便记忆，使用 writeoffRecvDetails
				{
					path: 'writeoffRecvDetail2/:writeoffNo',
					component: () => import('@/views/finance/receivable/reg/components/writeoffRecvDetails'),
					name: 'WriteoffRecvDetail2',
					meta: {
						title: '收款核销详情',
						keepAlive: true,
						// isUseCache: true
					},
					hidden: true
				},
				// {
				// 	path: 'prerevDetail',
				// 	component: () => import('@/views/finance/receivable/writeoffRecv/components/receivablePrerevDetail'),
				// 	name: 'PrerevDetail',
				// 	meta: { title: '预收款详情', keepAlive: true },
				// 	hidden: true
				// },
				{
					path: 'prerevWriteoff',
					component: () => import('@/views/finance/receivable/writeoffRecv/components/receivablePrerevWriteoffs'),
					name: 'PrerevWriteoff',
					meta: { title: '预收款核销', keepAlive: true, dialFullWidth: true },
					hidden: true
				},
				{
					path: 'regTransfer',
					component: () => import('@/views/finance/receivable/regTransfer'),
					name: 'RegTransfer',
					meta: { title: '收款转移', keepAlive: true, isMenu: true } // activeMenu: '/finance/receivable/regTransfer'
				},
				{
					path: 'invoiceReceivable',
					component: () => import('@/views/finance/invoiceReceivable/invoiceReceivable'),
					name: 'InvoiceReceivable',
					meta: { title: '应收发票管理', keepAlive: true, isMenu: true, dialFullWidth: true }
				},
				{
					path: 'invoiceReceivableApplyDetail',
					component: () => import('@/views/finance/invoiceReceivable/components/invoiceReceivableDetail'),
					name: 'InvoiceReceivableApplyDetail',
					meta: { title: '开票申请详情', keepAlive: true },
					hidden: true
				},
				{
					path: 'invoiceReceivableDetail',
					component: () => import('@/views/finance/invoiceReceivable/components/invoiceReceivableDetail'),
					name: 'InvoiceReceivableDetail',
					meta: { title: '发票详情', keepAlive: true },
					hidden: true
				},
				{
					path: 'invoiceReceivableApply',
					component: () => import('@/views/finance/invoiceReceivable/components/invoiceReceivableApply'),
					name: 'InvoiceReceivableApply',
					meta: { title: '开票申请', keepAlive: true },
					hidden: true
				},
				{
          path: 'manualRegistInvoice',
          component: () => import('@/views/finance/invoiceReceivable/components/manualRegistInvoice'),
          name: 'ManualRegistInvoice',
          meta: { title: '手填发票', keepAlive: true },
          hidden: true
        },
				{
					path: 'invoicePrerevApply',
          component: () => import('@/views/finance/invoiceReceivable/components/invoicePrerevApply'),
					name: 'InvoicePrerevApply',
					meta: { title: '预收款开票申请', keepAlive: true },
					hidden: true
				},
				{
					path: 'invoicePrerevDetail',
					component: () => import('@/views/finance/invoiceReceivable/components/invoiceReceivableDetail'),
					name: 'InvoicePrerevDetail',
					meta: { title: '预收款开票详情', keepAlive: true },
					hidden: true
				},
				{
					path: 'fiscalTermList',
					component: () => import('@/views/finance/receivable/fiscalTermList/indexTabs'),
					name: 'FiscalTermList',
					meta: { title: '应收账单', keepAlive: true, isMenu: true } // activeMenu: '/finance/receivable/regWriteoff'
				},
				{
					path:'fiscalTermDetail',
					component:() => import('@/views/finance/receivable/fiscalTermList/fiscalTermDetail'),
					name: 'FiscalTermDetail',
					meta: { title:'应收账单详情', keepAlive:true },
					hidden: true
				},
				{
					path: 'fiscalTermListSU',
					component: () => import('@/views/finance/receivable/fiscalTermList/fiscalTermList'),
					name: 'FiscalTermListSU',
					meta: { title: '客户应收账单', keepAlive: true }
				},
				{
					path: 'lateFeeReceive',
					component: () => import('@/views/finance/receivable/fiscalTermList/lateFeeReceive'),
					name: 'LateFeeReceive',
					meta: { title: '滞纳金收取', keepAlive: true }
				},
				{
					path: 'lateFeeDerate',
					component: () => import('@/views/finance/receivable/fiscalTermList/lateFeeDerate'),
					name: 'LateFeeDerate',
					meta: { title: '滞纳金减免申请', keepAlive: true }
				},
				{
					path: 'lateFeeDetail',
					component: () => import('@/views/finance/receivable/fiscalTermList/lateFeeDetail'),
					name: 'LateFeeDetail',
					meta: { title: '滞纳金详情', keepAlive: true }
				},
				{
					path: 'derateDetail',
					component: () => import('@/views/finance/receivable/fiscalTermList/derateDetail'),
					name: 'DerateDetail',
					meta: { title: '减免申请详情', keepAlive: true }
				},
			]
		},
		{
			path: 'pay',
			component: () => import('@/views/finance/pay/index'),
			name: 'Pay',
			meta: { title: '应付' },
			alwaysShow: true,
			children: [
				{
					path: 'payApplyList', // prepayList
					component: () => import('@/views/finance/pay/payApplyList'), // @/views/finance/pay/prepayList
					name: 'PrepayList',
					meta: { title: '付款申请', keepAlive: true, isMenu: true, dialFullWidth: true }
				},
				{
					path: 'prepayDetail',
					component: () => import('@/views/finance/pay/prepay/detail'),
					name: 'PrepayDetail',
					meta: { title: '预付款详情', keepAlive: true },
					hidden: true
				},
				{
					path: 'prepayDedueDetail',
					component: () => import('@/views/finance/pay/prepay/components/PrepayDedueDetail'),
					name: 'PrepayDedueDetail',
					meta: { title: '预付抵账明细', keepAlive: true },
					hidden: true
				},
				{
					path: 'payPrepayPrint',
					component: () => import('@/views/finance/pay/prepay/components/payPrepayPrint'),
					name: 'PayPrepayPrint',
					meta: { title: '预付款申请单打印', keepAlive: true },
					hidden: true
				},
        // TODO PrepayEdit弃用，下一版本注释待测，
				{
					path: 'prepayEdit',
					component: () => import('@/views/finance/pay/prepay/detail'),
					name: 'PrepayEdit',
					meta: { title: '预付款编辑', keepAlive: true },
					hidden: true
				},
				{
					path: 'settleDetail',
					component: () => import('@/views/finance/settlement/settlementList/components/settlementPayApply'), // component: () => import('@/views/finance/pay/settle/detail'), 弃用detail文件 2022-12-15删除代码
					name: 'SettleDetail',
					meta: { title: '付款申请详情', keepAlive: true, dialFullWidth: true },
					hidden: true
				},
				{
					path: 'writeoffPayList',
					component: () => import('@/views/finance/pay/writeoffPayList'),
					name: 'WriteoffPayList',
					meta: { title: '出纳付款', keepAlive: true, isMenu: true }
				},
				// {
				//   path: 'payOrder',
				//   component: () => import('@/views/finance/pay/order'),
				//   name: 'PayOrder',
				//   meta: { title: '付款单', keepAlive: true },
				// },
				{
					path: 'orderDetails',
					component: () => import('@/views/finance/pay/order/orderDetails'),
					name: 'OrderDetails',
					meta: { title: '付款单详情', keepAlive: true },
					hidden: true
				},
        // 改为弹窗，git提交记录： 删除标记付错路由及页面 & 删除付款单详情多余页面
				// {
				// 	path: 'markPayError',
				// 	component: () => import('@/views/finance/pay/order/markError'),
				// 	name: 'MarkPayError',
				// 	meta: { title: '标记付错信息', keepAlive: true },
				// 	hidden: true
				// },

        // TODO WriteOffPreview 弃用，下一版本注释待测，
				{
					path: 'writeOffPreview',
					component: () => import('@/views/finance/pay/order/components/writeOffPreview'),
					name: 'WriteOffPreview',
					meta: { title: '付款核销申请', keepAlive: true },
					hidden: true
				},
				{
					path: 'payOrderPrint',
					component: () => import('@/views/finance/pay/order/components/payOrderPrint'),
					name: 'PayOrderPrint',
					meta: { title: '付款单打印', keepAlive: true },
					hidden: true
				},
				{
					path: 'payOrderFileNoPrint',
					component: () => import('@/views/finance/pay/order/components/payOrderFileNoPrint'),
					name: 'PayOrderFileNoPrint',
					meta: { title: '付款单打印+附件', keepAlive: true },
					hidden: true
				},
				{
					path: 'payOrderPrints',
					component: () => import('@/views/finance/pay/order/components/payOrderPrint'),
					name: 'PayOrderPrints',
					meta: { title: '付款专项单打印', keepAlive: true },
					hidden: true
				},
				{
					path: 'paySettlePrint',
					component: () => import('@/views/finance/pay/settle/components/paySettlePrint'),
					name: 'PaySettlePrint',
					meta: { title: '结算付款申请单打印', keepAlive: true },
					hidden: true
				},
				{
					path: 'paySettleFileNoPrint',
					component: () => import('@/views/finance/pay/settle/components/paySettleFileNoPrint'),
					name: 'PaySettleFileNoPrint',
					meta: { title: '结算付款申请单打印+附件', keepAlive: true },
					hidden: true
				},
				{
					path: 'paySettlePrints',
					component: () => import('@/views/finance/pay/settle/components/paySettlePrints'),
					name: 'PaySettlePrints',
					meta: { title: '打印专项单', keepAlive: true },
					hidden: true
				},
				{
					path: 'orderRefund',
					component: () => import('@/views/finance/pay/order/components/refund'),
					name: 'OrderRefund',
					meta: { title: '预付退款', keepAlive: true },
					hidden: true
				},
				// {
				//   path: 'writeoffPay',
				//   component: () => import('@/views/finance/pay/writeoffPay'),
				//   name: 'WriteoffPay',
				//   meta: { title: '付款核销', keepAlive: true },
				// },
				{
					path: 'writePayDetail',
					component: () => import('@/views/finance/pay/writeoffPay/detail'),
					name: 'WritePayDetail',
					meta: { title: '付款核销详情', keepAlive: true },
					hidden: true
				},
        // TODO 弃用，下一版本注释待测， DetailPrepay
				// {
				// 	path: 'detailPrepay',
				// 	component: () => import('@/views/finance/pay/writeoffPay/detail/prepayDetail'),
				// 	name: 'DetailPrepay',
				// 	meta: { title: '预付退款付款核销', keepAlive: true },
				// 	hidden: true
        // },
        // TODO 弃用，下一版本注释待测， DetailSettle
				// {
				// 	path: 'detailSettle',
				// 	component: () => import('@/views/finance/pay/writeoffPay/detail/settleDetail'),
				// 	name: 'DetailSettle',
				// 	meta: { title: '结算付款核销', keepAlive: true },
				// 	hidden: true
				// },
        // TODO 弃用，下一版本注释待测， PrepayWriteOffDetail
				// {
				// 	path: 'prepayWriteOffDetail',
				// 	component: () => import('@/views/finance/pay/writeoffPay/detail/prepayWriteOffDetail'),
				// 	name: 'PrepayWriteOffDetail',
				// 	meta: { title: '预付抵账核销', keepAlive: true },
				// 	hidden: true
				// },
				// {
				// 	path: 'payApplyReceiveRefundList',
				// 	component: () => import('@/views/finance/pay/payApplyReceiveRefund'),
				// 	name: 'PayApplyReceiveRefundList',
				// 	meta: { title: '退款申请', keepAlive: true }
				// },
				{
					path: 'refundDetail',
					component: () => import('@/views/finance/pay/payApplyReceiveRefund/components/refundDetail'),
					name: 'RefundDetail',
					meta: { title: '退款申请详情', keepAlive: true },
					hidden: true
				},
				{
					path: 'payRefundPrint',
					component: () => import('@/views/finance/pay/payApplyReceiveRefund/components/payRefundPrint'),
					name: 'PayRefundPrint',
					meta: { title: '退款申请单打印', keepAlive: true },
					hidden: true
				},
				{
					path: 'invoicePaymentList',
					component: () => import('@/views/finance/invoicePayment/invoicePaymentList'),
					name: 'InvoicePaymentList',
					meta: { title: '应付发票管理', keepAlive: true, isMenu: true }
				},
				{
					path: 'invoicePaymentListDetail',
					component: () => import('@/views/finance/invoicePayment/invoicePaymentList/components/invoicePaymentDetail'),
					name: 'InvoicePaymentListDetail',
					meta: { title: '应付发票详情', keepAlive: true },
					hidden: true
				},
				{
					path: 'invoicePaymentListReg',
					component: () => import('@/views/finance/invoicePayment/invoicePaymentList/components/invoicePaymentListReg'),
					name: 'InvoicePaymentListReg',
					meta: { title: '应付发票登记', keepAlive: true },
					hidden: true
				},
				{
					path: 'invoicePaymentListEdit',
					component: () => import('@/views/finance/invoicePayment/invoicePaymentList/components/invoicePaymentListReg'),
					name: 'InvoicePaymentListEdit',
					meta: { title: '应付发票修改', keepAlive: true },
					hidden: true
				},
				{
					path: 'identifyElecInvoice',
					component: () => import('@/views/finance/invoicePayment/invoicePaymentList/components/identifyElecInvoice'),
					name: 'IdentifyElecInvoice',
					meta: { title: '电子发票识别', keepAlive: true },
					hidden: true
				},
				{
					path: 'invoicePaymentPrint',
					component: () => import('@/views/finance/invoicePayment/invoicePaymentList/components/invoicePaymentPrint'),
					name: 'InvoicePaymentPrint',
					meta: { title: '应付发票打印', keepAlive: true },
					hidden: true
				},
				{
					path: 'supplierBillList',
					component: () => import('@/views/finance/supplierBill/supplierBillList'),
					name: 'SupplierBillList',
					meta: { title: '供应商对账', keepAlive: true, isMenu: true } // activeMenu: '/finance/otherFeeList/supplierBillList'
				},
				{
					path: 'supplierBillImport',
					component: () => import('@/views/finance/supplierBill/supplierBillList/components/importBill'),
					name: 'SupplierBillImport',
					meta: { title: '导入供应商账单', keepAlive: true, isUseCache: true, },
					hidden: true
				},
				{
					path: 'supplierBillListSystem',
					component: () => import('@/views/finance/supplierBill/supplierBillList/components/systemDetail'),
					name: 'SupplierBillListSystem',
					meta: { title: '系统明细数据', keepAlive: true, isUseCache: true, },
					hidden: true
				},
				{
					path: 'supplierBillListCheck',
					component: () => import('@/views/finance/supplierBill/supplierBillList/components/accountChecking'),
					name: 'SupplierBillListCheck',
					meta: { title: '对账', keepAlive: true, isUseCache: true, },
					hidden: true
				},
				{
					path: 'supplierBillListResult',
					component: () => import('@/views/finance/supplierBill/supplierBillList/components/diffResultSupplier'),
					name: 'SupplierBillListResult',
					meta: { title: '对账结果', keepAlive: true, isUseCache: true, },
					hidden: true
				},
				{
					path: 'supplierBillListDetail',
					component: () => import('@/views/finance/supplierBill/supplierBillList/components/supplierBillDetail'),
					name: 'SupplierBillListDetail',
					meta: { title: '对账数据', keepAlive: true, isUseCache: true, },
					hidden: true
				},
			]
		},
		{
			path: 'accountantVoucher',
			component: () => import('@/views/finance/accountantVoucher/index'),
			name: 'AccountantVoucher',
			meta: { title: '会计凭证' },
			alwaysShow: true,
			children: [
				{
					path: 'writeoffList',
					component: () => import('@/views/finance/accountantVoucher/writeoffList/index'),
					name: 'AccountantVoucherWriteoff',
					meta: { title: '核销列表', keepAlive: true, isMenu: true }
        },
        {
          path: 'acctDocument',
          component: () => import('@/views/finance/accountantVoucher/acctDocument/index'),
          name: 'AcctDocument',
          meta: { title: '会计单据', keepAlive: true, isMenu: true }
        },
				{
					path: 'voucherList',
					component: () => import('@/views/finance/voucher/voucherManage/index'),
					name: 'VoucherList',
          meta: { title: '运营凭证', keepAlive: true, isMenu: true }
				},
				{
					path: 'accountTitleBalance',
					component: () => import('@/views/finance/voucher/accountBalance'),
					name: 'AccountTitleBalance',
					meta: { title: '科目余额', keepAlive: true, isMenu: true }
        },
        {
          path: 'incomeCost',
          component: () => import('@/views/finance/accountantVoucher/incomeCost/index'),
          name: 'IncomeCost',
          meta: { title: '收入成本', keepAlive: true, isMenu: true }
        },
        {
					path: 'incomeCostDetail',
					component: () => import('@/views/finance/accountantVoucher/incomeCost/tabs/shiftTabDetail'),
					name: 'IncomeCostDetail',
					meta: { title: '转字费用详情', keepAlive: true, },
					hidden: true
				},
        {
					path: 'invoiceDetail',
					component: () => import('@/views/finance/accountantVoucher/incomeCost/tabs/invoiceTabDetail'),
					name: 'InvoiceDetail',
					meta: { title: '转字发票详情', keepAlive: true, },
					hidden: true
				},
        {
          path: 'acctVoucherList',
          component: () => import('@/views/finance/accountantVoucher/acctVoucherList/index'),
          name: 'AcctVoucherList',
          meta: { title: '会计凭证', keepAlive: true, isMenu: true }
        },
				{
					path: 'otherAccountantFeeList',
					component: () => import('@/views/finance/accountantVoucher/otherAccountantFeeList/indexTabs'),
					name: 'OtherAccountantFeeList',
					meta: { title: '其他费用', keepAlive: true, isMenu: true }
				}
			]
		},
		{
			path: 'otherWriteOff',
			component: () => import('@/views/finance/otherWriteOff/index'),
			name: 'OtherWriteOff',
			meta: { title: '员工扣减' },
			alwaysShow: true,
			children: [
				{
					path: 'emplAbatementList',
					component: () => import('@/views/finance/emplAbatement/index'),
					name: 'EmplAbatementList',
          meta: { title: '扣减金额', keepAlive: true, isMenu: true },
				},
				// {
				// 	path: 'settleOrderBadDetail',
				// 	component: () => import('@/views/finance/otherWriteOff/settleOrderBaddebtList/components/settleOrderBadDetail'),
				// 	name: 'SettleOrderBadDetail',
				// 	meta: { title: '坏账核销详情', keepAlive: true, },
				// 	hidden: true
				// },
				// {
				// 	path: 'settleOrderBadApply',
				// 	component: () => import('@/views/finance/otherWriteOff/settleOrderBaddebtList/components/settleOrderBadDetail'),
				// 	name: 'SettleOrderBadApply',
				// 	meta: { title: '坏账申请-操作', keepAlive: true },
				// 	hidden: true
				// }
			]
		},
		{
			path: 'investor',
			component: () => import('@/views/finance/investor/index'),
			name: 'Investor',
			meta: { title: '客商余额' },
			alwaysShow: true,
			children: [
				{
					path: 'investorPrepay',
					component: () => import('@/views/finance/investor/prepay/index'),
					name: 'InvestorPrepay',
					meta: { title: '预付余额', keepAlive: true, isMenu: true }
				},
				{
					path: 'investorPrepayDetail',
					component: () => import('@/views/finance/investor/prepay/prepayDetail'),
					name: 'InvestorPrepayDetail',
					meta: { title: '预付详情', keepAlive: true },
					hidden: true
				},
				{
					path: 'investorPrepayDetailMore',
					component: () => import('@/views/finance/investor/prepay/moreDetail'),
					name: 'InvestorPrepayDetailMore',
					meta: { title: '更多预付余额详情', keepAlive: true },
					hidden: true
				},
				{
					path: 'investorPrepayDetailDetail',
					component: () => import('@/views/finance/investor/prepay/detailDetail'),
					name: 'InvestorPrepayDetailDetail',
					meta: { title: '预付金额详情', keepAlive: true },
					hidden: true
				},
				{
					path: 'prerevAccountListPage',
					component: () => import('@/views/finance/investor/receivablePrerev/index'),
					name: 'PrerevAccountListPage',
					meta: { title: '预收余额', keepAlive: true, isMenu: true }
				},
				{
					path: 'prerevAccountDetail',
					component: () => import('@/views/finance/investor/receivablePrerev/detail'),
					name: 'PrerevAccountDetail',
					meta: { title: '预收详情', keepAlive: true },
					hidden: true
				},
				{
					path: 'prerevAccountDetailMore',
					component: () => import('@/views/finance/investor/prepay/moreDetail'),
					name: 'PrerevAccountDetailMore',
					meta: { title: '更多预收余额详情', keepAlive: true },
					hidden: true
				},
				{
					path: 'prerevAccountDetailDetail',
					component: () => import('@/views/finance/investor/prepay/detailDetail'),
					name: 'PrerevAccountDetailDetail',
					meta: { title: '预收金额详情', keepAlive: true },
					hidden: true
				},
				{
					path: 'settleUnit',
					component: () => import('@/views/finance/investor/settleUnit/index'),
					name: 'SettleUnit',
					meta: { title: '结算单位', keepAlive: true, isMenu: true },
				},
				{
					path: 'overQuotaAmtDetail',
					component: () => import('@/views/finance/investor/compoents/overQuotaAmtDetail'),
					name: 'OverQuotaAmtDetail',
					meta: { title: '超额详情', keepAlive: true, isMenu: true },
				},
				{
					path: 'unpayAmtDetail',
					component: () => import('@/views/finance/investor/compoents/overQuotaAmtDetail'),
					name: 'UnpayAmtDetail',
					meta: { title: '未付金额', keepAlive: true, isMenu: true },
				},
				{
					path: 'unreceiveAmtDetail',
					component: () => import('@/views/finance/investor/compoents/overQuotaAmtDetail'),
					name: 'UnreceiveAmtDetail',
					meta: { title: '未收金额', keepAlive: true, isMenu: true },
				},
				{
					path: 'arrearAmtDetail',
					component: () => import('@/views/finance/investor/compoents/arrearAmtDetail'),
					name: 'ArrearAmtDetail',
					meta: { title: '超期详情', keepAlive: true, isMenu: true },
        },
        {
          path: 'arrearAmtOriginDetail',
          component: () => import('@/views/finance/investor/compoents/arrearAmtOriginDetail'),
          name: 'ArrearAmtOriginDetail',
          meta: { title: '超期详情', keepAlive: true, isMenu: true },
        },
			]
		},
		{
			path: 'voucher',
			component: () => import('@/views/finance/voucher'),
			name: 'Voucher',
			meta: { title: '凭证' },
			alwaysShow: true,
			children: [
				{
					path: 'voucherSetting',
					component: () => import('@/views/finance/voucher/voucherSetting'),
					name: 'VoucherSetting',
					meta: { title: '凭证设置', keepAlive: true, isMenu: true }
				},
        {
          path: 'acBookAccount',
          component: () => import('@/views/finance/voucher/acBookAccount'),
          name: 'AcBookAccount',
          meta: { title: '账套账簿', keepAlive: true, isMenu: true }
        },
				{
					path: 'voucherBusiness',
					component: () => import('@/views/finance/voucher/voucherBusiness'),
					name: 'VoucherBusiness',
					meta: { title: '业务凭证', keepAlive: true, isMenu: true }
				},
				// {
				// 	path: 'voucherManage',
				// 	component: () => import('@/views/finance/voucher/voucherManage'),
				// 	name: 'VoucherManage',
				// 	meta: { title: '凭证管理', keepAlive: true, isMenu: true }
				// },
        // {
				// 	path: 'accountBalance',
				// 	component: () => import('@/views/finance/voucher/accountBalance'),
				// 	name: 'AccountBalance',
				// 	meta: { title: '科目余额', keepAlive: true, isMenu: true }
				// },
			]
		},
		{
			path: 'finClose',
			component: () => import('@/views/finance/finClose'),
			name: 'FinClose',
			meta: { title: '关账' },
			alwaysShow: true,
			children: [
				{
					path: 'preClose',
					component: () => import('@/views/finance/finClose/preClose'),
					name: 'PreClose',
					meta: { title: '预关账', keepAlive: true, isMenu: true }
        },
        {
          path: 'totalClose',
          component: () => import('@/views/finance/finClose/totalClose'),
          name: 'TotalClose',
          meta: { title: '总关账', keepAlive: true, isMenu: true }
        },
        {
          path: 'totalCloseRecord',
          component: () => import('@/views/finance/finClose/totalClose/record'),
          name: 'TotalCloseRecord',
          meta: { title: '关账记录', },
          hidden: true
        },
        {
          path: 'totalCloseDetail',
          component: () => import('@/views/finance/finClose/totalClose/detail'),
          name: 'TotalCloseDetail',
          meta: { title: '总关账失败明细', keepAlive: true, },
          hidden: true
        },
				{
					path: 'finDate',
					component: () => import('@/views/finance/finClose/finDate'),
					name: 'FinDate',
					meta: { title: '财务日期', keepAlive: true, isMenu: true }
				},
			]
		},
    {
      path: 'compareBill',
      component: () => import('@/views/finance/compareBill'),
      name: 'CompareBill',
      meta: { title: '对账' },
      alwaysShow: true,
      children: [
        {
          path: 'compareBillBank',
          component: () => import('@/views/finance/compareBill/compareBillBank'),
          name: 'CompareBillBank',
          meta: { title: '银行账对账', keepAlive: true, isMenu: true }
        },
        {
          path: 'compareBillBankFile',
          component: () => import('@/views/finance/compareBill/compareBillBank/components/bankFileList'),
          name: 'CompareBillBankFile',
          meta: { title: '银行账单附件', keepAlive: true, isMenu: true }
        },
        {
          path: 'compareBillBankDetail',
          component: () => import('@/views/finance/compareBill/compareBillBank/components/bankFileDetail'),
          name: 'CompareBillBankDetail',
          meta: { title: '银行账单附件详情', keepAlive: true, isMenu: true }
        },
        {
          path: 'compareBillReceiveResult',
          component: () => import('@/views/finance/compareBill/compareBillBank/components/compareResult'),
          name: 'CompareBillReceiveResult',
          meta: { title: '对账详情', keepAlive: true, isMenu: true }
        },
        {
          path: 'compareBillPayResult',
          component: () => import('@/views/finance/compareBill/compareBillBank/components/compareResult'),
          name: 'CompareBillPayResult',
          meta: { title: '对账详情', keepAlive: true, isMenu: true }
        },
      ]
    },
    {
      path: 'deposit',
      component: () => import('@/views/finance/deposit'),
      name: 'Deposit',
      meta: { title: '押金' },
      alwaysShow: true,
      children: [
        {
          path: 'depositManage',
          component: () => import('@/views/finance/deposit/depositManage'),
          name: 'DepositManage',
          meta: { title: '押金管理', keepAlive: true, isMenu: true }
        },
        {
          path: 'depositApply',
          component: () => import('@/views/finance/deposit/depositManage/components/depositApply'),
          name: 'DepositApply',
          meta: { title: '押金申请', keepAlive: true }
        },
        {
          path: 'depositApplyDetail',
          component: () => import('@/views/finance/deposit/depositManage/components/depositApplyDetail'),
          name: 'DepositApplyDetail',
          meta: { title: '押金申请详情', keepAlive: true }
        },
      ]
    },
	]
}

export default financeRouter
