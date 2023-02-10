<template>
  <div class="route-detail-cont">
    <div class="route-info-table">
      <div class="table-td">
        <div class="h1">
          <span class="label">港口信息</span>
        </div>
        <div class="flex-form-item label80">
          <el-form-item label="驳船收货地" prop="feederPolCode" :show-message="false">
            <span slot="label" style="display: inline-block">
              <CustViewTip label="驳船收货地" />
            </span>
            <el-select size="mini" multiple filterable remote clearable reserve-keyword
              v-model="createItem.feederPolCode" style="width: 100%" placeholder="请输入"
              @visible-change="(val) => {feederPolPortVisibleChange(val)}"
              :filter-method="(val) => {feederPolPortFilterMethod(val)}"
              @change="(val) => {handleChangeFeederPolPort(val)}">
              <el-option v-for="item in portList"
                :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item required label="大船起运港" prop="polCode" :show-message="false">
            <span slot="label" style="display: inline-block">
              <CustViewTip label="大船起运港" />
            </span>
            <el-select size="mini"
              v-model="createItem.polCode"
              filterable
              remote
              clearable 
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
          <el-form-item label="中转港" prop="transitPortCodes" :show-message="false">
            <span slot="label" style="display: inline-block">
              <CustViewTip label="中转港" />
            </span>
            <el-select size="mini" multiple filterable remote :multiple-limit="3" clearable reserve-keyword
              v-model="createItem.transitPortCodes" style="width: 100%" placeholder="请输入"
                @visible-change="(val) => {portVisibleChange(val)}"
                :filter-method="(val) => {portFilterMethod(val)}"
                @change="(val) => {handleChangePort(val)}">
                <el-option v-for="item in portList"
                  :key="item.value" :label="item.label" :value="item.value">
                </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="卸货港" prop="unloadingPortCode" :show-message="false">
            <el-select size="mini"
              v-model="createItem.unloadingPortCode"
              filterable
              remote
              clearable 
              style="width: 100%"
              placeholder="请输入"
              :remote-method="unloadPortFilterMethod"
              @visible-change="unloadPortVisibleChange"
              @change="handleChangeUnloadPort">
              <el-option
                v-for="item in portList"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item required label="目的地" prop="podCode" :show-message="false">
            <span slot="label" style="display: inline-block">
              <CustViewTip label="目的地" />
            </span>
            <el-select size="mini"
              v-model="createItem.podCode"
              filterable
              remote
              clearable 
              style="width: 100%"
              placeholder="请输入"
              :remote-method="podPortFilterMethod"
              @visible-change="podPortVisibleChange"
              @change="handleChangePodPort($event)">
              <el-option
                v-for="item in portList"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item required label="系统航线" prop="sysLineCname" :show-message="false">
            <span slot="label" style="display: inline-block">
              <CustViewTip label="系统航线" />
            </span>
            <el-input clearable size="mini" placeholder="请输入" v-model="createItem.sysLineCname" disabled></el-input>
          </el-form-item>
          <el-form-item label="中转方式" prop="cargoLimited" :show-message="false">
            <span slot="label" style="display: inline-block">
              <CustViewTip label="中转方式" />
            </span>
            <el-select v-model="createItem.mainRouteTransferMode" size="mini" clearable placeholder="请选择" style="width: 100%">
              <el-option v-for="(item, index) in dictMap.mainRouteTransferMode" :label="item.label" :value="item.value" :key="index">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="承运人航线" prop="carrierLineCode" :show-message="false">
            <el-select size="mini"
              v-model="createItem.carrierLineCode"
              filterable
              remote
              clearable 
              style="width: 100%"
              placeholder="请输入"
              :remote-method="carrierLineCodeFilterMethod"
              @visible-change="carrierLineCodeVisibleChange"
              @change="handleChangeCarrierLineCode">
              <el-option
                v-for="item in carrierLineCodeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="航线代码" prop="carrierService" :show-message="false">
            <span slot="label" style="display: inline-block">
              <CustViewTip label="航线代码" />
            </span>
            <el-input clearable size="mini" placeholder="请输入" v-model="createItem.carrierService"></el-input>
          </el-form-item>
        </div>
      </div>
      <div class="table-td">
        <div class="h1">
          <span class="label">船东信息</span>
        </div>
        <div class="flex-form-item label80">
          <el-form-item required label="驳船匹配" prop="feederMatchMode" :show-message="false">
            <el-select v-model="createItem.feederMatchMode" size="mini" clearable placeholder="请选择" style="width: 100%"
            :disabled="createItem.feederPolCode && createItem.feederPolCode.length ? true : false">
              <el-option v-for="(item, index) in dictMap.feederMatchMode" :label="item.label" :value="item.value" :key="index">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item required label="船公司" prop="shipCarrierCode" :show-message="false">
            <span slot="label" style="display: inline-block">
              <CustViewTip label="船公司" />
            </span>
            <el-select size="mini"
              v-model="createItem.shipCarrierCode"
              filterable
              remote
              clearable 
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
          <el-form-item required label="船期" prop="schedule" :show-message="false">
            <span slot="label" style="display: inline-block">
              <CustViewTip label="船期" />
            </span>
            <el-input clearable size="mini" placeholder="船期格式为：2/1" v-model="createItem.schedule"></el-input>
          </el-form-item>
          <el-form-item label="航程" prop="voyage" required :show-message="false">
            <span slot="label" style="display: inline-block">
              <CustViewTip label="航程" />
            </span>
            <el-input clearable size="mini" placeholder="请输入" v-model="createItem.voyage"></el-input>
          </el-form-item>
          <el-form-item label="截文件" prop="cutoffDate" :show-message="false">
            <el-input clearable size="mini" placeholder="星期/时间 如6/12" v-model="createItem.cutoffDate"></el-input>
          </el-form-item>
          <el-form-item label="开航日" prop="sailingDate" :show-message="false">
            <el-date-picker size="mini" v-model="createItem.sailingDate" type="date" style="width: 100%" clearable
            placeholder="请选择" format="yyyy-MM-dd" value-format="yyyy-MM-dd"/>
          </el-form-item>
          <el-form-item required label="有效类别" prop="effectiveType" :show-message="false">
            <span slot="label" style="display: inline-block">
              <CustViewTip label="有效类别" />
            </span>
            <el-select v-model="createItem.effectiveType" size="mini" clearable placeholder="请选择" style="width: 100%">
              <el-option v-for="(item, index) in dictMap.effectiveType" :label="item.label" :value="item.value" :key="index">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item required label="有效期" prop="beginDate" :show-message="false">
            <span slot="label" style="display: inline-block">
              <CustViewTip label="有效期" />
            </span>
            <el-date-picker
              style="width: 100%"
              size="mini"
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
        </div>
      </div>
      <div class="table-td">
        <div class="h1">
          <span class="label">货运信息</span>
        </div>
        <div class="flex-form-item label80">
          <el-form-item required label="运输条款" prop="shipTerms" :show-message="false">
            <el-select v-model="createItem.shipTerms" size="mini" clearable placeholder="请选择" style="width: 100%">
              <el-option v-for="(item, index) in dictMap.shipTerms" :label="item.label" :value="item.value" :key="index">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="出单方式" prop="issueWay" :show-message="false">
            <span slot="label" style="display: inline-block">
              <CustViewTip label="出单方式" />
            </span>
            <el-select v-model="createItem.issueWay" size="mini" clearable multiple placeholder="请选择" style="width: 100%" @change="handleChangeIssueWay">
              <el-option v-for="(item, index) in dictMap.chargeIssueWay" :label="item.label" :value="item.value" :key="index">
              </el-option>
            </el-select>
          </el-form-item>
          <div class="telex-form-flex">
            <el-col :span="18">
              <el-form-item :required="createItem.issueWay.includes('no_free_telex_release')" label="电放费" prop="telexFee" :show-message="false">
                <el-input clearable size="mini" placeholder="请输入" v-model="createItem.telexFee" @input="telexFeeOnInput(createItem.telexFee)" :disabled="createItem.issueWay.includes('free_telex_release')"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :required="createItem.issueWay.includes('no_free_telex_release')" label="" prop="telexFeeCurrency" :show-message="false">
                <el-select v-model="createItem.telexFeeCurrency" size="mini" placeholder="请选择" style="width: 100%" :disabled="createItem.issueWay.includes('free_telex_release')">
                  <el-option v-for="item in currencyOptions" :label="item.code" :value="item.code" :key="item.code">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </div>
          <el-form-item label="提单类型" prop="blType" :show-message="false">
            <el-select v-model="createItem.blType" size="mini" clearable placeholder="请选择" style="width: 100%">
              <el-option v-for="(item, index) in dictMap.blType" :label="item.label" :value="item.value" :key="index">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="订舱代理" prop="bkgAgentId" :show-message="false">
            <el-select size="mini"
              v-model="createItem.bkgAgentId"
              filterable
              remote
              clearable 
              style="width: 100%"
              placeholder="请输入"
              :remote-method="bkgAgentFilterMethod"
              @visible-change="bkgAgentVisibleChange"
              @change="handleChangeBkgAgent">
              <el-option
                v-for="item in bkgAgentOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="限定货物" prop="cargoLimited" :show-message="false">
            <span slot="label" style="display: inline-block">
              <CustViewTip label="限定货物" />
            </span>
            <el-input clearable size="mini" placeholder="请输入" v-model="createItem.cargoLimited"></el-input>
          </el-form-item>
          <el-form-item label="拿价人" prop="pricer" :show-message="false" class="popover-class">
            <span slot="label" style="display: inline-block">
              <span class="span-box">
                <span>拿价人</span>
                <el-popover popper-class="emplpyeeName-pop" placement="left" width="240" trigger="click">
                  <div class="employeeName-list">
                    <ul>
                      <li v-if="employeeInfo.telephone">座机号：{{employeeInfo.telephone}}</li>
                      <li v-else>手机号：{{employeeInfo.mobileNo}}</li>
                      <li>QQ：{{employeeInfo.qq}}</li>
                      <li>email：{{employeeInfo.email}}</li>
                      <li>部门：{{employeeInfo.deptCname}}</li>
                      <li>公司：{{employeeInfo.companyCname}}</li>
                    </ul>
                  </div>
                  <i slot="reference" class="el-icon-postcard" @click="getEmployeeInfo(createItem.pricer)"></i>
                </el-popover>
              </span>
            </span>
            <el-select size="mini"
              v-model="createItem.pricer"
              filterable
              remote
              clearable 
              style="width: 100%"
              placeholder="请输入"
              :remote-method="pricerFilterMethod"
              @visible-change="pricerVisibleChange"
              @change="handleChangePricer">
              <el-option
                v-for="item in pricerOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="维护人" prop="maintainerId" :show-message="false" class="popover-class">
            <span slot="label" style="display: inline-block">
              <span class="span-box">
                <span>维护人</span>
                <el-popover popper-class="emplpyeeName-pop" placement="left" width="240" trigger="click">
                  <div class="employeeName-list">
                    <ul>
                      <li v-if="employeeInfo.telephone">座机号：{{employeeInfo.telephone}}</li>
                      <li v-else>手机号：{{employeeInfo.mobileNo}}</li>
                      <li>QQ：{{employeeInfo.qq}}</li>
                      <li>email：{{employeeInfo.email}}</li>
                      <li>部门：{{employeeInfo.deptCname}}</li>
                      <li>公司：{{employeeInfo.companyCname}}</li>
                    </ul>
                  </div>
                  <i slot="reference" class="el-icon-postcard" @click="getEmployeeInfo(createItem.maintainerId)"></i>
                </el-popover>
              </span>
            </span>
            <el-select size="mini"
              v-model="createItem.maintainerId"
              filterable
              remote
              clearable 
              style="width: 100%"
              placeholder="请输入"
              :remote-method="maintainerFilterMethod"
              @visible-change="maintainerVisibleChange"
              @change="handleChangeMaintainer">
              <el-option
                v-for="item in maintainerOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="内部备注" prop="internalDesc" :show-message="false">
            <el-input type="textarea" clearable size="mini" placeholder="请输入" v-model="createItem.internalDesc" maxlength="1024"></el-input>
          </el-form-item>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script>

