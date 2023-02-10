<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="exportForm" :rules="rules" :model="createItem" label-position="right" label-width="70px" class="truckExport-form">
			<el-form-item label="输出类型" prop="docType">
				<el-row>
					<el-col :span="8" v-for="(item, index) in docTypeOptions" :key="index">
						<el-radio @change="handleChangeFileType" size="mini" v-model="createItem.docType" :label="item.value">
							{{ item.label }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item label="截重时间" required :show-message="false" prop="vgmTime">
				<elDatePickerLimit class="export-cy-time" size="mini" v-model="createItem.vgmTime" type="datetime" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { blDeliveryCancel } from '@/api/order/bl'

const defaultCreate = {
	docType: 'pdf',
	vgmTime: ''
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
		handleChangeFileType(val) {},
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
.truckExport-form {
	padding: 20px 80px 20px 20px;
	.export-cy-time {
		width:276px !important;
		/deep/ .el-input__prefix {
			left: 5px;
			top: 0;
			color: #c0c4cc;
		}
	}
	/deep/ .el-form-item{
		margin-bottom: 8px;
	}
	/deep/ .el-form-item__label{
		line-height: 20px;
	}
	/deep/ .el-form-item__content{
		line-height: 20px;
	}
	/deep/ .el-radio__label {
		font-size: 12px;
	}
}
</style>
