<template>
  <div class="app-container" id="overseas-freight-detail">
    <div class="overseas-freight-detail-head">
      <div class="detail-title">Ask for quote details</div>
      <div class="freight-detail-head-right">
        <div v-if="quotationNumber && participantType" class="participants" @click="handleExport">Export</div>
        <el-popover placement="bottom" width="550" trigger="click">
          <div class="participants-container">
            <el-table :data="participantsData">
              <el-table-column property="date" label="Participant Type" width="180px">
                <template slot-scope="scope">
                  <span v-if="scope.row.participantType==='enquiry'">Inquirer</span>
                  <span v-else-if="scope.row.participantType==='joint'">Collaborator</span>
                  <span v-else>Quoter</span>
                </template>
              </el-table-column>
              <el-table-column property="participantName" label="Persons" width="180px">
                <template slot-scope="scope">
                  <span>{{scope.row.participantName}}</span><span v-if="scope.row.participantEname">({{scope.row.participantEname}})</span>
                </template>
              </el-table-column>
              <el-table-column property="deptCname" label="Department" width="150px"></el-table-column>
              <el-table-column property="deptCname" label="Operations" width="120px">
                <template slot-scope="scope">
                  <el-button v-if="scope.row.participantType==='joint' && (participantType === 'quote' || participantType === 'enquiry')" @click="participantDelete(scope.row.oid)" style="padding:4px" type="text" class="red">Delete</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="participants" slot="reference">View Participants</div>
        </el-popover>
        <div v-if="!quotationNumber && detaileData.inquirerId === userId" @click="handleDel" class="del-enquiry">Delete</div>
        <!--  && (['QUOTED', 'INIT'].includes(detaileData.status) || !detaileData.status) -->
        <div @click="handleBreak" v-if="(detaileData.quotationId == this.userId || detaileData.inquirerId == this.userId) && !['BREAK'].includes(detaileData.status)" class="del-enquiry">Terminate</div>
        <div class="back-btn" @click="goBack">Back</div>
      </div>
    </div>
    <div class="overseas-freight-detail-main">
      <el-row :gutter="16" class="detail-row">
        <el-col :span="13" class="freight-record">
          <!-- 报价人才能查看，编辑 -->
          <el-form v-if="participantType === 'quote'" label-width="125px">
            <el-form-item label="Quotation Remarks:">
              <el-input v-model="quoteRemarkValue" @input="autoSave" show-word-limit maxlength="512" :rows="1" type="textarea"></el-input>
            </el-form-item>
          </el-form>
          <div class="record-body">
            <div class="record-header">
              <div class="record-body-title">Quotation record<div>（Inquiry No.：{{detaileData.enquiryNo}}）</div>
              </div>
              <!-- 关键字搜索 -->
              <div class="input-with-key">
                <el-input placeholder="Keyword Search" @input="searchText" style="width:150px" clearable size="mini" v-model="keyword">
                </el-input>
                <div v-if="keyword" class="match-num">{{ currentIdx }}/{{ matchCount }}</div>
                <button v-if="matchCount>0" @click.stop="searchLast">Previous</button>
                <button v-if="matchCount>0" @click.stop="searchNext">Next</button>
              </div>
            </div>
            <div class="record-body-main" id="record-body-main">
              <FreightRecord v-show="!showHighlightText" id="record-content" :participantType="participantType" :freightRecords="freightRecords" :enquiryArr="enquiryArr" :quoteArr="quoteArr"></FreightRecord>
              <search-highlight v-show="showHighlightText" ref="search" @current-change="currentChange" @match-count-change="matchCountChange" :content="content" regExp :keyword="keyword">
              </search-highlight>
            </div>
            <div v-if="(participantType || isJointer)" class="record-body-footer">
              <div class="freight-btns">
                <button v-if="participantType === 'quote' && isBid!=='Y' && !['BREAK'].includes(detaileData.status)" class="freight-btn freight-green offer-btn" @click="handleOffer">Quotation Reply</button>
                <button v-if="participantType === 'enquiry' && isBid!=='Y' && !['BREAK'].includes(detaileData.status)" class="freight-btn freight-blue inquiry-btn" @click="handleInquiry">Request for quotation again</button>
                <!-- 中标反馈: 询价人，当前有有效的报价，中标状态不能是已中标，已中标后需要先中标撤回 -->
                <button v-if="participantType === 'enquiry' && isBid!=='Y'" class="freight-btn freight-blue inquiry-btn" @click="handleFeedback">Feedback of winning the bid</button>
                <button v-if="participantType === 'enquiry' && isBid" class="freight-btn freight-blue inquiry-btn" @click="handleFeedbackCanle">Winning Bid Withdrawal</button>
                <button v-if="(participantType === 'quote' || participantType === 'enquiry') && !['BREAK'].includes(detaileData.status)" class="freight-btn participants-btn" @click="handleParticipants">Change participant</button>
                <div class="freight-send" @click="handlesnedMsg" title="Press Enter to send, press Ctrl+Enter to change lines"></div>
              </div>
              <tinymce ref="overseasFreightTinymce" @keyEnter="handlesnedMsg" isMsgInput class="freight-input" :toolbar="tinymceConfig.toolbar" :pasteImages="tinymceConfig.pasteImages" :menubar="tinymceConfig.menubar" v-model="chatValue" :height="120" />
            </div>
          </div>
        </el-col>
        <el-col :span="11" class="offer-record">
          <div class="record-body">
            <div class="record-body-title">
              <div class="programme-name">Quotation scheme(<span :class="{'red':formatStatus==='Terminated','green':formatStatus==='Quoted'}">{{formatStatus}}</span>,Quotation No.：{{quotationNumber}})</div>
              <div class="programme-right">
                <!-- <div class="programme-input-search">
                  <input type="text" v-model="searchConfig.findContent" class="input-full-height" size="1" placeholder="Please enter program number/offeror">
                  <div class="search-btn" v-if="searchConfig.findContent">
                    <i class="el-icon-circle-close" @click="handleReset"></i>
                  </div>
                </div>
                <div class="reset-btn" @click="getLookScheme">Search</div>
                <div class="programme-effective">
                  <div class="effective-item" @click="changeEffective('valid')" :class="{'effective-item-active':searchConfig.isEffectFlag==='valid'}">Valid</div>
                  <div class="effective-item" @click="changeEffective('invalid')" :class="{'effective-item-active':searchConfig.isEffectFlag==='invalid'}">Invalid</div>
                </div> -->
              </div>
            </div>
            <div class="programme-search">
              <div style="width:120px"></div>
              <div class="search-box">
                <div class="programme-input-search">
                  <input type="text" v-model="searchConfig.findContent" class="input-full-height" size="1" placeholder="Please input quotation scheme No./ quoter">
                  <div class="search-btn" v-if="searchConfig.findContent">
                    <i class="el-icon-circle-close" @click="handleReset"></i>
                  </div>
                </div>
                <div class="reset-btn" @click="getLookScheme">Search</div>
              </div>
              <div class="programme-effective">
                <div class="effective-item" @click="changeEffective('valid')" :class="{'effective-item-active':searchConfig.isEffectFlag==='valid'}">Valid</div>
                <div class="effective-item" @click="changeEffective('invalid')" :class="{'effective-item-active':searchConfig.isEffectFlag==='invalid'}">Invalid</div>
              </div>
            </div>
            <div class="record-body-main">
              <OfferRecord :offerRecordList="offerRecordList" :bidSchemeNumber="bidSchemeNumber" :status="detaileData.status" :quoteArr="quoteArr" :userId="userId" @getList="getLookScheme" :participantType="participantType"></OfferRecord>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    <div v-if="addParticipantsDatePopShow">
      <!-- 变更参与人 -->
      <AddParticipantsDatePop @close="addParticipantsDatePopClose" :participantType="participantType" :quotationNumber="quotationNumber"></AddParticipantsDatePop>
    </div>
    <div v-if="showAddOfferPop">
      <!-- 回复报价 -->
      <AddOffer @close="addOfferClose" :inquiryData="detaileData" :lastOfferData="lastOfferData" :canSubmit="canSubmit"></AddOffer>
    </div>
    <div v-if="showAddInquiryPop">
      <!-- 再次询价 -->
      <AddInquiry @close="addInquiryClose" :detaileData="detaileData" :lastInquiryData="lastInquiryData" :canSubmit="canSubmit"></AddInquiry>
    </div>
    <!-- 终止-->
    <div v-if="breakPopShow">
      <BreakPop @close="breakPopClose" />
    </div>
    <!-- 中标反馈-->
    <div v-if="feedbackPopShow">
      <ResultFeedbackPop @close="feedbackPopClose" :quoteOptions="quoteOptions" />
    </div>
  </div>
