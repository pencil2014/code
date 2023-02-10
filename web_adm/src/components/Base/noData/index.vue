<template>
  <div class="no-data" :class="['no-data--'+size]">
    <img src="./no-data.png" alt />
    <p>{{text}}</p>
  </div>
</template>

<script>
export default {
  name: 'noData',
  props: {
    size: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '暂无数据',
    },
  },
  data() {
    return {}
  },
}
</script>

<style lang="scss" scoped>
.no-data {
  padding-top: 40px;
  text-align: center;
  &.no-data--mini {
    padding-top: 0;
    img {
      height: 98px;
      width: 98px;
    }
    p {
      padding-top: 0;
      font-size: 12px;
    }
  }
  img {
    height: 196px;
    width: 196px;
  }
  p {
    padding-top: 10px;
    font-size: 14px;
    color: #bfbfbf;
  }
}
</style>
