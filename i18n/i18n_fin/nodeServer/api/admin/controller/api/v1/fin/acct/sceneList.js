module.exports = (params) => {
    return {
        "code": 0,
        "data": {
            "list": [{
                "acSceneId": 1,
                "acSceneGroupName": 'aaa',
                "acSceneGroupId": 1,
                "voucherClass": "1",
                "feeBillType": "order",
                "feeBillSubType": "money_pay_writeoff",
                "feeFinGroup": "1",
                "feeCode": "shenzhenditieCode",
                "receipayGroup": "receive",
                "debitCreditType": "debit",
                "rivalSubjectType": "self_define",
                "rivalSubjectCode": "2",
                "rivalCachSubjectCode": "2",
                "subMatchType": "order_service",
                "summaryInfo": "#[部门]#/#[员工]#",
                "isAmtMerge": "yes",
                "cachVoucherClass": "1",
                "remark": "remark",
                "createdName": "赵斌",
                "createdTime": "2020-10-15 09:49:05",
                "updatedName": "赵斌",
                "updatedTime": "2020-10-15 09:49:05",
                "isDefault": "yes"
            }, {
                "acSceneId": 2,
                "acSceneGroupName": 'bbb',
                "acSceneGroupId": 2,
                "voucherClass": "2",
                "feeBillType": "order",
                "feeBillSubType": "money_pay_writeoff",
                "feeFinGroup": "2",
                "feeCode": "shenzhenditieCode",
                "receipayGroup": "pay",
                "debitCreditType": "debit",
                "rivalSubjectType": "self_define",
                "rivalSubjectCode": "2",
                "rivalCachSubjectCode": "2",
                "subMatchType": "order_service",
                "summaryInfo": "#[部门]#/#[员工]#",
                "isAmtMerge": "no",
                "cachVoucherClass": "1",
                "remark": "remark",
                "createdName": "赵斌",
                "createdTime": "2020-10-15 09:49:05",
                "updatedName": "赵斌",
                "updatedTime": "2020-10-15 09:49:05",
                "isDefault": "no"
            }],
            "currPage": 1,
            "pageSize": 10,
            "totalCount": 1,
            "totalPage": 1
        },
        "msg": "success"
    }
}
let a = {
    "time": "2020-11-20 11:05:44:949",
    "msg": "success", "code": 0, "data": {},
    "params": {
        "fromSystem": "web_H5", "toSystem": "mng_base_server",
        "reqId": "nisdf12312bdsfaslfj23243241", "reqTime": "2020-11-20 11:05:44",
        "data": {
            "voucherClass": 2,
            "feeBillType": "order",
            "feeBillSubType": "money_pay_writeoff",
            "feeFinGroup": "2",
            "feeCode": "shenzhenditieCode",
            "receipayGroup": "receive",
            "debitCreditType": "debit",
            "rivalSubjectType": "self_define",
            "rivalSubjectCode": 2,
            "subMatchType": "order_service",
            "rivalCachSubjectCode": 2,
            "cachVoucherClass": 1,
            "isAmtMerge": "yes",
            "isDefault": "yes",
            "acSceneGroupName": "",
            "acSceneGroupRemark": "",
            "summaryInfo": "#[部门]#/#[员工]#"
        }
    }
}


// acSceneGroupId	int	凭证分组id
// acSceneGroupName	int	凭证分组名称--
// voucherClass	string	凭证字分组，转/付、收--
// feeBillType	string	单据类型--
// feeBillSubType	string	单据子类型--
// feeFinGroup	string	费用分组--
// feeCode	string	费用编码--
// receipayGroup	string	收付分组--
// debitCreditType	string	借贷类型--
// rivalSubjectType	string	对手科目匹配类型--
// rivalSubjectCode	string	指定的对手科目号
// subMatchType	string	对手科目子科目匹配方式--
// summaryInfo	string	摘要---
// isAmtMerge	string	是否金额合并--
// cachVoucherClass	string	现金时的凭证字分组  是否是 记字子科目匹配类型(UI) ？？
// rivalCachSubjectCode	string	现金时对手科目号--
// remark	string	备注
// isDefault	string	是否默认--