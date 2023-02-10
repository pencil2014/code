export default [
  // 结算单详情《=结算单列表|供应商对账|坏账申请列表|寄单列表|专项管理费|结算单费用列表|账单列表
  { fromName: 'SettlementDetail', toName: 'SettlementList' },
  { fromName: 'OrderRefund', toName: 'PayOrder' },
  { fromName: 'SettlementPayApply', toName: 'SettlementList' },
  { fromName: 'WriteOffPreview', toName: 'PayOrder' },
  { fromName: 'WriteOffPreview', toName: 'OrderDetails' },
  // { fromName: 'PrepayDetail', toName: 'Prepay' },
  // { fromName: 'PrepayDetail', toName: 'PayOrder' },
  // { fromName: 'PrepayEdit', toName: 'Prepay' },
  // { fromName: 'InvoicePaymentListReg', toName: 'Settle' },
  // { fromName: 'SettleDetail', toName: 'Settle' },
  // { fromName: 'SettlementDetail', toName: 'Settle' },
  { fromName: 'RefundDetail', toName: 'PayApplyReceiveRefundList' },
  { fromName: 'RegWriteoff', toName: 'PayApplyReceiveRefundList' },
  { fromName: 'SettlementDetail', toName: 'SupplierBillList' },
  { fromName: 'SettlementDetail', toName: 'SettleOrderBaddebtList' },
  { fromName: 'SettlementDetail', toName: 'OrderList' },
  { fromName: 'SettlementDetail', toName: 'MySpecialList' },
  { fromName: 'SettlementDetail', toName: 'SettlementFeeList' },
  { fromName: 'SettlementDetail', toName: 'BillList' },
  { fromName: 'SettlementDetail', toName: 'GedgingList' },
  // 对冲详情《=对冲申请列表|对冲核销列表
  { fromName: 'GedgingDetail', toName: 'GedgingList' },
  { fromName: 'GedgingDetail', toName: 'GedgingWriteOffList' },
  { fromName: 'GedgingDetail', toName: 'SettlementFeeList' },
  { fromName: 'GedgingDetail', toName: 'SettlementList' },
  // 开票申请详情《=应收发票列表|开票申请列表
  { fromName: 'InvoiceReceivableApplyDetail', toName: 'InvoiceReceivableList' },
  { fromName: 'InvoiceReceivableApplyDetail', toName: 'InvoiceReceivableApplyList' },
  // 发票详情《=应收发票列表|开票申请列表|收款登记|费用列表
  { fromName: 'InvoiceReceivableDetail', toName: 'InvoiceReceivableList' },
  { fromName: 'InvoiceReceivableDetail', toName: 'InvoiceReceivableApplyList' },
  { fromName: 'InvoiceReceivableDetail', toName: 'RegWriteoff' },
  { fromName: 'InvoiceReceivableDetail', toName: 'SettlementFeeList' },
  // 预付款申请详情《=应付发票列表
  { fromName: 'PrepayDetail', toName: 'InvoicePaymentList' },
  // 结算付款申请详情《=应付发票列表|结算单列表|费用列表
  { fromName: 'SettleDetail', toName: 'InvoicePaymentList' },
  { fromName: 'SettleDetail', toName: 'SettlementList' },
  { fromName: 'SettleDetail', toName: 'SettlementFeeList' },
  // 应付发票详情《=应付发票列表
  { fromName: 'InvoicePaymentListDetail', toName: 'InvoicePaymentList' },
  { fromName: 'InvoicePaymentListDetail', toName: 'SettlementFeeList' },
  // 供应商对账详情《=供应商对账列表
  { fromName: 'SupplierBillListResult', toName: 'SupplierBillList' },
  // 账单详情《=账单列表
  { fromName: 'BillDetail', toName: 'BillList' },
  // 调费详情《=调费申请列表
  { fromName: 'FeeClosedModifyFeeDetail', toName: 'FeeClosedModifyFeeList' },
  // 费用单详情《=费用单列表|费用列表
  { fromName: 'FinBillListDetail', toName: 'FinBillList' },
  { fromName: 'FinBillListDetail', toName: 'SettlementFeeList' },
  { fromName: 'FinBillListDetail', toName: 'SettlementList' },
  // 坏账核销详情《=坏账申请
  { fromName: 'SettleOrderBadDetail', toName: 'SettleOrderBaddebtList' },
  { fromName: 'SettleOrderBadDetail', toName: 'SettlementFeeList' },
  // 结算单对账单详情《=结算单对账单列表
  { fromName: 'SettlementBillDetail', toName: 'SettlementBillList' },
  // 订单列表-详情《=结算单费用列表|账单列表|调费申请
  { fromName: 'OrderFee', toName: 'SettlementFeeList' },
  { fromName: 'OrderFee', toName: 'BillList' },
  { fromName: 'OrderFee', toName: 'FeeClosedModifyFeeList' },
  { fromName: 'OrderFee', toName: 'SettlementList' },
  // 订单内费用变更会引起专项管理费列表变动
  // { fromName: 'OrderDetail', toName: 'MySpecialList' },
  // 客商预付详情《=客商预付列表，更多余额详情
  { fromName: 'InvestorPrepayDetail', toName: 'InvestorPrepay' },
  { fromName: 'InvestorPrepayDetail', toName: 'InvestorPrepayDetailMore' },
  // 更多余额《=客商预付列表
  { fromName: 'InvestorPrepayDetailMore', toName: 'InvestorPrepay' },
  // 余额金额详情、更多、列表，付款单详情《=客商预付详情
  { fromName: 'InvestorPrepayDetailDetail', toName: 'InvestorPrepayDetail' },
  { fromName: 'InvestorPrepay', toName: 'InvestorPrepayDetail' },
  { fromName: 'InvestorPrepayDetailMore', toName: 'InvestorPrepayDetail' },
  { fromName: 'OrderDetails', toName: 'InvestorPrepayDetail' },
  // 客商预付详情《=余额金额详情 特殊（详情页中有分页）
  { fromName: 'InvestorPrepayDetail', toName: 'InvestorPrepayDetailDetail' },
  // 客商预收详情《=客商预收列表，更多余额详情
  { fromName: 'PrerevAccountDetail', toName: 'PrerevAccountListPage' },
  { fromName: 'PrerevAccountDetail', toName: 'PrerevAccountDetailMore' },
  // 更多余额《=客商预收列表
  { fromName: 'PrerevAccountDetailMore', toName: 'PrerevAccountListPage' },
  // 余额金额详情、更多、列表《=客商预收详情
  { fromName: 'PrerevAccountDetailDetail', toName: 'PrerevAccountDetail' },
  { fromName: 'PrerevAccountListPage', toName: 'PrerevAccountDetail' },
  { fromName: 'PrerevAccountDetailMore', toName: 'PrerevAccountDetail' },
  // 客商预收详情《=余额金额详情 特殊（详情页中有分页）
  { fromName: 'PrerevAccountDetail', toName: 'PrerevAccountDetailDetail' },
  // 收款登记《=详情列表,应收发票列表
  { fromName: 'RegDetail', toName: 'RegWriteoff' },
  { fromName: 'RegDetail', toName: 'RegTransfer' },
  { fromName: 'RegDetail', toName: 'SettlementFeeList' },
  { fromName: 'RegDetail', toName: 'InvoiceReceivableList' },
  // 收款核销
  { fromName: 'WriteoffRecvDetail', toName: 'SettlementFeeList' },
  { fromName: 'WriteoffRecvDetail', toName: 'SettlementList' },
  // 结算付款核销
  { fromName: 'DetailSettle', toName: 'WriteoffPay' },
  { fromName: 'DetailSettle', toName: 'SettlementFeeList' },
  // 预付退款付款核销
  { fromName: 'DetailPrepay', toName: 'WriteoffPay' },
  { fromName: 'DetailPrepay', toName: 'SettlementFeeList' },
  // 预付抵账核销
  { fromName: 'PrepayWriteOffDetail', toName: 'WriteoffPay' },
  { fromName: 'PrepayWriteOffDetail', toName: 'SettlementFeeList' },
  // 付款详情
  { fromName: 'OrderDetails', toName: 'PayOrder' },
  { fromName: 'OrderDetails', toName: 'WriteoffPay' },
  { fromName: 'OrderDetails', toName: 'SettlementFeeList' },
  { fromName: 'OrderDetails', toName: 'SettlementList' },

  /************************************** CRM **************************************/
  // 客户详情《= 客户列表，跟进记录列表
  { fromName: 'CustomerDetail', toName: 'CustomerList' },
  { fromName: 'CustomerDetail', toName: 'FollowLog' },
  // 客户部审核详情《= 客户部审核列表
  { fromName: 'CustomerReviewDetail', toName: 'CustomerReviewList' },
  // 客户部审核详情通过《= 客户部审核列表
  { fromName: 'CustomerReviewDetailPass', toName: 'CustomerReviewList' },
  // 供应商详情《= 供应商列表，跟进记录列表
  { fromName: 'SupplierDetail', toName: 'SupplierList' },
  { fromName: 'SupplierDetail', toName: 'FollowLog' },
  // 供应商部审核详情《= 供应商部审核列表
  { fromName: 'SupplierReviewDetail', toName: 'SupplierReviewList' },
  // 供应商部审核详情通过《= 供应商部审核列表
  { fromName: 'SupplierReviewDetailPass', toName: 'SupplierReviewList' },
  // 拜访计划详情《= 拜访计划列表
  { fromName: 'VisitPlanDetail', toName: 'VisitPlan' },
  // 黑名单详情-客户《= 黑名单列表
  { fromName: 'BlackListDetailCustomer', toName: 'BlackList' },
  // 黑名单详情-供应商《= 黑名单列表
  { fromName: 'VisitPlanDetail', toName: 'VisitPlan' },
  // 跟进记录详情-客户《= 跟进记录列表
  // 跟进记录详情-供应商《= 跟进记录列表
	// cosco订单列表 《 = 订单详情
	{fromName: 'CoscoOrderDetail', toName: 'OrderSearch'}
]