<template>
  <div class="info-page" style="padding: 0">
    <div class="info-title" style="margin: 10px 8px 0">
      <el-radio-group v-model="page" size="mini">
        <el-radio-button label="organization">关联关系</el-radio-button>
        <!-- <el-radio-button label="parent">母子公司</el-radio-button>
        <el-radio-button label="csn">收发通</el-radio-button>
        <el-radio-button label="brother">平级关系</el-radio-button> -->
        <el-radio-button label="parent">组织架构</el-radio-button>
      </el-radio-group>
      <!-- v-show="page!='csn'&&!isSubmit&&isClient&&isValid"  class="notSelf-hide"-->
      <el-button
        v-show="page != 'parent' && (isCts || isMaintenance === true) && !isBlacklist"
        size="mini"
        type="primary"
        @click="action"
        >新增</el-button
      >
    </div>
    <keep-alive>
      <component
        :action.sync="actionType"
        :RELATION="RELATION"
        :custid="custid"
        :orgid="orgid"
        :baseInfo="baseInfo"
        :selfData="selfData"
        :isBlacklist = "isBlacklist"
        :isMaintenance="isMaintenance"
        :is="currentComponent"
        :isSubmit="isSubmit"
        :isCts="isCts"
      />
    </keep-alive>
  </div>
</template>
<script>
import RelationNotice from './relationNotice'
import RelationParent from './relationParent'
import RelationBrother from './relationBrother'
import RelationOrganization from './relationOrganization'
import RELATION from '@/api/crm/custRelation'
import { mapState } from 'vuex'

export default {
  // name: 'CUST0',
  name: 'CUSTm',
  label: '客户关系',
  potentialHide: true,
  props: ['custid', 'orgid', 'isClient', 'baseInfo','isBlacklist'],
  components: {
    RelationNotice,
    RelationParent,
    RelationBrother,
    RelationOrganization
  },
  computed: {
    ...mapState('user', ['userId']),
    currentComponent() {
      const page = this.page
      // return page == 'csn'
      //   ? RelationNotice
      //   : page == 'parent'
      //     ? RelationParent
      //     : RelationBrother
      if (page === 'parent') {
        return RelationParent
      } else {
        return RelationOrganization
      }
    },
    selfData() {
      console.log({ custid: this.custid, name: this.$attrs.companyName })
      return { custid: this.custid, name: this.$attrs.companyName }
    },
    isSubmit() {
      return this.$store.state.crm.detailBaseInfo.verifyStatus == 'submit'
    },
    isValid() {
      return this.$store.state.crm.detailBaseInfo.status == 'valid'
    },
    isCts() {
      return (this.$store.state.user.roles || []).includes('cts')
    }
  },
  data() {
    return {
      RELATION,
      page: 'organization',
      // page: 'brother',
      actionType: '',
      isMaintenance: false
    }
  },
  created() {
    // console.log(this.$attrs)
    // 判断该客户的维护人
    let item = this.baseInfo.bds.find(item => item.bdEmployeeId== this.userId )
    if (item && (item.maintainerType === 'potential' || item.maintainerType === 'order')) {
        this.isMaintenance = true
    } else {
        this.isMaintenance = false
    }
  },
  methods: {
    action() {
      this.actionType = this.page
    }
  }
}
</script>
