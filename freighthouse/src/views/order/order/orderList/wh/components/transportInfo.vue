<template>
	<div class="row-transport ml10">
		<el-row>
			<!-- <el-form-item class="oneEighth" required label="最终目的地" prop="transport.destinationArea" :show-message="false" v-if="show">
				<el-input size="mini" placeholder="请输入" clearable v-model="createItem.transport.destinationArea" :disabled="!isEditState"></el-input>
			</el-form-item>
			<el-form-item class="oneEighth" required label="交货详细地点" prop="transport.deliveryPlace" :show-message="false" v-if="show">
				<el-input size="mini" placeholder="请输入" clearable v-model="createItem.transport.deliveryPlace" :disabled="!isEditState"></el-input>
			</el-form-item> -->
			<!-- <el-form-item class="oneEighth" required label="海外代理人" prop="transport.overseaAgentSupplierId" :show-message="false" v-if="show">
				<el-select
					style="width: 100%"
					clearable
					placeholder="请选择"
					size="mini"
					v-model="createItem.transport.overseaAgentSupplierId"
					:filterable="true"
					@visible-change="supplierVisibleChange"
					:filter-method="supplierFilterMehod"
					@change="handleSelectSupplierName"
					:disabled="!isEditState"
				>
					<el-option v-for="(item, index) in supplierList" :key="index" :label="item.label" :value="item.value"></el-option>
				</el-select>
			</el-form-item> -->
		</el-row>
		<el-row>
			<div class="flex-item-double oneThird">
				<div class="item-label">
					<span class="lab">
						<!-- <em class="red" v-if="!isSameCode && ['st03', 'st11', 'st12'].includes(createItem.serviceType) && isBd">*</em> -->
						Shipper(发货人)</span
					>
					<el-button type="text" size="mini" :disabled="!isEditState" @click="openContactPerson('发货人', '')">选择</el-button>
				</div>
				<TextAreaItem isNeedCheckRowLen :disabled="!isEditState" maxlength="512" show-word-limit  keys="shipper" label="Shipper(发货人)" heightVal="78px" :value.sync="createItem.transport.shipper"></TextAreaItem>
				<!-- <el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="createItem.transport.shipper" :disabled="!isEditState"> </el-input> -->
			</div>
			<div class="flex-item-double oneThird">
				<div class="flex-class">
					<div class="item-label">
						<span class="lab">
							<!-- <em class="red" v-if="!isSameCode && ['st03', 'st11', 'st12'].includes(createItem.serviceType) && isBd">*</em> -->
							Consignee(收货人)</span
						>
						<el-button type="text" size="mini" :disabled="!isEditState" @click="openContactPerson('收货人', '')">选择</el-button>
					</div>
					<el-button v-if="blackPopList.length" type="text" size="mini"  @click="handleClickBlack">船司黑名单</el-button>
				</div>
				<TextAreaItem isNeedCheckRowLen :disabled="!isEditState" maxlength="512" show-word-limit  keys="consignee" label="Consignee(收货人)" heightVal="78px" :value.sync="createItem.transport.consignee"></TextAreaItem>
				<!-- <el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="createItem.transport.consignee" :disabled="!isEditState"> </el-input> -->
			</div>
			<div class="flex-item-double ship-notify-tabs oneThird alert-others">
				<!-- <i class="abs-red red" v-if="!isSameCode && ['st03', 'st11', 'st12'].includes(createItem.serviceType) && isBd">*</i> -->
				<el-button type="text" size="mini" class="alert-others-btn" :disabled="!isEditState" @click="openContactPerson('通知人', activeName)">选择</el-button>
				<el-button size="mini" type="text" class="alert-others-btn-same" :disabled="!isEditState" @click="handleClickNotify">SAME AS CONSIGNEE</el-button>
				<el-tabs v-model="activeName" type="card" @tab-click="handleClick">
					<el-tab-pane label="Notify Party(通知人)" name="1">
						<div class="">
							<TextAreaItem isNeedCheckRowLen :disabled="!isEditState" maxlength="512" show-word-limit  keys="notify1" label="Notify Party(通知人)" heightVal="78px" :value.sync="createItem.transport.notify1"></TextAreaItem>
							<!-- <el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入Notify Party" v-model="createItem.transport.notify1" :disabled="!isEditState"> </el-input> -->
						</div>
					</el-tab-pane>
					<el-tab-pane label="Also Notify Party" name="2">
						<div class="">
							<TextAreaItem isNeedCheckRowLen :disabled="!isEditState" maxlength="512" show-word-limit  keys="notify2" label="Also Notify Party" heightVal="78px" :value.sync="createItem.transport.notify2"></TextAreaItem>
							<!-- <el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入Also Notify Party" v-model="createItem.transport.notify2" :disabled="!isEditState"> </el-input> -->
						</div>
					</el-tab-pane>
					<!-- <el-tab-pane label="通知人3" name="3">
            <div class="">
              <el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="createItem.transport.notify3" :disabled="!isEditState"> </el-input>
            </div>
          </el-tab-pane> -->
				</el-tabs>
			</div>
			<!-- <div class="flex-item-double">
				<div class="item-label"><span class="lab">委托备注</span></div>
				<el-input type="textarea" :autosize="{ minRows: 3, maxRows: 4 }" size="mini" placeholder="请输入" v-model="createItem.intrustRemark" :disabled="!isEditState"> </el-input>
			</div> -->
		</el-row>
		<div v-if="contactPersonShow">
			<ContactPerson :config="contactPersonConfig" @close="getContactPerson" />
		</div>
		<div v-if="blackPopShow">
      <blackPop :options="blackPopList"  @close="blackPopClose" />
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { supplierInfo } from '@/api/crm/supplier'
import ContactPerson from '../../components/contactPerson.vue'
import TextAreaItem from '@/components/Form/textAreaItem'
import blackPop from '@/views/order/order/orderList/orderBook/components/blackPop'
import { getBlackUrl } from '@/api/baseData'

