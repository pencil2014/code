<template>
    <div
        :element-loading-background="eLoadingBackground"
        :element-loading-spinner="eLoadingSpinner"
        :element-loading-text="eLoadingText"
        class="finance-page relationship-wrap"
        v-loading="lsLoading"
   >
        <div v-if="verifyStatus === 'submit'" class="finance-container">
            <div class="refuse-box">
                <span>{{desc}}</span>
            </div>
        </div>
        <div class="detail-header">
            <div class="left-cnt">
            <i class="el-icon-folder-remove"></i>
            <span
                class="detail-title"
                >{{name}}</span
            >
            <!-- <el-tooltip
                content="客户VIP等级"
                effect="dark"
                placement="bottom"
                v-if="baseInfo.custLevel"
            >
                <span
                :class="['vip-icon', `vip-icon-${baseInfo.custLevel}`]"
                ></span>
            </el-tooltip> -->
            </div>
            <relationshipDialog
            v-if="verifyStatus === 'submit'"
            :custid="custid"
            :oid="oid"
            :createdBy="createdBy"
            :isValid="showLeven"
            :isReviewDetail="isReviewDetail"
            :isReviewed="isReviewed"
            />
        </div>
        <div class="finance-search-list-gap"></div>
        <div class="info-page">
            <div class="info-title">
                <span>审核信息</span>
            </div>
            <ul class="base-info-list">
                <li>公司名称：{{dataInfo.relName}}</li>
                <li>关系类型：{{getDictLabel('customerRelationshipType',dataInfo.relType)}}</li>
                <li>是否申请绑定为同一家公司：{{dataInfo.isTheSameCompany && dataInfo.isTheSameCompany === 'YES' ? '是': '否'}}</li>
                <li>申请人: {{data.createdName}}</li>
                <li>申请原因：{{getDictLabel('customerApplyReason',dataInfo.reason)}}</li>
                <li>申请时间：{{data.createdTime}}</li>
                <li>备注：{{dataInfo.remark}}</li>
                <br/>
                <li v-if="verifyStatus === 'refuse'">拒绝原因：{{data.refuseReason}}</li>
            </ul>
            <div class="file-wrap">
                <el-table :data="tableData" style="width: 100%;" border id="organizationTable">
                    <el-table-column label="附件" align="center" show-overflow-tooltip  min-width="280px">
                        <template slot-scope="scope" v-if="scope.row.attachments">
                            <div class="file-td" v-for="(item, s) in scope.row.attachments" :key="s">  
                            <div v-for="(i, t) in item.fileList" :key="t" style="height: '20px'">
                                    <div class="file-link" @click="downLoad(i.fileName, i.fileNo)">{{i.fileName || ''}}</div>
                            </div>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="verifyState" label="附件类型" align="center" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <div v-for="(item, k) in scope.row.attachments" :key="k" class="file-td" >
                                <div :style="{ height: `${20 * item.fileList.length}px`, lineHeight: `${20 * item.fileList.length}px` }">{{getDictLabel('customerFileType',item.attachType)}}</div>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="附件有效期" align="center" min-width="150px"  class="file-item-wrap" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <div v-for="(item, d) in scope.row.attachments" :key="d" class="file-td" >
                                <div v-if="item.startTime" :style="{ height: `${20 * item.fileList.length}px`, lineHeight: `${20 * item.fileList.length}px`}">{{item.startTime}}-{{item.stopTime}}</div>
                                <div v-else :style="{ height: `${20 * item.fileList.length}px`, lineHeight: `${20 * item.fileList.length}px` }">{{item.isLongTerm && item.isLongTerm === 'YES' ? '是' : '否'}}</div>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
   </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import CUSTOMER from '@/api/crm/customer'
import { getDictLabel } from '@/utils/tools'
import relationshipDialog from '../customerReviewList/components/relationshipDialog'
export default {
  name: "customerRelationshipAudit",
  components: {
    relationshipDialog
  },
  data() {
    return {
        getDictLabel: getDictLabel,
        custid:'',
        oid:'',
        name: '',
        verifyStatus: '',
        desc: '',
        data: {},
        isReviewDetail: true,
        isReviewed: false,
        showLeven: false,
        tableData: [],
        dataInfo: {},
        createdBy:''
    }
  },
  mounted() {
    // this.getDetailData()
  },
  activated() {
       this.data.verifyTime = ''
       this.custid = this.$route.query.custid
       this.oid = this.$route.query.oid
       this.name = this.$route.query.name
       this.verifyStatus = this.$route.query.verifyStatus
       this.getDetailData()
  },
  computed: {
    ...mapGetters(['dictMap'])
  },
  methods: {
    getDetailData() {
       CUSTOMER.verifyDetail({ oid: this.$route.query.oid}).then(
            (res) => {
                this.tableData = []
                res.data.verifyData = JSON.parse(res.data.verifyData)
                this.tableData.push(res.data.verifyData.info || {})
                this.dataInfo = res.data.verifyData.info || {}
                this.desc = res.data.verifyData.desc
                this.data = res.data
                this.createdBy = res.data.createdBy
                // console.log('111', res.data.verifyData)
                this.$forceUpdate()
            }
        )
    },
    downLoad(fileName, fileNo) {
        fileName = fileName.replace(/[\[|\]|\{|\}|\%|`]/g, '')
        const href = `/base/fileView/preview/${fileNo}/${fileName}`
        window.open(href)
    }
  }
}
</script>


<style lang="scss" scoped>
@import "../customerList/scss/detail.scss";
.relationship-wrap{
    background: #F6F7F9;
    .detail-header {
        background: #fff;
    }
    .info-page {
        background: #fff;
    }
    .file-wrap {
      
    }
}
.file-td {
    border-bottom: 1px solid #dfe6ec;
}
.file-td:nth-last-of-type(1) {
    border:none;
}
.file-link {
  color: #3E80F5 !important;
  cursor: pointer;
  height:20px;
  padding: 0 5px;
  text-overflow :ellipsis !important;
  white-space :nowrap !important; 
  overflow : hidden !important; 
}
#organizationTable {
    margin-top:20px;
    .file-item-wrap {
       .file-item {
            border-bottom: 1px solid #dfe6ec;
        }
    }
    .file-item-wrap:nth-last-of-type(1) {
        border-bottom:none;
    }
}
/deep/ #organizationTable .cell.el-tooltip {
    text-overflow :ellipsis !important;
    white-space :nowrap !important; 
    overflow : hidden !important; 
    padding:0 !important;
}
/deep/ #organizationTable td {
    text-overflow :ellipsis !important;
    white-space :nowrap !important; 
    overflow : hidden !important; 
    padding: 0 !important;
}
/deep/ #organizationTable td {
    border-right:1px solid #dfe6ec !important;
}
/deep/ #customerAdd #fileContent #fileItem:nth-of-type(1) {
    // border-top: 1px solid #dfe6ec;
}
/deep/ #customerAdd #fileItem .el-dialog__body .el-form-item__content > div {
    width: 400px !important;
}
.base-info-list  li {
     width: 33%;
}
</style>