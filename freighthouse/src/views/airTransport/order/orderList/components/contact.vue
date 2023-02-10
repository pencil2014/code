<template>
  <div class="row-transport ml10">
    <el-row>
      <div class="flex-item-double oneThird">
        <div class="item-label"><span class="lab">Shipper(发货人)</span>
          <el-button type="text" size="mini" :disabled="disabledState" @click="openContactPerson('发货人','')">选择</el-button>
        </div>
        <el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="contactData.shipper" :disabled="disabledState"> </el-input>
      </div>
      <div class="flex-item-double oneThird">
        <div class="item-label"><span class="lab">Consignee(收货人)</span>
          <el-button type="text" size="mini" :disabled="disabledState" @click="openContactPerson('收货人','')">选择</el-button>
        </div>
        <el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="contactData.consignee" :disabled="disabledState"> </el-input>
      </div>
      <div class="flex-item-double air-notify-tabs oneThird alert-others">
        <el-button type="text" size="mini" class="alert-others-btn" :disabled="disabledState" @click="openContactPerson('通知人',activeName)">选择</el-button>
        <el-button size="mini" type="text" class="alert-others-btn-same" :disabled="disabledState" @click="handleClickNotify">SAME AS CONSIGNEE</el-button>
        <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
          <el-tab-pane label="Notify Party(通知人)" name="1">
            <div class="">
              <el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入Notify Party" v-model="contactData.notify1" :disabled="disabledState"> </el-input>
            </div>
          </el-tab-pane>
          <el-tab-pane label="Also Notify Party" name="2">
            <div class="">
              <el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入Also Notify Party" v-model="contactData.notify2" :disabled="disabledState"> </el-input>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-row>
    <div v-if="contactPersonShow">
      <ContactPerson :config="contactPersonConfig" @close="getContactPerson" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ContactPerson from '@/views/order/order/orderList/components/contactPerson.vue'
