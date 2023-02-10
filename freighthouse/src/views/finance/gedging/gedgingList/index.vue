<template>
  <div
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption1" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button
            v-if="checkAuth($route.name, 'tab-gedgingList', 'btn-gedgingCancel')"
            type="purple"
            class="finance-btn"
            @click="gedgingCancel"
            size="mini"
            :loading="btnLoading"
          >撤回申请</el-button>
          <!-- v-if="checkAuth($route.name, 'tab-gedgingList', 'btn-handleExport')" -->
          <el-button
            class="finance-btn"
            @click="handleExport"
            size="mini"
            v-if="checkAuth($route.name, 'tab-gedgingList', 'btn-handleExport')"
            :loading="btnLoading1"
          >导出</el-button>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTableMass :option="option1" @send-multi="sendMulti" />
    </div>
    <div class="cancel-invoice-receivable-form finance-closing-form">
      <el-dialog
        :title="'总关账'"
        :visible.sync="dialogVisibleClosing"
        :close-on-click-modal="false"
        width="604px"
      >
        <div>
          <el-form
            :model="closingForm"
            ref="closingForm"
            label-width="120px"
            size="mini"
            :rules="closingRules"
          >
            <el-form-item label="关账分公司" prop="settleCompName">
              <el-autocomplete
                v-model="closingForm.settleCompName"
                placeholder="请输入"
                :select-when-unmatched="true"
                :fetch-suggestions="(queryString, cb) => {autocomplete.querySearch && autocomplete.querySearch(queryString, cb)}"
                @select="(value) => {autocomplete.select && autocomplete.select(value)}"
                @change="(value) => {autocomplete.change && autocomplete.change(value)}"
              ></el-autocomplete>
            </el-form-item>
            <el-form-item label="关账月份" prop="closingMonth">
              <el-date-picker v-model="closingForm.closingMonth" type="month" placeholder="选择月"></el-date-picker>
            </el-form-item>
            <el-form-item label="关账类型" prop="closingType">
              <el-radio-group v-model="closingForm.closingType" size="mini">
                <el-radio label="关外帐"></el-radio>
                <el-radio label="关内帐"></el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" size="mini" @click="closingConfirm">确定</el-button>
          <el-button size="mini" @click="dialogVisibleClosing = !dialogVisibleClosing">取消</el-button>
        </span>
      </el-dialog>
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
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { mapGetters } from 'vuex'
import { listPage, getListAmtSummary, gedgingCancel } from '@/api/fin/gedging'
import { routerMixin } from '@/views/finance/mixins/routerMixin'

