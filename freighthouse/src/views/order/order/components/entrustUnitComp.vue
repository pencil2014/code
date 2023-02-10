<template>
	<!-- 委托单位组件 -->
	<span class="container">
		<span class="mr5">委托单位:</span>
		<!-- 文字溢出才加tip -->
		<el-popover placement="top" width="200" trigger="hover" class="port-ename" popper-class="port-unit-popover">
			<div class="port-popover">
				<div>
					<span>{{ showName }}</span>
					<em @click="handleCopyPort(showName, $event)">复制</em>
				</div>
				<div class="red" v-if="detailForm.bdServiceMode">新旧模式：{{ detailForm.bdServiceMode | getDictLabelFilter('bdServiceMode') }}</div>
				<!-- 海运进口，空运进口才显示合同信息 -->
				<template v-if="['ship_import_fcl', 'ship_import_lcl', 'air_import'].includes(detailForm.businessType)">
					<div class="">是否有合同：{{ detailForm.contract && detailForm.contract.contractNo ? '是' : '否' }}</div>
					<div class="" v-if="detailForm.contract && detailForm.contract.contractNo">合同有效期：{{ detailForm.contract.effectStartDate }} 至 {{ detailForm.contract.effectEndDate }}</div>
				</template>
			</div>
			<div slot="reference" class="show-name">{{ showName }}</div>
		</el-popover>
		<i class="el-icon-edit" v-if="showEdit" @click="handleCustUpdaShow"></i>
		<template v-if="isWhitelist && !isJoint">
			<span>
				<img :src="require(`@/views/order/order/images/white-new.png`)" class="vip-img mb3" />
				<span class="industry-class">{{ detailForm.industry }}</span>
			</span>
		</template>
		<template v-else-if="detailForm.custLevel && !isJoint">
			<el-tooltip class="item" effect="dark" placement="bottom">
				<div slot="content">客户VIP等级</div>
				<img :src="require(`@/views/crm/merchantManagement/customerList/images/icon-${detailForm.custLevel.toLowerCase()}.png`)" class="vip-img" />
			</el-tooltip>
		</template>
		<span class="ml5" v-if="!isJoint && detailForm.custClass">客户类型: {{ detailForm.custClass.toLowerCase() | getDictLabelFilter('customerClass') }}</span>
		<slot />
	</span>
</template>

<script>
import clip from '@/utils/clipboard'
import { mapState } from 'vuex'
import { orderConfigString } from '@/api/order/contract'
export default {
	props: {
		options: {
			type: Object,
			default: () => {
				return {}
			}
		},
		showEdit: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			isJoint: false,
			isRealEntrust: false //返回值 data 为 配置的数据，如果有值，并且包含这个协同单的结算单位，则显示实际委托单位
		}
	},
	computed: {
		...mapState({
			orderDetailCustInfo: state => state.order.custInfoObj
		}),
		detailForm() {
			return this.options && (this.options.custid || this.options.custName || this.options.name) ? { ...this.options, name: this.options.name || this.options.custName } : this.orderDetailCustInfo
		},
		isWhitelist() {
			return this.detailForm.isWhitelist && (this.detailForm.isWhitelist === 'yes' || this.detailForm.isWhitelist === 'YES') // 白名单用户
		},
		showName() {
			let source = this.$route.query.source
			if (source === 'orderList' || this.isRealEntrust) {
				//订单详情 或者 海外仓协同单配置数据 展示name
				// return this.detailForm.name
				// 20220705 取订单详情接口的custName
				return this.detailForm.custName
			} else if (source === 'jointList') {
				//协同详情展示compDeptName
				this.isJoint = true
				return this.detailForm.compDeptName
			} else if (this.detailForm.isJoint && this.detailForm.compDeptName) {
				this.isJoint = true
				return this.detailForm.compDeptName
			} else {
				return this.detailForm.name
			}
		}
	},
	created() {
		console.log('委托单位对象数据：', this.detailForm)
		// 海外仓请求配置数据接口
		if (this.$route.name === 'JointOrderDetail') {
			orderConfigString({ key: 'joint_real_cust' }).then(res => {
				if (res.code === 0) {
					this.isRealEntrust = res.data.includes(this.detailForm.jointCompDeptCode)
					console.log('🚀 ~ this.detailForm.jointCompDeptCode', this.detailForm.jointCompDeptCode)
					console.log('🚀 ~ res.data', res.data)
				} else {
					this.isRealEntrust = false
				}
			})
		}
	},
	methods: {
		handleCustUpdaShow() {
			this.$emit('handleCustUpdaShow')
		},
		handleCopyPort(val, e) {
			clip(val, e)
		},
		clipboardSuccess() {
			this.$message({
				message: '复制成功',
				type: 'success',
				duration: 1500
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	display: flex;
	width: 100%;
	.mr5 {
		margin-right: 5px;
	}
	.ml5 {
		margin-left: 5px;
	}
	.vip-img {
		width: 20px !important;
		height: 20px !important;
		vertical-align: middle !important;
		cursor: pointer;
		margin: auto 0;
		margin-left: 5px !important;
		padding-right: initial !important;
	}
	.el-icon-edit {
		display: inline-block !important;
	}
	.industry-class {
		margin-left: 5px;
		// -webkit-text-stroke: 0.5px #000;
	}
	.mb3 {
		margin-bottom: 3px;
	}
	.port-ename {
		// flex: 1;
		overflow: hidden;
		display: inline-block;
		padding: 0 0 0 5px;
		.show-name {
			width: 100%;
			-webkit-text-stroke: 0.5px #000;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
	.el-icon-edit {
		display: block;
		font-size: 14px;
		font-weight: bold;
		// margin-left: 5px;
		color: #3e80f5;
		cursor: pointer;
		height: 20px;
		line-height: 20px;
	}
}
</style>
