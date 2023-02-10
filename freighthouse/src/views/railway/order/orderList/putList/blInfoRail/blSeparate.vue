<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="separateForm" :rules="rules" :model="separateItem" label-position="right" label-width="95px" class="blSeparate-form">
			<el-form-item label="提单类型" prop="blType" :show-message="false">
				<el-select disabled v-model="separateItem.blType" size="mini" clearable placeholder="请选择" style="width: 100%">
					<el-option v-for="(item, index) in dictMap.blType" :label="item.label" :value="item.value" :key="index" :disabled="item.value === 'mbl'"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="提单命名规则" prop="nameType" :show-message="false">
				<el-select v-model="separateItem.nameType" size="mini" clearable placeholder="请选择" style="width: 100%">
					<el-option v-for="(item, index) in dictMap.blNameType.filter(item => item.value != 'sort')" :label="item.label" :value="item.value" :key="index"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="拆分数量" prop="separateCount" :show-message="false">
				<el-input-number size="mini" controls-position="right" @change="handleChange" :min="1" :max="10" v-model="separateItem.separateCount"></el-input-number>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { blSeparate } from '@/api/railway/bl'

const defaultCreate = {
	blId: '',
	separateCount: '',
	nameType: '',
	blType: 'hbl'
}

export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '提单拆分',
				show: true,
				size: 'medium',
				width: '360px'
			},
			separateItem: Object.assign({}, defaultCreate),
			rules: {
				blType: [{ required: true, message: '请选择提单类型', trigger: 'change' }],
				nameType: [{ required: true, message: '请选择提单命名规则', trigger: 'change' }],
				separateCount: [{ required: true, message: '请选择拆分数量', trigger: 'change' }]
			}
		}
	},
	props: {
		seprateBlId: {
			type: Number,
			default: ''
		}
	},
	created() {
		// 硬编码过滤不显示MBL or HBL
		this.dictMap.blType = this.dictMap.blType.filter(item => item.value !== 'master_or_house')
		//设置命名规则默认选中第一项
		this.separateItem.nameType = this.dictMap.blNameType[0].value
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.railway.orderNo
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

		//
		handleChange(val) {},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.separateForm.validate(valid => {
					if (valid) {
						this.handleBlSeparate(done)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},

		// 拆单
		handleBlSeparate(done) {
			this.separateItem.blId = this.seprateBlId
			this.separateItem.orderNo = this.orderNo || this.oQuery.orderNo
			blSeparate(this.separateItem).then(res => {
				this.$message({
					type: 'success',
					message: '拆单成功',
					duration: 1000,
					onClose: () => {
						this.close('Confirm')
					}
				})
			})
		}
	}
}
</script>

<style lang="scss">
.blSeparate-form {
	.el-form-item {
		margin-bottom: 4px;
	}
	.el-form-item__label,
	.el-form-item__content {
		line-height: 20px;
	}
}
</style>
