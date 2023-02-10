<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="exportForm" :show-message="false" :rules="rules" :model="createItem" label-position="right" label-width="120px" class="orderBlExport-form">
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
					<el-col :span="6" v-for="(item, index) in exportFileTypeOptions" :key="index">
						<el-radio @change="handleChangeFileType" size="mini" v-model="createItem.fileType" :label="item.label">
							{{ item.txt }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item label="文件类型" prop="fileType" v-if="exportTypeQuery.value === 'SEAWAYBILL_INDEMNITY'">
				<el-row>
					<el-col :span="8" v-for="(item, index) in exportFileTypeSwbOptions" :key="index">
						<el-radio @change="handleChangeFileType" size="mini" v-model="createItem.fileType" :label="item.label">
							{{ item.txt }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item label="显示MBL No" prop="mbl" v-if="exportTypeQuery.value === 'hbl_confirm' && !['st03', 'st18', 'st04', 'st19', 'st11', 'st12'].includes(detailInfo.serviceType)">
				<el-row>
					<el-col :span="4" v-for="(item, index) in mblShowOptions" :key="index">
						<el-radio :disabled="mblNoDisabled && item.label === 'y'" size="mini" v-model="createItem.mbl" :label="item.label">
							{{ item.txt }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item label="输出类型" prop="docType">
				<el-row>
					<el-col :span="8" v-for="(item, index) in docTypeOptions" :key="index">
						<el-radio
							:disabled="['hbl_telex_original', 'hbl_telex_original0', 'hbl_telex_original_supChain', 'hbl_telex_original0_supChain', 'usa_sign'].includes(createItem.fileType) && item.value !== 'pdf'"
							@change="handleChangeFileType"
							size="mini"
							v-model="createItem.docType"
							:label="item.value"
						>
							{{ item.label }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item>

			<el-form-item v-if="createItem.fileType === 'SEAWAYBILL_CUST'" label="客户邮箱" prop="email">
				<el-input v-model="createItem.email" placeholder="请输入客户邮箱"></el-input>
			</el-form-item>
			<el-form-item label="M单类型" prop="hblType" v-if="exportTypeQuery.value === 'mbl_draft'">
				<el-row>
					<el-col :span="8" v-for="(item, index) in hblTypeOptions" :key="index">
						<el-radio :disabled="detailInfo.barge ? false : true" @change="handleChangeFileType" size="mini" v-model="createItem.hblType" :label="item.value">
							{{ item.label }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item label="H单类型" prop="hblType" v-if="exportTypeQuery.value === 'hbl_confirm'">
				<el-row>
					<el-col :span="8" v-for="(item, index) in hblTypeOptions" :key="index">
						<el-radio :disabled="detailInfo.barge ? false : true" @change="handleChangeFileType" size="mini" v-model="createItem.hblType" :label="item.value">
							{{ item.label }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item label="显示柜封号" prop="showCnSn" v-if="exportTypeQuery.value === 'hbl_confirm' && detailInfo.businessType === 'ship_export_lcl'">
				<el-row>
					<el-col :span="4" v-for="(item, index) in mblShowOptions" :key="index">
						<el-radio size="mini" v-model="createItem.showCnSn" :label="item.label">
							{{ item.txt }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item
				label="显示签名"
				prop="isSign"
				v-if="exportTypeQuery.value === 'hbl_confirm' && ['hbl_telex_original', 'hbl_telex_original0', 'hbl_telex_original_supChain', 'hbl_telex_original0_supChain', 'usa_sign'].includes(createItem.fileType)"
			>
				<el-row>
					<el-col :span="4" v-for="(item, index) in mblShowOptions" :key="index">
						<el-radio size="mini" v-model="createItem.isSign" :label="item.label">
							{{ item.txt }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item>
			<!-- <el-form-item label="第2页打印到空白纸" prop="isWhitePaper" v-if="exportTypeQuery.value === 'hbl_confirm'">
				<el-row>
					<el-col :span="4" v-for="(item, index) in mblShowOptions" :key="index">
						<el-radio size="mini" v-model="createItem.isWhitePaper" :label="item.label">
							{{ item.txt }}
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
import { blDeliveryCancel } from '@/api/order/bl'

const defaultCreate = {
	fileType: 'hbl_draft',
	docType: 'pdf',
	hblType: '',
	mbl: '',
	fileTypeName: '',
	showCnSn: 'n',
	isSign: 'n',
	isChain: 'n'
	// isWhitePaper: 'n'
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
				docType: [{ required: true, message: '请选择输出类型', trigger: 'change' }],
				hblType: [{ required: true, message: '请选择H单类型', trigger: 'change' }],
				isSign: [{ required: true, message: '请选择是否显示签名', trigger: 'change' }],
				email: [
					{ required: true, message: '请输入客户邮箱', trigger: 'blur' },
					{
						type: 'email',
						message: '请输入正确的邮箱',
						trigger: 'blur'
					}
				]
			},
			exportFileTypeTelexOptions: [
				{ label: 'TELEX_APPLY', txt: 'TO SHIPPER' },
				// { label: "order_proxy", txt: "TO 订舱代理" },
				{ label: 'TELEX_APPLY_STATEMENT', txt: '同意放货声明' }
			],
			exportFileTypeSwbOptions: [
				{ label: 'SEAWAYBILL_INDEMNITY', txt: '发给船司的模板' },
				{ label: 'SEAWAYBILL_CUST', txt: '发给客户的模板' }
			],
			exportFileTypeOptions: [
				{ label: 'hbl_draft', txt: 'HBL不盖章AS AGENT' },
				{ label: 'hbl_draft0', txt: 'HBL不盖章AS CARRIER' },
				{ label: 'hbl_telex_original', txt: 'HBL盖电放章AS AGENT' },
				{ label: 'hbl_telex_original0', txt: 'HBL盖电放章AS CARRIER' },
				// { label: 'hbl_draft_supChain', txt: 'HBL不盖章AS AGENT(供应链)' },
				// { label: 'hbl_draft0_supChain', txt: 'HBL不盖章AS CARRIER(供应链)' },
				// { label: 'hbl_telex_original_supChain', txt: 'HBL盖电放章AS AGENT(供应链)' },
				// { label: 'hbl_telex_original0_supChain', txt: 'HBL盖电放章AS CARRIER(供应链)' },
				{ label: 'HBL_AZ', txt: 'HBL不盖章AZ AGENT' },
				{ label: 'usa_no_sign', txt: 'USA不盖章' },
				{ label: 'usa_sign', txt: 'USA盖章' },
				{ label: 'HBL_AZ_sign', txt: 'HBL盖章AZ AGENT' }
			],
			hblTypeOptions: [
				{ label: '驳船', value: 'BARGE' },
				{ label: '大船', value: 'SHIP' },
				{ label: '驳船+大船', value: 'BARGE_SHIP' }
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
		if (this.exportTypeQuery.value === 'SEAWAYBILL_INDEMNITY') {
			this.docTypeOptions = [
				{ label: 'PDF', value: 'pdf' },
				{ label: 'XLS', value: 'xls' },
				{ label: 'DOC', value: 'doc' }
			]
		}
		// 输出HBL确认件弹窗宽度设置
		if (this.exportTypeQuery.value === 'hbl_confirm') {
			this.dialogConfig = {
				title: '选择输出类型',
				show: true,
				size: 'medium',
				width: '1000px'
			}
		}
		//根据不同选择的下拉框给单选组赋选中值
		if (this.exportTypeQuery.value === 'telex_apply') {
			this.createItem.fileType = 'TELEX_APPLY'
		}
		if (this.exportTypeQuery.value === 'SEAWAYBILL_INDEMNITY') {
			this.createItem.fileType = 'SEAWAYBILL_INDEMNITY'
		}
		if (this.exportTypeQuery.value === 'hbl_confirm') {
			this.createItem.mbl = 'n'
			this.createItem.hblType = 'SHIP'
		}
		if (this.exportTypeQuery.value === 'mbl_draft') {
			this.createItem.hblType = 'SHIP'
		}
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		}),
		mblNoDisabled() {
			return ['HBL_AZ', 'HBL_AZ_sign'].includes(this.createItem.fileType)
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
			if (['hbl_telex_original', 'hbl_telex_original_supChain'].includes(this.createItem.fileType) && item.value !== 'pdf') {
				disabled = true
			}
			if (['hbl_telex_original0', 'hbl_telex_original0_supChain'].includes(this.createItem.fileType) && item.value !== 'pdf') {
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
			if (['hbl_telex_original', 'hbl_telex_original0', 'hbl_telex_original_supChain', 'hbl_telex_original0_supChain', 'usa_sign'].includes(val)) {
				this.createItem.docType = 'pdf'
			}
			if (['HBL_AZ', 'HBL_AZ_sign'].includes(val)) {
				this.createItem.mbl = 'n'
			}
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.exportForm.validate(valid => {
					if (valid) {
						// 获取文件中文名，做导出文件名称
						let sItem = this.exportFileTypeOptions.find(item => item.label === this.createItem.fileType)
						let specialParam = {} // 特殊覆盖的字段
						//根据弹框类型设置不同文件名称
						if (this.exportTypeQuery.value == 'telex_apply') {
							sItem = this.exportFileTypeTelexOptions.find(item => item.label === this.createItem.fileType)
						}
						if (this.exportTypeQuery.value == 'SEAWAYBILL_INDEMNITY') {
							sItem = this.exportFileTypeSwbOptions.find(item => item.label === this.createItem.fileType)
						}
						this.createItem.fileTypeName = sItem ? sItem.txt : ''
						// M单确认件，
						if (['mbl_draft'].includes(this.exportTypeQuery.value)) {
							this.createItem.fileTypeName = this.exportTypeQuery.label
							this.createItem.fileType = this.exportTypeQuery.value
						}
						// HBL确认件增加mbl显示字段
						if (this.exportTypeQuery.value === 'hbl_confirm') {
							this.createItem.param = { mbl: this.createItem.mbl }
						}
						//根据文件名添加不同的param
						if (this.createItem.fileTypeName.includes('AGENT')) {
							this.createItem.param = {
								mbl: this.createItem.mbl,
								asRoleTxt: 'AS AGENT FOR THE CARRIER: LONG SAIL SHIPPING LINE S.A.LIMITED'
							}
							if (this.createItem.fileTypeName.includes('供应链')) {
								this.createItem.param.asRoleTxt = 'AS AGENT FOR THE CARRIER: LONGSAIL SUPPLY CHAIN CO., LTD.'
							}
							if (this.createItem.fileType === 'HBL_AZ_sign') {
								this.createItem.param.showSign = 'y'
								specialParam['fileType'] = 'HBL_AZ' // HBL不盖章AZ AGENT 和 HBL盖章AZ AGENT 这两个radio传给后端的值都是 HBL_AZ
							}
						}
						if (this.createItem.fileTypeName.includes('CARRIER')) {
							this.createItem.param = {
								mbl: this.createItem.mbl,
								asRoleTxt: 'AS CARRIER: LONG SAIL SHIPPING LINE S.A.LIMITED'
							}
							if (this.createItem.fileTypeName.includes('供应链')) {
								this.createItem.param.asRoleTxt = 'AS CARRIER: LONGSAIL SUPPLY CHAIN CO., LTD.'
							}
						}
						// 新增是否显示箱封号
						if (this.detailInfo.businessType === 'ship_export_lcl' && this.exportTypeQuery.value === 'hbl_confirm') {
							this.createItem.param.showCnSn = this.createItem.showCnSn
							this.createItem.param.showContainer = this.createItem.showCnSn
						}
						// 若文件类型为 发给客户的模板
						if (this.createItem.fileType === 'SEAWAYBILL_CUST') {
							this.createItem.param = { email: this.createItem.email }
						}
						// 文件类型是供应链的需要加isChain字段
						if (this.createItem.fileTypeName.includes('供应链')) {
							this.createItem.isChain = 'y'
						}
						this.close('Confirm', { ...this.createItem, ...specialParam })
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
.orderBlExport-form .el-radio__label {
	font-size: 12px;
}
.orderBlExport-form {
	.el-form-item__label,
	.el-form-item__content {
		line-height: 30px !important;
	}
	.el-input__inner,
	::placeholder {
		font-size: 12px;
	}
}
</style>
