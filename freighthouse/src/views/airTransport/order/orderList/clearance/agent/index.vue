<template>
  <div class="edit-row agent">
    <!-- 报关信息  -->
    <DefaultTableComp :isJoint="isJoint" ref="defaultTableComp" class="agent-table table-com-layout air-agent-table" :tableInfo="tableInfo" :tableConfig="tableConfig" @tableClick="tableClick">
      <el-button size="mini" style="margin-right: 10px;" :type="'default'" :disabled="!isOp || isJoint || progressValue === 'finish'" @click="tableClick('out')">输出报关委托单</el-button>
      <template>
        委托状态：
        <el-select @change="changeStatus" v-model="intrustStatus" placeholder="请选择" size="mini" style="width: 100px;" :disabled="!isOp || isJoint || progressValue === 'finish'">
          <el-option v-for="item in intrustStatusList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </template>
    </DefaultTableComp>
    <!-- 报关详情 -->
    <AgentDetail v-if="showDetail" :oid="oid" :newIntrustNo="intrustNo" @callBack="detailCallBack" :isDisabled="!isOp || isJoint || progressValue==='finish'" :orderInfoData="orderInfoData" />
    <!-- 报关单输出弹窗 -->
    <div v-if="exportPopShow">
      <ExportPop @close="exportPopClose" />
    </div>
  </div>
</template>

