<template>
  <div
    class="detail__div"
    :class="[isFull&&'detail__div__full',isFull&&!isTooltip&&'detail__autoheight', diyClass, isVisible&&'is-visible', isBold&&'is__bold']"
    :style="{width:width+'px',color,...diyStyle}"
  >
    <span class="detail__label" :style="{width:labelWidth+'px'}">{{label}}</span>
    <slot />
    <span v-if="!isTooltip && !isSlot" class="detail__content" v-html="content"></span>
    <el-tooltip v-else-if="content && !isSlot" :content="content" placement="top-start">
      <span class="detail__content">{{content}}</span>
    </el-tooltip>
    <slot name="afterIcon" />
  </div>
</template>

<script>
export default {
  name: 'detailDiv',
  props: {
    label: { type: String, default: '' },
    content: '',
    width: { type: String, default: '262' },
    labelWidth: { type: String, default: '100' },
    // isTooltip: { type: Boolean, default: false },
    // isSlot: { type: Boolean, default: false },
    // isFull: { type: Boolean, default: false },
    color: { type: String, default: '' },
    diyStyle: { type: Object, default: () => ({}) },
  },
  data() {
    return {}
  },
  computed: {
    diyClass() {
      return this.$attrs.diyClass
    },
    isVisible() {
      return this.$attrs.isVisible !== undefined
    },
    isFull() {
      return this.$attrs.isFull !== undefined
    },
    isTooltip() {
      return this.$attrs.isTooltip !== undefined
    },
    isSlot() {
      return this.$attrs.isSlot !== undefined
    },
    isBold() {
      return this.$attrs.isBold !== undefined
    },
  },
  methods: {},
  created() {
    // console.log(this.$attrs)
  },
}
</script>

<style scoped lang="scss">
.detail__div,
.detail__label,
.detail__content {
  display: inline-block;
  line-height: 20px;
  height: 20px;
}
.detail__div {
  display: inline-flex;
  margin-right: 16px;
  margin-bottom: 6px;
  position: relative;
  // align-items: center;
  &.detail__div__full {
    width: 100% !important;
    height: auto;
    &.detail__autoheight {
      .detail__label,
      .detail__content {
        height: auto;
        white-space: pre-wrap;
      }
    }
  }
  &.is-visible {
    overflow: visible !important;
    white-space: nowrap;
  }
  &.is__bold {
    .detail__label{
      font-weight: bold;
      color: #002898;
    }
  }
  & > div ::v-deep span.link {
    color: #1890ff;
    padding: 0 2px;
    cursor: pointer;
  }
}
.detail__label {
  flex: 0 0 auto;
  text-align: right;
  padding-right: 4px;
}
.detail__content {
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
  ::v-deep {
    .el-tag__close {
      position: absolute;
      top: 3px;
      right: 0px;
    }
    & > b {
      padding-left: 4px;
      font-weight: normal;
      color: red;
    }
  }
}
::v-deep {
  .el-tag {
    display: inline-block;
    background-color: #fff;
    border-color: #fff;
    cursor: pointer;
    height: 20px;
    line-height: 20px;
    padding-left: 0 !important;
  }
  button {
    padding-left: 0 !important;
  }
}
</style>
