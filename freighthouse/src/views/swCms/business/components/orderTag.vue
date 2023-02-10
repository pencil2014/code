<template>
  <el-dialog title="广告位顺序调整" :visible.sync="option.show" width="600px" :before-close="cancel">
    <div>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px" inline size="mini" class="accept-form">
        <el-form-item label="顺序" prop="orderTag">
            <el-input v-model="form.orderTag" onkeyup="if(this.value.length==1){this.value=this.value.replace(/[^1-9]/g,'')}else{this.value=this.value.replace(/\D/g,'')}" onafterpaste="if(this.value.length==1){this.value=this.value.replace(/[^1-9]/g,'')}else{this.value=this.value.replace(/\D/g,'')}"/></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer">
      <el-button @click="cancel" size="mini">取 消</el-button>
      <el-button type="primary" @click="submit" size="mini">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { adSortChange } from '@/api/swcms/index'
export default {
  props: {
    option: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      form: {
        acceptOrder: 'yes',
        auditRefuseReason: '',
      },
      rules: {
        orderTag: { required: true, message: ' ', trigger: 'change' }
      }
    }
  },
  methods: {
    cancel() {
      this.$parent.orderTagOption.show = false
    },
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          let { adId } = this.option.data
          let { orderTag } = this.form
          let data = {
            adId,
            orderTag
          }
          adSortChange(data)
            .then((res) => {
              if (res.code === 0) {
                this.cancel()
                this.$parent.getData()
                let text = '广告位顺序调整成功'
                this.$msgSucClose(text)
              }
            })
            .catch(() => {})
        } else {
          return false
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.accept-form {
  /deep/ .el-form-item {
    width: 100%;
    display: flex;
    .el-form-item__content {
      flex: 1;
      .el-select {
        width: 100%;
      }
    }
  }
}
</style>
