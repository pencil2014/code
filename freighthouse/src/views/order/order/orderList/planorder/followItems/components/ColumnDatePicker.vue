<template>
  <div>
    <div v-if="canEdit">
       <el-date-picker 
          v-model="model" 
          size="mini" 
          style="width: 100%"
          placeholder="请选择"
          :picker-options="defaultPickerOptions"
          @change="change"
          value-format="yyyy-MM-dd">
			</el-date-picker>
    </div>
    <span v-else>{{ model }}</span>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { updateAtaAtd } from '@/api/order/followItems'
export default {
  props: ['param', 'item', 'scope'],
  data() {
    var self = this
    return {
      canEditServiceCodeList: ['departure', 'arrival'],
      model: '',
      title: '',
      defaultPickerOptions: {
        disabledDate(time) {
          // 只能选 创建时间之后，且不能选未来时间
          let createdTime = self.param['createdTime'] || ''
          if (createdTime) {
            createdTime = createdTime.slice(0, 10) + ' 00:00:00'
            createdTime = new Date(createdTime)
            createdTime = createdTime.getTime()
            let nowDate = Date.now()
            return time > nowDate || time < createdTime
          } else {
            return time > nowDate
          }
        }
      }
    }
  },
  created() {
    this.model = this.param[this.item.key]
    this.title = this.item.label
  },
  computed: {
    ...mapState({
			serviceCodeVal: state => state.followItems.serviceCodeVal,
      activityKey: state => state.followItems.activityKey
		}),
    canEdit() {
      return this.activityKey === 'owner' && 
             this.serviceCodeVal && this.canEditServiceCodeList.includes(this.serviceCodeVal)
    }
  },
  methods: {
    change(val) {
      updateAtaAtd({
        orderNo: this.param['orderNo'],
        time: this.model,
        timeType: this.item.key === 'ta' ? 'ata' : this.item.key === 'td' ? 'atd' : ''
      })
      .then(res => {
        this.$message.success(this.title + '修改成功')
        this.item.method()
      })
    },
  },
}
</script>

<style>

</style>