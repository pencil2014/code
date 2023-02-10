<template>
  <div class="wrap" ref="layout">
    <OrganizeTree :addTree="true" :editTree="true" :deleteTree="true" :style="treeStyle" ref="organizeTree" @bindSelectData="getSelectTree" :draggable="true" />
    <div class="memberinfo" ref="right">
      <div class="search-container">
        <Search 
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
          <div class="btn-plus-search" @click="handleAddFilter"></div>
        </Search>
      </div>
      <div class="table-container">
        <div class="table-filter">
          <div class="table-filter-left">
            <el-button size="mini" ref="btnCreate" @click="handleCreate" type="primary">新建</el-button>
          </div>
        </div>
        <BaseTableMuti v-loading="loading" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
      </div>
      <!-- 详情弹窗 -->
      <div v-if="infoPopShow">
        <Info :infoPopQuery="infoPopQuery" @close="infoPopClose" />
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import OrganizeTree from './components/organizeTree';
import Info from './components/infoPop'
import {baseEmployeeListName} from '@/api/base'
import { approvalEmployeeList, approvalEmployeeDelete} from '@/api/order/contract'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: ['createdTime'],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
}
const defaultSearchInputGroup = [
	{ key: 'approvalJobCode', value: '', placeholder: '审核岗位', category: 'all', queryValue: '' },
	{ key: 'employeeId', value: '', placeholder: '审核人', category: 'all', queryValue: '' },
]

