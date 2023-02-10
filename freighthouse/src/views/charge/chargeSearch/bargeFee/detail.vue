<template>
  <div class="edit-container bargeFeeDetail-container">
    <EditFunc 
      ref="editFunc"
      :createItem="createItem" 
      :publishStatusOptions="publishStatusOptions" 
      @callback="editFuncCallback"/>
    <div class="edit-row">
      <div class="row-tit-mini">
        <span class="tit">基本信息</span>
      </div>
      <el-form ref="routeSubmit" :model="createItem" :rules="rules" class="bargeFeeDetail-cont-form" label-width="110px">
        <RouteInfo :createItem="createItem" :fillPortCodes="fillPortCodes" ref="routeInfo"/>
        <div class="edit-row box-row">
          <div class="row-tit" :class="createItem.state === 'invalid'&&!(($route.query.action==='copy'&&$route.query.id)||!$route.query.id) ? 'invalid' : ''">
            <span class="tit">
              普通箱型
              <span v-if="createItem.state === 'invalid'&&!(($route.query.action==='copy'&&$route.query.id)||!$route.query.id)">(<em class="redFont">{{publishStatusOptions[createItem.state]}}</em>)</span>
            </span>
          </div>
          <div class="row-form">
            <el-table class="boxType-table" highlight-current-row ref="oceanFreightTable" style="width: 100%" :data="oceanFreightQuery">
              <!-- <el-table-column prop="structure" label="箱型" align="center">
                <template>金额</template>
              </el-table-column> -->
              <el-table-column prop="currency" label="币别" align="center">
                <template slot-scope="scope">
                  <el-select
                    size="mini" v-model="scope.row.currency" filterable disabled
                    placeholder="币别"
                    >
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
                  <el-input size="mini" 
                  oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" 
                  v-model="scope.row.priceGp20" disabled clearable></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="priceGp40" label="40GP" align="center">
                <template slot-scope="scope">
                  <el-input size="mini" 
                  oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" 
                  v-model="scope.row.priceGp40" disabled clearable></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="priceHq40" label="40HQ" align="center">
                <template slot-scope="scope">
                  <el-input size="mini" 
                  oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" 
                  v-model="scope.row.priceHq40" disabled clearable></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="priceHq45" label="45HQ" align="center">
                <template slot-scope="scope">
                  <el-input size="mini" 
                  oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" 
                  v-model="scope.row.priceHq45" disabled clearable></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="priceNor20" label="20NOR" align="center">
                <template slot-scope="scope">
                  <el-input size="mini" 
                  oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" 
                  v-model="scope.row.priceNor20" disabled clearable></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="priceNor40" label="40NOR" align="center">
                <template slot-scope="scope">
                  <el-input size="mini" 
                  oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" 
                  v-model="scope.row.priceNor40" disabled clearable></el-input>
                </template>
              </el-table-column>
              
            </el-table>
          </div>
        </div>
        <SurchargeTable :surchargeList="createItem.surchargeList" />
      </el-form>
    </div>
    <div class="water-mark-box"></div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import {routerMixin} from '@/views/finance/mixins/routerMixin'
