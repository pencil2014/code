<template>
	<!-- 进仓计划 -->
	<div id="warehouseInplan" class="edit-row" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div class="default-table" id="tableCont">
			<div class="warehouse-btnGroup">
				<ButtonTip
					btnType="primary" 
					:btnDisabled="(isBd && !isImportJoint) || isDisabledEdit" 
					btnText="一键生成进仓" 
					:tipContent="isDocTip || isJointTip || isFinishTip || statusTip" 
					class="operateBtn-tip ml10" 
					@click="handleInBatch">
				</ButtonTip>
				<!-- <el-button @click="handleInBatch" type="primary" size="mini" :disabled="(isBd && !isImportJoint) || isDisabledEdit">一键生成进仓</el-button> -->
				<!-- <el-button @click="handleAddCar" type="default" size="mini" :disabled="isBd || !serviceList.includes('pod_fcl_delivery')" v-if="isFcl">新增派车</el-button>
				<el-button @click="handleAddCar" type="default" size="mini" :disabled="isBd" v-if="isLcl">新增派车</el-button> -->
				<ButtonTip
					btnType="default" 
					:btnDisabled="(isBd && !isImportJoint) || isDisabledEdit" 
					btnText="新增派车" 
					:tipContent="isDocTip || isJointTip || isFinishTip || statusTip" 
					class="operateBtn-tip ml10" 
					@click="handleAddCar">
				</ButtonTip>
				<!-- <el-button @click="handleAddCar" type="default" size="mini" :disabled="(isBd && !isImportJoint) || isDisabledEdit">新增派车</el-button> -->
				<ButtonTip
					btnType="primary" 
					:btnDisabled="(isBd && !isImportJoint) || isDisabledEdit" 
					btnText="新增进仓计划" 
					:tipContent="isDocTip || isJointTip || isFinishTip || statusTip" 
					class="operateBtn-tip ml10" 
					@click="handleInPlan">
				</ButtonTip>
				<!-- <el-button @click="handleInPlan" type="primary" size="mini" :disabled="(isBd && !isImportJoint) || isDisabledEdit">新增进仓计划</el-button> -->
			</div>
			<div class="table-com-layout" style="padding: 10px 0 0 0">
				<el-table class="over-tip-table" fit :data="tableData" @selection-change="handleSelectionChange" align="center" style="width: 100%">
					<el-table-column type="selection" width="55"></el-table-column>
					<el-table-column prop="planNo" label="进仓计划编号" align="center" width="140"> </el-table-column>
					<el-table-column prop="planEnterTime" label="预计进仓时间" align="center" width="150"> </el-table-column>
					<el-table-column prop="status" label="进仓状态" align="center">
						<template slot-scope="scope">
							{{ scope.row.status | statusFilter }}
						</template>
					</el-table-column>
					<el-table-column prop="whName" label="进仓仓库" align="center"> </el-table-column>
					<el-table-column prop="whSupplierName" label="供应商" align="center" show-overflow-tooltip></el-table-column>
					<el-table-column prop="positionNo" label="仓位编码" align="center"> </el-table-column>
					<el-table-column prop="custName" label="客户名称" align="center" width="200"> </el-table-column>
					<el-table-column prop="quantity" label="预计进仓总件数" align="center" width="110"> </el-table-column>
					<el-table-column prop="weight" label="预计进仓总毛重(KGS)" align="center" width="150"> </el-table-column>
					<el-table-column prop="volume" label="预计进仓总体积(CBM)" align="center" width="150"> </el-table-column>
					<!-- <el-table-column prop="packageType" label="预计进仓包装" align="center" width="100">
            <template slot-scope="scope">
              {{scope.row.packageType | packageTypeFilter}}
            </template>  
          </el-table-column> -->
					<el-table-column prop="remark" label="进仓要求" align="center" width="250" show-overflow-tooltip> </el-table-column>
					<el-table-column label="操作" width="180" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<ButtonTip
									btnType="text" 
									:btnDisabled="!scope.row.planNo" 
									btnText="详情" 
									:tipContent="noPlanNoTip(scope.row)" 
									class="operateBtn-tip" 
									@click="handleDetail(scope.row)">
								</ButtonTip>
								<!-- <el-button @click="handleDetail(scope.row)" type="text" :disabled="!scope.row.planNo" size="mini">详情</el-button> -->
								<ButtonTip
									btnType="text" 
									:btnDisabled="(isBd && !isImportJoint) || !scope.row.planNo || isDisabledEdit" 
									btnText="删除" 
									:tipContent="isDocTip || isJointTip || isFinishTip || statusTip || noPlanNoTip(scope.row)" 
									class="operateBtn-tip" 
									btnClassName="red"
									@click="handleDelete(scope.row)">
								</ButtonTip>
								<!-- <el-button @click="handleDelete(scope.row)" type="text" size="mini" :disabled="(isBd && !isImportJoint) || !scope.row.planNo || isDisabledEdit">删除</el-button> -->
								<ButtonTip
									btnType="text" 
									:btnDisabled="(isBd && !isImportJoint) || !scope.row.planNo || isDisabledEdit" 
									btnText="实际进仓" 
									:tipContent="isDocTip || isJointTip || isFinishTip || statusTip || noPlanNoTip(scope.row)" 
									class="operateBtn-tip" 
									@click="handleIn(scope.row)">
								</ButtonTip>
								<!-- <el-button @click="handleIn(scope.row)" type="text" size="mini" :disabled="(isBd && !isImportJoint) || !scope.row.planNo || isDisabledEdit">实际进仓</el-button> -->
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div style="display: flex;flex-direction: row-reverse">
				<!-- <el-pagination layout="total, prev, pager, next, jumper" size="mini" background @current-change="handleCurrentChange" :current-page.sync="tableQuery.currPage" :page-size="10" :total="tableQuery.total"> </el-pagination> -->
				<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
			</div>
		</div>
		<!-- 新增计划进仓 -->
		<template v-if="detailShow">
			<!-- 出口整箱，进口整箱 -->
			<Detail :isDocTip="isDocTip" :isJointTip="isJointTip" :isFinishTip="isFinishTip" :statusTip="statusTip" :detailData="formData" :saveBarFixed="saveBarFixed" :isDisabledEdit="isDisabledEdit" @close="close" @handleConfirm="handleSave" v-if="isFcl"></Detail>
			<ImportDetail :isDocTip="isDocTip" :isJointTip="isJointTip" :isFinishTip="isFinishTip" :statusTip="statusTip" :detailData="formData" :saveBarFixed="saveBarFixed" :isDisabledEdit="isDisabledEdit" @close="close" @handleConfirm="handleSave" v-if="isImportLcl || isLcl"></ImportDetail>
		</template>
		<!-- 实际进仓 -->
		<template v-if="inShow">
			<InDialog :detailData="in_formData" @close="close" @handleConfirm="handleInBack" v-if="isFcl"></InDialog>
			<ImportInDialog :detailData="in_formData" @close="close" @handleConfirm="handleInBack" v-if="isImportLcl || isLcl"></ImportInDialog>
		</template>
		<div v-if="showAddDelivery">
			<AddDelivery :activityType="activityType" @close="hideAddDelivery" :whName="whName" :outPlanNo="outPlanNo" :addType="'in'"></AddDelivery>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { getDictLabel, deleteAlert, copyArry } from '@/utils/tools'
