<template>
	<div class="menu">
		<div class="components-container">
			<div class="filter-containe search-layout">
				<div class="filter">
					<div class="search-containe">
						<div>
							<span class="filter-txt"> 船司代码: </span>
							<el-input clearable class="input-width" size="mini" v-model="queryForm.carrierCode" placeholder="中英文模糊查询"></el-input>
							<span class="filter-txt"> 航线名称: </span>
							<el-input clearable class="input-width" size="mini" v-model="queryForm.name" placeholder="中英文模糊查询"></el-input>
							<span class="filter-txt">是否启用:</span>
							<el-select filterable clearable size="mini" v-model="queryForm.state">
								<el-option v-for="(o, key) in dictMap['state']" :key="key" :label="$t(`dict.state.${o.value}`)" :value="o.value"></el-option>
							</el-select>
						</div>
					</div>
				</div>
				<el-button style="margin-left: 16px" size="mini" @click="handleSearch" type="primary"> <i class="el-icon-search"></i> 搜索 </el-button>
				<el-button size="mini" @click="handleReset" plain> 重置 </el-button>
			</div>
		</div>
		<div class="components-container m-t-8">
			<div class="filter-containe search-layout">
				<div class="filter">
					<el-button size="mini" @click="handleAdd()" type="primary"> <i class="el-icon-plus"></i> 新增船司信息 </el-button>
				</div>
			</div>
			<el-table v-loading="loading" :data="shippingCarrierList" style="margin: 16px 0px">
				<el-table-column align="center" prop="carrierCode" label="船司代码" width="100px"></el-table-column>
				<el-table-column align="center" prop="cname" label="中文名称" width="150px" show-overflow-tooltip></el-table-column>
				<el-table-column align="center" prop="ename" label="英文名称" show-overflow-tooltip></el-table-column>
				<el-table-column align="center" prop="shortCname" label="中文简称"></el-table-column>
				<el-table-column align="center" prop="shortEname" label="英文简称"></el-table-column>
				<el-table-column align="center" prop="scac" label="SCAC代码"></el-table-column>
        <el-table-column align="center" prop="webUrl" label="船司官网"></el-table-column>
				<el-table-column align="center" prop="state" label="是否启用">
					<template slot-scope="scope">
						{{ scope.row.state === 'valid' ? '是' : '否' }}
					</template>
				</el-table-column>
				<el-table-column align="center" prop="row" label="操作" width="100" fixed="right">
					<template slot-scope="scope">
						<el-button @click="handleEdit(scope.row)" type="text" size="mini">查看</el-button>
					</template>
				</el-table-column>
			</el-table>
			<!-- 分页 -->
			<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
		</div>
		<el-dialog :title="title" :visible.sync="open" :lock-scroll="true" width="800px" @close="dialogClose">
			<el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":">
				<el-form-item label="船司代码" label-width="100px" prop="carrierCode">
					<el-input style="width: 95%;" size="mini" :disabled="createItem.carrierId != ''" v-model="createItem.carrierCode"></el-input>
				</el-form-item>
				<el-form-item label="中文全称" label-width="100px" prop="cname">
					<el-input style="width: 95%;" size="mini" v-model="createItem.cname"></el-input>
				</el-form-item>
				<el-form-item label="英文全称" label-width="100px" prop="ename">
					<el-input style="width: 95%;" size="mini" v-model="createItem.ename"></el-input>
				</el-form-item>
				<el-form-item label="中文简称" label-width="100px" prop="shortCname">
					<el-input style="width: 95%;" size="mini" v-model="createItem.shortCname"></el-input>
				</el-form-item>
				<el-form-item label="英文简称" label-width="100px" prop="shortEname">
					<el-input style="width: 95%;" size="mini" v-model="createItem.shortEname"></el-input>
				</el-form-item>
				<el-form-item label="SCAC代码" label-width="100px" prop="scac">
					<el-input style="width: 95%;" size="mini" v-model="createItem.scac"></el-input>
				</el-form-item>
        <el-form-item label="船司官网" label-width="100px" prop="webUrl">
					<el-input style="width: 95%;" size="mini" v-model="createItem.webUrl"></el-input>
				</el-form-item>
				<el-form-item label="船司黑名单" label-width="100px" prop="blackUrlList">
					<div class="black-class">
						<div class="black-item" v-for="(item, index) in createItem.blackUrlList" :key="index">
							<el-input class="input-shortname-class"  maxlength="128"  size="mini" v-model="item.name" placeholder="请输入简称"></el-input>
							<el-input class="input-url-class" maxlength="512" size="mini" v-model="item.url" placeholder="请输入黑名单链接"></el-input>
							<i class="el-icon-circle-plus-outline icon-class" @click="doneShow('add')" v-if="index === 0"></i>
							<i class="el-icon-remove-outline icon-class" @click="doneShow('delete', index)" v-if="createItem.blackUrlList.length > 1"></i>
						</div>
					</div>
				</el-form-item>
				<el-form-item label="是否启用" label-width="100px" prop="state">
					<el-radio-group v-model="createItem.state">
						<el-radio v-for="(o, key) in dictMap['state']" :key="key" :label="o.value">
							{{ $t(`dict.state.${o.value}`) }}
						</el-radio>
					</el-radio-group>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="mini" type="primary" @click="submitForm('createItemForm')"> <i class="el-icon-copy-document"></i> 保存 </el-button>
				<el-button size="mini" @click="cancel">取 消</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import { shippingCarrierList, shippingCarrierSave, getBlackUrl } from '@/api/baseData'
