import { countrySelectList, industryList } from '@/api/base'
/********** 新建客户信息->搜索信息展示 **********/
export const searchInfoArr = [
  { label: '企业名称', key: 'name', full: true },
  { label: '社信统一代码', key: 'creditCode' },
  { label: '纳税人识别号', key: 'creditCode' },
  { label: '企业类型', key: 'companyType' },
  // { label: '所属行业', key: 'industry' },
  { label: '注册资金', key: 'regCapital' },
  { label: '成立日期', key: 'estiblishTime' },
  // { label: '省份', key: 'base' },
  { label: '法人', key: 'legalPerson' },
]
/********** 用户状态map **********/
export const currentStatusMap = {
  new: {
    label: '可以维护',
    tips: {
      supplier: '该供应商暂无人员跟进，可以维护',
      customer: '该客户暂无销售跟进，可以维护',
    },
    icon: 'success',
    color: '#3E80F5',
    text: '新建',
    action: 'nextStep',
  },
  blacklist: {
    label: '黑名单',
    tips: {
      supplier: '该供应商已被加入黑名单，请联系供应商部解除',
      customer: '该客户已被加入黑名单，请联系客户部解除',
    },
    icon: 'warning',
    color: '#E63923',
  },
  recycle: {
    label: '公海列表',
    tips: '该企业已经被加入公海列表，请联系客户部',
    icon: 'info',
    color: '#EF8519',
    // text: '认领',
    // action: 'recycleClaim',
  },
  exists: {
    label: '已有人员跟进',
    tips: {
      supplier: '该供应商已有人员跟进，请勿重复维护',
      customer: '该客户已有销售跟进，请勿重复维护',
    },
    icon: 'info',
    color: '#EF8519',
    action: 'nextStep',
  },
  supplier: {
    label: '已被加入供应商',
    tips: '该企业已被加入供应商列表，请直接添加',
    icon: 'success',
    color: '#3E80F5',
    text: '添加',
    action: 'nextStep',
  },
  customer: {
    label: '已被加入客户',
    tips: '该企业已被加入客户列表，请直接添加',
    icon: 'success',
    color: '#3E80F5',
    text: '添加',
    action: 'nextStep',
  },
}
/********** 基本信息-可编辑 **********/
export const addBaseInfoData0 = [
  { type: 'input', label: '中文简称', prop: 'shortName',placeholder:'请输入城市+名称关键字' },
  { type: 'input', label: '英文名', prop: 'ename' },
  { type: 'input', label: '英文简称', prop: 'shortEname',placeholder:'请输入名称关键字或首字母组合',disabled:false},
  {
    label: '国家(行政区)',
    prop: 'country',
    type: 'select',
    remote: true,
    list: [],
    notObj: true,
    remoteMethod: (countryCode, item) => {
      countrySelectList({ countryCode, state: 'valid' }).then((res) => {
        item.list = (res.data || []).map((item) => {
          return { ...item, label: item.cname, value: item.cname }
        })
      })
    },
  },
  { type: "cascader", label: "省/市/区", prop: "indexAddr", filterable: true },
  { type: 'input', label: '社信统一代码', prop: 'uscc' },
  { type: 'input', label: '纳税人识别号', prop: 'taxId' },
  { label: '所属行业',  prop: 'industryArr',
    type: 'industry',
    cascaderList: [],
    cascaderProps: {
      children: 'childList',
      label: 'industryCname',
      value: 'industryCname',
      checkStrictly: true,
    },
  },
  { type: 'select', label: '客户性质', prop: 'entType' },
  { type: 'input', label: '法人', prop: 'legalPerson' },
  { type: 'input', label: '成立日期', prop: 'setupDate', placeholder: 'yyyy/yyyy-mm/yyyy-mm-dd'},
  { type: 'date', label: '营业执照到期日', prop: 'usccExpDate' },
  { type: 'input', label: '注册资金', prop: 'regCapital' },
  {
    type: 'textarea',
    label: '注册地址',
    prop: 'registerAddr',
    inputWidth: '488px',
    isTooltip: true,
    placeholder:'显示在提单上的地址'
  },
  {
    type: 'textarea',
    label: '详细地址',
    prop: 'detailAddr',
    inputWidth: '488px',
    isTooltip: true,
  },
  {
    type: 'textarea',
    label: '备注',
    prop: 'remark',
    inputWidth: '488px',
    isTooltip: true,
  },
]
export const addBaseInfoData = [
  {
    type: 'select',
    label: '客户类型',
    prop: 'custClass',
    propInDict: 'customerClassNew',
  },
  // { type: "select", label: "新旧模式", prop: "serviceMode", propInDict: 'customerServiceMode', },
  { type: 'input', label: '客户名称', prop: 'name' },
  ...addBaseInfoData0,
]
/********** 企业联系人信息-可编辑 **********/
export const addBaseLinkData = [
  // { type: "select", multiple: false, list: [],  label: "客户类型", key: "custClass", prop: "custClass",  },
  { type: 'input', prop: 'name', label: '姓名', maxlength:10 },
  { type: 'input', prop: 'ename', label: '英文名', maxlength:18 },
  {
    type: 'select',
    prop: 'role',
    propInDict: 'orgContact',
    label: '角色',
    r: true,
  },
  { type: 'input', prop: 'diyRole', label: '岗位',r: true,maxlength:32,show: false},
  {
    type: 'select',
    prop: 'custContactPosition',
    propInDict: 'customerRelationPosition',
    label: '联系人职位',
    r: false,
  },
  { type: 'input', prop: 'mobileNo', label: '电话号码', r: true,maxlength:128 },
  { type: 'input', prop: 'telNo', label: '座机电话',maxlength:128 },
  { type: 'input', prop: 'email', label: 'Email', r: true,maxlength:128 },
  { type: 'input', prop: 'qq', label: 'QQ',maxlength:128 },
  { type: 'input', prop: 'wechat', label: '微信号', maxlength:128 },
  { type: 'input', prop: 'whatsapp', label: 'WHATSAPP', maxlength:128 },
  { type: 'input', prop: 'wechatEname', label: 'WECHAT', maxlength:128 },
  { type: 'input', prop: 'faxNo', label: 'Fax No.', maxlength:128 },
  { type: 'input', prop: 'belongEmployeeName', label: '归属人' },
  { type: 'input', prop: 'postCode', label: '邮政编码', maxlength:512},
  {
    type: 'textarea',
    prop: 'address',
    label: '邮寄地址',
    r: false,
    isTooltip: true,
    maxlength:512
  },
  { type: 'textarea', prop: 'duty', label: '职责', isTooltip: true, maxlength:512 },
  { type: 'textarea', prop: 'eduBack', label: '教育背景', isTooltip: true, maxlength:512 },
  { type: 'textarea', prop: 'familyBack', label: '家庭背景', isTooltip: true, maxlength:512 },
  { type: 'textarea', prop: 'professionalBack', label: '从业背景', isTooltip: true, maxlength:512 },
  { type: 'textarea', prop: 'hobbies', label: '性格爱好', isTooltip: true, maxlength:512 },
  { type: 'textarea', prop: 'other', label: '其他特殊情况或要求', isTooltip: true, maxlength:512,labelWidth:'115'},
  { type: 'textarea', prop: 'remark', label: '备注', isTooltip: true, maxlength:512 }
]
/********** 企业联系人信息-维护人-可编辑 **********/
export const addEmployeeLinkData = [
  {
    type: 'input',
    label: '维护业务',
    key: 'bdEmployeeName',
    prop: 'bdEmployeeName',
    disabled: true,
  },
  {
    type: 'input',
    label: '维护部门',
    key: 'bdDeptName',
    prop: 'bdDeptName',
    disabled: true,
  },
  { type: 'select', label: '审核人', prop: 'verifier', remote: true },
]
/********** 基本资料修改-可编辑 **********/
export const editBaseInfoData = [
  {
    type: 'checkboxGroup',
    label: '企业类别（多选）',
    prop: 'customerRoles',
    propInDict: 'customerRole',
  },
  {
    type: 'select',
    label: '客户类型',
    prop: 'custClass',
    propInDict: 'customerClassNew',
  },
  {
    type: 'select',
    label: '新旧模式',
    prop: 'serviceMode',
    propInDict: 'customerServiceMode',
  },
  { type: 'input', label: '客户名称', prop: 'name' },
  ...addBaseInfoData0,
]
/********** 基本资料修改-供应商-可编辑 **********/
export const sEditBaseInfoData = [
  {
    type: 'checkboxGroup',
    label: '供应商类别',
    prop: 'categoryDtos',
    propInDict: 'supplierCategory',
  },
  {
    type: 'checkboxGroup',
    label: '可支持业务',
    prop: 'biztypeDtos',
    propInDict: 'supplierBizType',
  },
  { type: 'input', label: '供应商名称', prop: 'name' },
  ...addBaseInfoData0,
]
/********** 基本资料修改-网上查询 **********/
export const netSearchData = [
  // { label: "企业名称", prop: "customerRoles", key: '', block: true },
  // { label: "企业类型", prop: "entType", block: true },
  { label: '社信统一代码', prop: 'uscc' },
  { label: '纳税人识别号', prop: 'taxId' },
  { label: '营业执照到期日', prop: 'usccExpDate' },
  { label: '所属行业', prop: 'industry' },
  { label: '注册资金', prop: 'regCapital' },
  { prop: 'socialStaffNum', label: '参保人数' },
  { label: '成立日期', prop: 'setupDate' },
  // { label: "省", prop: "indexAddr", },
  { label: '法人', prop: 'legalPerson' },
  { label: '注册地址', prop: 'registerAddr', block: true },
]
/********** 银行信息-账号信息表头 **********/
export const accountInfoColumns = [
  { prop: 'countryName', label: '开户行国家', width: 100 },
  { prop: 'accountNo', label: '账号', width: 130 },
  { prop: 'accountName', label: '账户中文名', width: 150 },
  { prop: 'accountEname', label: '账户英文名', width: 150 },
  { prop: 'accountShortName', label: '账户名简称', width: 150 },
  {
    prop: 'accountBank',
    label: '开户行',
    width: 200,
    formatter: ({ row }) => {
      return row.accountBranchBank
        ? row.accountBank + '(' + row.accountBranchBank + ')'
        : row.accountBank
    },
  },
  { prop: 'accountBankAddr', label: '银行地址', width: 130 },
  { prop: 'invoiceBankInfo', label: '发票展示开户行', width: 130 },
  { prop: 'accountBankCompAddr', label: '公司地址', width: 130 },
  { prop: 'swiftCode', label: 'SWIFT Code', width: 80 },
  { prop: 'accountType', label: '账户类型', type: 'select', width: 80 },
  {
    prop: 'receipayType',
    label: '收付类型',
    type: 'select',
    propInDict: 'feeitemReceipayGroup',
    width: 70,
  },
  {
    prop: 'currency',
    label: '币种',
    filterable: true,
    propInDict: 'validCurrency',
    width: 150,
  },
  // { prop: "reason", label: "失效原因", },
]
/********** 银行信息-开票资料form **********/
export const baseInvoiceData = [
  // 有些抬头和公司名称不一致，要正确显示抬头，改为可编辑，不一致时不能提交
  // { prop: "title", label: "发票抬头", type: "input", disabled: true },
  { prop: 'title', label: '发票抬头', type: 'input',disabled:true},
  { prop: 'taxNo', label: '纳税人识别号', type: 'input',disabled:true },
  { prop: 'addr', label: '地址', type: 'input' ,disabled:true},
  { prop: 'tel', label: '电话', type: 'input' },
  { prop: 'taxpayerType', label: '纳税人类型', type: 'select' },
  {
    prop: 'custClass',
    propInDict: 'customerClassNew',
    label: '客户类型',
    type: 'select',
    disabled: true,
  },
  {
    prop: 'serviceMode',
    propInDict: 'customerServiceMode',
    label: '新旧模式',
    type: 'select',
    disabled: true,
  },
  { prop: 'entType', label: '企业性质', type: 'input', disabled: true },
  { prop: 'industry', label: '所属行业', type: 'select', disabled: true },
  // {
  //   label: "国家", prop: "country", type: 'select', remote: true, list: [], disabled: true,
  //   remoteMethod: (countryCode, item) => {
  //     countrySelectList({ countryCode, state: 'valid' }).then((res) => {
  //       item.list = (res.data || []).map((item) => {
  //         return { ...item, label: item.cname, value: item.cname }
  //       })
  //     })
  //   },
  // },
  { prop: 'country', label: '国家(行政区)', type: 'input', disabled: true },
  { prop: 'indexAddr', label: '城市', type: 'input', disabled: true },
  { prop: 'firstTime', label: '首次合作时间', type: 'input', disabled: true },
]
/********** 银行信息-开票资料table **********/
export const baseInvoiceTable = [
  { prop: 'countryName', label: '开户行国家' },
  { prop: 'accountNo', label: '账号' },
  { prop: 'accountName', label: '账户名' },
  { prop: 'accountBank', label: '开户行' },
  { prop: 'accountBankAddr', label: '银行地址' },
  { prop: 'accountBankCompAddr', label: '公司地址' },
  { prop: 'swiftCode', label: 'SWIFT Code' },
  { prop: 'accountType', label: '账户类型', type: 'select' },
  {
    prop: 'receipayType',
    label: '收付类型',
    type: 'select',
    propInDict: 'feeitemReceipayGroup',
  },
  {
    prop: 'currency',
    label: '币种',
    filterable: true,
    propInDict: 'validCurrency',
  },
  // { prop: "reason", label: "失效原因", },
]
/********** 跟进记录table **********/
export const baseFollowCommon1 = [
  { prop: 'subject', label: '主题', type: 'input', r: true },
  { prop: 'orgContact', label: '企业联系人', type: 'input', r: true },
  {
    prop: 'commuType',
    propInDict: 'orgCommunicationType',
    label: '跟进方式',
    type: 'select',
    r: true,
  },
  {
    prop: 'commuTime',
    label: '跟进时间',
    type: 'date',
    r: true,
    formatter: (row) => row.commuTime.slice(0, 10),
  },
]
export const baseFollowCommon2 = [
  {
    prop: 'commuStatus',
    propInDict: 'orgCommunicationStatus',
    label: '跟进状态',
    type: 'select',
  },
  {
    prop: 'intention',
    propInDict: 'orgIntention',
    label: '企业意愿',
    type: 'select',
  },
]
export const baseFollowTable = [
  ...baseFollowCommon1,
  { prop: 'content', label: '沟通内容' },
  ...baseFollowCommon2,
]
/********** 跟进记录form **********/
export const baseFollowForm = [
  ...baseFollowCommon1,
  ...baseFollowCommon2,
  { prop: 'bdEmployeeName', label: '跟进人', type: 'input', disabled: true },
  {
    prop: 'content',
    label: '沟通内容',
    type: 'textarea',
    r: true,
    isTooltip: true,
  },
  {
    prop: '_fileNos',
    label: '关键截图导入',
    type: 'file',
    r: true,
    acceptTypes: ['jpg', 'jpeg', 'png'],
  },
]
/********** 订单记录table **********/
export const baseOrderTable = [
  { prop: 'orderNo', label: '工作单号' },
  { prop: 'businessType', label: '业务类型', type: 'select' },
  { prop: 'cargoSource', label: '货物来源', type: 'select' },
  // { prop: '_fileNos', label: '客户类型', type: 'select', },
  { prop: 'orderStatus', label: '订单状态', type: 'select' },
  { prop: 'amount', label: 'T量' },
  { prop: 'createdName', label: '订单创建人' },
  { prop: 'createdTime', label: '订单创建时间' },
  { prop: '_fileNos', label: '应收费用' },
  { prop: '_fileNos', label: '应付费用' },
]
/********** 附件table **********/
export const baseAttachTable = [
  {
    prop: 'name',
    label: '附件名称',
    width: 200,
    type: 'button',
    callback: ({ fileNo, name, suffix }) => {
      name = name.replace(/[\[|\]|\{|\}|\%|`]/g, '')
      const href = `/base/fileView/preview/${fileNo}/${name}`
      window.open(href)
    },
  },
  {
    prop: 'type',
    label: '附件类别',
    type: 'select',
    propInDict: 'attachmentType',
  },
  { prop: 'remark', label: '简单说明' },
  { prop: 'createdName', label: '上传人' },
  { prop: 'createdTime', label: '上传时间' },
]
/********** 船司信息form **********/
export const shippingCarrierTable = [
  { prop: 'shippingCarrierCode', label: '船司代码',type: 'input'},
  { prop: 'name', label: '中文名称',type: 'input'},
  { prop: 'ename', label: '英文名称',type: 'input'},
  { prop: "entType", label: "企业类型",type: 'select'},
  { prop: 'webUrl', label: '船司官网',type: 'input'},
  { prop: 'uscc', label: '社信统一代码',type: 'input'}, 
  { prop: 'taxId', label: '纳税人识别号',type: 'input'},
  { prop: 'regCapital', label: '注册资金',type: 'input'},
  { prop: 'createdTime', label: '成立日期',placeholder: 'yyyy/yyyy-mm/yyyy-mm-dd',type: 'date'},
  { prop: 'registerAddr', label: '注册地址',type: 'textarea',inputWidth: '488px',isTooltip: true,},
]

/********** 基本联网对比-系统录入 **********/
export const netBaseData = [
  { label: '社信统一代码', prop: 'uscc' },
  { label: '纳税人识别号', prop: 'taxId' },
  { label: '营业执照到期日', prop: 'usccExpDate' },
  { label: '所属行业', prop: 'industry' },
  { label: '注册资金', prop: 'regCapital' },
  { prop: 'socialStaffNum', label: '参保人数' },
  { label: '公司规模', prop: 'scale', },
  { label: '成立日期', prop: 'setupDate' },
  // { label: "省", prop: "indexAddr", },
  { label: '法人', prop: 'legalPerson' },
  { label: '注册地址', prop: 'registerAddr', block: true }
]

/********** 基本联网对比-网上查询 **********/
export const netBaseSearchData = [
  { label: '社信统一代码', prop: 'uscc' },
  { label: '纳税人识别号', prop: 'taxId' },
  { label: '营业执照到期日', prop: 'usccExpDate' },
  { label: '所属行业', prop: 'industry' },
  { label: '注册资金', prop: 'regCapital' },
  { prop: 'socialStaffNum', label: '参保人数' },
  { label: '公司规模', prop: 'scale' },
  { label: '成立日期', prop: 'setupDate' },
  // { label: "省", prop: "indexAddr", },
  { label: '法人', prop: 'legalPerson' },
  { label: '注册地址', prop: 'registerAddr', block: true }
]
