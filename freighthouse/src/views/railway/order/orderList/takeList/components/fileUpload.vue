<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="uploadFileForm" :model="createdItem" :rules="rules" label-position="right" label-width="120px" class="create-form">
			<el-form-item v-if="oQuery.blNo" >
				 <template slot="label">
					 <div>{{getLabel()}}</div>
				 </template>
                 <div class="fz-class">{{oQuery.blNo}}</div>
			</el-form-item>
			<el-form-item label="提单纸编码：" porp="pageCodes" required>
       <div class="page-class">
         <div class="row" v-for="(item,index) in createdItem.pageCodes" :key="index">
           <div class="left">
              <el-input-number 
                 v-model="item.start"
                 size="mini" 
                 :controls="false" 
                 :precision='0' 
                 :max="item.end"
                 >
              </el-input-number>
              <div class="middle-class">-</div>
               <el-input-number 
                 v-model="item.end"
                 size="mini" 
                 :controls="false" 
                 :precision='0' 
                 :min="item.start" 
               >
              </el-input-number>
           </div>
           <div class="right">
             <i @click="add" v-show="index === 0" class="icon-class el-icon-circle-plus-outline" />
             <i @click="remove(index)" v-show="createdItem.pageCodes.length > 1" class="icon-class el-icon-remove-outline" />
           </div>
         </div>
       </div>
     </el-form-item>
			<el-form-item label="正本页数：" prop="pages" :show-message="false">
				<el-input v-model="createdItem.pages" maxlength="9" size="mini" @blur="pagesBlur(createdItem.pages)"></el-input>
			</el-form-item>
			<el-form-item label="附件类型：" prop="fileType">
				<el-select size="mini" placeholder="请选择" v-model="createdItem.fileType" clearable filterable style="width: 100%;">
					<el-option v-for="(item, index) in blFileTypeOptions" :key="index" :label="item.label" :value="item.value"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="上传附件：">
				<el-upload ref="upload" drag class="upload-file-cont" action="#" :multiple="true" :auto-upload="false" :before-upload="getFile" :on-change="handleChangeFile" :on-remove="handleRemove" :file-list="fileList">
					<div class="file-upload">
						<img class="file-upload-img" :src="require('@/assets/icon-upload.png')" />
						<div class="file-upload__text">
							<div class="txt">点击或将文件拖拽到这里导入</div>
							<p class="info">支持 doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar 格式文件， 且文件大小限制在100M内</p>
						</div>
					</div>
				</el-upload>
				<el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import { getDocTypeName } from '@/api/order/bl'
