<template>
	<div>
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<el-form ref="createSoForm" :rules="rules" :model="createItem" label-position="right" label-width="90px" class="agent-createSo-form">
				<div class="soInfo-tit">
					<div class="tit">报关信息</div>
				</div>
				<el-row class="mt10">
					<el-col :span="5">
						<el-form-item label="报关方式" prop="customsType" required :show-message="false">
							<el-select size="mini" v-model="createItem.customsType" style="width: 100%" clearable placeholder="请选择">
								<el-option v-for="item in dictMap.customsType" :key="item.value" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="5">
						<el-form-item label="正报几票" prop="customsNumber" required :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model.number="createItem.customsNumber" clearable @blur="inputBlur('customsNumber')"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="意向供应商" prop="customsSupplierId" :show-message="false">
							<el-select size="mini" filterable remote v-model="createItem.customsSupplierId" style="width: 100%" :remote-method="supplierFilterMehod" @change="supplierChange" clearable placeholder="请选择">
								<el-option v-for="item in supplierOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="买单意向价格" prop="customsPrice" :show-message="false">
              <el-input size="mini" v-model="createItem.customsPrice" placeholder="请输入" style="width: 60%;"  clearable  @blur="inputBlur('customsPrice')"></el-input>
							<el-select size="mini" v-model="createItem.customsUnit" style="width: 40%;" clearable placeholder="请选择币种">
								<el-option v-for="item in currencyList" :label="item.code" :value="item.code" :key="item.code"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="报关备注" prop="remark" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="createItem.remark" clearable maxlength="512" show-word-limit></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<div class="soInfo-tit mt10">
					<div class="tit">箱号信息</div>
					<div class="operate">
						<el-button type="primary" size="mini" @click="addCn">新增箱号</el-button>
					</div>
				</div>
				<el-table fit border style="width: 100%" :data="tableData" class="table-cont mt10" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
					<el-table-column type="index" label="序号" align="center" width="50"> </el-table-column>
					<el-table-column prop="cn" label="箱号" align="center" width="230">
						<template slot-scope="scope">
							<el-select size="mini" v-model="scope.row.cn" class="multiple-select" style="width: 100%" multiple collapse-tags clearable placeholder="请选择" @change="handleChangeCn(scope.row.cn, scope.row)">
								<el-option v-for="(ele, index) in cnList" :key="ele.cn + index" :label="ele.cn" :value="ele.cn" :disabled="cnDisabledFunc(ele, scope.row.cn, scope.$index)"></el-option>
							</el-select>
						</template>
					</el-table-column>
					<el-table-column prop="so" label="SO号" align="center" width="300"> </el-table-column>
					<el-table-column label="附件名称" align="center">
						<template slot-scope="scope">
							<!-- <div>
              <div class="file-row" v-if="scope.row.fileName.length">
                <div v-for="(item, index) in scope.row.fileName" :key="'file'+index" class="file-name">
                  <el-button type="text" size="mini" @click="handleViewFile(item)">{{item.name}}</el-button>
                  <i class="el-icon-close" @click="handleDeleteFile(item.oid, scope.row)"></i>
                </div>
              </div>
              <el-upload
                ref="upload"
                class="upload-file-cont"
                action="#"
                :multiple="true"
                :auto-upload="false"
                :before-upload="(file) => getFile(file)"
                :on-change="(file, fileList) => handleChangeFile(file, fileList, scope.row)"
                :on-remove="(file, fileList) => handleRemove(file, fileList, scope.row)"
                :file-list='scope.row.fileList'
                >
                  <el-button slot="trigger" type="default" size="mini">选择文件</el-button>
              </el-upload>
              <el-progress v-show="scope.row.showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
            </div> -->
							<el-button type="text" size="mini" @click="handleUploadFile(scope.row, scope.$index)">上传</el-button>
							<el-button type="text" :disabled="!(tableData[scope.$index].fileName && tableData[scope.$index].fileName.length)" size="mini" @click="handleViewFiles(scope.row, scope.$index)">查看{{getNum(scope.$index)}}</el-button>
						</template>
					</el-table-column>
					<el-table-column label="操作" align="center" width="80">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button class="red" type="text" size="mini" @click="handleDeleteCn(scope.row, scope.$index)">删除</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
				<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
			</el-form>
		</BaseDialog>
		<div v-if="popFileShow">
			<PopFile :tableData="fileList" @delFile="delFileFn" @close="popFileClose" showDelBtn />
		</div>
		<div v-if="uploadPopShow">
			<FileUpload @close="uploadPopClose" />
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
// import { blDeliveryCancel } from '@/api/order/bl'
// import { getDomesticCity } from '@/api/base'
import { orderBookInfo, orderContainerList } from '@/api/order/list'
import { randomString } from '@/utils'
import tableTooltip from '@/components/Base/Table/table-tooltip'
import PopFile from './popFile'
import FileUpload from './fileUpload'
import { feeClassSelectList } from '@/api/base'
import { supplierList } from '@/api/crm/supplier'
import { baseCurrencyList } from '@/api/base'

