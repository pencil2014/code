<template>
	<div class="edit-container" id="lclAuditDetail" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<el-alert v-if="isChange" type="warning" :closable="true" class="orange changeStyle book-alert">
			<template slot="title">
				<i class="tag-change">改</i>
				<span class="txt">
					<template v-if="isPricing">
						该船信息已修改,请及时审批
					</template>

					<el-popover placement="top" width="680" trigger="click" class="changeShip" v-model="changeShipVisible">
						<ChangeInfo ref="changeInfo" :hisData="hisData" :newData="newData" />
						<div class="operate-group-popover">
							<el-button type="default" size="mini" class="btn-close-popover" @click="changeShipVisible = false">
								关闭
							</el-button>
						</div>
						<em slot="reference" class="info">修改详情</em>
					</el-popover>
				</span>
				<span @click="auditPass" class="audit-btn">审核通过</span><span @click="handleAuditRefuse" class="audit-btn">审核拒绝</span>
			</template>
		</el-alert>
		<el-form ref="auditForm" :model="createItem">
			<div class="edit-row" id="infoCont">
				<div class="row-tit">
					<span class="small-tit flex1">
						<div class="">
							<span class="bkgStatus item">
								<img class="icon" :src="require('@/assets/icon-file.png')" />
								<span class="bkgNo">工作单号:</span>
								<span class="bkgNo">{{ bookDetailForm.orderNo }}</span>
							</span>
							<span class="bkgStatus">
								<entrustUnitComp :options="bookDetailForm" />
							</span>
							<span class="ml30 bkgStatus">
								<span class="mr5">订舱状态:</span>
								<i :class="bookDetailForm.lcl.whBookStatus"></i>
								<span :class="bookDetailForm.lcl.whBookStatus">{{ bookDetailForm.lcl.whBookStatus | whBookStatusFilter }}</span>
							</span>
						</div>
						<!-- <br> -->
						<!-- 进口显示服务项 -->
						<div class="service-name-cont" v-if="bookDetailForm.businessType === 'ship_import_lcl'">
							<div class="service-type">服务类型: {{ bookDetailForm.serviceType | serviceTypeFilter }}</div>
							<div class="name">
								<el-tooltip :content="serviceNameStr" placement="bottom" :visible-arrow="false" effect="dark">
									<span>服务项: {{ serviceNameStr }}</span>
								</el-tooltip>
							</div>
						</div>
					</span>
					<div class="row-tit-operate">
						<el-button type="primary" size="mini" @click="saveFunc('save')" v-if="['submit'].includes(bookDetailForm.orderStatus)" :disabled="disabledState">保存</el-button>
						<el-button @click="saveFunc('pass')" type="success" size="mini" v-if="['submit'].includes(bookDetailForm.orderStatus)" class="ml10" :disabled="disabledState || isJointAuditEmployee">通过</el-button>
						<el-button type="danger" size="mini" @click="handleRefuse" v-if="['submit'].includes(bookDetailForm.orderStatus)" class="ml10" :disabled="disabledState || isJointAuditEmployee">拒绝</el-button>
						<el-button type="default" size="mini" @click="handleGoBack" class="ml10">返回</el-button>
					</div>
				</div>
			</div>
			<div class="separate-line"></div>
			<div class="order-cont book-cont" id="bookCont">
				<div class="ship-cont left-cont" :class="workAssignShow ? 'abs-toogle' : ''" :style="{ height: `${bookInfoHeight}px` }">
					<div style="top:50%;" class="toggleWorkAssign" @click="toggleWorkAssign">
						<i class="hamburger el-icon-arrow-left" :class="{ 'is-active': workAssignShow }"></i>
					</div>
					<!-- 审核信息 -->
					<!-- 海运进口拼箱-客户自订 -->
					<div v-if="bookDetailForm.serviceType === 'st12'" class="edit-row">
						<div class="edit-container">
							<div class="row-tit">
								<span class="small-tit">审核信息</span>
							</div>
							<div class="row-form">
								<el-row>
									<!-- <el-col :span="6" v-if="createItem.whBookType !== 'op'">
										<el-form-item required label="操作" prop="opEmployeeId" :show-message="false">
											<el-select
												size="mini"
												v-model="createItem.opEmployeeId"
												filterable
												remote
												clearable
												:disabled="disabledState"
												style="width: 100%"
												placeholder="请输入"
												:remote-method="
													val => {
														val && opEmployeeFilterMehod(val)
													}
												"
												@visible-change="
													val => {
														val && opEmployeeVisibleChange(val)
													}
												"
												@change="handleChangeOpEmployee"
											>
												<el-option v-for="item in opEmployeeOptions" :key="item.value" :label="item.label" :value="item.value">
													{{ item.cname }}<em v-if="item.deptCode" style="color: #999;font-style: normal">({{ item.deptCname }})</em>
												</el-option>
											</el-select>
										</el-form-item>
									</el-col> -->
									<!-- 20220721进口单审核不需报关行，车队 -->
									<!-- <el-col :span="6">
										<el-form-item :required="isDeclarationRequired && isCusTruckRequired" label="报关行" prop="transport.customsSupplierId" :show-message="false" label-width="70px">
											<el-select
												key="customsSupplierId"
												size="mini"
												v-model="createItem.transport.customsSupplierId"
												filterable
												remote
												clearable
												:disabled="disabledState"
												style="width: 100%"
												placeholder="请输入"
												:remote-method="
													val => {
														val && declarationRemoteMethod(val)
													}
												"
												@visible-change="
													val => {
														val && declarationVisibleChange('')
													}
												"
												@change="handleChangeDeclaration"
											>
												<el-option v-for="item in declarationSupplierList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
											</el-select>
										</el-form-item>
									</el-col>
									<el-col :span="6">
										<el-form-item :required="isTruckRequired && isCusTruckRequired" label="车队" prop="transport.truckSupplierId" :show-message="false" label-width="70px">
											<el-select
												key="truckSupplierId"
												size="mini"
												v-model="createItem.transport.truckSupplierId"
												filterable
												remote
												clearable
												:disabled="disabledState"
												style="width: 100%"
												placeholder="请输入"
												:remote-method="
													val => {
														val && truckRemoteMethod(val)
													}
												"
												@visible-change="
													val => {
														val && truckVisibleChange('')
													}
												"
												@change="handleChangeTruck"
											>
												<el-option v-for="item in truckSupplierList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
											</el-select>
										</el-form-item>
									</el-col> -->
									<el-col :span="6">
										<el-form-item label="协助审核人" prop="auditEmployeeId" :show-message="false" label-width="70px">
											<el-select
												key="auditEmployeeId"
												size="mini"
												v-model="createItem.auditEmployeeId"
												filterable
												remote
												clearable
												:disabled="disabledState || createItem.auditEmployeeId === userId"
												:style="{ width: disabledAuditEmployeeId ? 'calc(100% - 46px)' : '100%' }"
												placeholder="请输入"
												:remote-method="auditEmployeeRemoteMethod"
												@visible-change="auditEmployeeVisibleChange"
												@change="handleChangeAuditEmployee"
											>
												<el-option v-for="item in auditEmployeeList" :key="item.value" :label="item.label" :value="item.value" :disabled="item.value === userId">
													{{ item.cname }}<em v-if="item.deptCode" style="color: #999;font-style: normal">({{ item.deptCname }})</em>
												</el-option>
											</el-select>
											<el-button @click="cancelJoint" v-if="disabledAuditEmployeeId" size="mini" :disabled="createItem.auditEmployeeId === userId || ['pass'].includes(bookDetailForm.orderStatus)">撤回</el-button>
										</el-form-item>
									</el-col>
								</el-row>
								<el-row>
									<el-form-item label="审单备注" prop="auditRemark" :show-message="false" label-width="70px">
										<el-input type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" clearable size="mini" placeholder="请输入" v-model="createItem.auditRemark" :disabled="disabledState"></el-input>
									</el-form-item>
								</el-row>
							</div>
						</div>
					</div>
					<div v-else class="edit-row">
						<div class="edit-container">
							<div class="row-tit">
								<span class="small-tit">审核信息</span>
							</div>
							<div class="row-form">
								<!-- 海运进口拼箱-的订舱类型 -->
								<el-row v-if="bookDetailForm.serviceType === 'st11'">
									<el-form-item label="订舱类型" label-width="70px">
										<el-radio-group disabled v-model="createItem.whBookType" size="mini">
											<el-radio :label="item.value" v-for="(item, index) in importBookTypeOptions" :key="'whBookType' + index">
												{{ item.label }}
											</el-radio>
										</el-radio-group>
									</el-form-item>
								</el-row>
								<!-- 出口拼箱的订舱类型 -->
								<el-row v-else>
									<el-form-item label="订舱类型" label-width="70px">
										<el-radio-group v-model="createItem.whBookType" size="mini" @change="handleChangeWhBookType">
											<el-radio :disabled="disabledState" :label="item.value" v-for="(item, index) in whBookTypeOptions" :key="'whBookType' + index">
												{{ item.label }}
											</el-radio>
										</el-radio-group>
									</el-form-item>
								</el-row>

								<el-row>
									<el-col :span="6" v-if="bookDetailForm.serviceType === 'st11'">
										<el-form-item label="协助审核人" prop="auditEmployeeId" :show-message="false" label-width="70px">
											<el-select
												key="auditEmployeeId"
												size="mini"
												v-model="createItem.auditEmployeeId"
												filterable
												remote
												clearable
												:disabled="disabledState || createItem.auditEmployeeId === userId"
												:style="{ width: disabledAuditEmployeeId ? 'calc(100% - 46px)' : '100%' }"
												placeholder="请输入"
												:remote-method="auditEmployeeRemoteMethod"
												@visible-change="auditEmployeeVisibleChange"
												@change="handleChangeAuditEmployee"
											>
												<el-option v-for="item in auditEmployeeList" :key="item.value" :label="item.label" :value="item.value" :disabled="item.value === userId">
													{{ item.cname }}<em v-if="item.deptCode" style="color: #999;font-style: normal">({{ item.deptCname }})</em>
												</el-option>
											</el-select>
											<el-button @click="cancelJoint" v-if="disabledAuditEmployeeId" size="mini" :disabled="createItem.auditEmployeeId === userId">撤回</el-button>
										</el-form-item>
									</el-col>
									<el-col :span="6">
										<el-form-item :required="bookDetailForm.serviceType != 'st03' && (!createItem.auditEmployeeId || createItem.auditEmployeeId === userId)" label="订舱代理" prop="whAgentSupplierId" :show-message="false" label-width="70px">
											<el-select
												size="mini"
												v-model="createItem.whAgentSupplierId"
												filterable
												remote
												clearable
												:disabled="disabledState"
												style="width: 100%"
												placeholder="请输入"
												:remote-method="
													val => {
														val && whAgentFilterMehod(val)
													}
												"
												@visible-change="
													val => {
														val && whAgentVisibleChange(val)
													}
												"
												@change="handleChangeWhAgent"
											>
												<el-option v-for="item in whAgentSupplierList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
											</el-select>
										</el-form-item>
									</el-col>
									<!-- <el-col :span="6">
										<el-form-item v-if="createItem.whBookType === 'lcl'" label-width="100px" label="是否生成协同" prop="isGenerateJoint" :show-message="false">
											<el-select size="mini" v-model="createItem.isGenerateJoint" style="width: 100%" placeholder="请选择">
												<el-option
													v-for="item in [
														{ label: '是', value: 'y' },
														{ label: '否', value: 'n' }
													]"
													:key="item.value"
													:label="item.label"
													:value="item.value"
												>
												</el-option>
											</el-select>
										</el-form-item>
									</el-col> -->
									<!-- <el-col :span="6" v-if="createItem.whBookType !== 'op'">
										<el-form-item required :label="opLabel" prop="opEmployeeId" :show-message="false">
											<el-select
												size="mini"
												v-model="createItem.opEmployeeId"
												filterable
												remote
												clearable
												:disabled="disabledState"
												style="width: 100%"
												placeholder="请输入"
												:remote-method="
													val => {
														val && opEmployeeFilterMehod(val)
													}
												"
												@visible-change="
													val => {
														val && opEmployeeVisibleChange(val)
													}
												"
												@change="handleChangeOpEmployee"
											>
												<el-option v-for="item in opEmployeeOptions" :key="item.value" :label="item.label" :value="item.value">
													{{ item.cname }}<em v-if="item.deptCode" style="color: #999;font-style: normal">({{ item.deptCname }})</em>
												</el-option>
											</el-select>
										</el-form-item>
									</el-col> -->
									<!-- 20220721进口单审核不需报关行，车队 -->
									<!-- <el-col :span="6" v-if="bookDetailForm.serviceType === 'st11'">
										<el-form-item :required="isDeclarationRequired && isCusTruckRequired" label="报关行" prop="transport.customsSupplierId" :show-message="false" label-width="70px">
											<el-select
												key="customsSupplierId"
												size="mini"
												v-model="createItem.transport.customsSupplierId"
												filterable
												remote
												clearable
												:disabled="disabledState"
												style="width: 100%"
												placeholder="请输入"
												:remote-method="
													val => {
														val && declarationRemoteMethod(val)
													}
												"
												@visible-change="
													val => {
														val && declarationVisibleChange('')
													}
												"
												@change="handleChangeDeclaration"
											>
												<el-option v-for="item in declarationSupplierList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
											</el-select>
										</el-form-item>
									</el-col>
									<el-col :span="6" v-if="bookDetailForm.serviceType === 'st11'">
										<el-form-item :required="isTruckRequired && isCusTruckRequired" label="车队" prop="transport.truckSupplierId" :show-message="false" label-width="70px">
											<el-select
												key="truckSupplierId"
												size="mini"
												v-model="createItem.transport.truckSupplierId"
												filterable
												remote
												clearable
												:disabled="disabledState"
												style="width: 100%"
												placeholder="请输入"
												:remote-method="
													val => {
														val && truckRemoteMethod(val)
													}
												"
												@visible-change="
													val => {
														val && truckVisibleChange('')
													}
												"
												@change="handleChangeTruck"
											>
												<el-option v-for="item in truckSupplierList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
											</el-select>
										</el-form-item>
									</el-col> -->
								</el-row>
								<el-row>
									<el-form-item label="审单备注" prop="auditRemark" :show-message="false" label-width="70px">
										<el-input type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" clearable size="mini" placeholder="请输入" v-model="createItem.auditRemark" :disabled="disabledState"></el-input>
									</el-form-item>
								</el-row>
							</div>
						</div>
					</div>
					<div class="separate-line"></div>
					<!-- 订单信息  -->
					<div class="edit-row">
						<!-- <el-collapse v-model="activeNames">
							<el-collapse-item title="订单信息" name="1"> -->
						<!-- 订单基本信息 -->
						<!-- <div>
									<div v-if="bookBaseInfo.info.length > 0">
										<BookInfoView :infoConfig="bookBaseInfo" />
									</div>
								</div> -->
						<h1 class="order-base-info">基本信息</h1>
						<BookInfo ref="BookInfo" 
							:createItem="createItem" 
							@change="handleChangeIncludeFeeder" 
							:includeFeeder="includeFeeder" 
							:bookDetailForm="bookDetailForm" 
							:fillPortCodes="fillPortCodes" 
							:orderStatus="bookDetailForm.orderStatus" 
							@getCountryCode="getCountryCode" 
							@getWorkAssign="getOrderWorkAssign" />
						<!-- 货物信息 -->
						<div class="lcl-row-cont" style="margin-top: 0px">
							<div class="lcl-row-cont-tit">
								<span class="tit">货物信息</span>
							</div>
							<!-- 出口 -->
							<Cargo :createItem="createItem" :orderStatus="bookDetailForm.orderStatus" :countryCode="countryCode" ref="cargo" v-if="bookDetailForm.businessType === 'ship_export_lcl'" />
							<!-- 进口 -->
							<ImportCargo :createItem="createItem" :orderStatus="bookDetailForm.orderStatus" :countryCode="countryCode" ref="cargo" v-if="bookDetailForm.businessType === 'ship_import_lcl'" />
						</div>
						<!-- 物流信息 -->
						<div class="lcl-row-cont" style="margin-top: 8px;">
							<div class="lcl-row-cont-tit">
								<span class="tit">物流信息</span>
							</div>
							<TransportInfo v-if="['ship_export_lcl', 'ship_import_lcl'].includes(bookDetailForm.businessType)" :createItem="createItem" :orderStatus="bookDetailForm.orderStatus" ref="transport" />
						</div>
						<!-- 货物信息 -->
						<!-- <div v-if="goodsInfo.info.length > 0">
									<BookInfoView :infoConfig="goodsInfo" :serviceType="bookDetailForm.serviceType" />
								</div> -->
						<!-- </el-collapse-item>
						</el-collapse> -->
					</div>
				</div>
				<!-- 参与人 -->
				<div class="right-cont" v-if="workAssignShow && $route.query.orderNo" :style="{ height: `${bookInfoHeight}px` }">
					<div class="tit">参与人</div>
					<Worker
						ref="worker"
						:orderIsJoint="orderIsJoint"
						:jointOrderWorkOptions="jointOrderWorkOptions"
						:orderWorkOptions="orderWorkOptions"
						:obdDeptCode="obdDeptCode"
						:createItem="bookDetailForm"
						:workAssignHeight="workAssignHeight"
						@init="getOrderWorkAssign"
						@changePricing="handleChangePricing"
						@changeEmployeeId="changeEmployeeId"
					/>
				</div>
			</div>
		</el-form>
		<!-- 拒绝弹窗 -->
		<div v-if="refusePopShow">
			<RefuseDialog :params="bookDetailForm" @close="refusePopClose" />
		</div>
		<!-- 审核拒绝 -->
		<div v-if="auditRefusePopShow">
			<AuditRefuseDialog :params="bookDetailForm" @close="auditRefusePopClose" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { baseDeptParticipants, baseSystemLineInfo, cargoTypeList } from '@/api/base'
