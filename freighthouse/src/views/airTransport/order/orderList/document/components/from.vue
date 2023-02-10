<template>
  <div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">证书编号</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.certificateNo" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">项目编号</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.projectNo" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">出口商名称</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.exporterName" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">出口商地址</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.exporterAddress" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">出口商国家</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.exporterCountry" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">生产商名称</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.manufacturerName" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">生产商地址</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.manufacturerAddress" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">生产商国家</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.manufacturerCountry" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">收货人名称</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.receiverName" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">收货人地址</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.receiverAddress" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">收货人国家</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.receiverCountry" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">进口商名称</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.importerName" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">进口商地址</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.importerAddress" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">进口商国家</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.importerCountry" clearable></el-input>
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
      <div class="item-label"><span class="lab">船名</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.vessel" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">航次</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.voyage" clearable></el-input>
    </div>
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
    </div>
    <div class="flex-item col-2">
      <div class="item-label"><span class="lab">房地产标准</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.realEstate" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">商品生产地签发地</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.goodsIssuePlace" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">商品生产地签发日</span></div>
      <elDatePickerLimit size="mini"
        v-model="tradeItem.goodsIssueDate"
        type="date"
        style="width: 100%"
        clearable
        placeholder="请选择"
        value-format="yyyy-MM-dd" />
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">认证机构地址</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.certAuthorityAddress" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">认证机构电话</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.certAuthorityPhone" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">认证机构传真</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.certAuthorityFax" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">认证地点</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.certAddress" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">认证日期</span></div>
      <elDatePickerLimit size="mini"
        v-model="tradeItem.certDate"
        type="date"
        style="width: 100%"
        clearable
        placeholder="请选择"
        value-format="yyyy-MM-dd" />
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">关税项目编号</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.tariffItemNo" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">运输方式</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.transportTerm" clearable></el-input>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
const defaultItem = {
  certificateNo: '',
  projectNo: '',
  exporterName: '',
  exporterAddress: '',
  exporterCountry: '',
  manufacturerName: '',
  manufacturerAddress: '',
  manufacturerCountry: '',
  receiverName: '',
  receiverAddress: '',
  receiverCountry: '',
  importerName: '',
  importerAddress: '',
  importerCountry: '',
  departureTime: '',
  vessel: '',
  voyage: '',
  polCode: '',
  polName: '',
  podCode: '',
  podName: '',
  realEstate: '',
  goodsIssuePlace: '',
  goodsIssueDate: '',
  certAuthorityAddress: '',
  certAuthorityPhone: '',
  certAuthorityFax: '',
  certAddress: '',
  certDate: '',
  tariffItemNo: '',
  transportTerm: ''
}

export default {
  data() {
    return {
      tradeItem: Object.assign({}, defaultItem),
      portList: []
    }
  },
  props: {
    docData: {
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
    docData: {
      handler(newVal) {
        console.log(newVal)
        for (let i in this.tradeItem) {
          this.tradeItem[i] = newVal ? newVal[i] : ''
        }

        let {polCode, podCode} = this.tradeItem
        let portCodeArr = [];
        polCode ? portCodeArr.push(polCode) : ""
        podCode ? portCodeArr.push(podCode) : ""
        let portCodes = portCodeArr.toString()
        console.log(portCodes)
        this.$store.dispatch('dict/basePortListByCodes', {portCodes}).then(data => {
          let initPortData = []
          //初始化下拉框数据 
          let results = new Map()
          initPortData = data
          data.map(item => {
            let obj = {}
            obj.label = item.label
            obj.portAttribute = item.portAttribute
            results.set(item.value, obj)
          })
          this.portList = initPortData
        })
      },
      deep: true,
      immediate: true
    }
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
