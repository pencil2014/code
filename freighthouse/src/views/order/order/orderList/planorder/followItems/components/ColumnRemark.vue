<template>
  <div class="column-remark" v-if="show">
    <el-input placeholder="请输入" :disabled="disabledState" v-model="value" size="mini" @focus.stop="handleClickBdRemark"></el-input>
    <div v-if="remarkPopShow">
      <remarkPop :title="title" :value="value" @close="closeCb" />
    </div>
  </div>
</template>

<script>
import remarkPop from './remarkPop.vue'
import { followRemarkSave, followDataSave, followPutRemarkSave, followFreetimeSave } from '@/api/order/followItems'
export default {
  props: ['param', 'item', 'scope'],
  data() {
    return {
      baseKey: ['remark', 'poImp', 'refNo'],
      key: '',
      orderNo: '',
      value: '',
      title: '',
      remarkPopShow: false
    }
  },
  watch: {
    param() {
      this.init()
    }
  },
  components: {
    remarkPop
  },
  computed: {
    show() {
      return this.baseKey.includes(this.key) ||  this.param.followItem
    },
    followItem() {
      return this.param.followItem || {}
    },
    disabledState() {
      if (this.key === 'putRemark' && this.param.isDraftConfirm !== 'y') {
        // 放单备注 草单未确认时不能修改
        return true
      } else {
        return false
      }
      
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.orderNo = this.param.orderNo
      this.key = this.item.key
      this.value = this.param[this.key] || this.followItem[this.key] || '' // 有的followItem是数组，有的是对象
      this.title = this.item.label
    },
    handleClickBdRemark() {
      this.remarkPopShow = true
    },
    closeCb(action, newInfo) {
      console.log('param item', this.param, this.item)
      this.remarkPopShow = false
      if (action === 'Confirm') {
        if (this.key === 'remark') {
          // 个人备注
          followRemarkSave({
            orderNo: this.orderNo,
            remark: newInfo,
          })
          .then(res => {
            this.successCb(newInfo)
          })
        } else if (['poImp', 'refNo'].includes(this.key)) {
          let obj = {}
          if (this.key === 'poImp') {
            obj = {
              poImp: newInfo,
              refNo: this.param.refNo
            }
          } else {
            obj = {
              poImp: this.param.poImp,
              refNo: newInfo
            }
          }
          followDataSave({
            orderNo: this.orderNo,
            ...obj,
          })
          .then(res => {
            this.successCb(newInfo)
          })
        } else if (this.key === 'putRemark') {
          // 放货备注
          followPutRemarkSave({
            orderNo: this.orderNo,
            blId: this.param.blId,
            remark: newInfo 
          })
          .then(res => {
            this.successCb(newInfo)
          })
        } else if (this.key === 'ftReplyRemark') {
          // 批复说明
          followFreetimeSave({
            orderNo: this.orderNo,
            ftReplyRemark: newInfo,
          })
          .then(res => {
            this.successCb(newInfo)
          })
        }
      }
    },
    successCb(value) {
      this.$message.success(this.title + '修改成功')
      this.item.method()
    }
  },
}
</script>

<style lang="scss" scoped>
.column-remark {
  /deep/.el-input--mini .el-input__inner {
    height: 20px !important;
    line-height: 20px !important;
  }
}
</style>