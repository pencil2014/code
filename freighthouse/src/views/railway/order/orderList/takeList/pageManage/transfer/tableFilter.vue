<template>
	<div class="table-filter">
		<div class="table-filter-left">
			<el-button size="mini" @click="handleApply" plain >申请提单纸</el-button>
		</div>
		<div class="table-filter-right">
			<div class="pulish-status">
				<el-radio-group v-model="tableQuery.transferStatus" size="mini" @change="handleSearchByStatus">
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
	created() {},
	mounted() {},
	computed: {
		...mapState({
			currRole: state => state.user.currRole,
			dictMap: state => state.dict.dictMap
		}),
		statusOptions() {
			return [{ label: '全部', value: 'all' }, ...this.dictMap.blPaperTransferStatus ]
		}
	},
	components: {},
	methods: {
		handleApply() {
			this.callback('Apply')
		},
		// 按发布状态查询
		handleSearchByStatus(value) {
			Object.assign(this.tableQuery, {
				transferStatus: value
			})
			console.log(this.tableQuery.transferStatus)

			this.callback('SearchByTakeStatus')
		}
	}
}
</script>
<style scoped></style>
