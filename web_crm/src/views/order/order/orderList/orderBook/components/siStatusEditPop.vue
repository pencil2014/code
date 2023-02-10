<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback" class="si-status-edit">
      <el-form ref="form" :label-suffix="'：'" label-width="130px" :model="form" >
         <el-row :gutter="10">
          <el-col :span="24">
             <el-form-item label="补料状态" required :show-message="false">
              <el-checkbox-group size="mini" v-model="form.isChecked">
                <el-checkbox size="mini" v-for="(item, index) in siStatus" :key="index" :label="item.key" :disabled="item.disabled">{{ item.label }}</el-checkbox>
              </el-checkbox-group>
             </el-form-item>
          </el-col>
          <el-col :span="12" v-if="barge">
             <el-form-item label="驳船船名" prop="bargeVessel" :required="requiredObd" :show-message="false">
               <el-input clearable size="mini" v-model="form.bargeVessel" placeholder="请输入"></el-input>
             </el-form-item>
          </el-col>
          <el-col :span="12" v-if="barge">
             <el-form-item label="驳船航次" prop="bargeVoyage" :required="requiredObd" :show-message="false">
               <el-input clearable size="mini" v-model="form.bargeVoyage" placeholder="请输入"></el-input>
             </el-form-item>
          </el-col>
          <el-col :span="12" v-if="barge">
             <el-form-item label="驳船预计开船时间" prop="bargeEtdTime" :required="requiredObd" :show-message="false">
               <elDatePickerLimit
                  :field="'bargeEtdTime'"
                  size="mini"
                  v-model="form.bargeEtdTime"
                  type="date"
                  style="width: 100%"
                  clearable
                  placeholder="请选择"
                  value-format="yyyy-MM-dd"
                />
             </el-form-item>
          </el-col>
           <el-col :span="12" v-if="barge">
             <el-form-item label="驳船实际开船时间" prop="bargeTdTime" :required="requiredObd" :show-message="false">
               	<elDatePickerLimit
                  :field="'bargeTdTime'"
                  noCanFuture
                  size="mini"
                  v-model="form.bargeTdTime"
                  type="date"
                  style="width: 100%"
                  clearable
                  placeholder="请选择"
                  value-format="yyyy-MM-dd"
                />
             </el-form-item>
          </el-col>
          <el-col :span="12">
             <el-form-item label="大船船名" prop="vessel" :required="requiredObd" :show-message="false">
               <el-input clearable size="mini" v-model="form.vessel" placeholder="请输入"></el-input>
             </el-form-item>
          </el-col>
          <el-col :span="12">
             <el-form-item label="大船航次" prop="voyage" :required="requiredObd" :show-message="false">
               <el-input clearable size="mini" v-model="form.voyage" placeholder="请输入"></el-input>
             </el-form-item>
          </el-col>
           <el-col :span="12">
             <el-form-item label="大船预计开船时间" prop="etdTime" :required="requiredObd" :show-message="false">
               <elDatePickerLimit
                  :field="'etdTime'"
                  size="mini"
                  v-model="form.etdTime"
                  type="date"
                  style="width: 100%"
                  clearable
                  placeholder="请选择"
                  value-format="yyyy-MM-dd"
                />
             </el-form-item>
          </el-col>
           <el-col :span="12">
             <el-form-item label="大船实际开船时间" prop="tdTime" :required="requiredObd" :show-message="false">
                <elDatePickerLimit
                  :field="'tdTime'"
                  noCanFuture
                  size="mini"
                  v-model="form.tdTime"
                  type="date"
                  style="width: 100%"
                  clearable
                  placeholder="请选择"
                  value-format="yyyy-MM-dd"
                />
             </el-form-item>
          </el-col>
          <el-col :span="12">
             <el-form-item label="大船预计到港时间" prop="etaTime" :required="requiredObd" :show-message="false">
               <elDatePickerLimit
                  :field="'etaTime'"
                  size="mini"
                  v-model="form.etaTime"
                  type="date"
                  style="width: 100%"
                  clearable
                  placeholder="请选择"
                  value-format="yyyy-MM-dd"
                />
             </el-form-item>
          </el-col>
          <el-col :span="12" v-if="requiredObd">
            <el-form-item label="取单客服(MBL)" prop="mblTakeEmployeeId" :required="requiredObd" :show-message="false">
              <el-select size="mini" clearable filterable remote v-model="form.mblTakeEmployeeId" style="width: 100%" placeholder="请选择"  :remote-method="employeeFilterMehod" @change="handleChangeEmployee">
                <el-option v-for="(o, index) in employeeOptions" :key="index" :label="o.label" :value="o.value">
                  {{ o.cname }}<em v-if="o.deptCode" style="color: #999;font-style: normal">({{ o.deptCname }})</em>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
         </el-row>
         <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="M单copy件" :required="requiredMCopy" :show-message="false">
                <el-upload
                  ref="uploadM"
                  drag
                  multiple
                  action="#"
                  :on-preview="handlePreview"
                  :before-upload="beforeUploadM"
                  :on-change="handleChangeFileM"
                  :before-remove="handleBeforeRemoveM"
                  :on-remove="handleRemoveM"
                  :file-list="mCopy.fileList"
                  :http-request="uploadFileM"
                  :disabled="uploadMCopyDisabled"
                  :auto-upload="false"
                >
                  <div class="upload-demo" >
                    <el-button type="text" size="mini" >上传</el-button>
                  </div>
                </el-upload>
                <el-progress v-show="mCopy.showProcess" :percentage="mCopy.processLength" :stroke-width="2"></el-progress>
             </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="obd提单" :required="requiredObd" :show-message="false">
              <el-upload
                ref="uploadObd"
                drag
                multiple
                action="#"
                :on-preview="handlePreview"
                :before-upload="beforeUploadObd"
                :on-change="handleChangeFileObd"
                :before-remove="handleBeforeRemoveObd"
                :on-remove="handleRemoveObd"
                :file-list="obd.fileList"
                :http-request="uploadFileObd"
                :disabled="uploadObdDisabled"
                :auto-upload="false"
              >
                <div class="upload-demo" >
                  <el-button type="text" size="mini">上传</el-button>
                </div>
              </el-upload>
              <el-progress v-show="obd.showProcess" :percentage="obd.processLength" :stroke-width="2"></el-progress>
             </el-form-item>
          </el-col>
         </el-row>
      </el-form>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { blSiInfo, blFileDelete, blSiSave, getFileBatchNo } from '@/api/order/bl.js'
