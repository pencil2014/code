import axios from 'axios'
import { parseTime, randomString } from '@/utils'
import { getToken } from '@/utils/auth'
import { Message } from 'element-ui'
import { decimalFixed2 } from '@/views/finance/utils/finance'
import i18n from '@/lang'
import lang from '@/lang/language'

const columns = {
	// 默认表头
	defaultColumns: ['settleCompName', 'feeName', 'feeEnName', 'serviceName', 'settleCorpName', 'feeUnit', 'unitCount', 'unitPrice',
		'feeAmt', 'currency', 'taxRate', 'negativeType', 'negativeFollowerId', 'agentCompName', 'jointStatus', 'jointDeptName', 'taxAmt', 'feeAmtWithoutTax', 'remark', 'cnyExRate', 'cnyMoneyAmt', 'usdExRate', 'usdMoneyAmt', 'reviseStatus',
		'confirmStatus', 'finDate', 'precloseStatus', 'precloseTime', 'closeStatus', 'closeTime', 'settleLock', 'lockReason', 'settleCycle',
		'settleStatus', 'settleOrderNos', 'settleAmt', 'settleTimes', 'isIssueInvoice', 'invoiceStatus', 'invoiceNos', 'invoiceAmt', 'notInvoiceAmt',
		'gedgingStatus', 'writeoffStatus', 'gedgingWriteoffAmt', 'badAmt', 'payApplySettleNos', 'payOrderNos', 'writeoffNos', 'totalWriteoffAmt', 'notWriteoffAmt', 'createdName',
    'createdTime', 'confirmName', 'confirmTime', 'receivePayDates', 'shipCarrierOrderNo', 'whPoNo'],
	defaultColumnsRecei: ['settleCompName', 'feeName', 'feeEnName', 'serviceName', 'settleCorpName', 'feeUnit', 'unitCount', 'unitPrice',
		'feeAmt', 'currency', 'blId', 'negativeType', 'splitFromOrderNo', 'negativeFollowerId', 'taxRate', 'agentCompName', 'jointStatus', 'jointDeptName', 'jointToOrderNo', 'taxAmt', 'feeAmtWithoutTax', 'remark', 'cnyExRate', 'cnyMoneyAmt', 'usdExRate', 'usdMoneyAmt', 'reviseStatus',
		'confirmStatus', 'finDate', 'precloseStatus', 'precloseTime', 'closeStatus', 'closeTime', 'settleLock', 'lockReason', 'settleCycle',
		'settleStatus', 'settleOrderNos', 'settleAmt', 'settleTimes', 'isIssueInvoice', 'invoiceStatus', 'invoiceNos', 'invoiceAmt', 'notInvoiceAmt',
		'gedgingStatus', 'writeoffStatus', 'gedgingWriteoffAmt', 'badAmt', 'writeoffNos', 'totalWriteoffAmt', 'notWriteoffAmt', 'createdName',
		'createdTime', 'confirmName', 'confirmTime', 'receivePayDates', 'bizDate'],
	defaultColumnsPay: ['settleCompName', 'feeName', 'feeEnName', 'serviceName', 'settleCorpName', 'feeUnit', 'unitCount', 'unitPrice',
		'feeAmt', 'currency', 'taxRate', 'negativeType', 'negativeFollowerId', 'agentCompName', 'jointStatus', 'jointDeptName', 'jointToOrderNo', 'taxAmt', 'feeAmtWithoutTax', 'remark', 'cnyExRate', 'cnyMoneyAmt', 'usdExRate', 'usdMoneyAmt', 'reviseStatus',
		'confirmStatus', 'finDate', 'precloseStatus', 'precloseTime', 'closeStatus', 'closeTime', 'settleLock', 'lockReason', 'settleCycle',
		'settleStatus', 'settleOrderNos', 'settleAmt', 'settleTimes', 'isIssueInvoice', 'invoiceStatus', 'invoiceNos', 'invoiceAmt', 'notInvoiceAmt',
		'gedgingStatus', 'writeoffStatus', 'gedgingWriteoffAmt', 'badAmt', 'payApplySettleNos', 'payOrderNos', 'writeoffNos', 'totalWriteoffAmt', 'notWriteoffAmt', 'createdName',
		'createdTime', 'confirmName', 'confirmTime', 'receivePayDates', 'bizDate'],
	defaultColumnsSU: ['settleCompName', 'settleCorpName', 'currency', 'feeAmt', 'cnyMoneyAmt', 'usdMoneyAmt', 'settleCycle', 'settleStatus', 'settleOrderNos', 
		'unSettleAmt', 'settleAmt', 'invoiceStatus', 'notInvoiceAmt', 'invoiceAmt', 'gedgingStatus', 'gedgingWriteoffAmt', 'badAmt', 'writeoffStatus',
		'writeoffNos', 'totalWriteoffAmt', 'notWriteoffAmt'],
	// 费用列表默认表头
	defaultColumnsFeeList: ['sourceBizNo', 'feeName', 'feeEnName', 'serviceName', 'finGroup', 'settleCorpName', 'receipayType', 'settleCompName', 'agentCompName', 'currency', 'feeAmt', 'feeUnit', 'unitCount', 'unitPrice',
		'taxRate', 'taxAmt', 'feeAmtWithoutTax', 'confirmStatus', 'reviseStatus', 'jointStatus', 'cnyExRate', 'cnyMoneyAmt', 'usdExRate', 'usdMoneyAmt', 'finDate', 'precloseStatus', 'intraStatus', 'precloseTime', 'closeStatus', 'closeTime', 'settleLock', 'settleCycle',
		'settleStatus', 'settleOrderNos', 'settleAmt', 'settleTimes', 'settleApplyAmt', 'canSettleApplyAmt', 'isIssueInvoice', 'invoiceStatus', 'invoiceNos', 'invoiceAmt', 'notInvoiceAmt',
		'gedgingStatus', 'writeoffStatus', 'gedgingWriteoffAmt', 'badAmt', 'payApplySettleNos', 'payOrderNos', 'writeoffNos', 'totalWriteoffAmt', 'notWriteoffAmt', 'acctVoucherNos', 'transferAcctVoucherNos', 'remark', 'createdName',
    'createdTime', 'confirmName', 'confirmTime', 'settleCorpType', 'settleCorpSubType', 'custName', 'bdEmployeeName', 'opEmployeeName', 'obdEmployeeName', 'bkgAgentSupplierName', 'serviceType', 'businessType', 'shipCarrierCode', 'jointToOrderNo', 'jointDeptName', 'jointStatus',
    'hbls', 'mbls', 'soNos', 'containerNos', 'polPortName', 'podPortName', 'pricingEmployeeName', 'sysLineName', 'createdByDeptName', 'containerInfo', 'amountTReal', 'remark', 'bdDeptName', 'etdTime', 'etaTime', 'atdTime', 'ataTime', 'bizDate', 'receivePayDates'
    , 'negativeFollowerName', 'splitFromOrderNo', 'negativeType', 'custIntrustNo', 'vesselVoyage', 'lockReason', 'settleOrderStatus', 'billNo', 'dnNo', 'podCountryCname', 'bargeEtdTime', 'bargeAtdTime', 'invoiceDate', 'shipCarrierOrderNo', 'whPoNo', 'writeOffDate',
    'signStatus', 'signDate', 'acfinDate', 'acfinCloseStatus', 'transferExVoucherNos', 'exVoucherNos', 'usdInterest', 'confirmLateFeeAmt', 'exportOrderNo'
	],
	defaultColumnsFeeListSU: [
		'settleCompName', 'sourceBizNo', 'businessType', 'bizDate', 'settleCorpName', 'settleCorpType', 'receiveSettleStatus', 'paySettleStatus',
		'noReceiveUsdAmt', 'noReceiveCnyAmt', 'noReceiveHkdAmt', 'noReceiveEurAmt', 'noReceiveGbpAmt', 'noReceiveVndAmt', 'noReceiveMxnAmt',
		'noPayUsdAmt', 'noPayCnyAmt', 'noPayHkdAmt', 'noPayEurAmt', 'noPayGbpAmt', 'noPayVndAmt', 'noPayMxnAmt', 'receiveUsdAmt', 'receiveCnyAmt',
		'receiveHkdAmt', 'receiveEurAmt', 'receiveGbpAmt', 'receiveVndAmt', 'receiveMxnAmt', 'payUsdAmt', 'payCnyAmt', 'payHkdAmt', 'payEurAmt',
		'payGbpAmt', 'payVndAmt', 'payMxnAmt', 'writeoffReceiveUsdAmt', 'writeoffReceiveCnyAmt', 'writeoffReceiveHkdAmt', 'writeoffReceiveEurAmt',
		'writeoffReceiveGbpAmt', 'writeoffReceiveVndAmt', 'writeoffReceiveMxnAmt', 'writeoffPayUsdAmt', 'writeoffPayCnyAmt', 'writeoffPayHkdAmt',
		'writeoffPayEurAmt', 'writeoffPayGbpAmt', 'writeoffPayVndAmt', 'writeoffPayMxnAmt', 'noInvoiceReceiveUsdAmt', 'noInvoiceReceiveCnyAmt',
		'noInvoiceReceiveHkdAmt', 'noInvoiceReceiveEurAmt', 'noInvoiceReceiveGbpAmt', 'noInvoiceReceiveVndAmt', 'noInvoiceReceiveMxnAmt',
		'noInvoicePayUsdAmt', 'noInvoicePayCnyAmt', 'noInvoicePayHkdAmt', 'noInvoicePayEurAmt', 'noInvoicePayGbpAmt', 'noInvoicePayVndAmt',
		'noInvoicePayMxnAmt', 'receiveInvocieNos', 'payInvocieNos', 'custIntrustNo', 'bdEmployeeName', 'bdDeptName', 'opEmployeeName',
		'pricingEmployeeName', 'mbls', 'hbls', 'containerNos', 'soNos', 'serviceType', 'serviceName', 'bkgAgentSupplierName',
		'shipCarrierCode', 'custName', 'vesselVoyage', 'sysLineName', 'polPortName', 'podPortName', 'containerInfo', 'amountTReal', 'etdTime',
    'etaTime', 'atdTime', 'ataTime', 'leatestReceiveDate', 'orderStatus', 'closeStatus', 'bargeEtdTime', 'bargeAtdTime', 'whPoNo'
	],
	// 委托单位 custName,consignerCode”“业务员 bdEmployeeName”“订舱代理 bkgAgentSupplierName”“业务类型businessType”"船/航司 shipCarrierCode”“协同单号jointToOrderNo”“协同部门jointDeptName”“是否协同费用 jointStatus”
	// // 自定义表头特殊处理的字段
	// specialColumns: {
	//   polPortCode: ['polPortCode', 'polPortEname','polPortCname'],
	//   // transitPortCode: ['polCode','polEname','polCname','podCode','podEname','podCname'],
	//   podPortCode: ['podPortCode', 'podPortEname', 'podPortCname'],
	// },

	// 表头库
  columnsBase: [
    { prop: 'whPoNo', label: i18n.t('FeeList.whPoNo'), type: 'text', key: 'whPoNo', width: 128 },
    { prop: 'shipCarrierOrderNo', label: i18n.t('FeeList.shipCarrierOrderNo'), type: 'text', key: 'shipCarrierOrderNo', width: 140 },
		{ prop: 'settleCompName', label: i18n.t('OrderFee.settleCompName'), type: 'text', key: 'settleCompName', width: 160 },
		{ prop: 'jointDeptName', label: i18n.t('OrderFee.jointDeptName'), type: 'text', key: 'jointDeptName', width: 190 },
		{ prop: 'jointToOrderNo', label: i18n.t('OrderFee.jointToOrderNo'), type: 'text', key: 'jointToOrderNo', width: 148 },
		// { prop: 'feeName', label: i18n.t('OrderFee.feeName'), type: 'input', key: 'feeName', width: 130, disabled: true },
		{ prop: 'feeCode', label: i18n.t('OrderFee.feeCode'), type: 'input', key: 'feeCode', width: 130 },
		{ prop: 'feeEnName', label: i18n.t('FeeList.feeEname'), type: 'text', key: 'feeEnName', width: 140 },
		{ prop: 'serviceName', label: i18n.t('OrderFee.serviceName'), type: 'input', key: 'serviceName', width: 120, }, // disabled: true
		// { prop: 'serviceCode', label: '服务项', type: 'input', key: 'serviceCode', width: 100, }, // 勿添加，会使自定义表头出错
		{ prop: 'settleCorpName', label: i18n.t('OrderFee.settleCorpName'), type: 'input', width: 190, key: 'settleCorpName', disabled: true },
		{ prop: 'settleCorpCode', label: i18n.t('OrderFee.settleCorpCode'), type: 'input', width: 190, key: 'settleCorpCode', disabled: true },
		{ prop: 'feeUnit', label: i18n.t('OrderFee.feeUnit'), type: 'select', key: 'feeUnit', disabled: true, width: 110 },
		{ prop: 'unitCount', label: i18n.t('OrderFee.unitCount'), type: 'input', key: 'unitCount', width: 94, disabled: true },
		{ prop: 'unitPrice', label: i18n.t('OrderFee.unitPrice'), type: 'input', key: 'unitPrice', width: 100, disabled: true },
		{ prop: 'feeAmt', label: i18n.t('OrderFee.feeAmt'), type: 'input', key: 'feeAmt', disabled: true },
		{ prop: 'currency', label: i18n.t('OrderFee.currency'), type: 'select', key: 'currency', width: 100, propInDict: 'validCurrencyNR', filterable: true, disabled: true },
		// {prop: 'prepayType', label: '到付/预付', type: 'select', key: 'prepayType'},
		// { prop: 'taxRate', label: i18n.t('FeeList.taxRate'), type: 'text', key: 'taxRate', width: 70, disabled: true, formatter1: (row, pItem) => { if (row.taxRate) { return Number(row.taxRate) * 100 + '%' } else { return row.taxRate } }, formatter: ({ cellValue }) => { if (cellValue) { return (new LSnum(cellValue)).times(100) + '%' } else { return cellValue } } },
    // { prop: 'taxAmt', label: i18n.t('FeeList.taxAmt'), type: 'text', key: 'taxAmt', width: 80 },
		// { prop: 'feeAmtWithoutTax', label: i18n.t('FeeList.feeAmtWithoutTax'), type: 'text', key: 'feeAmtWithoutTax', width: 100 },
		{ prop: 'remark', label: i18n.t('OrderFee.feeRemark'), type: 'input', key: 'remark', width: 260 },
		// { prop: 'acctExRate', label: '折合CNY汇率', type: 'text', key: 'acctExRate', width: 110, formatter: ({ row }) => { return row.cnyExRate } }, // 去掉
		{ prop: 'cnyExRate', label: i18n.t('OrderFee.cnyExRate'), type: 'text', key: 'cnyExRate', width: 220 },
		// { prop: 'basicMoneyAmt', label: '折合CNY金额', type: 'text', key: 'basicMoneyAmt', width: 110, formatter: ({ row }) => { return row.cnyMoneyAmt } }, // 去掉
		{ prop: 'cnyMoneyAmt', label: i18n.t('OrderFee.cnyMoneyAmt'), type: 'text', key: 'cnyMoneyAmt', width: 180 },
		{ prop: 'usdExRate', label: i18n.t('OrderFee.usdExRate'), type: 'text', key: 'usdExRate', width: 220 },
		{ prop: 'usdMoneyAmt', label: i18n.t('OrderFee.usdMoneyAmt'), type: 'text', key: 'usdMoneyAmt', width: 180 },
    { prop: 'reviseStatus', label: i18n.t('OrderFee.reviseStatus'), type: 'text', key: 'reviseStatus', width: 140, propInDict: 'feeReviseStatus', isForceSelect: true},
    // { prop: 'reviseStatus', label: '是否调账', type: 'text', key: 'reviseStatus', width: 100, formatter1: (row, pItem) => { if (row[pItem.prop] === 'yes') { return i18n.t('Common.yes') } else if (row[pItem.prop] === 'no') { return i18n.t('Common.no') } }, formatter: ({ cellValue }) => { if (cellValue === 'yes') { return i18n.t('Common.yes') } else if (cellValue === 'no') { return i18n.t('Common.no') } } },
    { prop: 'confirmStatus', label: i18n.t('OrderFee.confirmStatus'), type: 'text', key: 'confirmStatus', width: 130, propInDict: 'yesNo', isForceSelect: true }, // , formatter: ({ cellValue }) => { return cellValue === 'yes' ? '<span style="color:#33B18A;">是</span>' : cellValue === 'no' ? '<span style="color:#CD4130;">否</span>' : cellValue }
    // { prop: 'confirmStatus', label: '是否确认', type: 'text', key: 'confirmStatus', width: 80, formatter1: (row, pItem) => { if (row[pItem.prop] === 'yes') { return i18n.t('Common.yes') } else if (row[pItem.prop] === 'no') { return i18n.t('Common.no') } else { return row[pItem.prop] } }, formatter: ({ cellValue }) => { if (cellValue === 'yes') { return i18n.t('Common.yes') } else if (cellValue === 'no') { return i18n.t('Common.no') } else { return cellValue } } },
		{ prop: 'finDate', label: i18n.t('OrderFee.finDate'), type: 'text', key: 'finDate', width: 130 },
    { prop: 'precloseStatus', label: i18n.t('OrderFee.precloseStatus'), type: 'text', key: 'precloseStatus', propInDict: 'yesNo', width: 135, isForceSelect: true},
    // { prop: 'precloseStatus', label: '预关账状态', type: 'text', key: 'precloseStatus', width: 100, formatter1: (row, pItem) => { if (row[pItem.prop] === 'yes') { return i18n.t('Common.yes') } else if (row[pItem.prop] === 'no') { return i18n.t('Common.no') } }, formatter: ({ cellValue }) => { if (cellValue === 'yes') { return i18n.t('Common.yes') } else if (cellValue === 'no') { return i18n.t('Common.no') } } },
    { prop: 'intraStatus', label: i18n.t('FeeList.intraStatus'), type: 'text', key: 'intraStatus', width: 120, propInDict: 'yesNo', isForceSelect: true},
    // { prop: 'intraStatus', label: '是否内部往来', type: 'text', key: 'intraStatus', width: 120, formatter1: (row, pItem) => { if (row[pItem.prop] === 'yes') { return i18n.t('Common.yes') } else if (row[pItem.prop] === 'no') { return i18n.t('Common.no') } }, formatter: ({ cellValue }) => { if (cellValue === 'yes') { return i18n.t('Common.yes') } else if (cellValue === 'no') { return i18n.t('Common.no') } } },
    { prop: 'jointStatus', label: i18n.t('OrderFee.jointStatus'), type: 'text', key: 'jointStatus', width: 152, propInDict: 'yesNo', isForceSelect: true },
    // { prop: 'jointStatus', label: '是否协同', type: 'text', key: 'jointStatus', width: 100, formatter1: (row, pItem) => { if (row[pItem.prop] === 'yes') { return i18n.t('Common.yes') } else if (row[pItem.prop] === 'no') { return i18n.t('Common.no') } }, formatter: ({ cellValue }) => { if (cellValue === 'yes') { return i18n.t('Common.yes') } else if (cellValue === 'no') { return i18n.t('Common.no') } } },
		{ prop: 'precloseTime', label: i18n.t('OrderFee.precloseTime'), type: 'text', key: 'precloseTime', width: 125 },
    { prop: 'closeStatus', label: i18n.t('OrderFee.closeStatus'), type: 'text', key: 'closeStatus', width: 120, propInDict: 'yesNo', isForceSelect: true, propInDict: 'yesNo' }, // , formatter: ({ cellValue }) => { return cellValue === 'yes' ? '<span style="color:#33B18A;">是</span>' : cellValue === 'no' ? '<span style="color:#CD4130;">否</span>' : cellValue }
    // { prop: 'closeStatus', label: '关账状态', type: 'text', key: 'closeStatus', width: 100, formatter1: (row, pItem) => { if (row[pItem.prop] === 'yes') { return i18n.t('Common.yes') } else if (row[pItem.prop] === 'no') { return i18n.t('Common.no') } }, formatter: ({ cellValue }) => { if (cellValue === 'yes') { return i18n.t('Common.yes') } else if (cellValue === 'no') { return i18n.t('Common.no') } } },
		{ prop: 'closeTime', label: i18n.t('FeeList.closeTime'), type: 'text', key: 'closeTime', width: 125 },
    { prop: 'settleLock', label: i18n.t('OrderFee.settleLock'), type: 'text', key: 'settleLock', width: 140, propInDict: 'finLockStatus', isForceSelect: true },
    // { prop: 'settleLock', label: '是否结算锁定', type: 'text', key: 'settleLock', width: 120, formatter1: (row, pItem) => { if (row[pItem.prop] === 'lock') { return '锁定' } else if (row[pItem.prop] === 'unlock') { return '未锁定' } }, formatter: ({ cellValue }) => { if (cellValue === 'lock') { return '锁定' } else if (cellValue === 'unlock') { return '未锁定' } } },
		// { prop: 'lockReason', label: '结算锁定原因', type: 'tooltip', key: 'lockReason', width: 120 },
		{ prop: 'settleCycle', label: i18n.t('OrderFee.settleCycle'), type: 'select', key: 'settleCycle', width: 150 },
		{ prop: 'settleStatus', label: i18n.t('OrderFee.settleStatus'), type: 'select', key: 'settleStatus', width: 140, propInDict: 'feeSettleStatus' },
		{ prop: 'settleOrderNos', label: i18n.t('OrderFee.settleOrderNos'), type: 'text', key: 'settleOrderNos', width: 190 },
		{ prop: 'settleOrderNo', label: i18n.t('OrderFee.settleOrderNo'), type: 'text', key: 'settleOrderNo', width: 125 },
		{ prop: 'settleAmt', label: i18n.t('OrderFee.settleAmt'), type: 'text', key: 'settleAmt', width: 150 },
		{ prop: 'unSettleAmt', label: i18n.t('Settle.unsettledAmt'), type: 'text', key: 'unSettleAmt', width: 100, formatter: ({ row }) => { return row.feeAmt - row.settleAmt } },		
		// {prop: 'settleCloseTime', label: '结算时间-删', type: 'text', key: 'settleCloseTime', width: 125},
		{ prop: 'settleTimes', label: i18n.t('OrderFee.settleTimes'), type: 'text', key: 'settleTimes', width: 125 },
		// { prop: 'isIssueInvoice', label: i18n.t('FeeList.isIssueInvoice'), type: 'text', key: 'isIssueInvoice', width: 100, formatter1: (row, pItem) => { if (row[pItem.prop] === 'yes') { return i18n.t('Common.yes') } else if (row[pItem.prop] === 'no') { return i18n.t('Common.no') } }, formatter: ({ cellValue }) => { if (cellValue === 'yes') { return i18n.t('Common.yes') } else if (cellValue === 'no') { return i18n.t('Common.no') } } },
		// { prop: 'invoiceStatus', label: i18n.t('FeeList.invoiceStatuss'), type: 'select', key: 'invoiceStatus', propInDict: 'feeInvoiceStatus', width: 100 },
		// { prop: 'invoiceNos', label: i18n.t('FeeList.invoiceNo'), type: 'text', key: 'invoiceNos', width: 125 },
		// { prop: 'invoiceAmt', label: i18n.t('Collect.invoicedAmt'), type: 'text', key: 'invoiceAmt', width: 100 },
		// {prop: 'invoiceReplenishAmt', label: '未开票金额-删', type: 'text', key: 'invoiceReplenishAmt', width: 120},
		// { prop: 'notInvoiceAmt', label: i18n.t('Collect.uninvoicedAmount'), type: 'text', key: 'notInvoiceAmt', width: 100 },
		{ prop: 'gedgingStatus', label: i18n.t('OrderFee.gedgingStatus'), type: 'text', key: 'gedgingStatus', width: 120, formatter1: (row, pItem) => { if (row[pItem.prop] === 'yes') { return i18n.t('Common.yes') } else if (row[pItem.prop] === 'no') { return i18n.t('Common.no') } }, formatter: ({ cellValue }) => { if (cellValue === 'yes') { return i18n.t('Common.yes') } else if (cellValue === 'no') { return i18n.t('Common.no') } } },
		{ prop: 'writeoffStatus', label: i18n.t('OrderFee.writeoffStatus'), type: 'select', key: 'writeoffStatus', width: 140, propInDict: 'writeoffStatus' },
		{ prop: 'gedgingWriteoffAmt', label: i18n.t('OrderFee.gedgingWriteoffAmt'), type: 'text', key: 'gedgingWriteoffAmt', width: 120 },
		{ prop: 'badAmt', label: i18n.t('OrderFee.badAmt'), type: 'text', key: 'badAmt', width: 144 }, // '坏账金额'
		{ prop: 'payApplySettleNos', label: i18n.t('OrderFee.payApplySettleNos'), type: 'text', key: 'payApplySettleNos', width: 146 },
		{ prop: 'payOrderNos', label: i18n.t('OrderFee.payOrderNos'), type: 'text', key: 'payOrderNos', width: 144 },
		{ prop: 'writeoffNos', label: i18n.t('OrderFee.writeoffNos'), type: 'text', key: 'writeoffNos', width: 125 },
		{ prop: 'totalWriteoffAmt', label: i18n.t('OrderFee.totalWriteoffAmt'), type: 'text', key: 'totalWriteoffAmt', width: 140 },
		{ prop: 'notWriteoffAmt', label: i18n.t('OrderFee.notWriteoffAmt'), type: 'text', key: 'notWriteoffAmt', width: 160 },
    { prop: 'transferAcctVoucherNos', label: i18n.t('FeeList.transferAcctVoucherNos'), type: 'text', key: 'transferAcctVoucherNos', width: 70 },
    { prop: 'acctVoucherNos', label: i18n.t('Hedge.voucherNumber'), type: 'text', key: 'acctVoucherNos', width: 125 }, // 在订单费用显示为“凭证号”，在费用列表显示为“实收付凭证号”
		{ prop: 'createdName', label: i18n.t('OrderFee.createdName'), type: 'text', key: 'createdName', width: 125 },
		{ prop: 'createdTime', label: i18n.t('OrderFee.createdTime'), type: 'text', key: 'createdTime', width: 125 },
		{ prop: 'confirmName', label: i18n.t('OrderFee.confirmName'), type: 'text', key: 'confirmName', width: 125 },
		{ prop: 'confirmTime', label: i18n.t('OrderFee.confirmTime'), type: 'text', key: 'confirmTime', width: 125 },
		// {prop: 'invoiceApplyAmt', label: '发票申请金额', type: 'text', key: 'invoiceApplyAmt', width: 100},
		// {prop: 'isWithTax', label: '是否单价含税', type: 'text', key: 'isWithTax', width: 100, formatter1: (row, pItem) => {if (row[pItem.prop] === 'yes') {return i18n.t('Common.yes')} else if (row[pItem.prop] === 'no') {return i18n.t('Common.no')}}},
		// {prop: 'settleApplyAmt', label: '已申请结算金额', type: 'text', key: 'settleApplyAmt', width: 105},
		// {prop: 'gedgingApplyAmt', label: '对冲申请金额', type: 'text', key: 'gedgingApplyAmt'}, // hideInCustomColumns: true
		// {prop: 'transAcctVoucherNo', label: '转字凭证号', type: 'text', key: 'transAcctVoucherNo'},
    { prop: 'receipayType', label: i18n.t('FeeList.receipayType'), type: 'select', key: 'receipayType', propInDict: 'receipayGroup', width: 160  },
		// {prop: 'orderNo', label: '订单号', type: 'text', key: 'orderNo', width: 120}, // 另外增加几个prop，用于mixin的validate函数
    { prop: 'reason', label: i18n.t('Common.reason'), type: 'text', key: 'reason', width: 125 },
		// {prop: 'frontIndex', label: '序号', type: 'text', key: 'frontIndex', width: 34},
    { prop: 'sourceBizNo', label: i18n.t('PreClose.bizNo'), type: 'text', key: 'sourceBizNo', width: 125 },
    { prop: 'hbls', label: i18n.t('FeeList.hbl'), type: 'text', key: 'hbls', width: 125 },
    { prop: 'mbls', label: i18n.t('FeeList.mbl'), type: 'text', key: 'mbls', width: 125 },
    { prop: 'soNos', label: i18n.t('FeeList.soNo'), type: 'text', key: 'soNos', width: 125 },
    { prop: 'containerNos', label: i18n.t('FeeList.containerNo'), type: 'text', key: 'containerNos', width: 125 },
		{ prop: 'finGroup', label: i18n.t('FeeList.finGroup'), type: 'select', key: 'finGroup', width: 125, propInDict: 'feeitemFinGroup' },
		{ prop: 'agentCompName', label: i18n.t('OrderFee.agentCompName'), type: 'text', key: 'agentCompName', width: 240 },
		{ prop: 'settleCorpType', label: i18n.t('OrderFee.settleCorpType'), type: 'select', key: 'settleCorpType', width: 128, propInDict: 'unitType', multi: true, },
    { prop: 'settleCorpSubType', label: i18n.t('OrderFee.settleCorpSubType'), type: 'select', key: 'settleCorpSubType', width: 128, propInDict: 'settleUnitSubType', multi: true, noDict: true},
		// {prop: 'orderFeeId', label: '订单费用Id', key: 'orderFeeId'}, // hideInCustomColumns: true
		// {prop: 'intraStatus', label: '内部来往标识', type: 'text', key: 'intraStatus', formatter1: (row, pItem) => {if (row[pItem.prop] === 'yes') {return i18n.t('Common.yes')} else if (row[pItem.prop] === 'no') {return i18n.t('Common.no')}}}, // hideInCustomColumns: true
		// {prop: 'jointStatus', label: '协同标识', type: 'text', key: 'jointStatus', formatter1: (row, pItem) => {if (row[pItem.prop] === 'yes') {return i18n.t('Common.yes')} else if (row[pItem.prop] === 'no') {return i18n.t('Common.no')}}}, // hideInCustomColumns: true
		// 委托单位 custName,consignerCode”“业务员 bdEmployeeName”“订舱代理 bkgAgentSupplierName”“业务类型businessType”"船/航司 shipCarrierCode”“协同单号jointToOrderNo”“协同部门jointDeptName”“是否协同费用 jointStatus”
    { prop: 'custName', label: i18n.t('FeeList.custId'), type: 'text', key: 'custName', width: 150 },
		{ prop: 'bdEmployeeName', label: i18n.t('FeeList.bdEmployeeId'), type: 'text', key: 'bdEmployeeName', width: 125 },
		{ prop: 'opEmployeeName', label:  i18n.t('FeeList.opEmployeeId'), type: 'text', key: 'opEmployeeName', width: 125 },
    { prop: 'obdEmployeeName', label: i18n.t('FeeList.obdEmployeeId'), type: 'text', key: 'obdEmployeeName', width: 125 },
		{ prop: 'bkgAgentSupplierName', label: i18n.t('FeeList.bkgAgentSupplierId'), type: 'text', key: 'bkgAgentSupplierName', width: 150 },
    { prop: 'serviceType', label: i18n.t('FeeList.serviceType'), type: 'select', key: 'serviceType', width: 150, propInDict: 'diyServiceType' },
    { prop: 'businessType', label: i18n.t('FeeList.businessTypes'), type: 'select', key: 'businessType', width: 128, propInDict: 'feeBusinessType' },
		{ prop: 'shipCarrierCode', label: i18n.t('FeeList.shipCarrierCodes'), type: 'text', key: 'shipCarrierCode', width: 100 },
		{ prop: 'settleApplyAmt', label: i18n.t('Settle.genersettle'), type: 'text', key: 'settleApplyAmt', width: 125 },
		{ prop: 'canSettleApplyAmt', label: i18n.t('FeeList.canSettleApplyAmt'), type: 'text', key: 'canSettleApplyAmt', width: 125 },
		{ prop: 'bdDeptName', label: i18n.t('OrderFee.department'), type: 'text', key: 'bdDeptName', width: 125 },
    { prop: 'etdTime', label: i18n.t('FeeList.etdDate'), type: 'text', key: 'etdTime', width: 125 },
    { prop: 'etaTime', label: i18n.t('FeeList.etaDate'), type: 'text', key: 'etaTime', width: 125 },
		{ prop: 'bizDate', label: i18n.t('OrderFee.bizDate'), type: 'text', key: 'bizDate', width: 125 },
    { prop: 'receivePayDates', label: i18n.t('OrderFee.receivePayDates'), type: 'text', key: 'receivePayDates', width: 160 },
		{ prop: 'finMon', label: i18n.t('PreClose.finMon'), type: 'text', key: 'finMon' },
		{ prop: 'finCloseStatus', label: i18n.t('FeeList.closeStatus'), type: 'select', key: 'finCloseStatus', propInDict: 'yesNo', formatter: ({ cellValue }) => { return cellValue === 'yes' ? `<span style="color:#33B18A;">${i18n.t('Common.yes')}</span>` : cellValue === 'no' ? `<span style="color:#CD4130;">${i18n.t('Common.no')}</span>` : cellValue } },
    { prop: 'polPortName', label: i18n.t('FeeList.polPortCode'), type: 'text', key: 'polPortName', width: 125 },
    { prop: 'podPortName', label: i18n.t('FeeList.podPortCode'), type: 'text', key: 'podPortName', width: 125 },
    { prop: 'pricingEmployeeName', label: i18n.t('FeeList.pricingEmployeeId'), type: 'text', key: 'pricingEmployeeName', width: 125 },
    { prop: 'sysLineName', label: i18n.t('FeeList.sysLineCode'), type: 'text', key: 'sysLineName', width: 125 },
    { prop: 'createdByDeptName', label: i18n.t('FeeList.createdByDeptCode'), type: 'text', key: 'createdByDeptName', width: 125 },
    { prop: 'containerInfo', label: i18n.t('FeeList.containerType'), type: 'text', key: 'containerInfo', width: 125 },
    { prop: 'amountTReal', label: i18n.t('FeeList.teu'), type: 'text', key: 'amountTReal', width: 100 },
		{ prop: 'blId', label: i18n.t('OrderFee.blId'), type: 'select', key: 'blId', width: 160 },
		{ prop: 'negativeType', label: i18n.t('OrderFee.negativeType'), type: 'select', key: 'negativeType', width: 130 },
		{ prop: 'splitFromOrderNo', label: i18n.t('OrderFee.splitFromOrderNo'), type: 'input', key: 'splitFromOrderNo', width: 140 },
		{ prop: 'negativeFollowerId', label: i18n.t('OrderFee.negativeFollowerId'), type: 'select', key: 'negativeFollowerId', width: 190, formatter: ({ row }) => { return row.negativeFollowerName } },
		{ prop: 'negativeFollowerName', label: i18n.t('OrderFee.negativeFollowerName'), type: 'text', key: 'negativeFollowerName', width: 190 },
		{ prop: 'applyPersonId', label: i18n.t('OrderFee.applyPerson'), type: 'select', key: 'applyPersonId', width: 100 },
		{ prop: 'dutyPerson', label: i18n.t('OrderFee.dutyPerson'), type: 'select', key: 'dutyPerson', width: 100 },
    { prop: 'custIntrustNo', label: i18n.t('BillList.custIntrustNo'), type: 'text', key: 'custIntrustNo', width: 125 },
    { prop: 'vesselVoyage', label: i18n.t('FeeList.vesselVoyage'), type: 'text', key: 'vesselVoyage', width: 140, sortable: false },
    { prop: 'settleOrderStatus', label: i18n.t('FeeList.settleOrderStatus'), type: 'select', key: 'settleOrderStatus', width: 140, propInDict:'finFeeSettleOrderStatus' },
    { prop: 'srcWriteoffReceipayNo', label: i18n.t('Settle.sourceOrderNo'), type: 'text', key: 'srcWriteoffReceipayNo', width: 160 },
    { prop: 'receipayWay', label: i18n.t('Settle.paymentmethod'), type: 'select', key: 'receipayWay', propInDict: 'receipayWay', readOnly: true },
    { prop: 'receipayAccountShortName', label: i18n.t('Settle.receAccShortName'), type: 'text', key: 'receipayAccountShortName', width: 130 },
    { prop: 'receipayAccountNo', label: i18n.t('Settle.receipayAccountNo'), type: 'text', key: 'receipayAccountNo', width: 130 },
		{ prop: 'billNo', label: i18n.t('FeeList.billNo'), type: 'text', key: 'billNo', width: 130, sortable: false },
		{ prop: 'dnNo', label: i18n.t('FeeList.dnNo'), type: 'text', key: 'dnNo', width: 130, sortable: false },
		{ prop: 'podCountryCname', label: i18n.t('FeeList.destCountry'), type: 'text', key: 'podCountryCname', width: 100, sortable: false },
		{ prop: 'receiveSettleStatus', label: i18n.t('FeeList.aRSettlementStatus'), type: 'select', key: 'receiveSettleStatus', width: 100, propInDict: 'feeSettleStatus' },
		{ prop: 'paySettleStatus', label: i18n.t('FeeList.aPSettlementStatus'), type: 'select', key: 'paySettleStatus', width: 100, propInDict: 'feeSettleStatus' },
		{ prop: 'noReceiveUsdAmt', label: i18n.t('Finance.uncollectedUSD'), type: 'text', key: 'noReceiveUsdAmt', width: 90 },
		{ prop: 'noReceiveCnyAmt', label: i18n.t('Finance.uncollectedCNY'), type: 'text', key: 'noReceiveCnyAmt', width: 90 },
		{ prop: 'noReceiveHkdAmt', label: i18n.t('Finance.uncollectedHKD'), type: 'text', key: 'noReceiveHkdAmt', width: 90 },
		{ prop: 'noReceiveEurAmt', label: i18n.t('Finance.uncollectedEUR'), type: 'text', key: 'noReceiveEurAmt', width: 90 },
		{ prop: 'noReceiveGbpAmt', label: i18n.t('Finance.uncollectedGBP'), type: 'text', key: 'noReceiveGbpAmt', width: 90 },
		{ prop: 'noReceiveVndAmt', label: i18n.t('Finance.uncollectedVND'), type: 'text', key: 'noReceiveVndAmt', width: 90 },
		{ prop: 'noReceiveMxnAmt', label: i18n.t('Finance.uncollectedMXN'), type: 'text', key: 'noReceiveMxnAmt', width: 90 },
		{ prop: 'noPayUsdAmt', label: i18n.t('Finance.unpaidUSD'), type: 'text', key: 'noPayUsdAmt', width: 90 },
		{ prop: 'noPayCnyAmt', label: i18n.t('Finance.unpaidCNY'), type: 'text', key: 'noPayCnyAmt', width: 90 },
		{ prop: 'noPayHkdAmt', label: i18n.t('Finance.unpaidHKD'), type: 'text', key: 'noPayHkdAmt', width: 90 },
		{ prop: 'noPayEurAmt', label: i18n.t('Finance.unpaidEUR'), type: 'text', key: 'noPayEurAmt', width: 90 },
		{ prop: 'noPayGbpAmt', label: i18n.t('Finance.unpaidGBP'), type: 'text', key: 'noPayGbpAmt', width: 90 },
		{ prop: 'noPayVndAmt', label: i18n.t('Finance.unpaidVND'), type: 'text', key: 'noPayVndAmt', width: 90 },
		{ prop: 'noPayMxnAmt', label: i18n.t('Finance.unpaidMXN'), type: 'text', key: 'noPayMxnAmt', width: 90 },
		{ prop: 'receiveUsdAmt', label: i18n.t('Finance.ARUSD'), type: 'text', key: 'receiveUsdAmt', width: 90 },
		{ prop: 'receiveCnyAmt', label: i18n.t('Finance.ARCNY'), type: 'text', key: 'receiveCnyAmt', width: 90 },
		{ prop: 'receiveHkdAmt', label: i18n.t('Finance.ARHKD'), type: 'text', key: 'receiveHkdAmt', width: 90 },
		{ prop: 'receiveEurAmt', label: i18n.t('Finance.AREUR'), type: 'text', key: 'receiveEurAmt', width: 90 },
		{ prop: 'receiveGbpAmt', label: i18n.t('Finance.ARGBP'), type: 'text', key: 'receiveGbpAmt', width: 90 },
		{ prop: 'receiveVndAmt', label: i18n.t('Finance.ARVND'), type: 'text', key: 'receiveVndAmt', width: 90 },
		{ prop: 'receiveMxnAmt', label: i18n.t('Finance.ARMXN'), type: 'text', key: 'receiveMxnAmt', width: 90 },
		{ prop: 'payUsdAmt', label: i18n.t('Finance.APUSD'), type: 'text', key: 'payUsdAmt', width: 90 },
		{ prop: 'payCnyAmt', label: i18n.t('Finance.APCNY'), type: 'text', key: 'payCnyAmt', width: 90 },
		{ prop: 'payHkdAmt', label: i18n.t('Finance.APHKD'), type: 'text', key: 'payHkdAmt', width: 90 },
		{ prop: 'payEurAmt', label: i18n.t('Finance.APEUR'), type: 'text', key: 'payEurAmt', width: 90 },
		{ prop: 'payGbpAmt', label: i18n.t('Finance.APGBP'), type: 'text', key: 'payGbpAmt', width: 90 },
		{ prop: 'payVndAmt', label: i18n.t('Finance.APVND'), type: 'text', key: 'payVndAmt', width: 90 },
		{ prop: 'payMxnAmt', label: i18n.t('Finance.APMXN'), type: 'text', key: 'payMxnAmt', width: 90 },
		{ prop: 'writeoffReceiveUsdAmt', label: i18n.t('Finance.collectedUSD'), type: 'text', key: 'writeoffReceiveUsdAmt', width: 90 },
		{ prop: 'writeoffReceiveCnyAmt', label: i18n.t('Finance.collectedCNY'), type: 'text', key: 'writeoffReceiveCnyAmt', width: 90 },
		{ prop: 'writeoffReceiveHkdAmt', label: i18n.t('Finance.collectedHKD'), type: 'text', key: 'writeoffReceiveHkdAmt', width: 90 },
		{ prop: 'writeoffReceiveEurAmt', label: i18n.t('Finance.collectedEUR'), type: 'text', key: 'writeoffReceiveEurAmt', width: 90 },
		{ prop: 'writeoffReceiveGbpAmt', label: i18n.t('Finance.collectedGBP'), type: 'text', key: 'writeoffReceiveGbpAmt', width: 90 },
		{ prop: 'writeoffReceiveVndAmt', label: i18n.t('Finance.collectedVND'), type: 'text', key: 'writeoffReceiveVndAmt', width: 90 },
		{ prop: 'writeoffReceiveMxnAmt', label: i18n.t('Finance.collectedMXN'), type: 'text', key: 'writeoffReceiveMxnAmt', width: 90 },
		{ prop: 'writeoffPayUsdAmt', label: i18n.t('Finance.paidUSD'), type: 'text', key: 'writeoffPayUsdAmt', width: 90 },
		{ prop: 'writeoffPayCnyAmt', label: i18n.t('Finance.paidCNY'), type: 'text', key: 'writeoffPayCnyAmt', width: 90 },
		{ prop: 'writeoffPayHkdAmt', label: i18n.t('Finance.paidHKD'), type: 'text', key: 'writeoffPayHkdAmt', width: 90 },
		{ prop: 'writeoffPayEurAmt', label: i18n.t('Finance.paidEUR'), type: 'text', key: 'writeoffPayEurAmt', width: 90 },
		{ prop: 'writeoffPayGbpAmt', label: i18n.t('Finance.paidGBP'), type: 'text', key: 'writeoffPayGbpAmt', width: 90 },
		{ prop: 'writeoffPayVndAmt', label: i18n.t('Finance.paidVND'), type: 'text', key: 'writeoffPayVndAmt', width: 90 },
		{ prop: 'writeoffPayMxnAmt', label: i18n.t('Finance.paidMXN'), type: 'text', key: 'writeoffPayMxnAmt', width: 90 },
		// { prop: 'noInvoiceReceiveUsdAmt', label: '应收待开票USD', type: 'text', key: 'noInvoiceReceiveUsdAmt', width: 120 },
		// { prop: 'noInvoiceReceiveCnyAmt', label: '应收待开票CNY', type: 'text', key: 'noInvoiceReceiveCnyAmt', width: 120 },
		// { prop: 'noInvoiceReceiveHkdAmt', label: '应收待开票HKD', type: 'text', key: 'noInvoiceReceiveHkdAmt', width: 120 },
		// { prop: 'noInvoiceReceiveEurAmt', label: '应收待开票EUR', type: 'text', key: 'noInvoiceReceiveEurAmt', width: 120 },
		// { prop: 'noInvoiceReceiveGbpAmt', label: '应收待开票GBP', type: 'text', key: 'noInvoiceReceiveGbpAmt', width: 120 },
		// { prop: 'noInvoiceReceiveVndAmt', label: '应收待开票VND', type: 'text', key: 'noInvoiceReceiveVndAmt', width: 120 },
		// { prop: 'noInvoiceReceiveMxnAmt', label: '应收待开票MXN', type: 'text', key: 'noInvoiceReceiveMxnAmt', width: 120 },
		// { prop: 'noInvoicePayUsdAmt', label: '应付待开票USD', type: 'text', key: 'noInvoicePayUsdAmt', width: 120 },
		// { prop: 'noInvoicePayCnyAmt', label: '应付待开票CNY', type: 'text', key: 'noInvoicePayCnyAmt', width: 120 },
		// { prop: 'noInvoicePayHkdAmt', label: '应付待开票HKD', type: 'text', key: 'noInvoicePayHkdAmt', width: 120 },
		// { prop: 'noInvoicePayEurAmt', label: '应付待开票EUR', type: 'text', key: 'noInvoicePayEurAmt', width: 120 },
		// { prop: 'noInvoicePayGbpAmt', label: '应付待开票GBP', type: 'text', key: 'noInvoicePayGbpAmt', width: 120 },
		// { prop: 'noInvoicePayVndAmt', label: '应付待开票VND', type: 'text', key: 'noInvoicePayVndAmt', width: 120 },
		// { prop: 'noInvoicePayMxnAmt', label: '应付待开票MXN', type: 'text', key: 'noInvoicePayMxnAmt', width: 120 },
		// { prop: 'receiveInvocieNos', label: i18n.t('Finance.receiveInvocieNos'), type: 'text', key: 'receiveInvocieNos', width: 120 },
		// { prop: 'payInvocieNos', label: i18n.t('Finance.payInvocieNos'), type: 'text', key: 'payInvocieNos', width: 120 },
    { prop: 'atdTime', label: i18n.t('FeeList.atdDate'), type: 'text', key: 'atdTime', width: 125 },
    { prop: 'ataTime', label: i18n.t('FeeList.ataDate'), type: 'text', key: 'ataTime', width: 125 },
		{ prop: 'leatestReceiveDate', label: i18n.t('Finance.leatestReceiveDate'), type: 'text', key: 'leatestReceiveDate', width: 125 },
		{ prop: 'orderStatus', label: i18n.t('FeeList.orderStatus'), type: 'select', key: 'orderStatus' },
    { prop: 'bargeEtdTime', label: i18n.t('FeeList.bargeEtdTime'), type: 'text', key: 'bargeEtdTime', width: 125 },
		{ prop: 'bargeAtdTime', label: i18n.t('FeeList.bargeAtdTime'), type: 'text', key: 'bargeAtdTime', width: 125 },
		// { prop: 'invoiceDate', label: i18n.t('Finance.invoiceDate'), type: 'text', key: 'invoiceDate', width: 125 },
		{ prop: 'writeOffDate', label: i18n.t('FeeList.writeOffDate'), type: 'text', key: 'writeOffDate', width: 100 },
    { prop: 'signStatus', label: i18n.t('FeeList.signStatus'), type: 'select', key: 'signStatus', width: 80 },
    { prop: 'signDate', label: i18n.t('FeeList.signDate'), type: 'text', key: 'signDate', width: 130 },
    { prop: 'acfinDate', label: i18n.t('FeeList.acfinDate'), type: 'text', key: 'acfinDate', width: 130 },
    { prop: 'acfinCloseStatus', label: i18n.t('FeeList.acfinCloseStatus'), type: 'select', key: 'acfinCloseStatus', propInDict: 'yesNo', width: 80 },
    { prop: 'transferExVoucherNos', label: i18n.t('Finance.transferExVoucherNos'), type: 'text', key: 'transferExVoucherNos', width: 100 },
    { prop: 'exVoucherNos', label: i18n.t('Finance.exVoucherNos'), type: 'text', key: 'exVoucherNos', width: 100 },
		{ prop: 'usdInterest', label: i18n.t('Finance.usdInterest'), type: 'text', key: 'usdInterest', width: 130 },
    { prop: 'confirmLateFeeAmt', label: i18n.t('Finance.confirmLateFeeAmt'), type: 'text', key: 'confirmLateFeeAmt', width: 150 },
    { prop: 'exportOrderNo', label: i18n.t('FeeList.exportOrderNo'), type: 'text', key: 'exportOrderNo', width: 130 },
  ],
  columnsBase2: [
		// { prop: 'invoiceType', label: i18n.t('Settle.invoiceType'), type: 'select', key: 'invoiceType' },
		// { prop: 'invoiceReceivableApplyNo', label: i18n.t('FeeList.invoiceNo'), type: 'text', key: 'invoiceReceivableApplyNo' },
		// { prop: 'title', label: i18n.t('Settle.invoiceTitle'), type: 'text', key: 'title', width: 130 },
		// { prop: 'invoiceNo', label:  i18n.t('FeeList.invoiceNo'), type: 'text', key: 'invoiceNo' },
		{ prop: 'writeoffAmt', label: i18n.t('Collect.writtenoffAmount'), type: 'text', key: 'writeoffAmt' },
		{ prop: 'lockAmt', label: i18n.t('Settle.lockAmt'), type: 'text', key: 'lockAmt' },
		{
			prop: 'remainingAmount', label: i18n.t('Settle.remainingAmount'), type: 'text', key: 'remainingAmount',
			formatter: ({row}) => {
				return decimalFixed2(row.amt - row.writeoffAmt - row.lockAmt)
			}
		},
		{ prop: 'currency', label: i18n.t('OrderFee.currency'), type: 'select', key: 'currency', disabled: true }, // i18n.t('Settle.invoiceCur')
		{ prop: 'amt', label: i18n.t('OrderFee.feeAmt'), type: 'input', key: 'amt', inputType: "number", maxlength: "16" }, // i18n.t('Settle.invoiceAmt')
		{ prop: 'splitUnitAmt', label: i18n.t('FinBill.ssociatAmount'), type: 'text', key: 'splitUnitAmt' },
		// { prop: 'rate', label: i18n.t('Settle.invoiceRate'), type: 'text', key: 'rate' },
		// { prop: 'taxRate', label: i18n.t('Settle.taxRate'), type: 'text', key: 'taxRate' },
		{ prop: 'transferFeeType', label: i18n.t('Charge.inandextype'), type: 'select', key: 'transferFeeType', formatter: (row, pItem) => { if (row[pItem.prop] === 'inter_cut') return i18n.t('Settle.inner'); if (row[pItem.prop] === 'exter_cut') return i18n.t('Settle.external') } },
		{ prop: 'cutType', label: i18n.t('Charge.inandextype'), type: 'select', propInDict: 'transferFeeType', disabled: false, key: 'cutType', formatter: (row, pItem) => { if (row[pItem.prop] === 'inter_cut') return i18n.t('Settle.inner'); if (row[pItem.prop] === 'exter_cut') return i18n.t('Settle.external') } },
		{ prop: 'transferFee', label: i18n.t('FeeList.feeAmt'), type: 'input', inputType: "number", minWidth: '100px', key: 'transferFee', maxlength: "16" },
	],
	columnsBase3: [
		{ prop: 'settleCorpName', label: i18n.t('FeeList.settleCorp'), type: 'text', key: 'settleCorpName' },
		{ prop: 'settleCompName', label: i18n.t('FeeList.settleComp'), type: 'text', key: 'settleCompName' },
		// { prop: 'feeName', label: i18n.t('FeeList.feeName'), type: 'text', key: 'feeName' },
		{ prop: 'feeEnName', label: i18n.t('FeeList.feeEname'), type: 'text', key: 'feeEnName' },
		{ prop: 'oldSettleAmt', label:  i18n.t('Collect.originalamount'), type: 'text', key: 'oldSettleAmt' },
		{ prop: 'originalCurrency', label: i18n.t('Settle.orignalCurrency'), type: 'text', key: 'originalCurrency' },
		{ prop: 'settleAmt', label:  i18n.t('Settle.settleAmt'), type: 'text', key: 'settleAmt' },
		{ prop: 'settleCurrency', label:  i18n.t('Settle.settleCurrency'), type: 'text', key: 'settleCurrency' },
		{ prop: 'settleExRate', label:  i18n.t('Settle.settleExRate'), type: 'text', key: 'settleExRate' },
		{ prop: 'writeoffCurrency', label: i18n.t('Collect.writeoffCurrency'), type: 'text', key: 'writeoffCurrency' },
		{ prop: 'currency', label:  i18n.t('Collect.writeoffCurrency'), type: 'text', key: 'currency' },
		{ prop: 'writeoffFeeAmt', label:  i18n.t('Charge.writeoffAmt'), type: 'text', key: 'writeoffFeeAmt' },
		{ prop: 'writeoffAmt', label:  i18n.t('Charge.writeoffAmt'), type: 'text', key: 'writeoffAmt' },
		{ prop: 'lessPayAmt', label:  i18n.t('Collect.shortAmt'), type: 'text', key: 'lessPayAmt' },
		{ prop: 'writeoffExRate', label:  i18n.t('Collect.writeoffrate'), type: 'text', key: 'writeoffExRate' },
		{ prop: 'serviceName', label: i18n.t('FeeList.serviceCodes'), type: 'text', key: 'serviceName' },
		{ prop: 'feeUnit', label: i18n.t('FeeList.feeUnit'), type: 'select', key: 'feeUnit' },
		{ prop: 'unitPrice', label: i18n.t('FeeList.unitPrice'), type: 'text', key: 'unitPrice' },
		{ prop: 'unitCount', label: i18n.t('FeeList.quantity'), type: 'text', key: 'unitCount' },
	],
	columnsBase4: [
		{
			prop: 'orderNo', label: i18n.t('FeeList.orderNo'), type: 'button', key: 'orderNo', width: "140px",
			operationBtns: {
				show: true,
				callback: (fn, index, row, option) => {
					if (!row.orderNo && !row.finBillNo) {
						return this.$message.error(i18n.t('PreClose.jobNoTips'))
					}
					let query = { orderNo: row.orderNo, component: 'Fee' }
					this.$router.push("FinBillListDetail", query)
				},
			},
		},
		{ prop: 'settleCorpName', label: i18n.t('FeeList.settleCorp'), type: 'text', key: 'settleCorpName' },
		{ prop: 'settleOrderNo', label: i18n.t('Supplier.stateNumber'), type: 'text', key: 'settleOrderNo' },
		// { prop: 'feeName', label: i18n.t('FeeList.feeName'), type: 'text', key: 'feeName' },
		{ prop: 'feeEnName', label: i18n.t('FeeList.feeEname'), type: 'text', key: 'feeEnName' },
		{ prop: 'feeAmt', label: i18n.t('Collect.originalamount'), type: 'text', key: 'feeAmt' },
		{ prop: 'currency', label: i18n.t('Settle.orignalCurrency'), type: 'text', key: 'currency' },
		{ prop: 'settleAmt', label: i18n.t('Settle.settleAmt'), type: 'text', key: 'settleAmt' },
		{ prop: 'settleCurrency', label: i18n.t('Settle.settleCurrency'), type: 'text', key: 'settleCurrency' },
		{ prop: 'noWriteoffAmt', label: i18n.t('Collect.writeoffableamount'), type: 'text', key: 'noWriteoffAmt' },
		{ prop: 'settleExRate', label: i18n.t('Settle.settleExRate'), type: 'text', key: 'settleExRate' },
		{ prop: 'writeoffCurrency', label: i18n.t('Collect.writeoffCurrency'), type: 'text', key: 'writeoffCurrency' },
		{ prop: 'writeoffFeeAmt', label: i18n.t('Charge.writeoffAmt'), type: 'input', key: 'writeoffFeeAmt', inputType: "number", maxlength: "16" },
		{ prop: 'lessPayAmt', label: i18n.t('Collect.shortAmt'), type: 'input', key: 'lessPayAmt', inputType: "number", maxlength: "16" },
		{ prop: 'writeoffExRate', label: i18n.t('Collect.writeoffrate'), type: 'text', key: 'writeoffExRate' },
		{ prop: 'writeoffAmt', label: i18n.t('Settle.exSettleAmt'), type: 'text', key: 'writeoffAmt' },
		{ prop: 'serviceName', label: i18n.t('FeeList.serviceCodes'), type: 'text', key: 'serviceName' },
		{ prop: 'feeUnit', label: i18n.t('FeeList.feeUnit'), type: 'text', key: 'feeUnit', formatter: (row, pItem) => { if (row[pItem.prop] === 'unit') return i18n.t('Settle.box'); if (row[pItem.prop] === 'bill') return i18n.t('Settle.ticket'); if (row[pItem.prop] === 'count') return i18n.t('FeeList.quantity'); if (row[pItem.prop] === 'm') return i18n.t('Settle.volume'); if (row[pItem.prop] === 'rt') return i18n.t('Settle.weight')} },
		{ prop: 'unitPrice', label: i18n.t('FeeList.unitPrice'), type: 'text', key: 'unitPrice' },
		{ prop: 'unitCount', label: i18n.t('FeeList.quantity'), type: 'text', key: 'unitCount' },
	],
}

