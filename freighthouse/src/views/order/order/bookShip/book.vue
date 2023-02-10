<template>
	<div class="app-container" id="bookShip">
		<div v-if="roles.includes('pricing') && roles.includes('bkg')" class="book-role-cont">
			<el-button key="pricing" type="default" size="mini" :class="currRole === 'pricing' ? 'active' : ''" @click="handleChangeRole('pricing')">商务视角</el-button>
			<el-button key="bkg" type="default" size="mini" :class="currRole === 'bkg' ? 'active' : ''" @click="handleChangeRole('bkg')">订舱视角</el-button>
		</div>
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
				<div class="btn-plus-search" @click="handleAddFilter"></div>
			</Search>
		</div>
		<div class="table-container" style="position: relative">
			<el-checkbox v-model="islLoop" class="order-loop-switch">自动刷新</el-checkbox>
			<el-tabs v-model="activeName" @tab-click="handleClick" class="bookShip-tabs">
				<el-tab-pane label="订舱单" name="order"></el-tab-pane>
				<el-tab-pane label="占舱单" name="occupy"></el-tab-pane>
			</el-tabs>
			<keep-alive>
				<component :is="component" :ref="activeName" />
			</keep-alive>
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'

import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BookList from './bookList'
import ZcList from './zcList'
import { baseEmployeeListName } from '@/api/base'
import { customerListAllStatus } from '@/api/crm/supplier'
import { departmentTreeList } from '@/api/companyResource'

const defaultSearchInputGroup = [
	{
		key: 'universalNo',
		value: '',
		placeholder: '各类编号',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'shipCarrierCode',
		value: '',
		placeholder: '船公司',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'podPortCode',
		value: '',
		placeholder: '目的地',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'auditTime',
		value: '',
		placeholder: '审核时间',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'bdEmployeeId',
		value: '',
		placeholder: '销售',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'bkgAgentSupplierId',
		value: '',
		placeholder: '订舱代理',
		category: 'all',
		queryValue: ''
	}
]