import { getFileBatchNo } from '@/api/order/bl'
export default {
	filters: {},
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '附件上传',
				show: true,
				size: 'medium',
				width: '600px'
			},
			canSubmit: true, // 可提交标识
			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			file: '',
			fileList: [],
			showProcess: false,
			processLength: 0,
			rules: {
				pages: [
					{ required: true, trigger: 'blur'},
				],
				fileType: [{ required: true, message: '请选择附件类型', trigger: 'change' }]
			},
			createdItem: {
				orderNo: '',
				pages: '',
				pageCodes: [
					{
						start: undefined,
						end: undefined,
					}
				],
				fileName: '',
				oid: '',
				fileType: ''
			},
			blFileTypeOptions: [{ label: 'M单正本', value: 'mbl_original' }]
		}
	},
	props: {
		// param: {
		//   type: Object,
		//   default: () => ({})
		// },
	},
	created() {
		console.log('tradeDocName', this.dictMap.tradeDocName)
		this.getFileTypeOption()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid,
			role: state => state.user.role
		})
	},
	components: {
		BaseDialog
	},
	watch: {},
	methods: {
		pagesBlur(val) {
			if (val) {
         let reg = /^[1-9]\d*$/
         if (!reg.test(val)) {
           this.$message.error('正本页数必须输入正整数')
           this.createdItem.pages = ''
				 }
			}
		},
		validtor() {
      if (this.createdItem.pageCodes.some(item => !item.start || !item.end)) {
        return false
      } else {
        return true
      }
    },
		add() {
			if (!this.validtor()) {
        this.$message.error('提单纸编码不能有空值!')
        return
      }
      this.createdItem.pageCodes.push({
        start: undefined,
        end: undefined,
      })
    },
    remove(index) {
      this.createdItem.pageCodes.splice(index, 1)
    },
		getLabel() {
		   let labelName = ''
           switch (this.oQuery.routerName) {
				case 'RailwayMblTakeList':
					labelName = 'M单号：'
					break
			    case 'RailwayHblTakeList':
					labelName = "H单号："		
				default:
					break
			}
			return labelName
		},
		getFileTypeOption() {
			switch (this.oQuery.routerName) {
				case 'RailwayHblTakeList':
					this.blFileTypeOptions = [{ label: 'HBL单正本', value: 'hbl_original' }]
					break
				case 'RailwayMblTakeList':
					this.blFileTypeOptions = [{ label: 'M单正本', value: 'mbl_original' }]
					break
				default:
					break
			}
		},
		close(action, value) {
			this.$emit('close', action, value)
		},
		validate() {
			if (!this.fileList.length) {
				this.$message({
					type: 'error',
					message: '请先上传附件',
					duration: 1000,
					onClose: () => {}
				})
				return false
			}
			return true
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.uploadFileForm.validate(valid => {
					if (valid) {
						if (!this.validate() || !this.canSubmit) return
						this.handleImport()
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		// 上传前钩子获取file名
		getFile(file) {
			this.file = file
			this.sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
			if (!this.sizeLimit) {
				this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制')
			}
			return this.sizeLimit
		},
		// 新添加文件替换之前添加的文件
		handleChangeFile(file, fileList) {
			// this.fileList = []
			this.fileList = fileList
		},
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		handleImport(done) {
			let params = {
				data: {
					pageCodes: this.createdItem.pageCodes,
					pages: this.createdItem.pages,
					blId: this.$route.query.blId,
					blNo: this.$route.query.blNo,
					orderNo: this.$route.query.orderNo,
					fileType: this.createdItem.fileType
				},
				fileName: this.fileList
			}
			if (this.fileList.length > 1) {
				getFileBatchNo().then(res => {
					params.data.fileBatchNo = res.data
					if (this.sizeLimit) {
						this.canSubmit = false
						this.handleProgress()
						this.$store
							.dispatch('order/soUpload', {
								uri: '/order/blFile/upload',
								params: params
							})
							.then(res => {
								this.processLength = 100
								this.showProcess = false
								this.fileList = []
								this.canSubmit = true
								if (res === 'error') return
								this.$message({
									type: 'success',
									message: '导入成功',
									duration: 1000,
									onClose: () => {
										this.close('Confirm')
									}
								})
							})
					}
				})
			} else {
				params.data.fileBatchNo = ''
				if (this.sizeLimit) {
					this.canSubmit = false
					this.handleProgress()
					this.$store
						.dispatch('order/soUpload', {
							uri: '/order/blFile/upload',
							params: params
						})
						.then(res => {
							this.processLength = 100
							this.showProcess = false
							this.fileList = []
							this.canSubmit = true
							if (res === 'error') return
							this.$message({
								type: 'success',
								message: '导入成功',
								duration: 1000,
								onClose: () => {
									this.close('Confirm')
								}
							})
						})
				}
			}
		},

		// 上传进度条
		handleProgress(file, fileList) {
			this.processLength = 0
			this.showProcess = true
			const interval = setInterval(() => {
				if (this.processLength >= 99) {
					clearInterval(interval)
					return
				}
				this.processLength += 1
			}, 200)
		}
	}
}
</script>
<style lang="scss" scoped>
.create-form {
	/deep/.el-form-item__label {
		text-align: right !important;
	}
	 /deep/input,  select, .el-range-editor--mini.el-input__inner,  .el-input__icon,  .el-cascader--mini{
		height: 20px !important;
		line-height: 20px !important;
	 }
	 /deep/.el-form-item__label {
		line-height: 20px !important;
	 }
	 /deep/.el-form-item__content {
		line-height: 20px !important;
	 }
	 /deep/.el-input--mini .el-input__icon {
		line-height: 20px !important;
	 }
	.fz-class {
		font-size: 12px;
	}
	.page-class {
    .row {
      display: flex;
      .left {
        display: flex;
        flex: 1;
        justify-content: space-between;
        /deep/.el-input-number {
          width: 48%;
        }
      }
      .right {
        width: 60px;
        text-align: center;
        display: flex;
        justify-content: space-around;
        align-items: center;
        .icon-class {
          cursor: pointer;
        }
      }
    }
    .row+.row {
      margin-top: 5px;
    }
  }
}
 
</style>