const state = {
	orderNo: '',
	custid: '',
	columns: {
		defaultColumns: columns.defaultColumns,
		defaultColumnsRecei: columns.defaultColumnsRecei,
		defaultColumnsPay: columns.defaultColumnsPay,
		defaultColumnsSU: columns.defaultColumnsSU,
		defaultColumnsFeeList: columns.defaultColumnsFeeList,
		defaultColumnsFeeListSU: columns.defaultColumnsFeeListSU,
		agentReceipayDefaultColumns: columns.agentReceipayDefaultColumns,
		columnsBase: lang === 'zh' ? columns.columnsBase.concat([{ prop: 'feeName', label: i18n.t('OrderFee.feeName'), type: 'input', key: 'feeName', width: 130, disabled: true }]) : columns.columnsBase,
		columnsBase2: columns.columnsBase2,
		columnsBase3: columns.columnsBase3,
		columnsBase4: columns.columnsBase4,
	},
	hideTabsAndMenu: false,
	businessType: '',
	isFinCloseCombined: false,
	feeSaveSuccessCount: 0,
	feeSaveErrorCount: 0,
	saveJumpRouteWhenRf: true
}

const getters = {
	getHideTabsAndMenu (state) {
		return state.hideTabsAndMenu
	},
	getFeeSaveSuccessCount(state) {
		return state.feeSaveSuccessCount
	},
	getFeeSaveErrorCount(state) {
		return state.feeSaveErrorCount
	}
}

