<template>
  <el-dialog :title="option.title" :visible.sync="option.show" width="60%" v-loading="loading">
    <div class="preview-box">
      <el-carousel
        arrow="always"
        :autoplay="false"
        indicator-position="none"
        height="500px"
        :arrow="option.src.length > 1 ? 'always' : 'never'"
      >
        <el-carousel-item v-for="(item, index) in option.src" :key="index">
          <iframe class="iframe" width="100%" heigth="100%" v-if="item.endsWith('/pdf')" :src="item" frameborder="0" @load="loadImage"></iframe>
          <img v-else :src="item" class="img"  @load="loadImage" @error="loadImageErr" />
        </el-carousel-item>
      </el-carousel>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    option: {
      type: Object,
      default: () => {
        return {
          title: '图片预览',
          src: []
        }
      },
    },
  },
  data() {
    return {
      loading: true,
      total: 0
    }
  },
  created () {
    if (!this.option?.src?.length) {
      this.loading = false
    }
  },
  methods: {
    loadImage () {
      this.total += 1
      if (this.total === this.option.src.length) {
        this.loading = false
      }
    },
    loadImageErr() {
      this.loading = false
      this.$msgErrClose('图片加载失败!')
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/.el-dialog__body {
  padding: 16px;
}
.preview-box {
  min-height: 200px;
  text-align: center;
  .el-carousel__item{
    overflow: auto;
  }
  .img {
    max-width: 100%;
    height: auto;
  }
}
.iframe{
  height: 96%;
}
</style>
