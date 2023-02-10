<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="createSoForm" :rules="rules" :model="createItem" label-position="right" label-width="100px" class="createSo-form">
			<div class="soInfo-tit">
				<div class="tit">委派信息</div>
			</div>
			<el-row class="mt10">
				<el-col style="display:flex;" :span="6">
					<el-form-item label="目的地" prop="podPortCode" required :show-message="false">
						<el-select
							size="mini"
							v-model="createItem.podPortCode"
							filterable
							remote
							clearable
							style="width: 100%"
							placeholder="请输入"
							:remote-method="podPortFilterMehod"
							@visible-change="podPortVisibleChange"
							@change="handleChangePodPortCode"
						>
							<el-option v-for="item in podPortList" :key="item.value" :label="item.ename" :value="item.value">
								<span>{{ item.label }}</span>
							</el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="18">
					<el-form-item label="装货地点(到州)" prop="loadPlace"  :show-message="false">
						<el-cascader filterable style="width:100%" size="mini" :emitPath="true" v-model="createItem.loadPlace" :options="loadPlaceData" :props="cityProps" clearable ></el-cascader>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="装货详细地址" prop="loadAddress"  :show-message="false">
						<div class="box-address-flex">
							<el-input size="mini" placeholder="请输入" v-model="createItem.loadAddress" clearable maxlength="512" show-word-limit></el-input>
							<el-button type="default" size="mini" class="box-address-btn" @click="showAddressPop('on')">选择</el-button>
						</div>
					</el-form-item>
				</el-col>
				<el-col :span="18">
					<el-form-item label="卸货地点(到州)" prop="unloadPlace"  :show-message="false">
						<el-cascader filterable style="width:100%" size="mini" :emitPath="true" v-model="createItem.unloadPlace" :options="loadPlaceData" :props="cityProps" clearable ></el-cascader>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="卸货详细地址" prop="unloadAddress" required :show-message="false">
						<div class="box-address-flex">
							<el-input size="mini" placeholder="请输入" v-model="createItem.unloadAddress" clearable maxlength="512" show-word-limit></el-input>
							<el-button type="default" size="mini" class="box-address-btn" @click="showAddressPop('un')">选择</el-button>
						</div>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="收货人" prop="consignee" required :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="createItem.consignee" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="收货人电话" prop="consigneePhone" required :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="createItem.consigneePhone" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="收货人邮箱" prop="consigneeEmail" required :show-message="false">
						<el-input maxlength="128" size="mini" placeholder="请输入" v-model="createItem.consigneeEmail" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="邮政编码" prop="postCode"  :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="createItem.postCode" clearable></el-input>
					</el-form-item>
				</el-col>
			
				<el-col :span="24">
					<el-form-item label="备注" prop="remark"  :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="createItem.remark" clearable maxlength="512" show-word-limit></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="快捷输入">
						<div class="quick-flex-class">
							<el-input class="quick-input" size="mini" placeholder="请依次输入收货人、收货人电话、卸货详细地址、装货详细地址，中文逗号隔开" v-model="quickInputModel" clearable></el-input>
							<el-button class="quick-btn" type="primary" size="mini" @click="handleQuickInput">填充</el-button>
						</div>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
		<div v-if="addressPopShow">
			<AddressPop @close="addressPopClose"></AddressPop>
		</div>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { blDeliveryCancel } from '@/api/order/bl'
import { getDomesticCity, baseCurrencyList, fclTruckIntrustRegion } from '@/api/base'
import { orderBookInfo, containerSoList } from '@/api/order/list'
import { randomString } from '@/utils'
import { getDictMap } from '@/utils/tools'
import { supplierList } from '@/api/crm/supplier'
import AddressPop from '@/views/order/order/orderList/components/boxAddressPop'

const defaultCreate = {
	podPortCode: '',
	podPortName: '',
	loadPlace: [],
	loadAddress: '',
	consignee: '',
	consigneePhone: '',
	consigneeEmail: '',
	postCode: '',
	unloadPlace: [],
	unloadAddress: '',
	remark: ''
}

