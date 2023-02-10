<template>
  <div>
    <template v-if="isCts">
      <PotentialList />
    </template>
    <template v-else>
      <CustomerList />
    </template>
  </div>
</template>

<script>
import CustomerList from '@/views/crm/merchantManagement/customerList/index'
import PotentialList from '@/views/crm/merchantManagement/potentialList/index'
export default {
  components: {
    CustomerList,
    PotentialList
  },
  data () {
    return {
      isManager: false, // 管理者
      isCts: false, // 客户部
      isSps: false, // 供应部
    }
  },
  created () {
    let roles = this.$store.state.user.roles || []
    this.isManager = roles.includes('manager')
    this.isCts = roles.includes('cts')
    this.isSps = roles.includes('sps')
  }
}
</script>
