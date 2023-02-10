<template>
	<div class="so-container">
		<div class="so-total">
			<span v-if="!containerTotal.isNew" class="so-total-flex">
				<el-tooltip effect="dark" :content="containerTotal.container" placement="top-start" v-if="containerTotal.container">
					<span class="cyTotal">箱型箱量合计：{{ containerTotal.container }}</span>
				</el-tooltip>
				<span v-else class="cyTotal">箱型箱量合计：{{ containerTotal.container }}</span>
				<span class="quantityTotal">件数合计：{{ containerTotal.quantity }}</span>
				<span class="weightTotal">重量合计：{{ containerTotal.weight }}KGS</span>
				<span class="volumeTotal">体积合计：{{ containerTotal.volume }}CBM</span>
			</span>
			<template v-if="isBd && ['draft', 'refuse'].includes(orderStatus)">
				<el-button size="mini" type="primary" style="float: right" :disabled="viewState || isOp" @click="handelAddSo">添加箱型箱量</el-button>
			</template>
		</div>
		<!-- 箱型箱量 -->
		<el-form-item id="so-list-form" class="so-row-cont" v-for="(o, index) in createItem.soContainerList" :key="index" prop="">
			<div class="row-cont-tit">
				<span class="tit">
					<!-- <i class="icon-add-container" v-if="o.isAdd === 'Y'">加</i> -->
					箱型箱量(单SO)
				</span>
				<div class="row-cont-rt">
					<!-- 业务角色的草稿，拒绝订单状态的显示复选框并可编辑，其他角色，其他的订单状态的都只显示文字 -->
					<template v-if="isBd && ['draft', 'refuse'].includes(orderStatus)">
						<el-checkbox size="mini" v-model="o.isSplit" true-label="y" false-label="n" @change="handleCheckIsSplit">分开放舱</el-checkbox>
					</template>
					<span v-else :class="o.isSplit === 'y' ? 'green' : ''">{{ o.isSplit === 'y' ? '分开放舱' : '不分开放舱' }}</span>
					<template v-if="isBd && ['draft', 'refuse'].includes(orderStatus)">
						<el-button size="mini" type="text" class="ml10" :disabled="viewState || isOp" @click="handleDeleteSo(index)" v-if="index > 0">删除<i class="el-icon-close"></i></el-button>
					</template>
					<span class="expand" @click="handleToogleExpand(index)"> {{ !o.containerListShowState ? '收起' : '展开' }}<i :class="!o.containerListShowState ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
				</div>
			</div>
			<div v-show="!o.containerListShowState" style="padding: 8px 0 5px">
				<el-form class="row-flex flex-so" v-for="(item, sIndex) in o.containerList" :key="sIndex" :model="createItem.soContainerList[index]" ref="containerList">
					<div class="btn-plus-search" @click="handleAddContainerList(o.containerList)" v-if="!viewState && !isOp"></div>
					<div class="btn-minus-search" @click="handleDeleteContainerList(index, sIndex)" v-if="sIndex > 0 && !viewState && !isOp"></div>
					<div class="row-flex-cont">
						<div class="flex">
							<el-form-item class="item-cell" label="箱型" :prop="`containerList.${sIndex}.containerType`" :show-message="false" :rules="{ required: isBd, message: ' ', trigger: 'change' }">
								<el-select @change="handleTypeChange(item)" filterable size="mini" v-model="item.containerType" style="width: 100px" clearable placeholder="请选择" :disabled="viewState || isOp">
									<el-option v-for="item in dictMap.containerTypeShiporder" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</el-form-item>
							<el-form-item class="item-cell" label="箱量" :prop="`containerList.${sIndex}.containerNum`" :show-message="false" :rules="[{ required: isBd, validator: checkContainerNum, trigger: 'blur' }]">
								<el-input size="mini" v-model.number="item.containerNum" clearable placeholder="请输入" style="width: 100px" :disabled="viewState || isOp" @blur="validateContainerNum(item)" />
							</el-form-item>
							<el-form-item class="item-cell" label="单柜件数" :prop="`containerList.${sIndex}.quantity`" :show-message="false">
								<el-input clearable size="mini" v-model="item.quantity" placeholder="请输入" style="width: 100px" :disabled="viewState || isOp" @blur="validateQuantityNum(item)"></el-input>
							</el-form-item>
							<el-form-item class="item-cell" label="单柜重量" :prop="`containerList.${sIndex}.weight`" :show-message="false" :rules="[{ required: isBd, validator: checkWeight, trigger: 'blur' }]">
								<el-input clearable size="mini" v-model="item.weight" placeholder="请输入" style="width: 100px" :disabled="viewState || isOp" @blur="validateWeight(item)"><template slot="append">KGS</template></el-input>
							</el-form-item>
							<el-form-item class="item-cell" label="单柜体积" :prop="`containerList.${sIndex}.volume`" :show-message="false" :rules="[{ required: false, trigger: 'blur' }]">
								<el-input clearable size="mini" v-model="item.volume" placeholder="请输入" style="width: 100px" :disabled="viewState || isOp" @blur="validateVolume(item)"><template slot="append">CBM</template></el-input>
							</el-form-item>
							<el-form-item class="item-cell" label="包装" :prop="`containerList.${sIndex}.packageInfo`" :show-message="false">
								<el-select size="mini" v-model="item.packageInfo" placeholder="请选择包装" clearable filterable style="width: 100px" :disabled="viewState || isOp">
									<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
								</el-select>
							</el-form-item>
							<el-form-item class="item-cell" label="是否重柜" :prop="`containerList.${sIndex}.isHeavy`" :show-message="false" :rules="{ required: isBd, message: '请选择是否重柜', trigger: 'change' }">
								<el-select size="mini" v-model="item.isHeavy" style="width: 100px" clearable placeholder="请选择" :disabled="viewState || isOp">
									<el-option v-for="ele in yesOrNoOptions" :key="ele.value" :label="ele.label" :value="ele.value"> </el-option>
								</el-select>
							</el-form-item>
							<div class="item-cell">
								<span class="lab">用箱要求</span>
								<el-select size="mini" v-model="item.boxRemark" style="width: 100px" clearable placeholder="请选择" :disabled="viewState || isOp">
									<el-option v-for="item in dictMap.boxRemark" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</div>
						</div>
						<div class="flex" style="clear: both">
							<el-form-item class="item-cell redStar" label="特种长宽高" v-if="item.containerType && (item.containerType.toUpperCase().indexOf('OT') !== -1 || item.containerType.toUpperCase().indexOf('FR') !== -1)">
								<el-col :span="8">
									<el-form-item :prop="`containerList.${sIndex}.specialLength`" :show-message="false" :rules="[{ required: isBd, validator: checkWeight, trigger: 'blur' }]">
										<el-input clearable size="mini" v-model="item.specialLength" placeholder="请输入" style="width: 100px; margin-right: 5px" :disabled="viewState || isOp" @blur="validateSpecial(item, 'specialLength')">
											<template slot="prepend">长</template>
											<template slot="append">m</template>
										</el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item :prop="`containerList.${sIndex}.specialWidth`" :show-message="false" :rules="[{ required: isBd, validator: checkWeight, trigger: 'blur' }]">
										<el-input clearable size="mini" v-model="item.specialWidth" placeholder="请输入" style="width: 100px; margin-right: 5px" :disabled="viewState || isOp" @blur="validateSpecial(item, 'specialWidth')">
											<template slot="prepend">宽</template>
											<template slot="append">m</template>
										</el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item :prop="`containerList.${sIndex}.specialHeight`" :show-message="false" :rules="[{ required: isBd, validator: checkWeight, trigger: 'blur' }]">
										<el-input clearable size="mini" v-model="item.specialHeight" placeholder="请输入" style="width: 100px" :disabled="viewState || isOp" @blur="validateSpecial(item, 'specialHeight')">
											<template slot="prepend">高</template>
											<template slot="append">m</template>
										</el-input>
									</el-form-item>
								</el-col>
							</el-form-item>
							<div class="item-cell" v-if="item.containerType && (item.containerType.toUpperCase().indexOf('OT') !== -1 || item.containerType.toUpperCase().indexOf('FR') !== -1)">
								<span class="lab">是否超尺寸</span>
								<el-select size="mini" v-model="item.gangeType" style="width: 80px" clearable placeholder="请选择" :disabled="viewState || isOp">
									<el-option v-for="item in gangeTypeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</div>
							<div class="item-cell" v-if="item.containerType && (item.containerType.toUpperCase().indexOf('OT') !== -1 || item.containerType.toUpperCase().indexOf('FR') !== -1)">
								<span class="lab">超限</span>
								<el-input clearable size="mini" v-model="item.sizeBefore" placeholder="请输入" style="width: 100px; margin-right: 5px" :disabled="viewState" @blur="validateSpecial(item, 'sizeBefore')">
									<template slot="prepend">前</template>
									<template slot="append">m</template>
								</el-input>
								<el-input clearable size="mini" v-model="item.sizeAfter" placeholder="请输入" style="width: 100px; margin-right: 5px" :disabled="viewState" @blur="validateSpecial(item, 'sizeAfter')">
									<template slot="prepend">后</template>
									<template slot="append">m</template>
								</el-input>
								<el-input clearable size="mini" v-model="item.sizeLeft" placeholder="请输入" style="width: 100px; margin-right: 5px" :disabled="viewState" @blur="validateSpecial(item, 'sizeLeft')">
									<template slot="prepend">左</template>
									<template slot="append">m</template>
								</el-input>
								<el-input clearable size="mini" v-model="item.sizeRight" placeholder="请输入" style="width: 100px; margin-right: 5px" :disabled="viewState" @blur="validateSpecial(item, 'sizeRight')">
									<template slot="prepend">右</template>
									<template slot="append">m</template>
								</el-input>
								<el-input clearable size="mini" v-model="item.sizeTop" placeholder="请输入" style="width: 100px" :disabled="viewState" @blur="validateSpecial(item, 'sizeTop')">
									<template slot="prepend">高</template>
									<template slot="append">m</template>
								</el-input>
							</div>
							<el-form-item
								class="item-cell"
								label="单位"
								:prop="`containerList.${sIndex}.temperatureType`"
								:show-message="false"
								:rules="{ required: isBd, message: '请选择单位', trigger: 'change' }"
								v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1"
							>
								<el-select size="mini" v-model="item.temperatureType" style="width: 100px" clearable placeholder="请选择" :disabled="viewState || isOp">
									<el-option v-for="item in dictMap.temperatureType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</el-form-item>
							<el-form-item
								class="item-cell"
								label="设置温度"
								:prop="`containerList.${sIndex}.temperatureSet`"
								:show-message="false"
								:rules="[{ required: isBd, validator: checkTemprature, trigger: 'blur' }]"
								v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1"
							>
								<el-input size="mini" v-model="item.temperatureSet" clearable placeholder="请输入" style="width: 100px" :disabled="viewState || isOp" @blur="validateTemprature(item, 'temperatureSet')"></el-input>
							</el-form-item>
							<el-form-item
								class="item-cell"
								label="最低温度"
								:prop="`containerList.${sIndex}.temperatureMin`"
								:show-message="false"
								:rules="[{ required: isBd, validator: checkTemprature, trigger: 'blur' }]"
								v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1"
							>
								<el-input size="mini" v-model="item.temperatureMin" clearable placeholder="请输入" style="width: 100px" :disabled="viewState || isOp" @blur="validateTemprature(item, 'temperatureMin')"></el-input>
							</el-form-item>
							<el-form-item
								class="item-cell"
								label="最高温度"
								:prop="`containerList.${sIndex}.temperatureMax`"
								:show-message="false"
								:rules="[{ required: isBd, validator: checkTemprature, trigger: 'blur', item: item }]"
								v-if="item.containerType.toUpperCase().indexOf('RF') !== -1"
							>
								<el-input size="mini" v-model="item.temperatureMax" clearable placeholder="请输入" style="width: 100px" :disabled="viewState || isOp" @blur="validateTemprature(item, 'temperatureMax')"></el-input>
							</el-form-item>
							<el-form-item
								class="item-cell"
								label="通风量"
								:prop="`containerList.${sIndex}.airMete`"
								:show-message="false"
								:rules="[{ required: isBd, message: '请输入', trigger: 'blur' }]"
								v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1"
							>
								<el-input clearable size="mini" v-model="item.airMete" placeholder="请输入" style="width: 100px" :disabled="viewState || isOp" @blur="validateTemprature(item, 'airMete')">
									<template slot="append">CBM/时</template>
								</el-input>
							</el-form-item>
							<el-form-item
								class="item-cell"
								label="湿度要求"
								:prop="`containerList.${sIndex}.humidity`"
								:show-message="false"
								:rules="{ required: isBd, message: '请输入湿度要求', trigger: 'blur' }"
								v-if="item.containerType.toUpperCase().indexOf('RF') !== -1"
							>
								<el-input size="mini" v-model="item.humidity" clearable placeholder="请输入" style="width: 100px" :disabled="viewState || isOp"></el-input>
							</el-form-item>
						</div>
					</div>
				</el-form>
			</div>
		</el-form-item>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { quantityMixin } from '@/views/order/order/mixins/quantityMixin'
