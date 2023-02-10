<template>
	<!-- 实际入仓 -->
	<div id="warehouseInplan" class="edit-row" v-loading="lsLoading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
		<div class="default-table" id="tableCont">
			<ButtonTip btnType="primary" :btnDisabled="(!isOp && !isOpTruck) || isBd || isDisabledEdit" btnText="一键生成出仓计划" :tipContent="isOpTruckAndOpTip || isFinishTip || statusTip" class="warehouse-btnGroup operateBtn-tip" @click="onekeyOut">
			</ButtonTip>
			<!-- <el-button class="warehouse-btnGroup" @click="onekeyOut" type="primary" size="mini" :disabled="(!isOp && !isOpTruck) || isBd || isDisabledEdit">一键生成出仓计划</el-button> -->
			<div class="table-com-layout">
				<el-table :row-class-name="rowClassName" :data="tableData" @selection-change="handleSelectionChange" row-key="batchNo" :tree-props="{ children: 'warehouseInItems', hasChildren: 'hasChildren' }" align="center" style="width: 100%">
					<el-table-column :selectable="selectable" type="selection" width="30"></el-table-column>
					<el-table-column prop="planNo" label="进仓计划编号" align="center"> </el-table-column>
					<el-table-column prop="batchNo" label="进仓编码" align="center"> </el-table-column>
					<el-table-column prop="warehouseName" label="进仓仓库" align="center"> </el-table-column>
					<el-table-column prop="whSupplierName" label="供应商" align="center" show-overflow-tooltip></el-table-column>
					<el-table-column prop="positionNo" label="仓位编码" align="center"> </el-table-column>
					<!-- <el-table-column prop="whBatchNo" label="外部仓库编码" align="center"> </el-table-column> -->
					<el-table-column prop="deliveryCustName" label="客户名称" align="center" width="150"> </el-table-column>
					<!-- <el-table-column prop="cargoVo[cname]" label="品名" align="center"> </el-table-column>
          <el-table-column prop="mark" label="唛头" align="center"> </el-table-column> -->
					<el-table-column prop="totalQuantity" label="进仓件数" align="center" width="70"> </el-table-column>
					<!-- <el-table-column prop="totalWeight" label="实际进仓毛重" align="center"> </el-table-column>
          <el-table-column prop="totalVolume" label="实际进仓体积" align="center"> </el-table-column> -->
					<!-- <el-table-column prop="packageType" label="实际包装类型" align="center"> </el-table-column> -->
					<el-table-column prop="realEnterTime" label="实际进仓时间" align="center"> </el-table-column>
					<el-table-column prop="inRemark" label="实际进仓要求" align="center" width="150" show-overflow-tooltip> </el-table-column>
					<el-table-column prop="totalQuantity" label="附件" align="center">
						<template slot-scope="scope">
							<el-button @click="handleFiles(scope.row)" type="text" size="mini">查看</el-button>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="180" align="center" fixed="right">
						<template slot-scope="scope">
							<div v-if="scope.row.planNo" class="operate-group">
								<el-button @click="handleDetail(scope.row)" type="text" size="mini">详情</el-button>
								<ButtonTip
									v-if="isOp || isOpTruck"
									btnType="text"
									:btnDisabled="(!isOp && !isOpTruck) || isBd || scope.row.lastTotalQuantity === 0 || isDisabledEdit"
									btnText="生成出仓计划"
									:tipContent="isOpTruckAndOpTip || isFinishTip || lastTotalQuantityTip(scope.row) || statusTip"
									class="operateBtn-tip"
									@click="handleIn(scope.row)"
								>
								</ButtonTip>
								<!-- <el-button @click="handleIn(scope.row)" type="text" size="mini" :disabled="(!isOp && !isOpTruck) || isBd || scope.row.lastTotalQuantity === 0 || isDisabledEdit" v-if="isOp || isOpTruck">生成出仓计划</el-button> -->
								<!-- <el-button v-if="false" @click="handleDelete(scope.row)" type="text" size="mini" :disabled="!isOpTruck || isBd || isJoint">删除</el-button> -->
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div style="display: flex; flex-direction: row-reverse; padding-right: 24px">
				<!-- <el-pagination layout="total, prev, pager, next, jumper" size="mini" background @current-change="handleCurrentChange" :current-page.sync="tableQuery.currPage" :page-size="10" :total="tableQuery.total"> </el-pagination> -->
				<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
			</div>
		</div>
		<!-- 实际进仓详情 -->
		<template v-if="showInWarehouse">
			<InWarehouseDetail
				:isOpTruckTip="isOpTruckTip"
				:statusTip="statusTip"
				:isFinishTip="isFinishTip"
				:isFinish="isFinish"
				:isDisabledEdit="isDisabledEdit"
				:isJoint="isJoint"
				:detailData="in_formData"
				:saveBarFixed="saveBarFixed"
				@close="close"
				@handleConfirm="handleSave"
			></InWarehouseDetail>
		</template>
		<!-- 生成出仓计划 -->
		<template v-if="showPlanOutWarehouse">
			<PlanOutWarehouseDialog :detailData="out_formData" @close="close" @handleConfirm="handleInBack"></PlanOutWarehouseDialog>
		</template>
		<!-- 日期弹窗 -->
		<template v-if="showDate">
			<one-key-date @close="closeDate"></one-key-date>
		</template>
		<!-- 附件 -->
		<template v-if="showFilesDialog">
			<FilesDialog @close="closeFilesDialog" :warehouseType="'in'" :warehouseId="warehouseId"></FilesDialog>
		</template>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel, deleteAlert } from '@/utils/tools'
