<template>
	<div>
		<el-alert type="warning" :closable="false" class="orange">
			<template slot="title">
				<span class="txt">
					主单已发起取消，请确认是否需要取消{{params.serviceName}}的协同。
				</span>
				<el-button size="mini" type="text" class="underline" @click="handleCancel()">取消协同</el-button>
				<el-button size="mini" type="text" class="underline" @click="handleHold()">不取消协同</el-button>
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
		params: {
			type: Object,
			default: () => ({})
		},
		opName: {
			type: String,
			default: ''
		}
	},
	created() {},
	mounted() {},
	computed: {
	},
	components: {},
	watch: {},
	methods: {
		// 取消协同
		handleCancel(serviceCode) {
			jointCancelConfirm({
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo,
				serviceCode: '',
				cancelStatus: 'CANCEL'
			}).then(res => {
				this.$message({
					type: 'success',
					message: `取消协同成功`
				})
				this.$emit('getInfo')
			})
		},
		// 不取消协同
		handleHold(serviceCode) {
			jointCancelConfirm({
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo,
				serviceCode: '',
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
