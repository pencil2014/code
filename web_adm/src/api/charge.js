import request from '@/utils/request'

//附加费模板列表
export function surchargeList(data) {
  return request({
    url: '/charge/surcharge/list',
    method: 'post',
    data
  })
}

//新增附加费
export function surchargeAdd(data) {
  return request({
    url: '/charge/surcharge/add',
    method: 'post',
    data
  })
}

//修改附加费模板详情
export function surchargeUpdate(data) {
  return request({
    url: '/charge/surcharge/update',
    method: 'post',
    data
  })
}

//附加费模板详情
export function surchargeInfo(data) {
  return request({
    url: '/charge/surcharge/info',
    method: 'post',
    data
  })
}

//删除附加费模板详情
export function surchargeDelete(data) {
  return request({
    url: '/charge/surcharge/delete',
    method: 'post',
    data
  })
}

//附加费下拉框选择数据
export function userSurchargeList(data) {
  return request({
    url: '/charge/surcharge/userSurchargeList',
    method: 'post',
    data
  })
}


//附加费模板详情
export function userSurchargeInfo(data) {
  return request({
    url: '/charge/feederRoute/surchargeInfo',
    method: 'post',
    data
  })
}

// 大船列表
export function mainRouteList(data) {
  return request({
    url: '/charge/mainRoute/list',
    method: 'post',
    data
  })
}

// 大船单条保存
export function mainRouteSave(data) {
  return request({
    url: '/charge/mainRoute/save',
    method: 'post',
    data
  })
}


// 大船删除
export function mainRouteDelete(data) {
  return request({
    url: '/charge/mainRoute/delete',
    method: 'post',
    data
  })
}

// 大船新增
export function mainRouteAdd(data) {
  return request({
    url: '/charge/mainRoute/add',
    method: 'post',
    data
  })
}

// 大船编辑
export function mainRouteEdit(data) {
  return request({
    url: '/charge/mainRoute/edit',
    method: 'post',
    data
  })
}

// 大船详情
export function mainRouteInfo(data) {
  return request({
    url: '/charge/mainRoute/info',
    method: 'post',
    data
  })
}

// 大船失效
export function mainRouteInvalidRoute(data) {
  return request({
    url: '/charge/mainRoute/invalidRoute',
    method: 'post',
    data
  })
}

// 大船批量发布
export function mainRoutePublishBatch(data) {
  return request({
    url: '/charge/mainRoute/publishBatch',
    method: 'post',
    data
  })
}

// 大船批量失效
export function mainRouteInvalidBatch(data) {
  return request({
    url: '/charge/mainRoute/invalidBatch',
    method: 'post',
    data
  })
}

// 大船批量修改
export function mainRouteMutiEdit(data) {
  return request({
    url: '/charge/mainRoute/mutiEdit',
    method: 'post',
    data
  })
}

// 大船列表导出
export function mainRouteExport(data) {
  return request({
    url: '/charge/mainRoute/export',
    method: 'post',
    data
  })
}

// 驳船列表
export function feederRouteList(data) {
  return request({
    url: '/charge/feederRoute/list',
    method: 'post',
    data
  })
}

// 驳船新增
export function feederRouteAdd(data) {
  return request({
    url: '/charge/feederRoute/add',
    method: 'post',
    data
  })
}

// 驳船费删除
export function feederRouteDelete(data) {
  return request({
    url: '/charge/feederRoute/delete',
    method: 'post',
    data
  })
}



// 驳船新增
export function feederRouteEdit(data) {
  return request({
    url: '/charge/feederRoute/edit',
    method: 'post',
    data
  })
}

// 驳船详情
export function feederRouteInfo(data) {
  return request({
    url: '/charge/feederRoute/info',
    method: 'post',
    data
  })
}

// 驳船失效
export function feederRouteInvalid(data) {
  return request({
    url: '/charge/feederRoute/invalid',
    method: 'post',
    data
  })
}

// 驳船批量修改
export function feederRouteUpdateBatch(data) {
  return request({
    url: '/charge/feederRoute/updateBatch',
    method: 'post',
    data
  })
}

// 驳船批量发布
export function feederRoutePublishBatch(data) {
  return request({
    url: '/charge/feederRoute/publishBatch',
    method: 'post',
    data
  })
}

