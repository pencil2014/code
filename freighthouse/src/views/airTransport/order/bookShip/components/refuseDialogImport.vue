<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="refuseForm" :model="createdItem.form" class="create-form" label-width="100px">
      <formItem v-for="(ele, index) in createdItem.items" :key="index" :item="ele" :form="createdItem.form" />
    </el-form>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { bookRefuse } from '@/api/airTransport/order-import'
import { getDictMap } from '@/utils/tools'
import { closePage } from '@/utils/index'
import formItem from '@/components/Form/elFormItem'

export default {
  data() {
    return {
      dialogConfig: {
        title: '拒绝订舱',
        show: true,
        size: 'medium'
      },
      rules: {
        refuseEmployeeId: [
          { required: true, message: '请选择拒绝人', trigger: 'change' }
        ],
        reason: [
          { required: true, message: '请选择拒绝原因', trigger: 'change' }
        ]
      },
      createdItem: {
        form: {
          bkgReqNo: '',
          orderNo: '',
          refuseEmployeeId: '',
          reason: '',
          auditRemark: ''
        },
        items: [
          {
            label: '拒绝原因',
            key: 'reason',
            type: 'select',
            options: [],
            required: true,
            prop: 'reason'
          },
          {
            label: '拒绝备注',
            key: 'auditRemark',
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
    params: {
      type: Object,
      default() {
        ;[]
      }
    },
    reqType: {
      type: String,
      default: ''
    }
  },
  created() {
    this.init()
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      roles: (state) => state.user.roles
    }),
    isChange() {
      return this.reqType === 'change'
    },
    isPricing() {
      return this.roles.includes('pricing')
    },
    isBkg() {
      return this.roles.includes('bkg')
    }
  },
  watch: {},
  components: {
    BaseDialog,
    formItem
  },
  methods: {
    init() {
      // 商务改船申请审核拒绝、普通商务审核拒绝，bkg拒绝占舱申请都不需要指定拒绝接收人
      if (this.isPricing || (this.isBkg && !this.params.orderNo)) {
        this.dialogConfig.title = '拒绝订单'
        this.createdItem.items = this.createdItem.items.filter(
          (item) => item.key !== 'refuseEmployeeId'
        )
        this.createdItem.form.refuseEmployeeId = this.params.launchEmployeeId
      }
      // 获取拒绝原因
      this.createdItem.items.map((item) => {
        if (item.key === 'reason') {
          item.options = this.getRefuseReason()
        }
        return Object.assign({}, item)
      })
    },
    getRefuseReason() {
      let reasons = []
      if (this.isPricing) {
        reasons = getDictMap('airBkgRefuseReason')
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
        refuseReason: this.createdItem.form.reason,
        refuseRemark: this.createdItem.form.auditRemark
      }
      bookRefuse(params).then(() => {
        done()
        this.close('Confirm')
        this.$message({
          type: 'success',
          message: '已拒绝',
          onClose: () => {
            closePage()
          }
        })
      })
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
