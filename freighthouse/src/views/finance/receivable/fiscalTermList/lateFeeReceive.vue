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
          <el-button @click="cancel" size="mini">返回</el-button>
        </div>
  </div>-->
  <el-dialog title="滞纳金收取" :visible.sync="receiveVisible" width="780px" @close="cancel">
    <div class="settlement-detail-form settlement-detail-form-own">
      <el-form
        :model="lateFeeForm"
        ref="lateFeeForm"
        :rules="lateFeeRules"
        :inline="true"
        size="mini"
        label-width="100px"
      >
        <DetailDiv label="滞纳金编号：" :content="lateFeeForm.custOverduePaymentNo" :isTooltip="true" />
        <DetailDiv label="分公司：" :content="lateFeeForm.settleCompName" :isTooltip="true" />
        <DetailDiv label="结算单位：" :content="lateFeeForm.settleCorpName" />
        <DetailDiv label="币种：" :content="lateFeeForm.currency" />
        <DetailDiv label="实际滞纳金：" :content="lateFeeForm.lateFeeAmt" />
        <br />
        <el-form-item label="承担类型：" prop="assumerType">
          <el-select v-model="lateFeeForm.assumerType" placeholder="请选择">
            <el-option
              v-for="(op, j) in dictMap['custOverduePaymentAssumerType']"
              :key="'assumerType' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <br v-if="lateFeeForm.assumerType==='both'"/>
        <el-form-item
          v-if="lateFeeForm.assumerType==='customer'||lateFeeForm.assumerType==='both'"
          label="客户承担金额："
          prop="customerAssumerAmt"
        >
          <el-input
            v-model="lateFeeForm.customerAssumerAmt"
            :disabled="customerAmtDisabled"
            @input="customerAmtInput"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item
          v-if="lateFeeForm.assumerType==='order'||lateFeeForm.assumerType==='both'"
          label="订单承担金额："
          prop="orderAssumerAmt"
        >
          <el-input
            v-model="lateFeeForm.orderAssumerAmt"
            :disabled="orderAmtDisabled"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
      </el-form>
      <ConfirmDialog :option="confirmOption" @close="sureConfirm" />
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="confirm" size="mini" type="primary">确认处理</el-button>
      <el-button @click="cancel" size="mini">返回</el-button>
    </span>
  </el-dialog>
  <!-- </div>
  </div>-->
</template>

<script>
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { lateFeeReceive } from '@/api/fin/custOverduePayment'
import ConfirmDialog from '@/views/finance/components/financeDialog/confirmDialog.vue'
export default {
  mixins: [mixin, routerMixin],
  props: {
    receiveVisibleOut: {
      type: Boolean,
      default: false,
    },
    lateFeeFormOut: {
      type: Object,
      default: () => ({}),
    },
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
        assumerType: '',
        customerAssumerAmt: '',
        orderAssumerAmt: '',
      },
      lateFeeRules: {
        assumerType: [{ required: true, message: ' ', trigger: 'blur' }],
        customerAssumerAmt: [{ required: true, message: ' ', trigger: 'blur' }],
        orderAssumerAmt: [{ required: true, message: ' ', trigger: 'blur' }],
      },
      customerAmtDisabled: false,
      orderAmtDisabled: true,
      receiveVisible: this.receiveVisibleOut,
      confirmOption: {
        show: false,
        noModalClose: true,
        title: '滞纳金收取确认',
        titleText: '您是否确认该滞纳金的处理方式？',
        formList: [],
      },
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
      },
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
          lateFeeAmt,
        })
        this.lateFeeForm.assumerType = ''
        this.lateFeeForm.customerAssumerAmt = ''
        this.lateFeeForm.orderAssumerAmt = ''
      }
    },
  },
  created() {},
  methods: {
    customerAmtInput(val) {
      if (!val) return
      if (!/^\d+(\.\d{0,2})?$/.test(val)) {
        return this.$message({ message: '只能输入大于0的数字', type: 'error', showClose: true })
      }
      if (val > this.lateFeeForm.lateFeeAmt) {
        return this.$message({ message: '只能输入小于实际滞纳金的数字', type: 'error', showClose: true })
      }
      this.lateFeeForm.orderAssumerAmt = new LSnum(this.lateFeeForm.lateFeeAmt)
        .minus(this.lateFeeForm.customerAssumerAmt)
        .toString()
    },
    confirm() {
      // console.log(this.lateFeeForm.assumerType);
      this.$refs.lateFeeForm.validate((valid) => {
        if (valid) {
          let { assumerType, customerAssumerAmt, orderAssumerAmt, currency } = this.lateFeeForm
          console.log(assumerType);
          this.confirmOption.formList = [
            {
              label: '承担类型',
              prop: 'assumerType',
              value: this.dictMapObj.custOverduePaymentAssumerType[assumerType],
              isFull: assumerType === 'both',
            },
            { label: '客户承担金额', prop: 'customerAssumerAmt', value: customerAssumerAmt + ' ' + currency, hide: assumerType === 'order' },
            { label: '订单承担金额', prop: 'orderAssumerAmt', value: orderAssumerAmt + ' ' + currency, hide: assumerType === 'customer' },
          ]
          this.confirmOption.show = true
        }
      })
    },
    sureConfirm(tag) {
      if (tag === true) {
        lateFeeReceive({
          custOverduePaymentNo: this.lateFeeForm.custOverduePaymentNo,
          assumerType: this.lateFeeForm.assumerType,
          customerAssumerAmt: Number(this.lateFeeForm.customerAssumerAmt),
          orderAssumerAmt: Number(this.lateFeeForm.orderAssumerAmt),
        }).then((res) => {
          this.confirmOption.show = false
          this.$message({ message: '处理成功', type: 'success', showClose: true })
          this.cancel(true)
        })
      }
    },
    //返回
    cancel(refresh) {
      // this.routerBack(refresh)
      if (refresh === true) {
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
</style>
