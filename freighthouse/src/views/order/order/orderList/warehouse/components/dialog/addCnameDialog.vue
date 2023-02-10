<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form id="addCnameDialog" ref="form" :rules="rules" :model="formData" label-width="70px">
			<FormItem v-for="(ele, index) in inputItem" :key="index" :item="ele" :form="formData" />
		</el-form>
	</BaseDialog>
</template>

<script>
import store from '@/store'
import FormItem from '@/components/Form/elFormItem'
import BaseDialog from '@/components/Base/Dialog/index'
import { cargoSave } from '@/api/order/list'
import { cargoHscodeList } from '@/api/base'
import { mapGetters, mapState } from 'vuex'

export default {
	data() {
		return {
			selectCargo: {}, // 选中列
			dialogConfig: {
				title: '添加品名',
				show: true,
				size: 'medium',
				width: '460px'
			},
			formData: {
				cname: '',
				ename: '',
				hscode: '',
				type: '',
				mark: ''
			},
			inputItem: [
				{
					label: '中文品名',
					key: 'cname',
					prop: 'cname',
					type: 'input',
					inputType: 'text',
					maxlength: '128'
				},
				{ label: '英文品名', key: 'ename', type: 'input', inputType: 'text', maxlength: '128' },
				{
					label: '海关编码',
					key: 'hscode',
					prop: 'hscode',
					type: 'select',
					options: [],
					filterable: true,
					clearable: true,
					remote: true,
					remoteMethod: (queryString, item) => {
						this.queryCargoHscode(queryString, item)
					},
					change: (val, item) => {
						if (!val) {
							item.options = []
							this.formData.type = ''
						} else {
							// let subItem = item.options.find(ele => ele.value === val);
							// this.formData.type = subItem.className;
						}
					}
				},
				{
					label: '货物类型',
					key: 'type',
					prop: 'type',
					type: 'select',
					options: []
				},
				{
					label: '唛头',
					key: 'mark',
					prop: 'mark',
					type: 'input',
					inputType: 'text'
				}
			],
			rules: {
				cname: [{ required: true, message: '中文品名不能为空', trigger: 'blur' }],
				hscode: [{ required: false, message: '海关编码不能为空', trigger: 'blur' }],
				type: [{ required: true, message: '货物类型不能为空', trigger: 'blur' }]
			}
		}
	},
	props: {
		chapterNameList: {
			type: Array,
			default: () => {
				;[]
			}
		}
	},
	created() {
		//获取货品类型下拉选项数据
		this.inputItem[3].options = this.dictMap['cargoProperty']
		if (['ship_export_fcl', 'ship_import_fcl'].includes(this.orderInfoDataObj.businessType)) {
      // 整箱 唛头非必填
      this.rules['mark'] = [{ required: false, message: '唛头不能为空', trigger: 'blur' }]
		} else {
      this.rules['mark'] = [{ required: true, message: '唛头不能为空', trigger: 'blur' }]
		}
	},
	components: {
		BaseDialog,
		FormItem
	},
	computed: {
		...mapGetters(['dictMap']),
		...mapState({
			orderInfoDataObj: (state) => state.order.orderInfoDataObj
		})
	},
	methods: {
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.form.validate(valid => {
					if (valid) {
						cargoSave(this.formData).then(res => {
							this.$emit('handleConfirm', res.data)
							this.close('Confirm')
						})
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		// hscode模糊查询
		queryCargoHscode(queryString, item) {
			queryString && cargoHscodeList({ keyword: queryString }).then(response => {
				item.options = response.data.map(item => {
					return Object.assign(item, {
						label: item.cargoDesc,
						value: item.hscode
					})
				})
			})
		},
		// 获取货品类型
		getCommodityTypeCodeOptions(queryString, item) {
			if (queryString) {
				this.$store.dispatch('dict/queryCommodityTypeCodeOptions', queryString).then(res => {
					item.options = res
				})
			}
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		}
	}
}
</script>

<style lang="scss">
.dialog-layout .row-tit {
	border-bottom: unset !important;
}
#addCnameDialog {
	// padding: 0 40px;
	.el-form-item{
		margin-bottom: 4px;
	}
	.el-form-item__label{
		padding-right: 4px;
		line-height: 20px;
	}
	.el-form-item__content{
		line-height: 20px;
	}
}
</style>
