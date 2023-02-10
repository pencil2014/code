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
                      "siCutOff": '2020-01-05 11:55:00',
                      "soInfo": 'L212,L232', //SO信息
                      "blMode": "original",
                      "copySiCheck": "n",  // copy是否确认(y,n)
                      "copyCheckStatus": "submit",  // copy件文件是否确认 draft 初始态， submit 待确认，pass 已确认
                      "etdTime": '2020-01-05 11:55:00',
                      "dnGet": "n",  // dn是否获取(y,n)
                      "dnCheckApplyRemark": "n",  // dn确认申请备注(y,n)
                      "dnCheckStatus": "refuse",  // dn确认结果(draft 初始态， submit 待确认，pass 已确认，refuse 已拒绝)
                      "dnRefuseReason": "reason1",
                      "dnRefuseRemark": "remark1",
                      "takeApplyStatus": "submit",   // 取单发起状态
                      "podFreeIn": "1",
                      "podFreeOut": "2",
                      "podFree": "3",
                      "siRemark": "xxxxxx",
                  }
              ],
              "pageSize": 10,
              "totalCount": 6,
              "totalPage": 1
          }
      }
  };
  