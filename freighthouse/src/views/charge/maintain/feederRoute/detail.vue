<template>
  <div class="edit-container feederRoute-container">
    <EditFunc 
      ref="editFunc" 
      :saveDisabled="saveDisabled" 
      :createItem="createItem" 
      :publishStatusOptions="publishStatusOptions" 
      @callback="editFuncCallback"/>
    <div class="edit-row">
      <div class="row-tit-mini">
        <span class="tit">基本信息</span>
      </div>
      <el-form ref="routeSubmit" :model="createItem" :rules="rules" class="feederRoute-cont-form" label-width="110px">
        <RouteInfo :createItem="createItem" :fillPortCodes="fillPortCodes" ref="routeInfo"/>
        <div class="edit-row box-row">
          <div class="row-tit"   :class="createItem.state === 'invalid'&&!(($route.query.action==='copy'&&$route.query.id)||!$route.query.id) ? 'invalid' : ''">
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
                    size="mini" v-model="scope.row.currency"  filterable  
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
                  <el-input size="mini" placeholder="请输入金额" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" v-model="scope.row.priceGp20" :disabled="scope.row.disabled" clearable></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="priceGp40" label="40GP" align="center">
                <template slot-scope="scope">
                  <el-input size="mini" placeholder="请输入金额" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" v-model="scope.row.priceGp40" :disabled="scope.row.disabled" clearable></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="priceHq40" label="40HQ" align="center">
                <template slot-scope="scope">
                  <el-input size="mini" placeholder="请输入金额" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" v-model="scope.row.priceHq40" :disabled="scope.row.disabled" clearable></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="priceHq45" label="45HQ" align="center">
                <template slot-scope="scope">
                  <el-input size="mini" placeholder="请输入金额" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" v-model="scope.row.priceHq45" :disabled="scope.row.disabled" clearable></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="priceNor20" label="20NOR" align="center">
                <template slot-scope="scope">
                  <el-input size="mini" placeholder="请输入金额" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" v-model="scope.row.priceNor20" :disabled="scope.row.disabled" clearable></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="priceNor40" label="40NOR" align="center">
                <template slot-scope="scope">
                  <el-input size="mini" placeholder="请输入金额" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" v-model="scope.row.priceNor40" :disabled="scope.row.disabled" clearable></el-input>
                </template>
              </el-table-column>
              
            </el-table>
          </div>
        </div>
        <SurchargeTable :surchargeList="createItem.surchargeList" ref="surchargeTable"/>
      </el-form>
    </div>
  </div>

