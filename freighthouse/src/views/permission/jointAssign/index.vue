<template>
	<div class="menu joint-assign-wrap">
		<div class="components-container">
			<div class="filter-containe search-layout">
				<div class="filter">
					<div class="search-containe">
						<div>
							<span class="filter-txt">
								业务类型：
							</span>
							<el-select filterable remote clearable size="mini" v-model="queryForm.businessType" placeholder="请选择业务类型">
								<el-option v-for="(o, key) in businessTypeOptions" :key="key" :label="o.name" :value="o.businessType"> </el-option>
							</el-select>
							<span class="filter-txt">
								部门：
							</span>
							<el-cascader clearable filterable size="mini" :options="departmentList" v-model="deptCodes" @change="handleChange" :props="cascaderProps" placeholder="请选择部门" change-on-select expandTrigger="click"></el-cascader>
							<span class="filter-txt">
								员工：
							</span>
							<el-select filterable remote clearable size="mini" v-model="queryForm.employeeId" placeholder="请选择员工" :remote-method="getEmployeeSelectList">
								<el-option v-for="(o, key) in employeeSearchOptions" :key="key" :label="o.cname + '  (' + o.employeeNo + ')'" :value="o.employeeId"> </el-option>
							</el-select>

							<!-- <span class="filter-txt">
								岗位:
							</span>
							<el-select filterable remote clearable size="mini" v-model="queryForm.jobCode" placeholder="请选择岗位">
								<el-option v-for="(o, key) in jobOptionList" :key="key" :label="o.jobCname" :value="o.jobCode"> </el-option>
							</el-select> -->
							<span class="filter-txt">
								结算分公司:
							</span>
							<el-autocomplete size="mini" @clear="clearCompany" clearable v-model="queryForm.companyName" :fetch-suggestions="settleSearchAsync" @select="handleQuerySelect" placeholder="请选择结算分公司">
								<template slot-scope="{ item }">
									<div class="name">{{ item.unitName }}</div>
								</template>
							</el-autocomplete>
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
		<div class="components-container  m-t-8">
			<div class="filter-containe search-layout">
				<div class="filter">
					<el-button size="mini" @click="handleAdd()" type="primary"> 新增协同配置 </el-button>
					<!-- <el-button size="mini" @click="handleDeleteList" type="danger"> <i class="el-icon-delete"></i> 删除 </el-button> -->
				</div>
			</div>
			<el-table v-loading="loading" :data="jobAssignRuleList" style="margin:16px 0px" @selection-change="handleSelectionChange">
				<!-- <el-table-column type="selection" width="55"></el-table-column> -->
				<el-table-column align="center" prop="businessCname" label="业务类型"> </el-table-column>
				<el-table-column align="center" prop="jobCname" label="岗位"> </el-table-column>
				<el-table-column align="center" prop="deptName" label="部门"> </el-table-column>
				<el-table-column align="center" prop="employeeCname" label="员工"></el-table-column>
				<el-table-column align="center" prop="companyName" label="结算分公司"> </el-table-column>
				<el-table-column align="center" prop="row" label="操作" width="150">
					<template slot-scope="scope">
						<el-button @click="handleEdit(scope.row)" type="text" size="mini">查看</el-button>
						<el-button style="margin-left:0;color:red;" @click="handleDelete(scope.row)" type="text" size="mini">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<!-- 分页 -->
			<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
		</div>
		<el-dialog class="joint-assign-dlg" :title="title" :visible.sync="open" :lock-scroll="true" width="800px" @close="dialogClose" @open="dialogOpen">
			<el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":">
				<el-row>
					<el-col :span="12">
						<el-form-item :show-message="false" label="业务类型" label-width="85px" prop="businessTypes">
							<el-select filterable remote multiple collapse-tags size="mini" style="width:100%" v-model="createItem.businessTypes" placeholder="请选择业务类型" @change="businessTypeChange">
								<el-option v-for="(o, key) in businessTypeOptions" :key="key" :label="o.name" :value="o.businessType"> </el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item :show-message="false" label="部门" label-width="85px" prop="deptCode">
							<el-cascader style="width:100%" filterable size="mini" :options="departmentList" v-model="deptCodes" @change="departAddHandleChange" :props="cascaderProps" placeholder="请选择部门" change-on-select expandTrigger="click"></el-cascader>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="12">
						<el-form-item :show-message="false" label="岗位" label-width="85px" prop="jobCode">
							<el-select disabled filterable remote size="mini" style="width:100%" v-model="createItem.jobCode" placeholder="请选择岗位">
								<el-option v-for="(o, key) in jobOptions" :key="key" :label="o.jobCname" :value="o.jobCode"> </el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item :show-message="false" label="员工" label-width="85px" prop="employeeId">
							<el-select v-model="createItem.employeeId" size="mini" style="width:100%" placeholder="请选择员工" filterable remote clearable @visible-change="employeeSelectChange" :remote-method="employeeSelectAsync">
								<el-option v-for="item in employeeOptions" :key="item.key" :label="item.label" :value="item.value">
									{{item.cname}}<em v-if="item.deptCode" style="color: #999;font-style: normal">({{item.deptCname}})</em>
								</el-option>
							</el-select>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="12">
						<el-form-item :show-message="false" label-width="85px" label="结算分公司" prop="companyName">
							<el-autocomplete size="mini" clearable style="width:100%;" v-model="createItem.companyName" :fetch-suggestions="settleSearchAsync" placeholder="请选择结算分公司" @select="handleSelect">
								<template slot-scope="{ item }">
									<div class="name">{{ item.unitName }}</div>
								</template>
							</el-autocomplete>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button v-if="!createItem.jobId" size="mini" type="primary" @click="submitForm('createItemForm')"> 保存 </el-button>
				<el-button size="mini" @click="cancel">取 消</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import { jointAssignRuleList, jointAssignRuleSave, jointAssignRuleDelete, getJobList, jointAssignRuleInfo } from '@/api/permission'
