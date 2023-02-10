<template>
  <div class="add-customer-wrap finance-page">
    <div class="add-customer-container">
      <Step :setComplete="completing"></Step>
      <div class="fixed-bottom-add">
      <el-button
        :loading="submitLoading"
        icon="el-icon-check"
        v-show="completing === 2 && isSelf"
        size="mini"
        @click="save('submit')"
        type="success"
      >提交</el-button>
      <el-button
        :loading="saveLoading"
        icon="el-icon-copy-document"
        v-show="completing > 0 && completing < 3 && isSelf"
        size="mini"
        @click="save('save')"
        type="primary"
      >保存草稿</el-button>
      <el-button
        :loading="prevStepLoading"
        v-show="completing === 2 && isSelf"
        size="mini"
        @click="save('prevStep')"
        plain
      >上一步</el-button>
      <el-button
        :loading="nextStepLoading"
        v-show="completing === 1 && isSelf"
        size="mini"
        @click="save('nextStep')"
      >下一步</el-button>
      <el-button @click="goBack" size="mini" v-html="`${completing < 3 ? '取消' : '返回列表'}`"></el-button>
    </div>
      <!-- <keep-alive> -->
      <component
        :customerMode.sync="customerMode"
        :is="currentComponent"
        :ref="stepStr[completing]"
        :isSelf="isSelf"
        @nextStep="nextStep"
        @saveOk="saveOk"
      />
      <!-- </keep-alive> -->
    </div>

  </div>
</template>
<script>
import SearchInfo from './pages/searchInfo.vue'
import BaseInfo from './pages/baseInfo.vue'
import LinkInfo from './pages/linkInfo.vue'
import Success from './pages/success.vue'
import Step from './components/step'
import { mapState } from 'vuex'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import CUSTOMER from '@/api/crm/customer'
import SUPPLIER from '@/api/crm/supplier'

