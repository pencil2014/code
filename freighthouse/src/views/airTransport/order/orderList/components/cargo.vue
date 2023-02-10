<template>
	<div class="so-container air-cargo">
		<div class="so-row-cont air-cargo">
			<div style="padding: 8px 0 5px">
				<el-form class="row-flex flex-so" label-width="70px" ref="airCargo" :model="cargoData" :show-message="false">
					<div class="form-box" v-for="(el, index) in cargoData.formData" :key="index">
						<i class="el-icon-circle-plus-outline plus-minus-outline" @click="handleAddContainerList(index)" v-if="!disabledState"></i>
						<i class="el-icon-remove-outline plus-minus-outline" @click="handleDeleteContainerList(index)" v-if="index > 0 && !disabledState"></i>
						<div class="air-cargo-form" :class="{ 'air-cargo-form': !disabledState, 'air-cargo-form100': disabledState }">
							<el-row>
								<el-col :xl="{ span: 'cargo-short-item' }">
									<el-form-item class="form-item-height" label="HS Code" :prop="'formData.' + index + '.hscode'" :rules="cargoData.rules.hscode">
										<el-tooltip v-if="disabledState" class="item" effect="dark" :content="el.hscode" placement="top">
											<el-select size="mini" v-model="el.hscode" style="width: 100%" placeholder="请选择HS Code" disabled>
												<el-option v-for="(item, index) in el.hscodeOptions || []" :key="index" :label="item.label" :value="item.value"> </el-option>
											</el-select>
										</el-tooltip>
										<el-select
											v-else
											size="mini"
											v-model="el.hscode"
											clearable
											style="width: 100%"
											remote
											filterable
											placeholder="请选择HS Code"
											@change="handleChangeHscode(el.hscode, index)"
											:disabled="disabledState"
											:remote-method="val => queryCargoHscode(val, index)"
										>
											<el-option v-for="(item, index) in el.hscodeOptions || []" :key="index" :label="item.label" :value="item.value"> </el-option>
										</el-select>
									</el-form-item>
								</el-col>
								<el-col class="cname-ename" :xl="{ span: 'cargo-short-item' }">
									<!-- @input="checkCname(el.cname)"  checkEname(el.ename,'英文品名') -->
									<el-form-item class="form-item-height" label="中文品名" :prop="'formData.' + index + '.cname'" :rules="cargoData.rules.cname">
										<el-tooltip v-if="disabledState" class="item" effect="dark" :content="el.cname" placement="top">
											<el-input size="mini" v-model="el.cname" maxlength="1024" clearable placeholder="请输入" disabled> </el-input>
										</el-tooltip>
										<el-input v-else size="mini" v-model="el.cname" maxlength="1024" clearable placeholder="请输入" :disabled="disabledState"> </el-input>
									</el-form-item>
								</el-col>
								<el-col class="cname-ename" :xl="{ span: 'cargo-short-item' }">
									<el-form-item class="form-item-height" label="英文品名" :prop="'formData.' + index + '.ename'" :rules="cargoData.rules.ename">
										<el-tooltip v-if="disabledState" class="item" effect="dark" :content="el.ename" placement="top">
											<el-input size="mini" v-model="el.ename" maxlength="1024" placeholder="请输入" disabled> </el-input>
										</el-tooltip>
										<el-input v-else size="mini" v-model="el.ename" maxlength="1024" @input="checkEname(el.ename, '英文品名')" clearable placeholder="请输入" :disabled="disabledState"> </el-input>
									</el-form-item>
								</el-col>
								<el-col :xl="{ span: 'cargo-short-item' }">
									<el-form-item class="form-item-height" label="货物性质" :prop="'formData.' + index + '.property'" :rules="cargoData.rules.property">
										<el-select size="mini" v-model="el.property" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
											<el-option v-for="item in dictMap.cargoProperty" :key="item.value" :label="item.label" :value="item.value"> </el-option>
										</el-select>
									</el-form-item>
								</el-col>
								<el-col :xl="{ span: 'cargo-short-item' }">
									<el-form-item class="form-item-height" label="货品分类">
										<el-select size="mini" v-model="el.commodityTypeCode" filterable style="width: 100%" clearable placeholder="请选择" :disabled="disabledState">
											<el-option v-for="item in commodityTypeCodeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
										</el-select>
									</el-form-item>
								</el-col>
								<el-col :xl="{ span: 'cargo-short-item' }">
									<el-form-item class="form-item-height" label="件数" :prop="'formData.' + index + '.quantity'" :rules="cargoData.rules.quantity">
										<el-input size="mini" v-model="el.quantity" clearable placeholder="请输入" :disabled="disabledState" @input="checkIntegerQuantity(el.quantity, index)"> </el-input>
									</el-form-item>
								</el-col>
								<el-col :xl="{ span: 'cargo-short-item' }">
									<el-form-item class="form-item-height" label="毛重" :prop="'formData.' + index + '.weight'" :rules="cargoData.rules.weight">
										<el-input size="mini" v-model="el.weight" @input="checkNumInputMaxVal(el.weight, '毛重', index, 'weight')" clearable placeholder="请输入" :disabled="disabledState">
											<template slot="append">KGS</template>
										</el-input>
									</el-form-item>
								</el-col>
								<el-col :xl="{ span: 'cargo-short-item' }">
									<el-form-item class="form-item-height" label="体积" :prop="'formData.' + index + '.volume'" :rules="cargoData.rules.volume">
										<el-input size="mini" v-model="el.volume" clearable placeholder="请输入" :disabled="disabledState" @input="checkNumInputMaxVal(el.volume, '体积', index, 'volume')">
											<template slot="append">CBM</template>
										</el-input>
									</el-form-item>
								</el-col>
								<el-col :xl="{ span: 'cargo-short-item' }">
									<el-form-item class="form-item-height" label="包装" :prop="'formData.' + index + '.packageInfo'" :rules="cargoData.rules.packageInfo">
										<el-select size="mini" v-model="el.packageInfo" filterable clearable style="width: 100%" placeholder="请选择" :disabled="disabledState">
											<el-option v-for="item in dictMap.packageType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
										</el-select>
									</el-form-item>
								</el-col>
								<el-col :xl="{ span: 'cargo-short-item' }">
									<el-form-item class="form-item-height" label="长" :prop="'formData.' + index + '.length'" :rules="cargoData.rules.length">
										<el-input size="mini" v-model="el.length" @input="checkNumInput(el.length, '长', index, 'length')" clearable placeholder="请输入" :disabled="disabledState">
											<template slot="append">M</template>
										</el-input>
									</el-form-item>
								</el-col>
								<el-col :xl="{ span: 'cargo-short-item' }">
									<el-form-item class="form-item-height" label="宽" :prop="'formData.' + index + '.width'" :rules="cargoData.rules.width">
										<el-input size="mini" v-model="el.width" @input="checkNumInput(el.width, '宽', index, 'width')" clearable placeholder="请输入" :disabled="disabledState">
											<template slot="append">M</template>
										</el-input>
									</el-form-item>
								</el-col>

								<el-col :xl="{ span: 'cargo-short-item' }">
									<el-form-item class="form-item-height" label="高" :prop="'formData.' + index + '.height'" :rules="cargoData.rules.height">
										<el-input size="mini" v-model="el.height" @input="checkNumInput(el.height, '高', index, 'height')" clearable placeholder="请输入" :disabled="disabledState">
											<template slot="append">M</template>
										</el-input>
									</el-form-item>
								</el-col>
								<el-col :xl="{ span: 'cargo-middle-item' }">
									<el-form-item class="" label="唛头" :prop="'formData.' + index + '.mark'" :rules="cargoData.rules.mark">
										<el-input type="textarea" maxlength="512" @input="checkEname(el.mark, '唛头')" :autosize="{ minRows: 1, maxRows: 1 }" size="mini" placeholder="请输入" v-model="el.mark" :disabled="disabledState"></el-input>
									</el-form-item>
								</el-col>
								<el-col :xl="{ span: 'cargo-middle-item' }">
									<el-form-item class="" label="货描" :prop="'formData.' + index + '.cargoDesc'" :rules="cargoData.rules.cargoDesc">
										<el-input type="textarea" maxlength="512" :autosize="{ minRows: 1, maxRows: 1 }" size="mini" placeholder="请输入" v-model="el.cargoDesc" :disabled="disabledState"></el-input>
									</el-form-item>
								</el-col>
							</el-row>
						</div>
					</div>
				</el-form>
				<!-- <el-button @click="validateForm">校验</el-button> -->
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { cargoTypeList, cargoHscodeList } from '@/api/base'
import { unique } from '@/utils/index'
import { checkQuantityWeightVolume, validateNumPointEmpty, validateCntextAndNum, validateEntextAndNum, validateIntegerQuantity } from '@/utils/validate'
var timer = ''
const dateObj = {
	formData: [
		{
			hscode: '',
			isWoodenPackage: '',
			cname: '', //中文品名
			ename: '', //英文品名
			property: '', //货物性质
			commodityTypeCode: '', // 货品分类
			mark: '', // 唛头
			quantity: null, // 件数
			weight: null, // 毛重
			volume: null, //体积
			packageInfo: '', //包装
			length: null, // 长
			width: null, //宽
			height: null // 高
		}
	]
}
export default {
	data() {
		return {
			pickerOptions: {
				disabledDate(date) {
					//disabledDate 文档上：设置禁用状态，参数为当前日期，要求返回 Boolean
					return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
				}
			},
			commodityTypeCodeOptions: [] // 货物分类
		}
	},
	props: {
		cargoData: {
			type: Object,
			default: () => dateObj
		},
		orderStatus: {
			type: String,
			default: ''
		},
		isPricing: {
			type: Boolean,
			default: false
		},
		isBd: {
			type: Boolean,
			default: false
		},
		isOp: {
			type: Boolean,
			default: false
		}
	},
	model: {
		prop: 'cargoData',
		event: 'update'
	},
	created() {
		this.cargoData.rules = {
			hscode: [{ required: true, message: '请选择', trigger: 'change' }],
			cname: [
				{ required: true, message: '请选择', trigger: 'change' }
				// { validator: validateCntextAndNum(), trigger: 'change' }
			],
			ename: [
				{ required: true, message: '请选择', trigger: 'change' },
				{ validator: validateEntextAndNum(), trigger: 'change' }
			],
			property: [{ required: true, message: '请选择', trigger: 'change' }],
			commodityTypeCode: [{ required: true, message: '请选择', trigger: 'change' }],
			quantity: [
				{ required: true, message: '请选择', trigger: 'change' },
				{ validator: validateIntegerQuantity(), trigger: 'change' }
			],
			weight: [
				{ required: true, message: '请选择', trigger: 'change' },
				{ validator: checkQuantityWeightVolume(), trigger: 'change' }
			],
			volume: [
				{ required: true, message: '请选择', trigger: 'change' },
				{ validator: checkQuantityWeightVolume(), trigger: 'change' }
			],
			packageInfo: [{ required: true, message: '请选择', trigger: 'change' }],
			length: [{ validator: validateNumPointEmpty(), trigger: 'change' }],
			width: [{ validator: validateNumPointEmpty(), trigger: 'change' }],
			height: [{ validator: validateNumPointEmpty(), trigger: 'change' }],
			mark: [{ validator: validateEntextAndNum(), trigger: 'change' }],
			cargoDesc: [{ max: 512, message: '货描最大长度限制512位', trigger: 'blur' }],
			isWoodenPackage: [{ required: true, message: '请选择', trigger: 'change' }]
		}
		console.log(this.cargoData)
		this.queryCargoTypeList()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.airTransport.orderList.ordDetRole,
			roles: state => state.user.roles,
			airOrderInfo: state => state.airTransport.airOrderInfo,
			userId: state => state.user.userId
		}),
		isView() {
			if (this.airOrderInfo.orderStatus === 'pre_submit') {
				if (this.airOrderInfo.bdManageEmployeeId !== this.userId) {
					return true
				} else {
					return false
				}
			} else {
				if (this.isBd && !['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)) {
					return true
				}
				if (this.isOp && !['pass'].includes(this.orderStatus)) {
					return true
				}
				return false
			}
		},
		disabledState() {
			if (this.airOrderInfo.orderStatus === 'pre_submit') {
				if (this.airOrderInfo.bdManageEmployeeId !== this.userId) {
					return true
				} else {
					return false
				}
			} else {
				// 业务可以填写部分的权限
				if (this.isBd) {
					if (!['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)) {
						return true
					} else {
						return false
					}
				} else if (this.isPricing) {
					if (!['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)) {
						return true
					} else {
						return false
					}
				} else {
					return true
				}
			}
		}
	},
	watch: {},
	components: {},
	methods: {
		handleChangeHscode(val, index) {
			if (!val) {
				this.$set(this.cargoData.formData[index], 'hscodeOptions', hscodeOptions || [])
			}
		},
		// hscode模糊查询
		queryCargoHscode(queryString, index) {
			if (queryString) {
				cargoHscodeList({ keyword: queryString }).then(response => {
					let hscodeOptions = response.data.map(item => {
						return Object.assign(item, {
							label: item.cargoDesc,
							value: item.hscode
						})
					})
					hscodeOptions = unique(hscodeOptions, 'label')
					this.$set(this.cargoData.formData[index], 'hscodeOptions', hscodeOptions || [])
				})
			} else {
				this.$set(this.cargoData.formData[index], 'hscodeOptions', [])
			}
		},
		// 货品分类
		queryCargoTypeList() {
			cargoTypeList().then(response => {
				this.commodityTypeCodeOptions = response.data.map(item => {
					return Object.assign(item, {
						label: item.chapterName,
						value: item.chapterCode
					})
				})
			})
		},
		validateForm() {
			// 表单验证
			return new Promise((resolve, reject) => {
				this.$refs.airCargo.validate(valid => {
					if (valid) {
						resolve()
					} else {
						reject()
					}
				})
			})
		},
		// add
		handleAddContainerList(data) {
			this.cargoData.formData.push({
				hscode: '',
				isWoodenPackage: '',
				cname: '', //中文品名
				ename: '', //英文品名
				property: '', //货物性质
				commodityTypeCode: '', // 货品分类
				mark: '', // 唛头
				quantity: null, // 件数
				weight: null, // 毛重
				volume: null, //体积
				packageInfo: '', //包装
				length: null, // 长
				width: null, //宽
				height: null // 高
			})
		},

		// 删除一行箱型箱量
		handleDeleteContainerList(index) {
			this.cargoData.formData.splice(index, 1)
		},
		checkNumInput(value, type, index, prop) {
			clearTimeout(timer)
			timer = setTimeout(() => {
				let reg = /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/
				if (!value) {
				} else if (!reg.test(value) || value > 999999) {
					let lastStr = value.substr(value.length - 1, 1)
					if (isNaN(value)) {
						this.$message({
							message: '长、宽、高请输入不超过999999的数字，小数点最多2位',
							type: 'error',
							duration: 2000
						})
						this.$set(this.cargoData.formData[index], prop, null)
					} else if (value > 999999) {
						this.$message({
							message: '长、宽、高请输入不超过999999的数字，小数点最多2位',
							type: 'error',
							duration: 2000
						})
						this.$set(this.cargoData.formData[index], prop, 999999)
					} else if (lastStr !== '.') {
						this.$message({
							message: '长、宽、高请输入不超过999999的数字，小数点最多2位',
							type: 'error',
							duration: 2000
						})
						this.$set(this.cargoData.formData[index], prop, Number(value).fixed(2))
					}
				}
				// else {
				if (this.cargoData.formData[index].quantity && this.cargoData.formData[index].length && this.cargoData.formData[index].width && this.cargoData.formData[index].height) {
					this.cargoData.formData[index].volume = Number(this.cargoData.formData[index].quantity * this.cargoData.formData[index].length * this.cargoData.formData[index].width * this.cargoData.formData[index].height).fixed(3)
				}
				if (this.cargoData.formData[index].quantity * this.cargoData.formData[index].length * this.cargoData.formData[index].width * this.cargoData.formData[index].height > 999999) {
					this.$message({
						message: `体积不能大于999999`,
						type: 'error'
					})
				}
				// }
			}, 800)
		},
		checkNumInputMaxVal(value, type, index, prop) {
			clearTimeout(timer)
			timer = setTimeout(() => {
				let reg = /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,3}|[1-9][0-9]*\.\d{1,3})))$/
				if (!value) {
				} else if (!reg.test(value) || value > 999999) {
					let lastStr = value.substr(value.length - 1, 1)
					if (isNaN(value)) {
						this.$message({
							message: `${type}请输入不超过999999的数字，小数点最多3位`,
							type: 'error',
							duration: 2000
						})
						this.$set(this.cargoData.formData[index], prop, null)
					} else if (value > 999999) {
						this.$message({
							message: `${type}请输入不超过999999的数字，小数点最多3位`,
							type: 'error',
							duration: 2000
						})
						this.$set(this.cargoData.formData[index], prop, 999999)
					} else if (lastStr !== '.') {
						this.$message({
							message: `${type}请输入不超过999999的数字，小数点最多3位`,
							type: 'error',
							duration: 2000
						})
						this.$set(this.cargoData.formData[index], prop, Number(value).fixed(3))
					}
				}
			}, 800)
		},
		checkIntegerQuantity(value, index) {
			clearTimeout(timer)
			timer = setTimeout(() => {
				if (value) {
					let reg = /^([1-9][0-9]*)$/
					if (!reg.test(value)) {
						this.$set(this.cargoData.formData[index], 'quantity', null)
						this.$message({
							message: `件数请输入大于0的整数`,
							type: 'error',
							duration: 2000
						})
					} else if (value > 999999) {
						this.$set(this.cargoData.formData[index], 'quantity', 999999)
						this.$message({
							message: `件数不能超过999999`,
							type: 'error',
							duration: 2000
						})
					}
					if (this.cargoData.formData[index].quantity && this.cargoData.formData[index].length && this.cargoData.formData[index].width && this.cargoData.formData[index].height) {
						this.cargoData.formData[index].volume = Number(this.cargoData.formData[index].quantity * this.cargoData.formData[index].length * this.cargoData.formData[index].width * this.cargoData.formData[index].height).fixed(3)
					}
					if (this.cargoData.formData[index].quantity * this.cargoData.formData[index].length * this.cargoData.formData[index].width * this.cargoData.formData[index].height > 999999) {
						this.$message({
							message: `体积不能大于999999`,
							type: 'error'
						})
					}
				}
			}, 800)
		},
		checkCname(value) {
			clearTimeout(timer)
			timer = setTimeout(() => {
				if (value) {
					let reg = /^[\u4e00-\u9fa50-9]+$/
					if (value) {
						let result = value.replace(/\s+/g, '')
						if (!reg.test(result)) {
							this.$message({
								message: `中文品名请输入中文、空格和数字`,
								type: 'error',
								duration: 2000
							})
						}
					}
				}
			}, 800)
		},
		checkEname(value, type) {
			clearTimeout(timer)
			timer = setTimeout(() => {
				let reg = /^[a-z_A-Z0-9-\.!@#\$%\\\^&\*\)\(\+=\{\}\[\]\/",'<>~\·`\?:;|]+$/
				if (value) {
					let result = value.replace(/\s+/g, '')
					if (!reg.test(result)) {
						this.$message({
							message: `${type}请输入英文、数字、空格和英文符号`,
							type: 'error',
							duration: 2000
						})
					}
				}
			}, 800)
		}
	}
}
</script>

