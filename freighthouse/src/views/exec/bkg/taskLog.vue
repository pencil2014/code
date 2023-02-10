<template>
  <el-dialog :appendToBody="true" :visible.sync="config.show" title="日志信息" width="1000px" v-loading="loading">
    <div class="log-box" v-show="showNoData && list.length">
      <div class="log-cnt">
        <div class="item-box" v-for="(item,index) in list" :key="item.oid">
          <div class="cnt-box">
            <div class="cnt-info">
              <div class="time">
                {{item.createdTime}}
              </div>
              <div class="cnt">
                {{item.taskDesc}}
              </div>
            </div>
            <div class="but" v-show="item.req || item.resp" @click="showInfo(item)">
              详情
            </div>
          </div>
          <transition name="fade">
            <div class="info-box" v-show="item.showInfo">
              <pre v-if="item.req"><b>req: </b>{{item.req}}</pre>
              <pre v-if="item.resp"><b>resp: </b>{{item.resp}}</pre>
            </div>
          </transition>
        </div>
      </div>
      <div class="log-page">
        <el-pagination
          small
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currPage"
          :page-sizes="[50, 100, 200, 300, 500]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>
    <div class="no-data" v-show="showNoData && !list.length">
      ^-^ 对不起，暂无数据
    </div>
  </el-dialog>
</template>

<script>
import {taskLog} from '@/api/exec/cosco'
export default {
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
       list: [],
       currPage: 1,
       pageSize: 50,
       total: 0,
       showNoData: false,
       loading: false
    }
  },
  created () {
    this.getData()
  },
  methods: {
    getData () {
      let {taskType, taskId} = this.config
      let data = {
        currPage: this.currPage,
        pageSize: this.pageSize,
        taskType,
        taskId
      }
      this.loading = true
      taskLog(data).then(res => {
        if (res.code === 0) {
          this.list = res.data.list.map(item => Object.assign({},item,{showInfo: false}))
          this.currPage = res.data.currPage
          this.pageSize = res.data.pageSize
          this.total = res.data.totalCount
          this.showNoData = true
        }
      }).catch(()=>{}).finally(()=>{
        this.loading = false
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currPage = 1
      this.getData()
    },
    handleCurrentChange(val) {
      this.currPage = val
      this.getData()
    },
    showInfo (item) {
      item.showInfo = !item.showInfo
    }
  }
}
</script>

<style lang="scss" scoped>
.log-box{
  max-height: 600px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  .log-cnt{
    flex: 1;
    overflow-y: auto;
    .item-box{
      margin-bottom: 5px;
      font-size: 12px;
      .cnt-box{
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        padding: 2px 0;
        .cnt-info{
          display: flex;
          .time{
            margin-right: 15px;
          }
        }
        .but{
          color: #3e80f5;
          cursor: pointer;
          margin-left: 10px;
        }
      }
      .info-box{
        margin: 5px 0;
        background-color: #eee;
        padding: 5px;
        color: #666;
        width: 100%;
        overflow: auto;
        pre{
          font-family: Verdana;
          b{
            color: #333;
          }
        }
      }
    }
  }
  .log-page{
    text-align: right;
  }
}
.no-data{
  text-align: center;
  padding: 100px;
}
/deep/ li.number{
    font-weight: 500 !important;
  }
/deep/ .el-dialog__body{
  padding: 10px !important;
}
</style>
