module.exports = (prams) => {
    return {
        "code":0,
        "msg":"success",
        "data":{
            "allColumns": [
                "cyCutOff",
                "bdEmployeeName",
                "orderNo",
            ],
            "configColumns": [
                "cyCutOff",
                "bdEmployeeName"
            ],
            "currPage": 1,
            "list": [
                {
                    oid: '1',
                    orderNo: '111',
                    blId: '1',
                    content: 'xxxxxxxxxxxxx', //节点内容
                    bizTime: '2021-01-05 22:00:00',
                    bizEmployeeId: '1',
                    bizEmployeeName: '京东卡',
                    bizDeptCode: 'bd',
                    bizDeptName: '销售'
                },
                {
                    oid: '2',
                    orderNo: '112',
                    blId: '2',
                    content: 'testtttttttttttt', //节点内容
                    bizTime: '2021-01-05 22:00:00',
                    bizEmployeeId: '2',
                    bizEmployeeName: '进口',
                    bizDeptCode: 'op',
                    bizDeptName: '操作'
                }
            ],
            "pageSize": 10,
            "totalCount": 100,
            "totalPage": 10
        }
    }
};
