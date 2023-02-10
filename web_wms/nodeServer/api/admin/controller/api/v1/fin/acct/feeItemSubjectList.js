module.exports = (params) => {
    return {
        "code": 0,
        "data": {
            "list": [{
                "oid": 1,
                "feeFinGroup": "1",
                "feeFinGroupName": "cn1",
                "feeCode": "shenzhenfengongsiCode",
                "feeName": "深圳分公司",
                "receipayGroup": "receive",
                "subjectCode": "subjectCode",
                "subjectFullName": "",
                "subjectName": "subjectName",
                "createdBy": 0,
                "createdName": "",
                "createdTime": null
            },{
                "oid": 1,
                "feeFinGroup": "2",
                "feeFinGroupName": "cn2",
                "feeCode": "shenzhenditieCode",
                "feeName": "深圳地铁银保",
                "receipayGroup": "pay",
                "subjectCode": "",
                "subjectFullName": "",
                "subjectName": "",
                "createdBy": 0,
                "createdName": "",
                "createdTime": null
            }],
            "currPage": 1,
            "pageSize": 10,
            "totalCount": 1,
            "totalPage": 1
        },
        "msg": "success"
    }
}
// feeFinGroup	Int	费用分类编码
// feeFinGroupName	Int	费用分类名称
// feeCode	String	费用编码
// feeName	String	费用名称
// receipayGroup	Int	收付类型
// subjectCode	String	科目号
// subjectFullName	String	科目全称
// subjectName	String	科目名称