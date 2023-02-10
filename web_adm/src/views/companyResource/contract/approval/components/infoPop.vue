<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="saveForm" :rules="rules" :model="createdItem" label-position="right" class="app-save-form">
			<el-form-item label="审核岗位" prop="approvalJobCode" :required="true" :show-message="false" label-width="70px">
				<el-select v-model="createdItem.approvalJobCode" size="mini" clearable filterable placeholder="请选择"  @change="handleSelectJobCode" style="width: 100%">
					<el-option v-for="item in dictMap.approvalJobCode" :label="item.label" :value="item.value" :key="item.value"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="审核人" prop="employeeId" :required="true" :show-message="false" label-width="70px">
				<el-select v-model="createdItem.employeeId" size="mini" clearable filterable placeholder="请选择"  @change="handleSelectEmployee" style="width: 100%">
					<el-option v-for="item in employeeList" :label="item.label" :value="item.value" :key="item.value"></el-option>
				</el-select>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { approvalEmployeeAdd, approvalEmployeeEdit} from '@/api/order/contract'
import { baseEmployeeListName } from '@/api/base'
import { getDictLabel } from '@/utils/tools'

const defaultCreateQuery = {
	oid: undefined,
	approvalOrganizeId: '',
	approvalJobCode: '',
	approvalJobName: '',
	employeeId: '',
	employeeName: ''
}

export default {
	data() {
		return {
			state: '',
			dialogConfig: {
				title: '新增审批人',
				show: true,
				size: 'medium',
				width: '450px'
			},
			createdItem: Object.assign({}, defaultCreateQuery),
			rules: {},
			employeeList: []
		}
	},
	props: {
		infoPopQuery: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		this.init(this.infoPopQuery)
		this.getEmployeeList()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		}),
	},
	watch: {
	},
	components: {
		BaseDialog
	},
	methods: {
		init(values) {
			console.log('values', values);
			if (values.oid) {
				this.$set(this.dialogConfig, 'title', '编辑审批人')
				let {oid, approvalOrganizeId, approvalJobCode, approvalJobName, employeeId, employeeName} = values
				this.createdItem = {
					oid,
					approvalOrganizeId, 
					approvalJobCode, 
					approvalJobName, 
					employeeId, 
					employeeName
				}
			} else {
				this.$set(this.dialogConfig, 'title', '新建审批人')
				this.createdItem = {...defaultCreateQuery, approvalOrganizeId: values.approvalOrganizeId}
			}
		},
		getEmployeeList() {
			let data = {
				name: ''
			}
			baseEmployeeListName(data).then(res => {
				this.employeeList = res.data.map(item => {
					item.label = item.cname
					item.value = item.employeeId
					return {...item}
				})
			})
		},
		handleSelectJobCode(val) {
			if (val) {
				this.createdItem.approvalJobName = getDictLabel('approvalJobCode', val)
			} else {
				this.createdItem.approvalJobCode = ''
				this.createdItem.approvalJobName = ''
			}
		},
		handleSelectEmployee(val) {
			if (val) {
				let findItem = this.employeeList.find(item => item.value === val)
				this.createdItem.employeeName = findItem ? findItem.label : ''
			} else {
				this.createdItem.employeeId = ''
				this.createdItem.employeeName = ''
			}
		},
		close(action) {
			this.$emit('close', action)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.saveForm.validate(valid => {
					if (valid) {
						this.handleSave()
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		handleSave() {
			let data = {... this.createdItem}
			let func = this.createdItem.oid ? approvalEmployeeEdit : approvalEmployeeAdd
			func(data).then(res => {
				this.$message.success('保存成功')
				this.close('Confirm')
			})
		},
	}
}
</script>

<style lang="scss" scoped>
.app-save-form{
	/deep/ .el-input--mini .el-input__inner{
		line-height: 20px;
		height: 20px;
	}
	/deep/ .el-form-item__label, /deep/ .el-form-item__content{
		line-height: 20px;
	}
	/deep/ .el-input--mini .el-input__icon{
		line-height: 20px;
	}
}
</style>
