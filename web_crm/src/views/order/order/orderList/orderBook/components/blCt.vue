<template>
	<div class="edit-row" id="blCt">
		<div class="edit-container so" id="blTableCont">
			<div class="row-tit so">
				<span class="tit">提单信息</span>
				<div class="row-tit-operate">
					<el-button size="mini" type="default" @click="handleBatchBlDraftConfirm" :disabled="isBd || isView || blListIncludesNotCscCreated">草单确认</el-button>
					<el-button size="mini" type="default" @click="handleBlDeliveryCancel" :disabled="isBd || isView || blListIncludesNotCscCreated">提单撤回</el-button>
					<el-button size="mini" type="primary" @click="handleAddBl" :disabled="isBd || isView">新增提单</el-button>
					<div class="el-button-group">
						<el-button size="mini" type="default" class="ml10" @click="handleSeparate" :disabled="isBd || isView">拆单</el-button>
						<el-button size="mini" type="default" class="ml10" @click="handleMerge" :disabled="isBd || isView">并单</el-button>
					</div>
				</div>
			</div>
			<div class="row-form mt10 table-com-layout">
				<el-table
					class="bl-table"
					ref="blTable"
					stripe
					style="width: 100%"
					:data="blList"
					default-expand-all
					row-key="blId"
					:tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
					:select-on-indeterminate="true"
					@select-all="handleSelectAll"
					@selection-change="handleSelectionChange"
					:max-height="320"
					@cell-mouse-enter="showTooltip"
					@cell-mouse-leave="hiddenTooltip"
					:row-class-name="tableRowClassName"
				>
					<el-table-column type="selection" width="40"></el-table-column>
					<el-table-column prop="blId" label="ID" align="center" width="90" type=""></el-table-column>
					<el-table-column prop="blNo" label="提单号" align="left" width="">
						<template slot-scope="scope">
							<span class="blNo-class" @click="handleInfo(scope.row)">
								<i class="icon-tdcg" v-if="scope.row.blMode === 'tdcg'">草</i>
								<i class="icon-hbl" v-if="scope.row.blType">{{ scope.row.blType === 'hbl' ? 'H' : 'M' }}</i>
								{{ scope.row.blNo }}
							</span>
						</template>
					</el-table-column>
					<el-table-column prop="status" label="草单确认" align="center" type="">
						<template slot-scope="scope">
							<div class="column-text">
								<span>{{scope.row.isDraftConfirm === 'y' ? '已确认' : '未确认'}}</span>
								<!-- <el-button @click="handleCheckChange(scope.row, 'handleBlDraftConfirm')" type="text" size="mini" :disabled="isBd || isView || isNotCscCreated(scope.row)" class="underline" v-else> 未确认</el-button> -->
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="blMode" label="出单方式" align="center" type="" width="">
						<template slot-scope="scope">
							{{ scope.row.blMode | modeFilter }}
						</template>
					</el-table-column>
					<el-table-column label="操作" width="280" align="center" fixed="right" type="">``
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button type="text" size="mini" :disabled="isBd || isView" class="create-bl-btn">
									<span v-if="scope.row.createBlBtnShow" @click="handleCreateBlFromExist(scope.row)">{{ scope.row.blType === 'hbl' ? '生成MBL' : '生成HBL' }}</span>
								</el-button>
								<el-button @click="handleInfo(scope.row)" type="text" size="mini">详情</el-button>
								<el-button @click="handleViewLog(scope.row)" type="text" size="mini">日志</el-button>
								<el-button @click="handleDelete(scope.row)" type="text" size="mini" :disabled="isBd || isView || isNotCscCreated(scope.row)">删除</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
				<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
			</div>
		</div>
		<!-- 详情 -->
		<div class="component-cont blInfo-cont" v-if="showDetail">
			<div :class="['blInfo-between', { isFixed: saveBarFixed }]" :style="styleObject" id="saveBar">
				<div class="ft14">{{ createItem.blId ? '提单详情' : '新增提单' }}</div>
				<div class="el-button-group">
					<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
					<el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="isBd || isView || hblIsDraftConfirm || createdByIsNotUserId" :loading="loading">保存</el-button>
				</div>
			</div>
			<el-form ref="blSubmit" :model="createItem" :rules="rules" class="order-cont-form" size="mini">
				<div class="row-cont margin0">
					<div class="row-cont-tit bl-flex-class">
						<span class="tit">提单信息</span>
						<speciesStrSet />
					</div>
					<BlInfo :orderInfo="detailInfo" :createItem="createItem" :fillPortCodes="fillPortCodes" :orderStatus="detailInfo.orderStatus" :bargeOption="bargeOption" :validateBlContact="validateBlContact" ref="blInfo" />
				</div>
				<!-- 集装箱信息 -->
				<BindContainer
					:serviceType="orderInfoDataObj.serviceType"
					:orderStatus="detailInfo.orderStatus"
					:createItem="createItem"
					:selectContainerList="selectContainerList"
					:bindContainerList="createItem.blCargos"
					:containerTotal="containerTotal"
					@bind="handleBind"
					@cancelBind="handleCancelBind"
					v-if="['st02'].includes(detailInfo.serviceType)"
				/>
				<BlLclDto :cnList="cnList" :createItem="createItem" :orderStatus="detailInfo.orderStatus" ref="blLclDto" v-if="['st04'].includes(detailInfo.serviceType)" />
			</el-form>
		</div>
		<!-- 拆单，并单弹窗 -->
		<div v-if="blSeparateShow">
			<BlSeparate @close="blSeparatePopClose" :seprateBlId="seprateBlId" />
		</div>
		<div v-if="blMergeShow">
			<BlMerge @close="blMergePopClose" :blIdList="blIdList" :orderInfo="detailInfo" />
		</div>
		<!-- 生成MBL弹窗 -->
		<div v-if="blCreateShow">
			<BlCreate @close="blCreatePopClose" :existBlId="blId" />
		</div>
		<!-- 提单撤回弹窗 -->
		<!-- <div v-if="blDeliveryCancelShow">
			<BlDeliveryCancel @close="blDeliveryCancelPopClose" :cancelBlIds="cancelBlIds" />
		</div> -->
		<!-- 草单确认弹窗 -->
		<!-- <div v-if="blDraftConfirmShow">
			<BlDraftConfirm @close="blDraftConfirmPopClose" :blId="blId" :workAssign="workAssign" :cscUpdateItem="cscUpdateItem" />
		</div> -->
		<!-- 客户同意放货弹窗 -->
		<!-- <div v-if="blDeliveryApproveShow">
			<BlDeliveryApprove @close="blDeliveryApprovePopClose" :blId="blId" :blMode="blMode" :agreePutQuery="agreePutQuery" />
		</div> -->
		<!-- 上传附件 -->
		<!-- <div v-if="blDeliveryUploadShow">
			<BlDeliveryUpload @close="blDeliveryUploadPopClose" :blId="blId" :blMode="blMode" :blType="blType" :detailInfo="detailInfo" />
		</div> -->
		<!-- 附件列表 -->
		<!-- <div v-if="blFileListShow">
			<BlFileList @close="blFileListPopClose" :param="listItemQuery" />
		</div> -->
		<!-- 保险列表 -->
		<!-- <div v-if="blInsureListShow">
			<BlInsureList @close="blInsureListPopClose" :param="insureItemQuery" />
		</div> -->
		<!-- 贸易单证列表 -->
		<!-- <div v-if="blTradeListShow">
			<BlTradeList @close="blTradeListPopClose" :param="tradeItemQuery" />
		</div> -->
		<!-- 邮件发送 -->
		<!-- <div v-if="emailPopShow">
			<MailSend @close="emailPopClose" />
		</div> -->
		<!-- 输出HBL,MBL确认件弹窗 -->
		<!-- <div v-if="exportPopShow">
			<ExportPop :exportTypeQuery="exportTypeQuery" @close="exportPopClose" :detailInfo="detailInfo" />
		</div> -->
		<!-- 关联提单列表弹窗 -->
		<!-- <div v-if="relatePopShow">
			<RelateBlPop :relateList="relateList" @close="relatePopClose" />
		</div> -->
		<!-- HBL打印文件选项弹窗 -->
		<!-- <div v-if="hblPrintPopShow">
			<HblPrintPop :hblPrintQuery="hblPrintQuery" @close="hblPrintPopClose" />
		</div> -->
		<!-- 补料要求弹窗 -->
		<!-- <div v-if="siRemarkPopShow">
			<SiRemark :siRemarkQuery="siRemarkQuery" @close="siRemarkPopClose" />
		</div> -->
		<!-- COPY件文件确认 -->
		<!-- <TakeApplyConfirm @close="takeApplyPopCloseConfirm" :confirmInfo="confirmInfo" :dialogOrderShow="takeApplyShowConfirm" /> -->
		<!-- 日志弹窗 -->
		<div v-if="blLogPopShow">
			<BlLog :params="logParams" @close="blLogPopClose" />
		</div>
		<!-- 提单移动弹窗 -->
		<!-- <div v-if="movePopShow">
			<MoveBlPop :movePopQuery="movePopQuery" @close="movePopClose" />
		</div> -->
		<!-- 补料状态修改 -->
		<!-- <div v-if="siStatusEditPopShow">
			<siStatusEditPop :siStatusObj="siStatusObj" :workAssign="workAssign" @close="siStatusEditPopClose" />
		</div> -->
	</div>
</template>

