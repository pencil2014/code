<template>
  <div class="vessel-class">
    <el-select id="voaygeSelect" class="select-class" size="mini" :disabled="disabledState" :allow-create="allowCreate"  clearable :value="bindValue" filterable remote placeholder="请选择大船航次" @change="changeValue" :remote-method="(val)=>{ remoteMethod(val)}" @visible-change="visibleChange">
      <el-option v-for="item in options" :key="item.value" :label="item.key" :value="item.value">
      </el-option>
    </el-select>
    <el-button v-if="bindValue && !copyBtnHide" class="btn-class" type="default" size="mini" @click="handleCopyPort(bindValue, $event)">复制</el-button>
  </div>
</template>

<script>
import { vesselInput } from '@/api/order/list'
import clip from '@/utils/clipboard'
export default {
  data() {
    return {
      options: [],
      allowCreate: false, // 是否能手动输入
      initStatus: true,
      maxlength: 128  // allowCreate创建的条目可输入的最大字符长度
    }
  },
  props: {
    orderNo: {
      type: String,
      default: ''
    },
    bindValue: {
      type: String,
      default: ''
    },
    disabledState: {
      type: Boolean,
      default: false
    },
    placeholderText: {
      type: String,
      default: '大船航次'
    },
    shipCarrierCode: {
      type: String,
      default: ''
    },
    polPortCode: {
      type: String,
      default: ''
    },
    podPortCode: {
      type: String,
      default: ''
    },
    vessel: {
      type: String,
      default: ''
    },
    copyBtnHide: {
      type: Boolean,
      default: false
    }
  },
  model: {
    prop: 'bindValue',
    event: 'update'
  },
  mounted() {
    this.getVesselInput()
    this.initStatus = false
  },
  watch: {
    orderNo(val) {
       this.getVesselInput()
    }
  },
  methods: {
    getVesselInput() {
       if(this.orderNo) {
          vesselInput({
            orderNo: this.orderNo
          }).then((res) => {
            this.allowCreate = res.data
            if (this.allowCreate) {
              // 设置可输入的最大字符长度
              let select = document.getElementById('voaygeSelect')
              select.setAttribute('maxlength', this.maxlength)
            }
          })
       }
    },
    visibleChange(val) {
      if(val) {
        this.remoteMethod('')
      }
    },
    remoteMethod(queryString) {
      if(!this.orderNo){
        !this.initStatus && this.$emit('voyageCallBack')
        return
      }
      this.$store
        .dispatch('dict/queryBookVoyage', {
          shipCarrierCode: this.shipCarrierCode,
          polPortCode: this.polPortCode,
          podPortCode: this.podPortCode,
          voyage: queryString,
          vessel: this.vessel
        })
        .then((data) => {
          this.options = data
        })
    },
    changeValue(val) {
      this.$emit('update', val)
    },
     handleCopyPort(val, e) {
        clip(val, e)
    },
    clipboardSuccess() {
      this.$message({
          message: '复制成功',
          type: 'success',
          duration: 1500
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.vessel-class {
  width: 100%;
  display: flex;
  justify-content: space-between;
  .select-class {
    flex: 1;
  }
  .btn-class {
    width: 40px;
    margin-left:5px;
  }
}
</style>