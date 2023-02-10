<template>
	<div class="app-container">
		<div class="rail-toggle-btn" v-if="roles.filter(item => ['bd', 'obd', 'asst', 'pricing', 'op', 'bkg','epricing','ecs'].includes(item)).length > 1">
			<span :class="curRole === 'bd' ? 'rail-active' : ''" v-if="roles.some(item => ['bd', 'obd', 'asst'].includes(item))" type="default" size="mini" @click="handleChangeRole('bd')"> 业务视角 </span>
			<span :class="curRole === 'pricing' ? 'rail-active' : ''" v-if="roles.includes('pricing')" type="default" size="mini" @click="handleChangeRole('pricing')"> 商务视角 </span>
			<span :class="curRole === 'bkg' ? 'rail-active' : ''" v-if="roles.includes('bkg')" type="default" size="mini" @click="handleChangeRole('bkg')"> bkg视角 </span>
			<span :class="curRole === 'op' ? 'rail-active' : ''" v-if="roles.includes('op')" type="default" size="mini" @click="handleChangeRole('op')"> 操作视角 </span>
			<span :class="curRole === 'ecs' ? 'rail-active' : ''" v-if="roles.includes('op')" type="default" size="mini" @click="handleChangeRole('ecs')"> 海外客服视角 </span>
			<span :class="curRole === 'epricing' ? 'rail-active' : ''" v-if="roles.includes('op')" type="default" size="mini" @click="handleChangeRole('epricing')"> 海外商务视角 </span>
		</div>
		<div class="search-container">
			<Search ref="search" fixedCreatedTime :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
				<AddFilter
					fixedCreatedTime
					:searchInputGroup="searchInputGroup"
					:allFilterGroups="allFilterGroups"
					:filterGroups="filterGroups"
					:defaultSearchLength="defaultSearchLength"
					:callback="searchCallBack"
					:index="index"
					:item="item"
					v-for="(item, index) in showSearchInputGroup"
					:key="'filter' + index"
				/>
				<!-- <i class="el-icon-circle-plus-outline icon-search-plus" @click="handleAddFilter"></i> -->
				<div class="btn-plus-search" @click="handleAddFilter" ref="btnPlus"></div>
			</Search>
		</div>
		<div class="table-container show-refuse-row-tabel" :class="['cancel', 'close', 'complete'].includes(tableQuery.orderStatus) ? 'init-table-container' : ''" ref="tableCont">
			<TableFilter :curRole="curRole" :islLoop="islLoop" :config="tableConfig" :tableQuery.sync="tableQuery" :callback="tableCallBack" @changeIsLoop="changeIsLoop"/>
			<BaseTableMuti :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" v-loading="loading" />
		</div>
		<!-- 自定义表头 -->
		<div v-if="customColumnsPopShow">
			<CustomColumns :columnsBase="tableConfig.allColumns" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
		</div>
		<!-- 新建弹窗 -->
		<div v-if="createOrderPopShow">
			<CreateOrder @close="createOrderPopClose" />
		</div>
		<!-- 取消订单弹窗 -->
		<div v-if="cancelOrderPopShow">
			<CancelOrder @close="cancelOrderPopClose" :orderNo="orderNo" />
		</div>
		<!-- 备注弹窗 -->
		<div v-if="bdRemarkPopShow">
			<BdRemarkPop :bdRemarkParam="bdRemarkParam" @close="bdRemarkPopClose" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
// import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
import BaseDialog from '@/components/Base/Dialog/index'
import CustomColumns from '@/components/customColumns/index'
import CreateOrder from './components/createOrder'
import CancelOrder from './components/cancelOrder'
import BdRemarkPop from './components/bdRemarkPop'
import ColumnTip from '@/views/railway/order/components/columnTip.vue'
import { baseEmployeeListName, baseBusinessList, searchConditionInfo, searchConditionSave, searchConditionDelete, citySelectList, columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
import { orderList, orderCreate, orderListExport, orderNotifyRelease, orderCopy, orderClose, orderDelete, bdDropCheck, getValueByKey, mainRemarkUpdate } from '@/api/railway/list'
import { orderCancelCancel } from '@/api/order/list'
import { getDictLabel } from '@/utils/tools'
import { customerListAllStatusNew } from '@/api/crm/supplier'
import { departmentTreeList } from '@/api/companyResource'
import { getParamMethod } from '@/utils/allKindNumber'
import { formatDate } from '@/utils/index'
import CustNameShow from '@/views/order/order/components/custNameShow.vue'
const end = new Date()
const start = new Date()
let defaulTime = []
start.setTime(start.getTime() - 3600 * 1000 * 24 * 89)
defaulTime[0] = formatDate(start)
defaulTime[1] = formatDate(end)
const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: ['createdTime'],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	orderStatus: 'all', // 订单状态，默认展示未审核
	scenesCode: 'RailwayOrderList'
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
		key: 'polPortCode',
		value: '',
		placeholder: '起运站',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'podPortCode',
		value: '',
		placeholder: '目的站',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'bizDate',
		value: '',
		placeholder: '业务日期',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'etdTime',
		value: '',
		placeholder: '预计发车时间',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'custid',
		value: '',
		placeholder: '委托单位',
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
		key: 'createdTime',
		value: defaulTime,
		placeholder: '订单创建时间',
		category: 'all',
		queryValue: ''
	}
]

