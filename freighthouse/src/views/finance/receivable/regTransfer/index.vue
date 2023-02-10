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
          >审批通过</el-button>
          <el-button
            v-if="checkAuth($route.name, 'btn-auditRefuse')"
            class="finance-btn"
            @click="handleApply('refuse')"
            size="mini"
            type="danger"
          >审批拒绝</el-button>
          <el-button
            class="finance-btn"
            @click="handleExport"
            size="mini"
            v-if="checkAuth($route.name, 'btn-handleExport')"
          >导出</el-button>
        </div>
        <div class="money-box-right">
          <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
        </div>
      </div>
      <FinanceTable :option="option1" @send-multi="sendMulti" />
    </div>
    <el-dialog :title="'审批不通过'" :visible.sync="refuseOpen" width="600px">
      <el-form :model="formQuery" ref="formQuery" label-width="80px">
        <el-form-item
          label="拒绝原因"
          prop="refuseReason"
          :rules="{required: true, message: '拒绝原因不能为空', trigger: 'blur'}"
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
        <el-button :loading="btnLoading" type="primary" @click="handleSubmit" size="mini">确定</el-button>
        <el-button @click="refuseOpen = false" size="mini">取消</el-button>
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
          allNo: { label: '各类编号', type: 'input' },
          receivableRegNo: { label: '收款登记号', type: 'input' },
          receivablePrerevNo: { label: '新预收款登记号', type: 'input' },
          bankSeqNo: { label: '银行流水号', type: 'input' },
          oldSettleCorpCode: {
            label: '原结算单位',
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item),
            visibleChange: (queryString, item, row) => this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item),
            remoteSelectList: [],
          },
          settleCorpCode: {
            label: '新结算单位',
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item),
            visibleChange: (queryString, item, row) => this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item),
            remoteSelectList: [],
          },
          compBankAccountId: {
            label: '收款银行',
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => this.bankAccountListAll(queryString, item),
            visibleChange: (queryString, item, row) => this.bankAccountListAll('', item),
            remoteSelectList: [],
          },
          accountNo: { label: '收款账号', type: 'input' },
          payAccountNo: { label: '付款账号', type: 'input' },
          payAccountName: { label: '付款人', type: 'input' },
          payBankName: { label: '付款开户行', type: 'input' },
          recvDate: { label: '收付日期', type: 'lsDaterange', format: 'yyyy-MM-dd' },
          currency: { label: '收款币种', type: 'select', prop: 'currency' },
          confirmStatus: { label: '审批状态', type: 'select', prop: 'confirmStatus' },
          createdTime: { label: '创建时间', type: 'daterange', format: 'yyyy-MM-dd' },
          createdBy: {
            label: '创建人',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          confirmTime: { label: '审批时间', type: 'daterange', format: 'yyyy-MM-dd' },
          confirmBy: {
            label: '审批人',
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
      emptyText: '数据将在查询后显示',
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
        label: '收款登记号',
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
        label: '新预收款登记号',
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
        label: '收款银行',
        type: 'text',
        width: 130,
      },
      {
        prop: 'accountNo',
        label: '收款账号',
        type: 'text',
        width: 130,
      },
      {
        prop: 'confirmStatus',
        label: '审批状态',
        type: 'select',
        propInDict: 'confirmStatus',
        width: 80,
      },
      {
        prop: 'currency',
        label: '收款币种',
        type: 'text',
        width: 80,
      },
      {
        prop: 'realAmt',
        label: '收款金额',
        type: 'text',
        width: 80,
      },
      {
        prop: 'recvDate',
        label: '收付日期',
        width: 100,
        type: 'text',
      },
      {
        prop: 'oldSettleCorpName',
        label: '原结算单位',
        type: 'text',
        width: '150px',
      },
      {
        prop: 'settleCorpName',
        label: '新结算单位',
        type: 'text',
        width: '150px',
      },
      {
        prop: 'recvCompName',
        label: '分公司',
        type: 'text',
        width: '150px',
      },
      {
        prop: 'fileName',
        label: '附件',
        type: 'button',
        width: 135,
        callback: (row) => window.open(this.getDownloadPath(row.fileNo)),
      },
      {
        prop: 'reason',
        label: '申请原因',
        type: 'tooltip',
        width: 135,
      },
      {
        prop: 'payAccountName',
        label: '付款人',
        type: 'text',
        width: '124px',
      },
      {
        prop: 'payBankName',
        label: '付款开户行',
        width: '124px',
        type: 'text',
      },
      {
        prop: 'payAccountNo',
        label: '付款账号',
        type: 'text',
        width: 130,
      },
      {
        prop: 'interTransferFee',
        label: '内扣手续费',
        width: '100px',
        type: 'text',
      },
      {
        prop: 'outerTransferFee',
        label: '外扣手续费',
        width: '100px',
        type: 'text',
      },
      {
        prop: 'bankSeqNo',
        label: '银行流水号',
        width: '124px',
        type: 'text',
      },
      {
        prop: 'refuseReason',
        label: '审批拒绝原因',
        width: 135,
        type: 'tooltip',
      },
      {
        prop: 'createdName',
        label: '创建人',
        type: 'text',
        width: 100,
      },
      {
        prop: 'createdTime',
        label: '创建时间',
        type: 'text',
        width: 130,
      },
      {
        prop: 'confirmName',
        label: '审批人',
        type: 'text',
        width: 100,
      },
      {
        prop: 'updatedTime',
        label: '审批时间',
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
        this.$msgErrClose('请勾选需要' + (confirmStatus == 'pass' ? '审批通过' : '审批拒绝') + '的项！')
        return
      }
      if (this.multipleSelection1.length > 1) {
        this.$msgErrClose('一次只能勾选一个' + (confirmStatus == 'pass' ? '审批通过' : '审批拒绝') + '的项！')
        return
      }
      if (this.multipleSelection1[0].confirmStatus !== 'pending') {
        this.$msgErrClose('收款转移审批已审批')
        return
      }
      let query = {}
      let receivableRegTransferId = this.multipleSelection1.map((item) => item.receivableRegTransferId)
      query.receivableRegTransferId = receivableRegTransferId.toString()
      query.confirmStatus = confirmStatus
      query.refuseReason = undefined
      if (confirmStatus == 'pass') {
        this.$confirmWarn({ body: '您确定要审批通过吗?', title: '审批通过' }, () => {
          regTransferConfirm(query).then((res) => {
            this.$message({ message: '审批通过提交成功', type: 'success' })
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
              this.$message({ message: '拒绝审批提交成功', type: 'success' })
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
          this.$set(this.option1, 'emptyText', '未查询到任何数据')
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
    handleExport() {
      let data = {
        columns: this.option1.columns.map((v) => v.prop),
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
            column: 'receivableRegTransferIds',
            type: 'in',
            value: this.multipleSelection1.map((v) => v.receivableRegTransferId).join(','),
          },
        ]
      }
      //查询对象的配置编码
      data.query.push({ column: 'queryDataModuleCode', value: 'receivableRegTransferListExport' })
      this.lsLoading = true
      this.$store
        .dispatch('finance/downloadExcelFile', { data: data })
        .then((res) => {
          this.aTagClick(window.URL.createObjectURL(res), '预收调转列表.xlsx')
        })
        .finally(() => (this.lsLoading = false))
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