<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="refuseForm" id="refuseForm" :rules="rules" :model="createItem" label-width="65px" class="refuse-pop-form">   
			<el-form-item label="审核备注" prop="auditRemark" :show-message="false">
        <el-input type="textarea" :rows="3" size="mini" v-model="createItem.auditRemark" style="width: 100%" clearable placeholder="请输入审核备注" maxlength="128" show-word-limit> </el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
export default {
	data() {
		return {
			dialogConfig: {
        title: '审核通过',
        show: true,
        size: 'medium',
        width: "480px"
			},
			createItem: {
				auditRemark: ''
			},
			rules: {
				// auditRemark: [{required: true, message: '请选择审核备注', trigger: 'blur'}]
			},
		}
	},
	created() {
	},
	mounted() {
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
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
    dialogCallback(action, done) {
      if (action === 'Confirm') {
				this.$refs.refuseForm.validate(valid => {
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
.refuse-pop-form{
	/deep/ .el-form-item{
		margin-bottom: 4px;
	}
	/deep/ .el-form-item__label, /deep/ .el-form-item__content{
		line-height: 20px;
	}
}
</style>
