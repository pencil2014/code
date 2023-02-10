<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="exportForm" :rules="rules" :model="createItem" label-position="right" label-width="125px" class="bookingExport-form">
			<el-form-item label="托书类型" prop="bookingType">
				<el-row>
					<el-col :span="9" v-for="(item, index) in bookingTypeOptions" :key="index">
						<el-radio size="mini" v-model="createItem.bookingType" :label="item.value" @change="handleChangeBookingType">
							{{ item.label }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item label="输出类型" prop="docType">
				<el-row>
					<el-col :span="6" v-for="(item, index) in docTypeOptions" :key="index">
						<el-radio size="mini" v-model="createItem.docType" :label="item.value">
							{{ item.label }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item label="语言版本" prop="language" v-if="createItem.bookingType === 'REXPRESS_BOOKTEMPLATE'">
				<el-row>
					<el-col :span="6" v-for="(item, index) in languageOptions" :key="index">
						<el-radio size="mini" v-model="createItem.language" :label="item.value">
							{{ item.label }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item label="是否显示HS CODE" prop="showHsCode">
				<el-row>
					<el-col :span="6" v-for="(item, index) in yesOrNoOptions" :key="index">
						<el-radio size="mini" v-model="createItem.showHsCode" :label="item.value">
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
const defaultCreate = {
	docType: 'pdf',
	bookingType: 'LONGSAIL_OFFSITE',
	language: 'cn',
	showHsCode: 'N'
}
export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '输出托书',
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
			bookingTypeOptions: [
				{ label: '长帆供应链订同行', value: 'LONGSAIL_OFFSITE' }
				// { label: '长帆本地托书', value: 'LONGSAIL_LOCAL' },
			],
			languageOptions: [
				{ label: '中文', value: 'cn' },
				{ label: '英文', value: 'en' }
			],
			yesOrNoOptions: [
				{ label: '否', value: 'N' },
				{ label: '是', value: 'Y' }
			],
			rules: {
				docType: [{ required: true, message: '请选择输出类型', trigger: 'change' }],
				bookingType: [{ required: true, message: '请选择托书类型', trigger: 'change' }],
				language: [{ required: true, message: '请选择语言版本', trigger: 'change' }],
				showHsCode: [{ required: true, message: '请选择是否显示HS CODE', trigger: 'change' }]
			}
		}
	},
	props: {
		bookDetailForm: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		// 海运出口拼箱，输出的订舱托书类型增加云帆模板
		if (this.bookDetailForm.businessType === 'ship_export_lcl') {
			this.bookingTypeOptions = [
				{ label: '长帆供应链订同行', value: 'LONGSAIL_OFFSITE' },
				{ label: '云帆托书模板', value: 'REXPRESS_BOOKTEMPLATE' }
			]
		} else {
			this.bookingTypeOptions = [{ label: '长帆供应链订同行', value: 'LONGSAIL_OFFSITE' }]
		}
	},
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
		handleChangeBookingType(val) {
			if (val === 'REXPRESS_BOOKTEMPLATE') {
				this.docTypeOptions = [{ label: 'XLS', value: 'xls' }]
				this.createItem.docType = 'xls'
			} else {
				this.docTypeOptions = [
					{ label: 'PDF', value: 'pdf' },
					{ label: 'XLS', value: 'xls' },
					{ label: 'DOC', value: 'doc' }
				]
				this.createItem.docType = 'pdf'
			}
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.exportForm.validate(valid => {
					if (valid) {
						let { docType, bookingType, language, showHsCode } = this.createItem
						let bookingTypeVal = bookingType
						if (bookingType === 'REXPRESS_BOOKTEMPLATE') {
							bookingTypeVal = language === 'cn' ? 'REXPRESS_ZH' : 'REXPRESS_US'
						}
						this.close('Confirm', {
							docType,
							bookingType: bookingTypeVal,
							showHsCode
						})
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
