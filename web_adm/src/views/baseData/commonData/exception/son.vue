<template>
	<div class="menu">
		<FinanceSearch :searchOption="searchOption1" @search="search" />
		<div class="finance-search-list-gap"></div>
		<div class="finance-list-container">
			<div class="money-box">
				<div class="money-box-left">
					<el-button size="mini" @click="handleAdd()" type="primary"> 新增</el-button>
					<el-button size="mini" @click="handleInvalid" type="danger"> 禁用</el-button>
				</div>
			</div>
			<FinanceTable class="exp-type-table" ref="tablex01" :option="option1" @send-multi="sendMulti" />
		</div>
		<el-dialog :title="title" :visible.sync="open" :lock-scroll="true" width="600px" @close="dialogClose">
			<el-form class="exception-form" :show-message="false" ref="createItemForm" :rules="rules" :model="createItem" label-width="70px">
				<el-form-item label="异常子类 :" prop="expTypeName">
					<el-input clearable maxlength="128" style="width: 100%" size="mini" v-model="createItem.expTypeName"></el-input>
				</el-form-item>
				<el-form-item label="异常大类 :" prop="expParentId">
					<el-select clearable style="width: 100%" filterable size="mini" v-model="createItem.expParentId">
						<el-option v-for="(o, key) in expParentList" :key="key" :label="o.label" :value="o.value"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<el-table :data="createItem.reasonList" border="" style="width: 100%">
				<el-table-column label="异常原因" align="center">
					<template slot-scope="scope">
						<el-input clearable v-if="scope.row.isEdit" maxlength="128" style="width: 100%" size="mini" v-model="scope.row.reasonName"></el-input>
						<span v-else>{{ scope.row.reasonName }}</span>
					</template>
				</el-table-column>
				<el-table-column label="是否可控" align="center">
					<template slot-scope="scope">
						<el-select clearable v-if="scope.row.isEdit" style="width: 100%" size="mini" v-model="scope.row.isControl" placeholder="请输入">
							<el-option v-for="item in yesOrNoOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
						</el-select>
						<span v-else>{{ scope.row.isControl === 'Y' ? '是' : scope.row.isControl === 'N' ? '否' : '' }}</span>
					</template>
				</el-table-column>

				<el-table-column align="center" label="操作">
					<template slot-scope="scope">
						<span @click="handleDelete(scope.$index)" class="delete-btn">删除</span>
					</template>
				</el-table-column>
			</el-table>
			<el-button style="width: 100%; margin-top: 20px" size="mini" type="primary" @click="addRow"> 新增异常原因 </el-button>
			<div slot="footer" class="dialog-footer">
				<el-button size="mini" type="primary" :loading="submitFormLoading" @click="submitForm('createItemForm')"> 保存 </el-button>
				<el-button size="mini" @click="cancel">取 消</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { reasonPageList, saveReason, reasonInvalid, typeList, getTypeByParentId } from '@/api/baseData'
