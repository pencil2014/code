<template>
	<div class="table-filter">
		<div class="table-filter-left">
			<el-button size="mini" ref="btnCreate" @click="handleAdd('Add')" type="primary" v-if="isBd">
				新建
			</el-button>
			<el-button size="mini" ref="btnExport" @click="handleExport('Export')" plain>
				导出
			</el-button>
			<!-- <el-button size="mini" ref="btnCustomColumns" @click="handleCustomColumns" plain class="ml10">自定义表头</el-button> -->
		</div>

		<div class="table-filter-right">
			<el-checkbox v-model="isLoop" @change="changeIsLoop" v-if="$route.name === 'RailwayOrderList'">自动刷新</el-checkbox>
			<div class="pulish-status" style="margin-left: 10px">
				<el-radio-group v-model="tableQuery.orderStatus" size="mini" @change="handleSearchByStatus">
					<el-tooltip :content="tabTipsObj[index]" placement="top" effect="dark" v-for="(item, index) in statusOptions" :key="index">
						<el-radio-button size="mini" :label="index">{{ item }}</el-radio-button>
					</el-tooltip>
				</el-radio-group>
			</div>
		</div>
	</div>
</template>
<script>
import { orderMixin } from '@/views/railway/order/mixins/orderMixin'
import { mapMutations, mapState } from 'vuex'

export default {
	mixins: [orderMixin],
	data() {
		return {
			isLoop: false
		}
	},
	props: {
		curRole: {
			type: String,
			default: ''
		},
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
		},
		islLoop: {
      type: Boolean,
      default: false
    }
	},
	created() {},
	mounted() {},
	watch: {
		islLoop: {
			handler(newVal) {
				this.isLoop = newVal
			},
			immediate: true,
			deep: true
		}
	},
	computed: {
		...mapState({
			roles: state => state.user.roles
		}),
		isAc() {
			return this.roles.includes('ac')
		},
		isRc() {
			return this.roles.includes('rc')
		},
		isOp() {
			return ['op', 'bkg'].includes(this.curRole)
		},
		isEpricing() {
			return this.curRole === 'epricing'
		},
		isEcs() {
			return this.curRole === 'ecs'
		},
		isBd() {
			return this.curRole === 'bd'
		},
		isPricing() {
			return this.curRole === 'pricing'
		},
		statusOptions() {
			//商务角色
			if (this.isPricing) {
				return {
					all: '全部',
					mine: '我的业务',
					submit: '待审核',
					pass: '审核通过',
					release: '已放舱',
					refuse: '订舱拒绝'
				}
			}
			//业务角色
			if (this.isBd) {
				return {
					all: '全部',
					mine: '我的业务',
					submit: '待审核',
					draft: '未提交',
					pass: '已审核',
					refuse: '已拒绝',
					complete: '已完成',
					break: '已终止',
					cancel: '已取消',
					close: '已关闭'
				}
			}
			//操作角色
			if (this.isOp || this.isRc || this.isAc || this.isEpricing || this.isEcs) {
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
					all: '包含订单状态：待上级审核、草稿、待审核、审核通过、审核拒绝、完成、取消、终止、关闭',
					mine: '包含订单状态：待上级审核、草稿、待审核、审核通过、审核拒绝、完成、取消、终止、关闭',
					submit: '包含订单状态：待上级审核、待审核',
					draft: '包含订单状态：草稿',
					pass: '包含订单状态：审核通过',
					refuse: '包含订单状态：审核拒绝',
					complete: '包含订单状态：完成',
					dropped: '包含订单状态：审核通过、取消、终止、关闭',
					break: '包含订单状态：终止',
					cancel: '包含订单状态：取消',
					close: '包含订单状态：关闭'
				}
			}
			if (this.isOp || this.isRc || this.isAc || this.isEpricing || this.isEcs) {
				return {
					all: '包含订单状态：审核通过、完成、取消、终止、关闭',
					mine: '包含订单状态：待审核、审核通过、完成、取消、终止',
					pass: '包含订单状态：审核通过',
					complete: '包含订单状态：完成',
					break: '包含订单状态：终止',
          cancel: '包含订单状态：取消',
				}
      }
      if (this.isPricing) {
				return {
					all: '包含订单状态：待审核、审核通过、审核拒绝、完成、取消',
					mine: '包含订单状态：待上级审核、草稿、待审核、审核通过、审核拒绝、完成、取消、终止、关闭',
					submit: '包含订单状态：待上级审核、待审核',
					pass: '包含订单状态：审核通过',
					release: '包含订单状态：待审核、审核通过、审核拒绝、完成、取消',
					refuse: '包含订单状态：审核拒绝'
				}
			}
		},
	},
	components: {},
	methods: {
		changeIsLoop(val) {
      // console.log(val)
      this.$emit('changeIsLoop', val)
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
<style scoped>
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
</style>
