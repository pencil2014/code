<template>
  <div class="edit-container" id="air-polLtlDetail">
    <div class="component-cont table-com-layout">
      <div class="between btLine">
        <div class="ft12 h20 bold">提货计划编号：{{ createItem.takeNo }}</div>
        <div class="">
          <el-button size="mini" class="ml10" @click="handleCancelDetail">取消</el-button>
          <el-button :disabled="!isOp || detailData.intrustStatus === 'dispatched' || progressValue==='finish'|| isDisabled" size="mini" type="primary" class="ml10" @click="handleSave()">保存</el-button>
        </div>
      </div>
      <el-form ref="saveForm" :model="createItem" :rules="rules" label-position="right" label-width="100px">
        <el-row :gutter="30">
          <el-col :span="6" class="oneFifth">
            <el-form-item label="中港提货号" prop="hkTakeNo">
              <el-input maxlength="16" size="mini" placeholder="请输入" style="width: 100%" v-model="createItem.hkTakeNo" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6" class="oneFifth">
            <el-form-item label="车队" prop="supplierId">
              <el-select style="width: 100%" placeholder="请选择" size="mini" v-model="createItem.supplierId" clearable :filterable="true" remote @visible-change="supplierVisibleChange" :remote-method="supplierFilterMehod" @change="handleSelectSupplierName" :disabled="isBd">
                <el-option v-for="(item, index) in supplierList" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6" class="oneFifth">
            <el-form-item label="车队联系人" prop="supplierContact">
              <el-autocomplete style="width: 100%" size="mini" clearable v-model="createItem.supplierContact" :fetch-suggestions="(queryString, cb) => querySearchContact(queryString, cb)" placeholder="请输入车队联系人" :disabled="isBd" @select="value => handleSelectContact(value)" :maxlength="16"></el-autocomplete>
            </el-form-item>
          </el-col>
          <el-col :span="6" class="oneFifth">
            <el-form-item label="车队电话" prop="supplierPhone">
              <el-input size="mini" placeholder="请输入车队联系人电话" v-model="createItem.supplierPhone" clearable :disabled="isBd" maxlength="16"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6" class="oneFifth">
            <el-form-item label="车牌号" prop="licensePlate">
              <el-input size="mini" placeholder="请输入车牌号" v-model="createItem.licensePlate" clearable :disabled="isBd" maxlength="16"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6" class="oneFifth">
            <el-form-item label="司机" prop="driverName">
              <el-input size="mini" placeholder="请输入司机" v-model="createItem.driverName" clearable :disabled="isBd" maxlength="16"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6" class="oneFifth">
            <el-form-item label="司机电话" prop="driverPhone">
              <el-input size="mini" placeholder="请输入司机电话" v-model="createItem.driverPhone" clearable :disabled="isBd" maxlength="16"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6" class="oneFifth">
            <el-form-item label="进仓编号" prop="whInNo">
              <el-input size="mini" placeholder="请输入进仓编号" v-model="createItem.whInNo" clearable :disabled="isBd" maxlength="16"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6" class="oneFifth">
            <el-form-item label="货物类型" prop="cargoType">
              <el-select size="mini" placeholder="请选择货物类型" v-model="createItem.cargoType" clearable style="width: 100%">
                <el-option v-for="item in dictMap.cargoProperty" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6" class="oneFifth">
            <el-form-item label="送货时间" prop="deliveryTime">
              <elDatePickerLimit size="mini" v-model="createItem.deliveryTime" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
            </el-form-item>
          </el-col>
          <el-col :span="6" class="oneFifth">
            <el-form-item label="送货地点" prop="deliveryArea">
              <!-- <el-input size="mini" placeholder="请输入送货地点" v-model="createItem.deliveryArea" clearable :disabled="isBd" maxlength="16"></el-input> -->
              <el-cascader style="width:100%" size="mini" :emitPath="true" v-model="createItem.deliveryArea" :options="loadPlaceData" :props="cityProps" clearable @change="handleLoadChange"></el-cascader>
            </el-form-item>
          </el-col>
          <el-col :span="6" class="oneFifth">
            <el-form-item label="送货联系人" prop="deliveryContact">
              <el-input size="mini" placeholder="请输入送货联系人" v-model="createItem.deliveryContact" clearable :disabled="isBd" maxlength="16"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6" class="oneFifth">
            <el-form-item label="送货联系方式" prop="deliveryPhone">
              <el-input size="mini" placeholder="请输入送货联系方式" v-model="createItem.deliveryPhone" clearable :disabled="isBd" maxlength="16"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6" class="oneFifth">
            <el-form-item label="实际送达时间" prop="realDeliveryTime">
              <elDatePickerLimit noCanFuture  size="mini" v-model="createItem.realDeliveryTime" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item class="area-input" label="送货详情地址" prop="deliveryAddress">
              <el-input type="textarea" :rows="1" size="mini" placeholder="请输入" v-model="createItem.deliveryAddress" clearable :disabled="isBd" maxlength="128"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item class="area-input" label="提货要求" prop="remark">
              <el-input type="textarea" :rows="2" size="mini" placeholder="请输入" v-model="createItem.remark" clearable :disabled="isBd" show-word-limit maxlength="512"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="between mt10">
          <div class="ft14"></div>
          <div class="el-button-group">
            <el-button :disabled="detailData.intrustStatus === 'dispatched' || progressValue==='finish'|| isDisabled" size="mini" type="primary" class="ml10" @click="handleAdd()">新增提货信息</el-button>
          </div>
        </div>
        <!-- {{this.originTableData.length}} -->
        <el-table :span-method="objectSpanMethod" header-row-class-name="pol-ltl-th" ref="table" fit border style="width: 100%;margin-top:4px;" :data="tableData" class="border-table column-table" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
          <el-table-column prop="shipperName" label="发货单位" align="center" width="200"> </el-table-column>
          <el-table-column prop="deliveryTime" label="提货时间" align="center"> </el-table-column>
          <el-table-column prop="deliveryArea" label="提货地点" align="center" width="200">
            <template slot-scope="scope">
              <span class="column-text">{{formatAddressToStr(scope.row.deliveryArea)}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="deliveryAddress" label="提货详情地址" align="center" width="200">
            <template slot-scope="scope">
              <span class="column-text">{{scope.row.deliveryAddress}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="deliveryContact" label="提货联系人" width="150" align="center"></el-table-column>
          <el-table-column prop="deliveryPhone" label="提货联系人方式" width="150" align="center"></el-table-column>
          <el-table-column prop="cname" label="中文品名" align="center"></el-table-column>
          <el-table-column prop="ename" label="英文品名" align="center"></el-table-column>
          <el-table-column prop="quantity" label="件数" align="center"> </el-table-column>
          <el-table-column prop="weight" label="毛重（KGS）" width="100" align="center"></el-table-column>
          <el-table-column prop="volume" label="体积（CBM）" width="100" align="center"></el-table-column>
          <el-table-column prop="packageInfo" label="包装" align="center"> </el-table-column>
          <el-table-column prop="length" label="长（M)" align="center"> </el-table-column>
          <el-table-column prop="width" label="宽（M）" align="center"> </el-table-column>
          <el-table-column prop="height" label="高（M）" align="center"> </el-table-column>
          <el-table-column label="操作" width="200" align="center" fixed="right" v-if="progressValue!=='finish'">
            <template slot-scope="scope">
              <div class="operate-group">
                <el-button @click="handleInfo(scope.row, scope.$index)" type="text" :disabled="detailData.intrustStatus === 'dispatched'|| isDisabled" size="mini">编辑</el-button>
                <el-button @click="handleDelete(scope.row, scope.$index)" class="red" type="text" size="mini" :disabled="detailData.intrustStatus === 'dispatched'|| isDisabled">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
      </el-form>
    </div>
    <div v-if="ltlDeliveryInfoShow">
      <LtlDeliveryInfo @close="ltlDeliveryInfoClose" :addressData="addressData" :addressType="addressType" />
    </div>
    <div v-if="showCargoDialog">
      <CargosDialog :cargosList="cargosList" @close="closeDialog"></CargosDialog>
    </div>
    <div v-if="uploadFileShow">
      <FileUpload :param="uploadFileQuery" @close="uploadFilePopClose"></FileUpload>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
// import { getDictLabel } from '@/utils/tools'
import { supplierInfo } from '@/api/crm/supplier'
import { airTakeAdd, airTakeUpdate } from '@/api/order/shippingTruck'
import LtlDeliveryInfo from './components/ltlDeliveryInfo'
import CargosDialog from './components/cargosDialog'
import FileUpload from './components/fileUpload'
import tableTooltip from '@/components/Base/Table/table-tooltip'
import { getDomesticCity } from '@/api/base'
const defaultCreateQuery = {
  hkTakeNo: '',
  oid: undefined,
  supplierId: '',
  supplierName: '',
  supplierContact: '',
  supplierContactPhone: '',
  supplierPhone: '',
  licensePlate: '',
  driverName: '',
  driverPhone: '',
  whInNo: '',
  cargoType: '',
  deliveryTime: '',
  deliveryArea: '',
  deliveryAddress: '',
  deliveryContact: '',
  deliveryPhone: '',
  realDeliveryTime: '',
  remark: '',
  deliveryArea: []
}
export default {
  filters: {},
  props: {
    detailData: {
      type: Object,
      default: () => ({})
    },
    orderInfo: {
      type: Object,
      default: () => ({})
    },
    progressValue: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    },
    isDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      cityProps: {
        value: 'cname',
        label: 'cname',
        children: 'children'
      },
      originTableData: [],
      spanArr: [],
      oQuery: this.$route.query,
      supplierList: [],
      createItem: Object.assign({}, defaultCreateQuery),
      tableData: [],
      ltlDeliveryInfoShow: false,
      addressType: '',
      addressData: {},
      clickRowIndex: '', // 点击的row索引
      showCargoDialog: false,
      cargosList: [],
      uploadFileShow: false,
      uploadFileQuery: {},
      rules: {
        supplierId: [{ required: true, message: ' ', trigger: 'change' }],
        deliveryTime: [{ required: true, message: ' ', trigger: 'blur' }],
        deliveryArea: [{ required: true, message: ' ', trigger: 'blur' }],
        deliveryAddress: [{ required: true, message: ' ', trigger: 'blur' }]
      },
      tableCellMouse: {
        cellDom: null, // 鼠标移入的cell-dom
        hidden: null, // 是否移除单元格
        row: null // 行数据
      },
      loadPlaceData: []
    }
  },
  created() {
    this.setInit()
    this.getLoadPlaceData()
  },
  mounted() {},

  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      orderNo: (state) => state.order.orderNo,
      custid: (state) => state.order.custid,
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole,
      polLtlDispatchType: (state) => state.orderService.polLtlDispatchType
    }),
    isAc() {
      return this.ordDetRole === 'ac'
    },
    isDoc() {
      return this.ordDetRole === 'doc'
    },
    isOp() {
      return this.ordDetRole === 'op'
    },
    isBd() {
      return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
    },
    viewState() {
      return this.truckDetailQuery.action === 'view' && !this.isOp
    }
  },
  components: {
    LtlDeliveryInfo,
    CargosDialog,
    FileUpload,
    tableTooltip
  },
  watch: {
    detailData: {
      handler(newVal) {
        this.setInit()
      },
      deep: true
    }
  },
  methods: {
    formatAddressToStr(val) {
      if (!val) {
        return ''
      } else {
        let newVal = ''
        if (typeof val == 'string') {
          newVal = JSON.parse(val).join(',')
        } else {
          newVal = val.join(',')
        }
        return newVal
      }
    },
    formatAddressToArr(val) {
      if (!val) {
        return ''
      } else {
        let newVal = ''
        if (typeof val == 'string') {
          newVal = JSON.parse(val)
        } else {
          newVal = val
        }
        return newVal
      }
    },
    //装货地点
    handleLoadChange(val) {
      // this.formData.boxProvince = val[0] || ''
      // this.formData.boxCity = val[1] || ''
      // this.formData.boxDistrict = val[2] || ''
      // console.log('🚀 ~ this.loadPlace', this.formData.loadPlace)
    },
    //处理最后一级children为空数组问题
    handleChildren(data) {
      // 循环遍历json数据
      for (var i = 0; i < data.length; i++) {
        if (data[i].children.length < 1) {
          // children若为空数组，则将children设为undefined
          data[i].children = undefined
        } else {
          // children若不为空数组，则继续 递归调用 本方法
          this.handleChildren(data[i].children)
        }
      }
      return data
    },
    //获取数据
    async getLoadPlaceData() {
      let res = await getDomesticCity({})
      //处理最后一级children空数组
      this.loadPlaceData = this.handleChildren(res.data)
    },
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
    //获取合并单元格每行所占行数 放到数组里
    getSpanArr(data) {
      if (!data) return
      let pos = 0
      this.spanArr = data.reduce((arr, cur, index) => {
        if (index === 0) {
          arr.push(1)
        } else {
          if (data[index].takeInfoId) {
            if (data[index].takeInfoId === data[index - 1].takeInfoId) {
              arr.push(0)
              arr[pos] += 1
            } else {
              arr.push(1)
              pos = index
            }
          } else {
            if (data[index].timestamp === data[index - 1].timestamp) {
              arr.push(0)
              arr[pos] += 1
            } else {
              arr.push(1)
              pos = index
            }
          }
        }
        return arr
      }, [])
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex < 6 || columnIndex === 15) {
        const _row = this.spanArr[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          // [0,0] 表示这一行不显示， [2,1]表示行的合并数
          rowspan: _row,
          colspan: _col
        }
      }
    },
    validContact(val) {
      let message = ''
      message =
        val === 'supplierContact'
          ? '车队联系人'
          : val === 'supplierContactPhone'
          ? '车队联系人电话'
          : ''
      if (this.createItem[val].length > 16) {
        this.createItem[val] = this.createItem[val].slice(0, 16)
        return this.$message.warning(message + '输入不能超过16位字符')
      }
    },
    setInit() {
      this.supplierList = [
        {
          label: this.detailData.supplierName,
          value: this.detailData.supplierId
        }
      ]
      this.createItem = Object.assign({}, defaultCreateQuery, this.detailData)
      if (this.detailData.airTakeInfos) {
        this.tableData = JSON.parse(
          JSON.stringify(this.detailData.airTakeInfos)
        )
        this.originTableData = JSON.parse(JSON.stringify(this.tableData))
        this.tableData =
          this.tableData &&
          this.tableData.map((item) => {
            item = item.airTakeCargos.map((cargo) => {
              return { ...item, ...cargo }
            })
            return item
          })
        this.tableData =
          this.tableData &&
          this.tableData.reduce((a, b) => {
            a = a.concat(b)
            return a
          }, [])
        this.getSpanArr(this.tableData)
      } else {
        this.originTableData = []
        this.tableData = []
      }

      // 获取车队联系人信息
      if (this.createItem.supplierId) {
        supplierInfo({ supplierId: this.createItem.supplierId }).then((res) => {
          let { contact } = res.data
          this.restaurants = this.loadAll(contact)
        })
      }
    },

    supplierFilterMehod(val) {
      this.getSupplierList(val)
    },
    supplierVisibleChange(val) {
      if (val) {
        this.getSupplierList()
      }
    },
    getSupplierList(val = '') {
      this.$store
        .dispatch('dict/querySupplierList', {
          category: 'serviceCode',
          value: 'pick_up',
          queryString: val
        })
        .then((data) => {
          this.supplierList = data.list.map((item) => {
            return Object.assign(item, {
              label: item.name,
              value: item.supplierId ? Number(item.supplierId) : ''
            })
          })
        })
    },
    // 选择车队下拉，自动填充车队联系人，联系电话
    handleSelectSupplierName(val) {
      if (val) {
        let label = this.supplierList.filter((o) => o.value === val)[0].label
        this.createItem.supplierName = label
        supplierInfo({ supplierId: val }).then((res) => {
          let { contact } = res.data
          Object.assign(this.createItem, {
            supplierContact:
              contact && contact.length
                ? contact[0].name || contact[0].ename
                : '',
            supplierContactPhone:
              contact && contact.length ? contact[0].mobileNo : ''
          })
          this.restaurants = this.loadAll(contact)
        })
      } else {
        Object.assign(this.createItem, {
          supplierName: '',
          supplierContact: '',
          supplierContactPhone: ''
        })
      }
    },
    querySearchContact(queryString, cb) {
      let restaurants = this.restaurants
      let results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants
      cb(results)
    },
    handleSelectContact(item) {
      if (item.value) {
        for (let i = 0; i < this.contactInfo.length; i++) {
          if (item.value === this.contactInfo[i].value) {
            Object.assign(this.createItem, {
              supplierContactPhone: this.contactInfo[i].mobileNo
            })
            return
          }
        }
      }
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        )
      }
    },
    loadAll(data) {
      let arr = []
      for (let i = 0; i < data.length; i++) {
        let obj = {}
        obj.value = data[i].name || data[i].ename
        obj.mobileNo = data[i].mobileNo
        arr.push(obj)
      }
      this.contactInfo = arr
      return arr
    },
    handleCancelDetail() {
      this.$emit('hideDetail')
    },
    handleSave() {
      this.$refs.saveForm.validate((valid) => {
        if (valid) {
          let data = Object.assign({}, this.createItem)
          data.orderNo = this.oQuery.orderNo
          data.airTakeInfos = this.originTableData
          data.deliveryArea = JSON.stringify(data.deliveryArea)
          if (!this.tableData.length)
            return this.$message({ type: 'error', message: '提货信息不能为空' })
          if (data.oid) {
            airTakeUpdate(data).then((res) => {
              this.$emit('hideDetail', 'save')
              this.$message({ type: 'success', message: '更新成功' })
            })
          } else {
            airTakeAdd(data).then((res) => {
              this.$emit('hideDetail', 'save')
              this.$message({ type: 'success', message: '添加成功' })
            })
          }
        } else {
          return false
        }
      })
    },
    // 新增提货弹窗
    handleAdd() {
      this.addressType = 'add'
      this.addressData = {
        airTakeCargos: []
      }
      this.ltlDeliveryInfoShow = true
    },
    handleInfo(row, index) {
      let currentTakeInfoId = row.takeInfoId
      let currentTimestamp = row.timestamp
      for (let i = 0; i < this.originTableData.length; i++) {
        // 合并表格后的index 特殊获取
        if (currentTakeInfoId) {
          if (this.originTableData[i].oid === currentTakeInfoId) {
            this.clickRowIndex = i
          }
        } else {
          if (this.originTableData[i].timestamp === currentTimestamp) {
            this.clickRowIndex = i
          }
        }
      }

      this.addressData = Object.assign({}, row)
      // this.clickRowIndex = index
      this.$set(
        this.addressData,
        'deliveryArea',
        this.formatAddressToArr(row.deliveryArea)
      )
      this.addressType = 'info'
      this.ltlDeliveryInfoShow = true
    },
    handleDelete(row, sIndex) {
      this.$confirm('是否确认删除该条数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          let currentTakeInfoId = row.takeInfoId
          let currentTimestamp = row.timestamp
          let clickRowIndex=''
          for (let i = 0; i < this.originTableData.length; i++) {
            // 获取originTableData的下标
            if (currentTakeInfoId) {
              if (this.originTableData[i].oid === currentTakeInfoId) {
                clickRowIndex = i
              }
            } else {
              if (this.originTableData[i].timestamp === currentTimestamp) {
                clickRowIndex = i
              }
            }
          }
          this.originTableData.splice(clickRowIndex, 1);

          if (row.takeInfoId) {
            this.tableData = this.tableData.filter(
              (item, index) => item.takeInfoId !== row.takeInfoId
            )
          } else {
            // 没有id是时候，用新增时增加的timestamp字段判断
            this.tableData = this.tableData.filter(
              (item, index) => item.timestamp !== row.timestamp
            )
          }
          this.getSpanArr(this.tableData)
        })
        .catch((err) => {
          console.log('err')
        })
    },
    ltlDeliveryInfoClose(action, values) {
      if (action === 'Confirm') {
        console.log(this.clickRowIndex)
        if (this.addressType === 'add') {
          let timestamp = Date.parse(new Date())
          this.originTableData.push({ ...values, timestamp: timestamp })
        }
        if (this.addressType === 'info') {
          this.$set(this.originTableData, this.clickRowIndex, values)
          console.log('🚀 ~ this.originTableData', this.originTableData)
        }

        this.tableData = JSON.parse(JSON.stringify(this.originTableData))
        this.tableData =
          this.tableData &&
          this.tableData.map((item) => {
            item = item.airTakeCargos.map((cargo) => {
              return { ...item, ...cargo }
            })

            return item
          })
        this.tableData =
          this.tableData &&
          this.tableData.reduce((a, b) => {
            a = a.concat(b)
            return a
          }, [])

        this.getSpanArr(this.tableData)
      }

      this.ltlDeliveryInfoShow = false
    },
    handleViewCargo(row) {
      this.showCargoDialog = true
      this.cargosList = row.truckCargos
    },
    closeDialog() {
      this.showCargoDialog = false
    },
    handleUpload(row, index) {
      this.uploadFileShow = true
      this.clickRowIndex = index
      Object.assign(this.uploadFileQuery, row, {
        intrustNo: this.createItem.intrustNo
      })
    },
    uploadFilePopClose(action, values) {
      this.uploadFileShow = false
      if (action === 'Confirm') {
        this.$set(
          this.tableData,
          this.clickRowIndex,
          Object.assign(this.tableData[this.clickRowIndex], values)
        )
        // this.$emit('importFile', this.createItem.intrustNo)
      }
    },
    handleDeleteFile(row, index) {
      this.clickRowIndex = index
      this.$confirm('是否确认删除该条数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          let data = {
            intrustNo: this.createItem.intrustNo,
            loadId: row.loadId,
            orderNo: this.$route.query.orderNo,
            jointNo: this.$route.query.jointNo
          }
          return ltlFileDelete(data)
        })
        .then((response) => {
          this.$message({
            message: '删除成功',
            type: 'success',
            duration: 1000,
            onClose: () => {
              this.$set(
                this.tableData,
                this.clickRowIndex,
                Object.assign(this.tableData[this.clickRowIndex], {
                  signFile: '',
                  signFileName: '',
                  signFileNo: '',
                  signTime: ''
                })
              )
            }
          })
        })
        .catch(() => {})
    },
    handleViewFile(row) {
      this.$store.dispatch('order/previewFile', { fileNo: row.signFile, fileName: row.signFileName })
    }
  }
}
</script>
<style lang="scss">
@import '../../less/index.scss';
// #air-polLtlDetail .oneFifth {
// 	width: 20%;
// }
#air-polLtlDetail .el-form-item {
  margin-right: 8px;
  margin-bottom: 4px;
  // display: flex;
  // justify-content: flex-start;
  .el-form-item__label {
    width: 100px;
    flex-shrink: 0;
    flex-grow: 0;
    padding-right: 4px;
  }
  .el-input {
    width: 100%;
  }
}
#air-polLtlDetail .area-input {
  justify-content: flex-start;

  .el-form-item__content {
    flex: 1;
  }
}
#air-polLtlDetail .btLine {
  position: relative;
  padding-bottom: 4px;
  margin-bottom: 10px;
  &:before {
    content: '';
    position: absolute;
    display: block;
    left: -10px;
    right: -10px;
    bottom: 0;
    background-color: #e9e9e9;
    height: 1px;
  }
}
</style>
