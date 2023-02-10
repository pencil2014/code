import { queryWarehousePage } from '@/api/wms'
import { getCustomerList } from '@/api/wms/inBound.js'
// 仓库辅材列表数据
export const materialTableData = [
  {
    prop: 'warehouseName',
    label: "仓库名称",
    width: 180,
    sType: "remoteSelect",
    remoteSelectList: [],
    remoteMethod: (name, item) => getWarehouseOptions(name, item),
    visibleChange: (name, item) => getWarehouseOptions(name, item),
  }, {
    prop: 'consumableName',
    label: "辅材名称",
    width: 150,
    type: "text",
    sType: "input",
  }, {
    prop: 'consumableNo',
    label: "辅材编号",
    width: 100,
    type: "text",
    sType: "input",
  }, {
    prop: 'specificationType',
    label: "规格型号",
    width: 100,
    type: "text",
    sType: "input",
  }, {
    prop: 'fileName',
    label: "辅材图片",
    width: 100,
    type: "button",
    callback: true
  }, {
    prop: 'supplierName',
    label: "采购供应商",
    width: 150,
    type: "text",
    sType: "input",
    
  }, {
    prop: 'unit',
    label: "单位",
    width: 80,
    type: "select",
    propInDict: 'wmsGoodsUnit',
  }, {
    prop: 'currency',
    label: "币种",
    width: 80,
    type: "text",
    sType: "input",
  }, {
    prop: 'unitPrice',
    label: "单价",
    width: 100,
    type: "text",
    sType: "input",
  }, {
    prop: 'inventoryQuantity',
    label: "库存量",
    width: 100,
    type: "button",
    callback: true
  }, {
    prop: 'damageQuantity',
    label: "损坏量",
    width: 100,
    type: "button",
    callback: true
  }, {
    prop: 'inventoryAlert',
    label: "库存预警值",
    width: 100,
    type: "text",
    sType: "input",
  }, {
    prop: 'lastInboundTime',
    label: "最新入库时间",
    width: 100,
    type: "text",
    sType: "input",
  }, {
    prop: 'createdName',
    label: "创建人",
    width: 130,
    type: "text",
    sType: "input",
  }, {
    prop: 'createTime',
    label: "创建时间",
    width: 130,
    type: "text",
    sType: "input",
  }, {
    prop: 'updatedName',
    label: "更新人",
    width: 130,
    type: "text",
    sType: "input",
  }, {
    prop: 'updatedTime',
    label: "更新时间",
    width: 130,
    type: "text",
    sType: "input",
  }
]

// 客户自带辅材列表数据
export const custMaterialTableData = [
  {
    prop: 'warehouseName',
    label: "仓库名称",
    sType: "remoteSelect",
    remoteSelectList: [],
    remoteMethod: (name, item) => getWarehouseOptions(name, item),
    visibleChange: (name, item) => getWarehouseOptions(name, item),
  }, {
    prop: 'orderCustName',
    label: "客户名称",
    sType: "remoteSelect",
    remoteSelectList: [],
    remoteMethod: (name, item) => getCustomerOptions(name, item),
    visibleChange: (name, item) => getCustomerOptions(name, item)
  }, {
    prop: 'consumableName',
    label: "辅材名称",
    type: "text",
    sType: "input",
  }, {
    prop: 'inventoryQuantity',
    label: "库存量",
    type: "button",
    callback: true
  }, {
    prop: 'updatedName',
    label: "更新人",
    type: "text",
    sType: "input",
  }, {
    prop: 'updatedTime',
    label: "更新时间",
    type: "text",
    sType: "input",
  }
]

