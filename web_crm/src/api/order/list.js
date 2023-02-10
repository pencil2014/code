import request from '@/utils/request'
// 集装箱维护日志
export function containerLogList(data) {
	return request({
		url: '/order/shiporder/container/log/list',
		method: 'post',
		data
	})
}
// 代订舱撤回处理
export function proxyCancelHandle(data) {
	return request({
		url: '/order/shiporder/proxy/cancel/handle',
		method: 'post',
		data
	})
}
// 代订舱业务发起撤回申请
export function proxyCancelApply(data) {
	return request({
		url: '/order/shiporder/proxy/cancel/apply',
		method: 'post',
		data
	})
}
// 海外仓订单列表
export function whOrderList(data) {
	return request({
		url: '/order/shiporder/wh/list',
		method: 'post',
		data
	})
}
// 海外仓订单列表导出
export function whOrderListExport(data) {
	return request({
		url: '/order/shiporder/wh/list/export',
		method: 'post',
		data
	})
}
// 海外仓协同单列表
export function whJointList(data) {
	return request({
		url: '/order/shiporder/joint/wh/list',
		method: 'post',
		data
	})
}
// 海外仓协同单列表导出
export function whJointListExport(data) {
	return request({
		url: '/order/shiporder/joint/wh/list/export',
		method: 'post',
		data
	})
}
// 关联进出口订单
export function orderRelationList(data) {
	return request({
		url: '/order/main/relation/list',
		method: 'post',
		data
	})
}
// 新建进口单关联的出口单下拉
export function mainExportList(data) {
	return request({
		url: '/order/main/export/list',
		method: 'post',
		data
	})
}
// 协同处理
export function jointCancelConfirm(data) {
	return request({
		url: '/order/service/joint/cancel/confirm',
		method: 'post',
		data
	})
}
// 获取审核人
export function custChangeAuditEmployee(data) {
	return request({
		url: '/order/main/cust/change/audit/employee',
		method: 'post',
		data
	})
}
// 发起申请修改委托单位
export function custChangeApply(data) {
	return request({
		url: '/order/main/cust/change/apply',
		method: 'post',
		data
	})
}
// 委托单位修改审核列表
export function custChangeAuditList(data) {
	return request({
		url: '/order/main/cust/change/audit/list',
		method: 'post',
		data
	})
}
// 委托单位修改审核
export function custChangeAuditHandle(data) {
	return request({
		url: '/order/main/cust/change/audit/handle',
		method: 'post',
		data
	})
}
// 获取进口部门code
export function importsDeptcode(data) {
	return request({
		url: '/order/main/imports/deptcode',
		method: 'post',
		data
	})
}
// 单个参与人的保存
export function workAssignChange(data) {
	return request({
		url: '/order/work/assign/change',
		method: 'post',
		data
	})
}
// 协同单保存
export function orderJointSave(data) {
	return request({
		url: '/order/shiporder/joint/save',
		method: 'post',
		data
	})
}
// 拼箱协同审核人撤回
export function lclAuditJointCancel(data) {
	return request({
		url: '/order/shiporder/lcl/audit/joint/cancel',
		method: 'post',
		data
	})
}
// 进口整箱业务订单保存
export function orderImportSave(data) {
	return request({
		url: '/order/shiporder/import/save',
		method: 'post',
		data
	})
}
// 进口整箱操作订单保存
export function orderImportEdit(data) {
	return request({
		url: '/order/shiporder/import/edit',
		method: 'post',
		data
	})
}
// 20220606 根据船名航次查船期
export function bookVesselList(data) {
	return request({
		url: '/order/shiporder/book/vessel/list',
		method: 'post',
		data
	})
}
// 20220606 查询船次
export function bookVoyageList(data) {
	return request({
		url: '/order/shiporder/book/voyage/list',
		method: 'post',
		data
	})
}
// 20211231 根据船名航次查船期
export function bookVesselTime(data) {
	return request({
		url: '/order/shiporder/book/vessel/time',
		method: 'post',
		data
	})
}
// 20211231 查询船名船次
export function bookVesselVoyage(data) {
	return request({
		url: '/order/shiporder/book/vessel/voyage',
		method: 'post',
		data
	})
}
// 费用修改订单状态为终止
export function orderStatusChangeBreak(data) {
	return request({
		url: '/order/main/status/change/break',
		method: 'post',
		data
	})
}
// 费用修改订单状态为取消
export function orderStatusChangeCancel(data) {
	return request({
		url: '/order/main/status/change/cancel',
		method: 'post',
		data
	})
}
// 费用修改订单状态为关闭
export function orderStatusChangeClose(data) {
	return request({
		url: '/order/main/status/change/close',
		method: 'post',
		data
	})
}
// 输出计划单预览
export function planExportReview(data) {
	return request({
		url: '/order/shiporder/plan/export/review',
		method: 'post',
		data
	})
}
// vgm日志
export function vgmHistoryList(data) {
	return request({
		url: '/order/shipping/vgm/historyList',
		method: 'post',
		data
	})
}
// op发起取消订单
export function orderCancelRequestOp(data) {
	return request({
		url: '/order/shiporder/cancel/request/op',
		method: 'post',
		data
	})
}
// 集装箱编辑保存
export function containerEdit(data) {
	return request({
		url: '/order/shiporder/container/edit',
		method: 'post',
		data
	})
}

