<template>
	<el-dialog :title="title" :visible.sync="dialogVisible.show" :lock-scroll="true" width="1100px" @close="dialogClose" class="cosco-add">
		<el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":" :inline="true" label-width="110px">
			<div class="title">基本信息</div>
			<el-form-item label="任务类型" prop="taskType">
				<!-- :disabled="createItem.deptId!==''" -->
				<el-select style="width: 100%" size="mini" v-model="createItem.taskType">
					<el-option v-for="(o, key) in dictMap['bkgTaskName']" :key="key" :label="$t(`dict.bkgTaskName.${o.value}`)" :value="o.value"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="订舱方式" prop="taskMode">
				<el-select style="width: 100%" size="mini" v-model="createItem.taskMode">
					<el-option v-for="(o, key) in dictMap['coscoTaskMode']" :key="key" :label="o.label" :value="o.value"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="分公司" prop="companyCode">
				<el-select style="width: 100%" default-first-option clearable filterable size="mini" v-model="createItem.companyCode" placeholder="请选择分公司账号">
					<el-option v-for="item in branchCompanyOptions" :key="item.companyCode" :label="item.companyCname" :value="item.companyCode"> </el-option>
				</el-select>
			</el-form-item>

			<el-form-item label="起始地" prop="porCityName">
				<!-- <el-select
          size="mini"
          filterable
          v-model="createItem.porCityName"
          style="width: 100%"
          clearable
          placeholder="支持港口/内陆城市"
          :filter-method="val => cityQuery(val,'por')"
          @change="val => citySelect(val, 'por')"
        >
          <el-option v-for="(item, index) in cityListArr" :key="index" :label="`${item.cityFullNameCn} - ${item.cityFullNameEn}`" :value="item.id"> </el-option>
        </el-select> -->

				<el-autocomplete
					size="mini"
					style="width: 100%"
					placeholder="支持港口/内陆城市"
					v-model="createItem.porCityName"
					:fetch-suggestions="
						(queryString, cb) => {
							cityQuery(queryString, cb)
						}
					"
					@change="
						value => {
							citySelect(value, 'por')
						}
					"
					@select="
						value => {
							citySelect(value, 'por')
						}
					"
					highlight-first-item
				>
					<template slot-scope="{ item }">
						<div class="name">
							{{ item.cityFullNameCn + '-' + item.cityFullNameEn }}
						</div>
					</template>
				</el-autocomplete>
			</el-form-item>
			<el-form-item label="目的地" prop="fndCityName">
				<!-- <el-select
          size="mini"
          filterable
          v-model="createItem.fndCityName"
          style="width: 100%"
          clearable
          placeholder="支持港口/内陆城市"
          :filter-method="val => cityQuery(val, 'pod')"
          @change="val => citySelect(val, 'pod')"
        >
          <el-option v-for="(item, index) in cityListArr2" :key="index" :label="`${item.cityFullNameCn} - ${item.cityFullNameEn}`" :value="item.id"> </el-option>
        </el-select> -->
				<el-autocomplete
					size="mini"
					style="width: 100%"
					placeholder="支持港口/内陆城市"
					v-model="createItem.fndCityName"
					:fetch-suggestions="
						(queryString, cb) => {
							cityQuery(queryString, cb)
						}
					"
					@change="
						value => {
							citySelect(value, 'pod')
						}
					"
					@select="
						value => {
							citySelect(value, 'pod')
						}
					"
					highlight-first-item
				>
					<template slot-scope="{ item }">
						<div class="name">
							{{ item.cityFullNameCn + '-' + item.cityFullNameEn }}
						</div>
					</template>
				</el-autocomplete>
			</el-form-item>

			<el-form-item label="任务开始时间" prop="taskStartTime">
				<el-date-picker clearable style="width: 100%" size="mini" type="datetime" v-model="createItem.taskStartTime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" placeholder="任务开始日期"></el-date-picker>
			</el-form-item>

			<el-form-item label="任务结束时间" prop="taskEndTime">
				<el-date-picker clearable style="width: 100%" size="mini" v-model="createItem.taskEndTime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" placeholder="任务结束时间" type="datetime"></el-date-picker>
			</el-form-item>

			<el-form-item label="通知类型" prop="noticeType">
				<el-select style="width: 100%" size="mini" v-model="createItem.noticeType">
					<el-option v-for="(o, key) in dictMap['bkgNoticeType']" :key="key" :label="$t(`dict.bkgNoticeType.${o.value}`)" :value="o.value"></el-option>
				</el-select>
			</el-form-item>

			<el-form-item v-if="createItem.noticeType === 'email'" label="通知邮箱" prop="noticeEmail">
				<el-input style="width: 100%" size="mini" placeholder="请输入邮箱，多个用逗号隔开" v-model="createItem.noticeEmail"></el-input>
			</el-form-item>
			<el-form-item v-if="createItem.noticeType === 'ding'" label="通知钉钉" prop="noticeDingToken">
				<!-- <el-input style="width:100%" size="mini" placeholder="请输入钉钉通知Token" v-model="createItem.noticeDingToken"></el-input> -->
				<el-select style="width: 100%" size="mini" v-model="createItem.noticeDingToken">
					<el-option v-for="(o, key) in noticeDingData" :key="key" :label="o.groupName" :value="o.dingToken"></el-option>
				</el-select>
			</el-form-item>

			<el-form-item label="ETD开始时间" prop="startDate">
				<el-date-picker clearable style="width: 100%" size="mini" v-model="createItem.startDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="ETD开始时间"></el-date-picker>
			</el-form-item>

			<el-form-item label="ETD结束时间" prop="endDate">
				<el-date-picker clearable style="width: 100%" size="mini" v-model="createItem.endDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="ETD结束时间"></el-date-picker>
			</el-form-item>

			<template v-if="createItem.taskType == 'book'">
				<el-form-item label="箱型" prop="containerType">
					<el-select style="width: 100%" size="mini" v-model="createItem.containerType">
						<el-option v-for="(o, key) in containerTypeOptions" :key="key" :label="o.label" :value="o.value"></el-option>
					</el-select>
				</el-form-item>
			</template>
			<el-form-item label="箱量" prop="quantity">
				<el-input style="width: 100%" type="number" size="mini" placeholder="请输入箱量" v-model="createItem.quantity"></el-input>
			</el-form-item>

			<template v-if="createItem.taskType == 'book'">
				<el-form-item label="最大可定价" prop="maxPrice">
					<el-input style="width: 100%" type="number" size="mini" placeholder="请输入最大可定价" v-model="createItem.maxPrice"></el-input>
				</el-form-item>
			</template>
			<el-form-item label="紧急联系人邮箱" prop="emergencyEmail">
				<el-input style="width: 100%" size="mini" placeholder="请输入紧急联系人" v-model="createItem.emergencyEmail"></el-input>
			</el-form-item>
			<el-form-item label="保价服务" prop="includeInsurance">
				<el-select style="width: 100%" size="mini" v-model="createItem.includeInsurance">
					<el-option label="是" value="yes"></el-option>
					<el-option label="否" value="no"></el-option>
				</el-select>
			</el-form-item>
			<div class="cargoInfo-box">
				<div class="title">货物信息</div>
				<el-form-item label="货物描述" prop="cargoInfo.desc">
					<el-input size="mini" v-model="createItem.cargoInfo.desc"></el-input>
				</el-form-item>
				<el-form-item label="包装类型" prop="cargoInfo.packageType">
					<el-input size="mini" v-model="createItem.cargoInfo.packageType"></el-input>
				</el-form-item>
				<el-form-item label="货物数量" prop="cargoInfo.quantity">
					<el-input size="mini" min="1" v-model="createItem.cargoInfo.quantity" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"></el-input>
				</el-form-item>
				<el-form-item label="重量" prop="cargoInfo.weight">
					<el-input size="mini" v-model="createItem.cargoInfo.weight" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}">
						<i slot="suffix" style="font-style: normal; margin-right: 10px">KG</i>
					</el-input>
				</el-form-item>
				<el-form-item label="体积" prop="cargoInfo.volume">
					<el-input size="mini" v-model="createItem.cargoInfo.volume" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}">
						<i slot="suffix" style="font-style: normal; margin-right: 10px">M³</i>
					</el-input>
				</el-form-item>
				<el-form-item label="备注" prop="cargoInfo.remarks">
					<el-input size="mini" v-model="createItem.cargoInfo.remarks"></el-input>
				</el-form-item>
				<div class="title">优先级信息</div>
				<el-form-item label="是否优先级" prop="isHp">
					<el-select style="width: 100%" size="mini" v-model="createItem.isHp">
						<el-option v-for="(o, key) in isHpOption" :key="key" :label="o.label" :value="o.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="优先级开始时间" prop="hpBeginTime">
					<el-date-picker clearable v-model="createItem.hpBeginTime" type="datetime" size="mini" placeholder="选择日期时间" value-format="yyyy-MM-dd HH:mm:ss"> </el-date-picker>
				</el-form-item>
				<el-form-item label="优先级结束时间" prop="hpEndTime">
					<el-date-picker clearable v-model="createItem.hpEndTime" size="mini" type="datetime" placeholder="选择日期时间" value-format="yyyy-MM-dd HH:mm:ss"> </el-date-picker>
				</el-form-item>
			</div>
		</el-form>
		<div slot="footer" class="dialog-footer">
			<el-button size="mini" type="primary" @click="submitForm('createItemForm')"> <i class="el-icon-copy-document"></i> 保存 </el-button>
			<el-button size="mini" @click="cancel">取 消</el-button>
		</div>
	</el-dialog>