const mutations = {
	setHideTabsAndMenu (state, payload) {
		state.hideTabsAndMenu = payload
	},
	setIsFinCloseCombined (state, payload) {
		state.isFinCloseCombined = payload
	},
	saveOrderNo (state, payload) {
		state.orderNo = payload
	},
	// 用于补料费用等跨系统的费用保存状态设置
	setFeeSaveSuccessCount(state, payload) {
		state.feeSaveSuccessCount += payload
	},
	setFeeSaveErrorCount(state, payload) {
		state.feeSaveErrorCount += payload
	},
	setSaveJumpRouteWhenRf(state, payload) {
		state.saveJumpRouteWhenRf = payload
	}
}

const actions = {
  // 请求下载blob流文件 GET方式
  downloadBlobFile({ state }, {uri, params}) {
    return new Promise((resolve, reject) => {
      let token = getToken()
      Object.assign( params, {
        fromSystem: "web_H5",
        toSystem: "mng_base_server",
        reqId: randomString(),
        reqTime: parseTime(new Date().getTime())
      })
      axios({
        method: 'get',
        url: uri,
        params: params,
        headers: {
					'Authorization': token,
					'Accept-Language': localStorage.getItem('locale') || 'en-US'
        },
        responseType: 'blob'
      }).then(res=>{
        console.log(res)
        // let blob = new Blob([res.data], {type: "application/vnd.ms-excel"});
        let blob = new Blob([res.data])
        resolve(blob)
      }).catch(err=>{
        reject(err)
        console.log(err)
      })
    })
  },
  // 请求下载blob流文件 POST方式
  downloadBlobFilePost({ state }, { uri, data, resType }) {
    return new Promise((resolve, reject) => {
      let token = getToken()
      Object.assign(data, {
        fromSystem: "web_H5",
        toSystem: "mng_base_server",
        reqId: randomString(),
        reqTime: parseTime(new Date().getTime()),
			})
      axios({
        method: 'post',
        url: uri,
        data,
        headers: {
          'Authorization': token,
          'Accept-Language': localStorage.getItem('locale') || 'en-US'
        },
        responseType: 'blob'
      }).then(res=>{
        console.log(res)
        if (res.data.type === 'application/json') {
          const reader = new FileReader()
          reader.onload = function () {
            const message = JSON.parse(reader.result).msg
            Message.error(message) // 将错误信息显示出来
          }
          reader.readAsText(res.data)
          reject()
          return
        }
        // let blob = new Blob([res.data], {type: "application/vnd.ms-excel"});
        let blob = new Blob([res.data])
        if (resType){
          resolve({resData:res.data, blob})
          return
        }
        resolve(blob)
      }).catch(err=>{
        reject(err)
      })
    })
  },

  // 请求下载EXCEL blob流文件 通用方法
  downloadExcelFile({state},{ data, uri }) {
    let params = {}
    return new Promise((resolve, reject) => {
      let token = getToken()
			let params = {}
      uri = uri || "/fin/common/queryDataExportExcel"
      Object.assign(params, {
        fromSystem: "web_H5",
        toSystem: "mng_fin_server",
        reqId: randomString(),
        reqTime: parseTime(new Date().getTime()),
        data: data
      })
      axios({
        method: 'post',
        url: uri,
        // params: params,
        headers: {
					'Authorization': token,
          'Accept-Language': localStorage.getItem('locale') || 'en-US'
        },
        responseType: 'blob',
        data:params
      }).then(res=>{
        console.log(res)
        // let blob = new Blob([res.data], {type: "application/vnd.ms-excel"});
        let blob = new Blob([res.data])
        resolve(blob)
      }).catch(err=>{
        reject(err)
        console.log(err)
      })
    })
  }
}

export default {
	namespaced: true,
	state,
	getters,
	mutations,
	actions
}

