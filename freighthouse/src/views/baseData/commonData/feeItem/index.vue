<template>
  <div class="finance-page">
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div style="height:8px;background:#F8F9FD;"></div>
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button-group v-if="checkAuth($route.name, 'btn-add')">
            <el-button
              type="primary"
              class="finance-btn"
              size="mini"
              @click="handleAdd"
              icon="el-icon-circle-plus-outline"
            >新增费用项</el-button>
          </el-button-group>
          <el-button-group v-if="checkAuth($route.name, 'btn-enable')">
            <el-button class="finance-btn" size="mini" @click="updateEnable('enable')">启用</el-button>
          </el-button-group>
          <el-button-group v-if="checkAuth($route.name, 'btn-forbid')">
            <el-button class="finance-btn" size="mini" @click="updateEnable('forbid')">禁用</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" size="mini" @click="search('')">全部</el-button>
            <el-button class="finance-btn" size="mini" @click="search('receive')">收款</el-button>
            <el-button class="finance-btn" size="mini" @click="search('pay')">付款</el-button>
            <el-button class="finance-btn" size="mini" @click="search('receivepay')">收付款</el-button>
          </el-button-group>
        </div>
      </div>
      <div v-if="isFirst" v-loading="isFirst"></div>
      <FinanceTable v-else :option="tableOption" @send-multi="sendMulti" :autoMax="true" />
      <BaseDialog :multi="true" :option="editDialog" @close="dialogClose('edit', $event)" />
      <BaseDialog :multi="true" :option="addDialog" @close="dialogClose('add', $event)" />
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{key:'prop',label:'label'}"
        @close="customColumnsPopClose"
      />
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import BaseDialog from '@/views/baseData/commonData/taxRate/baseDialog'
import CustomColumns from '@/components/customColumns'
// import { feeItemList, currencySave, currencyDelete } from '@/api/baseData'
import {
  queryFeeItemList, // 下拉列表
  pageList, // 分页列表
  updateEnabled, // 启用、禁用
  update, // 修改
  save, // 增加
  feeItemInfo, // 详情
  // feeItemClassList, // 费用类别
} from '@/api/fin/feeitem'
// import { feeClassSelectList } from '@/api/base'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin as mixin2 } from '@/views/finance/voucher/mixin'
import { feeClassSelectList, businessServiceList } from '@/api/base'