// 集装箱批量编辑保存 edit/batch
export function containerEditBatch(data) {
	return request({
		url: '/order/shiporder/container/edit/batch',
		method: 'post',
		data
	})
}
// 放舱给客户邮件发送
export function bookReleaseMailOnly(data) {
	return request({
		url: '/order/shiporder/book/release/mailonly',
		method: 'post',
		data
	})
}

export function noDropSendMailOnly(data) {
	return request({
		url: `/order/shiporder/sendNoDropEmail`,
		method: 'post',
		data
	})
}
// 放舱校验
export function bookReleaseCheck(data) {
	return request({
		url: '/order/shiporder/book/release/check',
		method: 'post',
		data
	})
}
// 草单确认获取单证参与人
export function orderWorkSi(data) {
	return request({
		url: '/order/shiporder/work/si',
		method: 'post',
		data
	})
}
// 输出计划单
export function orderPlanExport(data) {
	return request({
		url: '/order/shiporder/plan/export',
		method: 'post',
		data
	})
}
// 已放舱未做柜的so解绑
export function bookSoUnbind(data) {
	return request({
		url: '/order/shiporder/book/so/unbind',
		method: 'post',
		data
	})
}
// 批量解绑SO
export function bookSoUnbindBatch(data) {
	return request({
		url: '/order/shiporder/book/so/unbind/batch',
		method: 'post',
		data
	})
}
// 订单报表
export function shipOrderReport(data) {
	return request({
		url: '/order/ship/order/report/list',
		method: 'post',
		data
	})
}
// 订单报表导出
export function shipOrderReportExport(data) {
	return request({
		url: '/order/ship/order/report/list/export',
		method: 'post',
		data
	})
}
// 客户委托号修改
export function mainCustIntrustEdit(data) {
	return request({
		url: '/order/main/cust/intrust/edit',
		method: 'post',
		data
	})
}
// 委托单位修改
export function mainCustUpdate(data) {
	return request({
		url: '/order/main/cust/update',
		method: 'post',
		data
	})
}
// 备注修改
export function mainRemarkUpdate(data) {
	return request({
		url: '/order/main/remark/update',
		method: 'post',
		data
	})
}
// 订舱获取参与人
export function orderMainWorkAssign(data) {
	return request({
		url: '/order/main/work/assign',
		method: 'post',
		data
	})
}
// 拖柜获取so箱型箱量
export function containerSoList(data) {
	return request({
		url: '/order/shiporder/container/so/list',
		method: 'post',
		data
	})
}
// 服务项委派列表
export function serviceInfoList(data) {
	return request({
		url: '/order/service/info/list',
		method: 'post',
		data
	})
}
// 服务项委派信息保存
export function serviceInfoSave(data) {
	return request({
		url: '/order/service/info/save',
		method: 'post',
		data
	})
}
// 服务项委派信息删除
export function serviceInfoDelete(data) {
	return request({
		url: '/order/service/info/delete',
		method: 'post',
		data
	})
}
// 服务项备注信息获取
export function remarkInfo(data) {
	return request({
		url: '/order/service/remark/info',
		method: 'post',
		data
	})
}
// 服务项备注信息保存
export function remarkSave(data) {
	return request({
		url: '/order/service/remark/save',
		method: 'post',
		data
	})
}
// 仓储关联集装箱
export function containerWhList(data) {
	return request({
		url: '/order/shiporder/container/wh/list',
		method: 'post',
		data
	})
}
// 实际出仓更新
export function warehouseOutUpdate(data) {
	return request({
		url: '/order/warehouseOut/update',
		method: 'post',
		data
	})
}
// 一键出仓
export function warehouseOutBatchSave(data) {
	return request({
		url: '/order/warehouseOut/batchSave',
		method: 'post',
		data
	})
}
// 实际入仓更新
export function warehouseInSaveNew(data) {
	return request({
		url: '/order/warehouseIn/update',
		method: 'post',
		data
	})
}
// 查询散伙部门CODE
export function getValueByKey(data) {
	return request({
		url: '/base/webapi/baseConfig/getValueByKey',
		method: 'post',
		data
	})
}
// 查询散伙部门CODE2
export function getValueByKeys(data) {
	return request({
		url: '/base/webapi/baseConfig/getValueByKeys',
		method: 'post',
		data
	})
}
// SO核对
export function soCheck(data) {
	return request({
		url: '/order/shiporder/book/so/check',
		method: 'post',
		data
	})
}
// 查询是否散货
export function mainInfo(data) {
	return request({
		url: '/order/main/info',
		method: 'post',
		data
	})
}
// 获取协同单号
export function mainJointSearch(data) {
	return request({
		url: '/order/main/joint/search',
		method: 'post',
		data
	})
}
// 整柜单子单解除关联
export function lclFclUnbind(data) {
	return request({
		url: '/order/shiporder/lcl/fcl/unbind',
		method: 'post',
		data
	})
}
// 整柜关联子单
export function lclFclBind(data) {
	return request({
		url: '/order/shiporder/lcl/fcl/bind',
		method: 'post',
		data
	})
}
// 订单甩柜信息
export function dropInfo(data) {
	return request({
		url: '/order/shiporder/spacebook/drop/info',
		method: 'post',
		data
	})
}
// 操作甩柜
export function opDrop(data) {
	return request({
		url: '/order/shiporder/spacebook/op/drop',
		method: 'post',
		data
	})
}
// 查询甩柜的SO信息,甩柜页面SO列表
export function soCompareList(data) {
	return request({
		url: '/order/shiporder/spacebook/so/compare/list',
		method: 'post',
		data
	})
}

