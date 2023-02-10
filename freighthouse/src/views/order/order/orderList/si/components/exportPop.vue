<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="exportForm" :rules="rules" :model="createItem" label-position="right" label-width="95px" class="orderBlExport-form">
			<el-form-item label="输出类型" prop="docType">
				<el-row>
					<el-col :span="8" v-for="(item, index) in docTypeOptions" :key="index">
						<el-radio size="mini" v-model="createItem.docType" :label="item.value">
							{{ item.label }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { blDeliveryCancel } from '@/api/order/bl'

const defaultCreate = {
	docType: 'pdf'
}

export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '选择输出类型',
				show: true,
				size: 'medium'
				// width: "800px"
			},
			createItem: Object.assign({}, defaultCreate),
			rules: {
				docType: [{ required: true, message: '请选择输出类型', trigger: 'change' }]
			},

			docTypeOptions: [
				{ label: 'PDF', value: 'pdf' },
				{ label: 'XLS', value: 'xls' },
				{ label: 'DOC', value: 'doc' }
			]
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
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.exportForm.validate(valid => {
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

<style>
.orderBlExport-form .el-radio__label {
	font-size: 12px;
}
</style>