export default {
  data() {
    return {
      oQuery: this.$route.query,
      tradeTermsCode: ['DDP', 'DDU'],
      activeName: '1',
      contactPersonConfig: {
        type: '收货人', // 类型，收货人，发货人，通知人
        num: '' // 通知人1，2，3
      },
      contactPersonShow: false
    }
  },
  props: {
    contactData: {
      type: Object,
      default: () => ({
        shipper: '',
        consignee: '',
        notify1: '',
        notify2: '',
        notify3: ''
      })
    },
    orderStatus: {
      type: String,
      default: ''
    },
    isPricing: {
      type: Boolean,
      default: false
    },
    isBd: {
      type: Boolean,
      default: false
    },
    isOp: {
      type: Boolean,
      default: false
    }
  },
  model: {
    prop: 'contactData',
    event: 'update'
  },
  created() {},
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole,
      roles: (state) => state.user.roles,
      airOrderInfo: (state) => state.airTransport.airOrderInfo,
      userId: (state) => state.user.userId
    }),
    
    disabledState() {
      if (this.airOrderInfo.orderStatus === 'pre_submit') {
        if (this.airOrderInfo.bdManageEmployeeId !== this.userId) {
          return true
        } else {
          return false
        }
      } else {
        // 业务可以填写部分的权限
        if (this.isBd) {
          if (!['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)) {
            return true
          } else {
            return false
          }
        } else if (this.isPricing) {
          if (!['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)) {
            return true
          } else {
            return false
          }
        } else {
          return true
        }
      }
    },
    isView() {
      if (this.airOrderInfo.orderStatus === 'pre_submit') {
        if (this.airOrderInfo.bdManageEmployeeId !== this.userId) {
          return true
        } else {
          return false
        }
      } else {
        if (
          this.isBd &&
          !['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)
        ) {
          return true
        }
        if (this.isOp && !['pass'].includes(this.orderStatus)) {
          return true
        }
        return false
      }
    },
    show() {
      return (
        this.createItem.transport.tradeTermsCode &&
        this.tradeTermsCode.includes(
          this.createItem.transport.tradeTermsCode.toUpperCase()
        )
      )
    }
  },
  watch: {},
  components: { ContactPerson },
  methods: {
    handleClickNotify() {
      if (this.activeName === '1') {
        this.$set(this.contactData, 'notify1', 'SAME AS CONSIGNEE')
      }
      if (this.activeName === '2') {
        this.$set(this.contactData, 'notify2', 'SAME AS CONSIGNEE')
      }
      if (this.activeName === '3') {
        this.$set(this.contactData, 'notify3', 'SAME AS CONSIGNEE')
      }
    },
    getContactPerson(action, value, type, num) {
      this.contactPersonShow = false
      if (action === 'Confirm') {
        let str = `${value.companyName ? value.companyName + '\n' : ''}${
          value.contactAddress ? value.contactAddress + '\n' : ''
        }${value.contactName ? value.contactName + '\n' : ''}${
          value.contactPhone ? 'TEL:' + value.contactPhone + '\n' : ''
        }${value.contactFax ? 'FAX:' + value.contactFax + '\n' : ''}${
          value.taxCode ? 'TAX:' + value.taxCode + '\n' : ''
        }${value.remark}`
        if (type === '收货人') {
          this.$set(this.contactData, 'consignee', str)
        } else if (type === '发货人') {
          this.$set(this.contactData, 'shipper', str)
        } else {
          if (num == 1) {
            this.$set(this.contactData, 'notify1', str)
          } else if (num == 2) {
            this.$set(this.contactData, 'notify2', str)
          } else {
            this.$set(this.contactData, 'notify3', str)
          }
        }
      }
    },
    openContactPerson(type, num) {
      // 打开收发通弹窗
      this.contactPersonConfig.type = type
      this.contactPersonConfig.num = num
      this.contactPersonShow = true
    },
    // 选择海外代理人
    handleSelectSupplierName(val) {},
    handleClick(tab, event) {
      console.log(tab, event)
    }
  }
}
</script>

<style lang="scss">
.edit-container .component-main-cont .notify-tabs .el-tabs__nav-scroll {
  padding-left: 0px;
}
.notify-tabs .el-tabs__header {
  height: 20px;
  line-height: 20px;
  margin-bottom: 0;
}
.edit-container .order-cont .ship-cont .notify-tabs .el-tabs__item {
  height: 20px;
  line-height: 20px;
  font-size: 12px;
  color: #4a4a4a;
  padding: 0 4px;
}
.edit-container .order-cont .ship-cont .notify-tabs .el-tabs__item.is-active {
  color: #222;
  border: 1px solid #ddd;
  border-bottom: 1px solid #fff;
  position: relative;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.edit-container
  .order-cont
  .ship-cont
  .notify-tabs
  .el-tabs__item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #fff;
  z-index: 2;
  bottom: -2px;
}
.notify-tabs .el-tabs--card > .el-tabs__header {
  border-bottom: 0;
}
.notify-tabs .el-tabs--card > .el-tabs__header .el-tabs__nav {
  border: 0;
}
.notify-tabs .el-tabs--card > .el-tabs__header .el-tabs__item {
  border-bottom: 0;
  border-left: 0;
}
.row-transport {
  margin-top: 10px;
  overflow: hidden;
}
.row-transport .oneEighth {
  width: 12.5%;
  padding: 0 5px 0 0;
  margin-bottom: 4px;
  float: left;
}
.row-transport .oneEight .el-form-item__label {
  padding-right: 5px;
  height: 20px;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.row-transport .oneEight .el-form-item__content {
  line-height: 20px;
}
.row-transport .item-label {
  font-size: 12px;
  line-height: 20px;
  height: 20px;
  margin-bottom: 0;
  display: flex;
}
.row-transport .item-label span {
  display: block;
}
.row-transport .item-label .lab {
  display: flex;
}
.row-transport .item-label .lab em {
  font-style: normal;
}
.row-transport .flex-item-double {
  width: 25%;
  padding: 0 5px 0 0;
  margin-bottom: 4px;
  float: left;
}
.row-transport .flex-item-double.oneThird {
  width: 33.33%;
}
.alert-others {
  position: relative;
  .alert-others-btn {
    position: absolute;
    top: 0;
    left: 175px;
    z-index: 500;
  }
  .alert-others-btn-same {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 500;
  }
}
.edit-container .component-main-cont .air-notify-tabs .el-tabs__nav-scroll {
  padding-left: 0;
}
.air-notify-tabs .el-tabs__header {
  height: 20px;
  line-height: 20px;
  margin-bottom: 0;
}
.edit-container .order-cont .ship-cont .air-notify-tabs .el-tabs__item {
  height: 20px;
  line-height: 20px;
  font-size: 12px;
  color: #4a4a4a;
  // padding: 0 3px;
  padding: 0;
  margin-right: 5px;
  letter-spacing: -1.2px;
}
.edit-container
  .order-cont
  .ship-cont
  .air-notify-tabs
  .el-tabs__item.is-active {
  color: #1890ff;
  border: 0;
  // border: 1px solid #ddd;
  // border-bottom: 1px solid #1890ff;
  position: relative;
  // border-top-left-radius: 4px;
  // border-top-right-radius: 4px;
}
.edit-container
  .order-cont
  .ship-cont
  .air-notify-tabs
  .el-tabs__item.is-active::before {
  position: absolute;
  content: '';
  display: block;
  bottom: 0;
  z-index: 2;
  left: 50%;
  width: 24px;
  margin-left: -12px;
  height: 1px;
  background-color: #1890ff;
}
.air-notify-tabs .el-tabs--card > .el-tabs__header {
  border-bottom: 0;
}
.air-notify-tabs .el-tabs--card > .el-tabs__header .el-tabs__nav {
  border: 0;
  padding-left: 5px;
}
.air-notify-tabs .el-tabs--card > .el-tabs__header .el-tabs__item {
  border-bottom: 0;
  border-left: 0;
}
</style>
