<template>
	<div class="table-filter">
		<div class="table-filter-left">
			<el-button size="mini" ref="btnCreate" @click="handleAdd('Add')" type="primary" v-if="isBd">
				新建
			</el-button>
			<el-button size="mini" ref="btnExport" @click="handleExport('Export')" plain>
				导出
			</el-button>
		</div>

		<div class="table-filter-right filter-tooltip-class">
			<div class="pulish-status">
				<el-radio-group v-model="tableQuery.orderStatus" size="mini" @change="handleSearchByStatus">
					<span v-for="(item, index) in statusOptions" :key="index">
             <el-tooltip v-if="tabTipsObj[index]" :content="tabTipsObj[index]" placement="top" effect="dark">
								<el-radio-button size="mini" :label="index">{{ item }}</el-radio-button>
						 </el-tooltip>
						 <el-radio-button v-else size="mini" :label="index">{{ item }}</el-radio-button>
					</span>
					
				</el-radio-group>
			</div>
		</div>
	</div>
</template>
<script>
import { orderMixin } from '@/views/order/order/mixins/orderMixin'

export default {
	mixins: [orderMixin],
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
	mounted() {
		// console.log("🚀 ~ this.tableQuery.orderStatus", this.tableQuery.orderStatus)
	},
    
	computed: {
		isAc() {
			return this.currRole === 'ac'
		},
		isOpCustoms() {
			return this.currRole === 'op_customs'
		},
		isBd() {
			return this.currRole === 'bd' || this.currRole === 'obd' || this.currRole === 'asst'
		},
		statusOptions() {
			if (this.isBd) {
				return {
					all: '全部',
					mine: '我的业务',
					draft: '未提交',
					pass: '已审核',
					// refuse: '已拒绝',
					complete: '已完成',
					break: '已终止',
					cancel: '已取消',
					// close: '已关闭'
				}
			}
			if (this.isAc || this.isOpCustoms) {
				return {
					all: '全部',
					mine: '我的业务',
					pass: '审核通过',
					complete: '已完成',
					break: '已终止',
					cancel: '已取消'
				}
			}
		},
		tabTipsObj() {
			if (this.isBd) {
				return {
					all: '包含订单状态：待上级审核、草稿、审核通过、审核拒绝、完成、取消、终止、关闭',
					mine: '包含订单状态：待上级审核、草稿、、审核通过、审核拒绝、完成、取消、终止、关闭',
					submit: '包含订单状态：待上级审核',
					draft: '包含订单状态：草稿',
					pass: '包含订单状态：审核通过',
					// refuse: '包含订单状态：审核拒绝',
					complete: '包含订单状态：完成',
					break: '包含订单状态：终止',
					cancel: '包含订单状态：取消',
					// close: '包含订单状态：关闭'
				}
			}
			if (this.isOp || this.isOpCustoms) {
				return {
					all: '包含订单状态：审核通过、完成、取消、终止、关闭',
					mine: '包含订单状态：审核通过、完成、取消、终止',
					pass: '包含订单状态：审核通过',
					complete: '包含订单状态：完成',
					break: '包含订单状态：终止',
					cancel: '包含订单状态：取消'
				}
			}
		}
	},
	components: {},
	methods: {
		// 新建
		handleAdd() {
			this.callback('Add')
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

		// 自定义表头
		handleCustomColumns() {
			this.callback('CustomColumns')
		},

		// 按发布状态查询
		handleSearchByStatus(value) {
			Object.assign(this.tableQuery, {
				orderStatus: value
			})
			this.callback('SearchByOrderStatus')
		}
	}
}
</script>
<style lang="scss" scoped>
.el-dropdown {
	height: 20px;
	display: flex;
	align-items: center;
	border: 1px solid #dcdfe6;
	margin-left: 10px;
	border-radius: 3px;
	padding: 0 8px;
	font-size: 12px;
}
.el-dropdown-link {
	cursor: pointer;
	color: #606266;
}
.filter-tooltip-class {
	.pulish-status {
		/deep/.el-radio-group {
			.el-radio-button__inner {
         border-radius: 0;
			}
		}
		/deep/.el-radio-group {
			span:not(:first-child) {
				.el-radio-button__inner {
					border-left: 0;
				}
			}
			span .is-active {
        .el-radio-button__inner {
					border-left: 1px #1890ff solid;
				}
			}
			span:first-child {
				.el-radio-button__inner {
           border-radius: 4px 0 0 4px;
				}
			}
			span:last-child {
				.el-radio-button__inner {
           border-radius: 0 4px 4px 0;
				}
			}
		}
	}
}
</style>