import { soList } from '@/api/order/book/list'

export default {
	mixins: [quantityMixin],
	data() {
		return {
			oQuery: this.$route.query,
			yesOrNoOptions: [
				{ label: '是', value: 'y' },
				{ label: '否', value: 'n' }
			],
			gangeTypeOptions: [
				{ label: 'IN GAUGE', value: 'in' },
				{ label: 'OUT OF GAUGE', value: 'out' }
			]
		}
	},
	props: {
		containerTotal: {
			type: Object,
			default: () => ({})
		},
		createItem: {
			type: Object,
			default: () => ({})
		},
		orderStatus: {
			type: String,
			default: ''
		}
	},
	created() {},
	mounted() {},
	computed: {
		isEpricing() {
			return this.ordDetRole === 'epricing'
		},
		isEcs() {
			return this.ordDetRole === 'ecs'
		},
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole
		}),
		viewState() {
			// doc,ac,op_truck角色的置灰，只读
			if (!this.ordDetRole || this.isDoc || this.isEpricing || this.isEcs || this.isAc || this.isOpTruck || (!this.isOp && !this.isBd)) {
				return true
			}
			// bd角色，草稿和拒绝状态的可以编辑，除了草稿和拒绝状态的都置灰，只读
			if (this.isBd && !['draft', 'refuse'].includes(this.orderStatus)) {
				return true
			}
			// op角色，审核通过的可以编辑，除了审核通过的都置灰，只读
			if (this.isOp && !['pass'].includes(this.orderStatus)) {
				return true
			}
			// 接单生成的 只读
			if (this.$route.query.isPendding === 'pendding') {
				return true
			}
			return false
			// return this.oQuery.action === 'view' || this.orderStatus !== 'draft'
		},
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isOpTruck() {
			return this.ordDetRole === 'op_truck'
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		}
	},
	watch: {},
	components: {},
	methods: {
		//选择柜型设置是否重柜
		handleTypeChange(item) {
			// 变更箱型项链获取运价免用免堆信息
			this.$emit('getFreeTimeSys')
			// this.$emit('emptyFreeTimeSys')
			if (item.containerType === '20HD' || item.containerType === '40HD') {
				item.isHeavy = 'y'
			} else {
				item.isHeavy = 'n'
			}
		},
		// 箱型箱量展开收起
		handleToogleExpand(index) {
			let { containerListShowState } = this.createItem.soContainerList[index]
			this.$set(this.createItem.soContainerList[index], 'containerListShowState', !containerListShowState)
		},

		handleCheckIsSplit(val) {
			// console.log(this.createItem.soContainerList)
		},

		// 增加一组so
		handelAddSo() {
			this.createItem.soContainerList.push({
				isSplit: 'n',
				containerList: [{ containerType: '', isHeavy: '' }]
			})
			this.$emit('getFreeTimeSys')
		},

		// 删除一组so
		handleDeleteSo(index) {
			this.createItem.soContainerList = this.createItem.soContainerList.filter((item, sIndex) => {
				return index !== sIndex
			})
			this.$emit('getFreeTimeSys')
		},

		// 增加一行箱型箱量
		handleAddContainerList(data) {
			data.push({ containerType: '', isHeavy: '' })
			this.$emit('getFreeTimeSys')
			console.log(data)
		},

		// 删除一行箱型箱量
		handleDeleteContainerList(i, index) {
			let containerList = this.createItem.soContainerList[i].containerList
			this.createItem.soContainerList[i].containerList = containerList.filter((item, sIndex) => {
				return sIndex !== index
			})
			this.$emit('getFreeTimeSys')
			console.log(this.createItem.soContainerList)
		},

		// 箱量校验
		checkContainerNum(rule, value, callback) {
			if (!Number.isInteger(value)) {
				callback(new Error('请输入数字值'))
			} else {
				if (value <= 0) {
					callback(new Error('请输入正整数'))
				} else {
					callback()
				}
			}
		},

		checkNum(rule, value, callback) {
			if (!Number.isInteger(value)) {
				callback(new Error('请输入数字值'))
			} else {
				if (value <= 0) {
					callback(new Error('请输入正整数'))
				} else {
					callback()
				}
			}
		},
		checkTemprature(rule, value, callback, item) {
			let reg = /^\-?[0-9]\d*\.?\d*$/
			console.log(item)
			if (!value) {
				callback(new Error('请输入'))
			} else if (!reg.test(value)) {
				callback(new Error('请输入数字'))
			} else {
				callback()
			}
		},
		checkWeight(rule, value, callback, item) {
			let reg = /^\-?[0-9]\d*\.?\d*$/
			console.log(item, value)
			if (!value) {
				callback(new Error('请输入'))
			} else if (!reg.test(value)) {
				callback(new Error('请输入数字'))
			} else {
				callback()
			}
		}
	}
}
</script>

