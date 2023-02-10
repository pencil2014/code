<template>
	<div class="edit-container-exec">
		<div class="edit-row">
			<div class="row-tit">
				<span class="tit">远期订舱</span>
				<div class="row-tit-operate">
					<div>
						<!-- <span>订单号: {{ detailInfo.orderNo }}</span>
						<span style="width: 50px"></span>
						<span>订单时间: {{ detailInfo.orderTime ? detailInfo.orderTime.substring(0, 10) : '' }}</span> -->
					</div>
					<div style="width: 20px"></div>
					<el-button style="float: right" size="mini" ref="btnCancel" @click="handleCancel" plain>返回</el-button>
				</div>
			</div>
			<el-form :model="createItem" :rules="rules" ref="createItemForm" @keyup.enter.native="submitForm('createItemForm')" label-suffix=":" label-width="80px">
				<div class="orderCard">
					<section class="order-section">
						<header class="order-section-header">
							<h2>托运人信息 <span class="tips">(如果填写，所有信息必须同时填写，其中邮箱非必填)</span></h2>
						</header>
						<div>
							<el-row>
								<el-col :span="8">
									<el-form-item label="姓名" prop="shipperInfo.name">
										<el-input style="width: 80%" size="mini" v-model="createItem.shipperInfo.name"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="省市区" prop="shipperInfo.addressLine1">
										<el-input style="width: 80%" size="mini" v-model="createItem.shipperInfo.addressLine1" maxlength="35"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="街道地址" prop="shipperInfo.addressLine2">
										<el-input style="width: 80%" size="mini" v-model="createItem.shipperInfo.addressLine2" maxlength="35"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="手机" prop="shipperInfo.phone">
										<el-input style="width: 80%" size="mini" v-model="createItem.shipperInfo.phone"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="邮箱" prop="shipperInfo.email">
										<el-input style="width: 80%" size="mini" v-model="createItem.shipperInfo.email"></el-input>
									</el-form-item>
								</el-col>
							</el-row>
						</div>
					</section>
				</div>
				<div class="orderCard">
					<section class="order-section">
						<header class="order-section-header">
							<h2>收货人信息 <span class="tips">(如果填写，所有信息必须同时填写，其中邮箱非必填)</span></h2>
						</header>
						<div>
							<el-row>
								<el-col :span="8">
									<el-form-item label="姓名" prop="consigneeInfo.name">
										<el-input style="width: 80%" size="mini" v-model="createItem.consigneeInfo.name"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="省市区" prop="consigneeInfo.addressLine1">
										<el-input style="width: 80%" size="mini" v-model="createItem.consigneeInfo.addressLine1" maxlength="35"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="街道地址" prop="consigneeInfo.addressLine2">
										<el-input style="width: 80%" size="mini" v-model="createItem.consigneeInfo.addressLine2" maxlength="35"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="手机" prop="consigneeInfo.phone">
										<el-input style="width: 80%" size="mini" v-model="createItem.consigneeInfo.phone"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="邮箱" prop="consigneeInfo.email">
										<el-input style="width: 80%" size="mini" v-model="createItem.consigneeInfo.email"></el-input>
									</el-form-item>
								</el-col>
							</el-row>
						</div>
					</section>
				</div>
				<div class="orderCard">
					<section class="order-section">
						<header class="order-section-header">
							<h2>货物信息</h2>
						</header>
						<div>
							<el-row>
								<el-col :span="8">
									<el-form-item label="货物描述" prop="cargoInfo.desc">
										<el-input style="width: 80%" size="mini" v-model="createItem.cargoInfo.desc"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="包装类型" prop="cargoInfo.packageType">
										<el-select style="width: 80%" clearable filterable size="mini" v-model="createItem.cargoInfo.packageType" :remote-method="getPackageType" @visible-change="getPackageType">
											<el-option v-for="(o, key) in packageTypeList" :key="key" :label="`${o.value} (${o.descpt})`" :value="o.value"></el-option>
										</el-select>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="货物数量" prop="cargoInfo.quantity">
										<el-input size="mini" min="1" v-model="createItem.cargoInfo.quantity" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"></el-input>
									</el-form-item>
								</el-col>
							</el-row>
							<el-row>
								<el-col :span="8">
									<el-form-item label="重量" prop="cargoInfo.weight">
										<el-input style="width: 80%" size="mini" v-model="createItem.cargoInfo.weight" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}">
											<i slot="suffix" style="font-style: normal; margin-right: 10px">KG</i>
										</el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="体积" prop="cargoInfo.volume">
										<el-input style="width: 80%" size="mini" v-model="createItem.cargoInfo.volume" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}">
											<i slot="suffix" style="font-style: normal; margin-right: 10px">M³</i>
										</el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="备注" prop="cargoInfo.remarks">
										<el-input size="mini" v-model="createItem.cargoInfo.remarks"></el-input>
									</el-form-item>
								</el-col>
							</el-row>
						</div>
					</section>
				</div>
				<div class="orderCard">
					<section class="order-section">
						<header class="order-section-header">
							<h2>紧急联系人信息</h2>
						</header>
						<div>
							<el-row>
								<el-col :span="8">
									<el-form-item label="邮箱" prop="emergencyContactInfo.email">
										<el-input style="width: 80%" size="mini" v-model="createItem.emergencyContactInfo.email"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="姓名">
										<el-input style="width: 80%" size="mini" v-model="createItem.emergencyContactInfo.name"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="手机号">
										<el-input style="width: 80%" size="mini" v-model="createItem.emergencyContactInfo.mobile"></el-input>
									</el-form-item>
								</el-col>
							</el-row>
							<el-row>
								<el-col :span="8">
									<el-form-item label="固定电话">
										<el-input style="width: 80%" size="mini" v-model="createItem.emergencyContactInfo.phone"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="15">
									<el-form-item label="地址">
										<el-input size="mini" min="1" v-model="createItem.emergencyContactInfo.address"></el-input>
									</el-form-item>
								</el-col>
							</el-row>
						</div>
					</section>
				</div>
				<div class="submitButton">
					<el-button style="float: right; margin-top: -22px" type="primary" size="mini" ref="btnCancel" :loading="disabledBtn" :disabled="disabledBtn" @click="payOrder('createItemForm')" plain>立即订舱</el-button>
				</div>
			</el-form>
		</div>
	</div>
