<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="apply" :rules="rules" :model="createdItem" label-width="90px" class="apply-form">
			<el-form-item prop="refuseRemark" :show-message="false" label="拒绝原因">
				<el-input type="textarea" show-word-limit :rows="6" size="mini" v-model="createdItem.refuseRemark" clearable placeholder="请输入拒绝原因" maxlength="1024"></el-input>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { importApplyRefuse } from '@/api/base'
const defaultCreate = {
	refuseRemark: ''
}

export default {
	data() {
		return {
			dialogConfig: {
				title: '拒绝接单',
				show: true,
				width: '600px',
				inputSize: ''
			},
			createdItem: Object.assign({}, defaultCreate),
			rules: {
				refuseRemark: [{ required: true, message: '请输入拒绝原因', trigger: 'blur' }]
			}
		}
	},
	props: {
		param: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		this.init()
	},

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
		init() {
			this.createdItem = { ...defaultCreate }
		},

		// 弹窗关闭回调
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.apply.validate(valid => {
					if (valid) {
						importApplyRefuse({ oid: this.param.oid, orderNo: this.param.orderNo, refuseRemark: this.createdItem.refuseRemark }).then(res => {
							if (res.code === 0) {
								this.$message.success('拒绝成功')
								this.$emit('close', 'Confirm')
							}
						})
					}
				})
			} else {
				this.$emit('close', 'Cancel')
			}
		}
	}
}
</script>

<style lang="scss" scoped></style>
