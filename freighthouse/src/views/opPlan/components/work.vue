<template>
  <div class="work">
    <div class="content">
      <div class="item" v-for="(item, index) in workData.len2" :key="index">
        <span class="key">{{item.jobCname}}：</span>
        <span class="value">
          <el-popover
            placement="top"
            style="font-size: 12px;"
            @show="onShow(item.employeeId)"
            trigger="hover">
            <div class="">
              <div class="info-item">
                <span class="info-key">手机：</span>
                <span class="info-value">{{ (employeeInfoObj[item.employeeId] && employeeInfoObj[item.employeeId].mobileNo) || '' }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">邮箱：</span>
                <span class="info-value">{{ (employeeInfoObj[item.employeeId] && employeeInfoObj[item.employeeId].email) || '' }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">部门：</span>
                <span class="info-value">{{ (employeeInfoObj[item.employeeId] && employeeInfoObj[item.employeeId].deptCname) || '' }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">公司：</span>
                <span class="info-value">{{ (employeeInfoObj[item.employeeId] && employeeInfoObj[item.employeeId].settleCompanyName) || '' }}</span>
              </div>
            </div>
            <span slot="reference" >{{item.employeeName}}</span>
          </el-popover>
        </span>
      </div>
    </div>
    <div class="content">
      <div class="item" v-for="(item, index) in workData.len4" :key="index">
        <span class="key">{{item.jobCname}}：</span>
        <span class="value">
          <el-popover
            placement="top"
            style="font-size: 12px;"
            @show="onShow(item.employeeId)"
            trigger="hover">
            <div class="">
              <div class="info-item">
                <span class="info-key">手机：</span>
                <span class="info-value">{{ (employeeInfoObj[item.employeeId] && employeeInfoObj[item.employeeId].mobileNo) || '' }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">邮箱：</span>
                <span class="info-value">{{ (employeeInfoObj[item.employeeId] && employeeInfoObj[item.employeeId].email) || '' }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">部门：</span>
                <span class="info-value">{{ (employeeInfoObj[item.employeeId] && employeeInfoObj[item.employeeId].deptCname) || '' }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">公司：</span>
                <span class="info-value">{{ (employeeInfoObj[item.employeeId] && employeeInfoObj[item.employeeId].settleCompanyName) || '' }}</span>
              </div>
            </div>
            <span slot="reference" >{{item.employeeName}}</span>
          </el-popover>
        </span>
      </div>
    </div>
     <div class="content">
      <div class="item" v-for="(item, index) in workData.lenMore" :key="index">
        <span class="key">{{item.jobCname}}：</span>
        <span class="value">
          <el-popover
            placement="top"
            style="font-size: 12px;"
            @show="onShow(item.employeeId)"
            trigger="hover">
            <div class="">
              <div class="info-item">
                <span class="info-key">手机：</span>
                <span class="info-value">{{ (employeeInfoObj[item.employeeId] && employeeInfoObj[item.employeeId].mobileNo) || '' }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">邮箱：</span>
                <span class="info-value">{{ (employeeInfoObj[item.employeeId] && employeeInfoObj[item.employeeId].email) || '' }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">部门：</span>
                <span class="info-value">{{ (employeeInfoObj[item.employeeId] && employeeInfoObj[item.employeeId].deptCname) || '' }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">公司：</span>
                <span class="info-value">{{ (employeeInfoObj[item.employeeId] && employeeInfoObj[item.employeeId].settleCompanyName) || '' }}</span>
              </div>
            </div>
            <span slot="reference" >{{item.employeeName}}</span>
          </el-popover>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { employeeInfo } from '@/api/base'
export default {
  props: {
    orderInfo: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  created() {
    this.getWorkData()
  },
  data() {
    return {
      workData: {
        len2: [],
        len4: [],
        lenMore: [],
      },
      employeeInfoObj: {}
    }
  },
  methods: {
    getWorkData() {
      let len2 = ['doc', 'pricing', 'bkg', 'op', 'csc', 'rc']
      let len4 = ['asst', 'ac', 'line_cs', 'ecs', 'op_truck', 'epricing']
      let lenMore = ['bd', 'obd', 'tc', 'eac']
      let list = this.orderInfo.jointWorkAssign || this.orderInfo.workAssign || []
      list.forEach(item => {
         if (len2.includes(item.jobCode)) {
           this.workData.len2.push(item)
         } else if (len4.includes(item.jobCode)) {
           this.workData.len4.push(item)
         } else if (lenMore.includes(item.jobCode)) {
           this.workData.lenMore.push(item)
         }
      })
    },
    onShow(employeeId) {
      if (this.employeeInfoObj[employeeId]) return
      employeeInfo({employeeId})
      .then(res => {
        this.$set(this.employeeInfoObj, employeeId, {
          mobileNo: res.data.mobileNo || '',
          email: res.data.email || '',
          deptCname: res.data.deptCname || '',
          settleCompanyName: res.data.settleCompanyName || ''
        })
        console.log('this.employeeInfoObj', this.employeeInfoObj)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.work {
  margin-top: 8px;
  background-color: #ffffff;
  padding: 5px 16px 10px;
  display: flex;
  align-items: flex-start;
  .content {
    display: flex;
    flex-wrap: wrap;
    width: 33%;
    .item {
      width: 50%;
      display: flex;
      justify-content: center;
      margin-top: 5px;
      .key {
        width: 120px;
        text-align: right;
      }
      .value {
        width: calc(100% - 120px);
      }
    }
  }
}
</style>