<style lang="scss">
.so-container {
	padding-right: 0;
	#so-list-form .el-form-item__content {
		margin-right: 0 !important;
	}
	.so-total {
		margin: 0 8px;
		line-height: 20px;
		height: 20px;
		overflow: hidden;
		.so-total-flex {
			float: left;
			display: flex;
			width: 88.5%;
			padding-right: 20px;
			span {
				display: block;
				&.cyTotal {
					// flex: 1;
					white-space: nowrap;
					text-overflow: ellipsis;
					overflow: hidden;
				}
				&.quantityTotal {
					max-width: 150px;
					margin-left: 10px;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
				}
				&.weightTotal {
					max-width: 200px;
					margin-left: 10px;
				}
				&.volumeTotal {
					max-width: 180px;
					margin-left: 10px;
					// flex: 1;
				}
			}
		}
	}
	.so-row-cont {
		border: 1px solid #e9e9e9;
		border-radius: 4px;
		margin: 4px 8px 0;
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
				font-size: 12px;
				font-weight: bold;
				padding-left: 12px;
				.icon-add-container {
					font-size: 12px;
					display: inline-block;
					color: #fff;
					background: #ef8519;
					width: 16px;
					height: 16px;
					border-radius: 2px;
					font-style: normal;
					line-height: 16px;
					text-align: center;
					font-size: 12px;
					margin-right: 5px;
				}
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
				display: inline-block;
				margin-right: 6px;
				margin-top: 24px;
			}
			&.flex-so {
				// border-bottom: 1px solid #e0e0e0;
				margin: 0 6px 0 0;
				padding-top: 0;
				zoom: 1;
				.row-flex-cont {
					float: left;
					max-width: 94.9%;
				}
				&:last-child {
					border-bottom: 0;
				}
				.item-cell {
					float: left;
					display: flex;
					margin-bottom: 4px;
					// margin-right: 5px;
					height: 20px;
					&.redStar {
						.el-form-item__label {
							&::before {
								content: '*';
								color: #ff4949;
							}
						}
					}
					.lab {
						line-height: 20px;
						// margin-right: 5px;
						text-align: right;
						font-size: 12px;
						width: 70px;
						padding-right: 4px;
					}
					.to {
						line-height: 20px;
						margin: 0 5px;
					}
					.el-form-item__label {
						line-height: 20px !important;
						padding-right: 3px;
						width: 70px;
					}
					.el-form-item__content {
						line-height: 20px !important;
						.el-form-item {
							margin-bottom: 0;
						}
					}
					.el-input {
						line-height: 20px !important;
					}
					.el-form-item__error {
						padding-top: 0;
					}
					.el-input__suffix {
						right: 0;
					}
					.el-input-group__append,
					.el-input-group__prepend {
						line-height: 18px;
						padding: 0 2px;
						letter-spacing: -1px;
					}
					&.is-required {
						label::before {
							// display: none;
							margin-right: 0;
						}
						// input, select, textarea, .el-date-editor--daterange{
						// 	background: #fef5f4;
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
				}
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
					// justify-content: space-between;
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
}
</style>
