<template>
  <!-- <div
    class="finance-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">滞纳金收取</div>
        </div>
        <div class="money-box-right">
          <el-button @click="confirm" size="mini" type="primary">确认处理</el-button>
          <el-button @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
        </div>
      </div> -->
    <el-dialog
      :title="$t('LateFee.collectLateFee')"
      :visible.sync="receiveVisible"
      width="880px"
      @close="cancel">
      <div class="settlement-detail-form settlement-detail-form-own">
        <el-form
          :model="lateFeeForm"
          ref="lateFeeForm"
          :rules="lateFeeRules"
          :inline="true"
          size="mini"
          label-width="190px"
        >
          <DetailDiv :width="'342'" :labelWidth="'160'" :label="$t('Hedge.custOverduePaymentNo')" :content="lateFeeForm.custOverduePaymentNo" :isTooltip="true" />
          <DetailDiv :width="'342'" :labelWidth="'160'" :label="$t('FeeList.settleComp')" :content="lateFeeForm.settleCompName" :isTooltip="true" />
          <DetailDiv :width="'342'" :labelWidth="'160'" :label="$t('FeeList.settleCorp')" :content="lateFeeForm.settleCorpName" />
          <DetailDiv :width="'342'" :labelWidth="'160'" :label="$t('OrderFee.currency')" :content="lateFeeForm.currency" />
          <DetailDiv :width="'342'" :labelWidth="'160'" :label="$t('Finance.actuallatefee')" :content="lateFeeForm.lateFeeAmt" />
          <el-form-item :label="$t('LateFee.assumerType')+': '" prop="assumerType">
            <el-select
              v-model="lateFeeForm.assumerType"
              :placeholder="$t('Common.plSelect')"
            >
              <el-option
                v-for="(op, j) in dictMap['custOverduePaymentAssumerType']"
                :key="'assumerType' + j"
                :label="op.label"
                :value="op.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="lateFeeForm.assumerType==='customer'||lateFeeForm.assumerType==='both'" :label="$t('LateFee.customerAssumerAmt')+': '" prop="customerAssumerAmt">
            <el-input v-model="lateFeeForm.customerAssumerAmt" :disabled="customerAmtDisabled" @input="customerAmtInput" :placeholder="$t('Common.plEnter')">
            </el-input>
          </el-form-item>
          <el-form-item v-if="lateFeeForm.assumerType==='order'||lateFeeForm.assumerType==='both'" :label="$t('LateFee.orderAssumerAmt')+': '" prop="orderAssumerAmt">
            <el-input v-model="lateFeeForm.orderAssumerAmt" :disabled="orderAmtDisabled" :placeholder="$t('Common.plEnter')">
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="confirm" size="mini" type="primary">{{$t('LateFee.confirmProcess')}}</el-button>
        <el-button @click="cancel" size="mini">{{$t('OrderFee.cancel')}}</el-button>
      </span>
    </el-dialog>
    <!-- </div>
  </div> -->
</template>

