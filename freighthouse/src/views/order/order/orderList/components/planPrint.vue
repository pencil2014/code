<template>
  <div class="print">
    <div class="print-tools">
      <!-- <div class="print-btn" @click="handlePrint">打印</div> -->
      <el-button type="primary" size="small" @click="handlePrint">打印</el-button>
    </div>
    <iframe id="inlineFrameExample" title="Inline Frame Example" width="100%" height="100%" :src="fileUrl">
    </iframe>
  </div>
</template>

<script>
export default {
  data() {
    return {
      fileUrL: ''
    }
  },
  created() {
    let { fileNo, fileName } = this.$route.query
    if (!fileNo || !fileName) return
    // let nameArr = fileName.split('.')
    // let name = nameArr[nameArr.length - 1]
    // name = name.toLowerCase()
    this.fileUrl = `${window.location.origin}/base/fileView/preview/${fileNo}/${fileName}#toolbar=0`
  },
  methods: {
    // 打印
    handlePrint(value) {
      var ordonnance = document.getElementById("inlineFrameExample").contentWindow
      ordonnance.print()
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
  height: 50px;
  background: #363636;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 30px;
  // .print-btn {
  //   color: #eee;
  //   font-size: 14px;
  //   font-weight: 800;
  //   height: 40px;
  //   width: 40px;
  //   border-radius: 20px;
  //   line-height: 40px;
  //   text-align: center;
  //   cursor: pointer;
  // }
  // .print-btn:hover {
  //   background: #666;
  // }
}
</style>