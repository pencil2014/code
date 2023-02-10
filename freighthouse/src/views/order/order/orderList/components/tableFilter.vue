<template>
	<div class="table-filter">
		<div class="table-filter-left">
			<el-button size="mini" ref="btnCreate" @click="handleAdd('Add')" type="primary" v-if="isBd">
				新建
			</el-button>
			<el-button size="mini" ref="btnExport" @click="handleExport('Export')" plain>
				导出
			</el-button>
			
			<el-tooltip v-if="isOp" placement="top" effect="dark">
				<div slot="content">
					<div>1.订单状态为“审核通过”的订单，才可进行批量修改；</div>
					<div>2.相同业务类型+相同服务类型 的订单，才多选一起来批量修改。</div>
				</div>
				<el-button v-if="isOp" size="mini" ref="btnModify" @click="handleModify" plain>
					批量修改
				</el-button>
			</el-tooltip>
			<!-- <el-button size="mini" ref="btnCustomColumns" @click="handleCustomColumns" plain class="ml10">自定义表头</el-button> -->
			<el-button size="mini" ref="btnCustomColumns" @click="handleNotifyRelease" plain class="ml10" v-if="isBd">通知放舱</el-button>
			<el-dropdown v-if="isBd" @command="handleCommand" size="mini">
				<span class="el-dropdown-link"> 请选择甩柜指示<i class="el-icon-arrow-down el-icon--right"></i> </span>
				<el-dropdown-menu slot="dropdown">
					<el-dropdown-item command="AGREE_NOTIFY">同意,通知客户</el-dropdown-item>
					<el-dropdown-item command="AGREE">同意,不通知客户</el-dropdown-item>
					<el-dropdown-item command="DISAGREE">不同意</el-dropdown-item>
				</el-dropdown-menu>
			</el-dropdown>
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
		isRc() {
			return this.currRole === 'rc'
		},
		isOp() {
			return this.currRole === 'op'
		},
		isBkg() {
			return this.currRole === 'bkg'
		},
		isCsc() {
			return this.currRole === 'csc'
		},
		isEpricing() {
			return this.currRole === 'epricing'
		},
		isEcs() {
			return this.currRole === 'ecs'
		},
		isOpTruck() {
			return this.currRole === 'line_cs'
		},
		isBd() {
			return this.currRole === 'bd' || this.currRole === 'obd' || this.currRole === 'asst'
		},
		statusOptions() {
			// console.log('this.currRole', this.isBd, this.currRole)
			if (this.isBd) {
				return {
					all: '全部',
					mine: '我的业务',
					submit: '待审核',
					draft: '未提交',
					pass: '已审核',
					addStatusIsSubmit: '改柜（待审核）',
					refuse: '已拒绝',
					complete: '已完成',
					dropped: '已甩柜',
					break: '已终止',
					cancel: '已取消',
					close: '已关闭'
				}
			}
			if (this.isOp || this.isDoc || this.isRc || this.isAc || this.isOpTruck || this.isBkg || this.isCsc || this.isEpricing || this.isEcs) {
				let tabsOption = {
					all: '全部',
					mine: '我的业务',
					pass: '审核通过',
					// pass: '未处理',
					// operating: '处理中',
					complete: '已完成',
					drop: '待甩柜',
					break: '已终止',
					cancel: '已取消'
				}
				if (this.isOp) {
					tabsOption = {
						all: '全部',
						mine: '我的业务',
						pass: '审核通过',
						addStatusIsSubmit: '改柜(待审核)',
						// pass: '未处理',
						// operating: '处理中',
						complete: '已完成',
						drop: '待甩柜',
						break: '已终止',
						cancel: '已取消'
					}
				}
				return tabsOption
			}
		},
		tabTipsObj() {
			// console.log('this.currRole', this.isBd, this.currRole)
			if (this.isBd) {
				return {
					all: '包含订单状态：待上级审核、草稿、待审核、审核通过、审核拒绝、完成、取消、终止、关闭',
					mine: '包含订单状态：待上级审核、草稿、待审核、审核通过、审核拒绝、完成、取消、终止、关闭',
					submit: '包含订单状态：待上级审核、待审核',
					draft: '包含订单状态：草稿',
					pass: '包含订单状态：审核通过',
					addStatusIsSubmit: '包含调整箱型箱量待审核的订单',
					refuse: '包含订单状态：审核拒绝',
					complete: '包含订单状态：完成',
					// dropped: '包含订单状态：审核通过、取消、终止、关闭',
					break: '包含订单状态：终止',
					cancel: '包含订单状态：取消',
					close: '包含订单状态：关闭'
				}
			}
			if (this.isOp || this.isDoc || this.isRc || this.isAc || this.isOpTruck || this.isBkg || this.isCsc || this.isEpricing || this.isEcs) {
				let tabsTipOption = {
					all: '包含订单状态：审核通过、完成、取消、终止、关闭',
					mine: '包含订单状态：待审核、审核通过、完成、取消、终止',
					pass: '包含订单状态：审核通过',
					// pass: '未处理',
					// operating: '处理中',
					complete: '包含订单状态：完成',
					// drop: '包含订单状态：审核通过、取消',
					break: '包含订单状态：终止',
					cancel: '包含订单状态：取消'
				}
				if (this.isOp) {
					Object.assign(tabsTipOption, {
						addStatusIsSubmit: '包含调整箱型箱量待审核的订单',
					})
				}
				return tabsTipOption
			}
		}
	},
	components: {},
	methods: {
		handleCommand(val) {
			this.$emit('dropCheck', val)
		},
		handleModify(){
			this.callback('Modify')
		},
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

		// 生成结算单
		handleGenerateStatement() {
			console.log('生成结算单')
		},

		// 通知放舱
		handleNotifyRelease() {
			this.callback('NotifyRelease')
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
