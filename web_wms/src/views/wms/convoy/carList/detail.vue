<template>
	<div class="detail-wrap">
		<div class="detail-header">
			<div class="header-left">{{ operType === 'modify' ? `修改车队车辆信息` : operType === 'add' ? `新增车队车辆信息` : `车队车辆信息详情` }}</div>
			<div class="header-right">
				<el-button v-if="!isDetail" @click="handleSubmit" size="mini" type="success">提交</el-button>
				<el-button v-if="!isDetail" @click="handleCancel" size="mini">取消</el-button>
				<el-button v-if="isDetail" @click="handleCancel" size="mini">返回</el-button>
			</div>
		</div>
		<el-form ref="validForm" :show-message="false" :rules="rules" label-width="85px" :inline="true" :model="formInline">
			<div class="top-form">
				<el-form-item prop="teamName" label="车队名称">
					<el-input maxlength="64" :disabled="isDetail" size="mini" placeholder="请输入" v-model="formInline.teamName"> </el-input>
				</el-form-item>
				<el-form-item prop="teamCode" label="车队代码">
					<el-input maxlength="64" :disabled="isDetail" size="mini" placeholder="请输入" v-model="formInline.teamCode"> </el-input>
				</el-form-item>

				<el-form-item prop="countryCode" label="国家">
					<el-input disabled maxlength="64" size="mini" placeholder="请输入" v-model="formInline.countryName"> </el-input>
				</el-form-item>
				<el-form-item prop="provinceCode" label="省份">
					<el-select :disabled="isDetail" @change="handleChangeProvince" size="mini" v-model="formInline.provinceCode" placeholder="请选择">
						<el-option v-for="item in provinceOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="cityCode" label="城市">
					<el-select :disabled="isDetail" @change="handleChangeCity" size="mini" v-model="formInline.cityCode" placeholder="请选择">
						<el-option v-for="item in cityOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="supplierId" label="供应商名称">
					<el-select
						:disabled="isDetail"
						size="mini"
						v-model="formInline.supplierId"
						filterable
						remote
						reserve-keyword
            clearable
						placeholder="请输入"
						@change="
							val => {
								supplierChange(val)
							}
						"
						:remote-method="
							val => {
								supplierMethod(val)
							}
						"
            @visible-change="showSupplierList"
					>
						<el-option v-for="item in supplierOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="contact" label="联系人">
					<el-input maxlength="64" :disabled="isDetail" size="mini" placeholder="请输入" v-model="formInline.contact"> </el-input>
				</el-form-item>
				<el-form-item prop="contactPhone" label="联系人电话">
					<el-input maxlength="64" :disabled="isDetail" size="mini" placeholder="请输入" v-model="formInline.contactPhone"> </el-input>
				</el-form-item>
				<el-form-item prop="email" label="邮箱">
					<el-input maxlength="64" :disabled="isDetail" size="mini" placeholder="请输入" v-model="formInline.email"> </el-input>
				</el-form-item>
				<el-form-item prop="enabled" label="启用状态">
					<el-select :disabled="isDetail" size="mini" v-model="formInline.enabled" placeholder="请选择">
						<el-option v-for="item in dictMap.openOrClose" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
				</el-form-item>
			</div>
			<div class="table-wrap">
				<div class="table-title">
					<div class="title-left">车队车辆信息</div>
					<div class="title-right">
						<span v-if="!isDetail" @click="handleAdd" class="add-btn">新增</span><span @click="handleFold" class="arrow-btn">{{ arrowText }} <i :class="arrowDown ? 'el-icon-caret-top' : 'el-icon-caret-bottom'"></i></span>
					</div>
				</div>
				<div v-if="arrowDown" class="table-content">
					<el-table :header-cell-style="{ color: '#222222' }" :data="formInline.truckList" border>
						<el-table-column align="center">
							<template slot="header"> <span style="color: #e63923">*</span>车牌号码 </template>
							<template slot-scope="scope">
								<el-form-item :prop="'truckList.' + scope.$index + '.licensePlate'" :rules="rules.licensePlate">
									<el-input maxlength="64" v-if="scope.row.isEdit" size="mini" placeholder="请输入" v-model="scope.row.licensePlate"> </el-input>
									<span v-else>{{ scope.row.licensePlate }}</span>
								</el-form-item>
							</template>
						</el-table-column>
						<el-table-column align="center">
							<template slot="header"> <span style="color: #e63923">*</span>载重(KG) </template>
							<template slot-scope="scope">
								<el-form-item :prop="'truckList.' + scope.$index + '.vehicleLoad'" :rules="rules.vehicleLoad">
									<el-input maxlength="64" v-if="scope.row.isEdit" size="mini" placeholder="请输入" v-model="scope.row.vehicleLoad"> </el-input>
									<span v-else>{{ scope.row.vehicleLoad }}</span>
								</el-form-item>
							</template>
						</el-table-column>
						<el-table-column align="center">
							<template slot="header">司机姓名 </template>
							<template slot-scope="scope">
								<el-form-item>
									<el-input maxlength="64" v-if="scope.row.isEdit" size="mini" placeholder="请输入" v-model="scope.row.driverName"> </el-input>
									<span v-else>{{ scope.row.driverName }}</span>
								</el-form-item>
							</template>
						</el-table-column>
						<el-table-column align="center" width="200">
							<template slot="header">司机电话 </template>
							<template slot-scope="scope">
								<el-form-item>
									<el-input maxlength="64" v-if="scope.row.isEdit" size="mini" placeholder="请输入" v-model="scope.row.driverPhone"> </el-input>
									<span v-else>{{ scope.row.driverPhone }}</span>
								</el-form-item>
							</template>
						</el-table-column>
						<el-table-column align="center">
							<template slot="header"> <span style="color: #e63923">*</span>启用状态 </template>
							<template slot-scope="scope">
								<el-form-item :prop="'truckList.' + scope.$index + '.enabled'" :rules="rules.enabled">
									<el-select v-if="scope.row.isEdit" size="mini" v-model="scope.row.enabled" placeholder="请选择">
										<el-option v-for="item in dictMap.openOrClose" :key="item.value" :label="item.label" :value="item.value"></el-option>
									</el-select>
									<span v-else>
										<span v-if="scope.row.enabled === 'yes'" style="color: #33b18a">启用</span>
										<span v-if="scope.row.enabled === 'no'" style="color: #cd4130">禁用</span>
									</span>
								</el-form-item>
							</template>
						</el-table-column>

						<el-table-column v-if="!isDetail" align="center" prop="address" label="操作">
							<template slot-scope="scope"
								><span v-if="scope.row.isEdit" @click="scope.row.isEdit = !scope.row.isEdit" class="save-btn">保存</span><span v-else @click="scope.row.isEdit = !scope.row.isEdit" class="modify-btn">修改</span
								><span @click="handleDelete(scope.$index)" class="delete-btn">删除</span>
							</template>
						</el-table-column>
					</el-table>
				</div>
			</div>
		</el-form>
	</div>
