<template>
  <div>
    <div v-for="(el,index) in offerRecordList" :key="index">
      <div class="offer-item" :class="{'is-self-offer':userId==el.createdBy}">
        <div class="offer-item-title">
          <div class="left">
            <!-- <div class="freight-item-surrender">
              <img src="../../../../../assets/head.png" alt="">
            </div> -->
            <el-tag v-if="bidSchemeNumber===el.schemeNumber" size="mini" type="success" style="margin-right:4px;margin-left:-8px">Awarded</el-tag>
            <!-- <div class="bidder">Quoter：{{el.createdName}}</div> -->
            <div class="bidder-number" title="Quotation scheme No.">{{el.schemeNumber}}</div>
          </div>
          <div class="right-btns" v-if="userId==el.createdBy && el.state==='valid' && quoteArr.includes(el.createdBy) && !['BREAK'].includes(status)">
            <div class="extend-time offer-btn" @click="handleAddTem(el)">Save as template</div>
            <div class="extend-time offer-btn" @click="handleValidityDate(el)">Extend expiration date</div>
            <div class="invalid-time offer-btn" @click="handleInvalid(el)">Expire</div>
          </div>
        </div>
        <div class="offer-info">
          <div class="offer-content">
            <el-table :data="el.feeList" style="width: 100%">
              <el-table-column prop="feeName" label="Fee name" align="center" width="135">
              </el-table-column>
              <el-table-column prop="feeQuantity" label="Number" align="center" width="80">
              </el-table-column>
              <el-table-column prop="feePrice" label="unit Price" align="center" width="80">
              </el-table-column>
              <el-table-column prop="feeCurrency" label="Currency" align="center" width="80">
              </el-table-column>
              <el-table-column prop="feeTotal" label="Total" align="center" width="70">
              </el-table-column>
              <el-table-column prop="feeUnit" label="Billing unit" align="center" width="100">
                <template slot-scope="scope">
                  {{scope.row.feeUnit | feeUnitEn }}
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="Remarks" align="center">
              </el-table-column>
            </el-table>
            <div class="fee-total">Fee Total：<span v-for="(item,index) in totalAmount(el.feeList)" :key="index">{{item.value}} {{item.label}}<span v-if="totalAmount(el.feeList).length>0&&index<totalAmount(el.feeList).length-1">+</span></span></div>
            <div class="others-info">
              <el-row>
                <el-col :span="12">
                  <div class="flex-content-box"><span class="offer-content-title">Quoter：</span><span class="flex-content-offer-value">{{el.createdName}}</span></div>
                </el-col>
                <el-col :span="12" v-if="!['rail_export_fcl','rail_export_lcl'].includes( el.businessType) && el.carrier">
                  <div class="flex-content-box"><span class="offer-content-title">Carrier：</span><span class="flex-content-offer-value">{{el.carrier}}</span></div>
                </el-col>
                <el-col :span="12" v-if="['ship_import_fcl', 'ship_import_lcl', 'air_import'].includes( el.businessType)">
                  <div class="flex-content-box"><span class="offer-content-title">T/T：</span><span class="flex-content-offer-value">{{el.tT}}</span></div>
                </el-col>
                <el-col :span="12" v-if="['ship_import_fcl', 'ship_import_lcl', 'air_import'].includes( el.businessType)">
                  <div class="flex-content-box"><span class="offer-content-title">ETD：</span><span class="flex-content-offer-value">{{el.etd}}</span></div>
                </el-col>
                <!-- && ['ship_export_fcl', 'ship_export_lcl', 'air_export','rail_export_fcl','rail_export_lcl','ship_bulk_ro'].includes( el.businessType) && el.categoryName -->
                <el-col :span="12" v-if="participantType==='quote'">
                  <div class="flex-content-box"><span class="offer-content-title">Supplier：</span><span class="flex-content-offer-value">{{el.categoryName}}</span></div>
                </el-col>
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
              <div v-for="(item,i) in formatFileList(el.fileNameStr, el.fileNoStr)" :key="item.fileNo">
                <div class="file-item"><span class="offer-content-title">ANNEX({{i+1}})：</span><span title="Click to download" class="file-name" @click="handleDownload(item.fileName,item.fileNo)">{{item.fileName}}</span></div>
              </div>
              <div class="flex-content-box"><span class="offer-content-title">Remarks：</span><span class="flex-content-offer-value" v-html="formatRemarke(el.quoteRemark)"></span></div>
            </div>
            <div class="offer-orderNo">
              <div class="flex-content-box">
                <span class="offer-content-title112">Associated order number：</span>
                <span class="flex-content-offer-value112" v-if="el.orderNoList && el.orderNoList.length">{{el.orderNoList.join(',')}}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    <div v-if="!offerRecordList.length" class="offer-record-empty">No inquiry for quotation scheme</div>
    <div v-if="changeValidityDateShow">
      <ChangeValidityDatePop @close="changeValidityDateClose" :currentRow="currentRow"></ChangeValidityDatePop>
    </div>
    <div v-if="addTemPopShow">
      <AddTemPop @close="addTemPopClose"></AddTemPop>
    </div>
  </div>

