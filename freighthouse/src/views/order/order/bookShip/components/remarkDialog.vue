<template>
  <el-dialog @close="remarkClose" class="audit-detail-dlg" :title="title" :visible="true" width="50%">
    <el-input v-if="showWordLimit" type="textarea" clearable rows="10" size="mini" placeholder="请输入" maxlength="512" show-word-limit v-model="remarkVal" :disabled="isDisabled"></el-input>
    <el-input v-else type="textarea" clearable rows="10" size="mini" placeholder="请输入" v-model="remarkVal" :disabled="isDisabled"></el-input>
    <span slot="footer" class="dialog-footer">
      <el-button size="mini" type="primary" @click="remarkClose">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  data() {
    return {
      remarkVal: this.remark,
    }
  },
  props: {
    showWordLimit: {
      type: Boolean,
      default: false
    },
    isDisabled: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: ''
    },
    remark: {
      type: String,
      default: ''
    }
  },
  activated() {},
  created() {},
  mounted() {},
  computed: {},
  components: {},
  watch: {},
  methods: {
    remarkClose() {
      this.$emit('close', this.remarkVal)
    }
  }
}
</script>
<style lang="scss" scoped></style>
