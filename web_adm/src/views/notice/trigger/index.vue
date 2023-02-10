<template>
	<div class="menu">
		<div class="components-container notice-container search-layout">
			<div class="filter-containe">
				<div class="filter">
					<div class="search-containe">
						<div>
							<span class="filter-txt">
								模板编号:
							</span>
							<el-input clearable class="input-width" size="mini" v-model="queryForm.templateNo" placeholder="请输入模板编号"></el-input>
							<span class="filter-txt">
								所属系统：
							</span>
							<el-select @change="handleChange" clearable size="mini" v-model="queryForm.systemType">
								<el-option v-for="(o, key) in dictMap['systemType']" :key="key" :label="o.label" :value="o.value"> </el-option>
							</el-select>
						</div>
					</div>
				</div>
				<div class="operation-btns-box">
					<el-button size="mini" @click="handleSearch" type="primary"> 搜索 </el-button>
					<el-button size="mini" @click="handleReset" plain>
						重置
					</el-button>
				</div>
			</div>
		</div>
		<div class="components-container notice-container">
			<div class="filter-containe add-filter">
				<div class="filter">
					<el-button size="mini" @click="handleAdd()" type="primary"> 新增 </el-button>
				</div>
			</div>
			<el-table :cell-class-name="cellClassName" header-row-class-name="notice-tb-header" class="notice-params-table" v-loading="loading" :data="paramsList" style="margin:16px 0px">
				<el-table-column align="center" prop="oid" label="ID"></el-table-column>
				<el-table-column align="center" prop="noticeType" min-width="100px" label="消息类型" show-overflow-tooltip>
					<template slot-scope="scope">
						{{ scope.row.noticeType | noticeTypeFilter }}
					</template>
				</el-table-column>
				<el-table-column align="center" prop="templateNo" min-width="150px" show-overflow-tooltip label="模板编号"> </el-table-column>
				<el-table-column align="center" prop="eventCode" min-width="150px" show-overflow-tooltip="" label="消息发送事件代码"> </el-table-column>
				<el-table-column align="center" prop="eventCloseCode" min-width="150px" show-overflow-tooltip="" label="消息完结事件代码"> </el-table-column>
				<el-table-column align="center" prop="noticePriority" label="优先级">
					<template slot-scope="scope">
						{{ scope.row.noticePriority | noticePriorityFilter }}
					</template>
				</el-table-column>
				<el-table-column align="center" prop="systemType" min-width="100px" label="所属系统" show-overflow-tooltip="">
					<template slot-scope="scope">
						{{ scope.row.systemType | systemTypeFilter }}
					</template>
				</el-table-column>
				<el-table-column align="center" prop="status" min-width="100px" label="状态" show-overflow-tooltip="">
					<template slot-scope="scope">
						{{ scope.row.status | statusFilter }}
					</template>
				</el-table-column>
				<el-table-column align="center" prop="row" label="操作" width="160">
					<template slot-scope="scope">
						<el-button class="trigger-op-btn" @click="handleEdit(scope.row)" type="text" size="mini">编辑</el-button>
						<el-button v-if="scope.row.status === 'N'" class="trigger-op-btn trigger-stop-btn" @click="handleStatus(scope.row)" type="text" size="mini">启用</el-button>
						<el-button v-if="scope.row.status === 'Y'" class="trigger-op-btn trigger-stop-btn" @click="handleStatus(scope.row)" type="text" size="mini">停用</el-button>
						<el-button class="trigger-op-btn delete-btn" @click="handleDelete(scope.row)" type="text" size="mini">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<!-- 分页 -->
			<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
		</div>
		<BindTemplate :createItem="createItem" :showBind="open" @close="dialogClose" @submit="submitForm" />
	</div>
