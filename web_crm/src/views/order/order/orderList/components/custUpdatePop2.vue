<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="custUpdataForm" id="custUpdataForm" :rules="rules" :model="createItem" label-width="70px" class="cust-update-pop-form">   
      <el-form-item label="委托单位" prop="newCustId" :show-message="false">
        <el-select v-model="createItem.newCustId" size="mini" remote clearable :filterable="true" @visible-change="custVisibleChange"
          :remote-method="custFilterMehod" placeholder="请选择" @change="handleSelectCustid" style="width: 100%">
          <el-option v-for="(item, index) in custidOptions" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
			<el-form-item label="原因" prop="modifyReason" :show-message="false">
        <el-select v-model="createItem.modifyReason" size="mini" remote clearable :filterable="true" @change="handleSelectReason" style="width: 100%">
          <el-option v-for="(item, index) in dictMap.orderCustModifyReason" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
			<el-form-item label="备注" prop="modifyRemark" :show-message="false">
        <el-input type="textarea" :rows="3" size="mini" v-model="createItem.modifyRemark" style="width: 100%" clearable placeholder="请输入备注" maxlength="128" show-word-limit> </el-input>
      </el-form-item>
			<el-form-item label="审核人" prop="auditEmployeeName" :show-message="false">
        <el-input type="text" size="mini" v-model="auditEmployee.name" style="width: 100%" clearable placeholder="请输入备注" disabled></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { customerList } from '@/api/crm/supplier'
import { custChangeAuditEmployee } from '@/api/order/list'
export default {
	data() {
		return {
			dialogConfig: {
        title: '修改委托单位',
        show: true,
        size: 'medium',
        width: "400px"
			},
			createItem: {
				orderNo: '',
				newCustId: '',
				modifyReason: '',
				modifyRemark: ''
			},
			custidOptions: [],
			currCustArr: [],
			rules: {
				newCustId: [{required: true, message: '请选择委托单位', trigger: 'change'}],
				modifyReason: [{required: true, message: '请选择原因', trigger: 'change'}]
			},
			auditEmployee: {
				cname: '',
				employeeId: ''
			}
		}
	},
	props: ['custParam'],
	created() {
		this.createItem = {
			newCustId: this.custParam.custid,
			orderNo: this.custParam.orderNo
		}
		this.custidOptions = [{label: this.custParam.custName, value: this.custParam.custid}]
		this.currCustArr = [{label: this.custParam.custName, value: this.custParam.custid}]
	},
	mounted() {
		this.getAuditEmployee()
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
		})
	},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		getAuditEmployee() {
			custChangeAuditEmployee({
				orderNo: this.$route.query.orderNo
			}).then(res => {
				this.auditEmployee = res.data
				this.auditEmployee.name = `${res.data.cname}(${res.data.deptCname})`
			})
		},
		handleSelectReason(val) {

		},
		custFilterMehod(val) {
      this.getCustList(val)
    },
    custVisibleChange(val) {
      if (val) {
        this.getCustList()
      }
    },
    handleSelectCustid(val) {
			this.currCustArr = this.custidOptions.filter(item => item.value === val)
			let findItem = this.custidOptions.find(item => item.value === val)
			this.createItem.custName = findItem ? findItem.label : ''
    },
    // 获取委托单位
    getCustList(val = '') {
      let data = {
        "currPage": 1,
        "pageSize": 1000,
        "query": val ? [
          {"column": "name", "type": "like", "value": val},
          {"column": "bdEmployeeId", "type": "eq", "value": this.custParam.bdEmployeeId},
          {"column": "roleType","type": "eq","value": "client"}
        ]
         : [
           {"column": "bdEmployeeId", "type": "eq", "value": this.custParam.bdEmployeeId},
           {"column": "roleType","type": "eq","value": "client"}
          ]
      }
      customerList(data).then(res => {
				let result = res.data.list.map(o => {
          return {
            value: o.custid,
            label: this.$language=='en'?o.ename:o.name
          }
				})
				// 委托单位查询出来的结果不插入上一次选中的单位，只在点击展开下拉的时候插入
				if (val) {
					this.custidOptions = result
				} else {
					// 上一次选中的委托单位插入新的下拉数组前面做选中反显
					let custArr = this.currCustArr.map(item => item.value)
					if (!result.find(item => custArr.includes(item.value))) {
						this.custidOptions = this.currCustArr.concat(result) 
					} else {
						this.custidOptions = result
					}
				}
      })
    },
		close(action, value) {
      this.$emit('close', action, value)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
				this.$refs.custUpdataForm.validate(valid => {
					if (valid) {
						if (!this.auditEmployee.employeeId) {
							return this.$message.error('还未配置审计人员，请联系管理员配置。')
						}
						this.close('Confirm', {...this.createItem, auditEmployeeId: this.auditEmployee.employeeId})
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

<style lang="scss" scoped>
.cust-update-pop-form{
	/deep/ .el-form-item{
		margin-bottom: 4px;
	}
	/deep/ .el-form-item__label, /deep/ .el-form-item__content{
		line-height: 20px;
	}
}
</style>
