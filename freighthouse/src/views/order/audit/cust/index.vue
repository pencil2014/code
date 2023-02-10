<template>
	<div class="app-container">
		<div class="search-container">
			<Search 
        ref="search"
        :searchConditionHide="searchConditionHide"
        :config.sync="searchConfig"
        :callback="searchCallBack"
        :tableQuery.sync="tableQuery"
        :searchFiledGroup="searchInputGroup"
        :filterGroups="filterGroups"
      >
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
      <!-- <div class="table-filter">
				<el-button type="default" size="mini" class="btn-export" @click="handleExport">导出</el-button>
			</div> -->
			<BaseTableMuti :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" v-loading="loading" />
		</div>
    <!-- 审核拒绝弹窗 -->
		<div v-if="refusePopShow">
			<Refuse @close="refusePopClose" />
		</div>
		<!-- 审核通过弹窗 -->
		<div v-if="passPopShow">
			<Pass @close="passPopClose" />
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { getDictLabel } from '@/utils/tools'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import Refuse from './components/refusePop'
import Pass from './components/passPop'
import ColumnTip from './components/columnTip.vue'
import { columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
import { custChangeAuditList, custChangeAuditHandle } from '@/api/order/list'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: ['createdTime'],
	query: [],
	orderStatus: '' // 订单状态，默认展示未审核
}
const defaultSearchInputGroup = [
	{
		key: 'orderNo',
		value: '',
		placeholder: '工作号',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'auditStatus',
		value: '',
		placeholder: '审核状态',
		category: 'all',
		queryValue: ''
  },
  {
		key: 'createdTime',
		value: '',
		placeholder: '申请时间',
		category: 'all',
		queryValue: ''
	}
]
export default {
  mixins: [routerMixin],
	data() {
		return {
			oldParams: {},
			cTimestamp: 0,
      loading: false,
      searchConditionHide: true,  // 隐藏搜索自定义
			searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 0, // 默认显示搜索框的个数
			allFilterGroups: {
				all: this.filterGroups
			},
			// 查询条件下拉选项
			filterGroups: {
				orderNo: {
					key: 'orderNo',
					label: '工作号',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				auditStatus: {
					key: 'auditStatus',
					label: '审核状态',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [
            {label: '待审核', value: 'SUBMIT'},
            {label: '审核通过', value: 'PASS'},
            {label: '审核拒绝', value: 'REFUSE'}
          ],
					nonDictionary: true
				},
				createdTime: {
					label: '申请时间',
					key: 'createdTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
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
					mutiSelect: false,
					// 多选框状态判断 {false不可选, true可选}
					checkSelectable: ({ oid }) => {
						return oid ? true : false
					}
				},
				defaultEmpty: true, // 数据默认不加载的显示文案
				list: [],
				configColumns: [],
				columns: [
					{
						label: '工作号',
						key: 'orderNo',
						prop: 'orderNo',
						width: '120',
						type: 'text',
						formatter: (row, column) => {
							return `<el-button type="text" class="underline">${row.orderNo}</el-button>`
						},
						method: (index, row) => {
							this.handleInfo(row)
						}
					},
					{ label: '修改内容', key: 'custName', prop: 'custName', disabled: false, width: '510',
						popoverComponent: ColumnTip,
						method: (row, name) => {
							this.handleToCustomer(row, name)
						}
						// formatter: (row, column) => {
						// 	return `委托单位变更：${row.orgCustName} 修改为 ${row.custName}`
						// }
					},
					{
						label: '修改原因',
						key: 'modifyReason',
						prop: 'modifyReason',
						width: '100',
						formatter: (row, column) => {
							return getDictLabel('orderCustModifyReason', row.modifyReason)
						}
					},
					{
						label: '修改备注',
						key: 'modifyRemark',
						prop: 'modifyRemark',
						width: '200'
          },
          {
						label: '申请人',
						key: 'createdName',
						prop: 'createdName',
						width: '90',
					},
					{
						label: '申请时间',
						key: 'createdTime',
						prop: 'createdTime',
						width: '140'
          },
          {
						label: '销售',
						key: 'bdEmployeeName',
						prop: 'bdEmployeeName',
						width: '90',
          },
          {
						label: '销售部门',
						key: 'bdDeptName',
						prop: 'bdDeptName',
						width: '90',
          },
					{
						label: '审核人',
						key: 'auditEmployeeName',
						prop: 'auditEmployeeName',
						width: '90'
          },
          {
						label: '审核时间',
						key: 'auditTime',
						prop: 'auditTime',
						width: '140'
          },
          {
						label: '审核状态',
						key: 'auditStatus',
						prop: 'auditStatus',
            width: '80',
            formatter: (row, column) => {
              let statusCn = row.auditStatus === 'PASS' ? '审核通过' : row.auditStatus === 'REFUSE' ? '审核拒绝' : row.auditStatus === 'SUBMIT' ? '待审核' : ''
              let color = ''
              // 待审核
              if (['SUBMIT'].includes(row.auditStatus)) {
                color = 'yellow'
              }
              // 审核通过
              if (row.auditStatus === 'PASS') {
                color = 'green'
              }
              // 审核拒绝
              if (row.auditStatus === 'REFUSE') {
                color = 'red'
              }
							return `<span class="${color}">${statusCn}</span>`
						}
          },
          {
						label: '拒绝原因',
						key: 'refuseRemark',
						prop: 'refuseRemark',
						width: '200'
					},
					{
						label: '审核备注',
						key: 'auditRemark',
						prop: 'auditRemark',
						width: '200'
          },
				].map(item => {
					return {...item, minWidth: item.width}
				}),
				// 操作按钮组
				operationBtns: {
					minWidth: '85',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'Pass') {
							this.handlePass(row)
            }
            if (action === 'Refuse') {
							this.handleRefuse(row)
						}
					},
					data: [
						{
							label: '通过',
							type: 'text',
							show: (item, row) => {
								if (row.auditStatus === 'SUBMIT') {
									return true
								}
								return false
							},
							action: 'Pass'
            },
            {
							label: '拒绝',
              type: 'text',
              className: 'red',
							show: (item, row) => {
								if (row.auditStatus === 'SUBMIT') {
									return true
								}
								return false
							},
							action: 'Refuse'
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
      resDefaConfList: [], // 后端配置的默认搜索模板
      refusePopShow: false,
			refuseParam: {},
			passPopShow: false,
      passParam: {}
		}
	},
	activated() {
		let timestamp = new Date().getTime()
		if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
			this.getList()
		}
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	deactivated() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	created() {
		this.cTimestamp = new Date().getTime()
		this.init()
	},
	mounted() {
	},
	computed: {
		...mapState('order', ['serviceList', 'orderList']),
		...mapState('user', ['deptCode', 'userId']),
		...mapState({
			currRole: state => state.order.currRole,
			roles: state => state.user.roles,
			dictMap: state => state.dict.dictMap,
		}),
	},
	watch: {},
	components: {
		Search,
		AddFilter,
    BaseTableMuti,
		Refuse,
		Pass,
		ColumnTip
	},
	methods: {
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
		init() {
			// 默认展示全部
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
			// 合并状态参数
			let data = {}
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery)
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
			custChangeAuditList(query).then(response => {
        let { list, totalCount, pageSize, configColumns } = response.data
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
        // 设置列宽为服务器返回的新的列宽宽度 
        this.tableConfig.columns.map(item => {
          let findItem = columnWidthList.find(ele => ele.column === item.prop)
          let newWidth = findItem ? findItem.width : ''
          return Object.assign(item, {width: newWidth || item.width})
        })
        this.tableColumnsWidthList = this.getTableColumnsWidth()
      }).finally(() => {
        this.loading = false
      })
		},
		// 查询组件回调
		async searchCallBack(action, param) {
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
									Object.assign(tempItem, {
										column: item.key,
										type: this.filterGroups[item.key].searchType || 'eq',
										value: item.value ? item.value[item.value.length - 1] : ''
									})
								} else if (this.filterGroups[item.key].multiple) {
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
									if (item.value && item.value[1]) {
										query.push({
											column: item.key,
											type: 'le',
											value: item.value[1] + ' 23:59:59'
										})
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
				// console.log('serach:', this.tableQuery)
				this.getList()
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
		// 导出
		handleExport() {
			let data = this.getListQuery()
			custChangeAuditListExport({
				ascColumns: data.ascColumns,
				descColumns: data.descColumns,
				query: this.oldParams.query
			}).then(response => {
				let { filePath } = response.data
				window.location.href = filePath
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
		// 去详情页
		async handleInfo(row) {
			let routeUrl = this.$router.resolve({
				name: 'OrderRedirect',
				query: {
					orderNo: row.orderNo,
				}
			})
			window.open(routeUrl.href, '_blank')
		},
		handleToCustomer(row, name) {
			// 打开新页面
      let routeUrl = this.$router.resolve({
        name: 'CustomerDetail',
        query: { 
					custid: row.custid,
					name
				},
        params: { isTab: true }
      })
      window.open(routeUrl.href, '_blank')
		},
		// 排序
		handleSort(query) {
			this.getList()
    },
    // 审核通过
    handlePass(row) {
			this.passPopShow = true
      this.passParam = {
        orderNo: row.orderNo,
        oid: row.oid,
      }
      // this.$confirm('请确认是否审核通过', '提示?', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning'
      // }).then(() => {
      //   custChangeAuditHandle({
      //     orderNo: row.orderNo,
      //     oid: row.oid,
      //     auditStatus: 'PASS'
      //   }).then(res => {
      //     this.$message.success('审核通过成功')
      //     this.getList()
      //   })
      // }).catch(err => {

      // })
		},
		passPopClose(action, value) {
      this.passPopShow = false
      if (action === 'Confirm') {
        custChangeAuditHandle({
          orderNo: this.passParam.orderNo,
          oid: this.passParam.oid,
          auditStatus: 'PASS',
          auditRemark: value.auditRemark
        }).then(res => {
          this.$message.success('审核通过成功')
          this.getList()
        })
      }
    },
    // 审核拒绝
    handleRefuse(row) {
      this.refusePopShow = true
      this.refuseParam = {
        orderNo: row.orderNo,
        oid: row.oid,
      }
    },
    refusePopClose(action, value) {
      this.refusePopShow = false
      if (action === 'Confirm') {
        custChangeAuditHandle({
          orderNo: this.refuseParam.orderNo,
          oid: this.refuseParam.oid,
					auditStatus: 'REFUSE',
					refuseRemark: value.refuseRemark,
          auditRemark: value.auditRemark
        }).then(res => {
          this.$message.success('审核拒绝成功')
          this.getList()
        })
      }
    }
	}
}
</script>
<style lang="scss">
</style>
