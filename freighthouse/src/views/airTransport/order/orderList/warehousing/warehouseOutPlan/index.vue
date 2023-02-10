<template>
	<!-- 出仓计划 -->
	<div id="warehouseInplan" class="edit-row">
		<div class="default-table" id="tableCont">
			<div class="warehouse-btnGroup">
				<el-button type="primary" @click="onekeyOut" size="mini" :disabled="(isBd && !isImportJoint) || isDisabledEdit">一键生成出仓</el-button>
				<el-button @click="handleAddCar" type="default" size="mini" :disabled="(isBd && !isImportJoint) || isDisabledEdit">新增派车</el-button>
				<el-button @click="handleOutPlan" type="primary" size="mini" :disabled="(isBd && !isImportJoint) || isDisabledEdit">新增出仓计划</el-button>
			</div>
			<div class="table-com-layout" style="padding: 10px 0 0 0">
				<el-table class="pod-warehouse-table" fit :data="tableData" @selection-change="handleSelectionChange" align="center" style="width: 100%">
					<el-table-column type="selection" width="55"></el-table-column>
					<el-table-column prop="outPlanNo" label="出仓计划编号" align="center" width="140"> </el-table-column>
					<el-table-column prop="outPlanTime" label="预计出仓时间" align="center" width="150"> </el-table-column>
					<el-table-column prop="status" label="出仓状态" align="center">
						<template slot-scope="scope">
							{{ scope.row.status | statusFilter }}
						</template>
					</el-table-column>
					<el-table-column prop="whName" label="出仓仓库" align="center"> </el-table-column>
					<el-table-column prop="custName" label="客户名称" align="center" width="200"> </el-table-column>
					<el-table-column prop="quantity" label="预计出仓件数" align="center" width="110"> </el-table-column>
					<el-table-column prop="weight" label="预计出仓毛重(KGS)" align="center" width="150"> </el-table-column>
					<el-table-column prop="volume" label="预计出仓体积(CBM)" align="center" width="150"> </el-table-column>
					<el-table-column prop="remark" label="出仓要求" align="center" width="200" show-overflow-tooltip> </el-table-column>
					<el-table-column label="操作" width="180" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleDetail(scope.row)" type="text" size="mini" :disabled="!scope.row.outPlanNo">详情</el-button>
								<el-button @click="handleDelete(scope.row)" type="text" size="mini" :disabled="((isBd && !isImportJoint) || isDisabledEdit) || !scope.row.outPlanNo">删除</el-button>
								<el-button @click="handleOut(scope.row)" type="text" size="mini" :disabled="((isBd && !isImportJoint) || isDisabledEdit) || !scope.row.outPlanNo">实际出仓</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div style="display: flex;flex-direction: row-reverse">
				<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
			</div>
		</div>
		<!-- 新增出仓计划 -->
		<template v-if="detailShow">
			<Detail :detailData="formData" :isDisabledEdit="(isBd && !isImportJoint) || isDisabledEdit" :saveBarFixed="saveBarFixed" @close="close" @handleConfirm="handleSave"></Detail>
		</template>
		<!-- 实际出仓 -->
		<template v-if="outShow">
			<OutDialog :detailData="out_formData" @close="close" @handleConfirm="handleOutBack"></OutDialog>
		</template>
		<!-- 新增派车 -->
		<template v-if="ltlDeliveryShow">
			<LtlDelivery :detailData="car_formData" @close="ltlDeliveryPopClose"></LtlDelivery>
		</template>
		<div v-if="showAddDelivery">
			<AddDelivery :activityType="activityType" @close="hideAddDelivery" :whName="whName" :outPlanNo="outPlanNos" :addType="'out'"></AddDelivery>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { getDictLabel, deleteAlert, copyArry } from '@/utils/tools'
import { outBatchSave, outplanReqno, outplanSave, outplanList, outplanInfo, outplanDelete, outSave } from '@/api/order/podService/warehouse'
import { ltlIntrustSave, ltlReqno } from '@/api/order/podService/ltlDelivery'

