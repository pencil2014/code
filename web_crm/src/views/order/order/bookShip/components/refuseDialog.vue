<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="refuseForm" :model="createdItem.form" class="bkg-refuse-form" label-width="90px"> 
      <formItem v-for="(ele, index) in createdItem.items" :key="index" :item="ele" :form="createdItem.form" />
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import {auditRefuse, bkgRefuse, changeRefuse, changeBkgRefuse} from '@/api/order/book/list'
import { addRefuse, addBkgRefuse } from '@/api/order/book/container'
import {getDictMap} from '@/utils/tools'
import formItem from '@/components/Form/elFormItem'
import { Form } from 'element-ui'

export default {
  data() {
    return {
      dialogConfig: {
        title: '拒绝订舱',
        show: true,
        size: 'medium'
      },
      rules: {
        refuseEmployeeId: [{required: true, message: '请选择拒绝人', trigger: 'change'}],
        reason: [{required: true, message: '请选择拒绝原因', trigger: 'change'}],
      },
      // 代订舱无商务审核的拒绝接收人下拉值不需显示商务
      createdItem: {
        form: {bkgReqNo: '', orderNo: '', refuseEmployeeId: '', reason: '', auditRemark: ''},
        items: [
          {label: "拒绝接收人", key: "refuseEmployeeId", type: "select", required: true, prop: "refuseEmployeeId",
            options: this.params.auditEmployeeId ? [{label: this.params.launchEmployeeName, value:this.params.launchEmployeeId},
            {label: this.params.auditEmployeeName, value:this.params.auditEmployeeId}] : [{label: this.params.launchEmployeeName, value:this.params.launchEmployeeId}],
            change: (val, item) => {
              // 拒绝给业务，拒绝原因默认显示'爆仓'
              if(val && val === this.params.launchEmployeeId) {
                this.createdItem.form.reason = 'position'
              } else {
                this.createdItem.form.reason = ''
              }
            }
          },
          {label: "拒绝原因", key: "reason", type: "select", options: [], required: true, prop: "reason"},
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
    isChange: {
      type: Boolean,
      default: false
    },
    isAddCont: {
      type: Boolean,
      default: false
    }
  },
  created() {
    this.init()
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      // roles: state => state.user.roles,
    }),
    roles() {
      let roles = this.$route.query.roles ? this.$route.query.roles.split(',') : []
      return roles
    },
    isPricing() {
      return this.roles.includes('pricing')
    },
    isBkg() {
      return this.roles.includes('bkg')
    }
  },
  watch: {
  },
  components: {
    BaseDialog,
    formItem
  },
  methods: {
    init() {
      // 商务改船申请审核拒绝、普通商务审核拒绝，bkg拒绝占舱申请都不需要指定拒绝接收人
      if (this.isPricing || (this.isBkg && !this.params.orderNo)) {
        this.dialogConfig.title = '审核拒绝'
        this.createdItem.items = this.createdItem.items.filter(item => item.key !== 'refuseEmployeeId')
        this.createdItem.form.refuseEmployeeId = this.params.launchEmployeeId
      }
      // 获取拒绝原因
      this.createdItem.items.map(item => {
        if (item.key === 'reason') {
          item.options = this.getRefuseReason()
        }
        return Object.assign({}, item)
      })
      // if (this.isChange && this.isPricing) {
      //   this.dialogConfig.title = '审核拒绝'
      //   this.createdItem.items = this.createdItem.items.filter(item => item.key !== 'refuseEmployeeId')
      //   delete(this.createdItem.form.refuseEmployeeId)
      // }
    },
    getRefuseReason() {
      let reasons = []
      if (this.isPricing) {
        reasons = getDictMap("orderAuditRefuseReason")
      } 
      if (this.isBkg) {
        reasons = getDictMap("bkgRefuseReason")
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
      Object.assign(this.createdItem.form, {bkgReqNo: this.params.bkgReqNo, orderNo: this.params.orderNo})
      let data = {}
      let roles = this.$route.query.roles.split(",")
      // pricing,bkg角色的改船或加柜申请的审核拒绝的api
      let fun = auditRefuse
      if (roles.includes("pricing")) {
        if (this.isChange) {
          fun = changeRefuse
        }
        if (this.isAddCont) {
          fun = addRefuse
        }
      }
      if (roles.includes("bkg")) {
        fun = bkgRefuse
        if (this.isChange) {
          fun = changeBkgRefuse
        }
        if (this.isAddCont) {
          fun = addBkgRefuse
        }
      }
      // let fun = roles.includes("pricing") && this.isChange ? changeRefuse : roles.includes("pricing") && !this.isChange ? auditRefuse 
      // : roles.includes("bkg") && this.isChange ? changeBkgRefuse : bkgRefuse
      // pricing拒绝的传参
      if (this.isPricing) {
        data = Object.assign({}, this.createdItem.form)
        // 加柜改船的要传containerModifyInfo，portModifyInfo节点的bkgReqNo
        if (this.isChange || this.isAddCont) {
          data = {
            orderNo: this.createdItem.form.orderNo,
            bkgReqNo: this.params.bkgReqNo,
            refuseReason: this.createdItem.form.reason,
            refuseRemark: this.createdItem.form.auditRemark
          }
        }
      }
      // bkg拒绝的传参
      if (this.isBkg) {
        data = {
          bkgReqNo: this.createdItem.form.bkgReqNo,
          refuseEmployeeId: this.createdItem.form.refuseEmployeeId,
          refuseReason: this.createdItem.form.reason,
          refuseRemark: this.createdItem.form.auditRemark
        }
        // 加柜申请bkg拒绝要传orderNo,要传containerModifyInfo，portModifyInfo节点的bkgReqNo
        if (this.isChange || this.isAddCont) {
          Object.assign(data, {
            bkgReqNo: this.params.bkgReqNo,
            orderNo: this.createdItem.form.orderNo
          })
        }
      }
      fun(data).then(() => {
        done()
        this.$message({
          type: 'success',
          message: '已拒绝',
          duration: 1000,
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
.bkg-refuse-form{
  .el-form-item{
    margin-bottom: 4px;
  }
  .el-form-item__label, .el-form-item__content {
    line-height: 20px;
  }
}
</style>
