<template>
  <div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">起运港</span></div>
      <el-select size="mini"
        v-model="tradeItem.polCode"
        filterable
        remote
        clearable
        style="width: 100%"
        placeholder="请输入"
        :remote-method="polPortFilterMehod"
        @visible-change="polPortVisibleChange"
        @change="handleChangePolPortCode">
        <el-option
          v-for="item in portList"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <!-- <el-autocomplete size="mini"
        v-model="tradeItem.polName"
        style="width: 100%"
        :fetch-suggestions="(queryString, cb) => {polQuerySearch(queryString, 'port_of_basic', cb)}"
        placeholder="请输入"
        @change="(value) => {handleChangePolCode(value)}"
        @select="(value) => {handleSelectPolCode(value)}"
        ></el-autocomplete> -->
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">目的地</span></div>
      <el-select size="mini"
        v-model="tradeItem.podCode"
        filterable
        remote
        clearable
        style="width: 100%"
        placeholder="请输入"
        :remote-method="podPortFilterMehod"
        @visible-change="podPortVisibleChange"
        @change="handleChangePodPortCode">
        <el-option
          v-for="item in portList"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <!-- <el-autocomplete size="mini"
        v-model="tradeItem.podName"
        style="width: 100%"
        :fetch-suggestions="(queryString, cb) => {polQuerySearch(queryString, 'port_of_destination', cb)}"
        placeholder="请输入"
        @change="(value) => {handleChangePodCode(value)}"
        @select="(value) => {handleSelectPodCode(value)}"
        ></el-autocomplete> -->
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">英文品名</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.productNameEn" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">合同号</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.contractNo" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">离港日期</span></div>
      <elDatePickerLimit size="mini"
        v-model="tradeItem.departureTime"
        type="date"
        style="width: 100%"
        clearable
        placeholder="请选择"
        value-format="yyyy-MM-dd" />
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">投保人</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.insureName" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">投保单号</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.insureNo" clearable></el-input>
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
  polCode: '',
  polName: '',
  podCode: '',
  podName: '',
  productNameEn: '',
  contractNo: '',
  departureTime: '',
  insureName: '',
  insureNo: '',
  createdName: '',
  createTime: '',
  updateName: '',
  updateTime: ''
}

export default {
  data() {
    return {
      tradeItem: Object.assign({}, defaultItem, this.data.docData),
      portList: []
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
      orderNo: state => state.order.orderNo,
      custid: state => state.order.custid
    })
  },
  watch: {
  },
  components: {
    
  },
  methods: {
    // 大船起运港
    polPortVisibleChange(val) {
      if (val) this.transitPortSearch('', 'port_of_basic')
    },
    polPortFilterMehod(val) {
      this.transitPortSearch(val, 'port_of_basic')
    },
    handleChangePolPortCode(val) {
      let tempItem = this.portList.filter(item => item.value === val)
      this.tradeItem.polName = tempItem[0].label
    },
    // 目的地
    podPortVisibleChange(val) {
      if (val) this.transitPortSearch('', 'port_of_destination')
    },
    podPortFilterMehod(val) {
      this.transitPortSearch(val, 'port_of_destination')
    },
    handleChangePodPortCode(val) {
      let tempItem = this.portList.filter(item => item.value === val)
      this.tradeItem.podName = tempItem[0].label
    },
    // 港口下拉数据
    transitPortSearch(queryString, portAttribute) {
      this.$store.dispatch('dict/basePortList', {queryString, portAttribute, state: 'valid'}).then(data => {
        let result = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
        this.portList = result
      })
    },
  }
};
</script>

<style lang="scss">

</style>
