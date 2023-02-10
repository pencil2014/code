<template>
	<div class="app-container">
		<SearchGroup :callback="searchCallBack" :tableQuery="tableQuery" />
		<div class="table-container" id="main-route-table">
			<TableFilter :config="tableConfig" :publishStatusOptions="publishStatusOptions" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
			<BaseTableMuti v-loading="loading" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
		</div>
		<!-- 自定义表头 -->
		<div v-if="customColumnsPopShow">
			<CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
		</div>
		<!-- 批量修改 -->
		<div v-if="multiEditPopShow">
			<MultiEdit @close="multiEditPopClose"/>
		</div>
		<!-- 附加费模板 -->
		<div v-if="editSurchargePopShow">
			<SurchargeEdit @close="surchargePopClose" :surchargeList="createItem.surchargeList" />
		</div>
	</div>
</template>
<script>
import Vue from 'vue'
import store from '@/store'
import { mapState } from 'vuex'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { getDictLabel } from '@/utils/tools'
import SearchGroup from './components/searchGroup'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
// 弹出框
import CustomColumns from '@/components/customColumns/index'
import MultiEdit from './components/multiEdit'
import SurchargeEdit from './components/surchargeEdit'
import TableColumnPopover from './components/tableColumnPopover'
import TableColumnPopoverPolPod from './components/tableColumnPopoverPolPod'

