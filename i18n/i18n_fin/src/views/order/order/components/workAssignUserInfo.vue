<template>
  <div class="job-cname" :class="{ 'joint-service' : type === 'jointService'}">
    <span>{{item.jobEname}}</span><!-- {{item.jobCname}} -->
    <el-popover
      :id="type + item.jobCode"
      popper-class="emplpyeeName-pop"
      placement="left"
      width="240"
      @show="handleTogglePopOver(item.employeeId)"
      trigger="hover">
      <div class="employeeName-list">
        <ul>
          <li v-if="employeeInfo.telephone">{{$t('OrderFee.telephone')}}：{{employeeInfo.telephone}}</li>
          <li v-else>{{$t('OrderFee.cellPhoneNo')}}：{{employeeInfo.mobileNo}}</li>
          <li>{{$t('OrderFee.email')}}：{{employeeInfo.email}}</li>
          <li>{{$t('OrderFee.department')}}：{{employeeInfo.deptCname}}</li>
          <li>{{$t('OrderFee.company')}}：{{employeeInfo.companyCname}}</li>
        </ul>
      </div>
      <i slot="reference" class="el-icon-postcard"></i>
    </el-popover>
  </div>
</template>

<script>
import { employeeInfo } from '@/api/base'
export default {
  data() {
    return {
      employeeInfo: {},
    }
  },
  props: {
    item: {
      type: Object,
			default: () => ({})
    },
    type: {
      type: String,
      default: ''
    }
  },
  mounted() {
  },
  watch: {
  },
  methods: {
    handleTogglePopOver(employeeId) {
			// console.log('employeeId', employeeId)
			this.employeeInfo = {
				telephone: '',
				mobileNo: '',
				email: '',
				deptCname: '',
				companyCname: ''
			}
			if (employeeId) {
				employeeInfo({ employeeId: employeeId }).then(res => {
					this.employeeInfo = res.data
				})
			}
    }
  }
}
</script>

<style lang="scss" scoped>
.job-cname {
  height: 20px;
  line-height: 20px;
  display: flex;
  margin-top: 2px;
  font-size: 12px;
  &.joint-service{
    color: #999;
  }
  .el-icon-postcard {
    font-size: 16px;
    margin-left: 5px;
    cursor: pointer;
    color: #409eff;
    padding-top: 3px;
  }
}
</style>