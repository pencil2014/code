//coso外部接口调用模块
import request from "@/utils/request";

//钉钉下拉查询
export function dingList(data) {
  return request({
    url: "/bkg/dingding/list",
    method: "post",
    data
  });
}

/**************************  coso 相关接口   ****************************/
//coso城市查询
export function cityList(data) {
  return request({
    url: "/bkg/cosco/city/list",
    method: "post",
    data
  });
}
//coso城市查询 oocl
export function cityOoclList(data) {
  return request({
    url: "/bkg/ooclTask/city/list",
    method: "post",
    data
  });
}
//coso分公司
export function sapidList(data) {
  return request({
    url: "/bkg/cosco/sapid/list",
    method: "post",
    data
  });
}
//coso分公司 oocl
export function ooclUserList(data) {
  return request({
    url: "/bkg/oocl/user/list",
    method: "post",
    data
  });
}

//coso船期查询
export function shippingLineList(data) {
  return request({
    url: "/bkg/cosco/v2/book/search",
    method: "post",
    data
  });
}
//coso船期查询-远期
export function shippingLineListLong(data) {
  return request({
    url: "/bkg/cosco/longTerm/book/search",
    method: "post",
    data
  });
}
// coso船期查询-冷箱
export function shippingLineListReefer(data) {
  return request({
    url: "/bkg/cosco/reefer/book/search",
    method: "post",
    data
  });
}
//内陆联运服务
export function intermodalService(data) {
  return request({
    url: "/bkg/cosco/v2/common/intermodalService",
    method: "post",
    data
  });
}
//内陆联运服务-远期
export function intermodalServiceLong(data) {
  return request({
    url: "/bkg/cosco/longTerm/common/intermodalService",
    method: "post",
    data
  });
}
// 内陆联运服务-冷箱
export function intermodalServiceReefer(data) {
  return request({
    url: "/bkg/cosco/reefer/common/intermodalService",
    method: "post",
    data
  });
}
//coso获取附加费明细数据
export function extraChargeFeeList(data) {
  return request({
    url: "/bkg/cosco/v2/extraChargeFee",
    method: "post",
    data
  });
}
//coso获取附加费明细数据-远期
export function extraChargeFeeListLong(data) {
  return request({
    url: "/bkg/cosco/longTerm/extraChargeFee",
    method: "post",
    data
  });
}
//coso获取附加费明细数据-冷箱
export function extraChargeFeeListReefer(data) {
  return request({
    url: "/bkg/cosco/reefer/extraChargeFee",
    method: "post",
    data
  });
}

//coso订单列表查询
export function orderList(data) {
  return request({
    url: "/bkg/cosco/order/search",
    method: "post",
    data
  });
}
//coso订单列表查询-远期
export function orderListLong(data) {
  return request({
    url: "/bkg/cosco/longTerm/order/search",
    method: "post",
    data
  });
}
//coso订单列表查询-冷箱
export function orderListReefer(data) {
  return request({
    url: "/bkg/cosco/reefer/order/search",
    method: "post",
    data
  });
}
//coso订单详情
export function orderDetailInfo(data) {
  return request({
    url: "/bkg/cosco/order/detail",
    method: "post",
    data
  });
}
//coso订单详情-远期
export function orderDetailInfoLong(data) {
  return request({
    url: "/bkg/cosco/longTerm/order/detail",
    method: "post",
    data
  });
}
//coso订单详情-冷箱
export function orderDetailInfoReefer(data) {
  return request({
    url: "/bkg/cosco/reefer/order/detail",
    method: "post",
    data
  });
}

//coso船期详情
export function bookInfo(data) {
  return request({
    url: "/bkg/cosco/v2/book/detail",
    method: "post",
    data
  });
}
//coso船期详情-远期
export function bookInfoLong(data) {
  return request({
    url: "/bkg/cosco/longTerm/book/detail",
    method: "post",
    data
  });
}
//coso船期详情-冷箱
export function bookInfoReefer(data) {
  return request({
    url: "/bkg/cosco/reefer/book/detail",
    method: "post",
    data
  });
}
//coso订舱接口
export function booking(data) {
  return request({
    url: "/bkg/cosco/v2/booking",
    method: "post",
    data
  });
}
//coso订舱接口-远期订单提交
export function bookingOrder(data) {
  return request({
    url: "/bkg/cosco/longTerm/order",
    method: "post",
    data
  });
}
//coso订舱接口-远期订舱提交
export function bookingLong(data) {
  return request({
    url: "/bkg/cosco/longTerm/booking",
    method: "post",
    data
  });
}
//coso订舱接口-冷箱订单提交
export function bookingReefer(data) {
  return request({
    url: "/bkg/cosco/reefer/booking",
    method: "post",
    data
  });
}
// 提高优先级
export function setHp(data) {
  return request({
    url: "/bkg/coscoTask/setHp",
    method: "post",
    data
  });
}
// 提高优先级 oocl
export function setOoclHp(data) {
  return request({
    url: "/bkg/ooclTask/setHp",
    method: "post",
    data
  });
}

