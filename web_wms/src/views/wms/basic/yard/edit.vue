<template>
	<el-dialog :title="isEdit ? '修改码头堆场资料' : '新增码头堆场资料'" @close="$emit('close')" :visible="true" :close-on-click-modal="false" width="80%">
		<div class="yard-edit-form">
			<el-form :show-message="false" ref="yardForm" :rules="rules" label-width="110px" :inline="true" :model="formInline">
				<el-form-item prop="wharfYardName" label="码头堆场中文名">
					<el-input maxlength="64" size="mini" placeholder="请输入" v-model="formInline.wharfYardName"> </el-input>
				</el-form-item>
				<el-form-item prop="wharfYardEname" label="码头堆场英文名">
					<el-input maxlength="64" size="mini" placeholder="请输入" v-model="formInline.wharfYardEname"> </el-input>
				</el-form-item>
				<el-form-item prop="wharfYardCode" label="码头堆场代码">
					<el-input maxlength="64" :disabled="isEdit" size="mini" placeholder="请输入" v-model="formInline.wharfYardCode"> </el-input>
				</el-form-item>
				<el-form-item prop="phone" label="码头堆场电话">
					<el-input maxlength="64" size="mini" placeholder="请输入" v-model="formInline.phone"> </el-input>
				</el-form-item>
				<el-form-item prop="webUrl" label="码头网址">
					<el-input maxlength="64" size="mini" placeholder="请输入" v-model="formInline.webUrl"> </el-input>
				</el-form-item>
				<el-form-item prop="wharfYardType" label="内外堆场类型">
					<el-select size="mini" v-model="formInline.wharfYardType" placeholder="请选择">
						<el-option v-for="item in dictMap.wmsWharfYardType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="countryName" label="国家">
					<el-input disabled maxlength="64" size="mini" placeholder="请输入" v-model="formInline.countryName"> </el-input>
					<!-- <el-select size="mini" v-model="formInline.countryCode" placeholder="请选择">
						<el-option  label="区域一" value="shanghai"></el-option>
						<el-option label="区域二" value="beijing"></el-option>
					</el-select> -->
				</el-form-item>
				<el-form-item prop="provinceCode" label="省份">
					<el-select filterable @change="handleChangeProvince" size="mini" v-model="formInline.provinceCode" placeholder="请选择">
						<el-option v-for="item in provinceOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="cityCode" label="城市">
					<el-select filterable @change="handleChangeCity" size="mini" v-model="formInline.cityCode" placeholder="请选择">
						<el-option v-for="item in cityOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item class="w100" prop="address" label="详细地址">
					<el-input size="mini" maxlength="128" show-word-limit type="textarea" :rows="2" placeholder="请输入详细地址" v-model="formInline.address"> </el-input>
				</el-form-item>
			</el-form>
		</div>
		<span slot="footer" class="dialog-footer">
			<el-button @click="handleSubmit" type="success" size="mini">提交</el-button>
			<el-button @click="$emit('close')" size="mini">取消</el-button>
		</span>
	</el-dialog>
</template>
<script>
import { countrySelectList, getDomesticCity, getForeignCity } from '@/api/base'
import { mapGetters } from 'vuex'

export default {
	props: ['isEdit', 'formData'],
	data() {
		return {
			cityOptions: [{ label: '', value: '' }],
			provinceOptions: [{ label: '', value: '' }],
			rules: {
				wharfYardName: [{ required: true, message: '请输入码头堆场中文名', trigger: 'blur' }],
				wharfYardCode: [{ required: true, message: '请输入码头堆场代码', trigger: 'blur' }],
				// phone: [{ required: true, message: '请输入码头堆场电话', trigger: 'blur' }],
				wharfYardType: [{ required: true, message: '请选择内外堆场类型', trigger: 'change' }],
				address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
				countryName: [{ required: true, message: '请输入国家', trigger: 'blur' }],
				provinceCode: [{ required: true, message: '请选择省份', trigger: 'change' }],
				cityCode: [{ required: true, message: '请选择城市', trigger: 'change' }]
			},
			formInline: {
				wharfYardName: '',
				wharfYardEname: '',
				wharfYardType: 'outside_yard',
				countryCode: 'CN',
				countryName: '中国',
				provinceCode: '',
				provinceName: '',
				cityCode: '',
				cityName: '',
				address: '',
				phone: '',
				webUrl: '',
				wharfYardCode: ''
			}
		}
	},
	computed: {
		...mapGetters(['dictMap', 'dictMapObj'])
	},
	watch: {},
	created() {
		this.getProvince()
		this.setFormData()
	},
	activated() {},
	methods: {
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
		// 提交
		handleSubmit() {
			this.$refs.yardForm.validate(valid => {
				if (valid) {
					// if (/[^\u4E00-\u9FA5]/g.test(this.formInline.wharfYardName)) return this.$message.error('中文名称只能输入中文!')
					if (this.formInline.wharfYardEname && /[\W]/g.test(this.formInline.wharfYardEname)) return this.$message.error('英文名称只能输入英文!')
					if (/[^0-9-]/g.test(this.formInline.phone)) return this.$message.error('码头堆场电话只能输入数字和-!')

					this.$emit('submit', this.formInline)
				} else {
					console.log('error submit!!')
					return false
				}
			})
		},
		// 初始化表单数据
		setFormData() {
			if (this.isEdit) {
				this.formInline = JSON.parse(JSON.stringify(this.formData))
				// 获取城市数据
				this.getCity(this.formInline.provinceCode)
			} else {
				this.formInline = {
					wharfYardName: '',
					wharfYardEname: '',
					wharfYardType: 'outside_yard',
					countryCode: 'CN',
					countryName: '中国',
					provinceCode: '',
					provinceName: '',
					cityCode: '',
					cityName: '',
					address: '',
					phone: '',
					webUrl: '',
					wharfYardCode: ''
				}
			}
		}
	},
	components: {}
}
</script>
<style></style>
<style lang="scss">
.yard-edit-form {
	.el-form-item {
		margin-right: 0;
		&.w100 {
			width: 100%;
		}
		width: calc((100%) / 3);
		.el-form-item__content {
			width: calc(100% - 110px);
			.el-select,
			.el-date-editor--datetime {
				width: 100%;
			}
		}
	}
}
</style>
