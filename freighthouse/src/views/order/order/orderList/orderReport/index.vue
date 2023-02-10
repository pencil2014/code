<template>
	<div class="app-container">
		<div class="search-container">
			<Search 
				:config.sync="searchConfig" 
				:callback="searchCallBack" 
				:tableQuery.sync="tableQuery"
				:searchFiledGroup="searchInputGroup" 
				:filterGroups="filterGroups">
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
		<div class="table-container" ref="tableCont">
			<div class="table-filter">
				<el-button type="default" size="mini" class="btn-export" @click="handleExport">导出</el-button>
			</div>
			<BaseTableMuti :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" v-loading="loading" />
		</div>
		<!-- 自定义表头 -->
    <div v-if="customColumnsPopShow">
      <CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
    </div>
	</div>
</template>
<script>
import store from '@/store'
import { mapMutations, mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
// 弹出框
import { baseBusinessList, searchConditionInfo, searchConditionSave, searchConditionDelete, columnWidthConfigInfo, columnWidthConfigSave, baseEmployeeListName, 
baseCompanyList, baseCompanySettleList } from '@/api/base'
import { shipOrderReport, shipOrderReportExport, getValueByKey } from '@/api/order/list'
import CustomColumns from '@/components/customColumns/index'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: ['bizDate'],
	descColumns: [],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
}
const defaultSearchInputGroup = [
	// {
	// 	key: 'businessType',
  //   value: '',
  //   placeholder: '业务类型',
  //   category: 'all',
  //   queryValue: ''
	// },
	{
		key: 'bizDate',
    value: '',
    placeholder: '业务日期',
    category: 'all',
    queryValue: ''
	},
	{
		key: 'prefinCloseStatus',
    value: '',
    placeholder: '预关账状态',
    category: 'all',
    queryValue: ''
	},
	{
		key: 'finCloseStatus',
    value: '',
    placeholder: '关账状态',
    category: 'all',
    queryValue: ''
	},
	{
		key: 'compDeptName',
    value: '',
    placeholder: '结算公司',
    category: 'all',
    queryValue: ''
	},
	{
		key: 'branchCompDeptName',
    value: '',
    placeholder: '分公司',
    category: 'all',
    queryValue: ''
	},
	{
		key: 'orderStatus',
    value: ['pass','break','complete'],
    placeholder: '订单状态',
    category: 'all',
		queryValue: ''
	},
]

