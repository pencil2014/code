<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="refuseForm" :model="createdItem.form" class="create-form lcl-audit-form" label-width="70px">
			<formItem v-for="(ele, index) in createdItem.items" :key="index" :item="ele" :form="createdItem.form" />
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { lclChangePass } from '@/api/order/list'
import { getDictMap } from '@/utils/tools'
import formItem from '@/components/Form/elFormItem'
import { Form } from 'element-ui'

export default {
	data() {
		return {
			dialogConfig: {
				title: '审核拒绝',
				show: true,
				size: 'medium'
			},
			rules: {
				changeRefuseRemark: [{ required: true, message: '请选择拒绝原因', trigger: 'change' }]
			},
			createdItem: {
				form: { orderNo: '', changeRefuseRemark: '' },
				items: [{ label: '原因', key: 'changeRefuseRemark', type: 'input', inputType: 'textarea', rows: 4, required: true, prop: 'changeRefuseRemark' }]
			}
		}
	},
	props: {
		params: {
			type: Object,
			default() {
				;[]
			}
		}
	},
	created() {
		this.init()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	watch: {},
	components: {
		BaseDialog,
		formItem
	},
	methods: {
		init() {},

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
			Object.assign(this.createdItem.form, { orderNo: this.params.orderNo, changeStatus: 'REFUSE' })
			lclChangePass(this.createdItem.form).then(() => {
				done()
				this.$message({
					type: 'success',
					message: '改港已拒绝',
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

<style lang="scss">
.lcl-audit-form {
	.el-form-item__label {
		line-height: 14px;
	}
}
.create-form .el-col {
	padding-bottom: 20px;
}
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
	width: auto;
}
</style>
