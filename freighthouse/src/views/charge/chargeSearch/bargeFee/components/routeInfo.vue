<template>
  <el-row>
    <el-col :span="48">
      <el-form-item class="oneEighth multi-select-tag" label="驳船收货地" prop="feederPolCode" :show-message="false">
        <el-select size="mini" filterable remote clearable disabled
          v-model="createItem.feederPolCode" style="width: 100%" placeholder="请输入"
          @visible-change="(val) => {feederPolPortVisibleChange(val)}"
          :filter-method="(val) => {feederPolPortFilterMethod(val)}"
          @change="(val) => {handleChangeFeederPolPort(val)}">
          <el-option v-for="item in portList"
            :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :span="48">
      <el-form-item class="oneEighth" required label="大船起运港" prop="polCode" :show-message="false">
        <el-select size="mini"
          v-model="createItem.polCode"
          filterable
          remote
          clearable 
          disabled
          style="width: 100%"
          placeholder="请输入"
          :remote-method="polPortFilterMethod"
          @visible-change="polPortVisibleChange"
          @change="handleChangePolPort">
          <el-option
            v-for="item in portList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :span="48">
      <el-form-item class="oneEighth" required label="收货区域" prop="receiptArea" :show-message="false">
        <el-input clearable disabled size="mini" placeholder="请输入" v-model="createItem.receiptArea"></el-input>
      </el-form-item>
    </el-col>
    <el-col :span="48">
      <el-form-item class="oneEighth" required label="目的地" prop="podCode" :show-message="false">
        <el-select size="mini"
          v-model="createItem.podCode"
          filterable
          remote
          clearable 
          disabled
          style="width: 100%"
          placeholder="请输入"
          :remote-method="podPortFilterMethod"
          @visible-change="podPortVisibleChange"
          @change="handleChangePodPort">
          <el-option
            v-for="item in portList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :span="48">
      <el-form-item class="oneEighth" required label="船公司" prop="shipCarrierCode" :show-message="false">
        <el-select size="mini"
          v-model="createItem.shipCarrierCode"
          filterable
          remote
          clearable 
          disabled
          style="width: 100%"
          placeholder="请输入"
          :remote-method="shipCarrierCodeFilterMethod"
          @visible-change="shipCarrierCodeVisibleChange"
          @change="handleChangeShipCarrierCode">
          <el-option
            v-for="item in shipCarrierOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :span="48">
      <el-form-item class="oneEighth" label="系统航线" prop="sysLineCode" :show-message="false">
        <el-select size="mini"
          v-model="createItem.sysLineCode"
          filterable
          remote
          clearable 
          style="width: 100%"
          placeholder="请输入"
          disabled
          :remote-method="sysLineCodeFilterMethod"
          @visible-change="sysLineCodeVisibleChange"
          @change="handleChangeSysLineCode">
          <el-option
            v-for="item in sysLineCodeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :span="48">
      <el-form-item class="oneEighth" label="驳船预计开船时间" prop="feederSchedule" :show-message="false">
        <el-input clearable disabled size="mini" placeholder="请输入船期格式为:星期,星期 如1,5" v-model="createItem.feederSchedule"></el-input>
      </el-form-item>
    </el-col>
    <el-col :span="48">
      <el-form-item class="oneEighth" required label="生效日期" prop="beginDate" :show-message="false">
        <el-date-picker
          style="width: 100%"
          size="mini"
          disabled
          v-model="createItem.beginDate"
          type="daterange"
          placeholder="选择日期时间"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          clearable
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          ></el-date-picker>
      </el-form-item>
    </el-col>
    <el-col :span="48">
      <el-form-item class="oneEighth" label="驳船中转方式" prop="transferMode" :show-message="false">
        <el-select v-model="createItem.transferMode" size="mini" clearable disabled placeholder="请选择" style="width: 100%">
          <el-option v-for="(item, index) in dictMap.transferMode" :label="item.label" :value="item.value" :key="index">
          </el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :span="24">
      <el-form-item class="oneEighth" label="备注说明" prop="remark" :show-message="false">
        <el-input disabled clearable size="mini" placeholder="请输入" v-model="createItem.remark"></el-input>
      </el-form-item>
    </el-col>
  </el-row>
</template>

<script>

import {mapState} from 'vuex'
import {portSystemLineInfo, baseSystemLineInfo} from '@/api/base'
import { mainRouteFreeTime } from '@/api/charge';