const defaultCreate = {
	customsType: '',
	customsNumber: '',
  customsSupplierId: '',
  customsSupplierName: '',
  customsPrice: '',
  customsUnit: '',
	remark: ''
}

export default {
	data() {
		return {
			columnIndex: '',
			fileList: [],
			popFileShow: false,
			uploadPopShow: false,
			oQuery: this.$route.query,
			dialogConfig: {
				title: '新增委派信息',
				show: true,
				size: 'medium',
				width: '1120px'
			},
			createItem: Object.assign({}, defaultCreate),
			rules: {},
			cnList: [],
			defaultRowItem: {
				cn: [],
				so: '',
				fileName: [],
				fileNo: [],
				showProcess: false
			},
			tableData: [],
			defaultFileSize: 100, //文件默认不超过100M
			file: '',
			fileList: [],
			sizeLimit: true,
			fileData: '',
			// showProcess:false,
			processLength: 0,
			canSubmit: true, // 可提交标识
			tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
			},
			interval: null,
			supplierOptions: [],
      currencyList: []
		}
	},
	props: {
		IntrustTableData: {
			type: Array,
			default: () => []
		}
	},
	created() {
		this.tableData = []
		this.getCnList()
    this.getCurrencyList()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	watch: {},
	components: {
		BaseDialog,
		tableTooltip,
		PopFile,
		FileUpload
	},
	methods: {
		getNum(index) {
			if (this.tableData[index].fileName && this.tableData[index].fileName.length) {
				return `(${this.tableData[index].fileName.length})`
			} else {
				return ''
			}
		},
		getCurrencyList(queryString) {
      // 币别下拉列表
			baseCurrencyList(queryString, 'valid').then(response => {
				this.currencyList = response.data
			})
		},
		supplierFilterMehod(val) {
			if (val) {
				const data = {
					currPage: 1,
					pageSize: 10,
					descColumns: ['supplierId'],
					query: [
						{	column: 'serviceCode', type: 'eq', value: 'pol_declaration'	},
						{ column: 'name', type: 'like', value: val }
					],
					verifyStatus: 'all'
				}
				supplierList(data).then(res => {
					if (res.data.list) {
						this.supplierOptions = res.data.list.map(item => {
							return {
								label: item.name,
								value: item.supplierId
							}
						})
					}
				})
			}
		},
    supplierChange(val) {
       let obj = this.supplierOptions.find(item => {
         return item.value === val
       })
       this.createItem.customsSupplierName = (obj && obj.label) || ''
    },
		delFileFn(index) {
			this.fileList.splice(index, 1)
		},
		handleUploadFile(row, index) {
			this.columnIndex = index
			this.uploadPopShow = true
		},
		handleViewFiles(row, index) {
			this.fileList = this.tableData[this.columnIndex].fileName
			this.popFileShow = true
		},
		popFileClose() {
			this.popFileShow = false
		},
		uploadPopClose(action, data) {
			console.log(data)
			this.uploadPopShow = false
			this.tableData[this.columnIndex].fileName = [...this.tableData[this.columnIndex].fileName, ...data]
		},
		// 选中后的箱号不可选
		cnDisabledFunc(ele, rowCn, rowIndex) {
			return false
			// // console.log('ele', ele.cn, rowIndex, rowCn)
			// // console.log('this.tableData', this.tableData)
			// let cnArr = this.tableData.map(item => item.cn && item.cn.join()).join().split(',')
			// return cnArr.includes(ele.cn) && !rowCn.includes(ele.cn)
		},
		// 鼠标移入cell
		showTooltip(row, column, cell) {
			this.tableCellMouse.cellDom = cell
			this.tableCellMouse.row = row
			this.tableCellMouse.hidden = false
		},
		// 鼠标移出cell
		hiddenTooltip() {
			this.tableCellMouse.hidden = true
		},
		// 获取cn列表
		getCnList() {
			orderContainerList({
				orderNo: this.oQuery.orderNo,
				jointNo: this.oQuery.jointNo
			}).then(res => {
				this.cnList = res.data.filter(item => item.cn)
				// let hasCnArr = this.IntrustTableData.map(item => item.cn).join(',').split(',')
				// // console.log(hasCnArr)
				// this.cnList = res.data.filter(item => item.cn && !hasCnArr.includes(item.cn))
				// console.log('this.cnList', this.cnList)
			})
		},
		// 新增箱号
		addCn() {
			this.tableData.push({
				cn: [],
				so: '',
				fileName: [],
				fileNo: [],
				showProcess: false
			})
		},
		// 删除箱号
		handleDeleteCn(row, sIndex) {
			this.tableData = this.tableData.filter((item, index) => index !== sIndex)
		},
		// 选择箱号
		handleChangeCn(val, row) {
			console.log(val, this.cnList)
			let soArr = this.cnList.filter(item => val.includes(item.cn)).map(item => item.so)
			let containerIdArr = this.cnList.filter(item => val.includes(item.cn)).map(item => item.oid)
			console.log('soArr', soArr, containerIdArr)
			row.so = soArr.toString()
			row.containerId = containerIdArr.toString()
			// row.containerId =
		},
		// 上传前钩子获取file名
		getFile(file) {
			this.file = file
			let sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
			if (!sizeLimit) {
				this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制')
			}
			return sizeLimit
		},
		// 新添加文件替换之前添加的文件
		handleChangeFile(file, fileList, row) {
			row.fileList = fileList
			this.file = file
			this.handleImport(row)
			console.log('row.fileList', this.file, row.fileList)
		},
		// 移除文件
		handleRemove(file, fileList, row) {
			row.fileList = fileList
		},
		// uploadFile(file, row) {
		//   // this.fileData.append('fileName', file.file);
		//   row.fileList = []
		//   row.fileList.push(file.file)
		//   // this.handleImport(row)
		// },
		// 上传进度条
		handleProgress(row) {
			this.processLength = 0
			row.showProcess = true
			this.interval = setInterval(() => {
				if (this.processLength >= 99) {
					clearInterval(this.interval)
					return
				}
				this.processLength += 1
			}, 200)
		},
		handleImport(row) {
			if (!row.fileList || !row.fileList.length) {
				return this.$message({
					type: 'error',
					message: '请选择文件',
					duration: 1000
				})
			}
			// 根据后台需求数据格式
			let params = {
				data: {
					orderNo: this.$route.query.orderNo
				},
				fileName: row.fileList
			}
			// this.$refs.upload.submit()
			if (this.sizeLimit) {
				this.handleProgress(row)
				this.canSubmit = false
				this.$store
					.dispatch('order/soUpload', {
						uri: '/order/shipping/customs/file/upload',
						params: params
					})
					.then(res => {
						this.processLength = 100
						row.showProcess = false
						row.fileList = []
						this.canSubmit = true
						if (res.data.code === 0) {
							this.$message({ type: 'success', message: '导入成功' })
							let { data } = res.data
							row.fileName = row.fileName.concat(data)
							console.log('row.fileName', row.fileName)
						}
					})
					.catch(err => {
						clearInterval(this.interval)
						this.interval = null
						this.processLength = 0
						this.showProcess = false
						row.fileList = []
						this.canSubmit = true
					})
			}
		},
		handleViewFile(item) {
			this.$store.dispatch('order/previewFile', {
				fileNo: item.fileNo,
				fileName: item.name
			})
		},
		handleDeleteFile(oid, row) {
			row.fileName = row.fileName.filter(item => item.oid !== oid)
		},
		close(action, value) {
			this.$emit('close', action, value)
		},
    inputBlur(param) {
      if (param === 'customsNumber') {
        let numberReg = /^[0-9]+$/
        if (this.createItem[param] && !numberReg.test(this.createItem[param])) {
          this.$message({ type: 'error', message: '正报几票请输入数字' })
          this.createItem[param] = ''
        }
      } else if (param === 'customsPrice') {
        if (this.createItem[param] && !Number(this.createItem[param])) {
          this.$message({ type: 'error', message: '买单意向价格请输入数字' })
          this.createItem[param] = ''
        } else if (this.createItem[param] && Number(this.createItem[param])) {
          this.createItem[param] = Number(this.createItem[param]).toFixed(2)
        }
      }
    },
		validate() {
			let numberReg = /^[0-9]+$/
			let { customsNumber, customsPrice, customsUnit } = this.createItem
			if (customsNumber && !numberReg.test(customsNumber)) {
				this.$message({ type: 'error', message: '正报几票请输入数字' })
				return false
			}
       if (customsPrice && !customsUnit) {
        this.$message({ type: 'error', message: '请选择币种' })
				return false
      }
			if (!this.tableData.length || this.tableData.some(item => !item.cn.length)) {
				this.$message({ type: 'error', message: '请填写箱号信息' })
				return false
			}
			// if (this.tableData.some(item => !item.cn)) {
			// 	this.$message({ type: 'error', message: '请填写箱号信息' })
			// 	return false
			// }
			return true
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.createSoForm.validate(valid => {
					if (valid) {
						console.log('this.tbaleData', this.tableData)
						if (!this.validate()) return
						let data = this.getParamsData()
						this.close('Confirm', data)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		// 关闭弹窗后的传参处理
		getParamsData() {
			let result = []
			let createTime = new Date().getTime()
			let mergeId = `${new Date().getTime()}${randomString()}`
			console.log('this.tableData', this.tableData)
			this.tableData.forEach(item => {
				let fileName = (item.fileName || []).map(ele => ele.name)
				let fileNo = (item.fileName || []).map(ele => ele.fileNo)
				let typeCode = (item.fileName || []).map(ele => ele.typeCode)
				let typeName = (item.fileName || []).map(ele => ele.typeName)
				result.push({
					...this.createItem,
          customsUnit: this.createItem.customsPrice ? this.createItem.customsUnit : '',
					cn: item.cn.toString(),
					so: item.so,
					fileName: fileName.toString(),
					fileNo: fileNo.toString(),
					typeCode: typeCode.toString(),
					typeName: typeName.toString(),
					containerId: item.containerId,
					createTimeStr: createTime,
					mergeId: mergeId // 添加mergeId参数，做单元格合并判断用
					// fileList: item.fileName
				})
				console.log('typeCode', typeCode, typeName)
			})
			console.log('result', result)
			return result
		}
	}
}
</script>

<style>
.agent-createSo-form {
	padding: 0;
}
.agent-createSo-form .soInfo-tit {
	font-size: 12px;
	line-height: 20px;
	display: flex;
	justify-content: space-between;
}
.agent-createSo-form .so-container-list {
	display: flex;
	margin: 8px 0;
}
.agent-createSo-form .so-container-list .so-list {
	width: 100%;
	display: flex;
	padding: 4px 8px 0;
}
.so-list {
	border-radius: 2px;
	border: 1px solid #e9e9e9;
}
.agent-createSo-form .soInfo-tit .tit {
	font-size: 12px;
	line-height: 20px;
	font-weight: bold;
}
.agent-createSo-form .soInfo-tit .el-button--mini {
	line-height: 20px;
}
.agent-createSo-form .el-form-item {
	margin-bottom: 4px;
}
.agent-createSo-form .containerType-list {
	display: inline-block;
	margin-left: 8px;
	margin-bottom: 4px;
}
.agent-createSo-form .range {
	display: inline-block;
	width: 20px;
	text-align: center;
}
.agent-createSo-form .el-icon-circle-plus-outline,
.agent-createSo-form .el-icon-remove-outline {
	font-size: 15px;
	margin-left: 5px;
}
.agent-createSo-form .el-form-item__label {
	padding-right: 5px;
	line-height: 20px;
	/* height: 20px; */
}
.agent-createSo-form .el-form-item__content {
	line-height: 20px;
	/* height: 20px; */
}
.agent-createSo-form .file-row {
	display: flex;
	flex-wrap: wrap;
	margin-bottom: 5px;
	/* border: 1px solid #e9e9e9; */
}
.agent-createSo-form .file-row .file-name {
	margin-right: 10px;
}
.agent-createSo-form .file-row .file-name .el-button--mini {
	padding: 0;
}
.agent-createSo-form .file-row .file-name .el-icon-close {
	margin-left: 4px;
	cursor: pointer;
}
.agent-createSo-form .upload-file-cont {
	text-align: left;
	width: 300px;
}
.agent-createSo-form .upload-file-cont .el-upload {
	width: auto;
}
.agent-createSo-form .table-cont td {
	border-right: 1px solid #dfe6ec !important;
}
/* .agent-createSo-form .table-cont .multiple-select input{
  height: auto !important;
  line-height: auto !important;
} */
</style>
