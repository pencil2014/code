module.exports = (params) => {
    return {
        "code": 0,
        "data": {
            "list": [{
                "voucherClassId": 1,
                "name": "转",
                "code": "code1"
            }, {
                "voucherClassId": 2,
                "name": "借",
                "code": "code2"
            }, {
                "voucherClassId": 3,
                "name": "贷",
                "code": "code3"
            }],
            "currPage": 1,
            "pageSize": 10,
            "totalCount": 1,
            "totalPage": 1
        },
        "msg": "success"
    }
}