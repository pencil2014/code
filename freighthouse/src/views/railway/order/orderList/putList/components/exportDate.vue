<template>
  <div class="filter-flex">
     <BaseDialog class="filter-search" :config="dialogConfig" :callback="dialogCallback">
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="时间范围：" prop="date" required :show-message="false">
            <el-date-picker 
              size="mini" 
              v-model="form.date" 
              type="daterange" 
              style="width:300px;"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期" 
              placeholder="请选择时间范围"
              value-format="yyyy-MM-dd"
            ></el-date-picker>
          </el-form-item>
        </el-form>
     </BaseDialog>
  </div>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
export default {
   data() {
     return {
        dialogConfig: {
          title: '导出绩效表',
          show: true,
          size: 'medium',
          width: '450px',
          showBtns: true
        },
        form: {
          date: []
        }
     }
   },
   components: {
     BaseDialog
   },
   methods: {
     dialogCallback(action, done) {
        if (action === 'Confirm') {
          if (!this.form.date || !this.form.date.length) {
            this.$message.error('请选择时间范围')
            return
          }
          console.log('时间范围：', this.form.date)
          this.close('Confirm', this.getDate())
        } else {
          this.close('Cancel')
        }
     },
     getDate() {
       return {
         beginTime: this.form.date[0],
         endTime: this.form.date[1]
       }
     },
     close(action, value) {
			this.$emit('close', action, value)
	   },
   }
}
</script>

<style lang="scss" scoped>
.filter-search {
  /deep/.el-date-editor {
   border: 1px solid #dcdfe6 !important;
  }
}

</style>