<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="createOrderForm" :rules="rules" :model="createdItem" label-position="right" label-width="120px" id="railway-create-delivery" class="create-order-form">
			<el-form-item label="入仓编号" prop="inNo">
				<el-input disabled size="mini" placeholder="入仓编号" v-model="createdItem.inNo"></el-input>
			</el-form-item>
			<el-form-item label="中文品名" prop="cname">
				<el-input maxlength="1024" clearable="" size="mini" placeholder="中文品名" v-model="createdItem.cname"></el-input>
			</el-form-item>
			<el-form-item label="数量" prop="quantity">
				<el-input type="number" clearable="" size="mini" placeholder="数量" v-model="createdItem.quantity"></el-input>
			</el-form-item>
			<el-form-item label="包装" prop="packageInfo">
				<el-select style="width:100%;" size="mini" v-model="createdItem.packageInfo" placeholder="请选择包装" clearable filterable>
					<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="重量" prop="weight">
				<el-input class="rail-weight-kgs" type="number" clearable="" size="mini" placeholder="重量" v-model="createdItem.weight"><template slot="append">KGS</template></el-input>
			</el-form-item>
			<el-form-item label="体积" prop="volume">
				<el-input type="number" clearable="" size="mini" placeholder="体积" v-model="createdItem.volume"><template slot="append">CBM</template></el-input>
			</el-form-item>
			<el-form-item label="最晚入仓时间" prop="lastInTime">
				<elDatePickerLimit class="rail-in-date" size="mini" v-model="createdItem.lastInTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { railBookWhNo } from '@/api/railway/book/list'
// inNo	是	String	入仓编号
// orderNo	是	String	订单号
// cname	否	String	中文品名
// quantity	否	String	数量
// packageInfo	否	String	包装
// weight	否	String	重量
// volume	否	String	体积
// lastInTime
const defaultCreate = {
	inNo: '',
	cname: '',
	quantity: '',
	packageInfo: '',
	weight: '',
	volume: '',
	lastInTime: ''
}

export default {
	data() {
		return {
			dialogConfig: {
				title: '新增入仓单',
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
				inNo: [{ required: true, message: ' ', trigger: 'blur' }],
				cname: [{ required: true, message: ' ', trigger: 'blur' }],
				quantity: [{ required: true, message: ' ', trigger: 'blur' }],
				packageInfo: [{ required: true, message: ' ', trigger: 'blur' }],
				volume: [{ required: true, message: ' ', trigger: 'blur' }],
				lastInTime: [{ required: true, message: ' ', trigger: 'blur' }],
				weight: [{ required: true, message: ' ', trigger: 'blur' }]
			}
		}
	},
	props: {
		row: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		//编辑
		if (this.row.inNo) {
			this.dialogConfig.title = '编辑入仓单'
			this.createdItem = JSON.parse(JSON.stringify(this.row))
			//新增
		} else {
			this.dialogConfig.title = '新增入仓单'
			this.getBookNo()
		}
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		getBookNo() {
			railBookWhNo({ orderNo: this.$route.query.orderNo }).then(res => {
				this.createdItem.inNo = res.data
				this.createdItem = { ...defaultCreate, inNo: this.createdItem.inNo }
			})
		},
		dialogCallback(action) {
			if (action === 'Confirm') {
				const regNum = /^\d+$/
				if (!regNum.test(this.createdItem.quantity) && this.createdItem.quantity) {
					return this.$message.warning('请输入正确的数量,只能输入整数')
				}
				if (this.createdItem.quantity > 9999999) {
					return this.$message.warning('最大不能大于9999999')
				}
				const reg = /^\d+(\.\d{0,3})?$/
				if (!reg.test(this.createdItem.weight) && this.createdItem.weight) {
					return this.$message.warning('请输入正确的重量,最多包含三位小数')
				}
				if (this.createdItem.weight > 999999) {
					return this.$message.warning('重量最大不能大于999999')
				}
				if (!reg.test(this.createdItem.volume) && this.createdItem.volume) {
					return this.$message.warning('请输入正确的体积,最多包含三位小数')
				}
				if (this.createdItem.volume > 999999) {
					return this.$message.warning('体积最大不能大于999999')
				}

				this.$refs.createOrderForm.validate(valid => {
					if (valid) {
						this.$emit('close', 'Confirm', this.createdItem)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.$emit('close', 'Cancel')
			}
		}
	}
}
</script>

<style lang="scss">
#railway-create-delivery {
	.el-form-item__label,
	.el-form-item__content {
		line-height: 20px;
	}
	.rail-weight-kgs {
		.el-input-group__append {
			padding-right: 9px;
		}
	}
	.rail-in-date {
		.el-input__prefix {
			left: 0;
			top: 0;
		}
	}
	input[type='number'] {
		-moz-appearance: textfield;
	}
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none !important;
	}
	.el-icon-date {
		line-height: 100% !important;
		height: 100% !important;
	}
}
</style>