export default {
  // props: ['isJumpRouteFromPage1'],
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      currencySelectOptions: [],
      pageSizeUrl: listPage('geturl'),
      keyDownActive: true,
      descColumns: [],
      ascColumns: [],
      option1: {},
      option2: {},
      searchOption1: {},
      table1DataBackup: [],
      table2DataBackup: [],
      isAddPay: false,
      multipleSelection1: [],
      multipleSelection2: [],
      form: {
        orderNo: '',
        creationDate: '',
        billNo: '',
        settleCorpName: '',
        settleCorpCode: '',
      },
      orderNo: '',
      orderBillId: '',
      feeAdjustApplyId: 0,
      showSettlementDetail: false,
      autocomplete: {},
      selectedOptionItem: '',
      dialogVisible: false,
      batchPrintCreateForm: {
        applyAmt: 0,
        invoiceAmt: 0,
        invoiceReceivableId: 0,
      },
      batchPrintCreateData: [],
      invoiceReceivableIndex: 0,
      dialogVisibleManualRegist: false,
      currentComponent: '',
      settleOrderId: '',
      settleCorpCode: '',
      settleCorpName: '',
      settleCompCode: '',
      settleCompName: '',
      feeIds: [],
      source: '',
      dialogVisibleClosing: false,
      closingForm: {
        settleCompName: '',
        closingMonth: '',
        closingType: '',
      },
      closingRules: {
        settleCompName: [{ required: true, message: '关账分公司不能为空', trigger: 'change' }],
        closingMonth: [{ required: true, message: '关账月份不能为空', trigger: 'change' }],
        closingType: [{ required: true, message: '关账类型不能为空', trigger: 'change' }],
      },
      gedgingApplyId: -1,
      rightFilterBtns: [true, false, false, false],
      // 自定义表头弹框
      customColumnsPopShow: false,
      // 右侧搜索条件
      buttonSearch: '',
      selfColumnsBase: [
        {
          prop: 'gedgingApplyNo',
          label: '对冲编号',
          type: 'button',
          width: 130,
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => {
              this.showDetail(row)
            },
          },
        },
        {
          prop: 'settleCompName',
          label: '分公司',
          type: 'text',
          width: 150,
        },
        {
          prop: 'rivalCorpName',
          label: '结算单位',
          type: 'text',
          width: 150,
        },
        {
          prop: 'gedgingType',
          label: '对冲类型',
          width: 80,
          type: 'select',
        },
        {
          prop: 'gedgingSubType',
          label: '对冲子类型',
          width: 100,
          type: 'select',
        },
        {
          prop: 'settleOrderNo',
          label: '结算单号',
          width: 130,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps) => {
              // this.showColumnDetail({ type: 'settleOrderNos', no, componentProps })
              this.showColumnDetailHandle({ type: 'settleOrderNos', no, componentProps }, { isTab: true })
            },
          },
        },
        // {
        //   prop: 'writeoffStatus',
        //   label: '核销状态',
        //   type: 'select'
        // },
        {
          prop: 'writeoffNopayNo',
          label: '核销编号',
          type: 'button',
          width: '130px',
          formatter: ({ row }) => {
            return row.auditStatus === 'cancel' ? '' : row.writeoffNopayNo
          },
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => {
              this.showDetail(row)
            },
          },
        },
        // TODO
        // {
        //   prop: 'writeoffStatus',
        //   label: '核销状态',
        //   type: 'select',
        //   propInDict: 'writeoffStatus'
        // },
        {
          prop: 'gedgingCurrency',
          label: '币种',
          width: 80,
          type: 'select',
        },
        {
          prop: 'recvGedgingAmount',
          label: '应收对冲',
          width: 100,
          type: 'text',
        },
        {
          prop: 'payGedgingAmount',
          label: '应付对冲',
          width: 100,
          type: 'text',
        },
        {
          prop: 'isShiftVoucher',
          label: '是否生成转字凭证',
          width: 130,
          type: 'select',
          propInDict: 'yesNo',
          voucherHide: true,
        },
        {
          prop: 'confirmFileName', // 另:confirmFileNo
          label: '附件',
          width: 130,
          type: 'button',
          action: 'showAttachment',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              if (action === 'showAttachment') {
                this.showAttachment(row)
              }
            },
          },
          sortable: false,
        },
        {
          prop: 'createdName',
          label: '申请人',
          width: 100,
          type: 'text',
          sortable: false,
        },
        {
          prop: 'createdTime',
          label: '申请时间',
          width: 130,
          type: 'text',
        },
        {
          prop: 'writeoffRemark',
          label: '审核备注',
          width: 150,
          type: 'text',
        },
        {
          prop: 'auditName',
          label: '审核人',
          width: 100,
          type: 'text',
        },
        {
          prop: 'auditStatus',
          label: '审核状态',
          width: 80,
          type: 'select',
        },
        {
          prop: 'auditTime',
          label: '审核时间',
          width: 100,
          type: 'text',
        },
      ],
    }
  },
  created() {
    let dictMapCurrency = JSON.parse(JSON.stringify(this.dictMap['currency']))
    let find = dictMapCurrency.find((item) => item.value === 'ORIGINAL')
    if (find) {
      find.value = 'original'
    } else {
      dictMapCurrency.push({ label: '原币别', value: 'original' })
    }
    this.currencySelectOptions = dictMapCurrency
    this.selfColumnsBase.forEach((item) => {
      if (item.prop === 'gedgingCurrency')
        item.selectOptions = this.dictMap['currency'].concat([{ label: '原币种', value: 'original' }])
    })
    this.searchOption1 = {
      saveShow: true,
      // saveDefault: true,
      saveName: 'gedgingApplyList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        // 初始搜索条件数
        defaultSearchLength: 6,
        // 条件数组
        searchInputGroup: [
          { key: 'gedgingApplyNo', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'rivalCorpCodes', value: '', showType: '2', range: { min: '', max: '' } },
          { key: 'gedgingTypes', value: '', showType: '3', range: { min: '', max: '' } },
          { key: 'gedgingCurrency', value: '', showType: '4', range: { min: '', max: '' } },
          { key: 'recvGedgingAmount', value: '', showType: '5', range: { min: '', max: '' } },
          { key: 'createdTime', value: '', showType: '6', range: { min: '', max: '' } },
        ],
        // 左侧下拉框及对应右侧配置
        filterGroups: {
          allNo: { label: '各类编号', type: 'input' },
          gedgingApplyNo: { label: '对冲编号', type: 'input', showType: '1' },
          settleOrderNo: { label: '结算单号', type: 'input', showType: '1' },
          writeoffNopayNo: { label: '核销编号', type: 'input', showType: '1' },
          rivalCorpCodes: {
            label: '结算单位',
            prop: 'rivalCorpCode',
            type: 'remoteSelect',
            showType: '2',
            multiple: true,
            clearable: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: '' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: '' }, item)
            },
            remoteSelectList: [],
          },
          settleCompCode: {
            label: '分公司',
            type: 'remoteSelect',
            // multiple: true,
            clearable: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            remoteSelectList: [],
          },
          gedgingTypes: { label: '对冲类型', type: 'select', multiple: true, prop: 'gedgingType', showType: '3' },
          gedgingSubType: { label: '对冲子类型', type: 'select', multiple: true, prop: 'gedgingSubType' },
          auditStatus: { label: '审核状态', type: 'select', prop: 'auditStatus', showType: '3' },
          // writeoffStatuss: { label: '核销状态', type: 'select', multiple: true, prop: 'writeoffStatus', showType: '3' }, // 原设计就无，后台亦未支持搜索
          gedgingCurrency: { label: '币种', type: 'select', prop: 'currency', selectOptions: this.currencySelectOptions },
          recvGedgingAmount: { label: '应收对冲', type: 'range', showType: '5' },
          payGedgingAmount: { label: '应付对冲', type: 'range', showType: '5' },
          isShiftVoucher: { label: '是否生成转字凭证', type: 'select', prop: 'yesNo', showType: '4' },
          createdBy: {
            label: '申请人',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item, row) => this.getEmployeeList('', item),
            remoteSelectList: [],
          },
          createdTime: { label: '申请时间', type: 'daterange', format: 'yyyy-MM-dd' },
          auditBy: {
            label: '审核人',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item, row) => this.getEmployeeList('', item),
            remoteSelectList: [],
          },
          auditTime: { label: '审核时间', type: 'daterange', format: 'yyyy-MM-dd' },
        },
      },
    }
    let _this = this
    this.autocomplete = {
      querySearch: (queryString, cb) => {
        _this.selectedOptionItem = ''
        _this.querySettleUnit(queryString, cb)
      },
      select: (optionItem, row) => {
        _this.selectedOptionItem = optionItem
        console.log('this.selectedOptionItem:', _this.selectedOptionItem)
        _this.form.settleCompName = optionItem.value
        _this.form.settleCompCode = optionItem.key
      },
      change: (val, row) => {
        // 延时150ms获取select中的改变
        setTimeout(() => {
          if (_this.selectedOptionItem === '') {
            _this.form.settleCompName = ''
            _this.form.settleCompCode = ''
            return
          }
        }, 150)
      },
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: '详情',
          type: 'text',
          show: true,
          action: 'showDetail',
        },
        // {
        //   label: '删除',
        //   type: 'text',
        //   show: true,
        //   action: 'Delete'
        // }
      ],
      show: true,
      // width: '80px'
    })
    if (!this.checkAuth(this.$route.name, 'tab-gedgingList', 'btn-detail')) operationBtns = false
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
    })
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    this.option1 = Object.assign({}, this.option, {
      customColumns: {
        show: true,
        handleCustomColumns: () => {
          if (!this.isNotFirtGetData) {
            this.getData(false, true).then((res) => setTimeout(() => (this.customColumnsPopShow = true), 600))
          } else {
            this.customColumnsPopShow = true
          }
        },
      },
      id: 'option1',
      $name: 'GedgingList',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      pagination,
      listAmtSummary,
      sortable: true,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
      emptyText: '数据将在查询后显示',
    })
    let columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))

    this.option1.columns = columns
    // 和默认获取搜索条件冲突，在此处调用会取消获取搜索条件后请求列表数据
    // this.getData()
    this.cTimestamp = new Date().getTime()
  },
  activated() {
    // 首次进入直接返回，会由搜索组件触发搜索
    if (!this.isFirstActivated) {
      this.isFirstActivated = true
      return
    }
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache || (this.$route.meta.refresh && timestamp - this.cTimestamp > 300)) {
      this.handleCurrentChange(1)
    }
  },
  methods: {
    getData(isSearch, customerList) {
      let timeStamp = +new Date()
      if (this.diyTimeStamp && timeStamp - this.diyTimeStamp < 900) {
        return Promise.resolve()
      }
      this.isNotFirtGetData = true
      this.diyTimeStamp = timeStamp
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        columns: [],
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption1, '', 'rangeMinMax')
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (this.buttonSearch) {
        data.query.push({ column: 'auditStatus', type: 'default', value: this.buttonSearch })
      }
      // console.log('data:', data)
      return listPage(data)
        .then((res) => {
          this.finCommonColumns(res)
          if (customerList) return
          // if (res.data.configColumns && res.data.configColumns.length) {
          //   let columns = res.data.configColumns
          //   this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop)).filter((v) => v)
          //   this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
          //   this.configColumns = res.data.configColumns
          // }
          if (res.code === 0) {
            let { list } = res.data
            let data = []
            list.forEach((item) => {
              item.settleOrderNo_multiValue = item.settleOrderNo.split(',')
              if (item.auditStatus === 'cancel') {
                item.writeoffNopayNo = ''
              }
              data.push(item)
            })
            this.option1.data = data
            this.table1DataBackup = [...this.option1.data]
            this.$set(this.option1, 'emptyText', '未查询到任何数据')
            Object.assign(this.option1.pagination, res.data)
            // this.option1.pagination.currPage = res.data.currPage
            // this.option1.pagination.pageSize = res.data.pageSize
            // this.option1.pagination.totalCount = res.data.totalCount
          }
        })
        .finally(() => (this.lsLoading = false))
      // this.debounceLs(() => {
      //   this.getListAmtSummary(data)
      // })
    },
    getListAmtSummary(data) {
      getListAmtSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          let data = {
            recGedgingAmtList: [],
            payGedgingAmtList: [],
          }
          data = Object.assign(data, res.data)
          let labelObj = {
            recGedgingAmtListLabel: '应收对冲金额',
            payGedgingAmtListLabel: '应付对冲金额',
          }
          let colorObj = {
            recGedgingAmtListColor: 'red', // 支持red, green, black三种值
            payGedgingAmtListColor: 'green',
          }
          for (let key in data) {
            let value = data[key]
            value.forEach((item) => {
              if (item.currency === 'original') {
                item.currency = '原币'
              }
            })
          }
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data,
            labelObj,
            colorObj,
          })
        }
      })
    },
    openClosing() {
      this.dialogVisibleClosing = true
    },
    closingConfirm() {
      this.$refs.closingForm.validate((valid) => {
        if (valid) {
          console.log(valid)
        }
      })
    },
    closeDetail() {
      this.showSettlementDetail = false
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    search(data, index) {
      this.buttonSearch = data
      this.option1.pagination.currPage = 1
      this.getData(true)
      if (index || index === 0) {
        this.rightFilterBtns = [false, false, false, false]
        this.rightFilterBtns[index] = true
      }
    },
    showAttachment(row) {
      let href = `/base/fileView/preview/${row.confirmFileNo}/sowoll`
      window.open(href)
      // row.fileNo = row.confirmFileNo
      // row.fileName = row.confirmFileName
      // this.handleView(row)
    },
    handleView(row) {
      //       let VUEAPPBASEAPI = process.env.VUE_APP_BASE_API
      //       VUEAPPBASEAPI = VUEAPPBASEAPI.match('http') ? VUEAPPBASEAPI : 'http://ls.com/'
      //       let fileUrl = `${VUEAPPBASEAPI}/base/fileView/preview/${row.fileNo}/${row.fileName}`
      //       let href = `/file/onlinePreview?url=${encodeURIComponent(fileUrl)}`
      let href = `/base/fileView/preview/${row.fileNo}/sowoll`
      window.open(href)
    },
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data

      let data2 = {
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        query: [],
      }
      let ids = this.multipleSelection1
        .map((item) => {
          return item.gedgingApplyid
        })
        .join(',')
      if (ids) {
        data2.query.push({
          column: 'gedgingApplyIds',
          type: 'eq',
          value: ids,
        })
      } else {
        data2.query = this.searchBackup || []
      }
      if (data.length || this.option1.listAmtSummary.count++ > 0) {
        this.debounceLs(() => {
          this.getListAmtSummary(data2)
        })
      }
    },
    showDetail(row) {
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({
        path: '/finance/gedging/gedgingDetail',
        query: {
          source: 'gedgingDetail',
          gedgingApplyId: row.gedgingApplyid,
        },
      })
    },
    // 撤回申请
    gedgingCancel() {
      if (this.multipleSelection1.length !== 1) {
        return this.$msgErrClose('请勾选一条需要撤回的项！')
      }
      if (this.multipleSelection1[0].auditStatus !== 'pending') {
        return this.$msgErrClose('只有等待审批的申请才能撤回！')
      }
      this.btnLoading = true
      gedgingCancel({ gedgingApplyId: this.multipleSelection1[0].gedgingApplyid })
        .then((res) => {
          this.$msgSucClose('成功撤回申请！')
          this.getData()
        })
        .finally(() => (this.btnLoading = false))
    },
    handleExport() {
      let data = {
        columns: this.customColumnsKeys,
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
      }
      data.query = JSON.parse(JSON.stringify(this.searchBackup || []))
      if (this.multipleSelection1.length) {
        data.query = [
          {
            column: 'gedgingApplyIds',
            type: 'in',
            value: this.multipleSelection1.map((v) => v.gedgingApplyid).join(','),
          },
        ]
      }
      //查询对象的配置编码
      data.query.push({ column: 'queryDataModuleCode', value: 'gedgingApplyListExport' })
      this.btnLoading1 = true
      this.$store
        .dispatch('finance/downloadExcelFile', { data: data })
        .then((res) => {
          this.aTagClick(window.URL.createObjectURL(res), '对冲申请列表.xlsx')
        })
        .finally(() => (this.btnLoading1 = false))
    },
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    CustomColumns,
    // GedgingDetail,
    // InvoiceReceivableApply
  },
  computed: {
    ...mapGetters(['dictMap']),
  },
}
</script>
<style>
.batch-print-create .el-dialog__body {
  padding: 40px 80px 22px;
}
.batch-print-create .el-dialog__footer {
  padding-bottom: 32px;
  text-align: center;
}
.batch-print-create .el-form .el-input {
  width: 320px;
}
.manual-regist-invoice .el-form .el-date-editor.el-input {
  width: 162px;
}
.manual-regist-invoice .el-form .el-select {
  width: 162px;
}
.manual-regist-invoice .el-form .el-input {
  width: 162px;
}
.finance-closing-form .el-radio-group {
  line-height: 28px;
  height: 28px;
}
</style>