<template>
  <div class="row-flex ml10">
    <div class="flex-item">
      <div class="item-label"><span class="lab">发货人</span></div>
      <el-input size="mini" placeholder="请输入" v-model="createItem.blContact.shipper"></el-input>
    </div>
    <div class="flex-item">
      <div class="item-label"><span class="lab">收货人</span></div>
      <el-input size="mini" placeholder="请输入" v-model="createItem.blContact.consignee"></el-input>
    </div>
    <div class="flex-item">
      <div class="item-label"><span class="lab">通知人1</span></div>
      <el-input type="textarea" rows="3" size="mini" placeholder="请输入" v-model="createItem.blContact.notify1"></el-input>
    </div>
  </div>
</template>

<script>

import {mapState} from 'vuex'
import {supplierInfo} from '@/api/crm/supplier'

export default {
  data() {
    return {
      oQuery: this.$route.query,
      tradeTermsCode: ['DDP', 'DDU'],
      supplierList: []
    }
  },
  props: {
    createItem: {
      type: Object,
      default: () => ({})
    },
    includeFeeder: {
      type: String,
      default: ''
    },
    orderStatus: {
      type: String,
      default: ''
    }
  },
  created() {
    // this.init()
  },
  mounted() {
    
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      ordDetRole: state => state.order.orderList.ordDetRole
    }),
    isIncludeFeeder() {
      return this.includeFeeder === 'y' ? true : false
    },
    disabledState() {
      if (this.isOp || this.isView) return true
      return false
    },
    isAc() {
			return this.ordDetRole === 'ac'
		},
    isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
    isView() {
      if (this.isBd && this.orderStatus !== 'draft') {
        return true
      }
      if (this.isOp && !['pass'].includes(this.orderStatus)) {
        return true
      }
      return false
      // return this.oQuery.action === 'view' || this.orderStatus !== 'draft'
    },
    show() {
      return this.tradeTermsCode.includes(this.createItem.transport.tradeTermsCode)
    }
  },
  watch: {
  },
  components: {
    
  },
  methods: {
    // init() {
    //   if (this.createItem.transport.overseaAgentSupplierId || this.createItem.transport.overseaAgentSupplierId) {
    //     this.getSupplierList(this.createItem.transport.overseaAgentSupplierId)
    //   }
    // }
  }
};
</script>

<style lang="scss">

</style>
