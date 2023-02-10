<template>
	<el-alert type="warning" :closable="false" class="violet">
		<template slot="title">
			<i class="tag-recall">撤</i>
			<span class="txt"> 你的{{ serviceInfo.serviceName }}协同已撤回申请，请及时审批。撤回原因：{{ serviceInfo.cancelReason | cancelReasonFilter }} 撤回备注：{{ serviceInfo.cancelRemark }} </span>
			<el-popover placement="top" width="160" v-model="item.visible" v-for="(item, index) in auditPop" :key="index">
				<p>是否{{ item.label }}撤回审批？</p>
				<div style="text-align: right; margin: 0">
					<el-button size="mini" type="text" @click="item.visible = false">放弃</el-button>
					<el-button type="primary" size="mini" @click="handleJointAudit(item)">{{ item.label }}</el-button>
				</div>
				<span :class="item.label === '通过' ? 'btn-yes' : 'btn-no'" slot="reference">{{ item.label }}</span>
			</el-popover>
		</template>
	</el-alert>
</template>
<script>
import { getDictLabel } from '@/utils/tools'
import { orderJointServiceCancelAudit } from '@/api/order/list'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
export default {
	mixins: [routerMixin],
	filters: {
		cancelReasonFilter(cancelReason) {
			return getDictLabel('jointCancelReason', cancelReason)
		}
	},
	data() {
		return {
			oQuery: this.$route.query,
			auditPop: [
				{ label: '通过', visible: false, value: 'accept' },
				{ label: '拒绝', visible: false, value: 'refuse' }
			]
		}
	},
	props: {
		serviceInfo: {
			type: Object,
			default: () => ({})
		},
		//传入服务项数组
		serviceList: {
			type: Array,
			default: () => []
		}
	},
	created() {},
	mounted() {},
	computed: {},
	components: {},
	watch: {},
	methods: {
		// 协同单撤回申请审核
		handleJointAudit(item) {
			let data = {
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo,
				id: this.serviceInfo.orderServiceId,
				cancelStatus: item.value
			}

			orderJointServiceCancelAudit(data).then(res => {
				this.$message({
					type: 'success',
					message: `审核${item.label}成功`,
					duration: 1000,
					onClose: () => {
						item.visible = false
						// this.$emit("callback")
						this.$store.dispatch('tagsView/delView', this.$route)
						if (this.serviceList.length > 1) {
							this.routerPush('OrderDetail', { ...this.$route.query, ...{ filterCode: this.serviceInfo.serviceCode } })
						} else {
							this.routerPush('JointList')
						}
					}
				})
			})
		}
	}
}
</script>
<style lang="scss"></style>
