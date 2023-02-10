<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-approve-btns-box">
      <div class="finance-approve-btns-left">{{info.title}}详情</div>
      <div class="finance-approve-btns-right">
        <el-button @click="cancel" size="mini">返回</el-button>
      </div>
    </div>
    <div class="table-title">
      <span v-if="detailType == 'pay'">付款单号：{{info.payOrderNo}}</span>
      <span v-if="detailType == 'pay'">付款单类型：{{dictMapObj.payOrderType[info.orderType]}}</span>
      <span v-if="detailType == 'receive'">收款登记号：{{info.receivableRegNo}}</span>
      <span v-if="detailType == 'receive'">预收款登记号：{{info.receivablePrerevNo}}</span>
      <span>{{info.title}}总金额：{{info.amt}}</span>
    </div>
    <FinanceTable :option="option1" />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import PREPAY from '@/api/fin/prepayAccount'
import PREREV from '@/api/fin/prerevAccount'
export default {
  name: 'InvestorPrepayDetailDetail',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
  },
  data() {
    return {
      isFirstGetData: false,
      // 列表页--表格配置
      option1: {},
      info: {},
      typeCfg: {
        prepayToRepayAmt: { title: '预付抵账', refType: 'prepay_to_repay_writeoff' },
        // 分为预付、预收
        refundAmt: { title: '退款', refType: 'prepay_refund' },
        toPrepayAmt: { title: '转充值', refType: 'transfer_prepay' },
        writeoffAmt: { title: '预收抵账', refType: 'transfer_prepay' },
        // toPrepayAmt2: {
        //   title: '退款',
        //   refType: 'transfer_to_prepay2222',
        // },
      },
      columnsCfg: [
        { prop: 'settleCompName', label: '所属分公司', type: 'text', width: 140 },
        { prop: 'settleCorpName', label: '结算单位', type: 'text', width: 140 },
        { prop: 'updatedName', label: '操作人', formatter: ({row}) => row.updatedName || row.createdName },
        { prop: 'updatedTime', label: '操作时间', formatter: ({row}) => row.updatedTime || row.createdTime },
      ],
    }
  },
  computed: {
    detailType() {
      return this.$route.query.detailType || ''
    },
  },
  created() {
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.option1 = {
      ...this.option,
      id: 'option1', $name: 'InvestorPrepayDetailDetail',
      pagination,
      operationBtns: false,
      selection: false,
    }
  },
  methods: {
    //返回
    cancel() {
      this.routerBack()
    },
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
    // 封装请求参数并请求列表
    getData() {
      this.lsLoading = true
      let method = this.detailType == 'pay' ? PREPAY.logList : PREREV.logListPage
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: this.reqData,
      }
      method(data)
        .then((res) => {
          this.option1.data = res.data.list
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          // this.option1.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
  },
  activated() {
    // if (!this.$route.meta.isUseCache) {
    //   return
    // }
      this.option1.pagination.currPage = 1
      this.info = { ...this.$route.query }
      // prepayToRepayAmt 预付抵账
      // refundAmt 退款金额
      // toPrepayAmt 转充值
      let type = this.info.type
      // console.log(this.info, this.typeCfg)
      this.info.title = this.typeCfg[type].title
      this.info.refType = this.typeCfg[type].refType

      let btnCfg = { type: 'button', width: 140, operationBtns: false }
      let writeOffNo = {
        prop: 'writeoffReceipayNo',
        label: '核销编号',
        ...btnCfg,
        callback: ({ writeoffReceipayNo, writeoffReceipayId }, prop) => {
          // 根据路由参数来判断跳转页面
          let type = this.$route.query.type
          let query = { writeoffReceipayNo, writeoffReceipayId }
          const params = { writeoffNo: writeoffReceipayNo }
          // 预付抵账-》预付抵账核销详情
          if (type == 'prepayToRepayAmt') {
            return this.routerPush('WritePayDetail', query)
          }
          // 预付退款详情-》预收核销详情
          if (type == 'refundAmt' && this.detailType == 'pay') {
            return this.routerPush('WriteoffRecvDetail2', { ...query, source: 'writeoffRecv' }, true, params)
          }
          // 预收抵账详情-》预收抵账核销详情
          if (type == 'writeoffAmt') {
            return this.routerPush('WriteoffRecvDetail2', { ...query, source: 'writeoffRecv' }, true, params)
          }
          // 预收退款详情-》预付核销详情
          if (type == 'refundAmt' && this.detailType == 'receive') {
            return this.routerPush('WritePayDetail', query)
          }
        },
      }
      let writeoffType = { prop: 'writeoffSubType', label: '核销子类型', type: 'select', propInDict: 'writeoffSubType' }
      let writeoffStatus = { prop: 'recheckStatus', label: '核销状态', type: 'select', propInDict: 'writeoffRecheckStatus' }
      let currency = { prop: 'currency', label: '币种', type: 'text', width: 50 }
      let amt1 = { prop: 'dedueAmt', label: '预付抵账金额', type: 'text' }
      let refundMethod = { prop: 'refundDisposalType', label: '退款方式', type: 'select', propInDict: 'payRefundType' }
      let amt2 = { prop: 'refundAmt', label: '退款金额', type: 'text' }
      let refundNo = { prop: 'payRefundNo', label: '退款单号' }
      let refundType = { prop: 'refundType', label: '退款类型', type: 'select', propInDict: 'prepayAccountLogReftype' }
      let amt3 = { prop: 'toPrepayAmt', label: '转充值金额', type: 'text' }
      let amt4 = { prop: 'inoutAmt', label: '预收抵账金额', type: 'text' }
      let amt5 = { prop: 'inoutAmt', label: '退款金额', type: 'text' }
      // prepayToRepayAmt 预付抵账
      // refundAmt 退款金额(预付)
      // toPrepayAmt 转充值
      // toPrepayAmt1 预收抵账
      // toPrepayAmt2 退款金额(预收)
      let columns = [...this.columnsCfg]
      if (type == 'prepayToRepayAmt') {
        columns.splice(2, 0, writeOffNo, writeoffType, writeoffStatus, currency, amt1)
      } else if (type == 'refundAmt' && this.info.detailType === 'pay') {
        columns.splice(2, 0, writeOffNo, writeoffType, writeoffStatus, refundMethod, currency, amt2)
      } else if (type == 'toPrepayAmt') {
        columns.splice(2, 0, refundNo, refundType, refundMethod, currency, amt3)
      } else if (type == 'writeoffAmt') {
        columns.splice(2, 0, writeOffNo, writeoffType, writeoffStatus, currency, amt4)
      } else if (type == 'refundAmt') {
        columns.splice(2, 0, writeOffNo, writeoffType, writeoffStatus, currency, amt5)
      }
      this.option1.data = []
      this.option1.columns = columns
      let receiveType = this.info.type == 'writeoffAmt' ? 'prerev_dedu' : 'prerev_refund'
      this.reqData =
        this.info.detailType === 'receive'
          ? [
              { column: 'receivablePrerevId', type: 'eq', value: this.info.receivablePrerevId },
              { column: 'writeoffSubType', type: 'eq', value: receiveType },
            ]
          : [
              { column: 'prepayAccountBalanceId', type: 'eq', value: this.info.prepayAccountBalanceId },
              { column: 'payOrderNo', type: 'eq', value: this.info.payOrderNo },
              { column: 'refType', type: 'eq', value: this.info.refType },
            ]
      this.handleCurrentChange(1)
    
  },
}
</script>
