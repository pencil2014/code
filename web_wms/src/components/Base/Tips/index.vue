<template>
  <div class="tips-abs">
    <div :class="['tips-container', tips.class]" v-if="tips.show === false ? false : true">
      <i class="icon-tips"></i>
      {{tips.text || placeholder}}
      <span style="margin-left: 20px" v-if="tips.totalTxt">{{tips.totalTxt+'T' || ''}}</span>
      <div class="clear-tips" @click="handleClear">清空</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Tips',
  data() {
    return { 
      placeholder: '默认提示内容'
    }
  },
  props: {
    tips: {
      type: Object,
      default: () => ({
        show: true,
        text: '',
        totalTxt: ''
      })
    },
    callback: {
      type: Function,
      default: () => ({})
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
  }
}
</script>

<style lang="scss">
@import '../less/tips.scss';
</style>