// 统一设置规则提醒
const ruleMsg = [{ required: true, message: ' ', trigger: 'blur' }]
// 统一设置弹框内表单字段 r表示需要rules d表示需要disabled
let FEELIST = [] // 费用类别
let FEEOBJ = {} // 费用类别对象
let BUSINESS = [] // 业务类型
let BOBJ = {} // 业务类型 对象
let SERVICE = [] // 服务模块
let SOBJ = {} // 服务模块 对象
let SOBJL = {} // 服务模块 对象 列表内渲染服务模块使用
let SOBJD = {} // 服务模块 对象 跳转至详情时使用
let BSLIST = {} // 对应业务类型下服务模块 array
let BSOBJ = {} // 对应业务类型下服务模块 对象
let ADD = [] // 新增弹框 对应业务类型下服务模块
let EDIT = [] // 编辑弹框  对应业务类型下服务模块
let OK = { fee: false, business: false }
function clearData(list, obj) {
  list.splice(0, 1000)
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      delete obj[key]
    }
  }
}
// feeCode	yes	string	费用代码
// feeName	yes	string	中文名称
// feeEnName	yes	string	英文名称
// receipayGroup	yes	string	收付类型
// currency	yes	string	默认币别
// feeUnit	no	string	计费单位
// profitType	no	string	是否参与利润计算
// finGroup	yes	string	费用类别
// needPaired	yes	string	收付成对出现
// pairedFeeCode	no	string	成对费用项编码，收付成对为yes时必填
// pairedFeeName	yes	string	成对费用项名称，收付成对为yes时必填
// needPairedAmt	yes	string	成对费用项金额是否相等，收付成对为yes时必填
// businsessTypes	yes	Array	业务类型 业务类型编码集合     // http://lsdoc.com/web/#/12?page_id=1272 1级数组
// serviceCodes	yes	Array	服务模块编码集合    // http://lsdoc.com/web/#/12?page_id=1272 2级数组
// mergeFeeCode	yes	string	合并显示费用代码
// mergeFeeName	yes	string	合并显示费用名称
// enabled	yes	string	是否启用 yes-启用；no-不启用
const formItem = [
  // { label: '中文名称', type: 'input', prop: 'feeName', r: true, d: true, maxlength: 20 },
  // { label: '英文名称', type: 'input', prop: 'feeEnName', r: true, d: true },
  { label: '中文名称', type: 'input', prop: 'feeName', r: true, maxlength: 20 },
  { label: '英文名称', type: 'input', prop: 'feeEnName', r: true, maxlength: 30 },
  { label: '费用编码', type: 'input', prop: 'feeCode', r: true, d: true },
  {
    label: '收付类型',
    type: 'select',
    prop: 'receipayGroup',
    propInDict: 'feeitemReceipayGroup',
    r: true,
    // change: (value, form, formItems) => {
    //   // 应收应付时，是否开票为必填
    //   let len = formItems.length
    //   if (value === 'receivepay') {
    //     formItems[len - 2].rules = ruleMsg
    //     formItems[len - 4].rules = ruleMsg
    //   } else {
    //     formItems[len - 2].rules = []
    //     formItems[len - 4].rules = []
    //   }
    // },
  },
  { label: '计费单位', type: 'select', prop: 'feeUnit' },
  { label: '默认币种', type: 'select', prop: 'currency', propInDict: 'validCurrencyNR', r: true },
  {
    label: '费用类别',
    type: 'select',
    prop: 'finGroup',
    selectOptions: FEELIST,
    // propInDict: 'feeitemFinGroup',
    r: true,
    // change: (value, form, formItems) => {
    //   // 只有留置类lien，退佣类refund_special才会显示合并费用项
    //   let len = formItems.length
    //   if (value === 'lien' || value === 'refund_special') {
    //     formItems[len - 5].show = true
    //   } else {
    //     formItems[len - 5].show = false
    //     form._mergeFeeCode = form.mergeFeeCode = ''
    //   }
    // },
  },
  { label: '收付成对出现', type: 'select', prop: 'needPaired', propInDict: 'yesNo', r: true },
  {
    label: '成对费用项',
    type: 'autocomplete',
    aplaceholder: '为空时，表示当前费用项',
    er: true, //编辑必须
    prop: 'pairedFeeCode',
    req: '_pairedFeeCode',
    show: false,
    querySearch: (queryString, cb, formItems, form, item) => {
      queryFeeItemList({ name: queryString }).then((res) => {
        item.backupList = res.data
        cb(res.data.map((item) => ({ ...item, label: item.feeCode, value: item.feeName })))
      })
    },
    select: (value, form) => {
      form['_pairedFeeCode'] = value.feeCode
    },
    change: (value, form, item) => {
      if (!value) {
        form['_pairedFeeCode'] = ''
      } else if (value) {
        if (item.backupList && item.backupList.length) {
          if (!item.backupList.find((v) => v.label === form['_pairedFeeCode'])) {
            form['_pairedFeeCode'] = form['pairedFeeCode'] = ''
          }
        } else {
          form['_pairedFeeCode'] = form['pairedFeeCode'] = ''
        }
      }
    },
  },
  { label: '是否收付金额相等', type: 'select', prop: 'needPairedAmt', propInDict: 'yesNo', r: true, show: false },
  { label: '结算单位是否成对', type: 'select', prop: 'needPairedCorp', propInDict: 'yesNo', r: true, show: false },
  // { label: '业务类型', type: 'select', prop: 'businsessTypes', multiple: true, r: true, selectOptions: BUSINESS },
  // { label: '服务模块', type: 'select', prop: 'serviceCodes', multiple: true, r: true, selectOptions: true },
  { label: '业务类型', type: 'select', prop: 'businsessTypes', multiple: true, selectOptions: BUSINESS, filterable: true },
  { label: '服务模块', type: 'select', prop: 'serviceCodes', multiple: true, selectOptions: true, filterable: true },
  {
    label: '合并显示费用',
    type: 'autocomplete',
    prop: 'mergeFeeCode',
    req: '_mergeFeeCode',
    show: false,
    querySearch: (queryString, cb, formItems, form, item) => {
      queryFeeItemList({ name: queryString }).then((res) => {
        item.backupList = res.data
        cb(res.data.map((item) => ({ ...item, label: item.feeCode, value: item.feeName })))
      })
    },
    select: (value, form) => {
      form['_mergeFeeCode'] = value.feeCode
    },
    change: (value, form, item) => {
      if (!value) {
        form['_mergeFeeCode'] = ''
      } else if (value) {
        if (item.backupList && item.backupList.length) {
          if (!item.backupList.find((v) => v.label === form['_mergeFeeCode'])) {
            form['_mergeFeeCode'] = form['mergeFeeCode'] = ''
          }
        } else {
          form['_mergeFeeCode'] = form['mergeFeeCode'] = ''
        }
      }
    },
  },
  { label: '应收是否开票', type: 'select', prop: 'openerReceiveInvoice', propInDict: 'yesNo', r: true, show: false },
  { label: '明细开票名称', type: 'input', prop: 'invoiceItemName', r: true, show: false, maxlength: 20 },
  { label: '汇总开票名称', type: 'input', prop: 'invoiceSummaryName', r: true, show: false, maxlength: 20 },
  { label: '参与利润计算', type: 'select', prop: 'profitType', propInDict: 'yesNo' },
  { label: '应付是否开票', type: 'select', prop: 'openerPayInvoice', propInDict: 'yesNo', show: false },
  { label: '是否启用', type: 'select', prop: 'enabled', propInDict: 'yesNo', r: true },
  // { label: '是否生成转字凭证', type: 'select', prop: 'isShiftVoucher', propInDict: 'yesNo', r: true },
  { label: '应付生成转字凭证', type: 'select', prop: 'isShiftVoucherPay', propInDict: 'yesNo', disClear: true, isDefault: 'yes' },
  {
    label: '应收生成转字凭证',
    type: 'select',
    prop: 'isShiftVoucherRecv',
    propInDict: 'yesNo',
    disClear: true,
    isDefault: 'yes',
  },
  {
    label: '应付生成外账转字凭证',
    type: 'select',
    prop: 'exShiftVoucherPay',
    propInDict: 'yesNo',
    disClear: true,
    isDefault: 'no',
  },
  {
    label: '应收生成外账转字凭证',
    type: 'select',
    prop: 'exShiftVoucherRecv',
    propInDict: 'yesNo',
    disClear: true,
    isDefault: 'no',
  },
  { label: '是否自动对冲', type: 'select', prop: 'isAutoGedging', propInDict: 'yesNo', show: false, isDefault: 'no' },
  // { label: '汇总开票名称', type: 'input', prop: 'invoiceSummaryName' },
  // { label: '明细开票名称', type: 'input', prop: 'invoiceItemName' },
  // {
  //   label: '不可显示的专项管理费',
  //   type: 'select',
  //   prop: 'feeCodes',
  //   selectOptions: specialFeeItemOptions,
  //   r: true,
  //   multiple: true,
  //   filterable: true,
  // },
  // { label: '是否启用', type: 'radio', prop: 'enabled' },
]
const formData = {}
formItem.forEach((item) => (formData[item.prop] = item.isDefault || ''))

