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
      <div class="item-label"><span class="lab">出单日期</span></div>
      <elDatePickerLimit size="mini"
        v-model="tradeItem.issueTime"
        type="date"
        style="width: 100%"
        clearable
        placeholder="请选择"
        value-format="yyyy-MM-dd" />
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">声明时间</span></div>
      <elDatePickerLimit size="mini"
        v-model="tradeItem.declareTime"
        type="date"
        style="width: 100%"
        clearable
        placeholder="请选择"
        value-format="yyyy-MM-dd" />
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
  declareTime: '',
  issueTime: '',
  createdName: '',
  createTime: '',
  updateName: '',
  updateTime: ''
}

export default {
  data() {
    return {
      tradeItem: Object.assign({}, defaultItem, this.data.docData)
    }
  },
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
    })
  },
  watch: {
  },
  components: {
    
  },
  methods: {
    
  }
};
</script>

<style lang="scss">

</style>
