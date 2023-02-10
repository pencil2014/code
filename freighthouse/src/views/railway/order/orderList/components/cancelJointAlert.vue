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
		}
	},
	props: {
	},
	created() {},
	mounted() {},
	computed: {
		...mapState({
      orderInfoDataObj: (state) => state.railway.orderInfoDataObj
		}),
		cancelHandleList() {
			return this.orderInfoDataObj.serviceInfoList.filter(item => item.cancelStatus === 'INIT')
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
