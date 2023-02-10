<template>
  <div class="finance-page">
    <template v-if="isSps">
      <SupplierList />
    </template>
    <template v-else>
      <MySupplier />
    </template>
  </div>
</template>

<script>
import MySupplier from '@/views/crm/merchantManagement/supplierList/index'
import SupplierList from '@/views/crm/merchantManagement/supplierList/supplier'
export default {
  components: {
    MySupplier,
    SupplierList
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
