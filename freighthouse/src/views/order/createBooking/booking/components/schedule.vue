<!--
 * @Author: Sivan
 * @Date: 2022-05-18 11:32:33
 * @LastEditTime: 2022-05-19 17:40:30
 * @LastEditors: Sivan
-->
<template>
  <el-dialog
    title="ship schedule"
    :visible.sync="scheduleOptions.show"
    width="1000px"
    class="schedule-dialog"
    :before-close="cancle"
  >
    <el-form :model="form" ref="form" class="form" :rules="rules" :inline="true" size="mini">
      <el-form-item label="Carrier:" prop="company">
        <el-select v-model="form.company" placeholder="Select One" clearable filterable>
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.baseCarrierCode"
            v-for="item in carrierList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Port of Load" prop="orgin">
        <el-select
          v-model="form.orgin"
          placeholder="Select One"
          clearable
          filterable
          remote
          :remote-method="
            (query) => {
              getCityList(query, 1)
            }
          "
        >
          <el-option
            :key="item.cityUnCode"
            :label="`${item.cityName}, ${item.countryName} (${item.cityUnCode})`"
            :value="item.cityUnCode"
            v-for="item in polCityList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Port of Discharge" prop="destination">
        <el-select
          v-model="form.destination"
          placeholder="Select One"
          clearable
          filterable
          remote
          :remote-method="
            (query) => {
              getCityList(query, 2)
            }
          "
        >
          <el-option
            :key="item.cityUnCode"
            :label="`${item.cityName}, ${item.countryName} (${item.cityUnCode})`"
            :value="item.cityUnCode"
            v-for="item in podCityList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getData">Search</el-button>
      </el-form-item>
    </el-form>
    <FinanceTableMass v-loading="loading" :option="option1" :autoMax="true" />
  </el-dialog>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { schedule } from '@/api/order/createBooking'
import { cityList } from '@/api/order/createBooking'
export default {
  inject: ['carrierSource'],
  mixins: [mixin],
  components: {
    FinanceTableMass,
  },
  props: {
    scheduleOptions: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      form: {
        company: '',
        destination: '',
        orgin: '',
      },
      rules: {
        company: {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        destination: {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        orgin: {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
      },
      option1: {},
      loading: false,
      polCityList: [],
      podCityList: [],
      carrierList: [],
    }
  },
  created() {
    let { pol:orgin, pod:destination, carrierCode:company , carrierList, polCityList, podCityList } = this.scheduleOptions
    Object.assign(this.form, {
      orgin,
      destination,
      company
    })
    this.carrierList.splice(0,100,...carrierList)
    this.polCityList.splice(0,100,...polCityList)
    this.podCityList.splice(0,100,...podCityList)
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      title: 'Action',
      width: '100px',
      show: true,
      data: [
        {
          label: 'select',
          action: 'select',
          show: true,
        },
      ],
      fixed: 'right',
      callback: (action, $index, row, option) => {
        if (action === 'select') {
          this.submit(row)
        }
      },
    })
    const pagination = Object.assign({}, this.option.pagination, {
      pageSize: 10,
      currentPage: 1,
      show: true,
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      columns: [
        {
          prop: 'vesselName',
          label: 'Vessel',
          type: 'text',
        },
        {
          prop: 'voyage',
          label: 'Voyage',
          type: 'text',
        },
        {
          prop: 'orignPort',
          label: 'OrignPort',
          type: 'text',
        },
        {
          prop: 'destinationPort',
          label: 'DestinationPort',
          type: 'text',
        },
        {
          prop: 'etd',
          label: 'ETD',
          type: 'text',
        },
        {
          prop: 'eta',
          label: 'ETA',
          type: 'text',
        },
      ],
      tips: {
        text: '',
        show: false,
      },
      selection: {
        text: '',
        show: false,
      },
      operationBtns,
      pagination,
    })
  },
  methods: {
    getData() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true
          let data = {
            ...this.form,
            // company: 'cma',
            // destination: 'sgsgp',
            // orgin: 'cnshk',
            page: this.option1.pagination.currPage,
            rows: this.option1.pagination.pageSize,
          }
          schedule(data)
            .then((res) => {
              this.option1.data = res.data
              this.option1.pagination.currPage = res.currentPage || 1
              this.option1.pagination.totalCount = res.totalSize || 0
            })
            .catch(() => {})
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
    // 分页页面数量change   有分页必写此方法
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    // 分页改变当前页   有分页必写此方法
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    // 港口下拉
    getCityList(str = '', type) {
      if (!str) {
        return
      }
      const data = {
        keyword: str,
        carrierSource: this.carrierSource,
      }
      cityList(data)
        .then((res) => {
          if (res.code === 0) {
            if (type === 1) {
              this.polCityList = res.data || []
            }
            if (type === 2) {
              this.podCityList = res.data || []
            }
          }
        })
        .catch(() => {})
        .finally(() => {
        })
    },
    cancle() {
      this.$emit('cancle')
    },
    submit(row) {
      this.$emit('submit', row)
    },
  },
  mounted() {
    this.$nextTick(()=>{
      this.getData()
    })
  }
}
</script>

<style lang="scss" scoped>
.form {
  display: flex;
  justify-content: space-between;
}
/deep/ .el-button--mini {
  padding: 4px 10px;
}
</style>
