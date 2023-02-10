export const tableData = [
  {
    prop: 'consumableName',
    label: "辅材名称",
    width: 180
  }, {
    prop: 'consumableNo',
    label: "辅材编号",
    width: 130,
    type: "text",
    sType: "input",
  }, {
    prop: 'unit',
    label: "单位",
    width: 100,
    type: "select",
    propInDict: 'wmsGoodsUnit'
  }, {
    prop: 'specificationType',
    label: "规格型号",
    width: 120,
    type: "text",
    sType: "input"
  }, {
    prop: 'unitPrice',
    label: "售价",
    width: 100
  }, {
    prop: 'fileName',
    label: "辅材图片",
    width: 120,
    type: "button",
    callback: true
  }, {
    prop: 'remark',
    label: "备注",
    width: 130,
    type: "text",
    sType: "input",
  }, {
    prop: 'enabled',
    label: "启用状态",
    width: 120,
    type: 'text',
    formatter: ({ cellValue }) => {
      return cellValue === 'yes' ? '<span style="color:#33B18A;" >启用</span>' : cellValue === 'no' ? '<span style="color:#CD4130;">禁用</span>' : cellValue
    }
  }, {
    prop: 'createdName',
    label: "创建人",
    type: "text",
    sType: "input",
  }, {
    prop: 'createdTime',
    label: "创建时间",
    type: "text",
    sType: "input",
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