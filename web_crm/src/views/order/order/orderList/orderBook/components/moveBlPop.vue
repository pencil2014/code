<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="exportForm" :rules="rules" :model="createdItem" label-position="right" label-width="70px" class="blMove-form">
			<el-form-item label="选择移动" prop="type" :show-message="false">
				<el-row>
					<el-col :span="8" v-for="(item, index) in typeOptions" :key="index">
						<el-radio @change="handleSelectType" size="mini" v-model="createdItem.type" :label="item.value" :disabled="!movePopQuery.parentBlId">
							{{ item.label }}
						</el-radio>
					</el-col>
				</el-row>
        <!-- <el-select v-model="createdItem.type" size="mini" clearable placeholder="请选择" @change="handleSelectType" style="width: 100%" :disabled="!movePopQuery.parentBlId">
          <el-option v-for="(item, index) in typeOptions" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select> -->
      </el-form-item>
			<el-form-item label="提单号" prop="blId" :show-message="false" v-if="createdItem.type !== 'parent'">
        <el-select v-model="createdItem.blId" size="mini" clearable placeholder="请选择" @change="handleSelectBlNo" style="width: 100%">
          <el-option v-for="(item, index) in blNoList" :label="item.label" :value="item.value" :key="index" :disabled="item.value === movePopQuery.blId || item.value === movePopQuery.parentBlId"></el-option>
        </el-select>
      </el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { blList } from '@/api/order/bl'

const defaultCreate = {
	type: 'child',
	blId: null,
}

export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '移动',
				show: true,
				size: 'medium',
				width: '360px'
			},
			createdItem: Object.assign({}, defaultCreate),
			rules: {
				type: [{ required: true, message: '请选择移动类型', trigger: 'change' }],
				blId: [{ required: true, message: '请选择提单号', trigger: 'change' }],
			},
			typeOptions: [
				{ label: '顶级', value: 'parent' },
				{ label: '子级', value: 'child' }
			],
			blNoList: []
		}
	},
	props: {
		movePopQuery: {
			type: Object,
			default: () => ({})
		},
	},
	created() {
		if (!this.movePopQuery.parentBlId) {
			this.createdItem.type = 'child'
		}
	},
	mounted() {
		this.getBlList()
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		}),
	},
	watch: {
	},
	components: {
		BaseDialog
	},
	methods: {
		// 获取一级提单
		getBlList() {
			blList({ orderNo: this.$route.query.orderNo, jointNo: this.$route.query.jointNo }).then(res => {
				this.blNoList = res.data.map(item => {
					return {...item, label: `${item.blNo}(${item.blId})`, value: item.blId}
				})
			})
		},
		handleSelectType(val) {

		},
		handleSelectBlNo(val) {

		},
		close(action, value) {
			this.$emit('close', action, value)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.exportForm.validate(valid => {
					if (valid) {
						this.close('Confirm', {
							parentBlId: this.createdItem.type === 'child' ? this.createdItem.blId : null,
							blId: this.movePopQuery.blId
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
.blMove-form {
	/deep/ .el-form-item{
		margin-bottom: 4px;
	}
	/deep/ .el-form-item__label, /deep/ .el-form-item__content{
		line-height: 20px;
	}
	/deep/.el-radio__label {
		font-size: 12px;
	}
}
</style>
