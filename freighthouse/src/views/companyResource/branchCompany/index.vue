<template>
  <div class="finance-page">
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div style="height:8px;background:#F8F9FD;"></div>
    <div class="finance-list-container">
      <FinanceTable :option="option1" @send-multi="sendMulti" />
      <div v-if="editDialog.show">
           <BaseDialog  ref="BaseDialog" :multi="true" :option="editDialog" @close="dialogClose('edit', $event)" />
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import BaseDialog from '@/views/baseData/commonData/taxRate/baseDialog'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin as voucherMixin } from '@/views/finance/voucher/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { businessServiceList, getDomesticCity } from '@/api/base'
import { settleUnitSelectList } from '@/api/companyResource'
import baseData from '@/api/baseData'
const { COMPANY } = baseData
const VALID = [
  { label: '是', value: 'valid' },
  { label: '否', value: 'invalid' },
]
// 统一设置规则提醒
const ruleMsg = [{ required: true, message: '请填写内容', trigger: 'blur' }]
const ruleMsg1 = [{ required: true, message: '请选择内容', trigger: 'change' }]
const ruleMsg2 = [{ type: 'array', required: true, message: '请选择内容', trigger: 'change' }]
const cityProps = {
  value: 'cname',
  label: 'cname',
  children: 'children',
  expandTrigger: 'hover'
}
// 统一设置弹框内表单字段 r表示需要rules d表示需要disabled
const formItem = [
  { label: '公司名称', type: 'input', prop: 'name', r: true, d: true },
  { label: '公司代码', type: 'input', prop: 'companyCode', r: true, d: true },
  { label: '公司全称', type: 'input', prop: 'companyName', r: true, d: true },
  { label: '公司英文全称', type: 'input', prop: 'companyEname' },
  // 独立隐藏结算分公司， 不独立显示结算分公司
  { label: '是否独立核算', type: 'select', prop: 'selfSettle', propInDict: 'yesNo', r: true },
  // 非海外保持原状，海外时隐藏纳税类型、纳税人、注册地址英文、开票方式、专票、电票、普票
  { label: '是否海外公司', type: 'select', prop: 'isAbroad', propInDict: 'yesNo', r: true },
  {
    label: '结算分公司',
    type: 'autocomplete',
    prop: 'settleCompanyName',
    show: false,
    r: true,
    br: true,
    querySearch: (queryString, cb, items, form) => {
      settleUnitSelectList({ name: queryString, size: 30, unitTypes: 'company' }).then((res) => {
        cb(res.data.map((item) => ({ ...item, key: item.unitCode, value: item.unitName })))
      })
    },
    select: (optionItem, form) => (form.settleCompanyCode = optionItem.key),
    clear: (form, prop) => (form.settleCompanyName = form.settleCompanyCode = ''),
    selfSettle: true,
  },
  { label: '纳税类型', type: 'select', prop: 'taxpayerType', r: true, show: false, isAbroad: true },
  { label: '纳税人识别号', type: 'input', prop: 'taxNo', r: true, show: false, isAbroad: true },
  { label: '注册地址', type: 'input', prop: 'regAddr', r: true },
  { label: '注册地址英文', type: 'input', prop: 'regEaddr', r: true, show: false, isAbroad: true },
  { label: '办公地址', type: 'input', prop: 'officAddr', r: true },
  { label: '办公地址省市区', type: 'cascader', prop: 'officPlace', cascaderOptions: [], cascadeProps: cityProps, r: true },
  { label: '电话', type: 'input', prop: 'tel', r: true },
  { label: '开票方式', type: 'select', prop: 'invoiceWay', propInDict: 'invoiceWay', r: true, show: false, isAbroad: true },
  { label: '专票限额', type: 'input', prop: 'specialQuota', r: true, show: false, isAbroad: true },
  { label: '电票限额', type: 'input', prop: 'electronicQuota', r: true, show: false, isAbroad: true },
  { label: '普票限额', type: 'input', prop: 'ordinaryQuota', r: true, show: false, isAbroad: true },
  { label: '电子专票限额', type: 'input', prop: 'electronicSpecialQuota', r: true, show: false, isAbroad: true },
  { label: '科目代码', type: 'input', prop: 'subjectCode', prepend: true },
  { label: '版本号', type: 'input', prop: 'revision', show: false },
]
const formData = {}
formItem.forEach((item) => (formData[item.prop] = ''))
formItem.settleCompanyCode = ''
export default {
  name: 'branCompanyList',
  mixins: [mixin, voucherMixin, mixin2],
  data() {
    // 深拷贝弹框内容，并设置需要rules，disabled的地方
    let editDialogItems = []
    formItem.forEach((item) => {
      editDialogItems.push(
        item.d
          ? { ...item, disabled: true }
          : item.r
          ? { ...item, rules: ['autocomplete', 'select'].includes(item.type) ? ruleMsg1 : item.type === 'cascader' ? ruleMsg2 :ruleMsg }
          : { ...item }
      )
    })
    return {
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption: {},
      editDialog: {
        show: false,
        title: '修改分公司信息',
        formItems: [...editDialogItems],
        form: { ...formData },
        labelWidth: '160px',
        padding: '10px',
      },
      loadPlaceData: []
    }
  },
  // table基础组件
  components: {
    FinanceTable,
    FinanceSearch,
    BaseDialog,
  },
  watch: {
    'editDialog.form.selfSettle': {
      handler(val) {
        // if (val == 'yes') {
        //   this.editDialog.form.settleCompanyName = ''
        //   this.editDialog.form.settleCompanyCode = ''
        // }
        // 结算分公司
        let ele = this.editDialog.formItems.find((v) => v.selfSettle)
        Vue.set(ele, 'show', val === 'no')
      },
      immediate: true,
    },
    'editDialog.form.isAbroad': {
      handler(val) {
        this.editDialog.formItems.forEach((v) => {
          if (v.isAbroad) {
            // if (val == 'yes') {
            //   this.editDialog.form[v.prop] = ''
            // }
            v.isAbroad && Vue.set(v, 'show', val === 'no')
          }
        })
      },
      immediate: true,
    },
  },
  async created() {
    // 搜索配置
    let columns = [
      { label: '公司名称', prop: 'companyName', type: 'input' },
      { label: '公司编码', prop: 'companyCode', type: 'input' },
      { label: '纳税人识别号', prop: 'taxNo', type: 'input' },
      { label: '是否独立核算', prop: 'selfSettle', type: 'select', propInDict: 'yesNo' },
      { label: '是否有效', prop: 'state', type: 'select', selectOptions: VALID },
    ]
    this.searchOption = this.initSearchOption(columns)
    // 表格配置
    let pagination = { ...this.option.pagination, show: true }
    this.option1 = { ...this.option, id: 'option1', pagination, selection: false }
    this.option1.operationBtns.data = [{ label: '修改', type: 'text', show: true, action: 'Edit' }]
    this.option1.columns = [
      { label: '公司名称', prop: 'name', type: 'text', minWidth: 130 },
      { label: '公司编码', prop: 'companyCode', type: 'text' },
      { label: '是否海外公司', prop: 'isAbroad', type: 'select', propInDict: 'yesNo' },
      { label: '是否独立核算', prop: 'selfSettle', type: 'select', propInDict: 'yesNo' },
      { label: '结算分公司', prop: 'settleCompanyName', type: 'text', minWidth: 130 },
      { label: '纳税人识别号', prop: 'taxNo', type: 'text', minWidth: 130 },
      { label: '纳税类型', prop: 'taxpayerType', type: 'select' },
      { label: '是否有效', prop: 'state', type: 'select', selectOptions: VALID },
      { label: '公司全称', prop: 'companyName', type: 'text', minWidth: 130 },
      { label: '公司注册地址', prop: 'regAddr', type: 'text', minWidth: 130 },
      { label: '公司注册地址英文', prop: 'regEaddr', type: 'text', minWidth: 130 },
      { label: '公司办公地址', prop: 'officAddr', type: 'text', minWidth: 130 },
      { label: '公司办公地址省市区', prop: 'officPlace', type: 'text', minWidth: 130 },
      { label: '公司电话', prop: 'tel', type: 'text' },
      { label: '开票方式', prop: 'invoiceWay', type: 'select', propInDict: 'invoiceWay' },
      { label: '专票限额', type: 'text', prop: 'specialQuota' },
      { label: '普票限额', type: 'text', prop: 'ordinaryQuota' },
      { label: '电票限额', type: 'text', prop: 'electronicQuota' },
      { label: '版本号', type: 'text', prop: 'revision' },
      { label: '创建人', prop: 'createdName', type: 'text' },
      { label: '创建时间', prop: 'createdTime', type: 'text', width: 130 },
      { label: '修改人', prop: 'updatedName', type: 'text' },
      { label: '修改时间', prop: 'updatedTime', type: 'text', width: 130 },
    ]
    this.revisedHeight = -20
    this.getData()
  },
  methods: {
    //处理最后一级children为空数组问题
    handleChildren(data) {
      // 循环遍历json数据
      for (var i = 0; i < data.length; i++) {
        if (data[i].children.length < 1) {
          // children若为空数组，则将children设为undefined
          data[i].children = undefined
        } else {
          // children若不为空数组，则继续 递归调用 本方法
          this.handleChildren(data[i].children)
        }
      }
      return data
    },
    search(result) {
      this.searchResult = typeof result === 'string' ? result : this.searchResult
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    getData(isSearch) {
      // this.loading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
      }
      let obj = this.searchOption.data
      for (let key in obj) {
        let value = obj[key].trim()
        value && data.query.push({ column: key, type: 'eq', value })
      }
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      // console.log('data:', data)
      COMPANY.pageList(data)
        // pageList(data)
        .then((res) => {
          let { list } = res.data
          this.option1.data = list.map(item => {
             if (item['officProvince']) {
               item['officPlace'] = item['officProvince'] + item['officCity'] + item['officDistrict']
             } else {
               item['officPlace'] = ''
             }
             return item
          })
          this.option1.pagination.currPage = res.data.currPage
          this.option1.pagination.pageSize = res.data.pageSize
          this.option1.pagination.totalCount = res.data.totalCount
        })
        .catch(console.log)
    },
    dialogClose(type, params) {
      let isAdd = type === 'add'
      type += 'Dialog'
      if (params === true) {
        // 转换请求参数后 请求
        let method = isAdd ? COMPANY.save : COMPANY.update
        let data = this.convertReq(this[type], ['companyCode', 'revision', 'settleCompanyCode'])
        let arr = this.editDialog.formItems.filter((v) => v.isAbroad).map((v) => v.prop)
        data = { ...data }
        data.isAbroad === 'yes' && arr.forEach((v) => delete data[v])
        if (data['officPlace'] && data['officPlace'].length) {
          data['officProvince'] = data['officPlace'][0]
          data['officCity'] = data['officPlace'][1]
          data['officDistrict'] = data['officPlace'][2]
        } else {
          data['officProvince'] = ''
          data['officCity'] = ''
          data['officDistrict'] = ''
        }
        
        if (data.selfSettle === 'yes') {
          data.settleCompanyCode = data.settleCompanyName = ''
        } else {
          data.settleCompanyCode = this.editDialog.form.settleCompanyCode
        }
        method(data)
          .then((res) => {
            isAdd && this.clearAddDialog(this[type])
            this.$message.success(type === 'editDialog' ? '修改成功！' : '添加成功！')
            this.getData()
          })
          .catch(console.log)
      }
      this[type].show = false
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    //修改
    handleEdit(row) {
      COMPANY.info({ companyCode: row.companyCode, name: row.name }).then((res) => {
        let officPlace = []
        if (res.data.officCity) {
           officPlace = [
             res.data.officProvince,
             res.data.officCity,
             res.data.officDistrict
           ]
        }
       Object.assign(this.editDialog.form, res.data, { officPlace })
        setTimeout(() => {
          this.$refs.BaseDialog.$refs.form.clearValidate(['officPlace'])
        }, 100)
        this.showDialog('edit')
      })
    },
    // 新增add | 编辑edit 弹框
    showDialog(type) {
      this.$set(this[type + 'Dialog'].form, 'subjectCode_prepend', '1143')
      if (!this.loadPlaceData.length) {
        getDomesticCity({})
        .then((res) => {
          
        //   this.CityArr.splice(0, 1000, ...this.dictMap.domesticCity)
        // } else {
        //   this.CityArr.splice(0, 1000, ...this.dictMap.foreignCity)
        // }
           //处理最后一级children空数组
           this.loadPlaceData = this.handleChildren(res.data)
           let idx = this.editDialog.formItems.findIndex(item => item.prop === 'officPlace')
           this.editDialog.formItems[idx].cascaderOptions = this.loadPlaceData
           this[type + 'Dialog'].show = true
        })
      } else {
        this[type + 'Dialog'].show = true
      }
      
    },
  },
}
</script>