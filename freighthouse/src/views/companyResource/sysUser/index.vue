<template>
	<div>
		<div class="finance-page base-data" v-loading="loading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
			<div>
				<FinanceSearch :searchOption="searchOption1" @search="search" />
				<div class="finance-search-list-gap"></div>
				<div class="finance-list-container">
					<div class="money-box">
						<div class="money-box-right">
							<el-button-group>
								<el-button class="finance-btn" @click="sysUserSaveShow()" size="mini" type="primary">新增</el-button>
							</el-button-group>
							<el-button-group>
								<el-button class="finance-btn" @click="employeeActived('yes')" size="mini" type="success">启用</el-button>
							</el-button-group>
							<el-button-group>
								<el-button class="finance-btn" @click="employeeActived('no')" size="mini" type="danger">失效</el-button>
							</el-button-group>
							<el-button-group>
								<el-button class="finance-btn" @click="activedEmail()" size="mini">发送激活邮件</el-button>
							</el-button-group>
							<el-button-group>
								<el-button class="finance-btn" size="mini" type="success" @click="showAuthor('yes')">批量赋予角色</el-button>
							</el-button-group>
							<el-button-group>
								<el-button class="finance-btn" size="mini" type="warning" @click="showAuthor('no')">批量取消角色</el-button>
							</el-button-group>
						</div>
					</div>
					<FinanceTableMass ref="tablex01" :option="option1" @send-multi="sendMulti" />
				</div>
			</div>
		</div>
		<JobSave v-if="jobSaveVisable" ref="jobSave" @refreshDataList="search" />
		<RoleSave v-if="roleSaveVisable" ref="roleSave" @refreshDataList="search" />
		<MenuSave v-if="menuSaveVisable" ref="menuSave" @refreshDataList="search" />
		<PrivilegeSave v-if="privilegeSaveVisable" ref="privilegeSave" @refreshDataList="search" />
		<SysUserSave v-if="sysUserSaveVisable" ref="sysUserSave" @refreshDataList="search" />

		<DelMenu v-if="delMenuOption.show" :option="delMenuOption" ref="delMenu" @refreshDataList="search" />
		<AddRole v-if="addRoleOption.show" :option="addRoleOption" ref="AddRole" @refreshDataList="search" />
		<SysLine v-if="sysLineOption.show" :option="sysLineOption" ref="sysLine" @refreshDataList="search" />
	</div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin.js'
