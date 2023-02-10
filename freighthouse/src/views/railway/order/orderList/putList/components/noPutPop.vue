<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<div style="margin: 0 0 10px 10px">{{ blNos }} 已满足放单条件,但还未放单,请及时反馈未放单原因.</div>
		<el-form ref="noPutForm" :rules="rules" :model="createItem" label-position="right" label-width="80px">
			<el-form-item label="未放单原因" prop="feedbackReason" :show-message="false">
				<el-input size="mini" show-word-limit maxlength="512" type="textarea" :rows="4" placeholder="请输入未放单原因" v-model="createItem.feedbackReason"> </el-input>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>
<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'

export default {
	filters: {},
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '未放单反馈',
				show: true,
				size: 'medium',
				width: '600px'
			},
			rules: {
				feedbackReason: [{ required: true, message: '', trigger: 'blur' }]
			},
			createItem: { feedbackReason: '' }
		}
	},
	props: {
		blList: {
			type: Array,
			default: () => []
		}
	},
	created() {},
	mounted() {},
	computed: {
		...mapState({}),
		blNos() {
			let list = this.blList.filter(item => item.blNo)
			console.log('🚀 ~ list', list)
			return list.length > 0 ? `提单号 : ${list.map(item => item.blNo).join(',')} ` : ''
		}
	},
	components: {
		BaseDialog
	},
	watch: {},
	methods: {
		close(action, value) {
			this.$emit('close', action, value)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.noPutForm.validate(valid => {
					if (valid) {
						this.close('Confirm', this.createItem)
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
.blNo-list {
	font-size: 12px;
	margin-top: 10px;
	line-height: 24px;
}
.blNo-list span {
	color: #999;
}
</style>
