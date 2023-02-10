/*
 * @Description: 年度计划搜索条件、表格列配置
 * @Autor: yinjunying
 * @Date: 2022-04-22 11:25:51
 */
import { listByRole, portList, baseSystemLineList, countrySelectList } from "@/api/base"
import { getAreasListApi } from "@/api/crm/annualPlanShipper"
export const searchData = [
  {
    prop: "bdEmployeeId",
    label: "销售",
    width: 180,
    cDisabled: true,
    sType: "remoteSelect",
    remoteSelectList: [],
    remoteMethod: (name, item) => {
      let query = [{ column: 'roleCode', type: 'in', value: 'bd' }]
      name && query.push({ column: "name", type: "eq", value: name })
      listByRole({ currPage: 1, pageSize: 200, query }).then(
        ({ data: { list } }) => {
          item.remoteSelectList.splice(
            0,
            1000,
            ...list.map((v) => ({
              ...v,
              label: `${v.cname}(${v.employeeNo})`,
              value: `${v.employeeId}`,
            }))
          )
        }
      )
    }
  }, {
    prop: "createdTime",
    label: "创建时间",
    width: 180,
    sType: "daterange",
    format: "yyyy-MM-dd"
  }, {
    prop: "verifyTime",
    label: "审核时间",
    width: 180,
    sType: "daterange",
    format: "yyyy-MM-dd"
  }, {
    prop: "year",
    label: "年度",
    width: 180,
    type: "year",
    format: 'yyyy',
    queryType: 'eq'
  }, {
    prop: "polPortCodes",
    label: "起运港",
    width: 180,
    sType: "input",
    sType: "remoteSelect",
    remoteSelectList: [],
    remoteMethod: (name, item) => {
      let query = {
        portAttribute: "port_of_basic",
        portCodes: "",
        portName: name || '',
        state: "valid"
      }
      portList(query).then(
        ({ data }) => {
          item.remoteSelectList.splice(
            0,
            200,
            ...data.map((v) => ({
              ...v,
              label: v.ename.trim() + '(' + v.cname.trim() + ')',
              value: `${v.portCode}`
            }
            ))
          )
        }
      )
    }
  }, {
    prop: "podPortCodes",
    label: "目的港",
    width: 180,
    sType: "input",
    sType: "remoteSelect",
    remoteSelectList: [],
    remoteMethod: (name, item) => {
      let query = {
        portAttribute: "port_of_destination",
        portCodes: "",
        portName: name || '',
        state: "valid"
      }
      portList(query).then(
        ({ data }) => {
          item.remoteSelectList.splice(
            0,
            100,
            ...data.map((v) => ({
              ...v,
              label: v.ename.trim() + '(' + v.cname.trim() + ')',
              value: `${v.portCode}`
            }
            ))
          )
        }
      )
    }
  }, {
    prop: "lineCodes",
    label: "系统航线",
    width: 180,
    sType: "input",
    sType: "remoteSelect",
    remoteSelectList: [],
    remoteMethod: (name, item) => {
      baseSystemLineList(name, '').then(({ data }) => {
        if (data && data.length) {
          item.remoteSelectList.splice(
            0,
            200,
            ...data.map((v) => ({
              ...v,
              label: v.cname.trim() || v.ename.trim(),
              value: v.sysLineCode
            }
            ))
          )
        }
      })
    }
  }, {
    prop: "verifyStatus",
    label: "状态",
    width: 180,
    type: "select",
    propInDict: "annualPlanState"
  }, {
    prop: "name",
    label: "客户名称",
    width: 180,
    type: "input"
  }, {
    prop: "industry",
    label: "所属行业",
    width: 180,
    type: "input"
  }, {
    prop: "isWhitelist",
    label: "是否白名单",
    width: 180,
    type: "select",
    propInDict: 'yesNo'
  },{
    prop: "ordinate",
    label: "查看范围",
    width: 180,
    type: "select",
    propInDict: "annualOrdinate"
  },
]

// 表格列
export const columnsData = [
  {
    prop: 'ordinate',
    label: '月份',
    minWidth: '125px',
    fixed: 'left'
  }, {
    prop: 'jan',
    label: '一月',
    minWidth: '60px'
  }, {
    prop: 'feb',
    label: '二月',
    minWidth: '60px'
  }, {
    prop: 'mar',
    label: '三月',
    minWidth: '60px'
  }, {
    prop: 'apr',
    label: '四月',
    minWidth: '60px'
  }, {
    prop: 'may',
    label: '五月',
    minWidth: '60px'
  }, {
    prop: 'jun',
    label: '六月',
    minWidth: '60px'
  }, {
    prop: 'jul',
    label: '七月',
    minWidth: '60px'
  }, {
    prop: 'aug',
    label: '八月',
    minWidth: '60px'
  }, {
    prop: 'sept',
    label: '九月',
    minWidth: '60px'
  }, {
    prop: 'oct',
    label: '十月',
    minWidth: '60px'
  }, {
    prop: 'nov',
    label: '十一月',
    minWidth: '60px'
  }, {
    prop: 'dec',
    label: '十二月',
    minWidth: '60px'
  }, {
    prop: 'total',
    label: '总计',
    minWidth: '70px',
    fixed: 'right'
  }
]

