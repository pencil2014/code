<template>
  <div class="agentDetail">
    <el-form ref="form" label-position="top" label-width="80px">
      <div class="row-tit">
        <span class="tit">报关委托编号: {{ intrustNo }}</span>
        <div class="row-tit-operate">
          <el-button type="default" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'cancel' })">取消</el-button>
          <el-button type="primary" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'save' })" :disabled="isDisabled || formDetailData.intrustStatus==='intrusted'">保存</el-button>
        </div>
      </div>
      <div class="row-body">
        <el-row>
          <el-col :span="index < 5 ? 4 : 24" v-for="(ele, index) in inputItem.items" :key="index">
            <FormItem :item="ele" :form="inputItem.form" />
          </el-col>
        </el-row>
        <!-- 报关委托单  -->
        <DefaultTableComp class="agent-table declare-tb-agent" :tableInfo="tableInfo" :tableConfig="tableConfig" @tableClick="tableClick" />
      </div>
    </el-form>

    <!-- 关联货物弹窗 -->
    <div v-if="showContainer">
      <ContainerDialog class="relate-cargo-dlg" :declarationId="declarationId" :disabledCargos="disabledCargos" :defaultSelectIds="defaultSelectIds" @addContainerFun="addContainerFun" @close="closeDialog"></ContainerDialog>
    </div>
    <!-- 商品弹窗 -->
    <div v-if="showCargo">
      <CargoDialog :customsCargoList="customsCargoList" @addContainerFun="addContainerFun" @close="closeDialog"></CargoDialog>
    </div>
    <!-- 查看附件信息 -->
    <el-dialog width="80%" title="查看附件信息" @close="handleFileClose" :visible.sync="dialogFileVisible">
      <div class="view-file-top">
        <div class="view-top-left">附件列表</div>
        <div class="view-top-right">
          <el-button @click="handleUploadFile" type="primary" size="mini">上传附件</el-button>
          <el-button @click="handleDownloadFile" type="primary" size="mini">下载</el-button>
        </div>
      </div>
      <el-table @selection-change="handleSelectionChange" header-row-class-name="pol-ltl-th" :data="fileData">
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column prop="typeName" label="附件类别" align="center"> </el-table-column>
        <el-table-column prop="fileName" label="附件名称" align="center">
          <template slot-scope="scope">
            <div class="operate-group">
              <el-button @click="handleView(scope.row)" type="text" size="mini">{{ scope.row.fileName }}</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdName" label="上传人" align="center"> </el-table-column>
        <el-table-column prop="createdTime" label="上传时间" align="center"> </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope"><span @click="delFile(scope.$index)" style="color:#CD4130;cursor:pointer;">删除</span></template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <!-- 附件上传 -->

    <div v-if="uploadShow">
      <FileUpload @close="uploadPopClose" :fileData="fileData" />
    </div>
  </div>
</template>
<script>
import { mixin } from '../../mixin'
import { handleData } from '../../../../js/handleData'
import FormItem from '@/components/Form/elFormItem'
import { getIntrustDoc, airCustomsListFile } from '@/api/order/list'
import { airCustomsDetail } from '@/api/airTransport/order'
import DefaultTableComp from '../../../../components/defaultTableComp'
import ContainerDialog from './containerDialog'
import CargoDialog from './cargoDialog'
import TableColumnPopover from './tableColumnPopover'
import { shipTradeModeList } from '@/api/base'
import { supplierInfo } from '@/api/crm/supplier'
import { getDictMap, copyArry } from '@/utils/tools'
import FileUpload from './fileUpload'

const defaultAddList = {
  companyTitle: '',
  customsNo: '',
  tradeTypeCode: '',
  cargoInfo: '',
  files: [],
  cargos: []
}

