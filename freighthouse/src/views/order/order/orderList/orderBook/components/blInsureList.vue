<template>
  <div id="blFileList">
    <BaseDialog :config="dialogConfig" :callback="dialogCallback">
      <div class="customsClearance-bewteen">
        <span class="ft12"> 提单号： {{ param.blNo }} </span>
        <div class="row-tit-operate">
          <el-button v-if="param.orderStatus != 'cancel' && param.orderStatus != 'close'" size="mini" type="primary" @click="handleAddRow">新增保险</el-button>
        </div>
      </div>
      <el-table fit highlight-current-row style="width: 100%" ref="fileListTable" :data="tableData" class="table-cont bl-table-insure" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
        <el-table-column prop="goodsValue" label="货值" align="center" width="100">
          <span v-if="scope.row.oid" slot-scope="scope">
            {{ scope.row.goodsValue }}
          </span>
          <span v-else slot-scope="scope">
            <el-input @blur="validData(scope.row)" size="mini" v-model="scope.row.goodsValue" placeholder="请输入"></el-input>
          </span>
        </el-table-column>
        <el-table-column prop="currency" label="币种" align="center" width="100">
          <span v-if="scope.row.oid" slot-scope="scope">
            {{ scope.row.currency }}
          </span>
          <span v-else slot-scope="scope">
            <el-select v-model="scope.row.currency" size="mini" clearable placeholder="请选择">
              <el-option v-for="item in currencyList" :label="item.code" :value="item.code" :key="item.code"></el-option>
            </el-select>
          </span>
        </el-table-column>
        <el-table-column width="110" prop="policyHolderCustName" label="投保受益人公司" align="center">
          <span v-if="scope.row.oid" slot-scope="scope">
            {{ scope.row.policyHolderCustName }}
          </span>
          <span v-else slot-scope="scope">
            <el-select :id="'policyHolderCustNameDom'+scope.$index" default-first-option="" allow-create filterable v-model="scope.row.policyHolderCustId" size="mini" clearable placeholder="请选择">
              <el-option v-for="item in customerList" :label="item.name" :value="item.custid" :key="item.custid"></el-option>
            </el-select>
          </span>
        </el-table-column>
        <el-table-column width="150" prop="payLocation" label="赔付地" align="center">
          <span v-if="scope.row.oid" slot-scope="scope">
            {{ scope.row.payLocation }}
          </span>
          <span v-else slot-scope="scope">
            <el-select size="mini" v-model="scope.row.payLocation" clearable style="width: 100%" placeholder="请输入">
              <el-option v-for="item in polPortList" :key="item.value" :label="item.label" :value="item.label"> </el-option>
            </el-select>
          </span>
        </el-table-column>
        <el-table-column prop="insuranceSupplierId" label="保险公司" width="150" align="center">
          <span v-if="scope.row.oid" slot-scope="scope">
            {{ scope.row.insuranceSupplierName }}
          </span>
          <span v-else slot-scope="scope">
            <el-select filterable v-model="scope.row.insuranceSupplierId" size="mini" clearable placeholder="请选择">
              <el-option v-for="item in supplierList" :label="item.name" :value="item.supplierId" :key="item.supplierId"></el-option>
            </el-select>
          </span>
        </el-table-column>
        <el-table-column prop="issueMode" label="出单方式" align="center" width="100">
          <span v-if="scope.row.oid" slot-scope="scope">
            {{ valFilter(issueModeList, scope.row.issueMode) }}
          </span>
          <span v-else slot-scope="scope">
            <el-select @change="changeIssue(scope.row)" v-model="scope.row.issueMode" size="mini" clearable placeholder="请选择">
              <el-option v-for="item in issueModeList" :label="item.name" :value="item.value" :key="item.value"></el-option>
            </el-select>
          </span>
        </el-table-column>
        <el-table-column width="200" prop="invoiceNo" label="保单号" align="center">
          <span v-if="scope.row.oid" slot-scope="scope">
            {{ scope.row.invoiceNo }}
          </span>
          <span v-else slot-scope="scope">
            <el-input maxlength="64" v-model="scope.row.invoiceNo"></el-input>
          </span>
        </el-table-column>
        <el-table-column prop="billFileNo" label="附件" align="center" width="150">
          <span slot-scope="scope">
            <div class="operate-group">
              <el-button @click="handleView(scope.row)" type="text" size="mini">
                <el-tooltip class="item" effect="dark" :content="scope.row.billFileNo" placement="top-start">
                  <span class="file-name-style">{{ scope.row.billFileNo }}</span>
                </el-tooltip>
              </el-button>
            </div>
          </span>
        </el-table-column>
        <el-table-column prop="billFileName" label="保单名称" align="center" width="150"> </el-table-column>
        <el-table-column prop="isValid" label="是否有效" align="center">
          <span slot-scope="scope">
            {{ valFilter(isValidList, scope.row.isValid) }}
          </span>
        </el-table-column>
        <el-table-column prop="retrieveStatus" label="取单状态" align="center">
          <span slot-scope="scope">{{ scope.row.retrieveStatus === 'retrieved' ? '已取单' : '未取单' }}</span>
        </el-table-column>
        <el-table-column prop="retrieveFinishTime" width="150" label="取单完成时间" align="center"> </el-table-column>
        <el-table-column prop="putStatus" label="放单状态" align="center">
          <span slot-scope="scope">{{ scope.row.putStatus === 'finish' ? '已放单' : '未放单' }}</span>
        </el-table-column>
        <el-table-column prop="putFinishTime" width="150" label="放单完成时间" align="center">
          <span slot-scope="scope">
            {{ scope.row.putFinishTime }}
          </span>
        </el-table-column>
        <el-table-column prop="expressNo" label="快递单号" align="center"> </el-table-column>

        <el-table-column fixed="right" width="220" label="操作" align="center">
          <template slot-scope="scope">
            <div class="operate-group">
              <el-button type="text" size="mini" @click="handleDownload(scope.row)" v-if="scope.row.billFileName && scope.row.isValid === 'y'">下载</el-button>
              <el-button v-if="!scope.row.billFileNo && scope.row.issueMode === 'telex_release'" @click="handleUploadFile(scope.row)" type="text" size="mini">上传附件</el-button>

              <el-button style="color:red;" v-if="!scope.row.billFileNo" @click="handleDelete(scope.row, scope.$index)" type="text" size="mini">删除</el-button>
              <el-button v-if="scope.row.oid && scope.row.billFileNo && scope.row.isValid != 'n'" @click="handleInvalid(scope.row)" type="text" size="mini">失效</el-button>
              <el-button v-if="!scope.row.oid" @click="handleSave(scope.row, true)" type="text" size="mini">保存</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
    </BaseDialog>
    <div v-if="uploadShow">
      <BlFileUpload :oid="curRow.oid" @close="uploadPopClose" />
    </div>
  </div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import tableTooltip from '@/components/Base/Table/table-tooltip'
