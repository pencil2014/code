<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="createOrderForm" :rules="rules" :model="createdItem" label-position="right" label-width="80px" class="dzg-create">
      <el-form-item label="业务类型" prop="businessType" :show-message="false">
        <el-select v-model="createdItem.businessType" size="mini" clearable placeholder="请选择" @change="handleSelectBusinessType" style="width: 100%">
          <el-option v-for="(item, index) in businessTypeOptions" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="销售" prop="seller" :show-message="false">
        <el-select v-model="createdItem.seller" size="mini" filterable clearable placeholder="请选择" @focus="handleClickSeller" @change="handleSelectSeller" style="width: 100%">
          <el-option v-for="item in sellerOptions" :label="item.employeeName" :value="item.employeeId" :key="item.employeeId"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="委托单位" prop="custid" :show-message="false">
        <el-select v-model="createdItem.custid" size="mini" clearable :filterable="true" @visible-change="custVisibleChange" :filter-method="custFilterMehod" placeholder="请选择" @change="handleSelectCustid" style="width: 100%">
          <el-option v-for="(item, index) in custidOptions" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="客户委托号" prop="custIntrustNo">
        <el-input size="mini" placeholder="请输入1-128位字符的客户委托号" clearable v-model="createdItem.custIntrustNo"></el-input>
      </el-form-item>
      <!-- <el-form-item label="货物来源" prop="cargoSource" :show-message="false">
        <el-select v-model="createdItem.cargoSource" size="mini" clearable placeholder="请选择" @change="handleSelectCargoSource" style="width: 100%">
          <el-option v-for="item in cargoSourceOptions" :label="item.label" :value="item.value" :key="item.value"></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item label="服务类型" prop="serviceType" :show-message="false">
        <el-select v-model="createdItem.serviceType" size="mini" clearable placeholder="请选择" @focus="handleClickServiceType" @change="handleSelectServiceType" style="width: 100%">
          <el-option v-for="item in serviceTypeOptions" :label="item.name" :value="item.serviceType" :key="item.serviceType"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="船期" prop="sailingDate" :show-message="false">
        <el-popover ref="sailingDatePopover" v-model="visible" popper-class="sailingDate-pop" placement="bottom" width="600" trigger="click">
          <el-table :data="sailingDateOptions" ref="sailingDateTable" highlight-current-row @current-change="handleCurrentChange" :max-height="300">
            <el-table-column prop="cutDate" label="截文件日期" align="center">
              <template slot-scope="scope">
                <span class="tabel-data">{{scope.row.cutDate.substring(0,10)}}</span><span>{{scope.row.cutWeek}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="cyCutOff" label="截关日期" align="center">
              <template slot-scope="scope">
                <span class="tabel-data">{{scope.row.etc.substring(0,10)}}</span><span>{{scope.row.etcWeek}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="etd" label="开船日期" align="center">
              <template slot-scope="scope">
                <span class="tabel-data">{{scope.row.etd.substring(0,10)}}</span><span>{{scope.row.etdWeek}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="sailtime" label="航程(天)" align="center"></el-table-column>
          </el-table>
          <el-select @visible-change="sailingVisible" class="dropdown-select" v-model="createdItem.sailingDate" size="mini" clearable placeholder="请选择" slot="reference" :automatic-dropdown="false" style="width: 100%; background-color: #fff" popper-class="sailingDate-select"></el-select>
        </el-popover>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { baseBusinessList } from '@/api/base'
import { dzgShipTime, dzgPgDataList } from '@/api/charge/route'
import { customerList } from '@/api/crm/supplier'
import { orderSellers } from '@/api/order/list'

const defaultCreate = {
  businessType: 'ship_export_fcl',
  seller: null,
  custid: null,
  custIntrustNo: '',
  // cargoSource: '',
  serviceType: '',
  cyCutOff: '',
  voyage: '',
  etdTime: '',
  sailingDate: '',
  shipCarrierCode: '',
  porPortCode: '',
  polPortCode: '',
  transitPortCode: '',
  podPortCode: ''
}

export default {
  data() {
    return {
      state: 'valid',
      dialogConfig: {
        title: '创建订单',
        show: true,
        size: 'medium',
        width: '650px'
      },

      createdItem: Object.assign({}, defaultCreate),

      businessTypeOptions: [],
      sellerOptions: [],
      custidOptions: [],
      serviceTypeOptions: [],

      includesFeeder: this.isFeederRoute,

      // 是否包含驳船
      includesFeederOptions: {
        y: '是',
        n: '否'
      },
      sailingDateOptions: [],

      rules: {
        businessType: [
          { required: true, message: '请选择业务类型', trigger: 'change' }
        ],
        seller: [{ required: true, message: '请选择销售', trigger: 'change' }],
        custid: [
          { required: true, message: '请选择委托单位', trigger: 'change' }
        ],
        // cargoSource: [
        //   { required: true, message: '请选择货物来源', trigger: 'change' }
        // ],
        serviceType: [
          { required: true, message: '请选择服务类型', trigger: 'change' }
        ],
        custIntrustNo: [
          { required: false, message: '', trigger: 'change' },
          { max: 128, message: ' ', trigger: 'change' }
        ]
        // sailingDate: [
        //   { required: true, message: '请选择船期', trigger: 'change' }
        // ]
      },
      currentRow: null,
      visible: false
    }
  },
  props: {
    currentData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  created() {
    this.getBusinessType()
    this.getSailingDate()
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap
    }),
    cargoSourceOptions() {
      let cargoSource = this.dictMap.cargoSource
      cargoSource = cargoSource.filter((item) => item.value !== 'customer')
      return cargoSource
    }
  },
  watch: {},
  components: {
    BaseDialog
  },
  methods: {
    sailingVisible(el){
      console.log(el)
      if(el){
        setTimeout(()=>{
          this.$refs.sailingDatePopover.doShow()
        },300)
      }else{
        this.$refs.sailingDatePopover.doClose()
      }
    },
    setCurrent(row) {
      this.$refs.sailingDateTable.setCurrentRow(row)
    },
    handleCurrentChange(val) {
      this.currentRow = val
      Object.assign(this.createdItem, {
        cyCutOff: val.etc.substring(0, 10),
        voyage: val.sailtime,
        etdTime: val.etd.substring(0, 10),
        siCutOff: val.cutDate.substring(0, 10),
        sailingDate: `截文件日期:【${val.cutDate.substring(0, 10)} ${
          val.cutWeek
        }】,截关日期:【${val.etc.substring(0, 10)} ${
          val.etcWeek
        }】,开船日期:【${val.etd.substring(0, 10)} ${
          val.etdWeek
        }】,航程(天):【${val.sailtime}】`
      })
      this.visible = false
    },
    getBusinessType() {
      baseBusinessList().then((res) => {
        let { data } = res
        this.businessTypeOptions = data
          .filter((item) => item.businessType === 'ship_export_fcl')
          .map((item) => {
            return Object.assign(item, {
              label: item.name,
              value: item.businessType
            })
          })
        this.handleSelectBusinessType('ship_export_fcl')
      })
    },

    getSailingDate() {
      dzgPgDataList({ casenumber: this.currentData.casenumber }).then((res) => {
        this.sailingDateOptions = res.data
      })
    },

    close(action, value, type) {
      this.$emit('close', action, value, type)
    },

    validate() {
      return true
    },

    handleCommand() {},

    handleSelectBusinessType(val) {
      console.log(val)
      if (val) {
        this.businessTypeOptions.map((item) => {
          if (item.businessType === val) {
            // 过滤掉客户自定项
            this.serviceTypeOptions = item.serviceTypeList.filter(
              (ele) => !['st02','st15','st16','st17','st18','st19','st20','st21','st22'].includes(ele.serviceType)
            )
          }
        })
        this.getSellers(val)
        console.log(this.serviceTypeOptions)
      } else {
        this.sellerOptions = []
        this.serviceTypeOptions = []
      }
    },

    handleClickSeller() {
      if (!this.createdItem.businessType) {
        return this.$message.warning('请先选择业务类型')
      }
    },

    handleSelectSeller(val) {},

    // 获取销售
    getSellers(val = '') {
      let data = {
        businessType: val
      }
      orderSellers(data).then((res) => {
        this.sellerOptions = res.data
        console.log(this.sellerOptions)
        if (Array.isArray(this.sellerOptions)) {
          let findItem = this.sellerOptions.find(
            (el) => el.employeeId == this.$store.state.user.userId
          )
          console.log(findItem)
          if (findItem) {
            this.createdItem.seller = this.$store.state.user.userId
          }
        }
      })
    },

    custFilterMehod(val) {
      this.getCustList(val)
    },

    custVisibleChange(val) {
      if (val) {
        if (!this.createdItem.seller) {
          return this.$message.warning('请先选择销售')
        }
        this.getCustList()
      }
    },

    handleSelectCustid() {},

    // 获取委托单位
    getCustList(val = '') {
      let data = {
        currPage: 1,
        pageSize: 50,
        query: val
          ? [
              { column: 'name', type: 'like', value: val },
              {
                column: 'bdEmployeeId',
                type: 'eq',
                value: this.createdItem.seller
              }
            ]
          : [
              {
                column: 'bdEmployeeId',
                type: 'eq',
                value: this.createdItem.seller
              }
            ]
      }
      customerList(data).then((res) => {
        this.custidOptions = res.data.list.map((o) => {
          return {
            value: o.custid,
            label: o.name
          }
        })
      })
    },

    handleSelectCargoSource() {},

    handleClickServiceType() {
      if (!this.createdItem.businessType) {
        return this.$message.warning('请先选择业务类型')
      }
    },

    handleSelectServiceType() {},
    // 大船截关时间,航程,大船预计开船时间非空校验
    validate() {
      let queryObj = {
        cyCutOff: '大船截关时间',
        voyage: '航程',
        etdTime: '大船预计开船时间'
      }
      let message = '',
        valid = false
      Object.keys(queryObj).map((item, index) => {
        if (!this.createdItem[item]) {
          message += index === 0 ? `${queryObj[item]}` : `,${queryObj[item]}`
          valid = true
        }
      })
      if (valid) {
        this.$message({ type: 'error', message: `${message}不能为空` })
        return false
      }
      return true
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.createOrderForm.validate((valid) => {
          if (valid) {
            // if(!this.validate()) return
            this.handleCreateOrder(done)
          } else {
            this.$msgErrClose('红框内为必填项，请补充！')
            console.log('error submit!!')
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    },

    // 新建订单
    handleCreateOrder(done) {
      // done()
      this.close('Confirm', this.createdItem, this.includesFeeder)
    }
  }
}
</script>

<style lang="scss">
.sailingDate-pop {
  padding: 0;
}
.dropdown-select {
  width: 100%;
}
.sailingDate-select {
  display: none;
  opacity: 0;
}
.dzg-create {
  .el-form-item {
    margin-bottom: 4px;
  }
}
.tabel-data {
  display: inline-block;
  margin-right: 4px;
}
</style>
