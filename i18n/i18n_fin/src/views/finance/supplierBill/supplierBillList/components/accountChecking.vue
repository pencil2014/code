<template>
  <div class="finance-page">
    <div class="finance-list-container" v-show="!showSettlementDetail">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">{{$t('Supplier.reconciliation')}}</div>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" @click="closeAccountChecking" size="mini">{{$t('Common.back')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="supplierBillId"
              class="finance-btn"
              @click="importFee('auto')"
              size="mini"
            >{{supplierBillId ? $t('Supplier.autoImportFees') : $t('Supplier.autoImportNo')}}</el-button>
            <el-button
              class="finance-btn"
              v-if="supplierBillId"
              @click="importFee('settle_order')"
              size="mini"
            >{{$t('Supplier.statementImport')}}</el-button>
            <el-button class="finance-btn" type="primary" @click="compare" size="mini">{{$t('Supplier.reconciliation')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" @click="allConfirm" size="mini">{{$t('Supplier.confirmationFee')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              type="primary"
              @click="createSettlement"
              size="mini"
            >{{$t('FeeList.single')}}</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    <div class="settlement-detail-form" v-show="!showSettlementDetail">
      <SupplierBillDetailForm
        type="express"
        source="checking"
        :supplierBillDetailForm="supplierBillDetailForm"
        :isCompared="isCompared"
      />
    </div>
    <div class="finance-table-double" v-show="!showSettlementDetail">
      <div class="finance-table-container">
        <div class="money-box money-box-overflow">
          <div class="money-box-left">
            <div class="money-title">{{expressBillId ? $t('Supplier.courierbill') : $t('Supplier.supplierBill')}}</div>
            <TableTitle :num="supplierNum" :pay="supplierPay" :receive="supplierReceive" />
          </div>
        </div>
        <FinanceTable :option="option1" />
      </div>
      <div class="finance-table-container">
        <div class="money-box money-box-overflow">
          <div class="money-box-left">
            <div class="money-title">{{expressBillId ? $t('Supplier.mailingInfo') : $t('Supplier.feeInfo')}}</div>
            <TableTitle :num="companyNum" :pay="companyPay" :receive="companyReceive" />
          </div>
        </div>
        <FinanceTable :option="option2" />
      </div>
    </div>
    <div class="finance-bill-detail-container" v-if="showSettlementDetail">
      <component
        :is="currentComponent"
        :source="source"
        :supplier-bill-id="supplierBillId"
        @close-settlement-detail="closeSettlementDetail"
      />
    </div>
    <el-dialog
      :title="$t('Supplier.selectStatement')"
      :visible.sync="dialogVisible"
      class="finance-select-settlement"
      width="1036px"
    >
      <SettlementList
        ref="settlementList"
        :justSelect="true"
        :supplierSettleCorpCode="supplierBillDetailForm.supplierCorpCode"
        @select-settlement="selectSettlement"
        @close-select-settlement="closeSelectSettlement"
      />
    </el-dialog>
    <!-- 修改结算单位 -->
    <el-dialog
      class="page"
      v-if="exchangeCorpDialog"
      :visible.sync="exchangeCorpDialog"
      :title="$t('FeeList.single')"
      width="500px"
      label-width="130px"
    >
      <el-form :model="corpForm" ref="corpForm" :rules="corpRules" size="mini" label-suffix=":">
        <el-form-item :label="$t('Supplier.branchState')" prop="settleCorp">
          <el-select
            style="width: 100%;"
            v-model="corpForm.settleCorp"
            value-key="value"
            :placeholder="$t('Common.plSelect')"
            filterable
            remote
            :remote-method="(val) => settleCorpSelectRemote(val)"
            @visible-change="(val) => val && settleCorpSelectRemote('')"
          >
            <el-option
              v-for="(item,index) in settleCorpSelectList"
              :key="item.value+item.label+index"
              :label="item.label"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <span style="color:#BFBFBF;padding-left: 130px;">{{$t('Supplier.courierfee')}}</span>
      </el-form>
      <div class="dialog-footer" slot="footer">
        <el-button @click="exchangeCorp" size="mini" type="primary">{{$t('Common.sure')}}</el-button>
        <el-button @click="exchangeCorpDialog = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import SupplierBillDetailForm from './supplierBillDetailForm'
import SettlementList from '@/views/finance/supplierBill/supplierBillList/components/components/selectSettlement'
// import SettlementList from '@/views/finance/settlement/settlementList'
import TableTitle from './tableTitle'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import {
  getSupplierBillDetail,
  confirmAll,
  importFee,
  listCompanyFeePage,
  listSupplierBillFeePage,
  supplierGenerateSo,
  diffCompare,
  autoImportFee,
  settleOrderImportFee,
  compare,
  listImportCompanyFeePage,
  getImportCompanyFeeTotal,
} from '@/api/fin/supplierBill'
import EXPRESS from '@/api/fin/expressBill'
export default {
  mixins: [mixin, routerMixin],
  // props: {
  //   supplierBillId: {
  //     type: Number,
  //     default: -1,
  //   },
  // },
  activated() {
    if (this.$route.meta.isUseCache) {
      return
    }
    // this.$options.created.forEach((fn) => fn.call(this))
    this.supplierBillId = this.$route.query.supplierBillId
    this.expressBillId = this.$route.query.expressBillId
    // 详情form
    this.getData()
    // 表格数据
    // this.option2.data = []
    // this.option2.pagination.currPage = 1
    // this.option2.pagination.currPage = 1
    this.isCompared = false
    this.initRes(this.option2, { data: { list: [], ...this.option.pagination, show: true, isNew: true } })
    this.companyPay = []
    this.companyReceive = []
    this.handleCurrentChange(1, this.option1)
    this.expressBillId && this.importFee('auto')
    // this[option === this.option1 ? 'getSupplierFeePage' : 'importFee']()
    // this.getSupplierFeePage()
  },
  data() {
    return {
      option1: {},
      option2: {},
      supplierBillDetailForm: {},
      dialogVisible: false,
      showSettlementDetail: false,
      source: '',
      dialogVisibleDiff: false,
      companyNum: 0,
      companyPay: [],
      companyReceive: [],
      supplierNum: 0,
      supplierPay: [],
      supplierReceive: [],
      isCompared: false,
      supplierBillId: undefined,
      expressBillId: undefined,
      settleOrderNos: [],
      corpForm: { settleCorp: '' },
      corpRules: { settleCorp: [{ required: true, message: ' ', trigger: 'change' }] },
      settleCorpSelectList: [],
      exchangeCorpDialog: false,
    }
  },
  components: {
    FinanceTable,
    SettlementList,
    SupplierBillDetailForm,
    TableTitle,
  },
  created() {
    this.supplierBillId = this.$route.query.supplierBillId
    this.expressBillId = this.$route.query.expressBillId
    let operationBtns = { show: false }
    let cmmCfg = { data: [], operationBtns, selection: false, tips: { text: '', show: false } }
    this.option1 = Object.assign({}, this.option, cmmCfg, {
      id: 'option1',
      $name: 'SupplierBillListCheck1',
      pagination: { ...this.option.pagination, show: true, isNew: true },
    })
    this.option2 = Object.assign({}, this.option, cmmCfg, {
      id: 'option2',
      $name: 'SupplierBillListCheck2',
      pagination: { ...this.option.pagination, show: true, isNew: true },
    })
    let columns = [
      {
        prop: 'orderNo',
        label: this.$t('Supplier.OrderNo'),
        type: 'text',
        width: '140px',
      },
      {
        prop: 'supplierCorpName',
        label: this.$t('FeeList.settleCorp'),
        type: 'text',
      },
      {
        prop: 'payType',
        label: this.$t('FeeList.receipayType'),
        type: 'select',
        propInDict: 'receipayGroup',
        width: '70px',
      },
      {
        prop: 'feeName',
        label: this.$t('Common.fees'),
        type: 'text',
      },
      {
        prop: 'amt',
        label: this.$t('FeeList.feeAmt'),
        type: 'text',
      },
      {
        prop: 'currency',
        label: this.$t('FeeList.currency'),
        type: 'text',
        width: '50px',
      },
    ]
    let expressColumns = [
      {
        prop: 'expressNo',
        label: this.$t('Supplier.courierNumber'),
        type: 'text',
        width: '140px',
      },
      {
        prop: 'supplierCorpName',
        label: this.$t('Supplier.courierCompany'),
        type: 'text',
      },
      {
        prop: 'currency',
        label: this.$t('FeeList.currency'),
        type: 'text',
      },
      {
        prop: 'amt',
        label: this.$t('FeeList.feeAmt'),
        type: 'text',
      },
    ]
    let feeArr = ['expressNo', 'expressCorpName', 'currency', 'amt']
    this.option1.columns = this.expressBillId ? expressColumns : columns
    this.option2.columns = this.expressBillId
      ? expressColumns.map((item, index) => {
          return { ...item, prop: feeArr[index] }
        })
      : [
          ...columns.map((item) => {
            if (item.prop === 'supplierCorpName') return { ...item, prop: 'settleCorpName' }
            if (item.prop === 'amt') return { ...item, prop: 'feeAmt' }
            if (item.prop === 'currency') return { ...item, prop: 'feeCurrency' }
            return item
          }),
          { prop: 'settleAmt', label: this.$t('Settle.settleAmt'), type: 'text' },
        ]

    // this.option1.columns = columns
    // this.option2.columns = columns.map((item) => {
    //   if (item.prop === 'supplierCorpName') return { ...item, prop: 'settleCorpName' }
    //   if (item.prop === 'amt') return { ...item, prop: 'feeAmt' }
    //   if (item.prop === 'currency') return { ...item, prop: 'feeCurrency' }
    //   return item
    // })
  },
  methods: {
    // 获取对账详情
    getData() {
      if (this.supplierBillId) {
        // 获取供应商对账详情
        return getSupplierBillDetail({ supplierBillId: this.supplierBillId }).then(({ data }) => {
          let { companyNum, companyPayMap, companyReceiveMap, supplierNum, supplierPayMap, supplierReceiveMap } = data
          let fn = (obj, isPay) => Object.keys(obj || {}).map((key) => ({ currency: key, amt: obj[key], isPay }))
          this.supplierPay = fn(supplierPayMap, true)
          this.supplierReceive = fn(supplierReceiveMap, false)
          // this.companyPay = fn(companyPayMap, true)
          // this.companyReceive = fn(companyReceiveMap, false)
          this.supplierBillDetailForm = {
            ...data,
            statementType: this.supplierBillDetailForm.statementType || data.statementType,
            matchResult: data.result || data.matchResult,
          }
          this.supplierBillDetailForm.bizDate = data.bizDateStart + '~' + data.bizDateEnd
        })
      }
      this.getDataExpress()
    },
    // 获取寄单对账详情
    getDataExpress() {
      EXPRESS.detail({ expressBillId: this.expressBillId }).then((res) => {
        let { feeTotalAmt, bizDateStart, bizDateEnd } = res.data
        let fn = (obj) => Object.keys(obj || {}).reduce((str, cur) => (str += cur + obj[cur] + '&nbsp;&nbsp;'), '')
        let fn2 = (obj, isPay) => Object.keys(obj || {}).map((key) => ({ currency: key, amt: obj[key], isPay }))
        this.supplierPay = fn2(feeTotalAmt, true)
        let supplierPayMapStr = fn(feeTotalAmt)
        this.supplierBillDetailForm = Object.assign({}, res.data, {
          bizDate: bizDateStart + '~' + bizDateEnd,
          supplierPayMapStr,
          matchResult: res.data.result || res.data.matchResult,
          compareType: res.data.compareType || this.dictMap['expressBillCompareType'][0].value
        })
      })
    },
    // 点击导入按钮时 ，初始化分页为首页， 并需更新费用信息总应付
    initImportFee(isInit) {
      if (isInit === false) {
        return (this.importFeeStatus = false)
      }
      this.importFeeStatus = true
    },
    // 导入费用
    importFee(type) {
      if (type) {
        this.btnImport = true
        this.option2.pagination.currPage = 1
        this.initImportFee()
      }
      this.importType = type || this.importType
      if (this.importType === 'auto') {
        this.listImportCompanyFeePage('auto')
      } else if (this.importType === 'settle_order') {
        this.dialogVisible = true
        this.$nextTick(() => {
          this.$refs['settlementList'].handleCurrentChange(1)
        })
      }
    },
    // 初始化请求数据
    initData(type) {
      let auto = type === 'auto'
      let option = !type ? this.option1 : this.option2
      // 寄单对账
      if (this.expressBillId) {
        return {
          currPage: option.pagination.currPage,
          pageSize: option.pagination.pageSize,
          query: [
            {
              column: 'expressBillId',
              type: 'default',
              value: this.expressBillId,
            },
          ],
        }
      }
      // 供应商列表请求
      let req1 = [
        {
          column: 'supplierBillId',
          type: 'default',
          value: this.supplierBillId,
        },
      ]
      // 费用列表请求
      let req2 = [
        {
          column: 'importType',
          type: 'default',
          value: type,
        },
        {
          column: 'supplierBillId',
          type: 'default',
          value: this.supplierBillId,
        },
      ]
      if (!auto) {
        req2.push({
          column: 'settleOrderNos',
          type: 'default',
          value: this.settleOrderNos.join(','),
        })
      }
      return {
        currPage: option.pagination.currPage,
        pageSize: option.pagination.pageSize,
        query: !type ? req1 : req2,
      }
    },
    // 初始化相应数据
    initRes(option, res) {
      option.data = res.data.list || []
      Object.assign(option.pagination, res.data)
      // option.pagination.currPage = res.data.currPage
      // option.pagination.pageSize = res.data.pageSize
      // option.pagination.totalCount = res.data.totalCount
    },
    // 导入费用
    listImportCompanyFeePage(type) {
      let companyMethod = this.supplierBillId ? listImportCompanyFeePage : EXPRESS.listCompanyFeePage
      companyMethod(this.initData(type)).then((res) => {
        if (this.btnImport) {
          this.btnImport = false
          if (this.supplierBillId && !res.data.list.length) {
            this.btnImport = true
            return this.$msgErrClose(this.$t('Supplier.nomatch'))
          }
          this.supplierBillId && this.$msgSucClose(this.$t('Supplier.importedSuc'))
        }
        this.initRes(this.option2, res)
        let supplierData =
          type === 'auto'
            ? { supplierBillId: this.supplierBillId }
            : {
                supplierBillId: this.supplierBillId,
                settleOrderNos: this.settleOrderNos,
              }
        if (this.importFeeStatus === false) return
        let totalMethod = this.supplierBillId ? getImportCompanyFeeTotal : EXPRESS.getCompanyFeeTotal
        let data = this.supplierBillId ? { importType: type, ...supplierData } : { expressBillId: this.expressBillId }
        console.log(data)
        totalMethod(data).then((res) => {
          this.initImportFee(false)
          let obj = res.data[this.supplierBillId ? 'payTotal' : 'feeTotalAmt'] || {}
          this.companyPay = Object.keys(obj).map((key) => ({ currency: key, amt: obj[key], isPay: true }))
          obj = res.data.receiveTotal || {}
          this.companyReceive = Object.keys(obj).map((key) => ({ currency: key, amt: obj[key] }))
        })
      })
    },
    // 导入费用--结算单
    selectSettlement(row) {
      this.settleOrderNos = row.map(item => item.settleOrderNo)
      this.option2.pagination.currPage = 1
      this.btnImport = true
      this.listImportCompanyFeePage('settle_order')
    },
    // 供应商/寄单账单列表
    getSupplierFeePage() {
      let method = this.supplierBillId ? listSupplierBillFeePage : EXPRESS.listExpressBillFeePage
      method(this.initData()).then((res) => {
        this.initRes(this.option1, res)
      })
    },
    // 执行对账
    compare() {
      if (this.supplierBillId) {
        if (!this.supplierBillDetailForm.statementType) {
          return this.$msgErrClose(this.$t('Supplier.comparmethodTips'))
        }
        if (!this.importType) {
          return this.$msgErrClose(this.$t('Supplier.importfees'))
        }
      }
      if (!this.option2.data.length) {
        return this.$msgErrClose(this.supplierBillId ? this.$t('Supplier.withoutcom') : this.$t('Supplier.noreconci'))
      }
      let method = this.supplierBillId ? compare : EXPRESS.compare
      let data = {
        supplierBillId: this.supplierBillId,
        statementType: this.supplierBillDetailForm.statementType,
        importType: this.importType,
      }
      if (this.importType !== 'auto') {
        data.settleOrderNos = this.settleOrderNos
      }

      if (this.expressBillId) {
        if (!this.supplierBillDetailForm.compareType) {
          return this.$msgErrClose( this.$t('Supplier.comparmethodTips'))
        }
        data = { expressBillId: this.expressBillId, compareType: this.supplierBillDetailForm.compareType }
      }
      method(data).then((res) => {
        this.getData()
        // 修改为不清空
        // this.companyPay = []
        // this.companyReceive = []
        // this.option2.data = []
        // this.option2.pagination = { ...this.option.pagination, show: true }
        this.$msgSucClose( this.$t('Supplier.reconciliationSuc'))
        this.isCompared = true
      })
    },
    handleSizeChange(val, option) {
      option.pagination.pageSize = val
      this[option === this.option1 ? 'getSupplierFeePage' : 'importFee']()
    },
    handleCurrentChange(val, option) {
      if (!option) return
      option.pagination.currPage = val
      this[option === this.option1 ? 'getSupplierFeePage' : 'importFee']()
    },
    closeSelectSettlement() {
      this.dialogVisible = false
    },
    // 确认费用
    allConfirm(del) {
      if (this.supplierBillDetailForm.matchResult !== 'all') {
        return this.$msgErrClose( this.$t('Supplier.exactlymatch'))
      }
      let data = this.supplierBillId ? { supplierBillId: this.supplierBillId } : { expressBillId: this.expressBillId }
      let method = this.supplierBillId ? confirmAll : EXPRESS.confirm
      method(data).then((res) => {
        if (del === true) return
        this.$msgSucClose( this.$t('Supplier.allconfirm'))
        this.supplierBillDetailForm.confirmStatus = 'yes'
        this.expressBillId && this.importFee('auto')
      })
    },
    // 生成结算单
    createSettlement() {
      if (this.supplierBillDetailForm.matchResult !== 'all') {
        return this.$msgErrClose( this.$t('Supplier.cannotgen'))
      }
      if (this.supplierBillDetailForm.confirmStatus !== 'yes') {
        return this.$msgErrClose( this.$t('Supplier.expenseconfir'))
      }
      if (this.expressBillId) {
        this.corpForm.settleCorp = ''
        this.exchangeCorpDialog = true
        let { settleCompanyCode, settleCompanyName } = this.$store.state.user.userInfo
        this.$nextTick(() => {
          this.settleCorpSelectList = [{ value: settleCompanyCode, label: settleCompanyName }]
          this.corpForm.settleCorp = this.settleCorpSelectList[0]
        })
        return
        return this.routerPush('CreateSettlement', {
          source: 'createSettlementFromExpressBill',
          expressBillId: this.expressBillId,
          supplierBillNo: this.supplierBillDetailForm.supplierBillNo,
        })
      }
      // 供应商对账改造后不会进入此页面
      // this.routerPush('CreateSettlement', {
      //   source: 'createSettlementFromSupplierBill',
      //   supplierBillId: this.supplierBillId,
      //   supplierBillNo: this.supplierBillDetailForm.supplierBillNo,
      // })
    },
    settleCorpSelectRemote(queryString) {
      this.$store.dispatch('dict/querySettleUnit', { queryString, unitTypes: 'company' }).then((data) => {
        this.settleCorpSelectList = data.map((item) => ({ label: item.value, value: item.key }))
      })
    },
    exchangeCorp() {
      this.$refs.corpForm.validate((valid) => {
        if (!valid) return
        this.exchangeCorpDialog = false
        this.routerPushTab('CreateSettlement', {
          source: 'createSettlementFromExpressBill',
          expressBillId: this.expressBillId,
          settleCompCode: this.corpForm.settleCorp.value,
          settleCompName: this.corpForm.settleCorp.label,
          supplierBillNo: this.supplierBillDetailForm.supplierBillNo,
        })
      })
    },
    closeSettlementDetail() {
      this.showSettlementDetail = false
    },
    closeAccountChecking() {
      this.routerBack()
    },
  },
}
</script>
<style scoped>
.finance-detail-page {
  background: #fff;
}
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}
.el-form-item {
  width: 260px;
  margin-bottom: 7px;
  margin-right: 24px;
}
.el-form-item-text {
  font-size: 12px;
  /* width: 180px; */
}
/* .settlement-detail-form {
  padding: 20px 16px 8px;
} */
.settlement-exchange-rates {
  width: 260px;
  display: inline-block;
  margin-right: 24px;
  vertical-align: top;
}
.settlement-exchange-rates .settlement-exchange-rates-title {
  color: #222222;
  line-height: 28px;
}
/* .finance-table-container {
  margin: 4px 16px 18px;
} */

.finance-table-double {
  display: flex;
  margin-top: 11px;
}
.finance-table-double .finance-table-container:nth-child(1) {
  margin-right: 10px;
}
.finance-table-double .finance-table-container:nth-child(2) {
  margin-left: 10px;
}
.finance-table-double .finance-table-container {
  width: calc(50% - 26px);
}

.money-box.money-box-overflow {
  line-height: 40px;
  height: 40px;
  overflow-y: auto;
}
.money-box.money-box-overflow .money-title {
  min-width: 80px;
}
</style>
<style lang="scss" scoped>
.finance-select-settlement .el-dialog__body {
  padding: 0;
}
.finance-select-settlement .finance-page {
  min-height: calc(100vh - 348px);
}
.finance-diff-compare .el-dialog {
  min-height: 500px;
}
.finance-table-double .finance-table-container + .finance-table-container {
  margin-top: 4px !important;
}
.page ::v-deep .el-dialog__body .el-input--mini,
.page ::v-deep .el-dialog__body .el-date-editor--daterange {
  width: 260px;
}
.page ::v-deep .el-dialog__body {
  padding: 30px 24px;
  .el-form-item {
    display: flex;
    width: 100%;
    & > label {
      flex: 0 0 auto;
    }
    .el-form-item__content {
      flex: 1 1 auto;
    }
  }
  .el-autocomplete,
  .el-autocomplete .el-input,
  .el-autocomplete .el-input input .el-autocomplete,
  .el-select,
  .el-select .el-input,
  .el-select .el-input input,
  .upload-file-cont {
    width: 100% !important;
  }
}
</style>