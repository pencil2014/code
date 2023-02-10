<template>
  <div class="">
    <div class="row-cont-tit">
      <span class="tit">预计航程</span>
      <div class="row-cont-rt">
        <span class="expand" @click="handleTransportInfo"> {{ showTransportInfo ? '收起' : '展开' }}<i :class="showTransportInfo ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
      </div>
    </div>
    <div v-show="showTransportInfo" class="row-air-transport ">
      <el-row :gutter="10" style="margin-bottom:10px" class="transport-from">
        <el-col :lg="{span: '1-2'}">
          <div class="transport-info-title">航程</div>
        </el-col>
        <el-col :lg="{span: '3-8'}">
          <div class="transport-info-item">承运人</div>
        </el-col>
        <el-col :lg="{span: '3-8'}">
          <div class="transport-info-item">预计起飞日</div>
        </el-col>
        <el-col :lg="{span: '3-8'}">
          <div class="transport-info-item">预计到达日</div>
        </el-col>
        <el-col :lg="{span: '3-8'}">
          <div class="transport-info-item">预计航次号</div>
        </el-col>
        <el-col :lg="{span: '3-8'}">
          <div class="transport-info-item">起运港</div>
        </el-col>
        <el-col :lg="{span: '3-8'}">
          <div class="transport-info-item">目的地</div>
        </el-col>
        <el-col :sm="{span: '3-8'}">
          <div class="transport-info-item">运输方式</div>
        </el-col>
      </el-row>
      <div>
        <el-form label-width="0" ref="airTransportInfo" :model="transportInfoData" :show-message="false" :hide-required-asterisk="true">
          <div class="international-voyage" v-for="(el,index) in transportInfoData.formData" :key="index">

            <i class="el-icon-circle-plus-outline plus-minus-outline" @click="handleAddVoyage()" v-if="showBtn(index)"></i>
            <i class="el-icon-remove-outline plus-minus-outline" @click="handleDelVoyage(index)" v-if="showBtn(index)&&(transportInfoData.formData.length>2)"></i>
            <el-row v-if="businessType==='air_export'" :gutter="10" style="margin-bottom:10px" class="transport-from">
              <el-col :lg="{span: '1-2'}">
                <div class="transport-info-item-right" v-if="index>0">国际{{index}}程</div>
                <div class="transport-info-item-right" v-if="index===0">国内运输</div>
              </el-col>
              <el-col :lg="{span: '3-8'}">
                <div class="transport-info-item">
                  <el-form-item class="" :prop="'formData.'+index+'.carrierSupplierId'" :rules="transportInfoData.rules.carrierSupplierId">
                    <el-select style="width:100%" :disabled="disabledState" size="mini" clearable v-model="el.carrierSupplierId" filterable remote reserve-keyword placeholder="请选择航空公司" :remote-method="(val)=>{ remoteMethod(val,index,el.carrierSupplierId)}" @focus="(val)=>{ remoteMethod('',index,el.carrierSupplierId)}" @change="val => changeCarrier(val,index)">
                      <div class="air-line-option-title">
                        <div>IATA代码</div>
                        <div>全称</div>
                        <div>运单前缀</div>
                      </div>
                      <el-option v-for="(item,i) in el.airComnpanyArr||[]" :key="i" :label="item.label" :value="item.value">
                        <div class="air-line-option">
                          <div class="air-line-option-info">{{item.label}}</div>
                          <div class="air-line-option-info">{{item.cname}}</div>
                          <div class="air-line-option-info">{{item.carrierCode}}</div>
                        </div>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </el-col>
              <el-col :lg="{span: '3-8'}">
                <div class="transport-info-item">
                  <el-form-item class="" :prop="'formData.'+index+'.etdTime'" :rules="index===1?transportInfoData.rules.etdTime:null">
                    <elDatePickerLimit :field="'etdTime'+index" :disabled="disabledState || (finIsCloseStatus && index=== 1)" size="mini" v-model="el.etdTime" type="date" style="width: 100%" clearable placeholder="请选择预计起飞日期" value-format="yyyy-MM-dd" :picker-options="beginDate(el.etdTime,el.etaTime)" />
                  </el-form-item>
                </div>
              </el-col>
              <el-col :lg="{span: '3-8'}">
                <div class="transport-info-item">
                  <el-form-item class="" :prop="'formData.'+index+'.etaTime'" :rules="index===1?transportInfoData.rules.etaTime:null">
                    <elDatePickerLimit :disabled="disabledState" size="mini" v-model="el.etaTime" type="date" style="width: 100%" clearable placeholder="请选择预计到达日期" value-format="yyyy-MM-dd" :picker-options="endDate(el.etdTime,el.etaTime)" />
                  </el-form-item>
                </div>
              </el-col>
              <el-col :lg="{span: '3-8'}">
                <div class="transport-info-item">
                  <el-form-item class="" :prop="'formData.'+index+'.eflightNumber'" :rules="transportInfoData.rules.eflightNumber">
                    <el-input :disabled="disabledState" maxlength="64" v-model="el.eflightNumber" clearable placeholder="预计航次号" size="mini" style="width:100%"></el-input>
                  </el-form-item>
                </div>
              </el-col>
              <el-col :lg="{span: '3-8'}">
                <div class="transport-info-item">
                  <el-form-item class="" :prop="'formData.'+index+'.polPortCode'" :rules="transportInfoData.rules.polPortCode">
                    <el-select size="mini" :disabled="disabledState" style="width:100%" clearable v-model="el.polPortCode" filterable remote reserve-keyword placeholder="请选择起运港" @change="portChange(el.polPortCode,el.polPortArr,index,'polPortName')" :remote-method="(val)=>{ polPortRemoteMethod(val,index,el.polPortCode)}" @focus="polPortRemoteMethod('',index,el.polPortCode)">
                      <el-option v-for="(item,a) in el.polPortArr||[]" :key="a" :label="item.label" :value="item.value" :disabled="el.unloadingPortCode === item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </el-col>
              <el-col :lg="{span: '3-8'}">
                <div class="transport-info-item">
                  <el-form-item class="" :prop="'formData.'+index+'.unloadingPortCode'" :rules="transportInfoData.rules.unloadingPortCode">
                    <el-select style="width:100%" :disabled="disabledState" size="mini" clearable v-model="el.unloadingPortCode" filterable remote reserve-keyword placeholder="请选择目的地" @change="portChange(el.unloadingPortCode,el.unloadingPortArr,index,'unloadingPortName')" :remote-method="(val)=>{ unloadingPortMethod(val,index,el.unloadingPortCode)}" @focus="unloadingPortMethod('',index,el.unloadingPortCode)">
                      <el-option v-for="(item,b) in el.unloadingPortArr||[]" :key="b" :label="item.label" :value="item.value" :disabled="el.polPortCode === item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </el-col>
              <el-col :sm="{span: '3-8'}" v-if="index===0">
                <div class="transport-info-item">
                  <el-form-item class="" :prop="'formData.'+index+'.transportMode'">
                    <el-select style="width:100%" :disabled="disabledState" size="mini" clearable v-model="el.transportMode" placeholder="请选择运输方式">
                      <el-option v-for="(item,b) in dictMap.airTransportMode" :key="b" :label="item.label" :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </el-col>
            </el-row>
            <el-row v-else :gutter="10" style="margin-bottom:10px" class="transport-from">
              <el-col :lg="{span: '1-2'}">
                <div class="transport-info-item-right" v-if="index<transportInfoData.formData.length-1">国际{{index+1}}程</div>
                <div class="transport-info-item-right" v-if="index===transportInfoData.formData.length-1">国内运输</div>
              </el-col>
              <el-col :lg="{span: '3-8'}">
                <div class="transport-info-item">
                  <el-form-item class="" :required="formIsRequired(index)" :prop="'formData.'+index+'.carrierSupplierId'" :rules="transportInfoData.rules.carrierSupplierId">
                    <el-select style="width:100%" :disabled="disabledState" size="mini" clearable v-model="el.carrierSupplierId" filterable remote reserve-keyword placeholder="请选择航空公司" :remote-method="(val)=>{ remoteMethod(val,index,el.carrierSupplierId)}" @focus="(val)=>{ remoteMethod('',index,el.carrierSupplierId)}" @change="val => changeCarrier(val,index)">
                      <div class="air-line-option-title">
                        <div>IATA代码</div>
                        <div>全称</div>
                        <div>运单前缀</div>
                      </div>
                      <el-option v-for="(item,i) in el.airComnpanyArr||[]" :key="i" :label="item.label" :value="item.value">
                        <div class="air-line-option">
                          <div class="air-line-option-info">{{item.label}}</div>
                          <div class="air-line-option-info">{{item.cname}}</div>
                          <div class="air-line-option-info">{{item.carrierCode}}</div>
                        </div>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </el-col>
              <el-col :lg="{span: '3-8'}">
                <div class="transport-info-item">
                  <el-form-item class="" :required="formIsRequired(index)" :prop="'formData.'+index+'.etdTime'" :rules="null">
                    <elDatePickerLimit :field="'etdTime'+index+1" :disabled="disabledState" size="mini" v-model="el.etdTime" type="date" style="width: 100%" clearable placeholder="请选择预计起飞日期" value-format="yyyy-MM-dd" :picker-options="beginDate(el.etdTime,el.etaTime)" />
                  </el-form-item>
                </div>
              </el-col>
              <el-col :lg="{span: '3-8'}">
                <div class="transport-info-item">
                  <el-form-item class="" :required="formIsRequired(index)" :prop="'formData.'+index+'.etaTime'" :rules="null">
                    <elDatePickerLimit :disabled="disabledState || finIsCloseStatus" size="mini" v-model="el.etaTime" type="date" style="width: 100%" clearable placeholder="请选择预计到达日期" value-format="yyyy-MM-dd" :picker-options="endDate(el.etdTime,el.etaTime)" />
                  </el-form-item>
                </div>
              </el-col>
              <el-col :lg="{span: '3-8'}">
                <div class="transport-info-item">
                  <el-form-item class="" :required="formIsRequired(index)" :prop="'formData.'+index+'.eflightNumber'" :rules="transportInfoData.rules.eflightNumber">
                    <el-input :disabled="disabledState" maxlength="64" v-model="el.eflightNumber" clearable placeholder="预计航次号" size="mini" style="width:100%"></el-input>
                  </el-form-item>
                </div>
              </el-col>
              <el-col :lg="{span: '3-8'}">
                <div class="transport-info-item">
                  <el-form-item class="" :required="formIsRequired(index)" :prop="'formData.'+index+'.polPortCode'" :rules="transportInfoData.rules.polPortCode">
                    <el-select size="mini" :disabled="disabledState" style="width:100%" clearable v-model="el.polPortCode" filterable remote reserve-keyword placeholder="请选择起运港" @change="portChange(el.polPortCode,el.polPortArr,index,'polPortName')" :remote-method="(val)=>{ polPortRemoteMethod(val,index,el.polPortCode)}" @focus="polPortRemoteMethod('',index,el.polPortCode)">
                      <el-option v-for="(item,a) in el.polPortArr||[]" :key="a" :label="item.label" :value="item.value" :disabled="el.unloadingPortCode === item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </el-col>
              <el-col :lg="{span: '3-8'}">
                <div class="transport-info-item">
                  <el-form-item class="" :required="formIsRequired(index)" :prop="'formData.'+index+'.unloadingPortCode'" :rules="transportInfoData.rules.unloadingPortCode">
                    <el-select style="width:100%" :disabled="disabledState" size="mini" clearable v-model="el.unloadingPortCode" filterable remote reserve-keyword placeholder="请选择目的地" @change="portChange(el.unloadingPortCode,el.unloadingPortArr,index,'unloadingPortName')" :remote-method="(val)=>{ unloadingPortMethod(val,index,el.unloadingPortCode)}" @focus="unloadingPortMethod('',index,el.unloadingPortCode)">
                      <el-option v-for="(item,b) in el.unloadingPortArr||[]" :key="b" :label="item.label" :value="item.value" :disabled="el.polPortCode === item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </el-col>
              <el-col :sm="{span: '3-8'}" v-if="index===transportInfoData.formData.length-1">
                <div class="transport-info-item">
                  <el-form-item class="" :required="formIsRequired(index)" :prop="'formData.'+index+'.transportMode'">
                    <el-select style="width:100%" :disabled="disabledState" size="mini" clearable v-model="el.transportMode" placeholder="请选择运输方式">
                      <el-option v-for="(item,b) in dictMap.airTransportMode" :key="b" :label="item.label" :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-form>
        <!-- <el-button @click="validateForm">校验</el-button> -->
      </div>
    </div>
  </div>

