<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <div class="search-container">
      <Search :searchConditionHide="searchConditionHide" :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery">
      </Search>
      <el-divider></el-divider>
      <div class="offer-record">
        <div v-for="(el,index) in offerRecordList" :key="index">
          <!-- is-self-offer -->
          <div class="offer-item" :class="{'is-self-offer':el.isSelect,'offer-item-disabled':el.isEligibility==='0'}" @click.stop="selectOffer(el,index)">
            <div class="offer-item-title">
              <div class="left">
                <div class="freight-item-surrender">
                  <img src="../../../../../assets/head.png" alt="">
                </div>
                <!-- <div class="bidder">报价人：{{el.createdName}}</div>
                <div class="bidder-number">询价编号：{{el.enquiryNo}}</div>
                <div class="bidder-number">报价编号：{{el.quotationNumber}}</div>
                <div class="bidder-number">方案编号：{{el.schemeNumber}}</div> -->
                <div class="bidder">Quoter：{{el.createdName}}</div>
                <div class="bidder-number">Inquiry No.：{{el.enquiryNo}}</div>
                <div class="bidder-number">Quotation No.：{{el.quotationNumber}}</div>
                <div class="bidder-number">Quotation scheme No.：{{el.schemeNumber}}</div>
                <div class="bidder-number" v-if="el.isEligibility==='0'" style="color:#cd4130">（方案即将过期，不可勾选）</div>
              </div>
              <div class="right-btns">
                <el-checkbox v-model="el.isSelect" :disabled="el.isEligibility==='0'" @change="(val)=>selectOfferChange(val,el,index)"></el-checkbox>
              </div>
            </div>
            <div class="offer-info">
              <div class="offer-content">
                <el-table :data="el.feeList" style="width: 100%">
                  <el-table-column prop="feeName" label="Fee name" align="center" width="135">
                  </el-table-column>
                  <el-table-column prop="feeQuantity" label="Number" align="center">
                  </el-table-column>
                  <el-table-column prop="feePrice" label="unit Price" align="center">
                  </el-table-column>
                  <el-table-column prop="feeCurrency" label="Currency" align="center">
                  </el-table-column>
                  <el-table-column prop="feeTotal" label="Total" align="center">
                  </el-table-column>
                  <el-table-column prop="feeUnit" label="Billing unit" align="center" width="135">
                    <template slot-scope="scope">
                      {{scope.row.feeUnit | feeUnitEn }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="remark" label="Remarks" align="center" width="150">
                  </el-table-column>
                </el-table>
                <div class="fee-total">Fee Total：<span v-for="(item,i) in totalAmount(el.feeList)" :key="i">{{item.value}} {{item.label}}<span v-if="totalAmount(el.feeList).length>0&&index<totalAmount(el.feeList).length-1">+</span></span></div>
                <div class="others-info">
                  <el-row>
                    <el-col :span="12" v-if="!['rail_export_fcl','rail_export_lcl'].includes( el.businessType) && el.carrier">
                      <div class="flex-content-box"><span class="offer-content-title">Carrier：</span><span class="flex-content-offer-value">{{el.carrier}}</span></div>
                    </el-col>
                    <el-col :span="12" v-if="['ship_import_fcl', 'ship_import_lcl', 'air_import'].includes( el.businessType)">
                      <div class="flex-content-box"><span class="offer-content-title">T/T：</span><span class="flex-content-offer-value">{{el.tT}}</span></div>
                    </el-col>
                    <el-col :span="12" v-if="['ship_import_fcl', 'ship_import_lcl', 'air_import'].includes( el.businessType)">
                      <div class="flex-content-box"><span class="offer-content-title">ETD：</span><span class="flex-content-offer-value">{{el.etd}}</span></div>
                    </el-col>
                    <!-- <el-col :span="12" v-if="['ship_export_fcl', 'ship_export_lcl', 'air_export','rail_export_fcl','rail_export_lcl','ship_bulk_ro'].includes( el.businessType) && el.categoryName">
                      <div class="flex-content-box"><span class="offer-content-title">Supplier：</span><span class="flex-content-offer-value">{{el.categoryName}}</span></div>
                    </el-col> -->
                    <el-col :span="12">
                      <div class="flex-content-box"><span class="offer-content-title">Validity Date Type：</span><span class="flex-content-offer-value">{{getDictLabel('validityDateType', el.validityDateType)}}</span></div>
                    </el-col>
                    <el-col :span="12">
                      <div class="flex-content-box"><span class="offer-content-title">Validity Date：</span><span class="flex-content-offer-value">{{el.startDateValidity}}~{{el.endDateValidity}}</span></div>
                    </el-col>
                    <el-col :span="24">
                      <div class="flex-content-box"><span class="offer-content-title">POD (ADVISED)：</span><span v-if="['air_export','air_import'].includes(el.businessType)" class="flex-content-offer-value">{{el.podRecommendCode}}</span><span v-else class="flex-content-offer-value">{{el.podRecommendName}}</span></div>
                    </el-col>
                  </el-row>
                  <!-- <div v-for="(item,i) in formatFileList(el.fileNameStr, el.fileNoStr)" :key="item.fileNo">
                    <div class="file-item"><span class="inquiryn-content-title">ANNEX({{i+1}})：</span><span title="点击下载" class="file-name" @click="handleDownload(item.fileName,item.fileNo)">{{item.fileName}}</span></div>
                  </div> -->
                  <div class="flex-content-box"><span class="offer-content-title">Remarks：</span><span class="flex-content-offer-value" v-html="formatRemarke(el.quoteRemark)"></span></div>
                </div>

              </div>
            </div>
          </div>
        </div>
        <div v-if="!offerRecordList.length" class="offer-record-empty">未查询到报价方案</div>
      </div>

    </div>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import Search from '@/components/Base/Search/index'
import { baseEmployeeListName } from '@/api/base'
import { unique } from '@/utils/index'
import { viewQuotationScheme, lookScheme } from '@/api/charge'
import { getDictLabel } from '@/utils/tools'
import { accAdd } from '@/utils/index'
import store from '@/store'
const defaultPage = {
  pageSize: 10,
  currPage: 1
}
const defaultTableQuery = {
  columns: [],
  ascColumns: [],
  descColumns: ['createdTime'],
  query: [],
  state: ''
}
export default {
  filters: {
    formatValidity(val) {
      return val.replace(',', '~')
    },
    feeUnitEn(val) {
      let item = store.state.dict.dictMap.feeUnit.find((el) => el.value === val)
      if (item) {
        return item.en
      } else {
        return ''
      }
    }
  },
  data() {
    return {
      getDictLabel: getDictLabel,
      selectedData: [],
      schemeSelect: '',
      offerRecordList: [],
      tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
      searchConfig: [
        {
          key: 'quotationNumber',
          label: '报价编号',
          type: 'input',
          searchType: 'eq',
          value: ''
        },
        {
          key: 'schemeNumber',
          label: '方案编号',
          type: 'input',
          searchType: 'eq',
          value: ''
        },
        {
          key: 'enquiryNo',
          label: '询价编号',
          type: 'input',
          searchType: 'eq',
          value: ''
        },
        {
          key: 'quotationId',
          label: '报价人',
          type: 'remoteSelect',
          searchType: 'eq',
          saveList: [],
          value: '',
          data: [],
          nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.getQuotationEmployeeName('', item)
          },
          filterMehod: (val, item) => {
            this.getQuotationEmployeeName(val, item)
          },
          change: (val, item) => {
            let findItem = item.data.find((ele) => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
        {
          key: 'category',
          label: '供应商',
          type: 'remoteSelect',
          saveList: [],
          searchType: 'eq',
          value: '',
          data: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getSupplierList('', item)
          },
          filterMehod: (val, item) => {
            this.getSupplierList(val, item)
          },
          change: (val, item) => {
            let findItem = item.data.find((ele) => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        }
        // {
        //   key: 'validity',
        //   label: 'Validity',
        //   type: 'date',
        //   searchType: 'eq',
        //   format: 'yyyy-MM-dd',
        //   category: 'daterange',
        //   value: ''
        // }
      ],
      searchConditionHide: true, // 隐藏自定义搜索
      dialogConfig: {
        title: '选择报价方案',
        show: true,
        width: '1200px'
      }
    }
  },
  props: {
    bdId: {
      type: [String, Number],
      default: ''
    },
    polCode: {
      type: [String, Number],
      default: ''
    },
    podCode: {
      type: [String, Number],
      default: ''
    },
    porCode: {
      type: [String, Number],
      default: ''
    },
    businessType: {
      type: String,
      default: ''
    },
    schemeNumber: {
      type: String,
      default: ''
    }
  },
  created() {
    this.getList()
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      roles: (state) => state.user.roles,
      userId: (state) => state.user.userId
    }),
    schemeNumberArr() {
      let arr = this.schemeNumber
      return arr.split(',')
    }
  },
  watch: {
    offerRecordList: {
      handler(val) {
        this.selectedData = val.filter((el) => {
          return el.isSelect === true
        })
      },
      deep: true,
      immediate: true // 是否第一次触发
    }
  },
  components: {
    BaseDialog,
    Search
  },
  methods: {
    totalAmount(data = []) {
      let arr = []
      for (let i = 0; i < data.length; i++) {
        if (data[i].feeTotal && data[i].feeCurrency) {
          if (!arr.find((el) => el.label == data[i].feeCurrency)) {
            arr.push({
              value: data[i].feeTotal,
              label: data[i].feeCurrency
            })
          } else {
            let index = arr.findIndex((el) => el.label == data[i].feeCurrency)
            arr[index].value = accAdd(arr[index].value, data[i].feeTotal)
          }
        }
      }
      return arr
    },
    formatFileList(otherFileName, otherFileNo) {
      let otherFileNameArr = otherFileName ? otherFileName.split(',') : []
      let otherFileNoArr = otherFileNo ? otherFileNo.split(',') : []
      let arr = []
      for (let i = 0; i < otherFileNameArr.length; i++) {
        arr.push({
          fileNo: otherFileNoArr[i],
          fileName: otherFileNameArr[i]
        })
      }
      return arr
    },
    formatRemarke(val) {
      return val.replace(/\n|\r\n/g, '<br>')
    },
    getTotal(type, n1, n2, n3, n4, n5, n6) {
      let total = 0
      if (type === 'PER_CONTAINER') {
        if (n1 && n4) {
          total += n1 * n4
        }
        if (n2 && n5) {
          total += n2 * n5
        }
        if (n3 && n6) {
          total += n3 * n6
        }
      } else {
        if (n1) {
          total += n1 * 1
        }
        if (n2) {
          total += n2 * 1
        }
        if (n3) {
          total += n3 * 1
        }
      }
      return Number(total).fixed(2)
    },
    selectOfferChange(value, val, index) {
      if (!this.offerRecordList[index].isSelect) {
        if (this.selectedData.length >= 3) {
          return this.$message.error('最多允许关联 3个 报价方案')
        }
        this.$set(this.offerRecordList[index], 'isSelect', true)
      } else {
        this.$set(this.offerRecordList[index], 'isSelect', false)
      }
    },
    selectOffer(val, index) {
      if (val.isEligibility === '0') {
        return
      }
      if (!this.offerRecordList[index].isSelect) {
        if (this.selectedData.length >= 3) {
          return this.$message.error('最多允许关联 3个 报价方案')
        }
        this.$set(this.offerRecordList[index], 'isSelect', true)
      } else {
        this.$set(this.offerRecordList[index], 'isSelect', false)
      }
    },
    getList() {
      let params = {
        bd: this.userId,
        polCode: this.polCode,
        podCode: this.podCode,
        porCode: this.porCode,
        businessType: this.businessType,
        enquiryId: '',
        quotationNumber: '',
        schemeNumber: '',
        quotationId: '',
        category: '',
        validity: '',
        enquiryNo: ''
      }
      for (let i = 0; i < this.tableQuery.query.length; i++) {
        params[this.tableQuery.query[i].column] = this.tableQuery.query[i].value
      }
      if (params.validity) {
        params.validity = params.validity.join(',')
      }
      viewQuotationScheme(params).then((res) => {
        if (
          Array.isArray(res.data.woInquiryList) &&
          res.data.woInquiryList.length
        ) {
          this.offerRecordList = res.data.woInquiryList.map((ele) => {
            return Object.assign(ele, {
              isSelect: false
            })
          })

          if (this.schemeNumberArr.length) {
            for (let i = 0; i < this.offerRecordList.length; i++) {
              if (
                this.schemeNumberArr.includes(
                  this.offerRecordList[i].schemeNumber
                )
              ) {
                this.$set(this.offerRecordList[i], 'isSelect', true)
              }
            }
          }
        } else {
          this.offerRecordList = []
        }
      })
    },
    // 供应商
    getSupplierList(queryString, item) {
      console.log(item)
      this.$store
        .dispatch('dict/queryAllSupplierList', {
          queryString: queryString
        })
        .then((data) => {
          item.data = data.list.map((ele) => {
            return Object.assign(ele, {
              label: ele.name,
              value: ele.supplierId ? Number(ele.supplierId) : ''
            })
          })
        })
    },
    // 报价人
    getQuotationEmployeeName(val, item) {
      let data1 = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        roleCode: 'ecs'
      }
      let data2 = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        roleCode: 'epricing'
      }
      Promise.all([
        baseEmployeeListName(data1),
        baseEmployeeListName(data2)
      ]).then((res) => {
        if (!item.multiple) item.saveList = []
        let filterArr0 = res[0].data.filter(
          (ele) => !item.saveList.find((o) => o.value === ele.employeeId)
        )
        let filterArr1 = res[1].data.filter(
          (ele) => !item.saveList.find((o) => o.value === ele.employeeId)
        )
        let itemList0 = filterArr0.map((ele) => {
          return {
            ...ele,
            label: this.$language === 'en' ? ele.ename : ele.cname,
            value: ele.employeeId ? Number(ele.employeeId) : ''
          }
        })
        let itemList1 = filterArr1.map((ele) => {
          return {
            ...ele,
            label: this.$language === 'en' ? ele.ename : ele.cname,
            value: ele.employeeId ? Number(ele.employeeId) : ''
          }
        })
        item.data = unique(
          [...item.saveList, ...itemList0, ...itemList1],
          'employeeId'
        )
      })
    },
    // 查询组件回调
    searchCallBack(action) {
      let query = []
      if (action === 'Search') {
        //默认的查询条件组装tableQuery参数
        console.log(this.searchConfig)
        if (this.searchConfig.length) {
          this.searchConfig.forEach((item, index) => {
            if (item.value) {
              let tempQuery = {}
              Object.assign(tempQuery, {
                column: item.key,
                type: item.searchType || 'eq',
                value: item.queryValue ? item.queryValue : item.value
              })
              query.push(tempQuery)
            }
          })
        }
        Object.assign(this.tableQuery, {
          query: query.filter((item) => {
            return item.value
          }),
          currPage: 1
        })
        console.log('serach:', this.tableQuery)
        this.getList()
      }

      if (action === 'Reset') {
        this.searchInputGroup = []
        this.searchConfig.forEach((item) => {
          item.value = ''
        })
        Object.assign(this.tableQuery, defaultTableQuery, defaultPage)
        this.getList()
      }
    },
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },

    validate() {
      return true
    },

    dialogCallback(action, done) {
      if (action === 'Confirm') {
        // 表单校验
        if (!this.selectedData.length) {
          this.$message.warning('请选择报价方案')
          return
        }
        this.close('Confirm', this.selectedData)
      } else {
        this.close('Cancel')
      }
    },
    handleSubmit(done) {}
  }
}
</script>

