module.exports = (params) => {
  return {
    "code" : 0,
    "data" : {
       "offSetPayFeeSumList" : [],
       "offSetRecFeeSumList" : [
          {
             "currency" : "USD",
             "sumAmt" : 7000
          },
          {
             "currency" : "CNY",
             "sumAmt" : 7599
          }
       ],
       "offsetPayType" : "pay",
       "orignalPayFeeSumList" : [
          {
             "currency" : "USD",
             "sumAmt" : 10000
          },
          {
             "currency" : "CNY",
             "sumAmt" : 10000
          }
       ],
       "orignalRecFeeSumList" : [
          {
             "currency" : "CNY",
             "sumAmt" : 2401
          }
       ],
       "settleCompCode" : "000001",
       "settleCompName" : "深圳分公司",
       "settleCorpCode" : "000007",
       "settleCorpName" : "青岛分公司",
       "settleOrderFeeList" : [
          {
             "badAmt" : 0,
             "canUseSettleAmt" : 7000,
             "currency" : "USD",
             "dedueAmt" : 0,
             "exSettleAmt" : 0,
             "feeAmt" : 10000,
             "feeAmtWithTax" : 0,
             "feeCode" : "LSS",
             "feeEnName" : "LSS",
             "feeId" : 9,
             "feeName" : "低硫燃油附加费",
             "finBillNo" : "",
             "gedgingAmt" : 3000,
             "invoiceAmt" : 0,
             "noWriteoffAmt" : 0,
             "orderNo" : "",
             "receipayType" : "pay",
             "settleAmt" : 7000,
             "settleApplyAmt" : 0,
             "settleCompCode" : "000001",
             "settleCompName" : "深圳分公司",
             "settleCorpCode" : "000007",
             "settleCorpName" : "青岛分公司",
             "settleCurrency" : "USD",
             "settleCycle" : "monthly",
             "settleExRate" : 0,
             "settleExRateId" : 0,
             "settleLock" : "unlock",
             "settleOrderFeeId" : 0,
             "settleOrderId" : 0,
             "taxRate" : 0,
             "writeoffAmt" : 0,
             "writeoffExRate" : 0
          }
       ],
       "settleOrderNo" : "Settle20201014160119000023",
       "settlePayFeeSumList" : [
          {
             "currency" : "USD",
             "sumAmt" : 7000
          },
          {
             "currency" : "CNY",
             "sumAmt" : 10000
          }
       ],
       "settleRecFeeSumList" : [
          {
             "currency" : "CNY",
             "sumAmt" : 2401
          }
       ]
    },
    "msg" : "success"
  }
}