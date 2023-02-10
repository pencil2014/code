<template>
	<div class="so-container">
		<div class="so-total">
			<span class="so-total-flex">
				<el-tooltip effect="dark" :content="containerTotal.container" placement="top-start" v-if="containerTotal.container">
					<span class="cyTotal">
						<i class="icon-new-cont">新</i>
						<em class="">调整后的箱型箱量合计：</em>
						{{ containerTotal.container }}
					</span>
				</el-tooltip>
				<span v-else class="cyTotal">调整后的箱型箱量合计：{{ containerTotal.container }}</span>
				<span class="quantityTotal">件数合计：{{ containerTotal.quantity }}</span>
				<span class="weightTotal">重量合计：{{ containerTotal.weight }}KGS</span>
				<span class="volumeTotal">体积合计：{{ containerTotal.volume }}CBM</span>
			</span>
			<template v-if="isEdit">
				<el-button size="mini" type="primary" style="float: right" @click="handelAddSo">添加箱型箱量</el-button>
			</template>
		</div>
		<div class="new-tip">* 调整后的箱型箱量，是有包含原箱型箱量的哦，请注意不要加少了~</div>
		<!-- 箱型箱量 -->
		<el-form-item id="so-list-form" class="so-row-cont" v-for="(o, index) in addContItem.soContainerList" :key="index" prop="">
			<div class="row-cont-tit">
				<span class="tit red">
					<!-- <i class="icon-add-container" v-if="o.isAdd === 'Y'">加</i> -->
					箱型箱量(单SO)
				</span>
				<div class="row-cont-rt">
					<!-- 草稿，拒绝订单状态的显示复选框并可编辑，其他角色，其他的订单状态的都只显示文字 -->
					<template v-if="isEdit">
						<el-checkbox size="mini" v-model="o.isSplit" true-label="y" false-label="n" @change="handleCheckIsSplit">分开放舱</el-checkbox>
					</template>
					<span v-else :class="o.isSplit === 'y' ? 'green' : ''">{{o.isSplit === 'y' ? '分开放舱' : '不分开放舱'}}</span>
					<template v-if="isEdit">
						<el-button size="mini" type="text" class="ml10" @click="handleDeleteSo(index)" v-if="index > 0 ">删除<i class="el-icon-close"></i></el-button>
					</template>
					<span class="expand" @click="handleToogleExpand(index)"> {{ !o.containerListShowState ? '收起' : '展开' }}<i :class="!o.containerListShowState ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
				</div>
			</div>
			<div v-show="!o.containerListShowState" style="padding: 8px 0 5px">
				<el-form class="row-flex flex-so" v-for="(item, sIndex) in o.containerList" :key="sIndex" :model="addContItem.soContainerList[index]" ref="containerList">
					<div class="btn-plus-search" @click="handleAddContainerList(o.containerList)" v-if="isEdit"></div>
					<!-- <div class="btn-minus-search" @click="handleDeleteContainerList(index, sIndex)" v-if="sIndex > 0 && isEdit"></div> -->
					<div class="btn-minus-search" @click="handleDeleteContainerList(index, sIndex)" v-if="o.containerList.length > 1 && isEdit"></div>
					<div class="row-flex-cont">
						<div class="flex">
							<el-form-item class="item-cell" label="箱型" :prop="`containerList.${sIndex}.containerType`" :show-message="false" :rules="{ required: true, message: ' ', trigger: 'change' }">
								<el-select @change="handleTypeChange(item)" filterable size="mini" v-model="item.containerType" style="width: 100px" clearable placeholder="请选择" :disabled="!isEdit">
									<el-option v-for="item in dictMap.containerTypeShiporder" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</el-form-item>
							<el-form-item class="item-cell" label="箱量" :prop="`containerList.${sIndex}.containerNum`" :show-message="false" :rules="[{ required: true, validator: checkContainerNum, trigger: 'blur' }]">
								<el-input size="mini" v-model.number="item.containerNum" clearable placeholder="请输入" style="width: 100px" :disabled="!isEdit" @blur="validateContainerNum(item)"/>
							</el-form-item>
							<el-form-item class="item-cell" label="单柜件数" :prop="`containerList.${sIndex}.quantity`" :show-message="false">
								<el-input clearable size="mini" v-model="item.quantity" placeholder="请输入" style="width: 100px" :disabled="!isEdit" @blur="validateQuantityNum(item)"></el-input>
							</el-form-item>
							<el-form-item class="item-cell" label="单柜重量" :prop="`containerList.${sIndex}.weight`" :show-message="false" :rules="[{ required: true, validator: checkWeight, trigger: 'blur' }]">
								<el-input clearable size="mini" v-model="item.weight" placeholder="请输入" style="width: 100px" :disabled="!isEdit" @blur="validateWeight(item)"><template slot="append">KGS</template></el-input>
							</el-form-item>
							<el-form-item class="item-cell" label="单柜体积" :prop="`containerList.${sIndex}.volume`" :show-message="false" :rules="[{ required: false, trigger: 'blur' }]">
								<el-input clearable size="mini" v-model="item.volume" placeholder="请输入" style="width: 100px" :disabled="!isEdit" @blur="validateVolume(item)"><template slot="append">CBM</template></el-input>
							</el-form-item>
							<el-form-item class="item-cell" label="包装" :prop="`containerList.${sIndex}.packageInfo`" :show-message="false">
								<el-select size="mini" v-model="item.packageInfo" placeholder="请选择包装" clearable filterable style="width: 100px" :disabled="!isEdit">
									<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
								</el-select>
							</el-form-item>							
							<el-form-item class="item-cell" label="是否重柜" :prop="`containerList.${sIndex}.isHeavy`" :show-message="false" :rules="{ required: true, message: '请选择是否重柜', trigger: 'change' }">
								<el-select size="mini" v-model="item.isHeavy" style="width: 100px" clearable placeholder="请选择" :disabled="!isEdit">
									<el-option v-for="ele in yesOrNoOptions" :key="ele.value" :label="ele.label" :value="ele.value"> </el-option>
								</el-select>
							</el-form-item>
							<div class="item-cell">
								<span class="lab">用箱要求</span>
								<el-select size="mini" v-model="item.boxRemark" style="width: 100px;" clearable placeholder="请选择" :disabled="!isEdit">
									<el-option v-for="item in dictMap.boxRemark" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</div>
						</div>
						<div class="flex" style="clear: both">
							<el-form-item class="item-cell redStar" label="特种长宽高" v-if="item.containerType && (item.containerType.toUpperCase().indexOf('OT') !== -1 || item.containerType.toUpperCase().indexOf('FR') !== -1)">
								<el-col :span="8">
									<el-form-item :prop="`containerList.${sIndex}.specialLength`" :show-message="false" :rules="[{ required: true, validator: checkWeight, trigger: 'blur' }]">
										<el-input clearable size="mini" v-model="item.specialLength" placeholder="请输入" style="width: 100px; margin-right: 5px" :disabled="!isEdit" @blur="validateSpecial(item, 'specialLength')">
											<template slot="prepend">长</template>
											<template slot="append">m</template>
										</el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item :prop="`containerList.${sIndex}.specialWidth`" :show-message="false" :rules="[{ required: true, validator: checkWeight, trigger: 'blur' }]">
										<el-input clearable size="mini" v-model="item.specialWidth" placeholder="请输入" style="width: 100px; margin-right: 5px" :disabled="!isEdit" @blur="validateSpecial(item, 'specialWidth')">
											<template slot="prepend">宽</template>
											<template slot="append">m</template>
										</el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item :prop="`containerList.${sIndex}.specialHeight`" :show-message="false" :rules="[{ required: true, validator: checkWeight, trigger: 'blur' }]">
										<el-input clearable size="mini" v-model="item.specialHeight" placeholder="请输入" style="width: 100px;" :disabled="!isEdit" @blur="validateSpecial(item, 'specialHeight')">
											<template slot="prepend">高</template>
											<template slot="append">m</template>
										</el-input>
									</el-form-item>
								</el-col>
							</el-form-item>
							<div class="item-cell" v-if="item.containerType && (item.containerType.toUpperCase().indexOf('OT') !== -1 || item.containerType.toUpperCase().indexOf('FR') !== -1)">
								<span class="lab">是否超尺寸</span>
								<el-select size="mini" v-model="item.gangeType" style="width: 80px;" clearable placeholder="请选择" :disabled="!isEdit">
									<el-option v-for="item in gangeTypeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</div>
							<div class="item-cell" v-if="item.containerType && (item.containerType.toUpperCase().indexOf('OT') !== -1 || item.containerType.toUpperCase().indexOf('FR') !== -1)">
								<span class="lab">超限</span>
								<el-input clearable size="mini" v-model="item.sizeBefore" placeholder="请输入" style="width: 100px;margin-right: 5px" :disabled="!isEdit" @blur="validateSpecial(item, 'sizeBefore')">
									<template slot="prepend">前</template>
									<template slot="append">m</template>
								</el-input>
								<el-input clearable size="mini" v-model="item.sizeAfter" placeholder="请输入" style="width: 100px;margin-right: 5px" :disabled="!isEdit" @blur="validateSpecial(item, 'sizeAfter')">
									<template slot="prepend">后</template>
									<template slot="append">m</template>
								</el-input>
								<el-input clearable size="mini" v-model="item.sizeLeft" placeholder="请输入" style="width: 100px;margin-right: 5px" :disabled="!isEdit" @blur="validateSpecial(item, 'sizeLeft')">
									<template slot="prepend">左</template>
									<template slot="append">m</template>
								</el-input>
								<el-input clearable size="mini" v-model="item.sizeRight" placeholder="请输入" style="width: 100px;margin-right: 5px" :disabled="!isEdit" @blur="validateSpecial(item, 'sizeRight')">
									<template slot="prepend">右</template>
									<template slot="append">m</template>
								</el-input>
								<el-input clearable size="mini" v-model="item.sizeTop" placeholder="请输入" style="width: 100px;" :disabled="!isEdit" @blur="validateSpecial(item, 'sizeTop')">
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
								<el-select size="mini" v-model="item.temperatureType" style="width: 100px;" clearable placeholder="请选择" :disabled="!isEdit">
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
								<el-input size="mini" v-model="item.temperatureSet" clearable placeholder="请输入" style="width: 100px;" :disabled="!isEdit" @blur="validateTemprature(item, 'temperatureSet')"></el-input>
							</el-form-item>
							<el-form-item
								class="item-cell"
								label="最低温度"
								:prop="`containerList.${sIndex}.temperatureMin`"
								:show-message="false"
								:rules="[{ required: true, validator: checkTemprature, trigger: 'blur' }]"
								v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1"
							>
								<el-input size="mini" v-model="item.temperatureMin" clearable placeholder="请输入" style="width: 100px;" :disabled="!isEdit" @blur="validateTemprature(item, 'temperatureMin')"></el-input>
							</el-form-item>
							<el-form-item
								class="item-cell"
								label="最高温度"
								:prop="`containerList.${sIndex}.temperatureMax`"
								:show-message="false"
								:rules="[{ required: true, validator: checkTemprature, trigger: 'blur', item: item }]"
								v-if="item.containerType.toUpperCase().indexOf('RF') !== -1"
							>
								<el-input size="mini" v-model="item.temperatureMax" clearable placeholder="请输入" style="width: 100px;" :disabled="!isEdit" @blur="validateTemprature(item, 'temperatureMax')"></el-input>
							</el-form-item>
							<el-form-item
								class="item-cell"
								label="通风量"
								:prop="`containerList.${sIndex}.airMete`"
								:show-message="false"
								:rules="[{ required: true, message: '请输入', trigger: 'blur' }]"
								v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1"
							>
								<el-input clearable size="mini" v-model="item.airMete" placeholder="请输入" style="width: 100px;" :disabled="!isEdit" @blur="validateTemprature(item, 'airMete')">
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
								<el-input size="mini" v-model="item.humidity" clearable placeholder="请输入" style="width: 100px;" :disabled="!isEdit"></el-input>
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
			],
		}
	},
	props: {
		containerTotal: {
			type: Object,
			default: () => ({})
		},
		addContItem: {
			type: Object,
			default: () => ({})
		},
		bkgStatus: {
			type: String,
			default: ''
		}
	},
	created() {
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole
		}),
		isEdit() {
			return ['', 'draft', 'refuse'].includes(this.bkgStatus)
		}
	},
	watch: {},
	components: {},
	methods: {
		//选择柜型设置是否重柜
		handleTypeChange(item) {
			if (item.containerType === '20HD' || item.containerType === '40HD') {
				item.isHeavy = 'y'
			} else {
				item.isHeavy = 'n'
			}
		},
		// 箱型箱量展开收起
		handleToogleExpand(index) {
			let { containerListShowState } = this.addContItem.soContainerList[index]
			this.$set(this.addContItem.soContainerList[index], 'containerListShowState', !containerListShowState)
		},

    handleCheckIsSplit(val) {
      // console.log(this.addContItem.soContainerList)
    },

    // 增加一组so
    handelAddSo() {
      this.addContItem.soContainerList.push({
        isSplit: 'n',
        containerList: [{ containerType: '', isHeavy: '' }]
      })
    },

    // 删除一组so
    handleDeleteSo(index) {
      this.addContItem.soContainerList = this.addContItem.soContainerList.filter(
        (item, sIndex) => {
          return index !== sIndex
        }
      )
    },

    // 增加一行箱型箱量
    handleAddContainerList(data) {
      data.push({ containerType: '', isHeavy: '' })
      console.log(data)
    },

    // 删除一行箱型箱量
    handleDeleteContainerList(i, index) {
      let containerList = this.addContItem.soContainerList[i].containerList
      this.addContItem.soContainerList[i].containerList = containerList.filter(
        (item, sIndex) => {
          return sIndex !== index
        }
      )
      console.log(this.addContItem.soContainerList)
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
		},
  }
}
</script>

<style lang="scss">
</style>
