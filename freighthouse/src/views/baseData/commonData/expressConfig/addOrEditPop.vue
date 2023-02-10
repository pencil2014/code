<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
   <el-form ref="form" :model="form" :rules="rules" label-position="right" label-width="120px" class="create-form">
      <el-form-item label="分公司：" prop="companyCode" :show-message="false">
				<el-select v-model="form.companyCode" filterable clearable remote  :remote-method="getCompanyName" size="mini" style="width: 100%;" @change="companyChange">
					<el-option :label="item.label" :value="item.value" v-for="(item, index) in companyList" :key="index"></el-option>
				</el-select>
			</el-form-item>
     <el-form-item label="快递类型：" prop="expressType" :show-message="false">
				<el-select v-model="form.expressType" clearable size="mini" style="width: 100%;">
					<el-option :label="item.label" :value="item.value" v-for="(item, index) in dictMap.expressType" :key="index"></el-option>
				</el-select>
			</el-form-item>
      <el-form-item label="默认的快递公司：" prop="expressSupplierId" :show-message="false">
				<el-select v-model="form.expressSupplierId" filterable clearable remote  :remote-method="getExpressCompanyName" size="mini" style="width: 100%;" @change="expressChange">
					<el-option :label="item.label" :value="item.value" v-for="(item, index) in expressSupplierList" :key="index"></el-option>
				</el-select>
			</el-form-item>
      <el-form-item label="状态：" :show-message="false">
				<span style="font-size: 12px;">有效</span>
			</el-form-item>
   </el-form>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { companyPageList } from '@/api/base'
import { expressSave } from '@/api/order/expressConfig'
import { mapState } from 'vuex'
const defaultForm = {
  companyCode: '',
  companyName: '',
  expressType: '',
  expressSupplierId: '',
  expressSupplierName: ''
}
export default {
  props: {
    addOrEditType: {
      type: String,
      default: ''
    },
    editForm: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      dialogConfig: {
				title: '新增快递配置',
				show: true,
				size: 'medium',
				width: '600px'
			},
      rules: {
        companyCode: [
          { required: true, trigger: 'change'}
        ],
        expressType: [
          { required: true, trigger: 'change'}
        ],
        expressSupplierId: [
          { required: true, trigger: 'change'}
        ],
      },
      form: {},
      companyList: [],
      expressSupplierList: [],
    }
  },
  components: {
		BaseDialog
	},
  created() {
    this.form = Object.assign({}, defaultForm)
    if (this.addOrEditType === 'edit') {
      this.dialogConfig.title = "编辑快递配置"
      for(let key in this.form) {
        this.form[key] = this.editForm[key]
      }
      this.form['oid'] = this.editForm.oid
    }
  },
  computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
		})
	},
  methods: {
    getCompanyName(queryString) {
			// 获取客户公司
      queryString = queryString || ''
     let data = {
				currPage: 1,
				pageSize: 50,
				query: [
					{ column: 'companyName', type: 'like', value: queryString },
					{ column: 'state', type: 'eq', value: 'valid' }
				]
			}
			companyPageList(data).then(res => {
				this.companyList = res.data.list.map(o => {
					return Object.assign(o, {
						id: o.companyId ? Number(o.companyId) : '',
						value: o.companyCode ? o.companyCode : '',
						label: this.$language == 'en' ? o.companyEname : o.companyName
					})
				})
			})
		},
    companyChange(val) {
      let obj = this.companyList.find(item => {
        return item.value === val
      })
      this.form.companyName = (obj && obj.label) || ''
    },
    getExpressCompanyName(queryString) {
      queryString = queryString || ''
			this.$store
				.dispatch('dict/querySupplierList', {
					category: 'category',
					value: 'delivery',
					queryString
				})
				.then(data => {
					if (data.list && data.list.length) {
						let result =  data.list.map(ele => {
							return Object.assign(ele, {
								label: this.$language == 'en' ? ele.ename : ele.name,
								value: ele.supplierId ? Number(ele.supplierId) : ''
							})
						})
            this.expressSupplierList = [...result]
					}
				})
    },
    expressChange(val) {
      let obj = this.expressSupplierList.find(item => {
        return item.value === val
      })
      this.form.expressSupplierName = (obj && obj.label) || ''
    },
    close(action, value) {
			this.$emit('close', action, value)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.form.validate(valid => {
					if (valid) {
            expressSave({
							...this.form,
						})
						.then(res => {
              let txt = this.addOrEditType === 'add' ? '新增成功' : '编辑成功'
							this.$message.success(txt)
							this.close('Confirm')
						})
					}
				})
			} else {
				this.close('Cancel')
			}
		}
  }
}
</script>

<style>

</style>