<template>
	<div class="">
		<div class="search-container">
			<Search :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
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
		<div class="finance-search-list-gap"></div>
		<div class="table-container noborder">
			<TableFilter ref="tableFilter" :loadingObj="loadingObj" :config="tableConfig" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
			<BaseTableMuti :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
		</div>
		<!-- 自定义表头 -->
		<div v-if="customColumnsPopShow">
			<CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
		</div>
		<div v-if="importShow">
			<Import @close="importPopClose" />
		</div>
		<div v-if="fileListShow">
			<fileListPop @close="fileListClose" :options="fileListRow" />
		</div>
    <shareFee v-if="dialogVisible.show" :dialogVisible="dialogVisible"/>
	</div>
</template>
<script>
import Vue from 'vue'
import store from '@/store'
import { mapState } from 'vuex'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { getDictLabel } from '@/utils/tools'
import Cookies from 'js-cookie'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
import Import from './components/import'
import fileListPop from './components/fileListPop'
import shareFee from './components/shareFee'
import CustomColumns from '@/components/customColumns/index'

import { expressDetail, expressList, expressListExport, expressDelete, expressUpdateStatus, expressConfirmFee, expressCancelFee } from '@/api/order/post'
import { getDictList, searchConditionInfo, searchConditionSave, searchConditionDelete, baseEmployeeListName, companyPageList, baseCompanySettleList, columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
import EXPRESS from '@/api/fin/expressBill'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: ['createdTime'],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	feeStatus: 'all' // 状态，默认展示全部
}
const defaultSearchInputGroup = [
	{
		key: 'universalNo',
		value: '',
		placeholder: '各类编号',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'expressSupplierId',
		label: '快递公司',
		value: '',
		placeholder: '请选择快递公司',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'expressType',
		label: '快件类型',
		value: '',
		placeholder: '请选择快件类型',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'status',
		label: '寄单状态',
		value: '',
		placeholder: '请选择寄单状态',
		category: 'all',
		queryValue: ''
	},
	// {
	//   key: "payer",
	//   label: "付款方",
	//   value: "",
	//   isReadOnly: true,
	//   placeholder: "请选择付款方",
	//   category: 'payer',
	//   queryValue: "",
	// },
	{
		key: 'createdTime',
		label: '创建时间',
		value: '',
		placeholder: '时间',
		category: 'all',
		queryValue: ''
	}
	// {
	//   key: "bdEmployeeId",
	//   label: "业务员",
	//   value: "",
	//   isReadOnly: true,
	//   placeholder: "请选择业务员",
	//   category: 'all',
	//   queryValue: "",
	// },
]
export default {
	name: 'post1',
	label: '寄单列表',
	mixins: [routerMixin],
	data() {
		return {
      dialogVisible:{
        show: false,
        list: []
      },
			state: '',
			initStatus: false,
			showVal: null,
			defaultStyle: {
				width: '100%'
			},
			// searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 0, // 默认显示搜索框的个数
			allFilterGroups: {
				all: this.filterGroups
			},
			// 查询条件下拉选项
			filterGroups: {
				universalNo: { key: 'universalNo', label: '各类编号', type: 'input', searchType: 'eq', value: '' },
				expressCode: { key: 'expressCode', label: '寄单编号', type: 'input', searchType: 'like', value: '' },
				expressNo: { key: 'expressNo', label: '快递单号', type: 'input', searchType: 'like', value: '' },
				orderNo: { key: 'orderNo', label: '工作单号', type: 'input', searchType: 'like', value: '' },
				expressType: { key: 'expressType', label: '快件类型', type: 'select', data: [], nonDictionary: true, searchType: 'eq', value: '' },
				payer: { key: 'payer', label: '付款方', type: 'select', data: store.state.dict.dictMap.expressPayer, nonDictionary: true, searchType: 'eq', value: '' },
				receisendType: { key: 'receisendType', label: '收寄类型', type: 'select', data: [], nonDictionary: true, searchType: 'eq', value: '' },
				postType: { key: 'postType', label: '寄单方式', type: 'select', data: [], nonDictionary: true, searchType: 'eq', value: '' },
				status: { key: 'status', label: '寄单状态', type: 'select', data: store.state.dict.dictMap.postStatus, nonDictionary: true, searchType: 'eq', value: '' },
				businessType: { label: '业务类型', key: 'businessType', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				expressSupplierId: {
					key: 'expressSupplierId',
					label: '快递公司',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						if (val) {
							this.getSupplierList('', item)
						}
					},
					filterMehod: (val, item) => {
						this.getSupplierList(val, item)
					}
				},
				// expressSupplierName: {key: 'expressSupplierName', label: '快递公司', type: 'input', searchType: 'like', value: ''},
				postTime: { label: '寄单时间', key: 'postTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				createdTime: { label: '创建时间', key: 'createdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				updatedTime: { label: '修改时间', key: 'updatedTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				postUser: { key: 'postUser', label: '寄单人', type: 'input', searchType: 'like', value: '' },
				createdName: { key: 'createdName', label: '创建人', type: 'input', searchType: 'like', value: '' },
				amt: { key: 'amt', label: '金额', type: 'input', searchType: 'like', value: '' },
				// currency: {key: 'currency', label: '币种', type: 'select', searchType: 'eq', value: '', data: store.state.dict.dictMap.validCurrency, nonDictionary: true},
				signTime: { label: '签收时间', key: 'signTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				signUser: { key: 'signUser', label: '签收人', type: 'input', searchType: 'like', value: '' },
				receiveCompany: { key: 'receiveCompany', label: '收件方公司', type: 'input', searchType: 'like', value: '' },
				sendCompany: { key: 'sendCompany', label: '发件方公司', type: 'input', searchType: 'like', value: '' },
				bdEmployeeId: {
					key: 'bdEmployeeId',
					label: '业务员',
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
				companyCode: {
					key: 'companyCode',
					label: '付款分公司',
					type: 'select',
					searchType: 'eq',
					filterable: true,
					value: '',
					data: [],
					// saveList: [],
					nonDictionary: true
					// visibleChange: (val, item) => {
					// 	if (val) this.getCompanyList('', item)
					// },
					// filterMehod: (val, item) => {
					// 	this.getCompanyList(val, item)
					// }
				},
				// receiveCompanyId: {
				//   key: "receiveCompanyId",
				//   label: "收件方公司",
				//   type: "remoteSelect",
				//   searchType: "eq",
				//   value: "",
				//   data: [],
				//   nonDictionary: true,
				//   visibleChange: (val, item) => {
				//     this.getCustList("", item)
				//   },
				//   filterMehod: (val, item) => {
				//     this.getCustList(val, item)
				//   },
				//   change: (val, item) => {
				//     Object.assign(item, {
				//       queryValue: val,
				//     })
				//   },
				// },
				// sendCompanyId: {
				//   key: "sendCompanyId",
				//   label: "发件方公司",
				//   type: "remoteSelect",
				//   searchType: "eq",
				//   value: "",
				//   data: [],
				//   nonDictionary: true,
				//   visibleChange: (val, item) => {
				//     this.getCustList("", item)
				//   },
				//   filterMehod: (val, item) => {
				//     this.getCustList(val, item)
				//   },
				//   change: (val, item) => {
				//     Object.assign(item, {
				//       queryValue: val,
				//     })
				//   },
				// },
				remark: { key: 'remark', label: '备注', type: 'input', searchType: 'like', value: '' }
				// feeStatus: {key: 'feeStatus', label: '费用确认状态', type: 'select', searchType: 'eq', value: '', data: store.state.dict.dictMap.expressFeeStatus, nonDictionary: true},
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
					checkSelectable({ expressId }) {
						return expressId ? true : false
					}
				},
				customColumns: {
					show: true,
					handleCustomColumns: this.handleCustomColumns
				},
				defaultEmpty: true,
				list: [],
				configColumns: [],
				columns: [],
				allColumns: store.state.order.postList.columnsBase(this.handleExpNoInfo, this.handleShareFee),
				// 操作按钮组
				operationBtns: {
					minWidth: '150',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'Info') {
							this.handleInfo(row)
						}
						if (action === 'Delete') {
							this.handleDelete(row)
						}
						if (action === 'File') {
							this.handleFile(row)
						}
					},
					data: [
						{
							label: '详情',
							type: 'text',
							show: true,
							action: 'Info'
						},

						{
							label: '查看附件',
							type: 'text',
							show: true,
							action: 'File'
						},
						{
							label: '删除',
							type: 'text',
							className: 'red',
							show: (index, row) => {
								// 已核对，已推送状态不可删除，其他可删除
								return row.feeStatus !== 'checked' && row.feeStatus !== 'sended'
							},
							action: 'Delete'
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
			// 显示自定义表头的弹窗状态
			customColumnsPopShow: false,
			status: '',
			importShow: false, // 导入弹窗
			resDefaConfList: [], // 后端配置的默认搜索模板
			businessTypeOptions: [],
			fileListShow: false,
			fileListRow: {},
			oldParams: {},
			loadingObj: {
				confirmFeeLoading: false,
				cancelFeeLoading: false
			}
		}
	},
	activated() {
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
		this.getList()
		this.getCompanyList()
	},
	deactivated() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	created() {
		this.init()
		// this.getSearchConditionInfo()
		// this.getList()
		this.getCompanyList()
	},
	mounted() {
		this.$nextTick(() => {
			this.initStatus = true
		})
	},
	computed: {
		...mapState({
			currRole: state => state.order.currRole,
			dictMap: state => state.dict.dictMap,
			postStatus: state => state.dictMap.postStatus,
			defaultColumns: state => state.order.postList.defaultColumns,
			specialColumns: state => state.order.postList.specialColumns,
			columnsBase: state => state.order.postList.columnsBase()
		})
	},
	watch: {},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		TableFilter,
		CustomColumns,
		Import,
		fileListPop,
    shareFee
	},
	methods: {
		// 自定义列宽查询
		getTableColumnWidthInfo() {
			columnWidthConfigInfo({
				scenesCode: `${this.$route.name}`
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
				console.log('this.tableColumnsWidthList', this.tableColumnsWidthList)
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
				scenesCode: `${this.$route.name}`,
				columnWidthList: data
			})
				.then(res => {})
				.finally(() => {})
		},
		init() {
			// 默认展示全部
			// this.tableQuery.feeStatus = "all"
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
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
		// 分公司下拉
		getCompanyList(val, item) {
			// let data = {
			// 	query: [
			// 		{ column: 'companyName', type: 'like', value: val },
			// 		{ column: 'state', type: 'eq', value: 'valid' }
			// 	],
			// 	pageSize: 1000
			// }
			// companyPageList(data).then(res => {
			// 	let filterArr = res.data.list.filter(ele => !item.saveList.find(o => o.value === ele.companyCode))
			// 	let itemList = filterArr.map(ele => {
			// 		return {...ele, label: this.$language == 'en' ? ele.companyEname : ele.companyName, value: ele.companyCode || ''}
			// 	})
			// 	item.data = [...item.saveList, ...itemList]
			// })

			baseCompanySettleList().then(res => {
				let list = res.data.map(ele => {
					return { ...ele, label: ele.companyName, value: ele.companyCode || '' }
				})
				this.$set(this.filterGroups, 'companyCode', {
					key: 'companyCode',
					label: '付款分公司',
					type: 'select',
					searchType: 'eq',
					filterable: true,
					value: '',
					data: list || [],
					nonDictionary: true
				})
			})
		},
		// 点击寄单号查看详情
		handleExpNoInfo(index, row) {
			this.handleInfo(row)
		},
		// 点击寄单号查看详情
		handleShareFee(index, row) {
      EXPRESS.getExpressAllotFee({expressCodeList:[row.expressCode]}).then(res => {
        if(res.data && res.data.length) {
          this.dialogVisible.show = true
          this.dialogVisible.list = res.data
// currency: "CNY"
// employeeName: "深圳文件_ZL"
// expressCode: "EXPR202207071239"
// expressNo: "SF103166164123"
// feeAmt: 12.09
// orderNo: ""
// refType: "employee"
// settleCompCode: "000001"
// settleCompName: "深圳市长帆供应链有限公司"
// settleCorpCode: "SV00000007"
// settleCorpName: "顺丰快递"
// sourceBizNo: "FLSZ2207000119"
// sourceType: "finbill"
        } else {
          this.$msgErrClose('无分摊费用！')
        }
      })
		},
		// 获取列表请求参数
		getListQuery() {
			let statusQuery = []
			if (this.tableQuery.feeStatus === 'all') {
				// statusQuery = [{'column': 'feeStatus', 'type': 'in', 'value': 'init,confirmed,sended,checked'}]
				statusQuery = []
			} else {
				statusQuery = [{ column: 'feeStatus', type: 'eq', value: this.tableQuery.feeStatus }]
			}
			// 合并状态参数
			let data = {}
			console.log(this.tableQuery)
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery)
			})
			delete data.feeStatus
			return data
		},
		// 列表数据
		async getList() {
			if (!this.initStatus) return
			let { data } = await columnWidthConfigInfo({
				scenesCode: `${this.$route.name}`
			})
			let { columnWidthList } = data
			let query = this.getListQuery()
			//处理逗号分割的多个订单号
			query.query.map(item => {
				if (['orderNo', 'expressCode', 'expressNo', 'universalNo'].includes(item.column)) {
					// item.type = 'in'
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s]/)
						.filter(Boolean)
						.join('#')
				}
			})
			expressList(query).then(response => {
				this.oldParams = query
				let { list, totalCount, configColumns, pageSize } = response.data
				this.tableConfig.list = list
				// 请求无数据显示的文案
				if (!list || !list.length) {
					this.$set(this.tableConfig, 'defaultEmpty', false)
				}
				this.tableConfig.pagination.total = totalCount
				this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
				this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
				this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
				this.tableConfig.pagination.isLastPage = response.data.isLastPage
				this.tableQuery.currPage = response.data.currPage
				this.tableQuery.pageSize = pageSize
				// 设置列宽为服务器返回的新的列宽宽度
				this.tableConfig.columns.map(item => {
					let findItem = columnWidthList.find(ele => ele.column === item.prop)
					let newWidth = findItem ? findItem.width : ''
					return Object.assign(item, { width: newWidth || item.width })
				})
				this.tableColumnsWidthList = this.getTableColumnsWidth()
				// this.getTableColumnWidthInfo()
				this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns
				this.handleFilterColumns(this.tableConfig.configColumns)
			})
		},
		handleExport() {
			// 导出
			let data = this.getListQuery()
      // 财务0720需求，有选中时，只导出选中的
      let selectedRows
      if(this.selectedCheckbox.length){
        selectedRows = this.selectedCheckbox.map(item => item.expressId).join('#')
      }
			expressListExport({
				ascColumns: data.ascColumns,
				descColumns: data.descColumns,
				query: selectedRows ? [{column: "expressId", type: "in", value: selectedRows}] : this.oldParams.query
			}).then(response => {
				let { filePath } = response.data
				window.location.href = filePath
			})
		},
		// 获取发件方公司，收件方公司
		getCustList(val, item) {
			this.$store.dispatch('dict/queryCustomerList', val).then(data => {
				let result = data.list.map(o => {
					return Object.assign(o, {
						value: o.custid ? Number(o.custid) : '',
						label: this.$language == 'en' ? o.ename : o.name
					})
				})
				item.data = result
			})
		},
		// 获取快递公司
		getSupplierList(queryString, item) {
			this.$store.dispatch('dict/querySupplierList', { category: 'category', value: 'delivery', queryString: queryString }).then(data => {
				// item.data = data.list.map(ele => {
				// 	return Object.assign(ele, {
				// 		label: this.$language == 'en' ? ele.ename : ele.name,
				// 		value: ele.supplierId ? Number(ele.supplierId) : ''
				// 	})
				// })
				let filterArr = data.list.filter(ele => !item.saveList.find(o => o.value === ele.supplierId))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: this.$language == 'en' ? ele.ename : ele.name, value: ele.supplierId ? Number(ele.supplierId) : '' }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		// 获取员工name
		getEmployeeName(val, item) {
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: 'bd' // 角色
			}
			baseEmployeeListName(data).then(res => {
				// item.data = res.data.filter(item => item.status === 'on').map(item => {
				// 	return Object.assign(item, {
				// 		label: this.$language === 'en' ? item.ename : item.cname,
				// 		value: item.employeeId ? Number(item.employeeId) : ''
				// 	})
				// })
				let filterArr = res.data.filter(ele => !item.saveList.find(o => o.value === ele.employeeId))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: this.$language == 'en' ? ele.ename : ele.cname, value: ele.employeeId ? Number(ele.employeeId) : '' }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		// 查询组件回调
		searchCallBack(action, param) {
			let query = []
			if (action === 'Search') {
				//默认的查询条件组装tableQuery参数
				if (this.searchConfig.length) {
					this.searchConfig.forEach((item, index) => {
						let tempQuery = {}
						if (item.value) {
							Object.assign(tempQuery, {
								column: item.key === 'postStatus' ? 'status' : item.key,
								type: item.searchType || 'eq',
								value: item.queryValue ? item.queryValue : item.value
							})
							query.push(tempQuery)
						}
					})
				}
				// 新增的查询条件组装tableQuery参数
				if (this.searchInputGroup.length) {
					this.searchInputGroup.forEach((item, index) => {
						let tempItem = {}
						if (item.key) {
							// 非自动补全的查询参数从item.value中取值合并到query
							if (this.filterGroups[item.key].type !== 'autocomplete') {
								// 下拉可搜索多选
								if (this.filterGroups[item.key].multiple) {
									Object.assign(tempItem, {
										column: item.key,
										type: this.filterGroups[item.key].searchType || 'eq',
										value: item.value ? item.value.toString() : ''
									})
								} else if (this.filterGroups[item.key].category === 'daterange') {
									// 时间区间组件的value值是数组，['beginDate','endDate'],要转换成后端需要的两个字段
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
								} else if (['prefinCloseStatus', 'finCloseStatus'].includes(item.key)) {
									// 特殊处理预关账状态，关账状态
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
				console.log('serach:', this.tableQuery)
				this.getList()
			}
			if (action === 'Reset') {
				this.handleSearchValueReset()
			}
			// 模板加载后修改搜索组件的数组
			if (action === 'Update') {
				this.searchInputGroup = param.length ? [...param] : [...defaultSearchInputGroup]
			}
			// if (action === 'Reset') {
			// 	if (param.composeKey) {
			// 		this.setSearchCondition(param.composeKey)
			// 	} else {
			// 		// 后端有配置默认模板
			// 		if (this.resDefaConfList.length) {
			// 			let composeKey = this.resDefaConfList[0].composeKey
			// 			this.setSearchCondition(composeKey, this.resDefaConfList)
			// 		} else {
			// 			// 后端无配置默认模板
			// 			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
			// 		}
			// 	}
			// 	Object.assign(this.tableQuery, defaultTableQuery, {
			// 		currPage: 1
			// 	})
			// 	this.getList()
			// 	Object.assign(this.tableConfig, { tips: { text: '', show: false } })
			// }
		},
		handleSearchValueReset() {
			this.searchInputGroup.map(item => {
				item.value = ''
				return { ...item }
			})
			// console.log('重置')
		},
		// 新建
		handleAdd() {
			sessionStorage.setItem('postAddStorage', true)
			this.routerPushTab('PostDetail', { source: 'postList' })
		},
		// 自定义表头
		handleCustomColumns() {
			this.customColumnsPopShow = true
		},
		// 多选
		handleMuti(arr) {
			this.selectedCheckbox = arr
			let txt = '快递费合计：'
			let total = 0
			arr.map(item => {
				total = new LSnum(total).plus(item.amt).toNum(2)
			})
			txt = txt + total + ' CNY'
			this.tableConfig.tips.text = this.tableConfig.tips.text + '    ' + txt
		},
		handleSizeChange() {
			this.getList()
		},
		handleCurrentChange(val) {
			// 刷新页面的先调自定义搜索查询接口，拿到自定义的搜索条件再调getList接口
			if (val) {
				this.tableQuery.currPage = val
				this.getSearchConditionInfo()
			}
			this.getList()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		// 获取table选中行的expressId
		getPostIds() {
			let expressIds = []
			this.selectedCheckbox.forEach(item => {
				expressIds.push(item.expressId)
			})
			return expressIds
		},
		// 去详情页
		handleInfo(row) {
			this.routerPushTab('PostDetail', { expressId: row.expressId, feeStatus: row.feeStatus, source: 'postList' }) //新增费用状态参数
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
		},
		// 获取特殊处理的自定义表头，例：polCode,需要传polCode,polEname,polCname,podCode, podEname,podCname给后端
		getColumnsValues(value) {
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
		handleDelete(row) {
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return expressDelete({ expressId: row.expressId })
				})
				.then(response => {
					this.$message({
						type: 'success',
						message: '删除成功',
						duration: 1000,
						onClose: () => {
							let totalPage = Math.ceil((this.tableConfig.pagination.total - 1) / this.tableQuery.pageSize)
							let currPage = this.tableQuery.currPage > totalPage ? totalPage : this.tableQuery.currPage
							this.tableQuery.currPage = currPage < 1 ? 1 : currPage
							this.getList()
						}
					})
				})
				.catch(() => {})
		},
		handleFile(row) {
			// 查看附件
			this.fileListShow = true
			this.fileListRow = row
		},
		fileListClose() {
			this.fileListShow = false
		},
		// 按tab切换table
		handleSearchByStatus() {
			this.tableQuery.currPage = 1
			this.getList()
		},
		// 修改状态
		handleUpdateStatus(value) {
			if (!this.selectedCheckbox.length) {
				return this.$message({ type: 'error', message: '请选择要修改状态的寄单' })
			}
			let data = {
				expressIds: this.getPostIds() || [],
				status: value
			}
			expressUpdateStatus(data)
				.then(res => {
					this.$message({
						type: 'success',
						message: '修改状态成功',
						duration: 1000,
						onClose: () => {
							this.$refs.tableFilter.status = ''
							this.getList()
						}
					})
				})
				.catch(err => {
					this.$refs.tableFilter.status = ''
					console.log(err)
				})
		},
		// 打开导入弹窗
		handleImport() {
			this.importShow = true
		},
		// 导入弹窗关闭回调
		importPopClose(action, values) {
			this.importShow = false
			if (action === 'Confirm') {
				this.getList()
			}
		},
		// 费用确认状态
		handleConfirmFee() {
			if (!this.selectedCheckbox.length) {
				return this.$message({ type: 'error', message: '请选择要推送费用的寄单' })
			}
			// 费用为0的金额不可操作确认费用
			let data = {
				expressIds: this.getPostIds() || []
			}
			this.$confirm('是否要进行推送费用?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					this.loadingObj.confirmFeeLoading = true
					expressConfirmFee(data)
						.then(response => {
							this.loadingObj.confirmFeeLoading = false
							this.$message({
								type: 'success',
								message: '推送成功',
								duration: 1000,
								onClose: () => {
									this.getList()
								}
							})
						})
						.catch(() => {
							this.loadingObj.confirmFeeLoading = false
						})
				})
				.catch(() => {})
		},
		handleCancelFee() {
			// 撤回推送费用
			if (!this.selectedCheckbox.length) {
				return this.$message({ type: 'error', message: '请选择要撤回推送费用的寄单' })
			} else if (this.selectedCheckbox.some(item => item.feeStatus === 'init')) {
				return this.$message({ type: 'error', message: '未推送的寄单不可撤回' })
			}
			// 费用为0的金额不可操作确认费用
			let data = {
				expressIds: this.getPostIds() || []
			}
			this.$confirm('是否要进行撤回推送费用?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					this.loadingObj.cancelFeeLoading = true
					expressCancelFee(data)
						.then(response => {
							this.loadingObj.cancelFeeLoading = false
							this.$message({
								type: 'success',
								message: '撤回成功',
								duration: 1000,
								onClose: () => {
									this.getList()
								}
							})
						})
						.catch(() => {
							this.loadingObj.cancelFeeLoading = false
						})
				})
				.catch(() => {})
		},
		handlePrint() {
			// 打印签收单
			let expressCodeStr = ''
			let arr = []
			if (this.selectedCheckbox.length) {
				arr = JSON.parse(JSON.stringify(this.selectedCheckbox))
			} else if (this.tableConfig.list.length) {
				arr = JSON.parse(JSON.stringify(this.tableConfig.list))
			} else {
				this.$message.error('请先选择打印的数据')
				return
			}
			expressCodeStr = arr
				.map(item => {
					return item.expressCode
				})
				.join('#')
			// console.log(data)
			this.routerPushTab('postPrint', { expressCodeStr: JSON.stringify(expressCodeStr) })
		}
	}
}
</script>
<style lang="scss" scoped>
.table-container.noborder {
	background-color: #fff;
	margin-top: 8px;
	// padding: 0.8% 1.2% 1.2%;
	padding: 8px;
	.el-table--border {
		border: 0;
	}
	.tips-abs {
		top: -70px;
	}
	.el-button--mini {
		height: 20px;
		padding: 2px 8px;
	}
	.el-input--mini .el-input__inner,
	.el-input--mini .el-input__icon {
		height: 20px;
		line-height: 20px;
	}
	.operate-group .el-button--mini {
		padding: 5px 0;
	}
}
.table-container ::v-deep .operate-group .el-button--mini {
	padding: 0;
}
</style>
