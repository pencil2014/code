<template>
  <div>
    <el-alert type="warning" :closable="false" class="violet">
      <template slot="title">
        <!-- <i class="tag-recall">撤</i> -->
        <span class="txt"> {{overseasTipMsg}}</span>
        <el-popover placement="top" width="160" v-model="item.visible" v-for="(item, index) in auditPop" :key="index">
          <p>是否{{ item.label }}审批？</p>
          <div style="text-align: right; margin: 0">
            <el-button size="mini" type="text" @click="item.visible = false">放弃</el-button>
            <el-button type="primary" size="mini" @click="handleOverseasAudit(item)">{{ item.label }}</el-button>
          </div>
          <span :class="item.label === '通过' ? 'btn-yes' : 'btn-no'" slot="reference">{{ item.label }}</span>
        </el-popover>
      </template>
    </el-alert>
    <div v-if="refusePopShow">
      <RefuseDialog @close="refusePopClose" />
    </div>
  </div>

</template>
<script>
import { getDictLabel } from '@/utils/tools'
import { overseasAudit } from '@/api/order/list'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import RefuseDialog from './refuseDialog'
export default {
  mixins: [routerMixin],
  filters: {
    cancelReasonFilter(cancelReason) {
      return getDictLabel('jointCancelReason', cancelReason)
    }
  },
  data() {
    return {
      refusePopShow: false,
      oQuery: this.$route.query,
      auditPop: [
        { label: '通过', visible: false, value: 'pass' },
        { label: '拒绝', visible: false, value: 'refuse' }
      ],
      overseasName: '海外分公司做海外服务'
    }
  },
  props: {
    serviceInfo: {
      type: Object,
      default: () => ({})
    },
    //传入服务项数组
    serviceList: {
      type: Array,
      default: () => []
    },
    overseasTipMsg: {
      type: String,
      default: ''
    }
  },
  created() {},
  mounted() {},
  computed: {},
  components: { RefuseDialog },
  watch: {},
  methods: {
    refusePopClose(action, value) {
      if (action === 'Confirm') {
        let data = {
          orderNo: this.$route.query.orderNo,
          auditStatus: 'refuse',
          remark: value
        }
        if (this.$route.query.jointNo) {
          data.jointNo = this.$route.query.jointNo
        }
        overseasAudit(data).then((res) => {
          this.$message({
            type: 'success',
            message: `审核拒绝成功`,
            duration: 1000,
            onClose: () => {
              this.$emit('updateOverseas')
              this.refusePopShow = false
              this.$emit('getInfo')
            }
          })
        })
      } else {
        this.refusePopShow = false
      }
    },
    // 协同单撤回申请审核
    handleOverseasAudit(item) {
      if (item.value === 'refuse') {
        this.refusePopShow = true
      } else {
        let data = {
          orderNo: this.$route.query.orderNo,
          auditStatus: item.value
        }
        if (this.$route.query.jointNo) {
          data.jointNo = this.$route.query.jointNo
        }
        overseasAudit(data).then((res) => {
          this.$message({
            type: 'success',
            message: `审核${item.label}成功`,
            duration: 1000,
            onClose: () => {
              this.$emit('updateOverseas')
              this.$emit('getInfo')
            }
          })
        })
      }
    }
  }
}
</script>
<style lang="scss"></style>
