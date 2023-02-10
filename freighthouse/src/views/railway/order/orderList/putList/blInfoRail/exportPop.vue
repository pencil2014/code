<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="exportForm" :rules="rules" :model="createItem" label-position="right" label-width="95px" class="blExport-form-rail">
			<el-form-item label="文件类型" prop="fileType" v-if="exportTypeQuery.value === 'telex_apply'">
				<el-row>
					<el-col :span="8" v-for="(item, index) in exportFileTypeTelexOptions" :key="index">
						<el-radio @change="handleChangeFileType" size="mini" v-model="createItem.fileType" :label="item.label">
							{{ item.txt }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item label="文件类型" prop="fileType" v-if="exportTypeQuery.value === 'hbl_confirm'">
				<el-row>
					<el-col :span="12" v-for="(item, index) in exportFileTypeOptions" :key="index">
						<el-radio @change="handleChangeFileType" size="mini" v-model="createItem.fileType" :label="item.label">
							{{ item.txt }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item label="文件类型" prop="fileType" v-if="exportTypeQuery.value === 'mbl_draft'">
				<el-row>
					<el-col :span="12" v-for="(item, index) in exportFileTypeOptionsMbl" :key="index">
						<el-radio @change="handleChangeFileType" size="mini" v-model="createItem.fileType" :label="item.label">
							{{ item.txt }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item>
			<!-- <el-form-item label="显示MBL No" prop="mbl" v-if="exportTypeQuery.value === 'hbl_confirm' && detailInfo.serviceType !== 'st08'">
				<el-row>
					<el-col :span="4" v-for="(item, index) in mblShowOptions" :key="index">
						<el-radio size="mini" v-model="createItem.mbl" :label="item.label">
							{{ item.txt }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item> -->
			<el-form-item label="输出类型" prop="docType">
				<el-row>
					<el-col :span="8" v-for="(item, index) in docTypeOptions" :key="index">
						<el-radio
							:disabled="
								(['RAIL_MBL_TELEX_ORIGINAL', 'RAIL_HBL_TELEX_ORIGINAL'].includes(createItem.fileType) && item.value !== 'pdf') || (['RAIL_MBL_TELEX_ORIGINAL0', 'RAIL_HBL_TELEX_ORIGINAL0'].includes(createItem.fileType) && item.value !== 'pdf')
							"
							@change="handleChangeFileType"
							size="mini"
							v-model="createItem.docType"
							:label="item.value"
						>
							{{ item.label }}
						</el-radio>
					</el-col>
				</el-row>
				<!-- <el-select v-model="createItem.docType" size="mini" placeholder="请选择">
          <el-option 
            v-for="(item, index) in docTypeOptions" 
            :key="index" 
            :label="item.label" 
            :value="item.value">
          </el-option>
        </el-select> -->
			</el-form-item>
			<!-- <el-form-item label="显示集装箱" prop="showContainer" v-if="['mbl_draft', 'hbl_confirm'].includes(exportTypeQuery.value) && businessType != 'rail_export_lcl'">
				<el-row>
					<el-col :span="4" v-for="(item, index) in mblShowOptions" :key="index">
						<el-radio size="mini" v-model="createItem.showContainer" :label="item.label">
							{{ item.txt }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item> -->
			<el-form-item :label="businessType === 'rail_export_lcl' ? '显示柜封号' : '显示集装箱'" prop="showContainer" v-if="['mbl_draft', 'hbl_confirm'].includes(exportTypeQuery.value)">
				<el-row>
					<el-col :span="4" v-for="(item, index) in mblShowOptions" :key="index">
						<el-radio size="mini" v-model="createItem.showContainer" :label="item.label">
							{{ item.txt }}
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
	fileType: 'RAIL_HBL_DRAFT',
	docType: 'pdf',
	mbl: '',
	fileTypeName: '',
	showContainer: 'n'
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
				fileType: [{ required: true, message: '请选择文件类型', trigger: 'change' }],
				mbl: [{ required: true, message: '请选择mbl显示', trigger: 'change' }],
				docType: [{ required: true, message: '请选择输出类型', trigger: 'change' }]
			},
			exportFileTypeTelexOptions: [
				{ label: 'RAIL_TELEX_APPLY', txt: 'TO SHIPPER' },
				// { label: "order_proxy", txt: "TO 订舱代理" },
				{ label: 'RAIL_TELEX_APPLY_STATEMENT', txt: '同意放货声明' }
			],
			exportFileTypeOptions: [
				{ label: 'RAIL_HBL_DRAFT', txt: 'HBL不盖章AS AGENT' },
				{ label: 'RAIL_HBL_DRAFT0', txt: 'HBL不盖章AS CARRIER' },
				{ label: 'RAIL_HBL_TELEX_ORIGINAL', txt: 'HBL盖电放章AS AGENT' },
				{ label: 'RAIL_HBL_TELEX_ORIGINAL0', txt: 'HBL盖电放章AS CARRIER' },
				{ label: 'RAIL_USA_NO_SIGN', txt: 'USA不盖章' }
			],
			exportFileTypeOptionsMbl: [
				{ label: 'RAIL_MBL_DRAFT', txt: 'MBL不盖章AS AGENT' },
				{ label: 'RAIL_MBL_DRAFT0', txt: 'MBL不盖章AS CARRIER' },
				{ label: 'RAIL_MBL_TELEX_ORIGINAL', txt: 'MBL盖电放章AS AGENT' },
				{ label: 'RAIL_MBL_TELEX_ORIGINAL0', txt: 'MBL盖电放章AS CARRIER' },
				{ label: 'RAIL_USA_NO_SIGN', txt: 'USA不盖章' }
			],
			docTypeOptions: [
				{ label: 'PDF', value: 'pdf' },
				{ label: 'XLS', value: 'xls' },
				{ label: 'DOC', value: 'doc' }
			],
			mblShowOptions: [
				{ label: 'y', txt: '是' },
				{ label: 'n', txt: '否' }
			]
		}
	},
	props: {
		exportTypeQuery: {
			type: Object,
			default: () => ({})
		},
		detailInfo: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		//根据不同选择的下拉框给单选组赋选中值
		if (this.exportTypeQuery.value === 'telex_apply') {
			this.createItem.fileType = 'RAIL_TELEX_APPLY'
		} else if (this.exportTypeQuery.value === 'hbl_confirm') {
			this.createItem.mbl = 'n'
			this.createItem.fileType = 'RAIL_HBL_DRAFT'
		} else {
			this.createItem.fileType = 'RAIL_MBL_DRAFT'
		}
	},
	mounted() {
		console.log('🚀 ~ sessionStorage.custStr', sessionStorage.custStr)
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		}),
		businessType() {
			return JSON.parse(sessionStorage.custStr).businessType
		}
	},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		// HBL盖电放章的类型值能导出pdf,xls,doc设置不可选
		setDocTypeDisabled() {
			let disabled = false
			if (this.createItem.fileType === 'RAIL_HBL_TELEX_ORIGINAL' && item.value !== 'pdf') {
				disabled = true
			}
			if (this.createItem.fileType === 'RAIL_HBL_TELEX_ORIGINAL0' && item.value !== 'pdf') {
				disabled = true
			}
			this.docTypeOptions.forEach(item => {
				if (disabled) {
					item.disabled = true
				} else {
					item.disabled = false
				}
			})
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		handleChangeFileType(val) {
			console.log('🚀 ~ val', val)
			if (val === 'RAIL_HBL_TELEX_ORIGINAL') {
				this.createItem.docType = 'pdf'
			}
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.exportForm.validate(valid => {
					if (valid) {
						// 获取文件中文名，做导出文件名称
						let exportFileTypeOptions
						if (this.exportTypeQuery.value === 'hbl_confirm') {
							exportFileTypeOptions = this.exportFileTypeOptions
						} else if (this.exportTypeQuery.value == 'telex_apply') {
							exportFileTypeOptions = this.exportFileTypeTelexOptions
						} else {
							exportFileTypeOptions = this.exportFileTypeOptionsMbl
						}
						let sItem = exportFileTypeOptions.find(item => item.label === this.createItem.fileType)
						this.createItem.fileTypeName = sItem ? sItem.txt : ''

						// HBL确认件增加mbl显示字段
						if (this.exportTypeQuery.value === 'hbl_confirm') {
							this.createItem.param = { mbl: this.createItem.mbl }
						}
						//根据文件名添加不同的param
						if (this.createItem.fileTypeName.includes('AGENT')) {
							if (this.exportTypeQuery.value === 'hbl_confirm') {
								// hbl
								this.createItem.param = {
									mbl: this.createItem.mbl,
									asRoleTxt: 'AS AGENT FOR THE CARRIER: LONG SAIL SHIPPING LINE S.A.LIMITED'
								}
							} else {
								// mbl
								this.createItem.param = {
									asRoleTxt: 'AS AGENT FOR THE CARRIER: LONG SAIL SHIPPING LINE S.A.LIMITED'
								}
							}
						}
						if (this.createItem.fileTypeName.includes('CARRIER')) {
							if (this.exportTypeQuery.value === 'hbl_confirm') {
								// hbl
								this.createItem.param = {
									mbl: this.createItem.mbl,
									asRoleTxt: 'AS CARRIER: LONG SAIL SHIPPING LINE S.A.LIMITED'
								}
							} else {
								// mbl
								this.createItem.param = {
									asRoleTxt: 'AS CARRIER: LONG SAIL SHIPPING LINE S.A.LIMITED'
								}
							}
						}

						// 新增是否显示箱封号
						if (['rail_export_lcl', 'rail_export_fcl'].includes(this.detailInfo.businessType) && this.createItem.param) {
							this.createItem.param.showContainer = this.createItem.showContainer
						}
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
.blExport-form-rail {
	/* padding: 20px 80px 20px 20px; */
}
.blExport-form-rail .el-radio__label {
	font-size: 12px;
}
</style>
