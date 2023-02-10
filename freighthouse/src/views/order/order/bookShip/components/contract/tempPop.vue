<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<div class="table-com-layout" id="tempPop">
			<el-table fit border style="width: 100%" ref="checkPointTable" :data="tableData">
				<el-table-column prop="shipCarrierCode" label="船公司" align="center" width="120"></el-table-column>
				<el-table-column label="合约号" align="center">
					<template slot-scope="scope">
						<div class="item-conno">
							<el-tooltip placement="top" v-for="item in scope.row.origin" :key="item.smContractId">
								<div slot="content">{{ item.smContractNo}}({{item.polPortCodeStr}})</div>
								<el-radio v-model="tempName" :label="item.smContractId" @change="(val) => handleChangeContract(val, item)">{{ item.smContractNo}}</el-radio>
							</el-tooltip>
						</div>
					</template>
				</el-table-column>
			</el-table>
			<div class="temp-row">
				<div class="label">选择其他非合约模板：</div>
				<div class="radio-group">
					<el-tooltip placement="top" v-for="(item, index) in bookTempList" :key="'tempName'+index">
						<div slot="content">{{ item.templateName}}</div>
						<el-radio v-model="tempName" :label="item.templateName" @change="(val) => handleChangeTemp(val, item)">{{ item.templateName }}</el-radio>	
					</el-tooltip>
				</div>
			</div>
		</div>
	</BaseDialog>
</template>
<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { contractUseList, bookTempList } from '@/api/order/contract'

export default {
	filters: {},
	data() {
		return {
			dialogConfig: {
				title: '选择套约备注模板',
				show: true,
				size: 'medium',
				width: '800px'
			},
			contractList: [],
			tableData: [],
			contractParam: {},
			bookTempList: [],	// 其他非合约模板
			tempName: ''	// radio默认选中
		}
	},
	props: {
		contractTempDetail: {
			type: Object,
			default: () => ({})
		},
		tempPortQuery: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		console.log('this.contractTempDetail', this.contractTempDetail);
		console.log('this.tempPortQuery', this.tempPortQuery);
		let {contractItemId, templateName} = this.contractTempDetail
		if (contractItemId) {
			this.tempName = contractItemId
			this.contractParam.smContractId = this.tempName
		} else {
			this.tempName = templateName || '空模板'
			this.contractParam.templateName = this.tempName
		}
		this.getContractList()
		this.getBookTempList()
	},
	mounted() {
	},
	computed: {},
	components: {
		BaseDialog
	},
	watch: {},
	methods: {
		handleChangeContract(val, item) {
			this.contractParam = item
			// this.contractParam.bigContractId = item.bigContractId
			// this.contractParam.smContractId = item.smContractId
			// this.contractParam.smContractNo = item.smContractNo
			// console.log('val', val, this.contractParam.smContractId);
		},
		handleChangeTemp(val, item) {
			// console.log('val', val, item);
			this.contractParam = item
		},
		// 获取其他非合约模板数据(商务保存的模板)
		getBookTempList() {
			bookTempList().then(res => {
				this.bookTempList = res.data || []
				// radio默认设置的空模板数据
				// this.contractParam = res.data.find(item => item.templateName === '空模板') || {}
				console.log('this.contractParam', this.contractParam);
				
			})
		},
		// 获取所有可用合约号
		getContractList() {
			let data = {
				polPortCode: this.tempPortQuery.polPortCode,
				sysLineCode: this.tempPortQuery.sysLineCode
			}
      contractUseList(data).then(res => {
				let arr = res.data.filter(item => item.smContractNo)
				// 去重
				let result = []
				let obj = {}
				for (var i=0; i<arr.length; i++) {
					if (!obj[arr[i].smContractId]) {
						result.push(arr[i])
						obj[arr[i].smContractId] = true
					}
				}
				this.contractList = result
				// table合并船公司,合约号数据
				let shipCarrArr = []
				let tableData = []
				for (var i=0; i<result.length; i++) {
					if (!shipCarrArr.includes(result[i].shipCarrierCode)) {
						tableData.push({
							shipCarrierCode: result[i].shipCarrierCode, 
							origin: [result[i]]
						})
						shipCarrArr.push(result[i].shipCarrierCode)
					} else {
						for (var j=0; j<tableData.length; j++) {
							if (tableData[j].shipCarrierCode === result[i].shipCarrierCode) {
								tableData[j].origin.push(result[i])
								break
							}
						}
					}
				}
				console.log('tableData', tableData);
				this.tableData = tableData
      })
		},
		close(action, value) {
			this.$emit('close', action, value)
		},
		getContractParam() {
			let result = {}
			let {smContractId, templateName} = this.contractParam
			if (smContractId) {
				result = this.contractList.find(item => item.smContractId === smContractId) || {}
			} else {
				result = this.bookTempList.find(item => item.templateName === templateName) || {}
			}
			return result || {}
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				let data = this.getContractParam()
				this.close('Confirm', data)
			} else {
				this.close('Cancel')
			}
		}
	}
}
</script>
<style lang="scss" scoped>
#tempPop{
	/deep/ .el-table td{
		border-right: 1px solid #e9e9e9 !important;
	}
	.item-conno{
		text-align: left;
		/deep/ .el-radio{
			width: 150px;
			line-height: 24px;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		/deep/ .el-radio__label{
			font-size: 12px;
		}
	}
	.temp-row{
		margin-top: 10px;
		.label{
			float: left;
			display: inline-block;
			width: 120px;
			line-height: 24px;
		}
		.radio-group{
			float: left;
			display: inline-block;
			width: 630px;
			text-align: left;
			/deep/ .el-radio{
				width: 120px;
				line-height: 24px;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			/deep/ .el-radio__label{
				font-size: 12px;
			}
		}
	}
}

</style>
