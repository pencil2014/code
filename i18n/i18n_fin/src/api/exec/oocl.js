//oocl外部接口调用模块
import request from "@/utils/request";
//oocl城市查询
export function cityList(data) {
  return request({
    url: "/bkg/oocl/city/list",
    method: "post",
    data
  });
}

//oocl船期查询
export function shippingLineList(data) {
  return request({
    url: "/bkg/oocl/book/search",
    method: "post",
    data
  });
}
//oocl获取附加费明细数据
export function extraChargeFeeList(data) {
  return request({
    url: "/bkg/oocl/extraChargeFee",
    method: "post",
    data
  });
}
//oocl船期详情
export function bookInfo(data) {
  return request({
    url: "/bkg/oocl/book/detail",
    method: "post",
    data
  });
}
//oocl订单列表查询
export function orderList(data) {
  return request({
    url: "/bkg/oocl/order/search",
    method: "post",
    data
  });
}
//oocl分公司
export function sapidList(data) {
  return request({
    url: "/bkg/oocl/sapid/list",
    method: "post",
    data
  });
}
//oocl订单详情
export function orderDetailInfo(data) {
  return request({
    url: "/bkg/oocl/order/detail",
    method: "post",
    data
  });
}
//oocl订舱接口
export function booking(data) {
  return request({
    url: "/bkg/oocl/booking",
    method: "post",
    data
  });
}
//内陆联运服务
export function intermodalService(data) {
  return request({
    url: "/bkg/oocl/v2/common/intermodalService",
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
