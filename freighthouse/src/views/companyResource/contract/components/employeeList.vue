<template>
	<div class="employee-list-cont">
		<div class="tit">
			<span>维护人</span>
			<el-button type="primary" size="mini" class="rt" @click="handleAdd" v-if="isMain">新增使用者</el-button>
		</div>
		<div class="table-employeeList">
			<el-table fit stripe border :data="tableData" style="width: 100%">
				<el-table-column label="维护人" align="center"> 
					<template slot-scope="scope">
						<!-- <el-input type="text" size="mini" v-model="scope.row.employeeId" v-if="scope.row.isEdit"></el-input> -->
						<el-select 
							v-if="scope.row.isEdit"
              size="mini"
              filterable
							clearable
              v-model="scope.row.employeeId"
              style=""  
              placeholder="请选择"
							@clear="handleClearJointEmployee(scope.row)"
              @change="(val) => {handleChangeJointEmployee(scope.row, val)}">
              <el-option v-for="(o, i) in empSelectData"
                :key="o.employeeId + '-'+i"
                :label="o.label"
                :value="o.value">
                {{o.cname}}<em v-if="o.deptCode" style="color: #999;font-style: normal">({{o.deptCname}})</em>
              </el-option>
            </el-select>
						<span v-else>{{scope.row.employeeName}}</span>
					</template>
				</el-table-column>
				<el-table-column label="部门" align="center">
					<template slot-scope="scope">
						<!-- <el-input type="text" size="mini" v-model="scope.row.employeeDeptCode" v-if="scope.row.isEdit"></el-input> -->
						<span>{{scope.row.employeeDeptName}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="keepType" label="维护人类型" align="center">
					<template slot-scope="scope">
						<span>{{keepTypeObj[scope.row.keepType]}}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center" width="120"> 
					<template slot-scope="scope">
						<div class="operate-btns">
							<template v-if="isMain">
								<el-button type="text" size="mini" v-if="scope.row.isEdit && scope.row.keepType === 'USE'" @click="handleSave(scope.row)">保存</el-button>
								<!-- <el-button type="text" size="mini" v-if="!scope.row.isEdit && scope.row.keepType === 'USE'" @click="handleEdit(scope.row)">编辑</el-button> -->
								<el-button type="text" size="mini" v-if="scope.row.keepType === 'USE'" @click="handleDelete(scope.row)">删除</el-button>
							</template>
						</div>
					</template>
				</el-table-column>
			</el-table>
		</div>
	</div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import { contractKeepDelete, contractKeepSave } from '@/api/order/contract'

export default {
	data() {
		return {
			tableData: [],
			rowObj: {
				employeeId: '',
				employeeName: '',
				keepType: 'USE'
			},
			keepTypeObj: {
				AUDIT: '审单维护人',
				MAIN: '主维护人',
				USE: '使用者'
			},
			empSelectData: []
		}
	},
	props: {
		isMain: {
			type: Boolean,
			default: false
		},
		employeeListQuery: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
	},
	mounted() {},
	activated() {},
	computed: {
		...mapState('user',['userId', 'name', 'compCode', 'compName']),
		...mapState({
			dictMap: state => state.dict.dictMap
		}),
	},
	components: {},
	watch: {
		employeeListQuery: {
			handler(newVal) {
				this.initData(newVal)
			},
			deep: true,
			immediate: true
		}
	},
	methods: {
		handleClearJointEmployee(row) {
			row.employeeId = ''
			row.employeeName = ''
			row.employeeDeptName = ''
		},
		handleChangeJointEmployee(row, val) {
			let findItem = this.empSelectData.find(item => item.value === val)
			row.employeeName = findItem ? findItem.label : ''
			row.employeeDeptName = findItem ? findItem.deptCname : ''
		},
		initData(values) {
			// this.tableData = [{employeeName: '121', employeeDeptName: 'xcxc', keepType: 'audit'}]
			this.tableData = values.list.map(item => {
				return {...item, isEdit: false}
			}) || []
			this.empSelectData = values.empSelectData
		},
		//存在可编辑的row，提示先保存
		isEditRow() {
			let result = true
			if (this.tableData.find(item => item.isEdit)) {
				result = false
				this.$message.error('请保存维护人')
			}
			return result
		},
		// 先保存
		handleAdd() {
			let {oid} = this.$route.query
			if (!this.isEditRow()) return
			this.tableData.push({...this.rowObj, contractId: oid, isEdit: true})
		},
		handleDelete(row) {
			if (row.isEdit) {
				return this.$emit('getInfo', true)
			}
			if (!this.isEditRow()) return
			this.$confirm(`是否删除该维护人?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				contractKeepDelete({
					oid: row.oid,
					contractId: row.contractId
				}).then(res => {
					this.$message({type: 'success',message: '删除成功'})
					this.$emit('getInfo', true)
				})
			}).catch(err => {
				console.log('err')
			})
		},
		handleEdit(row) {
			if (!this.isEditRow()) return
			row.isEdit =  true
		},
		handleSave(row) {
			if (!row.employeeId) return this.$message.error('请选择维护人')
			let data = {
				// oid: row.oid,
				contractId: row.contractId,
				employeeId: row.employeeId
			}
			delete data.isEdit
			contractKeepSave(data).then(res => {
				this.$message.success('保存成功')
				this.$emit('getInfo', true)
			})
		},
		handleCancel(row) {
			row.isEdit = false
			this.$emit('getInfo', true)
		}
	}
}
</script>
<style lang="scss" scoped>
.employee-list-cont{
	.tit{
		border-bottom: 1px solid #ddd;
		line-height: 24px;
		height: 24px;
		font-size: 12px;
		padding-left: 10px;
		.rt{
			float: right;
			display: inline-block;
			margin-right: 10px;
			margin-top: 2px;
		}
		/deep/ .el-button--mini{
			padding: 3px 5px;
		}
	}
	.table-employeeList{
		margin: 10px;
	}
	.operate-btns{
		/deep/ .el-button--mini{
			padding: 0;
		}
	}
}
</style>
