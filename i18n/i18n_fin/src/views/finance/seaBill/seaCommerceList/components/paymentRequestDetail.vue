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
          <div class="money-title">结算申请详情</div>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button
              v-if="checkAuth('SeaCommerceList', 'tab-commerceSettlementBillList', 'btn-confirmPass') && canAudit"
              class="finance-btn"
              size="mini"
              type="success"
              @click="confirmPass"
            >审核通过</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth('SeaCommerceList', 'tab-commerceSettlementBillList', 'btn-confirmReject') && canAudit"
              class="finance-btn"
              size="mini"
              type="danger"
              @click="confirmReject"
            >审核拒绝</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth('SeaCommerceList', 'tab-commerceSettlementBillList', 'btn-handleWithdrawPayApplyAudit') && canCancel"
              class="finance-btn"
              size="mini"
              @click="handleWithdrawPayApplyAudit"
              type="purple"
            >撤回申请</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" size="mini" @click="cancel">{{$t('Common.back')}}</el-button>
          </el-button-group>
        </div>
      </div>
      <div class="base-info-box">
        <div class="base-info-cnt">
          <div class="base-item">
            <span class="sub-title">{{$t('FeeList.settleCorp')}}：</span>
            <el-tooltip v-if="detailInfo.settleCorpName" :content="detailInfo.settleCorpName">
              <span class="detail__content">{{detailInfo.settleCorpName}}</span>
            </el-tooltip>
          </div>
          <div class="base-item">
            <span class="sub-title">币种：</span>
            {{detailInfo.currency}}
          </div>
          <div class="base-item">
            <span class="sub-title">{{$t('Settle.payWay')}}: </span>
            {{dictMapObj['payWay'][detailInfo.payWay]}}
          </div>
          <div class="base-item">
            <span class="sub-title">最晚{{$t('FinBill.paymentDate')}}：</span>
            {{detailInfo.latestPayDay}}
          </div>
          <div class="base-item">
            <span class="sub-title">{{$t('Settle.paymentCurrency')}}: </span>
            {{detailInfo.settleCurrency}}
          </div>
          <div
            class="settlement-exchange-rates"
            style="flex-basis: calc(25% - 8px);margin-right:8px;line-height:20px;"
          >
            <!-- <span style="display:inline-block;width:60px;text-align:right;">汇率：</span> -->
            <span>汇率：</span>
            <span
              v-if="exchangeRatesSettle.length"
            >{{exchangeRatesSettle[0].settlementRateTitle}} {{exchangeRatesSettle[0].settleRate}}</span>
            <el-button
              v-if="exchangeRatesSettle.length"
              type="text"
              size="mini"
              @click="checkExchangeRage"
            >{{$t('Common.more')}}</el-button>
          </div>
          <div class="base-item">
            <span class="sub-title">{{$t('Settle.applyPayAmt')}}: </span>
            {{detailInfo.applyPayAmt}}
          </div>
          <div class="base-item">
            <span class="sub-title">收款账户名：</span>
            {{detailInfo.recvAccountNo}}
          </div>
          <div class="base-item">
            <span class="sub-title">审核状态：</span>
            {{dictMapObj['confirmStatus'][detailInfo.auditStatus]}}
          </div>
          <div class="base-item">
            <span class="sub-title">当前审核人：</span>
            {{detailInfo.auditName}}
          </div>
          <div class="base-item">
            <span class="sub-title" style="vertical-align:middle;">申请备注：</span>
            <el-tooltip :content="detailInfo.applyRemark">
              <span class="finance-el-form-item-tootip" style="width:calc(100% - 60px);vertical-align:middle;">
                {{detailInfo.applyRemark}}
              </span>
            </el-tooltip>
          </div>
        </div>
      </div>
      <div class="requst-list">
        <div class="list-title">
          费用列表
          <span>剩余留置费用：{{originalBalance}}</span>
          <span>
            付款总金额：
            <b>{{ detailInfo.applyPayAmt }}</b>
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
    <el-dialog :title="'审批不通过'" :visible.sync="refuseOpen" width="600px">
      <el-form :model="refuseForm" ref="refuseForm" label-width="80px">
        <el-form-item
          label="拒绝原因"
          prop="refuseReason"
          :rules="{required: true,message: '拒绝原因不能为空',trigger: 'blur',}"
        >
          <el-input
            type="textarea"
            :maxlength="500"
            show-word-limit
            v-model="refuseForm.refuseReason"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmit" size="mini">{{$t('Common.sure')}}</el-button>
        <el-button @click="refuseOpen = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
    <ExchangeRateDialog v-if="rateDialogCfg.show" :dialogOption="rateDialogCfg" />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import DetailFeeSearchFilter from '@/views/finance/components/financeSearch/detailFeeSearchFilter'
