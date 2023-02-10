<template>
  <div class="cust-name-class">
    <img v-if="isWhiteCust" :src="require(`@/views/order/order/images/white-new.png`)" class="img-class" />
    <div :class="{'name':  isWhiteCust}">{{ name }}</div>
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
}
</style>