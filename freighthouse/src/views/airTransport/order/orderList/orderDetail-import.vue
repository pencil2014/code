<template>
  <div>
    <div class="edit-container">
      <ComOrderInfo ref="first" :isPricing="isPricing" :isBd="isBd" :createItem="createItem" :pricingAuditEmployeeDisabled="pricingAuditEmployeeDisabled" :orderStatus="airOrderInfo.orderStatus" :serviceTypeOptions="serviceTypeOptions" :serviceCodeOptions="serviceCodeOptions" @getHeight="getShipInfoHeight" @updateCust="updateCust">
        <div class="operateBtn-group">
          <div class="btn-groups">
            <!-- <template v-if="$route.query.source !== 'jointList'"> -->
            <template v-if="isBd&&$route.query.source !== 'jointList'">
              <el-button size="mini" type="primary" @click="handleSave('draft')" :disabled="submitDisabled" v-if="['draft', 'refuse'].includes(createItem.orderStatus) || !viewState">保存</el-button>
              <el-button size="mini" type="primary" @click="handleSave('submit')" :disabled="submitDisabled" v-if="['draft', 'refuse'].includes(createItem.orderStatus) || !viewState">提交</el-button>
              <el-button size="mini" type="default" class="submitCancel" @click="handleSubmitCancel" :disabled="submitDisabled" v-if="createItem.orderStatus === 'submit'">撤回</el-button>
            </template>
            <!-- 操作 服务项有订舱才展示，避免协同操作人员进来也能点保存 -->
            <template v-if="isOp && hasDestination">
              <el-button size="mini" type="primary" class="" @click="saMailShow = true" v-if="['pass'].includes(createItem.orderStatus)" :disabled="submitDisabled">发送SA</el-button>
            </template>
            <template v-if="isOp">
              <!-- 放开已关账、已完成的限制 createItem.orderStatus === 'pass' || createItem.orderStatus === 'break' && createItem.finCloseStatus !== 'yes' -->
              <el-button size="mini" type="primary" class="" @click="handleEdit(false)" v-if="createItem.orderStatus === 'pass' || createItem.orderStatus === 'break'" :disabled="submitDisabled">保存</el-button>
              <!-- <el-button size="mini" type="success" class="" @click="handleFinish" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus)&&$route.query.source !== 'jointList'">完成</el-button> -->
              <el-button size="mini" type="danger" class="" @click="handleCancel('break')" :disabled="submitDisabled" v-if="opBreakBtnShow">终止</el-button>
              <el-button size="mini" type="danger" class="" @click="handleCancel('cancel')" :disabled="submitDisabled" v-if="opCancelBtnShow">取消</el-button>
              <el-button size="mini" type="danger" @click="handRefuseOp" v-if="createItem.bkgStatus!=='REFUSE'&&$route.query.source !== 'jointList'" :disabled="isDisabled">拒绝</el-button>
              <el-button size="mini" type="default" class="" @click="handleJointService" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus)&&$route.query.source !== 'jointList'">协同</el-button>
            </template>
            <!-- 商务 -->
            <template v-if="isPricing&&$route.query.source !== 'jointList'">
              <el-button size="mini" type="primary" @click="handleSave('draft')" :disabled="submitDisabled" v-if="['draft', 'refuse'].includes(createItem.orderStatus)">保存</el-button>
              <el-button size="mini" type="primary" @click="handleSave('submit')" :disabled="submitDisabled" v-if="['draft', 'refuse'].includes(createItem.orderStatus)">提交</el-button>
              <el-button size="mini" type="primary" @click="saveFunc('save')" :disabled="pricingAuditEmployeeDisabled" v-if="['submit'].includes(createItem.orderStatus) || (['submit','pass'].includes(createItem.orderStatus)&&createItem.bkgStatus==='REFUSE')">保存</el-button>
              <el-button @click="saveFunc('pass')" type="success" :disabled="(orderBookInfoData.jointAuditEmployeeId&&!airOrderInfo.auditEmployeeId) || (airOrderInfo.auditEmployeeId&&(airOrderInfo.auditEmployeeId!==userId))" size="mini" style="margin-left: 10px;" v-if="['submit'].includes(createItem.orderStatus) || (['submit','pass'].includes(createItem.orderStatus)&&createItem.bkgStatus==='REFUSE')">通过</el-button>
              <el-button size="mini" type="danger" :disabled="(orderBookInfoData.jointAuditEmployeeId&&!airOrderInfo.auditEmployeeId) || (airOrderInfo.auditEmployeeId&&(airOrderInfo.auditEmployeeId!==userId))" @click="refusePopShow=true" style="margin-left: 10px;" v-if="['submit'].includes(createItem.orderStatus) || (['submit','pass'].includes(createItem.orderStatus)&&createItem.bkgStatus==='REFUSE')">拒绝</el-button>
            </template>

            <!-- 登录人是参与人中业务，业主助理，下单助理时，展示的按钮-->
            <template v-if="showCareatOrderBtn">
              <el-button size="mini" type="danger" @click="handleDelete" :disabled="submitDisabled" v-if="createItem.orderStatus === 'draft'">删除</el-button>
              <el-button size="mini" type="danger" class="" @click="handleCancelRequest" :disabled="submitDisabled" v-if="createItem.bkgStatus === 'BOOK_RELEASE' && !['complete', 'break', 'cancel', 'close'].includes(createItem.orderStatus) && !copyState && createItem.cancelApplyStatus !== 'applied'">{{isOrderFeeCount ? '终止' : '取消'}}</el-button>
              <el-button size="mini" type="default" class="submitCancel" @click="handleCancelCancel" :disabled="submitDisabled" v-if="createItem.cancelApplyStatus === 'applied' && createItem.orderStatus !== 'break' && createItem.orderStatus !== 'cancel'">{{isOrderFeeCount ? '撤回终止' : '撤回取消'}}</el-button>
              <el-button size="mini" type="default" class="" @click="handleCopy" :disabled="submitDisabled" v-if="!addState">复制</el-button>
              <el-button size="mini" type="danger" @click="handleClose('break')" :disabled="submitDisabled" v-if="isOrderFeeCount&&createItem.orderStatus === 'refuse'">终止</el-button>
              <el-button size="mini" type="default" @click="handleClose('close')" :disabled="submitDisabled" v-if="!isOrderFeeCount&&createItem.orderStatus === 'refuse'">关闭</el-button>
            </template>
            <template v-if="(isEpricing || isEcs) && !isOp">
              <!-- 放开已关账、已完成的限制 createItem.orderStatus === 'pass' || createItem.orderStatus === 'break' && createItem.finCloseStatus !== 'yes' -->
              <el-button size="mini" type="primary" class="" @click="handleEdit(true)" v-if="createItem.orderStatus === 'pass' || createItem.orderStatus === 'break'" :disabled="submitDisabled">保存</el-button>
            </template>
            <!-- </template> -->
          </div>
          <div class="status">
            <span class="label ml10" v-if="!['draft', 'refuse','submit'].includes(createItem.orderStatus) || isOp">财务审核状态</span>
            <i class="el-icon-info" v-if="blFinStatusText!=='待申请'&&!['draft', 'refuse','submit'].includes(createItem.orderStatus) || isOp"></i>
            <span v-if="!['draft', 'refuse','submit'].includes(createItem.orderStatus) || isOp" class="value" :class="blFinStatus">{{ blFinStatusText }}</span>
            <span class="label ml10">订单状态</span>
            <span class="value" :class="createItem.orderStatus === 'complete' || createItem.orderStatus === 'pass' && airOrderInfo.isOpHandle !== 'y' ? 'green' 
							: createItem.orderStatus === 'submit' ? 'yellow' 
							: ['refuse','cancel','break'].includes(createItem.orderStatus) ? 'red' 
							: 'black'">
              {{ orderStatusFilter(createItem.orderStatus, $route.query.action, airOrderInfo.isOpHandle) }}
            </span>
            <span class="label ml10">关账状态</span>
            <span class="value" :class="finCloseStatusCn === '已关账' ? 'green' : finCloseStatusCn === '未关账' ? 'yellow' : 'black'">{{ finCloseStatusCn }}</span>
          </div>
        </div>
      </ComOrderInfo>
      <el-form v-if="bkgFormStatus" :inline="true" :model="opFormData" :show-message="false" :rules="opRules" class="air-order-book-info" ref="orderBookRef">
        <div class="air-book-status">
          <el-form-item label="订舱状态" style="margin-bottom:0;margin-right:40px" prop="bkgStatus">
            <el-radio-group v-model="opFormData.bkgStatus" @change="changeBkgStatus" :disabled="!isOp || isDisabled">{{opFormData.bkgStatus}}
              <el-radio v-for="(el,index) in airBkgStatus" :label="el.value" :key="index">{{el.label}}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="交仓状态" style="margin-bottom:0" prop="poDealStatus">
            <el-radio-group v-model="opFormData.poDealStatus" :disabled="!isOp || isDisabled">
              <el-radio label="INIT">未入仓</el-radio>
              <el-radio label="PROCESSING">处理中</el-radio>
              <el-form-item v-if="opFormData.poDealStatus==='PROCESSING'" label="" style="margin-left:-20px" prop="poDealProcessingReason">
                <el-select v-model="opFormData.poDealProcessingReason" :disabled="!isOp || isDisabled" size="mini" placeholder="请选择处理原因" style="width:180px">
                  <el-option v-for="(item,index) in $store.state.dict.dictMap.poDealProcessingReason" :key="index" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-radio label="IN">已入仓</el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="bl-fin-status">
            <!-- createItem.isTransportCheck === 'Y'  -->
            <el-button size="mini" @click="handShipment" :disabled="!isOp || isDisabled">货物出运</el-button>
          </div>
        </div>
      </el-form>
      <div class="order-cont">
        <el-form class="order-cont-form" size="mini">
          <div class="ship-cont air-cont" ref="shipInfoCont" :class="workAssignShow ? 'abs-toogle' : ''" :style="{ height: `${airInfoHeight}px` }">
            <div class="toggleWorkAssign" @click="toggleWorkAssign">
              <i class="hamburger el-icon-arrow-right" :class="{ 'is-active': true }"></i>
            </div>
            <!-- (货物来源：{{createItem.cargoSource | cargoSourceFilter}}) -->
            <h1 class="orderInfo-h1">基本信息</h1>
            <OrderBookInfo :bkgStatus="opFormData.bkgStatus" @getInfo="handleGetOrderInfo" :pricingAuditEmployeeDisabled="pricingAuditEmployeeDisabled" @cancelJoint="cancelJoint" :isPricing="isPricing" :isBd="isBd" :isOp="isOp" :formData="orderBookInfoData" :orderStatus="createItem.orderStatus" :createItem="createItem" @selectFile="selectFile" :isDisabled="isDisabled" @saveRemark="handleSaveRemark" ref="orderBookInfo" />
            <OverseasInfo @setQuoteList="setQuoteList" :quoteList="quoteList" :businessType="createItem.businessType" :bdId="bdId" :polCode="orderBookInfoData.polPortCode" :podCode="orderBookInfoData.podPortCode" :bkgStatus="opFormData.bkgStatus" @getInfo="getInfo" :isEpricing="isEpricing" :isEcs="isEcs" :isPricing="isPricing" :isBd="isBd" :isOp="isOp" :orderStatus="createItem.orderStatus" :createItem="createItem" ref="overseasInfo" />
            <SoContainer class="mt10" v-model="soContainerData" :isPricing="isPricing" :isBd="isBd" :isOp="isOp" :orderStatus="createItem.orderStatus" ref="soContainer" />
            <!-- 货物信息 -->
            <div class="detail-goods-summary">
              <div class="summary-info">
                <div>预计合计:</div>
              </div>
              <div class="summary-info">
                <div>件数：</div>
                <div>{{createItem.cargoStat.totalQuantity?createItem.cargoStat.totalQuantity:0}}件</div>
              </div>
              <div class="summary-info">
                <div>毛重：</div>
                <div>{{createItem.cargoStat.totalWeight?createItem.cargoStat.totalWeight:0}}KGS</div>
              </div>
              <div class="summary-info">
                <div>体积：</div>
                <div>{{createItem.cargoStat.totalVolume?createItem.cargoStat.totalVolume:0}}CBM</div>
              </div>
              <div class="summary-info">
                <div>比重：</div>
                <div>{{createItem.cargoStat.ratioWeight}}</div>
              </div>
              <el-form label-position="right" label-width="80px" :model="createItem" :rules="rules" :show-message="false" ref="summaryInfo" class="no-padding-form">
                <el-form-item label="结算重量：" style="margin-bottom:0" prop="cargoStat.settleWeight">
                  <el-input style="width:100px" size="mini" clearable v-model="createItem.cargoStat.settleWeight" :disabled="disabledAddOpState || isDisabled" @input="checkNumInputMaxVal(createItem.cargoStat.settleWeight)" placeholder="请输入">
                  </el-input>
                </el-form-item>
              </el-form>
            </div>
            <div class="row-cont mt15">
              <div class="row-cont-tit">
                <span class="tit">货物信息</span>
                <div class="row-cont-rt">
                  <span class="expand" @click="cargoShow=!cargoShow"> {{ cargoShow ? '收起' : '展开' }}<i :class="cargoShow ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
                </div>
              </div>
              <Cargo v-show="cargoShow" :isDisabled="isDisabled" :isPricing="isPricing" :isBd="isBd" :isOp="isOp" v-model="cargoData" :orderStatus="createItem.orderStatus" :createItem="createItem" ref="cargo" />
            </div>
            <!-- 物流信息 -->
            <div class="row-cont mt15">
              <div class="row-cont-tit">
                <span class="tit">物流信息</span>
                <div class="row-cont-rt">
                  <span class="expand" @click="contactShow=!contactShow"> {{ contactShow ? '收起' : '展开' }}<i :class="contactShow ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
                </div>
              </div>
              <Contact v-show="contactShow" :isPricing="isPricing" :isOp="isOp" :isBd="isBd" v-model="contactData" :orderStatus="createItem.orderStatus" ref="transport" />
            </div>
            <!-- 预计航程 -->
            <div class="row-cont mt10" v-if="!['draft', 'refuse','submit'].includes(this.createItem.orderStatus) || isPricing">
              <SwTransportInfo v-if="isRequire" :businessType="createItem.businessType" :isOp="isOp" :isPricing="isPricing" :pricingAuditEmployeeDisabled="pricingAuditEmployeeDisabled" v-model="swTransportInfoData" :orderStatus="createItem.orderStatus" ref="planVoyage-form" />
            </div>
            <div class="row-cont edit-row ml10" style="margin: 5px 10px 0 !important" v-if="(!['draft', 'refuse','submit'].includes(createItem.orderStatus)&&!isPricing) || isOp">
              <!-- 实际航程 -->
              <OpTransportInfo v-if="isRequire" :businessType="createItem.businessType" :bkgStatus="opFormData.bkgStatus" v-model="opTransportInfoData" :disabled="(!isOp && !isEpricing && !isEcs) || isDisabled" ref="optransportInfo-form" />
            </div>
          </div>
          <!-- 参与人与关键点 -->
          <div class="work-assign-cont work-assign-cont-air" :style="{height: `${checkPointHeight+32}px`}" v-if="workAssignShow">
            <el-tabs v-model="activityKey">
              <el-tab-pane v-for="item in workAssignMenus" :label="item.value" :name="item.key" :key="item.key"> </el-tab-pane>
            </el-tabs>
            <component ref="activityKey" :is="activityKey" :pricingAuditEmployeeDisabled="pricingAuditEmployeeDisabled" :orderIsJoint="orderIsJoint" :joinOrderWorkOptions="joinOrderWorkOptions" :createItem="createItem" :orderStatus="createItem.orderStatus" :serviceList="createItem.serviceList" :orderWorkOptions="orderWorkOptions" :obdDeptCode="obdDeptCode" :bdDeptCode="bdDeptCode" :asstDeptCode="asstDeptCode" v-if="createItem.orderNo" :checkPointHeight="checkPointHeight" :jointAuditWorkData="jointAuditWorkData" :jointWorkData="jointWorkData"></component>
          </div>
        </el-form>
      </div>
      <!-- 取消订单弹窗 -->
      <div v-if="cancelOrderPopShow">
        <CancelOrder @close="cancelRequestPopClose" :orderNo="$route.query.orderNo" :serviceType="'st13'" :isOrderFeeCount="isOrderFeeCount" />
      </div>
      <!-- 协同订单弹窗 -->
      <div v-if="jointServicePopShow">
        <JointService @close="jointServicePopClose" :createItem="createItem" />
      </div>
      <!-- 拒绝弹窗 -->
      <div v-if="refusePopShow">
        <RefuseDialog :params="createItem" @close="refusePopClose" />
      </div>
      <div v-if="exportEntrustedPopShow">
        <!-- 输出托书 -->
        <exportEntrustedPop @close="exportPopClose" />
      </div>
      <!-- 拒绝弹窗 -->
      <div v-if="opRefusePopShow">
        <OpRefuseDialog :params="createItem" @close="opRefusePopClose" />
      </div>
      <div v-if="uploadPopShow">
        <FileUpload @close="uploadPopClose" :detailData="createItem" />
      </div>
      <div v-if="saMailShow">
        <SaMail @close="saMailClose"></SaMail>
      </div>
      <!-- 货物出运弹窗 -->
      <div v-if="shipmentPopShow">
        <ShipmentDialog :params="createItem" @close="shipmentPopClose" />
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import Cookies from 'js-cookie'
import { getDictLabel } from '@/utils/tools'
import ComOrderInfo from './components/comOrderInfo'
import OrderBookInfo from './components/orderBookInfoImport'
import SoContainer from './components/soContainerImport'
import Cargo from './components/cargoImport'
import Worker from './components/worker'
import CheckPoint from './components/checkPoint'
import CancelOrder from './components/cancelOrder'
import JointService from './components/jointService'
import Contact from './components/contact'
import TransportInfo from './components/transportInfo'
import SwTransportInfo from './components/swTransportInfo.vue'
import { parseTime, randomString } from '@/utils'
import { baseBusinessList, baseBusinessServiceList } from '@/api/base'
import RefuseDialog from '../bookShip/components/refuseDialogImport'
import OpTransportInfo from './orderBook/components/transportInfo' // 实际航程
import exportEntrustedPop from './orderBook/components/exportEntrustedPop.vue'
import OpRefuseDialog from './orderBook/components/refuseDialogImport.vue'
import FileUpload from './components/importOrderFileUpload'
import RefuseAlert from '../bookShip/components/refuseAlert'
import { toViewPosition } from '@/utils/scroll-to.js'
import OverseasInfo from './components/overseasInfo.vue'
import ShipmentDialog from './components/shipmentDialog'
import {
  orderWork,
  // orderFinish,
  orderClose,
  orderDelete,
  jointAuditWork,
  jointWork,
  orderCancelCancel,
  orderStatusChangeBreak,
  orderWorkList
} from '@/api/order/list'
import { orderFinish } from '@/api/railway/list'
import {
  orderInfo,
  // orderSave,
  orderSubmitCancel,
  orderCancelHandle,
  orderCopy,
  orderEdit,
  fileBatchNo,
  auditPass,
  transportCheck,
  putDetail,
  fileList,
  orderAuthCheck,
  fileDelete,
  auditJointCancel
} from '@/api/airTransport/order-import'
import {
  orderFileList,
  orderFileDelete,
  mainRemarkUpdate
} from '@/api/order/list'
import { orderFeeCount } from '@/api/fin/fee'
import { isArray, closePage } from '@/utils'
// import { checkQuantityWeightVolume } from '@/utils/validate'
import tableTooltip from '@/components/Base/Table/table-tooltip'
import workerPricing from './components/workerPricing'
import SaMail from '@/views/order/order/orderList/components/saMail'
import {
  checkQuantityWeightVolume,
  validateNumPointEmpty,
  validateCntextAndNum,
  validateEntextAndNum,
  validateIntegerQuantity
} from '@/utils/validate'
import { orderConfigString } from '@/api/order/contract'
let timer = ''
export default {
  data() {
    return {
      isUsa: false,
      quoteList: [],
      saMailShow: false,
      orderWorkType: '',
      orderIsJoint: false,
      joinOrderWorkOptions: [],
      tableCellMouse: {
        cellDom: null, // 鼠标移入的cell-dom
        hidden: null, // 是否移除单元格
        row: null // 行数据
      },
      orderStatus: '',
      bookProgressValue: '',
      poDealStatusValue: '',
      uploadPopShow: false,
      fileList: [],
      opTransportInfoData: {
        formData: [
          // 航程信息
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
      },
      blFinStatus: '', //财务审核状态
      blFinStatusText: '待申请',
      opRules: {
        bkgStatus: [{ required: true, message: '请输入', trigger: 'change' }],
        poDealStatus: [
          { required: true, message: '请输入', trigger: 'change' }
        ],
        poDealProcessingReason: [
          { required: true, message: '请输入', trigger: 'change' }
        ]
      },
      opFormData: {
        bkgStatus: '', // 订舱状态
        poDealStatus: '', // 交仓状态
        poDealProcessingReason: '', // 处理中原因
        bkgRemark: ''
      },
      isClick: true,
      exportEntrustedPopShow: false, // 输出托书
      opRefusePopShow: false, // 操作拒绝
      refusePopShow: false,
      fileLength: '', // 上传的数量，单次上传一个时候不用请求附件批次
      bookingFile: null, // 托书附件文件流
      swTransportInfoData: {
        // 航线信息
        formData: [
          // 航程信息
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
      },
      isRequire: false,
      planVoyageList: {
        formData: []
      }, // 预计航程
      realVoyageList: {
        formData: []
      }, // 实际航程
      voyageListShow: true,
      rules: {
        'cargoStat.settleWeight': [
          { required: false, message: '请输入', trigger: 'change' },
          { validator: checkQuantityWeightVolume(999999999), trigger: 'change' }
        ]
      },
      state: 'valid',
      includeFeeder: '',
      workAssignShow: false,
      polCountryCode: '',
      podCountryCode: '',
      shipInfoHeight: 0, // 订舱信息高度
      checkPointHeight: 0, // 关键点高度
      createItem: { ...this.$store.state.airTransport.airOrderInfo },
      workAssignMenus: [
        {
          key: 'Worker',
          value: '参与人'
        },
        {
          key: 'CheckPoint',
          value: '关键点'
        }
      ],
      activityKey: 'Worker',
      // 取消订单弹窗
      cancelOrderPopShow: false,
      // 协同订单弹窗
      jointServicePopShow: false,
      // 港口反显数据
      fillPolData: {},
      orderWorkOptions: [],
      fillPortCodes: '',
      submitDisabled: false,
      isOrderFeeCount: false, // 是否有费用
      serviceTypeOptions: [], // 服务类型下拉
      serviceCodeOptions: [], // 服务项下拉
      sysLineCname: '', // 系统航线中文名称
      jointAuditWorkData: {},
      jointWorkData: [],
      finCloseStatusCn: '', // 关账状态/预关账状态
      obdDeptCode: '', // obd部门code
      bdDeptCode: '', // 销售部门code
      asstDeptCode: '', // 下单助理部门code
      cargoShow: true, // 货物信息
      contactShow: true, // 联系人
      orderBookInfoData: {
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
        podPortCode: '', // 目的地CODE
        intrustRemark: '',
        bizDate: '',
        polCountryCname: '',
        polCountryEname: '',
        polCountryCode: '',

        podCountryCname: '',
        podCountryEname: '',
        podCountryCode: '',
        poDealCityName: '',
        poDealCityCode: '',
        poDealTime: '',
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
        jointAuditEmployeeId: '',
        bdRemark: ''
      },
      soContainerData: {
        // 客户信息-默认
        formData: [
          {
            cargoCustId: null, //发货单位
            cargoCustName: '', //发货单位名称
            cargoReadyTime: null, //发货时间
            cargoBillType: '', // 单据方式
            cargoType: '' // 货物方式
            // poDealAddress: '', // 交仓地点
            // poDealTime: '' // 交仓时间
          }
        ]
      },
      cargoData: {
        // 货物信息
        formData: [
          {
            hscode: '',
            isWoodenPackage: '',
            cname: '', //中文品名
            ename: '', //英文品名
            property: '', //货物性质
            commodityTypeCode: '', // 货品分类
            mark: '', // 唛头
            quantity: null, // 件数
            weight: null, // 毛重
            volume: null, //体积
            packageInfo: '', //包装
            length: null, // 长
            width: null, //宽
            height: null // 高
          }
        ],
        rules: {
          hscode: [{ required: true, message: '请选择', trigger: 'change' }],
          cname: [
            { required: true, message: '请选择', trigger: 'change' }
            // { validator: validateCntextAndNum(), trigger: 'change' }
          ],
          ename: [
            { required: true, message: '请选择', trigger: 'change' },
            { validator: validateEntextAndNum(), trigger: 'change' }
          ],
          property: [{ required: true, message: '请选择', trigger: 'change' }],
          commodityTypeCode: [
            { required: true, message: '请选择', trigger: 'change' }
          ],
          mark: [{ required: true, message: '请选择', trigger: 'change' }],
          quantity: [
            { required: true, message: '请选择', trigger: 'change' },
            { validator: validateIntegerQuantity(), trigger: 'change' }
          ],
          weight: [
            { required: true, message: '请选择', trigger: 'change' },
            { validator: checkQuantityWeightVolume(), trigger: 'change' }
          ],
          volume: [
            { required: true, message: '请选择', trigger: 'change' },
            { validator: checkQuantityWeightVolume(), trigger: 'change' }
          ],
          packageInfo: [
            { required: true, message: '请选择', trigger: 'change' }
          ],
          length: [{ validator: validateNumPointEmpty(), trigger: 'change' }],
          width: [{ validator: validateNumPointEmpty(), trigger: 'change' }],
          height: [{ validator: validateNumPointEmpty(), trigger: 'change' }],
          mark: [{ validator: validateEntextAndNum(), trigger: 'change' }],
          isWoodenPackage: [
            { required: true, message: '请选择', trigger: 'change' }
          ]
        }
      },
      contactData: {
        // 物流信息
        shipper: '',
        consignee: '',
        notify1: '',
        notify2: '',
        notify3: ''
      },
      currentPixelRatio: window.devicePixelRatio, // 窗口缩放比例
      shipmentPopShow: false // 货物出运弹窗
    }
  },
  created() {
    this.init(this.airOrderInfo)
    this.airFileList()
    this.$nextTick(() => {
      console.log(this.airOrderInfo.orgAuditEmployeeId)
    })

    console.log(this.airOrderInfo.orgAuditEmployeeId)
     // 判断是否美国分公司
		this.getUsaData()
  },
  mounted() {
    this.orderAuthCheck()
      .then(() => {})
      .catch(() => {
        closePage()
      })
   
  },
  computed: {
    bkgFormStatus() {
      return (
        (!['draft', 'refuse', 'submit'].includes(this.createItem.orderStatus) &&
          !this.isPricing) ||
        this.isOp
      )
    },
    airInfoHeight() {
      let bkgFormHeight = 0
      if (this.bkgFormStatus) {
        bkgFormHeight = 40
      }
      return this.shipInfoHeight - bkgFormHeight
    },
    hasDestination() {
      // 是否要做目的港服务项
      if (
        this.airOrderInfo.serviceList.includes('pod_ltl_delivery') ||
        this.airOrderInfo.serviceList.includes('pod_comm_clearance') ||
        this.airOrderInfo.serviceList.includes('pod_warehouse') ||
        this.airOrderInfo.serviceList.includes('pod_change_doc')
      ) {
        return true
      }
      return false
    },
    workRoleIsPricing() {
      let isPricing = false
      if (
        !['draft', 'refuse', 'pre_submit', 'submit'].includes(
          this.airOrderInfo.orderStatus
        )
      ) {
        // 审核通过之后的单，参与人这里都当op视图
        if (
          this.roles.includes('op') ||
          this.roles.includes('ecs') ||
          this.roles.includes('epricing')
        ) {
          isPricing = false
        } else if (this.roles.includes('pricing')) {
          if (this.isPricing) {
            isPricing = true
          }
        }
      } else if (['submit'].includes(this.airOrderInfo.orderStatus)) {
        if (this.isPricing) {
          isPricing = true
        }
      }
      return isPricing
    },
    showCareatOrderBtn() {
      // return this.isBd
      if (this.isBd) {
        return true
      } else if (this.isPricing) {
        if (
          !this.bdId ||
          this.bdId == this.userId ||
          this.obdId == this.userId ||
          this.asstId == this.userId
        ) {
          return true
        } else if (
          (this.roles.includes('bd') ||
            this.roles.includes('obd') ||
            this.roles.includes('asst')) &&
          (this.roles.includes('manager') || this.roles.includes('duty'))
        ) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
      // if (
      //   !this.bdId ||
      //   this.bdId == this.userId ||
      //   this.obdId == this.userId ||
      //   this.asstId == this.userId
      // ) {
      //   return true
      // } else if (
      //   (this.roles.includes('bd') ||
      //     this.roles.includes('obd') ||
      //     this.roles.includes('asst')) &&
      //   (this.roles.includes('manager') || this.roles.includes('duty'))
      // ) {
      //   return true
      // } else {
      //   return false
      // }
    },
    pricingAuditEmployeeDisabled() {
      if (
        ((this.airOrderInfo.auditEmployeeId &&
          this.airOrderInfo.orgAuditEmployeeId &&
          this.airOrderInfo.auditEmployeeId !==
            this.airOrderInfo.orgAuditEmployeeId &&
          this.airOrderInfo.orgAuditEmployeeId === this.userId) ||
          this.airOrderInfo.orderStatus !== 'submit') &&
        this.isPricing
      ) {
        if (
          ((this.roles.includes('bd') ||
            this.roles.includes('obd') ||
            this.roles.includes('asst')) &&
            (this.roles.includes('manager') || this.roles.includes('duty'))) ||
          this.bdId === this.userId ||
          this.obdId === this.userId ||
          this.asstId === this.userId ||
          !this.bdId
        ) {
          return false
        } else {
          return true
        }
      } else {
        return false
      }
    },
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      order: (state) => state.order,
      finance: (state) => state.finance,
      orderList: (state) => state.airTransport.orderList,
      userId: (state) => state.user.userId,
      roles: (state) => state.user.roles,
      airOrderInfo: (state) => state.airTransport.airOrderInfo,
      userEditRoles: (state) => state.airTransport.orderList.userEditRoles,
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole
    }),
    isEcs() {
      return this.ordDetRole === 'ecs'
    },
    isEpricing() {
      return this.ordDetRole === 'epricing'
    },
    isOp() {
      return this.ordDetRole === 'op'
    },
    isBd() {
      if (this.userEditRoles.length === 0) {
        return (
          !this.isPricing &&
          (((this.roles.includes('bd') ||
            this.roles.includes('obd') ||
            this.roles.includes('asst')) &&
            (this.roles.includes('manager') || this.roles.includes('duty'))) ||
            this.bdId === this.userId ||
            this.obdId === this.userId ||
            this.asstId === this.userId ||
            !this.bdId)
        )
      } else {
        return this.ordDetRole === 'bd'
      }
    },
    isPricing() {
      if (
        this.userEditRoles.length === 1 &&
        this.userEditRoles[0] === 'pricing' &&
        this.ordDetRole === 'pricing'
      ) {
        return true
      }
      if (this.userEditRoles.length === 0) {
        if (this.roles.includes('pricing')) {
          if (['draft', 'refuse'].includes(this.createItem.orderStatus)) {
            if (
              this.userId == this.currentPricingId &&
              (this.bdId === this.userId ||
                this.obdId === this.userId ||
                this.asstId === this.userId ||
                !this.bdId)
            ) {
              // 草稿状态下，参与人商务是登录人,展示商务视图
              return true
            } else {
              // 有商务角色，但是参与人商务不是登录人，这是不需要他审核订单，也不展示商务视图
              return false
            }
          } else {
            // 其他状态
            if (
              this.userId == this.currentPricingId ||
              (this.roles.includes('pricing') &&
                (this.roles.includes('manager') || this.roles.includes('duty')))
            ) {
              // 如果登录人id是商务参与人
              return true
            } else if (
              this.userId == this.bdId ||
              this.userId == this.obdId ||
              this.userId == this.asstId
            ) {
              return false
            } else {
              return false
            }
          }
        } else {
          return false
        }
      } else {
        return this.ordDetRole === 'pricing'
      }
    },
    copyState() {
      return this.$route.query.action === 'copy'
    },
    viewState() {
      return this.$route.query.action === 'view' || this.orderStatus !== 'draft'
    },
    addState() {
      return !this.createItem.airCustomsType
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
    disabledAddOpState() {
      // 货物信息里面几个字段操作也可以修改
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
      } else if (this.isOp) {
        if (['complete'].includes(this.orderStatus)) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    },
    bdId() {
      let { workAssign } = this.createItem
      let bdItem = workAssign && workAssign.find((el) => el.jobCode === 'bd')
      if (bdItem && bdItem.employeeId) {
        return bdItem.employeeId
      }
      return ''
    },
    obdId() {
      let { workAssign } = this.createItem
      let obdItem = workAssign && workAssign.find((el) => el.jobCode === 'obd')
      if (obdItem && obdItem.employeeId) {
        return obdItem.employeeId
      }
      return ''
    },
    asstId() {
      let { workAssign } = this.createItem
      let asstItem =
        workAssign && workAssign.find((el) => el.jobCode === 'asst')
      if (asstItem && asstItem.employeeId) {
        return asstItem.employeeId
      }
      return ''
    },
    isDisabled() {
      return ['complete', 'break', 'cancel'].includes(
        this.airOrderInfo.orderStatus
      )
      // this.airOrderInfo.orderStatus === 'complete'
      // || this.$route.query.source === 'jointList'
      // return (
      //   (this.bookProgressValue === 'BOOK_RELEASE' &&
      //     this.poDealStatusValue === 'IN') ||
      //   this.isJoint
      // )
    },
    airBkgStatus() {
      let list = this.$store.state.dict.dictMap.airBkgStatus.filter((ele) => {
        return ele.value !== 'REFUSE'
      })
      return list
    },
    currentPricingId() {
      // 当前选择的商务
      let list = this.orderWorkOptions.map((item) => {
        return {
          jobCode: item.jobCode,
          employeeId: item.employeeId ? item.employeeId : 0
        }
      })
      let pricingItem = list.find((e) => e.jobCode === 'pricing')
      if (pricingItem) {
        return pricingItem.employeeId
      } else {
        return ''
      }
    },
    currentOpId() {
      let list = this.orderWorkOptions.map((item) => {
        return {
          jobCode: item.jobCode,
          employeeId: item.employeeId ? item.employeeId : 0
        }
      })
      let opItem = list.find((e) => e.jobCode === 'op')
      if (opItem) {
        return opItem.employeeId
      } else {
        return ''
      }
    },
    // 存在协同服务项
    serviceIsJoint() {
      return this.createItem.serviceInfoList.some((ele) => ele.isJoint === 'y')
    },
    // 操作取消按钮显示
    opCancelBtnShow() {
      return (
        ['pass'].includes(this.createItem.orderStatus) &&
        this.createItem.cancelApplyStatus === 'applied' &&
        !this.isOrderFeeCount &&
        this.$route.query.source !== 'jointList' &&
        !['CANCEL', 'BREAK'].includes(this.createItem.cancelJointHandleStatus)
      )
    },
    // 操作终止按钮显示
    opBreakBtnShow() {
      return (
        ['pass'].includes(this.createItem.orderStatus) &&
        this.createItem.cancelApplyStatus === 'applied' &&
        this.isOrderFeeCount &&
        this.$route.query.source !== 'jointList' &&
        !['CANCEL', 'BREAK'].includes(this.createItem.cancelJointHandleStatus)
      )
    }
  },
  components: {
    ComOrderInfo,
    OrderBookInfo,
    SoContainer,
    Cargo,
    Worker,
    CheckPoint,
    CancelOrder,
    JointService,
    Contact,
    TransportInfo,
    SwTransportInfo,
    RefuseDialog,
    OpTransportInfo,
    exportEntrustedPop,
    OpRefuseDialog,
    FileUpload,
    RefuseAlert,
    tableTooltip,
    workerPricing,
    OverseasInfo,
    SaMail,
    ShipmentDialog
  },
  props: {
  
    orderInfo: {
      type: Object,
      default: () => ({})
    },
    isJoint: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    workRoleIsPricing: {
      handler: function (val) {
        if (this.workRoleIsPricing) {
          // 商务视图+订单不是商务建的单，，，参与人节点用新的
          let flag = 1
          if (flag === this.orderWorkType) {
            return
          }
          this.orderWorkType = flag
          this.getOrderWorkList()
          this.workAssignMenus = [
            {
              key: 'workerPricing',
              value: '参与人'
            },
            {
              key: 'CheckPoint',
              value: '关键点'
            }
          ]
          this.activityKey = 'workerPricing'
        } else if (this.$route.query.jointNo) {
          let flag = 2
          if (flag === this.orderWorkType) {
            return
          }
          this.orderWorkType = flag
          this.getJointOrderWorkList()
          this.workAssignMenus = [
            {
              key: 'workerPricing',
              value: '参与人'
            },
            {
              key: 'CheckPoint',
              value: '关键点'
            }
          ]
          this.activityKey = 'workerPricing'
        } else {
          let flag = 3
          if (flag === this.orderWorkType) {
            return
          }
          this.orderWorkType = flag
          this.getOrderWork()
        }
      },
      immediate: true
    },
    airOrderInfo: {
      handler(newVal) {
        this.init(newVal)
      },
      deep: true
    },
    'cargoData.formData': {
      handler(newVal, oldVal) {
        console.log(newVal)
        let totalQuantity = 0
        let totalWeight = 0
        let totalVolume = 0
        let ratioWeight = 0
        for (let i = 0; i < newVal.length; i++) {
          if (!isNaN(newVal[i].quantity)) {
            // 件数
            totalQuantity += newVal[i].quantity * 1
          }
          if (!isNaN(newVal[i].weight)) {
            // 毛重
            totalWeight += newVal[i].weight * 1
          }
          if (!isNaN(newVal[i].volume)) {
            // 体积
            totalVolume += newVal[i].volume * 1
          }
        }
        if (totalWeight > 0 && totalVolume > 0) {
          ratioWeight = Number(totalWeight / totalVolume).fixed(3)
        }

        this.$set(this.createItem.cargoStat, 'totalQuantity', totalQuantity)
        this.$set(this.createItem.cargoStat, 'totalWeight', totalWeight)
        this.$set(this.createItem.cargoStat, 'totalVolume', totalVolume)
        this.$set(this.createItem.cargoStat, 'ratioWeight', ratioWeight)
        if (totalVolume > 0) {
          // 计费重量
          this.$set(
            this.createItem.cargoStat,
            'chargeWeight',
            Math.max(Number(totalVolume * 166.67).fixed(3), totalWeight)
          )
        } else {
          this.$set(this.createItem.cargoStat, 'chargeWeight', '')
        }
      },
      deep: true
    }
  },
  methods: {
    		getUsaData() {
			orderConfigString({ key: 'usa_company_code' }).then(res => {
				if (res.code === 0) {
					this.isUsa = res.data.includes(this.airOrderInfo.compDeptCode)
				} else {
					this.isUsa = false
				}
			})
		},
    handleGetOrderInfo() {
      let { orderNo, jointNo } = this.$route.query
      let params = {
        orderNo: orderNo
      }
      if (jointNo) {
        params.jointNo = jointNo
      }
      orderInfo(params).then((res) => {
        let { bookingFiles } = res.data
        this.createItem.bookingFiles = bookingFiles
      })
    },
    setQuoteList(val) {
      this.quoteList = val
    },
    // sa邮件
    saMailClose() {
      this.saMailShow = false
    },
    // 保存备注
    handleSaveRemark() {
      const loading = this.$loading({
        target: '.loadingBdRemark',
        lock: true,
        customClass: 'bdRemark-loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.3)'
      })
      mainRemarkUpdate({
        orderNo: this.$route.query.orderNo,
        orderData: this.orderBookInfoData.bdRemark
      }).finally((res) => {
        loading.close()
      })
    },
    getInfo() {
      this.$emit('getInfo')
    },
    getJointOrderWorkList() {
      // 协同列表进来
      let { workAssign } = this.airOrderInfo
      // airOrderInfo
      this.orderIsJoint = true
      let findItem = this.airOrderInfo.workAssign.find(
        (item) => item.jobCode === 'obd'
      )
      this.obdDeptCode = findItem ? findItem.deptCode : ''
      let bdFindItem = this.airOrderInfo.workAssign.find(
        (item) => item.jobCode === 'bd'
      )
      this.bdDeptCode = bdFindItem ? bdFindItem.deptCode : ''
      let asstFindItem = this.airOrderInfo.workAssign.find(
        (item) => item.jobCode === 'asst'
      )
      this.asstDeptCode = asstFindItem ? asstFindItem.deptCode : ''
      if (workAssign.length) {
        this.orderWorkOptions = workAssign.map((item) => {
          return Object.assign(item, { show: true })
        })
      }
      this.joinOrderWorkOptions = this.airOrderInfo.jointWorkAssign.map(
        (item) => {
          return Object.assign(item, { show: true })
        }
      )
      for (let i = 0; i < this.orderWorkOptions.length; i++) {
        if (this.orderWorkOptions[i].employeeId === 0) {
          this.orderWorkOptions[i].employeeName = ''
        }
      }
      for (let i = 0; i < this.joinOrderWorkOptions.length; i++) {
        if (this.joinOrderWorkOptions[i].employeeId === 0) {
          this.joinOrderWorkOptions[i].employeeName = ''
        }
      }
    },
    getOrderWorkList() {
      // 商务审单时参与人
      let params = {
        orderNo: this.$route.query.orderNo
      }
      let { workAssign } = this.createItem
      orderWorkList(params).then((res) => {
        this.orderIsJoint = res.data.isJoint === 'Y' ? true : false
        let findItem = res.data.orgWorkAssignList.find(
          (item) => item.jobCode === 'obd'
        )
        this.obdDeptCode = findItem ? findItem.deptCode : ''
        let bdFindItem = res.data.orgWorkAssignList.find(
          (item) => item.jobCode === 'bd'
        )
        this.bdDeptCode = bdFindItem ? bdFindItem.deptCode : ''
        let asstFindItem = res.data.orgWorkAssignList.find(
          (item) => item.jobCode === 'asst'
        )
        this.asstDeptCode = asstFindItem ? asstFindItem.deptCode : ''
        if (workAssign.length) {
          this.orderWorkOptions = workAssign.map((item) => {
            return Object.assign(item, { show: true })
          })
        } else {
          this.orderWorkOptions = res.data.orgWorkAssignList.map((item) => {
            return Object.assign(item, { show: true })
          })
        }
        if (res.data.isJoint === 'Y') {
          this.joinOrderWorkOptions = res.data.jointWorkAssignList.map(
            (item) => {
              return Object.assign(item, { show: true })
            }
          )
        }
        for (let i = 0; i < this.orderWorkOptions.length; i++) {
          if (this.orderWorkOptions[i].employeeId === 0) {
            this.orderWorkOptions[i].employeeName = ''
          }
        }
        for (let i = 0; i < this.joinOrderWorkOptions.length; i++) {
          if (this.joinOrderWorkOptions[i].employeeId === 0) {
            this.joinOrderWorkOptions[i].employeeName = ''
          }
        }
      })
    },
    // 撤回协同人员
    cancelJoint() {
      auditJointCancel({ orderNo: this.$route.query.orderNo }).then((res) => {
        // this.pricingAuditEmployeeDisabled = false
        this.$message({
          message: '撤回协助审核人操作成功',
          type: 'success'
        })
        this.$emit('getInfo')
      })
    },
    orderAuthCheck(data) {
      // 判断用户当前是否有权限留在当前页面
      return new Promise((resolve, reject) => {
        let params = {
          orderNo: this.$route.query.orderNo
        }
        if (this.$route.query.jointNo) {
          params.jointNo = this.$route.query.jointNo
        }
        orderAuthCheck(params)
          .then(() => {
            resolve('success')
          })
          .catch(() => {
            setTimeout(() => {
              reject()
            }, 500)
          })
      })
    },
    changeBkgStatus(val) {
      if (!val || val === 'INIT') {
        this.$refs.orderBookInfo.clearValidate() //基础信息
        this.$refs['optransportInfo-form'].clearValidate() // 实际航程
      }
    },
    // 鼠标移入cell
    showTooltip(row, column, cell) {
      this.tableCellMouse.cellDom = cell
      this.tableCellMouse.row = row
      this.tableCellMouse.hidden = false
    },
    // 鼠标移出cell
    hiddenTooltip() {
      this.tableCellMouse.hidden = true
    },
    putDetail() {
      // 放单详情
      putDetail({ orderNo: this.$route.query.orderNo, blId: 0 }).then((res) => {
        if (!res.data) {
          return
        }
        if (res.data.auditStatus === 'init') {
          this.blFinStatus = 'wait-status'
          this.blFinStatusText = '待申请'
        } else if (res.data.auditStatus === 'submit') {
          this.blFinStatus = 'wait-status'
          this.blFinStatusText = '待审核'
        } else if (res.data.auditStatus === 'pass') {
          this.blFinStatus = 'success-status'
          this.blFinStatusText = '通过'
        } else if (res.data.auditStatus === 'processing') {
          this.blFinStatus = 'wait-status'
          this.blFinStatusText = '处理中'
        } else if (res.data.auditStatus === 'refuse') {
          this.blFinStatus = 'refuse-status'
          this.blFinStatusText = '拒绝'
        }
      })
    },
    handleDeleteFile(data) {
      // 删除文件
      orderFileDelete({
        orderNo: data.orderNo,
        oid: data.oid
      }).then(() => {
        this.airFileList()
      })
    },
    // 上传弹窗关闭回调
    uploadPopClose(action) {
      this.uploadPopShow = false
      if (action === 'Confirm') {
        this.airFileList()
      }
    },
    handleAdd() {
      // 上传
      this.uploadPopShow = true
    },
    handleView(data) {
      this.$store.dispatch('order/previewFile', {
        fileNo: data.fileNo,
        fileName: data.name
      })
    },
    handleDownload(data) {
      //下载
      this.$store
        .dispatch('order/downloadBlobFile', {
          uri: '/base/webapi/file/download',
          params: {
            fileNo: data.fileNo
          }
        })
        .then((res) => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = data.name
          link.click()
        })
    },
    airFileList() {
      orderFileList({ orderNo: this.$route.query.orderNo }).then((res) => {
        this.fileList = res.data
      })
    },
    opRefusePopClose(action) {
      console.log(action)
      if (action === 'Confirm') {
        this.$emit('getInfo')
      }
      this.opRefusePopShow = false
    },
    handleExport(obj) {
      let { orderNo, jointNo } = this.$route.query
      let params = {
        orderNo: orderNo,
        docType: obj.docType
      }
      this.$store
        .dispatch('order/exportBlobFile', {
          uri: '/order/air/book/booking/export',
          data: params
        })
        .then((res) => {
          console.log(res)
          this.exportEntrustedPopShow = false
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download =
            `航空货运托运单${params.orderNo}.` + params.docType.toLowerCase()
          link.click()
        })
    },
    exportPopClose(action, value) {
      if (action === 'Confirm') {
        this.handleExport(value)
      } else {
        this.exportEntrustedPopShow = false
      }
    },
    handShipment() {
      this.shipmentPopShow = true
      // // 货物出运
      // this.$confirm('客户货物是否出运？确定后业务方可发起放货审核。', '提示', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '放弃',
      //   type: 'warning'
      // })
      //   .then(() => {
      //     let { orderNo, jointNo } = this.$route.query
      //     let params = {
      //       orderNo: orderNo
      //     }
      //     if (jointNo) {
      //       params.jointNo = jointNo
      //     }
      //     if (this.isClick) {
      //       this.isClick = false
      //       transportCheck(params)
      //         .then(() => {
      //           this.$message({
      //             message: '货物出运成功',
      //             type: 'success'
      //           })
      //           this.isClick = true
      //           this.$emit('getInfo')
      //         })
      //         .catch(() => {
      //           this.isClick = true
      //         })
      //     }
      //   })
      //   .catch(() => {})
    },
    shipmentPopClose(action, value) {
      if (action === 'Confirm') {
        let { orderNo, jointNo } = this.$route.query
        let params = {
          orderNo: orderNo
        }
        if (jointNo) {
          params.jointNo = jointNo
        }
        // 已推送到放单申请列表
        if (this.createItem.isTransportCheck === 'Y') {
          this.shipmentPopShow = false
        } else {
          transportCheck(params)
            .then(() => {
              this.$message({
                message: '货物出运成功',
                type: 'success'
              })
              this.shipmentPopShow = false
              this.$emit('getInfo')
            })
            .catch((err) => {
              console.log('err', err)
            })
        }
      } else {
        this.shipmentPopShow = false
      }
    },
    handleOutputLetter() {
      // op托书输出
      this.exportEntrustedPopShow = true
    },
    handRefuseOp() {
      // 操作拒绝
      this.opRefusePopShow = true
    },
    auditPass(type) {
      // 商务审核
      if (!this.currentPricingId) {
        this.$message.error('参与人商务不能为空')
        return false
      }
      if (!this.currentOpId) {
        this.$message.error('参与人操作不能为空')
        return false
      }
      let arr = []
      console.log(this.swTransportInfoData.formData)
      for (let i = 0; i < this.swTransportInfoData.formData.length; i++) {
        let obj = {}
        obj.carrierSupplierId =
          this.swTransportInfoData.formData[i].carrierSupplierId
        obj.carrierSupplierName =
          this.swTransportInfoData.formData[i].carrierSupplierName
        obj.etdTime = this.swTransportInfoData.formData[i].etdTime
        obj.etaTime = this.swTransportInfoData.formData[i].etaTime
        obj.eflightNumber = this.swTransportInfoData.formData[i].eflightNumber
        obj.polPortCode = this.swTransportInfoData.formData[i].polPortCode
        obj.polPortName = this.swTransportInfoData.formData[i].polPortName
        obj.unloadingPortCode =
          this.swTransportInfoData.formData[i].unloadingPortCode
        obj.unloadingPortName =
          this.swTransportInfoData.formData[i].unloadingPortName
        obj.voyageType = '预计'

        if (i === this.swTransportInfoData.formData.length - 1) {
          obj.voyageSort = '0'
        } else {
          obj.voyageSort = (i + 1).toString()
        }

        obj.transportMode = this.swTransportInfoData.formData[i].transportMode
        arr.push(obj)
      }

      let params = {
        orderNo: this.createItem.orderNo,
        submitType: type,
        auditRemark: this.orderBookInfoData.auditRemark,
        airLine: this.orderBookInfoData.airLine,
        contractNo: this.orderBookInfoData.contractNo,
        isExternal: this.orderBookInfoData.isExternal,
        pricingEmployeeId: this.currentPricingId, // 商务

        bkgEmployeeId: this.currentOpId // 操作
          ? this.currentOpId
          : null,
        bkgAgentSupplierId: this.orderBookInfoData.bkgAgentSupplierId
          ? this.orderBookInfoData.bkgAgentSupplierId
          : null, // 订舱代理
        bkgAgentSupplierName: this.orderBookInfoData.bkgAgentSupplierName
          ? this.orderBookInfoData.bkgAgentSupplierName
          : '', // 订舱代理name
        planVoyageList: arr,
        airTransitWay: this.orderBookInfoData.airTransitWay,
        transport: {
          ...this.contactData,
          transportTerm: this.orderBookInfoData.transportTerm,
          shipperCanExport: this.orderBookInfoData.shipperCanExport,
          consigneeCanImport: this.orderBookInfoData.consigneeCanImport,
          pickName: this.orderBookInfoData.pickName,
          pickMobile: this.orderBookInfoData.pickMobile,
          pickAddress: this.orderBookInfoData.pickAddress,
          tradeTypeCode: this.orderBookInfoData.tradeTypeCode,
          tradeTermsCode: this.orderBookInfoData.tradeTermsCode,
          customsSupplierId: this.orderBookInfoData.customsSupplierId,
          customsSupplierName: this.orderBookInfoData.customsSupplierName,
          truckSupplierId: this.orderBookInfoData.truckSupplierId,
          truckSupplierName: this.orderBookInfoData.truckSupplierName
        },
        serviceList: this.createItem.serviceList,

        etdTime: this.orderBookInfoData.etdTime,
        poDealCityName: this.orderBookInfoData.poDealCityName,
        poDealCityCode: this.orderBookInfoData.poDealCityCode,
        poDealTime: this.orderBookInfoData.poDealTime,
        airCustomsType: this.orderBookInfoData.airCustomsType,
        airBillType: this.orderBookInfoData.airBillType,
        billSplitNum: this.orderBookInfoData.billSplitNum,
        airPayMode: this.orderBookInfoData.airPayMode,
        airDocumentType: this.orderBookInfoData.airDocumentType,
        intrustRemark: this.orderBookInfoData.intrustRemark
      }
      if (
        this.orderBookInfoData.jointAuditEmployeeId &&
        !this.airOrderInfo.auditEmployeeId
      ) {
        // 协同审单人不存在&&选择了协同审单人
        params.jointAuditEmployeeId =
          this.orderBookInfoData.jointAuditEmployeeId
      }
      if (this.orderIsJoint) {
        let joinOrderWorkOptions = []
        joinOrderWorkOptions = [...this.joinOrderWorkOptions]
        let workArr = joinOrderWorkOptions.map((item) => {
          return {
            jobCode: item.jobCode,
            employeeId: item.employeeId ? item.employeeId : 0
          }
        })
        params.workAssign = workArr
        params.isJoint = this.orderIsJoint ? 'Y' : 'N'

        let opItem = workArr.find((item) => item.jobCode === 'op')

        if (!this.orderBookInfoData.jointAuditEmployeeId) {
          if (!(opItem && opItem.employeeId)) {
            this.$message.error(`协同参与人操作不能为空`)
            return
          }
        }
        params.bkgEmployeeId = opItem.employeeId
      }
      if (type === 'pass') {
        this.$confirm('是否通过该条审核信息？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          auditPass(params).then(() => {
            this.$message({
              type: 'success',
              message: '已通过该条审核信息',
              duration: 1000,
              onClose: () => {
                this.orderAuthCheck()
                  .then(() => {
                    // this.$emit('getInfo')
                  })
                  .catch(() => {
                    closePage()
                  })
              }
            })
            this.$emit('getInfo')
          })
        })
      } else {
        auditPass(params).then((res) => {
          this.$message({
            type: 'success',
            message: '保存成功',
            duration: 1000,
            onClose: () => {
              this.orderAuthCheck()
                .then(() => {
                  // this.$emit('getInfo')
                })
                .catch(() => {
                  closePage()
                })
            }
          })
          this.$emit('getInfo')
        })
      }
    },
    saveFunc(type) {
      // if (this.roles.includes('pricing')) {
      if (type === 'save') {
        this.auditPass(type)
      } else {
        this.validateAllForm()
          .then(() => {
            this.auditPass(type)
          })
          .catch(() => {
            toViewPosition('air-cont', 80)
            this.$message.error('请按要求填写数据')
          })
      }
      // }
    },
    refusePopClose() {
      this.refusePopShow = false
    },
    selectFile(fileData, fileLength) {
      // 托书文件流
      this.bookingFile = fileData
      this.fileLength = fileLength
      if (
        fileLength == 0 &&
        (!this.createItem.bookingFiles ||
          JSON.stringify(this.createItem.bookingFiles) === '{}')
      ) {
        this.$set(this.orderBookInfoData, 'bookingFileName', '')
      } else {
        this.$set(this.orderBookInfoData, 'bookingFileName', 'bookingFileName')
      }
    },

    savePricing() {
      // 商务保存，通过
    },
    savePricingRefuse() {
      // 商务拒绝
    },
    // 撤回取消订单
    handleCancelCancel(row) {
      let confirmTxt = this.isOrderFeeCount
        ? '是否撤回终止订单?'
        : '是否撤回取消订单?'
      this.$confirm(confirmTxt, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          orderCancelCancel({ orderNo: this.$route.query.orderNo }).then(
            (res) => {
              this.$message({
                type: 'success',
                message: '撤回成功',
                duration: 1000
                // onClose: () => {
                //   this.$emit('getInfo')
                // }
              })
              this.$emit('getInfo')
            }
          )
        })
        .catch(() => {})
    },
    updateCust() {
      this.$emit('getInfo')
    },
    validateForm() {
      return new Promise((resolve, reject) => {
        this.$refs.summaryInfo.validate((valid) => {
          if (valid) {
            resolve()
          } else {
            reject()
          }
        })
      })
    },
    checkNumInputMaxVal(value) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let reg =
          /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,3}|[1-9][0-9]*\.\d{1,3})))$/
        if (!value) {
        } else if (!reg.test(value) || value > 999999999) {
          let lastStr = value.substr(value.length - 1, 1)
          if (isNaN(value)) {
            this.$message({
              message: `结算重量请输入0-999999999的数字，小数点最多3位`,
              type: 'error',
              duration: 2000
            })
            this.$set(this.createItem.cargoStat, 'settleWeight', '')
          } else if (value > 999999999) {
            this.$message({
              message: `结算重量请输入0-999999999的数字，小数点最多3位`,
              type: 'error',
              duration: 2000
            })
            this.$set(this.createItem.cargoStat, 'settleWeight', 999999999)
          } else if (lastStr !== '.') {
            this.$message({
              message: `结算重量请输入0-999999999的数字，小数点最多3位`,
              type: 'error',
              duration: 2000
            })
            this.$set(
              this.createItem.cargoStat,
              'settleWeight',
              Number(value).fixed(3)
            )
          }
        }
      }, 800)
    },
    orderStatusFilter(status, action, isOpHandle) {
      // 新建或复制的订单状态都初始化为草稿
      if (!status && ['add', 'copy'].includes(action)) {
        status = 'draft'
      }
      let result = getDictLabel('orderStatus', status)
      // 操作中状态特殊处理
      if (status === 'pass' && isOpHandle === 'y') {
        result = '操作中'
      }
      return result
    },
    getShipInfoHeight(val) {
      let bodyHeight = document.body.clientHeight
      this.shipInfoHeight = bodyHeight - val
      this.checkPointHeight = bodyHeight - val
    },
    // 初始化
    init(data) {
      // 数据回选
      if (!data || !Object.keys(data).length) return
      // 甩柜，取消订单，协同，改船等弹窗默认关闭,目的港国家重置
      this.polCountryCode = ''
      this.podCountryCode = ''
      let workAssignStr = Cookies.get('airWorkAssignShow')
      this.workAssignShow = workAssignStr === '0' ? false : true
      // this.activityKey = 'Worker'
      this.submitDisabled = false
      this.isOrderFeeCount = false
      sessionStorage.setItem('serviceCode', '')
      let { action } = this.$route.query
      this.state = action === 'add' ? 'valid' : ''
      let tempData = JSON.parse(JSON.stringify(data))
      this.fillOrderInfo(tempData)
      if (this.workRoleIsPricing) {
        // 商务视图+订单不是商务建的单，，，参与人节点用新的
        this.getOrderWorkList()
        this.workAssignMenus = [
          {
            key: 'workerPricing',
            value: '参与人'
          },
          {
            key: 'CheckPoint',
            value: '关键点'
          }
        ]
        this.activityKey = 'workerPricing'
      } else if (this.$route.query.jointNo) {
        this.getJointOrderWorkList()
        this.workAssignMenus = [
          {
            key: 'workerPricing',
            value: '参与人'
          },
          {
            key: 'CheckPoint',
            value: '关键点'
          }
        ]
        this.activityKey = 'workerPricing'
      } else {
        this.getOrderWork()
      }
    },
    fillOrderInfo(data) {
      this.quoteList = data.quoteList || []
      this.orderStatus = data.orderStatus
      let {
        barge,
        ship,
        custid,
        custName,
        custIntrustNo,
        businessType,
        serviceType,
        serviceList,
        serviceInfoList,
        finCloseStatus,
        prefinCloseStatus
      } = data
      let cust = {
        custid,
        custName,
        custIntrustNo,
        businessType,
        serviceType
      }
      sessionStorage.setItem('custStr', JSON.stringify(cust))
      sessionStorage.setItem('serviceListStr', JSON.stringify(serviceList))
      sessionStorage.setItem(
        'serviceInfoListStr',
        JSON.stringify(serviceInfoList)
      )
      Object.assign(this.createItem, data, {
        orderStatus: data.orderStatus,
        checkPointList: data.checkPointList,
        workAssign: data.workAssign
      })
      this.bookProgressValue = data.bkgStatus
      this.poDealStatusValue = data.poDealStatus
      // 财务审核状态
      this.putDetail()
      // if (data.isTransportCheck === 'Y') {
      //   // 财务审核状态
      //   this.putDetail()
      // } else {
      //   this.blFinStatus = ''
      //   this.blFinStatusText = '待申请'
      // }

      // 预计航程信息回选
      if (isArray(data.planVoyageList) && data.planVoyageList.length > 0) {
        let arr = data.planVoyageList
        this.swTransportInfoData.formData = []
        for (let i = 0; i < arr.length; i++) {
          let obj = {
            carrierSupplierId: arr[i].carrierSupplierId
              ? arr[i].carrierSupplierId
              : '',
            carrierSupplierName: arr[i].carrierSupplierName
              ? arr[i].carrierSupplierName
              : '',
            etdTime: arr[i].etdTime ? arr[i].etdTime : '',
            etaTime: arr[i].etaTime ? arr[i].etaTime : '',
            eflightNumber: arr[i].eflightNumber ? arr[i].eflightNumber : '',
            polPortCode: arr[i].polPortCode ? arr[i].polPortCode : '',
            polPortName: arr[i].polPortName ? arr[i].polPortName : '',
            unloadingPortCode: arr[i].unloadingPortCode
              ? arr[i].unloadingPortCode
              : '',
            unloadingPortName: arr[i].unloadingPortName
              ? arr[i].unloadingPortName
              : '',
            voyageType: '预计',
            voyageSort: arr[i].voyageSort ? arr[i].voyageSort : '0',
            transportMode: arr[i].transportMode ? arr[i].transportMode : ''
          }
          this.swTransportInfoData.formData.push(obj)
        }
        this.isRequire = true
      } else {
        this.isRequire = true
      }
      // if (data.etdTime && !this.swTransportInfoData.formData[0].etdTime) {
      //   // 订单详情的预计起飞时间，需自动带入预计的国际1程里
      //   this.$set(this.swTransportInfoData.formData[0], 'etdTime', data.etdTime)
      // }
      // 实际航程
      if (
        Array.isArray(data.realVoyageList) &&
        data.realVoyageList.length > 0
      ) {
        let arr = data.realVoyageList
        this.opTransportInfoData.formData = []
        for (let i = 0; i < arr.length; i++) {
          let obj = {
            carrierSupplierId: arr[i].carrierSupplierId
              ? arr[i].carrierSupplierId
              : '',
            carrierSupplierName: arr[i].carrierSupplierName
              ? arr[i].carrierSupplierName
              : '',
            etdTime: arr[i].etdTime ? arr[i].etdTime : '',
            etaTime: arr[i].etaTime ? arr[i].etaTime : '',
            eflightNumber: arr[i].eflightNumber ? arr[i].eflightNumber : '',
            polPortCode: arr[i].polPortCode ? arr[i].polPortCode : '',
            polPortName: arr[i].polPortName ? arr[i].polPortName : '',
            unloadingPortCode: arr[i].unloadingPortCode
              ? arr[i].unloadingPortCode
              : '',
            unloadingPortName: arr[i].unloadingPortName
              ? arr[i].unloadingPortName
              : '',
            voyageType: '实际',
            voyageSort: arr[i].voyageSort ? arr[i].voyageSort : '0',
            transportMode: arr[i].transportMode ? arr[i].transportMode : ''
          }
          this.opTransportInfoData.formData.push(obj)
        }
      }
      this.opFormData = {
        bkgStatus: data.bkgStatus || 'INIT', // 订舱状态
        poDealStatus: data.poDealStatus, // 交仓状态
        poDealProcessingReason: data.poDealProcessingReason, // 处理中原因
        bkgRemark: data.bkgRemark
      }

      // 货物，航空，港口信息回选
      this.orderBookInfoData = {
        customsReleaseTime: data.transport ? data.transport.customsReleaseTime : '',
        isCustomsInspection: data.transport ? data.transport.isCustomsInspection : '',
        transportTerm: data.transport ? data.transport.transportTerm : '', // 运输条款
        airCustomsType: data.airCustomsType, // 报关方式
        billSplitNum: data.billSplitNum, // 分单数
        airBillType: data.airBillType, // 运单方式
        airPayMode: data.airPayMode, // 付款方式
        airDocumentType: data.airDocumentType, // 随机文件
        airLine: data.airLine, // 航空公司
        airSysLineCode: data.airSysLineCode, // 航线代码
        etdTime: data.etdTime, // 预计起飞日期
        airTransitWay: data.airTransitWay, // 中转方式
        polPortCode: data.polPortCode, // 起运港CODE
        podPortCode: data.podPortCode, // 目的地
        intrustRemark: data.intrustRemark,
        bizDate: data.bizDate,
        polCountryCname: data.polCountryCname,
        polCountryEname: data.polCountryEname,
        polCountryCode: data.polCountryCode,

        podCountryCname: data.podCountryCname,
        podCountryEname: data.podCountryEname,
        podCountryCode: data.podCountryCode,
        poDealCityName: data.poDealCityName,
        poDealCityCode: data.poDealCityCode,
        poDealTime: data.poDealTime,
        auditRemark: data.auditRemark,
        bkgAgentSupplierId: data.bkgAgentSupplierId,
        bkgAgentSupplierName: data.bkgAgentSupplierName,
        isExternal: data.isExternal,
        contractNo: data.contractNo,
        poNo: data.poNo,
        bkgRemark: data.bkgRemark,
        bookingFileName: data.bookingFiles ? 'bookingFileName' : '',

        tradeTypeCode: data.transport ? data.transport.tradeTypeCode : '',
        tradeTermsCode: data.transport ? data.transport.tradeTermsCode : '',
        shipperCanExport: data.transport ? data.transport.shipperCanExport : '',
        consigneeCanImport: data.transport
          ? data.transport.consigneeCanImport
          : '',
        pickName: data.transport ? data.transport.pickName : '',
        pickMobile: data.transport ? data.transport.pickMobile : '',
        pickAddress: data.transport ? data.transport.pickAddress : '',
        customsSupplierId: data.transport
          ? data.transport.customsSupplierId
          : '',
        customsSupplierName: data.transport
          ? data.transport.customsSupplierName
          : '',
        truckSupplierId: data.transport ? data.transport.truckSupplierId : '',
        truckSupplierName: data.transport
          ? data.transport.truckSupplierName
          : '',
        jointAuditEmployeeId: data.auditEmployeeId,
        bdRemark: data.bdRemark
      }

      if (data.polPortCode) {
        this.$store
          .dispatch('dict/airportList', {
            portName: '',
            portCodes: data.polPortCode,
            state: 'valid'
          })
          .then((res) => {
            if (res.length) {
              console.log(res)
              this.$set(
                this.orderBookInfoData,
                'airSysLineName',
                res[0].sysLineName
              )
            }
          })
      }

      // if (data.isTransportCheck === 'Y') {
      // this.putDetail() // 财务审核状态
      // }

      if (isArray(data.cargoCustList) && data.cargoCustList.length) {
        // 客户信息回选
        this.soContainerData.formData = data.cargoCustList
      }
      if (isArray(data.cargoList) && data.cargoList.length) {
        // 货物信息回选
        this.cargoData.formData = data.cargoList
      }
      if (data.transport) {
        // 物流信息回选
        this.contactData = data.transport
      }

      this.planVoyageList.formData = data.planVoyageList
        ? data.planVoyageList
        : []
      this.realVoyageList.formData = data.realVoyageList
        ? data.realVoyageList
        : []

      // 获取服务类型
      this.getBusinessType()
      // 获取服务项下拉
      this.getServiceTypes()

      // 获取订舱协助审核人
      this.getJointAuditWork()
      // 获取协同岗位分配
      this.getJointWork()
      // 获取是否包含驳船
      // 新增创建订单，是否包含驳船从url的params获取
      if (!barge && !ship) {
        this.includeFeeder = this.$route.query.includeFeeder
      } else {
        this.includeFeeder = barge ? 'y' : 'n'
      }
      console.log('this.includeFeeder', this.includeFeeder)

      // 业务申请取消订单，订单有费用执行终止，无费用执行取消
      // if (this.createItem.cancelApplyStatus === 'applied') {
      orderFeeCount({ orderNo: this.$route.query.orderNo }).then((res) => {
        this.isOrderFeeCount = res.data.count > 0
        this.$store.dispatch(
          'airTransport/setOrderFeeCount',
          this.isOrderFeeCount
        )
      })
      // }

      this.finCloseStatusCn =
        finCloseStatus === 'yes'
          ? '已关账'
          : prefinCloseStatus !== 'yes'
          ? '未关账'
          : '预关账'
      this.createItem.orderStatus = data.orderStatus
      this.order.orderNo = data.orderNo
      this.order.custid = data.custid
      this.order.custName = data.custName
      this.order.serviceList = data.serviceList
      this.order.serviceInfoList = data.serviceInfoList
      this.order.businessType = data.businessType
      this.finance.orderNo = data.orderNo
      this.finance.businessType = data.businessType
      this.finance.serviceType = data.serviceType
    },
    // 分配工作项
    getOrderWork() {
      let data = {
        orderNo: this.createItem.orderNo || this.$route.query.orderNo,
        sysLineCode: this.createItem.airSysLineCode
      }
      let { workAssign } = this.createItem
      orderWork(data).then((res) => {
        let findItem = res.data.find((item) => item.jobCode === 'obd')
        this.obdDeptCode = findItem ? findItem.deptCode : ''
        let bdFindItem = res.data.find((item) => item.jobCode === 'bd')
        this.bdDeptCode = bdFindItem ? bdFindItem.deptCode : ''
        let asstFindItem = res.data.find((item) => item.jobCode === 'asst')
        this.asstDeptCode = asstFindItem ? asstFindItem.deptCode : ''
        if (workAssign.length) {
          this.orderWorkOptions = workAssign.map((item) => {
            return Object.assign(item, { show: true })
          })
        } else {
          this.orderWorkOptions = res.data.map((item) => {
            return Object.assign(item, { show: true })
          })
        }

        for (let i = 0; i < this.orderWorkOptions.length; i++) {
          // employeeId为0时，employeeName 为空
          if (this.orderWorkOptions[i].employeeId === 0) {
            this.orderWorkOptions[i].employeeName = ''
          }
        }
      })
    },
    // 获取订舱协助审核人
    getJointAuditWork() {
      jointAuditWork({
        orderNo: this.$route.query.orderNo
      }).then((res) => {
        this.jointAuditWorkData = res.data
      })
    },
    // 获取协同岗位分配
    getJointWork() {
      jointWork({
        orderNo: this.$route.query.orderNo
      }).then((res) => {
        this.jointWorkData = res.data
      })
    },
    // 获取服务类型下拉
    getBusinessType() {
      baseBusinessList().then((res) => {
        let { data } = res
        data.map((item) => {
          // 该业务类型下的服务类型
          if (item.businessType === this.createItem.businessType) {
            this.serviceTypeOptions = item.serviceTypeList
          }
        })
      })
    },
    // 根据业务类型和服务类型查询服务项列表
    getServiceTypes() {
      let param = {
        businessType: this.createItem.businessType,
        serviceType: this.createItem.serviceType
      }
      let temp = []
      // 获取已完成的服务项
      let serviceInfoListStr = sessionStorage.getItem('serviceInfoListStr')
      let serviceInfoList = JSON.parse(serviceInfoListStr)
      let isFinishedArr = []
      serviceInfoList.map((item) => {
        if (item.serviceStatus === 'finish' || item.isJoint === 'y') {
          isFinishedArr.push(item.serviceCode)
        }
      })
      // 服务项下拉数据处理
      baseBusinessServiceList(param).then((res) => {
        let { data } = res
        data.map((item) => {
          if (item.isDefault === 'y') temp.push(item.serviceCode)
          // op操作角色的服务项处理:订舱，代订舱，已完成的服务项不可勾选
          if (this.isOp) {
            if (
              item.serviceCode === 'book' ||
              item.serviceCode === 'proxy_book' ||
              isFinishedArr.includes(item.serviceCode)
            ) {
              item.disabled = true
            }
            // // 仓储，散车派送二选一;如果有被协同，则另一个服务项不可选
            // if (
            //   (item.serviceCode === 'pod_warehouse' &&
            //     isFinishedArr.includes('pod_ltl_delivery')) ||
            //   (item.serviceCode === 'pod_ltl_delivery' &&
            //     isFinishedArr.includes('pod_warehouse'))
            // ) {
            //   item.disabled = true
            // }
            // if (
            //   (item.serviceCode === 'pol_warehouse' &&
            //     isFinishedArr.includes('pol_ltl')) ||
            //   (item.serviceCode === 'pol_ltl' &&
            //     isFinishedArr.includes('pol_warehouse'))
            // ) {
            //   item.disabled = true
            // }
          }
        })
        this.serviceCodeOptions = data
        console.log(this.serviceCodeOptions)
        console.log(param)
        // 新创建订单默认勾选服务项
        if (
          this.$route.query.action === 'add' &&
          !this.createItem.serviceList.length
        ) {
          Object.assign(this.createItem, {
            serviceList: temp
          })
        }
      })
    },

    // 返回订单列表或协同单列表
    handleGoBack() {
      let name = 'AirTransportOrderList'
      sessionStorage.removeItem('createAirOrderStr')
      if (this.$route.query.source === 'jointList') {
        name = 'AirTransportJointList'
      }
      this.$router.push({
        name
      })
    },

    // 订单完成
    handleFinish() {
      if (this.createItem.isTransportCheck !== 'Y') {
        this.$message.error('只有货物出运后的订单才可以执行订单完成的操作')
        return
      }
      this.submitDisabled = true
      orderFinish({ orderNo: this.$route.query.orderNo })
        .then((res) => {
          this.$message({
            type: 'success',
            message: '订单完成成功',
            duration: 1000,
            onClose: () => {
              this.submitDisabled = false
              this.orderAuthCheck()
                .then(() => {
                  // this.$emit('getInfo')
                })
                .catch(() => {
                  closePage()
                })
            }
          })
          this.$emit('getInfo')
        })
        .catch((err) => {
          setTimeout(() => {
            this.submitDisabled = false
          }, 1000)
        })
    },

    // 业务关闭订单
    handleClose(type) {
      if (type === 'close') {
        this.$confirm(`是否关闭此订单?`, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            orderClose({ orderNo: this.$route.query.orderNo }).then((res) => {
              this.$message({
                type: 'success',
                message: '关闭成功',
                duration: 1000,
                onClose: () => {
                  this.$router.push({
                    name: 'AirTransportOrderList'
                  })
                }
              })
            })
          })
          .catch(() => {})
      } else if (type === 'break') {
        // 业务终止 orderStatusChangeBreak
        this.$confirm('是否终止该订单', '确认?', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            orderStatusChangeBreak({ orderNo: this.$route.query.orderNo }).then(
              (res) => {
                this.$message({
                  type: 'success',
                  message: '终止成功',
                  duration: 1000,
                  onClose: () => {
                    // this.$router.push({
                    //   name: 'AirTransportOrderList'
                    // })
                    this.$emit('getInfo')
                    this.$message({ message: '终止成功', type: 'success' })
                  }
                })
              }
            )
          })
          .catch(() => {})
      }
    },
    // 删除订单
    handleDelete(row) {
      this.$confirm(`是否删除此订单?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          orderDelete({ orderNo: this.$route.query.orderNo }).then((res) => {
            this.$message({
              type: 'success',
              message: '删除成功',
              duration: 1000,
              onClose: () => {
                // this.$store.dispatch('tagsView/delView', this.$route)
                // this.$router.push({
                //   name: 'AirTransportOrderList'
                // })
                closePage()
              }
            })
          })
        })
        .catch((err) => {
          console.log('err')
        })
    },
    // 业务发起取消订单
    handleCancelRequest() {
      this.cancelOrderPopShow = true
    },

    // 业务发起取消订单关闭回调
    cancelRequestPopClose(action, value) {
      this.cancelOrderPopShow = false
      if (action === 'Confirm') {
        this.$emit('getInfo')
      }
    },
    // 业务撤回已提交的订单
    handleSubmitCancel() {
      this.$confirm(`是否撤回此订单?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          orderSubmitCancel({ orderNo: this.$route.query.orderNo }).then(
            (res) => {
              this.$message({
                type: 'success',
                message: '撤回成功',
                duration: 1000
                // onClose: () => {
                //   this.$emit('getInfo')
                // }
              })
              this.$emit('getInfo')
            }
          )
        })
        .catch((err) => {
          console.log('err')
        })
    },
    // 业务协同订单
    handleJointService() {
      this.jointServicePopShow = true
    },

    // 协同订单关闭回调
    jointServicePopClose() {
      this.jointServicePopShow = false
    },

    // 操作取消订单
    handleCancel(cancelType) {
      // 取消
      if (cancelType === 'cancel') {
        let msg = '该订单是否已产生费用，如已产生请去录入相关费用后再取消。'
        if (this.serviceIsJoint) {
          msg = '存在协同单，需协同单确认是否要取消协同，是否确定要发起取消？'
        }
        this.$confirm(msg, '是否取消该订单?', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            return orderCancelHandle({
              orderNo: this.$route.query.orderNo,
              cancelType: cancelType
            })
          })
          .then((response) => {
            this.$emit('getInfo')
            this.$message({ message: '取消成功', type: 'success' })
          })
          .catch((err) => {})
      }
      // 终止
      if (cancelType === 'break') {
        this.$confirm('是否终止该订单', '确认?', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            return orderCancelHandle({
              orderNo: this.$route.query.orderNo,
              cancelType: cancelType
            })
          })
          .then((response) => {
            this.$emit('getInfo')
            this.$message({ message: '终止成功', type: 'success' })
          })
          .catch((err) => {})
      }
    },

    // 复制新窗口打开
    handleCopy() {
      this.$confirm(
        `是否确认复制工作号: ${this.$route.query.orderNo} 委托单位：${this.createItem.custName} 的数据?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          return orderCopy({ orderNo: this.$route.query.orderNo })
        })
        .then((response) => {
          let { orderNo } = response.data
          // this.$router.push({
          //   name: 'AirTransportOrderDetail',
          //   params: {
          //     orderNo: orderNo
          //   },
          //   query: Object.assign(
          //     { ...this.$route.query },
          //     {
          //       orderNo,
          //       action: 'copy'
          //     }
          //   )
          // })
          let routeUrl = this.$router.resolve({
            name: 'AirTransportOrderDetail',
            params: {
              orderNo
            },
            query: Object.assign(
              { ...this.$route.query },
              {
                orderNo,
                action: 'copy'
              }
            )
          })
          this.$message({
            message: '复制成功',
            type: 'success',
            duration: 1000,
            onClose: () => {
              window.open(routeUrl.href, '_blank')
            }
          })
        })
        .catch((err) => {})
    },
    opValidateAllForm(bkgStatus, flag) {
      // 校验所有表单
      return new Promise((resolve, reject) => {
        if (flag) {
          resolve()
        }
        if (bkgStatus === 'INIT') {
          // 未订舱不用校验表单
          // this.$refs.orderBookInfo.clearValidate() //基础信息
          this.$refs['optransportInfo-form'].clearValidate() // 实际航程
          // this.$refs.orderBookRef.clearValidate()
          // resolve()
          Promise.all([
            this.$refs.orderBookInfo.validateForm(), //基础信息
            this.$refs['planVoyage-form'].validateForm(), // 实际航程
            this.opValidateForm(), // 订舱审核信息
            this.$refs.cargo.validateForm() //货物信息
          ])
            .then(() => {
              resolve()
            })
            .catch((err) => {
              reject()
            })
        } else {
          let formList = [
            this.$refs.orderBookInfo.validateForm(), //基础信息
            this.$refs['optransportInfo-form'].validateForm(), // 实际航程
            this.$refs['planVoyage-form'].validateForm(), // 实际航程
            this.opValidateForm(), // 订舱审核信息
            this.$refs.cargo.validateForm() //货物信息
          ]
          Promise.all(formList)
            .then(() => {
              resolve()
            })
            .catch((err) => {
              reject()
            })
        }
      })
    },
    opValidateForm() {
      // 表单验证
      return new Promise((resolve, reject) => {
        this.$refs.orderBookRef.validate((valid) => {
          if (valid) {
            resolve()
          } else {
            reject()
          }
        })
      })
    },
    // 操作编辑
    handleEdit(flag) {
      if (
        this.opTransportInfoData.formData &&
        this.opTransportInfoData.formData[0] &&
        this.opTransportInfoData.formData[0].etdTime &&
        (this.opFormData.bkgStatus !== 'BOOK_RELEASE' ||
          this.opFormData.poDealStatus !== 'IN')
      ) {
        return this.$message.warning(
          '请确认是否已实际起飞？若是，请先维护好订舱状态、交仓状态。'
        )
      }

      this.opValidateAllForm(this.opFormData.bkgStatus, flag)
        .then(() => {
          // this.submitDisabled = true
          let orderWorkOptions = []
          orderWorkOptions = [...this.orderWorkOptions]

          let workArr = orderWorkOptions.map((item) => {
            return {
              jobCode: item.jobCode,
              employeeId: item.employeeId ? item.employeeId : 0
            }
          })
          let cargoData = this.cargoData.formData.map((item) => {
            return Object.keys(item).reduce((obj, key) => {
              if (key === 'hscodeOptions') return obj
              obj[key] = item[key]
              return obj
            }, {})
          })
          let realVoyageList = []
          for (let i = 0; i < this.opTransportInfoData.formData.length; i++) {
            let obj = {}
            obj.carrierSupplierId =
              this.opTransportInfoData.formData[i].carrierSupplierId
            obj.carrierSupplierName =
              this.opTransportInfoData.formData[i].carrierSupplierName
            obj.etdTime = this.opTransportInfoData.formData[i].etdTime
            obj.etaTime = this.opTransportInfoData.formData[i].etaTime
            obj.eflightNumber =
              this.opTransportInfoData.formData[i].eflightNumber
            obj.polPortCode = this.opTransportInfoData.formData[i].polPortCode
            obj.polPortName = this.opTransportInfoData.formData[i].polPortName
            obj.unloadingPortCode =
              this.opTransportInfoData.formData[i].unloadingPortCode
            obj.unloadingPortName =
              this.opTransportInfoData.formData[i].unloadingPortName
            obj.voyageType = '实际'
            if (i === this.opTransportInfoData.formData.length - 1) {
              obj.voyageSort = '0'
            } else {
              obj.voyageSort = (i + 1).toString()
            }
            obj.transportMode =
              this.opTransportInfoData.formData[i].transportMode
            realVoyageList.push(obj)
          }
          let planVoyageList = []
          for (let i = 0; i < this.swTransportInfoData.formData.length; i++) {
            let obj = {}
            obj.carrierSupplierId =
              this.swTransportInfoData.formData[i].carrierSupplierId
            obj.carrierSupplierName =
              this.swTransportInfoData.formData[i].carrierSupplierName
            obj.etdTime = this.swTransportInfoData.formData[i].etdTime
            obj.etaTime = this.swTransportInfoData.formData[i].etaTime
            obj.eflightNumber =
              this.swTransportInfoData.formData[i].eflightNumber
            obj.polPortCode = this.swTransportInfoData.formData[i].polPortCode
            obj.polPortName = this.swTransportInfoData.formData[i].polPortName
            obj.unloadingPortCode =
              this.swTransportInfoData.formData[i].unloadingPortCode
            obj.unloadingPortName =
              this.swTransportInfoData.formData[i].unloadingPortName
            obj.voyageType = '预计'

            if (i === this.swTransportInfoData.formData.length - 1) {
              obj.voyageSort = '0'
            } else {
              obj.voyageSort = (i + 1).toString()
            }

            obj.transportMode =
              this.swTransportInfoData.formData[i].transportMode
            planVoyageList.push(obj)
          }
          let params = {
            etdTime: this.orderBookInfoData.etdTime,
            orderNo: this.$route.query.orderNo,
            serviceList: this.createItem.serviceList,
            workAssign: workArr, // workAssign
            bkgStatus: this.opFormData.bkgStatus,
            poDealStatus: this.opFormData.poDealStatus,
            poDealProcessingReason: this.opFormData.poDealProcessingReason,
            poNo: this.orderBookInfoData.poNo,
            bkgRemark: this.orderBookInfoData.bkgRemark,
            realVoyageList: realVoyageList,
            planVoyageList: planVoyageList,
            cargoStat: this.createItem.cargoStat,
            cargoList: cargoData,
            airLine: this.orderBookInfoData.airLine,
            airBillType: this.orderBookInfoData.airBillType,
            billSplitNum: this.orderBookInfoData.billSplitNum,
            transport: {
              ...this.contactData,
              customsReleaseTime: this.orderBookInfoData.customsReleaseTime,
              isCustomsInspection: this.orderBookInfoData.isCustomsInspection,
              transportTerm: this.orderBookInfoData.transportTerm,

              shipperCanExport: this.orderBookInfoData.shipperCanExport,
              consigneeCanImport: this.orderBookInfoData.consigneeCanImport,
              pickName: this.orderBookInfoData.pickName,
              pickMobile: this.orderBookInfoData.pickMobile,
              pickAddress: this.orderBookInfoData.pickAddress,
              tradeTypeCode: this.orderBookInfoData.tradeTypeCode,
              tradeTermsCode: this.orderBookInfoData.tradeTermsCode,

              customsSupplierId: this.orderBookInfoData.customsSupplierId,
              customsSupplierName: this.orderBookInfoData.customsSupplierName,
              truckSupplierId: this.orderBookInfoData.truckSupplierId,
              truckSupplierName: this.orderBookInfoData.truckSupplierName
            }
          }

          if (this.$route.query.jointNo) {
            console.log(this.joinOrderWorkOptions)
            let joinOrderWorkOptions = []
            joinOrderWorkOptions = [...this.joinOrderWorkOptions]
            let joinWorkArr = joinOrderWorkOptions.map((item) => {
              return {
                jobCode: item.jobCode,
                employeeId: item.employeeId ? item.employeeId : 0
              }
            })
            let opItem = joinWorkArr.find((item) => item.jobCode === 'op')
            if (!(opItem && opItem.employeeId)) {
              this.$message.error(`协同参与人操作不能为空`)
              this.submitDisabled = false
              return
            }
            params.workAssign = joinWorkArr
            params.jointNo = this.$route.query.jointNo
          } else {
            if (!this.workAssignValidateOp(params)) {
              return (this.submitDisabled = false)
            }
          }
          this.submitDisabled = true
          // 业务保存提交
          orderEdit(params)
            .then((res) => {
              this.$message({
                type: 'success',
                message: '保存成功',
                duration: 1000,
                onClose: () => {
                  this.submitDisabled = false
                  this.orderAuthCheck()
                    .then(() => {
                      // this.$emit('getInfo')
                    })
                    .catch(() => {
                      closePage()
                    })
                }
              })
              this.$emit('getInfo')
            })
            .catch((err) => {
              setTimeout(() => {
                this.submitDisabled = false
              }, 2000)
            })
        })
        .catch(() => {
          toViewPosition('air-cont', 80)
          this.$message.error('请按要求填写数据')
        })
    },

    // 切换是否包含驳船费
    handleChangeIncludeFeeder(val) {
      this.includeFeeder = val
      if (val === 'y') {
        if (this.createItem.barge === null) {
          Object.assign(this.createItem, {
            barge: this.order.orderList.createItem.barge
          })
        }
      }
    },
    // 业务保存提交必填校验
    validate(data) {
      if (!data.serviceType) {
        this.$message.error('服务类型必填')
        return false
      }
      if (!data.ship.sysLineCode) {
        this.$message.error('系统航线必填')
        return false
      }
      return true
    },

    // 参与人保存提交时校验
    workAssignValidate(data) {
      let employeeIdArr = []
      data.workAssign
        .filter(
          (item) =>
            item.jobCode === 'pricing'&&!(this.isUsa && data.serviceList.length === 1 && data.serviceList.includes('pod_change_doc')) ||
            item.jobCode === 'op' ||
            item.jobCode === 'ac'
        )
        .map((item) => {
          employeeIdArr.push(item.employeeId)
        })
      if (
        !employeeIdArr.length ||
        employeeIdArr.includes('') ||
        employeeIdArr.includes(null) ||
        employeeIdArr.includes(0)
      ) {
        let arr = []
        let pricingItem = data.workAssign.find((el) => el.jobCode === 'pricing')
        let opItem = data.workAssign.find((el) => el.jobCode === 'op')
        let acItem = data.workAssign.find((el) => el.jobCode === 'ac')
        // if (pricingItem && !pricingItem.employeeId) {
        //   arr.push('商务')
        // }
        	console.log('🚀 ~ this.isUsa', this.isUsa)
				console.log('🚀 ~ data.serviceList', data.serviceList)
          if (this.isUsa && data.serviceList.length === 1 && data.serviceList.includes('pod_change_doc')) {
				  arr = []
          } else {
            if (pricingItem && !pricingItem.employeeId) {
            arr.push('商务') // 如果 订单的销售属于“美国分公司”的公共销售人员 只包含换单服务项，商务人员不需要必填，否则必填
            }
          }
        if (opItem && !opItem.employeeId) {
          arr.push('操作')
        }
        if (acItem && !acItem.employeeId) {
          arr.push('应收财务')
        }
        this.$message.error(`参与人（${arr.join(',')}）不能为空`)
        return false
      }
      return true
    },
    // 参与人商务保存时
    workAssignValidatePricing(data) {
      let employeeIdArr = []
      data.workAssign
        .filter(
          (item) =>
            item.jobCode === 'pricing'&&!(this.isUsa && data.serviceList.length === 1 && data.serviceList.includes('pod_change_doc')) ||
            item.jobCode === 'op' ||
            item.jobCode === 'ac'
        )
        .map((item) => {
          employeeIdArr.push(item.employeeId)
        })
      if (
        !employeeIdArr.length ||
        employeeIdArr.includes('') ||
        employeeIdArr.includes(null) ||
        employeeIdArr.includes(0)
      ) {
        let arr = []
        let pricingItem = data.workAssign.find((el) => el.jobCode === 'pricing')
        let acItem = data.workAssign.find((el) => el.jobCode === 'ac')
        let opItem = data.workAssign.find((el) => el.jobCode === 'op')
        // if (pricingItem && !pricingItem.employeeId) {
        //   arr.push('商务')
        // }
        	console.log('🚀 ~ this.isUsa', this.isUsa)
				console.log('🚀 ~ data.serviceList', data.serviceList)
          if (this.isUsa && data.serviceList.length === 1 && data.serviceList.includes('pod_change_doc')) {
				  arr = []
          } else {
            if (pricingItem && !pricingItem.employeeId) {
            arr.push('商务') // 如果 订单的销售属于“美国分公司”的公共销售人员 只包含换单服务项，商务人员不需要必填，否则必填
            }
          }
        if (opItem && !opItem.employeeId) {
          arr.push('操作')
        }
        if (acItem && !acItem.employeeId) {
          arr.push('应收财务')
        }
        this.$message.error(`参与人（${arr.join(',')}）不能为空`)
        return false
      }
      return true
    },
    workAssignValidateOp(data) {
      //操作编辑
      let employeeIdArr = []
      data.workAssign
        .filter(
          (item) =>
            item.jobCode === 'pricing'&&!(this.isUsa && data.serviceList.length === 1 && data.serviceList.includes('pod_change_doc')) ||
            item.jobCode === 'op' ||
            item.jobCode === 'ac'
        )
        .map((item) => {
          employeeIdArr.push(item.employeeId)
        })
      if (
        !employeeIdArr.length ||
        employeeIdArr.includes('') ||
        employeeIdArr.includes(null) ||
        employeeIdArr.includes(0)
      ) {
        let arr = []
        let pricingItem = data.workAssign.find((el) => el.jobCode === 'pricing')
        let acItem = data.workAssign.find((el) => el.jobCode === 'ac')
        let opItem = data.workAssign.find((el) => el.jobCode === 'op')
        	console.log('🚀 ~ this.isUsa', this.isUsa)
				console.log('🚀 ~ data.serviceList', data.serviceList)
        if (this.isUsa && data.serviceList.length === 1 && data.serviceList.includes('pod_change_doc')) {
				  arr = []
        } else {
          if (pricingItem && !pricingItem.employeeId) {
            arr.push('商务') // 如果 订单的销售属于“美国分公司”的公共销售人员 只包含换单服务项，商务人员不需要必填，否则必填
          }
        }
        // if (pricingItem && !pricingItem.employeeId) {
        //   arr.push('商务')
        // }
        if (opItem && !opItem.employeeId) {
          arr.push('操作')
        }
        if (acItem && !acItem.employeeId) {
          arr.push('应收财务')
        }
        this.$message.error(`参与人（${arr.join(',')}）不能为空`)
        return false
      }
      return true
    },
    validateAllForm(type) {
      // 校验所有表单
      if (type === 'draft') {
        this.$refs.orderBookInfo.$refs.orderBookInfoForm.clearValidate() //基础信息
        this.$refs.soContainer.$refs.airSoContainer.clearValidate() //客户信息
        this.$refs.cargo.$refs.airCargo.clearValidate() //货物信息
        this.$refs.summaryInfo.clearValidate()
        if (this.$refs['planVoyage-form']) {
          this.$refs['planVoyage-form'].$refs.airTransportInfo.clearValidate()
        }
        return new Promise((resolve, reject) => {
          resolve()
        })
      }
      return new Promise((resolve, reject) => {
        let formList = [
          this.$refs.orderBookInfo.validateForm(), //基础信息
          this.$refs.soContainer.validateForm(), //客户信息
          this.$refs.cargo.validateForm(), //货物信息
          this.validateForm() // 合计信息
        ]
        if (this.$refs['planVoyage-form']) {
          formList.push(this.$refs['planVoyage-form'].validateForm())
        }
        Promise.all(formList)
          .then(() => {
            resolve()
          })
          .catch((err) => {
            reject()
          })
      })
    },
    // 提交保存
    handleSave(type) {
      this.validateAllForm(type)
        .then(() => {
          let orderWorkOptions = []
          orderWorkOptions = [...this.orderWorkOptions]
          let workArr = orderWorkOptions.map((item) => {
            return {
              jobCode: item.jobCode,
              employeeId: item.employeeId ? item.employeeId : 0
            }
          })
          let cargoData = this.cargoData.formData.map((item) => {
            return Object.keys(item).reduce((obj, key) => {
              if (key === 'hscodeOptions') return obj
              obj[key] = item[key]
              return obj
            }, {})
          })
          let params = {
            orderNo: this.$route.query.orderNo,
            submitType: type,
            intrustRemark: this.orderBookInfoData.intrustRemark,
            polPortCode: this.orderBookInfoData.polPortCode,
            podPortCode: this.orderBookInfoData.podPortCode,
            airTransitWay: this.orderBookInfoData.airTransitWay,
            airSysLineCode: this.orderBookInfoData.airSysLineCode,
            airLine: this.orderBookInfoData.airLine,
            etdTime: this.orderBookInfoData.etdTime,
            airCustomsType: this.orderBookInfoData.airCustomsType,
            airBillType: this.orderBookInfoData.airBillType,
            billSplitNum: this.orderBookInfoData.billSplitNum,
            airPayMode: this.orderBookInfoData.airPayMode,
            airDocumentType: this.orderBookInfoData.airDocumentType,
            cargoCustList: this.soContainerData.formData,
            cargoList: cargoData,
            quoteList: this.quoteList,
            transport: {
              ...this.contactData,
              customsReleaseTime: this.orderBookInfoData.customsReleaseTime,
              isCustomsInspection: this.orderBookInfoData.isCustomsInspection,
              transportTerm: this.orderBookInfoData.transportTerm,

              shipperCanExport: this.orderBookInfoData.shipperCanExport,
              consigneeCanImport: this.orderBookInfoData.consigneeCanImport,
              pickName: this.orderBookInfoData.pickName,
              pickMobile: this.orderBookInfoData.pickMobile,
              pickAddress: this.orderBookInfoData.pickAddress,
              tradeTypeCode: this.orderBookInfoData.tradeTypeCode,
              tradeTermsCode: this.orderBookInfoData.tradeTermsCode,

              customsSupplierId: this.orderBookInfoData.customsSupplierId,
              customsSupplierName: this.orderBookInfoData.customsSupplierName,
              truckSupplierId: this.orderBookInfoData.truckSupplierId,
              truckSupplierName: this.orderBookInfoData.truckSupplierName
            },
            serviceList: this.createItem.serviceList,
            workAssign: workArr,
            cargoStat: this.createItem.cargoStat,

            polCountryCname: this.orderBookInfoData.polCountryCname,
            polCountryEname: this.orderBookInfoData.polCountryEname,
            polCountryCode: this.orderBookInfoData.polCountryCode,

            podCountryCname: this.orderBookInfoData.podCountryCname,
            podCountryEname: this.orderBookInfoData.podCountryEname,
            podCountryCode: this.orderBookInfoData.podCountryCode,
            poDealCityName: this.orderBookInfoData.poDealCityName,
            poDealCityCode: this.orderBookInfoData.poDealCityCode,
            poDealTime: this.orderBookInfoData.poDealTime
          }
          console.log(params)
          if (
            this.isPricing &&
            ['draft', 'refuse'].includes(this.createItem.orderStatus)
          ) {
            params.bkgAgentSupplierId =
              this.orderBookInfoData.bkgAgentSupplierId
            params.bkgAgentSupplierName =
              this.orderBookInfoData.bkgAgentSupplierName
            params.isExternal = this.orderBookInfoData.isExternal
            params.contractNo = this.orderBookInfoData.contractNo
            params.auditRemark = this.orderBookInfoData.auditRemark
            // 用户角色包含  业务+商务
            if (type !== 'draft') {
              if (!this.workAssignValidatePricing(params)) {
                return (this.submitDisabled = false)
              }
            }
          } else {
            if (type !== 'draft') {
              if (!this.workAssignValidate(params)) {
                return (this.submitDisabled = false)
              }
            }
          }
          if (type !== 'draft') {
            if (!this.createItem.serviceList.length) {
              this.$message.error('服务项不能为空')
              return (this.submitDisabled = false)
            }
          }

          let obdEmployee = workArr.find((el) => el.jobCode === 'obd')
          let asstEmployee = workArr.find((el) => el.jobCode === 'asst')
          let obdEmployeeId = obdEmployee ? obdEmployee.employeeId : ''
          let asstEmployeeId = asstEmployee ? asstEmployee.employeeId : ''
          if (obdEmployeeId && asstEmployeeId) {
            this.$message.error('销售助理(OBD)和下单助理不能同时选择')
            return (this.submitDisabled = false)
          }
          if (this.isPricing) {
            // 商务保存，提交时候，需要提交预计航程信息
            let arr = []
            for (let i = 0; i < this.swTransportInfoData.formData.length; i++) {
              let obj = {}
              obj.carrierSupplierId =
                this.swTransportInfoData.formData[i].carrierSupplierId
              obj.carrierSupplierName =
                this.swTransportInfoData.formData[i].carrierSupplierName
              obj.etdTime = this.swTransportInfoData.formData[i].etdTime
              obj.etaTime = this.swTransportInfoData.formData[i].etaTime
              obj.eflightNumber =
                this.swTransportInfoData.formData[i].eflightNumber
              obj.polPortCode = this.swTransportInfoData.formData[i].polPortCode
              obj.polPortName = this.swTransportInfoData.formData[i].polPortName
              obj.unloadingPortCode =
                this.swTransportInfoData.formData[i].unloadingPortCode
              obj.unloadingPortName =
                this.swTransportInfoData.formData[i].unloadingPortName
              obj.voyageType = '预计'
              if (i === this.swTransportInfoData.formData.length - 1) {
                obj.voyageSort = '0'
              } else {
                obj.voyageSort = (i + 1).toString()
              }
              obj.transportMode =
                this.swTransportInfoData.formData[i].transportMode
              arr.push(obj)
            }
            params.planVoyageList = arr
          }

          if (this.bookingFile) {
            console.log(this.bookingFile)
            if (this.fileLength > 1) {
              //托书附件数量大于1时候需要传fileBatchNo字段
              fileBatchNo().then((res) => {
                params.fileBatchNo = res.data
                let paramsData = {
                  data: params,
                  fromSystem: 'web_H5',
                  toSystem: 'mng_base_server',
                  reqId: randomString(),
                  reqTime: parseTime(new Date().getTime())
                }
                if (this.bookingFile.get('jsonData')) {
                  this.bookingFile.set('jsonData', JSON.stringify(paramsData))
                } else {
                  this.bookingFile.append(
                    'jsonData',
                    JSON.stringify(paramsData)
                  )
                }
                this.obOrderSave(this.bookingFile, type)
              })
            } else {
              let paramsData = {
                data: params,
                fromSystem: 'web_H5',
                toSystem: 'mng_base_server',
                reqId: randomString(),
                reqTime: parseTime(new Date().getTime())
              }
              if (this.bookingFile.get('jsonData')) {
                this.bookingFile.set('jsonData', JSON.stringify(paramsData))
              } else {
                this.bookingFile.append('jsonData', JSON.stringify(paramsData))
              }
              this.obOrderSave(this.bookingFile, type)
            }
          } else {
            // if (
            //   !this.createItem.bookingFiles ||
            //   JSON.stringify(this.createItem.bookingFiles) === '{}'
            // ) {
            //   this.$message.error('托书附件不能为空')
            //   return
            // }
            let paramsData = {
              data: params,
              fromSystem: 'web_H5',
              toSystem: 'mng_base_server',
              reqId: randomString(),
              reqTime: parseTime(new Date().getTime())
            }
            let formdata = new FormData()
            formdata.append('jsonData', JSON.stringify(paramsData))
            this.obOrderSave(formdata, type)
          }

          // orderSave(this.bookingFile)
          //   .then((res) => {
          //     this.$message({
          //       type: 'success',
          //       message: type === 'draft' ? '保存成功' : '提交成功',
          //       duration: 1000,
          //       onClose: () => {
          //         sessionStorage.removeItem('createAirOrderStr')
          //         this.submitDisabled = false
          //         this.$emit('getInfo')
          //       }
          //     })
          //   })
          //   .catch(() => {})
        })
        .catch(() => {
          toViewPosition('air-cont', 80)
          this.$message.error('请按要求填写数据')
        })
    },
    obOrderSave(formdata, type) {
      this.submitDisabled = true
      this.$store
        .dispatch('airTransport/orderSave', {
          uri: 'order/air/imports/order/save',
          params: formdata
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.$message({
              type: 'success',
              message: type === 'draft' ? '保存成功' : '提交成功',
              duration: 1000
              // onClose: () => {
              //   sessionStorage.removeItem('createAirOrderStr')
              //   this.submitDisabled = false
              //   this.$emit('getInfo')
              // }
            })
            sessionStorage.removeItem('createAirOrderStr')
            this.submitDisabled = false
            this.$emit('getInfo')
          }
          setTimeout(() => {
            this.submitDisabled = false
          }, 1200)
        })
        .catch(() => {
          this.submitDisabled = false
        })
    },
    toggleWorkAssign() {
      this.workAssignShow = !this.workAssignShow
      let value = this.workAssignShow ? 1 : 0
      Cookies.set('airWorkAssignShow', value)
    }
  }
}
</script>
<style lang="scss">
@import '../less/index.scss';
.detail-goods-summary {
  padding: 0 15px;
  margin: 10px 0 -10px;
  display: flex;
  .summary-info {
    display: flex;
    margin-right: 20px;
    font-size: 12px;
    font-weight: 400;
    color: #606266;
    line-height: 16px;
    align-items: center;
  }
}
.no-padding-form {
  .el-form-item__label {
    padding-right: 0 !important;
  }
}
.divider-voyage {
  border-top: 1px solid #e9e9e9;
  margin: 0 10px;
}
.air-order-book-info {
  background: #f5f7f9;
  overflow: hidden;
  .el-form-item__label {
    font-size: 12px !important;
    font-weight: 600 !important;
    color: #000;
    line-height: 20px;
  }
  .el-form-item__content {
    line-height: 20px;
  }
  .po-file {
    margin-bottom: 0;
    .el-form-item__content {
      width: 372px;
    }
  }
  .el-radio__label {
    font-size: 12px;
  }
  .is-error {
    .el-radio__inner {
      border-color: #ff4949;
    }
  }
  .el-radio-group {
    display: flex !important;
    align-items: center;
    height: 20px !important;
  }
  .head {
    padding: 10px 8px;
    margin-top: 4px;
    display: flex;
    justify-content: space-between;
    background: #fff;
    .title {
      font-size: 12px;
      font-weight: 600;
      // color: #000;
      line-height: 16px;
    }
  }
  .air-book-status {
    padding: 10px 8px;
    background: #fff;
    margin-top: 4px;
  }
  /deep/ .air-book-status {
    .el-form-item {
      margin-bottom: 4px;
      margin-right: 24px;
      .el-form-item__label {
        font-weight: 600;
      }
    }
  }
  /deep/ .el-form-item {
    margin-bottom: 4px;
    margin-right: 24px;
  }
  .bookInfoView-box {
    padding: 8px 12px;
    background: #fff;
    margin: 10px 0 0 0;
  }
}
.bl-fin-status {
  display: flex;
  float: right;
  align-items: center;
  font-size: 12px;
  .tit {
    // margin-right: 12px;
    font-weight: 600;
  }
  .el-icon-info {
    color: #e9e9e9;
    margin-right: 4px;
  }
  .status-text {
    font-weight: 600;
    margin-left: 20px;
  }
  .wait-status {
    color: #edb534;
  }
  .success-status {
    color: #33b18a;
  }
  .refuse-status {
    color: #e63923;
  }
}
.fileList-cont {
  .red {
    color: #e63923;
  }
}
</style>
