<template>
	<div class="so-container-occupy">
		<div class="so-total" :class="isBkg ? 'bold' : ''">
			<span v-if="!containerTotal.isNew" class="so-total-flex" :style="{width: isBkg ? '100%' : ''}">
				<el-tooltip effect="dark" :content="containerTotal.container" placement="top-start" v-if="containerTotal.container">
					<span class="cyTotal">
						<i class="icon-new-cont" v-if="isAdjust">新</i>
						<em>{{isAdjust ? '调整后的' : ''}}箱型箱量合计：</em>
						{{ containerTotal.container }}
					</span>
				</el-tooltip>
				<span v-else class="cyTotal">箱型箱量合计：{{ containerTotal.container }}</span>
				<span class="quantityTotal">件数合计：{{ containerTotal.quantity }}</span>
				<template v-if="isBkg">
					<el-tooltip effect="dark" :content="containerTotal.weightStr" placement="top-start" v-if="containerTotal.weightStr">
						<span class="cyTotal ml10">单柜重量：{{ containerTotal.weightStr }}</span>
					</el-tooltip>
					<span v-else class="cyTotal ml10">单柜重量：{{ containerTotal.weightStr }}</span>
				</template>
				<span class="weightTotal">重量合计：{{ containerTotal.weight }}KGS</span>
				<span class="volumeTotal">体积合计：{{ containerTotal.volume }}CBM</span>
			</span>
			<template v-if="!disabledState">
				<el-button size="mini" type="primary" style="float: right" @click="handelAddSo" v-if="isPricing" :disabled="disabledState">添加箱型箱量</el-button>
			</template>
		</div>
		<div class="new-tip" v-if="isAdjust">* 调整后的箱型箱量，是有包含原箱型箱量的哦，请注意不要加少了~</div>
		<!-- 箱型箱量 -->
		<el-form-item id="so-list-form" class="so-row-cont" v-for="(o, index) in createItem.soContainerList" :key="index" prop="">
			<div class="row-cont-tit">
				<span class="tit" :class="isAdjust ? 'red' : ''">
					<!-- <i class="icon-add-container" v-if="isAdjust">加</i> -->
					箱型箱量(单SO)
				</span>
				<div class="row-cont-rt">
					<!-- 显示复选框并可编辑 -->
					<template v-if="!disabledState">
						<el-checkbox size="mini" v-model="o.isSplit" true-label="y" false-label="n" @change="handleCheckIsSplit">分开放舱</el-checkbox>
					</template>
					<span v-else :class="o.isSplit === 'y' ? 'green' : ''">{{o.isSplit === 'y' ? '分开放舱' : '不分开放舱'}}</span>
					<!-- <el-checkbox size="mini" v-model="o.isSplit" true-label="y" false-label="n" @change="handleCheckIsSplit" :disabled="disabledState">分开放舱</el-checkbox> -->
					<el-button size="mini" type="text" class="ml10" @click="handleDeleteSo(index)" v-if="index > 0 && isPricing && !disabledState">删除<i class="el-icon-close"></i></el-button>
					<span class="expand" @click="handleToogleExpand(index)"> {{ !o.containerListShowState ? '收起' : '展开' }}<i :class="!o.containerListShowState ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
				</div>
			</div>
			<div v-show="!o.containerListShowState" style="padding: 8px 0 5px">
				<el-form class="row-flex flex-so" v-for="(item, sIndex) in o.containerList" :key="sIndex" :model="createItem.soContainerList[index]" ref="containerList">
					<div class="btn-plus-search" @click="handleAddContainerList(o.containerList)" v-if="isPricing && !disabledState"></div>
					<div class="btn-minus-search" v-if="sIndex > 0 && isPricing && !disabledState" @click="handleDeleteContainerList(index, sIndex)"></div>
					<div class="row-flex-cont" :style="{width: isBkg ? '100%' : ''}">
						<div class="flex">
							<el-form-item class="item-cell containerType" label="箱型" :prop="`containerList.${sIndex}.containerType`" :show-message="false" :rules="{ required: true, message: ' ', trigger: 'change' }">
								<el-select @change="handleTypeChange(item)" filterable size="mini" v-model="item.containerType" style="width: 100px" clearable placeholder="请选择" :disabled="disabledState">
									<el-option v-for="item in dictMap.containerTypeShiporder" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</el-form-item>
							<el-form-item class="item-cell" label="箱量" :prop="`containerList.${sIndex}.containerNum`" :show-message="false" :rules="[{ required: true, validator: checkContainerNum, trigger: 'blur' }]">
								<el-input size="mini" v-model.number="item.containerNum" clearable placeholder="请输入" style="width: 100px" :disabled="disabledState" @blur="validateContainerNum(item)"/>
							</el-form-item>
							<el-form-item class="item-cell specialWidth" label="单柜件数" :prop="`containerList.${sIndex}.quantity`" :show-message="false">
								<el-input clearable size="mini" v-model="item.quantity" placeholder="请输入" style="width: 100px" :disabled="disabledState" @blur="validateQuantityNum(item)"></el-input>
							</el-form-item>
							<el-form-item class="item-cell" label="单柜重量" :prop="`containerList.${sIndex}.weight`" :show-message="false" :rules="[{ required: true, validator: checkWeight, trigger: 'blur' }]">
								<el-input clearable size="mini" v-model="item.weight" placeholder="请输入" style="width: 100px" :disabled="disabledState" @blur="validateWeight(item)"><template slot="append">KGS</template></el-input>
							</el-form-item>
							<el-form-item class="item-cell" label="单柜体积" :prop="`containerList.${sIndex}.volume`" :show-message="false" :rules="[{ required: false, trigger: 'blur' }]">
								<el-input clearable size="mini" v-model="item.volume" placeholder="请输入" style="width: 100px" :disabled="disabledState" @blur="validateVolume(item)"><template slot="append">CBM</template></el-input>
							</el-form-item>
							<el-form-item class="item-cell specialWidth" label="包装" :prop="`containerList.${sIndex}.packageInfo`" :show-message="false">
								<el-select size="mini" v-model="item.packageInfo" placeholder="请选择包装" clearable filterable style="width: 100px" :disabled="disabledState">
									<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
								</el-select>
							</el-form-item>	
							<el-form-item class="item-cell" label="是否重柜" :prop="`containerList.${sIndex}.isHeavy`" :show-message="false" :rules="{ required: true, message: '请选择是否重柜', trigger: 'change' }">
								<el-select size="mini" v-model="item.isHeavy" style="width: 100px" clearable placeholder="请选择" :disabled="disabledState">
									<el-option v-for="ele in yesOrNoOptions" :key="ele.value" :label="ele.label" :value="ele.value"> </el-option>
								</el-select>
							</el-form-item>
							<div class="item-cell">
								<span class="lab">用箱要求</span>
								<el-select size="mini" v-model="item.boxRemark" style="width: 100px;" clearable placeholder="请选择" :disabled="disabledState">
									<el-option v-for="item in dictMap.boxRemark" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</div>
						</div>
						<div class="flex">
							<el-form-item class="item-cell specialWidth redStar" label="特种长宽高" v-if="item.containerType && (item.containerType.toUpperCase().indexOf('OT') !== -1 || item.containerType.toUpperCase().indexOf('FR') !== -1)">
								<el-col :span="8">
									<el-form-item :prop="`containerList.${sIndex}.specialLength`" :show-message="false" :rules="[{ required: true, validator: checkWeight, trigger: 'blur' }]">
										<el-input clearable size="mini" v-model="item.specialLength" placeholder="请输入" style="width: 120px; margin-right: 5px" :disabled="disabledState" @blur="validateSpecial(item, 'specialLength')">>
											<template slot="prepend">长</template>
											<template slot="append">m</template>
										</el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item :prop="`containerList.${sIndex}.specialWidth`" :show-message="false" :rules="[{ required: true, validator: checkWeight, trigger: 'blur' }]">
										<el-input clearable size="mini" v-model="item.specialWidth" placeholder="请输入" style="width: 120px; margin-right: 5px" :disabled="disabledState" @blur="validateSpecial(item, 'specialWidth')">
											<template slot="prepend">宽</template>
											<template slot="append">m</template>
										</el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item :prop="`containerList.${sIndex}.specialHeight`" :show-message="false" :rules="[{ required: true, validator: checkWeight, trigger: 'blur' }]">
										<el-input clearable size="mini" v-model="item.specialHeight" placeholder="请输入" style="width: 120px;" :disabled="disabledState" @blur="validateSpecial(item, 'specialHeight')">
											<template slot="prepend">高</template>
											<template slot="append">m</template>
										</el-input>
									</el-form-item>
								</el-col>
							</el-form-item>
							<div class="item-cell specialWidth" v-if="item.containerType && (item.containerType.toUpperCase().indexOf('OT') !== -1 || item.containerType.toUpperCase().indexOf('FR') !== -1)">
								<span class="lab">是否超尺寸</span>
								<el-select size="mini" v-model="item.gangeType" style="width: 100px;" clearable placeholder="请选择" :disabled="disabledState">
									<el-option v-for="item in gangeTypeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</div>
							<div class="item-cell" v-if="item.containerType && (item.containerType.toUpperCase().indexOf('OT') !== -1 || item.containerType.toUpperCase().indexOf('FR') !== -1)">
								<span class="lab">超限</span>
								<el-input clearable size="mini" v-model="item.sizeBefore" placeholder="请输入" style="width: 110px;margin-right: 5px" :disabled="disabledState" @blur="validateSpecial(item, 'sizeBefore')">
									<template slot="prepend">前</template>
									<template slot="append">m</template>
								</el-input>
								<el-input clearable size="mini" v-model="item.sizeAfter" placeholder="请输入" style="width: 110px;margin-right: 5px" :disabled="disabledState" @blur="validateSpecial(item, 'sizeAfter')">
									<template slot="prepend">后</template>
									<template slot="append">m</template>
								</el-input>
								<el-input clearable size="mini" v-model="item.sizeLeft" placeholder="请输入" style="width: 110px;margin-right: 5px" :disabled="disabledState" @blur="validateSpecial(item, 'sizeLeft')">
									<template slot="prepend">左</template>
									<template slot="append">m</template>
								</el-input>
								<el-input clearable size="mini" v-model="item.sizeRight" placeholder="请输入" style="width: 110px;margin-right: 5px" :disabled="disabledState" @blur="validateSpecial(item, 'sizeRight')">
									<template slot="prepend">右</template>
									<template slot="append">m</template>
								</el-input>
								<el-input clearable size="mini" v-model="item.sizeTop" placeholder="请输入" style="width: 110px;" :disabled="disabledState" @blur="validateSpecial(item, 'sizeTop')">
									<template slot="prepend">高</template>
									<template slot="append">m</template>
								</el-input>
							</div>
							<el-form-item
								class="item-cell"
								label="单位"
								:prop="`containerList.${sIndex}.temperatureType`"
								:show-message="false"
								:rules="{ required: true, message: '请选择单位', trigger: 'change' }"
								v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1"
							>
								<el-select size="mini" v-model="item.temperatureType" style="width: 100px;" clearable placeholder="请选择" :disabled="disabledState">
									<el-option v-for="item in dictMap.temperatureType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</el-form-item>
							<el-form-item
								class="item-cell"
								label="设置温度"
								:prop="`containerList.${sIndex}.temperatureSet`"
								:show-message="false"
								:rules="[{ required: true, validator: checkTemprature, trigger: 'blur' }]"
								v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1"
							>
								<el-input size="mini" v-model="item.temperatureSet" clearable placeholder="请输入" style="width: 100px;" :disabled="disabledState" @blur="validateTemprature(item, 'temperatureSet')"></el-input>
							</el-form-item>
							<el-form-item
								class="item-cell"
								label="最低温度"
								:prop="`containerList.${sIndex}.temperatureMin`"
								:show-message="false"
								:rules="[{ required: true, validator: checkTemprature, trigger: 'blur' }]"
								v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1"
							>
								<el-input size="mini" v-model="item.temperatureMin" clearable placeholder="请输入" style="width: 100px;" :disabled="disabledState" @blur="validateTemprature(item, 'temperatureMin')"></el-input>
							</el-form-item>
							<el-form-item
								class="item-cell"
								label="最高温度"
								:prop="`containerList.${sIndex}.temperatureMax`"
								:show-message="false"
								:rules="[{ required: true, validator: checkTemprature, trigger: 'blur', item: item }]"
								v-if="item.containerType.toUpperCase().indexOf('RF') !== -1"
							>
								<el-input size="mini" v-model="item.temperatureMax" clearable placeholder="请输入" style="width: 100px;" :disabled="disabledState" @blur="validateTemprature(item, 'temperatureMax')"></el-input>
							</el-form-item>
							<el-form-item
								class="item-cell"
								label="通风量"
								:prop="`containerList.${sIndex}.airMete`"
								:show-message="false"
								:rules="[{ required: true, message: '请输入', trigger: 'blur' }]"
								v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1"
							>
								<el-input clearable size="mini" v-model="item.airMete" placeholder="请输入" style="width: 100px;" :disabled="disabledState" @blur="validateTemprature(item, 'airMete')">
									<template slot="append">CBM/时</template>
								</el-input>
							</el-form-item>
							<el-form-item
								class="item-cell"
								label="湿度要求"
								:prop="`containerList.${sIndex}.humidity`"
								:show-message="false"
								:rules="{ required: true, message: '请输入湿度要求', trigger: 'blur' }"
								v-if="item.containerType.toUpperCase().indexOf('RF') !== -1"
							>
								<el-input size="mini" v-model="item.humidity" clearable placeholder="请输入" style="width: 100px;" :disabled="disabledState"></el-input>
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
import {quantityMixin} from '@/views/order/order/mixins/quantityMixin'

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
			],
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
		},
		bookDetailForm: {
			type: Object,
			default: () => ({})
		},
	},
	created() {
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userId: state => state.user.userId
		}),
		roles() {
      return this.$route.query.roles ? this.$route.query.roles.split(',') : []
		},
		isPricing() {
			return this.roles.includes('pricing')
		},
		isBkg() {
			return this.roles.includes('bkg')
		},
		disabledState() {
			let result = false
			let {auditEmployeeId, orgAuditEmployeeId, reqType, portModifyInfo, bkgStatus} = this.bookDetailForm
			if (this.isBkg) {
				result = true
			}
			// 无订单号的是占舱单
			if (!this.$route.query.orderNo) {
				if (['pass','booking','booked','book_release','refuse'].includes(bkgStatus)) {
					result = true
				}
			}
			// 订舱单
			if (this.isPricing) {
				// 有协助审核人的不可编辑，核通过的不可编辑
				if (auditEmployeeId && orgAuditEmployeeId && auditEmployeeId !== this.userId || ['pass','booking','booked','book_release','refuse'].includes(bkgStatus)) {
          result = true
				}
				// 改船的不可编辑
        if (portModifyInfo && Object.keys(portModifyInfo).length) {
          return true
        }
				console.log('result', result)
			}
 			return result
		},
		// 加柜类型
		isAddCont() {
			return this.bookDetailForm.containerModifyInfo && Object.keys(this.bookDetailForm.containerModifyInfo).length ? true : false
		},
		isAdjust() {
			let {containerModifyInfo} = this.bookDetailForm
			if (this.isPricing) {
				return this.isAddCont
			}
			// bkg显示，待审核的
			if (this.isBkg) {
				return this.isAddCont && !['book_refuse', 'refuse', 'submit'].includes(containerModifyInfo.bkgStatus)
			}
		},
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

		handleCheckIsSplit(val) {},

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
			data.push({ containerType: '', isHeavy: ''  })
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
			console.log(item)
			if (!value) {
				callback(new Error('请输入'))
			} else if (!reg.test(value)) {
				callback(new Error('请输入数字'))
			} else {
				callback()
			}
		},
	}
}
</script>

