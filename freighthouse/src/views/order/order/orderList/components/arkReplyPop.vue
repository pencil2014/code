<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <div>以下SO，当前还未做柜，请在 {{ replyTime }} 前更新做柜进展，逾期未回复，商务将会默认这个仓位是可以回收，请注意。</div>
    <div class="table-class">
      <el-table
        :data="soData"
        border
        style="width: 100%">
        <el-table-column
          prop="containerType"
          label="箱型">
        </el-table-column>
        <el-table-column
          prop="so"
          label="SO号">
        </el-table-column>
        <el-table-column
          prop="hasCn"
          label="是否做柜">
          <template slot-scope="scope">
            <el-radio-group v-model="scope.row.hasCn" size="mini">
              <el-radio :label="'y'">是</el-radio>
              <el-radio :label="'n'">否</el-radio>
            </el-radio-group>
          </template>
        </el-table-column>
        <el-table-column
          prop="takePreTime"
          label="预计提柜时间">
          <template slot-scope="scope">
            <el-date-picker
              align="right"
              placeholder="选择日期"
              size="mini"
              type="date"
              v-model="scope.row.takePreTime"
              value-format="yyyy-MM-dd"
            ></el-date-picker>
          </template>
        </el-table-column>
        <el-table-column
          prop="cn"
          label="柜号">
          <template slot-scope="scope">
            <el-input v-model="scope.row.cn" placeholder="" @blur="blurCb(scope.row, 'cn', scope.$index)" size="mini"></el-input>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="cnRemark">
      <span>
        <span class="red">*</span> 未及时做柜原因
      </span>
      <el-input style="margin-top: 5px;" type="textarea" v-model="cnRemark" maxlength="512" show-word-limit size="mini" placeholder="请输入未及时做柜原因"></el-input>
    </div>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { soReplyTo } from '@/api/order/book/list'
export default {
  components: {
    BaseDialog
  },
  props: {
    soList: {
      type: Array,
      default: () => {
        return []
      }
    },
    replyTime: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      dialogConfig: {
				title: '做柜回复',
				show: true,
				width: '800px'
			},
      cnRemark: '',
      soData: [],
    }
  },
  created() {
     this.soData = this.soList.map(item => {
      item['hasCn'] = ''
      item['takePreTime'] = ''
      return item
     })
  },
  methods: {
    blurCb(row, type, index) {
      if (type === 'cn' && row[type]) {
        if (row[type].length !== 11) {
          row[type] = ''
				  return this.$message.error('柜号的长度为11位')
        }
				if (this.soData.some((item, idx) => index !== idx && item[type] === row[type] )) {
          row[type] = ''
				  return this.$message.error('柜号不能重复')
        }
			}
    },
    validCheck() {
      let check = true
      if (this.soData.some(item => !item.hasCn)) {
        this.$message.error('请选择是否做柜')
        check = false
      } else if (this.soData.some(item => item.cn && item.cn.length !== 11)) {
        this.$message.error('柜号长度必须是11位')
        check = false
      } else if (!this.cnRemark) {
        this.$message.error('请填写未及时做柜原因')
        check = false
      }
      return check
    },
    dialogCallback(action, done) {
			if (action === 'Confirm') {
        if (!this.validCheck()) return
        soReplyTo({
          cnRemark: this.cnRemark,
          replyList: this.soData
        })
        .then(() => {
          this.close('Confirm')
          this.$message.success('做柜回复成功')
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
.table-class {
  margin-top: 10px;
}
.cnRemark {
  margin-top: 10px;
}
</style>