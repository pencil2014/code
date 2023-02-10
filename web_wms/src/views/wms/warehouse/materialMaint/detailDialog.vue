<template>
	<div>
		<el-dialog :before-close="handleCancel" v-loading="loading" :visible.sync="options.show" class="dialog" :title="options.title" :modal-append-to-body="false" width="950px">
			<el-form :inline="true" :model="formData" label-width="120px" ref="form" size="mini">
				<el-form-item label="辅材名称：" prop="consumableName" :rules="blurRule">
					<el-input v-model="formData.consumableName" class="normalInput" :disabled="isDisabled" maxlength="64"></el-input>
				</el-form-item>
				<el-form-item label="辅材编号：" prop="consumableNo" :rules="blurRule">
					<el-input v-model="formData.consumableNo" class="normalInput" :disabled="isDisabled" maxlength="32"></el-input>
				</el-form-item>
				<el-form-item label="规格型号：" prop="specificationType" :rules="blurRule">
					<el-input v-model="formData.specificationType" class="normalInput" :disabled="isDisabled" maxlength="32"></el-input>
				</el-form-item>
        <el-form-item label="售价：" prop="unitPrice" :rules="blurRule">
					<el-input type="number" v-model="formData.unitPrice" min="0" max="9999999.99" maxlength="11" @keydown.native="e=>e.returnValue=(['e','E','-','+'].includes(e.key))?'':e.returnValue" class="normalInput" :disabled="isDisabled">
            <template slot="append">元</template>
          </el-input>
				</el-form-item>
				<el-form-item label="单位：" prop="unit" :rules="changeRule">
					<el-select v-model="formData.unit" class="normalInput" :disabled="isDisabled">
						<el-option v-for="item in dictMap['wmsGoodsUnit']" :key="item.value" :label="item.label" :value="item.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="启用状态：" prop="enabled" :rules="changeRule">
					<el-select v-model="formData.enabled" class="normalInput" :disabled="isDisabled">
						<el-option v-for="item in dictMap['yesNo']" :key="item.value" :label="item.value === 'yes' ? `启用` : `禁用`" :value="item.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="备注信息：" prop="remark">
					<el-input type="textarea" v-model="formData.remark" class="longInput" :disabled="isDisabled" maxlength="128" autosize></el-input>
				</el-form-item>
				<div style="display: flex">
					<el-form-item label="辅材图片：" style="margin-right: 0"></el-form-item>
					<div>
						<UploadFile ref="uploadFile" :acceptTypes="['gif', 'jpg', 'jpeg', 'png', 'bmp']" :autoUpload="true" :multiple="false" @sendFileData="getFileData" :limit="1" :isShowFileList="false"> </UploadFile>
					</div>
				</div>
				<div v-if="formData.fileNo" style="display: flex">
					<el-form-item label=" " style="margin-right: 0; position: relative">
						<i @click="deleteImg" style="font-size: 16px; color: #f00; position: absolute; right: -100px; top: 0px; z-index: 999" class="el-icon-close"></i>
					</el-form-item>
					<el-image style="width: 100px; height: 100px" :src="`/base/fileView/preview/${formData.fileNo}/sowoll`" :preview-src-list="[`/base/fileView/preview/${formData.fileNo}/sowoll`]"> </el-image>
				</div>
			</el-form>
			<div class="dialog-footer" slot="footer">
				<el-button @click="handleSubmit" size="mini" type="success">提交</el-button>
				<el-button @click="handleCancel" size="mini">取消</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import { saveConsumableInfo, updateConsumableInfo } from '@/api/wms/warehouse.js'
import UploadFile from '@/components/UploadFile/uploadFile'
import { mapGetters } from 'vuex'

const blurRule = { required: true, message: '此项必填', trigger: 'blur' }
const changeRule = { required: true, message: '此项必选', trigger: 'change' }
export default {
	components: {
		UploadFile
	},
	props: {
		options: {
			type: Object,
			default: () => {}
		}
	},
	data() {
		return {
			loading: false,
			blurRule,
			changeRule,
			formData: {
				consumableName: '',
				consumableNo: '',
				unit: '',
				specificationType: '',
        unitPrice: null,
				thumbnailFileNo: '',
				remark: '',
				enabled: '',
				createdName: '',
				createdTime: '',
				updatedName: '',
				updatedTime: '',
				fileNo: '',
				fileName: '',
				thumbnailFileNo: ''
			},
			isDisabled: false
		}
	},
	created() {
		if (this.options.data) {
			this.formData = Object.assign({}, this.formData, this.options.data)
		}
		this.isDisabled = this.options.type === 'detail'
	},
	computed: {
		...mapGetters(['dictMap', 'dictMapObj'])
	},
	methods: {
		// 删除图片
		deleteImg() {
			this.formData.fileNo = ''
			this.formData.fileName = ''
		},
		/**
		 * @description: 解除文件异步上传成功后接口返回的参数
		 * @param {*} data
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 11:16:44
		 */
		getFileData(data) {
			// 目前只能上传一张图片
			if (data && data.length) {
				this.formData.fileNo = data[0].fileNo
				this.formData.fileName = data[0].name
			}
		},
		/**
		 * @description: 提交数据
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-17 11:28:53
		 */
		handleSubmit() {
			// 做数据校验
			this.$refs['form'].validate(valid => {
				if (valid) {
          if (this.formData.unitPrice > 9999999.99) {
            return this.$message.error("售价不能大于9999999.99！")
          }
					let data = JSON.parse(JSON.stringify(this.formData))
					if (this.options.type === 'add') {
						this.saveConsumableInfo(data)
					} else if (this.options.type === 'edit') {
						this.updateConsumableInfo(data)
					}
				} else {
					this.$message.error('请将必填内容填写完整！')
					return false
				}
			})
		},
		/**
		 * @description: 新增耗材信息
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-19 14:12:12
		 */
		saveConsumableInfo(data) {
			saveConsumableInfo(data)
				.then(({ code }) => {
					if (code === 0) {
						this.$message.success('操作成功！')
						this.handleCancel()
						this.$emit('getData')
					}
				})
				.catch(() => {})
		},
		/**
		 * @description: 修改耗材信息
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-19 14:15:29
		 */
		updateConsumableInfo(data) {
			updateConsumableInfo(data)
				.then(({ code }) => {
					if (code === 0) {
						this.$message.success('操作成功！')
						this.handleCancel()
						this.$emit('getData')
					}
				})
				.catch(() => {})
		},
		/**
		 * @description: 关闭弹框
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-17 17:13:44
		 */
		handleCancel() {
			this.options.show = false
		}
	}
}
</script>
<style lang="scss" scoped>
@import '@/styles/common.scss';
.el-tabs__item {
	height: 30px;
	line-height: 30px;
}
</style>
