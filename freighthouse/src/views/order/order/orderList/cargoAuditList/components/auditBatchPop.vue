<template>
	<BaseDialog class="cargo-audit-form" :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="processing" :rules="rules" :model="createdItem" label-position="right" label-width="70px">
			<div class="pledge-cont">
				<template>
					<el-form-item :show-message="false" label="拒绝原因" prop="refuseRemark">
						<el-input type="textarea" size="mini" :rows="3" placeholder="请输入" v-model="createdItem.refuseRemark" maxlength="512" show-word-limit></el-input>
					</el-form-item>
				</template>
			</div>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { finSettListBatch, getFinApplyReasonBatch, checkPledgeOrder, checkDzgOrder } from '@/api/order/bl'
import { getDictLabel } from '@/utils/tools'
const defaultCreate = {
	refuseRemark: ''
}
export default {
	data() {
		return {
			rules: { refuseRemark: [{ required: true, message: '请输入拒绝原因', trigger: 'blur' }] },
			dialogConfig: {
				title: '审核拒绝',
				show: true,
				width: '600px',
				btns: [
					{ label: '确定', action: 'Confirm', type: 'primary' },
					{ label: '取消', action: 'Cancel' }
				]
			},
			createdItem: Object.assign({}, defaultCreate)
		}
	},
	filters: {},
	props: {},
	created() {},

	mounted() {},
	destroyed() {},
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
		close(action, value) {
			this.$emit('close', action, value)
		},
		// 弹窗关闭回调
		dialogCallback(action, done) {
			if (['Pass', 'Processing', 'Refuse', 'Confirm'].includes(action)) {
				this.$refs.processing.validate(valid => {
					if (valid) {
						let data = { ...this.createdItem }
						this.close(action, data)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.cargo-audit-form {
	/deep/ .el-dialog__body {
		padding-top: 0;
	}
	.pledge-cont {
		margin-top: 15px;

		/deep/ .el-form-item {
			.el-form-item__label {
				padding-right: 4px;
			}
		}
	}

	/deep/ .el-form-item {
		margin-bottom: 4px;
	}
}
</style>
