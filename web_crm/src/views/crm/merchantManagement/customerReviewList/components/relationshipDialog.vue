<template>
<div>
  <div style="display:inline-flex;align-items:center" v-show="showBtn">
    <el-button-group>
      <el-button @click="back" size="mini">{{$attrs.backText||'取消'}}</el-button>
      <el-button
        v-if="!$attrs.refuseHide && isCtsOrSps"
        @click="refuseOption.show = true"
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
import RELATION from '@/api/crm/custRelation'
export default {
  name: 'opBtnDialog',
  mixins: [routerMixin],
  components: { CrmDialog },
  props: ['custid', 'isReviewed', 'isReviewDetail', 'oid','createdBy'],
  data: function () {
    return {
      isCtsOrSps: this.$store.state.user.roles.includes('cts') || this.$store.state.user.roles.includes('sps'),
      passOption: {
        title: '审核通过',
        show: false,
        form: { custLevel: '' }
      },
      refuseOption: {
        title: '审核拒绝',
        show: false,
        width: '400px',
        form: { refuseReason: '' },
        formItems: [
          { label: '拒绝原因', prop: 'refuseReason', type: 'textarea', maxlength: 512 , rules},
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
    // 通过按钮
    showDialog() {
      this.$confirmWarn('确认通过审核？', () => this.closeDialog('pass', true))
    },
    closeDialog(verifyStatus, sure) {
      let option = this[verifyStatus + 'Option']
      if(!sure){
        if(verifyStatus === 'pass'){
          option.form.custLevel = ''
        }else{
          option.form.refuseReason = ''
        }
        return (option.show = false)
      }

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
      if (verifyStatus === 'pass') {
        let datas = {
         oid: this.oid,
         custid:this.custid,
         createdBy:this.createdBy
        }
         RELATION.verifyPass(datas).then((res) => {
            option.show = false
            this.$msgSucClose('操作成功！')
            this.back()
        })
      } else {
          let datas = {
            oid: this.oid,
            custid:this.custid,
            createdBy:this.createdBy
          }
         RELATION.verifyRefuse({ ...datas, ...data }).then((res) => {
            option.show = false
            this.$msgSucClose('操作成功！')
            this.back()
        })
      }
    },
  },
}
</script>
