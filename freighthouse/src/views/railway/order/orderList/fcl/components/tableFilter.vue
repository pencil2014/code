<template>
	<div class="table-filter">
		<div class="table-filter-left"></div>
		<div class="table-filter-right">
			<div class="pulish-status">
				<el-radio-group v-model="tableQuery.orderStatus" size="mini" @change="handleSearchByStatus">
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
			// if (this.isBd) {
			//   return {
			//     "all": "全部",
			//     "submit": "待审核",
			//     "draft": "未提交",
			//     "pass": "已审核",
			//     "refuse": "已拒绝",
			//     "complete": "已完成",
			//     "break": "已终止",
			//     "cancel": "已取消",
			//   }
			// }
			// if (this.isOp) {
			//   return {
			//     "all": "全部",
			//     "pass": "未处理",
			//     "operating": "处理中",
			//     "complete": "已完成",
			//     "break": "已终止",
			//     "cancel": "已取消",
			//   }
			// }
			return {
				all: '全部',
				pass: '未处理',
				operating: '处理中',
				complete: '已完成',
				break: '已终止',
				cancel: '已取消'
			}
		}
	},
	components: {},
	methods: {
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
			console.log(this.tableQuery.orderStatus)

			this.callback('SearchByOrderStatus')
		}
	}
}
</script>
<style scoped></style>
