<template>
	<div>
		<div v-loading="loading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
			<div>
				<FinanceSearch ref="searchComp" :searchOption="searchOption" @search="search" />
				<div class="finance-search-list-gap"></div>
				<div class="finance-list-container">
					<div class="money-box">
						<div class="money-box-left">
							<el-button size="mini" type="primary" @click="handleAdd">新增</el-button>
						</div>
						<div class="money-box-right">
							<el-button @click="refreshListPage" size="mini" type="primary">刷新</el-button>
						</div>
					</div>
					<FinanceTable :option="tableOption" @getData="getData" />
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { tableData } from '@/views/wms/warehouse/data/warehouseStaff.js'
import { mixin } from '@/views/finance/mixins/mixin'
import { warehouseEmployee } from "@/api/wms.js"
import { mapGetters } from 'vuex'
export default {
	name: 'warehouseStaff',
	components: {
		FinanceTable,
		FinanceSearch
	},
  mixins: [mixin],
  data () {
    return {
      loading: false,
			searchOption: {}, //查询参数
			tableOption: {}, //表格参数
			dataList: [], //列表数据
      selfColumnsBase: tableData.map(item => {
				let target = { ...item }
				if (target.callback) target.callback = row => this.showDetail(row)
				return target
			})
    }
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
  },
  created () {
    // 设置查询配置参数
		this.setSearchOption()
		// 设置表格配置参数
		this.setTableOption()
  },
  activated() {
		this.refreshListPage()
	},
  methods: {
    /**
		 * @description: 设置查询参数
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-16 11:39:15
		 */
		setSearchOption() {
      // 在tableData中筛选出需要查询的字段
			let searchProps = ['employeeName', 'warehouseId', 'jobTypeName']
			let searchData = tableData.filter(item => searchProps.includes(item.prop))
			let searchObj = {}
			searchData.forEach(v => {
				searchObj[v.prop] = { ...v, type: v.sType || v.type || 'input', label: v.sLabel || v.label }
			})
			let searchInputGroup = []
			let defaultSearchLength = 3
			let searchPropsNew = searchProps.slice(0, defaultSearchLength)
			searchPropsNew.forEach(item => {
				searchInputGroup.push({
					key: item,
					value: ''
				})
			})
			this.searchOption = {
				addFilter: {
					defaultSearchLength,
					searchInputGroup,
					filterGroups: { ...searchObj },
					callback: true
				}
			}
		},
		/**
		 * @description: 设置表格参数
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-16 17:14:47
		 */
		setTableOption() {
			// 分页配置
			let pagination = { ...this.option.pagination, show: true, pageSize: 20, isNew: true }
			// 操作按钮配置
			let operationBtns = {
				...this.option.operationBtns,
				width: '100px',
				data: [
					{
						label: '修改',
						action: 'Modify',
						style: 'color: #E9851F',
						show: true
					}
				]
			}
			// 整合列表配置参数
			this.tableOption = {
				...this.option,
				id: 'tableOption',
				pagination,
				sortable: false,
        index: {
          show: true
        },
				columns: [...this.selfColumnsBase],
				operationBtns,
				data: []
			}
		},
    
		/**
		 * @description: 获取列表数据
		 * @param {*} query 查询参数
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 14:10:16
		 */
		getData(query) {
      if (query && query.length) {
        query.forEach(item => {
          if (item.column === "jobTypeName") {
            item.value = this.dictMapObj['warehouseEmployeeJobType'][item.value]
          }
        })
      }
			let data = {
				currPage: this.tableOption.pagination.currPage,
				pageSize: this.tableOption.pagination.pageSize,
				query
			}
			this.loading = true
			warehouseEmployee(data)
				.then(({ code, data }) => {
					if (code === 0) {
            this.tableOption.pagination.hasNextPage = data.hasNextPage
            this.tableOption.pagination.hasPreviousPage = data.hasPreviousPage
            this.tableOption.pagination.isFirstPage = data.isFirstPage
            this.tableOption.pagination.isLastPage = data.isLastPage
						this.tableOption.data = data.list || []
					}
				})
				.finally(() => {
					this.loading = false
				})
		},
		// 分页页面数量change   有分页必写此方法
		handleSizeChange(val) {
			let query = this.$refs.searchComp.addFilterSearch()
			this.tableOption.pagination.pageSize = val
			this.getData(query)
		},
		// 分页改变当前页   有分页必写此方法
		handleCurrentChange(val, event) {
			let query = this.$refs.searchComp.addFilterSearch()
			this.tableOption.pagination.currPage = val
			this.getData(query)
		},
		// 搜索按钮
		search(query) {
			this.tableOption.pagination.currPage = 1
			this.getData(query)
		},
    handleAdd () {
      this.$router.push({ path: '/wms/warehouse/warehouseStaffDetail', query: { type: 'add'}})
    },
    // 修改
		handleModify(row) {
			this.$router.push({ path: '/wms/warehouse/warehouseStaffDetail', query: { type: 'modify', groupCode: row ? row.groupCode : '' } })
		},
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/common.scss';
</style>