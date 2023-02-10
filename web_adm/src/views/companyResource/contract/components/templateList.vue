<template>
	<div class="temp-list-cont">
		<div class="temp-list-tit">
			<div class="item w110">Contract number</div>
			<div class="item w80">岗位</div>
			<div class="item content">特殊要求内容</div>
			<div class="item w100">操作</div>
		</div>
		<template v-if="tableData.length === 0">
			<div class="temp-list-empty">暂无数据</div>
		</template>
		<template v-else>
			<div class="temp-list-table" v-for="(item, index) in tableData" :key="index">
				<div class="item no">{{item.smContractNumber}}</div>
				<div style="display: table-cell">
					<div class="temp-list-row">
					<div class="item w80">订舱</div>
					<div class="item content">
						<el-row>
							<el-col :span="4">
								<div class="label">
									Shipper(发货人)
									<el-button type="text" class="lock" @click="handleChangeLock(index, item, 'lockBkgShipper')" :disabled="!item.isEdit">
										{{item.lockBkgShipper === 'Y' ? '解锁' : '锁定'}}
									</el-button>
								</div>
								<TextAreaItem
								  isNeedCheckRowLen
									@dblclick.native="editDetail('bkgShipper', item, !item.isEdit || item.lockBkgShipper === 'Y')"
									:disabled="!item.isEdit || item.lockBkgShipper === 'Y'"
									keys="bkgShipper"
									label="Shipper(发货人)"
									:rows="4"
									maxlength="1024"
									heightVal="90px"
									:value.sync="item.bkgShipper"
								></TextAreaItem>
								<!-- <el-input type="textarea" v-model="item.bkgShipper" size="mini" placeholder="请输入" :disabled="!item.isEdit || item.lockBkgShipper === 'Y'" :rows="4" maxlength="1024"></el-input> -->
							</el-col>
							<el-col :span="4">
								<div class="label">
									Consignee(收货人)
									<el-button type="text" class="lock" @click="handleChangeLock(index, item, 'lockBkgConsignee')" :disabled="!item.isEdit">
										{{item.lockBkgConsignee === 'Y' ? '解锁' : '锁定'}}
									</el-button>
								</div>
								<TextAreaItem
								  isNeedCheckRowLen
									@dblclick.native="editDetail('bkgConsignee', item, !item.isEdit || item.lockBkgConsignee === 'Y')"
									:disabled="!item.isEdit || item.lockBkgConsignee === 'Y'"
									keys="bkgConsignee"
									label="Consignee(收货人)"
									:rows="4"
									maxlength="1024"
									heightVal="90px"
									:value.sync="item.bkgConsignee"
								></TextAreaItem>
								<!-- <el-input type="textarea" v-model="item.bkgConsignee" size="mini" placeholder="请输入" :disabled="!item.isEdit || item.lockBkgConsignee === 'Y'" :rows="4" maxlength="1024"></el-input> -->
							</el-col>
							<el-col :span="4">
								<div class="label">
									Notify Party(通知人)
									<el-button type="text" class="lock" @click="handleChangeLock(index, item, 'lockBkgNotify')" :disabled="!item.isEdit">
										{{item.lockBkgNotify === 'Y' ? '解锁' : '锁定'}}
									</el-button>
								</div>
								<TextAreaItem
								  isNeedCheckRowLen
									@dblclick.native="editDetail('bkgNotify', item, !item.isEdit || item.lockBkgNotify === 'Y')"
									:disabled="!item.isEdit || item.lockBkgNotify === 'Y'"
									keys="bkgNotify"
									label="Notify Party(通知人)"
									:rows="4"
									maxlength="1024"
									heightVal="90px"
									:value.sync="item.bkgNotify"
								></TextAreaItem>
								<!-- <el-input type="textarea" v-model="item.bkgNotify" size="mini" placeholder="请输入" :disabled="!item.isEdit || item.lockBkgNotify === 'Y'" :rows="4" maxlength="1024"></el-input> -->
							</el-col>
							<el-col :span="4">
								<div class="label">
									品名
									<el-button type="text" class="lock" @click="handleChangeLock(index, item, 'lockBkgCargoName')" :disabled="!item.isEdit">
										{{item.lockBkgCargoName === 'Y' ? '解锁' : '锁定'}}
									</el-button>
								</div>
								<el-input type="textarea" v-model="item.bkgCargoName" size="mini" placeholder="请输入" :disabled="!item.isEdit || item.lockBkgCargoName === 'Y'" :rows="4" maxlength="256"></el-input>
							</el-col>
							<el-col :span="4">
								<div class="label">
									限重
									<el-button type="text" class="lock" @click="handleChangeLock(index, item, 'lockBkgCargoWeight')" :disabled="!item.isEdit">
										{{item.lockBkgCargoWeight === 'Y' ? '解锁' : '锁定'}}
									</el-button>
								</div>
								<el-input type="textarea" v-model="item.bkgCargoWeight" size="mini" placeholder="请输入" @blur="validateWeight('bkgCargoWeight', item)" :disabled="!item.isEdit || item.lockBkgCargoWeight === 'Y'" :rows="4" ></el-input>
							</el-col>
							<el-col :span="4">
								<div class="label">
									订舱要求
									<el-button type="text" class="lock" @click="handleChangeLock(index, item, 'lockBkgRemark')" :disabled="!item.isEdit">
										{{item.lockBkgRemark === 'Y' ? '解锁' : '锁定'}}
									</el-button>
								</div>
								<el-input type="textarea" v-model="item.bkgRemark" size="mini" placeholder="请输入" :disabled="!item.isEdit || item.lockBkgRemark === 'Y'" :rows="4" maxlength="512"></el-input>
							</el-col>
						</el-row>
					</div>
					</div>
					<div class="temp-list-row">
						<div class="item w80">单证</div>
						<div class="item content">
							<el-row>
								<el-col :span="4">
									<div class="label">
										Shipper(发货人)
										<el-button type="text" class="lock" @click="handleChangeLock(index, item, 'lockBlShipper')" :disabled="!item.isEdit">
											{{item.lockBlShipper === 'Y' ? '解锁' : '锁定'}}
										</el-button>
									</div>
									<TextAreaItem
										@dblclick.native="editDetail('blShipper', item, !item.isEdit || item.lockBlShipper === 'Y')"
										:disabled="!item.isEdit || item.lockBlShipper === 'Y'"
										keys="blShipper"
										label="Shipper(发货人)"
										:rows="4"
										maxlength="1024"
										heightVal="90px"
										:value.sync="item.blShipper"
									></TextAreaItem>
									<!-- <el-input type="textarea" v-model="item.blShipper" size="mini" placeholder="请输入" :disabled="!item.isEdit || item.lockBlShipper === 'Y'" :rows="4" maxlength="1024"></el-input> -->
								</el-col>
								<el-col :span="4">
									<div class="label">
										Consignee(收货人)
										<el-button type="text" class="lock" @click="handleChangeLock(index, item, 'lockBlConsignee')" :disabled="!item.isEdit">
											{{item.lockBlConsignee === 'Y' ? '解锁' : '锁定'}}
										</el-button>
									</div>
									<TextAreaItem
										@dblclick.native="editDetail('blConsignee', item, !item.isEdit || item.lockBlConsignee === 'Y')"
										:disabled="!item.isEdit || item.lockBlConsignee === 'Y'"
										keys="blConsignee"
										label="Consignee(收货人)"
										:rows="4"
										maxlength="1024"
										heightVal="90px"
										:value.sync="item.blConsignee"
									></TextAreaItem>
									<!-- <el-input type="textarea" v-model="item.blConsignee" size="mini" placeholder="请输入" :disabled="!item.isEdit || item.lockBlConsignee === 'Y'" :rows="4" maxlength="1024"></el-input> -->
								</el-col>
								<el-col :span="4">
									<div class="label">
										Notify Party(通知人)
										<el-button type="text" class="lock" @click="handleChangeLock(index, item, 'lockBlNotify')" :disabled="!item.isEdit">
											{{item.lockBlNotify === 'Y' ? '解锁' : '锁定'}}
										</el-button>
									</div>
									<TextAreaItem
										@dblclick.native="editDetail('blNotify', item, !item.isEdit || item.lockBlNotify === 'Y')"
										:disabled="!item.isEdit || item.lockBlNotify === 'Y'"
										keys="blNotify"
										label="Notify Party(通知人)"
										:rows="4"
										maxlength="1024"
										heightVal="90px"
										:value.sync="item.blNotify"
									></TextAreaItem>
									<!-- <el-input type="textarea" v-model="item.blNotify" size="mini" placeholder="请输入" :disabled="!item.isEdit || item.lockBlNotify === 'Y'" :rows="4" maxlength="1024"></el-input> -->
								</el-col>
								<el-col :span="4">
									<div class="label">
										品名
										<el-button type="text" class="lock" @click="handleChangeLock(index, item, 'lockBlCargoName')" :disabled="!item.isEdit">
											{{item.lockBlCargoName === 'Y' ? '解锁' : '锁定'}}
										</el-button>
									</div>
									<el-input type="textarea" v-model="item.blCargoName" size="mini" placeholder="请输入" :disabled="!item.isEdit || item.lockBlCargoName === 'Y'" :rows="4" maxlength="256"></el-input>
								</el-col>
								<el-col :span="4">
									<div class="label">
										限重
										<el-button type="text" class="lock" @click="handleChangeLock(index, item, 'lockBlCargoWeight')" :disabled="!item.isEdit">
											{{item.lockBlCargoWeight === 'Y' ? '解锁' : '锁定'}}
										</el-button>
									</div>
									<el-input type="textarea" v-model="item.blCargoWeight" size="mini" placeholder="请输入" @blur="validateWeight('blCargoWeight', item)" :disabled="!item.isEdit || item.lockBlCargoWeight === 'Y'" :rows="4" ></el-input>
								</el-col>
								<el-col :span="4">
									<div class="label">
										补料要求
										<el-button type="text" class="lock" @click="handleChangeLock(index, item, 'lockBlSiRemark')" :disabled="!item.isEdit">
											{{item.lockBlSiRemark === 'Y' ? '解锁' : '锁定'}}
										</el-button>
									</div>
									<el-input type="textarea" v-model="item.blSiRemark" size="mini" placeholder="请输入" :disabled="!item.isEdit || item.lockBlSiRemark === 'Y'" :rows="4" maxlength="512"></el-input>
								</el-col>
							</el-row>
						</div>
					</div>
					<div class="temp-list-row">
						<div class="item w80">财务</div>
						<div class="item content">
							<el-row>
								<el-col :span="24">
									<div class="label">
										付款要求
										<el-button type="text" class="lock" @click="handleChangeLock(index, item, 'lockPayRemark')" :disabled="!item.isEdit">
											{{item.lockPayRemark === 'Y' ? '解锁' : '锁定'}}
										</el-button>
									</div>
									<el-input type="textarea" v-model="item.payRemark" size="mini" placeholder="请输入" :disabled="!item.isEdit || item.lockPayRemark === 'Y'" :rows="4" maxlength="512"></el-input>
								</el-col>
							</el-row>
						</div>
					</div>
					<div class="temp-list-row">
						<div class="item w80">其他</div>
						<div class="item content">
							<el-row>
								<el-col :span="24">
									<div class="label">
										其他要求
										<el-button type="text" class="lock" @click="handleChangeLock(index, item, 'lockOtherRemark')" :disabled="!item.isEdit">
											{{item.lockOtherRemark === 'Y' ? '解锁' : '锁定'}}
										</el-button>
									</div>
									<el-input type="textarea" v-model="item.otherRemark" size="mini" placeholder="请输入" :disabled="!item.isEdit || item.lockOtherRemark === 'Y'" :rows="4" maxlength="512"></el-input>
								</el-col>
							</el-row>
						</div>
					</div>
					<el-dialog class="edit-detail-dlg" :title="editTitle" :visible.sync="editVisible" width="50%">
						<TextAreaItem :regExp="editReg" keys="editForm" :maxlength="editInputMaxLength.toString()" :rows="20" :show-word-limit="false" :value.sync="editData"></TextAreaItem>
						<span slot="footer" class="dialog-footer">
							<el-button size="mini" type="primary" @click="editConfirm(item)">确 定</el-button>
						</span>
					</el-dialog>
				</div>
				<div class="item ope" style="display: table-cell">
					<div class="operate-btns">
						<template v-if="isMain || isAudit">
							<el-button type="text" size="mini" v-if="!item.isEdit" @click="handleEdit(item)">编辑</el-button>
							<el-button type="text" size="mini" v-if="item.isEdit" @click="handleSave(item)">保存</el-button>
							<el-button type="text" size="mini" v-if="item.isEdit" @click="handleCancel(item)">取消</el-button>
						</template>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import TextAreaItem from '@/components/Form/textAreaItem'