import { insuranceList, insuranceDelete, insuranceSaveBatch, insuranceInvalid, insurancePayLocation } from '@/api/order/list'
import BlFileUpload from './batchUpload'
import { baseCurrencyList } from '@/api/base'
import { supplierList, customerList } from '@/api/crm/supplier.js'

export default {
  filters: {
    fileTypeFilter(fileType) {
      let typeTxt = ''
      let { blFileType, tradeDocName } = store.state.dict.dictMap
      let fileTypeOptions = blFileType.concat(tradeDocName)
      let sItem = fileTypeOptions.find(item => item.value === fileType)
      typeTxt = sItem ? sItem.label : ''
      return typeTxt
    }
  },
  data() {
    return {
      polPortList: [],
      curRow: {},
      isValidList: [
        { name: '有效', value: 'y' },
        { name: '无效', value: 'n' }
      ],
      retrieveStatusList: [
        { name: '未取单', value: 'no_retrieve' },
        { name: '已取单', value: 'retrieved' }
      ],
      putStatusList: [
        { name: '未放单', value: 'INIT' },
        { name: '已放单', value: 'FINISH' }
      ],
      issueModeList: [
        { name: '正本', value: 'original' },
        { name: '电放', value: 'telex_release' }
      ],
      // fileList: [],
      supplierList: [],
      customerList: [],
      currencyList: [],
      oQuery: this.$route.query,
      tableData: [],
      dialogConfig: {
        title: '保险列表',
        show: true,
        size: 'medium',
        width: '80%'
      },
      uploadShow: false,
      policyHolderCustNameMaxlength: 255, 	// 投保受益人公司allowCreate创建的条目允许输入的最大字符
      tableCellMouse: {
        cellDom: null, // 鼠标移入的cell-dom
        hidden: null, // 是否移除单元格
        row: null // 行数据
      },
      saveDisabled: false
    }
  },
  props: {
    param: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    this.getSupplierList()
    this.getCustomerList()
    this.getCurrencyList()
    this.getFileList()
  },
  mounted() {
    console.log('🚀 ~ sessionStorage.custStr', sessionStorage.custStr)
    let businessType = JSON.parse(sessionStorage.custStr).businessType
    this.polPortList = [
      { label: '起运港', value: 'pol' },
      { label: '目的地', value: 'pod' }
    ]
    if (['rail_export_fcl', 'rail_export_lcl'].includes(businessType)) {
      this.polPortList = [
        { label: '起运站', value: 'pol' },
        { label: '目的站', value: 'pod' }
      ]
    }

    if (['ship_export_fcl'].includes(businessType)) {
      this.polPortList = [
        { label: '起运港', value: 'pol' },
        { label: '目的地', value: 'pod' }
      ]
    }
    if (['ship_export_lcl'].includes(businessType)) {
      this.polPortList = [
        { label: '装货地', value: 'pol' },
        { label: '目的地', value: 'pod' }
      ]
    }
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      orderNo: state => state.railway.orderNo,
      custid: state => state.railway.custid,
      role: state => state.user.role
    })
  },
  components: {
    BaseDialog,
    BlFileUpload,
    tableTooltip
  },
  watch: {
    'tableData': {
      handler(newVal, oldVal) {
        if (newVal.length) {
          this.$nextTick(() => {
            // 设置可输入的最大字符长度
            newVal.forEach((item, index) => {
              let select = document.getElementById('policyHolderCustNameDom'+index)
			        select && select.setAttribute('maxlength', this.policyHolderCustNameMaxlength)
            })
          })
        }
      }
    }
  },
  methods: {
    // 鼠标移入cell
    showTooltip(row, column, cell) {
      this.tableCellMouse.cellDom = cell
      this.tableCellMouse.row = row
      this.tableCellMouse.hidden = false
    },
    // 鼠标移出cell
    hiddenTooltip() {
      this.tableCellMouse.hidden = true
    },
    changeIssue(val) {
      if (val.issueMode === 'original') {
        val.billFileName = ''
      }
    },

    valFilter(list, val) {
      let item = list.find(item => item.value == val)
      if (item) {
        return item.name
      }
      return ''
    },
    handleInvalid(row) {
      let data = {
        oid: row.oid
      }
      insuranceInvalid(data).then(res => {
        if (res.code === 0) {
          this.$message.success('操作成功!')
          this.getFileList()
        }
      })
    },
    // isSingle 单行保存
    handleSave(row, isSingle) {
      return new Promise((resolve, reject) => {
        if (!row.issueMode) {
          reject('请选择出单方式!')
          return this.$message.warning('请选择出单方式!')
        }
        if (!row.invoiceNo) {
          reject('请输入保单号!')
          return this.$message.warning('请输入保单号!')
        }
        let cusNameObj = this.customerList.find(item => item.custid === row.policyHolderCustId)
        let policyHolderCustName = ''
        let policyHolderCustId = 0
        if (cusNameObj) {
          policyHolderCustId = row.policyHolderCustId
          policyHolderCustName = cusNameObj.name
        } else {
          policyHolderCustId = 0
          policyHolderCustName = row.policyHolderCustId
        }
        let supplyNameObj = this.supplierList.find(item => item.supplierId === row.insuranceSupplierId)
        let supplyName = supplyNameObj ? supplyNameObj.name : ''
        let data = {
          orderNo: this.oQuery.orderNo,
          blId: this.param.blId,
          goodsValue: row.goodsValue,
          currency: row.currency,
          policyHolderCustId: policyHolderCustId,
          policyHolderCustName: policyHolderCustName,
          payLocation: row.payLocation,
          insuranceSupplierId: row.insuranceSupplierId,
          insuranceSupplierName: supplyName,
          invoiceNo: row.invoiceNo,
          issueMode: row.issueMode
        }
        let params = {
          data: data,
          // fileName: this.fileList
          fileName: row.fileList
        }
        if (isSingle) {
          if (this.saveDisabled) return
          this.saveDisabled = true
        }
        this.$store
          .dispatch('order/soUpload', {
            uri: '/order/insurance/save',
            params: params
          })
          .then(res => {
            if (res.data && res.data.code === 0) {
              resolve('添加成功!')
              // 单行保存的时候 提示并重新请求列表
              if (isSingle) {
                this.$message.success('添加成功!')
                this.getFileList()
                if (isSingle) {
                  this.saveDisabled = false
                }
              }
            } else {
              reject('添加失败!')
              if (isSingle) {
                this.saveDisabled = false
              }
            }
          })
      })
    },
    handleDelete(row, index) {
      let data = {
        orderNo: this.oQuery.orderNo,
        oid: row.oid
      }
      if (row.oid) {
        insuranceDelete(data).then(res => {
          this.$message.success('删除成功!')
          this.getFileList()
        })
      } else {
        this.tableData.splice(index, 1)
      }
    },
    //供应商列表
    getSupplierList() {
      supplierList({
        pageSize: 1000,
        query: [{ column: 'category', type: 'eq', value: 'insurance' }]
      }).then(res => {
        this.supplierList = res.data && res.data.list
      })
    },
    validData(row) {
      let reg = /^\d+(\.\d{0,2})?$/
      if (!reg.test(row.goodsValue)) {
        row.goodsValue = ''
        this.$message.warning('只能输入最多包含两位小数的数字!')
      }
      if (row.goodsValue > 99999999) {
        this.$message.warning('数字最大不能超过99999999!')
        row.goodsValue = ''
      }
    },
    //客户列表
    getCustomerList() {
      customerList({ pageSize: 1000 }).then(res => {
        this.customerList = res.data && res.data.list
      })
    },
    // 币别下拉列表
    getCurrencyList(queryString) {
      baseCurrencyList(queryString, 'valid').then(response => {
        this.currencyList = response.data
      })
    },
    handleAddRow() {
      // if (this.tableData.some(item => !item.oid)) {
      // 	return this.$message.warning('有未保存的数据,请先保存!')
      // }
      //新增一行的时候把上次的文件清除
      // this.fileList = []
      this.tableData.push({
        goodsValue: '',
        currency: '',
        policyHolderCustId: '',
        policyHolderCustName: '',
        payLocation: '',
        insuranceSupplierId: '',
        insuranceSupplierName: '',
        issueMode: '',
        invoiceNo: '',
        billFileNo: '',
        billFileName: '',
        isValid: '',
        retrieveStatus: '',
        retrieveFinishTime: '',
        putStatus: '',
        putFinishTime: '',
        expressNo: '',
        fileList: []
      })
    },
    // 附件列表
    getFileList() {
      let data = {
        orderNo: this.oQuery.orderNo,
        blId: this.param.blId
      }
      insuranceList(data).then(res => {
        this.tableData = res.data
      })
    },
    close(action, value) {
      this.$emit('close', action, value)
    },
    uploadPopClose(action, fileName) {
      this.uploadShow = false
      if (action === 'Confirm') {
        if (this.curRow.oid) {
          return this.getFileList()
        }
        // this.fileList = fileName
        this.curRow.fileList = fileName //设置每一行对应的文件
        this.curRow.billFileName = fileName[0].name
      }
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        // 批量保存的时候先判断是否有重复的保单号
        let invoiceNoList = this.tableData.map(item => item.invoiceNo)
        // 判断是否有空的保单号
        if (invoiceNoList.some(item => !item)) return this.$message.warning('保单号不能为空!')
        if (invoiceNoList.length != new Set(invoiceNoList).size) return this.$message.warning('有重复的保单号!')
        let rows = this.tableData.filter(item => !item.oid)
        if (rows.length === 0) return this.close('Confirm', this.tableData)

        Promise.all(
          rows.map(async row => {
            return await this.handleSave(row, false)
          })
        )
          .then(res => {
            console.log(res)
            this.$message.success('添加成功!')
          })
          .catch(err => {
            console.log('🚀 ~ err', err)
          })
          .finally(() => {
            this.close('Confirm', this.tableData)
          })
      } else {
        this.close('Cancel', this.tableData)
      }
    },
    // 预览
    handleView(row) {
      this.$store.dispatch('railway/previewFile', {
        fileNo: row.billFileNo,
        fileName: row.billFileName
      })
    },
    // 下载
    handleDownload(row) {
      this.$store
        .dispatch('railway/downloadBlobFile', {
          uri: '/base/webapi/file/download',
          params: {
            fileNo: row.billFileNo
          }
        })
        .then(res => {
          console.log(res)
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = row.billFileName
          link.click()
        })
    },
    // 打开上传附件弹窗
    handleUploadFile(row) {
      this.curRow = row
      this.uploadShow = true
    }
  }
}
</script>
<style lang="scss">
.bl-table-insure {
  .cell {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cell.el-tooltip {
    overflow: hidden;
  }
}
#blFileList .customsClearance-bewteen {
  display: flex;
  justify-content: space-between;
  height: 32px;
  line-height: 32px;
}
#blFileList .table-cont .operate-group .el-button {
  white-space: normal;
}
#blFileList .table-cont .operate-group .el-button--mini span {
  display: block;
}
</style>
