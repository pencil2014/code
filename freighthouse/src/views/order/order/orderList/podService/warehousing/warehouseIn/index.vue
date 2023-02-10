<template>
	<!-- 实际进仓 -->
	<div id="warehouseInplan" class="edit-row" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div class="default-table" id="tableCont">
			<div class="warehouse-btnGroup">
				<ButtonTip
					btnType="primary" 
					:btnDisabled="(isBd && !isImportJoint) || isDisabledEdit" 
					btnText="一键生成出仓计划" 
					:tipContent="isDocTip || isJointTip || isFinishTip || statusTip" 
					class="operateBtn-tip ml10" 
					@click="handleOutPlanBatch">
				</ButtonTip>
				<!-- <el-button @click="handleOutPlanBatch" type="primary" size="mini" :disabled="(isBd && !isImportJoint) || isDisabledEdit">一键生成出仓计划</el-button> -->
			</div>
			<div class="table-com-layout" style="padding: 10px 0 0 0">
				<el-table class="pod-warehouse-table" fit :data="tableData" align="center" @selection-change="handleSelectionChange" style="width: 100%">
					<el-table-column type="selection" width="40"></el-table-column>
					<el-table-column prop="planNo" label="进仓计划编号" align="center" width="140"> </el-table-column>
					<el-table-column prop="batchNo" label="实际进仓编号" align="center" width="140"> </el-table-column>
					<!-- <el-table-column prop="whBatchNo" label="外部仓库编码" align="center" width="100"> </el-table-column> -->
					<el-table-column prop="realEnterTime" label="实际进仓时间" align="center" width="150"> </el-table-column>
					<el-table-column prop="whName" label="进仓仓库" align="center"> </el-table-column>
					<el-table-column prop="whSupplierName" label="供应商" align="center" show-overflow-tooltip></el-table-column>
					<el-table-column prop="positionNo" label="仓位编码" align="center"> </el-table-column>
					<el-table-column prop="custName" label="客户名称" align="center" width="200"> </el-table-column>
					<el-table-column prop="quantity" label="实际进仓总件数" align="center" width="110"> </el-table-column>
					<el-table-column prop="weight" label="实际进仓总毛重(KGS)" align="center" width="150"> </el-table-column>
					<el-table-column prop="volume" label="实际进仓总体积(CBM)" align="center" width="150"> </el-table-column>
					<el-table-column prop="remark" label="实际进仓要求" align="center" width="250" show-overflow-tooltip> </el-table-column>
					<el-table-column label="操作" width="180" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<ButtonTip
									btnType="text" 
									:btnDisabled="!scope.row.batchNo || isDisabledEdit" 
									btnText="详情" 
									:tipContent="noBatchNoTip(scope.row) || isFinishTip || statusTip" 
									class="operateBtn-tip" 
									@click="handleDetail(scope.row)">
								</ButtonTip>
								<!-- <el-button @click="handleDetail(scope.row)" type="text" size="mini" :disabled="!scope.row.batchNo || isDisabledEdit">详情</el-button> -->
								<ButtonTip
									btnType="text" 
									:btnDisabled="(isBd && !isImportJoint) || !scope.row.batchNo || isDisabledEdit" 
									btnText="生成出仓计划" 
									:tipContent="isDocTip || isJointTip || isFinishTip || statusTip || noBatchNoTip(scope.row)" 
									class="operateBtn-tip" 
									@click="handleOutPlan(scope.row)">
								</ButtonTip>
								<!-- <el-button @click="handleOutPlan(scope.row)" type="text" size="mini" :disabled="(isBd && !isImportJoint) || !scope.row.batchNo || isDisabledEdit">生成出仓计划</el-button> -->
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
		<!-- 实际进仓详情 -->
		<template v-if="detailShow">
			<Detail :isDocTip="isDocTip" :isJointTip="isJointTip" :isFinishTip="isFinishTip" :statusTip="statusTip" :detailData="formData" :isDisabledEdit="isDisabledEdit" :isJoint="isJoint" :saveBarFixed="saveBarFixed" @close="close" @handleConfirm="handleSave" v-if="isFcl"></Detail>
			<ImportDetail :isDocTip="isDocTip" :isJointTip="isJointTip" :isFinishTip="isFinishTip" :statusTip="statusTip" :detailData="formData" :isDisabledEdit="isDisabledEdit" :saveBarFixed="saveBarFixed" @close="close" @handleConfirm="handleSave" v-if="isImportLcl || isLcl"></ImportDetail>
		</template>
		<!-- 生成出仓计划 -->
		<template v-if="outShow">
			<OutPlanDialog :detailData="outplan_formData" @close="close" @handleConfirm="handleOutPlanBack" v-if="isFcl"></OutPlanDialog>
			<ImportOutPlanDialog :detailData="outplan_formData" @close="close" @handleConfirm="handleOutPlanBack" v-if="isImportLcl || isLcl"></ImportOutPlanDialog>
		</template>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { getDictLabel, deleteAlert, copyArry } from '@/utils/tools'
