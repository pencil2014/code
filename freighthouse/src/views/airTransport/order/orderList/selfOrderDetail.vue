<template>
  <div class="edit-container" id="selfOrder">
    <ComOrderInfo ref="first" :isPricing="isPricing" :isBd="isBd" :createItem="createItem" :orderStatus="airOrderInfo.orderStatus" :serviceTypeOptions="serviceTypeOptions" :serviceCodeOptions="serviceCodeOptions" @getHeight="getShipInfoHeight" @updateCust="updateCust">
      <div class="operateBtn-group">
        <div class="btn-groups">
          <template v-if="airOrderInfo.bdManageEmployeeId===userId && createItem.orderStatus==='pre_submit'">
            <!-- 当前用户是业务主管，并且订单状态是待业务主管审核 -->
            <el-button size="mini" type="primary" @click="handleSave('submit')" :disabled="submitDisabled">通过</el-button>
            <el-button size="mini" type="danger" @click="bdManageRefusePopShow=true" style="margin-left: 10px;">拒绝</el-button>
          </template>
          <template v-else-if="airOrderInfo.bdManageEmployeeId!==userId && createItem.orderStatus==='pre_submit'">
            <el-button size="mini" type="default" class="" @click="handleCopy" :disabled="submitDisabled" v-if="!addState">复制</el-button>
          </template>
          <template v-else-if="createItem.orderStatus!=='pre_submit'">
            <template v-if="isBd">
              <el-button size="mini" type="primary" @click="handleSave('draft')" :disabled="submitDisabled" v-if="['draft', 'refuse','pre_submit'].includes(createItem.orderStatus) ||!viewState">保存</el-button>
              <el-button size="mini" type="primary" @click="handleSave('submit')" :disabled="submitDisabled" v-if="['draft', 'refuse','pre_submit'].includes(createItem.orderStatus) ||!viewState">提交</el-button>
              <el-button size="mini" type="default" class="submitCancel" @click="handleSubmitCancel" :disabled="submitDisabled" v-if="createItem.orderStatus === 'submit'">撤回</el-button>
            </template>
            <!-- 操作 -->
            <template v-if="isOp">
              <!-- 放开已关账、已完成的限制 createItem.orderStatus === 'pass' || createItem.orderStatus === 'break' && createItem.finCloseStatus !== 'yes' -->
              <el-button size="mini" type="primary" @click="handleEdit" v-if="createItem.orderStatus === 'pass' || createItem.orderStatus === 'break'" :disabled="submitDisabled">保存</el-button>
              <el-button size="mini" type="danger" class="" @click="handleCancel('cancel')" :disabled="submitDisabled" v-if="opCancelBtnShow">取消</el-button>
              <el-button size="mini" type="danger" class="" @click="handleCancel('break')" :disabled="submitDisabled" v-if="opBreakBtnShow">终止</el-button>
              <el-button size="mini" type="default" class="" @click="handleJointService" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus)">协同</el-button>
            </template>
            <!-- 商务 -->
            <template v-if="isPricing">
              <el-button size="mini" type="primary" @click="handleSave('draft')" :disabled="submitDisabled" v-if="['draft', 'refuse','pre_submit'].includes(createItem.orderStatus)">保存</el-button>
              <el-button size="mini" type="primary" @click="handleSave('submit')" :disabled="submitDisabled" v-if="['draft', 'refuse','pre_submit'].includes(createItem.orderStatus)">提交</el-button>
              <el-button size="mini" type="primary" @click="saveFunc('save')" v-if="['submit'].includes(createItem.orderStatus) || (['submit','pass'].includes(createItem.orderStatus)&&createItem.bkgStatus==='REFUSE')">保存</el-button>
              <el-button @click="saveFunc('pass')" type="success" size="mini" style="margin-left: 10px;" v-if="['submit'].includes(createItem.orderStatus) || (['submit','pass'].includes(createItem.orderStatus)&&createItem.bkgStatus==='REFUSE')">通过</el-button>
              <el-button size="mini" type="danger" @click="refusePopShow=true" style="margin-left: 10px;" v-if="['submit'].includes(createItem.orderStatus) || (['submit','pass'].includes(createItem.orderStatus)&&createItem.bkgStatus==='REFUSE')">拒绝</el-button>
            </template>
            <!-- 登录人是建单人时，展示的按钮-->
            <template v-if="showCareatOrderBtn">
              <el-button size="mini" type="danger" @click="handleDelete" :disabled="submitDisabled" v-if="createItem.orderStatus === 'draft'">删除</el-button>
              <el-button size="mini" type="danger" class="ml10" @click="handleCancelRequest" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus) && createItem.cancelApplyStatus !== 'applied'">{{isOrderFeeCount ? '终止' : '取消'}}</el-button>
              <el-button size="mini" type="default" class="submitCancel" @click="handleCancelCancel" :disabled="submitDisabled" v-if="createItem.cancelApplyStatus === 'applied' && createItem.orderStatus !== 'break' && createItem.orderStatus !== 'cancel'">{{isOrderFeeCount ? '撤回终止' : '撤回取消'}}</el-button>
              <el-button size="mini" type="default" class="" @click="handleCopy" :disabled="submitDisabled" v-if="!addState">复制</el-button>
              <el-button size="mini" type="danger" @click="handleClose('break')" :disabled="submitDisabled" v-if="isOrderFeeCount&&createItem.orderStatus === 'refuse'">终止</el-button>
              <el-button size="mini" type="default" @click="handleClose('close')" :disabled="submitDisabled" v-if="!isOrderFeeCount&&createItem.orderStatus === 'refuse'">关闭</el-button>
            </template>

            <template v-if="(isEpricing || isEcs) && !isOp">
              <!-- 放开已关账、已完成的限制 createItem.orderStatus === 'pass' || createItem.orderStatus === 'break' && createItem.finCloseStatus !== 'yes' -->
              <el-button size="mini" type="primary" class="" @click="handleEdit" v-if="createItem.orderStatus === 'pass' || createItem.orderStatus === 'break'" :disabled="submitDisabled">保存</el-button>
            </template>
          </template>
        </div>
        <div class="status">
          <span class="label">订单状态</span>
          <span class="value" :class="createItem.orderStatus === 'complete' || createItem.orderStatus === 'pass' && airOrderInfo.isOpHandle !== 'y' ? 'green' 
							: createItem.orderStatus === 'submit' || createItem.orderStatus === 'pre_submit' ? 'yellow' 
							: ['refuse','cancel','break'].includes(createItem.orderStatus) ? 'red' 
							: 'black'">
            {{ orderStatusFilter(createItem.orderStatus, $route.query.action, airOrderInfo.isOpHandle) }}
          </span>
          <span class="label ml10">关账状态</span>
          <span class="value" :class="finCloseStatusCn === '已关账' ? 'green' : finCloseStatusCn === '未关账' ? 'yellow' : 'black'">{{ finCloseStatusCn }}</span>
        </div>
      </div>
    </ComOrderInfo>
    <div class="order-cont selfOrder-cont">
      <el-form class="order-cont-form row-body">
        <!-- 订舱信息 -->
        <div class="ship-cont air-cont" ref="shipInfoCont" :class="workAssignShow ? 'abs-toogle' : ''" :style="{ height: `${shipInfoHeight}px` }">
          <div class="toggleWorkAssign" @click="toggleWorkAssign">
            <i class="hamburger el-icon-arrow-right" :class="{ 'is-active': true }"></i>
          </div>
          <h1 class="orderInfo-h1">基本信息</h1>
          <!-- 基本信息 -->
          <div class="row-cont mt15">
            <div class="row-cont-tit">
              <span class="tit">基本信息</span>
            </div>
            <CargoClaim @getInfo="updateFile" :isPricing="isPricing" :isBd="isBd" :isOp="isOp" :cargoClaim="cargoClaimData" :orderStatus="createItem.orderStatus" @selectFile="selectFile" @saveRemark="handleSaveRemark" ref="cargoClaim" />
          </div>
          <OverseasInfo @setQuoteList="setQuoteList" :quoteList="quoteList" :businessType="createItem.businessType" :bdId="bdId" :polCode="cargoClaimData.polPortCode" :podCode="cargoClaimData.podPortCode" @getInfo="getInfo" :isEpricing="isEpricing" :isEcs="isEcs" :isPricing="isPricing" :isBd="isBd" :isOp="isOp" :orderStatus="createItem.orderStatus" :createItem="createItem" @selectFile="selectFile" ref="overseasInfo" />
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
                <el-input style="width:100px" size="mini" clearable v-model="createItem.cargoStat.settleWeight" :disabled="disabledState" @input="checkNumInputMaxVal(createItem.cargoStat.settleWeight)" placeholder="请输入">
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
            <Cargo v-show="cargoShow" :isPricing="isPricing" :isBd="isBd" :isOp="isOp" v-model="cargoData" :orderStatus="createItem.orderStatus" ref="cargo" />
          </div>
        </div>
        <!-- 参与人与关键点 -->
        <div class="work-assign-cont" :style="{height: `${checkPointHeight+32}px`}" v-if="workAssignShow">
          <el-tabs v-model="activityKey">
            <el-tab-pane v-for="item in workAssignMenus" :label="item.value" :name="item.key" :key="item.key"> </el-tab-pane>
          </el-tabs>
          <component ref="activityKey" :is="activityKey" :orderIsJoint="orderIsJoint" :joinOrderWorkOptions="joinOrderWorkOptions" :createItem="createItem" :orderStatus="createItem.orderStatus" :serviceList="createItem.serviceList" :orderWorkOptions="orderWorkOptions" :obdDeptCode="obdDeptCode" :bdDeptCode="bdDeptCode" :asstDeptCode="asstDeptCode" v-if="createItem.orderNo" :checkPointHeight="checkPointHeight" :jointAuditWorkData="jointAuditWorkData" :jointWorkData="jointWorkData"></component>
        </div>
      </el-form>
    </div>
    <!-- 取消订单弹窗 -->
    <div v-if="cancelOrderPopShow">
      <CancelOrder @close="cancelRequestPopClose" :orderNo="$route.query.orderNo" :isOrderFeeCount="isOrderFeeCount" />
    </div>
    <!-- 协同订单弹窗 -->
    <div v-if="jointServicePopShow">
      <JointService @close="jointServicePopClose" :createItem="createItem" />
    </div>
    <!-- 商务拒绝弹窗 -->
    <div v-if="refusePopShow">
      <RefuseDialog @close="refusePopClose" />
    </div>
    <!-- 拒绝弹窗 -->
    <div v-if="bdManageRefusePopShow">
      <RefuseBdManageDialog @close="bdManageRefusePopClose" />
    </div>
    <div v-if="saMailShow">
      <SaMail @close="saMailClose"></SaMail>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import Cookies from 'js-cookie'
