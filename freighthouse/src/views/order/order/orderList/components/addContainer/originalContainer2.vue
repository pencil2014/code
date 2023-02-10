<template>
	<div class="orig-so-container">
		<div class="orig-cont">
			<div class="so-total" style="margin-bottom: 0 !important;">
				<span class="tit">原箱型箱量</span>
				<span class="so-total-flex">
					<el-tooltip effect="dark" :content="containerTotal.container" placement="top-start" v-if="containerTotal.container">
						<span class="cyTotal">合计：{{ containerTotal.container }}</span>
					</el-tooltip>
					<span v-else class="cyTotal">合计：{{ containerTotal.container }}</span>
					<span class="quantityTotal">件数合计：{{ containerTotal.quantity }}</span>
					<span class="weightTotal">重量合计：{{ containerTotal.weight }}KGS</span>
					<span class="volumeTotal">体积合计：{{ containerTotal.volume }}CBM</span>
				</span>
			</div>
			<!-- 箱型箱量 -->
			<el-form-item id="so-list-form" class="so-row-cont" v-for="(o, index) in addInfo.orgSoContainerList" :key="index" prop="">
				<div class="row-cont-tit">
					<span class="tit" style="font-weight: normal">箱型箱量(单SO)</span>
					<div class="row-cont-rt">
            <span :class="o.isSplit === 'y' ? 'green' : ''">{{o.isSplit === 'y' ? '分开放舱' : '不分开放舱'}}</span>
						<!-- <el-checkbox size="mini" v-model="o.isSplit" true-label="y" false-label="n" :disabled="true">分开放舱</el-checkbox> -->
						<span class="expand" @click="handleToogleExpand(index)"> {{ !o.containerListShowState ? '收起' : '展开' }}<i :class="!o.containerListShowState ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
					</div>
				</div>
				<div v-show="!o.containerListShowState" style="padding: 8px 0 5px">
					<el-form class="row-flex flex-so" v-for="(item, sIndex) in o.containerList" :key="sIndex" :model="addInfo.orgSoContainerList[index]" ref="containerList">
						<div class="row-flex-cont" :style="{width: isBkg ? '100%' : ''}">
							<div class="flex">
								<el-form-item class="item-cell containerType" label="箱型" :prop="`containerList.${sIndex}.containerType`">
									<el-select filterable size="mini" v-model="item.containerType" style="width: 100px" clearable placeholder="请选择" :disabled="true">
										<el-option v-for="item in dictMap.containerTypeShiporder" :key="item.value" :label="item.label" :value="item.value"> </el-option>
									</el-select>
								</el-form-item>
								<el-form-item class="item-cell" label="箱量" :prop="`containerList.${sIndex}.containerNum`">
									<el-input size="mini" v-model.number="item.containerNum" clearable placeholder="请输入" style="width: 100px" :disabled="true" />
								</el-form-item>
								<el-form-item class="item-cell specialWidth" label="单柜件数" :prop="`containerList.${sIndex}.quantity`" :show-message="false">
									<el-input clearable size="mini" v-model="item.quantity" placeholder="请输入" style="width: 100px" :disabled="true"></el-input>
								</el-form-item>
								<el-form-item class="item-cell" label="单柜重量" :prop="`containerList.${sIndex}.weight`" :show-message="false">
									<el-input clearable size="mini" v-model="item.weight" placeholder="请输入" style="width: 100px" :disabled="true"><template slot="append">KGS</template></el-input>
								</el-form-item>
								<el-form-item class="item-cell" label="单柜体积" :prop="`containerList.${sIndex}.volume`" :show-message="false">
									<el-input clearable size="mini" v-model="item.volume" placeholder="请输入" style="width: 100px" :disabled="true"><template slot="append">CBM</template></el-input>
								</el-form-item>
								<el-form-item class="item-cell specialWidth" label="包装" :prop="`containerList.${sIndex}.packageInfo`" :show-message="false">
									<el-select size="mini" v-model="item.packageInfo" placeholder="请选择包装" clearable filterable style="width: 100px" :disabled="true">
										<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
									</el-select>
								</el-form-item>
								<el-form-item class="item-cell" label="是否重柜" :prop="`containerList.${sIndex}.isHeavy`" :show-message="false">
									<el-select size="mini" v-model="item.isHeavy" style="width: 100px" clearable placeholder="请选择" :disabled="true">
										<el-option v-for="ele in yesOrNoOptions" :key="ele.value" :label="ele.label" :value="ele.value"> </el-option>
									</el-select>
								</el-form-item>
								<div class="item-cell">
									<span class="lab">用箱要求</span>
									<el-select size="mini" v-model="item.boxRemark" style="width: 100px;" clearable placeholder="请选择" :disabled="true">
										<el-option v-for="item in dictMap.boxRemark" :key="item.value" :label="item.label" :value="item.value"> </el-option>
									</el-select>
								</div>
							</div>
							<div class="flex">
								<el-form-item class="item-cell specialWidth" label="特种长宽高" v-if="item.containerType && (item.containerType.toUpperCase().indexOf('OT') !== -1 || item.containerType.toUpperCase().indexOf('FR') !== -1)">
									<el-col :span="8">
										<el-form-item :prop="`containerList.${sIndex}.specialLength`" :show-message="false">
											<el-input clearable size="mini" v-model.number="item.specialLength" placeholder="请输入" style="width: 120px; margin-right: 5px" :disabled="true">
												<template slot="prepend">长</template>
												<template slot="append">m</template>
											</el-input>
										</el-form-item>
									</el-col>
									<el-col :span="8">
										<el-form-item :prop="`containerList.${sIndex}.specialWidth`" :show-message="false">
											<el-input clearable size="mini" v-model.number="item.specialWidth" placeholder="请输入" style="width: 120px; margin-right: 5px" :disabled="true">
												<template slot="prepend">宽</template>
												<template slot="append">m</template>
											</el-input>
										</el-form-item>
									</el-col>
									<el-col :span="8">
										<el-form-item :prop="`containerList.${sIndex}.specialHeight`" :show-message="false">
											<el-input clearable size="mini" v-model.number="item.specialHeight" placeholder="请输入" style="width: 120px;" :disabled="true">
												<template slot="prepend">高</template>
												<template slot="append">m</template>
											</el-input>
										</el-form-item>
									</el-col>
								</el-form-item>
								<div class="item-cell specialWidth" v-if="item.containerType && (item.containerType.toUpperCase().indexOf('OT') !== -1 || item.containerType.toUpperCase().indexOf('FR') !== -1)">
									<span class="lab">是否超尺寸</span>
									<el-select size="mini" v-model="item.gangeType" style="width: 100px;" clearable placeholder="请选择" :disabled="true">
										<el-option v-for="item in gangeTypeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
									</el-select>
								</div>
								<div class="item-cell" v-if="item.containerType && (item.containerType.toUpperCase().indexOf('OT') !== -1 || item.containerType.toUpperCase().indexOf('FR') !== -1)">
									<span class="lab">超限</span>
									<el-input clearable size="mini" v-model="item.sizeBefore" placeholder="请输入" style="width: 110px;margin-right: 5px" :disabled="true">
										<template slot="prepend">前</template>
										<template slot="append">m</template>
									</el-input>
									<el-input clearable size="mini" v-model="item.sizeAfter" placeholder="请输入" style="width: 110px;margin-right: 5px" :disabled="true">
										<template slot="prepend">后</template>
										<template slot="append">m</template>
									</el-input>
									<el-input clearable size="mini" v-model="item.sizeLeft" placeholder="请输入" style="width: 110px;margin-right: 5px" :disabled="true">
										<template slot="prepend">左</template>
										<template slot="append">m</template>
									</el-input>
									<el-input clearable size="mini" v-model="item.sizeRight" placeholder="请输入" style="width: 110px;" :disabled="true">
										<template slot="prepend">右</template>
										<template slot="append">m</template>
									</el-input>
								</div>
								<el-form-item
									class="item-cell"
									label="单位"
									:prop="`containerList.${sIndex}.temperatureType`"
									:show-message="false"
									v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1"
								>
									<el-select size="mini" v-model="item.temperatureType" style="width: 100px;" clearable placeholder="请选择" :disabled="true">
										<el-option v-for="item in dictMap.temperatureType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
									</el-select>
								</el-form-item>
								<el-form-item
									class="item-cell"
									label="设置温度"
									:prop="`containerList.${sIndex}.temperatureSet`"
									:show-message="false"
									v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1"
								>
									<el-input size="mini" v-model="item.temperatureSet" clearable placeholder="请输入" style="width: 100px;" :disabled="true"></el-input>
								</el-form-item>
								<el-form-item
									class="item-cell"
									label="最低温度"
									:prop="`containerList.${sIndex}.temperatureMin`"
									:show-message="false"
									v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1"
								>
									<el-input size="mini" v-model="item.temperatureMin" clearable placeholder="请输入" style="width: 100px;" :disabled="true"></el-input>
								</el-form-item>
								<el-form-item
									class="item-cell"
									label="最高温度"
									:prop="`containerList.${sIndex}.temperatureMax`"
									:show-message="false"
									v-if="item.containerType.toUpperCase().indexOf('RF') !== -1"
								>
									<el-input size="mini" v-model="item.temperatureMax" clearable placeholder="请输入" style="width: 100px;" :disabled="true"></el-input>
								</el-form-item>
								<el-form-item
									class="item-cell"
									label="通风量"
									:prop="`containerList.${sIndex}.airMete`"
									:show-message="false"
									v-if="item.containerType && item.containerType.toUpperCase().indexOf('RF') !== -1"
								>
									<el-input clearable size="mini" v-model="item.airMete" placeholder="请输入" style="width: 100px;" :disabled="true">
										<template slot="append">CBM/时</template>
									</el-input>
								</el-form-item>
								<el-form-item
									class="item-cell"
									label="湿度要求"
									:prop="`containerList.${sIndex}.humidity`"
									:show-message="false"
									v-if="item.containerType.toUpperCase().indexOf('RF') !== -1"
								>
									<el-input size="mini" v-model="item.humidity" clearable placeholder="请输入" style="width: 100px;" :disabled="true"></el-input>
								</el-form-item>
							</div>
						</div>
					</el-form>
				</div>
			</el-form-item>
		</div>
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
		}
	},
	props: {
		containerTotal: {
			type: Object,
			default: () => ({})
		},
		addInfo: {
			type: Object,
			default: () => ({})
		},
	},
	created() {
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userId: state => state.user.userId
		}),
		roles() {
      return this.$route.query.roles ? this.$route.query.roles.split(',') : []
		},
		isPricing() {
			return this.roles.includes('pricing')
		},
		isBkg() {
			return this.roles.includes('bkg')
		},
	},
	watch: {},
	components: {},
	methods: {
		// 箱型箱量展开收起
		handleToogleExpand(index) {
			let { containerListShowState } = this.addInfo.orgSoContainerList[index]
			this.$set(this.addInfo.orgSoContainerList[index], 'containerListShowState', !containerListShowState)
		},
	}
}
</script>

