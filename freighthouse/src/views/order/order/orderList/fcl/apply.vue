<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="apply" :rules="rules" :model="createdItem" label-width="90px" class="apply-form">
			<el-form-item prop="cancelRemark" :show-message="false" label="撤回原因">
				<el-input type="textarea" show-word-limit :rows="6" size="mini" v-model="createdItem.cancelRemark" clearable placeholder="请输入撤回原因" maxlength="1024"></el-input>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { importApplyCancel } from '@/api/order/list'
const defaultCreate = {
	cancelRemark: ''
}

export default {
	data() {
		return {
			dialogConfig: {
				title: '撤回推送海外分公司',
				show: true,
				width: '600px',
				inputSize: ''
			},
			createdItem: Object.assign({}, defaultCreate),
			rules: {
				cancelRemark: [{ required: true, message: '', trigger: 'blur' }]
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
						importApplyCancel({
							oid: this.param.oid,
							orderNo: this.$route.query.orderNo,
							cancelRemark: this.createdItem.cancelRemark
						}).then(res=>{
							if (res.code===0) {
								this.$message.success('撤回成功!')
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
