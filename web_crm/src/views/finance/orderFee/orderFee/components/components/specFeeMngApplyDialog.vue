<template>
<el-dialog
  :title="isBusinessFee ? '业务费用申请' : '专项管理费申请'"
  :visible.sync="dialogVisible.show"
  :close-on-click-modal="false"
  :append-to-body="true"
  custom-class="spec-fee-mng-apply"
  width="600px">
  <!-- <div style="text-align:center;margin-bottom:14px;font-size:12px;">当前订单不满足利润要求，录入客户专项管理费需要总裁办审批，是否发起申请？</div> -->
  <div v-if="!isModifyFee" style="margin-bottom:14px;font-size:12px;">{{feeSaveVerifyData.tipMsg ? feeSaveVerifyData.tipMsg : '本次费用录入需要审批'}}，是否发起申请？</div>
  <FinanceTable
    :option="option1"
    @send-multi="sendMulti"
    v-show="showTable1"/>
  <!-- <ul>
    <li v-for="(item, index) in feeSaveVerifyData.auditManList" :key="'auditManList'+index">
      <div class="detail-info-item">
        <div class="detail-info-item-label">审批人：</div>
        <div class="detail-info-item-content">{{item.approverName}}</div>
      </div>
      <div class="detail-info-item">
        <div class="detail-info-item-label">审批人角色：</div>
        <div class="detail-info-item-content">{{item.approverDesc}}</div>
      </div>
    </li>
  </ul> -->
  <el-form v-if="needApplyComment" :model="form" ref="form" label-width="80px">
    <el-form-item
      label="申请说明"
      prop="remark"
      :rules="{required: true, message: '申请说明不能为空', trigger: 'blur'}"
    >
      <el-input
        type="textarea"
        v-model="form.remark"
        maxlength="500">
      </el-input>
    </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="submit" size="mini" :loading="loading">提交审核</el-button>
    <el-button @click="dialogVisible.show = false" size="mini">取消</el-button>
  </span>
</el-dialog>
</template>
<script>
// import { specFeeMngApply } from '@/api/fin/specfee'
// import { saveOrderSpecialFee } from '@/api/fin/feeAdjust'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'

export default {
  name: 'specFeeMngApplyDialog',
  mixins: [mixin],
  props: {
    dialogVisible: {
      type: Object,
      default: () => ({})
    },
    fees: {
      type: Array,
      default: () => ([])
    },
    // source: {
    //   type: String,
    //   default: 'specialFee'
    // },
    isSpecialFee: {
      type: Boolean,
      default: false
    },
    isBusinessFee: {
      type: Boolean,
      default: false
    },
    isModifyFee: {
      type: Boolean,
      default: false
    },
    feeSaveVerifyData: {
      type: Object,
      default: {}
    },
    saveApplyCallback: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      orderNo: '',
      jointNo: '',
      form: {
        remark: ''
      },
      loading: false,
      option1: {},
      multipleSelection1: [],
    }
  },
  components: {
    FinanceTable
  },
  created() {
    let operationBtns = Object.assign(this.option.operationBtns, {
      show: false
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'specFeeMngApplyDialog',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns,
      selection: {
        show: false
      },
      maxHeight: 300,
      columns: [
        { prop: 'approverName', label: '审核人', type: 'text', key: 'approverName', width: '50%' },
        { prop: 'approverDesc', label: '审核人角色', type: 'text', key: 'approverDesc', width: '50%' },
      ]
    })
  },
  methods: {
    submit() {
      // this.loading = true // 开发测试用
      // setTimeout(() => {
      //   this.loading = false
      // }, 3000)
      // return
      if (this.needApplyComment) {
        this.$refs.form.validate(valid => {
          if (valid) {
            this.feeSaveVerifyData.remark = this.form.remark
            this.feeSaveVerifyData.fees = this.fees
            this.loading = true
            this.saveApplyCallback && this.saveApplyCallback().then(() => this.dialogVisible.show = false)
            setTimeout(() => {
              this.loading = false
            }, 600)
          }
        })
      } else {
        this.feeSaveVerifyData.remark = this.form.remark
        this.feeSaveVerifyData.fees = this.fees
        this.loading = true
        this.saveApplyCallback && this.saveApplyCallback().then(() => this.dialogVisible.show = false)
        setTimeout(() => {
          this.loading = false
        }, 600)
      }
      // if (this.isSpecialFee) {
        // this.$refs.form.validate(valid => {
        //   if (valid) {
        //     let data = {
        //       orderNo: this.orderNo,
        //       jointNo: this.jointNo,
        //       remark: this.form.remark,
        //       fees: this.fees
        //     }
        //     this.loading = true
        //     saveOrderSpecialFee(data).then(res => { // specFeeMngApply
        //       if (res.code === 0) {
        //         this.$message({
        //           message: '提交成功',
        //           type: 'success',
        //           showClose: true
        //         })
        //         this.dialogVisible.show = false
        //         this.$emit('cancel-edit')
        //       }
        //     }).finally(() => {
        //       this.loading = false
        //     })
        //   }
        // })
      // } else if (this.isBusinessFee) {
      //   this.loading = true
      //   this.saveApplyCallback && this.saveApplyCallback().then(() => this.dialogVisible.show = false)
      //   setTimeout(() => {
      //     this.loading = false
      //   }, 300)
      // }
    },
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
    },
  },
  computed: {
    needApplyComment() {
      return this.feeSaveVerifyData.needApplyComment === 'yes'
    },
    showTable1() {
      return this.feeSaveVerifyData.auditManList && !!this.feeSaveVerifyData.auditManList.length
    },
  },
  watch: {
    'dialogVisible.show'(val) {
      if (val) {
        this.orderNo = this.$route.query.orderNo
        this.jointNo = this.$route.query.jointNo
        this.$nextTick(() => {
          this.option1.data = this.feeSaveVerifyData.auditManList ? this.feeSaveVerifyData.auditManList : []
          this.form.remark = this.feeSaveVerifyData.remark
        })
      }
    }
  }
}
</script>
<style lang="scss">
.app-wrapper .spec-fee-mng-apply .el-textarea textarea {
  min-height: 40px !important;
}
.spec-fee-mng-apply {
  font-size: 12px;
  .el-button {
    font-size: 12px;
    height: 20px;
    padding: 3px 7px;
  }
  .el-textarea {
    font-size: 12px;
  }
  .detail-info-item-label {
    width: 80px;
  }
  .el-dialog__body {
    min-height: 160px;
  }
}
</style>