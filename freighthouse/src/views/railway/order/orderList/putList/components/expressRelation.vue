<template>
   <BaseDialog :config="dialogConfig" :callback="dialogCallback">
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="快递单号：">
          <div class="search-class">
             <el-input size="mini" v-model="form.expressNo" placeholder="请输入"></el-input>
             <el-button :loading="btnLoading" class="btn-class" size="mini" type="primary" @click="handleSearch">搜索</el-button>
          </div>
        </el-form-item>
        <div class="msg-class" v-show="detailObj.expressCode">
          <div class="title">快递单号关联的寄单信息：</div>
          <div class="content">
            <div class="item">
              <div class="key">寄单编号：</div>
              <div class="value">{{ detailObj.expressCode }}</div>
            </div>
            <div class="item">
              <div class="key">寄单状态：</div>
              <div class="value">{{ detailObj.status | getDictLabelFilter('postStatus') }}</div>
            </div>
            <div class="item">
              <div class="key">寄单时间：</div>
              <div class="value">{{ detailObj.postTime }}</div>
            </div>
            <div class="item">
              <div class="key">寄单人：</div>
              <div class="value">{{ detailObj.postUser }}</div>
            </div>
            <div class="item">
              <div class="key">收件人：</div>
              <div class="value">{{ detailObj.recipient }}</div>
            </div>
            <div class="item">
              <div class="key">发件人：</div>
              <div class="value">{{ detailObj.sender }}</div>
            </div>
            <div class="item item-100">
              <div class="key">收件方地址：</div>
              <div class="value">{{ detailObj.receiveAddress }}</div>
            </div>
            <div class="item item-100">
              <div class="key">发件方地址：</div>
              <div class="value">{{ detailObj.sendAddress }}</div>
            </div>
            <div class="item item-100">
              <div class="key">是否推送费用：</div>
              <div class="value">{{ detailObj.isPushFee === 'y' ? '是' : detailObj.isPushFee === 'n' ? '否' : ''}}</div>
            </div>
          </div>
        </div>
      </el-form>
   </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { getExpressRelation } from '@/api/railway/bl'
export default {
  components: { BaseDialog },
  data() {
    return {
      dialogConfig: {
				title: '关联快递单',
				show: true,
				size: 'medium',
				width: '700px',
				btns: [
					{ label: '关联', action: 'Confirm', type: 'primary' },
					{ label: '取消', action: 'Cancel' }
				]
			},
      form: {
        expressNo: ''
      },
      detailObj: {},
      btnLoading: false
    }
  },
  methods: {
    handleSearch() {
      if (!this.form.expressNo) return this.$message.error('请输入快递单号')
      this.btnLoading = true
      getExpressRelation(this.form.expressNo)
      .then(res => {
        this.btnLoading = false
        this.detailObj = res.data || {}
      })
      .catch(() => {
        this.btnLoading = false
      })
    },
    close(action, value) {
			this.$emit('close', action, value)
		},
    dialogCallback(action, done) {
			if (action === 'Confirm') {
        if (!this.form.expressNo) return this.$message.error('请输入快递单号')
				if (this.detailObj.isPushFee === 'y') {
          return this.$message.warning('该快递单已推送费用给财务，不能允许再进行关联')
        } else if (this.detailObj.isOrderType !== 'y') {
          return this.$message.warning('只能关联工作号类型的寄单内容')
        } else {
          this.close('Confirm', this.detailObj)
        }
			} else {
				this.close('Cancel')
			}
		},
  }
}
</script>

<style lang="scss" scoped>
.search-class {
  display: flex;
  align-items: center;
  .btn-class {
    margin-left: 5px;
  }
}
.msg-class {
  margin-top: 10px;
  font-size: 12px;
  .title {
    margin-left: 8px;
  }
  .content {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    .item {
      width: 33%;
      line-height: 20px;
      display: flex;
      .key {
        width: 90px;
        text-align: right;
      }
      .value {
        flex: 1;
      }
    }
    .item-100 {
      width: 100%;
    }
  }
}
</style>