// 业务甩柜指示
export function bdDropCheck(data) {
	return request({
		url: '/order/shiporder/spacebook/bd/drop/check',
		method: 'post',
		data
	})
}
// 订单删除
export function orderDelete(data) {
	return request({
		url: '/order/shiporder/delete',
		method: 'post',
		data
	})
}
// 出仓计划保存(批量)
export function warehouseOutplanBatchSave(data) {
	return request({
		url: '/order/warehouseOutplan/batchSave',
		method: 'post',
		data
	})
}
// 实际入仓保存(批量)
export function warehouseInBatchSave(data) {
	return request({
		url: '/order/warehouseIn/batchSave',
		method: 'post',
		data
	})
}
// 订单列表
export function orderList(data) {
	return request({
		url: '/order/shiporder/list',
		method: 'post',
		data
	})
}
// 查询销售列表
export function orderSellers(data) {
	return request({
		url: '/order/shiporder/sellers',
		method: 'post',
		data
	})
}
// 新建订单
export function orderCreate(data) {
	return request({
		url: '/order/shiporder/create',
		method: 'post',
		data
	})
}
// 从运价新建订单
export function orderChargeCreate(data) {
	return request({
		url: '/order/shiporder/charge/create',
		method: 'post',
		data
	})
}
// 业务订单保存
export function orderSave(data) {
	return request({
		url: '/order/shiporder/save',
		method: 'post',
		data
	})
}
// 复制订单
export function orderCopy(data) {
	return request({
		url: '/order/shiporder/copy',
		method: 'post',
		data
	})
}
// 订单完成
export function orderFinish(data) {
	return request({
		url: '/order/shiporder/finish',
		method: 'post',
		data
	})
}
// 操作订单保存
export function orderEdit(data) {
	return request({
		url: '/order/shiporder/edit',
		method: 'post',
		data
	})
}
// 订单详情
export function orderInfo(data) {
	return request({
		url: '/order/shiporder/info',
		method: 'post',
		data
	})
}


// 费用页面查询头部订单信息/order/main/orderTop
export function mainOrderTop(data) {
	return request({
		url: `/order/main/orderTop`,
		method: 'post',
		data
	})
}
// 订单详情（财务用）
export function orderInfoNoperm(data) {
	return request({
		url: '/order/shiporder/noperm/info',
		method: 'post',
		data
	})
}
// 单证 补料列表 查询订单详情  /order/shiporder/noperm/info 
export function orderNopermInfo(data) {
	return request({
		url: '/order/shiporder/noperm/info',
		method: 'post',
		data
	})
}
// 单证 补料列表 查询协同订单详情  /order/shiporder/joint/noperm/info 
export function orderJointNopermInfo(data) {
	return request({
		url: '/order/shiporder/joint/noperm/info',
		method: 'post',
		data
	})
}
// 分配岗位查询
export function orderWork(data) {
	return request({
		url: '/order/shiporder/work',
		method: 'post',
		data
	})
}
// 订舱的协助审核人
export function jointAuditWork(data) {
	return request({
		url: '/order/shiporder/spacebook/joint/audit/work',
		method: 'post',
		data
	})
}
// 拼箱-订舱的协助审核人
export function lclJointAuditWork(data) {
	return request({
		url: '/order/shiporder/lcl/joint/audit/work',
		method: 'post',
		data
	})
}
// 协同分配岗位查询
export function jointWork(data) {
	return request({
		url: '/order/shiporder/joint/work',
		method: 'post',
		data
	})
}
// 免用免堆信息录入
export function orderBookFreeSave(data) {
	return request({
		url: '/order/shiporder/book/free/save',
		method: 'post',
		data
	})
}
// 导出
export function orderListExport(data) {
	return request({
		url: '/order/shiporder/list/export',
		method: 'post',
		data
	})
}
// so列表
export function bookSoList(data) {
	return request({
		url: '/order/shiporder/book/so/list',
		method: 'post',
		data
	})
}
// SO上传
export function bookSoUpload(data) {
	return request({
		url: '/order/shiporder/book/so/upload',
		method: 'post',
		data
	})
}
// so列表
export function bookSoDelete(data) {
	return request({
		url: '/order/shiporder/book/so/delete',
		method: 'post',
		data
	})
}
// 客户自定bd创建保存
export function selfSave(data) {
	return request({
		url: '/order/shiporder/self/save',
		method: 'post',
		data
	})
}
// 报关单
export function cdSave(data) {
	return request({
		url: '/order/shiporder/cd/save',
		method: 'post',
		data
	})
}
// 报关单编辑
export function cdEdit(data) {
	return request({
		url: '/order/shiporder/cd/edit',
		method: 'post',
		data
	})
}
// 客户自定op保存
export function selfEdit(data) {
	return request({
		url: '/order/shiporder/self/edit',
		method: 'post',
		data
	})
}
// 业务通知放舱
export function orderNotifyRelease(data) {
	return request({
		url: '/order/shiporder/book/notify/release',
		method: 'post',
		data
	})
}
// 业务通知BKG加急处理
export function orderBookCrash(data) {
	return request({
		url: '/order/shiporder/book/crash',
		method: 'post',
		data
	})
}
// 操作放舱给客户
export function orderRelease(data) {
	return request({
		url: '/order/shiporder/book/release',
		method: 'post',
		data
	})
}
// 取消放舱给客户
export function orderReleaseCancel(data) {
	return request({
		url: '/order/shiporder/book/release/cancel',
		method: 'post',
		data
	})
}
// 订舱信息详情
export function orderBookInfo(data) {
	return request({
		url: '/order/shiporder/book/info',
		method: 'post',
		data
	})
}
// 做柜后改船详情
export function orderChangeInfo(data) {
	return request({
		url: '/order/shiporder/book/change/info',
		method: 'post',
		data
	})
}
// 做柜后改船
export function orderChangeSave(data) {
	return request({
		url: '/order/shiporder/book/change/save',
		method: 'post',
		data
	})
}
// 业务撤回已提交的订单
export function orderSubmitCancel(data) {
	return request({
		url: '/order/shiporder/submit/cancel',
		method: 'post',
		data
	})
}
// 业务发起取消订单
export function orderCancelRequest(data) {
	return request({
		url: '/order/shiporder/cancelRequest',
		method: 'post',
		data
	})
}
// 业务关闭订单
export function orderClose(data) {
	return request({
		url: '/order/shiporder/close',
		method: 'post',
		data
	})
}

