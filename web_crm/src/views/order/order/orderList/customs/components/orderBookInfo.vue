<template>
  <div class="">
    <div class="customs-orderbook-info-table">
      <div class="table-td">
        <div class="cont" :class="this.isOp ? 'op-cont' : this.isBd ? 'bd-cont' : ''">
          <div class="h1">
            <span class="label">港口信息</span>
          </div>
          <div class="flex-form-item label90">
            <el-form-item label="起运港" prop="ship.polPortCode" :show-message="false">
              <div class="port-flex-form">
                <div class="port-code">
                  <el-select key="polPortCode" size="mini" v-model="createItem.ship.polPortCode" filterable clearable :disabled="disabledState" style="width: 100%" placeholder="请输入" :filter-method="polPortFilterMehod" @visible-change="polPortVisibleChange" @change="handleChangePolPortCode">
                    <el-option v-for="item in polPortList" :disabled="item.value===createItem.ship.podPortCode" :key="item.value" :label="item.value" :value="item.value">
                      <span>{{ item.label }}</span>
                    </el-option>
                  </el-select>
                </div>
                <PortPopover :portItem="polPortItem" />
              </div>
            </el-form-item>
            <el-form-item label="目的地" prop="ship.podPortCode" :show-message="false">
              <div class="port-flex-form">
                <div class="port-code">
                  <el-select size="mini" v-model="createItem.ship.podPortCode" filterable clearable :disabled="disabledState && isView" style="width: 100%" placeholder="请输入" :filter-method="podPortFilterMehod" @visible-change="podPortVisibleChange" @change="handleChangePodPortCode">
                    <el-option v-for="item in podPortList" :disabled="item.value===createItem.ship.polPortCode" :key="item.value" :label="item.value" :value="item.value">
                      <span>{{ item.label }}</span>
                    </el-option>
                  </el-select>
                </div>
                <PortPopover :portItem="podPortItem" />
              </div>
            </el-form-item>
            <el-form-item :required="true" label="码头" prop="barge.porPortCode" :show-message="false">
              <div class="port-flex-form">
                <div class="port-code">
                  <el-select key="porPortCode" size="mini" v-model="createItem.barge.porPortCode" filterable clearable :disabled="disabledState" style="width: 100%" placeholder="请输入" :filter-method="porPortFilterMehod" @visible-change="porPortVisibleChange" @change="handleChangePorPortCode">
                    <el-option v-for="item in porPortList" :key="item.value" :label="item.value" :value="item.value">
                      <span>{{ item.label }}</span>
                    </el-option>
                  </el-select>
                </div>
                <PortPopover :portItem="porPortItem" />
              </div>
            </el-form-item>
            <el-form-item label="口岸" :show-message="false">
              <el-input type="text" clearable size="mini" placeholder="请输入" v-model="createItem.barge.portName" disabled></el-input>
            </el-form-item>
            <el-form-item v-if="['st27', 'st28'].includes(this.orderInfoDataObj.serviceType)" label="起运国" :show-message="false">
              <el-input type="text" clearable size="mini" placeholder="请输入" v-model="createItem.ship.polCountryCname" disabled></el-input>
            </el-form-item>
            <el-form-item v-if="['st26', 'st28'].includes(this.orderInfoDataObj.serviceType)" label="目的国" :show-message="false">
              <el-input type="text" clearable size="mini" placeholder="请输入" v-model="createItem.ship.podPortCountryCname" disabled></el-input>
            </el-form-item>
          </div>
        </div>
      </div>

      <div class="table-td">
        <div class="cont" :class="this.isOp ? 'op-cont' : this.isBd ? 'bd-cont' : ''">
          <div class="h1">
            <span class="label">货运信息</span>
          </div>
          <div class="flex-form-item label100" :class="!disabledState ? 'pr24' : ''">
            <el-form-item label="报关方式" prop="transport.customsType" :required="true" :show-message="false">
              <el-select v-model="createItem.transport.customsType" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
                <el-option v-for="item in customsTypeArr" :label="item.label" :value="item.value" :key="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-for="(item,index) in customsNumberList" :key="index" :class="{'is-error':customsNumberIsRequired&&isChangCustoms}" label="报关单号" prop="transport.customsNumber" :show-message="false" :required="index===0">
              <span slot="label">报关单号{{index+1}}</span>
              <div class="port-flex-form">
                <div style="width: 100%">
                   <el-input clearable size="mini" placeholder="请输入" maxlength="64" @change="isChangCustoms=true" style="width: 100%" v-model="customsNumberList[index]" :disabled="disabledState"></el-input>
                </div>
                <i class="el-icon-circle-plus-outline" @click="handleAddCustomsNumber" v-if="!disabledState"></i>
                <i class="el-icon-remove-outline" @click="handleDelCustomsNumber(index)" v-if="!disabledState && customsNumberList.length>1"></i>
              </div>
            </el-form-item>
            <el-form-item class="timeSpecial" label="申报日期" :required="true" prop="transport.customsDate" :show-message="false">
              <elDatePickerLimit size="mini" v-model="createItem.transport.customsDate" type="date" style="width: 100%" clearable :popper-class="'hideMinute'" placeholder="请选择" format="yyyy-MM-dd" value-format="yyyy-MM-dd" :disabled="disabledState" />
            </el-form-item>
            <el-form-item class="bizDate" label="业务日期" prop="bizDate" :show-message="false" v-if="isOpView">
              <elDatePickerLimit size="mini" :style="{
                  width: showChangeBizDate ? 'calc(100% - 47px)' : '100%',
                  marginRight: showChangeBizDate ? '5px' : '0'
                }" v-model="createItem.bizDate" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" :disabled="true" />
              <el-button v-if="showChangeBizDate" @click="handleChangeBizDate" size="mini">修改</el-button>
            </el-form-item>
            <el-form-item label="委托备注" prop="intrustRemark" :show-message="false">
              <el-input type="textarea" rows="4" size="mini" maxlength="512" show-word-limit placeholder="请输入" v-model="createItem.intrustRemark" :disabled="disabledState"> </el-input>
            </el-form-item>
            <el-form-item label="备注" prop="bdRemark" :show-message="false" v-if="$route.query.source !== 'jointList'">
              <el-input class="loadingBdRemark" type="textarea" clearable rows="4" size="mini" placeholder="请输入" maxlength="512" show-word-limit v-model="createItem.bdRemark" @blur="handleSaveRemark" :disabled="!bdRemarkState"></el-input>
            </el-form-item>
          </div>
        </div>
      </div>
    </div>

    <div v-if="auditVisible">
      <AuditRemark :auditRemark="createItem.auditRemark" @close="auditClose" />
    </div>
    <div v-if="sendMailPopShow">
      <Mail :orderInfoData="orderInfoData" @close="sendMailPopClose" />
    </div>
    <div v-if="changeBizDateShow">
      <!-- <ChangeBizDatePop @close="changeBizDateClose" :bizDate="createItem.bizDate"></ChangeBizDatePop> -->
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import {
  portSystemLineInfo,
  baseSystemLineInfo,
  baseDeptSettleList
} from '@/api/base'
import { mainRouteFreeTime } from '@/api/charge'
import PortPopover from '../../components/portPopover'
import Schedule from '../../components/schedule'
import AuditRemark from '@/views/order/order/orderList/components/auditRemark'
import Mail from '../../components/noDropSendMail.vue'
import VesselSelect from '@/views/order/order/components/vesselSelect'
import VoyageSelect from '@/views/order/order/components/voyageSelect'
// import ChangeBizDatePop from '@/views/airTransport/order/orderList/components/changeBizDatePop'
import { bizdateChange } from '@/api/order/list'

