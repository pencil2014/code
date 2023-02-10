<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="form" :model="form" label-width="80px" class="add-class">
     <el-form-item label="合计：">
       <div>{{ totalNum }} 份</div>
     </el-form-item>
     <el-form-item label="提单纸编码：" porp="blPageNoList">
       <div class="page-class">
         <div class="row" v-for="(item,index) in form.blPageNoList" :key="index">
           <div class="left">
              <el-input-number 
                 v-model="item.start"
                 size="mini" 
                 :controls="false" 
                 :precision='0' 
                 :max="item.end"
                 >
              </el-input-number>
              <div class="middle-class">-</div>
              <el-input-number 
                 v-model="item.end"
                 size="mini" 
                 :controls="false" 
                 :precision='0' 
                 :min="item.start" 
               >
              </el-input-number>
           </div>
           <div class="right">
             <i @click="add" v-show="index === 0" class="icon-class el-icon-circle-plus-outline" />
             <i @click="remove(index)" v-show="form.blPageNoList.length > 1" class="icon-class el-icon-remove-outline" />
           </div>
         </div>
       </div>
     </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { blPagerBatchSave } from '@/api/railway/blPage'
export default {
  components: { BaseDialog },
  data() {
    return {
      dialogConfig: {
				title: '新增提单纸',
				show: true,
				size: 'medium',
				width: '800px'
			},
      form: {
        blPageNoList: [{ start: undefined, end: undefined }]
      }
    }
  },
  computed: {
    totalNum() {
      let num = 0
      let total = 0
      this.form.blPageNoList.forEach(item => {
        if (item.start && item.end) {
           num = (item.end - item.start) + 1
        }
        total += num 
      })
      return total
    }
  },
  methods: {
    validtor() {
      if (this.form.blPageNoList.some(item => !item.start || !item.end)) {
        return false
      } else {
        return true
      }
    },
    add() {
      if (!this.validtor()) {
        this.$message.error('提单纸编码不能有空值!')
        return
      }
      this.form.blPageNoList.push({
        start: undefined,
        end: undefined,
      })
    },
    remove(index) {
      this.form.blPageNoList.splice(index, 1)
    },
    close(action, value) {
			this.$emit('close', action, value)
		},
    dialogCallback(action, done) {
			if (action === 'Confirm') {
				if (!this.validtor()) {
          this.$message.error('提单纸编码不能有空值!')
          return
        }
        blPagerBatchSave(this.form.blPageNoList)
        .then(res => {
          this.$message.success('新增成功')
          this.close('Confirm')
        })
			} else {
				this.close('Cancel')
			}
		},
  }
}
</script>

<style lang="scss" scoped>
.add-class {
  .page-class {
    .row {
      display: flex;
      .left {
        display: flex;
        flex: 1;
        justify-content: space-between;
        /deep/.el-input-number {
          width: 48%;
        }
      }
      .right {
        width: 60px;
        text-align: center;
        display: flex;
        justify-content: space-around;
        align-items: center;
        .icon-class {
          cursor: pointer;
        }
      }
    }
    .row+.row {
      margin-top: 5px;
    }
  }
  /deep/.el-form-item {
    margin-bottom: 4px !important;
  }
}

</style>