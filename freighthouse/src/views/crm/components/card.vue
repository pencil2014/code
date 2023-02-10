// TODO 已用
<template>
  <div class="card-content">
    <div class="card-title">
      <span>{{ title }}</span>
      <el-button
        v-if="btnInfo"
        :disabled="btnInfo.disabled"
        @click="$emit(btnInfo.event)"
        size="mini"
      >{{ btnInfo.text }}</el-button>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    btnInfo: {
      type: Object,
      default: () => {},
    },
    title: {
      type: String,
      default: '',
    },
  },
  methods: {},
}
</script>

<style lang="scss" scoped>
$horizon: 8px;
$vertical: 8px;
.card-content {
  position: relative;
  margin: 0 $horizon;
  border: 1px solid #e9e9e9;
  border-radius: 4px;
  .card-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 $horizon;
    line-height: 24px;
    font-size: 13px;
    font-weight: bold;
    background: #f8f9fd;
    color: #222;
  }
  .card-body {
    padding: $vertical $horizon;
  }
}
</style>