<template>
	<div class="so-container">
		<div class="so-total">
			<span v-if="!containerTotal.isNew" class="so-total-flex">
				<el-tooltip effect="dark" :content="containerTotal.container" placement="top-start" v-if="containerTotal.container">
					<span class="cyTotal">箱型箱量合计：{{ containerTotal.container }}</span>
				</el-tooltip>
				<span v-else class="cyTotal">箱型箱量合计：{{ containerTotal.container }}</span>
				<span class="quantityTotal">件数合计：{{ containerTotal.quantity }}</span>
				<span class="weightTotal">单柜重量合计：{{ containerTotal.weight }}KGS</span>
				<span class="volumeTotal">体积合计：{{ containerTotal.volume }}CBM</span>
			</span>
		</div>

		<el-form-item id="so-list-form" class="so-row-cont">
			<div class="row-cont-tit">
				<span class="tit">箱型</span>
			</div>
			<div style="padding: 8px 0 5px">
				<el-form class="row-flex flex-so" :model="item" v-for="(item, sIndex) in createItem.containerList" :key="sIndex" ref="containerList">
					<div class="btn-plus-search" @click="handleAddContainerList(createItem.containerList)" v-if="!viewState"></div>
					<div class="btn-minus-search" @click="handleDeleteContainerList(sIndex)" v-if="sIndex > 0 && !viewState"></div>
					<div class="row-flex-cont">
						<div class="flex">
							<el-form-item class="form-item-cell" label="箱型" :prop="`containerType`" :show-message="false" :rules="{ required: true, message: ' ', trigger: 'change' }">
								<el-select filterable size="mini" v-model="item.containerType" clearable placeholder="请选择" :disabled="viewState">
									<el-option v-for="item in dictMap.containerTypeRail" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</el-form-item>
							<el-form-item class="form-item-cell" label="箱量" :prop="`containerNum`" :show-message="false" :rules="[{ required: true, message: ' ', trigger: 'blur' }]">
								<el-input size="mini" v-model.number="item.containerNum" clearable placeholder="请输入" :disabled="viewState || isBkg || (isPricing && ['submit'].includes(orderStatus))" @blur="validateContainerNum(item)" />
							</el-form-item>
							<el-form-item class="form-item-cell" label="单柜件数" :prop="`quantity`" :rules="[{ required: true }]" :show-message="false">
								<el-input clearable size="mini" v-model.number="item.quantity" placeholder="请输入" :disabled="viewState" @blur="validateQuantityNum(item)"></el-input>
							</el-form-item>
							<el-form-item class="form-item-cell" label="单柜重量" :prop="`weight`" :show-message="false" :rules="[{ required: true }]">
								<el-input clearable size="mini" v-model="item.weight" placeholder="请输入" :disabled="viewState" @blur="validateWeight(item)"><template slot="append">KGS</template></el-input>
							</el-form-item>
							<el-form-item class="form-item-cell" label="单柜体积" :prop="`volume`" :show-message="false" :rules="[{ required: true }]">
								<el-input clearable size="mini" v-model="item.volume" placeholder="请输入" :disabled="viewState" @blur="validateVolume(item)"><template slot="append">CBM</template></el-input>
							</el-form-item>
							<el-form-item class="form-item-cell" label="包装" :prop="`packageInfo`" :rules="[{ required: true, trigger: 'change' }]" :show-message="false">
								<el-select size="mini" v-model="item.packageInfo" placeholder="请选择包装" clearable filterable :disabled="viewState">
									<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
								</el-select>
							</el-form-item>
							<el-form-item class="form-item-cell" label="单件货重" :prop="`unitWeight`" :show-message="false" :rules="[{ required: true }]">
								<el-input clearable size="mini" v-model="item.unitWeight" placeholder="请输入" :disabled="viewState" @blur="validateSingleWeight(item)"><template slot="append">KGS</template></el-input>
							</el-form-item>
							<el-form-item class="form-item-cell" v-if="isBkg || isPricing || (['pass', 'complete'].includes(orderStatus) && isBd) || (isBd && roles.includes('pricing'))" label="PO号">
								<el-input maxlength="32" :disabled="viewState" clearable size="mini" v-model="item.po" placeholder="请输入"></el-input>
							</el-form-item>

							<el-form-item
								:show-message="false"
								:prop="`sn`"
								:rules="[{ required: createItem.rail.bkgStatus === 'RAIL_DRIVING' || createItem.rail.bkgStatus === 'RAIL_ARRIVAL' || !!createItem.rail.realArriveDate || !!createItem.rail.tdTime, trigger: 'blur' }]"
								v-if="isBkg || (['pass', 'complete'].includes(orderStatus) && (isBd || isPricing))"
								class="form-item-cell"
								label="封号"
							>
								<el-input :disabled="!isBkg || isDisabled" clearable size="mini" v-model="item.sn" placeholder="请输入"></el-input>
							</el-form-item>
							<el-form-item
								:show-message="false"
								:prop="`cn`"
								:rules="[{ required: createItem.rail.bkgStatus === 'RAIL_DRIVING' || createItem.rail.bkgStatus === 'RAIL_ARRIVAL' || !!createItem.rail.realArriveDate || !!createItem.rail.tdTime, trigger: 'blur' }]"
								v-if="isBkg || (['pass', 'complete'].includes(orderStatus) && (isBd || isPricing))"
								class="form-item-cell"
								label="箱号"
							>
								<el-input :disabled="!isBkg || isDisabled" clearable size="mini" v-model="item.cn" placeholder="请输入"></el-input>
							</el-form-item>
						</div>
					</div>
				</el-form>
			</div>
		</el-form-item>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { soList } from '@/api/railway/book/list'

