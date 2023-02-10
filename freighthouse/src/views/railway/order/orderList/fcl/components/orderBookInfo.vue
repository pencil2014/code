<template>
  <div class="row-flex ml10">
    <el-row>
			<el-col :span="8" class="row-column">
				<div class="cont">
					<div class="h1">
						<span class="label">港口信息</span>
						<div class="include-barge">
							<el-checkbox size="mini" v-model="includeFeederState" true-label="y" false-label="n" :disabled="disabledState" @change="handleChangeIncludeFeeder">包含驳船</el-checkbox>
						</div>
					</div>
					<div class="pd8 flex-form-item">
						<el-form-item required label="驳船收货地" prop="barge.porPortCode" :show-message="false" v-if="isIncludeFeeder">
							<el-select
								size="mini"
								v-model="createItem.barge.porPortCode"
								filterable
								remote
								clearable
								:disabled="disabledState"
								style="width: 100%"
								placeholder="请输入"
								:remote-method="porPortFilterMehod"
								@visible-change="porPortVisibleChange"
								@change="handleChangePorPortCode"
							>
								<el-option v-for="item in portList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item required label="大船起运港" prop="ship.polPortCode" :show-message="false">
							<el-select
								size="mini"
								v-model="createItem.ship.polPortCode"
								filterable
								remote
								clearable
								:disabled="disabledState"
								style="width: 100%"
								placeholder="请输入"
								:remote-method="polPortFilterMehod"
								@visible-change="polPortVisibleChange"
								@change="handleChangePolPortCode"
							>
								<el-option v-for="item in portList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="中转港" prop="ship.transitPortCode" :show-message="false" class="multi-select-tag">
							<el-select
								size="mini"
								multiple
								filterable
								remote
								:multiple-limit="3"
								:collapse-tags="false"
								clearable
								v-model="createItem.ship.transitPortCode"
								style="width: 100%"
								placeholder="请输入"
								:disabled="disabledState"
								@visible-change="
									val => {
										portVisibleChange(val)
									}
								"
								:filter-method="
									val => {
										portFilterMehod(val)
									}
								"
								@change="
									val => {
										handleChangeTransitPort(val)
									}
								"
							>
								<el-option v-for="item in portList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item required label="卸货港" prop="ship.unloadingPortCode" :show-message="false">
							<el-select
								size="mini"
								v-model="createItem.ship.unloadingPortCode"
								filterable
								remote
								clearable
								:disabled="disabledState"
								style="width: 100%"
								placeholder="请输入"
								:remote-method="unloadPortFilterMehod"
								@visible-change="unloadPortVisibleChange"
								@change="handleChangeUnloadPortCode"
							>
								<el-option v-for="item in portList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item required label="目的地" prop="ship.podPortCode" :show-message="false">
							<el-select
								size="mini"
								v-model="createItem.ship.podPortCode"
								filterable
								remote
								clearable
								:disabled="disabledState"
								style="width: 100%"
								placeholder="请输入"
								:remote-method="podPortFilterMehod"
								@visible-change="podPortVisibleChange"
								@change="handleChangePodPortCode"
							>
								<el-option v-for="item in portList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item required label="系统航线" prop="ship.sysLineCode" :show-message="false">
							<el-input clearable size="mini" placeholder="请输入" v-model="sysLineName" disabled></el-input>
						</el-form-item>
						<el-form-item label="国家" :show-message="false">
							<el-input type="text" clearable size="mini" placeholder="请输入" v-model="countryName" disabled></el-input>
						</el-form-item>
						<el-form-item label="驳船中转方式" prop="barge.transitWay" :show-message="false" v-if="isIncludeFeeder">
							<el-select v-model="createItem.barge.transitWay" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
								<el-option v-for="item in dictMap.transferMode" :label="item.label" :value="item.value" :key="item.value"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="中转方式" prop="ship.transitWay" :show-message="false">
							<el-select v-model="createItem.ship.transitWay" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
								<el-option v-for="item in dictMap.mainRouteTransferMode" :label="item.label" :value="item.value" :key="item.value"></el-option>
							</el-select>
						</el-form-item>
						
						
						<el-form-item :required="contractRequired" label="合约号" prop="ship.contractNo" :show-message="false" v-if="contractShow">
							<el-input clearable size="mini" placeholder="请输入" v-model="createItem.ship.contractNo" :disabled="disabledState"></el-input>
						</el-form-item>
						<el-form-item :required="contractRequired" label="合约公司" prop="ship.contractCompany" :show-message="false" v-if="contractShow">
							<el-input clearable size="mini" placeholder="请输入" v-model="createItem.ship.contractCompany" :disabled="disabledState"></el-input>
						</el-form-item>
					</div>
				</div>
			</el-col>
			<el-col :span="8" class="row-column">
				<div class="cont">
					<div class="h1">
						<span class="label">船东信息</span>
					</div>
					<div class="pd8 flex-form-item">
						<el-form-item required label="船公司" prop="ship.shipCarrierCode" :show-message="false">
							<el-autocomplete
								size="mini"
								clearable
								v-model="createItem.ship.shipCarrierCode"
								style="width: 100%"
								placeholder="请输入"
								:disabled="disabledState"
								:fetch-suggestions="
									(queryString, cb) => {
										shipQuerySearch(queryString, cb)
									}
								"
								@change="
									value => {
										handleChangeShipCarrier(value)
									}
								"
								@select="
									value => {
										handleSelectShipCarrier(value)
									}
								"
							>
							</el-autocomplete>
						</el-form-item>
						<el-form-item class="timeSpecial" required label="驳船预计开船时间" prop="barge.etdTime" :show-message="false" v-if="isIncludeFeeder">
							<el-date-picker
								size="mini"
								v-model="createItem.barge.etdTime"
								type="date"
								style="width: 100%"
								clearable
								placeholder="请选择"
								value-format="yyyy-MM-dd"
								:picker-options="pickerOptions"
								:disabled="disabledState"
							/>
						</el-form-item>
						<el-form-item class="timeSpecial" label="驳船截关时间" prop="barge.cyCutOff" :show-message="false" v-if="isIncludeFeeder">
							<el-date-picker
								size="mini"
								v-model="createItem.barge.cyCutOff"
								type="date"
								style="width: 100%"
								clearable
								placeholder="请选择"
								value-format="yyyy-MM-dd"
								:picker-options="pickerOptions"
								:disabled="disabledState"
							/>
						</el-form-item>
						<el-form-item class="timeSpecial" required label="大船预计开船时间" prop="ship.etdTime" :show-message="false">
							<el-date-picker
								size="mini"
								v-model="createItem.ship.etdTime"
								type="date"
								style="width: 100%"
								clearable
								:disabled="disabledState"
								placeholder="请选择"
								value-format="yyyy-MM-dd"
								:picker-options="pickerOptions"
							/>
						</el-form-item>
						<el-form-item class="timeSpecial" required label="大船截关时间" prop="ship.cyCutOff" :show-message="false">
							<el-date-picker
								size="mini"
								v-model="createItem.ship.cyCutOff"
								type="date"
								style="width: 100%"
								clearable
								placeholder="请选择"
								value-format="yyyy-MM-dd"
								:picker-options="pickerOptions"
								:disabled="disabledState"
							/>
						</el-form-item>
						<el-form-item label="免用免堆信息" prop="ship.freetimeSys" :show-message="false">
							<el-input
								type="textarea"
								clearable
								row="3"
								size="mini"
								placeholder="请输入"
								maxlength="128"
								show-word-limit
								v-model="createItem.ship.freetimeSys"
								:disabled="disabledState"
							></el-input>
						</el-form-item>
						<el-form-item label="委托备注" prop="intrustRemark" :show-message="false" v-if="isBd">
							<el-input type="textarea" :autosize="{ minRows: 2, maxRows: 3 }" size="mini" maxlength="512"
								show-word-limit placeholder="请输入" v-model="createItem.intrustRemark" :disabled="disabledState"> </el-input>
						</el-form-item>
					</div>
				</div>
			</el-col>
			<el-col :span="8" class="row-column">
				<div class="cont">
					<div class="h1">
						<span class="label">货运信息</span>
					</div>
					<div class="pd8 flex-form-item">
						<el-form-item label="贸易条款" prop="transport.tradeTermsCode" :show-message="false">
							<el-select v-model="createItem.transport.tradeTermsCode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
								<el-option v-for="item in dictMap.tradeTermsCode" :label="item.label" :value="item.value" :key="item.value"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="运输条款" prop="transport.transportTerm" :show-message="false">
							<el-select v-model="createItem.transport.transportTerm" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
								<el-option v-for="(item, index) in dictMap.shipTerms" :label="item.label" :value="item.value" :key="index"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="付款方式" prop="payMode" :show-message="false">
							<el-select v-model="createItem.payMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
								<el-option v-for="(item, index) in dictMap.payMode" :label="item.label" :value="item.value" :key="index"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="中转费付款方式" prop="transitPayMode" :show-message="false">
							<el-select v-model="createItem.transitPayMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
								<el-option v-for="(item, index) in dictMap.transitPayMode" :label="item.label" :value="item.value" :key="index"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item required label="出单方式" prop="ship.blMode" :show-message="false">
							<el-select v-model="createItem.ship.blMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState && isView">
								<el-option v-for="(item, index) in dictMap.blMode" :label="item.label" :value="item.value" :key="index"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item required label="提单类型" prop="ship.blType" :show-message="false">
							<el-select v-model="createItem.ship.blType" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="isView">
								<el-option v-for="(item, index) in dictMap.blType" :label="item.label" :value="item.value" :key="index"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item required label="放舱要求" prop="ship.issueMode" :show-message="false">
							<el-select v-model="createItem.ship.issueMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState" @change="handleChangeIssueMode">
								<el-option v-for="(item, index) in dictMap.issueMode" :label="item.label" :value="item.value" :key="index"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="是否申请不甩柜" prop="ship.isNodrop" :show-message="false">
							<el-select v-model="createItem.ship.isNodrop" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
								<el-option v-for="(item, index) in dictMap.yesOrNoOptions" :label="item.label" :value="item.value" :key="index"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item required label="最终目的地" prop="transport.destinationArea" :show-message="false" v-if="show">
							<el-input size="mini" placeholder="请输入" clearable v-model="createItem.transport.destinationArea" :disabled="disabledState"></el-input>
						</el-form-item>
						<el-form-item required label="交货详细地点" prop="transport.deliveryPlace" :show-message="false" v-if="show">
							<el-input size="mini" placeholder="请输入" clearable v-model="createItem.transport.deliveryPlace" :disabled="disabledState"></el-input>
						</el-form-item>
					</div>
				</div>
			</el-col>
		</el-row>
  </div>
