<template>
	<div class="edit-row" id="bl-rail">
		<div class="edit-container so fullWrap">
			<div class="row-tit so">
				<span class="tit">提单信息</span>
				<div class="row-tit-operate">
					<el-dropdown size="small" @visible-change="handleVisible" @command="handleCommand">
						<el-button size="mini" type="default" :disabled="!isBkg&&!isAc&&!isEac" class="mr10"> 输出<i class="el-icon-arrow-down el-icon--right"></i> </el-button>
						<el-dropdown-menu slot="dropdown">
							<el-dropdown-item :command="item.value" v-for="(item, index) in exportTypeOptions" :key="index">{{ item.label }}</el-dropdown-item>
						</el-dropdown-menu>
					</el-dropdown>
					<el-button size="mini" type="default" @click="handleBlDeliveryCancel" :disabled="!isBkg || isView">提单撤回</el-button>
					<el-button size="mini" type="primary" @click="handleAddBl" :disabled="!isBkg || isView">新增提单</el-button>
					<div class="el-button-group">
						<el-button size="mini" type="default" class="ml10" @click="handleSeparate" :disabled="!isBkg || isView">拆单</el-button>
						<el-button size="mini" type="default" class="ml10" @click="handleMerge" :disabled="!isBkg || isView">并单</el-button>
					</div>
				</div>
			</div>
			<div class="row-form mt10 table-com-layout">
				<el-table
					class="bl-table"
					stripe
					ref="blTable"
					style="width: 100%"
					:data="blList"
					default-expand-all
					row-key="blId"
					:tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
					:select-on-indeterminate="true"
					@select-all="handleSelectAll"
					@selection-change="handleSelectionChange"
					:max-height="400"
					:row-class-name="tableRowClassName"
				>
					<el-table-column type="selection" width="30"></el-table-column>
					<el-table-column prop="blNo" label="提单号" align="left" width="220">
						<template slot-scope="scope">
							<i class="icon-tdcg" v-if="scope.row.blMode === 'tdcg'">草</i>
							<i class="icon-hbl" v-if="scope.row.blType">{{ scope.row.blType === 'hbl' ? 'H' : 'M' }}</i>
							<el-button @click="handleInfo(scope.row)" type="text" size="mini"> {{ scope.row.blNo }}</el-button>
						</template>
					</el-table-column>
					<el-table-column prop="status" label="草单确认" align="center" type="">
						<template slot-scope="scope">
							<div>
								<span v-if="scope.row.isDraftConfirm === 'y'">已确认</span>
								<el-button @click="handleCheckChange(scope.row, 'handleBlDraftConfirm')" type="text" size="mini" :disabled="!isBkg || isView" class="underline" v-else> 未确认</el-button>
							</div>
						</template>
					</el-table-column>

					<el-table-column prop="status" label="客户同意放货" align="center" type="" width="100">
						<template slot-scope="scope">
							<div>
								<span v-if="scope.row.isAgreeRelease === 'y'">已同意</span>
								<el-button @click="handleBlDeliveryApprove(scope.row)" type="text" size="mini" :disabled="!isBkg || ['cancel'].includes(createItem.orderStatus)" class="underline" v-else> 未同意</el-button>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="auditStatus" label="财务审核" align="center" type="">
						<template slot-scope="scope">
							{{ scope.row.auditStatus | auditStatusFilter }}
						</template>
					</el-table-column>
					<el-table-column prop="takeStatus" label="取单状态" align="center" type="">
						<template slot-scope="scope">
							<span v-if="scope.row.blType === 'mbl' && scope.row.blMode === 'telex_release'">--</span>
							<span v-else-if="scope.row.takeStatus === 'finish' && !(scope.row.blType === 'mbl' && scope.row.blMode === 'telex_release')">已取单</span>
							<span v-else-if="isBkg && scope.row.isDraftConfirm === 'y' && scope.row.blType === 'mbl' && (scope.row.blMode !== 'telex_release')" @click="handleTake(scope.row)" style="cursor:pointer;color:#1890ff;">未取单</span>
							<span v-else>未取单</span>
						</template>
					</el-table-column>

					<el-table-column prop="putStatus" label="放单状态" align="center" type="">
						<template slot-scope="scope">
							<span v-if="scope.row.blMode === 'tdcg'">--</span>
							<el-button
								v-else-if="scope.row.putStatus != 'finish' && issueWay.includes(scope.row.blMode) && scope.row.isAgreeRelease === 'y'"
								@click="handlePutFinish(scope.row)"
								type="text"
								size="mini"
								:disabled="!isBkg || isView"
								class="underline"
							>
								未放单</el-button
							>
							<span v-else>{{ scope.row.putStatus === 'finish' ? '已放单' : '未放单' }}</span>
						</template>
					</el-table-column>
					<el-table-column prop="blMode" label="出单方式" align="center" type="" width="120">
						<template slot-scope="scope">
							{{ scope.row.blMode | modeFilter }}
						</template></el-table-column
					>
					<el-table-column width="100" prop="file" label="附件" align="center" type="">
						<template slot-scope="scope">
							<div class="operate-group bl-flex-class">
								<el-button @click="handleViewFileList(scope.row)" type="text" size="mini" :disabled="!isBkg" class="underline">查看{{ Number(scope.row.blFileNum) ? `(${scope.row.blFileNum})` : '' }}</el-button>
								<el-button v-if="scope.row.blMode === 'telex_release'" @click="handleBlDeliveryUpload(scope.row)" type="text" size="mini" :disabled="!isBkg || isView" class="underline">上传</el-button>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="file" label="保险" align="center" type="">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleViewInsureList(scope.row)" type="text" size="mini" :disabled="!isBkg || !detailInfo.serviceList.includes('insurance')" class="underline"
									>查看{{ Number(scope.row.insuranceNum) ? `(${scope.row.insuranceNum})` : '' }}</el-button
								>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="file" label="贸易单证" align="center" type="">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleViewTradeList(scope.row)" type="text" size="mini" :disabled="!isBkg || !detailInfo.serviceList.includes('doc')" class="underline"
									>查看{{ Number(scope.row.documentNum) ? `(${scope.row.documentNum})` : '' }}</el-button
								>
							</div>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="180" align="right" fixed="right" type="">
						<template slot-scope="scope">
							<div class="operate-group">
								<!-- <el-button @click="handleCreateBlFromExist(scope.row)" type="text" size="mini" v-if="scope.row.createBlBtnShow && detailInfo.main.businessType === 'rail_export_fcl'" :disabled="!isBkg || isView">
									{{ scope.row.blType === 'hbl' ? '生成MBL' : '生成HBL' }}
								</el-button> -->
								<el-button @click="handleInfo(scope.row)" type="text" size="mini">详情</el-button>
								<el-button @click="handleCheckChange(scope.row, 'handlePreview')" type="text" size="mini" v-if="scope.row.blType === 'mbl'">预览</el-button>
								<el-button @click="handlePrint(scope.row)" type="text" size="mini" v-if="scope.row.blType === 'hbl'">打印</el-button>
								<el-button @click="handleDelete(scope.row)" type="text" size="mini" :disabled="!isBkg || isView">删除</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</div>
		<!-- 详情 -->
		<div class="component-cont" v-if="showDetail" style="margin-top: 0px">
			<!-- <div class="mb10 between h32 border-bt"> -->
			<div class="mb10 between h32 border-bt blInfo-between" id="saveBar">
				<div class="ft14">{{ createItem.blId ? '提单详情' : '新增提单' }}</div>
				<div class="el-button-group">
					<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
					<el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="disableBtn || !isBkg || isView || createItem.isDraftConfirm === 'y'">保存</el-button>
				</div>
			</div>
			<div class="mb10 between h32 border-bt blInfo-between isFixed" :style="styleObject" id="fixedSaveBar" v-if="saveBarFixed">
				<div class="ft14">{{ createItem.blId ? '提单详情' : '新增提单' }}</div>
				<div class="el-button-group">
					<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
					<el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="disableBtn || !isBkg || isView || createItem.isDraftConfirm === 'y'">保存</el-button>
				</div>
			</div>
			<el-form ref="blSubmit" :model="createItem" :rules="rules" class="order-cont-form" size="mini">
				<div class="row-cont margin0">
					<div class="row-cont-tit bl-flex-class">
						<span class="tit">提单信息</span>
						<speciesStrSet />
					</div>
					<BlInfo :createItem="createItem" :fillPortCodes="fillPortCodes" :validateBlContact="validateBlContact" :orderStatus="createItem.orderStatus" ref="blInfo" />
				</div>
				<!-- 集装箱信息 -->
				<BindContainer
					:isDraftConfirm="createItem.isDraftConfirm"
					:containerData="detailInfo.containerList"
					:selectContainerList="selectContainerList"
					:bindContainerList="createItem.blCargos"
					:containerTotal="containerTotal"
					@bind="handleBind"
					@cancelBind="handleCancelBind"
					v-if="detailInfo.main.businessType === 'rail_export_fcl'"
				/>
				<BlLclDto :cnList="cnList" :createItem="createItem" ref="blLclDto" v-if="detailInfo.main.businessType === 'rail_export_lcl'" />
			</el-form>
		</div>
		<!-- 拆单，并单弹窗 -->
		<div v-if="blSeparateShow">
			<BlSeparate @close="blSeparatePopClose" :seprateBlId="seprateBlId" />
		</div>
		<div v-if="blMergeShow">
			<BlMerge @close="blMergePopClose" :blIdList="blIdList" :orderInfo="detailInfo.main" />
		</div>
		<!-- 生成MBL弹窗 -->
		<div v-if="blCreateShow">
			<BlCreate @close="blCreatePopClose" :existBlId="blId" />
		</div>
		<!-- 提单撤回弹窗 -->
		<div v-if="blDeliveryCancelShow">
			<BlDeliveryCancel @close="blDeliveryCancelPopClose" :cancelBlIds="cancelBlIds" />
		</div>
		<!-- 草单确认弹窗 -->
		<div v-if="blDraftConfirmShow">
			<BlDraftConfirm @close="blDraftConfirmPopClose" :blId="blId" :workAssign="workAssign" />
		</div>
		<!-- 客户同意放货弹窗 -->
		<div v-if="blDeliveryApproveShow">
			<BlDeliveryApprove @close="blDeliveryApprovePopClose" :blId="blId" :blMode="blMode" />
		</div>
		<!-- 上传附件 -->
		<div v-if="blDeliveryUploadShow">
			<BlDeliveryUpload @close="blDeliveryUploadPopClose" :blId="blId" :blType="blType" />
		</div>
		<!-- 附件列表 -->
		<div v-if="blFileListShow">
			<BlFileList @close="blFileListPopClose" :param="listItemQuery" />
		</div>
		<!-- 保险列表 -->
		<div v-if="blInsureListShow">
			<BlInsureList @close="blInsureListPopClose" :param="insureItemQuery" />
		</div>
		<!-- 贸易单证列表 -->
		<div v-if="blTradeListShow">
			<BlTradeList @close="blTradeListPopClose" :param="tradeItemQuery" />
		</div>
		<!-- 邮件发送 -->
		<div v-if="emailPopShow">
			<MailSend @close="emailPopClose" />
		</div>
		<!-- 输出HBL,MBL确认件弹窗 -->
		<div v-if="exportPopShow">
			<ExportPop :exportTypeQuery="exportTypeQuery" @close="exportPopClose" :detailInfo="detailInfo.main" />
		</div>
		<!-- 关联提单列表弹窗 -->
		<div v-if="relatePopShow">
			<RelateBlPop :relateList="relateList" @close="relatePopClose" />
		</div>
		<!-- HBL打印文件选项弹窗 -->
		<div v-if="hblPrintPopShow">
			<HblPrintPop :hblPrintQuery="hblPrintQuery" @close="hblPrintPopClose" />
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { orderJointInfo, orderInfo, lclChildList } from '@/api/railway/list'
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
	railBlTakeFinish
} from '@/api/railway/bl'
import FormItem from '@/components/Form/item'
import BindContainer from './bindContainer'
import BlSeparate from './blSeparate'
import BlMerge from './blMerge'
import BlCreate from './blCreate'
import BlInfo from './blInfo'
import BlLclDto from './blLclDto'
import BlContact from './blContact'
import BlDraftConfirm from './blDraftConfirm'
import BlDeliveryCancel from './blDeliveryCancel'
import BlDeliveryApprove from './blDeliveryApprove'
import BlDeliveryUpload from './blDeliveryUpload'
import BlFileList from './blFileList'
// import BlTradeList from './blTradeList'
import BlTradeList from '@/views/order/order/orderList/orderBook/components/blTradeList.vue'
import BlInsureList from '@/views/order/order/orderList/orderBook/components/blInsureList.vue'
import MailSend from '../../putList/components/mailSend'
import ExportPop from './exportPop'
import RelateBlPop from './relateBlPop'
import HblPrintPop from './hblPrintPop'
import speciesStrSet from '@/views/order/order/orderList/orderBook/components/speciesStrSet.vue'
import { validateContact } from '@/utils/validate'
import { canEnter } from '@/views/order/order/js/check.js'

