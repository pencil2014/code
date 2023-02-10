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
			<FinanceTable ref="tablex01" :option="option1" @send-multi="sendMulti" />
		</div>
		<el-dialog :title="title" :visible.sync="open" :lock-scroll="true" width="600px" @close="dialogClose">
			<el-form class="exception-form-parent" :show-message="false" ref="createItemForm" :rules="rules" :model="createItem" label-width="70px">
				<el-form-item label="异常大类 :" prop="expTypeName">
					<el-input clearable maxlength="128" style="width: 100%" size="mini" v-model="createItem.expTypeName"></el-input>
				</el-form-item>
			</el-form>

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
import { typeList, saveType, typeInvalid } from '@/api/baseData'
import { mapGetters } from 'vuex'
import { dateFormat } from '@/views/finance/utils/finance'
export default {
	name: 'Parent',
	mixins: [mixin],
	data() {
		return {
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
					show: false,
					total: 0
				}
			},
			exchangeRateConfigList: [],
			createItem: {
				oid: '',
				expTypeName: ''
			},
			loading: false,
			//附加费模板
			rules: {
				expTypeName: [{ required: true, message: '异常大类不能为空', trigger: 'change' }]
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
			// saveName: 'exceptionBig',
			addFilter: {
				defaultSearchLength: 4,
				searchInputGroup: [
					{ key: 'expTypeName', value: '', showType: '1' },
					{ key: 'status', value: '', showType: '2' }
				],
				filterGroups: {
					expTypeName: {
						label: '异常大类',
						type: 'select',
						showType: '1',
						clearable: true,
						filterable: true,
						selectOptions: []
					},
					// expTypeName: { label: '异常大类', type: 'input', showType: '1' },
					status: {
						label: '状态',
						type: 'select',
						selectOptions: [
							{ label: '启用', value: 'valid' },
							{ label: '禁用', value: 'invalid' }
						]
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
			show: false
		})
		this.option1 = Object.assign({}, this.option, {
			id: 'option1',
			$name: 'exceptionBig',
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
	activated() {
		// 获取大类列表
		this.getData()
	},
	mounted() {},
	computed: {
		...mapGetters(['userId', 'dictMap', 'dictMapObj'])
	},

	methods: {
		// 禁用
		handleInvalid() {
			if (this.multipleSelection1.length === 0) return this.$message.error('请选择要禁用的数据')
			let oid = this.multipleSelection1.map(item => item.oid)
			typeInvalid(oid).then(res => {
				if (res.code === 0) {
					this.$message.success('禁用成功')
					this.getData()
				}
			})
		},
		search() {
			this.option1.pagination.currPage = 1
			this.getData(true)
		},
		getData() {
			let data = {}
			this.searchOption1.addFilter.searchInputGroup.forEach(item => {
				let { key, value } = item
				if (value) {
					data[key] = value
				}
			})
			this.loading = true
			typeList(data)
				.then(res => {
					this.option1.data = res.data
					this.searchOption1.addFilter.filterGroups.expTypeName.selectOptions = res.data.map(item => {
						return { ...item, label: item.expTypeName, value: item.expTypeName }
					})
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
				expTypeName: ''
			})
		},
		//搜索按钮
		handleSearch() {
			this.getData()
		},
		//搜索取消按钮
		handleReset() {
			this.getData()
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
			this.action = 'edit'
			this.title = '修改异常类型'
			if (row) {
				for (var p in this.createItem) {
					this.createItem[p] = row[p]
				}
				this.open = true
			}
		},

		// 取消按钮
		cancel() {
			this.open = false
		},
		//保存按钮操作
		submitForm(formName) {
			this.$refs[formName].validate(valid => {
				if (valid) {
					this.submitFormLoading = true
					let data = JSON.parse(JSON.stringify(this.createItem))
					if (!data.oid) delete data.oid
					saveType(data)
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
.delete-btn {
	color: #f00;
	cursor: pointer;
}
.exception-form-parent {
	display: flex;
	.el-form-item {
		width: 100%;
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
