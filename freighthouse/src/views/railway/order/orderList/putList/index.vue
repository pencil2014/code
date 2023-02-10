<template>
	<div class="app-container">
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
		<div class="table-container">
			<TableFilter :config="tableConfig" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
			<BaseTableMuti :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
		</div>
		<!-- 自定义表头 -->
		<div v-if="customColumnsPopShow">
			<CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
		</div>
		<!-- 附件列表 -->
		<div v-if="blFileListShow">
			<PopFileList @close="blFileListPopClose" :param="listItemQuery" />
		</div>
		<!-- 批量放单完成弹窗 -->
		<div v-if="putFinishPopShow">
			<PutFinishPop @close="PutFinishPopClose" :blList="selectedCheckbox" />
		</div>
		<!-- 未放单反馈弹窗 -->
		<div v-if="noPutPopShow">
			<NoPutPop @close="noPutPopClose" :blList="multipleSelection" />
		</div>
		<!-- 导出绩效表 时间范围选择弹窗 -->
		<div v-if="exportDateShow">
			<ExportDate @close="exportDateClose" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
// 弹出框
import PopFileList from './components/popFileList'
import ExportDate from './components/exportDate'
import CustomColumns from '@/components/customColumns/index'
import PutFinishPop from './components/putFinishPop'
import NoPutPop from './components/noPutPop'
import { searchConditionInfo, searchConditionSave, searchConditionDelete, baseEmployeeListName, columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
import { blPutList, blPutExport, rcPerformanceExport, blPutFinish, unPutFeedback, getOrderListDocs } from '@/api/railway/bl'
import { customerListAllStatus } from '@/api/crm/supplier'
import { getParamMethod } from '@/utils/allKindNumber'
import { departmentTreeList } from '@/api/companyResource'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: ['etdTime', 'td_time', 'oid'],
	descColumns: [],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	putStatus: 'all', // 补料状态，默认展示未审核
	scenesCode: 'RailwayPutList'
}
const defaultSearchInputGroup = [
	{ key: 'universalNo', value: '', placeholder: '各类编号', category: 'all', queryValue: '' },
	{ key: 'businessType', value: '', placeholder: '业务类型', category: 'all', queryValue: '' },
	{ key: 'blMode', value: '', placeholder: '出单方式', category: 'all', queryValue: '' },
	{ key: 'shipCarrierCode', value: '', placeholder: '船司/陆港', category: 'all', queryValue: '' },
	{ key: 'bdEmployeeId', value: '', placeholder: '销售', category: 'all', queryValue: '' },
	{ key: 'mainCustId', value: '', placeholder: '委托单位', category: 'all', queryValue: '' }
]
const confirmOptions = [
	{ label: '是', value: 'y' },
	{ label: '否', value: 'n' }
]
const isAgreeReleaseOptions = [
	{ label: '未同意', value: 'n' },
	{ label: '已同意', value: 'y' },
	{ label: '未同意(已特殊审批)', value: 'ns' },
	{ label: '已同意(已特殊审批)', value: 'ys' }
]
const takeStatusOptions = [
	{ label: '未取单', value: 'init' },
	{ label: '已取单', value: 'finish' }
]

