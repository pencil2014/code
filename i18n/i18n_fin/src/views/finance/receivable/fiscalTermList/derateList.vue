<template>
  <div
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-list-container">
      <!-- finance-seabill-cnt -->
      <div class="money-box" style="background-color: #fff;">
        <div class="money-box-left">
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-derateList', 'btn-auditPass')"
              class="finance-btn"
              @click="auditFn('pass')"
              size="mini"
              type="success"
            >{{$t('OrderFee.auditPass')}}</el-button><!-- 审核通过 -->
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-derateList', 'btn-auditReject')"
              class="finance-btn"
              @click="auditFn('reject')"
              size="mini"
              type="danger"
            >{{$t('OrderFee.auditRefuse')}}</el-button><!-- 审核拒绝 -->
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTableMass :option="option1" @send-multi="sendMulti" />
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{ key: 'prop', label: 'label' }"
        @close="customColumnsPopClose"
      />
    </div>
    <ResultDialog :option="resultDialogOption" @close="resultDialogOption.show = false">
      <div class="result-dialog-descript" slot="descript">
        <span v-for="item in settleOrderNos.split(',')" :key="item">{{item}}</span>
      </div>
    </ResultDialog>
    <ConfirmDialog :option="confirmOption" @close="sureConfirm">
      <el-form v-if="auditStatus === 'reject'" :model="rejectForm" label-width="213px" ref="rejectForm">
        <el-form-item
          :rules="{required: true, message: ' ', trigger: 'blur'}"
          :label="$t('OrderFee.refuseReason')+': '"
          prop="refuseReason"
        >
          <el-input type="textarea" v-model="rejectForm.refuseReason" :placeholder="$t('OrderFee.plsInput')"></el-input>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
    <!-- <el-dialog :visible.sync="rejectDialogVisible" :title="$t('OrderFee.notPassed')" width="600px">
      <el-form :model="rejectForm" label-width="100px" ref="rejectForm">
        <el-form-item
          :rules="{
						required: true,
						message: ' ',
						trigger: 'blur',
					}"
          :label="$t('OrderFee.refuseReason')"
          prop="refuseReason"
        >
          <el-input style="width:450px" type="textarea" v-model="rejectForm.refuseReason" show-word-limit maxlength="300"></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button :loading="btnLoading" @click="auditReject" size="mini" type="primary">{{$t('OrderFee.confirm')}}</el-button>
        <el-button @click="closeRejectDialog" size="mini">{{$t('OrderFee.cancel')}}</el-button>
      </span>
    </el-dialog> -->
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns/index'
import ConfirmDialog from '@/views/finance/components/financeDialog/confirmDialog.vue'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { listDeductionApplyPage } from '@/api/fin/custOverduePayment'
import { dateFormat } from '@/views/finance/utils/finance'
import { deductionApplyAudit } from '@/api/fin/custOverduePayment'
export default {
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      pageSizeUrl: listDeductionApplyPage('geturl'),
      keyDownActive: true,
      searchOption: {},
      option1: {},
      multipleSelection1: [],
      resultDialogOption: {
        show: false,
        title: this.$t('FeeList.buildSuc'),
        resultType: 'success',
        text_cancel: this.$t('Common.close'),
         titleText: this.$t('FeeList.multipleSuc'),
      },
      settleOrderNos: '',
      auditStatus: '',
      confirmOption: {
        width: '780px',
        show: false,
        title: '', // '滞纳金减免确认',
        titleText: '', // '您是否确认该滞纳金的处理方式？',
        formList: [],
        labelWidth: '213',
        btnLoading: false,
        btnType: '',
        text: this.$t('OrderFee.confirm'),
        cancelText: this.$t('OrderFee.cancel'),
      },
      selfColumnsBase: [
        {
          disabled: true,
          prop: 'deductionApplyNo',
          label: this.$t('LateFee.derateApplyNo'), // '减免申请编号',
          width: 145,
          type: 'button',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              this.showDetail(row)
            },
          },
        },
        {
          prop: 'settleCompName',
          label: this.$t('FeeList.settleComp'),
          type: 'text',
          width: 140,
          sortable: false,
        },
        {
          prop: 'settleCorpName',
          label: this.$t('FeeList.settleCorp'),
          type: 'text',
          width: 140,
          sortable: false,
        },
        {
          prop: 'custOverduePaymentNo',
         label: this.$t('LateFee.lateFeeNo'), // this.$t('Hedge.custOverduePaymentNo'), // 滞纳金编号
          width: '130px',
          type: 'button',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              this.showLateFeeDetail(row)
            },
          },
        },
        {
          prop: 'currency',
          label: this.$t('FeeList.currency'),
          type: 'text',
          sortable: false,
        },
        {
          prop: 'lateFeeAmt',
          label: this.$t('Finance.actuallatefee'),
          type: 'text',
          width: 100,
        },
        {
          prop: 'deductionType',
          label: this.$t('LateFee.reductionType'), // 减免类型',
          type: 'select',
          width: 120,
          propInDict: 'custOverduePaymentDeductionType',
          sortable: false,
        },
        {
          prop: 'deductionAmt',
          label: this.$t('LateFee.deductionApplyAmt'), // '减免申请金额',
          type: 'text',
          width: 150,
        },
        {
          prop: 'deductionRemark',
          label: this.$t('LateFee.derateReason'), // '减免原因',
          type: 'text',
          width: 120,
          sortable: false,
        },
        {
          prop: 'assumerType',
          label: this.$t('LateFee.remainLateFeeassumerType'), // '剩余滞纳金承担类型',
          type: 'select',
          width: 200,
          propInDict: 'custOverduePaymentAssumerType'
        },
        {
          prop: 'customerAssumerAmt',
          label: this.$t('LateFee.customerAssumerAmt'), // '客户承担金额',
          type: 'text',
          width: 140,
        },
        {
          prop: 'orderAssumerAmt',
          label: this.$t('LateFee.orderAssumerAmt'), // '订单承担金额',
          type: 'text',
          width: 130,
        },
        {
          prop: 'auditStatus',
          label:  this.$t('FinBill.approvalResult'),
          type: 'select',
          width: 110,
          sortable: false,
        },
        {
          prop: 'createdName',
          label: this.$t('Settle.applicant'),
          type: 'text',
          sortable: false,
        },
        {
          prop: 'createdTime',
          label: this.$t('Settle.applicationDate'),
          type: 'text',
          width: 120,
          sortable: false,
        },
        {
          prop: 'auditName',
          label: this.$t('OrderFee.approver'),
          type: 'text',
          sortable: false,
        },
        {
          prop: 'auditTime',
          label: this.$t('OrderFee.approvalTime'),
          type: 'text',
          width: 120
        },
      ],
      rejectDialogVisible: false,
      rejectForm: {
        refuseReason: '',
      },
    }
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    CustomColumns,
    ConfirmDialog,
  },
  // activated() {
  //   !this.isFirstGetData && this.getData()
  // },
  created() {
    let searchArr = ['deductionApplyNo', 'settleCompCode', 'settleCorpCode']
    this.searchOption = {
      saveDefault: true,
      saveName: 'derateList',
      isNotAutoLoad: true,
      addFilter: {
        defaultSearchLength: 5,
        searchInputGroup: searchArr.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          deductionApplyNo: { label: this.$t('LateFee.derateApplyNo'), type: 'input' }, // '减免申请编号'
          custOverduePaymentNo: { label: this.$t('LateFee.lateFeeNo'), type: 'input' }, // 滞纳金编号
          currency: { label: this.$t('OrderFee.currency'), type: 'select', prop: 'currency' }, // 币种
          deductionType: { label: this.$t('LateFee.derateType'), type: 'select', prop: 'custOverduePaymentDeductionType' }, // 减免类型
          assumerType: { label: this.$t('LateFee.remainLateFeeassumerType'), type: 'select', prop: 'custOverduePaymentAssumerType' }, // 剩余滞纳金承担类型
          auditStatus: { label: this.$t('OrderFee.approvalStatus'), type: 'select', prop: 'auditStatus', multiple: true, }, // 审核状态
          settleCompCode: {
            label: this.$t('FeeList.settleComp'),
            prop: 'settleCorpCode',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            remoteSelectList: [],
          },
          settleCorpCode: {
            label: this.$t('FeeList.settleCorp'),
            type: 'remoteSelect',
            showType: '6',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item)
            },
            remoteSelectList: [],
          },
          createdBy: {
            label: this.$t('PayApplyList.createdName'), // '申请人',
            type: 'remoteSelect',
            multiple: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          createdTime: { label: this.$t('PayApplyList.createdTime'), type: 'daterange', format: 'yyyy-MM-dd' }, // 申请时间
          auditBy: {
            label: this.$t('OrderFee.approver'), // '审核人',
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          auditTime: { label: this.$t('OrderFee.approvalTime'), type: 'daterange', format: 'yyyy-MM-dd' }, // 审核时间
        },
      },
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: this.$t('Common.details'),
          type: 'text',
          show: true, //待确认和不通过可以修改
          action: 'showDetail',
        },
      ],
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
    })
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
      $name: 'derateList',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      emptyText: this.$t('Common.emptyText'),
      pagination,
      sortable: true,
      sortChange: (column, prop, order) => {
        this.sortParams = { prop, order }
        this.isSort = true
        this.getData()
      },
    })
    let columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.option1.columns = columns
  },
  methods: {
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
    auditFn(status) {
      this.rejectForm.refuseReason = ''
      this.auditStatus = status
      const len = this.multipleSelection1.length
      if (len !== 1) {
        return this.$msgErrClose(this.$t('OrderFee.selectOneRow')) // '请勾选需要审批的数据！' // '请勾选1条需要审批的数据！'
      }
      let row = this.multipleSelection1[0]
      let { deductionType, assumerType, deductionAmt, customerAssumerAmt, orderAssumerAmt, currency, auditStatus } = row
      // const auditStatus = this.multipleSelection1.some((item) => item.auditStatus !== 'pending' && item.auditStatus !== 'approving')
      // if (auditStatus) {
      if (auditStatus !== 'pending' && auditStatus !== 'approving') {
        return this.$msgErrClose(this.$t('PayApplyList.containNonpending')) // '勾选的数据中存在已经审核过的数据，请重新选择！'
      }
      // if (status === 'reject') {
      //   this.rejectDialogVisible = true
      // } else {
      //   this.auditPass()
      // }
      this.confirmOption.formList = [
        {
          label: this.$t('LateFee.derateType'), // '减免类型',
          prop: 'deductionType',
          value: this.dictMapObj.custOverduePaymentDeductionType[deductionType],
        },
        { label: this.$t('LateFee.derateAmt'), prop: 'deductionAmt', value: deductionAmt + ' ' + currency, }, // '减免金额'
        {
          label: this.$t('LateFee.remainLateFeeassumerType'), // '剩余金额承担类型',
          prop: 'assumerType',
          value: this.dictMapObj.custOverduePaymentAssumerType[assumerType],
          hide: !assumerType,
          isFull: assumerType === 'full',
        },
        { label: this.$t('LateFee.customerAssumerAmt'), prop: 'customerAssumerAmt', value: customerAssumerAmt + ' ' + currency, hide: !assumerType || assumerType === 'order' }, // '客户承担金额'
        { label: this.$t('LateFee.orderAssumerAmt'), prop: 'orderAssumerAmt', value: orderAssumerAmt + ' ' + currency, hide: !assumerType || deductionType === 'customer' }, // '订单承担金额'
      ]
      if (status === 'reject') {
        this.confirmOption.title = this.$t('OrderFee.auditRefuse') // '审核拒绝'
        this.confirmOption.titleText = this.$t('LateFee.sureRefuseApproval') // '您是否确认审核拒绝该申请？'
        this.confirmOption.btnType = 'danger'
      } else {
        this.confirmOption.title = this.$t('OrderFee.auditPass') // '审核通过'
        this.confirmOption.titleText = this.$t('LateFee.surePassApproval') // '您是否确认审核通过该申请？'
        this.confirmOption.btnType = 'success'
      }
      this.confirmOption.show = true
    },
    sureConfirm(tag) {
      if (tag === true) {
        if(this.auditStatus === 'pass'){
          this.auditPass()
        }else{
          this.auditReject()
        }
      }
    },
    // 审批通过
    auditPass() {
      const deductionApplyNoList = this.multipleSelection1.map((item) => item.deductionApplyNo)
      const data = {
        deductionApplyNoList,
        auditStatus: 'pass',
      }
      this.btnLoading = true
      deductionApplyAudit(data)
        .then((res) => {
          // this.btnLoading = false
          this.confirmOption.btnLoading = true
          if (res.code === 0) {
            this.getData()
            this.$msgSucClose(this.$t('OrderFee.successOp')) // '审批通过处理成功！'
            this.confirmOption.show = false
          }
        })
        // .catch(() => {
        //   this.btnLoading = false
        // })
        .finally(() => this.confirmOption.btnLoading = false )
    },
    // 审批拒绝
    auditReject() {
      this.$refs['rejectForm'].validate((valid) => {
        if (valid) {
          const deductionApplyNoList = this.multipleSelection1.map((item) => item.deductionApplyNo)
          const data = {
            deductionApplyNoList,
            auditStatus: 'refuse',
            auditRemark: this.rejectForm.refuseReason,
          }
          // this.btnLoading = true
          this.confirmOption.btnLoading = true
          deductionApplyAudit(data)
            .then((res) => {
              this.btnLoading = false
              if (res.code === 0) {
                this.getData()
                this.$msgSucClose(this.$t('OrderFee.successOp')) // '审批拒绝处理成功！'
                // this.closeRejectDialog()
                this.$refs.rejectForm.resetFields()
                this.$nextTick(() => this.confirmOption.show = false)
              }
            })
            // .catch(() => {
            //   this.btnLoading = false
            // })
            .finally(() => this.confirmOption.btnLoading = false )
        }
      })
    },
    // 关闭拒绝弹窗
    closeRejectDialog() {
      this.rejectDialogVisible = false
      this.$refs.rejectForm.resetFields()
    },
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      this.lsLoading = true
      let { prop, order } = this.sortParams
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        columns: [],
        query: [],
        ascColumns: order === 'ascending' ? [prop] : [],
        descColumns: order === 'descending' ? [prop] :[],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption, true, true)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (this.buttonSearch) {
        data.query.push({ column: 'confirmStatus', type: 'eq', value: this.buttonSearch })
      }
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      return listDeductionApplyPage(data)
        .then((res) => {
          if (res.code === 0) {
            this.finCommonColumns(res)
            if (customerList) return
            // if (res.data.configColumns && res.data.configColumns.length) {
            // 	let columns = res.data.configColumns
            // 	this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
            // 	this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
            // 	this.configColumns = res.data.configColumns
            // }
            let list = res.data.list
            let data = []
            list.forEach((item) => {
              data.push(item)
            })
            this.option1.data = data
            this.$set(this.option1, 'emptyText',  this.$t('Common.noData'))
            Object.assign(this.option1.pagination, res.data)
            // this.option1.pagination.currPage = res.data.currPage
            // this.option1.pagination.pageSize = res.data.pageSize
            // this.option1.pagination.totalCount = res.data.totalCount
          }
        })
        .finally(() => {
          this.lsLoading = false
        })
    },
    //导出按钮
    handleExport(params, isSearch) {
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        columns: [],
        ascColumns: params && params.order === 'ascending' ? [params.prop] : [],
        descColumns: params && params.order === 'descending' ? [params.prop] : ['settleDate'],
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.searchOption.addFilter.searchInputGroup.forEach((item) => {
        let { key, value, range, req, valueReq } = item
        if (!value) return
        if (typeof value !== 'object') {
          if (valueReq && item[valueReq]) {
            data.query.push({
              column: valueReq,
              type: 'eq',
              value: item[valueReq],
            })
            console.log(item[valueReq])
          }
          return data.query.push({
            column: key,
            type: 'eq',
            value: req || value,
          })
        }
        if (key === 'recvCorpCode' || key === 'payStatus' || key === 'status') {
          if (!value.length) return
          data.query.push({
            column: key,
            type: 'eq',
            value: value.join(','),
          })
        } else {
          data.query.push({
            column: key + 'Start',
            type: 'eq',
            value: dateFormat('yyyy-mm-dd', value[0]),
          })
          data.query.push({
            column: key + 'End',
            type: 'eq',
            value: dateFormat('yyyy-mm-dd', value[1]),
          })
        }
      })
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (this.buttonSearch) {
        data.query.push({ column: 'confirmStatus', type: 'eq', value: this.buttonSearch })
      }
      if (this.multipleSelection1.length) {
        data.query = [{ column: 'fiscalTermNo', type: 'in', value: this.multipleSelection1.map((v) => v.fiscalTermNo).join(',') }]
      }
      //查询对象的配置编码
      data.query.push({ column: 'queryDataModuleCode', value: 'fiscalTermListExport' })

      this.$confirm(this.$t('LateFee.sureExportAcctRecv'), this.$t('OrderFee.tip'), { // '是否确认导出应收账单列表?', '导出应收账单列表'
        showCancelButton: true,
        confirmButtonText: this.$t('OrderFee.confirm'),
        cancelButtonText: this.$t('OrderFee.cancel'),
        lockScroll: 'true',
        type: 'warning',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = `${this.$t('OrderFee.processing')}...`
            setTimeout(() => {
              this.option1.loading = true
              this.$store
                .dispatch('finance/downloadBlobFilePost', {
                  uri: '/fin/common/queryDataExportExcel',
                  data: { data },
                })
                .then((res) => {
                  this.option1.loading = false
                  console.log(res)
                  let link = document.createElement('a')
                  link.href = window.URL.createObjectURL(res)
                  link.download = `${this.$t('LateFee.acctRecvList')}.xlsx` // 应收账单列表
                  link.click()
                  done()
                  instance.confirmButtonLoading = false
                })
                .catch(() => {
                  this.option1.loading = false
                  this.$message({ message: this.$t('OrderFee.exportFailed'), type: 'error' }) // '导出失败'
                  done()
                  instance.confirmButtonLoading = false
                })
            }, 10)
          } else {
            done()
            instance.confirmButtonLoading = false
          }
        },
      })
        .then(() => {})
        .catch(() => {})
    },
    search(data, index) {
      this.buttonSearch = data
      this.option1.pagination.currPage = 1
      this.getData(true)
      if (index || index === 0) {
        this.rightFilterBtns = [false, false, false]
        this.rightFilterBtns[index] = true
      }
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
          return item.invoicePaymentId
        })
        .join(',')
      if (ids) {
        data2.query.push({
          column: 'invoicePaymentIds',
          type: 'eq',
          value: ids,
        })
      } else {
        data2.query = this.searchBackup || []
      }
      // this.debounceLs(() => {
      //     this.getListAmtSummary(data2)
      // })
    },
    showDetail({ deductionApplyNo }) {
      this.routerPushTab('DerateDetail', {
        deductionApplyNo
      })
    },
    showLateFeeDetail(row) {
      this.routerPushTab('LateFeeDetail', {
        custOverduePaymentNo: row.custOverduePaymentNo,
      })
    },
  },
}
</script>