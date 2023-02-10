<template>
	<div class="table-filter">
		<div class="table-filter-left">
			<el-button size="mini" ref="btnExport" @click="handleExport('Export')" plain>
				{{ $t('charge.export') }}
			</el-button>
			<!-- <el-button size="mini" ref="btnCustomColumns" @click="handleCustomColumns" plain class="ml10">自定义表头</el-button> -->
		</div>
		<div class="table-filter-right">
			<div class="pulish-status">
				<el-radio-group v-model="tableQuery.dnCheckStatus" size="mini" @change="handleSearchByStatus">
					<el-radio-button size="mini" v-for="(item, index) in statusOptions" :key="index" :label="index">{{ item }}</el-radio-button>
				</el-radio-group>
			</div>
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'

export default {
	data() {
		return {}
	},
	props: {
		config: {
			type: Object,
			default: () => ({})
		},
		// 接口传参
		tableQuery: {
			type: Object,
			default: () => ({})
		},
		callback: {
			type: Function,
			default: () => ({})
		}
	},
	created() {},
	mounted() {},
	computed: {
		...mapState({
			currRole: state => state.order.currRole,
			dictMap: state => state.dict.dictMap
		}),
		isAc() {
			return this.currRole === 'ac'
		},
    isDoc() {
			return this.currRole === 'doc'
		},
		isOp() {
			return this.currRole === 'op'
		},
		isBd() {
			return this.currRole === 'bd' || this.currRole === 'obd'
		},
		statusOptions() {
			return {
				all: '全部',
				submit: '待审核',
				pass: '已通过',
				refuse: '已拒绝',
				state: '已取消'
			}
		}
	},
	components: {},
	methods: {
		// 自定义表头
		handleCustomColumns() {
			this.callback('CustomColumns')
		},
		// 导出
		handleExport() {
			this.callback('Export')
		},
		// 按发布状态查询
		handleSearchByStatus(value) {
			Object.assign(this.tableQuery, {
				dnCheckStatus: value
			})
			console.log(this.tableQuery.dnCheckStatus)

			this.callback('SearchByOrderStatus')
		}
	}
}
</script>
<style scoped></style>