export default {
  data() {
    return {
      state: 'valid',
      oQuery: this.$route.query,
      portList: [],
      sysLineCodeOptions: [],
      maintainerOptions: [],
      portDestinationAttribute:'',
      shipCarrierOptions: [],
      sysLineDisabled: false,
    }
  },
  props: {
    createItem: {
      type: Object,
      default: () => ({})
    },
    fillPolData: {
      type: Object,
      default: () => ({})
    },
    fillPortCodes: {
      type: String,
      default: ''
    },
  },
  created() {
    this.init(this.createItem)
    this.fillPolPort(this.fillPortCodes)
  },
  mounted() {
    
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
    }),
    isCopy() {
      return this.$route.query.action === 'copy'
    },
    isAdd() {
      // 复制或新建
      let {id, action} = this.$route.query
      return (action === 'copy' && id) || !id
    },
  },
  watch: {
    fillPortCodes: {
      handler(newVal) {
        this.fillPolPort(newVal)
      },
      deep: true
    },
    createItem: {
      handler(newVal) {
        this.init(newVal)
      },
      deep: true
    }
  },
  components: {
    
  },
  methods: {
    init(data) {
      this.maintainerOptions = [{label: data.maintainerName, value: data.maintainerId}]
      this.sysLineCodeOptions = [{label: data.sysLineCname, value: data.sysLineCode}]
      if(data.podCode){
        this.changeSysLineDisabeld(true)
      }
    },
    fillPolPort(portCodes) {
      if (portCodes) {
        this.$store.dispatch('dict/basePortListByCodes', {portCodes}).then(data => {
          let initPortData = []
          //初始化下拉框数据 
          let results = new Map()
          initPortData = data
          data.map(item=>{
            let obj={}
            obj.label=item.label
            obj.portAttribute=item.portAttribute
            results.set(item.value,obj)
          })
          this.portList = initPortData
          this.portDestinationAttribute = results.get(this.createItem.podCode) ? results.get(this.createItem.podCode)['portAttribute'] : ""
        })
      }
    },
    // 驳船收货地
    feederPolPortVisibleChange(val) {
      val && this.transitPortSearch('', 'port_of_feeder', 'valid','feederPolCode')
    },
    feederPolPortFilterMethod(val) {
      this.transitPortSearch(val, 'port_of_feeder', 'valid','feederPolCode')
    },
    handleChangeFeederPolPort(val) {
     
    },
    // 起运港
    polPortVisibleChange(val) {
      val && this.transitPortSearch('', 'port_of_basic', 'valid','polCode')
    },
    polPortFilterMethod(val) {
      this.transitPortSearch(val, 'port_of_basic', 'valid','polCode')
    },
    handleChangePolPort(val) {
    },
    // 目的地
    podPortVisibleChange(val) {
      val && this.transitPortSearch('', 'port_of_destination', 'valid','podCode')
    },
    podPortFilterMethod(val) {
      this.transitPortSearch(val, 'port_of_destination', 'valid','podCode')
    },
    handleChangePodPort(val) {
      if(!val){
        this.changeSysLineDisabeld(false)
      }else{
        this.initSystemLine(val);
        this.changeSysLineDisabeld(true)
      }
    },
    changeSysLineDisabeld(value){
      this.sysLineDisabled = value
    },
    // 船司
    shipCarrierCodeVisibleChange(val) {
      val && this.shipQuerySearch('')
    },
    shipCarrierCodeFilterMethod(val) {
      this.shipQuerySearch(val)
    },
    handleChangeShipCarrierCode(val) {
      
    },
    // 航线
    sysLineCodeVisibleChange(val) {
      val && this.sysLineQuerySearch('')
    },
    sysLineCodeFilterMethod(val) {
      this.sysLineQuerySearch(val)
    },
    handleChangeSysLineCode(val) {
      let findItem = this.sysLineCodeOptions.find(ele => ele.value === val)
      this.createItem.sysLineCname = findItem ? findItem.label : ''
    },
    // 维护人
    maintainerVisibleChange(val) {
      val && this.maintainerQuerySearch('')
    },
    maintainerFilterMethod(val) {
      this.maintainerQuerySearch(val)
    },
    handleChangeMaintainer(val) {
      let findItem = this.maintainerOptions.find(ele => ele.value === val)
      this.createItem.maintainerName = findItem ? findItem.label : ''
    },
    // 中转港下拉数据
    transitPortSearch(queryString, portAttribute, state, type) {
      // 驳船收货地
      if(type==='feederPolCode' && !queryString){
        queryString = this.createItem.feederPolCityCode
      }
      this.$store.dispatch('dict/basePortList', {queryString, portAttribute, state}).then(data => {
        this.portList = data.map(item => {
          return Object.assign(item, {
            label: item.value,
            value: item.key
          })
        })
      })
    },
    initSystemLine(key){
      portSystemLineInfo(key).then(response => {
        let systemLineList = response.data
        if(systemLineList.length > 0) {
          let systemLine = systemLineList[0]
          this.createItem.sysLineCode = systemLine.sysLineCode
          this.createItem.sysLineCname = systemLine.cname
        }
      })
    },
    // 船公司下拉列表自动补充的数据
    shipQuerySearch(queryString) {
      this.$store.dispatch('dict/baseShippingCarrierList', {name: queryString, state: 'valid'}).then(data => {
        this.shipCarrierOptions = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
      })
    },
    // 航线下拉列表自动补充的数据
    sysLineQuerySearch(queryString) {
      this.$store.dispatch('dict/baseSystemLineList', {name: queryString, state: 'valid'}).then(data => {
        this.sysLineCodeOptions = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
      })
    },
    // 维护人
    maintainerQuerySearch(queryString) {
      let params={};
      Object.assign(params, {
        name: queryString,
        state:'valid'
      })
      this.$store.dispatch('dict/employeeSelectlist', params).then(data => {
        this.maintainerOptions = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
      })
    },
  }
};
</script>

<style lang="scss">
.el-col-48{
  width: 20%;
}
</style>
