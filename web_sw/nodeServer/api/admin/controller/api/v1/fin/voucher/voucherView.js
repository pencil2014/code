module.exports = (params) => {
    return {
        "code": 0,
        "data": {
            "voucherRecord": {
                "acBookId": "acBookId",
                "bizType": "bizType",
                "bizNo": "bizNo",
                "voucherClass": "voucherClass",
                "finMonth": "finMonth",
                "finDate": "finDate",
                "monPeriod": "monPeriod",
                "acSceneId": "acSceneId",
                "debitAmt": "debitAmt",
                "creditAmt": "creditAmt",
                "seqNo": "seqNo",
                "voucherNo": "voucherNo"
            },
            "voucherItemList": [
                {
                    "debitCredit": "debit",
                    "subjectCode": "subjectCode",
                    "subjectName": "subjectName",
                    "srcCurrency": "srcCurrency",
                    "basicCurrency": "basicCurrency",
                    "exRate": "exRate",
                    "seqNo": "seqNo",
                    "srcAmt": "srcAmt",
                    "amt": "100",
                    "dimensioinInfo": "dimensioinInfodimensioinInfodimensioinInfo",
                    "summaryInfo": "summaryInfosummaryInfosummaryInfo",
                    "remark": "remark"
                },
                {
                    "debitCredit": "credit",
                    "subjectCode": "subjectCode",
                    "subjectName": "subjectName",
                    "srcCurrency": "srcCurrency",
                    "basicCurrency": "basicCurrency",
                    "exRate": "exRate",
                    "seqNo": "seqNo",
                    "srcAmt": "srcAmt",
                    "amt": "100",
                    "dimensioinInfo": "dimensioinInfo",
                    "summaryInfo": "summaryInfo",
                    "remark": "remark"
                },
            ]
        },
        "msg": "success"
    }
}
// voucherRecord.acBookId	string	账簿id
// voucherRecord.bizType	string	业务类型
// voucherRecord.bizNo	string	业务单号
// voucherRecord.voucherClass	string	凭证类别（转，付，收，记）
// voucherRecord.finMonth	string	财务月份
// voucherRecord.finDate	string	财务日期
// voucherRecord.acSceneId	string	对应的凭证场景id
// voucherRecord.debitAmt	string	总借方金额
// voucherRecord.creditAmt	string	总贷方金额
// voucherRecord.seqNo	string	凭证唯一标识号
// voucherRecord.voucherNo	string	凭证号,从1开始
// voucherItemList.debitCredit	string	借贷方向
// voucherItemList.subjectCode	string	科目编码
// voucherItemList.subjectName	string	科目名称
// voucherItemList.srcCurrency	string	原币别
// voucherItemList.basicCurrency	string	本位币别
// voucherItemList.exRate	string	汇率
// voucherItemList.seqNo	string	凭证明细记录唯一标识号
// voucherItemList.srcAmt	string	原币金额
// voucherItemList.amt	string	本位币金额
// voucherItemList.dimensioinInfo	string	核算维度
// voucherItemList.summaryInfo	string	摘要
// voucherItemList.remark	string	记录描述