<template>
	<div class="auditBookInfoView">
		<div class="title" v-show="!infoConfig.showTitle">{{ infoConfig.title }}</div>
		<!-- 订单基本信息  -->
		<div v-if="infoConfig.type == 'base'">
			<ul class="infoList">
				<template v-for="(item, index) in infoConfig.info">
					<el-tooltip placement="top-start" :key="index" v-if="item.historyVal || (item.historyVal == 0 && item.historyVal !== item.value)">
						<div slot="content">历史数据<br />{{ item.name }}：{{ item.historyVal }}</div>
						<li v-if="!item.hide" :class="item.historyVal || (item.historyVal == 0 && item.historyVal !== item.value) ? 'red' : ''" :key="index" :style="{ width: ['intrustRemark', 'auditRemark'].includes(item.key) ? '100%' : '' }">
							<em>{{ item.name }}：</em>{{ item.value }}
						</li>
					</el-tooltip>
					<li v-else-if="!item.hide" :class="['intrustRemark', 'auditRemark'].includes(item.key) ? 'li-flex' : ''" :key="index" :style="{ width: ['intrustRemark', 'auditRemark'].includes(item.key) ? '100%' : '' }">
						<em>{{ item.name }}：</em><span>{{ item.value }}</span>
					</li>
				</template>
			</ul>
		</div>
		<!-- 货物信息  -->
		<div v-if="infoConfig.type == 'goods'">
			<ul class="infoList" v-for="(item, index) in infoConfig.info" :key="index">
				<!-- <li>{{index+1}}</li> -->
				<li><em>HS Code：</em>{{ item.hscode }}</li>
				<li><em>中文品名：</em>{{ item.cname }}</li>
				<li><em>英文品名：</em>{{ item.ename }}</li>
				<li><em>货品分类：</em>{{ item.commodityTypeCode }}</li>
				<li><em>货物性质：</em>{{ item.property | cargoProperty }}</li>
				<!-- 只有进口拼箱显示长宽高 st11 进口委托订舱 st12 进口客户自订 -->
				<li v-if="['st11', 'st12'].includes(serviceType)"><em>长：</em>{{ item.length }}</li>
				<li v-if="['st11', 'st12'].includes(serviceType)"><em>宽：</em>{{ item.width }}</li>
				<li v-if="['st11', 'st12'].includes(serviceType)"><em>高：</em>{{ item.height }}</li>
				<li class="clearBoth"><em>包装：</em>{{ item.packageInfo }}</li>
				<li v-if="item.dangerousGrade"><em>危险等级：</em>{{ item.dangerousGrade | dangerousGradeFilter }}</li>
				<li v-if="item.dangerousCode"><em>国际危险品编码：</em>{{ item.dangerousCode }}</li>
				<li v-if="item.packageGroup"><em>包装组别：</em>{{ item.packageGroup }}</li>
				<li v-if="item.isWoodenPackage"><em>木质包装：</em>{{ item.isWoodenPackage === 'y' ? '是' : '否' }}</li>
				<li><em>发货单位：</em>{{ item.shipperName }}</li>
				<li class="list-wrap li-flex">
					<em>唛头：</em><span>{{ item.mark }}</span>
				</li>
				<li class="list-wrap li-flex">
					<em>货物描述：</em><span>{{ item.commodityDesc }}</span>
				</li>
			</ul>
			<div class="goods-wrap">
				<em>收货人：</em><span>{{ infoConfig.transport && infoConfig.transport.consignee }}</span>
			</div>
			<div class="goods-wrap">
				<em>发货人：</em><span>{{ infoConfig.transport && infoConfig.transport.shipper }}</span>
			</div>
			<div class="goods-wrap notify">
				<em>Notify Party(通知人)：</em><span>{{ infoConfig.transport && infoConfig.transport.notify1 }}</span>
			</div>
			<div class="goods-wrap notify">
				<em>Also Notify Party：</em><span>{{ infoConfig.transport && infoConfig.transport.notify2 }}</span>
			</div>
			<!-- <div class="goods-wrap"><em>通知人3：</em><span>{{infoConfig.transport && infoConfig.transport.notify3}}</span></div> -->
		</div>
	</div>
</template>

<script>
import { getDictLabel } from '@/utils/tools'

export default {
	filters: {
		cargoProperty(property) {
			return getDictLabel('cargoProperty', property)
		},
		dangerousGradeFilter(dangerousGrade) {
			return getDictLabel('dangerousGrade', dangerousGrade)
		}
	},
	data() {
		return {}
	},
	props: {
		infoConfig: {
			type: Object,
			default: () => ({})
		},
		serviceType: {
			type: String,
			default: ''
		}
	},
	created() {},
	mounted() {},
	components: {},
	methods: {}
}
</script>

<style lang="scss">
.auditBookInfoView {
	margin: 10px 0;
	.title {
		font-weight: 600;
	}
	ul.infoList {
		list-style: none;
		padding: 0;
		margin-top: 5px;
		zoom: 1;
		display: flex;
		flex-wrap: wrap;
		li {
			display: block;
			width: 20%;
			min-height: 20px;
			// float: left;
			margin-bottom: 5px;
			padding-right: 30px;
			em {
				font-style: normal;
				color: #888;
			}
			&.red em {
				color: #e63923;
			}
			&.li-flex {
				display: flex;
				flex-wrap: wrap;
				em {
					width: 60px;
					display: block;
				}
				span {
					display: block;
					flex: 1;
					word-break: break-all;
					white-space: normal;
					line-height: 20px;
				}
			}
		}
		.clearBoth {
			clear: both;
		}
		.list-wrap {
			width: 100%;
		}
	}
	ul.infoList::after {
		display: block;
		clear: both;
		content: '';
		visibility: hidden;
		height: 0;
	}
	.small-tit {
		font-size: 12px;
		font-weight: 600;
	}
	.goods-wrap {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		margin-bottom: 5px;
		em {
			width: 60px;
			display: block;
			font-style: normal;
			color: #888;
		}
		&.notify em {
			width: 125px;
		}
		span {
			display: block;
			flex: 1;
			word-break: break-all;
			white-space: normal;
			line-height: 20px;
		}
	}
}
</style>
