<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="apply" :rules="rules" :model="createdItem" label-width="90px" class="apply-form">
			<el-form-item prop="cargoDesc" :show-message="false" label="中文品名">
				<el-input size="mini" v-model="createdItem.cargoDesc" clearable placeholder="请输入中文品名" maxlength="1024"></el-input>
			</el-form-item>
			<el-form-item prop="cargoDescEn" :show-message="false" label="英文品名">
				<el-input size="mini" v-model="createdItem.cargoDescEn" clearable placeholder="请输入英文品名" maxlength="1024"></el-input>
			</el-form-item>
			<el-form-item prop="hscode" :show-message="false" label="HSCODE">
				<el-select @change="hscodeChange" size="mini" v-model="createdItem.hscode" style="width: 100%" remote filterable clearable placeholder="请选择海关编号" :remote-method="val => queryCargoHscode(val)">
					<el-option v-for="(item, index) in hscodeOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item prop="classCode" :show-message="false" label="一级分类">
				<el-select @change="classCodeChange" size="mini" v-model="createdItem.classCode" style="width: 100%" filterable clearable placeholder="请选择一级分类">
					<el-option v-for="item in classCodeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item prop="chapterCode" :show-message="false" label="二级分类">
				<el-select size="mini" v-model="createdItem.chapterCode" style="width: 100%" remote filterable clearable placeholder="请选择二级分类" @clear="val => queryChaptercode(val)" :remote-method="val => queryChaptercode(val)">
					<el-option v-for="item in chapterCodeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item prop="cargoProperty" :show-message="false" label="货物性质">
				<el-select size="mini" v-model="createdItem.cargoProperty" style="width: 100%" clearable placeholder="请选择货物性质">
					<el-option v-for="(item, index) in dictMap.cargoProperty" :key="index" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item prop="dangerousGrade" :show-message="false" label="危险等级">
				<el-select size="mini" v-model="createdItem.dangerousGrade" style="width: 100%" clearable placeholder="请选择危险等级">
					<el-option v-for="(item, index) in dictMap.dangerousGrade" :key="index" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item prop="unNo" :show-message="false" label="国际危码">
				<el-select size="mini" v-model="createdItem.unNo" style="width: 100%" clearable placeholder="请选择国际危码" remote filterable :remote-method="val => queryCargoUnno(val)">
					<el-option v-for="(item, index) in dangerousCodeOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item prop="oilEletric" :show-message="false" label="是否含油电等">
				<el-select size="mini" v-model="createdItem.oilEletric" style="width: 100%" clearable placeholder="请选择" filterable>
					<el-option v-for="(item, index) in dictMap.oilEletric" :key="index" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item prop="fileList" :show-message="false" label="申报附件">
				<div style="text-align: right; margin-bottom: 4px"><el-button @click="handleAdd" type="primary" size="mini">新增附件</el-button></div>

				<el-table class="cargo-file-table" border fit highlight-current-row style="width: 100%" ref="fileListTable" :data="createdItem.fileList">
					<el-table-column prop="fileType" label="附件类型" align="center">
						<template slot-scope="scope">
							<el-select clearable size="mini" v-model="scope.row.fileType" placeholder="请选择">
								<el-option v-for="(o, key) in dictMap.hscodeUploadType" :key="key" :label="o.label" :value="o.value"> </el-option>
							</el-select>
						</template>
					</el-table-column>
					<el-table-column prop="fileName" label="附件模板" align="center"> </el-table-column>
					<el-table-column fixed="right" label="操作" align="center">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleUploadFile(scope.row)" type="text" size="mini">上传</el-button>
								<el-button style="color: red" @click="handleDelete(scope.row, scope.$index)" type="text" size="mini">删除</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</el-form-item>
			<el-form-item prop="isValid" :show-message="false" label="状态">
				<span style="font-size: 12px"> {{ createdItem.status === 'valid' ? '有效' : '无效' }}</span>
			</el-form-item>
		</el-form>
		<div v-if="uploadShow">
			<FileUpload @close="uploadPopClose" />
		</div>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { cargoHscodeList, hscodeTypeList, cargoUnnoList, hscodeFileList } from '@/api/base'
import FileUpload from './fileUpload'
const defaultCreate = {
	hscode: '',
	cargoDesc: '',
	cargoDescEn: '',
	classCode: '',
	chapterCode: '',
	cargoProperty: '',
	dangerousGrade: '',
	unNo: '',
	fileList: [{ fileType: '', fileName: '', fileNo: '' }],
	status: 'valid',
	oilEletric: ''
}

