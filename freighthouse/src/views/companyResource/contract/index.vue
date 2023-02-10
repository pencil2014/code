<template>
	<div class="app-container">
		<div class="search-container">
			<Search 
				:searchConditionHide="searchConditionHide"
				:config.sync="searchConfig"
				:callback="searchCallBack" 
				:tableQuery.sync="tableQuery" 
				:searchFiledGroup="searchInputGroup" 
				:filterGroups="filterGroups"
			>
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
				<div class="btn-plus-search" @click="handleAddFilter"></div>
			</Search>
		</div>
		<div class="table-container contract-table">
			<TableFilter ref="tableFilter" :config="tableConfig" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
			<BaseTableMuti v-loading="loading" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
		</div>
		<!-- 自定义表头 -->
		<div v-if="customColumnsPopShow">
			<CustomColumns :columnsBase="this.tableConfig.allColumns" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
		</div>
		<!-- 合约号申请 -->
		<div v-if="applyPopShow">
			<Apply :applyPopQuery="applyPopQuery" @close="applyPopClose" />
		</div>
		<!-- 审核通过 -->
		<div v-if="auditPopShow">
			<AuditPop @close="auditPopClose" />
		</div>
		<!-- 日志 -->
		<div v-if="logPopShow">
			<LogPop :logPopQuery="logPopQuery" @close="logPopClose" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
