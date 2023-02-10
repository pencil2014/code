<template>
	<div class="whBookInfoView">
		<div class="title" v-show="infoConfig.showTitle">{{ infoConfig.title }}</div>
		<!-- 订单基本信息  -->
		<div v-if="infoConfig.type == 'base'">
			<ul class="infoList">
				<template v-for="(item, index) in infoConfig.info">
					<li v-if="item.key === 'whAgentSupplierId' && !isBd" :key="index" class="wh-agent-supplier-name" style="width:40%;">
						<em>{{ item.name }}：</em>
						<el-select
							class="wh-agent-supplier-name-select"
							:disabled="item.disabled"
							size="mini"
							v-model="item.value"
							filterable
							remote
							clearable
							placeholder="请输入"
							:remote-method="
								val => {
									val && whAgentFilterMehod(val)
								}
							"
							@visible-change="
								val => {
									val && whAgentVisibleChange(val)
								}
							"
							@change="
								val => {
									handleChangeWhAgent(val, item)
								}
							"
						>
							<el-option v-for="item in whAgentSupplierList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</li>
					<el-tooltip placement="top-start" :key="index" v-else-if="item.historyVal || (item.historyVal == 0 && item.historyVal !== item.value)">
						<div slot="content">历史数据<br />{{ item.name }}：{{ item.historyVal }}</div>
						<li
							v-if="!item.hide && item.key != 'whAgentSupplierId'"
							:class="item.historyVal || (item.historyVal == 0 && item.historyVal !== item.value) ? 'red' : ''"
							:key="index"
							:style="{ width: ['intrustRemark', 'auditRemark'].includes(item.key) ? '100%' : '' }"
						>
							<em>{{ item.name }}：</em>{{ item.value }}
						</li>
					</el-tooltip>
					<li v-else-if="!item.hide && item.key != 'whAgentSupplierId'" :class="['intrustRemark', 'auditRemark'].includes(item.key) ? 'li-flex' : ''" :key="index" :style="{ width: ['intrustRemark', 'auditRemark'].includes(item.key) ? '100%' : '' }">
						<em>{{ item.name }}：</em>
						<span>{{ item.value }}</span>
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
				<li><em>货品分类：</em>{{ commodityTypeCodeFilter(item.commodityTypeCode) }}</li>
				<li><em>货物性质：</em>{{ item.property | cargoProperty }}</li>
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
		</div>
	</div>
</template>

<script>
import { getDictLabel } from '@/utils/tools'
import { cargoHscodeList, cargoTypeList, cargoUnnoList } from '@/api/base'
import { mapState } from 'vuex'

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
		return {
			whAgentSupplierList: [], // 订舱代理
			commodityTypeCodeOptions: []
		}
	},
	props: {
		infoConfig: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		this.queryCargoTypeList()
	},
	mounted() {
		// 初始化订舱代理下拉数据源
		this.whAgentSupplierList = this.infoConfig.info.filter(item => item.key === 'whAgentSupplierId')
	},
	computed: {
		...mapState({
			ordDetRole: state => state.order.orderList.ordDetRole
		}),

		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'asst'
		}
	},
	components: {},

	methods: {
		// 改变id时 同步代理名称
		handleChangeWhAgent(val, item) {
			console.log('🚀 ~ item', item)
			console.log('🚀 ~ val', val)
			let selectItem = this.whAgentSupplierList.find(item => item.supplierId === val)
			if (selectItem) {
				item.label = selectItem.name
			} else {
				item.label = ''
			}
		},
		// 订舱代理
		whAgentVisibleChange(val) {
			if (val) this.getSupplierList('')
		},
		whAgentFilterMehod(val) {
			this.getSupplierList(val)
		},
		// 获取订舱代理
		getSupplierList(queryString) {
			this.$store.dispatch('dict/querySupplierList', { category: 'serviceCode', value: 'whbook,proxy_whbook', queryString: queryString, categoryType: 'in' }).then(data => {
				this.whAgentSupplierList = data.list.map(ele => {
					return Object.assign(ele, {
						label: this.$language == 'en' ? ele.ename : ele.name,
						value: ele.supplierId ? Number(ele.supplierId) : ''
					})
				})
			})
		},
		// 货品分类
		queryCargoTypeList() {
			cargoTypeList().then(response => {
				this.commodityTypeCodeOptions = response.data.map(item => {
					return Object.assign({}, item, {
						label: item.chapterName,
						value: item.chapterCode
					})
				})
			})
		},
		commodityTypeCodeFilter(commodityTypeCode) {
			let findItem = this.commodityTypeCodeOptions.find(item => item.value === commodityTypeCode)
			return findItem ? findItem.label : ''
		}
	}
}
</script>

<style lang="scss">
.whBookInfoView {
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
			margin-bottom: 8px;
			padding-right: 30px;
			em {
				font-style: normal;
				color: #888;
				line-height: 20px;
			}
			&.red em {
				color: #e63923;
			}
			&.li-flex {
				width: 100%;
				display: flex;
				flex-wrap: wrap;
				em {
					width: 60px;
					display: block;
					&.etWhCyCutOff {
						width: 84px;
					}
				}
				span {
					display: block;
					flex: 1;
					word-break: break-all;
					white-space: normal;
					line-height: 20px;
				}
			}
			&.wh-agent-supplier-name {
				display: flex;
				flex-wrap: wrap;
				em {
					width: 80px;
					display: block;
				}
				.wh-agent-supplier-name-select {
					flex: 1;
				}
			}
			.el-input__suffix {
				right: 0;
			}
			.el-input--suffix .el-input__inner {
				padding-right: 10px;
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
}
</style>
