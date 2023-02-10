<template>
  <div class="print" v-loading="loading">
    <div class="print-tools">
      <div class="w1000">
        <div class="set-options">
          <div class="item">
            <span class="fl label">M单类型:</span>
            <div class="fl ml10">
              <el-radio v-model="query.hblType" :label="item.label" v-for="item in hblTypeOptions" :key="item.label" :disabled="hblTypeDisabled" @change="handleChangeHblType">{{ item.txt }}</el-radio>
            </div>
          </div>
        </div>
        <div class="operate-btn">
          <!-- <el-button type="primary" size="mini" @click="handleConfirm">确定</el-button> -->
          <el-button type="default" size="mini" @click="close">取消</el-button>
        </div>
      </div>
    </div>
    <iframe id="inlineFrameExample" title="Inline Frame Example" width="100%" height="100%" :src="fileUrl"></iframe>
  </div>
</template>

<script>
import { blFileReview } from '@/api/order/bl'
export default {
  data() {
    return {
      loading: false,
      fileUrl: '',
      hblTypeDisabled: false,
      query: {
        orderNo: '',
        blId: '',
        fileType: '',
        hblType: 'SHIP',
        docType: ''
      },
      hblTypeOptions: [
				{ label: 'BARGE', txt: '驳船' },
				{ label: 'SHIP', txt: '大船' },
				{ label: 'BARGE_SHIP', txt: '驳船+大船' }
			],
    }
  },
  created() {
    let { orderNo, blId, fileType, docType, hblType, hblTypeDisabled } = this.$route.query
    this.query = {
      orderNo,
      blId,
      fileType,
      hblType: 'SHIP',
      docType
    }
    this.hblTypeDisabled = hblTypeDisabled ? true : false
    this.getPreviewData()
  },
  methods: {
    getPreviewData() {
      this.loading = true
      blFileReview(this.query).then(res => {
        this.loading = false
        let { fileNo, name } = res.data
        this.fileUrl = this.getFileUrl({fileNo, fileName: name})
        console.log('this.fileUrl', this.fileUrl)
      }).finally(() => {
        this.loading = false
      })
    },
    getFileUrl(params) {
      let { fileNo, fileName } = params
      if (!fileNo || !fileName) return
      let nameArr = fileName.split('.')
      let name = nameArr[nameArr.length - 1]
      name = name.toLowerCase()
      let href = `${window.location.origin}/base/fileView/preview/${fileNo}/${fileNo}.${name}#toolbar=0&officePreviewType=pdf`
      return href
    },
    handleChangeHblType() {
			this.getPreviewData()
		},
    close() {
      window.close()
    }
  }
}
</script>

<style lang="scss" scoped>
.print {
  height: 100vh;
  display: flex;
  flex-direction: column;
  #inlineFrameExample {
    flex: 1;
    border-width: 0;
  }
}
.print-tools {
  background: #f7f7f7;
  border-bottom: 1px solid #ddd;
  padding: 10px 20px;
  .w1000 {
    width: 1000px;
    margin: 0 auto;
    font-size: 12px;
    line-height: 28px;
    text-align: center;
    overflow: hidden;
    .set-options{
      float: left;
      line-height: 28px;
      ::v-deep .el-radio__label{
        font-size: 12px;
      }
    }
    .operate-btn{
      text-align: right;
      float: right;
    }
    .fl{
      float: left;
    }
  }
  // .print-btn:hover {
  //   background: #666;
  // }
}
</style>