export default {
  data() {
    return {
      customsTypeArr: [
        {
          label: '正常报关',
          value: 'zc'
        },
        {
          label: '买单报关',
          value: 'md'
        }
      ],
      auditVisible: false,
      changeBizDateShow: false,
      bizDateModify: this.$store.state.order.orderInfoDataObj.bizDateModify,
      transitPortOneShow: false,
      transitPortTwoShow: false,
      porPortItem: {},
      polPortItem: {},
      roLoadingPortItem: {},
      roArrivalPortItem: {},
      unloadPortItem: {},
      podPortItem: {},
      transitPortItem: {},
      transitPortItem1: {},
      transitPortItem2: {},
      podPortList: [],
      unloadPortList: [],
      porPortList: [],
      polPortList: [],
      roLoadingPortList: [],
      roArrivalPortList: [],
      transitPortList: [],
      transitPortList1: [],
      transitPortList2: [],
      selectListData: [], // 已选中的下拉数据
      state: 'valid',
      isEdit: false,
      oQuery: this.$route.query,
      sysLineName: '',
      transitPortOptions: [],
      transportTermOptions: [],
      // portList: [],
      pickerOptions: {
        disabledDate(date) {
          //disabledDate 文档上：设置禁用状态，参数为当前日期，要求返回 Boolean
          // return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
        }
      },
      tradeTermsCode: ['DDP', 'DDU'],
      cityName: '',
      shipCarrierOptions: [],
      vesselTime: {},
      vesselTimeParam: {}, // 保存船期请求后的传参
      sendMailPopShow: false,
      orderInfoData: {},
      isOnlineOptions: [
        { label: '线上', value: 'Y' },
        { label: '线下', value: 'N' }
      ],
      payCompanyOptions: [],
      isChangCustoms:false
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
    orderStatus: {
      type: String,
      default: ''
    },
    sysLineCname: {
      type: String,
      default: ''
    },
    containerTotal: {
      type: Object,
      default: () => ({})
    },
    customsNumberList:{
      type:Array,
      default:()=>{
        return []
      }
    }
  },
  created() {
    this.fillPolPort(this.fillPortCodes)
    this.getCompanyList()
  },
  mounted() {
    if (!this.createItem.transport.transportTerm) {
      this.$set(this.createItem.transport, 'transportTerm', 'CY/CY')
    }
    // if(!this.createItem.ship.freetimeSys){
    // 	this.$set(this.createItem.ship,'freetimeSys','无需求')
    // }
    console.log(
      '🚀 ~ this.createItem.ship.transitPortCode',
      this.createItem.ship.transitPortCode
    )
  },

  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      ordDetRole: (state) => state.order.orderList.ordDetRole,
      userEditRoles: (state) => state.order.orderList.userEditRoles,
      orderInfoDataObj: (state) => state.order.orderInfoDataObj
    }),
    customsNumberIsRequired(){
      let customsNumberList =[]
      for(let i=0;i<this.customsNumberList.length;i++){
        if(this.customsNumberList[i]){
          customsNumberList.push(this.customsNumberList[i])
        }
      }
      this.$set(this.createItem.transport,'customsNumber',customsNumberList.join())
      if(!customsNumberList.length){
        return true
      }else{
        return false
      }
    },
    showChangeBizDate() {
      if (
        this.ordDetRole === 'op' &&
        this.orderInfoDataObj.orderStatus !== 'complete' &&
        this.orderInfoDataObj.finCloseStatus !== 'yes'
      ) {
        return true
      } else {
        return false
      }
    },
    isEcs() {
      return this.ordDetRole === 'ecs'
    },
    disabledState() {
      return this.isOp || this.isView
    },
    isTrackDisabled() {
      return this.isView
    },
    isAc() {
      return this.ordDetRole === 'ac'
    },
    isOpEdit() {
      return this.ordDetRole === 'op_truck' && this.orderStatus === 'pass'
    },
    isOp() {
      // bd,审核通过的视角同op的一样
      if (this.ordDetRole === 'bd' && this.orderStatus === 'pass') {
        return true
      }
      // op,doc,ac视角一致
      if (this.ordDetRole === 'op_truck' && this.orderStatus !== 'pass') {
        return true
      }
      return false
    },
    // 操作视图
    isOpView() {
      return (
        (this.isBd && ['pass', 'break', 'cancel'].includes(this.orderStatus)) ||
        this.isAc ||
        !this.ordDetRole ||
        this.ordDetRole === 'op_truck'
      )
    },
    isBd() {
      return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
    },
    isView() {
      // doc，ac,op_truck角色，或者是协同单的都置灰,只读
      if (
        !this.ordDetRole ||
        this.isAc ||
        this.$route.query.source === 'jointList'
      ) {
        return true
      }
      // bd角色，除了草稿和拒绝状态的都置灰，只读
      if (this.isBd && !['draft', 'refuse'].includes(this.orderStatus)) {
        return true
      }
      // op角色，除了审核通过的都置灰
      if (this.isOp && !['pass'].includes(this.orderStatus)) {
        return true
      }
      return false
    },
    isJoint() {
      return this.$route.query.source === 'jointList'
    },
    show() {
      return (
        this.createItem.transport.tradeTermsCode &&
        this.tradeTermsCode.includes(
          this.createItem.transport.tradeTermsCode.toUpperCase()
        )
      )
    },
    shipObj() {
      return this.$store.state.order.orderInfoDataObj.ship || {}
    },
    bdRemarkState() {
      if (['draft', 'refuse', 'pass', 'complete'].includes(this.orderStatus)) {
        return true
      }
      return false
    },
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
    }
  },
  components: {
    PortPopover,
    Schedule,
    Mail,
    VesselSelect,
    VoyageSelect,
    ChangeBizDatePop,
    AuditRemark
  },
  methods: {
    //保存编辑备注
    handleSaveRemark() {
      this.$emit('saveRemark')
    },
    handleDelCustomsNumber(index){
      this.customsNumberList.splice(index,1)
    },
    handleAddCustomsNumber(){
      this.customsNumberList.push('')
    },
    // 去除必填项的首尾空字符串
    handleClearEmptyString(char, e) {
      if (['destinationArea', 'deliveryPlace'].includes(char)) {
        this.$set(
          this.createItem.transport,
          char,
          e.target.value.replace(/^\s+|\s+$/g, '')
        )
      } else {
        this.$set(
          this.createItem.ship,
          char,
          e.target.value.replace(/^\s+|\s+$/g, '')
        )
      }
    },
    // 船期查询结果直接填入订单详情
    updateVesselTime(val, key) {
      this.createItem.ship[key] = val
    },
    showAuditDetail() {
      this.auditVisible = true
      console.log('🚀 ~ this.auditVisible', this.auditVisible)
    },
    auditClose() {
      this.auditVisible = false
    },
    changeBizDateClose(action, value) {
      if (action === 'Confirm') {
        this.$confirm('仅有一次手动修改机会，是否确定要修改', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            bizdateChange(value)
              .then((res) => {
                this.changeBizDateShow = false
                this.$message({ type: 'success', message: '修改成功' })
                this.bizDateModify = value.bizDate
                this.createItem.bizDate = value.bizDate
              })
              .finally(() => {})
          })
          .catch(() => {})
      } else {
        this.changeBizDateShow = false
      }
    },
    handleChangeBizDate() {
      this.changeBizDateShow = true
    },
    // 获取所有公司
    getCompanyList() {
      baseDeptSettleList().then((res) => {
        this.payCompanyOptions = res.data.map((item) => {
          return { ...item, label: item.deptCname, value: item.deptCode }
        })
      })
    },
    handleChnageCompany(val) {
      let findItem = this.payCompanyOptions.find(
        (item) => item.deptCode === val
      )
      this.createItem.payCompanyName = findItem ? findItem.label : ''
    },
    // 船公司官网
    getShippingCarrierUrl(carrierCode) {
      if (!carrierCode) return
      this.$store.dispatch('order/getShippingCarrierWebUrl', { carrierCode })
    },
    handleChangePriceType(val) {
      // 选择业务自拿价自动匹配航线经理（pricing）
      if (val === 'bd') {
        this.$emit('priceTypeIsBd')
      }
    },
    // 添加中转港
    handleAddTransitPort() {
      if (!this.transitPortOneShow) {
        this.transitPortOneShow = true
      } else if (this.transitPortOneShow && !this.transitPortTwoShow) {
        this.transitPortTwoShow = true
      }
    },
    // 删除中转港2
    handleDeleteOne() {
      this.transitPortOneShow = false
      this.createItem.ship.transitPortCode1 = ''
      this.transitPortItem1 = {}
    },
    // 删除中转港3
    handleDeleteTwo() {
      this.transitPortTwoShow = false
      this.createItem.ship.transitPortCode2 = ''
      this.transitPortItem2 = {}
    },
    //保存编辑备注
    handleSaveRemark() {
      this.$emit('saveRemark')
    },
    handleChangeIssueMode(val) {
      this.createItem.ship.issueMode = val
    },
    fillPolPort(portCodes) {
      console.log('🚀 ~ portCodes', portCodes)
      // 港口数据反显
      if (portCodes) {
        let {
          podPortCode,
          unloadingPortCode,
          polPortCode,
          transitPortCode,
          transitPortCode1,
          transitPortCode2,
          roLoadingPortCode,
          roArrivalPortCode
        } = this.createItem.ship
        // 设置中转港2，中转港3的显示隐藏
        this.transitPortOneShow = transitPortCode1 ? true : false
        this.transitPortTwoShow = transitPortCode2 ? true : false
        this.$store
          .dispatch('dict/basePortListByCodes', { portCodes })
          .then((data) => {
            let initPortData = []
            //初始化下拉框数据
            let results = new Map()
            initPortData = data
            data.map((item) => {
              let obj = {}
              obj.label = item.label
              obj.portAttribute = item.portAttribute
              results.set(item.value, obj)
            })
            this.podPortList = initPortData.filter(
              (item) => item.portCode === podPortCode
            )
            this.podPortItem = this.podPortList.find(
              (item) => item.portCode === podPortCode
            )
            this.unloadPortList = initPortData.filter(
              (item) => item.portCode === unloadingPortCode
            )
            this.unloadPortItem = this.unloadPortList.find(
              (item) => item.portCode === unloadingPortCode
            )
            if (this.createItem.barge && this.createItem.barge.porPortCode) {
              this.porPortList = initPortData.filter(
                (item) => item.portCode === this.createItem.barge.porPortCode
              )
              this.porPortItem = this.porPortList.find(
                (item) => item.portCode === this.createItem.barge.porPortCode
              )
            }
            this.roLoadingPortList = initPortData.filter(
              (item) => item.portCode === roLoadingPortCode
            )
            this.roLoadingPortItem = this.roLoadingPortList.find(
              (item) => item.portCode === roLoadingPortCode
            )
            this.roArrivalPortList = initPortData.filter(
              (item) => item.portCode === roArrivalPortCode
            )
            this.roArrivalPortItem = this.roArrivalPortList.find(
              (item) => item.portCode === roArrivalPortCode
            )
            this.polPortList = initPortData.filter(
              (item) => item.portCode === this.createItem.ship.polPortCode
            )
            this.polPortItem = this.polPortList.find(
              (item) => item.portCode === polPortCode
            )
            this.transitPortList = initPortData.filter(
              (item) => item.portCode === transitPortCode
            )
            this.transitPortItem = this.transitPortList.find(
              (item) => item.portCode === transitPortCode
            )
            this.transitPortList1 = initPortData.filter(
              (item) => item.portCode === transitPortCode1
            )
            this.transitPortItem1 = this.transitPortList1.find(
              (item) => item.portCode === transitPortCode1
            )
            console.log('this.transitPortItem1', this.transitPortItem1)
            this.transitPortList2 = initPortData.filter(
              (item) => item.portCode === transitPortCode2
            )
            this.transitPortItem2 = this.transitPortList2.find(
              (item) => item.portCode === transitPortCode2
            )
            this.selectListData = initPortData.filter((item) =>
              this.createItem.ship.transitPortCode.includes(item.portCode)
            )

            // let portItem = this.podPortList.find(item => item.portCode === podPortCode)
            // this.podCountryCname = portItem ? portItem.podCountryCname : ''

            //  let polPortItem = this.polPortList.find(item => item.portCode === polPortCode)
            // this.polCountryCname = polPortItem ? portItem.polCountryCname : ''
          })
      } else {
        this.transitPortOneShow = false
        this.transitPortTwoShow = false
        this.$store.dispatch('dict/basePortListByCodes', {}).then((data) => {
          //初始化下拉框数据
          this.podPortList = JSON.parse(JSON.stringify(data))
          this.unloadPortList = JSON.parse(JSON.stringify(data))
          this.porPortList = JSON.parse(JSON.stringify(data))
          this.roLoadingPortList = JSON.parse(JSON.stringify(data))
          this.roArrivalPortList = JSON.parse(JSON.stringify(data))
          this.polPortList = JSON.parse(JSON.stringify(data))
          this.transitPortList = JSON.parse(JSON.stringify(data))
          this.transitPortList1 = JSON.parse(JSON.stringify(data))
          this.transitPortList2 = JSON.parse(JSON.stringify(data))
        })
      }
    },

    // 驳船收货地
    porPortVisibleChange(val) {
      // if (val) this.porPortSearch('', 'port_of_feeder', this.state)
    },
    porPortFilterMehod(val) {
      this.porPortSearch(val, 'port_of_feeder', this.state)
    },
    handleChangePorPortCode(val) {
      let findItem = this.porPortList.find((item) => item.portCode === val)
      this.porPortItem = findItem || {}
      console.log(this.porPortItem)
      if (findItem && val) {
        this.createItem.barge.portName = findItem.cityCname
      }
      if (!val) {
        this.createItem.barge.portName = ''
      }
    },
    // 驳船收货地下拉数据
    porPortSearch(queryString, portAttribute, state) {
      this.$store
        .dispatch('dict/basePortList', { queryString, portAttribute, state })
        .then((data) => {
          let result = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.key
            })
          })
          this.porPortList = result
        })
    },
    // 装货港
    roLoadingPortVisibleChange(val) {
      // if (val) this.roLoadingPortSearch('', 'port_of_feeder', this.state)
    },
    roLoadingPortFilterMehod(val) {
      this.roLoadingPortSearch(val, 'port_of_feeder', this.state)
    },
    handleChangeRoLoadingPortCode(val) {
      let findItem = this.roLoadingPortList.find(
        (item) => item.portCode === val
      )
      this.roLoadingPortItem = findItem || {}
    },
    roLoadingPortSearch(queryString, portAttribute, state) {
      this.$store
        .dispatch('dict/basePortList', { queryString, portAttribute, state })
        .then((data) => {
          let result = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.key
            })
          })
          this.roLoadingPortList = result
        })
    },
    // 到货港
    roArrivalPortVisibleChange(val) {
      // if (val) this.roArrivalPortSearch('', 'port_of_feeder', this.state)
    },
    roArrivalPortFilterMehod(val) {
      this.roArrivalPortSearch(val, 'port_of_feeder', this.state)
    },
    handleChangeRoArrivalPortCode(val) {
      let findItem = this.roArrivalPortList.find(
        (item) => item.portCode === val
      )
      this.roArrivalPortItem = findItem || {}
    },
    roArrivalPortSearch(queryString, portAttribute, state) {
      this.$store
        .dispatch('dict/basePortList', { queryString, portAttribute, state })
        .then((data) => {
          let result = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.key
            })
          })
          this.roArrivalPortList = result
        })
    },
    // 起运港下拉数据
    polPortSearch(queryString, portAttribute, state) {
      this.$store
        .dispatch('dict/basePortList', { queryString, portAttribute, state })
        .then((data) => {
          let result = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.key
            })
          })
          this.polPortList = result
        })
    },
    // 大船起运港
    polPortVisibleChange(val) {
      // if (val) this.polPortSearch('', 'port_of_basic', this.state)
    },
    polPortFilterMehod(val) {
      this.polPortSearch(val, 'port_of_basic', this.state)
    },
    handleChangePolPortCode(val) {
      let findItem = this.polPortList.find((item) => item.portCode === val)
      this.polPortItem = findItem || {}

      if (val) {
        if (this.isBd || this.isOpEdit) {
          // 获取国家code
          let portItem = this.polPortList.find((item) => item.portCode === val)
          this.createItem.ship.polCountryCname = portItem.countryName
        }
      }
    },
    // 中转港
    transitPortVisibleChange(val) {
      // if (val) this.polPortSearch('', 'port_of_basic', this.state)
    },
    transitPortFilterMehod(val) {
      this.transitPortSearch(val, 'port_of_basic', this.state)
    },
    handleChangeTransitPortCode(val) {
      let findItem = this.transitPortList.find((item) => item.portCode === val)
      this.transitPortItem = findItem || {}
    },
    // 中转港
    transitPortVisibleChangeOne(val) {},
    transitPortFilterMehodOne(val) {
      this.transitPortSearchOne(val, 'port_of_basic', this.state)
    },
    handleChangeTransitPortCodeOne(val) {
      let findItem = this.transitPortList1.find((item) => item.portCode === val)
      this.transitPortItem1 = findItem || {}
    },
    // 中转港
    transitPortVisibleChangeTwo(val) {},
    transitPortFilterMehodTwo(val) {
      this.transitPortSearchTwo(val, 'port_of_basic', this.state)
    },
    handleChangeTransitPortCodeTwo(val) {
      let findItem = this.transitPortList2.find((item) => item.portCode === val)
      this.transitPortItem2 = findItem || {}
    },
    // 中转港1下拉数据
    transitPortSearch(queryString, portAttribute, state) {
      this.$store
        .dispatch('dict/basePortList', { queryString, portAttribute, state })
        .then((data) => {
          let result = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.key
            })
          })
          this.transitPortList = result
        })
    },
    // 中转港2下拉数据
    transitPortSearchOne(queryString, portAttribute, state) {
      this.$store
        .dispatch('dict/basePortList', { queryString, portAttribute, state })
        .then((data) => {
          let result = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.key
            })
          })
          this.transitPortList1 = result
        })
    },
    // 中转港3下拉数据
    transitPortSearchTwo(queryString, portAttribute, state) {
      this.$store
        .dispatch('dict/basePortList', { queryString, portAttribute, state })
        .then((data) => {
          let result = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.key
            })
          })
          this.transitPortList2 = result
        })
    },
    // 卸货港下拉数据
    unloadPortSearch(queryString, portAttribute, state) {
      this.$store
        .dispatch('dict/basePortList', { queryString, portAttribute, state })
        .then((data) => {
          let result = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.key
            })
          })
          this.unloadPortList = result
        })
    },
    // 卸货港
    unloadPortVisibleChange(val) {
      // if (val) this.unloadPortSearch('', 'port_of_discharge', this.state)
    },
    unloadPortFilterMehod(val) {
      this.unloadPortSearch(val, 'port_of_discharge', this.state)
    },
    handleChangeUnloadPortCode(val) {
      let findItem = this.unloadPortList.find((item) => item.portCode === val)
      this.unloadPortItem = findItem || {}
    },
    // 目的地下拉数据
    podPortSearch(queryString, portAttribute, state) {
      this.$store
        .dispatch('dict/basePortList', { queryString, portAttribute, state })
        .then((data) => {
          let result = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.key
            })
          })
          this.podPortList = result
        })
    },
    // 目的地
    podPortVisibleChange(val) {
      // if (val) this.podPortSearch('', 'port_of_destination', this.state)
    },
    podPortFilterMehod(val) {
      this.podPortSearch(val, 'port_of_destination', this.state)
    },
    handleChangePodPortCode(val) {
      let findItem = this.podPortList.find((item) => item.portCode === val)
      this.podPortItem = findItem || {}
      if (val) {
        // bd修改目的地获取国家判断显示货物信息里的是否包含木质包装
        if (this.isBd || this.isOpEdit) {
          // 获取国家code
          let portItem = this.podPortList.find((item) => item.portCode === val)
          this.createItem.ship.podPortCountryCname = portItem.countryName
        }
      }
    },
    handleSelectPodPortCode(item) {
      Object.assign(this.createItem.ship, {
        podPortCode: item.key
      })
    },
    // 船公司下拉
    shipCarrierVisibleChange(val) {
      if (val) {
        this.$store
          .dispatch('dict/baseShippingCarrierList', {
            name: '',
            state: 'valid'
          })
          .then((data) => {
            this.shipCarrierOptions = data
          })
      }
    },
    shipCarrierFilterMehod(val) {
      this.$store
        .dispatch('dict/baseShippingCarrierList', { name: val, state: 'valid' })
        .then((data) => {
          this.shipCarrierOptions = data
        })
    },
    handleChangeShipCarrier(val) {
      // 变更商务岗位分配信息
      if (val && this.createItem.ship.priceType !== 'bd') {
        this.$emit('updatePricing', '船公司')
      }
    },
    // 运输条款
    getShipTerm() {
      this.$store.dispatch('dict/baseShipTermsList').then((data) => {
        this.transportTermOptions = data
      })
    },
    // 驳船船名输入建议
    querySearchVessel(queryString, cb) {
      this.$store
        .dispatch('dict/queryVessleList', { name: queryString })
        .then((data) => {
          cb(data)
        })
    },
    handleSelectVessel(value) {},
    handleClearVessel(value) {},
    // 驳船航次输入建议
    querySearchVoyage(queryString, cb, vessel) {
      this.$store
        .dispatch('dict/queryVoyageList', { name: queryString, vessel: vessel })
        .then((data) => {
          cb(data)
        })
    },
    handleSelectVoyage(value) {},
    handleClearVoyage(value) {},
    // 大船船名输入建议
    querySearchBookVessel(queryString, cb) {
      this.$store
        .dispatch('dict/queryBookVessle', {
          shipCarrierCode: this.createItem.ship.shipCarrierCode,
          polPortCode: this.createItem.ship.polPortCode,
          podPortCode: this.createItem.ship.podPortCode,
          vessel: queryString
        })
        .then((data) => {
          cb(data)
        })
    },
    handleSelectBookVessel(value) {},
    handleClearBookVessel(value) {},
    // 大船航次输入建议
    querySearchBookVoyage(queryString, cb, vessel) {
      this.$store
        .dispatch('dict/queryBookVoyage', {
          shipCarrierCode: this.createItem.ship.shipCarrierCode,
          polPortCode: this.createItem.ship.polPortCode,
          podPortCode: this.createItem.ship.podPortCode,
          voyage: queryString,
          vessel: vessel
        })
        .then((data) => {
          cb(data)
        })
    },
    handleSelectBookVoyage(value) {},
    handleClearBookVoyage(value) {},
    handleSearchVesselTime() {
      let { shipCarrierCode, polPortCode, podPortCode, vessel, voyage } =
        this.createItem.ship
      let param = {
        shipCarrierCode,
        polPortCode,
        podPortCode,
        vessel,
        voyage
      }
      // 20220223传参不变的话，不请求船期接口。优化减少请求次数
      if (
        Object.entries(this.vesselTimeParam).toString() ===
        Object.entries(param).toString()
      )
        return
      this.$store.dispatch('dict/queryBookVessleTime', param).then((data) => {
        this.vesselTimeParam = param
        this.vesselTime = data || {}
      })
    },
    noDropSendMailClick() {
      this.orderInfoData = {
        shipCarrierCode: this.createItem.ship.shipCarrierCode, // 船公司
        soStr: this.createItem.soStr, // SO号
        polPortCode: this.createItem.ship.polPortCode, // 起运港
        polPortName: this.createItem.ship.polPortName, // 起运港全称
        podPortCode: this.createItem.ship.podPortCode, // 目的港
        podPortName: this.createItem.ship.podPortName, // 目的港全称
        container: this.containerTotal.container, // 箱型箱量合计
        shipVessel: this.createItem.ship.vessel, // 大船船名
        shipVoyage: this.createItem.ship.voyage, // 大船航次
        shipCyCutOff: this.createItem.ship.cyCutOff, // 大船截关时间
        shipEtdTime: this.createItem.ship.etdTime, // 大船预计开船时间
        custName: this.createItem.custName, // 委托单位
        custid: this.createItem.custid,
        pricingEmployeeId: this.getEmployeeId('pricing'),
        bkgEmployeeId: this.getEmployeeId('bkg')
      }
      this.sendMailPopShow = true
    },
    getEmployeeId(jobCode) {
      let obj = this.createItem.workAssign.find((item) => {
        return item.jobCode === jobCode
      })
      return (obj && obj.employeeId) || ''
    },
    sendMailPopClose(action) {
      this.sendMailPopShow = false
      if (action === 'Confirm') {
        console.log('邮件发送成功回调')
        this.$emit('updateGetInfo')
      }
    }
  }
}
</script>

