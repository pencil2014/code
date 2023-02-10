<template>
	<div class="edit-container order-book" id="fileList" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div style="margin:0;" class="order-container">
			<!-- 订单已取消提示 -->
			<CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
			<!-- 订单拒绝提示 -->
			<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
			<div class="tabs-container">
				<TopNav :serviceType="orderInfo.main && orderInfo.main.serviceType" :activityKey="activityKey" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<div class="flex1 component-main-cont">
						<div class="service-container">
							<CustInfo :orderInfo="orderInfo.main" />
							<div class="fileList-cont table-com-layout">
								<div class="childOrderList-row">
									<div class="ft14">关联订单</div>
									<div class="ft14"><el-button type="primary" size="mini" @click="showRelate">关联</el-button></div>
								</div>
								<el-table class="relate-order" style="width: 100%" fit highlight-current-row :data="tableData" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
									<el-table-column width="150" prop="orderNo" label="工作号" align="center">
										<template slot-scope="scope">
											<div style="color:#1890ff;cursor:pointer;" @click="handleInfo(scope.row)" class="column-text">{{ scope.row.orderNo }}</div>
										</template>
									</el-table-column>
									<el-table-column prop="hblNo" label="HBL单号" align="center">
										<template slot-scope="scope">
											<div class="column-text">{{ scope.row.hblNo }}</div>
										</template>
									</el-table-column>
									<el-table-column prop="porPortName" label="收货地" align="center"> </el-table-column>
									<el-table-column prop="polPortName" label="起运站" align="center"> </el-table-column>
									<el-table-column prop="podPortName" label="目的站" align="center"> </el-table-column>
									<el-table-column prop="bdEmployeeName" label="销售" align="center" width="100"> </el-table-column>
									<el-table-column prop="bizDate" label="业务日期" align="center" width="150"> </el-table-column>
									<el-table-column prop="createdTime" label="订单创建时间" align="center" width="150"> </el-table-column>
									<el-table-column prop="quantity" label="总件数" align="center" width=""> </el-table-column>
									<el-table-column prop="weight" label="总毛重" align="center" width=""> </el-table-column>
									<el-table-column prop="volume" label="总体积" align="center" width=""> </el-table-column>
									<el-table-column prop="hscode" label="HSCODE" align="center" width="">
										<template slot-scope="scope">
											<div class="column-text">{{ scope.row.hscode }}</div>
										</template>
									</el-table-column>
									<el-table-column prop="cname" label="中文品名" align="center" width="">
										<template slot-scope="scope">
											<div class="column-text">{{ scope.row.cname }}</div>
										</template>
									</el-table-column>
									<el-table-column prop="ename" label="英文品名" align="center" width=""> </el-table-column>
									<el-table-column label="操作" align="center">
										<template slot-scope="scope">
											<el-button size="mini" type="primary" @click="handleRemove(scope.row.orderNo)">移除</el-button>
										</template>
									</el-table-column>
								</el-table>
								<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<el-dialog title="关联订单" :visible.sync="isShowRelate" width="80%" :before-close="handleCloseRelate">
			<LclRelate v-if="isShowRelate" @closeRelate="handleCloseRelate" @getList="lclChildList" ref="lclRelate" />
			<span slot="footer" class="dialog-footer">
				<el-button size="mini" @click="handleCloseRelate">取 消</el-button>
				<el-button size="mini" type="primary" @click="handleConfirm">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>
<script>
import { orderMixin } from '@/views/railway/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { railOrderLclList, lclFclUnbind } from '@/api/railway/list'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import CustInfo from '../components/custInfo'
import LclRelate from './lclRelate'
import tableTooltip from '@/components/Base/Table/table-tooltip'

export default {
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			isShowRelate: false,
			oQuery: this.$route.query,
			tableData: [],
			activityKey: 'ChildOrderList',
			tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
			}
		}
	},
	created() {
		this.getOrderInfo()
		this.lclChildList()
	},
	mounted() {
		if (window.history && window.history.pushState) {
			history.pushState(null, null, document.URL)
			window.addEventListener('popstate', this.browserBack, false)
		}
	},

	destroyed() {
		window.removeEventListener('popstate', this.browserBack, false)
	},
	computed: {},
	components: {
		CancelAlert,
		RefuseAlert,
		TopNav,
		CustInfo,
		LclRelate,
		tableTooltip
	},
	methods: {
		// 去详情页
		handleInfo(row) {
			let action = ''
			this.isJumpRouteFromPage = true
			let routeUrl = this.$router.resolve({
				name: 'RailwayOrderDetail',
				params: {
					orderNo: row.orderNo
				},
				query: {
					orderNo: row.orderNo,
					source: 'orderList',
					action: action
				}
			})
			window.open(routeUrl.href, '_blank')
		},
		// 鼠标移入cell
		showTooltip(row, column, cell) {
			this.tableCellMouse.cellDom = cell
			this.tableCellMouse.row = row
			this.tableCellMouse.hidden = false
		},
		// 鼠标移出cell
		hiddenTooltip() {
			this.tableCellMouse.hidden = true
		},
		handleRemove(val) {
			console.log('🚀 ~ val', val)
			lclFclUnbind({ orderNo: this.oQuery.orderNo, lclOrderNo: val }).then(res => {
				this.$message.success('移除成功!')
				this.lclChildList()
			})
		},
		handleConfirm() {
			this.$refs.lclRelate.lclFclBind()
		},
		handleCloseRelate() {
			this.isShowRelate = false
		},
		showRelate() {
			this.isShowRelate = true
		},
		lclChildList() {
			railOrderLclList({ orderNo: this.oQuery.orderNo }).then(res => {
				this.tableData = res.data
			})
		}
	}
}
</script>

<style lang="scss">
@import '../../less/index.scss';
.relate-order.el-table .cell.el-tooltip {
	overflow: hidden;
}
.childOrderList-row {
	display: flex;
	justify-content: space-between;
	margin-bottom: 10px;
	line-height: 20px;
	height: 20px;
}
</style>
