<template>
	<div class="row-transport ml10">
		<el-row>
			<div class="flex-item-double-rail oneThird">
				<div class="item-label">
					<span class="lab">Shipper(发货人)</span>
					<el-button type="text" size="mini" :disabled="disabledState" @click="openContactPerson('发货人', '')">选择</el-button>
				</div>
				<el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="createItem.transport.shipper" :disabled="disabledState"> </el-input>
			</div>
			<div class="flex-item-double-rail oneThird">
				<div class="item-label">
					<span class="lab">Consignee(收货人)</span>
					<el-button type="text" size="mini" :disabled="disabledState" @click="openContactPerson('收货人', '')">选择</el-button>
				</div>
				<el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="createItem.transport.consignee" :disabled="disabledState"> </el-input>
			</div>
			<div class="flex-item-double-rail notify-tabs-rail oneThird alert-others-rail">
				<el-button type="text" size="mini" class="alert-others-rail-btn" :disabled="disabledState" @click="openContactPerson('通知人', activeName)">选择</el-button>
				<el-button size="mini" type="text" class="alert-others-rail-btn-same" :disabled="disabledState" @click="handleClickNotify">SAME AS CONSIGNEE</el-button>
				<el-tabs v-model="activeName" type="card" @tab-click="handleClick">
					<el-tab-pane label="Notify Party(通知人)" name="1">
						<div class="">
							<el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="createItem.transport.notify1" :disabled="disabledState"> </el-input>
						</div>
					</el-tab-pane>
					<el-tab-pane label="Also Notify Party" name="2">
						<div class="">
							<el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="createItem.transport.notify2" :disabled="disabledState"> </el-input>
						</div>
					</el-tab-pane>
				</el-tabs>
			</div>
		</el-row>
		<div v-if="contactPersonShow">
			<ContactPerson :custid="createItem.main && createItem.main.custid" :config="contactPersonConfig" @close="getContactPerson" />
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import ContactPerson from './contactPerson.vue'

export default {
	data() {
		return {
			oQuery: this.$route.query,
			tradeTermsCode: ['DDP', 'DDU'],
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
	created() {},
	mounted() {},

	computed: {
		...mapState('railway', ['ordDetRole', 'userEditRoles']),
		...mapState({
			dictMap: state => state.dict.dictMap,
			roles: state => state.user.roles,
			userId: state => state.user.userId
		}),
		disabledState() {
			if (this.isView) return true
			return false
		},
		isEpricing() {
      return this.ordDetRole === 'epricing'
    },
    isEcs() {
      return this.ordDetRole === 'ecs'
    },
		isBkg() {
			return this.ordDetRole === 'bkg'
		},
		isBd() {
			return this.ordDetRole === 'bd'
		},
		isPricing() {
			return this.ordDetRole === 'pricing'
		},
		isView() {
			if (!this.ordDetRole) {
				return true
			}
			if (this.isOp || this.isEpricing || this.isEcs) {
				return true
			}
			if (this.isBd && !['draft', 'refuse'].includes(this.orderStatus)) {
				return true
			}
			if (this.isBkg && !['pass'].includes(this.orderStatus)) {
				return true
			}
			// 商务角色，审核通过的都置灰，只读
			if (this.isPricing && ['pass', 'complete', 'refuse'].includes(this.orderStatus)) {
				return true
			}
			return false
		},
		show() {
			return this.createItem.transport.tradeTermsCode && this.tradeTermsCode.includes(this.createItem.transport.tradeTermsCode.toUpperCase())
		}
	},
	watch: {},
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

		// 选择海外代理人
		handleSelectSupplierName(val) {},
		handleClick(tab, event) {}
	}
}
</script>

<style lang="scss">
.edit-container .component-main-cont .notify-tabs-rail .el-tabs__nav-scroll {
	padding-left: 5px;
}
.notify-tabs-rail .el-tabs__header {
	height: 20px;
	line-height: 20px;
	margin-bottom: 0;
}
.edit-container .order-cont .ship-cont .notify-tabs-rail .el-tabs__item {
	height: 20px;
	line-height: 20px;
	font-size: 12px;
	color: #4a4a4a;
	padding: 0 3px;
}
.edit-container .order-cont .ship-cont .notify-tabs-rail .el-tabs__item.is-active {
	color: #222;
	border: 1px solid #ddd;
	border-bottom: 1px solid #fff;
	position: relative;
	border-top-left-radius: 4px;
	border-top-right-radius: 4px;
}
.edit-container .order-cont .ship-cont .notify-tabs-rail .el-tabs__item.is-active::before {
	content: '';
	position: absolute;
	left: 0;
	right: 0;
	height: 1px;
	background-color: #fff;
	z-index: 2;
	bottom: -2px;
}
.notify-tabs-rail .el-tabs--card > .el-tabs__header {
	border-bottom: 0;
}
.notify-tabs-rail .el-tabs--card > .el-tabs__header .el-tabs__nav {
	border: 0;
}
.notify-tabs-rail .el-tabs--card > .el-tabs__header .el-tabs__item {
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
.row-transport .flex-item-double-rail {
	width: 25%;
	padding: 0 5px 0 0;
	margin-bottom: 4px;
	float: left;
}
.row-transport .flex-item-double-rail.oneThird {
	width: 33.33%;
}
.alert-others-rail {
	position: relative;
	.alert-others-rail-btn {
		position: absolute;
		top: 0;
		left: 230px;
		z-index: 500;
	}
	.alert-others-rail-btn-same {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 500;
		letter-spacing: -1.2px;
	}
}
</style>
