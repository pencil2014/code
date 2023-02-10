<template>
  <div class="ml10 orderBookInfo-box">
    <el-form :model="formData" :rules="rules" ref="orderBookInfoForm" :show-message="false">
      <div id="air-bookInfo-box">
        <div class="air-orderbook-info-table">
          <div class="table-td">
            <div class="cont260 bd-cont">
              <div class="h1">
                <span class="label">港口信息</span>
              </div>
              <div class="pd8 flex-form-item">
                <el-form-item label="起运港" prop="polPortCode" label-width="80px">
                  <el-select size="mini" :disabled="disabledState" style="width:100%" clearable v-model="formData.polPortCode" filterable remote reserve-keyword placeholder="请选择起运港" :remote-method="(val)=>{ polPortRemoteMethod(val,formData.polPortCode)}" @visible-change="polPortRemoteMethod('',formData.polPortCode)" @change="handleChangePolPortCode">
                    <el-option v-for="item in airPortArr" :key="item.value" :disabled="item.value===formData.podPortCode" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="目的地" label-width="80px" prop="podPortCode">
                  <el-select size="mini" v-model="formData.podPortCode" filterable remote clearable :disabled="disabledState" style="width: 100%" placeholder="请选择目的地" :remote-method="(val)=>{ podPortFilterMehod(val,formData.podPortCode)}" @visible-change="podPortFilterMehod('',formData.podPortCode)" @change="handleChangePodPortCode">
                    <el-option v-for="item in destinationArr" :disabled="item.value===formData.polPortCode" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="系统航线" label-width="80px">
                  <el-input clearable size="mini" v-model="formData.airSysLineName" disabled></el-input>
                </el-form-item>

                <el-form-item label="起运国" label-width="80px">
                  <el-input clearable size="mini" v-model="formData.polCountryCname" disabled></el-input>
                </el-form-item>
                <el-form-item label="目的国" label-width="80px">
                  <el-input clearable size="mini" v-model="formData.podCountryCname" disabled></el-input>
                </el-form-item>
                <!--  prop="bookingFileName" -->
                <el-form-item label="托书附件" label-width="80px" :show-message="false">
                  <!-- <el-input size="mini" v-show="0" v-model="formData.bookingFileName" clearable placeholder="请输入" disabled>
                  </el-input> -->
                  <upload-input class="rail-file-upload" @click.native="uploadFile" :fetchFileList="createItem.bookingFiles" @selectFile="selectFile" @delFile="orderFileDelete" @downloadFile="handleDownload" @handleView="handleView" :disabled="disabledState" />
                </el-form-item>
                <el-form-item label="委托备注" label-width="80px">
                  <el-input @dblclick.native="showRemarkDetail(formData.intrustRemark)" type="textarea" clearable rows="4" maxlength="512" size="mini" placeholder="请输入" show-word-limit v-model="formData.intrustRemark" :disabled="disabledState"></el-input>
                </el-form-item>
              </div>
            </div>
          </div>
          <div class="table-td">
            <div class="cont260 bd-cont">
              <div class="h1">
                <span class="label">航司信息</span>
              </div>
              <div class="pd8 flex-form-item">
                <el-form-item label="航空公司" prop="airLine" label-width="100px">
                  <el-select style="width:100%" :disabled="bdAndPricingAndOpDisabledState" size="mini" clearable v-model="formData.airLine" filterable remote reserve-keyword placeholder="请选择航空公司" @change="changeAirLine" :remote-method="val => remoteMethod(val,formData.airLine)" @focus="remoteMethod('',formData.airLine)">
                    <div class="air-line-option-title">
                      <div>IATA代码</div>
                      <div>全称</div>
                      <div>运单前缀</div>
                    </div>
                    <el-option v-for="(item,i) in airLineArr" :key="i" :label="item.label" :value="item.value">
                      <div class="air-line-option">
                        <div class="air-line-option-info">{{item.label}}</div>
                        <div class="air-line-option-info">{{item.cname}}</div>
                        <div class="air-line-option-info">{{item.carrierCode}}</div>
                      </div>
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item v-if="blNoShow" label="运单号" label-width="100px" prop="blNo">
                  <div class="order-detail-blNo-box">
                    <el-select style="width:48%" :disabled="blNoDisabledState" size="mini" @change="changeMblPrefix" clearable v-model="formData.mblPrefix" filterable remote reserve-keyword placeholder="请选择运单号" :remote-method="val => blNoremoteMethod(val,formData.mblPrefix)" @focus="blNoremoteMethod('',formData.mblPrefix)">
                      <div class="air-line-option-title">
                        <div>IATA代码</div>
                        <div>全称</div>
                        <div>运单前缀</div>
                      </div>
                      <el-option v-for="(item,i) in blNoArr" :key="i" :label="item.label" :value="item.value">
                        <div class="air-line-option">
                          <div class="air-line-option-info">{{item.itat}}</div>
                          <div class="air-line-option-info">{{item.cname}}</div>
                          <div class="air-line-option-info">{{item.carrierCode}}</div>
                        </div>
                      </el-option>
                    </el-select>
                    <span class="bl-split">-</span>
                    <el-input size="mini" :maxlength="27" clearable :disabled="blNoDisabledState" placeholder="请输入" oninput="value=value.replace(/-/g,'')" style="width:48%" v-model="formData.mblSuffix"></el-input>
                  </div>
                </el-form-item>
                <el-form-item class="timeSpecial" label="预计起飞日期" prop="etdTime" label-width="100px">
                  <elDatePickerLimit :field="'etdTime'" :disabled="bdAndPricingAndOpDisabledState || finIsCloseStatus" size="mini" v-model="formData.etdTime" type="date" style="width: 100%" clearable placeholder="请选择预计起飞日期" value-format="yyyy-MM-dd" />
                </el-form-item>
                <el-form-item label="中转方式" label-width="100px">
                  <!-- :disabled="disabledState"  -->
                  <el-select v-model="formData.airTransitWay" size="mini" clearable placeholder="请选择中转方式" style="width: 100%" :disabled="bdAndPricingdisabledState">
                    <el-option v-for="(item, index) in dictMap.airTransferMode" :label="item.label" :value="item.value" :key="index">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="交仓地点" label-width="100px" prop="poDealCityCode">
                  <el-select size="mini" v-model="formData.poDealCityCode" filterable remote clearable :disabled="bdAndPricingdisabledState" style="width: 100%" placeholder="请输入" @change="getCityName" :remote-method="(val)=>{ citySelectQuery(val,formData.poDealCityName)}" @focus="citySelectQuery('',formData.poDealCityName)">
                    <el-option v-for="item in poDealCityArr" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                  </el-select>
                </el-form-item>

                <el-form-item class="timeSpecial" label="交仓时间" prop="poDealTime" label-width="100px">
                  <elDatePickerLimit :disabled="bdAndPricingdisabledState" v-model="formData.poDealTime" size="mini" type="date" style="width: 100%" clearable placeholder="请选择交仓时间" value-format="yyyy-MM-dd" />
                </el-form-item>
                <div v-if="(!['draft', 'refuse','submit'].includes(this.createItem.orderStatus) || isPricing)&&formItemIsShow('bkgAgentSupplierId')">
                  <el-form-item label="订舱代理" prop="bkgAgentSupplierId" label-width="100px">
                    <el-select size="mini" :disabled="!['draft', 'refuse','submit'].includes(this.createItem.orderStatus)" v-model="formData.bkgAgentSupplierId" @change="selectBkgAgentSupplier" filterable clearable remote style="width: 100%" placeholder="请输入" :remote-method="val => bkgAgentSupplierRemoteMethod(val,formData.bkgAgentSupplierName)" @focus="bkgAgentSupplierRemoteMethod('',formData.bkgAgentSupplierName)">
                      <el-option v-for="(item, index) in bkgAgentSupplierOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
                    </el-select>
                  </el-form-item>
                </div>
                <div v-if="(!['draft', 'refuse','submit'].includes(this.createItem.orderStatus) || isPricing)&&formItemIsShow()">
                  <el-form-item label="是否外配" prop="isExternal" label-width="100px">
                    <el-select size="mini" v-model="formData.isExternal" clearable style="width: 100%" placeholder="请选择" :disabled="!['draft', 'refuse','submit'].includes(this.createItem.orderStatus)">
                      <el-option v-for="item in externalOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                    </el-select>
                  </el-form-item>
                </div>
                <div v-if="(!['draft', 'refuse','submit'].includes(this.createItem.orderStatus) || isPricing)&&formItemIsShow()">
                  <el-form-item label="合约号" prop="contractNo" label-width="100px">
                    <el-input clearable size="mini" maxlength="64" v-model="formData.contractNo" :disabled="!['draft', 'refuse','submit'].includes(this.createItem.orderStatus)"></el-input>
                  </el-form-item>
                </div>
                <div v-if="(!['draft', 'refuse','submit'].includes(this.createItem.orderStatus) || isOp)&&createItem.serviceList.includes('airbook')&&formItemIsShow()">
                  <el-form-item label="入仓编号" prop="poNo" label-width="100px">
                    <el-input size="mini" v-model="formData.poNo" maxlength="64" clearable :disabled="!isOp || isDisabled" placeholder="请输入">
                    </el-input>
                  </el-form-item>
                </div>
                <el-form-item v-if="!['draft', 'refuse','submit'].includes(createItem.orderStatus) || isPricing" label="审单备注" label-width="100px">
                  <el-input @dblclick.native="showRemarkDetail(formData.auditRemark)" clearable size="mini" maxlength="512" type="textarea" rows="4" show-word-limit v-model="formData.auditRemark" :disabled="!['draft', 'refuse','submit'].includes(createItem.orderStatus)"></el-input>
                </el-form-item>
              </div>
            </div>
          </div>
          <div class="table-td">
            <div class="cont260 bd-cont">
              <div class="h1">
                <span class="label">货运信息</span>
              </div>
              <div class="pd8 flex-form-item">
                <el-form-item label="运输条款" label-width="80px" prop="transportTerm">
                  <!-- airTransportTerm -->
                  <el-select v-model="formData.transportTerm" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="bdAndPricingdisabledState">
                    <el-option v-for="(item, index) in dictMap.airTransportTerm" :label="item.label" :value="item.value" :key="index">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="报关方式" prop="airCustomsType" label-width="80px">
                  <el-select v-model="formData.airCustomsType" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="bdAndPricingdisabledState">
                    <el-option v-for="(item, index) in dictMap.airCustomsType" :label="item.label" :value="item.value" :key="index">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item v-if="(!['draft', 'refuse','submit'].includes(this.createItem.orderStatus) || isOp)" label="报关票数" prop="airCustomsTicketNum" label-width="80px">
                  <el-input placeholder="请输入" size="mini" v-model="formData.airCustomsTicketNum" maxlength="16" @input="checkCustomsTicketNum(formData.airCustomsTicketNum)" clearable :disabled="!isOp || isDisabled"></el-input>
                </el-form-item>
                <el-form-item label="运单方式" prop="airBillType" label-width="80px">
                  <el-select v-model="formData.airBillType" @change="changeAirBillType" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="bdAndPricingdisabledState">
                    <el-option v-for="(item, index) in dictMap.airTransitWay" :label="item.label" :value="item.value" :key="index">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="分单数" prop="billSplitNum" label-width="80px">
                  <el-input placeholder="请输入" size="mini" v-model="formData.billSplitNum" clearable :disabled="bdAndPricingdisabledState || formData.airBillType==='immediacy'" @input="checkBillSplitNum(formData.billSplitNum)"></el-input>
                </el-form-item>
                <el-form-item label="付款方式" label-width="80px" prop="airPayMode">
                  <el-select v-model="formData.airPayMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="bdAndPricingdisabledState">
                    <el-option v-for="(item, index) in dictMap.airPayMode" :label="item.label" :value="item.value" :key="index">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="随机文件" label-width="80px">
                  <el-select v-model="formData.airDocumentType" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="bdAndPricingdisabledState">
                    <el-option v-for="(item, index) in dictMap.airDocumentTpe" :label="item.label" :value="item.value" :key="index">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="业务日期" label-width="80px" v-if="!['draft', 'refuse','submit'].includes(createItem.orderStatus)">
                  <elDatePickerLimit size="mini" :style="{ width: showChangeBizDate ? 'calc(100% - 42px)' : '100%' }" v-model="formData.bizDate" disabled type="date" style="width: 100%" clearable placeholder="业务日期" value-format="yyyy-MM-dd" />
                  <el-button v-if="showChangeBizDate" @click="handleChangeBizDate" size="mini">修改</el-button>
                </el-form-item>
                <el-form-item label="海关是否查验" label-width="80px" prop="isCustomsInspection" v-if="(!['draft', 'refuse','submit'].includes(createItem.orderStatus) || isOp)">
                  <el-radio-group v-model="formData.isCustomsInspection">
                    <el-radio :label="item.value" :disabled="!isOp || isDisabled" v-for="(item, index) in yesOrNoOptions" :key="index">{{ item.label }}</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item class="timeSpecial" label="海关放行时间" prop="customsReleaseTime" label-width="80px" v-if="(!['draft', 'refuse','submit'].includes(createItem.orderStatus) || isOp)">
                  <elDatePickerLimit :field="'customsReleaseTime'" :disabled="!isOp || isDisabled" size="mini" v-model="formData.customsReleaseTime" type="date" style="width: 100%" clearable placeholder="请选择海关放行时间" value-format="yyyy-MM-dd" />
                </el-form-item>
                <el-form-item label="订舱备注" label-width="80px" v-if="(!['draft', 'refuse','submit'].includes(createItem.orderStatus) || isOp)&&createItem.serviceList.includes('airbook')">
                  <el-input @dblclick.native="showRemarkDetail(formData.bkgRemark)" type="textarea" clearable rows="4" maxlength="512" size="mini" placeholder="请输入" show-word-limit v-model="formData.bkgRemark" :disabled="!isOp || isDisabled"></el-input>
                </el-form-item>
                <el-form-item label="备注" label-width="80px" prop="bdRemark" :show-message="false" v-if="$route.query.source !== 'jointList'">
                  <el-input @dblclick.native="showRemarkDetail(formData.bdRemark)" class="loadingBdRemark" type="textarea" clearable rows="4" size="mini" placeholder="请输入" maxlength="512" show-word-limit v-model="formData.bdRemark" @blur="handleSaveRemark" :disabled="!bdRemarkState"></el-input>
                </el-form-item>
              </div>
            </div>
          </div>
        </div>
      </div>

    </el-form>
    <div v-if="uploadPopShow">
      <FileUpload @close="uploadPopClose" />
    </div>
    <!-- <el-button @click="validateForm">校验</el-button> -->
    <div v-if="remarkVisible">
      <AuditRemark :auditRemark="remarkContent" @close="auditClose" />
    </div>
    <div v-if="changeBizDateShow">
      <ChangeBizDatePop @close="changeBizDateClose" :bizDate="formData.bizDate"></ChangeBizDatePop>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { validatebillSplitNum } from '@/utils/validate'
