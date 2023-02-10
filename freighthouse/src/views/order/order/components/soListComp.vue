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
		<div class="table-container so-toggle-wrapper" :style="{ 'margin-top': type == 'dialog' ? '-10px' : '' }" :class="['unbind'].includes(tableQuery.state) ? 'init-table-container' : ''">
			<tableFilterComp v-if="type != 'dialog'" :config="tableConfig" :status="status" :tableQuery.sync="tableQuery" :callback="tableCallBack" :BtnList="soBtnList"> </tableFilterComp>
			<BaseTableMuti class="so-list-comp" v-loading="loading" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
		</div>
		<!-- 甩柜通知弹窗 -->
		<DropNotice :so="so" @close="closeImportBill" :dialogOrderShow="dialogOrderShow" />
		<!-- 查看日志弹窗 -->
		<ViewLogs />
		<!-- 更新SO弹窗 -->
		<div v-if="createSoPopShow">
			<UpdateDrop :orderInfo="soUpdateInfo" @close="createSoPopClose" />
		</div>
		<!-- 编辑SO弹窗 -->
		<div v-if="editSoPopShow">
			<EditSoDialog :orderInfo="editSoInfo" @close="editSoPopClose" />
		</div>
		<!-- 自定义表头 -->
		<div v-if="customColumnsPopShow">
			<CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
		</div>
		<div v-if="searchArkPopShow">
			<searchArkPop :arkSoList="arkSoList" @close="searchArkPopClose" />
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { mapState, mapMutations } from 'vuex'
import tableFilterComp from './tableFilterComp'
import { handleData } from '../js/handleData'
// import searchTableUtil from '@/utils/searchTableUtil'
import BaseDialog from '@/components/Base/Dialog/index'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import { baseEmployeeListName, columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
import { getSoList, bindSo, dropHold, exportSoList } from '@/api/order/book/list'
import DropNotice from './dropNotice'
import ViewLogs from './viewLogs'
import UpdateDrop from './updateDrop'
import EditSoDialog from '../soList/components/editSoDialog'
import searchArkPop from './searchArkPop'
import CustomColumns from '@/components/customColumns/index'
import { customerListAllStatus } from '@/api/crm/supplier'
import { soLog } from '@/api/order/bl'
const defaultPage = {
	pageSize: -1,
	currPage: 1
}

const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: ['isDrop', 'cutOffDate'],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	state: 'valid' // so状态，默认显示全部
}
const defaultSearchInputGroup = [
	{
		key: 'so',
		value: '',
		placeholder: '筛选条件',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'orderNo',
		value: '',
		placeholder: '筛选条件',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'vessel',
		value: '',
		placeholder: '筛选条件',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'voyage',
		value: '',
		placeholder: '筛选条件',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'bdEmployeeId',
		value: '',
		placeholder: '筛选条件',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'cutOffDate',
		value: '',
		placeholder: '筛选条件',
		category: 'all',
		queryValue: ''
	}
]
export default {
	data() {
		return {
			cTimestamp: 0,
			editSoPopShow: false,
			so: '',
			soUpdateInfo: {},
			createSoPopShow: false,
			dialogOrderShow: false,
			loading: false,
			initStatus: false, // 是否允许初始化加载列表
			status: handleData.soStatus,
			soBtnList: [
				{ label: '标记取消', type: 'Cancel' },
				{ label: '撤销标记取消', type: 'WithDrawCancel' },
				{ label: '甩柜通知', type: 'Notice' },
				{ label: '导出', type: 'Export' },
				// { label: '自定义表头', type: 'CustomColumns' },
			],
			freeSoList: [],
			defaultSearchLength: 0, // 默认显示搜索框的个数
			allFilterGroups: {
				all: this.filterGroups
			},
			// 查询条件下拉选项
			filterGroups: {
				so: { key: 'so', label: 'SO号', type: 'input', searchType: 'like', value: '' },
				orderNo: { key: 'orderNo', label: '工作号', type: 'input', searchType: 'like', value: '' },
				unloadingPortCode: {
					key: 'unloadingPortCode',
					label: '卸货港',
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
						this.portSearch('', 'port_of_discharge', this.state, 'unloadingPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_discharge', this.state, 'unloadingPortCode', item)
					}
				},
				polPortCode: {
					key: 'polPortCode',
					label: '大船起运港',
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
						this.portSearch('', 'port_of_basic', this.state, 'polPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_basic', this.state, 'polPortCode', item)
					}
				},
				porPortCode: {
					key: 'porPortCode',
					label: '驳船收货地',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', 'port_of_feeder', this.state, 'porPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_feeder', this.state, 'porPortCode', item)
					}
				},
				custid: {
					key: 'custid',
					label: '委托客户',
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
						this.getCustList('', item)
					},
					filterMehod: (val, item) => {
						this.getCustList(val, item)
					}
				},
				bdEmployeeId: {
					key: 'bdEmployeeId',
					label: '销售',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getEmployeeName('', item, 'bd')
					},
					filterMehod: (val, item) => {
						this.getEmployeeName(val, item, 'bd')
					}
				},
				createdBy: {
					key: 'createdBy',
					label: '订舱人',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getEmployeeName('', item, '')
					},
					filterMehod: (val, item) => {
						this.getEmployeeName(val, item, '')
					}
				},
				vessel: {
					key: 'vessel',
					label: '大船船名',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					'allow-create': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						if (val) {
							this.queryVessleList('', item)
						}
					},
					filterMehod: (val, item) => {
						this.queryVessleList(val, item)
					}
				},
				voyage: {
					key: 'voyage',
					label: '大船航次',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					'allow-create': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						if (val) {
							this.queryVoyageList('', item)
						}
					},
					filterMehod: (val, item) => {
						this.queryVoyageList(val, item)
					}
				},
				cutOffDate: { label: '大船截关时间', key: 'cutOffDate', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				shipCarrierCode: {
					key: 'shipCarrierCode',
					label: '船公司',
					type: 'autocomplete',
					searchType: 'like',
					value: '',
					queryValue: '',
					querySearch: (queryString, cb) => {
						this.$store.dispatch('dict/baseShippingCarrierList', { name: queryString, state: 'valid' }).then(data => {
							cb(data)
						})
					},
					select: (value, item) => {
						Object.assign(item, {
							queryValue: value.key
						})
					},
					change: (value, item) => {
						Object.assign(item, {
							queryValue: value
						})
					},
					clear: (value, item) => {
						Object.assign(item, {
							queryValue: ''
						})
					}
				},
				podPortCode: {
					key: 'podPortCode',
					label: '目的地',
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
						this.portSearch('', 'port_of_destination', this.state, 'podPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_destination', this.state, 'podPortCode', item)
					}
				},
				sysLineCode: {
					key: 'sysLineCode',
					label: '系统航线',
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
				cnReplyState: {
					key: 'cnReplyState',
					label: '查做柜状态',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [
						{ label: '未发起', value: 'unsend' },
						{ label: '待回复', value: 'unreply' },
						{ label: '已回复', value: 'replied' },
					],
					nonDictionary: true
				},
			},
			// 默认展示的搜索条件，搜索条件分类
			searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),
			searchConfig: [],

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
				customColumns: {
					show: true,
					handleCustomColumns: this.handleCustomColumns
				},
				defaultEmpty: true,
				list: [],
				configColumns: [],
				columns: [], // 表格显示表头
				allColumns: store.state.book.bookList.socolumnsBase,

				// 操作按钮组
				operationBtns: {
					title: '操作',
					minWidth: '150',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'Edit') {
							this.handleEdit(row)
						}
						if (action === 'Update') {
							this.handleUpdate(row)
						}
						// if (action === 'View') {
						// 	this.handleView(row)
						// }
						if (action === 'Down') {
							this.handleDown(row)
						}
						if (action === 'Recall') {
							this.handleRecall(row)
						}
						if (action === 'Log') {
							this.handleLog(row)
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
						// {
						// 	label: '预览',
						// 	type: 'text',
						// 	show: true,
						// 	action: 'View'
						// },
						{
							label: '附件下载',
							type: 'text',
							show: (item, row) => {
								if (row.soFileNo) {
									return true
								}
								return false
							},
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
						},
						{
							label: '日志',
							type: 'text',
							show: true,
							action: 'Log'
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
			tableColumnsWidthList: [],
			editSoInfo: {},
			// 显示自定义表头的弹窗状态
			customColumnsPopShow: false,
			searchArkPopShow: false,
			arkSoList: [],
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
		type: ''
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
		// 商务不显示
		if (this.isPricing) {
			this.soBtnList = [
				{ label: '导出', type: 'Export' },
				{ label: '查做柜', type: 'SearchArk' },
				// { label: '自定义表头', type: 'CustomColumns' }
			]
		}
		this.init()
	},
	mounted() {
		this.$nextTick(() => {
        this.initStatus = true
		})
	},
	computed: {
		...mapState({
			currRole: state => state.order.currRole,
			userId: state => state.user.userId,
			roles: state => state.user.roles,
			dictMap: state => state.dict.dictMap,
			defaultColumns: state => state.book.bookList.soDefaultSoColumns,
			specialColumns: state => state.book.bookList.specialColumns,
			columnsBase: state => state.book.bookList.socolumnsBase
		}),
		isPricing() {
			return this.roles.includes('pricing')
		},
		isBkg() {
			return this.roles.includes('bkg')
		}
	},
	components: {
		BaseDialog,
		BaseTableMuti,
		Search,
		AddFilter,
		tableFilterComp,
		DropNotice,
		ViewLogs,
		UpdateDrop,
		EditSoDialog,
		CustomColumns,
		searchArkPop,
	},
	methods: {
		...mapMutations('book', ['setShowLogs','setSoLogData','setSoNo']),
		handleLog(row){
			soLog({ so: row.so }).then(res => {
				this.setSoLogData(res.data)
				this.setSoNo(row.so)
			})
			this.setShowLogs(true)
		},
		// 获取委托单位
		getCustList(val, item) {
			let data = {
				currPage: 1,
				pageSize: 50,
				query: val
					? [
							{ column: 'name', type: 'like', value: val },
							{ column: 'roleType', type: 'eq', value: 'client' }
					  ]
					: [{ column: 'roleType', type: 'eq', value: 'client' }]
			}
			customerListAllStatus(data).then(res => {
				let list = res.data.list.map(ele => {
					return {
						...ele,
						label: ele.name,
						value: ele.custid
					}
				})
				let formatArr = () => {
					let map = new Map()
					for (let item of list) {
						if (!map.has(item.value)) {
							map.set(item.value, item)
						}
					}
					return [...map.values()]
				}
				let newArr = formatArr()
				let filterArr = newArr.filter(ele => !item.saveList.find(o => o.value === ele.value))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: ele.label, value: ele.value }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		// 获取员工name
		getEmployeeName(val, item, roleCode) {
			// console.log('item', item)
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: roleCode || '' // 角色
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
		// 船名下拉
		queryVessleList(queryString, item) {
			this.$store.dispatch('dict/queryVessleList', { name: queryString }).then(data => {
				console.log('vessel', data)
				this.searchSelectVisibleData(data, item)
			})
		},
		// 航次下拉
		queryVoyageList(queryString, item) {
			this.$store.dispatch('dict/queryVoyageList', { name: queryString }).then(data => {
				this.searchSelectVisibleData(data, item)
			})
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
		// 船公司下拉列表自动补充的数据
		shipQuerySearch(queryString, item) {
			this.$store.dispatch('dict/baseShippingCarrierList', { name: queryString, state: 'valid' }).then(data => {
				item.data = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
			})
		},
		// 远程搜索港口下拉数据
		portSearch(queryString, portAttribute, state, type, item) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				let filterArr = data.filter(ele => !item.saveList.find(o => o.value === ele.key))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: ele.value, value: ele.key }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		// 系统航线下拉列表自动补充的数据
		sysLineQuerySearch(queryString, item) {
			this.$store.dispatch('dict/baseSystemLineList', { name: queryString, state: '' }).then(data => {
				// 单选下拉不保存选择后的数据
				if (!item.multiple) item.saveList = []
				let filterArr = data.filter(ele => !item.saveList.find(o => o.value === ele.key))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: ele.value, value: ele.key }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		// 自定义表头
		handleCustomColumns() {
			this.customColumnsPopShow = true
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
			// v20220415 订单号表头不固定在第一列
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
		},
		// 自定义列宽查询
		getTableColumnWidthInfo() {
			columnWidthConfigInfo({
				scenesCode: this.$route.name
			}).then(res => {
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
			// console.log(params)
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
		handleEdit(row) {
			this.editSoPopShow = true
			this.editSoInfo = row
		},
		// 新建so关闭回调
		editSoPopClose(action) {
			this.editSoPopShow = false
			if (action === 'Confirm') {
				this.getList()
			}
		},
		searchArkPopClose(action) {
			this.searchArkPopShow = false
			if (action === 'Confirm') {
				this.getList()
			}
		},
		handleRecall(val) {
			// console.log('🚀 ~ val', val)
			dropHold({ so: val.so }).then(res => {
				this.$message.success('保柜成功!')
				this.getList()
			})
		},
		// 新建so关闭回调
		createSoPopClose(action) {
			this.createSoPopShow = false
			this.getList()
		},
		closeImportBill(action) {
			if (action === 'Confirm') {
				this.getList()
			}
			this.dialogOrderShow = false
		},
		// 导出
		handleExport() {
			let data = this.getListQuery()
			//处理逗号分割的多个订单号
			data.query.map(item => {
				if (['so', 'orderNo'].includes(item.column)) {
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s]/)
						.filter(Boolean)
						.join('#')
				}
			})
			exportSoList({
				ascColumns: data.ascColumns,
				descColumns: data.descColumns,
				query: data.query
			}).then(response => {
				let { filePath } = response.data
				window.location.href = filePath
			})
		},
		// 甩柜通知
		handleNotice() {
			// console.log('🚀 ~ this.selectedCheckbox', this.selectedCheckbox)
			if (this.selectedCheckbox.length == 0) {
				return this.$message.warning('请至少选择一条数据!')
			}
			this.so = this.selectedCheckbox.map(item => item.so).join(',')
			this.dialogOrderShow = true
		},

		init() {
			// 订舱查询，bkg关联so，默认为未绑定状态
			if (this.type === 'dialog') {
				this.tableQuery.state = 'unbind'
			}
			// 默认展示全部
			this.tableQuery.state = 'valid'
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
			// this.getList()
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
			// console.log('🚀 ~ this.tableQuery.orderStatus', this.tableQuery.orderStatus)
			// 全部tab过滤掉已取消状态的数据
			let statusQuery = [{ column: 'state', type: 'eq', value: 'valid' }]
			switch (this.tableQuery.state) {
				case 'bind':
					statusQuery.push({ column: 'isBindOrder', type: 'eq', value: 'y' })
					break
				case 'unbind':
					statusQuery.push({ column: 'isBindOrder', type: 'eq', value: 'n' }, { column: 'isCancel', type: 'ne', value: 'y' })
					break
				case 'drop':
					statusQuery.push({ column: 'isDrop', type: 'eq', value: 'Y' })
					break
				case 'cancel':
					statusQuery.push({ column: 'isCancel', type: 'eq', value: 'y' })
					break
				default:
					statusQuery = [{ column: 'state', type: 'eq', value: 'valid' }]
			}
			// 合并状态参数
			let data = {}
			// console.log('tableQuery', this.tableQuery)
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery)
			})
			return data
		},
		async getList() {
			if (!this.initStatus) return
			this.loading = true
			// let queryData = searchTableUtil.getListQuery(this.tableQuery, publishStatusQuery)
			let queryData = this.getListQuery()
			console.log('queryData', queryData)

			//处理逗号分割的多个订单号
			queryData.query.map(item => {
				if (['so', 'orderNo'].includes(item.column)) {
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s]/)
						.filter(Boolean)
						.join('#')
				}
			})
			let { data } = await columnWidthConfigInfo({
				scenesCode: `${this.$route.name}`
			})
			let { columnWidthList } = data
			getSoList(queryData)
				.then(res => {
					let { data } = res
					let { list, totalCount, configColumns, pageSize } = data
					list.map(item => (item.vesselAndVoyage = item.vessel + '/' + item.voyage))
					list.forEach(item => {
						// 全部tab下的row未绑定显示底色，未绑定tab下的不显示底色
						if (item.isBindOrder === 'n' && item.isCancel !== 'y' && this.tableQuery.state === 'valid') Object.assign(item, { soIsUnBind: true })
						if (item.isCancel === 'y' && this.tableQuery.state === 'valid') Object.assign(item, { soIsCancel: true })
					})
					this.tableConfig.list = list
						// 请求无数据显示的文案
					if (!list || !list.length) {
						this.$set(this.tableConfig, 'defaultEmpty', false)
					}
					this.tableConfig.pagination.total = totalCount
					this.tableConfig.pagination.hasNextPage = data.hasNextPage
					this.tableConfig.pagination.hasPreviousPage = data.hasPreviousPage
					this.tableConfig.pagination.isFirstPage = data.isFirstPage
					this.tableConfig.pagination.isLastPage = data.isLastPage
					this.tableQuery.currPage = data.currPage
					this.tableQuery.pageSize = pageSize
					this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns
					this.tableConfig.configColumns = new Set(this.tableConfig.configColumns)
					this.tableConfig.configColumns = Array.from(this.tableConfig.configColumns)
					this.handleFilterColumns(this.tableConfig.configColumns)
					console.log('🚀 ~ this.tableConfig', this.tableConfig)
					console.log('🚀 ~ this.defaultColumns', this.defaultColumns)
					this.freeSoList = data.list
					// 设置列宽为服务器返回的新的列宽宽度
					this.tableConfig.columns.map(item => {
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
		},

		validate() {
			return true
		},

		handleSelectBusinessType(val) {
			this.businessTypeOptions.map(item => {
				if (item.businessType === val) {
					this.serviceTypeOptions = item.serviceTypeList
				}
			})
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
				if (!this.validCheck()) return false
				this.handleCreateSo(done)
			} else {
				this.close('Cancel')
			}
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		// 绑定so信息
		handleCreateSo(done) {
			done()
			this.close('Confirm')
			let data = {
				orderNo: this.orderInfo.orderNo,
				soList: this.selectedCheckbox,
				bkgReqNo: this.orderInfo.bkgReqNo
			}
			bindSo(data).then(() => {
				this.$message({
					type: 'success',
					message: '绑定成功'
				})
			})
		},
		// 多选
		handleMuti(arr) {
			this.selectedCheckbox = arr
			let txt = 'T量合计：'
			let total = 0
			arr.map(item => {
				total += Number(item.amount)
			})
			txt = txt + total
			this.$set(this.tableConfig.tips, 'totalTxt', txt)
		},
		// 撤回取消标记
		handleWithDrawCancel() {
			if (!this.selectedCheckbox || this.selectedCheckbox.length == 0) {
				return this.$message({ type: 'error', message: '请勾选要撤销标记取消的so' })
			}
			let soList = [...this.selectedCheckbox.map(item => item.so)]
			this.$emit('cancelDialog', soList, 'withDrawCancel')
		},
		// 取消标记
		handleCancel() {
			if (!this.validCheck()) return false
			let soList = [...this.selectedCheckbox.map(item => item.so)]
			this.$emit('cancelDialog', soList, 'cancel')
		},
		// 查做柜
		handleSearchArk() {
			if (!this.selectedCheckbox || this.selectedCheckbox.length == 0) {
				return this.$message({ type: 'error', message: '请勾选要查做柜的so' })
			}
			if (this.selectedCheckbox.some(item => item.isBindOrder !== 'y')) {
				return this.$message({ type: 'error', message: '请勾选要已绑定订单的so' })
			}
			if (this.selectedCheckbox.every(item => item.cnState !== 'nocn')) {
				return this.$message({ type: 'error', message: '所选so已做柜，不支持继续查做柜' })
			}
			this.arkSoList = this.selectedCheckbox.filter(item => {
				return item.cnState === 'nocn'
			})
			this.searchArkPopShow = true
		},
		searchCallBack(action, param) {
			let query = []
			if (action === 'Search') {
				// 新增的查询条件组装tableQuery参数
				if (this.searchInputGroup.length) {
					this.searchInputGroup.forEach((item, index) => {
						let tempItem = {}

						if (item.key) {
							// 非自动补全的查询参数从item.value中取值合并到query
							if (this.filterGroups[item.key].type !== 'autocomplete') {
								// 中转港
								if (this.filterGroups[item.key].multiple) {
									Object.assign(tempItem, {
										column: item.key,
										type: this.filterGroups[item.key].searchType || 'eq',
										value: item.value ? item.value.toString() : ''
									})
								} else if (this.filterGroups[item.key].category === 'daterange') {
									// 时间区间组件的value值是数组，['beginDate','endDate'],要转换成后端需要的两个字段
									// if (item.value) query.push({ column: item.key, type: 'ge', value: item.value[0] + ' 00:00:00' }, { column: item.key, type: 'le', value: item.value[1] + ' 23:59:59' })
							    if (item.value && item.value[0]) {
										if (item.value[0] === '-') {
                      query.push({
                        column: item.key,
                        type: 'empty',
                        value: '-'
                      })
                    } else {
                      query.push({
                        column: item.key,
                        type: 'ge',
                        value: item.value[0] + ' 00:00:00'
                      })
                    }
									}
									if (item.value && item.value[1]) query.push({ column: item.key, type: 'le', value: item.value[1] + ' 23:59:59' })
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
		},
		handleSearchValueReset() {
			this.searchInputGroup.map(item => {
				item.value = ''
				return { ...item }
			})
			// console.log('重置')
		},
		// 状态筛选
		handleSearchStatus() {
			this.tableQuery.currPage = 1
			this.getList()
		},
		// 勾选验证
		validCheck() {
			if (!this.selectedCheckbox || this.selectedCheckbox.length == 0) {
				this.$message({
					type: 'error',
					message: '请勾选要标记取消的so'
				})
				return false
			}
			return true
		},
		//so更新
		handleUpdate(row) {
			// console.log('🚀 ~ row', row)
			this.soUpdateInfo = row
			this.createSoPopShow = true
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
					// console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = row.soFileName
					link.click()
				})
		},
		handleSizeChange() {
			this.getList()
		},
		handleCurrentChange(val) {
			this.getList()
		}
	}
}
</script>

<style lang="scss">
.so-toggle-wrapper {
	position: relative;
	.so-toggle-button {
		z-index: 999;
		position: absolute;
		top: 50%;
		right: 0;
		line-height: 80px;
		height: 80px;
		width: 10px;
		background-color: #222;
		margin-top: -40px;
		cursor: pointer;
		-webkit-transition: background 0.3s;
		transition: background 0.3s;
		-webkit-tap-highlight-color: transparent;
		border-radius: 4px 0px 0px 4px;
		i {
			color: #fff;
		}
	}
}
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
