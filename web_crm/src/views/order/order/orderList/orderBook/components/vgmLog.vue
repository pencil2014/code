<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<div class="table-com-layout" id="vgmLog">
			<el-table fit style="width: 100%" ref="vgmLog" :data="tableData" :row-class-name="tableRowClassName">
				<el-table-column prop="cn" label="关联箱号" align="center"></el-table-column>
				<el-table-column prop="numbers" label="修改次数" align="center"></el-table-column>
				<el-table-column label="是否有效" align="center">
					<template slot-scope="scope">
						{{scope.$index ? '否' : '是'}}
					</template>
				</el-table-column>
				<el-table-column prop="totalWeight" label="VGM总重" align="center"></el-table-column>
				<el-table-column prop="goodsWeight" label="货重" align="center"></el-table-column>
				<el-table-column prop="emptyWeight" label="空柜重量" align="center"></el-table-column>
			</el-table>
		</div>
	</BaseDialog>
</template>
<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { vgmHistoryList } from '@/api/order/list'

export default {
	filters: {},
	data() {
		return {
			oQuery: this.$route.query,
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
	mounted() {
		this.$nextTick(() => {
			this.tableHeight = window.innerHeight - this.$refs.vgmLog.$el.offsetTop - 270
		})
	},
	computed: {},
	components: {
		BaseDialog
	},
	watch: {},
	methods: {
		tableRowClassName({row, rowIndex}) {
			if (rowIndex) {
				return 'invalid-row'
			}
			return ''
		},
		// 日志列表
		getLogList() {
			vgmHistoryList({
				reportId: this.params.reportId
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
#vgmLog .el-table tr.invalid-row{
	td .cell{
		color: #bbb;
	}
}
</style>
