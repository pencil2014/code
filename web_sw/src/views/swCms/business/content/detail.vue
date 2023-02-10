<template>
  <div
    class="finance-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="content-box">
        <div class="top-cnt">
            <div class="top-box border">
            <div class="title">{{title}}</div>
            <div class="btn-box">
                <el-button type="primary" v-if="type !== 'detail'" size="mini" @click="submit">保存</el-button>
                <el-button type="default" size="mini" @click="back">返回</el-button>
            </div>
            </div>
        </div>
        <div class="form-wrap">
            <el-form ref="form" :model="form" :rules="rules" inline label-width="80px" class="edit-form">
              <div class="item-box">
                  <el-form-item label="标题" prop="title">
                    <el-input v-model="form.title" maxlength="30" placeholder="请输入标题" :disabled="type === 'detail'"></el-input>
                  </el-form-item>
                  <el-form-item label="分类" prop="type">
                    <el-select v-model="form.type" clearable filterable placeholder="请选择" :disabled="type === 'detail'">
                      <el-option
                        v-for="(item, index) in dictMap['swMngNewsType']"
                        :label="item.label"
                        :value="item.value"
                        :key="index"
                      >
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="关键词" prop="keywords">
                    <el-input v-model="form.keywords" maxlength="20" placeholder="多个关键词之间用;隔开" :disabled="type === 'detail'"></el-input>
                  </el-form-item>
                  <el-form-item
                      label="相关推荐"
                      prop="relevance"
                    >
                    <el-select
                      v-model="form.relevance"
                      placeholder="请选择"
                      multiple
                      collapse-tags
                      filterable
                      clearable
                      :disabled="type === 'detail'"
                      :filter-method="(val)=>{ getRelevance(val)}" 
                      @focus="(val)=>{ getRelevance('')}"
                    >
                      <el-option
                        v-for="(item, index) in relevanceList"
                        :key="index"
                        :label="item.title"
                        :value="item.newsId"
                      >
                      </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="是否热门" prop="isHot">
                    <el-select v-model="form.isHot" clearable filterable placeholder="请选择" :disabled="type === 'detail'">
                      <el-option
                        v-for="(item, index) in dictMap['swMngNewsHot']"
                        :label="item.label"
                        :value="item.value"
                        :key="index"
                      >
                      </el-option>
                    </el-select>
                  </el-form-item>
              </div>
              <div class="item-box">
                <el-form-item prop="fileNo">
                    <span slot="label">
                        <span class="span-box" style="width:80px; display:inline-block;">
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
              </div>
              <div>
                <el-form-item label-width="80px" prop="content" :show-message="false" class="tingymce-item">
                  <span slot="label">
                        <span class="span-box">
                            <span style="color: #ff1e2f; margin-right: 3px">*</span>
                            <span>内容</span>
                        </span>
                    </span>
                  <tinymce class="mail-sign-rich-text" :toolbar="tinymceConfig.toolbar" :menubar="tinymceConfig.menubar" v-model="form.content" :height="180" :width="tinymceWidth" ref="content" />
                </el-form-item>
              </div>
            </el-form>
        </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { mixin } from '@/views/finance/mixins/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { newsInfo, newsSave, newsList } from '@/api/swcms/index'
