<template>
  <div>
    <BaseTableMuti :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" v-loading="loading" />
    <!-- 自定义表头 -->
		<div v-if="customColumnsPopShow">
			<CustomColumns :scenesCode="scenesCode" :showModel="false" :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
		</div>
  </div>
  
</template>

<script>
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import CustomColumns from '../../components/customColumns'
import store from '@/store'
import { mapState } from 'vuex'
import {  columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
import { getOrderFollowList  } from '@/api/order/followItems'
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
export default {
	props: {
		scenesCode: {
			type: String,
			default: ''
		}
	},
	watch: {
		scenesCode() {
			Object.assign(this.tableQuery, { columns: [] })
		}
	},
  data() {
    return {
      loading: false,
			objectSpanRow: [],
      tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
			sortClickFlag: false,
      // table复选框多选的值
			selectedCheckbox: [],
			// table基础组件
			tableConfig: {
				style: {},
        border: true,
        noShowStripe: true,
				tableIndex: {
					show: false
				},
				rowColorShow: true,
				objectSpanMethod: null,
				options: {
					// 是否支持解锁列表修改,默认锁定列表不可更改
					lockState: true,
					// 是否支持列表项选中功能
					mutiSelect: false,
					scrollX: { enabled: true, gt: 90 },
					scrollY: { enabled: true, gt: 201 },
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
				allColumns: store.state.followItems.mblList.columnsBase(this.handleClickRefreshList),
				operationBtns: {
					minWidth: '100',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'OpPlan') {
							this.handleOpPlan(row)
						}
					},
					data: [
						{
							label: '货物跟踪',
							type: 'text',
							show: true,
							action: 'OpPlan'
						},
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
    }
  },
	computed: {
		...mapState({
			templateDataObj: state => state.followItems.templateDataObj,
			baseDefaultColumns: state => state.followItems.baseDefaultColumns,
			defaultColumns: state => state.followItems.mblList.defaultColumns,
			specialColumns: state => state.followItems.mblList.specialColumns,
			columnsBase: state => state.followItems.mblList.columnsBase()
		})
	},
	created() {
		this.init()
	},
  components: { 
    BaseTableMuti,
    CustomColumns,
  },
  methods: {
		init() {
			this.tableConfig.columns = store.state.followItems.mblList.columnsBase(this.handleClickRefreshList)
			this.tableConfig.allColumns = store.state.followItems.mblList.columnsBase(this.handleClickRefreshList)
		},
		handleOpPlan(row) {
      let routeUrl = this.$router.resolve({
         name: 'opPlanDetail',
         query: {
					 orderNo: row.orderNo,
					 originRouteName: this.$route.name
				 },
				 params: {
					 orderNo: row.orderNo,
				 }
       })
       window.open(routeUrl.href, '_blank')
		},
		async getList(query, copyFlag) {
			this.init()
			this.loading = true
       query.query.map(item => {
				if (['orderNo', 'so', 'soNo', 'jointNo', 'blNo', 'cn', 'carrierLineName', 'whPoNo'].includes(item.column)) {
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s]/)
						.filter(Boolean)
						.join('#')
				}
			})
			let columnWidthList = []
			if (this.templateDataObj.columnWidthList.length) {
        columnWidthList = this.templateDataObj.columnWidthList
				if (copyFlag) {
					let widthParams = this.templateDataObj.columnWidthList.map(item => {
						item['prop'] = item['column']
						return 
					})
					this.handleSaveColumnWidth(widthParams)
				}
			} else {
        let { data } = await columnWidthConfigInfo({
					scenesCode: this.scenesCode
				})
				columnWidthList = data.columnWidthList || []
			}
			let columnsObj = {}
			this.tableConfig.customColumns.show = true
			if (this.templateDataObj.columnList.length) {
				if (copyFlag) {
					let columnsKeys = this.getColumnsValues(this.templateDataObj.columnList)
					Object.assign(this.tableQuery, {
						columns: columnsKeys
					})
				} else {
          this.tableConfig.customColumns.show = false
          columnsObj = { columns: [] }
				} 
				
			}
			Object.assign(this.tableQuery, {...query}, { query: query.query }, {scenesCode: this.scenesCode}, columnsObj)
      this.getAscOrDescData()
			getOrderFollowList(this.tableQuery)
				.then(response => {
					let { list, totalCount, pageSize, allColumns, configColumns } = response.data
					this.loading = false
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
					this.tableConfig.configColumns = this.templateDataObj.columnList.length ? this.templateDataObj.columnList : configColumns && configColumns.length ? configColumns : this.defaultColumns
					if (copyFlag) {
						this.$message.success('复制成功')
					}
					this.tableConfig.configColumns = new Set(this.tableConfig.configColumns)
					this.tableConfig.configColumns = Array.from(this.tableConfig.configColumns)
						
					this.handleFilterColumns(this.tableConfig.configColumns)
					// 设置列宽为服务器返回的新的列宽宽度
					this.tableConfig.columns.map((item, index) => {
						// 取服务器返回的宽度
						let findItem = (columnWidthList || []).find(ele => ele.column === item.prop)
						let newWidth = findItem ? findItem.width : ''
						return Object.assign(item, { width: newWidth || item.width })
					})
					this.tableColumnsWidthList = this.getTableColumnsWidth()
					this.getTableConfigList(list)
				})
				.catch(() => {
					this.loading = false
				})
		},
		getSortValue(key, list = []) {
      return (list.find(item => {
				return item.key === key
			}) || {}).value || []
		},
		getAscOrDescData() {
			 if (this.tableQuery.listType === 'owner') { 
          if (this.sortClickFlag) {
						// 手动点击排序
					} else {
						let subStatusType = this.tableQuery.subStatusType || ''
						let ascColumns = [
							{ key: 'bl_confirm', value: ['siCutOff'] },
							{ key: 'si', value: ['siCutOff'] },
							{ key: 'bl_copy', value: ['etd'] },
							{ key: 'bl_copy_cust', value: ['etd'] },
							{ key: 'release_agree', value: ['etd'] },
							{ key: 'take', value: ['td'] },
							{ key: 'put', value: ['eta'] },
						]
						let ascColumnsList = this.getSortValue(subStatusType, ascColumns)
						if (subStatusType) {
								Object.assign( this.tableQuery, { ascColumns: ascColumnsList,  descColumns: ascColumnsList.length ? ['isWhiteCust'] :  ['isWhiteCust', 'createdTime'] })
						} else {
								Object.assign( this.tableQuery, { ascColumns: ascColumns[0] ? ascColumns[0].value : [],  descColumns: ['isWhiteCust'] })
						}
					}
			} else {
				if (this.sortClickFlag) {
					// 手动点击排序
				} else {
					 Object.assign( this.tableQuery, { ascColumns: [],  descColumns: ['createdTime'] })
				}
			}
		},
		handleSizeChange() {
			this.$emit('callBack')
		},
		handleCurrentChange() {
			this.$emit('callBack')
		},
		handleSort(query) {
			this.sortClickFlag = true
			this.$emit('callBack')
		},
		getTableConfigList(list) {
       let arr = []
			 let num = 0
			 let len = 0
			 let objectSpanMethodArr = []
			 let index = 0
			 list.forEach(item1 => {
				len = (item1.followItem && Array.isArray(item1.followItem) && item1.followItem.length) || 0
				num += (len || 1)
				objectSpanMethodArr.push({
					index,
					num,
				})
				index += num
				num = 0 
				if(len) {
					item1.followItem.forEach(item2 => {
						arr.push({
							...item2,
							...item1
						})
					})
				} else {
					arr.push({
						...item1,
					})
				}
			 })
			 this.tableConfig.list = arr
			 console.log(`列表一共${arr.length}条`)
			 this.tableConfig.objectSpanMethod =  ({ row, column, rowIndex, columnIndex }) => {
        if (this.baseDefaultColumns.includes(column.property) || columnIndex === 0) {
					let obj = objectSpanMethodArr.find(item => item.index === rowIndex)
          if (obj && obj.num) {
            return {
              rowspan: obj.num,
              colspan: 1
            };
          } else {
            return {
              rowspan: 0,
              colspan: 0
            };
          }
        }
      }
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
		// 自定义列宽查询
		getTableColumnWidthInfo() {
			columnWidthConfigInfo({
				scenesCode: this.scenesCode
			}).then(res => {
				let { columnWidthList } = res.data
				// table列宽重新渲染
				this.tableConfig.columns.map(item => {
					let findItem = (columnWidthList || []).find(ele => ele.column === item.prop)
					// 服务器返回的新的列宽宽度
					let newWidth = findItem ? Math.min(findItem.width, item.minWidth) : ''
					return Object.assign(item, { width: newWidth || item.width })
				})
				this.tableColumnsWidthList = this.getTableColumnsWidth()
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
			let data = this.tableColumnsWidthList.map(item => {
				if (item.column === params.prop) {
					item.width = params.width
				}
				return { ...item }
			})
			columnWidthConfigSave({
				scenesCode: this.scenesCode,
				columnWidthList: data
			})
				.then(res => {})
				.finally(() => {})
		},
    // 自定义表头
		handleCustomColumns() {
			this.customColumnsPopShow = true
		},
		getColumnsValues(value) {
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
				this.$emit('callBack')
			}
		},
    // 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		handleClickRefreshList() {
			this.$emit('callBack')
		},
  }
}
</script>

<style>

</style>