<script>
import Vue from 'vue'
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { toViewPosition } from '@/utils/scroll-to.js'
import { orderJointInfo, orderInfo, lclChildList, putBlCancel } from '@/api/order/list'
// import BlDeliveryUpload from './blDeliveryUpload'
import tableTooltip from '@/components/Base/Table/table-tooltip'
// import TakeApplyConfirm from './takeApplyConfirm'
import BlLog from './blLog'
import {
	blList,
	blSave,
	blSaveCheck,
	blDelete,
	blUpdateStatus,
	blDetail,
	blCreateSerialNo,
	blCreateBlFromExist,
	blCopyConfirm,
	blFileExport,
	blPutMail,
	blDraftConfirm,
	blImportSubBl,
	getLclCnAndSn,
	blFileReview,
	updateInitTelexHblStatus,
	getLclNoImportChildList,
	blUsaCreateBatch,
	blSiConfirm,
	importBlPutFinish,
	blMove,
	confirmCheck,
	blDraftConfirmCheckBatch,
	blDraftConfirmFileBatch,
	blDeliveryCancel
} from '@/api/order/bl'
import { orderWorkSi } from '@/api/order/list'
import FormItem from '@/components/Form/item'
import BindContainer from './bindContainer'
import BlSeparate from './blSeparate'
import BlMerge from './blMerge'
import BlCreate from './blCreate'
import BlInfo from './blInfo'
import BlLclDto from './blLclDto'
// import BlContact from './blContact'
// import BlDraftConfirm from './blDraftConfirm'
// import BlDeliveryCancel from './blDeliveryCancel'
// import BlDeliveryApprove from './blDeliveryApprove'
// import BlFileList from './blFileList'
// import BlTradeList from './blTradeList'
// import BlInsureList from './blInsureList'
// import MailSend from '../../putList/components/mailSend'
// import ExportPop from './exportPop'
// import RelateBlPop from './relateBlPop'
// import HblPrintPop from './hblPrintPop'
// import SiRemark from './blSiRemark'
import speciesStrSet from './speciesStrSet'
// import MoveBlPop from './moveBlPop'
import { validateContact } from '@/utils/validate'
import { canEnter } from '@/views/order/order/js/check.js'
// import siStatusEditPop from './siStatusEditPop.vue'