export default {
	data() {
		return {
			// 显示自定义表头的弹窗状态
      customColumnsPopShow: false,
			cTimestamp: 0,
			loading: false,
			defaultStyle: {
				width: '100%'
			},
			businessTypeOptions: [],
			serviceTypeOptions: {},
			searchConditionHide: true,  // 隐藏搜索自定义
			searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 0, // 默认显示搜索框的个数
			allFilterGroups: {
				all: this.filterGroups
			},
			// minDate: '', 	// 
			// maxDate: '',
			selectDate: '',
			start: '',	// 默认开始日期
			end: '',	// 默认结束日期
			// 查询条件下拉选项
			filterGroups: {
				// businessType: { label: '业务类型', key: 'businessType', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				// serviceType: { label: '服务类型', key: 'serviceType', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				// createdTime: { label: '业务创建时间', key: 'createdTime', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				bizDate: { label: '业务日期', key: 'bizDate', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd',
					pickerOptions: {
						// 设置不能选择的日期
						onPick: ({maxDate, minDate}) => {
							this.selectDate = minDate.getTime()
							if (maxDate) {
								this.selectDate = ''
							}
							// this.minDate = minDate
							// this.maxDate = maxDate
						},
						disabledDate: (time) => {
							// 2个月60天的时间戳
							let two = 60*24*3600*1000
							// 是否限制的判断条件
							if (this.selectDate) {
								// 大于或选中日期后66天或小于选中日期前60天都被禁用
								return time > (new Date(this.selectDate + two)) || time < (new Date(this.selectDate - two))
							} else {
								return false
							}
							
							// if (this.minDate) {
							// 	return time > (new Date(this.minDate.getTime() + two)) || time < (new Date(this.minDate.getTime() - two))
							// }
							// return time.getTime() > Date.now()
						}
					} 
				},
				prefinCloseStatus: { label: '预关账状态', key: 'prefinCloseStatus', type: 'select', searchType: 'eq', value: '', data: store.state.order.orderList.finCloseStatus, nonDictionary: true },
				finCloseStatus: { label: '关账状态', key: 'finCloseStatus', type: 'select', searchType: 'eq', value: '', data: store.state.order.orderList.finCloseStatus, nonDictionary: true },
				compDeptName: {
					key: 'compDeptName',
					label: '结算公司',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true,
					filterable: true,
					saveList: [],
					queryValue: ''
				},
				branchCompDeptName: {
					key: 'branchCompDeptName',
					label: '分公司',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true,
					filterable: true,
					saveList: [],
					queryValue: ''
				},
				orderStatus: {
					label: '订单状态', 
					key: 'orderStatus', 
					type: 'select', 
					searchType: 'in', 
					value: ['pass','break','complete'], 
					data: [], 
					multiple: true, 
					saveList: [{label: '审核通过', value: 'pass'}, {label: '终止', value: 'break'}, {label: '完成', value: 'complete'}], 
					'collapse-tags': true, 
					queryValue: '', 
					nonDictionary: true 
				},
				// bdEmployeeId: {
				// 	key: 'bdEmployeeId',
				// 	label: '销售人员',
				// 	type: 'remoteSelect',
				// 	searchType: 'eq',
				// 	value: '',
				// 	data: [],
				// 	nonDictionary: true,
				// 	visibleChange: (val, item) => {
				// 		this.getEmployeeName('', item)
				// 	},
				// 	filterMehod: (val, item) => {
				// 		this.getEmployeeName(val, item)
				// 	},
				// 	change: (val, item) => {
				// 		let findItem = item.data.find(ele => ele.value === val)
				// 		Object.assign(item, {
				// 			queryValue: val,
				// 			text: findItem ? findItem.label : ''
				// 		})
				// 	}
				// },
				// orderStatus: {label: '订单状态', key: 'orderStatus', type: 'select', searchType: 'eq', value: '', nonDictionary: true},
			},
			// 默认展示的搜索条件，搜索条件分类
			searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),
			searchConfig: [],
			statusQuery: [{column: 'orderStatus', type: 'in', value: 'pass,break,complete'}],
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
					mutiSelect: false,
					// 多选框状态判断 {false不可选, true可选}
					checkSelectable({ orderNo }) {
						return orderNo ? true : false
					}
				},
				customColumns: {
          show: true,
          handleCustomColumns: this.handleCustomColumns
        },
				list: [],
				defaultEmpty: true, // 数据默认不加载的显示文案
				configColumns: [],
				defaultColumns: [],
				columns: store.state.order.orderReportList.columnsBase(
          this.handleInfo
        ),
				allColumns: store.state.order.orderReportList.columnsBase(
          this.handleInfo
        ),
				// 操作按钮组
				operationBtns: {
					minWidth: '80',
					fixed: 'right',
					show: false,
					callback: (action, $index, row, item) => {
					},
					data: []
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
			tableColumnsWidthList:[],
			resDefaConfList: [], // 后端配置的默认搜索模板
			// isSameCode: false
		}
	},
	beforeRouteLeave(to, from, next) {
		next()
	},
	// activated() {
	// 	let timestamp = new Date().getTime()
	// 	if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
	// 		this.getList()
	// 	}
	// 	window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	// },
	// deactivated() {
	// 	window.removeEventListener('keydown', this.handleKeyDown)
	// },
	destroyed() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	created() {
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
		this.cTimestamp = new Date().getTime()
		this.init()
		this.getCompany()
		this.getCompanySettleList()
		this.getBusinessType()
		// this.getSearchConditionInfo()
		// this.getList()
	},
	mounted() {
		// this.getDeptCode()
	},
	computed: {
		...mapState('user', ['deptCode']),
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderList: state => state.order.orderList,
			columnsBase: (state) => state.order.orderReportList.columnsBase(),
			defaultColumns: (state) => state.order.orderReportList.defaultColumns,
			specialColumns: (state) => state.order.orderReportList.specialColumns
		}),
	},
	watch: {},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		CustomColumns
	},
	methods: {
		// //查询散货部门CODE
		// getDeptCode() {
		// 	getValueByKey('lcl_company_code').then(res => {
		// 		// console.log('🚀 ~ this.deptCode', this.deptCode)
		// 		// 登录用户的deptCode以散货部门code为开头的判断为散货部门
		// 		if (res.data.startsWith(this.deptCode)) {
		// 			this.isSameCode = true
		// 		} else {
		// 			this.isSameCode = false
		// 		}
		// 	})
		// },
		// 过滤显示自定义的表头
    handleFilterColumns(value) {
      let { allColumns } = this.tableConfig
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
      temp.map((item) => {
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
      value.map((item) => {
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
		// 自定义表头
    handleCustomColumns() {
      this.customColumnsPopShow = true
    },
		// 去详情页
		async handleInfo(row) {
			let isSameCode = await this.$store.dispatch('order/getValueByKeys', {custid: row.custid})
			let routeUrl = this.$router.resolve({
				name: 'OrderDetail',
				params: {
					orderNo: row.orderNo
				},
				query: {
					orderNo: row.orderNo,
					source: 'orderReportList',
					action: 'view',
					showContainer: !['ship_export_lcl', 'ship_import_lcl'].includes(row.businessType),
					showBl: ['st01', 'st15', 'st03', 'st18', 'st09', 'st10', 'st11', 'st12', 'st02', 'st04'].includes(row.serviceType),
					showRelate: isSameCode && ['st01', 'st15', 'st09'].includes(row.serviceType)
				}
			})
			window.open(routeUrl.href, '_blank')
		},
		// 获取结算公司
		getCompanySettleList() {
			baseCompanySettleList().then(res => {
				let result = res.data.map(ele => {
					return Object.assign({}, ele, {
						label: ele.name,
						value: ele.name
					})
				})
				this.filterGroups.compDeptName.data = result
			})
		},
		// 获取公司
		getCompany() {
			baseCompanyList().then(res => {
				let result = res.data.map(ele => {
					return Object.assign({}, ele, {
						label: ele.name,
						value: ele.name
					})
				})
				this.filterGroups.branchCompDeptName.data = result
			})
		},
		// 获取员工name
		getEmployeeName(val, item) {
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: 'bd' // 角色
			}
			baseEmployeeListName(data).then(res => {
				item.data = res.data.filter(item => item.status === 'on').map(item => {
					return Object.assign(item, {
						label: this.$language === 'en' ? item.ename : item.cname,
						value: item.employeeId ? Number(item.employeeId) : ''
					})
				})
			})
		},
		// 自定义列宽查询
		getTableColumnWidthInfo() {
			columnWidthConfigInfo({
				scenesCode: this.$route.name
			}).then(res => {
				let {columnWidthList} = res.data
				// table列宽重新渲染
				this.tableConfig.columns.map(item => {
					let findItem = columnWidthList.find(ele => ele.column === item.prop)
					// 服务器返回的新的列宽宽度 
					let newWidth = findItem ? findItem.width : ''
					return Object.assign(item, {width: newWidth || item.width})
				})
				this.tableColumnsWidthList = this.getTableColumnsWidth()
				// console.log('this.tableColumnsWidthList', this.tableColumnsWidthList)
			})
		},
		// 获取本地table列表的字段和宽为数组集合
		getTableColumnsWidth() {
			let result = this.tableConfig.columns.map(item => {
				return {column: item.prop, width: item.width}
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
				return {...item}
			})
			columnWidthConfigSave({
				scenesCode: this.$route.name,
				columnWidthList: data
			}).then(res => {
			}).finally(() => {
			})
		},
		// 获取服务类型
		getBusinessType() {
			let result = []
			baseBusinessList().then(res => {
				this.businessTypeOptions = res.data.filter(item => item.business === 'ship')
				res.data.forEach(item => {
					if (item.business === 'ship' && item.serviceTypeList && item.serviceTypeList.length) {
						item.serviceTypeList.forEach(ele => {
							result.push({
								label: ele.businessType === 'ship_export_fcl' ? '海运出口整箱-' + ele.name : '海运出口拼箱-' + ele.name,
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
		add0(m){
			return m<10?'0'+m:m 
		},
		format(shijianchuo){
			//shijianchuo是整数，否则要parseInt转换
			var time = new Date(shijianchuo);
			var y = time.getFullYear();
			var m = time.getMonth()+1;
			var d = time.getDate();
			var h = time.getHours();
			var mm = time.getMinutes();
			var s = time.getSeconds();
			return y+'-'+this.add0(m)+'-'+this.add0(d)+' '+this.add0(h)+':'+this.add0(mm)+':'+this.add0(s);
		},
		// 默认设置查询业务日期为当月第1天00:00:00到当天的前一天23:59:59
		setDefaultBizDate() {
			let curr = new Date(new Date().toLocaleDateString()).getTime()
			// 前一天23:59:59
			this.end = curr - 1000
			// 前一个月 00:00:00
			this.start = curr - 30*24*60*60*1000
			this.tableQuery.query = [{column: "bizDate", type: "ge", value: this.format(this.start)},{column: "bizDate", type: "le", value: this.format(this.end)}]
		},
		init() {
			this.setDefaultBizDate()
			// 结算公司，分公司的搜索绑定的值清空
			// this.filterGroups.compDeptName.queryValue = ''
			// this.filterGroups.branchCompDeptName.queryValue = ''
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
			this.searchInputGroup[0].value = [this.format(this.start).substring(10, 0), this.format(this.end).substring(10, 0)]
			// this.searchInputGroup = [
			// 	{
			// 		key: 'bizDate', 
			// 		value: [this.format(this.start).substring(10, 0), this.format(this.end).substring(10, 0)], 
			// 		placeholder: '业务日期', 
			// 		category: 'all',
			// 		queryValue: ''
			// 	}
			// ]
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
			// if (this.tableQuery.query.length === 0) {
			// 	this.setDefaultBizDate()
			// }
			// 合并状态参数
			let data = {}
			// console.log('tableQuery', this.tableQuery)
			// 如果搜索项含有订单状态查询项则不用合并statusQuery参数
			let isOrderStatus = this.tableQuery.query.some(ele => ele.column === 'orderStatus')
			Object.assign(data, this.tableQuery, {
				query: isOrderStatus ? this.tableQuery.query : this.tableQuery.query.concat(this.statusQuery)
			})
			return data
		},
		// 列表数据
		async getList() {
			this.loading = true
			let query = this.getListQuery()
			let {data} = await columnWidthConfigInfo({
				scenesCode: this.$route.name
			})
			let {columnWidthList} = data
			shipOrderReport(query)
				.then(response => {
					let { list, totalCount, pageSize, configColumns } = response.data
					list.forEach(item => {
						item.serviceTypeName = item.serviceType ? this.serviceTypeOptions[item.serviceType] : ''
						let findItem = this.businessTypeOptions.find(ele => ele.businessType === item.businessType)
						item.businessTypeCn = findItem ? findItem.name : ''
					})
					this.tableConfig.list = list
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

					this.tableConfig.configColumns = configColumns.length
              ? configColumns
              : this.defaultColumns

            this.tableConfig.configColumns = new Set(
              this.tableConfig.configColumns
            )
            this.tableConfig.configColumns = Array.from(
              this.tableConfig.configColumns
            )

            this.handleFilterColumns(this.tableConfig.configColumns)

					// 设置列宽为服务器返回的新的列宽宽度 
					this.tableConfig.columns.map(item => {
						let findItem = columnWidthList.find(ele => ele.column === item.prop)
						let newWidth = findItem ? findItem.width : ''
						return Object.assign(item, {width: newWidth || item.width})
					})
					if(this.tableConfig.columns.length<12){
            let tabelWidth=document.body.clientWidth-120
            for(let i=0;i<this.tableConfig.columns.length;i++){
              this.$set(this.tableConfig.columns[i],'width',tabelWidth/this.tableConfig.columns.length)
            }
          }
					this.tableColumnsWidthList = this.getTableColumnsWidth()
				})
				.finally(() => {
					this.loading = false
				})
		},
		// 查询组件回调
		searchCallBack(action, param) {
			let query = []
			// console.log('this.searchInputGroup', this.searchInputGroup)
			if (action === 'Search') {
				// if (!this.searchInputGroup.length || this.searchInputGroup.some(item => !item.value)) {
				// 	return this.$message({type: 'warning', message: '请先选择业务日期'})
				// }
				// 新增的查询条件组装tableQuery参数
				if (this.searchInputGroup.length) {
					this.searchInputGroup.forEach((item, index) => {
						let tempItem = {}
						if (item.key) {
							// 非自动补全的查询参数从item.value中取值合并到query
							if (this.filterGroups[item.key].type !== 'autocomplete') {
								// 中转港
								if (this.filterGroups[item.key].multiple) {
									Object.assign(tempItem, {
										column: item.key,
										type: this.filterGroups[item.key].searchType || 'eq',
										value: item.value ? item.value.toString() : ''
									})
								} else if (this.filterGroups[item.key].category === 'daterange') {
									// 时间区间组件的value值是数组，['beginDate','endDate'],要转换成后端需要的两个字段
									// if (item.value) query.push({ column: item.key, type: 'ge', value: item.value[0] + ' 00:00:00' }, { column: item.key, type: 'le', value: item.value[1] + ' 23:59:59' })
								  if (item.value && item.value[0]) query.push({ column: item.key, type: 'ge', value: item.value[0] + ' 00:00:00' })
									if (item.value && item.value[1]) query.push({ column: item.key, type: 'le', value: item.value[1] + ' 23:59:59' })
								} else if (['prefinCloseStatus', 'finCloseStatus'].includes(item.key)) {	// 特殊处理预关账状态，关账状态
									// 选择未关账传值不等于yes
									if (item.value) {
										if (item.value === 'yes') {
											Object.assign(tempItem, {column: item.key, type: 'eq', value: 'yes'})
										} else {
											Object.assign(tempItem, {column: item.key, type: 'eq', value: 'no'})
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
				}

				Object.assign(this.tableQuery, {
					query: query.filter(item => {
						return item.value
					}),
					currPage: 1
				})
				console.log('serach:', this.tableQuery)
				this.getList()
			}
			if (action === 'Reset') {
				this.handleSearchValueReset()
			}
			// 模板加载后修改搜索组件的数组
			if (action === 'Update') {
				this.searchInputGroup = param.length ? [...param] : [...defaultSearchInputGroup]
				if (!param.length) {
					this.init()
				}
			}
		},
		handleSearchValueReset() {
			this.searchInputGroup.map(item => {
				item.value = ''
				return { ...item }
			})
			// this.searchInputGroup[0].value = [this.format(this.start).substring(10, 0), this.format(this.end).substring(10, 0)]
			// this.filterGroups.compDeptName.queryValue = ''
			// this.filterGroups.branchCompDeptName.queryValue = ''
			// console.log('重置')
		},
		// 导出
		handleExport() {
			// if (!this.searchInputGroup.length || this.searchInputGroup.some(item => !item.value)) {
			// 	return this.$message({type: 'warning', message: '请先选择业务日期'})
			// }
			this.$confirm('是否确认导出？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = this.getListQuery()
				shipOrderReportExport({
					ascColumns: data.ascColumns,
					descColumns: data.descColumns,
					query: data.query
				}).then(response => {
					let { filePath } = response.data
					window.location.href = filePath
				})
      })
			
		},
		// 多选
		handleMuti(arr) {
			this.selectedCheckbox = arr
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
		},
		// 获取table选中行的orderNo
		getOrderNos() {
			let orderNos = []
			this.selectedCheckbox.forEach(item => {
				orderNos.push(item.orderNo)
			})
			return orderNos
		},
		// 排序
		handleSort(query) {
			this.getList()
		},
	}
}
</script>
<style lang="scss">
</style>
