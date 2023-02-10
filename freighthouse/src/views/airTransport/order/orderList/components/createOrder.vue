<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="createOrderForm" :rules="rules" :model="createdItem" label-position="right" label-width="80px" class="create-order-form">
      <el-form-item label="业务类型" prop="businessType">
        <el-select v-model="createdItem.businessType" size="mini" clearable placeholder="请选择" @change="handleSelectBusinessType" style="width: 100%">
          <el-option v-for="(item, index) in businessTypeOptions" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="销售" prop="seller">
        <el-select v-model="createdItem.seller" size="mini" filterable clearable placeholder="请选择" @focus="handleClickSeller" style="width: 100%">
          <el-option v-for="item in sellerOptions" :label="item.employeeName" :value="item.employeeId" :key="item.employeeId"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="委托单位" prop="custid">
        <el-select v-model="createdItem.custid" size="mini" clearable :filterable="true" remote @visible-change="custVisibleChange" :remote-method="custFilterMehod" placeholder="请选择" style="width: 100%" @change="handleSelectCustid">
          <el-option v-for="(item, index) in custidOptions" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="客户委托号" prop="custIntrustNo">
        <el-input size="mini" placeholder="请输入1-128位字符的客户委托号" clearable v-model="createdItem.custIntrustNo"></el-input>
      </el-form-item>
      <el-form-item label="服务类型" prop="serviceType">
        <el-select v-model="createdItem.serviceType" size="mini" clearable placeholder="请选择" @focus="handleClickServiceType" style="width: 100%">
          <el-option v-for="item in serviceTypeOptions" :label="item.name" :value="item.serviceType" :key="item.serviceType"></el-option>
        </el-select>
      </el-form-item>
      <!--  ['air_import'].includes(createdItem.businessType) && custClass === 'department'-->
			<el-form-item label="关联出口单" prop="exportOrderNo" v-if="['air_import'].includes(createdItem.businessType) && custClass === 'department'">
				<el-select v-model="createdItem.exportOrderNo" size="mini" clearable placeholder="请选择" filterable remote :remote-method="orderListRemoteMehod" @change="handleSelectOrder" :loading="loading" style="width: 100%">
					<el-option v-for="item in exportOrderArr" :label="item.orderNo" :value="item.orderNo" :key="item.orderNo"></el-option>
				</el-select>
			</el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { baseBusinessList } from '@/api/base'
import { customerList } from '@/api/crm/supplier'
import { orderSellers, mainExportList } from '@/api/order/list'

const defaultCreate = {
  businessType: '',
  seller: null,
  custid: null,
  custIntrustNo: '',
  cargoSource: '',
  serviceType: '',
  exportOrderNo: ''
}

