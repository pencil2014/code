/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'
import i18n from '@/lang'

const financeRouter = {
	path: '/finance',
	component: Layout,
	redirect: '/finance/settlement/settlementList',
	name: 'Finance',
	meta: {
		title: i18n.t('Common.finance'),
		icon: 'el-icon-finance'
	},
	children: [
		{
			path: 'otherFeeList',
			component: () => import('@/views/finance/otherFeeList/index'),
			name: 'OtherFeeList',
			meta: { title: '订单费用', icon: 'el-icon-otherFee1' },
			alwaysShow: true,
			children: [
				{
					path: 'feeClosedModifyFeeList',
					component: () => import('@/views/finance/otherFeeList/feeClosedModifyFeeList/indexTabs'),
					name: 'FeeClosedModifyFeeList',
					meta: { title: i18n.t('Finance.adjustmentApp'), keepAlive: true, isMenu: true } //activeMenu: '/finance/otherFeeList/feeClosedModifyFeeList'
				},
				{
					path: 'feeClosedModifyFeeDetail',
					component: () => import('@/views/finance/otherFeeList/feeClosedModifyFeeList/components/feeClosedModifyFeeDetail'),
					name: 'FeeClosedModifyFeeDetail',
					meta: { title: i18n.t('OrderFee.adjustmentDetail'), keepAlive: true, isUseCache: true, }, // '调费详情'
					hidden: true
				},
				{
					path: 'feeClosedModifyFeeApply',
					component: () => import('@/views/finance/orderFee/orderFee/components/components/feeClosedModifyFeeApply'),
					name: 'FeeClosedModifyFeeApply',
					meta: { title: i18n.t('OrderFee.feeClosedModifyFee'), keepAlive: true, isUseCache: true, }, // '关账调费'
					hidden: true
				},
				// {
				// 	path: 'mySpecialList',
				// 	component: () => import('@/views/finance/otherFeeList/mySpecialList'),
				// 	name: 'MySpecialList',
				// 	meta: { title: '专项管理费', keepAlive: true, isMenu: true } // activeMenu: '/finance/otherFeeList/mySpecialList'
				// },
				{
					path: 'billList',
					component: () => import('@/views/finance/bill/billList/indexTabs'),
					name: 'BillList',
					meta: { title: i18n.t('Finance.customerBill'), keepAlive: true, isMenu: true } // activeMenu: '/finance/otherFeeList/billList'
				},
				{
					path: 'billDetail',
					component: () => import('@/views/finance/orderFee/orderFee/components/billDetail'),
					name: 'BillDetail',
					meta: { title: i18n.t('Finance.billDetails'), keepAlive: true, isUseCache: true, }, // 账单详情
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
					meta: { title: i18n.t('Settle.payApply'), keepAlive: true, isUseCache: true, isUseCache: true },
					hidden: true
				},
				{
          path: 'paymentRequestDetail',
          component: () => import('@/views/finance/seaBill/seaCommerceList/components/paymentRequestDetail'),
          name: 'PaymentRequestDetail',
          meta: { title: i18n.t('Finance.settlementReq'), keepAlive: true, isUseCache: true, isUseCache: true },
          hidden: true
        },
				{
					path: 'balanceLoss',
					component: () => import('@/views/finance/seaBill/seaCommerceList/components/balanceLoss'),
					name: 'BalanceLoss',
					meta: { title: i18n.t('Finance.lossOffset'), keepAlive: true, isUseCache: true },
					hidden: true
				},
				{
					path: 'summaryBillDetail',
					component: () => import('@/views/finance/seaBill/seaCommerceList/components/summaryBillDetail'),
					name: 'SummaryBillDetail',
					meta: { title: i18n.t('Finance.monthlyData'), keepAlive: true, isUseCache: true }, // 月度数据明细
					hidden: true
        },
        {
          path: 'specailBillDetail',
          component: () => import('@/views/finance/seaBill/seaCommerceList/components/shLienMonthDetail'),
          name: 'SpecailBillDetail',
          meta: { title: i18n.t('Finance.specialMonth'), keepAlive: true, isUseCache: true }, // 特种柜月度数据
          hidden: true
        },
				{
          path: 'shLienMonthDetail',
          component: () => import('@/views/finance/seaBill/seaCommerceList/components/shLienMonthDetail'),
          name: 'ShLienMonthDetail',
          meta: { title: i18n.t('Finance.routeMonth'), keepAlive: true, isUseCache: true }, // '航线月度数据'
          hidden: true
        },
				{
					path: 'shLienSettleAuditDetail',
					component: () => import('@/views/finance/seaBill/seaCommerceList/components/shLienSettleAuditDetail'),
					name: 'ShLienSettleAuditDetail',
          meta: { title: i18n.t('Finance.auditLog'), keepAlive: true, isUseCache: true }, // '审核日志'
					hidden: true
				},
				{
					path: 'hedgeDetail',
					component: () => import('@/views/finance/seaBill/seaCommerceList/components/hedgeDetail'),
					name: 'HedgeDetail',
					meta: { title: i18n.t('Hedge.hedgDetails'), keepAlive: true, isUseCache: true }, // 对冲详情
					hidden: true
				},
				{
					path: 'confirmBillDetail',
					component: () => import('@/views/finance/seaBill/seaCommerceList/components/confirmBillDetail'),
					name: 'ConfirmBillDetail',
					meta: { title: i18n.t('Finance.confirmBill'), keepAlive: true, isUseCache: true },
					hidden: true
				},

        // 空运商务
        {
          path: 'seaCommerceListAir',
          component: () => import('@/views/finance/seaBill/seaCommerceList'),
          name: 'SeaCommerceListAir',
          meta: { title: '费用审核列表', keepAlive: true, isMenu: true } // activeMenu: '/finance/otherFeeList/seaCommerceList'
        },

				// {
				// 	path: 'settlementBillMergeList',
				// 	component: () => import('@/views/finance/settlement/settlementBillMergeList'),
				// 	name: 'SettlementBillMergeList',
				// 	meta: { title: '对账单合并', keepAlive: true, isUseCache: true, isMenu: true }
				// },
				// {
				// 	path: 'writeoffDzgMonitor',
				// 	component: () => import('@/views/finance/otherFeeList/writeoffDzgMonitor'),
				// 	name: 'WriteoffDzgMonitor',
				// 	meta: { title: '大掌柜核销', keepAlive: true, isUseCache: true, isMenu: true }
				// },
				// {
				// 	path: 'feeTemplateList',
				// 	component: () => import('@/views/finance/orderFee/feeTemplateList'),
				// 	name: 'FeeTemplateList',
				// 	meta: { title: '费用模板', keepAlive: true, isMenu: true }
				// },
				{
					path: 'addFeeTemplate',
					component: () => import('@/views/finance/orderFee/feeTemplateList/components/addFeeTemplate'),
					name: 'AddFeeTemplate',
					meta: { title: i18n.t('Finance.addfeeTem'), keepAlive: true, isUseCache: true },
					hidden: true
				},
				{
					path: 'feeTemplateDetail',
					component: () => import('@/views/finance/orderFee/feeTemplateList/components/addFeeTemplate'),
					name: 'FeeTemplateDetail',
					meta: { title: i18n.t('Finance.costTem'), keepAlive: true, isUseCache: true },
					hidden: true
				},
				// {
				// 	path: 'usaFeeCompareList',
				// 	component: () => import('@/views/finance/otherFeeList/usaFeeCompareList'),
				// 	name: 'UsaFeeCompareList',
				// 	meta: { title: '美国系统对账', keepAlive: true, isMenu: true } // activeMenu: '/finance/otherFeeList/billList'
				// },
			]
		},
		{
			path: 'settlement',
			component: () => import('@/views/finance/settlement/index'),
			name: 'Settlement',
			meta: { title: '结算单', icon: 'el-icon-settlement1' },
			alwaysShow: true,
			children: [
				{
					path: 'feeList',
					component: () => import('@/views/finance/settlement/feeList/indexTabs'),
					name: 'SettlementFeeList',
					meta: { title: i18n.t('FeeList.expensesList'), keepAlive: true, isMenu: true } // activeMenu: '/finance/settlement/feeList'
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
					meta: { title: i18n.t('Finance.statementList'), keepAlive: true, isMenu: true } // activeMenu: '/finance/settlement/settlementList'
				},
				{
					path: 'settlementDetail',
					component: () => import('@/views/finance/settlement/components/settlementDetail'),
					name: 'SettlementDetail',
					meta: { title: i18n.t('Settle.statementDet'), keepAlive: true, isUseCache: true }, // '结算单详情'
					hidden: true
        },
        {
          path: 'receiLossSettleFeeDetail',
          component: () => import('@/views/finance/settlement/components/settleFeeDetail'),
          name: 'ReceiLossSettleFeeDetail',
          meta: { title: i18n.t('PreClose.breakdown'), keepAlive: true }, // 应收冲减费用明细
          hidden: true
        },
        {
          path: 'gedgingSettleFeeDetail',
          component: () => import('@/views/finance/settlement/components/settleFeeDetail'),
          name: 'GedgingSettleFeeDetail',
          meta: { title: i18n.t('PreClose.hedgingcosts'), keepAlive: true }, //对冲费用明细 
          hidden: true
        },
				{
					path: 'createSettlement',
					component: () => import('@/views/finance/settlement/components/settlementDetail'),
					name: 'CreateSettlement',
					meta: { title: i18n.t('Settle.statementGen'), keepAlive: true, isUseCache: true }, // '结算单生成'
					hidden: true
				},
				{
					path: 'settlementBillList',
					component: () => import('@/views/finance/settlement/components/components/settlementBillList'),
					name: 'SettlementBillList',
					meta: { title: i18n.t('Finance.statementRecList'), keepAlive: true, isUseCache: true }, // 结算单对账单列表
					hidden: true
				},
				{
					path: 'settlementBillDetail',
					component: () => import('@/views/finance/settlement/components/components/settlementBillDetail'),
					name: 'SettlementBillDetail',
					meta: { title: i18n.t('Finance.statementRecDel'), keepAlive: true, isUseCache: true }, // 结算单对账单详情
					hidden: true
				},
				{
					path: 'batchBillDetail',
					component: () => import('@/views/finance/settlement/components/components/batchBillDetail'),
					name: 'BatchBillDetail',
					meta: { title: i18n.t('Finance.singleBill'), keepAlive: true, isUseCache: true }, //批量打印单票账单
					hidden: true
				},
				{
					path: 'settlementPayApply',
					component: () => import('@/views/finance/settlement/settlementList/components/settlementPayApply'),
					name: 'SettlementPayApply',
					meta: { title: i18n.t('Settle.settlementApply'), keepAlive: true, isUseCache: true, dialFullWidth: true }, // '结算付款申请'
					hidden: true
				},
				{
					path: 'finBillList',
					component: () => import('@/views/finance/finBill/finBillList'),
					name: 'FinBillList',
					meta: { title: i18n.t('Finance.expenseBill'), keepAlive: true, isMenu: true } // activeMenu: '/finance/settlement/finBillList'
				},
				{
					path: 'finBillListDetail',
					component: () => import('@/views/finance/finBill/finBillList/components/finBillDetail'),
					name: 'FinBillListDetail',
					meta: { title: i18n.t('FinBill.chargeDetails'), keepAlive: true, dialFullWidth: true }, // 费用单详情
					hidden: true
				},
				{
					path: 'finBillListAdd',
					component: () => import('@/views/finance/finBill/finBillList/components/addFinBill'),
					name: 'FinBillListAdd',
					meta: { title: i18n.t('Finance.addCost'), keepAlive: true }, // 费用单新增
					hidden: true
				}
			]
		},
		{
			path: 'gedging',
			component: () => import('@/views/finance/gedging/index'),
			name: 'Gedging',
			meta: { title: '对冲', icon: 'el-icon-hedge1' },
			alwaysShow: true,
			children: [
				{
					path: 'gedgingList',
					component: () => import('@/views/finance/gedging/gedgingList/indexTabs'),
					name: 'GedgingList',
					meta: { title: i18n.t('Finance.hedgeList'), keepAlive: true, isMenu: true } // activeMenu: '/finance/gedging/gedgingList'
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
          meta: { title: i18n.t('Hedge.hedgDetails'), keepAlive: true, isUseCache: true, }, // 对冲详情
          hidden: true
        },
        {
          path: 'gedgingPrintPage',
          component: () => import('@/views/finance/components/printPage/index'),
          name: 'GedgingPrintPage',
          meta: { title: i18n.t('Finance.hedgePrint'), keepAlive: true, isUseCache: true, }, // 对冲明细打印
          hidden: true
        },
				{
					path: 'createGedging',
					component: () => import('@/views/finance/gedging/components/gedgingDetail'),
					name: 'CreateGedging',
					meta: { title: i18n.t('Settle.createGedging'), keepAlive: true, isUseCache: true }, // 对冲申请
					hidden: true
				},
				{
					path: 'settleOrderBaddebtList',
					component: () => import('@/views/finance/otherWriteOff/settleOrderBaddebtList'),
					name: 'SettleOrderBaddebtList',
					meta: { title:  i18n.t('Charge.baddeList'), keepAlive: true, isMenu: true } // '应收冲减'
				},
				{
					path: 'badOrderDetail',
					component: () => import('@/views/finance/otherWriteOff/settleOrderBaddebtList/components/badOrderDetail'),
					name: 'BadOrderDetail',
					meta: { title: i18n.t('Charge.preSalesDetail'), keepAlive: true, }, // 提成预销单详情
					hidden: true
        },
        {
          path: 'badOrderPrintPage',
          component: () => import('@/views/finance/components/printPage/writeoffNopaySettleOrder'),
          name: 'BadOrderPrintPage',
          meta: { title: i18n.t('Finance.orderPrint'), keepAlive: true, isUseCache: true, }, // 提成预销单打印
          hidden: true
        },
				{
					path: 'badApplyDetail',
					component: () => import('@/views/finance/otherWriteOff/settleOrderBaddebtList/components/badApplyDetail'),
					name: 'BadApplyDetail',
					meta: { title: i18n.t('Finance.elimination'), keepAlive: true,}, // 冲减申请详情
					hidden: true
				},
				{
					path: 'settleOrderBadDetail',
					component: () => import('@/views/finance/otherWriteOff/settleOrderBaddebtList/components/settleOrderBadDetail'),
					name: 'SettleOrderBadDetail',
					meta: { title: i18n.t('Charge.elimide'), keepAlive: true, }, // 冲减核销详情
					hidden: true
				},
				// {
				// 	path: 'settleOrderBadApply',
				// 	component: () => import('@/views/finance/otherWriteOff/settleOrderBaddebtList/components/settleOrderBadDetail'),
				// 	name: 'SettleOrderBadApply',
				// 	meta: { title: '应收冲减申请', keepAlive: true },
				// 	hidden: true
				// },
				{
					path: 'settleOrderBadApply',
					component: () => import('@/views/finance/otherWriteOff/settleOrderBaddebtList/components/receiLossApply'),
					name: 'SettleOrderBadApply', 
					meta: { title: i18n.t('Charge.elimiAppli'), keepAlive: true }, // 应收冲减申请
					hidden: true
				},
				{
					path: 'receiLossFeeQuery',
					component: () => import('@/views/finance/otherWriteOff/settleOrderBaddebtList/components/receiLossFeeQuery'),
					name: 'ReceiLossFeeQuery',
					meta: { title: i18n.t('Charge.chargeOffInquiry'), keepAlive: true }, // 冲减费用查询
					hidden: true
				},
			]
		},
		{
			path: 'receivable',
			component: () => import('@/views/finance/receivable/index'),
			name: 'Receivable',
			meta: { title: '应收', icon: 'el-icon-receivable1' },
			alwaysShow: true,
			children: [
				{
					path: 'regWriteoff',
					component: () => import('@/views/finance/receivable/regWriteoff'),
					name: 'RegWriteoff',
					meta: { title: i18n.t('Collect.receiptReg'), keepAlive: true, isMenu: true } // activeMenu: '/finance/receivable/regWriteoff'
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
          meta: { title: i18n.t('Finance.writeoff'), keepAlive: true }, // 收款登记核销
          hidden: true
        },
        // 创建核销-只能存在一个创建页面，所以为方便记忆，使用 writeoffRecvDetail
				{
					path: 'writeoffRecvDetail',
					component: () => import('@/views/finance/receivable/reg/components/writeoffRecvDetail'),
					name: 'WriteoffRecvDetail',
					meta: { title: i18n.t('Collect.receiptWriteoff'), keepAlive: true, dialFullWidth: true }, // 收款核销
					hidden: true
        },
        // 从费用列表关联收款登记核销
        {
          path: 'writeoffRecvFromFeeDetail',
          component: () => import('@/views/finance/receivable/reg/components/writeoffRecvFromFeeDetail'),
          name: 'WriteoffRecvFromFeeDetail',
          meta: { title: i18n.t('Finance.expensewf'), keepAlive: true, dialFullWidth: true }, // 费用关联核销
          hidden: true
        },
        // 核销详情-会同时存在多个详情页，所以为方便记忆，使用 writeoffRecvDetails
				{
					path: 'writeoffRecvDetail2/:writeoffNo',
					component: () => import('@/views/finance/receivable/reg/components/writeoffRecvDetails'),
					name: 'WriteoffRecvDetail2',
					meta: {
						title: i18n.t('PreClose.collectwfDet'),
						keepAlive: true,
						// isUseCache: true
					}, //收款核销详情
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
					meta: { title: i18n.t('Collect.receiptsWf'), keepAlive: true, dialFullWidth: true }, // 预收款核销
					hidden: true
				},
				{
					path: 'regTransfer',
					component: () => import('@/views/finance/receivable/regTransfer'),
					name: 'RegTransfer',
					meta: { title: i18n.t('Finance.collectTra'), keepAlive: true, isMenu: true } // activeMenu: '/finance/receivable/regTransfer'
				},
				// {
				// 	path: 'invoiceReceivable',
				// 	component: () => import('@/views/finance/invoiceReceivable/invoiceReceivable'),
				// 	name: 'InvoiceReceivable',
				// 	meta: { title: '应收发票管理', keepAlive: true, isMenu: true, dialFullWidth: true }
				// },
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
					meta: { title: i18n.t('Finance.billReceive'), keepAlive:true }, // 应收账单详情
					hidden: true
				},
				{
					path: 'fiscalTermListSU',
					component: () => import('@/views/finance/receivable/fiscalTermList/fiscalTermList'),
					name: 'FiscalTermListSU',
					meta: { title: i18n.t('Finance.customerBill'), keepAlive: true } // 客户应收账单
				},
				{
					path: 'lateFeeReceive',
					component: () => import('@/views/finance/receivable/fiscalTermList/lateFeeReceive'),
					name: 'LateFeeReceive',
					meta: { title: i18n.t('LateFee.collectLateFee'), keepAlive: true } // 滞纳金收取
				},
				{
					path: 'lateFeeDerate',
					component: () => import('@/views/finance/receivable/fiscalTermList/lateFeeDerate'),
					name: 'LateFeeDerate',
					meta: { title: i18n.t('LateFee.derateLateFee'), keepAlive: true } // 滞纳金减免申请
				},
				{
					path: 'lateFeeDetail',
					component: () => import('@/views/finance/receivable/fiscalTermList/lateFeeDetail'),
					name: 'LateFeeDetail',
					meta: { title: i18n.t('Finance.detailslate'), keepAlive: true } // 滞纳金详情
				},
				{
					path: 'derateDetail',
					component: () => import('@/views/finance/receivable/fiscalTermList/derateDetail'),
					name: 'DerateDetail',
					meta: { title: i18n.t('Finance.reductionAppli'), keepAlive: true } // 减免申请详情
				},
			]
		},
		{
			path: 'pay',
			component: () => import('@/views/finance/pay/index'),
			name: 'Pay',
			meta: { title: '应付', icon: 'el-icon-payment1' },
			alwaysShow: true,
			children: [
				{
					path: 'payApplyList', // prepayList
					component: () => import('@/views/finance/pay/payApplyList'), // @/views/finance/pay/prepayList
					name: 'PrepayList',
					meta: { title: i18n.t('Settle.payApply'), keepAlive: true, isMenu: true, dialFullWidth: true }
				},
				{
					path: 'prepayDetail',
					component: () => import('@/views/finance/pay/prepay/detail'),
					name: 'PrepayDetail',
					meta: { title: i18n.t('PayApplyList.prepayDetail'), keepAlive: true }, // 预付款详情
					hidden: true
				},
				{
					path: 'prepayDedueDetail',
					component: () => import('@/views/finance/pay/prepay/components/PrepayDedueDetail'),
					name: 'PrepayDedueDetail',
					meta: { title: i18n.t('PayApplyList.prepayDeductDetail'), keepAlive: true }, // 预付抵账明细
					hidden: true
				},
				{
					path: 'payPrepayPrint',
					component: () => import('@/views/finance/pay/prepay/components/payPrepayPrint'),
					name: 'PayPrepayPrint',
					meta: { title: i18n.t('PayApplyList.prepayApplyOrder') + i18n.t('OrderFee.enspace') + i18n.t('PayApplyList.print'), keepAlive: true }, // '预付款申请单打印'
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
					component: () => import('@/views/finance/settlement/settlementList/components/settlementPayApply'), // component: () => import('@/views/finance/pay/settle/detail'),
					name: 'SettleDetail',
					meta: { title: i18n.t('Settle.paymentDetails'), keepAlive: true, dialFullWidth: true }, // 付款申请详情
					hidden: true
				},
				{
					path: 'writeoffPayList',
					component: () => import('@/views/finance/pay/writeoffPayList'),
					name: 'WriteoffPayList',
					meta: { title: i18n.t('Finance.paymentRec'), keepAlive: true, isMenu: true }
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
					meta: { title: i18n.t('PayApplyList.payOrder') + i18n.t('OrderFee.enspace') + i18n.t('PayApplyList.detail'), keepAlive: true }, // '付款单详情'
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
					meta: { title: i18n.t('Finance.paymentRequest'), keepAlive: true }, // 付款核销申请
					hidden: true
				},
				{
					path: 'payOrderPrint',
					component: () => import('@/views/finance/pay/order/components/payOrderPrint'),
					name: 'PayOrderPrint',
					meta: { title: i18n.t('PayApplyList.payOrder') + i18n.t('OrderFee.enspace') + i18n.t('PayApplyList.print'), keepAlive: true }, // '付款单打印'
					hidden: true
				},
				{
					path: 'payOrderFileNoPrint',
					component: () => import('@/views/finance/pay/order/components/payOrderFileNoPrint'),
					name: 'PayOrderFileNoPrint',
					meta: { title: i18n.t('PayApplyList.payOrder') + i18n.t('OrderFee.enspace') + i18n.t('PayApplyList.printAndAttach'), keepAlive: true }, // '付款单打印+附件'
					hidden: true
				},
				{
					path: 'payOrderPrints',
					component: () => import('@/views/finance/pay/order/components/payOrderPrint'),
					name: 'PayOrderPrints',
					meta: { title: i18n.t('PayApplyList.specialPrint'), keepAlive: true }, // '付款专项单打印'
					hidden: true
				},
				{
					path: 'paySettlePrint',
					component: () => import('@/views/finance/pay/settle/components/paySettlePrint'),
					name: 'PaySettlePrint',
					meta: { title: i18n.t('PayApplyList.paySettleOrder') + i18n.t('OrderFee.enspace') + i18n.t('PayApplyList.print'), keepAlive: true }, // '结算付款申请单打印'
					hidden: true
				},
				{
					path: 'paySettleFileNoPrint',
					component: () => import('@/views/finance/pay/settle/components/paySettleFileNoPrint'),
					name: 'PaySettleFileNoPrint',
					meta: { title: i18n.t('PayApplyList.paySettleOrder') + i18n.t('OrderFee.enspace') + i18n.t('PayApplyList.printAndAttach'), keepAlive: true }, // '结算付款申请单打印+附件'
					hidden: true
				},
				{
					path: 'paySettlePrints',
					component: () => import('@/views/finance/pay/settle/components/paySettlePrints'),
					name: 'PaySettlePrints',
					meta: { title: i18n.t('PayApplyList.paySettleOrderRefund') + i18n.t('OrderFee.enspace') + i18n.t('PayApplyList.print'), keepAlive: true }, // '打印专项单'
					hidden: true
				},
				{
					path: 'orderRefund',
					component: () => import('@/views/finance/pay/order/components/refund'),
					name: 'OrderRefund',
					meta: { title: i18n.t('PayApplyList.prepayRefund'), keepAlive: true }, // 预付退款
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
					meta: { title: i18n.t('Finance.underwritDet'), keepAlive: true }, // 付款核销详情
					hidden: true
				},
        // TODO 弃用，下一版本注释待测， DetailPrepay
				{
					path: 'detailPrepay',
					component: () => import('@/views/finance/pay/writeoffPay/detail/prepayDetail'),
					name: 'DetailPrepay',
					meta: { title: i18n.t('Finance.refundPayments'), keepAlive: true }, // 预付退款付款核销
					hidden: true
        },
        // TODO 弃用，下一版本注释待测， DetailSettle
				{
					path: 'detailSettle',
					component: () => import('@/views/finance/pay/writeoffPay/detail/settleDetail'),
					name: 'DetailSettle',
					meta: { title: i18n.t('Finance.settlementWf'), keepAlive: true }, // 结算付款核销
					hidden: true
				},
        // TODO 弃用，下一版本注释待测， PrepayWriteOffDetail
				{
					path: 'prepayWriteOffDetail',
					component: () => import('@/views/finance/pay/writeoffPay/detail/prepayWriteOffDetail'),
					name: 'PrepayWriteOffDetail',
					meta: { title: i18n.t('Finance.prepaidOffset'), keepAlive: true }, // 预付抵账核销
					hidden: true
				},
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
					meta: { title: i18n.t('PayApplyList.refundApplyDetail'), keepAlive: true }, // 退款申请详情
					hidden: true
				},
				{
					path: 'payRefundPrint',
					component: () => import('@/views/finance/pay/payApplyReceiveRefund/components/payRefundPrint'),
					name: 'PayRefundPrint',
					meta: { title: i18n.t('PayApplyList.refundApplyOrder') + i18n.t('OrderFee.enspace') + i18n.t('PayApplyList.print'), keepAlive: true }, // '退款申请单打印'
					hidden: true
				},
				// {
				// 	path: 'invoicePaymentList',
				// 	component: () => import('@/views/finance/invoicePayment/invoicePaymentList'),
				// 	name: 'InvoicePaymentList',
				// 	meta: { title: '应付发票管理', keepAlive: true, isMenu: true }
				// },
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
					meta: { title: i18n.t('Finance.supplierRec'), keepAlive: true, isMenu: true } // activeMenu: '/finance/otherFeeList/supplierBillList'
				},
				{
					path: 'supplierBillImport',
					component: () => import('@/views/finance/supplierBill/supplierBillList/components/importBill'),
					name: 'SupplierBillImport',
					meta: { title: i18n.t('Supplier.importSupBill'), keepAlive: true, isUseCache: true, }, // 导入供应商账单
					hidden: true
				},
				{
					path: 'supplierBillListSystem',
					component: () => import('@/views/finance/supplierBill/supplierBillList/components/systemDetail'),
					name: 'SupplierBillListSystem',
					meta: { title: i18n.t('Supplier.sysdetaildata'), keepAlive: true, isUseCache: true, }, // 系统明细数据
					hidden: true
				},
				{
					path: 'supplierBillListCheck',
					component: () => import('@/views/finance/supplierBill/supplierBillList/components/accountChecking'),
					name: 'SupplierBillListCheck',
					meta: { title: i18n.t('Supplier.reconciliation'), keepAlive: true, isUseCache: true, }, // '对账'
					hidden: true
				},
				{
					path: 'supplierBillListResult',
					component: () => import('@/views/finance/supplierBill/supplierBillList/components/diffResultSupplier'),
					name: 'SupplierBillListResult',
					meta: { title: i18n.t('Supplier.reconciResults'), keepAlive: true, isUseCache: true, }, // '对账结果'
					hidden: true
				},
				{
					path: 'supplierBillListDetail',
					component: () => import('@/views/finance/supplierBill/supplierBillList/components/supplierBillDetail'),
					name: 'SupplierBillListDetail',
					meta: { title: i18n.t('Finance.reconData'), keepAlive: true, isUseCache: true, }, // '对账数据'
					hidden: true
				},
			]
		},
		// {
		// 	path: 'accountantVoucher',
		// 	component: () => import('@/views/finance/accountantVoucher/index'),
		// 	name: 'AccountantVoucher',
		// 	meta: { title: '会计凭证' },
		// 	alwaysShow: true,
		// 	children: [
		// 		{
		// 			path: 'writeoffList',
		// 			component: () => import('@/views/finance/accountantVoucher/writeoffList/index'),
		// 			name: 'AccountantVoucherWriteoff',
		// 			meta: { title: '核销列表', keepAlive: true, isMenu: true }
    //     },
    //     {
    //       path: 'acctDocument',
    //       component: () => import('@/views/finance/accountantVoucher/acctDocument/index'),
    //       name: 'AcctDocument',
    //       meta: { title: '会计单据', keepAlive: true, isMenu: true }
    //     },
		// 		{
		// 			path: 'voucherList',
		// 			component: () => import('@/views/finance/voucher/voucherManage/index'),
		// 			name: 'VoucherList',
    //       meta: { title: '运营凭证', keepAlive: true, isMenu: true }
		// 		},
		// 		{
		// 			path: 'accountTitleBalance',
		// 			component: () => import('@/views/finance/voucher/accountBalance'),
		// 			name: 'AccountTitleBalance',
		// 			meta: { title: '科目余额', keepAlive: true, isMenu: true }
    //     },
    //     {
    //       path: 'incomeCost',
    //       component: () => import('@/views/finance/accountantVoucher/incomeCost/index'),
    //       name: 'IncomeCost',
    //       meta: { title: '收入成本', keepAlive: true, isMenu: true }
    //     },
    //     {
		// 			path: 'incomeCostDetail',
		// 			component: () => import('@/views/finance/accountantVoucher/incomeCost/tabs/shiftTabDetail'),
		// 			name: 'IncomeCostDetail',
		// 			meta: { title: '转字费用详情', keepAlive: true, },
		// 			hidden: true
		// 		},
    //     {
		// 			path: 'invoiceDetail',
		// 			component: () => import('@/views/finance/accountantVoucher/incomeCost/tabs/invoiceTabDetail'),
		// 			name: 'InvoiceDetail',
		// 			meta: { title: '转字发票详情', keepAlive: true, },
		// 			hidden: true
		// 		},
    //     {
    //       path: 'acctVoucherList',
    //       component: () => import('@/views/finance/accountantVoucher/acctVoucherList/index'),
    //       name: 'AcctVoucherList',
    //       meta: { title: '会计凭证', keepAlive: true, isMenu: true }
    //     },
		// 		{
		// 			path: 'otherAccountantFeeList',
		// 			component: () => import('@/views/finance/accountantVoucher/otherAccountantFeeList/indexTabs'),
		// 			name: 'OtherAccountantFeeList',
		// 			meta: { title: '其他费用', keepAlive: true, isMenu: true }
		// 		}
		// 	]
		// },
		// {
		// 	path: 'otherWriteOff',
		// 	component: () => import('@/views/finance/otherWriteOff/index'),
		// 	name: 'OtherWriteOff',
		// 	meta: { title: '员工扣减' },
		// 	alwaysShow: true,
		// 	children: [
		// 		{
		// 			path: 'emplAbatementList',
		// 			component: () => import('@/views/finance/emplAbatement/index'),
		// 			name: 'EmplAbatementList',
    //       meta: { title: '扣减金额', keepAlive: true, isMenu: true },
		// 		},
		// 		// {
		// 		// 	path: 'settleOrderBadDetail',
		// 		// 	component: () => import('@/views/finance/otherWriteOff/settleOrderBaddebtList/components/settleOrderBadDetail'),
		// 		// 	name: 'SettleOrderBadDetail',
		// 		// 	meta: { title: '坏账核销详情', keepAlive: true, },
		// 		// 	hidden: true
		// 		// },
		// 		// {
		// 		// 	path: 'settleOrderBadApply',
		// 		// 	component: () => import('@/views/finance/otherWriteOff/settleOrderBaddebtList/components/settleOrderBadDetail'),
		// 		// 	name: 'SettleOrderBadApply',
		// 		// 	meta: { title: '坏账申请-操作', keepAlive: true },
		// 		// 	hidden: true
		// 		// }
		// 	]
		// },
		// {
		// 	path: 'investor',
		// 	component: () => import('@/views/finance/investor/index'),
		// 	name: 'Investor',
		// 	meta: { title: '客商余额' },
		// 	alwaysShow: true,
		// 	children: [
		// 		{
		// 			path: 'investorPrepay',
		// 			component: () => import('@/views/finance/investor/prepay/index'),
		// 			name: 'InvestorPrepay',
		// 			meta: { title: '预付余额', keepAlive: true, isMenu: true }
		// 		},
		// 		{
		// 			path: 'investorPrepayDetail',
		// 			component: () => import('@/views/finance/investor/prepay/prepayDetail'),
		// 			name: 'InvestorPrepayDetail',
		// 			meta: { title: '预付详情', keepAlive: true },
		// 			hidden: true
		// 		},
		// 		{
		// 			path: 'investorPrepayDetailMore',
		// 			component: () => import('@/views/finance/investor/prepay/moreDetail'),
		// 			name: 'InvestorPrepayDetailMore',
		// 			meta: { title: '更多预付余额详情', keepAlive: true },
		// 			hidden: true
		// 		},
		// 		{
		// 			path: 'investorPrepayDetailDetail',
		// 			component: () => import('@/views/finance/investor/prepay/detailDetail'),
		// 			name: 'InvestorPrepayDetailDetail',
		// 			meta: { title: '预付金额详情', keepAlive: true },
		// 			hidden: true
		// 		},
		// 		{
		// 			path: 'prerevAccountListPage',
		// 			component: () => import('@/views/finance/investor/receivablePrerev/index'),
		// 			name: 'PrerevAccountListPage',
		// 			meta: { title: '预收余额', keepAlive: true, isMenu: true }
		// 		},
		// 		{
		// 			path: 'prerevAccountDetail',
		// 			component: () => import('@/views/finance/investor/receivablePrerev/detail'),
		// 			name: 'PrerevAccountDetail',
		// 			meta: { title: '预收详情', keepAlive: true },
		// 			hidden: true
		// 		},
		// 		{
		// 			path: 'prerevAccountDetailMore',
		// 			component: () => import('@/views/finance/investor/prepay/moreDetail'),
		// 			name: 'PrerevAccountDetailMore',
		// 			meta: { title: '更多预收余额详情', keepAlive: true },
		// 			hidden: true
		// 		},
		// 		{
		// 			path: 'prerevAccountDetailDetail',
		// 			component: () => import('@/views/finance/investor/prepay/detailDetail'),
		// 			name: 'PrerevAccountDetailDetail',
		// 			meta: { title: '预收金额详情', keepAlive: true },
		// 			hidden: true
		// 		},
		// 		{
		// 			path: 'settleUnit',
		// 			component: () => import('@/views/finance/investor/settleUnit/index'),
		// 			name: 'SettleUnit',
		// 			meta: { title: '结算单位', keepAlive: true, isMenu: true },
		// 		},
		// 		{
		// 			path: 'overQuotaAmtDetail',
		// 			component: () => import('@/views/finance/investor/compoents/overQuotaAmtDetail'),
		// 			name: 'OverQuotaAmtDetail',
		// 			meta: { title: '超额详情', keepAlive: true, isMenu: true },
		// 		},
		// 		{
		// 			path: 'unpayAmtDetail',
		// 			component: () => import('@/views/finance/investor/compoents/overQuotaAmtDetail'),
		// 			name: 'UnpayAmtDetail',
		// 			meta: { title: '未付金额', keepAlive: true, isMenu: true },
		// 		},
		// 		{
		// 			path: 'unreceiveAmtDetail',
		// 			component: () => import('@/views/finance/investor/compoents/overQuotaAmtDetail'),
		// 			name: 'UnreceiveAmtDetail',
		// 			meta: { title: '未收金额', keepAlive: true, isMenu: true },
		// 		},
		// 		{
		// 			path: 'arrearAmtDetail',
		// 			component: () => import('@/views/finance/investor/compoents/arrearAmtDetail'),
		// 			name: 'ArrearAmtDetail',
		// 			meta: { title: '超期详情', keepAlive: true, isMenu: true },
		// 		},
		// 	]
		// },
		// {
		// 	path: 'voucher',
		// 	component: () => import('@/views/finance/voucher'),
		// 	name: 'Voucher',
		// 	meta: { title: '凭证' },
		// 	alwaysShow: true,
		// 	children: [
		// 		{
		// 			path: 'voucherSetting',
		// 			component: () => import('@/views/finance/voucher/voucherSetting'),
		// 			name: 'VoucherSetting',
		// 			meta: { title: '凭证设置', keepAlive: true, isMenu: true }
		// 		},
    //     {
    //       path: 'acBookAccount',
    //       component: () => import('@/views/finance/voucher/acBookAccount'),
    //       name: 'AcBookAccount',
    //       meta: { title: '账套账簿', keepAlive: true, isMenu: true }
    //     },
		// 		{
		// 			path: 'voucherBusiness',
		// 			component: () => import('@/views/finance/voucher/voucherBusiness'),
		// 			name: 'VoucherBusiness',
		// 			meta: { title: '业务凭证', keepAlive: true, isMenu: true }
		// 		},
		// 		// {
		// 		// 	path: 'voucherManage',
		// 		// 	component: () => import('@/views/finance/voucher/voucherManage'),
		// 		// 	name: 'VoucherManage',
		// 		// 	meta: { title: '凭证管理', keepAlive: true, isMenu: true }
		// 		// },
    //     // {
		// 		// 	path: 'accountBalance',
		// 		// 	component: () => import('@/views/finance/voucher/accountBalance'),
		// 		// 	name: 'AccountBalance',
		// 		// 	meta: { title: '科目余额', keepAlive: true, isMenu: true }
		// 		// },
		// 	]
		// },
		{
			path: 'finClose',
			component: () => import('@/views/finance/finClose'),
			name: 'FinClose',
			meta: { title: '关账', icon: 'el-icon-accountClose1' },
			alwaysShow: true,
			children: [
				{
					path: 'preClose',
					component: () => import('@/views/finance/finClose/preClose'),
					name: 'PreClose',
					meta: { title: i18n.t('OrderFee.preclose'), keepAlive: true, isMenu: true }
        },
        // {
        //   path: 'totalClose',
        //   component: () => import('@/views/finance/finClose/totalClose'),
        //   name: 'TotalClose',
        //   meta: { title: '总关账', keepAlive: true, isMenu: true }
        // },
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
				// {
				// 	path: 'finDate',
				// 	component: () => import('@/views/finance/finClose/finDate'),
				// 	name: 'FinDate',
				// 	meta: { title: '财务日期', keepAlive: true, isMenu: true }
				// },
			]
		},
		{
			path: 'finGeneral',
			component: () => import('@/views/finance/finGeneral'),
			name: 'FinGeneral',
			meta: { title: i18n.t('OrderFee.finGeneral') },
			hidden: true,
			children: [
				{
					path: 'finWelcome',
					component: () => import('@/views/finance/finGeneral/finWelcome'),
					name: 'FinWelcome',
					meta: { title: i18n.t('OrderFee.finWelcome'), keepAlive: true, isMenu: false }, // activeMenu: '/finance/settlement/feeList'
					hidden: true
				},
			]
		},
    // {
    //   path: 'compareBill',
    //   component: () => import('@/views/finance/compareBill'),
    //   name: 'CompareBill',
    //   meta: { title: '对账' },
    //   alwaysShow: true,
    //   children: [
    //     {
    //       path: 'compareBillBank',
    //       component: () => import('@/views/finance/compareBill/compareBillBank'),
    //       name: 'CompareBillBank',
    //       meta: { title: '银行账对账', keepAlive: true, isMenu: true }
    //     },
    //     {
    //       path: 'compareBillBankFile',
    //       component: () => import('@/views/finance/compareBill/compareBillBank/components/bankFileList'),
    //       name: 'CompareBillBankFile',
    //       meta: { title: '银行账单附件', keepAlive: true, isMenu: true }
    //     },
    //     {
    //       path: 'compareBillBankDetail',
    //       component: () => import('@/views/finance/compareBill/compareBillBank/components/bankFileDetail'),
    //       name: 'CompareBillBankDetail',
    //       meta: { title: '银行账单附件详情', keepAlive: true, isMenu: true }
    //     },
    //     {
    //       path: 'compareBillReceiveResult',
    //       component: () => import('@/views/finance/compareBill/compareBillBank/components/compareResult'),
    //       name: 'CompareBillReceiveResult',
    //       meta: { title: '对账详情', keepAlive: true, isMenu: true }
    //     },
    //     {
    //       path: 'compareBillPayResult',
    //       component: () => import('@/views/finance/compareBill/compareBillBank/components/compareResult'),
    //       name: 'CompareBillPayResult',
    //       meta: { title: '对账详情', keepAlive: true, isMenu: true }
    //     },
    //   ]
		// },
	]
}

export default financeRouter
