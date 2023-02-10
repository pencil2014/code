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
                  <el-select size="mini" :disabled="disabledState" style="width:100%" clearable v-model="formData.polPortCode" filterable remote reserve-keyword placeholder="请选择起运港" :remote-method="(val)=>{ polPortRemoteMethod(val,formData.polPortCode)}" @focus="polPortRemoteMethod('',formData.polPortCode)" @change="handleChangePolPortCode">
                    <el-option v-for="item in airPortArr" :key="item.value" :disabled="item.value===formData.podPortCode" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="目的地" label-width="80px" prop="podPortCode">
                  <el-select size="mini" v-model="formData.podPortCode" filterable remote clearable :disabled="disabledState" style="width: 100%" placeholder="请选择目的地" :remote-method="(val)=>{ podPortFilterMehod(val,formData.podPortCode)}" @focus="podPortFilterMehod('',formData.podPortCode)" @change="handleChangePodPortCode">
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
                <!-- &&createItem.serviceList.includes('book') -->
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
                <!--  prop="airLine" -->
                <el-form-item label="航空公司" label-width="100px">
                  <el-select style="width:100%" :disabled="bdAndPricingAndOpDisabledState" size="mini" clearable v-model="formData.airLine" filterable remote reserve-keyword placeholder="请选择航空公司" :remote-method="val => remoteMethod(val,formData.airLine)" @focus="remoteMethod('',formData.airLine)">
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
                <!--  prop="etdTime" -->
                <el-form-item class="timeSpecial" label="预计起飞日期" label-width="100px" prop="etdTime">
                  <elDatePickerLimit :field="'etdTime'" :disabled="bdAndPricingAndOpDisabledState" size="mini" v-model="formData.etdTime" type="date" style="width: 100%" clearable placeholder="请选择预计起飞日期" value-format="yyyy-MM-dd" />
                </el-form-item>
                <el-form-item label="中转方式" label-width="100px">
                  <el-select v-model="formData.airTransitWay" size="mini" clearable placeholder="请选择中转方式" style="width: 100%" :disabled="airTransitWayDisabled  ||pricingAuditEmployeeDisabled">
                    <el-option v-for="(item, index) in dictMap.airTransferMode" :label="item.label" :value="item.value" :key="index">
                    </el-option>
                  </el-select>
                </el-form-item>
                <!--  prop="poDealCityCode" -->
                <el-form-item label="交仓地点" label-width="100px">
                  <el-select size="mini" v-model="formData.poDealCityCode" filterable remote clearable :disabled="bdAndPricingdisabledState" style="width: 100%" placeholder="请输入" @change="getCityName" :remote-method="(val)=>{ citySelectQuery(val,formData.poDealCityName)}" @focus="citySelectQuery('',formData.poDealCityName)">
                    <el-option v-for="item in poDealCityArr" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                  </el-select>
                </el-form-item>
                <!--  prop="poDealTime" -->
                <el-form-item class="timeSpecial" label="交仓时间" label-width="100px">
                  <elDatePickerLimit :disabled="bdAndPricingdisabledState" v-model="formData.poDealTime" size="mini" type="date" style="width: 100%" clearable placeholder="请选择交仓时间" value-format="yyyy-MM-dd" />
                </el-form-item>
                <!--  prop="bkgAgentSupplierId" -->
                <div v-if="(!['draft', 'refuse','pre_submit','submit'].includes(this.createItem.orderStatus) || isPricing) && formItemIsShow('bkgAgentSupplierId')">
                  <el-form-item label="订舱代理" prop="bkgAgentSupplierId" label-width="100px">
                    <el-select size="mini" :disabled="!['draft', 'refuse','pre_submit','submit'].includes(this.createItem.orderStatus) ||pricingAuditEmployeeDisabled" v-model="formData.bkgAgentSupplierId" @change="selectBkgAgentSupplier" filterable clearable remote style="width: 100%" placeholder="请输入" :remote-method="val => bkgAgentSupplierRemoteMethod(val,formData.bkgAgentSupplierName)" @focus="bkgAgentSupplierRemoteMethod('',formData.bkgAgentSupplierName)">
                      <el-option v-for="(item, index) in bkgAgentSupplierOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
                    </el-select>
                  </el-form-item>
                </div>
                <!--  prop="isExternal" -->
                <div v-if="!['draft', 'refuse','pre_submit','submit'].includes(this.createItem.orderStatus) || isPricing">
                  <el-form-item label="是否外配" prop="isExternal" label-width="100px">
                    <el-select size="mini" v-model="formData.isExternal" clearable style="width: 100%" placeholder="请选择" :disabled="!['draft', 'refuse','pre_submit','submit'].includes(this.createItem.orderStatus) ||pricingAuditEmployeeDisabled">
                      <el-option v-for="item in externalOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                    </el-select>
                  </el-form-item>
                </div>
                <!--  prop="contractNo" -->
                <el-form-item v-if="!['draft', 'refuse','pre_submit','submit'].includes(this.createItem.orderStatus) || isPricing" label="合约号" label-width="100px">
                  <el-input clearable size="mini" maxlength="64" v-model="formData.contractNo" :disabled="!['draft', 'refuse','pre_submit','submit'].includes(this.createItem.orderStatus) ||pricingAuditEmployeeDisabled"></el-input>
                </el-form-item>
                <!-- &&createItem.serviceList.includes('book')   prop="poNo"-->
                <el-form-item label="入仓编号" label-width="100px" v-if="(!['draft', 'refuse','pre_submit','submit'].includes(this.createItem.orderStatus) || isOp)">
                  <el-input size="mini" v-model="formData.poNo" maxlength="64" clearable :disabled="!isOp || isDisabled" placeholder="请输入">
                  </el-input>
                </el-form-item>
                <el-form-item v-if="!['draft', 'refuse','pre_submit','submit'].includes(createItem.orderStatus) || isPricing" label="审单备注" label-width="100px">
                  <el-input @dblclick.native="showRemarkDetail(formData.auditRemark)" clearable size="mini" maxlength="512" type="textarea" rows="4" show-word-limit v-model="formData.auditRemark" :disabled="!['draft', 'refuse','pre_submit','submit'].includes(createItem.orderStatus)  ||pricingAuditEmployeeDisabled"></el-input>
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
                <el-form-item v-if="(['submit'].includes(createItem.orderStatus) && isPricing) && formData.jointAuditEmployeeId!==userId" label="协助审核人" prop="jointAuditEmployeeId" label-width="135px">
                  <el-select size="mini" :disabled="pricingAuditEmployeeDisabled" :style="{ width: pricingAuditEmployeeDisabled ? 'calc(100% - 42px)' : '100%' }" v-model="formData.jointAuditEmployeeId" filterable remote clearable placeholder="请输入" :remote-method="auditEmployeeSearch" @focus="auditEmployeeSearch('')">
                    <el-option v-for="item in auditEmployeeList" :key="item.value" :label="item.label" :value="item.value" :disabled="userId===item.value">
                      {{item.cname}}<em v-if="item.deptCode" style="color: #999;font-style: normal">({{item.deptCname}})</em>
                    </el-option>
                  </el-select>
                  <el-button @click="cancelJoint" v-if="pricingAuditEmployeeDisabled" size="mini">撤回</el-button>
                </el-form-item>
                <!-- <span v-if="showcCustomsSupplier">
                  <el-form-item label="报关行" label-width="135px" prop="customsSupplierId">
                    <el-select style="width:100%" :disabled="(customsSupplierDisabledState || (pricingAuditEmployeeDisabled && !isOp)) && !opEditIsBreak" size="mini" clearable v-model="formData.customsSupplierId" filterable remote reserve-keyword placeholder="请选择报关行" @change="changeCustomsSupplie" :remote-method="val => getCustomsSupplieList(val)" @focus="getCustomsSupplieList('')">
                      <el-option v-for="(item,i) in customsSupplieList" :key="i" :label="item.label" :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </span>
                <span v-if="showcCustomsSupplier">
                  <el-form-item label="车队" label-width="135px" prop="truckSupplierId">
                    <el-select style="width:100%" :disabled="(customsSupplierDisabledState || (pricingAuditEmployeeDisabled && !isOp)) && !opEditIsBreak" size="mini" clearable v-model="formData.truckSupplierId" filterable remote reserve-keyword placeholder="请选择车队" @change="changeTruckSupplier" :remote-method="val => getTruckSupplierList(val)" @focus="getTruckSupplierList('')">
                      <el-option v-for="(item,i) in truckSupplierList" :key="i" :label="item.label" :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </span> -->

                <el-form-item label="运输条款" label-width="135px">
                  <el-select v-model="formData.transportTerm" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="bdAndPricingdisabledState">
                    <el-option v-for="(item, index) in dictMap.airTransportTerm" :label="item.label" :value="item.value" :key="index">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="报关方式" prop="airCustomsType" label-width="135px">
                  <el-select v-model="formData.airCustomsType" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="bdAndPricingdisabledState">
                    <el-option v-for="(item, index) in dictMap.airCustomsType" :label="item.label" :value="item.value" :key="index">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="运单方式" prop="airBillType" label-width="135px">
                  <el-select v-model="formData.airBillType" @change="changeAirBillType" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="bdAndPricingAndOpDisabledState">
                    <el-option v-for="(item, index) in dictMap.airTransitWay" :label="item.label" :value="item.value" :key="index">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="分单数" prop="billSplitNum" label-width="135px">
                  <el-input placeholder="请输入" size="mini" v-model="formData.billSplitNum" clearable :disabled="bdAndPricingAndOpDisabledState || formData.airBillType==='immediacy'" @input="checkBillSplitNum(formData.billSplitNum)"></el-input>
                </el-form-item>
                <el-form-item label="付款方式" prop="airPayMode" label-width="135px">
                  <el-select v-model="formData.airPayMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="bdAndPricingdisabledState">
                    <el-option v-for="(item, index) in dictMap.airPayMode" :label="item.label" :value="item.value" :key="index">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="随机文件" label-width="135px">
                  <el-select v-model="formData.airDocumentType" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="bdAndPricingdisabledState">
                    <el-option v-for="(item, index) in dictMap.airDocumentTpe" :label="item.label" :value="item.value" :key="index">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="业务日期" label-width="135px" v-if="!['draft', 'refuse','pre_submit','submit'].includes(createItem.orderStatus)">
                  <elDatePickerLimit size="mini" :style="{ width: showChangeBizDate ? 'calc(100% - 42px)' : '100%' }" v-model="formData.bizDate" disabled type="date" style="width: 100%" clearable placeholder="业务日期" value-format="yyyy-MM-dd" />
                  <el-button v-if="showChangeBizDate" @click="handleChangeBizDate" size="mini">修改</el-button>
                </el-form-item>
                <el-form-item label="海关是否查验" label-width="135px" prop="isCustomsInspection" v-if="(!['draft', 'refuse','submit'].includes(createItem.orderStatus) || isOp)">
                  <el-radio-group v-model="formData.isCustomsInspection">
                    <el-radio :label="item.value" :disabled="!isOp || isDisabled" v-for="(item, index) in yesOrNoOptions" :key="index">{{ item.label }}</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item class="timeSpecial" label="海关放行时间" prop="customsReleaseTime" label-width="135px" v-if="(!['draft', 'refuse','submit'].includes(createItem.orderStatus) || isOp)">
                  <elDatePickerLimit :field="'customsReleaseTime'" :disabled="!isOp || isDisabled" size="mini" v-model="formData.customsReleaseTime" type="date" style="width: 100%" clearable placeholder="请选择海关放行时间" value-format="yyyy-MM-dd" />
                </el-form-item>
                <!--  prop="tradeTypeCode" -->
                <el-form-item label="贸易方式" label-width="135px">
                  <el-select v-model="formData.tradeTypeCode" size="mini" clearable placeholder="请选择" style="width: 100%" filterable remote :disabled="bdAndPricingdisabledState" :remote-method="(val)=>{ getShipTradeModeList(val,formData.tradeTypeCode)}" @focus="getShipTradeModeList('',formData.tradeTypeCode)">
                    <el-option v-for="(item, index) in shipTradeModeOptions" :label="item.label" :value="item.value" :key="index">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="贸易条款" prop="tradeTermsCode" label-width="135px">
                  <el-select v-model="formData.tradeTermsCode" size="mini" placeholder="请选择" filterable clearable style="width: 100%" :disabled="bdAndPricingdisabledState">
                    <el-option :label="item.label" :value="item.value" :key="item.value" v-for="item in dictMap['tradeTermsCode']"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item v-if="createItem.serviceType === 'st13'" label="发货人是否有出口权" label-width="135px" prop="shipperCanExport">
                  <!-- 非操作，业务不可以录入 协同单不能录入，订单已完成不能录入-->
                  <el-select v-model="formData.shipperCanExport" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="(disabledAddOpState || isDisabled) && !opEditIsBreak">
                    <el-option v-for="(item, index) in canExportOptions" :label="item.label" :value="item.value" :key="index">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="收货人是否有进口权" label-width="135px" prop="consigneeCanImport">
                  <el-select v-model="formData.consigneeCanImport" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="(disabledAddOpState || isDisabled) && !opEditIsBreak">
                    <el-option v-for="(item, index) in canExportOptions" :label="item.label" :value="item.value" :key="index">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="提货人" v-if="showReceiver&&createItem.serviceType === 'st13'" prop="pickName" label-width="135px">
                  <el-input placeholder="请输入" size="mini" v-model="formData.pickName" maxlength="16" clearable :disabled="(disabledAddOpState || isDisabled) && !opEditIsBreak"></el-input>
                </el-form-item>
                <el-form-item label="提货人联系方式" v-if="showReceiver&&createItem.serviceType === 'st13'" prop="pickMobile" label-width="135px">
                  <el-input placeholder="请输入" size="mini" v-model="formData.pickMobile" clearable maxlength="16" :disabled="(disabledAddOpState || isDisabled) && !opEditIsBreak"></el-input>
                </el-form-item>
                <el-form-item label="提货人地址" v-if="showReceiver&&createItem.serviceType === 'st13'" prop="pickAddress" label-width="135px">
                  <el-input placeholder="请输入" type="textarea" clearable rows="4" show-word-limit maxlength="128" size="mini" v-model="formData.pickAddress" :disabled="(disabledAddOpState || isDisabled) && !opEditIsBreak"></el-input>
                </el-form-item>
                <el-form-item label="订舱备注" label-width="135px" v-if="(!['draft', 'refuse','pre_submit','submit'].includes(this.createItem.orderStatus) || isOp)">
                  <el-input @dblclick.native="showRemarkDetail(formData.bkgRemark)" type="textarea" clearable rows="4" maxlength="512" size="mini" placeholder="请输入" show-word-limit v-model="formData.bkgRemark" :disabled="!isOp || isDisabled"></el-input>
                </el-form-item>
                <el-form-item label="备注" label-width="135px" prop="bdRemark" :show-message="false" v-if="$route.query.source !== 'jointList'">
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
import { bookFileDelete } from '@/api/airTransport/order-import'
import ChangeBizDatePop from './changeBizDatePop'
import { bizdateChange } from '@/api/order/list'
import AuditRemark from '@/views/order/order/orderList/components/auditRemark'
import {
  citySelectList,
  shipTradeModeList,
  baseDeptParticipants
} from '@/api/base'
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
  etdTime: '', // 预计起飞日期
  airTransitWay: '', // 中转方式
  polPortCode: '', // 起运港CODE
  podPortCode: '', // 目的地
  bookingFileName: '',
  auditRemark: '',
  bkgAgentSupplierId: '',
  bkgAgentSupplierName: '',
  poNo: '',
  bkgRemark: '',
  tradeTypeCode: '',
  shipperCanExport: '',
  consigneeCanImport: '',
  pickName: '',
  pickMobile: '',
  pickAddress: '',
  tradeTermsCode: '',
  customsSupplierId: '',
  customsSupplierName: '',
  truckSupplierId: '',
  truckSupplierName: '',
  jointAuditEmployeeId: ''
}
var timer = ''
export default {
  name: 'air-order-info',
  data() {
    return {
      remarkContent: '',
      remarkVisible: false,
      bizDateModify: this.$store.state.airTransport.airOrderInfo.bizDateModify,
      changeBizDateShow: false,
      auditEmployeeList: [],
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
        airTransitWay: [
          { required: true, message: '请输入', trigger: 'change' }
        ],
        polPortCode: [{ required: true, message: '请输入', trigger: 'change' }],
        podPortCode: [{ required: true, message: '请输入', trigger: 'change' }],
        intrustRemark: [
          { required: true, message: '请输入', trigger: 'change' }
        ],
        bkgAgentSupplierId: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        isExternal: [{ required: true, message: '请选择', trigger: 'change' }],
        contractNo: [{ required: true, message: '请输入', trigger: 'change' }],
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
        tradeTypeCode: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        shipperCanExport: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        consigneeCanImport: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        pickName: [{ required: true, message: '请选择', trigger: 'change' }],
        pickMobile: [{ required: true, message: '请选择', trigger: 'change' }],
        pickAddress: [{ required: true, message: '请选择', trigger: 'change' }],
        tradeTermsCode: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        customsSupplierId: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        truckSupplierId: [
          { required: true, message: '请选择', trigger: 'change' }
        ]
      },
      airLineArr: [],
      airPortArr: [], // 起运港
      unloadingPort: [], // 卸货港
      destinationArr: [], // 目的地
      airSysLineArr: [], // 系统航线
      bkgAgentSupplierOptions: [], // 订舱代理下拉
      shipTradeModeOptions: [], // 贸易方式
      showReceiver: false,
      canExportOptions: [
        { label: '是', value: 'y' },
        { label: '否', value: 'n' }
      ],
      customsSupplieList: [], // 报关行
      truckSupplierList: [], // 车队
      yesOrNoOptions: [
				{ label: '是', value: 'Y' },
				{ label: '否', value: 'N' }
			]
    }
  },
  props: {
    pricingAuditEmployeeDisabled: {
      type: Boolean,
      default: false
    },
    disabledAuditEmployeeId: {
      type: Boolean,
      default: false
    },
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
  created() {
    if (this.createItem.serviceType === 'st14') {
      this.rules.isExternal = []
      this.rules.bkgAgentSupplierId = []
    }
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole,
      roles: (state) => state.user.roles,
      airOrderInfo: (state) => state.airTransport.airOrderInfo,
      userId: (state) => state.user.userId
    }),
    customsSupplierDisabledState() {
      if (this.airOrderInfo.orderStatus === 'pre_submit') {
        if (this.airOrderInfo.bdManageEmployeeId !== this.userId) {
          return true
        } else {
          return false
        }
      } else {
        if (this.isOp) {
          // 优先判断操作，不然会有问题
          if (['pass'].includes(this.orderStatus)) {
            return false
          } else {
            return true
          }
        } else if (this.isPricing) {
          if (
            !['draft', 'refuse', 'pre_submit', 'submit'].includes(
              this.orderStatus
            )
          ) {
            return true
          } else {
            return false
          }
        } else {
          return true
        }
      }
    },
    showcCustomsSupplier() {
      if (this.airOrderInfo.orderStatus === 'pre_submit') {
        return false
      } else {
        if (this.isBd) {
          if (
            ['draft', 'refuse', 'pre_submit', 'submit'].includes(
              this.orderStatus
            )
          ) {
            return false
          } else {
            return true
          }
        } else {
          return true
        }
      }
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
      if (this.airOrderInfo.orderStatus === 'pre_submit') {
        if (this.airOrderInfo.bdManageEmployeeId !== this.userId) {
          return true
        } else {
          return false
        }
      } else {
        if (this.isBd) {
          if (!['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)) {
            return true
          } else {
            return false
          }
        } else if (this.isPricing) {
          if (!['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)) {
            return true
          } else {
            return false
          }
        } else {
          return true
        }
      }
    },
    bdAndPricingdisabledState() {
      // 业务和商务可以填写部分的权限
      if (this.airOrderInfo.orderStatus === 'pre_submit') {
        if (this.airOrderInfo.bdManageEmployeeId !== this.userId) {
          return true
        } else {
          return false
        }
      } else {
        if (this.isBd) {
          if (!['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)) {
            return true
          } else {
            return false
          }
        } else if (this.isPricing) {
          if (
            !['draft', 'refuse', 'pre_submit', 'submit'].includes(
              this.orderStatus
            )
          ) {
            return true
          } else {
            return false
          }
        } else {
          return true
        }
      }
    },
    bdAndPricingAndOpDisabledState() {
      // 业务，商务，操作可以编辑
      if (this.airOrderInfo.orderStatus === 'pre_submit') {
        if (this.airOrderInfo.bdManageEmployeeId !== this.userId) {
          return true
        } else {
          return false
        }
      } else {
        if (this.isBd) {
          if (!['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)) {
            return true
          } else {
            return false
          }
        } else if (this.isPricing) {
          if (
            !['draft', 'refuse', 'pre_submit', 'submit'].includes(
              this.orderStatus
            )
          ) {
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
      }
    },
    disabledAddOpState() {
      // 货物信息里面几个字段操作也可以修改
      if (this.airOrderInfo.orderStatus === 'pre_submit') {
        if (this.airOrderInfo.bdManageEmployeeId !== this.userId) {
          return true
        } else {
          return false
        }
      } else {
        if (this.isBd) {
          if (!['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)) {
            return true
          } else {
            return false
          }
        } else if (this.isOp) {
          if (['complete'].includes(this.orderStatus)) {
            return true
          } else {
            return false
          }
        } else if (this.isPricing) {
          if (
            !['draft', 'refuse', 'pre_submit', 'submit'].includes(
              this.orderStatus
            )
          ) {
            return true
          } else {
            return false
          }
        } else {
          return true
        }
      }
    },
    isView() {
      if (
        this.isBd &&
        !['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)
      ) {
        return true
      }
      if (this.isOp && !['pass'].includes(this.orderStatus)) {
        return true
      }
      return false
    },
    airTransitWayDisabled() {
      if (this.airOrderInfo.orderStatus === 'pre_submit') {
        if (this.airOrderInfo.bdManageEmployeeId !== this.userId) {
          return true
        } else {
          return false
        }
      } else {
        if (!this.isBd && !this.isPricing) {
          return true
        } else {
          return (
            (this.isBd &&
              !['draft', 'refuse', 'pre_submit'].includes(
                this.airOrderInfo.orderStatus
              )) ||
            (this.isPricing &&
              !['draft', 'refuse', 'pre_submit', 'submit'].includes(
                this.airOrderInfo.orderStatus
              ))
          )
        }
      }
    },
    // 操作在终止状态且未关账下可以编辑
    opEditIsBreak() {
      return (
        this.isOp &&
        this.airOrderInfo.orderStatus === 'break' &&
        this.airOrderInfo.finCloseStatus !== 'yes'
      )
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
    isPricing: {
      handler: function () {
        this.$nextTick(() => {
          this.$refs.orderBookInfoForm.clearValidate()
        })
      },
      immediate: true
    },
    bkgStatus: {
      handler: function (val) {
        console.log(val)
        if (!val || val === 'INIT') {
          this.$set(this.rules, 'poNo', [
            { required: false, message: '请选择', trigger: 'change' }
          ])
        } else {
          this.$set(this.rules, 'poNo', [
            { required: true, message: '请选择', trigger: 'change' }
          ])
        }

        if (val === 'BOOK_RELEASE') {
          this.$set(this.rules, 'etdTime', [
            { required: true, message: '请选择', trigger: 'change' }
          ])
        } else {
          this.$set(this.rules, 'etdTime', [
            { required: false, message: '请选择', trigger: 'change' }
          ])
        }
      },
      immediate: true
    },
    'createItem.serviceList': {
      handler(newVal, oldVal) {
        if (newVal.includes('pol_ltl')) {
          this.showReceiver = true
          if (
            this.isPricing &&
            ['submit'].includes(this.airOrderInfo.orderStatus) &&
            !this.formData.pickName
          ) {
            // 商务修改服务项时候，与服务项之相关是否显示的订单字段都不要求必填
            this.showReceiver = false
          }
        } else {
          this.showReceiver = false
        }
        if (newVal.includes('pol_declaration')) {
          this.rules.shipperCanExport = [
            { required: true, message: '请选择', trigger: 'change' }
          ]
          if (
            this.isPricing &&
            ['submit'].includes(this.airOrderInfo.orderStatus)
          ) {
            // 商务修改服务项时候，与服务项之相关是否显示的订单字段都不要求必填
            this.rules.shipperCanExport = [
              { required: false, message: '请选择', trigger: 'change' }
            ]
          }
        } else {
          this.rules.shipperCanExport = [
            { required: false, message: '请选择', trigger: 'change' }
          ]
        }
        if (newVal.includes('pod_comm_clearance')) {
          this.rules.consigneeCanImport = [
            { required: true, message: '请选择', trigger: 'change' }
          ]
          if (
            this.isPricing &&
            ['submit'].includes(this.airOrderInfo.orderStatus)
          ) {
            // 商务修改服务项时候，与服务项之相关是否显示的订单字段都不要求必填
            this.rules.consigneeCanImport = [
              { required: false, message: '请选择', trigger: 'change' }
            ]
          }
        } else {
          this.rules.consigneeCanImport = [
            { required: false, message: '请选择', trigger: 'change' }
          ]
        }

        if (
          newVal.includes('pol_declaration') ||
          newVal.includes('bonded_declaration') ||
          newVal.includes('pod_comm_clearance')
        ) {
          console.log(newVal)
          this.rules.customsSupplierId = [
            { required: true, message: '请选择', trigger: 'change' }
          ]
          if (
            this.isPricing &&
            ['submit'].includes(this.airOrderInfo.orderStatus)
          ) {
            // 商务修改服务项时候，与服务项之相关是否显示的订单字段都不要求必填
            this.rules.customsSupplierId = [
              { required: false, message: '请选择', trigger: 'change' }
            ]
          }
        } else {
          this.rules.customsSupplierId = [
            { required: false, message: '请选择', trigger: 'change' }
          ]
        }
        if (
          newVal.includes('pol_ltl') ||
          newVal.includes('bonded_truck') ||
          newVal.includes('truck') ||
          newVal.includes('pod_fcl_delivery') ||
          newVal.includes('pod_ltl_delivery')
        ) {
          this.rules.truckSupplierId = [
            { required: true, message: '请选择', trigger: 'change' }
          ]

          if (
            this.isPricing &&
            ['submit'].includes(this.airOrderInfo.orderStatus)
          ) {
            // 商务修改服务项时候，与服务项之相关是否显示的订单字段都不要求必填
            this.rules.truckSupplierId = [
              { required: false, message: '请选择', trigger: 'change' }
            ]
          }
        } else {
          this.rules.truckSupplierId = [
            { required: false, message: '请选择', trigger: 'change' }
          ]
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
    changeCustomsSupplie(value) {
      let item = this.customsSupplieList.find((el) => el.value === value)
      this.formData.customsSupplierName = item ? item.label : ''
    },
    changeTruckSupplier(value) {
      let item = this.truckSupplierList.find((el) => el.value === value)
      this.formData.truckSupplierName = item ? item.label : ''
    },
    // 报关行
    getCustomsSupplieList(queryString) {
      console.log(423434324)
      this.$store
        .dispatch('dict/querySupplierList', {
          category: 'category',
          value: 'declaration',
          queryString: queryString
        })
        .then((data) => {
          let customsSupplieList =
            (data.list &&
              data.list.map((ele) => {
                return Object.assign(ele, {
                  label: this.$language == 'en' ? ele.ename : ele.name,
                  value: ele.supplierId ? Number(ele.supplierId) : ''
                })
              })) ||
            []
          if (this.formData.customsSupplierId) {
            customsSupplieList.unshift({
              value: this.formData.customsSupplierId,
              label: this.formData.customsSupplierName
            })
          }
          this.customsSupplieList = unique(customsSupplieList, 'value')
        })
    },
    getTruckSupplierList(queryString) {
      this.$store
        .dispatch('dict/querySupplierList', {
          category: 'serviceCode',
          value: 'truck',
          queryString: queryString
        })
        .then((data) => {
          let truckSupplierList =
            (data.list &&
              data.list.map((ele) => {
                return Object.assign(ele, {
                  label: this.$language == 'en' ? ele.ename : ele.name,
                  value: ele.supplierId ? Number(ele.supplierId) : ''
                })
              })) ||
            []
          if (this.formData.truckSupplierId) {
            truckSupplierList.unshift({
              value: this.formData.truckSupplierId,
              label: this.formData.truckSupplierName
            })
          }
          this.truckSupplierList = unique(truckSupplierList, 'value')
        })
    },
    cancelJoint() {
      this.$emit('cancelJoint')
    },
    // 获取协助审单人下拉
    auditEmployeeSearch(val) {
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        roleCode: 'pricing'
      }
      baseDeptParticipants(data).then((res) => {
        this.auditEmployeeList = res.data.map((item) => {
          return Object.assign(item, {
            label: this.$language == 'en' ? item.ename : item.cname,
            value: item.employeeId
          })
        })
      })
    },
    formItemIsShow(prop) {
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
    // 贸易方式模糊查询
    getShipTradeModeList(queryString, code) {
      let data = {}
      if (code && !queryString) {
        // 有选中值&&搜索条件不是空
        data = { currPage: 1, pageSize: 50, queryKey: code }
      } else {
        data = { currPage: 1, pageSize: 50, queryKey: queryString }
      }
      shipTradeModeList(data).then((res) => {
        this.shipTradeModeOptions =
          (res.data &&
            res.data.list.map((o) => {
              return {
                label: o.shortName,
                value: o.code
              }
            })) ||
          []
      })
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
    handleChangePolPortCode(val) {
      // 通过起运港查询系统航线
      if (!val) {
        this.$set(this.formData, 'airSysLineCode', '')
        this.$set(this.formData, 'airSysLineName', '')

        this.$set(this.formData, 'polCountryCname', '')
        this.$set(this.formData, 'polCountryEname', '')
        this.$set(this.formData, 'polCountryCode', '')
        return
      } else {
        console.log(val)
        let portItem = this.airPortArr.find((item) => item.portCode === val)
        this.$set(this.formData, 'polCountryCname', portItem.countryCname)
        this.$set(this.formData, 'polCountryEname', portItem.countryEname)
        this.$set(this.formData, 'polCountryCode', portItem.countryCode)
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
    handleChangePodPortCode(val) {
      // 通过目的地查询系统
      if (!val) {
        this.$set(this.formData, 'podCountryCname', '')
        this.$set(this.formData, 'podCountryEname', '')
        this.$set(this.formData, 'podCountryCode', '')
        return
      } else {
        console.log(val)
        let portItem = this.destinationArr.find((item) => item.portCode === val)
        this.$set(this.formData, 'podCountryCname', portItem.countryCname)
        this.$set(this.formData, 'podCountryEname', portItem.countryEname)
        this.$set(this.formData, 'podCountryCode', portItem.countryCode)
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
        .el-input--suffix .el-input__inner {
          padding-right: 20px;
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
</style>
