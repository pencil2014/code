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
          <el-button-group
            v-if="checkAuth($route.name, 'btn-createSettlement') && (!supplierBillId || supplierBillDetailForm.matchFeeSourceType === 'fee')"
          >
            <el-button
              class="finance-btn"
              type="primary"
              @click="createSettlement"
              size="mini"
            >{{$t('FeeList.single')}}</el-button>
          </el-button-group>
          <el-button-group
            v-if="checkAuth($route.name, 'btn-createSettlement2') && (supplierBillId && supplierBillDetailForm.matchFeeSourceType === 'fee')"
          >
            <el-button
              class="finance-btn"
              type="primary"
              @click="createSettlement2('multi')"
              size="mini"
            >{{$t('FeeList.multiple')}}</el-button>
          </el-button-group>
          <el-tooltip
            v-if="checkAuth($route.name, 'btn-createSettlement2') && (supplierBillId && supplierBillDetailForm.matchFeeSourceType === 'fee')"
            popper-class="page__tooltip"
            :content="$t('Supplier.colleaguesTips')"
            placement="bottom"
            effect="dark"
          >
            <span
              class="el-icon-question"
              style="color:#BFBFBF;font-size:16px;margin-left:4px;transform: translate(0, 2px);cursor: pointer;"
            ></span>
          </el-tooltip>

          <el-button-group>
            <el-button class="finance-btn" @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    <div class="settlement-detail-form">
      <SupplierBillDetailForm
        :refresh="childRefresh"
        source="result"
        :supplierBillDetailForm="supplierBillDetailForm"
      />
    </div>
    <DiffCompare
      v-if="expressBillId"
      :refresh="childRefresh"
      v-bind="supplierBillDetailForm"
      source="result"
    />
    <div class="table_card" v-else-if="supplierBillId">
      <h3>
        {{$t('Supplier.comparresults')}}
        <span
          :style="{color:supplierBillDetailForm.matchResult !='all'? '#CD4130':'#33B18A'}"
          :class="[supplierBillDetailForm.matchResult !='all'?'el-icon-info' : 'el-icon-success']"
        ></span>
        <span
          :style="{color:supplierBillDetailForm.matchResult !='all'? '#CD4130':'#33B18A'}"
          v-html="dictMapObj['supplierBillCompareMatchResult'][supplierBillDetailForm.matchResult]"
        ></span>
        <el-button
          v-if="checkAuth($route.name, 'btn-exportData')"
          style="float:right;"
          type="default"
          size="mini"
          @click="exportData"
        >{{$t('Common.export')}}</el-button>
        <el-button
          v-if="checkAuth($route.name, 'btn-checkDetail')"
          style="float:right;margin-right:10px"
          type="default"
          size="mini"
          @click="checkDetail(undefined)"
        >{{$t('Supplier.viewsysdet')}}</el-button>
        <el-button
          style="float:right;"
          v-if="supplierBillId && supplierBillDetailForm.matchResult !='all' && checkAuth($route.name, 'btn-sendCompareLog')"
          class="finance-btn"
          type="primary"
          @click="sendCompareLog"
          size="mini"
        >{{$t('Supplier.sendEmail')}}</el-button>
      </h3>
      <FinanceTableMass :option="option1" />
    </div>
    <ResultDialog :option="resultDialogOption" @close="resultDialogOption.show = false">
      <div class="result-dialog-descript" slot="descript">
        <span v-for="item in settleOrderNos.split(',')" :key="item">{{item}}</span>
      </div>
    </ResultDialog>
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import SupplierBillDetailForm from './supplierBillDetailForm'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import DiffCompare from '@/views/finance/supplierBill/supplierBillList/components/diffCompare'
import {
  getSupplierBillCompareDetail,
  confirmAll,
  listCompareLogPage,
  settleOrderApply,
  settleOrderApplyGroup,
  exportCompareLog,
  sendCompareLog,
} from '@/api/fin/supplierBill'
import EXPRESS from '@/api/fin/expressBill'
import { querySourceTypeByNo } from '@/api/fin/fee'
export default {
  name: 'diffResult',
  mixins: [mixin, routerMixin],
  activated() {
    //下面判断注释原因刷新不显示数据
    // if (this.$route.meta.isUseCache && !this.$route.query.back) {
    //   return
    // }
    this.childRefresh = false
    this.supplierBillId = this.$route.query.supplierBillId
    this.expressBillId = this.$route.query.expressBillId
    this.lastCompareId = this.$route.query.lastCompareId
    this.matchResult = this.$route.query.matchResult
    // 详情form
    this.getData()
  },
  data() {
    return {
      childRefresh: false,
      expressBillId: '',
      supplierBillId: '',
      lastCompareId: '',
      matchResult: '',
      supplierBillDetailForm: {
        supplierCorpName: '',
        receipayType: '',
        parseMode: '',
        matchCompType: '',
        bizDate: '',
        supplierBillNo: '',
        supplierPayMap: '',
        supplierReceiveMap: '',
        supplierNum: 0,
        statementType: '',
        supplierBillId: '',
        expressBillId: '',
        lastCompareId: 0,
        matchResult: '',
        matchFeeSourceType: '',
        settleOrderNo: '',
      },
      option1: {},
      resultDialogOption: {
        show: false,
        title: this.$t('FeeList.buildSuc'),
        resultType: 'success',
        text_cancel: this.$t('Common.close'),
         titleText: this.$t('FeeList.multipleSuc'),
      },
      settleOrderNos: '',
    }
  },
  components: {
    DiffCompare,
    SupplierBillDetailForm,
    FinanceTableMass,
  },
  created() {
    // 当费用来源为结算单时表格里面不显示：对账后是否生成结算单、结算单号。
    // 放在系统费用最后两项。
    this.settleOrderHide = [
      {
        prop: 'hasSettleOrderAfterCompare',
        label: this.$t('Supplier.reconcgensta'),
        type: 'select',
        propInDict: 'yesNo',
        width: 130,
      },
      {
        prop: 'settleOrderNo',
        label: this.$t('FeeList.settleOrderNo'),
        width: 138,
        component: 'ColumnTip',
        componentProps: {
          show: false,
          data: [],
          callback: (no, componentProps) => {
            this.showColumnDetail({ type: 'settleOrderNos', no, componentProps })
          },
        },
      },
    ]
    // 总额对账时，不显示“费用名称”，明细对账需要显示“费用名称”（系统费用，供应商费用，都要显示这个字段）。
    this.detailSupplierShow = [{ prop: 'supplierFeeName', label: this.$t('FeeList.feeEname'), type: 'text', width: 80 }]
    this.detailSysShow = [{ prop: 'feeEnName', label: this.$t('FeeList.feeEname'), type: 'text', width: 80 }]
    let common = { data: [], columns: [], tips: { show: false }, selection: false, rootTipsHide: true }
    this.option1 = Object.assign({}, this.option, common, {
      id: 'option1',
      $name: 'SupplierBillListResult',
      index: { show: true },
      pagination: Object.assign({}, this.option.pagination, { show: true, isNew: true }),
      operationBtns: {
        show: true,
        width: '100px',
        data: [{ label: this.$t('Supplier.systemdetails'), show: true }],
        callback: (action, index, row) => this.checkDetail(row.logId),
      },
      colgroups: [
        {
          title: this.$t('Supplier.supplierFees'),
          className: 'supplier',
          columns: [
            { prop: 'matchResult', label: this.$t('Supplier.matchornot'), type: 'select', propInDict: 'yesNo', width: 100},
            {
              prop: 'supplierOrderNo',
              label: this.$t('PreClose.bizNo'),
              width: 138,
              component: 'ColumnTip',
              componentProps: {
                show: false,
                data: [],
                callback: (no, componentProps) => {
                  querySourceTypeByNo({ sourceBizNo: no }).then((res) => {
                    if (res.code === 0) {
                      this.showOneNoDetail(res.data.sourceType, res.data.sourceBizNo)
                    }
                  })
                  // this.showColumnDetail({ type: 'order', no, componentProps })
                },
              },
            },
            { prop: 'supplierCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', width: 150 },
            { prop: 'supplierReceipayType', label: this.$t('FeeList.receipayType'), type: 'select', propInDict: 'feeitemReceipayGroup', width: 100 },
            // { prop: 'supplierFeeName', label: this.$t('FeeList.feeEname'), type: 'text', width: 80 },
            { prop: 'supplierFeeAmt', label: this.$t('FeeList.feeAmt'), type: 'text', width: 100 },
            { prop: 'supplierCurrency', label: this.$t('FeeList.currency'), type: 'text', width: 100 },
          ],
        },
        {
          title: this.$t('Hedge.systemCost'),
          className: 'system',
          columns: [
            {
              prop: 'orderNo',
              label: this.$t('PreClose.bizNo'),
              width: 138,
              component: 'ColumnTip',
              componentProps: {
                show: false,
                data: [],
                callback: (no, componentProps) => {
                  querySourceTypeByNo({ sourceBizNo: no }).then((res) => {
                    if (res.code === 0) {
                      this.showOneNoDetail(res.data.sourceType, res.data.sourceBizNo)
                    }
                  })
                  // this.showColumnDetail({ type: 'order', no, componentProps })
                },
              },
            },
            { prop: 'settleCompName', label: this.$t('FeeList.settleComp'), type: 'text', width: 150 },
            { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', width: 150 },
            { prop: 'receipayType', label: this.$t('FeeList.receipayType'), type: 'select', propInDict: 'feeitemReceipayGroup', width: 80 },
            // { prop: 'feeName', label: this.$t('FeeList.feeEname'), type: 'text' },
            { prop: 'feeAmt',label: this.$t('Supplier.sysorigiAmt'), type: 'text', width: 120 },
            { prop: 'matchAmt', label: this.$t('Supplier.reconciAmt'), type: 'text', width: 110 },
            { prop: 'currency', label: this.$t('Supplier.sysCurrency'), type: 'text', width: 100 },
            { prop: 'diffAmt', label: this.$t('Supplier.balance'), type: 'text', width: 100 },
            // { prop: 'orderNo', label: this.$t('Supplier.feerecogstatus'), type: 'text' },
            // { prop: 'orderNo', label: this.$t('Supplier.feecreator'), type: 'text' },
          ],
        },
      ],
    })
    // this.option1.data.push({
    //   matchResult: 'yes',
    //   supplierOrderNo: '12341234',
    //   orderNo: '12333123123,123122342343123,123122342343123',
    //   settleOrderNo: '123122342343123',
    // })
  },
  methods: {
    getData() {
      this.lsLoading = true
      if (this.expressBillId) {
        return this.getDataExpress()
      }
      getSupplierBillCompareDetail({ supplierBillId: this.supplierBillId }).then((res) => {
        let { companyPayMap, companyReceiveMap, supplierPayMap, supplierReceiveMap } = res.data
        let fn = (obj, isPay) => Object.keys(obj || {}).map((key) => ({ currency: key, amt: obj[key], isPay }))
        let str
        if (res.data.bizDateEnd == null && res.data.bizDateStart == null) str = true
        this.supplierBillDetailForm = Object.assign({}, res.data, {
          bizDate: str ? '' : (res.data.bizDateStart || '-') + '~' + (res.data.bizDateEnd || '-'),
          supplierPay: fn(supplierPayMap, true),
          supplierReceive: fn(supplierReceiveMap, false),
          companyPay: fn(companyPayMap, true),
          companyReceive: fn(companyReceiveMap, false),
          matchResult: res.data.result || res.data.matchResult,
        })
        this.supplierBillDetailForm.bizType = this.dictMapObj['supplierBillMatchDateType'][res.data.matchDateType]
        // this.option1.colgroups[0].columns supplierFeeName  [1].columns  feeName  4
        // 对比方式 总额 detailSupplierShow detailSysShow
        if (res.data.templateType === 'total') {
          if (this.option1.colgroups[0].columns[4].prop === 'supplierFeeName') {
            console.log('delFeeName')
            this.option1.colgroups[0].columns.splice(4, 1)
            this.option1.colgroups[1].columns.splice(4, 1)
          }
        } else {
          if (this.option1.colgroups[0].columns[4].prop !== 'supplierFeeName') {
            console.log('addFeeName')
            this.option1.colgroups[0].columns.splice(4, 0, ...this.detailSupplierShow)
            this.option1.colgroups[1].columns.splice(4, 0, ...this.detailSysShow)
          }
        }
        // 费用来源 结算单 settleOrderHide  this.option1.colgroups[1].columns  settleOrderNo
        let len = this.option1.colgroups[1].columns.length
        if (res.data.matchFeeSourceType === 'settle_order') {
          if (this.option1.colgroups[1].columns[len - 1].prop === 'settleOrderNo') {
            this.option1.colgroups[1].columns.splice(len - 2, 2)
          }
        } else {
          if (this.option1.colgroups[1].columns[len - 1].prop !== 'settleOrderNo') {
            this.option1.colgroups[1].columns.push(...this.settleOrderHide)
          }
        }
        this.option1 = Object.assign({}, this.option1)
        this.childRefresh = true
      })
      this.getTableData()
    },
    getTableData() {
      // console.log(this.supplierBillId);
      if (!this.supplierBillId) {
        return
      }
      let timeStamp = +new Date()
      if (this.diyTimeStamp && timeStamp - this.diyTimeStamp < 800) {
        return
      }
      this.diyTimeStamp = timeStamp
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [{ column: 'compareId', type: 'default', value: this.lastCompareId }],
      }
      listCompareLogPage(data)
        .then((res) => {
          this.option1.data = res.data.list.map((item) => ({ _isRefused: item.matchResult === 'no', ...item }))
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          // this.option1.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getTableData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getTableData()
    },
    getDataExpress() {
      EXPRESS.getCompareDetail({ expressBillId: this.expressBillId })
        .then((res) => {
          let { feeTotalAmt, bizDateStart, bizDateEnd, supplierFeeTotalAmt, companyFeeTotalAmt } = res.data
          let fn = (obj) => Object.keys(obj || {}).reduce((str, cur) => (str += cur + obj[cur] + '&nbsp;&nbsp;'), '')
          let fn2 = (obj, isPay) => Object.keys(obj || {}).map((key) => ({ currency: key, amt: obj[key], isPay }))
          let supplierPayMapStr = fn(feeTotalAmt)
          this.supplierBillDetailForm = Object.assign({}, res.data, {
            bizDate: bizDateStart + '~' + bizDateEnd,
            supplierPayMapStr,
            supplierPay: fn2(supplierFeeTotalAmt, true),
            companyPay: fn2(companyFeeTotalAmt, true),
            matchResult: res.data.result || res.data.matchResult,
            lastCompareId: res.data.expressCompareId,
          })
          this.childRefresh = true
        })
        .finally(() => (this.lsLoading = false))
    },
    cancel() {
      if (this.$route.query.back) {
        return this.routerPush('SupplierBillList')
      }
      this.routerBack()
      // this.$emit('close-settlement-detail')
    },
    allConfirm() {
      if (this.supplierBillDetailForm.matchResult !== 'all') {
        return this.$msgSucClose(this.$t('Supplier.exactlymatch'))
      }
      this.lsLoading = true
      let data = this.supplierBillId ? { supplierBillId: this.supplierBillId } : { expressBillId: this.expressBillId }
      let method = this.supplierBillId ? confirmAll : EXPRESS.confirm
      method(data)
        .then((res) => {
          this.$msgSucClose(this.$t('Supplier.allconfirm'))
        })
        .finally(() => (this.lsLoading = false))
    },
    createSettlement2(type) {
      this.$confirmWarn(this.$t('Supplier.generateMul'), () => this.createSettlement(type))
    },
    createSettlement(type) {
      // if (this.supplierBillDetailForm.matchResult !== 'all') {
      //   return this.$msgErrClose('部分匹配不能生成结算单!')
      // }
      if (this.expressBillId) {
        return this.routerPush('CreateSettlement', {
          source: 'createSettlementFromExpressBill',
          expressBillId: this.expressBillId,
          supplierBillNo: this.supplierBillDetailForm.supplierBillNo,
        })
      }
      this.lsLoading = true
      let method = type !== 'multi' ? settleOrderApply : settleOrderApplyGroup
      method({ supplierBillId: this.supplierBillId })
        .then((res) => {
          if (res.data.settleOrderNos) {
            this.settleOrderNos = res.data.settleOrderNos
            this.resultDialogOption.show = true
            return
          }
          this.$store.state._feeToSettleParams = res
          // localStorage.setItem('_feeToSettleParams', JSON.stringify(res))
          this.isJumpRouteFromPage = true
          this.$router.push({
            path: '/finance/settlement/createSettlement',
            query: {
              source: 'createSettlementFromFeeSearch',
              isSupplier: true,
              supplierBillNo: this.supplierBillDetailForm.supplierBillNo,
            },
          })
        })
        .finally(() => (this.lsLoading = false))
      return
      // this.routerPush('CreateSettlement', {
      //   source: 'createSettlementFromSupplierBill',
      //   supplierBillId: this.supplierBillId,
      //   supplierBillNo: this.supplierBillDetailForm.supplierBillNo,
      // })
    },
    exportData() {
      this.lsLoading = true
      // exportCompareLog({ compareId: this.lastCompareId })
      //   .then((res) => {
      //     window.open(this.getDownloadPath(res.data.fileNo, res.data.name))
      //   })
      //   .finally(() => (this.lsLoading = false))
      this.$store
        .dispatch('finance/downloadBlobFilePost', {
          uri: '/fin/supplierBill/exportCompareLog',
          data: { data: { compareId: this.lastCompareId } },
        })
        .then((res) => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = `${this.$t('Supplier.SupRecResults')}.xlsx`
          link.click()
        })
        .finally(() => (this.lsLoading = false))
    },
    checkDetail(logId) {
      let matchFeeSourceType = this.supplierBillDetailForm.matchFeeSourceType
      this.routerPush('SupplierBillListSystem', { compareId: this.lastCompareId, logId, matchFeeSourceType })
    },
    showColumnDetail(params) {
      // console.log(params.componentProps)
      // console.log(params.componentProps.row)
      if (params.type === 'paySettleApplyNo' || params.type === 'pay_order' || params.type === 'writeoffNos') {
        let agentCompName = params.componentProps.row && params.componentProps.row.agentCompName
        let compName = this.$store.state.user.userInfo.settleCompanyName
        if (agentCompName && compName !== agentCompName) {
          return this.$msgErrClose(this.$t('FeeList.noPermission'))
        }
      }
      this.showColumnDetailHandle(params)
    },
    sendCompareLog() {
      sendCompareLog({ supplierBillId: this.supplierBillId }).then((res) => {
        this.$msgSucClose(this.$t('Supplier.sentSuc'))
      })
    },
  },
}
</script>
<style scoped lang="scss">
.finance-detail-page {
  background: #fff;
}
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}
/* .el-form-item {
  width: 260px;
  margin-bottom: 7px;
  margin-right: 24px;
} */
/* .el-form-item-text {
  font-size: 12px;
} */
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