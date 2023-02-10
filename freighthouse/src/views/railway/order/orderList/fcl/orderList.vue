<template>
	<div class="app-container">
		<div class="search-container">
			<Search :config.sync="searchConfig" :searchConditionConfig="searchConditionList" :callback="searchCallBack" :tableQuery.sync="tableQuery">
				<AddFilter
					:searchInputGroup="searchInputGroup"
					:allFilterGroups="allFilterGroups"
					:filterGroups="filterGroups"
					:defaultSearchLength="defaultSearchLength"
					:index="index"
					:item="item"
					v-for="(item, index) in searchInputGroup"
					:key="'filter' + index"
				/>
				<!-- <i class="el-icon-circle-plus-outline icon-search-plus" @click="handleAddFilter"></i> -->
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
		<!-- 新建弹窗 -->
		<div v-if="createOrderPopShow">
			<CreateOrder @close="createOrderPopClose" />
		</div>
		<!-- 取消订单弹窗 -->
		<div v-if="cancelOrderPopShow">
			<CancelOrder @close="cancelOrderPopClose" :orderNo="orderNo" />
		</div>
	</div>
</template>
<script>
import Vue from 'vue'
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from '@/views/order/order/orderList/components/tableFilter'
// 弹出框
import BaseDialog from '@/components/Base/Dialog/index'
import CustomColumns from '@/components/customColumns/index'
import { baseBusinessList, searchConditionInfo, searchConditionSave, searchConditionDelete } from '@/api/base'
import { orderList, orderCreate, orderListExport, orderNotifyRelease, orderCopy } from '@/api/order/list'

const defaultPage = {
	pageSize: 10,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: ['createdTime'],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	orderStatus: 'all' // 订单状态，默认展示未审核
}
const defaultSearchInputGroup = [
	{
		key: '',
		value: '',
		placeholder: '筛选条件',
		category: 'all',
		queryValue: ''
	}
]