export default {
	data() {
		return {
			oQuery: this.$route.query,
			tradeTermsCode: ['DDP', 'DDU'],
			// supplierList: [{ value: this.createItem.transport.overseaAgentSupplierId, label: this.createItem.transport.overseaAgentSupplierName }],
			activeName: '1',
			contactPersonShow: false,
			contactPersonConfig: {
				type: '收货人', // 类型，收货人，发货人，通知人
				num: '' // 通知人1，2，3
			},
			blackPopShow: false,
			blackPopList: []
		}
	},
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		},
		includeFeeder: {
			type: String,
			default: ''
		},
		orderStatus: {
			type: String,
			default: ''
		},
		isSameCode: {
			type: Boolean,
			default: false
		},
		isEditState: {
      type: Boolean,
      default: true
    }
	},
	created() {
		this.getBlackUrlData()
		// this.fillOverseaAgentSupplierId(this.createItem.transport)
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole
		}),
		disabledState() {
			if (this.isOp || this.isView) return true
			return false
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
		},
		isBkg() {
			return this.ordDetRole === 'bkg'
		},
		isEpricing() {
			return this.ordDetRole === 'epricing'
    },
    isEcs() {
      return this.ordDetRole === 'ecs'
		},
		isCsc() {
      return this.ordDetRole === 'csc'
    },
		isView() {
			console.log('this.$route.name', this.$route.name)
			// 拼箱订舱审核详情置灰不可编辑
			if (['LclAuditDetail'].includes(this.$route.name)) {
				return true
			} else if (this.isBd) {
				if (!['draft', 'refuse'].includes(this.orderStatus)) {
					return true
				} else {
					return false
				}
			} else if (this.isOp) {
				if (!['pass'].includes(this.orderStatus)) {
					return true
				} else {
					return false
				}
			} else if (!this.ordDetRole || this.isEpricing || this.isEcs || this.isDoc || this.isAc || this.isOpTruck || this.isCsc || this.isBkg) {
				return true
			} else {
				return false
			}
		},
		show() {
			return this.createItem.transport.tradeTermsCode && this.tradeTermsCode.includes(this.createItem.transport.tradeTermsCode.toUpperCase())
		}
	},
	watch: {
		'createItem.ship.shipCarrierCode': {
			handler(newVal, oldVal) {
				this.getBlackUrlData()
			},
			deep: true
		}
		// 'createItem.transport': {
		// 	handler(newVal, oldVal) {
		// 		if (newVal) {
		// 			this.fillOverseaAgentSupplierId(newVal)
		// 		}
		// 	},
		// 	deep: true
		// }
	},
	components: { ContactPerson, TextAreaItem, blackPop },
	methods: {
		// 获取船司黑名单
    getBlackUrlData() {
			if (this.createItem.ship && this.createItem.ship.shipCarrierCode) {
         getBlackUrl(this.createItem.ship.shipCarrierCode)
				 .then(res => {
					if (res.data && res.data.length) {
						this.blackPopList = res.data
					} else {
						this.blackPopList = []
					}
				 })
			} else {
				this.blackPopList = []
			}
		},
		handleClickNotify() {
			if (this.activeName === '1') {
				this.$set(this.createItem.transport, 'notify1', 'SAME AS CONSIGNEE')
			}
			if (this.activeName === '2') {
				this.$set(this.createItem.transport, 'notify2', 'SAME AS CONSIGNEE')
			}
			if (this.activeName === '3') {
				this.$set(this.createItem.transport, 'notify3', 'SAME AS CONSIGNEE')
			}
		},
		openContactPerson(type, num) {
			// 打开收发通弹窗
			this.contactPersonConfig.type = type
			this.contactPersonConfig.num = num
			this.contactPersonShow = true
		},
		getContactPerson(action, value, type, num) {
			this.contactPersonShow = false
			if (action === 'Confirm') {
				let str = `${value.companyName ? value.companyName + '\n' : ''}${value.contactAddress ? value.contactAddress + '\n' : ''}${value.contactName ? value.contactName + '\n' : ''}${value.contactPhone ? 'TEL:' + value.contactPhone + '\n' : ''}${
					value.contactFax ? 'FAX:' + value.contactFax + '\n' : ''
				}${value.taxCode ? 'TAX:' + value.taxCode + '\n' : ''}${value.remark}`
				if (type === '收货人') {
					this.$set(this.createItem.transport, 'consignee', str)
				} else if (type === '发货人') {
					this.$set(this.createItem.transport, 'shipper', str)
				} else {
					if (num == 1) {
						this.$set(this.createItem.transport, 'notify1', str)
					} else if (num == 2) {
						this.$set(this.createItem.transport, 'notify2', str)
					} else {
						this.$set(this.createItem.transport, 'notify3', str)
					}
				}
			}
		},
		// 海外代理人回显
		// fillOverseaAgentSupplierId(transport) {
		// 	this.supplierList = []
		// 	transport.overseaAgentSupplierId && this.supplierList.push({ value: transport.overseaAgentSupplierId, label: transport.overseaAgentSupplierName })
		// 	// console.log(this.supplierList)
		// },

		// supplierFilterMehod(val) {
		// 	this.getSupplierList(val)
		// },

		// supplierVisibleChange(val) {
		// 	if (val) {
		// 		this.getSupplierList()
		// 	}
		// },

		// getSupplierList(val = '') {
		// 	this.$store
		// 		.dispatch('dict/querySupplierList', {
		// 			category: 'over_sea_agent',
		// 			queryString: val
		// 		})
		// 		.then(data => {
		// 			// over_sea_agent
		// 			this.supplierList = data.list
		// 			this.supplierList.forEach(item => {
		// 				Object.assign(item, {
		// 					label: this.$language == 'en' ? item.ename : item.name,
		// 					value: item.supplierId ? Number(item.supplierId) : ''
		// 				})
		// 			})
		// 		})
		// },

		// // 选择海外代理人
		// handleSelectSupplierName(val) {},
		handleClick(tab, event) {
			console.log(tab, event)
		},
		handleClickBlack() {
      this.blackPopShow = true
		},
		blackPopClose() {
			this.blackPopShow = false
		},
	}
}
</script>

