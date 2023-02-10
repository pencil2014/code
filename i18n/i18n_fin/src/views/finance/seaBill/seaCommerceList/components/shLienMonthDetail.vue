<template>
  <div class="finance-page">
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">{{isSpecial?'特种柜':'航线'}}月度数据</div>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" size="mini" @click="cancel">{{$t('Common.close')}}</el-button>
          </el-button-group>
        </div>
      </div>
      <div class="base-info-box">
        <div class="base-info-cnt">
          <div class="base-item flex-item">
            <span class="sub-title">{{$t('FeeList.settleCorp')}}：</span>
            <el-tooltip v-if="summary.settleCorpName" :content="summary.settleCorpName">
              <span class="detail__content">{{summary.settleCorpName}}</span>
            </el-tooltip>
          </div>
          <div class="base-item">
            <span class="sub-title">所属年月：</span>
            {{ summary.yearMon }}
          </div>
          <div class="base-item flex-item">
            <span class="sub-title">结算分公司：</span>
            <el-tooltip :content="summary.settleCompName">
              <span class="detail__content">{{summary.settleCompName}}</span>
            </el-tooltip>
          </div>
          <div class="base-item">
            <span class="sub-title">状态：</span>
            {{ dictMapObj['finLockStatus'][summary.lockStatus] }}
            <el-tooltip content="付款申请过程中将会锁定" placement="top" effect="dark">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </div>
        </div>
      </div>
      <div class="loss-table">
        <div class="list-title">
          费用列表
          <span>
            总留置费用：
            <b>{{ summary.currency }} {{ summary.totalLienAmt }}</b>
          </span>
          <span>
            总亏损费用：
            <b>{{ summary.currency }} {{ summary.totalLossAmt }}</b>
          </span>
          <span>
            剩余留置费用：
            <b>{{ summary.currency }} {{ summary.restLienAmt }}</b>
          </span>
          <span>
            剩余亏损费用：
            <b>{{ summary.currency }} {{ summary.restLossAmt }}</b>
          </span>
          <span>
            总TEU量：
            <b>{{ summary.totalTeu || 0}}</b>
          </span>
          <el-button-group style="margin-left: 6px; float:right;height: 20px;">
            <el-button
              class="finance-btn"
              @click="feeSearchToggle = !feeSearchToggle"
              size="mini"
              type="primary"
            >{{feeSearchToggle?$t('Common.hideSearch') : $t('Common.showSearch')}}</el-button>
          </el-button-group>
        </div>
        <div>
          <DetailFeeSearchFilter
            v-show="feeSearchToggle"
            style="padding-bottom: 8px;"
            ref="DetailFeeSearchFilter"
            :list="option1.data"
            :columns="feeListColumns"
            @search="search"
          />
        </div>
        <FinanceTable :option="option1" />
      </div>
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        @close="customColumnsPopClose"
      />
    </div>
  </div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import CustomColumns from '@/components/customColumns'