</template>
<script>
import { noticeTriggerList, noticeTriggerDelete, noticeTriggerEdit, noticeTriggerAdd } from '@/api/msg'
import { mapGetters } from 'vuex'
import Pagination from '@/components/Base/Table/pagination'
import { getDictLabel } from '@/utils/tools'
import BindTemplate from '../components/bindTemplate'
export default {
	name: 'NoticeTrigger',
	filters: {
		systemTypeFilter(val) {
			return getDictLabel('systemType', val.toLowerCase())
		},
		noticeTypeFilter(val) {
			return getDictLabel('msgNoticeType', val.toLowerCase())
		},
		statusFilter(val) {
			return val === 'Y' ? '启用' : '停用'
		},
		noticePriorityFilter(val) {
			if (val === 0) return '紧急'
			if (val === 1) return '一般'
			if (val === 2) return '低'
		}
	},
	data() {
		return {
			//弹框开关
			open: false,
			// 查询条件
			tableQuery: {
				descColumns: ['createdTime'],
				columns: [],
				query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
				currPage: 1,
				pageSize: 10
			},
			queryForm: {
				paramCode: '',
				state: ''
			},
			tableConfig: {
				style: {},
				tableIndex: {
					show: false
				},
				// 操作提示
				tips: {
					text: '',
					show: false
				},
				// 分页
				pagination: {
					show: true,
					total: 0
				}
			},
			paramsList: [],
			createItem: {
				oid: '',
				systemType: '',
				templateNo: '',
				noticeType: '',
				eventCode: '',
				eventCloseCode: [],
				noticePriority: '',
				employeeIdField: '',
				emailField: '',
				status: ''
			},
			loading: false
		}
	},
	// table基础组件
	components: {
		Pagination,
		BindTemplate
	},
	created() {
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	mounted() {
		this.getList()
	},

	computed: {
		...mapGetters(['dictMap'])
	},
	methods: {
		cellClassName({ row, column, rowIndex, columnIndex }) {
			if (column.property === 'noticePriority') {
				if (row['noticePriority'] === 0) {
					return 'notice-priority-high'
				}
				if (row['noticePriority'] === 1) {
					return 'notice-priority-middle'
				}
				if (row['noticePriority'] === 2) {
					return 'notice-priority-low'
				}
			}
			return ''
		},
		handleChange() {
			this.$nextTick(() => {
				document.activeElement.blur()
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
				//触发的事件
				this.handleSearch()
			}
		},
		//修改启用停用状态
		handleStatus(row) {
			row.status = row.status === 'Y' ? 'N' : 'Y'
			noticeTriggerEdit(row).then(res => {
				this.$message({ message: '编辑成功', type: 'success' })
				this.getList()
			})
		},
		//搜索按钮
		handleSearch() {
			this.tableQuery.currPage = 1
			this.getList(true)
		},
		//搜索取消按钮
		handleReset() {
			this.queryForm.paramCode = undefined
			this.queryForm.state = undefined
			this.handleSearch()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		handleSizeChange() {
			this.getList()
		},

		handleCurrentChange() {
			this.getList()
		},

		//清空数据
		dialogClose() {
			this.open = false
			// this.$refs['createItemForm'].resetFields()
			Object.assign(this.createItem, {
				oid: '',
				systemType: '',
				templateNo: '',
				noticeType: '',
				eventCode: '',
				eventCloseCode: [],
				noticePriority: '',
				employeeIdField: '',
				emailField: '',
				status: ''
			})
		},
		//新增菜单
		handleAdd() {
			this.open = true
		},
		//菜单编辑
		handleEdit(row) {
			for (var p in this.createItem) {
				this.createItem[p] = row[p]
			}
			if (this.createItem.noticeType) {
				this.createItem.noticeType = this.createItem.noticeType.toLowerCase()
			}
			if (this.createItem.systemType) {
				this.createItem.systemType = this.createItem.systemType.toLowerCase()
			}
			if (this.createItem.eventCloseCode) {
				this.createItem.eventCloseCode = this.createItem.eventCloseCode.split(',')
			}
			this.open = true
		},

		//删除列表
		handleDelete(row) {
			this.$confirm('确定删除吗?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					noticeTriggerDelete({ oid: row.oid }).then(res => {
						this.$message.success('删除成功!')
						this.getList()
					})
				})
				.catch(() => {})
		},
		getList(isSearch) {
			this.loading = true
			this.initQueryForm(isSearch)
			noticeTriggerList(this.tableQuery).then(res => {
				let { totalCount } = res.data
				this.tableConfig.pagination.total = totalCount
				this.paramsList = res.data.list
				this.loading = false
			})
		},
		initQueryForm(isSearch) {
			let obj = this.queryForm
			let query = []

			Object.keys(obj).forEach(function(key) {
				if (obj[key]) {
					//默认的查询条件组装tableQuery参数
					let tempQuery = {}
					Object.assign(tempQuery, {
						column: key,
						type: 'like',
						value: obj[key]
					})
					query.push(tempQuery)
				}
			})
			if (isSearch) {
				this.searchBackup = query
			}
			this.tableQuery.query = this.searchBackup || []
		},
		// 取消按钮
		cancel() {
			this.open = false
		},
		//保存按钮操作
		submitForm() {
			this.open = false
			this.getList()
		}
	},
	destroyed() {
		window.removeEventListener('keydown', this.handleKeyDown)
	}
}
</script>
<style>
@import '../css/notice.css';
</style>
<style lang="scss" scoped>
.msg-finish-code {
	padding: 0px 4px;
	width: 80%;
	height: 80px;
	border-radius: 4px;
	border: 1px solid #ddd;
	.el-tag {
		margin-right: 4px;
	}
}
.menu {
	// margin: 10px;
	.notice-params-table {
		/deep/ .notice-priority-high {
			color: #cd4130;
		}
		/deep/ .notice-priority-middle {
			color: #EDB534;
		}
		/deep/ .notice-priority-low {
			color: #4A4A4A;
		}
		/deep/ .cell.el-tooltip {
			overflow: hidden;
		}
		/deep/ .trigger-op-btn {
			padding: 0 !important;
			margin-left: 10px;
		}
		/deep/ .trigger-stop-btn {
			color: #edb534;
		}
	}
	.filter-containe {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		font-size: 12px;
		color: #333;
		align-items: baseline;
		flex-wrap: wrap;
		.filter {
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
	.el-table th > .cell {
		color: #222222;
	}
	// .el-tag {
	// 	background-color: #fff;
	// 	color: #4a4a4a;
	// 	border-style: none;
	// }
	.dialog-add {
		margin-top: 16px;
		.el-button {
			border: 1px dashed #dcdfe6;
		}
	}
	.input-width {
		width: 150px;
	}

	.el-input__prefix {
		line-height: 28px;
		color: #000000;
	}
	.el-input--prefix .el-input__inner {
		padding-left: 45px;
	}
}
.payment-advance {
	color: #fff;
	padding: 6px 16px;
	line-height: 150%;
}

.operation-btns-box {
	padding-left: 10px;
	margin-left: auto;
}
.parentWrap {
	margin-left: 12px;
	padding-bottom: 10px;
	.text {
		font-size: 14px;
	}
}
</style>
