<template>
	<div class="menu">
		<div class="components-container">
			<div class="filter-containe search-layout">
				<div class="filter">
					<div class="search-containe">
						<div>
							<span class="filter-txt"> 港口名称: </span>
							<el-input clearable class="input-width" size="mini" v-model="queryForm.portCode" placeholder="代码/中英文模糊查询"></el-input>
							<!-- <span class="filter-txt">类型:</span>
							<el-select filterable clearable size="mini" v-model="queryForm.portType">
								<el-option v-for="(o, key) in dictMap['portCategory']" :key="key" :label="$t(`dict.portCategory.${o.value}`)" :value="o.value"></el-option>
							</el-select> -->
							<span class="filter-txt">城市:</span>
							<el-autocomplete
								size="mini"
								v-model="queryForm.cityName"
								:fetch-suggestions="
									(queryString, cb) => {
										cityQuery(queryString, 'query', cb)
									}
								"
								placeholder="请选择城市"
								highlight-first-item
								@change="
									value => {
										citySelect(value, 'query')
									}
								"
								@select="
									value => {
										citySelect(value, 'query')
									}
								"
							>
								<template slot-scope="{ item }">
									<div class="name">{{ item.cname }}</div>
								</template>
							</el-autocomplete>
							<span class="filter-txt">属性:</span>
							<el-select filterable clearable size="mini" v-model="queryForm.portAttribute">
								<el-option v-for="(o, key) in dictMap['airPortAttribute']" :key="key" :label="$t(`dict.airPortAttribute.${o.value}`)" :value="o.value"></el-option>
							</el-select>
							<span class="filter-txt">系统航线:</span>
							<el-autocomplete
								size="mini"
								v-model="queryForm.sysLineName"
								:fetch-suggestions="
									(queryString, cb) => {
										sysLineQuery(queryString, cb)
									}
								"
								placeholder="请选择航线"
								highlight-first-item
								@change="
									value => {
										sysLineSelect(value, 'query')
									}
								"
								@select="
									value => {
										sysLineSelect(value, 'query')
									}
								"
							>
								<template slot-scope="{ item }">
									<div class="name">{{ item.cname }}</div>
								</template>
							</el-autocomplete>
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
					<el-button size="mini" @click="handleAdd()" type="primary"> <i class="el-icon-plus"></i> 新增港口信息 </el-button>
				</div>
			</div>
			<el-table class="port-table" v-loading="loading" :data="portList" style="margin: 16px 0px">
				<el-table-column align="center" prop="portCode" label="港口代码" width="100px"></el-table-column>
				<el-table-column align="center" prop="cname" label="港口中文名称" width="150px" show-overflow-tooltip></el-table-column>
				<el-table-column align="center" prop="ename" label="港口英文名称" width="150px" show-overflow-tooltip></el-table-column>
				<el-table-column align="center" prop="sysLineName" label="航线名称"></el-table-column>
				<el-table-column align="center" prop="cityCode" label="城市编码"></el-table-column>
				<el-table-column align="center" prop="cityCname" label="城市中文名称" width="100px" show-overflow-tooltip></el-table-column>
				<el-table-column align="center" prop="cityEname" label="城市英文名称" width="100px" show-overflow-tooltip></el-table-column>
				<!-- <el-table-column align="center" prop="portType" label="港口类型">
					<template slot-scope="scope">
						{{ $t(`dict.portCategory.${scope.row.portType}`) }}
					</template>
				</el-table-column> -->
				<el-table-column align="center" prop="portAttribute" label="港口属性" width="180px" show-overflow-tooltip>
					<template slot-scope="scope">
						<span v-for="(item, i) in scope.row.portAttribute" :key="i">
							{{ $t(`dict.airPortAttribute.${item}`) }}
						</span>
					</template>
				</el-table-column>
				<el-table-column align="center" prop="countryCname" label="国家名称" width="100px" show-overflow-tooltip></el-table-column>
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
		<el-dialog :title="title" :visible.sync="open" :lock-scroll="true" width="600px" @open="dialogOpen" @close="dialogClose">
			<el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":" label-width="110px">
				<!-- <el-form-item label="类型" prop="portType">
					<el-radio-group  v-model="createItem.portType">
						<el-radio v-for="(o, key) in dictMap['portCategory'].filter(item=>item.value==='port')" :key="key" :label="o.value" @change="portCategoryChange">
							{{ $t(`dict.portCategory.${o.value}`) }}
						</el-radio>
					</el-radio-group>
				</el-form-item> -->
				<el-form-item label="所属港口" v-if="createItem.portType == 'wharf'" prop="parentCname">
					<el-autocomplete
						size="mini"
						v-model="createItem.parentCname"
						style="width: 80%"
						:fetch-suggestions="
							(queryString, cb) => {
								portQuery(queryString, cb)
							}
						"
						placeholder="请选择码头所属港口"
						highlight-first-item
						@change="
							value => {
								portSelect(value)
							}
						"
						@select="
							value => {
								portSelect(value)
							}
						"
					>
						<template slot-scope="{ item }">
							<div class="name">{{ item.value }}</div>
						</template>
					</el-autocomplete>
				</el-form-item>
				<el-form-item :label="portCode" prop="portCode">
					<el-input style="width: 80%" size="mini" :disabled="createItem.oid != ''" v-model="createItem.portCode"></el-input>
				</el-form-item>
				<el-form-item :label="portCname" prop="cname">
					<el-input style="width: 80%" size="mini" v-model="createItem.cname"></el-input>
				</el-form-item>
				<el-form-item :label="portEname" prop="ename">
					<el-input style="width: 80%" size="mini" v-model="createItem.ename"></el-input>
				</el-form-item>
				<el-form-item label="航线" prop="sysLineName">
					<el-autocomplete
						size="mini"
						v-model="createItem.sysLineName"
						style="width: 80%"
						:fetch-suggestions="
							(queryString, cb) => {
								sysLineQuery(queryString, cb)
							}
						"
						placeholder="请选择航线"
						highlight-first-item
						@change="
							value => {
								sysLineSelect(value)
							}
						"
						@select="
							value => {
								sysLineSelect(value)
							}
						"
					>
						<template slot-scope="{ item }">
							<div class="name">{{ item.cname }}</div>
						</template>
					</el-autocomplete>
				</el-form-item>
				<el-row>
					<el-col :span="10">
						<el-form-item label="国家" label-width="110px" prop="countryCname">
							<el-autocomplete
								size="mini"
								v-model="createItem.countryCname"
								:fetch-suggestions="
									(queryString, cb) => {
										countryQuery(queryString, cb)
									}
								"
								placeholder="请选择国家"
								highlight-first-item
								@change="
									value => {
										countrySelect(value)
									}
								"
								@select="
									value => {
										countrySelect(value)
									}
								"
							>
								<template slot-scope="{ item }">
									<div class="name">{{ item.cname }}</div>
								</template>
							</el-autocomplete>
						</el-form-item>
					</el-col>
					<el-col :span="11">
						<el-form-item label="城市" label-width="60px" prop="cityCname">
							<el-autocomplete
								size="mini"
								v-model="createItem.cityCname"
								:fetch-suggestions="
									(queryString, cb) => {
										cityQuery(queryString, '', cb)
									}
								"
								placeholder="请选择城市"
								highlight-first-item
								@change="
									value => {
										citySelect(value, '')
									}
								"
								@select="
									value => {
										citySelect(value, '')
									}
								"
							>
								<template slot-scope="{ item }">
									<div class="name">{{ item.cname }}</div>
								</template>
							</el-autocomplete>
						</el-form-item>
					</el-col>
				</el-row>
				<el-form-item label="属性" prop="portAttribute">
					<el-checkbox-group v-model="portAttributeArray">
						<el-checkbox v-for="(o, key) in dictMap['airPortAttribute']" :key="key" :label="o.value">
							{{ $t(`dict.airPortAttribute.${o.value}`) }}
						</el-checkbox>
					</el-checkbox-group>
				</el-form-item>
				<el-form-item label="是否启用" prop="state">
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
import { airportList, airportSave } from '@/api/baseData'
import { mapGetters } from 'vuex'
import Pagination from '@/components/Base/Table/pagination'
import { roleSelectList } from '@/api/permission'
import { airportBaseSystemLineList, countrySelectList, citySelectList } from '@/api/base'

