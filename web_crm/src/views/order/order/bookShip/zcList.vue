<template>
	<div class="" style="position: relative">
		<tableFilterComp :config="tableConfig" :status="bkgStatus" :BtnList="BtnList" :tableQuery.sync="tableQuery" :callback="tableCallBack"> </tableFilterComp>
		<BaseTableMuti v-loading="loading" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
		<div v-if="customColumnsPopShow">
			<CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import tableFilterComp from '../components/tableFilterComp'
import CustomColumns from '@/components/customColumns/index'
import { orderCopy, bookzcList, bookzcListExport } from '@/api/order/book/list'
import { handleData } from '../js/handleData'
import searchTableUtil from '@/utils/searchTableUtil'
import { columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
import { getParamMethod } from '@/utils/allKindNumber'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}

const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: ['createdTime'],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	state: 'pass'
}

export default {
	data() {
		return {
			oldParams: {},
			loading: false,
			pricingAll: 'submit,pass,book_refuse,booking,booked,book_release,cancel,break,refuse', // 商务全部tab
			pricingOccupy: 'draft,pass,book_refuse,booking,booked,book_release', //商务占仓
			pricingPass: 'pass,booking,booked', // 商务审核通过tab
			pricingComplete: 'book_release', // 商务已完成tab
			bkgAll: 'pass,booking,booked,book_release,book_refuse', // bkg全部
			// bkgOccupy: 'pass,booking,booked,book_release,book_refuse,occupy', // bkg占仓
			tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
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
					checkSelectable({ bkgReqNo }) {
						return bkgReqNo ? true : false
					}
				},
				customColumns: {
					show: true,
					handleCustomColumns: this.handleCustomColumns
				},
				defaultEmpty: true, // 数据默认不加载的显示文案
				list: [],
				configColumns: [], // 自定义表头数组
				columns: [], //  表格显示的表头
				allColumns: store.state.book.bookList.occupy.columnsBase(this.handleBkgReqNoInfo, this.currRole, 'occupy'), // 全部表头
				// 操作按钮组
				operationBtns: {
					minWidth: '100',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'Info') {
							this.handleInfo(row)
						}
						if (action === 'Copy') {
							this.handleCopy(row)
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
								// 只有商务角色才有复制操作的权限
								if (this.currRole === 'pricing' && row.isOnlyBook === 'y') {
									return true
								}
								return false
							},
							action: 'Copy'
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
			customColumnsPopShow: false
		}
	},
	created() {
		this.init()
	},
	mounted() {},
	computed: {
		...mapState('user', ['userId']),
		...mapState({
			dictMap: state => state.dict.dictMap,
			defaultColumns: state => state.book.bookList.occupy.defaultColumns,
			specialColumns: state => state.book.bookList.occupy.specialColumns,
			columnsBase: state => state.book.bookList.occupy.columnsBase(),
			roles: state => state.user.roles,
			currRole: state => state.book.currRole
		}),
		// 订舱状态
		bkgStatus() {
			let status = []
			if (this.currRole === 'bkg') {
				status = handleData.bkgOccupyStatus
			}
			if (this.currRole === 'pricing') {
				status = handleData.occupyCabinStatus
			}
			return status
		},
		// 订舱表格按钮
		BtnList() {
			return this.currRole === 'pricing' ? handleData.businessBtnList : handleData.bkgBtnList
		}
	},
	watch: {
	},
	components: {
		BaseTableMuti,
		tableFilterComp,
		CustomColumns
	},
	methods: {
		init() {
			this.tableQuery.state = this.pricingOccupy
			if (this.currRole === 'bkg') {
				this.tableQuery.state = this.bkgAll
			}
		},
		// 查询
		handleSearch(searchInputGroup, filterGroups) {
			let data = searchTableUtil.searchCallBack('Search', searchInputGroup, filterGroups, this.tableConfig, this.tableQuery)
			this.tableQuery = Object.assign(data.tableQuery, {
				descColumns: ['createdTime']
			})
			for (let i = 0; i < this.tableQuery.query.length; i++) {
				if (this.tableQuery.query[i].column === 'bdDeptCode') {
					// this.tableQuery.query[i].value = Array.isArray(this.tableQuery.query[i].value) ? this.tableQuery.query[i].value[this.tableQuery.query[i].value.length - 1] : ''
					let arr=[]
					if(this.tableQuery.query[i].value&&this.tableQuery.query[i].value.length){
						console.log(this.tableQuery.query[i].value)
						for(let j=0;j<this.tableQuery.query[i].value.length;j++){
							if(this.tableQuery.query[i].value[j]&&this.tableQuery.query[i].value[j].length){
								arr.push(this.tableQuery.query[i].value[j][this.tableQuery.query[i].value[j].length-1])
							}
						}
					}
					this.tableQuery.query[i].value = arr.length ? arr.toString() : ''
					this.tableQuery.query[i].type = 'in'
				}
			}
			this.getList()
		},
		// 刷新
		async handleRefresh() {
			this.loading = true
			let { data } = await columnWidthConfigInfo({
				scenesCode: `${this.$route.name}_occupy`
			})
			let { columnWidthList } = data
			bookzcList(this.oldParams)
				.then(response => {
					let { list, totalCount, allColumns, configColumns, pageSize } = response.data
					this.tableConfig.list = list
					this.tableConfig.pagination.total = totalCount
					this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
					this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
					this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
					this.tableConfig.pagination.isLastPage = response.data.isLastPage
					this.tableQuery.currPage = response.data.currPage
					this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns
					this.tableConfig.configColumns.push('reqType')
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
				})
				.finally(() => {
					this.loading = false
				})
		},
		// 自定义列宽查询
		getTableColumnWidthInfo() {
			columnWidthConfigInfo({
				scenesCode: `${this.$route.name}`
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
				scenesCode: `${this.$route.name}_occupy`,
				columnWidthList: data
			})
				.then(res => {})
				.finally(() => {})
		},
		// 复制
		handleCopy(row) {
			this.$confirm(`是否确认复制申请单号: ${row.bkgReqNo} 的数据?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return orderCopy({ bkgReqNo: row.bkgReqNo })
				})
				.then(response => {
					let { bkgReqNo } = response.data
					this.$message({
						message: '复制成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							let routerName = this.currRole === 'pricing' ? 'NewOccupyDetail' : 'BookDetail'
							let routeUrl = this.$router.resolve({
								name: routerName,
								query: {
									bkgReqNo: bkgReqNo,
									roles: this.currRole
								}
							})
							window.open(routeUrl.href, '_blank')
						}
					})
				})
				.catch(() => {})
		},
		getListQuery() {
			let publishStatusQuery = [{ column: 'bkgStatus', type: 'eq', value: this.tableQuery.state || 'pass' }]
			// pricing 审核通过、商务占舱全部tab
			if (this.tableQuery.state === this.pricingPass || this.tableQuery.state === this.pricingOccupy) {
				publishStatusQuery = [{ column: 'bkgStatus', type: 'in', value: this.tableQuery.state }]
			}
			// pricing全部,bkg全部的都过滤掉orderStatus为cancel的
			if (this.tableQuery.state === this.bkgAll) {
				publishStatusQuery = [{ column: 'bkgStatus', type: 'in', value: this.tableQuery.state }]
			}
			// 我的业务
			if (this.tableQuery.state === 'mine') {
				publishStatusQuery = [
					{ column: 'employeeIdList', type: 'like', value: this.userId }
					// { column: 'bkgStatus', type: 'in', value: this.tableQuery.state },
					// { column: 'orderStatus', type: 'ne', value: 'cancel' }
				]
			}
			// pricing 待审核过滤掉orderStatus为cancel的
			if (this.tableQuery.state === '	') {
				publishStatusQuery = [
					{ column: 'bkgStatus', type: 'in', value: 'submit,book_refuse' },
					{ column: 'orderStatus', type: 'ne', value: 'cancel' }
				]
			}
			// 订舱拒绝tab
			if (this.tableQuery.state === 'refuse') {
				publishStatusQuery = [
					{ column: 'bkgStatus', type: 'eq', value: 'refuse' },
					{ column: 'orderStatus', type: 'eq', value: 'refuse' }
				]
			}
			// pricing 已取消tab
			if (this.tableQuery.state === 'bs_cancel') {
				publishStatusQuery = [
					{ column: 'bkgStatus', type: 'in', value: 'cancel,break' }
					// { column: 'orderStatus', type: 'in', value: 'cancel,break' }
				]
			}
			// bkg 已取消tab
			if (this.tableQuery.state === 'bkg_cancel') {
				publishStatusQuery = [
					{ column: 'bkgStatus', type: 'in', value: 'cancel,break' }
					// { column: 'orderStatus', type: 'in', value: 'cancel,break' }
				]
			}
			return publishStatusQuery
		},
		// 列表数据
		async getList(isLoop) {
			if (!isLoop) this.loading = true
			let { data } = await columnWidthConfigInfo({
				scenesCode: `${this.$route.name}_occupy`
			})
			let { columnWidthList } = data
			let statusQuery = this.getListQuery()
			let occupyQuery = this.tableQuery.query.filter(item => item.column != 'isOnlyBook')
			occupyQuery.push({ column: 'isOnlyBook', type: 'eq', value: 'y' })
			// console.log(this.tableQuery.columns)
			this.tableQuery.query = occupyQuery
			let query = searchTableUtil.getListQuery(this.tableQuery, statusQuery)
			//处理逗号分割的多个订单号
			query.query.map(item => {
				if (['orderNo', 'so', 'bkgReqNo', 'carrierLineName'].includes(item.column)) {
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s]/)
						.filter(Boolean)
						.join('#')
				}
			})

			this.oldParams = query
			bookzcList(query)
				.then(response => {
					let { list, totalCount, allColumns, configColumns, pageSize } = response.data
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

					this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns
					this.tableConfig.configColumns.push('reqType')
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
				})
				.finally(() => {
					this.loading = false
				})
		},
		// 新建
		handleAdd() {
			let routerName = 'NewOccupyDetail'
			let routeUrl = this.$router.resolve({
				name: routerName,
				query: {
					roles: this.currRole
				}
			})
			window.open(routeUrl.href, '_blank')
		},
		// 导出
		handleExport() {
			let statusQuery = this.getListQuery()
			let data = searchTableUtil.getListQuery(this.tableQuery, statusQuery)
			bookzcListExport({
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
		handleBkgReqNoInfo(row) {
			return this.handleInfo(row)
		},
		// 去详情页
		handleInfo(row) {
			let routerName = !row.orderNo && this.currRole === 'pricing' ? 'NewOccupyDetail' : 'BookDetail'
			let routeUrl = this.$router.resolve({
				name: routerName,
				query: {
					bkgReqNo: row.bkgReqNo,
					orderNo: row.orderNo,
					roles: this.currRole,
					jointNo: row.jointNo
				}
			})
			window.open(routeUrl.href, '_blank')
		},
		// 按bkgStatus状态筛选
		handleSearchStatus() {
			this.tableQuery.currPage = 1
			this.getList()
		},
		// 多选
		handleMuti(arr) {
			this.selectedCheckbox = arr
			let txt = 'T量合计：'
			let total = 0
			arr.map(item => {
				total += item.amountT
			})
			txt = txt + total
			this.$set(this.tableConfig.tips, 'totalTxt', txt)
			// console.log('txt:', txt)
		},
		handleSizeChange() {
			this.getList()
		},
		handleCurrentChange(val) {
			this.getList()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
			// console.log(action)
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
			// let {allColumns, columns} = this.tableConfig
			// Object.assign(this.tableConfig, {
			//   columns: allColumns.filter((item, index) => {
			//     return value.includes(item.prop)
			//   })
			// })
			// console.log('tableConfig:', this.tableConfig.columns)
		},
		// 获取特殊处理的自定义表头，例：polCode,需要传polCode,polEname,polCname,podCode, podEname,podCname给后端
		getColumnsValues(value) {
			// 20211202 取消工作号，订舱单号表头固定第一列
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
				// console.log('columnsKeys:', this.tableQuery.columns)
				this.getList()
			}
		}
	}
}
</script>
<style lang="scss">
</style>