import { unique } from '@/utils/index'
import FileUpload from './bookFileUpload'
import UploadInput from './booking-file-upload.vue'
import { bookFileDelete } from '@/api/airTransport/order'
import { citySelectList } from '@/api/base'
import ChangeBizDatePop from './changeBizDatePop'
import { bizdateChange } from '@/api/order/list'
import AuditRemark from '@/views/order/order/orderList/components/auditRemark'
import { blList } from '@/api/airTransport/order'
const dateObj = {
  customsReleaseTime: '',   // 海关放行时间
  isCustomsInspection: '',  // 海关是否查验
  transportTerm: '', // 运输条款
  airCustomsType: '', // 报关方式
  billSplitNum: '', // 分单数
  airBillType: '', // 运单方式
  airPayMode: '', // 付款方式
  airDocumentType: '', // 随机文件
  airLine: '', // 航空公司
  airSysLineCode: '', // 航线代码
  airSysLineName: '',
  etdTime: null, // 预计起飞日期
  airTransitWay: '', // 中转方式
  polPortCode: '', // 起运港CODE
  // unloadingPortCode: '', // 卸货港CODE
  podPortCode: '', // 目的地CODE
  bookingFileName: '',
  auditRemark: '',
  bkgAgentSupplierId: '',
  bkgAgentSupplierName: '',
  poNo: '',
  bkgRemark: '',
  blNo: '',
  mblPrefix: '',
  mblSuffix: '',
  airCustomsTicketNum: '',
  poDealTime: null
}
var timer = ''
export default {
  name: 'air-order-info',
  data() {
    return {
      remarkContent: '',
      remarkVisible: false,
      isDraftConfirm: false, // 提单中的主单是否草单确认
      auditVisible: false,
      bizDateModify: this.$store.state.airTransport.airOrderInfo.bizDateModify,
      changeBizDateShow: false,
      // formHeight: 0,
      poDealCityArr: [], // 交仓地点
      uploadPopShow: false,
      externalOptions: [
        { label: '是', value: 'y' },
        { label: '否', value: 'n' }
      ],
      state: 'valid',
      isEdit: false,
      oQuery: this.$route.query,
      pickerOptions: {
        disabledDate(date) {
          return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
        }
      },
      rules: {
        transportTerm: [
          { required: true, message: '请输入', trigger: 'change' }
        ],
        airCustomsType: [
          { required: true, message: '请输入', trigger: 'change' }
        ],
        billSplitNum: [
          { required: true, message: '请输入', trigger: 'change' },
          { validator: validatebillSplitNum(), trigger: 'change' }
        ],
        airCustomsTicketNum: [
          { required: false, message: '请输入', trigger: 'change' },
          { validator: validatebillSplitNum(999999999), trigger: 'change' }
        ],
        airBillType: [{ required: true, message: '请输入', trigger: 'change' }],
        airPayMode: [{ required: true, message: '请输入', trigger: 'change' }],
        airDocumentType: [
          { required: true, message: '请输入', trigger: 'change' }
        ],
        airLine: [{ required: true, message: '请输入', trigger: 'change' }],
        airSysLineCode: [
          { required: true, message: '请输入', trigger: 'change' }
        ],
        etdTime: [{ required: true, message: '请输入', trigger: 'change' }],
        // airTransitWay: [
        //   { required: true, message: '请输入', trigger: 'change' }
        // ],
        polPortCode: [{ required: true, message: '请输入', trigger: 'change' }],
        // unloadingPortCode: [
        //   { required: true, message: '请输入', trigger: 'change' }
        // ],
        podPortCode: [{ required: true, message: '请输入', trigger: 'change' }],
        intrustRemark: [
          { required: true, message: '请输入', trigger: 'change' }
        ],
        bkgAgentSupplierId: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        isExternal: [{ required: true, message: '请选择', trigger: 'change' }],
        contractNo: [{ required: false, message: '请输入', trigger: 'change' }],
        bookFileName: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        poDealCityCode: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        poDealTime: [{ required: true, message: '请选择', trigger: 'change' }],
        bookingFileName: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        poNo: [{ required: true, message: '请选择', trigger: 'change' }],
        blNo: [
          { required: false, message: '请选择', trigger: 'change' }
          // { validator: this.validatebillBlNo(), trigger: 'change' }
        ]
      },
      airLineArr: [],
      airPortArr: [], // 起运港
      unloadingPort: [], // 卸货港
      destinationArr: [], // 目的地
      airSysLineArr: [], // 系统航线
      bkgAgentSupplierOptions: [], // 订舱代理下拉
      blNoArr: [],
      yesOrNoOptions: [
				{ label: '是', value: 'Y' },
				{ label: '否', value: 'N' }
			]
    }
  },
  props: {
    createItem: {
      type: Object,
      default: () => {}
    },
    formData: {
      type: Object,
      default: () => dateObj
    },
    orderStatus: {
      type: String,
      default: ''
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    bkgStatus: {
      type: String,
      default: 'INIT'
    },
    isPricing: {
      type: Boolean,
      default: false
    },
    isBd: {
      type: Boolean,
      default: false
    },
    isOp: {
      type: Boolean,
      default: false
    }
  },
  // model: {
  //   prop: 'formData',
  //   event: 'update'
  // },
  created() {
    if (['st20', 'st21', 'st22'].includes(this.airOrderInfo.serviceType)) {
      //服务类型为：【跨境电商】、【跨境电商海外仓】、【跨境电商目的港清派】 订单的出单方式、分单数、放货参与人非必填。
      this.$set(this.rules, 'airBillType', [
        { required: false, message: '请选择', trigger: 'change' }
      ])
      this.$set(this.rules, 'billSplitNum', [
        { required: false, message: '请选择', trigger: 'change' }
      ])
    }
    this.getBlList()
  },
  mounted() {
    if (this.formData.airLine && !this.formData.blNo) {
      this.$store
        .dispatch('dict/aircarrierList', {
          carrierName: this.formData.airLine
        })
        .then((data) => {
          let list = data
            .map((ele) => {
              return Object.assign(ele, {
                value: ele.carrierCode,
                label: ele.carrierCode
              })
            })
            .filter((el) => el.itat)
          if (list[0] && list[0].carrierCode) {
            this.formData.mblPrefix = list[0].carrierCode
          }
        })
    }
  },
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole,
      roles: (state) => state.user.roles,
      airOrderInfo: (state) => state.airTransport.airOrderInfo,
      userId: (state) => state.user.userId
    }),
    finIsCloseStatus() {
      // 放开已关账、已完成的限制
      // return this.airOrderInfo.finCloseStatus === 'yes'
      return false
    },
    showChangeBizDate() {
      if (
        this.isOp &&
        this.airOrderInfo.orderStatus !== 'complete' &&
        this.airOrderInfo.finCloseStatus !== 'yes' &&
        this.bizDateModify === null &&
        ['st06', 'st22', 'st21', 'st14'].includes(this.airOrderInfo.serviceType)
      ) {
        return true
      } else {
        return false
      }
    },
    disabledState() {
      // 业务可以填写部分的权限
      if (this.isBd) {
        if (!['draft', 'refuse'].includes(this.orderStatus)) {
          return true
        } else {
          return false
        }
      } else if (this.isPricing) {
        if (!['draft', 'refuse'].includes(this.orderStatus)) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    },
    blNoDisabledState() {
      // 运单号
      if (this.isDraftConfirm) {
        return true
      }
      if (this.isOp) {
        // 优先判断操作，不然会有问题
        if (['pass'].includes(this.orderStatus)) {
          return false
        } else {
          return true
        }
      } else if (this.isPricing) {
        if (!['draft', 'refuse', 'submit'].includes(this.orderStatus)) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    },
    blNoShow() {
      // 运单号
      if (this.isBd) {
        if (['draft', 'refuse', 'submit'].includes(this.orderStatus)) {
          return false
        } else {
          return true
        }
      } else {
        return true
      }
    },
    bdAndPricingdisabledState() {
      // 业务和商务可以填写部分的权限
      if (this.isBd) {
        if (!['draft', 'refuse'].includes(this.orderStatus)) {
          return true
        } else {
          return false
        }
      } else if (this.isPricing) {
        if (!['draft', 'refuse', 'submit'].includes(this.orderStatus)) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    },
    bdAndPricingAndOpDisabledState() {
      // 业务，商务，操作可以编辑
      if (this.isBd) {
        if (!['draft', 'refuse'].includes(this.orderStatus)) {
          return true
        } else {
          return false
        }
      } else if (this.isPricing) {
        if (!['draft', 'refuse', 'submit'].includes(this.orderStatus)) {
          return true
        } else {
          return false
        }
      } else if (this.isOp) {
        if (!['pass'].includes(this.orderStatus)) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    },
    isView() {
      if (this.isBd && !['draft', 'refuse'].includes(this.orderStatus)) {
        return true
      }
      if (this.isOp && !['pass'].includes(this.orderStatus)) {
        return true
      }
      return false
    },
    airTransitWayDisabled() {
      if (!this.isBd && !this.isPricing) {
        return true
      } else {
        return (
          (this.isBd &&
            !['draft', 'refuse'].includes(this.airOrderInfo.orderStatus)) ||
          (this.isPricing &&
            !['draft', 'refuse', 'submit'].includes(
              this.airOrderInfo.orderStatus
            ))
        )
      }
    },
    bdRemarkState() {
      if (
        ['draft', 'refuse', 'pass', 'complete'].includes(
          this.airOrderInfo.orderStatus
        )
      ) {
        return true
      }
      return false
    }
  },
  watch: {
    'formData.etdTime':{
         handler: function (val) {
          if (this.airOrderInfo.etdTime&&val!=this.airOrderInfo.etdTime) {
            this.$message.warning('预计起飞日已更新，请确认是否需要更改预计到达日。')
          }
      },
    },
    bdAndPricingdisabledState: {
      handler: function (val) {
        if (val) {
          this.rules.transportTerm = [
            { required: false, message: '请输入', trigger: 'change' }
          ]
        } else {
          this.rules.transportTerm = [
            { required: true, message: '请输入', trigger: 'change' }
          ]
        }
      },
      immediate: true
    },
    bkgStatus: {
      handler: function (val) {
        if (!val || val === 'INIT') {
          this.$set(this.rules, 'poNo', [
            { required: false, message: '请选择', trigger: 'change' }
          ])
        } else {
          this.$set(this.rules, 'poNo', [
            { required: true, message: '请选择', trigger: 'change' }
          ])
        }
      },
      immediate: true
    },
    'formData.isExternal': {
      handler: function (val) {
        if (['st20', 'st21', 'st22'].includes(this.airOrderInfo.serviceType)) {
          if (val === 'y') {
            this.$set(this.rules, 'contractNo', [
              { required: false, message: '请选择', trigger: 'change' }
            ])
            if (this.$refs && this.$refs.orderBookInfoForm) {
              this.$refs.orderBookInfoForm.clearValidate('contractNo')
            }
          } else {
            this.$set(this.rules, 'contractNo', [
              { required: true, message: '请选择', trigger: 'change' }
            ])
          }
        }
      },
      immediate: true
    },
    'formData.mblPrefix': {
      handler: function (val) {
        if (!val && !this.formData.mblSuffix) {
          this.formData.blNo = ''
        } else {
          this.formData.blNo = `${val}-${this.formData.mblSuffix}`
        }
      },
      immediate: true
    },
    'formData.mblSuffix': {
      handler: function (val) {
        if (!val && !this.formData.mblPrefix) {
          this.formData.blNo = ''
        } else {
          this.formData.blNo = `${this.formData.mblPrefix}-${val}`
        }
      },
      immediate: true
    },
    'formData.billSplitNum': {
      handler: function (val) {
        if (this.formData.airBillType !== 'immediacy') {
          if (val === 0 || val === '0') {
            this.formData.billSplitNum = ''
          }
        }
      },
      immediate: true
    }
  },
  components: { FileUpload, UploadInput, ChangeBizDatePop, AuditRemark },
  methods: {
    uploadFile(e) {
      if (e.target.tagName === 'INPUT') {
        this.uploadPopShow = true
      }
    },
    showRemarkDetail(val) {
      this.remarkContent = val
      this.remarkVisible = true
    },

    auditClose() {
      this.remarkVisible = false
    },
    //保存编辑备注
    handleSaveRemark() {
      this.$emit('saveRemark')
    },
    changeAirLine(val) {
      // 更改航空公司，联动修改运单号前缀
      if (!val) {
        this.formData.mblPrefix = ''
      } else {
        let item = this.airLineArr.find((el) => el.value == val)
        this.formData.mblPrefix = item.carrierCode
      }
    },
    changeMblPrefix(val) {
      // 更改运单号前缀，联动修改航空公司
      if (!val) {
        this.formData.airLine = ''
      } else {
        let item = this.blNoArr.find((el) => el.value == val)
        this.formData.airLine = item.itat
      }
    },
    getBlList() {
      blList({
        orderNo: this.$route.query.orderNo
      }).then((res) => {
        let list = res.data || []
        if (list.length) {
          if (list[0].isDraftConfirm === 'y') {
            this.isDraftConfirm = true
          }
        }
      })
    },
    validatebillBlNo() {
      return (rule, value, callback) => {
        if (value) {
          let arr = value.split('-')
          if (!arr[0] || !arr[1]) {
            callback(new Error('请输入完整的运单号'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }
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
                this.formData.bizDate = value.bizDate
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
    formItemIsShow(prop) {
      // 空运出口 1. 业务不能查看【订舱代理】、【合约号】、【是否外配】、【入仓编号】
      // 注：服务类型为非：【跨境电商】、【跨境电商海外仓】、【跨境电商目的港清派】的空运订单，业务不能查看订舱代理。其他字段能给业务查看。
      if (['st20', 'st21', 'st22'].includes(this.airOrderInfo.serviceType)) {
        //  【跨境电商】、【跨境电商海外仓】、【跨境电商目的港清派】,如果只有bd,obd,asst角色，上面四个字段都不显示
        if (this.isBd) {
          return false
        } else {
          if (this.ordDetRole || this.isPricing) {
            return true
          }
          return false
        }
      } else {
        if (!this.isBd) {
          if (this.ordDetRole || this.isPricing) {
            return true
          }
          return false
        } else if (this.isBd) {
          if (prop === 'bkgAgentSupplierId') {
            return false
          } else {
            return true
          }
        }
      }
    },
    changeAirBillType(val) {
      if (val === 'immediacy') {
        this.formData.billSplitNum = 0
      } else {
        this.formData.billSplitNum = ''
      }
    },
    selectBkgAgentSupplier(val) {
      // 反选订舱代理name
      if (!val) {
        this.formData.bkgAgentSupplierName = ''
      } else {
        this.formData.bkgAgentSupplierName = this.bkgAgentSupplierOptions.find(
          (e) => val == e.value
        ).label
      }
    },
    selectFile(formData, fileLength) {
      this.$emit('selectFile', formData, fileLength)
    },
    // 城市下拉数据
    citySelectQuery(queryString, code) {
      citySelectList({
        countryCode: '',
        cityCode: code && !queryString ? code : queryString,
        state: 'valid'
      }).then((data) => {
        let cityArr = data.data.map((ele) => {
          return Object.assign(ele, {
            label: this.$language === 'en' ? ele.ename : ele.cname,
            value: ele.cityCode
          })
        })
        this.poDealCityArr = cityArr
      })
    },
    getCityName(el) {
      if (!el) {
        this.formData.poDealCityName = ''
      } else {
        let findItem = this.poDealCityArr.find((item) => item.value == el)
        this.formData.poDealCityName = findItem.label
      }
    },
    handleDownload(fileName, fileNo) {
      this.$store
        .dispatch('order/downloadBlobFile', {
          uri: '/base/webapi/file/download',
          params: {
            fileNo: fileNo
          }
        })
        .then((res) => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = fileName
          link.click()
        })
    },
    handleView(fileName, fileNo) {
      this.$store.dispatch('order/previewFile', {
        fileNo: fileNo,
        fileName: fileName,
        fileNo
      })
    },
    orderFileDelete(fileNo) {
      // 托书删除
      bookFileDelete({
        fileNo: fileNo
      }).then((res) => {
        this.$delete(this.createItem.bookingFiles, fileNo)
        if (
          !this.createItem.bookingFiles ||
          JSON.stringify(this.createItem.bookingFiles) === '{}'
        ) {
          // 用来做表单校验的值
          this.$set(this.formData, 'bookingFileName', '')
        } else {
          this.$set(this.formData, 'bookingFileName', 'bookingFileName')
        }
      })
    },
    // 上传弹窗关闭回调
    uploadPopClose(action) {
      this.uploadPopShow = false
      if (action === 'Confirm') {
        this.$emit('getInfo')
      }
    },
    checkBillSplitNum(value) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (value) {
          let reg = /^([1-9]\d*)$/
          if (!reg.test(value)) {
            if (!isNaN(value)) {
              this.$set(this.formData, 'billSplitNum', 1)
            }
            this.$message({
              message: `“运单方式”为“非直单”时，分单数请输入大于0的整数`,
              type: 'error',
              duration: 2000
            })
          } else if (value > 999) {
            this.$set(this.formData, 'billSplitNum', 999)
            this.$message({
              message: `分单数不能超过999`,
              type: 'error',
              duration: 2000
            })
          }
        }
      }, 800)
    },
    checkCustomsTicketNum(value) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (value) {
          let reg = /^([1-9]\d*|[0]{1,1})$/
          if (!reg.test(value)) {
            if (!isNaN(value)) {
              this.$set(
                this.formData,
                'airCustomsTicketNum',
                Number(value).fixed(0)
              )
            }
            this.$message({
              message: `报关票数请输入整数`,
              type: 'error',
              duration: 2000
            })
          } else if (value > 999999999) {
            this.$set(this.formData, 'airCustomsTicketNum', 999999999)
            this.$message({
              message: `报关票数不能超过999999999`,
              type: 'error',
              duration: 2000
            })
          }
        }
      }, 800)
    },
    // bkgAgentSupplierVisibleChange(val) {
    //   if (val) this.getSupplierList('bkg_agent', '')
    // },
    bkgAgentSupplierRemoteMethod(queryString, name) {
      this.getSupplierList(queryString, name)
    },
    // 获取订舱代理
    getSupplierList(queryString, name) {
      let queryValue = ''
      if (name && !queryString) {
        // 有选中值&&搜索条件不是空
        queryValue = name
      } else {
        queryValue = queryString
      }
      this.$store
        .dispatch('dict/querySupplierList', {
          category: 'category',
          value: 'bkg_carrier,bkg_agent',
          categoryType: 'in',
          queryString: queryValue
        })
        .then((data) => {
          if (data.list && data.list.length) {
            this.bkgAgentSupplierOptions = data.list.map((ele) => {
              return Object.assign(ele, {
                label: this.$language == 'en' ? ele.ename : ele.name,
                value: ele.supplierId ? Number(ele.supplierId) : ''
              })
            })
          } else {
            this.bkgAgentSupplierOptions = []
          }
        })
    },
    remoteMethod(el, value) {
      // 远程搜索航空公司
      this.$store
        .dispatch('dict/aircarrierList', {
          carrierName: value && !el ? value : el
        })
        .then((data) => {
          let portList = data
            .map((ele) => {
              return Object.assign(ele, {
                value: ele.itat,
                label: ele.itat
              })
            })
            .filter((el) => el.itat)
          this.airLineArr = unique([...portList], 'value')
        })
    },
    blNoremoteMethod(el, value) {
      // 远程运单号
      this.$store
        .dispatch('dict/aircarrierList', {
          carrierName: value && !el ? value : el
        })
        .then((data) => {
          let portList = data
            .map((ele) => {
              return Object.assign(ele, {
                value: ele.carrierCode,
                label: ele.carrierCode
              })
            })
            .filter((el) => el.itat)
          this.blNoArr = unique([...portList], 'value')
        })
    },
    polPortRemoteMethod(el, code) {
      // 远程搜索起运港
      this.airPortSearch(el, this.state, 'airPortArr', code)
    },
    unloadingPortMethod(el, code) {
      // 卸货港
      this.airPortSearch(el, this.state, 'unloadingPort', code)
    },
    podPortFilterMehod(el, code) {
      // 目的地
      this.airPortSearch(el, this.state, 'destinationArr', code)
    },
    handleChangePodPortCode(val) {
      // 通过目的地查询系统航线
      if (!val) {
        this.$set(this.formData, 'airSysLineCode', '')
        this.$set(this.formData, 'airSysLineName', '')

        this.$set(this.formData, 'podCountryCname', '')
        this.$set(this.formData, 'podCountryEname', '')
        this.$set(this.formData, 'podCountryCode', '')
        return
      } else {
        let portItem = this.destinationArr.find((item) => item.portCode === val)
        this.$set(this.formData, 'podCountryCname', portItem.countryCname)
        this.$set(this.formData, 'podCountryEname', portItem.countryEname)
        this.$set(this.formData, 'podCountryCode', portItem.countryCode)
        this.$store
          .dispatch('dict/airportList', {
            portName: '',
            portCodes: val,
            state: this.state
          })
          .then((data) => {
            if (data.length) {
              this.$set(this.formData, 'airSysLineCode', data[0].sysLineCode)
              this.$set(this.formData, 'airSysLineName', data[0].sysLineName)
            } else {
              this.$set(this.formData, 'airSysLineCode', '')
              this.$set(this.formData, 'airSysLineName', '')
            }
          })
      }
    },
    handleChangePolPortCode(val) {
      // 通过起运港查询
      if (!val) {
        this.$set(this.formData, 'polCountryCname', '')
        this.$set(this.formData, 'polCountryEname', '')
        this.$set(this.formData, 'polCountryCode', '')
        return
      } else {
        let portItem = this.airPortArr.find((item) => item.portCode === val)
        this.$set(this.formData, 'polCountryCname', portItem.countryCname)
        this.$set(this.formData, 'polCountryEname', portItem.countryEname)
        this.$set(this.formData, 'polCountryCode', portItem.countryCode)
      }
    },
    // 空运港口
    airPortSearch(portName, state, type, code) {
      let params = {}
      if (code && !portName) {
        // 有选中值&&搜索条件不是空
        params = { portName: '', portCodes: code, state: state }
      } else {
        params = { portName: portName, portCodes: '', state: state }
      }
      this.$store.dispatch('dict/airportList', params).then((data) => {
        let portList = data.map((ele) => {
          // // `${ele.ename}(${ele.cname}${
          //     ele.cityCname ? ',' + ele.cityCname : ''
          //   }${ele.countryName ? ',' + ele.countryName : ''})`
          return Object.assign(ele, {
            value: ele.portCode,
            label: `${ele.portCode} (${ele.ename}-${ele.cname})`
          })
        })
        this[type] = [...portList]
      })
    },
    // validateNum(errMsg) {
    //   return (rule, value, callback) => {
    //     if (!Number.isInteger(Number(value))) {
    //       this.$message.error(errMsg)
    //       callback(new Error('请输入数字值'))
    //     } else {
    //       if (value < 0) {
    //         callback(new Error('请输入正整数'))
    //       } else {
    //         callback()
    //       }
    //     }
    //   }
    // },
    validateForm() {
      return new Promise((resolve, reject) => {
        this.$refs.orderBookInfoForm.validate((valid) => {
          if (valid) {
            resolve()
          } else {
            console.log(valid)
            reject()
          }
        })
      })
    },
    clearValidate() {
      this.$refs.orderBookInfoForm.clearValidate()
    }
  }
}
</script>

