<template>
  <div class="info-page">
    <div class="info-title">
      <span :class="{isBad:true}">基本信息</span>
      <el-button icon="el-icon-edit" size="mini" @click="edit" type="primary">基础资料修改</el-button>
    </div>
    <ul class="base-info-list">
      <li
        v-for="item in baseInfoArr"
        :key="item.key"
        :class="{'block-li':item.block}"
      >{{item.label}}：{{custInfo[item.key]}}</li>
    </ul>
  </div>
</template>
<script>
import { routerMixin } from '@/views/finance/mixins/routerMixin'
// import { mapGetters } from 'vuex'

export default {
  name: 'CUST7',
  label: '信用管理',
  hidden: true,
  mixins: [routerMixin],
  computed: {
    // ...mapGetters(['dictMapObj']),
    custInfo() {
      console.log(this.$store.state.crm.detailBaseInfo)
      return this.$store.state.crm.detailBaseInfo
    },
  },
  data() {
    return {
      baseInfoArr: [
        { label: '企业类别', key: '_roles' }, //customerRole 类似下拉框，编辑需用原数据，所有添加_
        { label: '客户类型', key: '_custClass' }, // 'customerClass'
        { label: '客户名称', key: 'name' },
        { label: '简称', key: 'shortName' },
        { label: '英文名', key: 'ename' },
        { label: '所属行业', key: 'industry' },
        { label: '企业类型', key: 'entType' },
        { label: '社信统一代码', key: 'uscc' },
        { label: '纳税人识别号', key: 'taxId' },
        { label: '成立日期', key: 'setupDate' },
        { label: '营业执照到期日', key: 'usccExpDate' },
        { label: '国家', key: 'country' },
        { label: '省', key: 'indexAddr' },
        { label: '注册地址', key: 'registerAddr', block: true },
        { label: '详细地址', key: 'detailAddr', block: true },
        { label: '备注', key: 'remark', block: true },
      ],
    }
  },
  created() {},
  methods: {
    edit() {
      this.routerPushTab('CustomerDetailBaseEdit')
    },
  },
}
</script>
<style lang="scss"  scoped>
.info-title > span.isBad::after {
  content: '（被执行人）';
  color: #cd4130;
}
</style>