<template>
  <div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">提单号</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.blNo" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">船名</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.vessle" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">航次</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.voyage" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">船舶国籍</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.shippingState" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">跟单信用征号</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.creditNo" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">出票日期</span></div>
      <elDatePickerLimit size="mini"
        v-model="tradeItem.ticketDate"
        type="date"
        style="width: 100%"
        clearable
        placeholder="请选择"
        value-format="yyyy-MM-dd" />
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">开证行</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.issuingBank" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">创建人</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.createdName" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">创建时间</span></div>
      <elDatePickerLimit size="mini"
        v-model="tradeItem.createTime"
        type="date"
        style="width: 100%"
        clearable
        placeholder="请选择"
        value-format="yyyy-MM-dd" />
    </div>
    
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">修改人</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.updateName" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">修改时间</span></div>
      <elDatePickerLimit size="mini"
        v-model="tradeItem.updateTime"
        type="date"
        style="width: 100%"
        clearable
        placeholder="请选择"
        value-format="yyyy-MM-dd" />
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
const defaultItem = {
  blNo: '',
  vessle: '',
  voyage: '',
  shippingState: '',
  creditNo: '',
  ticketDate: '',
  issuingBank: '',
  createdName: '',
  createTime: '',
  updateName: '',
  updateTime: ''
}

export default {
  data() {
    return {
      tradeItem: Object.assign({}, defaultItem)
    }
  },
  props: {
    docData: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    console.log(this.docData)
  },
  mounted() {
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      orderNo: state => state.order.orderNo,
      custid: state => state.order.custid
    })
  },
  watch: {
    docData: {
      handler(newVal) {
        console.log(newVal)
        for (let i in this.tradeItem) {
          this.tradeItem[i] = newVal ? newVal[i] : ''
        }
      },
      deep: true,
      immediate: true
    }
  },
  components: {
    
  },
  methods: {
    
  }
};
</script>

<style lang="scss">

</style>
