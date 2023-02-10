module.exports = (prams) => {
    return {
        "code": 0,
        "data": {
            "customsSupplierName":"上海庆拓货物运输代理有限公司",
            "consignor":{
                "companyName":"深圳市长帆国际物流有限公司",
                "contact":"张三",
                "contactPhone":"13480691609"
            },
            "orderNo":"xxxxx", //工作单号
            "intrustTime":"2020-11-12 12:00:00", //委托时间
            "so":"xxxx",  //订舱号
            "containerCount":1, //箱量
            "pol":"shekou", //起运港
            "pod":"yantian", //目的港
            "vessel":"WAN HAI 512 W079", //船名航次
            "cyCutOff":"2020-11-12 12:00:00", //截关时间
            "customsType":"normal", //报关类型
            "fee":"CNY 100.00", //费用
            "declarationList":[{
                "custName":"单位1",
                "so":"xxxx",
                "cn":"xxxx",
                "containerType":"40GP", //箱型
                "quantity":10, //件数
                "cargoName":"xxxx"
            }],
            "remark":"xxxxxxxxxxx"
        },
        "msg": "success"
    }
}