import DetailFeeSearchFilter from '@/views/finance/components/financeSearch/detailFeeSearchFilter'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { shLienMonInfo } from '@/api/fin/shBill'
import { listColumnConfigGet, listColumnConfigSave } from '@/api/base'
export default {
  components: {
    FinanceTable,
    CustomColumns,
    DetailFeeSearchFilter,
  },
  mixins: [mixin, routerMixin],
  data() {
    return {
      isSpecial: this.$route.name === 'SpecailBillDetail',
      feeSearchToggle: false,
      feeListColumns: [],
      shLienMonNo: '',
      summary: {},
      // 自定义表头弹框
      customColumnsPopShow: false,
      option1: { data: [] },
      selfColumnsBase: [],
      precloseStatus: [
        { label: '已关账', value: 'yes' },
        { label: '未关账', value: 'no' },
      ],
    }
  },
  created() {
    // 获取账单id
    this.init()
  },
  methods: {
    init() {
      this.option1 = Object.assign({}, this.option, {
        customColumns: {
          show: true,
          handleCustomColumns: () => (this.customColumnsPopShow = true),
        },
        id: 'option1',
        $name: 'SummaryBillDetail',
        data: [],
        index: { show: true },
        tips: { text: '', show: false },
        operationBtns: false,
        selection: false,
        pagination: false,
      })
      this.selfColumnsBase = [
        {
          prop: 'sourceBizNo',
          label: this.$t('FeeList.orderNo'),
          width: 146,
          type: 'button',
          st: 1,
          operationBtns: {
            show: true,
            callback: (fn, index, row) => {
              let sourceType = row.sourceType
              let sourceBizNo = row.sourceBizNo
              // this.showOneNoDetail(sourceType, sourceBizNo, { feeId: '', feeChild: 'specialManagementFee' })
              this.showOneNoDetail(sourceType, sourceBizNo, { feeId: '', feeChild: 'specialManagementFee', isFromSea: true })
            },
          },
        },
        {
          prop: 'shLienMonNo',
          label: '月度编号',
          st: 1,
          type: 'button',
          width: 146,
          operationBtns: {
            show: true,
            callback: (fn, index, row, option, subItem) => {
              this.routerPush('SummaryBillDetail', { shLienMonNo: row.shLienMonNo })
            },
          },
        },
        { prop: 'bkgAgentSupplierName', label: '订舱代理', type: 'text', width: 150, st: 2 },
        { prop: 'bizDate', label: '业务日期', type: 'text', width: 130, st: 4 },
        { prop: 'soNo', label: 'SO', type: 'text', st: 1 },
        { prop: 'mbl', label: 'MBL', type: 'text', st: 1 },
        { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', width: 150, st: 2 },
        { prop: 'polPortName', label: '起运港', type: 'text', width: 130, st: 2, sMulti: true },
        { prop: 'podPortName', label: '目的港', type: 'text', width: 130, st: 2, sMulti: true },
        { prop: 'sysLineGroupName', label: '大航线', type: 'text', st: 2 },
        { prop: 'sysLineName', label: '小航线', type: 'text', st: 2 },
        { prop: 'containerInfo', label: '箱型箱量', type: 'text', st: 1 },
        { prop: 'amountTReal', label: 'TEU', type: 'text', st: 1 },
        { prop: 'feeAmt', label: this.$t('FeeList.feeAmt'), type: 'text' },
        { prop: 'feeBalanceAmt', label: '剩余金额', type: 'text' },
        { prop: 'currency', label: this.$t('FeeList.currency'), type: 'text', st: 3 },
        { prop: 'feeEnName', label: this.$t('FeeList.feeEname'), type: 'text', st: 2 },
        { prop: 'settleCompName', label: this.$t('FeeList.settleComp'), type: 'text', width: 150, st: 2 },
        { prop: 'settleLock', label: '是否结算锁定', type: 'select', propInDict: 'finLockStatus', st: 3 },
        { prop: 'settleStatus', label: '结清状态', type: 'select', propInDict: 'feeSettleStatus', st: 3 },
        { prop: 'totalWriteoffAmt', label: '已核销金额', type: 'text' },
        {
          prop: 'feeAmtTotalWriteoffAmt ',
          label: '未核销金额',
          type: 'text',
          formatter: ({ row }) => new LSnum(row.feeAmt).minus(row.totalWriteoffAmt).num,
        },
        { prop: 'finDate',label: this.$t('FeeList.finDate'), type: 'text', width: 130, st: 4 },
        { prop: 'precloseStatus', label: '预关账状态', type: 'select', selectOptions: this.precloseStatus, st: 3 },
        { prop: 'precloseTime', label: '预关账时间', type: 'text', width: 130, st: 4 },
        { prop: 'closeStatus', label: '总关账状态', type: 'select', selectOptions: this.precloseStatus, st: 3 },
        { prop: 'closeTime', label: '总关账时间', type: 'text', width: 130, st: 4 },
        {
          prop: 'confirmStatus',
          label: '确认状态',
          type: 'select',
          st: 3,
          forceSelection: true,
          selectOptions: [
            { label: '已确认', value: 'yes' },
            { label: '未确认', value: 'no' },
          ],
        },
        { prop: 'employeeName', label: '商务', type: 'text', st: 2 },
        { prop: 'createdName', label: this.$t('Common.createdBy'), type: 'text', st: 2 },
        { prop: 'createdTime', label: this.$t('Common.createTime'), type: 'text', width: 130, st: 4 },
        { prop: 'confirmName', label: '确认人', type: 'text', st: 2 },
        { prop: 'confirmTime', label: '确认时间', type: 'text', width: 130, st: 4 },
      ]
      this.feeListColumns.push(...this.selfColumnsBase.map((item) => ({ ...item })))
      this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
      this.option1.columns = [...this.selfColumnsBase]
      listColumnConfigGet({ scenesCode: 'web_shLien_summary_detail_list' }).then((res) => {
        this.columnConfig = true
        this.dealCustomColumn(res)
      })
    },
    // 自定义表头
    customColumnsPopClose(action, value) {
      this.customColumnsPopShow = false
      if (action === 'Confirm') {
        let columnList = this.getColumnsValues(value) // getColumnsValues在本页面无作用
        listColumnConfigSave({ columnList, scenesCode: 'web_shLien_summary_detail_list' }).then((res) => {
          this.dealCustomColumn(res)
        })
      }
    },
    dealCustomColumn(res) {
      if (res.data?.columnList?.length) {
        let list = res.data.columnList
        this.configColumns = list
        this.option1.columns = list.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop)).filter((v) => v)
      }
    },
    // 返回
    cancel() {
      this.delVisitedView()
      this.routerPush('SeaCommerceList')
    },
    // 月度账单详情数据
    getShLienMonInfo() {
      let data = {
        shLienMonNo: this.shLienMonNo,
      }
      shLienMonInfo(data)
        .then((res) => {
          let find = this.option1.columns.find((item) => item.prop === 'sysLineGroupName')
          if (find) {
            this.$set(find, 'hide', res.data.businessGroup === 'air')
          }
          console.log(find)
          this.summary = res.data
          this.option1.data = res.data.feeList
        })
        .catch((e) => this.cancel())
    },
    search(list) {
      this.option1.data = [...list]
    },
  },
  activated() {
    // 获取账单id
    // this.init()
    this.shLienMonNo = this.$route.query.shLienMonNo
    this.getShLienMonInfo()
    this.$refs.DetailFeeSearchFilter && this.$refs.DetailFeeSearchFilter.clearData()
  },
  watch: {
    'option1.data': {
      handler(val) {
        // invisible:true  表示隐藏
        console.log(val)
        let list = val.filter((v) => !v.invisible)
        // 费用编码是 TZFY   就是亏损，其他的就是留置费
        // 总留置费用：summary.totalLienAmt 总亏损费用：summary.totalLossAmt
        // 剩余留置费用：summary.restLienAmt 剩余亏损费用：summary.restLossAmt
        // 总 feeAmt,  剩余 feeBalanceAmt
        let obj = {}
        let totalLossAmt, restLossAmt, totalLienAmt, restLienAmt, totalTeu
        list.forEach((item) => {
          if (item.feeCode === 'TZFY') {
            totalLossAmt = new LSnum(totalLossAmt).plus(item.feeAmt).toNum(2)
            restLossAmt = new LSnum(restLossAmt).plus(item.feeBalanceAmt).toNum(2)
          } else {
            totalLienAmt = new LSnum(totalLienAmt).plus(item.feeAmt).toNum(2)
            restLienAmt = new LSnum(restLienAmt).plus(item.feeBalanceAmt).toNum(2)
          }
          if (!obj[item.sourceBizNo]) {
            obj[item.sourceBizNo] = true
            totalTeu = new LSnum(totalTeu).plus(item.amountTReal).toNum(2)
          }
        })
        this.summary.totalLienAmt = totalLienAmt || 0
        this.summary.totalLossAmt = totalLossAmt || 0
        this.summary.restLienAmt = restLienAmt || 0
        this.summary.restLossAmt = restLossAmt || 0
        this.summary.totalTeu = totalTeu || 0
      },
      immediate: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}

.base-info-box {
  margin: 20px 10px;

  .base-info-cnt {
    display: flex;
    flex-wrap: wrap;
    .base-item {
      flex-basis: calc(25% - 10px);
      margin-bottom: 10px;
      margin-right: 10px;
      .sub-title {
        min-width: 60px;
        text-align: right;
        display: inline-block;
        // text-align-last: justify;
      }
      &.flex-item {
        flex: 1;
        flex-basis: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

.list-title {
  font-size: 14px;
  font-weight: 600;
  color: #909399;
  line-height: 14px;
  padding: 10px;
  margin: 0 8px;
  background-color: #f8f9fd;
  border-bottom: 1px solid #dfe6ec;

  span {
    margin-left: 12px;
    font-weight: 500;
    font-size: 12px;

    b {
      color: red;
    }
  }
}
</style>