import { mapGetters } from 'vuex'
import { dateFormat } from '@/views/finance/utils/finance'
export default {
	name: 'Son',
	mixins: [mixin],
	data() {
		return {
			expParentList: [],
			yesOrNoOptions: [
				{ label: '是', value: 'Y' },
				{ label: '否', value: 'N' }
			],
			//弹框标题
			title: '',
			//弹框开关
			open: false,
			submitFormLoading: false,
			action: '',
			// 查询条件
			tableQuery: {
				columns: [],
				query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
				currPage: 1,
				pageSize: 10
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
			exchangeRateConfigList: [],
			createItem: {
				oid: '',
				expTypeName: '',
				expParentId: '',
				reasonList: [{ reasonName: '', isControl: '', isEdit: true }]
			},
			loading: false,
			//附加费模板
			rules: {
				expTypeName: [{ required: true, message: '异常子类不能为空', trigger: 'blur' }],
				expParentId: [{ required: true, message: '异常大类不能为空', trigger: 'change' }]
			},
			option1: {},
			searchOption1: {},
			multipleSelection1: []
		}
	},
	// table基础组件
	components: {
		FinanceSearch,
		FinanceTable
	},
	created() {
		this.searchOption1 = {
			saveDefault: false,
			// saveName: 'exception',
			addFilter: {
				defaultSearchLength: 4,
				searchInputGroup: [
					{ key: 'expParentId', value: '', showType: '1' },
					{ key: 'oid', value: '', showType: '2' },
					// { key: 'isControl', value: '', showType: '3' },
					{ key: 'status', value: '', showType: '4' }
				],
				filterGroups: {
					expParentId: {
						label: '异常大类',
						type: 'select',
						showType: '1',
						clearable: true,
						filterable: true,
						selectOptions: [],
						change: val => {
							this.changeExpParent(val)
						}
					},
					oid: {
						label: '异常子类',
						type: 'select',
						showType: '2',
						clearable: true,
						selectOptions: []
					},
					// isControl: {
					// 	label: '是否可控',
					// 	type: 'select',
					// 	selectOptions: [
					// 		{ label: '是', value: 'Y' },
					// 		{ label: '否', value: 'N' }
					// 	],
					// 	showType: '3'
					// },
					status: {
						label: '状态',
						type: 'select',
						selectOptions: [
							{ label: '启用', value: 'valid' },
							{ label: '禁用', value: 'invalid' }
						],
						showType: '4'
					}
				}
			}
		}
		let operationBtns = Object.assign(this.option.operationBtns, {
			data: [
				{
					label: '编辑',
					type: 'text',
					showFn: (row, index) => {
						console.log('🚀 ~ row.status', row.status)
						return row.status === 'valid'
					},
					action: 'Edit'
				}
				// {
				// 	label: '删除',
				// 	type: 'text',
				// 	show: true,
				// 	action: 'Delete'
				// }
			],
			width: 88
		})
		let pagination = Object.assign({}, this.option.pagination, {
			show: true
		})
		this.option1 = Object.assign({}, this.option, {
			spanMethod: this.spanMethod,
			id: 'option1',
			$name: 'exception',
			data: [],
			tips: {
				text: '',
				show: false
			},
			operationBtns,
			pagination
		})
		this.selfColumnsBase = [
			{
				prop: 'expTypeName',
				label: '异常子类',
				type: 'text'
			},
			{
				prop: 'isControl',
				label: '是否可控',
				formatter: ({ row }) => (row.isControl === 'Y' ? `<span class="">是</span>` : row.isControl === 'N' ? `<span class="">否</span>` : '')
			},
			{
				prop: 'reasonName',
				label: '异常原因',
				type: 'text'
			},
			{
				prop: 'expParentName',
				label: '异常大类',
				type: 'text'
			},
			{
				prop: 'status',
				label: '状态',
				formatter: ({ row }) => (row.status === 'valid' ? `<span class="">启用</span>` : row.status === 'invalid' ? `<span class="">禁用</span>` : '')
			},

			{
				prop: 'createdName',
				label: '创建人',
				type: 'text'
			},
			{
				prop: 'createdTime',
				label: '创建时间',
				type: 'text'
			},
			{
				prop: 'updatedName',
				label: '更新人',
				type: 'text'
			},
			{
				prop: 'updatedTime',
				label: '更新时间',
				type: 'text'
			}
		]
		this.option1.columns = [...this.selfColumnsBase]
	},
	mounted() {},
	activated() {
		// 获取大类列表
		this.queryExpParent()
	},
	computed: {
		...mapGetters(['userId', 'dictMap', 'dictMapObj'])
	},

	methods: {
		// 选择大类 请求小类数据
		changeExpParent(val) {
			console.log('🚀 ~ val', val)
			this.searchOption1.addFilter.searchInputGroup.find(item => item.key === 'oid').value = ''
			val &&
				getTypeByParentId(val).then(res => {
					if (res.code === 0) {
						this.searchOption1.addFilter.filterGroups.oid.selectOptions = res.data.map(item => {
							return { ...item, label: item.expTypeName, value: item.oid }
						})
					}
				})
			if (!val) {
				this.searchOption1.addFilter.filterGroups.oid.selectOptions = []
				// this.searchOption1.addFilter.searchInputGroup.find(item => item.key === 'oid').value = ''
			}
		},
		// 大类下拉数据
		queryExpParent(val) {
			let data = { expTypeName: val, status: 'valid' }
			typeList(data).then(res => {
				this.expParentList = res.data.map(item => {
					return { ...item, label: item.expTypeName, value: item.oid }
				})
				this.searchOption1.addFilter.filterGroups.expParentId.selectOptions = this.expParentList
			})
		},
		// 禁用
		handleInvalid() {
			if (this.multipleSelection1.length === 0) return this.$message.error('请选择要禁用的数据')
			let oid = this.multipleSelection1.map(item => item.oid)
			reasonInvalid(oid).then(res => {
				if (res.code === 0) {
					this.$message.success('禁用成功')
					this.getData()
				}
			})
		},
		// 合并表格
		spanMethod({ row, $rowIndex, column, data }) {
			let fields = ['expParentName', 'expTypeName', 'createdName', 'createdTime', 'updatedName', 'updatedTime']
			let cellValue = row[column.property]
			if (cellValue && fields.includes(column.property)) {
				let prevRow = data[$rowIndex - 1]
				let nextRow = data[$rowIndex + 1]
				if (prevRow && prevRow[column.property] === cellValue) {
					return { rowspan: 0, colspan: 0 }
				} else {
					let countRowspan = 1
					while (nextRow && nextRow[column.property] === cellValue) {
						nextRow = data[++countRowspan + $rowIndex]
					}
					if (countRowspan > 1) {
						return { rowspan: countRowspan, colspan: 1 }
					}
				}
			}
			// 合并复选框
			if (column.type === 'checkbox') {
				let prevRow = data[$rowIndex - 1]
				let nextRow = data[$rowIndex + 1]
				if (prevRow && prevRow.expTypeName === row.expTypeName) {
					return { rowspan: 0, colspan: 0 }
				} else {
					let countRowspan = 1
					while (nextRow && nextRow.expTypeName === row.expTypeName) {
						nextRow = data[++countRowspan + $rowIndex]
					}
					if (countRowspan > 1) {
						return { rowspan: countRowspan, colspan: 1 }
					}
				}
			}
		},

		// 新增一行
		addRow() {
			this.createItem.reasonList.push({ reasonName: '', isControl: '', isEdit: true })
		},
		search() {
			this.option1.pagination.currPage = 1
			this.getData(true)
		},
		getData(isSearch) {
			let data = {
				currPage: this.option1.pagination.currPage,
				pageSize: this.option1.pagination.pageSize,
				query: [],
				columns: this.customColumnsKeys
			}
			this.searchOption1.addFilter.searchInputGroup.forEach(item => {
				let { key, value, columnReq } = item
				if (columnReq && item[columnReq]) {
					data.query.push({
						column: columnReq,
						type: 'eq',
						value: item[columnReq]
					})
				} else if (value) {
					if (key === 'queryDate') {
						data.query.push({
							column: 'beginDate',
							type: 'eq',
							value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00'
						})
						data.query.push({
							column: 'endDate',
							type: 'eq',
							value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59'
						})
					} else if (key === 'createdTime') {
						data.query.push({
							column: 'createdTimeStart',
							type: 'eq',
							value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00'
						})
						data.query.push({
							column: 'createdTimeEnd',
							type: 'eq',
							value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59'
						})
					} else {
						data.query.push({
							column: key,
							type: 'eq',
							value: value
						})
					}
				}
			})
			if (isSearch) {
				this.searchBackup = data.query
			}
			data.query = this.searchBackup || []
			this.loading = true
			reasonPageList(data)
				.then(res => {
					this.option1.data = res.data.list
					Object.assign(this.option1.pagination, res.data)
				})
				.finally(() => {
					this.loading = false
				})
		},
		sendMulti(data, option) {
			if (option === this.option1) this.multipleSelection1 = data
		},
		handleSizeChange(val) {
			this.option1.pagination.pageSize = val
			this.getData && this.getData()
		},
		handleCurrentChange(val) {
			this.option1.pagination.currPage = val
			this.getData && this.getData()
		},

		//清空数据
		dialogClose() {
			this.$refs['createItemForm'].resetFields()
			Object.assign(this.createItem, {
				oid: '',
				expParentId: '',
				expTypeName: '',
				reasonList: [{ reasonName: '', isControl: '', isEdit: true }]
			})
		},

		//搜索按钮
		handleSearch() {
			this.tableQuery.currPage = 1
			this.getList(true)
		},
		//搜索取消按钮
		handleReset() {
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

		//新增菜单
		handleAdd() {
			this.open = true
			this.title = '新增异常类型'
			this.action = 'add'
		},
		//菜单编辑
		handleEdit(row) {
			console.log('🚀 ~ row', row)
			this.action = 'edit'
			this.title = '修改异常类型'
			if (row) {
				for (var p in this.createItem) {
					this.createItem[p] = row[p]
				}
				this.createItem.reasonList = this.option1.data
					.filter(item => item.oid === row.oid)
					.map(item => {
						return { reasonName: item.reasonName, isControl: item.isControl, isEdit: false }
					})
				console.log('🚀 ~ this.createItem.reasonList', this.createItem.reasonList)
				this.open = true
			}
		},
		//删除列表
		handleDelete(index) {
			this.createItem.reasonList.splice(index, 1)
		},
		getList(isSearch) {
			this.loading = true
			reasonPageList(this.tableQuery).then(res => {
				let { totalCount } = res.data
				this.tableConfig.pagination.total = totalCount
				this.exchangeRateConfigList = res.data.list
				this.loading = false
			})
		},

		// 取消按钮
		cancel() {
			this.open = false
		},
		//保存按钮操作
		submitForm(formName) {
			if (this.createItem.reasonList.some(item => !item.reasonName)) {
				return this.$message.error('异常原因不能为空!')
			}
			this.$refs[formName].validate(valid => {
				if (valid) {
					this.submitFormLoading = true

					saveReason(this.createItem)
						.then(res => {
							this.$message({ message: '恭喜你，保存成功', type: 'success' })
							this.open = false
							this.getData()
						})
						.finally(() => {
							this.submitFormLoading = false
						})
				} else {
					return false
				}
			})
		}
	}
}
</script>
<style lang="scss" scoped>
.exp-type-table {
	/deep/ td {
		border-right: 1px solid #e8eaec;
	}
}

.delete-btn {
	color: #f00;
	cursor: pointer;
}
.exception-form {
	display: flex;
	.el-form-item {
		width: 50%;
	}
}
.menu {
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
	.m-t-8 {
		margin-top: 8px;
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

.search-layout .operation-btns-box {
	margin-left: 0;
	padding-left: 10px;
}
.parentWrap {
	margin-left: 12px;
	padding-bottom: 10px;
	.text {
		font-size: 14px;
	}
}
</style>
