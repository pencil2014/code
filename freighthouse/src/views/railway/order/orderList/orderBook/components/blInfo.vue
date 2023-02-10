<template>
	<div class="row-flex ml10" id="railwayBlInfo">
		<el-form-item required label="提单类型" prop="blType" :show-message="false" class="flex-item">
			<el-select :disabled="createItem.isDraftConfirm === 'y'" v-model="createItem.blType" size="mini" clearable placeholder="请选择" style="width: 100%" @change="handleChangeBlType">
				<el-option v-for="(item, index) in blTypeOptions" :label="item.label" :value="item.value" :key="index"> </el-option>
			</el-select>
		</el-form-item>
		<el-form-item required label="提单号" prop="blNo" :show-message="false" class="flex-item">
			<el-input :disabled="createItem.isDraftConfirm === 'y'" size="mini" maxlength="60" clearable placeholder="请输入" v-model="createItem.blNo"></el-input>
		</el-form-item>
		<el-form-item required prop="transportTerm" label="运输条款" :show-message="false" class="flex-item">
			<el-select disabled v-model="createItem.transportTerm" size="mini" clearable placeholder="请选择" style="width: 100%">
				<el-option v-for="(item, index) in dictMap.transportTerm" :label="item.label" :value="item.value" :key="index"> </el-option>
			</el-select>
		</el-form-item>
		<el-form-item label="出单方式" class="flex-item">
			<el-select @change="handleChangeBlMode" :disabled="createItem.isDraftConfirm === 'y'" v-model="createItem.blMode" size="mini" clearable placeholder="请选择" style="width: 100%">
				<el-option v-for="(item, index) in blModeList" :label="item.label" :value="item.value" :key="index"> </el-option>
			</el-select>
		</el-form-item>

		<div class="flex-item">
			<div class="item-label"><span class="lab">正/副本</span></div>
			<el-input :disabled="createItem.isDraftConfirm === 'y'" size="mini" clearable placeholder="请填写正本数量" v-model.number="createItem.numOriginal" style="width: 45%" @input="numberInputCheck($event, 'numOriginal', '正本数量')"></el-input>
			<span class="seprate-line">/</span>
			<el-input :disabled="createItem.isDraftConfirm === 'y'" size="mini" clearable placeholder="请填写副本数量" v-model.number="createItem.numCopy" style="width: 45%" @input="numberInputCheck($event, 'numCopy', '副本数量')"></el-input>
		</div>
		<el-form-item label="签单人" class="flex-item">
			<el-select
				:disabled="createItem.isDraftConfirm === 'y'"
				size="mini"
				v-model="createItem.signEmployeeId"
				filterable
				remote
				clearable
				style="width: 100%"
				placeholder="请输入"
				:remote-method="signerFilterMehod"
				@visible-change="signerVisibleChange"
				@change="handleChangeEmployeeId"
			>
				<el-option v-for="(item, index) in signEmployeeOptions" :label="item.label" :value="item.value" :key="index"></el-option>
			</el-select>
		</el-form-item>
		<el-form-item label="签单时间" class="flex-item">
			<elDatePickerLimit :disabled="createItem.isDraftConfirm === 'y'" size="mini" v-model="createItem.signTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
		</el-form-item>
		<el-form-item label="签单地点" class="flex-item">
			<el-input :disabled="createItem.isDraftConfirm === 'y'" size="mini" clearable placeholder="请输入" v-model="createItem.signAddress"></el-input>
		</el-form-item>
		<el-form-item required prop="payMode" label="付款方式" :show-message="false" class="flex-item">
			<el-select :disabled="createItem.isDraftConfirm === 'y'" v-model="createItem.payMode" size="mini" clearable placeholder="请选择" style="width: 100%">
				<el-option v-for="(item, index) in dictMap.payMode" :label="item.label" :value="item.value" :key="index"> </el-option>
			</el-select>
		</el-form-item>
		<el-form-item style="opacity:0;" label="付款方式" class="flex-item col-2"> <el-input size="mini"></el-input> </el-form-item>

		<el-form-item required prop="shipper" :show-message="false" class="flex-item col-3 shipper-rel">
			<span slot="label" style="position:relative;z-index:200">
				<span>Shipper(发货人)</span>
				<el-button :disabled="createItem.isDraftConfirm === 'y'" type="text" size="mini" @click="openContactPerson('发货人', '')">选择</el-button>
			</span>
			<TextAreaItem isNeedCheckRowLen @dblclick.native="editDetail('shipper')" :disabled="createItem.isDraftConfirm === 'y'" :required="true" keys="shipper" label="Shipper(发货人)" maxlength="512" :rows="6" show-word-limit :value.sync="createItem.shipper" :blType="createItem.blType" :switchInfoFlag="createItem.blId"></TextAreaItem>
		</el-form-item>
		<el-form-item required prop="consignee" label="Consignee(收货人)" :show-message="false" class="flex-item col-3 shipper-rel">
			<span slot="label" style="position:relative;z-index:200">
				<span>Consignee(收货人)</span>
				<el-button :disabled="createItem.isDraftConfirm === 'y'" type="text" size="mini" @click="openContactPerson('收货人', '')">选择</el-button>
			</span>
			<TextAreaItem isNeedCheckRowLen @dblclick.native="editDetail('consignee')" :disabled="createItem.isDraftConfirm === 'y'" :required="true" keys="consignee" label="Consignee(收货人)" maxlength="512" :rows="6" show-word-limit :value.sync="createItem.consignee" :blType="createItem.blType" :switchInfoFlag="createItem.blId"></TextAreaItem>
		</el-form-item>
		<div class="flex-item col-3">
			<div class="item-label notify">
				<div class="notify-flex-row">
					<span class="lab" :class="notify === '1' ? 'active' : ''" @click="handleNotifyClick('1')">Notify Party(通知人)</span>
					<span class="lab flex1" :class="notify === '2' ? 'active' : ''" @click="handleNotifyClick('2')">Also Notify Party</span>
					<el-button :disabled="createItem.isDraftConfirm === 'y'" type="text" size="mini" @click="openContactPerson('通知人', notify)">选择</el-button>
				</div>
				<el-button :disabled="createItem.isDraftConfirm === 'y'" size="mini" type="text" class="same" @click="handleClickNotify">SAME AS CONSIGNEE</el-button>
			</div>
			<el-form-item v-show="notify === '1'" class="shipper-rel notify-rel">
				<TextAreaItem isNeedCheckRowLen @dblclick.native="editDetail('notify1')" :disabled="createItem.isDraftConfirm === 'y'" keys="notify1" label="Notify Party(通知人)" maxlength="512" :rows="6" show-word-limit :value.sync="createItem.notify1" :blType="createItem.blType" :switchInfoFlag="createItem.blId"></TextAreaItem>
			</el-form-item>
			<el-form-item v-show="notify === '2'">
				<TextAreaItem isNeedCheckRowLen @dblclick.native="editDetail('notify2')" :disabled="createItem.isDraftConfirm === 'y'" keys="notify2" label="Also Notify Party" maxlength="512" :rows="6" show-word-limit :value.sync="createItem.notify2" :blType="createItem.blType" :switchInfoFlag="createItem.blId"></TextAreaItem>
			</el-form-item>
		</div>
		<el-form-item class="flex-item col-3 shipper-rel">
			<span slot="label" style="position:relative;z-index:200">
				<span>Forwarding Agent（运输代理人）</span>
			</span>
			<TextAreaItem @dblclick.native="editDetail('forwardAgent')" :disabled="createItem.isDraftConfirm === 'y'" keys="forwardAgent" label="Forwarding Agent（运输代理人）" maxlength="512" :rows="6" show-word-limit :value.sync="createItem.forwardAgent" :blType="createItem.blType" :switchInfoFlag="createItem.blId"></TextAreaItem>
		</el-form-item>
		<el-form-item required label="唛头" prop="cargoMark" :show-message="false" class="flex-item col-3 shipper-rel">
			<TextAreaItem
				@dblclick.native="editDetail('cargoMark')"
				:regExp="cargoReg"
				:disabled="createItem.isDraftConfirm === 'y'"
				:required="true"
				keys="cargoMark"
				label="唛头"
				maxlength="2048"
				:rows="6"
				show-word-limit
				:value.sync="createItem.cargoMark"
				 :blType="createItem.blType"
				:switchInfoFlag="createItem.blId"
			></TextAreaItem>
		</el-form-item>
		<el-form-item @dblclick.native="editDetail('cargoDesc')" required label="货物描述" prop="cargoDesc" :show-message="false" class="flex-item col-3 shipper-rel">
			<TextAreaItem
				@dblclick.native="editDetail('cargoDesc')"
				:regExp="cargoReg"
				:disabled="createItem.isDraftConfirm === 'y'"
				:required="true"
				keys="cargoDesc"
				label="货物描述"
				maxlength="2048"
				:rows="6"
				show-word-limit
				:value.sync="createItem.cargoDesc"
				 :blType="createItem.blType"
				:switchInfoFlag="createItem.blId"
			></TextAreaItem>
		</el-form-item>
		<div style="width:100%;" class="flex-item">
			<el-form-item label="收货站" :show-message="false" class="flex-item col-6">
				<el-input disabled size="mini" clearable placeholder="请输入" v-model="createItem.porPortName"></el-input>
			</el-form-item>
			<el-form-item label="起运站" :show-message="false" class="flex-item">
				<el-input disabled size="mini" clearable placeholder="请输入" v-model="createItem.polPortName"></el-input>
			</el-form-item>

			<el-form-item label="目的站" :show-message="false" class="flex-item">
				<el-input disabled size="mini" clearable placeholder="请输入" v-model="createItem.podPortName"></el-input>
			</el-form-item>
			<el-form-item label="最终目的地" :show-message="false" class="flex-item">
				<el-input disabled size="mini" clearable placeholder="请输入" v-model="createItem.finalPodPortName"></el-input>
			</el-form-item>

			<el-form-item label="实际发车时间" :show-message="false" class="flex-item">
				<elDatePickerLimit noCanFuture disabled size="mini" v-model="createItem.tdTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
			</el-form-item>

			<el-form-item label="班名/班次" class="flex-item train-number">
				<el-input disabled clearable size="mini" placeholder="请输入" v-model="createItem.vesselVoyage"></el-input>
			</el-form-item>
		</div>

		<div v-if="contactPersonShow">
			<ContactPerson :config="contactPersonConfig" @close="getContactPerson" />
		</div>
		<el-dialog class="err-detail-dlg" title="错误详情" :visible.sync="detailVisible" width="50%">
			<div v-for="(item, index) in errContent" v-html="item" :key="index"></div>
			<span slot="footer" class="dialog-footer">
				<el-button size="mini" type="primary" @click="detailVisible = false">关 闭</el-button>
			</span>
		</el-dialog>
		<el-dialog class="edit-detail-dlg" :title="editTitle" :visible.sync="editVisible" width="50%">
			<TextAreaItem :regExp="editReg" :disabled="createItem.isDraftConfirm === 'y'" keys="editForm" :maxlength="editInputMaxLength.toString()" :rows="20" show-word-limit :value.sync="editValue"  :blType="createItem.blType" :switchInfoFlag="createItem.blId"></TextAreaItem>

			<span slot="footer" class="dialog-footer">
				<el-button size="mini" type="primary" @click="editConfirm">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { portSystemLineInfo, baseSystemLineInfo, baseEmployeeListName } from '@/api/base'
