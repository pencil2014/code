
import axios from 'axios'
import { parseTime, randomString } from '@/utils'
import { getToken } from '@/utils/auth'
import { getInvoicePrintUrlConfig } from '@/api/base'

// 是否正在测试，是测试则只要走过程，激活测试代码
const isTest = false
const headers = { headers: { authorization: getToken() } }
// let InvSvr = 'http://192.168.1.13:9001/InvSvr'
let InvSvr = ''
function getInvSvr(settleCompCode) {
  return getInvoicePrintUrlConfig(settleCompCode).then(res => {
    console.log('获取打印地址成功~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    InvSvr = res.data && res.data.url
  }).catch(err => {
    console.log('获取打印地址失败!!!!!!!!!!!!!!!!!!!!');
    InvSvr = ''
  })
}
// getInvSvr()
export const printMixin = {
  methods: {
    hasInvSvr() {
      if (isTest) return true
      if (InvSvr) {
        // console.log(InvSvr);
        return true
      } else {
        // this.$confirmWarn('打印地址不存在，是否重新获取地址？', () => {
        //   getInvSvr()
        // })
        return false
      }
    },
    // 查库存 应收开票申请才会有参数 initRow， stockOk， stockErr
    async queryStockAction(initRow, stockOk, stockErr, settleCompCode) {
      if (isTest) {
        let data2 = {
          "invoiceStock": 239903,
          "taxClock": "2020-11-25 11:40:06",
          "invoiceCode": "044031800102",
          "invoiceNumber": "2084"
        }
        this._$retPrint = data2
        if (data2.invoiceNumber) {
          return stockOk ? stockOk(data2) : this.printStock()
        }
        return
      }
      if (settleCompCode) {
        await getInvSvr(settleCompCode)
      }
      if (!this.hasInvSvr()) return
      initRow && initRow()
      let data = {
        SID: '0',
        invoiceType: this.rowData.invoiceType === 'ordinary' ? '2' : '0',
      }
      this.printLoading = this._$printLoading('库存查询中...')
      // setTimeout(() => {
      //   this.printLoading.close()
      //   data = {
      //     "invoiceStock": 239903,
      //     "taxClock": "2020-11-25 11:40:06",
      //     "invoiceCode": "044031800102",
      //     "invoiceNumber": "2084"
      //   }
      //   this._$retPrint = data
      //   if (data.invoiceNumber) {
      //     return stockOk ? stockOk(data) : this.printStock()
      //   }
      //   stockErr && stockErr()
      //   this.$message.error('库存不足！')
      // }, 100);
      // return
      console.log(this.invoiceReceivableId)
      console.log(this.rowData.invoiceReceivableId)
      axios
        .post(InvSvr, this._$params(data), headers)
        .then(({ data }) => {
          this.printLoading.close()
          data = data.data
          //  "data":{
          //     "invoiceStock":239903,
          //     "taxClock":"2020-11-25 11:40:06",
          //     "invoiceCode":"044031800102",
          //     "invoiceNumber":"2084"
          // }
          this._$retPrint = data
          if (data.invoiceNumber) {
            return stockOk ? stockOk(data) : this.printStock()
          }
          stockErr && stockErr()
          this.$message.error('库存不足！')
        })
        .catch((err) => {
          console.log(err)
          this.$message.error('库存查询失败！')
          this.printLoading.close()
        })
    },
    // 开票并打印接口  应收开票申请才会有参数 printReview
    printStock(printReview) {
      if (!this.hasInvSvr()) return
      let data = {
        SID: '99',
        // invoiceReceivableId: this.rowData.invoiceReceivableId || this.invoiceReceivableId,
        invoiceReceivableId: this.invoiceReceivableId || this.rowData.invoiceReceivableId,
      }
      this.printLoading = this._$printLoading('打印中...')
      if (isTest) {
        setTimeout(() => {
          this.printLoading.close()
          if (!data.data) {
            this.$confirmWarn(`${data.msg || '开票失败！'}，是否继续操作？`, () => {
              printReview && printReview()
            })
            return
          }
          let code = data.data.retCode
          if (code == 5011) {
            printReview && printReview()
            return this.$message.success('打印成功！')
          }
          if (!data.data.invoiceCode) {
            return this.$message.error('未正确开具发票号码，请核实！')
          }
          if (printReview) {
            return printReview()
          }
          // 开票成功 打印失败
          this.$confirmWarn(`打印失败，是否重试？`, () => {
            this.printOnly({
              SID: '2',
              // invoiceReceivableId: this.rowData.invoiceReceivableId || this.invoiceReceivableId,
              invoiceReceivableId: this.invoiceReceivableId || this.rowData.invoiceReceivableId,
              invoiceType: this.rowData.invoiceType === 'ordinary' ? '2' : '0',
              invoiceCode: this._$retPrint.invoiceCode,
              invoiceNumber: this._$retPrint.invoiceNumber,
            })
          })
        }, 100);
        return
      }
      axios
        .post(InvSvr, this._$params(data), headers)
        .then(({ data }) => {
          this.printLoading.close()
          // 已经打印
          // if (data.code != 0) {
          //   return this.$message.error(data.msg)
          // }
          // 开票不成功
          if (!data.data) {
            this.$confirmWarn(`${data.msg || '开票失败！'}，是否继续操作？`, () => {
              printReview && printReview()
            })
            // this.$msgErrClose(data.msg || '开票失败！')
            return
          }
          let code = data.data.retCode
          // 开票成功 打印成功
          if (code == 5011) {
            printReview && printReview()
            return this.$message.success('打印成功！')
          }
          // 开票失败
          if (!data.data.invoiceCode) {
            return this.$message.error('未正确开具发票号码，请核实！')
          }
          if (printReview) {
            return printReview()
          }
          // 开票成功 打印失败
          this.$confirm('打印失败，是否重试？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }).then((res) => {
            this.printOnly({
              SID: '2',
              // invoiceReceivableId: this.rowData.invoiceReceivableId || this.invoiceReceivableId,
              invoiceReceivableId: this.invoiceReceivableId || this.rowData.invoiceReceivableId,
              invoiceType: this.rowData.invoiceType === 'ordinary' ? '2' : '0',
              invoiceCode: this._$retPrint.invoiceCode,
              invoiceNumber: this._$retPrint.invoiceNumber,
            })
          })
        })
        .catch((err) => {
          printReview && printReview()
          this.$message.error('开票失败！')
          this.printLoading.close()
          console.log(err)
        })
    },
    // 单独打印接口
    async printOnly(data, callback, settleCompCode) {
      //  "data":{
      //     "invoiceStock":239903,
      //     "taxClock":"2020-11-25 11:40:06",
      //     "invoiceCode":"044031800102",
      //     "invoiceNumber":"2084"
      // }
      // this._$retPrint
      if (settleCompCode) {
        await getInvSvr(settleCompCode)
      }
      if (!this.hasInvSvr()) return
      this.printLoading = this._$printLoading('打印中...')
      axios
        .post(InvSvr, this._$params(data), headers)
        .then(({ data }) => {
          this.printLoading.close()
          // 已经打印
          if (!data.data) {
            return this.$msgErrClose(data.msg)
          }
          let code = data.data.retCode
          if (code == 5011) {
            callback && callback()
            return this.$msgSucClose('打印成功！')
          }
          this.$message.error(data.data.retMsg)
        })
        .catch((err) => {
          this.$message.error('打印失败！')
          this.printLoading.close()
          console.log(err)
        })
    },
    // axiox 请求参数
    _$params(data) {
      return {
        fromSystem: 'web_H5',
        toSystem: 'mng_base_server',
        reqId: randomString(),
        reqTime: parseTime(new Date().getTime()),
        data,
      }
    },
    // 页面printLoading
    _$printLoading(text) {
      return this.$loading({
        lock: true,
        text,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)',
      })
    },
  }
}