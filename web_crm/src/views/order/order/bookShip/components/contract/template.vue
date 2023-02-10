<template>
	<div class="temp-list-cont">
		<div class="temp-list-tit">
			<div class="item w100">岗位</div>
			<div class="item content">特殊要求内容</div>
		</div>
		<div class="temp-list-table">
			<div class="temp-list-row">
				<div class="item w100">订舱</div>
				<div class="item content">
					<el-row>
						<el-col :span="4">
							<div class="label">
								Shipper(发货人)
								<!-- <em class="lock" v-if="!tempDisabled">{{contractTempDetail.lockBkgShipper === 'Y' ? '解锁' : '锁定'}}</em> -->
							</div>
							<el-input type="textarea" v-model="contractTempDetail.bkgShipper" size="mini" placeholder="请输入" :disabled="tempDisabled" :rows="4" maxlength="1024" ></el-input>
						</el-col>
						<el-col :span="4">
							<div class="label">
								Consignee(收货人)
								<!-- <em class="lock" v-if="!tempDisabled">{{contractTempDetail.lockBkgConsignee === 'Y' ? '解锁' : '锁定'}}</em> -->
							</div>
							<el-input type="textarea" v-model="contractTempDetail.bkgConsignee" size="mini" placeholder="请输入" :disabled="tempDisabled" :rows="4" maxlength="1024"></el-input>
						</el-col>
						<el-col :span="4">
							<div class="label">
								Notify Party(通知人)
								<!-- <em class="lock" v-if="!tempDisabled">{{contractTempDetail.lockBkgNotify === 'Y' ? '解锁' : '锁定'}}</em> -->
							</div>
							<el-input type="textarea" v-model="contractTempDetail.bkgNotify" size="mini" placeholder="请输入" :disabled="tempDisabled" :rows="4" maxlength="1024"></el-input>
						</el-col>
						<el-col :span="4">
							<div class="label">
								品名
								<!-- <em class="lock" v-if="!tempDisabled">{{contractTempDetail.lockBkgCargoName === 'Y' ? '解锁' : '锁定'}}</em> -->
							</div>
							<el-input type="textarea" v-model="contractTempDetail.bkgCargoName" size="mini" placeholder="请输入" :disabled="tempDisabled" :rows="4" maxlength="256"></el-input>
						</el-col>
						<el-col :span="4">
							<div class="label">
								限重
								<!-- <em class="lock" v-if="!tempDisabled">{{contractTempDetail.lockBkgCargoWeight === 'Y' ? '解锁' : '锁定'}}</em> -->
							</div>
							<el-input type="textarea" v-model="contractTempDetail.bkgCargoWeight" size="mini" placeholder="请输入" @blur="validateWeight('bkgCargoWeight', contractTempDetail)" :disabled="tempDisabled" :rows="4" ></el-input>
						</el-col>
						<el-col :span="4">
							<div class="label">
								订舱要求
								<!-- <em class="lock" v-if="!tempDisabled">{{contractTempDetail.lockBkgRemark === 'Y' ? '解锁' : '锁定'}}</em> -->
							</div>
							<el-input type="textarea" v-model="contractTempDetail.bkgRemark" size="mini" placeholder="请输入" :disabled="tempDisabled" :rows="4" maxlength="512"></el-input>
						</el-col>
					</el-row>
				</div>
			</div>
			<div class="temp-list-row">
				<div class="item w100">单证</div>
				<div class="item content">
					<el-row>
						<el-col :span="4">
							<div class="label">
								Shipper(发货人)
								<!-- <em class="lock" v-if="!tempDisabled">{{contractTempDetail.lockBlShipper === 'y' ? '解锁' : '锁定'}}</em> -->
							</div>
							<el-input type="textarea" v-model="contractTempDetail.blShipper" size="mini" placeholder="请输入" :disabled="tempDisabled" :rows="4" maxlength="1024"></el-input>
						</el-col>
						<el-col :span="4">
							<div class="label">
								Consignee(收货人)
								<!-- <em class="lock" v-if="!tempDisabled">{{contractTempDetail.lockBlConsignee === 'y' ? '解锁' : '锁定'}}</em> -->
							</div>
							<el-input type="textarea" v-model="contractTempDetail.blConsignee" size="mini" placeholder="请输入" :disabled="tempDisabled" :rows="4" maxlength="1024"></el-input>
						</el-col>
						<el-col :span="4">
							<div class="label">
								Notify Party(通知人)
								<!-- <em class="lock" v-if="!tempDisabled">{{contractTempDetail.lockBlNotify === 'y' ? '解锁' : '锁定'}}</em> -->
							</div>
							<el-input type="textarea" v-model="contractTempDetail.blNotify" size="mini" placeholder="请输入" :disabled="tempDisabled" :rows="4" maxlength="1024"></el-input>
						</el-col>
						<el-col :span="4">
							<div class="label">
								品名
								<!-- <em class="lock" v-if="!tempDisabled">{{contractTempDetail.lockBlCargo_name === 'y' ? '解锁' : '锁定'}}</em> -->
							</div>
							<el-input type="textarea" v-model="contractTempDetail.blCargoName" size="mini" placeholder="请输入" :disabled="tempDisabled" :rows="4" maxlength="256"></el-input>
						</el-col>
						<el-col :span="4">
							<div class="label">
								限重
								<!-- <em class="lock" v-if="!tempDisabled">{{contractTempDetail.lockBlCargoWeight === 'y' ? '解锁' : '锁定'}}</em> -->
							</div>
							<el-input type="textarea" v-model="contractTempDetail.blCargoWeight" size="mini" placeholder="请输入" @blur="validateWeight('blCargoWeight', contractTempDetail)" :disabled="tempDisabled" :rows="4" ></el-input>
						</el-col>
						<el-col :span="4">
							<div class="label">
								补料要求
								<!-- <em class="lock" v-if="!tempDisabled">{{contractTempDetail.lockBlSiRemark === 'y' ? '解锁' : '锁定'}}</em> -->
							</div>
							<el-input type="textarea" v-model="contractTempDetail.blSiRemark" size="mini" placeholder="请输入" :disabled="tempDisabled" :rows="4" maxlength="512"></el-input>
						</el-col>
					</el-row>
				</div>
			</div>
			<div class="temp-list-row">
				<div class="item w100">财务</div>
				<div class="item content">
					<el-row>
						<el-col :span="24">
							<div class="label">
								付款要求
								<!-- <em class="lock" v-if="!tempDisabled">{{contractTempDetail.lockPayRemark === 'y' ? '解锁' : '锁定'}}</em> -->
							</div>
							<el-input type="textarea" v-model="contractTempDetail.payRemark" size="mini" placeholder="请输入" :disabled="tempDisabled" :rows="4" maxlength="512"></el-input>
						</el-col>
					</el-row>
				</div>
			</div>
			<div class="temp-list-row">
				<div class="item w100">其他</div>
				<div class="item content">
					<el-row>
						<el-col :span="24">
							<div class="label">
								其他要求
								<!-- <em class="lock" v-if="!tempDisabled">{{contractTempDetail.lockOtherRemark === 'y' ? '解锁' : '锁定'}}</em> -->
							</div>
							<el-input type="textarea" v-model="contractTempDetail.otherRemark" size="mini" placeholder="请输入" :disabled="tempDisabled" :rows="4" maxlength="512"></el-input>
						</el-col>
					</el-row>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