import { contractTempSave } from '@/api/order/contract'

export default {
	data() {
		return {
			tableData: [],
			curProp: '',
			editTitle: '',
			editTitleObj: {
				bkgConsignee: '订舱收货人',
				bkgShipper: '订舱发货人',
				bkgNotify: '订舱通知人',
				blConsignee: '单证收货人',
				blShipper: '单证发货人',
				blNotify: '单证通知人',
			},
			editInputMaxLength: 1024,
			editData: '',
			editProp: '',
			editVisible: false,
		}
	},
	props: {
		isMain: {
			type: Boolean,
			default: false
		},
		isAudit: {
			type: Boolean,
			default: false
		},
		tempListQuery: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
	},
	mounted() {},
	activated() {},
	computed: {
		...mapState('user',['userId', 'name', 'compCode', 'compName']),
		...mapState({
			dictMap: state => state.dict.dictMap,
			speciesStrArr: state => state.order.speciesStrArr
		}),
		editReg() {
			if (this.curProp === 'remarkPrint' || this.curProp === 'remark' || ((this.curProp === 'cargoMark' || this.curProp === 'cargoDesc') && this.createItem.orderInfo.podPortName === 'TAICHUNG,TAIWAN')) {
				return /$a/g // 不匹配任何内容
			} else {
				return /[^\x00-\x7F]+/g
			}
		},
	},
	components: {
		TextAreaItem
	},
	watch: {
		tempListQuery: {
			handler(newVal) {
				this.initData(newVal)
			},
			deep: true,
			immediate: true
		}
	},
	methods: {
		initData(values) {
			// this.tableData = [{smContractNumber: '11', bkgShipper: '11', blShipper: '11', payRemark: '22', isEdit: false}]
			this.tableData = values.list.map(item => {
				return {...item, isEdit: false}
			})
		},
		//存在可编辑的row，提示先保存
		isEditRow() {
			let result = true
			if (this.tableData.find(item => item.isEdit)) {
				result = false
				this.$message.error('请保存套约备注模板')
			}
			return result
		},
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
		// 锁定，解锁
		handleChangeLock(index, item, prop) {
			// if (item['org_'+prop === 'Y']) return
			let value = item[prop] !== 'Y' ? 'Y' : 'N'
			this.$set(this.tableData[index], prop, value)
			console.log('prop', prop, value);
		},
		handleEdit(item) {
			if (!this.isEditRow()) return
			item.isEdit =  true
		},
		checkSpeciesStrMethod(item) {
			let check = true
			if(!item) return check
			let reg = /[^\x00-\x7F]+/g
			let result = item.match(reg)
			if(result && result.length) {
				if(result.every(o => this.speciesStrArr.includes(o))) {
					check = true
				} else {
					check = false
				}
			} else {
				check = true
			}
			return check
		},
		handleSave(item) {
			//有中文 不能保存
			let noCnArr = [
				item.bkgShipper,
				item.bkgConsignee,
				item.bkgNotify,
				item.blShipper,
				item.blConsignee,
				item.blNotify,
			]
			if (noCnArr.some(ele => !this.checkSpeciesStrMethod(ele))) return this.$message.warning('发货人,收货人,通知人中不能包含中文字符及特殊字符!')
			let data = {...item}
			contractTempSave(data).then(res => {
				this.$message.success('保存成功')
				this.$emit('getInfo', true)
			})
		},
		handleCancel(item) {
			item.isEdit = false
		},
		//关闭编辑框
		editConfirm(item) {
			let val = this.curProp
			// if (val === 'shipper' || val === 'consignee' || val === 'notify1' || val === 'notify2') {
			// 	this.createItem.blContact[val] = this.editData
			// }
			if (val === 'bkgShipper' || val === 'bkgConsignee' || val === 'bkgNotify' || val === 'blNotify' || val === 'blShipper' || val === 'blConsignee') {
				item[val] = this.editData
			}
			this.editVisible = false
		},
		//打开编辑框
		editDetail(val, item, disabledState) {
			if (disabledState) return
			this.editTitle = this.editTitleObj[val]
			this.curProp = val
			if (val === 'bkgShipper' || val === 'bkgConsignee' || val === 'bkgNotify' || val === 'blNotify' || val === 'blShipper' || val === 'blConsignee') {
				this.editData = item[val]
			}
			this.editVisible = true
		},
	}
}
</script>
<style lang="scss" scoped>
.temp-list-cont{
	font-size: 12px;
	.operate-btns{
		/deep/ .el-button--mini{
			padding: 0;
		}
	}
	/deep/ .el-table td{
		border-right: 1px solid #dfe6ec !important;
	}
	.row-cell{
		overflow: hidden;
		.row-item{
			border-bottom: 1px solid #dfe6ec;
			height: 120px;
			text-align: left;
			&.lh120 {
				line-height: 120px;
			}
			.item{
				display: inline-block;
				width: 16.66%;
				padding-right: 10px;
				.label{
					line-height: 20px;
				}
			}
		}
	}
	.temp-list-tit{
		background: #f8f9fd;
		height: 30px;
		line-height: 30px;
		border: 1px solid #e9e9e9;
		border-left: 0;
		display: flex;
		.item{
			// padding-left: 10px;
			text-align: center;
			border-left: 1px solid #e9e9e9;
			&.content{
				flex: 1;
				border-left: 1px solid #e9e9e9;
			}
		}
	}
	.temp-list-empty{
		border: 1px solid #e9e9e9;
		border-top: 0;
		padding: 10px;
		text-align: center;
		line-height: 20px;
		color: #999;
	}
	.temp-list-table{
		width: 100%;
		display: table;
		overflow: hidden;
		.item{
			display: table-cell;
			text-align: center;
			&.no{
				width: 110px;
				border-left: 1px solid #e9e9e9;
				border-bottom: 1px solid #e9e9e9;
				vertical-align: middle;
				padding: 0 5px;
    		box-sizing: border-box;
				overflow: hidden;
				white-space: normal;
				word-break: break-all;
			}
			&.ope{
				width: 100px;
				border-right: 1px solid #e9e9e9;
				border-bottom: 1px solid #e9e9e9;
				vertical-align: middle;
			}
		}
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
				}
				&.w80{
					width: 80px;
					vertical-align: middle;
				}
				&.content{
					padding: 10px 0 10px 10px;
					border-left: 1px solid #e9e9e9;
					.label{
						text-align: left;
						/deep/ .el-button{
							padding: 2px 0;
							font-size: 12px;
						}
						.lock{
							cursor: pointer;
							float: right;
							// color: #1890ff;
							// font-style: normal;
						}
					}
					.el-col-4, .el-col-24{
						padding-right: 8px;
						text-align: left;
					}
				}
			}
		}
	}
	.w100{
		width: 100px;
	}
	.w80{
		width: 80px;
	}
	.w110{
		width: 110px;
	}
}

</style>