import FinanceUploadEmbed from '@/views/swCms/components/financeUpload/financeUploadEmbed'
import Tinymce from '../components/Tinymce'
export default {
  mixins: [mixin, mixin2],
  components: {
    FinanceUploadEmbed,
    Tinymce
  },
  data() {
    return {
      // 文本编辑配置
      tinymceConfig: {
				toolbar: ['undo redo | fontselect | fontsizeselect | forecolor backcolor bold italic underline strikethrough alignleft aligncenter alignright outdent indent table image removeformat hr charmap preview fullscreen'],
				menubar: ''
			},
      loading: false,
      dataSource: '',
      isGreen: false,
      title: '',
      form: {
        title: '',
        type: '',
        keywords: '',
        isHot: 'no',
        content: '',
        relevance: []
      },
      time: 'first',
      relevanceList: [],
      baseRelevanceList: [],
      imageTipStatus: false,
      uploadApi2: '/base/webapi/file/upload',
      acceptTypes: ['jpg','jpeg','png'],
      defaultFileSize: 100,
      fileListEdit: [],
      rules: {
        type: { required: true, message: ' ', trigger: 'change' },
        title: { required: true, message: ' ', trigger: 'change' },
        keywords: { required: true, message: ' ', trigger: 'change' }
      },
      tinymceWidth: '100%'
    }
  },
  created() {
    this.type = this.$route.query.type || 'add'
    if (this.type === 'add') {
        this.title = '新增内容咨询'
    } else if (this.type === 'edit') {
        this.title = '编辑内容咨询'
    } else {
        this.title = '内容咨询详情'
    }
    if (this.type === 'edit' || this.type === 'detail') {
      this.getInfo()
    }
  },
  computed: {
    ...mapGetters(['dictMapObj']),
  },
  methods: {
    getInfo() {
      this.loading = true
      let data = {
        newsId: this.$route.query.newsId,
      }
      newsInfo(data)
        .then((res) => {
          let { fileNo, name, filePath, title, type, keywords, isHot, content, relevanceList} = res.data
          this.form = {
            fileNo,
            name,
            filePath, 
            title,
            type,
            keywords,
            isHot,
            content,
            relevance: relevanceList.map(item => item.relNewsId)
          }
          let obj = {
            fileNo: res.data.fileNo,
            name: res.data.name,
            filePath: res.data.filePath
          }
          let arr = relevanceList.map(item => {
            return {
              newsId: item.relNewsId,
              oid: item.oid,
              title: item.relNewsTitle
            }
          })
          this.relevanceList = arr
          this.baseRelevanceList = arr
          this.fileListEdit.push(obj)
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    back() {
      this.$router.go(-1)
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
          if (this.form.content === '') {
            return this.$msgErrClose('请填写内容')
          }
          const { fileNo, name, filePath, title, type, keywords, isHot, content, relevance } = this.form
          let data = {
            title,
            type,
            keywords,
            isHot,
            content,
            fileNo,
            name,
            filePath
          }
          let relevanceArr = relevance.map(item => {
            let chooseItem = this.baseRelevanceList.find(i => i.newsId === item)
            return {
              oid: chooseItem && chooseItem.oid ? chooseItem.oid : '',
              newsId: Number(this.$route.query.newsId),
              relNewsId: item
            }
          })
          data.relevanceList = relevanceArr
          if (this.type === 'edit') {
            data.newsId = this.$route.query.newsId
          }
          newsSave(data)
            .then((res) => {
              if (res.code === 0) {
                this.$msgSucClose(`${this.title}成功!`)
                this.back()
                // this.getOrderInfo()
              }
            })
            .catch(() => {})
        }
      })
    },
    // 查询相关推荐isEnabled
    getRelevance(val = '') {
      let data = {
        currPage: 1,
        descColumns: ["createdTime"],
        query: [{column: "isEnabled", type: "eq", value: "yes"}],
        pageSize: 30
      }
      if (val !== '') {
        let obj = {
          column: "title",
          type: "like",
          value: val
        }
         data.query.push(obj)
      }
      newsList(data)
        .then((res) => {
          if (res.code === 0) {
            let { list } = res.data
            let data = list.map(item => {
              return {
                title: item.title,
                newsId: item.newsId
              }
            })
            if (this.type === 'edit') {
              data = data.filter(item => item.newsId !== Number(this.$route.query.newsId))
            }
            if (this.type === 'edit' && this.time === 'first') {
              for (let i = 0; i < this.relevanceList.length; i++) {
                let item = data.find(item => item.newsId === this.relevanceList[i].newsId)
                if (!item) {
                  data.push(this.relevanceList[i])
                }
              }
              this.relevanceList = data
              this.time = ''
            } else {
              this.relevanceList = data
            }
          }
        })
        .catch(() => {})
        .finally(() => {})
    },
    sendResFileList(val) {
      if (val.length > 0) {
        this.imageTipStatus = false
      } else {
        this.imageTipStatus = true
      }
      this.form.fileNo = val && val.length > 0 ? val[0].fileNo : ''
      this.form.filePath = val && val.length > 0 ? val[0].filePath : ''
      this.form.name = val && val.length > 0 ? val[0].name : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.content-box {
  .title {
    font-size: 12px;
    font-weight: bold;
    color: #222;
    line-height: 40px;
  }
  .border {
    border-bottom: 1px solid #f4f5f8;
  }
  .top-cnt {
    border-bottom: 8px solid #f4f5f8;
    padding: 10px 16px;
    .top-box {
      height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  .form-wrap {
    padding:10px 16px;
    .item-box {
      margin-top: 16px;
      width: 100%;
      display: flex;
      // justify-content: space-between;
      flex-wrap: wrap;
      .el-form-item {
        width: 32%;
        margin-right: 0; 
        display: flex;
        /deep/ .el-form-item__content {
          margin-right: 16px;
          margin-left: 5px;
          flex: 1;
          .el-select,
          .el-date-editor {
            width: 100%;
          }
        }
        /deep/.el-select__tags {
          width:100% !important;
        }
      }
    }
  }
}
</style>

<style>
.tingymce-item {
    width: 100%;
}
.tingymce-item .el-form-item__content {
    width: calc(96% - 100px);
}
</style>
