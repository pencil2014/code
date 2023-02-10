<template>
  <div class="dialog-form">
    <el-dialog :width="width" :title="title" :visible.sync="dialogVisible">
      <slot ref="slot-form"></slot>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    width: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    childRef: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      dialogVisible: false,
    }
  },
  methods: {
    submitForm: function () {
      console.log(this.$refs)
      this.$emit("submitForm")
    },
  },
}
</script>

<style>
</style>