</template>

<script>
import { mapState } from 'vuex'
import { getCarrier } from '@/api/airTransport/order'
const dateObj = {
  formData: [
    {
      carrierSupplierId: '',
      carrierSupplierName: '',
      etdTime: '',
      etaTime: '',
      eflightNumber: '',
      polPortCode: '',
      polPortName: '',
      unloadingPortCode: '',
      unloadingPortName: '',
      voyageType: '预计',
      voyageSort: '0',
      transportMode: ''
    },
    {
      carrierSupplierId: '',
      carrierSupplierName: '',
      etdTime: '',
      etaTime: '',
      eflightNumber: '',
      polPortCode: '',
      polPortName: '',
      unloadingPortCode: '',
      unloadingPortName: '',
      voyageType: '预计',
      voyageSort: '1',
      transportMode: ''
    }
  ]
}
export default {
  data() {
    return {
      state: 'valid',
      pickerOptions: {
        disabledDate(date) {
          return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
        }
      },
      oQuery: this.$route.query,
      tradeTermsCode: ['DDP', 'DDU'],
      activeName: 'first',
      showTransportInfo: true,
      airPortArr: [], // 详情也已经选好的港口
      unloadingPort: [],
      airLineArr: [] // 航空公司
    }
  },
  props: {
    orderStatus: {
      type: String,
      default: ''
    },
    transportInfoData: {
      type: Object,
      default: () => dateObj
    },
    isPricing: {
      type: Boolean,
      default: false
    },
    pricingAuditEmployeeDisabled: {
      type: Boolean,
      default: false
    },
    businessType: {
      type: String,
      default: ''
    },
    isOp: {
      type: Boolean,
      default: false
    },
    orderBookInfoData: {
      type: Object,
      default: () => {}
    }
  },
  model: {
    prop: 'transportInfoData',
    event: 'update'
  },
  watch: {
    'orderBookInfoData.etdTime': {
      handler: function (val) {
        // 1.订单详情的预计起飞时间，需自动带入预计的国际1程里
        if (this.businessType === 'air_export') {
          if (val) {
            if (
              !(
                this.transportInfoData.formData[1].etdTime &&
                this.airOrderInfo.planVoyageList[1] &&
                this.airOrderInfo.planVoyageList[1].etdTime
              )
            ) {
              this.$set(this.transportInfoData.formData[1], 'etdTime', val)
            }
          } else {
            if (
              (this.airOrderInfo.planVoyageList[1] &&
                !this.airOrderInfo.planVoyageList[1].etdTime) ||
              this.airOrderInfo.planVoyageList.length === 0
            ) {
              this.$set(this.transportInfoData.formData[1], 'etdTime', '')
            }
          }
        }
      },
      immediate: true
    },
    'orderBookInfoData.airLine': {
      handler: function (val) {
        // 1.订单详情的预计航空公司，需自动带入预计的国际1程里
        if (this.businessType === 'air_export') {
          if (
            !(
              this.transportInfoData.formData[1].carrierSupplierId &&
              this.airOrderInfo.planVoyageList[1] &&
              this.airOrderInfo.planVoyageList[1].carrierSupplierId
            )
          ) {
            if (val) {
              this.$store
                .dispatch('dict/aircarrierList', { carrierName: val })
                .then((data) => {
                  let list = data.map((ele) => {
                    return Object.assign(ele, {
                      value: ele.carrierId,
                      label: `${ele.itat}`
                    })
                  })
                  this.$set(
                    this.transportInfoData.formData[1],
                    'carrierSupplierId',
                    list[0].value
                  )
                  this.$set(
                    this.transportInfoData.formData[1],
                    'airComnpanyArr',
                    list
                  )
                })
            } else {
              if (
                (this.airOrderInfo.planVoyageList[1] &&
                  !this.airOrderInfo.planVoyageList[1].carrierSupplierId) ||
                this.airOrderInfo.planVoyageList.length === 0
              ) {
                this.$set(
                  this.transportInfoData.formData[1],
                  'carrierSupplierId',
                  null
                )
              }
            }
          }
        }
      },
      immediate: true
    },
    'orderBookInfoData.polPortCode': {
      handler: function (val) {
        // 起运港
        if (this.businessType === 'air_export') {
          if (
            !(
              this.transportInfoData.formData[1].polPortCode &&
              this.airOrderInfo.planVoyageList[1] &&
              this.airOrderInfo.planVoyageList[1].polPortCode
            )
          ) {
            if (val) {
              this.$store
                .dispatch('dict/airportList', {
                  portName: '',
                  portCodes: val,
                  state: this.state
                })
                .then((data) => {
                  console.log(val)
                  let list = data.map((ele) => {
                    return Object.assign(ele, {
                      value: ele.portCode,
                      label: `${ele.portCode} (${ele.ename}-${ele.cname})`
                    })
                  })
                  this.$set(
                    this.transportInfoData.formData[1],
                    'polPortCode',
                    list[0].value
                  )
                  this.$set(
                    this.transportInfoData.formData[1],
                    'polPortName',
                    list[0].cname
                  )
                  this.$set(
                    this.transportInfoData.formData[1],
                    'polPortArr',
                    list
                  )
                })
            } else {
              if (
                (this.airOrderInfo.planVoyageList[1] &&
                  !this.airOrderInfo.planVoyageList[1].polPortCode) ||
                this.airOrderInfo.planVoyageList.length === 0
              ) {
                this.$set(this.transportInfoData.formData[1], 'polPortCode', '')
                this.$set(this.transportInfoData.formData[1], 'polPortName', '')
              }
            }
          }
        }
      },
      immediate: true
    },
    'orderBookInfoData.podPortCode': {
      handler: function (val) {
        // 起运港
        if (this.businessType === 'air_export') {
          if (
            !(
              this.transportInfoData.formData[1].unloadingPortCode &&
              this.airOrderInfo.planVoyageList[1] &&
              this.airOrderInfo.planVoyageList[1].unloadingPortCode
            )
          ) {
            if (val) {
              this.$store
                .dispatch('dict/airportList', {
                  portName: '',
                  portCodes: val,
                  state: this.state
                })
                .then((data) => {
                  console.log(val)
                  let list = data.map((ele) => {
                    return Object.assign(ele, {
                      value: ele.portCode,
                      label: `${ele.portCode} (${ele.ename}-${ele.cname})`
                    })
                  })
                  this.$set(
                    this.transportInfoData.formData[1],
                    'unloadingPortCode',
                    list[0].value
                  )
                  this.$set(
                    this.transportInfoData.formData[1],
                    'unloadingPortName',
                    list[0].cname
                  )
                  this.$set(
                    this.transportInfoData.formData[1],
                    'unloadingPortArr',
                    list
                  )
                })
            } else {
              if (
                (this.airOrderInfo.planVoyageList[1] &&
                  !this.airOrderInfo.planVoyageList[1].unloadingPortCode) ||
                this.airOrderInfo.planVoyageList.length === 0
              ) {
                this.$set(
                  this.transportInfoData.formData[1],
                  'unloadingPortCode',
                  ''
                )
                this.$set(
                  this.transportInfoData.formData[1],
                  'unloadingPortName',
                  ''
                )
              }
            }
          }
        }
      },
      immediate: true
    }
  },
  created() {
    this.transportInfoData.rules = {
      etdTime: [{ required: true, message: '请选择', trigger: 'change' }],
      etaTime: [{ required: true, message: '请选择', trigger: 'change' }]
    }
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      roles: (state) => state.user.roles,
      airOrderInfo: (state) => state.airTransport.airOrderInfo,
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole
    }),
    finIsCloseStatus() {
      // 放开已关账、已完成的限制 
      // return this.airOrderInfo.finCloseStatus === 'yes'
      return false
    },
    disabledState() {
      if (this.isOp) {
        return (
          !['pass'].includes(this.orderStatus) ||
          this.pricingAuditEmployeeDisabled
        )
      }
      return (
        !['draft', 'refuse', 'submit'].includes(this.orderStatus) ||
        this.pricingAuditEmployeeDisabled
      )
    }
  },
  components: {},
  methods: {
    formIsRequired(index) {
      if (index == 0) {
        if (
          (this.transportInfoData.formData[index].carrierSupplierId &&
            this.transportInfoData.formData[index].etaTime &&
            this.transportInfoData.formData[index].etdTime &&
            this.transportInfoData.formData[index].eflightNumber &&
            this.transportInfoData.formData[index].polPortCode &&
            this.transportInfoData.formData[index].unloadingPortCode) ||
          (!this.transportInfoData.formData[index].carrierSupplierId &&
            !this.transportInfoData.formData[index].etaTime &&
            !this.transportInfoData.formData[index].etdTime &&
            !this.transportInfoData.formData[index].eflightNumber &&
            !this.transportInfoData.formData[index].polPortCode &&
            !this.transportInfoData.formData[index].unloadingPortCode)
        ) {
          return false
        } else {
          return true
        }
      } else {
        if (
          (this.transportInfoData.formData[index].carrierSupplierId &&
            this.transportInfoData.formData[index].etaTime &&
            this.transportInfoData.formData[index].etdTime &&
            this.transportInfoData.formData[index].eflightNumber &&
            this.transportInfoData.formData[index].polPortCode &&
            this.transportInfoData.formData[index].unloadingPortCode &&
            this.transportInfoData.formData[index].transportMode) ||
          (!this.transportInfoData.formData[index].carrierSupplierId &&
            !this.transportInfoData.formData[index].etaTime &&
            !this.transportInfoData.formData[index].etdTime &&
            !this.transportInfoData.formData[index].eflightNumber &&
            !this.transportInfoData.formData[index].polPortCode &&
            !this.transportInfoData.formData[index].unloadingPortCode &&
            !this.transportInfoData.formData[index].transportMode)
        ) {
          return false
        } else {
          return true
        }
      }
    },
    showBtn(index) {
      if (!this.disabledState) {
        if (this.businessType === 'air_export') {
          if (index > 0) {
            return true
          } else {
            return false
          }
        } else {
          if (index < this.transportInfoData.formData.length - 1) {
            return true
          } else {
            return false
          }
        }
      } else {
        return false
      }
    },
    portChange(val, portArr, index, prop) {
      // 港口名字回选
      if (!val) {
        this.$set(this.transportInfoData.formData[index], prop, '')
      } else {
        let list = portArr || []
        for (let i = 0; i < list.length; i++) {
          if (val == list[i].portCode) {
            let airPortName = `${list[i].cname}`
            this.$set(this.transportInfoData.formData[index], prop, airPortName)
          }
        }
      }
    },
    beginDate(sTime, eTime) {
      return {
        disabledDate(time) {
          if (eTime) {
            //如果结束时间不为空，则小于结束时间
            return new Date(eTime).getTime() < time.getTime()
          } else {
            return false
            // return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
          }
        }
      }
    },
    endDate(sTime, eTime) {
      return {
        disabledDate(time) {
          if (sTime) {
            //如果开始时间不为空，则结束时间大于开始时间
            return new Date(sTime).getTime() - 8.64e7 > time.getTime()
          } else {
            return false
            // return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
          }
        }
      }
    },
    validateForm() {
      // 表单验证
      return new Promise((resolve, reject) => {
        this.$refs.airTransportInfo.validate((valid) => {
          if (valid) {
            resolve()
          } else {
            reject()
          }
        })
      })
    },
    clearValidate() {
      this.$refs.airTransportInfo.clearValidate()
    },
    remoteMethod(val, index, id) {
      // 远程搜索航空公司
      this.$store
        .dispatch('dict/aircarrierList', { carrierName: val })
        .then((data) => {
          let list = data.map((ele) => {
            return Object.assign(ele, {
              value: ele.carrierId,
              label: `${ele.itat}`
            })
          })
          let found = list.find((ele) => ele.carrierId === id)
          if (id && !found && !val) {
            getCarrier({
              carrierId: id
            }).then((res) => {
              let activeList = []
              console.log(res.data)
              if (res.data) {
                activeList.push(res.data)
              }

              let arr = activeList.map((ele) => {
                return Object.assign(ele, {
                  value: ele.carrierId,
                  label: `${ele.itat}`
                })
              })
              this.$set(
                this.transportInfoData.formData[index],
                'airComnpanyArr',
                [...arr, ...list]
              )
            })
          } else {
            this.$set(
              this.transportInfoData.formData[index],
              'airComnpanyArr',
              [...list]
            )
          }
        })
    },
    changeCarrier(val, index) {
      // 航空公司修改
      if (
        this.transportInfoData.formData[index].airComnpanyArr &&
        this.transportInfoData.formData[index].airComnpanyArr.length
      ) {
        let obj = this.transportInfoData.formData[index].airComnpanyArr.find(
          (el) => el.carrierId === val
        )
        if (obj) {
          this.transportInfoData.formData[index].carrierSupplierName = obj.itat
        }
      } else {
        this.transportInfoData.formData[index].carrierSupplierName = ''
      }
    },
    polPortRemoteMethod(el, index, code) {
      // 远程搜索起运港
      this.airPortSearch(el, '', this.state, 'polPort', index, code)
    },
    unloadingPortMethod(el, index, code) {
      // 目的地
      this.airPortSearch(el, '', this.state, 'unloading', index, code)
    },
    // 空运港口
    airPortSearch(portName, portCodes, state, type, index, code) {
      this.$store
        .dispatch('dict/airportList', { portName, portCodes, state })
        .then((data) => {
          let portList = data.map((ele) => {
            return Object.assign(ele, {
              value: ele.portCode,
              label: `${ele.portCode} (${ele.ename}-${ele.cname})`
            })
          })
          let found = portList.find((ele) => ele.portCode === code)
          if (code && !found && !portName) {
            // 当前港口选中 && 选中值不在默认30条中 && 模糊搜索没有值
            this.$store
              .dispatch('dict/airportList', {
                portName: '',
                portCodes: code,
                state: this.state
              })
              .then((res) => {
                let activePort = res.map((ele) => {
                  return Object.assign(ele, {
                    value: ele.portCode,
                    label: `${ele.portCode} (${ele.ename}-${ele.cname})`
                  })
                })
                if (type === 'polPort') {
                  this.$set(
                    this.transportInfoData.formData[index],
                    'polPortArr',
                    [...activePort, ...portList]
                  )
                } else {
                  this.$set(
                    this.transportInfoData.formData[index],
                    'unloadingPortArr',
                    [...activePort, ...portList]
                  )
                }
              })
          } else {
            if (type === 'polPort') {
              this.$set(this.transportInfoData.formData[index], 'polPortArr', [
                ...portList
              ])
            } else {
              this.$set(
                this.transportInfoData.formData[index],
                'unloadingPortArr',
                [...portList]
              )
            }
          }
        })
    },
    handleAddVoyage() {
      // 增加国际航线
      if (this.transportInfoData.formData.length >= 4) {
        this.$message({
          message: '预计国际航程最多只能添加3个',
          type: 'warning'
        })
        return
      }
      let obj = {
        carrierSupplierId: '',
        carrierSupplierName: '',
        etdTime: '',
        etaTime: '',
        eflightNumber: '',
        polPortCode: '',
        polPortName: '',
        unloadingPortCode: '',
        unloadingPortName: '',
        voyageType: '预计',
        voyageSort: '',
        transportMode: ''
      }
      if (this.businessType === 'air_export') {
        this.transportInfoData.formData.push(obj)
      } else {
        this.transportInfoData.formData.splice(
          this.transportInfoData.formData.length - 1,
          0,
          obj
        )
      }
    },
    handleDelVoyage(index) {
      // 删除国际航线
      this.transportInfoData.formData.splice(index, 1)
    },
    handleTransportInfo() {
      this.showTransportInfo = !this.showTransportInfo
    }
  }
}
</script>

