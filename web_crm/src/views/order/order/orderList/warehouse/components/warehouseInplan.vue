<template>
	<!-- 入仓计划 -->
	<div id="warehouseInplan" class="edit-row" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div class="default-table" id="tableCont">
			<div class="warehouse-btnGroup">
				<el-button @click="handleClick('batchIn')" type="primary" size="mini" :disabled="!isOpTruck || isBd || isJoint || isDisabledEdit">一键生成进仓</el-button>
				<el-button @click="handleClick('car')" type="default" size="mini" :disabled="!isOpTruck || isBd || isDisabledEdit">新增派车</el-button>
				<el-button @click="handleClick('add')" type="primary" size="mini" :disabled="(!isOp && !isOpTruck) || isBd || isDisabledEdit">新增进仓计划</el-button>
				<el-button @click="handleExport" type="primary" size="mini">导出</el-button>
			</div>
			<div class="table-com-layout">
				<el-table class="warehouse-tip-table" fit :data="tableData" @selection-change="handleSelectionChange" align="center" style="width: 100%">
					<el-table-column type="selection" width="40"></el-table-column>
					<el-table-column prop="planNo" label="进仓计划编号" width="140" align="center"></el-table-column>
					<el-table-column prop="planEnterTime" label="预计进仓时间" align="center"></el-table-column>
					<el-table-column prop="status_zh" label="进仓状态" align="center" width="80"></el-table-column>
					<el-table-column prop="warehouseName" label="进仓仓库" align="center" show-overflow-tooltip></el-table-column>
					<el-table-column prop="positionNo" label="仓位编码" align="center">
						<template slot-scope="scope">
							<el-input size="mini" v-model="scope.row.positionNo" clearable placeholder="请输入" @blur="handleUpdatePosition(scope.row)" :disabled="!isOpTruck || isDisabledEdit"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="deliveryCustName" label="客户名称" align="center"></el-table-column>
					<!-- <el-table-column prop="cname" label="品名" align="center"> </el-table-column>
          <el-table-column prop="mark" label="唛头" align="center"> </el-table-column> -->
					<el-table-column prop="totalQuantity" label="预计进仓总件数" align="center"></el-table-column>
					<!-- <el-table-column prop="totalWeight" label="预计进仓总毛重" align="center"> </el-table-column>
          <el-table-column prop="totalVolume" label="预计进仓总体积" align="center"> </el-table-column> -->
					<!-- <el-table-column prop="packageType" label="预计包装类型" align="center"> </el-table-column> -->
					<el-table-column label="操作" width="200" align="center" fixed="right">
						<template slot-scope="scope">
							<div v-if="scope.row.planNo" class="operate-group">
								<el-button @click="handleDetail(scope.row)" type="text" size="mini">详情</el-button>
								<el-button @click="handleDelete(scope.row)" type="text" size="mini" :disabled="(!isOp && !isOpTruck) || isBd || isDisabledEdit">删除</el-button>
								<el-button @click="handleIn(scope.row)" type="text" size="mini" :disabled="!isOpTruck || isBd || isJoint || isDisabledEdit">实际进仓</el-button>
								<el-button @click="handleCopy(scope.row)" type="text" size="mini">复制</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div style="display: flex;flex-direction: row-reverse;padding-right:24px">
				<!-- <el-pagination layout="total, prev, pager, next, jumper" size="mini" background @current-change="handleCurrentChange" :current-page.sync="tableQuery.currPage" :page-size="10" :total="tableQuery.total"> </el-pagination> -->
				<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
			</div>
		</div>
		<!-- 新增计划进仓 -->
		<template v-if="showPlanInWarehouse">
			<PlanInWarehouseDetail :status="status" :isDisabledEdit="isDisabledEdit" :isJoint="isJoint" :detailData="formData" :saveBarFixed="saveBarFixed" @close="close" @handleConfirm="handleSave"></PlanInWarehouseDetail>
		</template>
		<!-- 实际进仓 -->
		<template v-if="showInWarehouse">
			<InWarehouseDialog :detailData="in_formData" @close="close" @handleConfirm="handleInBack"></InWarehouseDialog>
		</template>
		<!-- 新增派车计划 -->
		<template v-if="showAddCarDialog">
			<AddCarDialog :detailData="car_formData" @close="close" @handleConfirm="handleCarBack"></AddCarDialog>
		</template>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { getDictLabel, deleteAlert, copyArry } from '@/utils/tools'
