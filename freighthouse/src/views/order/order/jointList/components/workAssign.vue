<template>
  <div class="jointService-workAssign" v-if="jointServiceWorkList.length">
    当前服务项参与人员：
    <div class="ml10" v-for="(item, index) in jointServiceWorkList" :key="index">
      <span>{{item.jobCode === 'op_truck' ? '拖报操作' : item.jobCode === 'op' ? '操作：' : item.jobCode === 'ac' ? '财务：' : ''}}</span>
      <el-select 
        size="mini" 
        remote
        filterable
        :disabled="item.jobCode === 'op' || item.jobCode === 'op_truck'"
        v-model="item.employeeName"
        style=""  
        placeholder="请选择"
        @visible-change="(val) => {employeeVisibleChange(val, item)}"
        :filter-method="(val) => {employeeFilterMehod(val, item)}"
        @change="(val) => {handleChangeEmployee(val, item)}">
        <el-option v-for="(o, index) in employeeOptions"
          :key="index"
          :label="o.label"
          :value="o.label">
        </el-option>
      </el-select>
    </div>
    <el-button type="primary" size="mini" @click="handleJointServiceWorkAssign" class="ml10">保存</el-button>
  </div>
</template>

<script>
import {baseEmployeeListName} from '@/api/base'
import {jointServiceWorkAssign} from '@/api/order/list'

export default {
  data() {
    return {
      oQuery: this.$route.query,
      // jointServiceWorkList: [], // 当前服务项参与人员
      employeeOptions: [],  // 参与人下拉数据
      timerTr: null
    }
  },
  props: {
    jointServiceWorkList: {
      type: Array,
      default: () => ([])
    },
    serviceCode: {
      type: String,
      default: ''
    }
  },
  created() {
  },
  mounted() {
  },
  computed: {
  },
  watch: {
  },
  components: {
    
  },
  methods: {
    debounceLxz(fn, time = 800) {
			clearTimeout(this.timerTr)
			this.timerTr = setTimeout(() => {
				if (!fn || !(fn instanceof Function)) {
					this.$message({ message: '参数错误！', type: 'error', showClose: true })
				} else {
					fn()
				}
			}, time)
		},
    employeeFilterMehod(val, item) {
      this.debounceLxz(() => {
				this.getEmployeeName(val, item)
			})
    },
    employeeVisibleChange(val, item) {
      if (val) {
        this.getEmployeeName('', item)
      }
    },
    handleChangeEmployee(val, item) {
      let sItem = this.employeeOptions.find(ele => this.$language === 'en' ? ele.ename === val : ele.cname === val)
      Object.assign(item, {
        employeeId: sItem.employeeId
      })
    },
    // 获取员工name
    getEmployeeName(val, item) {
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        roleCode: item.jobCode
      }
      baseEmployeeListName(data).then(res => {
        this.employeeOptions = res.data.filter(item => item.status === 'on').map(item => {
          return Object.assign(item, {
            label: this.$language === 'en' ? item.ename : item.cname,
            value: item.employeeId
          })
        })
        console.log(item)
      })
    },
    handleJointServiceWorkAssign() {
      let workAssign = this.jointServiceWorkList.filter(item => item.jobCode === 'ac').map(item => {
        return {
          jobCode: item.jobCode,
          employeeId: item.employeeId
        }
      })
      let data = {
        orderNo: this.$route.query.orderNo,
        jointNo: this.$route.query.jointNo,
        serviceCode: this.serviceCode,
        workAssign
      }
      jointServiceWorkAssign(data).then(res => {
        this.$message({
          type: 'success',
          message: '保存成功',
          duration: 1000,
          onClose: () => {
            this.$emit("callback")
          }
        })
      })
    },
  }
};
</script>

<style lang="scss">

</style>