export default {
	data() {
		return {
			islLoop: false,
			departmentList: [],
			intervalTimer: null,
			activeName: 'order',
			defaultSearchLength: 0, // 默认显示搜索框的个数
			allFilterGroups: {
				all: this.filterGroups
			},
			// 查询条件下拉选项
			filterGroups: {
				universalNo: {
					key: 'universalNo',
					label: '各类编号',
					type: 'input',
					searchType: 'eq',
					value: ''
				},
				bkgReqNo: {
					label: '申请单号',
					key: 'bkgReqNo',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				orderNo: {
					label: '工作号',
					key: 'orderNo',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				jointNo: {
					key: 'jointNo',
					label: '协同单号',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				shipRefNo: {
					label: '船东参考号',
					key: 'shipRefNo',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				shipCarrierOrderNo: {
					label: '船司订单号',
					key: 'shipCarrierOrderNo',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				contractNo: {
					label: '合约号',
					key: 'contractNo',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				so: {
					label: 'SO号',
					key: 'so',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				businessType: { 
					label: '业务类型', 
					key: 'businessType', 
					propInDict: 'shipBusinessType', 
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
				serviceType: { 
					label: '服务类型', 
					key: 'serviceType', 
					type: 'select',
					searchType: 'in', 
					multiple: true, 
					data: [], 
					saveList: [], 
					'collapse-tags': true,
					queryValue: '', 
					value: '', 
					nonDictionary: true, 
					propInDict: 'shipServiceType' 
				},
				custid: {
					key: 'custid',
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
				transportTerm: {
					label: '运输条款',
					key: 'transportTerm',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true,
					propInDict: 'shipTerms'
				},
				payMode: {
					label: '付款方式',
					key: 'payMode',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true
				},
				cancelExecTime: {
					label: '取消/终止/关闭时间',
					key: 'cancelExecTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				bkgStatus: { label: '订舱状态', key: 'bkgStatus', type: 'select', searchType: 'in', multiple: true, data: [], saveList: [], 'collapse-tags': true, queryValue: '', value: '', nonDictionary: true },
				priceType: { label: '拿价类型', key: 'priceType', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				shipCarrierCode: {
					key: 'shipCarrierCode',
					label: '船公司',
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
							this.shipCarrierQuerySearch('', item)
						}
					},
					filterMehod: (val, item) => {
						this.shipCarrierQuerySearch(val, item)
					}
				},
				bkgAgentSupplierId: {
					key: 'bkgAgentSupplierId',
					label: '订舱代理',
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
				polPortCode: {
					key: 'polPortCode',
					label: '起运港',
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
				transitPortCode: {
					label: '中转港',
					key: 'transitPortCode',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					visibleChange: (val, item) => {
						this.portSearch('', 'port_of_basic', this.state, 'transitPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_basic', this.state, 'transitPortCode', item)
					}
				},
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
				destinationArea: { key: 'destinationArea', label: '最终目的地', type: 'input', searchType: 'like', value: '' },
				deliveryPlace: { key: 'deliveryPlace', label: '交货地', type: 'input', searchType: 'like', value: '' },
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
				carrierLineName: { key: 'carrierLineName', label: '承运人航线', type: 'input', searchType: 'like', value: '' },
				bargeVessel: {
					key: 'bargeVessel',
					label: '驳船船名',
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
				bargeVoyage: {
					key: 'bargeVoyage',
					label: '驳船航次',
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
				bkgEmployeeName: { label: '订舱处理人姓名', key: 'bkgEmployeeName', type: 'input', searchType: 'like', value: '' },
				auditEmployeeId: {
					key: 'auditEmployeeId',
					label: '商务',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getEmployeeName('pricing', '', item)
					},
					filterMehod: (val, item) => {
						this.getEmployeeName('pricing', val, item)
					}
				},
				orgAuditEmployeeId: {
					key: 'orgAuditEmployeeId',
					label: '原单审核人',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getEmployeeName('pricing', '', item)
					},
					filterMehod: (val, item) => {
						this.getEmployeeName('pricing', val, item)
					}
				},
				launchEmployeeName: { label: '发起人姓名', key: 'launchEmployeeName', type: 'input', searchType: 'like', value: '' },
				obdEmployeeName: { label: 'obd姓名', key: 'obdEmployeeName', type: 'input', searchType: 'like', value: '' },
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
						this.getEmployeeName('bd', '', item)
					},
					filterMehod: (val, item) => {
						this.getEmployeeName('bd', val, item)
					}
				},
				opEmployeeId: {
					key: 'opEmployeeId',
					label: '操作',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getEmployeeName('op', '', item)
					},
					filterMehod: (val, item) => {
						this.getEmployeeName('op', val, item)
					}
				},
				cargoCname: { label: '中文品名', key: 'cargoCname', type: 'input', searchType: 'like', value: '', maxlength: '1024' },
				cargoEname: { label: '英文品名', key: 'cargoEname', type: 'input', searchType: 'like', value: '', maxlength: '1024' },
				createdTime: { label: '创建日期', key: 'createdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				auditTime: { label: '审核时间', key: 'auditTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				bargeCyCutOff: { label: '驳船截关时间', key: 'bargeCyCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				cyCutOff: { label: '大船截关时间', key: 'cyCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				bargeEtdTime: { label: '驳船预计开船时间', key: 'bargeEtdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				etdTime: { label: '大船预计开船时间', key: 'etdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				bkgBookedTime: { label: '已订舱时间', key: 'bkgBookedTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				isExternal: {
					label: '是否外配',
					key: 'isExternal',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [
						{ label: '是', value: 'y' },
						{ label: '否', value: 'n' }
					],
					nonDictionary: true
				},
				isOnline: {
					label: '是否线上',
					key: 'isOnline',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [
						{ label: '是', value: 'Y' },
						{ label: '否', value: 'N' }
					],
					nonDictionary: true
				},
				bdDeptCode: {
					specialProp:'deptCode',
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
          },
				},
				bizDate: {
					label: '业务日期',
					key: 'bizDate',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
			},
			// 默认展示的搜索条件，搜索条件分类
			searchInputGroup: [...defaultSearchInputGroup],
			searchConfig: [],
			tableQuery: {}
		}
	},
	activated() {
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
		this.islLoop = window.localStorage.getItem('order-bookShip-isLoopRequire') === 'true' ? true : false
	},
	deactivated() {
		window.removeEventListener('keydown', this.handleKeyDown)
		clearInterval(this.intervalTimer)
		this.intervalTimer = null
	},
	created() {
		this.setRoles()
		this.init()
		this.getDeptList()
		this.islLoop = window.localStorage.getItem('order-bookShip-isLoopRequire') === 'true' ? true : false
	},
	mounted() {},
	computed: {
		...mapState('user', ['userId']),
		...mapState({
			dictMap: state => state.dict.dictMap,
			defaultColumns: state => state.book.bookList.defaultColumns,
			specialColumns: state => state.book.bookList.specialColumns,
			roles: state => state.user.roles,
			currRole: state => state.book.currRole
		}),
		component() {
			return this.activeName === 'order' ? BookList : ZcList
		}
	},
	watch: {
		islLoop(newVal) {
			window.localStorage.setItem('order-bookShip-isLoopRequire', newVal)
			if (newVal) {
				// 启动定时器
				if (this.roles.includes('pricing') || this.roles.includes('bkg')) {
					this.intervalTimer = setInterval(() => {
						this.getList(true)
					}, 10000)
				}
			} else {
				// 关闭定时器
				clearInterval(this.intervalTimer)
				this.intervalTimer = null
			}
		}
	},
	components: {
		Search,
		AddFilter,
		BookList,
		ZcList
	},
	methods: {
		// 所属部门下拉框
		getDeptList() {
			departmentTreeList({ state: 'valid' }).then(res => {
				this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
				this.$set(this.filterGroups, 'bdDeptCode', {
					specialProp:'deptCode',
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
					},
				})
			})
		},
		// 转化children的空数组为undefined
		getTreeData(data) {
			data.forEach(item => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
			return data
		},
		handleChangeRole(val) {
			this.$store.dispatch('book/setBookRole', val)
			this.$refs[this.activeName].init()
			this.$refs.search.getSearchConditionInfo(true)
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
		handleClick(val) {
		},
		// 设置当前角色
		setRoles() {
			if (this.roles.includes('pricing')) {
				this.$store.dispatch('book/setBookRole', 'pricing')
			} else if (this.roles.includes('bkg')) {
				this.$store.dispatch('book/setBookRole', 'bkg')
			}
		},
		init() {
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})
			// 默认展示全部tab
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
		},
		// 增加一条搜索条件
		handleAddFilter() {
			this.searchInputGroup.push({
				key: '',
				value: '',
				category: 'all',
				queryValue: ''
			})
			// console.log('新增一条：', this.searchInputGroup)
		},
		// 获取员工name
		getEmployeeName(roleCode, val, item) {
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : ''
			}
			if (roleCode) data.roleCode = roleCode
			baseEmployeeListName(data).then(res => {
				// item.data = res.data.filter(item => item.status === 'on').map(item => {
				// 	return Object.assign({}, item, {
				// 		label: this.$language === 'en' ? item.ename : item.cname,
				// 		value: item.employeeId ? Number(item.employeeId) : ''
				// 	})
				// })
				let filterArr = res.data.filter(ele => !item.saveList.find(o => o.value === ele.employeeId))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: this.$language === 'en' ? ele.ename : ele.cname, value: ele.employeeId ? Number(ele.employeeId) : '' }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		// 获取bd员工name
		getEmployeeBdName(roleCode, val, item) {
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : ''
			}
			if (roleCode) data.roleCode = roleCode
			baseEmployeeListName(data).then(res => {
				let list = res.data.map(item => {
					return {
						...item,
						label: this.$language === 'en' ? item.ename : item.cname,
						value: this.$language === 'en' ? item.ename : item.cname
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
				let filterArr = newArr.filter(ele => !item.saveList.find(o => o.value === ele.cname))
				item.data = [...item.saveList, ...filterArr]
			})
		},
		// 获取订舱代理
		getSupplierList(type, queryString, item) {
			this.$store.dispatch('dict/queryBkgAgentSupplierList', { category: 'category', value: 'bkg_carrier,bkg_agent', queryString: queryString, categoryType: 'in' }).then(data => {
				let filterArr = data.list.filter(ele => !item.saveList.find(o => o.value === ele.supplierId))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: this.$language == 'en' ? ele.ename : ele.name, value: ele.supplierId ? Number(ele.supplierId) : '' }
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
		// 船公司下拉列表自动补充的数据
		shipCarrierQuerySearch(queryString, item) {
			this.$store.dispatch('dict/baseShippingCarrierList', { name: queryString, state: 'valid' }).then(data => {
				this.searchSelectVisibleData(data, item)
			})
		},
		// 远程搜索港口下拉数据
		portSearch(queryString, portAttribute, state, type, item) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				this.searchSelectVisibleData(data, item)
			})
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
		// 列表数据
		async getList(isLoop) {
			this.$refs[this.activeName].getList(isLoop)
		},
		// 查询组件回调
		async searchCallBack(action, param) {
			if (action === 'Search') {
				this.$refs[this.activeName].handleSearch(this.searchInputGroup, this.filterGroups)
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
				this.$refs[this.activeName].handleRefresh()
			}
		},
		handleSearchValueReset() {
			this.searchInputGroup.map(item => {
				item.value = ''
				return { ...item }
			})
		}
	}
}
</script>
<style lang="scss">
#bookShip {
	.book-role-cont {
		padding-left: 8px;
	}
	.book-role-cont .el-button {
		height: 20px;
		padding: 0 8px;
		margin-bottom: 4px;
	}
	.book-role-cont .el-button.active {
		color: #3e80f5;
		border-color: #3e80f5;
	}
	.bookShip-tabs {
		background: #fff;
		.el-tabs__header {
			margin-bottom: 10px;
		}
		.el-tabs__item {
			line-height: 24px;
			height: 24px;
		}
		.el-tabs__nav-wrap::after {
			z-index: 0;
		}
	}
}
.order-loop-switch {
	position: absolute;
	right: 20px;
	top: 8px;
	z-index: 10;
}
</style>
