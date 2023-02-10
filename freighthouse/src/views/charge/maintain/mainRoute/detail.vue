<template>
  <div class="edit-container mainRoute-container" v-loading="loading">
    <div class="stop-box" v-if="createItem.blankSailing === 'Y'">
      <span class="icon">停</span> 该航线已停运
    </div>
    <EditFunc 
      ref="editFunc" 
      :saveDisabled="saveDisabled" 
      :createItem="createItem" 
      :publishStatusOptions="publishStatusOptions" 
      @callback="editFuncCallback"/>
    <div class="edit-row">
      <div class="row-tit-mini">
        <span class="tit">运价详情</span>
      </div>
      <el-form ref="mainRouteSubmit" :model="createItem" :rules="rules" class="mainRoute-cont-form">
        <MainRouteInfo :createItem="createItem" :fillPortCodes="fillPortCodes" :currencyList="currencyList" ref="mainRouteInfo"/>
        <div class="edit-row box-row">
          <div class="row-tit"  :class="createItem.state === 'invalid'&&!(($route.query.action==='copy'&&$route.query.id)||!$route.query.id) ? 'invalid' : ''">
            <span class="tit">
              普通箱型
              <span v-if="createItem.state === 'invalid'&&!(($route.query.action==='copy'&&$route.query.id)||!$route.query.id)">(<em class="redFont">{{publishStatusOptions[createItem.state]}}</em>)</span>
              <el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                <i class="icon-custView"></i>
              </el-tooltip>
            </span>
            <div class="row-tit-operate">
              <span class="row-tit-label row-tit-info">开启时，只可输入合计 / 关闭时，可输入基价和中转价。</span>
              <el-switch 
                size="mini"
                v-model="createItem.allin" 
                active-color="#3E80F5" 
                inactive-color="#4A4A4A" 
                active-value="allin"
                inactive-value="not_allin"
                @change="changeAllinState">
              </el-switch>
            </div>
          </div>
          <div class="row-form">
            <el-table class="boxType-table" highlight-current-row ref="oceanFreightTable" style="width: 100%" :data="oceanFreightQuery">
              <el-table-column prop="structure" label="价格类型" align="center">
                <template slot-scope="scope">
                  {{$t(`dict.chargeStructure.${scope.row.structure}`)}}
                </template>
              </el-table-column>
              <el-table-column prop="currency" label="币别" align="center">
                <template slot-scope="scope">
                  <el-select size="mini" v-model="scope.row.currency" placeholder="请选择" :disabled="scope.row.disabled" @change="hadnleChangeCurrency">
                    <el-option
                      v-for="item in currencyList"
                      :key="item.code"
                      :label="item.code"
                      :value="item.code">
                    </el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="priceGp20" label="20GP" align="center">
                <template slot-scope="scope">
                  <el-input 
                  oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"
                  @blur="hadnleChangePrice(scope.row.priceGp20)"
                  size="mini" placeholder="请输入金额"
                  v-model.number="scope.row.priceGp20" :disabled="scope.row.disabled" ></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="priceGp40" label="40GP" align="center">
                <template slot-scope="scope">
                  <el-input 
                  size="mini" placeholder="请输入金额"
                  oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"
                  v-model.number="scope.row.priceGp40" :disabled="scope.row.disabled" clearable @blur="hadnleChangePrice(scope.row.priceGp40)"></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="priceHq40" label="40HQ" align="center">
                <template slot-scope="scope">
                  <el-input 
                  placeholder="请输入金额"
                  oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" 
                  size="mini" v-model.number="scope.row.priceHq40" :disabled="scope.row.disabled" clearable @blur="hadnleChangePrice(scope.row.priceHq40)"></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="priceHq45" label="45HQ" align="center">
                <template slot-scope="scope">
                  <el-input 
                  placeholder="请输入金额"
                  oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" 
                  size="mini" v-model.number="scope.row.priceHq45" :disabled="scope.row.disabled" clearable @blur="hadnleChangePrice(scope.row.priceHq45)"></el-input>
                </template>
              </el-table-column>
               <el-table-column prop="priceNor20" label="20NOR" align="center">
                <template slot-scope="scope">
                  <el-input 
                  placeholder="请输入金额"
                  oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" 
                  size="mini" v-model.number="scope.row.priceNor20" :disabled="scope.row.disabled" clearable @blur="hadnleChangePrice(scope.row.priceNor20)"></el-input>
                </template>
              </el-table-column>
               <el-table-column prop="priceNor40" label="40NOR" align="center">
                <template slot-scope="scope">
                  <el-input 
                  placeholder="请输入金额"
                  oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" 
                  size="mini" v-model.number="scope.row.priceNor40" :disabled="scope.row.disabled" clearable @blur="hadnleChangePrice(scope.row.priceNor40)"></el-input>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <SurchargeTable :surchargeList="createItem.surchargeList" ref="surchargeTable"/>
        <div class="edit-row box-row" style="margin-top: 10px">
          <div class="row-tit">
            <span class="tit">说明信息</span>
            <div class="row-tit-operate">
            </div>
          </div>
          <div class="desc-info-cont">
            <el-row>
              <el-col :span="8">
                <el-form-item class="form-column" label="附加费说明" prop="surchargeDesc" :show-message="false">
                  <span slot="label" style="display: inline-block">
                    <CustViewTip label="附加费说明" />
                  </span>
                  <el-input type="textarea" clearable size="mini" placeholder="请输入" v-model="createItem.surchargeDesc" maxlength="1024"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item class="form-column" label="特别提醒" prop="attention" :show-message="false">
                  <span slot="label" style="display: inline-block">
                    <CustViewTip label="特别提醒" />
                  </span>
                  <el-input type="textarea" clearable size="mini" placeholder="请输入" v-model="createItem.attention" maxlength="1024"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item class="form-column" label="免用免堆" prop="freeTimeDesc" :show-message="false">
                  <span slot="label" style="display: inline-block">
                    <CustViewTip label="免用免堆" />
                  </span>
                  <el-input type="textarea" clearable size="mini" placeholder="请输入" v-model="createItem.freeTimeDesc" maxlength="1024"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item class="form-column" label="收货指引" prop="guidanceDesc" :show-message="false">
                  <el-input type="textarea" clearable size="mini" placeholder="请输入" v-model="createItem.guidanceDesc" maxlength="1024"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item class="form-column" label="限重费说明" prop="guidanceDesc" :show-message="false">
                  <span slot="label" style="display: inline-block">
                    <CustViewTip label="限重费说明" />
                  </span>
                  <el-input type="textarea" clearable size="mini" placeholder="请输入" v-model="createItem.weightDesc" maxlength="1024"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item class="form-column" label="出单方式备注" prop="issueWayDesc" :show-message="false">
                  <span slot="label" style="display: inline-block">
                    <CustViewTip label="出单方式备注" />
                  </span>
                  <el-input type="textarea" clearable size="mini" placeholder="请输入" v-model="createItem.issueWayDesc" maxlength="512" show-word-limit></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item class="form-column" label="目的港收费标准参考" prop="podChargeDesc" :show-message="false">
                  <el-input type="textarea" clearable size="mini" placeholder="请输入" v-model="createItem.podChargeDesc" maxlength="1024" show-word-limit></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-form>
    </div>
  </div>

