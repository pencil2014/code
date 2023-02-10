<template>
	<div class="finance-page">
		<FinanceSearch :searchOption="searchOption" @search="search" />
		<div class="finance-search-list-gap"></div>
		<div class="bkg-cnt">
			<div class="money-box">
				<div class="money-box-left">
					<el-button
						class="finance-btn"
						size="mini"
						@click="addLine"
						type="primary"
						>新增</el-button
					>
          <el-button
						class="finance-btn"
						size="mini"
						@click="deleteLine"
						>删除</el-button
					>
				</div>
				<div class="money-box-right"></div>
			</div>
			<FinanceTable :option="option1" @send-multi="sendMulti" />
		</div>
		<el-dialog
			:title="editStatus ? '编辑航线' : '新增航线'"
			:visible.sync="showDialog"
			width="800px"
			class="line-manage-edit"
		>
			<el-form
				:model="addData"
				:rules="rulesForm"
				ref="lineForm"
				label-width="80px"
				inline
			>
      <el-form-item label="姓名" prop="employeeName">
					<el-select
						v-model="addData.employeeName"
						placeholder=""
						filterable
						remote
						clearable
						:remote-method="employeeSelectlist"
						@visible-change="employeeSelectlist('')"
					>
						<el-option
							v-for="item in employeeArr"
							:key="item.value"
							:label="`${item.label} (${item.deptCname} ${item.email})`"
							:value="`${item.label}-${item.value}`"
						>
						</el-option>
					</el-select>
				</el-form-item>
        <template v-if="editStatus">
          <el-form-item label="航线名称" prop="sysLineName">
            <el-select
              v-model="addData.sysLineName"
              placeholder=""
              filterable
              remote
              clearable
              :remote-method="sysLineQuery"
              @visible-change="sysLineQuery('')"
            >
              <el-option
                v-for="item in sysLineArr"
                :key="item.value"
                :label="item.label"
                :value="`${item.label}-${item.value}`"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </template>
				<template v-else>
          <el-form-item label="航线名称" prop="sysLineName">
          <el-cascader
            v-model="addData.sysLineName"
            placeholder=""
            :options="lineArr"
            :props="{ multiple: true,expandTrigger:'hover'}"
            collapse-tags
            clearable
            style="width:300px; height:20px; overflow:hidden;"
            ref="tree"
            ></el-cascader>
          </el-form-item>
        </template>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="addLineSel" size="mini">{{
					editStatus ? "保存" : "新增"
				}}</el-button>
				<el-button size="mini" @click="closeDialog">取消</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { listPageSel, updateLine, addLine, deleteSle, groupSystemLine } from '@/api/bkg/stockApply'
