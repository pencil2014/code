<template>
	<div class="app-container warehouse-detail-wrap">
		<div class="warehouse-info">
			<div v-for="(item, index) in wareHouseList" :key="index" class="row">
				<div class="col">仓库: {{ item.warehouseName }}</div>
				<div class="col">供应商: {{ item.supplierName }}</div>
				<div class="col">仓库免租期: {{ item.rentFreePeriod }} 天</div>
			</div>
		</div>
		<div class="warehouse-btns">
			<ButtonTip v-if="warehouseServiceType === 'pol'" btnType="primary" :btnDisabled="(!isOp && !isOpTruck) || isDisabledEdit" btnText="新增出仓计划" :tipContent="isOpTruckAndOpTip || isFinishTip" class="operateBtn-tip" @click="handleIn">
			</ButtonTip>
			<ButtonTip v-else btnType="primary" :btnDisabled="(isBd && !isImportJoint) || isDisabledEdit" btnText="新增出仓计划" :tipContent="isDocTip || isJointTip || isFinishTip || statusTip" class="operateBtn-tip" @click="handleOutPlan"> </ButtonTip>
			<ButtonTip style="margin-left: 10px" :btnDisabled="isDisabledEdit" btnText="弃货" :tipContent="isFinishTip" class="operateBtn-tip" @click="handleAbandon"> </ButtonTip>
		</div>
		<div>
			<el-table @selection-change="handleSelectionChange" fit :data="tableData" style="width: 100%; margin-top: 10px">
				<el-table-column type="selection" width="40"> </el-table-column>
				<el-table-column prop="warehouseName" label="仓库" align="left"> </el-table-column>
				<el-table-column prop="cname" label="品名" align="left"> </el-table-column>
				<el-table-column prop="mark" label="唛头" align="left"> </el-table-column>
				<el-table-column prop="batchNo" label="进仓编号" align="left"> </el-table-column>
				<el-table-column prop="lastQuantity" label="库存数" align="left"> </el-table-column>
				<el-table-column prop="lastWeight" label="库存毛重" align="left"> </el-table-column>
				<el-table-column prop="lastVolume" label="库存体积" align="left"> </el-table-column>
				<el-table-column prop="rentFreePeriod" label="超免租期天数" align="left">
					<template slot-scope="scope">
						{{ scope.row.rentFreePeriod | rentFreePeriodFilter }}
					</template>
				</el-table-column>
				<el-table-column label="日志" align="left">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button @click="handleClick(scope.row)" type="text" size="mini">查看</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
			<!-- <div class="base-el-pagination">
				<div class="pagination-container">
					<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
				</div>
			</div> -->
			<div v-if="showLogDialog">
				<LogDialog @close="close" :orderNo="$route.query.orderNo" :whId="whId" :cargoId="cargoId"></LogDialog>
			</div>
			<div v-if="showAbandonDialog">
				<AbandonDialog @close="closeAbandon" :abandonData="selectRows"></AbandonDialog>
			</div>
			<!-- 生成出仓计划 -->
			<template v-if="showPlanOutWarehouse">
				<PlanOutWarehouseDialog :detailData="out_formData" @close="closePlanOut" @handleConfirm="handleInBack"></PlanOutWarehouseDialog>
			</template>
			<!-- 目的港仓储 生成出仓计划 -->
			<template v-if="outShow">
				<OutPlanDialog :detailData="outplan_formData" @close="closePodPlan" @handleConfirm="handleOutPlanBack" v-if="isFcl"></OutPlanDialog>
				<ImportOutPlanDialog :detailData="outplan_formData" @close="closePodPlan" @handleConfirm="handleOutPlanBack" v-if="isImportLcl || isLcl"></ImportOutPlanDialog>
			</template>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import searchTableUtil from '@/utils/searchTableUtil'
import Search from '@/components/Base/Search/index'
import { warehouseStockList, listOrderStockByOrderNo, listOrderCargoStockByOrderNo, warehouseStockJettison } from '@/api/order/warehouse'
import LogDialog from './logDialog'
import Pagination from '@/components/Base/Table/newPagination'
import AbandonDialog from './abandonDialog'
import PlanOutWarehouseDialog from '@/views/order/order/orderList/warehouse/components/dialog/planOutWarehouseDialog.vue'
import { orderWarehouseInList, getWarehouseInDetail, warehouseInSaveNew, getWarehouseInDelete, warehouseOutplanGetSerialNo, warehouseOutplanSave, warehouseOutplanBatchSave } from '@/api/order/list'
import OutPlanDialog from '@/views/order/order/orderList/podService/warehousing/warehouseIn/components/outPlanDialog'
import ImportOutPlanDialog from '@/views/order/order/orderList/podService/warehousing/warehouseIn/components/importOutPlanDialog'
import { inReqno, inSave, inList, inInfo, inDelete, outplanSave, outPlanBatchSave } from '@/api/order/podService/warehouse'
import { getDictLabel, deleteAlert, copyArry } from '@/utils/tools'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}

const defaultTableQuery = {
	// columns: [],
	ascColumns: [],
	descColumns: []
	// query: [],     // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
}

