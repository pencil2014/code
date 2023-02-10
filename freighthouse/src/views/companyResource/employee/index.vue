<template>
	<div>
		<div class="finance-page base-data" v-loading="loading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
			<div class="prepay">
				<FinanceSearch :searchOption="searchOption1" @search="search" />
				<div class="finance-search-list-gap"></div>
				<div class="finance-list-container">
					<div class="money-box">
						<div class="money-box-left">
							<el-button-group>
								<el-button class="finance-btn" @click="handleEdit()" size="mini" type="primary">新增员工</el-button>
							</el-button-group>
							<el-button-group>
								<el-button class="finance-btn" @click="rejoin()" size="mini" type="primary">重新入职</el-button>
							</el-button-group>
							<el-button-group>
								<el-button class="finance-btn" @click="leave()" size="mini" type="danger">员工离职</el-button>
							</el-button-group>
						</div>
						<div class="money-box-right"></div>
					</div>
					<FinanceTableMass :option="option1" @send-multi="sendMulti" />
				</div>
			</div>
		</div>
		<EmployeeSave v-if="employeeSaveVisable" ref="employeeSave" @refreshDataList="search" @cancel="closeemployeeSave" />
		<el-dialog :title="'离职原因'" :visible.sync="open" :lock-scroll="true" width="600px" @close="dialogClose">
			<el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":">
				<el-form-item label="离职时间" label-width="100px" prop="leaveDate">
					<el-date-picker size="mini" style="width:100%" v-model="createItem.leaveDate" type="date" placeholder="选择离职时间"> </el-date-picker>
				</el-form-item>
				<el-form-item label="离职原因" label-width="100px" prop="leaveReason">
					<el-select style="width:100%" size="mini" v-model="createItem.leaveReason">
						<el-option v-for="(o, key) in dictMap['leaveReason']" :key="key" :label="o.label" :value="o.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="离职备注" label-width="100px">
					<el-input placeholder="请输入离职备注原因，不超过200个字" type="textarea" :maxlength="200" show-word-limit v-model="createItem.leaveRemark"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="mini" type="primary" @click="submitForm('createItemForm')"> <i class="el-icon-copy-document"></i> 保存 </el-button>
				<el-button size="mini" @click="submitFormCancel">取 消</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { weightLimitChargeList, weightLimitChargeAdd, weightLimitChargeUpdate, weightLimitChargeInfo, weightLimitChargeDelete, weightLimitChargeExport } from '@/api/charge/weightLimitCharge'
