export const tableData = [
  {
    prop: 'warehouseName',
    label: "仓库名称",
    width: 180,
    sType: "remoteSelect",
    remoteSelectList: []
  }, {
    prop: 'warehouseCode',
    label: "仓库代码",
    width: 130,
    type: "text",
    sType: "input",
  }, {
    prop: 'countryName',
    label: "国家",
    width: 100,
    type: "text",
    sType: "input",
  }, {
    prop: 'provinceName',
    label: "省份",
    width: 100,
    type: "text",
    sType: "input",
  }, {
    prop: 'cityName',
    label: "城市",
    width: 100,
    type: "text",
    sType: "input",
  }, {
    prop: 'address',
    label: "详细地址",
    width: 180,
    type: "text",
    sType: "input",
  }, {
    prop: 'telephone',
    label: "仓库电话",
    width: 130,
    type: "text",
    sType: "input",
  }, {
    prop: 'warehouseSupervisorName',
    label: "仓库负责人",
    width: 130,
    type: "text",
    sType: "input",
  }, {
    prop: 'supervisorMobileNo',
    label: "仓库负责人电话",
    width: 130,
    type: "text",
    sType: "input",
  }, {
    prop: 'hasWarehouseInsideZone',
    label: "仓库内部区域",
    width: 130,
    type: "button",
    callback: true,
    sType: "input"
    
  }, {
    prop: 'hasWarehouseForklift',
    label: "是否有叉车",
    width: 130,
    type: "button",
    callback: true,
    sType: "input"
  }, {
    prop: 'storageFeePrice',
    label: "默认仓租单价",
    width: 130,
    type: "text",
    sType: "input",
    formatter: ({ cellValue }) => {
      return cellValue + '元'
    }
  }, {
    prop: 'inWarehousFeeAmt',
    label: "默认入仓费金额",
    width: 130,
    type: "text",
    sType: "input",
    formatter: ({ cellValue }) => {
      return cellValue + '元'
    }
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
    label: "修改人",
    width: 130,
    type: "text",
    sType: "input",
  }, {
    prop: 'updatedTime',
    label: "修改时间",
    width: 130,
    type: "text",
    sType: "input",
  }
]