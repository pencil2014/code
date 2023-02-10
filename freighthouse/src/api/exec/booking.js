import request from "@/utils/request";

// 地址搜索 /msk/city/list
export function getMskCityList(data) {
  return request({
    url: '/bkg/msk/city/list',
    method: 'post',
    data
  })
}

// 货品信息搜索 /msk/commodity/search
export function getMskCommodityList(data) {
  return request({
    url: '/bkg/msk/commodity/search',
    method: 'post',
    data
  })
}

// 获取航线报价/msk/sopt/offer
export function getMskSoptOffer(data) {
  return request({
    url: '/bkg/msk/sopt/offer',
    method: 'post',
    data
  })
}

// 下订单 /msk/booking
export function mskBooking(data) {
  return request({
    url: '/bkg/msk/booking',
    method: 'post',
    data
  })
}

// 已下单成功列表 /msk/so/list
export function getMskSoList(data) {
  return request({
    url: '/bkg/msk/so/list',
    method: 'post',
    data
  })
}

// 刷新订单状态 /msk/so/status
export function refreshStatus(data) {
  return request({
    url: '/bkg/msk/so/status',
    method: 'post',
    data
  })
}