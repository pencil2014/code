<template>
	<div class="edit-container order-book fullWrap" id="polLtl" v-loading="lsLoading"
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
				<div class="detail-container detail-container-pol flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="routeName" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<div class="service-container" id="container" @scroll="handleScroll">
							<ServiceCustInfo :orderInfo="orderInfo" :serviceCode="serviceCode" @info="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>
							<div class="component-cont table-com-layout" id="intrustTable">
								<div class="mb04 between h20">
									<div class="ft12 bold">散车</div>
									<div>
										<ButtonTip
											btnType="default" 
											:btnDisabled="isBd || isDisabledEdit" 
											btnText="输出派车单" 
											:tipContent="isOpTruckAndOpTip || isJointTip || isFinishTip || statusTip" 
											class="operateBtn-tip mr10" 
											@click="handleOpenExportPop">
										</ButtonTip>
										<!-- <el-button size="mini" type="default" :disabled="isBd || isDisabledEdit" class="mr10" @click="handleOpenExportPop">输出派车单</el-button> -->
										<span>委派状态：</span>
										<el-select style="width: 120px" placeholder="请选择" size="mini" v-model="status" @change="handleUpdateIntrustStatus" :disabled="isBd || isDisabledEdit">
											<el-option v-for="(item, index) in dictMap.truckIntrustStatus" :key="index" :label="item.label" :value="item.value"></el-option>
										</el-select>
										<ButtonTip
											btnType="primary" 
											:btnDisabled="isBd || isDisabledEdit" 
											btnText="新增派车" 
											:tipContent="isOpTruckAndOpTip || isJointTip || isFinishTip || statusTip" 
											class="operateBtn-tip ml10" 
											@click="handleAdd">
										</ButtonTip>
										<!-- <el-button size="mini" type="primary" class="ml10" @click="handleAdd" :disabled="isBd || isDisabledEdit">新增派车</el-button> -->
									</div>
								</div>
								<el-table ref="multipleTable" fit style="width: 100%" :data="list" @selection-change="handleSelectionChange">
									<el-table-column type="selection" :selectable="selectable"></el-table-column>
									<el-table-column prop="intrustNo" label="委托编号" align="center" width="140"> </el-table-column>
									<el-table-column prop="intrustStatus" label="委派状态" align="center">
										<template slot-scope="scope">
											{{ scope.row.intrustStatus | intrustStatusFilter }}
										</template>
									</el-table-column>
									<el-table-column prop="dispatchType" label="派车类型" align="center">
										<template slot-scope="scope">
											<span>{{ scope.row.dispatchType === 'receive' ? '散车收货' : scope.row.dispatchType === 'deliver' ? '散车派送' : ''}}</span>
										</template>
									</el-table-column>
									<el-table-column prop="supplierName" label="车队" align="center" width="150">
									</el-table-column>
									<el-table-column prop="supplierContact" label="车队联系人" align="center">
									</el-table-column>
									<el-table-column prop="supplierContactPhone" label="车队联系人电话" align="center">
									</el-table-column>
									<el-table-column prop="boxRemark" label="注意事项" align="center" show-overflow-tooltip>
										<template slot-scope="scope">
											<span class="remark-style">{{scope.row.boxRemark}}</span>
										</template>
									</el-table-column>
									<el-table-column label="操作" width="100" align="center" fixed="right">
										<template slot-scope="scope">
											<div class="operate-group">
												<el-button @click="handleInfo(scope.row)" type="text" size="mini">详情</el-button>
												<ButtonTip
													btnType="text" 
													:btnDisabled="isBd || isDisabledEdit" 
													btnText="删除" 
													:tipContent="isOpTruckAndOpTip || isJointTip || isFinishTip || statusTip" 
													class="operateBtn-tip" 
													btnClassName="red"
													@click="handleDelete(scope.row, scope.$index)">
												</ButtonTip>
												<!-- <el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || isDisabledEdit">删除</el-button> -->
											</div>
										</template>
									</el-table-column>
								</el-table>
							</div>
							<!-- 拖车详情 -->
							<TruckLoad @hideDetail="hideDetail" :isOpTruckAndOpTip="isOpTruckAndOpTip" :isJointTip="isJointTip" :isFinishTip="isFinishTip" :statusTip="statusTip" :isDisabledEdit="isDisabledEdit" :detailData="detailData" :orderInfo="orderInfo" :saveBarFixed="saveBarFixed" v-if="showTruckLoad" />
							<!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="'pol_ltl'" /> -->
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
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel, getServiceCode } from '@/utils/tools'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { baseSupplierList } from '@/api/base'
import { orderInfo, orderJointInfo } from '@/api/order/list'
import { supplierInfo } from '@/api/crm/supplier'
import { scatterTruckIntrustList, scatterTruckIntrustSaveBulk, scatterTruckIntrustDelete, scatterTruckIntrustBulkDetail, scatterTruckIntrustGetWhBulkNo, scatterTruckIntrustUpdateIntrustStatus } from '@/api/order/shippingTruck'
import CancelApplyAlert from '../components/cancelApplyAlert'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import ServiceCustInfo from '../components/serviceCustInfo'
import JointWorkAssign from '@/views/order/order/jointList/components/workAssign'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'
import ExportPop from './components/exportPop'
import TruckLoad from './truckLoad'

