<template>
	<div class="menu">
		<div class="components-container notice-container search-layout">
			<div class="filter-containe ">
				<div class="filter">
					<div class="search-containe">
						<div>
							<span class="filter-txt">
								参数描述:
							</span>
							<el-input clearable class="input-width" size="mini" v-model="queryForm.paramDesc" placeholder="请输入参数描述"></el-input>
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
					<el-button size="mini" @click="handleSearch" type="primary">  搜索 </el-button>
					<el-button size="mini" @click="handleReset" plain>
						重置
					</el-button>
				</div>
			</div>
		</div>
		<div class="components-container notice-container">
			<div class="filter-containe  add-filter">
				<div class="filter">
					<el-button size="mini" @click="handleAdd()" type="primary"> 新增 </el-button>
				</div>
			</div>
			<el-table header-row-class-name='notice-tb-header' class="notice-params-table" v-loading="loading" :data="paramsList" style="margin:16px 0px">
				<el-table-column align="center" prop="oid" label="ID"></el-table-column>
				<el-table-column align="center" prop="paramDesc" min-width="150px" label="参数描述" show-overflow-tooltip> </el-table-column>
				<el-table-column align="center" prop="paramKey" label="参数标识"> </el-table-column>
				<el-table-column align="center" prop="paramValue" label="参数值"> </el-table-column>
				<el-table-column align="center" prop="systemType" min-width="100px" label="所属系统" show-overflow-tooltip="">
					<template slot-scope="scope">
						{{ scope.row.systemType | systemTypeFilter }}
					</template>
				</el-table-column>

				<el-table-column align="center" prop="row" label="操作" width="110">
					<template slot-scope="scope">
						<el-button @click="handleEdit(scope.row)" type="text" size="mini">编辑</el-button>
						<el-button class="delete-btn" @click="handleDelete(scope.row)" type="text" size="mini">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<!-- 分页 -->
			<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
		</div>
		<el-dialog class="notice-dialog" :title="title" :visible.sync="open" :lock-scroll="true" width="600px" @close="dialogClose">
			<el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":">
				<el-form-item label="参数描述" label-width="80px" prop="paramDesc">
					<el-input style="width:80%" type="textarea" size="mini" v-model="createItem.paramDesc"></el-input>
				</el-form-item>
				<el-form-item label="参数标识" label-width="80px" prop="paramKey">
					<el-input style="width:80%"  type="textarea" size="mini" v-model="createItem.paramKey"></el-input>
				</el-form-item>
				<el-form-item label="参数值" label-width="80px" prop="paramValue">
					<el-input style="width:80%"  type="textarea" size="mini" v-model="createItem.paramValue"></el-input>
				</el-form-item>
				<el-form-item label="所属系统" label-width="80px" prop="systemType">
					<el-select style="width:80%" size="mini" v-model="createItem.systemType">
						<el-option v-for="(o, key) in dictMap['systemType']" :key="key" :label="o.label" :value="o.value"> </el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="mini" type="primary" @click="submitForm('createItemForm')"> 确 认</el-button>
				<el-button size="mini" @click="cancel">取 消</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import { noticeParamList, noticeParamDelete, noticeParamEdit, noticeParamAdd } from '@/api/msg'
import { mapGetters } from 'vuex'
import Pagination from '@/components/Base/Table/pagination'
import { getDictLabel } from '@/utils/tools'
export default {
	name: 'NoticeParams',
	filters: {
		systemTypeFilter(val) {
			return getDictLabel('systemType', val.toLowerCase())
		}
	},
	data() {
		return {
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
				paramDesc: '',
				paramKey: '',
				paramValue: '',
				systemType: ''
			},
			loading: false,
			//附加费模板
			rules: {
				paramDesc: [{ required: true, message: ' ', trigger: 'blur' }], // 参数描述不能为空
				paramKey: [{ required: true, message: ' ', trigger: 'blur' }], // 参数标识不能为空
				systemType: [{ required: true, message: ' ', trigger: 'blur' }] // 所属系统不能为空
			}
		}
	},
	// table基础组件
	components: {
		Pagination
	},
	created() {
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	mounted() {
		this.getList()
	},

	computed: {
		...mapGetters(['userId', 'dictMap'])
	},
	methods: {
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

		//搜索按钮
		handleSearch() {
			this.tableQuery.currPage = 1
			this.getList(true)
		},
		//搜索取消按钮
		handleReset() {
			this.queryForm.paramDesc = undefined
			this.queryForm.systemType = undefined
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
				paramDesc: '',
				paramKey: '',
				paramValue: '',
				systemType: ''
			})
		},
		//新增菜单
		handleAdd() {
			this.open = true
			this.title = '新增参数'
		},
		//菜单编辑
		handleEdit(row) {
			this.title = '编辑参数'
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
					noticeParamDelete({ oid: row.oid }).then(res => {
						this.$message.success('删除成功!')
						this.getList()
					})
				})
				.catch(() => {})
		},
		getList(isSearch) {
			this.loading = true
			this.initQueryForm(isSearch)
			noticeParamList(this.tableQuery).then(res => {
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
					noticeParamEdit(this.createItem).then(res => {
						this.$message({ message: '编辑成功', type: 'success' })
						this.open = false
						this.getList()
					})
				} else {
					delete this.createItem.oid
					noticeParamAdd(this.createItem).then(res => {
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
.menu {
	// margin: 10px;
	.notice-params-table {
		/deep/ .cell.el-tooltip {
			overflow: hidden;
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