import ComOrderInfo from './components/comOrderInfo'
import Worker from './components/worker'
import CheckPoint from './components/checkPoint'
import CancelOrder from './components/cancelOrder'
import JointService from './components/jointService'
import Cargo from './components/cargo'
import CargoClaim from './components/cargoClaim'
import { baseBusinessList, baseBusinessServiceList } from '@/api/base'
import workerPricing from './components/workerPricing'
import {
  orderWork,
  orderCancelHandle,
  orderClose,
  orderDelete,
  jointAuditWork,
  jointWork,
  orderCancelCancel,
  orderStatusChangeBreak,
  orderWorkList,
  preRefuse,
  mainRemarkUpdate
} from '@/api/order/list'
import { orderFinish } from '@/api/railway/list'
import { orderFeeCount } from '@/api/fin/fee'
import RefuseDialog from '../bookShip/components/refuseDialog'
import {
  orderInfo,
  // selfSave,
  orderCopy,
  orderSubmitCancel,
  orderSelfEdit,
  auditPass,
  fileBatchNo,
  orderAuthCheck
} from '@/api/airTransport/order'
import { isArray, parseTime, randomString, closePage } from '@/utils'
import { checkQuantityWeightVolume } from '@/utils/validate'
import { toViewPosition } from '@/utils/scroll-to.js'
import OverseasInfo from './components/overseasInfo.vue'
import RefuseBdManageDialog from './components/refuseBdManageDialog'
import SaMail from '@/views/order/order/orderList/components/saMail'

