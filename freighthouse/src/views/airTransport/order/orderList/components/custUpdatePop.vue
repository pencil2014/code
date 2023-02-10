<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="custUpdataForm" id="custUpdataForm" :rules="rules" :model="createItem" label-width="70px">   
      <el-form-item label="委托单位" prop="custid" :show-message="false">
        <el-select v-model="createItem.custid" size="mini" remote clearable :filterable="true" @visible-change="custVisibleChange"
          :remote-method="custFilterMehod" placeholder="请选择" @change="handleSelectCustid" style="width: 100%">
          <el-option v-for="(item, index) in custidOptions" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { customerList } from '@/api/crm/supplier'
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
				custid: ''
			},
			custidOptions: [],
			currCustArr: [],
			rules: {
				custid: [{required: true, message: '请选择委托单位', trigger: 'change'}]
			}
		}
	},
	props: ['custParam'],
	created() {
		this.createItem = {
			custid: this.custParam.custid,
			orderNo: this.custParam.orderNo
		}
		this.custidOptions = [{label: this.custParam.custName, value: this.custParam.custid}]
		this.currCustArr = [{label: this.custParam.custName, value: this.custParam.custid}]
	},
	mounted() {
		console.log("🚀 ~ this.custParam", this.custParam)
	},
    
	computed: {},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
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
						this.close('Confirm', this.createItem)
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

</style>
