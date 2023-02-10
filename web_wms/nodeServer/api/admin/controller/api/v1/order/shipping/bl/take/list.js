module.exports = (prams) => {
    return {
      "code":0,
      "msg":"success",
      "data":{
              "allColumns": [
                  "cyCutOff",
                  "bdEmployeeName",
                  "orderNo",
                  "transitPortCode",
                  "bizDate",
                  "custIntrustNo",
                  "orderStatus",
                  "source",
                  "podPortCode",
                  "shipCarrierCode",
                  "cargoSource",
                  "polPortCode",
                  "businessType"
              ],
              "configColumns": [
                  // "cyCutOff",
                  // "bdEmployeeName",
                  // "orderNo"
              ],
              "pageIndex": 1,
              "list": [
                  {
                      "oid": 1,
                      "orderNo": "S202009300000571",
                      "blNo": 'M12',
                      "blId": 1,
                      "blType": 'mbl',
                      "custName": "XXXX",
                      "shipCarrierCode": "111XX",
                      "bkgAgentSupplierName": "肥嘟嘟",
                      "blMode": "original",
                      "createdBy": "dd",
                      "createdTime": '2020-01-05 11:55:00',
                      "takeEmployeeName": "将大",
                      "takeStatus": "",
                      "takeTime": '2020-09-15 22:11:00',
                      "isCancel": "y",
                      "etdTime": '2020-01-05 11:55:00',
                      "tdTime": '2020-02-05 12:35:00',
                      "etaTime": '2021-01-13 22:11:22',
                      "cancelReason": 'reason1',
                      "cancelRemark": "ttttest",
                      "cancelTime": '2021-01-09 11:22:33',
                  }
              ],
              "pageSize": 10,
              "totalCount": 6,
              "totalPage": 1
          }
      }
  };
  