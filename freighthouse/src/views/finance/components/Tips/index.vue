<template>
  <div class="tips-abs">
    <div :class="['tips-container', tips.class]" v-if="tips.show === false ? false : true">
      <!-- <i class="icon-tips"></i> -->
      {{tips.text || placeholder}}
      <!-- <div class="clear-tips" @click="handleClear">清空</div> -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'Tips',
  props: {
    tips: {
      type: Object,
      default: () => ({
        show: true,
        text: ''
      })
    },
    callback: {
      type: Function,
      default: () => ({})
    }
  },
  data() {
    return { 
      placeholder: '默认提示内容',
      show: this.tips ? this.tips.show : false,
      text: this.tips ? this.tips.text : ''
    }
  },
  components: {
  },
  computed: {
  },
  methods: {
    handleClear() {
      this.callback()
    }
  },
  watch: {
    'tips.show'(val) {
      this.show = val
    },
    'tips.text'(val) {
      this.text = val
    }
  }
}
</script>

<style scoped lang="scss">
.tips-abs{
  position: absolute;
  // left: 50%;
  // top: -65px;
  // margin-left: -172px;
  left: 0;
  top: 15px;
  z-index: 1000;
  margin-left: 0;
  .tips-container{
    display: flex;
    position: relative;
    // width:344px;
    width: 200px;
    // height:32px;
    height: 14px;
    // background:rgba(255,255,255,1);
    background: none;
    // box-shadow: 1px 4px 10px 0px rgba(233,233,233,1);
    box-shadow: none;
    border-radius:4px;
    color: #4a4a4a;
    font-size: 12px;
    line-height: 14px;
    // padding: 9px 16px;
    padding: 0 8px;
    &::before {
      content: none; // 改成不显示, ''
      background: #fff;
      display: block;
      position: absolute;
      left: 50%;
      bottom: -4px;
      box-shadow:1 10px 10px 10px 0 rgba(233,233,233,1);
      // border-radius:4px;
      width: 10px;
      height: 10px;
      border-width: 5px 5px 0 0;
      border-color: transparent;
      border-style: solid;
      transform: matrix(0.71,-0.71,0.71,0.71,0,0); // rotate(-45deg)
    }
    &.error{
      color: #f56c6c;
    }
  }
}
.icon-tips{
    display: block;
    width: 14px;
    height: 14px;
    // background:rgba(24,144,255,1);
    text-align: center;
    background: url(../../../../assets/icon_tips.png) center center no-repeat; 
    margin-right: 10px;
    margin: 0 10px 0 0;
}
.clear-tips{
    height: 14px;
    line-height: 14px;
    color: #3E80F5;
    font-size: 12px;
    margin-left: auto;
    cursor: pointer;
}
</style>
