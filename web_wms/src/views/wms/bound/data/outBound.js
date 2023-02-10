import { getEmployeeList } from '@/api/wms/warehouse.js'
import { getCustomerList } from '@/api/wms/inBound.js'
import { queryWarehousePage } from '@/api/wms'
export const tableData = [
  {
    prop: 'warehouseId',
    label: "仓库名称",
    hide: true,
    customColumnHide: true,
    multi: true,
    multiple: true,
    sType: "remoteSelect",
    remoteSelectList: [],
    remoteMethod: (name, item) => getWarehouseOptions(name, item),
    visibleChange: (name, item) => getWarehouseOptions(name, item)
  }, {
    prop: 'warehouseName',
    label: "仓库名称",
    width: 180
  }, {
    prop: 'outboundNo',
    label: "出库号",
    width: 150,
    type: "text",
    sType: "input",
    isTooltip: true
  }, {
    prop: 'inboundNo',
    label: "入库号",
    input: 'text',
    sType: "input",
    hide: true
  }, {
    prop: 'outboundTime',
    label: "出库日期",
    width: 150,
    type: "daterange",
    format: "yyyy-MM-dd",
    ranges: ['beginDate', 'endDate']
  }, {
    prop: 'printTime',
    label: "打印时间",
    width: 150,
    sType: "daterange",
    format: "yyyy-MM-dd HH:mm:ss"
  },
  {
    prop: 'custName',
    label: "客户名称",
    width: 200
  }, {
    prop: 'lsWorkOrderNo',
    label: "长帆工作单号",
    width: 150
  }, {
    prop: 'custId',
    label: "客户名称",
    hide: true,
    sType: "remoteSelect",
    remoteSelectList: [],
    remoteMethod: (name, item) => getCustomerOptions(name, item),
    visibleChange: (name, item) => getCustomerOptions(name, item)
  }, {
    prop: 'cabinetType',
    label: "柜型",
    width: 100
  }, {
    prop: 'containerNo',
    label: "集装箱号",
    width: 150
  }, {
    prop: 'sealNo',
    label: "封条号",
    width: 150
  }, {
    prop: 'shippingBookNo',
    label: "订舱号",
    width: 150
  }, {
    prop: 'goodsName',
    label: "货物名称",
    width: 150
  }, {
    prop: 'actualWeight',
    label: "毛重",
    width: 100
  }, {
    prop: 'hasDischargePicture',
    label: "是否装货拍照",
    width: 120,
    type: "button",
    propInDict: "yesNo",
    no__line: (row, val) => val === 'no',
    formatter: ({ row }) => {
      if (row['hasDischargePicture'] === 'yes') {
        return '<span style="color:#3E80F5;">是</span>'
      } else if (row['hasDischargePicture'] === 'no') {
        return '<span style="color:#333333;">否</span>'
      } else {
        return ''
      }
    }
  }, {
    prop: 'orderPush',
    label: "订单推送",
    width: 120,
    type: "select",
    propInDict: "yesNo",
  }, {
    prop: 'outboundStatus',
    label: "状态",
    width: 120,
    type: "select",
    propInDict: "wmsOutboundStatus",
    formatter: ({ cellValue }) => {
      if (cellValue === 'created') {
        return '<span style="color:#3E80F5;" >已办单</span>'
      } else if (cellValue === 'process') {
        return '<span style="color:#DFA725;" >装货中</span>'
      } else if (cellValue === 'done') {
        return '<span style="color:#33B18A;" >已出库</span>'
      } else {
        return ''
      }
    }
  }, {
    prop: 'carryWharfYardName',
    label: "提柜地点",
    width: 140
  }, {
    prop: 'backWharfYardName',
    label: "还柜地点",
    width: 140
  }, {
    prop: 'licensePlate',
    label: "装货车牌",
    width: 140
  }, {
    prop: 'driverName',
    label: "司机姓名",
    width: 140
  }, {
    prop: 'driverPhone',
    label: "司机手机号",
    width: 140
  }, {
    prop: 'estimatedQuantity',
    label: "预出合计",
    width: 140
  }, {
    prop: 'actualQuantity',
    label: "实出合计",
    width: 140
  }, {
    prop: 'hasOffsite',
    label: "是否异地",
    width: 140,
    type: "select",
    propInDict: "yesNo"
  }, {
    prop: 'hasSelfVehicle',
    label: "是否自派车",
    width: 140,
    type: "select",
    propInDict: "yesNo"
  }, {
    prop: 'hasCarrayOverweight',
    label: "是否提柜过磅",
    width: 140,
    type: "select",
    propInDict: "yesNo"
  }, {
    prop: 'hasReturnOverweight',
    label: "是否还柜过磅",
    width: 140,
    type: "select",
    propInDict: "yesNo"
  }, {
    prop: 'hasDisinfect',
    label: "是否消毒放药",
    width: 140,
    type: "select",
    propInDict: "yesNo"
  }, {
    prop: 'hasDoubleLayerWinch',
    label: "双层缆盘装箱",
    width: 140,
    type: "select",
    propInDict: "yesNo"
  }, {
    prop: 'hasThreeLayerWinch',
    label: "三层缆盘装箱",
    width: 140,
    type: "select",
    propInDict: "yesNo"
  }, {
    prop: 'consumableStatus',
    label: "辅材录入状态",
    width: 140,
    type: 'select',
    propInDict: 'wmsMaterialEntryStatus'
  }, {
    prop: 'dispatchTime',
    label: "装货时间",
    width: 140
  }, {
    prop: 'workTeamName',
    label: "装货班组",
    width: 140
  }, {
    prop: 'dischargeMember',
    label: "装货人员",
    width: 140
  }, {
    prop: 'forkLift',
    label: "叉车司机",
    width: 140
  }, {
    prop: 'remark',
    label: "出库备注",
    width: 140
  }, {
    prop: 'workRequirement',
    label: "装货要求",
    width: 160
  }, {
    prop: 'confirmName',
    label: "出库完成确认人",
    width: 140
  }, {
    prop: 'confirmTime',
    label: "出库完成确认时间",
    width: 140
  },
  {
    prop: 'createdName',
    label: "创建人",
    width: 140
  }, {
    prop: 'createdBy',
    label: '出库人',
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
    width: 140
  }, {
    prop: 'updatedName',
    label: "修改人",
    width: 140
  }, {
    prop: 'updatedTime',
    label: "修改时间",
    width: 140
  },
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
          value: v.custid
        }))
      )
    })
}