import CustomColumns from '@/components/customColumns/index'
import Apply from './components/apply'
import AuditPop from './components/auditPop'
import LogPop from './components/logPop'
import { baseEmployeeListName, searchConditionInfo, searchConditionSave, searchConditionDelete, columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
import { contractList, contractTitleList, flowStatusChange, contractClose, contractListExport } from '@/api/order/contract'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: ['createdTime'],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	tabVal: '0'	// tab切换状态 0为全部
}
const defaultSearchInputGroup = [
	{ key: 'titleId', value: '', placeholder: '合约抬头', category: 'all', queryValue: '' },
	{ key: 'syslineCodeStr', value: '', placeholder: '合约覆盖航线', category: 'all', queryValue: '' },
	{ key: 'applyEmployeeId', value: '', placeholder: '申请人', category: 'all', queryValue: '' },
]
export default {
	mixins: [routerMixin],
	data() {
		return {
			oldParams:{},
			cTimestamp: 0,
			loading: false,
			defaultStyle: {
				width: '100%'
			},
			searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 0, // 默认显示搜索框的个数
			searchConditionHide: true,
			allFilterGroups: {
				all: this.filterGroups
			},
			// 查询条件下拉选项
			filterGroups: {
				titleId: { 
					label: '合约抬头', 
					key: 'titleId', 
					type: 'select', 
					searchType: 'eq', 
					filterable: true,
					value: '',
					queryValue: '',
					nonDictionary: true,
					data: [],
					saveList: [],
					visibleChange: (val, item) => {
						if (val) {
							this.getTitleList('', item)
						}
					},
				},
				syslineCodeStr: {
					key: 'syslineCodeStr',
					label: '合约覆盖航线',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						if (val) {
							this.sysLineQuerySearch('', item)
						}
					},
					filterMehod: (val, item) => {
						this.sysLineQuerySearch(val, item)
					}
				},
				applyEmployeeId: {
					key: 'applyEmployeeId',
					label: '申请人',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getEmployeeName('', item)
					},
					filterMehod: (val, item) => {
						this.getEmployeeName(val, item)
					}
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
					checkSelectable({ titleId }) {
						return titleId ? true : false
					},
					rowKeyId: 'oid',
					treeProps: {
						children: 'children',
						hasChildren: 'hasChildren',
						expandAll: true
						// rowField: 'id',
						// parentField: 'parentId'
					},
				},
				customColumns: {
					show: true,
					handleCustomColumns: this.handleCustomColumns
				},
				defaultEmpty: true,	// 数据默认不加载的显示文案
				list: [],
				configColumns: [],
				columns: [],
				allColumns: store.state.contract.contractList.columnsBase(),
				// 操作按钮组
				operationBtns: {
					minWidth: '135',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'Info') {
							this.handleInfo(row)
						}
						if (action === 'Refuse') {
							this.handleRefuse(row)
						}
						if (action === 'Pass') {
							this.handlePass(row)
						}
						if (action === 'Close') {
							this.handleClose(row)
						}
						if (action === 'ReApply') {
							this.handleReApply(row)
						}
						if (action === 'Log') {
							this.handleLog(row)
						}
					},
					data: [
						{
							label: '日志',
							type: 'text',
							show: (item, row) => {
								if (!row.children || !row.children.length) {
									return true
								}
								return false
							},
							action: 'Log'
						},
						{
							label: '详情',
							type: 'text',
							show: (item, row) => {
								// 审核通过后的合约才显示详情
								if (row.applyStatus === 'PASS' && (!row.children || !row.children.length)) {
									return true
								}
								return false
							},
							action: 'Info'
						},
						{
							label: '通过',
							type: 'text',
							show: (item, row) => {
								if (row.applyStatus === 'SUBMIT' && row.flowIndexEmployeeId == this.userId && (!row.children || !row.children.length)) {
									return true
								}
								return false
							},
							action: 'Pass'
						},
						{
							label: '拒绝',
							type: 'text',
							show: (item, row) => {
								if (row.applyStatus === 'SUBMIT' && row.flowIndexEmployeeId == this.userId && (!row.children || !row.children.length)) {
									return true
								}
								return false
							},
							action: 'Refuse'
						},
						{
							label: '重新提交',
							type: 'text',
							show: (item, row) => {
								if (row.applyStatus === 'REFUSE' && row.mainEmployeeId == this.userId && (!row.children || !row.children.length)) {
									return true
								}
								return false
							},
							action: 'ReApply'
						},
						{
							label: '关闭',
							type: 'text',
							show: (item, row) => {
								// 审核通过的，登录人是主维护人的可以关闭
								// 已拒绝的，登录人是主维护人的可以关闭
								if ((row.applyStatus === 'PASS' && row.mainEmployeeId == this.userId) || (row.applyStatus === 'REFUSE' && row.mainEmployeeId == this.userId) && (!row.children || !row.children.length)) {
									return true
								}
								return false
							},
							action: 'Close'
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
			tableColumnsWidthList:[],
			// 显示自定义表头的弹窗状态
			customColumnsPopShow: false,
			applyPopShow: false,
			applyPopQuery: {},
			titleList: [],
			auditPopShow: false,
			auditQuery: {},
			logPopShow: false,
			logPopQuery: {}
		}
	},
	beforeRouteLeave (to, from, next) {
    next()
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
	},
	mounted() {},
	computed: {
		...mapState('user', ['deptCode', 'userId']),
		...mapState({
			dictMap: state => state.dict.dictMap,
			defaultColumns: state => state.contract.contractList.defaultColumns,
			specialColumns: state => state.contract.contractList.specialColumns,
			columnsBase: state => state.contract.contractList.columnsBase()
		}),
	},
	watch: {},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		TableFilter,
		CustomColumns,
		Apply,
		AuditPop,
		LogPop
	},
	methods: {
		handleMuti(arr) {
			this.selectedCheckbox = arr
		},
		handleApply() {
			if (this.selectedCheckbox.length > 1) {
				return this.$message.warning('请选择一条数据!')
			}
			this.applyPopShow = true
			this.applyPopQuery = this.selectedCheckbox[0] || {}
		},
		applyPopClose(action) {
			this.applyPopShow = false
			if (action === 'Confirm') {
				this.getList()
			}
		},
		// 获取员工name
		getEmployeeName(val, item, roleCode) {
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: roleCode // 角色
			}
			if (!roleCode) delete data.roleCode
			baseEmployeeListName(data).then(res => {
				// 单选下拉不保存选择后的数据
				if (!item.multiple) item.saveList = []
				let filterArr = res.data.filter(ele => !item.saveList.find(o => o.value === ele.employeeId))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: this.$language === 'en' ? ele.ename : ele.cname, value: ele.employeeId ? Number(ele.employeeId) : '' }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		// 系统航线下拉列表自动补充的数据
		sysLineQuerySearch(queryString, item) {
			this.$store.dispatch('dict/baseSystemLineList', { name: queryString, state: '' }).then(data => {
				this.searchSelectVisibleData(data, item)
			})
		},
		// 自定义列宽查询
		getTableColumnWidthInfo() {
			columnWidthConfigInfo({
				scenesCode: `${this.$route.name}`
			}).then(res => {
				// console.log('res', res)
				// console.log('this.tableConfig.columns', this.tableConfig.columns)
				let {columnWidthList} = res.data
				// table列宽重新渲染
				this.tableConfig.columns.map(item => {
					let findItem = columnWidthList.find(ele => ele.column === item.prop)
					// 服务器返回的新的列宽宽度 
					let newWidth = findItem ? findItem.width : ''
					return Object.assign(item, {width: newWidth || item.width})
				})
				this.tableColumnsWidthList = this.getTableColumnsWidth()
				console.log('this.tableColumnsWidthList', this.tableColumnsWidthList)
			})
		},
		// 获取本地table列表的字段和宽为数组集合
		getTableColumnsWidth() {
			let result = this.tableConfig.columns.map(item => {
				return {column: item.prop, width: item.width}
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
				return {...item}
			})
			columnWidthConfigSave({
				scenesCode: `${this.$route.name}`,
				columnWidthList: data
			}).then(res => {
			}).finally(() => {
			})
		},
		initQuery() {
			this.tableQuery.currPage = 1
			this.tableQuery.query = []
			this.init()
			this.getSearchConditionInfo()
			this.getList()
		},
		getTitleList(val, item) {
			let data = {
				pageSize: 1000,
				currPage: 1,
				columns: [],
				ascColumns: [],
				descColumns: ['createdTime'],
				query: [],
			}
			contractTitleList(data).then(res => {
				item.data = res.data.list.filter(item => item.titleStatus !== 'INVALID').map(item => {
					let cname = item.cname ? `/${item.cname}` : ''
					return {...item, label: item.ename + cname, value: item.oid}
				})
				// this.$set(this.filterGroups, 'titleId', {
				// 	label: '合约抬头', 
				// 	key: 'titleId', 
				// 	type: 'select', 
				// 	searchType: 'eq', 
				// 	filterable: true,
				// 	value: '',
				// 	queryValue: '',
				// 	nonDictionary: true,
				// 	data: this.titleList,
				// 	saveList: [] 
				// })
			})
		},
		init() {
			if (this.$route.query.status === 'submit') {
				this.tableQuery.tabVal = '2'
			}
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
		},
		// 增加一条搜索条件
		handleAddFilter() {
			this.searchInputGroup.push({ key: '', value: '', category: 'all', queryValue: '' })
		},
		// 搜索条件el-select下拉数据处理
		searchSelectVisibleData(data, item) {
			// 单选下拉不保存选择后的数据
			if (!item.multiple) item.saveList = []
			let filterArr = data.filter(ele => !item.saveList.find(o => o.value === ele.key))
			let itemList = filterArr.map(ele => {
				return { ...ele, label: ele.value, value: ele.key }
			})
			item.data = [...item.saveList, ...itemList]
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
			// console.log('this.tableQuery.orderStatus', this.tableQuery.orderStatus)
			let statusQuery = []
			// 全部
			if (this.tableQuery.tabVal === '0') {
				statusQuery = []
			} else if (this.tableQuery.tabVal === '1') {
				statusQuery = [{ column: 'mainEmployeeId', type: 'eq', value: this.userId }]
			} else if (this.tableQuery.tabVal === '2') {
				statusQuery = [{ column: 'applyStatus', type: 'eq', value: 'SUBMIT' }, { column: 'waitAuditEmployeeIds', type: 'like', value: `,${this.userId},`}]
			} else if (this.tableQuery.tabVal === '3') {
				statusQuery = [{ column: 'hasContractNumber', type: 'eq', value: '0' }, { column: 'applyStatus', type: 'eq', value: 'PASS' }]
			} else if (this.tableQuery.tabVal === '4') {
				statusQuery = [{ column: 'hasContractNumber', type: 'eq', value: '1' }, { column: 'applyStatus', type: 'eq', value: 'PASS' }]
			} else if (this.tableQuery.tabVal === '5') {
				statusQuery = [{ column: 'applyStatus', type: 'eq', value: 'REFUSE' }]
			} else if (this.tableQuery.tabVal === '6') {
				statusQuery = [{ column: 'applyStatus', type: 'in', value: 'BREAK,CLOSE' }]
			}
			// 合并状态参数
			let data = {}
			// console.log(this.tableQuery)
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery)
			})
			delete data.tabVal
			return data
		},
		// // vxe-table v4版本需要增加parentId,id属性做树形展开
		// getTreeData(list) {
		// 	let result = []
		// 	let titleIdArr = list.map(item => item.titleId)
		// 	titleIdArr = new Set(titleIdArr)
		// 	titleIdArr = Array.from(titleIdArr)
		// 	result = list.map(item => {
		// 		return {...item, parentId: item.titleId}
		// 	})
		// 	titleIdArr.map(item => {
		// 		let itemArr = list.filter(ele => ele.titleId === item)
		// 		let {oid, ename, cname, description, titleCreatedName, titleId} = itemArr[0]
		// 		let index = list.indexOf(itemArr[0])
		// 		if (itemArr.length > 1) {
		// 			result.splice(index+1, 0, {oid, titleId, ename, cname, description, titleCreatedName, parentId: null, id: item})
		// 			// result.push({oid, titleId, ename, cname, description, titleCreatedName, parentId: null, id: item})
		// 		}
		// 	})
		// 	console.log('result', result)
		// 	return result
		// },
		// vxe-table v3版本需要增加children数组做树形展开
		getTreeData(list) {
			// 审核状态处理
			list = list.map(item => {
				item.applyStatusCn = ''
				let waitAuditEmployeeIds = item.waitAuditEmployeeIds.split(',')
				console.log('waitAuditEmployeeIds', waitAuditEmployeeIds);
				
				if (item.applyStatus === 'PASS' && !item.contractNumber) {
					item.applyStatusCn = '待维护'
				}
				if (item.applyStatus === 'PASS' && item.contractNumber) {
					item.applyStatusCn = '已维护'
				}
				if (item.applyStatus === 'SUBMIT') {
					item.applyStatusCn = '待审核'
				}
				if (item.applyStatus === 'REFUSE') {
					item.applyStatusCn = '已拒绝'
				}
				if (item.applyStatus === 'BREAK') {
					item.applyStatusCn = '已关闭'
				}
				if (item.applyStatus === 'CLOSE') {
					item.applyStatusCn = '已关闭'
				}
				return {...item}
			})
			let result = []
			let titleIdArr = []
			for (var i=0; i<list.length; i++) {
				if (!titleIdArr.includes(list[i].titleId)) {
					result.push(list[i])
					titleIdArr.push(list[i].titleId)
				}
			}
			for (var i=0; i<result.length; i++) {
				let {oid, titleId, ename, cname, description, titleCreatedName,applyEmployeeName,applyReason,applyStatus,refuseReason,contractTypeNameStr,syslineNameStr,polPortNameStr,shipCarrierCode,asLongsailingTitle} = result[i]
				let filterArr = list.filter(item => item.titleId === result[i].titleId)
				if (filterArr.length > 1) {
					result[i] = {
						oid: `${oid}-${i}`,
						titleId, 
						ename, 
						cname, 
						description, 
						titleCreatedName,
						children: filterArr,
						applyEmployeeName: '',
						applyReason: '',
						applyStatus: '',
						refuseReason: '',
						contractTypeNameStr: '',
						syslineNameStr: '',
						polPortNameStr: '',
						shipCarrierCode: '',
						asLongsailingTitle: ''
					}
				} else {
					result[i] = filterArr[0]
				}
			}
			console.log('oid', list.map(ele => ele.oid))
			// for (var i=0; i<list.length; i++) {
			// 	if (!titleIdArr.includes(list[i].titleId)) {
			// 		result.push(list[i])
			// 		titleIdArr.push(list[i].titleId)
			// 	} else {
			// 		for (var j=0; j<result.length; j++) {
			// 			if (result[j].titleId === list[i].titleId) {
			// 				result[j].children.push(list[i])
			// 			}
			// 		}
			// 	}
			// }
			console.log('result', result);
			return result
		},
		// 列表数据
		async getList() {
			this.loading = true
			let {data} = await columnWidthConfigInfo({
				scenesCode: `${this.$route.name}`
			})
			let {columnWidthList} = data
			let query = this.getListQuery()
			//处理逗号分割的多个订单号
			query.query.map(item => {
				if (['orderNo', 'so', 'blNo','universalNo', 'carrierLineName'].includes(item.column)) {
					// item.type = item.column === 'so' || item.column === 'blNo' ? 'like' : 'in'
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s]/)
						.filter(Boolean)
						.join('#')
				}
			})
			this.oldParams = query
			contractList(query)
				.then(response => {
					let { list, totalCount, allColumns, configColumns, pageSize } = response.data
					// this.tableConfig.list = list
					this.tableConfig.list = this.getTreeData(list)
					
					// 请求无数据显示的文案
					if (!list || !list.length) {
						this.$set(this.tableConfig, 'defaultEmpty', false)
					}
					this.tableQuery.pageSize = pageSize
					this.tableConfig.pagination.total = totalCount
					this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
            this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
            this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
            this.tableConfig.pagination.isLastPage = response.data.isLastPage
            this.tableQuery.currPage = response.data.currPage
					this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns
					this.tableConfig.configColumns = new Set(this.tableConfig.configColumns)
					this.tableConfig.configColumns = Array.from(this.tableConfig.configColumns)
					this.handleFilterColumns(this.tableConfig.configColumns)
					// 设置列宽为服务器返回的新的列宽宽度
					// console.log('this.tableConfig.columns', this.tableConfig.columns)
					this.tableConfig.columns.map((item, index) => {
						item.treeNode = false
						// 第一列设置为树节点，懒加载展开列
            if (index === 0 && this.tableConfig.list.some(ele => ele.children && ele.children.length)) {
              item.treeNode = true
            }
						// 取服务器返回的宽度
						let findItem = columnWidthList.find(ele => ele.column === item.prop)
						let newWidth = findItem ? findItem.width : ''
						return Object.assign(item, { width: newWidth || item.width })
					})
					this.tableColumnsWidthList = this.getTableColumnsWidth()
					// this.$refs.contractTable.$refs.tableLayout.setAllTreeExpand()
					// this.getTableColumnWidthInfo()
				})
				.finally(() => {
					this.loading = false
				})
		},
		// 查询组件回调
		async searchCallBack(action, param) {
			let query = []

			if (action === 'Search') {
				// 新增的查询条件组装tableQuery参数
				if (this.searchInputGroup.length) {
					this.searchInputGroup.forEach((item, index) => {
						let tempItem = {}
						if (item.key) {
							// 非自动补全的查询参数从item.value中取值合并到query
							if (this.filterGroups[item.key].type !== 'autocomplete') {
								// 多选下拉框
								if (this.filterGroups[item.key].type === 'cascader') {
                  Object.assign(tempItem, {
                    column: item.key,
                    type: this.filterGroups[item.key].searchType || 'eq',
                    value: item.value ? item.value[item.value.length-1] : ''
                  })
                } else if (this.filterGroups[item.key].multiple) {
									Object.assign(tempItem, {
										column: item.key,
										type: this.filterGroups[item.key].searchType || 'eq',
										value: item.value ? item.value.toString() : ''
									})
									// 中转港特殊处理
									if (item.key === 'transitPortCode') {
										Object.assign(tempItem, {
											column: 'transitPortCodeStr',
											type: 'like',
											value: item.value ? item.value.join('#') : ''
										})
									}
								} else if (this.filterGroups[item.key].category === 'daterange') {
									// 时间区间组件的value值是数组，['beginDate','endDate'],要转换成后端需要的两个字段
									if (item.value) query.push({ column: item.key, type: 'ge', value: item.value[0] + ' 00:00:00' }, { column: item.key, type: 'le', value: item.value[1] + ' 23:59:59' })
								} else if (['prefinCloseStatus', 'finCloseStatus'].includes(item.key)) {
									// 特殊处理预关账状态，关账状态
									if (item.value) {
										// 选择未关账传值不等于yes
										if (item.value === 'yes') {
											Object.assign(tempItem, {
												column: item.key,
												type: 'eq',
												value: 'yes'
											})
										} else {
											Object.assign(tempItem, {
												column: item.key,
												type: 'ne',
												value: 'yes'
											})
										}
									}
								} else {
									Object.assign(tempItem, {
										column: item.key,
										type: this.filterGroups[item.key].searchType || 'eq',
										value: item.value
									})
								}
							} else {
								Object.assign(tempItem, {
									column: item.key,
									type: this.filterGroups[item.key].searchType || 'eq',
									value: this.filterGroups[item.key].queryValue
								})
							}

							if (item.key === 'orderStatus') {
								this.tableQuery.orderStatus = item.value
							}
							query.push(tempItem)
						}
					})
				}

				Object.assign(this.tableQuery, {
					query: query.filter(item => {
						return item.value
					}),
					currPage: 1
				})
				// console.log('serach:', this.tableQuery)
				this.getList()
			}
			if (action === 'Reset') {
				this.handleSearchValueReset()
			}
			// 模板加载后修改搜索组件的数组
			if (action === 'Update') {
				this.searchInputGroup = param.length ? [...param] : [...defaultSearchInputGroup]
			}
			// 刷新
      if (action === 'Refresh') {
        this.loading = true
				let {data} = await columnWidthConfigInfo({
					scenesCode: `${this.$route.name}`
				})
				let {columnWidthList} = data
				contractList(this.oldParams)
					.then(response => {
						let { list, totalCount, allColumns, configColumns, pageSize } = response.data
						this.tableConfig.list = this.getTreeData(list)
						// 请求无数据显示的文案
						if (!list || !list.length) {
							this.$set(this.tableConfig, 'defaultEmpty', false)
						}
						this.tableQuery.pageSize = pageSize
						this.tableConfig.pagination.total = totalCount
						this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
            this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
            this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
            this.tableConfig.pagination.isLastPage = response.data.isLastPage
            this.tableQuery.currPage = response.data.currPage
						this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns
						this.tableConfig.configColumns = new Set(this.tableConfig.configColumns)
						this.tableConfig.configColumns = Array.from(this.tableConfig.configColumns)
						this.handleFilterColumns(this.tableConfig.configColumns)
						// 设置列宽为服务器返回的新的列宽宽度
						// console.log('this.tableConfig.columns', this.tableConfig.columns)
						this.tableConfig.columns.map(item => {
							// 取服务器返回的宽度
							let findItem = columnWidthList.find(ele => ele.column === item.prop)
							let newWidth = findItem ? findItem.width : ''
							return Object.assign(item, { width: newWidth || item.width })
						})
						this.tableColumnsWidthList = this.getTableColumnsWidth()
						// this.getTableColumnWidthInfo()
					})
					.finally(() => {
						this.loading = false
					})
      }
		},
		handleSearchValueReset() {
			this.searchInputGroup.map(item => {
				item.value = ''
				return {...item}
			})
		},
		// 导出
		handleExport() {
			let data = this.getListQuery()
			contractListExport({
				ascColumns: data.ascColumns,
				descColumns: data.descColumns,
				query: data.query
			}).then(response => {
				let { filePath } = response.data
				window.location.href = filePath
			})
		},
		// 自定义表头
		handleCustomColumns() {
			this.customColumnsPopShow = true
		},
		// 按状态tab筛选
		handleSearchByTabs() {
			this.tableQuery.currPage = 1
			this.getList()
		},
		handleSizeChange(val) {
			this.getList()
		},
		handleCurrentChange(val) {
			// 刷新页面的先调自定义搜索查询接口，拿到自定义的搜索条件再调getList接口
			// if (val) {
			// 	this.tableQuery.currPage = val
			// 	// this.getSearchConditionInfo()
			// }
			this.getList()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		// 去详情页
		handleInfo(row) {
			let name = 'ContractDetail'
			this.routerPush(name, {
				oid: row.oid,
				titleId: row.titleId
			})
		},
		handlePass(row) {
			let data = {
				contractId: row.oid, 
				taskId: row.flowIndexTaskId, 
				approved: true
			}
			this.$confirm('是否对该合约进行审核?', '警告', {
      	confirmButtonText: '确定',
      	cancelButtonText: '取消',
      	type: 'warning'
      }).then(() => {
				flowStatusChange(data).then(res => {
					this.$message.success('审核通过成功')
					this.getList()
				})
      }).catch(err => {
      })
		},
		handleClose(row) {
			let data = {
				contractId: row.oid, 
				taskId: row.flowIndexTaskId, 
				approved: false
			}
			this.$confirm('是否关闭该合约?', '警告', {
      	confirmButtonText: '确定',
      	cancelButtonText: '取消',
      	type: 'warning'
      }).then(() => {
				// 审核通过的关闭
				if (row.applyStatus === 'PASS') {
					return contractClose({oid: row.oid}).then(res => {
						this.$message.success('关闭成功')
						this.getList()
					})
				}
				// 已拒绝的关闭
				flowStatusChange(data).then(res => {
					this.$message.success('关闭成功')
					this.getList()
				})
      }).catch(err => {
      })
		},
		handleReApply(row) {
			let data = {
				contractId: row.oid, 
				taskId: row.flowIndexTaskId, 
				approved: true
			}
			this.$confirm('是否重新提交该合约审核?', '警告', {
      	confirmButtonText: '确定',
      	cancelButtonText: '取消',
      	type: 'warning'
      }).then(() => {
				flowStatusChange(data).then(res => {
					this.$message.success('审核成功')
					this.getList()
					this.auditPopShow = false
				})
      }).catch(err => {
      })
		},
		handleRefuse(row) {
			this.auditPopShow = true
			this.auditQuery = {
				contractId: row.oid,
				taskId: row.flowIndexTaskId,
				approved: false
			}
		},
		auditPopClose(action, value) {
			if (action === 'Confirm') {
				let data = {...this.auditQuery, auditRemark: value}
				flowStatusChange(data).then(res => {
					this.$message.success('拒绝成功')
					this.getList()
					this.auditPopShow = false
				})
			} else {
				this.auditPopShow = false
			}
		},
		handleLog(row) {
			this.logPopShow = true
			this.logPopQuery = {
				contractId: row.oid
			}
		},
		logPopClose(action) {
			this.logPopShow = false
		},
		// 排序
		handleSort(query) {
			this.getList()
		},
		// 过滤显示自定义的表头
		handleFilterColumns(value) {
			let { allColumns, columns } = this.tableConfig
			let temp = []
			let arr = []
			temp = allColumns.filter((item, index) => {
				return value.includes(item.prop)
			})
			// 排序 temp
			temp.sort((prev, next) => {
				const p = value.indexOf(prev.prop)
				const n = value.indexOf(next.prop)
				return p - n
			})
			temp.map(item => {
				arr.push(item.prop)
			})
			Object.assign(this.tableConfig, {
				columns: temp,
				configColumns: arr
			})
			// console.log('tableColumns:', this.tableConfig.columns);
		},
		// 获取特殊处理的自定义表头，例：polCode,需要传polCode,polEname,polCname,podCode, podEname,podCname给后端
		getColumnsValues(value) {
			// 20211202 订单号表头不固定在第一列
			let result = []
			value.map(item => {
				if (this.specialColumns[item]) {
					result = result.concat(this.specialColumns[item])
				} else {
					result.push(item)
				}
			})
			result = Array.from(new Set(result))
			return result
		},
		// 自定义表头关闭回调
		customColumnsPopClose(action, value) {
			this.customColumnsPopShow = false
			if (action === 'Confirm') {
				let columnsKeys = this.getColumnsValues(value)

				Object.assign(this.tableQuery, {
					columns: columnsKeys
				})
				this.getList()
			}
		}
	}
}
</script>
<style lang="scss" scoped>
.contract-table{
	/deep/ .vxe-body--column{
		.operate-group{
			text-align: left;
			.el-button--mini {
				margin-left: 0;
				margin-right: 6px;
				&:last-of-type{
					margin-right: 0;
				}
			}
		}
	}
}
</style>
