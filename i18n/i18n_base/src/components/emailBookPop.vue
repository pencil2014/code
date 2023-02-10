<template>
  <el-dialog :title="$t('emailBook.title')" width="800px" :visible.sync="option.show"
      :close-on-click-modal="false">
    <div class="email-book">
      <div class="tip">
        {{$t('emailBook.note')}}
      </div>
      <div class="table-class">
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="groupName" align="center" :label="$t('emailBook.type')">
          </el-table-column>
          <el-table-column prop="isSubscribe" align="center" :label="$t('emailBook.subscrip')">
            <template slot-scope="scope">
              <el-radio-group size="mini" v-model="scope.row.isSubscribe">
                <el-radio
                  v-for="(item, index) in radioList"
                  :key="index"
                  :label="item.value"
                  >{{ item.label }}</el-radio
                >
              </el-radio-group>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div slot="footer">
      <el-button type="primary" @click="submit" size="mini">{{$t('emailBook.submit')}}</el-button>
      <el-button @click="cancel" size="mini">{{$t('emailBook.cancel')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { getSubscribeList, unsubscribe } from '@/api/index'
export default {
  props: {
    option: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      radioList: [
        { label: this.$t('emailBook.remind'), value: 'Y' },
        { label: this.$t('emailBook.noRemind'), value: 'N' }
      ],
      tableData: []
    }
  },
  created() {
    this.getSubscribeListData()
  },
  methods: {
    getSubscribeListData() {
      getSubscribeList({}).then((res) => {
        this.tableData = res.data || []
      })
    },
    getData() {
      return this.tableData.map((item) => {
        if (item.isSubscribe === 'N') {
          return item.groupType
        }
      })
    },
    cancel() {
      this.$emit('cancel')
    },
    submit() {
      let groupTypes = this.getData()
      unsubscribe({ groupTypes }).then((res) => {
        this.$message.success(this.$t('emailBook.success'))
        this.cancel()
      })
    }
  }
}
</script>
<style lang="scss" scoped>
:deep(.el-dialog__body) {
  padding: 20px;
}
.email-book {
  .tip {
    color: red;
  }
  .table-class {
    margin-top: 10px;
  }
  :deep(.el-radio__label) {
    font-size: 12px;
  }
}
</style>
