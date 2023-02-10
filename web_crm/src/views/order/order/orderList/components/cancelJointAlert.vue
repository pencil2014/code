<template>
	<div style="background: #FDF2E8; padding: 5px 0;" v-if="cancelHandleList && cancelHandleList.length">
		<el-alert type="warning" :closable="false" class="orange cancel-joint-alert" v-for="item in cancelHandleList" :key="item.serviceCode">
			<template slot="title">
				<span class="txt">
					主单已发起取消，请确认是否需要取消{{item.serviceName}}的协同。
				</span>
				<el-button size="mini" type="text" class="underline" @click="handleCancel(item.serviceCode)">取消协同</el-button>
				<el-button size="mini" type="text" class="underline" @click="handleHold(item.serviceCode)">不取消协同</el-button>
			</template>
		</el-alert>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { jointCancelConfirm } from '@/api/order/list'
export default {
	data() {
		return {
			oQuery: this.$route.query,
			// 服务项serviceCode对应的前端组件
			serviceCodeRoutes: {
				'whbook': 'LclWhBook',
				'proxy_whbook': 'LclWhBook',
				'book': 'OrderBook',
				'proxy_book': 'OrderBook',
				'truck': 'ShippingTruck',
				'fume': 'Fume',
				'pol_declaration': 'Clearance',
				'pol_ltl': 'PolLtl',
				'ocean_manifest': 'BehalfRecordManifest',
				'ciq': 'InspectionAndDetection',
				'pol_warehouse': 'Warehouse',
				'discharge_release': 'DischargeRelease',
				'internal_trade_barge': 'InternalTradeBarge',
				'pod_fcl_delivery': 'PodFclDelivery',
				'pod_ltl_delivery': 'PodLtlDelivery',
				'pod_comm_clearance': 'PodCommClearance',
				'pod_change_doc': 'PodChangeDoc',
				'pod_warehouse': 'PodWarehouseIng',
				'stuffing': 'YardBox'
			}
		}
	},
	props: {
		opName: {
			type: String,
			default: ''
		}
	},
	created() {},
	mounted() {},
	computed: {
		...mapState({
      orderInfoDataObj: (state) => state.order.orderInfoDataObj
		}),
		// 协同取消提示放在服务项页面顶部和进口拼箱订单详情顶部（因为它隐藏掉了左侧的订仓服务项）
		cancelHandleList() {
			return this.orderInfoDataObj.serviceInfoList.filter(item => item.cancelStatus === 'INIT' && (this.serviceCodeRoutes[item.serviceCode] === this.$route.name || (this.$route.name === 'JointOrderDetail' && ['st09','st10','st11','st12'].includes(this.orderInfoDataObj.serviceType))))
		}
	},
	components: {},
	watch: {},
	methods: {
		// 取消协同
		handleCancel(serviceCode) {
			jointCancelConfirm({
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo,
				serviceCode: serviceCode,
				cancelStatus: 'CANCEL'
			}).then(res => {
				this.$message({
					type: 'success',
					message: `取消协同成功`
				})
				if (this.cancelHandleList.length === 1) {
					window.close()
				}
				this.$emit('getInfo')
			})
		},
		// 不取消协同
		handleHold(serviceCode) {
			jointCancelConfirm({
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo,
				serviceCode: serviceCode,
				cancelStatus: 'HOLD'
			}).then(res => {
				this.$message({
					type: 'success',
					message: `不取消协同成功`
				})
				this.$emit('getInfo')
			})
		}
	}
}
</script>
<style lang="scss"></style>