import Detail from './components/detail'
import OutDialog from './components/outDialog'
import LtlDelivery from './components/ltlDelivery'
import AddDelivery from '../components/addDelivery'
import Pagination from '@/components/Base/Table/newPagination'
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
export default {
	mixins: [orderMixin],
	filters: {
		statusFilter(status) {
			return getDictLabel('warehouseOutplanStatus', status)
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
			formData: {}, // 计划出仓详情数据
			outPlanNo: '',
			outShow: false,
			out_formData: {},
			ltlDeliveryShow: false,
			car_formData: {},
			canSave: true
		}
	},
	created() {
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
			dictMap: state => state.dict.dictMap,
			airOrderInfo: state => state.airTransport.airOrderInfo || {},
			roles: state => state.user.roles,
		}),
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
		outPlanNos() {
			let arr = []
			for (let i = 0; i < this.multipleSelection.length; i++) {
				if (this.multipleSelection[i].outPlanNo) {
					arr.push(this.multipleSelection[i].outPlanNo)
				} else {
					arr.push('')
				}
			}
			return arr.join(',')
		},

		isFinish() {
			let findItem = this.airOrderInfo.serviceInfoList.find(item => item.serviceCode === 'pod_warehouse')
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		isDisabledEdit() {
			// 订单状态非（完成、取消）状态，且订单还未总关账，只要服务项进度未完成,就可以编辑
			if (['draft', 'refuse', 'submit'].includes(this.airOrderInfo.orderStatus)) {
				return true
			}
			if(!this.isEcs && !this.isOp && (!this.isCs || !this.isImport)){
				return true
			}
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
		OutDialog,
		LtlDelivery,
		AddDelivery,
		Pagination
	},
	methods: {
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
		//一键出仓
		onekeyOut() {
			if (this.multipleSelection.some(item => !item.outPlanTime)) return this.$message.warning('预计出仓时间不能为空!')
			let data = this.multipleSelection.map(item => item.oid)
			if (data.length == 0) return this.$message.warning('请先选择数据!')
			outBatchSave(data).then(res => {
				if (res.msg === 'success') {
					this.$message.success('一键生成出仓成功!')
					this.getList()
				}
			})
		},
		// 出仓计划列表
		getList() {
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_warehouse_bonded' ? 'Y' : 'N'
			outplanList({ isBonded, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo, currPage: this.tableQuery.currPage, pageSize: this.tableQuery.pageSize }).then(res => {
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
		// 新增出仓计划
		handleOutPlan() {
			let custStr = sessionStorage.getItem('custStr')
			let cust = JSON.parse(custStr)
			outplanReqno().then(res => {
				let outPlanNo = res.data.seqNo || ''
				this.formData = Object.assign(
					{},
					{
						custid: cust.custid,
						custName: cust.custName,
						outPlanNo,
						cargoInfoList: []
					}
				)
				this.openDetail()
			})
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
		// 详情
		handleDetail(row) {
			let { orderNo, jointNo } = this.oQuery

			this.outPlanNo = row.outPlanNo
			outplanInfo({ orderNo, jointNo, outPlanNo: row.outPlanNo }).then(res => {
				this.formData = Object.assign({}, copyArry(res.data), {
					status: row.status
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
						outPlanNo: row.outPlanNo,
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo
					}
					return outplanDelete(data)
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
							if (this.outPlanNo === row.outPlanNo) {
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
		// 实际出仓
		handleOut(row) {
			let { orderNo, jointNo } = this.oQuery
			outplanInfo({ orderNo, jointNo, outPlanNo: row.outPlanNo }).then(res => {
				this.out_formData = Object.assign({}, copyArry(res.data))
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
			outplanSave(data)
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
		// 实际出仓弹窗回调
		handleOutBack(data) {
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_warehouse_bonded' ? 'Y' : 'N'
			data.isBonded = isBonded
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
			outSave(data)
				.then(res => {
					this.outShow = false
					this.$message({
						type: 'success',
						message: '保存成功',
						duration: 1000,
						onClose: () => {
							this.canSave = true
							this.$emit('changeComponent', 'WarehouseOut', data)
						}
					})
				})
				.catch(err => {
					setTimeout(() => {
						this.canSave = true
					}, 2000)
				})
		},
		// 新增派车计划
		handleAddCar() {
			if (!this.multipleSelection || this.multipleSelection.length <= 0) {
				return this.$message({
					message: '请勾选出仓计划！',
					type: 'warning'
				})
			} else {
				this.showAddDelivery = true
				return
				// let funcs = this.multipleSelection.map(async item => {
				// 	let data = await outplanInfo({ outPlanNo: item.outPlanNo, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo })
				// 	return {
				// 		outPlanNo: item.outPlanNo,
				// 		whName: item.whName,
				// 		whId: item.whId,
				// 		custContact: item.custContact,
				// 		custContactPhone: item.custContactPhone,
				// 		custName: item.custName,
				// 		custid: item.custid,
				// 		cargoInfoList: [...(data.data && data.data.cargoInfoList)] || []
				// 	}
				// })
				// Promise.all([ltlReqno(), ...funcs]).then(res => {
				// 	let detailLists = res.filter((item, index) => index != 0)
				// 	this.car_formData = Object.assign({ loadInfoList: [...detailLists] }, { intrustNo: res[0].data.seqNo }, { intrustType: 'out' }, { intrustType_cn: getDictLabel('warehouseInoutType', 'out') }, { intrustStatus: 'to_intrust' })
				// 	this.ltlDeliveryShow = true
				// 	console.log(this.car_formData)
				// })
			}
		},
		ltlDeliveryPopClose(action, value) {
			console.log('散车', action, value)

			let data = { ...value }
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_warehouse_bonded' ? 'Y' : 'N'
			data.isBonded = isBonded
			data.orderNo = this.$route.query.orderNo
			data.jointNo = this.$route.query.jointNo
			this.ltlDeliveryShow = false
			if (action === 'Confirm') {
				ltlIntrustSave(data).then(res => {
					this.$message({
						type: 'success',
						message: '保存成功',
						duration: 1000,
						onClose: () => {
							this.$store.dispatch('order/changePodWarehouseComp', 'PodLtlDelivery')
						}
					})
				})
			}
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
