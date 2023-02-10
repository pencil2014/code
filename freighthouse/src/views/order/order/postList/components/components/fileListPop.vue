<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<div class="customsClearance-bewteen">
				<span class="ft12">
					寄单编号:{{options.expressCode}}
				</span>
			</div>
			<el-table fit highlight-current-row style="width: 100%;" ref="fileListTable" :data="tableData" class="table-cont">
				<el-table-column prop="fileName" label="附件名称">
					<template slot-scope="scope">
						 <span class="file-name-class" :title="scope.row.fileName" size="mini" @click="handleViewFile(scope.row)">{{ scope.row.fileName }}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center" width="100">
					<template slot-scope="scope">
						<el-button @click="handleDownload(scope.row)" type="text" size="mini" >下载</el-button>
					</template>
				</el-table-column>
			</el-table>
		</BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
export default {
  props: {
    options: {
      type: Object,
      default:() =>{
        return {}
      }
    }
  },
  components: { BaseDialog },
  data() {
     return {
       dialogConfig: {
				title: '附件列表',
				show: true,
				size: 'medium',
				width: '600px',
				showBtns: false
			},
      tableData: []
     }
  },
  created() {
    this.getTableData()
  },
  methods: {
		getTableData() {
			if (this.options.fileNo) {
				let nameList = this.options.fileName.split(',')
				let noList = this.options.fileNo.split(',')
				nameList.forEach((item, index) => {
					this.tableData.push({
						fileName: item,
						fileNo: noList[index]
					})
				})
			}
		},
		handleViewFile(row) {
			let fileNo = row.fileNo
			let fileName = row.fileName
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		},
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
					link.download = row.fileName
					link.click()
				})
		},
    dialogCallback(action, done) {
      this.$emit('close')
		},
  },
}
</script>

<style lang="scss" scoped>
.customsClearance-bewteen {
	display: flex;
	justify-content: space-between;
	height: 32px;
	line-height: 32px;
}
.file-name-class {
	width: 100%;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	cursor: pointer;
	color: #1890ff;
}
</style>