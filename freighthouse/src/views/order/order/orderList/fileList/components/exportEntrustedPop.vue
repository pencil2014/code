<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="exportForm" :rules="rules" :model="createItem" label-position="right" label-width="70px" class="bookingExport-form">
			<el-form-item label="保函类型" prop="guaranteeType">
				<el-row>
					<el-select v-model="createItem.guaranteeType" size="mini" clearable placeholder="请选择保函类型" style="width: 100%">
						<el-option v-for="(item, index) in dictMap.downloadGuaranteeType" :label="item.label" :value="item.value" :key="index"></el-option>
					</el-select>
				</el-row>
			</el-form-item>
			<!-- <el-form-item label="输出类型" prop="docType">
				<el-row>
					<el-col :span="6" v-for="(item, index) in docTypeOptions" :key="index">
						<el-radio
							size="mini"
							v-model="createItem.docType"
							:label="item.value"
						>
							{{ item.label }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item> -->
		</el-form>
	</BaseDialog>
</template>
<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
const defaultCreate = {
	// docType: 'pdf',
	guaranteeType: 'non_haz_non_certificate'
}
export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '常用保函下载',
				show: true,
				size: 'medium'
				// width: "800px"
			},
			createItem: Object.assign({}, defaultCreate),
			docTypeOptions: [
				{ label: 'PDF', value: 'pdf' },
				{ label: 'XLS', value: 'xls' },
				{ label: 'DOC', value: 'doc' }
			],

			rules: {
				docType: [{ required: true, message: '请选择输出类型', trigger: 'change' }],
				guaranteeType: [{ required: true, message: '请选择保函类型', trigger: 'change' }]
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
<style lang="scss" scoped>
.bookingExport-form {
	/* padding: 20px 80px 20px 20px; */
	/deep/ .el-form-item {
		margin-bottom: 8px;
	}
}
.bookingExport-form {
	/deep/.el-radio .el-radio__label {
		font-size: 12px;
	}
}
</style>
