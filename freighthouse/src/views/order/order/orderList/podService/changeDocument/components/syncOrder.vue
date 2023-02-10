<template>
	<el-button @click="syncService" style="margin-right: 10px; margin-left: auto" type="primary" size="mini">同步出口单</el-button>
</template>

<script>
import { mapState } from 'vuex'
import { importServiceSync } from '@/api/order/list'

export default {
	data() {
		return {}
	},
	props: {
		serviceCode: {
			type: String,
			default: ''
		}
	},
	created() {},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	watch: {},
	components: {},
	methods: {
		syncService() {
			this.$confirm('是否要从出口单同步数据？ 此操作会清空当前服务项已有信息', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					importServiceSync({ orderNo: this.$route.query.orderNo, serviceCode: this.serviceCode }).then(res => {
						if (res.code === 0) {
							this.$message.success('同步成功!')
							this.$emit('setType')
						}
					})
				})
				.catch(() => {})
		}
	}
}
</script>

<style lang="scss" scoped></style>
