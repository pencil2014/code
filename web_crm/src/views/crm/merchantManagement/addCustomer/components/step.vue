<template>
  <div class="step" style="padding: 20px 80px 0;">
    <el-steps :active="setComplete" simple>
      <el-step :title="!isCustomer?'供应商搜索':'客户搜索'"></el-step>
      <el-step title="基本信息"></el-step>
      <el-step title="联系人/银行信息"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
  </div>
</template>

<script>
export default {
  name: 'stepTitle',
  data() {
    return {}
  },
  inject: ['isCustomer'],
  props: {
    setComplete: {
      type: Number,
      default: 0,
    },
  },
}
</script>

<style lang="scss" scoped>
.step ::v-deep {
  margin-bottom: 20px;
  //覆盖elmentUI step组件样式
  .el-steps--simple {
    background: transparent;
    padding: 0;
  }
  .el-step__title,
  .el-step__head {
    border-color: #222;
    color: #222;
    font-size: 16px;
    font-weight: 600;
    white-space: nowrap;
    max-width: 100% !important;
    padding-right: 5px;
  }
  .is-finish,
  .is-process {
    color: #3e80f5;
    &.el-step__head {
      border-color: #3e80f5;
    }
  }
  .is-process.el-step__head .el-step__icon {
    color: white;
    background: #3e80f5;
    &::after {
      position: absolute;
      display: inline-block;
      content: '';
      left: -4px;
      top: -4px;
      width: 22px;
      height: 22px;
      border: 3px solid #e3edfe;
      border-radius: 50%;
    }
  }
  .el-step__icon {
    width: 18px;
    height: 18px;
    vertical-align: middle;
  }
  @for $i from 1 through 4 {
    .el-step:nth-of-type(#{$i}) {
      .el-step__icon::before {
        font-size: 12px;
        font-weight: bold;
        content: $i + '';
      }
    }
  }
  .el-step__arrow {
    margin: 9px 18px;
    line-height: 0;
    height: 0;
    border-top: 2px dashed #bfbfbf;
    &::before,
    &::after {
      display: none;
    }
  }
  .is-finish + .el-step__arrow {
    border-top: 2px solid #3e80f5;
  }
}
</style>
