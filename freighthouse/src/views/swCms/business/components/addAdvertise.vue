<template>
    <el-dialog :title="option.type === 'add' ? '新增广告位配置': '编辑广告位配置'" :visible.sync="option.show" width="600px" :before-close="cancel">
        <el-form ref="form" :model="form" :rules="rules" inline label-width="80px" class="edit-form">
            <el-form-item label="标题" prop="title">
                <el-input v-model="form.title" maxlength="20" placeholder="请输入标题"></el-input>
            </el-form-item>
            <el-form-item prop="fileNo">
                <span slot="label">
                    <span class="span-box">
                        <span style="color: #ff1e2f; margin-right: 3px">*</span>
                        <span>封面图</span>
                    </span>
                </span>
                <el-input
                  v-model="form.fileNo"
                  style="position:absolute;right:0;top:0;width:1px;height:1px;opacity:0;"
                ></el-input>
                <FinanceUploadEmbed
                  :upload-api="uploadApi2"
                  :limit="1"
                  :width="416"
                  :acceptTypes="acceptTypes"
                  :fileListEdit="fileListEdit"
                  :defaultFileSize="defaultFileSize"
                  @send-res-file-list="sendResFileList"
                />
                <div style="color: #ff1e2f;" v-if="imageTipStatus">请上传封面图</div>
            </el-form-item>
            <el-form-item label="位置" prop="type">
                <el-select v-model="form.type" clearable filterable placeholder="请选择">
                  <el-option
                    v-for="(item, index) in dictMap['swMngAdvertiseType']"
                    :label="item.label"
                    :value="item.value"
                    :key="index"
                  >
                  </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="URL" prop="jumpUrl">
                <el-input v-model="form.jumpUrl" maxlength="200"></el-input>
            </el-form-item>
            <el-form-item label="生效时间" prop="time">
                <el-date-picker 
                    v-model="form.time" 
                    type="datetimerange" 
                    range-separator="至" 
                    start-placeholder="开始日期" end-placeholder="结束日期" 
                    :default-time="['00:00:00', '23:59:59']"
                    value-format="yyyy-MM-dd HH:mm:ss">
                </el-date-picker>
            </el-form-item>
        </el-form>
        <div slot="footer">
            <el-button @click="cancel" size="mini">取 消</el-button>
            <el-button type="primary" @click="submit" size="mini">确 定</el-button>
        </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import FinanceUploadEmbed from '@/views/swCms/components/financeUpload/financeUploadEmbed'
import { adSave } from '@/api/swcms/index'
export default {
  props: {
    option: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    FinanceUploadEmbed
  },
  data() {
    return {
      form: {
        type: '',
        title: '',
        jumpUrl: '',
        time: '',
        fileNo: '',
        name: '',
        filePath: ''
      },
      uploadApi2: '/base/webapi/file/upload',
      acceptTypes: ['jpg','jpeg','png'],
      defaultFileSize: 100,
      fileListEdit: [],
      rules: {
        type: { required: true, message: ' ', trigger: 'change' },
        jumpUrl: { required: true, message: ' ', trigger: 'change' },
        time: { required: true, message: ' ', trigger: 'change' }
      },
      imageTipStatus: false,
      cascaderList: [],
      groupList: []
    }
  },
  computed: {
    ...mapGetters(['dictMap'])
  },
  created() {
    Object.assign(this.form, this.option.data)
    if (this.option.type === 'edit') {
      this.form.time = [this.option.data.effectiveTime, this.option.data.expireTime]
      let obj = {
        fileNo: this.option.data.fileNo,
        name: this.option.data.name,
        filePath: this.option.data.filePath
      }
      this.fileListEdit.push(obj)
    }
  },
  methods: {
    cancel() {
      this.$parent.addOption.show = false
    },
    submit() {
        if (this.form.fileNo && this.form.fileNo !== '') {
           this.imageTipStatus = false
        } else {
           this.imageTipStatus = true
           return
        }
        this.$refs['form'].validate((valid) => {
            if (valid) {
                const { fileNo, name, filePath, jumpUrl, title, type, time } = this.form
                
                if (!(jumpUrl.slice(0, 7) === 'http://' || jumpUrl.slice(0, 8) === 'https://')) {
                  return this.$msgErrClose('URL必须以http://或者https://开头')
                }
                let data = {
                  jumpUrl,
                  title, 
                  type,
                  fileNo,
                  name,
                  filePath,
                  effectiveTime: time[0],
                  expireTime: time[1]
                }
                if (this.option.type === 'edit') {
                  data.adId = this.option.data.adId
                }
              adSave(data).then(res => {
                if (res.code === 0) {
                  let text = this.option.type === 'add' ? '新增广告位配置成功！' : '编辑广告位配置成功！'
                  this.$msgSucClose(text)
                }
                this.cancel()
                this.$parent.getData()
              }).catch(()=>{})
            }
        })
    },
    sendResFileList(val) {
      console.log(val, this.uploadParams2)
      if (val.length > 0) {
        this.imageTipStatus = false
      } else {
        this.imageTipStatus = true
      }
      this.form.fileNo = val && val.length > 0 ? val[0].fileNo : ''
      this.form.filePath = val && val.length > 0 ? val[0].filePath : ''
      this.form.name = val && val.length > 0 ? val[0].name : ''
    },
  },
}
</script>

<style lang="scss" scoped>
.edit-form {
  display: flex;
  flex-wrap: wrap;
  /deep/ .el-form-item {
    flex-basis: 90%;
    margin-right: 0;
    display: flex;
    margin-bottom: 15px;
    .el-form-item__content {
      flex: 1;
      .el-select,.el-cascader{
        width: 100%;
      }
      .el-date-editor {
        width: 100%;
        .el-range-separator {
           line-height: 18px;
           font-size: 12px;
        }
        .el-range-input {
            height: 18px !important;
            line-height: 18px !important;
            font-size: 12px;
            width: 44%;
        }
      }
    }
  }
}
</style>