import { mapGetters } from 'vuex'
import Pagination from '@/components/Base/Table/pagination'

export default {
	name: 'shippingCarrierList',
	data() {
		return {
			//弹框标题
			title: '',
			//弹框开关
			open: false,
			action: '',
			// 查询条件
			tableQuery: {
				columns: [],
				query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
				currPage: 1,
				pageSize: 10
			},
			queryForm: {
				carrierCode: '',
				name: '',
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
			sysGenCodeChecked: true,
			shippingCarrierList: [],
			createItem: {
				carrierId: '',
				carrierCode: '',
				cname: '',
				ename: '',
				shortEname: '',
				shortCname: '',
				scac: '',
				blackUrlList: [
					{ name: '', url: '' }
				],
				state: 'valid'
			},
			sysLineCode: '',
			loading: false,
			//附加费模板
			rules: {
				carrierCode: [
					{
						required: true,
						message: '船司代码不能为空',
						trigger: 'blur,change'
					}
				],
				state: [
					{
						required: true,
						message: '是否启用不能为空',
						trigger: 'blur,change'
					}
				]
			}
		}
	},
	// table基础组件
	components: {
		Pagination
	},
	created() {},
	mounted() {
		this.getList()
	},
	computed: {
		...mapGetters(['userId', 'dictMap'])
	},

	methods: {
		//搜索按钮
		handleSearch() {
			this.tableQuery.currPage = 1
			this.getList(true)
		},
		//搜索取消按钮
		handleReset() {
			this.queryForm.carrierCode = undefined
			this.queryForm.name = undefined
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

		//清空数据
		dialogClose() {
			this.$refs['createItemForm'].resetFields()
			Object.assign(this.createItem, {
				carrierId: '',
				carrierCode: '',
				cname: '',
				ename: '',
				shortEname: '',
				shortCname: '',
				scac: '',
				blackUrlList: [
					{ name: '', url: '' }
				],
				state: 'valid'
			})
		},

		//新增菜单
		handleAdd() {
			this.open = true
			this.title = '新增船司信息'
			this.action = 'add'
		},
		//菜单编辑
		handleEdit(row) {
			this.open = true
			this.action = 'edit'
			this.title = '查看船司信息'
			getBlackUrl(row.carrierCode)
			.then(res => {
        if (row) {
					for (var p in this.createItem) {
						this.createItem[p] = row[p]
					}
					if (res.data && res.data.length) {
						this.createItem.blackUrlList = res.data
					} else {
            this.createItem.blackUrlList = [
							{ name: '', url: '' }
						]
					}
					
					this.sysLineCode = row.sysLineCode
				}
			})
		},
		getList(isSearch) {
			this.loading = true
			this.initQueryForm(isSearch)
			shippingCarrierList(this.tableQuery).then(res => {
				let { totalCount } = res.data
				this.tableConfig.pagination.total = totalCount
				this.shippingCarrierList = res.data.list
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
						type: 'eq',
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
		doneShow(type, index) {
       if (type === 'add') {
				this.createItem.blackUrlList.push({ name: '', url: '' })
			 } else {
         this.createItem.blackUrlList.splice(index, 1)
			 }
		},
		// 取消按钮
		cancel() {
			this.open = false
		},
		getblackUrlList() {
			if (this.createItem.blackUrlList) {
				return this.createItem.blackUrlList.filter(item => {
					return item.name && item.url
				})
			} else {
				return []
			}
		},
		//保存按钮操作
		submitForm(formName) {
			let blackUrlList = this.getblackUrlList()
			this.$refs[formName].validate(valid => {
				if (valid) {
					shippingCarrierSave({ ...this.createItem, blackUrlList }).then(res => {
						this.$message({ message: '恭喜你，保存成功', type: 'success' })
						this.open = false
						this.handleSearch()
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
// components/Base组件
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
.black-class {
	width: 95%;
	.black-item {
		&+.black-item {
			margin-top: 5px;
		}
		display: flex;
		align-items: center;
		.input-shortname-class {
			width: 200px;
		}
		.input-url-class {
			width: 360px;
			margin-left: 10px;
		}
		.icon-class {
			cursor: pointer;
			margin-left: 3px;
		}
	}
}
</style>
