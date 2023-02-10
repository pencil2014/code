import request from "@/utils/request";
//船司列表
export function shippingCarrierList(data) {
  return request({
    url: "crm/shippingCarrier/list",
    method: "post",
    data,
  });
}
//船司详情
export function shippingCarrierInfo(data) {
    return request({
      url: "crm/shippingCarrier/verifyInfo",
      method: "post",
      data,
    });
  }