export default {
	mixins: [routerMixin],
	data() {
		return {
			departmentList: [],
			multipleSelection: [],
			cTimestamp: 0,
			state: '',
			showVal: null,
			defaultStyle: {
				width: '100%'
			},
			serviceTypeOptions: {},
			orderNo: '',
			searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 0, // 默认显示搜索框的个数
			allFilterGroups: {
				all: this.filterGroups
			},
			// 查询条件下拉选项
			filterGroups: {
				universalNo: { key: 'universalNo', label: '各类编号', type: 'input', searchType: 'eq', value: '' },
				orderNo: { key: 'orderNo', label: '工作号', type: 'input', searchType: 'like', value: '' },
				blType: { label: '提单类型', key: 'blType', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				blMode: { label: '出单方式', key: 'blMode', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				blNo: { key: 'blNo', label: '提单号', type: 'input', searchType: 'like', value: '' },
				bdDeptCode: {
					specialProp: 'deptCode',
					label: '销售部门',
					key: 'bdDeptCode',
					type: 'cascader',
					searchType: 'in',
					cascaderList: [],
					saveList: [],
					cascaderProps: {
						children: 'childList',
						label: 'deptCname',
						value: 'deptCode',
						checkStrictly: false,
						multiple: true
					}
				},
				businessType: { label: '业务类型', key: 'businessType', propInDict: 'businessType', type: 'select', searchType: 'in', multiple: true, data: [], saveList: [], 'collapse-tags': true, queryValue: '', value: '', nonDictionary: true },
				status: { label: '寄单状态', key: 'status', propInDict: 'postStatus', type: 'select', searchType: 'in', multiple: true, data: [], saveList: [], 'collapse-tags': true, queryValue: '', value: '', nonDictionary: true },
				bkgAgentPaySettleStatus: {
					label: '订舱代理应付结清状态',
					key: 'bkgAgentPaySettleStatus',
					propInDict: 'feeSettleStatus',
					type: 'select',
					searchType: 'in',
					multiple: true,
					data: [],
					saveList: [],
					'collapse-tags': true,
					queryValue: '',
					value: '',
					nonDictionary: true
				},
				auditStatus: { label: '财务审核状态', key: 'auditStatus', propInDict: 'blFinAuditStatus', type: 'select', searchType: 'in', multiple: true, data: [], saveList: [], 'collapse-tags': true, queryValue: '', value: '', nonDictionary: true },

				bkgAgentSupplierId: {
					key: 'bkgAgentSupplierId',
					label: '订舱/仓代理',
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
						this.getSupplierList('bkg_agent', '', item)
					},
					filterMehod: (val, item) => {
						this.getSupplierList('bkg_agent', val, item)
					}
				},
				isAgreeRelease: { label: '客户是否同意放货', key: 'isAgreeRelease', type: 'select', searchType: 'eq', value: '', data: isAgreeReleaseOptions, nonDictionary: true },
				telexApplyStatus: { label: '船东电放是否申请', key: 'telexApplyStatus', type: 'select', searchType: 'eq', value: '', data: confirmOptions, nonDictionary: true },
				telexDownStatus: { label: '船东电放申请完成', key: 'telexDownStatus', type: 'select', searchType: 'eq', value: '', data: confirmOptions, nonDictionary: true },
				takeStatus: { label: '正本取单状态', key: 'takeStatus', type: 'select', searchType: 'eq', value: '', data: takeStatusOptions, nonDictionary: true },
				// blPutStatus: { label: '提单放单状态', key: 'blPutStatus', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				etaTime: { label: '预计到达时间', key: 'etaTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				etdTime: { label: '预计出发时间', key: 'etdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				tdTime: { label: '实际出发时间', key: 'tdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				auditTime: { label: '放单审核时间', key: 'auditTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				dispatchTime: { label: '派单时间', key: 'dispatchTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				takeTime: { label: '取单完成时间', key: 'takeTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				telexDownTime: { label: '船东电放完成时间', key: 'telexDownTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				cancelTime: { label: '撤回时间', key: 'cancelTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				mainCustId: {
					key: 'mainCustId',
					label: '委托单位',
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
				custSettleType: {
					label: '委托单位结算方式',
					key: 'custSettleType',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: store.state.dict.dictMap.settleMode,
					nonDictionary: true
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
						this.getEmployeeName('', item)
					},
					filterMehod: (val, item) => {
						this.getEmployeeName(val, item)
					}
				},
				obdEmployeeId: {
					key: 'obdEmployeeId',
					label: '销售助理',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getEmployeeNameObd('', item)
					},
					filterMehod: (val, item) => {
						this.getEmployeeNameObd(val, item)
					}
				},
				docEmployeeName: {
					key: 'docEmployeeName',
					label: '文件',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'doc')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'doc')
					}
				},
				putEmployeeName: {
					key: 'putEmployeeName',
					label: '放货人',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					'allow-create': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'rc')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'rc')
					}
				},
				auditEmployeeName: {
					key: 'auditEmployeeName',
					label: '财务审核人',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'ac')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'ac')
					}
				},
				shipCarrierCode: {
					key: 'shipCarrierCode',
					label: '船司/陆港',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.shipQuerySearch('', item)
					},
					filterMehod: (val, item) => {
						this.shipQuerySearch(val, item)
					},
					change: (val, item) => {
						Object.assign(item, {
							queryValue: val,
							text: val
						})
					}
				},
				transferStatus: {
					label: '提单转移状态',
					key: 'blTransferStatus',
					type: 'select',
					searchType: 'in',
					value: '',
					data: [],
					multiple: true,
					'collapse-tags': true,
					nonDictionary: true
				},
				placeCompCode: {
					label: '提单所在地',
					key: 'placeCompCode',
					type: 'select',
					searchType: 'in',
					filterable: true,
					value: '',
					data: [],
					multiple: true,
					'collapse-tags': true,
					nonDictionary: true
				}
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
					show: true,
					handleCustomColumns: this.handleCustomColumns
				},
				defaultEmpty: true, // 数据默认不加载的显示文案
				list: [],
				configColumns: [],
				columns: [],
				allColumns: store.state.railway.blPutList.columnsBase(this.handleOrderNoInfo, this.handleViewFileList),
				// 操作按钮组
				operationBtns: {
					minWidth: '80',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'Info') {
							this.handleInfo(row)
						}
					},
					data: [
						{
							label: '详情',
							type: 'text',
							show: true,
							action: 'Info'
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
			// 点击的是补料列表里的详情
			isClickInfo: false,
			blFileListShow: false, // 查看附件弹窗
			exportDateShow: false, // 导出绩效表时间范围选择弹窗
			listItemQuery: {}, // 附件弹窗props
			resDefaConfList: [], // 后端配置的默认搜索模板
			putFinishPopShow: false,
			noPutPopShow: false,
			// 为邮寄的出单方式:正本,借同行代理,HBL正本,同行借我司代理HBL正本
			isPost: ['original', 'jthdlzb', 'thzb'],
			emailPopShow: false,
			oldParams: {}
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
		// 保存url中的orderNo
		let queryOrderNo = this.$route.query.orderNo || ''
		sessionStorage.setItem('queryOrderNo', queryOrderNo)
		// 有orderNo 请求列表接口
		queryOrderNo && this.getList()
		// this.getSearchConditionInfo()
		this.getDeptList()
	},
	mounted() {
		console.log('🚀 ~ this.dictMap', this.dictMap)
	},
	computed: {
		...mapState({
			currRole: state => state.user.currRole,
			dictMap: state => state.dict.dictMap,
			blPutList: state => state.railway.blPutList,
			defaultColumns: state => state.railway.blPutList.defaultColumns,
			specialColumns: state => state.railway.blPutList.specialColumns,
			columnsBase: state => state.railway.blPutList.columnsBase()
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
		}
	},
	watch: {},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		TableFilter,
		CustomColumns,
		PopFileList,
		ExportDate,
		PutFinishPop,
		NoPutPop
	},
	methods: {
		// 转化children的空数组为undefined
		getTreeData(data) {
			data.forEach(item => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
			return data
		},
		// 所属部门下拉框
		getDeptList() {
			departmentTreeList({ state: 'valid' }).then(res => {
				this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
				this.$set(this.filterGroups, 'bdDeptCode', {
					specialProp: 'deptCode',
					label: '销售部门',
					key: 'bdDeptCode',
					type: 'cascader',
					searchType: 'in',
					cascaderList: this.departmentList,
					saveList: [],
					cascaderProps: {
						children: 'childList',
						label: 'deptCname',
						value: 'deptCode',
						checkStrictly: false,
						multiple: true
					}
				})
				if (res.data && res.data[0] && res.data[0].childList) {
					let companyListOptions = res.data[0].childList.map(item => {
						return Object.assign({}, item, {
							label: item.deptCname,
							value: item.deptCode
						})
					})
					this.$set(this.filterGroups, 'placeCompCode', {
						label: '提单所在地',
						key: 'placeCompCode',
						type: 'select',
						searchType: 'eq',
						filterable: true,
						value: '',
						data: companyListOptions,
						nonDictionary: true
					})
				}
			})
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
			this.tableQuery.putStatus = 'all'
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
		},
		// 船公司下拉列表自动补充的数据
		shipQuerySearch(queryString, item) {
			this.$store.dispatch('dict/baseShippingCarrierList', { name: queryString, state: '' }).then(data => {
				item.data = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
			})
		},
		// 获取订舱代理
		getSupplierList(type, queryString, item) {
			this.$store.dispatch('dict/queryBkgAgentSupplierList', { category: 'category', value: 'bkg_carrier,bkg_agent', queryString: queryString, categoryType: 'in' }).then(data => {
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
				let filterArr = res.data.filter(ele => !item.saveList.find(o => o.value === ele.employeeId))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: this.$language === 'en' ? ele.ename : ele.cname, value: ele.employeeId ? Number(ele.employeeId) : '' }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		// 获取OBDname
		getEmployeeNameObd(val, item) {
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: 'obd' // 角色
			}
			baseEmployeeListName(data).then(res => {
				let filterArr = res.data.filter(ele => !item.saveList.find(o => o.value === ele.employeeId))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: this.$language === 'en' ? ele.ename : ele.cname, value: ele.employeeId ? Number(ele.employeeId) : '' }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		getMulEmployeeName(val, item, role) {
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: role // 角色
			}
			baseEmployeeListName(data).then(res => {
				let list = res.data.map(ele => {
					return {
						...ele,
						label: this.$language === 'en' ? ele.ename : ele.cname,
						value: this.$language === 'en' ? ele.ename : ele.cname
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
		// 增加一条搜索条件
		handleAddFilter() {
			this.searchInputGroup.push({ key: '', value: '', category: 'all', queryValue: '' })
		},
		// enter按键事件
		handleKeyDown(e) {
			let key = null
			if (window.event === undefined) {
				key = e.keyCode
			} else {
				key = window.event.keyCode
			}
			if (key === 13 && !this.noPutPopShow) {
				// 阻止分页的页码enter键触发全局的监听事件
				let className = window.event.target.parentNode.className
				if (className.includes('el-pagination__editor')) return
				//触发的事件
				this.searchCallBack('Search')
			}
		},
		// 获取列表请求参数
		getListQuery() {
			let statusQuery = []
			// 全部
			if (this.tableQuery.putStatus === 'all') {
				statusQuery = []
			}
			// 财务待审核
			if (this.tableQuery.putStatus === 'submit') {
				statusQuery = [
					{ column: 'isCancel', type: 'eq', value: 'n' },
					{ column: 'auditOrAgree', type: 'auditOrAgree', value: 'n' },
					{ column: 'state', type: 'eq', value: 'valid' }
				]
			}

			// 待放单
			if (this.tableQuery.putStatus === 'init') {
				// statusQuery = [
				// 	{ column: 'blPutStatus', type: 'eq', value: 'init' }
				// ]
				statusQuery = [
					{ column: 'isCancel', type: 'eq', value: 'n' },
					// { column: 'auditStatus', type: 'eq', value: 'pass' },
					// { column: 'isAgreeReleaseStatus', type: 'eq', value: 'y' },
					// { column: 'isAgreeRelease', type: 'eq', value: 'y' },
					{ column: 'blPutStatus', type: 'ne', value: 'finish' },
					{ column: 'orderStatus', type: 'ne', value: 'cancel' },
					{ column: 'orderStatus', type: 'ne', value: 'break' },
					{ column: 'state', type: 'eq', value: 'valid' }
				]
			}

			// 已放单
			if (this.tableQuery.putStatus === 'finish') {
				statusQuery = [
					{ column: 'isCancel', type: 'eq', value: 'n' },
					{ column: 'blPutStatus', type: 'eq', value: 'finish' },
					{ column: 'state', type: 'eq', value: 'valid' },
					{ column: 'orderStatus', type: 'ne', value: 'cancel' },
					{ column: 'orderStatus', type: 'ne', value: 'break' }
				]
			}
			// 已撤回
			if (this.tableQuery.putStatus === 'isCancel') {
				statusQuery = [
					{ column: 'isCancel', type: 'eq', value: 'y' },
					{ column: 'state', type: 'eq', value: 'valid' }
				]
			}
			// 已取消
			if (this.tableQuery.putStatus === 'state') {
				statusQuery = [
					{ column: 'isCancel', type: 'eq', value: 'n' },
					{ column: 'state', type: 'eq', value: 'invalid' }
				]
			}
			// 合并状态参数
			let data = {}
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery)
			})
			delete data.putStatus
			return data
		},
		// 把url中的orderNo加入到查询参数中
		mapOrderNo(query) {
			let queryOrderNo = sessionStorage.getItem('queryOrderNo')
			if (queryOrderNo) {
				let ind = -1
				if (query.query) {
					ind = query.query.findIndex(item => item.column === 'orderNo')
				}
				if (ind !== -1) {
					console.log('查询条件有orderNo字段')
					query.query.splice(ind, 1, {
						column: 'orderNo',
						value: queryOrderNo,
						type: 'like'
					})
				} else {
					console.log('查询条件没有orderNo字段')
					query.query.push({
						column: 'orderNo',
						value: queryOrderNo,
						type: 'like'
					})
				}
			}
			sessionStorage.removeItem('queryOrderNo')
		},
		// 列表数据
		async getList() {
			let { data } = await columnWidthConfigInfo({
				scenesCode: `${this.$route.name}`
			})
			let { columnWidthList } = data
			let query = this.getListQuery()
			// 处理url中的orderNo
			this.mapOrderNo(query)
			query.query.map(item => {
				// 处理逗号分割的多个订单号
				if (['orderNo', 'blNo'].includes(item.column)) {
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s+]/)
						.filter(Boolean)
						.join('#')
				}
			})
			console.log('🚀 ~ query.query', query.query)
			getParamMethod(this.$route.name, query).then(queryObj => {
				blPutList(queryObj).then(response => {
					this.oldParams = queryObj
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
					this.tableConfig.configColumns.push('isCancelApply', 'isNotify', 'isChange')
					this.tableConfig.configColumns = new Set(this.tableConfig.configColumns)
					this.tableConfig.configColumns = Array.from(this.tableConfig.configColumns)
					this.tableQuery.pageSize = pageSize
					this.handleFilterColumns(this.tableConfig.configColumns)
					// 设置列宽为服务器返回的新的列宽宽度
					this.tableConfig.columns.map(item => {
						let findItem = columnWidthList.find(ele => ele.column === item.prop)
						let newWidth = findItem ? findItem.width : ''
						return Object.assign(item, { width: newWidth || item.width })
					})
					this.tableColumnsWidthList = this.getTableColumnsWidth()
					// this.getTableColumnWidthInfo()
					// this.fillPolName()
				})
			})
		},
		// 查询组件回调
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
								// 多选下拉框
								if (this.filterGroups[item.key].type === 'cascader') {
									if (this.filterGroups[item.key].cascaderProps.multiple) {
										let arr = []
										if (item.value && item.value.length) {
											for (let i = 0; i < item.value.length; i++) {
												if (item.value[i] && item.value[i].length) {
													arr.push(item.value[i][item.value[i].length - 1])
												}
											}
										}
										Object.assign(tempItem, {
											column: item.key,
											type: this.filterGroups[item.key].searchType || 'in',
											value: arr.length ? arr.toString() : ''
										})
									} else {
										Object.assign(tempItem, {
											column: item.key,
											type: 'eq',
											value: item.value ? item.value[item.value.length - 1] : ''
										})
									}
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
								} else if (item.key === 'takeStatus') {
									// 特殊处理
									// 选择未取单传值不等于finish
									if (item.value) {
										if (item.value === 'finish') {
											Object.assign(tempItem, {
												column: item.key,
												type: 'eq',
												value: 'finish'
											})
										} else {
											Object.assign(tempItem, {
												column: item.key,
												type: 'ne',
												value: 'finish'
											})
										}
									}
								} else if (item.key === 'blPutStatus') {
									// 特殊处理已推送文件
									if (item.value === 'pushedDoc') {
										Object.assign(tempItem, {
											column: 'pushedDoc',
											type: 'eq',
											value: 'y'
										})
										// this.$set(this.tableQuery, 'putStatus', 'pushFile')
									} else {
										Object.assign(tempItem, {
											column: item.key,
											type: 'eq',
											value: item.value
										})
										// this.$set(this.tableQuery, 'putStatus', item.value)
									}
								} else if (['isPledge', 'telexApplyStatus', 'telexDownStatus'].includes(item.key)) {
									if (item.value) {
										if (item.value === 'y') {
											Object.assign(tempItem, {
												column: item.key,
												type: 'eq',
												value: 'y'
											})
										} else {
											Object.assign(tempItem, {
												column: item.key,
												type: 'ne',
												value: 'y'
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
							// if (item.key === 'putStatus') {
							// 	this.tableQuery.putStatus = item.value
							// }
							if (item.key === 'isAgreeRelease') {
								if (tempItem.value === 'ys') {
									Object.assign(tempItem, {
										column: item.key,
										type: 'eq',
										value: 'y'
									})
									query.push(tempItem)
									query.push({
										column: 'agreeReleaseStatus',
										type: 'eq',
										value: 'pass'
									})
								} else if (tempItem.value === 'ns') {
									Object.assign(tempItem, {
										column: item.key,
										type: 'ne',
										value: 'y'
									})
									query.push(tempItem)
									query.push({
										column: 'agreeReleaseStatus',
										type: 'eq',
										value: 'pass'
									})
								} else {
									query.push(tempItem)
								}
							} else {
								query.push(tempItem)
							}
						}
					})
				}
				Object.assign(this.tableQuery, {
					query: query.filter(item => {
						return item.value
					}),
					currPage: 1
				})
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
			// 	// 存在自定义的模板
			// 	if (param.composeKey) {
			// 		this.setSearchCondition(param.composeKey)
			// 	} else {
			// 		// 后端有配置默认模板
			// 		if (this.resDefaConfList.length) {
			// 			let composeKey = this.resDefaConfList[0].composeKey
			// 			this.setSearchCondition(composeKey, this.resDefaConfList)
			// 		} else {
			// 			// 后端无配置默认模板
			// 			this.init()
			// 		}
			// 	}
			// 	// this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
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

		// 自定义表头
		handleCustomColumns() {
			this.customColumnsPopShow = true
		},
		// 按补料状态筛选
		handleSearchByPutStatus() {
			this.tableQuery.currPage = 1
			this.getList()
		},

		handleSizeChange() {
			this.getList()
		},
		handleCurrentChange(val) {
			// 刷新页面的先调自定义搜索查询接口，拿到自定义的搜索条件再调getList接口
			// if (val) {
			// 	this.tableQuery.currPage = val
			// 	// this.getSearchConditionInfo()
			// }
			if (val === 1) return (this.tableConfig.list = [])
			this.getList()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		// 查看附件弹窗
		handleViewFileList(index, row) {
			this.blFileListShow = true
			this.listItemQuery = {
				blId: row.blId,
				blType: row.blType,
				blNo: row.blNo,
				orderNo: row.orderNo,
				putStatus: row.putStatus
			}
		},
		blFileListPopClose(action, value) {
			this.blFileListShow = false
		},
		// 获取table选中行的orderNo
		getOids() {
			let oids = []
			this.selectedCheckbox.forEach(item => {
				oids.push(item.oid)
			})
			return oids
		},
		// 点击订单号查看详情
		handleOrderNoInfo(row) {
			this.handleInfo(row)
		},
		// 去详情页
		handleInfo(row) {
			console.log('🚀 ~ row', row)
			this.isClickInfo = true
			this.$router.push({
				name: 'RailwayPutDetail',
				params: {
					oid: row.oid
				},
				query: {
					orderNo: row.orderNo,
					oid: row.oid,
					blId: row.blId,
					blType: row.blType,
					businessType: row.businessType
				}
			})
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
		// 多选
		handleMuti(arr) {
			this.multipleSelection = arr
		},
		getReceiveObj() {
			let receiveName = this.multipleSelection[0].receiveName
			let receivePhone = this.multipleSelection[0].receivePhone
			let receiveAddress = this.multipleSelection[0].receiveAddress
			if (this.multipleSelection.some(item => item.receiveName !== receiveName)) {
				return {}
			} else if (this.multipleSelection.some(item => item.receivePhone !== receivePhone)) {
				return {}
			} else if (this.multipleSelection.some(item => item.receiveAddress !== receiveAddress)) {
				return {}
			} else {
				return {
					receiveName,
					receivePhone,
					receiveAddress
				}
			}
		},
		handleOrder() {
			// 批量寄单
			if (!this.multipleSelection.length) {
				return this.$message.error('请至少选择1条数据!')
			}
			let mainCustId = this.multipleSelection[0].mainCustId
			if (this.multipleSelection.some(item => item.mainCustId !== mainCustId)) {
				return this.$message.error('所选单的委托客户需一致!')
			} else if (this.multipleSelection.some(item => item.orderStatus === 'cancel' || item.orderStatus === 'break')) {
				return this.$message.error('所选单的订单状态需都不是已取消或已终止的单!')
			} else if (this.multipleSelection.some(item => item.putStatus === 'finish')) {
				return this.$message.error('所选单的放单状态需都为未放单!')
			} else if (this.multipleSelection.some(item => item.isCancel === 'y')) {
				return this.$message.error('所选单的提单撤回状态需都为非撤回!')
			} else if (this.multipleSelection.some(item => item.auditStatus !== 'pass')) {
				return this.$message.error('所选单的财务审核状态需都为审核通过!')
			} else if (this.multipleSelection.some(item => !(['y', 'e'].includes(item.isAgreeRelease) || item.agreeReleaseStatus === 'pass'))) {
				return this.$message.error('所选单的客户是否同意放货状态需都为已同意或同意寄单，不同意放货或未同意(已特殊审批)或已同意(已特殊审批)!')
			} else {
				let orderNoList = this.multipleSelection.map(item => {
					return item.orderNo
				})
				let receiveObj = this.getReceiveObj()
				getOrderListDocs({
					orderNoList
				}).then(res => {
					this.$message.success('批量寄单成功')
					// 所选的数据满足条件则跳转
					this.$router.push({
						path: '/order/postDetail',
						query: {
							orderNoStr: orderNoList.join(','),
							...receiveObj,
							source: 'putList'
						}
					})
				})
			}
		},
		// 导出
		handleExport() {
			let data = this.getListQuery()
			blPutExport({
				ascColumns: data.ascColumns,
				descColumns: data.descColumns,
				query: this.oldParams.query,
				scenesCode: 'RailwayPutList'
			}).then(response => {
				let { filePath } = response.data
				window.location.href = filePath
			})
		},
		exportDateClose(action, obj) {
			if (action === 'Confirm') {
				this.exportDateShow = false
				let data = this.getListQuery()
				rcPerformanceExport({
					ascColumns: data.ascColumns,
					descColumns: data.descColumns,
					...obj,
					scenesCode: 'RailwayPutList'
				}).then(response => {
					let { filePath } = response.data
					window.location.href = filePath
				})
			} else {
				this.exportDateShow = false
			}
		},
		// 绩效表导出
		handlePerformanceExport(obj) {
			console.log('绩效表导出')
			this.exportDateShow = true
		},
		// 批量放单完成弹窗
		handlePutFinish() {
			if (!this.selectedCheckbox.length) {
				return this.$message({ type: 'error', message: '请选择要批量放单完成的单' })
			}
			this.putFinishPopShow = true
		},
		PutFinishPopClose(action) {
			if (action === 'Confirm') {
				this.handleFinish()
			}
			if (action === 'Cancel') {
				this.putFinishPopShow = false
			}
		},
		// 未放单反馈
		handleNoPut() {
			console.log('🚀 ~ this.multipleSelection', this.multipleSelection)
			if (!this.multipleSelection.length) {
				return this.$message({ type: 'error', message: '请先勾选数据' })
			}
			if (
				!this.multipleSelection.every(
					item => item.blId == '0' || (item.isCancel != 'y' && item.auditStatus == 'pass' && (item.agreeReleaseStatus == 'pass' || ['e', 'y'].includes(item.isAgreeRelease)) && item.putStatus != 'finish' && item.state != 'invalid')
				)
			) {
				return this.$message({ type: 'error', message: '请勾选满足放单但还未放单的数据' })
			}
			this.noPutPopShow = true
		},
		noPutPopClose(action, value) {
			console.log('🚀 ~ value', value)
			if (action === 'Confirm') {
				console.log('🚀 ~ Confirm')
				let orderBls = this.multipleSelection.map(item => {
					return {
						blId: item.blId,
						orderNo: item.orderNo
					}
				})
				let feedbackReason = value.feedbackReason
				unPutFeedback({ orderBls, feedbackReason }).then(res => {
					if (res.code === 0) {
						this.$message.success('反馈成功!')
						this.getList()
						this.noPutPopShow = false
					}
				})
			}
			if (action === 'Cancel') {
				this.noPutPopShow = false
			}
		},
		// 批量放单完成
		handleFinish() {
			console.log('🚀 ~ this.selectedCheckbox', this.selectedCheckbox)
			if (this.selectedCheckbox.some(item => item.putStatus === 'finish')) {
				return this.$message.error('只能选择未放单的数据!')
			}
			let oids = this.getOids()
			blPutFinish({
				ids: oids
			}).then(res => {
				this.$message({
					message: '批量放单完成',
					type: 'success',
					duration: 1000,
					onClose: () => {
						this.putFinishPopShow = false
						this.getList()
					}
				})
			})
		}
	}
}
</script>
<style lang="scss">
pre {
	font-family: unset;
}
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
