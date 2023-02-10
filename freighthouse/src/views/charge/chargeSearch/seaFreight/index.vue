<template>
	<div class="app-container">
		<div class="search-container">
			<Search :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery"  :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
				<!-- 新增条件下拉查询 -->
				<AddFilter
					:defaultSearchLength="defaultSearchLength"
					:filterGroups="filterGroups"
					:allFilterGroups="allFilterGroups"
					:searchInputGroup="searchInputGroup"
					:callback="searchCallBack"
					:item="item"
					:index="index"
					v-for="(item, index) in searchInputGroup"
					:key="'filter' + index"
				/>
				<div class="btn-plus-search" @click="handleAddFilter"></div>
			</Search>
		</div>
		<div class="table-container" id="sea-freight-table">
			<TableFilter :config="tableConfig" :publishStatusOptions="publishStatusOptions" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
			<BaseTableMuti v-loading="loading" class="seaFreight" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
		</div>

		<!-- 自定义表头 -->
		<div v-if="customColumnsPopShow">
			<CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
		</div>

    <!-- 自定义复制模板 -->
    <div v-if="showCopyColumns">
      <CustomColumns title="复制的模板" :showModel="false" :columnsBase="columnsBase" :configColumns="copyColumns" @close="copyColumnsClose" />
    </div>

		<!-- 生成订单弹窗 -->
		<div v-if="createOrderPopShow">
			<CreateOrder :routeId="routeId" :isFeederRoute="isFeederRoute" @close="createOrderPopClose" />
		</div>
    <div class="water-mark-box"></div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import Search from '@/views/charge/maintain/mainRoute/components/search'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
import AddFilter from './components/addFilter'
// 弹出框
import BaseDialog from '@/components/Base/Dialog/index'
import CustomColumns from '@/components/customColumns/index'
import { routeList } from '@/api/charge/route'
import { orderCreate, orderChargeCreate, orderChangeInfo } from '@/api/order/list'
import TableColumnPopover from './components/tableColumnPopover'
import ScheduleColumnPopover from './components/scheduleColumnPopover'
import BeginDateColumnPopover from './components/beginDateColumnPopover'
import clip from '@/utils/clipboard'
import clipboard from '@/directive/clipboard/index.js'
import CreateOrder from './components/createOrder'
import { searchConditionInfo, searchConditionSave, searchConditionDelete,countrySelectList, columnWidthConfigInfo, columnWidthConfigSave, logSaveClientEvent } from '@/api/base'
import watermark from '@/utils/watermark'
const defaultPage = {
	pageSize: -1,
	currPage: 1
}

const defaultTableQuery = {
	ascColumns: [],
	descColumns: [],
	columns: [],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	state: 'published'
}
const defaultSearchInputGroup = [
	// {
	// 	key: 'feederPolCode',
	// 	value: '',
	// 	placeholder: '筛选条件',
	// 	category: 'all',
	// 	queryValue: ''
	// },
	{
		key: 'polCode',
		value: '',
		placeholder: '筛选条件',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'podCode',
		value: '',
		placeholder: '筛选条件',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'shipCarrierCode',
		value: '',
		placeholder: '筛选条件',
		category: 'all',
		queryValue: ''
	}
]

