<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">{{$t('Supplier.reconciResults')}}</div>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" @click="closeAccountChecking" size="mini">{{$t('Common.back')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" type="primary" @click="compare" size="mini">{{$t('Supplier.reconciliation')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              @click="allConfirm"
              :loading="btnLoading"
              size="mini"
            >{{$t('Supplier.confirmationFee')}}</el-button>
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
    <div class="settlement-detail-form">
      <el-form :model="detailForm" ref="form" :inline="true" size="mini" label-width="100px" label-suffix=":">
        <DetailDiv :label="$t('Supplier.statementNo')" :content="detailForm.supplierBillNo"></DetailDiv>
        <DetailDiv :label="$t('Supplier.courierCompany')" :content="detailForm.supplierCorpName" :isTooltip="true"></DetailDiv>
        <DetailDiv :label="$t('Supplier.settlementBranch')" :content="detailForm.settleCompName" :isTooltip="true"></DetailDiv>
        <el-form-item :label="$t('Supplier.comparMethod')" prop="compareType">
          <el-select v-model="detailForm.compareType" :placeholder="$t('Common.plEnter')">
            <el-option
              v-for="(op, j) in dictMap['expressBillCompareType']"
              :key="'expressBillCompareType' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <DetailDiv
          :label="$t('FeeList.confirmation')"
          :content="dictMapObj['webConfirmStatus'][detailForm.confirmStatus]"
        ></DetailDiv>
      </el-form>
    </div>
    <div class="table_card">
      <h3>
        {{$t('Supplier.comparresults')}}
        <span
          :style="{color:detailForm.matchResult !='all'? '#CD4130':'#33B18A'}"
          :class="[detailForm.matchResult !='all'?'el-icon-info' : 'el-icon-success']"
        ></span>
        <span
          :style="{color:detailForm.matchResult !='all'? '#CD4130':'#33B18A'}"
          v-html="dictMapObj['supplierBillCompareMatchResult'][detailForm.matchResult]"
        ></span>
        <!-- v-if="checkAuth($route.name, 'btn-exportData')" -->

        <el-radio-group
          style="float:right;margin-left: 8px;"
          v-model="matchResult"
          size="mini"
          @change="matchResultChange"
        >
          <el-radio-button label>{{$t('Common.all')}}</el-radio-button>
          <el-radio-button label="yes">{{$t('Common.match')}}</el-radio-button>
          <el-radio-button label="no">{{$t('Common.mismatch')}}</el-radio-button>
        </el-radio-group>
        <el-button style="float:right;" type="default" size="mini" @click="exportData">{{$t('Common.export')}}</el-button>
      </h3>
      <FinanceTableMass :option="option1" />
    </div>
    <!-- 修改结算单位 -->
    <el-dialog
      class="page"
      v-if="exchangeCorpDialog"
      :visible.sync="exchangeCorpDialog"
      :title="$t('FeeList.single')"
      width="500px"
      label-width="130px"
    >
      <el-form :model="corpForm" ref="corpForm" :rules="corpRules" size="mini">
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
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { querySourceTypeByNo } from '@/api/fin/fee'
import EXPRESS from '@/api/fin/expressBill'
export default {
  mixins: [mixin, routerMixin],
  activated() {
    if (this.$route.meta.isUseCache) {
      return
    }
    this.expressBillId = this.$route.query.expressBillId
    this.getData()
  },
  data() {
    return {
      option1: {},
      detailForm: {},
      dialogVisible: false,
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
      matchResult: '',
    }
  },
  components: {
    FinanceTableMass,
  },
  created() {
    let common = { data: [], tips: { show: false }, selection: false, rootTipsHide: true, operationBtns: false }
    this.option1 = Object.assign({}, this.option, common, {
      id: 'option1',
      $name: 'ExpressBillListResult',
      index: { show: true },
      pagination: { ...this.option.pagination, show: true, isNew: true },
      columns: [],
      colgroups: [
        {
          title: this.$t('Supplier.supplierFees'),
          // className: 'express',
          className: 'supplier',
          columns: [
            { prop: 'matchResult', label: this.$t('Supplier.matchornot'), type: 'select', propInDict: 'yesNo', width: 60 },
            { prop: 'matchRemark', label: this.$t('Supplier.varianceDes'), width: 130, type: 'text' },
            { prop: 'supplierExpressNo', label: this.$t('Supplier.courierNumber'), width: 150, type: 'text' },
            { prop: 'supplierCorpName', label: this.$t('Supplier.courierCompany'), type: 'text', width: 200 },
            { prop: 'supplierFeeCurrency', label: this.$t('FeeList.currency'), type: 'text', width: 60 },
            { prop: 'supplierFeeAmt', label: this.$t('FeeList.feeAmt'), type: 'text', width: 80 },
            { prop: 'supplierRemark', label: this.$t('Common.remark'), type: 'text', width: 200 },
            // { prop: 'supplierReceipayType', label: this.$t('FeeList.receipayType'), type: 'select', propInDict: 'feeitemReceipayGroup', width: 60 },
            // { prop: 'supplierFeeName', label: this.$t('FeeList.feeEname'), type: 'text', width: 80 },
          ],
        },
        {
          title: this.$t('Hedge.systemCost'),
          // className: 'express_system',
          className: 'system',
          columns: [
            { prop: 'expressNo', label: this.$t('Supplier.courierNumber'), width: 150, type: 'text' },
            { prop: 'expressCorpName', label: this.$t('Supplier.courierCompany'), type: 'text', width: 200 },
            { prop: 'settleCompName', label: this.$t('Supplier.settlementBranch'), type: 'text', width: 200 },
            { prop: 'feeCurrency', label: this.$t('FeeList.currency'), type: 'text', width: 60 },
            { prop: 'feeAmt', label: this.$t('FeeList.feeAmt'), type: 'text', width: 80 },
            {
              prop: 'orderNo',
              label: this.$t('FeeList.orderNo'),
              width: 150,
              component: 'ColumnTip',
              componentProps: {
                show: false,
                data: [],
                callback: (no, componentProps) => {
                  querySourceTypeByNo({ sourceBizNo: no }).then((res) => {
                    this.showOneNoDetail(res.data.sourceType, res.data.sourceBizNo)
                  })
                },
              },
            },
            { prop: 'employeeName', label: this.$t('FinBill.employeeId'), type: 'text', width: 130 },
            {
              prop: 'hasSettleOrderAfterCompare',
              label: this.$t('Supplier.reconcgensta'),
              type: 'select',
              propInDict: 'yesNo',
              width: 150,
            },
            { prop: 'settleOrderNo', label: this.$t('FeeList.settleOrderNo'), type: 'text', width: 150 },
            // { prop: 'receipayType', label: this.$t('FeeList.receipayType'), type: 'select', propInDict: 'feeitemReceipayGroup', width: 80 },
            // // { prop: 'feeName', label: this.$t('FeeList.feeEname'), type: 'text' },
            // { prop: 'feeAmt',label: this.$t('Supplier.sysorigiAmt'), type: 'text', width: 80 },
            // { prop: 'matchAmt', label: this.$t('Supplier.reconciAmt'), type: 'text', width: 110 },
            // { prop: 'currency', label: this.$t('Supplier.sysCurrency'), type: 'text', width: 60 },
            // { prop: 'diffAmt', label: this.$t('Supplier.balance'), type: 'text', width: 80 },
            // { prop: 'orderNo', label: this.$t('Supplier.feerecogstatus'), type: 'text' },
            // { prop: 'orderNo', label: this.$t('Supplier.feecreator'), type: 'text' },
          ],
        },
      ],
    })
  },
  methods: {
    // 获取寄单对账详情
    getData() {
      this.matchResult = ''
      EXPRESS.detail({ expressBillId: this.expressBillId }).then((res) => {
        let { feeTotalAmt, bizDateStart, bizDateEnd } = res.data
        let fn = (obj) => Object.keys(obj || {}).reduce((str, cur) => (str += cur + obj[cur] + '&nbsp;&nbsp;'), '')
        let fn2 = (obj, isPay) => Object.keys(obj || {}).map((key) => ({ currency: key, amt: obj[key], isPay }))
        this.supplierPay = fn2(feeTotalAmt, true)
        let supplierPayMapStr = fn(feeTotalAmt)
        this.detailForm = Object.assign({}, res.data, {
          bizDate: bizDateStart + '~' + bizDateEnd,
          supplierPayMapStr,
          matchResult: res.data.result || res.data.matchResult,
          compareType: res.data.compareType || this.dictMap['expressBillCompareType'][0].value,
        })
        this.getTableData()
      })
    },
    matchResultChange(val) {
      console.log(val)
      this.option1.pagination.currPage = 1
      this.getTableData()
    },
    getTableData() {
      let timeStamp = +new Date()
      if (this.diyTimeStamp && timeStamp - this.diyTimeStamp < 800) {
        return
      }
      this.diyTimeStamp = timeStamp
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [{ column: 'expressBillId', type: 'default', value: this.expressBillId }],
        // { column: 'matchResult', type: 'default', value: this.detailForm.matchResult },
      }
      if (this.matchResult) {
        data.query.push({ column: 'matchResult', type: 'eq', value: this.matchResult })
      }
      EXPRESS.listCompareLogPage(data)
        .then((res) => {
          this.option1.data = res.data.list.map((item) => ({ _isRefused: item.matchResult === 'no', ...item }))
          Object.assign(this.option1.pagination, res.data)
        })
        .finally(() => (this.lsLoading = false))
    },
    // 执行对账
    compare() {
      EXPRESS.compare({ expressBillId: this.expressBillId, compareType: this.detailForm.compareType }).then((res) => {
        this.getData()
        this.$msgSucClose(this.$t('Supplier.reconciliationSuc'))
        this.isCompared = true
      })
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getTableData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getTableData()
    },
    closeSelectSettlement() {
      this.dialogVisible = false
    },
    // 确认费用
    allConfirm(del) {
      if (this.detailForm.matchResult !== 'all') {
        return this.$msgErrClose(this.$t('Supplier.exactlymatch'))
      }
      this.btnLoading = true
      EXPRESS.confirm({ expressBillId: this.expressBillId })
        .then((res) => {
          if (del === true) return
          this.$msgSucClose(this.$t('Supplier.allconfirm'))
          this.detailForm.confirmStatus = 'yes'
        })
        .finally(() => (this.btnLoading = false))
    },
    // 生成结算单
    createSettlement() {
      if (this.detailForm.matchResult !== 'all') {
        return this.$msgErrClose(this.$t('Supplier.cannotgen'))
      }
      if (this.detailForm.confirmStatus !== 'yes') {
        return this.$msgErrClose(this.$t('Supplier.expenseconfir'))
      }
      this.corpForm.settleCorp = ''
      this.exchangeCorpDialog = true
      let { settleCompanyCode, settleCompanyName } = this.$store.state.user.userInfo
      this.$nextTick(() => {
        this.settleCorpSelectList = [{ value: settleCompanyCode, label: settleCompanyName }]
        this.corpForm.settleCorp = this.settleCorpSelectList[0]
      })
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
          supplierBillNo: this.detailForm.supplierBillNo,
          settleCompCode: this.corpForm.settleCorp.value,
          settleCompName: this.corpForm.settleCorp.label,
        })
      })
    },
    closeAccountChecking() {
      this.routerBack()
    },
    checkDetail(logId) {
      let matchFeeSourceType = this.detailForm.matchFeeSourceType
      this.routerPush('SupplierBillListSystem', { compareId: this.lastCompareId, logId, matchFeeSourceType })
    },
    exportData() {
      this.lsLoading = true
      this.$store
        .dispatch('finance/downloadBlobFilePost', {
          uri: '/fin/expressBill/exportCompareLog',
          data: { data: { expressBillId: this.expressBillId, matchResult: this.matchResult } },
        })
        .then((res) => {
          this.lsLoading = false
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = `${this.$t('Supplier.courierFee')}.xlsx`
          link.click()
        })
        .catch((err) => {
          this.lsLoading = false
          console.log(err)
          // this.$msgErrClose(err)
        })
    },
  },
}
</script>
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
.el-form-item {
  width: 278px;
  margin-bottom: 7px;
  margin-right: 0;
  font-size: 12px;
}
.el-form-item ::v-deep .el-form-item__content {
  font-size: 12px;
}
.finance-detail-page {
  background: #fff;
}
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}
.money-box.money-box-overflow {
  padding: 10px 0 10px 16px;
  /* height: 100px; */
}
.money-box.money-box-overflow .money-title {
  line-height: 20px;
}
.money-box.money-box-overflow .money-title {
  min-width: 80px;
}
.table_card {
  margin: 0 8px;
  border-radius: 4px;
  border: 1px solid #e9e9e9;
  h3 {
    padding: 5px 8px;
    line-height: 20px;
    font-size: 14px;
    background-color: #f8f9fd;
    & > span {
      color: red;
      font-size: 12px;
      font-weight: normal;
    }
  }
}
.result-dialog-descript {
  margin-top: 12px;
  span {
    font-size: 12px;
    display: inline-block;
    color: #222;
    width: 33%;
    margin-top: 8px;
    float: left;
    text-align: left;
  }
}
</style>