const defaultCreateQuery = {
	blId: undefined,
	orderNo: '',
	blMode: '',
	blNo: '',
	blType: '',
	cargoDesc: '',
	cargoMark: '',
	numCopy: '',
	issueTime: '',
	masterBlNo: '',
	numOriginal: '',
	remark: '',
	remarkPrint: '',
	signAddress: '',
	signEmployeeId: '',
	signEmployeeName: '',
	signTime: '',
	tripartiteTrade: '',
	polPortCode: '',
	polPortName: '',
	podPortCode: '',
	podPortName: '',
	tdTime: '',
	payMode: '',
	transportTerm: '',
	contractCompany: '',
	contractSupplierId: '',
	forwardAgent: '',
	blCargos: [],
	shipper: '',
	consignee: '',
	notify1: '',
	notify2: '',
	blLclDto: {
		cn: '',
		containerType: '',
		quantity: '',
		weight: '',
		volume: ''
	},
	quantity: null,
	weight: null,
	weight: null,
	isDraftConfirm: ''
}
export default {
	filters: {
		auditStatusFilter(auditStatus) {
			let auditStatusOptions = store.state.railway.finAuditStatusOptions
			return auditStatusOptions[auditStatus] || '--'
		},
		modeFilter(blMode) {
			return getDictLabel('blMode', blMode)
		}
	},
	props: {
		saveBarFixed: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			disableBtn: false, //点击保存的时候先禁用按钮
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
			workAssign: [],
			blDeliveryCancelShow: false, // 提单撤回弹窗
			blDeliveryApproveShow: false, // 客户同意放货弹窗
			blDeliveryUploadShow: false, // 上传附件
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
				po: '',
				oid: '',
				containerId: '',
				cn: '',
				sn: '',
				so: '',
				containerType: '',
				packageInfo: '',
				volume: '',
				weight: '',
				quantity: ''
			},
			// 港口反显数据
			fillPolData: {},
			fillPortCodes: '',
			detailInfo: {},
			emailPopShow: false, // 电放邮件弹窗
			mailItemQuery: {},
			exportPopShow: false, // 输出弹窗.
			exportTypeQuery: {},
			exportTypeOptions: [
				{ label: 'HBL确认件', value: 'hbl_confirm' },
				{ label: 'MBL确认件', value: 'mbl_draft' },
				{ label: '电放申请保函', value: 'telex_apply' }
			],
			rules: {},
			cnList: [], // 散货提单的箱号
			issueWay: ['telex_release', 'bill_at_destination', 'ibl', 'seaway_bill', 'jthdldf', 'free_telex_release'], // 该出单方式之一才可以更改放单状态
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
			initDataObj: {}
		}
	},
	async created() {
		this.lclChildList()
		// 获取订单详情
		let { query } = this.$route
		let orderNo = query.orderNo
		this.createItem.orderNo = orderNo

		let res = await orderInfo({ orderNo })
		this.detailInfo = res.data
		this.workAssign = res.data.workAssign
		// 存储客户id，用于发货人选择弹窗列表调用接口获取参数
		let cust = {
			custid: res.data.main.custid,
			custName: res.data.main.custName,
			custIntrustNo: res.data.main.custIntrustNo,
			businessType: res.data.main.businessType,
			serviceType: res.data.main.serviceType
		}
		sessionStorage.setItem('custStr', JSON.stringify(cust))
		this.isView = ['cancel', 'complete'].includes(this.detailInfo.main.orderStatus) ? true : false
		if (this.detailInfo.main.businessType === 'rail_export_lcl') {
			this.exportTypeOptions = [
				{ label: 'HBL确认件', value: 'hbl_confirm' },
				{ label: '电放申请保函', value: 'telex_apply' }
			]
			this.getCnList()
		}

		// bl列表
		this.getBlList()
		//初始化详情带入的数据
		this.init(this.detailInfo)
	},
	mounted() {},

	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.railway.orderNo,
			roles: state => state.user.roles,
			speciesStrArr: state => state.order.speciesStrArr
		}),
		styleObject() {
			// 顶部距离文档
			let offsetTop = document.querySelector('.tabs-container').offsetTop
			// let sideBarWidth = document.querySelector(".sidebar-container").offsetWidth
			// let leftNavWidth = document.querySelector(".columns-menu").offsetWidth
			return this.saveBarFixed
				? {
						left: '10px',
						right: '27px',
						top: offsetTop + 24 + 'px'
						// left: sideBarWidth + leftNavWidth +14 +5 + 'px'
				  }
				: {}
		},
		isBkg() {
			return this.roles.includes('bkg')
		},
		isAc() {
			return this.roles.includes('ac')
		},
		isEac() {
			return this.roles.includes('eac')
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
					total.weight = parseFloat(total.weight.toFixed(10))
					total.volume = parseFloat(total.volume.toFixed(10))
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
		}
	},
	components: {
		FormItem,
		BindContainer,
		BlSeparate,
		BlMerge,
		BlCreate,
		BlInfo,
		BlLclDto,
		BlContact,
		BlDraftConfirm,
		BlDeliveryCancel,
		BlDeliveryApprove,
		BlFileList,
		MailSend,
		ExportPop,
		RelateBlPop,
		HblPrintPop,
		BlInsureList,
		BlTradeList,
		BlDeliveryUpload,
		speciesStrSet
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
			let specialList = ['numCopy']
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
				} else if (!specialList.includes(key) && obj1[key] != obj2[key]) {
					console.log(`字段${key}发生了改变，请提示是否需要提交`, obj1[key], obj2[key])
					return false
				}
			}
			return true
		},
		// 为table的行row设置一个className
		tableRowClassName({ row }) {
			if (row.isChecked) {
				return 'isChecked-row'
			}
			return ''
		},
		handleVisible(val) {
			this.exportTypeOptions = [
				{ label: 'MBL确认件', value: 'mbl_draft' },
				{ label: 'HBL确认件', value: 'hbl_confirm' },
				{ label: '电放申请保函', value: 'telex_apply' }
			]
			// 根据选择的是mbl还是hbl设置输出类型
			if (val === true && this.multipleSelection.length === 1) {
				if (this.multipleSelection[0].blType === 'mbl') {
					this.exportTypeOptions = [
						{ label: 'MBL确认件', value: 'mbl_draft' },
						{ label: '电放申请保函', value: 'telex_apply' }
					]
				} else {
					this.exportTypeOptions = [
						{ label: 'HBL确认件', value: 'hbl_confirm' },
						{ label: '电放申请保函', value: 'telex_apply' }
					]
				}
			}
		},
		handleTake(row) {
			this.$confirm('是否确认修改取单状态?', '修改状态', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					railBlTakeFinish({ blId: row.blId, orderNo: row.orderNo }).then(res => {
						if (res.msg === 'success') {
							this.$message.success('取单状态修改成功!')
							this.getBlList()
						}
					})
				})
				.catch(() => {})
		},
		relatePopClose(action, value) {
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
			this.createItem = Object.assign({}, defaultCreateQuery)
			this.selectContainerList = []

			let blLclDto = {}
			let cargoMark = ''
			let cargoDesc = ''
			this.serviceType = data.main.serviceType
			// 散货委托订仓的提单
			if (data.main.serviceType === 'st08') {
				blLclDto = {
					quantity: data.containerList[0] && data.containerList[0].quantity,
					weight: data.containerList[0] && data.containerList[0].weight,
					volume: data.containerList[0] && data.containerList[0].volume,
					cn: data.containerList[0] && data.containerList[0].cn,
					containerType: data.containerList[0] && data.containerList[0].containerType,
					packageInfo: data.containerList[0] && data.containerList[0].packageInfo
				}
			}
			// 获取唛头，货描
			data.cargoList &&
				data.cargoList.forEach((item, index) => {
					if (item.mark) {
						cargoMark += index ? ',' + item.mark : item.mark
					}
					if (item.commodityDesc) {
						cargoDesc += index ? ',' + item.commodityDesc : item.commodityDesc
					}
				})
			Object.assign(this.createItem, {
				cargoMark,
				cargoDesc,
				serviceType: data.main.serviceType,
				blMode: data.rail.blMode,
				polPortCode: data.rail.polPortCode,
				polPortName: data.rail.polPortName,
				porPortCode: data.rail.porPortCode,
				porPortName: data.rail.porPortName,
				podPortCode: data.rail.podPortCode,
				podPortName: data.rail.podPortName,
				finalPodPortCode: data.rail.finalPodPortCode,
				finalPodPortName: data.rail.finalPodPortName,
				payMode: data.rail.payMode,
				transportTerm: data.transport ? data.transport.transportTerm : '',
				contractCompany: data.rail.contractCompany,
				contractSupplierId: data.rail.contractSupplierId,
				tdTime: data.rail.tdTime,
				vesselVoyage: data.rail.vesselVoyage,
				blCargos: [],
				blLclDto,
				blType: data.rail.blType,
				shipper: data.transport.shipper,
				consignee: data.transport.consignee,
				notify1: data.transport.notify1,
				notify2: data.transport.notify2
			})
			setTimeout(() => {
        this.initDataObj = JSON.parse(JSON.stringify(this.createItem))
			}, 500)
			console.log('🚀 ~ this.createItem', this.createItem)
		},

		// 获取提单列表
		getBlList() {
			blList({ orderNo: this.$route.query.orderNo }).then(res => {
				this.blList = res.data || []
				this.blList = this.blList.map(item => {
					return { ...item, isChecked: false }
				})
				//保存成功后取最后一条数据的blId
				// if (this.blList.length > 0) {
				// 	let blRow = this.blList[this.blList.length - 1]
				// 	this.saveId = blRow.blId
				// }
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
					cannotSplit: true
				})
				item.children && this.getChildData(item.children)
			})
		},
		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
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
						if (i === 'packageInfo') {
							this.truckContainerItem[i] = item.packageType || item.packageInfo
						}
					} else {
						if (i === 'oid') {
							this.truckContainerItem[i] = undefined
						} else {
							this.truckContainerItem[i] = item[i]
							if (i === 'containerId') {
								this.truckContainerItem[i] = this.selectContainerList.length == 0 ? item.oid : item.containerId
							}
							if (i === 'packageInfo') {
								this.truckContainerItem[i] = item.packageType || item.packageInfo
							}
						}
					}
				}
				return Object.assign({}, this.truckContainerItem)
			})
		},
		// 处理绑定集装箱的数据
		handleBind(value) {
			console.log('🚀 ~ value', value)

			// let blCargos = this.filterBlCargos(value)
			let blCargos = value
			blCargos.map(item => {
				let sItem = this.createItem.blCargos.find(ele => ele.oid === item.oid)

				if (!sItem) {
					this.createItem.blCargos.push(item)
				}
			})
		},

		// 处理取消绑定集装箱的数据
		handleCancelBind(containerIdList) {
			this.createItem.blCargos = this.createItem.blCargos.filter((item, index) => {
				return !containerIdList.includes(item.containerId)
			})
		},
		validate(values) {
			let reg = /^\d+(\.\d+)?$/,
				numberReg = /^[0-9]+$/
			if (values.some(item => !numberReg.test(item.quantity))) {
				this.$message({ type: 'error', message: '请输入正确的件数' })
				return false
			}
			if (values.some(item => item.quantity < 1)) {
				this.$message({ type: 'error', message: '件数不能小于1' })
				return false
			}

			if (values.some(item => !item.packageInfo)) {
				this.$message({ type: 'error', message: '包装不能为空' })
				return false
			}
			return true
		},
		// 取消
		handleCancel() {
			this.blList = this.blList.map(item => {
				return { ...item, isChecked: false }
			})
			this.type = ''
			this.showDetail = false
		},
		checkSpeciesStrMethod(item) {
			let check = true
			if(!item) return check
			let reg = /[^\x00-\x7F]+/g
			let result = item.match(reg)
			if(result && result.length) {
        if(this.createItem.blType !== 'mbl' && result.every(o => this.speciesStrArr.includes(o))) {
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
					// 保存的时候触发blur
					;['shipper', 'consignee', 'notify1', 'notify2', 'forwardAgent', 'cargoMark', 'cargoDesc'].map(item => {
						this.$refs.blInfo.handleBlur(item)
					})

					//非台湾 有中文 不能保存
					let noTaiwanArr = [this.createItem.shipper, this.createItem.consignee, this.createItem.notify1, this.createItem.notify2, this.createItem.forwardAgent, this.createItem.cargoDesc, this.createItem.cargoMark]
					let taiwanArr = [this.createItem.shipper, this.createItem.consignee, this.createItem.notify1, this.createItem.notify2, this.createItem.forwardAgent]
					let arrCheck = [
						{ text: 'Shipper(发货人)', value: this.createItem.shipper },
            { text: 'Consignee(收货人)', value: this.createItem.consignee },
            { text: 'Notify Party(通知人)', value: this.createItem.notify1 },
            { text: 'Also Notify Party', value: this.createItem.notify2 },
					]
					if (this.createItem.podPortName != 'TAICHUNG,TAIWAN') {
						if (noTaiwanArr.some(item => !this.checkSpeciesStrMethod(item))) return this.$message.warning('发货人,收货人,通知人,运输代理人,唛头,货物描述中不能包含中文字符及特殊字符!')
					} else {
						if (taiwanArr.some(item => !this.checkSpeciesStrMethod(item))) return this.$message.warning('发货人,收货人,通知人,运输代理人中不能包含中文字符及特殊字符!')
					}
					 if (!canEnter(arrCheck)) return
					if (!this.validate(this.createItem.blCargos)) return
					let containers = JSON.parse(JSON.stringify(this.createItem.blCargos))
					// 保存时处理集装箱参数 如果没有containerId 取oid
					containers = containers.map(item => {
						if (!item.containerId) {
							item.containerId = item.oid
						}
						delete item.oid
						return item
					})
					let containerList = this.createItem.serviceType === 'st08' ? [this.createItem.blLclDto] : containers
					let data = {
						orderNo: this.createItem.orderNo,
						blType: this.createItem.blType,
						blNo: this.createItem.blNo,
						blMode: this.createItem.blMode,
						payMode: this.createItem.payMode,
						numOriginal: this.createItem.numOriginal,
						numCopy: this.createItem.numCopy,
						signEmployeeId: this.createItem.signEmployeeId,
						signEmployeeName: this.createItem.signEmployeeName,
						signTime: this.createItem.signTime,
						signAddress: this.createItem.signAddress,
						shipper: this.createItem.shipper,
						consignee: this.createItem.consignee,
						notify1: this.createItem.notify1,
						notify2: this.createItem.notify2,
						forwardAgent: this.createItem.forwardAgent,
						cargoMark: this.createItem.cargoMark,
						cargoDesc: this.createItem.cargoDesc,
						containerList: containerList
					}
					this.blSave({ ...data, blId: this.saveId })
				} else {
					console.log('error submit!!')
					return false
				}
			})
		},

		async blSave(data) {
			console.log('🚀 ~ data', data)
			this.disableBtn = true
			blSave(
				Object.assign(data, {
					orderNo: this.$route.query.orderNo
				})
			)
				.then(res => {
					this.disableBtn = false
					this.getBlList()
					this.type = ''
					this.handleInfo(res.data.bl)
					this.saveId = res.data.bl.blId
					this.$message({
						type: 'success',
						message: '保存成功'
					})
				})
				.catch(() => {
					this.disableBtn = false
				})
		},
		// 反显orderInfo的值
		fillOrderInfo(infoData) {
			// 港口数据反显
			if (infoData.orderInfo) {
				let { polPortCode, podPortCode } = infoData.orderInfo
				let portCodeArr = []
				polPortCode ? portCodeArr.push(polPortCode) : ''
				podPortCode ? portCodeArr.push(podPortCode) : ''
				this.fillPortCodes = portCodeArr.toString()
			}
		},
		// 打开输出弹窗
		handleCommand(command) {
			this.exportTypeQuery = this.exportTypeOptions.find(item => item.value === command)
			if (this.multipleSelection.length !== 1) return this.$message({ type: 'warning', message: '请选择一条要导出的提单' })
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
			console.log('🚀 ~ value', value)
			if (action === 'Confirm') {
				this.handleExport(value)
			} else {
				this.exportPopShow = false
			}
		},
		// 输出
		handleExport(value) {
			let { fileTypeName } = value
			let { orderNo } = this.$route.query
			let blNo = this.multipleSelection[0].blNo
			let blId = this.multipleSelection[0].blId
			let data = {
				orderNo,
				blId,
				fileType: value.fileType.replace('0', ''), //清除掉fileType末尾的0
				docType: value.docType
			}
			//如果传值有param 添加param属性
			if (value.param) {
				data.param = value.param
				data.param.showContainer = value.showContainer
			}
			// 文件名称加上订单号，提单号
			fileTypeName += `(${orderNo}${blNo ? '_' + blNo : ''})`
			this.$store
				.dispatch('railway/exportBlobFile', {
					uri: '/order/shipping/bl/file/export',
					data
				})
				.then(res => {
					this.exportPopShow = false
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = fileTypeName + '.' + value.docType.toLowerCase()
					link.click()
				})
		},

		// 新增提单
		handleAddBl() {
			if (this.type === 'add') return
			this.type = 'add'
			this.saveId = undefined
			// 新增提单默认mbl
			this.detailInfo.rail.blType = 'mbl'
			this.init(this.detailInfo)
			this.showDetail = true
			this.blList = this.blList.map(item => {
				return { ...item, isChecked: false }
			})
		},
		// 提单撤回
		handleBlDeliveryCancel() {
			if (!this.multipleSelection.length || this.multipleSelection.length > 1) return this.$message({ type: 'error', message: '请选择一条要撤回的提单' })
			if (this.multipleSelection[0].isDraftConfirm === 'n') {
				return this.$message({ type: 'error', message: '草单未确认，无需执行撤回操作' })
			}
			this.cancelBlIds = this.getOids()
			this.blDeliveryCancelShow = true
		},
		// 提单撤回弹窗关闭回调
		blDeliveryCancelPopClose(action, value) {
			this.blDeliveryCancelShow = false
			if (action === 'Confirm') {
				this.getBlList()
				this.createItem.isDraftConfirm = 'n'
			}
		},
		// 打开草单确认弹窗
		handleBlDraftConfirm(row) {
			this.blId = row.blId

			this.$confirm('客户是否已确认草单无问题?', '草单确认', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return this.blDraftConfirm(row)
				})
				.catch(() => {})
		},
		// 草单确认
		blDraftConfirm(row) {
			let findItem = this.workAssign.find(item => item.jobCode === 'csc')
			let employeeId = findItem ? findItem.employeeId : ''
			blDraftConfirm({ blId: row.blId, orderNo: row.orderNo, employeeId }).then(res => {
				this.$message({
					type: 'success',
					message: '草单确认成功',
					duration: 1000,
					onClose: () => {
						this.getBlList()
						this.createItem.isDraftConfirm = 'y'
					}
				})
			})
		},
		// 草单确认弹窗关闭回调
		blDraftConfirmPopClose(action, value) {
			this.blDraftConfirmShow = false
			if (action === 'Confirm') {
				this.getBlList()
			}
		},
		// MBLCopy件确认
		handleBlCopyConfirm(row) {
			this.$confirm('客户是否已确认MBLcopy件无问题?', 'copy件确认', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return blCopyConfirm({ blId: row.blId, orderNo: this.$route.query.orderNo })
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
		},
		// 客户同意放货弹窗关闭回调
		blDeliveryApprovePopClose(action, value) {
			this.blDeliveryApproveShow = false
			if (action === 'Confirm') {
				this.getBlList()
			}
		},
		// 打开上传附件
		handleBlDeliveryUpload(row) {
			this.blDeliveryUploadShow = true
			this.blId = row.blId
			this.blType = row.blType
		},
		// 上传附件关闭回调
		blDeliveryUploadPopClose(action, value) {
			this.blDeliveryUploadShow = false
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
				blNo: row.blNo
			}
		},
		// 查看贸易单证弹窗
		handleViewTradeList(row) {
			this.blTradeListShow = true
			this.tradeItemQuery = {
				blId: row.blId,
				blType: row.blType,
				blNo: row.blNo
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
			this.blInsureListShow = false
			this.getBlList()
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
				return this.$message.warning('请勾选一条要拆分的提单！')
			}
			if (this.multipleSelection[0].cannotSplit) {
				return this.$message.warning('二级提单不能再拆分')
			}
			this.seprateBlId = this.multipleSelection[0].blId
			this.blSeparateShow = true
		},
		// 并单
		handleMerge() {
			if (this.multipleSelection.length < 2) {
				return this.$message.warning('请勾选两条以上要合并的提单')
			} else {
				let result = this.multipleSelection.every(el => {
					return el.canMerge
				})
				if (!result) {
					return this.$message.warning('含有子集的提单不能合并')
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
		// 设置选中行
		setChecked(data, row) {
			data = data.map(item => {
				item.isChecked = false
				if (item.blId === row.blId) {
					item.isChecked = true
				}
				if (item.children && item.children.length > 0) {
					this.setChecked(item.children, row)
				}
				return { ...item }
			})
			return data
		},
		handleCheckChange(row, cb) {
			// 草单确认、预览等判断是否已编辑未保存
			console.log(`当前编辑的row.blId: ${row.blId}， initDataObj.blId: ${this.initDataObj.blId }`)
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
			// 查看详情时 处理选中行
			this.blList = this.setChecked(this.blList, row)

			this.selectContainerList = []
			let parentBlId = row.parentBlId
			if (parentBlId !== 0 && parentBlId !== null) {
				blDetail({ blId: parentBlId, orderNo: row.orderNo }).then(res => {
					let { data } = res
					//设置集装箱弹窗供选择数据
					this.selectContainerList = data.containerList
				})
			}

			blDetail({ blId: row.blId, orderNo: row.orderNo }).then(res => {
				let { data } = res
				if (data.containerList.length > 0 && this.createItem.serviceType === 'st08') {
					this.createItem.blLclDto = {
						quantity: data.containerList[0].quantity,
						weight: data.containerList[0].weight,
						volume: data.containerList[0].volume,
						cn: data.containerList[0].cn,
						containerType: data.containerList[0].containerType,
						packageInfo: data.containerList[0].packageInfo
					}
				} else {
					this.createItem.blLclDto = {}
					// 过滤返回的集装箱数据
					this.createItem.blCargos = this.filterBlCargos(data.containerList, 'info')
				}

				let bl = data.bl ? data.bl : {}
				this.createItem = { ...this.createItem, ...bl }
        setTimeout(() => {
					this.initDataObj = JSON.parse(JSON.stringify(this.createItem))
				}, 500)
				this.type = 'edit'
				this.saveId = data.bl.blId
				this.showDetail = true
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
					orderNo: this.$route.query.orderNo
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
					fileType: 'RAIL_MBL_DRAFT',
					docType: 'pdf'
				}
				let routeUrl = this.$router.resolve({
					name: 'RailMblPreview',
					query: data
				})
				window.open(routeUrl.href, '_blank')
			}
			// if (row.blType == 'mbl') {
			// 	data = {
			// 		orderNo: this.$route.query.orderNo,
			// 		blId: row.blId,
			// 		fileType: 'RAIL_MBL_DRAFT',
			// 		docType: 'pdf'
			// 	}
			// }
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
		},
		hblPrintPopClose(action, value) {
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
				name: 'RailwayHblPrint',
				query: {
					orderNo: row.orderNo,
					blId: row.blId
				}
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
					return blDelete({ blId: row.blId, orderNo: this.$route.query.orderNo })
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
				orderNo: row.orderNo
			}
		},
		// 邮件发送弹窗关闭回调
		emailPopClose(type, value) {
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
		}
	}
}
</script>
<style lang="scss">
@import '../../../less/index.scss';

#bl-rail .table-com-layout .bl-table .isChecked-row td {
	background: #e7edf7;
}

#bl-rail .blInfo-between.isRailFixed {
	position: fixed;
	background-color: #fff;
	z-index: 999;
	padding: 5px 20px;
	height: 30px;
	box-shadow: 4px 0px 10px 0px #e9e9e9;
	top: 35px;
	right: 0;
	align-items: center;
}
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
#bl-rail .el-form-item {
	margin-bottom: 4px !important;
}
.bl-flex-class {
	display: flex;
	justify-content: space-between;
}
</style>