<style lang="scss">
.so-container-occupy {
	padding-right: 0;
	margin-bottom: 5px;
	#so-list-form .el-form-item__content {
		margin-right: 0 !important;
	}
	.so-total {
		margin: 0 8px 4px 8px !important;
		line-height: 20px;
		height: 20px;
		font-size: 12px;	
		overflow: hidden;
		.so-total-flex{
			float: left;
			// display: flex;
			width: 88.5%;
			padding-right: 20px;
			.icon-new-cont{
				border: 1px solid #ff4949;
				line-height: 16px;
				width: 16px;
				height: 16px;
				text-align: center;
				font-size: 12px;
				display: inline-block;
				font-style: normal;
				color: #ff4949;
				margin-right: 5px;
			}
			span{
				display: inline-block;
				&.cyTotal{
					// flex: 1;
					white-space: nowrap;
					text-overflow: ellipsis;
					overflow: hidden;
					max-width: 30%;
					em{
						font-style: normal;
						&.red{
							color: #ff4949;
						}
					}					
				}
				&.quantityTotal{
					max-width: 150px;
					margin-left: 10px;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
				}
				&.weightTotal{
					max-width: 200px;
					margin-left: 10px;
					overflow: hidden;
				}
				&.volumeTotal{
					max-width: 180px;
					margin-left: 10px;
					overflow: hidden;
					// flex: 1;
				}
			}
		}
		&.bold{
			font-weight: bold;
		}
		.el-button--mini{
			padding: 0 8px;
    	height: 20px;
		}
	}
	.new-tip{
		color: #ff4949;
		font-size: 12px;
		margin-left: 8px;
		line-height: 16px;
	}
	.so-row-cont {
		border: 1px solid #e9e9e9;
		border-radius: 4px;
		margin: 4px 8px 0 !important;
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
			height: 24px;
			line-height: 24px;
			.tit {
				font-size: 12px;
				font-weight: bold;
				padding-left: 12px;
				&.red{
					color: #ff4949;
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
				.row-flex-cont{
					float: left;
					max-width: 95.8%;
					.flex{
						position: relative;
					}
				}
				&:last-child {
					border-bottom: 0;
				}
				.item-cell {
					float: left;
					display: flex;
					margin-bottom: 4px;
					margin-right: 5px;
					&.redStar{
						.el-form-item__label{
							&::before{
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
					&.specialWidth .el-form-item__label, &.specialWidth .lab{
						width: 70px;
					}
					.el-form-item__content {
						line-height: 20px !important;
						.el-form-item{
							margin-bottom: 0px !important;
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
					}
					&.is-required {
						label::before {
							// display: none;
							margin-top: 0;
						}
						// input,
						// select,
						// textarea,
						// .el-date-editor--daterange {
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
		.el-input--mini .el-input__icon {
    	line-height: 20px;
		}
	}
	.icon-add-container{
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
		&.abs{
			position: absolute;
			top: 2px;
			left: 10px;
		}
	}
}
</style>
