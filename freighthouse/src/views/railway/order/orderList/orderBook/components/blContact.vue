<template>
	<div class="row-flex ml10">
		<div class="flex-item">
			<div class="item-label"><span class="lab">发货人</span></div>
			<el-input size="mini" placeholder="请输入" v-model="createItem.blContact.shipper"></el-input>
		</div>
		<div class="flex-item">
			<div class="item-label"><span class="lab">收货人</span></div>
			<el-input size="mini" placeholder="请输入" v-model="createItem.blContact.consignee"></el-input>
		</div>
		<div class="flex-item">
			<div class="item-label"><span class="lab">通知人1</span></div>
			<el-input type="textarea" row="3" size="mini" placeholder="请输入" v-model="createItem.blContact.notify1"></el-input>
		</div>
		<!-- <div class="flex-item">
      <div class="item-label"><span class="lab">通知人2</span></div>
      <el-input type="textarea" row="3" size="mini" placeholder="请输入" v-model="createItem.blContact.notify2"></el-input>
    </div>
    <div class="flex-item">
      <div class="item-label"><span class="lab">通知人3</span></div>
      <el-input type="textarea" row="3" size="mini" placeholder="请输入" v-model="createItem.blContact.notify3"></el-input>
    </div>
    <div class="flex-item">
      <div class="item-label"><span class="lab">委托备注</span></div>
      <el-input type="textarea" row="3" size="mini" placeholder="请输入" v-model="createItem.blContact.intrustRemark"></el-input>
    </div>   -->
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { supplierInfo } from '@/api/crm/supplier'

export default {
	data() {
		return {
			oQuery: this.$route.query,
			tradeTermsCode: ['DDP', 'DDU'],
			supplierList: []
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
		// this.init()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			roles: state => state.user.roles
		}),
		isIncludeFeeder() {
			return this.includeFeeder === 'y' ? true : false
		},
		disabledState() {
			if (this.isOp || this.isView) return true
			return false
		},

		isOp() {
			return this.roles.includes('op')
		},
		isBd() {
			return !this.roles.includes('pricing') && (this.roles.includes('bd') || this.roles.includes('obd'))
		},
		isView() {
			if (this.isBd && this.orderStatus !== 'draft') {
				return true
			}
			if (this.isOp && !['pass'].includes(this.orderStatus)) {
				return true
			}
			return false
		},
		show() {
			return this.tradeTermsCode.includes(this.createItem.transport.tradeTermsCode)
		}
	},
	watch: {},
	components: {},
	methods: {
		// init() {
		//   if (this.createItem.transport.overseaAgentSupplierId || this.createItem.transport.overseaAgentSupplierId) {
		//     this.getSupplierList(this.createItem.transport.overseaAgentSupplierId)
		//   }
		// }
	}
}
</script>

<style lang="scss"></style>