export default {
  data() {
    return {
      dialogConfig: {
        title: '创建订单',
        show: true,
        size: 'medium',
        width: '400px'
      },

      createdItem: Object.assign({}, defaultCreate),

      businessTypeOptions: [],
      sellerOptions: [],
      custidOptions: [],
      serviceTypeOptions: [],
      rules: {
        businessType: [{ required: true, message: ' ', trigger: 'change' }],
        seller: [{ required: true, message: ' ', trigger: 'change' }],
        custid: [{ required: true, message: ' ', trigger: 'change' }],
        cargoSource: [{ required: true, message: ' ', trigger: 'change' }],
        serviceType: [{ required: true, message: ' ', trigger: 'change' }],
        custIntrustNo: [
          { required: false, message: ' ', trigger: 'change' },
          { max: 128, message: ' ', trigger: 'change' }
        ]
      },
      custClass: '',	// 委托单位客户类型
      custCode: '',		// 委托单位code
      exportOrderArr: [], 	// 关联出口单下拉
      loading: false,
      timerTr: null
    }
  },
  props: {
    param: {
      type: Object
    }
  },
  created() {
    this.getBusinessType()
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      userId: (state) => state.user.userId,
      roles: (state) => state.user.roles
    })
  },
  watch: {},
  components: {
    BaseDialog
  },
  methods: {
    // custIntrustNoChange(val) {
    //   if (val.length > 128) {
    //     this.$message.error('客户委托号最大长度为128位')
    //   }
    // },
    // orderListVisibleChange(val) {
		// 	this.getExportOrderList('')
		// },
		orderListRemoteMehod(val) {
			this.getExportOrderList(val)
		},
		getExportOrderList(queryString) {
      if (!queryString) {
				this.exportOrderArr = []
			} else {
        this.loading = true
        let data = {
          code: this.custCode,
          businessType: this.createdItem.businessType,
          orderNo: queryString
        }
        mainExportList(data).then(res => {
          this.loading = false
          this.exportOrderArr = res.data
        }).catch(err => {
					this.loading = false
				})
      }
		},
		handleSelectOrder(val) {

		},
    getBusinessType() {
      // 业务类型
      baseBusinessList().then((res) => {
        let { data } = res
        this.businessTypeOptions = data
          .filter((item) => item.business === 'air')
          .map((item) => {
            return Object.assign(item, {
              label: item.name,
              value: item.businessType
            })
          })
      })
    },

    close(action, value, type) {
      this.$emit('close', action, value, type)
    },
    handleSelectBusinessType(val) {
      if (val) {
        this.businessTypeOptions.map((item) => {
          if (item.businessType === val) {
            this.serviceTypeOptions = item.serviceTypeList.filter(ele => !['st15','st16','st17','st18','st19','st20','st21','st22'].includes(ele.serviceType))
          }
        })
        this.getSellers(val)
      } else {
        this.sellerOptions = []
        this.serviceTypeOptions = []
      }
      this.createdItem.serviceType = ''
    },

    handleClickSeller() {
      if (!this.createdItem.businessType) {
        return this.$message.warning('请先选择业务类型')
      }
    },
    // 获取销售
    getSellers(val = '') {
      let data = {
        businessType: val
      }
      orderSellers(data).then((res) => {
        this.sellerOptions = res.data
        if (this.roles.includes('bd')) {
          this.createdItem.seller = this.userId
        }
      })
    },

    custFilterMehod(val) {
      console.log(1)
      if (this.createdItem.seller) {
        this.debounceLxz(() => {
          this.getCustList(val)
        })
      }
    },

    custVisibleChange(val) {
      if (val) {
        if (!this.createdItem.seller) {
          return this.$message.warning('请先选择销售')
        }
        this.getCustList()
      }
    },

    handleSelectCustid(val) {
			let findItem = this.custidOptions.find(item => item.value === val)
			this.custClass = findItem ? findItem.custClass : ''
			this.custCode = findItem ? findItem.code : ''
			console.log('this.custClass', this.custClass, this.custCode)
    },
    debounceLxz(fn, time = 800) {
			clearTimeout(this.timerTr)
			this.timerTr = setTimeout(() => {
				if (!fn || !(fn instanceof Function)) {
					this.$message({ message: '参数错误！', type: 'error', showClose: true })
				} else {
					fn()
				}
			}, time)
		},
    // 获取委托单位
    getCustList(val = '') {
      if (!val) return
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
              },
              { column: 'roleType', type: 'eq', value: 'client' }
            ]
          : [
              {
                column: 'bdEmployeeId',
                type: 'eq',
                value: this.createdItem.seller
              },
              { column: 'roleType', type: 'eq', value: 'client' }
            ]
      }
      customerList(data).then((res) => {
        this.custidOptions = res.data.list.map((o) => {
          return {
            ...o,
            value: o.custid,
            label: o.name
          }
        })
      })
    },

    // handleSelectCargoSource() {},

    handleClickServiceType() {
      if (!this.createdItem.businessType) {
        return this.$message.warning('请先选择业务类型')
      }
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.createOrderForm.validate((valid) => {
          if (valid) {
            this.handleCreateOrder(done)
          } else {
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
      done()
      this.close('Confirm', this.createdItem)
    }
  }
}
</script>

<style lang="scss">
</style>