import { sysUserList, sysUserActived, sendActivedEmail, departmentTreeList } from '@/api/companyResource'
import { dateFormat } from '@/views/finance/utils/finance'
import JobSave from './jobSave'
import RoleSave from './roleSave'
import MenuSave from './menuSave'
import DelMenu from './delMenu'
import PrivilegeSave from './privilegeSave'
import SysUserSave from './sysUserSave'
import AddRole from './addRole'
import SysLine from './sysLine'
const ROLELIST = []
export default {
	mixins: [mixin, mixin2, routerMixin],
	data() {
		return {
			jobSaveVisable: false,
			roleSaveVisable: false,
			menuSaveVisable: false,
			privilegeSaveVisable: false,
			sysUserSaveVisable: false,
			option1: {},
			searchOption1: {},
			table1DataBackup: [],
			multipleSelection1: [],
			multipleSelection2: [],
			departmentList: [],
			orderBillId: '',
			source: 'createSettlement',
			loading: false,
			delMenuOption: {
				show: false
			},
			addRoleOption: {
				show: false
			},
			sysLineOption: {
				show: false
			}
		}
	},
	created() {
		this.querySelectRoleList()
		this.searchOption1 = {
			addFilter: {
				defaultSearchLength: 6,
				searchInputGroup: [
					{ key: 'loginAccount', value: '', showType: '1' },
					{ key: 'name', value: '', showType: '1' },
					{ key: 'deptCode', value: '', showType: '2' },
					{ key: 'mobileNo', value: '', showType: '3' },
					{ key: 'email', value: '', showType: '4' }
				],
				filterGroups: {
					name: { label: '员工姓名', type: 'input', showType: '1' },
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
					employeeNo: { label: '员工工号', type: 'input', showType: '2' },
					mobileNo: { label: '手机号', type: 'input', showType: '3' },
					email: { label: '邮箱', type: 'input', showType: '4' },
					status: {
						label: '工作状态',
						type: 'select',
						showType: '5',
						selectOptions: [
							{ label: '在职', value: 'on' },
							{ label: '离职', value: 'leave' }
						]
					},
					enable: {
						label: '是否启用',
						type: 'select',
						showType: '6',
						selectOptions: [
							{ label: '是', value: 'yes' },
							{ label: '否', value: 'no' }
						]
					},
					roleCode: {
						label: '角色',
						type: 'select',
						remote: false,
						prop: 'roleCode',
						filterable: true,
						showType: '1',
						selectOptions: ROLELIST
					},
					loginAccount: { label: '系统登录账号', type: 'input', showType: '7' },
					// deptRole: {
					// 	label: '岗位',
					// 	type: 'autocomplete',
					// 	showType: '8',
					// 	querySearch: (queryString, cb) => {
					// 		this.queryJobList('', cb)
					// 	},
					// 	select: (optionItem, row) => {
					// 		let find = this.searchOption1.addFilter.searchInputGroup.find(item => {
					// 			return item.key === 'deptRole'
					// 		})
					// 		find.columnReq = 'deptRole'
					// 		find.deptRole = optionItem.key
					// 	}
					// }
					deptRole: {
						label: '岗位',
						type: 'select',
						showType: '1',
						filterable: true,
						visibleChange: (queryString, item, row) => {
							this.queryDeptJobList({ queryString }, item)
						},
						selectOptions: []
					}
					// roleCode: { label: '角色', type: 'autocomplete', showType: '9',
					//   querySearch: (queryString, cb) => {
					//     this.queryRoleList(
					//       {
					//         "state":""
					//       }
					//       ,
					//       cb
					//     )
					//   },
					//   select: (optionItem, row) => {
					//     let find = this.searchOption1.addFilter.searchInputGroup.find(item => {
					//       return item.key === 'roleCode'
					//     })
					//     find.columnReq = 'roleCode'
					//     find.roleCode = optionItem.key
					//   },
					// }
				}
			}
		}
		let pagination = Object.assign({}, this.option.pagination, {
			show: true
		})
		this.option1 = Object.assign({}, this.option, {
			id: 'option1',
			data: [...this.option.data],
			tips: {
				text: '',
				show: false
			},
			operationBtns: [],
			pagination
		})
		let columns = [
			{
				prop: 'loginAccount',
				label: '系统登录账号',
				type: 'button',
				width: 125,
				operationBtns: {
					show: true,
					callback: (fn, index, row, option) => {
						this.sysUserSaveShow(row)
					}
				}
			},
			{
				prop: 'employeeNo',
				label: '工号',
				type: 'text',
				width: 100
			},
			{
				prop: 'employeeId',
				label: '员工ID',
				type: 'text'
			},
			{
				prop: 'cname',
				label: '中文名',
				type: 'text',
				width: 100
			},
			{
				prop: 'ename',
				label: '英文名',
				type: 'text',
				width: 100
			},
			{
				prop: 'deptCname',
				label: '部门',
				type: 'text',
				width: 100
			},
			{
				prop: 'deptRole',
				label: '岗位',
				type: 'button',
				width: 130,
				operationBtns: {
					show: true,
					callback: (fn, index, row, option) => {
						this.jobSaveShow(row)
					}
				},
				formatter: ({ cellValue }) => {
					return cellValue ? cellValue : '添加岗位'
				}
			},
			{
				prop: 'enable',
				label: '是否启用',
				type: 'text',
				specialCellClassName: 'base-data-enable-class',
				formatter: ({ cellValue }) => {
					if (cellValue === 'yes') {
						return '是'
					} else if (cellValue === 'no') {
						return '否'
					}
				}
			},
			{
				prop: 'manageDeptName',
				label: '管理部门',
				type: 'tooltip'
			},
			{
				prop: 'leadDeptName',
				label: '部门负责人',
				type: 'tooltip'
			},
			{
				prop: 'syslineGroups',
				label: '管理航线',
				type: 'tooltip',
				formatter: ({ syslineGroups }) => {
					let arr = []
					if (Array.isArray(syslineGroups)) {
						for (let i = 0; i < syslineGroups.length; i++) {
							arr.push(syslineGroups[i].sysLineGroupCname)
						}
					}
					return arr.join(',')
				}
			},
			{
				prop: 'roleName',
				label: '角色',
				type: 'button',
				width: 150,
				operationBtns: {
					show: true,
					callback: (fn, index, row, option) => {
						this.roleSaveShow(row)
					}
				},
				formatter: ({ cellValue }) => {
					return cellValue ? cellValue : '添加角色'
				}
			},
			{
				prop: 'menuAuth',
				label: '菜单权限',
				type: 'button',
				width: 150,
				operationBtns: {
					show: true,
					callback: (fn, index, row, option) => {
						this.menuSaveShow(row)
					}
				},
				formatter: val => {
					return '查看'
				}
			},
			{
				prop: 'menuAuth2',
				label: '排除菜单权限',
				type: 'button',
				width: 150,
				operationBtns: {
					show: true,
					callback: (fn, index, row, option) => {
						this.delMenuShow(row)
					}
				},
				formatter: val => {
					return '查看'
				}
			},
			{
				prop: 'globalPrivilegeAuth',
				label: '内容权限',
				type: 'button',
				width: 150,
				operationBtns: {
					show: true,
					callback: (fn, index, row, option) => {
						this.privilegeSaveShow(row)
					}
				},
				formatter: val => {
					return '查看'
				}
			},
			{
				prop: 'sysLineName',
				label: '系统航线',
				type: 'button',
				width: 150,
				operationBtns: {
					show: true,
					callback: (fn, index, row, option) => {
						this.showSysLine(row)
					}
				},
				formatter: val => {
					return '查看'
				}
			},
			{
				prop: 'mobileNo',
				label: '手机号',
				type: 'text',
				width: 100
			},
			{
				prop: 'email',
				label: '邮箱',
				type: 'text',
				width: 100
			},
			{
				prop: 'status',
				label: '工作状态',
				type: 'text',
				width: 100,
				formatter: ({ cellValue }) => {
					if (cellValue === 'leave') {
						return '离职'
					} else if (cellValue === 'on') {
						return '在职'
					}
				}
			},
			{
				prop: 'actived',
				label: '是否激活',
				type: 'text',
				formatter: ({ cellValue }) => {
					if (cellValue === 'yes') {
						return '是'
					} else if (cellValue === 'no') {
						return '否'
					}
				}
			},
			{
				prop: 'createdName',
				label: '创建人',
				type: 'text',
				width: 100
			},
			{
				prop: 'createdTime',
				label: '创建时间',
				type: 'text',
				width: 150
			},
			{
				prop: 'updatedName',
				label: '修改人',
				type: 'text',
				width: 100
			},
			{
				prop: 'updatedTime',
				label: '修改时间',
				type: 'text',
				width: 150
			}
		]
		this.option1.columns = columns
		departmentTreeList({ state: 'valid' }).then(res => {
			this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
		})
	},
	methods: {
		queryDeptJobList(queryString, item, searchItem) {
			let addFilter = (this.searchOption1 || {})['addFilter']
			if (addFilter && typeof queryString === 'object') {
				queryString = Object.assign({}, queryString)
			}
			this.$store.dispatch('dict/queryJobList', queryString).then(data => {
				item.selectOptions = data.map(item => {
					return Object.assign(item, {
						label: item.value,
						value: item.key
					})
				})
			})
		},
		querySettleUnit(queryString, cb) {
			this.$store.dispatch('dict/querySettleUnit', queryString).then(data => {
				cb(data)
			})
		},
		queryJobList(queryString, cb) {
			this.$store.dispatch('dict/queryJobList', queryString).then(data => {
				cb(data)
			})
		},
		queryRoleList(queryString, cb) {
			this.$store.dispatch('dict/queryRoleList', queryString).then(data => {
				cb(data)
			})
		},
		search() {
			this.option1.pagination.currPage = 1
			this.getData(true)
		},
		// 转化children的空数组为undefined
		getTreeData(data) {
			data.forEach(item => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
			return data
		},
		getData(isSearch) {
			let data = {
				currPage: this.option1.pagination.currPage,
				pageSize: this.option1.pagination.pageSize,
				query: []
			}
			this.searchOption1.addFilter.searchInputGroup.forEach(item => {
				let { key, value, columnReq } = item
				if (columnReq && item[columnReq]) {
					data.query.push({
						column: columnReq,
						type: 'eq',
						value: item[columnReq]
					})
				} else if (value && value !== '') {
					if (key === 'createdDate') {
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
					} else if (key === 'deptCode') {
						data.query.push({
							column: key,
							type: 'eq',
							value: value[value.length - 1]
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
			sysUserList(data)
				.then(res => {
					if (res.code === 0) {
						let { list } = res.data
						let data = []
						list.forEach(item => {
							if (item.enable === 'no') {
								item.hasSpecialCellClassName = true
							}
							// if (item.money && item.money.receive) {
							//   let keys1 = Object.keys(item.money.receive)
							//   let receive = keys1.reduce((str, cur, index) => {
							//     if (index === 0) {
							//       return str + cur + item.money.receive[cur]
							//     } else {
							//       return str + ' ' + cur + item.money.receive[cur] // &nbsp;&nbsp;
							//     }
							//   }, '')
							//   item.receive = receive
							// }
							// if (item.money && item.money.pay) {
							//   let keys2 = Object.keys(item.money.pay)
							//   let pay = keys2.reduce((str, cur, index) => {
							//     if (index === 0) {
							//       return str + cur + item.money.pay[cur]
							//     } else {
							//       return str + ' ' + cur + item.money.pay[cur] // &nbsp;&nbsp;
							//     }
							//   }, '')
							//   item.pay = pay
							// }
							// item.settleOrderNo_multiValue = item.settleOrderNo.split(',')
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
		employeeActived(state) {
			let operation = state === 'yes' ? '启用' : '失效'
			if (this.multipleSelection1.length !== 1) {
				this.$message({
					message: '请选择一个系统用户进行' + operation,
					type: 'error',
					showClose: true
				})
				return
			}
			if (this.multipleSelection1[0].enable === state) {
				this.$message({
					message: operation + '的系统用户不能进行' + operation + '操作',
					type: 'error',
					showClose: true
				})
				return
			}
			this.$confirm('是否' + operation + '该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = {
						employeeId: this.multipleSelection1[0].employeeId,
						enable: state
					}
					return sysUserActived(data)
				})
				.then(response => {
					this.$message({
						message: operation + '成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							this.search()
						}
					})
				})
				.catch(() => {
					this.search()
				})
		},
		activedEmail() {
			if (this.multipleSelection1.length !== 1) {
				this.$message({
					message: '请选择一个系统用户进行发送激活邮件',
					type: 'error',
					showClose: true
				})
				return
			}
			if (this.multipleSelection1[0].actived === 'yes') {
				this.$message({
					message: '已激活的用户无需发送激活邮件',
					type: 'error',
					showClose: true
				})
				return
			}
			this.$confirm('是否发送该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = {
						employeeId: this.multipleSelection1[0].employeeId
					}
					return sendActivedEmail(data)
				})
				.then(response => {
					this.$message({
						message: '邮件发送成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							this.search()
						}
					})
				})
				.catch(() => {
					this.search()
				})
		},

		// showDetail(row) {
		//   this.routerPush('BillDetail', { source: 'billListPage', billId: row.orderBillId })
		// },
		//岗位配置
		jobSaveShow(row) {
			this.jobSaveVisable = true
			this.$nextTick(() => {
				this.$refs.jobSave.init(row)
			})
		},
		//角色配置
		roleSaveShow(row) {
			this.roleSaveVisable = true
			this.$nextTick(() => {
				this.$refs.roleSave.init(row)
			})
		},
		//菜单权限配置
		menuSaveShow(row) {
			this.menuSaveVisable = true
			this.$nextTick(() => {
				this.$refs.menuSave.init(row)
			})
		},
		// 排除菜单权限
		delMenuShow(row) {
			Object.assign(this.delMenuOption, { ...row })
			this.delMenuOption.show = true
		},
		// 系统航线
		showSysLine(row) {
			Object.assign(this.sysLineOption, { ...row })
			this.sysLineOption.show = true
		},
		//角色配置
		sysUserSaveShow(row) {
			this.sysUserSaveVisable = true
			this.$nextTick(() => {
				this.$refs.sysUserSave.init(row)
			})
		},
		//全局权限配置
		privilegeSaveShow(row) {
			this.privilegeSaveVisable = true
			this.$nextTick(() => {
				this.$refs.privilegeSave.init(row)
			})
		},
		// 批量角色
		showAuthor(state) {
			let len = this.multipleSelection1.length
			if (!len) {
				return this.$msgErrClose('请先选择需要操作的账号!')
			}
			let employeeIdList = this.multipleSelection1.map(item => item.employeeId)
			this.addRoleOption.employeeIdList = employeeIdList
			this.addRoleOption.state = state
			this.addRoleOption.show = true
		},
		handleSizeChange(val) {
			this.option1.pagination.pageSize = val
			this.getData && this.getData()
		},
		handleCurrentChange(val) {
			this.option1.pagination.currPage = val
			this.getData && this.getData()
		},
		sendMulti(data, option) {
			console.log(data, option)
			if (option === this.option1) this.multipleSelection1 = data
			if (option === this.option2) this.multipleSelection2 = data
		},
		//角色
		querySelectRoleList(queryString, item, searchItem) {
			let data = {
				state: 'valid'
			}
			this.$store.dispatch('dict/queryRoleList', data).then(data => {
				let list = data.map(item => {
					return Object.assign(item, {
						label: item.value,
						value: item.key
					})
				})
				ROLELIST.splice(0, 1000, ...data)
			})
		}
	},
	components: {
		FinanceTableMass,
		FinanceSearch,
		JobSave,
		RoleSave,
		MenuSave,
		PrivilegeSave,
		SysUserSave,
		DelMenu,
		AddRole,
		SysLine
	}
}
</script>
<style lang="scss">
.base-data-enable-class {
	color: red !important;
}
</style>
