<template>
  <div class="cust-name-class">
    <img v-if="isWhiteCust" :src="require(`@/views/order/order/images/white-new.png`)" class="img-class" />
    <el-tooltip class="item" effect="dark" :content="name" placement="top">
      <div class="blue" :class="{'name':  isWhiteCust}" @click.stop="handleViewCust">{{ name }}</div>
    </el-tooltip>
  </div>
</template>

<script>
export default {
  props: ['param', 'item'],
  created() {},
  computed: {
    isWhiteCust() {
      return ['Y', 'y'].includes(this.param.isWhiteCust)
    },
    name() {
      if (this.item.prop) {
        return this.param[this.item.prop] || ''
      } else {
        return ''
      }
    },
  },
  methods: {
    handleViewCust() {
			this.item.method(this.param)
		},
  }
}
</script>

<style lang="scss" scoped>
.cust-name-class {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  .img-class {
    width: 20px;
    height: 20px;
  }
  .name {
    margin-left: 3px;
    width: calc(100% - 25px);
  }
  .blue{
    // height: 20px;
    // font-size: 12px;
    // padding: 0;
    cursor: pointer;
    color: #1890ff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>