// import { handleWarehouseData } from '../../../js/handleData'
import DefaultTableComp from '../../../components/defaultTableComp'
import { orderWarehouseInList, getWarehouseInDetail, warehouseInSaveNew, getWarehouseInDelete, warehouseOutplanGetSerialNo, warehouseOutplanSave, warehouseOutplanBatchSave } from '@/api/order/list'
import PlanOutWarehouseDialog from './dialog/planOutWarehouseDialog'
import InWarehouseDetail from './dialog/inWarehouseDetail'
import Pagination from '@/components/Base/Table/newPagination'
import oneKeyDate from './dialog/preOutDate'
import FilesDialog from './dialog/filesDialog'
export default {
	data() {
		return {
			warehouseId:'',
			showFilesDialog: false,
			showDate: false,
			tableConfig: {
				// 分页
				pagination: {
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
			selectedLists: [],
			oQuery: this.$route.query,
			tableData: [],
			oid: '',
			showPlanOutWarehouse: false, // 出仓计划
			out_formData: {}, // 出仓计划数据
			showInWarehouse: false, // 实际进仓
			in_formData: {} // 实际进仓数据
		}
	},
	created() {
		this.init()
	},
	mounted() {},
	props: {
		tabMenus: {
			type: Array,
			default: () => []
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		}
	},

	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			serviceInfoList: state => state.order.serviceInfoList,
			userEditRoles: state => state.order.orderList.userEditRoles,
			finCloseStatusCanEdit: state => state.order.finCloseStatusCanEdit,
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.userEditRoles.includes('op') || this.userEditRoles.includes('line_cs')
		},
		isOpTruck() {
			return this.userEditRoles.includes('op_truck')
		},
		isJoint() {
			let findItem = this.tabMenus.find(item => item.code === 'pol_warehouse')
			return findItem ? findItem.isJoint : false
		},
		isBd() {
			let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.isDoc || this.isAc
			return isBd || this.isFinish
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === 'pol_warehouse')
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		isDisabledEdit() {
			// 订单状态非（完成、取消）状态，且订单还未总关账，只要服务项进度未完成,就可以编辑
			if (this.isFinish) {
				return true
				// 放开已关账、已完成的限制
				// ['complete','cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || (this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes' && !this.finCloseStatusCanEdit)
			} else if (['cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || (this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes' && !this.finCloseStatusCanEdit)) {
				return true
			} else {
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
			if (['cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || (this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes' && !this.finCloseStatusCanEdit)) {
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
		},
		isOpTruckAndOpTip() {
			if (!(this.isOpTruck || this.isOp)) {
				return '非该单拖报操作人员、仓储操作或是操作人员，不允许操作'
			}
		}
	},
	components: {
		DefaultTableComp,
		PlanOutWarehouseDialog,
		InWarehouseDetail,
		Pagination,
		oneKeyDate,
		FilesDialog
	},
	methods: {
		handleFiles(row){
			this.warehouseId = row.oid
			this.showFilesDialog = true
		},
		closeFilesDialog(){
			this.showFilesDialog = false
		},
		// 日期弹窗关闭
		closeDate(action, val) {
			console.log('🚀 ~ action', action)
			console.log('🚀 ~ val', val)
			if (action === 'Confirm') {
				let data = {
					ids: this.selectedLists.map(item => item.oid),
					date: val.planTime
				}
				warehouseOutplanBatchSave(data).then(res => {
					if (res.msg === 'success') {
						this.$message.success('一键生成出仓计划成功!')
						this.getList()
						this.showDate = false
					}
				})
			} else {
				this.showDate = false
			}
		},
		lastTotalQuantityTip(row) {
			if (row.lastTotalQuantity === 0) {
				return '剩余进仓件数为0，不允许操作'
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
		//判断是否空运勾选
		selectable(row, index) {
			return row.lastTotalQuantity != 0
		},
		rowClassName({ row, rowIndex }) {
			if (row.lastTotalQuantity === 0) {
				return 'warehouse-no-quantity'
			}
			return ''
		},
		//一键出仓
		onekeyOut() {
			if (this.selectedLists.some(item => !item.realEnterTime)) return this.$message.warning('实际进仓时间不能为空!')
			if (this.selectedLists.length == 0) return this.$message.warning('请先选择数据!')
			// let data = this.selectedLists.map(item => item.oid)
			this.showDate = true
			// warehouseOutplanBatchSave(data).then(res => {
			// 	console.log('🚀 ~ res', res)
			// 	if (res.msg === 'success') {
			// 		this.$message.success('一键生成出仓计划成功!')
			// 		this.getList()
			// 	}
			// })
		},
		// 勾选数据
		handleSelectionChange(val) {
			this.selectedLists = val
		},
		// 获取so列表
		init() {
			this.getList()
		},
		getList() {
			this.lsLoading = true
			let data = { orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo, currPage: this.tableQuery.currPage, pageSize: this.tableQuery.pageSize }
			orderWarehouseInList(data)
				.then(res => {
					this.tableQuery.total = res.data.totalCount
					if (res.data.list && res.data.list.length > 0) {
						this.tableData = [...res.data.list]
					}
					this.tableQuery.currPage = res.data.currPage
					this.tableConfig.pagination.hasNextPage = res.data.hasNextPage
					this.tableConfig.pagination.hasPreviousPage = res.data.hasPreviousPage
					this.tableConfig.pagination.isFirstPage = res.data.isFirstPage
					this.tableConfig.pagination.isLastPage = res.data.isLastPage
					this.tableConfig.pagination.total = res.data.totalCount
					this.tableQuery.pageSize = res.data.pageSize
				})
				.finally(() => {
					this.lsLoading = false
				})
		},

		// 删除
		handleDelete(row) {
			deleteAlert(this, getWarehouseInDelete, { whId: row.whId, jointNo: this.oQuery.jointNo }, this.deleteCallback)
		},
		// 删除回调
		deleteCallback() {
			// 只有一条数据的时候 删除完 取上一页的数据
			if (this.tableData.length === 1) {
				this.tableQuery.currPage = 1
			}
			this.showInWarehouse = false
			this.getList()
		},
		// 详情
		handleDetail(row) {
			getWarehouseInDetail({ oid: row.oid, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				res.data &&
					res.data.warehouseInItems.map(item => {
						item.cname = item.cargoVo.cname
						item.mark = item.cargoVo.mark
					})
				this.in_formData = res.data
				this.showInWarehouse = true
			})
		},

		// 出仓计划
		handleIn(row) {
			Promise.all([warehouseOutplanGetSerialNo(), getWarehouseInDetail({ oid: row.oid, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo })]).then(res => {
				res[1].data &&
					res[1].data.warehouseInItems.map(item => {
						item.cname = item.cargoVo.cname
						item.inBatchNo = item.batchNo
						item.mark = item.cargoVo.mark
					})
				res[1].data.planNo = res[0].data.serialNo
				this.out_formData = res[1].data
				this.showPlanOutWarehouse = true
			})
		},

		// 出仓计划弹窗回调
		handleInBack(data) {
			data.jointNo = this.oQuery.jointNo
			delete data.oid
			delete data.batchNo
			warehouseOutplanSave(data).then(res => {
				this.showPlanOutWarehouse = false
				this.$message({ type: 'success', message: '保存成功' })
				this.$emit('changeComponent', 'WarehouseOutPlan', data)
			})
		},

		// 保存
		handleSave(data) {
			data.jointNo = this.oQuery.jointNo
			let hasCargo = true
			let hasPackageType = true
			hasCargo = data.warehouseInItems.every(ele => ele.cname) && data.warehouseInItems.length
			hasPackageType = data.warehouseInItems.every(ele => ele.packageType) && data.warehouseInItems.length
			if (!hasCargo) {
				return this.$message({ type: 'error', message: '货品不能为空' })
			}
			if (!hasPackageType) {
				return this.$message({ type: 'error', message: '包装单位不能为空' })
			}

			warehouseInSaveNew(data).then(res => {
				this.showInWarehouse = false
				this.getList()
				this.$message({ type: 'success', message: '保存成功' })
			})
		},

		close() {
			this.showInWarehouse = false
			this.showPlanOutWarehouse = false
		}
	}
}
</script>

<style lang="scss">
#warehouseInplan {
	.warehouse-no-quantity {
		color: #f36a6a;
	}
}
</style>
