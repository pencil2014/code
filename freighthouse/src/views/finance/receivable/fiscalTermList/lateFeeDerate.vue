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
          <el-button @click="cancel" size="mini">返回</el-button>
        </div>
      </div> -->
    <el-dialog
      title="滞纳金减免申请"
      :visible.sync="derateVisible"
      width="780px"
      @close="cancel">
      <div class="settlement-detail-form settlement-detail-form-own">
        <el-form
          :model="lateFeeForm"
          :rules="lateFeeRules"
          ref="lateFeeForm"
          :inline="true"
          size="mini"
          label-width="122px"
        >
          <DetailDiv label="滞纳金编号：" :content="lateFeeForm.custOverduePaymentNo" :isTooltip="true" :width="'284'" :labelWidth="'122'" />
          <DetailDiv label="分公司：" :content="lateFeeForm.settleCompName" :isTooltip="true" :width="'284'" :labelWidth="'122'" />
          <DetailDiv label="结算单位：" :content="lateFeeForm.settleCorpName" :width="'284'" :labelWidth="'122'" />
          <DetailDiv label="币种：" :content="lateFeeForm.currency" :width="'284'" :labelWidth="'122'" />
          <DetailDiv label="实际滞纳金：" :content="lateFeeForm.lateFeeAmt" :width="'284'" :labelWidth="'122'" />
          <br />
          <el-form-item label="减免类型：" prop="deductionType">
            <el-select
              v-model="lateFeeForm.deductionType"
              @change="deductionTypeChange"
              placeholder="请选择"
            >
              <el-option
                v-for="(op, j) in dictMap['custOverduePaymentDeductionType']"
                :key="'deductionType' + j"
                :label="op.label"
                :value="op.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="减免金额：" prop="deductionAmt">
            <el-input v-model="lateFeeForm.deductionAmt" :disabled="deductionAmtDisabled" @input="deductionAmtInput" placeholder="请输入">
            </el-input>
          </el-form-item>
          <el-form-item class="full-form-item" label="减免原因：" prop="deductionRemark">
            <el-input v-model="lateFeeForm.deductionRemark" placeholder="请输入" :maxlength="500" :show-word-limit="true">
            </el-input>
          </el-form-item>
          <template v-if="lateFeeForm.deductionAmt>=0&&lateFeeForm.deductionAmt!==''&&lateFeeForm.lateFeeAmt-lateFeeForm.deductionAmt>0">
            <el-form-item label="剩余金额承担类型：" prop="assumerType">
              <el-select
                v-model="lateFeeForm.assumerType"
                placeholder="请选择"
              >
                <el-option
                  v-for="(op, j) in dictMap['custOverduePaymentAssumerType']"
                  :key="'assumerType' + j"
                  :label="op.label"
                  :value="op.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <br v-if="lateFeeForm.assumerType==='both'"/>
            <el-form-item v-if="lateFeeForm.assumerType==='customer'||lateFeeForm.assumerType==='both'" label="客户承担金额：" prop="customerAssumerAmt">
              <el-input v-model="lateFeeForm.customerAssumerAmt" :disabled="customerAmtDisabled" @input="customerAmtInput" placeholder="请输入">
              </el-input>
            </el-form-item>
            <el-form-item v-if="lateFeeForm.assumerType==='order'||lateFeeForm.assumerType==='both'" label="订单承担金额：" prop="orderAssumerAmt">
              <el-input v-model="lateFeeForm.orderAssumerAmt" :disabled="orderAmtDisabled" placeholder="请输入">
              </el-input>
            </el-form-item>
          </template>
        </el-form>
        <ConfirmDialog :option="confirmOption" @close="sureConfirm" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deductionApply" size="mini" type="primary">提交减免申请</el-button>
        <el-button @click="cancel" size="mini">返回</el-button>
      </span>
    </el-dialog>
    <!-- </div>
  </div> -->
</template>

<script>
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { deductionApply } from '@/api/fin/custOverduePayment'
import ConfirmDialog from '@/views/finance/components/financeDialog/confirmDialog.vue'
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
  components: {
    ConfirmDialog,
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
      confirmOption: {
        show: false,
        noModalClose: true,
        title: '滞纳金减免确认',
        titleText: '您是否确认该滞纳金的处理方式？',
        formList: [],
        labelWidth: '122',
      },
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
        return this.$message({ message: '只能输入大于0的数字', type: 'error', showClose: true })
      }
      if (val > this.lateFeeForm.lateFeeAmt) {
        return this.$message({ message: '只能输入小于实际滞纳金的数字', type: 'error', showClose: true })
      }
    },
    customerAmtInput(val) {
      // this.lateFeeForm.orderAssumerAmt = this.lateFeeForm.lateFeeAmt - this.lateFeeForm.deductionAmt - this.lateFeeForm.customerAssumerAmt
      if (!val) return
      if (!/^\d+(\.\d{0,2})?$/.test(val)) {
        return this.$message({ message: '只能输入大于0的数字', type: 'error', showClose: true })
      }
      if (val > (this.lateFeeForm.lateFeeAmt - this.lateFeeForm.deductionAmt)) {
        return this.$message({ message: '只能输入小于剩余金额的数字', type: 'error', showClose: true })
      }
      this.lateFeeForm.orderAssumerAmt = new LSnum(this.lateFeeForm.lateFeeAmt).minus(this.lateFeeForm.deductionAmt).minus(this.lateFeeForm.customerAssumerAmt).toString()
    },
    // orderAmtChange() {
    //   this.lateFeeForm.customerAssumerAmt = this.lateFeeForm.lateFeeAmt - this.lateFeeForm.deductionAmt - this.lateFeeForm.orderAssumerAmt
    // },
    deductionApply() {
      // console.log(this.lateFeeForm.deductionType, this.lateFeeForm.assumerType,);
      this.$refs.lateFeeForm.validate(valid => {
        if (valid) {
          let { deductionType, assumerType, deductionAmt, customerAssumerAmt, orderAssumerAmt, currency } = this.lateFeeForm
          this.confirmOption.formList = [
            {
              label: '减免类型',
              prop: 'deductionType',
              value: this.dictMapObj.custOverduePaymentDeductionType[deductionType],
            },
            { label: '减免金额', prop: 'deductionAmt', value: deductionAmt + ' ' + currency, },
            {
              label: '剩余金额承担类型',
              prop: 'assumerType',
              value: this.dictMapObj.custOverduePaymentAssumerType[assumerType],
              hide: !assumerType,
              isFull: assumerType === 'both',
            },
            { label: '客户承担金额', prop: 'customerAssumerAmt', value: customerAssumerAmt + ' ' + currency, hide: !assumerType || assumerType === 'order' },
            { label: '订单承担金额', prop: 'orderAssumerAmt', value: orderAssumerAmt + ' ' + currency, hide: !assumerType || assumerType === 'customer' },
          ]
          this.confirmOption.show = true
        }
      })
    },
    sureConfirm(tag) {
      if (tag === true) {
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
          this.confirmOption.show = false
          this.$message({ message: '提交成功', type: 'success', showClose: true })
          this.cancel(true)
        })
      }
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
  width: calc(100% - 122px) !important;
  height: auto;
  display: inline-flex;
  .el-input {
    flex: 1 1 auto;
  }
  .el-button {
    margin-left: 10px;
  }
}
</style>