<style lang="scss">
.cont-two-line {
  min-height: 0px !important;
}
.orderBookInfo-box {
  .el-form-item__content {
    line-height: 20px;
  }
  .el-form-item__label {
    line-height: 20px;
  }
  margin-top: 10px;
  overflow: hidden;
  .row-column {
    // display: inline-block;
    // height: 100%;
    padding-right: 8px;
    .cont260.bd-cont {
      min-height: 250px;
      .h1 {
        line-height: 24px;
        height: 24px;
        background: #f8f9fd;
        border-radius: 2px 2px 0px 0px;
        font-size: 12px;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-pack: justify;
        -ms-flex-pack: justify;
        justify-content: space-between;
        padding: 0 8px;
        .label {
          font-weight: bold;
        }
      }
      .pd8 {
        padding: 8px;
        .el-form-item {
          margin-bottom: 4px;
        }
      }
    }
    .cont260 {
      border-radius: 2px;
      border: 1px solid #e9e9e9;
    }
  }
}
.air-orderbook-info-table {
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
        padding-right: 24px;
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
          margin-left: 0 !important;
        }
        .el-radio__label {
          font-size: 12px;
        }
        // .el-date-editor.el-input.el-input--prefix .el-input__inner {
        //   padding-left: 20px;
        // }
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
          right: -17px;
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
.order-detail-blNo-box {
  display: flex;
  .bl-split {
    text-align: center;
    width: 4%;
  }
}
</style>