// 操作取消订单
export function orderCancelHandle(data) {
	return request({
		url: '/order/shiporder/cancelHandle',
		method: 'post',
		data
	})
}

// 托书列表
export function orderFileBookList(data) {
	return request({
		url: '/order/shiporder/file/book/list',
		method: 'post',
		data
	})
}

// 托书删除
export function orderFileBookDelete(data) {
	return request({
		url: '/order/shiporder/file/book/delete',
		method: 'post',
		data
	})
}

// 托书上传
export function orderFileBookUpload(data) {
	return request({
		url: '/order/shiporder/file/book/upload',
		method: 'post',
		data
	})
}

// 文件列表
export function orderFileList(data) {
	return request({
		url: '/order/shiporder/file/list',
		method: 'post',
		data
	})
}

// 文件删除
export function orderFileDelete(data) {
	return request({
		url: '/order/shiporder/file/delete',
		method: 'post',
		data
	})
}
// 舱单文件删除
export function manifestDelete(data) {
	return request({
		url: '/order/manifest/delete',
		method: 'post',
		data
	})
}
// 舱单文件列表
export function manifestList(data) {
	return request({
		url: '/order/manifest/list',
		method: 'post',
		data
	})
}

// 文件上传
export function orderFileUpload(data) {
	return request({
		url: '/order/shiporder/file/upload',
		method: 'post',
		data
	})
}

// 模板下载
export function orderFileTempDownload(folder, fileName) {
	return request({
		url: '/order/shiporder/file/temp/download',
		method: 'get',
		params: { folder, fileName }
	})
}

// 集装箱列表
export function orderContainerList(data) {
	return request({
		url: '/order/shiporder/container/list',
		method: 'post',
		data
	})
}
// 起运港未关联集装箱列表
export function listUnBindContainer(data) {
	return request({
		url: '/order/shipping/fclTruckLoad/listUnBindContainer',
		method: 'post',
		data
	})
}

// 报关委托-集装箱列表
export function containerList(data) {
	return request({
		url: '/order/shipping/customs/containerList',
		method: 'post',
		data
	})
}

// 集装箱新增
export function orderContainerCreate(data) {
	return request({
		url: '/order/shiporder/container/create',
		method: 'post',
		data
	})
}

// 集装箱更新
export function orderContainerUpdate(data) {
	return request({
		url: '/order/shiporder/container/update',
		method: 'post',
		data
	})
}

// 集装箱导出
export function orderContainerExport(data) {
	return request({
		url: '/order/shiporder/container/export',
		method: 'post',
		data
	})
}

// 集装箱导入
export function orderContainerImport(data) {
	return request({
		url: '/order/shiporder/container/import',
		method: 'post',
		data
	})
}

// 集装箱甩柜
export function orderContainerDrop(data) {
	return request({
		url: '/order/shiporder/container/drop',
		method: 'post',
		data
	})
}