let timer = ''
export default {
  data() {
    return {
      quoteList: [],
      saMailShow: false,
      orderWorkType: '',
      bdManageRefusePopShow: false,
      orderIsJoint: false,
      joinOrderWorkOptions: [],
      orderStatus: '',
      refusePopShow: false,
      bookingFile: null, // 托书附件文件流
      rules: {
        'cargoStat.settleWeight': [
          { required: false, message: '请输入', trigger: 'change' },
          {
            validator: checkQuantityWeightVolume(999999999),
            trigger: 'change'
          }
        ]
      },
      state: '',
      workAssignShow: false,
      shipInfoHeight: '', // 订舱信息高度
      checkPointHeight: 0, // 关键点高度
      countryCode: '',
      createItem: { ...this.$store.state.airTransport.airOrderInfo },
      workAssignMenus: [
        { key: 'Worker', value: '参与人' },
        { key: 'CheckPoint', value: '关键点' }
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
      portList: [],
      pickerOptions: {
        disabledDate(date) {
          //disabledDate 文档上：设置禁用状态，参数为当前日期，要求返回 Boolean
          return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
        }
      },
      soList: [],
      soSpanArr: [],
      soPos: 0,
      soPopShow: false,
      serviceTypeOptions: [], // 服务类型下拉
      serviceCodeOptions: [], // 服务项下拉
      jointAuditWorkData: {},
      jointWorkData: [],
      finCloseStatusCn: '', // 关账状态/预关账状态
      obdDeptCode: '', // obd部门code
      bdDeptCode: '', // 销售部门code
      asstDeptCode: '', // 下单助理部门code
      cargoShow: true, // 货物信息
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
        ]
      },
      cargoClaimData: {
        // 货物要求
        poFileName: '',
        poFileNo: '',
        polPortCode: '',
        podPortCode: '',
        airSysLineCode: '',
        airSysLineName: '',
        airCustomsType: '',
        intrustRemark: '',
        poNo: '',
        bizDate: '',
        bookingFileName: '',
        auditRemark: '',
        bdRemark: '',
        countryCname: '',
        countryEname: '',
        countryCode: '',
        isCustomsInspection: '',
        customsReleaseTime: '',
      },
      currentPixelRatio: window.devicePixelRatio
    }
  },
  created() {
    this.init(this.airOrderInfo)
  },
  mounted() {
    this.orderAuthCheck()
      .then(() => {})
      .catch(() => {
        closePage()
      })
  },
  computed: {
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
    hasDestinationShow() {
      // 是否要做目的港服务项
      if (
        this.createItem.serviceList.includes('pod_ltl_delivery') ||
        this.createItem.serviceList.includes('pod_comm_clearance') ||
        this.createItem.serviceList.includes('pod_warehouse') ||
        this.createItem.serviceList.includes('pod_change_doc')
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
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      order: (state) => state.order,
      finance: (state) => state.finance,
      orderList: (state) => state.airTransport.orderList,
      roles: (state) => state.user.roles,
      userId: (state) => state.user.userId,
      airOrderInfo: (state) => state.airTransport.airOrderInfo,
      userEditRoles: (state) => state.airTransport.orderList.userEditRoles,
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole
    }),
    pricingId() {
      let { workAssign } = this.createItem
      let pricingItem =
        workAssign && workAssign.find((el) => el.jobCode === 'pricing')
      if (pricingItem && pricingItem.employeeId) {
        return pricingItem.employeeId
      }
      return ''
    },
    bdId() {
      let { workAssign } = this.createItem
      let bdItem = workAssign && workAssign.find((el) => el.jobCode === 'bd')
      if (bdItem && bdItem.employeeId) {
        return bdItem.employeeId
      }
      return ''
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
    ecsId() {
      let workAssign = []
      if (this.$route.query.source !== 'jointList') {
        workAssign = this.airOrderInfo.workAssign
      } else {
        workAssign = this.airOrderInfo.jointWorkAssign
      }
      let asstItem = workAssign && workAssign.find((el) => el.jobCode === 'ecs')
      if (asstItem && asstItem.employeeId) {
        return asstItem.employeeId
      }
      return ''
    },
    epricingId() {
      let workAssign = []
      if (this.$route.query.source !== 'jointList') {
        workAssign = this.airOrderInfo.workAssign
      } else {
        workAssign = this.airOrderInfo.jointWorkAssign
      }
      let asstItem =
        workAssign && workAssign.find((el) => el.jobCode === 'epricing')
      if (asstItem && asstItem.employeeId) {
        return asstItem.employeeId
      }
      return ''
    },
    isEcs() {
      return this.ordDetRole === 'ecs'
    },
    isEpricing() {
      return this.ordDetRole === 'epricing'
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
    disabledState() {
      if (this.airOrderInfo.orderStatus === 'pre_submit') {
        if (this.airOrderInfo.bdManageEmployeeId !== this.userId) {
          return true
        } else {
          return false
        }
      } else {
        // 业务可以填写部分的权限
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
    viewState() {
      if (this.airOrderInfo.orderStatus === 'pre_submit') {
        if (this.airOrderInfo.bdManageEmployeeId !== this.userId) {
          return true
        } else {
          return false
        }
      } else {
        return (
          this.$route.query.action === 'view' || this.orderStatus !== 'draft'
        )
      }
    },
    addState() {
      return !this.createItem.cargoList[0].cname
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
        !['CANCEL', 'BREAK'].includes(this.createItem.cancelJointHandleStatus)
      )
    },
    // 操作终止按钮显示
    opBreakBtnShow() {
      return (
        ['pass'].includes(this.createItem.orderStatus) &&
        this.createItem.cancelApplyStatus === 'applied' &&
        this.isOrderFeeCount &&
        !['CANCEL', 'BREAK'].includes(this.createItem.cancelJointHandleStatus)
      )
    }
  },
  components: {
    ComOrderInfo,
    Worker,
    CheckPoint,
    CancelOrder,
    JointService,
    Cargo,
    CargoClaim,
    RefuseDialog,
    workerPricing,
    OverseasInfo,
    RefuseBdManageDialog,
    SaMail
  },
  props: {
    orderInfo: {
      type: Object,
      default: () => ({})
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
        orderData: this.cargoClaimData.bdRemark
      }).finally((res) => {
        loading.close()
      })
    },
    bdManageRefusePopClose(action) {
      if (action === 'Confirm') {
        this.$emit('getInfo')
      }
      this.bdManageRefusePopShow = false
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
        let { workAssign } = res.data
        if (workAssign.length) {
          let orderWorkOptions = workAssign.map((item) => {
            return Object.assign(item, { show: true })
          })

          for (let i = 0; i < this.orderWorkOptions.length; i++) {
            if (
              this.orderWorkOptions[i].jobCode === 'ecs' ||
              this.orderWorkOptions[i].jobCode === 'epricing'
            ) {
              this.$set(
                this.orderWorkOptions[i],
                'employeeId',
                orderWorkOptions[i].employeeId
              )
              this.$set(
                this.orderWorkOptions[i],
                'employeeName',
                orderWorkOptions[i].employeeName
              )
            }
          }
        }
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
    orderAuthCheck() {
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

            // this.$message({
            //   message: `你修改了参与人-${data},当前订单你没有权限操作了，页面即将关闭`,
            //   type: 'error',
            //   onClose: () => {
            //     reject()
            //   }
            // })
          })
      })
    },
    refusePopClose() {
      this.refusePopShow = false
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
      let params = {
        orderNo: this.createItem.orderNo,
        submitType: type,
        auditRemark: this.cargoClaimData.auditRemark,
        pricingEmployeeId: this.currentPricingId, // 商务
        bkgEmployeeId: this.currentOpId // 操作
          ? this.currentOpId
          : null,
        serviceList: this.createItem.serviceList,
        airCustomsType: this.cargoClaimData.airCustomsType
      }
      // 只勾选了目的港委托清关，或是只勾选了目的港换单一个服务项时，不允许提交
      let podArr = params.serviceList.filter((item) => item.startsWith('pod_'))
      let podStr = podArr.join(',')
      if (podStr === 'pod_comm_clearance' || podStr === 'pod_change_doc') {
        this.submitDisabled = false
        return this.$message({
          type: 'error',
          message: '请再选择其他目的港服务项'
        })
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
        if (!(opItem && opItem.employeeId)) {
          this.$message.error(`协同参与人操作不能为空`)
          return
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
                    this.$emit('getInfo')
                  })
                  .catch(() => {
                    closePage()
                  })
              }
            })
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
                  this.$emit('getInfo')
                })
                .catch(() => {
                  closePage()
                })
            }
          })
        })
      }
    },
    saveFunc(type) {
      // if (type === 'save') {
      //   this.auditPass(type)
      // } else {
      //   this.validatePricingAllForm(type)
      //     .then(() => {
      //       this.auditPass(type)
      //     })
      //     .catch(() => {
      //       toViewPosition('air-cont', 80)
      //       this.$message.error('请按要求填写数据')
      //     })
      // }
      this.validatePricingAllForm(type)
        .then(() => {
          this.auditPass(type)
        })
        .catch(() => {
          toViewPosition('air-cont', 80)
          this.$message.error('请按要求填写数据')
        })
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
        this.$set(this.cargoClaimData, 'bookingFileName', '')
      } else {
        this.$set(this.cargoClaimData, 'bookingFileName', 'bookingFileName')
      }
      console.log(this.cargoClaimData.bookingFileName)
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
                duration: 1000,
                onClose: () => {
                  this.$emit('getInfo')
                }
              })
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
      if (!data || !Object.keys(data).length) return
      let tempData = JSON.parse(JSON.stringify(data))
      // 参与人，关键点，甩柜，取消订单，协同，改船等弹窗默认关闭
      this.countryCode = ''
      let workAssignStr = Cookies.get('workAssignShow')
      this.workAssignShow = workAssignStr === '0' ? false : true
      // this.activityKey = 'Worker'
      this.submitDisabled = false
      this.isOrderFeeCount = false
      sessionStorage.setItem('serviceCode', '')
      this.state = this.$route.query.action === 'add' ? 'valid' : ''
      // this.getOrderWork()
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
    // 分配工作项
    getOrderWork() {
      let { workAssign } = this.createItem
      orderWork({ orderNo: this.$route.query.orderNo }).then((res) => {
        let findItem = res.data.find((item) => item.jobCode === 'obd')
        this.obdDeptCode = findItem ? findItem.deptCode : ''
        let bdFindItem = res.data.find((item) => item.jobCode === 'bd')
        this.bdDeptCode = bdFindItem ? bdFindItem.deptCode : ''
        let asstFindItem = res.data.find((item) => item.jobCode === 'asst')
        this.asstDeptCode = asstFindItem ? asstFindItem.deptCode : ''
        // 创建订单时参与人默认显值
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
    updateFile() {
      // 上传玩入仓单查询订单详情，回选
      let { orderNo } = this.$route.query
      orderInfo({ orderNo: orderNo }).then((res) => {
        this.cargoClaimData.poFileName = res.data.poFileName
        this.cargoClaimData.poFileNo = res.data.poFileNo
        this.cargoClaimData.bookingFiles = res.data.bookingFiles
      })
    },
    fillOrderInfo(data) {
      this.quoteList = data.quoteList || []
      this.orderStatus = data.orderStatus
      let {
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
      // 获取业务发起取消的订单的取消原因备注等信息
      if (data.cancelApplyStatus === 'applied') {
        this.$emit('getCancel', data)
      }
      // 获取已拒绝的信息
      if (data.orderStatus === 'refuse') {
        this.$emit('getRefuse', data)
      }

      Object.assign(this.createItem, data, {
        orderStatus: data.orderStatus,
        cargoList:
          data.cargoList && data.cargoList.length
            ? data.cargoList
            : [{ boxRemark: '无' }],
        checkPointList: data.checkPointList
      })

      if (isArray(data.cargoList) && data.cargoList.length) {
        // 货物信息回选
        this.cargoData.formData = data.cargoList
      }
      // 货物要求
      this.cargoClaimData = {
        poFileName: data.poFileName,
        poFileNo: data.poFileNo,
        polPortCode: data.polPortCode,
        podPortCode: data.podPortCode,
        airSysLineCode: data.airSysLineCode,
        // airSysLineName: data.airSysLineName,
        airCustomsType: data.airCustomsType,
        intrustRemark: data.intrustRemark,
        poNo: data.poNo,
        bizDate: data.bizDate,
        bookingFiles: data.bookingFiles,
        auditRemark: data.auditRemark,
        bookingFileName: data.bookingFiles ? 'bookingFileName' : '',
        bdRemark: data.bdRemark,
        countryCname: data.countryCname,
        countryEname: data.countryEname,
        countryCode: data.countryCode,
        customsReleaseTime: data.transport ? data.transport.customsReleaseTime : '',
        isCustomsInspection: data.transport ? data.transport.isCustomsInspection : ''
      }
      if (data.podPortCode) {
        this.$store
          .dispatch('dict/airportList', {
            portName: '',
            portCodes: data.podPortCode,
            state: 'valid'
          })
          .then((res) => {
            if (res.length) {
              console.log(res)
              this.$set(
                this.cargoClaimData,
                'airSysLineName',
                res[0].sysLineName
              )
            }
          })
      }
      // 获取服务类型
      this.getBusinessType()
      // 获取服务项下拉
      this.getServiceTypes()
      // 获取参与人
      // this.getOrderWork()
      // 获取订舱协助审核人
      this.getJointAuditWork()
      // 获取协同岗位分配
      this.getJointWork()
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
      // 港口数据反显
      if (data.ship) {
        let { polPortCode, podPortCode } = data.ship
        let porPortCode = data.barge ? data.barge.porPortCode : ''
        let portCodeArr = []
        porPortCode ? portCodeArr.push(porPortCode) : ''
        polPortCode ? portCodeArr.push(polPortCode) : ''
        podPortCode ? portCodeArr.push(podPortCode) : ''
        this.fillPortCodes = portCodeArr.toString()
        if (this.fillPortCodes) {
          this.$store
            .dispatch('dict/basePortListByCodes', {
              portCodes: this.fillPortCodes
            })
            .then((data) => {
              //初始化下拉框数据
              this.portList = data
            })
        }
      }
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
      this.setDisabled()
    }, // 获取服务类型下拉
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
      let { serviceInfoList } = this.airOrderInfo
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
    // 根据订单状态和角色判断信息是否可编辑
    setDisabled() {
      // bd, obd业务角色在草稿未提交状态下可编辑，其他状态不可编辑
      if (
        this.isBd &&
        !['draft', 'refuse', 'pre_submit'].includes(this.createItem.orderStatus)
      ) {
        return true
      }
      // op操作角色基本信息都不可编辑
      if (this.isOp) {
        return true
      }
      return false
    },
    // 返回
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
      this.submitDisabled = true
      orderFinish({ orderNo: this.$route.query.orderNo })
        .then((res) => {
          this.$message({
            type: 'success',
            message: '订单完成成功',
            duration: 1000,
            onClose: () => {
              this.submitDisabled = false
              // this.handleGoBack()
              this.orderAuthCheck()
                .then(() => {
                  this.$emit('getInfo')
                })
                .catch(() => {
                  closePage()
                })
            }
          })
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
        .catch((err) => {})
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
                duration: 1000,
                onClose: () => {
                  this.$emit('getInfo')
                }
              })
            }
          )
        })
        .catch((err) => {
          console.log('err')
        })
    },
    // 操作协同订单
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
    // 操作编辑
    handleEdit() {
      // this.submitDisabled = true
      let orderWorkOptions = []
      // 服务项存在代订舱的清空，不传pricing的employeeId
      if (this.createItem.serviceList.includes('proxy_book')) {
        orderWorkOptions = this.orderWorkOptions.map((item) => {
          if (item.jobCode === 'pricing') {
            item.employeeId = 0
          }
          return Object.assign({}, item)
        })
      } else {
        orderWorkOptions = [...this.orderWorkOptions]
      }
      let workArr = orderWorkOptions.map((item) => {
        return {
          jobCode: item.jobCode,
          employeeId: item.employeeId ? item.employeeId : 0
        }
      })
      let params = {
        orderNo: this.$route.query.orderNo,
        poNo: this.cargoClaimData.poNo,
        serviceList: this.createItem.serviceList,
        workAssign: workArr,
        transport: {
          customsReleaseTime: this.cargoClaimData.customsReleaseTime,
          isCustomsInspection: this.cargoClaimData.isCustomsInspection
        }
      }

      if (this.$route.query.jointNo) {
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
      // 只勾选了目的港委托清关，或是只勾选了目的港换单一个服务项时，不允许提交
      let podArr = params.serviceList.filter((item) => item.startsWith('pod_'))
      let podStr = podArr.join(',')
      if (podStr === 'pod_comm_clearance' || podStr === 'pod_change_doc') {
        this.submitDisabled = false
        return this.$message({
          type: 'error',
          message: '请再选择其他目的港服务项'
        })
      }
      if (!this.hasDestinationShow && this.createItem.orderStatus === 'pass') {
        console.log(
          '没有勾选目的港服务项，可不填海外客服参与人和海外商务参与人'
        )
        params.workAssign.map((item) => {
          if (['ecs', 'epricing'].includes(item.jobCode)) {
            item.employeeId = 0
          }
          return item
        })
      }
      this.submitDisabled = true

      orderSelfEdit(params)
        .then((res) => {
          this.$message({
            type: 'success',
            message: '保存成功',
            duration: 1000,
            onClose: () => {
              this.submitDisabled = false
              this.orderAuthCheck()
                .then(() => {
                  this.$emit('getInfo')
                })
                .catch(() => {
                  closePage()
                })
            }
          })
        })
        .catch((err) => {
          setTimeout(() => {
            this.submitDisabled = false
          }, 2000)
        })
    },
    validateAllForm(type) {
      // 校验所有表单
      if (type === 'draft') {
        this.$refs.cargoClaim.$refs.cargoClaimform.clearValidate()
        this.$refs.cargo.$refs.airCargo.clearValidate() //货物信息
        this.$refs.summaryInfo.clearValidate()
        return new Promise((resolve, reject) => {
          resolve()
        })
      }
      return new Promise((resolve, reject) => {
        let formList = [
          this.validateForm(), // 货物合计
          this.$refs.cargo.validateForm(), // 货物信息
          this.$refs.cargoClaim.validateForm() // 货物信息
        ]
        Promise.all(formList)
          .then(() => {
            resolve()
          })
          .catch((err) => {
            reject()
          })
      })
    },
    validatePricingAllForm(type) {
      // 校验所有表单
      if (type === 'save') {
        this.$refs.cargoClaim.$refs.cargoClaimform.clearValidate()
        this.$refs.cargo.$refs.airCargo.clearValidate() //货物信息
        this.$refs.summaryInfo.clearValidate()
        return new Promise((resolve, reject) => {
          resolve()
        })
      }
      return new Promise((resolve, reject) => {
        let formList = [
          this.validateForm(), // 货物合计
          this.$refs.cargo.validateForm(), // 货物信息
          this.$refs.cargoClaim.validateForm() // 货物信息
        ]
        Promise.all(formList)
          .then(() => {
            resolve()
          })
          .catch((err) => {
            reject()
          })
      })
    },
    // 参与人保存提交时校验
    workAssignValidate(data) {
      let employeeIdArr = []
      data.workAssign
        .filter(
          (item) =>
            item.jobCode !== 'epricing' &&
            item.jobCode !== 'obd' &&
            item.jobCode !== 'ecs' &&
            item.jobCode !== 'cs' &&
            item.jobCode !== 'asst' &&
            item.jobCode !== 'rc' &&
            item.jobCode !== 'eac'
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
        if (pricingItem && !pricingItem.employeeId) {
          arr.push('商务')
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
            item.jobCode !== 'epricing' &&
            item.jobCode !== 'obd' &&
            item.jobCode !== 'ecs' &&
            item.jobCode !== 'cs' &&
            item.jobCode !== 'asst' &&
            item.jobCode !== 'rc' &&
            item.jobCode !== 'eac'
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
        if (pricingItem && !pricingItem.employeeId) {
          arr.push('商务')
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
      let employeeIdArr = []
      data.workAssign
        .filter(
          (item) =>
            item.jobCode !== 'epricing' &&
            item.jobCode !== 'obd' &&
            item.jobCode !== 'ecs' &&
            item.jobCode !== 'cs' &&
            item.jobCode !== 'asst' &&
            item.jobCode !== 'rc' &&
            item.jobCode !== 'eac'
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
        if (pricingItem && !pricingItem.employeeId) {
          arr.push('商务')
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
    // 提交保存
    handleSave(type) {
      this.validateAllForm(type)
        .then(() => {
          let orderWorkOptions = []
          // 服务项存在代订舱的清空，不传pricing的employeeId
          if (this.createItem.serviceList.includes('proxy_book')) {
            orderWorkOptions = this.orderWorkOptions.map((item) => {
              if (item.jobCode === 'pricing') {
                item.employeeId = 0
              }
              return Object.assign({}, item)
            })
          } else {
            orderWorkOptions = [...this.orderWorkOptions]
          }
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
            intrustRemark: this.cargoClaimData.intrustRemark,
            polPortCode: this.cargoClaimData.polPortCode,
            podPortCode: this.cargoClaimData.podPortCode,
            airSysLineCode: this.cargoClaimData.airSysLineCode,
            airCustomsType: this.cargoClaimData.airCustomsType,
            poNo: this.cargoClaimData.poNo,
            cargoList: cargoData,
            serviceList: this.createItem.serviceList,
            workAssign: workArr,
            cargoStat: this.createItem.cargoStat,
            poFileNo: this.cargoClaimData.poFileNo,
            poFileName: this.cargoClaimData.poFileName,
            quoteList: this.quoteList,
            countryCname: this.cargoClaimData.countryCname,
            countryEname: this.cargoClaimData.countryEname,
            countryCode: this.cargoClaimData.countryCode
          }

          if (
            this.isPricing &&
            ['draft', 'refuse', 'pre_submit'].includes(
              this.createItem.orderStatus
            )
          ) {
            params.auditRemark = this.cargoClaimData.auditRemark
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
            // 只勾选了目的港委托清关，或是只勾选了目的港换单一个服务项时，不允许提交
            let podArr = this.createItem.serviceList.filter((item) =>
              item.startsWith('pod_')
            )
            let podStr = podArr.join(',')
            if (
              podStr === 'pod_comm_clearance' ||
              podStr === 'pod_change_doc'
            ) {
              this.submitDisabled = false
              return this.$message({
                type: 'error',
                message: '请再选择其他目的港服务项'
              })
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
          if (!this.hasDestinationShow && type === 'submit') {
            console.log(
              '没有勾选目的港服务项，可不填海外客服参与人和海外商务参与人'
            )
            params.workAssign.map((item) => {
              if (['ecs', 'epricing'].includes(item.jobCode)) {
                item.employeeId = 0
              }
              return item
            })
          }
          // 业务主管审核
          if (
            this.airOrderInfo.serviceType === 'st06' &&
            params.submitType === 'submit' &&
            this.airOrderInfo.isFirstOrder === 'Y' &&
            (!this.airOrderInfo.bdManageEmployeeId ||
              (this.airOrderInfo.bdManageEmployeeId &&
                this.airOrderInfo.bdManageEmployeeId !== this.userId))
          ) {
            // 客户自定，是否点的提交，是否是首单，是否有业务主管
            if (!this.airOrderInfo.bdManageEmployeeId) {
              // 没有设置业务主管，提醒去设置
              this.$message.error(
                '部门主管还未设置，请联系管理员配置部门主管人员。你可以先点击保存按钮对数据进行保存！'
              )
              this.submitDisabled = false
              return
            } else {
              params.submitType = 'pre_submit'
              this.$confirm(
                `此客户自订订单是该客户的首单，需提交给 ${this.airOrderInfo.bdManageEmployeeName} 审核，是否确定提交？`,
                '提示',
                {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }
              )
                .then(() => {
                  if (this.bookingFile) {
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
                          this.bookingFile.set(
                            'jsonData',
                            JSON.stringify(paramsData)
                          )
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
                        this.bookingFile.set(
                          'jsonData',
                          JSON.stringify(paramsData)
                        )
                      } else {
                        this.bookingFile.append(
                          'jsonData',
                          JSON.stringify(paramsData)
                        )
                      }
                      this.obOrderSave(this.bookingFile, type)
                    }
                  } else {
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
                })
                .catch(() => {
                  this.submitDisabled = false
                })
            }
            return
          }

          if (this.bookingFile) {
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
        })
        .catch(() => {
          // then 异常或者reject
          toViewPosition('air-cont', 80)
          this.$message.error('请按要求填写数据')
        })
    },
    obOrderSave(paramsObj, type) {
      this.submitDisabled = true
      this.$store
        .dispatch('airTransport/orderSave', {
          uri: 'order/air/order/self/save ',
          params: this.bookingFile || paramsObj
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.$message({
              type: 'success',
              message: type === 'draft' ? '保存成功' : '提交成功',
              duration: 1000,
              onClose: () => {
                sessionStorage.removeItem('createAirOrderStr')
                this.submitDisabled = false
                this.$emit('getInfo')
              }
            })
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
      Cookies.set('workAssignShow', value)
    },
    // 附件下载
    handleDownload(fileNo, fileName) {
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
    }
  }
}
</script>
<style lang="scss">
@import '../less/index.scss';
#selfOrder .so-table-border td {
  border-right: 1px solid #dfe6ec !important;
}
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
</style>
