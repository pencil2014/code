<template>
	<div class="row-transport ml10">
		<el-row>
			<!-- <el-form-item class="oneEighth" required label="最终目的地" prop="transport.destinationArea" :show-message="false" v-if="show">
				<el-input size="mini" placeholder="请输入" v-model="createItem.transport.destinationArea" :disabled="disabledState"></el-input>
			</el-form-item>
			<el-form-item class="oneEighth" required label="交货详细地点" prop="transport.deliveryPlace" :show-message="false" v-if="show">
				<el-input size="mini" placeholder="请输入" v-model="createItem.transport.deliveryPlace" :disabled="disabledState"></el-input>
			</el-form-item> -->
			<!-- <el-form-item class="oneEighth" required label="海外代理人" prop="transport.overseaAgentSupplierId" :show-message="false" v-if="show">
        <el-select style="width: 100%" clearable placeholder="请选择" size="mini" v-model="createItem.transport.overseaAgentSupplierId" 
          :filterable="true" @visible-change="supplierVisibleChange" :filter-method="supplierFilterMehod" 
          @change="handleSelectSupplierName" :disabled="disabledState">
          <el-option v-for="(item, index) in supplierList" :key="index" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item> -->
		</el-row>
		<el-row>
			<div class="flex-item flex-item-double oneThird">
				<div class="item-label">
					<span class="lab">发货人</span>
					<el-button type="text" size="mini" :disabled="disabledState" @click="openContactPerson('发货人', '')">选择</el-button>
				</div>
				<el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="createItem.transport.shipper" :disabled="disabledState"> </el-input>
			</div>
			<div class="flex-item flex-item-double oneThird">
				<div class="item-label">
					<span class="lab">收货人</span>
					<el-button type="text" size="mini" :disabled="disabledState" @click="openContactPerson('收货人', '')">选择</el-button>
				</div>
				<el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="createItem.transport.consignee" :disabled="disabledState"> </el-input>
			</div>
			<div class="flex-item-double notify-tabs oneThird alert-others">
				<el-button type="text" size="mini" class="alert-others-btn" :disabled="disabledState" @click="openContactPerson('通知人', activeName)">选择</el-button>
				<el-button size="mini" type="text" class="alert-others-btn-same" :disabled="disabledState" @click="handleClickNotify">SAME AS CONSIGNEE</el-button>
				<el-tabs v-model="activeName" type="card" @tab-click="handleClick">
					<el-tab-pane label="通知人1" name="1">
						<div class="">
							<el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="createItem.transport.notify1" :disabled="disabledState"> </el-input>
						</div>
					</el-tab-pane>
					<el-tab-pane label="通知人2" name="2">
						<div class="">
							<el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="createItem.transport.notify2" :disabled="disabledState"> </el-input>
						</div>
					</el-tab-pane>
					<el-tab-pane label="通知人3" name="3">
						<div class="">
							<el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="createItem.transport.notify3" :disabled="disabledState"> </el-input>
						</div>
					</el-tab-pane>
				</el-tabs>
				<!-- <div class="item-label"><span class="lab">通知人1</span></div>
        <el-input type="textarea" row="3" size="mini" placeholder="请输入" v-model="createItem.transport.notify1" :disabled="disabledState"></el-input> -->
			</div>
			<!-- <div class="flex-item">
        <div class="item-label"><span class="lab">通知人2</span></div>
        <el-input type="textarea" row="3" size="mini" placeholder="请输入" v-model="createItem.transport.notify2" :disabled="disabledState"></el-input>
      </div>
      <div class="flex-item">
        <div class="item-label"><span class="lab">通知人3</span></div>
        <el-input type="textarea" row="3" size="mini" placeholder="请输入" v-model="createItem.transport.notify3" :disabled="disabledState"></el-input>
      </div> -->
			<!-- <div class="flex-item flex-item-double">
				<div class="item-label"><span class="lab">委托备注</span></div>
				<el-input type="textarea" row="3" size="mini" placeholder="请输入" v-model="createItem.intrustRemark" :disabled="disabledState"></el-input>
			</div> -->
		</el-row>
		<div v-if="contactPersonShow">
			<ContactPerson :config="contactPersonConfig" @close="getContactPerson" />
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { supplierInfo } from '@/api/crm/supplier'
import ContactPerson from '@/views/order/order/orderList/components/contactPerson.vue'

