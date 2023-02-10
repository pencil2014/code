import { listByRole } from "@/api/base"
import store from '@/store'
import { formatIndustry } from "@/utils/crm"
// searchHide: true 不做为搜索条件
// sType 搜索条件时的类型
// cDisabled 自定义表头时，禁止移动
/********** 客户列表table **********/
export const customerListTable = [
  {
    prop: "name",
    label: "客户名称",
    width: 180,
    type: "button",
    callback: true,
    sType: "input",
    cDisabled: true,
    tag: true,
  },
  {
    prop: "custClass",
    label: "客户类型",
    type: "select",
    propInDict: "customerClassNew",
    multi: true,
    multiple: true,
    forceSelection: true,
  },
  // { prop: 'serviceMode', label: '新旧模式', type: 'select', propInDict: 'customerServiceMode', multi: true, multiple: true },
  { prop: "custLevel", label: "客户级别", type: "select", multiple: true },
  { prop: "verifyTime", label: "审核时间",
    sType: "daterange",
    format: "yyyy-MM-dd",
    potentialHide: true,
    width: 130,
    formatter: ({ cellValue }) => {
      return cellValue ? cellValue.split(" ")[0] : ""
    }
  },
  {
    prop: "roleTypeInfo",
    label: "企业类别",
    type: "select",
    propInDict: "customerRole",
    multi: true,
    width: 100,
    multiple: true,
    forceSelection: true,
  },
  {
    prop: "verifyStatus",
    label: "是否草稿",
    type: "select",
    potentialHide: true,
    multiple: true,
    formatter: ({ cellValue }) =>
    cellValue === "draft" ? "草稿" : "非草稿",
  },
  { prop: 'status', label: '资质认证', type: 'select', propInDict: 'custQuaStatus', multi: true },
  { prop: 'regSource', label: '客户来源', type: 'select', propInDict: 'custSource', multi: true },
  { prop: "mDate",label: "保有时间",sType: "daterange",format: "yyyy-MM-dd"},
  { prop: 'commuDate', label: '最近跟进时间', type: 'input'},
  {
    prop: "isUploadContract",
    label: "是否上传合同",
    width: 100,
    type: "select",
    propInDict: "yesNo",
    formatter: ({ cellValue }) =>
      cellValue === "yes" ? "是" : cellValue === "no" ? "否" : "",
  },
  { prop: "shortName", label: "中文简称" },
  { prop: "ename", label: "英文名" },
  { prop: "shortEname", label: "英文简称" },
  { prop: "industry", label: "所属行业", width: 120,
    formatter: ({ cellValue }) => {
      return formatIndustry(cellValue)
    }
  },
  { prop: "entType", label: "客户性质", width: 120, type: "select" },
  { prop: "uscc", label: "社信统一代码", width: 160 },
  { prop: "taxId", label: "纳税人识别号", width: 160 },
  { prop: "socialStaffNum", label: "参保人数" },
  {
    prop: "setupDate",
    label: "成立日期",
    sType: "daterange",
    format: "yyyy-MM-dd",
  },
  {
    prop: "usccExpDate",
    label: "营业执照到期日",
    width: 100,
    sType: "daterange",
    format: "yyyy-MM-dd",
  },
  { prop: "country", label: "国家(行政区)" },
  {
    prop: "indexAddr",
    label: "省/市/区",
    sLabel: "省",
    formatter: ({ row }) =>
      row.province && `${row.province}/${row.city}/${row.district}`,
  },
  { prop: "registerAddr", label: "注册地址", width: 160, isTooltip: true },
  { prop: "detailAddr", label: "实际地址", width: 160, isTooltip: true },
  // {
  //   prop: 'deptCname',
  //   label: '维护业务及部门',
  //   width: 160,
  //   formatter: ({ row: { employeeVos } }) => {
  //     return (employeeVos||[]).reduce((cur, next) => {
  //       if (!next) return cur
  //       return cur + next.deptCname + '，' + next.cname + ' '
  //     }, '')
  //   },
  //   isTooltip: true
  // },
  {
    prop: "deptCname",
    label: "下单客户维护人",
    width: 160,
    formatter: ({ row: { customerBds } }) => {
      // 容错 加入 || []
      let source = (customerBds || [])
        .filter((item) => item.maintainerType === "order")
        .map((ele) => {
          return `${ele.bdEmployeeName}(${ele.bdDeptName})`
        })
        .join("，")
      return source
    },
    isTooltip: true,
  },
  {
    prop: "deptCname2",
    label: "潜在维护人",
    width: 160,
    formatter: ({ row: { customerBds } }) => {
      // 容错 加入 || []
      let source = (customerBds || [])
        .filter((item) => item.maintainerType === "potential")
        .map((ele) => {
          return `${ele.bdEmployeeName}(${ele.bdDeptName})`
        })
        .join("，")
      return source
    },
    isTooltip: true,
  },
  {
    prop: "deptCname3",
    label: "普通客户维护人",
    width: 160,
    formatter: ({ row: { customerBds } }) => {
      // 容错 加入 || []
      let source = (customerBds || [])
        .filter((item) => item.maintainerType === "general")
        .map((ele) => {
          return `${ele.bdEmployeeName}(${ele.bdDeptName})`
        })
        .join("，")
      return source
    },
    isTooltip: true,
  },
  {
    prop: "firstTime",
    label: "首次合作时间",
    sType: "daterange",
    format: "yyyy-MM-dd",
    potentialHide: true,
    width: 130,
    formatter: ({ cellValue }) => {
      return cellValue ? cellValue.split(" ")[0] : ""
    },
  },
  {
    prop: "nearlyTime",
    label: "最近合作时间",
    sType: "daterange",
    format: "yyyy-MM-dd",
    potentialHide: true,
    width: 130,
    formatter: ({ cellValue }) => {
      return cellValue ? cellValue.split(" ")[0] : ""
    },
  },
]
/********** 供应商列表table **********/
export const supplierListTable = [
  {
    prop: "name",
    label: "供应商名称",
    width: 180,
    type: "button",
    callback: true,
    sType: "input",
    cDisabled: true,
    tag: true,
  },
  {
    prop: "categorys",
    label: "供应商类型",
    type: "select",
    renderNoEdit: true,
    isTooltip: true,
    propInDict: "crmCategory",
    multi: true,
    width: 140,
    searchProp: "categoryInfo",
    multiple: true,
  },
  {
    prop: "biztypes",
    label: "可支持业务",
    type: "select",
    renderNoEdit: true,
    isTooltip: true,
    propInDict: "crmBusiness",
    multi: true,
    width: 140,
    searchProp: "biztypeInfo",
    multiple: true,
  },
  {
    prop: "serviceItems",
    label: "可支持服务项",
    type: "select",
    renderNoEdit: true,
    isTooltip: true,
    propInDict: "crmService",
    multi: true,
    width: 140,
    searchProp: "serviceItems",
    multiple: true,
  },
  {
    prop: "verifyStatus",
    label: "审核状态",
    type: "select",
    searchHide: true,
    multiple: true,
  },
  {
    prop: "activeStatus",
    label: "活跃状态",
    type: "select",
    searchHide: true,
    multiple: true,
  },
  { prop: "shortName", label: "中文简称" },
  { prop: "ename", label: "英文名" },
  { prop: "shortEname", label: "英文简称" },
  { prop: "industry", label: "所属行业", width: 120,
    formatter: ({ cellValue }) => {
      return formatIndustry(cellValue)
    }
  },
  { prop: "entType", label: "企业类型", width: 120 },
  { prop: "uscc", label: "社信统一代码", width: 160 },
  { prop: "taxId", label: "纳税人识别号", width: 160 },
  {
    prop: "setupDate",
    label: "成立日期",
    sType: "daterange",
    format: "yyyy-MM-dd",
  },
  {
    prop: "usccExpDate",
    label: "营业执照到期日",
    width: 100,
    sType: "daterange",
    format: "yyyy-MM-dd",
  },
  { prop: "registerAddr", label: "注册地址", width: 160, isTooltip: true },
  { prop: "country", label: "国家(行政区)" },
  {
    prop: "indexAddr",
    label: "省/市/区",
    sLabel: "省",
    formatter: ({ row }) =>
      row.province && `${row.province}/${row.city}/${row.district}`,
  },
  { prop: "detailAddr", label: "详细地址", width: 160, isTooltip: true },
  {
    prop: "mtEmployeeName",
    label: "维护人",
    sType: "remoteSelect",
    remoteSelectList: [],
    remoteMethod: (name, item) => {
      // let query = [{ column: 'roleCode', type: 'in', value: 'bd,obd' }]
      let query = []
      name && query.push({ column: "name", type: "eq", value: name })
      listByRole({ currPage: 1, pageSize: 200, query }).then(
        ({ data: { list } }) => {
          item.remoteSelectList.splice(
            0,
            1000,
            ...list.map((v) => ({
              ...v,
              label: `${v.cname}(${v.employeeNo})`,
              value: v.employeeId,
            }))
          )
        }
      )
    },
  },
]
/********** 黑名单列表table **********/
// 转换拉黑状态数据
function formatBlackReason(val) {
  let str = ''
  switch (val) {
    case 'title_cancel':
      str = '抬头注销'
      break;
    case 'audit_notice':
      str = '审计中心通知'
      break;
    case 'subject_change':
      str = '合作主体变更'
      break;
    case 'other':
      str = '其他'
    break;
    default:
      str = ''
      break;
  } 
  return str
}
export const blackListTable = [
  { 
    prop: "name",
    label: "企业名称",
    width: 200,
    arrow: true,
    callback: (row) => (row.toggle = !row.toggle)
  },
  {
    prop: "deptCname",
    label: "维护业务及部门",
    width: 180,
    isTooltip: true,
    formatter: (row) => {
      let employeeVos = row.employeeVos || []
      // return employeeVos.reduce((cur, next) => {
      //   if (!next) return cur
      //   return cur + next.deptCname + '，' + next.cname + '；'
      // }, '')
      if (employeeVos.length) {
        return employeeVos
        .map((item) =>
          item.deptCname ? [item.deptCname, item.cname].join(", ") : item.cname
        )
        .join("; ")
      } else {
        return ''
      }
    },
  },
  {
    prop: "state",
    label: "状态", 
    width: 100, 
    type: "select",
    propInDict: "blackState",
    multi: true,
    // isTooltip: true,
    formatter: (row) => {
      return row.state === 'valid' ? '已拉黑' : row.state === 'invalid' ? '已解除' : ''
    }
  },
  {
    prop: "createdTime",
    label: "拉黑时间",
    sType: "daterange",
    format: "yyyy-MM-dd",
    width: 130,
    multi: true
  },
  { prop: "createdName", label: "拉黑人", width: 130, multi: true },
  {
    prop: "blackReason",
    label: "拉黑原因",
    width: 180,
    type: "select",
    propInDict: "blacklistReason",
    multi: true,
    formatter: (row) => {
      if (row.blackReason) {
        if (row.blackReason.includes(',')) {
          var arr = []
          row.blackReason.split(',').forEach(item => {
            arr.push(formatBlackReason(item))
          })
          return arr.join(',')
        } else {
          return formatBlackReason(row.blackReason)
        }
      } else {
        return ''
      }
    }
  },
  { prop: "blackRemark", label: "拉黑备注", width: 180, multi: true },
  {
    prop: "allowFeeAp",
    label: "是否可录入应付费用",
    width: 120,
    sType: "select",
    propInDict: "yesNo",
    multi: true,
    // isTooltip: true,
    showOverflow: false,
    formatter: (row) => {
      if (row.allowFeeAp === 'no') {
        return '否'
      } else if (row.allowFeeAp === 'yes') {
        return '是'
      } else {
        return ''
      }
    }
  },
    {
    prop: "allowFeeAr",
    label: "是否可录入应收费用",
    width: 120,
    sType: "select",
    propInDict: "yesNo",
    multi: true,
    // isTooltip: true,
    showOverflow: false,
    formatter: (row) => {
      if (row.allowFeeAr === 'no') {
        return '否'
      } else if (row.allowFeeAr === 'yes') {
        return '是'
      } else {
        return ''
      }
    }
  },
  { 
    prop: "releaseTime",
    label: "解除时间",
    width: 150,
    sType: "daterange",
    format: "yyyy-MM-dd",
    multi: true
  },
  {
    prop: "releaseName",
    label: "解除人",
    width: 130,
    sType: "remoteSelect",
    remoteSelectList: [],
    multi: true,
    remoteMethod: (name, item) => {
      let query = []
      name && query.push({ column: "name", type: "eq", value: name })
      listByRole({ currPage: 1, pageSize: 200, query }).then(
        ({ data: { list } }) => {
          item.remoteSelectList.splice(
            0,
            1000,
            ...list.map((v) => ({
              ...v,
              label: `${v.cname}(${v.employeeNo})`,
              value: `${v.cname}`,
            }))
          )
        }
      )
    },
  },
  { 
    prop: "releaseReason",
    label: "解除原因",
    width: 220,
    type: "select",
    propInDict: "blacklistRelieveReason",
    multi: true
  },
  { prop: "releaseRemark", label: "解除备注", width: 180, multi: true }
]
/********** 客户回收记录列表table **********/
export const removeListTable = [
  { prop: "custName", label: "客户名称", width: 180 },
  { prop: "bdEmployeeName", label: "业务员" },
  { prop: "removeEmployeeName", label: "回收者" },
  { prop: "removeReason", label: "回收原因" },
  { prop: "removeRemark", label: "说明" },
  {
    prop: "removeTime",
    label: "回收时间",
    sType: "daterange",
    format: "yyyy-MM-dd",
  },
]
/********** 拜访计划列表table **********/
export const visitListTable = [
  {
    prop: "planMonth",
    label: "拜访年月",
    minWidth: 130,
    sType: "monthrange",
    // monthrange
    format: "yyyy-MM",
    arrow: true,
    callback: (row) => (row.toggle = !row.toggle),
  },
  { prop: "employeeName", label: "姓名", width: 100 },
  { prop: "employeeDeptName", label: "部门", width: 100 },
  { prop: "employeeTitleName", label: "职位", width: 100 },
  {
    prop: "phaseDate",
    label: "时间区间",
    width: 180,
    sType: "daterange",
    format: "yyyy-MM-dd",
    multi: true,
    showOverflow: false,
    formatter: (row) => {
      return row.phaseBeginDate + " ~ " + row.phaseEndDate
    },
  },
  {
    prop: "planVisitNum",
    label: "计划拜访总数",
    width: 80,
    multi: true,
    searchHide: true,
    showOverflow: false,
  },
  {
    prop: "realVisitNum",
    label: "实际拜访总数",
    width: 80,
    multi: true,
    searchHide: true,
    showOverflow: false,
  },
  {
    prop: "remark",
    label: "情况说明",
    minWidth: 230,
    multi: true,
    searchHide: true,
    forceTooltip: true,
    showOverflow: false,
  },
]
// 新版拜访计划查询条件 added by yjy on 2022-7-14
export const visitPlanSearchData = [
  {
    prop: 'companyName',
    label: '拜访公司',
    width: 180,
    type: "input"
  }, {
    prop: 'bdEmployeeName',
    label: '跟进人',
    width: 180,
    type: "input"
  }, {
    prop: 'visitDate',
    label: '跟进时间',
    sType: 'daterange',
    format: 'yyyy-MM-dd'
  }
]
/********** 公海列表table **********/
export const recycleListTable = [
  {
    prop: "name",
    label: "客户名称",
    width: 180,
    type: "button",
    callback: true,
    sType: "input",
    cDisabled: true,
  },
  {
    prop: "custClass",
    label: "客户类型",
    type: "select",
    propInDict: "customerClassNew",
    multiple: true,
  },
  // { prop: 'serviceMode', label: '新旧模式', type: 'select', propInDict: 'customerServiceMode', multi: true, multiple: true },
  { prop: "custLevel", label: "客户级别", type: "select", multiple: true },
  { prop: "shortName", label: "中文简称" },
  { prop: "ename", label: "英文名" },
  { prop: "shortEname", label: "英文简称" },
  // { prop: "deptName", label: "所属部门"},
  { prop: "roleType",
    label: "企业类别",
    type: "select",
    renderNoEdit: true,
    isTooltip: true,
    propInDict: "customerRole",
    multi: true,
    width: 140,
    searchProp: "roleType",
    multiple: true,
  },

  { prop: "industry", label: "所属行业", width: 120,
    formatter: ({ cellValue }) => {
      return formatIndustry(cellValue)
    }
  },
  { prop: "entType", label: "企业类型", width: 120 },
  { prop: "uscc", label: "社信统一代码", width: 160 },
  { prop: "taxId", label: "纳税人识别号", width: 160 },
  { prop: "socialStaffNum", label: "参保人数" },
  {
    prop: "setupDate",
    label: "成立日期",
    sType: "daterange",
    format: "yyyy-MM-dd",
  },
  {
    prop: "usccExpDate",
    label: "营业执照到期日",
    sType: "daterange",
    width: 100,
    format: "yyyy-MM-dd",
  },
  { prop: "registerAddr", label: "注册地址", width: 160, isTooltip: true },
  { prop: "country", label: "国家(行政区)" },
  {
    prop: "indexAddr",
    label: "省/市/区",
    sLabel: "省",
    formatter: ({ row }) =>
      row.province && `${row.province}/${row.city}/${row.district}`,
  },
  { prop: "detailAddr", label: "实际地址", width: 160, isTooltip: true },
  // { prop: 'detailAddr2', label: '单量' },
  // { prop: 'detailAddr3', label: 'T量' },
  // { prop: 'detailAddr4', label: '订单金额' },
  // { prop: 'detailAddr5', label: '利润' },
]
/********** 合同管理列表table 老版**********/
export const contractListTable = [
  { 
    prop: "organizationName",
    label: "企业名称",
    width: 200,
    arrow: true,
  },
  {
    prop: "orgType",
    label: "类型",
    width: 180,
    sType: "select",
    isTooltip: true,
    formatter: (row) => {
      return row.orgType.join(",")
    }
  },
  {
    prop: "customerRole",
    label: "客户类型",
    width: 150,
    sType: "select",
    isTooltip: true,
    formatter: (row) => {
      let customerRole = row.customerRole || []
      let arr = []
      if (customerRole.length) {
        store.state.dict.dictMap.customerRole.map(k=>{
          customerRole.map(item =>{
            if(item ==k.value){
              return  arr.push(k.label)
            }
          })
        })
        return arr.join(", ")
      } 
    }
  },
  {
    prop: "supplierCategory",
    label: "供应商类型",
    width: 150,
    sType: "select",
    isTooltip: true,
    formatter: (row) => {
      let categorys = row.supplierCategory || []
      let arr = []
      if (categorys.length) {
        store.state.dict.dictMap.crmCategory.map(k=>{
          categorys.map(item =>{
            if(item ==k.value){
              return  arr.push(k.label)
            }
          })
        })
        return arr.join(", ")
      } 
    }
  },
  {
    prop: "bdEmployeeName",
    label: "维护人",
    width: 180,
    isTooltip: true,
    formatter: (row) => {
      let bdEmployeeName = row.bdEmployeeName || []
      if (bdEmployeeName.length) {
        return bdEmployeeName.map((item) =>item).join("; ")
      } else {
        return ''
      }
    },
  },
  {
    prop: "nearlyTime",
    label: "最近合作日期",
    sType: "daterange",
    format: "yyyy-MM-dd",
    width: 150,
  },
  {
    prop: "effectStatus",
    label: "是否有有效合同",
    width: 120,
    sType: "select", 
    isTooltip: true,
    formatter: (row) => {
      if(row.haveSupplierContract || row.haveCustContract) {
        return '有'
      } else {
        return  '无'
      }
    }
  },
  { prop: "contractNo", label: "合同编号", width: 130, multi: true },

  { prop: "agreementType", label: "合同类型", width: 130, multi: true, sType: "select",
    formatter: (row) => {
      if (row.agreementType =='normal') {
        return '客户合同'
      } else if(row.agreementType =='inner_audit'){
        return '内部审批'
      }else if(row.agreementType =='supplier'){
        return '供应商合同'
      }else{
        return 
      }
    }, 
  },
  {
    prop: "effectTime",
    label: "合同有效期",
    sType: "daterange",
    format: "yyyy-MM-dd",
    width: 250,
    multi: true,
    formatter: (row) => {
        return  row.effectBeginDate + '-'+ row.effectEndDate
    }, 
  },
]
/********** 船司管理列表table **********/
export const shippingCarrierListTable = [
  { 
    prop: "shippingCarrierCode",
    label: "船司代码",
    width: 180,
    isTooltip: true,
  },
  { 
    prop: "cname",
    label: "中文名称",
    width: 180,
    isTooltip: true,
  },
  { 
    prop: "ename",
    label: "英文名称",
    width: 180,
    isTooltip: true,
  },
  { 
    prop: "webUrl",
    label: "船司官网",
    width: 180,
    isTooltip: true,
  },
  {
    prop: "status",
    label: "状态",
    width: 100,
    sType: "select", 
    isTooltip: true,
    formatter: (row) => {
      if(row.status === 'valid' ) {
        return '有效'
      }else if(row.status === 'invalid' ) {
        return '无效'
      }else if(row.status === 'create' ){
        return  '待审核'
      }
    }
  },
  // { prop: "shippingBd", label: "维护人",},
  {
    prop: "createdTime",
    label: "创建时间",
    sType: "daterange",
    format: "yyyy-MM-dd",
    width: 100,
  },
]
/********** 审核列表table **********/
export const customerVerifyListTable = [
  {
    prop: "name",
    label: "客户名称",
    width: 180,
    type: "button",
    callback: true,
    sType: "input",
    cDisabled: true,
    tag: true,
  },
  {
    prop: "employeeName",
    label: "发起申请人",
    width: 160,
    isTooltip: true,
  },
  {
    prop: "deptFullCname",
    label: "申请人部门",
    width: 160,
    isTooltip: true,
  },
  
  {
    prop: "verifyType",
    label: "审核类型",
    type: "select",
    isTooltip: true,
  },
  {
    prop: "verifyStatus",
    label: "审核状态",
    type: "select",
    isTooltip: true,
  },
    {
    prop: "createdName",
    label: "创建人姓名",
    width: 160,
    isTooltip: true,
  },
  { prop: "createdTime", 
    label: "创建时间",
    sType: "daterange",
    format: "yyyy-MM-dd",
    potentialHide: true,
    width: 130,
    formatter: ({ cellValue }) => {
      return cellValue ? cellValue.split(" ")[0] : ""
    }
  },
  {
    prop: "verifyTime",
    label: "审核时间",
    sType: "daterange",
    format: "yyyy-MM-dd",
    potentialHide: true,
    width: 130,
    formatter: ({ cellValue }) => {
      return cellValue ? cellValue.split(" ")[0] : ""
    },
  },
]
/********** 合同管理列表table 新版**********/
export const contractNewListTable = [
  { 
    prop: "applyNo",
    label: "申请号",
    width: 150,
  },
  { 
    prop: "name",
    label: "公司名称",
    width: 200,
    arrow: true,
  },
  { 
    prop: "orgType",
    label: "类型",
    type: "select",
    isTooltip: true,
  },
  { 
    prop: "country",
    label: "国家",
  },
  {
    prop: "province",
    label: "省市区",
    sLabel: "省",
    width: 180,
    isTooltip: true,
    formatter: (row) => {
      return  row.province && `${row.province}/${row.city}/${row.district}`
    }
  },
  { 
    prop: "applyEmployeeName",
    label: "申请人",
  },
  { 
    prop: "applyDeptName",
    label: "申请人部门",
  },
  {
    prop: "applyTime",
    label: "申请时间",
    sType: "daterange",
    format: "yyyy-MM-dd",
    width: 150,
  },
  {
    prop: "verifyStatus",
    label: "状态", 
    width: 100, 
    type: "select",
    propInDict: "contractVerifyStatus",
    multi: true,
  },
]
/********** 离职交接(客户部分配)**********/
export const dimissionTable = [
  { 
    prop: "custName",
    label: "客户名称",
    width: 200,
    arrow: true,
  },
  {
    prop: "custClass",
    label: "客户类型",
    type: "select",
    propInDict: "customerClassNew",
    multi: true,
    multiple: true,
    forceSelection: true,
  },
  {
    prop: "roleType",
    label: "企业类别",
    type: "select",
    propInDict: "customerRole",
    multi: true,
    width: 100,
    multiple: true,
    forceSelection: true,
  },
  { 
    prop: "country",
    label: "国家",
  },
  {
    prop: "province",
    label: "省市区",
    sLabel: "省",
    width: 180,
    isTooltip: true,
    formatter: (row) => {
      return  row.province && `${row.province}/${row.city}/${row.district}`
    }
  },
  { 
    prop: "deptName",
    label: "所属部门",
    width: 100,
  },
  { prop: "industry", label: "所属行业", width: 120,
    formatter: (row) => {
      return formatIndustry(row.industry)
    }
  },
  // { 
  //   prop: "gradeId",
  //   label: "客户等级",
  // },
  // { 
  //   prop: "deptName",
  //   label: "历史合作T量/毛利",
  // },
  // { 
  //   prop: "deptName",
  //   label: "毛利率",
  // },
  // { 
  //   prop: "deptName",
  //   label: "报酬率",
  // },
  // { 
  //   prop: "deptName",
  //   label: "回款率",
  // },
  // { 
  //   prop: "deptName",
  //   label: "付款逾期率",
  // },
  { 
    prop: "employeeName",
    label: "业务员",
  }
]
/********** 供应商审核列表table **********/
export const supplierVerifyListTable = [
  {
    prop: "name",
    label: "供应商名称",
    width: 180,
    type: "button",
    callback: true,
    sType: "input",
    cDisabled: true,
    tag: true,
  },
  {
    prop: "employeeName",
    label: "申请人",
    width: 160,
    isTooltip: true,
  },
  {
    prop: "deptFullCname",
    label: "申请人部门",
    width: 160,
    isTooltip: true,
  },
  {
    prop: "verifyType",
    label: "审核类型",
    type: "select",
    isTooltip: true,
    propInDict: "supplierVerifyType",
  },
  {
    prop: "verifyStatus",
    label: "审核状态",
    type: "select",
    isTooltip: true,
  },
  { prop: "createdTime", 
    label: "创建时间",
    sType: "daterange",
    format: "yyyy-MM-dd",
    potentialHide: true,
    width: 130,
    formatter: ({ cellValue }) => {
      return cellValue ? cellValue.split(" ")[0] : ""
    }
  },
  {
    prop: "verifyTime",
    label: "审核时间",
    sType: "daterange",
    format: "yyyy-MM-dd",
    potentialHide: true,
    width: 130,
    formatter: ({ cellValue }) => {
      return cellValue ? cellValue.split(" ")[0] : ""
    },
  },
]
