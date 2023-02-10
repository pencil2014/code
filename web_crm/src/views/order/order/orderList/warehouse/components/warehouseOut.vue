<template>
	<!-- 实际出仓 -->
	<div id="warehouseInplan" class="edit-row" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div class="default-table" id="tableCont">
			<div class="table-com-layout">
				<el-table :data="tableData" align="center" style="width: 100%">
					<el-table-column prop="planNo" label="出仓计划编号" align="center"> </el-table-column>
					<el-table-column prop="batchNo" label="出仓编码" align="center"> </el-table-column>
					<el-table-column prop="warehouseName" label="出仓仓库" align="center"> </el-table-column>
					<el-table-column prop="positionNo" label="仓位编码" align="center"> </el-table-column>
					<!-- <el-table-column prop="whBatchNo" label="外部仓库编码" align="center"> </el-table-column> -->
					<el-table-column prop="totalQuantity" label="实际出仓件数" align="center"> </el-table-column>
					<!-- <el-table-column prop="totalWeight" label="实际出仓毛重" align="center"> </el-table-column>
          <el-table-column prop="totalVolume" label="实际出仓体积" align="center"> </el-table-column> -->
					<el-table-column prop="outTime" label="实际出仓时间" align="center"> </el-table-column>
					<el-table-column label="操作" width="150" align="center" fixed="right">
						<template slot-scope="scope">
							<div v-if="scope.row.planNo" class="operate-group">
								<el-button @click="handleDetail(scope.row)" type="text" size="mini">详情</el-button>
								<!-- <el-button v-if="false" @click="handleDelete(scope.row)" type="text" size="mini" :disabled="!isOpTruck || isBd">删除</el-button> -->
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
		<!-- 实际进仓详情 -->
		<template v-if="showInWarehouse">
			<OutWarehouseDetail :isFinish="isFinish" :isDisabledEdit="isDisabledEdit" :isJoint="isJoint" :detailData="in_formData" :saveBarFixed="saveBarFixed" @close="close" @handleConfirm="handleSave"></OutWarehouseDetail>
		</template>
	</div>
</template>

<script>
// import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel, deleteAlert } from '@/utils/tools'
// import { handleWarehouseData } from '../../../js/handleData'
import DefaultTableComp from '../../../components/defaultTableComp'
import { orderWarehouseOutList, warehouseDetail, warehouseOutUpdate, getWarehouseInDelete } from '@/api/order/list'
import OutWarehouseDetail from './dialog/outWarehouseDetail'
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
			serviceInfoList: state => state.order.serviceInfoList
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
		isJoint() {
			let findItem = this.tabMenus.find(item => item.code === 'pol_warehouse')
			return findItem ? findItem.isJoint : false
		},
		isBd() {
			let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.isDoc || this.isAc
			return isBd || this.isJoint
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
		OutWarehouseDetail,
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
		// 获取so列表
		init() {
			this.getList()
		},
		getList() {
			this.lsLoading = true
			let data = { orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo, currPage: this.tableQuery.currPage, pageSize: this.tableQuery.pageSize }
			orderWarehouseOutList(data).then(res => {
				this.tableQuery.total = res.data.totalCount
				if (res.data.list && res.data.list.length > 0) {
					this.tableData = res.data.list.map(item => {
						item.status_zh = getDictLabel('warehouseOutplanStatus', item.status)
						item.cname = ''
						item.warehouseOutItems &&
							item.warehouseOutItems.map(cargo => {
								cargo.cname = cargo.cargoVo.cname
								cargo.mark = cargo.cargoVo.mark
								cargo.totalQuantity = cargo.quantity
								cargo.totalWeight = cargo.weight
								cargo.totalVolume = cargo.volume
								cargo.planNo = ''
							})
						return item
					})
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
			this.showInWarehouse = false
			this.getList()
		},
		// 详情
		handleDetail(row) {
			warehouseDetail({ oid: row.oid, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				res.data &&
					res.data.warehouseOutItems.map(item => {
						item.cname = item.cargoVo.cname
						item.mark = item.cargoVo.mark
					})
				this.in_formData = res.data
				this.showInWarehouse = true
			})
		},
		validate(data) {
			let hasCargo = true
			let hasPackageType = true
			hasCargo = data.warehouseOutItems.every(ele => ele.cname) && data.warehouseOutItems.length
			hasPackageType = data.warehouseOutItems.every(ele => ele.packageType) && data.warehouseOutItems.length
			if (!hasCargo) {
				this.$message({ type: 'error', message: '货品不能为空' })
				return false
			}
			if (!hasPackageType) {
				this.$message({ type: 'error', message: '包装单位不能为空' })
				return false
			}

			let { warehouseOutItems } = data
			let quanityCompare = warehouseOutItems.some(item => {
				return item.quantity && item.lastQuantity && item.quantity > item.lastQuantity
			})
			let weightCompare = warehouseOutItems.some(item => {
				return item.weight && item.lastWeight && item.weight > item.lastWeight
			})
			let volumeCompare = warehouseOutItems.some(item => {
				return item.volume && item.lastVolume && item.volume > item.lastVolume
			})
			if (quanityCompare) {
				this.$message.warning('实际出仓件数不能大于剩余库存件数')
				return false
			}
			if (weightCompare) {
				this.$message.warning('实际出仓毛重不能大于剩余库存毛重')
				return false
			}
			if (volumeCompare) {
				this.$message.warning('实际出仓体积不能大于剩余库存体积')
				return false
			}
			return true
		},
		// 保存
		handleSave(data) {
			console.log(data)

			data.jointNo = this.oQuery.jointNo
			data.orderNo = this.oQuery.orderNo
			if (!this.validate(data)) return
			warehouseOutUpdate(data).then(res => {
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

<style lang="scss"></style>