import { lclInfo, lclAuditPass, lclChangePass, orderInfo, lclAuditJointCancel, orderWorkList, workAssignChange, orderCustInfo } from '@/api/order/list'
import { supplierList, customerInfo } from '@/api/crm/supplier.js'
import BookInfoView from './components/bookInfoView'
import FormItem from '@/components/Form/elFormItem'
import { handleData } from '@/views/order/order/js/handleData'
import RefuseDialog from './components/refuseDialog'
import AuditRefuseDialog from './components/auditRefuseDialog'
import Worker from './components/pricingWorker'
import BookInfo from './components/bookInfo'
import Cargo from '../components/cargo'
import ImportCargo from '../../lclImport/components/cargo'
import TransportInfo from '../../components/transportInfo'
import { copyArry, getDictLabel, getDictMap } from '@/utils/tools'
import { toViewPosition } from '@/utils/scroll-to.js'
import ChangeInfo from './components/changeInfo'

const defaultCreateQuery = {
	// isGenerateJoint: 'y',
	submitType: 'save',
	orderNo: '',
	opEmployeeId: '',
	opEmployeeName: '',
	whAgentSupplierId: '',
	whAgentSupplierName: '',
	whBookType: '',
	auditRemark: '',
	auditEmployeeId: '',
	auditEmployeeName: '',
	transport: {
		shipper: '', // 发货人
		consignee: '', // 收货人
		notify1: '', // 通知人1
		notify2: '', // 通知人2
		notify3: '' // 通知人3
	},
	ship: {},
	barge:{},
	cargoList: {},
	bizDate: '',
	payMode: '',
	serviceList: []
}
export default {
	filters: {
		whBookStatusFilter(whBookStatus) {
			return getDictLabel('whBookStatus', whBookStatus)
		},
		serviceTypeFilter(serviceType) {
			return getDictLabel('shipServiceType', serviceType)
		}
	},
	mixins: [routerMixin],
	data() {
		return {
			includeFeeder: '',
			hisData: {},
			newData: {},
			changeShipVisible: false,
			bookDetailForm: {
				lcl: {
					whBookStatus: ''
				},
				cargoList: [],
				ship: {},
				transport: {},
				changeInfo: {}
			},
			activeNames: '1',
			bkgRefuseBtnShow: false,
			// whBookTypeOptions: store.state.dict.dictMap.whBookType.filter(item => item.value != 'proxy'),
			reasonList: store.state.dict.dictMap.bkgProcessingReason, // 订单处理中原因
			// 订单基本信息
			bookBaseInfo: {
				title: '订单基本信息',
				showTitle: false,
				type: 'base',
				info: []
			},
			baseformInfo: [],
			// 货物信息
			goodsInfo: {
				title: '货物信息',
				type: 'goods',
				transport: {},
				info: []
			},
			commodityTypeCodeOptions: [],
			createItem: Object.assign({}, defaultCreateQuery),
			// 拒绝弹窗
			refusePopShow: false,
			// 下拉人员选项
			opEmployeeOptions: [],
			whAgentSupplierList: [], // 订舱代理
			auditPop: [
				{ label: '通过', visible: false, value: 'accept' },
				{ label: '拒绝', visible: false, value: 'refuse' }
			],
			// 拒绝弹窗
			auditRefusePopShow: false,
			cTimestamp: 0,
			disabledAuditEmployeeId: false,
			auditEmployeeList: [],
			orderIsJoint: '', // 商务审核订单参与人接口，订单是否协同
			jointOrderWorkOptions: [],
			obdDeptCode: '', // obd部门code
			orderWorkOptions: [],
			workAssignHeight: 0, // 参与人高度
			bookInfoHeight: 0,
			workAssignShow: true, // 参与人
			serviceNameStr: '',
			isDeclarationRequired: false,
			isTruckRequired: false,
			declarationSupplierList: [],
			truckSupplierList: [],
			isJointAuditEmployee: false, // 切换协助审核人状态
			fillPortCodes: '',
			countryCode: '',
			importJointBkg: '',	// 进口拼箱-委托订舱的初始协同bkg参与人
			workAssignTipObj: store.state.order.orderList.workAssignObj,
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
		window.addEventListener('resize', this.getBookInfoHeight)
		this.$nextTick(() => {
			this.getBookInfoHeight()
		})
	},
	destroyed() {
		window.removeEventListener('resize', this.getBookInfoHeight)
	},
	watch: {
		handler: {
			isChange() {
				this.getBookInfoHeight()
			}
		}
	},
	computed: {
		...mapState({
			userId: state => state.user.userId,
			userInfo: state => state.user.userInfo,
			order: state => state.order,
			dictMap: state => state.dict.dictMap,
			workAssignObj: state => state.order.orderList.workAssignObj,
		}),
		isChange() {
			if (!this.bookDetailForm.changeInfo) return false
			return this.bookDetailForm.changeInfo.changeStatus === 'SUBMIT'
		},

		whBookTypeOptions() {
			let option = null
			console.log('this.dictMap.whBookType', this.dictMap.whBookType)
			// 垮境电商，跨境电商海外仓显示云帆自拼、外运订舱、操作订舱
			if (['st18', 'st19'].includes(this.bookDetailForm.serviceType)) {
				option = this.dictMap.whBookType.filter(item => item.value != 'proxy')
			} else {
				// 其他显示外运订舱、操作订舱再加一个外运订舱-协
				option = this.dictMap.whBookType.filter(item => !['proxy', 'yf'].includes(item.value))
			}
			// // 排序：外运订舱排后面跟外运订舱-协排一起
			option = option.filter(item => !['lcl', 'lcl_x'].includes(item.value))
			option.push({ label: '外运订舱', value: 'lcl' }, { label: '外运订舱-协', value: 'lcl_x' })
			return option
		},
		opLabel() {
			let text = '散货操作'
			if (this.bookDetailForm.serviceType === 'st11') {
				text = '操作'
			}
			if (this.createItem.whBookType === 'yf') {
				text = '云帆操作'
			}
			return text
		},
		importBookTypeOptions() {
			return [{ label: '代理订舱', value: 'proxy', en: 'proxy' }]
		},
		isPricing() {
			return this.$store.state.user.roles.includes('pricing')
		},
		disabledState() {
			// 审核通过的、订舱拒绝给业务的不可编辑
			let { auditEmployeeId, orgAuditEmployeeId } = this.bookDetailForm.lcl
			if (['pass'].includes(this.bookDetailForm.orderStatus)) {
				return true
			}
			// 有协助审核人并且原审核人是登录用户的不可编辑
			if (auditEmployeeId && orgAuditEmployeeId && auditEmployeeId !== orgAuditEmployeeId && orgAuditEmployeeId === this.userId) {
				return true
			}
			return false
		},
		// 报关行，车队必填
		isCusTruckRequired() {
			if (!this.createItem.auditEmployeeId || this.createItem.auditEmployeeId === this.userId) {
				return true
			}
			return false
		}
	},
	components: {
		BookInfo,
		BookInfoView,
		FormItem,
		RefuseDialog,
		AuditRefuseDialog,
		Worker,
		Cargo,
		ImportCargo,
		TransportInfo,
		ChangeInfo
	},
	methods: {
		// 切换是否包含驳船费
		handleChangeIncludeFeeder(val) {
			this.includeFeeder = val
			if (val === 'y') {
				if (this.createItem.barge === null) {
					Object.assign(this.createItem, { barge: this.order.orderList.createItem.barge })
				}
			}
		},
		auditPass() {
			console.log('🚀 ~ auditPass')
			this.$confirm('是否确定要审核通过?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					lclChangePass({ changeStatus: 'PASS', orderNo: this.$route.query.orderNo }).then(() => {
						this.$message.success('改港审核通过')
						this.getLclInfo()
					})
				})
				.catch(() => {})
		},

		// 获取港口countryCode
		getCountryCode(val) {
			this.countryCode = val
		},
		// 切换pricing人员
		handleChangePricing(param) {
			// console.log('pricingChange', param)
			workAssignChange({
				orderNo: this.$route.query.orderNo,
				jobCode: param.jobCode,
				employeeId: param.employeeId
			})
				.then(res => {
					this.$message({
						type: 'success',
						message: '修改商务人员成功',
						duration: 1000,
						onClose: () => {
							window.close()
						}
					})
				})
				.catch(err => {
					this.getOrderWorkAssign()
				})
		},
		// 报关行
		declarationRemoteMethod(val) {
			this.getCustomsList(val, 'category', 'declaration')
		},
		declarationVisibleChange(val) {
			!this.createItem.transport.customsSupplierId && this.getCustomsList(val, 'category', 'declaration')
		},
		// 车队
		truckRemoteMethod(val) {
			this.getCustomsList(val, 'serviceCode', 'truck')
		},
		truckVisibleChange(val) {
			!this.createItem.transport.truckSupplierId && this.getCustomsList(val, 'serviceCode', 'truck')
		},
		handleChangeTruck(val) {
			if (val) {
				let findItem = this.truckSupplierList.find(item => item.value === val)
				this.createItem.transport.truckSupplierName = findItem ? findItem.label : ''
			} else {
				this.createItem.transport.truckSupplierId = null
				this.createItem.transport.truckSupplierName = ''
			}
		},
		handleChangeDeclaration(val) {
			if (val) {
				let findItem = this.declarationSupplierList.find(item => item.value === val)
				this.createItem.transport.customsSupplierName = findItem ? findItem.label : ''
			} else {
				this.createItem.transport.customsSupplierId = null
				this.createItem.transport.customsSupplierName = ''
			}
		},
		// 供应商信息模糊查询
		getCustomsList(queryString, category, type) {
			this.$store.dispatch('dict/querySupplierList', { category: category, value: type, queryString: queryString }).then(data => {
				let list =
					(data.list &&
						data.list.map(ele => {
							return Object.assign(ele, {
								label: this.$language == 'en' ? ele.ename : ele.name,
								value: ele.supplierId ? Number(ele.supplierId) : ''
							})
						})) ||
					[]
				if (type === 'declaration') this.declarationSupplierList = list
				if (type === 'truck') this.truckSupplierList = list
			})
		},
		getBookInfoHeight() {
			let bodyHeight = document.body.clientHeight
			let bookCont = document.getElementById('bookCont')
			// let infoHeight = document.getElementById('infoCont').offsetHeight
			// console.log('🚀 ~ offsetTop', bodyHeight, infoHeight)
			// this.workAssignHeight = bodyHeight - infoHeight - 24 -25 -24 // 24:参与人标题高度
			// this.bookInfoHeight = bodyHeight - infoHeight -24 -25
			// let clientY = document.getElementById('infoCont').event.clientY
			let top = bookCont && bookCont.getBoundingClientRect().top + 10
			console.log('clientY', top)
			this.bookInfoHeight = bodyHeight - top - 30
			this.workAssignHeight = bodyHeight - top - 30 - 24 // 24:参与人标题高度
		},
		// 切换参与人显示隐藏
		toggleWorkAssign() {
			this.workAssignShow = !this.workAssignShow
		},
		getCustType() {
			orderCustInfo({ orderNo: this.bookDetailForm.orderNo }).then(res => {
				this.$set(this.bookDetailForm, 'custLevel', res.data.custLevel)
				this.$set(this.bookDetailForm, 'isWhitelist', res.data.isWhitelist)
				this.$set(this.bookDetailForm, 'industry', res.data.industry)
				this.$set(this.bookDetailForm, 'custClass', res.data.custClass)
				this.$set(this.bookDetailForm, 'contract', res.data.contract)
			})
		},
		async init() {
			this.countryCode = ''
			await this.queryCargoTypeList()
			this.getLclInfo()
		},
		// 获取参与人
		getOrderWorkAssign(shipParam = {}, fieldName) {
			let { sysLineCode, polPortCode, whAgentSupplierId } = shipParam
			let param = {}
			// 外运订舱
			if (this.createItem.whBookType === 'lcl_x') {
				param = { orderNo: this.$route.query.orderNo, forceJoint: true }
			} else {
				param = { orderNo: this.$route.query.orderNo }
			}
			orderWorkList({
				...param,
				sysLineCode,
				polPortCode,
				bkgAgentSupplierId: whAgentSupplierId
			}).then(res => {
				let { isJoint, orgWorkAssignList, jointWorkAssignList } = res.data
				this.orderIsJoint = res.data.isJoint
				// 先取obd部门code，再取下单助理部门code最后再取bd部门code
				let findObdItem = res.data.orgWorkAssignList.find(item => item.jobCode === 'obd')
				let findAsstItem = res.data.orgWorkAssignList.find(item => item.jobCode === 'asst')
				let findBdItem = res.data.orgWorkAssignList.find(item => item.jobCode === 'bd')
				let obdDeptCode = findObdItem ? findObdItem.deptCode : ''
				let asstDeptCode = findAsstItem ? findAsstItem.deptCode : ''
				let bdDeptCode = findBdItem ? findBdItem.deptCode : ''
				this.obdDeptCode = obdDeptCode ? obdDeptCode : asstDeptCode ? asstDeptCode : bdDeptCode

				this.setWorkAssignValue(isJoint === 'Y', jointWorkAssignList, orgWorkAssignList, fieldName)

				// // this.orderWorkOptions = res.data.workAssign
				// this.orderWorkOptions = res.data.orgWorkAssignList.map(item => {
				// 	if (item.employeeId == 0) {
				// 		item.employeeName = ''
				// 	}
				// 	item.employeeId = item.employeeId || ''
				// 	return { ...item }
				// })
				// if (res.data.isJoint === 'Y') {
				// 	this.jointOrderWorkOptions = res.data.jointWorkAssignList.map(item => {
				// 		if (item.employeeId == 0) {
				// 			item.employeeName = ''
				// 		}
				// 		item.employeeId = item.employeeId || ''
				// 		return { ...item }
				// 	})
				// }
				// // 获取初始的进口拼箱委托订舱的协同参与人订舱人员
				// if (this.bookDetailForm.serviceType === 'st11') {
				// 	this.getJointBkgEmployee(this.jointOrderWorkOptions)
				// 	//协助审核人审单时，参与人的订舱初始化清空处理
				// 	if (this.createItem.auditEmployeeId === this.userId && !this.bookDetailForm.lcl.lclOpEmployeeId) {
				// 		// this.clearOrgBkg()
				// 	}
				// }
			})
		},
		// 参与人值处理
		setWorkAssignValue(isJoint, jointWorkAssignList, orgWorkAssignList, fieldName) {
			if (isJoint) {
				this.setWorkAssignJob(jointWorkAssignList)
				this.jointOrderWorkOptions = jointWorkAssignList.map(item => {
					item.isUpdate = false
					if (item.employeeId == 0) {
						item.employeeName = ''
					}
					item.employeeId = item.employeeId || ''
					// 修改起运港，目的地，系统航线,订舱代理会重新分配协同参与人岗位人员。
					if (fieldName) {
						let jobObj = this.workAssignTipObj[item.jobCode]
						if (jobObj && jobObj.empId) {
							// 参与人有更新的给出提示
							if (jobObj.orgEmpId && jobObj.orgEmpId !== jobObj.empId) {
								item.isUpdate = true
							}
							item.employeeId = jobObj.empId
							item.employeeName = jobObj.empName
						}
					}
					return { ...item }
				})
				this.orderWorkOptions = orgWorkAssignList.map(item => {
					item.isUpdate = false
					if (item.employeeId == 0) {
						item.employeeName = ''
					}
					item.employeeId = item.employeeId || ''
					return { ...item }
				})
				this.updatePricingBkgTip(fieldName, this.jointOrderWorkOptions)
				// 上一次选中的参与人，用来跟航线配置的参与人做比对
				this.lastOrgWorkAssign(this.jointOrderWorkOptions)
			} else {
				this.setWorkAssignJob(orgWorkAssignList)
				this.orderWorkOptions = orgWorkAssignList.map(item => {
					item.isUpdate = false
					if (item.employeeId == 0) {
						item.employeeName = ''
					}
					item.employeeId = item.employeeId || ''
					// 修改起运港，目的地，系统航线,订舱代理会重新分配协同参与人岗位人员。
					if (fieldName) {
						let jobObj = this.workAssignTipObj[item.jobCode]
						if (jobObj && jobObj.empId) {
							// 参与人有更新的给出提示
							if (jobObj.orgEmpId && jobObj.orgEmpId !== jobObj.empId) {
								item.isUpdate = true
							}
							item.employeeId = jobObj.empId
							item.employeeName = jobObj.empName
						}
					}
					return { ...item }
				})
				this.updatePricingBkgTip(fieldName, this.orderWorkOptions)
				// 上一次选中的参与人，用来跟航线配置的参与人做比对
				this.lastOrgWorkAssign(this.orderWorkOptions)
			}
		},
		setWorkAssignJob(data) {
			// 在这里获取参与人的职业信息
			for (let i in this.workAssignObj) {
				let findItem = data.find(item => item.jobCode === i && item.employeeId) || {}
				Object.assign(this.workAssignTipObj[i], findItem)
				this.workAssignTipObj[i].empId = findItem.employeeId || ''
				this.workAssignTipObj[i].empName = findItem.employeeName || ''
			}
		},
		lastOrgWorkAssign(data) {
			for (let i in this.workAssignObj) {
				let findItem = data.find(item => item.jobCode === i)
				let orgEmpId = findItem ? findItem.employeeId : ''
				let orgEmpName = findItem ? findItem.employeeName : ''
				this.workAssignTipObj[i].orgEmpId = orgEmpId
				this.workAssignTipObj[i].orgEmpName = orgEmpName
			}
		},
		// 修改起运港，订舱代理等调航线配置接口改变协同参与人的提示信息
		updatePricingBkgTip(fieldName, data) {
			let name = ''
			let nameArr = []
			let flag = false
			for (let i in this.workAssignObj) {
				if (data.find(item => item.jobCode === i && item.isUpdate)) {
					nameArr.push(this.workAssignTipObj[i].name)
					// name += this.workAssignTipObj[i].name + '、'
					flag = true
				}
			}
			name = nameArr.join('、')
			console.log('name', name, flag)
			if (flag) {
				this.$message({
					type: 'warning',
					dangerouslyUseHTMLString: true,
					message: `订舱信息中的${fieldName}已被修改，请注意<strong>${name}人员已更新</strong>`
				})
			}
		},
		changeEmployeeId(param) {
			let { jobCode, employeeId, employeeName } = param
			this.workAssignTipObj[jobCode].orgEmpId = employeeId
			this.workAssignTipObj[jobCode].orgEmpName = employeeName
		},
		getJointBkgEmployee(data) {
			let findItem = data.find(item => item.jobCode === 'bkg')
			this.importJointBkg = findItem ? findItem.employeeId : ''
		},
		getLclInfo() {
			this.lsLoading = true
			lclInfo({
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo
			}).then(response => {
				this.$refs.auditForm.clearValidate()
				this.bookDetailForm = copyArry(response.data)
				let { transport, ship, cargoList, barge } = response.data
				let { whAgentSupplierName, whAgentSupplierId, lclOpEmployeeName, lclOpEmployeeId, orgAuditEmployeeId, auditEmployeeId, auditEmployeeName } = this.bookDetailForm.lcl
				this.whAgentSupplierList = [{ label: whAgentSupplierName, value: whAgentSupplierId }]
				if (lclOpEmployeeId) {
					this.opEmployeeOptions = [{ label: lclOpEmployeeName, value: lclOpEmployeeId }]
				}
				this.createItem = Object.assign(
					{ ...defaultCreateQuery },
					{
						serviceType: response.data.serviceType,
						orderNo: response.data.orderNo,
						opEmployeeId: lclOpEmployeeId,
						opEmployeeName: lclOpEmployeeName,
						whAgentSupplierId: response.data.lcl.whAgentSupplierId,
						whAgentSupplierName: response.data.lcl.whAgentSupplierName,
						whBookType: response.data.lcl.whBookType,
						auditRemark: response.data.auditRemark,
						intrustRemark: response.data.intrustRemark,
						etWhCyCutOff: response.data.lcl.etWhCyCutOff,
						quantity: response.data.lcl.quantity,
						weight: response.data.lcl.weight,
						volume: response.data.lcl.volume,
						transport: transport,
						cargoList,
						ship,
						barge
					}
				)
				if (!transport) {
					this.createItem.transport = {}
				} else {
					if (transport.truckSupplierId) {
						this.truckSupplierList = [{ label: transport.truckSupplierName, value: transport.truckSupplierId }]
					} else {
						this.createItem.transport.truckSupplierId = ''
						this.createItem.transport.truckSupplierName = ''
						this.truckSupplierList = []
					}
					if (transport.customsSupplierId) {
						this.declarationSupplierList = [{ label: transport.customsSupplierName, value: transport.customsSupplierId }]
					} else {
						this.createItem.transport.customsSupplierId = ''
						this.createItem.transport.customsSupplierName = ''
						this.declarationSupplierList = []
					}
				}
				// 获取op改港后的数据
				this.hisData = response.data.ship
				this.newData = response.data.changeInfo
				if (this.isChange) {
					this.$nextTick(() => {
						this.$refs.changeInfo.getChangeInfo()
					})
				}

				
				// 订单详情接口拿操作数据
				orderInfo({ orderNo: this.$route.query.orderNo }).then(res => {
					let { bizDate, payMode, workAssign, serviceList } = res.data
					this.includeFeeder = res.data.barge && res.data.barge.porPortCode ? 'y' : 'n'

					let opItem = workAssign.find(item => item.jobCode === 'op')
					if (opItem) {
						this.opEmployeeOptions = [{ label: opItem.employeeName, value: opItem.employeeId }]
						this.createItem.opEmployeeId = opItem.employeeId
						this.createItem.opEmployeeName = opItem.employeeName
					}
					// 协助审核人输入框信息
					this.createItem.auditEmployeeName = orgAuditEmployeeId ? auditEmployeeName : ''
					this.createItem.auditEmployeeId = orgAuditEmployeeId ? auditEmployeeId : ''
					if (auditEmployeeId) {
						this.auditEmployeeList = [{ label: this.createItem.auditEmployeeName, value: this.createItem.auditEmployeeId }]
					}
					this.disabledAuditEmployeeId = orgAuditEmployeeId ? true : false
					// 服务项
					let serviceNameList = serviceList.map(item => {
						return getDictLabel('orderServiceList', item)
					})
					this.serviceNameStr = ''
					serviceNameList.map((item, index) => {
						this.serviceNameStr += index ? `+${item}` : item
					})

					if (serviceList.includes('pol_declaration') || serviceList.includes('pod_comm_clearance') || serviceList.includes('bonded_declaration')) {
						this.isDeclarationRequired = true
					} else {
						this.isDeclarationRequired = false
					}
					if (serviceList.includes('truck') || serviceList.includes('pol_ltl') || serviceList.includes('pod_fcl_delivery') || serviceList.includes('pod_ltl_delivery') || serviceList.includes('bonded_truck')) {
						this.isTruckRequired = true
					} else {
						this.isTruckRequired = false
					}
					// 获取业务日期，付款方式，服务项
					Object.assign(this.createItem, {
						bizDate,
						serviceList,
						payMode
					})
				})

				if (this.createItem.opEmployeeId === 0) {
					this.createItem.opEmployeeId = ''
					this.createItem.opEmployeeName = ''
				}
				//订舱类型反显
				if (this.createItem.whBookType === '') {
					this.createItem.whBookType = 'lcl'
				}
				if (this.bookDetailForm.serviceType === 'st11') {
					this.createItem.whBookType = 'proxy'
				}
				if (this.bookDetailForm.serviceType === 'st12') {
					this.createItem.whBookType = ''
				}
				// 订舱代理、散货操作反显
				if (this.createItem.whAgentSupplierId === 0) {
					this.createItem.whAgentSupplierId = ''
					this.createItem.whAgentSupplierName = ''
				}
				
				let portCodeArr = []
				if(barge){
					let porPortCode = barge ? barge.porPortCode : ''
					porPortCode ? portCodeArr.push(porPortCode) : ''
				}
				// 获取港口信息
				if (ship) {
					let { podPortCode, polPortCode, unloadingPortCode } = ship
					polPortCode ? portCodeArr.push(polPortCode) : ''
					unloadingPortCode ? portCodeArr.push(unloadingPortCode) : ''
					podPortCode ? portCodeArr.push(podPortCode) : ''
					this.fillPortCodes = portCodeArr.toString()
					// 获取目的港countryCode，做木质包装显示隐藏
					if (ship.podPortCode) {
						this.$store.dispatch('dict/basePortListByCodes', { portCodes: ship.podPortCode }).then(data => {
							let portItem = data.find(item => item.portCode === ship.podPortCode)
							this.countryCode = portItem ? portItem.countryCode : ''
						})
					}
				}
				
				
				
				// 获取货物信息
				this.goodsInfo.info = response.data.cargoList.map(item => {
					let findItem = this.commodityTypeCodeOptions.find(ele => ele.value === item.commodityTypeCode)
					return Object.assign({}, item, {
						commodityTypeCode: findItem ? findItem.label : ''
					})
				})
				this.goodsInfo.transport = response.data.transport
				// 获取客户类型
				this.getCustType()
				this.getOrderWorkAssign()
				console.log('bookBaseInfo', this.bookBaseInfo)
			}).finally(() => {
				this.lsLoading = false
			})
		},
		handleChangeWhBookType(value) {
			// this.createItem.whBookType = value
			this.getOrderWorkAssign()
		},
		// 货品分类
		queryCargoTypeList() {
			cargoTypeList().then(response => {
				this.commodityTypeCodeOptions = response.data.map(item => {
					return Object.assign({}, item, {
						label: item.chapterName,
						value: item.chapterCode
					})
				})
			})
		},
		// 订舱代理
		whAgentVisibleChange(val) {
			if (val && !this.createItem.whAgentSupplierId) this.getSupplierList('')
		},
		whAgentFilterMehod(val) {
			this.getSupplierList(val)
		},
		// 获取订舱代理
		getSupplierList(queryString) {
			this.$store.dispatch('dict/querySupplierList', { category: 'serviceCode', value: 'whbook,proxy_whbook', queryString: queryString, categoryType: 'in' }).then(data => {
				this.whAgentSupplierList = data.list.map(ele => {
					return Object.assign(ele, {
						label: this.$language == 'en' ? ele.ename : ele.name,
						value: ele.supplierId ? Number(ele.supplierId) : ''
					})
				})
			})
		},
		handleChangeWhAgent(val) {
			if (val) {
				let param = {
					sysLineCode: this.createItem.ship.sysLineCode,
					polPortCode: this.createItem.ship.polPortCode,
					whAgentSupplierId: this.createItem.whAgentSupplierId
				}
				this.getOrderWorkAssign(param, '订舱代理')
			}
		},
		// 下拉搜索自定义查询
		opEmployeeFilterMehod(val) {
			this.getEmployeeName(val)
		},
		// 下拉展开
		opEmployeeVisibleChange(val) {
			if (val) {
				this.getEmployeeName()
			}
		},
		// 选中协同人员下拉
		handleChangeOpEmployee(val) {
			// this.bookDetailForm.ship.bkgEmployeeId = val
			console.log(this.bookDetailForm)
		},
		// 获取员工name
		getEmployeeName(val) {
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: 'op' // 角色
			}
			baseDeptParticipants(data).then(res => {
				this.opEmployeeOptions = res.data.map(item => {
					return Object.assign(item, {
						label: this.$language === 'en' ? item.ename : item.cname,
						value: item.employeeId ? Number(item.employeeId) : ''
					})
				})
			})
		},
		// 协助审单人
		auditEmployeeRemoteMethod(val) {
			this.auditEmployeeSearch(val)
		},
		auditEmployeeVisibleChange(val) {
			if (val) {
				this.auditEmployeeSearch('')
			}
		},
		handleChangeAuditEmployee(val) {
			this.isJointAuditEmployee = val ? true : false
			// this.isRequired = val ? false : true
			// 海运进口拼箱设置协助审核人时，协同参与人订舱置空
			if (this.bookDetailForm.serviceType === 'st11' && val) {
				this.clearJointBkg()
			}
		},
		clearJointBkg() {
			this.jointOrderWorkOptions = this.jointOrderWorkOptions.map(item => {
				if (item.jobCode === 'bkg') {
					item.employeeId = ''
					item.employeeName = ''
				}
				return {...item}
			})
		},
		clearOrgBkg() {
			this.orderWorkOptions = this.orderWorkOptions.map(item => {
				if (item.jobCode === 'bkg') {
					item.employeeId = ''
					item.employeeName = ''
				}
				return {...item}
			})
		},
		// 获取协助审单人下拉
		auditEmployeeSearch(val) {
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: 'pricing'
			}
			baseDeptParticipants(data).then(res => {
				this.auditEmployeeList = res.data.map(item => {
					return Object.assign(item, {
						label: this.$language == 'en' ? item.ename : item.cname,
						value: item.employeeId
					})
				})
			})
		},
		// 撤回协同人员
		cancelJoint() {
			lclAuditJointCancel({ orderNo: this.$route.query.orderNo }).then(res => {
				this.disabledAuditEmployeeId = false
				this.isJointAuditEmployee = false
				this.createItem.auditEmployeeId = ''
				this.getLclInfo()
			})
		},
		getWorkAssign(data) {
			let workArr =
				data.map(item => {
					return {
						jobCode: item.jobCode,
						employeeId: item.employeeId ? item.employeeId : 0
					}
				}) || []
			return workArr
		},
		// 协同参与人校验bkg,op
		jointWorkAssignValidate() {
			let flag = true
			let bkgOpArr = this.jointOrderWorkOptions.filter(item => ['bkg', 'op'].includes(item.jobCode) && !item.employeeId)
			if (this.bookDetailForm.serviceType === 'st12') {
				bkgOpArr = this.jointOrderWorkOptions.filter(item => ['op'].includes(item.jobCode) && !item.employeeId)
			}
			let msg = ''
			console.log('bkgOpArr', bkgOpArr)
			bkgOpArr.map((item, index) => {
				msg += index ? `、${item.jobCname}` : item.jobCname
			})
			if (msg) {
				this.$message({ type: 'error', message: `${msg}参与人不能为空` })
				flag = false
			}
			return flag
		},
		// 协助审核人的参与人校验bkg
		orgWorkAssignValidate() {
			let flag = true
			let bkgOpArr = this.orderWorkOptions.filter(item => ['bkg', 'op'].includes(item.jobCode) && !item.employeeId)
			let msg = ''
			console.log('bkgOpArr', bkgOpArr)
			bkgOpArr.map((item, index) => {
				msg += index ? `、${item.jobCname}` : item.jobCname
			})
			if (msg) {
				this.$message({ type: 'error', message: `${msg}参与人不能为空` })
				flag = false
			}
			return flag
		},
		// 获取海运出海口拼箱保存参数
		getCargoValues() {
			let cargoList = []
			this.createItem.cargoList.forEach(item => {
				let cargoObj = {}
				Object.assign(cargoObj, {
					hscode: item.hscode,
					cname: item.cname,
					ename: item.ename,
					property: item.property,
					packageInfo: item.packageInfo,
					mark: item.mark,
					commodityDesc: item.commodityDesc,
					commodityTypeCode: item.commodityTypeCode,
					isWoodenPackage: item.isWoodenPackage ? item.isWoodenPackage : undefined,
					shipperName: item.shipperName
				})
				// 危险品
				if (item.property === 'dangerous') {
					Object.assign(cargoObj, {
						dangerousGrade: item.dangerousGrade,
						dangerousCode: item.dangerousCode,
						packageGroup: item.packageGroup
					})
				}
				cargoList.push(cargoObj)
			})
			return cargoList
		},
		// 海运进口拼箱的货物信息参数
		getImportCargoValues() {
			let cargoList = []
			this.createItem.cargoList.forEach(item => {
				let cargoObj = {}
				Object.assign(cargoObj, {
					length: item.length,
					width: item.width,
					height: item.height,
					hscode: item.hscode,
					cname: item.cname,
					ename: item.ename,
					property: item.property,
					packageInfo: item.packageInfo,
					mark: item.mark,
					commodityDesc: item.commodityDesc,
					commodityTypeCode: item.commodityTypeCode,
					isWoodenPackage: item.isWoodenPackage ? item.isWoodenPackage : undefined,
					shipperName: item.shipperName
				})
				// 危险品
				if (item.property === 'dangerous') {
					Object.assign(cargoObj, {
						dangerousGrade: item.dangerousGrade,
						dangerousCode: item.dangerousCode,
						packageGroup: item.packageGroup
					})
				}
				cargoList.push(cargoObj)
			})
			return cargoList
		},
		handleSave(type) {
			let workAssign = this.getWorkAssign(this.orderWorkOptions)
			let opEmployeeId = this.createItem.opEmployeeId
			// 协同参与人取opEmployeeId
			if (this.orderIsJoint === 'Y') {
				// 有设置协助审核人，保存时不校验协同订舱必填
				if ((!this.createItem.auditEmployeeId || this.createItem.auditEmployeeId === this.userId) && !this.jointWorkAssignValidate()) return
				// 设置协助审核人后，不能再设置协同参与人订舱人员
				if (this.createItem.auditEmployeeId && this.createItem.auditEmployeeId !== this.userId) {
					let bkgItem = this.jointOrderWorkOptions.find(item => item.jobCode === 'bkg')
					if (bkgItem && bkgItem.employeeId) {
						return this.$message.error('协助审核人和协同参与人订舱人员不能同时设置！')
					}
				}
				workAssign = this.getWorkAssign(this.jointOrderWorkOptions)
				let findJointItem = this.jointOrderWorkOptions.find(item => item.jobCode === 'op' && item.employeeId)
				opEmployeeId = findJointItem ? findJointItem.employeeId : ''
				// 进口拼箱-委托订舱的opEmployeeId传参与人的bkg
				if (this.bookDetailForm.serviceType === 'st11') {
					let bkgJointItem = this.jointOrderWorkOptions.find(item => item.jobCode === 'bkg' && item.employeeId)
					opEmployeeId = bkgJointItem ? bkgJointItem.employeeId : ''
				}
			} else {
				// 有设置协助审核人，保存时不校验协同订舱必填
				if ((this.createItem.auditEmployeeId === this.userId) && !this.orgWorkAssignValidate()) return
				// 取原单参与人opEmployeeId
				let findItem = this.orderWorkOptions.find(item => item.jobCode === 'op' && item.employeeId)
				opEmployeeId = findItem ? findItem.employeeId : ''
				// 进口拼箱-委托订舱的opEmployeeId传参与人的bkg
				if (this.bookDetailForm.serviceType === 'st11') {
					let bkgItem = this.orderWorkOptions.find(item => item.jobCode === 'bkg' && item.employeeId)
					opEmployeeId = bkgItem ? bkgItem.employeeId : ''
				}
			}

			// // 外运订舱取协同操作参与人
			// // console.log('jointOrderWorkOptions', this.jointOrderWorkOptions);
			// if (this.createItem.whBookType === 'lcl') {
			// 	let findItem = this.jointOrderWorkOptions.find(item => item.jobCode === 'op' && item.employeeId)
			// 	opEmployeeId = findItem ? findItem.employeeId : ''
			// }

			// 操作订舱或是st12(进口拼箱客户自定)优先取协同操作，没有再取原单操作
			// // if (this.createItem.whBookType === 'op' || ['st12'].includes(this.bookDetailForm.serviceType)) {
			// 	let findJointItem = this.jointOrderWorkOptions.find(item => item.jobCode === 'op' && item.employeeId)
			// 	let findItem = this.orderWorkOptions.find(item => item.jobCode === 'op' && item.employeeId)
			// 	if (findJointItem) {
			// 		opEmployeeId = findJointItem.employeeId
			// 	} else if (findItem){
			// 		opEmployeeId = findItem.employeeId
			// 	} else {

			// 	}
			// // }
			// 截放行时间，截报关时间截取冒号之前的字符, 格式：yyyy-MM-dd HH
			let { ccCutOff, cvCutOff } = this.createItem.ship
			if (ccCutOff && ccCutOff.indexOf(':') !== -1) {
				ccCutOff = ccCutOff.substring(13, 0)
			}
			if (cvCutOff && cvCutOff.indexOf(':') !== -1) {
				cvCutOff = cvCutOff.substring(13, 0)
			}
			let data = {
				isJoint: this.orderIsJoint,
				workAssign: workAssign,
				submitType: type,
				orderNo: this.createItem.orderNo,
				opEmployeeId: opEmployeeId,
				whAgentSupplierId: this.createItem.whAgentSupplierId,
				whBookType: this.createItem.whBookType,
				auditRemark: this.createItem.auditRemark,
				jointAuditEmployeeId: this.bookDetailForm.lcl.orgAuditEmployeeId ? undefined : this.createItem.auditEmployeeId,
				transport: this.createItem.transport,
				payMode: this.createItem.payMode,
				serviceType: this.createItem.serviceType,
				intrustRemark: this.createItem.intrustRemark,
				bizDate: this.createItem.bizDate,
				quantity: this.createItem.quantity,
				weight: this.createItem.weight,
				volume: this.createItem.volume,
				whCyCutOff: this.createItem.whCyCutOff,
				etWhCyCutOff: this.createItem.etWhCyCutOff,
				serviceList: this.createItem.serviceList,
				ship: {
					receiptPlace: this.createItem.ship.receiptPlace,
					receiptPlaceName: this.createItem.ship.receiptPlaceName,
					etdTime: this.createItem.ship.etdTime,
					podPortCode: this.createItem.ship.podPortCode,
					polPortCode: this.createItem.ship.polPortCode,
					unloadingPortCode: this.createItem.ship.unloadingPortCode,
					contractNo: this.createItem.ship.contractNo,
					sysLineCode: this.createItem.ship.sysLineCode,
					tdTime: this.createItem.ship.tdTime,
					etdTime: this.createItem.ship.etdTime,
					ccCutOff: ccCutOff ? `${ccCutOff}:00:00` : '',
					cvCutOff: cvCutOff ? `${cvCutOff}:00:00` : '',
					blMode: this.createItem.ship.blMode
				},
				barge:
				this.includeFeeder === 'y'?
					{
						porPortCode: this.createItem.barge.porPortCode,
						etdTime: this.createItem.barge.etdTime
					}:null,
				cargoList: this.bookDetailForm.businessType === 'ship_import_lcl' ? this.getImportCargoValues() : this.getCargoValues()
			}
			// // 进口整箱要增加的传参
			// if (this.bookDetailForm.businessType === 'ship_import_lcl') {
			// 	Object.assign(data, {
			// 		transport: {
			// 			customsSupplierId: this.createItem.transport.customsSupplierId,
			// 			customsSupplierName: this.createItem.transport.customsSupplierName,
			// 			truckSupplierId: this.createItem.transport.truckSupplierId,
			// 			truckSupplierName: this.createItem.transport.truckSupplierName
			// 		}
			// 	})
			// }
			lclAuditPass(data).then(res => {
				this.$message({
					type: 'success',
					message: type === 'save' ? '保存成功' : '审核通过成功'
				})
				this.getLclInfo()
				// this.handleGoBack()
			})
		},
		saveFunc(type) {
			if (!this.createItem.whBookType && this.bookDetailForm.serviceType != 'st12') {
				return this.$message({ type: 'error', message: '请选择订舱类型' })
			}
			// if (!this.createItem.whAgentSupplierId && !['st03', 'st12'].includes(this.bookDetailForm.serviceType)) {
			// 	return this.$message({ type: 'error', message: '请选择订舱代理' })
			// }
			this.$refs.auditForm.validate(valid => {
				if (valid) {
					this.handleSave(type)
				} else {
					console.log('error submit!!')
					toViewPosition('left-cont', 80)
					this.$message.error('请按要求填写数据')
					return false
				}
			})
		},
		// 返回
		handleGoBack() {
			// this.$router.go(-1)
			this.$router.push({
				name: 'LclAuditList'
			})
		},
		// 拒绝
		handleRefuse() {
			this.refusePopShow = true
		},
		refusePopClose(action) {
			this.refusePopShow = false
			if (action === 'Confirm') {
				this.$store.dispatch('tagsView/delView', this.$route)
				this.handleGoBack()
			}
		},
		// 审核拒绝
		handleAuditRefuse() {
			this.auditRefusePopShow = true
		},
		auditRefusePopClose(action) {
			this.auditRefusePopShow = false
			if (action === 'Confirm') {
				this.getLclInfo()
			}
		}
	}
}
</script>
<style lang="scss">
@import '@/views/order/order/less/detail.scss';
.edit-container#lclAuditDetail {
	.audit-btn {
		display: inline-block;
		color: #3e80f5;
		margin-left: 10px;
		cursor: pointer;
		font-size: 12px;
		vertical-align: bottom;
	}
	.service-name-cont {
		display: flex;
		flex-wrap: nowrap;
		height: 25px;
		padding: 0 10px 5px 18px;
		line-height: 20px;
		width: 100%;
		background-color: #fff;
		.service-type {
			width: 220px;
			// margin-right: 35px;
			display: inline-block;
		}
		.name {
			display: inline-block;
			cursor: pointer;
			max-width: 700px;
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
			vertical-align: middle;
			flex: 1;
			// margin-top: -2px;
		}
		@media screen and (min-width: 1580px) {
			.name {
				max-width: 1200px;
			}
		}
	}
	.book-cont .right-cont .tit {
		margin-top: 0;
	}
	.el-collapse-item__header {
		height: 24px;
		line-height: 24px;
		padding: 0 0 0 8px;
		border-bottom: 0;
		font-weight: bold;
		font-size: 12px;
		&.is-active {
			border-bottom: 1px solid #e6ebf5;
		}
	}
	.audit-book-work-cont {
		.el-collapse-item__header {
			height: 30px;
			line-height: 30px;
			border-bottom: 1px dashed #d9d9d9;
			padding: 0 10px;
		}
		.el-collapse-item__content {
			font-size: 12px;
		}
	}
	.el-collapse-item__content {
		padding-bottom: 25px;
		font-size: 12px;
	}
	// .edit-row .el-collapse-item__content {
	//   padding-top: 10px;
	//   font-size: 12px;
	// }
	.small-tit {
		font-weight: normal;
	}
	.small-tit .bkgNo {
		color: #222;
	}
	.small-tit .bkgStatus {
		display: inline-block;
		color: #4a4a4a;
		&.item{
			width: 238px;
		}
		&.ml30{
			margin-left: 30px;
		}
		.mr5 {
			margin-right: 5px;
		}
		.to_book {
			color: #4a4a4a;
		}
		// .booked{
		// 	color: #222;
		// }
		.po_received,
		.booked {
			color: #3e80f5;
		}
		.wh_in {
			color: #33b18a;
		}
		i {
			display: inline-block;
			width: 14px;
			height: 14px;
			border-radius: 50%;
			line-height: 14px;
			background: url(../../../../../../assets/icon_bkgStatus.png) center center no-repeat;
			background-color: #4a4a4a;
			margin-right: 5px;
			vertical-align: sub;
			&.to_book {
				background-color: #4a4a4a;
			}
			// &.booked{
			// 	background-color: #222;
			// }
			&.po_received,
			&.booked {
				background-color: #3e80f5;
			}
			&.wh_in {
				background-color: #33b18a;
			}
		}
		.vip-icon {
			display: inline-block;
			vertical-align: middle;
			width: 16px;
			height: 16px;
			margin-left: 8px;
			@for $i from 1 through 5 {
				&.vip-icon-vip#{$i} {
					background: url('~@/views/crm/merchantManagement/customerList/images/icon-vip'+$i+'.png') 0 0 no-repeat;
					background-size: 100% 100%;
				}
			}
		}
		.vip-img {
			width: 20px;
			height: auto;
			vertical-align: middle;
			cursor: pointer;
			margin-left: 5px;
		}
	}
	.small-tit .icon {
		vertical-align: text-top;
		margin-right: 5px;
		width: 14px;
	}
	.edit-row {
		margin: 0 5px 0 10px;
	}
	.edit-row .row-form {
		padding: 15px 15px 5px;
	}
	.edit-row .row-form .el-row {
		margin-bottom: 10px;
	}
	.span-label {
		margin-right: 30px;
	}
	.edit-row .el-collapse-item__header {
		height: 36px;
		line-height: 36px;
		padding: 0 0 0 15px;
	}
	.separate-line {
		width: 100%;
		height: 8px;
		background-color: #f5f7f9;
	}
	.edit-row .row-tit {
		padding: 5px 10px 5px 15px;
	}
	.edit-row .row-tit .small-tit {
		height: inherit;
		line-height: 24px;
		width: 70%;
	}
	.edit-row .row-tit .row-tit-operate {
    display: flex;
    height: 100%;
    align-items: center;
    width: 30%;
    justify-content: flex-end;
	}
	.edit-row .row-tit .small-tit.flex1 {
		flex: 1;
	}
	.el-radio,
	.el-radio__label {
		font-size: 12px;
	}
	.edit-row .el-collapse-item__content {
		padding: 0;
		font-size: 12px;
	}
	// .edit-row .el-form-item__content {
	// 	margin-right: 10px;
	// }
	.edit-row .el-form-item__label {
		padding-right: 4px;
	}
	// .el-collapse-item__content > div > div {
	// 	margin: 15px 0;
	// }
	#auditEmployeeId {
		.el-select {
			width: calc(100% - 56px);
			input {
				border-top-right-radius: unset;
				border-bottom-right-radius: unset;
			}
		}
		button {
			border-left: unset;
			border-top-left-radius: unset;
			border-bottom-left-radius: unset;
		}
	}
	.el-button--mini {
		height: 20px;
		padding: 1px 10px;
		span {
			line-height: 16px;
		}
	}
	.el-input--mini .el-input__inner {
		height: 20px;
		line-height: 20px;
	}
	.el-input--mini .el-input__icon {
		line-height: 20px;
	}
	.el-textarea__inner {
		padding: 2px 5px;
	}
	.order-base-info {
		font-size: 12px;
		line-height: 24px;
		height: 24px;
		padding-left: 8px;
		border-bottom: 1px solid #e9e9e9;
		margin: 0 auto;
	}
	.lcl-row-cont {
		border: 1px solid #e9e9e9;
		border-radius: 4px;
		margin: 5px 8px 0;
		overflow: hidden;
		.lcl-row-cont-tit {
			background: rgba(248, 249, 253, 1);
			border-radius: 4px 4px 0px 0px;
			height: 32px;
			line-height: 32px;
			.tit {
				font-size: 12px;
				font-weight: bold;
				padding-left: 12px;
				.redTip {
					font-weight: normal;
					font-style: normal;
					color: #ff4949;
				}
			}
			.delete {
				font-size: 18px;
				margin-right: 10px;
				margin-top: 6px;
				color: #999;
				cursor: pointer;
			}
		}
		.row-flex {
			margin-top: 10px;
			.btn-minus-search,
			.btn-plus-search {
				float: right;
				margin-right: 6px;
				// margin-top: 24px;
			}
			&.flex-cargo {
				.flex-item {
					width: 15.8%;
				}
			}
			.flex-item {
				width: 25%;
				// padding: 0 10px 0 10px;
				margin-bottom: 4px;
				float: left;
				&.flex-item3 {
					width: 47.4%;
				}
				.item-label {
					font-size: 12px;
					line-height: 20px;
					height: 20px;
					margin-bottom: 0;
					display: flex;
					// justify-content: space-between;
					span {
						display: block;
					}
					.lab {
						// display: flex;
						em {
							font-style: normal;
						}
					}
				}
			}
		}
		.post-order-list {
			padding: 10px;
			height: 310px;
			overflow-x: hidden;
			// overflow-y: auto;
			.empty-txt {
				color: #999;
				padding-top: 100px;
				text-align: center;
				margin: 0 auto;
			}
			.el-checkbox__label {
				font-size: 12px;
			}
		}
		.post-order-row {
			width: 100%;
			display: flex;
			margin-top: 2px;
			.label {
				line-height: 18px;
				font-weight: bold;
				min-width: 60px;
				margin-right: 10px;
			}
			.options {
				width: 100%;
				.el-checkbox-group {
					display: flex;
					flex-wrap: wrap;
					.el-checkbox {
						width: 50%;
						margin-right: 0;
						margin-bottom: 10px;
					}
				}
				.el-checkbox__input {
					vertical-align: top;
					margin-top: 3px;
				}
				.el-checkbox__label {
					display: inline-grid;
					white-space: pre-line;
					word-wrap: break-word;
					overflow: hidden;
					line-height: 14px;
					padding-right: 10px;
					font-size: 12px;
				}
			}
		}
	}
	.el-input--suffix .el-input__inner {
		padding-right: 20px;
	}
	.el-input--suffix .el-input__icon {
		width: 16px;
	}
}
</style>