export default {
	data() {
		return {
			oQuery: this.$route.query,
			tradeTermsCode: ['DDP', 'DDU'],
			// supplierList: [{value: this.createItem.transport.overseaAgentSupplierId, label: this.createItem.transport.overseaAgentSupplierName}],
			activeName: '1',
			contactPersonShow: false,
			contactPersonConfig: {
				type: '收货人', // 类型，收货人，发货人，通知人
				num: '' // 通知人1，2，3
			}
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
		}
	},
	created() {
		// this.fillOverseaAgentSupplierId(this.createItem.transport)
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole
		}),
		isIncludeFeeder() {
			return this.includeFeeder === 'y' ? true : false
		},
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
			return this.roles.includes('op')
		},
		isOpTruck() {
			return this.ordDetRole === 'op_truck'
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
		isView() {
			if (!this.ordDetRole || this.isDoc || this.isAc || this.isOpTruck) {
				return true
			}
			if (this.isBd && !['draft', 'refuse'].includes(this.orderStatus)) {
				return true
			}
			if (this.isOp && !['pass'].includes(this.orderStatus)) {
				return true
			}
			return false
			// return this.oQuery.action === 'view' || this.orderStatus !== 'draft'
		},
		show() {
			return this.createItem.transport.tradeTermsCode && this.tradeTermsCode.includes(this.createItem.transport.tradeTermsCode.toUpperCase())
		}
	},
	watch: {
		// 'createItem.transport': {
		//   handler(newVal, oldVal) {
		//     if (newVal) {
		//       this.fillOverseaAgentSupplierId(newVal)
		//     }
		//   },
		//   deep: true
		// }
	},
	components: { ContactPerson },
	methods: {
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
		//   this.supplierList = []
		//   transport.overseaAgentSupplierId && this.supplierList.push({value: transport.overseaAgentSupplierId, label: transport.overseaAgentSupplierName})
		//   // console.log(this.supplierList)
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
		// 	this.$store.dispatch('dict/querySupplierList', { category: 'over_sea_agent', queryString: val }).then(data => {
		// 		// over_sea_agent
		// 		this.supplierList = data.list
		// 		this.supplierList.forEach(item => {
		// 			Object.assign(item, {
		// 				label: this.$language == 'en' ? item.ename : item.name,
		// 				value: item.supplierId ? Number(item.supplierId) : ''
		// 			})
		// 		})
		// 	})
		// },

		// 选择海外代理人
		handleSelectSupplierName(val) {},
		handleClick(tab, event) {
			console.log(tab, event)
		}
	}
}
</script>

<style lang="scss">
.edit-container .component-main-cont .notify-tabs .el-tabs__nav-scroll {
	padding-left: 5px;
}
.notify-tabs .el-tabs__header {
	height: 20px;
	line-height: 20px;
	margin-bottom: 0;
}
.edit-container .order-cont .ship-cont .notify-tabs .el-tabs__item {
	height: 20px;
	line-height: 20px;
	font-size: 12px;
	color: #4a4a4a;
	padding: 0 3px;
}
.edit-container .order-cont .ship-cont .notify-tabs .el-tabs__item.is-active {
	color: #222;
	border: 1px solid #ddd;
	border-bottom: 1px solid #fff;
	position: relative;
	border-top-left-radius: 4px;
	border-top-right-radius: 4px;
}
.edit-container .order-cont .ship-cont .notify-tabs .el-tabs__item.is-active::before {
	content: '';
	position: absolute;
	left: 0;
	right: 0;
	height: 1px;
	background-color: #fff;
	z-index: 2;
	bottom: -2px;
}
.notify-tabs .el-tabs--card > .el-tabs__header {
	border-bottom: 0;
}
.notify-tabs .el-tabs--card > .el-tabs__header .el-tabs__nav {
	border: 0;
}
.notify-tabs .el-tabs--card > .el-tabs__header .el-tabs__item {
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
}
.row-transport .flex-item-double.oneThird {
	width: 33.33%;
}
.alert-others {
	position: relative;
	.alert-others-btn {
		position: absolute;
		top: 0;
		left: 148px;
		z-index: 500;
	}
	.alert-others-btn-same {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 500;
		letter-spacing: -1.2px;
	}
}
</style>