</template>

<script>

import {mapState} from 'vuex'
import {portSystemLineInfo, baseSystemLineInfo} from '@/api/base'
import { mainRouteFreeTime } from '@/api/charge';

export default {
  data() {
    return {
      state: 'valid',
      portDestinationAttribute: '',
      isEdit: false,
      oQuery: this.$route.query,
      sysLineName: '',
      transitPortOptions: [],
      transportTermOptions: [],
      portList: [],
      pickerOptions: {
        disabledDate(date) {
          //disabledDate 文档上：设置禁用状态，参数为当前日期，要求返回 Boolean
          return date.getTime() < Date.now() - 24 * 60 * 60 * 1000;
        }
      },
      includeFeederState: '',	// 是否包含驳船
			tradeTermsCode: ['DDP', 'DDU'],
			countryName: ''
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
    fillPolData: {
      type: Object,
      default: () => ({})
    },
    fillPortCodes: {
      type: String,
      default: ''
    },
    orderStatus: {
      type: String,
      default: ''
    },
    sysLineCname: {
      type: String,
      default: ''
    }
  },
  created() {
    this.fillPolPort(this.fillPortCodes)
  },
  mounted() {
    
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      currRole: state => state.user.currRole,
    }),
    isIncludeFeeder() {
      return this.includeFeeder === 'y' ? true : false
    },
    disabledState() {
      if (this.orderStatus === 'suubmit') {
				return true
			}
      return false
    },
    isAc() {
			return this.currRole === 'ac'
		},
    isDoc() {
			return this.currRole === 'doc'
		},
		isOp() {
			return this.currRole === 'op'
		},
		isBd() {
			return this.currRole === 'bd' || this.currRole === 'obd'
		},
    isView() {
      return false
    },
    contractShow() {
			return this.createItem.serviceList.includes('book') ? false : true
		},
		contractRequired() {
			return this.createItem.serviceList.includes('proxy_book') ? true : false
		},
		show() {
			return this.createItem.transport.tradeTermsCode && this.tradeTermsCode.includes(this.createItem.transport.tradeTermsCode.toUpperCase())
		}
  },
  watch: {
    fillPortCodes: {
      handler(newVal) {
        this.fillPolPort(newVal)
      },
      deep: true
    },
    sysLineCname: {
      handler(newVal) {
        this.sysLineName = newVal
      },
      deep: true
    },
    includeFeeder: {
      handler(newVal) {
				this.includeFeederState = newVal
				console.log('this.includeFeederState', this.includeFeederState);
      },
			deep: true,
			immediate: true
    },
  },
  components: {
    
  },
  methods: {
    // 切换是否包含驳船
		handleChangeIncludeFeeder(val) {
			// this.includeFeederState = val
			this.$emit('change', val)
		},
    handleChangeIssueMode(val) {
      this.createItem.ship.issueMode = val
    },
    fillSysLine(sysLineCode) {
      if (sysLineCode) {
        baseSystemLineInfo({sysLineCode}).then(res => {
          this.sysLineName = res.data.cname
        })
      }
    },

    fillPolPort(portCodes) {
      // 港口数据反显
      if (portCodes) {
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
          console.log('this.portList', this.portList)
					this.portDestinationAttribute=results.get(this.createItem.ship.podPortCode)['portAttribute']
					let portItem = this.portList.find(item => item.portCode === this.createItem.ship.podPortCode)
					this.countryName = portItem.countryName
        })
      }
    },
    
    // 港口下拉数据
    transitPortSearch(queryString, portAttribute, state) {
      // if(type==='feederPolCode'&&!queryString){
      //   queryString=this.createItem.feederPolCityCode
      // }
      this.$store.dispatch('dict/basePortList', {queryString, portAttribute, state}).then(data => {
        let result = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
        this.portList = result
      })
    },
    // 驳船收货地
    porPortVisibleChange(val) {
      if (val) this.transitPortSearch('', 'port_of_feeder', this.state)
    },
    porPortFilterMehod(val) {
      this.transitPortSearch(val, 'port_of_feeder', this.state)
    },
    handleChangePorPortCode(val) {
    },
    // 大船起运港
    polPortVisibleChange(val) {
      if (val) this.transitPortSearch('', 'port_of_basic', this.state)
    },
    polPortFilterMehod(val) {
      this.transitPortSearch(val, 'port_of_basic', this.state)
    },
    handleChangePolPortCode(val) {
			// 变更商务岗位分配信息
			val && this.$emit('updatePricing')
    },
    // 卸货港
    unloadPortVisibleChange(val) {
      if (val) this.transitPortSearch('', 'port_of_discharge', this.state)
    },
    unloadPortFilterMehod(val) {
      this.transitPortSearch(val, 'port_of_discharge', this.state)
    },
    handleChangeUnloadPortCode(val) {
      
    },
    // 目的地
    podPortVisibleChange(val) {
      if (val) this.transitPortSearch('', 'port_of_destination', this.state)
    },
    podPortFilterMehod(val) {
      this.transitPortSearch(val, 'port_of_destination', this.state)
    },
    handleChangePodPortCode(val) {
			if (val) {
				this.portDestinationAttribute='port_of_destination'
				// 获取国家code
				let portItem = this.portList.find(item => item.portCode === val)
				this.countryName = portItem.countryName
				let countryCode = portItem ? portItem.countryCode : ''
				this.$emit('getCountryCode', countryCode)
				// 根据目的港自动匹配系统航线
				this.initSystemLine(val)
			}      
    },
    initSystemLine(val){
      if (val) {
        portSystemLineInfo(val).then(response => {
          let systemLineList=response.data
          if(systemLineList.length>0){
            let systemLine=systemLineList[0]
            this.createItem.ship.sysLineCode = systemLine.sysLineCode
            this.sysLineName = systemLine.cname
						this.handleFillFreetimeSys()
						// 修改系统航线会变更商务岗位分配信息
						this.$emit('updatePricing')
          }
        })
      } else {
        this.createItem.ship.sysLineCode = ''
        this.sysLineName = ''
      }
    },
    // 获取免用免堆信息
    handleFillFreetimeSys() {
      let {polPortCode, podPortCode, sysLineCode, shipCarrierCode} = this.createItem.ship
      // if (!polPortCode || !podPortCode || !sysLineCode || !shipCarrierCode) {
      //   return this.$message.error('请先选择起运港、目的地、航线、船司')
      // }
      mainRouteFreeTime({
        polCode: this.createItem.ship.polPortCode,
        podCode: this.createItem.ship.podPortCode,
        sysLineCode: this.createItem.ship.sysLineCode,
        shipCarrierCode: this.createItem.ship.shipCarrierCode
      }).then(res => {
        this.createItem.ship.freetimeSys = res.data
      })
    },
    handleSelectPodPortCode(item) {
      Object.assign(this.createItem.ship, {
        podPortCode: item.key
      })
    },
    portVisibleChange(val) {
      if (val) {
        this.transitPortSearch('', 'port_of_basic', this.state)
      }
    },
    portFilterMehod(val) {
      this.transitPortSearch(val, 'port_of_basic', this.state)
    },
    // 下拉选择
    handleChangeTransitPort(val) {
      Object.assign(this.createItem.ship, {
        transitPortCode: val
      })
    },
    // 系统航线下拉列表自动补充的数据
    sysLineQuerySearch(queryString, cb) {
      this.$store.dispatch('dict/baseSystemLineList', {name: queryString, value: 'valid'}).then(data => {
        cb(data)
      })
    },
    // 船公司下拉列表自动补充的数据
    shipQuerySearch(queryString, cb) {
      this.$store.dispatch('dict/baseShippingCarrierList', {name: queryString, state: 'valid'}).then(data => {
        cb(data)
      })
    },
    handleChangeShipCarrier(val) {
      Object.assign(this.createItem.ship, {
        shipCarrierCode: val
			})
    },
    handleSelectShipCarrier(item) {
      Object.assign(this.createItem.ship, {
        shipCarrierCode: item.key
			})
			// 变更商务岗位分配信息
			this.$emit('updatePricing')
    },
    // 运输条款
    getShipTerm() {
      this.$store.dispatch('dict/baseShipTermsList').then(data => {
        this.transportTermOptions = data
      })
    },


  }
};
</script>

<style lang="scss">

</style>