import ExchangeRateDialog from './exchangeRateDialog'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { queryShLienSettleApplyInfo, shLienSettleAudit, applyAuditCancel } from '@/api/fin/shBill'
export default {
  components: {
    FinanceTable,
    DetailFeeSearchFilter,
    ExchangeRateDialog,
  },
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      feeSearchToggle: false,
      feeListColumns: [],
      refuseOpen: false,
      refuseForm: { refuseReason: '' },
      option1: {},
      detailInfo: {
        settleCurrency: '',
        payWay: '',
        payAmt: '',
        settleRateName: '',
        settleRate: '',
        latestPayDay: '',
        recvAccountNo: '',
        payCompCode: '',
        payCompName: '',
        applyRemark: ''
      },
      exchangeRatesSettle: [],
      rateDialogCfg: { data: [], show: false, title: '查看汇率', change: false }, // 汇率弹框配置
    }
  },
  computed: {
    isPending() {
      return ['pending', 'approving'].includes(this.detailInfo.auditStatus)
    },
    canAudit() {
      return this.isPending && this.detailInfo.auditId == this.$store.state.user.userId
    },
    canCancel() {
      return this.isPending && this.detailInfo.createdBy == this.$store.state.user.userId
    },
    originalBalance() {
      let obj = {}
      this.option1.data.forEach((item) => {
        if (obj[item.currency]) {
          obj[item.currency] = new LSnum(obj[item.currency]).plus(item.balanceAmt).num
        } else {
          obj[item.currency] = item.balanceAmt
        }
      })
      let str = ''
      for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
          str += `${key} ${obj[key]}　`
        }
      }
      return str
    },
  },
  created() {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'PaymentRequest',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns: false,
      selection: false,
      index: true,
      edit: true,
      pagination: false,
    })
    let columns = [
      {
        prop: 'shLienMonNo',
        label: '月度编号',
        type: 'button',
        width: 125,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option, subItem) => {
            const query = {
              shLienMonNo: row.shLienMonNo,
            }
            this.routerPush('SummaryBillDetail', query)
          },
        },
        st: 1,
      },
      { prop: 'yearMon', label: '所属年月', type: 'text', st: 5 },
      { prop: 'sysLineName', label: '航线', type: 'text', st: 2 },
      {
        prop: 'orderNo',
        label: this.$t('FeeList.orderNo'),
        type: 'button',
        width: 125,
        st: 1,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option, subItem) => {
            this.showOneNoDetail('order', row.orderNo, { feeChild: 'specialManagementFee', isFromSea: true })
          },
        },
      },
      // { prop: 'orderNo', label: this.$t('FeeList.orderNo'), type: 'text', width: 150, st: 1 },
      { prop: 'settleCompName', label: this.$t('FeeList.settleComp'), type: 'text', width: 150, st: 2 },
      { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', width: 150, st: 2 },
      { prop: 'feeEnName', label: this.$t('FeeList.feeEname'), type: 'text', st: 2 },
      { prop: 'currency', label: this.$t('FeeList.currency'), type: 'text', st: 2 },
      { prop: 'balanceAmt', label: '剩余金额', type: 'text' },
      { prop: 'settleAmt', label: '原币付款金额', type: 'text' },
      { prop: 'settleCurrency', label: this.$t('Settle.paymentCurrency'), type: 'text', st: 2 },
      { prop: 'settleRate', label: '汇率', type: 'text' },
      { prop: 'exSettleAmt', label: this.$t('Settle.applyPayAmt'), type: 'text' },
      { prop: 'createdName', label: this.$t('Common.createdBy'), type: 'text', st: 2 },
      { prop: 'createdTime', label: this.$t('Common.createTime'), type: 'text', width: 130, st: 4 },
      { prop: 'confirmName', label: '确认人', type: 'text', st: 2 },
      { prop: 'confirmTime', label: '确认时间', type: 'text', width: 130, st: 4 },
    ]
    this.feeListColumns.push(...columns.map((item) => ({ ...item })))
    this.option1.columns = columns
  },
  methods: {
    // 取消返回
    cancel() {
      this.routerBack()
    },
    // 确认审核成功校验
    confirmPass() {
      const auditId = [...new Set(this.multipleSelection.map((item) => item.auditId || -1))]
      console.log(auditId[0], this.$store.state.user.userId)
      if (auditId.length > 1 || auditId[0] != this.$store.state.user.userId) {
        return this.$msgErrClose('您不是所选数据的审批人')
      }
      this.$confirmWarn('是否确认审核成功该账单记录？', () => {
        const arr = this.multipleSelection
        const applyNoList = arr.map((item) => {
          return item.applyNo
        })
        const auditStatus = 'pass'
        const data = { applyNoList, auditStatus }
        shLienSettleAudit(data).then((res) => {
          this.$msgSucClose('审核账单成功！')
          this.getData()
        })
      })
    },
    confirmReject() {
      this.refuseOpen = true
    },
    // 审批拒绝
    handleSubmit() {
      this.$refs.refuseForm.validate((valid) => {
        if (!valid) return
        const data = {
          applyNoList: this.multipleSelection[0].applyNo,
          auditStatus: 'refuse',
          refuseReason: this.refuseForm.refuseReason,
        }
        shLienSettleAudit(data).then((res) => {
          this.$msgSucClose('审批拒绝成功!')
          this.refuseOpen = false
          this.getData()
        })
      })
    },
    //撤回申请
    handleWithdrawPayApplyAudit() {
      this.$confirmWarn('是否确认撤回申请？', () => {
        applyAuditCancel({ applyNo: this.applyNo }).then((res) => {
          this.$msgSucClose('撤回申请成功!')
          this.getData()
        })
      })
    },
    getData() {
      this.lsLoading = true
      queryShLienSettleApplyInfo({ applyNo: this.detailInfo.applyNo })
        .then((res) => {
          let resData = res.data || {}
          Object.assign(this.detailInfo, resData)
          this.option1.data = resData.shLienSettleFeeList || []
          let ratesObj = {}
          this.exchangeRatesSettle = []
          this.option1.data.forEach(({ currency, settleCurrency, settleRate }) => {
            if (!ratesObj[currency + '-' + settleCurrency]) {
              ratesObj[currency + '-' + settleCurrency] = settleRate
            }
          })
          for (const key in ratesObj) {
            if (Object.hasOwnProperty.call(ratesObj, key)) {
              let [originCurrency, settleCurrency] = key.split('-')
              this.exchangeRatesSettle.push({
                settlementRateTitle: key,
                originCurrency,
                settleCurrency,
                settleRate: ratesObj[key],
              })
            }
          }
        })
        .finally(() => (this.lsLoading = false))
    },
    search(list) {
      this.option1.data = [...list]
    },
    checkExchangeRage() {
      this.rateDialogCfg.data = this.exchangeRatesSettle
      this.rateDialogCfg.show = true
    },
  },
  activated() {
    // 获取付款申请数据
    let applyNo = sessionStorage.getItem('queryShLienSettleApplyInfo')
    sessionStorage.removeItem('queryShLienSettleApplyInfo')
    this.detailInfo.applyNo = applyNo
    if (applyNo) {
      this.getData()
      this.$refs.DetailFeeSearchFilter && this.$refs.DetailFeeSearchFilter.clearData()
    }
  },
}
</script>

<style lang="scss" scoped>
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}

.base-info-box {
  margin: 12px 10px;

  .base-info-cnt {
    display: flex;
    flex-wrap: wrap;
    .base-item {
      flex-basis: calc(25% - 8px);
      margin-bottom: 4px;
      margin-right: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 20px;
      .sub-title {
        // min-width: 60px;
        // text-align: right;
        display: inline-block;
        // text-align-last: justify;
      }
      &.full-item {
        flex: 1;
        flex-basis: 100%;
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
    margin-left: 30px;
    font-weight: 500;
    font-size: 12px;

    b {
      color: red;
    }
  }
}
.settle-rate {
  position: absolute;
  border: none;
}
</style>
