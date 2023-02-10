<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form :model="createItem" ref="vgmTimeForm">
			<el-form-item label="截重时间" required :show-message="false" prop="vgmTime">
				<elDatePickerLimit class="export-cy-time" size="mini" v-model="createItem.vgmTime" type="datetime" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'

export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '截重时间',
				show: true,
				size: 'medium'
				// width: "800px"
			},
			createItem: {
				vgmTime: ''
			}
		}
	},
	props: {},
	created() {},
	mounted() {},
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
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.vgmTimeForm.validate(valid => {
					if (valid) {
						this.close('Confirm', this.createItem)
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

<style lang="scss">
.export-cy-time {
	.el-input__prefix {
		left: 5px;
		top: 5px;
	}
}
</style>
