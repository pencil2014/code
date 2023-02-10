<template>
	<div class="menu">
		<div class="components-container">
			<div class="filter-containe search-layout">
				<div class="filter">
					<div class="search-containe">
						<div>
							<span class="filter-txt">
								员工：
							</span>
							<el-select filterable remote clearable size="mini" v-model="queryForm.employeeId" placeholder="请选择员工" :remote-method="getEmployeeSelectList">
								<el-option v-for="(o, key) in employeeSearchOptions" :key="key" :label="o.cname + '  (' + o.employeeNo + ')'" :value="o.employeeId"> </el-option>
							</el-select>
							<span class="filter-txt">
								部门：
							</span>
							<el-cascader clearable filterable size="mini" :options="departmentList" v-model="deptCodes" @change="handleChange" :props="cascaderProps" placeholder="请选择部门" change-on-select expandTrigger="click"></el-cascader>
							<span class="filter-txt">
								业务类型：
							</span>
							<el-select filterable remote clearable size="mini" v-model="queryForm.businessType" placeholder="请选择业务类型">
								<el-option v-for="(o, key) in businessTypeOptions" :key="key" :label="o.name" :value="o.businessType"> </el-option>
							</el-select>
							<span class="filter-txt">
								执行人：
							</span>
							<el-select filterable remote clearable size="mini" v-model="queryForm.assignEmployeeId" placeholder="请选择执行人" :remote-method="getAssignEmployeeSelectList">
								<el-option v-for="(o, key) in assignEmployeeSearchOptions" :key="key" :label="o.cname + '  (' + o.deptCname + ')'" :value="o.employeeId"> </el-option>
							</el-select>
							<span class="filter-txt">
								岗位名称:
							</span>
							<el-select filterable remote clearable size="mini" v-model="queryForm.jobCode" placeholder="请选择岗位">
								<el-option v-for="(o, key) in jobOptionList" :key="key" :label="o.jobCname" :value="o.jobCode"> </el-option>
							</el-select>
						</div>
					</div>
				</div>
				<div class="operation-btns-box">
					<el-button size="mini" @click="handleSearch" type="primary"> <i class="el-icon-search"></i> 搜索 </el-button>
					<el-button size="mini" @click="handleReset" plain>
						重置
					</el-button>
				</div>
			</div>
		</div>
		<div class="components-container  m-t-8">
			<div class="filter-containe search-layout">
				<div class="filter">
					<el-button size="mini" @click="handleAdd()" type="primary"> <i class="el-icon-plus"></i> 新增岗位分配规则 </el-button>
					<el-button size="mini" @click="updateAssignEmployee()" type="primary"> <i class="el-icon-plus"></i> 批量更新执行人 </el-button>
					<el-button size="mini" @click="handleDeleteList" type="danger"> <i class="el-icon-delete"></i> 删除 </el-button>
				</div>
			</div>
			<el-table v-loading="loading" :data="jobAssignRuleList" style="margin:16px 0px" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column align="center" prop="jobCname" label="岗位名称"> </el-table-column>
				<el-table-column align="center" prop="employeeCname" label="员工姓名"></el-table-column>
				<el-table-column align="center" prop="deptCname" label="部门名称"> </el-table-column>
				<el-table-column align="center" prop="assignMode" label="分派模式">
					<template slot-scope="scope">
						{{ $t(`dict.jobAssignMode.${scope.row.assignMode}`) }}
					</template>
				</el-table-column>
				<el-table-column align="center" prop="assiginCname" label="执行人"> </el-table-column>
				<el-table-column align="center" prop="businessCname" label="业务类型"> </el-table-column>
				<el-table-column align="center" prop="row" label="操作" width="300">
					<template slot-scope="scope">
						<el-button @click="handleEdit(scope.row)" type="text" size="small">查看</el-button>
						<el-button @click="handleDelete(scope.row)" type="text" size="small">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<!-- 分页 -->
			<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
		</div>
		<el-dialog :title="title" :visible.sync="open" :lock-scroll="true" width="1100px" @close="dialogClose" @open="dialogOpen">
			<el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":" label-width="130px">
				<el-row>
					<el-col :span="12">
						<el-form-item label="业务类型"  prop="businessTypes">
							<el-select filterable remote multiple size="mini" style="width:100%" v-model="createItem.businessTypes" placeholder="请选择业务类型" @change="businessTypeChange">
								<el-option v-for="(o, key) in businessTypeOptions" :key="key" :label="o.name" :value="o.businessType"> </el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="部门"  prop="roleCode">
							<el-cascader style="width:100%" filterable size="mini" :options="departmentList" v-model="deptCodes" @change="departAddHandleChange" :props="cascaderProps" placeholder="请选择部门" change-on-select expandTrigger="click"></el-cascader>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-form-item label="销售/销售助理/商务"  prop="roleName">
						<el-select
							v-model="createItem.employeeIds"
							multiple
							size="mini"
							style="width:100%"
							placeholder="请选择销售/销售助理/商务,支持多选"
							reserve-keyword
							filterable
							remote
							clearable
							@visible-change="employeeSelectChange"
							@change="
								value => {
									employeeChange && employeeChange(value)
								}
							"
							:remote-method="employeeSelectAsync"
						>
							<el-option v-for="item in employeeOptions" :key="item.key" :label="item.value" :value="item.key"></el-option>
						</el-select>
					</el-form-item>
				</el-row>
				<el-row>
					<el-col :span="12">
						<el-form-item label="后勤岗位"  prop="jobCodes">
							<el-select filterable remote size="mini" style="width:100%" v-model="createItem.jobCodes" multiple placeholder="请选择岗位">
								<el-option v-for="(o, key) in jobOptions" :key="key" :label="o.jobCname" :value="o.jobCode"> </el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="分派模式" prop="assignMode">
							<el-select style="width:100%" size="mini" v-model="createItem.assignMode">
								<el-option v-for="(o, key) in dictMap['jobAssignMode']" :key="key" :label="$t(`dict.jobAssignMode.${o.value}`)" :value="o.value"> </el-option>
							</el-select>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="12">
						<el-form-item label="执行人"  prop="assiginCname" v-if="createItem.assignMode == 'person'">
							<el-autocomplete size="mini" v-model="createItem.assiginCname" style="width:100%" :fetch-suggestions="employeeSearchAsync" placeholder="请选择执行人" @select="handleSelect($event, 'assignEmployeeId', 'assiginCname')"></el-autocomplete>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row v-if="createItem.assignMode == 'sys_line'">
					<el-table :data="createItem.ruleLineList" highlight-current-row>
						<el-table-column align="center" label="起运港" min-width="250">
							<template slot-scope="scope">
								<el-select
									size="mini"
									style="width: 100%;"
									v-model="scope.row.polCodeArr"
									filterable
									remote
									multiple
									clearable
									placeholder="请输入"
									:remote-method="polPortFilterMehod"
									@visible-change="
										value => {
											polPortVisibleChange(value, scope.row)
										}
									"
									@change="
										value => {
											handleChangePolPortCode(value, scope.row)
										}
									"
								>
									<el-option v-for="item in portList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</template>
						</el-table-column>
						<el-table-column align="center" label="船司" width="150">
							<template slot-scope="scope">
								<el-select size="mini" style="width:100%;" v-model="scope.row.shipCarrierCodeArr" filterable multiple clearable remote placeholder="请输入">
									<el-option v-for="item in shipCarrierOptions" :key="item.key" :label="item.value" :value="item.key"> </el-option>
								</el-select>
							</template>
						</el-table-column>
						<el-table-column align="center" label="航线名称" width="150">
							<template slot-scope="scope">
								<el-select size="mini" v-model="scope.row.sysLineCodeArr" filterable multiple clearable remote :placeholder="'请选择'" style="width: 100%;">
									<el-option v-for="item in sysLineOptions" :key="item.key" :label="item.value" :value="item.key"> </el-option>
								</el-select>
							</template>
						</el-table-column>
						<el-table-column align="center" label="订舱代理" min-width="150">
							<template slot-scope="scope">
								<el-select
									size="mini"
									v-model="scope.row.bkgAgentSupplierIdArr"
									filterable
									multiple
									style="width: 100%;"
									remote
									clearable
									placeholder="请输入"
									:remote-method="bkgAgentFilterMehod"
									@visible-change="
										value => {
											bkgVisibleChange(value, scope.row)
										}
									"
									@change="
										value => {
											handleChangeBkgAgentCode(value, scope.row)
										}
									"
								>
									<el-option v-for="item in bkgAgentList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</template>
						</el-table-column>
						<el-table-column align="center" label="执行人" width="100">
							<template slot-scope="scope">
								<el-autocomplete
									size="mini"
									style="width: 100%;"
									v-model="scope.row.assiginCname"
									:fetch-suggestions="employeeSearchAsync"
									placeholder="请选择员工"
									@select="ruleLineHandleChange($event, scope.row)"
									@change="ruleLineHandleChange($event, scope.row)"
								></el-autocomplete>
							</template>
						</el-table-column>
						<el-table-column align="center" label="操作" width="80">
							<template slot-scope="scope">
								<el-button @click="ruleLineDelete(scope)" type="text" size="small">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
					<div class="dialog-add">
						<el-button style="width:100%" size="small" @click="ruleLineAdd">
							<i class="el-icon-plus"></i>
							新增航线
						</el-button>
					</div>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button v-if="!createItem.jobId" size="small" type="primary" @click="submitForm('createItemForm')"> <i class="el-icon-copy-document"></i> 保存 </el-button>
				<el-button size="small" @click="cancel">取 消</el-button>
			</div>
		</el-dialog>

		<el-dialog :visible.sync="updateAssignEmployeeOpen" :lock-scroll="true" width="700px" @close="assignDialogClose" title="批量更新执行人">
			<el-form ref="assignEmployeeItemForm" :rules="assignEmployeeRules" :model="assignEmployeeItem" label-suffix=":">
				<el-form-item label="执行人" label-width="100px" prop="oldAssignEmployeeName">
					<el-autocomplete
						size="mini"
						v-model="assignEmployeeItem.oldAssignEmployeeName"
						style="width:100%"
						:fetch-suggestions="employeeSearchAsync"
						placeholder="请选择执行人"
						@select="handleAssignSelect($event, 'oldAssignEmployeeId', 'oldAssignEmployeeName')"
					></el-autocomplete>
				</el-form-item>
				<el-form-item label="新的执行人" label-width="100px" prop="assignEmployeeName">
					<el-autocomplete
						size="mini"
						v-model="assignEmployeeItem.assignEmployeeName"
						style="width:100%"
						:fetch-suggestions="employeeSearchAsync"
						placeholder="请选择执行人"
						@select="handleAssignSelect($event, 'assignEmployeeId', 'assignEmployeeName')"
					></el-autocomplete>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="small" type="primary" @click="assignEmployeeSubmitForm('assignEmployeeItemForm')"> <i class="el-icon-copy-document"></i> 保存 </el-button>
				<el-button size="small" @click="assignEmployeeCancel">取 消</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import { jobAssignRuleList, jobAssignRuleSave, jobAssignRuleDelete, getJobList, jobAssignRuleInfo, jobAssignEmployeeUpdate } from '@/api/permission'