<style lang="scss">
.port-tooltip {
  p {
    margin-top: 2px;
  }
}
.customs-orderbook-info-table {
  display: table;
  width: 100%;
  margin: 0 auto;
  border-collapse: separate;
  border-spacing: 8px;
  .table-td {
    width: 33.33%;
    display: table-cell;
    border-radius: 2px;
    border: 1px solid #e9e9e9;
    vertical-align: top;
    .h1 {
      line-height: 24px;
      height: 24px;
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
      .label {
        font-weight: 700;
      }
      .include-barge {
        font-size: 12px;
        .el-checkbox__label {
          font-size: 12px;
          padding-left: 4px;
        }
      }
    }
    .flex-form-item {
      padding: 8px;
      &.pr24 {
        padding-right: 40px;
      }
      .el-form-item {
        display: flex;
        margin-bottom: 4px;
        .el-form-item__label {
          width: 110px;
          line-height: 20px;
          padding-right: 4px;
        }
        .el-form-item__content {
          flex: 1;
          line-height: 20px;
        }
        .el-input--suffix .el-input__inner {
          padding-right: 20px;
        }
        &.vessel-time {
          .el-form-item__content {
            display: flex;
          }
        }
        .el-radio__label {
          font-size: 12px;
          padding-left: 5px;
        }
        // textarea::-webkit-scrollbar-track {
        //   -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.1);
        //   border-radius: 20px;
        //   background-color: #F5F5F5;
        // }
        // textarea::-webkit-scrollbar {
        //   width: 6px;
        //   height: 6px;
        //   background-color: #F5F5F5;
        // }
        // textarea::-webkit-scrollbar-thumb {
        //   border-radius: 20px;
        //   -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.1);
        //   background-color: #ccc;
        // }
      }
      &.label100 .el-form-item .el-form-item__label {
        width: 100px;
      }
      &.label90 .el-form-item .el-form-item__label {
        width: 90px;
      }
      &.label70 .el-form-item .el-form-item__label {
        width: 70px;
      }
      &.label100 .el-form-item .el-form-item__label {
        width: 100px;
      }
      .el-form-item__content::before,
      .el-form-item__content::after,
      .el-form-item::before,
      .el-form-item::after {
        display: none;
      }
      .port-flex-form {
        position: relative;
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-between;
        align-items: center;
        .el-icon-circle-plus-outline {
          position: absolute;
          right: -17px;
          cursor: pointer;
          font-size: 15px;
          &:hover {
            color: #1890ff;
          }
        }
        .el-icon-remove-outline {
          position: absolute;
          right: -33px;
          cursor: pointer;
          font-size: 15px;
          &:hover {
            color: #1890ff;
          }
        }
        .port-code {
          width: 32%;
          // margin-left: 5px;
          &:first-child {
            margin-left: 0;
          }
        }
      }
    }
  }
}
.vessel-time-popover {
  margin-left: 5px;
}
.width-less-72-px {
  width: calc(100% - 72px);
}
.width-100-px {
  width: 100%;
}
</style>
