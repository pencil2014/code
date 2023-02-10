<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="refuseForm" :model="createdItem.form" class="create-form" label-width="60px"> 
      <formItem v-for="(ele, index) in createdItem.items" :key="index" :item="ele" :form="createdItem.form" />
    </el-form>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import {getDictMap} from '@/utils/tools'
import formItem from '@/components/Form/elFormItem'

export default {
  data() {
    return {
      dialogConfig: {
        title: '标记取消',
        show: true,
        size: 'medium'
      },
      rules: {
        // cancelReason: [{required: true, message: '请选择取消原因', trigger: 'change'}],
      },
      createdItem: {
        form: {cancelRemark: ''},
        items: [
          // {label: "取消原因", key: "cancelReason", type: "select", options: getDictMap("soCancelReason"), required: true, prop: "cancelReason"},
          {label: "取消备注", key: "cancelRemark", type: "input", inputType: "textarea"}
        ]
      },
    }
  },
  props: {
    type: {
      type: String,
      default: ''
    }
  },
  created() {
    if (this.type === 'withDrawCancel') {
      this.$set(this.dialogConfig, 'title', '撤销标记取消')
      this.createdItem.items = [{label: "备注", key: "cancelRemark", type: "input", inputType: "textarea"}]
    }
  },
  mounted() {

  },
  computed: {
      
  },
  watch: {
  },
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
            this.$emit("handleCancelSubmit", this.createdItem.form)
          } else {
            console.log('error submit!!');
            return false;
          }
        })
      } else {
        this.close('Cancel')
      }
    },
  }
};
</script>

<style lang="scss">
.create-form .el-col{
  padding-bottom: 20px;
}
.el-date-editor.el-input, .el-date-editor.el-input__inner {
  width: auto;
}
</style>
