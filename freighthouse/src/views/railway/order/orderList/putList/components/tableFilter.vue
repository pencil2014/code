<template>
	<div class="table-filter">
		<div class="table-filter-left">
			<el-dropdown size="small" @command="handleCommand" v-if="roles.includes('manager')">
				<el-button size="mini" type="default">导出<i class="el-icon-arrow-down el-icon--right"></i> </el-button>
				<el-dropdown-menu slot="dropdown" class="put-dropdown-class">
					<el-dropdown-item :command="item.value" v-for="(item, index) in exportTypeOptions" :key="index">{{ item.label }}</el-dropdown-item>
				</el-dropdown-menu>
			</el-dropdown>
			<el-button v-else size="mini" ref="btnExport" @click="handleExport" plain>导出</el-button>
			<el-button class="ml10" size="mini" ref="btnExport" @click="handleOrder" plain>批量寄单</el-button>
			<el-button class="ml10" size="mini" @click="handleNoPut" plain>未放单反馈</el-button>
			<!-- <el-button size="mini" ref="btnCustomColumns" @click="handleCustomColumns" plain class="ml10">自定义表头</el-button> -->
			<!-- <el-button size="mini" ref="btnPutFinish" @click="handlePutFinish" plain class="ml10">批量放单完成</el-button>  0310版本隐藏此功能 -->
		</div>
		<div class="table-filter-right">
			<div class="pulish-status">
				<el-radio-group v-model="tableQuery.putStatus" size="mini" @change="handleSearchByStatus">
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
		return {
			exportTypeOptions: [
				{ label: '列表数据', value: 'list_data' },
				{ label: '绩效表', value: 'performance_table' }
			]
		}
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
			roles: state => state.user.roles,
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
				submit: '待审核/同意',				
				init: '提单未放单',
				finish: '提单已放单',
				isCancel: '已撤回',
				state: '已删除'
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
			this.$confirm('是否确认导出？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				this.callback('Export')
			})
		},
		handleOrder() {
			// 批量寄单
			this.callback('Order')
		},
		handleNoPut() {
			// 批量寄单
			this.callback('NoPut')
		},
		handleCommand(command) {
			if (command === 'list_data') {
				this.handleExport()
			} else {
				this.callback('PerformanceExport')
			}
		},
		// 新增寄单任务
		handleAddPost() {},
		// 按发布状态查询
		handleSearchByStatus(value) {
			Object.assign(this.tableQuery, {
				putStatus: value
			})
			console.log(this.tableQuery.putStatus)

			this.callback('SearchByPutStatus')
		},
		handlePutFinish() {
			this.callback('PutFinish')
		}
	}
}
</script>
<style scoped lang="scss">
.table-filter {
	.put-dropdown-class {
		top: 140px !important;
	}
	.ml10 {
		margin-left: 10px;
	}
}
</style>
