<template>
  <div class="finance-page">
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">对冲详情</div>
        </div>
        <div class="money-box-right">
          <el-button class="finance-btn" size="mini" @click="backFn">返回</el-button>
        </div>
      </div>
      <div class="hedge-cnt">
        <div class="hedge-cnt-item">
          <div class="balance-title">亏损费用信息</div>
          <!-- <div class="base-info-cnt">
            <div class="base-item">亏损费用：{{ info.lossAmt }}</div>
            <div class="base-item">币种：{{ info.lossCurrency }}</div>
            <div class="base-item">对冲金额：{{ info.gedgingAmt }}</div>
          </div>-->
          <FinanceTable :option="option1" />
          <div class="table_bottom">
            合计：{{ info.lossCurrency }}
            <b>{{ info.lossAmt }}</b>
          </div>
        </div>
        <!-- style="background-color: #f8f9fd; margin-top: 10px" -->
        <div class="hedge-cnt-item">
          <div class="balance-title">留置费用信息</div>
          <FinanceTable :option="option3" />
          <div class="table_bottom">
            合计：
            <span v-for="(amt, currency) in summaryObj" :key="currency">
              {{ currency }}
              <b class="red">{{ amt }}</b>
            </span>
          </div>
        </div>
        <div class="hedge-cnt-item" style="margin-top: 10px;">
          <div class="loss-table">
            <div class="list-title">
              费用列表
              <span>
                剩余金额合计：
                <b class="red">{{ info.restTotalAmt }}</b>
              </span>
              <span>
                对冲金额合计：
                <b>{{ info.gedgingTotalExAmt }}</b>
              </span>
            </div>
            <FinanceTable :option="option2" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { shLienGedgingInfo } from '@/api/fin/shBill'
