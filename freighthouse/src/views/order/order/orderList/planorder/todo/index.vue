<template>
	<div class="todo-container">
		<div class="search-container">
			<Search :searchConditionHide="searchConditionHide" :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery"> </Search>
		</div>
		<div class="table-container">
			<TableFilter :followList="followList" :tableQuery.sync="tableQuery" :callback="tableFilterCallBack" />
			<div v-loading="tableLoading">
        <component  :is="activityKey" :ref="activityKey" :action="action" :tableData="tableData" :callback="callBack"></component>
			</div>
			<div class="pagination-row" v-if="showPagination">
				<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tablePagCallBack" />
			</div>
		</div>
		<!-- 自定义服务项 -->
		<div v-if="customColumnsPopShow">
			<CustomColumns :title="'自定义服务项'" :columnsTitle="['可选服务项', '自定义服务项']" :columnsBase="serviceOptions" :configColumns="configColumns" @close="customColumnsPopClose" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { todoList, todoCreate, todoEdit, todoMatterList, todoFollowList, todoFollowSave, todoDelete, todoClose } from '@/api/order/plan'
import Search from '@/components/Base/Search/index'
import TableFilter from './components/tableFilter'
import CustomColumns from '@/components/customColumns/index'
import Release from './components/release'
import Book from './components/book'
import Vgm from './components/vgm'
import Dangerous from './components/dangerous'
import Truck from './components/shippingTruck'
import PolDeclaration from './components/polDeclaration'
import PolInspection from './components/polInspection'
import PolDeclarationInspection from './components/polDeclarationInspection.vue'
import PolWarehouse from './components/polWarehouse'
import PolLtl from './components/polLtl'
import PodLtl from './components/podLtl'
import YardBox from './components/yardBox'
import Document from './components/document'
import Fume from './components/fume'
import Ciq from './components/ciq'
import Bv from './components/bv'
import CocSaso from './components/cocSaso'
import InspectionAndDetection from './components/inspectionAndDetection'
import PodChangeDoc from './components/podChangeDoc'
import PodCommClearance from './components/podCommClearance'
import PodFclDelivery from './components/podFclDelivery'
import PodWarehouse from './components/podWarehouse'
import PodWhMatter from './components/podWhMatter'
import LclWhBook from './components/lclWhBook'
import Si from './components/si'
import Sa from './components/sa'
import Owner from './components/owner'
import Take from './components/take'
import Put from './components/put'
import Pagination from '@/components/Base/Table/newPagination'
const defaultPage = {
	pageSize: -1,
	currPage: 1
}

