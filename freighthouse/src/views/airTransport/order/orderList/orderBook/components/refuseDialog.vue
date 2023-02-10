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
import { bookRefuseOp, orderInfo } from '@/api/airTransport/order'
import { getDictMap } from '@/utils/tools'
import formItem from '@/components/Form/elFormItem'
import { closePage } from '@/utils/index'
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
            label: '拒绝接收人',
            key: 'refuseEmployeeId',
            type: 'select',
            required: true,
            prop: 'refuseEmployeeId',
            options: []
          },
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
    }
  },
  watch: {},
  components: {
    BaseDialog,
    formItem
  },
  methods: {
    init() {
      // 获取拒绝原因
      this.getOrderInfo()
      this.createdItem.items.map((item) => {
        if (item.key === 'reason') {
          item.options = this.getRefuseReason()
        }
        return Object.assign({}, item)
      })
    },
    // 获取订单详情
    getOrderInfo() {
      let { orderNo, jointNo } = this.$route.query
      let params = {
        orderNo: orderNo
      }
      if (jointNo) {
        params.jointNo = jointNo
      }
      orderInfo(params).then((res) => {
        if (Array.isArray(res.data.workAssign)) {
          for (let i = 0; i < res.data.workAssign.length; i++) {
            let obj = {}
            if (
              res.data.workAssign[i].jobCode === 'bd' ||
              res.data.workAssign[i].jobCode === 'pricing'
            ) {
              obj.value = res.data.workAssign[i].employeeId
              obj.label = `${res.data.workAssign[i].employeeName}(${res.data.workAssign[i].jobCname})`
              this.createdItem.items[0].options.push(obj)
            }
          }
          if(this.createdItem.items[0].options.length===2&&(this.createdItem.items[0].options[0].value==this.createdItem.items[0].options[1].value)){
            // 商务和业务是同一个人时候，拒绝给业务岗
            this.createdItem.items[0].options=[this.createdItem.items[0].options[0]]
          }
        }
      })
    },
    getRefuseReason() {
      let reasons = getDictMap('airBkgRefuseReason')
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
        refuseEmployeeId: this.createdItem.form.refuseEmployeeId,
        refuseReason: this.createdItem.form.reason,
        refuseRemark: this.createdItem.form.auditRemark
      }
      if (this.$route.query.orderNo.jointNo) {
        params.jointNo = this.$route.query.orderNo.jointNo
      }

      bookRefuseOp(params).then(() => {
        done()
        this.close('Confirm')
        this.$message({
          type: 'success',
          message: '已拒绝',
          onClose: () => {
            // this.$router.go(-1)
            // let views = this.$store.state.tagsView.visitedViews.filter(
            //   (item) => item.params.orderNo === this.$route.params.orderNo
            // )
            // this.$store.commit('tagsView/DEL_SAMEORDER_VISITED_VIEW', views)
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