<style lang="scss">
.offer-record {
  .fee-total {
    margin-top: 4px;
    color: #409eff;
  }
  .bidder-number {
    margin-right: 20px;
  }
  .offer-record-empty {
    padding-top: 48px;
    text-align: center;
    font-size: 18px;
    font-weight: 600;
  }
  .offer-item {
    background: #ffffff;
    border-radius: 2px;
    border: 1px solid #d9d9d9;
    margin-bottom: 16px;
    cursor: pointer;
    .offer-item-title {
      height: 40px;
      background: #ebeef3;
      border-radius: 2px 2px 0px 0px;
      border-bottom: 1px solid #d9d9d9;
      display: flex;
      align-items: center;
      padding: 0 16px;
      font-weight: bold;
      color: #222222;
      justify-content: space-between;
      .left {
        display: flex;
        align-items: center;
        .freight-item-surrender {
          margin-right: 8px;
          img {
            width: 28px;
            height: 28px;
            border-radius: 14px;
          }
        }
        .bidder {
          margin-right: 12px;
        }
      }
      .right-btns {
        display: flex;
        // .extend-time {
        //   width: 92px;
        //   height: 28px;
        //   background: #ffffff;
        //   border-radius: 2px;
        //   color: #4a4a4a;
        //   margin-right: 16px;
        //   text-align: center;
        //   line-height: 28px;
        // }
        // .invalid-time {
        //   width: 56px;
        //   height: 28px;
        //   background: #cd4130;
        //   border-radius: 2px;
        //   color: #fff;
        //   text-align: center;
        //   line-height: 28px;
        // }
        .offer-btn {
          cursor: pointer;
        }
      }
    }
    .offer-info {
      padding: 16px;
      .offer-content {
        line-height: 18px;
        color: #666;
        border-radius: 10px;
        position: relative;
        .others-info {
          color: #4a4a4a;
          line-height: 20px;
          margin-bottom: 4px;
          margin-top: 8px;
        }
        .offer-cost {
          border-left: 1px solid #d9d9d9;
          .offer-cost-item-name {
            background: #ebeef3;
            box-shadow: inset 0px 1px 0px 0px #d9d9d9;
            display: flex;
            font-weight: bold;
            color: #222222;
            .cost-name {
              width: 40%;
              text-align: center;
              line-height: 20px;
              padding: 6px;
            }
            .amount {
              width: 20%;
              text-align: center;
              line-height: 20px;
              padding: 6px;
            }
          }
          .offer-cost-line {
            display: flex;
            background: #fff;
            box-sizing: border-box;
            .cost-name {
              width: 40%;
              padding: 6px;
              display: flex;
              align-items: center;
            }
            .amount {
              width: 20%;
              padding: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
        }
      }
    }
  }
  .offer-item-disabled {
    cursor: not-allowed !important;
  }
  .right-border {
    border-right: 1px solid #d9d9d9;
  }
  .left-border {
    border-left: 1px solid #d9d9d9;
  }
  .top-border {
    border-top: 1px solid #d9d9d9;
  }
  .bottom-border {
    border-bottom: 1px solid #d9d9d9;
  }
  .is-self-offer {
    border: 1px solid #3e80f5;
    .offer-item-title {
      background: #3e80f5;
      border: 0;
      border-radius: 0;
      color: #fff;
    }
    .offer-info {
      background: #eff4fd;
    }
  }
  .flex-content-box {
    display: flex;
  }
  .offer-content-title {
    display: inline-block;
    width: 120px;
    text-align: right;
  }
  .flex-content-box {
    display: flex;
  }
  .flex-content-offer-value {
    max-width: calc(100% - 120px);
    word-wrap: break-word;
  }
}
</style>
