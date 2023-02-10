<template>
  <el-dialog title="订单拒绝" :visible.sync="option.show" width="600px" :before-close="cancel">
    <div>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px" inline size="mini" class="accept-form">
        <!-- <el-form-item label="订单是否受理" prop="acceptOrder">
          <el-select v-model="form.acceptOrder" placeholder="请选择">
            <el-option label="是" value="yes"></el-option>
            <el-option label="否" value="no"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="拒绝原因" prop="auditRefuseReason">
          <el-input
            type="textarea"
            v-model="form.auditRefuseReason"
            maxlength="255"
            show-word-limit
            :autosize="{ minRows: 2, maxRows: 4 }"
            resize="none"
          ></el-input>
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
import { orderAccept, orderRefuse } from '@/api/swcms/index'
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
        // acceptOrder: 'yes',
        auditRefuseReason: '',
      },
      rules: {
        // acceptOrder: { required: true, message: ' ', trigger: 'change' },
        auditRefuseReason: { required: true, message: ' ', trigger: 'change' },
      }
    }
  },
  methods: {
    cancel() {
      this.$parent.acceptOption.show = false
    },
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          let { memOrderNo } = this.option.data
          let { auditRefuseReason } = this.form
          let data = {
            memOrderNo,
            auditRefuseReason
          }
          // let isAccept = this.form.acceptOrder === 'yes'
          // let api = isAccept ? orderAccept : orderRefuse
          let api = orderRefuse
          api(data)
            .then((res) => {
              if (res.code === 0) {
                this.cancel()
                this.$parent.getOrderInfo()
                let text = '订单拒绝成功'
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
