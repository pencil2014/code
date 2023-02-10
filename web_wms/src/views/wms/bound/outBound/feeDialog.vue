<template>
  <div>
    <el-dialog :before-close="handleCancel" :visible.sync="options.show" class="dialog" title="出库单费用信息" :modal-append-to-body='false'
      width="1200px">
      <fee-detail ref="feeDetail" v-if="options.show" :options="feeOptions" @cancel="handleCancel" :templateData="templateData"></fee-detail>
      <div class="dialog-footer" slot="footer">
        <div>
          <el-button @click="handleSubmit" size="mini" type="primary">保存费用</el-button>
          <!-- <el-button @click="handleFinal" size="mini" type="primary">生成结算单</el-button> -->
          <el-button @click="handleImport" size="mini" type="success">选中模板导入</el-button>
          <el-button @click="handleCancel" size="mini">取消</el-button>
        </div>
      </div>
      <template-dialog v-if="templateOptions.show" :options="templateOptions" @sendData="getTemplateData"></template-dialog>
    </el-dialog>
  </div>
</template>
<script>
import feeDetail from "./feeDetail"
import templateDialog from './templateDialog.vue'
import { feeTemplateDetail } from '@/api/wms'

export default {
  props: {
    options: {
      type: Object,
      default: () => { }
    }
  },
  components: { feeDetail, templateDialog },
  data () {
    return {
      feeOptions: {
        data: {}
      },
      templateOptions: {
        show: false,
        custId: null,
        warehouseId: null
      },
      templateData: {}
    }
  },
  created () {
    if (this.options.data) {
      this.feeOptions.data = this.options.data
    }
  },

  methods: {
    /**
     * @description: 提交数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 11:28:53
     */
    handleSubmit () {
      this.$refs.feeDetail.submitFn()
    },
    /**
     * @description: 生产结算单
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-06 16:43:58
     */
    handleFinal () {
      this.$refs.feeDetail.finalFn()
    },
    /**
     * @description: 选中模板导入
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-05 16:34:56
     */
    handleImport () {
      this.templateOptions.show = true
      this.templateOptions.custId = this.feeOptions.data.custId
      this.templateOptions.warehouseId = this.feeOptions.data.wmsWarehouseId
    },
    /**
     * @description: 获取模板数据
     * @param {*} data
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-05 17:02:27
     */
    getTemplateData (data) {
      if (data[0].feeTemplateId) {
        this.getTemplateDetail(data[0].feeTemplateId)
      }
    },
    /**
     * @description: 获取费用模板详情
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-05 17:05:21
     */
    getTemplateDetail (feeTemplateId) {
      feeTemplateDetail({ feeTemplateId }).then(({ code, data }) => {
        if (code === 0) {
          this.templateData = data
        }
      })
    },
    /**
     * @description: 关闭弹框
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 17:13:44
     */
    handleCancel () {
      this.options.show = false
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/common.scss';
/deep/ .el-image {
  width: 100px;
  height: 100px;
  margin: 10px;
}
.oper-footer {
  display: flex;
  justify-content: space-between;
}
/deep/ .el-checkbox__label {
  font-size: 12px;
}
/deep/ .el-form-item {
  width: 278px;
  .el-form-item__label {
    line-height: 24px !important;
  }
  .el-form-item__content {
    font-size: 12px;
    line-height: 24px !important;
  }
}
.checkbox {
  padding-left: 10px;
  padding-bottom: 5px;
}
</style>