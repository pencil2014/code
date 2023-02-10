<template>
  <div class="file-show-class">
    <div class="si-file-wrap"  >
      <span v-for="(item, index) in fileNameList" :key="index" class="item" :title="item" size="mini" @click="handleViewFile(item, fileNoList[index])">{{ item }}{{ index !== fileNameList.length -1 ? '，' : ''}}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: ['param', 'item'],
  data() {
    return {
      keyVal: '',
      fileNameList: [],
      fileNoList: [],
    }
  },
  watch: {
    param() {
      this.init()
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.keyVal = this.item['key']
      let fileNoVal = this.keyVal.replace('Name', 'No')
      this.fileNameList = this.getfileNameList(this.param[this.keyVal])
      this.fileNoList = this.getfileNameList(this.param[fileNoVal])
    },
    getfileNameList(fileName) {
			if (fileName) {
				return fileName.split(',')
			} else {
				return []
			}
		},
    handleViewFile(fileName, fileNo) {
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		},
  },
}
</script>

<style lang="scss" scoped>
.file-show-class {
  .si-file-wrap {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .si-file-wrap .item {
    cursor: pointer;
    color: #1890ff;
  }
}

</style>