export default {
	filters: {
		intrustStatusFilter(status) {
			return getDictLabel('truckIntrustStatus', status)
		},
	},
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			truckDetailQuery: {},
			showTruckLoad: false,
			oQuery: this.$route.query,
			status: '', // 委派状态
			list: [], // table渲染需要的数据
			multipleSelection: [],
			canSave: true,
			routeName: this.$route.name,
			activityKey: '',
			serviceCode: 'pol_ltl',
			exportPopShow: false, // 输出弹窗
			detailData: {},
			type: '', // 新增或编辑标识
			saveBarFixed: false
		}
	},
	created() {
		this.getOrderInfo()
		this.getTruckIntrustList()
		if (this.jointShow) {
			this.getJointServiceWorkList(this.serviceCode)
		}
	},
	mounted() {
		if (window.history && window.history.pushState) {
			history.pushState(null, null, document.URL);
			window.addEventListener('popstate', this.browserBack, false);
		}
	},
	destroyed(){
  	window.removeEventListener('popstate', this.browserBack, false);
	},
	computed: {
		...mapState({
			finCloseStatusCanEdit: state => state.order.finCloseStatusCanEdit,
		}),
		isBd() {
			console.log('isBd', this.ordDetRole, this.isJoint)
			let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'doc' || this.ordDetRole === 'ac' || !(this.userEditRoles.includes('op') || this.userEditRoles.includes('op_truck'))
			return isBd || this.isJoint || this.isFinish
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === this.serviceCode)
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
		isFinishTip() {
			if (this.isFinish) {
				return '该服务项已完成，不允许操作'
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
		isOpTruckAndOpTip() {
			if (!(this.isOpTruck || this.isOp)) {
				return '非该单拖报操作人员或是仓储操作或是操作人员，不允许操作'
			}
		},
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
		TruckLoad
	},
	watch: {
	},
	methods: {
		handleScroll() {
			// let saveBarDom = document.querySelector("#saveBar")
			let contDom = document.querySelector("#container")
			let intrustTable = document.querySelector("#intrustTable")
			let scrollTop  = contDom.scrollTop
			let intrustTableHeight = intrustTable.offsetHeight
			if (scrollTop >  intrustTableHeight +36 +8) {	// table高度和custInfo组件的高度
				this.saveBarFixed = true
			} else {
				this.saveBarFixed = false
			}
		},
		hideDetail(type) {
			this.showTruckLoad = false
			if (type === 'save') {
				this.getTruckIntrustList()
			}
		},

		selectable(row) {
			return row.oid ? true : false
		},

		// 委托列表
		getTruckIntrustList() {
			scatterTruckIntrustList({
				loadType: 'scatter',
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo
			}).then(res => {
				let { data } = res
				this.list = data
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

		// 新增
		handleAdd() {
			scatterTruckIntrustGetWhBulkNo().then(res => {
				this.detailData = {intrustNo: res.data.serialNo}
			})
			this.showTruckLoad = true
			this.type = 'add'
		},

		// 新增保存
		handleSave(row, sIndex) {
			
		},

		// 详情
		handleInfo(row) {
			let data = { oid: row.oid, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }
			scatterTruckIntrustBulkDetail(data).then(res => {
				this.detailData = res.data
			})
			this.showTruckLoad = true
			this.type = 'edit'
		},

		// 删除
		handleDelete(row, sIndex) {
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
					return scatterTruckIntrustDelete(data)
				})
				.then(response => {
					if (row.intrustNo === this.detailData.intrustNo) {
						this.showTruckLoad = false
					}
					this.getTruckIntrustList()
					this.$message({ message: '删除成功', type: 'success' })
				})
				.catch(() => {})
		},

		// 委派状态修改
		handleUpdateIntrustStatus(val) {
			if (!this.getOids().length) {
				this.status = ''
				return this.$message.warning('请先选择委派计划')
			}
			this.$confirm('是否确认修改状态?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return scatterTruckIntrustUpdateIntrustStatus({
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
			if (this.multipleSelection.length !== 1) return this.$message({ type: 'warning', message: '请选择一条要导出的散车' })
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
					uri: '/order/shipping/scatterTruckIntrust/export',
					data: {
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo,
						oid: this.multipleSelection[0].oid,
						docType: value.docType
					}
				})
				.then(res => {
					this.exportPopShow = false
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = `拖车委托单${this.$route.query.orderNo}.` + value.docType.toLowerCase()
					link.click()
				})
		}
	}
}
</script>
<style lang="scss">
@import '../../less/index.scss';
#polLtl {
	.detail-container-pol{
		min-height: 92vh;
	}
	.edit-container,
	.component-main-cont {
		height: unset;
	}
	.component-cont {
		padding: 10px 20px;
	}
	.finance-one-service-fee-separator {
		display: none;
	}
	.operateBtn-tip{
		padding: 0; 
		display: inline-block;
	}
}
#polLtl .remark-con {
	display: flex;
}
#polLtl .remark-con .txt {
	display: inline-block;
	overflow: hidden;
	width: 120px;
	height: 16px;
	white-space: nowrap;
	text-overflow: ellipsis;
}
#polLtl .remark-con .underline {
	padding: 0;
}
#polLtl .remark-style{
	overflow: hidden; 
	white-space: nowrap;
	text-overflow: ellipsis;
	display: inline-block;
	width: 100%;
	line-height: 16px;
}
</style>