</template>

<script>
import ChangeValidityDatePop from './changeValidityDatePop.vue'
import AddTemPop from './addTemPop.vue'
import { invalidityOrDelay, enquiryTempSave } from '@/api/charge'
import { getDictLabel } from '@/utils/tools'
import { accAdd } from '@/utils/index'
import store from '@/store'
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
  components: { ChangeValidityDatePop, AddTemPop },
  data() {
    return {
      getDictLabel: getDictLabel,
      addTemPopShow: false,
      changeValidityDateShow: false,
      currentRow: ''
    }
  },
  props: {
    offerRecordList: {
      type: Array,
      default() {
        return []
      }
    },
    quoteArr: {
      type: Array,
      default() {
        return []
      }
    },
    userId: {
      type: [Number, String],
      default: ''
    },
    participantType: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: ''
    },
    bidSchemeNumber: {
      type: String,
      default: ''
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
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
    handleDownload(fileName, fileNo) {
      this.$store
        .dispatch('order/downloadBlobFile', {
          uri: '/base/webapi/file/download',
          params: {
            fileNo: fileNo
          }
        })
        .then((res) => {
          console.log(res)
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = fileName
          link.click()
        })
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
    handleAddTem(row) {
      this.currentRow = row
      this.addTemPopShow = true
    },
    addTemPopClose(action, value) {
      if (action === 'Confirm') {
        let params = {
          tempName: value.tempName,
          quoteId: this.currentRow.oid
        }
        enquiryTempSave(params)
          .then((res) => {
            this.$emit('getList')
            this.addTemPopShow = false
            this.$message({ type: 'success', message: 'Add template successfully' })
          })
          .finally(() => {})
      } else {
        this.addTemPopShow = false
      }
    },
    setInvalidity(row, delayDate) {
      let params = {
        flag: 'invalidity', //delay:延期失效：invalidity
        oid: row.oid,
        schemeNumber: row.schemeNumber
      }
      if (delayDate) {
        params.delayDate = delayDate
      }
      invalidityOrDelay(params).then((res) => {
        this.$message({ type: 'success', message: 'Setting failure success' })
        this.$emit('getList')
      })
    },
    handleValidityDate(row) {
      this.currentRow = row
      this.changeValidityDateShow = true
    },
    changeValidityDateClose(action, value) {
      if (action === 'Confirm') {
        let params = {
          flag: 'delay', //delay:延期失效：invalidity
          oid: this.currentRow.oid,
          schemeNumber: this.currentRow.schemeNumber,
          startDateValidity: value.delayDate[0],
          endDateValidity: value.delayDate[1]
        }
        invalidityOrDelay(params)
          .then((res) => {
            this.$emit('getList')
            this.changeValidityDateShow = false
            this.$message({ type: 'success', message: 'Modified successfully' })
          })
          .finally(() => {})
      } else {
        this.changeValidityDateShow = false
      }
    },
    handleInvalid(row) {
      // 设置失效
      this.$confirm(
        'After lapsing, this offer will no longer be referenced, is it OK to lapse this offer?',
        'Tips',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      )
        .then(() => {
          this.setInvalidity(row)
        })
        .catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.fee-total {
  color: #409eff;
  display: flex;
  justify-content: flex-end;
  background: #fff;
  height: 24px;
  align-items: center;
  padding-right: 8px;
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
    background: #ebe8f6;
    border-radius: 2px 2px 0px 0px;
    border-bottom: 1px solid #d9d9d9;
    display: flex;
    align-items: center;
    padding: 0 12px;
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
      .extend-time {
        padding: 0 8px;
        height: 22px;
        background: #ffffff;
        border-radius: 2px;
        color: #4a4a4a;
        margin-right: 12px;
        text-align: center;
        line-height: 22px;
        font-size: 12px;
      }
      .invalid-time {
        padding: 0 8px;
        height: 22px;
        background: #cd4130;
        border-radius: 2px;
        color: #fff;
        text-align: center;
        line-height: 22px;
      }
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
      .offer-orderNo {
        border-top: 1px dashed #222;
        padding-top: 4px;
        font-weight: 600;
        color: #111;
      }
      .offer-cost {
        border-left: 1px solid #d9d9d9;
        .offer-cost-item-name {
          background: #f4f5f8;
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
.offer-content-title112 {
  display: inline-block;
  width: 168px;
  text-align: right;
}
.flex-content-offer-value {
  max-width: calc(100% - 120px);
  word-wrap: break-word;
}
.flex-content-offer-value112 {
  max-width: calc(100% - 168px);
  word-wrap: break-word;
}
.file-name {
  color: #1890ff;
  line-height: 18px;
  cursor: pointer;
}
</style>