export default {
	// mixins: [routerMixin],
	data() {
		return {
			islLoop: false,
			intervalTimer: null,
			departmentList: [],
			oldParams: {},
			curRole: '',
			specialColumns: {
				porPortCode: ['porPortCode', 'porPortName'],
				polPortCode: ['polPortCode', 'polPortName'],
				podPortCode: ['podPortCode', 'podPortName']
			},
			defaultColumns: [
				'orderNo',
				'cancelExecTime',
				'hscode',
				'cname',
				'ename',
				'bdServiceMode',
				'isOpHandle',
				'totalWeight',
				'totalVolume',
				'bdEmployeeName',
				'pricingEmployeeName',
				'opEmployeeName',
				'orderStatus',
				'bkgStatus',
				'custid',
				'custName',
				'bdRemark',
				'intrustRemark',
				'auditRemark',
				'bkgRemark',
				'prefinCloseStatus',
				'finCloseStatus',
				'businessType',
				'createdTime',
				'bizDate',
				'po',
				'inNo',
				'serviceType',
				'bkgAgentSupplierName',
				'porPortCode',
				'polPortCode',
				'podPortCode',
				'finalPodPortCode',
				'isSelf',
				'lclStatus',
				'fclOrderNo',
				'vesselVoyage',
				'inCutOffTime',
				'sysLineName',
				'containerInfo',
				'cn',
				'sn',
				'blType',
				'hbl',
				'receiveFeeCleanStatus',
				'payFeeCleanStatus',
				'receiveFeeConfirmStatus',
				'payFeeConfirmStatus',
				'payFeeApplyStatus',
				'receiveInvoiceStatus',
				'tradeTermsCode',
				'transportTerm',
				'etdTime',
				'tdTime',
				'outboundPortCode',
				'cargoReadyTime',
				'custClass'
			],
			isSameCode: false,
			cTimestamp: 0,
			loading: false,
			state: '',

			businessTypeOptions: [],
			serviceTypeOptions: {},
			orderNo: '',
			searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 0, // 默认显示搜索框的个数
			allFilterGroups: {
				all: this.filterGroups
			},
			selectDate: '',
			// 查询条件下拉选项
			filterGroups: {
				universalNo: { key: 'universalNo', label: '各类编号', type: 'input', searchType: 'eq', value: '' },
				orderNo: { key: 'orderNo', label: '工作号', type: 'input', searchType: 'like', value: '' },
				custClass: {
          key: 'custClass',
          label: '客户类型',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.dict.dictMap.customerClassNew,
          nonDictionary: true
        },
				exportOrderNo: { key: 'exportOrderNo', label: '出口单号', type: 'input', searchType: 'like', value: '' },
				custIntrustNo: { key: 'custIntrustNo', label: '客户委托号', type: 'input', searchType: 'like', value: '' },
				po: { key: 'po', label: 'PO号', type: 'input', searchType: 'like', value: '' },
				inNo: { key: 'inNo', label: '入仓编号', type: 'input', searchType: 'like', value: '' },
				hbl: { key: 'hbl', label: '提单号', type: 'input', searchType: 'like', value: '' },
				auditTime: { label: '审核时间', key: 'auditTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				cancelExecTime: {
					label: '取消/终止/关闭时间',
					key: 'cancelExecTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
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
				isOpHandle: {
					label: '操作处理状态',
					key: 'isOpHandle',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [
						{ label: '未处理', value: 'n' },
						{ label: '处理中', value: 'y' },
						{ label: '已完成', value: 'complete' }
					],
					nonDictionary: true
				},
				bdServiceMode: {
					label: '新旧模式',
					key: 'bdServiceMode',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true
				},
				orderStatus: {
					label: '订单状态',
					key: 'orderStatus',
					type: 'select',
					searchType: 'in',
					value: '',
					data: [],
					multiple: true,
					saveList: [],
					'collapse-tags': true,
					queryValue: '',
					nonDictionary: true,
					disabledEdit: true,
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
				obdEmployeeName: {
					key: 'obdEmployeeName',
					label: '销售助理',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					// 'allow-create': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'obd')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'obd')
					}
				},
				asstEmployeeName: {
					key: 'asstEmployeeName',
					label: '下单助理',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					// 'allow-create': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'asst')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'asst')
					}
				},
				opEmployeeName: {
					key: 'opEmployeeName',
					label: '操作',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					// 'allow-create': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'op')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'op')
					}
				},
				pricingEmployeeName: {
					key: 'pricingEmployeeName',
					label: '商务',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'pricing')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'pricing')
					}
				},
				polPortCode: {
					key: 'polPortCode',
					label: '起运站',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, item)
					},
					change: (val, item) => {
						let findItem = item.data.find(ele => ele.value === val)
						Object.assign(item, {
							queryValue: val,
							text: findItem ? findItem.label : ''
						})
					}
				},
				podPortCode: {
					key: 'podPortCode',
					label: '目的站',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, item)
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
					label: '收货地',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, item)
					},
					change: (val, item) => {
						let findItem = item.data.find(ele => ele.value === val)
						Object.assign(item, {
							queryValue: val,
							text: findItem ? findItem.label : ''
						})
					}
				},
				finalPodPortCode: {
					key: 'finalPodPortCode',
					label: '最终目的站',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, item)
					},
					change: (val, item) => {
						let findItem = item.data.find(ele => ele.value === val)
						Object.assign(item, {
							queryValue: val,
							text: findItem ? findItem.label : ''
						})
					}
				},
				bizDate: { label: '业务日期', key: 'bizDate', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				etdTime: { label: '预计发车时间', key: 'etdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				tdTime: { label: '实际发车时间', key: 'tdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				cargoReadyTime: { label: '货好时间', key: 'cargoReadyTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
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
				receiveFeeCleanStatus: {
					key: 'receiveFeeCleanStatus',
					label: '应收费用结清状态',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: store.state.dict.dictMap.feeSettleStatus,
					nonDictionary: true
				},
				payFeeCleanStatus: {
					key: 'payFeeCleanStatus',
					label: '应付费用结清状态',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: store.state.dict.dictMap.feeSettleStatus,
					nonDictionary: true
				},
				receiveFeeConfirmStatus: {
					key: 'receiveFeeConfirmStatus',
					label: '应收确认状态',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: this.$store.state.dict.dictMap.feeConfirmStatus,
					nonDictionary: true
				},
				payFeeConfirmStatus: {
					key: 'payFeeConfirmStatus',
					label: '应付确认状态',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: this.$store.state.dict.dictMap.feeConfirmStatus,
					nonDictionary: true
				},
				bkgStatus: { label: '订舱状态', key: 'bkgStatus', propInDict: 'railBkgStatus', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				intrustRemark: { key: 'intrustRemark', label: '委托备注', type: 'input', searchType: 'like', value: '' },
				auditRemark: { key: 'auditRemark', label: '商务备注', type: 'input', searchType: 'like', value: '' },
				bkgRemark: { key: 'bkgRemark', label: '订舱备注', type: 'input', searchType: 'like', value: '' },
				prefinCloseStatus: { label: '预关账状态', key: 'prefinCloseStatus', type: 'select', searchType: 'eq', value: '', data: this.$store.state.railway.orderList.finCloseStatus, nonDictionary: true },
				finCloseStatus: { label: '关账状态', key: 'finCloseStatus', type: 'select', searchType: 'eq', value: '', data: this.$store.state.railway.orderList.finCloseStatus, nonDictionary: true },
				businessType: {
					label: '业务类型',
					key: 'businessType',
					propInDict: 'railBusinessType',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true
				},
				createdTime: {
					label: '订单创建时间',
					key: 'createdTime',
					type: 'date',
					searchType: 'eq',
					category: 'daterange',
					value: '',
					'default-value': defaulTime,
					format: 'yyyy-MM-dd',
					clearable: false,
					pickerOptions: {
						// 设置不能选择的日期
						onPick: ({ maxDate, minDate }) => {
							this.selectDate = minDate.getTime()
							if (maxDate) {
								this.selectDate = ''
							}
						},
						disabledDate: time => {
							// 1年365天的时间戳
							let two = 365 * 24 * 3600 * 1000
							// 是否限制的判断条件
							if (this.selectDate) {
								return time > new Date(this.selectDate + two) || time < new Date(this.selectDate - two)
							} else {
								return false
							}
						},
						shortcuts: [
							{
								text: '最近三天',
								onClick(picker) {
									const end = new Date()
									const start = new Date()
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 2)
									picker.$emit('pick', [start, end])
								}
							},
							{
								text: '最近一周',
								onClick(picker) {
									const end = new Date()
									const start = new Date()
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 6)
									picker.$emit('pick', [start, end])
								}
							},
							{
								text: '最近一个月',
								onClick(picker) {
									const end = new Date()
									const start = new Date()
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 29)
									picker.$emit('pick', [start, end])
								}
							},
							{
								text: '最近两个月',
								onClick(picker) {
									const end = new Date()
									const start = new Date()
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 59)
									picker.$emit('pick', [start, end])
								}
							},
							{
								text: '最近三个月',
								onClick(picker) {
									const end = new Date()
									const start = new Date()
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 89)
									picker.$emit('pick', [start, end])
								}
							},
							{
								text: '最近半年',
								onClick(picker) {
									const end = new Date()
									const start = new Date()
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 179)
									picker.$emit('pick', [start, end])
								}
							},
							{
								text: '最近一年',
								onClick(picker) {
									const end = new Date()
									const start = new Date()
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 364)
									picker.$emit('pick', [start, end])
								}
							},
							{
								text: '今年',
								onClick(picker) {
									const end = new Date()
									const start = new Date(end.getFullYear() + '-01-01')
									picker.$emit('pick', [start, end])
								}
							}
						]
					}
				},

				serviceType: { label: '服务类型', key: 'serviceType', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				bkgAgentSupplierId: {
					key: 'bkgAgentSupplierId',
					label: '订舱代理',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getSupplierList('bkg_agent', '', item)
					},
					filterMehod: (val, item) => {
						this.getSupplierList('bkg_agent', val, item)
					}
				},
				isSelf: {
					key: 'isSelf',
					label: '是否自拼',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [
						{ label: '是', value: 'y' },
						{ label: '否', value: 'n' }
					],
					nonDictionary: true
				},
				blType: { key: 'blType', label: '提单类型', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true }
			},
			// 默认展示的搜索条件，搜索条件分类
			searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),
			searchConfig: [],

			tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
			// table复选框多选的值
			selectedCheckbox: [],
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
					mutiSelect: true,
					// 多选框状态判断 {false不可选, true可选}
					checkSelectable({ orderNo }) {
						return orderNo ? true : false
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
				allColumns: [
					{
						label: '工作号',
						key: 'orderNo',
						prop: 'orderNo',
						width: '200',
						disabled: false,
						type: 'text',
						align: 'right',
						popoverComponent: ColumnTip,
						method: row => {
							this.handleOrderNoInfo(row)
						}
					},
					{
						label: '出口单号',
						key: 'exportOrderNo',
						prop: 'exportOrderNo',
						width: '180',
						minWidth: '180',
						disabled: false,
						type: 'text',
						align: 'left'
					},
					{ label: '取消/终止/关闭时间', key: 'cancelExecTime', prop: 'cancelExecTime', width: '150', disabled: false },
					{ label: '客户委托号', key: 'custIntrustNo', prop: 'custIntrustNo', disabled: false, width: '150' },
					{ label: 'HS CODE', key: 'hscode', prop: 'hscode', disabled: false, width: '150' },
					{ label: '中文品名', key: 'cname', prop: 'cname', disabled: false, width: '150' },
					{ label: '英文品名', key: 'ename', prop: 'ename', disabled: false, width: '150' },
					{ label: '审核时间', key: 'auditTime', prop: 'auditTime', sortable: 'custom', width: '150' },
					{
						label: '新旧模式',
						key: 'bdServiceMode',
						prop: 'bdServiceMode',
						disabled: false,
						width: '80',
						formatter: (row, column) => {
							return getDictLabel('bdServiceMode', row.bdServiceMode)
						}
					},
					{
						label: '操作处理状态',
						key: 'isOpHandle',
						prop: 'isOpHandle',
						disabled: false,
						width: '80',
						formatter: (row, column) => {
							let str = ''
							str = row.isOpHandle === 'complete' ? '已完成' : row.isOpHandle === 'y' ? '处理中' : '未处理'
							return `<span class="isOpHandle-${row.isOpHandle}">${str}</span>`
						}
					},
					{ label: '预计/订舱毛重', key: 'totalWeight', prop: 'totalWeight', disabled: false, width: '120' },
					{ label: '预计/订舱体积', key: 'totalVolume', prop: 'totalVolume', disabled: false, width: '120' },
					{ label: '销售', key: 'bdEmployeeName', prop: 'bdEmployeeName', disabled: false, width: '120' },
					{ label: '销售部门', key: 'bdDeptName', prop: 'bdDeptName', disabled: false, width: '100' },
					{ label: '商务', key: 'pricingEmployeeName', prop: 'pricingEmployeeName', disabled: false, width: '120' },
					{ label: '商务部门', key: 'pricingDeptName', prop: 'pricingDeptName', disabled: false, width: '100' },
					{ label: '操作', key: 'opEmployeeName', prop: 'opEmployeeName', disabled: false, width: '120' },
					{ label: '操作部门', key: 'opDeptName', prop: 'opDeptName', disabled: false, width: '100' },
					{
						label: '销售助理',
						key: 'obdEmployeeName',
						prop: 'obdEmployeeName',
						disabled: false,
						width: '80'
					},
					{ label: '销售助理部门', key: 'obdDeptName', prop: 'obdDeptName', disabled: false, width: '100' },
					{
						label: '下单助理',
						key: 'asstEmployeeName',
						prop: 'asstEmployeeName',
						disabled: false,
						width: '80'
					},
					{ label: '下单助理部门', key: 'asstDeptName', prop: 'asstDeptName', disabled: false, width: '100' },
					{
						label: '订单状态',
						key: 'orderStatus',
						prop: 'orderStatus',
						disabled: false,
						width: '80',
						formatter: (row, column) => {
							let result = getDictLabel('orderStatus', row.orderStatus)
							let color = ''
							// 操作中状态特殊处理
							// if (row.orderStatus === 'pass' && row.isOpHandle === 'y') {
							// 	result = '操作中'
							// }
							// 待审核
							if (['submit'].includes(row.orderStatus)) {
								color = 'yellow'
							}
							// 审核通过，已完成
							if (row.orderStatus === 'complete' || row.orderStatus === 'pass') {
								color = 'green'
							}
							//已拒绝，已取消，已终止
							if (['refuse', 'cancel', 'break'].includes(row.orderStatus)) {
								color = 'red'
							}
							return `<span class="${color}">${result}</span>`
						}
					},
					{
						label: '订舱状态',
						key: 'bkgStatus',
						prop: 'bkgStatus',
						disabled: false,
						width: '80',
						formatter: (row, column) => {
							let text = ''
							if (row.orderStatus != 'draft') {
								text = getDictLabel('railBkgStatus', row.bkgStatus) || '未订舱'
							}

							return text
						}
					},
					{ label: '委托单位', key: 'custName', prop: 'custName', popoverComponent: CustNameShow, disabled: false, width: '180' },

					{ label: '委托备注', key: 'intrustRemark', prop: 'intrustRemark', disabled: false, width: '150' },
					{ label: '商务备注', key: 'auditRemark', prop: 'auditRemark', disabled: false, width: '150' },
					{ label: '订舱备注', key: 'bkgRemark', prop: 'bkgRemark', disabled: false, width: '150' },
					{ label: '预关账时间', key: 'prefinCloseTime', prop: 'prefinCloseTime', sortable: 'custom', width: '150' },
					{ label: '关账时间', key: 'finCloseTime', prop: 'finCloseTime', sortable: 'custom', width: '150' },
					{
						label: '预关账状态',
						key: 'prefinCloseStatus',
						prop: 'prefinCloseStatus',
						width: '100',

						disabled: false,
						formatter: (row, column) => {
							return row.prefinCloseStatus === 'yes' ? '已关账' : '未关账'
						}
					},
					{
						label: '关账状态',
						key: 'finCloseStatus',
						prop: 'finCloseStatus',
						disabled: false,
						width: '80',
						formatter: (row, column) => {
							return row.finCloseStatus === 'yes' ? '已关账' : '未关账'
						}
					},

					{
						label: '业务类型',
						key: 'businessType',
						prop: 'businessType',
						disabled: false,
						width: '100',

						formatter: (row, column) => {
							return row.businessTypeCn
						}
					},
					{ label: '订单创建时间', key: 'createdTime', prop: 'createdTime', width: '150', disabled: false, sortable: 'custom' },
					{ label: '业务日期', key: 'bizDate', prop: 'bizDate', width: '100', disabled: false, sortable: 'custom' },
					{ label: 'PO号', key: 'po', prop: 'po', width: '100', disabled: false },
					{ label: '入仓编号', key: 'inNo', prop: 'inNo', width: '100', disabled: false },
					{
						label: '服务类型',
						key: 'serviceType',
						prop: 'serviceType',
						disabled: false,
						width: '150',
						formatter: (row, column) => {
							return row.serviceTypeName
						}
					},
					{ label: '订舱代理', width: '150', key: 'bkgAgentSupplierName', prop: 'bkgAgentSupplierName', disabled: false },
					{
						label: '收货地',
						key: 'porPortCode',
						prop: 'porPortCode',
						disabled: false,
						width: '150',
						formatter: (row, column) => {
							return row.porPortName
						}
					},
					{
						label: '起运站',
						key: 'polPortCode',
						prop: 'polPortCode',
						width: '150',
						disabled: false,
						formatter: (row, column) => {
							return row.polPortName
						}
					},
					{
						label: '目的站',
						key: 'podPortCode',
						prop: 'podPortCode',
						width: '150',
						disabled: false,
						formatter: (row, column) => {
							return row.podPortName
						}
					},
					{
						label: '最终目的站',
						key: 'finalPodPortCode',
						prop: 'finalPodPortCode',
						width: '150',
						disabled: false,
						formatter: (row, column) => {
							return row.finalPodPortName
						}
					},
					{
						label: '是否自拼',
						key: 'isSelf',
						prop: 'isSelf',
						width: '150',
						disabled: false,
						formatter: (row, column) => {
							let text = ''
							if (row.businessType === 'rail_export_lcl') {
								text = row.isSelf === 'Y' ? '是' : '否'
							}
							return text
						}
					},
					{
						label: '拼箱状态',
						key: 'lclStatus',
						prop: 'lclStatus',
						width: '150',
						disabled: false,
						formatter: (row, column) => {
							return getDictLabel('lclStatus', row.lclStatus)
						}
					},
					{ label: '拼箱后的整柜单号', key: 'fclOrderNo', prop: 'fclOrderNo', width: '150', disabled: false },
					{ label: '班列/班次', key: 'vesselVoyage', prop: 'vesselVoyage', disabled: false, width: '150' },
					{ label: '截仓时间', key: 'inCutOffTime', prop: 'inCutOffTime', disabled: false, width: '150', sortable: 'custom' },
					{ label: '系统航线', key: 'sysLineName', prop: 'sysLineName', disabled: false, width: '150' },
					{ label: '箱型箱量', key: 'containerInfo', prop: 'containerInfo', disabled: false, width: '150' },
					{ label: '箱号', key: 'cn', prop: 'cn', disabled: false, width: '150' },
					{ label: '封号', key: 'sn', prop: 'sn', disabled: false, width: '150' },
					{
						label: '提单类型',
						key: 'blType',
						prop: 'blType',
						disabled: false,
						width: '150',
						formatter: (row, column) => {
							return getDictLabel('blType', row.blType)
						}
					},
					{ label: '提单号', key: 'hbl', prop: 'hbl', width: '150', disabled: false },
					{
						label: '应收费用结清状态',
						key: 'receiveFeeCleanStatus',
						prop: 'receiveFeeCleanStatus',
						disabled: false,
						width: '150',
						formatter: (row, column) => {
							return getDictLabel('feeSettleStatus', row.receiveFeeCleanStatus)
						}
					},
					{
						label: '应付费用结清状态',
						key: 'payFeeCleanStatus',
						prop: 'payFeeCleanStatus',
						disabled: false,
						width: '150',
						formatter: (row, column) => {
							return getDictLabel('feeSettleStatus', row.payFeeCleanStatus)
						}
					},
					{
						label: '应收确认状态',
						key: 'receiveFeeConfirmStatus',
						prop: 'receiveFeeConfirmStatus',
						disabled: false,
						width: '150',
						formatter: (row, column) => {
							return getDictLabel('feeConfirmStatus', row.receiveFeeConfirmStatus)
						}
					},
					{
						label: '应付确认状态',
						key: 'payFeeConfirmStatus',
						prop: 'payFeeConfirmStatus',
						disabled: false,
						width: '150',
						formatter: (row, column) => {
							return getDictLabel('feeConfirmStatus', row.payFeeConfirmStatus)
						}
					},
					{ label: '请款状态', key: 'payFeeApplyStatus', prop: 'payFeeApplyStatus', disabled: false, width: '150' },
					{ label: '应收发票状态', key: 'receiveInvoiceStatus', prop: 'receiveInvoiceStatus', disabled: false, width: '120' },
					{
						label: '贸易条款',
						key: 'tradeTermsCode',
						prop: 'tradeTermsCode',
						disabled: false,
						width: '150',
						formatter: (row, column) => {
							let term = getDictLabel('tradeTermsCode', row.tradeTermsCode)
							return term === 'DDP' ? 'DAP' : term
						}
					},
					{ label: '运输条款', key: 'transportTerm', prop: 'transportTerm', disabled: false, width: '150' },
					{ label: '预计发车时间', key: 'etdTime', prop: 'etdTime', disabled: false, width: '150', sortable: 'custom' },
					{ label: '实际发车时间', key: 'tdTime', prop: 'tdTime', disabled: false, width: '150', sortable: 'custom' },
					{
						label: '出境口岸',
						key: 'outboundPortCode',
						prop: 'outboundPortCode',
						width: '150',
						disabled: false,
						formatter: (row, column) => {
							return getDictLabel('railOutboundPort', row.outboundPortCode)
						}
					},
					{ label: '货好时间', key: 'cargoReadyTime', prop: 'cargoReadyTime', disabled: false, width: '150', sortable: 'custom' },
					{
						label: '客户类型',
						key: 'custClass',
						prop: 'custClass',
						disabled: false,
						width: '120',
						formatter: (row, column) => {
							if (row.custClass) {
								return getDictLabel('customerClass', row.custClass.toLowerCase())
							} else {
								return ''
							}
						}
					},
				],
				// 操作按钮组
				operationBtns: {
					minWidth: '150',
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
						if (action === 'Close') {
							this.handleClose(row)
						}
						if (action === 'Delete') {
							this.handleDelete(row)
						}
						if (action === 'CancelCancel') {
							this.handleCancelCancel(row)
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
								// 只有bd业务角色才有复制操作的权限
								if (this.isBd && ([row.bdEmployeeId * 1, row.obdEmployeeId * 1, row.asstEmployeeId * 1].includes(this.userId) || this.roles.includes('duty') || this.roles.includes('manager'))) {
									return true
								}
								return false
							},
							action: 'Copy'
						},
						{
							label: '取消',
							type: 'text',
							className: 'red',
							show: (item, row) => {
								// 只有业务bd才有取消操作的权限
								if (this.isBd && ([row.bdEmployeeId * 1, row.obdEmployeeId * 1, row.asstEmployeeId * 1].includes(this.userId) || this.roles.includes('duty') || this.roles.includes('manager'))) {
									/*
									 * 海运出口整箱委托订舱的订舱状态已放舱才可取消订单，并且已完成，已取消，已终止，已关闭的不用显示取消,已取消的不显示
									 * 海运出口整箱客户自定的订单审核通过的就可以取消，已取消的不显示
									 * 海运出口拼箱的订单状态为审核通过的显示取消,已取消的不显示
									 * v-if="createItem.rail.bkgStatus === 'BOOK_RELEASE' && createItem.orderStatus !== 'complete' && !copyState && createItem.main.cancelApplyStatus !== 'applied'"
									 */
									if (
										(row.cancelApplyStatus != 'applied' && row.businessType === 'rail_export_fcl' && row.bkgStatus === 'BOOK_RELEASE' && !['complete', 'break', 'cancel', 'close'].includes(row.orderStatus)) ||
										(row.cancelApplyStatus != 'applied' && row.businessType === 'rail_export_lcl' && row.orderStatus === 'pass' && row.bkgStatus === 'BOOK_RELEASE')
									) {
										return true
									}
									return false
								}
								return false
							},
							action: 'Cancel'
						},
						{
							label: '撤回取消',
							type: 'text',
							className: 'red',
							show: (item, row) => {
								// 只有业务bd才有取消操作的权限
								if (this.isBd && ([row.bdEmployeeId * 1, row.obdEmployeeId * 1, row.asstEmployeeId * 1].includes(this.userId) || this.roles.includes('duty') || this.roles.includes('manager'))) {
									if (row.cancelApplyStatus === 'applied' && row.orderStatus !== 'break' && row.orderStatus !== 'cancel') {
										return true
									}
									return false
								}
								return false
							},
							action: 'CancelCancel'
						},
						{
							label: '关闭',
							type: 'text',
							show: (item, row) => {
								if (this.isBd && ([row.bdEmployeeId * 1, row.obdEmployeeId * 1, row.asstEmployeeId * 1].includes(this.userId) || this.roles.includes('duty') || this.roles.includes('manager'))) {
									if (row.orderStatus === 'refuse') {
										return true
									}
									return false
								}
								return false
							},
							action: 'Close'
						},
						{
							label: '删除',
							type: 'text',
							className: 'red',
							show: (item, row) => {
								if (this.isBd && ([row.bdEmployeeId * 1, row.obdEmployeeId * 1, row.asstEmployeeId * 1].includes(this.userId) || this.roles.includes('duty') || this.roles.includes('manager'))) {
									if (row.orderStatus === 'draft') {
										return true
									}
									return false
								}
								return false
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
			// 新建订单弹窗
			createOrderPopShow: false,
			// 取消订单弹窗
			cancelOrderPopShow: false,
			resDefaConfList: [], // 后端配置的默认搜索模板
			bdRemarkPopShow: false,
			bdRemarkParam: {}
		}
	},
	beforeRouteLeave(to, from, next) {
		if (to.name === 'RailwayOrderDetail') {
			let views = this.$store.state.tagsView.visitedViews.filter(item => item.params.orderNo === to.params.orderNo)
			this.$store.commit('tagsView/DEL_SAMEORDER_VISITED_VIEW', views)
		}
		next()
	},
	activated() {
		// let timestamp = new Date().getTime()
		// if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
		// 	this.getList()
		// }
		// this.intervalTimer = setInterval(() => {
		// 	// this.getList(true)
		// }, 10000)
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
		this.islLoop = window.localStorage.getItem('railwayOrder-list-isLoopRequire') === 'true' ? true : false
		if (this.islLoop) {
      this.intervalTimer = setInterval(() => {
        this.getList(true)
      }, 10000)
    } else {
			clearInterval(this.intervalTimer)
			this.intervalTimer = null
		}
	},

	deactivated() {
		clearInterval(this.intervalTimer)
		this.intervalTimer = null
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	created() {
		this.cTimestamp = new Date().getTime()
		this.getDeptList()
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
		this.init()
		this.getBusinessType()
		this.islLoop = window.localStorage.getItem('railwayOrder-list-isLoopRequire') === 'true' ? true : false
	},

	mounted() {
		// 设置默认角色
		this.curRole = this.roles.filter(item => ['bd', 'prcing', 'bkg', 'op', 'ecs', 'eprcing'].includes(item))[0]
		if (this.roles.includes('bd') || this.roles.includes('obd') || this.roles.includes('asst')) {
			this.curRole = 'bd'
		}
		if (this.roles.includes('pricing')) {
			this.curRole = 'pricing'
		}
	},

	computed: {
		...mapState('railway', ['serviceList', 'orderList']),
		...mapState('user', ['deptCode']),
		...mapState({
			roles: state => state.user.roles,
			userId: state => state.user.userId,
			dictMap: state => state.dict.dictMap
		}),
		isEpricing() {
			return this.curRole === 'epricing'
		},
		isEcs() {
			return this.curRole === 'ecs'
		},
		isAc() {
			return this.roles.includes('ac')
		},
		isBkg() {
			return this.curRole === 'bkg'
		},
		isOp() {
			return this.curRole === 'op'
		},
		isBd() {
			return this.curRole === 'bd'
		},
		isPricing() {
			return this.curRole === 'pricing'
		},
		showSearchInputGroup() {
			let index = this.searchInputGroup.findIndex(item => item.key === 'createdTime')
			if (index !== -1) {
				this.searchInputGroup.push(this.searchInputGroup[index])
				this.searchInputGroup.splice(index, 1)
			}
			return this.searchInputGroup
		}
	},
	watch: {
		curRole: {
      handler: function (val) {
        if (val === 'bd') {
          delete this.filterGroups.bkgAgentSupplierId
          this.tableConfig.columns = this.tableConfig.columns.filter(
            (el) => el.key !== 'bkgAgentSupplierName'
          )
        } else {
					console.log(111111111111)
          this.tableConfig.columns.push({ label: '订舱代理', width: '150', key: 'bkgAgentSupplierName', prop: 'bkgAgentSupplierName', disabled: false })
          this.$set(this.filterGroups, 'bkgAgentSupplierId', {
            key: 'bkgAgentSupplierId',
						label: '订舱代理',
						type: 'remoteSelect',
						searchType: 'eq',
						value: '',
						data: [],
						saveList: [],
						nonDictionary: true,
						visibleChange: (val, item) => {
							this.getSupplierList('bkg_agent', '', item)
						},
						filterMehod: (val, item) => {
							this.getSupplierList('bkg_agent', val, item)
						}
          })
        }
      },
      immediate: true
    },
		islLoop: {
			handler(newVal) {
				if (newVal) {
					// 启动定时器
					this.intervalTimer = setInterval(() => {
						this.getList(true)
					}, 10000)
				} else {
					// 关闭定时器
					clearInterval(this.intervalTimer)
					this.intervalTimer = null
				}
			},
			deep: true,
			immediate: true
		}
	},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		TableFilter,
		BaseDialog,
		CustomColumns,
		CreateOrder,
		CancelOrder,
		BdRemarkPop
	},
	methods: {
		changeIsLoop(val) {
			this.islLoop = val
			window.localStorage.setItem('railwayOrder-list-isLoopRequire', val)
    },
		// 所属部门下拉框
		getDeptList() {
			departmentTreeList({ state: 'valid' }).then(res => {
				this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
			})
		},
		// 转化children的空数组为undefined
		getTreeData(data) {
			data.forEach(item => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
			return data
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
			customerListAllStatusNew(data).then(res => {
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
		// 撤回取消订单
		handleCancelCancel(row) {
			this.$confirm(`是否撤回取消订单?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					orderCancelCancel({ orderNo: row.orderNo }).then(res => {
						this.$message({
							type: 'success',
							message: '撤回成功',
							duration: 1000,
							onClose: () => {
								this.getList()
							}
						})
					})
				})
				.catch(() => {})
		},
		handleChangeRole(val) {
			this.curRole = val
			this.tableQuery.orderStatus = 'all'
			this.getList()
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

		// 装货地下拉
		receiptPlaceSearch(queryString, item) {
			citySelectList({
				countryCode: '',
				cityCode: queryString || '',
				state: 'valid'
			}).then(res => {
				item.data =
					res.data &&
					res.data.map(ele => {
						return Object.assign(ele, {
							label: this.$language === 'en' ? ele.ename : ele.cname,
							value: ele.cityCode
						})
					})
			})
		},
		// 获取业务类型
		getBusinessType() {
			let result = []
			baseBusinessList().then(res => {
				this.businessTypeOptions = res.data
				res.data.forEach(item => {
					if (item.business === 'rail' && item.serviceTypeList && item.serviceTypeList.length) {
						item.serviceTypeList.forEach(ele => {
							result.push({
								label: ele.businessType === 'rail_export_fcl' ? '铁路出口整箱-' + ele.name : '铁路出口拼箱-' + ele.name,
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
			})
		},

		init() {
			// 默认展示全部
			this.tableQuery.orderStatus = 'all'
			// 订单列表的“订单状态”搜索项，下拉显示订单的所有状态，不根据岗位视角区分 v20220517
			// if (this.isOp || this.isAc) {
			// 	this.filterGroups.orderStatus.propInDict = 'opOrderStatus'
			// }
			// if (this.isPricing) {
			// 	this.filterGroups.orderStatus.propInDict = 'pricingOrderStatus'
			// }
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})
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
		},

		// 远程搜索港口下拉数据
		portSearch(portName, item) {
			this.$store.dispatch('dict/baseRailPortList', { portName }).then(data => {
				let portList = data.map(ele => {
					return Object.assign(ele, {
						label: ele.label,
						value: ele.value
					})
				})
				item.data = portList
			})
		},

		// 获取订舱代理
		getSupplierList(type, queryString, item) {
			this.$store.dispatch('dict/queryBkgAgentSupplierListRail', { category: 'category', value: 'bkg_carrier,bkg_agent', queryString: queryString, categoryType: 'in' }).then(data => {
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
				if (window.event.target.id === 'bdRemark' || className.includes('el-pagination__editor')) return
				//触发的事件
				this.searchCallBack('Search')
			}
		},

		// 获取列表请求参数
		getListQuery() {
			// // console.log('🚀 ~ this.tableQuery.orderStatus', this.tableQuery.query)
			// this.tableQuery.query = this.tableQuery.query.filter(item => item.column !== 'orderStatus')
			let statusQuery = []
			// 全部tab过滤掉已取消状态的数据
			console.log(this.tableQuery.orderStatus)
			if (this.tableQuery.orderStatus === 'all') {
				// 业务
				if (this.isBd) {
					statusQuery = [{ column: 'orderStatus', type: 'in', value: 'draft,pre_submit,submit,pass,refuse,break,complete,cancel,close' }]
				}
				if (this.isBkg || this.isOp || this.isAc || this.isEpricing || this.isEcs) {
					statusQuery = [{ column: 'orderStatus', type: 'in', value: 'pass,break,complete,cancel,close' }]
				}
				if (this.isPricing) {
					statusQuery = [{ column: 'orderStatus', type: 'in', value: 'submit,pass,refuse,complete,cancel' }]
				}
			} else if (this.tableQuery.orderStatus === 'mine') {
				statusQuery = [{ column: 'employeeIdList', type: 'like', value: this.userId }]
				// 不含有bd,obd,asst的用户 在我的业务tab不显示草稿订单
				// if (this.roles.find(item => !['bd', 'obd', 'asst'].includes(item)))
				if (!this.roles.includes('bd') && !this.roles.includes('obd') && !this.roles.includes('asst')) {
					statusQuery = [
						{ column: 'employeeIdList', type: 'like', value: this.userId },
						{ column: 'orderStatus', type: 'in', value: 'submit,pass,complete,cancel,break' }
					]
				}
			} else if (this.tableQuery.orderStatus === 'submit') {
				statusQuery = [{ column: 'orderStatus', type: 'in', value: 'submit,pre_submit' }]
			} else if (this.tableQuery.orderStatus === 'pass') {
				statusQuery = [{ column: 'orderStatus', type: 'eq', value: 'pass' }]
			} else if (this.tableQuery.orderStatus === 'release') {
				statusQuery = [
					{ column: 'orderStatus', type: 'in', value: 'submit,pass,refuse,complete,cancel' },
					{ column: 'bkgStatus', type: 'eq', value: 'BOOK_RELEASE' }
				]
			} else if (this.tableQuery.orderStatus) {
				statusQuery = [{ column: 'orderStatus', type: 'eq', value: this.tableQuery.orderStatus }]
			}

			// 合并状态参数
			let data = {}

			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery)
			})

			delete data.orderStatus
			// 业务视角 如果不是管理者  只显示业务自己创建的单
			// if (!this.roles.includes('manager') && this.curRole === 'bd') {
			// 	data.query = [...data.query, { column: 'bdEmployeeId', type: 'eq', value: this.userId }]
			// }

			return data
		},

		// 列表数据
		async getList(isLoop) {
			if (!isLoop) this.loading = true
			let query = this.getListQuery()

			//处理逗号分割的多个订单号
			query.query.map(item => {
				if (['orderNo', 'so', 'hbl', 'inNo', 'po', 'exportOrderNo'].includes(item.column)) {
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s+]/)
						.filter(Boolean)
						.join('#')
				}
			})
			let { data } = await columnWidthConfigInfo({
				scenesCode: this.$route.name
			})
			let { columnWidthList } = data
			getParamMethod(this.$route.name, query).then(queryObj => {
				this.oldParams = queryObj
				orderList(queryObj)
					.then(response => {
						let { list, totalCount, pageSize, allColumns, configColumns } = response.data
						// 请求无数据显示的文案
						if (!list || !list.length) {
							this.$set(this.tableConfig, 'defaultEmpty', false)
						}
						list.forEach(item => {
							item.serviceTypeName = item.serviceType ? this.serviceTypeOptions[item.serviceType] : ''
							let findItem = this.businessTypeOptions.find(ele => ele.businessType === item.businessType)
							item.businessTypeCn = findItem ? findItem.name : ''
							if (item.orderStatus === 'cancel' && this.tableQuery.orderStatus === 'all') Object.assign(item, { orderIsCancel: true })
							if (item.orderStatus === 'close' && this.tableQuery.orderStatus === 'all') Object.assign(item, { orderIsClose: true })
							if (item.orderStatus === 'complete' && this.tableQuery.orderStatus === 'all') Object.assign(item, { orderIsFinish: true })
						})
						this.tableConfig.list = list
						this.tableQuery.pageSize = pageSize
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

						if(this.curRole === 'bd'){
              this.tableConfig.configColumns=this.tableConfig.configColumns.filter(el=>el!=='bkgAgentSupplierName')
            }
						this.handleFilterColumns(this.tableConfig.configColumns)
						// 设置列宽为服务器返回的新的列宽宽度
						// console.log('this.tableConfig.columns', this.tableConfig.columns)
						this.tableConfig.columns.map(item => {
							// 取服务器返回的宽度
							let findItem = columnWidthList.find(ele => ele.column === item.prop) || {}
							return Object.assign(item, { width: findItem.width || item.width })
						})
						this.tableColumnsWidthList = this.getTableColumnsWidth()

						console.log(this.tableColumnsWidthList)
						// this.getTableColumnWidthInfo()
						// this.fillPolName()
					})
					.finally(() => {
						this.loading = false
					})
			})
		},

		// 回显港口数据
		fillPolName() {},

		// 查询组件回调
		async searchCallBack(action, param, isFirstLoad) {
			let query = []
			// console.log('this.searchInputGroup', this.searchInputGroup)
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
									if(this.filterGroups[item.key].cascaderProps.multiple){
										let arr=[]
										if(item.value&&item.value.length){
											for(let i=0;i<item.value.length;i++){
												if(item.value[i]&&item.value[i].length){
													arr.push(item.value[i][item.value[i].length-1])
												}
											}
										}
										Object.assign(tempItem, {
											column: item.key,
											type: this.filterGroups[item.key].searchType || 'in',
											value: arr.length ? arr.toString() : ''
										})
									}else{
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
								} else if (
									// 特殊处理预关账状态，关账状态
									['prefinCloseStatus', 'finCloseStatus'].includes(item.key)
								) {
									// 选择未关账传值不等于yes
									if (item.value) {
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
								} else if (['isJoint'].includes(item.key)) {
									// 已协同=y
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
							query.push(tempItem)
						}
					})
					// 按orderStatus查询，特殊处理表格tab除了我的业务其他tab值为空，不按orderStatus查的默认值为all,显示全部tab
					if (this.searchInputGroup.some(ele => ele.key === 'orderStatus' && ele.value && ele.value.length && !['mine'].includes(this.tableQuery.orderStatus))) {
						this.tableQuery.orderStatus = ''
					} else if (!this.tableQuery.orderStatus) {
						this.tableQuery.orderStatus = 'all'
					} else {
					}
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
				if (this.searchInputGroup.some(item => item.key === 'createdTime')) {
					this.searchInputGroup.map(item => {
						if (item.key === 'createdTime') {
							if (!item.value) item.value = defaulTime
						}
					})
				} else {
					this.searchInputGroup.push({
						key: 'createdTime',
						value: defaulTime,
						placeholder: '订单创建时间',
						category: 'all',
						queryValue: ''
					})
				}
				// 设置默认订单状态搜索的值
        // this.setSearchOrderStatusValue(isFirstLoad)
			}
			// 刷新
			if (action === 'Refresh') {
				this.loading = true
				let { data } = await columnWidthConfigInfo({
					scenesCode: this.$route.name
				})
				let { columnWidthList } = data
				orderList(this.oldParams)
					.then(response => {
						let { list, totalCount, pageSize, allColumns, configColumns } = response.data
						list.forEach(item => {
							item.serviceTypeName = item.serviceType ? this.serviceTypeOptions[item.serviceType] : ''
							let findItem = this.businessTypeOptions.find(ele => ele.businessType === item.businessType)
							item.businessTypeCn = findItem ? findItem.name : ''
							if (item.orderStatus === 'cancel' && this.tableQuery.orderStatus === 'all') Object.assign(item, { orderIsCancel: true })
							if (item.orderStatus === 'close' && this.tableQuery.orderStatus === 'all') Object.assign(item, { orderIsClose: true })
							if (item.orderStatus === 'complete' && this.tableQuery.orderStatus === 'all') Object.assign(item, { orderIsFinish: true })
						})
						this.tableConfig.list = list
						this.tableQuery.pageSize = pageSize
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
						// this.fillPolName()
					})
					.finally(() => {
						this.loading = false
					})
			}
		},
		handleSearchValueReset() {
			this.searchInputGroup.map(item => {
				if (item.key !== 'createdTime') {
					item.value = ''
					return { ...item }
				}
			})
			// console.log('重置')
		},
		// 反显查询条件的订单状态
		getOrderStatusArr(arr) {
			return this.dictMap.orderStatus.filter(item => arr.includes(item.value)).map(item => ({label: item.label, value: item.value}))
		},
		// 搜索条件的订单状态的默认下拉选中值
		setSearchOrderStatusValue(isFirstLoad) {
      if (this.searchInputGroup.some(item => item.key === 'orderStatus')) {
				this.searchInputGroup.map(item => {
					if (item.key === 'orderStatus' && !['mine'].includes(this.tableQuery.orderStatus)) {
						item.value = []
					}
				})
			} 
			// else {
			// 	this.searchInputGroup.push({
			// 		key: 'orderStatus',
			// 		value: [],
			// 		placeholder: '订单状态',
			// 		category: 'all',
			// 		queryValue: '',
			// 		hideDel: true
			// 	})
			// }
			// if (isFirstLoad) {
			// 	this.searchInputGroup.map(item => {
			// 		if (item.key === 'orderStatus') {
			// 			if (this.tableQuery.orderStatus === 'all') {
			// 				if(this.isBd) {
			// 					item.value = ['draft','pre_submit','submit','pass','refuse','break','complete','cancel','close']
			// 				} else if (this.isBkg || this.isOp || this.isAc || this.isEpricing || this.isEcs) {
			// 					item.value = ['pass', 'complete', 'break', 'cancel', 'close']
			// 				} else if (this.isPricing) {
			// 					item.value = ['submit','pass','refuse','complete','cancel']
			// 				}
			// 			} 
			// 			// else if (this.tableQuery.orderStatus === 'mine') {
			// 			// 	if(!(
			// 			// 		this.roles.includes('bd') ||
			// 			// 		this.roles.includes('obd') ||
			// 			// 		this.roles.includes('asst')
			// 			// 	)) {
			// 			// 		item.value = ['submit','pass','complete','cancel','break']
			// 			// 	} else {
			// 			// 		item.value = ['draft','pre_submit','submit','pass','refuse','break','complete','cancel','close']
			// 			// 	}
			// 			// } else if (this.tableQuery.orderStatus === 'submit') {
			// 			// 	item.value = ['submit','pre_submit']
			// 			// } else if (this.tableQuery.orderStatus === 'pass,complete') {
			// 			// 	item.value = ['pass','complete']
			// 			// } else if (this.tableQuery.orderStatus === 'release') {
			// 			// 	item.value = ['submit','pass','refuse','complete','cancel']
			// 			// } else if (this.tableQuery.orderStatus) {
			// 			// 	item.value = [this.tableQuery.orderStatus]
			// 			// } 
			// 			this.filterGroups.orderStatus.saveList = this.getOrderStatusArr(item.value)
			// 		}
			// 	})
			// }
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

		// 关闭订单
		handleClose(row) {
			this.$confirm(`是否关闭此订单?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					orderClose({ orderNo: row.orderNo }).then(res => {
						this.$message({
							type: 'success',
							message: '关闭成功',
							duration: 1000,
							onClose: () => {
								this.getList()
							}
						})
					})
				})
				.catch(err => {
					console.log('err')
				})
		},

		// 删除订单
		handleDelete(row) {
			this.$confirm(`是否删除此订单?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					orderDelete({ orderNo: row.orderNo }).then(res => {
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
				})
				.catch(err => {
					console.log('err')
				})
		},

		// 导出
		handleExport() {
			let data = this.getListQuery()
			orderListExport({
				ascColumns: data.ascColumns,
				descColumns: data.descColumns,
				query: this.oldParams.query,
				scenesCode: 'RailwayOrderList'
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
			// 除我的业务tab以外。其他按tab查询，如果搜索条件已选了订单状态的可以直接忽略，直接按tab的状态查
      if (!['mine'].includes(this.tableQuery.orderStatus)) {
				this.tableQuery.query = this.tableQuery.query.filter(item => item.column !== 'orderStatus')
			}
			this.tableQuery.currPage = 1
			this.setSearchOrderStatusValue()
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
			if (val === 1) return (this.tableConfig.list = [])
			this.getList()
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
		handleOrderNoInfo(row) {
			this.handleInfo(row)
		},
		// 打开bdRemark弹窗
		handleClickBdRemark(row) {
			this.bdRemarkPopShow = true
			this.bdRemarkParam = {
				orderNo: row.orderNo,
				bdRemark: row.bdRemark
			}
		},
		bdRemarkPopClose(action, value) {
			this.bdRemarkPopShow = false
			if (action === 'Confirm') {
				this.handleSaveRemark(value)
			}
		},
		// 保存备注
		handleSaveRemark(value) {
			mainRemarkUpdate({
				orderNo: value.orderNo,
				orderData: value.bdRemark
			}).then(res => {
				this.$message({ type: 'success', message: '保存成功' })
				this.getList()
			})
		},
		// 去详情页
		async handleInfo(row) {
			let action = ''
			// 业务除草稿和拒绝状态都不可编辑
			if (this.isBd && !['draft', 'refuse'].includes(row.orderStatus)) {
				action = 'view'
			}
			// 操作角色非审核通过都不可编辑
			if (this.isOp && !['pass'].includes(row.orderStatus)) {
				action = 'view'
			}
			this.isJumpRouteFromPage = true
			let isSameCode = await this.$store.dispatch('railway/getValueByKeys', { custid: row.custid })
			let routeUrl = this.$router.resolve({
				name: 'RailwayOrderDetail',
				params: {
					orderNo: row.orderNo
				},
				query: {
					orderNo: row.orderNo,
					source: 'orderList',
					action: action,
					showBl: ['st07', 'st08'].includes(row.serviceType),
					showRelate: isSameCode && ['st07'].includes(row.serviceType) && (this.isPricing || this.isOp || this.isBkg)
				}
			})
			window.open(routeUrl.href, '_blank')
		},

		// 复制
		async handleCopy(row) {
			let isSameCode = await this.$store.dispatch('railway/getValueByKeys', { custid: row.custid })
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
					this.$message({
						message: '复制成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							this.isJumpRouteFromPage = true
							let routeUrl = this.$router.resolve({
								name: 'RailwayOrderDetail',
								params: {
									orderNo: row.orderNo
								},
								query: {
									orderNo: orderNo,
									source: 'orderList',
									action: 'copy',
									showBl: ['st07', 'st08'].includes(row.serviceType),
									showRelate: isSameCode && ['st07'].includes(row.serviceType) && (this.isPricing || this.isOp || this.isBkg)
								}
							})
							window.open(routeUrl.href, '_blank')
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
		},

		// 获取特殊处理的自定义表头，例：polCode,需要传polCode,polEname,polCname,podCode, podEname,podCname给后端
		getColumnsValues(value) {
			// 20211202 orderNo表头不固定在第一列
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

		// 新建订单保存
		handleCreateOrder(value) {
			orderCreate(value).then(res => {
				let { orderNo, serviceType } = res.data

				sessionStorage.setItem('createOrderStr', JSON.stringify(res.data))
				this.isJumpRouteFromPage = true
				let routeUrl = this.$router.resolve({
					name: 'RailwayOrderDetail',
					params: {
						orderNo
					},
					query: {
						orderNo,
						source: 'orderList',
						action: 'add',
						showBl: ['st07', 'st08'].includes(serviceType),
						showRelate: ['st07'].includes(serviceType) && (this.isPricing || this.isOp || this.isBkg)
					}
				})
				window.open(routeUrl.href, '_blank')
			})
		},

		// 新建订单关闭回调
		createOrderPopClose(action, value) {
			this.createOrderPopShow = false
			if (action === 'Confirm') {
				this.handleCreateOrder(value)
			}
		},

		// 取消订单关闭回调
		cancelOrderPopClose(action, value) {
			this.cancelOrderPopShow = false
			if (action === 'Confirm') {
				this.getList()
			}
		}
	}
}
</script>
<style lang="scss">
.rail-toggle-btn {
	margin: 10px 0;
	span {
		border: 1px solid #dcdfe6;
		padding: 1px 8px;
		margin-right: 6px;
		border-radius: 3px;
		cursor: pointer;
	}
	.rail-active {
		color: #3e80f5;
		border-color: #3e80f5;
	}
}
</style>
