<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="calcelOrderForm" :rules="rules" :model="createdItem" label-position="right" label-width="80px" class="cancel-form">
      <el-form-item label="转移地" prop="placeCompCode" :show-message="false">
        <el-select v-model="createdItem.placeCompCode" filterable size="mini" clearable placeholder="请选择" style="width: 100%" @change="changePlaceComp">
          <el-option v-for="(item, index) in companyListOptions" :label="item.label" :value="item.value" :key="index"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="取单人" prop="takeEmployeeId" :show-message="false">
        <el-select v-model="createdItem.takeEmployeeId" remote @visible-change="
						val => {
							getTcEmployeeNameVisible(val)
						}
					" :filter-method="
						val => {
							getTcEmployeeName(val)
						}
					" filterable size="mini" clearable placeholder="请选择" style="width: 100%">
          <el-option v-for="(item, index) in tcEmployeeList" :label="item.cname" :value="item.employeeId" :key="index"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="放单人" prop="putEmployeeId" :show-message="false">
        <el-select v-model="createdItem.putEmployeeId" remote filterable size="mini" @visible-change="
						val => {
							getRcEmployeeNameVisible(val)
						}
					" :filter-method="
						val => {
							getRcEmployeeName(val)
						}
					" clearable placeholder="请选择" style="width: 100%">
          <el-option v-for="(item, index) in rcEmployeeList" :label="item.cname" :value="item.employeeId" :key="index"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="快递类型" prop="expressType" :show-message="false">
        <el-select size="mini" placeholder="请选择" v-model="createdItem.expressType" style="width: 100%" @change="expressTypeChange">
          <el-option v-for="(item, index) in expressTypeOptions" :key="'expressType' + index" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="快递公司" prop="expressSupplierId" :show-message="false">
        <el-select size="mini" remote clearable placeholder="请选择" v-model="createdItem.expressSupplierId" filterable style="width: 100%" @visible-change="visibleChange" :remote-method="filterMehod" @change="handleChangeSupplier">
          <el-option v-for="(item, index) in supplierOptions" :key="'supplier' + index" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="快递单号" prop="expressNo" :show-message="false">
        <el-input maxlength="32" size="mini" placeholder="请输入" v-model="createdItem.expressNo" clearable></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { baseEmployeeListName } from '@/api/base'
import { departmentTreeList } from '@/api/companyResource'
import { unique } from '@/utils/index'
const defaultCreate = {
  placeCompCode: '',
  takeEmployeeId: '',
  putEmployeeId: '',
  expressType: 'domestic',
  expressSupplierId: '',
  expressSupplierName: '',
  expressNo: ''
}

export default {
  data() {
    return {
      supplierOptions: [],
      companyListOptions: [],
      tcEmployeeList: [],
      rcEmployeeList: [],
      dialogConfig: {
        title: '提单转移',
        show: true,
        size: 'medium',
        width: '400px'
      },
      createdItem: Object.assign({}, defaultCreate),
      rules: {
        placeCompCode: [
          { required: true, message: '请选择转移地', trigger: 'change' }
        ],
        takeEmployeeId: [
          { required: true, message: '请选择取单人', trigger: 'change' }
        ],
        putEmployeeId: [
          { required: true, message: '请选择放单人', trigger: 'change' }
        ],
        expressType: [
          { required: true, message: '请选择快递类型', trigger: 'change' }
        ],
        expressSupplierId: [
          { required: true, message: '请选择快递公司', trigger: 'change' }
        ],
        expressNo: [
          { required: true, message: '请选择快递单号', trigger: 'change' }
        ]
      }
    }
  },
  props: {},
  created() {
    this.getDeptList()
    this.getDefaultSupplierOptions()
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      ordDetRole: (state) => state.order.orderList.ordDetRole
    }),
    expressTypeOptions(){
      return this.dictMap.expressType.filter(el=>el.value==='domestic')
    }
  },
  watch: {},
  components: {
    BaseDialog
  },
  methods: {
    changePlaceComp(){
      this.takeEmployeeId = ''
      this.putEmployeeId = ''
    },
    handleChangeSupplier(val) {
			let item = this.supplierOptions.find(ele => ele.value === val)
			this.createdItem.expressSupplierName = item.label
		},
    // 获取快递公司
		getSupplierList(queryString) {
			//根据快递类型传递不同参数
			let deliveryType = 'delivery'	// delivery_domestic
			this.$store
				.dispatch('dict/querySupplierList', {
					category: 'category',
					value: deliveryType,
					queryString: queryString
				})
				.then(data => {
					if (data.list && data.list.length) {
						this.supplierOptions = data.list.map(ele => {
							return Object.assign(ele, {
								label: this.$language == 'en' ? ele.ename : ele.name,
								value: ele.supplierId ? Number(ele.supplierId) : ''
							})
						})
					}
				})
		},
    expressTypeChange() {
       this.getDefaultSupplierOptions()
    },
    getDefaultSupplierOptions() {
			this.$store.dispatch('order/getDefaultExpressCompany', { expressType: this.createdItem.expressType})
			.then(obj => {
				if (obj && obj.value) {
           this.createdItem.expressSupplierId = obj.value
           this.createdItem.expressSupplierName = obj.label
           this.supplierOptions = [ obj ]
				}
			})
		},
    filterMehod(val) {
			if (val === undefined) return
			this.getSupplierList(val)
		},
    visibleChange(val) {
			if (val) {
				this.getSupplierList('')
			}
		},
    // 所属部门下拉框
    getDeptList() {
      departmentTreeList({ state: 'valid' }).then((res) => {
        if (!(res.data && res.data[0] && res.data[0].childList)) {
          return false
        }
        this.companyListOptions = res.data[0].childList.map((item) => {
          return Object.assign({}, item, {
            label: item.deptCname,
            value: item.deptCode
          })
        })
      })
    },
    getTcEmployeeNameVisible(val) {
      if (val) {
        if (!this.createdItem.placeCompCode) {
          return this.$message.warning('请先选择转移地')
        }
      }
      this.getTcEmployeeName('')
    },
    getRcEmployeeNameVisible(val) {
      if (val) {
        if (!this.createdItem.placeCompCode) {
          return this.$message.warning('请先选择转移地')
        }
      }
      this.getRcEmployeeName('')
    },
    getTcEmployeeName(val) {
      let data1 = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        deptCode: this.createdItem.placeCompCode,
        roleCode: 'tc_trade'
      }
      let data2 = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        deptCode: this.createdItem.placeCompCode,
        roleCode: 'tc_hbl'
      }
      let data3 = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        deptCode: this.createdItem.placeCompCode,
        roleCode: 'tc'
      }
      Promise.all([
        baseEmployeeListName(data1),
        baseEmployeeListName(data2),
        baseEmployeeListName(data3)
      ]).then((res) => {
        this.tcEmployeeList = unique(
          [...res[0].data, ...res[1].data, ...res[2].data],
          'employeeId'
        )
      })
    },
    getRcEmployeeName(val) {
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        roleCode: 'rc',
        deptCode: this.createdItem.placeCompCode
      }
      baseEmployeeListName(data).then((res) => {
        this.rcEmployeeList = res.data
      })
    },
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.calcelOrderForm.validate((valid) => {
          if (valid) {
            this.close('Confirm', this.createdItem)
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
.cancel-form {
  .el-form-item {
    margin-bottom: 4px;
  }
  .el-input--mini .el-input__inner {
    height: 20px;
    line-height: 20px;
  }
  .el-input--mini .el-input__icon {
    line-height: 20px;
  }
  .el-form-item__label,
  .el-form-item__content {
    line-height: 20px !important;
  }
}
</style>
