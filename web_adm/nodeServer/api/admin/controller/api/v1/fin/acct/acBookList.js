module.exports = (params) => {
    return {
        "code": 0,
        "data": {
            "list": [{
                "acBookId": 1,
                "acKingdeeAccountId": 'acKingdeeAccountId',
                "bookName": "账簿1",
                "kdNumber": "kdNumber",
                "remark": "",
                "settleCompCode": "",
                "settleCompName": "settleCompName",
                "finMon": "",
                "monPeriod": "",
            }, {
                "acBookId": 2,
                "acKingdeeAccountId": 1,
                "bookName": "账簿2",
                "kdNumber": "",
                "remark": "",
                "settleCompCode": "",
                "settleCompName": "",
                "finMon": "",
                "monPeriod": "",
            }],
            "currPage": 1,
            "pageSize": 10,
            "totalCount": 1,
            "totalPage": 1
        },
        "msg": "success"
    }
}