<style lang="scss">
.air-cargo {
	.el-form-item__label {
		font-weight: 500;
	}
}
.so-container {
	padding-right: 0;
	// #so-list-form .el-form-item__content {
	//   margin-right: 0 !important;
	// }
	.so-total {
		margin: 15px 10px 0;
		line-height: 28px;
		height: 28px;
	}
	.air-cargo {
		margin: 5px 5px 0 !important;
	}
	.so-row-cont {
		border: 1px solid #e9e9e9;
		border-radius: 4px;
		overflow: hidden;
		&.margin0 {
			margin: 0;
		}
		&.mt10 {
			margin-top: 10px;
		}
		.row-cont-tit {
			background: rgba(248, 249, 253, 1);
			border-radius: 4px 4px 0px 0px;
			height: 32px;
			line-height: 32px;
			.tit {
				font-size: 14px;
				font-weight: bold;
				padding-left: 12px;
			}
			.delete {
				font-size: 20px;
				margin-right: 10px;
				margin-top: 6px;
				color: #999;
				cursor: pointer;
			}
			.row-cont-rt {
				font-size: 12px;
				float: right;
				padding-right: 12px;
				.el-checkbox {
					.el-checkbox__label {
						font-size: 12px;
					}
				}
				.expand {
					margin-left: 15px;
					cursor: pointer;
				}
			}
		}
		.row-flex {
			.btn-minus-search,
			.btn-plus-search {
				float: right;
				margin-right: 6px;
				margin-top: 24px;
			}
			&.flex-so {
				// border-bottom: 1px solid #e0e0e0;
				margin: 0 8px;
				padding-top: 0px;
				zoom: 1;
				&:last-child {
					border-bottom: 0;
				}
				// .item-cell {
				// float: left;
				// display: flex;
				// margin-bottom: 15px;
				// margin-right: 5px;
				.lab {
					line-height: 20px;
					margin-right: 5px;
					text-align: right;
					font-size: 12px;
				}
				.to {
					line-height: 20px;
					margin: 0 5px;
				}
				.el-form-item__label {
					line-height: 20px !important;
					padding-right: 3px !important;
				}
				.el-form-item__content {
					line-height: 20px !important;
				}
				.el-input {
					line-height: 20px !important;
				}
				.el-form-item__error {
					padding-top: 0;
				}
				.el-input-group__append,
				.el-input-group__prepend {
					line-height: 18px;
				}
				&.is-required {
					// label::before {
					//   display: none;
					// }
					// input,
					// select,
					// textarea,
					// .el-date-editor--daterange {
					//   background: #fef5f4;
					// }
					.is-disabled {
						input,
						select,
						textarea,
						.el-date-editor--daterange {
							background: #f5f7fa;
						}
					}
				}
				// }
				.btn-minus-search,
				.btn-plus-search {
					margin-top: 0;
				}
				.btn-plus-search {
					margin-right: 0;
				}
			}
			&.flex-so::after {
				display: block;
				clear: both;
				content: '';
				visibility: hidden;
				height: 0;
			}
			.flex-item {
				width: 25%;
				padding: 0 10px 0 10px;
				margin-bottom: 4px;
				float: left;
				.item-label {
					font-size: 12px;
					line-height: 20px;
					height: 20px;
					margin-bottom: 0;
					display: flex;
					span {
						display: block;
					}
					.lab {
						display: flex;
						em {
							font-style: normal;
						}
					}
				}
			}
		}
		.el-input--suffix .el-input__inner {
			padding-right: 20px;
		}
	}
	.form-box {
		overflow: hidden;
		.el-form-item {
			margin-bottom: 4px;
		}
	}
}