<script>
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { lateFeeReceive } from '@/api/fin/custOverduePayment'
export default {
  mixins: [mixin, routerMixin],
  props: {
    receiveVisibleOut: {
      type: Boolean,
      default: false
    },
    lateFeeFormOut: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false,
      lateFeeForm: {
        custOverduePaymentNo: '',
        settleCompName: '',
        settleCorpName: '',
        currency: '',
        lateFeeAmt: '',
        assumerType: '',
        customerAssumerAmt: '',
        orderAssumerAmt: ''
      },
      lateFeeRules: {
        assumerType: [
          { required: true, message: ' ', trigger: 'blur' }
        ],
        customerAssumerAmt: [
          { required: true, message: ' ', trigger: 'blur' }
        ],
        orderAssumerAmt: [
          { required: true, message: ' ', trigger: 'blur' }
        ]
      },
      customerAmtDisabled: false,
      orderAmtDisabled: true,
      receiveVisible: this.receiveVisibleOut,
    }
  },
  computed: {
    // customerAmtDisabled() {
    //   if (this.lateFeeForm.assumerType === 'customer') {
    //     this.lateFeeForm.customerAssumerAmt = this.lateFeeForm.lateFeeAmt
    //     return true
    //   } else {
    //     this.lateFeeForm.customerAssumerAmt = ''
    //     return false
    //   }
    // },
    // orderAmtDisabled() {
    //   if (this.lateFeeForm.assumerType === 'order') {
    //     this.lateFeeForm.orderAssumerAmt = this.lateFeeForm.lateFeeAmt
    //   } else {
    //     this.lateFeeForm.orderAssumerAmt = ''
    //   }
    //   return true
    // }
  },
  watch: {
    'lateFeeForm.assumerType': {
      handler(val) {
        if (val === 'customer') {
          this.lateFeeForm.customerAssumerAmt = this.lateFeeForm.lateFeeAmt
          this.lateFeeForm.orderAssumerAmt = ''
          this.customerAmtDisabled = true
        } else if (val === 'order') {
          this.lateFeeForm.orderAssumerAmt = this.lateFeeForm.lateFeeAmt
          this.lateFeeForm.customerAssumerAmt = ''
        } else if (val === 'both') {
          this.lateFeeForm.orderAssumerAmt = ''
          this.lateFeeForm.customerAssumerAmt = ''
          this.customerAmtDisabled = false
        }
      }
    },
    receiveVisibleOut(val) {
      this.receiveVisible = val
      if (val) {
        let { custOverduePaymentNo, settleCompName, settleCorpName, currency, lateFeeAmt } = this.lateFeeFormOut
        this.lateFeeForm = Object.assign(this.lateFeeForm, {
          custOverduePaymentNo,
          settleCompName,
          settleCorpName,
          currency,
          lateFeeAmt
        })
        this.lateFeeForm.assumerType = ''
        this.lateFeeForm.customerAssumerAmt = ''
        this.lateFeeForm.orderAssumerAmt = ''
      }
    }
  },
  created() {
  },
  methods: {
    customerAmtInput(val) {
      if (!val) return
      if (!/^\d+(\.\d{0,2})?$/.test(val)) {
        return this.$message({ message: this.$t('LateFee.inputPosNo'), type: 'error', showClose: true }) // 只能输入大于0的数字
      }
      if (val > this.lateFeeForm.lateFeeAmt) {
        return this.$message({ message: this.$t('LateFee.inputLessActualAmt'), type: 'error', showClose: true }) // 只能输入小于实际滞纳金的数字
      }
      this.lateFeeForm.orderAssumerAmt = new LSnum(this.lateFeeForm.lateFeeAmt).minus(this.lateFeeForm.customerAssumerAmt).toString()
    },
    confirm() {
      this.$refs.lateFeeForm.validate(valid => {
        if (valid) {
          let data = {
            "custOverduePaymentNo": this.lateFeeForm.custOverduePaymentNo,
            "assumerType": this.lateFeeForm.assumerType,
            "customerAssumerAmt": Number(this.lateFeeForm.customerAssumerAmt),
            "orderAssumerAmt": Number(this.lateFeeForm.orderAssumerAmt)
          }
          lateFeeReceive(data).then(res => {
            this.$message({ message: this.$t('OrderFee.successOp'), type: 'success', showClose: true }) // '处理成功'
            this.cancel(true)
          })
        }
      })
    },
    //返回
    cancel(refresh) {
      // this.routerBack(refresh)
      if (refresh===true) {
        this.$emit('refreshListPage')
      }
      this.$emit('update:receiveVisibleOut', false)
    },
  },
  // activated() {
    // if (!this.$route.meta.isUseCache) {
    //   let { custOverduePaymentNo, settleCompName, settleCorpName, currency, lateFeeAmt } = this.$route.query
    //   this.lateFeeForm = Object.assign(this.lateFeeForm, {
    //     custOverduePaymentNo,
    //     settleCompName,
    //     settleCorpName,
    //     currency,
    //     lateFeeAmt
    //   })
    //   this.lateFeeForm.assumerType = ''
    //   this.lateFeeForm.customerAssumerAmt = ''
    //   this.lateFeeForm.orderAssumerAmt = ''
    // }
  // },
}
</script>

<style lang="scss" scoped>
.finance-approve-btns-box {
  display: flex;
  justify-content: space-between;
  height: 40px;
  padding: 0 24px;
  border-radius: 4px 4px 0px 0px;
  border-bottom: 1px solid #e9e9e9;
}
.finance-approve-btns-left {
  font-size: 18px;
  font-weight: 600;
  color: #222222;
  line-height: 24px;
  margin-top: 8px;
}
.finance-approve-btns-right {
  margin-top: 6px;
}
.settlement-detail-form {
  ::v-deep .el-form-item {
    width: 342px;
  }
  ::v-deep .el-form-item__content{
    width: calc(342px - 190px);
  }
}
</style>
