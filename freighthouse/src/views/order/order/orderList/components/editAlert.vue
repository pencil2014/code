<template>
  <el-alert type="warning" :closable="false" class="orange">
    <template slot="title">
      <i class="tag-change">改</i>
      <span class="txt">
        基本信息已修改，请注意。修改人：{{serviceInfo.updatedName}} 修改时间：{{serviceInfo.updatedTime}}
        修改原因：{{serviceInfo.editReason | editReasonFilter}} 修改备注：{{serviceInfo.editRemark}} 
      </span>
      <el-button type="text" class="underline" @click="handleConfirm">确定</el-button>
    </template>
  </el-alert>
</template>
<script>
import {workServiceEditConfirm} from '@/api/order/list'
import { getDictLabel } from '@/utils/tools'
export default {
  filters: {
    editReasonFilter(editReason) {
      return getDictLabel('lclCargoEditReason', editReason)
    }
  },
  data() {
    return {
    }
  },
  props: {
    serviceInfo: {
      type: Object,
      default: () => ({})
    },
  },
  created() {
  },
  mounted() {
    
  },
  computed: {
  },
  components: {
  },
  watch: {
  },
  methods: {
    handleConfirm() {
      this.$confirm('是否确认修改?', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        workServiceEditConfirm({
          orderNo: this.$route.query.orderNo,
          jointNo: this.$route.query.jointNo,
          serviceCode: this.serviceInfo.serviceCode
        }).then(res => {
          this.$message({
            type: 'success',
            message: '确认成功',
            duration: 1000,
            onClose: () => {
              this.$emit("callback")
            }
          })
        })
      }).catch(() => {
      });
    }
  }
}
</script>
<style lang="scss">
.orange .underline{
  padding: 0 20px;
}
</style>