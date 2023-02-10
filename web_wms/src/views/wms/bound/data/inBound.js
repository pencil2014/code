/*
 * @Description: 入库管理列表相关信息
 * @Autor: yinjunying
 * @Date: 2022-08-16 14:22:06
 */
import { getEmployeeList } from '@/api/wms/warehouse.js'
import { getCustomerList } from '@/api/wms/inBound.js'
import { queryWarehousePage } from '@/api/wms'

export const tableData = [
  {
    prop: 'wmsWarehouseId',
    label: "仓库名称",
    width: 180,
    hide: true,
    customColumnHide: true,
    multi: true,
    multiple: true,
    sType: "remoteSelect",
    remoteSelectList: [],
    remoteMethod: (name, item) => getWarehouseOptions(name, item),
    visibleChange: (name, item) => getWarehouseOptions(name, item)
  },
  {
    prop: 'warehouseName',
    label: "仓库名称",
    width: 180
  },
  {
    prop: 'inboundNo',
    label: "入库号",
    width: 130,
    type: "text",
    sType: "input",
    isTooltip: true
  }, {
    prop: 'inboundTime',
    label: "入库时间",
    width: 130,
    sType: "daterange",
    format: "yyyy-MM-dd"
  }, {
    prop: 'printTime',
    label: "打印时间",
    width: 180,
    sType: "daterange",
    format: "yyyy-MM-dd HH:mm:ss"
  }, {
    prop: 'orderCustName',
    label: "客户名称",
    width: 200,
    sType: "remoteSelect",
    remoteSelectList: [],
    remoteMethod: (name, item) => getCustomerOptions(name, item),
    visibleChange: (name, item) => getCustomerOptions(name, item)
  }, {
    prop: 'workOrderNo',
    label: "客户入仓单号",
    width: 150
  }, {
    prop: 'lsWorkOrderNo',
    label: "长帆工作单号",
    width: 150
  }, {
    prop: 'inWarehousFeeCollectType',
    label: "入仓费收取方式",
    width: 140,
    type: "select",
    propInDict: 'wmsInWarehousFeeCollectType'
  }, {
    prop: 'inWarehousFeeAmt',
    label: "入仓费金额",
    width: 140,
  }, {
    prop: 'inboundLicensePlate',
    label: "入库车牌号",
    width: 140
  }, {
    prop: 'inboundContainerNo',
    label: "入库柜号",
    width: 140
  }, {
    prop: 'goodsName',
    label: "货物名称",
    width: 140
  }, {
    prop: 'orderPush',
    label: "订单推送",
    width: 120,
    type: "select",
    propInDict: "yesNo",
  }, {
    prop: 'inboundStatus',
    label: "状态",
    width: 140,
    type: "select",
    propInDict: "wmsInboundStatus",
    formatter: ({ cellValue }) => {
      if (cellValue === 'created') {
        return '<span style="color:#3E80F5;" >已办单</span>'
      } else if (cellValue === 'process') {
        return '<span style="color:#DFA725;" >收货中</span>'
      } else if (cellValue === 'done') {
        return '<span style="color:#33B18A;" >已入库</span>'
      } else {
        return ''
      }
    }
  }, {
    prop: 'estimatedQuantity',
    label: "预入总数",
    width: 140
  }, {
    prop: 'actualQuantity',
    label: "实入总数",
    width: 140
  }, {
    prop: 'unloadPhoto',
    label: "是否卸货拍照",
    width: 140,
    type: "button",
    propInDict: "yesNo",
    no__line: (row, val) => val === 'no',
    formatter: ({ row }) => {
      if (row['unloadPhoto'] === 'yes') {
        return '<span style="color:#3E80F5;">是</span>'
      } else if (row['unloadPhoto'] === 'no') {
        return '<span style="color:#333333;">否</span>'
      } else {
        return ''
      }
    }
  }, {
    prop: 'insideZoneName',
    label: "货物库位",
    width: 140
  }, {
    prop: 'tallyManName',
    label: "理货员",
    width: 140
  }, 
  {
    prop: 'orderOperator',
    label: "开单操作",
    width: 130
  }, 
  {
    prop: 'dispatchTime',
    label: "卸货时间",
    width: 180,
    sType: "daterange",
    format: "yyyy-MM-dd HH:mm:ss"
  }, {
    prop: 'dischargeWorkTeam',
    label: "卸货班组",
    width: 180
  }, {
    prop: 'dischargeMember',
    label: "卸货人员",
    width: 150,
  }, {
    prop: 'forkLiftDriver',
    label: "叉车司机",
    width: 180
  }, {
    prop: 'remark',
    label: "入库备注",
    width: 180,
    isTooltip: true
  }, {
    prop: 'confirmStatus',
    label: "收货确认状态",
    width: 180,
    formatter: ({ cellValue }) => {
      return cellValue === 'confirm' ? '确认入库' : cellValue === 'cancel' ? '取消确认入库' : ''
    }
  }, {
    prop: 'confirmName',
    label: "收货确认人",
    width: 180,
  }, {
    prop: 'confirmTime',
    label: "收货确认时间",
    width: 180,
    sType: "daterange",
    format: "yyyy-MM-dd HH:mm:ss"
  },
  {
    prop: 'createdName',
    label: "创建人",
    width: 130
  },
  {
    prop: 'createdBy',
    label: "入库人",
    hide: true,
    multi: true,
    multiple: true,
    sType: "remoteSelect",
    remoteSelectList: [],
    remoteMethod: (name, item) => getEmployeeOptions(name, item),
    visibleChange: (name, item) => getEmployeeOptions(name, item)
  }, {
    prop: 'createdTime',
    label: "创建时间",
    width: 130
  }, {
    prop: 'updatedName',
    label: "修改人",
    width: 130
  }, {
    prop: 'updatedTime',
    label: "修改时间",
    width: 130
  }
]

// 获取仓库信息
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
          value: v.wmsWarehouseId
        }))
      )
    })
}
// 获取入库人信息
function getEmployeeOptions (name, item) {
  let data = {
    currPage: 1,
    pageSize: 30,
    cname: name
  }
  getEmployeeList(data)
    .then(({ data }) => {
      item.remoteSelectList.splice(
        0,
        1000,
        ...data.map((v) => ({
          ...v,
          label: v.cname || v.ename,
          value: v.employeeId
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