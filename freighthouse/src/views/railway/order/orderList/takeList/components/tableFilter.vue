<template>
	<div class="table-filter">
		<div class="table-filter-left">
			<el-button size="mini" ref="btnExport" @click="handleExport('Export')" plain>
				{{ $t('charge.export') }}
			</el-button>
			<!-- <el-button size="mini" ref="btnCustomColumns" @click="handleCustomColumns" plain class="ml10">自定义表头</el-button> -->
			<el-button size="mini" @click="handleFinishTake" plain class="ml10">批量取单完成</el-button>
		</div>
		<div class="table-filter-right">
			<div class="pulish-status">
				<el-radio-group v-model="tableQuery.takeStatus" size="mini" @change="handleSearchByStatus">
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
			currRole: state => state.user.currRole,
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
				init: '待取单',
				finish: '已取单',
				isCancel: '已撤回',
				state: '已删除'
			}
		}
	},
	components: {},
	methods: {
		handleFinishTake() {
			this.callback('FinishTake')
		},
		// 自定义表头
		handleCustomColumns() {
			this.callback('CustomColumns')
		},
		// 导出
		handleExport() {
			this.$confirm('是否确认导出？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.callback('Export')
      })
		},
		// 按发布状态查询
		handleSearchByStatus(value) {
			Object.assign(this.tableQuery, {
				takeStatus: value
			})
			console.log(this.tableQuery.takeStatus)

			this.callback('SearchByTakeStatus')
		}
	}
}
</script>
<style scoped></style>