import { blCreateSerialNo } from '@/api/railway/bl'
import { mainRouteFreeTime } from '@/api/charge'
import ContactPerson from '@/views/railway/order/orderList/components/contactPerson.vue'
import TextAreaItem from '@/components/Form/textAreaItem'

export default {
	data() {
		return {
			editInputMaxLength: 512,
			editTitle: '',
			editTitleObj: {
				consignee: '收货人',
				shipper: '发货人',
				notify1: 'Notify Party',
				notify2: 'Also Notify Party',
				forwardAgent: '运输代理人',
				cargoMark: '唛头',
				cargoDesc: '货物描述'
			},
			blModeList: [
				{ label: '正本', value: 'original', en: 'original' },
				{ label: '电放', value: 'telex_release', en: 'telex_release' }
			],
			editProp: '',
			editValue: '',
			editVisible: false,
			iconObj: {
				shipper: false,
				consignee: false,
				notify1: false,
				notify2: false,
				forwardAgent: false,
				cargoMark: false,
				cargoDesc: false
			},
			editContent: [],
			errContent: [],
			detailVisible: false,
			state: '',
			oQuery: this.$route.query,
			sysLineName: '',
			portList: [],

			signEmployeeOptions: [],
			notify: '1',
			contactPersonShow: false,
			contactPersonConfig: {
				type: '收货人', // 类型，收货人，发货人，通知人
				num: '' // 通知人1，2，3
			}
		}
	},
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		},

		fillPortCodes: {
			type: String,
			default: ''
		},
		orderStatus: {
			type: String,
			default: ''
		},
		validateBlContact: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		this.getShipTerm()
		this.signEmployeeOptions = [{ label: this.createItem.signEmployeeName, value: this.createItem.signEmployeeId }]
		if (!this.createItem.signAddress) {
			this.getUserCompanyMethod()
		}
		if (!this.createItem) {
			this.createItem = {}
		}
	},

	mounted() {
		// 根据出单方式初始化正副本
		this.handleChangeBlMode(this.createItem.blMode)
	},

	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			roles: state => state.user.roles
		}),
		editReg() {
			//根据属性名设置编辑框正则

			if ((this.editProp === 'cargoMark' || this.editProp === 'cargoDesc') && this.createItem.podPortName === 'TAICHUNG,TAIWAN') {
				return /$a/g // 不匹配任何内容
			} else {
				return /[^\x00-\x7F]+/g
			}
		},
		cargoReg() {
			if (this.createItem.podPortName != 'TAICHUNG,TAIWAN') {
				return /[^\x00-\x7F]+/g
			} else {
				return /$a/g // 不匹配任何内容
			}
		},
		disabledState() {
			return this.isOp || this.isView
		},

		isOp() {
			return this.roles.includes('op')
		},
		isBd() {
			return !this.roles.includes('pricing') && (this.roles.includes('bd') || this.roles.includes('obd') || this.roles.includes('asst'))
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

		// MBL不可编辑，HBL可编辑
		mblDisabled() {
			return this.createItem.blType === 'mbl' ? true : false
		},
		blTypeOptions() {
			return [
				{ label: 'MBL', value: 'mbl', en: 'MBL' },
				{ label: 'HBL', value: 'hbl', en: 'HBL' }
			]
		}
	},
	watch: {
		'createItem.ship.sysLineCode'(newVal, oldVal) {
			let { action } = this.oQuery
			if (newVal && action !== 'add' && action !== 'copy') {
				this.fillSysLine(newVal)
			}
		}
	},
	components: { ContactPerson, TextAreaItem },
	methods: {
		//关闭编辑框
		editConfirm() {
			//判断是否显示感叹号
			this.iconObj[this.editProp] = /[^\x00-\xff]+/g.test(this.createItem[this.editProp])
			this.editVisible = false
			this.createItem[this.editProp] = this.editValue
		},
		//打开编辑框
		editDetail(val) {
			this.editProp = val
			this.editValue = this.createItem[this.editProp]
			this.editVisible = true
			this.editTitle = this.editTitleObj[val]
			if (val === 'cargoMark' || val === 'cargoDesc') {
				this.editInputMaxLength = 2048
			} else {
				this.editInputMaxLength = 512
			}
			// this.$nextTick(() => {
			// 	this.$refs.editInput.focus()
			// })
		},
		showDetail(val) {
			let errContent = this.createItem[val].replace(/[^\x00-\xff]+/g, function(item) {
				return `<span style='color:red;'>${item}</span>`
			})
			this.errContent = errContent.split('\n')
			this.detailVisible = true
		},
		handleBlur(val) {
			// this.$set(this.validateBlContact[val], 'showTip', false)
			// 特殊字符&#x202c替换为空格
			this.createItem[val] = this.createItem[val].replace('‬  ', ' ')
			this.iconObj[val] = /[^\x00-\xff]+/g.test(this.createItem[val])
		},
		handleFocus(val) {
			// this.$set(this.validateBlContact[val], 'showTip', true)
			this.iconObj[val] = false
		},
		openContactPerson(type, num) {
			// 打开收发通弹窗
			this.contactPersonConfig.type = type
			this.contactPersonConfig.num = num
			this.contactPersonShow = true
		},
		getContactPerson(action, value, type, num) {
			this.contactPersonShow = false
			if (action === 'Confirm') {
				let str = `${value.companyName ? value.companyName + '\n' : ''}${value.contactAddress ? value.contactAddress + '\n' : ''}${value.contactName ? value.contactName + '\n' : ''}${value.contactPhone ? 'TEL:' + value.contactPhone + '\n' : ''}${
					value.contactFax ? 'FAX:' + value.contactFax + '\n' : ''
				}${value.taxCode ? 'TAX:' + value.taxCode + '\n' : ''}${value.remark}`
				if (type === '收货人') {
					this.$set(this.createItem, 'consignee', str)
				} else if (type === '代理人') {
					this.$set(this.createItem, 'forwardAgent', str)
				} else if (type === '发货人') {
					this.$set(this.createItem, 'shipper', str)
				} else {
					if (num == 1) {
						this.$set(this.createItem, 'notify1', str)
					} else if (num == 2) {
						this.$set(this.createItem, 'notify2', str)
					} else {
						// this.createItem.transport.notify3 = str
					}
				}
			}
		},
		handleClickNotify() {
			if (this.notify === '1') {
				this.$set(this.createItem, 'notify1', 'SAME AS CONSIGNEE')
			}
			if (this.notify === '2') {
				this.$set(this.createItem, 'notify2', 'SAME AS CONSIGNEE')
			}
		},
		numberInputCheck(val, params, text) {
			// 正副本数字校验
			this.debounceLs(() => {
				if (!val) return
				let numberReg = /^[0-9]+$/
				if (!numberReg.test(val) && (!val.includes('.') || val.indexOf('.') === 0 || (val.length > 1 && val.indexOf('.') !== val.length - 1))) {
					this.createItem[params] = ''
					this.$message.error(`${text}必须填写正整数`)
				}
			})
		},
		debounceLs(fn, time = 600) {
			clearTimeout(this.timerTr)
			this.timerTr = setTimeout(() => {
				if (!fn || !(fn instanceof Function)) {
					this.$message({ message: '参数错误！', type: 'error', showClose: true })
				} else {
					fn()
				}
			}, time)
		},
		// 签单人下拉搜索自定义查询
		signerFilterMehod(val) {
			this.getEmployeeName(val)
		},
		// 签单人下拉展开
		signerVisibleChange(val) {
			if (val) {
				this.getEmployeeName()
			}
		},
		// 获取姓名
		getEmployeeName(val) {
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : ''
			}
			baseEmployeeListName(data).then(res => {
				this.signEmployeeOptions = res.data.map(item => {
					return Object.assign(item, {
						label: this.$language == 'en' ? item.ename : item.cname,
						value: item.employeeId
					})
				})
			})
		},
		handleChangeEmployeeId(val) {
			let findItem = this.signEmployeeOptions.find(item => item.value === val)
			this.createItem.signEmployeeName = findItem ? findItem.label : ''
		},
		// 选择为H单，提单号为接口生成; 选择M单，提单号为空,需手动输入
		handleChangeBlType(val) {
			console.log('🚀 ~ val', val)
			if (val === 'hbl') {
				this.handleCreateSerialNo()
				// this.createItem.numOriginal = '3'
				// this.createItem.numCopy = '3'
			} else {
				this.createItem.blNo = ''
				// this.createItem.numOriginal = ''
				// this.createItem.numCopy = ''
			}
		},
		//铁路提单（h单、m单）的“正/副本”的值调整：若出单方式是“正本”，则默认3/3；若出单方式是“电放”，则默认1/1 v20220329
		handleChangeBlMode(val) {
			console.log('🚀 ~ val', val)
			if (val === 'original') {
				this.createItem.numOriginal = '3'
				this.createItem.numCopy = '3'
			} else {
				this.createItem.numOriginal = '1'
				this.createItem.numCopy = '1'
			}
		},
		// 生成HBL号
		handleCreateSerialNo() {
			blCreateSerialNo({ orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				this.createItem.blNo = res.data.serialNo
			})
		},
		fillSysLine(sysLineCode) {
			if (sysLineCode) {
				baseSystemLineInfo({ sysLineCode }).then(res => {
					this.sysLineName = res.data.cname
				})
			}
		},
		getPortName(data, portCode) {
			let result = ''
			let arr = data.filter(item => portCode.includes(item.portCode))
			if (arr.length) {
				arr.forEach((ele, index) => {
					result += `${index ? ',' : ''}${ele.portCode}(${ele.ename}${ele.countryEname ? ',' + ele.countryEname : ''})`
				})
			}
			return result
		},

		// 运输条款
		getShipTerm() {
			this.$store.dispatch('dict/baseShipTermsList').then(data => {
				this.dictMap.transportTerm = data.map(item => {
					return Object.assign(item, {
						label: item.value,
						value: item.key
					})
				})
			})
		},
		handleNotifyClick(val) {
			this.notify = val
		},
		getUserCompanyMethod() {
			// 获取当前登录账号所属公司信息
			this.$store.dispatch('order/getUserCompanyInfoAction').then(signAddress => {
				this.createItem.signAddress = signAddress
			})
		}
	}
}
</script>

