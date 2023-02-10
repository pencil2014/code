<template>
  <div
    class="finance-list-container"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div style="height: 8px; background: #f8f9fd"></div>
    <div class="money-box">
      <div class="money-box-left">
        <el-button
          class="finance-btn"
          size="mini"
          @click="dialogVisible = true"
          v-if="checkAuth($route.name, 'tab-compareBillBankList', 'btn-import')"
          type="primary"
        >导入银行账单</el-button>
        <el-button
          class="finance-btn"
          size="mini"
          @click="remarkCompare"
          v-if="checkAuth($route.name, 'tab-compareBillBankList', 'btn-remarkCompare')"
          type="warning"
        >是否参与对账</el-button>
        <el-button
          class="finance-btn"
          size="mini"
          @click="$refs.FinDialog.compareDialog.show = true"
          v-if="checkAuth($route.name, 'tab-compareBillBankList', 'btn-compare')"
          type="primary"
        >对账</el-button>
      </div>
      <div class="money-box-right">
        <el-button
          class="finance-btn"
          size="mini"
          @click="createReceivableReg"
          type="primary"
          v-if="checkAuth($route.name, 'tab-compareBillBankList', 'btn-regWriteoff')"
        >批量收款登记</el-button>
        <el-button
          class="finance-btn"
          size="mini"
          @click="routerPushTab('CompareBillBankFile')"
          v-if="checkAuth('CompareBillBankFile')"
        >查看银行账单附件</el-button>
        <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
      </div>
    </div>
    <FinanceTable :option="option1" @send-multi="sendMulti" />

    <FinanceUpload
      v-if="dialogVisible"
      :limit="1"
      uploadTitle="导入银行账单"
      fileLabel="银行账单："
      :show-upload="dialogVisible"
      upload-api="/fin/bankAccStatement/importBankSeq"
      :upload-params="uploadParams"
      :uploadParamsRules="rules"
      :needValid="true"
      @close-upload="dialogVisible = false"
      @send-res-upload="sendResUpload"
    >
      <!-- @send-res-upload="sendResUpload" -->
      <el-form-item slot="formItems" label="银行：" prop="template">
        <el-select v-model="uploadParams.template" placeholder="请选择银行">
          <el-option
            v-for="(item) in dictMap.bankAccStatementTemplate"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <div slot="bottom" style="padding-left: 100px;">
        <el-button size="mini" @click="download">导出固定模板</el-button>
      </div>
    </FinanceUpload>
    <FinDialog ref="FinDialog" :vm="vm" />
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
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { bankListPage, remarkCompare, createReceivableReg, bankListPageSummary } from '@/api/fin/compareBill.js'
import { mapState } from 'vuex'
import FinanceUpload from '@/views/finance/components/financeUpload/financeUploadFile'
// import FinDialog from '@/views/finance/components/financeDialog/finDialog'
import FinDialog from '../components/compareDialog'
import { bankAccountListAll } from '@/api/fin/settleUnitBankAcct'

