<template>
  <div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">保险保单</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.guaranteeShip" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">保险金额</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.amount" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">保险金额英文</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.amountEn" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">费率</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.fate" clearable></el-input>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">保费</span></div>
      <el-input size="mini" placeholder="请输入" v-model="tradeItem.premium" clearable></el-input>
    </div>
    <div class="flex-item col-3">
      <div class="item-label"><span class="lab">唛头</span></div>
      <el-input type="textarea" size="mini" placeholder="请输入" v-model="tradeItem.mark" clearable></el-input>
    </div>
    <div class="flex-item col-3">
      <div class="item-label"><span class="lab">件数包装</span></div>
      <el-input type="textarea" size="mini" placeholder="请输入" v-model="tradeItem.quanity" clearable></el-input>
    </div>
    <div class="flex-item col-3">
      <div class="item-label"><span class="lab">保险货物项目-英文品名</span></div>
      <el-input type="textarea" size="mini" placeholder="请输入" v-model="tradeItem.ename" clearable></el-input>
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
      <div class="item-label"><span class="lab">船次</span></div>
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
      <div class="item-label"><span class="lab">目的港</span></div>
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
    <div class="flex-item col-6 multi-select-tag">
      <div class="item-label"><span class="lab">中转港</span></div>
      <el-select size="mini"
        v-model="tradeItem.transitPortCode"
        filterable
        remote
        multiple
        clearable
        :collapse-tags="true"
        style="width: 100%"
        placeholder="请输入"
        :remote-method="transitPortFilterMehod"
        @visible-change="transitPortVisibleChange"
        @change="handleChangeTransitPortCode">
        <el-option
          v-for="item in portList"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </div>
    <div class="flex-item col-6">
      <div class="item-label"><span class="lab">卸货港</span></div>
      <el-select size="mini"
        v-model="tradeItem.unloadingPortCode"
        filterable
        remote
        clearable
        style="width: 100%"
        placeholder="请输入"
        :remote-method="unloadingPortFilterMehod"
        @visible-change="unloadingPortVisibleChange"
        @change="handleChangeUnloadingPortCode">
        <el-option
          v-for="item in portList"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
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
  guaranteeShip: '',
  amount: '',
  amountEn: '',
  fate: '',
  premium: '',
  mark: '',
  quanity: '',
  ename: '',
  departureTime: '',
  vessel: '',
  voyage: '',
  polCode: '',
  polName: '',
  podCode: '',
  podName: '',
  transitPortCode: [],
  transitPortName: '',
  unloadingPortCode: '',
  unloadingPortName: '',
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
        
        let {polCode, podCode, transitPortCode, unloadingPortCode} = this.tradeItem
        let portCodeArr = [];
        let tempTransitPortCode = transitPortCode
        polCode ? portCodeArr.push(polCode) : ""
        podCode ? portCodeArr.push(podCode) : ""
        unloadingPortCode ? portCodeArr.push(unloadingPortCode) : ""
        tempTransitPortCode ? portCodeArr.push(tempTransitPortCode) : ""
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
      if (val) {
        let tempItem = this.portList.filter(item => item.value === val)
        this.tradeItem.polName = tempItem[0].label
      }
    },
    // 目的港
    podPortVisibleChange(val) {
      if (val) this.transitPortSearch('', 'port_of_destination')
    },
    podPortFilterMehod(val) {
      this.transitPortSearch(val, 'port_of_destination')
    },
    handleChangePodPortCode(val) {
      if (val) {
        let tempItem = this.portList.filter(item => item.value === val)
        this.tradeItem.podName = tempItem[0].label
      }
    },
    // 卸货港
    unloadingPortVisibleChange(val) {
      if (val) this.transitPortSearch('', 'port_of_discharge')
    },
    unloadingPortFilterMehod(val) {
      this.transitPortSearch(val, 'port_of_discharge')
    },
    handleChangeUnloadingPortCode(val) {
      if (val) {
        let tempItem = this.portList.filter(item => item.value === val)
        this.tradeItem.unloadingPortName = tempItem[0].label
      }
    },
    // 中转港
    transitPortVisibleChange(val) {
      if (val) this.transitPortSearch('', 'port_of_basic')
    },
    transitPortFilterMehod(val) {
      this.transitPortSearch(val, 'port_of_basic')
    },
    handleChangeTransitPortCode(val) {
      // let tempItem = this.portList.filter(item => item.value === val)
      // this.tradeItem.podName = tempItem[0].label
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
