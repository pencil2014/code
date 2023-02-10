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
          <div class="money-title">系统明细数据</div>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" @click="cancel" size="mini">返回</el-button>
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
      >导出</el-button>
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
        { prop: 'hasSettleOrderAfterCompare', label: '对账后是否生成结算单', type: 'select', propInDict: 'yesNo', width: 130 },
        {
          prop: 'settleOrderNo',
          label: '结算单号',
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
          label: '单号',
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
        { prop: 'settleCompName', label: '分公司', type: 'text', width: 150 },
        { prop: 'settleCorpName', label: '结算单位', type: 'text', width: 150 },
        { prop: 'receipayType', label: '收付类型', type: 'select', propInDict: 'feeitemReceipayGroup', width: 80 },
        { prop: 'feeName', label: '费用名称', type: 'text', width: 100 },
        { prop: 'feeAmt', label: '系统原金额', type: 'text', width: 100 },
        { prop: 'matchAmt', label: '本次对账金额', type: 'text', width: 100 },
        { prop: 'settleApplyAmt', label: '已生成结算单金额', type: 'text', width: 118 },
        { prop: 'currency', label: '系统币种', type: 'text', width: 60 },
        // { prop: 'diffAmt', label: '差额', type: 'text', width: 80 },
        { prop: 'confirmStatus', label: '费用确认状态', type: 'select', propInDict: 'yesNo', width: 100 },
        { prop: 'createdName', label: '费用创建人', type: 'text', width: 100 },
        { prop: 'feeCreateByEmail', label: '费用创建人邮箱', type: 'text', width: 130 },
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
          link.download = '供应商对账结果.xlsx'
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
          return this.$msgErrClose('无权限查看！')
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