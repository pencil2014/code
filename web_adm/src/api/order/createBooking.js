import request from "@/utils/request";
// 城市列表
export function cityList(data) {
  return request({
    url: "/ext/ship/edi/city/list",
    method: "post",
    data
  });
}
// 船司列表
export function carrierList(data) {
  return request({
    url: "/ext/ship/edi/carrier/list",
    method: "post",
    data
  });
}
// hscode列表
export function hscodeList(data) {
  return request({
    url: "/ext/ship/edi/hscode/list",
    method: "post",
    data
  });
}
// 包装类型
export function packageList(data) {
  return request({
    url: "/ext/ship/edi/package/list",
    method: "post",
    data
  });
}
// 箱型
export function containerTypeList(data) {
  return request({
    url: "/ext/ship/edi/containerType/list",
    method: "post",
    data
  });
}
// 外部公共字典
export function dictAll(data) {
  return request({
    url: "/ext/dict/all",
    method: "post",
    data
  });
}
// 获取shipId
export function shipId(data) {
  return request({
    url: "/ext/ship/edi/shipId",
    method: "post",
    data
  });
}
// 获取booker
export function booker(data) {
  return request({
    url: "/ext/ship/edi/booker",
    method: "post",
    data
  });
}
// 订舱
export function bkgOriginal(data) {
  return request({
    url: "/ext/ship/edi/bkg/original",
    method: "post",
    data
  });
}
// 订舱
export function bkgOriginalLeyu(data) {
  return request({
    url: "/ext/ship/edi/leyu/bkg/original",
    method: "post",
    data
  });
}
// 订舱
export function bkgOriginalCgm(data) {
  return request({
    url: "/ext/ship/edi/cg/bkg/original",
    method: "post",
    data
  });
}
// 订舱
export function bkgOriginalEmc(data) {
  return request({
    url: "/ext/ship/edi/emc/bkg/original",
    method: "post",
    data
  });
}
// 订舱
export function bkgOriginalHmm(data) {
  return request({
    url: "/ext/ship/edi/hmm/bkg/original",
    method: "post",
    data
  });
}
// 补料
export function siOriginal(data) {
  return request({
    url: "/ext/ship/edi/si/original",
    method: "post",
    data
  });
}
// 补料  hmm/si/original
export function siOriginalHmm(data) {
  return request({
    url: "/ext/ship/edi/hmm/si/original",
    method: "post",
    data
  });
}
// 补料
export function siOriginalLeyu(data) {
  return request({
    url: "/ext/ship/edi/leyu/si/original",
    method: "post",
    data
  });
}
// 补料
export function siOriginalCgm(data) {
  return request({
    url: "/ext/ship/edi/cg/si/original",
    method: "post",
    data
  });
}
// 补料
export function siOriginalEmc(data) {
  return request({
    url: "/ext/ship/edi/emc/si/original",
    method: "post",
    data
  });
}
// 危险品imo列表
export function imoList(data) {
  return request({
    url: "/ext/ship/edi/imo/list",
    method: "post",
    data
  });
}

// 在线业务编号及so号
export function onlineBookNo(data) {
  return request({
    url: "/ext/ship/edi/bkg/onlineInfo",
    method: "post",
    data
  });
}

// 在线业务编号及so号
export function onlineSiNo(data) {
  return request({
    url: "/ext/ship/edi/si/onlineInfo",
    method: "post",
    data
  });
}

// 在线订舱列表
export function bkgList(data) {
  return request({
    url: "/ext/ship/edi/bkg/list",
    method: "post",
    data
  });
}

// 在线补料列表
export function siList(data) {
  return request({
    url: "/ext/ship/edi/si/list",
    method: "post",
    data
  });
}

// 在线订舱列表详情
export function bkgDetail(data) {
  return request({
    url: "/ext/ship/edi/bkg/detail",
    method: "post",
    data
  });
}

// 在线补料列表详情
export function siDetail(data) {
  return request({
    url: "/ext/ship/edi/si/detail",
    method: "post",
    data
  });
}

// 船期
export function schedule(params) {
  return request({
    url: "/spider/spider/api/schedule",
    method: "post",
    params,
    headers:{
      ['Content-Type']:'application/x-www-form-urlencoded'
    }
  });
}

// 补料导出 /ship/edi/si/export
export function siExport(data) {
  return request({
    url: '/ext/ship/edi/si/export',
    method: 'post',
    data
  })
}