</template>
<script>
import { mapGetters } from 'vuex'
import { coscoTaskSave } from '@/api/exec/autobook'
import { cityList, dingList, sapidList } from '@/api/exec/cosco'

export default {
	name: 'configDialog',
	props: {
		dialogVisible: {
			type: Object,
			default: () => ({})
		}
	},
	data() {
		return {
			branchCompanyOptions: [],
			noticeDingData: [],
			title: '',
			createItem: {
				companyCode: '',
				taskMode: '',
				taskId: '',
				taskType: '',
				taskStartTime: '',
				taskEndTime: '',
				noticeType: 'ding', //默认邮箱通知
				noticeEmail: '',
				noticeDingToken: '',
				porCityId: '',
				porCityName: '',
				fndCityId: '',
				fndCityName: '',
				startDate: '',
				endDate: '',
				containerType: '',
				quantity: '',
				maxPrice: '',
				emergencyEmail: '',
				cargoInfo: { desc: 'FURNITURE',
					packageType: 'IV',
					quantity: 1000,
					weight: 15000,
					volume: 1000.5,
					remarks: '94011000' },
				isHp: '',
				hpBeginTime: '',
				hpEndTime: '',
				includeInsurance: 'no'
			},
			isHpOption: [
				{
					label: '是',
					value: 'yes'
				},
				{
					label: '否',
					value: 'no'
				}
			],
			taskBookDto: {
				sapid:'',
				companyCode: '',
				porCityId: '',
				porCityName: '',
				fndCityId: '',
				fndCityName: '',
				startDate: '',
				endDate: '',
				containerType: '',
				quantity: '',
				maxPrice: '',
				emergencyEmail: '',
				includeInsurance: ''
			},
			containerTypeOptions: [
				{
					label: '20GP',
					value: '20GP'
				},
				{
					label: '40GP',
					value: '40GP'
				},
				{
					label: '40HQ',
					value: '40HQ'
				}
			],
			rules: {
				taskType: [{ required: true, message: '任务类型不能为空', trigger: 'change' }],
				taskMode: [{ required: true, message: '订舱方式不能为空', trigger: 'change' }],
				porCityName: [{ required: true, message: '起始地不能为空', trigger: 'change' }],
				fndCityName: [{ required: true, message: '目的地不能为空', trigger: 'change' }],
				taskStartTime: [{ required: true, message: '任务开始时间不能为空', trigger: 'change' }],
				taskEndTime: [{ required: true, message: '任务结束时间不能为空', trigger: 'change' }],
				noticeType: [{ required: true, message: '任务通知类型不能为空', trigger: 'change' }],
				noticeEmail: [{ required: true, message: '通知邮箱不能为空', trigger: 'change' }],
				noticeDingToken: [{ required: true, message: '通知钉钉token不能为空', trigger: 'change' }],
				startDate: [{ required: true, message: '订舱开始时间不能为空', trigger: 'change' }],
				endDate: [{ required: true, message: '订舱结束时间不能为空', trigger: 'change' }],
				containerType: [{ required: true, message: '箱型不能为空', trigger: 'change' }],
				quantity: [{ required: true, message: '箱量不能为空', trigger: 'change' }],
				maxPrice: [{ required: true, message: '最大可定价不能为空', trigger: 'change' }],
				emergencyEmail: [{ required: true, message: '紧急联系人邮箱不能为空', trigger: 'change' }],
        companyCode: [{ required: true, message: '分公司不能为空', trigger: 'change'}]
			},
			cityListArr: [],
			cityListArr2: []
		}
	},
	created() {
		this.getDingList()
		sapidList({}).then(res => {
			this.branchCompanyOptions = res.data
		})
	},

	methods: {
		getDingList() {
			dingList({
				currPage: 1,
				pageSize: 100,
				keywords: ''
			}).then(res => {
				console.log('🚀 ~ res', res)
				this.noticeDingData = res.data.list
			})
		},
		init(rowData) {
			if (rowData) {
				console.log('🚀 ~ rowData', rowData)
				this.title = '编辑COSCO任务'
				for (var p in this.createItem) {
					this.createItem[p] = rowData[p]
				}
				// this.cityQuery(this.createItem.porCityName.split('-')[1], 'por')
				// this.cityQuery(this.createItem.fndCityName.split('-')[1], 'pod')
			} else {
				this.title = '新增COSCO任务'
			}
		},
		//清空数据
		dialogClose() {
			Object.assign(this.createItem, {
				taskMode: '',
				companyCode: '',
				taskId: '',
				taskType: '',
				taskStartTime: '',
				taskEndTime: '',
				noticeType: 'ding', //默认邮箱通知
				noticeEmail: '',
				noticeDingToken: '',
				porCityId: '',
				porCityName: '',
				fndCityId: '',
				fndCityName: '',
				startDate: '',
				endDate: '',
				containerType: '',
				quantity: '',
				maxPrice: '',
				emergencyEmail: '',
				includeInsurance: 'no'
			})
			this.$refs['createItemForm'].resetFields()
		},
		// 取消按钮
		cancel() {
			this.dialogVisible.show = false
		},
		//保存按钮操作
		submitForm(formName) {
			this.$refs[formName].validate(valid => {
				if (valid) {
					//提交代码封装表单属性
					for (var p in this.taskBookDto) {
						this.taskBookDto[p] = this.createItem[p]
					}
					Object.assign(this.createItem, {
						taskBookDto: this.taskBookDto
					})
					//添加分公司 code 和 name

					this.createItem.companyName = ''
					let companyObj = this.branchCompanyOptions.find(item => item.companyCode === this.createItem.companyCode)
					if (companyObj) {
						this.createItem.companyName = companyObj.companyCname
						this.createItem.taskBookDto.sapid=companyObj.sapid
					}
					coscoTaskSave(this.createItem).then(res => {
						this.$message({ message: '恭喜你，保存成功', type: 'success' })
						this.dialogVisible.show = false
						this.$emit('relateSuc')
					})
				} else {
					return false
				}
			})
		},
		// cityQuery(queryString, type){
		//   if (!queryString) {
		//     return
		//   }
		//   let data = {
		//     keywords: queryString,
		//     pageSize: 100
		//   }
		//   cityList(data).then(res => {
		//     if (type === 'por') {
		//       this.cityListArr = res.data.list
		//     } else {
		//       this.cityListArr2 = res.data.list
		//     }
		//   })
		// },
		cityQuery(queryString, cb) {
			//只有有关键字的时候才调用查询接口
			if (!queryString) {
				return cb(this.historyList)
			}
			let params = {}
			Object.assign(params, {
				keywords: queryString
			})
			cityList(params).then(response => {
				this.historyList = response.data.list
				cb(response.data.list)
			})
		},
		citySelect(val, type) {
			if (typeof val === 'object') {
				if (type === 'por') {
					this.createItem.porCityId = val.id
					this.createItem.porCityName = `${val.cityFullNameCn} - ${val.cityFullNameEn}`
				} else {
					this.createItem.fndCityId = val.id
					this.createItem.fndCityName = `${val.cityFullNameCn} - ${val.cityFullNameEn}`
				}
			} else {
				if (!val.includes('-') || !this.historyList.length) {
					if (type === 'por') {
						this.createItem.porCityId = ''
						this.createItem.porCityName = ''
					} else {
						this.createItem.fndCityId = ''
						this.createItem.fndCityName = ''
					}
				}
			}
			// if (type === 'por') {
			//   let item = this.cityListArr.filter(el => el.id === val)[0]
			//   this.createItem.porCityId = item.id
			//   this.createItem.porCityName = `${item.cityFullNameCn} - ${item.cityFullNameEn}`
			// } else {
			//   let item = this.cityListArr2.filter(el => el.id === val)[0]
			//   this.createItem.fndCityId = item.id
			//   this.createItem.fndCityName = `${item.cityFullNameCn} - ${item.cityFullNameEn}`
			// }
		}
	},

	computed: {
		...mapGetters(['userId', 'dictMap'])
	},
	watch: {}
}
</script>
<style lang="scss">
.modifyfee-detail-info {
	margin-top: 10px;
}
.modifyfee-detail-info .el-form-item__label,
.modifyfee-detail-info .el-form-item__content {
	line-height: 28px !important;
}

.modifyfee-detail-info .el-form-item {
	margin-right: 34px;
}
.modifyfee-detail-info .el-date-editor.el-input {
	width: 162px;
}
.modifyfee-detail-info .el-select {
	width: 162px;
}
.modifyfee-detail-info .el-date-editor--daterange.el-input__inner {
	width: 220px;
}

.relate-payinfo-dialog .el-dialog__body {
	height: 500px;
	padding-bottom: 0px;
	overflow: auto;
}
.relate-payinfo-dialog .finance-el-table {
	padding: 14px 0 !important;
}

.relate-payinfo-dialog .tips-abs {
	top: -30px;
}

.cosco-add {
	.el-form-item {
		margin-bottom: 20px;
	}
	.el-input,
	.el-input--mini,
	.el-input--suffix,
	.el-input__inner {
		width: 200px;
	}
	.title {
		background-color: #efefef;
		padding: 5px;
		font-size: 12px;
		margin-bottom: 10px;
	}
}
</style>
