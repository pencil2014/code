<template>
  <el-dialog :title="option.title" :visible.sync="option.show" width="800px" class="self-dialog">
    <el-carousel
      ref="carousel"
      height="300px"
      indicator-position="none"
      arrow="never"
      :initial-index="currIndex-1"
      :loop="false"
      :autoplay="false"
      @change="change"
    >
      <el-carousel-item v-for="item in items" :key="item.key" :label="item.label">
        <el-image :src="item.url" fit="scale-down"></el-image>
      </el-carousel-item>
    </el-carousel>
    <div class="carousel-bottom">
      <span>共{{total}}张截图 第{{currIndex}}/{{total}}张</span>
      <div>
        <el-button size="mini" @click="prev" :disabled="preDisabled">上一张</el-button>
        <el-button size="mini" @click="next" :disabled="nextDisabled">下一张</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'baseDialog',
  props: {
    option: {
      type: Object,
      default: () => ({ items: [] }),
    },
  },
  computed: {
    items() {
      return this.option.items
    },
    total() {
      return this.items.length
    },
    preDisabled() {
      return this.currIndex == 1
    },
    nextDisabled() {
      return this.currIndex == this.items.length
    },
  },
  data() {
    return {
      currIndex: 1,
    }
  },
  methods: {
    change(val) {
      this.currIndex = +val + 1
    },
    next() {
      this.$refs.carousel.next()
    },
    prev() {
      this.$refs.carousel.prev()
    },
  },
}
</script>
<style lang="scss" scoped>
.self-dialog ::v-deep {
  background: #999;
  .el-carousel .el-carousel__item .el-image {
    width: 100%;
    height: 100%;
  }
  .carousel-bottom {
    position: relative;
    margin-top: 20px;
    height: 28px;
    & > span {
      line-height: 28px;
      color: #bfbfbf;
    }
    & > div {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      text-align: center;
      .el-button + .el-button {
        margin-left: 20px;
      }
    }
  }
}
</style>