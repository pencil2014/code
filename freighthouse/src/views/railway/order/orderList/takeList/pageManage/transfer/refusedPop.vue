<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="form" :model="form" label-width="80px" :rules="rules">
      <el-form-item label="拒绝原因：" prop="rejectReason" required :show-message="false">
         <el-input type="textarea" v-model="form.rejectReason" size="mini" maxlength="512" show-word-limit></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { blPagerTransferReject } from '@/api/railway/blPage'
export default {
  props: ['oid'],
  data() {
    return {
      dialogConfig: {
				title: '拒绝',
				show: true,
				size: 'medium',
				width: '600px'
			},
      form: {
        rejectReason: '',
      },
      rules: {
        rejectReason: [
          {
            required: true,
            message: '请输入拒绝原因',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  components: {
    BaseDialog
  },
  methods: {
    close(action, value) {
			this.$emit('close', action, value)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.form.validate(valid => {
					if (valid) {
            blPagerTransferReject({
              oid: this.oid,
              rejectReason: this.form.rejectReason
            })
            .then(res => {
              this.$message.success('拒绝成功')
              this.close('Confirm')
            })
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

</style>