import {mapState} from 'vuex'
import {portSystemLineInfo, baseSystemLineInfo, employeeInfo} from '@/api/base'
import { mainRouteFreeTime } from '@/api/charge'
import CustViewTip from './custViewTip'
export default {
  data() {
    return {
      state: 'valid',
      oQuery: this.$route.query,
      // sysLineName: '',
      pricerOptions: [],
      portList: [],
      bkgAgentOptions: [],
      carrierLineCodeOptions: [],
      maintainerOptions: [],
      portDestinationAttribute:'',
      shipCarrierOptions: [],
      employeeInfo: {},
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
    currencyList: {
      type: Array,
      default: () => ([])
    }
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
    currencyOptions() {
      return this.currencyList.filter(item => ['CNY', 'HKD'].includes(item.code))
    }
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
    CustViewTip
  },
  methods: {
    telexFeeOnInput(val) {
      if (isNaN(val)) {
        // 如果当前输入框内容不是数字，递归删除最后一位，直至成为数字
        let fnSlice = (str) => isNaN(str) && (str !== '-') ? fnSlice(str.slice(0, -1)) : str
        val = fnSlice(val)
        this.$set(this.createItem, 'telexFee', val)
      } 
      let dotPos = val.lastIndexOf('.')
      if (dotPos > -1 && val.length - dotPos > 3) {
        val = (+val).toFixed(2)
        this.$set(this.createItem, 'telexFee', val)
      }
    },
    getEmployeeInfo (employeeId) {
      if (!employeeId) {
        this.employeeInfo = {}
      } else {
        employeeInfo({ employeeId }).then((res) => {
          this.employeeInfo = res.data
        })
      }
    },
    init(data) {
      if (data.bkgAgentId === 0) {
        data.bkgAgentId = ''
      }
      this.bkgAgentOptions = [{label: data.bkgAgent, value: data.bkgAgentId}]
      this.pricerOptions = [{label: data.pricerName, value: data.pricer}]
      this.maintainerOptions = [{label: data.maintainerName, value: data.maintainerId}]
      this.carrierLineCodeOptions = [{label: data.carrierLineName, value: data.carrierLineCode}]
      // this.shipCarrierOptions = [{label: '', value: ''}]
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
          this.portDestinationAttribute = results.get(this.createItem.podCode)['portAttribute']
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
      if (val && val.length) {
        this.createItem.feederMatchMode = 'none'
      } else {
        this.createItem.feederMatchMode = 'auto'
      }
    },
    // 起运港
    polPortVisibleChange(val) {
      val && this.transitPortSearch('', 'port_of_basic', 'valid','polCode')
    },
    polPortFilterMethod(val) {
      this.transitPortSearch(val, 'port_of_basic', 'valid','polCode')
    },
    // 更改起运港
    handleChangePolPort(val) {
      let findItem = this.portList.find(item => item.portCode === val)
      this.createItem.polCityCode = findItem ? findItem.cityCode : ''
      this.createItem.telexFeeCurrency = this.createItem.polCityCode === 'HKHKG' ? 'HKD' : 'CNY'
    },
    // 中转港
    portVisibleChange(val) {
      val && this.transitPortSearch('', 'port_of_basic', 'valid','transitPort')
    },
    portFilterMethod(val) {
      this.transitPortSearch(val, 'port_of_basic', 'valid','transitPort')
    },
    handleChangePort(val) {
    },
    // 卸货港
    unloadPortVisibleChange(val) {
      val && this.transitPortSearch('', 'port_of_discharge', 'valid','unloadingPortCode')
    },
    unloadPortFilterMethod(val) {
      this.transitPortSearch(val, 'port_of_discharge', 'valid','unloadingPortCode')
    },
    handleChangeUnloadPort(val) {
    },
    // 目的地
    podPortVisibleChange(val) {
      val && this.transitPortSearch('', 'port_of_destination', 'valid','podCode')
    },
    podPortFilterMethod(val) {
      this.transitPortSearch(val, 'port_of_destination', 'valid','podCode')
    },
    handleChangePodPort(val) {
     let  podPort = this.portList.filter(item => item.portCode === this.createItem.podCode)[0]
      this.portDestinationAttribute = podPort.portAttribute
      val && this.initSystemLine(val)
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
    // 订舱代理
    bkgAgentVisibleChange(val) {
      val && this.getSupplierList('bkg_agent', '')
    },
    bkgAgentFilterMethod(val) {
      this.getSupplierList('bkg_agent', val)
    },
    handleChangeBkgAgent(val) {
      let findItem = this.bkgAgentOptions.find(ele => ele.value === val)
      this.createItem.bkgAgent = findItem ? findItem.label : ''
    },
    // 承运人航线
    carrierLineCodeVisibleChange(val) {
      val && this.sysLineQuerySearch('')
    },
    carrierLineCodeFilterMethod(val) {
      this.sysLineQuerySearch(val)
    },
    handleChangeCarrierLineCode(val) {
      let findItem = this.carrierLineCodeOptions.find(ele => ele.value === val)
      this.createItem.carrierLineName = findItem ? findItem.label : ''
    },
    // 拿价人
    pricerVisibleChange(val) {
      val && this.pricerQuerySearch('')
    },
    pricerFilterMethod(val) {
      this.pricerQuerySearch(val)
    },
    handleChangePricer(val) {
      let findItem = this.pricerOptions.find(ele => ele.value === val)
      this.createItem.pricerName = findItem ? findItem.label : ''
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
    // 更改出单方式
    handleChangeIssueWay(val) {
      if (val.includes('free_telex_release')) {
        this.createItem.telexFee = '0'
      }
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
    // 获取订舱代理
    getSupplierList(type, queryString='') {
      this.$store.dispatch('dict/querySupplierList', {category: 'category', value: type, queryString: queryString}).then(data => {
        this.bkgAgentOptions = data.list.map(ele => {
          return Object.assign(ele, {
            label: this.$language=='en' ? ele.ename : ele.name,
            value: ele.supplierId ? Number(ele.supplierId) : ''
          })
        })
      })
    },
    // 航线下拉列表自动补充的数据
    sysLineQuerySearch(queryString) {
      this.$store.dispatch('dict/baseSystemLineList', {name: queryString, state: 'valid'}).then(data => {
        this.carrierLineCodeOptions = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
      })
    },
    // 拿价人
    pricerQuerySearch(queryString) {
      let params = {}
      Object.assign(params, {
        name: queryString,
        state:'valid'
      })
      this.$store.dispatch('dict/employeeSelectlist', params).then(data => {
        this.pricerOptions = data.map(ele => {
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

<style lang="scss" scoped>
.route-detail-cont{
  .route-info-table{
    display: table;
    width: 100%;
    margin: 0 auto;
    border-collapse:separate;
    border-spacing: 10px;
    .table-td{
      width: 33.33%;
      display: table-cell;
      border-radius: 2px;
      border: 1px solid #e9e9e9;
      vertical-align: top;
      .h1{
        line-height: 32px;
        height: 32px;
        background: #f8f9fd;
        border-radius: 2px 2px 0 0;
        font-size: 12px;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-pack: justify;
        -ms-flex-pack: justify;
        justify-content: space-between;
        padding: 0 8px;
        .label{
          font-weight: 700;
        }
      }
      .flex-form-item {
        padding: 8px;
        &.pr24{
          padding-right: 24px;
        }
        .telex-form-flex{
          display: flex;
        }
        /deep/.el-form-item {
          display: flex;
          margin-bottom: 4px;
          .el-form-item__label {
            width: 110px;
            line-height: 20px;
            padding-right: 4px;
            .span-box {
              display: flex;
              justify-content: flex-end;
              .icon-custView {
                margin-left: 4px;
                margin-top: 3px;
                height: 14px;
                width: 14px;
                background: url('../../../../../assets/icon-custView.png') center center no-repeat;
                background-size: cover;
                cursor: pointer;
              }
            }
          }
          .el-form-item__content {
            flex: 1;
            line-height: 20px;
          }
          .el-input--suffix .el-input__inner{
            padding-right: 20px;
            height: 20px !important;
            line-height: 20px !important;
          }
          &.vessel-time{
            .el-form-item__content{
              display: flex;
            }
          }
          .el-radio__label{
            font-size: 12px;
            padding-left: 5px;
          }
          .el-range-editor--mini .el-range__close-icon {
            line-height: 12px;
          }
        }
        &.label80 /deep/.el-form-item .el-form-item__label {
          width: 95px;
        }
        /deep/.el-form-item__content::before, /deep/.el-form-item__content::after, /deep/.el-form-item::before, /deep/.el-form-item::after {
          display: none;
        }
      }
    }
  }
  /deep/ .el-select .el-select__tags {
    max-width: auto !important;
  }
  /deep/ .el-select .el-select__tags span .el-tag--mini:first-of-type{
    flex: auto;
  }
  /deep/ .el-select .el-select__tags span .el-tag--mini:nth-of-type(2) {
    width: auto;
  }
}
.popover-class{
  /deep/ .el-form-item__content{
    display: flex;
    align-items: center;
  }
  .el-icon-postcard {
    font-size: 16px;
    margin-left: 3px;
    cursor: pointer;
    color: #409eff;
    padding-top: 3px;
  } 
}
 .employeeName-list {
  font-size: 12px;
  }
</style>
