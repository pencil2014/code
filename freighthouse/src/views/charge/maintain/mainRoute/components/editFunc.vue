<template>
  <div class="edit-func-cont">
    <div class="edit-footer-info">
      <span v-if="!isAdd">
        <span>创建人：{{createItem.createdName}}  {{createItem.createdTime}}</span>
          &nbsp;&nbsp;
        <span v-show="createItem.publishTime">发布日期：{{createItem.publishTime}}</span>
      </span>
    </div>
    <div class="operation-btns-box">
      <el-checkbox v-model="blankSailing"  @change="handleChangeBlankSailing">是否停航</el-checkbox>
      <el-checkbox v-model="recommendLevel" @change="handleChangeRecommendLevel">运价推荐</el-checkbox>
      <span class="row-tit-label" v-if="!isAdd">运价状态: <em>{{publishStatusOptions[createItem.state]}}</em></span>
      <el-button 
        size="mini" 
        ref="btnSave" 
        @click="handleSave" 
        type="primary" 
        :disabled="submitDisabled">
        保存
      </el-button>
      <el-button 
        size="mini" 
        ref="btnPublish" 
        @click="handlePublish" 
        type="success " 
        :disabled="submitDisabled">
        发布
      </el-button>
      <el-button 
        size="mini" 
        ref="btnInvalid" 
        @click="handleInvalid" 
        type="warning" 
        :disabled="submitDisabled"
        v-if="createItem.state === 'published' && !isCopy" >
        失效
      </el-button>
      <el-button 
        size="mini" 
        ref="btnCancel" 
        @click="handleCancel" 
        plain 
        :disabled="submitDisabled">
        取消
      </el-button>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      recommendLevel: false,
      submitDisabled: false,
      blankSailing: false
    }
  },
  props: {
    saveDisabled: {
      type: Boolean,
      default: false
    },
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
    isAdd() {
      // 复制或新建
      let {id, action} = this.$route.query
      return (action === 'copy' && id) || !id
    },
    isCopy() {
      return this.$route.query.action === 'copy'
    }
  },
  watch: {
    saveDisabled(newVal, oldVal) {
      this.submitDisabled = newVal
    },
    createItem: {
      handler(newVal) {
        this.recommendLevel = newVal.recommendLevel == 'Y' ? true : false
        this.blankSailing = newVal.blankSailing == 'Y' ? true : false
      },
      deep: true
    }
  },
  components: {
  },
  methods: {
    // 切换推荐选中状态
    handleChangeRecommendLevel(val) {
      this.createItem.recommendLevel = val ? 'Y' : 'N'
    },
    handleChangeBlankSailing(val) {
      this.createItem.blankSailing = val ? 'Y' : 'N'
    },
    handleInvalid() {
      this.$emit("callback", 'Invalid')
    },
    handlePublish() {
      this.$emit("callback", 'Publish')
    },
    handleSave() {
      this.$emit("callback", 'Save')
    },
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