import Vue from 'vue'
export default {
  components: {
    FinanceTable,
  },
  mixins: [mixin, routerMixin],
  data() {
    return {
      gedgingApplyNo: '',
      info: {},
      option1: {},
      option2: {},
      option3: {},
    }
  },
  computed: {
    summaryObj() {
      let obj = {}
      ;(this.option3.data || []).forEach((item) => {
        let amt = obj[item.currency]
        obj[item.currency] = amt ? new LSnum(amt).plus(item.restAmt).toNum(2) : item.restAmt
      })
      return obj
    },
  },
  created() {
    let initFn = (id, index) => {
      return {
        id: 'option' + index,
        data: [],
        $name: 'HedgeDetail1',
        tips: { text: '', show: false },
        selection: false,
        operationBtns: false,
        pagination: false,
        index,
      }
    }
    let optinCommon = { tips: { text: '', show: false }, selection: false, operationBtns: false, pagination: false }
    this.option1 = Object.assign({}, this.option, { ...initFn(1, true) })
    this.option1.columns = [
      {
        prop: 'shLienMonNo',
        label: '月度编号',
        type: 'button',
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => this.goSummaryDetail(row),
        },
      },
      { prop: 'settleCorpName', label: '结算单位', type: 'text' },
      { prop: 'yearMon', label: '所属年月', type: 'text' },
      { prop: 'restAmt', label: '亏损金额', type: 'text', fontColor: 'green' },
    ]

    let pagination2 = Object.assign({}, this.option.pagination, { show: true })
    this.option2 = Object.assign({}, this.option, { ...initFn(2, 'show'), pagination: pagination2 })
    let columns2 = [
      {
        prop: 'shLienMonNo',
        label: '月度编号',
        type: 'button',
        width: '130px',
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => this.goSummaryDetail(row),
        },
      },
      { prop: 'yearMon', label: '所属年月', type: 'text' },
      { prop: 'sysLineName', label: '航线', type: 'text' },
      {
        prop: 'sourceBizNo',
        label: '工作单号',
        type: 'button',
        width: '130px',
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            let sourceType = row.sourceType
            let sourceBizNo = row.sourceBizNo
            this.showOneNoDetail(sourceType, row.jointNo || sourceBizNo, {
              feeId: row.feeId,
              feeChild: 'specialManagementFee',
              isFromSea: true,
            })
          },
        },
      },
      { prop: 'settleCompName', label: '分公司', type: 'text' },
      { prop: 'settleCorpName', label: '结算单位', type: 'text' },
      { prop: 'feeName', label: '费用名称', type: 'text' },
      { prop: 'currency', label: '币种', type: 'text' },
      { prop: 'feeAmt', label: '金额', type: 'text' },
      { prop: 'feeBalanceAmt', label: '剩余金额', type: 'text' },
      { prop: 'gedgingAmt', label: '对冲金额', type: 'text' },
      { prop: 'exCurrency', label: '对冲币种', type: 'text' },
      { prop: 'exRate', label: '汇率', type: 'text' },
      { prop: 'exAmt', label: '折币金额', type: 'text' },
      { prop: 'createdName', label: '创建人', type: 'text' },
      { prop: 'createdTime', label: '创建时间', type: 'text' },
    ]
    this.option2.columns = columns2
    this.option3 = Object.assign({}, this.option, { ...initFn(3) })
    this.option3.columns = [
      {
        prop: 'shLienMonNo',
        label: '月度编号',
        type: 'button',
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => this.goSummaryDetail(row),
        },
      },
      { prop: 'settleCorpName', label: '结算单位', type: 'text' },
      { prop: 'currency', label: '币种', type: 'text' },
      { prop: 'restAmt', label: '留置费用', type: 'text', fontColor: 'red' },
    ]
    // this.gedgingApplyNo = this.$route.query.gedgingApplyNo
    // // 获取对冲详情
    // this.getGedgingApply()
  },
  methods: {
    // 获取对冲详情数据
    getGedgingApply() {
      let gedgingApplyNo = this.gedgingApplyNo
      shLienGedgingInfo({ gedgingApplyNo })
        .then((res) => {
          this.info = res.data
          this.option1.data = res.data.lossInfoList
          // 设置列表分页数据
          this.option3.data = res.data.lienInfoList
          this.option2.data = res.data.gedgingLienFeeList.slice(0, 10)
          this.option2.pagination.currPage = 1
          this.option2.pagination.pageSize = 10
          this.option2.pagination.totalCount = res.data.gedgingLienFeeList.length
        })
        .catch(() => {})
    },
    // 分页方法
    handleSizeChange(val) {
      let gedgingLienFeeList = this.info.gedgingLienFeeList
      this.option2.pagination.pageSize = val
      this.option2.pagination.currPage = 1
      this.option2.data = gedgingLienFeeList?.slice(0, val)
    },
    // 分页方法
    handleCurrentChange(val) {
      let pageSize = this.option2.pagination.pageSize
      let gedgingLienFeeList = this.info.gedgingLienFeeList
      this.option2.pagination.currPage = val
      let star = (val - 1) * pageSize
      let end = star + pageSize
      this.option2.data = gedgingLienFeeList?.slice(star, end)
    },
    // 返回
    backFn() {
      this.routerBack()
    },
    // 挑战月度账单详情
    goSummaryDetail(item) {
      this.routerPush('SummaryBillDetail', { shLienMonNo: item.shLienMonNo })
    },
  },
  activated() {
    this.gedgingApplyNo = this.$route.query.gedgingApplyNo
    // 获取对冲详情
    this.getGedgingApply()
  },
}
</script>

<style lang="scss" scoped>
.table_bottom {
  background: #e7eeff;
  line-height: 22px;
  text-align: right;
  margin: 0 8px;
  padding: 0 8px;
  font-weight: bold;
  b {
    color: rgb(51, 177, 138);
    &.red {
      color: rgb(230, 57, 35);
    }
  }
}
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}

.hedge-cnt-item {
  padding: 0 0;
  .balance-title {
    font-size: 14px;
    font-weight: 600;
    margin: 10px;
  }

  .base-info-cnt {
    margin: 10px;
    display: flex;
    .base-item {
      flex: 0 0 auto;
      flex-basis: 260px;
      &.longstr {
        flex-basis: 300px;
      }
    }
  }
}
.list-title {
  font-size: 14px;
  font-weight: 600;
  // color: #909399;
  line-height: 14px;
  padding: 10px 0;
  margin: 0 8px;
  // background-color: #f8f9fd;
  border-bottom: 1px solid #dfe6ec;
  span {
    margin-left: 20px;
    font-weight: 500;
    font-size: 12px;
    b {
      color: rgb(51, 177, 138);
      &.red {
        color: rgb(230, 57, 35);
      }
    }
  }
}
</style>