</template>
<script>
import { mapGetters } from 'vuex'
import { bookingLong, getPackageType } from '@/api/exec/cosco'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
const RULES1 = {
	'emergencyContactInfo.email': [{ required: true, message: '联系人邮箱不能为空', trigger: 'blur' }],
	'cargoInfo.desc': [{ required: true, message: '货物名称不能为空', trigger: 'blur' }],
	'cargoInfo.packageType': [{ required: true, message: '包装类型不能为空', trigger: 'blur' }],
	'cargoInfo.quantity': [{ required: true, message: '数量不能为空', trigger: 'blur' }],
	'cargoInfo.weight': [{ required: true, message: '重量不能为空', trigger: 'blur' }],
	'cargoInfo.volume': [{ required: true, message: '体积不能为空', trigger: 'blur' }],
	'cargoInfo.remarks': [{ required: true, message: '备注不能为空', trigger: 'blur' }]
}
const RULES2 = {
	'shipperInfo.name': [{ required: true, message: '托运人姓名不能为空', trigger: 'blur' }],
	'shipperInfo.addressLine1': [{ required: true, message: '省市区不能为空', trigger: 'blur' }],
	'shipperInfo.addressLine2': [{ required: true, message: '街道地址不能为空', trigger: 'blur' }],
	'shipperInfo.phone': [{ required: true, message: '手机不能为空', trigger: 'blur' }]
	// 'shipperInfo.email': [{ required: true, message: '邮箱不能为空', trigger: 'blur' }],
}
const RULES3 = {
	'consigneeInfo.name': [{ required: true, message: '收货人姓名不能为空', trigger: 'blur' }],
	'consigneeInfo.addressLine1': [{ required: true, message: '省市区不能为空', trigger: 'blur' }],
	'consigneeInfo.addressLine2': [{ required: true, message: '街道地址不能为空', trigger: 'blur' }],
	'consigneeInfo.phone': [{ required: true, message: '手机不能为空', trigger: 'blur' }]
	// 'consigneeInfo.email': [{ required: true, message: '邮箱不能为空', trigger: 'blur' }],
}
export default {
	mixins: [routerMixin],
	data() {
		return {
			// 包装类型
			packageTypeList: [],
			rules: RULES1,
			disabledBtn: false,
			createItem: {
				orderNo: this.$route.query.orderNo,
				//紧急联系人
				emergencyContactInfo: {
					name: '',
					address: '',
					mobile: '',
					phone: '',
					email: ''
				},
				// 托运人信息
				shipperInfo: {
					name: '',
					addressLine1: '',
					addressLine2: '',
					phone: '',
					email: ''
				},
				// 收货人信息
				consigneeInfo: {
					name: '',
					addressLine1: '',
					addressLine2: '',
					phone: '',
					email: ''
				},
				//货物信息
				cargoInfo: {
					desc: 'FURNITURE',
					packageType: 'IV',
					quantity: 1000,
					weight: 15000,
					volume: 1000.5,
					remarks: '94011000'
				}
			}
		}
	},
	created() {
		this.init()
	},
	computed: {
		...mapGetters(['dictMap', 'dictMapObj'])
	},
	filters: {},
	methods: {
		// 立即订舱
		payOrder(formName) {
			this.$refs[formName].validate(valid => {
				if (valid) {
					let data = JSON.parse(JSON.stringify(this.createItem))
					let res1 = Object.values(data.shipperInfo).every(item => item === '')
					if (res1) {
						delete data.shipperInfo
					} else {
						let res3 = false
						Object.keys(data.shipperInfo).forEach(key => {
							if (!data.shipperInfo[key] && key !== 'email') {
								res3 = true
							}
						})
						if (res3) {
							return this.$msgErrClose('托运人信息必须同时填写，邮箱非必填')
						}
					}
					let res2 = Object.values(data.consigneeInfo).every(item => item === '')
					if (res2) {
						delete data.consigneeInfo
					} else {
						let res4 = false
						Object.keys(data.consigneeInfo).forEach(key => {
							if (!data.consigneeInfo[key] && key !== 'email') {
								res4 = true
							}
						})
						if (res4) {
							return this.$msgErrClose('收货人信息必须同时填写,邮箱非必填')
						}
					}
					this.disabledBtn = true

					console.log('🚀 ~ data', data)
					data.sapid = this.$route.query.sapid
					bookingLong(data)
						.then(res => {
							this.$message({ message: '恭喜你，订舱成功', type: 'success' })
							this.isJumpRouteFromPage = true
							this.$router.replace({
								path: 'orderSearch'
							})
						})
						.catch(() => {})
						.finally(() => {
							this.disabledBtn = false
						})
				} else {
					return false
				}
			})
		},
		init() {
			//清空表单数据
			this.clearFormData()
		},
		clearFormData() {
			//起运港费用
			this.porExtraFeeList = []
			//目的地费用
			this.fndExtraFeeList = []
			//附加费列表
			this.oceanFeeList = []
		},

		getPackageType(str) {
			if (str === false) {
				return
			}
			str = str === true ? '' : str
			let data = {
				currPage: 1,
				pageSize: 100,
				keywords: str
			}
			getPackageType(data)
				.then(res => {
					if (res.code === 0) {
						this.packageTypeList = res.data.list
					}
				})
				.catch(() => {})
		},
		// 取消
		handleCancel() {
			this.$router.replace({
				path: 'orderSearch'
			})
		}
	},
	activated() {
		let timestamp = new Date().getTime()
		if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
			this.init()
		}
	}
}
</script>
<style lang="scss">
@import '/less/detail.scss';
@import '/less/index.scss';
</style>
