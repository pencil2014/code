<template>
<div>
  <div style="display:inline-flex;align-items:center" v-show="showBtn">
    <el-button-group>
      <el-button @click="back" size="mini">{{$attrs.backText||'取消'}}</el-button>
      <el-button
        v-if="!$attrs.refuseHide && isCtsOrSps"
        @click="refuseBtn"
        size="mini"
      >拒绝</el-button>
    </el-button-group>
    <el-button
      v-if="!$attrs.refuseHide && isCtsOrSps"
      type="primary"
      icon="el-icon-check"
      @click="showDialog"
      size="mini"
    >通过</el-button>
    <CrmDialog ref="pass" :option="passOption" @close="closeDialog('pass',$event)" />
    <CrmDialog
      v-if="refuseOption.show"
      ref="refuse"
      :option="refuseOption"
      @close="closeDialog('refuse',$event)"
    />
  </div>
  <div v-show="!showBtn">
    <el-button @click="back" size="mini">返回</el-button>
  </div>
</div>
</template>

<script>
import CrmDialog from '@/views/crm/components/crmDialog'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
let rules = [{ required: true, message: ' ' }]
import CUSTOMER from '@/api/crm/customer'
import SUPPLIER from '@/api/crm/supplier'
export default {
  name: 'opBtnDialog',
  mixins: [routerMixin],
  components: { CrmDialog },
  props: ['custid', 'isSupplier', 'isValid', 'closeLevel', 'isReviewed', 'isReviewDetail'],
  data: function () {
    return {
      isCtsOrSps: this.$store.state.user.roles.includes('cts') || this.$store.state.user.roles.includes('sps'),
      passOption: {
        title: '审核通过',
        show: false,
        form: { custLevel: '' },
        formItems: [{ label: '客户等级', prop: 'custLevel', type: 'select', rules }],
      },
      refuseOption: {
        title: '审核拒绝',
        show: false,
        width: '400px',
        form: { refuseReason: [], refuseRemark: '' },
        formItems: [
          { label: '拒绝原因', prop: 'refuseReason', propInDict: this.isSupplier ? 'supplierVerifyRejection' : 'verifyRejection', multiple: true, type: 'select', rules },
          { label: '拒绝备注', prop: 'refuseRemark', type: 'textarea', maxlength: 512 },
        ],
      }
      // showBtn: true
    }
  },
  activated() {
  },
  computed: {
    showBtn () {
      if (this.isReviewDetail) {
        if (!this.isReviewed) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    }
  },
  methods: {
    back() {
      this.routerDelBack()
    },
    refuseBtn(){
      this.refuseOption.show = true
      this.refuseOption.form = { refuseReason: [], refuseRemark: '' }
    },
    // 通过按钮
    showDialog() {
      // 如果是供应商，或者客户审核不是首次审核，不需要弹框选择等级
      if (!this.isSupplier && this.isValid) return (this.passOption.show = true)
      this.$confirmWarn('确认通过审核？', () => this.closeDialog('pass', true))
    },
    closeDialog(verifyStatus, sure) {
      let option = this[verifyStatus + 'Option']
      if (!sure) return (option.show = false)
      let method = this.isSupplier ? SUPPLIER : CUSTOMER
      let data = {}
      let form = option.form
      for (const key in form) {
        let value = form[key]
        if (value instanceof Array) {
          data[key] = value.join(',')
        } else {
          data[key] = value
        }
      }
      method.verify({ custids: [this.custid], supplierIds: [this.custid], verifyStatus, ...data }).then((res) => {
        this.$emit('showWhitelistBtn')
        option.show = false
        this.$msgSucClose('操作成功！')
        this.back()
        // this.refreshView('CustomerReviewList', 'from')
        // this.refreshView('SupplierReviewList', 'from')
        // this.showBtn = false
        // this.routerDelBack(true, this.closeLevel == 2)
      })
    },
  },
}
</script>
