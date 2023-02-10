<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="createForm" :rules="rules" :model="createItem" label-position="right" label-width="70px" class="create-form">
			<el-form-item label="单证中心" prop="employeeId" :show-message="false">
				<el-select size="mini" clearable filterable remote v-model="createItem.employeeId" style="width: 100%" placeholder="请选择" @visible-change="employeeVisibleChange" :filter-method="employeeFilterMehod" @change="handleChangeEmployee">
					<el-option v-for="(o, index) in employeeOptions" :key="index" :label="o.label" :value="o.value"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="补料要求" prop="siRemark" :show-message="false">
				<el-input type="textarea" size="mini" placeholder="请输入" v-model="createItem.siRemark" maxlength="512" show-word-limit></el-input>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { baseEmployeeListName } from '@/api/base'
import { blDraftConfirm } from '@/api/railway/bl'

const defaultCreate = {
	orderNo: '',
	employeeId: '',
	blId: '',
	siRemark: ''
}

export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '草单确认',
				show: true,
				size: 'medium'
				// width: "800px"
			},
			createItem: Object.assign({}, defaultCreate),
			rules: {
				employeeId: [{ required: true, message: '请选择单证中心人员', trigger: 'change' }],
				siRemark: [{ required: true, message: '请输入补料要求', trigger: 'blur' }]
			},
			employeeOptions: []
		}
	},
	props: {
		blId: {
			type: Number,
			default: 0
		},
		workAssign: {
			type: Array,
			default: () => []
		}
	},
	created() {
		let cscData = this.workAssign.filter(item => item.jobCode === 'csc')
		this.createItem.employeeId = cscData.length ? cscData[0].employeeId : ''
		this.employeeOptions = cscData.map(item => {
			return Object.assign(item, {
				label: item.employeeName,
				value: item.employeeId
			})
		})
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		employeeFilterMehod(val) {
			this.getEmployeeName(val)
		},
		employeeVisibleChange(val) {
			val && this.getEmployeeName('')
		},
		handleChangeEmployee(val) {
			// let sItem = this.employeeOptions.find(ele => this.$language === 'en' ? ele.ename === val : ele.cname === val)
			// Object.assign(item, {
			//   employeeId: sItem.employeeId
			// })
		},
		// 获取员工name
		getEmployeeName(val) {
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: 'csc'
			}
			baseEmployeeListName(data).then(res => {
				this.employeeOptions = res.data.map(item => {
					return Object.assign(item, {
						label: this.$language === 'en' ? item.ename : item.cname,
						value: item.employeeId ? Number(item.employeeId) : ''
					})
				})
			})
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.createForm.validate(valid => {
					if (valid) {
						this.handleBlDraftConfirm(done)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		// 草单确认
		handleBlDraftConfirm(done) {
			this.createItem.orderNo = this.$route.query.orderNo
			this.createItem.jointNo = this.$route.query.jointNo
			this.createItem.blId = this.blId
			blDraftConfirm(this.createItem).then(res => {
				this.$message({
					type: 'success',
					message: '草单确认成功',
					duration: 1000,
					onClose: () => {
						this.close('Confirm')
					}
				})
			})
		}
	}
}
</script>

<style lang="scss"></style>
