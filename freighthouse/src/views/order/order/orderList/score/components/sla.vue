<template>
  <div class="sla" v-if="slaPopList.length">
    <div class="title">
      SLA评分<i @click="look" class="el-icon-question icon-class"></i>
    </div>
    <div class="table-class">
        <el-table
          :data="tableData"
          border
          style="width: 100%">
          <el-table-column
            prop="rowKey"
            label="统计维度"
            width="130px"
            >
          </el-table-column>
          <el-table-column
            v-for="item in itemCodeList"
            :key="item.prop"
            :prop="item.prop"
            :label="item.label">
            <template slot-scope="scope">
              <span>{{ scope.row.slaItemWithPoint[item.prop] || scope.row.slaItemWithPoint[item.prop] == 0 ? scope.row.slaItemWithPoint[item.prop] : '--'}}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="point"
            label="合计">
            <template slot-scope="scope">
              <span>{{ scope.row.point + '/' + scope.row.count}}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="percent"
            label="百分比">
          </el-table-column>
        </el-table>
    </div>
    <div v-if="slaPopShow">
      <slaPop :slaPopList="slaPopList" @close="slaPopClose" />
    </div>
  </div>
</template>

<script>
import { getItemCode, getOrderSlaList, getOrderSlaConfigList } from '@/api/order/opPlan.js'
import slaPop from './slaPop.vue'
export default {
  data() {
    return {
      tableData: [],
      itemCodeList: [],
      slaPopList: [],
      slaPopShow: false
    }
  },
  components: { slaPop },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      let request1 = getItemCode({})
      let request2 = getOrderSlaList({orderNo: this.$route.query.orderNo})
      let request3 = getOrderSlaConfigList({orderNo: this.$route.query.orderNo})
      Promise.all([request1, request2, request3])
      .then(([res1,res2,res3]) => {
        let list1 = res1.data || []
        let list2 = res2.data || []
        let list3 = res3.data || []
        this.slaPopList = list3.map(item => {
          item.itemName = (list1.find(o => {
            return o.itemCode === item.scoringItems
          }) || {}).itemName || ''
          return item
        })
        list1.forEach(item => {
          if (this.slaPopList.some(o => o.scoringItems === item.itemCode)) {
             this.itemCodeList.push({
                prop: item.itemCode,
                label: item.itemName
             }) 
          }
        })
        this.tableData = list2.map((item, index) => {
          if (index === 0) {
            item['rowKey'] = '剔除不可控的得分'
          } else if (index === 1) {
            item['rowKey'] = '不剔除不可控的得分'
          }
          return item
        })
      })
    },
    look() {
      this.slaPopShow = true
    },
    slaPopClose() {
      this.slaPopShow = false
    }
  }
}
</script>

<style lang="scss" scoped>
.sla {
  margin-top: 8px;
  background-color: #ffffff;
  .title {
    color: #222222;
    font-weight: bold;
    .icon-class {
      font-size: 12px;
      margin-left: 5px;
      cursor: pointer;
    }
  }
  .table-class {
    margin-top: 10px;
  }
}
</style>