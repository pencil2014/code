<template>
	<div class="app-container">
		<div class="search-container">
			<Search ref="search" :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
				<AddFilter
					:searchInputGroup="searchInputGroup"
					:allFilterGroups="allFilterGroups"
					:filterGroups="filterGroups"
					:defaultSearchLength="defaultSearchLength"
					:callback="searchCallBack"
					:index="index"
					:item="item"
					v-for="(item, index) in searchInputGroup"
					:key="'filter' + index"
				/>
				<div class="btn-plus-search" @click="handleAddFilter" ref="btnPlus"></div>
			</Search>
		</div>
		<div class="table-container">
			<BaseTableMuti class="table-fixed" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import { columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
import { getMskSoList, refreshStatus } from '@/api/exec/booking'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: ['createdTime'],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
}
const defaultSearchInputGroup = [
	{ key: 'keywords', value: '', placeholder: '关键字', category: 'all', queryValue: '' },
  { key: 'orderStatus', value: '', placeholder: '订单状态', category: 'all', queryValue: '' }
]
export default {
  props: {
    carrierCode: {
      type: String,
      default: ''
    }
  },
	data() {
		return {
			rowData: {},
			cTimestamp: 0,
			state: '',
			defaultStyle: {
				width: '100%'
			},
			serviceTypeOptions: {},
			searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 0, // 默认显示搜索框的个数
			allFilterGroups: {
				all: this.filterGroups
			},
      defaultColumns: [
         'carrierCode',
         'priceId',
         'bookingId',
         'pol',
         'pod',
         'etd',
         'orderStatus',
         'remark',
         'createdName',
         'createdTime',
         'updatedName',
         'updatedTime',
      ],
			// 查询条件下拉选项
			filterGroups: {
				keywords: { key: 'keywords', label: '关键字', type: 'input', searchType: 'like', value: '' },
        orderStatus: {
          key: 'orderStatus',
          label: '订单状态',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: [
            { label: 'Submitted', value: 'Submitted' },
            { label: 'Confirmed', value: 'Confirmed' },
            { label: 'Cancelled', value: 'Cancelled' },
          ],
          nonDictionary: true
        },
			},
			// 默认展示的搜索条件，搜索条件分类
			searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),
			tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
			searchConfig: [],
			// table复选框多选的值
			selectedCheckbox: [],
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
					checkSelectable({ oid }) {
						return oid ? true : false
					}
				},
				customColumns: {
					show: false,
				},
				defaultEmpty: true, // 数据默认不加载的显示文案
				list: [],
				configColumns: [],
				columns: [],
				allColumns: [
          {
            label: '报价ID',
            key: 'priceId',
            prop: 'priceId',
            disabled: false,
          },
          {
            label: '订舱单号',
            key: 'bookingId',
            prop: 'bookingId',
            disabled: false,
          },
					{
            label: 'ETD',
            key: 'etd',
            prop: 'etd',
            sortable: 'custom',
            disabled: false,
            width: '150',
            minWidth: '150',
          },
          {
            label: '始发地',
            key: 'pol',
            prop: 'pol',
            disabled: false
          },
          {
            label: '目的地',
            key: 'pod',
            prop: 'pod',
            disabled: false
          },
          {
            label: '订单状态',
            key: 'orderStatus',
            prop: 'orderStatus',
            disabled: false
          },
          {
            label: '备注',
            key: 'remark',
            prop: 'remark',
            disabled: false
          },
          {
            label: '创建人',
            key: 'createdName',
            prop: 'createdName',
            disabled: false,
            width: '150',
            minWidth: '150'
          },
          {
            label: '创建时间',
            key: 'createdTime',
            prop: 'createdTime',
            sortable: 'custom',
            disabled: false,
            width: '150',
            minWidth: '150',
          }
        ],
				// 操作按钮组
				operationBtns: {
					width: '60',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'refresh') {
							this.handleRefresh(row)
						}
					},
					data: [
						{
							label: '刷新',
							type: 'text',
							show: true,
							action: 'refresh'
						},
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
			tableColumnsWidthList: [],
		}
	},
	activated() {
		let timestamp = new Date().getTime()
		if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
			this.getList()
		}
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	deactivated() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	created() {
		this.cTimestamp = new Date().getTime()
		this.init()
		this.getList()
	},
	mounted() {},
	computed: {
		...mapState({
			currRole: state => state.user.currRole,
			dictMap: state => state.dict.dictMap,
		}),
	},
	watch: {},
	components: {
		Search,
		AddFilter,
		BaseTableMuti
	},
	methods: {
		// 自定义列宽查询
		getTableColumnWidthInfo() {
			columnWidthConfigInfo({
				scenesCode: this.$route.name
			}).then(res => {
				// console.log('res', res)
				// console.log('this.tableConfig.columns', this.tableConfig.columns)
				let { columnWidthList } = res.data
				// table列宽重新渲染
				this.tableConfig.columns.map(item => {
					let findItem = columnWidthList.find(ele => ele.column === item.prop)
					// 服务器返回的新的列宽宽度
					let newWidth = findItem ? findItem.width : ''
					return Object.assign(item, { width: newWidth || item.width })
				})
				this.tableColumnsWidthList = this.getTableColumnsWidth()
			})
		},
		// 获取本地table列表的字段和宽为数组集合
		getTableColumnsWidth() {
			let result = this.tableConfig.columns.map(item => {
				return { column: item.prop, width: item.width }
			})
			return result
		},
		// 自定义列宽度保存
		handleSaveColumnWidth(params) {
			console.log(params)
			let data = this.tableColumnsWidthList.map(item => {
				if (item.column === params.prop) {
					item.width = params.width
				}
				return { ...item }
			})
			columnWidthConfigSave({
				scenesCode: this.$route.name,
				columnWidthList: data
			})
				.then(res => {})
				.finally(() => {})
		},
		handleClick() {},
		init() {
			// 默认展示全部
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
			this.tableConfig.columns = this.tableConfig.allColumns
		},
		// 增加一条搜索条件
		handleAddFilter() {
			this.searchInputGroup.push({
				key: '',
				value: '',
				category: 'all',
				queryValue: ''
			})
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
		// 获取列表请求参数
		getListQuery() {
			// 合并状态参数
			let data = {}
			Object.assign(data, this.tableQuery, {
        carrierCode: this.carrierCode
      })
			return data
		},

		// 列表数据
		async getList() {
			let { data } = await columnWidthConfigInfo({
				scenesCode: this.$route.name
			})
			let { columnWidthList } = data
			let query = this.getListQuery()
			getMskSoList(query).then(response => {
					let { list, totalCount, allColumns, configColumns, pageSize } = response.data
					// 请求无数据显示的文案
					if (!list || !list.length) {
						this.$set(this.tableConfig, 'defaultEmpty', false)
					}
					list.forEach(item => {
						item.serviceTypeName = item.serviceType ? this.serviceTypeOptions[item.serviceType] : ''
					})
					this.tableConfig.list = list
					this.tableConfig.pagination.total = totalCount
					this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
          this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
          this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
          this.tableConfig.pagination.isLastPage = response.data.isLastPage
          this.tableQuery.currPage = response.data.currPage
					this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns
					this.tableConfig.configColumns = new Set(this.tableConfig.configColumns)
					this.tableConfig.configColumns = Array.from(this.tableConfig.configColumns)
					this.tableQuery.pageSize = pageSize
					// 设置列宽为服务器返回的新的列宽宽度
					this.tableConfig.columns.map(item => {
						let findItem = columnWidthList.find(ele => ele.column === item.prop)
						let newWidth = findItem ? findItem.width : ''
						return Object.assign(item, { width: newWidth || item.width })
					})
					this.tableColumnsWidthList = this.getTableColumnsWidth()
				})
		},
		// 查询组件回调
		searchCallBack(action, param) {
			let query = []
			// console.log('this.searchInputGroup', this.searchInputGroup)
			if (action === 'Search') {
				// 新增的查询条件组装tableQuery参数
				if (this.searchInputGroup.length) {
          let queryItem = {}
					this.searchInputGroup.forEach((item, index) => {
						if (item.key) {
              queryItem[item.key] = item.value
						}
					})
          Object.assign(this.tableQuery, {
            ...queryItem,
            currPage: 1
          })
				}
				this.getList()
			}
			// 模板加载后修改搜索组件的数组
			if (action === 'Update') {
				this.searchInputGroup = param.length ? [...param] : [...defaultSearchInputGroup]
			}
		},
		handleSearchValueReset() {
			this.searchInputGroup.map(item => {
				item.value = ''
				return { ...item }
			})
			// console.log('重置')
		},

		// 按选中的搜索模板设置搜索条件反显
		setSearchCondition(composeKey, defaultConfigList) {
			this.searchInputGroup = []
			let searchItemList = []
			let findItem = []
			findItem = this.searchConditionList.find(item => item.composeKey === composeKey)
			// 后端有配置好的模板
			if (defaultConfigList && defaultConfigList.length) {
				findItem = defaultConfigList.find(item => item.composeKey === composeKey)
			}
			searchItemList = findItem ? findItem.searchItemList : []
			searchItemList.map(item => {
				let value = ''
				value = item.searchValue
				this.searchInputGroup.push({
					key: item.searchField,
					value: value,
					category: 'all',
					queryValue: ''
				})
			})
		},
    handleRefresh(row) {
      this.$confirm('确认刷新该订单状态?', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
      .then(() => {
        refreshStatus(row.oid)
        .then(res => {
          if (res.data) {
            this.$message.success(`刷新成功，订单状态${res.data.orderStatus}`)
            this.getList()
          } else {
            this.$message.success('刷新成功')
          }
        })
      })
      
    },
		// 多选
		handleMuti(arr) {
			console.log('🚀 ~ arr', arr)
			this.selectedCheckbox = arr
		},
		handleSizeChange(val) {
			// 刷新页面的先调自定义搜索查询接口，拿到自定义的搜索条件再调getList接口
			if (val) {
				this.tableQuery.currPage = val
			}
			this.getList()
		},
		handleCurrentChange(val) {
			if (val === 1) return (this.tableConfig.list = [])
			this.getList()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		// 排序
		handleSort(query) {
			this.getList()
		},
	}
}
</script>
<style lang="scss">
.icon-hbl2 {
	display: inline-block;
	width: 14px;
	height: 14px;
	background: #3e80f5;
	border-radius: 2px;
	color: #fff;
	line-height: 14px;
	text-align: center;
	font-style: normal;
	margin-right: 5px;
}
</style>
