<template>
  <div class="permission">
    <router-view />
  </div>
</template>
<style lang="scss" scoped>
.permission ::v-deep .el-table__row .el-tooltip {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
