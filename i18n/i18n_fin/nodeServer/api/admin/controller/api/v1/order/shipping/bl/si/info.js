module.exports = (prams) => {
  return {
    "code":0,
    "msg":"success",
    "data":{
      "blNo": "M001",
      "blId": 1,
      "blMode": 'original',
      "blType": "mbl",
      "custName": "裤子",
      "shipCarrierCode": "111",
      "bkgAgentSupplierName": "f附近的开始",
      "vessel": "船名",
      "voyage": "航次",
      "containerList": [
        {
          containerType:'20Gp',
          cn:'111',
          sn: 'sn1',
          so: "so111",
          quantity: 1,
          volume: 11,
          weight: 111,
          packageType: 'box'
        }
      ],
      "obdCheck": "y",  //obd提单确认 (y,n)
      "siCheck": "y", // 补料完成确认 (y,n)
      "copySiCheck": "y", // COPY件补料确认 (y,n)
      "dnGet": "y", // 是否收到船东费用单 (y,n)
      "dnFeeInput": "n",  // dn费用已录入 (y,n)
      "oid": 1,
      "orderNo": "hello_003",
      "copyCheckStatus": "pass",  // COPY件确认状态 draft 初始，subimit，pass 已确认，refuse 已拒绝
      "copyRefuseReson": "COPY件拒绝原因",
      "copyRefuseRemark": "xxx", // COPY件拒绝备注
      "etdTime": "2020-01-04 11:00:00",
      "tdTime": "2020-01-05 13:00:00",
      "etaTime": "2020-02-04 19:22:00",
      "dnCheckStatus": "submit",  // 船东费用单审核状态 draft 初始，subimit，pass 已确认，refuse 已拒绝
      "dnCheckApplyRemark": 5,    // 船东费用单审核申请备注
      "dnRefuseReason": "reason1",  // 船东费用单审核拒绝原因
      "dnRefuseRemark": "remark",   // 船东费用单审核拒绝备注
      "takeApplyStatus": 'submit', // 取单状态draft 初始，subimit，pass 已确认，refuse 已拒绝
      "podFreeIn": "0",
      "podFreeOut": "2",
      "podFree": '3',
      "isCancel": 'y',
      "cancelReason": "reason1",
      "cancelRemark": 'remark22',
      "cancelTime": '2020-01-05',
      "siRemark": 'remarkl', // 补料备注信息
      "remark": "备注",
      "pricingEmployeeId": 10,
      "pricingEmployeeName": "配置",
      "workAssign":[
        {"deptCode":"000002001","employeeId":25,"employeeName":"广州业务【勿动】","jobCname":"销售","jobCode":"bd","jobEname":"bd"},
        {"deptCode":"000002001","employeeId":25,"employeeName":"广州业务【勿动】","jobCname":"销售助理","jobCode":"obd","jobEname":"obd"},
        {"deptCode":"000002001","employeeId":27,"employeeName":"广州商务【勿动】","jobCname":"商务","jobCode":"pricing","jobEname":"pricing"},
        {"deptCode":"000002001","employeeId":28,"employeeName":"广州订舱【勿动】","jobCname":"订舱","jobCode":"bkg","jobEname":"bkg"},
        {"deptCode":"000002001","employeeId":29,"employeeName":"广州操作【勿动】","jobCname":"操作","jobCode":"op","jobEname":"op"},
        {"deptCode":"000002001","employeeId":30,"employeeName":"广州文件【勿动】","jobCname":"文件","jobCode":"doc","jobEname":"doc"},
        {"deptCode":"","employeeId":1,"employeeName":"xxx","jobCname":"提单客服","jobCode":"csc","jobEname":"csc"},
        {"deptCode":"","employeeId":2,"employeeName":"发多少","jobCname":"放货","jobCode":"rc","jobEname":"rc"},
        {"deptCode":"000002001","employeeId":31,"employeeName":"广州应收【勿动】","jobCname":"应收","jobCode":"ac","jobEname":"ac"}
      ]
    }
  }
};
