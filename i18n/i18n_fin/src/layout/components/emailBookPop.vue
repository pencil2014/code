<template>
	<BaseDialog  :config="dialogConfig" :callback="dialogCallback">
    <div class="email-book">
      <div class="tip">注意：仅非白名单客户的以下邮件提醒，支持配置是否推送提醒，提醒的频次。</div>
      <div class="table-class">
        <el-table
          :data="tableData"
          border
          style="width: 100%">
          <el-table-column
            prop="groupName"
            align="center"
            label="提醒类型">
          </el-table-column>
          <el-table-column
            prop="isSubscribe"
            align="center"
            label="邮件订阅">
            <template slot-scope="scope">
              <el-radio-group size="mini" v-model="scope.row.isSubscribe">
                <el-radio v-for="(item, index) in radioList" :key="index" :label="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
	</BaseDialog>
</template>
<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { getSubscribeList, unsubscribe } from '@/api/base'
export default {
	filters: {},
	data() {
		return {
			dialogConfig: {
				title: '邮件订阅',
				show: true,
				size: 'medium',
				width: '800px',
				showBtns: true
			},
      radioList: [
        { label: '提醒', value: 'Y' },
        { label: '不提醒', value: 'N' }
      ],
      tableData: []
		}
	},
	created() {
		this.getSubscribeListData()
	},
	mounted() {},
	computed: {},
	components: {
		BaseDialog
	},
	watch: {},
	methods: {
    getSubscribeListData() {
      getSubscribeList({})
      .then(res => {
        this.tableData = res.data || []
      })
    },
		close(action, value) {
			this.$emit('close', action, value)
		},
    getData() {
      return this.tableData.map(item => {
        if (item.isSubscribe === 'N') {
          return item.groupType
        }
      })
    },
		dialogCallback(action, done) {
			if (action === 'Confirm') {
        let groupTypes = this.getData()
        unsubscribe({ groupTypes })
        .then(res => {
          this.$message.success('订阅成功')
          this.close('Confirm')
        })
			} else {
				this.close('Cancel')
			}
		}
	}
}
</script>
<style lang="scss" scoped>
.email-book {
  .tip {
    color: red;
  }
  .table-class {
    margin-top: 10px;
  }
  /deep/.el-radio__label {
    font-size: 12px;
  }
}
</style>