export default {
	mixins: [routerMixin],
	data() {
		return {
			state: '',
			showVal: null,
			defaultStyle: {
				width: '100%'
			},
			businessTypeOptions: [],
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
				bdEmployeeName: { key: 'bdEmployeeName', label: '销售员', type: 'input', searchType: 'like', value: '' },
				// orderStatus: {label: '订单状态', key: 'orderStatus', type: 'select', searchType: 'eq', value: ''},
				bkgStatus: { label: '订舱状态', key: 'bkgStatus', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				custid: { key: 'custid', label: '委托单位编号', type: 'input', searchType: 'like', value: '' },
				custName: { key: 'custName', label: '委托单位', type: 'input', searchType: 'like', value: '' },
				intrustRemark: { key: 'intrustRemark', label: '委托备注', type: 'input', searchType: 'like', value: '' },
				auditRemark: { key: 'auditRemark', label: '商务备注', type: 'input', searchType: 'like', value: '' },
				bkgRemark: { key: 'bkgRemark', label: '订舱备注', type: 'input', searchType: 'like', value: '' },
				prefinCloseStatus: { label: '预关账状态', key: 'prefinCloseStatus', type: 'select', searchType: 'eq', value: '', data: store.state.order.orderList.finCloseStatus, nonDictionary: true },
				finCloseStatus: { label: '关账状态', key: 'finCloseStatus', type: 'select', searchType: 'eq', value: '', data: store.state.order.orderList.finCloseStatus, nonDictionary: true },
				businessType: { label: '业务类型', key: 'businessType', propInDict: 'shipBusinessType', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				serviceType: { label: '服务类型', key: 'serviceType', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				blNo: { key: 'blNo', label: '提单号', type: 'input', searchType: 'like', value: '' },
				blType: { key: 'blType', label: '提单类型', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				// jointNo: {key: 'jointNo', label: '协同单号', type: 'input', searchType: 'eq', value: ''},
				createdTime: { label: '订单创建时间', key: 'createdTime', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd', clearable: false },
				bizDate: { label: '业务日期', key: 'bizDate', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				shipCarrierCode: {
					key: 'shipCarrierCode',
					label: '船公司',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
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
				bkgAgentSupplierId: {
					key: 'bkgAgentSupplierId',
					label: '订舱代理',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getSupplierList('bkg_agent', '', item)
					},
					filterMehod: (val, item) => {
						this.getSupplierList('bkg_agent', val, item)
					},
					change: (val, item) => {
						let findItem = item.data.find(ele => ele.value === val)
						Object.assign(item, {
							queryValue: val,
							text: findItem ? findItem.label : ''
						})
					}
				},
				polPortCode: {
					key: 'polPortCode',
					label: '起运港',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', 'port_of_basic', this.state, 'polPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_basic', this.state, 'polPortCode', item)
					},
					change: (val, item) => {
						let findItem = item.data.find(ele => ele.value === val)
						Object.assign(item, {
							queryValue: val,
							text: findItem ? findItem.label : ''
						})
					}
				},
				porPortCode: {
					key: 'porPortCode',
					label: '驳船收货地',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', 'port_of_feeder', this.state, 'porPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_feeder', this.state, 'porPortCode', item)
					},
					change: (val, item) => {
						let findItem = item.data.find(ele => ele.value === val)
						Object.assign(item, {
							queryValue: val,
							text: findItem ? findItem.label : ''
						})
					}
				},
				transitPortCode: {
					label: '中转港',
					key: 'transitPortCode',
					type: 'remoteSelect',
					searchType: 'like',
					value: '',
					multiple: true,
					'collapse-tags': true,
					data: [],
					visibleChange: (val, item) => {
						this.portSearch('', 'port_of_basic', this.state, 'transitPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_basic', this.state, 'transitPortCode', item)
					},
					change: (val, item) => {
						Object.assign(item, {
							queryValue: val
						})
					}
				},
				podPortCode: {
					key: 'podPortCode',
					label: '目的地',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', 'port_of_destination', this.state, 'podPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_destination', this.state, 'podPortCode', item)
					},
					change: (val, item) => {
						let findItem = item.data.find(ele => ele.value === val)
						Object.assign(item, {
							queryValue: val,
							text: findItem ? findItem.label : ''
						})
					}
				},
				unloadingPortCode: {
					key: 'unloadingPortCode',
					label: '卸货港',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', 'port_of_discharge', this.state, 'unloadingPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_discharge', this.state, 'unloadingPortCode', item)
					},
					change: (val, item) => {
						let findItem = item.data.find(ele => ele.value === val)
						Object.assign(item, {
							queryValue: val,
							text: findItem ? findItem.label : ''
						})
					}
				},
				destinationArea: { key: 'destinationArea', label: '最终目的地', type: 'input', searchType: 'like', value: '' },
				bargeVessel: {
					key: 'bargeVessel',
					label: '驳船船名',
					type: 'autocomplete',
					searchType: 'like',
					value: '',
					queryValue: '',
					querySearch: (queryString, cb) => {
						this.$store.dispatch('dict/queryVessleList', { name: queryString }).then(data => {
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
				bargeVoyage: {
					key: 'bargeVoyage',
					label: '驳船航次',
					type: 'autocomplete',
					searchType: 'like',
					value: '',
					queryValue: '',
					querySearch: (queryString, cb) => {
						this.$store.dispatch('dict/queryVoyageList', { name: queryString }).then(data => {
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
				vessel: {
					key: 'vessel',
					label: '大船船名',
					type: 'autocomplete',
					searchType: 'like',
					value: '',
					queryValue: '',
					querySearch: (queryString, cb) => {
						this.$store.dispatch('dict/queryVessleList', { name: queryString }).then(data => {
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
				voyage: {
					key: 'voyage',
					label: '大船航次',
					type: 'autocomplete',
					searchType: 'like',
					value: '',
					queryValue: '',
					querySearch: (queryString, cb) => {
						this.$store.dispatch('dict/queryVoyageList', { name: queryString }).then(data => {
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
				bargeCyCutOff: { label: '驳船截关时间', key: 'bargeCyCutOff', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				cyCutOff: { label: '大船截关时间', key: 'cyCutOff', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				bargeEtdTime: { label: '驳船预计开船时间', key: 'bargeEtdTime', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				etdTime: { label: '大船预计开船时间', key: 'etdTime', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				bargeTdTime: { label: '驳船实际开船时间', key: 'bargeTdTime', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				tdTime: { label: '大船实际开船时间', key: 'tdTime', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				carrierLineName: { key: 'carrierLineName', label: '承运人航线', type: 'input', searchType: 'like', value: '' },
				siCutOff: { label: '截补料时间', key: 'siCutOff', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				vgmCutOff: { label: '截VGM时间', key: 'vgmCutOff', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' }
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
					checkSelectable({ orderNo }) {
						return orderNo ? true : false
					}
				},
				list: [],
				configColumns: [],
				columns: [],
				allColumns: store.state.order.orderList.columnsBase(this.handleOrderNoInfo),

				// 操作按钮组
				operationBtns: {
					width: '120px',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'Info') {
							this.handleInfo(row)
						}

						if (action === 'Copy') {
							this.handleCopy(row)
						}

						if (action === 'Cancel') {
							this.handleCancel(row)
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
							label: '复制',
							type: 'text',
							show: (item, row) => {
								if (this.isOp) {
									return false
								} else {
									return true
								}
							},
							// show: true,
							action: 'Copy'
						},
						{
							label: '取消',
							type: 'text',
							show: (item, row) => {
								if (this.isOp) {
									return false
								} else if (row.bkgStatus === 'book_release' && row.orderStatus !== 'complete') {
									return true
								}
							},
							// show: false,
							action: 'Cancel'
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

			// 显示自定义表头的弹窗状态
			customColumnsPopShow: false,

			// 新建订单弹窗
			createOrderPopShow: false,
			// 取消订单弹窗
			cancelOrderPopShow: false,
			// 点击的是订单列表里的详情
			isClickInfo: false,
			resDefaConfList: [] // 后端配置的默认搜索模板
		}
	},
	activated() {
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	deactivated() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	created() {
		this.getBusinessType()
		this.init()
		this.getSearchConditionInfo()
		// this.getList()
	},
	mounted() {
		// window.addEventListener('resize', () => {
		//   let tableLayout = document.getElementsByClassName('table-layout')[0]
		//   if (!tableLayout) {
		//     return
		//   }
		//   let OFFSETTOP = tableLayout.getBoundingClientRect().top
		//   let BODYHEIGHT = document.body.clientHeight
		//   this.tableConfig.style.height = (BODYHEIGHT - OFFSETTOP - 40 - 70)
		// })
	},
	computed: {
		...mapState({
			currRole: state => state.user.currRole,
			dictMap: state => state.dict.dictMap,
			orderList: state => state.order.orderList,
			defaultColumns: state => state.order.orderList.defaultColumns,
			specialColumns: state => state.order.orderList.specialColumns,
			columnsBase: state => state.order.orderList.columnsBase()
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
	},
	watch: {},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		TableFilter,
		BaseDialog,
		CustomColumns
	},
	methods: {
		// 获取服务类型
		getBusinessType() {
			let result = []
			baseBusinessList().then(res => {
				this.businessTypeOptions = res.data
				res.data.forEach(item => {
					if (item.business === 'ship' && item.serviceTypeList && item.serviceTypeList.length) {
						item.serviceTypeList.forEach(ele => {
							result.push({
								label: ele.businessType === 'rail_export_fcl' ? '海运出口整箱-' + ele.name : '海运出口拼箱-' + ele.name,
								value: ele.serviceType
							})
						})
					}
				})
				result.forEach(item => {
					Object.assign(this.serviceTypeOptions, {
						[item.value]: item.label
					})
				})
				this.$set(this.dictMap, 'serviceType', result)
				// console.log('set', this.dictMap);
			})
		},

		init() {
			// if (this.isOp) this.tableQuery.orderStatus = 'all'
			// if (this.isBd) this.tableQuery.orderStatus = 'all'
			// 默认展示全部
			this.tableQuery.orderStatus = 'all'

			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
			// // bd
			// if (this.isBd) {
			//   this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
			// }
			// // op
			// if (this.isOp) {
			//   this.searchInputGroup = [
			//     {
			//       key: "orderNo",
			//       value: "",
			//       placeholder: "各类编号",
			//       category: "all",
			//       queryValue: "",
			//     },
			//     {
			//       key: "carrierLineName",
			//       value: "",
			//       placeholder: "承运人航线",
			//       category: "all",
			//       queryValue: "",
			//     },
			//     {
			//       key: "bizDate",
			//       value: "",
			//       placeholder: "业务日期",
			//       category: "all",
			//       queryValue: "",
			//     },
			//   ]
			// }
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

		// 远程搜索港口下拉数据
		portSearch(queryString, portAttribute, state, type, item) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				let portList = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
				item.data = portList
			})
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
				item.data = data.list.map(ele => {
					return Object.assign(ele, {
						label: this.$language == 'en' ? ele.ename : ele.name,
						value: ele.supplierId ? Number(ele.supplierId) : ''
					})
				})
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
			let statusQuery = []
			if (this.tableQuery.orderStatus === 'all') {
				statusQuery = [{ column: 'orderStatus', type: 'in', value: 'submit,draft,pass,refuse,complete,break,cancel' }]
			} else {
				statusQuery = [{ column: 'orderStatus', type: 'eq', value: this.tableQuery.orderStatus }]
			}

			// 合并状态参数
			let data = {}
			console.log(this.tableQuery)

			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery)
			})
			delete data.orderStatus

			return data
		},

		// 列表数据
		getList() {
			let data = this.getListQuery()
			orderList(data).then(response => {
				let { list, totalCount, allColumns, configColumns } = response.data
				list.forEach(item => {
					item.serviceTypeName = item.serviceType ? this.serviceTypeOptions[item.serviceType] : ''
					let findItem = this.businessTypeOptions.find(ele => ele.businessType === item.businessType)
					item.businessTypeCn = findItem ? findItem.name : ''
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
				this.handleFilterColumns(this.tableConfig.configColumns)
				// this.fillPolName()
			})
		},

		// 回显港口数据
		fillPolName() {},

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
								// 中转港
								if (this.filterGroups[item.key].type === 'remoteSelect' && this.filterGroups[item.key].multiple) {
									Object.assign(tempItem, {
										column: item.key,
										type: this.filterGroups[item.key].searchType || 'eq',
										value: item.value ? item.value.toString() : ''
									})
								} else if (this.filterGroups[item.key].category === 'daterange') {
									// 时间区间组件的value值是数组，['beginDate','endDate'],要转换成后端需要的两个字段
									if (item.value) query.push({ column: item.key, type: 'ge', value: item.value[0] + ' 00:00:00' }, { column: item.key, type: 'le', value: item.value[1] + ' 23:59:59' })
								} else if (
									// 特殊处理预关账状态，关账状态
									['prefinCloseStatus', 'finCloseStatus'].includes(item.key)
								) {
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
									value: item.queryValue
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
				// 存在自定义的模板
				if (param.composeKey) {
					this.setSearchCondition(param.composeKey)
				} else {
					// 后端有配置默认模板
					if (this.resDefaConfList.length) {
						let composeKey = this.resDefaConfList[0].composeKey
						this.setSearchCondition(composeKey, this.resDefaConfList)
					} else {
						// 后端无配置默认模板
						this.init()
					}
				}
				Object.assign(this.tableQuery, defaultTableQuery, defaultPage)
				this.getList()
				Object.assign(this.tableConfig, { tips: { text: '', show: false } })
			}

			// 保存搜索模板
			if (action === 'ConditionSave') {
				this.searchConditionSave(param)
			}
			// 点击选择模板切换模板并保存
			if (action === 'ConditionImmediateSave') {
				this.searchConditionSave(param, 'immediateSave')
			}

			// 删除搜索模板
			if (action === 'ConditionDelete') {
				this.searchConditionDelete(param)
			}
		},
		// 保存搜索条件
		searchConditionSave(param, type) {
			let searchItemList = []
			this.searchInputGroup.map(item => {
				if (item.key) {
					// 特殊处理的几种查询类型,daterange,remoteSelect,mulitple
					let searchValue = ''
					searchValue = item.value
					if (this.filterGroups[item.key].category === 'daterange') {
						searchValue = item.value ? item.value.toString() : ''
					}
					if (this.filterGroups[item.key].type === 'remoteSelect') {
						// 单选
						if (!this.filterGroups[item.key].multiple) {
							// let findItem = this.filterGroups[item.key].data.find(ele => ele.value === item.value)
							console.log('item.key', item.key, this.filterGroups[item.key].text)
							let text = this.filterGroups[item.key].text
							searchValue = item.value ? `${item.value}|${text}` : ''
						} else {
							// 多选-中转港
							console.log('multiple', item.key, item.value, this.filterGroups[item.key].data)
							// let val2 = ''
							// if (item.value) {
							//   item.value.forEach((ele, index) => {
							//     let findItem = this.filterGroups[item.key].data.find(o => o.value === ele)
							//     let val = findItem ? `${ele}|${findItem.label}` : ''
							//     val2 += !index ? `${val}` : `;${val}`
							//   })
							// }
							// searchValue = val2
							searchValue = item.value ? item.value.toString() : ''
						}
					}
					searchItemList.push({
						searchField: item.key,
						searchValue: searchValue
					})
				}
			})
			console.log('select.data', this.filterGroups['bkgAgentSupplierId'].data)

			if (type === 'immediateSave') {
				searchItemList = param.searchItemList
			}
			searchConditionSave({
				scenesCode: this.$route.name,
				composeKey: param.composeKey,
				searchConfigList: searchItemList
			}).then(res => {
				if (type === 'immediateSave') {
					// 选中的模板切换设置相应的搜索条件反显
					this.setSearchCondition(param.composeKey)
					return
				} else {
					this.$message({
						type: 'success',
						message: '保存成功',
						duration: 1000,
						onClose: () => {
							this.getSearchConditionInfo()
						}
					})
				}
			})
		},
		// 删除搜索模板
		searchConditionDelete(param) {
			this.$confirm('是否确认删除该搜索模板?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					searchConditionDelete({
						scenesCode: this.$route.name,
						composeKey: param.composeKey
					}).then(res => {
						this.$message({
							type: 'success',
							message: '删除成功',
							duration: 1000,
							onClose: () => {
								this.getSearchConditionInfo()
							}
						})
					})
				})
				.catch(err => {})
		},

		// 新建
		handleAdd() {
			this.createOrderPopShow = true
		},

		// 取消订单
		handleCancel(row) {
			this.orderNo = row.orderNo
			this.cancelOrderPopShow = true
		},

		// 导出
		handleExport() {
			let data = this.getListQuery()
			orderListExport({
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

		// 按订单状态筛选
		handleSearchByOrderStatus() {
			this.tableQuery.currPage = 1
			this.getList()
		},

		// 多选
		handleMuti(arr) {
			this.selectedCheckbox = arr
		},

		handleSizeChange() {
			this.getList()
		},

		handleCurrentChange(val) {
			// 刷新页面的先调自定义搜索查询接口，拿到自定义的搜索条件再调getList接口
			if (val) {
				this.tableQuery.currPage = val
				// this.getSearchConditionInfo()
			}
			this.getList()
		},
		// 获取自定义搜索查询
		getSearchConditionInfo() {
			searchConditionInfo({
				scenesCode: this.$route.name
			}).then(res => {
				let { defaultConfigList, customConfigList } = res.data
				this.resDefaConfList = defaultConfigList
				// 搜索模板存在，就默认显示第一个模板的搜索条件。不存在搜索模板，则显示后端配置的默认模板
				// 后端如果没有配置模板的话，则前端显示默认一个空的搜索条件
				if (!customConfigList || !customConfigList.length) {
					// 后端无配置默认模板
					if (!defaultConfigList || !defaultConfigList.length) {
						this.searchConditionList = []
						this.init()
						return
					}
					// 有配置默认模板
					this.searchConditionList = []
					let composeKey = defaultConfigList[0].composeKey
					this.setSearchCondition(composeKey, defaultConfigList)
					// this.getList()
				} else {
					this.searchConditionList = customConfigList
					// 获取自定义搜索数据后默认选中第一个模板
					let composeKey = customConfigList[0].composeKey
					this.setSearchCondition(composeKey)
				}
			})
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
				// 时间区间，下拉搜索查询，下拉多选特殊处理反显
				if (this.filterGroups[item.searchField].category === 'daterange') {
					value = item.searchValue ? item.searchValue.split(',') : ''
				}
				if (this.filterGroups[item.searchField].type === 'remoteSelect') {
					// 单选
					if (!this.filterGroups[item.searchField].multiple) {
						let length = item.searchValue.length
						let indexOf = item.searchValue.indexOf('|')
						let code = item.searchValue.substring(0, indexOf)
						let text = item.searchValue.substring(indexOf + 1, length)
						value = code
						this.filterGroups[item.searchField].data = [{ label: text, value }]
						console.log('item.searchField', this.filterGroups[item.searchField].data)
					} else {
						// 多选
						if (item.searchValue) {
							// 中转港调港口接口获取下拉数据反显
							value = item.searchValue.split(',')
							this.$store.dispatch('dict/basePortListByCodes', { portCodes: item.searchValue }).then(data => {
								this.filterGroups[item.searchField].data = data
							})
							// let arr = item.searchValue.split(';')
							// console.log('arr',arr)
							// let valueArr = []
							// let options = []
							// arr.forEach(ele => {
							//   let val = ele.substring(0, ele.indexOf('|'))
							//   let label = ele.substring(ele.indexOf('|') + 1, ele.length)
							//   valueArr.push(val)
							//   options.push({
							//     value: val,
							//     label: label
							//   })
							// })
							// value = valueArr
							// this.filterGroups[item.searchField].data = options
							// console.log('options', value, options)
						}
					}
				}
				this.searchInputGroup.push({
					key: item.searchField,
					value: value,
					category: 'all',
					queryValue: ''
				})
			})
			console.log('搜索条件反显')
			// this.searchCallBack('Search')
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},

		// 获取table选中行的orderNo
		getOrderNos() {
			let orderNos = []
			this.selectedCheckbox.forEach(item => {
				orderNos.push(item.orderNo)
			})
			return orderNos
		},

		// 业务通知放舱
		handleNotifyRelease() {
			if (!this.selectedCheckbox.length) {
				return this.$message.warning('请选择订单')
			}

			if (this.selectedCheckbox.some(item => item.bkgStatus !== 'book_release')) {
				return this.$message.warning('请选择已放舱的订单')
			}

			orderNotifyRelease({ orderNoList: this.getOrderNos() }).then(res => {
				this.$message.success('通知放舱成功')
			})
		},
		// 点击订单号查看详情
		handleOrderNoInfo(index, row) {
			this.handleInfo(row)
		},
		// 去详情页
		handleInfo(row) {
			let action = ''
			// this.isClickInfo = true
			// let component = 'OrderDetail'
			// 业务除草稿和拒绝状态都不可编辑
			if (this.isBd && !['draft', 'refuse'].includes(row.orderStatus)) {
				action = 'view'
			}
			// 操作角色未完成的可编辑
			if (this.isOp && row.orderStatus !== 'pass') {
				action = 'view'
			}
			// // 服务类型是客户自定的
			// if (row.serviceType === 'st02') {
			//   component = 'SelfOrderDetail'
			// } else {
			//   component = 'OrderDetail'
			// }
			// this.isJumpRouteFromPage = true
			this.routerPush('FclOrderDetail', {
				source: 'fclOrderList',
				orderNo: row.orderNo,
				action: action ? action : undefined
			})
			// this.$router.push({
			//   path: `orderDetail?orderNo=${row.orderNo}${urlQuery}`
			// })
		},

		// 复制
		handleCopy(row) {
			// this.isClickInfo = true
			this.$confirm(`是否确认复制工作号: ${row.orderNo} 委托单位：${row.custName} 的数据?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return orderCopy({ orderNo: row.orderNo })
				})
				.then(response => {
					let { orderNo } = response.data
					// let component = 'OrderDetail'
					// // 服务类型为客户自定的
					// if (row.serviceType === 'st02') {
					//   component = 'SelfOrderDetail'
					// } else {
					//   component = 'OrderDetail'
					// }
					this.$message({
						message: '复制成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							// this.isJumpRouteFromPage = true
							// this.$router.push({
							//   path: `orderDetail?orderNo=${orderNo}&action=copy`
							// })
							this.routerPush('OrderDetail', {
								orderNo: orderNo,
								action: 'copy'
							})
						}
					})
				})
				.catch(() => {})
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
				// console.log('columnsKeys:',this.tableQuery.columns)
				this.getList()
			}
		},

		// 新建订单保存
		handleCreateOrder(value, includeFeederType) {
			// this.isClickInfo = true
			orderCreate(value).then(res => {
				let { orderNo } = res.data
				let path = 'orderDetail?orderNo=' + orderNo
				let component = 'OrderDetail'
				// console.log(value);
				sessionStorage.setItem('createOrderStr', JSON.stringify(res.data))
				this.routerPush('OrderDetail', {
					orderNo: orderNo,
					action: 'add',
					includeFeeder: includeFeederType
				})
			})
		},

		// 新建订单关闭回调
		createOrderPopClose(action, value, includeFeederType) {
			this.createOrderPopShow = false
			if (action === 'Confirm') {
				this.handleCreateOrder(value, includeFeederType)
			}
		},

		// 取消订单关闭回调
		cancelOrderPopClose(action, value) {
			this.cancelOrderPopShow = false
			if (action === 'Confirm') {
				this.getList()
				//this.handleCreateOrder(value)
			}
		}
	}
}
</script>
<style lang="scss"></style>