export default {
  name: 'addCustomer',
  mixins: [mixin, routerMixin],
  components: { Step, BaseInfo, SearchInfo, LinkInfo, Success },
  provide() {
    // console.log(this.isCustomer, this.statePath)
    return { isCustomer: this.isCustomer, statePath: this.statePath }
  },
  data() {
    let isCustomer = this.$route.name !== 'AddSupplier'
    console.log(isCustomer)
    return {
      completing: 0,
      stepStr: ['searchInfo', 'baseInfo', 'linkInfo', 'success'],
      isCustomer,
      customerMode: '',
      statePath: isCustomer ? '' : 'supplier/',
      submitLoading: false,
      saveLoading: false,
      prevStepLoading: false,
      nextStepLoading: false,
      isSelf: true,
      userId: this.$store.state.user.userId,
    }
  },
  // watch: {
  //   completing(val, old) {
  //     if (val == 2 && old == 1) {
  //       let model = this.isCustomer ? CUSTOMER : SUPPLIER
  //       let data = this.isCustomer ? { custid: this.custid } : { supplierId: this.custid }
  //       model.basicInfo(data).then((res) => {
  //         if (res.data.customerDto) {
  //           this.customerMode = res.data.customerDto.custMode
  //         }
  //         console.log('set baseifno')
  //         this.$store.commit(`crm/${this.statePath}setBaseInfo`, res.data)
  //       })
  //     }
  //   },
  // },
  computed: {
    ...mapState('crm', { customerId: (state) => state.custid }),
    ...mapState('crm/supplier', { supplierId: (state) => state.custid }),
    currentComponent() {
      let val = this.completing
      return val === 1 ? BaseInfo : val === 2 ? LinkInfo : val === 3 ? Success : SearchInfo
    },
    custid() {
      return this.isCustomer ? this.customerId : this.supplierId
    },
  },
  created() {
    // this.init()
  },
  activated() {
    this.init()
    // if (!this.$route.meta.isUseCache) {
    //   console.log('················')
    //   this.init()
    // }
  },
  methods: {
    init() {
      this.isSelf = true
      this.completing = 0
      // console.log(this.custid)
      this.$store.commit(`crm/${this.statePath}setBaseInfo`, {})
      // console.log(this.$store.state.crm)
      if (this.$route.query.status) {
        return (this.completing = 3)
      }
      let model = this.isCustomer ? CUSTOMER : SUPPLIER
      let data = this.isCustomer ? { custid: this.custid } : { supplierId: this.custid }
      // console.log(this.customerId, this.supplierId)
      this.custid &&
        model.basicInfo(data).then((res) => {
          if (res.data.customerDto) {
            this.customerMode = res.data.customerDto.custMode
          }
          console.log(this.userId)
          if (res.data.customerDto) {
            // this.isSelf = this.userId === res.data.customerDto.createdBy
          } else if (res.data.supplierDto) {
            this.isSelf = this.userId === res.data.supplierDto.createdBy
          }
          this.$store.commit(`crm/${this.statePath}setBaseInfo`, res.data)
          // this.completing = (res.data.contact && res.data.contact.length) || (res.data.bds && res.data.bds.length) ? 2 : 1
          this.completing = 1
        })
    },
    saveOk(val) {
      let model = this.isCustomer ? CUSTOMER : SUPPLIER
      let data = this.isCustomer ? { custid: this.custid } : { supplierId: this.custid }
      model.basicInfo(data).then((res) => {
        console.log('SAVEOK')
        if (res.data.customerDto) {
          this.customerMode = res.data.customerDto.custMode
        }
        this.$store.commit(`crm/${this.statePath}setBaseInfo`, {})
        this.$nextTick(() => {
          this.$store.commit(`crm/${this.statePath}setBaseInfo`, res.data)
          this.completing = val
        })
      })
    },
    goBack() {
      this.routerDelBack(true)
    },
    // 保存
    save(nextStep) {
      // 重复点击间隔加载1.8s
      this[nextStep + 'Loading'] = true
      setTimeout(() => {
        this[nextStep + 'Loading'] = false
      }, 1000)
      // 分发子组件执行
      this.$refs[this.stepStr[this.completing]].saveFormDatas(nextStep)
      this.refreshView('CustomerList', 'from')
      this.refreshView('SupplierList', 'from')
      this.refreshView('SupplierReviewList', 'from')
      this.refreshView('CustomerReviewList', 'from')
    },
    // 下一步
    nextStep(completing) {
      if (completing === false) {
        return this.routerDelBack(true)
      }
      this.completing = completing
      this.refreshView('CustomerList', 'from')
      this.refreshView('SupplierList', 'from')
      this.refreshView('SupplierReviewList', 'from')
      this.refreshView('CustomerReviewList', 'from')
    },
  },
}
</script>
<style lang="scss" scoped>
.add-customer-wrap {
  // border: 16px solid #f5f7f9;
  box-sizing: border-box;
  background: #fff;
  border-bottom: 30px solid #f8f9fd;
  .add-customer-container {
    padding-bottom: 30px;
    .search {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 25px 0;
      color: #222;
      font-size: 14px;
      .search-cont {
        display: flex;
        align-items: center;
      }
      .search-box {
        width: 460px;
        margin: 0 10px;
        .search-select {
          width: 460px;
        }
      }
      .tip {
        color: #bfbfbf;
      }
    }
    .base-info-box {
      padding: 0 24px;
    }
    .new-customer-box {
      position: relative;
      height: 100%;
      min-height: 300px;
      // margin: 76px 25px 25px;
      margin: 76px 0px 25px;
      border-radius: 4px;
      border: 1px solid #e9e9e9;
      .base-info-form {
        padding: 25px 0 0 24px;
        .form-item-entType {
          display: flex;
          position: absolute;
          left: 0px;
          top: -42px;
          .el-checkbox-group {
            width: 800px;
          }
        }
        .el-form-item__content {
          .el-checkbox {
            margin-right: 30px;
          }
          .el-checkbox__label {
            padding-left: 4px;
            font-size: 12px;
          }
        }
      }
      .content {
        padding: 0 25px 25px;
        .el-divider {
          background-color: #e9e9e9;
        }
      }
      .base-info-list {
        display: flex;
        margin-top: 16px;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        li {
          width: 400px;
          height: 20px;
          margin-bottom: 10px;
          font-size: 14px;
          font-weight: 400;
          color: #4a4a4a;
          line-height: 20px;
          .color-red {
            color: #e63923;
          }
        }
      }
      .status-box {
        margin-top: 32px;
        img {
          display: inline-block;
          vertical-align: middle;
          width: 14px;
          height: 14px;
          margin-right: 3px;
        }
        .status-tips {
          display: inline-block;
          vertical-align: middle;
          width: 374px;
          height: 20px;
          font-size: 14px;
          font-weight: 600;
          color: #e63923;
          line-height: 20px;
        }
      }
    }
  }
  .fixed-bottom-add {
    display: flex;
    justify-content: flex-end;
    padding: 8px 10px;
    position: relative;
  }
}
</style>
