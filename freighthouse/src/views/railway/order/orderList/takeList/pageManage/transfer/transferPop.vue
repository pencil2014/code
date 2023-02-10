<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="form" :model="form" :rules="rules" label-position="right" label-width="120px" class="create-form">
			<el-form-item label="提单纸编码：" required>
				<div class="page-class">
         <div class="row" v-for="(item,index) in form.paperNoList" :key="index">
           <div class="left">
						   <el-input-number 
                 v-model="item.start"
                 size="mini" 
                 :controls="false" 
                 :precision='0' 
                 :max="item.end"
                 >
              </el-input-number>
              <div class="middle-class">-</div>
              <el-input-number 
                 v-model="item.end"
                 size="mini" 
                 :controls="false" 
                 :precision='0' 
                 :min="item.start" 
               >
              </el-input-number>
           </div>
           <div class="right">
             <i @click="add" v-show="index === 0" class="icon-class el-icon-circle-plus-outline" />
             <i @click="remove(index)" v-show="form.paperNoList.length > 1" class="icon-class el-icon-remove-outline" />
           </div>
         </div>
       </div>
			</el-form-item>
			<el-form-item label="快递公司：" prop="expressCompanyId" :show-message="false">
				<el-select v-model="form.expressCompanyId" remote filterable clearable size="mini" style="width: 100%;" @change="expressChange" :remote-method="getExpressSupplierList">
					<el-option :label="item.label" :value="item.value" v-for="(item, index) in expressSupplierList" :key="index"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="快递单号：" prop="expressNo" :show-message="false">
				<el-input v-model="form.expressNo" size="mini"></el-input>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>
<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { blPagerTransfer } from '@/api/railway/blPage'
export default {
	filters: {},
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '转移提单纸',
				show: true,
				size: 'medium',
				width: '600px'
			},
			expressSupplierList: [],
			rules: {
        expressCompanyId: [{ required: true, message: '请选择快递公司', trigger: 'change' }],
        expressNo: [{ required: true, message: '请输入快递单号', trigger: 'blur' }]
			},
			form: {
				paperNoList: [
					{
						start: undefined,
						end: undefined
					}
				],
				expressCompanyId: '',
				expressCompanyName: '',
				expressNo: '',
			}
		}
	},
	props: {
		rowData: {
		  type: Object,
		  default: () => ({})
		},
	},
	created() {
		
		this.getDefaultSupplierOptions()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
		})
	},
	components: {
		BaseDialog
	},
	watch: {},
	methods: {
		getExpressSupplierList(queryString) {
			if (!queryString) return 
       this.$store.dispatch('dict/querySupplierList', { category: 'category', value: 'delivery', queryString}).then(data => {
				this.expressSupplierList = (data.list || []).map(ele => {
					return { ...ele, label: this.$language == 'en' ? ele.ename : ele.name, value: ele.supplierId ? Number(ele.supplierId) : '' }
				})
			})
		},
		getDefaultSupplierOptions() {
			this.$store.dispatch('order/getDefaultExpressCompany')
			.then(obj => {
				if (obj && obj.value) {
           this.form.expressCompanyId = obj.value
					 this.form.expressCompanyName = obj.label
					 this.getExpressSupplierList(this.form.expressCompanyName)
				}
			})
		},
		expressChange(id) {
			let obj = this.expressSupplierList.find(item => {
				return item.value === id
			})
			this.form.expressCompanyName = (obj && obj.label) || ''
		},
		validtor() {
      if (this.form.paperNoList.some(item => !item.start || !item.end)) {
        return false
      } else {
        return true
      }
    },
		add() {
			if (!this.validtor()) {
        this.$message.error('提单纸编码不能有空值!')
        return
      }
      this.form.paperNoList.push({
        start: undefined,
        end: undefined,
      })
    },
    remove(index) {
      this.form.paperNoList.splice(index, 1)
    },
		close(action, value) {
			this.$emit('close', action, value)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.form.validate(valid => {
					if (valid) {
            blPagerTransfer({
							oid: this.rowData.oid,
							paperCode: this.rowData.paperCode,
							...this.form,
						})
						.then(res => {
							this.$message.success('转移成功')
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
<style lang="scss" scoped>
.create-form {
	/deep/.el-form-item__label {
		text-align: right !important;
	}
	/deep/.el-form-item {
    margin-bottom: 4px !important;
  }
	.fz-class {
		font-size: 12px;
	}
	.page-class {
    .row {
      display: flex;
      .left {
        display: flex;
        flex: 1;
        justify-content: space-between;
        /deep/.el-input-number {
          width: 48%;
        }
      }
      .right {
        width: 60px;
        text-align: center;
        display: flex;
        justify-content: space-around;
        align-items: center;
        .icon-class {
          cursor: pointer;
        }
      }
    }
    .row+.row {
      margin-top: 5px;
    }
  }
}
 
</style>