import { employeeSelectlist, departmentTreeList, jobAssignRuleBatchDelete, settleUnitSelectList } from '@/api/companyResource'
import { baseBusinessList, listByRole } from '@/api/base'
import { mapGetters } from 'vuex'
import Pagination from '@/components/Base/Table/pagination'
export default {
	name: 'role',
	data() {
		return {
			multipleSelection: [],
			//弹框标题
			title: '',
			//弹框开关
			open: false,
			// 查询条件
			tableQuery: {
				columns: [],
				query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
				currPage: 1,
				pageSize: 10
			},
			queryForm: {
				employeeId: '',
				deptCode: '',
				businessType: '',
				jobCode: 'bd',
				companyName: '',
				companyCode: ''
			},
			cascaderProps: {
				children: 'childList',
				label: 'deptCname',
				value: 'deptCode'
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
			deptCodes: [],
			employeeOptions: [],
			employeeSearchOptions: [],
			assignEmployeeSearchOptions: [],
			assignOptions: [],
			departmentList: [],
			businessTypeOptions: [],
			portList: [],
			bkgAgentList: [],
			jobOptions: [],
			jobOptionList: [],
			jobAssignRuleList: [],
			sysGenCodeChecked: true,
			createItem: {
				oid: '',
				businessTypes: ['ship_export_fcl'],
				jobCode: 'bd',
				deptCode: '',
				employeeId: '',
				companyName: '',
				companyCode: ''
			},
			assignEmployeeItem: {
				oldAssignEmployeeId: '',
				oldAssignEmployeeName: '',
				assignEmployeeName: ''
			},
			loading: false,
			//附加费模板
			rules: {
				businessTypes: [{ required: true, message: '业务类型不能为空', trigger: 'change' }],
				companyName: [{ required: true, message: '结算分公司不能为空', trigger: 'change' }],
				employeeId: [{ required: true, message: '员工不能为空', trigger: 'change' }]
				// jobCode: [{ required: true, message: '岗位不能为空', trigger: 'blur' }]
			}
		}
	},
	// table基础组件
	components: {
		Pagination
	},
	created() {
		getJobList({ businessType: '' }).then(res => {
			this.jobOptionList = res.data
			this.createItem.jobCode = 'bd'
		})
	},
	mounted() {
		this.getList()
		this.loadBasicData()
		this.baseBusinessList()
	},
	computed: {
		...mapGetters(['userId', 'dictMap'])
	},
	methods: {
		clearCompany(val) {
			console.log('🚀 ~ val', val)
			this.queryForm.companyName=''
      console.log("🚀 ~ this.queryForm.companyName", this.queryForm.companyName)
			this.queryForm.companyCode=''
      console.log("🚀 ~ this.queryForm.companyCode", this.queryForm.companyCode)
		},
		//默认30条
		settleSearchAsync(queryString, cb) {
			let params = {}
			Object.assign(params, {
				name: queryString,
				size: 30,
				unitTypes: 'company'
			})
			settleUnitSelectList(params).then(data => {
				cb(data.data)
			})
		},
		handleSelect(row) {
			this.createItem.companyName = row.unitName
			this.createItem.companyCode = row.unitCode
		},
		handleQuerySelect(row) {
			console.log('🚀 ~ row', row)
			this.queryForm.companyName = row.unitName
			this.queryForm.companyCode = row.unitCode
		},
		handleChange(value) {
			this.queryForm.deptCode = value[value.length - 1]
		},
		departAddHandleChange(value) {
			this.createItem.deptCode = value[value.length - 1]
		},

		loadBasicData() {
			this.getEmployeeSelectList()
			this.getDepartList()
		},
		getDepartList() {
			departmentTreeList({ state: 'valid' }).then(res => {
				this.departmentList = this.getTreeData(res.data)
			})
		},
		getJobList(val) {
			getJobList({ businessType: val }).then(res => {
				this.jobOptions = res.data
			})
		},
		businessTypeChange(val) {
			this.getJobList(val)
		},
		// 转化children的空数组为undefined
		getTreeData(data) {
			for (let i = 0; i < data.length; i++) {
				if (!data[i].childList.length) {
					// children若为空数组，则将children设为undefined
					data[i].childList = undefined
				} else {
					this.getTreeData(data[i].childList)
				}
			}
			return data
		},
		getEmployeeSelectList(queryString, type) {
			employeeSelectlist({ name: queryString }).then(res => {
				this.employeeSearchOptions = res.data
			})
		},

		//搜索按钮
		handleSearch() {
			this.tableQuery.currPage = 1
			this.getList(true)
		},
		//搜索取消按钮
		handleReset() {
			this.queryForm.employeeId = undefined
			this.queryForm.deptCode = undefined
			this.queryForm.businessType = undefined
			this.queryForm.jobCode = 'bd'
			this.queryForm.companyName = ''
			this.queryForm.companyCode = ''
			this.deptCodes = []
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
			this.$refs['createItemForm'].resetFields()
			Object.assign(this.createItem, {
				oid: '',
				businessType: 'ship_export_fcl',
				jobCode: 'bd',
				deptCode: '',
				employeeId: '',
				companyName: '',
				companyCode: ''
			})
			this.deptCodes = []
			this.defaultBkgSupplier = []
			this.defaultPolCodes = []
		},

		dialogOpen() {
			this.getJobList(this.createItem.businessType)
		},
		//新增菜单
		handleAdd() {
			this.open = true
			this.title = '新增协同配置'
		},

		baseBusinessList() {
			baseBusinessList().then(res => {
				this.businessTypeOptions = res.data
			})
		},
		//菜单编辑
		handleEdit(row) {
			this.title = '查看协同配置'
			if (row) {
				for (var p in this.createItem) {
					this.createItem[p] = row[p]
				}
				// if (this.createItem.employeeCname) {
				// 	this.employeeSelectAsync(this.createItem.employeeCname)
				// }
				this.handlerParentCodes()
				this.getJobAssignRuleInfo()
				// this.mapEmployeeOptions()
			}
			this.open = true
		},
		handlerParentCodes() {
			this.deptCodes = []
			let codeLevel = this.createItem.deptCode.length / 3
			for (var i = 0; i < codeLevel; i++) {
				this.deptCodes.push(this.createItem.deptCode.substring(0, (i + 1) * 3))
			}
		},
		getJobAssignRuleInfo() {
			jointAssignRuleInfo({ oid: this.createItem.oid }).then(res => {
				this.createItem.businessTypes = res.data.businessTypes
			})
		},

		//删除列表
		handleDelete(row) {
			this.$confirm('是否确认删除当前数据项?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				lockScroll: 'true',
				type: 'warning'
			})
				.then(function() {
					return jointAssignRuleDelete({ oids: [row.oid] })
				})
				.then(() => {
					this.handleSearch()
					this.$message({ message: '删除成功', type: 'success' })
				})
				.catch(function() {})
		},
		//删除列表
		handleDeleteList() {
			if (this.multipleSelection.length === 0) {
				return this.$msgErrClose('请勾选数据进行删除！')
			}
			let oids = this.multipleSelection.map(item => {
				return item.oid
			})
			this.$confirm('是否确认删除当前数据项?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				lockScroll: 'true',
				type: 'warning'
			})
				.then(function() {
					return jobAssignRuleBatchDelete({ oids: oids })
				})
				.then(() => {
					this.handleSearch()
					this.$message({ message: '删除成功', type: 'success' })
				})
				.catch(function() {})
		},
		getList(isSearch) {
			this.loading = true
			this.initQueryForm(isSearch)
			jointAssignRuleList(this.tableQuery).then(res => {
				let { totalCount } = res.data
				this.tableConfig.pagination.total = totalCount
				this.jobAssignRuleList = res.data.list
				this.loading = false
			})
		},
		initQueryForm(isSearch) {
			let obj = this.queryForm
			console.log('🚀 ~ obj', obj)
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
		// 取消按钮
		cancel() {
			this.open = false
		},

		handleSelectionChange(val) {
			this.multipleSelection = val
		},
		//保存按钮操作
		submitForm(formName) {
			this.$refs[formName].validate(valid => {
				if (valid) {
					jointAssignRuleSave(this.createItem).then(res => {
						this.$message({ message: '恭喜你，保存成功', type: 'success' })
						this.open = false
						this.handleSearch()
					})
				} else {
					return false
				}
			})
		},

		employeeSearchAsync(queryString, cb) {
			let roleCodes = this.createItem.jobCode
			this.$store.dispatch('dict/employeelist', { name: queryString, roleCodes, state: 'valid' }).then(data => {
				cb(data)
			})
		},
		employeeSelectChange(val) {
			val && this.employeeSelectAsync('')
		},
		employeeSelectAsync(queryString) {
			// if (queryString === undefined) return
			let data = {
        currPage: 1,
        pageSize: 1000,
        query: [
          {column: 'roleCode', type: 'in', value: 'bd,pricing'},
          {column: 'employeeStatus', type: 'eq', value: 'all'},
          {column: 'name', type: 'eq', value: queryString ? queryString.replace(/^\s+|\s+$/g, '') : ''}
        ]
			}
			listByRole(data).then(res => {
				this.employeeOptions = res.data.list
					.map(item => {
						return Object.assign(item, {
							value: item.employeeId,
							label: item.cname
						})
					})
				// this.mapEmployeeOptions()
			})
			// this.$store.dispatch('dict/employeelist', { name: queryString, roleCodes: 'bd,pricing', state: 'valid' }).then(data => {
			// 	this.employeeOptions = data
			// 	this.mapEmployeeOptions()
			// })
		},
		mapEmployeeOptions() {
			if (this.createItem.employeeId && !this.employeeOptions.some(item => item.key === this.createItem.employeeId)) {
				this.employeeOptions.push({
					label: this.createItem.employeeCname,
					value: this.createItem.employeeId
				})
			}
			console.log('this.employeeOptions', this.employeeOptions)
		}
	}
}
</script>
<style lang="scss" scoped>
.joint-assign-wrap {
	/deep/ .el-select .el-tag {
		margin: 0 3px;
	}
	/deep/ .el-tag--mini {
		height: 18px;
		line-height: 18px;
	}
	/deep/ .el-form-item {
		margin-bottom: 10px;
	}
	.joint-assign-dlg {
		/deep/ .el-dialog {
			margin-top: 4vh !important;
		}
	}
	.el-button--mini {
		padding: 3px 7px;
	}
	/deep/ .el-input--mini .el-input__inner,
	/deep/ .el-form-item__label,
	.el-cascader--mini,
	/deep/ .el-input--mini .el-input__icon {
		height: 20px;
		line-height: 20px;
	}

	/deep/ .el-select.el-select--mini,
	/deep/ .el-form-item__content {
		height: 22px;
		line-height: 22px;
	}
}
.menu {
	margin: 14px;
	.filter-containe {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		font-size: 12px;
		color: #333;
		align-items: center;
		flex-wrap: wrap;
		.filter {
			display: flex;
			flex-direction: row;
			justify-content: flex-start;
			flex-wrap: wrap;
		}
		.filter-item {
			display: inline-block;
			vertical-align: middle;
		}
	}

	.el-table th > .cell {
		color: #222222;
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
		line-height: 20px;
		color: #000000;
	}
	.el-input--prefix .el-input__inner {
		padding-left: 45px;
	}
}

.operation-btns-box {
	padding-left: 10px;
}
.parentWrap {
	margin-left: 12px;
	padding-bottom: 10px;
	.text {
		font-size: 14px;
	}
}
.el-cascader-panel .el-radio {
	z-index: 10;
	width: 99%;
	height: 99%;
	position: absolute;
	top: 10px;
	right: -12px;
}
.el-cascader-panel .el-radio__input {
	visibility: hidden;
}
.el-cascader-panel .el-cascader-node__postfix {
	top: 10px;
}
</style>
