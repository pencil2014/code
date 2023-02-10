<template>
  <div class="finance-page">
    <div class="finance-list-container" v-show="!showAccountChecking">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">{{$t('Supplier.billData')}}</div>
        </div>
        <div class="money-box-right">
          <el-button
            class="finance-btn"
            v-if="supplierBillDetailForm.result !== 'all' && expressBillId"
            type="danger"
            size="mini"
            @click="handleDelete('multi')"
          >{{$t('Supplier.batchdelete')}}</el-button>
          <el-button class="finance-btn" @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
        </div>
      </div>
    </div>
    <div class="settlement-detail-form" v-show="!showAccountChecking">
      <SupplierBillDetailForm
        :type="detailType"
        source="detail"
        :supplierBillDetailForm="supplierBillDetailForm"
        @openDiffCompare="openDiffCompare"
      />
    </div>
    <DetailFeeSearchFilter
      v-if="expressBillId"
      ref="DetailFeeSearchFilter"
      :list="option1.data"
      :columns="feeListColumns"
      @search="search"
    />
    <FinanceTable v-if="!showAccountChecking" :option="option1" @send-multi="sendMulti" />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import SupplierBillDetailForm from './supplierBillDetailForm'
import AccountChecking from '@/views/finance/supplierBill/supplierBillList/components/accountChecking'
import DetailFeeSearchFilter from '@/views/finance/components/financeSearch/detailFeeSearchFilter'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { getSupplierBillDetail, listSupplierBillFeePage, deleteSupplierBillFee } from '@/api/fin/supplierBill'
import EXPRESS from '@/api/fin/expressBill'
import { querySourceTypeByNo } from '@/api/fin/fee'
export default {
  mixins: [mixin, routerMixin],
  activated() {
    //下面判断注释原因刷新不显示数据
    // if (this.$route.meta.isUseCache) {
    //   return
    // }
    this.init()
  },
  computed: {
    detailType() {
      return this.expressBillId && 'express'
    },
  },
  data() {
    return {
      feeListColumns: [{ prop: 'expressNo', label: this.$t('Supplier.courierNumber'), type: 'text', st: 1 }],
      option1: {},
      multipleSelection1: [],
      supplierBillDetailForm: {
        supplierCorpName: '',
        payType: '',
        parseMode: '',
        matchCropCode: '',
        bizDate: '',
        supplierBillNo: '',
        supplierPayMapStr: '',
        supplierReceiveMapStr: '',
        supplierNum: '',
        matchResult: '',
        result: '',
      },
      showAccountChecking: false,
      DeleteBtn: [{ label: this.$t('Common.del'), type: 'text', show: true, action: 'Delete' }],
    }
  },
  components: {
    FinanceTable,
    AccountChecking,
    SupplierBillDetailForm,
    DetailFeeSearchFilter,
  },
  created() {
    this.supplierBillId = this.$route.query.supplierBillId
    this.expressBillId = this.$route.query.expressBillId
    console.log(this.supplierBillId, this.expressBillId)
    let operationBtns = this.supplierBillId ? false : Object.assign(this.option.operationBtns, { data: this.DeleteBtn })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'SupplierBillListDetail',
      data: [],
      tips: { text: '', show: false },
      rootTipsHide: true,
      operationBtns,
      edit: true,
      pagination: { ...this.option.pagination, show: true, isNew: true },
      selection: { show: false, fixed: true },
      disableFixedIndex0: true,
    })
    let columns = [
      { prop: 'settleCompName', label: this.$t('FeeList.settleComp'), type: 'text', minWidth: 150 },
      { prop: 'supplierCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', minWidth: 150 },
      { prop: 'receipayType', label: this.$t('FeeList.receipayType'), type: 'select', propInDict: 'receipayGroup', minWidth: 80 },
      { prop: 'feeName', label: this.$t('Common.fees'), type: 'text', minWidth: 100 },
      { prop: 'amt', label: this.$t('FeeList.feeAmt'), type: 'text', minWidth: 80 },
      { prop: 'currency', label: this.$t('FeeList.currency'), type: 'text', minWidth: 60 },
      {
        prop: 'orderNo',
        label: this.$t('Supplier.OrderNo'),
        minWidth: 138,
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
      // {
      //   prop: 'orderNo',
      //   label: this.$t('Supplier.OrderNo'),
      //   type: 'text',
      //   width: 135,
      // },
      { prop: 'so', label: this.$t('Supplier.billnumber'), type: 'text', minWidth: 135 },
    ]
    let expressColumns = [
      { prop: 'expressNo', label: this.$t('Supplier.courierNumber'), type: 'text', minWidth: 135 },
      { prop: 'supplierCorpName', label: this.$t('Supplier.courierCompany'), type: 'text', minWidth: 150 },
      { prop: 'currency', label: this.$t('FeeList.currency'), type: 'text', minWidth: 50 },
      { prop: 'amt', label: this.$t('FeeList.feeAmt'), type: 'text', minWidth: 80 },
    ]
    this.option1.columns = this.supplierBillId ? columns : expressColumns
    this.$refs.DetailFeeSearchFilter && this.$refs.DetailFeeSearchFilter.clearData()
  },
  methods: {
    openDiffCompare() {
      let { supplierBillId, lastCompareId, matchResult } = this.supplierBillDetailForm
      this.routerPush('SupplierBillListResult', { supplierBillId, lastCompareId, matchResult })
    },
    init(refresh) {
      if (refresh !== false) {
        this.$options.created.forEach((fn) => fn.call(this))
      }
      // 详情请求接口 供应商时调用
      if (this.supplierBillId) {
        getSupplierBillDetail({ supplierBillId: this.supplierBillId }).then((res) => {
          let { supplierPayMap, supplierReceiveMap, bizDateStart, bizDateEnd } = res.data
          let fn = (obj) => Object.keys(obj || {}).reduce((str, cur) => (str += cur + obj[cur] + '&nbsp;&nbsp;'), '')
          let supplierPayMapStr = fn(supplierPayMap)
          let supplierReceiveMapStr = fn(supplierReceiveMap)
          this.supplierBillDetailForm = Object.assign({}, res.data, {
            bizDate: (bizDateStart || '-') + '~' + (bizDateEnd || '-'),
            supplierPayMapStr,
            supplierReceiveMapStr,
          })
        })
      } else {
        this.getDetailExpress()
      }
      if (refresh === false) return
      // 对账编号，快递公司，解析模式，总应付，业务日期范围，比对方式，对比结果，费用条数
      this.handleCurrentChange(1, this.option1)
    },
    getData() {
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [
          {
            column: this.supplierBillId ? 'supplierBillId' : 'expressBillId',
            type: 'default',
            value: this.supplierBillId || this.expressBillId,
          },
        ],
      }
      let method = this.supplierBillId ? listSupplierBillFeePage : EXPRESS.listExpressBillFeePage
      method(data).then((res) => {
        this.option1.data = res.data.list || []
        Object.assign(this.option1.pagination, res.data)
        if (this.expressBillId) {
          this.supplierBillDetailForm = { ...this.supplierBillDetailForm, supplierNum: res.data.totalCount }
        }
      })
    },
    getDetailExpress() {
      EXPRESS.detail({ expressBillId: this.expressBillId }).then((res) => {
        let { feeTotalAmt, bizDateStart, bizDateEnd } = res.data
        if (res.data.result === 'all') {
          this.option1.operationBtns = false
        } else {
          this.option1.selection.show = true
        }
        let fn = (obj) => Object.keys(obj || {}).reduce((str, cur) => (str += cur + obj[cur] + '&nbsp;&nbsp;'), '')
        let supplierPayMapStr = fn(feeTotalAmt)
        this.supplierBillDetailForm = Object.assign({}, res.data, {
          bizDate: (bizDateStart || '-') + '~' + (bizDateEnd || '-'),
          supplierPayMapStr,
          matchResult: res.data.result || res.data.matchResult,
        })
        // this.option1.data = res.data.expressBillFeeList || []
      })
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    handleCurrentChange(val, option) {
      if (!option) return
      this.option1.pagination.currPage = val
      this.getData()
    },
    cancel() {
      this.routerBack('SupplierBillListDetail')
      // this.$emit('close-settlement-detail')
    },
    handleDelete($index, row, option) {
      if ($index === 'multi' && !this.multipleSelection1.length) {
        return this.$msgErrClose(this.$t('Supplier.tobedeleted'))
      }
      let expressBillFeeIds = row ? [row.expressBillFeeId] : this.multipleSelection1.map((v) => v.expressBillFeeId)
      this.$confirmWarn(this.$t('Settle.confirmWarn'), () => {
        EXPRESS.deleteExpressBillFee({ expressBillFeeIds, expressBillId: this.expressBillId }).then((res) => {
          this.$msgSucClose(this.$t('Settle.deleteSuc'))
          this.init(false)
          this.getData()
          this.handleCurrentChange(1, this.option1)
        })
      })
      // this.$confirm(this.$t('Settle.confirmWarn'), this.$t('Common.tips'), {
      //   confirmButtonText: this.$t('Common.sure'),
      //   cancelButtonText: this.$t('Common.cancel'),
      //   type: 'warning',
      // })
      //   .then(() => {
      //     // console.log(row)
      //     let data = {}
      //     let method = null
      //     if (this.supplierBillId) {
      //       method = deleteSupplierBillFee
      //       data.supplierBillFeeIds = [row.supplierBillFeeId]
      //     } else if (this.expressBillId) {
      //       data.expressBillFeeIds = [row.expressBillFeeId]
      //       data.expressBillId = this.expressBillId
      //       method = EXPRESS.deleteExpressBillFee
      //     }
      //     method(data).then((res) => {
      //       this.option1.data.splice($index, 1)
      //       this.$message({
      //         type: 'success',
      //         message: this.$t('Settle.deleteSuc'),
      //         showClose: true,
      //       })
      //       this.init(false)
      //     })
      //   })
      //   .catch(() => {})
    },
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
    },
    search(list) {
      this.option1.data = [...list]
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

/* .settlement-detail-form .el-form-item__label,
.el-form-item__content {
  line-height: 28px !important;
} */
</style>