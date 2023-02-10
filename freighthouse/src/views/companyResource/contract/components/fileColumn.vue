<template>
  <el-tooltip	placement="top" popper-class="file-name-pop" :visible-arrow="false">
    <div class="copy-label" slot="content">
      <div v-for="item in param.fileList" :key="item.fileNo" class="file-name-list">
        <el-button class="underline name-label" type="text" size="mini" @click="handleView(item)">{{item.name}}</el-button>
        <el-button class="underline" type="text" size="mini" @click="handleDownload(item)">下载</el-button>
      </div>
    </div>
    <span class="file-row-table-header-container">
      <span size="mini" @click.stop="toDetail">{{ param.fileNameStr }}</span>
    </span>
  </el-tooltip>
</template>

<script>
export default {
  data() {
    return {
      copyShow: false,
    }
  },
  props: ['param', 'item'],
  created() {
  },

  mounted() {},
  computed: {},
  watch: {
  },
  components: {},
  methods: {
    handleDownload(row) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: row.fileNo
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = row.name
					link.click()
				})
		},
		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.name })
		},
  }
}
</script>

<style lang="scss" scoped>
.file-row-table-header-container {
  white-space: nowrap;
  display: flex;
  justify-content: flex-start;
  position: relative;
  // padding-right: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.el-tag--mini {
  font-size: 10px;
  height: 16px;
  padding: 0 4px;
  line-height: 16px;
  cursor: pointer;
}
</style>
<style lang="scss">
  .file-name-pop.is-dark{
    font-size: 12px;
    text-align: center;
    cursor: pointer;
    background: #ecf5ff;
    color: #409eff;
    border: 1px solid #d9ecff;
    padding: 2px 5px;
    margin-left: 5px;
    // .copy-label{
    //   line-height: 6px;
    // }
    .file-name-list{
      display: flex;
      justify-content: space-between;
      .name-label{
        padding: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
</style>