// 批量修改SO
export function orderContainerUpdateSo(data) {
	return request({
		url: '/order/shiporder/container/update/so',
		method: 'post',
		data
	})
}

// 协同服务项新增
export function orderJointServiceCreate(data) {
	return request({
		url: '/order/shiporder/joint/service/create',
		method: 'post',
		data
	})
}

// 协同服务项列表
export function orderJointServiceList(data) {
	return request({
		url: '/order/shiporder/joint/service/list',
		method: 'post',
		data
	})
}

// 协同服务项删除
export function orderJointServiceDelete(data) {
	return request({
		url: '/order/shiporder/joint/service/delete',
		method: 'post',
		data
	})
}

// 协同服务项撤回
export function orderJointServiceCancel(data) {
	return request({
		url: '/order/shiporder/joint/service/cancel',
		method: 'post',
		data
	})
}

// 协同服务项撤回审核
export function orderJointServiceCancelAudit(data) {
	return request({
		url: '/order/shiporder/joint/service/cancel/audit',
		method: 'post',
		data
	})
}

// 协同服务项拒绝
export function orderJointServiceRefuse(data) {
	return request({
		url: '/order/shiporder/joint/service/refuse',
		method: 'post',
		data
	})
}

// 协同订单列表
export function orderJointList(data) {
	return request({
		url: '/order/shiporder/joint/list',
		method: 'post',
		data
	})
}
// 散货订仓列表
export function lclList(data) {
	return request({
		url: '/order/shiporder/lcl/list',
		method: 'post',
		data
	})
}
// 协同订单列表导出
export function orderJointListExport(data) {
	return request({
		url: '/order/shiporder/joint/list/export',
		method: 'post',
		data
	})
}
// 散货订仓列表导出
export function lclListExport(data) {
	return request({
		url: '/order/shiporder/lcl/list/export',
		method: 'post',
		data
	})
}
// 协同订单详情
export function orderJointInfo(data) {
	return request({
		url: '/order/shiporder/joint/info',
		method: 'post',
		data
	})
}
// 协同订单服务项岗位分配信息
export function jointServiceWorkList(data) {
	return request({
		url: '/order/shiporder/joint/service/work/list',
		method: 'post',
		data
	})
}
// 协同订单服务项岗位分配保存
export function jointServiceWorkAssign(data) {
	return request({
		url: '/order/shiporder/joint/service/work/assign',
		method: 'post',
		data
	})
}

// 报关委托列表
export function getCustomsList(data) {
	return request({
		url: '/order/shipping/customs/list',
		method: 'post',
		data
	})
}

// 报关委托单号获取
export function getIntrustNo(data) {
	return request({
		url: '/order/shipping/customs/getIntrustNo',
		method: 'post',
		data
	})
}

// 报关委托详情
export function getCustomsDetail(data) {
	return request({
		url: '/order/shipping/customs/detail',
		method: 'post',
		data
	})
}

// 删除报关委托
export function deleteCustoms(data) {
	return request({
		url: '/order/shipping/customs/delete',
		method: 'post',
		data
	})
}

// 推送给拖报操作处理添加报关委托计划 /shipping/customs/pushToOpTruck
export function customsPushToOpTruck(data) {
	return request({
		url: '/order/shipping/customs/pushToOpTruck',
		method: 'post',
		data
	})
}
// 打印报关委托单
export function getIntrustDoc(data) {
	return request({
		url: '/order/shipping/customs/intrustDoc',
		method: 'post',
		data
	})
}

// 报关委托新增及修改
export function saveCustoms(data) {
	return request({
		url: '/order/shipping/customs/save',
		method: 'post',
		data
	})
}

// 报关委托状态修改
export function updateIntrustStatus(data) {
	return request({
		url: '/order/shipping/customs/updateIntrustStatus',
		method: 'post',
		data
	})
}

// 堆场装箱列表
export function yardBoxList(data) {
	return request({
		url: '/order/shipping/yardBox/list',
		method: 'post',
		data
	})
}

// 堆场装箱列表-详情
export function yardBoxDetail(data) {
	return request({
		url: '/order/shipping/yardBox/detail',
		method: 'post',
		data
	})
}

// 堆场装箱列表-保存
export function yardBoxSave(data) {
	return request({
		url: '/order/shipping/yardBox/save',
		method: 'post',
		data
	})
}

// 堆场装箱列表-删除
export function deleteYardBox(data) {
	return request({
		url: '/order/shipping/yardBox/delete',
		method: 'post',
		data
	})
}

// 堆场装箱列表-状态更新
export function updateStatusYardBox(data) {
	return request({
		url: '/order/shipping/yardBox/updateStatus',
		method: 'post',
		data
	})
}

// 堆场装箱列表-状态更新
export function yardList(data) {
	return request({
		url: '/order/shipping/yard/list',
		method: 'post',
		data
	})
}