export default {
  data() {
    return {
      treeStyle: {
        height: 0
      },
      oldParams:{},
			cTimestamp: 0,
			loading: false,
			defaultStyle: {
				width: '100%'
			},
			searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 0, // 默认显示搜索框的个数
			searchConditionHide: true,
			allFilterGroups: {
				all: this.filterGroups
			},
			// 查询条件下拉选项
			filterGroups: {
				approvalJobCode: { 
          label: '审核岗位', 
          key: 'approvalJobCode', 
          type: 'select', 
          searchType: 'eq', 
          value: '',
          filterable: true,
          data: [],
          nonDictionary: true
        },
        employeeId: {
					key: 'employeeId',
					label: '审核人',
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
			},
			// 默认展示的搜索条件，搜索条件分类
			searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),
			tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
			searchConfig: [],
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
					checkSelectable({ oid }) {
						return oid ? true : false
					}
				},
				defaultEmpty: true,	// 数据默认不加载的显示文案
				list: [],
				configColumns: [],
				columns: [
          { label: '审核岗位', key: 'approvalJobName', prop: 'approvalJobName', width: '' },
          { label: '审核人', key: 'employeeName', prop: 'employeeName', width: '' }
        ],
				allColumns: [],
				// 操作按钮组
				operationBtns: {
					width: '120',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'Info') {
							this.handleInfo(row)
						}
						if (action === 'Delete') {
							this.handleDelete(row)
						}
					},
					data: [
						{
							label: '编辑',
							type: 'text',
							show: true,
							action: 'Info'
						},
						{
							label: '删除',
							type: 'text',
							className: 'red',
							show: true,
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
					oldPagination: true,
					show: true,
					total: 0,
					hasNextPage: false,
          hasPreviousPage: false,
          isFirstPage: false,
          isLastPage: false
				}
      },
      infoPopShow: false,
			infoPopQuery: {
				oid: undefined
      },
      orgId: ''
    };
  },
  activated() {
		// let timestamp = new Date().getTime()
    // if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
    //   this.getList()
    // }
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	deactivated() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
  created() {
    this.cTimestamp = new Date().getTime()
		this.init()
  },
  computed: {
    ...mapState('user', ['userId']),
    ...mapState({
      dictMap: state => state.dict.dictMap
    }),
  },
  mounted() {
    this.getTreeData()
    this.getList()
  },
  components: {
    Search,
		AddFilter,
		BaseTableMuti,
    OrganizeTree,
    Info
  },
  methods: {
    init() {
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
    },
    getTreeData() {
      this.$refs.organizeTree.requestTreeData();
    },
    getSelectTree(data, checked, indeterminate) {
      console.log('data', data);
      if (data) {
        this.orgId = data.oid;
        this.getList();
      }
    },
    // 获取员工name
		getEmployeeName(val, item, roleCode) {
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
    // 增加一条搜索条件
		handleAddFilter() {
			this.searchInputGroup.push({ key: '', value: '', category: 'all', queryValue: '' })
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
		// 获取列表请求参数
		getListQuery() {
			console.log('this.orgId', this.orgId)
      let statusQuery = []
      if (this.orgId) {
        statusQuery = [{column: 'approvalOrganizeId', type: 'eq', value: this.orgId}]
      }
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
			this.oldParams = query
			approvalEmployeeList(query)
				.then(response => {
					let { list, totalCount, allColumns, configColumns, pageSize } = response.data
					// 请求无数据显示的文案
					if (!list || !list.length) {
						this.$set(this.tableConfig, 'defaultEmpty', false)
					}
					this.tableConfig.list = list
					this.tableQuery.pageSize = pageSize
					this.tableConfig.pagination.total = totalCount

					this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
            this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
            this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
            this.tableConfig.pagination.isLastPage = response.data.isLastPage
            this.tableQuery.currPage = response.data.currPage
				})
				.finally(() => {
					this.loading = false
				})
    },
    // 查询组件回调
		async searchCallBack(action, param) {
			let query = []

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
                    value: item.value ? item.value[item.value.length-1] : ''
                  })
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
									if (item.value) query.push({ column: item.key, type: 'ge', value: item.value[0] + ' 00:00:00' }, { column: item.key, type: 'le', value: item.value[1] + ' 23:59:59' })
								} else if (['prefinCloseStatus', 'finCloseStatus'].includes(item.key)) {
									// 特殊处理预关账状态，关账状态
									if (item.value) {
										// 选择未关账传值不等于yes
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

							if (item.key === 'orderStatus') {
								this.tableQuery.orderStatus = item.value
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
			// 刷新
      if (action === 'Refresh') {
        this.loading = true
				approvalEmployeeList(this.oldParams)
					.then(response => {
						let { list, totalCount, allColumns, configColumns, pageSize } = response.data
						// 请求无数据显示的文案
						if (!list || !list.length) {
							this.$set(this.tableConfig, 'defaultEmpty', false)
						}
						this.tableQuery.pageSize = pageSize
						this.tableConfig.pagination.total = totalCount
					})
					.finally(() => {
						this.loading = false
					})
      }
    },
    handleSearchValueReset() {
			this.searchInputGroup.map(item => {
				item.value = ''
				return {...item}
			})
    },
    handleSizeChange(val) {
			this.getList()
		},
		handleCurrentChange(val) {
			// 刷新页面的先调自定义搜索查询接口，拿到自定义的搜索条件再调getList接口
			// if (val) {
			// 	this.tableQuery.currPage = val
			// 	// this.getSearchConditionInfo()
			// }
			this.getList()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
    },
    handleCreate() {
			this.infoPopQuery = {
        oid: undefined,
        approvalOrganizeId: this.orgId
			}
			this.infoPopShow = true
		},
		infoPopClose(action) {
			this.infoPopShow = false
			if (action === 'Confirm') {
				this.getList()
			}
		},
    // 去详情页
		handleInfo(row) {
      this.$set(this.infoPopQuery, 'oid', row.oid)
      this.$set(this.infoPopQuery, 'approvalOrganizeId', row.approvalOrganizeId)
      this.$set(this.infoPopQuery, 'approvalJobCode', row.approvalJobCode)
      this.$set(this.infoPopQuery, 'employeeId', row.employeeId)
      this.$set(this.infoPopQuery, 'approvalJobName', row.approvalJobName)
      this.$set(this.infoPopQuery, 'employeeName', row.employeeName)
      this.$set(this.infoPopQuery, 'type', 'edit')
			this.infoPopShow = true
		},
		// 排序
		handleSort(query) {
			this.getList()
		},
    // 删除
		handleDelete(row) {
			this.$confirm(`是否删除此审批人?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				approvalEmployeeDelete({ oid: row.oid }).then(res => {
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
			}).catch(err => {
				console.log('err')
			})
		},
    handleMuti(arr) {
			this.selectedCheckbox = arr
		},
  }
};
</script>

<style lang="scss" scoped>
/deep/ .finance-page{
  margin: 14px 0 !important;
}
.wrap {
  // 树结构
  .approval-org-tree {
    background: #f5f5f5;
    border: 1px solid #ccc;
    /deep/ .el-tree {
      color: #232326;
    }
    // 搜索框
    /deep/.el-input__inner,
    ::-webkit-input-placeholder {
      color: #666;
      font-weight: 400;
    }

    // 目录
    /deep/.custom-tree-node {
      font-size: 12px;
    }
    // 选中效果
    /deep/.el-tree-node_bgc {
      background: #0080e1 !important;
      color: #fff !important;
    }
  }
 .menu{
   .filter-containe {
     display: flex;
     flex-direction: row;
     justify-content: flex-start;
     font-size: 12px;
     color: #333;
     align-items: baseline;
     flex-wrap: wrap;
     .filter{
         display: flex;
         // flex: 1;
         flex-direction: row;
         justify-content: flex-start;
         flex-wrap: wrap;
         
     }
     .filter-item {
         display: inline-block;
         vertical-align: middle;
     }
   }
   
   .input-container-dialog {
     float: left;
     display: flex;
     flex-direction: row;
     justify-content: flex-end;
     align-items: center;
     margin: 10px 0 20px;
     margin-right: 25px;
     
     span.filter-txt {
         min-width: 80px;
         text-align: right;
     }
   }
   .el-dialog__header {
       background:#2D3A5D;
       padding: 10px 20px 10px;
       span{
         padding: 10px;
         color: #fff;
         font-size: 12px;
       }
       .el-dialog__headerbtn {
       top: 15px;
   }
   }
   .el-table th>.cell{
     color:#222222;
   }
   .el-tag {
        background-color: #fff; 
        color: #4A4A4A; 
        border-style: none; 
   }
   .dialog-add{
     margin-top:16px;
     .el-button {
       border: 1px dashed #DCDFE6;
     }
   }
   .input-width{
      width:150px;
   }
   .m-t-8{
     margin-top:8px;
   }
  .el-input__prefix{
    line-height: 28px;
    color:#000000;
  }
  .el-input--prefix .el-input__inner {
    padding-left: 45px;
  }
 
}
 .operation-btns-box{
    padding-left:10px;
  }
}

.memberinfo {
  overflow: hidden;
  /deep/ .el-card__body {
    padding-bottom: 0;
  }
}
</style>