<script>
import { mixin } from '../mixin'
import { handleData } from '../../../js/handleData'
import DefaultTableComp from '../../../components/defaultTableComp'
import {
  airCustomsList,
  airCustomsDel,
  airCustomsUpdate,
  airCustomsAdd,
  airCustomsUpdateStatus,
  airCustomsGetIntrustNo
} from '@/api/airTransport/order'
import AgentDetail from './components/agentDetail'
import ExportPop from './components/exportPop'
import { deleteAlert } from '@/utils/tools'
import { getDictMap, getDictLabel } from '@/utils/tools'
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
export default {
  mixins: [mixin, orderMixin],
  data() {
    return {
      oQuery: this.$route.query,
      showDetail: false, // 显示委托详情
      oid: '',
      tableInfo: {
        title: '报关计划表',
        titleBtnList: [
          // { label: '输出报关委托单', key: 'out' },
          { label: '新增委托', key: 'add', type: 'primary' }
        ]
      },
      // 表格配置项
      tableConfig: {
        style: {},
        tableIndex: {
          show: false
        },
        options: {
          // 是否支持解锁列表修改,默认锁定列表不可更改
          lockState: true,

          // 是否支持列表项选中功能
          mutiSelect: true,

          // 多选框状态判断 {false不可选, true可选}
          checkSelectable({ intrustNo }) {
            return intrustNo ? true : false
          }
        },
        columns: handleData.agentColumn, //  表格显示的表头
        list: [],
        // 操作按钮组
        operationBtns: {
          width: '120px',
          fixed: 'right',
          show: true,
          callback: (action, $index, row, item) => {
            let fn = this['handle' + action]
            if (typeof fn !== 'function') return
            this['handle' + action](row)
          },
          data: [
            {
              label: '详情',
              type: 'text',
              show: true,
              action: 'Info'
            },
            // {
            // 	label: '输出',
            // 	type: 'text',
            // 	show: true,
            // 	action: 'Out'
            // },
            {
              label: '删除',
              className: 'red',
              type: 'text',
              show: (item, row) => {
                if (
                  row.intrustStatus === 'intrusted' ||
                  !this.isOp ||
                  this.isJoint ||
                  this.progressValue === 'finish'
                ) {
                  return false
                } else {
                  return true
                }
              },
              action: 'Delete'
            }
          ]
        },

        // 操作提示
        tips: {
          text: '',
          show: false
        },

        // 分页
        pagination: {
          show: false,
          total: 0
        }
      },
      intrustNo: '',
      intrustStatusList: getDictMap('customsIntrustStatus') || [], // 委托状态
      intrustStatus: '', // 委托状态值
      progress: 'notStarted', // 报关进度
      exportPopShow: false, // 输出弹窗
      exportId: null
    }
  },
  created() {
    this.init()
  },
  mounted() {},
  props: {
    progressValue: {
      type: String,
      default: ''
    },
    tabMenus: {
      type: Array,
      default: () => []
    },
    orderInfoData: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    progressValue(newVal) {
      if (!this.isOp || this.isJoint || newVal === 'finish') {
        this.tableInfo.titleBtnList.map((item) => {
          Object.assign(item, {
            hide:
              !this.isOp || this.isJoint || this.progressValue === 'finish'
                ? true
                : false
          })
        })
      }
    },
    isOp(val) {
      this.tableInfo.titleBtnList.map((item) => {
        Object.assign(item, {
          hide:
            !val || this.isJoint || this.progressValue === 'finish'
              ? true
              : false
        })
      })
    }
  },
  computed: {},
  components: {
    DefaultTableComp,
    AgentDetail,
    ExportPop
  },
  methods: {
    init() {
      this.getOrderInfo()
      this.getList()
      this.tableConfig.operationBtns.data.map((item) => {
        Object.assign(item, {
          disabled:
            (!this.isOp || this.isJoint) && item.action === 'Delete'
              ? true
              : false
        })
      })
      this.tableInfo.titleBtnList.map((item) => {
        Object.assign(item, {
          hide:
            !this.isOp || this.isJoint || this.progressValue === 'finish'
              ? true
              : false
        })
      })
    },
    getList() {
      let data = { orderNo: this.oQuery.orderNo }
      // let data = { orderNo: 'A202106080000004' }
      airCustomsList(data).then((res) => {
        this.tableConfig.list =
          (res.data &&
            res.data.map((item) => {
              item.customsTypeLabel = getDictLabel(
                'airCustomsType',
                item.customsType
              )
              item.customsIntrustStatusLabel = getDictLabel(
                'customsIntrustStatus',
                item.intrustStatus
              )
              return item
            })) ||
          []
      })
    },
    // 委托详情
    handleInfo(row) {
      this.showDetail = true
      this.intrustNo = ''
      this.oid = row.oid
    },
    // 输出报关单
    handleOut(row) {
      this.exportPopShow = true
      this.exportId = row.oid
    },
    exportPopClose(action, value) {
      if (action === 'Confirm') {
        this.handleExport(value)
      } else {
        this.exportPopShow = false
      }
    },
    // 输出
    handleExport(value) {
      console.log('🚀 ~ value', value)
      this.$store
        .dispatch('order/exportBlobFile', {
          uri: '/order/air/customs/export',
          data: {
            orderNo: this.$route.query.orderNo,
            oid: this.exportId,
            docType: value.docType
          }
          // data: {
          // 	oid: 2,
          // 	orderNo: 'S2020105280001',
          // 	docType: 'PDF'
          // }
        })
        .then((res) => {
          this.exportPopShow = false
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download =
            `报关委托单${this.$route.query.orderNo}.` +
            value.docType.toLowerCase()
          link.click()
        })
    },

    // 委托删除
    handleDelete(row) {
      deleteAlert(this, airCustomsDel, { oid: row.oid }, this.deleteCallback)
    },
    // 删除回调
    deleteCallback() {
      this.showDetail = false
      this.getList()
    },
    // table 回调函数 新增委托、委托完成
    tableClick(type) {
      if (type == 'out') {
        if (this.$refs.defaultTableComp.selectedCheckbox.length != 1) {
          this.$message({ message: '请勾选1条报关信息', type: 'warning' })
          return false
        }

        this.handleOut(this.$refs.defaultTableComp.selectedCheckbox[0])
      }
      if (type == 'add') {
        // 新增获取报关委托单号
        airCustomsGetIntrustNo().then((res) => {
          this.intrustNo = res.data
          this.oid = ''
          this.showDetail = true
        })
      } else if (type == 'update') {
        let oid = this.$refs.defaultTableComp.selectedCheckbox.map(
          (item) => item.oid
        )
        if (!oid.toString()) {
          this.$message({ message: '请勾选报关信息', type: 'warning' })
          return false
        }
        airCustomsUpdateStatus({ ids: oid }).then((res) => {
          this.$message({
            type: 'success',
            message: '状态修改成功'
          })
        })
      }
    },

    // 报关委托详情回调函数
    detailCallBack(data) {
      if (data.type == 'cancel') {
        this.showDetail = false
      } else if (data.type == 'save') {
        this.handleSave(data.list)
      }
    },
    validate(data) {
      if (!data.customsType) {
        this.$message({ type: 'error', message: '报关方式不能为空' })
        return false
      }
      if (!data.customsSupplierId) {
        this.$message({ type: 'error', message: '报关行不能为空' })
        return false
      }
      if (!data.declarant) {
        this.$message({ type: 'error', message: '报关员姓名不能为空' })
        return false
      }
      if (!data.declarantPhone) {
        this.$message({ type: 'error', message: '报关员电话不能为空' })
        return false
      }
      return true
    },
    // 保存
    handleSave(data) {
      data.orderNo = this.oQuery.orderNo
      if (!this.validate(data)) return
      if (data.oid) {
        airCustomsUpdate(data).then((res) => {
          this.getList()
          this.$message({
            type: 'success',
            message: '保存成功'
          })
        })
      } else {
        airCustomsAdd(data).then((res) => {
          this.getList()
          this.$message({
            type: 'success',
            message: '添加成功'
          })
        })
      }
      this.showDetail = false
    },

    // 修改委托状态
    changeStatus(value) {
      let oids = this.$refs.defaultTableComp.selectedCheckbox.map(
        (item) => item.oid
      )
      if (!oids.toString()) {
        this.intrustStatus = ''
        this.$message({ message: '请勾选报关信息', type: 'warning' })
        return false
      }
      this.$confirm('是否确认修改状态?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return airCustomsUpdateStatus({
            ids: oids,
            intrustStatus: value
          })
        })
        .then((response) => {
          this.$message({
            type: 'success',
            message: '状态修改成功！',
            duration: 1000,
            onClose: () => {
              this.intrustStatus = ''
              this.getList()
            }
          })
        })
        .catch((err) => {
          this.intrustStatus = ''
        })
    }
  }
}
</script>
<style lang="scss">
@import '../../../less/index.scss';
.air-agent-table,
.agentDetail {
  .el-table__header thead {
    color: #222222;
  }
  .row-tit {
    padding: 0 20px !important;
  }
  .tit {
    font-size: 12px !important;
  }
}
.edit-container .agent .air-agent-table .row-tit {
  border-bottom: unset !important;
  padding: 0 20px;
}
.progress span {
  font-size: 12px;
}
</style>
