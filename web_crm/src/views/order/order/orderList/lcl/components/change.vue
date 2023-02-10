<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="changeForm" :rules="rules" :model="changeSaveItem" label-position="right" class="changeCargo-form">
			<el-row class="form-row">
				<el-col :span="5">
					<el-form-item required label="总件数" prop="quantity" :show-message="false">
						<el-input @blur="validateIntNum('quantity')" clearable size="mini" placeholder="请输入" v-model.number="changeSaveItem.quantity"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="5">
					<el-form-item required label="总毛重" prop="weight" :show-message="false">
						<el-input @blur="validateNum('weight')" size="mini" v-model="changeSaveItem.weight" clearable placeholder="请输入">
							<template slot="append">KGS</template>
						</el-input>
					</el-form-item>
				</el-col>
				<el-col :span="5">
					<el-form-item required label="总体积" prop="volume" :show-message="false">
						<el-input @blur="validateNum('volume')" size="mini" v-model="changeSaveItem.volume" clearable placeholder="请输入">
							<template slot="append">CBM</template>
						</el-input>
					</el-form-item>
				</el-col>
			</el-row>
			<!-- 货物信息 -->
			<div class="row-cont">
				<div class="row-cont-tit">
					<span class="tit">货物信息</span>
				</div>
				<Cargo :cargoList="changeSaveItem.cargoList" :countryCode="countryCode" @add="handleAddCargo" @delete="handleDeleteCargo" ref="changeCargo" />
			</div>
			<el-row class="form-row">
				<el-col :span="6">
					<el-form-item required label="修改原因" prop="editReason" :show-message="false">
						<el-select size="mini" v-model="changeSaveItem.editReason" style="width: 100%" clearable placeholder="请选择修改原因">
							<el-option v-for="(item, index) in dictMap.lclCargoEditReason" :key="index" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="18">
					<el-form-item label="修改备注" prop="editRemark" :show-message="false">
						<el-input clearable size="mini" placeholder="请输入" v-model="changeSaveItem.editRemark" maxlength="512" show-word-limit></el-input>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</BaseDialog>
</template>

<script>
import { getDictLabel } from '@/utils/tools'
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import Cargo from './changeCargo'
import { lclCargoEdit } from '@/api/order/list'

const defaultChangeSaveQuery = {
	orderNo: '',
	quantity: '', // 总件数
	weight: '', // 总重量
	volume: '', // 总体积
	editReason: '', // 修改原因
	editRemark: '', // 修改备注
	cargoList: [] // 货品信息
}

export default {
	filters: {},
	data() {
		return {
			dialogConfig: {
				title: '修改',
				show: true,
				size: 'large',
				width: '1200px'
			},
			oQuery: this.$route.query,
			changeSaveItem: Object.assign({}, defaultChangeSaveQuery),
			rules: {}
		}
	},
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		},
		countryCode: {
			type: String,
			default: ''
		}
	},
	created() {
		this.init(this.createItem)
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	watch: {
		// createItem: {
		//   handler(newVal) {
		//     if (newVal) {
		//       this.init(newVal)
		//     }
		//   },
		//   deep: true
		// }
	},
	components: {
		BaseDialog,
		Cargo
	},
	methods: {
		// 数字校验
		validateNum(val) {
			const reg = /^\d+(\.\d+)?$/
			if (!this.changeSaveItem[val]) return
			if (typeof(this.changeSaveItem[val]) === 'string') {
				let pointIndex = this.changeSaveItem[val].indexOf('.')
				if (pointIndex !== -1) {
					this.changeSaveItem[val] = this.changeSaveItem[val].substring(0, pointIndex + 4)
				}
			}
			this.changeSaveItem[val] = Number(this.changeSaveItem[val])
			if (!reg.test(this.changeSaveItem[val])) {
				this.changeSaveItem[val] = ''
				let message = ''
				switch (val) {
					case 'volume':
						message = '总体积'
						break
					case 'weight':
						message = '总毛重'
						break

					default:
						break
				}
				return this.$message.warning('请输入正确的' + message)
			}
			if (this.changeSaveItem[val] > 999999) {
				this.changeSaveItem[val] = 999999
				this.$message.warning('最大不能超过999999')
			}
		},
		validateIntNum(val){
			const intReg= /^(0|[1-9][0-9]*)$/
			if (!intReg.test(this.changeSaveItem[val])) {
				this.changeSaveItem[val] = ''
				return this.$message.warning('请输入正确的总件数')
			}
			if (this.changeSaveItem[val] > 9999999) {
				this.changeSaveItem[val] = 9999999
				this.$message.warning('最大不能超过9999999')
			}
		},
		init(item) {
			this.changeSaveItem = {
				orderNo: item.orderNo,
				quantity: item.quantity,
				weight: item.weight,
				volume: item.volume,
				editReason: '',
				editRemark: '',
				cargoList: item.cargoList
			}
		},
		// 增加一行货物信息
		handleAddCargo() {
			this.changeSaveItem.cargoList.push({})
		},
		// 删除一行货物信息
		handleDeleteCargo(index) {
			this.changeSaveItem.cargoList = this.changeSaveItem.cargoList.filter((item, sindex) => {
				return sindex !== index
			})
		},
		close(action) {
			this.$emit('close', action)
		},
		validate() {
			return true
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				if (this.isView) {
					return this.close('Cancel')
				}
				console.log(this.$refs.changeForm)
				this.$refs.changeForm.validate(valid => {
					if (valid) {
						this.handleChangeSave(done)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		// 修改货品
		handleChangeSave(done) {
			this.$confirm(`是否修改货物信息?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					lclCargoEdit(this.changeSaveItem).then(response => {
						this.$message({
							type: 'success',
							message: '修改成功',
							duration: 1000,
							onClose: () => {
								this.close('Confirm')
							}
						})
					})
				})
				.catch(err => {})
		}
	}
}
</script>

<style lang="scss">
.changeCargo-form .el-form-item__label, .changeCargo-form .el-form-item__content {
	line-height: 20px;
}
.changeCargo-form .form-row .el-form-item {
	display: flex;
	margin-right: 10px;
	margin-bottom: 0;
	// .el-form-item__label{
	// 	width: 70px;
	// }
	.el-form-item__content{
		flex: 1;
	}
}
.changeCargo-form .row-cont {
	margin: 10px 0;
}
.changeCargo-form .row-flex {
	margin-top: 10px;
	overflow: hidden;
}
.changeCargo-form .row-cont .chang-cargo-row .row-flex.flex-cargo{
	.btn-plus-search, .btn-minus-search{
		margin-top: 0;
	}
  // padding-top: 5px;
  .flex-item{
    width: 15.8%;
    display: flex;
		height: 20px;
		padding: 0;
		&.flex-item3{
			width: 47.4%;
		}
    &.is-required .el-form-item__label:before {
      margin-right: 0;
    }
    .el-form-item__label, .item-label{
      width: 85px;
      padding-right: 4px;
      line-height: 20px;
      height: 20px;
    }
    .item-label .lab{
      display: block;
      width: 100%;
      text-align: right;
    }
    .el-form-item__content, .item-content{
      flex: 1;
      line-height: 20px;
      height: 20px;
    }
    &.cname{
      .el-form-item__label, .item-label{
        width: 70px;
      }
    }
    &.hscode{
      .el-form-item__label, .item-label{
        width: 70px;
      }
    }
  }
}
</style>
