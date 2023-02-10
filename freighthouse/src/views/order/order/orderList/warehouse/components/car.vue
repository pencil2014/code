<template>
	<!-- 散车收货 -->
	<div id="car" class="edit-row" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div class="default-table" id="tableCont">
			<DefaultTableComp ref="defaultTableComp" :tableInfo="tableInfo" :tableConfig="tableConfig" @tableClick="tableClick">
				<template>
					委派状态：
					<el-select @change="tableClick" v-model="dispatchStatusValue" placeholder="请选择" size="mini" :disabled="isBd || !isOpTruck || isDisabledEdit">
						<el-option v-for="(item, index) in dictMap.truckIntrustStatus" :key="index" :label="item.label" :value="item.value"> </el-option>
					</el-select>
				</template>
			</DefaultTableComp>
			<!-- <div
				style="display: flex;
		flex-direction: row-reverse;"
			>
				<el-pagination layout="total, prev, pager, next, jumper" size="mini" background @current-change="handleCurrentChange" :current-page.sync="tableQuery.currPage" :page-size="10" :total="tableQuery.total"> </el-pagination>
			</div>-->
		</div>
		<!-- 散车收货详情 -->
		<template v-if="showInfoDialog">
			<CarInfoDetail :isOpTruckTip="isOpTruckTip" :isJointTip="isJointTip" :isFinishTip="isFinishTip" :statusTip="statusTip" :detailData="in_formData" :isDisabledEdit="isDisabledEdit" :saveBarFixed="saveBarFixed" @close="close" @handleConfirm="handleSave"></CarInfoDetail>
		</template>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel, getDictMap, deleteAlert, copyArry } from '@/utils/tools'
import { handleWarehouseData } from '../../../js/handleData'
import DefaultTableComp from '../../../components/defaultTableComp'
import { whTruckIntrustList, saveBulk, whTruckIntrustDelete, bulkDetail, whTruckIntrustGetIntrustNo, whTruckIntrustUpdateIntrustStatus } from '@/api/order/shippingTruck'
import CarInfoDetail from './carDialog/carInfoDetail'

