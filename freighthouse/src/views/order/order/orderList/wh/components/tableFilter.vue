<template>
	<div class="table-filter">
		<div class="table-filter-left">
			<el-button size="mini" ref="btnCreate" @click="handleAdd('Add')" type="primary" v-if="isBd && $route.name === 'WhOrderList'">
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
		isDoc() {
			return this.currRole === 'doc'
		},
		isOp() {
			return this.currRole === 'op'
		},
		isEcs() {
			return this.currRole === 'ecs'
		},
		isBd() {
			return this.currRole === 'bd' || this.currRole === 'obd' || this.currRole === 'asst'
		},
		statusOptions() {
			let statusTabsObj = {}
			// 订单列表
			if (this.$route.name === 'WhOrderList') {
				if (this.isBd) {
					statusTabsObj = {
						all: '全部',
						mine: '我的业务',
						draft: '未提交',
						pass: '已提交',
						complete: '已完成',
						break: '已终止',
						cancel: '已取消',
					}
				}
				if (this.isOp || this.isDoc || this.isAc || this.isEcs) {
					statusTabsObj = {
						all: '全部',
						mine: '我的业务',
						pass: '审核通过',
						complete: '已完成',
						break: '已终止',
						cancel: '已取消'
					}
				}
			}
			// 协同单tabs
			if (this.$route.name === 'WhJointList') {
				statusTabsObj = {
					"all": "全部",
					"unFinished": "未完成",
					"cancelApply": "撤回申请",
					"finished": "已完成"
				}
			}
			return statusTabsObj
		},
		tabTipsObj() {
			// console.log('this.currRole', this.isBd, this.currRole)
			let tabTipsObj = {}
			// 订单列表
			if (this.$route.name === 'WhOrderList') {
				if (this.isBd) {
					tabTipsObj = {
						all: '包含订单状态：待上级审核、草稿、审核通过、完成、取消、终止',
						mine: '包含订单状态：待上级审核、草稿、审核通过、完成、取消、终止',
						draft: '包含订单状态：草稿',
						pass: '包含订单状态：审核通过',
						complete: '包含订单状态：完成',
						break: '包含订单状态：终止',
						cancel: '包含订单状态：取消',
					}
				}
				if (this.isOp || this.isDoc || this.isAc || this.isEcs) {
					tabTipsObj = {
						all: '包含订单状态：审核通过、完成、取消、终止、关闭',
						mine: '包含订单状态：待审核、审核通过、完成、取消、终止',
						pass: '包含订单状态：审核通过',
						complete: '包含订单状态：完成',
						break: '包含订单状态：终止',
						cancel: '包含订单状态：取消'
					}
				}
			}
			// 协同单tabs
			if (this.$route.name === 'WhJointList') {
				tabTipsObj = {
					'all': '包含订单状态：审核通过、完成、取消、终止',
					'unFinished': '包含订单状态：审核通过、取消、终止',
					'cancelApply': '包含订单状态：审核通过、取消、终止',
					'finished': '包含订单状态：审核通过、完成、取消、终止',
				}
			}
			return tabTipsObj
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
			this.callback('Export')
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
