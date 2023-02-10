<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="mailOnlyForm" :rules="rules" :model="createItem" label-position="right" label-width="90px" class="bookReleaseMail-form">
			<el-form-item label="推送内容" prop="mailContent" :show-message="false">
				<el-input maxlength="128" type="textarea" size="mini" :rows="4" placeholder="请输入推送内容" v-model="createItem.mailContent"></el-input>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { spacebookTobkgandop } from '@/api/order/book/list'

import Tinymce from '@/components/Tinymce'

const defaultCreate = {
	mailContent: ''
}

export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '推送BKG/OP',
				show: true,
				notShowClose: true,
				size: 'medium',
				width: '800px'
			},
			createItem: Object.assign({}, defaultCreate),
			rules: {
				mailContent: [{ required: true, message: '请输入推送内容', trigger: 'blur' }]
			},
			canSubmit: true, // 可提交标识
			// 补料详情富文本编辑器配置
			tinymceConfig: {
				toolbar: ['undo redo | fontselect | fontsizeselect | forecolor backcolor bold italic underline strikethrough alignleft aligncenter alignright outdent indent table removeformat hr charmap preview fullscreen'],
				menubar: ''
			}
		}
	},
	props: {},
	created() {},
	mounted() {},
	watch: {},
	components: {
		BaseDialog,
		Tinymce
	},
	methods: {
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.mailOnlyForm.validate(valid => {
					if (valid) {
						if (!this.canSubmit) return
						this.handleToMail()
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		// 邮件发送
		handleToMail() {
			const loading = this.$loading({
				lock: true,
				text: '发送中',
				spinner: 'el-icon-loading',
				background: 'rgba(0, 0, 0, 0.5)'
			})
			let data = {
				orderNo: this.$route.query.orderNo,
				remark: this.createItem.mailContent
			}
			this.canSubmit = false

			spacebookTobkgandop(data)
				.then(res => {
					this.canSubmit = true
					loading.close()
					this.$message({
						type: 'success',
						message: '发送成功',
						duration: 1000,
						onClose: () => {
							this.close('Confirm')
						}
					})
				})
				.catch(err => {
					loading.close()
					this.canSubmit = true
				})
		}
	}
}
</script>

<style lang="scss" scoped>
.bookReleaseMail-form {
	/deep/.el-upload {
		padding: 10px 0;
	}
	.el-form-item {
		margin-bottom: 4px !important;
	}
	.el-form-item__label,
	.el-form-item__content {
		line-height: 20px;
	}
	.el-input,
	.el-textarea {
		font-size: 12px;
	}
	.el-form-item.is-error .mce-tinymce {
		border-color: #ff4949;
	}
	.el-radio__label {
		font-size: 12px;
	}
	.pr80 .el-input__inner {
		padding-right: 80px;
	}
}
.edit-container .bookReleaseMail-form .el-textarea__inner {
	padding: 0 5px;
}
.init-file {
	font-size: 12px;
	i {
		color: #c0c4cc;
	}
}
</style>
