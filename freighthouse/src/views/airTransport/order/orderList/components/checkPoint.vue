<template>
  <div class="check-pointList" :style="{height: `${checkPointHeight}px`}">
    <div class="timeline" v-for="item in checkPointList" :key="item.jobCode">
      <div class="">{{item.content}}</div>
      <div class="time">{{item.bizTime}}</div>
      <div class="time">参与人：{{item.bizEmployeeName}}</div>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      checkPointList: [],
    }
  },
  props: {
    createItem: {
      type: Object,
      default: () => ({})
    },
    checkPointHeight: {
      type: Number,
      default: 0
    }
  },
  created() {
  },
  mounted() {

  },
  computed: {
    
  },
  watch: {
    createItem: {
      handler(newVal) {
        this.checkPointList = newVal.checkPointList
      },
      deep: true,
      immediate: true
    }
  },
  components: {
    
  },
  methods: {
    
  }
};
</script>

<style lang="scss">
.check-pointList{
  position: relative;
  padding: 0 6px 0 18px;
  height: 100%;
  // max-height: calc(100vh - 250px);
  // height: 100%;
  overflow-y: auto;
  // &::before{
  //   content: '';
  //   display: block;
  //   position: absolute;
  //   width:2px;
  //   background:rgba(62,128,245,1);
  //   left: 8px;
  //   top: 9px;
  //   bottom: 9px;
  // }
}
.timeline{
  position: relative;
  line-height: 22px;
  margin-bottom: 10px;
  &:after{
    content: '';
    display: block;
    position: absolute;
    width:6px;
    height:6px;
    background:rgba(62,128,245,1);
    border-radius:3px;
    left: -12px;
    top: 9px;
  }
  &::before{
    content: '';
    display: block;
    position: absolute;
    width:2px;
    background:rgba(62,128,245,1);
    left: -10px;
    top: 9px;
    bottom: -19px;
  }
  &:last-child{
    &::before{
      display: none;
    }
  }
  .time{
    color: #969696
  }
}
</style>