export default {
  name: 'feeItemList',
  mixins: [mixin, mixin2],
  data() {
    // 深拷贝弹框内容，并设置需要rules，disabled的地方
    let addDialogItems = []
    let editDialogItems = []
    formItem.forEach((item) => {
      addDialogItems.push({
        ...item,
        rules: item.r ? (item.type == 'autocomplete' ? [{ ...ruleMsg[0], trigger: 'change' }] : ruleMsg) : undefined,
        placeholder: item.aplaceholder,
        selectOptions: (item.selectOptions === true ? ADD : item.selectOptions) || undefined,
      })
      editDialogItems.push({
        ...item,
        disabled: item.d ? true : false,
        rules: item.r || item.er ? (item.type == 'autocomplete' ? [{ ...ruleMsg[0], trigger: 'change' }] : ruleMsg) : undefined,
        selectOptions: (item.selectOptions === true ? EDIT : item.selectOptions) || undefined,
      })
      // addDialogItems.push(item.r ? { ...item, rules: ruleMsg } : { ...item })
      // editDialogItems.push(item.d ? { ...item, disabled: true } : item.r ? { ...item, rules: ruleMsg } : { ...item })
    })
    return {
      // 列表页--表格配置
      tableOption: {},
      // 列表页--搜索配置
      searchOption: {},
      // 列表页--选中行
      multipleSelection: [],
      isFirst: true,
      addDialog: {
        show: false,
        title: '新增费用项配置',
        formItems: [...addDialogItems],
        form: { ...formData },
        labelWidth: '160px',
        padding: '10px',
      },
      editDialog: {
        show: false,
        title: '修改费用项配置',
        formItems: [...editDialogItems],
        form: { ...formData },
        labelWidth: '160px',
        padding: '10px',
      },

      //弹框标题
      title: '',
      //弹框开关
      open: false,
      action: '',
      // 查询条件
      tableQuery: {
        columns: [],
        query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
        currPage: 1,
        pageSize: 10,
      },
      roleOptions: [],
      feeItemList: [],
      loading: false,
      //附加费模板
      // rules: {
      //   code: [{ required: true, message: '币别代码不能为空', trigger: 'blur' }],
      //   cnCname: [{ required: true, message: '中文名称不能为空', trigger: 'blur' }],
      //   standardStatus: [{ required: true, message: '是否本位币不能为空', trigger: 'blur' }],
      // },
      customColumnsPopShow: false,
      selfColumnsBase: [
        { label: '费用编码', prop: 'feeCode', type: 'tooltip', width: 160 },
        { label: '中文名称', prop: 'feeName', type: 'tooltip', width: 160 },
        { label: '英文名称', prop: 'feeEnName', type: 'tooltip', width: 160 },
        { label: '业务类型', prop: 'businsessTypes', type: 'tooltip', width: 160 },
        {
          label: '服务模块',
          prop: 'serviceCodes',
          width: 130,
          type: 'tooltip',
          formatter: (row) => {
            let arr = row.serviceCodes || []
            arr = [...new Set(arr)]
            return arr.map((item) => SOBJL[item]).join('/')
          },
        },
        { label: '费用类别', prop: 'finGroup', type: 'select', selectOptions: FEELIST },
        { label: '收付类型', prop: 'receipayGroup', type: 'select', propInDict: 'feeitemReceipayGroup' },
        { label: '默认币种', prop: 'currency', propInDict: 'validCurrency', type: 'select' },
        { label: '计费单位', prop: 'feeUnit', type: 'select' },
        { label: '收付是否成对出现', prop: 'needPaired', type: 'select', propInDict: 'yesNo' },
        { label: '是否收付金额相等', prop: 'needPairedAmt', type: 'select', propInDict: 'yesNo' },
        { label: '结算单位是否成对', prop: 'needPairedCorp', type: 'select', propInDict: 'yesNo' },
        { label: '成对费用项', prop: 'pairedFeeName' },
        { label: '合并显示费用', prop: 'mergeFeeName' },
        { label: '应收是否开票', type: 'select', prop: 'openerReceiveInvoice', propInDict: 'yesNo' },
        { label: '应付是否开票', type: 'select', prop: 'openerPayInvoice', propInDict: 'yesNo' },
        { label: '参与利润计算', prop: 'profitType', type: 'select', propInDict: 'yesNo' },
        { label: '是否有效', prop: 'enabled', type: 'select', propInDict: 'yesNo' },
        // { label: '是否生成转字凭证', type: 'select', prop: 'isShiftVoucher', propInDict: 'yesNo' },
        { label: '应付生成转字凭证', type: 'select', prop: 'isShiftVoucherPay', propInDict: 'yesNo', width: 108 },
        { label: '应收生成转字凭证', type: 'select', prop: 'isShiftVoucherRecv', propInDict: 'yesNo', width: 108 },
        { label: '应付生成外账转字凭证', type: 'select', prop: 'exShiftVoucherPay', propInDict: 'yesNo', width: 118 },
        { label: '应收生成外账转字凭证', type: 'select', prop: 'exShiftVoucherRecv', propInDict: 'yesNo', width: 118 },
        { label: '是否自动对冲', type: 'select', prop: 'isAutoGedging', propInDict: 'yesNo' },
        { label: '汇总开票名称', prop: 'invoiceSummaryName' },
        { label: '明细开票名称', prop: 'invoiceItemName' },
      ],
    }
  },
  watch: {
    // 收付类型=》应收、应付是否开票
    'editDialog.form.receipayGroup'(val) {
      this.watchReceipayGroup(val, 'editDialog')
    },
    'addDialog.form.receipayGroup': {
      handler(val) {
        this.watchReceipayGroup(val, 'addDialog')
      },
    },
    // 费用类别=》合并显示费用
    'editDialog.form.finGroup': {
      handler(val) {
        this.watchFinGroup(val, 'editDialog')
      },
    },
    'addDialog.form.finGroup': {
      handler(val) {
        this.watchFinGroup(val, 'addDialog')
      },
    },
    // 成对出现=》成对费用项|收付金额相等
    'editDialog.form.needPaired'(val) {
      this.watchNeedPaired(val, 'editDialog')
    },
    'addDialog.form.needPaired': {
      handler(val) {
        this.watchNeedPaired(val, 'addDialog')
      },
    },
    //应收是否开票
    'editDialog.form.openerReceiveInvoice': {
      handler(val) {
        this.watchOpenerReceiveInvoice(val, 'editDialog')
      },
    },
    'addDialog.form.openerReceiveInvoice': {
      handler(val) {
        this.watchOpenerReceiveInvoice(val, 'addDialog')
      },
    },
    // 业务类型=》服务模块
    'addDialog.form.businsessTypes': {
      handler(val) {
        this.watchBusinsessTypes(val, ADD, 'addDialog')
      },
    },
    'editDialog.form.businsessTypes': {
      handler(val) {
        this.watchBusinsessTypes(val, EDIT, 'editDialog')
      },
    },
    // 服务模块=》服务模块内选项、业务类型
    'addDialog.form.serviceCodes': {
      handler(val) {
        this.watchSeviceCodes(val, ADD, 'addDialog')
      },
    },
    'editDialog.form.serviceCodes': {
      handler(val) {
        this.watchSeviceCodes(val, EDIT, 'editDialog')
      },
    },
  },
  // table基础组件
  components: {
    FinanceTable,
    FinanceSearch,
    BaseDialog,
    CustomColumns,
  },
  async created() {
    OK.fee = true
    feeClassSelectList({}).then((res) => {
      OK.fee = true
      clearData(FEELIST, FEEOBJ)
      res.data.forEach((item) => {
        if (item.state == 'invalid') return
        FEELIST.push({ ...item, value: item.feeClassCode, label: item.cname })
        FEEOBJ[item.feeClassCode] = item.cname
      })
    })

    businessServiceList({}).then((res) => {
      OK.business = true
      clearData(BUSINESS, BSOBJ)
      clearData(SERVICE, SOBJ)
      clearData([], BSLIST)
      clearData([], BOBJ)
      // businsessTypes	yes	Array	业务类型 业务类型编码集合     // http://lsdoc.com/web/#/12?page_id=1272 1级数组
      // serviceCodes	yes	Array	服务模块编码集合    // http://lsdoc.com/web/#/12?page_id=1272 2级数组
      let arr = []
      let arrInner = [{ label: '全程运输', value: '*' }]
      res.data.forEach((a) => {
        BOBJ[a.businessType] = a.name
        BSLIST[a.businessType] = []
        BSOBJ[a.businessType] = {}
        arr.push({ ...a, label: a.name, value: a.businessType })
        a.serviceList.forEach((b) => {
          SOBJL[b.serviceCode] = b.serviceName
          b.serviceCode = a.businessType + ',' + b.serviceCode
          SOBJ[b.serviceCode] = b.serviceName
          SOBJD[b.serviceCode] = b.serviceName + '【' + a.name + '】'
          BSLIST[a.businessType].push({ ...b, label: b.serviceName + '【' + a.name + '】', value: b.serviceCode })
          BSOBJ[a.businessType][b.serviceCode] = b.serviceName
          arrInner.push({ ...b, label: b.serviceName + '【' + a.name + '】', value: b.serviceCode })
        })
      })
      SOBJ['*'] = '全程服务'
      SOBJD['*'] = '全程服务'
      SOBJL['*'] = '全程服务'
      BUSINESS.push(...arr)
      SERVICE.push(...arrInner)
      localStorage.setItem('_BOBJ', JSON.stringify(BOBJ))
      localStorage.setItem('_SOBJD', JSON.stringify(SOBJD))
    })
    function selfTimeOut() {
      return new Promise((res, rej) => {
        let NUM = 0
        let interval = setInterval(() => {
          NUM++
          // console.log(NUM)
          if ((OK.fee && OK.business) || NUM === 30) {
            clearInterval(interval)
            return res()
          }
        }, 100)
      })
    }
    this.isFirst = false
    // console.log(this.dictMap['feeitemReceipayGroup'])
    // 搜索配置
    this.searchOption = {
      columns: [
        { label: '费用名称', prop: 'feeItemName', type: 'input', placeholder: '代码/中文模糊查询' },
        // {
        //   label: '收付类型',
        //   prop: 'receipayGroup',
        //   type: 'select',
        //   propInDict: 'feeitemReceipayGroup',
        // },
        { label: '费用类别', prop: 'finGroup', type: 'select', selectOptions: FEELIST },
        { label: '是否有效', prop: 'enabled', type: 'select', propInDict: 'yesNo' },
        { label: '应收是否开票', prop: 'openerReceiveInvoice', type: 'select', propInDict: 'yesNo' },
        { label: '应付是否开票', prop: 'openerPayInvoice', type: 'select', propInDict: 'yesNo' },
        { label: '是否自动对冲', type: 'select', prop: 'isAutoGedging', propInDict: 'yesNo' },
      ],
      data: { name: '', state: '', receipayGroup: '', finGroup: '' },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = {
      ...this.option,
      id: 'tableOption',
      customColumns: {
        show: true,
        handleCustomColumns: () => (this.customColumnsPopShow = true),
      },
      pagination,
    }
    this.tableOption.operationBtns.data = [{ label: '详情', type: 'text', show: true, action: 'showDetail' }]
    if (this.checkAuth(this.$route.name, 'btn-edit')) {
      this.tableOption.operationBtns.data.push({ label: '修改', type: 'text', show: true, action: 'Edit' })
    }
    this.tableOption.operationBtns.width = '100px'
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.tableOption.columns = [...this.selfColumnsBase]
    // console.log(this.tableOption)
    await selfTimeOut()
    this.getData()
  },
  methods: {
    // 收付类别
    watchReceipayGroup(val, type) {
      // console.log(this[type].formItems[8].label)  成对费用项
      // console.log(this[type].formItems[9].label)  是否收付金额相等
      // console.log(this[type].formItems[12].label)  合并显示费用
      // console.log(this[type].formItems[13].label)  应收是否开票
      // console.log(this[type].formItems[14].label)  明细开票名称
      // console.log(this[type].formItems[15].label)  汇总开票名称
      // console.log(this[type].formItems[17].label)  应付是否开票
      console.log(val)
      let form = this[type].form
      let arr = val === 'receivepay' ? ruleMsg : []
      let openerReceiveInvoice = this[type].formItems.find((item) => item.prop === 'openerReceiveInvoice')
      let invoiceItemName = this[type].formItems.find((item) => item.prop === 'invoiceItemName')
      let invoiceSummaryName = this[type].formItems.find((item) => item.prop === 'invoiceSummaryName')
      let openerPayInvoice = this[type].formItems.find((item) => item.prop === 'openerPayInvoice')
      Vue.set(openerReceiveInvoice, 'rules', arr)
      Vue.set(invoiceSummaryName, 'rules', arr)
      let isShow = val === 'receivepay' ? true : false // 应收应付
      let isPayShow = val === 'pay' ? true : false // 应付
      let isRecShow = val === 'receive' ? true : false // 应收
      let isIncomecost = ['incomecost', 'lose', 'commonfee'].indexOf(form.finGroup) > -1
      console.log(isShow, isPayShow, isRecShow, isIncomecost)
      Vue.set(openerReceiveInvoice, 'show', (isShow || isRecShow) && isIncomecost)
      this.$nextTick(() => {
        Vue.set(invoiceItemName, 'show', (isShow || isRecShow) && isIncomecost && form.openerReceiveInvoice == 'yes')
        Vue.set(invoiceSummaryName, 'show', (isShow || isRecShow) && isIncomecost && form.openerReceiveInvoice == 'yes')
      })
      Vue.set(openerPayInvoice, 'show', (isShow || isPayShow) && isIncomecost)
    },
    // 费用类别
    watchFinGroup(val, type) {
      console.log(val)
      let mergeFeeCode = this[type].formItems.find((item) => item.prop === 'mergeFeeCode')
      let openerReceiveInvoice = this[type].formItems.find((item) => item.prop === 'openerReceiveInvoice')
      let invoiceItemName = this[type].formItems.find((item) => item.prop === 'invoiceItemName')
      let invoiceSummaryName = this[type].formItems.find((item) => item.prop === 'invoiceSummaryName')
      let openerPayInvoice = this[type].formItems.find((item) => item.prop === 'openerPayInvoice')
      let isAutoGedging = this[type].formItems.find((item) => item.prop === 'isAutoGedging')
      //incomecost 收入成本类
      if (['incomecost', 'lose', 'commonfee'].indexOf(val) == -1) {
        Vue.set(openerReceiveInvoice, 'show', false)
        Vue.set(invoiceItemName, 'show', false)
        Vue.set(invoiceSummaryName, 'show', false)
        Vue.set(openerPayInvoice, 'show', false)
      } else {
        let receipayGroup = this[type].form.receipayGroup
        this.watchReceipayGroup(receipayGroup, type)
      }
      if (val === 'lien' || val === 'supplier_special' || val === 'customer_special') {
        Vue.set(mergeFeeCode, 'show', true)
      } else {
        Vue.set(mergeFeeCode, 'show', false)
        this[type].form._mergeFeeCode = this[type].form.mergeFeeCode = ''
      }
      if (val === 'lien') {
        Vue.set(isAutoGedging, 'show', true)
      } else {
        Vue.set(isAutoGedging, 'show', false)
        this[type].form.isAutoGedging = 'no'
      }
    },
    // 成对出现
    watchNeedPaired(val, type) {
      this[type].form.pairedFeeCode = ''
      this[type].form.needPairedAmt = ''
      this[type].form.needPairedCorp = ''
      let pairedFeeCode = this[type].formItems.find((item) => item.prop === 'pairedFeeCode')
      let needPairedAmt = this[type].formItems.find((item) => item.prop === 'needPairedAmt')
      let needPairedCorp = this[type].formItems.find((item) => item.prop === 'needPairedCorp')
      Vue.set(pairedFeeCode, 'show', val === 'yes')
      Vue.set(needPairedAmt, 'show', val === 'yes')
      Vue.set(needPairedCorp, 'show', val === 'yes')
    },
    // 成对出现 invoiceItemName invoiceSummaryName
    watchOpenerReceiveInvoice(val, type) {
      this[type].form.invoiceItemName = ''
      this[type].form.invoiceSummaryName = ''
      let invoiceItemName = this[type].formItems.find((item) => item.prop === 'invoiceItemName')
      let invoiceSummaryName = this[type].formItems.find((item) => item.prop === 'invoiceSummaryName')
      Vue.set(invoiceItemName, 'show', val === 'yes')
      Vue.set(invoiceSummaryName, 'show', val === 'yes')
    },
    // 服务模块
    watchBusinsessTypes(val, list, dialogType) {
      // debugger
      console.log(val.toString(), '-', this.isChangeFromService)
      if (this.isChangeFromService) {
        this.isChangeFromService = false
        return
      }
      let serviceCodes = this[dialogType].form.serviceCodes
      if (val && val.length) {
        // debugger
        let arr = []
        // for (const key in BSLIST) {
        //   if (Object.hasOwnProperty.call(BSLIST, key)) {
        //     const item = BSLIST[key]
        //     console.log(item.map((val) => [val.label, val.value, val.serviceId]))
        //   }
        // }
        val.forEach((a) => arr.push(...(BSLIST[a] || [])))
        let obj = {}
        arr.forEach((item) => (obj[item.serviceCode] = item))
        arr = Object.values(obj)
        if (serviceCodes.includes('*')) {
          arr.forEach((v) => (v.disabled = v.value !== '*'))
        } else {
          arr.forEach((v) => (v.disabled = false))
        }
        list.splice(0, 1000, { label: '全程服务', value: '*' }, ...arr)
        let filters = serviceCodes.filter((v) => list.find((item) => item.value === v))
        // debugger
        if (serviceCodes.toString() !== filters.toString()) {
          serviceCodes.splice(0, 1000, ...filters)
        }
        // console.log(arr.map((val) => [val.label, val.value, val.serviceId]))
      } else {
        // debugger
        if (serviceCodes.length) {
          serviceCodes.splice(0, 1000)
        }
        list.splice(0, 1000)
      }
    },
    // 监听服务模块内是否有全程服务，如有则禁用服务模块其它选项
    // 同时处理服务模块联动业务类型
    watchSeviceCodes(val, list, dialogType) {
      // debugger
      console.log(val.toString())
      if (!val.length) {
        list.forEach((v) => (v.disabled = false))
        return
      }
      if (val.find((v) => v === '*')) {
        // debugger
        if (val.length > 1) {
          val.splice(0, 1000, '*')
          return
        }
        list.forEach((v) => (v.disabled = v.value !== '*'))
      } else {
        list.forEach((v) => (v.disabled = false))
        // 暂不考虑联动业务类型，体验不好，先取消一项再选 另一项时已经联动到业务类型再联动到服务模块，消失
        // let businsessTypes = [...new Set(val.map((v) => v.split(',')[0]))]
        // let formBusinsessTypes = this[dialogType].form.businsessTypes
        // // debugger
        // if (businsessTypes.sort().toString() !== formBusinsessTypes.sort().toString()) {
        //   this.isChangeFromService = true
        //   formBusinsessTypes.splice(0, 1000, ...businsessTypes)
        // }
      }
    },
    // 启用、禁用
    updateEnable(type) {
      if (!this.multipleSelection.length) {
        return this.$msgSucClose('请勾选需要操作的项！')
      }
      let isEnable = type === 'enable'
      this.$confirmWarn(`您是否确认${isEnable ? '启用' : '禁用'}该费用项？`, () => {
        let feeCodes = this.multipleSelection.map((item) => item.feeCode)
        updateEnabled({ feeCodes, enabled: isEnable ? 'yes' : 'no' }).then((res) => {
          this.$msgSucClose(`${isEnable ? '启用' : '禁用'}成功`)
          this.getData()
        })
      })
    },
    search(result) {
      this.searchResult = typeof result === 'string' ? result : this.searchResult
      this.tableOption.pagination.currPage = 1
      this.getData(true)
    },
    getData(isSearch) {
      // this.loading = true
      let data = {
        currPage: this.tableOption.pagination.currPage,
        pageSize: this.tableOption.pagination.pageSize,
        columns: [],
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      let obj = this.searchOption.data
      for (let key in obj) {
        let value = obj[key]
        if (value.trim()) {
          data.query.push({ column: key, type: 'eq', value })
        }
      }
      if (this.searchResult) {
        data.query.push({ column: 'receipayGroup', type: 'eq', value: this.searchResult || '' })
      }
      if (isSearch) {
        this.searchBackup = data.query
      }

      data.query = this.searchBackup || []
      // console.log('data:', data)
      pageList(data)
        .then((res) => {
          this.finCommonColumns(res, 'tableOption')
          let { list } = res.data
          this.tableOption.data = list.map((item) => {
            let businsessTypes = (item.businsessTypes || []).map((item) => BOBJ[item]).join('/')
            return {
              ...item,
              feeUnit: item.feeUnit.toLowerCase(),
              businsessTypes,
              $isRowDelete: item.enabled === 'no' ? true : false,
            }
          })
          Object.assign(this.tableOption.pagination, res.data)
          // this.tableOption.pagination.currPage = res.data.currPage
          // this.tableOption.pagination.pageSize = res.data.pageSize
          // this.tableOption.pagination.totalCount = res.data.totalCount
        })
        .catch(console.log)
    },
    dialogClose(type, params) {
      let isAdd = type === 'add'
      type += 'Dialog'
      if (params === true) {
        // 转换请求参数后 请求
        let method = isAdd ? save : update
        let data = this.convertReq(this[type])
        let serviceCodes = data.serviceCodes
        if (serviceCodes.includes('*')) {
          data.feeItemBizList = data.businsessTypes.map((v) => ({ businsessType: v, serviceCode: '*' }))
        } else {
          data.feeItemBizList = serviceCodes.map((v) => {
            let arr = v.split(',')
            return { businsessType: arr[0], serviceCode: arr[1] }
          })
        }
        console.log(data)
        delete data.businsessTypes
        delete data.serviceCodes
        method(data).then((res) => {
          isAdd && this.clearAddDialog(this[type])
          this.$msgSucClose(type === 'editDialog' ? '修改成功！' : '添加成功！')
          this.getData()
          this[type].show = false
        })
      } else {
        this[type].show = false
      }
    },
    // 详情
    showDetail(row) {
      // path: `feeItemDetail?feeCode=${row.feeCode}&business=${JSON.stringify(BOBJ)}&service=${JSON.stringify(SOBJ)}`,
      this.$router.push({ path: `feeItemDetail?feeCode=${row.feeCode}` })
    },
    //修改
    handleEdit(row) {
      feeItemInfo({ feeCode: row.feeCode }).then((res) => {
        let feeItemBizList = res.data.feeItemBizList
        let businsessTypes = [...new Set(feeItemBizList.map((v) => v.businsessType))]
        let serviceCodes = feeItemBizList.map((v) => (v.serviceCode === '*' ? '*' : `${v.businsessType},${v.serviceCode}`))
        this.editDialog.form = { ...res.data, feeUnit: res.data.feeUnit.toLowerCase(), businsessTypes }
        this.showDialog('edit')
        this.$nextTick(() => {
          this.editDialog.form.needPairedAmt = res.data.needPairedAmt
          this.editDialog.form._mergeFeeCode = res.data.mergeFeeCode
          this.editDialog.form.mergeFeeCode = res.data.mergeFeeName
          this.editDialog.form._pairedFeeCode = res.data.pairedFeeCode
          this.editDialog.form.pairedFeeCode = res.data.pairedFeeName
          this.editDialog.form.serviceCodes = [...new Set(serviceCodes)]
          this.editDialog.form.invoiceItemName = res.data.invoiceItemName
          this.editDialog.form.invoiceSummaryName = res.data.invoiceSummaryName
          this.editDialog.form.needPairedCorp = res.data.needPairedCorp
        })
      })
    },
    // 新增
    handleAdd() {
      this.showDialog('add')
    },
    // 新增add | 编辑edit 弹框
    showDialog(type) {
      this[type + 'Dialog'].show = true
    },
  },
}
</script>
