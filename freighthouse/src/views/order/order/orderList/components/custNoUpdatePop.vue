<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="custNoUpdataForm" id="custIntrustNo" :rules="rules" :model="createItem" label-width="85px">   
      <el-form-item label="客户委托号" prop="custIntrustNo" :show-message="true">
        <el-input  size="mini" placeholder="请输入1-128位字符的客户委托号" v-model="createItem.custIntrustNo" clearable ></el-input>
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
        title: '修改客户委托号',
        show: true,
        size: 'medium',
        width: "640px"
			},
			createItem: {
				orderNo: '',
				custIntrustNo: ''
			},
			rules: {
				custIntrustNo: [
					{required: true, message: '请输入客户委托号', trigger: ['blur', 'change']},
					{max: 128, message: '客户委托号长度在 1 到 128 个字符', trigger: ['blur', 'change']}
				]
			}
		}
	},
	props: ['custNoParam'],
	created() {
		this.createItem = {
			custIntrustNo: this.custNoParam.custIntrustNo,
			orderNo: this.custNoParam.orderNo
		}
	},
	mounted() {
	},
	computed: {},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		// handleBlur() {
		// 	this.createItem.custIntrustNo = this.createItem.custIntrustNo.substring(64, 0)
		// },
		close(action, value) {
      this.$emit('close', action, value)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
				this.$refs.custNoUpdataForm.validate(valid => {
					if (valid) {
						this.close('Confirm', this.createItem)
					} else {
						console.log('error submit!!')
						// return false
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

</style>