export default {
	data() {
		return {
			soLists: [],
			oQuery: this.$route.query
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
		},
		isDisabled: {
			type: Boolean,
			default: false
		}
	},
	created() {
		this.getSoList()
	},
	mounted() {},
	computed: {
		...mapState('railway', ['ordDetRole', 'userEditRoles']),
		...mapState({
			dictMap: state => state.dict.dictMap,
			roles: state => state.user.roles,
			userId: state => state.user.userId
		}),
		viewState() {
			if (!this.ordDetRole) {
				return true
			}
			if (this.isOp || this.isEpricing || this.isEcs) {
				return true
			}
			// bd角色，草稿和拒绝状态的可以编辑，除了草稿和拒绝状态的都置灰，只读
			if (this.isBd && !['draft', 'refuse'].includes(this.orderStatus)) {
				return true
			}
			// op角色，审核通过的可以编辑，除了审核通过的都置灰，只读
			if (this.isBkg && !['pass'].includes(this.orderStatus)) {
				return true
			}
			// 商务角色，审核通过的都置灰，只读
			if (this.isPricing && ['pass'].includes(this.orderStatus)) {
				return true
			}
			return false
		},
		isEpricing() {
			return this.ordDetRole === 'epricing'
		},
		isEcs() {
			return this.ordDetRole === 'ecs'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isBkg() {
			return this.ordDetRole === 'bkg'
		},
		isBd() {
			return this.ordDetRole === 'bd'
		},
		isPricing() {
			return this.ordDetRole === 'pricing'
		}
	},
	watch: {},
	components: {},
	methods: {
		//获取so列表
		getSoList() {
			soList(this.$route.query.bkgReqNo).then(res => {
				this.soLists = res.data
			})
		},

		// 增加一行箱型箱量
		handleAddContainerList(data) {
			data.push({ containerType: '', containerNum: 1, isHeavy: '' })
		},

		// 删除一行箱型箱量
		handleDeleteContainerList(index) {
			let containerList = this.createItem.containerList
			this.createItem.containerList = containerList.filter((item, sIndex) => {
				return sIndex !== index
			})
		},
		validateContainerNum(item) {
			const intReg = /^[0-9]\d*$/
			if (item.containerNum && !intReg.test(item.containerNum)) {
				item.containerNum = ''
				return this.$message.error('请输入正确的箱量')
			}
			if (item.containerNum > 9999999) {
				item.containerNum = 9999999
				this.$message.error('最大不能超过9999999')
			}
		},
		validateQuantityNum(item) {
			const intReg = /^[0-9]\d*$/
			if (item.quantity && !intReg.test(item.quantity)) {
				item.quantity = ''
				return this.$message.error('请输入正确的件数')
			}
			if (item.quantity > 9999999) {
				item.quantity = 9999999
				this.$message.error('最大不能超过9999999')
			}
		},

		validateWeight(item) {
			if (!item.weight) return
			item.weight = Number(item.weight)
			const reg = /^\d+(\.\d{0,3})?$/
			if (!reg.test(item.weight)) {
				item.weight = ''
				return this.$message.error('请输入正确的单柜重量,最多包含三位小数')
			}
			if (item.weight > 53000) {
				item.weight = 53000
				this.$message.error('最大不能超过53000')
			}
		},
		validateSingleWeight(item) {
			if (!item.unitWeight) return
			item.unitWeight = Number(item.unitWeight)
			const reg = /^\d+(\.\d{0,3})?$/
			if (!reg.test(item.unitWeight)) {
				item.unitWeight = ''
				return this.$message.error('请输入正确的单柜重量,最多包含三位小数')
			}
			if (item.unitWeight > 53000) {
				item.unitWeight = 53000
				this.$message.error('最大不能超过53000')
			}
		},
		checkVolume(rule, value, callback, item) {
			let reg = /^\-?[0-9]\d*\.?\d*$/
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
		validateVolume(item) {
			if (!item.volume) return
			item.volume = Number(item.volume)
			const reg = /^\d+(\.\d{0,3})?$/
			if (!reg.test(item.volume)) {
				item.volume = ''
				return this.$message.error('请输入正确的单柜体积,最多包含三位小数')
			}
			if (item.volume > 100) {
				item.volume = 100
				this.$message.error('最大不能超过100')
			}
		}
	}
}
</script>

<style lang="scss">
.so-container {
	padding-right: 0;
	#so-list-form .el-form-item__content {
		margin-right: 0 !important;
	}
	.so-total {
		margin: 0 8px;
		line-height: 20px;
		height: 20px;
		overflow: hidden;
		.so-total-flex {
			float: left;
			display: flex;
			width: 90%;
			padding-right: 20px;
			span {
				display: block;
				&.cyTotal {
					// flex: 1;
					white-space: nowrap;
					text-overflow: ellipsis;
					overflow: hidden;
				}
				&.quantityTotal {
					width: 150px;
					margin-left: 10px;
				}
				&.weightTotal {
					width: 200px;
					margin-left: 10px;
				}
				&.volumeTotal {
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
				margin-right: 6px;
				margin-top: 24px;
			}
			&.flex-so {
				// border-bottom: 1px solid #e0e0e0;
				margin: 0 6px 0 0;
				padding-top: 0;
				zoom: 1;
				.row-flex-cont {
					float: left;
					max-width: 95.2%;
				}
				&:last-child {
					border-bottom: 0;
				}
				.form-item-cell {
					float: left;
					display: flex;
					margin-bottom: 4px;
					// margin-right: 5px;
					height: 20px;
					// .lab {
					// 	line-height: 20px;
					// 	// margin-right: 5px;
					// 	text-align: right;
					// 	font-size: 12px;
					// 	width: 70px;
					// 	padding-right: 4px;
					// }
					// .to {
					// 	line-height: 20px;
					// 	margin: 0 5px;
					// }
					.el-form-item__label {
						line-height: 20px !important;
						padding-right: 3px;
						width: 70px;
					}
					.el-form-item__content {
						width: 200px;
						line-height: 20px !important;
						// .el-form-item {
						// 	margin-bottom: 0;
						// }
						.el-select {
							width: 100%;
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
						padding: 0 2px;
						letter-spacing: -1px;
					}
					&.is-required {
						label::before {
							// display: none;
							margin-right: 0;
						}
						// input, select, textarea, .el-date-editor--daterange{
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
	}
}
</style>
