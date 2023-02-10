<template>
	<!-- 出仓计划 -->
	<div id="warehouseInplan" class="edit-row" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div class="default-table" id="tableCont">
			<div class="warehouse-btnGroup">
				<el-button @click="onekeyOut" size="mini" type="primary" :disabled="!isOpTruck || isBd || isJoint || isDisabledEdit">一键生成出仓</el-button>
				<el-button @click="handleCar()" type="default" size="mini" :disabled="!isOpTruck || isBd || isDisabledEdit">新增派车</el-button>
				<el-button @click="handleClick('add')" type="primary" size="mini" :disabled="(!isOpTruck && !isOp) || isBd || isDisabledEdit">新增出仓计划</el-button>
				<el-button @click="handleExport" type="primary" size="mini">导出</el-button>
			</div>
			<div class="table-com-layout">
				<el-table :data="tableData" @selection-change="handleSelectionChange" align="center" style="width: 100%">
					<el-table-column type="selection" width="40"></el-table-column>
					<el-table-column prop="planNo" label="出仓计划编号" align="center" width="150"> </el-table-column>
					<el-table-column prop="batchNo" label="出仓编码" align="center"> </el-table-column>
					<el-table-column prop="status_zh" label="出仓状态" align="center" width="80"> </el-table-column>
					<el-table-column prop="warehouseName" label="出仓仓库" align="center" show-overflow-tooltip> </el-table-column>
					<el-table-column prop="positionNo" label="仓位编码" align="center" width="150">
						<template slot-scope="scope">
							<el-input size="mini" v-model="scope.row.positionNo" clearable placeholder="请输入" @blur="handleUpdatePosition(scope.row)" :disabled="!isOpTruck || isDisabledEdit"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="totalQuantity" label="预计出仓总件数" align="center" width="120"> </el-table-column>
					<!-- <el-table-column prop="totalWeight" label="预计出仓总毛重" align="center"> </el-table-column>
          <el-table-column prop="totalVolume" label="预计出仓总体积" align="center"> </el-table-column> -->
					<!-- <el-table-column prop="packageType" label="预计出仓包装" align="center"> </el-table-column> -->
					<el-table-column prop="planTime" label="预计出仓时间" align="center" width="100"> </el-table-column>
					<el-table-column label="操作" width="180" align="center" fixed="right">
						<template slot-scope="scope">
							<div v-if="scope.row.planNo" class="operate-group">
								<el-button @click="handleDetail(scope.row)" type="text" size="mini">详情</el-button>
								<el-button @click="handleDelete(scope.row)" type="text" size="mini" :disabled="(!isOpTruck && !isOp) || isBd || isDisabledEdit">删除</el-button>
								<el-button @click="handleIn(scope.row)" type="text" size="mini" :disabled="!isOpTruck || isBd || isJoint || isDisabledEdit">实际出仓</el-button>
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
		<!-- 新增计划出仓 -->
		<template v-if="showPlanOutWarehouse">
			<PlanOutWarehouseDetail :status="status" :isDisabledEdit="isDisabledEdit" :isJoint="isJoint" :detailData="formData" :saveBarFixed="saveBarFixed" @close="close" @handleConfirm="handleSave"></PlanOutWarehouseDetail>
		</template>
		<!-- 实际出仓 -->
		<template v-if="showOutWarehouse">
			<OutWarehouseDialog :detailData="out_formData" @close="close" @handleConfirm="handleOutBack"></OutWarehouseDialog>
		</template>
		<!-- 新增派车计划 -->
		<template v-if="showAddCarDialog">
			<AddCarDialog :detailData="car_formData" @close="close" @handleConfirm="handleCarBack"></AddCarDialog>
		</template>
	</div>
</template>