export default {
	mixins: [routerMixin],
	directives: {
		clipboard
	},
	data() {
		return {
			loading: false,
			cTimestamp: 0,
			state: '',
			showVal: null,
			defaultStyle: {
				width: '100%'
			},
			// searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 0, // 默认显示搜索框的个数
			// 中转港
			transitPortList: [],
			// 查询条件下拉选项
			allFilterGroups: {
				all: this.filterGroups
			},
			filterGroups: {
				// feederPolCode: {
				// 	key: 'feederPolCode',
				// 	label: '驳船收货地',
				// 	type: 'remoteSelect',
				// 	searchType: 'in',
				// 	value: '',
				// 	multiple: true,
				// 	'collapse-tags': true,
				// 	data: [],
				// 	nonDictionary: true,
				// 	saveList: [],
				// 	searchType: 'eq',
				// 	visibleChange: (val, item) => {
				// 		this.portSearch('', 'port_of_feeder', this.state, 'feederPolCode', item)
				// 	},
				// 	filterMehod: (val, item) => {
				// 		this.portSearch(val, 'port_of_feeder', this.state, 'feederPolCode', item)
				// 	}
				// },
				polCode: {
					key: 'polCode',
					label: '起运港',
					type: 'remoteSelect',
					searchType: 'in',
					value: '',
					multiple: true,
					'collapse-tags': true,
					notReserveKeyword: true,
					data: [],
					nonDictionary: true,
					saveList: [],
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', 'port_of_basic', this.state, 'polCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_basic', this.state, 'polCode', item)
					}
				},
				podCode: {
					key: 'podCode',
					label: '目的地',
					type: 'remoteSelect',
					searchType: 'in',
					value: '',
					multiple: true,
					'collapse-tags': true,
					notReserveKeyword: true,
					data: [],
					nonDictionary: true,
					saveList: [],
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', 'port_of_destination', this.state, 'podCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_destination', this.state, 'podCode', item)
					}
				},
				shipCarrierCode: {
					key: 'shipCarrierCode',
					label: '船公司',
					type: 'remoteSelect',
					value: '',
					data: [],
					nonDictionary: true,
          multiple: true,
					saveList: [],
					searchType: 'eq',
					visibleChange: (val, item) => {
						val && this.shipQuerySearch('', item)
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
				unloadingPortCode: {
					key: 'unloadingPortCode',
					label: '卸货港',
					type: 'remoteSelect',
					searchType: 'in',
					value: '',
					multiple: true,
					'collapse-tags': true,
					notReserveKeyword: true,
					data: [],
					nonDictionary: true,
					saveList: [],
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', 'port_of_discharge', this.state, 'unloadingPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_discharge', this.state, 'unloadingPortCode', item)
					}
				},
				sysLineCode: {
					key: 'sysLineCode',
					label: '系统航线',
					type: 'remoteSelect',
					value: '',
					queryValue: '',
					data: [],
					nonDictionary: true,
					saveList: [],
					searchType: 'eq',
					visibleChange: (val, item) => {
						this.sysLineQuerySearch('', item)
					},
					filterMehod: (val, item) => {
						this.sysLineQuerySearch(val, item)
					},
					change: (val, item) => {
						let findItem = item.data.find(ele => ele.value === val)
						Object.assign(item, {
							queryValue: val,
							text: findItem ? findItem.label : ''
						})
					}
				},
				shipTerms: {
					key: 'shipTerms',
					label: '运输条款',
					type: 'select',
					value: '',
					data: this.shipTerms,
					nonDictionary: true
				},
				transitPortCodes: {
					key: 'transitPortCodes',
					label: '中转港',
					type: 'remoteSelect',
					searchType: 'in',
					value: '',
					multiple: true,
					'collapse-tags': true,
					notReserveKeyword: true,
					data: [],
					nonDictionary: true,
					saveList: [],
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', 'port_of_basic', this.state, 'transitPortCodes', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_basic', this.state, 'transitPortCodes', item)
					}
				},
				attention: { key: 'attention', label: '特别提醒', type: 'input', value: '', searchType: 'like' },
				bkgAgentId: {
					key: 'bkgAgentId',
					label: '订舱代理',
					type: 'remoteSelect',
					value: '',
					searchType: 'eq',
					data: [],
					nonDictionary: true,
					saveList: [],
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
				/*  state: {key: 'state', label: '发布状态', type: 'select', value: '', searchType: 'eq',}, */
				recommendLevel: { label: '推荐', key: 'recommendLevel', type: 'select', value: '', searchType: 'eq' },
				beginDate: { label: '有效期', key: 'beginDate', type: 'date', value: '', category: 'daterange', format: 'yyyy-MM-dd', searchType: 'eq' },
				effectiveType: { label: '有效类别', key: 'effectiveType', type: 'select', value: '', searchType: 'eq' },
				feederMatchMode: { label: '驳船匹配方式', key: 'feederMatchMode', type: 'select', value: '', searchType: 'eq' },
				schedule: { label: '船期', key: 'schedule', type: 'input', value: '', searchType: 'like' },
				carrierLineCode: {
					key: 'carrierLineCode',
					label: '承运人航线',
					type: 'remoteSelect',
					value: '',
					queryValue: '',
					data: [],
					nonDictionary: true,
					saveList: [],
					searchType: 'eq',
					visibleChange: (val, item) => {
						this.sysLineQuerySearch('', item)
					},
					filterMehod: (val, item) => {
						this.sysLineQuerySearch(val, item)
					},
					change: (val, item) => {
						let findItem = item.data.find(ele => ele.value === val)
						Object.assign(item, {
							queryValue: val,
							text: findItem ? findItem.label : ''
						})
					}
				},
				pricer: {
					key: 'pricer',
					label: '拿价人',
					type: 'remoteSelect',
					value: '',
					queryValue: '',
					data: [],
					nonDictionary: true,
					saveList: [],
					searchType: 'eq',
					visibleChange: (val, item) => {
						this.pricerQuerySearch('', item)
					},
					filterMehod: (val, item) => {
						this.pricerQuerySearch(val, item)
					},
					change: (val, item) => {
						let findItem = item.data.find(ele => ele.value === val)
						Object.assign(item, {
							queryValue: val,
							text: findItem ? findItem.label : ''
						})
					}
				},
        blankSailing: { label: '是否停航', key: 'blankSailing', type: 'select', value: '', searchType: 'eq', data: [
        {label: '是', value: 'Y'}, {label: '否', value: 'N'}] },
        publishTime: {
          label: '发布时间', key: 'publishTime', type: 'date', value: '', category: 'daterange', format: 'yyyy-MM-dd', searchType: 'eq' 
        },
        podCountryCode: {
          key: 'podCountryCode',
          label: '目的港国家',
          type: 'remoteSelect',
          value: '',
					data: [],
          nonDictionary: true,
          saveList: [],
          searchType: 'in',
          visibleChange: (val, item) => {
            this.getCountry('',item)
          }, filterMehod: (val, item) => {
            this.getCountry(val ,item)
          }
        },
			},
			searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),

			// 编辑提交参数
			createItem: {
				oceanFreight: [], // 海运费
				surchargeList: [] // 附加费
			},
			// 查询条件
			tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
			publishStatusOptions: {},
			searchConfig: [],

			// table复选框多选的值
			selectedCheckbox: [],

			// table基础组件
			tableConfig: {
				style: {},
				tableIndex: {
					show: false
				},
				customColumns: {
					show: false,
					handleCustomColumns: this.handleCustomColumns
				},
				defaultEmpty: true, // 数据默认不加载的显示文案
				options: {
					// api: this.$api.system.user.list,
					// 是否支持解锁列表修改
					lockState: true,

					// 是否支持列表项选中功能
					mutiSelect: true,

					// 多选框状态判断 {false不可选, true可选}
					checkSelectable({ routeId }) {
						return routeId ? true : false
					},

					// 行key,用于行展开
					rowKeyId: 'rowKey',
					//定义children名字
					treeProps: {
						children: 'subRouteList',
						hasChildren: 'hasChildren',
            expandAll: false,
            expandDefaultNot: true
					}
				},
				list: [],
				configColumns: [],
				columns: [],
				allColumns: [
					{
						prop: 'polEname',
						label: '大船起运港',
						// fixed: true,
						align: 'left',
						width: '100px',
						'header-align': 'left',
            sortable: 'custom',
						formatter: (row, column) => {
							let polStr = '<i class="recommend"></i><span>--</span>'
							let recommend = `<i class="recommend"></i>`
							if (row.subRouteList && row.subRouteList.length > 0) {
								polStr = `<div class="column-block">${row.polEname}(${row.polCname})</div>`
							} else if (row.polCode || row.podCode) {
								polStr = `<div class="column-block underline">${row.polEname}(${row.polCname})</div>${recommend}`
							}
							return polStr
						},
						type: 'text',
						method: (index, row) => {
							if (row.subRouteList && row.subRouteList.length > 0) return
							this.handleRouteInfo(index, row)
						}
					},
          {
						prop: 'podEname',
						label: '目的地',
						// fixed: true,
						align: 'left',
						width: '100px',
						'header-align': 'left',
            sortable: 'custom',
						formatter: (row, column) => {
							let polStr = '<span>--</span>'
							let recommend = ``
							if (row.subRouteList && row.subRouteList.length > 0) {
								polStr = `${recommend}<div class="column-block">${row.podEname}(${row.podCname})</div>`
							} else if (row.polCode || row.podCode) {
								polStr = `${recommend}<div class="column-block underline">${row.podEname}(${row.podCname})</div>`
							}
							return polStr
						},
						type: 'text',
						method: (index, row) => {
							if (row.subRouteList && row.subRouteList.length > 0) return
							this.handleRouteInfo(index, row)
						}
					},
          {
            prop: 'podCountryName',
            label: '目的港国家',
            type: 'text',
						width: '100',
            sortable: 'custom',
          },
					{
						prop: 'shipCarrierCode',
						label: '船司',
						width: '100px',
						cname: '',
						type: 'text',
            sortable: 'custom',
						formatter: (row, column) => {
              let code = row.shipCarrierCode
              let str= `<i class="icon-tip icon-stop">停</i>`
						  return row.blankSailing === 'Y' ? (str+code) : code
						}
					},
					{
						prop: 'shipTerms',
						label: '运输条款',
						width: '100px',
						type: 'text',
						cname: '',
            sortable: 'custom',
						formatter: (row, column) => {
							return getDictLabel('shipTerms', row.shipTerms)
						}
					},
					{
						prop: 'sysLineCname',
						cname: '',
						label: '系统航线',
						width: '100px',
						type: 'text',
            sortable: 'custom',
						formatter: (row, column) => {
							return `<span class="column-span">${row.sysLineCname}</span>`
						}
					},
					{
						prop: 'transitPort1Code',
						label: '中转港',
						width: '100px',
            sortable: 'custom',
						formatter: (row, column) => {
							return row.transitPort1Ename || row.transitPort2Ename || row.transitPort3Ename ? `<span class="column-span">${row.transitPort1Ename}&nbsp;${row.transitPort2Ename}&nbsp;${row.transitPort3Ename}</span>` : '<span>--</span>'
						},
						type: 'text',
						multiple: true,
						'collapse-tags': true,
						filterable: true,
						data: [],
						nonDictionary: true
					},
					{
						prop: 'unloadingPortCode',
						label: '卸货港',
						type: 'text',
						width: '150',
            sortable: 'custom',
						formatter: (row, column) => {
							return row.unloadingPortCode ? `<span class="column-span">${row.unloadingPortEname}(${row.unloadingPortCname})</span>` : '<span>--</span>'
						}
					},
					{
						prop: 'cutoffDate',
						label: '截文件',
						// sortable: 'custom',
						type: 'text',
						width: '100px',
            sortable: 'custom',
						formatter: (row, column) => {
							if (row.cutoffDate) {
							}
							return row.cutoffDate ? `<span class="column-span">每周${row.cutoffDate.split('/')[0]},${row.cutoffDate.split('/')[1]}点前</span>` : ''
						}
					},
					{
						prop: 'pricerName',
						label: '拿价人',
						width: '100px',
						type: 'text',
            sortable: 'custom',
					},
					{
						prop: 'surchargeDesc',
						label: '附加费说明',
						width: '200px',
						type: 'text',
            sortable: 'custom',
						change: (val, row) => {
							Object.assign(row, {
								surchargeDesc__save: val
							})
						}
					},
					{
						prop: 'priceGp20',
						label: '20GP',
						sortable: 'custom',
						type: 'text',
						width: '100',
						formatter: (row, column) => {
							return row.weightPriceGp20 ? `<span class="column-span">${row.priceGp20Desc}+限重费</span>` : `<span class="column-span">${row.priceGp20Desc}</span>`
						}
					},
					{
						prop: 'priceGp40',
						label: '40GP',
						sortable: 'custom',
						width: '120px',
						type: 'text',
						width: '100',
						formatter: (row, column) => {
							return row.weightPriceGp40 ? `<span class="column-span">${row.priceGp40Desc}+限重费</span>` : `<span class="column-span">${row.priceGp40Desc}</span>`
						}
					},
					{
						prop: 'priceHq40',
						label: '40HQ',
						sortable: 'custom',
						type: 'text',
						width: '100',
						formatter: (row, column) => {
							return row.weightPriceHq40 ? `<span class="column-span">${row.priceHq40Desc}+限重费</span>` : `<span class="column-span">${row.priceHq40Desc}</span>`
						}
					},
					{
						prop: 'priceHq45',
						label: '45HQ',
						sortable: 'custom',
						type: 'text',
						width: '100',
						formatter: (row, column) => {
							return row.weightPriceHq45 ? `<span class="column-span">${row.priceHq45Desc}+限重费</span>` : `<span class="column-span">${row.priceHq45Desc}</span>`
						}
					},
					{
						prop: 'priceNor20',
						label: '20NOR',
						sortable: 'custom',
						type: 'text',
						width: '100',
						formatter: (row, column) => {
							return row.weightPriceGp20 ? `<span class="column-span">${row.priceNor20Desc}+限重费</span>` : `<span class="column-span">${row.priceNor20Desc}</span>`
						}
					},
					{
						prop: 'priceNor40',
						label: '40NOR',
						sortable: 'custom',
						width: '120px',
						type: 'text',
						width: '100',
						formatter: (row, column) => {
							return row.weightPriceGp40 ? `<span class="column-span">${row.priceNor40Desc}+限重费</span>` : `<span class="column-span">${row.priceNor40Desc}</span>`
						}
					},
					{
						prop: 'surchargeList',
						label: '附加费',
						type: 'text',
            width: '100',
						popoverComponent: TableColumnPopover,
						formatter: (row, column) => {
							return row.surchargeList ? `<span>附加费</span>` : `<span>--</span>`
						},
						method: (index, row) => {
							this.handleEditSurcharge(index, row)
						},
					},
					{
						prop: 'schedule',
						label: '船期',
            sortable: 'custom',
						popoverComponent: ScheduleColumnPopover,
						// sortable: 'custom',
						width: '200',
						type: 'text',
						value: ''
					},
					{
						prop: 'effectiveType',
						label: '有效类别',
            sortable: 'custom',
						// sortable: true,
						type: 'text',
						value: '',
						width: '100',
						formatter: (row, column) => {
							return row.effectiveType ? row.effectiveType : ''
						}
					},
					{
						prop: 'blType',
						label: '提单类型',
						// sortable: true,
            sortable: 'custom',
						type: 'text',
						value: '',
						width: '100',
						formatter: (row, column) => {
							return row.blType ? row.blType : ''
						}
					},
					{
						prop: 'issueWay',
						label: '出单方式',
						// sortable: true,
            sortable: 'custom',
						type: 'text',
						value: '',
						width: '100',
						formatter: (row, column) => {
							let str = ''
							let labelArr = []
							if (row.issueWay) {
								let valArr = row.issueWay.split(',')
								labelArr = this.dictMap.chargeIssueWay.filter(item => valArr.includes(item.value)).map(item => item.label)
								str = labelArr.toString()
							}
							if (row.telexFee > 0) {
								str += `; 电放费 ${row.telexFee}${row.telexFeeCurrency}`
							}
							return str || '--'
							// return row.issueWay ? row.issueWay : ''
						}
					},
					{
						prop: 'attention',
						label: '特别提醒',
						// sortable: true,
            sortable: 'custom',
						type: 'text',
						width: '150'
					},
					{
						prop: 'voyage',
						label: '航程',
						// sortable: true,
             sortable: 'custom',
						width: '80',
						type: 'text'
					},
					{
						prop: 'feederPolCode',
						label: '驳船收货地',
						type: 'text',
						width: '120',
            sortable: 'custom',
						formatter: (row, column) => {
							return row.feederPolCode ? `<span class="column-span">${row.feederPolEname}(${row.feederPolCname})</span>` : '<span>--</span>'
						}
					},
					{
						prop: 'beginDate',
						label: '有效期(开始)',
						// sortable: true,
            sortable: 'custom',
						type: 'text',
						width: '120px',
						category: 'date',
						format: 'yyyy-MM-dd',
						popoverComponent: BeginDateColumnPopover,
						// formatter: (row, column) => {
						// 	return row.beginDate ? `<span style="white-space: nowrap;">${row.beginDate}~</br>${row.endDate}</span>` : '--'
						// }
					},
          {
            prop: 'endDate',
						label: '有效期(结束)',
						// sortable: true,
            sortable: 'custom',
						type: 'text',
						width: '120px',
						category: 'date',
						format: 'yyyy-MM-dd',
						popoverComponent: BeginDateColumnPopover,
          },
					{
						prop: 'feederBeginDate',
						label: '驳船有效期',
						type: 'text',
						width: '100px',
						category: 'daterange',
						format: 'yyyy-MM-dd',
             sortable: 'custom',
						formatter: (row, column) => {
							return row.feederBeginDate ? `<span style="white-space: nowrap;">${row.feederBeginDate}~${row.feederEndDate}</span>` : '--'
						}
					},
					{
						prop: 'bkgAgent',
						label: '订舱代理',
						type: 'text',
            width: '100px',
             sortable: 'custom',
					},
					{
						prop: 'carrierLineName',
						label: '承运人航线',
						type: 'text',
            width: '100px',
             sortable: 'custom',
					},
					{
						prop: 'carrierService',
						width: '100px',
						label: '航线代码',
						type: 'text',
            width: '100px',
             sortable: 'custom',
					},
					{
						prop: 'cargoLimited',
						label: '限定货物',
						type: 'text',
            width: '100px',
             sortable: 'custom',
					},
					{
						prop: 'sailingDate',
						label: '开航日',
						type: 'text',
						width: '100px',
						format: 'yyyy-MM-dd',
             sortable: 'custom',
					},
					{
						prop: 'allin',
						label: '是否ALLIN',
						type: 'text',
						width: '100px',
             sortable: 'custom',
						formatter: (row, column) => {
							return row.allin ? row.allin : ''
						}
					},
					{
						prop: 'internalDesc',
						label: '内部备注',
						type: 'text',
            width: '100',
             sortable: 'custom',
					},
					{
						prop: 'freeTimeDesc',
						label: '免用免堆',
						type: 'text',
            width: '100',
             sortable: 'custom',
					},
					{
						prop: 'guidanceDesc',
						label: '收货指引',
						type: 'text',
            width: '100',
             sortable: 'custom',
					},
					{
						prop: 'mainRouteTransferMode',
						label: '中转方式',
						type: 'text',
						value: '',
						width: '80',
             sortable: 'custom',
						formatter: (row, column) => {
							return row.mainRouteTransferMode ? row.mainRouteTransferMode : '--'
						}
					},
					{
						prop: 'feederMatchMode',
						label: '驳船匹配',
						type: 'text',
						value: '',
						width: '80',
             sortable: 'custom',
						formatter: (row, column) => {
							return row.feederMatchMode ? row.feederMatchMode : '--'
						}
					},
          {
            prop: 'weightDesc',
            label: '限重说明',
						type: 'text',
						value: '',
            width: '100',
             sortable: 'custom',
          },
          {
            prop: 'blankSailing',
						label: '是否停航',
						sortable: 'custom',
						type: 'text',
						width: '100',
            formatter: (row, column) => {
							return row.blankSailing ? row.blankSailing === 'Y'? '是': '否' : '--'
						}
          },
          {
            prop: 'publishTime',
						label: '发布时间',
						sortable: 'custom',
						type: 'text',
						width: '100'
          },
          {
            prop: 'invalidDate',
						label: '失效时间',
						type: 'text',
						width: '100'
					},
					{
						prop: 'issueWayDesc',
						label: '出单方式备注',
						type: 'text',
            width: '150',
						sortable: 'custom',
					},
					{
						prop: 'podChargeDesc',
						label: '目的港收费标准参考',
						type: 'text',
            width: '150',
						sortable: 'custom',
					},
				],

				// 操作按钮组
				operationBtns: {
					minWidth: '120',
					fixed: 'right',
					show: true,
          resizable: true,
					callback: (action, $index, row, item, $event) => {
						this.work_table_id = row.work_table_id

						if (action === 'Detail') {
							this.handleDetail(row)
						}
						if (action === 'Create') {
							this.handleCreate(row)
						}
						if (action === 'Copy') {
							this.handleCopy(row, $index, $event)
							// 用户操作采集
							this.$store.dispatch('user/saveClientEvent', {
								sysCode: "charge",
								soure: "web",
								type: "button_click",
								eventCode: "charge_copy_route",
								eventName: "运价查询-复制运价"
							})
						}
					},
					data: [
						{
							label: '详情',
							type: 'text',
							show: (item, row) => {
								if (row.subRouteList && row.subRouteList.length > 0) {
									return false
								} else {
									return true
								}
							},
							action: 'Detail'
						},
						{
							label: '下单',
							type: 'text',
							show: (item, row) => {
								if ((row.subRouteList && row.subRouteList.length > 0) || this.tableQuery.state === 'invalid' || row.blankSailing === 'Y') {
									return false
								} else {
									return true
								}
							},
							action: 'Create',
              className: 'green'
						},
						{
							label: '复制',
							type: 'text',
							id: 'copyBtn',
							show: (item, row) => {
								if (row.subRouteList && row.subRouteList.length > 0) {
									return false
								} else {
									return true
								}
							},
							action: 'Copy'
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
					oldPagination: false,
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
			routeId: '',
			isFeederRoute: 'y',
			feederRouteId: undefined,
			createOrderPopShow: false,
			isClickInfo: false,
			resDefaConfList: [], // 后端配置的默认搜索模板
      tableColumnsWidthList: [],
      // 自定义复制模板
      copyColumns: [],
      showCopyColumns: false,
		}
	},
	// beforeRouteLeave (to, from, next) {
	//   if (to.name == 'SeaFreightDetail' && this.isClickInfo) {
	//     to.meta.isUseCache = false
	//   } else {
	//     to.meta.isUseCache = true
	//   }
	//   next();
	// },
	activated() {
		// let timestamp = new Date().getTime()
		// if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
		// 	this.getList()
		// }
	},
	deactivated() {
	},
	created() {
		// this.cTimestamp = new Date().getTime()
		this.init()
		// this.getSearchConditionInfo()
		// this.getList()
    let copyColumns = window.localStorage.getItem('copyColumns')
    if (copyColumns) {
      this.copyColumns = JSON.parse(copyColumns)
    }
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			shipTerms: state => state.dict.dictMap.shipTerms,
			publishStatus: state => state.dict.dictMap.publishStatus,
			routeQuery: state => state.charge.routeQuery,
			defaultColumns: state => state.charge.routeQuery.defaultColumns,
			specialColumns: state => state.charge.routeQuery.specialColumns,
			columnsBase: state => state.charge.routeQuery.columnsBase
		})
	},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		TableFilter,
		BaseDialog,
		CustomColumns,
		TableColumnPopover,
		ScheduleColumnPopover,
		BeginDateColumnPopover,
		CreateOrder
	},
	methods: {
    // 目的港国家
    getCountry (val='', item) {
      val = val.trim()
      let data = {
        countryCode: val,
        state: "valid",
      }
      countrySelectList(data).then(res => {
        if (res.data?.length) {
          item.data = res.data.map(item => {
            let { cname, ename, countryCode }= item
            return {
              label: cname || ename,
              value: countryCode,
            }
          })
        } else {
          item.data = []
        }  
      }).catch(()=> {})
    },
		init() {
			let { publishStatus } = this.dictMap
			publishStatus.forEach(item => {
				if (item.value !== 'unpublished') {
					this.publishStatusOptions[item.value] = item.label
				}
			})
		},
		// 后端没有配置模板
		initSearch() {
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
		},
		// 增加一条搜索条件
		handleAddFilter() {
			this.searchInputGroup.push({ value: '', key: '', queryValue: '' })
			//console.log('新增一条：', this.searchInputGroup)
		},

		// 获取订舱代理
		getSupplierList(type, queryString, item) {
			this.$store.dispatch('dict/queryBkgAgentSupplierList', { category: 'category', value: 'bkg_carrier,bkg_agent', queryString: queryString, categoryType: 'in' }).then(data => {
        if (data.list && data.list.length) {
          // item.data = data.list.map(ele => {
          //   return Object.assign(ele, {
          //     label: this.$language=='en' ? ele.ename : ele.name,
          //     value: ele.supplierId
          //   })
          // })
          let filterArr = data.list.filter(ele => !item.saveList.find(o => o.value === ele.supplierId))
          let itemList = filterArr.map(ele => {
            return {...ele, label: this.$language == 'en' ? ele.ename : ele.name, value: ele.supplierId ? Number(ele.supplierId) : ''}
          })
          item.data = [...item.saveList, ...itemList]
        }
      })
		},

		// 远程搜索港口下拉数据
		portSearch(queryString='', portAttribute, state, type, item) {
      queryString = queryString.trim() //去空格
			this.$store.dispatch('dict/basePortList', {queryString, portAttribute, state}).then(data => {
        // let portList = data.map(ele => {
        //   return Object.assign(ele, {
        //     label: ele.value,
        //     value: ele.key
        //   })
        // })
        // item.data = portList
        let filterArr = data.filter(ele => !item.saveList.find(o => o.value === ele.key))
				let itemList = filterArr.map(ele => {
					return {...ele, label: ele.value, value: ele.key}
				})
        item.data = [...item.saveList, ...itemList]
      })
		},

		// 系统航线下拉列表自动补充的数据
		sysLineQuerySearch(queryString='', item) {
      queryString = queryString.trim() //去空格
			this.$store.dispatch('dict/baseSystemLineList', {name: queryString, state: ''}).then(data => {
				item.data = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
			})
		},

		// 船公司下拉列表自动补充的数据
		shipQuerySearch(queryString='', item) {
      queryString = queryString.trim() //去空格
			this.$store.dispatch('dict/baseShippingCarrierList', { name: queryString, state: '' }).then(data => {
				item.data = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
			})
		},

		// 运输条款下拉列表自动补充的数据
		shipTermsQuerySearch(queryString='', item) {
      queryString = queryString.trim() //去空格
			this.$store.dispatch('dict/baseShipTermsList', queryString).then(data => {
				item.data = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
			})
		},

		// 拿价人
		pricerQuerySearch(queryString='', item) {
      queryString = queryString.trim() //去空格
			let params = {}
			Object.assign(params, {
				name: queryString,
				state: 'valid'
			})
			this.$store.dispatch('dict/employeeSelectlist', params).then(data => {
				// item.data = data.map(ele => {
				// 	return Object.assign(ele, {
				// 		label: ele.value,
				// 		value: ele.key
				// 	})
				// })
				let filterArr = data.filter(ele => !item.saveList.find(o => o.value === ele.key))
				let itemList = filterArr.map(ele => {
					return {...ele, label: ele.value, value: ele.key}
				})
        item.data = [...item.saveList, ...itemList]
			})
		},

		// 列表数据
		async getList() {
			let publishStatusQuery = [{ column: 'state', type: 'eq', value: this.tableQuery.state }]
			// 合并发布状态参数
			let data = {}
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(publishStatusQuery)
			})
      // let keys = data.query.map(item => item.column)
      // if (!keys.includes('podCode') && !keys.includes('podCountryCode')) {
      //   return this.$msgErrClose('必须填写 目的港 或 目的港国家!')
      // }
			delete data.state
      this.loading = true
      let res = await columnWidthConfigInfo({
					scenesCode: this.$route.name
				})
			let { columnWidthList } =res.data
			routeList(data)
				.then(response => {
					let { list, totalCount, configColumns } = response.data
					//处理返回的数据，映射关系
					this.handlerList(list)
					this.tableConfig.list = list.map(item => {
             if (item.blankSailing === 'Y') {
              item._isInvalid = true
            }
            if (item.subRouteList?.length) {
              item.subRouteList.forEach(ele => {
                if (ele.blankSailing === 'Y') {
                  ele._isInvalid = true
                }
              })
            }
						return {...item}
          })
					// 请求无数据显示的文案
					if (!list || !list.length) {
						this.$set(this.tableConfig, 'defaultEmpty', false)
					}
					this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns

					this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
          this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
          this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
          this.tableConfig.pagination.isLastPage = response.data.isLastPage
          this.tableQuery.currPage = response.data.currPage
          this.tableQuery.pageSize =  response.data.pageSize
					this.tableConfig.pagination.total = totalCount
					this.handleFilterColumns(this.tableConfig.configColumns)
          this.tableConfig.columns.map(item => {
						// 取服务器返回的宽度
						let findItem = columnWidthList.find(ele => ele.column === item.prop)
						let newWidth = findItem ? findItem.width : ''
						return Object.assign(item, { width: newWidth || item.width })
					})
					this.tableColumnsWidthList = this.getTableColumnsWidth()
					this.getTableConfigList(list)
				})
				.finally(() => {
					this.loading = false
				})
		},
		handlerList(row) {
			row.map(item => {
				this.handlerSingleData(item)
				if (item.subRouteList && item.subRouteList.length > 0) {
					item.subRouteList.map(item1 => {
						this.handlerSingleData(item1)
					})
				}
			})
		},
		handlerSingleData(item) {
			// 设置推荐位row的样式
			if (item.recommendLevel === 'Y' && item.publishStatus === 'published') {
				item.isRecommendRow = true
			}
			if (item.mainRouteTransferMode) {
				item.mainRouteTransferMode = getDictLabel('mainRouteTransferMode', item.mainRouteTransferMode)
			}
			if (item.allin) {
				item.allin = this.$t(`dict.allin.${item.allin}`)
			}
			// if (item.issueWay) {
			// 	item.issueWay = getDictLabel('issueWay', item.issueWay)
			// }
			if (item.blType) {
				item.blType = getDictLabel('blType', item.blType)
			}
			if (item.effectiveType) {
				item.effectiveType = getDictLabel('effectiveType', item.effectiveType)
			}
			if (item.feederMatchMode) {
				item.feederMatchMode = getDictLabel('feederMatchMode', item.feederMatchMode)
			}
		},
		getTableConfigList(list) {
			this.tableConfig.tableCellClassName = ({ row, column, rowIndex, columnIndex }) => {
				if (row.subRouteList?.length) {
					return 'td-hasChildren'
				} else {
					return ''
				}
			}
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
								column: item.key,
								type: item.searchType || 'eq',
								value: item.queryValue
							})
							query.push(tempQuery)
						}
					})
				}

				// 新增的查询条件组装tableQuery参数
				if (this.searchInputGroup.length) {
					this.searchInputGroup.forEach((item, index) => {
            if (['publishTime','beginDate'].includes(item.key)) {
               if (item.key === 'beginDate' && item.value?.length) {
                query.push(
                  {'column': 'beginDate','type': 'eq','value': item.value[0]},
                  {'column': 'endDate','type': 'eq','value': item.value[1]}
                )
              }
              if (item.key === 'publishTime' && item.value?.length) {
                query.push(
                  { column: 'publishBeginDate', type: "eq", value: item.value[0] },
                  { column: 'publishEndDate', type: "eq", value: item.value[1] }
                )
              }
            } else if (item.value) {
              let tempItem = {}
							Object.assign(tempItem, {
								column: item.key,
								type: this.filterGroups[item.key].searchType || 'eq'
							})

							// 非自动补全的查询参数从item.value中取值合并到tableQuery
							if (this.filterGroups[item.key].type !== 'autocomplete') {
								Object.assign(tempItem, {
									value: item.value
								})

								// 时间区间，beginDate开始时间区数组第一个
								if (item.key === 'beginDate') {
									Object.assign(tempItem, {
										value: item.value ? item.value[0] : ''
									})
								}

								// if (item.key === 'transitPortCodes') {
								//   Object.assign(tempItem, {
								//     "value": item.value ? item.value.toString() : ''
								//   })
								// }
								// 多选
								if (this.filterGroups[item.key].type === 'remoteSelect' && this.filterGroups[item.key].multiple) {
									Object.assign(tempItem, {
										column: item.key,
										type: this.filterGroups[item.key].searchType || 'eq',
										value: item.value ? item.value.toString() : ''
									})
								}
							}

							// 自动补全的查询参数从item.queryvalue中取值合并到query
							if (this.filterGroups[item.key].type === 'autocomplete') {
								Object.assign(tempItem, {
									value: item.queryValue
								})
							}
							query.push(tempItem)
							// console.log('query:', query);
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
				if (!param.length) return this.initSearch()
				this.searchInputGroup = [...param]
			}
		},
		handleSearchValueReset() {
			this.searchInputGroup.map(item => {
				item.value = ''
				return {...item}
			})
			// console.log('重置')
		},
		// 导出
		handleExport() {
			if (!this.selectedCheckbox.length) {
				this.$message.error('请先选择')
			}
		},
		// 自定义表头
		handleCustomColumns() {
			this.customColumnsPopShow = true
		},

		// 发布状态筛选
		handleSearchByPublishStatus() {
			this.tableQuery.currPage = 1
			this.getList()
		},

		// 多选
		handleMuti(arr) {
			this.selectedCheckbox = arr
		},

		handleSizeChang() {
			this.getList()
		},

		handleCurrentChange(val) {
			console.log('val', val)
			// 刷新页面的如果搜索条件都为空的话，不请求列表接口
			if (val === 1) {
				return this.tableConfig.list = []
			}
			this.getList()
		},
		handleSizeChange() {
			this.getList()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			// console.log(action, arr)
			let fn = this['handle' + action]
			// Add、Export、CustomColumns、ChangeLockState、Muti、SizeChange、CurrentChange、SingleEdit
			// MultiEdit、 MultiPublish、MultiInvalid、MultiDelete
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
    handleCopyColumns () {
      let copyColumns = window.localStorage.getItem('copyColumns')
      if (copyColumns) {
        this.copyColumns = JSON.parse(copyColumns)
      }
      this.showCopyColumns = true
    },
		handleRouteInfo(index, row) {
			this.handleDetail(row)
		},
		//去详情
		handleDetail(row) {
      let {feederPolCname, feederPolEname, routeId, feederRouteId} = row
			// this.isClickInfo = true
			// this.$router.push({
			//   path: '/charge/chargeSearch/seaFreightDetail?routeId=' + row.routeId+'&feederRouteId='+row.feederRouteId,
			// })
			this.routerPush('SeaFreightDetail', {
				routeId,
				feederRouteId,
        feederPolCname,
        feederPolEname,
			})
		},

		// 远程排序
		handleSort() {
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
			let result = ['routeId', 'sameFlagCode', 'feederRouteId', 'recommendLevel']
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
    // 自定义复制模板关闭回调
    copyColumnsClose (action, value) {
      this.showCopyColumns = false
      if (action === 'Confirm') {
        this.copyColumns = value
        window.localStorage.setItem('copyColumns', JSON.stringify(value))
      }
    },
		// 复制
		handleCopy(row, index, e) {
			let rowString = ''
			let cloumnArray = []
      let {allColumns, columns} =  this.tableConfig
      if (this.copyColumns.length) {
        this.copyColumns.forEach(item => {
          let base = allColumns.filter(ele => ele.prop === item)[0]
          cloumnArray.push(base)
        })
      } else {
        cloumnArray = columns
      }
      let props = cloumnArray.map(item => item.prop).includes('schedule')
      if (props) {
        cloumnArray = cloumnArray.filter(item => !['carrierService', 'voyage'].includes(item.prop))
      }
			cloumnArray.map(item => {
        if (!row[item.prop]) {
          return 
        }
				if (item.prop == 'surchargeList') {
					if (row[item.prop].length) {
						rowString += '附加费:'
						row[item.prop].map(surChargeitem => {
							rowString += surChargeitem['chargeName'] + '(' + surChargeitem['chargeCode'] + ')'
							if (surChargeitem['rateUnit'] == 'container_type') {
								rowString += (surChargeitem['priceGp20'] ? surChargeitem['priceGp20'] : '-') + '/'
								rowString += (surChargeitem['priceGp40'] ? surChargeitem['priceGp40'] : '-') + '/'
								rowString += (surChargeitem['priceHq40'] ? surChargeitem['priceHq40'] : '-') + '/'
								rowString += (surChargeitem['priceHq45'] ? surChargeitem['priceHq45'] : '-') + '/'
								rowString += (surChargeitem['priceNor20'] ? surChargeitem['priceNor20'] : '-') + '/'
								rowString += surChargeitem['priceNor40'] ? surChargeitem['priceNor40'] : '-'
							} else {
								rowString += surChargeitem['price']
							}
							rowString += '(' + surChargeitem['currency'] + '),'
						})
						rowString += '\n'
					}
				} else if (item.prop == 'polEname') {
          rowString += item.label + ':' + row['polEname'] + '(' + row['polCname'] + ')' + ',\n'
        } else if (item.prop == 'podEname') {
          rowString += item.label + ':' + row['podEname'] + '(' + row['podCname'] + ')' + ',\n'
        } else if (item.prop == 'feederPolCode') {
          rowString += item.label + ':' + row['feederPolEname'] + '(' + row['feederPolCname'] + ')' + ',\n'
        } else if (item.prop == 'unloadingPortCode') {
          rowString += item.label + ':' + row['unloadingPortEname'] + '(' + row['unloadingPortCname'] + ')' + ',\n'
        } else if (item.prop == 'transitPort1Code') {
          rowString += item.label + ':' + row['transitPort1Ename'] + '(' + row['transitPort1Cname'] + ')' + ',\n'
        } else if (item.prop == 'priceGp20' || item.prop == 'priceGp40' || item.prop == 'priceHq40' || item.prop == 'priceHq45' || item.prop == 'priceNor20' || item.prop == 'priceNor40') {
					rowString += item.label + ':'+ row[item.prop+'Desc'] + ';\n'
				} else if (item.prop == 'mainRouteTransferMode') {
					rowString += item.label + ':' + (row[item.prop] ? row[item.prop] : '--') + ',\n'
				} else if (item.prop === 'schedule') {
          let { feederPolEname, polEname, schedule, carrierService, voyage } = row
          let str = ''
          if (feederPolEname) {
            str = `${feederPolEname} VIA `
          }
          let [sta, end] = schedule.split('/') || []
          let week = ['一','二','三','四','五','六','日',]
          str += `${polEname} 周${week[sta - 1]}截关 周${week[end - 1]}开船 ${carrierService? `(${carrierService})`:''} ${voyage}天`
          rowString += item.label + ':' + str + ',\n'
        } else {
					rowString += item.label + ':' + (row[item.prop] ? row[item.prop] : '--') + ',\n'
				}
			})
      if (!rowString) {
        rowString = ' '
      }
			clip(rowString, e)
		},
		clipboardSuccess() {
			this.$message({
				message: '复制成功',
				type: 'success',
				duration: 1500
			})
		},

		// 生成订单
		handleCreate(row) {
			this.createOrderPopShow = true
			this.routeId = row.routeId
			this.feederRouteId = row.feederRouteId
			this.isFeederRoute = row.feederPolCode ? 'y' : 'n'
		},

		// 新建订单关闭回调
		createOrderPopClose(action, value, includeFeederType) {
			if (action === 'Confirm') {
				this.handleCreateOrder(value, includeFeederType)
			} else {
				this.createOrderPopShow = false
			}
		},

		// 新建订单保存
		handleCreateOrder(value, includeFeederType) {
			Object.assign(value, {
				routeId: this.routeId,
				feederRouteId: this.feederRouteId
			})
			delete value.sailingDate
			orderChargeCreate(value).then(res => {
				let { orderNo, serviceType } = res.data
				sessionStorage.setItem('createOrderStr', JSON.stringify(res.data))
				this.createOrderPopShow = false
				this.isJumpRouteFromPage = true
				// this.$router.push({
				// 	name: 'OrderDetail',
				// 	params: {
				// 		orderNo
				// 	},
				// 	query: {
				// 		orderNo,
				// 		source: 'seaFreight',
				// 		action: 'add',
				// 		includeFeeder: includeFeederType,
				// 		showContainer: !['st03', 'st04'].includes(serviceType),
				// 		showBl: ['st01', 'st03'].includes(serviceType)
				// 	}
				// })
				let routeUrl = this.$router.resolve({
					name: 'OrderDetail',
					params: {
						orderNo
					},
					query: {
						orderNo,
						source: 'seaFreight',
						action: 'add',
						includeFeeder: includeFeederType,
						showContainer: !['st03', 'st04'].includes(serviceType),
						showBl: ['st01', 'st03'].includes(serviceType)
					}
				})
				window.open(routeUrl.href, '_blank')
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
    // 渲染水印
    reloadWathermark () {
      // 删除之前的水印
      document.querySelector('.water-mark-box').innerHTML = ''
      // 重新渲染水印
      let userInfo = this.$store.state.user.userInfo
      let { deptName, userName, mobileNo = '', employeeNo } = userInfo
      let text = `${userName}_${employeeNo}`
      watermark({
        watermark_txt: text, 
        className:'water-mark-box', 
        watermark_zindex: 6,
      })
		}
	},
  mounted() {
    // 初始化水印
    this.reloadWathermark()
    // 监听缩放重新渲染水印
		window.addEventListener('resize', this.reloadWathermark)
		// 清除复制时，剪贴板保留的样式
		window.addEventListener('copy', function(event) {
			let clipboardData = event.clipboardData || window.clipboardData
			if (!clipboardData) {
				return
			}
			let text = window.getSelection().toString();
			if (text) {
				event.preventDefault()
				clipboardData.setData('text/plain', text)
			}
		})
  },
  beforeDestroy () {
		window.removeEventListener('resize', this.reloadWathermark)
		window.removeEventListener('copy')
  },
}
</script>

<style lang="scss" scoped>
.seaFreight{
  // user-select: none;
}
.seaFreight .el-table__expand-icon {
	display: block !important;
	position: absolute;
	top: 8px;
}
.table-layout.seaFreight .column-text {
	display: block;
}
.table-layout.seaFreight .el-table__placeholder + .column-text{
	display: inline-block;
}
.seaFreight .el-table__row--level-1 {
	background-color: #e7eeff !important;
}
#sea-freight-table{
	/deep/ .vxe-table--render-default{
		tr {
			td {
				padding-top: 0px;
				padding-bottom: 0px;
				// height: 36px !important;
				// &.td-hasChildren {
				// 	position: relative;
				// 	&::before {
				// 		content: '';
				// 		position: absolute;
				// 		top: -1px;
				// 		left: 0;
				// 		width: 100%;
				// 		height: 1px;
				// 		background-color: #3E80F5;
				// 		z-index: 2;
				// 	}
				// 	&::after {
				// 		content: '';
				// 		position: absolute;
				// 		bottom: 0;
				// 		left: 0;
				// 		width: 100%;
				// 		height: 1px;
				// 		background-color: #3E80F5;
				// 		z-index: 2;
				// 	}
				// }
			}
			&:first-child {
				td {
					// &.td-hasChildren {
					// 	&::before {
					// 		top: 0;
					// 	}
					// }
				}
			}
			.vxe-cell {
				line-height: 16px;
			}
		}
		.vxe-tree-cell{
			padding-left: 2em;
		}
		.vxe-cell--tree-node {
			.vxe-tree--btn-wrapper {
				left: -8px;
				z-index: 10;
				&::before {
					content: "展开";
					display: block;
					position: absolute;
					left: 12px;
					color: #3E80F5;
					line-height: 12px;
				}
				.vxe-tree--node-btn {
					color: #3E80F5;
				}
			}
			&.is--active {
				.vxe-tree--btn-wrapper {
					&::before {
						content: "收起";
					}
				}
			}
		}
	}
}
/deep/ .vxe-table--render-default .vxe-cell--tree-node {
	position: inherit;
}
</style>
