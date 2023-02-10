<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<div class="table-com-layout">
			<el-table fit style="width: 100%" ref="checkPointTable" :data="tableData">
				<el-table-column prop="bizEmployeeName" label="处理人" align="center"></el-table-column>
				<el-table-column prop="bizTime" label="时间" align="center"></el-table-column>
				<el-table-column prop="content" label="内容" align="center"></el-table-column>
			</el-table>
		</div>
	</BaseDialog>
</template>
<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { mainCheckpointList } from '@/api/order/list'

export default {
	filters: {},
	data() {
		return {
			oQuery: this.$route.query,
			tableHeight: null,
			dialogConfig: {
				title: '操作记录',
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
		this.getCheckPointList()
	},
	mounted() {
		this.$nextTick(() => {
			this.tableHeight = window.innerHeight - this.$refs.checkPointTable.$el.offsetTop - 270
		})
	},
	computed: {},
	components: {
		BaseDialog
	},
	watch: {},
	methods: {
		// 记录列表
		getCheckPointList() {
			let orderNo = this.params.orderNo || this.params.bkgReqNo
			let jointNo = this.params.jointNo
			let serviceCode = 'book'
			mainCheckpointList({
				orderNo,
				jointNo,
				serviceCode
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
<style lang="scss"></style>
