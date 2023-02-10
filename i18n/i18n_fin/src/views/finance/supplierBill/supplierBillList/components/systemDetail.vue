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
          <div class="money-title">{{$t('Supplier.sysdetaildata')}}</div>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    <div style="overflow:hidden;padding:8px 8px 0 0;">
      <el-button
        v-if="checkAuth($route.name, 'btn-exportData')"
        style="float:right;margin-bottom:0"
        class="finance-btn"
        @click="exportData"
        size="mini"
      >{{$t('Common.export')}}</el-button>
    </div>
    <FinanceTableMass :option="option1" />
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { listCompareLogSysFeePage, exportCompareLogSysFee } from '@/api/fin/supplierBill'
import { querySourceTypeByNo } from '@/api/fin/fee'
export default {
  name: 'systemDetail',
  mixins: [mixin, routerMixin],
  activated() {
    //下面判断注释原因刷新不显示数据
    // if (this.$route.meta.isUseCache) {
    //   return
    // }
    this.childRefresh = false
    this.compareId = this.$route.query.compareId
    this.logId = this.$route.query.logId
    this.matchFeeSourceType = this.$route.query.matchFeeSourceType
    let columns = this.option1.columns
    let column = columns[columns.length - 1]
    if (this.matchFeeSourceType === 'settle_order' && column.prop === 'settleOrderNo') {
      columns.splice(columns.length - 2, 2)
    } else if (this.matchFeeSourceType !== 'settle_order' && column.prop !== 'settleOrderNo') {
      columns.push(...this.toggleColumns)
    }
    // 详情form
    this.getData()
  },
  data() {
    return {
      childRefresh: false,
      expressBillId: '',
      lastCompareId: '',
      matchResult: '',
      option1: {},
      toggleColumns: [
        { prop: 'hasSettleOrderAfterCompare', label: this.$t('Supplier.reconcgensta'), type: 'select', propInDict: 'yesNo', width: 130 },
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
      ],
    }
  },
  components: {
    FinanceTableMass,
  },
  created() {
    let common = { data: [], columns: [], tips: { show: false }, selection: false, operationBtns: false, rootTipsHide: true }
    this.option1 = Object.assign({}, this.option, common, {
      id: 'option1',
      $name: 'SupplierBillListSystem',
      index: { show: true },
      pagination: Object.assign({}, this.option.pagination, { show: true, isNew: true }),
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
              querySourceTypeByNo({ sourceBizNo: no }).then(res => {
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
        { prop: 'feeEnName', label: this.$t('FeeList.feeEname'), type: 'text', width: 100 }, // feeEname
        { prop: 'feeAmt',label: this.$t('Supplier.sysorigiAmt'), type: 'text', width: 100 },
        { prop: 'matchAmt', label: this.$t('Supplier.reconciAmt'), type: 'text', width: 100 },
        { prop: 'settleApplyAmt', label: this.$t('Supplier.billAmtgen'), type: 'text', width: 118 },
        { prop: 'currency', label: this.$t('Supplier.sysCurrency'), type: 'text', width: 60 },
        // { prop: 'diffAmt', label: this.$t('Supplier.balance'), type: 'text', width: 80 },
        { prop: 'confirmStatus', label: this.$t('Supplier.feerecogstatus'), type: 'select', propInDict: 'yesNo', width: 100 },
        { prop: 'createdName', label: this.$t('Supplier.feecreator'), type: 'text', width: 100 },
        { prop: 'feeCreateByEmail', label: this.$t('Supplier.feecreatoremail'), type: 'text', width: 130 },
      ],
    })
  },
  methods: {
    getData() {
      let timeStamp = +new Date()
      // console.log(timeStamp)
      // console.log(this.diyTimeStamp)
      if (this.diyTimeStamp && timeStamp - this.diyTimeStamp < 800) {
        return
      }
      this.lsLoading = true
      this.diyTimeStamp = timeStamp
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [{ column: 'compareId', type: 'default', value: this.compareId }],
      }
      if (this.logId) {
        data.query.push({ column: 'logId', type: 'default', value: this.logId })
      }
      listCompareLogSysFeePage(data)
        .then((res) => {
          this.option1.data = res.data.list
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          // this.option1.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    cancel() {
      this.routerBack()
      // this.$emit('close-settlement-detail')
    },
    exportData() {
      this.lsLoading = true
      // exportCompareLogSysFee({ compareId: this.compareId, logId: this.logId })
      //   .then((res) => {
      //     window.open(this.getDownloadPath(res.data.fileNo, res.data.name))
      //   })
      //   .finally(() => (this.lsLoading = false))
      this.$store
        .dispatch('finance/downloadBlobFilePost', {
          uri: '/fin/supplierBill/exportCompareLogSysFee',
          data: { data: { compareId: this.compareId, logId: this.logId } },
        })
        .then((res) => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = `${this.$t('Supplier.SupRecResults')}.xlsx`
          link.click()
        })
        .finally((err) => (this.lsLoading = false))
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
</style>