<script>
// import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel, deleteAlert, copyArry } from '@/utils/tools'
// import { handleWarehouseData } from '../../../js/handleData'
import DefaultTableComp from '../../../components/defaultTableComp'
import { warehouseOutBatchSave, orderWarehouseOutplanList, warehouseOutplanDetail, warehouseOutplanSave, warehouseOutplanDelete, warehouseOutplanGetSerialNo, warehouseOutSave } from '@/api/order/list'
import { outPositionUpdate } from '@/api/order/warehouse'
import { whTruckIntrustGetIntrustNo } from '@/api/order/shippingTruck'
import { saveBulk } from '@/api/order/shippingTruck'
import PlanOutWarehouseDetail from './dialog/planOutWarehouseDetail'
import OutWarehouseDialog from './dialog/outWarehouseDialog'
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
			showPlanOutWarehouse: false, // 显示新增计划进仓弹窗
			showOutWarehouse: false, // 实际进仓计划
			tableData: [],
			oid: '',
			formData: {}, // 计划进仓详情数据
			out_formData: {}, // 实际进仓数据
			showAddCarDialog: false, // 新增派车计划
			selectedLists: [] // 选中list
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
		PlanOutWarehouseDetail,
		OutWarehouseDialog,
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
		// 修改出仓编码
		handleUpdatePosition(row) {
			let data = {
				orderNo: this.$route.query.orderNo,
				planNo: row.planNo,
				positionNo: row.positionNo
			}
			outPositionUpdate(data)
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
				planNo: this.selectedLists[0].planNo
				// orderNo: 'S202102080001887',
				// planNo: 'WOP2021020800406'
			}

			this.$store
				.dispatch('order/exportBlobFile', {
					uri: '/order/warehouseOutplan/export',
					data
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = `出仓计划${data.orderNo}.xls`
					link.click()
				})
		},
		//一键出仓
		onekeyOut() {
			if (this.selectedLists.some(item => !item.planTime)) return this.$message.warning('预计出仓时间不能为空!')
			if (this.selectedLists.length == 0) return this.$message.warning('请先选择数据!')
			let data = this.selectedLists.map(item => item.oid)
			warehouseOutBatchSave(data).then(res => {
				if (res.msg === 'success') {
					this.$message.success('一键生成出仓成功!')
					this.getList()
				}
			})
		},
		// 获取so列表
		init() {
			this.getList()
		},
		getList() {
			this.lsLoading = true
			let data = { orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo, currPage: this.tableQuery.currPage, pageSize: this.tableQuery.pageSize }
			orderWarehouseOutplanList(data).then(res => {
				this.tableQuery.total = res.data.totalCount
				if (res.data.list && res.data.list.length > 0) {
					this.tableData = res.data.list.map(item => {
						item.status_zh = getDictLabel('warehouseOutplanStatus', item.status)
						item.warehouseOutplanItems &&
							item.warehouseOutplanItems.map(cargo => {
								cargo.cname = cargo.cargoVo.cname
								cargo.mark = cargo.cargoVo.mark
								cargo.totalQuantity = cargo.quantity
								cargo.totalWeight = cargo.weight
								cargo.totalVolume = cargo.volume
								cargo.planNo = ''
							})
						return item
					})
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
			deleteAlert(this, warehouseOutplanDelete, { oid: row.oid, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }, this.deleteCallback)
		},
		// 删除回调
		deleteCallback() {
			// 只有一条数据的时候 删除完 取上一页的数据
			if (this.tableData.length === 1) {
				this.tableQuery.currPage = 1
			}
			this.showPlanOutWarehouse = false
			this.getList()
		},
		// table 回调函数 新增委托、委托完成
		handleClick(type) {
			if (type == 'add') {
				warehouseOutplanGetSerialNo().then(res => {
					console.log(res)
					this.formData = { planNo: res.data.serialNo }
					this.status = 'init'
					this.showPlanOutWarehouse = true
				})
			}
		},
		// table 回调函数 新增委托、委托完成
		handleCar() {
			if (!this.selectedLists || this.selectedLists.length <= 0) {
				this.$message({
					message: '请勾选出仓计划！',
					type: 'warning'
				})
				return false
			} else {
				let funcs = this.selectedLists.map(async item => {
					let data = await warehouseOutplanDetail({ oid: item.oid, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo })
					data.data.warehouseOutplanItems &&
						data.data.warehouseOutplanItems.length &&
						data.data.warehouseOutplanItems.map(item => {
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
						truckCargos_copy: [...(data.data && data.data.warehouseOutplanItems)] || [],
						truckLoadVos: [
							{
								truckCargos: [...(data.data && data.data.warehouseOutplanItems)] || []
							}
						]
					}
				})
				Promise.all([whTruckIntrustGetIntrustNo(), ...funcs]).then(res => {
					let detailLists = res.filter((item, index) => index != 0)
					this.car_formData = Object.assign({ truckLoads: [...detailLists] }, { intrustNo: res[0].data.serialNo }, { warehouseInoutType: 'out' }, { warehouseInoutType_cn: getDictLabel('warehouseInoutType', 'out') })
					this.showAddCarDialog = true
				})
			}
		},
		// 详情
		handleDetail(row) {
			warehouseOutplanDetail({ oid: row.oid, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				res.data &&
					res.data.warehouseOutplanItems.map(item => {
						item.cname = item.cargoVo.cname
						item.mark = item.cargoVo.mark
					})
				this.formData = res.data
				this.status = row.status
				this.showPlanOutWarehouse = true
			})
		},

		// 实际进仓
		handleIn(row) {
			warehouseOutplanDetail({ oid: row.oid, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				res.data &&
					res.data.warehouseOutplanItems.map(item => {
						item.cname = item.cargoVo.cname
						item.mark = item.cargoVo.mark
					})
				this.out_formData = res.data
				this.showOutWarehouse = true
			})
		},

		// 实际进仓弹窗回调
		handleOutBack(data) {
			data.jointNo = this.oQuery.jointNo
			data.orderNo = this.oQuery.orderNo
			warehouseOutSave(data).then(res => {
				this.showOutWarehouse = false
				this.$message({ type: 'success', message: '保存成功' })
				this.$emit('changeComponent', 'WarehouseOut', data)
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
				this.showInWarehouse = false
				this.$message({ type: 'success', message: '保存成功' })
				// table页跳转到 '散车收货'
				this.$emit('changeComponent', 'Car')
				// this.$store.dispatch("order/changeWarehouseComp", "Car")
			})
		},

		validate(data) {
			let { warehouseOutplanItems } = data
			let quanityCompare = warehouseOutplanItems.some(item => {
				return item.quantity && item.quantity > item.lastQuantity
			})
			let weightCompare = warehouseOutplanItems.some(item => {
				return item.weight && item.weight > item.lastWeight
			})
			let volumeCompare = warehouseOutplanItems.some(item => {
				return item.volume && item.volume > item.lastVolume
			})
			if (quanityCompare) {
				this.$message.warning('计划出仓件数不能大于剩余库存件数')
				return false
			}
			if (weightCompare) {
				this.$message.warning('计划出仓毛重不能大于剩余库存毛重')
				return false
			}
			if (volumeCompare) {
				this.$message.warning('计划出仓体积不能大于剩余库存体积')
				return false
			}
			return true
		},

		// 保存
		handleSave(data) {
			data.jointNo = this.oQuery.jointNo
			data.orderNo = this.oQuery.orderNo
			if (!this.validate(data)) return
			warehouseOutplanSave(data).then(res => {
				this.showPlanOutWarehouse = false
				this.getList()
				this.$message({ type: 'success', message: '保存成功' })
			})
		},
		// 勾选数据
		handleSelectionChange(val) {
			this.selectedLists = [...copyArry(val)]
		},
		close() {
			this.showPlanOutWarehouse = false
			this.showOutWarehouse = false
			this.showAddCarDialog = false
		}
	}
}
</script>

<style lang="scss"></style>