import { baseSystemLineList, } from "@/api/base"
import { employeeSelectlist, departmentTreeList } from '@/api/companyResource'
export default {
	components: {
		FinanceSearch,
		FinanceTable
	},
	mixins: [mixin, routerMixin],
	data () {
		return {
			option1: {},
			searchOption: {},
			multipleSelection: [],
			showDialog: false,
			addData: {
				sysLineName: '',
				employeeName: '',
			},
			rulesForm: {
				sysLineName: [{ required: true, message: '航线名称不能为空', trigger: 'change' }],
				employeeName: [{ required: true, message: '姓名不能为空', trigger: 'change' }],
			},
			sysLineArr: [],
			employeeArr: [],
			deptArr: [],
			editData: {},
			editStatus: false,
      multipleSelection1: [],
      lineArr: []
		}
	},
	created () {
		this.searchOption = {
			addFilter: {
				plusShow: false,
				defaultSearchLength: 2,
				searchInputGroup: [
					{ key: 'sysLineCode', value: '', showType: '1' },
					{ key: 'employeeId', value: '', showType: '2' },
				],
				filterGroups: {
					sysLineCode: {
						label: '航线名称',
						type: 'remoteSelect',
						showType: '1',
						remoteMethod: (val, item) => {
							this.sysLineQuery(val, item)
						},
						visibleChange: (val, item) => {
							this.sysLineQuery(val, item)
						},
						remoteSelectList: [],
					},
					employeeId: {
						label: '姓名',
						type: 'remoteSelect',
						showType: '2',
						remoteMethod: (val, item) => {
							this.employeeSelectlist(val, item)
						},
						visibleChange: (val, item) => {
							this.employeeSelectlist(val, item)
						},
						remoteSelectList: [],
					}
				},
			},
		}
		let operationBtns = Object.assign({}, this.option.operationBtns, {
			width: '100px',
			data: [
				{
					label: '编辑',
					type: 'text',
					show: true,
					action: 'edit',
				},
				// {
				// 	label: '删除',
				// 	type: 'text',
				// 	show: true,
				// 	action: 'delete',
				// },
			],
			fixed: 'right',
			show: true,
			callback: (action, $index, row, option) => {
				if (action === 'edit') {
					this.editLine(row)
				} else if (action === 'delete') {
					this.deleteLine(row)
				}
			},
		})
		let pagination1 = Object.assign({}, this.option.pagination, {
			show: true,
		})
		this.option1 = Object.assign({}, this.option, {
			id: 'option1',
			data: [],
			tips: {
				text: '',
				show: false,
			},
			operationBtns,
			pagination: pagination1,
		})
		let columns = [
      { prop: 'employeeName', label: '姓名' },
      { prop: 'deptName', label: '部门' },
      { prop: 'employeeId', label: '工号' },
      { prop: 'sysLineName', label: '航线名称' },
			{ prop: 'sysLineCode', label: '航线Code' },
		]
		this.option1.columns = columns
		this.getData()
    this.getGroupSystemLine()
	},
	// activated () {
	// 	this.getData()
	// },
	methods: {
		// 搜索
		search () {
			this.getData()
		},
		// 获取数据
		getData () {
			let data = {
				currPage: this.option1.pagination.currPage,
				pageSize: this.option1.pagination.pageSize,
				query: [],
        descColumns: ['createdTime'],
			}
			this.searchOption.addFilter.searchInputGroup.forEach((item) => {
				let { key, value } = item
				if (value) {
					data.query.push({
						column: key,
						value: value,
						type: 'eq',
					})
				}

			})
			listPageSel(data).then(res => {
				let data = res.data
				this.option1.data = data.list
				this.option1.pagination.currPage = data.currPage
				this.option1.pagination.pageSize = data.pageSize
				this.option1.pagination.totalCount = data.totalCount
			}).catch(() => { })
		},
		// 新增
		addLine () {
			this.addData = {
				sysLineName: '',
				employeeName: '',
			}
			this.editStatus = false
			this.showDialog = true
		},
		addLineSel () {
			if (this.editStatus) {
        this.editLineFn()
      } else {
        this.addLineFn()
      }
		},
    addLineFn () {
      this.$refs.lineForm.validate((valid) => {
        if (valid) {
          let data = {
						jobCode: 'pricing',
					}
          let { employeeName } = this.addData
          if (employeeName.includes('-')) {
						data.deptCode = employeeName.split('-')[3]
						data.deptName = employeeName.split('-')[2]
						data.employeeId = employeeName.split('-')[1]
						data.employeeName = employeeName.split('-')[0]
					}
          let lineData = this.$refs.tree.getCheckedNodes(true)
          data.systemLineList = lineData.map(item => {
            let {label:sysLineName, value:sysLineCode} = item.data
            return {
              sysLineCode,
              sysLineName
            }
          })
          addLine(data).then(res => {
						if (res.code === 0) {
							this.getData()
							this.$msgSucClose('新增航线成功！')
							this.closeDialog()
						}
					}).catch(() => { })
        }
      })
    },
    editLineFn () {
      this.$refs.lineForm.validate((valid) => {
				if (valid) {
					let data = {
						jobCode: 'pricing',
					}
					let { sysLineName, employeeName } = this.addData
					if (sysLineName.includes('-')) {
						data.sysLineName = sysLineName.split('-')[0]
						data.sysLineCode = sysLineName.split('-')[1]
					} else {
						data.sysLineName = this.addData.sysLineName
						data.sysLineCode = this.addData.sysLineCode
					}
					if (employeeName.includes('-')) {
						data.deptCode = employeeName.split('-')[3]
						data.deptName = employeeName.split('-')[2]
						data.employeeId = employeeName.split('-')[1]
						data.employeeName = employeeName.split('-')[0]
					} else {
						data.deptCode = this.addData.deptCode
						data.deptName = this.addData.deptName
						data.employeeId = this.addData.employeeId
						data.employeeName = this.addData.employeeName
					}
					data.oid = this.addData.oid ? this.addData.oid : ''
					updateLine(data).then(res => {
						if (res.code === 0) {
							this.getData()
							this.$msgSucClose('编辑航线成功！')
							this.closeDialog()
						}
					}).catch(() => { })
				}
			})

    },
		closeDialog () {
			this.showDialog = false
			this.$refs.lineForm.resetFields()
		},
		// 编辑
		editLine (row) {
			this.addData = row
			this.editStatus = true
			this.showDialog = true
		},
		// 删除
		deleteLine () {
      let len = this.multipleSelection1.length
      if (!len) {
        return this.$msgErrClose('请先选择数据再进行删除操作')
      }
			this.$confirm('是否确认删除这些数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			})
				.then(() => {
					this.deleteLineFn()
				})
				.catch(() => { })
		},
		deleteLineFn () {
      let oids = this.multipleSelection1.map(item => item.oid)
			let data = {
				oids
			}
			deleteSle(data).then(res => {
				if (res.code === 0) {
					this.getData()
					this.$msgSucClose('删除数据成功！')
				}
			}).catch(() => { })
		},
		// 选择表格
    sendMulti (data, option) {
			if (option === this.option1) this.multipleSelection1 = data
		},
    // 航线分组列表 groupSystemLine
    getGroupSystemLine () {
      groupSystemLine({}).then(res => {
        this.lineArr = this.transData(res.data || [])
      }).catch(()=>{})
    },
    transData (list) {
      list.forEach(item => {
        if (!item.children.length){
          delete item.children
        } else {
          this.transData(item.children)
        }
      })
      return list
    },
    // 系统航线下拉列表自动补充的数据
		sysLineQuery (queryString, item) {
			baseSystemLineList(queryString, "valid").then((response) => {
				if (item) {
					this.sysLineArr = item.remoteSelectList = response.data.map(item => {
						return {
							label: `${item.cname}`,
							value: item.sysLineCode
						}
					})
				} else {
					this.sysLineArr = response.data.map(item => {
						return {
							label: `${item.cname}`,
							value: item.sysLineCode
						}
					})
				}
			})
		},
		// 姓名下拉
		employeeSelectlist (queryString, item) {
			let params = {
				name: queryString,
				state: 'valid',
				roleCodes: 'pricing'
			}
			employeeSelectlist(params).then(res => {
				if (item) {
					item.remoteSelectList = res.data.map(item => {
						return {
							label: `${item.cname} (${item.deptCname} ${item.email})`,
							value: item.employeeId
						}
					})
				}
				this.employeeArr = res.data.map(item => {
					return {
            ...item,
						label: item.cname,
						value: `${item.employeeId}-${item.deptCname}-${item.deptCode}`
					}
				})
			}).catch()
		},
		// 部门下拉
		departmentTreeList (queryString, item) {
			departmentTreeList({ state: 'valid' }).then((res) => {
				let arr = []
				this.getTreeData(res.data, arr) || []
				this.deptArr = item.remoteSelectList = arr
			})
		},
		// 转化children的空数组为undefined
		getTreeData (data, arr) {
			data.forEach(ele => {
				arr.push({
					label: ele.deptCname,
					value: ele.deptCode
				})
				if (ele.childList.length) {
					this.getTreeData(ele.childList, arr)
				}
			})
		},
		// 分页
		handleSizeChange (val) {
			this.option1.pagination.pageSize = val
			this.getData && this.getData()
		},
		// 分页
		handleCurrentChange (val) {
			this.option1.pagination.currPage = val
			this.getData && this.getData()
		},
	},
}
</script>

<style lang="scss" scoped>
.line-manage-edit {
	.el-form-item {
		margin-bottom: 20px;
	}
	.el-input,
	.el-select {
		width: 200px;
	}
  .el-cascader{
    line-height: 20px;
  }
  .el-cascader__tags .el-tag{
    margin: 0 0 0 6px;
  }
  .el-tag--small{
    line-height: 20px;
  }
}
</style>
