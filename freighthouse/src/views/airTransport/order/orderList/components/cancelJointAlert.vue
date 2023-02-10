<template>
	<div>
		<el-alert type="warning" :closable="false" class="orange" v-for="item in cancelHandleList" :key="item.serviceCode">
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
			serviceCodeRoutes: {
				'air_pol_declaration': 'AirClearance',
				'pick_up': 'AirPolLtl',
				'air_doc': 'AirDocument',
				'insurance': 'AirInsurance'
			}
		}
	},
	props: {
	},
	created() {},
	mounted() {},
	computed: {
		...mapState({
      airOrderInfo: (state) => state.airTransport.airOrderInfo,
		}),
		cancelHandleList() {
			let result = []
			// 进口-订单详情展示所有的服务项协同取消提示
			if (this.airOrderInfo.businessType === 'air_import') {
				if (this.$route.name === 'AirTransportOrderDetail') {
					result = this.airOrderInfo.serviceInfoList.filter(item => item.cancelStatus === 'INIT')
				}
			} 
			// 出口-报关，贸易单证，保险的页面各自展示对应服务项协同的取消提示，订单详情的展示其他的服务项协同取消的提示
			if (this.airOrderInfo.businessType === 'air_export') {
				if (this.$route.name === 'AirTransportOrderDetail') {
					result = this.airOrderInfo.serviceInfoList.filter(item => item.cancelStatus === 'INIT' && !this.serviceCodeRoutes[item.serviceCode])
				} else {
					result = this.airOrderInfo.serviceInfoList.filter(item => item.cancelStatus === 'INIT' && this.serviceCodeRoutes[item.serviceCode] === this.$route.name)
				}
			}
			return result
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