</template>
<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import {routerMixin} from '@/views/finance/mixins/routerMixin'
import {mainRouteAdd, mainRouteEdit, mainRouteInfo, mainRouteInvalidRoute} from '@/api/charge'
import {baseCurrencyList,basePortList,portSystemLineInfo,basePortListByCodes} from '@/api/base'
import {clearNoNum} from '@/utils/tools'
import EditFunc from './components/editFunc'
import MainRouteInfo from './components/mainRouteInfo'
import SurchargeTable from './components/surchargeTable'
import CustViewTip from './components/custViewTip'

const oceanFreightQuery = [
  {chargeCode:'', chargeType: '', structure: 'basic_price', chargeMode: '', payMode: '', currency: 'USD', rateUnit: 'container_type', priceGp20: '', priceGp40: '',priceHq40: '', priceHq45: '',priceNor20:'',priceNor40:'',price: ''},
  {chargeCode:'', chargeType: '', structure: 'transfer_price', chargeMode: '', payMode: '', currency: 'USD', rateUnit: 'container_type', priceGp20: '', priceGp40: '',priceHq40: '', priceHq45: '',priceNor20:'',priceNor40:'', price: ''},
  {chargeCode:'', chargeType: '', structure: 'total_price', chargeMode: '', payMode: '', currency: 'USD', rateUnit: 'container_type', priceGp20: '', priceGp40: '',priceHq40: '', priceHq45: '',priceNor20:'',priceNor40:'', price: '', disabled: true}
]
const defaultCreateQuery = {
  routeCode: undefined,
  polCode: '',  //起运港编码
  polCityCode: '',
  unloadingPortCode: '',  //卸货港编码
  podCode: '',  //目的港编码
  feederPolCode: '',  //收货地编码（驳船起运港）
  feederPolCityCode:'',
  transitPortCodes: '',  //中转港
  feederMatchMode: 'auto',  //驳船匹配方式
  bkgAgentId: '',  //订舱代理
  bkgAgent:'',
  sysLineCode: '',  //公司系统航线
  sysLineCname:'',
  carrierLineName: '',  //承运人航线
  carrierLineCode:'',//承运人航线编码
  carrierService: '',  //航线代码
  shipCarrierCode: '',  //船司
  beginDate: '',  //生效日-开始
  endDate: '',  //生效日-结束
  effectiveType: '',  //有效类别
  cargoLimited: '',  //限定货类
  sailingDate: '',  //开航日
  cutoffDate: '',  //截文件
  schedule: '',  //船期
  voyage: '',  //航程
  shipTerms: '',  //运输条款
  issueWay: [],  //出单方式
  telexFee: '',   // 电放费
  telexFeeCurrency: 'CNY',   // 电放费币别
  blType: '',  //提单类型
  mainRouteTransferMode:'', //中转方式
  recommendLevel: 'N', // 推荐标识
  blankSailing:  'N', // 停航标识
  allin: 'allin',  // ALLIN标识 默认关闭
  surchargeDesc: '',  // 附加费说明
  guidanceDesc: '',   // 收货指引
  weightDesc: '',   // 限重说明
  internalDesc: '', // 内部备注
  externalDesc: '', // 备注-外部备注
  pricer: '',   // 拿价人
  pricerName:'',
  publishStatus: undefined,  // 发布状态
  state:undefined,
  oceanFreightList: [],  // 海运费
  surchargeList: [], // 附加费
  attention: '',  // 特别提醒
  freeTimeDesc: '', // 免用免堆
  createdName:'',
  createdTime:'',
  updatedName:'',
  updatedTime:'',
  publishTime:'',
  polCityCode:'',
  maintainerId:'',
  maintainerName:'',
  issueWayDesc: '',
  podChargeDesc: ''
}
export default {
  mixins: [routerMixin],
  data() {
    return {
      loading: false,
      id: null,
      saveDisabled: false,
      suppShowState: false,
      oQuery: this.$route.query,
      polBoxShow:false,
      defaultStyle: {
        width: '100%'
      },
      currencyList:[],
      // polCodeBoxData:[],
      state: 'valid',
      // portDestinationAttribute:'',
      // 提交参数
      createItem: Object.assign({}, defaultCreateQuery),
      rules:{},
      fillPortCodes: '',
      // 普通箱型
      oceanFreightQuery: JSON.parse(JSON.stringify(oceanFreightQuery)),
      // 默认成本价
      defaultPrice: {
        currency: 'USD',
        priceGp20: '',
        priceGp40: '',
        priceHq40: '',
        priceHq45: '',
        priceNor20:'',
        priceNor40:'',
      },
      // 附加费弹窗
      surchargePopShow: false,
      cTimestamp: 0,
    }
  },
  created() {
    this.cTimestamp = new Date().getTime()
    this.init()
  },
  activated() {
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
      this.init()
    }
  },
  mounted() {
    // this.getInfo()
  },
  computed: {
    ...mapGetters([
      'userId','name','dictMap'
    ]),
    publishStatusOptions() {
      let publishStatusOptions = {}
      let {publishStatus} = this.dictMap
      publishStatus.forEach(item => {
        publishStatusOptions[item.value] = item.label
      })
      return publishStatusOptions
    }
  },
  watch: {
    $route: {
      handler(newVal, oldVal) {
        // console.log('route', this.$route)
        let query = this.$route.query
        if (this.id === query.id) {
          this.init()
        }
      },
      deep: true
    }
  },
  components: {
    EditFunc,
    MainRouteInfo,
    SurchargeTable,
    CustViewTip
  },
  methods: {
    init() {
      this.getCurrencyList()
      //初始化基本信息，补充信息， 拿价人信息
      this.createItem = Object.assign({}, defaultCreateQuery)
      this.createItem.routeId = this.$route.query.id
      this.createItem.pricer = this.userId
      this.createItem.pricerName = this.name
      this.oceanFreightQuery = JSON.parse(JSON.stringify(oceanFreightQuery))
      // console.log('this.oceanFreightQuery', this.oceanFreightQuery);
      this.$nextTick(() => {
        this.$refs.mainRouteSubmit.clearValidate()
        this.$refs.surchargeTable.getUserSurchargeList()
        this.$refs.surchargeTable.templateIdConfig.value = []
      })
      this.getInfo()
    },

    // 详情
    getInfo() {
      if (!this.$route.query.id) {
        this.checkContainerTypeInput()
        return 
      }
      this.loading = true
      let data = {
        routeId: Number(this.$route.query.id)
      }
      mainRouteInfo(data).then(response => {
        let infoData = response.data
        for (let i in defaultCreateQuery) {
          this.createItem[i] = infoData[i]
          if (i === 'issueWay') {
            this.createItem[i] = infoData[i] ? infoData[i].split(',') : []
          }
          if (i === 'telexFee') {
            this.createItem[i] = infoData[i] ? infoData[i] : '0'
          }
        }
        let {oceanFreightList} = infoData
        //币别统一为合计的币别
       this.oceanFreightQuery.forEach((o,index) => {
           o.currency=""
           oceanFreightList.forEach(item => {
            if (item.structure === o.structure) {
              Object.assign(o, item)
            }
          }) 
        })
        this.getInfoDetail(infoData)
      }).finally(()=>{
        this.loading = false
      })
    },
    getInfoDetail(infoData) {
      // 驳船收货地，中转港等多选下拉需转成数组格式
      let transitPortCodes = ""
      transitPortCodes = infoData.transitPort1Code ? infoData.transitPort1Code : ''
      transitPortCodes += infoData.transitPort2Code ? ',' + infoData.transitPort2Code : ''
      transitPortCodes += infoData.transitPort3Code ? ',' + infoData.transitPort3Code : ''
      if(transitPortCodes){
        this.createItem.transitPortCodes = transitPortCodes.split(',')
      }
      this.createItem.beginDate = [infoData.beginDate, infoData.endDate]
      let feederPolCodeVal = infoData.feederPolCode.toString()
      if (feederPolCodeVal) {
        this.createItem.feederPolCode = feederPolCodeVal.split(',')
      }
      // 港口反显
      let portCodeArr=[];
      infoData.polCode ? portCodeArr.push(infoData.polCode) : ""
      infoData.podCode ? portCodeArr.push(infoData.podCode) : ""
      infoData.feederPolCode ? portCodeArr.push(infoData.feederPolCode) : ""
      transitPortCodes ? portCodeArr.push(transitPortCodes) : ""
      infoData.unloadingPortCode ? portCodeArr.push(infoData.unloadingPortCode) : ""
      this.fillPortCodes = portCodeArr.join(",")
      this.checkContainerTypeInput()
      // 设置电放费默认值
      if (!this.createItem.telexFeeCurrency) {
        this.createItem.telexFeeCurrency = this.createItem.polCityCode === 'HKHKG' ? 'HKD' : 'CNY'
      }
      if (this.createItem.issueWay.includes('free_telex_release')) {
        this.createItem.telexFee = '0'
      }
    },

    // 币别下拉列表自动补充的数据
    getCurrencyList(queryString) {
      baseCurrencyList(queryString, 'valid', 'charge').then(response => {
        this.currencyList = response.data
      })
    },

    // 普通箱型的可输入和不可输入的判断
    checkContainerTypeInput() {
      if (!this.oceanFreightQuery.length) {
        return
      }

      // allin状态只能输入合计价格，基价和中转价默认显示
      if (this.createItem.allin === 'allin') {
        this.oceanFreightQuery.forEach((item, index) => {
          Vue.set(this.oceanFreightQuery, index, Object.assign(item, {
            disabled: false
          }))
          if (index <= 1) {
            Vue.set(this.oceanFreightQuery, index, Object.assign(item, {
              disabled: true
            }))
          }
        })
      } else {  // 关闭allin状态只能输入基价和中转价，合计价格默认显示
        this.oceanFreightQuery.forEach((item, index) => {
          Vue.set(this.oceanFreightQuery, index, Object.assign(item, {
            disabled: true
          }))
          if (index <= 1) {
            Vue.set(this.oceanFreightQuery, index, Object.assign(item, {
              disabled: false
            }))
          }
        })
      }
    },

    // 切换allin
    changeAllinState(val) {
      this.createItem.allin = val
      this.checkContainerTypeInput()
    },

    // 币别选择
    hadnleChangeCurrency() {
      const currency1 = this.oceanFreightQuery[0].currency
      const currency2 = this.oceanFreightQuery[1].currency

      // 关闭allin,基价和中转价的币别相同时，合计也设置为相同币别，并实时计算价格;不相同则合计设置为空
      if (this.createItem.allin === 'not_allin') {
        if (currency1 === currency2) {
          this.oceanFreightQuery[2].currency = currency1
          this.handleComputedPrice()
        } else {
          Object.assign(this.oceanFreightQuery[2], this.defaultPrice, {
            currency: ''
          })
        }
      }

    },

    // 填写价格
    hadnleChangePrice(val) {
      const currency1 = this.oceanFreightQuery[0].currency
      const currency2 = this.oceanFreightQuery[1].currency

      // 数字校验
      const reg = /^\d+(\.\d+)?$/
      if (!reg.test(val)) {
        return this.$message.warning('请输入数值')
      }

      // 关闭allin,基价和中转价的币别相同时，实时计算价格;不相同则合计设置为空
      if (this.createItem.allin === 'not_allin') {
        if (currency1 === currency2) {
          this.handleComputedPrice()
        } else {
          Object.assign(this.oceanFreightQuery[2], this.defaultPrice, {
            currency: ''
          })
        }
      }

    },

    // 实时计算合计价格
    handleComputedPrice() {
      let tempPriceGp20 = Number(this.oceanFreightQuery[0].priceGp20) + Number(this.oceanFreightQuery[1].priceGp20)
      let tempPriceGp40 = Number(this.oceanFreightQuery[0].priceGp40) + Number(this.oceanFreightQuery[1].priceGp40)
      let tempPriceHq40 = Number(this.oceanFreightQuery[0].priceHq40) + Number(this.oceanFreightQuery[1].priceHq40)
      let tempPriceHq45 = Number(this.oceanFreightQuery[0].priceHq45) + Number(this.oceanFreightQuery[1].priceHq45)
      let tempPriceNor20 = Number(this.oceanFreightQuery[0].priceNor20) + Number(this.oceanFreightQuery[1].priceNor20)
      let tempPriceNor40 = Number(this.oceanFreightQuery[0].priceNor40) + Number(this.oceanFreightQuery[1].priceNor40)

      this.oceanFreightQuery[2].priceGp20 = parseFloat(tempPriceGp20.toFixed(10)) ? parseFloat(tempPriceGp20.toFixed(10)) : ''
      this.oceanFreightQuery[2].priceGp40 = parseFloat(tempPriceGp40.toFixed(10)) ? parseFloat(tempPriceGp40.toFixed(10)) : ''
      this.oceanFreightQuery[2].priceHq40 = parseFloat(tempPriceHq40.toFixed(10)) ? parseFloat(tempPriceHq40.toFixed(10)) : ''
      this.oceanFreightQuery[2].priceHq45 = parseFloat(tempPriceHq45.toFixed(10)) ? parseFloat(tempPriceHq45.toFixed(10)) : ''
      this.oceanFreightQuery[2].priceNor20 = parseFloat(tempPriceNor20.toFixed(10)) ? parseFloat(tempPriceNor20.toFixed(10)) : ''
      this.oceanFreightQuery[2].priceNor40 = parseFloat(tempPriceNor40.toFixed(10)) ? parseFloat(tempPriceNor40.toFixed(10)) : ''
    },

    // 组装提交的数据
    getValues() { 
      // allin海运费只需要传合计价
      let oceanFreightList=[];
      if (this.createItem.allin === 'allin') {
        this.oceanFreightQuery.forEach((item, index) => {
           if(item.structure==='total_price'){
              oceanFreightList.push(item);           
           }
        })
      } 
      Object.assign(this.createItem, {
        oceanFreightList: oceanFreightList.length >0 ? oceanFreightList : this.oceanFreightQuery
      })
      delete(this.createItem.createdTime)
      delete(this.createItem.createdName)
      delete(this.createItem.updatedName)
      delete(this.createItem.updatedTime)
      //处理海运费 附加费为空数据
      this.createItem.surchargeList = this.$refs.surchargeTable.tableData
      this.dealChargeList();
      for(let key in this.createItem){
        this.createItem[key]=this.createItem[key]?this.createItem[key]:null
      }

      let results = Object.assign({}, this.createItem)
      console.log('this.createItem', this.createItem)
      // 特殊处理的数据，如：生效日期，驳船收货地，中转港等
      let {beginDate, feederPolCode, transitPortCodes} = this.createItem
      results.beginDate = beginDate ? beginDate[0] : ''
      results.endDate = beginDate ? beginDate[1] : ''
      results.feederPolCode = feederPolCode ? feederPolCode.toString() : ''
      results.transitPortCodes = transitPortCodes ? transitPortCodes.toString() : ''
      // 出单方式传字符串
      results.issueWay = results.issueWay.toString()
      return results
    },

    dealChargeList(){
      this.createItem.oceanFreightList.map(item=>{
        for(let key in item){
          item[key]=item[key]?item[key]:null
        }
      })
      this.createItem.surchargeList.map(item=>{
        for(let key in item){
          item[key]=item[key]?item[key]:null
        }
      })
    },
    // validate
    validate() {
      // let currency=''
      // let reg = /^[0-9]+$/
      // if (this.createItem.voyage === 0 || !reg.test(this.createItem.voyage)) {
      //   this.$message.error('航程请输入大于0的数字')
      //   return false
      // }
      // if (this.createItem.voyage > 100) {
      //   this.$message.error('航程输入不能大于100')
      //   return false
      // }
      // if(this.createItem.allin==='not_allin'){
      //   if(this.createItem.oceanFreightList[0].currency!=this.createItem.oceanFreightList[1].currency){
      //     this.$message.error("海运费币种不一致")
      //     return false
      //   }
      // }
      //如果目的地不是卸货地，并且卸货港为空时  必须输入卸货港
      if (!this.createItem.unloadingPortCode) {
        //如果卸货港为空时 
        let portDestinationAttribute = this.$refs.mainRouteInfo.portDestinationAttribute
        if(!portDestinationAttribute.includes('port_of_discharge')){
          this.$message.error('卸货港必填')
          return false
        }
      }

      for(let item of this.createItem.surchargeList) {
        if(!item.chargeCode){
          this.$message.warning('附加费费用名称不能为空')
          return false
        }
        if(!item.payMode){
          this.$message.warning('附加费付款方式不能为空')
          return false
        }
        if(!item.rateUnit){
          this.$message.warning('附加费计费单位不能为空')
          return false
        }
        if(item.rateUnit==='container_type'){
          if(!(item.priceGp20||item.priceGp40||item.priceHq40||item.priceHq45||item.priceNor20||item.priceNor40)){
            this.$message.warning('附加费费用金额不能为空')
            return false
          }
        }
        if(item.rateUnit!='container_type'){
          if(!item.price){
            this.$message.warning('附加费费用金额不能为空')
            return false
          }
        }
        if(!item.currency){
          this.$message.warning('附加费币种不能为空')
          return false
        }
      }
      return true
    },
    editFuncCallback(type) {
      // console.log('type', type);
      let fn = this["handle" + type]
      if (typeof fn !== "function") return
      fn()
    },

    // 保存-新增，编辑
    handleSave() {
      let {action} = this.$route.query
      return action === 'copy' ? this.handleAdd() : this.createItem.routeId ? this.handleEdit() : this.handleAdd()
    },

    handleAdd() {
      this.saveDisabled = true
      let data = this.getValues()
      // delete(data.routeId)
      delete(data.routeCode)
      delete(data.publishStatus)
      this.$refs.mainRouteSubmit.validate(valid => {
        if (valid) {
          if (!this.validate()) return this.saveDisabled = false
          //处理卸货地逻辑
          if(!this.createItem.unloadingPortCode){
            this.createItem.unloadingPortCode=this.createItem.podCode
          }
          //如果卸货港没有填，就和目的港相同
          if(!data.unloadingPortCode){
            data.unloadingPortCode=data.podCode
          } 
          data.feederPolCityCode=null
          mainRouteAdd(data).then(response => {
            this.$message({
              type: 'success',
              duration:1000,
              message: '保存成功',
              onClose: () => {
                this.saveDisabled = false
                this.id = response.data.routeId
                this.routerPush('MainRouteDetail', {
                  id: this.id
                })
              }
            })
          }).catch(err => {
            setTimeout(() => {
              this.saveDisabled = false
            }, 2000)
          })
        } else {
          this.$msgErrClose('红框内为必填项，请补充！')
          console.log('error submit')
          this.saveDisabled = false
          return false
        }
      })
    },

    handleEdit() {
      this.saveDisabled = true
      let data = this.getValues()
      delete(data.publishStatus)
      this.$refs.mainRouteSubmit.validate(valid => {
        if (valid) {
          if (!this.validate()) return this.saveDisabled = false
          //处理卸货地逻辑
          if(!this.createItem.unloadingPortCode){
            this.createItem.unloadingPortCode=this.createItem.podCode
          }
           //如果卸货港没有填，就和目的港相同
          if(!data.unloadingPortCode){
            data.unloadingPortCode=data.podCode
          } 
          mainRouteEdit(data).then(response => {
            this.$message({
              type: 'success',
              duration:1000, 
              message: '保存成功',
              onClose: () => {
                this.saveDisabled = false
                this.id = response.data.routeId
                this.routerPush('MainRouteDetail', {
                  id: this.id
                })
              }
            })
          }).catch(err => {
            setTimeout(() => {
              this.saveDisabled = false
            }, 2000)
          })
        } else {
          this.$msgErrClose('红框内为必填项，请补充！')
          console.log('error submit')
          this.saveDisabled = false
          return false
        }
      })
    },

    // 发布
    handlePublish() {
      this.saveDisabled = true
      let data = this.getValues()
      if(this.$route.query.action=='copy'){
        delete(data.routeId)
        delete(data.routeCode)
      }
      Object.assign(data, {
        publishStatus: 'published'
      })
      this.$refs.mainRouteSubmit.validate(valid => {
        if (valid) {
          if (!this.validate()) return this.saveDisabled = false
          //处理卸货地逻辑
          if(!this.createItem.unloadingPortCode){
            this.createItem.unloadingPortCode=this.createItem.podCode
          }
           //如果卸货港没有填，就和目的港相同
          if(!data.unloadingPortCode){
            data.unloadingPortCode=data.podCode
          } 
          if (data.routeId) {
            return mainRouteEdit(data).then(response => {
              this.$message({
                type: 'success',
                message: '发布成功',
                duration:1000,
                onClose: () => {
                  this.saveDisabled = false
                  this.$store.dispatch("tagsView/delView", this.$route);
                  this.$router.push({
                    path: 'mainRoute'
                  })
                }
              })
            }).catch(err => {
              setTimeout(() => {
                this.saveDisabled = false
              }, 2000)
            })
          }
          data.routeId=this.$route.query.id
          data.feederPolCityCode=null
          mainRouteAdd(data).then(response => {
            this.$message({
              type: 'success',
              message: '发布成功',
              duration:1000,
              onClose: () => {
                this.saveDisabled = false
                this.$store.dispatch("tagsView/delView", this.$route);
                this.$router.push({
                  path: 'mainRoute'
                })
              }
            })
          }).catch(err => {
            setTimeout(() => {
              this.saveDisabled = false
            }, 2000)
          })
        } else {
          this.$msgErrClose('红框内为必填项，请补充！')
          console.log('error submit')
          this.saveDisabled = false
          return false
        }
      })
    },

    // 失效
    handleInvalid() {
      this.saveDisabled = true
      mainRouteInvalidRoute({routeId: this.createItem.routeId}).then(response => {
        this.$message({
          type: 'success',
          message: '失效成功',
          duration:1000,
          onClose: () => {
            this.saveDisabled = false
            this.$router.replace({
              path: 'mainRoute'
            })
          }
        })
      }).catch(err => {
        setTimeout(() => {
          this.saveDisabled = false
        }, 2000)
      })
    },

    // 取消
    handleCancel() {
      this.$router.replace({
        path: 'mainRoute'
      })
    },
    initSystemLine(key){
      portSystemLineInfo(key).then(response => {
        let systemLineList=response.data
        if(systemLineList.length>0){
          let systemLine=systemLineList[0];
          this.baseInfoQuery.forEach((item, index) => {
            if (item.key === 'sysLineCode') {
              Object.assign(item, {
                value: systemLine.cname
              },{
              })
              Object.assign(this.createItem, {
                  sysLineCode: systemLine.sysLineCode
              })
              return 
            }
          })
        }
      })
    }
  }
}
</script>
<style lang="scss">
@import "../less/detail.scss";
.mainRoute-container .edit-row{
  margin-top: 8px;
  margin-bottom: 0;
}
.mainRoute-container .edit-row.box-row{
  margin: 10px 0;
  border: 1px solid #e9e9e9;
  border-radius: 4px;
}
.mainRoute-container .edit-row.box-row .row-tit{
  padding-left: 10px;
  padding-right: 10px;
  height: 32px;
  line-height: 32px;
  background: #F8F9FD;
}
.mainRoute-container .edit-row.box-row .row-tit.invalid{
  background-color: rgba(230, 57, 35, 0.1);
}
.mainRoute-container .edit-row.box-row .row-tit .tit{
  line-height: 32px;
  font-size: 14px;
  display: flex;
  .icon-custView {
    margin-left: 4px;
    margin-top: 9px;
    height: 14px;
    width: 14px;
    background: url('../../../../assets/icon-custView.png') center center no-repeat;
    background-size: cover;
    cursor: pointer;
  }
}
.mainRoute-container .edit-row.box-row .row-form{
  padding: 10px;
  .el-table{
    .el-input--mini .el-input__inner{
      line-height: 20px;
      height: 20px;
    }
    .el-input--mini .el-input__icon{
      line-height: 20px;
    }
  }
}
.mainRoute-container .edit-row.box-row .input-container{
  margin-top: 0;
}
.mainRoute-container .edit-row.box-row .input-container span.filter-txt{
  color:#606266;
}
.mainRoute-container .edit-row.box-row .input-container .el-input__inner{
  line-height: 20px;
  height: 20px;
}
.mainRoute-container .edit-row.box-row .row-tit-operate .el-button--mini{
  padding: 2px 5px;
}
.mainRoute-container .row-tit-mini{
  font-size: 14px;
  line-height: 32px;
  height: 32px;
  border-bottom: 1px solid #E9E9E9;
  padding-left: 10px;
}
.mainRoute-container .row-tit-mini .tit{
  line-height: 32px;
  font-size: 14px;
  color: #222;
  font-weight: 600;
}
.mainRoute-cont-form {
  padding: 0 0 10px 0;
  .edit-row.box-row{
    margin: 0 10px;
    &.surcharge-table{
      margin-top: 10px;
    }
    .desc-info-cont{
      margin: 10px 0 0 10px;
      .form-column {
        display: flex;
        flex-direction: column;
        .el-form-item__label {
          text-align: left;
        }
      }
    }
  }
}
.mainRoute-cont-form .el-form-item{
  margin-bottom: 4px;
  margin-right: 10px;
  // height: 20px;
}
.mainRoute-cont-form .el-form-item {
  .el-form-item__label{
    padding: 0 6px 0 0;
    line-height: 20px;
  }
  .el-form-item__content{
    line-height: 20px;
  }
  .el-input--mini {
    .el-input__inner{
      line-height: 20px;
      height: 20px;
    }
    .el-input__icon{
      line-height: 20px;
    }
  }
  .el-range-editor--mini{
    &.el-input__inner{
      height: 20px;
    }
    .el-range-separator{
      line-height: 12px;
    }
    .el-range__icon{
      line-height: 12px;
      font-size: 12px;
    }
  }
  .el-date-editor .el-input__prefix{
    line-height: 20px;
  }
}
.flex-item{
  position: relative;
}
.item-floate-box{
  position: absolute;
  width:90%;
  background-color:#DCDFE6;
  padding: 5px;
  border:1px solid #DCDFE6;
  margin-top:53px;
  z-index:999;
}

.item-floate-box-show{
  position: absolute;
  width:90%;
  height:28px;
  margin-top:24px;
  z-index:999
}
.mainRoute-container {
  .stop-box {
    height: 30px;
    background-color: rgb(255,244,242);
    color: rgb(205,65,48);
    display: flex;
    align-items: center;
    padding: 0 16px;
    .icon{
      width: 16px;
      height: 16px;
      line-height: 16px;
      text-align: center;
      border-radius: 2px;
      background-color:rgb(205,65,48);
      color: #fff;
      margin-right: 10px;
    }
  }
}

</style>
