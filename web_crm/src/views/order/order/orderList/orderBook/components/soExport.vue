<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="soExportForm" :rules="rules" :model="createdItem" label-position="right" label-width="85px" class="soExport-form">
      <el-form-item label="SO附件" prop="fileType" :show-message="false">
        <el-row>
					<el-col :span="12" v-for="(item, index) in fileTypeOptions" :key="index">
						<el-radio @change="handleChangeFileType" size="mini" v-model="createdItem.fileType" :label="item.label">
							{{ item.txt }}
						</el-radio>
					</el-col>
				</el-row>
      </el-form-item>
      <template v-if="createdItem.fileType === 'QINGDAO'">
        <el-form-item label="船代" prop="chuandai" :show-message="false">
          <el-input type="text" size="mini" placeholder="请输入" clearable v-model="createdItem.chuandai"></el-input>
        </el-form-item>
        <el-form-item label="场站" prop="changzhan" :show-message="false">
          <el-input type="text" size="mini" placeholder="请输入" clearable v-model="createdItem.changzhan"></el-input>
        </el-form-item>
        <el-form-item label="场站联系人" prop="changzhanContact" :show-message="false">
          <el-input type="text" size="mini" placeholder="请输入" clearable v-model="createdItem.changzhanContact"></el-input>
        </el-form-item>
      </template>
      <template v-if="createdItem.fileType === 'NINGBO'">
        <el-form-item label="舱单网址" prop="url" :show-message="false">
          <el-input type="text" size="mini" placeholder="请输入" clearable v-model="createdItem.url"></el-input>
        </el-form-item>
      </template>
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import {bookSoUnbind} from '@/api/order/list'

const defaultCreate = {
  fileType: 'QINGDAO',
  chuandai: "",
  changzhan: '',
  changzhanContact: '',
  url: ''
}

export default {
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '输出SO',
        show: true,
        size: 'medium',
        width: "460px"
      },
      createdItem: Object.assign({}, defaultCreate),
      rules: {},
      QINGDAO_rules: {
        fileType: [{required: true, message: '请选择SO附件', trigger: 'change'}],
        chuandai: [{required: true, message: '请输入船代', trigger: 'blur'}],
        changzhan: [{required: true, message: '请输入场站', trigger: 'blur'}],
        changzhanContact: [{required: true, message: '请输入场站联系人', trigger: 'blur'}]
      },
      NINGBO_rules: {
        fileType: [{required: true, message: '请选择SO附件', trigger: 'change'}],
        url: [{required: true, message: '请输入舱单网址', trigger: 'blur'}],
      },
      fileTypeOptions: [
				{ label: 'QINGDAO', txt: '青岛格式' },
				{ label: 'NINGBO', txt: '宁波格式' }
			],
    }
  },
  props: {
    soExportParam: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    if(this.createdItem.fileType === 'QINGDAO') {
      this.rules = this.QINGDAO_rules
    } else {
      this.rules = this.NINGBO_rules
    }
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap
    }),
  },
  watch: {
  },
  components: {
    BaseDialog
  },
  methods: {
    handleChangeFileType(val) {
      this.$refs.soExportForm.clearValidate()
      if(this.createdItem.fileType === 'QINGDAO') {
        this.rules = this.QINGDAO_rules
      } else {
        this.rules = this.NINGBO_rules
      }
			console.log('🚀 ~ val', val)
		},
    close(action) {
      this.$emit('close', action)
    },
    handleSelectReason(val) {
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.soExportForm.validate((valid) => {
          if (valid) {
            this.handleExport(done)
          } else {
            console.log('error submit!!');
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    },
    // 输出
    handleExport(done){
      let txt = this.createdItem.fileType === 'QINGDAO' ? '入货通知' : '放舱通知'
      let query = this.createdItem.fileType === 'QINGDAO' ? {
        chuandai: this.createdItem.chuandai,
        changzhan: this.createdItem.changzhan,
        changzhanContact: this.createdItem.changzhanContact
      } : {
        url: this.createdItem.url
      }
			let params = {
        ...this.soExportParam,
        fileType: this.createdItem.fileType,
				param: query
			}
			this.$store.dispatch('order/exportBlobFile', {
        uri: '/order/shiporder/book/so/export',
        data:params
      }).then(res => {
        console.log(res)
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(res)
        link.download = `${params.so}${txt}` + '.' + params.docType.toLowerCase()
        link.click()
        this.close('Confirm')
      })
    }
  }
};
</script>

<style lang="scss">
.soExport-form{
  .el-form-item{
    margin-bottom: 4px !important;
  }
  .el-form-item__label, .el-form-item__content{
    line-height: 20px;
  }
}
</style>
