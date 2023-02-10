<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-container finance-list-container">
      <FinanceSearch v-if="searchOption.addFilter" :searchOption="searchOption" @search="search" />
      <div style="height:8px;background:#F8F9FD;"></div>
      <div class="money-box">
        <div class="money-box-left">
          <el-button-group v-if="checkAuth($route.name, 'btn-add')">
            <el-button type="primary" class="finance-btn" size="mini" @click="add">新增</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
        </div>
      </div>
      <!-- <div v-if="isFirst" v-loading="isFirst"></div>
      <FinanceTable v-else :option="tableOption" @send-multi="sendMulti" :autoMax="true" />-->
      <div class="finance-list-container">
        <FinanceTable :option="tableOption" @send-multi="sendMulti" :autoMax="true" />
      </div>
      <VoucherDialog
        v-if="editDialog.show"
        :option="editDialog"
        source="business"
        :multi="true"
        @close="dialogClose('editDialog', $event)"
        @addSummary="addSummary('editDialog', $event)"
        @delSummary="delSummary('editDialog', $event)"
      />
      <VoucherDialog
        v-if="addDialog.show"
        :option="addDialog"
        source="business"
        :multi="true"
        @close="dialogClose('addDialog', $event)"
        @addSummary="addSummary('addDialog', $event)"
        @delSummary="delSummary('addDialog', $event)"
      />
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { mixin as voucherMixin } from '../mixin.js'
import VoucherDialog from '../components/voucherDialog'
import { sceneList, sceneSave, sceneDelete } from '@/api/fin/acct'
//['voucherClass', 'feeFinGroup', 'subjectList', 'feeCode', 'sceneGroup']
const ARR = [[], [], [], [], []]
// 统一设置规则提醒
const ruleMsg = [{ required: true, message: ' ', trigger: 'blur' }]
export default {
  name: 'businessVoucher',
  mixins: [mixin, mixin2, voucherMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    VoucherDialog,
  },
  data() {
    const common = {
      show: false,
      padding: '0',
      labelWidth: '160px',
      formItems: [],
      form: {},
      voucherSummary: [],
      summaryDiy: false,
      summaryStr: '',
    }
    return {
      keyDownActive: true,
      isFirst: true,
      searchOption: {},
      multipleSelection: [],
      tableOption: {},
      addDialog: {
        ...common,
        title: '新增业务凭证设置',
        summaryList: [],
      },
      editDialog: {
        ...common,
        title: '修改业务凭证设置',
        summaryList: [],
      },
      voucherSummary: [],
      voucherSummaryObj: {},
      sceneCfg: {
        name: { label: '新增分组名称', type: 'input', prop: 'acSceneGroupName', show: false },
        des: { label: '新增分组描述', type: 'textarea', prop: 'acSceneGroupRemark', show: false },
      },
      voucherClassCfg: {},
      feeFinGroupCfg: {},
      feeCodeCfg: {},
      subjectListCfg: {},
      sceneGroupCfg: {},
      feeBillSubType: [],
    }
  },
  watch: {
    // feeBillType', label: '单据类型', type: 'select', propInDict: 'voucherBizType' },
    //   { prop: 'feeBillSubType
    'addDialog.form.feeBillType'(val) {
      let arr = this.addDialog.formItems
      this.addDialog.form.feeBillSubType = ''
      if (val === 'pay_writeoff') {
        arr[2].selectOptions.splice(0, 1000, ...this.dictMap.payWriteoffSubType)
      } else if (val === 'receive_writeoff') {
        arr[2].selectOptions.splice(0, 1000, ...this.dictMap.recWriteoffSubType)
      } else {
        arr[2].selectOptions.splice(0, 1000, { label: '*', value: '*' })
        this.addDialog.form.feeBillSubType = '*'
      }
      // console.log(val)
      // console.log(arr[2])
      // this.$forceUpdate()
    },
    'editDialog.form.feeBillType'(val) {
      let arr = this.editDialog.formItems
      this.editDialog.form.feeBillSubType = ''
      if (val === 'pay_writeoff') {
        arr[2].selectOptions.splice(0, 1000, ...this.dictMap.payWriteoffSubType)
      } else if (val === 'receive_writeoff') {
        arr[2].selectOptions.splice(0, 1000, ...this.dictMap.recWriteoffSubType)
      } else {
        arr[2].selectOptions.splice(0, 1000, { label: '*', value: '*' })
        this.editDialog.form.feeBillSubType = '*'
      }
    },
    'editDialog.form.voucherBizType'(val) {
      let arr = this.editDialog.formItems
      if (val === 'gedging_writeoff') {
        arr[8].r = arr[9].r = arr[11].r = arr[12].r = false
      } else if (!arr[8].r) {
        arr[8].r = arr[9].r = arr[11].r = arr[12].r = true
      }
      // this.$forceUpdate()
    },
    'addDialog.form.voucherBizType'(val) {
      let arr = this.addDialog.formItems
      if (val === 'gedging_writeoff') {
        arr[8].r = arr[9].r = arr[11].r = arr[12].r = false
      } else if (!arr[8].r) {
        arr[8].r = arr[9].r = arr[11].r = arr[12].r = true
      }
      // this.$forceUpdate()
    },
    // 联动参考
    'searchOption.addFilter.searchInputGroup': {
      handler(newVal, oldVal) {
        // 监听的是对象， newVal,与oldVal值相同
        let newType = newVal && newVal.find((v) => v.key === 'feeBillType')
        let arr = this.searchOption.addFilter.filterGroups['feeBillSubType']['selectOptions']
        if (newType && newType.value) {
          let val = newType.value
          if (val === 'pay_writeoff') {
            arr.splice(0, 1000, ...this.dictMap.payWriteoffSubType)
          } else if (val === 'receive_writeoff') {
            arr.splice(0, 1000, ...this.dictMap.recWriteoffSubType)
          } else {
            arr.splice(0, 1000, { label: '*', value: '*' })
          }
        } else {
          let dictMap = this.dictMap
          arr.splice(0, 1000, ...[{ label: '*', value: '*' }, ...dictMap.recWriteoffSubType, ...dictMap.payWriteoffSubType])
        }
      },
      deep: true,
    },
    'searchOption.data.feeBillType'(val) {
      console.log(this.searchOption)
      let arr = this.searchOption.columns
      this.searchOption.data.feeBillSubType = ''
      if (val === 'pay_writeoff') {
        arr[2].selectOptions.splice(0, 1000, ...this.dictMap.payWriteoffSubType)
      } else if (val === 'receive_writeoff') {
        arr[2].selectOptions.splice(0, 1000, ...this.dictMap.recWriteoffSubType)
      } else if (val) {
        arr[2].selectOptions.splice(0, 1000, { label: '*', value: '*' })
      } else {
        arr[2].selectOptions.splice(
          0,
          1000,
          ...[{ label: '*', value: '*' }, ...this.dictMap.recWriteoffSubType, ...this.dictMap.payWriteoffSubType]
        )
      }
    },
  },
  async created() {
    this.lsLoading = true
    console.log(this.dictMap.voucherBizType)
    this.feeBillSubType = [{ label: '*', value: '*' }, ...this.dictMap.voucherBizSubtype]
    await this.initDict()
    // console.log('``````````````````222');
    this.isFirst = false
    this.voucherSummary = this.dictMap.voucherSummaryType.map((item) => ({ ...item }))
    this.voucherSummary.forEach((item) => {
      this.voucherSummaryObj[item.value] = item.label
    })
    // 统一设置弹框内表单字段 r表示需要rules d表示需要disabled br 需要换行
    const formItem = [
      {
        label: '凭证字',
        prop: 'voucherClass',
        type: 'select',
        selectOptions: ARR[0],
        rules: [{ ...ruleMsg[0], trigger: 'change' }],
      },
      {
        label: '单据类型',
        prop: 'feeBillType',
        type: 'select',
        propInDict: 'voucherBizType',
        r: true,
      },
      {
        label: '单据子类型',
        prop: 'feeBillSubType',
        type: 'select',
        selectOptions: [],
      },
      {
        label: '费用类别',
        prop: 'feeFinGroup',
        type: 'select',
        default: '*', // 默认值defaultValue
        r: true,
        rules: [{ ...ruleMsg[0], trigger: 'change' }],
        // selectOptions: [{ label: '*', value: '*' }, ...ARR[1]],
        selectOptions: ARR[1],
        clear(form, prop) {
          form.feeFinGroup = '*'
        },
      },
      {
        label: '指定费用',
        prop: 'feeCode',
        type: 'select',
        // remote: true,
        filterable: true,
        default: '*',
        rules: [{ ...ruleMsg[0], trigger: 'change' }],
        filterable: true,
        // selectOptions: [{ label: '*', value: '*' }, ...ARR[3]],
        selectOptions: ARR[3],
        // selectOptions: [],
        // remoteMethod: (queryString, item, data) => {
        //   this.queryFeeItemList({ queryString }).then((list) => {
        //     item.selectOptions.splice(0, 100, { label: '*', value: '*' }, ...list)
        //   })
        // },
        clear: (form, prop) => {
          form.feeCode = '*'
        },
      },
      {
        label: '收付类型',
        prop: 'receipayGroup',
        type: 'select',
        r: true,
      },
      {
        label: '当前配置科目',
        type: 'text',
        prop: 'feeItemSubject',
        default: '',
        br: true,
        noReq: true,
      },
      {
        label: '借贷方向',
        prop: 'debitReditType',
        type: 'select',
        req: 'debitCreditType',
        r: true,
      },
      {
        label: '对手科目类型',
        type: 'select',
        prop: 'voucherRivalsSubjectType',
        req: 'rivalSubjectType',
        // r: true,
      },
      {
        label: '对手科目编码',
        type: 'select',
        rules: [{ ...ruleMsg[0], trigger: 'change' }],
        prop: 'rivalSubjectCode',
        // r: true,
        remote: true,
        remoteMethod: (queryString, item) => {
          this.subjectList({ queryString, distinctSubjectCode: 'yes', size: 60, noCachPagesize: true }).then((res) => {
            item.selectOptions = res
          })
        },
        visibleChange: (str, item) => {
          this.subjectList({ queryString: '', distinctSubjectCode: 'yes', size: 60, noCachPagesize: true }).then((res) => {
            item.selectOptions = res
          })
        },
        selectOptions: ARR[2],
      },
      {
        label: '对手子科目匹配',
        type: 'select',
        prop: 'voucherSubSubjectMatchType',
        req: 'subMatchType',
        // r: true,
        multiple: true,
      },
      {
        label: '现金交易对手科目',
        type: 'select',
        rules: [{ ...ruleMsg[0], trigger: 'change' }],
        prop: 'rivalCachSubjectCode',
        remote: true,
        remoteMethod: (queryString, item) => {
          this.subjectList({ queryString, distinctSubjectCode: 'yes', size: 60, noCachPagesize: true }).then((res) => {
            item.selectOptions = res
          })
        },
        visibleChange: (str, item) => {
          this.subjectList({ queryString: '', distinctSubjectCode: 'yes', size: 60, noCachPagesize: true }).then((res) => {
            item.selectOptions = res
          })
        },
        selectOptions: ARR[2],
      },
      {
        label: '现金交易转记凭证字',
        type: 'select',
        selectOptions: ARR[0],
        rules: [{ ...ruleMsg[0], trigger: 'change' }],
        prop: 'cachVoucherClass',
      },
      {
        label: '同科目金额合并',
        type: 'select',
        prop: 'isAmtMerge',
        r: true,
        propInDict: 'yesNo',
      },
      {
        label: '是否费用类别的默认规则',
        type: 'select',
        prop: 'isDefault',
        r: true,
        propInDict: 'yesNo',
      },
      // 有分组时不需新增，无分组需手动填写分组名称和描述
      {
        label: '分组名称',
        type: 'select',
        prop: 'acSceneGroupId',
        selectOptions: ARR[4],
        br: true,
        r: true,
        rules: [{ ...ruleMsg[0], trigger: 'change' }],
        disabled: false,
        clickNative: (item, formItems) => {
          let len = formItems.length
          if (item.selectOptions.length) {
            if (formItems[len - 3].show) {
              formItems[len - 5].disabled = false
              formItems[len - 5].r = true
              formItems[len - 5].noReq = false
              formItems[len - 5].rules = ruleMsg
              formItems[len - 3].show = formItems[len - 4].show = false
            }
          } else {
            formItems[len - 5].disabled = true
            formItems[len - 5].r = false
            formItems[len - 5].rules = []
            formItems[len - 5].noReq = true
            formItems[len - 3].rules = formItems[len - 4].rules = ruleMsg
            formItems[len - 3].show = formItems[len - 4].show = true
            formItems[len - 3].noReq = formItems[len - 4].noReq = false
            this.$msgWarnClose('暂无分组，请填写新增分组和描述')
          }
          this.$forceUpdate()
        },
        // querySearch: (queryString, cb, formItems) => {
        //   let len = formItems.length
        //   this.sceneGroupList(queryString, cb)
        //     .then((res) => {
        //       if (!res || !res.length) {
        //         return Promise.reject()
        //       }
        //       if (formItems[len - 3].show) {
        //         formItems[len - 5].disabled = false
        //         formItems[len - 5].r = true
        //         formItems[len - 5].noReq = false
        //         formItems[len - 5].rules = ruleMsg
        //         formItems[len - 3].show = formItems[len - 4].show = false
        //       }
        //       // console.log(formItems)
        //     })
        //     .catch((err) => {
        //       formItems[len - 5].disabled = true
        //       formItems[len - 5].r = false
        //       formItems[len - 5].rules = []
        //       formItems[len - 5].noReq = true
        //       formItems[len - 3].rules = formItems[len - 4].rules = ruleMsg
        //       formItems[len - 3].show = formItems[len - 4].show = true
        //       formItems[len - 3].noReq = formItems[len - 4].noReq = false
        //       this.$msgWarnClose('暂无分组，请填写新增分组和描述')
        //     })
        //     .finally(() => {
        //       this.$forceUpdate()
        //     })
        // },
        // select: (optionItem, form) => {
        //   form.acSceneGroupId = optionItem.key
        // },
        // clear: (form) => {
        //   form.acSceneGroupId = ''
        // },
      },
      {
        label: '内外账类型',
        type: 'select',
        prop: 'acctSetType',
        r: true,
        propInDict: 'voucherAcctSetType',
      },
      // this.sceneCfg.name,
      // this.sceneCfg.des,
      {
        label: '新增分组名称',
        type: 'input',
        prop: 'acSceneGroupName',
        show: false,
        noReq: true,
      },
      {
        label: '新增分组描述',
        type: 'textarea',
        prop: 'acSceneGroupRemark',
        show: false,
        noReq: true,
      },
      {
        label: '摘要参数',
        type: 'select',
        prop: 'voucherSummaryType',
        noReq: true,
        selectOptions: this.voucherSummary,
      },
      { label: '摘要', type: 'list', prop: 'summaryInfo', br: true },
    ]
    const formData = {}
    formItem.forEach((item) => (formData[item.prop] = item.default || ''))
    this.addDialog.form = { ...formData }
    this.editDialog.form = { ...formData }
    // 深拷贝弹框内容，并设置需要rules，disabled的地方
    let addDialogItems = []
    let editDialogItems = []
    formItem.map((item) => {
      addDialogItems.push(item.r ? { rules: ruleMsg, ...item } : { ...item })
      editDialogItems.push(item.d ? { ...item, disabled: true } : item.r ? { rules: ruleMsg, ...item } : { ...item })
    })
    this.addDialog.formItems = addDialogItems
    this.editDialog.formItems = editDialogItems
    this.editDialog.voucherSummary = this.addDialog.voucherSummary = this.voucherSummary
    /******************************************   搜索配置  *********************************************/
    let searchInputGroup = ['voucherClass', 'feeBillType', 'feeBillSubType', 'feeFinGroup', 'feeCode', 'createdDate']
    this.searchOption = {
      saveDefault: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: searchInputGroup.length,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          voucherClass: { label: '凭证字', type: 'select', selectOptions: ARR[0] },
          feeBillType: { label: '单据类型', type: 'select', prop: 'voucherBizType' },
          receipayGroup: { label: '收付类型', type: 'select', prop: 'receipayGroup' },
          feeBillSubType: {
            label: '单据子类型',
            type: 'select',
            selectOptions: [{ label: '*', value: '*' }, ...this.dictMap.recWriteoffSubType, ...this.dictMap.payWriteoffSubType],
          },
          feeFinGroup: { label: '费用类型', type: 'select', selectOptions: ARR[1] },
          feeCode: {
            label: '费用',
            type: 'remoteSelect',
            filterable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => {
              this.queryFeeItemList({ queryString }).then((list) => {
                if (this.remoteSelectCommon(item, [{ label: '*', value: '*' }, ...list])) return
                item.remoteSelectList.splice(0, 100, { label: '*', value: '*' }, ...list)
              })
            },
            visibleChange: (queryString, item) => {
              this.queryFeeItemList({ queryString }).then((list) => {
                if (this.remoteSelectCommon(item, [{ label: '*', value: '*' }, ...list])) return
                item.remoteSelectList.splice(0, 100, { label: '*', value: '*' }, ...list)
              })
            },
          },
          acctSetType: { label: '内外账类型', type: 'select', prop: 'voucherAcctSetType' },
          createdDate: { label: '创建时间', type: 'daterange', keys: ['startDate', 'endDate'], format: 'yyyy-MM-dd' },
        },
      },
    }

    // 搜索配置
    let searchColumns = [
      {
        label: '凭证字',
        prop: 'voucherClass',
        type: 'select',
        selectOptions: ARR[0],
      },
      {
        label: '单据类型',
        prop: 'feeBillType',
        type: 'select',
        propInDict: 'voucherBizType',
      },
      {
        label: '单据子类型',
        type: 'select',
        filterable: true,
        prop: 'feeBillSubType',
        selectOptions: [{ label: '*', value: '*' }, ...this.dictMap.recWriteoffSubType, ...this.dictMap.payWriteoffSubType],
      },
      {
        label: '费用分类名称',
        prop: 'feeFinGroup',
        type: 'select',
        selectOptions: ARR[1],
      },
      {
        label: '费用',
        prop: 'feeCode',
        type: 'select',
        remote: true,
        filterable: true,
        remoteSelectList: [],
        remoteMethod: (queryString, item) => {
          this.queryFeeItemList({ queryString }).then((list) => {
            item.remoteSelectList.splice(0, 100, { label: '*', value: '*' }, ...list)
          })
        },
      },
      { label: '创建时间', prop: 'dateRange', type: 'dateRange', propArr: ['startDate', 'endDate'], valueFormat: 'yyyy-MM-dd' },
    ]
    // this.searchOption = this.initSearchOption(searchColumns)
    /******************************************   表格配置  *********************************************/
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = { ...this.option, id: 'option1', $name: 'VoucherBusiness', pagination, selection: false }
    this.tableOption.operationBtns.data = [this.editOperate[0], this.delOperate[0]]
    // this.tableOption.operationBtns.data = this.editOperate
    this.tableOption.operationBtns.width = '80px'
    if (!this.checkAuth(this.$route.name, 'btn-edit')) this.tableOption.operationBtns = false
    // console.log(this.voucherClassCfg)
    const formatter =
      (cfg) =>
      ({
        row,
        column: {
          params: { prop },
        },
      }) =>
        row[prop] === '*' ? '*' : cfg[row[prop]]
    let columns = [
      { prop: 'acctSetType', label: '内外账类型', type: 'select', propInDict: 'voucherAcctSetType', width: 80 },
      { prop: 'voucherClass', label: '凭证字', type: 'text', formatter: formatter(this.voucherClassCfg), width: 60 },
      { prop: 'feeBillType', label: '单据类型', type: 'select', propInDict: 'voucherBizType', width: 100 },
      {
        prop: 'feeBillSubType',
        label: '单据子类型',
        width: 100,
        type: 'select',
        selectOptions: [
          { label: '*', value: '*' },
          ...this.dictMap.voucherBizSubtype,
          ...this.dictMap.recWriteoffSubType,
          ...this.dictMap.payWriteoffSubType,
        ],
      },
      { prop: 'feeFinGroup', label: '费用类型', type: 'text', formatter: formatter(this.feeFinGroupCfg), width: 100 },
      { prop: 'feeCode', label: '费用', type: 'text', formatter: formatter(this.feeCodeCfg), width: 100 },
      { prop: 'receipayGroup', label: '收付类型', type: 'select', width: 60 },
      { prop: 'debitCreditType', label: '借/贷', type: 'select', propInDict: 'debitReditType', width: 60 },
      {
        prop: 'subjectName',
        label: '科目',
        type: 'text',
        formatter: ({ row }) => row.subjectName + ' ' + row.subjectCode,
        width: 100,
      },
      { prop: 'rivalSubjectType', label: '对手科目类型', type: 'select', propInDict: 'voucherRivalsSubjectType', width: 100 },
      { prop: 'rivalSubjectCode', label: '对手科目编码', width: 100 },
      {
        prop: 'subMatchType',
        label: '对手子科目匹配',
        type: 'select',
        multi: true,
        propInDict: 'voucherSubSubjectMatchType',
        width: 100,
      },
      {
        prop: 'rivalCachSubjectCode',
        label: '现金交易对手科目',
        type: 'text',
        formatter: formatter(this.subjectListCfg),
        width: 100,
      },
      {
        prop: 'cachVoucherClass',
        label: '现金交易转记凭证字',
        type: 'text',
        formatter: formatter(this.voucherClassCfg),
        width: 130,
      },
      { prop: 'isAmtMerge', label: '合并金额', type: 'select', propInDict: 'yesNo', width: 60 },
      { prop: 'isDefault', label: '默认规则', type: 'select', propInDict: 'yesNo', width: 60 },
      { prop: 'summaryInfo', label: '摘要', type: 'text', width: 130 },
      { prop: 'createdName', label: '创建人', type: 'text', width: 100 },
      { prop: 'createdTime', label: '创建时间', type: 'text', width: 130 },
      { prop: 'updatedName', label: '修改人', type: 'text', width: 100 },
      { prop: 'updatedTime', label: '修改时间', type: 'text', width: 130 },
      { prop: 'acSceneGroupName', label: '分组名称', type: 'text', width: 116 },
    ]
    this.tableOption.columns = columns
    this.optionMaxHeight = this.tableOption
    // TODO 搜索保存，自动请求
    // this.getData()
  },
  methods: {
    initDict() {
      // 创建静态字典，直接进入修改时可以正确的显示内容
      let fn = () => {}
      // 凭证字
      let p1 = this.voucherClassList('', fn)
      // 费用分类
      let p2 = this.feeitemFinGroup('', fn)
      // 科目
      let p3 = this.subjectList({ queryString: '', distinctSubjectCode: 'yes', size: 60, noCachPagesize: true }, fn)
      // 费用编码
      let p4 = this.queryFeeItemList({ queryString: '', size: 1000 }, fn)
      // 凭证分组
      let p5 = this.sceneGroupList('', fn)
      let cfgs = ['voucherClassCfg', 'feeFinGroupCfg', 'subjectListCfg', 'feeCodeCfg', 'sceneGroupCfg']
      return Promise.all([p1, p2, p3, p4, p5])
        .then((arr) => {
          arr.forEach((items, index) => {
            // console.log(items)
            if (index === 0) {
              let setArr = [...new Set(items.map((v) => v.value))]
              items = setArr.map((v) => items.find((item) => v === item.value) || {})
            }
            if (index === 1 || index === 3) {
              ARR[index].splice(0, 1000, { label: '*', value: '*' }, ...items)
            } else {
              ARR[index].splice(0, 1000, ...items)
            }
            ARR[index].forEach((item) => {
              this[cfgs[index]][item.value] = item.label
            })
          })
        })
        .catch(console.log)
    },
    async getData(data) {
      this.lsLoading = true
      if (this.isRefreshing) {
        this.isRefreshing = false
        await this.initDict()
      }
      if (data) {
        this.searchBackup = data.query
      }
      data = {
        currPage: this.tableOption.pagination.currPage,
        pageSize: this.tableOption.pagination.pageSize,
        query: this.searchBackup || [],
      }
      sceneList(data)
        .then((res) => {
          this.tableOption.data = res.data.list
          // this.tableOption.data = res.data.list.map((item) => {
          //   for (const key in item) {
          //     if (Object.hasOwnProperty.call(item, key)) {
          //       const element = item[key]
          //       item[key] = element && element.toLowerCase ? element.toLowerCase() : element
          //     }
          //   }
          //   return item
          // })
          Object.assign(this.tableOption.pagination, res.data)
          // this.tableOption.pagination.currPage = res.data.currPage
          // this.tableOption.pagination.pageSize = res.data.pageSize
          // this.tableOption.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    // 增加按钮
    add() {
      this.addDialog.show = true
    },
    // 关闭对话框， params为true表示确认键
    dialogClose(type, params) {
      // console.log(this[type])
      // let data = this.convertReq(this[type])
      // if (this[type].summaryDiy) {
      //   data.summaryInfo = this[type].summaryStr
      // }
      // console.log(data)
      // return
      if (params === true) {
        let data = this.convertReq(this[type])
        // 新增&修改场景
        if (this[type].summaryDiy) {
          data.summaryInfo = this[type].summaryStr
        }
        sceneSave({ ...data, subMatchType: data.subMatchType.join(',') }).then((res) => {
          if (type !== 'editDialog') {
            let { summaryList, voucherSummary } = this[type]
            summaryList.splice(0, 100)
            voucherSummary.forEach((item) => (item.disabled = false))
            this.clearAddDialog(this[type])
          }
          this.$msgSucClose(type === 'editDialog' ? '编辑成功！' : '新增成功！')
          this.isRefreshing = true
          this.getData()
        })
      }
      for (const key in this[type]) {
        if (Object.hasOwnProperty.call(this[type], key)) {
          this[type]['form'][key] = ''
        }
      }
      this[type].show = false
      // this.$nextTick(() => this.initDict())
    },
    // 增加摘要
    addSummary(type, { val, options }) {
      this.voucherSummary.forEach((item) => {
        if (item.value.replace(/#/g, '') === val.replace(/#/g, '')) {
          item.disabled = true
          this[type].summaryList.push(val)
        }
      })
      this[type].form.summaryInfo = this[type].summaryList.join('/')
      this.$forceUpdate()
    },
    // 删除摘要
    delSummary(type, { tag, index }) {
      // console.log(type, tag, index)
      let { summaryList, voucherSummary } = this[type]
      summaryList.splice(index, 1)
      voucherSummary.forEach((item) => {
        if (item.value.replace(/#/g, '') === tag.replace(/#/g, '')) {
          item.disabled = false
        }
      })
      this[type].form.summaryInfo = this[type].summaryList.join('/')
      this.$forceUpdate()
    },
    handleDelete(index, row) {
      // console.log(index, row)
      this.$confirmWarn('确认删除此记录？', () => {
        sceneDelete({ acSceneId: row.acSceneId }).then((res) => {
          this.$msgSucClose('删除成功！')
          this.handleCurrentChange(1)
        })
      })
    },
    // 单行编辑
    handleSingleEdit(row) {
      Object.assign(this.editDialog.form, row)
      // 需把本行内容传值
      // 编辑时需要传值acSceneId表示修改
      this.editDialog.form.acSceneId = row.acSceneId
      // 凭证字--  _voucherClass  voucherClassCfg
      // this.editDialog.form.voucherClass = row.voucherClass || ''
      // this.editDialog.form._voucherClass = row.voucherClass || ''
      // this.editDialog.form.voucherClass = this.voucherClassCfg[row.voucherClass] || ''
      // 单据类型-- feeBillType 对应字典 voucherBizType
      // this.editDialog.form.voucherBizType = row.feeBillType || ''
      // 单据子类型-- feeBillSubType 对应字典 voucherBizSubtype
      setTimeout(() => {
        this.editDialog.form.feeBillSubType = row.feeBillSubType || '*'
      }, 200)
      // this.editDialog.form.voucherBizSubtype = row.feeBillSubType || '*'
      // 费用类别-- feeFinGroup 对应字典 feeitemFinGroup  feeFinGroupCfg
      this.editDialog.form.feeFinGroup = row.feeFinGroup || '*'
      // this.editDialog.form.feeitemFinGroup = this.feeFinGroupCfg[row.feeFinGroup] || '*'
      // 费用编码-- _feeCode 对应字典 feeCode feeCodeCfg
      this.editDialog.form.feeCode = row.feeCode || '*'
      // this.editDialog.form._feeCode = row.feeCode
      // this.editDialog.form.feeCode = this.feeCodeCfg[row.feeCode] || '*'
      // 借贷类型-- debitCreditType 对应字典 debitReditType
      this.editDialog.form.debitReditType = row.debitCreditType || ''
      // 对手子科目匹配-- subMatchType 对应字典 voucherRivalsSubjectType
      this.editDialog.form.voucherSubSubjectMatchType = row.subMatchType ? row.subMatchType.split(',') : []
      // 对手科目类型-- rivalSubjectType 对应字典 voucherSubSubjectMatchType
      this.editDialog.form.voucherRivalsSubjectType = row.rivalSubjectType || ''
      // 现金交易转记凭证字-- _cachVoucherClass  voucherClassCfg
      this.editDialog.form.cachVoucherClass = row.cachVoucherClass || ''
      // this.editDialog.form._cachVoucherClass = row.cachVoucherClass || ''
      // this.editDialog.form.cachVoucherClass = this.voucherClassCfg[row.cachVoucherClass] || ''
      // 对手科目编码-- _rivalSubjectCode  subjectListCfg
      this.editDialog.form.rivalSubjectCode = row.rivalSubjectCode || ''
      // this.editDialog.form._rivalSubjectCode = row.rivalSubjectCode || ''
      // this.editDialog.form.rivalSubjectCode = this.subjectListCfg[row.rivalSubjectCode] || ''
      // 现金交易对手科目-- _rivalCachSubjectCode  subjectListCfg
      this.editDialog.form.rivalCachSubjectCode = row.rivalCachSubjectCode || ''
      // this.editDialog.form._rivalCachSubjectCode = row.rivalCachSubjectCode || ''
      // this.editDialog.form.rivalCachSubjectCode = this.subjectListCfg[row.rivalCachSubjectCode] || ''
      // 分组名称-- acSceneGroupId  sceneGroupList sceneGroupCfg
      this.editDialog.form.sceneGroupList = this.sceneGroupCfg[row.acSceneGroupId] || ''
      // 摘要-- summaryInfo需特殊处理
      this.editDialog.summaryList = row.summaryInfo ? row.summaryInfo.split('/') : []
      // select类型的需要情况req的值，因为select改变值时没有回调设置req，req有值则不取prop的值
      this.editDialog.formItems.forEach((item) => {
        if (item.type == 'select') {
          this.editDialog.form[item.req] = ''
        }
      })
      this.editDialog.summaryDiy = false
      this.editDialog.summaryStr = ''
      this.editDialog.show = true
    },
  },
}
</script>
<style lang="scss" scoped>
.finance-page ::v-deep {
  .el-dialog__body {
    padding: 20px 20px 0;
  }
  .el-dialog .el-form-item {
    margin-bottom: 12px;
  }
}
</style>