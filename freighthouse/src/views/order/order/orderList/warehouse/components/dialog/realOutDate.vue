<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form class="one-key-date" ref="form" :rules="rules" :model="formData" label-width="100px">
			<el-row>
				<el-col v-for="(ele, index) in inputItem" :span="24" :key="index">
					<FormItem :item="ele" :form="formData" />
				</el-col>
			</el-row>
		</el-form>
	</BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import FormItem from '@/components/Form/elFormItem'
import { mapGetters } from 'vuex'

export default {
	data() {
		return {
			inputItem: [{ label: '实际出仓时间', key: 'outTime', prop: 'outTime', type: 'dateLimit', inputType: 'text' }],
			dialogConfig: {
				title: '一键生成出仓',
				show: true,
				size: 'medium',
				width: '460px'
			},
			formData: {
				outTime: ''
			},
			rules: {
				outTime: [{ required: true, message: '实际出仓时间不能为空', trigger: 'change' }]
			}
		}
	},
	props: {},
	created() {},
	components: {
		BaseDialog,
		FormItem
	},
	computed: {
		...mapGetters(['dictMap'])
	},
	methods: {
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.form.validate(valid => {
					if (valid) {
						this.close('Confirm', this.formData)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},

		close(action, value, type) {
			this.$emit('close', action, value, type)
		}
	}
}
</script>

<style lang="scss">
.one-key-date {
	.el-form-item__label,
	.el-form-item__content {
		line-height: 20px;
	}
}
</style>