import { baseDeptParticipants } from '@/api/base'
import { mapState } from 'vuex'
export default {
  props: {
    siStatusObj: {
      type: Object,
      default: () =>{
        return {}
      }
    },
    workAssign: {
			type: Array,
			default: () => []
		},
  },
  components: {
    BaseDialog,
  },
  data() {
    return {
      dialogConfig: {
        title: '变更补料状态',
        show: true,
        size: 'medium',
        width: "1120px",
        showBtns: true
      },
      // 补料状态复选框组
      siStatus: [
        {
          label: '船公司补料完成',
          key: 'siCheck',
          isChecked: false,
          value: 'n',
          disabled: false
        },
        {
          label: 'MBLcopy件单证确认',
          key: 'copySiCheck',
          isChecked: false,
          value: 'n',
          disabled: false
        },
        {
          label: '已收OBD提单',
          key: 'obdCheck',
          isChecked: false,
          value: 'n',
          disabled: false
        }
      ],
      timer: null,
      form: {
        isChecked: [],
        bargeVessel: '',
        bargeVoyage: '',
        bargeTdTime: '',
        bargeEtdTime: '',
        vessel: '',
        voyage: '',
        tdTime: '',
        etaTime: '',
        etdTime: '',
        mblTakeEmployeeId: ''
      },
      siInfo: {},
      mCopy: {
        showProcess: false,
        processLength: 0,
        file: '',
        fileList: [],
        fileData:'',
        defaultFileSize: 100,
        sizeLimit: true,
      },
      obd: {
        showProcess: false,
        processLength: 0,
        file: '',
        fileList: [],
        fileData:'',
        defaultFileSize: 100,
        sizeLimit: true,
      },
      timerTr: null,
      tcData: [],
      targetObj: {},
      employeeOptions: [],
    }
  },
  destroyed() {
    clearTimeout(this.timer)
    this.timer = null
    clearTimeout(this.timerTr)
		this.timerTr = null
  },
  created() {
    this.tcData = this.workAssign.filter(item => item.jobCode === 'tc')
    this.form.mblTakeEmployeeId = this.tcData.length ? this.tcData[0].employeeId : ''
    // 处理id等于0的情况
    this.form.mblTakeEmployeeId === 0 ? (this.form.mblTakeEmployeeId = null) : null
    this.init()
  },
  computed: {
    ...mapState({
			orderInfoDataObj: state => state.order.orderInfoDataObj
		}),
    barge() {
      return this.orderInfoDataObj && this.orderInfoDataObj.barge
    },
    ship() {
      return (this.orderInfoDataObj && this.orderInfoDataObj.ship) || {}
    },
    requiredObd() {
      return this.form.isChecked.includes('obdCheck')
    },
    requiredMCopy() {
      return this.form.isChecked.includes('copySiCheck')
    },
    uploadMCopyDisabled() {
      return this.siInfo.copyCheckStatus === 'submit' || this.siInfo.state === 'invalid'
    },
    uploadObdDisabled() {
      return (this.siInfo.copyCheckStatus === 'submit' && this.siInfo.takeApplyStatus === 'submit') || 
            (this.siInfo.takeApplyStatus === 'submit' && this.siInfo.isTakeFinish) || 
            this.siInfo.state === 'invalid'
    }
  },
  methods: {
    init() {
      blSiInfo({orderNo: this.$route.query.orderNo, oid: this.siStatusObj.siId})
      .then(res => {
        console.log('补料详情数据：', res.data)
        let data = res.data || {}
        this.siInfo = data
        if (this.barge) {
          this.form.bargeVessel = data.bargeVessel || ''
          this.form.bargeVoyage = data.bargeVoyage || ''
          this.form.bargeTdTime = data.bargeTdTime || ''
          this.form.bargeEtdTime = data.bargeEtdTime || ''
        }
        this.form.vessel = data.vessel || ''
        this.form.voyage = data.voyage || ''
        this.form.tdTime = data.tdTime || ''
        this.form.etaTime = data.etaTime || ''
        this.form.etdTime = data.etdTime || ''
        this.siStatus.forEach(item => {
          if (data[item.key] && data[item.key] === 'y') {
            this.form.isChecked.push(item.key)
            item.disabled = true
          }
        })
        let validsFile = (data.valids || []).map(item => {
          item['name'] = item.fileName
          return item
        })
        this.mCopy.fileList = validsFile.filter(item => {
          return item.fileType === 'mbl_copy'
        })
        this.obd.fileList = validsFile.filter(item => {
          return item.fileType === 'obd'
        })
      })
    },
    employeeFilterMehod(val) {
			if(val) {
				this.debounceLxz(() => {
					this.getEmployeeName(val)
				})
			} else {
				this.mapEmployeeOptions()
			}
		},
		handleChangeEmployee(val) {
			let sItem = this.employeeOptions.find(ele => ele.value === val)
      this.targetObj = sItem || {}
		},
		// 获取员工name
		getEmployeeName(val) {
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: 'tc'
			}
			baseDeptParticipants(data).then(res => {
				this.employeeOptions = res.data.map(item => {
					return Object.assign(item, {
						label: this.$language === 'en' ? item.ename : item.cname,
						value: item.employeeId
					})
				})
				this.mapEmployeeOptions()
			})
		},
		mapEmployeeOptions() {
			if (this.form.mblTakeEmployeeId && !this.employeeOptions.some(item => item.value === this.form.mblTakeEmployeeId)) {
				this.employeeOptions.push({
					...this.targetObj,
					label: this.targetObj.label || this.tcData[0].employeeName,
					value: this.form.mblTakeEmployeeId
				})
			}
		},
		debounceLxz(fn, time = 800) {
			clearTimeout(this.timerTr)
			this.timerTr = setTimeout(() => {
				if (!fn || !(fn instanceof Function)) {
					this.$message({ message: '参数错误！', type: 'error', showClose: true })
				} else {
					fn()
				}
			}, time)
		},
    debounceLs(fn, time = 800) {
			clearTimeout(this.timer)
			this.timer = setTimeout(() => {
				if (!fn || !(fn instanceof Function)) {
					this.$message({ message: '参数错误！', type: 'error', showClose: true })
				} else {
					fn()
				}
			}, time)
		},
    handlePreview(file) {
      let fileNos = file.fileNo.split(',')
      let fileNames = file.fileName.split(',')
      fileNos.forEach((item, index) => {
         this.$store.dispatch('order/previewFile', { fileNo: item, fileName: fileNames[index] })
      })
		},
    beforeUploadM(file) {
			this.mCopy.file = file
			this.mCopy.sizeLimit = file.size / 1024 / 1024 < this.mCopy.defaultFileSize
			if (!this.mCopy.sizeLimit) {
				this.$message.error('上传文件大小超过' + this.mCopy.defaultFileSize + 'M限制')
			}
			return this.mCopy.sizeLimit
		},
    handleChangeFileM(file, fileList) {
			this.mCopy.fileList = fileList
			console.log('this.mCopy.fileList：', this.mCopy.fileList)
      this.debounceLs(() => {
         this.requestMethod('mbl_copy')
      })
		},
    handleBeforeRemoveM(file, fileList) {
      if (!file.fileName) return true
      if (this.form.isChecked.includes('copySiCheck')) {
        this.$message.error('补料状态已选中MBLcopy件单证确认，不能删除！')
        return false
      }
      console.log('删除', file, fileList)
      this.$confirm('是否删除该条附件?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
         this.deleteFile(file, fileList)
      }).catch(() => {
         
      })
      return false
    },
    handleRemoveM(file, fileList) {
			this.mCopy.fileList = fileList
		},
    uploadFileM(file) {
      this.mCopy.fileData = new FormData()
			this.mCopy.fileData.append('fileName', file.file);
			//this.file = file.file
		},
    beforeUploadObd(file) {
			this.obd.file = file
			this.obd.sizeLimit = file.size / 1024 / 1024 < this.obd.defaultFileSize
			if (!this.obd.sizeLimit) {
				this.$message.error('上传文件大小超过' + this.obd.defaultFileSize + 'M限制')
			}
			return this.obd.sizeLimit
		},
    handleChangeFileObd(file, fileList) {
			this.obd.fileList = fileList
			console.log('this.obd.fileList：', this.obd.fileList)
       this.debounceLs(() => {
         this.requestMethod('obd')
      })
		},
    handleBeforeRemoveObd(file, fileList) {
      if (!file.fileName) return true
      if (this.form.isChecked.includes('obdCheck')) {
        this.$message.error('补料状态已选中已收OBD提单，不能删除！')
        return false
      }
      console.log('删除', file, fileList)
      this.$confirm('是否删除该条附件?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
         this.deleteFile(file, fileList)
      }).catch(() => {
         
      })
      return false
		},
    handleRemoveObd(file, fileList) {
			this.obd.fileList = fileList
		},
    uploadFileObd(file) {
      this.obd.fileData = new FormData()
			this.obd.fileData.append('fileName', file.file);
			//this.file = file.file
		},
    getFileName(fileType) {
      if (fileType === 'mbl_copy') {
        return this.mCopy.fileList.filter(item => {
          return !item.fileName
        })
      } else if (fileType === 'obd') {
        return this.obd.fileList.filter(item => {
          return !item.fileName
        })
      }
    },
    deleteFile(file, fileList) {
      let fileNos = file.fileNo.split(',')
      console.log('删除', fileNos)
      blFileDelete({
        fileNos,
        blId: this.siStatusObj.blId,
				orderNo: this.$route.query.orderNo,
      })
      .then(res => {
        this.$message.success('删除成功')
        this.init()
      })
    },
    requestMethod(fileType) {
      let sizeLimit = true
      if (fileType === 'mbl_copy') {
        this.$refs.uploadM.submit()
        sizeLimit = this.mCopy.sizeLimit
      } else {
        this.$refs.uploadObd.submit()
        sizeLimit = this.obd.sizeLimit
      }
			if (sizeLimit) {
        let fileName = this.getFileName(fileType)
        let params = {
          data: {
            blId: this.siStatusObj.blId,
            orderNo: this.$route.query.orderNo,
            fileType,
          },
          fileName
        }
        console.log('fileName的个数', fileName.length)
        if (fileName.length > 1) {
          getFileBatchNo({})
          .then(res => {
            let fileBatchNo = res.data || ''
            params.data['fileBatchNo'] = fileBatchNo
            this.blFileUpload(params)
          })
        } else {
          this.blFileUpload(params)
        }
        
			}
    },
    blFileUpload(params) {
      this.$store
        .dispatch('order/soUpload', {
          uri: '/order/blFile/upload',
          params
        })
        .then(res => {
          if (res === 'error') return
          this.$message({
            type: 'success',
            message: '导入成功'
          })
          this.init()
        })
    },
    getValue() {
      let data = {
        oid: this.siStatusObj.siId,
        orderNo: this.$route.query.orderNo,
        blId: this.siStatusObj.blId,
        blNo: this.siStatusObj.blNo
      }
      for (let key in this.form) {
        if (key !== 'isChecked') {
          data[key] = this.form[key]
        }
      }
      this.siStatus.forEach(item => {
        if (this.form.isChecked.includes(item.key)) {
          data[item.key] = 'y'
        } else {
          data[item.key] = 'n'
        }
      })
      return data
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        if (!this.form.isChecked.length) {
          this.$message.error('请选择补料状态')
          return
        }
        if (this.requiredObd && !this.obd.fileList.length) {
          this.$message.error('请上传obd提单')
          return
        }
        if (this.requiredMCopy && !this.mCopy.fileList.length) {
          this.$message.error('请上传M单copy件')
          return
        }
        this.$refs['form'].validate((valid) => {
          if (valid) {
             let params = this.getValue()
             blSiSave(params)
              .then(res => {
                this.$message.success('修改成功')
                this.close('Confirm')
              })
          }
        })
      } else {
        this.close('Cancel')
      }
    },
    close(action, value) {
      this.$emit('close', action, value)
    },
  },
}
</script>

<style lang="scss" scoped>
.si-status-edit {
  /deep/.el-checkbox__label {
    font-size: 12px !important;
  }
  /deep/.el-form-item__label {
    line-height: 22px !important;
  }
  /deep/.el-form-item__content{
    line-height: 22px !important;
  }
}
</style>