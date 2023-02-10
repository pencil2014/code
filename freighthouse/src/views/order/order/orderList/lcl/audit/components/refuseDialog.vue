<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="refuseForm" :model="createdItem.form" class="create-form" label-width="70px"> 
      <formItem v-for="(ele, index) in createdItem.items" :key="index" :item="ele" :form="createdItem.form" />
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import {lclAuditRefuse} from '@/api/order/list'
import {getDictMap} from '@/utils/tools'
import formItem from '@/components/Form/elFormItem'
import { Form } from 'element-ui'

export default {
  data() {
    return {
      dialogConfig: {
        title: '审核拒绝',
        show: true,
        size: 'medium'
      },
      rules: {
        reason: [{required: true, message: '请选择拒绝原因', trigger: 'change'}],
      },
      createdItem: {
        form: {orderNo: '', reason: '', auditRemark: ''},
        items: [
          {label: "拒绝原因", key: "reason", type: "select", options: getDictMap("lclAuditRefuseReason"), required: true, prop: "reason"},
          {label: "拒绝备注", key: "auditRemark", type: "input", inputType: "textarea", maxlength: '512', showWordLimit: true}
        ]
      },
    }
  },
  props: {
    params: {
      type: Object,
      default(){[]}
    },
  },
  created() {
    this.init()
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap
    }),
  },
  watch: {
  },
  components: {
    BaseDialog,
    formItem
  },
  methods: {
    init() {
      // 获取拒绝原因
      this.createdItem.items.map(item => {
        if (item.key === 'reason') {
          item.options = this.getRefuseReason()
        }
        return Object.assign({}, item)
      })
    },
    getRefuseReason() {
      let reasons = getDictMap("lclAuditRefuseReason")
      // 海运出口拼箱的用新的字典
      if (this.params.businessType === 'ship_export_lcl') {
        reasons = getDictMap("shipExportLclRefuseReason")
      }
      return reasons
    },
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
            console.log('error submit!!');
            return false;
          }
        })
      } else {
        this.close('Cancel')
      }
    },
    handleSubmit(done) {
      Object.assign(this.createdItem.form, {orderNo: this.params.orderNo})
      lclAuditRefuse(this.createdItem.form).then(() => {
        done()
        // this.close('Confirm')
        this.$message({
          type: 'success',
          message: '已拒绝',
          duration: 200,
          onClose: () => {
            // this.$router.go(-1)
            this.close('Confirm')
          }
        })
      })
    }
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