import { inReqno, inSave, inList, inInfo, inDelete, outplanSave, outPlanBatchSave } from '@/api/order/podService/warehouse'

import Detail from './components/detail'
import ImportDetail from './components/importDetail'
import OutPlanDialog from './components/outPlanDialog'
import ImportOutPlanDialog from './components/importOutPlanDialog'
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
			batchNo: '',
			outShow: false,
			outplan_formData: {},
			canSave: true
		}
	},
	created() {
		// this.getList()
	},
	mounted() {},
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
		...mapState({
			dictMap: state => state.dict.dictMap,
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
		// 20220509特殊处理为进口协同单的服务项权限都放开
		isImportJoint() {
			return ['ship_import_fcl', 'ship_import_lcl', 'ship_oversea_wh'].includes(this.orderInfo.businessType) && ['jointList', 'whJointList'].includes(this.$route.query.source)
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
		isFcl() {
			return ['ship_export_fcl', 'ship_import_fcl'].includes(this.orderInfo.businessType)
		},
		isImportLcl() {
			return ['ship_import_lcl', 'ship_oversea_wh'].includes(this.orderInfo.businessType)
		},
		isLcl() {
			return ['ship_export_lcl', 'ship_bulk_ro'].includes(this.orderInfo.businessType)
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
	components: {
		Detail,
		ImportDetail,
		OutPlanDialog,
		ImportOutPlanDialog,
		Pagination
	},
	methods: {
		noBatchNoTip(row) {
			if (!row.batchNo) {
				return '无实际进仓编号，不允许操作'
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
		//一键出仓
		handleOutPlanBatch() {
			if (this.multipleSelection.some(item => !item.realEnterTime)) return this.$message.warning('实际进仓时间不能为空!')
			let data = this.multipleSelection.map(item => item.oid)
			if (data.length == 0) return this.$message.warning('请先选择数据!')
			outPlanBatchSave(data).then(res => {
				if (res.msg === 'success') {
					this.$message.success('一键生成出仓计划成功!')
					this.getList()
				}
			})
		},
		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
			console.log(this.multipleSelection)
		},
		// 实际进仓列表
		getList() {
			this.lsLoading = true
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_warehouse_bonded' ? 'Y' : 'N'
			inList({ isBonded, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo, currPage: this.tableQuery.currPage, pageSize: this.tableQuery.pageSize }).then(res => {
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
		// 详情
		handleDetail(row) {
			let { orderNo, jointNo } = this.oQuery
			this.batchNo = row.batchNo
			inInfo({ orderNo, jointNo, batchNo: row.batchNo }).then(res => {
				this.formData = Object.assign({}, copyArry(res.data))
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
						batchNo: row.batchNo,
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo
					}
					return inDelete(data)
				})
				.then(response => {
					this.$message({
						message: '删除成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							// 只有一条数据的时候 删除完 取第一页的数据
							if (this.tableData.length === 1) {
								this.tableQuery.currPage = 1
							}
							if (this.batchNo === row.batchNo) {
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
		// 生成出仓计划
		handleOutPlan(row) {
			let { orderNo, jointNo } = this.oQuery
			inInfo({ orderNo, jointNo, batchNo: row.batchNo }).then(res => {
				this.outplan_formData = Object.assign({}, copyArry(res.data))
				this.outplan_formData.cargoInfoList.forEach(item => {
					;(item.batchNo = this.outplan_formData.batchNo), (item.inItemId = item.itemId)
				})
				console.log(this.outplan_formData)
				this.outShow = true
			})
		},
		close() {
			this.detailShow = false
			this.outShow = false
		},
		handleSave(value) {
			console.log(value)
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_warehouse_bonded' ? 'Y' : 'N'
			let data = Object.assign({}, value, { isBonded })
			if (this.$route.query.jointNo) {
				data.jointNo = this.$route.query.jointNo
			}
			if (!this.canSave) return
			this.canSave = false
			inSave(data)
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
		// 生成计划出仓弹窗回调
		handleOutPlanBack(data) {
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_warehouse_bonded' ? 'Y' : 'N'
			data.isBonded = isBonded
			data.jointNo = this.oQuery.jointNo
			data.orderNo = this.oQuery.orderNo
			data.cargoInfoList = data.cargoInfoList.map(item => {
				return {
					itemId: item.itemId,
					inBatchNo: item.batchNo,
					inItemId: item.inItemId,
					quantity: item.quantity,
					weight: item.weight,
					volume: item.volume,
					packageType: item.packageType
				}
			})
			if (!this.canSave) return
			this.canSave = false
			outplanSave(data)
				.then(res => {
					this.outShow = false
					this.$message({
						type: 'success',
						message: '保存成功',
						duration: 1000,
						onClose: () => {
							this.canSave = true
							this.$emit('changeComponent', 'WarehouseOutPlan', data)
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
.pod-warehouse-table {
	.cell.el-tooltip {
		overflow: hidden;
	}
}
</style>