export default {
	data() {
		return {
			supplierOptions: [],
			currencyList: [],
			oQuery: this.$route.query,
			dialogConfig: {
				title: '新增委派信息',
				show: true,
				size: 'medium',
				width: '1120px'
			},
			createItem: Object.assign({}, defaultCreate),
			rules: {},
			defaultContainerItem: { containerType: '', num: '' },
			cityProps: {
				value: 'cname',
				label: 'cname',
				children: 'children'
			},
			podPortList: [],
			loadPlace: [],
			loadPlaceData: [],
			quickInputModel: '',
			addressPopShow: false,
			loadType: '',
			initFlag: true
		}
	},
	props: {},
	created() {
		this.createItem.podPortCode = this.orderInfoDataObj.ship.podPortCode
		this.createItem.podPortName = this.orderInfoDataObj.ship.podPortName
		this.podPortSearch(this.createItem.podPortCode)
		//获取省市区级联框数据
		this.getLoadPlaceData()
	},
	mounted() {
		this.$nextTick(() => {
      this.initFlag = false
		})
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderInfoDataObj: (state) => state.order.orderInfoDataObj
		}),
	},
	watch: {},
	components: {
		BaseDialog,
		AddressPop
	},
	methods: {
		showAddressPop(val) {
			this.loadType = val
			this.addressPopShow = true
		},
		addressPopClose(action, value) {
			this.addressPopShow = false
			if (action === 'Confirm') {
				if (this.loadType === 'on') {
					this.createItem.loadAddress = value.addressDetail
					this.showCasPlace = false
					if (!value.isChina) {
						this.createItem.loadPlace = value.addressProvince ? [value.addressCountry, value.addressProvince] : [value.addressCountry]
					} else {
						this.createItem.loadPlace = [value.addressCountry, value.addressProvince, value.addressCity, value.addressArea]
					}
					this.$nextTick(() => {
						this.showCasPlace = true
					})
				}
				if (this.loadType === 'un') {
					this.createItem.consignee = value.contactName
					this.createItem.consigneePhone = value.contactPhone
					this.createItem.unloadAddress = value.addressDetail
					this.createItem.postCode = value.postCode
					this.showCasPlace = false
					if (!value.isChina) {
						this.createItem.unloadPlace = value.addressProvince ? [value.addressCountry, value.addressProvince] : [value.addressCountry]
					} else {
						this.createItem.unloadPlace = [value.addressCountry, value.addressProvince, value.addressCity, value.addressArea]
					}
					this.$nextTick(() => {
						this.showCasPlace = true
					})
				}
			}
		},
		//获取省市区数据
		async getLoadPlaceData() {
			let res = await fclTruckIntrustRegion({})
			//处理最后一级children空数组
			this.loadPlaceData = this.handleChildren(res.data)
		},
		//处理最后一级children为空数组问题
		handleChildren(data) {
			// 循环遍历json数据
			for (var i = 0; i < data.length; i++) {
				if (data[i].children.length < 1) {
					// children若为空数组，则将children设为undefined
					data[i].children = undefined
				} else {
					// children若不为空数组，则继续 递归调用 本方法
					this.handleChildren(data[i].children)
				}
			}
			return data
		},
		podPortVisibleChange(val) {
			if (val) this.podPortSearch('')
		},
		podPortFilterMehod(val) {
			if (!this.initFlag) {
				this.podPortSearch(val)
			}
		},
		podPortSearch(queryString) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute: 'port_of_feeder', state: 'valid' }).then(data => {
				let result = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
				this.podPortList = result
			})
		},
		handleChangePodPortCode(val) {
       if (val) {
				 this.createItem.podPortName = (this.podPortList.find(item => {
					 return item.value === val
				 }) || {}).label || ''
			 } else {
				 this.createItem.podPortName = ''
			 }
		},
		close(action, value) {
			this.$emit('close', action, value)
		},
		getParmasData() {
			return Object.assign({}, this.createItem)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.createSoForm.validate(valid => {
					if (valid) {
						let createTime = new Date().getTime()
						// 添加createTime参数，做单元格合并判断用
						let data = this.getParmasData()
						this.close('Confirm', {
							...data,
							createTimeStr: createTime,
							mergeId: createTime + '' + randomString()
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
		handleQuickInput() {
			let arr = this.quickInputModel.split('，')
			this.createItem.consignee = arr[0] || ''
			this.createItem.consigneePhone = arr[1] || ''
			this.createItem.unloadAddress = arr[2] || ''
			this.createItem.loadAddress = arr[3] || ''
		}
	}
}
</script>

<style lang="scss">
.createSo-form {
	padding: 0;
	.pre-box-time {
		.el-form-item__content {
			margin-left: 10px !important;
		}
	}
}
.createSo-form .soInfo-tit {
	font-size: 12px;
	line-height: 20px;
	display: flex;
	justify-content: space-between;
}
.createSo-form .so-container-list {
	display: flex;
	margin: 8px 0;
}
.createSo-form .so-container-list .so-list {
	width: 100%;
	display: flex;
	padding: 4px 0 0;
}
.so-list {
	border-radius: 2px;
	border: 1px solid #e9e9e9;
}
.createSo-form .soInfo-tit .tit {
	font-size: 12px;
	line-height: 20px;
	font-weight: bold;
}
.createSo-form .soInfo-tit .el-button--mini {
	line-height: 20px;
}
.createSo-form .el-form-item {
	margin-bottom: 4px;
}
.createSo-form .containerType-list {
	// display: inline-block;
	/* margin-left: 8px; */
	margin-bottom: 4px;
}
.createSo-form .range {
	display: inline-block;
	width: 20px;
	text-align: center;
}

.createSo-form .el-icon-circle-plus-outline,
.createSo-form .el-icon-remove-outline {
	font-size: 15px;
	margin-left: 5px;
}
.createSo-form .el-form-item__label {
	padding-right: 5px;
	line-height: 20px;
	/* height: 20px; */
}
.createSo-form .el-form-item__content {
	line-height: 20px;
	/* height: 20px; */
}
.box-address-flex {
	display: flex;
	display: flex;
	.box-address-input {
		flex: 1;
	}
	.box-address-btn {
		margin-left: 5px;
		width: 50px;
	}
}
.quick-flex-class {
	display: flex;
	.quick-input {
		flex: 1;
	}
	.quick-btn {
		margin-left: 5px;
		width: 50px;
	}
}
</style>
