<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="custNoUpdataForm" id="changeValidityDatePop" :rules="rules" :model="createItem" label-width="120px" label-position="top">
      <el-form-item label="Template Name" prop="tempName" :show-message="true">
        <el-input v-model="createItem.tempName" placeholder="" maxlength="60"></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index-en.vue'
import { validateOverseasFreightIsOnlyEnchars } from '@/utils/validate'
export default {
  data() {
    return {
      dialogConfig: {
        title: 'Save as template',
        show: true,
        size: 'medium',
        width: '450px'
      },
      createItem: {
        tempName: ''
      },
      rules: {
        tempName: [
          {
            required: true,
            message: 'Please enter the name of the template',
            trigger: 'change'
          },
          {
            validator: validateOverseasFreightIsOnlyEnchars(),
            trigger: 'change'
          }
        ]
      }
    }
  },
  created() {},
  mounted() {},
  computed: {},
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
        this.$refs.custNoUpdataForm.validate((valid) => {
          if (valid) {
            this.close('Confirm', this.createItem)
          } else {
            this.$msgErrClose('Please fill in the fields in the red box as required!')
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
#changeValidityDatePop {
  .el-form-item__label,
  .el-form-item__content {
    line-height: 20px;
  }
  .el-range-editor--mini .el-range-separator {
    line-height: 12px;
    font-size: 12px;
  }
}
</style>
