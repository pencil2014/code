<template>
	<div class="contractNo-logs-cont">
		<div class="logs-table">
			<BaseTableMuti v-loading="loading" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
		</div>
	</div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import { contractLogList } from '@/api/order/contract'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: ['createdTime'],
	descColumns: [],
}

export default {
	data() {
		return {
			loading: false,
			tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
			// table基础组件
			tableConfig: {
				style: {},
				tableIndex: {
					show: true
				},
				options: {
					// 是否支持解锁列表修改,默认锁定列表不可更改
					lockState: true,
					// 是否支持列表项选中功能
					mutiSelect: false,
					// 多选框状态判断 {false不可选, true可选}
					checkSelectable({ oid }) {
						return oid ? true : false
					}
				},
				// customColumns: {
				// 	show: false,
				// },
				defaultEmpty: true,	// 数据默认不加载的显示文案
				list: [],
				configColumns: [],
				columns: [
					{ label: '时间', key: 'createdTime', prop: 'createdTime', align: 'center', 'header-align': 'center' },
					{ label: '人员', key: 'employeeName', prop: 'employeeName', align: 'center', 'header-align': 'center' },
					{ label: '部门', key: 'employeeDeptName', prop: 'employeeDeptName', align: 'center', 'header-align': 'center' },
					{ label: '关键节点', key: 'logType', prop: 'logType', align: 'center', 'header-align': 'center' },
					{ label: '备注', key: 'logContent', prop: 'logContent', align: 'center', 'header-align': 'center', minWidth: 360, minWidthDrag: true },
				],
				allColumns: [],
				// 操作按钮组
				operationBtns: {
					minWidth: '120',
					fixed: 'right',
					show: false,
					callback: (action, $index, row, item) => {
					},
					data: []
				},
				// 操作提示
				tips: {
					text: '',
					show: false
				},
				// 分页
				pagination: {
					show: true,
					total: 0,
					hasNextPage: false,
          hasPreviousPage: false,
          isFirstPage: false,
          isLastPage: false
				}
			},
		}
	},
	props: {
	},
	created() {
		this.getList()
	},
	mounted() {},
	activated() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		}),
	},
	components: {
		BaseTableMuti
	},
	watch: {},
	methods: {
		// 获取列表请求参数
		getListQuery() {
			console.log('this.tableQuery', this.tableQuery)
			let query = [{column: 'contractId', type: 'eq', value: this.$route.query.oid}]
			return {...this.tableQuery, query: query}
		},
		getList() {
			this.loading = true
			let data = this.getListQuery()
			contractLogList(data).then(res => {
				let { list, totalCount, allColumns, configColumns, pageSize } = res.data
				this.tableConfig.list = list
				this.tableConfig.pagination.total = totalCount
				this.tableConfig.pagination.hasNextPage = res.data.hasNextPage
            this.tableConfig.pagination.hasPreviousPage = res.data.hasPreviousPage
            this.tableConfig.pagination.isFirstPage = res.data.isFirstPage
            this.tableConfig.pagination.isLastPage = res.data.isLastPage
            this.tableQuery.currPage = res.data.currPage
				this.tableQuery.pageSize = pageSize
			}).finally(() => {
				this.loading = false
			})
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		handleSizeChange(val) {
			this.getList()
		},
		handleCurrentChange(val) {
			this.getList()
		},
	}
}
</script>
<style lang="scss" scoped>
.contractNo-logs-cont {
	margin: 0 0 0 10px;
	background-color: #fff;
	.logs-table{
		padding: 10px;
	}
}
</style>
