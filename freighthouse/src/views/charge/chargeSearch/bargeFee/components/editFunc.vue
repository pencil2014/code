<template>
  <div class="edit-func-cont">
    <div class="edit-footer-info">
      <span>
        <span>创建人：{{createItem.createdName}}  {{createItem.createdTime}}</span>
          &nbsp;&nbsp;
        <span v-show="createItem.publishTime">发布日期：{{createItem.publishTime}}</span>
      </span>
    </div>
    <div class="operation-btns-box">
      <span class="row-tit-label">运价状态: <em>{{publishStatusOptions[createItem.state]}}</em></span>
      <el-button 
        size="mini" 
        ref="btnCancel" 
        @click="handleCancel" 
        plain >
        返回
      </el-button>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
    }
  },
  props: {
    createItem: {
      type: Object,
      default: () => {}
    },
    publishStatusOptions: {
      type: Object,
      default: () => {}
    }
  },
  created() {
  },
  mounted() {
  },
  computed: {
  },
  watch: {
  },
  components: {
  },
  methods: {
    handleCancel() {
      this.$emit("callback", 'Cancel')
    }
  }
};
</script>

<style lang="scss" scoped>
.edit-func-cont{
  display: flex;
  justify-content: space-between;
  background: #fff;
  margin: 16px 16px 10px;
  height: 32px;
  line-height: 20px;
  padding: 6px;
  /deep/ .el-button--mini{
    padding: 2px 5px;
  }
}
.edit-func-cont .row-tit-label {
  font-size: 12px;
  margin-right: 20px;
}
.edit-func-cont .row-tit-label em {
  color: #3E80F5;
  margin-left: 5px;
  font-style: normal;
}
.edit-func-cont .operation-btns-box .el-checkbox__label{
  line-height: 28px;
  font-size: 12px;
}
.edit-func-cont .operation-btns-box .el-checkbox{
  margin-right: 20px;
}
</style>
