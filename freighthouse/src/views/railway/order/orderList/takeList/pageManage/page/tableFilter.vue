<template>
	<div class="table-filter">
		<div class="table-filter-left">
			<el-button size="mini" ref="btnExport" @click="handleExport('Export')" plain>
				导出
			</el-button>
			<!-- <el-button size="mini" ref="btnCustomColumns" @click="handleCustomColumns" plain class="ml10">自定义表头</el-button> -->
			<el-button v-if="showAdd" size="mini" @click="handleAdd" plain class="ml10">新增提单纸</el-button>
		</div>
		<div class="table-filter-right">
			<div class="pulish-status">
				<el-radio-group v-model="tableQuery.paperStatus" size="mini" @change="handleSearchByStatus">
					<el-radio-button size="mini" v-for="(item, index) in statusOptions" :key="index" :label="item.value">{{ item.label }}</el-radio-button>
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
	created() {
	},
	mounted() {},
	computed: {
		...mapState({
			currRole: state => state.user.currRole,
			dictMap: state => state.dict.dictMap,
			userInfo: (state) => state.user.userInfo
		}),
		showAdd() {
			return this.userInfo.compCode === '000001' // 深圳分公司
		},
		statusOptions() {
			return [{ label: '全部', value: 'all' }, ...this.dictMap.blPaperStatus ]
		}
	},
	components: {},
	methods: {
		handleAdd() {
			this.callback('Add')
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
				paperStatus: value
			})
			console.log(this.tableQuery.paperStatus)

			this.callback('SearchByTakeStatus')
		}
	}
}
</script>
<style scoped></style>