</template>
<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import {routerMixin} from '@/views/finance/mixins/routerMixin'
import {feederRouteAdd, feederRouteEdit, feederRouteInfo, feederRouteInvalid} from '@/api/charge'
import {basePortList,baseCurrencyList,basePortListByCodes,portSystemLineInfo} from '@/api/base'
import EditFunc from './components/editFunc'
import RouteInfo from './components/routeInfo'
import SurchargeTable from './components/surchargeTable'
const oceanFreightQuery = [
  {chargeCode:'', chargeType: '', structure: 'basic_price', chargeMode: '', payMode: '', currency: 'USD', rateUnit: 'container_type', priceGp20: '', priceGp40: '',priceHq40: '', priceHq45: '',priceNor20:'',priceNor40:'', price: ''}
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
  maintainerId:'',
  maintainerName:'',
}
export default {
  mixins: [routerMixin],
  data() {
    return {
      id: null,
      state: 'valid',
      portDestinationAttribute:'',
      saveDisabled: false,
      suppShowState: false,
      oQuery: this.$route.query,

      defaultStyle: {
        width: '100%'
      },
      sysLineDisabled:false,
      currencyList:[],
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
        priceNor40:''
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
  mounted() {
    // this.init()
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
  watch: {
    $route: {
      handler(newVal, oldVal) {
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
    RouteInfo,
    SurchargeTable
  },
  methods: {
    init() {
      this.createItem = Object.assign({}, defaultCreateQuery)
      this.createItem.routeId = this.$route.query.id
      this.oceanFreightQuery = JSON.parse(JSON.stringify(oceanFreightQuery))
      this.$nextTick(() => {
        this.$refs.routeSubmit.clearValidate()
        this.$refs.surchargeTable.templateIdConfig.value = []
        this.$refs.routeInfo.sysLineDisabled = false
      })
      this.getCurrencyList()
      this.getInfo()
    },
    // 币别下拉列表自动补充的数据
    getCurrencyList(queryString) {
      baseCurrencyList(queryString, 'valid', 'charge').then(response => {
        this.currencyList = response.data
      })
    },
    // 详情
    getInfo() {
      if (!this.$route.query.id) return
      feederRouteInfo({routeId: Number(this.$route.query.id)}).then(response => {
        let infoData = response.data
        for (let i in this.createItem) {
          this.createItem[i] = infoData[i]
        }
        if(infoData.oceanFreightList.length>0){
          this.oceanFreightQuery = infoData.oceanFreightList
        }
        // console.log('this.oceanFreightQuery', this.oceanFreightQuery)
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
        if (item.key === 'maintainerId') {
          Object.assign(item, {
              value: this.createItem.maintainerName
           })
        }
      })
      let portCodeArr=[];
      infoData.polCode?portCodeArr.push(infoData.polCode):""
      infoData.podCode?portCodeArr.push(infoData.podCode):""
      infoData.feederPolCode?portCodeArr.push(infoData.feederPolCode):""
      let portCodes=portCodeArr.join(",")
      this.$store.dispatch('dict/basePortListByCodes', {portCodes}).then(data => {
        let initPortData=[]
        //初始化下拉框数据 
        let results=new Map()
        initPortData=data
        data.map(item => {
          let obj={}
          obj.label=item.label
          obj.portAttribute=item.portAttribute
          results.set(item.value,obj)
          // results.set(item.portCode,`${item.ename}(${item.cname}${item.cityCname ? ',' + item.cityCname : ''}${item.countryName ? ',' + item.countryName : ''})`, obj)
        })
        this.baseInfoQuery.forEach((item, index) => {
          // 起运港、目的港、收货地、中转港、系统航线反显
            if (item.key === 'polCode') {
              Object.assign(item, {
                data:initPortData,
                disabled:this.$route.query.action!='copy'
              })
              // Object.assign(item, {
              //   value:results.get(infoData.polCode)
              // },{
              //   disabled:this.$route.query.action!='copy'
              // })
            }
            if (item.key === 'podCode') {

              this.portDestinationAttribute=results.get(infoData.podCode)?results.get(infoData.podCode)['portAttribute']:"";
              Object.assign(item, {
                data:initPortData,
              })
              // this.portDestinationAttribute=results.get(infoData.podCode)['portAttribute']
              // Object.assign(item, {
              //   value:results.get(infoData.podCode),
              //   data: initPortList
              // })
            }
            if (item.key === 'feederPolCode') {
              Object.assign(item, {
                data:initPortData
              })
              // Object.assign(item, {
              //   value:results.get(infoData.feederPolCode)
              // },
              // {
              //   disabled:this.$route.query.action!='copy'
              // })
            }
            if (item.key === 'shipCarrierCode') {
              Object.assign(item,{
                disabled:this.$route.query.action!='copy'
              })
            }
          })
       })
    },

    // 组装提交的数据
    getValues() { 
      Object.assign(this.createItem, {
        oceanFreightList: this.oceanFreightQuery
      })
      delete(this.createItem.feederVoyage)
      delete(this.createItem.createdTime)
      delete(this.createItem.createdName)
      delete(this.createItem.updatedName)
      delete(this.createItem.updatedTime)
      for(let key in this.createItem){
        this.createItem[key]=this.createItem[key]?this.createItem[key]:null
      }
      //处理海运费 附加费为空数据
      this.createItem.surchargeList = this.$refs.surchargeTable.tableData
      this.dealChargeList()
      let results = Object.assign({}, this.createItem)
      let {beginDate, feederPolCode, transitPortCodes} = this.createItem
      results.beginDate = beginDate ? beginDate[0] : ''
      results.endDate = beginDate ? beginDate[1] : ''
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
      this.$refs.routeSubmit.validate(valid => {
        if (valid&&this.validate()) {
           if (data.routeId) {
            return feederRouteEdit(data).then(response => {
              this.$message({
                type: 'success',
                message: '发布成功',
                duration:1000, 
                onClose: () => {
                  this.saveDisabled = false
                  this.$store.dispatch("tagsView/delView", this.$route);
                  this.$router.push({
                    path: 'feederRoute'
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
          feederRouteAdd(data).then(response => {
            this.$message({
              type: 'success',
              message: '发布成功',
              duration:1000, 
              onClose: () => {
                this.saveDisabled = false
                this.$store.dispatch("tagsView/delView", this.$route);
                this.$router.push({
                  path: 'feederRoute'
                })
              }
            })
          }).catch(err => {
            setTimeout(() => {
              this.saveDisabled = false
            }, 2000)
          })
        } else {
          console.log('error submit')
          this.saveDisabled = false
          return false
        }
      })
    },

    // 失效
    handleInvalid() {
      this.saveDisabled = true
      feederRouteInvalid({routeId: this.createItem.routeId}).then(response => {
        this.$message({
          type: 'success',
          message: '失效成功',
           duration:1000, 
          onClose: () => {
            this.saveDisabled = false
            // window.location.reload()
            this.$router.replace({
              path: 'feederRoute'
            })
          }
        })
      }).catch(err => {
        setTimeout(() => {
          this.saveDisabled = false
        }, 2000)
      })
    },

    // validate
    validate() {
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
      return true;
    },

    editFuncCallback(type) {
      console.log('type', type);
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
      delete(data.routeCode)
      delete(data.publishStatus)
      this.$refs.routeSubmit.validate(valid => {
        if (valid&&this.validate()) {
          feederRouteAdd(data).then(response => {
            this.$message({
              type: 'success',
              message: '保存成功',
              duration:1000, 
              onClose: () => {
                this.saveDisabled = false
                this.id = response.data.routeId
                this.routerPush('FeederRouteDetail', {
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
      this.$refs.routeSubmit.validate(valid => {
        if (valid&&this.validate()) {
          feederRouteEdit(data).then(response => {
            this.$message({
              type: 'success',
              message: '保存成功',
              duration:1000, 
              onClose: () => {
                this.saveDisabled = false
                this.id = response.data.routeId
                this.routerPush('FeederRouteDetail', {
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
          console.log('error submit')
          this.saveDisabled = false
          return false
        }
      })
    },

    // 取消
    handleCancel() {
      this.$router.replace({
        path: 'feederRoute'
      })
    }

  }
}
</script>
<style lang="scss">
@import "../less/detail.scss";
.feederRoute-container .edit-row{
  margin-top: 8px;
  margin-bottom: 0;
}
.feederRoute-container .edit-row.box-row{
  margin: 10px 0;
  border: 1px solid #e9e9e9;
  border-radius: 4px;
}
.feederRoute-container .edit-row.box-row .row-tit{
  padding-left: 10px;
  padding-right: 10px;
  height: 32px;
  line-height: 32px;
  background: #F8F9FD;
}
.feederRoute-container .edit-row.box-row .row-tit.invalid{
  background-color: rgba(230, 57, 35, 0.1);
}
.feederRoute-container .edit-row.box-row .row-tit .tit{
  line-height: 32px;
  font-size: 14px;
}
.feederRoute-container .edit-row.box-row .row-form{
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
.feederRoute-container .edit-row.box-row .input-container{
  margin-top: 0;
}
.feederRoute-container .edit-row.box-row .input-container span.filter-txt{
  color:#606266;
}
.feederRoute-container .edit-row.box-row .input-container .el-input__inner{
  line-height: 20px;
  height: 20px;
}
.feederRoute-container .edit-row.box-row .row-tit-operate .el-button--mini{
  padding: 2px 5px;
}
.feederRoute-container .row-tit-mini{
  font-size: 14px;
  line-height: 32px;
  height: 32px;
  border-bottom: 1px solid #E9E9E9;
  padding-left: 10px;
}
.feederRoute-container .row-tit-mini .tit{
  line-height: 32px;
  font-size: 14px;
  color: #222;
  font-weight: 600;
}
.feederRoute-cont-form {
  padding: 10px 0 10px 10px;
}
.feederRoute-cont-form .el-form-item{
  margin-bottom: 4px;
  margin-right: 10px;
}
.feederRoute-cont-form .el-form-item {
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