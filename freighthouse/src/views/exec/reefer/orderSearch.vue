<template>
	<div class="finance-page">
		<FinanceSearch :searchOption="searchOption" @search="search" />
		<div style="height: 8px; background: #f8f9fd"></div>
		<div class="finance-list-container">
			<div v-if="isFirst" v-loading="isFirst"></div>
			<!-- v-else -->
			<FinanceTable :option="tableOption" :autoMax="true" />
		</div>
	</div>
</template>
<script>
import Vue from 'vue'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { orderListReefer, sapidList } from '@/api/exec/cosco'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin as mixin2 } from '@/views/finance/voucher/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { dateFormat } from '@/views/finance/utils/finance'
// 统一设置规则提醒
const ruleMsg = [{ required: true, message: '请填写内容', trigger: 'blur' }]
//订单状态
const orderStatuOptions = [
	{ label: '待审核', value: 'REVIEWING' },
	{ label: '已确认', value: 'CONFIRMED' },
	{ label: '已取消', value: 'CANCELED' }
]
let BOBJ = {} // 业务类型 对象
let SOBJ = {} // 服务模块 对象

export default {
	name: 'feeItemList',
	mixins: [mixin, mixin2, routerMixin],
	data() {
		return {
			sapid: '',
			// 列表页--表格配置
			tableOption: {},
			// 列表页--搜索配置
			searchOption: {},
			// 列表页--选中行
			multipleSelection: [],
			isFirst: true,

			//弹框标题
			title: '',
			//弹框开关
			open: false,
			action: '',
			// 查询条件
			tableQuery: {
				columns: [],
				query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
				currPage: 1,
				pageSize: 10
			},
			roleOptions: [],
			feeItemList: [],
			loading: false
		}
	},
	watch: {},
	// table基础组件
	components: {
		FinanceTable,
		FinanceSearch
	},
	async created() {
		this.isFirst = false
		// 搜索配置
		this.searchOption = {
			addFilter: {
				defaultSearchLength: 5,
				searchInputGroup: [
					{ key: 'sapid', value: '', showType: '5' },
					{ key: 'orderNo', value: '', showType: '1' },
					{ key: 'brNo', value: '', showType: '2' },
					{ key: 'orderStatus', value: '', showType: '3' },
					{ key: 'updateDate', value: '', showType: '4' }
				],
				filterGroups: {
					sapid: { label: '分公司', type: 'select', showType: '5', selectOptions: [] },
					orderNo: { label: '订单号', type: 'input', showType: '1' },
					brNo: { label: '订舱号', type: 'input', showType: '2' },
					orderStatus: { label: '订单状态', type: 'select', showType: '3', selectOptions: orderStatuOptions },
					updateDate: { label: '更新时间', type: 'daterange', showType: '4' }
				}
			}
		}
		sapidList({}).then(res => {
			console.log('🚀 ~ res.data', res.data)
			let data = res.data.map(item => {
				return {
					label: item.companyCname,
					value: item.sapid
				}
			})
			this.searchOption.addFilter.filterGroups.sapid.selectOptions = data
		})
		// 表格配置
		let pagination = { ...this.option.pagination, show: true }
		this.tableOption = { ...this.option, id: 'tableOption', pagination }
		this.tableOption.operationBtns.data = [{ label: '详情', show: true, action: 'showDetail' }]
		this.tableOption.operationBtns.width = '100px'
		this.tableOption.columns = [
			{ label: '订单号', prop: 'orderNo' },
			{
				label: '订单状态',
				prop: 'orderStatus',
				formatter: (row, pItem) => {
					if (row.orderStatus === 'REVIEWING') {
						return '待审核'
					} else if (row.orderStatus === 'CONFIRMED') {
						return '已确认'
					} else if (row.orderStatus === 'CANCELED') {
						return '已取消'
					}
				}
			},
			{
				label: '订舱号',
				prop: 'brNoInfos',
				type: 'text',
				formatter: row => {
					let arr = row.brNoInfos || []
					return arr.map(item => item.brNo).join(',')
				}
			},
			{
				label: '起始地',
				prop: 'porCityName',
				type: 'text'
			},
			{
				label: '目的地',
				prop: 'fndCityName',
				type: 'text'
			},
			{
				label: '船名/航次',
				prop: 'vesselName',
				type: 'text',
				formatter: row => {
					return row.vesselName + '/' + row.voyageNo + row.direction
				}
			},
			// {
			//   label: '线上支付状态',
			//   prop: 'paymentStatus',
			//   type: 'text',
			//   formatter: (row, pItem) => {
			//     if (row.paymentStatus === 'UNPAID') {
			//       return '未支付'
			//     } else if (row.paymentStatus === 'PAID')  {
			//       return '已支付'
			//     } else if (row.paymentStatus === 'CANCELED')  {
			//       return '已退款'
			//     } else if (row.paymentStatus === 'PARTIAL_PAID')  {
			//       return '部分支付'
			//     }
			//   },
			// },
			{
				label: '线下应付总额',
				prop: 'fndCityName',
				type: 'text',
				formatter: (row, pItem) => {
					return row.offLineTotalAmt
				}
			},
			{
				label: '线上应付总额',
				prop: 'fndCityName',
				type: 'text',
				formatter: (row, pItem) => {
					return row.onLinePayAmt
				}
			},
			{
				label: '线上已付金额',
				prop: 'fndCityName',
				type: 'text',
				formatter: (row, pItem) => {
					return row.onLinePaidAmtStr
				}
			},
			{
				label: '线上待付金额',
				prop: 'fndCityName',
				type: 'text',
				formatter: (row, pItem) => {
					return row.onLineUnPaidAmtStr
				}
			},
			{
				label: '运价有效期',
				prop: 'effectiveStartDate',
				type: 'text',
				formatter: (row, pItem) => {
					return row.effectiveStartDate.substring(0, 10) + '~' + row.effectiveEndDate.substring(0, 10)
				}
			},
			{
				label: '下单人',
				prop: 'orderUser',
				type: 'text'
			},
			{
				label: '更新时间',
				prop: 'updateTime',
				type: 'text'
			}
		]
		// console.log(this.tableOption)
		this.getData()
	},
	methods: {
		search() {
			this.tableOption.pagination.currPage = 1
			this.getData(true)
		},
		getData(isSearch) {
			// this.loading = true
			let data = {
				currPage: this.tableOption.pagination.currPage,
				pageSize: this.tableOption.pagination.pageSize,
				query: []
			}
			this.searchOption.addFilter.searchInputGroup.forEach(item => {
				let { key, value, range, req, valueReq } = item
				if (value) {
					if (value instanceof Array) {
						if (key === 'updateDate') {
							data['updateDateFro'] = dateFormat('yyyy-mm-dd', value[0])
							data['updateDateTo'] = dateFormat('yyyy-mm-dd', value[1])
						}
					} else {
						data[key] = value
					}
				}
			})
			if (isSearch) {
				this.searchBackup = data.query
			}
			data.query = this.searchBackup || []
			this.sapid = data.sapid
			orderListReefer(data)
				.then(res => {
					let { list } = res.data
					list.map(item => {
						let offLineTotalAmtStr = ''
						let onLinePayAmtStr = ''
						let onLinePaidAmtStr = ''
						let onLineUnPaidAmtStr = ''
						if (item.offlineCharges && item.offlineCharges.hasOwnProperty('ORIGINAL')) {
							let offLineChargeList = item.offlineCharges['ORIGINAL']
							if (offLineChargeList.length > 0) {
								//按币别凭借线下应付总额
								offLineChargeList.map(item => {
									offLineTotalAmtStr = offLineTotalAmtStr + ' ' + item.currencyType + ' ' + item.charge
								})
							}
						}
						if (item.onlineCharges && item.onlineCharges.hasOwnProperty('ORIGINAL')) {
							let onlineChargeList = item.onlineCharges['ORIGINAL']
							if (onlineChargeList.length > 0) {
								//按币别凭借线下应付总额
								onlineChargeList.map(item => {
									onLinePayAmtStr = onLinePayAmtStr + ' ' + item.currencyType + ' ' + item.onlineTotalAmount
									onLinePaidAmtStr = onLinePaidAmtStr + ' ' + item.currencyType + ' ' + item.onlinePaidAmount
									onLineUnPaidAmtStr = onLineUnPaidAmtStr + '' + item.currencyType + ' ' + item.onlineUnpaidAmount
								})
							}
						}

						Object.assign(item, {
							offLineTotalAmt: offLineTotalAmtStr,
							onLinePayAmt: onLinePayAmtStr,
							onLinePaidAmt: onLinePaidAmtStr,
							onLineUnPaidAmt: onLineUnPaidAmtStr
						})
					})
					this.tableOption.data = list
					this.tableOption.pagination.currPage = res.data.currPage
					this.tableOption.pagination.pageSize = res.data.pageSize
					this.tableOption.pagination.totalCount = res.data.totalCount
				})
				.catch(console.log)
		},

		// 详情
		showDetail(row) {
			this.isJumpRouteFromPage = true
			let sapid = this.sapid ? this.sapid : ''
			this.$router.push({
				path: `orderDetail?orderNo=${row.orderNo}&sapid=${sapid}`
			})
		}
	}
}
</script>