export default {
  name: 'compareBillBankList',
  label: '银行流水',
  mixins: [mixin, mixin2, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    FinanceUpload,
    FinDialog,
    CustomColumns,
  },
  // activated() {
  //   // 首次进入直接返回，会由搜索组件触发搜索
  //   if (!this.isFirstActivated) {
  //     this.isFirstActivated = true
  //     return
  //   }
  //   if (this.tabRefresh.pre) {
  //     this.tabRefresh.pre = false
  //     !this.isFirstGetData && this.handleCurrentChange(1)
  //   }
  // },
  data() {
    return {
      pageSizeUrl: bankListPage('geturl'),
      keyDownActive: true,
      searchOption: {},
      option1: {},
      multipleSelection: [],
      selectionRow: {},
      departmentList: [],
      multipleSelection1: [],
      bankList: [],
      dialogVisible: false,
      uploadParams: { template: '', file: '' },
      rules: {
        template: [{ required: true, message: ' ', trigger: 'change' }],
        file: [{ required: true, message: '附件不能为空', trigger: 'change' }],
      },
      vm: this,
      customColumnsPopShow: false,
      selfColumnsBase: [
        {
          prop: 'bankAccBillNo',
          label: '银行账单编号',
          type: 'button',
          width: '130px',
          operationBtns: {
            show: true,
            callback: (fn, index, row) => this.routerPushTab('CompareBillBankDetail', { bankAccBillNo: row.bankAccBillNo }),
          },
          showOverflow: false,
        },
        { prop: 'receivePayDate', width: 90, label: '收付日期' },
        { prop: 'compare', label: '是否参与对账', type: 'select', width: 90, propInDict: 'yesNo' },
        { prop: 'receivableRegStatus', label: '是否收款登记', type: 'select', width: 90, propInDict: 'yesNo' },
        {
          prop: 'receivableRegNo',
          label: '收款登记号',
          width: '130px',
          type: 'button',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              this.routerPushTab('WriteoffRecvDetail', { receivableRegNo: row.receivableRegNo })
            },
          },
        },
        {
          prop: 'receivableRegConfirmStatus',
          label: '收款登记确认状态',
          type: 'select',
          propInDict: 'receivableRegStatus',
          width: '118px',
        },
        { prop: 'receivableRegWriteoffStatus', label: '核销状态', type: 'select', width: '104px', propInDict: 'writeoffStatus' },
        { prop: 'receivePayType', label: '收付类型', type: 'select', width: 80, propInDict: 'receipayGroup' },
        { prop: 'bankSeqNo', width: 130, label: '银行流水号' },
        { prop: 'settleCompName', width: 150, label: '所属分公司' },
        { prop: 'compAccountShortName', width: 130, label: '银行简称' },
        { prop: 'compBankName', width: 100, label: '我司银行名称' },
        { prop: 'compAccountNo', width: 130, label: '我司银行账号' },
        { prop: 'compAccountName', width: 130, label: '我司银行账户名' },
        { prop: 'currency', width: 70, label: '币种' },
        { prop: 'amt', width: 100, label: '金额' },
        { prop: 'rivalBankName', width: 100, label: '对方银行名称' },
        { prop: 'rivalAccountNo', width: 130, label: '对方银行账号' },
        { prop: 'rivalAccountName', width: 130, label: '对方银行账户名' },
        { prop: 'remark', minWidth: 150, label: '银行备注' },
        { prop: 'parseRemark', minWidth: 150, label: '解析备注' },
        { prop: 'createdName', width: 100, label: '导入人' },
        { prop: 'createdTime', width: 130, label: '导入时间' },
      ],
    }
  },
  watch: {
    dialogVisible(val) {
      if (!val) {
        this.uploadParams.template = this.uploadParams.file = ''
      }
    },
  },
  computed: {
    ...mapState({
      userId: (state) => state.user.userId,
    }),
  },
  created() {
    // 搜索配置
    let searchInputGroup = ['bankAccBillNo', 'compBankName', 'receivePayDate']
    this.searchOption = {
      saveShow: true,
      saveName: 'compareBillBankList',
      listHeightFunc: this.computeFinTableHeight,
      isNotAutoLoad: true,
      addFilter: {
        defaultSearchLength: searchInputGroup.length,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          bankAccBillNo: { label: '银行账单编号', type: 'input' },
          receivableRegNo: { label: '收款登记号', type: 'input' },
          receivePayDate: { label: '收付日期', type: 'daterange', format: 'yyyy-MM-dd' },
          receivePayType: { label: '收付类型', type: 'select', prop: 'receipayGroup', showType: '2' },
          receivableRegStatus: { label: '是否收款登记', type: 'select', prop: 'yesNo' },
          receivableRegConfirmStatus: { label: '收款登记确认状态', type: 'select', prop: 'receivableRegStatus' },
          receivableRegWriteoffStatus: { label: '核销状态', type: 'select', prop: 'writeoffStatus' },
          bankSeqNo: { label: '银行流水号', type: 'input' },
          settleCompCode: {
            label: '所属分公司',
            prop: 'settleCorpCode',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            remoteSelectList: [],
          },
          compAccountId: {
            label: '银行简称',
            prop: 'compAccountId',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.bankAccountListAll(queryString, item),
            visibleChange: (queryString, item) => this.bankAccountListAll(queryString, item),
            remoteSelectList: [],
          },
          // compAccountShortName: { label: '银行简称', type: 'input' },
          compBankName: { label: '我司银行名称', type: 'input' },
          compAccountNo: { label: '我司银行账号', type: 'input' },
          compAccountName: { label: '我司银行账户名', type: 'input' },
          currency: { label: '币种', type: 'select', prop: 'validCurrencyNR' },
          amt: { label: '金额', type: 'range' },
          rivalBankName: { label: '对方银行名称', type: 'input' },
          rivalAccountNo: { label: '对方银行账号', type: 'input' },
          rivalAccountName: { label: '对方银行账户名', type: 'input' },
          createdBy: {
            label: '导入人',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          createdTime: { label: '导入时间', type: 'daterange', format: 'yyyy-MM-dd' },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.option1 = {
      ...this.option,
      id: 'option1',
      $name: 'PreCloseAuditTab',
      pagination,
      sortable: true,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
    }
    this.option1.operationBtns = Object.assign({}, this.option.operationBtns, { show: false })
    this.option1.listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    this.option1.emptyText = '数据将在查询后显示'
    let sortableArr = ['bankAccBillNo', 'receivePayDate', 'amt', 'createdTime']
    this.selfColumnsBase = this.selfColumnsBase.map((item) => {
      item.sortable = sortableArr.includes(item.prop)
      return item
    })
    let columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.option1.columns = columns
    this.option1.customColumns = {
      show: true,
      handleCustomColumns: () => {
        if (!this.isNotFirtGetData) {
          this.getData(false, true).then((res) => setTimeout(() => (this.customColumnsPopShow = true), 600))
        } else {
          this.customColumnsPopShow = true
        }
      },
    }
    this.optionMaxHeight = this.option1
    // this.getData()
  },
  methods: {
    bankAccountListAll(accountShortName, item) {
      let data = { currPage: 1, pageSize: 30, accountShortName, currency: '', status: 'effect', unitType: 'company' }
      bankAccountListAll(data).then((res) => {
        let data = res.data.map((item) => ({
          label: item.accountShortName,
          value: item.settleUnitBankAcctId,
        }))
        this.remoteSelectCommon(item, data)
      })
    },
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    sendMulti(data) {
      this.multipleSelection1 = data
      let data2 = {
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        query: [],
      }
      let ids = this.multipleSelection1.map((item) => item.bankAccStatementId).join(',')
      if (ids) {
        data2.query.push({ column: 'bankAccStatementId', type: 'in', value: ids })
      } else {
        data2.query = this.searchBackup || []
      }
      if (data.length || this.option1.listAmtSummary.count++ > 0) {
        this.debounceLs(() => {
          this.getListAmtSummary(data2)
        })
      }
    },
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        query: [],
        columns: [],
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption, true, true)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      return bankListPage(data)
        .then((res) => {
          this.finCommonColumns(res)
          if (customerList) return
          this.option1.data = res.data.list || []
          this.$set(this.option1, 'emptyText', '未查询到任何数据')
          Object.assign(this.option1.pagination, res.data)
        })
        .finally(() => (this.lsLoading = false))
    },
    getListAmtSummary(data) {
      bankListPageSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          let labelObj = {
            recvAmtListLabel: '收款金额',
            payAmtListLabel: '付款金额',
          }
          let colorObj = {
            recvAmtListColor: 'red', // 支持red, green, black三种值
            payAmtListColor: 'green',
          }
          let data = res.data
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data,
            labelObj,
            colorObj,
            place: 'top',
          })
        }
      })
    },
    download() {
      this.$store
        .dispatch('finance/downloadBlobFilePost', {
          uri: '/fin/bankAccStatement/templateDownload',
          data: {},
        })
        .then((res) => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = '固定模板.xlsx'
          link.click()
        })
    },
    remarkCompare() {
      if (!this.multipleSelection1.length) {
        return this.$msgErrClose('请选择需要操作的项!')
      }
      let bankSeqIds = this.multipleSelection1.map((item) => item.bankAccStatementId)
      this.$confirm('是否参与对账？', '', {
        distinguishCancelAndClose: true,
        confirmButtonText: '是',
        confirmButtonClass: 'el-button--success',
        cancelButtonText: '否',
        cancelButtonClass: 'el-button--danger',
      })
        .then(() => this.sureRemarkCompare({ bankSeqIds, compare: 'yes' }))
        .catch((action) => action === 'cancel' && this.sureRemarkCompare({ bankSeqIds, compare: 'no' }))
    },
    sureRemarkCompare(data) {
      remarkCompare(data).then((res) => {
        this.$msgSucClose('操作成功！')
        this.getData()
      })
    },
    sendResUpload(val) {
      this.dialogVisible = false
      this.option1.pagination.currPage = 1
      this.getData()
    },
    createReceivableReg() {
      let rows = this.multipleSelection1
      if (!rows.length) {
        return this.$msgErrClose('请选择需要操作的项！')
      }
      let arr = rows.filter((v) => v.receivePayType === 'receive')
      if (!arr.length) {
        return this.$msgErrClose('请选择应收银行流水进行操作！')
      }
      this.$confirmWarn(`当前选中了 ${arr.length} 条应收银行流水，是否确认批量收款登记？`, () => {
        this.lsLoading = true
        createReceivableReg({ bankAccStatementIds: arr.map((v) => v.bankAccStatementId) })
          .then((res) => {
            this.handleCurrentChange(1)
            this.$msgSucClose('操作成功！')
          })
          .finally(() => (this.lsLoading = false))
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.finance-list-container ::v-deep {
  .el-button.el-button--text {
    margin-left: 5px;
    margin-right: 5px;
  }
  .el-radio-group {
    .el-radio {
      line-height: 20px !important;
      .el-radio__label {
        padding-left: 4px;
        font-size: 12px;
      }
    }
  }
  .el-form-item__content > div textarea {
    min-height: 60px !important;
  }
}
.el-dialog .title {
  font-size: 12px;
  color: #222222;
  font-weight: bold;
  margin-bottom: 12px;
}
.el-dialog .big {
  padding: 8px 0;
  font-size: 12px;
  &.index {
    color: #bfbfbf;
    font-weight: bold;
  }
}
.el-dialog .el-table.border-table ::v-deep td {
  border-right: 1px solid #ebeef5 !important;
}
.el-dialog .el-form ::v-deep label {
  font-size: 12px !important;
}
</style>