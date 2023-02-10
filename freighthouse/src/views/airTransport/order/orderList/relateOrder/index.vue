<template>
	<div class="edit-container order-book fullWrap" id="relateOrder">
		<div class="order-container">
			<div class="tabs-container">
				<!-- <TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" :custid="orderInfo.custid" @routerPush="handleToRoute" /> -->
				<div class="detail-container flex">
					<!-- <LeftNav :orderInfo="orderInfo" :activityKey="activityKey" @routerPush="handleToRoute" /> -->
					<div class="flex1 component-main-cont">
						<div class="service-container">
							 <CustInfo :orderInfo="airOrderInfo" />
							<!-- 进口单有关联出口单 -->
							<!-- 整箱有关联拼箱单 -->
							<div class="fileList-cont table-com-layout">
								<div class="air-relate-row">
									<div class="ft14" v-if="['air_import'].includes(airOrderInfo.businessType)">关联出口单</div>
									<div class="ft14" v-if="['air_export'].includes(airOrderInfo.businessType)">关联进口单</div>
									<!-- <div class="ft14"><el-button type="primary" size="mini" @click="showRelate">关联</el-button></div> -->
								</div>
								<el-table class="air-relate-order" style="width: 100%" fit highlight-current-row :data="relationList" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
									<el-table-column prop="orderNo" label="工作号" align="left" width="150">
										<template slot-scope="scope">
											<div style="color:#1890ff;cursor:pointer;" @click="handleInfo(scope.row)" class="column-text">{{ scope.row.orderNo }}</div>
										</template>
									</el-table-column>
									<el-table-column prop="serviceType" label="服务类型" align="left" width="150">
										<template slot-scope="scope">
											<div class="column-text">{{ scope.row.serviceType | serviceTypeFilter }}</div>
										</template>
									</el-table-column>
									<el-table-column prop="polPortName" label="起运港" align="left" min-width="150"> </el-table-column>
									<!-- <el-table-column prop="unloadingPortName" label="卸货港" align="left" min-width="150"> </el-table-column> -->
									<el-table-column prop="podPortName" label="目的地" align="left" min-width="150"> </el-table-column>
									<el-table-column prop="bdEmployeeName" label="销售" align="left" min-width="100"> </el-table-column>
									<el-table-column prop="bdDeptName" label="销售部门" align="left" min-width="150"> </el-table-column>
									<el-table-column prop="compDeptName" label="分公司" align="left" min-width="150"> </el-table-column>
									<el-table-column prop="bizDate" label="业务日期" align="left" width="150"> </el-table-column>
									<el-table-column prop="createdTime" label="订单创建时间" align="left" width="150"> </el-table-column>
								</el-table>
								<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { orderRelationList } from '@/api/order/list'
// import TopNav from '../components/topNav'
// import LeftNav from '../components/leftNav'
import CustInfo from '../components/custInfo'
import tableTooltip from '@/components/Base/Table/table-tooltip'

export default {
	filters: {
		serviceTypeFilter(serviceType) {
			return getDictLabel('diyServiceType', serviceType)
		}
	},
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			isShowRelate: false,
			oQuery: this.$route.query,
			tableData: [],
			relationList: [],
			activityKey: 'ChildOrderList',
			tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
			}
		}
	},
	created() {
		this.getRelationList()
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
	computed: {
		...mapState({
      airOrderInfo: (state) => state.airTransport.airOrderInfo
    }),
	},
	components: {
		// TopNav,
		// LeftNav,
		CustInfo,
		tableTooltip
	},
	methods: {
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
		// 去详情页
		async handleInfo(row) {
			let {data} = await orderRelationList({ orderNo: this.$route.query.orderNo })
			let routeUrl = this.$router.resolve({
        name: 'AirTransportOrderDetail',
        params: {
          orderNo: row.orderNo
        },
        query: {
          orderNo: row.orderNo,
          source: 'orderList',
          action: this.$route.query.action,
          showRelate: data && data.length ? true : false
        }
      })
      window.open(routeUrl.href, '_blank')
		},
		getRelationList() {
			orderRelationList({ orderNo: this.oQuery.orderNo }).then(res => {
				this.relationList = res.data
			})
		}
	}
}
</script>

<style lang="scss">
.air-relate-order.el-table .cell.el-tooltip {
	overflow: hidden;
}
.air-relate-row {
	display: flex;
	justify-content: space-between;
	margin-bottom: 10px;
	line-height: 20px;
	height: 20px;
}
</style>
