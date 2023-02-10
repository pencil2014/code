<template>
  <div>
    <router-view />
  </div>
</template>
<style lang="scss" scoped>
::v-deep .finance-page {
  .finance-approve-btns-box {
    display: flex;
    justify-content: space-between;
    padding: 8px;
    border-radius: 4px 4px 0px 0px;
    border-bottom: 1px solid #e9e9e9;
  }
  .finance-approve-btns-left {
    font-size: 14px;
    font-weight: 600;
    color: #222222;
    line-height: 16px;
    padding: 2px 0;
  }
  .table-title {
    padding: 14px 16px 0 16px;
    font-size: 14px;
    span {
      padding-right: 40px;
    }
  }
}
</style>