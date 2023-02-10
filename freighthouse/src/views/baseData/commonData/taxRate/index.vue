<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch v-if="isCreated" :searchOption="searchOption" @search="search" />
    <div style="height:8px;background:#F8F9FD;"></div>
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button-group>
            <el-button
              type="primary"
              size="mini"
              @click="showDialog('add')"
              icon="el-icon-circle-plus-outline"
            >新增税率配置</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" size="mini" @click="updateEnable('enable')">启用</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" size="mini" @click="updateEnable('forbid')">禁用</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTable :option="tableOption" @send-multi="sendMulti" />
      <BaseDialog :multi="true" :option="editDialog" @close="dialogClose('edit', $event)" />
      <BaseDialog :multi="true" :option="addDialog" @close="dialogClose('add', $event)" />
      <TableDialog :options="tableDialog" />
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import BaseDialog from './baseDialog'
import TableDialog from './tableDialog'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin as mixin2 } from '@/views/finance/voucher/mixin'
import {
  taxRateConfigPageList, //分页查询
  saveTaxRateConfig, // 新增
  updateTaxRateConfig, // 修改
  deleteTaxRateConfig, // 删除
  updateTaxRateConfigEnabled, // 启用、禁用
  taxRateConfigInfo, // 详情
} from '@/api/fin/tax'
import { baseBusinessList } from '@/api/base'
import { feeItemListByGroup, feeItemClassList } from '@/api/fin/feeitem' // 获取费用项列表  http://lsdoc.com/web/#/39?page_id=1302
import { querySettleUnit, bankAccountList } from '@/api/fin/settleUnit'
import Vue from 'vue'

const FEELIST = [] // 费用类型费用项列表 全部
const FLOBJ = {} // 费用类型费用项列表转化为对象
const FLEDIT = [] // 费用类型费用项列表 编辑窗口
const FLADD = [] // 费用类型费用项列表 新增窗口
const SERVICE = [] // 服务类型规则项列表 2级数组值
const SFEELIST = [] // 服务类型费用项列表 全部 3级数组值
const SFLOBJ = {} // 服务类型费用项列表转化为对象
const SOBJ = {} // 服务类型规则项列表对象
const FEE = [] // 费用类型规则项列表
const FOBJ = {} // 费用类型规则项列表对象
const EDIT = [] // 编辑框规则项列表
const ADD = [] // 新增框规则项列表
const COMEDIT = [{ label: '全部', value: '*' }] // 分公司edit
const COMADD = [{ label: '全部', value: '*' }] // 分公司add
const SEARCH = [] // 搜索框规则项列表
let OK = { fee: false, feelist: false, business: false }

// 费用类型
feeItemClassList({}).then((res) => {
  res.data.forEach((item) => {
    FEE.push({ ...item, value: item.feeClassCode, label: item.cname })
    FOBJ[item.feeClassCode] = item.cname
  })
  OK.fee = true
})
// 费用类型下费用项列表请求
feeItemListByGroup({}).then((res) => {
  res.data.unshift({ feeCode: '*', feeName: '全部' })
  FEELIST.push(
    ...res.data.map((item) => {
      FLOBJ[item.feeCode] = item.feeName
      return { ...item, label: item.feeName, value: item.feeCode }
    })
  )
  OK.feelist = true
  // FEELIST.unshift({ label: '*', value: '全部' })
  // console.log(FLOBJ)
})
// 服务类型 规则项&费用项列表
baseBusinessList({}).then((res) => {
  let arr = []
  let arrInner = []
  res.data.forEach((item) => {
    item.serviceTypeList.forEach((a) => {
      SOBJ[a.serviceType] = item.name + '-' + a.name
      arr.push({ ...a, label: item.name + '-' + a.name, value: a.serviceType })
      a.serviceList.forEach((b) => {
        SFLOBJ[b.serviceCode] = b.serviceName
        arrInner.push({ ...b, label: b.serviceName, value: b.serviceCode })
      })
    })
  })
  SERVICE.push(...arr)
  SFLOBJ['*'] = '全部'
  SFEELIST.push({ label: '全部', value: '*' }, ...arrInner)
  OK.business = true
  // console.log(SFLOBJ)
})
// 规则匹配 service_type=>接口baseBusinessList   fee_type=>dictMap.feeitemFinGroup

