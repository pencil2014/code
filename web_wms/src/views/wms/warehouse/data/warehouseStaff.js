import { queryWarehousePage } from '@/api/wms'
export const tableData = [
  {
    prop: 'employeeName',
    label: "姓名",
    width: 130,
    type: "input",
  }, 
  {
    prop: 'warehouseId',
    label: "仓库名称",
    width: 180,
    hide: true,
    multi: true,
    multiple: true,
    sType: "remoteSelect",
    remoteSelectList: [],
    remoteMethod: (name, item) => getWarehouseOptions(name, item),
    visibleChange: (name, item) => getWarehouseOptions(name, item)
  }, {
    prop: 'warehouseName',
    label: "仓库名称",
    width: 180,
    sType: "remoteSelect",
    remoteSelectList: []
  }, {
    prop: 'jobTypeName',
    label: "岗位",
    width: 100,
    type: "select",
    propInDict: 'warehouseEmployeeJobType'
  }, {
    prop: 'entryDate',
    label: "入职日期",
    width: 130,
  }, {
    prop: 'dimissionDate',
    label: "离职日期",
    width: 130,
  }, {
    prop: 'billingUnit',
    label: "绩效计算单位",
    width: 100,
    type: "select",
    propInDict: 'wmsPerforBillingUnit'
  }, {
    prop: 'billingPrice',
    label: "绩效单价",
    width: 100,
  }, {
    prop: 'billingStartTime',
    label: "绩效有效开始时间",
    width: 130,
  }, {
    prop: 'billingEndTime',
    label: "绩效有效结束时间",
    width: 130,
  }, {
    prop: 'createdName',
    label: "创建人",
    width: 130,
    type: "text",
    sType: "input",
  }, {
    prop: 'createdTime',
    label: "创建时间",
    width: 130,
    type: "text",
    sType: "input",
  }, {
    prop: 'updatedName',
    label: "更新人",
    width: 130
  }, {
    prop: 'updatedTime',
    label: "更新时间",
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