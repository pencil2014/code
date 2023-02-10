<template>
	<div class="edit-container order-book fullWrap" id="shippingTruck" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div class="order-container">
			<!-- 协同撤回申请提示 -->
			<CancelApplyAlert v-if="jointShow && isCancelApply && serviceCode !== 'book'" :serviceInfo="serviceInfo" :serviceList="orderInfo.serviceList" @callback="getOrderInfo" />
			<!-- 订单已取消提示 -->
			<CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
			<!-- 订单拒绝提示 -->
			<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
			<div class="tabs-container">
				<TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" :custid="orderInfo.custid" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="routeName" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<div class="service-container" id="container" @scroll="handleScroll">
							<ServiceCustInfo :orderInfo="orderInfo" :serviceCode="serviceCode" @info="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>
							<div class="remark-container" id="remarkTable">
								<div class="remark-tit-row">
									<span class="tit">委派信息</span>
									<div class="operate">
										<span v-if="isOp" class="trusk-time">
											<div>预计拖柜日期：</div>
											<elDatePickerLimit @change="truckTimeChange" :disabled="isFinish || isDisabledEdit" size="mini" v-model="preTruckDate" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
										</span>
										<ButtonTip
                      btnType="primary" 
                      :btnDisabled="!isOp || isFinish || !soList.length || isDisabledEdit" 
                      btnText="推送拖车操作" 
                      :tipContent="isOpTip || isFinishTip || soListTip || statusTip" 
                      class="operateBtn-tip ml10" 
                      @click="handlePushToOpTruck">
                    </ButtonTip>
										<!-- <el-button type="primary" size="mini" class="ml10" @click="handlePushToOpTruck" :disabled="!isOp || isFinish || !soList.length || isDisabledEdit">推送拖车操作</el-button> -->
										<ButtonTip
                      btnType="primary" 
                      :btnDisabled="!isOp || isFinish || isDisabledEdit" 
                      btnText="新增委派" 
                      :tipContent="isOpTip || isFinishTip || statusTip" 
                      class="operateBtn-tip ml10" 
                      @click="handleCreate">
                    </ButtonTip>
										<!-- <el-button type="primary" size="mini" class="ml10" @click="handleCreate" :disabled="!isOp || isFinish || isDisabledEdit">新增委派</el-button> -->
										<span class="expand ml10" @click="handleToogleExpand"> {{ remarkShow ? '收起' : '展开' }}<i :class="remarkShow ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
									</div>
								</div>
								<SoInfo :soList="soList" @delete="handleDeleteServiceInfo" :isDisabledEdit="isDisabledEdit" :isOpTip="isOpTip" :isFinishTip="isFinishTip" :statusTip="statusTip" v-if="remarkShow"></SoInfo>
								<!-- <div class="remark-row" v-if="remarkShow">
									<el-input type="textarea" size="mini" placeholder="请输入委派备注" v-model="remark" maxlength="2048" show-word-limit :autosize="{ minRows: 2, maxRows: 3}"></el-input>
								</div> -->
							</div>
							<div class="component-cont table-com-layout" style="margin-top: 8px" id="intrustTable">
								<div class="between h28">
									<div class="ft12 bold">委派计划</div>
									<div>
										<ButtonTip
                      btnType="default" 
                      :btnDisabled="isBd || !isOpTruck" 
                      btnText="输出派车委托单" 
                      :tipContent="isOpTruckTip || isFinishTip || isJointTip" 
                      class="operateBtn-tip mr10" 
                      @click="handleOpenExportPop">
                    </ButtonTip>
										<!-- <el-button size="mini" type="default" :disabled="isBd || !isOpTruck" class="mr10" @click="handleOpenExportPop">输出派车委托单</el-button> -->
										<span>委派状态：</span>
										<el-select style="width: 120px" placeholder="请选择" size="mini" v-model="status" @change="handleUpdateIntrustStatus" :disabled="isBd || !isOpTruck || isDisabledEdit">
											<el-option v-for="(item, index) in dictMap.truckIntrustStatus" :key="index" :label="item.label" :value="item.value"></el-option>
										</el-select>
										<ButtonTip
                      btnType="primary" 
                      :btnDisabled="isBd || !isOpTruck || isDisabledEdit" 
                      btnText="新增计划" 
                      :tipContent="isOpTruckTip || isFinishTip || isJointTip || statusTip"
                      class="operateBtn-tip ml10" 
                      @click="handleAdd">
                    </ButtonTip>
										<!-- <el-button size="mini" type="primary" class="ml10" @click="handleAdd" :disabled="isBd || !isOpTruck || isDisabledEdit">新增计划</el-button> -->
									</div>
								</div>
								<el-table ref="multipleTable" fit style="width: 100%" :data="list" @selection-change="handleSelectionChange">
									<el-table-column type="selection" :selectable="selectable"></el-table-column>
									<el-table-column prop="intrustNo" label="委托编号" align="center"> </el-table-column>
									<el-table-column prop="intrustStatus" label="委派状态" align="center">
										<template slot-scope="scope">
											{{ scope.row.intrustStatus | intrustStatusFilter }}
										</template>
									</el-table-column>
									<!-- <el-table-column prop="loadType" label="装货类型" align="center">
										<template slot-scope="scope">
											<span>{{ scope.row.loadType | loadTypeFilter }}</span>
										</template>
									</el-table-column> -->
									<el-table-column prop="supplierName" label="车队" align="center">
										<template slot-scope="scope">
											<el-select
												style="width: 100%"
												placeholder="请选择"
												size="mini"
												v-model="scope.row.supplierId"
												clearable
												:filterable="true"
												@visible-change="supplierVisibleChange"
												:filter-method="supplierFilterMehod"
												v-if="scope.row.isAdd || scope.row.isEdit"
												@change="val => handleSelectSupplierName(scope.$index, val)"
											>
												<el-option v-for="item in supplierList" :key="item.supplierId" :label="item.label" :value="item.value"></el-option>
											</el-select>
											<span v-else>{{ scope.row.supplierName }}</span>
										</template>
									</el-table-column>
									<el-table-column prop="supplierContact" label="车队联系人" align="center">
										<template slot-scope="scope">
											<el-input size="mini" placeholder="请输入" clearable v-model="scope.row.supplierContact" v-if="scope.row.isAdd || scope.row.isEdit"></el-input>
											<span v-else>{{ scope.row.supplierContact }}</span>
										</template>
									</el-table-column>
									<el-table-column prop="supplierContactPhone" label="车队联系电话" align="center">
										<template slot-scope="scope">
											<el-input size="mini" placeholder="请输入" clearable v-model="scope.row.supplierContactPhone" v-if="scope.row.isAdd || scope.row.isEdit"></el-input>
											<span v-else>{{ scope.row.supplierContactPhone }}</span>
										</template>
									</el-table-column>
									<el-table-column prop="boxRemark" label="备注" align="center" width="200" show-overflow-tooltip>
										<template slot-scope="scope">
											<el-input size="mini" placeholder="请输入" v-model="scope.row.boxRemark" v-if="scope.row.isAdd || scope.row.isEdit" @focus="handleEditBoxRemark(scope.row, scope.$index)"></el-input>
											<div v-else class="remark-con">
												<el-button type="text" class="underline txt ft12" @click="handleViewBoxRemark(scope.row)" :disabled="!scope.row.boxRemark">{{ scope.row.boxRemark }}</el-button>
												<!-- <el-button type="text" class="underline ft12 ml10" @click="handleViewBoxRemark(scope.row)">详细</el-button> -->
											</div>
										</template>
									</el-table-column>
									<el-table-column label="操作" width="170" align="center" fixed="right">
										<template slot-scope="scope">
											<div class="operate-group">
												<ButtonTip v-if="!scope.row.isAdd && !scope.row.isEdit"
													btnType="text" 
													:btnDisabled="isBd || !isOpTruck || isDisabledEdit" 
													btnText="编辑" 
													:tipContent="isOpTruckTip || isFinishTip || isJointTip || statusTip"
													class="operateBtn-tip" 
													@click="handleEdit(scope.row)">
												</ButtonTip>
												<!-- <el-button @click="handleEdit(scope.row)" type="text" size="mini" v-if="!scope.row.isAdd && !scope.row.isEdit" :disabled="isBd || !isOpTruck || isDisabledEdit">编辑</el-button> -->
												<el-button @click="handleInfo(scope.row)" type="text" size="mini" v-if="!scope.row.isAdd && !scope.row.isEdit">详情</el-button>
												<ButtonTip v-if="!scope.row.isAdd && !scope.row.isEdit"
													btnType="text" 
													:btnDisabled="isBd || !isOpTruck || isDisabledEdit" 
													btnText="复制" 
													:tipContent="isOpTruckTip || isFinishTip || isJointTip || statusTip"
													class="operateBtn-tip" 
													@click="handleCopy(scope.row)">
												</ButtonTip>
												<ButtonTip v-if="!scope.row.isEdit"
													btnType="text" 
													:btnDisabled="isBd || !isOpTruck || isDisabledEdit" 
													btnText="删除" 
													:tipContent="isOpTruckTip || isFinishTip || isJointTip || statusTip"
													class="operateBtn-tip" 
													btnClassName="red"
													@click="handleDelete(scope.row, scope.$index)">
												</ButtonTip>
												<!-- <el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || !isOpTruck || isDisabledEdit" v-if="!scope.row.isEdit">删除</el-button> -->
												<ButtonTip v-if="scope.row.isEdit"
													btnType="text" 
													:btnDisabled="isBd || !isOpTruck || isDisabledEdit" 
													btnText="取消" 
													:tipContent="isOpTruckTip || isFinishTip || isJointTip || statusTip"
													class="operateBtn-tip" 
													@click="handleCancel(scope.row, scope.$index)">
												</ButtonTip>
												<!-- <el-button @click="handleCancel(scope.row, scope.$index)" type="text" size="mini" v-if="scope.row.isEdit" :disabled="isBd || !isOpTruck || isDisabledEdit">取消</el-button> -->
												<ButtonTip v-if="scope.row.isAdd || scope.row.isEdit"
													btnType="text" 
													:btnDisabled="isBd || !isOpTruck || isDisabledEdit" 
													btnText="保存" 
													:tipContent="isOpTruckTip || isFinishTip || isJointTip || statusTip"
													class="operateBtn-tip" 
													@click="handleSave(scope.row, scope.$index)">
												</ButtonTip>
												<!-- <el-button @click="handleSave(scope.row, scope.$index)" type="text" size="mini" v-if="scope.row.isAdd || scope.row.isEdit" :disabled="isBd || !isOpTruck || isDisabledEdit">保存</el-button> -->
											</div>
										</template>
									</el-table-column>
								</el-table>
							</div>
							<!-- 拖车详情 -->
							<TruckLoad ref="truckLoad" @hideDetail="hideDetail" :isOpTruckTip="isOpTruckTip" :isFinishTip="isFinishTip" :isJointTip="isJointTip" :statusTip="statusTip" :truckDetailQuery="truckDetailQuery" :isDisabledEdit="isDisabledEdit" :saveBarFixed="saveBarFixed" v-if="showTruckLoad" />
							<!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="'truck'" /> -->
						</div>
						<JointWorkAssign :jointServiceWorkList="jointServiceWorkList" :serviceCode="serviceCode" @callback="jointWorkAssignCallback" />
					</div>
				</div>
			</div>
		</div>
		<!-- 输出拖车委托单弹窗 -->
		<div v-if="exportPopShow">
			<ExportPop @close="exportPopClose" />
		</div>
		<!-- 输出时间弹窗 -->
		<div v-if="exportTimePopShow">
			<ExportTimePop @close="exportTimePopClose" />
		</div>
		<!-- 备注弹窗 -->
		<div v-if="boxRemarkPopShow">
			<RemarkPop :boxRemark="boxRemark" :boxRemarkType="boxRemarkType" @close="boxRemarkPopClose" />
		</div>
		<!-- 创建委派信息弹窗 -->
		<div v-if="createShow">
			<Create @close="createPopClose" />
		</div>
		<div v-if="opTruckPopShow">
			<OpTruckPop @close="opTruckPopClose" :bdDeptCode="bdDeptCode" />
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel, getServiceCode } from '@/utils/tools'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { baseSupplierList } from '@/api/base'
import {
	// orderInfo,
	// orderJointInfo,
	// orderBookInfo,
	remarkInfo,
	remarkSave,
	serviceInfoList,
	serviceInfoSave,
	serviceInfoDelete,
	addTruckOp,
	pushToOpTruck,
	fclTruckIntrustCopy
} from '@/api/order/list'
import { supplierInfo } from '@/api/crm/supplier'
import { fclTruckIntrustList, fclTruckIntrustSave, fclTruckIntrustDelete, fclTruckIntrustGetIntrustNo, truckIntrustUpdateDispatchStatus, fclTruckIntrustUpdateIntrustStatus, getTruckDate, saveTruckDate } from '@/api/order/shippingTruck'
import CancelApplyAlert from '../components/cancelApplyAlert'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import ServiceCustInfo from '../components/serviceCustInfo'
import JointWorkAssign from '@/views/order/order/jointList/components/workAssign'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'
import ExportPop from './components/exportPop'
import RemarkPop from './components/remarkPop'
import ExportTimePop from './components/exportTimePop'
import TruckLoad from './truckLoad'
import SoInfo from './components/soInfo'
import Create from './components/create'
import OpTruckPop from './components/opTruckPop.vue'

