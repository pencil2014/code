<!--
 * @Description: 客情关系无效列表
 * @Autor: yinjunying
 * @Date: 2022-06-20 14:17:59
-->
<template>
  <div class="finance-page" v-loading="lsLoading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground">
    <div class="guest-invalid-table">
      <el-table :data="invalidList" style="width: 100%" fit border>
        <el-table-column label="客户姓名" min-width="80" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-popover trigger="hover" placement="bottom-start" width="500">
              <p class="popoverText"><b>教育背景: </b>{{ scope.row.eduBack }}</p>
              <p class="popoverText"><b>家庭背景: </b>{{ scope.row.familyBack }}</p>
              <p class="popoverText"><b>从业背景: </b>{{ scope.row.professionalBack }}</p>
              <p class="popoverText"><b>性格爱好: </b>{{ scope.row.hobbies }}</p>
              <p class="popoverText"><b>其它特殊情况或要求: </b>{{ scope.row.other }}</p>
              <div slot="reference" class="name-wrapper">
                {{ scope.row.customerName }}
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="customerEname" label="英文名" min-width="100" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="custContactPosition" label="职位" min-width="120" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column label="电话号码" min-width="100" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-popover trigger="hover" placement="bottom-start" width="300">
              <p class="popoverText"><b>电话号码: </b>{{ scope.row.mobileNo }}</p>
              <p class="popoverText"><b>座机号码: </b>{{ scope.row.telNo }}</p>
              <p class="popoverText"><b>Email: </b>{{ scope.row.email }}</p>
              <p class="popoverText"><b>QQ: </b>{{ scope.row.qq }}</p>
              <p class="popoverText"><b>微信号: </b>{{ scope.row.wechat }}</p>
              <p class="popoverText"><b>WHATSAPP: </b>{{ scope.row.whatsapp }}</p>
              <p class="popoverText"><b>WECHAT: </b>{{ scope.row.wechatEname }}</p>
              <p class="popoverText"><b>Fax No.: </b>{{ scope.row.faxNo }}</p>
              <div slot="reference" class="name-wrapper">
                {{ scope.row.mobileNo }}
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="maintenanceFrequency" label="维护频次" min-width="150" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ formatMaintFrequency(scope.row.maintenanceFrequency) }}
          </template>
        </el-table-column>
        <el-table-column label="拜访提醒日期" min-width="150" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.visitFirstTips">{{ changeDate(scope.row.visitFirstTips) }}</span>
            <span v-if="scope.row.visitSecondTips">、{{ changeDate(scope.row.visitSecondTips) }}</span>
            <span v-if="scope.row.visitThirdTips">、{{ changeDate(scope.row.visitThirdTips) }}</span>
            <span v-if="scope.row.visitFourthTips">、{{ changeDate(scope.row.visitFourthTips) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="customerEname" label="电话提醒日期" min-width="150" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.telFirstTips">{{ changeDate(scope.row.telFirstTips) }}</span>
            <span v-if="scope.row.telSecondTips">、{{ changeDate(scope.row.telSecondTips) }}</span>
            <span v-if="scope.row.telThirdTips">、{{ changeDate(scope.row.telThirdTips) }}</span>
            <span v-if="scope.row.telFourthTips">、{{ changeDate(scope.row.telFourthTips) }}</span>
            <span v-if="scope.row.weeklyTips">{{ formatterWeek(scope.row.weeklyTips) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="duty" label="职责" min-width="180" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="employeeName" label="归属人" min-width="80" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="invalidReason" label="失效原因" min-width="150" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="invalidName" label="失效人" min-width="100" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="invalidTime" label="失效时间" min-width="120" align="center" show-overflow-tooltip></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    dataList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      invalidList: []
    }
  },
  created () {

  },
  mounted () { },
  watch: {
    dataList (nval) {
      this.invalidList = [...nval]
    }
  },
  methods: {
    /**
     * @description: 转换维护频次格式
     * @param {*} val
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-20 15:32:50
     */
    formatMaintFrequency (val) {
      if (val) {
        if (val === 'year_once') return "当面拜访每年一次，电话交流至少半年一次"
        if (val === 'year_twice') return "当面拜访每年两次，电话交流至少每季度一次"
        if (val === 'quarter_once') return "当面拜访每季度一次，电话交流至少每周一次"
      } else {
        return ''
      }
    },
    /**
     * @description: 转换周格式
     * @param {*} val
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-20 14:41:09
     */
    formatterWeek (val) {
      if (val) {
        if (val === 'monday') return "周一"
        if (val === 'tuesday') return "周二"
        if (val === 'wednesday') return "周三"
        if (val === 'thursday') return "周四"
        if (val === 'friday') return "周五"
        if (val === 'saturday') return "周六"
        if (val === 'sunday') return "周日"
      } else {
        return ''
      }
    },
    /**
     * @description: 转换日期格式
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-20 16:22:21
     */
    changeDate (val) {
      if (val) {
        return val.split(" ")[0]
      } else {
        return ''
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.guest-invalid-table {
  /deep/ .el-table .cell.el-tooltip {
    overflow: hidden;
  }
}
.popoverText {
  line-height: 24px !important;
  font-size: 12px !important;
}
</style>