// 取消优先级
export function cancelHp(data) {
  return request({
    url: "/bkg/coscoTask/cancelHp",
    method: "post",
    data
  });
}
// 取消优先级 oocl
export function cancelOoclHp(data) {
  return request({
    url: "/bkg/ooclTask/cancelHp",
    method: "post",
    data
  });
}

// 任务启动
export function startTask(data) {
  return request({
    url: "/bkg/coscoTask/startTask",
    method: "post",
    data
  });
}
// 任务启动 oocl
export function startOoclTask(data) {
  return request({
    url: "/bkg/ooclTask/startTask",
    method: "post",
    data
  });
}

// 任务暂停
export function stopTask(data) {
  return request({
    url: "/bkg/coscoTask/stopTask",
    method: "post",
    data
  });
}
// 任务暂停 oocl
export function stopOoclTask(data) {
  return request({
    url: "/bkg/ooclTask/stopTask",
    method: "post",
    data
  });
}

// 删除任务
export function deleteTask(data) {
  return request({
    url: "/bkg/coscoTask/delete",
    method: "post",
    data
  });
}
// 删除任务 oocl
export function deleteOoclTask(data) {
  return request({
    url: "/bkg/ooclTask/delete",
    method: "post",
    data
  });
}

// 包装类型查询
export function getPackageType(data) {
  return request({
    url: "/bkg/cosco/packageType/list",
    method: "post",
    data
  });
}

// 任务日志
export function taskLog(data) {
  return request({
    url: "/bkg/task/log/list",
    method: "post",
    data
  });
}

/**************************  cma 相关接口   ****************************/
// 查询任务
export function cmaList(data) {
  return request({
    url: "/bkg/cma/task/list",
    method: "post",
    data
  });
}
// 创建任务
export function cmaUpdate(data) {
  return request({
    url: "/bkg/cma/task/saveOrUpdate",
    method: "post",
    data
  });
}
// 删除任务
export function cmaDelete(data) {
  return request({
    url: "/bkg/cma/task/delete",
    method: "post",
    data
  });
}
// 暂停任务
export function cmaStop(data) {
  return request({
    url: "/bkg/cma/task/stop",
    method: "post",
    data
  });
}
// 启动任务
export function cmaStart(data) {
  return request({
    url: "/bkg/cma/task/start",
    method: "post",
    data
  });
}
// 查询港口
export function cmaPort(data) {
  return request({
    url: "/bkg/cma/task/port",
    method: "post",
    data
  });
}
//cma分公司
export function cmaUserList(data) {
  return request({
    url: "/bkg/cma/task/company",
    method: "post",
    data
  });
}
// 查询订舱办事处
export function cmaAgencies(data) {
  return request({
    url: "/bkg/cma/task/getAgencies",
    method: "post",
    data
  });
}
// 查询支付地点
export function cmaPayLocations(data) {
  return request({
    url: "/bkg/cma/task/payLocations",
    method: "post",
    data
  });
}

/**************************  one 相关接口   ****************************/
// 查询任务
export function oneList(data) {
  return request({
    url: "/bkg/oneTask/list",
    method: "post",
    data
  });
}
// 创建任务
export function oneUpdate(data) {
  return request({
    url: "/bkg/oneTask/saveOrUpdate",
    method: "post",
    data
  });
}
// 删除任务
export function oneDelete(data) {
  return request({
    url: "/bkg/oneTask/delete",
    method: "post",
    data
  });
}
// 暂停任务
export function oneStop(data) {
  return request({
    url: "/bkg/oneTask/stop",
    method: "post",
    data
  });
}
// 启动任务
export function oneStart(data) {
  return request({
    url: "/bkg/oneTask/start",
    method: "post",
    data
  });
}
// 查询港口
export function onePort(data) {
  return request({
    url: "/bkg/oneTask/port",
    method: "post",
    data
  });
}
//cma分公司
export function oneUserList(data) {
  return request({
    url: "/bkg/oneTask/company",
    method: "post",
    data
  });
}
