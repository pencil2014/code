<template>
  <div class="finance-tab-page">
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
              v-if="checkAuth($route.name, 'tab-baddeList', 'btn-pass')"
              @click="auditBatchFn('pass')"
              class="finance-btn"
              size="mini"
              type="success"
              :loading="btnLoading"
            >{{$t('Settle.approved')}}</el-button>
            <el-button
              v-if="checkAuth($route.name, 'tab-baddeList', 'btn-refuse')"
              @click="auditBatchFn('reject')"
              class="finance-btn"
              size="mini"
              type="danger"
            >{{$t('Settle.refuseApproval')}}</el-button>
            <el-button
              v-if="checkAuth($route.name, 'tab-baddeList', 'btn-badApplyCancel')"
              class="finance-btn"
              @click="badApplyCancel"
              size="mini"
              type="purple"
              :loading="btnLoading1"
            >{{$t('Hedge.gedgingCancel')}}</el-button>
            <el-button-group>
              <div
                v-if="checkAuth($route.name, 'tab-baddeList', 'btn-export')"
                class="finance-btn select-template-box"
              >
                <el-dropdown trigger="click" @command="handleCommand">
                  <span class="el-dropdown-link">{{$t('Common.export')}}<i class="el-icon-arrow-down el-icon--right"></i></span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      v-for="(item, index) in exportTypeList"
                      :key="'exportTypeList' + index"
                      :command="item.value"
                    >{{item.label}}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </el-button-group>
            <!-- <el-button
              v-if="checkAuth($route.name, 'tab-baddeList', 'btn-export')"
              class="finance-btn"
              @click="prevHandle('handleExport')"
              size="mini"
              type="primary"
            >{{$t('Common.export')}}</el-button> -->
          </div>
          <div class="money-box-right">
            <!-- v-if="checkAuth($route.name, 'tab-VS1', 'btn-add')"  -->
            <el-button
              v-if="checkAuth($route.name, 'tab-baddeList', 'btn-unlock')"
              @click="writeoffOP('unlock')"
              class="finance-btn"
              size="mini"
            >{{$t('Hedge.cancelReview')}}</el-button>
            <el-button
              v-if="checkAuth($route.name, 'tab-baddeList', 'btn-reverse')"
              @click="writeoffOP('reverse')"
              class="finance-btn"
              size="mini"
            >{{$t('Hedge.antiWriteOff')}}</el-button>
            <el-button
              v-if="checkAuth($route.name, 'tab-baddeList', 'btn-confirmWriteoff')"
              @click="writeoffOP('confirmWriteoff')"
              class="finance-btn"
              size="mini"
            >{{$t('Hedge.writeoffReview')}}</el-button>
            <el-button
              v-if="checkAuth($route.name, 'tab-baddeList', 'btn-voucherView')"
              @click="generateVoucher(true)"
              class="finance-btn"
              size="mini"
            >{{$t('Common.previewVoucher')}}</el-button>
            <el-button
              v-if="checkAuth($route.name, 'tab-baddeList', 'btn-voucherCreate')"
              @click="generateVoucher"
              class="finance-btn"
              size="mini"
            >{{$t('Common.generateVouchers')}}</el-button>
            <el-button
              v-if="checkAuth($route.name, 'tab-baddeList', 'btn-voucherDel')"
              @click="delVoucher"
              class="finance-btn"
              size="mini"
              type="danger"
            >{{$t('Common.deleteVoucher')}}</el-button>
            <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
          </div>
        </div>
        <FinanceTable :option="option1" @send-multi="sendMulti" />
      </div>
    </div>
    <PreviewDialog
      ref="PreviewDialog"
      :dialogOption="previewDialog"
      @generate="generateVoucher"
      :showDel="checkAuth($route.name, 'tab-baddeList', 'btn-voucherDel')"
      :showCreate="checkAuth($route.name, 'tab-baddeList', 'btn-voucherCreate')"
    />
    <el-dialog :visible.sync="rejectDialogVisible" :title="$t('Charge.rejectReasons')" width="600px">
      <el-form :model="rejectForm" label-width="130px" ref="rejectForm" label-suffix=":">
        <el-form-item
          :rules="{
						required: true,
						message: $t('Hedge.rejectionEmp'),
						trigger: 'blur',
					}"
          :label="$t('Settle.reject')"
          prop="refuseReason"
        >
          <el-input style="width: 400px" type="textarea" v-model="rejectForm.refuseReason"></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button :loading="btnLoading" @click="auditBatchReject" size="mini" type="primary">{{$t('Common.sure')}}</el-button>
        <el-button @click="closeRejectDialog" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{key:'prop',label:'label'}"
        @close="customColumnsPopClose"
      />
    </div>
    <AuditTableDialog :isDialog="true" :isShow.sync='logDialogShow' :settleOrderBaddebtId="logSettleOrderBaddebtId"/>
    <el-dialog
      :title="$t('Hedge.latePaymentFee')"
      :visible.sync="lateFeeVisible"
      :close-on-click-modal="false"
      width="800px">
      <FinanceTable
        :option="option13" />
      <span slot="footer" class="dialog-footer">
        <!-- <el-button @click="handleLateFee" size="mini" type="primary">立即处理</el-button>因为最后审批人不一定是财务，业务条线的人没有权限处理滞纳金，所以此处先去掉【立即处理】按钮 -->
        <el-button @click="lateFeeVisible = false" size="mini">{{$t('Common.close')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import AuditTableDialog from './receiLossAuditLog'
import settleOrderBadDetail from './settleOrderBadDetail'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import {
  listPage,
  unlock,
  reverse,
  confirmWriteoff,
  auditBatch,
  getListAmtSummary,
  badApplyCancel,
} from '@/api/fin/settleOrderBaddebt'
import { nopayWriteOffGenerate, voucherDelete } from '@/api/fin/voucher'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import { dateFormat } from '@/views/finance/utils/finance'
import { listByWriteoffNo } from '@/api/fin/custOverduePayment'

export default {
  name: 'settleOrderBaddebtList',
  mixins: [mixin, mixin2, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    settleOrderBadDetail,
    PreviewDialog,
    CustomColumns,
    AuditTableDialog,
  },
  data() {
    return {
      pageSizeUrl: listPage('geturl'),
      keyDownActive: true,
      logSettleOrderBaddebtId:'',
      // 列表页--表格配置
      option1: {},
      option13: {},
      // 列表页--搜索配置
      searchOption1: {},
      // 列表页--选中行
      multipleSelection1: [],
      // 列表页--动态组件--当前显示的组件
      currentComponent: '',
      // 传递给详情页的参数 行
      source: '',
      currentsettleOrderNo: '',
      previewDialog: {
        show: false,
        title: this.$t('Common.previewVoucher'),
        seqNo: '',
        seqNos: '',
        showData: [],
      },
      exportTypeList: [
        { label: this.$t('Charge.exportListData'), value: 'listData' },
        { label: this.$t('Charge.exportDetailData'), value: 'listDetail' },
      ],
      rejectDialogVisible: false,
      // 拒绝弹框表单
      rejectForm: {
        refuseReason: '',
      },
      // 自定义表头弹框
      customColumnsPopShow: false,
      // 右侧搜索条件
      buttonSearch: '',
      logDialogShow: false,
      selfColumnsBase: [
        {
          prop: 'settleOrderBaddebtNo',
          label: this.$t('Charge.applicationNo'),
          width: '150px',
          type: 'button',
          width: 130,
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => {
              this.$emit('update:isJumpRouteFromPage', true)
              this.routerPush('BadApplyDetail', {
                settleOrderNo: row.settleOrderNo,
                settleOrderBaddebtId: row.settleOrderBaddebtId,
                settleOrderBaddebtNo: row.settleOrderBaddebtNo,
              })
              // let dealWay = row.dealWay === 'deduction_of_profit'
              // if (dealWay) {
              // 	this.routerPush('SettleOrderBadDetail', { source: 'detail', settleOrderNo: row.settleOrderNo, settleOrderBaddebtId: row.settleOrderBaddebtId })
              // } else {
              // 	this.routerPush('BadOrderDetail', { settleOrderBaddebtNo: row.settleOrderBaddebtNo })
              // }
            },
          },
        },
        {
          prop: 'writeoffNopayNo',
          label: this.$t('Hedge.writeoffNo'),
          type: 'button',
          width: 138,
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => {
              this.showDetail(row)
            },
          },
        },
        {
          prop: 'settleCorpName',
          label:  this.$t('FeeList.settleCorp'),
          type: 'text',
          width: 160,
        },
        {
          prop: 'settleCompName',
          label:  this.$t('FeeList.settleComp'),
          type: 'text',
          width: 160,
        },
        {
          prop: 'settleOrderNo',
          label:  this.$t('FeeList.settleOrderNo'),
          // type: 'button',
          // width: 150,
          // operationBtns: {
          //   show: true,
          //   callback: (fn, index, row, option) => {
          //     this.$emit('update:isJumpRouteFromPage', true)
          //     this.routerPush('SettlementDetail', {
          //       source: 'settlementDetail',
          //       settleOrderNo: row.settleOrderNo,
          //     })
          //   },
          // },
          type: 'columnTip',
          width: 130,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps) => {
              this.showOneNoDetail('settleOrderNo', no, { isTab: true })
            }
          }
        },
        {
          prop: 'voucherNo',
          label:  this.$t('Hedge.voucherNumber'),
          type: 'button',
          width: 130,
          operationBtns: {
            show: true,
            callback: (action, index, row) => {
              this.initShowVoucher(this.previewDialog, row.acctVoucherSeqno, '', '')
              // this.previewDialog.showData = ''
              // this.previewDialog.seqNos = ''
              // this.previewDialog.seqNo = row.acctVoucherSeqno
              // this.previewDialog.show = true
            },
          },
        },
        {
          prop: 'voucherStatus',
          label:  this.$t('Hedge.voucherStatus'),
          formatter: ({ row }) => (row.voucherNo ? this.$t('Common.generated') : this.$t('Common.notGenerated')),
        },
        {
          prop: 'settleCycle',
          label:  this.$t('Settle.settleCycle'),
          type: 'select',
          width: 80,
          propInDict: 'settleCycle',
        },
        {
          prop: 'badType',
          label:  this.$t('Charge.elimination'),
          width: 100,
          type: 'select',
        },
        {
          prop: 'dealWay',
          label:  this.$t('Common.processing'),
          width: 80,
          type: 'select',
          propInDict: 'baddebtDealWay',
        },
        {
          prop: 'badReason',
          label:  this.$t('Charge.debtsReasons'),
          width: 130,
          type: 'select',
          propInDict: 'baddebtReason',
        },
        {
          prop: 'remark',
          label:  this.$t('Common.remark'),
          width: 130,
          type: 'text',
        },
        {
          prop: 'refuseReason',
          label:  this.$t('Settle.reject'),
          width: 130,
          type: 'text',
        },
        {
          prop: 'witeoffSumRemark',
          label:  this.$t('Charge.eliminationAmt'),
          width: 100,
          type: 'text',
        },
        {
          prop: 'createdName',
          label:  this.$t('Settle.applicant'),
          width: 100,
          type: 'text',
        },
        {
          prop: 'createdTime',
          label:  this.$t('Settle.applicationDate'),
          width: 100,
          type: 'text',
        },
        {
          prop: 'auditName',
          label:  this.$t('Charge.currentReviewer'),
          type: 'text',
        },
        {
          prop: 'writeoffName',
          label:  this.$t('Hedge.writeoffs'),
          width: 100,
          type: 'text',
        },
        {
          prop: 'writeoffTime',
          label:  this.$t('Hedge.writeoffTime'),
          width: 130,
          type: 'text',
        },
        {
          prop: 'writeoffDate',
          label:  this.$t('FeeList.writeOffDate'),
          width: 130,
          type: 'text',
        },
        {
          prop: 'auditStatus',
          label:  this.$t('FinBill.approvalResult'),
          width: 80,
          type: 'select',
          propInDict: 'auditStatus',
        },
        {
          prop: 'recheckStatus',
          label:  this.$t('Hedge.reviewStatus'),
          width: 80,
          type: 'select',
          propInDict: 'writeoffRecheckStatus',
        },
        {
          prop: 'recheckName',
          label:  this.$t('Hedge.reviewer'),
          width: 100,
          type: 'text',
        },
        {
          prop: 'writeoffReverseNo',
          label:  this.$t('Hedge.writeoffReverseNo'),
          type: 'text',
          width: 125,
        },
      ],
      exportLoading: false,
      lateFeeVisible: false,
    }
  },
  watch: {
    'previewDialog.show'(val) {
      !val && this.previewDialog._refresh && this.getData()
      this.previewDialog._refresh = false
    },
  },
  created() {
    let searchArr = ['settleOrderBaddebtNo', 'sourceBizNos', 'auditStatus', 'dealWay', 'settleCorpCode', 'createdTime']
    this.searchOption1 = {
      saveDefault: true,
      saveName: 'badApplyList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 6,
        searchInputGroup: searchArr.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          allNo: { label: this.$t('Hedge.variousNumbers'), type: 'input' },
          settleOrderBaddebtNo: { label: this.$t('Charge.applicationNo'), type: 'input' },
          sourceBizNos: { label: this.$t('FeeList.sourceBizNo'), type: 'input', placeholder: this.$t('FeeList.placeholder')},
          writeoffNopayNo: { label: this.$t('Hedge.writeoffNo'), type: 'input' },
          settleOrderNo: { label: this.$t('FeeList.settleOrderNo'), type: 'input' },
          auditStatus: { label: this.$t('FinBill.approvalResult'), type: 'select', prop: 'auditStatus' },
          settleCycle: { label: this.$t('Settle.settleCycle'), type: 'select', prop: 'settleCycle' },
          dealWay: { label: this.$t('Common.processing'), type: 'select', prop: 'baddebtDealWay' },
          badReason: { label: this.$t('Charge.debtsReasons'), type: 'select', prop: 'baddebtReason' },
          settleCorpCode: {
            label: this.$t('FeeList.settleCorp'),
            type: 'remoteSelect',
            remote: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString }, item)
            },
            remoteSelectList: [],
          },
          settleCompCode: {
            label: this.$t('FeeList.settleComp'),
            prop: 'settleCompCode',
            type: 'remoteSelect',
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            remoteSelectList: [],
          },
          createdBy: {
            label: this.$t('Settle.applicant'),
            type: 'remoteSelect',
            remoteMethod: (queryString, item, row) => {
              this.getEmployeeList(queryString, item)
            },
            visibleChange: (queryString, item, row) => {
              this.getEmployeeList(queryString, item)
            },
            remoteSelectList: [],
          },
          createdTime: { label: this.$t('Settle.applicationDate'), type: 'daterange', format: 'yyyy-MM-dd', ranges: ['createdBeginDate', 'createdEndDate'] },
          auditId: {
            label: this.$t('FinBill.approverName'),
            type: 'remoteSelect',
            remoteMethod: (queryString, item, row) => {
              this.getEmployeeList(queryString, item)
            },
            visibleChange: (queryString, item, row) => {
              this.getEmployeeList(queryString, item)
            },
            remoteSelectList: [],
          },
          writeoffDate: {
            label: this.$t('FinBill.approveEndTime'),
            type: 'daterange',
            format: 'yyyy-MM-dd',
            ranges: ['writeoffBeginDate', 'writeoffEndDate'],
          },
          voucherStatus: { label: this.$t('Hedge.voucherStatus'), type: 'select', prop: 'voucherStatus' },
          voucherNo: { label: this.$t('Hedge.voucherNumber'), type: 'input' },
        },
      },
    }
    // 表格配置
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      width: 150,
      data: [
        {
          label: this.$t('Common.approvalLog'),
          type: 'text',
          showFn: () => this.checkAuth('SettleOrderBaddebtList', 'tab-baddeList', 'btn-badAuditLog'),
          action: 'log',
        },
        {
          label: this.$t('Common.details'),
          type: 'text',
          show: true,
          action: 'showDetail',
        },
      ],
      show: true,
      callback: (action, $index, row, option) => {
        if (action === 'showDetail') {
          this.routerPushTab('BadApplyDetail', { settleOrderNo: row.settleOrderNo, settleOrderBaddebtId: row.settleOrderBaddebtId, })
          // this.$emit('update:isJumpRouteFromPage', true)
          // this.routerPush('BadApplyDetail', {
          //   settleOrderNo: row.settleOrderNo,
          //   settleOrderBaddebtId: row.settleOrderBaddebtId,
          // })
        } else {
          this.logSettleOrderBaddebtId = row.settleOrderBaddebtId
          this.logDialogShow = true
        }
      },
    })
    // if (!this.checkAuth(this.$route.name, 'tab-baddeList', 'btn-detail')) operationBtns = false
    const pagination = { ...this.option.pagination, show: true, isNew: true}
    const listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    this.option1 = {
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
      ...this.option,
      id: 'option1',
      $name: 'baddeList',
      operationBtns,
      pagination,
      listAmtSummary,
      emptyText: this.$t('Common.emptyText'),
      needTimeSort: true,
    }
    let columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.option1.columns = columns
    this.option13 = Object.assign({}, this.option, {
      id: 'option13',
      $name: 'baddeList13',
      data: [],
      index: { show: true },
      tips: false,
      rootTipsHide: true,
      selection: false,
      operationBtns: Object.assign({}, this.option.operationBtns, {
        show: false
      }),
    })
    this.option13.columns = [
      { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), minWidth: 150, type: 'text' },
      { prop: 'currency', label: this.$t('FeeList.currency'), type: 'text' },
      { prop: 'arrearReceiveAmt', label: this.$t('Hedge.arrearReceiveAmt'), type: 'text' },
      { prop: 'lateFeeAmt', label: this.$t('Hedge.lateFeeAmt'), type: 'text' },
      { prop: 'custOverduePaymentNo', label: this.$t('Hedge.custOverduePaymentNo'), type: 'button',
        operationBtns: {
          show: true,
          callback: (action, $index, row, option) => {
            this.routerPushTab('LateFeeDetail', {
              custOverduePaymentNo: row.custOverduePaymentNo
            })
          },
        }
      },
    ]
    // 和默认获取搜索条件冲突，在此处调用会取消获取搜索条件后请求列表数据
    // this.getData()
  },
  methods: {
    // 批量审批
    auditBatchFn(status) {
      const len = this.multipleSelection1.length
      if (!len) {
        return this.$msgErrClose(this.$t('Charge.approvedTips'))
      }
      const auditStatus = this.multipleSelection1.some((item) => item.auditStatus !== 'pending' && item.auditStatus !== 'approving')
      if (auditStatus) {
        return this.$msgErrClose(this.$t('Charge.reviewedTips'))
      }
      if (status === 'reject') {
        this.rejectDialogVisible = true
      } else {
        this.auditBatchPass()
      }
    },
    // 审批通过
    auditBatchPass() {
      const settleOrderBaddebtIds = this.multipleSelection1.map((item) => item.settleOrderBaddebtId)
      const data = {
        settleOrderBaddebtIds,
        auditType: 'pass',
      }
      this.btnLoading = true
      auditBatch(data)
        .then((res) => {
          this.btnLoading = false
          if (res.code === 0) {
            this.getData()
            this.$msgSucClose(this.$t('Charge.processSuc'))
            if (res.data && res.data.length) {
              this.queryLateFeeByWriteoffNo(res.data.join(','))
            }
          }
        })
        .catch(() => {
          this.btnLoading = false
        })
    },
    queryLateFeeByWriteoffNo(writeoffReceipayNo) {
      let data = {
        writeoffReceipayNo // : 'SZCZAP2211000524'
      }
      listByWriteoffNo(data).then(res => {
        this.option13.data = res.data || [] // [{custOverduePaymentNo:'ZNJ202211090089'}]
        if (this.option13.data.length) {
          this.lateFeeVisible = true
        }
      })
    },
    handleLateFee() {
      this.routerPushTab('FiscalTermList', {
        tabFromOther: 'lateFeeList',
        custOverduePaymentNo: this.option13.data.map(item => item.custOverduePaymentNo).join(',')
      })
    },
    // 审批拒绝
    auditBatchReject() {
      this.$refs['rejectForm'].validate((valid) => {
        if (valid) {
          const settleOrderBaddebtIds = this.multipleSelection1.map((item) => item.settleOrderBaddebtId)
          const data = {
            settleOrderBaddebtIds,
            auditType: 'refuse',
            refuseReason: this.rejectForm.refuseReason,
          }
          this.btnLoading = true
          auditBatch(data)
            .then((res) => {
              this.btnLoading = false
              if (res.code === 0) {
                this.getData()
                this.$msgSucClose(this.$t('Charge.denialSuc'))
                this.closeRejectDialog()
              }
            })
            .catch(() => {
              this.btnLoading = false
            })
        }
      })
    },
    // 关闭拒绝弹窗
    closeRejectDialog() {
      this.rejectDialogVisible = false
      this.$refs.rejectForm.resetFields()
    },
    // 分页页面数量change   有分页必写此方法
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    // 分页改变当前页   有分页必写此方法
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    // 获取结算单位 autocomplete
    querySettleUnit(queryString, cb) {
      this.$store.dispatch('dict/querySettleUnit', queryString).then((data) => {
        cb(data)
      })
    },
    // 搜索按钮
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    // 封装请求参数并请求列表
    getData(isSearch, param = {}) {
      this.isNotFirtGetData = true
      let customerList = param === true
      if (this.debounceLsFn()){ return Promise.resolve()}
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        query: [],
      }
      data.columns = this.option1.columns.map(item => item.prop)
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption1, true, true)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      let { isExport } = param
      if (isExport) {
        data = JSON.parse(JSON.stringify(data))
        if(this.multipleSelection1.length){
          data.query.push({"column": "settleOrderBaddebtNo", "type": "in", "value": this.multipleSelection1.map(v => v.settleOrderBaddebtNo).toString()})
        }
        let msg = this.$t('Charge.eliminationList')
        let obj = {"column": "queryDataModuleCode", "type": "eq", "value": "baddebtApplyListExport"}
        if(param.isDetail){
          msg = this.$t('Charge.eliminationDetail')
          obj = {"column": "queryDataModuleCode", "type": "eq", "value": "baddebtDetailListExport"}
          data.columns = [
            // "sourceBizNo",
            // "settleOrderNo",
            // "settleOrderBaddebtNo",
            // "settleCorpName",
            // "profitShareMode",
            // "settleCompName",
            // "serviceName",
            // "feeName",
            // "receipayType",
            // "currency",
            // "unitPrice",
            // "unitCount",
            // "feeUnit",
            // "feeAmt",
            // "badAmt",
            // "invoiceStatus",
            // "invoiceAmt",
            // "noInvoiceAmt",
            // "invoiceNos",
            // "bdEmployeeName",
            // "bdDeptName"
          ]
        }
        data.query.push(obj)
        this.$store.dispatch('finance/downloadExcelFile', { data: data }).then((res) => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = msg + dateFormat('yyyy-mm-dd HH_MM_SS', new Date()) + '.xlsx'
          link.click()
          this.lsLoading = false
        })
        return
      }
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
          const { list } = res.data
          list.forEach(item => {
            item.settleOrderNo_multiValue = item.settleOrderNo.split(',')
          })
          this.option1.data = list
          this.$set(this.option1, 'emptyText', this.$t('Common.noData'))
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          // this.option1.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
      // 统计
      // this.debounceLs(() => {
      //   this.getListAmtSummary(data)
      // })
    },
    getListAmtSummary(data) {
      getListAmtSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          const labelObj = {
            baddebtAmtListLabel: this.$t('Charge.debtsAmt'),
            // realAmtListLabel: '预收可用金额'
          }
          const colorObj = {
            baddebtAmtListColor: 'red', // 支持red, green, black三种值
            // realAmtListColor: 'red'
          }
          const data = res.data
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data,
            labelObj,
            colorObj,
          })
        }
      })
    },
    // table复选框
    sendMulti(data, option) {
      this.multipleSelection1 = data
      const data2 = {
        ascColumns: [],
        descColumns: [],
        query: [],
      }
      const ids = this.multipleSelection1
        .map((item) => {
          return item.settleOrderBaddebtId
        })
        .join(',')
      if (ids) {
        data2.query.push({
          column: 'settleOrderBaddebtIds',
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
    // table行详情按钮
    showDetail(row) {
      this.$emit('update:isJumpRouteFromPage', true)
      this.routerPush('SettleOrderBadDetail', {
        source: 'detail',
        settleOrderNo: row.settleOrderNo,
        settleOrderBaddebtId: row.settleOrderBaddebtId,
      })
    },
    // 取消复核
    unlock(data) {
      unlock(data).then((res) => {
        this.$msgSucClose(this.$t('Hedge.cancellation'))
        this.getData()
      })
    },
    // 核销复核
    confirmWriteoff(data) {
      confirmWriteoff({writeoffNopayIdList: [data.writeoffNopayId]}).then((res) => {
        this.$msgSucClose(this.$t('Charge.underwritSuc'))
        this.getData()
      })
    },
    // 反核销
    reverse(data) {
      reverse(data).then((res) => {
        this.$msgSucClose(this.$t('Hedge.underwritingSuc'))
        this.getData()
      })
    },
    // 删除凭证  每行只有单个凭证
    delVoucher() {
      let selectRow = this.multipleSelection1
      if (!selectRow.length) {
        return this.$msgErrClose(this.$t('Hedge.deletedTips'))
      }
      let arr = selectRow.filter((item) => item.voucherNo)
      if (!arr.length) {
        return this.$msgErrClose(this.$t('Hedge.generatedTips'))
      }
      let voucherNos = []
      let voucherSeqNos = []
      arr.forEach((val) => {
        voucherNos.push(val.voucherNo)
        voucherSeqNos.push(val.acctVoucherSeqno)
      })
      voucherNos = [...new Set(voucherNos)].filter((v) => v !== 'null')
      voucherSeqNos = [...new Set(voucherSeqNos)]
      // return console.log(voucherSeqNos);
      this.$confirmWarn(this.$t('Hedge.detailsTips',{voucherNos: voucherNos.join(',')}), () => {
        voucherDelete({ voucherSeqNos }).then((res) => {
          this.$msgSucClose(this.$t('Settle.deleteSuc'))
          this.getData()
        })
      })
    },
    // 生成凭证
    generateVoucher(preview, bizNo) {
      // 凭证预览内的删除也走这个回调，refresh表示删除成功，刷新列表
      if (preview === 'refresh') {
        this.getData()
        return
      }
      const isPreview = preview === true
      if (!bizNo) this.previewDialog.show = false
      const selectRow = this.multipleSelection1
      if (!selectRow.length) {
        return this.$msgErrClose(this.$t('Hedge.vouchersPre', {text: isPreview ? this.$t('Common.preview') :  this.$t('Common.generate')}))
      }
      if (selectRow.length && isPreview) {
        let hasVoucher, noVoucher
        selectRow.forEach((v) => {
          if (v.acctVoucherSeqno) {
            hasVoucher = true
          } else {
            noVoucher = true
          }
        })
        if (hasVoucher && noVoucher) {
          return this.$msgErrClose(this.$t('Hedge.ungeneratedTips'))
        }
      }
      const arr = selectRow.filter((item) => !item.acctVoucherSeqno)
      if (!arr.length) {
        if (isPreview) {
          this.initShowVoucher(this.previewDialog, '', selectRow.map((v) => v.acctVoucherSeqno).join(','), '')
          // this.previewDialog.showData = ''
          // this.previewDialog.seqNo = ''
          // this.previewDialog.seqNos = selectRow.map(v=>v.acctVoucherSeqno).join(',')
          // this.previewDialog.show = true
        } else {
          this.$msgErrClose(this.$t('Hedge.withoutVoucher'))
        }
        return
      }
      const data = {
        writeoffNopayNos: bizNo && bizNo !== 'all' ? [bizNo] : arr.map((item) => item.writeoffNopayNo),
        bizType: 'gedging_writeoff',
      }
      if (isPreview) data.preview = 'yes'
      this.lsLoading = true
      this.$refs.PreviewDialog.lsLoading = true
      nopayWriteOffGenerate(data)
        .then((res) => {
          if (isPreview) {
            this.lsLoading = false
            if (!res.data || !res.data.length) return this.$msgErrClose(this.$t('Hedge.genVouchersTips'))
            this.initShowVoucher(this.previewDialog, '', '', res.data)
            // this.previewDialog.seqNo = ''
            // this.previewDialog.seqNos = ''
            // this.previewDialog.showData = res.data
            // this.previewDialog.show = true
            return
          }
          !isPreview && !bizNo && this.getData()
          this.$msgSucClose(this.$t('Hedge.processedTips'))
          // this.$router.push({ name: 'VoucherList' })
        })
        .finally(() => (this.lsLoading = this.$refs.PreviewDialog.lsLoading = false))
    },
    // 核销操作
    writeoffOP(type) {
      const len = this.multipleSelection1.length
      if (len !== 1) {
        return this.$msgErrClose(len ? this.$t('Charge.onlyTips') : this.$t('FinBill.expenseTips'))
      }
      const msg = {
        unlock: this.$t('Hedge.cancelReview'),
        reverse: this.$t('Hedge.antiWriteOff'),
        confirmWriteoff: this.$t('Hedge.writeoffReview'),
      }
      const recheckStatus = this.multipleSelection1[0].recheckStatus === 'checked'
      if (type === 'unlock' && !recheckStatus) {
        return this.$msgErrClose(this.$t('Charge.allowedTips'))
      }
      this.$confirm(this.$t('Charge.operationTips', {type: msg[type]}), this.$t('Common.warning'), {
        confirmButtonText: this.$t('Common.sure'),
        cancelButtonText: this.$t('Common.cancel'),
        lockScroll: 'true',
        type: 'warning',
      })
        .then(() => {
          const writeoffNopayId = this.multipleSelection1[0].writeoffNopayId
          this[type]({ writeoffNopayId })
        })
        .catch(console.log)
    },
    // 撤回申请
    badApplyCancel() {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose(this.$t('Charge.withdrawnTips'))
      }
      if (this.multipleSelection1[0].auditStatus !== 'pending') {
        return this.$msgErrClose(this.$t('Hedge.approvalTips'))
      }
      this.btnLoading1 = true
      badApplyCancel({ settleOrderBaddebtId: this.multipleSelection1[0].settleOrderBaddebtId }).then((res) => {
        this.btnLoading1 = false
        this.$msgSucClose(this.$t('Hedge.withdrawalTips'))
        this.getData()
      })
    },
    prevHandle(type) {
      let text = ''
      let meth = null
      if (type === 'handleExport') {
        text = this.$t('Common.export')
        meth = this.handleExport
      }
      this.$confirm(`${this.$t('FeeList.confirmStatus')}${text}?`, this.$t('Common.tips'), {
        confirmButtonText: this.$t('Common.sure'),
        cancelButtonText: this.$t('Common.cancel'),
        type: 'warning'
      }).then(() => {
        meth && meth()
      }).catch(err => {
        console.log(err)
      })
    },
    handleExport() {
      this.getData(false, { isExport: true })
    },
    handleCommand(command) {
      if(command === 'listData'){
        this.getData(false, { isExport: true })
      }else{
        this.getData(false, { isExport: true, isDetail: true})
      }
    },
    // 查看审批日志
    showLogDialog(row){

    }
  },
  activated() {
    this.lateFeeVisible = false // 防止叉掉了页面时，滞纳金窗口还在
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
