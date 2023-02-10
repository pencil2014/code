module.exports = (params) => {
    return {
        "code": 0,
        "data": {
            "list": [{
                "voucherRecordId": "voucherRecordId",
                "settleCompCode": "",
                "settleCompName": "settleCompName",
                "acBookId": "",
                "acBookName": "acBookName",
                "bizType": "",
                "bizNo": "",
                "voucherClass": "",
                "voucherClassName": "转",
                "finMonth": "",
                "finDate": "finDate",
                "monPeriod": "monPeriod",
                "acSceneId": "acSceneId",
                "subjectCode": "subjectCode",
                "subjectName": "subjectName",
                "srcCurrency": "srcCurrency",
                "srcAmt": "srcAmt",
                "basicCurrency": "basicCurrency",
                "amt": "100",
                "exRate": "exRate",
                "debitCredit": "debit",
                "dimensioinInfo": "dimensioinInfo",
                "summaryInfo": "summaryInfo",
                "remark": "",
                "seqNo": "1",
                "voucherNo": "voucherNo1",
                "createdBy": 4,
                "createdName": "赵斌",
                "createdTime": "2020-10-15 09:49:05",
                "updatedName": "赵斌",
                "updatedTime": "2020-10-15 09:49:05",
                "settleCompName": 'settleCompName'
            },{
                "voucherRecordId": "voucherRecordId",
                "settleCompCode": "",
                "settleCompName": "settleCompName",
                "acBookId": "",
                "acBookName": "acBookName",
                "bizType": "",
                "bizNo": "",
                "voucherClass": "",
                "voucherClassName": "收",
                "finMonth": "",
                "finDate": "finDate",
                "monPeriod": "monPeriod",
                "acSceneId": "acSceneId",
                "subjectCode": "subjectCode",
                "subjectName": "subjectName",
                "srcCurrency": "srcCurrency",
                "srcAmt": "srcAmt",
                "basicCurrency": "basicCurrency",
                "amt": "100",
                "exRate": "exRate",
                "debitCredit": "credit",
                "dimensioinInfo": "dimensioinInfo",
                "summaryInfo": "summaryInfo",
                "remark": "",
                "seqNo": "2",
                "voucherNo": "voucherNo2",
                "createdBy": 4,
                "createdName": "赵斌",
                "createdTime": "2020-10-15 09:49:05",
                "updatedName": "赵斌",
                "updatedTime": "2020-10-15 09:49:05",
                "settleCompName": 'settleCompName'
            }],
            "currPage": 1,
            "pageSize": 10,
            "totalCount": 1,
            "totalPage": 1
        },
        "msg": "success"
    }
}
// // // // // // // // // // 返回参数// // // // // //// // // // // //
// acBookId	string	账簿id
//```` acBookName	string	账簿名
// bizType	string	业务类型
// bizNo	string	业务单号
//```` subjectCode	string	科目代码
//```` subjectName	string	科目名称
//~~~ voucherClass	string	凭证类别编码（转，付，收，记）
//```` voucherClassName	string	凭证类别名称（转，付，收，记）
//```` srcCurrency	string	原币别
//```` srcAmt	double	原币别金额
// basicCurrency	string	本位币别
//```` amt	double	本位币金额 — 看debitCredit借贷类型，归属借方金额或者贷方金额
//```` exRate	string	汇率
//```` debitCredit	string	借贷类型
// finMonth	string	财务月份
//???? finDate	string	财务日期
//```` monPeriod	string	财务期间
//???? acSceneId	string	对应的凭证场景id
// seqNo	string	凭证唯一标识号
//```` voucherNo	string	凭证号	
//```` dimensioinInfo	string	核算维度信息
//```` summaryInfo	string	摘要
// remark	string	凭证记录描述


// // // // // // // // // // 请求参数// // // // // //// // // // // //
// 参数名	必选	类型	说明
// acBookName	N	string	账簿名称
//```` voucherClass	N	string	凭证类型
//```` startFinDate	N	string	凭证开始时间
//```` endFinDate	N	string	凭证结束时间
//```` startDate	N	string	创建开始时间
//```` endDate	N	string	创建结束时间
//```` startAmt	N	double	起始金额
//```` endAmt	N	double	结束金额
//```` startVoucherNo	N	double	起始凭证号
//```` endVoucherNo	N	double	结束凭证号
// bizNo	N	string	各类编号  TODO
//```` subjectCode	N	string	科目号