export default {
	data() {
		return {
			outplan_formData: {},
			outShow: false,
			showPlanOutWarehouse: false,
			out_formData: {},
			wareHouseList: [{ warehouseName: '', supplierName: '', rentFreePeriod: '' }],
			selectRows: [],
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
			btnList: [{ label: '新建', type: 'Add' }],
			freeSoList: [],

			tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
			tableData: [], // table数据
			showLogDialog: false, // 日志弹窗显示
			showAbandonDialog: false // 弃货弹窗显示
		}
	},
	props: {
		activityType: {
			type: String,
			default: ''
		},
		warehouseServiceType: {
			type: String,
			default: ''
		}
	},
	filters: {
		rentFreePeriodFilter(rentFreePeriod) {
			let text = ``
			if (rentFreePeriod > 0) {
				text = `剩余${rentFreePeriod}天`
			} else if (rentFreePeriod == 0) {
				text = `今天到期`
			} else {
				text = `超期${-rentFreePeriod}天`
			}

			return text
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
			let findItem = this.$attrs.tabMenus.find(item => item.code === 'pod_warehouse')
			let isJoint = findItem ? findItem.isJoint : false
			if (this.$route.query.jointNo) {
				isJoint = false
			}
			return isBd || isJoint || (this.isFinish && this.warehouseServiceType !== 'pod')
		},
		// 20220509特殊处理为进口协同单的服务项权限都放开
		isImportJoint() {
			return ['ship_import_fcl', 'ship_import_lcl', 'ship_oversea_wh'].includes(this.$attrs.orderInfo.businessType) && ['jointList', 'whJointList'].includes(this.$route.query.source)
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === 'pod_warehouse')
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		isDisabledEdit() {
			// 订单状态非（完成、取消）状态，且订单还未总关账，只要服务项进度未完成,就可以编辑
			if (this.isFinish && this.warehouseServiceType !== 'pod') {
				return true
			} else if (['complete', 'cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus)) {
				return true
			} else {
				return false
			}
		},
		isFcl() {
			return ['ship_export_fcl', 'ship_import_fcl'].includes(this.$attrs.orderInfo.businessType)
		},
		isImportLcl() {
			return ['ship_import_lcl', 'ship_oversea_wh'].includes(this.$attrs.orderInfo.businessType)
		},
		isLcl() {
			return ['ship_export_lcl', 'ship_bulk_ro'].includes(this.$attrs.orderInfo.businessType)
		},
		// 业务类型为进口，海外仓的,报关单
		isImport() {
			return ['ship_import_fcl', 'ship_import_lcl', 'ship_oversea_wh', 'ship_customs', 'ship_export_customs', 'ship_import_customs'].includes(this.$attrs.orderInfo.businessType)
		},
		// 业务类型为出口的
		isExport() {
			return ['ship_export_fcl', 'ship_export_lcl'].includes(this.$attrs.orderInfo.businessType)
		},
		// 业务类型为散杂滚装
		isBulkRo() {
			return ['ship_bulk_ro'].includes(this.$attrs.orderInfo.businessType)
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
			if (['ship_oversea_wh'].includes(this.$attrs.orderInfo.businessType)) {
				if (!this.isDoc && !this.isEpricing && !this.isEcs) {
					return '非操作，海外客服，海外商务，不允许操作'
				}
			}
			// 进口整箱，非操作，仓储操作，海外客服，海外商务
			if (['ship_import_fcl'].includes(this.$attrs.orderInfo.businessType)) {
				if (!this.isDoc && !this.isOpWh && !this.isEpricing && !this.isEcs) {
					return '非操作，仓储操作，海外客服，海外商务，不允许操作'
				}
			}
			// 进口拼箱，非操作，仓储操作，拖报，海外客服，海外商务
			if (['ship_import_lcl'].includes(this.$attrs.orderInfo.businessType)) {
				if (!this.isDoc && !this.isOpWh && !this.isEpricing && !this.isEcs) {
					return '非操作，仓储操作，拖报操作，海外客服，海外商务，不允许操作'
				}
			}
			// 报关单，非关务操作
			if (['ship_customs', 'ship_export_customs', 'ship_import_customs'].includes(this.$attrs.orderInfo.businessType)) {
				if (this.ordDetRole !== 'op_truck') {
					return '非关务操作，不允许操作'
				}
			}
		},
		statusTip() {
			if (['complete', 'cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus)) {
				return '订单状态为已取消、已完成，不允许操作'
			}
		},
		isOpTruck() {
			return this.userEditRoles.includes('op_truck')
		},
		isOpTruckAndOpTip() {
			if (!(this.isOpTruck || this.isOp)) {
				return '非该单拖报操作人员、仓储操作或是操作人员，不允许操作'
			}
		}
	},
	created() {
		this.init()
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	destroyed() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	components: {
		Search,
		Pagination,
		LogDialog,
		AbandonDialog,
		PlanOutWarehouseDialog,
		OutPlanDialog,
		ImportOutPlanDialog
	},
	methods: {
		// 目的港生成计划出仓弹窗回调
		handleOutPlanBack(data) {
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_warehouse_bonded' ? 'Y' : 'N'
			data.isBonded = isBonded
			data.jointNo = this.$route.query.jointNo
			data.orderNo = this.$route.query.orderNo
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
			outplanSave(data).then(res => {
				this.outShow = false
				this.$message({
					type: 'success',
					message: '保存成功',
					duration: 1000
				})
			})
		},
		closePodPlan() {
			this.outShow = false
		},
		// 目的港仓储生成出仓计划
		handleOutPlan() {
			if (this.selectRows.length === 0) return this.$message.error('请先选择数据')
			if (this.selectRows.length > 1) return this.$message.error('只能选择一条数据')
			if (this.selectRows.some(item => item.lastQuantity == 0)) return this.$message.error('只能选择库存数量大于0的数据')
			let { orderNo, jointNo } = this.$route.query
			inInfo({ orderNo, jointNo, batchNo: this.selectRows[0].batchNo }).then(res => {
				this.outplan_formData = Object.assign({}, copyArry(res.data))
				this.outplan_formData.cargoInfoList.forEach(item => {
					;(item.batchNo = this.outplan_formData.batchNo), (item.inItemId = item.itemId)
				})
				console.log(this.outplan_formData)
				this.outShow = true
			})
		},
		// 起运港生成出仓计划
		handleIn() {
			if (this.selectRows.length === 0) return this.$message.error('请先选择数据')
			if (this.selectRows.length > 1) return this.$message.error('只能选择一条数据')
			if (this.selectRows.some(item => item.lastQuantity == 0)) return this.$message.error('只能选择库存数量大于0的数据')
			Promise.all([warehouseOutplanGetSerialNo(), getWarehouseInDetail({ oid: this.selectRows[0].oid, orderNo: this.$route.query.orderNo, jointNo: this.$route.query.jointNo })]).then(res => {
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
		// 起运港生成出仓计划弹窗回调
		handleInBack(data) {
			data.jointNo = this.$route.query.jointNo
			delete data.oid
			delete data.batchNo
			warehouseOutplanSave(data).then(res => {
				this.showPlanOutWarehouse = false
				this.$message({ type: 'success', message: '新增成功' })
			})
		},
		closePlanOut() {
			this.showPlanOutWarehouse = false
		},

		// 仓库列表
		getListOrderStockByOrderNo() {
			listOrderStockByOrderNo({ orderNo: this.$route.query.orderNo, warehouseServiceType: this.warehouseServiceType }).then(res => {
				if (res.code === 0) {
					this.wareHouseList = res.data
				}
			})
		},

		handleSelectionChange(val) {
			console.log('🚀 ~ val', val)
			this.selectRows = val.map(item => {
				item.warehouseServiceType = this.warehouseServiceType
				item.inBatchNo = item.batchNo
				return item
			})
		},
		closeAbandon(val) {
			console.log('🚀 ~ val', val)
			if (val === 'Confirm') {
				this.getList()
			}
			console.log('🚀 ~ closeAbandon')
			this.showAbandonDialog = false
		},
		handleAbandon() {
			if (this.selectRows.length === 0) return this.$message.error('请先选择数据')
			if (this.selectRows.length > 1) return this.$message.error('只能选择一条数据')
			if (this.selectRows.some(item => item.lastQuantity == 0)) return this.$message.error('只能选择库存数量大于0的数据')

			this.showAbandonDialog = true
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		init() {
			this.getListOrderStockByOrderNo()
			this.getList()
		},
		// enter按键事件
		handleKeyDown(e) {
			let key = null
			if (window.event === undefined) {
				key = e.keyCode
			} else {
				key = window.event.keyCode
			}
			if (key === 13) {
				// 阻止分页的页码enter键触发全局的监听事件
				let className = window.event.target.parentNode.className
				if (className.includes('el-pagination__editor')) return
			}
		},
		// 仓库明细列表
		getList() {
			listOrderCargoStockByOrderNo({ orderNo: this.$route.query.orderNo, warehouseServiceType: this.warehouseServiceType }).then(res => {
				if (res.code === 0) {
					this.tableData = res.data
					// 特殊处理体积毛重
					this.tableData = this.tableData.map(item => {
						item.lastVolume = item.lastVolume.replace('.000', '')
						item.lastWeight = item.lastWeight.replace('.000', '')
						return item
					})
				}
			})
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
				if (!this.validCheck()) return false
				this.handleCreateSo(done)
			} else {
				this.close('Cancel')
			}
		},

		handleClick(row) {
			this.whId = row.whId
			this.cargoId = row.cargoId
			this.showLogDialog = true
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
		close() {
			this.showLogDialog = false
		}
	}
}
</script>

<style lang="scss" scoped>
.warehouse-detail-wrap {
	padding: 20px;
	.warehouse-btns {
		display: flex;
		justify-content: flex-end;
	}
	.warehouse-info {
		.row {
			margin-top: 8px;
			width: 50%;
			display: flex;
			justify-content: space-between;
			.col {
				width: 33%;
				padding-right: 10px;
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
			}
		}
	}
}
</style>
