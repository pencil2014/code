<template>
  <div class="table-com-layout">
    <BaseDialog :config="dialogConfig" :callback="dialogCallback">
      <el-form id="polLtlDeliveryInfo" ref="form" :rules="rules" :model="formData">
        <el-row>
          <el-col :span="6">
            <el-form-item label="发货单位" prop="shipperId" :show-message="false">
              <el-select v-model="formData.shipperId" filterable clearable @visible-change="customerSearch" @filter-method="customerSearch" @change="handleChangeCustId" size="mini" style="width:100%">
                <el-option v-for="(ele, index) in custOptions" :key="index" :label="ele.label" :value="ele.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="提货时间" prop="deliveryTime" :show-message="false">
              <elDatePickerLimit size="mini" v-model="formData.deliveryTime" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="提货联系人" prop="deliveryContact">
              <el-input size="mini" placeholder="请输入" maxlength="16" v-model="formData.deliveryContact" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="提货联系方式" prop="deliveryPhone">
              <el-input size="mini" placeholder="请输入" maxlength="16" v-model="formData.deliveryPhone" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="提货地点" prop="deliveryArea">
              <el-cascader style="width:100%" size="mini" :emitPath="true" v-model="formData.deliveryArea" :options="loadPlaceData" :props="cityProps" clearable @change="handleLoadChange"></el-cascader>
            </el-form-item>
          </el-col>

          <el-col :span="18">
            <el-form-item label="提货详情地址" prop="deliveryAddress" :show-message="false">
              <el-input type="textarea" rows="1" size="mini" maxlength="128" placeholder="请输入" v-model="formData.deliveryAddress" clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="row-tit between h32">
          <div class="ft14 tit"></div>
          <div class="row-tit-operate">
            <el-button size="mini" type="primary" @click="handleAddCargo" :disabled="isBd">关联货物信息</el-button>
          </div>
        </div>
        <el-table header-row-class-name="pol-ltl-th" ref="cargo" fit highlight-current-row style="width: 100%" class="outPlanBoxTable" @selection-change="handleCargoChange" :data="tableData">
          <!-- <el-table-column type="selection" width="55"> </el-table-column> -->
          <el-table-column prop="cname" label="中文品名" align="center">
            <!--  @input="checkCname('cname', scope.row)" -->
            <template slot-scope="scope">
              <el-input size="mini" placeholder="请输入中文品名" maxlength='64' v-model="scope.row.cname" clearable></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="ename" label="英文品名" align="center">
            <template slot-scope="scope">
              <el-input size="mini" placeholder="请输入英文品名" maxlength='64' v-model="scope.row.ename" @input="checkEname('ename', scope.row)" clearable></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="件数" align="center">
            <template slot-scope="scope">
              <el-input size="mini" placeholder="请输入件数" v-model="scope.row.quantity" clearable @input="checkIntegerQuantity('quantity', scope.row)"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="weight" label="毛重(KGS)" align="center">
            <template slot-scope="scope">
              <el-input size="mini" placeholder="请输入毛重" v-model="scope.row.weight" clearable @input="checkNumInputMaxVal('weight', scope.row,'毛重')"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="volume" label="体积(CBM)" align="center">
            <template slot-scope="scope">
              <el-input size="mini" placeholder="请输入体积" v-model="scope.row.volume" clearable @input="checkNumInputMaxVal('volume', scope.row,'体积')"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="packageInfo" label="包装" align="center">
            <template slot-scope="scope">
              <el-select v-model="scope.row.packageInfo" size="mini" filterable placeholder="请选择包装">
                <el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="length" label="长（M)" align="center">
            <template slot-scope="scope">
              <el-input size="mini" placeholder="请输入长" v-model="scope.row.length" clearable @input="checkNumInput('length', scope.row)"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="width" label="宽（M）" align="center">
            <template slot-scope="scope">
              <el-input size="mini" placeholder="请输入宽" v-model="scope.row.width" clearable @input="checkNumInput('width', scope.row)"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="height" label="高（M）" align="center">
            <template slot-scope="scope">
              <el-input size="mini" placeholder="请输入高" v-model="scope.row.height" clearable @input="checkNumInput('height', scope.row)"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center" fixed="right">
            <template slot-scope="scope">
              <div class="operate-group">
                <el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd">取消关联</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <!-- <div class="pol-ltl-pagianation">
					<div>已选择{{ selectCargos.length }}条记录</div>
					<el-pagination small @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[10, 20, 30, 40]" :page-size="10" layout="total, sizes, prev, pager, next, jumper" :total="tbDataTotal">
					</el-pagination>
				</div> -->
      </el-form>
    </BaseDialog>
    <el-dialog width="80%" title="关联货物信息" :visible.sync="dialogCargoVisible">
      <el-table header-row-class-name="pol-ltl-th" @selection-change="handleSelectionChange" :data="cargoData">
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column prop="cname" label="中文品名" align="center"> </el-table-column>
        <el-table-column prop="ename" label="英文品名" align="center"> </el-table-column>
        <el-table-column prop="quantity" label="件数" align="center"> </el-table-column>
        <el-table-column prop="weight" label="毛重(KGS)" align="center"> </el-table-column>
        <el-table-column prop="volume" label="体积(CBM)" align="center"> </el-table-column>
        <el-table-column prop="packageInfo" label="包装" align="center"> </el-table-column>
        <el-table-column prop="length" label="长（M)" align="center"> </el-table-column>
        <el-table-column prop="width" label="宽（M）" align="center"> </el-table-column>
        <el-table-column prop="height" label="高（M）" align="center"> </el-table-column>
      </el-table>
      <div class="pol-ltl-pagianation">
        <div>已选择{{ selectRelates.length }}条记录</div>
        <!-- <el-pagination
					small
					@size-change="relateSizeChange"
					@current-change="relateCurrentChange"
					:current-page="relateCurrentPage"
					:page-sizes="[10, 20, 30, 40]"
					:page-size="10"
					layout="total, sizes, prev, pager, next, jumper"
					:total="relateDataTotal"
				>
				</el-pagination> -->
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogCargoVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="dialogCargoConfirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import store from '@/store'
import { mapState } from 'vuex'
// import { validatePhone } from '@/utils/validate'
import BaseDialog from '@/components/Base/Dialog/index'
import { cargoHscodeList } from '@/api/base'
import { airCargoList } from '@/api/airTransport/order'
import { getDomesticCity } from '@/api/base'
const defaultFormData = {
  shipperId: '',
  shipperName: ''
}
var timer = ''
export default {
  data() {
    return {
      cityProps: {
        value: 'cname',
        label: 'cname',
        children: 'children'
      },
      selectCargos: [],
      selectRelates: [],
      tbDataTotal: 0,
      relateDataTotal: 0,
      currentPage: 1,
      relateCurrentPage: 1,
      cargoData: [],
      dialogCargoVisible: false,

      dialogConfig: {
        title: this.addressData.oid ? '编辑提货信息' : '新增提货信息',
        show: true,
        size: 'medium',
        width: '80%'
      },
      formData: Object.assign({}, defaultFormData),
      rules: {
        deliveryArea: [{ required: true, message: ' ', trigger: 'blur' }],
        deliveryAddress: [{ required: true, message: ' ', trigger: 'blur' }],
        deliveryTime: [{ required: true, message: ' ', trigger: 'blur' }]
      },
      tableData: [],
      custOptions: [],
      hscodeOptions: [],
      loadPlaceData: []
    }
  },
  props: {
    addressData: {
      type: Object,
      default: () => ({})
    },
    addressType: {
      type: String,
      default: ''
    }
  },
  watch: {},
  created() {
    this.init()
    this.getLoadPlaceData()
  },

  mounted() {},

  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      orderNo: (state) => state.order.orderNo,
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole
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
    }
  },
  components: {
    BaseDialog
  },
  methods: {
    checkCname(prop, row) {
      let value = row.cname
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (value) {
          let reg = /^[\u4e00-\u9fa50-9]+$/
          if (value) {
            let result = value.replace(/\s+/g, '')
            if (!reg.test(result)) {
              row[prop] = ''
              this.$message({
                message: `中文品名请输入中文、空格和数字`,
                type: 'error',
                duration: 2000
              })
            }
          }
        }
      }, 800)
    },
    checkEname(prop, row) {
      let value = row.ename
      clearTimeout(timer)
      timer = setTimeout(() => {
        let reg =
          /^[a-z_A-Z0-9-\.!@#\$%\\\^&\*\)\(\+=\{\}\[\]\/",'<>~\·`\?:;|]+$/
        if (value) {
          let result = value.replace(/\s+/g, '')
          if (!reg.test(result)) {
            row[prop] = ''
            this.$message({
              message: `英文品名请输入英文、数字、空格和英文符号`,
              type: 'error',
              duration: 2000
            })
          }
        }
      }, 800)
    },
    checkIntegerQuantity(prop, row) {
      let value = row.quantity
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (value) {
          let reg = /^([1-9][0-9]*)$/
          if (!reg.test(value)) {
            row[prop] = ''
            this.$message({
              message: `件数请输入大于0的整数`,
              type: 'error',
              duration: 2000
            })
          } else if (value > 9999999) {
            row[prop] = 9999999
            this.$message({
              message: `件数不能超过9999999`,
              type: 'error',
              duration: 2000
            })
          }
        }
        if (row.length && row.width && row.height && row.quantity) {
          row.volume = Number(
            row.length * row.width * row.height * row.quantity
          ).fixed(3)
        }
        if (row.length * row.width * row.height * row.quantity > 9999999) {
          this.$message({
            message: `体积不能大于9999999`,
            type: 'error'
          })
        }
      }, 800)
    },
    checkNumInputMaxVal(prop, row, type) {
      let value = row[prop]
      clearTimeout(timer)
      timer = setTimeout(() => {
        let reg =
          /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,3}|[1-9][0-9]*\.\d{1,3})))$/
        if (!value) {
        } else if (!reg.test(value) || value > 999999) {
          if (isNaN(value)) {
            row[prop] = ''
          } else if (value > 999999) {
            row[prop] = 999999
          } else {
            row[prop] = Number(value).toFixed(3)
          }
          this.$message({
            message: `${type}请输入不超过999999的数字，小数点最多3位`,
            type: 'error',
            duration: 2000
          })
        }
      }, 800)
    },
    checkNumInput(prop, row) {
      let value = row[prop]
      clearTimeout(timer)
      timer = setTimeout(() => {
        let reg =
          /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/
        if (!value) {
        } else if (!reg.test(value) || value > 999999) {
          if (isNaN(value)) {
            row[prop] = ''
          } else if (value > 999999) {
            row[prop] = 999999
          } else {
            row[prop] = Number(value).toFixed(2)
          }
          this.$message({
            message: '长、宽、高请输入不超过999999的数字，小数点最多2位',
            type: 'error',
            duration: 2000
          })
        }
        // else {
        if (row.length && row.width && row.height && row.quantity) {
          row.volume = Number(
            row.length * row.width * row.height * row.quantity
          ).fixed(3)
        }
        if (row.length * row.width * row.height * row.quantity > 9999999) {
          this.$message({
            message: `体积不能大于9999999`,
            type: 'error'
          })
        }
        // }
      }, 800)
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
    relateSizeChange(val) {},
    relateCurrentChange(val) {},
    handleSizeChange(val) {},
    handleCurrentChange(val) {},

    handleCargoChange(val) {
      this.selectCargos = val
    },
    handleSelectionChange(val) {
      this.selectRelates = val
    },
    validateNum(val, row) {
      if (row[val] > 999999) {
        row[val] = 999999
        this.$message.warning('最大不能超过999999')
      }
    },
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          return (sums[index] = '合计')
        }
        const values = data.map((item) => Number(item[column.property]))
        if (
          column.property === 'quantity' ||
          column.property === 'weight' ||
          column.property === 'volume'
        ) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)
          sums[index]
        }
      })
      return sums
    },
    // 客户模糊查询
    customerSearch(val) {
      this.$store
        .dispatch('dict/queryCustomerList', val === true ? '' : val)
        .then((data) => {
          let list = data.list
          this.custOptions = list.map((o) => {
            return {
              value: o.custid ? Number(o.custid) : '',
              label: this.$language == 'en' ? o.ename : o.name
            }
          })
        })
    },
    handleChangeCustId(val) {
      let findItem = this.custOptions.find((item) => item.value === val)
      this.formData.shipperName = findItem ? findItem.label : ''
    },
    // hscode模糊查询
    queryCargoHscode(queryString) {
      queryString &&
        cargoHscodeList({ keyword: queryString }).then((response) => {
          this.hscodeOptions = response.data.map((item) => {
            return Object.assign(item, {
              label: item.cargoDesc,
              value: item.hscode
            })
          })
        })
    },
    handleChangeHscode(val) {
      if (!val) this.hscodeOptions = []
    },
    init() {
      this.formData = Object.assign({}, defaultFormData, this.addressData)
      this.tableData = [...this.addressData.airTakeCargos]
      this.tableData = this.tableData.map((item) => {
        if (item.packageInfo) {
          item.packageInfo = item.packageInfo.toUpperCase()
        }
        return item
      })
      this.tbDataTotal = this.tableData.length
      this.custOptions = [
        { label: this.formData.shipperName, value: this.formData.shipperId }
      ]
    },
    dialogCargoCancel() {
      this.dialogCargoVisible = false
      this.selectRelates = []
    },
    dialogCargoConfirm() {
      this.dialogCargoVisible = false
      this.tableData = [...this.tableData, ...this.selectRelates]
      this.tbDataTotal = this.tableData.length
    },
    handleAddCargo() {
      airCargoList({
        orderNo: this.$route.query.orderNo
        // orderNo: 'S2020105280001'
      }).then((res) => {
        this.cargoData = res.data.predictCargos
        this.relateDataTotal = this.cargoData.length
        this.dialogCargoVisible = true
      })
    },
    // 删除货物箱
    handleDelete(row, sIndex) {
      this.$confirm('是否确认删除该条数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.tableData = this.tableData.filter(
            (item, index) => index !== sIndex
          )
        })
        .catch((err) => {
          console.log('err')
        })
    },
    close(action, value) {
      this.$emit('close', action, value)
    },
    // 校验
    validate(values) {
      let numberReg = /^[0-9]+$/,
        reg = /^\d+(\.\d+)?$/
      let quantityValid = values.some((item) => !numberReg.test(item.quantity))
      let weightValid = values.some((item) => !reg.test(item.weight))
      let volumeValid = values.some((item) => !reg.test(item.volume))
      if (!values.length) {
        this.$message({ type: 'error', message: '请选择货品' })
        return false
      }
      // if (values.some(item => !item.hscode)) {
      // 	this.$message({ type: 'error', message: '请选择正确的HS code' })
      // 	return false
      // }
      if (values.some((item) => !item.cname)) {
        this.$message({ type: 'error', message: '请输入中文品名' })
        return false
      }
      if (values.some((item) => !item.ename)) {
        this.$message({ type: 'error', message: '请输入英文品名' })
        return false
      }
      if (values.some((item) => !item.quantity || quantityValid)) {
        this.$message({ type: 'error', message: '请填写正确的货品件数' })
        return false
      }
      if (values.some((item) => !item.packageInfo)) {
        this.$message({ type: 'error', message: '请选择包装' })
        return false
      }
      return true
    },
    dialogCallback(action, done) {
      // 保存
      if (action === 'Confirm') {
        this.$refs.form.validate((valid) => {
          if (valid) {
            if (!this.validate(this.tableData)) return
            let data = { ...this.formData }
            let airTakeCargos = JSON.parse(JSON.stringify(this.tableData))
            console.log(airTakeCargos)
            data.airTakeCargos = airTakeCargos.map((item) => {
              return {
                cargoId: item.oid || item.cargoId,
                cname: item.cname,
                ename: item.ename,
                quantity: item.quantity,
                weight: item.weight,
                volume: item.volume,
                packageInfo: item.packageInfo,
                length: item.length,
                width: item.width,
                height: item.height
              }
            })
            this.close('Confirm', data)
          } else {
            console.log('error submit!!')
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    }
  }
}
</script>

<style lang="scss">
.pol-ltl-th {
  font-size: 12px;
  font-weight: 600;
  color: #222222;
}
.pol-ltl-pagianation {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  font-size: 12px;
}
#polLtlDeliveryInfo {
  .el-table__body tr.current-row > td {
    background-color: unset;
  }
  .el-form-item {
    display: flex;
    .el-form-item__label {
      width: 100px;
    }
    .el-form-item__content {
      flex: 1;

      .el-input {
        width: 100%;
      }
    }
  }
  .el-row {
    padding: 10px 0 0 0;
  }
  .el-collapse-item__content {
    padding-top: 10px;
    font-size: 12px;
  }
  .el-form-item__label,
  .el-form-item__content {
    line-height: 20px;
  }
  .row-tit {
    padding: 0 0 !important;
  }
  .inPlanBoxTable {
    margin-top: -1px;
  }
  .outPlanBoxTable td {
    border-right: 1px solid #dfe6ec !important;
  }
}
</style>
