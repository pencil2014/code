<template>
  <div class="app-container follow-items-class">
    <div class="search-container">
			<Search ref="search" :config.sync="searchConfig" :callback="searchCallBack" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
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
      <el-tabs v-model="activityKey" @tab-click="handleClick">
        <el-tab-pane v-for="item in isOwnerMeuns" :label="item.label" :name="item.value" :key="item.value"></el-tab-pane>
      </el-tabs>
      <TableFilter ref="tableFilterRef" :searchInputGroup="searchInputGroup" :activityKey="activityKey" :componentKey="componentKey" :scenesCode="scenesCode"  :tableQuery="tableQuery"   :callback="tableCallBack" @selectTemplate="selectTemplateCb" @copyTemplate="copyTemplateCb" />
			<div style="margin-top: 20px;">
          <component ref="componentRef" :is="componentKey" :scenesCode="scenesCode" @callBack="componentCb"></component>
			</div>
    </div>
  </div>
</template>

<script>
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import TableFilter from '../components/tableFilter'
import { customerListAllStatus } from '@/api/crm/supplier'
import { baseEmployeeListName, baseEmployeeList } from '@/api/base'
import { getColumnConfigEmployeeConfig } from '@/api/order/followItems'
import { mapState } from 'vuex'
import all from '../table/all/index' // 全部
import loa from '../table/loa/index' // 托书
import release from '../table/release/index' // 放舱
import truck from '../table/truck/index' // 拖柜
import pol_warehouse from '../table/polWarehouse/index' // 起运港仓储
import stuffing from '../table/stuffing/index' // 堆场
import pol_ltl from '../table/polLtl/index' // 散车
import vgm from '../table/vgm/index' // VGM
import pol_declaration from '../table/polDeclaration/index' // 报关
import pol_inspection from '../table/polInspection/index' // 报检
import fume from '../table/fume/index' // 熏蒸
import other_inspect from '../table/otherInspect/index' // 各类检验
import plan_todo from '../table/planTodo/index' // 交接计划单
import mbl from '../table/mbl/index' // MBL
import hbl from '../table/hbl/index' // HBL
import sa from '../table/sa/index' // 发sa
import freetime from '../table/freetime/index' // FREETIME
import doc from '../table/doc/index' // 贸易单证
import insurance from '../table/insurance/index' // 保险
import fee from '../table/fee/index' // 费用
import bill from '../table/bill/index' // 账单
import pod_change_doc from '../table/podChangeDoc/index' // 换单
import pod_comm_clearance from '../table/podCommClearance/index' // 清关
import pod_warehouse from '../table/podWarehouse/index' // 目的港仓储
import delivery from '../table/delivery/index' // 整柜派送
import delivery_ltl from '../table/deliveryLtl/index' // 散车派送
import approve_pay_apply_order from '../table/approvePayApplyOrder/index' // 审核请款单
import pay_invoice_register from '../table/payInvoiceRegister/index' // 应付发票登记
import send_pay_bank_receipt from '../table/sendPayBankReceipt/index' // 发送银行水单
import departure from '../table/departure/index' // 开船
import arrival from '../table/arrival/index' // 到港
const defaultSearchInputGroup = [
	{
		key: 'orderNo',
		value: '',
		placeholder: '工作号',
		category: 'all',
		queryValue: ''
	},
  {
		key: 'jointNo',
		value: '',
		placeholder: '协同单号',
		category: 'all',
		queryValue: ''
	},
  {
		key: 'soNo',
		value: '',
		placeholder: 'SO号',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'status',
		value: '',
		placeholder: '状态',
		category: 'all',
		queryValue: ''
	},
]
export default {
  data() {
    return {
      defaultSearchLength: 0, // 默认显示搜索框的个数
			allFilterGroups: {
				all: this.filterGroups
			},
			state: '',
      filterGroups: {
        orderNo: { key: 'orderNo', label: '工作号', type: 'input', searchType: 'like', value: '' },
        jointNo: { key: 'jointNo', label: '协同单号', type: 'input', searchType: 'like', value: '' },
        soNo: { key: 'soNo', label: 'SO号', type: 'input', searchType: 'like', value: '' },
				custIntrustNo: { key: 'custIntrustNo', label: '客户委托号', type: 'input', searchType: 'like', value: '' },
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
				sysLineName: {
					key: 'sysLineName',
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
				etd: { label: '大船预计开船时间', key: 'etd', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				eta: { label: '预计到港时间', key: 'eta', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				td: { label: '大船实际开船时间', key: 'td', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				ta: { label: '实际到港时间', key: 'ta', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
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
				bargeCyCutOff: { label: '驳船截关时间', key: 'bargeCyCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				bargeEtd: { label: '驳船预计开船时间', key: 'bargeEtd', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				bargeTd: { label: '驳船实际开船时间', key: 'bargeTd', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
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
				shipCarrierCode: {
					key: 'shipCarrierCode',
					label: '船司',
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
				cargoName: { key: 'cargoName', label: '品名', type: 'input', searchType: 'like', value: '' },
        mblNo: { key: 'mblNo', label: 'MBL', type: 'input', searchType: 'like', value: '' },
        hblNo: { key: 'hblNo', label: 'HBL', type: 'input', searchType: 'like', value: '' },
				siCutOff: { label: '截SI', key: 'siCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				vgmCutOff: { label: '截VGM', key: 'vgmCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				ccCutOff: { label: '截关', key: 'ccCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				PreDeliveryTime: { label: '预计派送时间', key: 'PreDeliveryTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd', pickerOptionsStart: {}, pickerOptionsEnd: {} },
				DeliveryTime: { label: '实际派送时间', key: 'DeliveryTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd', pickerOptionsStart: {}, pickerOptionsEnd: {} },
				SignTime: { label: '签收时间', key: 'SignTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd', pickerOptionsStart: {}, pickerOptionsEnd: {} },
				ReturnEmptyBoxTime: { label: '还空柜时间', key: 'ReturnEmptyBoxTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd', pickerOptionsStart: {}, pickerOptionsEnd: {} },
				bdEmployeeName: {
					key: 'bdEmployeeName',
					label: '销售',
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
						this.getMulEmployeeName('', item, 'bd')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'bd')
					}
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
        bizDate: { label: '业务日期', key: 'bizDate', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				status: { 	
					label: '状态',
					key: 'status',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [
						{ label: '全部', value: 'all' },
						{ label: '未完成', value: 'todo' },
						{ label: '已完成', value: 'done' },
					],
					nonDictionary: true
				},
				bkgStatus: { 
					label: '订舱状态', 
					key: 'bkgStatus', 
					type: 'select', 
					searchType: 'in', 
					multiple: true, 
					data: [], 
					saveList: [], 
					'collapse-tags': true,
					data: [
						{ label: '未订舱', value: 'pass', },
						{ label: '订舱处理中', value: 'booking', },
						{ label: '已订舱', value: 'booked', },
						{ label: '已放舱', value: 'book_release', },
					],
					value: '', 
					nonDictionary: true 
				},
				issueStatus: { 
					label: '放舱给客户状态', 
					key: 'issueStatus', 
					type: 'select', 
					searchType: 'eq',  
					data: [
						{ label: '全部放舱', value: 'y'},
						{ label: '部分放舱', value: 'r'},
						{ label: '未放舱', value: 'n'},
					],  
					value: '', 
					nonDictionary: true 
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
				bkgAgentSupplierName: {
					key: 'bkgAgentSupplierName',
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
				isWhiteCust: { 	
					label: '是否白名单',
					key: 'isWhiteCust',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [
						{ label: '是', value: 'Y' },
						{ label: '否', value: 'N' },
					],
					nonDictionary: true
				},
				priceEmployeeName: {
					key: 'priceEmployeeName',
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
				docEmloyeeName: {
					key: 'docEmloyeeName',
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
				opEmloyeeName: {
					key: 'opEmloyeeName',
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
						this.getMulEmployeeName('', item, 'op')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'op')
					}
				},
				cscEmloyeeName: {
					key: 'cscEmloyeeName',
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
				opTruckEmloyeeName: {
					key: 'opTruckEmloyeeName',
					label: '拖车操作',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'op_truck')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'op_truck')
					}
				},
				opCustomsEmloyeeName: {
					key: 'opCustomsEmloyeeName',
					label: '关务操作',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'op_customs')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'op_customs')
					}
				},
				opWhEmployeeName: {
					key: 'opWhEmployeeName',
					label: '仓储操作',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'op_wh')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'op_wh')
					}
				},
				tcEmployeeName: {
					key: 'tcEmployeeName',
					label: 'MBL取单人',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'tc')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'tc')
					}
				},
				tcHblEmployeeName: {
					key: 'tcHblEmployeeName',
					label: 'HBL取单人',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'tc_hbl')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'tc_hbl')
					}
				},
				tcTradeEmployeeName: {
					key: 'tcTradeEmployeeName',
					label: '贸易单证取单人',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'tc_trade')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'tc-trade')
					}
				},
				rcEmployeeName: {
					key: 'rcEmployeeName',
					label: '放货人',
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
				eacEmployeeName: {
					key: 'eacEmployeeName',
					label: '海外应收财务',
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
				assitEmloyeeName: {
					key: 'assitEmloyeeName',
					label: '下单助理',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'assit')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'assit')
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
				acEmloyeeName: {
					key: 'acEmloyeeName',
					label: '应收财务',
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
				employeeId: {
					key: 'employeeId',
					label: '组员',
					type: 'remoteSelect',
					searchType: 'like',
					multiple: false,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMemberEmployeeName('', item)
					},
					filterMehod: (val, item) => {
						this.getMemberEmployeeName(val, item)
					}
				},
      },
      // 默认展示的搜索条件，搜索条件分类
			searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),
      searchConfig: [],
      tableQuery: {},
      isOwnerMeuns: [
        {
          value: 'owner',
          label: '个人待办'
        },
				{
          value: 'dept',
          label: '组员待办'
        },
        {
          value: 'all',
          label: '全部跟进项'
        },
      ],
      activityKey: 'owner',
			componentKey: '',
			subStatusType: '',
			scenesCode: '',
			copyFlag: false,
			outQueryList: [
				'PreDeliveryTime',
				'DeliveryTime',
				'SignTime',
				'ReturnEmptyBoxTime',
				'issueStatus',
			], // 参数在query外面
    }
  },
	computed: {
		...mapState({
			roles: state => state.user.roles,
			userInfo: (state) => state.user.userInfo
		}),
		isManager() {
			return this.roles && this.roles.includes('manager')
		},
	},
  components: {
    Search,
    AddFilter,
    TableFilter,
		all,
		loa,
		release,
		truck,
		pol_warehouse,
		stuffing,
		pol_ltl,
		vgm,
		pol_declaration,
		pol_inspection,
		fume,
		other_inspect,
		plan_todo,
		mbl,
		hbl,
		sa,
		freetime,
		doc,
		insurance,
		fee,
		bill,
		pod_change_doc,
		pod_comm_clearance,
		pod_warehouse,
		delivery,
		delivery_ltl,
		approve_pay_apply_order,
		pay_invoice_register,
		send_pay_bank_receipt,
		departure,
		arrival,
  },
  created() {
    this.init()
  },
	watch: {
	},
  methods: {
    init() {
			if (!this.isManager) {
				this.isOwnerMeuns.splice(1,1)
				delete this.filterGroups.employeeId
			}
			// 默认展示全部
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})
			this.$store.dispatch('followItems/setActivityKey', this.activityKey)
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
			this.initData()
		},
		initData() {
      this.componentKey = 'all'
			this.scenesCode = this.$route.name + '_' + this.componentKey
			this.subStatusType = ''
			this.$store.dispatch('followItems/setServiceCodeVal', this.componentKey)
		},
		handleCheck(arr) {
			if (!arr.some(item => item.code === this.componentKey && item.isShow === 'yes')) {
				this.initData()
			}
		},
    // 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
    handleClick(tab, event) {
      console.log(this.activityKey)
			this.$store.dispatch('followItems/setActivityKey', this.activityKey)
			this.searchCallBack('Refresh')
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
		// 远程搜索港口下拉数据
		portSearch(queryString, portAttribute, state, type, item) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				this.searchSelectVisibleData(data, item)
			})
		},
		// 系统航线下拉列表自动补充的数据
		sysLineQuerySearch(queryString, item) {
			this.$store.dispatch('dict/baseSystemLineList', { name: queryString, state: '' }).then(data => {
				this.searchSelectVisibleDataName(data, item)
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
		// 船公司下拉列表自动补充的数据
		shipCarrierQuerySearch(queryString, item) {
			this.$store.dispatch('dict/baseShippingCarrierList', { name: queryString, state: 'valid' }).then(data => {
				this.searchSelectVisibleData(data, item)
			})
		},
		// 获取订舱代理
		getSupplierList(type, queryString, item) {
			this.$store.dispatch('dict/queryBkgAgentSupplierList', { category: 'category', value: 'bkg_carrier,bkg_agent', queryString: queryString, categoryType: 'in' }).then(data => {
				let filterArr = data.list.filter(ele => !item.saveList.find(o => o.value === ele.value))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: this.$language == 'en' ? ele.ename : ele.name, value: this.$language == 'en' ? ele.ename : ele.name }
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
		// 搜索条件el-select下拉数据处理 通过name搜索
		searchSelectVisibleDataName(data, item) {
			// 单选下拉不保存选择后的数据
			if (!item.multiple) item.saveList = []
			let filterArr = data.filter(ele => !item.saveList.find(o => o.value === ele.value))
			let itemList = filterArr.map(ele => {
				return { ...ele, label: ele.value, value: ele.value }
			})
			item.data = [...item.saveList, ...itemList]
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
		getMemberEmployeeName(value, item) {
       if (value) {
        const data = {
          currPage: 1,
          pageSize: 2000,
          query: [
            { column: 'name', type: 'eq', value },
            { column: 'deptCode', type: 'eq', value: this.userInfo.compCode },
            { column: 'childFlag', type: 'eq', value: 1 },
          ]
        }
        baseEmployeeList(data)
        .then(res => {
					if (res.data.list && res.data.list.length) {
							let list = res.data.list.map(item => {
								item['value'] = item.employeeId
								item['label'] = item.cname
								return item
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
							console.log('item.data', item.data)
					}
        })
      }
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
    // 查询组件回调
		searchCallBack(action, param, isFirstLoad) {
      let query = []
			this.tableQuery = {}
			if (action === 'Search' || action === 'Refresh') {
				// 新增的查询条件组装tableQuery参数
				if (this.searchInputGroup.length) {
					this.searchInputGroup.forEach((item, index) => {
						let tempItem = {}
						if (item.key) {
							// 非自动补全的查询参数从item.value中取值合并到query
							if (this.outQueryList.includes(item.key)) {
								if (this.filterGroups[item.key].category === 'daterange') {
									// 时间区间组件的value值是数组，['beginDate','endDate'],要转换成后端需要的两个字段
									let beginValue = ''
									let endValue = ''
									if (item.value && item.value[0]) {
									   beginValue = beginValue = item.value[0] + ' 00:00:00'
										 this.tableQuery['begin'+item.key] = beginValue
									}
									if (item.value && item.value[1]) {
                     endValue = item.value[1] + ' 23:59:59'
										 this.tableQuery['end'+item.key] = endValue
									}  
								} else {
									this.tableQuery[item.key] = item.value
								}
							} else if (this.filterGroups[item.key].type !== 'autocomplete') {
								// 多选下拉框
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
								} else if (['status'].includes(item.key)) {
                   Object.assign(this.tableQuery, {
											status: item.value || ''
										})
								} else if (['employeeId'].includes(item.key)) {
									Object.assign(this.tableQuery, {
											employeeId: this.activityKey !== 'owner' ? item.value : ''
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
				}
				Object.assign(this.tableQuery, {
					query: query.filter(item => {
						return item.value
					})
				})
				let data = this.getListQuery()
				if (action === 'Search') {
					this.$refs['tableFilterRef'].init(this.tableQuery)
				}
				this.$refs['componentRef'].getList(data, this.copyFlag)
				this.copyFlag = false
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
		},
		handleChangeService(val) {
      this.componentKey = val
			this.subStatusType = ''
			this.scenesCode = this.$route.name + '_' + val
			this.$store.dispatch('followItems/setServiceCodeVal', this.componentKey)
			console.log('切换跟进项为：', val)
			this.$nextTick(() => {
         this.searchCallBack('Refresh')
			})
		},
		handleChangeSubStatus(val) {
			this.subStatusType = val
			this.scenesCode = this.$route.name + '_' + this.componentKey + '_' + val
			this.$nextTick(() => {
         this.searchCallBack('Refresh')
			})
		},
		selectTemplateCb(obj) {
			let { employeeId, scenesCode } = obj
			if (employeeId && scenesCode) {
				getColumnConfigEmployeeConfig({employeeId, scenesCode})
				.then(res => {
					this.$store.dispatch('followItems/setTemplateData', res.data)
					this.searchCallBack('Refresh')
				})
			} else {
        this.$store.dispatch('followItems/setTemplateData', {})
				this.searchCallBack('Refresh')
			}
      
		},
		copyTemplateCb() {
			this.copyFlag = true
			this.searchCallBack('Refresh')
		},
		handleRefresh() {
			this.searchCallBack('Refresh')
		},
		componentCb(type) {
			if (type === 'column') {
				// 勾选或取消了 手动跟进项
				this.$refs['tableFilterRef'].init(this.tableQuery)
			}
			this.searchCallBack('Refresh')
		},
		// 获取列表请求参数
		getListQuery() {
			let statusQuery = {}
			if (!this.tableQuery.status) {
				// 当状态没选，且是个人待办时，默认选择未完成
				Object.assign(this.tableQuery, {
					status: 'todo'
				})
			}
			statusQuery = {
				'listType': this.activityKey,
				'statusType': this.componentKey,
				subStatusType: this.subStatusType,
			}
			// 合并状态参数
			Object.assign(this.tableQuery, statusQuery)
			return this.tableQuery
		},
  }
}
</script>

<style lang="scss" scoped>
.follow-items-class {
	padding: 0;
  // padding: 10px 14px 0;
  height: 100%;
  font-size: 12px;
	/deep/.table-layout .vxe-table--render-default tr {
		height: 26px !important;
	}
	/deep/.el-tabs__item {
		height: 26px;
		line-height: 26px;
	}
	.table-container{
		padding: 0 8px 8px;
	}
	/deep/.vxe-body--row {
		.td-doing {
			background-color: #FEE09B;
		}
		.td-refuse {
			background-color: #F19586;
		}
		.td-finish {
			background-color: #9ACC8B;
		}
	}
}
</style>