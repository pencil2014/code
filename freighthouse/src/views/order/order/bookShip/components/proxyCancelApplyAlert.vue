<template>
	<div>
		<el-alert type="warning" :closable="false" class="orange">
			<template slot="title">
				<span class="txt">
					订单{{$route.query.orderNo}},已发起撤回申请，撤回原因：{{params.submitCancelRemark}}。请审核是否同意撤回。
				</span>
				<el-button size="mini" type="text" class="underline" @click="handleAccept()">同意撤回</el-button>
				<el-button size="mini" type="text" class="underline" @click="handleRefuse()">不同意撤回</el-button>
			</template>
		</el-alert>
		<ProxyRefuseCancel @close="proxyRefuseCancelClose" v-if="proxyRefuseCancelShow"/>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { proxyCancelHandle } from '@/api/order/list'
import ProxyRefuseCancel from './proxyRefuseCancelPop'
export default {
	data() {
		return {
			oQuery: this.$route.query,
			proxyRefuseCancelShow: false
		}
	},
	props: {
		params: {
			type: Object,
			default: () => ({})
		},
	},
	created() {},
	mounted() {},
	computed: {
	},
	components: {ProxyRefuseCancel},
	watch: {},
	methods: {
		// 同意
		handleAccept() {
			this.$confirm('请确认是否同意该撤回申请', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				proxyCancelHandle({ 
					orderNo: this.$route.query.orderNo,
					cancelStatus: 'ACCEPT'
				}).then(res => {
					if (this.$route.name === 'BookDetail') {
						this.$message({ 
							message: '同意撤回成功',
							type: 'success',
							duration: 1000,
							onClose: () => {
								window.close()
							} 
						})
					} else {
						this.$message({ message: '同意撤回成功', type: 'success' })
						this.$emit('getInfo')
					}
				})
			}).catch(err => {

			})
		},
		// 不同意
		handleRefuse(serviceCode) {
			this.proxyRefuseCancelShow = true
		},
		proxyRefuseCancelClose(action, values) {
			if (action === 'Confirm') {
				proxyCancelHandle({ 
					orderNo: this.$route.query.orderNo,
					cancelStatus: 'REFUSE',
					refuseRemark: values.refuseRemark
				}).then(res => {
					this.proxyRefuseCancelShow = false
					this.$emit('getInfo')
					this.$message({ message: '不同意撤回成功', type: 'success' })
				})
			} else {
				this.proxyRefuseCancelShow = false
			}
		}
	}
}
</script>
<style lang="scss"></style>