<style lang="scss">
.err-detail-dlg {
	.el-dialog__body {
		max-height: 400px !important;
	}
}
.shipper-rel {
	position: relative;
	.el-icon-warning {
		z-index: 200;
		position: absolute;
		right: 18px;
		top: 50%;
		color: #f00;
	}
	.tip {
		position: absolute;
		z-index: 2;
		right: -205px;
		width: 200px;
		height: 60px;
		border: 1px solid #e9851f;
		border-radius: 2px;
		background-color: #fff8e6;
		top: 50%;
		margin-top: -30px;
		line-height: 18px;
		padding: 3px 8px;
		font-size: 12px;
		color: #333;
		&::before {
			content: '';
			display: block;
			position: absolute;
			background-color: #fff8e6;
			// border-radius: 2px;
			top: 50%;
			left: -5px;
			margin-top: -5px;
			width: 9px;
			height: 9px;
			border-width: 1px 1px 0 0;
			border-color: #e9851f;
			border-style: solid;
			transform: rotate(-135deg);
			z-index: 3;
		}
	}
	&.notify-rel {
		.tip {
			left: -205px;
			&::before {
				right: -5px;
				left: auto;
				transform: rotate(45deg);
			}
		}
	}
}
#railwayBlInfo .el-input__prefix {
	left: 0;
}
.train-number {
	padding-right: 0 !important;
	.el-form-item__label {
		float: unset;
	}
}
.seprate-line {
	display: inline-block;
	width: 10%;
	font-size: 12px;
	margin: 0;
	text-align: center;
}
#railwayBlInfo .notify {
	display: flex;
	justify-content: space-between;

	.notify-flex-row {
		display: flex;
		.lab {
			width: 110px;
			letter-spacing: -0.8px;
			cursor: pointer;
			&.flex1 {
				width: 90px;
			}
		}
	}
}

#railwayBlInfo .notify .lab.active {
	color: #1890ff;
	// font-weight: bold;
	position: relative;
	&::before {
		position: absolute;
		content: '';
		display: block;
		bottom: -1px;
		z-index: 1;
		left: 50%;
		width: 24px;
		margin-left: -12px;
		height: 1px;
		background-color: #1890ff;
	}
}
.row-flex#railwayBlInfo .flex-item {
	padding-bottom: 0px !important;
}
.row-flex#railwayBlInfo .flex-item .plus {
	font-size: 16px;
	color: #1890ff;
	line-height: 20px;
	cursor: pointer;
}
</style>