import organizeTree from '@/components/organize-tree'
import { departmentTreeList, employeeList, deptEmployeeList, jobSelectList, employeeLeave } from '@/api/companyResource'
import EmployeeSave from './employeeSave'
import { mapGetters } from 'vuex'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { dateFormat } from '@/views/finance/utils/finance'
const ROLELIST = []
export default {
	mixins: [mixin, mixin2, routerMixin],
	data() {
		return {
			departmentList: [],
			searchOption1: {},
			option1: {},
			// 初始表头
			selfColumnsBase: [
				{
					disabled: true,
					prop: 'employeeNo',
					label: '工号',
					width: '120px'
				},
				{
					disabled: true,
					prop: 'employeeId',
					label: '员工ID',
				},
				{
					prop: 'cname',
					label: '中文名',
					type: 'text',
					specialCellClassName: 'base-data-enable-class'
				},
				{
					prop: 'ename',
					label: '英文名',
					type: 'text'
				},
				{
					prop: 'gender',
					label: '性别',
					type: 'select',
					propInDict: 'gender'
				},
				{
					prop: 'finCode',
					label: '财务代码',
					type: 'text'
				},
				{
					prop: 'companyName',
					label: '分公司',
					width: 150,
					type: 'text'
				},
				{
					prop: 'deptCname',
					label: '部门',
					type: 'tooltip'
				},
				{
					prop: 'deptRole',
					label: '岗位',
					type: 'text',
					width: 150
				},
				// {
				//   prop: 'manageDeptName',
				//   label: '管理部门',
				//   type: 'tooltip',
				// },
				// {
				//   prop: 'leadDeptName',
				//   label: '部门负责人',
				//   type: 'tooltip',
				// },
				// {
				//   prop: 'roleName',
				//   label: '角色',
				//   type: 'tooltip',
				// },
				{
					prop: 'status',
					label: '工作状态',
					type: 'text',
					width: 150,
					specialCellClassName: 'base-data-enable-class',
					formatter: ({ cellValue }) => {
						if (cellValue === 'leave') {
							return '离职'
						} else if (cellValue === 'on') {
							return '在职'
						}
					}
				},
				{
					prop: 'isPublic',
					label: '是否公共员工',
					type: 'select',
					propInDict: 'yesNo',
					width: 100
				},
				{
					prop: 'mobileNo',
					label: '手机号',
					type: 'text',
					width: 100
				},
				{
					prop: 'telephone',
					label: '座机',
					type: 'text',
					width: 100
				},
				{
					prop: 'email',
					label: '邮箱',
					width: 120,
					type: 'text'
				},
				{
					prop: 'loginAccount',
					label: '系统登录账号',
					width: 110,
					type: 'text'
				},
				{
					prop: 'joinDate',
					label: '入职时间',
					type: 'text'
				},
				{
					prop: 'leaveDate',
					label: '离职时间',
					type: 'text'
				},
				{
					prop: 'leaveReason',
					label: '离职原因',
					type: 'select',
					propInDict: 'leaveReason'
				},
				{
					prop: 'leaveRemark',
					label: '离职备注',
					type: 'text'
				},
				{
					prop: 'createdName',
					label: '创建人',
					type: 'text'
				},
				{
					prop: 'createdTime',
					label: '创建时间',
					width: 120,
					type: 'text'
				},
				{
					prop: 'updatedName',
					label: '修改人',
					type: 'text'
				},
				{
					prop: 'updatedTime',
					label: '修改时间',
					width: 120,
					type: 'text'
				}
			],
			open: false,
			createItem: {
				employeeId: '',
				leaveDate: '',
				leaveReason: '',
				leaveRemark: ''
			},
			rules: {
				leaveDate: [{ required: true, message: '离职时间不能为空', trigger: 'blur' }],
				leaveReason: [{ required: true, message: '离职原因不能为空', trigger: 'blur' }]
			},

			employeeSaveVisable: false,
			visible: false,
			disabled: true,
			name: '',
			// 查询条件
			tableQuery: {
				columns: [],
				query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
				currPage: 1,
				pageSize: 10
			},
			queryForm: {
				jobCname: '',
				deptRole: '',
				finCode: '',
				employeeNo: '',
				name: '',
				companyCode: '',
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
			orgId: '',
			employeeList: [],
			loading: false,
			dataListSelections: [],
			selectedItem: '',
			radio: '',
			treeStyle: {
				height: 0
			},
			organizeData: {},
			// 表格高度
			tableHeight: 300
		}
	},
	components: {
		EmployeeSave,
		FinanceTableMass,
		FinanceSearch
	},
	activated() {
		this.employeeSaveVisable = false // 切换tab时能正常加载邮件签名组件
	},
	created() {
		// this.queryRoleList()
		this.loanBasicData()
		// 搜索配置
		this.searchOption1 = {
			addFilter: {
				// 初始搜索条件数
				defaultSearchLength: 4,
				// 条件数组
				searchInputGroup: [
					{ key: 'name', value: '', showType: '1', range: { min: '', max: '' } },
					{ key: 'employeeNo', value: '', showType: '2', range: { min: '', max: '' } },
					{ key: 'status', value: '', showType: '3', range: { min: '', max: '' } }
					// { key: 'finCode', value: '', showType: '4', range: { min: '', max: '' } },
				],
				filterGroups: {
					//1
					name: { label: '员工姓名', type: 'input', showType: '1' },
					employeeNo: { label: '工号', type: 'input', showType: '1' },
					// companyCode: { label: '分公司',  type: 'input',  showType: '1'},
					deptCode: {
						label: '部门',
						prop: 'deptCode',
						type: 'cascader',
						cascaderList: this.departmentList,
						cascaderProps: {
							children: 'childList',
							label: 'deptCname',
							value: 'deptCode',
							checkStrictly: true
						}
					},
					deptRole: {
						label: '岗位',
						type: 'select',
						showType: '1',
						filterable: true,
						// remote: true,
						// remoteMethod: (queryString, item, row) => {
						// 	this.queryJobList({ queryString }, item)
						// },
						visibleChange: (queryString, item, row) => {
							this.queryJobList({ queryString }, item)
						},
						// remoteSelectList: []
						selectOptions: []
					},
					// roleCode: {
					//   label: '角色',
					//   type: 'select',
					//   remote: false,
					//   prop:'roleCode',
					//   filterable: true,
					//   showType: '1',
					//   selectOptions: ROLELIST,
					// },
					isPublic: { label: '是否公共员工', type: 'select', prop: 'yesNo', showType: '2' },
					//2
					status: { label: '工作状态', type: 'select', prop: 'employeeStatus', showType: '2' },
					email: { label: '邮箱', type: 'input', showType: '2' },
					mobileNo: { label: '手机号', type: 'input', showType: '2' },
					// No: {  label: '系统登录账号',  type: 'input',  showType: '2'  },
					joinDateBeginDate: { label: '入职时间', type: 'daterange', showType: '2' },
					// joinDateEndDate: {  label: '离职时间',  type: 'input',  showType: '2'  },
					createdName: { label: '创建人', type: 'input', showType: '2' },
					// createdTime: {  label: '创建时间',  type: 'daterange',  showType: '2'  },
					// updatedName: {  label: '修改人',  type: 'input',  showType: '2'  },
					// upddateTime: {  label: '修改时间',  type: 'daterange',  showType: '2'  },
					finCode: { label: '财务代码', type: 'input', showType: '2' }
				}
			}
		}
		let pagination = Object.assign({}, this.option.pagination, {
			show: true
		})
		let operationBtns = Object.assign({}, this.option.operationBtns, {
			width: '90px',
			data: [
				{
					label: '修改',
					type: 'text',
					showFn: row => row.status !== 'leave',
					style: {
						color: '#E9851F'
					},
					action: 'Edit'
				},
				{
					label: '详情',
					type: 'text',
					show: true,
					action: 'showDetail'
				}
			]
		})
		this.option1 = Object.assign({}, this.option, {
			id: 'option1',
			data: [...this.option.data],
			tips: {
				text: '',
				show: false
			},
			pagination,
			operationBtns,
			sortChange: (column, prop, order) => {
				this.descColumns = order == 'descending' ? [prop] : []
				this.ascColumns = order == 'ascending' ? [prop] : []
				this.getData()
			},
			maxHeight: this.getFinanceTableMaxHeight
		})
		let columns = [...this.selfColumnsBase]
		this.configColumns.push(...this.selfColumnsBase.map(item => item.prop))
		// console.log(this.configColumns)
		this.selfColumnsBase.forEach(item => (item.sortable = true))
		this.option1.columns = columns
	},
	mounted() {
		this.getData()
	},
	computed: {
		...mapGetters(['userId', 'dictMap'])
	},
	methods: {
		// 所属部门下拉框
		loanBasicData() {
			departmentTreeList({ state: 'valid' }).then(res => {
				this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
			})
		},
		queryJobList(queryString, item, searchItem) {
			let addFilter = (this.searchOption1 || {})['addFilter']
			if (addFilter && typeof queryString === 'object') {
				queryString = Object.assign({}, queryString)
			}
			this.$store.dispatch('dict/queryJobList', queryString).then(data => {
				// if (this.remoteSelectCommon(item, data, {label:'value',value:'key'})) return
				item.selectOptions = data.map(item => {
					return Object.assign(item, {
						label: item.value,
						value: item.key
					})
				})
			})
		},
		//角色
		// queryRoleList(queryString, item, searchItem) {
		//    let data = {
		//      state: "valid"
		//    }
		//     this.$store.dispatch('dict/queryRoleList', data).then(data => {
		//       let list = data.map(item => {
		//         return Object.assign(item, {
		//           label: item.value,
		//           value: item.key
		//         })
		//       })
		//       ROLELIST.splice(0, 1000, ...data)

		//     })
		// },
		// 转化children的空数组为undefined
		getTreeData(data) {
			data.forEach(item => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
			return data
		},
		// 获取数据列表
		getData(params, isSearch) {
			let data = {
				currPage: this.option1.pagination.currPage,
				pageSize: this.option1.pagination.pageSize,
				columns: [],
				ascColumns: params && params.order === 'ascending' ? [params.prop] : [],
				descColumns: params && params.order === 'descending' ? [params.prop] : [],
				query: []
			}
			if (this.customColumnsKeys && this.customColumnsKeys.length) {
				data.columns = this.customColumnsKeys
			}
			this.searchOption1.addFilter.searchInputGroup.forEach(item => {
				let { key, value, range, req, valueReq } = item
				if (range.min || range.max) {
					if (range.min) {
						data.query.push({
							column: key + 'Min',
							type: 'eq',
							value: range.min
						})
					}
					if (range.max) {
						data.query.push({
							column: key + 'Max',
							type: 'eq',
							value: range.max
						})
					}
					return
				}
				if (!value) return
				if (typeof value !== 'object') {
					if (valueReq && item[valueReq] && item.key === 'recvCorpName' && item.value !== '') {
						data.query.push({
							column: valueReq,
							type: 'eq',
							value: item[valueReq]
						})
						console.log(item[valueReq])
					}
					return data.query.push({
						column: key,
						type: 'eq',
						value: req || value
					})
				}
				if (key === 'recvCorpCode' || key === 'payStatus') {
					if (!value.length) return
					data.query.push({
						column: key,
						type: 'eq',
						value: value.join(',')
					})
				} else {
					if (key === 'deptCode') {
						if (!value.length) return
						data.query.push({
							column: key,
							type: 'eq',
							value: value[value.length - 1]
						})
					} else {
						data.query.push({
							column: key + 'Start',
							type: 'eq',
							value: dateFormat('yyyy-mm-dd', value[0])
						})
						data.query.push({
							column: key + 'End',
							type: 'eq',
							value: dateFormat('yyyy-mm-dd', value[1])
						})
					}
				}
			})

			if (this.buttonSearch) {
				data.query.push({ column: 'confirmStatus', type: 'eq', value: this.buttonSearch })
			}
			if (isSearch) {
				this.searchBackup = data.query
			}
			data.query = this.searchBackup || []
			this.loading = true
			deptEmployeeList(data)
				.then(res => {
					if (res.code === 0) {
						if (res.data.configColumns && res.data.configColumns.length) {
							let columns = res.data.configColumns
							this.option1.columns = columns.map(prop => this.selfColumnsBase.find(item => item.prop === prop))
							this.selfColumnsBase.filter(item => columns.indexOf(item.prop) > -1)
							this.configColumns = res.data.configColumns
						}
						console.log(res)
						let { list } = res.data
						let data = []
						list.forEach(item => {
							// Object.assign(item,item.payInfo)
							if (item.status === 'leave') {
								item.hasSpecialCellClassName = true
							}
							data.push(item)
						})
						this.option1.data = data
						this.table1DataBackup = [...this.option1.data]
						this.option1.pagination.currPage = res.data.currPage
						this.option1.pagination.pageSize = res.data.pageSize
						this.option1.pagination.totalCount = res.data.totalCount
					}
				})
				.finally(() => {
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
		selectionChangeHandle(val) {
			this.dataListSelections = val
		},
		closeemployeeSave() {
			this.employeeSaveVisable = false
		},
		// 表单搜索
		search(data, index) {
			this.buttonSearch = data
			this.option1.pagination.currPage = 1
			this.getData(null, true)
			if (index || index === 0) {
				this.rightFilterBtns = [false, false, false]
				this.rightFilterBtns[index] = true
			}
		},
		sendMulti(data, option) {
			if (option === this.option1) this.multipleSelection1 = data
			if (option === this.option2) this.multipleSelection2 = data
			let data2 = {
				ascColumns: [],
				descColumns: [],
				query: []
			}
			let ids = this.multipleSelection1
				.map(item => {
					return item.applyNo
				})
				.join(',')
			if (ids) {
				data2.query.push({
					column: 'applyNoList',
					type: 'eq',
					value: ids
				})
			} else {
				data2.query = this.searchBackup || []
			}
			// this.debounceLs(() => {
			// 	this.getListAmtSummary(data2)
			// })
		},
		// 表单清除
		resetForm(formName) {
			this.$refs[formName].resetFields()
			this.queryForm.status = ''
		},
		handleSizeChange(val) {
			this.option1.pagination.pageSize = val
			this.getData && this.getData()
		},
		handleCurrentChange(val) {
			this.option1.pagination.currPage = val
			this.getData && this.getData()
		},
		// 员工岗位
		deptRoleQuery(queryString, state, cb) {
			let params = {
				columns: [],
				currPage: 1,
				pageSize: 10,
				query: [{ column: 'deptRole', type: 'eq', value: queryString }]
			}
			jobSelectList(params).then(response => {
				console.log(response.data)
				cb(response.data)
			})
		},
		deptRoleSelect(val, type) {
			this.queryForm.jobCname = val.jobCname
			this.queryForm.deptRole = val.jobCode
		},
		// 手动勾选
		handleSelected(rows, row) {
			let selected = rows.length == 1
			if (selected) {
				this.disabled = false
			} else {
				this.disabled = true
			}
		},
		// 新增 / 修改
		handleEdit(data) {
			this.employeeSaveVisable = true
			this.$nextTick(() => {
				this.$refs.employeeSave.init(data)
			})
		},
		rejoin() {
			if (this.multipleSelection1.length != 1) {
				return this.$msgErrClose('请勾选1个员工！')
			}
			let data = this.multipleSelection1[0]
			if (data.status !== 'leave') {
				return this.$msgErrClose('只有离职的员工才能重新入职')
			}
			data.rejoin = true
			this.employeeSaveVisable = true
			this.$nextTick(() => {
				this.$refs.employeeSave.init(data, true)
			})
		},
		leave() {
			if (this.multipleSelection1.length != 1) {
				return this.$msgErrClose('请勾选1个员工！')
			}
			if (this.multipleSelection1[0].status != 'on') {
				return this.$msgErrClose('已离职的员工不能再离职！')
			}
			this.createItem.employeeId = this.multipleSelection1[0].employeeId
			this.open = true
		},
		//详情
		showDetail(row) {
			let query = {
				employeeId: row.employeeId
			}
			this.routerPush('EmployeeDetail', query)
		},
		//清空数据
		dialogClose() {
			this.$refs['createItemForm'].resetFields()
			Object.assign(this.createItem, {
				employeeId: '',
				leaveDate: '',
				leaveReason: '',
				leaveRemark: ''
			})
		},
		submitFormCancel() {
			this.open = false
		},
		submitForm(formName) {
			this.$refs[formName].validate(valid => {
				if (valid) {
					employeeLeave(this.createItem).then(res => {
						this.$message({ message: '提交成功', type: 'success' })
						this.open = false
						this.getData()
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
.base-data {
	/deep/ .base-data-enable-class {
		color: red !important;
	}
}
</style>