// 仓库列表
export function getWarehouseList(data) {
	return request({
		url: '/order/warehouse/list',
		method: 'post',
		data
	})
}
// 进仓计划列表
export function getWarehouseInplan(data) {
	return request({
		url: '/order/warehouseInplan/listPage',
		method: 'post',
		data
	})
}
// 从订单详情进入的进仓计划列表
export function orderWarehouseInplanList(data) {
	return request({
		url: '/order/warehouseInplan/list',
		method: 'post',
		data
	})
}
// 实际入仓详情
export function getWarehouseInDetail(data) {
	return request({
		url: '/order/warehouseIn/detail',
		method: 'post',
		data
	})
}
// 入仓计划详情
export function getWarehouseInplanDetail(data) {
	return request({
		url: '/order/warehouseInplan/detail',
		method: 'post',
		data
	})
}
// 入仓计划删除
export function getWarehouseInDelete(data) {
	return request({
		url: '/order/warehouseInplan/delete',
		method: 'post',
		data
	})
}
// 入仓计划复制 /order/warehouseInplan/copy
export function warehouseInplanCopy(data) {
	return request({
		url: '/order/warehouseInplan/copy',
		method: 'post',
		data
	})
}
// 入仓计划编号
export function createSerialNo(data) {
	return request({
		url: '/order/warehouseInplan/createSerialNo',
		method: 'post',
		data
	})
}
// 入仓计划保存
export function warehouseInplanSave(data) {
	return request({
		url: '/order/warehouseInplan/save',
		method: 'post',
		data
	})
}
// 实际入仓列表
export function getWarehouseIn(data) {
	return request({
		url: '/order/warehouseIn/listPage',
		method: 'post',
		data
	})
}
// 从订单详情进入的实际入仓列表
export function orderWarehouseInList(data) {
	return request({
		url: '/order/warehouseIn/list',
		method: 'post',
		data
	})
}
// 实际入仓保存
export function warehouseInSave(data) {
	return request({
		url: '/order/warehouseIn/save',
		method: 'post',
		data
	})
}
// 实际入仓库存列表
export function listStock(data) {
	return request({
		url: '/order/warehouseIn/listStock',
		method: 'post',
		data
	})
}
// 入仓编号
export function warehouseInCreateSerialNo(data) {
	return request({
		url: '/order/warehouseIn/createSerialNo',
		method: 'post',
		data
	})
}
// 出仓编号
export function warehouseOutGetSerialNo(data) {
	return request({
		url: '/order/warehouseOut/getSerialNo',
		method: 'post',
		data
	})
}
// 货品列表
export function getCargoList(data) {
	return request({
		url: '/order/cargo/listPage',
		method: 'post',
		data
	})
}
// 货品删除
export function cargoDelete(data) {
	return request({
		url: '/order/cargo/delete',
		method: 'post',
		data
	})
}
// 货品保存
export function cargoSave(data) {
	return request({
		url: '/order/cargo/save',
		method: 'post',
		data
	})
}
// 出仓计划列表
export function getWarehouseOutplanList(data) {
	return request({
		url: '/order/warehouseOutplan/listPage',
		method: 'post',
		data
	})
}
// 从订单详情进入的出仓计划列表
export function orderWarehouseOutplanList(data) {
	return request({
		url: '/order/warehouseOutplan/list',
		method: 'post',
		data
	})
}
// 出仓计划详情
export function warehouseOutplanDetail(data) {
	return request({
		url: '/order/warehouseOutplan/detail',
		method: 'post',
		data
	})
}
// 出仓计划保存
export function warehouseOutplanSave(data) {
	return request({
		url: '/order/warehouseOutplan/save',
		method: 'post',
		data
	})
}
// 出仓计划编号
export function warehouseOutplanGetSerialNo(data) {
	return request({
		url: '/order/warehouseOutplan/getSerialNo',
		method: 'post',
		data
	})
}
// 出仓计划删除
export function warehouseOutplanDelete(data) {
	return request({
		url: '/order/warehouseOutplan/delete',
		method: 'post',
		data
	})
}
// 实际出仓详情
export function warehouseDetail(data) {
	return request({
		url: '/order/warehouseOut/detail',
		method: 'post',
		data
	})
}
// 实际出仓列表
export function warehouseOutList(data) {
	return request({
		url: '/order/warehouseOut/listPage',
		method: 'post',
		data
	})
}
// 从订单详情进入的实际出仓列表
export function orderWarehouseOutList(data) {
	return request({
		url: '/order/warehouseOut/list',
		method: 'post',
		data
	})
}
// 实际出仓保存
export function warehouseOutSave(data) {
	return request({
		url: '/order/warehouseOut/save',
		method: 'post',
		data
	})
}
// 散货订单-委托订舱保存
export function lclSave(data) {
	return request({
		url: '/order/shiporder/lcl/save',
		method: 'post',
		data
	})
}
// 散货进口订单-委托订舱保存
export function lclImportSave(data) {
	return request({
		url: '/order/shiporder/import/lcl/save',
		method: 'post',
		data
	})
}
// 散货订单-客户自定保存
export function lclSelfSave(data) {
	return request({
		url: '/order/shiporder/lcl/self/save',
		method: 'post',
		data
	})
}
// 散货订单-订仓审核列表
export function lclAuditList(data) {
	return request({
		url: '/order/shiporder/lcl/audit/list',
		method: 'post',
		data
	})
}
// 散货订单-订仓审核列表导出
export function lclAuditListExport(data) {
	return request({
		url: '/order/shiporder/lcl/audit/list/export',
		method: 'post',
		data
	})
}
// 散货订单-审核通过
export function lclAuditPass(data) {
	return request({
		url: '/order/shiporder/lcl/audit/pass',
		method: 'post',
		data
	})
}
// 散货订单-审核拒绝
export function lclAuditRefuse(data) {
	return request({
		url: '/order/shiporder/lcl/audit/refuse',
		method: 'post',
		data
	})
}
// 散货订单-改港审核
export function lclChangePass(data) {
	return request({
		url: '/order/shiporder/lcl/change/audit',
		method: 'post',
		data
	})
}

