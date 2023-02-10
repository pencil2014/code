<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="refuseForm" :model="createdItem.form" class="create-form" label-width="70px" :rules="rules">
      <formItem v-for="(ele, index) in createdItem.items" :key="index" :item="ele" :form="createdItem.form" />
    </el-form>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import formItem from '@/components/Form/elFormItem'

export default {
  data() {
    return {
      dialogConfig: {
        title: '拒绝',
        show: true,
        size: 'medium'
      },
      rules: {
        remark: [
          { required: true, message: '请选择拒绝原因', trigger: 'change' }
        ]
      },
      createdItem: {
        form: {
          remark: ''
        },
        items: [
          {
            label: '拒绝原因',
            key: 'remark',
            prop: 'remark',
            type: 'input',
            inputType: 'textarea',
            maxlength: '512',
            showWordLimit: true
          }
        ]
      }
    }
  },
  props: {
  },
  created() {
  },
  mounted() {},
  computed: {
  },
  watch: {},
  components: {
    BaseDialog,
    formItem
  },
  methods: {
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },

    validate() {
      return true
    },

    dialogCallback(action, done) {
      if (action === 'Confirm') {
        // 表单校验
        this.$refs.refuseForm.validate((valid) => {
          if (valid) {
            this.close('Confirm',this.createdItem.form.remark)
          } else {
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
.create-form .el-col {
  padding-bottom: 20px;
}
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: auto;
}
</style>
