<template>
	<div>
		<span v-if="param.hblList">{{ mblText }}</span>
		<span v-else-if="param.agreeReleaseStatus === 'pass' && param.isAgreeRelease != 'y' && param.isMblAgreeRelease != 'y' && param.agreeApplyEmployeeId === userId"
			><el-button style="padding: 0" @click="handleBlDeliveryApprove" size="mini" type="text">{{ hblText }}</el-button></span
		>
		<span v-else>
			{{ hblText }}
		</span>
		<!-- 客户同意放货弹窗 -->
		<div v-if="blDeliveryApproveShow">
			<BlDeliveryApprove @close="blDeliveryApprovePopClose" :blMode="param.blMode" :agreePutQuery="{ ...param }" />
		</div>
	</div>
</template>

<script>
import clip from '@/utils/clipboard'
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import BlDeliveryApprove from '@/views/order/order/orderList/orderBook/components/blDeliveryApprove.vue'

export default {
	data() {
		return {
			blDeliveryApproveShow: false
		}
	},
	props: ['param', 'item'],
	created() {},

	mounted() {},
	computed: {
		...mapState({
			userId: state => state.user.userId
		}),
		mblText() {
			let str = getDictLabel('isAgreeRelease', this.param.isAgreeRelease)
			let passStr = this.param.agreeReleaseStatus === 'pass' ? '(已特殊审批)' : ''
			return `${str}${passStr}`
		},
		hblText() {
			return getDictLabel('isAgreeRelease', this.param.isAgreeRelease)
		}
	},
	watch: {},
	components: { BlDeliveryApprove },
	methods: {
		// 打开客户同意放货弹窗
		handleBlDeliveryApprove() {
			this.blDeliveryApproveShow = true
		},
		// 客户同意放货弹窗关闭回调
		blDeliveryApprovePopClose(action, value) {
			this.blDeliveryApproveShow = false
			if (action === 'Confirm') {
				this.item.method()
			}
		}
	}
}
</script>

<style lang="scss" scoped></style>
