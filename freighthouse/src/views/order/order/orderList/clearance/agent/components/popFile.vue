<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-table fit highlight-current-row style="width: 100%" ref="fileTable" :data="tableData" class="popFile-table">
      <el-table-column prop="fileNo" label="附件编码" align="center" show-overflow-tooltip></el-table-column>
      <el-table-column prop="typeName" label="附件类型" align="center" show-overflow-tooltip></el-table-column>
      <el-table-column prop="fileName" label="附件名称" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <div class="operate-group">
            <el-button type="text" size="mini" @click="handleViewFile(scope.row)">
              <span  class="file-name-style">{{scope.row.fileName || scope.row.name}}</span>
            </el-button>
          </div>
        </template>
      </el-table-column>
       <el-table-column prop="fileName" label="操作" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <div class="operate-group">
            <el-button @click="handledownload(scope.row)" type="text" size="mini">下载</el-button>
            <el-button style="color:#CD4130;" :disabled="!showDelBtn"  @click="handleDelete(scope.row,scope.$index)" type="text" size="mini">解绑</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </BaseDialog>
</template>
<script>

import {mapState} from 'vuex'
import {getDictLabel} from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'

export default {
  data() {
    return {
      oQuery: this.$route.query,
      tableHeight: null,
      dialogConfig: {
        title: '附件信息',
        show: true,
        size: 'medium',
        width: "900px",
        btns: [
          // {label: '取消', action: 'Cancel'},
          {label: '确定', action: 'Confirm', type: 'primary'}
        ]
      },
    }
  },
  props: {
    showDelBtn:{
      type:Boolean,
      default:false
    },
    tableData: {
      type: Array,
      default: () => ([])
    }
  },
  created() {
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - this.$refs.fileTable.$el.offsetTop -200
    })
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
    })
  },
  components: {
    BaseDialog
  },
  watch: {
  },
  methods: {
    handleDelete(row,index){
      // this.$emit('delFile',index)
      this.tableData.splice(index,1)
    },
    handledownload(row){
      this.$store
        .dispatch('order/downloadBlobFile', {
          uri: '/base/webapi/file/download',
          params: {
            fileNo: row.fileNo
          }
        })
        .then((res) => {
          console.log(res)
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = row.name || row.fileName
          link.click()
        })
    },
    handleViewFile(row) {
      this.$store.dispatch('order/previewFile', {fileName: row.name || row.fileName, fileNo: row.fileNo})
    },
    close(action) {
      this.$emit('close', action)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.close('Confirm')
        this.$emit('update:tableData', this.tableData)
      } else {
        this.close('Cancel')
      }
    },
  }
}
</script>
<style lang="scss">
.delete-color {
  color: #CD4130;
}
.el-table.popFile-table .cell{
  overflow: hidden;
}
</style>