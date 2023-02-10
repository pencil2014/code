<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="refuseForm" :model="createdItem.form" class="bkg-refuse-form" label-width="90px">
			<formItem v-for="(ele, index) in createdItem.items" :key="index" :item="ele" :form="createdItem.form" />
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { auditRefuse, bkgRefuse, changeRefuse, changeBkgRefuse } from '@/api/railway/book/list'
import { getDictMap } from '@/utils/tools'
import formItem from '@/components/Form/elFormItem'

export default {
	data() {
		return {
			dialogConfig: {
				title: '订单拒绝',
				show: true,
				size: 'medium'
			},
			rules: {
				reason: [{ required: true, message: '请选择拒绝原因', trigger: 'change' }]
			},
			// 代订舱无商务审核的拒绝接收人下拉值不需显示商务
			createdItem: {
				form: { orderNo: '', reason: '', auditRemark: '' },
				items: [
					{ label: '拒绝原因', key: 'reason', type: 'select', options: [], required: true, prop: 'reason' },
					{ label: '拒绝备注', key: 'auditRemark', type: 'input', inputType: 'textarea', maxlength: '512', showWordLimit: true }
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
					item.options = getDictMap('orderAuditRefuseReason')
				}
				return Object.assign({}, item)
			})
		},

		close(action, value, type) {
			this.$emit('close', action, value, type)
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
			Object.assign(this.createdItem.form, { orderNo: this.$route.query.orderNo })
			console.log('🚀 ~ this.createdItem.form', this.createdItem.form)
			auditRefuse(this.createdItem.form).then(() => {
				this.close('Confirm')
				this.$message({
					type: 'success',
					message: '已拒绝'
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
.bkg-refuse-form {
	.el-form-item {
		margin-bottom: 4px;
	}
	.el-form-item__label,
	.el-form-item__content {
		line-height: 20px;
	}
}
</style>
