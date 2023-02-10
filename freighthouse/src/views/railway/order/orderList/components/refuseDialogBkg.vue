<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="refuseForm" :model="createdItem.form" class="create-form" label-width="100px">
			<formItem v-for="(ele, index) in createdItem.items" :key="index" :item="ele" :form="createdItem.form" />
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { bookRefuseOp } from '@/api/railway/list'
import formItem from '@/components/Form/elFormItem'
import { closePage } from '@/utils/index'
export default {
	data() {
		return {
			dialogConfig: {
				title: '拒绝订舱',
				show: true,
				size: 'medium'
			},
			rules: {
				refuseEmployeeId: [{ required: true, message: '请选择拒绝人', trigger: 'change' }],
				reason: [{ required: true, message: '请选择拒绝原因', trigger: 'change' }]
			},
			createdItem: {
				form: {
					bkgReqNo: '',
					orderNo: '',
					refuseEmployeeId: '',
					reason: '',
					auditRemark: ''
				},
				items: [
					{
						label: '拒绝接收人',
						key: 'refuseEmployeeId',
						type: 'select',
						required: true,
						prop: 'refuseEmployeeId',
						options: []
					},
					{
						label: '拒绝原因',
						key: 'reason',
						type: 'select',
						options: [],
						required: true,
						prop: 'reason'
					},
					{
						label: '拒绝备注',
						key: 'auditRemark',
						type: 'input',
						inputType: 'textarea',
						maxlength: '512',
						showWordLimit: true
					}
				]
			}
		}
	},
	props: {},
	created() {
		this.init()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			roles: state => state.user.roles
		})
	},
	watch: {},
	components: {
		BaseDialog,
		formItem
	},
	methods: {
		init() {
			// 获取拒绝原因
			this.createdItem.items.map(item => {
				if (item.key === 'reason') {
					item.options = this.dictMap.railBkgRefuseReason
				}
				if (item.key === 'refuseEmployeeId') {
					item.options = this.dictMap.railBkgRefuseStatus
				}
				return Object.assign({}, item)
			})
		},

		close(action, value, type) {
			this.$emit('close', action, value, type)
		},

		validate() {
			return true
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
				// 表单校验
				this.$refs.refuseForm.validate(valid => {
					if (valid) {
						this.handleSubmit(done)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		handleSubmit(done) {
			let params = {
				orderNo: this.$route.query.orderNo,
				bkgRefuseStatus: this.createdItem.form.refuseEmployeeId,
				bkgRefuseReason: this.createdItem.form.reason,
				bkgRefuseRemark: this.createdItem.form.auditRemark
			}
			// if (this.$route.query.orderNo.jointNo) {
			// 	params.jointNo = this.$route.query.orderNo.jointNo
			// }

			bookRefuseOp(params).then(() => {
				done()
				this.close('Confirm')
				this.$message({
					type: 'success',
					message: '已拒绝',
					onClose: () => {
						closePage()
					}
				})
			})
		}
	}
}
</script>

<style lang="scss">
.create-form .el-col {
	padding-bottom: 20px;
}
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
	width: auto;
}
</style>