/************************************************船司年度计划***************************************************** */
export const shipperSearchData = [
  {
    prop: "shippingCarrierCode",
    label: "船司代码",
    width: 180,
    type: "input"
  }, {
    prop: "year",
    label: "年度",
    width: 180,
    type: "select",
    multiple: true,
    propInDict: "scYear",
  }, {
    prop: "createName",
    label: "创建人",
    width: 180,
    type: "input"
  }, {
    prop: "createdTime",
    label: "创建时间",
    width: 180,
    sType: "daterange",
    format: "yyyy-MM-dd"
  }, {
    prop: "area",
    label: "区域",
    width: 180,
    sType: "input",
    sType: "remoteSelect",
    remoteSelectList: [],
    remoteMethod: (name, item) => {
      let query = {
        area: name
      }
      getAreasListApi(query)
      .then(
        ({ data }) => {
          item.remoteSelectList.splice(
            0,
            200,
            ...data.map((v) => ({
              ...v,
              label: v.trim(),
              value: v.trim()
            }
            ))
          )
        }
      )
    },
    multi: true,
    multiple: true,
    forceSelection: true,
  }, {
    prop: "polPortCodes",
    label: "起运港",
    width: 180,
    sType: "input",
    sType: "remoteSelect",
    remoteSelectList: [],
    remoteMethod: (name, item) => {
      let query = {
        portAttribute: "port_of_basic",
        portCodes: "",
        portName: name || '',
        state: "valid"
      }
      portList(query).then(
        ({ data }) => {
          item.remoteSelectList.splice(
            0,
            200,
            ...data.map((v) => ({
              ...v,
              label: v.ename.trim() + '(' + v.cname.trim() + ')',
              value: `${v.portCode}`
            }
            ))
          )
        }
      )
    },
    multi: true,
    multiple: true,
    forceSelection: true,
  }, {
    prop: "countryCode",
    label: "目的港国家",
    width: 180,
    sType: "input",
    sType: "remoteSelect",
    remoteSelectList: [],
    remoteMethod: (name, item) => {
      let query = {
        countryCode: name,
      }
      countrySelectList(query).then(
        ({ data }) => {
          item.remoteSelectList.splice(
            0,
            100,
            ...data.map((v) => ({
              ...v,
              label: v.ename.trim() + '(' + v.cname.trim() + ')',
              value: `${v.countryCode}`
            }
            ))
          )
        }
      )
    },
    multi: true,
    multiple: true,
    forceSelection: true,
  }, {
    prop: "podPortCodes",
    label: "目的港",
    width: 180,
    sType: "input",
    sType: "remoteSelect",
    remoteSelectList: [],
    remoteMethod: (name, item) => {
      let query = {
        portAttribute: "port_of_destination",
        portCodes: "",
        portName: name || '',
        state: "valid"
      }
      portList(query).then(
        ({ data }) => {
          item.remoteSelectList.splice(
            0,
            200,
            ...data.map((v) => ({
              ...v,
              label: v.ename.trim() + '(' + v.cname.trim() + ')',
              value: `${v.portCode}`
            }
            ))
          )
        }
      )
    },
    multi: true,
    multiple: true,
    forceSelection: true,
  }, {
    prop: "lineCodes",
    label: "航线",
    width: 180,
    sType: "input",
    sType: "remoteSelect",
    remoteSelectList: [],
    remoteMethod: (name, item) => {
      baseSystemLineList(name).then(
        ({ data }) => {
          item.remoteSelectList.splice(
            0,
            200,
            ...data.map((v) => ({
              ...v,
              label: v.cname.trim() || v.ename.trim(),
              value: `${v.sysLineCode}`
            }
            ))
          )
        }
      )
    },
    multi: true,
    multiple: true,
    forceSelection: true,
  }
]

export function setShipperColumnsData () {
  let shipperColumnsData = []
  for (let i = 1; i < 13; i++) {
    shipperColumnsData.push([
      {
        prop: 'ordinate',
        label: `${i}月`,
        minWidth: '120px',
      }, {
        prop: 'firstWeek',
        label: '第1周',
        minWidth: '60px'
      }, {
        prop: 'secondWeek',
        label: '第2周',
        minWidth: '60px'
      }, {
        prop: 'thirdWeek',
        label: '第3周',
        minWidth: '60px'
      }, {
        prop: 'fourthWeek',
        label: '第4周',
        minWidth: '60px'
      }, {
        prop: 'fifthWeek',
        label: '第5周',
        minWidth: '60px'
      }, {
        prop: 'total',
        label: '总计',
        minWidth: '60px'
      }
    ])
  }
  return shipperColumnsData
}

export const monthDataObj = {
  monthData: [
    {
      ordinate: '船司计划分配舱位(T)',
      ordinateCode: 'SHIPPER_WEEK_SPACE',
      firstWeek: null,
      secondWeek: null,
      thirdWeek: null,
      fourthWeek: null,
      total: null
    }, {
      ordinate: '船司实际装载周舱位(T)',
      ordinateCode: 'SHIPPER_ACTUAL_WEEK_SPACE',
      firstWeek: null,
      secondWeek: null,
      thirdWeek: null,
      fourthWeek: null,
      total: null
    }, {
      ordinate: '我司目标装载周舱位(T)',
      ordinateCode: 'OUR_TARGET_WEEK_SPACE',
      firstWeek: null,
      secondWeek: null,
      thirdWeek: null,
      fourthWeek: null,
      total: null
    }, 
    // {
    //   ordinate: '我司实际装载周舱位(T)',
    //   ordinateCode: 'OUR_ACTUAL_WEEK_SPACE',
    //   firstWeek: null,
    //   secondWeek: null,
    //   thirdWeek: null,
    //   fourthWeek: null,
    //   total: null
    // }, 
    {
      ordinate: '月目标T量',
      ordinateCode: 'MONTH_TARGET_TEU',
      firstWeek: null
    }, {
      ordinate: '月目标利润(USD)',
      ordinateCode: 'MONTH_TARGET_USD',
      firstWeek: null
    }
  ]
}