// @media (min-width: 1920px) {
//   .el-col-xl-cargo-short-item {
//     width: 14.28%;
//     .el-form-item__content {
//       width: calc(100% - 70px);
//     }
//   }
//   .el-col-xl-cargo-long-item {
//     width: 42.8%;
//     .el-form-item__content {
//       width: calc(100% - 70px);
//     }
//   }
// }
@media (min-width: 1600px) {
	.el-col-xl-cargo-short-item {
		width: 16.66%;
		.el-form-item__content {
			width: calc(100% - 70px);
		}
	}
	.cname-ename {
		width: 33.3%;
	}
	.el-col-xl-cargo-long-item {
		width: 100%;
		.el-form-item__content {
			width: calc(100% - 70px);
		}
	}
}
@media (max-width: 1599px) and (min-width: 1370px) {
	.el-col-xl-cargo-short-item {
		width: 20%;
		
		.el-form-item__content {
			width: calc(100% - 70px);
		}
	}
  .cname-ename {
			width: 40%;
		}

	.el-col-xl-cargo-long-item {
		width: 100%;
		.el-form-item__content {
			width: calc(100% - 70px);
		}
	}
}
@media (max-width: 1369px) {
	.el-col-xl-cargo-short-item {
		width: 25%;
		.el-form-item__content {
			width: calc(100% - 70px);
		}
	}
	.cname-ename {
		width: 50%;
	}
	.el-col-xl-cargo-long-item {
		width: 100%;
		.el-form-item__content {
			width: calc(100% - 70px);
		}
	}
}
.el-col-xl-cargo-middle-item {
	width: 50%;
	.el-form-item__content {
		width: calc(100% - 70px);
	}
}
.air-cargo-form {
	float: left;
	width: calc(100% - 70px);
}
.air-cargo-form100 {
	float: left;
	width: 100%;
}
.form-item-height {
	min-height: 22px;
}
</style>
