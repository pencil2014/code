<template>
  <div class="info-page" style="margin-bottom: 20px;">
    <div class="info-title">
      <el-radio-group v-model="pageStatus" size="mini">
        <el-radio-button label="account">账号信息</el-radio-button>
        <el-radio-button label="invoice">开票资料</el-radio-button>
      </el-radio-group>
      <div>
        <!-- <el-button
          class="notSelf-hide"
          v-show="isAccount"
          size="mini"
          @click="invalidShow = true"
          type="danger"
        >失效</el-button> -->
        <el-button
          class="notSelf-hide"
          v-show="isAccount&&!isBlacklist"
          size="mini"
          @click="account=true"
          type="primary"
        >添加银行信息</el-button>
      </div>
      <el-button
        :loading="invoice"
        class="notSelf-hide"
        v-show="!isAccount && !isBlacklist"
        size="mini"
        @click="invoice=true"
        type="primary"
      >保存</el-button>
    </div>
    <keep-alive>
      <component
        :custid="custid"
        :orgid="orgid"
        :account.sync="account"
        :companyName="$attrs.companyName"
        :invalidShow.sync="invalidShow"
        :invoice.sync="invoice"
        :banklist.sync="banklist"
        :isBlacklist="isBlacklist"
        :is="currentComponent"
        :isSelf="isSelf"
        :isSupplier="isSupplier"
        :isShipC="isShipC"
      />
    </keep-alive>
  </div>
</template>
<script>
import BankAccount from './bankAccount'
import BankInvoice from './bankInvoice'

export default {
  name: 'CUST7',
  label: '银行信息',
  supplierShow: true,
  shipperShow: true,
  props: ['custid', 'orgid', 'isSelf', 'isSupplier' , 'isShipC','isBlacklist'],
  watch: {
    custid: {
      handler(val) {
        this.$nextTick(() => {
          this.pageStatus = 'account'
        })
      },
    },
  },
  components: {
    BankAccount,
    BankInvoice,
  },
  computed: {
    isAccount() {
      return this.pageStatus === 'account'
    },
    currentComponent() {
      return this.isAccount ? BankAccount : BankInvoice
    },
  },
  data() {
    return {
      pageStatus: 'account',
      account: false,
      invalidShow: false,
      invoice: false,
      banklist: [],
    }
  },
  activated() {},
  created() {},
  methods: {
    showInvalid() {
      this.invalidShow = true
    },
  },
}
</script>