export default {
	name: 'portList',
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
				portCode: '',
				// portType: 'port',
				portAttribute: '',
				cityCode: '',
				cityName: '',
				sysLineName: '',
				sysLineCode: '',
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

			portList: [],
			sysGenCodeChecked: true,
			portAttributeArray: [],
			createItem: {
				oid: '',
				parentId: '',
				portCode: '',
				// portType: 'port',
				portAttribute: '',
				cname: '',
				ename: '',
				parentCname: '',
				sysLineCode: '',
				sysLineName: '',
				state: 'valid',
				countryCname: '',
				countryCode: '',
				cityCode: '',
				cityCname: ''
			},
			portCode: '',
			portEname: '',
			portCname: '',
			loading: false,
			//附加费模板
			rules: {
				portCode: [{ required: true, message: '代码不能为空', trigger: 'blur,change' }],
				cname: [
					{
						required: true,
						message: '中文名称不能为空',
						trigger: 'blur,change'
					}
				],
				ename: [
					{
						required: true,
						message: '英文名称不能为空',
						trigger: 'blur,change'
					}
				],
				sysLineName: [{ required: true, message: '航线不能为空', trigger: 'blur,change' }],
				parentId: [
					{
						required: true,
						message: '所属港口不能为空',
						trigger: 'blur,change'
					}
				],
				state: [
					{
						required: true,
						message: '是否启用不能为空',
						trigger: 'blur,change'
					}
				],
				parentCname: [
					{
						required: true,
						message: '所属港口不能为空',
						trigger: 'blur,change'
					}
				],
				countryCname: [
					{
						required: true,
						message: '国家不能为空',
						trigger: 'blur,change'
					}
				],
				cityCname: [
					{
						required: true,
						message: '城市不能为空',
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
		portQuery(queryString, cb) {
			let params = {}
			Object.assign(params, {
				parentId: this.createItem.parentId,
				portName: queryString,
				state: 'valid',
				// portType: 'port'
			})
			this.$store.dispatch('dict/portList', params).then(data => {
				cb(data)
			})
		},
		portSelect(val) {
			this.createItem.parentId = val.oid
			this.createItem.parentCname = val.value
		},
		sysLineSelect(val, type) {
			if (type === 'query') {
				this.queryForm.sysLineName = val.cname
				this.queryForm.sysLineCode = val.sysLineCode
			} else {
				this.createItem.sysLineName = val.cname
				this.createItem.sysLineCode = val.sysLineCode
			}
		},
		countryQuery(queryString, cb) {
			let params = {}
			Object.assign(params, {
				countryCode: queryString,
				state: 'valid'
			})
			countrySelectList(params).then(response => {
				cb(response.data)
			})
		},
		cityQuery(queryString, type, cb) {
			if (this.createItem.countryCode || type === 'query') {
				let params = {}
				Object.assign(params, {
					countryCode: type === 'query' ? '' : this.createItem.countryCode,
					cityCode: queryString,
					state: 'valid'
				})
				citySelectList(params).then(response => {
					cb(response.data)
				})
			}
		},
		citySelect(val, type) {
			if (type === 'query') {
				this.queryForm.cityName = val.cname
				this.queryForm.cityCode = val.cityCode
			} else {
				this.createItem.cityCname = val.cname
				this.createItem.cityCode = val.cityCode
			}
		},
		countrySelect(val) {
			this.createItem.countryCname = val.cname
			this.createItem.countryCode = val.countryCode
			this.createItem.cityCode = ''
			this.createItem.cityCname = ''
		},
		// 系统航线下拉列表自动补充的数据
		sysLineQuery(queryString, cb) {
			airportBaseSystemLineList(queryString, 'valid').then(response => {
				cb(response.data)
			})
		},
		//搜索按钮
		handleSearch() {
			this.tableQuery.currPage = 1
			this.getList(true)
		},
		//搜索取消按钮
		handleReset() {
			console.log(1111)
			this.queryForm.portCode = undefined
			// this.queryForm.portType = 'port'
			this.queryForm.portAttribute = undefined
			this.queryForm.cityCode = undefined
			this.queryForm.cityName = undefined
			this.queryForm.state = undefined
			this.queryForm.sysLineCode = undefined
			this.queryForm.sysLineName = undefined
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
		dialogOpen() {
			this.portCategoryChange()
		},
		//清空数据
		dialogClose() {
			this.$refs['createItemForm'].resetFields()
			Object.assign(this.createItem, {
				oid: '',
				parentId: '',
				portCode: '',
				// portType: 'port',
				portAttribute: '',
				cname: '',
				ename: '',
				parentCname: '',
				sysLineCode: '',
				sysLineName: '',
				state: 'valid',
				countryCname: '',
				countryCode: '',
				cityCode: '',
				cityCname: ''
			})
			this.portAttributeArray = []
		},

		//新增菜单
		handleAdd() {
			this.open = true
			this.title = '新增港口信息'
			this.action = 'add'
		},
		//菜单编辑
		handleEdit(row) {
			this.action = 'edit'
			this.title = '查看港口信息'
			if (row) {
				for (var p in this.createItem) {
					this.createItem[p] = row[p]
				}
				this.createItem.parentCname = ''
				if (this.createItem.portAttribute.length > 0) {
					this.portAttributeArray = this.createItem.portAttribute
				}
				this.open = true
				if (this.createItem.parentId && this.createItem.oid != this.createItem.parentId) {
					//初始化 港口数据
					let params = {}
					Object.assign(params, {
						parentId: this.createItem.parentId,
						state: 'valid',
						// portType: 'port'
					})
					this.$store.dispatch('dict/portList', params).then(data => {
						this.createItem.parentCname = data[0].value
					})
				}
			}
		},
		portCategoryChange(val) {
			if (val === 'wharf') {
				this.portCode = '码头代码'
				this.portEname = '码头英文名称'
				this.portCname = '码头中文名称'
			} else {
				this.portCode = '港口代码'
				this.portEname = '港口英文名称'
				this.portCname = '港口中文名称'
			}
		},
		//删除列表
		handleDelete(row) {
			this.$confirm('是否确认删除币别名称为"' + row.cnName + '"的数据项?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				lockScroll: 'true',
				type: 'warning'
			})
				.then(function() {
					return currencyDelete({ currencyId: row.currencyId })
				})
				.then(() => {
					this.getList()
					this.$message({ message: '删除成功', type: 'success' })
				})
				.catch(function() {})
		},
		getList(isSearch) {
			this.loading = true
			this.initQueryForm(isSearch)
			this.tableQuery.portName = this.queryForm.portCode
			this.tableQuery.query = this.tableQuery.query.filter(item => item.column != 'portCode')
			airportList(this.tableQuery).then(res => {
				let { totalCount } = res.data
				this.tableConfig.pagination.total = totalCount
				this.portList = res.data.list
				this.handlerSpecialList()
				this.loading = false
			})
		},
		handlerSpecialList() {
			this.portList.map(item => {
				if (item.portAttribute) {
					let attributies = item.portAttribute.split(',')
					item.portAttribute = attributies
				}
			})
		},
		initQueryForm(isSearch) {
			let obj = this.queryForm
			let query = []
			Object.keys(obj).forEach(function(key) {
				if (obj[key]) {
					//默认的查询条件组装tableQuery参数
					let tempQuery = {}
					let type = 'eq'
					if (key === 'portAttribute') {
						// 属性搜索用like
						type = 'like'
					} else {
						type = 'eq'
					}
					Object.assign(tempQuery, {
						column: key,
						type: type,
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
			this.createItem.portAttribute = this.portAttributeArray.join(',')
			this.$refs[formName].validate(valid => {
				if (valid) {
					airportSave(this.createItem).then(res => {
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
.port-table {
	/deep/ .cell {
		overflow: hidden;
	}
}
span.filter-txt {
	display: inline-block;
	min-width: 60px;
	text-align: right;
	margin-right: 4px;
}
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

		// span.filter-txt {
		// 	min-width: 80px;
		// 	text-align: right;
		// }
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