// 统一设置规则提醒
const ruleMsg = [{ required: true, message: ' ', trigger: 'blur' }]
// 统一设置弹框内表单字段 r表示需要rules d表示需要disabled
const formItem = [
  { label: '税率配置名称', type: 'input', prop: 'configName', r: true, br: true, maxlength: 20 },
  {
    label: '适用分公司',
    type: 'select',
    prop: 'companyList',
    isObj: true,
    remote: true,
    multiple: true,
    noRemote: true,
    selectOptions: true,
    selectOptionsAdd: COMADD,
    selectOptionsEdit: COMEDIT,
    r: true,
    remoteMethod: (queryString, item) => {
      let data = {
        name: queryString,
        size: 30,
        unitTypes: 'company', // 非必选，单位类型（customer:客户 supplier:供应商 company:分公司），多选的时候逗号分隔
      }
      querySettleUnit(data).then((res) => {
        let list = res.data ? res.data : []
        list = list.map((item) => {
          return { value: item.unitCode, label: item.unitName, companyName: item.unitName, companyCode: item.unitCode }
        })
        list.unshift({ value: '*', label: '所有分公司', companyName: '所有分公司', companyCode: '*' })
        Vue.set(item, 'selectOptions', list)
      })
    },
  },
  { label: '收付类型', type: 'select', prop: 'receipayType', propInDict: 'feeitemReceipayGroup', r: true },
  { label: '规则配置', type: 'select', prop: 'configType', propInDict: 'taxRateConfigType', r: true },
  {
    label: '规则项',
    type: 'select',
    prop: 'ruleCodes',
    selectOptions: true,
    selectOptionsAdd: ADD,
    selectOptionsEdit: EDIT,
    r: true,
    multiple: true,
    multipleLimit: 0,
  },
  {
    label: '费用项/服务项',
    type: 'select',
    prop: 'ruleSubCodes',
    selectOptions: true,
    selectOptionsAdd: FLADD,
    selectOptionsEdit: FLEDIT,
    r: true,
    multiple: true,
    filterable: true,
  },
  { label: '规则优先级', type: 'input', prop: 'level', r: true, d: true, placeholder: '数字越大优先级越高' },
  { label: '税率', type: 'select', prop: 'taxRate', propInDict: 'taxRateInfo', r: true },
  { label: '是否启用', type: 'radio', prop: 'enabled', r: true },
]
const formData = {}
formItem.forEach((item) => (formData[item.prop] = ''))
// 深拷贝弹框内容，并设置需要rules，disabled的地方
let addDialogItems = []
let editDialogItems = []
formItem.map((item) => {
  addDialogItems.push({ ...item, rules: item.r ? ruleMsg : {}, selectOptions: item.selectOptionsAdd })
  editDialogItems.push({ ...item, rules: item.r ? ruleMsg : {}, selectOptions: item.selectOptionsEdit, disabled: item.d })
  // editDialogItems.push(
  //   item.d
  //     ? item.selectOptions
  //       ? // ? { ...item, disabled: true, selectOptions: item.selectOptions === true ? EDIT : item.selectOptions }
  //         { ...item, disabled: true, selectOptions: item.selectOptions === true ? EDIT : FLEDIT }
  //       : { ...item, disabled: true }
  //     : item.r
  //     ? item.selectOptions
  //       ? { ...item, rules: ruleMsg, selectOptions: item.selectOptions === true ? EDIT : FLEDIT }
  //       : { ...item, rules: ruleMsg }
  //     : { ...item }
  // )
})
function selfTimeOut() {
  return new Promise((res, rej) => {
    let NUM = 0
    let interval = setInterval(() => {
      NUM++
      // console.log(NUM)
      if ((OK.fee && OK.feelist && OK.business) || NUM === 30) {
        clearInterval(interval)
        return res()
      }
    }, 100)
  })
}
export default {
  name: 'taxRateList',
  mixins: [mixin, mixin2],
  components: {
    FinanceTable,
    FinanceSearch,
    BaseDialog,
    TableDialog,
  },
  data() {
    return {
      isCreated: false,
      // 列表页--表格配置
      tableOption: {},
      // 列表页--搜索配置
      searchOption: {},
      // 列表页--选中行
      multipleSelection: [],
      tableDialog: {
        show: false,
        data: [],
        message: '',
        isText: false,
        title: '查看费用项/服务项',
      },
      addDialog: {
        show: false,
        title: '新增税率配置',
        formItems: [...addDialogItems],
        form: { ...formData },
        labelWidth: '100px',
      },
      editDialog: {
        show: false,
        title: '修改税率配置',
        formItems: [...editDialogItems],
        form: { ...formData },
        labelWidth: '100px',
      },
      serviceSelect: SERVICE,
      feeSelect: FEE,
    }
  },
  computed: {
    searchConfigType() {
      let arr = this.searchOption?.addFilter?.searchInputGroup || []
      let find = arr.find((item) => item.key === 'configType') || {}
      console.log(find)
      return find.value || ''
    },
  },
  watch: {
    'editDialog.form.configType': {
      handler(val) {
        this.editDialog.form.ruleCodes = ''
        this.watchHandler(val, EDIT, FLEDIT, this.editDialog.form, this.editDialog)
      },
    },
    'addDialog.form.configType': {
      handler(val) {
        this.addDialog.form.ruleCodes = ''
        this.watchHandler(val, ADD, FLADD, this.addDialog.form, this.addDialog)
      },
    },
    searchConfigType: {
      handler(val) {
        console.log(val)
        let arr = this.searchOption?.addFilter?.searchInputGroup || []
        arr.forEach((item) => {
          if (item.key && item.key === 'ruleCode') {
            this.$set(item, 'value', '')
          }
        })
        // this.watchHandler(val, SEARCH, SEARCH, this.searchOption.form, this.searchOption)
        // console.log(val)
        if (!val) {
          SEARCH.splice(0, 1000)
        } else if (val === 'fee_type') {
          SEARCH.splice(0, 1000, ...FEE)
        } else if (val === 'service_type') {
          SEARCH.splice(0, 1000, ...SERVICE)
        }
      },
    },
    'editDialog.form.ruleCodes': {
      handler(val) {
        this.watchHandler2(val, this.editDialog.form, FLEDIT)
      },
    },
    'addDialog.form.ruleCodes': {
      handler(val) {
        this.watchHandler2(val, this.addDialog.form, FLADD)
      },
    },
    'editDialog.form.ruleSubCodes': {
      handler(val) {
        this.watchHandler3(val, FLEDIT)
      },
    },
    'addDialog.form.ruleSubCodes': {
      handler(val) {
        this.watchHandler3(val, FLADD)
      },
    },
    'editDialog.form.receipayType': {
      handler(val) {
        this.$nextTick(() => {
          this.watchHandler2(this.editDialog.form.ruleCodes, this.editDialog.form, FLEDIT, this.editDialog, val)
        })
      },
    },
    'addDialog.form.receipayType': {
      handler(val) {
        this.$nextTick(() => {
          this.watchHandler2(this.addDialog.form.ruleCodes, this.addDialog.form, FLADD, this.editDialog, val)
        })
      },
    },
    'editDialog.form.companyList': {
      handler(val) {
        this.watchHandler4(val, COMEDIT)
      },
    },
    'addDialog.form.companyList': {
      handler(val) {
        this.watchHandler4(val, COMEADD)
      },
    },
  },
  async created() {
    // 费用类型下规则项列表
    // let feeitemFinGroup = this.dictMap['feeitemFinGroup'] || []
    // feeitemFinGroup.forEach((item) => (FOBJ[item.value] = item.label))
    // FEE.splice(0, 1000, ...feeitemFinGroup)
    // 搜索配置
    let searchInputGroup = ['configName', 'receipayType', 'companyList', 'configType', 'ruleCode', 'enabled']
    this.searchOption = {
      saveDefault: true,
      saveShow: true,
      addFilter: {
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          configName: { label: '税率配置名称', type: 'input' },
          receipayType: { label: '收付类型', type: 'select', prop: 'feeitemReceipayGroup' },
          companyList: {
            label: '适用分公司',
            type: 'remoteSelect',
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            remoteSelectList: [],
          },
          configType: { label: '规则配置', type: 'select', prop: 'taxRateConfigType' },
          ruleCode: {
            label: '规则项',
            type: 'select',
            selectOptions: SEARCH,
            visibleChange: (val) => {
              if (val) {
                let find = this.searchOption.addFilter.searchInputGroup.find((item) => item.key === 'configType')
                if (!find || !find.value.trim()) {
                  this.$msgWarnClose('请先选择规则配置！')
                }
              }
            },
          },
          enabled: { label: '是否有效', type: 'select', prop: 'yesNo' },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = { ...this.option, id: 'tableOption', pagination }
    this.tableOption.operationBtns.data = [
      { label: '编辑', type: 'text', show: true, action: 'Edit' },
      { label: '删除', type: 'text', show: true, action: 'Delete' },
    ]
    this.tableOption.operationBtns.width = '100px'
    let columns = [
      { label: '税率配置名称', prop: 'configName', type: 'text', minWidth: 150 },
      { label: '收付类型', prop: 'receipayType', type: 'select', propInDict: 'feeitemReceipayGroup' },
      { label: '规则匹配', prop: 'configType', type: 'select', propInDict: 'taxRateConfigType' },
      {
        label: '规则项',
        prop: 'ruleCodes',
        width: 180,
        type: 'tooltip',
        formatter: (row) => {
          let obj = {}
          if (row.configType == 'service_type') {
            obj = SOBJ
          } else if (row.configType == 'fee_type') {
            obj = FOBJ
          }
          return row.ruleCodes && row.ruleCodes.map((key) => obj[key]).join('/')
          // return arr.find(item => item.name === )
        },
      },
      {
        label: '费用项/服务项',
        prop: 'ruleSubCodes',
        type: 'button',
        minWidth: 100,
        operationBtns: {
          show: true,
          data: [{ label: '查看' }],
          callback: (action, index, row) => {
            let find = this.dictMap['taxRateConfigType'].find((item) => item.value === row.configType)
            row.d_name = find && find.label
            let obj = {}
            if (row.configType == 'service_type') {
              obj = SFLOBJ
            } else if (row.configType == 'fee_type') {
              obj = FLOBJ
            }
            row.d_content = row.ruleSubCodes && row.ruleSubCodes.map((key) => obj[key]).join('，')
            this.tableDialog.data.splice(0, 1, row)
            this.tableDialog.isText = false
            this.tableDialog.title = '查看费用项/服务项'
            this.tableDialog.show = true
          },
        },
        // formatter: (row) => {
        //   let obj = {}
        //   if (row.configType == 'service_type') {
        //     obj = SFLOBJ
        //   } else if (row.configType == 'fee_type') {
        //     obj = FLOBJ
        //   }
        //   return row.ruleSubCodes && row.ruleSubCodes.map((key) => obj[key]).join('/')
        // },
      },
      { label: '规则优先级', prop: 'level', type: 'text' },
      {
        label: '适用分公司',
        prop: 'companyList',
        type: 'button',
        operationBtns: {
          show: true,
          data: [{ label: '查看' }],
          callback: (action, index, row) => {
            this.tableDialog.isText = true
            this.tableDialog.title = '查看适用分公司'
            console.log(row)
            this.tableDialog.message = row.companyList.map((v) => v.companyName).join('，')
            this.tableDialog.show = true
          },
        },
      },
      { label: '税率', prop: 'taxRate', type: 'select', propInDict: 'taxRateInfo' },
      { label: '是否有效', prop: 'enabled', type: 'select', propInDict: 'yesNo' },
      { prop: 'createdName', label: '创建人', type: 'text' },
      { prop: 'createdTime', label: '创建时间', type: 'text', width: 160 },
      { label: '修改人', prop: 'updatedName', type: 'text' },
      { label: '修改时间', prop: 'updatedTime', type: 'text', width: 160 },
    ]
    this.tableOption.columns = columns
    // console.log(this.tableOption)
    await selfTimeOut()
    // this.getData()'
    this.isCreated = true
  },
  methods: {
    watchHandler(val, arr, feeArr, data, dialog) {
      let formItems = dialog.formItems
      let receipayType = data.receipayType
      // console.log(val)
      if (!val) {
        arr.splice(0, 1000)
      } else if (val === 'fee_type') {
        this.$set(formItems[3], 'multipleLimit', 0)
        arr.splice(0, 1000, ...FEE)
        if (feeArr) {
          feeArr.splice(0, 1000)
        }
      } else if (val === 'service_type') {
        this.$set(formItems[3], 'multipleLimit', receipayType === 'pay' ? 0 : 1)
        arr.splice(0, 1000, ...SERVICE)
        if (feeArr) {
          feeArr.splice(0, 1000, ...FEELIST)
          // data.ruleSubCodes = ['*']
        }
      }
      // console.log(dialog)
    },
    watchHandler2(val, form, arr, dialog, rp) {
      let formItems = dialog ? dialog.formItems : []
      // console.log(val)
      if (!val || !val.length) {
        arr.splice(0, 1000)
      } else if (form.configType === 'service_type') {
        if (rp) {
          if (rp !== 'pay' && form.ruleCodes) {
            form.ruleCodes.splice(0)
          }
          this.$set(formItems[3], 'multipleLimit', rp === 'pay' ? 0 : 1)
        }
        form.ruleSubCodes = ['*']
        let obj = {},
          setList = []
        let list = SFEELIST.filter(({ serviceType }) => val.length && val.find((item) => item === serviceType))
        list.forEach((item) => {
          if (obj[item.serviceCode]) return
          obj[item.serviceCode] = true
          setList.push(item)
        })
        arr.splice(0, 1000, { label: '全部', value: '*' }, ...setList)
      } else if (form.configType === 'fee_type') {
        form.ruleSubCodes = ['*']
        // receive,pay,receivepay
        // openerPayInvoice,openerReceiveInvoice
        // fee_type
        let receipayType = form.receipayType
        let target = FEELIST.filter(({ finGroup }) => val.length && val.find((item) => item === finGroup))
        if (receipayType == 'pay') {
          target = target.filter(({ openerPayInvoice }) => openerPayInvoice == 'yes')
        } else if (receipayType == 'receive') {
          target = target.filter(({ openerReceiveInvoice }) => openerReceiveInvoice == 'yes')
        } else {
          // target = target.filter((item) => item.openerPayInvoice == 'yes' || item.openerReceiveInvoice == 'yes')
        }
        arr.splice(0, 1000, { label: '全部', value: '*' }, ...target)
      }
      console.log(arr.map((v) => v.value).sort())
    },
    watchHandler3(val, arr) {
      // console.log(val, arr)
      if (!val || !arr.length) return
      if (!val.length) {
        val.push('*')
      } else if (val.length > 1) {
        let index = val.indexOf('*')
        if (index > -1) {
          val.splice(0, 1)
        }
        //  else {
        //   let target = arr.filter((item) => {
        //     return val.indexOf(item.finGroup) > -1
        //   })
        //   arr.splice(1, 1000, ...target)
        // }
      }
    },
    watchHandler4(val, arr) {
      setTimeout(() => {
        console.log(val, arr)
        // debugger
        if (!val) return
        if (!val.length) {
          val.push(arr[0])
        } else if (val.length > 1) {
          let index = val.findIndex((item) => item.value === '*')
          if (index > -1) {
            // debugger
            val.splice(0, 1)
          }
        }
      }, 0)
    },
    // 启用、禁用
    updateEnable(type) {
      if (!this.multipleSelection.length) {
        return this.$msgErrClose('请勾选需要操作的项！')
      }
      let isEnable = type === 'enable'
      this.$confirmWarn(`您是否确认${isEnable ? '启用' : '禁用'}该税率配置记录？`, () => {
        let taxConfigs = this.multipleSelection.map(({ taxRateConfigId, revision }) => ({ taxRateConfigId, revision }))
        updateTaxRateConfigEnabled({ taxConfigs, enabled: isEnable ? 'yes' : 'no' }).then((res) => {
          this.$msgSucClose(`${isEnable ? '启用' : '禁用'}成功`)
          this.getData()
        })
      })
      // this.$confirm(`您是否确认${isEnable ? '启用' : '禁用'}该税率配置记录？`, '', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning',
      // })
      //   .then((res) => {
      //     if (res) {
      //       let taxConfigs = this.multipleSelection.map(({ taxRateConfigId, revision }) => ({ taxRateConfigId, revision }))
      //       updateTaxRateConfigEnabled({ taxConfigs, enabled: isEnable ? 'yes' : 'no' }).then((res) => {
      //         this.$message({
      //           message: `${isEnable ? '启用' : '禁用'}成功`,
      //           type: 'success',
      //           showClose: true,
      //         })
      //         this.getData()
      //       })
      //     }
      //   })
      //   .catch(console.log)
    },
    // 新增add | 编辑edit 弹框
    showDialog(type) {
      this[type + 'Dialog'].show = true
    },
    handleEdit(row) {
      taxRateConfigInfo({ taxRateConfigId: row.taxRateConfigId }).then((res) => {
        let taxRate = res.data.taxRate
        taxRate = taxRate == '0' ? '0' : (taxRate / 100).toFixed(2)
        this.editDialog.form = { ...res.data, taxRate }
        let companyList = res.data.companyList.map((v) => ({ ...v, label: v.companyName, value: v.companyCode }))
        if (!companyList.length) {
          companyList = [{ value: '*', label: '所有分公司', companyName: '所有分公司', companyCode: '*' }]
        }
        this.editDialog.form.companyList = [...companyList]
        this.showDialog('edit')
        this.$nextTick(() => {
          COMEDIT.splice(0, 1000, ...companyList)
          this.editDialog.form.receipayType = res.data.receipayType
          this.$nextTick(() => {
            this.editDialog.form.ruleCodes = res.data.ruleCodes
            this.$nextTick(() => {
              this.editDialog.form.ruleSubCodes = res.data.ruleSubCodes
            })
          })
        })
      })
    },
    // 删除 ok
    handleDelete(index, row, option) {
      // console.log(index, row, option)
      this.$confirmWarn(`您是否确认删除该税率配置记录？`, () => {
        deleteTaxRateConfig({ taxRateConfigId: row.taxRateConfigId }).then((res) => {
          this.$msgSucClose('删除成功！')
          this.getData()
        })
      })
      // this.$confirm('您是否确认删除该税率配置记录？', '', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning',
      // })
      //   .then((res) => {
      //     if (res) {
      //       deleteTaxRateConfig({ taxRateConfigId: row.taxRateConfigId }).then((res) => {
      //         this.$message.success('删除成功！')
      //         this.getData()
      //       })
      //     }
      //   })
      //   .catch(() => {})
    },
    dialogClose(type, params) {
      let isAdd = type === 'add'
      type += 'Dialog'
      if (params === true) {
        // 转换请求参数后 请求
        let method = isAdd ? saveTaxRateConfig : updateTaxRateConfig
        method(this.convertReq(this[type])).then((res) => {
          type !== 'editDialog' && this.clearAddDialog(this[type])
          this.$msgSucClose(type === 'editDialog' ? '修改成功！' : '添加成功！')
          // this.$message.success(type === 'editDialog' ? '修改成功！' : '添加成功！')
          this.getData()
        })
        // .catch(console.log)
      }
      this[type].show = false
    },
    // 封装请求参数并请求列表
    getData() {
      let data = {
        currPage: this.tableOption.pagination.currPage,
        pageSize: this.tableOption.pagination.pageSize,
        query: [],
      }
      this.finCommonSearch(data.query, this.searchOption)
      console.log('data:', data)
      this.lsLoading = true
      taxRateConfigPageList(data)
        .then((res) => {
          let { list } = res.data
          this.tableOption.data = list.map((item) => {
            let taxRate = item.taxRate
            taxRate = taxRate == '0' ? '0' : (taxRate / 100).toFixed(2)
            item.companyList = item.companyList.map((v) => ({ ...v, label: v.companyName, value: v.companyCode }))
            if (!item.companyList.length) {
              item.companyList = [{ value: '*', label: '所有分公司', companyName: '所有分公司', companyCode: '*' }]
            }
            return { ...item, taxRate }
          })
          Object.assign(this.tableOption.pagination, res.data)
          // this.tableOption.pagination.currPage = res.data.currPage
          // this.tableOption.pagination.pageSize = res.data.pageSize
          // this.tableOption.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
  },
}
</script>
