<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<div class="table-com-layout" id="log">
			<el-table fit style="width: 100%" ref="log" :data="tableData">
				<!-- <el-table-column prop="name" label="操作名称" align="center"></el-table-column> -->
				<el-table-column prop="content" label="更新内容" align="center"></el-table-column>
				<el-table-column prop="bizTime" label="时间" align="center" width="150"></el-table-column>
				<el-table-column prop="bizEmployeeName" label="更新人" align="center" width="100"></el-table-column>
				<el-table-column prop="bizDeptName" label="更新人部门" align="center" width="150"></el-table-column>
			</el-table>
		</div>
	</BaseDialog>
</template>
<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { containerLogList } from '@/api/order/list'

export default {
	filters: {},
	data() {
		return {
			tableHeight: null,
			dialogConfig: {
				title: '日志',
				show: true,
				size: 'medium',
				width: '800px',
				showBtns: false
			},
			tableData: []
		}
	},
	props: {
		params: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		this.getLogList()
	},
	mounted() {},
	computed: {},
	components: {
		BaseDialog
	},
	watch: {},
	methods: {
		// 日志列表
		getLogList() {
			containerLogList({
				orderNo: this.$route.query.orderNo,
				containerId: this.params.oid
			}).then(res => {
				this.tableData = res.data
			})
		},

		close(action, value) {
			this.$emit('close', action, value)
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.close('Confirm')
			} else {
				this.close('Cancel')
			}
		}
	}
}
</script>
<style lang="scss">
</style>
