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
			<el-table :cell-class-name="cellClassName"  header-row-class-name="notice-tb-header" class="notice-params-table" v-loading="loading" :data="paramsList" style="margin:16px 0px">
				<!-- <el-table-column align="center" prop="configKey" label="编号"></el-table-column> -->
				<el-table-column align="center" prop="configName" min-width="150px" label="配置名称" show-overflow-tooltip> </el-table-column>
				<el-table-column align="center" prop="pollType" label="级别">
					<template slot-scope="scope">
						{{ scope.row.pollType | pollTypeFilter }}
					</template>
				</el-table-column>
				<el-table-column align="center" prop="templateNo" label="模板编号" show-overflow-tooltip> </el-table-column>
				<el-table-column align="center" prop="filterSql" min-width="100px" label="筛选数据SQL" show-overflow-tooltip=""> </el-table-column>
				<el-table-column align="center" prop="keyNoTemp" min-width="100px" label="主键标识" show-overflow-tooltip=""> </el-table-column>
				<el-table-column align="center" prop="checkSql" min-width="100px" label="检查SQL" show-overflow-tooltip=""> </el-table-column>
				<el-table-column align="center" prop="employeeField" min-width="100px" label="通知人字段" show-overflow-tooltip=""> </el-table-column>
				<el-table-column align="center" prop="noticeToSql" min-width="100px" label="通知人SQL" show-overflow-tooltip=""> </el-table-column>
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
				<el-table-column align="center" prop="useStatus" min-width="100px" label="状态" show-overflow-tooltip="">
					<template slot-scope="scope">
						{{ scope.row.useStatus | statusFilter }}
					</template>
				</el-table-column>
				<el-table-column align="center" prop="row" label="操作" width="160">
					<template slot-scope="scope">
						<el-button class="trigger-op-btn" @click="handleEdit(scope.row)" type="text" size="mini">编辑</el-button>
						<el-button v-if="scope.row.useStatus === 'stop'" class="trigger-op-btn trigger-stop-btn" @click="handleStatus(scope.row)" type="text" size="mini">启用</el-button>
						<el-button v-if="scope.row.useStatus === 'enable'" class="trigger-op-btn trigger-stop-btn" @click="handleStatus(scope.row)" type="text" size="mini">停用</el-button>
						<el-button class="trigger-op-btn delete-btn" @click="handleDelete(scope.row)" type="text" size="mini">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<!-- 分页 -->
			<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
		</div>
		<el-dialog class="notice-dialog" :title="title" :visible.sync="open" :lock-scroll="true" width="600px" @close="dialogClose">
			<el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":">
				<el-form-item style="width:45%;display:inline-block;" label="配置名称" label-width="120px" prop="configName">
					<el-input style="width:100%" size="mini" v-model="createItem.configName"></el-input>
				</el-form-item>
				<el-form-item style="width:45%;display:inline-block;" label="轮询级别" label-width="90px" prop="pollType">
					<el-select style="width:80%" size="mini" v-model="createItem.pollType">
						<el-option v-for="(o, key) in pollTypeList" :key="key" :label="o.label" :value="o.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item style="width:45%;display:inline-block;" label="优先级" label-width="120px" prop="noticePriority">
					<el-select style="width:100%" size="mini" v-model="createItem.noticePriority">
						<el-option v-for="(o, key) in noticePriorityList" :key="key" :label="o.label" :value="o.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item style="width:45%;display:inline-block;" label="所属系统" label-width="90px" prop="systemType">
					<el-select style="width:80%" size="mini" v-model="createItem.systemType">
						<el-option v-for="(o, key) in dictMap['systemType']" :key="key" :label="o.label" :value="o.value"> </el-option>
					</el-select>
				</el-form-item>
				<!-- <el-form-item label="模板编号" label-width="120px" prop="templateNo">
					<el-input style="width:80%" size="mini" v-model="createItem.templateNo"></el-input>
				</el-form-item> -->
				<el-form-item label="模板编号" label-width="120px" prop="templateNo">
					<el-select filterable style="width:80%" size="mini" v-model="createItem.templateNo">
						<el-option v-for="(o, key) in noticeTemplateList" :key="key" :label="o.label" :value="o.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="筛选数据SQL" label-width="120px" prop="filterSql">
					<el-input type="textarea"  style="width:80%" size="mini" v-model="createItem.filterSql"></el-input>
				</el-form-item>
				<el-form-item label="主键标识" label-width="120px" prop="keyNoTemp">
					<el-input type="textarea" style="width:80%" size="mini" v-model="createItem.keyNoTemp"></el-input>
				</el-form-item>
				<el-form-item label="再次提醒检查SQL" label-width="120px" prop="checkSql">
					<el-input type="textarea" style="width:80%" size="mini" v-model="createItem.checkSql"></el-input>
				</el-form-item>
				<el-form-item label="通知人字段" label-width="120px" prop="employeeField">
					<el-input style="width:80%" size="mini" v-model="createItem.employeeField"></el-input>
				</el-form-item>
				<el-form-item label="通知人SQL" label-width="120px" prop="noticeToSql">
					<el-input style="width:80%" size="mini" v-model="createItem.noticeToSql"></el-input>
				</el-form-item>
				
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="mini" type="primary" @click="submitForm('createItemForm')">确 认</el-button>
				<el-button size="mini" @click="cancel">取 消</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import { noticeDelayList, noticeTemplateList, noticeDelayDelete, noticeDelayEdit, noticeDelayAdd, noticeDelayDetail, noticeDelayEnableOrStop } from '@/api/msg'
