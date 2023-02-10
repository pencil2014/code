module.exports = (prams) => {
  return {
    "code":0,
    "msg":"success",
    "data":{
      "barge": {
        "cutoffTime": "2020-01-21",
        "etdTime": "2020-11-30",
        "tdTime": "2020-11-03",
        "porPortCode": "ESCAR",
        "transitWay": "international_transfer",
        "vessel": '放得开',
        "voyage": "s123",
      },
      "cargoList": [
        {
          "oid": 1,
          "boxRemark": "111",
          "cname": "ee",
          "commodityTypeCode": "ttt",
          "dangerousCode": "x",
          "dangerousGrade": "type1",
          "ename": "cc",
          "hscode": "1232",
          "isWoodenPackage": "y",
          "packageGroup": "pp",
          "property": "type1"
        },
        {
          "oid": 2,
          "boxRemark": "1122",
          "cname": "ee",
          "commodityTypeCode": "sss",
          "dangerousCode": "xo",
          "dangerousGrade": "type1",
          "ename": "cc",
          "hscode": "123123",
          "isWoodenPackage": "n",
          "packageGroup": "gg",
          "property": "type1"
        }
      ],
      "checkPointList": [ // 关键节点日志
        {
          "bizEmployeeId": 1, // 员工id
          "bizEmployeeName": "张三",  // 员工编号
          "bizTime": "2020-08-10T17:24:38", // 业务发生时间
          "content": "订单提交",  // 节点内容
          "oid": 10,
          "orderNo": "S202008100000393",
          "serviceCode": "",  // 服务项代码
          "serviceName": "" // 服务项名称
        },
        {
          "bizEmployeeId": 1,
          "bizEmployeeName": "张三",
          "bizTime": "2020-08-10T17:24:32",
          "content": "订单保存",
          "oid": 9,
          "orderNo": "S202008100000393",
          "serviceCode": "",
          "serviceName": ""
        }
      ],
      "intrustRemark": "xxxxx",
      "orderNo": "S202008100000393",
      "jointNo": "S202008100000394",
      "payMode": "all",
      "serviceList": [
        "book", "vgm", "bill_of_loading", "dangerous", "truck", "pol_declaration", "pol_advance_tariff", "pol_inspection", "stuffing", 
        "pol_ltl", "pol_warehouse", "letter_of_guarantee", "doc", "fume"
      ],
      "custid": "ISTRATE SIBTRUCK SRL",   // 委托单位编号
      "businessType": "ship_export_fcl",
      "serviceType": "st01",
      "businessType": 'BT01',
      "orderStatus": '待审核',  // 订单状态
      "bkgStatus": '',  // 订舱状态
      "cancelApplyStatus": 'applied',  // 申请取消状态: applied 已申请
      "ship": {
        "shipAgentSupplierId": "11", // 船公司代理
        "blType": "master",  // 提单类型
        "contractNo": "xxx",
        "cyCutOff": "1998-02-11",   // 大船截关时间
        "freetimeSys": "xxxxxx",    // 免用免堆系统备注
        "issueMode": "prompt",   // 放舱要求备注
        "podPortCode": "REEW",
        "polPortCode": "PYTER",
        "shipCarrierCode": "ANL",
        "sysLineCode": "100074997",   // 航线代码
        "tradeTermsCode": "",
        "transitPortCode": "PYTER, IQUQN",
        "transitWay": "truck",    // 内陆中转方式
        "transportTerm": "cy2cy",
        "isNodrop": "n",  // 是否申请不甩柜(y申请,n不申请)，默认n
        "carrierLineName": "xxx",   // 承运人航线
        "carrierService": "china",   // 航线代码
        "tdTime": "2020-08-11",   // 大船实际开船时间
        "etdTime": "2020-09-11",   // 大船预计开船时间
        "vessel": "黑珍珠",   // 大船船名
        "voyage": "阿波罗",   // 大船船次
        "contractSupplierId": "某某某",   // 合约公司
        "bkgAgentSupplierId": "12",   // 订舱代理
        "siCutOff": "2020-09-29",  // 截补料时间
        "vgmCutOff": "2020-08-19",  // 截VGM时间
      },
      "soContainerList": [
        {
          "containerList": [
            {
              "airMete": "",
              "airMeteType": "type1",
              "boxRemark": "无",
              "containerNum": 2,
              "containerType": "20GP",
              "gangeType": "",
              "humidity": "",
              "sizeAfter": "",
              "sizeBefore": "",
              "sizeLeft": "",
              "sizeRight": "",
              "specialHeight": 0,
              "specialLength": 0,
              "specialWidth": 0,
              "temperatureMax": "",
              "temperatureMin": "",
              "temperatureSet": "",
              "temperatureType": "type1",
              "volume": 23,
              "weight": 111,
              "isHeavy": "y"
            },
            {
              "airMete": "",
              "airMeteType": "type1",
              "boxRemark": "无",
              "containerNum": 1,
              "containerType": "40GP",
              "gangeType": "",
              "humidity": "",
              "sizeAfter": "",
              "sizeBefore": "",
              "sizeLeft": "",
              "sizeRight": "",
              "specialHeight": 0,
              "specialLength": 0,
              "specialWidth": 0,
              "temperatureMax": "",
              "temperatureMin": "",
              "temperatureSet": "",
              "temperatureType": "type1",
              "volume": 23,
              "weight": 111,
              "isHeavy": "n"
            }
          ],
          "isSplit": "y"
        },
        {
          "containerList": [
            {
              "airMete": "",
              "airMeteType": "type1",
              "boxRemark": "无",
              "containerNum": 5,
              "containerType": "40GP",
              "gangeType": "",
              "humidity": "",
              "sizeAfter": "",
              "sizeBefore": "",
              "sizeLeft": "",
              "sizeRight": "",
              "specialHeight": 0,
              "specialLength": 0,
              "specialWidth": 0,
              "temperatureMax": "",
              "temperatureMin": "",
              "temperatureSet": "",
              "temperatureType": "type1",
              "volume": 23,
              "weight": 111,
              "isHeavy": "y"
            },
            {
              "airMete": "",
              "airMeteType": "type1",
              "boxRemark": "无",
              "containerNum": 2,
              "containerType": "40HQ",
              "gangeType": "",
              "humidity": "",
              "sizeAfter": "",
              "sizeBefore": "",
              "sizeLeft": "",
              "sizeRight": "",
              "specialHeight": 0,
              "specialLength": 0,
              "specialWidth": 0,
              "temperatureMax": "",
              "temperatureMin": "",
              "temperatureSet": "",
              "temperatureType": "type1",
              "volume": 23,
              "weight": 111,
              "isHeavy": "y"
            }
          ],
          "isSplit": "n"
        }
      ],
      "transport": {
        "tradeTermsCode": "1",
        "transportTerm": "cy2cy",
        "blMode": "original",
        "destinationArea": "中国",
        "deliveryPlace": "xxxx",
        "overseaAgentSupplierId": "fdjfkds",
        "shipper": "欧阳芳",
        "consignee": "乔峰",
        "notify1": "通知人1",
        "notify2": "通知人2",
        "notify3": "通知人3"
      },
      "workAssign": [ // 工作项分配列表
        {
          "deptCode": "000",
          "employeeId": 1,
          "employeeName": "欧阳锋",
          "jobCname": "业务",
          "jobCode": "SALES",
          "jobEname": "SALES"
        },
        {
          "deptCode": "000",
          "employeeId": 1,
          "employeeName": "东邪",
          "jobCname": "商务",
          "jobCode": "BD",
          "jobEname": "BD"
        },
        {
          "deptCode": "000",
          "employeeId": 1,
          "employeeName": "大力王",
          "jobCname": "订舱",
          "jobCode": "BKG",
          "jobEname": "BKG"
        }
      ]    
    }
  }
};