import { inplanReqno, inplanSave, inplanList, inplanInfo, inplanDelete, inSave, inBatchSave } from '@/api/order/podService/warehouse'

import Detail from './components/detail'
import ImportDetail from './components/importDetail'
import InDialog from './components/inDialog'
import ImportInDialog from './components/importInDialog'

import AddDelivery from '../components/addDelivery'
import Pagination from '@/components/Base/Table/newPagination'

export default {
	filters: {
		statusFilter(status) {
			return getDictLabel('warehouseInplanStatus', status)
		},
		packageTypeFilter(packageType) {
			return getDictLabel('packageType', packageType)
		}
	},
	data() {
		return {
			showAddDelivery: false,
			tableConfig: {
				// 分页
				pagination: {
					pageSize: 10,
					show: true,
					total: 0,
					hasNextPage: false,
					hasPreviousPage: false,
					isFirstPage: false,
					isLastPage: false
				}
			},
			tableQuery: {
				pageSize: 10,
				currPage: 1,
				total: 0
			},
			oQuery: this.$route.query,
			tableData: [],
			multipleSelection: [], // 多选集合
			detailShow: false,
			formData: {}, // 计划进仓详情数据
			planNo: '',
			inShow: false,
			in_formData: {},
			canSave: true,
			serviceList: []
		}
	},
	created() {
		let serviceListStr = sessionStorage.getItem('serviceListStr')
		this.serviceList = JSON.parse(serviceListStr)
		// this.getList()
	},
	mounted() {},

	watch: {
		activityType: {
			handler(val) {
				console.log('🚀 ~ val', val)
				this.getList()
				this.detailShow = false
			},
			immediate: true
		}
	},
	computed: {
		whName() {
			let arr = []
			for (let i = 0; i < this.multipleSelection.length; i++) {
				if (this.multipleSelection[i].whName) {
					if (!arr.includes(this.multipleSelection[i].whName)) {
						arr.push(this.multipleSelection[i].whName)
					}
				}
			}
			return arr.join(',')
		},
		outPlanNo() {
			let arr = []
			for (let i = 0; i < this.multipleSelection.length; i++) {
				if (this.multipleSelection[i].planNo) {
					arr.push(this.multipleSelection[i].planNo)
				} else {
					arr.push('')
				}
			}
			return arr.join(',')
		},
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userEditRoles: state => state.order.orderList.userEditRoles,
			serviceInfoList: state => state.order.serviceInfoList,
			specialEditRoles: state => state.order.orderList.specialEditRoles,
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isOpWh() {
			return (this.specialEditRoles.includes('op_wh') || this.specialEditRoles.includes('op_customs')) && this.isImport
		},
		isEpricing() {
			return this.userEditRoles.includes('epricing')
		},
		isEcs() {
			return this.userEditRoles.includes('ecs')
		},
		isBd() {
			let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'ac' || this.ordDetRole === 'op' || (this.ordDetRole === 'op_truck' && !this.isOpWh) || (!this.isDoc && !this.isEpricing && !this.isEcs && !this.isOpWh)
			let findItem = this.tabMenus.find(item => item.code === 'pod_warehouse')
			let isJoint = findItem ? findItem.isJoint : false
			if (this.$route.query.jointNo) {
				isJoint = false
			}
			return isBd || isJoint || this.isFinish
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === 'pod_warehouse')
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		isDisabledEdit() {
			// 订单状态非（完成、取消）状态，且订单还未总关账，只要服务项进度未完成,就可以编辑
			if (this.isFinish) {
				return true
			} else if (['complete', 'cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus)) {
				return true
			} else {
				return false
			}
		},
		isLcl() {
			return ['ship_export_lcl', 'ship_bulk_ro'].includes(this.orderInfo.businessType)
		},
		isFcl() {
			return ['ship_export_fcl', 'ship_import_fcl'].includes(this.orderInfo.businessType)
		},
		isImportLcl() {
			return ['ship_import_lcl', 'ship_oversea_wh'].includes(this.orderInfo.businessType)
		},
		// 20220509特殊处理为进口协同单的服务项权限都放开
		isImportJoint() {
			return ['ship_import_fcl', 'ship_import_lcl', 'ship_oversea_wh'].includes(this.orderInfo.businessType) && ['jointList', 'whJointList'].includes(this.$route.query.source)
		},
		// 业务类型为进口，海外仓的,报关单
		isImport() {
			return ['ship_import_fcl', 'ship_import_lcl', 'ship_oversea_wh','ship_customs','ship_export_customs','ship_import_customs'].includes(this.orderInfo.businessType)
		},
		// 业务类型为出口的
		isExport() {
			return ['ship_export_fcl', 'ship_export_lcl'].includes(this.orderInfo.businessType)
		},
		// 业务类型为散杂滚装
		isBulkRo() {
			return ['ship_bulk_ro'].includes(this.orderInfo.businessType)
		},
		isFinishTip() {
			if (this.isFinish) {
				return '该服务项已完成，不允许操作'
			}
		},
		isJointTip() {
			if (this.isJoint) {
				return '该服务项被协同，不允许操作'
			}
		},
		isDocTip() {
			// 出口整箱，非文件，海外客服，海外商务
			if (this.isExport || this.isBulkRo) {
				if (!this.isDoc && !this.isEpricing && !this.isEcs) {
					return '非文件，海外客服，海外商务，不允许操作'
				}
			}
			// 海外仓，非操作，海外客服，海外商务
			if (['ship_oversea_wh'].includes(this.orderInfo.businessType)) {
				if (!this.isDoc && !this.isEpricing && !this.isEcs) {
					return '非操作，海外客服，海外商务，不允许操作'
				}
			}
			// 进口整箱，非操作，仓储操作，海外客服，海外商务
			if (['ship_import_fcl'].includes(this.orderInfo.businessType)) {
				if (!this.isDoc && !this.isOpWh && !this.isEpricing && !this.isEcs) {
					return '非操作，仓储操作，海外客服，海外商务，不允许操作'
				}
			}
			// 进口拼箱，非操作，仓储操作，拖报，海外客服，海外商务
			if (['ship_import_lcl'].includes(this.orderInfo.businessType)) {
				if (!this.isDoc && !this.isOpWh && !this.isEpricing && !this.isEcs) {
					return '非操作，仓储操作，拖报操作，海外客服，海外商务，不允许操作'
				}
			}
			// 报关单，非关务操作
			if (['ship_customs','ship_export_customs','ship_import_customs'].includes(this.orderInfo.businessType)) {
				if (this.ordDetRole !== 'op_truck') {
					return '非关务操作，不允许操作'
				}
			}
		},
		statusTip() {
			if (['complete', 'cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus)) {
				return '订单状态为已取消、已完成，不允许操作'
			}
		}
	},

	props: {
		activityType: {
			type: String,
			default: ''
		},
		orderInfo: {
			type: Object,
			default: () => ({})
		},
		tabMenus: {
			type: Array,
			default: () => []
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		},
		isJoint: {
			type: Boolean,
			default: false
		}
	},
	components: {
		Detail,
		ImportDetail,
		InDialog,
		ImportInDialog,
		AddDelivery,
		Pagination
	},
	methods: {
		noPlanNoTip(row) {
			if (!row.planNo) {
				return '无进仓计划编号，不允许操作'
			}
		},
		openDetail() {
			if (this.detailShow == true) {
				this.detailShow = false
				setTimeout(() => {
					this.detailShow = true
				}, 200)
			} else {
				this.detailShow = true
			}
		},
		hideAddDelivery(action) {
			if (action === 'Confirm') {
				this.getList()
			}
			this.showAddDelivery = false
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		// 分页
		handleSizeChange(val) {
			// this.tableQuery.pageSize = val
			this.getList()
		},
		handleCurrentChange(val) {
			// this.tableQuery.currPage = val
			this.getList()
		},
		// 进仓计划列表
		getList() {
			this.lsLoading = true
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_warehouse_bonded' ? 'Y' : 'N'
			inplanList({ isBonded, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo, currPage: this.tableQuery.currPage, pageSize: this.tableQuery.pageSize }).then(res => {
				this.tableData = res.data.list
				this.tableQuery.total = res.data.totalCount

				this.tableQuery.currPage = res.data.currPage
				this.tableConfig.pagination.hasNextPage = res.data.hasNextPage
				this.tableConfig.pagination.hasPreviousPage = res.data.hasPreviousPage
				this.tableConfig.pagination.isFirstPage = res.data.isFirstPage
				this.tableConfig.pagination.isLastPage = res.data.isLastPage
				this.tableConfig.pagination.total = res.data.totalCount
				this.tableQuery.pageSize = res.data.pageSize
			}).finally(() => {
				this.lsLoading = false
			})
		},
		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
			console.log(this.multipleSelection)
		},
		// 新增派车计划
		handleAddCar() {
			if (!this.multipleSelection.length) {
				return this.$message.warning('请先选择数据!')
			}

			this.showAddDelivery = true
			return
			// table页跳转到 '散车收货'
			// this.$store.dispatch("order/changePodWarehouseComp", "PodLtlDelivery")

			// 跳转到目的港拖柜派送服务
			// this.$emit('podWarehouseCallback', {
			//   component: 'PodFclDelivery',
			//   code: 'pod_fcl_delivery'
			// })
			// this.$store.dispatch('tagsView/delView', this.$route)
			// this.$router.push({
			// 	name: 'PodFclDelivery',
			// 	params: {
			// 		orderNo: this.$route.query.orderNo
			// 	},
			// 	query: this.$route.query
			// })
		},
		// 新增进仓计划
		handleInPlan() {
			this.openDetail()
			let { custid, custName } = this.orderInfo
			inplanReqno().then(res => {
				let planNo = res.data.seqNo || ''
				this.formData = Object.assign(
					{},
					{
						custid,
						custName,
						planNo,
						cargoInfoList: [],
						whSupplierName:''
					}
				)
			})
		},
		// 批量进仓
		handleInBatch() {
			if (this.multipleSelection.some(item => item.status != 'init')) return this.$message.warning('只能选择未进仓的数据!')
			let data = this.multipleSelection.map(item => item.oid)
			if (data.length == 0) return this.$message.warning('请先选择数据!')
			inBatchSave(data).then(res => {
				if (res.msg === 'success') {
					this.$message.success('一键生成进仓成功!')
					this.getList()
				}
			})
		},
		// 详情
		handleDetail(row) {
			let { orderNo, jointNo } = this.oQuery
			this.planNo = row.planNo
			inplanInfo({ orderNo, jointNo, planNo: row.planNo }).then(res => {
				this.formData = Object.assign({}, copyArry(res.data), {
					status: row.status
				})
				Object.assign(this.formData, {
					whId: res.data.whId === 0 ? '' : res.data.whId
				})
				this.openDetail()
			})
		},
		// 删除
		handleDelete(row) {
			this.$confirm('是否确认删除该条信息?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = {
						planNo: row.planNo,
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo
					}
					return inplanDelete(data)
				})
				.then(response => {
					// 只有一条数据的时候 删除完 取第一页的数据
					if (this.tableData.length === 1) {
						this.tableQuery.currPage = 1
					}
					this.$message({
						message: '删除成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							if (this.planNo === row.planNo) {
								this.detailShow = false
							}
							this.getList()
						}
					})
				})
				.catch(() => {
					this.getList()
				})
		},
		// 实际进仓
		handleIn(row) {
			let { orderNo, jointNo } = this.oQuery
			inplanInfo({ orderNo, jointNo, planNo: row.planNo }).then(res => {
				this.in_formData = Object.assign({}, copyArry(res.data))
				this.inShow = true
			})
		},
		close() {
			this.detailShow = false
			this.inShow = false
		},
		handleSave(value) {
			console.log(value)
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_warehouse_bonded' ? 'Y' : 'N'
			let data = Object.assign({}, value, { isBonded })
			data.orderNo = this.oQuery.orderNo
			data.jointNo = this.oQuery.jointNo
			if (!this.canSave) return
			this.canSave = false
			inplanSave(data)
				.then(res => {
					this.$message({
						type: 'success',
						message: '保存成功',
						duration: 1000,
						onClose: () => {
							this.canSave = true
							this.detailShow = false
							this.getList()
						}
					})
				})
				.catch(err => {
					setTimeout(() => {
						this.canSave = true
					}, 2000)
				})
		},
		// 实际进仓弹窗回调
		handleInBack(data) {
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_warehouse_bonded' ? 'Y' : 'N'
			data.isBonded = isBonded
			data.jointNo = this.oQuery.jointNo
			data.orderNo = this.oQuery.orderNo
			if (!this.canSave) return
			this.canSave = false
			inSave(data)
				.then(res => {
					this.inShow = false
					this.$message({
						type: 'success',
						message: '保存成功',
						duration: 1000,
						onClose: () => {
							this.canSave = true
							this.$emit('changeComponent', 'WarehouseIn', data)
						}
					})
				})
				.catch(err => {
					setTimeout(() => {
						this.canSave = true
					}, 2000)
				})
		}
	}
}
</script>

<style lang="scss">
#warehouseInplan {
	.over-tip-table .cell {
		overflow: hidden;
	}
	.warehouse-btnGroup {
		position: absolute;
		right: 20px;
		margin-top: -20px;
	}
	.operateBtn-tip{
		padding: 0; 
		display: inline-block;
	}
}
</style>
