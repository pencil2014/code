<template>
	<!-- 出仓计划 -->
	<div id="warehouseInplan" class="edit-row">
		<div class="default-table" id="tableCont">
			<div class="table-com-layout" style="padding: 10px 0 0 0">
				<el-table class="pod-warehouse-table" fit :data="tableData" align="center" style="width: 100%">
					<el-table-column prop="outPlanNo" label="出仓计划编号" align="center" width="150"> </el-table-column>
					<el-table-column prop="outBatchNo" label="出仓编码" align="center" width="150"> </el-table-column>
					<el-table-column prop="outTime" label="实际出仓时间" align="center" width="150"> </el-table-column>
					<el-table-column prop="whName" label="出仓仓库" align="center"> </el-table-column>
					<el-table-column prop="custName" label="客户名称" align="center" width="200"> </el-table-column>
					<el-table-column prop="quantity" label="实际出仓件数" align="center" width="110"> </el-table-column>
					<el-table-column prop="weight" label="实际出仓毛重(KGS)" align="center" width="150"> </el-table-column>
					<el-table-column prop="volume" label="实际出仓体积(CBM)" align="center" width="150"> </el-table-column>
					<el-table-column prop="remark" label="实际出仓要求" show-overflow-tooltip align="center" width="250"> </el-table-column>
					<el-table-column label="操作" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleDetail(scope.row)" type="text" :disabled="!scope.row.outBatchNo" size="mini">详情</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div style="display: flex;flex-direction: row-reverse">
				<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
			</div>
		</div>
		<!-- 出仓详情 -->
		<template v-if="detailShow">
			<Detail :detailData="formData" :saveBarFixed="saveBarFixed" :isDisabledEdit="isBd || isDisabledEdit" @close="close" @handleConfirm="handleSave"></Detail>
		</template>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { getDictLabel, copyArry } from '@/utils/tools'
import { podwhOutUpdate, outList, outInfo, outDelete } from '@/api/order/podService/warehouse'
import Pagination from '@/components/Base/Table/newPagination'
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
import Detail from './components/detail'

export default {
	mixins: [orderMixin],
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
			formData: {}, // 计划出仓详情数据
			outBatchNo: '',
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
		tabMenus: {
			type: Array,
			default: () => []
		},
		saveBarFixed: {
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
			airOrderInfo: state => state.airTransport.airOrderInfo || {}
		}),

		isFinish() {
			let findItem = this.airOrderInfo.serviceInfoList.find(item => item.serviceCode === 'pod_warehouse')
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		isDisabledEdit() {
			if (['draft', 'refuse', 'submit'].includes(this.airOrderInfo.orderStatus)) {
				return true
			}
			if(!this.isEcs && !this.isOp && (!this.isCs || !this.isImport)){
				return true
			}
			// 订单状态非（完成、取消）状态，且订单还未总关账，只要服务项进度未完成,就可以编辑
			if (this.isFinish) {
				return true
			} else if (['complete', 'cancel'].includes(this.airOrderInfo.orderStatus)) {
				return true
			} else {
				return false
			}
		},
		isImportJoint() {
			return ['air_import'].includes(this.airOrderInfo.businessType) && this.$route.query.source === 'jointList'
		},
		isImport() {
			return ['air_import'].includes(this.airOrderInfo.businessType)
		},
		airIsJoint() {
			let serviceInfo = this.airOrderInfo.serviceInfoList.find(item => item.serviceCode === 'pod_warehouse')
			let airIsJoint = serviceInfo ? serviceInfo.isJoint : ''
			return airIsJoint === 'y' && !this.$route.query.jointNo ? true : false
		},
		isBd() {
			let airIsJoint = this.airIsJoint
			if (this.$route.query.jointNo) {
				airIsJoint = false
			}
			return airIsJoint
		},
	},
	components: {
		Detail,
		Pagination
	},
	methods: {
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
		// 出仓计划列表
		getList() {
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_warehouse_bonded' ? 'Y' : 'N'
			outList({ isBonded, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo, currPage: this.tableQuery.currPage, pageSize: this.tableQuery.pageSize }).then(res => {
				this.tableData = res.data.list
				this.tableQuery.total = res.data.totalCount

				this.tableQuery.currPage = res.data.currPage
				this.tableConfig.pagination.hasNextPage = res.data.hasNextPage
				this.tableConfig.pagination.hasPreviousPage = res.data.hasPreviousPage
				this.tableConfig.pagination.isFirstPage = res.data.isFirstPage
				this.tableConfig.pagination.isLastPage = res.data.isLastPage
				this.tableConfig.pagination.total = res.data.totalCount
				this.tableQuery.pageSize = res.data.pageSize
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

			this.outBatchNo = row.outBatchNo
			outInfo({ orderNo, jointNo, outBatchNo: row.outBatchNo }).then(res => {
				this.formData = Object.assign({}, copyArry(res.data))
				this.detailShow = true
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
						outBatchNo: row.outBatchNo,
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo
					}
					return outDelete(data)
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
							if (this.outBatchNo === row.outBatchNo) {
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
		close() {
			this.detailShow = false
		},
		handleSave(value) {
			console.log(value)
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_warehouse_bonded' ? 'Y' : 'N'
			let data = Object.assign({}, value, { isBonded })
			data.jointNo = this.oQuery.jointNo
			data.orderNo = this.oQuery.orderNo
			data.cargoInfoList = data.cargoInfoList.map(item => {
				return {
					itemId: item.itemId,
					inBatchNo: item.inBatchNo,
					inItemId: item.inItemId,
					quantity: item.quantity,
					weight: item.weight,
					volume: item.volume,
					packageType: item.packageType
				}
			})
			if (!this.canSave) return
			this.canSave = false
			podwhOutUpdate(data)
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
