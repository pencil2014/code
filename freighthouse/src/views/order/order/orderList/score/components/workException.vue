<template>
   <div class="workException">
       <div class="title">异常单</div>
       <div class="content">
         <div class="table">
          <el-table
            :data="workExceptionData"
            border
            style="width: 100%">
             <el-table-column
              prop="excpNo"
              width="150"
              label="异常编号">
              <template slot-scope="scope">
                <div class="excpNo-class" @click="goRouter(scope.row)">{{ scope.row.excpNo }}</div>
              </template>
            </el-table-column>
             <el-table-column
              prop="serviceName"
              width="180"
              label="服务项">
            </el-table-column>
             <el-table-column
              prop="reasonTypeName"
              label="异常类型">
            </el-table-column>
             <el-table-column
              prop="reasonName"
              label="异常原因">
            </el-table-column>
             <el-table-column
              prop="isControl"
              width="80"
              label="是否可控">
              <template slot-scope="scope">
                {{ scope.row.isControl === 'Y' ? '是' : scope.row.isControl === 'N' ? '否' : ''}}
              </template>
            </el-table-column>
             <el-table-column
              prop="isCustComplain"
              width="100"
              label="是否客户投诉">
              <template slot-scope="scope">
                {{ scope.row.isCustComplain | getDictLabelFilter('yesOrNoOptions')}}
              </template>
            </el-table-column>
             <el-table-column
              prop="handleStatus"
              width="100"
              label="异常状态">
              <template slot-scope="scope">
                {{ scope.row.handleStatus | getDictLabelFilter('exceptionStatus')}}
              </template>
            </el-table-column>
          </el-table>
         </div>
       </div>
    </div>
</template>

<script>
import { workExceptionList } from '@/api/order/workException'
import { mapState } from 'vuex'
export default {
  data() {
    return {
      workExceptionData: []
    }
  },
  created() {
    this.getWorkExceptionList()
  },
  computed: {
     ...mapState({
      dictMap: state => state.dict.dictMap,
     }),
  },
  methods: {
     getWorkExceptionList() {
       let str = this.dictMap.exceptionStatus.map(item => {
          return item.value
         }).join(',')
      let data = {
        ascColumns: [],
        columns: [],
        currPage: 1,
        descColumns: ["startTime"],
        pageSize: 100,
        query: [
          { column: "orderNo", type: "like", value: this.$route.query.orderNo },
          { column: 'handleStatus', type: 'in', value: str }
        ]
      }
      workExceptionList(data)
      .then(res => {
        if (res.data.list) {
           this.workExceptionData = res.data.list
        }
      })
     },
     goRouter(row) {
        let routeUrl = this.$router.resolve({
          name: 'WorkExceptionDetail',
          query: {
            excpId: row.excpId,
            orderNo: this.$route.query.orderNo,
          },
        })
        window.open(routeUrl.href, '_blank')
     }
  },
}
</script>

<style lang="scss" scoped>
.workException {
  margin-top: 20px;
  .title {
    color: #222222;
    font-weight: bold;
  }
  .content {
    margin-top: 10px;
  }
  .excpNo-class {
    cursor: pointer;
    color: #1890ff;
  }
}
</style>