// import { handleWarehouseData } from '../../../js/handleData'
import DefaultTableComp from '../../../components/defaultTableComp'
import { saveBulk } from '@/api/order/shippingTruck'
import { orderWarehouseInplanList, getWarehouseInplanDetail, warehouseInplanSave, getWarehouseInDelete, createSerialNo, warehouseInSave, warehouseInBatchSave, warehouseInplanCopy } from '@/api/order/list'
import { inPositionUpdate } from '@/api/order/warehouse'
import { whTruckIntrustGetIntrustNo } from '@/api/order/shippingTruck'
import PlanInWarehouseDetail from './dialog/planInWarehouseDetail'
import InWarehouseDialog from './dialog/inWarehouseDialog'
import AddCarDialog from './carDialog/addCarDialog'
import Pagination from "@/components/Base/Table/newPagination"

export default {
	data() {
		return {
			tableConfig: {
        // 分页
        pagination: {
          show: true,
          total: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          isFirstPage: false,
          isLastPage: false
        },
      },
			tableQuery: {
				pageSize: 10,
				currPage: 1,
				total: 0
			},
			status: '',
			oQuery: this.$route.query,
			showPlanInWarehouse: false, // 显示新增计划进仓弹窗
			showInWarehouse: false, // 实际进仓计划
			tableData: [],
			oid: '',
			formData: {}, // 计划进仓详情数据
			in_formData: {}, // 实际进仓数据
			car_formData: {}, // 派车计划数据
			showAddCarDialog: false, // 新增派车计划
			selectedLists: [], // 选中list
			custStr: sessionStorage.getItem('custStr')
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
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userEditRoles: state => state.order.orderList.userEditRoles,
			serviceInfoList: state => state.order.serviceInfoList
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
		isDisabledEdit(){
			// 订单状态非（完成、取消）状态，且订单还未总关账，只要服务项进度未完成,就可以编辑
			if(this.isFinish){
				return true
			}else if(['complete','cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes'){
				return true
			}else{
				return false
			}
		},
	},
	components: {
		DefaultTableComp,
		PlanInWarehouseDetail,
		InWarehouseDialog,
		AddCarDialog,
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
		// 修改进仓编码
		handleUpdatePosition(row) {
			let data = {
				orderNo: this.$route.query.orderNo,
				planNo: row.planNo,
				positionNo: row.positionNo
			}
			inPositionUpdate(data)
				.then(res => {
					this.getList()
				})
				.catch(err => {
					this.getList()
				})
		},
		// 输出
		handleExport() {
			if (this.selectedLists.length != 1) return this.$message.warning('请选择一条数据!')
			let data = {
				orderNo: this.$route.query.orderNo,
				planNo: this.selectedLists[0].planNo,
				whId: this.selectedLists[0].whId
				// orderNo: 'S202106220001052',
				// planNo: 'WIP2021062300084',
				// whId: 1
			}

			this.$store
				.dispatch('order/exportBlobFile', {
					uri: '/order/warehouseInplan/export',
					data
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = `进仓计划${data.orderNo}.doc`
					link.click()
				})
		},
		// 获取so列表
		init() {
			this.getList()
		},
		getList(type) {
			this.lsLoading = true
			let data = { orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo, currPage: this.tableQuery.currPage, pageSize: this.tableQuery.pageSize }
			orderWarehouseInplanList(data).then(res => {
				if (res.data.list && res.data.list.length > 0) {
					this.tableQuery.total = res.data.totalCount
					this.tableData = res.data.list.map(item => {
						item.status_zh = getDictLabel('warehouseInplanStatus', item.status)
						return item
					})
					type === 'copy' && this.copySuccessCb() // 复制成功后的回调
				} else {
					this.tableData = []
				}
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

		// 删除
		handleDelete(row) {
			deleteAlert(this, getWarehouseInDelete, { oid: row.oid, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }, this.deleteCallback)
		},
		// 删除回调
		deleteCallback() {
			// 只有一条数据的时候 删除完 取上一页的数据
			if (this.tableData.length === 1) {
				this.tableQuery.currPage = 1
			}
			this.showPlanInWarehouse = false
			this.getList()
		},
		// table 回调函数 新增委托、委托完成
		handleClick(type) {
			if (type == 'batchIn') {
				if (this.selectedLists.some(item => item.status != 'init')) return this.$message.warning('只能选择未进仓的数据!')
				if (this.selectedLists.some(item => !item.planEnterTime)) return this.$message.warning('预计进仓时间不能为空!')
				let data = this.selectedLists.map(item => item.oid)
				if (data.length == 0) return this.$message.warning('请先选择数据!')
				warehouseInBatchSave(data).then(res => {
					if (res.msg === 'success') {
						this.$message.success('一键生成进仓成功!')
						this.getList()
					}
				})
			}
			if (type == 'add') {
				createSerialNo().then(res => {
					let cust = JSON.parse(this.custStr)
					this.formData = {
						planNo: res.data.serialNo,
						deliveryCustName: cust.custName,
						deliveryCustid: cust.custid
					}
					this.status = 'init'
					this.showPlanInWarehouse = true
				})
			}
			if (type == 'car') {
				if (!this.selectedLists || this.selectedLists.length <= 0) {
					this.$message({
						message: '请勾选进仓计划！',
						type: 'warning'
					})
					return false
				} else {
					let funcs = this.selectedLists.map(async item => {
						let data = await getWarehouseInplanDetail({ oid: item.oid, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo })
						data.data.warehouseInplanItems &&
							data.data.warehouseInplanItems.length &&
							data.data.warehouseInplanItems.map(item => {
								return Object.assign(item, {
									cname: item.cargoVo.cname,
									mark: item.cargoVo.mark
								})
							})
						return {
							shipperCustName: item.deliveryCustName,
							shipperCustId: item.deliveryCustid,
							planNo: item.planNo,
							warehouseName: item.warehouseName,
							whId: item.whId,
							truckCargos_copy: [...(data.data && data.data.warehouseInplanItems)] || [],
							truckLoadVos: [
								{
									truckCargos: [...(data.data && data.data.warehouseInplanItems)] || []
								}
							]
						}
					})
					Promise.all([whTruckIntrustGetIntrustNo(), ...funcs]).then(res => {
						let detailLists = res.filter((item, index) => index != 0)
						this.car_formData = Object.assign({ truckLoads: [...detailLists] }, { intrustNo: res[0].data.serialNo }, { warehouseInoutType: 'in' }, { warehouseInoutType_cn: getDictLabel('warehouseInoutType', 'in') })
						this.showAddCarDialog = true
					})
				}
			}
		},
		// 详情
		handleDetail(row) {
			getWarehouseInplanDetail({ oid: row.oid, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				this.formData = Object.assign({}, copyArry(res.data))
				this.formData.warehouseInplanItems.map(item => {
					item.cname = item.cargoVo.cname
					item.mark = item.cargoVo.mark
				})
				this.status = row.status
				console.log('🚀 ~ row.status', row.status)
				this.showPlanInWarehouse = true
			})
		},
		handleCopy(row) {
			// 复制
			this.$confirm(`是否复制此条信息?`, {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
			.then(() => {
				warehouseInplanCopy({
					planNo: row.planNo,
					orderNo: this.oQuery.orderNo
				})
				.then(res => {
					this.$message.success('复制成功')
					this.getList('copy') // 复制完刷新列表
				})
			})
			.catch(() => {})
      
		},
		copySuccessCb() {
			this.formData = Object.assign({}, copyArry(this.tableData[0]))
			this.formData.warehouseInplanItems.map(item => {
				item.cname = item.cargoVo.cname
				item.mark = item.cargoVo.mark
			})
			this.status = this.formData.status
			console.log('🚀 ~ row.status', this.formData.status)
			this.showPlanInWarehouse = true
		},
		// 实际进仓
		handleIn(row) {
			getWarehouseInplanDetail({ oid: row.oid, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				this.in_formData = copyArry(res.data)
				this.in_formData.warehouseInplanItems.map(item => {
					item.cname = item.cargoVo.cname
					item.mark = item.cargoVo.mark
				})
				this.showInWarehouse = true
			})
		},
		// 实际进仓弹窗回调
		handleInBack(data) {
			data.jointNo = this.oQuery.jointNo
			data.orderNo = this.oQuery.orderNo
			warehouseInSave(data).then(res => {
				this.showInWarehouse = false
				this.$message({ type: 'success', message: '保存成功' })
				this.$emit('changeComponent', 'WarehouseIn', data)
			})
		},
		// 新增派车回调
		handleCarBack(data) {
			let hasCargo = true
			let hasPackageType = true
			let hasQuantity = true
			let hasWeight = true
			let hasVolume = true
			data.jointNo = this.oQuery.jointNo
			data.orderNo = this.oQuery.orderNo
			data.loadType = 'bulk'
			data.truckLoads.map(item => {
				hasCargo = item.truckCargos.every(ele => ele.cargoId) && item.truckCargos.length
				hasPackageType = item.truckCargos.every(ele => ele.packageType) && item.truckCargos.length
				hasQuantity = item.truckCargos.every(ele => ele.quantity) && item.truckCargos.length
				hasWeight = item.truckCargos.every(ele => ele.weight) && item.truckCargos.length
				hasVolume = item.truckCargos.every(ele => ele.volume) && item.truckCargos.length
				delete item.truckLoadVos
				delete item.truckCargos_copy
				delete item.planNo_copy
			})
			if (!hasCargo) {
				return this.$message({ type: 'error', message: '请选择正确的商品' })
			}
			if (!hasPackageType) {
				return this.$message({ type: 'error', message: '包装类型不能为空' })
			}
			if (!hasQuantity) {
				return this.$message({ type: 'error', message: '件数不能为空' })
			}
			// if (!hasWeight) {
			//   return this.$message({type: 'error', message: '毛重不能为空'})
			// }
			// if (!hasVolume) {
			//   return this.$message({type: 'error', message: '体积不能为空'})
			// }

			saveBulk(data).then(res => {
				this.showAddCarDialog = false
				this.$message({
					type: 'success',
					message: '保存成功',
					duration: 1000,
					onClose: () => {
						// table页跳转到 '散车收货'
						// this.$store.dispatch("order/changeWarehouseComp", "Car")
						this.$emit('changeComponent', 'Car')
					}
				})
			})
		},

		// 保存
		handleSave(data) {
			data.jointNo = this.oQuery.jointNo
			data.orderNo = this.oQuery.orderNo

			let hasCargo = true
			let hasPackageType = true
			hasCargo = data.warehouseInplanItems.every(ele => ele.cname) && data.warehouseInplanItems.length
			hasPackageType = data.warehouseInplanItems.every(ele => ele.packageType) && data.warehouseInplanItems.length
			if (!hasCargo) {
				return this.$message({ type: 'error', message: '货品不能为空' })
			}
			if (!hasPackageType) {
				return this.$message({ type: 'error', message: '包装单位不能为空' })
			}
			warehouseInplanSave(data).then(res => {
				this.showPlanInWarehouse = false
				this.getList()
				this.$message({ type: 'success', message: '保存成功' })
			})
		},
		// 勾选数据
		handleSelectionChange(val) {
			this.selectedLists = [...copyArry(val)]
			console.log('🚀 ~ this.selectedLists', this.selectedLists)
		},

		close() {
			this.showPlanInWarehouse = false
			this.showInWarehouse = false
			this.showAddCarDialog = false
		}
	}
}
</script>

<style lang="scss">
#warehouseInplan {
	.warehouse-tip-table {
		.cell.el-tooltip {
			overflow: hidden;
		}
	}
	.warehouse-btnGroup{
		position: absolute;
    right: 20px;
    margin-top: -20px;
	}
}
</style>
