<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="hblPrintForm" :rules="rules" :model="createItem" label-position="right" label-width="95px" class="blPrintExport-form">
			<el-form-item label="文件类型" prop="fileType">
				<el-row>
					<el-col :span="12" v-for="(item, index) in exportFileTypeOptions" :key="index">
						<el-radio @change="handleChangeFileType" size="mini" v-model="createItem.fileType" :label="item.label">
							{{ item.txt }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item label="显示MBL No" prop="mbl">
				<el-row>
					<el-col :span="4" v-for="(item, index) in mblShowOptions" :key="index">
						<el-radio size="mini" v-model="createItem.mbl" :label="item.label">
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
	fileType: 'agent',
	mbl: 'n',
	asRoleTxt: ''
}

export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '选择打印HBL类型',
				show: true,
				size: 'medium'
				// width: "800px"
			},
			createItem: Object.assign({}, defaultCreate),
			rules: {
				fileType: [{ required: true, message: '请选择文件类型', trigger: 'change' }],
				mbl: [{ required: true, message: '请选择mbl显示', trigger: 'change' }]
			},
			exportFileTypeOptions: [
				{ label: 'agent', txt: 'HBL不盖章AS AGENT' },
				{ label: 'carrier', txt: 'HBL不盖章AS CARRIER' },
			],
			mblShowOptions: [
				{label: 'y', txt: '是'},
				{label: 'n', txt: '否'}
			]
		}
	},
	props: {
		hblPrintQuery: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
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
		close(action, value) {
			this.$emit('close', action, value)
		},
		handleChangeFileType(val) {
			// console.log('🚀 ~ val', val)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.hblPrintForm.validate(valid => {
					if (valid) {
						if (this.createItem.fileType === 'agent') {
							this.createItem.asRoleTxt = 'AS AGENT FOR THE CARRIER: LONG SAIL SHIPPING LINE S.A.LIMITED'
						}
						if (this.createItem.fileType === 'carrier') {
							this.createItem.asRoleTxt = 'AS CARRIER: LONG SAIL SHIPPING LINE S.A.LIMITED'
						}
						this.close('Confirm', {
							blId: this.hblPrintQuery.blId,
							orderNo: this.hblPrintQuery.orderNo,
							mbl: this.createItem.mbl,
							fileType: this.createItem.fileType,
							asRoleTxt: this.createItem.asRoleTxt
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

<style>
.blPrintExport-form {
	/* padding: 20px 80px 20px 20px; */
}
.blPrintExport-form .el-radio__label {
	font-size: 12px;
}
</style>