<style lang="scss">
.edit-container .component-main-cont .ship-notify-tabs .el-tabs__nav-scroll {
	padding-left: 0;
}
.ship-notify-tabs .el-tabs__header {
	height: 20px;
	line-height: 20px;
	margin-bottom: 0;
}
.edit-container .order-cont .ship-cont .ship-notify-tabs .el-tabs__item {
	height: 20px;
	line-height: 20px;
	font-size: 12px;
	color: #4a4a4a;
	// padding: 0 3px;
	padding: 0;
	margin-right: 5px;
	letter-spacing: -1.2px;
}
.edit-container .order-cont .ship-cont .ship-notify-tabs .el-tabs__item.is-active {
	color: #1890ff;
	border: 0;
	// border: 1px solid #ddd;
	// border-bottom: 1px solid #1890ff;
	position: relative;
	// border-top-left-radius: 4px;
	// border-top-right-radius: 4px;
}
.edit-container .order-cont .ship-cont .ship-notify-tabs .el-tabs__item.is-active::before {
	position: absolute;
	content: '';
	display: block;
	bottom: 0;
	z-index: 2;
	left: 50%;
	width: 24px;
	margin-left: -12px;
	height: 1px;
	background-color: #1890ff;
}
.ship-notify-tabs .el-tabs--card > .el-tabs__header {
	border-bottom: 0;
}
.ship-notify-tabs .el-tabs--card > .el-tabs__header .el-tabs__nav {
	border: 0;
	padding-left: 5px;
}
.ship-notify-tabs .el-tabs--card > .el-tabs__header .el-tabs__item {
	border-bottom: 0;
	border-left: 0;
}
.row-transport {
	margin-top: 10px;
	overflow: hidden;
}
.row-transport .oneEighth {
	width: 12.5%;
	padding: 0 5px 0 0;
	margin-bottom: 4px;
	float: left;
}
.row-transport .oneEight .el-form-item__label {
	padding-right: 5px;
	height: 20px;
	line-height: 20px;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
}
.row-transport .oneEight .el-form-item__content {
	line-height: 20px;
}
.row-transport .item-label {
	font-size: 12px;
	line-height: 20px;
	height: 20px;
	margin-bottom: 0;
	display: flex;
}
.row-transport .item-label span {
	display: block;
}
.row-transport .item-label .lab {
	display: flex;
}
.row-transport .item-label .lab em {
	font-style: normal;
}
.row-transport .flex-item-double {
	width: 25%;
	padding: 0 5px 0 0;
	margin-bottom: 4px;
	float: left;
	.flex-class {
		display: flex;
		justify-content: space-between;
	}
}
.row-transport .flex-item-double.oneThird {
	width: 33.33%;
}
.row-transport .el-form-item__content{
	line-height: 20px;
}
.alert-others {
	position: relative;
	.alert-others-btn {
		position: absolute;
		top: 0;
		left: 175px;
		z-index: 500;
	}
	.alert-others-btn-same {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 500;
		letter-spacing: -1.2px;
		padding: 0 5px !important;
	}
	.abs-red {
		position: absolute;
		top: 0;
		left: 0;
		font-style: normal;
		line-height: 20px;
	}
}
</style>
