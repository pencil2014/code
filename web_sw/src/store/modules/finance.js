import axios from 'axios'
import { parseTime, randomString } from '@/utils'
import { getToken } from '@/utils/auth'
import { Message } from 'element-ui'
import { decimalFixed2 } from '@/views/finance/utils/finance'

const columns = {
	// 默认表头
	defaultColumns: ['settleCompName', 'feeName', 'serviceName', 'settleCorpName', 'feeUnit', 'unitCount', 'unitPrice',
		'feeAmt', 'currency', 'taxRate', 'negativeType', 'negativeFollowerId', 'feeEnName', 'agentCompName', 'jointStatus', 'jointDeptName', 'taxAmt', 'feeAmtWithoutTax', 'remark', 'cnyExRate', 'cnyMoneyAmt', 'usdExRate', 'usdMoneyAmt', 'reviseStatus',
		'confirmStatus', 'finDate', 'precloseStatus', 'precloseTime', 'closeStatus', 'closeTime', 'settleLock', 'lockReason', 'settleCycle',
		'settleStatus', 'settleOrderNos', 'settleAmt', 'settleTimes', 'isIssueInvoice', 'invoiceStatus', 'invoiceNos', 'invoiceAmt', 'notInvoiceAmt',
		'gedgingStatus', 'writeoffStatus', 'gedgingWriteoffAmt', 'badAmt', 'payApplySettleNos', 'payOrderNos', 'writeoffNos', 'totalWriteoffAmt', 'notWriteoffAmt', 'createdName',
    'createdTime', 'confirmName', 'confirmTime', 'receivePayDates', 'shipCarrierOrderNo', 'whPoNo'],
	defaultColumnsRecei: ['settleCompName', 'feeName', 'serviceName', 'settleCorpName', 'feeUnit', 'unitCount', 'unitPrice',
		'feeAmt', 'currency', 'blId', 'negativeType', 'splitFromOrderNo', 'negativeFollowerId', 'feeEnName', 'taxRate', 'agentCompName', 'jointStatus', 'jointDeptName', 'jointToOrderNo', 'taxAmt', 'feeAmtWithoutTax', 'remark', 'cnyExRate', 'cnyMoneyAmt', 'usdExRate', 'usdMoneyAmt', 'reviseStatus',
		'confirmStatus', 'finDate', 'precloseStatus', 'precloseTime', 'closeStatus', 'closeTime', 'settleLock', 'lockReason', 'settleCycle',
		'settleStatus', 'settleOrderNos', 'settleAmt', 'settleTimes', 'isIssueInvoice', 'invoiceStatus', 'invoiceNos', 'invoiceAmt', 'notInvoiceAmt',
		'gedgingStatus', 'writeoffStatus', 'gedgingWriteoffAmt', 'badAmt', 'writeoffNos', 'totalWriteoffAmt', 'notWriteoffAmt', 'createdName',
		'createdTime', 'confirmName', 'confirmTime', 'receivePayDates', 'bizDate'],
	defaultColumnsPay: ['settleCompName', 'feeName', 'serviceName', 'settleCorpName', 'feeUnit', 'unitCount', 'unitPrice',
		'feeAmt', 'currency', 'taxRate', 'negativeType', 'negativeFollowerId', 'feeEnName', 'agentCompName', 'jointStatus', 'jointDeptName', 'jointToOrderNo', 'taxAmt', 'feeAmtWithoutTax', 'remark', 'cnyExRate', 'cnyMoneyAmt', 'usdExRate', 'usdMoneyAmt', 'reviseStatus',
		'confirmStatus', 'finDate', 'precloseStatus', 'precloseTime', 'closeStatus', 'closeTime', 'settleLock', 'lockReason', 'settleCycle',
		'settleStatus', 'settleOrderNos', 'settleAmt', 'settleTimes', 'isIssueInvoice', 'invoiceStatus', 'invoiceNos', 'invoiceAmt', 'notInvoiceAmt',
		'gedgingStatus', 'writeoffStatus', 'gedgingWriteoffAmt', 'badAmt', 'payApplySettleNos', 'payOrderNos', 'writeoffNos', 'totalWriteoffAmt', 'notWriteoffAmt', 'createdName',
		'createdTime', 'confirmName', 'confirmTime', 'receivePayDates', 'bizDate'],
	defaultColumnsSU: ['settleCompName', 'settleCorpName', 'currency', 'feeAmt', 'cnyMoneyAmt', 'usdMoneyAmt', 'settleCycle', 'settleStatus', 'settleOrderNos', 
		'unSettleAmt', 'settleAmt', 'invoiceStatus', 'notInvoiceAmt', 'invoiceAmt', 'gedgingStatus', 'gedgingWriteoffAmt', 'badAmt', 'writeoffStatus',
		'writeoffNos', 'totalWriteoffAmt', 'notWriteoffAmt'],
	// 费用列表默认表头
	defaultColumnsFeeList: ['sourceBizNo', 'feeName', 'serviceName', 'feeEnName', 'finGroup', 'settleCorpName', 'receipayType', 'settleCompName', 'agentCompName', 'currency', 'feeAmt', 'feeUnit', 'unitCount', 'unitPrice',
		'taxRate', 'taxAmt', 'feeAmtWithoutTax', 'confirmStatus', 'reviseStatus', 'jointStatus', 'cnyExRate', 'cnyMoneyAmt', 'usdExRate', 'usdMoneyAmt', 'finDate', 'precloseStatus', 'intraStatus', 'precloseTime', 'closeStatus', 'closeTime', 'settleLock', 'settleCycle',
		'settleStatus', 'settleOrderNos', 'settleAmt', 'settleTimes', 'settleApplyAmt', 'canSettleApplyAmt', 'isIssueInvoice', 'invoiceStatus', 'invoiceNos', 'invoiceAmt', 'notInvoiceAmt',
		'gedgingStatus', 'writeoffStatus', 'gedgingWriteoffAmt', 'badAmt', 'payApplySettleNos', 'payOrderNos', 'writeoffNos', 'totalWriteoffAmt', 'notWriteoffAmt', 'acctVoucherNos', 'transferAcctVoucherNos', 'remark', 'createdName',
    'createdTime', 'confirmName', 'confirmTime', 'settleCorpType', 'settleCorpSubType', 'custName', 'bdEmployeeName', 'opEmployeeName', 'obdEmployeeName', 'bkgAgentSupplierName', 'serviceType', 'businessType', 'shipCarrierCode', 'jointToOrderNo', 'jointDeptName', 'jointStatus',
    'hbls', 'mbls', 'soNos', 'containerNos', 'polPortName', 'podPortName', 'pricingEmployeeName', 'sysLineName', 'createdByDeptName', 'containerInfo', 'amountTReal', 'remark', 'bdDeptName', 'etdTime', 'etaTime', 'atdTime', 'ataTime', 'bizDate', 'receivePayDates'
    , 'negativeFollowerName', 'splitFromOrderNo', 'negativeType', 'custIntrustNo', 'vesselVoyage', 'lockReason', 'settleOrderStatus', 'billNo', 'dnNo', 'podCountryCname', 'bargeEtdTime', 'bargeAtdTime', 'invoiceDate', 'shipCarrierOrderNo', 'whPoNo', 'writeOffDate'
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
    { prop: 'whPoNo', label: '入舱单号', type: 'text', key: 'whPoNo', width: 128 },
    { prop: 'shipCarrierOrderNo', label: '船司订单号', type: 'text', key: 'shipCarrierOrderNo', width: 128 },
		{ prop: 'settleCompName', label: '分公司', type: 'text', key: 'settleCompName', width: 160 },
		{ prop: 'jointDeptName', label: '协同部门', type: 'text', key: 'jointDeptName', width: 130 },
		{ prop: 'jointToOrderNo', label: '对手单号', type: 'text', key: 'jointToOrderNo', width: 130 },
		{ prop: 'feeName', label: '费用名称', type: 'input', key: 'feeName', width: 110, disabled: true },
		{ prop: 'feeCode', label: '费用名称', type: 'input', key: 'feeCode', width: 110 },
		{ prop: 'feeEnName', label: '费用英文名', type: 'text', key: 'feeEnName', width: 130 },
		{ prop: 'serviceName', label: '服务项', type: 'input', key: 'serviceName', width: 100, }, // disabled: true
		// { prop: 'serviceCode', label: '服务项', type: 'input', key: 'serviceCode', width: 100, }, // 勿添加，会使自定义表头出错
		{ prop: 'settleCorpName', label: '结算单位', type: 'input', width: 160, key: 'settleCorpName', disabled: true },
		{ prop: 'settleCorpCode', label: '结算单位', type: 'input', width: 160, key: 'settleCorpCode', disabled: true },
		{ prop: 'feeUnit', label: '计费单位', type: 'select', key: 'feeUnit', disabled: true, width: 100 },
		{ prop: 'unitCount', label: '数量', type: 'input', key: 'unitCount', width: 70, disabled: true },
		{ prop: 'unitPrice', label: '单价', type: 'input', key: 'unitPrice', disabled: true },
		{ prop: 'feeAmt', label: '金额', type: 'input', key: 'feeAmt', disabled: true },
		{ prop: 'currency', label: '币种', type: 'select', key: 'currency', width: 70, propInDict: 'validCurrencyNR', filterable: true, disabled: true },
		// {prop: 'prepayType', label: '到付/预付', type: 'select', key: 'prepayType'},
		{ prop: 'taxRate', label: '税率', type: 'text', key: 'taxRate', width: 70, disabled: true, formatter1: (row, pItem) => { if (row.taxRate) { return Number(row.taxRate) * 100 + '%' } else { return row.taxRate } }, formatter: ({ cellValue }) => { if (cellValue) { return (new LSnum(cellValue)).times(100) + '%' } else { return cellValue } } },
    { prop: 'taxAmt', label: '税额', type: 'text', key: 'taxAmt', width: 80 },
		{ prop: 'feeAmtWithoutTax', label: '不含税金额', type: 'text', key: 'feeAmtWithoutTax', width: 100 },
		{ prop: 'remark', label: '费用备注', type: 'input', key: 'remark', width: 260 },
		// { prop: 'acctExRate', label: '折合CNY汇率', type: 'text', key: 'acctExRate', width: 110, formatter: ({ row }) => { return row.cnyExRate } }, // 去掉
		{ prop: 'cnyExRate', label: '折合CNY汇率', type: 'text', key: 'cnyExRate', width: 110 },
		// { prop: 'basicMoneyAmt', label: '折合CNY金额', type: 'text', key: 'basicMoneyAmt', width: 110, formatter: ({ row }) => { return row.cnyMoneyAmt } }, // 去掉
		{ prop: 'cnyMoneyAmt', label: '折合CNY金额', type: 'text', key: 'cnyMoneyAmt', width: 110 },
		{ prop: 'usdExRate', label: '折合USD汇率', type: 'text', key: 'usdExRate', width: 110 },
		{ prop: 'usdMoneyAmt', label: '折合USD金额', type: 'text', key: 'usdMoneyAmt', width: 110 },
    { prop: 'reviseStatus', label: '调账状态', type: 'text', key: 'reviseStatus', width: 100, propInDict: 'feeReviseStatus', isForceSelect: true},
    // { prop: 'reviseStatus', label: '是否调账', type: 'text', key: 'reviseStatus', width: 100, formatter1: (row, pItem) => { if (row[pItem.prop] === 'yes') { return '是' } else if (row[pItem.prop] === 'no') { return '否' } }, formatter: ({ cellValue }) => { if (cellValue === 'yes') { return '是' } else if (cellValue === 'no') { return '否' } } },
    { prop: 'confirmStatus', label: '是否确认', type: 'text', key: 'confirmStatus', width: 80, propInDict: 'yesNo', isForceSelect: true, formatter: ({ cellValue }) => { return cellValue === 'yes' ? '<span style="color:#33B18A;">是</span>' : cellValue === 'no' ? '<span style="color:#CD4130;">否</span>' : cellValue } },
    // { prop: 'confirmStatus', label: '是否确认', type: 'text', key: 'confirmStatus', width: 80, formatter1: (row, pItem) => { if (row[pItem.prop] === 'yes') { return '是' } else if (row[pItem.prop] === 'no') { return '否' } else { return row[pItem.prop] } }, formatter: ({ cellValue }) => { if (cellValue === 'yes') { return '是' } else if (cellValue === 'no') { return '否' } else { return cellValue } } },
		{ prop: 'finDate', label: '财务日期', type: 'text', key: 'finDate', width: 105 },
    { prop: 'precloseStatus', label: '预关账状态', type: 'text', key: 'precloseStatus', propInDict: 'yesNo', width: 100, isForceSelect: true},
    // { prop: 'precloseStatus', label: '预关账状态', type: 'text', key: 'precloseStatus', width: 100, formatter1: (row, pItem) => { if (row[pItem.prop] === 'yes') { return '是' } else if (row[pItem.prop] === 'no') { return '否' } }, formatter: ({ cellValue }) => { if (cellValue === 'yes') { return '是' } else if (cellValue === 'no') { return '否' } } },
    { prop: 'intraStatus', label: '是否内部往来', type: 'text', key: 'intraStatus', width: 120, propInDict: 'yesNo', isForceSelect: true},
    // { prop: 'intraStatus', label: '是否内部往来', type: 'text', key: 'intraStatus', width: 120, formatter1: (row, pItem) => { if (row[pItem.prop] === 'yes') { return '是' } else if (row[pItem.prop] === 'no') { return '否' } }, formatter: ({ cellValue }) => { if (cellValue === 'yes') { return '是' } else if (cellValue === 'no') { return '否' } } },
    { prop: 'jointStatus', label: '是否协同', type: 'text', key: 'jointStatus', width: 100, propInDict: 'yesNo', isForceSelect: true },
    // { prop: 'jointStatus', label: '是否协同', type: 'text', key: 'jointStatus', width: 100, formatter1: (row, pItem) => { if (row[pItem.prop] === 'yes') { return '是' } else if (row[pItem.prop] === 'no') { return '否' } }, formatter: ({ cellValue }) => { if (cellValue === 'yes') { return '是' } else if (cellValue === 'no') { return '否' } } },
		{ prop: 'precloseTime', label: '预关账时间', type: 'text', key: 'precloseTime', width: 125 },
    { prop: 'closeStatus', label: '关账状态', type: 'text', key: 'closeStatus', width: 100, propInDict: 'yesNo', isForceSelect: true, propInDict: 'yesNo', formatter: ({ cellValue }) => { return cellValue === 'yes' ? '<span style="color:#33B18A;">是</span>' : cellValue === 'no' ? '<span style="color:#CD4130;">否</span>' : cellValue } },
    // { prop: 'closeStatus', label: '关账状态', type: 'text', key: 'closeStatus', width: 100, formatter1: (row, pItem) => { if (row[pItem.prop] === 'yes') { return '是' } else if (row[pItem.prop] === 'no') { return '否' } }, formatter: ({ cellValue }) => { if (cellValue === 'yes') { return '是' } else if (cellValue === 'no') { return '否' } } },
		{ prop: 'closeTime', label: '关账时间', type: 'text', key: 'closeTime', width: 125 },
    { prop: 'settleLock', label: '是否结算锁定', type: 'text', key: 'settleLock', width: 120, propInDict: 'finLockStatus', isForceSelect: true },
    // { prop: 'settleLock', label: '是否结算锁定', type: 'text', key: 'settleLock', width: 120, formatter1: (row, pItem) => { if (row[pItem.prop] === 'lock') { return '锁定' } else if (row[pItem.prop] === 'unlock') { return '未锁定' } }, formatter: ({ cellValue }) => { if (cellValue === 'lock') { return '锁定' } else if (cellValue === 'unlock') { return '未锁定' } } },
		// { prop: 'lockReason', label: '结算锁定原因', type: 'tooltip', key: 'lockReason', width: 120 },
		{ prop: 'settleCycle', label: '结算方式', type: 'select', key: 'settleCycle', width: 100 },
		{ prop: 'settleStatus', label: '结清状态', type: 'select', key: 'settleStatus', width: 100, propInDict: 'feeSettleStatus' },
		{ prop: 'settleOrderNos', label: '结算单号', type: 'text', key: 'settleOrderNos', width: 190 },
		{ prop: 'settleOrderNo', label: '结算单号', type: 'text', key: 'settleOrderNo', width: 125 },
		{ prop: 'settleAmt', label: '结算金额', type: 'text', key: 'settleAmt', width: 100 },
		{ prop: 'unSettleAmt', label: '未结算金额', type: 'text', key: 'unSettleAmt', width: 100, formatter: ({ row }) => { return row.feeAmt - row.settleAmt } },		
		// {prop: 'settleCloseTime', label: '结算时间-删', type: 'text', key: 'settleCloseTime', width: 125},
		{ prop: 'settleTimes', label: '结算时间', type: 'text', key: 'settleTimes', width: 125 },
		{ prop: 'isIssueInvoice', label: '是否开票', type: 'text', key: 'isIssueInvoice', width: 100, formatter1: (row, pItem) => { if (row[pItem.prop] === 'yes') { return '是' } else if (row[pItem.prop] === 'no') { return '否' } }, formatter: ({ cellValue }) => { if (cellValue === 'yes') { return '是' } else if (cellValue === 'no') { return '否' } } },
		{ prop: 'invoiceStatus', label: '发票状态', type: 'select', key: 'invoiceStatus', propInDict: 'feeInvoiceStatus', width: 100 },
		{ prop: 'invoiceNos', label: '发票号', type: 'text', key: 'invoiceNos', width: 125 },
		{ prop: 'invoiceAmt', label: '已开票金额', type: 'text', key: 'invoiceAmt', width: 100 },
		// {prop: 'invoiceReplenishAmt', label: '未开票金额-删', type: 'text', key: 'invoiceReplenishAmt', width: 120},
		{ prop: 'notInvoiceAmt', label: '未开票金额', type: 'text', key: 'notInvoiceAmt', width: 100 },
		{ prop: 'gedgingStatus', label: '对冲状态', type: 'text', key: 'gedgingStatus', width: 100, formatter1: (row, pItem) => { if (row[pItem.prop] === 'yes') { return '是' } else if (row[pItem.prop] === 'no') { return '否' } }, formatter: ({ cellValue }) => { if (cellValue === 'yes') { return '是' } else if (cellValue === 'no') { return '否' } } },
		{ prop: 'writeoffStatus', label: '核销状态', type: 'select', key: 'writeoffStatus', width: 100, propInDict: 'writeoffStatus' },
		{ prop: 'gedgingWriteoffAmt', label: '已对冲金额', type: 'text', key: 'gedgingWriteoffAmt', width: 100 },
		{ prop: 'badAmt', label: '坏账金额', type: 'text', key: 'badAmt', width: 100 },
		{ prop: 'payApplySettleNos', label: '请款单号', type: 'text', key: 'payApplySettleNos', width: 125 },
		{ prop: 'payOrderNos', label: '付款单号', type: 'text', key: 'payOrderNos', width: 125 },
		{ prop: 'writeoffNos', label: '核销编号', type: 'text', key: 'writeoffNos', width: 125 },
		{ prop: 'totalWriteoffAmt', label: '已核销金额', type: 'text', key: 'totalWriteoffAmt', width: 100 },
		{ prop: 'notWriteoffAmt', label: '未核销金额', type: 'text', key: 'notWriteoffAmt', width: 100 },
    { prop: 'transferAcctVoucherNos', label: '转字凭证', type: 'text', key: 'transferAcctVoucherNos', width: 70 },
    { prop: 'acctVoucherNos', label: '凭证号', type: 'text', key: 'acctVoucherNos', width: 125 }, // 在订单费用显示为“凭证号”，在费用列表显示为“实收付凭证号”
		{ prop: 'createdName', label: '创建人', type: 'text', key: 'createdName', width: 125 },
		{ prop: 'createdTime', label: '创建时间', type: 'text', key: 'createdTime', width: 125 },
		{ prop: 'confirmName', label: '确认人', type: 'text', key: 'confirmName', width: 125 },
		{ prop: 'confirmTime', label: '确认时间', type: 'text', key: 'confirmTime', width: 125 },
		// {prop: 'invoiceApplyAmt', label: '发票申请金额', type: 'text', key: 'invoiceApplyAmt', width: 100},
		// {prop: 'isWithTax', label: '是否单价含税', type: 'text', key: 'isWithTax', width: 100, formatter1: (row, pItem) => {if (row[pItem.prop] === 'yes') {return '是'} else if (row[pItem.prop] === 'no') {return '否'}}},
		// {prop: 'settleApplyAmt', label: '已申请结算金额', type: 'text', key: 'settleApplyAmt', width: 105},
		// {prop: 'gedgingApplyAmt', label: '对冲申请金额', type: 'text', key: 'gedgingApplyAmt'}, // hideInCustomColumns: true
		// {prop: 'transAcctVoucherNo', label: '转字凭证号', type: 'text', key: 'transAcctVoucherNo'},
    { prop: 'receipayType', label: '收付类型', type: 'select', key: 'receipayType', propInDict: 'receipayGroup', width: 100  },
		// {prop: 'orderNo', label: '订单号', type: 'text', key: 'orderNo', width: 120}, // 另外增加几个prop，用于mixin的validate函数
    { prop: 'reason', label: '原因', type: 'text', key: 'reason', width: 125 },
		// {prop: 'frontIndex', label: '序号', type: 'text', key: 'frontIndex', width: 34},
    { prop: 'sourceBizNo', label: '单号', type: 'text', key: 'sourceBizNo', width: 125 },
    { prop: 'hbls', label: 'HBL', type: 'text', key: 'hbls', width: 125 },
    { prop: 'mbls', label: 'MBL', type: 'text', key: 'mbls', width: 125 },
    { prop: 'soNos', label: 'SO号', type: 'text', key: 'soNos', width: 125 },
    { prop: 'containerNos', label: '箱号', type: 'text', key: 'containerNos', width: 125 },
		{ prop: 'finGroup', label: '费用分组', type: 'select', key: 'finGroup', width: 125, propInDict: 'feeitemFinGroup' },
		{ prop: 'agentCompName', label: '费用代收付分公司', type: 'text', key: 'agentCompName', width: 128 },
		{ prop: 'settleCorpType', label: '结算单位类型', type: 'select', key: 'settleCorpType', width: 128, propInDict: 'unitType', multi: true, },
    { prop: 'settleCorpSubType', label: '结算单位子类型', type: 'select', key: 'settleCorpSubType', width: 128, propInDict: 'settleUnitSubType', multi: true, noDict: true},
		// {prop: 'orderFeeId', label: '订单费用Id', key: 'orderFeeId'}, // hideInCustomColumns: true
		// {prop: 'intraStatus', label: '内部来往标识', type: 'text', key: 'intraStatus', formatter1: (row, pItem) => {if (row[pItem.prop] === 'yes') {return '是'} else if (row[pItem.prop] === 'no') {return '否'}}}, // hideInCustomColumns: true
		// {prop: 'jointStatus', label: '协同标识', type: 'text', key: 'jointStatus', formatter1: (row, pItem) => {if (row[pItem.prop] === 'yes') {return '是'} else if (row[pItem.prop] === 'no') {return '否'}}}, // hideInCustomColumns: true
		// 委托单位 custName,consignerCode”“业务员 bdEmployeeName”“订舱代理 bkgAgentSupplierName”“业务类型businessType”"船/航司 shipCarrierCode”“协同单号jointToOrderNo”“协同部门jointDeptName”“是否协同费用 jointStatus”
    { prop: 'custName', label: '委托单位', type: 'text', key: 'custName', width: 150 },
		{ prop: 'bdEmployeeName', label: '销售', type: 'text', key: 'bdEmployeeName', width: 125 },
		{ prop: 'opEmployeeName', label: '操作员', type: 'text', key: 'opEmployeeName', width: 125 },
    { prop: 'obdEmployeeName', label: '销售助理', type: 'text', key: 'obdEmployeeName', width: 125 },
		{ prop: 'bkgAgentSupplierName', label: '订舱代理', type: 'text', key: 'bkgAgentSupplierName', width: 150 },
    { prop: 'serviceType', label: '服务类型', type: 'select', key: 'serviceType', width: 150, propInDict: 'diyServiceType' },
    { prop: 'businessType', label: '业务类型', type: 'select', key: 'businessType', width: 128, propInDict: 'feeBusinessType' },
		{ prop: 'shipCarrierCode', label: '船/航司', type: 'text', key: 'shipCarrierCode', width: 100 },
		{ prop: 'settleApplyAmt', label: '已生成结算金额', type: 'text', key: 'settleApplyAmt', width: 125 },
		{ prop: 'canSettleApplyAmt', label: '未生成结算金额', type: 'text', key: 'canSettleApplyAmt', width: 125 },
		{ prop: 'bdDeptName', label: '部门', type: 'text', key: 'bdDeptName', width: 125 },
    { prop: 'etdTime', label: '大船预计开船时间（ETD）', type: 'text', key: 'etdTime', width: 125 },
    { prop: 'etaTime', label: '大船预计到港时间（ETA）', type: 'text', key: 'etaTime', width: 125 },
		{ prop: 'bizDate', label: '业务日期', type: 'text', key: 'bizDate', width: 125 },
    { prop: 'receivePayDates', label: '收付日期', type: 'text', key: 'receivePayDates', width: 125 },
		{ prop: 'finMon', label: '财务月份', type: 'text', key: 'finMon' },
		{ prop: 'finCloseStatus', label: '总关账状态', type: 'select', key: 'finCloseStatus', propInDict: 'yesNo', formatter: ({ cellValue }) => { return cellValue === 'yes' ? '<span style="color:#33B18A;">是</span>' : cellValue === 'no' ? '<span style="color:#CD4130;">否</span>' : cellValue } },
    { prop: 'polPortName', label: '起运港', type: 'text', key: 'polPortName', width: 125 },
    { prop: 'podPortName', label: '目的地', type: 'text', key: 'podPortName', width: 125 },
    { prop: 'pricingEmployeeName', label: '商务', type: 'text', key: 'pricingEmployeeName', width: 125 },
    { prop: 'sysLineName', label: '航线', type: 'text', key: 'sysLineName', width: 125 },
    { prop: 'createdByDeptName', label: '费用创建人部门', type: 'text', key: 'createdByDeptName', width: 125 },
    { prop: 'containerInfo', label: '箱型箱量', type: 'text', key: 'containerInfo', width: 125 },
    { prop: 'amountTReal', label: 'TEU', type: 'text', key: 'amountTReal', width: 100 },
		{ prop: 'blId', label: '提单号', type: 'select', key: 'blId', width: 160 },
		{ prop: 'negativeType', label: '负数类型', type: 'select', key: 'negativeType', width: 110 },
		{ prop: 'splitFromOrderNo', label: '拆单原单号', type: 'input', key: 'splitFromOrderNo', width: 125 },
		{ prop: 'negativeFollowerId', label: '负数跟进人', type: 'select', key: 'negativeFollowerId', width: 100, formatter: ({ row }) => { return row.negativeFollowerName } },
		{ prop: 'negativeFollowerName', label: '负数处理人', type: 'text', key: 'negativeFollowerName', width: 100 },
		{ prop: 'applyPersonId', label: '责任人', type: 'select', key: 'applyPersonId', width: 100 },
		{ prop: 'dutyPerson', label: '实际责任人', type: 'select', key: 'dutyPerson', width: 100 },
    { prop: 'custIntrustNo', label: '客户委托号', type: 'text', key: 'custIntrustNo', width: 125 },
    { prop: 'vesselVoyage', label: '船名/航次', type: 'text', key: 'vesselVoyage', width: 140, sortable: false },
    { prop: 'settleOrderStatus', label: '结算单生成状态', type: 'select', key: 'settleOrderStatus', width: 140, propInDict:'finFeeSettleOrderStatus' },
    { prop: 'srcWriteoffReceipayNo', label: '来源核销单号', type: 'text', key: 'srcWriteoffReceipayNo', width: 160 },
    { prop: 'receipayWay', label: '收付方式', type: 'select', key: 'receipayWay', propInDict: 'receipayWay', readOnly: true },
    { prop: 'receipayAccountShortName', label: '收付账户名简称', type: 'text', key: 'receipayAccountShortName', width: 130 },
    { prop: 'receipayAccountNo', label: '收付账号', type: 'text', key: 'receipayAccountNo', width: 130 },
		{ prop: 'billNo', label: '系统账单编号', type: 'text', key: 'billNo', width: 130, sortable: false },
		{ prop: 'dnNo', label: '账单号', type: 'text', key: 'dnNo', width: 130, sortable: false },
		{ prop: 'podCountryCname', label: '目的国家', type: 'text', key: 'podCountryCname', width: 100, sortable: false },
		{ prop: 'receiveSettleStatus', label: '应收结清状态', type: 'select', key: 'receiveSettleStatus', width: 100, propInDict: 'feeSettleStatus' },
		{ prop: 'paySettleStatus', label: '应付结清状态', type: 'select', key: 'paySettleStatus', width: 100, propInDict: 'feeSettleStatus' },
		{ prop: 'noReceiveUsdAmt', label: '未收USD', type: 'text', key: 'noReceiveUsdAmt', width: 90 },
		{ prop: 'noReceiveCnyAmt', label: '未收CNY', type: 'text', key: 'noReceiveCnyAmt', width: 90 },
		{ prop: 'noReceiveHkdAmt', label: '未收HKD', type: 'text', key: 'noReceiveHkdAmt', width: 90 },
		{ prop: 'noReceiveEurAmt', label: '未收EUR', type: 'text', key: 'noReceiveEurAmt', width: 90 },
		{ prop: 'noReceiveGbpAmt', label: '未收GBP', type: 'text', key: 'noReceiveGbpAmt', width: 90 },
		{ prop: 'noReceiveVndAmt', label: '未收VND', type: 'text', key: 'noReceiveVndAmt', width: 90 },
		{ prop: 'noReceiveMxnAmt', label: '未收MXN', type: 'text', key: 'noReceiveMxnAmt', width: 90 },
		{ prop: 'noPayUsdAmt', label: '未付USD', type: 'text', key: 'noPayUsdAmt', width: 90 },
		{ prop: 'noPayCnyAmt', label: '未付CNY', type: 'text', key: 'noPayCnyAmt', width: 90 },
		{ prop: 'noPayHkdAmt', label: '未付HKD', type: 'text', key: 'noPayHkdAmt', width: 90 },
		{ prop: 'noPayEurAmt', label: '未付EUR', type: 'text', key: 'noPayEurAmt', width: 90 },
		{ prop: 'noPayGbpAmt', label: '未付GBP', type: 'text', key: 'noPayGbpAmt', width: 90 },
		{ prop: 'noPayVndAmt', label: '未付VND', type: 'text', key: 'noPayVndAmt', width: 90 },
		{ prop: 'noPayMxnAmt', label: '未付MXN', type: 'text', key: 'noPayMxnAmt', width: 90 },
		{ prop: 'receiveUsdAmt', label: '应收USD', type: 'text', key: 'receiveUsdAmt', width: 90 },
		{ prop: 'receiveCnyAmt', label: '应收CNY', type: 'text', key: 'receiveCnyAmt', width: 90 },
		{ prop: 'receiveHkdAmt', label: '应收HKD', type: 'text', key: 'receiveHkdAmt', width: 90 },
		{ prop: 'receiveEurAmt', label: '应收EUR', type: 'text', key: 'receiveEurAmt', width: 90 },
		{ prop: 'receiveGbpAmt', label: '应收GBP', type: 'text', key: 'receiveGbpAmt', width: 90 },
		{ prop: 'receiveVndAmt', label: '应收VND', type: 'text', key: 'receiveVndAmt', width: 90 },
		{ prop: 'receiveMxnAmt', label: '应收MXN', type: 'text', key: 'receiveMxnAmt', width: 90 },
		{ prop: 'payUsdAmt', label: '应付USD', type: 'text', key: 'payUsdAmt', width: 90 },
		{ prop: 'payCnyAmt', label: '应付CNY', type: 'text', key: 'payCnyAmt', width: 90 },
		{ prop: 'payHkdAmt', label: '应付HKD', type: 'text', key: 'payHkdAmt', width: 90 },
		{ prop: 'payEurAmt', label: '应付EUR', type: 'text', key: 'payEurAmt', width: 90 },
		{ prop: 'payGbpAmt', label: '应付GBP', type: 'text', key: 'payGbpAmt', width: 90 },
		{ prop: 'payVndAmt', label: '应付VND', type: 'text', key: 'payVndAmt', width: 90 },
		{ prop: 'payMxnAmt', label: '应付MXN', type: 'text', key: 'payMxnAmt', width: 90 },
		{ prop: 'writeoffReceiveUsdAmt', label: '已收USD', type: 'text', key: 'writeoffReceiveUsdAmt', width: 90 },
		{ prop: 'writeoffReceiveCnyAmt', label: '已收CNY', type: 'text', key: 'writeoffReceiveCnyAmt', width: 90 },
		{ prop: 'writeoffReceiveHkdAmt', label: '已收HKD', type: 'text', key: 'writeoffReceiveHkdAmt', width: 90 },
		{ prop: 'writeoffReceiveEurAmt', label: '已收EUR', type: 'text', key: 'writeoffReceiveEurAmt', width: 90 },
		{ prop: 'writeoffReceiveGbpAmt', label: '已收GBP', type: 'text', key: 'writeoffReceiveGbpAmt', width: 90 },
		{ prop: 'writeoffReceiveVndAmt', label: '已收VND', type: 'text', key: 'writeoffReceiveVndAmt', width: 90 },
		{ prop: 'writeoffReceiveMxnAmt', label: '已收MXN', type: 'text', key: 'writeoffReceiveMxnAmt', width: 90 },
		{ prop: 'writeoffPayUsdAmt', label: '已付USD', type: 'text', key: 'writeoffPayUsdAmt', width: 90 },
		{ prop: 'writeoffPayCnyAmt', label: '已付CNY', type: 'text', key: 'writeoffPayCnyAmt', width: 90 },
		{ prop: 'writeoffPayHkdAmt', label: '已付HKD', type: 'text', key: 'writeoffPayHkdAmt', width: 90 },
		{ prop: 'writeoffPayEurAmt', label: '已付EUR', type: 'text', key: 'writeoffPayEurAmt', width: 90 },
		{ prop: 'writeoffPayGbpAmt', label: '已付GBP', type: 'text', key: 'writeoffPayGbpAmt', width: 90 },
		{ prop: 'writeoffPayVndAmt', label: '已付VND', type: 'text', key: 'writeoffPayVndAmt', width: 90 },
		{ prop: 'writeoffPayMxnAmt', label: '已付MXN', type: 'text', key: 'writeoffPayMxnAmt', width: 90 },
		{ prop: 'noInvoiceReceiveUsdAmt', label: '应收待开票USD', type: 'text', key: 'noInvoiceReceiveUsdAmt', width: 120 },
		{ prop: 'noInvoiceReceiveCnyAmt', label: '应收待开票CNY', type: 'text', key: 'noInvoiceReceiveCnyAmt', width: 120 },
		{ prop: 'noInvoiceReceiveHkdAmt', label: '应收待开票HKD', type: 'text', key: 'noInvoiceReceiveHkdAmt', width: 120 },
		{ prop: 'noInvoiceReceiveEurAmt', label: '应收待开票EUR', type: 'text', key: 'noInvoiceReceiveEurAmt', width: 120 },
		{ prop: 'noInvoiceReceiveGbpAmt', label: '应收待开票GBP', type: 'text', key: 'noInvoiceReceiveGbpAmt', width: 120 },
		{ prop: 'noInvoiceReceiveVndAmt', label: '应收待开票VND', type: 'text', key: 'noInvoiceReceiveVndAmt', width: 120 },
		{ prop: 'noInvoiceReceiveMxnAmt', label: '应收待开票MXN', type: 'text', key: 'noInvoiceReceiveMxnAmt', width: 120 },
		{ prop: 'noInvoicePayUsdAmt', label: '应付待开票USD', type: 'text', key: 'noInvoicePayUsdAmt', width: 120 },
		{ prop: 'noInvoicePayCnyAmt', label: '应付待开票CNY', type: 'text', key: 'noInvoicePayCnyAmt', width: 120 },
		{ prop: 'noInvoicePayHkdAmt', label: '应付待开票HKD', type: 'text', key: 'noInvoicePayHkdAmt', width: 120 },
		{ prop: 'noInvoicePayEurAmt', label: '应付待开票EUR', type: 'text', key: 'noInvoicePayEurAmt', width: 120 },
		{ prop: 'noInvoicePayGbpAmt', label: '应付待开票GBP', type: 'text', key: 'noInvoicePayGbpAmt', width: 120 },
		{ prop: 'noInvoicePayVndAmt', label: '应付待开票VND', type: 'text', key: 'noInvoicePayVndAmt', width: 120 },
		{ prop: 'noInvoicePayMxnAmt', label: '应付待开票MXN', type: 'text', key: 'noInvoicePayMxnAmt', width: 120 },
		{ prop: 'receiveInvocieNos', label: '应收发票号', type: 'text', key: 'receiveInvocieNos', width: 120 },
		{ prop: 'payInvocieNos', label: '应付发票号', type: 'text', key: 'payInvocieNos', width: 120 },
    { prop: 'atdTime', label: '大船实际开船时间（ATD）', type: 'text', key: 'atdTime', width: 125 },
    { prop: 'ataTime', label: '大船实际到港时间（ATA）', type: 'text', key: 'ataTime', width: 125 },
		{ prop: 'leatestReceiveDate', label: '最后回款日期', type: 'text', key: 'leatestReceiveDate', width: 125 },
		{ prop: 'orderStatus', label: '订单状态', type: 'select', key: 'orderStatus' },
    { prop: 'bargeEtdTime', label: '驳船预计开船时间', type: 'text', key: 'bargeEtdTime', width: 125 },
		{ prop: 'bargeAtdTime', label: '驳船实际开船时间', type: 'text', key: 'bargeAtdTime', width: 125 },
		{ prop: 'invoiceDate', label: '开票日期', type: 'text', key: 'invoiceDate', width: 125 },
		{ prop: 'writeOffDate', label: '核销日期', type: 'text', key: 'writeOffDate', width: 100 },
  ],
  columnsBase2: [
		{ prop: 'invoiceType', label: '开票类型', type: 'select', key: 'invoiceType' },
		{ prop: 'invoiceReceivableApplyNo', label: '发票号', type: 'text', key: 'invoiceReceivableApplyNo' },
		{ prop: 'title', label: '发票抬头', type: 'text', key: 'title', width: 130 },
		{ prop: 'invoiceNo', label: '发票号', type: 'text', key: 'invoiceNo' },
		{ prop: 'writeoffAmt', label: '已核销金额', type: 'text', key: 'writeoffAmt' },
		{ prop: 'lockAmt', label: '占用金额', type: 'text', key: 'lockAmt' },
		{
			prop: 'remainingAmount', label: '剩余可用金额', type: 'text', key: 'remainingAmount',
			formatter: ({row}) => {
				return decimalFixed2(row.amt - row.writeoffAmt - row.lockAmt)
			}
		},
		{ prop: 'currency', label: '开票币种', type: 'select', key: 'currency', disabled: true },
		{ prop: 'amt', label: '开票金额', type: 'input', key: 'amt', inputType: "number", maxlength: "16" },
		{ prop: 'splitUnitAmt', label: '关联金额', type: 'text', key: 'splitUnitAmt' },
		{ prop: 'rate', label: '开票汇率', type: 'text', key: 'rate' },
		{ prop: 'taxRate', label: '开票税率', type: 'text', key: 'taxRate' },
		{ prop: 'transferFeeType', label: '内外扣类型', type: 'select', key: 'transferFeeType', formatter: (row, pItem) => { if (row[pItem.prop] === 'inter_cut') return '内扣'; if (row[pItem.prop] === 'exter_cut') return '外扣' } },
		{ prop: 'cutType', label: '内外扣类型', type: 'select', propInDict: 'transferFeeType', disabled: false, key: 'cutType', formatter: (row, pItem) => { if (row[pItem.prop] === 'inter_cut') return '内扣'; if (row[pItem.prop] === 'exter_cut') return '外扣' } },
		{ prop: 'transferFee', label: '金额', type: 'input', inputType: "number", minWidth: '100px', key: 'transferFee', maxlength: "16" },
	],
	columnsBase3: [
		{ prop: 'settleCorpName', label: '结算单位', type: 'text', key: 'settleCorpName' },
		{ prop: 'settleCompName', label: '结算单位', type: 'text', key: 'settleCompName' },
		{ prop: 'feeName', label: ' 费用名称', type: 'text', key: 'feeName' },
		{ prop: 'feeEnName', label: ' 费用英文名称', type: 'text', key: 'feeEnName' },
		{ prop: 'oldSettleAmt', label: '原金额', type: 'text', key: 'oldSettleAmt' },
		{ prop: 'originalCurrency', label: ' 原币种', type: 'text', key: 'originalCurrency' },
		{ prop: 'settleAmt', label: '结算金额', type: 'text', key: 'settleAmt' },
		{ prop: 'settleCurrency', label: '结算币种', type: 'text', key: 'settleCurrency' },
		{ prop: 'settleExRate', label: '结算汇率', type: 'text', key: 'settleExRate' },
		{ prop: 'writeoffCurrency', label: '核销币种', type: 'text', key: 'writeoffCurrency' },
		{ prop: 'currency', label: '核销币种', type: 'text', key: 'currency' },
		{ prop: 'writeoffFeeAmt', label: '核销金额', type: 'text', key: 'writeoffFeeAmt' },
		{ prop: 'writeoffAmt', label: '核销金额', type: 'text', key: 'writeoffAmt' },
		{ prop: 'lessPayAmt', label: '短款金额', type: 'text', key: 'lessPayAmt' },
		{ prop: 'writeoffExRate', label: '核销汇率', type: 'text', key: 'writeoffExRate' },
		{ prop: 'serviceName', label: '服务项', type: 'text', key: 'serviceName' },
		{ prop: 'feeUnit', label: '计费单位', type: 'select', key: 'feeUnit' },
		{ prop: 'unitPrice', label: '单位', type: 'text', key: 'unitPrice' },
		{ prop: 'unitCount', label: '数量', type: 'text', key: 'unitCount' },
	],
	columnsBase4: [
		{
			prop: 'orderNo', label: '工作单号', type: 'button', key: 'orderNo', width: "140px",
			operationBtns: {
				show: true,
				callback: (fn, index, row, option) => {
					if (!row.orderNo && !row.finBillNo) {
						return this.$message.error('单号不能为空！')
					}
					let query = { orderNo: row.orderNo, component: 'Fee' }
					this.$router.push("FinBillListDetail", query)
				},
			},
		},
		{ prop: 'settleCorpName', label: '结算单位', type: 'text', key: 'settleCorpName' },
		{ prop: 'settleOrderNo', label: '结算单编号', type: 'text', key: 'settleOrderNo' },
		{ prop: 'feeName', label: '费用名称', type: 'text', key: 'feeName' },
		{ prop: 'feeEnName', label: '费用英文名', type: 'text', key: 'feeEnName' },
		{ prop: 'feeAmt', label: '原金额', type: 'text', key: 'feeAmt' },
		{ prop: 'currency', label: ' 原币种', type: 'text', key: 'currency' },
		{ prop: 'settleAmt', label: '结算金额', type: 'text', key: 'settleAmt' },
		{ prop: 'settleCurrency', label: '结算币种', type: 'text', key: 'settleCurrency' },
		{ prop: 'noWriteoffAmt', label: '可核销金额', type: 'text', key: 'noWriteoffAmt' },
		{ prop: 'settleExRate', label: '结算汇率', type: 'text', key: 'settleExRate' },
		{ prop: 'writeoffCurrency', label: '核销币种', type: 'text', key: 'writeoffCurrency' },
		{ prop: 'writeoffFeeAmt', label: '核销金额', type: 'input', key: 'writeoffFeeAmt', inputType: "number", maxlength: "16" },
		{ prop: 'lessPayAmt', label: '短款金额', type: 'input', key: 'lessPayAmt', inputType: "number", maxlength: "16" },
		{ prop: 'writeoffExRate', label: '核销汇率', type: 'text', key: 'writeoffExRate' },
		{ prop: 'writeoffAmt', label: '折币金额', type: 'text', key: 'writeoffAmt' },
		{ prop: 'serviceName', label: '服务项', type: 'text', key: 'serviceName' },
		{ prop: 'feeUnit', label: '计费单位', type: 'text', key: 'feeUnit', formatter: (row, pItem) => { if (row[pItem.prop] === 'unit') return '箱'; if (row[pItem.prop] === 'bill') return '票'; if (row[pItem.prop] === 'count') return '数量'; if (row[pItem.prop] === 'm') return '体积-立方米'; if (row[pItem.prop] === 'rt') return '重量-每吨' } },
		{ prop: 'unitPrice', label: '单位', type: 'text', key: 'unitPrice' },
		{ prop: 'unitCount', label: '数量', type: 'text', key: 'unitCount' },
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
		columnsBase: columns.columnsBase,
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
          'Authorization': token
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
        reqTime: parseTime(new Date().getTime())
      })
      axios({
        method: 'post',
        url: uri,
        data,
        headers: {
          'Authorization': token
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
          'Authorization': token
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