const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: [], // 'orderNo', 'createdTime'
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	serviceCode: '' // 订单状态，默认展示未处理
}
export default {
	mixins: [routerMixin],
	data() {
		return {
			searchConditionHide: true, // 隐藏自定义搜索
			searchConfig: [{ label: '工作号', key: 'orderNo', type: 'input', searchType: 'like', value: '' }],
			tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
			activityKey: 'Book',
			customColumnsPopShow: false,
			configColumns: [],
			serviceOptions: [
				{ key: 'release', components: 'Release', label: '放舱' },
				{ key: 'vgm', components: 'Vgm', label: 'VGM' },
				// { key: 'dangerous', components: 'Dangerous', label: '危险品' },
				{ key: 'truck', components: 'Truck', label: '起运港拖柜' },
				// { key: 'pol_declaration', components: 'PolDeclaration', label: '代理报关' },
				// { key: 'pol_inspection', components: 'PolInspection', label: '代理报检' },
				{ key: 'pol_declaration', components: 'PolDeclarationInspection', label: '起运港报关/报检' },
				// { key: 'pol_warehouse', components: 'PolWarehouse', label: '仓储' },
				{ key: 'pol_warehouse', components: 'PolWarehouse', label: '起运港仓储/堆场装箱' },
				{ key: 'pol_ltl', components: 'PolLtl', label: '起运港散车' },
				// {key: 'pol_ltl', components: 'PolLtl', label: '散车收货'},
				{ key: 'pod_ltl_delivery', components: 'PodLtl', label: '目的港散车' },
				// { key: 'stuffing', components: 'YardBox', label: '堆场装箱' },
				{ key: 'doc', components: 'Document', label: '贸易单证' },
				{ key: 'fume', components: 'Fume', label: '熏蒸' },
				// { key: 'ciq', components: 'Ciq', label: 'CIQ' },
				// { key: 'bv', components: 'Bv', label: 'BV' },
				// { key: 'coc_saso', components: 'CocSaso', label: 'COC/SASO' },
				{ key: 'ciq', components: 'InspectionAndDetection', label: '各类检验'},
				{ key: 'pod_change_doc', components: 'PodChangeDoc', label: '目的港换单' },
				{ key: 'pod_comm_clearance', components: 'PodCommClearance', label: '目的港委托清关' },
				{ key: 'pod_fcl_delivery', components: 'PodFclDelivery', label: '目的港拖柜派送' },
				{ key: 'pod_warehouse', components: 'PodWarehouse', label: '目的港仓储' },
				{ key: 'pod_wh_matter', components: 'PodWhMatter', label: '进仓事项' },
				// {key: 'whbook', components: 'LclWhBook', label: '订舱'},
				// {key: 'proxy_whbook', components: 'LclWhBook', label: '代订舱'},
				{ key: 'si', components: 'Si', label: 'SI' },
				{ key: 'sa', components: 'Sa', label: 'SA' },
        { key: 'take', components: 'Take', label: '取单' },
        { key: 'put', components: 'Put', label: '放单' },
				{ key: 'zero', components: 'Owner', label: '我的创建' }
			],
			followList: [], //  关注的待办事项
			tableConfig: {
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
			tableData: [],
			// resList: [], // 接口返回的列表数据
			// addList: [], // 新增的列表数据
			createItem: {
				orderNo: '',
				matter: '',
				beginTime: '',
				remark: '',
				matterStatus: 'todo'
			},
			action: '',
			sortValueArr: {
				siCutOff: '',
				tdTime: '',
				etaTime: '',
				vgmCutOff: '',
				cyCutOff: '',
				ccCutOff: '',
				cvCutOff: '',
				sortValue: '',
				shipTime: ''
			},
			showPagination: false,
			tableLoading: false
		}
	},
	activated() {
		this.getInitList(this.tableQuery.serviceCode)
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	deactivated() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	async created() {
		this.getAllMatter()
		this.getInitList()
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	mounted() {
		console.log('🚀 ~ this.configColumns', this.configColumns)
		console.log('🚀 ~ this.serviceOptions', this.serviceOptions)
	},
	destroyed() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	computed: {
		...mapState({
			currRole: state => state.order.currRole,
			dictMap: state => state.dict.dictMap
		})
	},
	watch: {},
	components: {
		Search,
		TableFilter,
		CustomColumns,
		Pagination,
		Release,
		Book,
		Vgm,
		Dangerous,
		Truck,
		PolDeclaration,
		PolInspection,
		PolDeclarationInspection,
		PolWarehouse,
		PolLtl,
		PodLtl,
		YardBox,
		Document,
		Fume,
		Ciq,
		Bv,
		CocSaso,
		InspectionAndDetection,
		PodChangeDoc,
		PodCommClearance,
		PodFclDelivery,
		PodWarehouse,
		PodWhMatter,
		LclWhBook,
		Si,
		Sa,
		Owner,
    Take,
    Put
	},
	methods: {
		async getInitList(serviceCode) {
			let { data } = await todoFollowList()
			if (!data) this.followList = []
			if (data) {
				this.setInitData(data, serviceCode)
			}
			this.getList()
		},
		// 获取关注的服务项
		setInitData(data, serviceCode) {
			// console.log('data', data);
			this.configColumns = data.filter(item => this.serviceOptions.some(ele => ele.key === item.matterCode)).map(item => item.matterCode)
			this.followList = []
			data.map(item => {
				let findItem = this.serviceOptions.find(ele => item.matterCode === ele.key)
				findItem && this.followList.push({ ...findItem, rows: item.rows })
			})
			Object.assign(this.tableQuery, {
				serviceCode: serviceCode ? serviceCode : this.followList[0].key || ''
			})
			this.getComponents(this.tableQuery.serviceCode)
		},
		// 获取所有的事项
		getAllMatter() {
			todoMatterList().then(res => {
				if (!res.data) return (this.serviceOptions = [])
				let allMatterCodeArr = res.data.map(item => item.matterCode)
				this.serviceOptions = this.serviceOptions.filter(item => allMatterCodeArr.includes(item.key))
				// console.log('this.serviceOptions', this.serviceOptions)
			})
		},
		// 获取关注的待办事项
		async getFollowMatter() {
			let { data } = await todoFollowList()
			if (!data) this.followList = []
			if (data) {
				this.setInitData(data)
			}
			this.getList()
		},
		// 关注待办事项保存
		handleFollowMatterSave(value) {
			todoFollowSave({ matterCodeList: value }).then(res => {
				this.getInitList()
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
				// 阻止分页的页码enter键触发全局的监听事件
				let className = window.event.target.parentNode.className
				if (className.includes('el-pagination__editor')) return
				//触发的事件
				this.searchCallBack('Search')
			}
		},
		// 获取列表请求参数
		getListQuery() {
			let serviceCodeArr = ['pol_declaration', 'ciq', 'pol_warehouse']
			let column = ''
			if (serviceCodeArr.includes(this.tableQuery.serviceCode)) {
				column = 'serviceCode'
			} else {
				column = 'matterCode'
			}
			let statusQuery = [{ column, type: 'eq', value: this.tableQuery.serviceCode }]
			let ascColumns = ['sortValue']
			// 排序
			// if(this.tableQuery.serviceCode === 'zero') {
			//   ascColumns = ['beginTime']
			// }
			switch (this.tableQuery.serviceCode) {
				case 'zero':
					ascColumns = ['beginTime']
					break
				case 'pod_comm_clearance':
					ascColumns = ['etaTime']
					break
				case 'pod_change_doc':
					ascColumns = ['etaTime']
					break
				case 'pod_wh_matter':
					ascColumns = ['etaTime']
					break
				case 'sa':
					ascColumns = ['tdTime']
					break
				case 'vgm':
					ascColumns = ['vgmCutOff']
					break
				case 'doc':
					ascColumns = ['tdTime']
					break
				case 'fume':
					ascColumns = ['orderNo']
					break	
				case 'bv':
					ascColumns = ['orderNo']
					break
				case 'ciq':
					ascColumns = ['orderNo']
					break
				case 'coc_saso':
					ascColumns = ['orderNo']
					break
				case 'dangerous':
					ascColumns = ['shipTime']
					break
				case 'pol_inspection':
					ascColumns = ['shipTime']
					break
				case 'pol_declaration':
					ascColumns = ['shipTime']
					break
				case 'si':
					ascColumns = ['siCutOff']
					break
				// case 'truck':
				//   ascColumns = ['eDeliveryTime']
				//   break
				default:
					break
			}
			if (ascColumns.length) {
				Object.assign(this.tableQuery, { ascColumns })
			}
			// 合并发布状态参数
			let data = {}
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery)
			})
			delete data.serviceCode
			return data
		},
		// 列表数据
		getList() {
			let data = this.getListQuery()
			this.tableLoading = true
			todoList(data).then(res => {
				this.tableLoading = false
				let { list, totalCount, allColumns, configColumns, pageSize } = res.data
				this.tableData = list
				// 特殊处理后端返回的9999(列表排序用)的值为空
				this.tableData.forEach(item => {
					for (let i in this.sortValueArr) {
						if (item[i] == 9999) {
							item[i] = ''
						}
					}
				})
				// console.log('this.tableData', this.tableData)
				// 我的创建的tableData需特殊处理
				if (this.tableQuery.serviceCode === 'zero') {
					this.tableData = list.map(item => {
						return { ...item, isEdit: false, isAdd: false, matterStatus: item.matterStatus.toLowerCase() }
					})
				}
				this.tableConfig.pagination.total = totalCount
				this.tableQuery.pageSize = pageSize
				this.tableConfig.pagination.hasNextPage = res.data.hasNextPage
            this.tableConfig.pagination.hasPreviousPage = res.data.hasPreviousPage
            this.tableConfig.pagination.isFirstPage = res.data.isFirstPage
            this.tableConfig.pagination.isLastPage = res.data.isLastPage
            this.tableQuery.currPage = res.data.currPage
				this.showPagination = true
			})
		},
		// 查询组件回调
		searchCallBack(action) {
			let query = []
			if (action === 'Search') {
				// 新增的查询条件组装tableQuery参数
				if (this.searchConfig.length) {
					this.searchConfig.forEach((item, index) => {
						let tempItem = {}
						if (item.value) {
							Object.assign(tempItem, {
								column: item.key,
								type: item.searchType || 'eq',
								value: item.queryValue ? item.queryValue : item.value
							})
							query.push(tempItem)
						}
					})
				}
				Object.assign(this.tableQuery, {
					query: query,
					currPage: 1
				})
				// console.log('serach:', this.tableQuery)
				this.getInitList(this.tableQuery.serviceCode)
			}

			if (action === 'Reset') {
				this.searchConfig.forEach(item => {
					item.value = ''
				})
				Object.assign(this.tableQuery, {
					query: [],
					currPage: 1
				})
				this.getInitList(this.tableQuery.serviceCode)
			}
		},
		// 获取组件名
		getComponents(val) {
			let findItem = this.serviceOptions.find(item => item.key === val)
			this.activityKey = findItem ? findItem.components : ''
		},
		// 切换服务项tab
		handleSearchByServiceType(val) {
			this.tableQuery.currPage = 1
			this.tableData = []
			this.getInitList(val)
		},
		// 多选
		handleMuti(arr) {
			this.selectedCheckbox = arr
		},
		handleSizeChange() {
			this.getInitList(this.tableQuery.serviceCode)
		},
		handleCurrentChange() {
			this.getInitList(this.tableQuery.serviceCode)
		},
		tableFilterCallBack(action, arr) {
			this.showPagination = false
      this.tableCallBack(action, arr)
		},
		tablePagCallBack(action, arr) {
      this.tableCallBack(action, arr)
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		// 创建待办
		handleAdd() {
			let hasAdd = this.tableData.some(item => item.isAdd)
			let hasEdit = this.tableData.some(item => item.isEdit)
			let msg = hasAdd ? '创建' : hasEdit ? '编辑' : ''
			if (hasAdd || hasEdit) {
				return this.$message({ type: 'warning', message: `请先保存${msg}的待办` })
			}
			this.action = 'add'
			this.tableData.push({ ...this.createItem, isEdit: false, isAdd: true })
		},
		// 打开自定义服务项弹窗
		handleCustomColumns() {
			this.customColumnsPopShow = true
		},
		// 关闭自定义服务项弹窗
		customColumnsPopClose(action, value) {
			console.log('configColumns', value)
			this.customColumnsPopShow = false
			if (action === 'Confirm') {
				this.handleFollowMatterSave(value)
			}
		},
		callBack(action, value, sIndex) {
			console.log('action, value', action, value)
			// 创建待办
			if (action === 'Create') {
				this.handleCreateTodo(value)
			}
			// 编辑
			if (action === 'Edit') {
				this.handleEdit(value, sIndex)
			}
			// 编辑保存
			if (action === 'EditSave') {
				this.handleEditSave(value)
			}
			// 取消编辑
			if (action === 'CancelEdit') {
				this.handleCancelEditTodo(value, sIndex)
			}
			if (action === 'DeleteTodo') {
				this.handleDeleteTodo(value, sIndex)
			}
			// 自定义待办完结
			if (action === 'TodoClose') {
				this.handleTodoClose(value)
			}
		},
		// 手动
		handleTodoClose(row) {
			todoClose({ oid: row.oid })
				.then(res => {
					this.$message({ type: 'success', message: '确认成功' })
					this.getInitList(this.tableQuery.serviceCode)
					this.action = ''
				})
				.finally(() => {
					this.getInitList(this.tableQuery.serviceCode)
				})
		},
		// 校验空
		validate(data) {
			let obj = {
				orderNo: '工作号',
				matterName: '待办事项名称',
				// remark: '备注',
				beginTime: '处理时间',
				matterStatus: '进度'
			}
			let msg = ''
			for (let i in obj) {
				if (!data[i]) {
					msg += `${obj[i]}、`
				}
			}
			return msg
		},
		// 我的创建保存
		handleCreateTodo(row) {
			let { orderNo, matterName, beginTime, remark, matterStatus } = row
			let result = this.validate(row)
			if (result) {
				result = result.slice(0, result.length - 1)
				return this.$message.error(`${result}为必填`)
			}
			todoCreate({ orderNo, matter: matterName, beginTime, remark }).then(res => {
				this.$message({ type: 'success', message: '创建成功' })
				this.getInitList(this.tableQuery.serviceCode)
				this.action = ''
			})
		},
		handleEdit(row, sIndex) {
			let hasAddEdit = this.tableData.some(item => item.isEdit || item.isAdd)
			if (hasAddEdit) {
				return this.$message({ type: 'warning', message: '请先保存待办' })
			}
			row.isEdit = true
			row.isAdd = false
		},
		// 我的创建修改保存
		handleEditSave(row) {
			let { oid, remark, matterStatus, matterName } = row
			let result = this.validate(row)
			if (result) {
				result = result.slice(0, result.length - 1)
				return this.$message.error(`${result}为必填`)
			}
			todoEdit({ oid, remark, status: matterStatus }).then(res => {
				this.$message({ type: 'success', message: '保存成功' })
				// 进度改为'已完成'的列表会删除该条，若是该页的最后一条，则页码自动变为上一页
				if (matterStatus === 'done') {
					let totalPage = Math.ceil((this.tableConfig.pagination.total - 1) / this.tableQuery.pageSize)
					let currPage = this.tableQuery.currPage > totalPage ? totalPage : this.tableQuery.currPage
					this.tableQuery.currPage = currPage < 1 ? 1 : currPage
				}
				this.getInitList(this.tableQuery.serviceCode)
			})
		},
		// 取消编辑
		handleCancelEditTodo(row, sIndex) {
			row.isEdit = false
			row.isAdd = false
		},
		// 删除创建待办
		deleteTodo(row, sIndex) {
			// this.$confirm('是否确认删除该条数据?', '警告', {
			// 	confirmButtonText: '确定',
			// 	cancelButtonText: '取消',
			// 	type: 'warning'
			// }).then(() => {
			//   this.tableData = this.tableData.filter((item, index) => index !== sIndex)
			// }).catch(() => {

			// })
			this.tableData = this.tableData.filter((item, index) => index !== sIndex)
		},
		// 删除待办
		handleDeleteTodo(row, sIndex) {
			// 创建的直接删除
			if (row.isAdd) {
				return this.deleteTodo(row, sIndex)
			}
			let hasAddEdit = this.tableData.some(item => item.isEdit || item.isAdd)
			if (hasAddEdit) {
				return this.$message({ type: 'warning', message: '请先保存待办' })
			}
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					todoDelete({ oid: row.oid }).then(res => {
						this.$message({ type: 'success', message: '删除成功' })
						let totalPage = Math.ceil((this.tableConfig.pagination.total - 1) / this.tableQuery.pageSize)
						let currPage = this.tableQuery.currPage > totalPage ? totalPage : this.tableQuery.currPage
						this.tableQuery.currPage = currPage < 1 ? 1 : currPage
						this.getInitList(this.tableQuery.serviceCode)
					})
				})
				.catch(() => {})
		}
	}
}
</script>
<style lang="scss">
.todo-container {
	.plan-table {
		// border: 1px solid #dfe6ec;
		// border-right: none;
		// border-bottom: none;
		th {
			height: 24px;
		}
		td {
			// border-right: 1px solid #dfe6ec !important;
			padding: 1px 0;
		}
		.operate-group {
			.operate {
				line-height: 16px;
				display: flex;
				justify-content: center;
				.checkbox {
					border: 1px solid #dcdfe6;
					border-radius: 2px;
					width: 14px;
					height: 14px;
					display: block;
					margin-right: 5px;
					margin-top: 2px;
					position: relative;
					transition: border-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46), background-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46);
					&.is-active {
						background-color: #409eff;
						border-color: #409eff;
						&:after {
							box-sizing: content-box;
							content: '';
							border: 1px solid #fff;
							border-left: 0;
							border-top: 0;
							height: 7px;
							left: 4px;
							position: absolute;
							top: 1px;
							transform: rotate(45deg) scaleY(1);
							width: 3px;
							transition: transform 0.15s ease-in 0.05s;
							transform-origin: center;
						}
					}
				}
			}
		}
	}
	.pagination-row {
		margin-top: 8px;
		text-align: right;
	}
}
</style>