</template>

<script>
import FreightRecord from './freight-record.vue'
import OfferRecord from './offer-record.vue'
import AddParticipantsDatePop from './addParticipantsDatePop.vue'
import AddInquiry from './addInquiry'
import AddOffer from './addOffer'
import { mapState } from 'vuex'
import Tinymce from '@/components/Tinymce'
import BreakPop from './breakPop'
import SearchHighlight from './searchHighlight'
import ResultFeedbackPop from './resultFeedbackPop.vue'
import {
  saveInquiry,
  saveEnquiryParticipant,
  saveEnquiryCom,
  detailRecord,
  enquiryDetail,
  saveEnquirySon,
  lookScheme,
  viewParticipants,
  enquiryExport,
  enquiryDelete,
  enquiryBreak,
  participantAddBatch,
  participantDelete,
  quoteRemark,
  resultFeedback,
  feedbackCancel
} from '@/api/charge'
import { getDictLabel } from '@/utils/tools'
let timer = null
export default {
  data() {
    return {
      submitFlag: true,
      base64UrlLength: 0,
      compressIndex: 0,
      bidSchemeNumber: '',
      isBid: '',
      quoteOptions: [],
      feedbackPopShow: false,
      timeID: null,
      quoteRemarkValue: '',
      showHighlightText: false,
      keyword: '',
      currentIdx: 0,
      matchCount: 0,
      content: '',
      eQuery: this.$route.query,
      breakPopShow: false,
      tinymceConfig: {
        pasteImages: true,
        toolbar: [
          'undo redo | fontselect | fontsizeselect | forecolor backcolor bold italic underline strikethrough alignleft aligncenter alignright outdent indent table removeformat hr charmap preview fullscreen'
        ],
        menubar: ''
      },
      canSubmit: true,
      quotationNumber: '', //
      showAddInquiryPop: false,
      detaileData: {}, // 当前询价详情主信息
      showAddOfferPop: false,
      addParticipantsDatePopShow: false,
      chatValue: '',
      freightRecords: [],
      participantsData: [],
      enquiryArr: [], // 所有的询价人
      quoteArr: [], // 所有的报价人
      participantType: '',
      searchConfig: {
        flag: '',
        enquiryId: '',
        quotationNumber: '',
        quotationId: '',
        inquirerId: '',
        isEffectFlag: 'valid',
        findContent: ''
      },
      offerRecordList: [],
      cTimestamp: '',
      lastInquiryData: {}, // 当前用户最有一次询价填写的信息
      lastOfferData: null // 当前用户最有一次询价填写的信息
    }
  },
  computed: {
    isJointer() {
      let item = this.participantsData.find(
        (el) =>
          el.participantType === 'joint' && el.participantId == this.userId
      )
      console.log(this.participantsData)
      if (item) {
        return true
      }
      return false
    },
    ...mapState({
      userId: (state) => state.user.userId
    }),
    formatStatus() {
      let status = this.detaileData.status
      let result = getDictLabel('enquiriesStatus', status)
      if (!result) {
        if (this.detaileData.quotationNumber) {
          result = 'Quoted'
        } else {
          result = 'Not quoted'
        }
      }
      console.log(result)
      return result
    }
  },
  watch: {},
  activated() {
    let timestamp = new Date().getTime()
    if (timestamp - this.cTimestamp > 200) {
      this.enquiryDetail()
      this.getDetailRecord()
      this.getLookScheme()
      this.viewParticipants()
    }
    window.addEventListener('keydown', this.handleKeyDown)
  },
  created() {
    this.cTimestamp = new Date().getTime()
    this.enquiryDetail()
    this.getDetailRecord()
    this.getLookScheme()
    this.viewParticipants()
    this.getLookValidScheme()
    window.addEventListener('keydown', this.handleKeyDown)
  },
  destroyed() {
    window.removeEventListener('keydown', this.handleKeyDown)
  },
  deactivated() {
    window.removeEventListener('keydown', this.handleKeyDown)
  },
  mounted() {},
  components: {
    FreightRecord,
    OfferRecord,
    AddParticipantsDatePop,
    AddInquiry,
    AddOffer,
    Tinymce,
    BreakPop,
    SearchHighlight,
    ResultFeedbackPop
  },
  methods: {
    getLookValidScheme() {
      // 方案列表接口
      let params = {
        flag: '',
        enquiryId: this.eQuery.id,
        quotationNumber: '',
        quotationId: '',
        inquirerId: '',
        isEffectFlag: 'valid',
        findContent: ''
      }
      lookScheme(params).then((res) => {
        if (
          Array.isArray(res.data.woInquiryList) &&
          res.data.woInquiryList.length
        ) {
          this.quoteOptions = res.data.woInquiryList
        } else {
          this.quoteOptions = []
        }
      })
    },
    handleFeedbackCanle() {
      this.$confirm(
        'After the revocation, the winning result, the feedback time of the winning result, the reason for not winning, the winning proposal and Order No. are all cleared, is the revocation confirmed?',
        'Warning',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      )
        .then(() => {
          this.showHighlightText = false
          this.content = ''
          this.keyword = ''
          feedbackCancel({
            enquiryId: this.eQuery.id,
            typeCode: 'OVERSEA'
          }).then((res) => {
            this.$message.success('Successful bid revocation')
            this.getDetailRecord()
          })
        })
        .catch(() => {})
    },
    handleFeedback() {
      if (this.quoteOptions.length === 0) {
        this.$message.error(
          'There are no valid quotation scheme for the current inquiry!'
        )
        return
      }
      this.showHighlightText = false
      this.content = ''
      this.keyword = ''
      this.feedbackPopShow = true
    },
    feedbackPopClose(action, value) {
      this.feedbackPopShow = false
      if (action === 'Confirm') {
        let param = {}
        if (value.isBid === 'Y') {
          param = {
            enquiryId: this.eQuery.id,
            typeCode: 'OVERSEA',
            isBid: value.isBid,
            bidQuoteId: value.bidQuoteId,
            bidRemark: value.bidRemark,
            orderNoList: value.orderNoList
          }
        } else {
          // 少了个未中标详细原因
          param = {
            enquiryId: this.eQuery.id,
            typeCode: 'OVERSEA',
            isBid: value.isBid,
            bidNoReason: value.bidNoReason,
            bidNoReasonName: value.bidNoReasonName,
            bidNoRemark: value.bidNoRemark,
            bidRemark: value.bidRemark
          }
        }
        resultFeedback(param).then(() => {
          this.$message.success('Successful bid feedback')
          this.enquiryDetail()
          this.getDetailRecord()
        })
      }
    },
    autoSave() {
      if (this.timeID) {
        clearTimeout(this.timeID)
      }
      this.timeID = setTimeout(() => {
        this.quoteRemark()
      }, 600)
    },
    // 自动保存
    quoteRemark() {
      let params = {
        enquiryId: this.eQuery.id,
        typeCode: 'OVERSEA',
        remark: this.quoteRemarkValue
      }
      quoteRemark(params).then((res) => {
        this.$message.success('Save successfully')
      })
    },
    searchLast() {
      this.$refs.search.searchLast()
    },
    searchNext() {
      this.$refs.search.searchNext()
    },
    matchCountChange(count) {
      this.matchCount = count
    },
    currentChange(idx) {
      this.currentIdx = idx
    },
    searchText() {
      if (this.keyword.trim()) {
        // 搜索询报价信息记录
        clearTimeout(timer)
        timer = setTimeout(() => {
          let dom = document.getElementById('record-content')
          this.content = dom.innerHTML
          this.showHighlightText = true
          this.$nextTick(() => {
            if (this.matchCount > 0) {
              this.$refs.search.scrollTo(1)
            }
          })
        }, 500)
      } else {
        this.showHighlightText = false
        this.content = ''
      }
    },
    participantDelete(id) {
      this.$confirm(
        'After deleting this participant, he will no longer be able to see the current inquiry, do you confirm the deletion?',
        'Warning',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      )
        .then(() => {
          participantDelete({ oid: id }).then((res) => {
            this.$message.success('Delete participant successfully')
            this.getDetailRecord()
            this.viewParticipants()
            this.enquiryDetail()
          })
        })
        .catch(() => {})
    },
    handleBreak() {
      // 终止
      this.breakPopShow = true
    },
    // 取消订单关闭回调
    breakPopClose(action, value) {
      console.log(value)
      this.breakPopShow = false
      if (action === 'Confirm') {
        let param = {
          breakReason: value.breakReason,
          enquiryId: this.eQuery.id
        }
        enquiryBreak(param).then(() => {
          this.$message.success('Successful termination')
          this.enquiryDetail()
          this.getDetailRecord()
        })
      }
    },
    handleKeyDown(event) {
      let e = event || window.event
      let key = e.keyCode
      let ctrlKey = e.ctrlKey || e.metaKey
      if (ctrlKey && key == 13) {
        //触发的事件
        this.handlesnedMsg()
      }
    },
    handleDel() {
      this.$confirm('Are you sure you want to delete this inquiry?', 'Tips', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(() => {
          enquiryDelete(this.$route.query.id).then((res) => {
            this.$message.success('Deleted successfully')
            let views = this.$store.state.tagsView.visitedViews.filter(
              (item) => item.name === this.$route.name
            )
            this.$store.commit('tagsView/DEL_SAMEORDER_VISITED_VIEW', views)
            this.$router.push({
              name: 'OverseasFreight'
            })
          })
        })
        .catch(() => {})
    },
    handleReset() {
      this.searchConfig.findContent = ''
      this.getLookScheme()
    },
    handleDownload(row) {
      this.$store
        .dispatch('order/downloadBlobFile', {
          uri: '/base/webapi/file/download',
          params: {
            fileNo: row.fileNo
          }
        })
        .then((res) => {
          console.log(res)
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = row.name
          link.click()
        })
    },
    handleExport() {
      enquiryExport({
        enquiryId: this.$route.query.id
      }).then((res) => {
        if (res.data) {
          this.handleDownload(res.data)
        }
      })
    },
    viewParticipants() {
      viewParticipants({ enquiryId: this.$route.query.id }).then((res) => {
        this.participantsData = res.data.listAll
      })
    },
    getLookScheme() {
      // 方案列表接口
      this.searchConfig.enquiryId = this.$route.query.id
      lookScheme(this.searchConfig).then((res) => {
        if (
          Array.isArray(res.data.woInquiryList) &&
          res.data.woInquiryList.length
        ) {
          this.offerRecordList = res.data.woInquiryList
          this.quotationNumber = res.data.woInquiryList[0].quotationNumber
        } else {
          this.offerRecordList = []
        }
      })
    },
    toBottom() {
      // 滚动到最底部
      this.$nextTick(() => {
        let scrollDom = document.getElementById('record-body-main')
        scrollDom.scrollTop = scrollDom.scrollHeight
      })
    },
    addInquiryClose(action, value) {
      if (action === 'Confirm') {
        this.canSubmit = false
        this.$store
          .dispatch('airTransport/orderSave', {
            uri: '/order/over/enquiry/saveEnquirySon',
            params: value
          })
          .then((res) => {
            this.canSubmit = true
            if (res.data.code === 0) {
              this.showAddInquiryPop = false
              this.$message({
                type: 'success',
                message: 'Successful quotation request'
              })
              this.getDetailRecord()
            }
          })
          .catch(() => {
            this.canSubmit = true
          })
      } else {
        this.showAddInquiryPop = false
      }
    },
    enquiryDetail() {
      // 询价信息
      enquiryDetail({ enquiryId: this.$route.query.id }).then((res) => {
        this.detaileData = res.data
        if (!this.detaileData) {
          this.participantType = ''
        } else {
          let enquiryArr = []
          let quoteArr = []
          if (this.detaileData.inquirerId) {
            enquiryArr.push(this.detaileData.inquirerId)
          }
          // for (let i = 0; i < this.detaileData.enquiryInfor.length; i++) {
          //   enquiryArr.push(
          //     Number(this.detaileData.enquiryInfor[i].participantId)
          //   )
          // }
          this.enquiryArr = enquiryArr
          // for (let i = 0; i < this.detaileData.quoteInfor.length; i++) {
          //   quoteArr.push(Number(this.detaileData.quoteInfor[i].participantId))
          // }
          if (this.detaileData.quotationId) {
            quoteArr.push(this.detaileData.quotationId)
          }
          this.quoteArr = quoteArr
          if (this.detaileData.inquirerId == this.userId) {
            this.participantType = 'enquiry'
          } else if (this.detaileData.quotationId == this.userId) {
            this.participantType = 'quote'
          } else {
            this.participantType = ''
          }
        }
      })
    },
    getDetailRecord() {
      // 询价左右的记录
      let params = {
        enquiryId: this.$route.query.id
      }
      detailRecord(params)
        .then((res) => {
          this.$store.dispatch('charge/getValueByKeys')
          // 询价，报价，邀请人，聊天记录
          this.freightRecords = JSON.parse(JSON.stringify(res.data.detailInfor))
          this.toBottom()

          if (res.data.itemInfo) {
            this.quoteRemarkValue = res.data.itemInfo.quoteRemark
            this.isBid = res.data.itemInfo.isBid
            this.bidSchemeNumber = res.data.itemInfo.bidSchemeNumber
          }

          // 获取当前用户最后一次询价
          let enquiryArr = this.freightRecords.filter(
            (el) => el.recordType === 'enquiry' && el.createdBy === this.userId
          )
          console.log(enquiryArr)
          if (enquiryArr.length) {
            this.lastInquiryData = JSON.parse(
              JSON.stringify(enquiryArr[enquiryArr.length - 1])
            )
            if (this.lastInquiryData.startDateTerm) {
              this.$set(this.lastInquiryData, 'term', [
                this.lastInquiryData.startDateTerm,
                this.lastInquiryData.endDateTerm
              ])
            } else {
              this.$set(this.lastInquiryData, 'term', [])
            }
            if (this.lastInquiryData.lclDestinationAgent) {
              this.lastInquiryData.lclDestinationAgent = Number(
                this.lastInquiryData.lclDestinationAgent
              )
            }
            console.log(enquiryArr)
            this.lastInquiryData.hscodeCommodity =
              this.lastInquiryData.hscodeSonCommodity
            for (
              let i = 0;
              i < this.lastInquiryData.hscodeCommodity.length;
              i++
            ) {
              this.$set(
                this.lastInquiryData.hscodeCommodity[i],
                'hscodeOptions',
                [
                  {
                    label: this.lastInquiryData.hscodeCommodity[i].hsCode,
                    value: this.lastInquiryData.hscodeCommodity[i].hsCode
                  }
                ]
              )
            }
          }

          // 获取当前用户最后一次报价
          let quoteArr = this.freightRecords.filter(
            (el) => el.recordType === 'quote' && el.createdBy === this.userId
          )

          if (quoteArr.length) {
            this.lastOfferData = JSON.parse(
              JSON.stringify(quoteArr[quoteArr.length - 1])
            )

            if (this.lastOfferData.startDateValidity) {
              this.lastOfferData.validity = [
                this.lastOfferData.startDateValidity,
                this.lastOfferData.endDateValidity
              ]
            } else {
              this.lastOfferData.validity = []
            }

            if (this.lastOfferData.category) {
              this.lastOfferData.category = Number(this.lastOfferData.category)
            }
          }
        })
        .catch((err) => {
          console.log(err)
          this.freightRecords = []
        })
    },
    handleOffer() {
      this.showHighlightText = false
      this.content = ''
      this.keyword = ''
      this.showAddOfferPop = true
    },
    addOfferClose(action, value) {
      if (action === 'Confirm') {
        this.canSubmit = false
        this.$store
          .dispatch('airTransport/orderSave', {
            uri: '/order/over/enquiry/saveInquiry',
            params: value
          })
          .then((res) => {
            this.showAddOfferPop = false
            if (res.data.code === 0) {
              this.$message({
                type: 'success',
                message: 'Successful quotation'
              })
              // 发起询价后需要调用询价记录接口
              this.getDetailRecord()
              this.getLookScheme()
              this.canSubmit = true
            }
          })
          .catch(() => {
            this.canSubmit = true
          })
      } else {
        this.showAddOfferPop = false
      }
    },
    handleParticipants() {
      this.showHighlightText = false
      this.content = ''
      this.keyword = ''
      this.addParticipantsDatePopShow = true
    },
    addParticipantsDatePopClose(action, value) {
      // 变更参与人
      if (action === 'Confirm') {
        if (value.participantsType === 'joint') {
          let params = {
            participantType: value.participantsType,
            participantIdList: value.participantIdList,
            enquiryId: this.$route.query.id
          }
          participantAddBatch(params).then((res) => {
            this.addParticipantsDatePopShow = false
            this.$message({
              type: 'success',
              message: 'New Co-Participant Success'
            })
            // 发起询价后需要调用询价记录接口
            this.getDetailRecord()
            this.viewParticipants()
            this.enquiryDetail()
          })
        } else {
          let params = {
            participantType: value.participantsType,
            participantName: value.participantName,
            participantId: value.participantId,
            enquiryId: this.$route.query.id
          }
          saveEnquiryParticipant(params)
            .then((res) => {
              this.addParticipantsDatePopShow = false
              this.$message({
                type: 'success',
                message: 'Successful change of participant'
              })
              // 发起询价后需要调用询价记录接口
              this.getDetailRecord()
              this.viewParticipants()
              this.enquiryDetail()
            })
            .finally(() => {})
        }
      } else {
        this.addParticipantsDatePopShow = false
      }
    },
    changeEffective(value) {
      this.searchConfig.isEffectFlag = value
      this.getLookScheme()
    },
    goBack() {
      this.$router.push({
        name: 'OverseasFreight'
      })
    },
    handleInquiry() {
      this.showHighlightText = false
      this.content = ''
      this.keyword = ''
      this.showAddInquiryPop = true
    },
    handleEntersnedMsg(e) {
      if (e.ctrlKey && e.keyCode === 13) {
        this.handlesnedMsg()
      }
    },
    compressBase64Callback(base64, oldBase64) {
      this.compressIndex += 1
      this.chatValue = this.chatValue.replace(oldBase64, base64)
      console.log(this.compressIndex)
      if (this.compressIndex === this.base64UrlLength) {
        this.sendMsg()
      }
    },
    compressBase64(
      base64Url, // 源图片
      rate, // 缩放比例
      callback,
      oldBase64Url
    ) {
      //处理缩放，转格式
      if (base64Url.length > 500000) {
        // base64Url文件大小=base64Url.length/1024*3/4  kb
        let that = this
        let _img = new Image()
        _img.src = base64Url
        _img.onload = function () {
          let _canvas = document.createElement('canvas')
          let w = this.width / rate
          let h = this.height / rate
          _canvas.setAttribute('width', w)
          _canvas.setAttribute('height', h)
          _canvas.getContext('2d').drawImage(this, 0, 0, w, h)
          let base64 = _canvas.toDataURL('image/jpeg')
          _canvas.toBlob(function (blob) {
            if (base64.length > 500000) {
              //如果还大，继续压缩
              that.compressBase64(base64, rate, callback, oldBase64Url)
            } else {
              callback(base64, oldBase64Url)
            }
          }, 'image/jpeg')
        }
      } else {
        callback(base64Url, oldBase64Url)
      }
    },
    handlesnedMsg() {
      // 发送消息
      this.showHighlightText = false
      this.content = ''
      this.keyword = ''

      if (!this.chatValue.trim()) {
        this.$message.warning('Cannot send blank messages')
        return
      }
      if (!this.submitFlag) {
        return
      }
      this.submitFlag = false
      let base64Url = this.chatValue.match(/(?<=<img.+?src=").+?(?=".*?>)/g)
      if (base64Url) {
        this.base64UrlLength = base64Url.length
      } else {
        this.base64UrlLength = 0
      }
      if (this.base64UrlLength === 0) {
        this.sendMsg()
      } else {
        this.compressIndex = 0
        for (let i = 0; i < base64Url.length; i++) {
          this.compressBase64(
            base64Url[i],
            2,
            this.compressBase64Callback,
            base64Url[i]
          )
        }
      }
    },
    sendMsg() {
      let params = {
        enquiryId: this.$route.query.id,
        quotationNumber: this.quotationNumber,
        communicationRecord: this.chatValue,
        participantType: this.participantType
      }
      saveEnquiryCom(params)
        .then((res) => {
          if (res.code === 0) {
            this.chatValue = ''
            this.$refs.overseasFreightTinymce.setContent('')
            this.getDetailRecord()
          }
          this.submitFlag = true
        })
        .catch(() => {
          this.submitFlag = true
        })
    }
  }
}
</script>

<style lang="scss">
#overseas-freight-detail {
  .mce-top-part {
    display: none;
  }
  .mce-tinymce {
    border-top: 0px;
  }
}
.overseas-freight-detail-head {
  width: 100%;
  height: 40px;
  background: #ffffff;
  box-shadow: inset 0px -1px 0px 0px #d9d9d9;
  border-radius: 2px 2px 0px 0px;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .detail-title {
    font-size: 12px;
    font-family: MicrosoftYaHei-Bold, MicrosoftYaHei;
    font-weight: bold;
    color: #222222;
    line-height: 20px;
  }
  .freight-detail-head-right {
    display: flex;
    align-items: center;
    .participants {
      padding: 0 20px;
      height: 28px;
      background: #3e80f5;
      border-radius: 2px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      color: #fff;
      margin-right: 8px;
    }

    .back-btn {
      width: 56px;
      height: 28px;
      background: #ffffff;
      border-radius: 2px;
      border: 1px solid #d9d9d9;
      color: #4a4a4a;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
  }
}
.overseas-freight-detail-main {
  height: calc(100vh - 90px);
  min-height: 570px;
  background: #ffffff;
  border-radius: 2px;
  padding: 16px;
  .detail-row {
    height: 100%;
    margin: 0 -8px;
    .freight-record {
      height: 100%;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      .record-body {
        flex: 1;
        border-radius: 2px;
        border: 1px solid #d9d9d9;
        // height: 100%;
        display: flex;
        flex-direction: column;
        overflow: auto;
        .record-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          height: 40px;
          background: #ebeef3;
          border-radius: 1px 1px 0px 0px;
          padding: 0 15px;
          line-height: 40px;
          font-size: 12px;
          .input-with-key {
            display: flex;
            align-items: center;
            .match-num {
              padding: 0 4px;
            }
          }
        }
        .record-body-title {
          line-height: 40px;
          font-size: 12px;
          font-family: MicrosoftYaHei-Bold, MicrosoftYaHei;
          font-weight: bold;
          color: #222222;
          display: flex;
          align-items: center;
        }
        .record-body-footer {
          width: 100%;
          height: 204px;
          border-top: 1px solid #d9d9d9;
          padding: 16px;
          .freight-btns {
            overflow: hidden;
            .freight-btn {
              padding: 4px 16px;
              color: #4a4a4a;
              font-size: 12px;
              border-radius: 2px;
              display: inline-block;
              line-height: 20px;
              border: 0;
              cursor: pointer;
            }
            // .freight-btn:hover {
            //   opacity: 0.8;
            // }
            .offer-btn {
              float: left;
              margin-right: 8px;
            }
            .inquiry-btn {
              float: left;
              margin-right: 8px;
            }
            .participants-btn {
              float: left;
              background: #fff;
              border: 1px solid #d9d9d9;
            }
            .freight-send {
              float: right;
              height: 28px;
              width: 28px;
              background: url('../../../../../assets/icon_send.png') center
                center no-repeat;
              background-size: cover;
              cursor: pointer;
            }
            .freight-send:hover {
              opacity: 0.8;
            }
          }
          .freight-input {
            margin-top: 16px;
          }
        }
        .record-body-main {
          width: 100%;
          flex: 1;
          overflow: auto;
          padding: 16px;
        }
      }
    }
    .offer-record {
      height: 100%;
      .record-body {
        height: 100%;
        display: flex;
        flex-direction: column;
        .record-body-title {
          width: 100%;
          height: 40px;
          background: #ebeef3;
          display: flex;
          padding: 0 16px;
          // justify-content: space-between;
          align-items: center;
          .programme-name {
            line-height: 40px;
            font-size: 12px;
            font-family: MicrosoftYaHei-Bold, MicrosoftYaHei;
            font-weight: bold;
            color: #222222;
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        .record-body-main {
          // padding-top: 16px;
          flex: 1;
          overflow: auto;
        }
      }
    }
  }
}
.freight-green {
  background: #33b18a;
  color: #fff !important;
}
.freight-blue {
  background: #3e80f5;
  color: #fff !important;
}

.programme-right {
  display: flex;
  width: calc(100% - 280px);
}
.participants-box {
  max-height: 300px;
  overflow: auto;
}
.participants-container {
  max-height: 300px;
  overflow: auto;
}
.del-enquiry {
  padding: 0 20px;
  height: 28px;
  background: #cd4130;
  border-radius: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #fff;
  margin-right: 8px;
}
.programme-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
  .search-box {
    display: flex;
    align-items: center;
    .reset-btn {
      margin-right: 20px;
      background-color: #f5f7fa;
      border: 1px solid #dcdfe6;
      border-left-width: 0;
      height: 28px;
      line-height: 26px;
      cursor: pointer;
      width: 48px;
      text-align: center;
    }
  }
  .programme-input-search {
    width: 250px;
    margin-left: 30px;
    height: 28px;
    background: #ffffff;
    border-radius: 2px;
    border: 1px solid #d9d9d9;
    display: flex;
    padding-left: 5px;
    .input-full-height {
      flex: 1;
      border: none;
      outline: medium;
    }
    .search-btn {
      height: 100%;
      width: 32px;
      font-size: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #bfbfbf;
      cursor: pointer;
      .el-icon-circle-close:hover {
        color: #3e80f5;
      }
    }
  }
  .programme-effective {
    width: 120px;
    display: flex;
    align-items: center;
    height: 28px;
    box-sizing: border-box;
    border-radius: 2px 0px 0px 2px;
    .effective-item {
      border: 1px solid #969696;
      box-sizing: border-box;
      width: 60px;
      height: 100%;
      background: #ffffff;
      line-height: 26px;
      text-align: center;
      color: #969696;
      cursor: pointer;
    }
    .effective-item:first-child {
      border-right: 0;
    }
    .effective-item:last-child {
      border-left: 0;
    }
    .effective-item-active {
      border: 1px solid #3e80f5 !important;
      color: #3e80f5;
    }
  }
}
</style>