// 驳船批量失效
export function feederRouteInvalidBatch(data) {
  return request({
    url: '/charge/feederRoute/invalidBatch',
    method: 'post',
    data
  })
}

// 驳船批量失效
export function feederRouteSave(data) {
  return request({
    url: '/charge/feederRoute/save',
    method: 'post',
    data
  })
}

// 驳船列表导出
export function feederRouteExport(data) {
  return request({
    url: '/charge/feederRoute/export',
    method: 'post',
    data
  })
}

// 获取免用免堆信息
export function mainRouteFreeTime(data) {
  return request({
    url: '/charge/mainRoute/freeTime',
    method: 'post',
    data
  })
}
// 添加报价信息接口
export function saveInquiry(data) {
  return request({
    url: '/order/over/enquiry/saveInquiry',
    method: 'post',
    data
  })
}
// 询价列表
export function overSeasList(data) {
  return request({
    url: '/order/over/enquiry/overSeasList',
    method: 'post',
    data
  })
}

// 添加询价
export function saveEnquiry(data) {
  return request({
    url: '/order/over/enquiry/saveEnquiry',
    method: 'post',
    data
  })
}
// // 添加参与人信息接口
// export function saveEnquiryParticipant(data) {
//   return request({
//     url: '/order/over/enquiry/saveEnquiryParticipant',
//     method: 'post',
//     data
//   })
// }
// 编辑参与人信息接口
export function saveEnquiryParticipant(data) {
  return request({
    url: '/order/over/enquiry/participant/change',
    method: 'post',
    data
  })
}
// 添加交流信息接口
export function saveEnquiryCom(data) {
  return request({
    url: '/order/over/enquiry/saveEnquiryCom',
    method: 'post',
    data
  })
}

// 详细沟通记录接口
export function detailRecord(data) {
  return request({
    url: '/order/over/enquiry/detailRecord',
    method: 'post',
    data
  })
}
// 询价详情
export function enquiryDetail(data) {
  return request({
    url: '/order/over/enquiry/getEnquiryMessage',
    method: 'post',
    data
  })
}

// 添加询价子信息接口
export function saveEnquirySon(data) {
  return request({
    url: '/order/over/enquiry/saveEnquirySon',
    method: 'post',
    data
  })
}

// 添加询价子信息接口
export function lookScheme(data) {
  return request({
    url: '/order/over/enquiry/lookScheme',
    method: 'post',
    data
  })
}

// 查看参与人
export function viewParticipants(data) {
  return request({
    url: '/order/over/enquiry/viewParticipants',
    method: 'post',
    data
  })
}

// 延期、失效
export function invalidityOrDelay(data) {
  return request({
    url: '/order/over/enquiry/invalidityOrDelay',
    method: 'post',
    data
  })
}
// 订单页面的报价方案
export function viewQuotationScheme(data) {
  return request({
    url: '/order/over/enquiry/viewQuotationScheme',
    method: 'post',
    data
  })
}

// 报价模板列表
export function enquiryTempList(data) {
  return request({
    url: '/order/over/enquiry/temp/list',
    method: 'post',
    data
  })
}
// 报价模板-新增
export function enquiryTempSave(data) {
  return request({
    url: '/order/over/enquiry/temp/save',
    method: 'post',
    data
  })
}
// 报价模板-新增
export function enquiryTempCreate(data) {
  return request({
    url: '/order/over/enquiry/temp/create',
    method: 'post',
    data
  })
}
// 报价模板-编辑
export function enquiryTempEdit(data) {
  return request({
    url: '/order/over/enquiry/temp/edit',
    method: 'post',
    data
  })
}

// 报价模板-删除
export function enquiryTempDel(data) {
  return request({
    url: '/order/over/enquiry/temp/delete',
    method: 'post',
    data
  })
}
// 报价模板-详情
export function enquiryTempDetail(data) {
  return request({
    url: '/order/over/enquiry/temp/detail',
    method: 'post',
    data
  })
}
// 报价方案-导出
export function enquiryExport(data) {
  return request({
    url: '/order/over/enquiry/quote/export',
    method: 'post',
    data
  })
}

// 复制运价
export function mutiCopy(data) {
  return request({
    url: '/charge/mainRoute/mutiCopy',
    method: 'post',
    data
  })
}

