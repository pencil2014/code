<template>
  <div class="hbl-page-detail">
    <div class="header">
      <div class="title">提单纸详情</div>
      <div class="btn-class">
        <el-button type="default" size="mini" @click="goBack">返回</el-button>
        <el-button v-if="form.paperStatus !== 'invalid' && isSameCompany" type="primary" size="mini" @click="handleInvalid">作废</el-button>
        <el-button :disabled="!isSameCompany" type="primary" size="mini" :loading="saveLoading" @click="handleSave">保存</el-button>
      </div>
    </div>
    <div class="row-class">
      <div class="title">基本信息</div>
      <div class="info-class">
        <div class="item">
          <div class="key">提单纸编码：</div>
          <!-- <div class="value" v-if="form.paperStatus === 'unuse'">
            <el-input-number 
                 v-model="form.paperCode"
                 size="mini"
                 :controls="false" 
                 :precision='0'  
                 placeholder="请输入"
             >
             </el-input-number>
          </div> -->
          <div class="value">{{ form.paperCode }}</div>
        </div>
        <div class="item">
          <div class="key">提单纸状态：</div>
          <div class="value">{{ form.paperStatus | getDictLabelFilter('blPaperStatus') }}</div>
        </div>
        <div class="item">
          <div class="key">转移状态：</div>
          <div class="value">{{ form.transferStatus | getDictLabelFilter('blPaperTransferStatus')  }}</div>
        </div>
        <div class="item">
          <div class="key key-120">提单纸所在分公司：</div>
          <div class="value value-120">{{ form.companyName }}</div>
        </div>
        <div class="item">
          <div class="key">创建人：</div>
          <div class="value">{{ form.createdName }}</div>
        </div>
        <div class="item">
          <div class="key">创建时间：</div>
          <div class="value">{{ form.createdTime }}</div>
        </div>
        <div class="item">
          <div class="key">更新人：</div>
          <div class="value">{{ form.updatedName }}</div>
        </div>
        <div class="item">
          <div class="key key-120">更新时间：</div>
          <div class="value value-120">{{ form.updatedTime }}</div>
        </div>
        <div class="item large">
          <div class="key">备注：</div>
          <div class="value">
            <el-input v-model="form.remark" :rows="1" type="textarea" placeholder="请输入" maxlength="512" show-word-limit></el-input>
          </div>
        </div>
      </div>
   </div>
   <div class="row-class">
      <div class="title">使用记录</div>
      <div class="table-class">
        <el-table
          :data="form.hblList"
          border
          style="width: 100%">
          <el-table-column
            prop="blNo"
            label="提单号">
          </el-table-column>
          <el-table-column
            prop="orderNo"
            label="工作号">
          </el-table-column>
          <el-table-column
            prop="fileName"
            label="附件名称">
            <template slot-scope="scope">
              <div class="si-file-wrap" v-for="(item, index) in fileNameList(scope.row.fileName)" :key="index">
                <span :title="item" size="mini" @click="handleViewFile(scope.row.fileName, scope.row.fileNo, index)">{{ item }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="fileUploadEmployeeName"
            label="附件上传人">
          </el-table-column>
          <el-table-column
            prop="fileUploadTime"
            label="附件上传时间"
            width="140"
            >
          </el-table-column>
          <el-table-column
            prop="fileInvalidEmployeeName"
            label="附件失效人">
          </el-table-column>
          <el-table-column
            prop="fileInvalidTime"
            label="附件失效时间"
            width="140"
            >
          </el-table-column>
          <el-table-column
            prop="invalidEmployeeName"
            label="作废人">
          </el-table-column>
          <el-table-column
            prop="invalidTime"
            label="作废时间"
            width="140"
            >
          </el-table-column>
          <el-table-column
            prop="invalidReason"
            label="作废原因">
            <template slot-scope="scope">
              {{ scope.row.invalidReason | getDictLabelFilter('blPaperInvalidReason')}}
            </template>
          </el-table-column>
          <el-table-column
            prop="invalidRemark"
            label="作废备注"
            show-overflow-tooltip
            >
            <template slot-scope="scope">
              <div class="si-file-wrap">{{ scope.row.invalidRemark }}</div>
            </template>
          </el-table-column>
          <el-table-column
            prop="fileName"
            label="作废附件">
            <template slot-scope="scope">
              <div class="si-file-wrap" v-for="(item, index) in fileNameList(scope.row.invalidFileName)" :key="index">
                <span :title="item" size="mini" @click="handleViewFile(scope.row.invalidFileName, scope.row.invalidFileNo, index)">{{ item }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="fileName"
            label="操作"
            width="120"
            >
            <template slot-scope="scope">
              <span v-if="scope.row.invalidReason" class="link-class" @click="uploadFile(scope.row)">上传作废附件</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
   </div>
   <div class="row-class">
      <div class="title">转移记录</div>
      <div class="table-class">
        <el-table
          :data="form.transferList"
          border
          style="width: 100%">
          <el-table-column
            prop="applyEmployeeName"
            label="申请人">
          </el-table-column>
          <el-table-column
            prop="applyTime"
            label="申请时间"
            width="140"
            >
          </el-table-column>
          <el-table-column
            prop="transferStatus"
            label="转移状态"
            >
            <template slot-scope="scope">
              {{ scope.row.transferStatus | getDictLabelFilter('blPaperTransferStatus')}}
            </template>
          </el-table-column>
          <el-table-column
            prop="receiveEmployeeName"
            label="审核人">
          </el-table-column>
          <el-table-column
            prop="auditEmployeeName"
            label="收件人">
          </el-table-column>
          <el-table-column
            prop="receivePhone"
            label="收件人联系方式">
          </el-table-column>
          <el-table-column
            prop="receiveAddress"
            label="收件人地址">
          </el-table-column>
          <el-table-column
            prop="expressNo"
            label="快递单号">
          </el-table-column>
          <el-table-column
            prop="transferStartTime"
            label="开始转移时间"
            width="140"
            >
          </el-table-column>
          <el-table-column
            prop="transferFinishTime"
            label="转移完成时间"
            width="140">
          </el-table-column>
          <el-table-column
            prop="revokeTime"
            label="转移撤回时间"
            width="140">
          </el-table-column>
          <el-table-column
            prop="rejectTime"
            label="转移拒绝时间"
            width="140">
          </el-table-column>
          <el-table-column
            prop="rejectReason"
            label="拒绝原因"
            show-overflow-tooltip
            >
            <template slot-scope="scope">
              <div class="si-file-wrap">{{ scope.row.rejectReason }}</div>
            </template>
          </el-table-column>
        </el-table>
      </div>
   </div>
   <div v-if="invalidPopShow">
      <invalidPop :rowData="{oid: form.oid}" @close="invalidPopClose" />
   </div>
   <div v-if="uploadFilePopShow">
      <uploadFilePop :requestUrl="'/order/blPaper/uploadInvalidFile'" :requestParam="requestParam" @close="uploadFilePopClose" />
   </div>
  </div>
  
</template>

<script>
import { blPagerInfo, blPagerUpdate } from '@/api/railway/blPage'
import invalidPop from './invalidPop.vue'
import uploadFilePop from './uploadFile.vue'
import { mapState } from 'vuex'
export default {
  data() {
    return {
      form: {
        oid: '',
        paperCode: '',
        paperStatus: '',
        transferStatus: '',
        companyId: '',
        companyName: '',
        createdName: '',
        createdTime: '',
        updatedName: '',
        updatedTime: '',
        remark: '',
        hblList: [],
        transferList: [],
      },
      saveLoading: false,
      invalidPopShow: false,
      uploadFilePopShow: false,
      requestParam: {},
    }
  },
  activated() {
    this.getDetail()
  },
  created() {
    this.getDetail()
  },
  computed: {
		...mapState({
			userInfo: (state) => state.user.userInfo,
    }),
    isSameCompany() {
      return this.userInfo.compCode === this.form.companyId
    },
  },
  components: {
    invalidPop,
    uploadFilePop,
  },
  methods: {
    getDetail() {
      blPagerInfo(this.$route.query.oid)
      .then(res => {
        for (let key in this.form) {
          this.form[key] = res.data[key]
        }
      })
    },
    goBack() {
      this.$router.push({
        name: 'RailwayHblPageManage'
      })
    },
    // 作废
		handleInvalid() {
			this.invalidPopShow = true
		},
		invalidPopClose(action) {
			this.invalidPopShow = false
			if (action === 'Confirm') {
				this.getDetail()
			}
		},
    uploadFilePopClose(action) {
      this.uploadFilePopShow = false
			if (action === 'Confirm') {
				this.getDetail()
			}
    },
    uploadFile(row) {
       this.uploadFilePopShow = true
       this.requestParam = {
         blId: row.oid,
         blNo: row.blNo,
         orderNo: row.orderNo
       }
    },
    fileNameList(fileName) {
			if (fileName) {
				return fileName.split(',')
			} else {
				return []
			}
		},
    handleViewFile(fileName, fileNo, index) {
			fileNo = fileNo.split(',')[index]
			fileName = fileName.split(',')[index]
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		},
    handleSave() {
      if (!this.form.paperCode) {
        this.$message.error('请输入提单纸编码')
        return
      }
      const data = {
        oid: this.form.oid,
        paperCode: this.form.paperCode,
        remark: this.form.remark
      }
      this.saveLoading = true
      blPagerUpdate(data)
      .then(res => {
        this.$message.success('保存成功')
        this.getDetail()
      })
      .finally(() => {
        this.saveLoading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.hbl-page-detail {
   margin: 14px;
   padding: 10px;
   background-color: #fff;
   .header {
    display: flex;
    height: 40px;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #dfe6ec;
    .title {
      font-size: 14px;
      font-weight: bold;
    }
   }
   .row-class {
    padding: 10px;
    border-bottom: 1px solid #dfe6ec;
    .title {
      font-size: 14px;
      font-weight: bold;
    }
    .info-class {
      margin-top: 10px;
      display: flex;
      flex-wrap: wrap;
      .item {
        width: 25%;
        margin-top: 10px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        .key {
          width: 90px; 
          text-align: right;
        }
        .key-120 {
          width: 120px;
        }
        .value {
          width: calc(100% - 100px);
        }
        .value-120 {
           width: calc(100% - 120px);
        }
      }
      .large {
        width: 100%;
      }
    }
    .table-class {
      margin-top: 20px;
    }
   }
   .link-class {
    cursor: pointer;
    color: #1890ff;
   }
   .si-file-wrap {
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .si-file-wrap span {
      cursor: pointer;
      color: #1890ff;
    }
}
</style>