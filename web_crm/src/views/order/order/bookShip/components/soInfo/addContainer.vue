<template>
	<BaseDialog id="update-so-cn" :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="addContainerForm" style="padding-bottom:0;" :model="createdItem" class="update-so-cn" label-width="100px">
			<el-row class="create-so">
				<el-col :span="24">
					<el-form-item label="箱型箱量">
						<el-row v-for="(item, index) in containerList" :key="index" class="containerList">
							<el-col :span="6">
								<el-select size="mini" placeholder="请选择箱型" filterable v-model="item.containerType" clearable @change="handleChangeContainerType">
									<el-option v-for="(item, index) in containerTypeOptions" :key="index" :label="item.label" :value="item.value"></el-option>
								</el-select>
							</el-col>
							<el-col :span="1" class="center">*</el-col>
							<el-col :span="6">
								<el-input clearable size="mini" placeholder="请输入箱量" v-model.number="item.num" @blur="numBlur(item, '箱量', item.num)"></el-input>
							</el-col>
							<el-col :span="11">
								<div class="btn-minus" @click="handleDeleteContainer(item, index)" v-if="containerList.length > 1"></div>
								<div class="btn-plus" @click="handleAddContainer" v-if="index+1 === containerList.length"></div>
							</el-col>
						</el-row>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</BaseDialog>
</template>

<script>
import store from '@/store'
import BaseDialog from '@/components/Base/Dialog/index'
import { objToForm } from '@/utils/tools'
import { addSO, soUpdate, getBookContainerTypeList } from '@/api/order/book/list'

export default {
	data() {
		return {
			dialogConfig: {
				title: '修改箱型箱量',
				show: true,
				width: '600px'
			},

			createdItem: {
				containerInfo: []
			},

			containerList: [{ containerType: '', num: null }],
			containerTypesArr: [],
			containerTypeOptions: [],
			canSubmit: true
		}
	},
	props: {
		orderInfo: {
			type: Array,
			default: () => []
		},
		oid: {
			type: Number,
			default: () => null
		},
		orderNo: {
			type: String,
			default: () => ''
		},
		bkgReqNo: {
			type: String,
			default: () => ''
		},
		soParamStr: {
			type: String,
			default: () => ''
		}
	},
	async created() {
		// 数据反显
		this.containerList = this.orderInfo.map(item => ({ containerType: item.split('*')[0], num: item.split('*')[1] }))
		console.log('🚀 ~ this.containerList', this.containerList)
		// 箱型箱量数据初始化
		let filterOptions = []
		let containerTypeShiporder = this.$store.state.dict.dictMap.containerTypeShiporder
		this.containerTypeOptions = []
		if (this.bkgReqNo) {
			let { data } = await getBookContainerTypeList({ bkgReqNo: this.bkgReqNo })
			filterOptions = data
			//根据接口数据筛选下拉框选项
			containerTypeShiporder = containerTypeShiporder.filter(item => filterOptions.includes(item.value))
		}
		containerTypeShiporder.map(item => {
			this.containerTypeOptions.push(
				Object.assign(
					{ ...item },
					{
						disabled: false
					}
				)
			)
		})
	},
	mounted() {},
	computed: {},
	watch: {
		containerList: {
			handler(newVal) {
				this.countContainer(newVal)
			},
			deep: true
		}
	},
	components: {
		BaseDialog
	},
	methods: {
		numBlur(item, text, val) {
      if(!val || !Number(val)) {
				this.canSubmit = false
				this.$message({
					type: 'error',
					message: '请输入' + text + '，且不能为0',
					duration: 1000,
					onClose: () => {
						this.canSubmit = true
					}
				})
				// this.$message.error('请输入' + text + '，且不能为0')
				item.num = ''
      } else {
        let intReg= /^[0-9]\d*$/
        if(!intReg.test(val)) {
					this.canSubmit = false
					this.$message({
						type: 'error',
						message: text + '必须是数字',
						duration: 1000,
						onClose: () => {
							this.canSubmit = true
						}
					})
          // this.$message.error(text + '必须是数字')
					item.num = ''
        } else if(val > 100) {
          item.num = 100
					this.$message.error(text + '请输入小于100的数字')
        }
      }
    },
		// 新增箱子
		handleAddContainer() {
			this.containerList.push({
				containerType: '',
				num: ''
			})
		},
		// 删除箱子
		handleDeleteContainer(item, sIndex) {
			this.containerList = this.containerList.filter((ele, index) => {
				return index !== sIndex
			})
			this.containerTypesArr = this.containerTypesArr.filter(ele => item.containerType !== ele)
			// 之前选过的箱型禁选
			this.containerTypeOptions.map(ele => {
				ele.disabled = false
				if (this.containerTypesArr.includes(ele.value)) {
					ele.disabled = true
				}
				return Object.assign({}, ele)
			})
			// console.log('delete', this.containerTypesArr, this.containerTypeOptions)
		},
		// 选择箱型
		handleChangeContainerType(val) {
			this.containerTypesArr = []
			this.containerList.map(item => {
				item.containerType && this.containerTypesArr.push(item.containerType)
			})
			// console.log('this.containerTypesArr', this.containerTypesArr)
			// 之前选过的箱型禁选
			this.containerTypeOptions.map(item => {
				item.disabled = false
				if (this.containerTypesArr.includes(item.value)) {
					item.disabled = true
				}
				return Object.assign({}, item)
			})
		},
		countContainer(data) {
			let result = ''
			if (!data.length) return
			data.map((item, index) => {
				if (item.containerType && item.num) {
					let t = `${item.containerType}*${item.num}`
					result += index ? '+' + t : t
				}
			})
			this.createdItem.containerInfo = result.replace(/^\+/, '')
		},

		close(action, value, type) {
			this.$emit('close', action, value, type)
		},

		validate() {
			let numValid = this.containerList.some(item => !item.num)
			let cnTypeValid = this.containerList.some(item => !item.containerType)
			if (numValid && cnTypeValid) {
				this.$message({ type: 'error', message: '请填写正确的箱型箱量' })
				return false
			} else if (numValid) {
				this.$message({ type: 'error', message: '请填写正确的箱量' })
				return false
			} else if (cnTypeValid) {
				this.$message({ type: 'error', message: '请选择箱型' })
				return false
			}

			return true
		},
		//保存编辑数据
		handleSave(oid, containerInfo, orderNo) {
			let data = { oid: oid, so: this.soParamStr, bkgReqNo: this.$route.query.bkgReqNo, containerInfo: containerInfo, orderNo: orderNo }
			soUpdate(data).then(res => {
				if (res.msg === 'success') {
					this.$message.success('保存成功!')
					this.close('Confirm')
				}
			})
		},
		dialogCallback(action, data) {
			if (action === 'Confirm') {
				if (!this.canSubmit) return
				if (!this.validate()) return
				this.handleSave(this.oid, this.createdItem.containerInfo, this.orderNo)
			} else {
				this.close('Cancel')
			}
		}
	}
}
</script>

