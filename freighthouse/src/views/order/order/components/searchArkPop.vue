<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
     <div class="so-str">so号 {{ selectSoStr }} 将推送操作人员去确认是否做柜，请输入期望回复时间。</div>
     <el-form ref="form" :model="form" label-width="100px" :rules="rules">
      <el-form-item label="期望回复时间：" required prop="replyTime" :show-message="false">
        <el-date-picker
          align="right"
          placeholder="选择日期"
          size="mini"
          type="date"
          v-model="form.replyTime"
          value-format="yyyy-MM-dd"
        ></el-date-picker>
      </el-form-item>
     </el-form>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { doSoQueryCn } from '@/api/order/book/list'
export default {
  components: {
    BaseDialog
  },
  props: {
    arkSoList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      dialogConfig: {
				title: '查做柜',
				show: true,
				width: '540px'
			},
      selectSoStr: '',
      form: {
        replyTime: ''
      },
      rules: {},
    }
  },
  created() {
    let list = this.arkSoList.map(item => item.so)
    this.selectSoStr = list.join('，')
  },
  methods: {
    getSoList() {
      return this.arkSoList.map(item => {
        return {
          id: item.oid,
          so: item.so,
          orderNo: item.orderNo,
          isBindOrder: item.isBindOrder,
          cnState: item.cnState,
          cnReplyState: item.cnReplyState,
          opEmployeeId: item.opEmployeeId,
          opEmployeeName: item.opEmployeeName,
          bkgStatus: item.bkgStatus,
        }
      })
    },
    dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs['form'].validate((valid) => {
					if (valid) {
            doSoQueryCn({
              replyTime: this.form.replyTime,
              soList: this.getSoList()
            })
            .then(res => {
              this.close('Confirm')
              this.$message.success('查做柜成功')
            })
					}
				})
			} else {
				this.close('Cancel')
			}
		},
    close(action, value, type) {
			this.$emit('close', action, value, type)
		},
  },
}
</script>

<style lang="scss" scoped>
.so-str {
  margin-bottom: 10px;
  line-height: 20px;
}
</style>