</template>
<script>
import { queryTruckDetail, saveTruckTeamInfo, updateTruckTeamInfo, supplierList } from '@/api/wms'
import { countrySelectList, getDomesticCity, getForeignCity } from '@/api/base'
import { mapGetters } from 'vuex'
export default {
	data() {
		return {
			supplierOptions: [],
			cityOptions: [{ label: '', value: '' }],
			provinceOptions: [{ label: '', value: '' }],

			arrowText: '收起',
			arrowDown: true,
			rules: {
				teamName: [{ required: true, message: '请输入车队名称', trigger: 'blur' }],
				teamCode: [{ required: true, message: '请选择车队代码', trigger: 'blur' }],
				countryCode: [{ required: true, message: '请选择国家', trigger: 'change' }],
				provinceCode: [{ required: true, message: '请选择省份', trigger: 'change' }],
				cityCode: [{ required: true, message: '请选择城市', trigger: 'change' }],
				supplierId: [{ required: true, message: '请选择供应商', trigger: 'change' }],
				contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
				contactPhone: [{ required: true, message: '请输入联系人电话', trigger: 'blur' }],
				enabled: [{ required: true, message: '请选择启用状态', trigger: 'change' }],

				licensePlate: [{ required: true, message: '请输入车牌号', trigger: 'blur' }],
				vehicleLoad: [{ required: true, message: '请输入载重', trigger: 'blur' }]
				// driverName: [{ required: true, message: '请输入司机姓名', trigger: 'blur' }],
				// driverPhone: [{ required: true, message: '请输入司机电话', trigger: 'blur' }]
			},
			formInline: {
				teamCode: '',
				teamName: '',
				countryCode: 'CN',
				countryName: '中国',
				provinceCode: '',
				provinceName: '',
				cityCode: '',
				cityName: '',
				supplierId: '',
				supplierName: '',
				vehicleNum: '',
				contact: '',
				contactPhone: '',
				email: '',
				enabled: 'yes'
			},
      operType: ''
		}
	},
	created() {},
	activated() {
		this.getProvince()
    this.operType =  this.$route.query.type
		// 详情 修改
		if (['detail', 'modify'].includes(this.$route.query.type)) {
			this.getDetail()
		} else {
			// 重置校验
			this.$refs.validForm.resetFields()
			// 新增
			this.formInline = {
				teamCode: '',
				teamName: '',
				countryCode: 'CN',
				countryName: '中国',
				provinceCode: '',
				provinceName: '',
				cityCode: '',
				cityName: '',
				supplierId: '',
				supplierName: '',
				vehicleNum: '',
				contact: '',
				contactPhone: '',
				email: '',
				enabled: 'yes',
				truckList: [
					{
						licensePlate: '',
						vehicleLoad: '',
						driverName: '',
						driverPhone: '',
						enabled: 'yes',
						isEdit: true,
						statusOptions: [
							{ label: '是', value: 'yes' },
							{ label: '否', value: 'no' }
						]
					}
				]
			}
		}
	},
	mounted() {},
	computed: {
		...mapGetters(['dictMap', 'dictMapObj']),
		isDetail() {
			return this.$route.query.type === 'detail'
		}
	},
	watch: {},
	components: {},
	methods: {
		// 选择客户
		supplierChange(val) {
      if (val) {
        let supplier = this.supplierOptions.find(item => item.supplierId === val)
        this.formInline.supplierName = supplier?.name
        if (supplier && supplier.contactInfo) {
          let { name, ename, mobileNo } = supplier.contactInfo
          this.formInline.contact = name || ename
          this.formInline.contactPhone = mobileNo
        } else {
          this.formInline.contact = ''
          this.formInline.contactPhone = ''
        }
      } else {
        this.formInline.supplierName = ''
        this.formInline.contact = ''
        this.formInline.contactPhone = ''
      }
		},
		// 客户列表
		supplierMethod(val) {
			supplierList({ name: val }).then(res => {
				this.supplierOptions = res.data.map(item => {
					return { ...item, label: item.name, value: item.supplierId }
				})
			})
		},
    showSupplierList (show) {
      show && this.supplierMethod('')
    },
		// 选择城市
		handleChangeCity(val) {
			let city = this.cityOptions.find(item => item.code === val)
			this.formInline.cityName = city?.label
		},
		// 选择省份
		handleChangeProvince(val) {
			let province = this.provinceOptions.find(item => item.code === val)
			this.formInline.provinceName = province?.label
			// 修改省份时 先清空城市
			this.formInline.cityName = ''
			this.formInline.cityCode = ''
			this.getCity(val)
		},
		// 城市数据
		getCity(code) {
			getDomesticCity({ code }).then(res => {
				this.cityOptions = (res.data || []).map(item => {
					return { ...item, label: item.cname, value: item.code }
				})
			})
		},
		// 省份数据
		getProvince() {
			getDomesticCity({}).then(res => {
				this.provinceOptions = (res.data || []).map(item => {
					return { ...item, label: item.cname, value: item.code }
				})
			})
		},
		// 获取详情
		getDetail() {
			queryTruckDetail({ truckTeamId: this.$route.query.truckTeamId }).then(res => {
				this.formInline = res?.data
				// 获取城市数据
				this.getCity(this.formInline.provinceCode)
				// 获取供应商数据
				this.supplierMethod(this.formInline.supplierName)
				this.formInline.truckList = res?.data?.truckList?.map(item => {
					return {
						...item,
						isEdit: false,
						statusOptions: [
							{ label: '是', value: 'yes' },
							{ label: '否', value: 'no' }
						]
					}
				})
			})
		},
		// 提交
		handleSubmit() {
			this.$refs['validForm'].validate(valid => {
				if (valid) {
					let data = JSON.parse(JSON.stringify(this.formInline))
					let reg = /[`~!@#$%^&*()\+=<>?:"{}|,.\/;'\\[\]~！@#￥%……&*（）——\+={}|《》？：“”【】、；‘'，。、]/
					if (data.truckList.some(item => reg.test(item.licensePlate))) return this.$message.error('车牌号不能包含特殊字符!')
					if (reg.test(this.formInline.teamName)) return this.$message.error('车队名称不能包含特殊字符!')
					if (reg.test(this.formInline.teamCode)) return this.$message.error('车队代码不能包含特殊字符!')
					if (!/^[\u4E00-\u9FA5A-Za-z]+$/.test(this.formInline.contact)) return this.$message.error('联系人只能输入中文或字母!')
					if (!/^\d{1,11}$/.test(this.formInline.contactPhone)) return this.$message.error('联系人电话只能输入最多11位的数字!')          
					if (data.truckList.some(item => !/^[0-9]+(.[0-9]{1,2})?$/.test(item.vehicleLoad))) return this.$message.error('载重只能输入最多包含两位小数数的数字!')
          if (data.truckList.some(item => item.driverName && !/^[\u4E00-\u9FA5A-Za-z]+$/.test(item.driverName))) return this.$message.error('司机姓名只能输入中文或字母！')
					if (data.truckList.some(item => item.driverPhone && !/^\d{1,11}$/.test(item.driverPhone))) return this.$message.error('司机电话只能输入最多11位的数字!')

					// 删除状态数据源
					data.truckList.map(item => {
						delete item.statusOptions
					})
					let fn = null
					if (this.$route.query.type === 'add') {
						fn = saveTruckTeamInfo
					} else {
						fn = updateTruckTeamInfo
					}
					fn(data).then(() => {
						this.$router.push({ name: 'CarList' })
						this.$message.success('提交成功!')
					})
				} else {
					this.$message.error('请填写必填项!')
				}
			})
		},
		// 取消
		handleCancel() {
			this.$router.push({ name: 'CarList' })
		},
		// 新增一行
		handleAdd() {
			this.formInline.truckList.push({
				licensePlate: '',
				vehicleLoad: '',
				driverName: '',
				driverPhone: '',
				enabled: 'yes',
				isEdit: true,
				statusOptions: [
					{ label: '启用', value: 'yes' },
					{ label: '禁用', value: 'no' }
				]
			})
		},
		// 删除一行
		handleDelete(index) {
			this.formInline.truckList.splice(index, 1)
		},
		// 点击收起
		handleFold() {
			this.arrowDown = !this.arrowDown
			this.arrowText = this.arrowDown ? '收起' : '展开'
		}
	}
}
</script>
<style lang="scss">
.detail-wrap {
	min-height: calc(100vh - 62px);
	background: #ffffff;
	.table-wrap {
		margin: 0 16px;
		border: 1px solid #d9d9d9;
		span {
			font-size: 12px;
		}
		.table-content {
			padding: 16px;
			.el-table--border th,
			.el-table--border td {
				border-right: 1px solid #dfe6ec !important;
				height: 30px;
				padding: 0;
			}
			.delete-btn {
				color: #cd4130;
				cursor: pointer;
				margin-left: 16px;
			}
			.modify-btn {
				color: #e9851f;
				cursor: pointer;
			}
			.save-btn {
				color: #3e80f5;
				cursor: pointer;
			}
		}
		.table-title {
			background: #ebeef3;
			height: 40px;
			display: flex;
			justify-content: space-between;
			padding: 10px 15px;
			.title-left {
				font-size: 12px;
				font-weight: bold;
				color: #222222;
			}
			.title-right {
				display: flex;
				align-items: center;
				.add-btn {
					display: inline-block;
					width: 56px;
					height: 28px;
					line-height: 28px;
					background: #3e80f5;
					border-radius: 2px;
					margin-right: 40px;
					color: #ffffff;
					text-align: center;
					cursor: pointer;
				}
				.arrow-btn {
					cursor: pointer;
				}
			}
		}
	}
	.top-form {
		padding: 24px 0;
		.el-form-item {
			&.w100 {
				width: calc(100% - 20px);
			}
			width: calc((100% - 40px) / 4);
			.el-form-item__content {
				width: calc(100% - 85px);
				.el-select,
				.el-date-editor--datetime {
					width: 100%;
				}
			}
		}
	}
	.detail-header {
		padding: 10px 16px;
		height: 40px;
		border-bottom: 1px solid #d9d9d9;
		display: flex;
		justify-content: space-between;
		align-items: center;
		.header-left {
			font-size: 14px;
			font-weight: bold;
			color: #222222;
		}
	}
}
</style>