<style lang="scss">
#update-so-cn .el-dialog__body {
	padding-bottom: 0;
}
// .update-so-cn .create-so .el-col {
// 	padding-bottom: 5px;
// }
.update-so-cn .create-so .el-form-item__label {
	line-height: 20px;
}
.update-so-cn .el-date-editor.el-input,
.update-so-cn .el-date-editor.el-input__inner {
	width: auto;
}
.update-so-cn .containerList{
	margin-bottom: 4px;
}
.update-so-cn .containerList .center {
	text-align: center;
	line-height: 20px;
}
.update-so-cn .containerList .btn-plus {
	position: relative;
	width: 20px;
	height: 20px;
	border-radius: 10px;
	border: 1px solid #999;
	// margin-top: 4px;
	margin-left: 10px;
	display: inline-block;
	&::before {
		content: '';
		display: block;
		position: absolute;
		width: 1px;
		height: 15px;
		background: #999;
		left: 9px;
		top: 2px;
	}
	&::after {
		content: '';
		display: block;
		position: absolute;
		width: 15px;
		height: 1px;
		background: #999;
		left: 2px;
		top: 9px;
	}
}
.update-so-cn .containerList .btn-minus {
	position: relative;
	width: 20px;
	height: 20px;
	border-radius: 10px;
	border: 1px solid #999;
	// margin-top: 4px;
	margin-left: 10px;
	display: inline-block;
	&::after {
		content: '';
		display: block;
		position: absolute;
		width: 15px;
		height: 1px;
		background: #999;
		left: 2px;
		top: 9px;
	}
}
// .update-so-cn .containerList .el-col {
// 	padding-bottom: 5px;
// }
</style>