export default {
	data() {
		return {
			chapterCodeOptions: [],
			classCodeOptions: [],
			uploadShow: false,
			curRow: {},
			hscodeOptions: [], // hscode下拉数据
			dangerousCodeOptions: [], // 国家危险品编码下拉数据
			dialogConfig: {
				title: '新增品名',
				show: true,
				width: '600px',
				inputSize: ''
			},
			createdItem: Object.assign({}, defaultCreate),
			rules: {
				cargoDesc: [{ required: true, message: '请输入中文品名', trigger: 'blur' }],
				cargoDescEn: [{ required: true, message: '请输入英文品名', trigger: 'blur' }],
				hscode: [{ required: true, message: '请选择HSCODE', trigger: 'change' }],
				classCode: [{ required: true, message: '请选择一级分类', trigger: 'change' }],
				chapterCode: [{ required: true, message: '请选择二级分类', trigger: 'change' }],
				cargoProperty: [{ required: true, message: '请选择货物性质', trigger: 'change' }],
				dangerousGrade: [{ required: false, message: '请选择危险等级', trigger: 'change' }],
				unNo: [{ required: false, message: '请选择国际危码', trigger: 'change' }]
				// isValid: [{ required: true }]
			}
		}
	},
	props: {
		param: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		this.queryClassCodeList()
		this.init()
	},

	mounted() {},
	destroyed() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	watch: {
		'createdItem.cargoProperty': {
			handler(val) {
				this.rules.dangerousGrade = [{ required: val === 'dangerous', message: '请选择危险等级', trigger: 'change' }]
				this.rules.unNo = [{ required: val === 'dangerous', message: '请选择国际危码', trigger: 'change' }]
			}
		}
	},
	components: {
		BaseDialog,
		FileUpload
	},
	methods: {
		hscodeChange(val) {
			console.log('🚀 ~ val', val)
		},
		uploadPopClose(action, files) {
			this.uploadShow = false
			if (action === 'Confirm') {
				this.curRow.fileNo = files[0].fileNo //设置每一行对应的文件
				console.log('🚀 ~ this.curRow', this.curRow)
				this.curRow.fileName = files[0].fileName
			}
		},
		handleAdd() {
			this.createdItem.fileList.push({ fileType: '', fileName: '', fileNo: '' })
		},
		handleDelete(row, index) {
			this.createdItem.fileList.splice(index, 1)
		},
		// 打开上传附件弹窗
		handleUploadFile(row) {
			this.curRow = row
			this.uploadShow = true
		},
		// 一级货品分类
		queryClassCodeList() {
			hscodeTypeList({ name: '' }).then(response => {
				this.classCodeOptions = response.data.map(item => {
					return Object.assign(item, {
						label: item.className,
						value: item.classCode
					})
				})
			})
		},
		// 二级货品分类
		classCodeChange(classCode) {
			this.chapterCodeOptions = []
			this.createdItem.chapterCode = ''
			if (classCode) {
				hscodeTypeList({ classCode, name: '' }).then(response => {
					this.chapterCodeOptions = response.data.map(item => {
						return Object.assign(item, {
							label: item.chapterName,
							value: item.chapterCode
						})
					})
				})
			}
		},
		// 国际危险品编码查询
		queryCargoUnno(queryString) {
			queryString &&
				cargoUnnoList({ keyword: queryString }).then(response => {
					this.dangerousCodeOptions = response.data.map(item => {
						return Object.assign(item, {
							label: item.unDesc,
							value: item.unNo
						})
					})
				})
		},
		// hscode模糊查询
		queryCargoHscode(queryString) {
			queryString &&
				cargoHscodeList({ keyword: queryString }).then(response => {
					this.hscodeOptions = response.data.map(item => {
						return Object.assign(item, {
							label: item.cargoDesc,
							value: item.hscode
						})
					})
				})
		},
		// 二级分类列表
		queryChaptercode(queryString) {
			hscodeTypeList({ classCode: this.createdItem.classCode || '', name: queryString || '' }).then(res => {
				if (res.data) {
					let filterArr = res.data.filter(ele => ele.chapterCode)
					this.chapterCodeOptions = filterArr.map(item => {
						return Object.assign(item, {
							label: item.chapterName,
							value: item.chapterCode
						})
					})
				} else {
					this.chapterCodeOptions = []
				}
			})
		},
		init() {
			if (this.param.oid) {
				this.createdItem = { ...this.createdItem, ...this.param }
				// 为二级分类下拉赋值
				this.chapterCodeOptions = [{ label: this.param.chapterName, value: this.param.chapterCode }]
				let data = {
					oid: this.param.oid,
					type: 'hscode'
				}
				hscodeFileList(data).then(res => {
					this.createdItem.fileList = res.data
				})
			} else {
				this.createdItem = { ...defaultCreate }
				this.createdItem.fileList = [{ fileType: '', fileName: '', fileNo: '' }]
			}
		},

		close(action, value, isSpecial) {
			this.$emit('close', action, value, isSpecial)
		},

		// 弹窗关闭回调
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.apply.validate(valid => {
					if (valid) {
						let fileList = JSON.parse(JSON.stringify(this.createdItem.fileList))
						// 校验类型和附件只有一种的数据 不能提交
						if (fileList.some(item => (item.fileType && !item.fileName) || (!item.fileType && item.fileName))) {
							return this.$message.error('文件类型和附件模板必须同时有值')
						}
						// 过滤类型和文件同时为空的数据
						this.createdItem.fileList = fileList.filter(item => item.fileType && item.fileName)
						this.close('Confirm', this.createdItem)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.apply-form {
	/deep/ .cargo-file-table {
		td {
			border-right: 1px solid #dfe6ec !important;
		}
	}
}
</style>
