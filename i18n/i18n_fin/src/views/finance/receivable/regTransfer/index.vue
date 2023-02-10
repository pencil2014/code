<template>
  <div
    class="finance-page reg-transfer-page"
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
            v-if="checkAuth($route.name, 'btn-auditPass')"
            class="finance-btn"
            @click="handleApply('pass')"
            size="mini"
            type="success"
          >{{$t('Settle.approved')}}</el-button>
          <el-button
            v-if="checkAuth($route.name, 'btn-auditRefuse')"
            class="finance-btn"
            @click="handleApply('refuse')"
            size="mini"
            type="danger"
          >{{$t('Settle.refuse')}}</el-button>
        </div>
        <div class="money-box-right">
          <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
        </div>
      </div>
      <FinanceTable :option="option1" @send-multi="sendMulti" />
    </div>
    <el-dialog :title="$t('PreClose.approval')" :visible.sync="refuseOpen" width="600px">
      <el-form :model="formQuery" ref="formQuery">
        <el-form-item
          :label="$t('Settle.reject')"
          prop="refuseReason"
          :rules="{required: true, message: $t('Hedge.rejectionEmp'), trigger: 'blur'}"
        >
          <el-input
            type="textarea"
            :maxlength="500"
            show-word-limit
            v-model="formQuery.refuseReason"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="btnLoading" type="primary" @click="handleSubmit" size="mini">{{$t('Common.sure')}}</el-button>
        <el-button @click="refuseOpen = false" size="mini">{{$t('Common.cancel')}}</el-button>
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
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { regTransferListPage as listPage, regTransferConfirm } from '@/api/fin/receivableReg'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { bankAccountListAll } from '@/api/fin/settleUnitBankAcct'
export default {
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      pageSizeUrl: listPage('geturl'),
      keyDownActive: true,
      btnLoading: false,
      searchBackup: [],
      formQuery: { refuseReason: '' },
      refuseOpen: false,
      query: { applyNo: '', confirmStatus: '', refuseReason: '' },
      rejectDialogVisible: false,
      option1: {},
      searchOption: {},
      multipleSelection1: [],
      form: { orderNo: '', creationDate: '', billNo: '', settleCorpName: '', settleCorpCode: '' },
      selectedOptionItem: '',
      receivableRegId: null,
      currentComponent: '',
      isJumpRouteFromPage: false,
      ascColumns: [],
      // 降序
      descColumns: [],
      // 自定义表头弹框
      customColumnsPopShow: false,
      selfColumnsBase: [],
    }
  },
  created() {
    // 搜索配置
    let searchArr = ['receivableRegNo', 'settleCorpCode', 'createdTime', 'payAccountName', 'recvDate', 'currency', 'confirmStatus']
    this.searchOption = {
      saveShow: true,
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        // 初始搜索条件数
        defaultSearchLength: 7,
        // 条件数组
        searchInputGroup: searchArr.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          //1
          allNo: { label: this.$t('Hedge.variousNumbers'), type: 'input' },
          receivableRegNo: { label: this.$t('Collect.receivableRegNo'), type: 'input' },
          receivablePrerevNo: { label: this.$t('Collect.newAdvance'), type: 'input' },
          bankSeqNo: { label: this.$t('Collect.bankFlowNumber'), type: 'input' },
          oldSettleCorpCode: {
            label: this.$t('Supplier.originalbillunit'),
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item),
            visibleChange: (queryString, item, row) => this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item),
            remoteSelectList: [],
          },
          settleCorpCode: {
            label: this.$t('Supplier.newSettleUnit'),
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item),
            visibleChange: (queryString, item, row) => this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item),
            remoteSelectList: [],
          },
          compBankAccountId: {
            label: this.$t('Settle.recvBankName'),
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => this.bankAccountListAll(queryString, item),
            visibleChange: (queryString, item, row) => this.bankAccountListAll('', item),
            remoteSelectList: [],
          },
          accountNo: { label: this.$t('Settle.recvAccountNo'), type: 'input' },
          payAccountNo: { label: this.$t('Collect.accountNumber'), type: 'input' },
          payAccountName: { label: this.$t('FinBill.payer'), type: 'input' },
          payBankName: { label: this.$t('Supplier.paymentbank'), type: 'input' },
          recvDate: { label: this.$t('FeeList.receivePayDates'), type: 'lsDaterange', format: 'yyyy-MM-dd' },
          currency: { label: this.$t('Collect.receiptCurrency'),type: 'select', prop: 'currency' },
          confirmStatus: { label: this.$t('PreClose.approvalStatus'), type: 'select', prop: 'confirmStatus' },
          createdTime: {label: this.$t('Common.createTime'), type: 'daterange', format: 'yyyy-MM-dd' },
          createdBy: {
           label: this.$t('Common.createdBy'),
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          confirmTime: { label: this.$t('PreClose.approvalTime'), type: 'daterange', format: 'yyyy-MM-dd' },
          confirmBy: {
            label: this.$t('PreClose.approver'),
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
        },
      },
    }
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
      $name: 'RegTransfer',
      data: [...this.option.data],
      tips: { text: '', show: false },
      emptyText: this.$t('Common.emptyText'),
      operationBtns: false,
      pagination,
      sortable: true,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
    })
    let columns = [
      {
        prop: 'receivableRegNo',
        label: this.$t('Collect.receivableRegNo'),
        width: '130px',
        type: 'button',
        operationBtns: {
          show: true,
          callback: (action, $index, row, option) => {
            this.showDetail(row)
          },
        },
      },
      {
        prop: 'newReceivablePrerevNo',
        label: this.$t('Collect.newAdvance'),
        width: '155px',
        type: 'button',
        sortable: true,
        operationBtns: {
          show: true,
          callback: (action, $index, row, option) => {
            this.routerPush('PrerevWriteoff', {
              source: 'createSettlementFromPrerev',
              receivablePrerevNo: row.newReceivablePrerevNo,
            })
          },
        },
      },
      {
        prop: 'accountShortName',
        label: this.$t('Settle.recvBankName'),
        type: 'text',
        width: 130,
      },
      {
        prop: 'accountNo',
        label: this.$t('Settle.recvAccountNo'),
        type: 'text',
        width: 130,
      },
      {
        prop: 'confirmStatus',
        label: this.$t('PreClose.approvalStatus'),
        type: 'select',
        propInDict: 'confirmStatus',
        width: 80,
      },
      {
        prop: 'currency',
        label: this.$t('Collect.receiptCurrency'),
        type: 'text',
        width: 80,
      },
      {
        prop: 'realAmt',
        label: this.$t('Collect.amtReceived'),
        type: 'text',
        width: 80,
      },
      {
        prop: 'recvDate',
        label: this.$t('FeeList.receivePayDates'),
        width: 100,
        type: 'text',
      },
      {
        prop: 'oldSettleCorpName',
        label: this.$t('Supplier.originalbillunit'),
        type: 'text',
        width: '150px',
      },
      {
        prop: 'settleCorpName',
        label: this.$t('Supplier.newSettleUnit'),
        type: 'text',
        width: '150px',
      },
      {
        prop: 'fileName',
        label: this.$t('Common.attachment'),
        type: 'button',
        width: 135,
        callback: (row) => window.open(this.getDownloadPath(row.fileNo)),
      },
      {
        prop: 'reason',
        label: this.$t('PreClose.reason'),
        type: 'tooltip',
        width: 135,
      },
      {
        prop: 'payAccountName',
        label: this.$t('FinBill.payer'),
        type: 'text',
        width: '124px',
      },
      {
        prop: 'payBankName',
        label: this.$t('Supplier.paymentbank'),
        width: '124px',
        type: 'text',
      },
      {
        prop: 'payAccountNo',
        label: this.$t('Collect.accountNumber'),
        type: 'text',
        width: 130,
      },
      {
        prop: 'interTransferFee',
        label: this.$t('Collect.interTransferFee'),
        width: '100px',
        type: 'text',
      },
      {
        prop: 'outerTransferFee',
        label: this.$t('Collect.externalFee'),
        width: '100px',
        type: 'text',
      },
      {
        prop: 'bankSeqNo',
        label: this.$t('Collect.bankFlowNumber'),
        width: '124px',
        type: 'text',
      },
      {
        prop: 'refuseReason',
        label: this.$t('Charge.rejectReasons'),
        width: 135,
        type: 'tooltip',
      },
      {
        prop: 'createdName',
       label: this.$t('Common.createdBy'),
        type: 'text',
        width: 100,
      },
      {
        prop: 'createdTime',
       label: this.$t('Common.createTime'),
        type: 'text',
        width: 130,
      },
      {
        prop: 'confirmName',
        label: this.$t('PreClose.approver'),
        type: 'text',
        width: 100,
      },
      {
        prop: 'updatedTime',
        label: this.$t('PreClose.approvalTime'),
        type: 'text',
        width: 130,
      },
    ]
    let sortArr = ['receivableRegNo', 'newReceivablePrerevNo', 'realAmt', 'recvDate', 'createdTime', 'updatedTime']
    this.selfColumnsBase = columns.map((item) => ({ ...item, sortable: sortArr.includes(item.prop) }))
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.option1.columns = [...this.selfColumnsBase]
    // this.getData()
  },
  methods: {
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    handleApply(confirmStatus) {
      if (this.multipleSelection1.length === 0) {
        let text = confirmStatus == 'pass' ? this.$t('Supplier.approvedTips') : this.$t('Supplier.rejectedTips')
        this.$msgErrClose(text)
        return
      }
      if (this.multipleSelection1.length > 1) {
        let text = confirmStatus == 'pass' ? this.$t('Supplier.oneapprovedTips') : this.$t('Supplier.onerejectedTips')
        this.$msgErrClose(text)
        return
      }
      if (this.multipleSelection1[0].confirmStatus !== 'pending') {
        this.$msgErrClose(this.$t('Supplier.ransferapproval'))
        return
      }
      let query = {}
      let receivableRegTransferId = this.multipleSelection1.map((item) => item.receivableRegTransferId)
      query.receivableRegTransferId = receivableRegTransferId.toString()
      query.confirmStatus = confirmStatus
      query.refuseReason = undefined
      if (confirmStatus == 'pass') {
        this.$confirmWarn({ body: this.$t('Supplier.sureapproval'), title: this.$t('Settle.approved') }, () => {
          regTransferConfirm(query).then((res) => {
            this.$message({ message: this.$t('Supplier.approvedSuc'), type: 'success' })
            this.getData()
          })
        })
      }
      if (confirmStatus == 'refuse') {
        this.refuseOpen = true
        this.formQuery.receivableRegTransferId = receivableRegTransferId.toString()
        this.formQuery.confirmStatus = confirmStatus
        this.formQuery.refuseReason = undefined
      }
    },
    handleSubmit() {
      this.$refs.formQuery.validate((valid) => {
        if (valid) {
          this.btnLoading = true
          regTransferConfirm(this.formQuery)
            .then((res) => {
              this.btnLoading = false
              this.$message({ message: this.$t('Supplier.rejectSuc'), type: 'success' })
              this.refuseOpen = false
              this.getData()
            })
            .catch((err) => {
              this.btnLoading = false
              this.refuseOpen = false
            })
        }
      })
    },
    querySettleUnit(queryString, cb) {
      this.$store.dispatch('dict/currencyList', queryString ? queryString : '').then((data) => {
        cb(data)
      })
    },
    querySettleUnit1(queryString, cb) {
      this.$store.dispatch('dict/querySettleUnit', queryString).then((data) => {
        cb(data)
      })
    },
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        columns: [],
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        query: [],
      }
      this.finCommonSearch(data.query, this.searchOption)
      if (isSearch) {
        this.searchBackup = data.query
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      data.query = this.searchBackup || []
      return listPage(data)
        .then((res) => {
          this.finCommonColumns(res)
          if (customerList) return
          this.option1.data = res.data.list
          this.$set(this.option1, 'emptyText',  this.$t('Common.noData'))
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          // this.option1.pagination.totalCount = res.data.totalCount
        })
        .finally(() => {
          this.lsLoading = false
        })
    },
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
    },
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    showDetail(row) {
      console.log(row.receivableRegId)
      let query = {
        source: 'createSettlementFromReceivableRegId',
        receivableRegId: row.receivableRegId,
        receivableRegNo: row.receivableRegNo,
      }
      this.routerPush('WriteoffRecvDetail', query)
    },
    bankAccountListAll(accountShortName, item) {
      let data = { currPage: 1, pageSize: 30, accountShortName, currency: '', status: 'effect', unitType: 'company' }
      bankAccountListAll(data).then((res) => {
        let data = res.data.map((item) => ({ label: item.accountShortName, value: item.settleUnitBankAcctId }))
        this.remoteSelectCommon(item, data)
      })
    },
  },
  components: {
    FinanceTable,
    FinanceSearch,
    CustomColumns,
  },
}
</script>
<style lang="scss">
</style>