<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="refuseForm" :model="createdItem.form" class="create-form" label-width="70px">
      <formItem v-for="(ele, index) in createdItem.items" :key="index" :item="ele" :form="createdItem.form" />
    </el-form>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { closePage } from '@/utils/index'
import formItem from '@/components/Form/elFormItem'
import { preRefuse } from '@/api/order/list'

export default {
  data() {
    return {
      dialogConfig: {
        title: '拒绝原因',
        show: true,
        size: 'medium',
      },
      rules: {
        auditRemark: [{ required: true, message: '请输入拒绝原因', trigger: 'change' }],
      },
      createdItem: {
        form: {
          auditRemark: '',
        },
        items: [
          {
            label: '拒绝备注',
            key: 'auditRemark',
            prop: 'auditRemark',
            type: 'input',
            inputType: 'textarea',
            required: true,
            maxlength: '512',
            showWordLimit: true,
          },
        ],
      },
    }
  },
  props: {},
  created() {},
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      roles: (state) => state.user.roles,
    }),
  },
  watch: {},
  components: {
    BaseDialog,
    formItem,
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
            this.handleSubmit(done)
          } else {
            console.log('error submit!!')
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    },
    handleSubmit(done) {
      let params = {
        orderNo: this.$route.query.orderNo,
        remark: this.createdItem.form.auditRemark,
      }
      preRefuse(params).then(() => {
        done()
        this.close('Confirm')
        this.$message({
          type: 'success',
          message: '已拒绝',
          onClose: () => {
            closePage()
          },
        })
      })
    },
  },
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
