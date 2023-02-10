module.exports = (params) => {
  return {
    "error_code": 0,
    "data": {
    "prefinCloseStatus": "",
    "prefinCloseTime":"2020-12-11 10:00:00",
    "finCloseStatus":"close",
    "finCloseTime":"2020-12-11 10:00:00",
    "prefinCloseFailList":[{"finMon":"2020-11","errorType":"profit_loss","errorReason":"2020-11利润小于CNY0","createdTime":""},
    {"finMon":"2020-11","errorType":"profit_loss","system_error":"系统异常","createdTime":""}],
    "prefinCloseList":[{"finMon":"2020-11","errorType":"","errorReason":"","createdTime":""}]
    }
  }
}