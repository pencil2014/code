<template>
	<div class="app-container">
		<RoleSwitch @callback="initQuery" />
		<div class="search-container">
			<Search ref="search"  fixedCreatedTime :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
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
		<div class="table-container show-refuse-row-tabel" :class="['cancel', 'break', 'close', 'complete'].includes(tableQuery.orderStatus) ? 'init-table-container' : ''" ref="tableCont">
			<TableFilter @dropCheck="dropCheck" :config="tableConfig" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
			<BaseTableMuti :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" v-loading="loading" />
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
			<CancelOrder @close="cancelOrderPopClose" :orderNo="orderNo" :isBd="isBd" :isOp="isOp" />
		</div>
		<!-- 备注弹窗 -->
		<div v-if="bdRemarkPopShow">
			<BdRemarkPop :bdRemarkParam="bdRemarkParam" @close="bdRemarkPopClose" />
		</div>
		<!-- 批量修改弹窗 -->
		<div v-if="dateModifyPopShow">
			<DateModifyPop @close="dateModifyPopClose" :selectedCheckbox="selectedCheckbox" />
		</div>
	</div>
</template>
<script>
// import Vue from 'vue'
import store from '@/store'
import { mapMutations, mapState } from 'vuex'
import { getRoleLabel, getDictLabel } from '@/utils/tools'
// import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
import RoleSwitch from './components/roleSwitch'
// 弹出框
import BaseDialog from '@/components/Base/Dialog/index'
import CustomColumns from '@/components/customColumns/index'
import CreateOrder from './components/createOrder'
import CancelOrder from './components/cancelOrder'
import BdRemarkPop from './components/bdRemarkPop'
import DateModifyPop from './components/orderDateModifyPop'
import { baseEmployeeListName, baseBusinessList, searchConditionInfo, searchConditionSave, searchConditionDelete, citySelectList, columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
import { orderList, orderCreate, orderListExport, orderNotifyRelease, orderCopy, orderClose, orderDelete, bdDropCheck, dropList, getValueByKey, mainRemarkUpdate, orderCancelCancel, orderRelationList, batchEdit } from '@/api/order/list'
import { customerListAllStatus } from '@/api/crm/supplier'
import { getParamMethod } from '@/utils/allKindNumber'
import {departmentTreeList} from '@/api/companyResource'
import { formatDate, unique } from '@/utils/index'
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
	orderStatus: 'all' // 订单状态，默认展示未审核
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
		key: 'orderNo',
		value: '',
		placeholder: '工作号',
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
			dateModifyPopShow: false,
			departmentList:[],
			oldParams: {},
			// isSameCode: false,
			cTimestamp: 0,
			loading: false,
			state: '',
			showVal: null,
			defaultStyle: {
				width: '100%'
			},
			orderNo: '',
			// searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 0, // 默认显示搜索框的个数
			allFilterGroups: {
				all: this.filterGroups
			},
			selectDate: '',
			// 查询条件下拉选项
			filterGroups: {
				universalNo: { key: 'universalNo', label: '各类编号', type: 'input', searchType: 'in', value: '', showValue: '' },
				orderNo: { key: 'orderNo', label: '工作号', type: 'input', searchType: 'like', value: '' },
				exportOrderNo: { key: 'exportOrderNo', label: '出口单号', type: 'input', searchType: 'like', value: '' },
				whPoNo: { key: 'whPoNo', label: '入舱单号', type: 'input', searchType: 'like', value: '' },
				so: { key: 'so', label: 'SO号', type: 'input', searchType: 'like', value: '' },
				cn: { key: 'cn', label: '柜号', type: 'input', searchType: 'like', value: '' },
				custClass: {
          key: 'custClass',
          label: '客户类型',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.dict.dictMap.customerClassNew,
          nonDictionary: true
        },
				// hbl: { key: 'hbl', label: 'HBL', type: 'input', searchType: 'like', value: '' },
				// mbl: { key: 'mbl', label: 'MBL', type: 'input', searchType: 'like', value: '' },
				// bdEmployeeName: { key: 'bdEmployeeName', label: '销售员', type: 'input', searchType: 'like', value: '' },
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
					'allow-create': true,
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
					'allow-create': true,
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
					'allow-create': true,
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
				bkgEmployeeName: {
					key: 'bkgEmployeeName',
					label: '订舱',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'bkg')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'bkg')
					}
				},
				ecsEmployeeName: {
          key: 'ecsEmployeeName',
          label: '海外客服',
          type: 'remoteSelect',
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getMulEmployeeName('', item, 'ecs')
          },
          filterMehod: (val, item) => {
            this.getMulEmployeeName(val, item, 'ecs')
          }
        },
				epricingEmployeeName: {
          key: 'epricingEmployeeName',
          label: '海外商务',
          type: 'remoteSelect',
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getMulEmployeeName('', item, 'epricing')
          },
          filterMehod: (val, item) => {
            this.getMulEmployeeName(val, item, 'epricing')
          }
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
				auditTime: { label: '审核时间', key: 'auditTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
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
				cscEmployeeName: {
					key: 'cscEmployeeName',
					label: '单证',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'csc')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'csc')
					}
				},
				rcEmployeeName: {
					key: 'rcEmployeeName',
					label: '放货',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
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
				acEmployeeName: {
					key: 'acEmployeeName',
					label: '应收',
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
				eacEmployeeName: {
					key: 'eacEmployeeName',
					label: '海外应收',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'eac')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'eac')
					}
				},
				lineCsEmployeeName: {
					key: 'lineCsEmployeeName',
					label: '航线客服',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'line_cs')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'line_cs')
					}
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
					// propInDict: 'orderStatus'
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
				isTrack: {
					label: '航程跟踪',
					key: 'isTrack',
					type: 'select',
					searchType: 'eq',
					propInDict: 'yesOrNoOptions',
					data: [],
					value: '',
					nonDictionary: true
				},
				bkgStatus: { label: '整箱订舱状态', key: 'bkgStatus', type: 'select', searchType: 'in', multiple: true, data: [], saveList: [], 'collapse-tags': true, queryValue: '', value: '', nonDictionary: true },
				issueStatusStr: { label: '放舱给客户状态', key: 'issueStatusStr', type: 'select', searchType: 'eq',  data: [
					{ label: '未放舱', value: '未放舱'},
					{ label: '已放舱', value: '已放舱'},
				],  value: '', nonDictionary: true },
				whBookStatus: { label: '拼箱订舱状态', key: 'whBookStatus', type: 'select', searchType: 'in', multiple: true, data: [], saveList: [], 'collapse-tags': true, queryValue: '', value: '', nonDictionary: true },
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
				shipRefNo: { key: 'shipRefNo', label: '船东参考号', type: 'input', searchType: 'like', value: '' },
				custIntrustNo: { key: 'custIntrustNo', label: '客户委托号', type: 'input', searchType: 'like', value: '' },
				intrustRemark: { key: 'intrustRemark', label: '委托备注', type: 'input', searchType: 'like', value: '' },
				auditRemark: { key: 'auditRemark', label: '商务备注', type: 'input', searchType: 'like', value: '' },
				bkgRemark: { key: 'bkgRemark', label: '订舱备注', type: 'input', searchType: 'like', value: '' },
				priceType: { label: '拿价类型', key: 'priceType', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
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
					data: store.state.dict.dictMap.feeConfirmStatus,
					nonDictionary: true
				},
				payFeeConfirmStatus: {
					key: 'payFeeConfirmStatus',
					label: '应付确认状态',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: store.state.dict.dictMap.feeConfirmStatus,
					nonDictionary: true
				},
				prefinCloseStatus: { label: '预关账状态', key: 'prefinCloseStatus', type: 'select', searchType: 'eq', value: '', data: store.state.order.orderList.finCloseStatus, nonDictionary: true },
				finCloseStatus: { label: '关账状态', key: 'finCloseStatus', type: 'select', searchType: 'eq', value: '', data: store.state.order.orderList.finCloseStatus, nonDictionary: true },
				prefinCloseTime: { label: '预关账时间', key: 'prefinCloseTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				finCloseTime: { label: '关账时间', key: 'finCloseTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				openDate: { label: '开仓/港时间', key: 'openDate', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				transitEtdDate: { label: '中转港1预计开船时间', key: 'transitEtdDate', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				transitTdDate: { label: '中转港1实际开船时间', key: 'transitTdDate', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				transitEtdDate1: { label: '中转港2预计开船时间', key: 'transitEtdDate1', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				transitTdDate1: { label: '中转港2实际开船时间', key: 'transitTdDate1', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				transitEtdDate2: { label: '中转港3预计开船时间', key: 'transitEtdDate2', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				transitTdDate2: { label: '中转港3实际开船时间', key: 'transitTdDate2', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				taTime: { label: '实际到港时间', key: 'taTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				podTakeDate: { label: '目的港提货时间', key: 'podTakeDate', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				podReturnDate: { label: '目的港还柜时间', key: 'podReturnDate', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				businessType: { label: '业务类型', key: 'businessType', propInDict: 'shipBusinessType', type: 'select', searchType: 'in', multiple: true, data: [], saveList: [], 'collapse-tags': true, queryValue: '', value: '', nonDictionary: true },
				serviceType: { label: '服务类型', key: 'serviceType', type: 'select', searchType: 'in', multiple: true, data: [], saveList: [], 'collapse-tags': true, queryValue: '', value: '', nonDictionary: true, propInDict: 'shipServiceType' },
				cargoCname: { key: 'cargoCname', label: '中文品名', type: 'input', searchType: 'like', value: '' },
				blNo: { key: 'blNo', label: '提单号', type: 'input', searchType: 'like', value: '' },
				blType: { key: 'blType', label: '提单类型', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				isJoint: {
					key: 'isJoint',
					label: '协同状态',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [
						{ label: '已协同', value: 'y' },
						{ label: '未协同', value: 'n' }
					],
					nonDictionary: true
				},
				// jointNo: {key: 'jointNo', label: '协同单号', type: 'input', searchType: 'eq', value: ''},
				bkgFinishTime: { label: 'BKG放舱时间', key: 'bkgFinishTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				createdTime: { label: '订单创建时间', key: 'createdTime', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd','default-value': defaulTime,
				  pickerOptions: {
						// 设置不能选择的日期
						onPick: ({maxDate, minDate}) => {
							this.selectDate = minDate.getTime()
							if (maxDate) {
								this.selectDate = ''
							}
						},
						disabledDate: (time) => {
							// 1年365天的时间戳
							let two = 365*24*3600*1000
							// 是否限制的判断条件
							if (this.selectDate) {
								return time > (new Date(this.selectDate + two)) || time < (new Date(this.selectDate - two))
							} else {
								return false
							}
						},
						shortcuts: [
							{
								text: '最近三天',
								onClick(picker) {
										const end = new Date();
										const start = new Date();
										start.setTime(start.getTime() - 3600 * 1000 * 24 * 2);
										picker.$emit('pick', [start, end]);
									}
							},
							{
								text: '最近一周',
								onClick(picker) {
										const end = new Date();
										const start = new Date();
										start.setTime(start.getTime() - 3600 * 1000 * 24 * 6);
										picker.$emit('pick', [start, end]);
									}
							},
							{
								text: '最近一个月',
								onClick(picker) {
									const end = new Date();
									const start = new Date();
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 29);
									picker.$emit('pick', [start, end]);
								}
							}, 
							{
								text: '最近两个月',
								onClick(picker) {
									const end = new Date();
									const start = new Date();
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 59);
									picker.$emit('pick', [start, end]);
								}
							},
							{
								text: '最近三个月',
								onClick(picker) {
									const end = new Date();
									const start = new Date();
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 89);
									picker.$emit('pick', [start, end]);
							  }
						  },
							{
								text: '最近半年',
								onClick(picker) {
									const end = new Date();
									const start = new Date();
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 179);
									picker.$emit('pick', [start, end]);
							  }
						  },
							{
								text: '最近一年',
								onClick(picker) {
									const end = new Date();
									const start = new Date();
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 364);
									picker.$emit('pick', [start, end]);
							  }
						  },
							{
								text: '今年',
								onClick(picker) {
									const end = new Date();
                  const start = new Date(end.getFullYear() + '-01-01')
									picker.$emit('pick', [start, end]);
							  }
						  }
						]
					} 
				},
				createdBy: {
					key: 'createdBy',
					label: '创建人',
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
				bizDate: { label: '业务日期', key: 'bizDate', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
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
				transitPortCode: {
					label: '中转港',
					key: 'transitPortCode',
					type: 'remoteSelect',
					searchType: 'in',
					value: '',
					multiple: true,
					'collapse-tags': true,
					data: [],
					saveList: [],
					visibleChange: (val, item) => {
						this.portSearch('', 'port_of_basic', this.state, 'transitPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_basic', this.state, 'transitPortCode', item)
					}
				},
				receiptPlace: {
					key: 'receiptPlace',
					label: '装货地',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.receiptPlaceSearch('', item)
					},
					filterMehod: (val, item) => {
						this.receiptPlaceSearch(val, item)
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
				destinationArea: { key: 'destinationArea', label: '最终目的地', type: 'input', searchType: 'like', value: '' },
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
				payMode: { key: 'payMode', label: '付款方式', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				shipperName: {
					key: 'shipperName',
					label: '发货单位',
					type: 'remoteSelect',
					searchType: 'like',
					// multiple: true,
					// 'collapse-tags': true,
					'allow-create': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getShipperName('', item)
					},
					filterMehod: (val, item) => {
						this.getShipperName(val, item)
					}
				},
				serviceCode: { key: 'serviceCode', label: '服务项', type: 'select', searchType: 'like', value: '', filterable: true, data: [], nonDictionary: true, propInDict: 'orderServiceNameList', saveList: [] },
				bargeCyCutOff: { label: '驳船截关时间', key: 'bargeCyCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				cyCutOff: { label: '大船截关时间', key: 'cyCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				bargeEtdTime: { label: '驳船预计开船时间', key: 'bargeEtdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				etdTime: { label: '大船预计开船时间', key: 'etdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				bargeTdTime: { label: '驳船实际开船时间', key: 'bargeTdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				tdTime: { label: '大船实际开船时间', key: 'tdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				carrierLineName: { key: 'carrierLineName', label: '承运人航线', type: 'input', searchType: 'like', value: '' },
				siCutOff: { label: '截补料时间', key: 'siCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				vgmCutOff: { label: '截VGM时间', key: 'vgmCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				etWhCyCutOff: { label: '预计截仓时间', key: 'etWhCyCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				whCyCutOff: { label: '实际截仓时间', key: 'whCyCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				etaTime: { label: '预计到港时间', key: 'etaTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' }
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
				allColumns: store.state.order.orderList.columnsBase(this.handleOrderNoInfo, this.handleClickBdRemark, this.handleSaveRemark),
				// 操作按钮组
				operationBtns: {
					// 宽度设为180，因为已拒绝状态会同时存在4个按钮：详情，复制，撤回取消，关闭
					minWidth: '180',
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
								if (this.isBd) {
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
								if (this.isBd) {
									/*
									 * 海运出口整箱委托订舱、进口整箱委托订舱的审核通过的订舱状态已放舱才可取消订单，并且已完成，已取消，已终止，已关闭的不用显示取消,已取消的不显示
									 * 海运出口整箱客户自定的订单审核通过的就可以取消，已取消的不显示
									 * 海运出口拼箱、进口拼箱的订单状态为审核通过的显示取消,已取消的不显示
									 * 散杂滚装的审核通过的订舱状态为已放舱，放舱给客户的显示取消
									 */
									if (
										(['st24', 'st25'].includes(row.serviceType) && ['book_release', 'release_custom'].includes(row.bkgStatus) && row.orderStatus === 'pass' && row.isCancelApply != '1') ||
										(['st01', 'st15', 'st09'].includes(row.serviceType) && row.bkgStatus === 'book_release' && row.orderStatus === 'pass' && row.isCancelApply != '1') ||
										(['st02', 'st16', 'st17', 'st10'].includes(row.serviceType) && row.orderStatus === 'pass' && row.isCancelApply != '1') ||
										(['ship_export_lcl', 'ship_import_lcl'].includes(row.businessType) && row.orderStatus === 'pass' && row.isCancelApply != '1')
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
								if (this.isBd) {
									if (row.isCancelApply === '1' && row.orderStatus !== 'break' && row.orderStatus !== 'cancel') {
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
								if (this.isBd) {
									// if (row.orderStatus === 'refuse') {
									// 	return true
									// }
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
								if (this.isBd) {
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
					totalTxt: '',
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
			bdRemarkParam: {},
			onlyShowYMDParam: ['podTakeDate']
		}
	},
	beforeRouteLeave(to, from, next) {
		if (to.name === 'OrderDetail') {
			let views = this.$store.state.tagsView.visitedViews.filter(item => item.params.orderNo === to.params.orderNo)
			// console.log('views', views)
			this.$store.commit('tagsView/DEL_SAMEORDER_VISITED_VIEW', views)
		}
		// console.log(to)
		next()
	},
	activated() {
		// let timestamp = new Date().getTime()
		// if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
		// 	this.getList()
		// }
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},

	deactivated() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	created() {
		// this.cTimestamp = new Date().getTime()
		this.getDeptList()
    
		this.setCurrRole()
		this.init()
		// this.getList()
	},
	mounted() {
		// this.getDeptCode()

		console.log('🚀 ~ this.dictMap.serviceType', this.dictMap)
	},

	computed: {
		...mapState('order', ['serviceList', 'orderList']),
		...mapState('user', ['deptCode', 'userId']),
		...mapState({
			currRole: state => state.order.currRole,
			roles: state => state.user.roles,
			roleCodesOptions: state => state.order.orderList.roleCodesOptions,
			allEditRoleArr: state => state.order.orderList.allEditRoleArr,
			dictMap: state => state.dict.dictMap,
			orderList: state => state.order.orderList,
			defaultColumns: state => state.order.orderList.defaultColumns,
			specialColumns: state => state.order.orderList.specialColumns,
			columnsBase: state => state.order.orderList.columnsBase()
		}),
		isEpricing() {
			return this.currRole === 'epricing'
		},
		isEcs() {
			return this.currRole === 'ecs'
		},
		isRc() {
			return this.currRole === 'rc'
		},
		isAc() {
			return this.currRole === 'ac'
		},
		isDoc() {
			return this.currRole === 'doc'
		},
		isOp() {
			return this.currRole === 'op'
		},
		isLineCs() {
			return this.currRole === 'line_cs'
		},
		isOpTruck() {
			return this.currRole === 'op_truck'
		},
		isCsc() {
			return this.currRole === 'csc'
		},
		isBd() {
			return this.currRole === 'bd' || this.currRole === 'obd' || this.currRole === 'asst'
		},
		isBkg() {
			return this.currRole === 'bkg'
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
		currRole: {
      handler: function (val) {
        if (val === 'bd') {
          delete this.filterGroups.bkgAgentSupplierId
          this.tableConfig.columns = this.tableConfig.columns.filter(
            (el) => el.key !== 'bkgAgentSupplierName'
          )
        } else {
          this.tableConfig.columns =
            store.state.order.orderList.columnsBase(this.handleOrderNoInfo, this.handleClickBdRemark, this.handleSaveRemark)
          this.$set(this.filterGroups, 'bkgAgentSupplierId', {
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
          })
        }
      },
      immediate: true
    },
	},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		TableFilter,
		RoleSwitch,
		BaseDialog,
		CustomColumns,
		CreateOrder,
		CancelOrder,
		BdRemarkPop,
		DateModifyPop
	},
	methods: {
		...mapMutations('order', ['setDropBdCheckStatus', 'setDropOpStatus', 'setIsSoUpdate']),
		// 批量修改
		handleModify() {
			if (!this.selectedCheckbox.length) {
				return this.$message.warning('请选择订单')
			}
			if (this.selectedCheckbox.some(item => item.orderStatus !== 'pass')) {
				return this.$message.warning('请选择审核通过的订单')
			}
			let resultList =unique(this.selectedCheckbox,'serviceType')
			if(resultList.length>1){
				return this.$message.warning('相同业务类型+相同服务类型 的订单，才多选一起来批量修改')
			}
			this.dateModifyPopShow = true
		},
		dateModifyPopClose(action, value) {
			if (action === 'Confirm') {
				let orderNoList=[]
				for(let i=0;i<this.selectedCheckbox.length;i++){
          orderNoList.push(this.selectedCheckbox[i].orderNo)
        }
				let params={
					orderNoList: orderNoList
				}
				if(value.vessel){
					params.vessel=value.vessel
				}
				if(value.voyage){
					params.voyage =value.voyage
				}
				if(value.etdTime){
					params.etdTime=value.etdTime
				}
				if(value.tdTime){
					params.tdTime=value.tdTime
				}
				if(value.cyCutOff){
					params.cyCutOff=value.cyCutOff
				}
				if(value.etaTime){
					params.etaTime=value.etaTime
				}
				batchEdit(params).then(res=>{
					this.$message.success('修改成功')
					this.getList()
					this.dateModifyPopShow = false
				})
			}else{
				this.dateModifyPopShow = false
			}
		},
		// 所属部门下拉框
    getDeptList() {
      departmentTreeList({ state: 'valid' }).then((res) => {
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
      data.forEach((item) => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
      return data
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
		getMulEmployeeName(val, item, role) {
			// console.log('item.saveList', item.saveList)
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
					let newWidth = findItem ? Math.min(findItem.width, item.minWidth) : ''
					return Object.assign(item, { width: newWidth || item.width })
				})
				this.tableColumnsWidthList = this.getTableColumnsWidth()
				// console.log('this.tableColumnsWidthList', this.tableColumnsWidthList)
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
		dropCheck(val) {
			if (this.selectedCheckbox.length != 1) {
				return this.$message.warning('请选择一条数据!')
			}
			let data = { orderNo: this.selectedCheckbox[0].orderNo, bdCheckStatus: val }
			bdDropCheck(data).then(res => {
				this.$message.success('指示发送成功!')
			})
		},

		// 登录用户角色currRole不是bd,op,doc,ac的，在此设置拥有订单权限的默认角色
		setCurrRole() {
			// 登录用户过滤掉非订单权限的角色
			let userEditRoles = this.roles.filter(item => this.allEditRoleArr.includes(item))
			// console.log('userEditRoles', userEditRoles)
			let currRole = userEditRoles.some(ele => ['bd', 'obd', 'asst'].includes(ele))
				? 'bd'
				: userEditRoles.some(ele => ['op', 'line_cs', 'op_truck', 'op_customs', 'op_wh'].includes(ele))
				? 'op'
				: userEditRoles.includes('doc') 
				? 'doc'
				: userEditRoles.some(ele => ['ac', 'eac'].includes(ele))
				? 'ac'
				: userEditRoles.includes('csc') 
				? 'csc'
				: userEditRoles.includes('bkg') 
				? 'bkg'
				: userEditRoles.includes('epricing') 
				? 'epricing'
				: userEditRoles.includes('ecs') 
				? 'ecs'
				: userEditRoles.includes('rc') 
				? 'rc'
				: ''
			this.$store.dispatch('order/setCurrRole', currRole)
		},
		async initQuery() {
			this.tableQuery.currPage = 1
			this.tableQuery.query = []
			this.init()
			this.$refs.search.getSearchConditionInfo(true)
			// this.searchCallBack('Search')
			// this.getList()
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

		init() {
			// 默认展示全部
			this.tableQuery.orderStatus = 'all'
			// if (this.isOp || this.isDoc || this.isAc || this.isRc || this.isOpTruck || this.isCsc) {
			// 	this.filterGroups.orderStatus.propInDict = 'opOrderStatus'
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
		portSearch(queryString, portAttribute, state, type, item) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				this.searchSelectVisibleData(data, item)
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
		// 获取发货单位
		getShipperName(queryString, item) {
			this.$store.dispatch('dict/queryCustomerList', queryString).then(data => {
				let list = data.list.map(ele => {
					return {
						...ele,
						label: this.$language === 'en' ? ele.ename : ele.name,
						value: this.$language === 'en' ? ele.ename : ele.name
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
		// enter按键事件
		handleKeyDown(e) {
			let key = null
			if (window.event === undefined) {
				key = e.keyCode
			} else {
				key = window.event.keyCode
			}
			if (key === 13) {
				// console.log(window.event.target)
				// 阻止分页的页码enter键触发全局的监听事件
				let className = window.event.target.parentNode.className
				if (window.event.target.id === 'bdRemark' || className.includes('el-pagination__editor')) return
				//触发的事件
				this.searchCallBack('Search')
			}
		},

		// 获取列表请求参数
		getListQuery() {
			let statusQuery = []
			let queryArr = JSON.parse(JSON.stringify(this.tableQuery.query))
			// 全部tab过滤掉已取消状态的数据
			if (this.tableQuery.orderStatus === 'all') {
				statusQuery = [{ column: 'orderStatus', type: 'in', value: 'draft,pre_submit,submit,pass,refuse,break,complete,cancel,close' }]
				// statusQuery = [{ column: 'orderStatus', type: 'in', value: 'submit,draft,pass,refuse,complete' }]
				if (this.isOp || this.isDoc || this.isAc || this.isRc || this.isOpTruck || this.isLineCs || this.isEpricing || this.isEcs || this.isBkg || this.isCsc) {
					statusQuery = [{ column: 'orderStatus', type: 'in', value: 'pass,break,complete,cancel,close' }]
				}
			} else if (this.tableQuery.orderStatus === 'mine') {
				statusQuery = [{ column: 'employeeIdList', type: 'like', value: this.userId }]
				// 不含有bd,obd,asst的用户在我的业务tab不显示草稿订单
				if (this.isOp || this.isDoc || this.isAc || this.isRc || this.isOpTruck || this.isLineCs || this.isEpricing || this.isEcs || this.isBkg || this.isCsc) {
					statusQuery = [
						{ column: 'employeeIdList', type: 'like', value: this.userId },
						{ column: 'orderStatus', type: 'in', value: 'submit,pass,complete,cancel,break' }
					]
				}
			} else if (this.tableQuery.orderStatus === 'pass') {
				statusQuery = [{ column: 'orderStatus', type: 'eq', value: 'pass' }]
			} else if (this.tableQuery.orderStatus === 'drop') {
				statusQuery = [
					{ column: 'dropBdCheckStatus', type: 'in', value: 'AGREE,AGREE_NOTIFY' },
					{ column: 'dropOpStatus', type: 'eq', value: '' }
				]
			} else if (this.tableQuery.orderStatus === 'dropped') {
				statusQuery = [{ column: 'isDrop', type: 'eq', value: 'Y' }]
			} else if (this.tableQuery.orderStatus==='submit') {
       statusQuery = [
          { column: 'orderStatus', type: 'in', value: 'submit,pre_submit' }
        ]
      } else if (this.tableQuery.orderStatus) {
				statusQuery = [{ column: 'orderStatus', type: 'eq', value: this.tableQuery.orderStatus }]
			} else {
			}

			// 合并状态参数
			let data = {}
			// console.log('tableQuery', this.tableQuery)

			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery)
			})
			delete data.orderStatus

			return data
		},
		// 列表数据
		async getList() {
			this.loading = true
			let query = this.getListQuery()

			//处理逗号分割的多个订单号
			query.query.map(item => {
				if (['orderNo', 'so', 'blNo', 'cn', 'carrierLineName', 'whPoNo', 'exportOrderNo'].includes(item.column)) {
					// item.type = item.column === 'so' || item.column === 'blNo' ? 'like' : 'in'
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s]/)
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
					list.forEach(item => {
						item.serviceTypeName = getDictLabel('shipServiceType', item.serviceType)
						item.businessTypeCn = getDictLabel('shipBusinessType', item.businessType)
						if (item.orderStatus === 'cancel' && this.tableQuery.orderStatus === 'all') Object.assign(item, { orderIsCancel: true })
						if (item.orderStatus === 'close' && this.tableQuery.orderStatus === 'all') Object.assign(item, { orderIsClose: true })
						if (item.orderStatus === 'complete' && this.tableQuery.orderStatus === 'all') Object.assign(item, { orderIsFinish: true })
					})
					this.tableConfig.list = list
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
					this.tableConfig.configColumns.push('isCancelApply', 'isNotify', 'isChange')
					this.tableConfig.configColumns = new Set(this.tableConfig.configColumns)
					this.tableConfig.configColumns = Array.from(this.tableConfig.configColumns)

					if(this.currRole === 'bd'){
              this.tableConfig.configColumns=this.tableConfig.configColumns.filter(el=>el!=='bkgAgentSupplierName')
            }
						
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
			})
		},

		// 回显港口数据
		fillPolName() {},

		// 查询组件回调
		async searchCallBack(action, param, isFirstLoad) {
			let query = []
			console.log('this.searchInputGroup', this.searchInputGroup)
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
                        value: item.value[0] + (this.onlyShowYMDParam.includes(item.key) ? '' : ' 00:00:00')
                      })
                    }
									}
									if (item.value && item.value[1]) query.push({ column: item.key, type: 'le', value: item.value[1] + (this.onlyShowYMDParam.includes(item.key) ? '' : ' 23:59:59') })
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
								} else if (['serviceCode'].includes(item.key)) {
									Object.assign(tempItem, {
										column: item.key,
										type: 'like',
										value: item.value ? `,${item.value},` : ''
									})
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
				// console.log('this.searchInputGroup-update', this.searchInputGroup);
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
							item.serviceTypeName = getDictLabel('shipServiceType', item.serviceType)
							item.businessTypeCn = getDictLabel('shipBusinessType', item.businessType)
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
			// 					if (!item.value.length) item.value = ['draft','pre_submit','submit','pass','refuse','break','complete','cancel','close']
			// 				} else if (this.isOp || this.isDoc || this.isAc || this.isRc || this.isOpTruck || this.isLineCs || this.isEpricing || this.isEcs || this.isBkg || this.isCsc) {
			// 					if (!item.value.length) item.value = ['pass','break','complete','cancel','close']
			// 				}
			// 			} 
			// 			// else if (this.tableQuery.orderStatus === 'mine') {
			// 			// 	if(this.isBd) {
			// 			// 		item.value = ['draft','pre_submit','submit','pass','refuse','break','complete','cancel','close']
			// 			// 	} else if (this.isOp || this.isDoc || this.isAc || this.isRc || this.isOpTruck || this.isLineCs || this.isEpricing || this.isEcs || this.isBkg || this.isCsc) {
			// 			// 		item.value = ['submit','pass','complete','cancel','break']
			// 			// 	}
			// 			// } else if (this.tableQuery.orderStatus === 'submit') {
			// 			// 	item.value = ['submit','pre_submit']
			// 			// } else if (this.tableQuery.orderStatus === 'dropped') {
			// 			// 	item.value = ['pass','break','complete']
			// 			// } else if (this.tableQuery.orderStatus === 'drop') {
			// 			// 	item.value = ['pass','break','complete']
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
				query: this.oldParams.query
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
			let txt = 'T量合计：'
			let total = 0
			arr.map(item => {
				total += Number(item.amountT)
			})
			txt = txt + total
			this.$set(this.tableConfig.tips, 'totalTxt', txt)
			// console.log('txt:', txt)
		},

		handleSizeChange() {
			this.getList()
		},

		handleCurrentChange(val) {
			// console.log('default', val)
			// 20220221 默认不请求列表
			if (val === 1) {
				return (this.tableConfig.list = [])
			}
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
			// console.log('row', value);
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
			if (this.isOp && !['pass','break'].includes(row.orderStatus)) {
				action = 'view'
			}
			this.isJumpRouteFromPage = true
			let isSameCode = await this.$store.dispatch('order/getValueByKeys', { custid: row.custid })
			let {data} = await orderRelationList({ orderNo: row.orderNo })
			console.log('isSameCode', isSameCode, data)
			let routeUrl = this.$router.resolve({
				name: 'OrderDetail',
				params: {
					orderNo: row.orderNo
				},
				query: {
					orderNo: row.orderNo,
					source: 'orderList',
					action: action,
					showContainer: !['ship_export_lcl', 'ship_import_lcl', 'ship_oversea_wh', 'ship_bulk_ro'].includes(row.businessType), // 业务类型：拼箱,海外仓，散杂滚装的不显示集装箱tab
					showBl: ['st01', 'st15', 'st03', 'st18', 'st09', 'st10', 'st11', 'st12', 'st24', 'st25', 'st02', 'st04'].includes(row.serviceType),
					showRelate: (isSameCode && ['st01', 'st15', 'st09'].includes(row.serviceType)) || (data && data.length) ? true : false
				}
			})
			window.open(routeUrl.href, '_blank')
		},

		// 复制
		async handleCopy(row) {
			let isSameCode = await this.$store.dispatch('order/getValueByKeys', { custid: row.custid })
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
								name: 'OrderDetail',
								params: {
									orderNo: orderNo
								},
								query: {
									orderNo: orderNo,
									source: 'orderList',
									action: 'copy',
									showContainer: !['ship_export_lcl', 'ship_import_lcl', 'ship_oversea_wh', 'ship_bulk_ro'].includes(row.businessType), // 业务类型：拼箱,海外仓，散杂滚装的不显示集装箱tab
									showBl: ['st01', 'st15', 'st03', 'st18', 'st09', 'st10', 'st11', 'st12', 'st24', 'st25', 'st02', 'st04'].includes(row.serviceType),
									showRelate: isSameCode && ['st01', 'st15', 'st09'].includes(row.serviceType)
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
				// console.log('columnsKeys:',this.tableQuery.columns)
				this.getList()
			}
		},

		// 新建订单保存
		handleCreateOrder(value, includeFeederType) {
			let includeFeeder = includeFeederType
			let action = 'add'
			let source = 'orderList'
			orderCreate(value).then(res => {
				let { orderNo, serviceType, businessType } = res.data
				// console.log('🚀 ~ res.data', res.data)
				sessionStorage.setItem('createOrderStr', JSON.stringify(res.data))
				this.createOrderPopShow = false
				this.isJumpRouteFromPage = true
				let routeUrl = this.$router.resolve({
					name: 'OrderDetail',
					params: {
						orderNo: orderNo
					},
					query: {
						orderNo: orderNo,
						source: 'orderList',
						action: 'add',
						includeFeeder: includeFeederType,
						showContainer: !['ship_export_lcl', 'ship_import_lcl', 'ship_oversea_wh', 'ship_bulk_ro'].includes(businessType), // 业务类型：拼箱,海外仓，散杂滚装的不显示集装箱tab
						showBl: ['st01', 'st15', 'st03', 'st18', 'st09', 'st10', 'st11', 'st12', 'st24', 'st25', 'st02', 'st04'].includes(serviceType),
						showRelate: value.exportOrderNo ? true : false
					}
				})
				window.open(routeUrl.href, '_blank')
			})
		},

		// 新建订单关闭回调
		createOrderPopClose(action, value, includeFeederType) {
			if (action === 'Confirm') {
				this.handleCreateOrder(value, includeFeederType)
			} else {
				this.createOrderPopShow = false
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
<style lang="scss">
</style>
