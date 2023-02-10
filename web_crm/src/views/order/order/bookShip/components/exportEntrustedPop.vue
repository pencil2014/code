<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="exportForm" :rules="rules" :model="createItem" label-position="right" label-width="70px" class="bookingExport-form">
      <el-form-item label="托书类型" prop="bookingType">
				<el-row>
					<el-col :span="8" v-for="(item, index) in bookingTypeOptions" :key="index">
						<el-radio
							size="mini"
							v-model="createItem.bookingType"
							:label="item.value"
						>
							{{ item.label }}
						</el-radio>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item label="输出类型" prop="docType">
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
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>
<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
const defaultCreate = {
	docType: 'pdf',
  bookingType:'LONGSAIL_OFFSITE'
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
      bookingTypeOptions:[
        { label: '长帆供应链订同行', value: 'LONGSAIL_OFFSITE' },
        // { label: '长帆本地托书', value: 'LONGSAIL_LOCAL' },
      ],
      rules:{
        docType: [{ required: true, message: '请选择输出类型', trigger: 'change' }],
        bookingType: [{ required: true, message: '请选择托书类型', trigger: 'change' }],
      }
		}
	},
	props: {
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
.bookingExport-form {
	/* padding: 20px 80px 20px 20px; */
}
.bookingExport-form .el-radio__label {
	font-size: 12px;
}
</style>