import { mainRouteList, mainRouteSave, mainRouteDelete, mainRouteInvalidRoute, mainRoutePublishBatch, mainRouteInvalidBatch, mainRouteMutiEdit, mainRouteInfo, mainRouteExport, mutiCopy } from '@/api/charge'
import { columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: [],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	state: 'unpublished'
}
export default {
	mixins: [routerMixin],
	data() {
		return {
			loading: true,
			state: '',
			defaultStyle: {
				width: '100%'
			},
			importId: this.$route.query.importId,
			// 编辑提交参数
			createItem: {
				oceanFreightList: [], // 海运费
				surchargeList: [] // 附加费
			},

			tableQuery: Object.assign({}, defaultTableQuery, defaultPage),

			// table复选框多选的值
			selectedCheckbox: [],
			// 保存的复选框多选
			saveSelectedCheckbox: [],

			// table基础组件
			tableConfig: {
				style: {},
				tableIndex: {
					show: true
				},
				options: {
					// 是否支持解锁列表修改
					lockState: true,

					// 是否支持列表项选中功能
					mutiSelect: true,

					// 多选框状态判断 {false不可选, true可选}
					checkSelectable({ routeId }) {
						return routeId || routeId === 0 ? true : false
					}
				},
				customColumns: {
					show: false,
					handleCustomColumns: this.handleCustomColumns
				},
				list: [],
				configColumns: [],
				columns: [],
				allColumns: [
					{
						prop: 'polEname',
						label: '大船起运港',
						// fixed: true,
						align: 'center',
						type: 'text',
						width: '100',
						// disabled: true,
						'header-align': 'center',
             sortable: 'custom',
						formatter: (row, column) => {
							let polStr = '<i class="recommend"></i><span>--</span>'
							let recommend = `<i class="recommend"></i>`
							if (row.polCode || row.podCode) {
								polStr = `${recommend}<div class="column-block underline">${row.polEname}(${row.polCname})</div>`
							}
							return polStr
						},
						method: (index, row) => {
							this.handleRouteInfo(index, row)
						}
					},
          {
						prop: 'podEname',
						label: '目的地',
						// fixed: true,
						align: 'center',
						type: 'text',
						width: '100',
						// disabled: true,
						'header-align': 'center',
             sortable: 'custom',
						formatter: (row, column) => {
							let polStr = '<span>--</span>'
							let recommend = ``
							if (row.polCode || row.podCode) {
								polStr = `${recommend}<div class="column-block underline">${row.podEname}(${row.podCname})</div>`
							}
							return polStr
						},
						method: (index, row) => {
							this.handleRouteInfo(index, row)
						}
					},
          {
            prop: 'podCountryCname',
            label: '目的港国家',
            type: 'text',
						width: '100',
            sortable: 'custom',
          },
					{
						prop: 'shipCarrierCode',
						label: '船司',
						cname: '',
						type: 'text',
						width: '100',
             sortable: 'custom',
						// formatter: (row, column) => {
						// 	return row.shipCarrierCode ? `<span class="column-span">${row.shipCarrierCode}</span>` : '<span>--</span>'
						// }
            formatter: (row, column) => {
              let code = row.shipCarrierCode
              let str= `<i class="icon-tip icon-stop">停</i>`
						  return row.blankSailing === 'Y' ? (str+code) : code
						}
					},
					{
						prop: 'shipTerms',
						label: '运输条款',
						type: 'select',
						width: '100',
						cname: '',
						data: [],
						nonDictionary: true,
             sortable: 'custom',
						formatter: (row, column) => {
							return row.shipTerms ? getDictLabel('shipTerms', row.shipTerms) : '--'
						},
						change: (val, row) => {
							Object.assign(row, {
								shipTerms__save: val
							})
						}
					},
					{
						prop: 'sysLineCname',
						cname: '',
						label: '系统航线',
						width: '100',
						type: 'autocomplete',
            sortable: 'custom',
						formatter: (row, column) => {
							return row.sysLineCname ? row.sysLineCname : '--'
						},
						querySearch: (queryString, cb, row) => {
							Object.assign(row, {
								sysLineCode: ''
							})
							this.sysLineQuerySearch(queryString, cb)
						},
						change: (val, row) => {
							Object.assign(row, {
								sysLineCode__save: val
							})
						},
						select: (item, row) => {
							Object.assign(row, {
								sysLineCode: item.key,
								sysLineCode__save: item.key
							})
						}
					},
					{
						prop: 'transitPort1Code',
						label: '中转港',
						width: '200',
             sortable: 'custom',
						formatter: (row, column) => {
							return row.transitPort1Ename && row.transitPort2Ename && row.transitPort3Ename
								? `<span class="column-span">${row.transitPort1Ename}(${row.transitPort1Cname})&nbsp;${row.transitPort2Ename}(${row.transitPort2Cname})&nbsp;
              ${row.transitPort3Ename}(${row.transitPort3Cname})</span>`
								: row.transitPort1Ename
								? `<span class="column-span">${row.transitPort1Ename}(${row.transitPort1Cname})</span>`
								: row.transitPort2Ename
								? `<span class="column-span">${row.transitPort2Ename}(${row.transitPort2Cname})</span>`
								: row.transitPort3Ename
								? `<span class="column-span">${row.transitPort3Ename}(${row.transitPort3Cname})</span>`
								: '<span>--</span>'
						},
						type: 'text'
						// type: 'remoteSelect',
						// multiple: true, reserveKeyword:true,'collapse-tags': true, data: [], nonDictionary: true,
						// visibleChange: (val, item) => {
						//   this.portSearch('', 'port_of_basic', this.state, 'transitPort1Code', item)
						// }, filterMehod: (val, item) => {
						//   this.portSearch(val, 'port_of_basic', this.state, 'transitPort1Code', item)
						// }, change(val, row) {
						//   Object.assign(row, {
						//     transitPortCodes__save: val.toString()
						//   })
						// }
					},
					{
						prop: 'cutoffDate',
						label: '截文件',
						sortable: 'custom',
						type: 'input',
						width: '100',
						formatter: (row, column) => {
							return row.cutoffDate ? row.cutoffDate : '--'
						},
						change: (val, row) => {
							Object.assign(row, {
								cutoffDate__save: val
							})
						}
					},
					{
						prop: 'pricerName',
						label: '拿价人',
						type: 'remoteSelect',
						width: '100',
						data: [],
						nonDictionary: true,
             sortable: 'custom',
						formatter: (row, column) => {
							return row.pricerName ? row.pricerName : '--'
						},
						visibleChange: (val, row, item) => {
							this.pricerQuerySearch('', item)
						},
						filterMehod: (val, item) => {
							this.pricerQuerySearch(val, item)
						},
						change: (val, row, item) => {
							let itemData = item.data.filter(ele => ele.value === val)
							Object.assign(row, {
								pricerName__save: itemData[0].label,
								pricer__save: val
							})
						}
					},
					{
						prop: 'surchargeDesc',
						label: '附加费说明',
						type: 'input',
						width: '100',
            sortable: 'custom',
						formatter: (row, column) => {
							return row.surchargeDesc ? row.surchargeDesc : '--'
						},
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
							let result = row.priceGp20Desc ?  row.priceGp20Desc : '--'
							return row.weightPriceGp20 ? `<span class="column-span">${result}<br/>+限重费</span>` : `<span class="column-span">${result}</span>`
						}
					},
					{
						prop: 'priceGp40',
						label: '40GP',
						sortable: 'custom',
						width: '120',
						type: 'text',
						width: '100',
						formatter: (row, column) => {
							let result =  row.priceGp40Desc ?  row.priceGp40Desc : '--'
							return row.weightPriceGp40 ? `<span class="column-span">${result}<br/>+限重费</span>` : `<span class="column-span">${result} </span>`
						}
					},
					{
						prop: 'priceHq40',
						label: '40HQ',
						sortable: 'custom',
						type: 'text',
						width: '100',
						formatter: (row, column) => {
							let result = row.priceHq40Desc ?  row.priceHq40Desc : '--'
							return row.weightPriceHq40 ? `<span class="column-span">${result}<br/>+限重费</span>` : `<span class="column-span">${result}</span>`
						}
					},
					{
						prop: 'priceHq45',
						label: '45HQ',
						sortable: 'custom',
						type: 'text',
						width: '100',
						formatter: (row, column) => {
							let result = row.priceHq45Desc ?  row.priceHq45Desc : '--'
							return row.weightPriceHq45 ? `<span class="column-span">${result}<br/>+限重费</span>` : `<span class="column-span">${result}</span>`
						}
					},
					{
						prop: 'priceNor20',
						label: '20NOR',
						sortable: 'custom',
						type: 'text',
						width: '90',
						formatter: (row, column) => {
							let result = row.priceNor20Desc ?  row.priceNor20Desc : '--'
							return row.weightPriceHq45 ? `<span class="column-span">${result}<br/>+限重费</span>` : `<span class="column-span">${result}</span>`
						}
					},
					{
						prop: 'priceNor40',
						label: '40NOR',
						sortable: 'custom',
						type: 'text',
						width: '90',
						formatter: (row, column) => {
							let result = row.priceNor40Desc ?  row.priceNor40Desc : '--'
							return row.weightPriceHq45 ? `<span class="column-span">${result}<br/>+限重费</span>` : `<span class="column-span">${result}</span>`
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
            prop: 'weightDesc',
            label: '限重说明',
						type: 'text',
						value: '',
            width: '100',
            sortable: 'custom',
          },
					{
						prop: 'schedule',
						label: '船期',
						sortable: 'custom',
						type: 'input',
						value: '',
						width: '100',
						formatter: (row, column) => {
							return row.schedule ? row.schedule : '--'
						},
						change: (val, row) => {
							Object.assign(row, {
								schedule__save: val
							})
						}
					},
					{
						prop: 'effectiveType',
						label: '有效类别',
						// sortable: true,
             sortable: 'custom',
						type: 'select',
						value: '',
						width: '100',
						formatter: (row, column) => {
							return row.effectiveType ? getDictLabel('effectiveType', row.effectiveType) : '--'
						},
						change: (val, row) => {
							Object.assign(row, {
								effectiveType__save: val
							})
						}
					},
					{
						prop: 'blType',
						label: '提单类型',
						// sortable: true,
             sortable: 'custom',
						type: 'select',
						value: '',
						width: '90',
						formatter: (row, column) => {
							return row.blType ? getDictLabel('blType', row.blType) : '--'
						},
						change: (val, row) => {
							Object.assign(row, {
								blType__save: val
							})
						}
					},
					{
						prop: 'issueWay',
						label: '出单方式',
						// sortable: true,
             sortable: 'custom',
						type: 'select',
						value: '',
						width: '90',
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
							// return row.issueWay ? getDictLabel('issueWay', row.issueWay) : '--'
						},
						change: (val, row) => {
							Object.assign(row, {
								issueWay__save: val
							})
						}
					},
					{
						prop: 'attention',
						label: '特别提醒',
						// sortable: true,
             sortable: 'custom',
						type: 'input',
						width: '150',
						formatter: (row, column) => {
							return row.attention ? row.attention : '--'
						},
						change: (val, row) => {
							Object.assign(row, {
								attention__save: val
							})
						}
					},
					{
						prop: 'voyage',
						label: '航程',
						type: 'input',
						width: '100',
             sortable: 'custom',
						formatter: (row, column) => {
							return row.voyage ? row.voyage : '--'
						},
						change: (val, row) => {
							Object.assign(row, {
								voyage__save: val
							})
						}
					},
					{
						prop: 'feederPolCode',
						label: '驳船收货地',
						width: '150',
						// popOverProp: 'portList',
						// popoverComponent: TableColumnPopoverPolPod,
						nonDictionary: true,
						type: 'remoteSelect',
            sortable: 'custom',
						formatter: (row, column) => {
							return row.feederPolEname ? `<span class="column-span">${row.feederPolEname}</span>` : '<span>--</span>'
						}
						// type: 'remoteSelect',
						// disabled: true,
						// multiple: true, reserveKeyword:true,'collapse-tags': true, data: [], nonDictionary: true,
						// formatter: (row, column) => {
						//   return row.feederPolCode? `<span class="column-span">${row.feederPolEname}(${row.feederPolCname})</span>`
						//   : '<span>--</span>'
						// },
						// visibleChange: (val, item) => {
						//   this.portSearch('', 'port_of_feeder', this.state,'feederPolCode', item)
						// }, filterMehod: (val, item) => {
						//   this.portSearch(val, 'port_of_feeder', this.state,'feederPolCode', item)
						// }, change: (val, row, item) => {
						//   Object.assign(row, {
						//     feederPolCode__save: val.toString()
						//   })
						// }
					},
          {
            prop: 'feederPolCityCname',
            label: '驳船收货地城市',
						width: '150',
            sortable: 'custom',
            type: 'text'
          },
					{
						prop: 'unloadingPortCode',
						label: '卸货港',
						type: 'remoteSelect',
						width: '150',
						nonDictionary: true,
             sortable: 'custom',
						formatter: (row, column) => {
							return row.unloadingPortCode ? `<span class="column-span">${row.unloadingPortEname}(${row.unloadingPortCname})</span>` : '<span>--</span>'
						},
						visibleChange: (val, row, item) => {
							console.log(val, row, item)
							this.portSearch('', 'port_of_discharge', 'valid', 'unloadingPortCode', item)
						},
						filterMehod: (val, item) => {
							this.portSearch(val, 'port_of_discharge', 'valid', 'unloadingPortCode', item)
						},
						change: (val, row, item) => {
							Object.assign(row, {
								unloadingPortCode__save: val
							})
						}
						// querySearch: (queryString, cb, row) => {
						//   debugger
						//   Object.assign(row, {
						//     unloadingPortCode: ''
						//   })
						//   this.polQuerySearch(queryString, 'port_of_discharge', this.state, cb)
						// },
						// change: (val, row) => {
						//   Object.assign(row, {
						//     unloadingPortCode__save: val
						//   })
						// },
						// select: (item, row) => {
						//   Object.assign(row, {
						//     unloadingPortCode__save: item.key
						//   })
						// }
					},
					{
						prop: 'beginDate',
						label: '有效期(开始)',
						// sortable: true,
						type: 'date',
						width: '120',
						category: 'date',
						format: 'yyyy-MM-dd',
            sortable: 'custom',
						// formatter: (row, column) => {
						// 	return row.beginDate || row.endDate ? `<span class="column-span">${row.beginDate}<br>~${row.endDate}</span>` : '--'
						// },
						change: (val, row) => {
							Object.assign(row, {
								beginDate__save: val
							})
						}
					},
          {
            prop: 'endDate',
						label: '有效期(结束)',
						// sortable: true,
						type: 'date',
						width: '120',
						category: 'date',
						format: 'yyyy-MM-dd',
            sortable: 'custom',
						// formatter: (row, column) => {
						// 	return row.beginDate || row.endDate ? `<span class="column-span">${row.beginDate}<br>~${row.endDate}</span>` : '--'
						// },
						change: (val, row) => {
							Object.assign(row, {
								endDate__save: val
							})
						}
          },
					{
						prop: 'bkgAgentId',
						label: '订舱代理',
						type: 'remoteSelect',
						width: '100',
             sortable: 'custom',
						formatter: (row, column) => {
							return row.bkgAgent ? row.bkgAgent : '--'
						},
						visibleChange: (val, row, item) => {
							this.getSupplierList('bkg_agent', '', item)
						},
						filterMehod: (val, item) => {
							this.getSupplierList('bkg_agent', val, item)
						},
						change: (val, row, item) => {
							Object.assign(row, {
								bkgAgentId__save: val
							})
						}
					},
					{
						prop: 'carrierLineName',
						label: '承运人航线',
						type: 'autocomplete',
						width: '100',
             sortable: 'custom',
						formatter: (row, column) => {
							return row.carrierLineName ? row.carrierLineName : '--'
						},
						querySearch: (queryString, cb, row) => {
							Object.assign(row, {
								carrierLineCode: ''
							})
							this.sysLineQuerySearch(queryString, cb)
						},
						change: (val, row) => {
							Object.assign(row, {
								carrierLineCode__save: val
							})
						},
						select: (item, row) => {
							Object.assign(row, {
								carrierLineCode: item.key,
								carrierLineCode__save: item.key
							})
						}
					},
					{
						prop: 'carrierService',
						label: '航线代码',
						type: 'input',
						width: '100',
             sortable: 'custom',
						formatter: (row, column) => {
							return row.carrierService ? row.carrierService : '--'
						},
						change: (val, row) => {
							Object.assign(row, {
								carrierService__save: val
							})
						}
					},
					{
						prop: 'cargoLimited',
						label: '限定货物',
						width: '100',
						type: 'input',
             sortable: 'custom',
						formatter: (row, column) => {
							return row.cargoLimited ? row.cargoLimited : '--'
						},
						change: (val, row) => {
							Object.assign(row, {
								cargoLimited__save: val
							})
						}
					},
					{
						prop: 'sailingDate',
						label: '开航日',
						type: 'date',
						width: '100',
						format: 'yyyy-MM-dd',
             sortable: 'custom',
						formatter: (row, column) => {
							return row.sailingDate ? row.sailingDate : '--'
						},
						change: (val, row) => {
							Object.assign(row, {
								sailingDate__save: val
							})
						}
					},
					{
						prop: 'allin',
						label: '是否ALLIN',
						type: 'text',
						width: '100',
             sortable: 'custom',
						formatter: (row, column) => {
							return row.allin ? this.$t(`dict.allin.${row.allin}`) : '--'
						}
					},
					{
						prop: 'internalDesc',
						label: '内部备注',
						width: '150',
						type: 'input',
             sortable: 'custom',
						formatter: (row, column) => {
							return row.internalDesc ? row.internalDesc : '--'
						},
						change: (val, row) => {
							Object.assign(row, {
								internalDesc__save: val
							})
						}
					},
					{
						prop: 'freeTimeDesc',
						label: '免用免堆',
						type: 'input',
						width: '150',
             sortable: 'custom',
						formatter: (row, column) => {
							return row.freeTimeDesc ? row.freeTimeDesc : '--'
						},
						change: (val, row) => {
							Object.assign(row, {
								freeTimeDesc__save: val
							})
						}
					},
					{
						prop: 'guidanceDesc',
						label: '收货指引',
						width: '150',
						type: 'input',
             sortable: 'custom',
						formatter: (row, column) => {
							return row.guidanceDesc ? row.guidanceDesc : '--'
						},
						change: (val, row) => {
							Object.assign(row, {
								guidanceDesc__save: val
							})
						}
					},
					{
						prop: 'issueWayDesc',
						label: '出单方式备注',
						width: '150',
						type: 'input',
             sortable: 'custom',
						formatter: (row, column) => {
							return row.issueWayDesc ? row.issueWayDesc : '--'
						},
						change: (val, row) => {
							Object.assign(row, {
								issueWayDesc__save: val
							})
						}
					},
					{
						prop: 'podChargeDesc',
						label: '目的港收费标准参考',
						width: '150',
						type: 'input',
						sortable: 'custom',
						formatter: (row, column) => {
							return row.podChargeDesc ? row.podChargeDesc : '--'
						},
						change: (val, row) => {
							Object.assign(row, {
								podChargeDesc__save: val
							})
						}
					},
					{
						prop: 'feederMatchMode',
						label: '驳船匹配',
						width: '100',
						type: 'select',
             sortable: 'custom',
						formatter: (row, column) => {
							return row.feederMatchMode ? getDictLabel('feederMatchMode', row.feederMatchMode) : '--'
						},
						change: (val, row) => {
							Object.assign(row, {
								feederMatchMode__save: val
							})
						}
					},
					{
						prop: 'mainRouteTransferMode',
						label: '中转方式',
						type: 'select',
						nonDictionary: 'true',
						value: '',
						width: '100',
             sortable: 'custom',
						formatter: (row, column) => {
							return row.mainRouteTransferMode ? getDictLabel('mainRouteTransferMode', row.mainRouteTransferMode) : '--'
						},
						change: (val, row) => {
							Object.assign(row, {
								mainRouteTransferMode__save: val
							})
						}
					},
					{
						prop: 'maintainerId',
						label: '维护人',
						sortable: 'custom',
						type: 'text',
						width: '100',
						formatter: (row, column) => {
							return row.maintainerId ? row.maintainerName : '--'
						}
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
          }
				],

				// 批量操作按钮
				multiOperate: [
					{
						label: '批量修改',
						action: 'MultiEdit'
					},
					// {
					// 	label: '批量发布',
					// 	action: 'MultiPublish'
					// },
					{
						label: '批量失效',
						action: 'MultiInvalid'
					},
					{
						label: '批量删除',
						action: 'MultiDelete'
					},
          {
            label: '批量复制',
						action: 'MultiCopy' 
          }
				],

				// 操作按钮组
				operationBtns: {
					minWidth: '120',
					fixed: 'right',
					show: true,
          resizable: true,
					callback: (action, $index, row, item) => {
						if (action === 'Edit') {
							this.handleEdit(row)
						}

						if (action === 'SingleEdit') {
							this.handleSingleEdit(row)
						}

						if (action === 'Copy') {
							this.handleCopy(row)
						}
						if (action === 'Delete') {
							let routeIdList = [row.routeId]
							this.handleDelete(routeIdList)
						}
					},
					data: [
						{
							label: '保存',
							type: 'text',
							show: false,
							action: 'SingleEdit'
						},
						{
							label: '编辑',
							type: 'text',
							show: true,
							className: 'orange',
							action: 'Edit'
						},
						{
							label: '复制',
							type: 'text',
							show: true,
							action: 'Copy'
						},
						{
							label: '删除',
							type: 'text',
							show: true,
							className: 'red',
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
			// 显示批量修改的弹窗状态
			multiEditPopShow: false,
			// 附加费修改的弹窗状态
			editSurchargePopShow: false,
			isClickInfo: false
		}
	},
	beforeRouteLeave(to, from, next) {
		sessionStorage.removeItem('routeImportToMainRoute')
		next()
	},
	beforeRouteEnter(to, from, next) {
	  if (from.name == 'RouteImport') {
			to.meta.isUseCache = false
	  } else {
	    to.meta.isUseCache = true
	  }
	  next();
	},
	destroyed() {
    sessionStorage.removeItem('routeImportToMainRoute')
  },
	created() {
		this.getList()
		//每次加载如果又去发布按钮标记 默认未发布tab
		//this.$store.dispatch('dict/baseShippingCarrierList')
	},
	mounted() {
		console.log(this.dictMap)
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			publishStatus: state => state.dict.dictMap.publishStatus,
			mainRoute: state => state.charge.mainRoute,
			defaultColumns: state => state.charge.mainRoute.defaultColumns,
			specialColumns: state => state.charge.mainRoute.specialColumns,
			columnsBase: state => state.charge.mainRoute.columnsBase
		}),
		publishStatusOptions() {
			let publishStatusOptions = {}
			this.publishStatus.forEach(item => {
				publishStatusOptions[item.value] = item.label
			})
			return publishStatusOptions
		}
	},
	components: {
		SearchGroup,
		BaseTableMuti,
		TableFilter,
		CustomColumns,
		MultiEdit,
		SurchargeEdit,
		TableColumnPopover,
		TableColumnPopoverPolPod
	},
	methods: {
     // 批量复制
   handleMultiCopy () {
      if(!this.selectedCheckbox.length) {
        return this.$message.error('请先选择运价数据')
      }
      this.$confirmWarn('确定复制这些数据吗？', () => {
        let data = {
          routeIds: this.getRouteIds()
        }
        mutiCopy(data).then(res => {
          this.saveSelectedCheckbox = res.data
          this.$msgSucClose('复制数据成功！')
          this.tableQuery.currPage = 1 
          this.getList()
        }).catch(()=>{})
      })
   },
		// 拿价人
		pricerQuerySearch(queryString, item) {
			let params = {}
			Object.assign(params, {
				name: queryString,
				state: 'valid'
			})
			this.$store.dispatch('dict/employeeSelectlist', params).then(data => {
				item.data = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
			})
		},

		// 起运港下拉列表自动补充的数据
		polQuerySearch(queryString, portAttribute, state, cb) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				cb(data)
			})
		},
		polCityQuerySearch(queryString, state, cb) {
			this.$store.dispatch('dict/basePortCityList', { queryString, state }).then(data => {
				cb(data)
			})
		},

		// 获取订舱代理
		getSupplierList(type, queryString, item) {
			this.$store.dispatch('dict/querySupplierList', { category: type, queryString: queryString }).then(data => {
				if (data.list && data.list.length) {
					item.data = data.list.map(ele => {
						return Object.assign(ele, {
							label: this.$language == 'en' ? ele.ename : ele.name,
							value: ele.supplierId
						})
					})
				} else {
					item.data = []
				}
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

		// 中转港下拉数据
		transitPortSearch(val, portAttribute, state, row) {
			this.$store.dispatch('dict/basePortList', { val, portAttribute, state }).then(data => {
				let transitPortList = data.map(item => {
					return Object.assign(item, {
						label: item.value,
						value: item.key
					})
				})
				// this.filterGroups.transitPortCodes.data = transitPortList
				if (row) {
					row.data = transitPortList
				}
				console.log(row.data)
			})
		},

		// 系统航线下拉列表自动补充的数据
		sysLineQuerySearch(queryString, cb) {
			this.$store.dispatch('dict/baseSystemLineList', { name: queryString, state: 'valid' }).then(data => {
				cb(data)
			})
		},

		// 船公司下拉列表自动补充的数据
		shipQuerySearch(queryString, cb) {
			this.$store.dispatch('dict/baseShippingCarrierList', { name: queryString, state: '' }).then(data => {
				cb(data)
			})
		},

		// 运输条款下拉列表自动补充的数据
		shipTermsQuerySearch(queryString, cb) {
			this.$store.dispatch('dict/baseShipTermsList').then(data => {
				cb(data)
			})
		},

		searchCallBack(action) {
			if (action === 'Search') {
				this.getList()
			}
			if (action === 'Reset') {
				this.getList()
				Object.assign(this.tableConfig, { tips: { text: '', show: false } })
			}
		},

		// 获取列表请求参数
		getListQuery() {
			let importId = { column: 'importId', type: 'eq', value: this.$route.query.importId }
			let publishStatusQuery = [{ column: 'state', type: 'eq', value: this.tableQuery.state }]

			// 合并发布状态参数
			let data = {}
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(publishStatusQuery)
			})
			if (this.$route.query.importId) {
				data.query.push(importId)
			}
			delete data.state
			return data
		},

		// 列表数据
		async getList() {
			this.loading = true
			let data = this.getListQuery()
      let res = await columnWidthConfigInfo({
        scenesCode: this.$route.name
      })
			let { columnWidthList } =res.data
			mainRouteList(data)
				.then(response => {
					let { list, totalCount, allColumns, configColumns } = response.data
					let portCodeArr = []
					let portCodes = ''
					// 特殊处理，table编辑时，运输条款、系统航线需要返显,有效期显示数组
					list.forEach(item => {
						item.unloadingPortCode ? portCodeArr.push(item.unloadingPortCode) : ''
						Object.assign(item, {
							shipTerms__autocompleteValue: this.dictMap.shipTerms[item.shipTerms],
							sysLineCname__autocompleteValue: item.sysLineCname,
							carrierLineName__autocompleteValue: item.carrierLineName,
							beginDate__dateValue: [item.beginDate, item.endDate],
							sailingDate__dateValue: item.sailingDate
							// unloadingPortCode__autocompleteValue: `${item.unloadingPortEname}(${item.unloadingPortCname})`
						})
						// 设置推荐位row的样式
						if (item.recommendLevel === 'Y' && item.publishStatus === 'published') {
							Object.assign(item, { isRecommendRow: true })
						}
						// 已失效tab下的table都设置为false
						if (this.tableQuery.state === 'invalid') {
							Object.assign(item, { isRecommendRow: false })
						}
					})
					portCodes = portCodeArr.join(',')
					this.$store.dispatch('dict/basePortListByCodes', { portCodes }).then(data => {
						// this.tableConfig.allColumns.forEach((item, index) => {
						//   if (item.key === 'unloadingPortCode') {
						//     item.data = data
						//   }
						// })
						list.forEach(item => {
							Object.assign(item, {
								unloadingPortCode__selectData: data
							})
						})
					})
					console.log('list', list)
					// console.log('selected-row', this.saveSelectedCheckbox)
					this.tableConfig.list = list.map(item => {
						if (this.saveSelectedCheckbox && this.saveSelectedCheckbox.includes(item.routeId)) {
							item.selected = 'Y'
						}
            if (item.blankSailing === 'Y') {
              item._isInvalid = true
            }
						return {...item}
					})
					console.log('this.tableConfig.list', this.tableConfig.list)
					this.tableConfig.pagination.total = totalCount
					this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
            this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
            this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
            this.tableConfig.pagination.isLastPage = response.data.isLastPage
            this.tableQuery.currPage = response.data.currPage
            this.tableQuery.pageSize =  response.data.pageSize
					  this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns
					this.handleFilterColumns(this.tableConfig.configColumns)
          this.tableConfig.columns.map(item => {
						// 取服务器返回的宽度
						let findItem = columnWidthList.find(ele => ele.column === item.prop)
						let newWidth = findItem ? findItem.width : ''
						return Object.assign(item, { width: newWidth || item.width })
					})
					this.tableColumnsWidthList = this.getTableColumnsWidth()
				})
				.finally(() => {
					this.loading = false
				})
		},

		// 新建
		handleAdd() {
			this.routerPush('MainRouteDetail')
		},

		// table导出
		handleExport() {
			let data = this.getListQuery()
			let routeIds = this.getRouteIds()
			if (routeIds.length > 0) {
				let routeIdQuery = { column: 'routeIds', type: 'eq', value: routeIds.join(',') }
				Object.assign(data, this.tableQuery, {
					query: this.tableQuery.query.concat(routeIdQuery)
				})
			}
			mainRouteExport(data).then(res => {
				this.downLoad(res.data.fileNo, res.data.name)
			})
		},

		downLoad(fileNo, fileName) {
			this.$store
				.dispatch('charge/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: fileNo
					}
				})
				.then(res => {
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = fileName
					link.click()
				})
		},
		// 点击批量修改
		handleMultiEdit(arr) {
			if (!this.selectedCheckbox.length) {
				return this.$message.error('请先选择运价数据')
			}
			this.multiEditPopShow = true
			this.tableConfig.options.lockState = true
		},

		// 批量发布
		handleMultiPublish() {
			if (!this.selectedCheckbox.length) {
				return this.$message.error('请先选择运价数据')
			}
			this.$confirmWarn('确定发布这些数据吗？', () => {
        let data = {
					routeIds: this.getRouteIds()
				}
				const loading = this.$loading()
				mainRoutePublishBatch(data)
					.then(response => {
						this.saveSelectedCheckbox = response.data
						this.$message({
							type: 'success',
							message: '发布成功',
							duration: 1000,
							onClose: () => {
								this.tableQuery.currPage = 1
								this.getList()
								loading.close()
							}
						})
					})
					.catch(err => {
						loading.close()
					})
      })
		},

		// 批量失效
		handleMultiInvalid() {
			if (!this.selectedCheckbox.length) {
				return this.$message.error('请先选择运价数据')
			}
			this.$confirmWarn('确定失效这些数据吗？', () => {
				let data = {
					routeIds: this.getRouteIds()
				}
				const loading = this.$loading()
				mainRouteInvalidBatch(data)
					.then(response => {
						this.saveSelectedCheckbox = response.data
						this.$message({
							type: 'success',
							message: '成功',
							duration: 1000,
							onClose: () => {
								this.tableQuery.currPage = 1
								this.getList()
								loading.close()
							}
						})
					})
					.catch(err => {
						loading.close()
					})
			})
		},
		// 批量删除
		handleMultiDelete() {
			if (!this.selectedCheckbox.length) {
				return this.$message.error('请先选择运价数据')
			}
			this.$confirmWarn('确定删除这些数据吗？', () => {
				let data = {
					routeIds: this.getRouteIds()
				}
				const loading = this.$loading()
				mainRouteDelete(data)
					.then(response => {
						this.saveSelectedCheckbox = response.data
						this.$message({
							type: 'success',
							message: '删除成功',
							duration: 1000,
							onClose: () => {
								this.tableQuery.currPage = 1
								this.getList()
								loading.close()
							}
						})
					})
					.catch(err => {
						loading.close()
					})
			})
		},

		// 切换列表锁定状态
		handleChangeLockState() {
			this.tableConfig.options.lockState = !this.tableConfig.options.lockState
			this.tableConfig.operationBtns.data.map(item => {
				// 解锁表格操作显示保存按钮
				if (item.action === 'SingleEdit') {
					// 解锁状态显示保存按钮
					if (!this.tableConfig.options.lockState) {
						Object.assign(item, {
							show: true
						})
					} else {
						Object.assign(item, {
							show: false
						})
						this.getList()
					}
				}
			})
		},

		// 自定义表头
		handleCustomColumns() {
			this.customColumnsPopShow = true
		},

		// 发布状态筛选
		handleSearchByPublishStatus() {
			this.tableConfig.operationBtns.data.map(item => {
				if (item.action === 'Delete') {
					if (this.tableQuery.state === 'unpublished'||this.tableQuery.state==='invalid') {
						// 解锁状态显示保存按钮
						Object.assign(item, {
							show: true
						})
					} else {
						Object.assign(item, {
							show: false
						})
					}
				}
			})
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
			}
			let routeImportToMainRoute = sessionStorage.getItem('routeImportToMainRoute')
			if (routeImportToMainRoute) {
				this.tableQuery.state = 'unpublished'
			}
			this.getList()
		},

		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			// Add、Export、CustomColumns、ChangeLockState、Muti、SizeChange、CurrentChange、SingleEdit
			// MultiEdit、 MultiPublish、MultiInvalid、MultiDelete
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},

		// 编辑附加费
		handleEditSurcharge(index, row) {
			mainRouteInfo({ routeId: row.routeId }).then(response => {
				Object.assign(this.createItem, {
					surchargeList: response.data.surchargeList,
					routeId: row.routeId
				})
				this.editSurchargePopShow = true
				// console.log('createItem:', this.createItem)
			})
		},

		// 快捷修改单条
		handleSingleEdit(row) {
			let data = {}
			for (let i in row) {
				if (i.indexOf('__save') > -1) {
					data[i.replace('__save', '')] = row[i]
				}
			}

			let time = data.beginDate
			data.beginDate = time ? time[0] : ''
			data.endDate = time ? time[1] : ''

			if (data.feederMatchMode !== undefined && !data.feederMatchMode) {
				return this.$message.error('驳船匹配为必填')
			}

			if (data.effectiveType !== undefined && !data.effectiveType) {
				return this.$message.error('生效类型为必填')
			}

			console.log(data)

			mainRouteSave(Object.assign(data, { routeId: row.routeId })).then(response => {
				this.$message({
					type: 'success',
					message: '修改成功',
					duration: 1000,
					onClose: () => {
						this.tableQuery.currPage = 1
						this.getList()
					}
				})
			})
		},
		handleRouteInfo(index, row) {
			this.handleEdit(row)
		},
		// 去编辑页
		handleEdit(row) {
			this.routerPush('MainRouteDetail', {
				id: row.routeId
			})
		},

		// 复制
		handleCopy(row) {
			this.routerPush('MainRouteDetail', {
				id: row.routeId,
				action: 'copy'
			})
		},
		// 删除
		handleDelete(routeIdList) {
			let data = {}
			this.$confirm('是否确认删除海运出口整箱 的数据项?', "警告", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				lockScroll: "true",
				type: "warning"
			}).then(() => {
				mainRouteDelete(Object.assign(data, { routeIds: routeIdList })).then(response => {
					this.$message({
						type: 'success',
						message: '删除成功',
						duration: 1000,
						onClose: () => {
							this.tableQuery.currPage = 1
							this.getList()
						}
					})
				})
			}).catch(function() {});
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
			console.log('tableColumns:', this.tableConfig.columns)
		},

		// 获取特殊处理的自定义表头，例：polCode,需要传polCode,polEname,polCname,podCode, podEname,podCname给后端
		getColumnsValues(value) {
			let result = ['routeId', 'recommendLevel']
			value.map(item => {
				if (this.specialColumns[item]) {
					result = result.concat(this.specialColumns[item])
				} else {
					result.push(item)
				}
			})

			result = Array.from(new Set(result))
			console.log('result', result)

			return result
		},

		// 自定义表头关闭回调
		customColumnsPopClose(action, value) {
			console.log(action, value)
			this.customColumnsPopShow = false
			if (action === 'Confirm') {
				let columnsKeys = this.getColumnsValues(value)
				console.log('columnsKeys', columnsKeys)

				Object.assign(this.tableQuery, {
					columns: columnsKeys
				})
				this.getList()
			}
		},

		// 批量修改关闭回调
		multiEditPopClose(action, value) {
			if (action === 'Confirm') {
				this.handleMultiEditSubmit(value)
			} else {
				this.multiEditPopShow = false
			}
		},

		// 获取table选中行的routeid
		getRouteIds() {
			let routeIds = []
			this.selectedCheckbox.forEach(item => {
				routeIds.push(item.routeId)
			})
			return routeIds
		},

		// 批量修改提交
		handleMultiEditSubmit(value) {
			let data = Object.assign(value, {
				routeIds: this.getRouteIds()
			})
			const loading = this.$loading()
			mainRouteMutiEdit(data)
				.then(response => {
					this.saveSelectedCheckbox = response.data
					this.$message({
						type: 'success',
						message: '修改成功',
						duration: 1000,
						onClose: () => {
							this.tableQuery.currPage = 1
							this.tableQuery.state = 'unpublished'
							this.multiEditPopShow = false
							this.getList()
							loading.close()
						}
					})
				})
				.catch(err => {
					loading.close()
				})
		},

		// 附加费修改关闭回调
		surchargePopClose(action, value) {
			let data = {}
			Object.assign(data, {
				surchargeList: value,
				routeId: this.createItem.routeId
			})
			this.editSurchargePopShow = false
			if (action === 'Confirm') {
				mainRouteSave(data).then(response => {
					this.$message({
						type: 'success',
						message: '保存成功',
						duration: 1000,
						onClose: () => {
							this.tableQuery.currPage = 1
							this.getList()
						}
					})
				})
			}
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
	}
}
</script>
<style lang="scss" scoped>
#main-route-table{
	/deep/ .vxe-table--render-default{
		tr {
			td {
				padding-top: 0px;
				padding-bottom: 0px;
				// height: 36px !important;
			}
			.vxe-cell {
				line-height: 16px;
			}
		}
	}
}
</style>
