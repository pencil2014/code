<template>
  <div class="edit-row" v-loading="loading">
    <div class="edit-container so">
      <div class="row-tit so">
        <span class="tit">提单信息</span>
        <div class="row-tit-operate">
          <!-- 出口：输出提单，输出舱单 -->
          <!-- <el-dropdown size="mini" style="margin-right:8px" @command="handleCommand">
            <el-button size="mini">
              输出<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="1" :disabled="(!isOp&&!isCs) || orderStatus==='complete'">输出提单</el-dropdown-item>
              <el-dropdown-item command="2" v-if="airOrderInfo.businessType==='air_export'" :disabled="(!isOp&&!isCs) || orderStatus==='complete'">输出舱单</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown> -->
          <el-button size="mini" type="primary" @click="handleCommand('1')" :disabled="(!isOp&&!isCs&&!isAc&&!isEac) || orderStatus==='complete'">输出提单</el-button>
          <el-button size="mini" type="primary" @click="handleCommand('2')" :disabled="(!isOp&&!isCs) || orderStatus==='complete'">输出舱单</el-button>
          <el-button size="mini" @click="handleRelease" :disabled="(!isOp&&!isCs) || orderStatus==='complete'">提单撤回</el-button>
          <el-button size="mini" type="primary" @click="handleAddBl" :disabled="(!isOp&&!isCs) || orderStatus==='complete' || !!(blList.length&&airOrderInfo.airBillType==='immediacy')">新增提单</el-button>
        </div>
      </div>
      <div class="row-form mt10 table-com-layout air-bl">
        <el-table ref="blTable" style="width: 100%" :row-class-name="tableRowClassName" :data="blList" :select-on-indeterminate="true" @select-all="handleSelectAll" @select="handleSelect" @selection-change="handleSelectionChange" :max-height="400">
          <el-table-column type="selection" width="30"></el-table-column>
          <el-table-column prop="blNo" label="提单号" align="left" width="220">
            <template slot-scope="scope">
              <div class="blNo-flex" v-if="scope.row.blNo">
                <i class="icon-tdcg" v-if="scope.row.blMode === 'tdcg'">草</i>
                <i class="icon-hbl" v-if="scope.row.blType">{{ scope.row.blType === 'hawb' ? '分' : '主' }}</i>
                <!--  formatblNo(scope.row.blNo,scope.row.blType) -->
                <el-link @click="handleInfo(scope.row)" :underline="false" type="primary" size="mini">{{scope.row.blNo}}</el-link>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="提单类型" align="center" type="">
            <template slot-scope="scope">
              <div>
                <span v-if="scope.row.blType === 'mawb'">主单</span>
                <span v-else>分单</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="草单确认" align="center" type="">
            <template slot-scope="scope">
              <div>
                <span v-if="scope.row.isDraftConfirm === 'y'&&scope.row.blType === 'mawb'">客户已确认</span>
                <el-button @click="handleCheckChange(scope.row, 'handleBlDraftConfirm')" type="text" size="mini" :disabled="!isOp || orderStatus==='complete'" class="underline" v-if="scope.row.isDraftConfirm !== 'y'&&scope.row.blType === 'mawb'"> 客户未确认</el-button>
                <span v-if="scope.row.isDraftConfirm === 'y'&&scope.row.blType === 'hawb'">代理已确认</span>
                <el-button @click="handleCheckChange(scope.row, 'handleBlDraftConfirm')" type="text" size="mini" :disabled="(!isOp && !(isCs && scope.row.blType==='hawb')) || orderStatus==='complete'" class="underline" v-if="scope.row.isDraftConfirm !== 'y'&&scope.row.blType === 'hawb'"> 代理未确认</el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="siStatus" label="补料状态" align="center" type="">
            <template  slot-scope="scope">
              <el-button v-if="canSi(scope.row)" @click="siSure(scope.row)" type="text" size="mini" class="underline">未补料</el-button>
              <span v-else>{{ scope.row.siStatus === 'Y' ? '已补料' : '未补料' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="putStatus" label="出单状态" align="center" type="">
            <template slot-scope="scope">
              <span v-if="scope.row.issueStatus=== 'issued'">已出单</span>
              <el-button v-else type="text" size="mini" :disabled="(!isOp && !(isCs && scope.row.blType==='hawb')) || orderStatus==='complete'" class="underline" @click="changeStatus(scope.row)">未出单</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="totalQuantity" label="制单件数" align="center" type="">
          </el-table-column>
          <el-table-column prop="totalWeight" label="制单毛重（KGS）" align="center" type="">
          </el-table-column>
          <el-table-column prop="totalVolume" label="制单体积（CBM）" align="center" type="">
          </el-table-column>
          <el-table-column label="操作" width="150" align="center" fixed="right" type="">
            <template slot-scope="scope">
              <div class="operate-group">
                <el-link @click="handleInfo(scope.row)" :underline="false" type="primary" size="mini">详情</el-link>
                <el-link @click="handleCheckChange(scope.row, 'handlePreview')" :underline="false" type="primary" size="mini" v-if="scope.row.blType === 'mawb'">预览</el-link>
                <el-link @click="handleCheckChange(scope.row, 'handlePrint')" :underline="false" type="primary" size="mini" v-if="scope.row.blType === 'hawb'">打印</el-link>
                <el-link @click="handleDelete(scope.row)" :underline="false" type="danger" size="mini" v-if="scope.row.blType==='hawb'" :disabled="(!isOp&&!isCs) || orderStatus==='complete'">删除</el-link>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 详情 -->
    <div class="component-cont" v-if="showDetail">
      <div class="mb10 between h32 border-bt" :class="{'air-bl-fixed-top':isFixed}">
        <div class="ft14 font-bold black">提单信息</div>
        <div class="flex-items-center">
          <el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
          <!-- 客服可保存分单 -->
          <el-button size="mini" type="primary" class="ml10" :disabled="isDraftConfirm || isLoading" @click="handleSave" v-if="(isOp || (isCs&&currentBlType!=='mawb')) && orderStatus!=='complete'">保存</el-button>
        </div>
      </div>
      <div style="overflow: hidden;">
        <!-- {{isAddBl}} -->
        <BlInfo v-model="createItem" ref="blInfo" :blList="blList" :allBl="allBl" @saveblFn="handleSave" :isOptional="isOptional" :orderStatus="orderStatus" :goodsList="goodsList.list" :isAddBl="isAddBl" :isDraftConfirm="isDraftConfirm" @changeMbl="changeMbl" />
      </div>
      <!-- 制单货物 -->
      <OrderGoods @action="handleGood" @changeGoods="changeGoods" :currentBlType="currentBlType" :orderStatus="orderStatus" :goodsList="goodsList" ref="OrderGoods" :isAddBl="isAddBl" :isDraftConfirm="isDraftConfirm" />
      <!-- {{createItem}} -->

    </div>
    <!-- 修改提单状态 -->
    <BaseDialog :config="dialogConfig" :callback="dialogCallback">
      <el-form label-position="right" label-width="80px" class="create-form">
        <el-form-item label="出单状态">
          <el-select v-model="documentsInfo.status" placeholder="请选择" style="width:180px">
            <el-option v-for="item in statusArr" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </BaseDialog>
    <!-- 生成MBL弹窗 -->
    <!-- <div v-if="blCreateShow">
      <BlCreate @close="blCreatePopClose" :existBlId="blId" />
    </div> -->
    <!-- 草单确认弹窗 -->
    <!-- <div v-if="blDraftConfirmShow">
      <BlDraftConfirm @close="blDraftConfirmPopClose" :blId="blId" :workAssign="workAssign" />
    </div> -->
    <!-- 输出HBL,MBL确认件弹窗 -->
    <div v-if="exportPopShow">
      <ExportPop @close="exportPopClose" />
    </div>
  </div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import {
  blList,
  blDelete,
  blDraftConfirm,
  blIssueBl,
  blDetail,
  blSave,
  blFileReview,
  airBlCancel,
  exportManifest,
  siFinish
} from '@/api/airTransport/order'
import FormItem from '@/components/Form/item'
import BlCreate from './blCreate'
import BlInfo from './blInfo'
import BlDraftConfirm from './blDraftConfirm'
import ExportPop from './exportPop'
import OrderGoods from './orderGoods'
import { toViewPosition } from '@/utils/scroll-to.js'
import {
  checkQuantityWeightVolume,
  validateNumPointEmpty,
  // validateCntextAndNum,
  // validateEntextAndNum,
  validateIntegerQuantity
} from '@/utils/validate'
// 默认的新增分单需要传的参数
const defaultCreateQuery = {
  isLoading: false,
  orderNo: '',
  airBl: {
    accountInfo: '',
    accountNo: '',
    agentIataCode: '',
    blId: '',
    blNo: '',
    blType: '',
    carriageDeclareValue: '',
    currency: '',
    currencyConversionRate: null,
    customsDeclareValue: '',
    destCcCharge: null,
    destCharge: null,
    draftConfirmTime: null,
    executedOn: '',
    handInfo: '',
    insuranceAmount: '',
    isDraftConfirm: '',
    issueAgentCity: '',
    issueAgentName: '',
    issueCarrierSignature: '',
    makeAddress: '',
    makeBy: null,
    makeDate: null,
    mark: '',
    orderNo: '',
    otherPpdColl: '',
    parentBlId: null,
    placeAt: '',
    remark: '',
    shipperSignature: '',
    totalCollectCharge: null,
    wtValPpdColl: '',
    makeBy: '',
    makeName: '',
    airWayBill: ''
  },
  airBlCargoStat: {
    blId: '',
    bubbleWeight: null,
    chargeWeight: null,
    kgLib: '',
    levelWeight: null,
    marks: '',
    oid: '',
    orderNo: '',
    rateCharge: null,
    rateClass: '',
    totalQuantity: '',
    totalVolume: '',
    totalWeight: '',
    commodityItemNo: null,
    goodsNature: null
  },
  airBlCargos: [
    {
      blId: '',
      cname: '',
      commodityTypeCode: '',
      ename: '',
      height: null,
      length: null,
      mark: '',
      oid: '',
      orderNo: '',
      packageInfo: '',
      property: '',
      propertyName: '',
      quantity: '',
      volume: '',
      weight: '',
      width: null
    }
  ],
  airBlContact: {
    blId: '',
    consignee: '',
    notify1: 'NOTIFY:SAME AS CONSIGNEE',
    notify2: '',
    notify3: '',
    oid: '',
    orderNo: '',
    shipper: ''
  },
  airBlExt: {
    blId: '',
    flightBy: '',
    flightBy2: '',
    flightBy3: '',
    flightTo: '',
    flightTo2: '',
    flightTo3: '',
    oid: '',
    orderNo: '',
    podAirportCode: '',
    podCityEname: '',
    podCountryCode: '',
    polAirportCode: '',
    polCityEname: '',
    polCountryCode: '',
    requestFightAirline: '',
    requestFightAirline2: '',
    requestFightDate: null,
    requestFightDate2: null,
    requestFightNo: '',
    requestFightNo2: ''
  },
  airBlOtherCharges: [
    // {
    //   blId: '',
    //   chargeType: '',
    //   collPpd: '',
    //   oid: '',
    //   orderNo: '',
    //   quantity: '',
    //   rate: '',
    //   totalAmount: ''
    // }
  ],
  mblPrefix: '',
  mblSuffix: ''
}
const rules = {
  hscode: [{ required: true, message: '请输入HS code', trigger: 'change' }],
  cname: [
    { required: true, message: '请选择', trigger: 'change' }
    // { validator: validateCntextAndNum(), trigger: 'change' }
  ],
  ename: [
    { required: true, message: '请选择', trigger: 'change' }
    // { validator: validateEntextAndNum(), trigger: 'change' }
  ],
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
  packageInfo: [{ required: true, message: '请选择', trigger: 'change' }],
  length: [{ validator: validateNumPointEmpty(), trigger: 'change' }],
  width: [{ validator: validateNumPointEmpty(), trigger: 'change' }],
  height: [{ validator: validateNumPointEmpty(), trigger: 'change' }]
}
export default {
  filters: {
    blStatusFilter(status) {
      return getDictLabel('blStatus', status)
    },
    postStatusFilter(postStatus) {
      return getDictLabel('postStatus', postStatus)
    },
    auditStatusFilter(auditStatus) {
      let auditStatusOptions = store.state.order.finAuditStatusOptions
      return auditStatusOptions[auditStatus] || '--'
    },
    releaseTypeFilter(releaseType) {
      return getDictLabel('releaseType', releaseType)
    },
    tripartFilter(tripartiteTrade) {
      return getDictLabel('tripartiteTrade', tripartiteTrade)
    }
  },
  props: {
    orderStatus: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isLoading: false,
      fileCommand: '',
      loading: false,
      dialogConfig: {
        title: '出单状态',
        show: false,
        size: 'medium',
        width: '308px',
        btns: [
          { label: '修改', action: 'Confirm', type: 'primary' },
          { label: '取消', action: 'Cancel' }
        ]
      },
      goodsList: {
        list: [],
        rules: rules
      }, // 货物列表
      state: 'valid',
      blList: [],
      oQuery: this.$route.query,
      blStatus: '', // 提单状态
      isAllSelect: '', // 全选
      multipleSelection: [],
      showDetail: false,
      truckContainersShow: false,
      createItem: JSON.parse(JSON.stringify(defaultCreateQuery)),
      blCreateShow: false, // 生成MBL弹窗
      blDraftConfirmShow: false, // 草单确认弹窗
      listItemQuery: {}, // 附件弹窗props
      blId: '', // bl编号
      blMode: '', // 出单方式
      cancelBlIds: [], // 撤回blIds
      truckContainerItem: {
        oid: '',
        containerId: '',
        cn: '',
        sn: '',
        so: '',
        containerType: '',
        packageType: '',
        volume: '',
        weight: '',
        quantity: ''
      },
      // 港口反显数据
      fillPortCodes: '',
      mailItemQuery: {},
      exportPopShow: false, // 输出弹窗.
      exportTypeQuery: {},
      exportTypeOptions: [
        { label: '分单确认件', value: 'hbl_confirm' },
        { label: '主单确认件', value: 'mbl_draft' },
        { label: '电放申请保函', value: 'telex_apply' }
      ],
      documentsInfo: {
        // 当前单证信息
        status: ''
      },
      statusArr: [], // 状态
      blId: '', // 提单主键id，用于编辑时该条提单被删除时提单详情也要隐藏
      isOptional: false, // 分单类型是否可选
      currentBlType: '',
      isAddBl: true,
      allBl: [], // 所有提单
      isFixed: false,
      initDataObj: {}
    }
  },
  created() {
    this.createItem.orderNo = this.$route.query.orderNo
    this.getBlList()
  },
  mounted() {
    let that = this
    let addEvent = (function () {
      if (window.addEventListener) {
        return function (elm, type, handle) {
          elm.addEventListener(type, handle, false)
        }
      }
      if (window.attachEvent) {
        return function (elm, type, handle) {
          elm.attachEvent('on' + type, handle)
        }
      }
    })()

    let ele = document.getElementById('air-bl-main')
    addEvent(ele, 'scroll', function () {
      var scrollTop = ele.scrollTop
      if (scrollTop >= 216) {
        that.isFixed = true
      } else {
        that.isFixed = false
      }
    })
  },
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      orderNo: (state) => state.order.orderNo,
      custid: (state) => state.order.custid,
      roles: (state) => state.user.roles,
      userId: (state) => state.user.userId,
      airOrderInfo: (state) => state.airTransport.airOrderInfo,
      userEditRoles: (state) => state.airTransport.orderList.userEditRoles,
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole
    }),
    isCs() {
      return this.ordDetRole === 'cs'
    },
    isAc() {
      return this.ordDetRole === 'ac'
    },
    isEac() {
      return this.ordDetRole === 'eac'
    },
    bdId() {
      // 当前参与人-业务（建单人的用户id）
      let { workAssign } = this.airOrderInfo
      let bdItem = workAssign && workAssign.find((el) => el.jobCode === 'bd')
      if (bdItem && bdItem.employeeId) {
        return bdItem.employeeId
      }
      return ''
    },
    obdId() {
      // 当前参与人-业务（建单人的用户id）
      let { workAssign } = this.airOrderInfo
      let obdItem = workAssign && workAssign.find((el) => el.jobCode === 'obd')
      if (obdItem && obdItem.employeeId) {
        return obdItem.employeeId
      }
      return ''
    },
    asstId() {
      // 当前参与人-业务（建单人的用户id）
      let { workAssign } = this.airOrderInfo
      let asstItem =
        workAssign && workAssign.find((el) => el.jobCode === 'asst')
      if (asstItem && asstItem.employeeId) {
        return asstItem.employeeId
      }
      return ''
    },
    isOp() {
      return this.ordDetRole === 'op' || this.isBd
    },
    isBd() {
      return this.ordDetRole === 'bd' || !this.ordDetRole
    },
    viewState() {
      return this.$route.query.action === 'view' && !this.isOp
    },
    isDraftConfirm() {
      // 是否已经草单确认
      return (
        this.createItem &&
        this.createItem.airBl &&
        this.createItem.airBl.isDraftConfirm === 'y'
      )
    }
  },
  components: {
    FormItem,
    BlCreate,
    BlInfo,
    BlDraftConfirm,
    ExportPop,
    OrderGoods,
    BaseDialog
  },
  watch: {},
  methods: {
  	needShowTip() {
			// 判断是否需要校验
			if (this.showDetail && !this.checkIsChange()) {
        // 需要校验，且有字段发生改变
        return true
			} else {
				return false
			}
		},
		checkIsChange(obj1, obj2) {
      // 校验是否有修改
			if (!obj1 || !obj2) {
				obj1 = this.initDataObj
				obj2 = this.createItem
			}
			let type = ''
			for(let key in obj1) {
				type = Object.prototype.toString.call(obj1[key])
				if (type === '[object Object]' || type === '[object Array]') {
					if (!this.checkIsChange(obj1[key], obj2[key])) {
             return false
					}
				} else if (obj1[key] !== obj2[key]) {
					console.log(`字段${key}发生了改变，请提示是否需要提交！新值是 ${obj2[key]}，旧值是 ${obj1[key]}`)
					return false
				}
			}
			return true
		},
    canSi(row) {
      // 未补料时 提单草单确认后，“操作”人员可以点击
      return row.siStatus !== 'Y' && row.isDraftConfirm === 'y' && this.ordDetRole === 'op'
    },
    siSure(row) {
      // 确认补料
      this.$confirm('是否确认已补料?', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
      .then(() => {
        siFinish(row.blId)
        .then(() => {
          this.$message.success('确认补料成功')
          this.getBlList()
        })
      })
    },
    tableRowClassName({ row }) {
      if (row.blId === this.createItem.airBl.blId && this.showDetail) {
        return 'isChecked-row'
      }
      return ''
    },
    formatblNo(blNo, blType) {
      if (blType === 'hawb') {
        return blNo
      } else {
        if (!blNo) {
          return ''
        } else {
          let blNoArr = blNo.split('-')
          if (blNoArr.length === 2) {
            if (!blNoArr[0]) {
              return blNoArr[1]
            } else if (!blNoArr[1]) {
              return blNoArr[0]
            } else if (blNoArr[1] && blNoArr[0]) {
              return blNo
            }
          }
        }
      }
    },
    // doPrint(val) {
    //   var ordonnance = document.getElementById(val).contentWindow
    //   setTimeout(() => {
    //     ordonnance.print()
    //   }, 100)
    // },
    handlePrint(row) {
      let data = {}
      // mbl
      if (row.blType == 'mawb') {
        data = {
          orderNo: this.$route.query.orderNo,
          blId: row.blId,
          fileType: 'mbl_draft',
          docType: 'pdf'
        }
      }
      // hbl
      if (row.blType === 'hawb') {
        data = {
          orderNo: this.$route.query.orderNo,
          blId: row.blId,
          fileType: 'hbl_draft',
          docType: 'pdf',
          param: {
            asRoleTxt:
              'AS AGENT FOR THE CARRIER: LONG SAIL SHIPPING LINE S.A.LIMITED',
            mbl: 'n'
          }
        }
      }
      this.loading = true
      blFileReview(data).then((res) => {
        let routeUrl = this.$router.resolve({
          name: 'AirHblPrint',
          query: {
            fileNo: res.data.fileNo,
            fileName: res.data.name,
            blId: row.blId
          }
        })
        this.loading = false
        window.open(routeUrl.href, '_blank')
      })
    },
    // 草单预览,传参默认这里写死，默认与输出草单的弹窗内第一个选项一致
    handlePreview(row) {
      let data = {}
      // mbl
      if (row.blType == 'mawb') {
        data = {
          orderNo: this.$route.query.orderNo,
          blId: row.blId,
          fileType: 'mbl_draft',
          docType: 'pdf'
        }
      }
      // hbl
      if (row.blType === 'hawb') {
        data = {
          orderNo: this.$route.query.orderNo,
          blId: row.blId,
          fileType: 'hbl_draft',
          docType: 'pdf',
          param: {
            asRoleTxt:
              'AS AGENT FOR THE CARRIER: LONG SAIL SHIPPING LINE S.A.LIMITED',
            mbl: 'n'
          }
        }
      }
      this.loading = true
      blFileReview(data).then((res) => {
        this.loading = false
        this.$store.dispatch('order/previewFile', {
          fileNo: res.data.fileNo,
          fileName: res.data.name
        })
      })
    },
    changeGoods(val) {
      this.createItem.airBlCargoStat.totalWeight = val.data.totalWeight
      this.createItem.airBlCargoStat.totalQuantity = val.data.totalQuantity
      this.createItem.airBlCargoStat.totalVolume = val.data.totalVolume
    },
    // 打开草单确认弹窗
    handleBlDraftConfirm(row) {
      let typeMsg = row.blType === 'hawb' ? '代理' : '客户'
      this.blId = row.blId
      this.$confirm(`${typeMsg}是否已确认草单无问题?`, '草单确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.blDraftConfirm(row)
        })
        .catch(() => {})
    },
    // 草单确认
    blDraftConfirm(row) {
      blDraftConfirm({ blId: row.blId, orderNo: row.orderNo }).then((res) => {
        this.$message({
          type: 'success',
          message: '草单确认成功',
          duration: 1000,
          onClose: () => {
            this.getBlList()
            // this.isDraftConfirm = true
            this.createItem.airBl.isDraftConfirm = 'y'
          }
        })
      })
    },
    changeStatus(item) {
      if (item.isDraftConfirm != 'y') {
        this.$message.error(`草单确认后才可以修改出单状态`)
        return false
      }
      this.$confirm('是否确认修改为“已出单”状态？', '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          let params = {
            blId: item.blId,
            orderNo: item.orderNo
          }
          blIssueBl(params).then((res) => {
            this.$message({
              type: 'success',
              message: '修改成功',
              duration: 1000,
              onClose: () => {
                this.getBlList()
              }
            })
          })
        })
        .catch(() => {})
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.dialogConfig.show = false
      } else {
        this.dialogConfig.show = false
      }
    },
    handleGood(el) {
      // 新增
      if (el.type === 'add') {
        this.goodsList.list.push(el.obj)
      } else if (el.type === 'edit') {
        this.$set(this.goodsList, el.index, el.obj)
      } else {
        // 删除
        this.goodsList.list.splice(el.index, 1)
      }
    },
    // 获取提单列表
    getBlList() {
      blList({
        orderNo: this.$route.query.orderNo
      }).then((res) => {
        this.blList = res.data || []
        this.allBl = res.data || []
        this.isLoading = false
      })
    },
    // 设置二级提单不能拆单
    getChildData(arr) {
      let firstList = arr.filter((el) => !el.parentBlId)
      for (let i = 0; i < firstList.length; i++) {
        for (let j = 0; j < arr.length; j++) {
          if (arr[j].parentBlId === firstList[i].blId) {
            if (!firstList[i].children) {
              firstList[i].children = []
            }
            firstList[i].children.push(arr[j])
          }
        }
      }
      return firstList
    },
    handleSelect(selection) {
      if (selection.length > 1) {
        let del_row = selection.shift()
        this.$refs.blTable.toggleRowSelection(del_row, false)
      }
    },
    // 获取多选
    handleSelectionChange(val) {
      this.multipleSelection = val
      console.log(this.multipleSelection)
    },
    // 全选/全不选
    handleSelectAll(selection) {
      //table第一层只要有在selection里面就是全选
      const isSelect = selection.some((el) => {
        const blIds = this.blList.map((j) => j.blId)
        return blIds.includes(el.blId)
      })
      //table第一层不在selection里面就是全不选
      const isCancel = !this.blList.every((el) => {
        const selectOids = selection.map((j) => j.blId)
        return selectOids.includes(el.blId)
      })

      if (isSelect) {
        selection.map((el) => {
          if (el.children) {
            el.children.map((j) => {
              this.toggleSelection(j, true)
            })
          }
        })
      }

      if (isCancel) {
        this.blList.map((el) => {
          if (el.children) {
            el.children.map((j) => {
              this.toggleSelection(j, false)
            })
          }
        })
      }
    },
    toggleSelection(row, select) {
      if (row) {
        this.$nextTick(() => {
          this.$refs.blTable &&
            this.$refs.blTable.toggleRowSelection(row, select)
        })
      } else {
        this.$refs.blTable.clearSelection()
      }
    },
    // 获取选中的blId
    // getOids() {
    //   let blIds = []
    //   this.multipleSelection.map((item) => {
    //     blIds.push(item.blId)
    //   })
    //   return blIds
    // },
    // 过滤集装箱数据
    validate(values) {
      let reg = /^\d+(\.\d+)?$/,
        numberReg = /^[0-9]+$/
      if (values.some((item) => !numberReg.test(item.quantity))) {
        this.$message({ type: 'error', message: '请输入正确的件数' })
        return false
      }
      if (values.some((item) => item.quantity < 1)) {
        this.$message({ type: 'error', message: '件数不能小于1' })
        return false
      }

      if (values.some((item) => !item.packageType)) {
        this.$message({ type: 'error', message: '包装不能为空' })
        return false
      }
      return true
    },
    handleRelease() {
      // 提单撤回
      if (this.multipleSelection.length !== 1) {
        return this.$message({
          type: 'warning',
          message: '请选择一条提单'
        })
      }
      airBlCancel({
        blId: this.multipleSelection[0].blId,
        orderNo: this.$route.query.orderNo
      }).then((res) => {
        this.$message({
          message: '提单撤回成功',
          type: 'success',
          onClose: () => {
            this.getBlList()
            this.createItem.airBl.isDraftConfirm = 'n'
          }
        })
      })
    },
    // 取消
    handleCancel() {
      this.showDetail = false
    },
    handleAddBl() {
      // 没主单时候，默认新增主单；有主单事，默认建分单
      if (this.blList.length) {
        this.initAddHbl()
      } else {
        this.initAddMbl()
      }
    },
    initAddMbl() {
      //默认新增主单
      this.createItem = JSON.parse(JSON.stringify(defaultCreateQuery))
      this.createItem.airBlCargoStat.rateCharge = 'AS ARRANGED'
      this.createItem.airBl.currency='CNY'
      this.createItem.airBl.blNo = this.airOrderInfo.blNo
      this.isAddBl = false
      this.showDetail = false
      setTimeout(()=>{
        this.isAddBl = true
        this.showDetail = true
        this.initDataObj = JSON.parse(JSON.stringify(this.createItem))
      },300)
    },
    initAddHbl() {
      //默认新增分单
      this.handleAddHbl(this.blList[0])
    },
    // 新增保存
    handleSave() {
      // 校验所有的表单
      let formValidateList = [
        this.$refs.blInfo.$refs.OtherCharges.submit(),
        this.$refs.blInfo.validateForm(),
        this.$refs.OrderGoods.validateForm()
      ]
      Promise.all(formValidateList)
        .then(() => {
          let goodsList = this.goodsList.list.map((item) => {
            return Object.keys(item).reduce((obj, key) => {
              if (key === 'hscodeOptions') return obj
              obj[key] = item[key]
              return obj
            }, {})
          })
          let airBlCargoStat = JSON.parse(
            JSON.stringify(this.createItem.airBlCargoStat)
          )
          if (!airBlCargoStat.rateCharge || isNaN(airBlCargoStat.rateCharge)) {
            airBlCargoStat.rateCharge = 0
          }
          let params = {
            orderNo: this.$route.query.orderNo,
            airBl: this.createItem.airBl,
            airBlCargoStat: airBlCargoStat,
            airBlCargos: goodsList,
            airBlContact: this.createItem.airBlContact,
            airBlExt: this.createItem.airBlExt,
            airBlOtherCharges: this.createItem.airBlOtherCharges
          }
          params.airBl.orderNo = this.$route.query.orderNo
          params.airBlContact.orderNo = this.$route.query.orderNo
          params.airBlExt.orderNo = this.$route.query.orderNo
          params.airBlOtherCharges.orderNo = this.$route.query.orderNo
          if (this.createItem.airBl.blType === 'mawb') {
            if (this.createItem.mblPrefix || this.createItem.mblSuffix) {
              this.createItem.airBl.blNo = `${this.createItem.mblPrefix}-${this.createItem.mblSuffix}`
            } else {
              this.createItem.airBl.blNo = ''
            }
          }
          this.isLoading = true
          blSave(params)
            .then(() => {
              this.getBlList()
              this.showDetail = false
              this.$message({
                type: 'success',
                message: '保存成功'
              })
            })
            .catch(() => {
              this.isLoading = false
            })
        })
        .catch(() => {
          this.$message.error('请按要求填写数据')
          toViewPosition('service-container', 42)
        })
    },
    // 打开输出弹窗
    handleCommand(command) {
      this.fileCommand = command
      if (command == '1') {
        if (this.multipleSelection.length < 1)
          return this.$message({
            type: 'warning',
            message: '请选择一条要导出的提单'
          })
      }
      if (command == '2' &&  this.blList.length===0) {
        if (this.multipleSelection.length < 1)
          return this.$message({
            type: 'warning',
            message: '新建主单才能输出舱单'
          })
      }
      if (this.showDetail) {
        let blId = (this.initDataObj.airBl && this.initDataObj.airBl.blId) || ''
				let obj = this.multipleSelection.find(item => item.blId === blId)
				if (obj && this.needShowTip()) {
					this.$confirm('提单还未保存，是否放弃此次编辑？', '警告', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					})
					.then(() => { 
						this.exportPopShow = true
					})
					.catch(() => {
						
					})
				} else {
          this.exportPopShow = true
				}
			} else {
         this.exportPopShow = true
			}
    },
    exportPopClose(action, value) {
      if (action === 'Confirm') {
        this.handleExport(value)
      } else {
        this.exportPopShow = false
      }
    },
    // 输出
    handleExport(value) {
      let data = {}
      let url = ''
      let blType = ''
      let linkUrl = ''
      if (this.fileCommand == '1') {
        url = '/order/air/bl/exportDraft'
        data = {
          blId: this.multipleSelection[0].blId,
          docType: value.docType
        }

        blType =
          this.multipleSelection[0].blType === 'mawb'
            ? '主单确认件'
            : '分单确认件'
        linkUrl = `${blType}(${this.$route.query.orderNo}${
          this.multipleSelection[0].blNo ? '_' : ''
        }${this.multipleSelection[0].blNo}).${value.docType.toLowerCase()}`
      } else {
        url = '/order/air/bl/exportManifest'
        data = {
          orderNo: this.$route.query.orderNo,
          docType: value.docType
        }
        blType = '空运舱单'
        linkUrl = `${blType}(${
          this.$route.query.orderNo
        }).${value.docType.toLowerCase()}`
      }
      this.$store
        .dispatch('order/exportBlobFile', {
          uri: url,
          data
        })
        .then((res) => {
          console.log(res)
          this.exportPopShow = false
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = linkUrl
          link.click()
        })
    },
    handleCheckChange(row, cb) {
			// 草单确认 预览等判断是否已编辑未保存
      let blId = (this.initDataObj.airBl && this.initDataObj.airBl.blId) || ''
			if (row.blId === blId && this.showDetail) {
				if (this.needShowTip()) {
					this.$confirm('提单还未保存，是否放弃此次编辑？', '警告', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					})
					.then(() => { 
						this[cb](row)
					})
					.catch(() => {
						
					})
				} else {
					this[cb](row)
				}
			} else {
				this[cb](row)
			}
		},
    // 详情
    handleInfo(row) {
      this.currentBlType = row.blType
      this.blId = row.blId
      // 查看提单详情
      blDetail({
        blId: row.blId,
        orderNo: row.orderNo
      }).then((res) => {
        let { data } = res
        this.createItem = data
        this.createItem.airBl.blType = data.airBl.blType
        if (
          isNaN(this.createItem.airBlCargoStat.rateCharge) ||
          !this.createItem.airBlCargoStat.rateCharge
        ) {
          this.createItem.airBlCargoStat.rateCharge = 'AS ARRANGED'
        }
        this.goodsList.list = data.airBlCargos
        this.isAddBl = false
        this.showDetail = false
        console.log(row.blId)
        setTimeout(() => {
          this.showDetail = true
          console.log(this.createItem.airBl.blNo)
        }, 0)
        setTimeout(() => {
          this.isLoading = false
          this.initDataObj = JSON.parse(JSON.stringify(this.createItem))
        }, 500)
      })
    },
    changeMbl(val) {
      if (!val) {
        return
      }
      blDetail({
        blId: val,
        orderNo: this.$route.query.orderNo
      }).then((res) => {
        let { data } = res
        data.airBl.blType = 'hawb'
        data.airBl.parentBlId = this.createItem.airBl.parentBlId
        data.airBl.blNo = this.createItem.airBl.blNo
        this.createItem = data
        this.goodsList.list = data.airBlCargos
        this.createItem.airBl.blId = ''
        this.createItem.airBlCargoStat.blId = ''
        this.createItem.airBlContact.blId = ''
        this.createItem.airBlExt.blId = ''

        this.createItem.airBlCargoStat.oid = ''
        this.createItem.airBlContact.oid = ''
        this.createItem.airBlExt.oid = ''
        this.createItem.airBl.airWayBill =
          'LONGSAIL SUPPLY CHAIN CO., LTD'
        for (let i = 0; i < this.createItem.airBlCargos.length; i++) {
          this.$set(this.createItem.airBlCargos[i], 'blId', '')
        }
        for (let i = 0; i < this.createItem.airBlOtherCharges.length; i++) {
          this.$set(this.createItem.airBlOtherCharges[i], 'blId', '')
          this.$set(this.createItem.airBlOtherCharges[i], 'oid', '')
        }
      })
    },
    handleAddHbl(item) {
      this.currentBlType = 'hawb'
      //新增分单
      blDetail({
        blId: item.blId,
        orderNo: item.orderNo
      }).then((res) => {
        this.isOptional = true
        this.blId = item.blId
        let { data } = res
        this.createItem = data
        this.createItem.airBl.blType = 'hawb'
        this.createItem.airBl.parentBlId = data.airBl.blId
        this.goodsList.list = data.airBlCargos
        for(let i=0;i<this.goodsList.list.length;i++){
          delete this.goodsList.list[i].oid
        }
        console.log(this.goodsList.list)
        this.createItem.airBl.blId = ''
        this.createItem.airBlCargoStat.blId = ''
        this.createItem.airBlContact.blId = ''
        this.createItem.airBlExt.blId = ''

        this.createItem.airBlCargoStat.rateCharge = 'AS ARRANGED'

        this.createItem.airBlCargoStat.oid = ''
        this.createItem.airBlContact.oid = ''
        this.createItem.airBlExt.oid = ''
        this.createItem.airBl.airWayBill =
          'LONGSAIL SUPPLY CHAIN CO., LTD'
        for (let i = 0; i < this.createItem.airBlCargos.length; i++) {
          this.$set(this.createItem.airBlCargos[i], 'blId', '')
          // this.$set(this.createItem.airBlCargos[i], 'oid', '')
        }
        for (let i = 0; i < this.createItem.airBlOtherCharges.length; i++) {
          this.$set(this.createItem.airBlOtherCharges[i], 'blId', '')
          this.$set(this.createItem.airBlOtherCharges[i], 'oid', '')
        }
        this.createItem.airBl.isDraftConfirm = 'n'
        this.createItem.airBl.issueStatus = ''
        this.showDetail = false
        setTimeout(() => {
          this.isAddBl = true
          this.showDetail = true
        }, 0)
        this.initDataObj = JSON.parse(JSON.stringify(this.createItem))
      })
    },
    // 删除
    handleDelete(row) {
      this.$confirm('是否确认删除该条数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return blDelete({
            blId: row.blId,
            orderNo: this.$route.query.orderNo
          })
        })
        .then((response) => {
          // 删除和打开详情的信息为同一条时，该条信息的详情则不显示
          if (this.blId === row.blId) {
            this.showDetail = false
          }
          this.getBlList()
          this.$message({ message: '删除成功', type: 'success' })
        })
        .catch(() => {})
    },
    // 放单完成
    handlePutFinish(row) {
      this.$confirm('是否确认放单完成?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.handlePutSave(row)
        })
        .catch((err) => {})
    },
    handlePutSave(row) {
      let data = {
        oid: row.oid,
        orderNo: row.orderNo,
        remark: row.remark,
        putStatus: row.putStatus,
        telexApplyStatus: row.telexApplyStatus,
        telexApplyEmployeeId: row.telexApplyEmployeeId,
        telexDownStatus: row.telexDownStatus,
        telexDownEmployeeId: row.telexDownEmployeeId
      }
      // 勾选船东申请传申请人id，没勾选选0
      if (data.telexApplyStatus !== 'y') {
        data.telexApplyEmployeeId = 0
        data.telexApplyEmployeeName = ''
      }
      if (this.createItem.telexDownStatus !== 'y') {
        data.telexDownEmployeeId = 0
        data.telexDownEmployeeName = ''
      }
      if (type === 'finish') {
        Object.assign(data, { putStatus: 'finish' })
      }
      blPutSave(data).then((res) => {
        this.$message({
          message: '放单完成成功',
          type: 'success',
          duration: 1000,
          onClose: () => {
            this.getBlList()
          }
        })
      })
    }
  }
}
</script>
<style lang="scss">
@import '../../../less/index.scss';
.icon-tdcg {
  display: inline-block;
  width: 16px;
  height: 16px;
  background: #b3b3b3;
  border-radius: 2px;
  color: #fff;
  line-height: 16px;
  text-align: center;
  font-style: normal;
  margin-right: 2px;
  font-size: 12px;
}
.icon-hbl {
  display: inline-block;
  width: 16px;
  height: 16px;
  background: #3e80f5;
  border-radius: 2px;
  color: #fff;
  line-height: 16px;
  text-align: center;
  font-style: normal;
}
.air-bl {
  .el-link {
    font-size: 12px;
    margin: 0 3px;
  }
}
.blNo-flex {
  display: flex;
  align-items: center;
}
.air-bl-fixed-top {
  position: fixed;
  top: 24px;
  left: 0;
  right: 20px;
  z-index: 50;
  // width: calc(100vw - 137px);
  background: #fff;
  padding-left: 20px;
  padding-right: 10px;
  box-shadow: ragb(233 233 233 1) 4px 0px 10px 0px;
}
.air-bl {
  .el-table__header-wrapper .el-checkbox {
    display: none;
  }
  .isChecked-row td {
    background: #e7edf7;
  }
}
</style>