export default {
  mixins: [mixin],
  data() {
    return {
      curIndex: 0,
      multipleSelection: [],
      uploadShow: false,
      fileData: [],
      dialogFileVisible: false,
      oQuery: this.$route.query,
      formDetailData: {},
      inputItem: this.setInputItem({}), // 委托详情 输入框信息
      tableInfo: {
        title: '报关委托单',
        titleBtnList: [
          { label: '新增报关单', key: 'add', type: 'primary', hide: false }
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
          lockState: false,
          // 是否支持列表项选中功能
          mutiSelect: true,
          // 多选框状态判断 {false不可选, true可选}
          checkSelectable({ customsNo }) {
            return customsNo ? true : false
          }
        },
        columns: handleData.agentDetailColumn(
          TableColumnPopover,
          this.customerSearch,
          this.getShipTradeModeList,
          this.viewFile
        ), //  表格显示的表头
        list: [],
        // 操作按钮组
        operationBtns: {
          width: '150px',
          fixed: 'right',
          show: true,
          callback: (action, $index, row, item) => {
            let fn = this['handle' + action]
            if (typeof fn !== 'function') return
            this['handle' + action](row, $index)
          },
          data: [
            {
              label: '关联货物',
              type: 'text',
              disabled: false,
              action: 'Container'
            },
            {
              label: '删除',
              type: 'text',
              className: 'red',
              disabled: false,
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
      showContainer: false, // 集装箱弹窗是否显示
      declarationId: '', // 当前集装箱弹窗所在的报关委托单
      showCargo: false, // 商品弹窗是否显示
      currentCustomsNo: '',
      customsCargoList: [],
      customsSupplierName: '', // 报关行名称
      restaurants: [], // 供应商所有值
      intrustNo: this.newIntrustNo || '', // 报关委托单号
      defaultSelectIds: [] // 打开集装箱弹窗，默认选中id
    }
  },
  props: {
    oid: '',
    newIntrustNo: '',
    isDisabled: ''
  },

  created() {
    if (this.oid) this.getDetailInfo()
    if (!this.oid) {
      this.tableConfig.list.push({ ...defaultAddList })
    }
  },

  mounted() {},
  computed: {
    disabledCargos() {
      let list = []
      for (let i = 0; i < this.tableConfig.list.length; i++) {
        list.push(this.tableConfig.list[i].cargos)
      }
      return list.reduce((prev, curr) => prev.concat(curr), [])
    }
  },
  components: {
    FormItem,
    DefaultTableComp,
    ContainerDialog,
    CargoDialog,
    TableColumnPopover,
    FileUpload
  },
  watch: {
    oid(newval) {
      if (!newval) {
        this.formDetailData = {}
        this.inputItem = this.setInputItem({})
        this.intrustNo = this.newIntrustNo
        this.tableConfig.list = [defaultAddList]
      } else {
        this.getDetailInfo()
      }
    },
    isDisabled(val) {
      if (this.formDetailData.intrustStatus === 'intrusted' || val) {
        this.tableInfo.titleBtnList[0].hide = true
        this.tableConfig.operationBtns.data[1].disabled = true
        this.tableConfig.operationBtns.data[0].disabled = true
      } else {
        this.tableInfo.titleBtnList[0].hide = false
        this.tableConfig.operationBtns.data[1].disabled = false
        this.tableConfig.operationBtns.data[0].disabled = false
      }
    }
  },
  methods: {
    handleView(row) {
      this.$store.dispatch('order/previewFile', {
        fileNo: row.fileNo,
        fileName: row.fileName
      })
    },
    handleFileClose() {
      // let fileDtos = this.fileData.map(item => {
      // 	return { fileNo: item.fileNo, fileName: item.fileName }
      // })
      let fileDtos = JSON.parse(JSON.stringify(this.fileData))
      this.tableConfig.list[this.curIndex].files = fileDtos
      this.fileData = []
    },

    handleDownloadFile() {
      if (!this.multipleSelection.length) {
        return this.$message({
          type: 'warning',
          message: '请选择附件',
          duration: 1000,
          onClose: () => {}
        })
      }
      console.log('🚀 ~  this.multipleSelection', this.multipleSelection)
      let fileNos = this.multipleSelection.map((item) => item.fileNo)
      this.$store
        .dispatch('order/downloadBlobFile', {
          uri: '/base/webapi/file/zipDownload',
          params: {
            fileNos: fileNos.toString()
          }
        })
        .then((res) => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = '报关附件.zip'
          link.click()
        })
    },
    // 获取多选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    uploadPopClose(action, data) {
      this.uploadShow = false
      if (action === 'Confirm') {
        let fileItem = {
          fileNo: data.fileNo,
          createdBy: data.createdBy,
          typeName: data.fileTypeName,
          fileName: data.name,
          createdName: data.createdName,
          createdTime: data.createdTime
        }
        this.fileData.push(fileItem)
      }
    },
    // 打开上传附件弹窗
    handleUploadFile() {
      this.uploadShow = true
    },

    delFile(index) {
      this.fileData.splice(index, 1)
    },

    // 查看附件
    viewFile(index, row) {
      this.curIndex = index
      this.fileData = row.files
      console.log('🚀 ~ this.fileData', this.fileData)
      this.dialogFileVisible = true
    },
    getDetailInfo() {
      airCustomsDetail({ oid: this.oid }).then((res) => {
        this.formDetailData = res.data
        if (
          this.formDetailData.intrustStatus === 'intrusted' ||
          this.isDisabled
        ) {
          this.tableInfo.titleBtnList[0].hide = true
          this.tableConfig.operationBtns.data[1].disabled = true
          this.tableConfig.operationBtns.data[0].disabled = true
        }
        this.inputItem = this.setInputItem(res.data)
        this.intrustNo = this.newIntrustNo || res.data.intrustNo || ''
        if (res.data && res.data.declarations) {
          this.tableConfig.list = res.data.declarations
        }
      })
    },
    arrCustomsDeclarationList(data) {
      return data.map((v, i) => {
        // 集装箱信息
        let soList = this.arrContainerList(v.customsContainerList)
        v.containers = soList.label
        v.soList = soList
        v.customsContainerList = [...v.customsContainerList]
        // 商品编号
        v.commodityNos = this.arrCargoList(v.customsCargoList)
        return v
      })
    },
    arrContainerList(data) {
      let soList = { label: '', list: [] }
      // 集装箱信息
      let soArr = [...new Set(data.map((item) => item.so))]
      soList.label = soArr.join('、')
      soArr.forEach((so) => {
        let cnList = []
        data.map((item) => {
          if (item.so == so) cnList.push(item.cn)
        })
        soList.list.push({ so: so, cn: cnList.join('、') })
      })
      return soList
    },
    arrCargoList(data) {
      return [...new Set(data.map((item) => item.commodityNo))].join('、')
    },
    setInputItem(data) {
      let self = this
      return {
        form: {
          intrustNo: self.intrustNo || data.intrustNo || '',
          customsSupplierName: data.customsSupplierName || '',
          customsSupplierId: data.customsSupplierId || '',
          customsType: data.customsType || '',
          declarant: data.declarant || '',
          declarantPhone: data.declarantPhone || '',
          intrustTime: data.intrustTime || '',
          remark: data.remark || ''
        },
        items: [
          {
            label: '报关行',
            key: 'customsSupplierId',
            type: 'select',
            inputType: 'text',
            required: true,
            filterable: true,
            options: [
              { value: data.customsSupplierId, label: data.customsSupplierName }
            ],
            filterMethod: (queryString, item) => {
              self.getSupplierList(queryString, item)
            },
            visibleChange: (value, item) => {
              if (value) self.getSupplierList('', item)
            },
            change(value, item) {
              if (value) {
                self.inputItem.form.customsSupplierName = item.options.filter(
                  (o) => o.value === value
                )[0].label
                supplierInfo({ supplierId: value }).then((res) => {
                  let { contact } = res.data
                  Object.assign(self.inputItem.form, {
                    declarant: contact && contact.length ? contact[0].name : '',
                    declarantPhone:
                      contact && contact.length ? contact[0].mobileNo : ''
                  })
                })
              }
            }
          },
          {
            label: '报关方式',
            key: 'customsType',
            type: 'select',
            options: getDictMap('airCustomsType'),
            required: true
          },
          {
            label: '报关员姓名',
            key: 'declarant',
            type: 'input',
            inputType: 'text',
            required: true
          },
          {
            label: '报关员电话',
            key: 'declarantPhone',
            type: 'input',
            inputType: 'text',
            required: true
          },
          { label: '委托日期', key: 'intrustTime', type: 'datetimeLimit' },
          {
            label: '报关备注',
            key: 'remark',
            type: 'input',
            maxlength: 512,
            inputType: 'textarea',
            rows: 1
          }
        ]
      }
    },
    // 选择集装箱弹窗关闭回调
    containersPopClose(action, data) {
      this.showContainer = false
      if (action === 'Confirm') {
        // 集装箱列表
        let soList = this.arrContainerList(data)
        this.tableConfig.list.map((item) => {
          if (item.customsNo == this.currentCustomsNo) {
            item.containers = soList.label
            item.soList = soList
            item.customsContainerList = [...data]
          }
        })
        this.$forceUpdate()
      }
    },
    // 弹框点击关联按钮
    addContainerFun(data) {
      let cargos = data.map((item) => {
        return { cargoId: item.oid }
      })
      this.tableConfig.list[this.curIndex].cargos = cargos
      this.tableConfig.list[this.curIndex].cargoInfo = data
        .map((item) => item.cname)
        .join(',')
    },
    // 表格按钮回调
    callBack(data) {
      if (data.type == 'save') {
        this.formDetailData = Object.assign(
          this.formDetailData,
          this.inputItem.form,
          {
            intrustNo: this.intrustNo
          }
        )
        this.formDetailData.declarations = [...this.tableConfig.list]
        data.list = this.formDetailData
      }
      this.$emit('callBack', data)
    },
    // 表格按钮回调
    tableClick(type) {
      if (type == 'add') {
        this.tableConfig.list.push({ ...defaultAddList })
      }
    },
    // 新增集装箱
    handleContainer(row, index) {
      console.log('🚀 ~  row.cargos', row.cargos)
      this.defaultSelectIds = row.cargos.map((item) => item.cargoId)
      this.declarationId = row.declarationId || ''
      this.showContainer = true
      this.curIndex = index
    },
    // 新增商品
    handleCargo(row) {
      this.showCargo = true
      this.currentCustomsNo = row.customsNo
      this.customsCargoList = row.customsCargoList
    },
    // 输出委托单
    handleOut(row) {
      getIntrustDoc({
        oid: row.oid,
        orderNo: this.oQuery.orderNo,
        jointNo: this.oQuery.jointNo
      }).then((res) => {
        // 获取报关委托单详情
        this.$router.push({
          path: 'orderForm?type=2'
        })
        sessionStorage.setItem('orderFormData', JSON.stringify(res.data))
      })
    },

    // 表格操作回调
    handleDelete(row, index) {
      this.tableConfig.list.splice(index, 1)
    },
    closeDialog() {
      this.showContainer = false
      this.showCargo = false
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (
          restaurant.supplierName
            .toLowerCase()
            .indexOf(queryString.toLowerCase()) === 0
        )
      }
    },
    // 获取订舱代理
    getSupplierList(queryString, item) {
      this.$store
        .dispatch('dict/querySupplierList', {
          category: 'category',
          value: 'declaration',
          queryString: queryString
        })
        .then((data) => {
          item.options =
            (data.list &&
              data.list.map((ele) => {
                return Object.assign(ele, {
                  label: this.$language == 'en' ? ele.ename : ele.name,
                  value: ele.supplierId ? Number(ele.supplierId) : ''
                })
              })) ||
            []
        })
    },
    // 贸易方式模糊查询
    getShipTradeModeList(queryString, item, code) {
      let data = {}
      if (code && !queryString) {
        // 有选中值&&搜索条件不是空
        data = { currPage: 1, pageSize: 50, queryKey: code }
      } else {
        data = { currPage: 1, pageSize: 50, queryKey: queryString }
      }
      shipTradeModeList(data).then((res) => {
        item.data =
          (res.data &&
            res.data.list.map((o) => {
              return {
                label: o.shortName,
                value: o.code
              }
            })) ||
          []

        console.log(item.data)
      })
    },
    // 客商模糊查询
    customerSearch(queryString, item, code) {
      let value = ''
      if (code && !queryString) {
        // 有选中值&&搜索条件不是空
        value = code
      } else {
        value = queryString
      }
      this.$store.dispatch('dict/queryCustomerList', value).then((data) => {
        let list = data.list
        item.data = list.map((o) => {
          return {
            value: this.$language == 'en' ? o.ename : o.name,
            label: this.$language == 'en' ? o.ename : o.name
          }
        })
      })
    }
  }
}
</script>
<style lang="scss">
.declare-tb-agent {
  .el-button--mini {
    margin-left: 4px;
  }
}
.agentDetail {
  .view-file-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 4px;
    .view-top-left {
      font-size: 12px;
      font-weight: 700;
      color: #222222;
    }
  }
  .pol-ltl-th {
    font-size: 12px;
    font-weight: 600;
    color: #222222;
  }
  .relate-cargo-dlg {
    thead {
      font-size: 12px;
      font-weight: 600;
      color: #222222;
    }
  }

  .el-col-4 {
    width: 20%;
  }
  border-top: 12px solid #f5f7f9;
  .el-checkbox__label {
    display: inline-block;
    padding-left: 6px;
    line-height: 19px;
    font-size: 12px;
  }
  .row-body {
    padding: 10px 20px;
    .el-form-item {
      display: flex;
      margin-bottom: 4px;
      margin-right: 1px;
    }
    .el-form-item__content {
      flex: 1;
      margin-right: 0px;
      padding-left: 2px;
    }
    .el-form-item__label {
      text-align: right;
      width: 80px;
      flex-grow: 0;
      flex-shrink: 0;
      padding: 0;
    }
    .row-tit,
    .row-table {
      padding: 0 !important;
    }
  }
  .el-form--label-top .el-form-item__label {
    float: left;
  }
  .el-autocomplete {
    display: block;
  }
}
</style>
