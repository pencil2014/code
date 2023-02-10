<template>
  <div class="fcl-so-container">
    <div class="so-total">
      <span v-if="!containerTotal.isNew">
        <el-tooltip effect="dark" :content="containerTotal.container" placement="top-start" v-if="containerTotal.container">
					<span class="cyTotal">箱型箱量合计：{{ containerTotal.container }}</span>
				</el-tooltip>
				<span v-else class="cyTotal">箱型箱量合计：{{ containerTotal.container }}</span>
				<span class="quantityTotal">件数合计：{{ containerTotal.quantity }}</span>
				<span class="weightTotal">重量合计：{{ containerTotal.weight }}KGS</span>
				<span class="volumeTotal">体积合计：{{ containerTotal.volume }}CBM</span>
      </span>
      <el-button size="mini" type="primary" style="float: right" :disabled="viewState" @click="handelAddSo">添加箱型箱量</el-button>
    </div>
    <el-form-item class="so-row-cont" v-for="(o, index) in createItem.soContainerList" :key="index" prop="">
      <div class="row-cont-tit">
        <span class="tit">箱型箱量(单SO)</span>
        <div class="row-cont-rt">
          <el-checkbox size="mini" v-model="o.isSplit" true-label="y" false-label="n" :disabled="viewState" @change="handleCheckIsSplit">是否分开放舱</el-checkbox>
          <el-button size="mini" type="text" class="ml10" :disabled="viewState" @click="handleDeleteSo(index)" v-if="index > 0">删除<i class="el-icon-close"></i></el-button>
          <span class="expand" @click="handleToogleExpand(index)"> {{ !o.containerListShowState ? '收起' : '展开' }}<i :class="!o.containerListShowState ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
        </div>
      </div>
      <div v-show="!o.containerListShowState" style="padding: 8px 0 5px">
        <!-- <el-form :model="createItem.soContainerList[index]" ref="containerList"> -->
        <el-form class="row-flex flex-so" v-for="(item, sIndex) in o.containerList" :key="sIndex" :model="createItem.soContainerList[index]" ref="containerList">
          <div class="btn-plus-search" @click="handleAddContainerList(o.containerList)" v-if="!viewState"></div>
          <div class="btn-minus-search" @click="handleDeleteContainerList(index, sIndex)" v-if="sIndex > 0 && !viewState"></div>
          <div class="row-flex-cont">
            <!-- <el-form ref="containerItem"> -->
            <div class="flex">
              <el-form-item class="item-cell" label="箱型" :prop="`containerList.${sIndex}.containerType`" :show-message="false" :rules="{ required: true, message: ' ', trigger: 'change' }">
                <el-select size="mini" v-model="item.containerType" filterable style="width: 80px" clearable placeholder="请选择" :disabled="viewState" @change="handleTypeChange(item)">
                  <el-option v-for="item in dictMap.containerTypeShiporder" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
              </el-form-item>
              <el-form-item class="item-cell" label="箱量" :prop="`containerList.${sIndex}.containerNum`" :show-message="false" :rules="[{ required: true, validator: checkContainerNum, trigger: 'blur' }]">
                <el-input size="mini" v-model.number="item.containerNum" clearable placeholder="请输入" style="width: 80px" :disabled="viewState" @blur="validateContainerNum(item)"/>
              </el-form-item>
              <el-form-item class="item-cell" label="单柜件数" :prop="`containerList.${sIndex}.quantity`" :show-message="false">
								<el-input clearable size="mini" v-model.number="item.quantity" placeholder="请输入" style="width: 80px" :disabled="viewState" @blur="validateQuantityNum(item)"></el-input>
							</el-form-item>
              <el-form-item class="item-cell" label="单柜重量" :prop="`containerList.${sIndex}.weight`" :show-message="false" :rules="[{ required: true, validator: checkWeight, trigger: 'blur' }]">
                <el-input clearable size="mini" v-model="item.weight" placeholder="请输入" style="width: 98px" :disabled="viewState" @blur="validateWeight(item)"><template slot="append">KGS</template></el-input>
              </el-form-item>
              <el-form-item class="item-cell" label="单柜体积" :prop="`containerList.${sIndex}.volume`" :show-message="false" :rules="[{ required: true, validator: checkVolume, trigger: 'blur' }]">
                <el-input clearable size="mini" v-model="item.volume" placeholder="请输入" style="width: 98px" :disabled="viewState" @blur="validateVolume(item)"><template slot="append">CBM</template></el-input>
              </el-form-item>
              <el-form-item class="item-cell" label="包装" :prop="`containerList.${sIndex}.packageInfo`" :show-message="false">
								<el-select size="mini" v-model="item.packageInfo" placeholder="请选择包装" clearable filterable style="width: 120px" :disabled="viewState">
									<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
								</el-select>
							</el-form-item>
              <el-form-item class="item-cell" label="是否重柜" :prop="`containerList.${sIndex}.isHeavy`" :show-message="false" :rules="{ required: true, message: ' ', trigger: 'change' }">
                <el-select size="mini" v-model="item.isHeavy" style="width: 80px" clearable placeholder="请选择" :disabled="viewState">
                  <el-option v-for="ele in yesOrNoOptions" :key="ele.value" :label="ele.label" :value="ele.value"> </el-option>
                </el-select>
              </el-form-item>
              <div class="item-cell">
                <span class="lab">用箱要求</span>
                <el-select size="mini" v-model="item.boxRemark" style="width: 70px;" clearable placeholder="请选择" :disabled="viewState">
                  <el-option v-for="item in dictMap.boxRemark" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
              </div>
            </div>
            <div class="flex">
              <el-form-item class="item-cell" label="特种长宽高" required v-if="item.containerType && (item.containerType.toUpperCase().indexOf('OT') !== -1 || item.containerType.toUpperCase().indexOf('FR') !== -1)">
                <el-col :span="8">
                  <el-form-item :prop="`containerList.${sIndex}.specialLength`" :show-message="false" :rules="[{ required: true, validator: checkNum, trigger: 'blur' }]">
                    <el-input clearable size="mini" v-model.number="item.specialLength" placeholder="请输入" style="width: 110px; margin-right: 5px" :disabled="viewState" @blur="validateNum(item, 'specialLength')">
                      <template slot="prepend">长</template>
                      <template slot="append">m</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :prop="`containerList.${sIndex}.specialWidth`" :show-message="false" :rules="[{ required: true, validator: checkNum, trigger: 'blur' }]">
                    <el-input clearable size="mini" v-model.number="item.specialWidth" placeholder="请输入" style="width: 110px; margin-right: 5px" :disabled="viewState" @blur="validateNum(item, 'specialWidth')">
                      <template slot="prepend">宽</template>
                      <template slot="append">m</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :prop="`containerList.${sIndex}.specialHeight`" :show-message="false" :rules="[{ required: true, validator: checkNum, trigger: 'blur' }]">
                    <el-input clearable size="mini" v-model.number="item.specialHeight" placeholder="请输入" style="width: 110px;" :disabled="viewState" @blur="validateNum(item, 'specialHeight')">
                      <template slot="prepend">高</template>
                      <template slot="append">m</template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-form-item>
              <div class="item-cell" v-if="item.containerType && (item.containerType.toUpperCase().indexOf('OT') !== -1 || item.containerType.toUpperCase().indexOf('FR') !== -1)">
                <span class="lab">是否超尺寸</span>
                <el-select size="mini" v-model="item.gangeType" style="width: 70px;" clearable placeholder="请选择" :disabled="viewState">
                  <el-option v-for="item in gangeTypeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
              </div>
              <div class="item-cell" v-if="item.containerType && (item.containerType.toUpperCase().indexOf('OT') !== -1 || item.containerType.toUpperCase().indexOf('FR') !== -1)">
                <span class="lab">超限</span>
                <el-input clearable size="mini" v-model="item.sizeBefore" placeholder="请输入" style="width: 110px;margin-right: 5px" :disabled="viewState" @blur="validatePoint(item, 'sizeBefore')">
                  <template slot="prepend">前</template>
                  <template slot="append">m</template>
                </el-input>
                <el-input clearable size="mini" v-model="item.sizeAfter" placeholder="请输入" style="width: 110px;margin-right: 5px" :disabled="viewState" @blur="validatePoint(item, 'sizeAfter')">
                  <template slot="prepend">后</template>
                  <template slot="append">m</template>
                </el-input>
                <el-input clearable size="mini" v-model="item.sizeLeft" placeholder="请输入" style="width: 110px;margin-right: 5px" :disabled="viewState" @blur="validatePoint(item, 'sizeLeft')">
                  <template slot="prepend">左</template>
                  <template slot="append">m</template>
                </el-input>
                <el-input clearable size="mini" v-model="item.sizeRight" placeholder="请输入" style="width: 110px;" :disabled="viewState" @blur="validatePoint(item, 'sizeRight')">
                  <template slot="prepend">右</template>
                  <template slot="append">m</template>
                </el-input>
              </div>
              <el-form-item class="item-cell" label="单位" :prop="`containerList.${sIndex}.temperatureType`" :show-message="false" :rules="{ required: true, message: '请选择单位', trigger: 'change' }" v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1">
                <el-select size="mini" v-model="item.temperatureType" style="width: 85px;" clearable placeholder="请选择" :disabled="viewState">
                  <el-option v-for="item in dictMap.temperatureType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
              </el-form-item>
              <el-form-item class="item-cell" label="设置温度" :prop="`containerList.${sIndex}.temperatureSet`" :show-message="false" :rules="[{ required: true, validator: checkTemprature, trigger: 'blur' }]" v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1">
                <el-input size="mini" v-model="item.temperatureSet" clearable placeholder="请输入" style="width: 75px;" :disabled="viewState" @blur="validateTemprature(item, 'temperatureSet')"></el-input>
              </el-form-item>
              <el-form-item class="item-cell" label="最低温度" :prop="`containerList.${sIndex}.temperatureMin`" :show-message="false" :rules="[{ required: true, validator: checkTemprature, trigger: 'blur' }]" v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1">
                <el-input size="mini" v-model="item.temperatureMin" clearable placeholder="请输入" style="width: 75px;" :disabled="viewState" @blur="validateTemprature(item, 'temperatureMin')"></el-input>
              </el-form-item>
              <el-form-item class="item-cell" label="最高温度" :prop="`containerList.${sIndex}.temperatureMax`" :show-message="false" :rules="[{ required: true, validator: checkTemprature, trigger: 'blur', item: item }]" v-if="item.containerType.toUpperCase().indexOf('RF') !== -1">
                <el-input size="mini" v-model="item.temperatureMax" clearable placeholder="请输入" style="width: 75px;" :disabled="viewState" @blur="validateTemprature(item, 'temperatureMax')"></el-input>
              </el-form-item>
              <el-form-item class="item-cell" label="通风量" :prop="`containerList.${sIndex}.airMete`" :show-message="false" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]" v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1">
                <el-input clearable size="mini" v-model="item.airMete" placeholder="请输入" style="width: 130px;" :disabled="viewState" @blur="validateTemprature(item, 'airMete')">
                  <template slot="append">CBM/时</template>
                </el-input>
              </el-form-item>
              <el-form-item class="item-cell" label="湿度要求" :prop="`containerList.${sIndex}.humidity`" :show-message="false" :rules="{ required: true, message: '请输入湿度要求', trigger: 'blur' }" v-if="item.containerType.toUpperCase().indexOf('RF') !== -1">
                <el-input size="mini" v-model="item.humidity" clearable placeholder="请输入" style="width: 120px;" :disabled="viewState"></el-input>
              </el-form-item>
            </div>
            <!-- </el-form> -->
          </div>
        </el-form>
        <!-- </el-form> -->
      </div>

      <!-- <div v-if="!o.containerListShowState">
        
      </div> -->
    </el-form-item>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
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
      containerTypeOptions: [
        { label: '20GP', value: '20GP' },
        { label: '40Gp', value: '40Gp' },
        { label: '20OT', value: '20OT' },
        { label: '20RF', value: '20RF' }
      ], // 箱型
      boxRemarkOptions: [] // 用箱要求下拉
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
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      currRole: (state) => state.user.currRole
    }),
    viewState() {
      if (this.orderStatus === 'submit') {
        return true
      }
      return false
    },
    isAc() {
      return this.currRole === 'ac'
    },
    isDoc() {
      return this.currRole === 'doc'
    },
    isOp() {
      return this.currRole === 'op'
    },
    isBd() {
      return this.currRole === 'bd' || this.currRole === 'obd'
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
      let { containerListShowState } = this.createItem.soContainerList[index]
      this.$set(
        this.createItem.soContainerList[index],
        'containerListShowState',
        !containerListShowState
      )
    },

    handleCheckIsSplit(val) {
      // console.log(this.createItem.soContainerList)
    },

    // 增加一组so
    handelAddSo() {
      this.createItem.soContainerList.push({
        isSplit: 'n',
        containerList: [{ containerType: '', isHeavy: ''  }]
      })
    },

    // 删除一组so
    handleDeleteSo(index) {
      this.createItem.soContainerList = this.createItem.soContainerList.filter(
        (item, sIndex) => {
          return index !== sIndex
        }
      )
    },

    // 增加一行箱型箱量
    handleAddContainerList(data) {
      data.push({ containerType: '', isHeavy: ''  })
      console.log(data)
    },

    // 删除一行箱型箱量
    handleDeleteContainerList(i, index) {
      let containerList = this.createItem.soContainerList[i].containerList
      this.createItem.soContainerList[i].containerList = containerList.filter(
        (item, sIndex) => {
          return sIndex !== index
        }
      )
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
		validateContainerNum(item){
			const intReg= /^[0-9]\d*$/
			if (!intReg.test(item.containerNum) && item.containerNum) {
				item.containerNum = ''
				return this.$message.error('请输入数字值')
			}
			if (item.containerNum > 200) {
				item.containerNum = 200
				this.$message.error('最大不能超过200')
			}
		},
		validateQuantityNum(item){
			const intReg= /^[0-9]\d*$/
			if (item.quantity && !intReg.test(item.quantity)) {
				item.quantity = ''
				return this.$message.error('请输入正确的件数')
			}
			if (item.quantity > 9999999) {
				item.quantity = 9999999
				this.$message.error('最大不能超过9999999')
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
    validateNum(item, val){
			const intReg= /^[0-9]\d*$/
			if (!intReg.test(item[val]) && item[val]) {
				item[val] = ''
				let message = ''
				switch (val) {
					case 'specialLength':
						message = '特种长'
						break
					case 'specialHeight':
						message = '特种高'
						break
					case 'specialWidth':
						message = '特种宽'
						break
					default:
						break
				}
				return this.$message.error('请输入正确的' + message)
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
    validateTemprature(item, val){
			const reg= /^\-?[0-9]\d*\.?\d*$/
			if (!reg.test(item[val]) && item[val]) {
				item[val] = ''
				let message = '温度'
				if (val === 'airMete') message = '通风量'
				return this.$message.error(`请输入正确的${message}`)
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
		validateWeight(item){
			if (!item.weight) return
			item.weight = Number(item.weight)
			const reg= /^\d+(\.\d+)?$/
			if (!reg.test(item.weight)) {
				item.weight = ''
				return this.$message.error('请输入正确的单柜重量')
			}
			if (item.weight > 53000) {
				item.weight = 53000
				this.$message.error('最大不能超过53000')
			}
			let str =  item.weight.toString()
			let pointIndex = str.indexOf('.')
			if (pointIndex !== -1) {
				item.weight = str.substring(0, pointIndex + 4)
			}
		},
    checkVolume(rule, value, callback, item) {
      let reg = /^\-?[0-9]\d*\.?\d*$/
      console.log(item)
      if (!value) {
        callback(new Error('请输入'))
      } else if (!reg.test(value)) {
        callback(new Error('请输入正确的数字'))
      } else if (Number(value) > 100) {
        callback(new Error('请输入100内数字'))
      } else {
        callback()
      }
		},
		validateVolume(item){
			if (!item.volume) return
			item.volume = Number(item.volume)
			const reg= /^\d+(\.\d+)?$/
			if (!reg.test(item.volume)) {
				item.volume = ''
				return this.$message.error('请输入正确的单柜体积')
			}
			if (item.volume > 100) {
				item.volume = 100
				this.$message.error('最大不能超过100')
			}
			let str =  item.volume.toString()
			let pointIndex = str.indexOf('.')
			if (pointIndex !== -1) {
				item.volume = str.substring(0, pointIndex + 4)
			}
		},
		validatePoint(item, val){
			const reg= /^\d+(\.\d+)?$/
			if (item[val] && !reg.test(item[val])) {
				item[val] = ''
				return this.$message.error('请输入正确数字')
			}
		}
  }
}
</script>

<style lang="scss">
.fcl-so-container {
	padding-right: 0;
	.so-total {
		margin: 0 8px;
		line-height: 20px;
		height: 20px;
    overflow: hidden;
		.so-total-flex{
			float: left;
			display: flex;
			width: 90%;
			padding-right: 20px;
			span{
				display: block;
				&.cyTotal{
					// flex: 1;
					white-space: nowrap;
					text-overflow: ellipsis;
					overflow: hidden;
				}
				&.quantityTotal{
					width: 150px;
					margin-left: 10px;
				}
				&.weightTotal{
					width: 200px;
					margin-left: 10px;
				}
				&.volumeTotal{
					width: 180px;
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
				.el-checkbox__label {
					font-size: 12px;
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
				border-bottom: 1px solid #e0e0e0;
				margin: 0 6px;
				padding-top: 0;
        zoom: 1;
        .row-flex-cont{
					float: left;
					max-width: 94.8%;
				}
				&:last-child {
					border-bottom: 0;
				}
				.item-cell {
					float: left;
					display: flex;
					margin-bottom: 4px;
					margin-right: 5px;
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
						line-height: 20px;
						padding-right: 3px;
					}
					.el-form-item__content {
						line-height: 20px;
            .el-form-item{
							margin-bottom: 0;
						}
					}
					.el-form-item__error {
						padding-top: 0;
					}
					.el-input__suffix {
						right: 0;
					}
					.el-input{
						line-height: 20px !important;
					}
					.el-input-group__append, .el-input-group__prepend{
						line-height: 18px;
					}
					&.is-required{
						label::before{
							// display: none;
							margin-top: 0;
						}
						// input, select, textarea, .el-date-editor--daterange{
						// 	background: #fef5f4;
						// }
						.is-disabled {
							input, select, textarea, .el-date-editor--daterange{
								background: #F5F7FA;
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
	}
}
</style>