import { mapGetters } from 'vuex'
import Pagination from '@/components/Base/Table/pagination'
import { getDictLabel } from '@/utils/tools'
export default {
	name: 'NoticeDelay',
	filters: {
		pollTypeFilter(val) {
			if (val === 'D') return '天'
			if (val === 'H') return '小时'
		},
		systemTypeFilter(val) {
			return getDictLabel('systemType', val.toLowerCase())
		},
		noticeTypeFilter(val) {
			return getDictLabel('msgNoticeType', val.toLowerCase())
		},
		statusFilter(val) {
			if (val === 'enable') return '启用'
			if (val === 'stop') return '停用'
		},
		noticePriorityFilter(val) {
			if (val === 0) return '紧急'
			if (val === 1) return '一般'
			if (val === 2) return '低'
		}
	},
	data() {
		return {
			noticeTemplateList: [],
			noticePriorityList: [
				{ label: '紧急', value: 0 },
				{ label: '一般', value: 1 },
				{ label: '低', value: 2 }
			],
			pollTypeList: [
				{ label: '小时', value: 'H' },
				{ label: '天', value: 'D' }
			],
			//弹框标题
			title: '',
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
			sysGenCodeChecked: true,
			createItem: {
				oid: '',
				keyNoTemp: '',
				configKey: '',
				configName: '',
				templateNo: '',
				filterSql: '',
				checkSql: '',
				employeeField: '',
				noticeToSql: '',
				pollType: '',
				noticePriority: '',
				systemType: ''
			},
			loading: false,
			//附加费模板
			rules: {
				configName: [{ required: true, message: '配置名称不能为空', trigger: 'blur' }],
				templateNo: [{ required: true, message: '模板编号不能为空', trigger: 'blur' }],
				filterSql: [{ required: true, message: '筛选数据SQL不能为空', trigger: 'blur' }],
				checkSql: [{ required: true, message: '再次提醒检查SQL不能为空', trigger: 'blur' }],
				keyNoTemp: [{ required: true, message: '主键标识不能为空', trigger: 'blur' }]
			}
		}
	},
	// table基础组件
	components: {
		Pagination
	},
	created() {
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
		//模板下拉框
		let tableQuery={...this.tableQuery,pageSize:1000}
		noticeTemplateList(tableQuery).then(res => {
			this.noticeTemplateList = res.data.list.map(item => {
				return { label: item.tempNo, value: item.tempNo }
			})
		})
	},
	mounted() {
		this.getList()
		console.log('🚀 ~ this.dictMap.pollType', this.dictMap)
	},

	computed: {
		...mapGetters(['userId', 'dictMap'])
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
			row.useStatus = row.useStatus === 'enable' ? 'stop' : 'enable'
			noticeDelayEnableOrStop({ oid: row.oid, useStatus: row.useStatus }).then(res => {
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
			// Add、Export、CustomColumns、ChangeLockState、Muti、SizeChange、CurrentChange、SingleEdit
			// MultiEdit、 MultiPublish、MultiInvalid、MultiDelete
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		handleSizeChange() {
			this.getList()
		},

		handleCurrentChange() {
			this.getList()
		},
		handleChangeSystemGenCode(val) {
			this.createItem.sysGenCode = 'no'
			if (this.sysGenCodeChecked) {
				this.createItem.sysGenCode = 'yes'
				this.createItem.roleCode = ''
			}
		},
		//清空数据
		dialogClose() {
			this.$refs['createItemForm'].resetFields()
			Object.assign(this.createItem, {
				oid: '',
				keyNoTemp: '',
				configKey: '',
				configName: '',
				templateNo: '',
				filterSql: '',
				checkSql: '',
				employeeField: '',
				noticeToSql: '',
				pollType: '',
				noticePriority: '',
				systemType: ''
			})
		},
		//新增菜单
		handleAdd() {
			this.open = true
			this.title = '轮询消息模板配置'
		},
		//菜单编辑
		handleEdit(row) {
			this.title = '轮询消息模板配置'
			for (var p in this.createItem) {
				this.createItem[p] = row[p]
			}
			if (this.createItem.systemType) {
				this.createItem.systemType = this.createItem.systemType.toLowerCase()
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
					noticeDelayDelete({ oid: row.oid }).then(res => {
						this.$message.success('删除成功!')
						this.getList()
					})
				})
				.catch(() => {})
		},
		getList(isSearch) {
			this.loading = true
			this.initQueryForm(isSearch)
			noticeDelayList(this.tableQuery).then(res => {
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
		submitForm(formName) {
			this.$refs[formName].validate(valid => {
				if (!valid) return false
				if (this.createItem.oid) {
					noticeDelayEdit(this.createItem).then(res => {
						this.$message({ message: '编辑成功', type: 'success' })
						this.open = false
						this.getList()
					})
				} else {
					delete this.createItem.oid
					noticeDelayAdd(this.createItem).then(res => {
						this.$message({ message: '新增成功', type: 'success' })
						this.open = false
						this.getList()
					})
				}
			})
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
// components/Base组件
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
	.el-tag {
		background-color: #fff;
		color: #4a4a4a;
		border-style: none;
	}
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
