<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<div style="margin:0 0 10px 28px;font-weight:700;">是否确认审核通过，请仔细核对，谨慎操作。</div>
		<el-form ref="processing" :rules="rules" :model="createdItem" label-position="right" label-width="80px" class="create-form">
			<el-form-item label="审核备注" prop="remark">
				<el-input type="textarea" size="mini" :rows="4" placeholder="请输入" v-model="createdItem.remark"></el-input>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
const defaultCreate = {
	remark: ''
}
export default {
	data() {
		return {
			dialogConfig: {
				title: '审核通过',
				show: true,
				size: 'medium'
				// width: "800px"
			},
			createdItem: Object.assign({}, defaultCreate),
			rules: {}
		}
	},
	props: {},
	created() {},
	mounted() {},
	computed: {},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		close(action, value) {
			this.$emit('close', action, value)
		},
		handleSelectReason(val) {},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.processing.validate(valid => {
					if (valid) {
						let data = Object.assign({
							remark: this.createdItem.remark
						})
						this.close('Confirm', data)
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

<style lang="scss"></style>