// import { contractTempSave } from '@/api/order/contract'

export default {
	data() {
		return {
		}
	},
	props: {
		contractTempDetail: {
			type: Object,
			default: () => ({})
		},
		disabledState: {
			type: Boolean,
			default: false
		}
	},
	created() {
	},
	mounted() {},
	activated() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		}),
		roles() {
			let roles = this.$route.query.roles ? this.$route.query.roles.split(',') : []
			return roles
		},
		isPricing() {
			return this.roles.includes('pricing')
		},
		isBkg() {
			return this.roles.includes('bkg')
		},
		isAddCont() {
			return this.bookDetailForm.containerModifyInfo && Object.keys(this.bookDetailForm.containerModifyInfo).length ? true : false
			// return this.bookDetailForm.reqType === 'add'
		},
		isChange() {
			return this.bookDetailForm.portModifyInfo && Object.keys(this.bookDetailForm.portModifyInfo).length ? true : false
			// return this.bookDetailForm.reqType === 'change'
		},
		tempDisabled() {
			console.log('this.contractTempDetail.contractItemId', this.contractTempDetail.contractItemId);
			
			return this.disabledState || (this.contractTempDetail.contractItemId && !this.contractTempDetail.templateName)
			// return this.disabledState || this.contractTempDetail.templateName || !this.contractTempDetail.contractItemId ? false : true
		}
	},
	components: {},
	watch: {
		// contractTempDetail: {
		// 	handler(newVal) {
		// 		this.initData(newVal)
		// 	},
		// 	deep: true,
		// 	immediate: true
		// }
	},
	methods: {
		validateWeight(val, row) {
			// 体积重量保存为小数点后3位
			const pReg = /^\d+(\.\d+)?$/
			if (!row[val]) return
			row[val] = Number(row[val])
			if (!pReg.test(row[val])) {
				row[val] = ''
				let message = ''
				switch (val) {
					case 'blCargoWeight':
						message = '单证限重'
						break
					case 'bkgCargoWeight':
						message = '订舱限重'
						break
				}
				return this.$message.error('请输入正确的' + message)
			}
			if (row[val] > 999999) {
				row[val] = 999999
				this.$message.error('最大不能超过999999!')
			}
			let str = row[val].toString()
			let pointIndex = str.indexOf('.')
			if (pointIndex !== -1) {
				row[val] = str.substring(0, pointIndex + 4)
			}
		},
		// //存在可编辑的row，提示先保存
		// isEditRow() {
		// 	let result = true
		// 	if (this.tableData.find(item => item.isEdit)) {
		// 		result = false
		// 		this.$message.error('请保存套约备注模板')
		// 	}
		// 	return result
		// },
		// handleEdit(row) {
		// 	if (!this.isEditRow()) return
		// 	row.isEdit =  true
		// },
		// handleSave(row) {
		// 	let data = {...row}
		// 	contractTempSave(data).then(res => {
		// 		this.$message.success('保存成功')
		// 		this.$emit('getInfo')
		// 	})
		// },
		// handleCancel(row) {
		// 	row.isEdit = false
		// }
	}
}
</script>
<style lang="scss" scoped>
.temp-list-cont{
	.temp-list-tit{
		background: #f8f9fd;
		height: 24px;
		line-height: 24px;
		border: 1px solid #e9e9e9;
		display: flex;
		.item{
			padding-left: 10px;
			text-align: center;
			&.w100{
				width: 100px;
			}
			&.content{
				flex: 1;
				border-left: 1px solid #e9e9e9;
			}
		}
	}
	.temp-list-table{
		overflow: hidden;
		.temp-list-row{
			border: 1px solid #e9e9e9;
			border-top: 0;
			width: 100%;
			display: table;
			.item{
				padding: 10px;
				text-align: center;
				display: table-cell;
				&.w100{
					width: 100px;
					vertical-align: middle;
					padding: 0 5px;
    			box-sizing: border-box;
					overflow: hidden;
					white-space: normal;
					word-break: break-all;
				}
				&.content{
					padding: 10px 0 10px 10px;
					border-left: 1px solid #e9e9e9;
					.label{
						text-align: left;
						.lock{
							cursor: pointer;
							float: right;
							color: #1890ff;
							font-style: normal;
						}
					}
					.el-col-4, .el-col-24{
						padding-right: 10px;
					}
				}
			}
		}
	}
}

</style>