export default {
	data() {
		return {
			tableQuery: {
				currPage: 1,
				total: 0
			},
			oQuery: this.$route.query,
			tableData: [],
			oid: '',
			warehouseInplanStatus: store.state.dict.dictMap.warehouseInplanStatus, // 进仓状态
			showPlanOutWarehouse: false, // 出仓计划
			out_formData: {}, // 出仓计划数据
			showInfoDialog: false, // 实际进仓
			in_formData: {}, // 实际进仓数据
			tableInfo: {
				title: '运输管理',
				titleBtnList: [
					// { label: '派车完成', key: 'dispatchStatus', hide: true }
					// {label: "委派完成", key: "intrustStatus"},
				]
			},
			// 表格配置项
			tableConfig: {
				style: {},
				tableIndex: {
					show: false
				},
				options: {
					// 是否支持解锁列表修改,默认锁定列表不可更改
					lockState: false,
					// 是否支持列表项选中功能
					mutiSelect: true,

					// 多选框状态判断 {false不可选, true可选}
					checkSelectable({ oid }) {
						return oid ? true : false
					}
				},
				columns: handleWarehouseData.carListColumn, //  表格显示的表头
				list: (this.detailData && copyArry(this.detailData.warehouseInItems)) || [],
				// 操作按钮组
				operationBtns: { show: false },
				// 操作提示
				tips: {
					text: '',
					show: false
				},
				// 操作按钮组
				operationBtns: {
					width: '150px',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						let fn = this['handle' + action]
						if (typeof fn !== 'function') return
						this['handle' + action](row, $index)
					},
					data: [
						{
							label: '详情',
							type: 'text',
							show: true,
							action: 'Info'
						},
						{
							label: '删除',
							type: 'text',
							show:true,
							disabled: (item, row) => {
								if (this.isBd || !this.isOpTruck) {
									return true
								} else {
									return false
								}
							},
							action: 'Delete'
						}
					]
				},
				// 分页
				pagination: {
					show: false,
					total: 0
				}
			},
			dispatchStatusOptions: getDictMap('truckDispatchStatus'), // 委托状态列表
			dispatchStatusValue: '' // 委托状态值
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
		isBd() {
			let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.isDoc || this.isAc
			let findItem = this.tabMenus.find(item => item.code === 'pol_warehouse')
			let isJoint = findItem ? findItem.isJoint : false
			return isBd || isJoint || this.isFinish
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
			}else if(['complete','cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus)){
				return true
			} else {
				return false
			}
		},
		isOpTruckTip() {
			if (!this.isOpTruck) {
				return '非该单拖报操作、仓储操作人员，不允许操作'
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
			if(['cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || (this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes'&& !this.finCloseStatusCanEdit)) {
				return '订单状态为已取消、已完成，或是已关账，不允许操作'
			}
		},
		isJointTip() {
			if (this.isJoint) {
				return '该服务项被协同，不允许操作'
			}
		},
	},
	components: {
		DefaultTableComp,
		CarInfoDetail
	},
	methods: {
		handleCurrentChange(val) {
			this.tableQuery.currPage = val
			this.getList()
		},
		// 获取so列表
		init() {
			this.getList()
			this.tableConfig.operationBtns.data.map(item => {
				item.action === 'Delete' &&
					Object.assign(item, {
						disabled: this.isBd || !this.isOpTruck|| this.isDisabledEdit ? true : false,
						tipContent: this.isOpTruckTip || this.isJointTip || this.isFinishTip || this.statusTip,
					})
			})
		},
		getList() {
			this.lsLoading = true
			// let data = { orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo, loadType: 'bulk', currPage: this.tableQuery.currPage, pageSize: 10 }
			let data = { orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo, loadType: 'bulk' }
			whTruckIntrustList(data).then(res => {
				let list = res.data
				list.map(item => {
					item.dispatchStatus_cn = getDictLabel('truckDispatchStatus', item.dispatchStatus)
					item.intrustStatus_cn = getDictLabel('truckIntrustStatus', item.intrustStatus)
					item.warehouseInoutType_cn = getDictLabel('warehouseInoutType', item.warehouseInoutType)
				})
				this.tableConfig.list = list && copyArry(list)
			}).finally(() => {
				this.lsLoading = false
			})
		},
		// 表格头部按钮回调
		tableClick(value) {
			let checked = this.$refs.defaultTableComp.selectedCheckbox.map(item => item.oid)
			if (checked.length <= 0) {
				this.dispatchStatusValue = ''
				this.$message({
					message: '请勾选委托信息',
					type: 'warning'
				})
				return false
			}
			this.$confirm('是否确认修改状态?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return whTruckIntrustUpdateIntrustStatus({
						status: value,
						oids: checked,
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo
					})
				})
				.then(response => {
					this.$message({
						type: 'success',
						message: '状态修改成功！',
						duration: 1000,
						onClose: () => {
							this.dispatchStatusValue = ''
							this.getList()
						}
					})
				})
				.catch(err => {
					this.dispatchStatusValue = ''
				})
		},
		// 删除
		handleDelete(row) {
			deleteAlert(this, whTruckIntrustDelete, { oid: row.oid, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }, this.deleteCallback)
		},
		// 删除回调
		deleteCallback() {
			// // 只有一条数据的时候 删除完 取上一页的数据
			// if (this.tableData.length === 1) {
			// 	this.tableQuery.currPage = 1
			// }
			this.showInfoDialog = false
			this.getList()
		},

		// 详情
		handleInfo(row) {
			let data = { oid: row.oid, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }
			bulkDetail(data).then(res => {
				this.in_formData = this.setTableData(res.data)
				this.in_formData.type = 'info'
				this.showInfoDialog = true
			})
		},

		// 保存
		handleSave(data) {
			console.log(data)
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
				this.showInfoDialog = false
				this.getList()
				this.$message({ type: 'success', message: '保存成功' })
			})
		},

		close() {
			this.showInfoDialog = false
		},
		// 点击详情时，整理数据
		setTableData(data) {
			data.truckLoads = (data.truckWarehouseLoads && copyArry(data.truckWarehouseLoads)) || []
			data.truckLoads.map(item => {
				item.truckLoadVos.map(o => Object.assign(o, o.truckDriver))
				item.truckCargos_copy = []
			})
			delete data.truckWarehouseLoads
			console.log(data)
			return data
		}
	}
}
</script>

<style lang="scss">
#car .default-table .row-tit {
	padding: 0 20px;
}
#car .default-table .row-table {
	padding: 0 20px;
}
#car .operateBtn-tip{
	padding: 0; 
	display: inline-block;
}
</style>