<style lang="scss">
.orig-so-container {
	padding-right: 0;
	margin-bottom: 5px;
	.orig-cont{
		background-color: #f5f7f9;
		margin: 0 8px;
		padding: 4px 0;
		.so-total {
			.tit{
				font-weight: bold; 
				float:left;
				margin-right: 10px;
			}
			.expand{
				float: right;
				margin-right: 4px;
			}
		}
	}
	#so-list-form .el-form-item__content {
		margin-right: 0 !important;
	}
	.so-total {
		margin: 0 8px 4px 8px !important;
		line-height: 20px;
		height: 20px;
		font-size: 12px;
		overflow: hidden;
		.so-total-flex{
			float: left;
			display: flex;
			width: 88.5%;
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
					max-width: 150px;
					margin-left: 10px;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
				}
				&.weightTotal{
					max-width: 200px;
					margin-left: 10px;
				}
				&.volumeTotal{
					max-width: 180px;
					margin-left: 10px;
					// flex: 1;
				}
			}
		}
		&.bold{
			font-weight: bold;
		}
		.el-button--mini{
			padding: 0 8px;
    	height: 20px;
		}
	}
	.so-row-cont {
		border: 1px solid #e9e9e9;
		border-radius: 4px;
		margin: 4px 8px 0 !important;
		overflow: hidden;
		&.margin0 {
			margin: 0;
		}
		&.mt10 {
			margin-top: 10px;
		}
		.row-cont-tit {
			background-color: #f2f2f2;
			border-radius: 4px 4px 0px 0px;
			height: 24px;
			line-height: 24px;
			.tit {
				font-size: 12px;
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
				.el-checkbox {
					.el-checkbox__label {
						font-size: 12px;
					}
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
				// border-bottom: 1px solid #e0e0e0;
				margin: 0 6px 0 0;
				padding-top: 0;
				zoom: 1;
				.row-flex-cont{
					float: left;
					max-width: 95.8%;
					.flex{
						position: relative;
					}
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
						// margin-right: 5px;
						text-align: right;
						font-size: 12px;
						width: 70px;
						padding-right: 4px;
					}
					.to {
						line-height: 20px;
						margin: 0 5px;
					}
					.el-form-item__label {
						line-height: 20px !important;
						padding-right: 3px;
						width: 70px;
					}
					&.specialWidth .el-form-item__label, &.specialWidth .lab{
						width: 70px;
					}
					.el-form-item__content {
						line-height: 20px !important;
						.el-form-item{
							margin-bottom: 0px !important;
						}
					}
					.el-input {
						line-height: 20px !important;
					}
					.el-form-item__error {
						padding-top: 0;
					}
					.el-input__suffix {
						right: 0;
					}
					.el-input-group__append,
					.el-input-group__prepend {
						line-height: 18px;
					}
					&.is-required {
						label::before {
							// display: none;
							margin-top: 0;
						}
						// input,
						// select,
						// textarea,
						// .el-date-editor--daterange {
						// 	background: #fef5f4;
						// }
						.is-disabled {
							input,
							select,
							textarea,
							.el-date-editor--daterange {
								background: #f5f7fa;
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
		.el-input--suffix .el-input__inner {
			padding-right: 20px;
		}
		.el-input--mini .el-input__icon {
    	line-height: 20px;
		}
	}
	.icon-add-container{
		font-size: 12px;
		display: inline-block;
		color: #fff;
		background: #ef8519;
		width: 16px;
		height: 16px;
		border-radius: 2px;
		font-style: normal;
		line-height: 16px;
		text-align: center;
		font-size: 12px;
		margin-right: 5px;
		&.abs{
			position: absolute;
			top: 2px;
			left: 10px;
		}
	}
}
</style>
