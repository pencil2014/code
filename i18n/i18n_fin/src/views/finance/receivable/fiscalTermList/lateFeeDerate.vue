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
          <div class="money-title">滞纳金减免申请</div>
        </div>
        <div class="money-box-right">
          <el-button @click="deductionApply" size="mini" type="primary">提交减免申请</el-button>
          <el-button @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
        </div>
      </div> -->
    <el-dialog
      :title="$t('LateFee.derateLateFee')"
      :visible.sync="derateVisible"
      width="920px"
      @close="cancel">
      <div class="settlement-detail-form settlement-detail-form-own">
        <el-form
          :model="lateFeeForm"
          :rules="lateFeeRules"
          ref="lateFeeForm"
          :inline="true"
          size="mini"
          label-width="230px"
        >
          <DetailDiv :width="'392'" :labelWidth="'230'" :label="$t('Hedge.custOverduePaymentNo')" :content="lateFeeForm.custOverduePaymentNo" :isTooltip="true" /><!-- :width="'284'" :labelWidth="'122'" -->
          <DetailDiv :width="'392'" :labelWidth="'230'" :label="$t('FeeList.settleComp')" :content="lateFeeForm.settleCompName" :isTooltip="true" />
          <DetailDiv :width="'392'" :labelWidth="'230'" :label="$t('FeeList.settleCorp')" :content="lateFeeForm.settleCorpName" />
          <DetailDiv :width="'392'" :labelWidth="'230'" :label="$t('OrderFee.currency')" :content="lateFeeForm.currency" />
          <DetailDiv :width="'392'" :labelWidth="'230'" :label="$t('Finance.actuallatefee')" :content="lateFeeForm.lateFeeAmt" />
          <el-form-item :label="$t('LateFee.derateType')+': '" prop="deductionType"><!-- 减免类型 -->
            <el-select
              v-model="lateFeeForm.deductionType"
              @change="deductionTypeChange"
              :placeholder="$t('Common.plSelect')"
            >
              <el-option
                v-for="(op, j) in dictMap['custOverduePaymentDeductionType']"
                :key="'deductionType' + j"
                :label="op.label"
                :value="op.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('LateFee.derateAmt')+': '" prop="deductionAmt"><!-- 减免金额 -->
            <el-input v-model="lateFeeForm.deductionAmt" :disabled="deductionAmtDisabled" @input="deductionAmtInput" :placeholder="$t('Common.plEnter')">
            </el-input>
          </el-form-item>
          <el-form-item class="full-form-item" :label="$t('LateFee.derateReason')+': '" prop="deductionRemark">
            <el-input v-model="lateFeeForm.deductionRemark" :placeholder="$t('Common.plEnter')" :maxlength="500" :show-word-limit="true">
            </el-input>
          </el-form-item>
          <template v-if="lateFeeForm.deductionAmt>=0&&lateFeeForm.deductionAmt!==''&&lateFeeForm.lateFeeAmt-lateFeeForm.deductionAmt>0">
            <el-form-item :label="$t('LateFee.remainLateFeeassumerType')+': '" prop="assumerType"><!-- 剩余金额承担类型 LateFee.remainAmtassumerType -->
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
          </template>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deductionApply" size="mini" type="primary">{{$t('OrderFee.submit')}}</el-button><!-- 提交减免申请 -->
        <el-button @click="cancel" size="mini">{{$t('OrderFee.cancel')}}</el-button>
      </span>
    </el-dialog>
    <!-- </div>
  </div> -->
</template>