import {feederRouteAdd, feederRouteEdit, feederRouteInfo, feederRouteInvalid} from '@/api/charge'
import {basePortList,baseCurrencyList,basePortListByCodes} from '@/api/base'
import EditFunc from './components/editFunc'
import RouteInfo from './components/routeInfo'
import SurchargeTable from './components/surchargeTable'
import watermark from '@/utils/watermark'
const oceanFreightQuery = [
  {chargeCode:'', chargeType: '', structure: 'basic_price', chargeMode: '', payMode: '', currency: 'USD', rateUnit: 'container_type', priceGp20: '', priceGp40: '',priceHq40: '', priceHq45: '', price: ''}
]
const defaultCreateQuery = {
  routeCode: undefined,
  feederPolCode: '',  //起运港编码
  podCode: '',  //目的港编码
  polCode: '',  //大船起运港编码
  receiptArea: '',  //收货区域
  sysLineCode: '',  //系统航线
  sysLineCname:'',
  bkgAgent: '',  //订舱代理
  shipCarrierCode: '',  //船公司
  feederVoyage: '',  //驳船航程
  beginDate: '',  //生效日-开始
  endDate: '',  //生效日-结束
  feederSchedule: '',  //船期
  remark: '',  //备注
  oceanFreightList: [],  // 海运费
  surchargeList: [], // 附加费
  publishStatus: undefined,
  state: undefined,
  createdName:'',
  createdTime:'',
  updatedName:'',
  updatedTime:'',
  publishTime:'',
  transferMode:'',
}
export default {
  mixins: [routerMixin],
  data() {
    return {
      state: '',
      oQuery: this.$route.query,

      defaultStyle: {
        width: '100%'
      },
      currencyList:[],
      // 提交参数
      createItem: Object.assign({}, defaultCreateQuery),
      rules:{},
      fillPortCodes: '',
      // 基础信息
      baseInfoQuery: [
        {label: '驳船收货地', key: 'feederPolCode', type: 'autocomplete',required: true, value: '', disabled:true, querySearch: (queryString, cb) => {
          this.polQuerySearch(queryString, 'port_of_feeder', this.state, cb)
        }, change: (val) => {
          Object.assign(this.createItem, {
            feederPolCode: val
          })
        }, select: (item) => {
          Object.assign(this.createItem, {
            feederPolCode: item.key
          })
        }},

        {label: '大船起运港', key: 'polCode', type: 'autocomplete',disabled:true, required: true, value: '', querySearch: (queryString, cb) => {
          this.polQuerySearch(queryString, 'port_of_basic', this.state, cb)
        }, change: (val) => {
          Object.assign(this.createItem, {
            polCode: val
          })
        }, select: (item) => {
          Object.assign(this.createItem, {
            polCode: item.key
          })
        }},

        {label: '收货区域', key: 'receiptArea', disabled:true,type: 'input', value: ''},
        {label: '目的地', key: 'podCode',disabled:true, type: 'autocomplete', value: '', querySearch: (queryString, cb) => {
          this.polQuerySearch(queryString, 'port_of_destination', this.state, cb)
        }, change: (val) => {
          Object.assign(this.createItem, {
            podCode: val
          })
        }, select: (item) => {
          Object.assign(this.createItem, {
            podCode: item.key
          })
        }},

        {label: '船公司', key: 'shipCarrierCode',disabled:true, type: 'autocomplete', required: true, value: '', querySearch: (queryString, cb) => {
          this.shipQuerySearch(queryString, cb)
        }, change: (val) => {
          Object.assign(this.createItem, {
            shipCarrierCode: val
          })
        }, select: (item) => {
          Object.assign(this.createItem, {
            shipCarrierCode: item.key
          })
        }},

        {label: '系统航线', key: 'sysLineCode',disabled:true, type: 'autocomplete', required: true, value: '', querySearch: (queryString, cb) => {
          this.sysLineQuerySearch(queryString, cb)
        }, change: (val) => {
          Object.assign(this.createItem, {
            sysLineCode: val
          })
        }, select: (item) => {
          Object.assign(this.createItem, {
            sysLineCode: item.key
          })
        }},

        {label: '驳船预计开船时间',disabled:true, key: 'feederSchedule', type: 'input', value:'', placeholder: '请输入船期格式为：2/1'},

        {label: '生效日期',disabled:true, key: 'beginDate', type: 'date', required: true, value: '', category: 'daterange', format: 'yyyy-MM-dd'},
        {label: '中转方式',disabled:true, key: 'transferMode', type: 'select', value: '', data: []}
      ],
      // 普通箱型
      oceanFreightQuery: JSON.parse(JSON.stringify(oceanFreightQuery)),
      // 默认成本价
      defaultPrice: {
        currency: 'USD',
        priceGp20: '',
        priceGp40: '',
        priceHq40: '',
        priceHq45: ''
      },
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
  computed: {
    ...mapGetters([
      'dictMap'
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
  components: {
    EditFunc,
    RouteInfo,
    SurchargeTable
  },
  methods: {
    init() {
      this.createItem = Object.assign({}, defaultCreateQuery)
      this.createItem.routeId = this.$route.query.id
      this.$nextTick(() => {
        this.$refs.routeSubmit.clearValidate()
      })
      this.getCurrencyList()
      this.getInfo()
    },
   // 币别下拉列表自动补充的数据
    getCurrencyList(queryString) {
      baseCurrencyList(queryString, '', 'charge').then(response => {
        this.currencyList = response.data
      })
    },
    // 详情
    getInfo() {
      feederRouteInfo({routeId: Number(this.createItem.routeId)}).then(response => {
        let infoData = response.data
        for (let i in this.createItem) {
          this.createItem[i] = infoData[i]
        }
        infoData.oceanFreightList.forEach((item, index) => {
          Object.assign(this.oceanFreightQuery[index], item)
        })
        console.log(this.oceanFreightQuery);
        this.getInfoDetail(infoData)
      })
    },
    getInfoDetail(infoData) {
      this.createItem.beginDate = [infoData.beginDate, infoData.endDate]
      // 港口反显
      let portCodeArr=[];
      infoData.polCode ? portCodeArr.push(infoData.polCode) : ""
      infoData.podCode ? portCodeArr.push(infoData.podCode) : ""
      infoData.feederPolCode ? portCodeArr.push(infoData.feederPolCode) : ""
      this.fillPortCodes = portCodeArr.join(",")
    },
    // 获取基本信息详情
    getBaseInfoDetail(infoData) {
      this.baseInfoQuery.forEach((item, index) => {
        item.value = this.createItem[item.key]
        if (item.key === 'beginDate') {
          item.value = [this.createItem.beginDate, this.createItem.endDate]
        }
        if (item.key === 'sysLineCode') {
          Object.assign(item, {
              value: this.createItem.sysLineCname
           })
        }
      })
       let portCodeArr=[];
       infoData.polCode?portCodeArr.push(infoData.polCode):""
       infoData.podCode?portCodeArr.push(infoData.podCode):""
       infoData.feederPolCode?portCodeArr.push(infoData.feederPolCode):""
       let results=new Map();
       basePortListByCodes(portCodeArr.join(",")).then(response => {
         let initPortList=response.data
         initPortList.forEach((item, index) => {
          results.set(item.portCode,`${item.ename}(${item.cname}${item.cityCname ? ',' + item.cityCname : ''}${item.countryName ? ',' + item.countryName : ''})`)
        })
        this.baseInfoQuery.forEach((item, index) => {
          // 起运港、目的港、收货地、中转港、系统航线反显
            if (item.key === 'polCode') {
              Object.assign(item, {
                value:results.get(infoData.polCode)
              },{
                disabled:true
              })
            }
            if (item.key === 'podCode') {
              Object.assign(item, {
                  value:results.get(infoData.podCode)
              })
               disabled:true
            }
            if (item.key === 'feederPolCode') {
              Object.assign(item, {
                value:results.get(infoData.feederPolCode)
              },
              {
                disabled:true
              })
            }
             if (item.key === 'shipCarrierCode') {
              Object.assign(item,{
                disabled:this.oQuery.action!='copy'
              })
               disabled:true
            }
          })
       })
    },

    // 币别选择
    hadnleChangeCurrency() {
    },

    editFuncCallback(type) {
      console.log('type', type);
      let fn = this["handle" + type]
      if (typeof fn !== "function") return
      fn()
    },

    // 取消
    handleCancel() {
      this.$router.replace({
        path: 'bargeFee' 
      })
    },
    // 渲染水印
    reloadWathermark () {
      // 删除之前的水印
      document.querySelector('.water-mark-box').innerHTML = ''
      // 重新渲染水印
      let userInfo = this.$store.state.user.userInfo
      let { deptName, userName, mobileNo = '', employeeNo } = userInfo
      let text = `${userName}_${employeeNo}`
      watermark({
        watermark_txt: text, 
        className:'water-mark-box', 
        watermark_zindex: 6, 
      })
    }
  },
  mounted() {
    // 初始化水印
    this.reloadWathermark()
    // 监听缩放重新渲染水印
    window.addEventListener('resize', this.reloadWathermark)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.reloadWathermark)
  },
}
</script>
<style scoped lang="scss">
.bargeFeeDetail-container {
  user-select: none;
}
</style>
<style lang="scss">
@import "../less/detail.scss";
.bargeFeeDetail-container .edit-row{
  margin-top: 8px;
  margin-bottom: 0;
}
.bargeFeeDetail-container .edit-row.box-row{
  margin: 10px 0;
  border: 1px solid #e9e9e9;
  border-radius: 4px;
}
.bargeFeeDetail-container .edit-row.box-row .row-tit{
  padding-left: 10px;
  padding-right: 10px;
  height: 32px;
  background: #F8F9FD;
}
.bargeFeeDetail-container .edit-row.box-row .row-tit.invalid{
  background-color: rgba(230, 57, 35, 0.1);
}
.bargeFeeDetail-container .edit-row.box-row .row-tit .tit{
  line-height: 32px;
  font-size: 14px;
}
.bargeFeeDetail-container .edit-row.box-row .row-form{
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
.bargeFeeDetail-container .edit-row.box-row .input-container{
  margin-top: 0;
}
.bargeFeeDetail-container .edit-row.box-row .input-container span.filter-txt{
  color:#606266;
}
.bargeFeeDetail-container .edit-row.box-row .input-container .el-input__inner{
  line-height: 28px;
  height: 28px;
}
.bargeFeeDetail-container .row-tit-mini{
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  line-height: 32px;
  height: 32px;
  border-bottom: 1px solid #E9E9E9;
  padding-left: 10px;
}
.bargeFeeDetail-container .row-tit-mini .tit{
  line-height: 32px;
  font-size: 14px;
  color: #222;
  font-weight: 600;
}
.bargeFeeDetail-container .row-tit-mini .row-tit-label{
  font-size: 12px;
  margin-left: 40px;
  margin-right: 10px;
}
.bargeFeeDetail-container .row-tit-mini .row-tit-label em {
  color: #3e80f5;
  margin-left: 5px;
  font-style: normal;
}
.bargeFeeDetail-cont-form {
  padding: 10px 0 10px 10px;
}
.bargeFeeDetail-cont-form .el-form-item{
  margin-bottom: 4px;
  margin-right: 10px;
}
.bargeFeeDetail-cont-form .el-form-item {
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
}
</style>