<template>
  <!-- class="finance-page" -->
  <div
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button
            v-if="checkAuth($route.name, 'tab-invoiceReceivableApplyList', 'btn-preApply')"
            class="finance-btn"
            @click="prerevApply"
            size="mini"
            type="primary"
          >预收款开票申请</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-invoiceReceivableApplyList', 'btn-manualRegistInvoice')"
            class="finance-btn"
            @click="manualRegistInvoice"
            size="mini"
            type="primary"
          >手填发票</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-invoiceReceivableApplyList', 'btn-batchPrintCreate')"
            class="finance-btn"
            @click="batchPrintCreate"
            size="mini"
            type="primary"
            :loading="btnLoading"
          >批量打印</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-invoiceReceivableApplyList', 'btn-createElectronic')"
            class="finance-btn"
            @click="createElectronicInvoiceBatch"
            size="mini"
            type="primary"
            :loading="createElectronicLoading"
          >电子票生成</el-button>
        </div>
        <div class="money-box-right">
          <el-button
            v-if="checkAuth($route.name, 'tab-invoiceReceivableApplyList', 'btn-closeApply')"
            class="finance-btn"
            @click="closeAction"
            size="mini"
            type="danger"
            :loading="btnLoading1"
          >关闭申请</el-button>
          <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
        </div>
      </div>
      <FinanceTableMass :option="option1" @send-multi="sendMulti" />
    </div>
    <div class="batch-print-create">
      <el-dialog :title="'纸质发票批量打印'" :visible.sync="dialogVisible" width="604px">
        <div>
          <el-form :model="batchPrintCreateForm" ref="form" label-width="120px" size="mini">
            <el-form-item label="已选择申请单数量" prop="applyAmt">
              <el-input v-model="batchPrintCreateForm.applyAmt" placeholder disabled></el-input>
            </el-form-item>
            <el-form-item label="需要打印发票数量" prop="invoiceAmt">
              <el-input v-model="batchPrintCreateForm.invoiceAmt" placeholder disabled></el-input>
            </el-form-item>
            <el-form-item label="当前打印发票序号" prop="invoiceNumber">
              <el-input v-model="batchPrintCreateForm.invoiceNumber" placeholder disabled></el-input>
            </el-form-item>
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button
            type="primary"
            size="mini"
            @click="printStockAction"
            :disabled="printDisabled"
          >{{printTitle}}</el-button>
          <!-- <el-button type="primary" size="mini" @click="printAction">打印当前发票</el-button>
        <el-button size="mini" @click="printAction('next')" :disabled="invoiceReceivableIndex >= batchPrintCreateData.length - 1">打印下一张</el-button>
          <el-button size="mini" @click="printAction('prev')" :disabled="invoiceReceivableIndex <= 0">打印上一张</el-button>-->
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
    <InovicePreviewPrint
      :dialog-visible-o="dialogVisibleO"
      :customer-info="customerInfo"
      :seller-info="sellerInfo"
      :apply-item-group-list="applyItemGroupList"
      :other-invoice-info="otherInvoiceInfo"
      :isElec="singleInvoiceType"
    />
    <!-- :isPrint="true"
    @print-invoice="printInvoice"-->
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import InovicePreviewPrint from '@/views/finance/invoiceReceivable/components/invoicePreviewPrint'
import InvoiceReceivableDetail from '../components/invoiceReceivableDetail'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { printMixin } from '../components/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import {
  listPage,
  close,
  registerInvoice,
  createElectronicInvoiceBatch,
  getPaperInvoiceList,
  info,
  getListAmtSummary,
} from '@/api/fin/invoiceReceivableApply'
import Vue from 'vue'
let manualType = { manual: '手工开票', system: '系统开票' }
export default {
  mixins: [mixin, mixin2, printMixin, routerMixin],
  data() {
    return {
      pageSizeUrl: listPage('geturl'),
      keyDownActive: true,
      createElectronicLoading: false,
      singleInvoiceType: '',
      dialogVisibleO: { show: false },
      customerInfo: {},
      sellerInfo: {},
      invoiceReceivableList: [],
      applyItemGroupList: [],
      otherInvoiceInfo: {},
      option1: {},
      option2: {},
      searchOption: {},
      isAddPay: false,
      multipleSelection1: [],
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
      selectedOptionItem: '',
      dialogVisible: false,
      batchPrintCreateForm: {
        applyAmt: 0,
        invoiceAmt: 0,
        invoiceNumber: 0,
      },
      batchPrintCreateData: [],
      invoiceReceivableIndex: 0,
      dialogVisibleManualRegist: false,
      invoiceTableList: [],
      invoiceReceivableApplyId: '',
      rowData: '',
      printTitle: '打印第一张',
      printDisabled: false,
      isShowTable: true,
      rightFilterBtns: [true, false, false, false, false],
      // pageCode: 'InvoiceReceivable', // 所在页面的路由的name，勿使用this.$route.name，会影响其他页面。还是采用$route.name，因tab页如果更换地方，鉴权代码无需更改，即使其他页面不停执行，但不影响页面结果
      // 自定义表头弹框
      customColumnsPopShow: false,
      // 右侧搜索条件
      buttonSearch: '',
      selfColumnsBase: [
        {
          prop: 'invoiceReceivableApplyNo',
          label: '申请编号',
          type: 'button',
          width: 130,
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => {
              this.showDetail(row)
            },
          },
        },
        // {
        //   prop: 'settleOrderNo',
        //   label: this.$t('FeeList.settleOrderNo'),
        //   type: 'button',
        //   width: 130,
        //   operationBtns: {
        //     show: true,
        //     callback: (fn, index, row, option) => {
        //       this.showSettleOrderNoDetail(row)
        //     },
        //   },
        // },
        {
          prop: 'settleOrderNo',
          label: this.$t('FeeList.settleOrderNo'),
          type: 'columnTip',
          width: 130,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps) => {
              this.showColumnDetail({ type: 'settleOrderNos', no, componentProps })
            },
          },
        },
        {
          prop: 'sourceBizNos',
          label: '工作号',
          type: 'columnTip',
          width: 130,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps) => {
              this.showColumnDetail({
                type: 'sourceBizNo',
                no,
                componentProps,
              })
            },
          },
        },
        { prop: 'writeoffStatus', label: '结算状态', width: 80, type: 'select' },
        {
          prop: 'title',
          label: '客户发票抬头',
          type: 'text',
          width: 150,
        },
        {
          prop: 'commitStatus',
          label: '提交状态',
          width: 80,
          type: 'text',
          formatter: ({ cellValue }) => {
            if (cellValue === 'yes') {
              return '已提交'
            } else if (cellValue === 'no') {
              return '草稿'
            } else {
              return cellValue
            }
          },
        },
        {
          prop: 'invoiceApplyStatus',
          label: '开票状态',
          width: 80,
          type: 'select',
        },
        {
          prop: 'invoiceWay',
          label: '开票方式',
          width: 80,
          type: 'text',
          // formatter: (row, pItem) => manualType[row[pItem.prop]] || '',
          formatter: ({ cellValue }) => manualType[cellValue] || '',
        },
        {
          prop: 'splitNo',
          label: '发票张数',
          width: 80,
          type: 'text',
        },
        {
          prop: 'invoiceRemark',
          label: '发票备注',
          type: 'columnTip',
          width: 260,
          component: 'ColumnTip',
          componentProps: {
            firstNormal: true,
            show: false,
            data: [],
            callback: (no, componentProps, index) => {
              // console.log(componentProps)
              let row = componentProps.row
              if (index == 0 && row.splitNo > 1) return
              // 统一跳入申请详情页面
              // if (row.splitNo == 1) {
              //   this.showDetail(row, 'invoiceNo')
              //   return
              // }
              this.showDetail(row)
            },
          },
        },
        {
          prop: 'invoiceType',
          label: '发票类型',
          width: 80,
          type: 'select',
        },
        { label: '是否预收开票', type: 'select', prop: 'preInvoice', width: 100, propInDict: 'yesNo' },
        {
          prop: 'currency',
          label: '开票币种',
          width: 80,
          type: 'select',
        },
        {
          prop: 'amt',
          label: '开票总金额',
          width: 80,
          type: 'text',
        },
        {
          prop: 'taxRate',
          label: '发票税率',
          propInDict: 'taxRateInfo',
          width: 80,
          type: 'select',
        },
        {
          prop: 'invoiceNos',
          label: this.$t('FeeList.invoiceNo'),
          type: 'columnTip',
          width: 140,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps, index) => {
              let row = componentProps.row
              let invoiceReceivableIds = row.invoiceReceivableIds_multiValue
                ? row.invoiceReceivableIds_multiValue
                : row.invoiceNos_multiValue
              // let invoiceReceivableId = invoiceReceivableIds[index]
              // this.showColumnDetail({
              //   type: 'invoiceNos',
              //   no: invoiceReceivableId,
              //   componentProps,
              // })
              this.previewInvoiceFromList(invoiceReceivableIds[index])
            },
          },
        },
        {
          prop: 'settleCorpName',
          label: this.$t('FeeList.settleCorp'),
          width: 150,
          type: 'text',
        },
        { prop: 'taxNo', label: '客户纳税人识别号', type: 'text', width: 130 },
        { prop: 'bankName', label: '客户银行名称', type: 'text', width: 130 },
        { prop: 'accountNo', label: '客户银行账号', type: 'text', width: 130 },
        { prop: 'saleCompTitle', label: '我司发票抬头', type: 'text', width: 150 },
        { prop: 'taxpayerNo', label: '我司纳税人识别号', type: 'text', width: 130 },
        { prop: 'saleCompBankName', label: '我司银行名称', type: 'text', width: 130 },
        { prop: 'saleCompAccountNo', label: '我司银行账号', type: 'text', width: 130 },
        { prop: 'emailAddrs', label: '客户邮箱', type: 'text', width: 130 },
        { prop: 'createdName', label: this.$t('Settle.applicant'), width: 100, type: 'text' },
        { prop: 'createdTime', label: this.$t('Settle.applicationDate'), type: 'text', width: 130 },
        { prop: 'updatedName', label: '更新人', width: 100, type: 'text' },
        { prop: 'updatedTime', label: '更新时间', type: 'text', width: 130 },
      ],
      cTimestamp: 0,
    }
  },
  watch: {
    dialogVisible(val) {
      // 关闭打印弹框时，只要有打印记录，就刷新页面
      if (!val && this.invoiceReceivableIndex) {
        this.getData()
      }
    },
  },
  created() {
    let searchArr = ['allNo', 'invoiceWay', 'invoiceApplyStatus', 'currency', 'amt', 'settleCorpCode', 'createdTime']
    this.searchOption = {
      saveShow: true,
      saveName: 'invoiceReceivableApplyList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 7,
        searchInputGroup: searchArr.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          allNo: { label: this.$t('Hedge.variousNumbers'), type: 'input' },
          invoiceReceivableApplyNo: { label: '申请编号', type: 'input' },
          settleOrderNo: { label: this.$t('FeeList.settleOrderNo'), type: 'input' },
          sourceBizNo: { label: '工作号', type: 'input' },
          writeoffStatus: { label: '结算状态', type: 'select', multiple: true, prop: 'writeoffStatus' },
          invoiceNo: { label: this.$t('FeeList.invoiceNo'), type: 'input' },
          // invoiceApplyStatus: { label: '开票状态', type: 'select', prop: 'invoiceApplyStatus' }, // 下面右侧已有该状态选项
          invoiceWay: { label: '开票方式', type: 'select', prop: 'invoiceWay' },
          invoiceType: { label: '发票类型', type: 'select', multiple: true, prop: 'invoiceType' },
          bankName: { label: '客户银行名称', type: 'input' },
          accountNo: { label: '客户银行账号', type: 'input' },
          emailAddrs: { label: '客户邮箱', type: 'input' },
          saleCompBankName: { label: '我司银行名称', type: 'input' },
          saleCompAccountNo: { label: '我司银行账号', type: 'input' },
          preInvoice: { label: '是否预收开票', type: 'select', prop: 'yesNo' },
          currency: {
            label: '开票币种',
            type: 'select',
            selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'),
          },
          splitNo: { label: '发票张数', type: 'input' },
          amt: { label: '开票总金额', type: 'range' },
          taxRate: { label: '发票税率', type: 'select', prop: 'taxRateInfo' },
          settleCorpCode: {
            label: this.$t('FeeList.settleCorp'),
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString }, item)
            },
            remoteSelectList: [],
          },
          title: { label: '客户发票抬头', type: 'input' },
          taxNo: { label: '客户纳税人识别号', type: 'input' },
          saleCompTitle: { label: '我司发票抬头', type: 'input' },
          taxpayerNo: { label: '我司纳税人识别号', type: 'input' },
          createdBy: {
            label: this.$t('Settle.applicant'),
            type: 'remoteSelect',
            showType: '6',
            remote: true,
            remoteMethod: (queryString, item, row) => {
              this.getEmployeeList(queryString, item)
            },
            visibleChange: (queryString, item, row) => {
              this.getEmployeeList(queryString, item)
            },
            remoteSelectList: [],
          },
          commitStatus: {
            label: '提交状态',
            type: 'select',
            selectOptions: [
              { label: '已提交', value: 'yes' },
              { label: '草稿', value: 'no' },
            ],
          },
          createdTime: { label: this.$t('Settle.applicationDate'), type: 'daterange', format: 'yyyy-MM-dd' },
          updatedBy: {
            label: '更新人',
            type: 'remoteSelect',
            remote: true,
            remoteMethod: (queryString, item, row) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item, row) => this.getEmployeeList('', item),
            remoteSelectList: [],
          },
          updatedTime: { label: '更新时间', type: 'daterange', format: 'yyyy-MM-dd' },
          invoiceApplyStatus: { label: '开票状态', type: 'select', prop: 'invoiceApplyStatus', multiple: true },
        },
      },
    }

    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: this.$t('Common.details'),
          type: 'text',
          show: true,
          action: 'showDetail',
        },
      ],
    })
    if (!this.checkAuth(this.$route.name, 'tab-invoiceReceivableApplyList', 'btn-detail')) operationBtns = false
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
      $name: 'invoiceReceivableApplyList1',
      data: [...this.option.data],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      pagination,
      listAmtSummary,
      emptyText: this.$t('Common.emptyText'),
      colorColumns: ['invoiceApplyStatus'],
    })
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.option1.columns = [...this.selfColumnsBase]
    this.cTimestamp = new Date().getTime()
    // TODO 搜索保存功能，首次加载自动搜索
    // this.getData()
  },
  // 路由通用beforeRouteEnter守卫已经处理
  // activated() {
  //   let timestamp = new Date().getTime()
  //   // console.log('isUseCache:', this.$route.meta.isUseCache)
  //   if ((!this.$route.meta.isUseCache || this.$route.meta.refresh) && timestamp - this.cTimestamp > 500) {
  //     console.log('```````````````````222222')
  //     this.handleCurrentChange(1)
  //   }
  // },
  methods: {
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    // 电子票生成
    createElectronicInvoiceBatch() {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose('请勾选需要生成电子票的项！')
      }
      let arr = this.multipleSelection1.filter((item) => item.invoiceStatus !== 'yes' && item.cancelStatus !== 'yes')
      if (!arr.length) {
        return this.$msgErrClose('所选项已是关闭状态或已生成发票')
      }
      arr = this.multipleSelection1.filter((item) => item.invoiceType === 'electronic')
      if (!arr.length) {
        return this.$msgErrClose('请选择发票类型为电子发票的选项')
      }
      this.createElectronicLoading = true
      let invoiceReceivableApplyIds = arr.map((item) => item.invoiceReceivableApplyId)
      createElectronicInvoiceBatch({ invoiceReceivableApplyIds })
        .then((res) => {
          this.$msgSucClose('生成电子票成功！')
          this.getData()
        })
        .finally(() => (this.createElectronicLoading = false))
    },
    // 手填发票
    manualRegistInvoice() {
      let selectionRows = this.multipleSelection1
      let len = selectionRows.length
      if (len !== 1) {
        return this.$msgErrClose(len ? '一次只能选择一个申请编号！' : '请选择需要手填发票的申请项！')
      }
      let selectionRow = this.multipleSelection1[0]
      if (selectionRow.commitStatus === 'no') {
        return this.$msgErrClose('草稿状态不能进行手填发票！')
      }
      if (selectionRow.invoiceApplyStatus === 'all_invoice' || selectionRow.invoiceApplyStatus === 'close') {
        return this.$msgErrClose('所选项已全部开票或已关闭！')
      }
      if (selectionRow.invoiceWay !== 'manual') {
        return this.$msgErrClose('须为手工开票才能进行手填发票！')
      }
      this.routerPush('ManualRegistInvoice', { row: JSON.stringify(selectionRow) }, true)
    },
    // 关闭申请
    closeAction() {
      if (this.multipleSelection1.length === 0) {
        return this.$message({
          message: '请勾选需要关闭申请的项！',
          type: 'error',
          showClose: true,
        })
      }
      let arr = this.multipleSelection1.filter((item) => item.invoiceApplyStatus == 'no_invoice')
      if (!arr.length) {
        return this.$message({
          message: '所选项已开票或已关闭状态！',
          type: 'error',
          showClose: true,
        })
      }
      this.btnLoading1 = true
      close({ invoiceReceivableApplyIds: arr.map((item) => item.invoiceReceivableApplyId) })
        .then((res) => {
          this.$message({
            message: '关闭申请成功！',
            type: 'success',
            showClose: true,
          })
          this.getData()
        })
        .finally(() => (this.btnLoading1 = false))
      // Promise.all(arr.map((item) => close({ invoiceReceivableApplyId: item.invoiceReceivableApplyId }))).then((res) => {
      //   this.$message({
      //     message: '关闭申请成功！',
      //     type: 'success',
      //     showClose: true,
      //   })
      //   this.getData()
      // })
    },
    // 批量打印
    batchPrintCreate() {
      let selectionRows = this.multipleSelection1
      if (selectionRows.length === 0) {
        return this.$message({
          message: '请勾选需要批量打印的项！',
          type: 'error',
          showClose: true,
        })
      }
      selectionRows = selectionRows.filter((item) => item.commitStatus !== 'no')
      if (!selectionRows.length) {
        return this.$message({
          message: '草稿状态不能进行系统打印',
          type: 'error',
          showClose: true,
        })
      }
      selectionRows = selectionRows.filter(
        (item) => item.invoiceApplyStatus !== 'all_invoice' && item.invoiceApplyStatus !== 'close'
      )
      if (!selectionRows.length) {
        return this.$message({
          message: '所选项已全部开票或已关闭',
          type: 'error',
          showClose: true,
        })
      }
      selectionRows = selectionRows.filter((item) => item.invoiceType !== 'electronic' && item.invoiceWay !== 'manual')
      if (!selectionRows.length) {
        return this.$message({
          message: '电子发票或手工开票，不支持系统打印',
          type: 'error',
          showClose: true,
        })
      }
      let arr = [...new Set(selectionRows.map((v) => v.settleCompCode))]
      if (arr.length > 1) {
        return this.$msgErrClose('开票打印只能选择相同的分公司！')
      }
      console.log(arr)
      let invoiceReceivableApplyIds = selectionRows.map((item) => item.invoiceReceivableApplyId)
      this.btnLoading = true
      getPaperInvoiceList({ invoiceReceivableApplyIds })
        .then((res) => {
          // res.data [{}]
          // invoiceReceivableApplyId: 36
          // invoiceReceivableId: 30
          // invoiceType: "ordinary"
          this.batchPrintCreateData = res.data
          let invoiceReceivableApplyIdArr = res.data.map((item, index) => item.invoiceReceivableApplyId)
          // let invoiceReceivableApplyIdArr = res.data.map((item, index) => +index + item.invoiceReceivableApplyId)
          invoiceReceivableApplyIdArr = [...new Set(invoiceReceivableApplyIdArr)]
          this.batchPrintCreateForm.applyAmt = invoiceReceivableApplyIdArr.length
          this.batchPrintCreateForm.invoiceAmt = res.data.length
          this.batchPrintCreateForm.invoiceReceivableId = this.batchPrintCreateData[0].invoiceReceivableId
          this.invoiceReceivableIndex = 0
          this.printTitle = '打印第一张'
          // console.log(this.batchPrintCreateForm)
          // console.log(invoiceReceivableApplyIdArr)
          if (!arr[0]) {
            return this.$msgErrClose('缺少分公司信息！')
          }
          this.queryStockAction(this.stockInitRow, this.stockOk, this.stockErr, arr[0])
        })
        .finally(() => (this.btnLoading = false))
    },
    stockInitRow() {
      this.rowData = this.batchPrintCreateData[this.invoiceReceivableIndex]
      console.log(this.rowData)
    },
    stockOk(data) {
      // TODO 打印发票号，
      this.batchPrintCreateForm.invoiceNumber = data.invoiceNumber
      // this.batchPrintCreateForm.invoiceNumber = data.invoiceNumber + this.invoiceReceivableIndex
      this.printDisabled = false
      this.dialogVisible = true
    },
    stockErr() {
      this.printDisabled = true
    },
    printReview() {
      this.invoiceReceivableIndex++
      this.printTitle = this.invoiceReceivableIndex ? '继续打印' : '打印第一张'
      if (this.invoiceReceivableIndex >= this.batchPrintCreateData.length) {
        this.printDisabled = true
        // this.$nextTick(() => {
        //   this.$message({
        //     message: '打印完毕！',
        //     type: 'success',
        //     showClose: true,
        //   })
        // })
        this.dialogVisible = false
        // this.getData()
      } else {
        this.queryStockAction(this.stockInitRow, this.stockOk, this.stockErr)
      }
    },
    // 打印按钮
    printStockAction() {
      this.printStock(this.printReview)
    },
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        columns: [],
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption, true, 'rangeMinMax')
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      data.query.push({ column: 'confirmStatus', type: 'eq', value: 'pass' })
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
          let { data } = res
          this.option1.data = data.list.map((item) => {
            item.invoiceNo_multiValue = item.invoiceNo.split(',')
            item.settleOrderNo_multiValue = item.settleOrderNo.split(',')
            item.invoiceNos_multiValue = item.invoiceNos.split(',').map((subItem) => {
              let arr = subItem.split('/')
              return arr[1] ? arr[1] : arr[0]
            })
            item.invoiceReceivableIds_multiValue = item.invoiceNos.split(',').map((subItem) => {
              let arr = subItem.split('/')
              return arr[0]
            })
            item.sourceBizNos_multiValue = (item.sourceBizNos || '').split(',')
            if (item.splitNo == 1) {
              item.invoiceRemark_multiValue = [item.invoiceRemark]
            } else if (item.splitNo > 1 && item.invoiceRemark) {
              item.invoiceRemark_multiValue = [item.invoiceRemark, '存在多张发票请查看详情！']
            }
            return item
          })
          // this.option1.data = data.list
          this.$set(this.option1, 'emptyText', this.$t('Common.noData'))
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = data.currPage
          // this.option1.pagination.pageSize = data.pageSize
          // this.option1.pagination.totalCount = data.totalCount
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
            invoiceApplyAmtList: [],
          }
          data = Object.assign(data, res.data)
          let labelObj = {
            invoiceApplyAmtListLabel: '开票金额',
          }
          let colorObj = {
            invoiceApplyAmtListColor: 'red', // 支持red, green, black三种值
          }
          for (let key in data) {
            let value = data[key]
            value.forEach((item) => {
              if (item.currency === 'original') {
                item.currency = this.$t('Settle.orignalCurrency')
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
    sendMulti(data) {
      this.multipleSelection1 = data

      let data2 = {
        ascColumns: [],
        descColumns: [],
        query: [],
      }
      let ids = this.multipleSelection1
        .map((item) => {
          return item.invoiceReceivableApplyId
        })
        .join(',')
      if (ids) {
        data2.query.push({
          column: 'invoiceReceivableApplyIds',
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
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    showDetail(row, type) {
      console.log(row)
      Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
        this.commonRoute(to, from)
      }
      // 未提交且未关闭，进入申请页面，其它进入详情页面
      if (row.commitStatus === 'no' && row.invoiceApplyStatus !== 'close') {
        let query = {
          source: 'draft',
          invoiceReceivableApplyId: row.invoiceReceivableApplyId,
        }
        this.routerPush('InvoiceReceivableApply', query)
        // } else if (type === 'invoiceNo') {
        // this.routerPush('InvoiceReceivableDetail', { source: 'detail', invoiceNo: row.invoiceNo })
      } else {
        let query = {
          source: 'apply',
          invoiceReceivableApplyId: row.invoiceReceivableApplyId,
        }
        this.routerPush('InvoiceReceivableApplyDetail', query)
      }
    },
    showColumnDetail(params) {
      if (params.type === 'invoiceNos') {
        params.receipayType = 'receive'
      }
      this.showColumnDetailHandle(params, { isTab: true })
    },
    showInvoiceDetail(row, no) {
      Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
        this.commonRoute(to, from)
      }
      let query = {
        source: 'detail',
        invoiceNo: no,
      }
      this.routerPush('InvoiceReceivableDetail', query)
    },
    showSettleOrderNoDetail(row, no) {
      Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
        this.commonRoute(to, from)
      }
      this.showOneNoDetail('settleOrderNo', row.settleOrderNo)
    },
    prerevApply() {
      Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
        this.commonRoute(to, from)
      }
      this.routerPush('InvoicePrerevApply')
    },
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    InvoiceReceivableDetail,
    CustomColumns,
    InovicePreviewPrint,
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
</style>
