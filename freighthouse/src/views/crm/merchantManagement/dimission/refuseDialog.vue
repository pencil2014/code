<template>
  <el-dialog title="拒绝" :visible.sync="refuseOption.show" append-to-body width="440px" class="recycle-form">
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="拒绝备注：">
      <el-input type="textarea" rows="3" v-model="form.refuseReason" placeholder="请输入" maxlength="30" show-word-limit></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
			<el-button type="primary"  @click="submit" size="mini">确认</el-button>
			<el-button size="mini" @click="cancle">取消</el-button>
		</div>
  </el-dialog>
</template>
<script>
export default {
  props: {
    refuseOption: {
      type: Object,
      default: () => ({}),
    },
    custid: {
      type: [Number, Array],
      default: 'auto'
    },
    oid: {
      type: [Number, Array],
      default: 'auto'
    },
  },
  data() {
    return {
      form: {
        refuseReason: '',
        oid:this.oid,
        custid:this.custid
      }
    }
  },
  methods: {
    submit () {
      this.$emit('submit', this.form)
    },
    cancle(){
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.recycle-form ::v-deep{
  .el-textarea__inner{
    font-size: 12px;
  }
  .dialog-footer .el-button {
    padding: 0 10px;
    height: 20px;
  }
}
</style>