// 散货订单-编辑
export function lclEdit(data) {
	return request({
		url: '/order/shiporder/lcl/edit',
		method: 'post',
		data
	})
}
// 散货进口订单-编辑
export function lclImportEdit(data) {
	return request({
		url: '/order/shiporder/import/lcl/edit',
		method: 'post',
		data
	})
}
// 散货订单-修改货物信息
export function lclCargoEdit(data) {
	return request({
		url: '/order/shiporder/lcl/cargo/edit',
		method: 'post',
		data
	})
}
// 散货订单-服务修改提醒确认
export function workServiceEditConfirm(data) {
	return request({
		url: '/order/shipping/workService/edit/confirm',
		method: 'post',
		data
	})
}
// 散货订单-订仓详情
export function lclInfo(data) {
	return request({
		url: '/order/shiporder/lcl/info',
		method: 'post',
		data
	})
}
// 提单放单撤回
export function putBlCancel(data) {
	return request({
		url: '/order/put/bl/cancel',
		method: 'post',
		data
	})
}
// 散货订单-子单列表
export function lclChildList(data) {
	return request({
		url: '/order/shiporder/lcl/child/list',
		method: 'post',
		data
	})
}
// 散货订单-创建整柜订单
export function lclFclCreate(data) {
	return request({
		url: '/order/shiporder/lcl/fcl/create',
		method: 'post',
		data
	})
}
// 散货订单-订仓保存
export function whBookSave(data) {
	return request({
		url: '/order/shipping/whbook/save',
		method: 'post',
		data
	})
}
// 散货订单-业务放仓给客户
export function whBookPoRelease(data) {
	return request({
		url: '/order/shipping/whbook/po/release',
		method: 'post',
		data
	})
}
// 散货订单-入仓核实单确认
export function whBookPoConfirm(data) {
	return request({
		url: '/order/shipping/whbook/po/confirm',
		method: 'post',
		data
	})
}
// 散货订单-拼箱完成确认
export function whBookLclConfirm(data) {
	return request({
		url: '/order/shipping/whbook/lcl/confirm',
		method: 'post',
		data
	})
}
// 散货订单-订仓文件上传
export function whBookFileUpload(data) {
	return request({
		url: '/order/shipping/whbook/file/upload',
		method: 'post',
		data
	})
}
// 散货订单-文件列表
export function whBookFileList(data) {
	return request({
		url: '/order/shipping/whbook/file/list',
		method: 'post',
		data
	})
}
// 散货订单-文件删除
export function whBookFileDelete(data) {
	return request({
		url: '/order/shipping/whbook/file/delete',
		method: 'post',
		data
	})
}
// 查询某一服务项的关键操作日志
export function mainCheckpointList(data) {
	return request({
		url: '/order/main/checkpoint/list',
		method: 'post',
		data
	})
}
// 集装箱删除
export function containerDelete(data) {
	return request({
		url: '/order/shiporder/container/delete',
		method: 'post',
		data
	})
}