const defaultCreateQuery = {
	createdBy: '',
	blId: undefined,
	parentBlId: null,
	orderNo: '',
	blMode: '',
	blNo: '',
	blType: '',
	cargoDesc: '',
	cargoMark: '',
	copyCount: '',
	canEdit: '',
	// issueTime: '',
	masterBlNo: '',
	originalCount: '',
	remark: '',
	remarkPrint: '',
	signAddress: '',
	signEmployeeId: '',
	signEmployeeName: '',
	signTime: '',
	tripartiteTrade: '',
	placeCompName: '',
	orderInfo: {
		bargeVessel: '',
		bargeVoyage: '',
		bargePorPortCode: '',
		bargePorPortName: '',
		vessel: '',
		voyage: '',
		polPortCode: '',
		polPortName: '',
		transitPortCode: '',
		transitPortName: '',
		podPortCode: '',
		podPortName: '',
		unloadingPortCode: '',
		unloadingPortName: '',
		shipCarrierCode: '',
		siCutOff: '',
		etaTime: '',
		tdTime: '',
		bargeTdTime: '',
		deliveryPlace: '',
		payMode: '',
		transportTerm: '',
		contractNo: '',
		contractCompany: '',
		contractSupplierId: '',
		forwardAgent: ''
		// contractSupplierName: '',
	},
	blCargos: [],
	blContact: {
		// blNo: '',
		consignee: '',
		notify1: '',
		notify2: ''
		// notify3: '',
		// shipper: '',
		// intrustRemark: ''
	},
	blLclDto: {
		cn: '',
		sn: '',
		whNo: '',
		containerType: '',
		quantity: '',
		weight: '',
		volume: '',
		packageType: ''
	},
	quantity: null,
	weight: null,
	volume: null,
	packageType: '',
	isDraftConfirm: ''
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
		modeFilter(blMode) {
			return getDictLabel('blMode', blMode)
		},
		tripartFilter(tripartiteTrade) {
			return getDictLabel('tripartiteTrade', tripartiteTrade)
		}
	},
	props: {
		saveBarFixed: {
			type: Boolean,
			default: false
		},
		saveBarFixedStyle: {
			type: Object,
			default: () => ({})
		}
	},
	data() {
		return {
			loading: false,
			confirmInfo: {},
			takeApplyShowConfirm: false,
			tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
			},
			blDeliveryUploadShow: false, // 上传附件
			relateList: [],
			relatePopShow: false,
			type: '', // 新增或修改的标识
			showRelateBtn: false,
			serviceType: '',
			isView: true,
			selectContainerList: [],
			state: 'valid',
			blList: [],
			oQuery: this.$route.query,
			blStatus: '', // 提单状态
			isAllSelect: '', // 全选
			multipleSelection: [],
			showDetail: false,
			truckContainersShow: false,
			createItem: Object.assign({}, defaultCreateQuery),
			seprateBlId: '', // 选中的拆单提单号
			blSeparateShow: false, // 拆单弹窗
			blMergeShow: false, // 并单弹窗
			blIdList: [], // 被并单的提单号
			blCreateShow: false, // 生成MBL弹窗
			blDraftConfirmShow: false, // 草单确认弹窗
			workAssign: [], // 订单详情参与人
			cscUpdateItem: {}, // 单证人员变更信息
			// blInfoData: {},	// 列表单行row数据
			blDeliveryCancelShow: false, // 提单撤回弹窗
			blDeliveryApproveShow: false, // 客户同意放货弹窗
			agreePutQuery: {},
			blFileListShow: false, // 查看附件弹窗
			blTradeListShow: false, // 查看贸易单证弹窗
			blInsureListShow: false, // 查看保险弹窗
			insureItemQuery: {}, // 附件弹窗props
			tradeItemQuery: {}, // 附件弹窗props
			listItemQuery: {}, // 附件弹窗props
			blId: '', // bl编号
			blMode: '', // 出单方式
			blType: '', // 提单类型
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
				quantity: '',
				isCheck: '',
				itemIsCheck: ''
			},
			// 港口反显数据
			fillPolData: {},
			fillPortCodes: '',
			detailInfo: {},
			bargeOption: null,
			emailPopShow: false, // 电放邮件弹窗
			mailItemQuery: {},
			exportPopShow: false, // 输出弹窗.
			exportTypeQuery: {},
			exportTypeOptions: [
				{ label: 'HBL确认件', value: 'hbl_confirm' },
				{ label: 'MBL确认件', value: 'mbl_draft' },
				{ label: '电放申请保函', value: 'telex_apply' },
				{ label: 'SWB保函', value: 'SEAWAYBILL_INDEMNITY' }
			],
			rules: {},
			cnList: [], // 散货提单的箱号
			issueWay: ['telex_release', 'bill_at_destination', 'ibl', 'seaway_bill', 'jthdldf', 'free_telex_release', 'thzb_release'], // 该出单方式之一才可以更改放单状态
			// 正本（邮寄的出单方式）:正本,借同行代理,HBL正本,同行借我司代理HBL正本
			originalArr: ['original', 'jthdlzb', 'thzb'],
			// 电放 :电放,目的港放单,海运单,借同行代理HBL电放,提单草稿，云提单, 事前免电放
			telexReleaseArr: ['telex_release', 'seaway_bill', 'jthdldf', 'bill_at_destination', 'ibl', 'tdcg', 'free_telex_release'],
			hblPrintPopShow: false, // HBL打印弹窗
			hblPrintQuery: {},
			saveId: undefined, // 保存用的blId
			// 设置收发通的单行最大字符，最大行数
			validateBlContact: {
				row: 6,
				col: 58,
				shipper: {},
				consignee: {},
				notify1: {},
				notify2: {}
			},
			siRemarkPopShow: false, // 	补料要求弹窗
			siRemarkQuery: {},
			blListIncludesNotCscCreated: false, // 提单列表包括有非单证本人创建的提单
			blLogPopShow: false,
			logParams: {},
			initDataObj: {},
			movePopShow: false,
			movePopQuery: {},
			siStatusEditPopShow: false,
			siStatusObj: {},
		}
	},
	async created() {
		this.lclChildList()
		// 获取订单详情
		this.getOrderInfoData()
		// bl列表
		this.getBlList()
	},
	mounted() {
		// console.log('🚀 ~ this.dictMap.blMode', this.dictMap.blMode)
		// 补料新增提单
		if (this.$route.query.source === 'SiListAddBl') {
			// 设置延迟 带出订单详情数据
			setTimeout(() => {
				this.handleAddBl()
			}, 500)
		}
	},
	watch: {
		multipleSelection:{
      handler:function(newValue,oldValue){
         if(newValue.length ===1 && newValue[0].blType === 'hbl'){
					this.exportTypeOptions= [
						{ label: 'HBL确认件', value: 'hbl_confirm' },
						{ label: 'MBL确认件', value: 'mbl_draft' },
						{ label: '电放申请保函', value: 'telex_apply' }
					]
				 }else{
					this.exportTypeOptions= [
						{ label: 'HBL确认件', value: 'hbl_confirm' },
						{ label: 'MBL确认件', value: 'mbl_draft' },
						{ label: '电放申请保函', value: 'telex_apply' },
						{ label: 'SWB保函', value: 'SEAWAYBILL_INDEMNITY' }
					]
				 }
      },
      deep:true,
    }
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid,
			userEditRoles: state => state.order.orderList.userEditRoles,
			ordDetRole: state => state.order.orderList.ordDetRole,
			speciesStrArr: state => state.order.speciesStrArr,
			orderInfoDataObj: state => state.order.orderInfoDataObj,
			userId: state => state.user.userId
		}),
		styleObject() {
			// 顶部距离文档
			let offsetTop = document.querySelector('.tabs-container').offsetTop
			// let sideBarWidth = document.querySelector(".sidebar-container").offsetWidth
			// let leftNavWidth = document.querySelector(".columns-menu").offsetWidth
			console.log('this.saveBarFixedStyle', this.saveBarFixedStyle)
			let styleObj = {}
			if (this.saveBarFixed) {
				if (Object.keys(this.saveBarFixedStyle).length) {
					styleObj = this.saveBarFixedStyle
				} else {
					styleObj = {
						left: '120px',
						top: offsetTop + 24 + 'px'
						// left: sideBarWidth + leftNavWidth +14 +5 + 'px'
					}
				}
			} else {
				styleObj = {}
			}
			return styleObj
			// return this.saveBarFixed
			// 	? {
			// 			left: '120px',
			// 			top: offsetTop + 24 + 'px'
			// 			// left: sideBarWidth + leftNavWidth +14 +5 + 'px'
			// 	  }
			// 	: {}
		},
		acIsExport() {
			return this.userEditRoles.includes('ac') || this.userEditRoles.includes('eac')
		},
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc' || this.userEditRoles.includes('obd') || this.userEditRoles.includes('asst')
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isOpTruck() {
			return this.ordDetRole === 'op_truck'
		},
		isEpricing() {
			return this.ordDetRole === 'epricing'
		},
		isEcs() {
			return this.ordDetRole === 'ecs'
		},
		isCsc() {
			return this.ordDetRole === 'csc'
		},
		isBd() {
			// 放开obd,asst权限
			if(['st26','st27','st28'].includes(this.orderInfoDataObj.serviceType)){
				if(this.ordDetRole === 'op_truck'){
					return false
				}else{
					return true
				}
			}else{
				if (this.userEditRoles.includes('obd') || this.userEditRoles.includes('asst') || this.userEditRoles.includes('doc') || this.isCsc) {
					return false
				}
				return !this.ordDetRole || this.ordDetRole === 'bd' || this.isAc || this.isOp || this.isLclOrderList || this.isOpTruck || this.isEpricing || this.isEcs
			}
		
		},
		isLclOrderList() {
			return this.$route.query.source === 'lclOrderList'
		},
		// isView() {
		// 	return ['cancel', 'finish'].includes(this.detailInfo.orderStatus)
		// },
		jointState() {
			return this.$route.query.jointNo ? true : false
		},
		// 箱型箱量统计
		containerTotal() {
			let total = { container: '', quantity: 0, weight: 0, volume: 0, show: true },
				containerTypeList = { type: [], num: [] }

			if (this.createItem.blCargos.length) {
				this.createItem.blCargos.forEach(o => {
					// 重量，体积
					total.quantity += parseInt(o.quantity)
					total.weight += parseFloat(o.weight)
					total.volume += parseFloat(o.volume)
					total.weight = parseFloat(total.weight.toFixed(3))
					total.volume = parseFloat(total.volume.toFixed(3))
					total.quantity = parseFloat(total.quantity.toFixed(3))
					let typeIndex = containerTypeList.type.indexOf(o.containerType)
					if (typeIndex != -1) {
						containerTypeList.num[typeIndex] = containerTypeList.num[typeIndex] + 1
					} else {
						containerTypeList.type.push(o.containerType)
						containerTypeList.num.push(1)
					}
				})
			}
			// 箱型
			for (let i in containerTypeList.type) {
				total.container += (total.container ? ' + ' : '') + containerTypeList.type[i] + '×' + containerTypeList.num[i]
			}
			return total
		},
		hblIsDraftConfirm() {
			// 是否可编辑
			return this.createItem.canEdit === 'n'
		},
		// 提单创建者非单证本人，其他人创建的提单，单证不可编辑。只能编辑自己创建的提单。
		createdByIsNotUserId() {
			return this.isCsc && this.saveId && this.createItem.createdBy !== this.userId
		},
		// 散杂滚装
		isBulkRo() {
			return this.detailInfo.businessType === 'ship_bulk_ro'
		},
		checkId() {
			let workAssign = this.detailInfo.workAssign || []
			let docObj = workAssign.find(item => {
				return item.jobCode === 'doc'
			}) || {}
			let cscObj = workAssign.find(item => {
				return item.jobCode === 'csc'
			}) || {}
			return docObj.employeeId === cscObj.employeeId
		},
		canEditSiStatus() {
			return ['st01', 'st15'].includes(this.detailInfo.serviceType) && // 海运出口整箱委托订舱
			       this.checkId && // 单证和文件是同一个人
			       this.detailInfo.custClass === 'PEER' // 委托客户属于货代客户
		},
	},
	components: {
		tableTooltip,
		// BlDeliveryUpload,
		FormItem,
		BindContainer,
		BlSeparate,
		BlMerge,
		BlCreate,
		BlInfo,
		BlLclDto,
		// BlContact,
		// BlDraftConfirm,
		// BlDeliveryCancel,
		// BlDeliveryApprove,
		// BlFileList,
		// MailSend,
		// ExportPop,
		// RelateBlPop,
		// HblPrintPop,
		// BlInsureList,
		// BlTradeList,
		// SiRemark,
		// TakeApplyConfirm,
		speciesStrSet,
		// MoveBlPop,
		BlLog,
		// siStatusEditPop,
	},
	methods: {
		async getOrderInfoData() {
			let { orderNo, jointNo } = this.$route.query
			this.createItem.orderNo = orderNo
			let fn = jointNo ? orderJointInfo : orderInfo
			let data = jointNo ? { jointNo } : { orderNo }
			let res = await fn(data)
			this.detailInfo = res.data
			this.bargeOption = res.data.barge
			this.workAssign = res.data.workAssign
			// 存储客户id，用于发货人选择弹窗列表调用接口获取参数
			let cust = {
				custid: res.data.custid,
				custName: res.data.custName,
				custIntrustNo: res.data.custIntrustNo,
				businessType: res.data.businessType,
				serviceType: res.data.serviceType
			}
			sessionStorage.setItem('custStr', JSON.stringify(cust))
			this.isView = ['cancel', 'complete'].includes(this.detailInfo.orderStatus) ? true : false
			if (['ship_export_lcl', 'ship_import_lcl'].includes(this.detailInfo.businessType)) {
				// this.exportTypeOptions = [
				// 	{ label: 'HBL确认件', value: 'hbl_confirm' },
				// 	{ label: '电放申请保函', value: 'telex_apply' }
				// ]
				this.getCnList()
			}
		},
		handleMove(row) {
			this.movePopShow = true
			this.movePopQuery = row
		},
		movePopClose(action, values) {
			if (action === 'Confirm') {
				this.handleBlMove(values)
			} else {
				this.movePopShow = false
			}
		},
		handleBlMove(values) {
			blMove({
				parentBlId: values.parentBlId,
				blId: values.blId
			}).then(res => {
				this.$message.success('提单移动成功!')
				this.movePopShow = false
				this.getBlList()
			})
		},
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
			for (let key in obj1) {
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
		handleViewLog(row) {
			this.logParams = row
			this.blLogPopShow = true
		},
		blLogPopClose(action) {
			this.blLogPopShow = false
		},
		// 单证且提单创建人不是本人的不可编辑，单证只能编辑自己创建的提单
		isNotCscCreated(row) {
			return this.isCsc && row.createdBy !== this.userId
		},
		//文件确认弹窗关闭回调
		takeApplyPopCloseConfirm(action, value) {
			this.takeApplyShowConfirm = false
		},
		handleViewCopyConfirm(row) {
			// console.log('🚀 ~ row', row)
			this.confirmInfo.copyCutDate = row.copyCutDate
			this.confirmInfo.copyRemark = row.copyRemark
			this.takeApplyShowConfirm = true
		},
		// 委托单位为国外代理的并且是母集M单不能设置“客户是否同意放货”
		putDisabled(row) {
			return row.custClass === 'FOREIGN_PEER' && row.blType === 'mbl' && row.children && row.children.length > 0
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
		// 为table的行row设置一个className
		tableRowClassName({ row, rowIndex }) {
			// console.log(row, rowIndex)
			if (row.blId === this.createItem.blId && this.showDetail) {
				return 'isChecked-row'
			}
			return ''
		},
		// 打开上传附件
		handleBlDeliveryUpload(row) {
			this.blId = row.blId
			this.blMode = row.blMode
			this.blType = row.blType
			this.blDeliveryUploadShow = true
		},
		// 上传附件关闭回调
		blDeliveryUploadPopClose(action, value) {
			this.blDeliveryUploadShow = false
			if (action === 'Confirm') {
				this.getBlList()
			}
		},
		handleViewSiRemark(row) {
			this.siRemarkPopShow = true
			this.siRemarkQuery = {
				blId: row.blId
			}
		},
		siRemarkPopClose(action, value) {
			this.siRemarkPopShow = false
		},
		// 批量生成美国单号
		handleUsaCreateBatch() {
			if (this.multipleSelection.length === 0) {
				return this.$message.error('请勾选一条要生成美国单号的提单！')
			}
			if (this.multipleSelection.some(item => item.blType !== 'hbl')) {
				return this.$message.error('选择的提单必须都为HBL单才可以生成美国单号')
			}
			// if (this.multipleSelection.some(item => item.blNo.startsWith('LUCN'))) {
			// 	return this.$message.error('选择的提单已经是美国单号了，不能重复生成美国单号')
			// }
			let blIdList = this.multipleSelection.map(el => el.blId)
			blUsaCreateBatch({
				orderNo: this.$route.query.orderNo,
				blIdList: blIdList
			}).then(res => {
				this.$message.success('批量生成成功!')
				this.getBlList()
			})
		},
		relatePopClose(action, value) {
			// console.log('🚀 ~ value', value)
			if (action === 'Confirm') {
				blImportSubBl({ fclOrderNo: this.oQuery.orderNo, subOrderNo: value }).then(res => {
					this.$message.success('导入成功!')
					this.getBlList()
				})
			}
			this.relatePopShow = false
		},
		async handleImportSubBl() {
			let res = await getLclNoImportChildList({ orderNo: this.oQuery.orderNo })
			this.relateList = res.data
			this.relatePopShow = true
		},
		lclChildList() {
			lclChildList({ orderNo: this.oQuery.orderNo }).then(res => {
				if (res.data && res.data.length > 0) {
					this.showRelateBtn = true
				}
			})
		},
		async init(data) {
			console.log('🚀 ~ data', data)
			this.selectContainerList = []
			this.createItem = Object.assign({}, defaultCreateQuery)
			let blLclDto = {}
			let cargoMark = ''
			let cargoDesc = ''
			let quantity = 0
			let weight = 0 
			let volume = 0
			let packageType = ''
			this.serviceType = data.serviceType
			// 散货委托订舱的提单
			if (['st03', 'st18', 'st11', 'st12'].includes(data.serviceType)) {
				blLclDto = {
					quantity: data.quantity,
					weight: data.weight,
					volume: data.volume,
					cn: this.cnList && this.cnList.length ? this.cnList[0].cn : '',
					sn: this.cnList && this.cnList.length ? this.cnList[0].sn : ''
				}
			}
			// 获取唛头，货描
			let enameArr=[]
			let commodityDescArr=[]
			data.cargoList &&
				data.cargoList.forEach((item, index) => {
					if (item.mark) {
						cargoMark += index ? '\n' + item.mark : item.mark
					}
					if (item.ename) {
						// cargoDesc += index ? '\n' + item.ename : item.ename
						enameArr.push(item.ename)
					}
					if (item.commodityDesc) {
						commodityDescArr.push(item.commodityDesc)
					}
					// 散杂滚装的计算件数，毛重，体积的总和，带入到提单里
					quantity += item.quantity ? Number(item.quantity) : 0
					weight += item.weight ? Number(item.weight) : 0
					volume += item.volume ? Number(item.volume) : 0
				})
			Object.assign(this.createItem, {
				// blId: undefined,
				// blNo: '',
				// blType: '',
				// parentBlId: data.parentBlId,
				cargoMark,
				cargoDesc:commodityDescArr.length?commodityDescArr.join('\n'):enameArr.join('\n'),
				serviceType: data.serviceType,
				blMode: data.ship.blMode,
				signTime: data.ship.tdTime,
				orderInfo: {
					bargeVessel: data.barge ? data.barge.vessel : '',
					bargeVoyage: data.barge ? data.barge.voyage : '',
					bargePorPortCode: data.barge ? data.barge.porPortCode : '',
					bargePorPortName: '',
					vessel: data.ship.vessel,
					voyage: data.ship.voyage,
					polPortCode: data.ship.polPortCode,
					polPortName: '',
					transitPortCode: data.ship.transitPortCode,
					transitPortName: '',
					podPortCode: data.ship.podPortCode,
					podPortName: '',
					unloadingPortCode: data.ship.unloadingPortCode,
					unloadingPortName: '',
					shipCarrierCode: data.ship.shipCarrierCode,
					siCutOff: data.ship.siCutOff || '',
					deliveryPlace: data.transport ? data.transport.destinationArea : '',
					payMode: data.payMode,
					transportTerm: data.transport ? data.transport.transportTerm : '',
					contractNo: data.ship.contractNo,
					contractCompany: data.ship.contractCompany,
					contractSupplierId: data.ship.contractSupplierId,
					etaTime: data.ship.etaTime,
					tdTime: data.ship.tdTime,
					bargeTdTime: data.barge ? data.barge.tdTime : '',
					receiptPlace: data.ship.receiptPlace
				},
				blContact: {
					// blNo: '',
					consignee: data.transport ? data.transport.consignee : '',
					notify1: data.transport ? data.transport.notify1 : '',
					notify2: data.transport ? data.transport.notify2 : '',
					notify3: data.transport ? data.transport.notify3 : '',
					shipper: data.transport ? data.transport.shipper : '',
					intrustRemark: ''
				},
				blCargos: [],
				blLclDto
			})
			// 散杂滚装的
			if (this.isBulkRo) {
				Object.assign(this.createItem, {
					quantity,
					volume,
					weight,
					packageType: this.setPackageTypes(data.cargoList)
				})
			}
			// // 散货委托订舱的提单只能建HBL
			// if (['st03', 'st18'].includes(data.serviceType)) {
			// 	Object.assign(this.createItem, {
			// 		blType: 'hbl'
			// 	})
			// 	let res = await blCreateSerialNo({ orderNo: this.$route.query.orderNo, jointNo: this.$route.query.jointNo })
			// 	Object.assign(this.createItem, {
			// 		blNo: res.data.serialNo
			// 	})
			// }
			// 反显orderInfo从订单详情带过来的订单信息
			this.fillOrderInfo(this.createItem)
			setTimeout(() => {
				this.initDataObj = JSON.parse(JSON.stringify(this.createItem))
			}, 500)
		},
		// 从订单详情的货品信息获取包装。包装一样的就取一个。不一样的，取个最短的，如果长的都包含短的就取一个长的，否则就是PACKAGES。
		setPackageTypes(cargoList) {
			let result = ''
			let packageTypeArr = cargoList.filter(item => item.packageInfo).map(item => item.packageInfo)
			if (packageTypeArr.length === 0) {
				result = ''
			} else if (new Set(packageTypeArr).size === 1) {	// 包装都一样的
				result = packageTypeArr[0]
			} else {
				let lens = packageTypeArr.map(item => item.length)
				// 数组中元素字符长度最短的
				let minLen = Math.min.apply(null, lens)
				result = packageTypeArr[lens.indexOf(minLen)]
				let longPackageArr = packageTypeArr.filter(item => item !== result)
				// 其他长的都包含短的元素
				if (longPackageArr.every(item => item.includes(result))) {
					result = longPackageArr[0]
				} else {
					result = 'PACKAGES'
				}
				// console.log('packageTypeArr', packageTypeArr)
				// console.log('lens', lens, minLen)
			}
			return result
		},
		// 获取提单列表
		getBlList() {
			blList({ orderNo: this.$route.query.orderNo, jointNo: this.$route.query.jointNo }).then(res => {
				this.blList = res.data || []
				// this.initBlList()
				this.blList.length &&
					this.blList.map(item => {
						if (!item.children || !item.children.length) {
							return Object.assign(item, {
								createBlBtnShow: true,
								canMerge: true
							})
						} else {
							this.getChildData(item.children)
						}
					})
				// console.log('orderInfo', this.detailInfo, this.blList, this.saveId)
				// 有提单打开了详情，刷新了列表数据，详情也要跟着刷新数据
				if (this.saveId && this.showDetail) {
					let row = {}
					this.blList.forEach(item => {
						if (item.blId === this.saveId) {
							row = { ...item }
						}
						if (item.children && item.children.length) {
							let findItem = item.children.find(ele => ele.blId === this.saveId)
							findItem && (row = findItem)
						}
					})
					// console.log('row', row)
					this.handleInfo(row)
				}
			})
		},
		// 散货提单获取箱号
		getCnList() {
			getLclCnAndSn({ orderNo: this.$route.query.orderNo }).then(res => {
				this.cnList = res.data
			})
		},
		// 设置二级提单不能拆单
		getChildData(arrData) {
			if (!arrData || !arrData.length) return
			arrData.forEach(item => {
				Object.assign(item, {
					cannotSplit: true,
					createBlBtnShow: item.blType === 'hbl' ? true : false // 子集hbl也能生成MBL
				})
				item.children && this.getChildData(item.children)
			})
		},
		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
			console.log(this.multipleSelection)
			let findItem = this.multipleSelection.find(item => item.createdBy !== this.userId)
			if (findItem && this.isCsc) {
				this.blListIncludesNotCscCreated = true
			} else {
				this.blListIncludesNotCscCreated = false
			}
		},
		// 全选/全不选
		handleSelectAll(selection) {
			//table第一层只要有在selection里面就是全选
			const isSelect = selection.some(el => {
				const blIds = this.blList.map(j => j.blId)
				return blIds.includes(el.blId)
			})
			//table第一层不在selection里面就是全不选
			const isCancel = !this.blList.every(el => {
				const selectOids = selection.map(j => j.blId)
				return selectOids.includes(el.blId)
			})

			if (isSelect) {
				selection.map(el => {
					if (el.children) {
						el.children.map(j => {
							this.toggleSelection(j, true)
						})
					}
				})
			}

			if (isCancel) {
				this.blList.map(el => {
					if (el.children) {
						el.children.map(j => {
							this.toggleSelection(j, false)
						})
					}
				})
			}
		},
		toggleSelection(row, select) {
			if (row) {
				this.$nextTick(() => {
					this.$refs.blTable && this.$refs.blTable.toggleRowSelection(row, select)
				})
			} else {
				this.$refs.blTable.clearSelection()
			}
		},
		// 获取选中的blId
		getOids() {
			let blIds = []
			this.multipleSelection.map(item => {
				blIds.push(item.blId)
			})
			return blIds
		},
		// 过滤集装箱数据
		filterBlCargos(data, type) {
			return data.map(item => {
				for (let i in this.truckContainerItem) {
					if (type === 'info') {
						this.truckContainerItem[i] = item[i]
						if (i === 'packageType') {
							this.truckContainerItem[i] = item.packageType || item.packageInfo
						}
						if (i === 'itemIsCheck') {
							this.truckContainerItem[i] = item.isCheck === 'Y' ? true : false
						}
					} else {
						if (i === 'oid') {
							this.truckContainerItem[i] = undefined
						} else {
							this.truckContainerItem[i] = item[i]
							if (i === 'containerId') {
								this.truckContainerItem[i] = this.selectContainerList.length == 0 ? item.oid : item.containerId
							}
							if (i === 'packageType') {
								this.truckContainerItem[i] = item.packageType || item.packageInfo
							}
							if (i === 'itemIsCheck') {
								this.truckContainerItem[i] = item.isCheck === 'Y' ? true : false
							}
						}
					}
				}
				return Object.assign({}, this.truckContainerItem)
			})
		},
		// 处理绑定集装箱的数据
		handleBind(value) {
			let blCargos = this.filterBlCargos(value)
			blCargos.map(item => {
				let sItem = this.createItem.blCargos.find(ele => ele.containerId === item.containerId)
				if (!sItem) {
					this.createItem.blCargos.push(item)
				}
			})
		},

		// 处理取消绑定集装箱的数据
		handleCancelBind(rowIndex) {
			this.createItem.blCargos = this.createItem.blCargos.filter((item, index) => {
				return rowIndex != index
			})
		},
		validate(values) {
			console.log('values', values, this.detailInfo.businessType)
			let reg = /^\d+(\.\d+)?$/,
				numberReg = /^[0-9]+$/
			if (values.some(item => !numberReg.test(item.quantity))) {
				this.$message({ type: 'error', message: '请输入正确的件数' })
				return false
			}
			// if (values.some(item => item.quantity < 1)) {
			// 	this.$message({ type: 'error', message: '件数不能小于1' })
			// 	return false
			// }
			// if (values.some(item => !reg.test(item.weight))) {
			// 	this.$message({ type: 'error', message: '请输入正确的毛重' })
			// 	return false
			// }
			// 海运出口整箱的体积要校验
			if (this.detailInfo.businessType === 'ship_export_fcl' && values.some(item => !item.volume)) {
				this.$message({ type: 'error', message: '请输入正确的体积' })
				return false
			}
			if (values.some(item => !item.packageType)) {
				this.$message({ type: 'error', message: '包装不能为空' })
				return false
			}
			return true
		},
		// 取消
		handleCancel() {
			// this.initBlList()
			this.type = ''
			this.showDetail = false
		},
		checkSpeciesStrMethod(item) {
			let check = true
			if (!item) return check
			let reg = /[^\x00-\x7F]+/g
			let result = item.match(reg)
			if (result && result.length) {
				if (result.every(o => this.speciesStrArr.includes(o))) {
					check = true
				} else {
					check = false
				}
			} else {
				check = true
			}
			return check
		},
		// 新增保存
		async handleSave() {
			this.$refs.blSubmit.validate(valid => {
				if (valid) {
					//非台湾 有中文 不能保存
					let noTaiwanArr = [
						this.createItem.blContact.shipper,
						this.createItem.blContact.consignee,
						this.createItem.blContact.notify1,
						this.createItem.blContact.notify2,
						this.createItem.orderInfo.forwardAgent,
						this.createItem.cargoDesc,
						this.createItem.cargoMark
						// this.createItem.remarkPrint
					]
					let arrCheck = [
						{ text: 'Shipper(发货人)', value: this.createItem.blContact.shipper },
						{ text: 'Consignee(收货人)', value: this.createItem.blContact.consignee },
						{ text: 'Notify Party(通知人)', value: this.createItem.blContact.notify1 },
						{ text: 'Also Notify Party', value: this.createItem.blContact.notify2 }
					]
					let taiwanArr = [this.createItem.blContact.shipper, this.createItem.blContact.consignee, this.createItem.blContact.notify1, this.createItem.blContact.notify2, this.createItem.orderInfo.forwardAgent]
					if (this.createItem.orderInfo.podPortName != 'TAICHUNG,TAIWAN') {
						if (noTaiwanArr.some(item => !this.checkSpeciesStrMethod(item))) return this.$message.warning('发货人,收货人,通知人,运输代理人,唛头,货物描述中不能包含中文字符及特殊字符!')
					} else {
						if (taiwanArr.some(item => !this.checkSpeciesStrMethod(item))) return this.$message.warning('发货人,收货人,通知人,运输代理人中不能包含中文字符及特殊字符!')
					}
					if (!canEnter(arrCheck)) return
					// if (!this.validate(this.createItem.blCargos)) return
					// 20211112变更临时删除收发通行数，和最大字符数校验
					// if (!validateContact(this.createItem.blContact, this.validateBlContact)) return
					let data = JSON.parse(JSON.stringify(this.createItem))
					// 散货拼箱不传blCargos
					if (['ship_import_lcl', 'ship_export_lcl'].includes(this.detailInfo.businessType)) {
						delete data.blCargos
					}
					if (data.orderInfo.transitPortCode && data.orderInfo.transitPortCode.length) {
						data.orderInfo.transitPortCode = data.orderInfo.transitPortCode.toString()
					} else {
						data.orderInfo.transitPortCode = ''
					}
					// 截补料时间截取冒号之前的字符, 格式：yyyy-MM-dd HH
					if (data.orderInfo.siCutOff) {
						if (data.orderInfo.siCutOff.indexOf(':') !== -1) {
							data.orderInfo.siCutOff = data.orderInfo.siCutOff.substring(13, 0) + ':00:00'
						} else {
							data.orderInfo.siCutOff = data.orderInfo.siCutOff + ':00:00'
						}
					}

					// console.log('data.orderInfo', data.orderInfo)
					this.blSave({ ...data, blId: this.saveId })
				} else {
					// toViewPosition('service-container', 80)
					console.log('error submit!!')
					return false
				}
			})
		},
		async blSave(data) {
			// console.log('data', data)
			delete data.orderInfo.oid
			delete data.blLclDto.oid
			this.loading = true
			//调接口验证信息是否一致
			let checkRes = await blSaveCheck(
				Object.assign(data, {
					orderNo: this.$route.query.orderNo,
					jointNo: this.$route.query.jointNo
				})
			).catch(err => {})
			// console.log('checkRes', checkRes)
			if (!checkRes) {
				this.loading = false
			} else if (checkRes.code != 0) {
				this.loading = false
				this.$confirm(checkRes.msg, '提示', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				})
					.then(() => {
						// console.log('确定了')
						this.blSaveMethod(data, 'y')
					})
					.catch(() => {
						this.blSaveMethod(data, 'n')
					})
			} else {
				this.blSaveMethod(data)
			}
		},
		blSaveMethod(data, isCover) {
			let obj = {}
			if (isCover) {
				obj = { isCover }
			}
			blSave(
				Object.assign(data, {
					orderNo: this.$route.query.orderNo,
					jointNo: this.$route.query.jointNo,
					...obj
				})
			)
				.then(res => {
					this.loading = false
					this.$message({
						type: 'success',
						message: '保存成功'
					})
					if (this.$route.query.source === 'SiListAddBl') {
						this.$confirm('提单是否要草单确认?', '提示', {
							confirmButtonText: '是',
							cancelButtonText: '否',
							type: 'warning'
						})
							.then(() => {
								this.blDraftConfirm({ orderNo: this.$route.query.orderNo, blId: res.data.blId })
							})
							.catch(() => {
								this.$router.push({
									name: 'SiList'
								})
							})
					} else {
						let { blId } = res.data
						this.saveId = blId
						this.getBlList()
						this.type = ''
						// this.$message({
						// 	type: 'success',
						// 	message: '保存成功'
						// })
					}
				})
				.catch(err => {
					this.loading = false
				})
		},
		// 反显orderInfo的值
		fillOrderInfo(infoData) {
			// 港口数据反显
			if (infoData.orderInfo) {
				infoData.orderInfo.transitPortCode &&
					Object.assign(this.createItem.orderInfo, {
						transitPortCode: infoData.orderInfo.transitPortCode.split(',')
					})

				let { bargePorPortCode, polPortCode, podPortCode, transitPortCode, unloadingPortCode } = infoData.orderInfo
				// let porPortCode = infoData.barge ? infoData.barge.porPortCode : ""
				let portCodeArr = []
				bargePorPortCode ? portCodeArr.push(bargePorPortCode) : ''
				polPortCode ? portCodeArr.push(polPortCode) : ''
				podPortCode ? portCodeArr.push(podPortCode) : ''
				transitPortCode ? portCodeArr.push(transitPortCode) : ''
				unloadingPortCode ? portCodeArr.push(unloadingPortCode) : ''
				this.fillPortCodes = portCodeArr.toString()
				// console.log('fillPortCodes', this.fillPortCodes)
			}
		},
		// 打开输出弹窗
		handleCommand(command) {
			this.exportTypeQuery = this.exportTypeOptions.find(item => item.value === command)
			if (this.multipleSelection.length !== 1) return this.$message({ type: 'error', message: '请选择一条要导出的提单' })
			if (this.showDetail) {
				let obj = this.multipleSelection.find(item => item.blId === this.initDataObj.blId)
				if (obj && this.needShowTip()) {
					this.$confirm('提单还未保存，是否放弃此次编辑？', '警告', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					})
						.then(() => {
							this.exportPopShow = true
						})
						.catch(() => {})
				} else {
					this.exportPopShow = true
				}
			} else {
				console.log(command)
				if(command==='SEAWAYBILL_INDEMNITY' && this.multipleSelection[0].blType === 'hbl'){
					return this.$message.error('请选择M单')
				}
				this.exportPopShow = true
			}
		},
		exportPopClose(action, value) {
			console.log('🚀 ~ action, value', action, value)
			if (action === 'Confirm') {
				this.handleExport(value)
			} else {
				this.exportPopShow = false
			}
		},
		// 输出
		handleExport(value) {
			console.log('value', value)
			let { fileTypeName, fileType, docType, hblType, isSign, param, isChain } = value
			fileType = fileType.replace('_supChain', '') //清除掉fileType末尾的_supChain(供应链)
			let { orderNo } = this.$route.query
			let blNo = this.multipleSelection[0].blNo
			let blId = this.multipleSelection[0].blId
			let data = {
				orderNo,
				blId,
				fileType: fileType.replace('0', ''), //清除掉fileType末尾的0
				docType,
				hblType,
				isChain
			}
			if (fileType === 'mbl_draft') {
				// delete data.hblType
				delete data.isSign
				delete data.isChain
			}
			// 文件类型为盖电放章或是盖章的要传isSign签名字段
			if (['hbl_telex_original', 'hbl_telex_original0', 'usa_sign'].includes(fileType)) {
				data.isSign = isSign
			}
			//如果传值有param 添加param属性
			if (param) {
				data.param = param
			}
			// 文件名称加上订单号，提单号
			fileTypeName += `(${orderNo}${blNo ? '_' + blNo : ''})`
			this.$store
				.dispatch('order/exportBlobFile', {
					uri: '/order/shipping/bl/file/export',
					data
				})
				.then(res => {
					this.exportPopShow = false
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = fileTypeName + '.' + docType.toLowerCase()
					link.click()
				})
		},
		// initBlList() {
		// 	this.blList = this.blList.map(item => {
		// 		if (item.children && item.children.length) {
		// 			item.children.map(ele => {
		// 				return {...ele, isChecked: false}
		// 			})
		// 		}
		// 		return {...item, isChecked: false}
		// 	})
		// },
		// 新增提单
		handleAddBl() {
			if (this.type === 'add') return
			this.type = 'add'
			this.saveId = undefined
			this.showDetail = true
			// this.initBlList()
			this.init(this.detailInfo)
		},
		// 放单撤回
		handlePutCancel() {
			if (!this.multipleSelection.length || this.multipleSelection.length > 1) return this.$message({ type: 'error', message: '请选择一条要撤回的提单!' })
			if (!['seaway_bill', 'telex_release', 'jthdldf', 'bill_at_destination'].includes(this.multipleSelection[0].blMode)) return this.$message({ type: 'error', message: '出单方式为电放,海运单,借同行代理,HBL电放,目的港放单才可以撤回放单!' })
			if (this.multipleSelection[0].putStatus != 'finish') return this.$message({ type: 'error', message: '已放单的提单才可以撤回放单!' })

			this.$confirm('请确认是否已经邮件告知代理?', '提示', {
				confirmButtonText: '是',
				cancelButtonText: '否',
				type: 'warning'
			})
				.then(() => {
					let orderNo = this.multipleSelection[0].orderNo
					let blId = this.multipleSelection[0].blId
					putBlCancel({ orderNo, blId }).then(res => {
						if (res.msg === 'success') {
							this.$message.success('撤回放单成功!')
							this.getBlList()
						}
					})
				})
				.catch(() => {})
		},
		// 提单撤回
		handleBlDeliveryCancel() {
			if (!this.multipleSelection.length) return this.$message({ type: 'error', message: '请选择要撤回的提单' })

			if (this.multipleSelection.some(item => item.isDraftConfirm != 'y')) {
				return this.$message({ type: 'error', message: '有草单未确认，不可以执行撤回操作' })
			}
			this.$confirm('是否确定撤回草单确认？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				return this.handleDeliveryCancel()
			}).catch(() => {
				
			})
			// this.cancelBlIds = this.getOids()
			// this.blDeliveryCancelShow = true
		},
		// 提单撤回
		handleDeliveryCancel() {
			let cancelBlIds = this.getOids()
			let data = cancelBlIds.map(item => {
				return {
					blId: item,
					orderNo: this.$route.query.orderNo,
					jointNo: this.$route.query.jointNo
					// cancelReason: '',
					// cancelRemark: ''
				}
			})
			blDeliveryCancel(data).then(res => {
				this.$message({
					type: 'success',
					message: '提单撤回成功',
					duration: 1000,
					onClose: () => {
						this.getBlList()
					}
				})
			})
		},
		// 提单撤回弹窗关闭回调
		blDeliveryCancelPopClose(action, value) {
			this.blDeliveryCancelShow = false
			if (action === 'Confirm') {
				this.getBlList()
			}
		},
		// 获取单证参与人信息
		getCscEmployee() {
			let data = {
				orderNo: this.$route.query.orderNo,
				sysLineCode: this.detailInfo.ship.sysLineCode,
				shipCarrierCode: this.detailInfo.ship.shipCarrierCode,
				polPortCode: this.detailInfo.ship.polPortCode,
				bkgAgentSupplierId: this.detailInfo.ship.bkgAgentSupplierId
			}
			orderWorkSi(data).then(res => {
				// 在这里获取bkg的职员信息
				this.cscUpdateItem = res.data.find(item => item.jobCode === 'csc' && item.employeeId)
			})
		},
		// 打开草单确认弹窗
		handleBlDraftConfirm(row) {
			confirmCheck({blId:row.blId,orderNo:row.orderNo}).then(res=>{
				this.blId = row.blId
				// 整箱M单并且不是提单草稿的打开确认弹窗
				if ((this.detailInfo.businessType === 'ship_export_fcl') && row.blType === 'mbl' && row.blMode !== 'tdcg') {
					// this.blInfoData = row
					this.blDraftConfirmShow = true
					this.getCscEmployee()
				}
				// H单或是提单草稿的直接确认
				// 拼箱的、散杂滚装的M单直接确认,进口业务整箱拼箱的M单都是直接确认
				if (row.blType === 'hbl' || row.blMode === 'tdcg' || ['ship_export_lcl', 'ship_import_fcl', 'ship_import_lcl', 'ship_bulk_ro'].includes(this.detailInfo.businessType)) {
					let confirmTitle = row.blType === 'hbl' ? 'HBL草单确认' : '草单确认'
					let confirmTxt = row.blType === 'hbl' ? '客户是否已确认HBL草单无问题?' : '客户是否已确认该草单无问题?'
					this.$confirm(confirmTxt, confirmTitle, {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					})
						.then(() => {
							return this.blDraftConfirm(row)
						})
						.catch(() => {})
				}
				})
			
		},
		handleBatchBlDraftConfirm(){
			// 批量草单确认
			if (this.multipleSelection.length === 0) {
				return this.$message.error('请至少选择一条提单！')
			}
			// // 所选的提单 提单类型是否相同
			// let blTypeEqual = this.multipleSelection.every(el=>{
			// 	return el.blType === this.multipleSelection[0].blType
			// })
			// if(!blTypeEqual){
			// 	return this.$message.error('请选择相同提单类型的提单！')
			// }
			let blList = this.multipleSelection.map(item => item.blId)
			this.$confirm('是否确定草单确认？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				return this.blDraftConfirmBatch(this.multipleSelection[0], blList)
			}).catch(() => {})
			
			// if ((this.detailInfo.businessType === 'ship_export_fcl') && this.multipleSelection[0].blType === 'mbl') {
			// 	// 出口整箱 && M单时，出单方式满足的条件：全部是tdcg  或者  全部非 tdcg
			// 	let hasTdcg =this.multipleSelection.find(el=> el.blMode === 'tdcg')
			// 	if(hasTdcg){
			// 		let blModeEqual = this.multipleSelection.every(el=>{
			// 			return el.blMode === 'tdcg'
			// 		})
			// 		if(!blModeEqual){
			// 			return this.$message.error(`海运出口整箱批量草单确认时，选择的提单是M单时，出单方式需要全部是提单'草稿类型'，或者全部都不是'提单草稿'类型`)
			// 		}
			// 	}

			// }
			//  let blList =[]
			//  for(let i=0;i<this.multipleSelection.length;i++){
			// 	blList.push(this.multipleSelection[i].blId)
			//  }
			//  console.log(blList)
			//  blDraftConfirmCheckBatch({blIdList:blList,orderNo:this.multipleSelection[0].orderNo}).then(res=>{
			// 	this.blId = blList
			// 	// 整箱M单并且不是提单草稿的打开确认弹窗
			// 	if ((this.detailInfo.businessType === 'ship_export_fcl') && this.multipleSelection[0].blType === 'mbl' && this.multipleSelection[0].blMode !== 'tdcg') {
			// 		this.blDraftConfirmShow = true
			// 		this.getCscEmployee()
			// 	}
			// 	// H单或是提单草稿的直接确认
			// 	// 拼箱的、散杂滚装的M单直接确认,进口业务整箱拼箱的M单都是直接确认
			// 	if (this.multipleSelection[0].blType === 'hbl' || this.multipleSelection[0].blMode === 'tdcg' || ['ship_export_lcl', 'ship_import_fcl', 'ship_import_lcl', 'ship_bulk_ro'].includes(this.detailInfo.businessType)) {
			// 		let confirmTitle = this.multipleSelection[0].blType === 'hbl' ? 'HBL草单确认' : '草单确认'
			// 		let confirmTxt = this.multipleSelection[0].blType === 'hbl' ? '客户是否已确认HBL草单无问题?' : '客户是否已确认草单无问题?'
			// 		this.$confirm(confirmTxt, confirmTitle, {
			// 			confirmButtonText: '确定',
			// 			cancelButtonText: '取消',
			// 			type: 'warning'
			// 		})
			// 			.then(() => {
			// 				return this.blDraftConfirmBatch(this.multipleSelection[0],blList)
			// 			})
			// 			.catch(() => {})
			// 	}
			// 	})

		},
		// 草单确认
		blDraftConfirmBatch(row, blList) {
			let findItem = this.workAssign.find(item => item.jobCode === 'csc')
			let employeeId = findItem ? findItem.employeeId : ''
			if (this.isBulkRo) {
				employeeId = this.userId
			}
			let params = {
				data: {
					blIdList: blList,
					orderNo: row.orderNo,
					employeeId,
					jointNo: this.$route.query.jointNo
				}
			}
			this.$store
					.dispatch('order/soUpload', {
						uri: '/order/shipping/bl/draft/confirm/file/batch',
						params: params
					})
					.then(res => {
						if (res.data.code === 0) {
							this.$message({
								type: 'success',
								message: '草单确认成功',
								duration: 1000,
								onClose: () => {
									this.getBlList()
								}
							})
						}
					})
					.catch(err => {
						if (this.$route.query.source === 'SiListAddBl') {
							this.$router.push({
								name: 'SiList'
							})
						}
					})
		},
		// 草单确认
		blDraftConfirm(row) {
			let findItem = this.workAssign.find(item => item.jobCode === 'csc')
			let employeeId = findItem ? findItem.employeeId : ''
			if (this.isBulkRo) {
				employeeId = this.userId
			}
			// console.log('workAssign', this.workAssign)
			blDraftConfirm({ blId: row.blId, orderNo: row.orderNo, employeeId })
				.then(res => {
					this.$message({
						type: 'success',
						message: '草单确认成功',
						duration: 1000,
						onClose: () => {
							if (this.$route.query.source === 'SiListAddBl') {
								this.$router.push({
									name: 'SiList'
								})
							} else {
								this.getBlList()
							}
						}
					})
				})
				.catch(err => {
					if (this.$route.query.source === 'SiListAddBl') {
						this.$router.push({
							name: 'SiList'
						})
					}
				})
		},
		// 草单确认弹窗关闭回调
		blDraftConfirmPopClose(action, value) {
			this.blDraftConfirmShow = false
			if (action === 'Confirm') {
				this.getBlList()
			}
		},
		// 拼箱M单补料确认
		handleBlSiConfirm(row) {
			this.$confirm('是否标记为已补料', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return this.blSiConfirm(row)
				})
				.catch(() => {})
		},
		blSiConfirm(row) {
			blSiConfirm({ blId: row.blId, orderNo: row.orderNo }).then(res => {
				this.$message({
					type: 'success',
					message: '标记为已补料成功',
					duration: 1000,
					onClose: () => {
						this.getBlList()
					}
				})
			})
		},
		// MBLCopy件确认
		handleBlCopyConfirm(row) {
			this.$confirm('客户是否已确认MBLcopy件无问题?', 'copy件确认', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return blCopyConfirm({ blId: row.blId, orderNo: this.$route.query.orderNo, jointNo: this.$route.query.jointNo })
				})
				.then(response => {
					this.getBlList()
					this.$message({ message: '确认成功', type: 'success' })
				})
				.catch(() => {})
		},
		// 打开客户同意放货弹窗
		handleBlDeliveryApprove(row) {
			this.blDeliveryApproveShow = true
			this.blId = row.blId
			this.blMode = row.blMode
			this.agreePutQuery = { ...row }
		},
		// 客户同意放货弹窗关闭回调
		blDeliveryApprovePopClose(action, value) {
			this.blDeliveryApproveShow = false
			if (action === 'Confirm') {
				this.getBlList()
			}
		},
		// 查看保险弹窗
		handleViewInsureList(row) {
			this.blInsureListShow = true
			this.insureItemQuery = {
				blId: row.blId,
				blType: row.blType,
				blNo: row.blNo,
				orderStatus: this.detailInfo.orderStatus
			}
		},
		// 查看贸易单证弹窗
		handleViewTradeList(row) {
			this.blTradeListShow = true
			this.tradeItemQuery = {
				blId: row.blId,
				blType: row.blType,
				blNo: row.blNo,
				orderStatus: this.detailInfo.orderStatus
			}
		},
		// 查看附件弹窗
		handleViewFileList(row) {
			this.blFileListShow = true
			this.listItemQuery = {
				blId: row.blId,
				blType: row.blType,
				blNo: row.blNo
			}
		},
		blInsureListPopClose(action, value) {
			this.getBlList()
			this.blInsureListShow = false
		},
		blTradeListPopClose(action, value) {
			this.getBlList()
			this.blTradeListShow = false
		},
		blFileListPopClose(action, value) {
			this.blFileListShow = false
		},
		// 拆单
		handleSeparate() {
			if (this.multipleSelection.length !== 1) {
				return this.$message.error('请勾选一条要拆分的提单！')
			}
			if (this.multipleSelection[0].cannotSplit) {
				return this.$message.error('二级提单不能再拆分')
			}
			this.seprateBlId = this.multipleSelection[0].blId
			this.blSeparateShow = true
		},
		// 并单
		handleMerge() {
			// const canMergeArr = []
			if (this.multipleSelection.length < 2) {
				return this.$message.error('请勾选两条以上要合并的提单')
			} else {
				let result = this.multipleSelection.every(el => {
					return el.canMerge
				})
				if (!result) {
					return this.$message.error('含有子级的提单不能合并')
				}
			}

			this.blIdList = this.multipleSelection.map(el => el.blId)
			this.blMergeShow = true
		},
		// 拆单关闭回调
		blSeparatePopClose(action, value) {
			this.blSeparateShow = false
			if (action === 'Confirm') {
				this.getBlList()
			}
		},
		// 并单关闭回调
		blMergePopClose(action, value) {
			this.blMergeShow = false
			if (action === 'Confirm') {
				this.getBlList()
			}
		},
		// 生成MBL关闭回调
		blCreatePopClose(action, value) {
			this.blCreateShow = false
			if (action === 'Confirm') {
				this.getBlList()
			}
		},
		handleCheckChange(row, cb) {
			// 草单确认 预览等判断是否已编辑未保存
			if (row.blId === this.initDataObj.blId && this.showDetail) {
				if (this.needShowTip()) {
					this.$confirm('提单还未保存，是否放弃此次编辑？', '警告', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					})
						.then(() => {
							this[cb](row)
						})
						.catch(() => {})
				} else {
					this[cb](row)
				}
			} else {
				this[cb](row)
			}
		},
		handleCopy(row) {
			this.$confirm('确认复制并生成一份新的提单？', '提示', {
				confirmButtonText: '是',
				cancelButtonText: '否',
				type: 'warning'
			})
				.then(() => {
					this.handleInfo(row, 'copy')
				})
				.catch(() => {})
		},
		// 详情
		handleInfo(row, type) {
			// console.log('row', row, this.blList);
			// this.blList = this.blList.map(item => {
			// 	item.isChecked = false
			// 	if (item.blId === row.blId) {
			// 		item.isChecked = true
			// 	}
			// 	if (item.children && item.children.length) {
			// 		item.children = item.children.map(ele => {
			// 			ele.isChecked = false
			// 			if (ele.blId === row.blId) {
			// 				ele.isChecked = true
			// 			}
			// 			return {...ele}
			// 		})
			// 	}
			// 	return {...item}
			// })
			this.selectContainerList = []
			let parentBlId = row.parentBlId
			if (parentBlId !== 0 && parentBlId !== null) {
				blDetail({ blId: parentBlId, orderNo: row.orderNo, jointNo: this.$route.query.jointNo }).then(res => {
					let { data } = res
					//设置集装箱弹窗供选择数据
					this.selectContainerList = data.blCargos
				})
			}

			blDetail({ blId: row.blId, orderNo: row.orderNo, jointNo: this.$route.query.jointNo }).then(res => {
				// console.log('detail', res.data);
				let { data } = res
				for (let i in this.createItem) {
					if (i === 'parentBlId') {
						this.createItem[i] = data[i]
					} else {
						this.createItem[i] = data[i] || ''
					}
				}
				this.createItem.blLclDto = data.blLcl ? data.blLcl : {}
				this.createItem.orderInfo = data.orderInfo ? data.orderInfo : {}

				// 过滤返回的集装箱数据
				this.createItem.blCargos = this.filterBlCargos(data.blCargos, 'info')
				// 复制的提单需要清掉oid,blId等
				if (type === 'copy') {
					this.createItem.blId = undefined
					this.createItem.blCargos = this.createItem.blCargos.map(item => {
						delete item.oid
						delete item.blId
						return { ...item }
					})
					delete this.createItem.blContact.blId
					delete this.createItem.blContact.oid
					delete this.createItem.orderInfo.blId
					this.saveId = undefined
					this.createItem.canEdit = 'y'
					this.createItem.placeCompName = ''
					this.createItem.blNo = ''
				} else {
					this.saveId = data.blId
				}
				// 20210823详情无需调港口接口获取数据，直接显示portName值
				this.fillOrderInfo(this.createItem)
				setTimeout(() => {
					this.initDataObj = JSON.parse(JSON.stringify(this.createItem))
				}, 500)
				this.type = 'edit'
				this.showDetail = true
			})
		},
		// 生成HBL号
		handleCreateSerialNo() {
			blCreateSerialNo({ orderNo: this.$route.query.orderNo, jointNo: this.$route.query.jointNo }).then(res => {
				this.blInfoOptions[1].value = res.data.serialNo
			})
		},
		// 提单生成提单
		handleCreateBlFromExist(row) {
			// 生成MBL
			if (row.blType === 'hbl') {
				this.blCreateShow = true
				this.blId = row.blId
			} else {
				// 生成HBL
				blCreateBlFromExist({
					blType: 'hbl',
					existBlId: row.blId,
					orderNo: this.$route.query.orderNo,
					jointNo: this.$route.query.jointNo
				}).then(res => {
					this.$message({
						type: 'success',
						message: '生成HBL成功',
						duration: 1000,
						onClose: () => {
							this.getBlList()
						}
					})
				})
			}
		},
		// 草单预览,传参默认这里写死，默认与输出草单的弹窗内第一个选项一致
		handlePreview(row) {
			let data = {}
			// mbl
			if (row.blType == 'mbl') {
				data = {
					orderNo: this.$route.query.orderNo,
					blId: row.blId,
					fileType: 'mbl_draft',
					docType: 'pdf'
				}
				if (!this.bargeOption) data.hblTypeDisabled = true
				let routeUrl = this.$router.resolve({
					name: 'MblPreview',
					query: data
				})
				window.open(routeUrl.href, '_blank')
			}
			// hbl
			if (row.blType === 'hbl') {
				data = {
					orderNo: this.$route.query.orderNo,
					blId: row.blId,
					fileType: 'hbl_draft',
					docType: 'xls',
					param: {
						asRoleTxt: 'AS AGENT FOR THE CARRIER: LONG SAIL SHIPPING LINE S.A.LIMITED',
						mbl: 'n'
					}
				}
				blFileReview(data).then(res => {
					this.$store.dispatch('order/previewFile', { fileNo: res.data.fileNo, fileName: res.data.name })
				})
			}
			// blFileReview(data).then(res => {
			// 	this.$store.dispatch('order/previewFile', { fileNo: res.data.fileNo, fileName: res.data.name })
			// })
		},
		hblPrintPopClose(action, value) {
			// console.log('🚀 ~ action, value', action, value)
			this.hblPrintPopShow = false
			if (action === 'Confirm') {
				this.handleToPrint(value)
			}
		},
		handleToPrint(value) {
			this.$router.push({
				name: 'HblPrint',
				query: {
					orderNo: value.orderNo,
					blId: value.blId,
					mbl: value.mbl,
					fileType: value.fileType,
					asRoleTxt: value.asRoleTxt
				}
			})
		},
		// 打开打印弹窗
		handlePrint(row) {
			this.$router.push({
				name: 'HblPrint',
				query: {
					orderNo: row.orderNo,
					blId: row.blId
				}
			})
			// 新窗口打开
			// let routeUrl = this.$router.resolve({
			// 	name: 'HblPrint',
			// 	query: {
			// 		orderNo: row.orderNo,
			// 		blId: row.blId
			// 	}
			// })
			// window.open(routeUrl.href, '_blank')

			// this.hblPrintQuery = {
			// 	blId: row.blId,
			// 	orderNo: row.orderNo
			// }
			// this.hblPrintPopShow = true
		},
		// 删除
		handleDelete(row) {
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return blDelete({ blId: row.blId, orderNo: this.$route.query.orderNo, jointNo: this.$route.query.jointNo })
				})
				.then(response => {
					// 删除和打开详情的信息为同一条时，该条信息的详情则不显示
					if (this.createItem.blId === row.blId) {
						this.showDetail = false
						this.type = ''
					}
					this.getBlList()
					this.$message({ message: '删除成功', type: 'success' })
				})
				.catch(() => {})
		},
		// 修改提单状态
		handleUpdateStatus(val) {
			if (!val) return
			if (this.multipleSelection.length === 0) {
				this.blStatus = ''
				return this.$message.error('请勾选一条要更新状态的提单')
			}
			this.$confirm('是否确认修改状态?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let blIds = this.getOids()
					return blUpdateStatus({
						blIds: blIds,
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo,
						status: val
					})
				})
				.then(response => {
					this.$message({
						type: 'success',
						message: '修改提单状态成功',
						duration: 1000,
						onClose: () => {
							this.blStatus = ''
							this.getBlList()
						}
					})
				})
				.catch(err => {
					this.blStatus = ''
				})
		},
		// 修改放单状态
		handlePutFinish(row) {
			this.$confirm('是否确认放单完成?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					// 修改放单状态
					let params = {
						blId: row.blId,
						orderNo: this.$route.query.orderNo
					}
					if (['ship_import_fcl', 'ship_import_lcl'].includes(this.detailInfo.businessType)) {
						return importBlPutFinish(params).then(res => {
							this.$message({
								type: 'success',
								message: '放单完成成功',
								duration: 1000,
								onClose: () => {
									this.getBlList()
								}
							})
						})
					}
					updateInitTelexHblStatus(params).then(res => {
						this.$message({
							type: 'success',
							message: '修改提单状态成功',
							duration: 1000,
							onClose: () => {
								this.getBlList()
							}
						})
					})
				})
				.catch(err => {})
		},
		handlePutSave(row) {
			const defaultCreateQuery = {
				oid: row.oid,
				orderNo: row.orderNo,
				remark: row.remark,
				putStatus: row.putStatus,
				telexApplyStatus: row.telexApplyStatus,
				telexApplyEmployeeId: row.telexApplyEmployeeId,
				telexDownStatus: row.telexDownStatus,
				telexDownEmployeeId: row.telexDownEmployeeId
			}
			let data = Object.assign({}, defaultCreateQuery)
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
			// console.log(data)
			blPutSave(data).then(res => {
				this.$message({
					message: '放单完成成功',
					type: 'success',
					duration: 1000,
					onClose: () => {
						this.getBlList()
					}
				})
			})
		},
		// 邮件弹窗
		handleToMail(row) {
			this.emailPopShow = true
			this.mailItemQuery = {
				blId: row.blId,
				orderNo: row.orderNo,
				jointNo: row.jointNo
			}
		},
		// 邮件发送弹窗关闭回调
		emailPopClose(type, value) {
			// console.log(type, value)
			if (type === 'Confirm') {
				this.handleMail(value)
			} else {
				this.emailPopShow = false
			}
		},
		// 邮件发送
		handleMail(value) {
			let data = Object.assign({}, value, this.mailItemQuery)
			const loading = this.$loading({
				lock: true,
				text: 'Loading',
				spinner: 'el-icon-loading',
				background: 'rgba(0, 0, 0, 0.7)'
			})
			blPutMail(data)
				.then(res => {
					this.$message({
						type: 'success',
						message: '发送成功',
						duration: 1000,
						onClose: () => {
							this.emailPopShow = false
							loading.close()
							this.getBlList()
						}
					})
				})
				.catch(err => {
					console.log(err)
					loading.close()
				})
		},
		editSiStatus(row) {
			this.siStatusEditPopShow = true
			this.siStatusObj = row
		},
		siStatusEditPopClose(action,value) {
       this.siStatusEditPopShow = false
			 if (action === 'Confirm') {
				 this.getOrderInfoData()
				 this.getBlList()
			 }
		},
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
#blCt .edit-container {
	box-shadow: none;
}
#blCt .el-form-item {
	margin-bottom: 4px !important;
}
#blCt .table-com-layout .bl-table .operate-group .el-button--mini {
	&:last-child {
		margin-right: 0px;
	}
}
#blCt .table-com-layout .bl-table .isChecked-row td {
	background: #e7edf7;
}
#blCt .table-com-layout .cell {
	display: block;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	.el-table__expand-icon {
		position: absolute;
		left: -10px;
	}
	.el-table__placeholder {
		width: 0;
	}
	.pass{
		color: #33b18a;
	}
	.init{
		color: #4A4A4A;
	}
	.submit{
		color: #DFA725;
	}
	.processing{
		color: #3E80F5;
	}
	.refuse{
		color: #CD4130;
	}
}
#blCt .table-com-layout .bl-put-status .cell {
	overflow: initial;
}
#blCt .table-com-layout .el-table-column--selection .cell {
	padding-left: 10px;
	padding-right: 10px;
}
#blCt .table-com-layout .cell .blNo {
	cursor: pointer;
	margin-left: 5px;
	color: #1890ff;
}
#blCt .table-com-layout .cell .blNo-class {
	cursor: pointer;
	color: #1890ff;
}
#blCt .table-com-layout .cell .create-bl-btn {
	width: 50px;
	span {
		width: 100%;
	}
}
#blCt .blInfo-between {
	display: flex;
	justify-content: space-between;
	height: 20px;
	line-height: 20px;
	margin-bottom: 4px;
}
#blCt .blInfo-between .ft14 {
	font-weight: bold;
}
#blCt .blInfo-cont {
	margin-top: 0 !important;
	padding: 0 10px 5px;
}
.edit-container .component-cont .row-flex#blInfo {
	margin-top: 10px;
}
#blCt .blInfo-between.isFixed {
	position: fixed;
	background-color: #fff;
	z-index: 999;
	padding: 5px 20px;
	height: 30px;
	box-shadow: 4px 0px 10px 0px #e9e9e9;
	top: 24px;
	// top: 64px;
	right: 0;
}
.bl-flex-class {
	display: flex;
	justify-content: space-between;
}
</style>