import { employeeSelectlist, departmentTreeList, jobAssignRuleBatchDelete } from '@/api/companyResource'
import { baseBusinessList } from '@/api/base'
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
			updateAssignEmployeeOpen: false,
			// 查询条件
			tableQuery: {
				columns: [],
				query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
				currPage: 1,
				pageSize: 10
			},
			queryForm: {
				assignEmployeeId: '',
				employeeId: '',
				deptCode: '',
				businessType: '',
				jobCode: ''
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
			defaultBkgSupplier: [],
			defaultPolCodes: [],
			deptCodes: [],
			shipCarrierOptions: [],
			sysLineOptions: [],
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
				ruleId: '',
				businessTypes: ['ship_export_fcl'],
				jobCode: '',
				deptCode: '',
				assignMode: '',
				assignEmployeeId: '',
				assiginCname: '',
				ruleLineList: [],
				employeeCname: '',
				employeeId: '',
				employeeIds: []
			},
			assignEmployeeItem: {
				oldAssignEmployeeId: '',
				oldAssignEmployeeName: '',
				assignEmployeeId: '',
				assignEmployeeName: ''
			},
			loading: false,
			//附加费模板
			rules: {
				assignMode: [{ required: true, message: '分派模式不能为空', trigger: 'change' }],
				businessTypes: [{ required: true, message: '业务类型不能为空', trigger: 'change' }],
				jobCodes: [{ required: true, message: '岗位不能为空', trigger: 'blur' }],
				assiginCname: [{ required: true, message: '执行人不能为空', trigger: 'change' }]
			},
			assignEmployeeRules: {
				oldAssignEmployeeName: [{ required: true, message: '执行人不能为空', trigger: 'change' }],
				assignEmployeeName: [{ required: true, message: '新的执行人不能为空', trigger: 'change' }]
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
		handleChange(value) {
			this.queryForm.deptCode = value[value.length - 1]
		},
		departAddHandleChange(value) {
			this.createItem.deptCode = value[value.length - 1]
		},
		polPortFilterMehod(val) {
			this.transitPortSearch(val, 'port_of_basic', this.state)
		},

		bkgAgentFilterMehod(val) {
			this.getSupplierList(val)
		},
		//起运港
		bkgVisibleChange(val, row) {
			this.getSupplierList('', row)
		},
		//起运港
		polPortVisibleChange(val, row) {
			this.transitPortSearch('', 'port_of_basic', this.state, row)
		},
		handleChangePolPortCode(val, row) {
			row.polCodeArr = val
			if (row.polCodeArr && row.polCodeArr.length > 0) {
				row.polCodeArr.map(item => {
					//如果选中的 之前已经添加过了，就不需要重复处理数据
					if (!this.isSelectedPolCode(item, row)) {
						let polCode = this.findPolCode(item)
						if (polCode) {
							this.defaultPolCodes.push(polCode)
						}
					}
				})
			}
		},

		// 获取订舱代理
		getSupplierList(queryString, row) {
			this.$store
				.dispatch('dict/querySupplierList', {
					category: 'category',
					value: 'bkg_agent',
					queryString: queryString
				})
				.then(data => {
					this.bkgAgentList = []
					//默认将全部数据拷入 下拉数据中
					if (this.defaultBkgSupplier && this.defaultBkgSupplier.length > 0) {
						this.defaultBkgSupplier.map(ele => {
							//下拉把选中的放在前面
							if (row && row.bkgAgentSupplierIdArr && row.bkgAgentSupplierIdArr.indexOf(ele.value) > -1) {
								this.bkgAgentList.unshift(ele)
							} else {
								this.bkgAgentList.push(ele)
							}
						})
					}
					data.list.map(ele => {
						if (!this.isSelectedBkgSupplier(ele.supplierId)) {
							this.bkgAgentList.push({
								label: this.$language == 'en' ? ele.ename : ele.name,
								value: ele.supplierId ? Number(ele.supplierId) : ''
							})
						}
					})
				})
		},

		// 港口下拉数据
		transitPortSearch(queryString, portAttribute, state, row) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				this.portList = []
				//默认将全部数据拷入 下拉数据中
				if (this.defaultPolCodes && this.defaultPolCodes.length > 0) {
					this.defaultPolCodes.map(ele => {
						//下拉把选中的放在前面
						if (row && row.polCodeArr && row.polCodeArr.indexOf(ele.value) > -1) {
							this.portList.unshift(ele)
						} else {
							this.portList.push(ele)
						}
					})
				}
				data.map(ele => {
					if (!this.isSelectedPolCode(ele.key)) {
						this.portList.push({
							label: ele.value,
							value: ele.key
						})
					}
				})
			})
		},

		loadBasicData() {
			this.getEmployeeSelectList()
			this.getDepartList()
			//船司下拉数据
			this.$store.dispatch('dict/baseShippingCarrierList', { state: 'valid' }).then(data => {
				this.shipCarrierOptions = data
			})
			//航线下拉数据
			this.$store.dispatch('dict/baseSystemLineList', { state: 'valid' }).then(data => {
				this.sysLineOptions = data
				this.sysLineOptions.unshift({ key: 'all', value: 'all' })
			})
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
      console.log("🚀 ~ val", val)
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
		getAssignEmployeeSelectList(queryString, type) {
			employeeSelectlist({ name: queryString }).then(res => {
				this.assignEmployeeSearchOptions = res.data
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
			this.queryForm.assignEmployeeId = undefined
			this.queryForm.jobCode = undefined
			this.deptCodes = []
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
				ruleId: '',
				businessType: 'ship_export_fcl',
				jobCodes: [],
				createItem: '',
				deptCode: '',
				assignMode: '',
				assignEmployeeId: '',
				assiginCname: '',
				ruleLineList: [],
				employeeCname: '',
				employeeId: '',
				employeeIds: []
			})
			this.deptCodes = []
			this.defaultBkgSupplier = []
			this.defaultPolCodes = []
		},
		assignDialogClose() {
			this.$refs['assignEmployeeItemForm'].resetFields()
			Object.assign(this.assignEmployeeItem, {
				oldAssignEmployeeId: '',
				oldAssignEmployeeName: '',
				assignEmployeeId: '',
				assignEmployeeName: ''
			})
		},
		dialogOpen() {
			this.getJobList(this.createItem.businessType)
		},
		//新增菜单
		handleAdd() {
			this.open = true
			this.title = '新增岗位分配规则'
		},
		updateAssignEmployee() {
			this.updateAssignEmployeeOpen = true
		},
		baseBusinessList() {
			baseBusinessList().then(res => {
				this.businessTypeOptions = res.data
			})
		},
		//菜单编辑
		handleEdit(row) {
			this.title = '查看岗位分配规则'
			if (row) {
				for (var p in this.createItem) {
					this.createItem[p] = row[p]
				}
				this.createItem.employeeIds = []
				if (this.createItem.employeeCname) {
					this.employeeSelectAsync(this.createItem.employeeCname)
					this.createItem.employeeIds.push(this.createItem.employeeId)
				}
				this.handlerParentCodes()
				this.getJobAssignRuleInfo()
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
			jobAssignRuleInfo({ ruleId: this.createItem.ruleId }).then(res => {
				let { ruleLineList } = res.data
				ruleLineList.map(item => {
					if (item.sysLineCode === 'all') {
						item.sysLineCname = '全部航线'
					}
					if (item.bkgAgentSupplierId) {
						item.bkgAgentSupplierIdArr = item.bkgAgentSupplierId.split(',')
						item.bkgAgentSupplierNameArr = item.bkgAgentSupplierName.split(',')
					}
					if (item.shipCarrierCode) {
						item.shipCarrierCodeArr = item.shipCarrierCode.split(',')
					}
					if (item.sysLineCode) {
						item.sysLineCodeArr = item.sysLineCode.split(',')
					}
					if (item.polCode) {
						item.polCodeArr = item.polCode.split(',')
					}
					if (item.bkgAgentSupplierIdArr && item.bkgAgentSupplierIdArr.length > 0) {
						for (let i = 0; i < item.bkgAgentSupplierIdArr.length; i++) {
							this.buildDefaultBkgSupplier(item.bkgAgentSupplierIdArr[i], item.bkgAgentSupplierNameArr[i])
						}
						//初始化完之后调用 订舱代理列表
						this.getSupplierList()
					}
					if (item.polCodeArr && item.polCodeArr.length > 0) {
						item.polCodeArr.map(polCode => {
							this.buildDefaultPolCode(polCode, item)
						})
						//初始化完之后调用 港口下拉列表
						this.polPortFilterMehod()
					}
				})
				this.createItem.ruleLineList = ruleLineList
				this.createItem.jobCodes = res.data.jobCodes
				this.createItem.businessTypes = res.data.businessTypes
			})
		},
		buildDefaultBkgSupplier(value, label) {
			let exist = false
			if (this.defaultBkgSupplier && this.defaultBkgSupplier.length > 0) {
				this.defaultBkgSupplier.map(item => {
					if (item.value === value) {
						exist = true
					}
				})
			}
			if (!exist) {
				this.defaultBkgSupplier.push({
					label: label,
					value: value
				})
			}
		},
		buildDefaultPolCode(polCoe, item) {
			let exist = false
			if (this.defaultPolCodes && this.defaultPolCodes.length > 0) {
				this.defaultPolCodes.map(item => {
					if (item.value === polCoe) {
						exist = true
					}
				})
			}
			if (!exist) {
				let nowPort = item.portList.find(portArr => {
					return portArr.portCode === polCoe
				})
				if (nowPort) {
					let label = nowPort.ename + '(' + nowPort.cname + (nowPort.portCname ? ',' + nowPort.portCname : '') + (nowPort.cityCname ? ',' + nowPort.cityCname : '') + (nowPort.countryName ? ',' + nowPort.countryName : '') + ')'
					this.defaultPolCodes.push({
						label: label,
						value: polCoe
					})
				}
			}
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
					return jobAssignRuleDelete({ ruleId: row.ruleId })
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
			let ruleIds = this.multipleSelection.map(item => {
				return item.ruleId
			})
			this.$confirm('是否确认删除当前数据项?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				lockScroll: 'true',
				type: 'warning'
			})
				.then(function() {
					return jobAssignRuleBatchDelete({ ruleIds: ruleIds })
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
			jobAssignRuleList(this.tableQuery).then(res => {
				let { totalCount } = res.data
				this.tableConfig.pagination.total = totalCount
				this.jobAssignRuleList = res.data.list
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
		// 取消按钮
		cancel() {
			this.open = false
		},
		assignEmployeeCancel() {
			this.updateAssignEmployeeOpen = false
		},
		validate() {
			if (this.createItem.assignMode == 'sys_line' && this.createItem.ruleLineList.length == 0) {
				this.$message.warning('分派模式按航线,航线类容不能为空')
				return false
			}
			if (this.createItem.assignMode == 'sys_line') {
				for (let item of this.createItem.ruleLineList) {
					if (!item.sysLineCodeArr) {
						this.$message.warning('航线名称不能为空')
						return false
					}
					if (!item.assignEmployeeId) {
						this.$message.warning('执行人不能为空')
						return false
					}
				}
			}
			return true
		},
		handleSelectionChange(val) {
			this.multipleSelection = val
		},
		//保存按钮操作
		submitForm(formName) {
			if (this.validate() !== true) return
			this.$refs[formName].validate(valid => {
				if (valid) {
					this.buildCreateItem()
					// this.handlerDataForm();
					jobAssignRuleSave(this.createItem).then(res => {
						this.$message({ message: '恭喜你，保存成功', type: 'success' })
						this.open = false
						this.handleSearch()
					})
				} else {
					return false
				}
			})
		},
		//特殊处理提交的参数
		buildCreateItem() {
			if (this.createItem.assignMode == 'sys_line') {
				if (this.createItem.ruleLineList.length > 0) {
					this.createItem.ruleLineList.map(item => {
						if (item.polCodeArr && item.polCodeArr.length > 0) {
							item.polCode = item.polCodeArr.join(',')
						} else {
							item.polCode = ''
						}
						if (item.shipCarrierCodeArr && item.shipCarrierCodeArr.length > 0) {
							item.shipCarrierCode = item.shipCarrierCodeArr.join(',')
						} else {
							item.shipCarrierCode = ''
						}
						if (item.sysLineCodeArr && item.sysLineCodeArr.length > 0) {
							item.sysLineCode = item.sysLineCodeArr.join(',')
						} else {
							item.sysLineCode = ''
						}
						if (item.bkgAgentSupplierIdArr && item.bkgAgentSupplierIdArr.length > 0) {
							//设置订舱代理名称
							let supplierName = []
							item.bkgAgentSupplierIdArr.map(bkgId => {
								let bkgAgent = this.defaultBkgSupplier.find(tempItem => {
									return tempItem.value == bkgId
								})
								if (bkgAgent) {
									supplierName.push(bkgAgent.label)
								}
							})
							item.bkgAgentSupplierName = supplierName.join(',')
							item.bkgAgentSupplierId = item.bkgAgentSupplierIdArr.join(',')
						} else {
							item.bkgAgentSupplierId = ''
							item.bkgAgentSupplierName = ''
						}
					})
				}
			}
		},
		//保存按钮操作
		assignEmployeeSubmitForm(formName) {
			if (this.validate() !== true) return
			this.$refs[formName].validate(valid => {
				let that = this
				this.$confirm('是否要批量修改执行人,修改后,所有配置的执行人的记录将会被全部覆盖', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					lockScroll: 'true',
					type: 'warning'
				})
					.then(function() {
						return jobAssignEmployeeUpdate(that.assignEmployeeItem).then(res => {
							that.updateAssignEmployeeOpen = false
							that.handleSearch()
							that.$message({ message: '恭喜你，保存成功', type: 'success' })
						})
					})
					.catch(function() {})
			})
		},
		// handlerDataForm(){
		//       if(this.createItem.jobCode==='csc'&&this.createItem.assignMode=='sys_line'){
		//            this.createItem.ruleLineList.map((item)=>{
		//                item.sysLineCode='all'
		//            })
		//       }
		// },
		// 增加一行
		ruleLineAdd() {
			// 添加一行为空的数据
			const rowData = {
				sysLineCode: '',
				assignEmployeeId: ''
			}
			this.createItem.ruleLineList.push(rowData)
		},

		// 删除一行
		ruleLineDelete(scope) {
			this.createItem.ruleLineList.splice(scope.$index, 1)
		},
		employeeSearchAsync(queryString, cb) {
			let roleCodes = this.createItem.jobCodes.join(',')
			this.$store.dispatch('dict/employeelist', { name: queryString, roleCodes, state: 'valid' }).then(data => {
				cb(data)
			})
		},
		employeeSelectChange() {
			this.employeeSelectAsync('')
		},
		employeeSelectAsync(queryString) {
			this.$store.dispatch('dict/employeelist', { name: queryString, roleCodes: 'bd,obd,pricing', state: 'valid' }).then(data => {
				console.log(data)
				this.employeeOptions = data
			})
		},
		handleSelect(row, prop, label) {
			this.createItem[prop] = row.key
			this.createItem[label] = row.value
		},
		handleAssignSelect(row, prop, label) {
			this.assignEmployeeItem[prop] = row.key
			this.assignEmployeeItem[label] = row.value
		},

		employeeChange(value) {
			this.createItem.employeeIds = value
		},
		ruleLineHandleChange(data, row) {
			row.assignEmployeeId = data.key
			row.assiginCname = data.value
		},
		handleChangeBkgAgentCode(data, row) {
			row.bkgAgentSupplierIdArr = data
			if (row.bkgAgentSupplierIdArr && row.bkgAgentSupplierIdArr.length > 0) {
				row.bkgAgentSupplierIdArr.map(item => {
					//如果选中的 之前已经添加过了，就不需要重复处理数据
					if (!this.isSelectedBkgSupplier(item, row)) {
						let bkgAgent = this.findBkgAgent(item)
						if (bkgAgent) {
							this.defaultBkgSupplier.push(bkgAgent)
						}
					}
				})
			}
		},
		isSelectedBkgSupplier(supplierId) {
			let result = false
			if (this.defaultBkgSupplier.length > 0) {
				this.defaultBkgSupplier.map(item => {
					if (item.value == supplierId) {
						result = true
					}
				})
			}
			return result
		},
		findBkgAgent(value) {
			let bkgAgent = undefined
			if (this.bkgAgentList.length) {
				bkgAgent = this.bkgAgentList.find(item => {
					return item.value === value
				})
			}
			return bkgAgent
		},
		isSelectedPolCode(polCode) {
			let result = false
			if (this.defaultPolCodes.length > 0) {
				this.defaultPolCodes.map(item => {
					if (item.value == polCode) {
						result = true
					}
				})
			}
			return result
		},
		findPolCode(value) {
			let polCode = undefined
			if (this.portList.length) {
				polCode = this.portList.find(item => {
					return item.value === value
				})
			}
			return polCode
		}
	}
}
</script>
<style lang="scss" scoped>
// components/Base组件
.menu {
	margin: 14px;
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
	/deep/ .el-select .el-select__tags {
		flex-wrap: wrap;
		display: flex;
		max-width: 300px !important;
		height: auto;
		overflow: visible;
		span {
			width: 81%;
			display: contents;
			overflow: none !important;
			.el-tag--mini {
				margin-left: 2px;
				margin-right: 0;
				padding: 0 0px;
				.el-select__tags-text {
					width: 90%;
					display: block;
					white-space: nowrap;
					text-overflow: ellipsis;
				}
				.el-tag__close.el-icon-close {
					top: 3px;
					right: -1px;
				}
				&:first-child {
					flex: 1;
				}
				&:first-of-type {
					flex: 1;
				}
				&:nth-of-type(2) {
					width: 30px;
				}
			}
		}
		.el-select__input.is-mini {
			font-size: 12px;
			margin-left: 2px;
		}
	}
}
.payment-advance {
	color: #fff;
	padding: 6px 16px;
	line-height: 150%;
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