// 库存量列表参数
export const inventoryQuantityData = [
  {
    prop: 'warehouseName',
    label: "仓库名称",
    width: 150
  }, {
    prop: 'inOutBoundNo',
    label: "出库单号",
    width: 130,
    type: "button",
    callback: true
  }, {
    prop: 'consumableName',
    label: "辅材名称",
    width: 150,
    type: "text",
    sType: "input",
  }, {
    prop: 'consumableNo',
    label: "辅材编号",
    width: 100,
    type: "text",
    sType: "input",
  }, {
    prop: 'specificationType',
    label: "规格型号",
    width: 100,
    type: "text",
    sType: "input",
  }, {
    prop: 'unit',
    label: "单位",
    width: 80,
    type: "select",
    propInDict: 'wmsGoodsUnit',
  }, {
    prop: 'flowType',
    label: "类型",
    width: 110,
    type: "select",
    propInDict: 'wmsMaterialInventoryChangeType',
  }, {
    prop: 'beforeQuantity',
    label: "变更前库存量",
    width: 100,
  }, {
    prop: 'quantity',
    label: "变更数量",
    width: 100,
  }, {
    prop: 'afterQuantity',
    label: "变更后库存量",
    width: 100,
  }, {
    prop: 'updatedTime',
    label: "变更时间",
    width: 120,
  }, {
    prop: 'updatedName',
    label: "变更人",
    width: 100,
  }
]

// 客户辅材库存量记录
export const custInventoryQuantityData = [
  {
    prop: 'warehouseName',
    label: "仓库名称",
    width: 150
  }, {
    prop: 'orderCustName',
    label: "客户名称",
    width: 180
  }, {
    prop: 'consumableName',
    label: "辅材名称",
    width: 130
  }, {
    prop: 'inOutBoundNo',
    label: "出入库单号",
    width: 130
  }, {
    prop: 'flowType',
    label: "类型",
    width: 150,
    type: "select",
    propInDict: 'wmsMaterialInventoryChangeType',
  }, {
    prop: 'beforeQuantity',
    label: "变更前库存量",
  }, {
    prop: 'quantity',
    label: "变更数量",
  }, {
    prop: 'afterQuantity',
    label: "变更后库存量",
  }
]

// 损坏量类型
export const damageQuantityData = [
  {
    prop: 'warehouseName',
    label: "仓库名称",
    width: 180
  }, {
    prop: 'consumableName',
    label: "辅材名称",
    width: 130
  }, {
    prop: 'consumableNo',
    label: "辅材编号",
    width: 120,
    type: "text",
    sType: "input",
  }, {
    prop: 'specificationType',
    label: "规格型号",
    width: 120,
    type: "text",
    sType: "input",
  }, {
    prop: 'unit',
    label: "单位",
    width: 90,
    type: "select",
    propInDict: 'wmsGoodsUnit',
  }, {
    prop: 'damageReason',
    label: "损坏类型",
    width: 120,
    type: "select",
    propInDict: 'wmsMaterialDamageCauses',
  }, {
    prop: 'quantity',
    label: "损坏数量",
    width: 100
  }, {
    prop: 'createTime',
    label: "录入时间",
    width: 120
  }, {
    prop: 'createdName',
    label: "录入人"
  }
]
function getWarehouseOptions (name, item) {
  let data = {
    currPage: 1,
    pageSize: 30,
    query: [
      {
        column: "employeeId",
        type: "eq",
        value: JSON.parse(localStorage.getItem('userInfo')).sysUserId
      },
      {
        column: "warehouseName",
        type: "like",
        value: name
      }
    ]
  }
  queryWarehousePage(data)
    .then(({ data: { list } }) => {
      item.remoteSelectList.splice(
        0,
        1000,
        ...list.map((v) => ({
          ...v,
          label: v.warehouseName,
          value: v.warehouseName
        }))
      )
    })
}
// 获取客户信息
function getCustomerOptions (name, item) {
  let data = {
    currPage: 1,
    pageSize: 30,
    name
  }
  getCustomerList(data)
    .then(({ data }) => {
      item.remoteSelectList.splice(
        0,
        1000,
        ...data.map((v) => ({
          ...v,
          label: v.name,
          value: v.name
        }))
      )
    })
}