<script>
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { deductionApply } from '@/api/fin/custOverduePayment'
export default {
  mixins: [mixin, routerMixin],
  props: {
    derateVisibleOut: {
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
        deductionType: '',
        deductionAmt: '',
        deductionRemark: '',
        assumerType: '',
        customerAssumerAmt: '',
        orderAssumerAmt: ''
      },
      lateFeeRules: {
        deductionType: [
          { required: true, message: ' ', trigger: 'blur' }
        ],
        deductionAmt: [
          { required: true, message: ' ', trigger: 'blur' }
        ],
        deductionRemark: [
          { required: true, message: ' ', trigger: 'blur' }
        ],
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
      derateVisible: this.derateVisibleOut,
    }
  },
  computed: {
    deductionAmtDisabled() {
      if (this.lateFeeForm.deductionType === 'all') {
        return true
      } else {
        return false
      }
    },
    // customerAmtDisabled() {
    //   if (this.lateFeeForm.assumerType === 'customer') {
    //     this.lateFeeForm.customerAssumerAmt = new LSnum(this.lateFeeForm.lateFeeAmt).minus(this.lateFeeForm.deductionAmt).toString()
    //     return true
    //   } else if (this.lateFeeForm.assumerType === 'both') {
    //     this.lateFeeForm.customerAssumerAmt = ''
    //     this.lateFeeForm.orderAssumerAmt = ''
    //     return false
    //   } else {
    //     this.lateFeeForm.customerAssumerAmt = ''
    //     return false
    //   }
    // },
    // orderAmtDisabled() {
    //   if (this.lateFeeForm.assumerType === 'order') {
    //     this.lateFeeForm.orderAssumerAmt = new LSnum(this.lateFeeForm.lateFeeAmt).minus(this.lateFeeForm.deductionAmt).toString()
    //   } else if (this.lateFeeForm.assumerType === 'both') {
    //     this.lateFeeForm.customerAssumerAmt = ''
    //     this.lateFeeForm.orderAssumerAmt = ''
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
          this.lateFeeForm.customerAssumerAmt = new LSnum(this.lateFeeForm.lateFeeAmt).minus(this.lateFeeForm.deductionAmt).toString()
          this.lateFeeForm.orderAssumerAmt = ''
          this.customerAmtDisabled = true
        } else if (val === 'order') {
          this.lateFeeForm.orderAssumerAmt = new LSnum(this.lateFeeForm.lateFeeAmt).minus(this.lateFeeForm.deductionAmt).toString()
          this.lateFeeForm.customerAssumerAmt = ''
        } else if (val === 'both') {
          this.lateFeeForm.orderAssumerAmt = ''
          this.lateFeeForm.customerAssumerAmt = ''
          this.customerAmtDisabled = false
        }
      },
      deep: true
    },
    derateVisibleOut(val) {
      this.derateVisible = val
      if (val) {
        let { custOverduePaymentNo, settleCompName, settleCorpName, currency, lateFeeAmt } = this.lateFeeFormOut
        this.lateFeeForm = Object.assign(this.lateFeeForm, {
          custOverduePaymentNo,
          settleCompName,
          settleCorpName,
          currency,
          lateFeeAmt
        })
        this.lateFeeForm.deductionType = ''
        this.lateFeeForm.deductionAmt = ''
        this.lateFeeForm.deductionRemark = ''
        this.lateFeeForm.assumerType = ''
        this.lateFeeForm.customerAssumerAmt = ''
        this.lateFeeForm.orderAssumerAmt = ''
      }
    }
  },
  created() {
  },
  methods: {
    deductionTypeChange(val) {
      if (val === 'all') {
        this.lateFeeForm.deductionAmt = this.lateFeeForm.lateFeeAmt
      } else {
        this.lateFeeForm.deductionAmt = ''
      }
    },
    deductionAmtInput(val) {
      if (!val) return
      if (!/^\d+(\.\d{0,2})?$/.test(val)) {
        return this.$message({ message: this.$t('LateFee.inputPosNo'), type: 'error', showClose: true }) // '只能输入大于0的数字'
      }
      if (val > this.lateFeeForm.lateFeeAmt) {
        return this.$message({ message: this.$t('LateFee.inputLessActualAmt'), type: 'error', showClose: true }) // '只能输入小于实际滞纳金的数字'
      }
    },
    customerAmtInput(val) {
      // this.lateFeeForm.orderAssumerAmt = this.lateFeeForm.lateFeeAmt - this.lateFeeForm.deductionAmt - this.lateFeeForm.customerAssumerAmt
      if (!val) return
      if (!/^\d+(\.\d{0,2})?$/.test(val)) {
        return this.$message({ message: this.$t('LateFee.inputPosNo'), type: 'error', showClose: true }) // '只能输入大于0的数字'
      }
      if (val > (this.lateFeeForm.lateFeeAmt - this.lateFeeForm.deductionAmt)) {
        return this.$message({ message: this.$t('LateFee.inputLessRemainAmt'), type: 'error', showClose: true }) // '只能输入小于剩余金额的数字'
      }
      this.lateFeeForm.orderAssumerAmt = new LSnum(this.lateFeeForm.lateFeeAmt).minus(this.lateFeeForm.deductionAmt).minus(this.lateFeeForm.customerAssumerAmt).toString()
    },
    // orderAmtChange() {
    //   this.lateFeeForm.customerAssumerAmt = this.lateFeeForm.lateFeeAmt - this.lateFeeForm.deductionAmt - this.lateFeeForm.orderAssumerAmt
    // },
    deductionApply() {
      this.$refs.lateFeeForm.validate(valid => {
        if (valid) {
          let data = {
            custOverduePaymentNo: this.lateFeeForm.custOverduePaymentNo,
            deductionType: this.lateFeeForm.deductionType,
            deductionAmt: Number(this.lateFeeForm.deductionAmt),
            deductionRemark: this.lateFeeForm.deductionRemark,
            assumerType: this.lateFeeForm.assumerType,
            customerAssumerAmt: Number(this.lateFeeForm.customerAssumerAmt),
            orderAssumerAmt: Number(this.lateFeeForm.orderAssumerAmt)
          }
          if (this.lateFeeForm.deductionType === 'all') {
            data.assumerType = ''
            data.customerAssumerAmt = 0
            data.orderAssumerAmt = 0
          }
          deductionApply(data).then(res => {
            this.$message({ message: this.$t('OrderFee.successOp'), type: 'success', showClose: true }) // '提交成功'
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
      this.$emit('update:derateVisibleOut', false)
    },
  },
  // activated() {
  //   if (!this.$route.meta.isUseCache) {
  //     let { custOverduePaymentNo, settleCompName, settleCorpName, currency, lateFeeAmt } = this.$route.query
  //     this.lateFeeForm = Object.assign(this.lateFeeForm, {
  //       custOverduePaymentNo,
  //       settleCompName,
  //       settleCorpName,
  //       currency,
  //       lateFeeAmt
  //     })
  //     this.lateFeeForm.deductionType = ''
  //     this.lateFeeForm.deductionAmt = ''
  //     this.lateFeeForm.deductionRemark = ''
  //     this.lateFeeForm.assumerType = ''
  //     this.lateFeeForm.customerAssumerAmt = ''
  //     this.lateFeeForm.orderAssumerAmt = ''
  //   }
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
  .el-form-item {
    width: 284px;
  }
}
.full-form-item {
  width: 100% !important;
  margin-right: 0;
  padding-right: 8px;
}
.full-form-item ::v-deep .el-form-item__content {
  width: calc(100% - 230px) !important;
  height: auto;
  display: inline-flex;
  .el-input {
    flex: 1 1 auto;
  }
  .el-button {
    margin-left: 10px;
  }
}
.settlement-detail-form {
  ::v-deep .el-form-item {
    width: 392px;
  }
  ::v-deep .el-form-item__content{
    width: calc(392px - 230px);
  }
}
</style>