export default {
	filters: {
		dispatchStatusFilter(status) {
			return getDictLabel('truckDispatchStatus', status)
		},
		intrustStatusFilter(status) {
			return getDictLabel('truckIntrustStatus', status)
		},
		loadTypeFilter(loadType) {
			return getDictLabel('loadType', loadType)
		}
	},
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			exportTimePopShow: false,
			opTruckPopShow: false,
			truckDetailQuery: {},
			showTruckLoad: false,
			oQuery: this.$route.query,
			serialNo: '', // 委托编号
			status: '', // 委派状态
			list: [], // table渲染需要的数据
			resList: [], // 接口返回的列表数据
			addList: [], // 新增的列表数据
			isEditRows: [],
			multipleSelection: [],
			supplierList: [],
			canSave: true,
			routeName: 'ShippingTruck',
			activityKey: '',
			serviceCode: 'truck',
			exportPopShow: false, // 输出弹窗
			boxRemark: '',
			boxRemarkPopShow: false, // 备注弹窗
			currIndex: null, // 当前行
			boxRemarkType: '', // 备注弹窗类型，edit可编辑，view查看
			soList: [], //so列表
			remark: '', // 委派备注
			remarkShow: true, // 委派信息默认展开
			createShow: false, // 新增委派信息弹窗
			saveBarFixed: false,
			preTruckDate: '', // 预计拖柜日期
			flagTruck: false // 是否在设置好拖报操作后直接推送消息
		}
	},
	created() {
		this.getOrderInfo()
		this.getTruckIntrustList()
		this.getServiceInfoList()
		this.getRemark()
		this.getTruckDateInfo()
		if (this.jointShow) {
			this.getJointServiceWorkList(this.serviceCode)
		}
	},
	mounted() {
		if (window.history && window.history.pushState) {
			history.pushState(null, null, document.URL)
			window.addEventListener('popstate', this.browserBack, false)
		}
	},
	destroyed() {
		window.removeEventListener('popstate', this.browserBack, false)
	},
	computed: {
		...mapState({
			orderInfoDataObj: state => state.order.orderInfoDataObj
		}),
		isBd() {
			console.log('isJoint', this.isJoint)
			let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'doc' || this.ordDetRole === 'ac'
			return isBd || this.isJoint || this.isFinish
		},
		isOp() {
			// return this.ordDetRole === 'op'
			return this.userEditRoles.includes('op') || this.userEditRoles.includes('line_cs')
		},
		isOpTruck() {
			// return this.ordDetRole === 'op_truck'
			return this.userEditRoles.includes('op_truck')
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === 'truck')
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		isDisabledEdit(){
			// 订单状态非（完成、取消）状态，且订单还未总关账，只要服务项进度未完成,就可以编辑
			if(this.isFinish){
				return true
				// 放开已关账、已完成的限制
				// ['complete','cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || (this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes' && !this.finCloseStatusCanEdit)
			}else if(['cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || (this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes' && !this.finCloseStatusCanEdit)){
				return true
			}else{
				return false
			}
		},
		isJointOrder() {
			return this.$route.query.source === 'jointList'
		},
		opTruckId() {
			let { workAssign, jointWorkAssign, serviceInfoList } = this.orderInfoDataObj
			let id = ''
			// 协同参与人拖报或是有协同服务项指定的拖报人员
			if (jointWorkAssign && jointWorkAssign.length) {
				let serviceItem = serviceInfoList.find(item => item.serviceCode === 'truck')
				let jointWorkItem = jointWorkAssign.find(item => item.jobCode === 'op_truck')
				if (serviceItem) {
					id = serviceItem.opEmployeeId
				} else if (jointWorkItem) {
					id = jointWorkItem.employeeId
				}
			} else {
				// 主单的拖报参与人
				let item = workAssign && workAssign.find(el => el.jobCode === 'op_truck')
				if (item && item.employeeId) {
					id = item.employeeId
				}
			}
			return id
		},
		opId() {
			let { workAssign } = this.orderInfoDataObj
			let item = workAssign && workAssign.find(el => el.jobCode === 'op')
			if (item && item.employeeId) {
				return item.employeeId
			}
			return ''
		},
		bdDeptCode() {
			let { workAssign } = this.orderInfoDataObj
			let item = workAssign && workAssign.find(el => el.jobCode === 'bd')
			if (item && item.deptCode) {
				return item.deptCode
			}
			return ''
		},
		isOpTip() {
			if (!this.isOp) {
				return '非该单操作人员，不允许操作'
			}
		},
		isFinishTip() {
			if (this.isFinish) {
				return '该服务项已完成，不允许操作'
			}
		},
		soListTip() {
			if (!this.soList.length) {
				return '委派信息暂无数据，不允许操作'
			}
		},
		statusTip() {
			// 放开已关账、已完成的限制
			// ['complete','cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || (this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes' && !this.finCloseStatusCanEdit)
			if(['cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || (this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes' && !this.finCloseStatusCanEdit)) {
				return '订单状态为已取消、已完成，或是已关账，不允许操作'
			}
		},
		isJointTip() {
			if (this.isJoint) {
				return '该服务项被协同，不允许操作'
			}
		},
		isOpTruckTip() {
			if (!this.isOpTruck) {
				return '非该单拖报操作、仓储操作人员，不允许操作'
			}
		}
	},
	components: {
		CancelApplyAlert,
		CancelAlert,
		RefuseAlert,
		TopNav,
		LeftNav,
		ServiceCustInfo,
		JointWorkAssign,
		// OneServiceFee,
		ExportPop,
		RemarkPop,
		TruckLoad,
		SoInfo,
		Create,
		OpTruckPop,
		ExportTimePop
	},
	watch: {
		addList: {
			handler(nweValue, oldValue) {
				this.list = this.resList.concat(nweValue)
			},
			deep: true
		}
	},
	methods: {
		handlePushToOpTruck() {
			if (!this.opTruckId && !this.isJoint) {
				// 订单还未设置拖柜操作的参与人
				this.opTruckPopShow = true
				this.flagTruck = true
				return
			}
			this.pushToOpTruck()
		},
		pushToOpTruck() {
			pushToOpTruck({
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo
			}).then(res => {
				this.$message({
					type: 'success',
					message: '已推送'
				})
			})
		},
		opTruckPopClose(action, value) {
			if (action === 'Confirm') {
				this.updataOpTruck(value)
			} else {
				this.flagTruck = false
			}
			this.opTruckPopShow = false
		},
		updataOpTruck(value) {
			let params = {
				employeeId: value,
				orderNo: this.$route.query.orderNo,
				jobCode: 'op_truck'
			}
			addTruckOp(params).then(res => {
				this.$message.success('设置拖车人员成功')
				this.getOrderInfo()
				if (this.flagTruck && value !== this.opId) {
					this.$confirm('是否继续推送给拖车操作人员?', '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					})
						.then(() => {
							this.pushToOpTruck()
							this.flagTruck = false
						})
						.catch(() => {})
				} else {
					this.flagTruck = false
				}
			})
		},
		handleScroll() {
			// let saveBarDom = document.querySelector("#saveBar")
			let contDom = document.querySelector('#container')
			let remarkTable = document.querySelector('#remarkTable')
			let intrustTable = document.querySelector('#intrustTable')
			let truckTable = document.querySelector('#truckTable')
			let scrollTop = contDom.scrollTop
			let remarkTableHeight = remarkTable.offsetHeight
			let intrustTableHeight = intrustTable.offsetHeight
			let truckTableHeight = truckTable.offsetHeight
			if (scrollTop > remarkTableHeight + intrustTableHeight + truckTableHeight + 36 + 8) {
				// table高度和custInfo组件的高度
				this.saveBarFixed = true
			} else {
				this.saveBarFixed = false
			}
		},
		// 新增委派
		handleCreate() {
			this.createShow = true
		},
		createPopClose(action, value) {
			console.log(action, value)
			if (action === 'Confirm') {
				if (!this.opTruckId && !this.isJoint) {
					// 订单还未设置拖柜操作的参与人
					this.opTruckPopShow = true
					return
				}
				this.handleServiceInfoSave(value)
			} else {
				this.createShow = false
			}
		},
		handleDeleteServiceInfo(row) {
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = {
						groupKey: row.groupKey,
						orderNo: this.$route.query.orderNo,
						serviceCode: this.serviceCode
					}
					serviceInfoDelete(data).then(res => {
						this.$message({ type: 'success', message: '删除成功' })
						this.getServiceInfoList()
					})
				})
				.catch(() => {})
		},
		// 保存委派信息
		handleServiceInfoSave(value) {
			console.log(value)
			let data = {
				orderNo: this.$route.query.orderNo,
				serviceCode: this.serviceCode,
				infoData: []
			}
			let soInfoList = value.soInfoList
			let obj = { ...value }
			delete obj.soInfoList
			soInfoList.forEach(item => {
				let containerInfoObj = {}
				let containerType = ''
				item.containerInfo.forEach((ele, index) => {
					containerInfoObj[ele.containerType] = ele.num
					containerType += index ? `,${ele.containerType}*${ele.num}` : `${ele.containerType}*${ele.num}`
				})
				data.infoData.push({
					...obj,
					so: item.so,
					...containerInfoObj,
					containerType
				})
			})
			serviceInfoSave(data).then(res => {
				this.$message({ type: 'success', message: '保存成功' })
				this.createShow = false
				this.getServiceInfoList()

				if (this.opTruckId !== this.opId) {
					// 推送消息
					this.$confirm('是否推送给拖车操作人员?', '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					})
						.then(() => {
							this.pushToOpTruck()
						})
						.catch(() => {})
					return
				}
			})
		},
		handleToogleExpand() {
			this.remarkShow = !this.remarkShow
		},
		// 获取so列表
		getRemark() {
			remarkInfo({
				orderNo: this.$route.query.orderNo,
				serviceCode: this.serviceCode
			}).then(res => {
				this.remark = res.data.remark
			})
		},
		handleSaveRemark() {
			remarkSave({
				orderNo: this.$route.query.orderNo,
				serviceCode: this.serviceCode,
				remark: this.remark
			}).then(res => {
				this.$message({ type: 'success', message: '保存成功' })
			})
		},
		// 获取委派信息列表
		getServiceInfoList() {
			serviceInfoList({
				orderNo: this.$route.query.orderNo,
				serviceCode: this.serviceCode
			}).then(res => {
				this.soList = res.data || []
				// 按委托装柜时间倒序,委托装柜时间一样的按创建时间戳排序
				this.soList.sort((a, b) => {
					return Date.parse(b.preBoxTime) - Date.parse(a.preBoxTime)
				})
				console.log('this.soList', this.soList)
			})
		},
		hideDetail() {
			this.showTruckLoad = false
		},
		selectable(row) {
			return row.oid ? true : false
		},

		supplierFilterMehod(val) {
			this.getSupplierList(val)
		},

		supplierVisibleChange(val) {
			if (val) {
				this.getSupplierList()
			}
		},

		getSupplierList(val = '') {
			this.$store
				.dispatch('dict/querySupplierList', {
					category: 'serviceCode',
					value: 'truck',
					queryString: val
				})
				.then(data => {
					this.supplierList = data.list.map(item => {
						return Object.assign(item, {
							label: item.name,
							value: item.supplierId ? Number(item.supplierId) : ''
						})
					})
				})
		},

		// 选择车队下拉，自动填充车队联系人，联系电话
		handleSelectSupplierName(index, val) {
			if (val) {
				let findItem = this.supplierList.find(ele => ele.value === val)
				Object.assign(this.list[index], {
					supplierName: findItem ? findItem.label : ''
				})
				supplierInfo({ supplierId: val }).then(res => {
					let { contact } = res.data
					Object.assign(this.list[index], {
						supplierContact: contact && contact.length ? contact[0].name || contact[0].ename : '',
						supplierContactPhone: contact && contact.length ? contact[0].mobileNo : ''
					})
				})
			} else {
				Object.assign(this.list[index], {
					supplierName: '',
					supplierContact: '',
					supplierContactPhone: ''
				})
			}
		},

		// 委托列表
		getTruckIntrustList(index) {
			this.lsLoading = true
			fclTruckIntrustList({
				loadType: 'collect',
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo
			}).then(res => {
				let { data } = res
				this.resList = data.map(item => {
					return Object.assign(item, {
						isAdd: false,
						isEdit: false
					})
				})
				this.list = this.resList.concat(this.addList)
				// 从可编辑的行数组集合中去掉要保存的当前行
				this.isEditRows = index ? this.isEditRows.filter(item => item !== this.list[index].oid) : this.isEditRows
				this.list.forEach(item => {
					if (this.isEditRows.includes(item.oid)) {
						Object.assign(item, {
							isEdit: true
						})
					}
				})
				console.log(this.isEditRows)
			}).finally(() => {
				this.lsLoading = false
			})
		},

		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
		},

		// 获取选中的oid
		getOids() {
			let oids = []
			this.multipleSelection.map(item => {
				oids.push(item.oid)
			})
			return oids
		},

		// 新增委托计划,table增加一行
		handleAdd() {
			fclTruckIntrustGetIntrustNo().then(res => {
				this.serialNo = res.data.serialNo
				this.addList.push({
					isAdd: true,
					isEdit: false,
					orderNo: this.$route.query.orderNo,
					intrustNo: this.serialNo,
					dispatchStatus: 'undispatch',
					intrustStatus: 'unintrust',
					loadType: 'collect',
					supplierId: null,
					supplierName: '',
					supplierContact: '',
					supplierContactPhone: '',
					boxRemark: ''
				})
			})
		},

		// 编辑
		handleEdit(row) {
			row.isEdit = true
			row.isAdd = false
			this.isEditRows.push(row.oid)
			this.supplierList = [{ label: row.supplierName, value: row.supplierId }]
		},
		// 复制计划
		handleCopy(row) {
			// 复制
			this.$confirm(`是否复制此条信息?`, {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					fclTruckIntrustCopy({
						orderNo: this.$route.query.orderNo,
						intrustNo: row.intrustNo
					}).then(res => {
						this.$message.success('复制委派计划成功')
						this.getTruckIntrustList()
						let { source, jointNo } = this.$route.query
						let { orderNo, oid, intrustStatus, intrustNo, loadType, supplierName, supplierContact, supplierContactPhone, boxRemark } = res.data
						this.truckDetailQuery = {
							orderNo,
							jointNo,
							oid,
							intrustStatus,
							intrustNo,
							loadType,
							supplierName,
							supplierContact,
							supplierContactPhone,
							boxRemark
						}
						this.showTruckLoad = true
					})
				})
				.catch(() => {})
		},
		// 修改备注弹窗
		handleEditBoxRemark(row, index) {
			// console.log('row', row, index)
			this.currIndex = index
			this.boxRemark = row.boxRemark
			this.boxRemarkType = 'edit'
			this.boxRemarkPopShow = true
		},
		handleViewBoxRemark(row) {
			this.boxRemark = row.boxRemark
			this.boxRemarkType = 'view'
			this.boxRemarkPopShow = true
		},
		boxRemarkPopClose(action, value) {
			// console.log(action, value)
			this.boxRemarkPopShow = false
			if (action === 'Confirm') {
				this.list[this.currIndex].boxRemark = value.boxRemark
				this.$set(this.list[this.currIndex], 'boxRemark', value.boxRemark)
				// console.log('list', this.list)
			}
		},
		// 关闭输出时间弹窗
		exportTimePopClose(action, value) {
			this.exportTimePopShow = false
			if (action === 'Confirm') {
				this.exportPopShow = true
			}
		},

		handleCancel(row) {
			row.isEdit = false
			row.isAdd = false
			this.isEditRows = this.isEditRows.filter(item => item != row.oid)
			console.log(this.isEditRows)
		},

		validate() {
			return true
		},

		// 新增保存
		handleSave(row, sIndex) {
			let data = {
				oid: row.oid,
				orderNo: row.orderNo,
				intrustNo: row.intrustNo,
				loadType: row.loadType,
				supplierId: row.supplierId,
				supplierName: row.supplierName,
				supplierContact: row.supplierContact,
				supplierContactPhone: row.supplierContactPhone,
				boxRemark: row.boxRemark
			}
			data.jointNo = this.$route.query.jointNo
			// delete(data.addShow)
			// delete(data.intrustStatus)
			// delete(data.dispatchStatus)

			if (!this.validate() || !this.canSave) return
			this.canSave = false
			fclTruckIntrustSave(data)
				.then(res => {
					this.$message({
						type: 'success',
						message: '保存成功',
						duration: 1000,
						onClose: () => {
							// this.canSave = true
							// // 新增保存回调
							// if (!row.oid) {
							// 	let len = this.resList.length
							// 	this.$delete(this.addList, sIndex - len)
							// }
							// this.getTruckIntrustList(sIndex)
						}
					})
					this.canSave = true
					// 新增保存回调
					if (!row.oid) {
						let len = this.resList.length
						this.$delete(this.addList, sIndex - len)
					}
					this.getTruckIntrustList(sIndex)
				})
				.catch(err => {
					setTimeout(() => {
						this.canSave = true
					}, 2000)
				})
		},

		// 详情
		handleInfo(row) {
			console.log('row', row, row.intrustStatus)
			let { source, jointNo } = this.$route.query
			let { orderNo, intrustNo, loadType, supplierName, supplierContact, supplierContactPhone, boxRemark, oid, intrustStatus } = row
			this.truckDetailQuery = {
				orderNo,
				jointNo,
				oid,
				intrustStatus,
				intrustNo,
				loadType,
				supplierName,
				supplierContact,
				supplierContactPhone,
				boxRemark
			}
			this.showTruckLoad = true
		},

		// 删除
		handleDelete(row, sIndex) {
			if (!row.oid) {
				// 获取新增列表的下标，删除新增数组的该下标元素
				let len = this.resList.length
				this.$delete(this.addList, sIndex - len)
				return
			}

			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = {
						oid: row.oid,
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo
					}
					return fclTruckIntrustDelete(data)
				})
				.then(response => {
					this.getTruckIntrustList(sIndex)
					this.$message({ message: '删除成功', type: 'success' })
				})
				.catch(() => {})
		},

		// 派车完成
		handleUpdateDispatchStatus() {
			if (!this.getOids()) return this.$message.warning('请先选择委派计划')
			let data = Object.assign(
				{},
				{
					oids: this.getOids(),
					status: 'done',
					orderNo: this.$route.query.orderNo,
					jointNo: this.$route.query.jointNo
				}
			)
			truckIntrustUpdateDispatchStatus(data).then(res => {
				this.$message({
					type: 'success',
					message: '派车完成成功',
					duration: 1000,
					onClose: () => {
						this.getTruckIntrustList()
					}
				})
			})
		},

		// 委派状态修改
		handleUpdateIntrustStatus(val) {
			if (!this.getOids().length) {
				this.status = ''
				return this.$message.warning('请先选择委派计划')
			}
			// if (this.getOids().length === 1 && val === 'dispatched') {
			// }
			this.$confirm('是否确认修改状态?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return fclTruckIntrustUpdateIntrustStatus({
						oids: this.getOids(),
						status: val,
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo
					})
				})
				.then(response => {
					this.$message({
						type: 'success',
						message: '委派状态修改成功',
						duration: 1000,
						onClose: () => {
							this.status = ''
							this.getTruckIntrustList()
						}
					})
				})
				.catch(err => {
					this.status = ''
				})
		},

		jointWorkAssignCallback() {
			this.getJointServiceWorkList(this.serviceCode)
		},

		// 打开输出弹窗
		handleOpenExportPop() {
			if (this.multipleSelection.length !== 1)
				return this.$message({
					type: 'warning',
					message: '请选择一条要导出的拖车'
				})
			// this.exportTimePopShow = true
			this.exportPopShow = true
		},
		exportPopClose(action, value) {
			console.log(action, value)
			if (action === 'Confirm') {
				this.handleExport(value)
			} else {
				this.exportPopShow = false
			}
		},
		// 输出
		handleExport(value) {
			this.$store
				.dispatch('order/exportBlobFile', {
					uri: '/order/shipping/fclTruckIntrust/export',
					data: {
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo,
						oid: this.multipleSelection[0].oid,
						docType: value.docType,
						vgmTime: value.vgmTime
					}
				})
				.then(res => {
					this.exportPopShow = false
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = `拖车委托单${this.$route.query.orderNo}.` + value.docType.toLowerCase()
					link.click()
				})
		},
		getTruckDateInfo() {
			getTruckDate({ orderNo: this.$route.query.orderNo }).then(res => {
				if (res.data) {
					this.preTruckDate = res.data.preTruckDate
				}
			})
		},
		truckTimeChange(val) {
			if (val) {
				const data = {
					orderNo: this.$route.query.orderNo,
					preTruckDate: this.preTruckDate
				}
				saveTruckDate(data).then(res => {
					console.log('保存预计拖柜时间', val)
				})
			}
		}
	}
}
</script>
<style lang="scss">
@import '../../less/index.scss';
#shippingTruck {
	// .edit-container,
	// .component-main-cont {
	// 	height: unset;
	// }
	.component-cont {
		padding: 10px 20px;
		border-top: 8px solid #f5f5f5;
	}
	.finance-one-service-fee-separator {
		display: none;
	}
	.remark-container {
		background-color: #fff;
		margin-top: 8px;
		.remark-tit-row {
			display: flex;
			justify-content: space-between;
			height: 28px;
			line-height: 20px;
			padding: 4px 20px;
			border-bottom: 1px solid #e6ebf5;
			.tit {
				display: block;
				font-weight: bold;
				font-size: 12px;
			}
			.operate {
				display: flex;
				.expand {
					cursor: pointer;
				}
				.trusk-time {
					display: flex;
				}
			}
		}
		.remark-row {
			padding: 8px 20px;
			overflow: hidden;
		}
	}
	.operateBtn-tip{
		padding: 0; 
		display: inline-block;
	}
}
#shippingTruck .remark-con {
	// display: flex;
}
#shippingTruck .remark-con .txt {
	display: inline-block;
	overflow: hidden;
	width: 100%;
	height: 16px;
	white-space: nowrap;
	text-overflow: ellipsis;
}
#shippingTruck .remark-con .underline {
	padding: 0;
}
</style>