// 收发通列表
export function contactList(data) {
	return request({
		url: '/crm/csn/contact/list',
		method: 'post',
		data
	})
}
// 收发通保存
export function contactSave(data) {
	return request({
		url: '/crm/csn/contact/save',
		method: 'post',
		data
	})
}
// 收发通删除
export function contactDelete(data) {
	return request({
		url: '/crm/csn/contact/delete',
		method: 'post',
		data
	})
}
// 保险列表
export function insuranceList(data) {
	return request({
		url: '/order/insurance/list',
		method: 'post',
		data
	})
}
// 获取保险赔付地
export function insurancePayLocation(data) {
	return request({
		url: '/order/insurance/payLocation',
		method: 'post',
		data
	})
}
// 已绑定的集装箱列表
export function listBoundContainer(data) {
	return request({
		url: '/order/shipping/customs/listBoundContainer',
		method: 'post',
		data
	})
}
// 保险新增
export function insuranceSave(data) {
	return request({
		url: '/order/insurance/save',
		method: 'post',
		data
	})
}
// 保险申请放单
export function insurancePut(data) {
	return request({
		url: '/order/insurance/put',
		method: 'post',
		data
	})
}
// 保险上传
export function insuranceUpLoad(data) {
	return request({
		url: '/order/insurance/upload',
		method: 'post',
		data
	})
}
// 保险删除
export function insuranceDelete(data) {
	return request({
		url: '/order/insurance/delete',
		method: 'post',
		data
	})
}
// 保险批量保存
export function insuranceSaveBatch(data) {
	return request({
		url: '/order/insurance/saveBatch',
		method: 'post',
		data
	})
}
// 保险失效
export function insuranceInvalid(data) {
	return request({
		url: '/order/insurance/invalidFile',
		method: 'post',
		data
	})
}
// 从运价新建订单
export function dzgChargeCreate(data) {
	return request({
		url: '/order/shiporder/dzg/charge/create',
		method: 'post',
		data
	})
}
// 业务撤回取消订单申请
export function orderCancelCancel(data) {
	return request({
		url: '/order/main/cancel/cancel',
		method: 'post',
		data
	})
}
// 商务审单，参与人下拉数据
export function orderWorkList(data) {
	return request({
		url: '/order/work/audit/work/list',
		method: 'post',
		data
	})
}
// 航程跟踪保存 /order/shiporder/saveTrackInfo
export function saveTrackInfo(data) {
	return request({
		url: `/order/shiporder/saveTrackInfo`,
		method: 'post',
		data
	})
}
// 各类编号转换 订单号(orderNo) /order/no/query
export function getOrderNoQuery(data) {
	return request({
		url: `/order/no/order/query`,
		method: 'post',
		data
	})
}
// 单独更新海外服务类型接口
export function updateOverseasInfo(data) {
	return request({
		url: `/order/main/updateOverseasInfo`,
		method: 'post',
		data
	})
}
// 单独更新海外服务类型-海外客服审核接口
export function overseasAudit(data) {
	return request({
		url: `/order/main/overseasAudit`,
		method: 'post',
		data
	})
}
// 获取修改海外服务类型审核提示消息
export function overseasTips(data) {
	return request({
		url: `/order/main/overseasTips`,
		method: 'post',
		data
	})
}
// 获取海外分公司
export function abroadCompanyList(data) {
	return request({
		url: `/base/webapi/company/companyList`,
		method: 'post',
		data
	})
}
// 是否产生费用，操作能否修改海外服务信息
export function overseasCanModify(data) {
	return request({
		url: `/order/main/overseasCanModify`,
		method: 'post',
		data
	})
}

// 订单详情保存的海外代理列表
export function listOverseasSelect(data) {
	return request({
		url: `/order/main/listOverseasSelect`,
		method: 'post',
		data
	})
}
// 大船船名&&大船航次 是否能手动输入提交
export function vesselInput(data) {
	return request({
		url: `/order/ship/carrier/vessel/input`,
		method: 'post',
		data
	})
}

// 附件审核
export function fileAudit(data) {
	return request({
		url: `/order/file/audit`,
		method: 'post',
		data
	})
}
// 设置拖报操作
export function addTruckOp(data) {
	return request({
		url: `/order/work/addTruckOp`,
		method: 'post',
		data
	})
}
// 设置拖报操作
export function pushToOpTruck(data) {
	return request({
		url: `/order/shipping/fclTruckIntrust/pushToOpTruck`,
		method: 'post',
		data
	})
}
// 服务项选择类型及状态查询 /order/service/subType/list
export function getSubTypeList(data) {
	return request({
		url: '/order/service/subType/list',
		method: 'post',
		data
	})
}

// 服务项子项类型保存 /order/service/subType/save
export function subTypeSave(data) {
	return request({
		url: '/order/service/subType/save',
		method: 'post',
		data
	})
}

// 订单详情查询crm委托单位相关数据 /order/main/cust/info
export function orderCustInfo(data) {
	return request({
		url: '/order/main/cust/info',
		method: 'post',
		data
	})
}
// 修改业务时间
export function bizdateChange(data) {
	return request({
		url: '/order/main/bizdate/change',
		method: 'post',
		data
	})
}
// 业务主管拒绝客户自定订单
export function preRefuse(data) {
	return request({
		url: '/order/main/pre/refuse',
		method: 'post',
		data
	})
}
// 批量修改字段
export function batchEdit(data) {
	return request({
		url: '/order/shiporder/batch/edit',
		method: 'post',
		data
	})
}
// 报关单列表
export function cdOrderList(data) {
	return request({
		url: '/order/shiporder/cd/list',
		method: 'post',
		data
	})
}
// 报关单列表导出
export function cdOrderListExport(data) {
	return request({
		url: '/order/shiporder/cd/list/export',
		method: 'post',
		data
	})
}

// 报关单列表导出
export function fileNoeffect(data) {
	return request({
		url: '/order/shiporder/file/noeffect',
		method: 'post',
		data
	})
}
// 修改报价方案
export function standEdit(data) {
	return request({
		url: '/order/main/stand/edit',
		method: 'post',
		data
	})
}
// 订单下所有提单
export function getBlNoByOrderNo(data) {
	return request({
		url: '/order/main/getBlNoByOrderNo',
		method: 'post',
		data
	})
}