<style lang="scss">
// .transportInfo {
//   border: 1px solid #e9e9e9;
//   border-radius: 4px;
//   overflow: hidden;
//   .row-cont-tit {
//     background: #f8f9fd;
//     border-radius: 4px 4px 0 0;
//     height: 32px;
//     line-height: 32px;
//     .row-cont-rt {
//       font-size: 12px;
//       float: right;
//       padding-right: 12px;
//       cursor: pointer;
//     }
//     .tit {
//       font-size: 14px;
//       font-weight: 700;
//       padding-left: 12px;
//     }
//   }
// }
.row-air-transport {
  padding: 10px;
  overflow: hidden;
  background: #fff;
  .el-form-item {
    margin-bottom: 0;
    .el-form-item__content {
      line-height: 20px;
    }
  }
  .transport-from {
    width: 95%;
  }
  .transport-info-title {
    font-size: 12px;
    font-weight: 600;
    color: #222222;
    line-height: 16px;
    text-align: right;
  }
  .transport-info-item {
    font-size: 12px;
    font-weight: 400;
    color: #4a4a4a;
    line-height: 16px;
  }
  .transport-info-item-right {
    font-size: 12px;
    font-weight: 400;
    color: #4a4a4a;
    line-height: 16px;
    text-align: right;
  }
}
.el-col-lg-1-2 {
  width: 70px;
}
.el-col-lg-3-8 {
  width: calc((100% - 70px) / 7);
}
.international-voyage {
  .btn-plus-search,
  .btn-minus-search {
    float: right;
    margin-top: 3px;
  }
  .btn-minus-search {
    margin-right: 6px;
  }
}
</style>
