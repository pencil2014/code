<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-table
      :data="showName"
      border
      style="width: 100%">
      <el-table-column
        prop="fileNo"
        label="附件编码"
        >
      </el-table-column>
      <el-table-column
        prop="name"
        label="附件名称"
        show-overflow-tooltip
        >
        <template slot-scope="scope">
          <span class="btn" @click="handleViewFile(scope.row.name, scope.row.fileNo)">{{ scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="fileNo"
        label="操作"
        width="100"
        >
        <template slot-scope="scope">
          <span class="btn" @click="handleDownload(scope.row)">下载</span>
          <span class="red" style="margin-left: 10px; cursor: pointer;" @click="deleteFile(scope.row)">删除</span>
        </template>
      </el-table-column>
    </el-table>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import {
  orderFileDelete
} from '@/api/order/list'
export default {
  components: {
    BaseDialog,
  },
  props: {
    orderNo: {
      type: String,
      default: '',
    },
    showName: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      dialogConfig: {
				title: '查看附件',
				show: true,
				size: 'medium',
				width: '800px',
        btns: [
          {label: '关闭', action: 'Cancel'}
        ]
			},
    }
  },
  methods: {
    dialogCallback(action, done) {
			this.$emit('close')
		},
    handleViewFile(fileName, fileNo) {
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
					link.download = row.name
					link.click()
				})
		},
    deleteFile(o) {
      this.$confirm('是否确认删除该条数据?', '提示?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
         orderFileDelete({
          orderNo: this.orderNo,
          oid: o.oid
         })
         .then(() => {
          this.$message.success('删除成功')
          this.$emit('close', 'delete')
         })
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.btn {
    font-size: 12px;
    color: #1890ff;
    cursor: pointer;
  }
</style>