// 海外询价删除
export function enquiryDelete(data) {
  return request({
    url: '/order/over/enquiry/delete',
    method: 'post',
    data
  })
}

// 空运运价-新增
export function airChargeSave(data) {
  return request({
    url: '/charge/air/charge/save',
    method: 'post',
    data
  })
}
// 空运运价维护-列表
export function airChargeMaintainList(data) {
  return request({
    url: '/charge/air/charge/maintain/list',
    method: 'post',
    data
  })
}
// 空运运价维护-详情
export function airChargeDetail(data) {
  return request({
    url: '/charge/air/charge/detail',
    method: 'post',
    data
  })
}
// 空运运价导入-列表
export function airChargeFilePageList(data) {
  return request({
    url: '/charge/air/charge/file/pageList',
    method: 'post',
    data
  })
}
// 空运运价查询列表
export function airChargeOrderList(data) {
  return request({
    url: '/charge/air/charge/order/list',
    method: 'post',
    data
  })
}
// 空运运价-下单
export function airChargeCreateOrder(data) {
  return request({
    url: '/order/air/charge/createOrder',
    method: 'post',
    data
  })
}

// 空运运价-附加费模板列表
export function airSurchargeTemplatePageList(data) {
  return request({
    url: '/charge/air/surcharge/template/pageList',
    method: 'post',
    data
  })
}
// 空运运价-附加费模板新增
export function airSurchargeTemplatePageSave(data) {
  return request({
    url: '/charge/air/surcharge/template/save',
    method: 'post',
    data
  })
}
// 空运运价-附加费模板删除
export function airSurchargeTemplatePageDelete(data) {
  return request({
    url: '/charge/air/surcharge/template/delete',
    method: 'post',
    data
  })
}
// 空运运价-附加费模板复制
export function airSurchargeTemplatePageCopy(data) {
  return request({
    url: '/charge/air/surcharge/template/copy',
    method: 'post',
    data
  })
}

// 空运运价维护-复制
export function airChargeCopy(data) {
  return request({
    url: '/charge/air/charge/copy',
    method: 'post',
    data
  })
}
// 空运运价维护-删除
export function airChargeDeletey(data) {
  return request({
    url: '/charge/air/charge/delete',
    method: 'post',
    data
  })
}
// 空运运价维护-发布
export function airChargePublish(data) {
  return request({
    url: '/charge/air/charge/publish',
    method: 'post',
    data
  })
}
// 空运运价维护-失效
export function airChargeInvalid(data) {
  return request({
    url: '/charge/air/charge/invalid',
    method: 'post',
    data
  })
}
// 空运运价维护-失效
export function airChargeAddSurcharges(data) {
  return request({
    url: '/charge/air/charge/addSurcharges',
    method: 'post',
    data
  })
}
// 空运运价维护-失效
export function airChargeFileExportErrorList(data) {
  return request({
    url: '/charge/air/charge/file/exportErrorList',
    method: 'post',
    data
  })
}
// 空运运价维护-删除导入记录
export function airChargeFileDelete(data) {
  return request({
    url: '/charge/air/charge/file/delete',
    method: 'post',
    data
  })
}
// 空运运价维护-导入记录详情
export function airChargeFileInfo(data) {
  return request({
    url: '/charge/air/charge/file/info',
    method: 'post',
    data
  })
}
// 空运运价维护-导出
export function airChargeExport(data) {
  return request({
    url: '/charge/air/charge/export',
    method: 'post',
    data
  })
}
// 海外询价-复制
export function enquiryCopy(data) {
  return request({
    url: '/order/over/enquiry/copy',
    method: 'post',
    data
  })
}
// 海外询价-终止
export function enquiryBreak(data) {
  return request({
    url: '/order/over/enquiry/break',
    method: 'post',
    data
  })
}
// 海外询价-批量增加参与人接口
export function participantAddBatch(data) {
  return request({
    url: '/order/over/enquiry/participant/Add/batch',
    method: 'post',
    data
  })
}
// 海外询价-批量增加参与人接口
export function participantDelete(data) {
  return request({
    url: '/order/over/enquiry/participant/delete',
    method: 'post',
    data
  })
}
// 海外询价未读信息
export function unreadCount(data) {
  return request({
    url: '/order/over/enquiry/unread/count',
    method: 'post',
    data
  })
}