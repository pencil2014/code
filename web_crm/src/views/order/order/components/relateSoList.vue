<template>
	<div class="app-container">
		<div class="search-container">
			<Search :searchConditionHide="searchConditionHide" :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery"> </Search>
		</div>
		<div class="table-container" :style="{ 'margin-top': '-10px' }" :class="['unbind'].includes(tableQuery.state) ? 'init-table-container' : ''">
			<BaseTableMuti class="so-list-comp" v-loading="loading" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import { handleData } from '../js/handleData'
import searchTableUtil from '@/utils/searchTableUtil'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import Search from '@/components/Base/Search/index'
import { getSoList } from '@/api/order/book/list'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}

const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: ['isDrop', 'cutOffDate'],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	state: 'unbind' // so状态，默认显示全部
}

export default {
	data() {
		return {
			loading: true,
			freeSoList: [],
			searchConditionHide: true,
			searchConfig: [
				{
					key: 'so',
					label: 'so编号',
					type: 'input',
					searchType: 'like',
					placeholder: '一个或多个so(半角逗号分隔)',
					value: '',
					data: [],
					nonDictionary: true
				},
				{
					key: 'cutOffDate',
					label: '截关日期',
					type: 'date',
					searchType: 'eq',
					category: 'daterange',
					format: 'yyyy-MM-dd',
					value: ''
				}
			],
			// table复选框多选的值
			selectedCheckbox: [],
			tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
			// table基础组件
			tableConfig: {
				style: {},
				tableIndex: {
					show: false
				},
				options: {
					// 是否支持解锁列表修改,默认锁定列表不可更改
					lockState: true,

					// 是否支持列表项选中功能
					mutiSelect: true,

					// 多选框状态判断 {false不可选, true可选}
					checkSelectable({ so }) {
						return so ? true : false
					}
				},
				list: [],
				columns: this.columns, // 表格显示表头

				// 操作按钮组
				operationBtns: {
					title: '附件',
					minWidth: '180',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'Edit') {
							this.handleEdit(row)
						}
						if (action === 'Update') {
							this.handleUpdate(row)
						}
						if (action === 'View') {
							this.handleView(row)
						}
						if (action === 'Down') {
							this.handleDown(row)
						}
						if (action === 'Recall') {
							this.handleRecall(row)
						}
					},
					data: [
						{
							label: '编辑',
							type: 'text',
							show: (item, row) => {
								//so列表页面 并且 未取消的 是bkg 才显示编辑
								return this.$route.name === 'SoLost' && this.isBkg && row.isCancel !== 'y'
							},
							action: 'Edit'
						},
						// {
						// 	label: '更新',
						// 	type: 'text',
						// 	show: (item, row) => {
						// 		//so列表页面 并且 已甩柜 并且没有更新过 并且是bkg 并且是未取消的才显示更新
						// 		return this.$route.name === 'SoLost' && row.isDrop === 'Y' && row.isSoUpdate != 'Y' && this.isBkg && row.isCancel !== 'y'
						// 	},
						// 	action: 'Update'
						// },
						{
							label: '预览',
							type: 'text',
							show: true,
							action: 'View'
						},
						{
							label: '下载',
							type: 'text',
							show: true,
							action: 'Down'
						},
						{
							label: '保柜',
							type: 'text',
							show: (item, row) => {
								//so列表页面 并且 已甩柜 并且没有更新过 并且是商务 并且业务不同意 才显示保柜
								return this.$route.name === 'SoLost' && row.isDrop === 'Y' && this.isPricing && row.dropBdCheckStatus === 'DISAGREE'
							},
							action: 'Recall'
						}
					]
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
		orderInfo: {
			type: Object,
			default: () => ({})
		},
		columns: {
			type: Array,
			default: () => []
		},
	},
	activated() {
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	deactivated() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	created() {
		this.init()
	},
	computed: {
		...mapState({
			currRole: state => state.order.currRole,
			userId: state => state.user.userId,
			roles: state => state.user.roles,
			dictMap: state => state.dict.dictMap
		}),
		isPricing() {
			return this.roles.includes('pricing')
		},
		isBkg() {
			return this.roles.includes('bkg')
		}
	},
	components: {
		BaseTableMuti,
		Search
	},
	methods: {
		init() {
			// 订舱查询，bkg关联so，默认为未绑定状态
			this.tableQuery.state = 'unbind'
			this.getList()
		},
		// enter按键事件
		handleKeyDown(e) {
			let key = null
			if (window.event === undefined) {
				key = e.keyCode
			} else {
				key = window.event.keyCode
			}
			if (key === 13) {
				// 阻止分页的页码enter键触发全局的监听事件
				let className = window.event.target.parentNode.className
				if (className.includes('el-pagination__editor')) return
				//触发的事件
				this.searchCallBack('Search')
			}
		},
		async getList() {
			this.loading = true
			let publishStatusQuery = [{ column: 'state', type: 'eq', value: 'valid' }]
			switch (this.tableQuery.state) {
				case 'bind':
					publishStatusQuery.push({ column: 'isBindOrder', type: 'eq', value: 'y' })
					break
				case 'unbind':
					publishStatusQuery.push({ column: 'isBindOrder', type: 'eq', value: 'n' }, { column: 'isCancel', type: 'ne', value: 'y' })
					break
				case 'drop':
					publishStatusQuery.push({ column: 'isDrop', type: 'eq', value: 'Y' })
					break
				case 'cancel':
					publishStatusQuery.push({ column: 'isCancel', type: 'eq', value: 'y' })
					break
				default:
					publishStatusQuery = [{ column: 'state', type: 'eq', value: 'valid' }]
			}
			let queryData = searchTableUtil.getListQuery(this.tableQuery, publishStatusQuery)
			//处理逗号分割的多个订单号
			queryData.query.map(item => {
				if (['so'].includes(item.column)) {
					// item.type = 'in'
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s]/)
						.filter(Boolean)
						.join('#')
				}
			})
			// //如果so包含逗号 用like
			// queryData.query.map(item => {
			// 	if (item.column === 'so' && (item.value.includes(',') || item.value.includes('，'))) {
			// 		item.type = 'in'
			// 	}
			// })
			getSoList(queryData)
				.then(res => {
					let { data } = res
					let { list, totalCount, configColumns, pageSize } = data
					list.map(item => (item.vesselAndVoyage = item.vessel + '/' + item.voyage))
					list.forEach(item => {
						// 全部tab下的row未绑定显示底色，未绑定tab下的不显示底色
						if (item.state === 'valid' && item.isBindOrder === 'n' && item.isCancel !== 'y' && this.tableQuery.state === 'valid') Object.assign(item, { soIsUnBind: true })
						if (item.state === 'valid' && item.isCancel === 'y' && this.tableQuery.state === 'valid') Object.assign(item, { soIsCancel: true })
					})
					this.tableConfig.list = list
					this.tableConfig.pagination.total = totalCount
					this.tableConfig.pagination.hasNextPage = data.hasNextPage
					this.tableConfig.pagination.hasPreviousPage = data.hasPreviousPage
					this.tableConfig.pagination.isFirstPage = data.isFirstPage
					this.tableConfig.pagination.isLastPage = data.isLastPage
					this.tableQuery.currPage = data.currPage
					this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns
					this.tableQuery.pageSize = pageSize
					console.log('🚀 ~ this.tableConfig', this.tableConfig)

					this.freeSoList = data.list
					// this.getTableColumnWidthInfo()
				})
				.finally(() => {
					this.loading = false
				})
		},

		validate() {
			return true
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		// 多选
		handleMuti(arr) {
			this.selectedCheckbox = arr
		},
		searchCallBack(action) {
			if (action === 'Reset') {
				Object.assign(this.tableQuery, defaultTableQuery, {
					currPage: 1
				})
				this.searchConfig.forEach(item => {
					item.value = ''
				})
			} else if (action === 'Search') {
				let query = []
				//默认的查询条件组装tableQuery参数
				if (this.searchConfig.length) {
					this.searchConfig.forEach((item, index) => {
						let tempQuery = {}
						if (item.value) {
							if (item.category === 'daterange') {
								// 时间区间组件的value值是数组，['beginDate','endDate'],要转换成后端需要的两个字段
								query.push({ column: item.key, type: 'ge', value: item.value[0] + ' 00:00:00' }, { column: item.key, type: 'le', value: item.value[1] + ' 23:59:59' })
							} else {
								Object.assign(tempQuery, {
									column: item.key,
									type: item.searchType || 'eq',
									value: item.queryValue ? item.queryValue : item.value
								})
							}
							query.push(tempQuery)
						}
					})
				}
				Object.assign(this.tableQuery, {
					query: query.filter(item => {
						return item.value
					}),
					currPage: 1
				})
			}
			this.getList()
		},
		// 附件预览
		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.soFileNo, fileName: row.soFileName })
		},
		// 附件下载
		handleDown(row) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: row.soFileNo
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = row.soFileName
					link.click()
				})
		},
		handleSizeChange() {
			this.getList()
		},
		handleCurrentChange() {
			this.getList()
		}
	}
}
</script>

<style lang="scss">
.so-list-comp .operate-group .el-button--mini {
	margin-right: 10px;
}
.create-form .el-col {
	padding-bottom: 20px;
}
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
	width: auto;
}
.filter-container {
	margin-bottom: 10px;
}
</style>
