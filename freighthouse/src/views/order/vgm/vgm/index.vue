<template>
  <div
    class="vgm-cnt finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-list-container">
      <div class="money-box">
        <el-button-group>
          <el-button type="primary" size="mini" @click="addSo">新增SO</el-button>
        </el-button-group>
        <el-button-group>
          <el-button size="mini" @click="reset">重置</el-button>
        </el-button-group>
      </div>
      <div class="carrier-box">
        <div class="item">
          接入方：
          <el-radio-group v-model="carrierSource" size="mini" @change="changeCarrier">
            <el-radio-button
              v-for="item in carrierSourceList"
              :key="item"
              :label="item"
            ></el-radio-button>
          </el-radio-group>
        </div>
        <div class="item">
          船司：
          <el-select v-model="scac" clearable filterable class="large-select" size="mini">
            <el-option
              v-for="item in scacList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </div>
      </div>
      <FinanceTableMass :option="option1" :autoMax="true" />
      <div class="btn-box">
        <el-button type="primary" size="small" @click="sumit('draft')" :loading="btnLoad">保存草稿</el-button>
        <el-button type="primary" size="small" @click="sumit('')" :loading="btnLoad">提交</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { vgmDetail, vgmSave } from '@/api/order/onlineVgm'
import { containerTypeList, dictAll, carrierList } from '@/api/order/createBooking'
import { vgmList } from '@/api/order/vgm'
export default {
  components: {
    FinanceTableMass,
  },
  mixins: [mixin, routerMixin],
  data() {
    return {
      lsLoading: false,
      option1: {},
      shipId: '',
      containerTypeList: [],
      source: {},
      dictList: [],
      btnLoad: false,
      carrierSourceList: [],
      carrierSource: '',
      scacList: [],
      scac: '',
      sourceCarrier: [],
      noMsklist: [],
      mskList: [],
    }
  },
  created() {
    this.shipId = this.$route.query.shipId || ''
    if (this.shipId) {
      this.getDetail()
    } else {
      this.getVgmList()
      this.getCarrierSourceList()
    }
    this.getDictAll()
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      width: '120px',
      fixed: 'right',
      show: true,
      data: [
        {
          label: '增加箱子',
          type: 'text',
          showFn: (row) => !row.child,
          action: 'addContainer',
        },
        {
          label: '删除',
          type: 'text',
          show: true,
          action: 'delContainer',
        },
      ],
      callback: (action, $index, row, option) => {
        if (action === 'addContainer') {
          this.addContainer(row, $index)
        } else if (action === 'delContainer') {
          this.delContainer(row, $index)
        }
      },
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      edit: true,
      noCheckWhenEdit: true,
      data: [],
      columns: [
        {
          prop: 'bookingNo',
          label: 'SO号',
          type: 'input',
          width: '150px',
          required: true,
          hidden: true,
          change: (val, row) => {
            this.changeBookingNo(val, row)
          }
        },
        {
          prop: 'containerNo',
          label: '箱号',
          type: 'input',
          required: true,
          width: '150px',
        },
        {
          prop: 'sn',
          label: '封号',
          type: 'input',
          // required: true,
          width: '150px',
        },
        {
          prop: 'containerType',
          label: '箱型',
          type: 'select',
          selectOptions: this.containerTypeList,
          width: '150px',
          filterable: true,
        },
        {
          prop: 'weight',
          label: 'VGM总货重',
          type: 'input',
          required: true,
          width: '150px',
          hasCellSuffix: true,
          cellSuffixContent: 'KGS',
          validateInput: (val, row) => {
            this.weightInput(val, row, 'weight')
          }
        },
        {
          prop: 'responsibleParty',
          label: '责任方',
          type: 'input',
          required: true,
          width: '150px',
        },
        {
          prop: 'authorizer',
          label: '授权人',
          type: 'input',
          required: true,
          width: '150px',
        },
        {
          prop: 'cargoWeight',
          label: '货重',
          type: 'input',
          width: '150px',
          hasCellSuffix: true,
          cellSuffixContent: 'KGS',
          validateInput: (val, row) => {
            this.weightInput(val, row, 'cargoWeight')
          }
        },
        {
          prop: 'containerWeight',
          label: '箱重',
          type: 'input',
          width: '150px',
          hasCellSuffix: true,
          cellSuffixContent: 'KGS',
          validateInput: (val, row) => {
            this.weightInput(val, row, 'containerWeight')
          }
        },
        {
          prop: 'weightMethod',
          label: '称重方法',
          type: 'select',
          width: '100px',
          required: true,
          selectOptions: this.dictList,
        },
        // {
        //   prop: 'contractName',
        //   label: '联系人',
        //   type: 'input',
        //   width: '150px',
        // },
        {
          prop: 'contractEmail',
          label: '联系人邮箱',
          type: 'input',
          width: '200px',
        },
        // {
        //   prop: 'contractPhone',
        //   label: '联系人电话',
        //   type: 'input',
        //   width: '150px',
        // },
      ],
      tips: {
        text: '',
        show: false,
      },
      selection: {
        text: '',
        show: false,
      },
      operationBtns,
      pagination: false,
      handleBlur: (evt, option, row, rowIndex, prop) => {
        if (prop === 'weight' || prop === 'cargoWeight' || prop === 'containerWeight') {
          this.handleBlurCb(row, rowIndex, prop)
        }
         
      }
    })
  },
   watch: {
      carrierSource (val) {
        if (val === 'msk') {
          const mskColums = [
            {
              prop: 'bookingNo',
              label: 'SO号',
              type: 'input',
              required: true,
              hidden: true,
              change: (val, row) => {
                this.changeBookingNo(val, row)
              }
            },
            {
              prop: 'containerNo',
              label: '箱号',
              type: 'input',
              required: true,
            },
            {
              prop: 'weight',
              label: 'VGM总货重',
              type: 'input',
              required: true,
              hasCellSuffix: true,
              cellSuffixContent: 'KGS',
              validateInput: (val, row) => {
                this.weightInput(val, row, 'weight')
              }
            },
            {
              prop: 'authorizer',
              label: '授权人',
              type: 'input',
            },
            {
              prop: 'contractEmail',
              label: '联系人邮箱',
              type: 'input',
            },
            {
              prop: 'weightMethod',
              label: '称重方法',
              type: 'select',
              required: true,
              selectOptions: this.dictList,
            },
          ]
          this.option1.columns = mskColums
        } else {
          const columns = [
          {
            prop: 'bookingNo',
            label: 'SO号',
            type: 'input',
            width: '150px',
            required: true,
            hidden: true,
            change: (val, row) => {
              this.changeBookingNo(val, row)
            }
          },
          {
            prop: 'containerNo',
            label: '箱号',
            type: 'input',
            required: true,
            width: '150px',
          },
          {
            prop: 'sn',
            label: '封号',
            type: 'input',
            // required: true,
            width: '150px',
          },
          {
            prop: 'containerType',
            label: '箱型',
            type: 'select',
            selectOptions: this.containerTypeList,
            width: '150px',
            filterable: true,
          },
          {
            prop: 'weight',
            label: 'VGM总货重',
            type: 'input',
            required: true,
            width: '150px',
            hasCellSuffix: true,
            cellSuffixContent: 'KGS',
            validateInput: (val, row) => {
              this.weightInput(val, row, 'weight')
            }
            // inputType: 'number',
          },
          {
            prop: 'responsibleParty',
            label: '责任方',
            type: 'input',
            required: true,
            width: '150px',
          },
          {
            prop: 'authorizer',
            label: '授权人',
            type: 'input',
            required: true,
            width: '150px',
          },
          {
            prop: 'cargoWeight',
            label: '货重',
            type: 'input',
            width: '150px',
            hasCellSuffix: true,
            cellSuffixContent: 'KGS',
            validateInput: (val, row) => {
              this.weightInput(val, row, 'cargoWeight')
            }
          },
          {
            prop: 'containerWeight',
            label: '箱重',
            type: 'input',
            width: '150px',
            hasCellSuffix: true,
            cellSuffixContent: 'KGS',
            validateInput: (val, row) => {
              this.weightInput(val, row, 'containerWeight')
            }
          },
          {
            prop: 'weightMethod',
            label: '称重方法',
            type: 'select',
            width: '100px',
            required: true,
            selectOptions: this.dictList,
          },
          // {
          //   prop: 'contractName',
          //   label: '联系人',
          //   type: 'input',
          //   width: '150px',
          // },
          {
            prop: 'contractEmail',
            label: '联系人邮箱',
            type: 'input',
            width: '200px',
          },
          // {
          //   prop: 'contractPhone',
          //   label: '联系人电话',
          //   type: 'input',
          //   width: '150px',
          // },
          ]
          this.option1.columns = columns
        }
      }
    },
  methods: {
    weightInput(val, row, prop) {
      if (isNaN(val)) {
        // 如果当前输入框内容不是数字，递归删除最后一位，直至成为数字
        let fnSlice = (str) => isNaN(str) && (str !== '-') ? fnSlice(str.slice(0, -1)) : str
        val = fnSlice(val)
        row[prop] = val
      } 
      let dotPos = val.lastIndexOf('.')
      if (dotPos > -1 && val.length - dotPos > 3) {
        val = (+val).toFixed(3)
        row[prop] = val
      }
    },
    changeBookingNo (val, row) {
      let { random } = row
      this.option1.data.forEach(item => {
        if (item.random === random) {
          item.bookingNo = val
        }
      })
    },
    // 重置
    reset() {
      this.shipId = this.$route.query.shipId || ''
      if (this.shipId) {
        this.getDetail()
      } else {
        this.getVgmList()
        this.getCarrierSourceList()
      }
    },
    // 修改接入方
    changeCarrier(val) {
      this.scac = ''
      this.scacList = this.sourceCarrier.filter((item) => item.carrierSource === val)?.map(ele => {
        const { carrierName, scac } = ele
        return {
          label: carrierName,
          value: scac,
        }
      })
      this.getContainerTypeList('')
      this.getDictAll()
    },
    // 获取船司
    getCarrierSourceList(str = '') {
      const data = {
        keyword: str,
        type: 'vgm',
        baseCarrierCode: this.$route.query.carrierCode,
      }
      carrierList(data)
        .then((res) => {
          if (res.code === 0) {
            this.sourceCarrier = res.data || []
            if (this.sourceCarrier.length) {
              this.carrierSourceList = Array.from(new Set(this.sourceCarrier.map((item) => item.carrierSource))) || []
              let shipId = this.$route.query.shipId
              if (!shipId && !this.carrierSource) {
                this.carrierSource = this.carrierSourceList[0]
              } else {
                !this.carrierSource && (this.carrierSource = this.carrierSourceList[0])
              }
              this.scacList = this.sourceCarrier.filter((item) => item.carrierSource === this.carrierSource)?.map(ele => {
                const { carrierName, scac } = ele
                return {
                  label: carrierName,
                  value: scac,
                }
              })
              if (!this.scac) {
                this.scac = this.scacList[0].value || ''
              }
              this.getContainerTypeList('')
            }
            this.getDictAll()
          }
        })
        .catch(() => {})
    },
    // 获取订单vgm
    getVgmList() {
      let data = {
        orderNo: this.$route.query.orderNo,
      }
      vgmList(data).then((res) => {
        if (res.data?.length) {
          let source = res.data.map((item) => {
            let {
              so: bookingNo,
              cn: containerNo,
              totalWeight: weight,
              goodsWeight: cargoWeight,
              emptyWeight: containerWeight,
              charge: responsibleParty,
              custName: authorizer,
              // chargePhone: contractPhone,
              chargeEmail: contractEmail,
            } = item
            return Object.assign({}, item, {
              orderNo: this.$route.query.orderNo,
              bookingNo,
              containerNo,
              weight,
              cargoWeight,
              containerWeight,
              responsibleParty,
              authorizer,
              // contractPhone,
              contractEmail,
              edit: true,
              random: Math.random()
            })
          })
          this.option1.data = source
        }
      })
    },
    // 获取详情
    getDetail() {
      const data = {
        shipId: this.shipId,
      }
      vgmDetail(data)
        .then((res) => {
          this.source = res.data
          if (res.data?.containers?.length) {
            const { status, bookingNo, carrierSource, scac } = res.data
            let weightVal = ''
            this.carrierSource = carrierSource || ''
            this.scac = scac || ''
            this.getCarrierSourceList()
            let random = Math.random()
            this.getDictAll()
            this.option1.data = res.data.containers.map((item, index) => {
              if (index !== 0) {
                item.child = true
                item.hidden = true
              }
              if (this.carrierSource === 'msk') {
                weightVal = item.weight
                if (weightVal && Number(weightVal)) {
                  item.weight = Number(weightVal).toFixed(2)
                } else {
                  item.weight = '0.00'
                }
              }
              return Object.assign({}, item, { edit: true, bookingNo, status, xoid: this.source?.oid, random })
            })
          } else {
            this.option1.data = [
              {
                orderNo: '',
                shipmentId: '',
                status: '',
                containerNo: '',
                sn: '',
                containerType: '',
                weight: '',
                responsibleParty: '',
                authorizer: '',
                cargoWeight: '',
                containerWeight: '',
                weightMethod: '',
                xoid: '',
                // contractName: '',
                contractEmail: '',
                // contractPhone: '',
                edit: true,
              },
            ]
          }
        })
        .catch(() => {})
    },
    handleBlurCb(row, rowIndex, prop) {
      let val = row[prop]
      this.option1.data.forEach((item,index) => {
        if (index === rowIndex) {
          if (val && Number(val)) {
            this.$set(item, prop, Number(val).toFixed(3))
          } else {
            this.$set(item, prop, '0.000')
          }
        }
      })
    },
    // 新增箱子
    addContainer(row, i) {
      if (!row.bookingNo) {
        return this.$msgErrClose('请先填写SO号！')
      }
      let data = {}
      if (this.carrierSource === 'msk') {
        // 接入方为马士基时
        data = Object.assign({}, row, {
          containerNo: '',
          sn: '',
          containerType: '',
          weight: '',
          cargoWeight: '',
          containerWeight: '',
          oid: '',
          child: false,
          hidden: false,
        })
      } else {
        data = Object.assign({}, row, {
          parentIndex: i,
          containerNo: '',
          sn: '',
          containerType: '',
          weight: '',
          cargoWeight: '',
          containerWeight: '',
          oid: '',
          child: true,
          hidden: true,
        })
      }
      let index = this.option1.data.findLastIndex((ele) => ele.bookingNo === row.bookingNo)
      this.option1.data.splice(index + 1, 0, data)
      
    },
    // 删除箱子
    delContainer(row, index) {
      // if (this.option1.data.length === 1) {
      //   return this.$msgErrClose('最后一个箱子，无法删除！')
      // }
      let len = this.option1.data.length
      if (row.parentIndex === undefined && len > 1 && row.bookingNo) {
        let find = this.option1.data.find((ele) => ele.bookingNo === row.bookingNo && ele.child) || {}
        Object.assign(find, { child: false, hidden: false, parentIndex: undefined })
      }
      this.option1.data.splice(index, 1)
    },
    // 获取箱型
    getContainerTypeList(str = '') {
      const data = {
        keyword: str,
        carrierSource: this.carrierSource,
      }
      containerTypeList(data)
        .then((res) => {
          if (res.code === 0) {
            const list = res.data.map((item) => {
              const { containerTypeCode, uiDescription } = item
              return {
                label: uiDescription,
                value: containerTypeCode,
              }
            })
            this.containerTypeList.splice(0, 1000, ...list)
            this.option1.data.map(item => {
              item.containerType = ''
              return item
            })
          }
        })
        .catch(() => {})
    },
    // 新增so
    addSo() {
      this.option1.data.push({
        // baseIndex: len,
        orderNo: '',
        shipmentId: '',
        status: 'init',
        containerNo: '',
        sn: '',
        containerType: '',
        weight: '',
        responsibleParty: '',
        authorizer: '',
        cargoWeight: '',
        containerWeight: '',
        weightMethod: '',
        // contractName: '',
        contractEmail: '',
        // contractPhone: '',
        scac: '',
        carrierSource: '',
        xoid: '',
        edit: true,
        child: false,
        random: Math.random()
      })
    },
    // 字典
    getDictAll() {
      dictAll({})
        .then((res) => {
          if (res.code === 0) {
            this.noMsklist = res.data.find((item) => item.groupCode === 'cg_vgm_method').dictItems.map((ele) => {
                let { descpt, itemCode } = ele
                return {
                  label: descpt,
                  value: itemCode,
                }
              })
            this.mskList = res.data.find((item) => item.groupCode === 'msk_vgm_method').dictItems.map((ele) => {
              let { descpt, itemCode } = ele
              return {
                label: descpt,
                value: itemCode,
              }
            })
            console.log('称重方法字典', this.noMsklist, this.mskList)
            // this.dictList.push(...list)
            if (this.carrierSource === 'msk') {
              this.dictList.splice(0, 1000, ...this.mskList)
            } else {
              this.dictList.splice(0, 1000, ...this.noMsklist)
            }
            this.option1.data.map(item => {
              if (!this.dictList.some(item1 => item1.value === item.weightMethod)) {
                item.weightMethod = ''
              }
              return item
            })
          }
        })
        .catch(() => {})
    },
    // 提交
    sumit(status) {
      if (!this.carrierSource || !this.scac) {
        return this.$msgErrClose('接入方和船司必填！')
      }
      const len = this.option1.data.length
      if (!len) {
        return this.$msgErrClose('未填写数据，无法提交！')
      }
      const sta = this.option1.data.some((item) => {
        const { bookingNo, containerNo, weight, responsibleParty, authorizer, weightMethod } = item
        return !bookingNo || !containerNo || !weight || !responsibleParty || !authorizer || !weightMethod
      })
      if (sta) {
        return this.$msgErrClose('SO号、箱号、VGM总货量、称重方法、责任方、授权人都为必填！')
      }
      this.btnLoad = true
      let base = {
        baseCarrierCode: '',
        bookingNo: '',
        carrierSource: '',
        oid: '',
        orderNo: '',
        orderVgmId: '',
        scac: '',
        shipmentId: '',
        status: '',
      }
      if (this.shipId) {
        base = this.source
        base.carrierSource = this.carrierSource
        base.scac = this.scac
        base.status = status || ''
      } else {
        base = {
          baseCarrierCode: this.$route.query.carrierCode,
          carrierSource: this.carrierSource,
          orderNo: this.$route.query.orderNo,
          scac: this.scac,
        }
      }
      const containers = this.option1.data
      let data = []
      if (this.carrierSource === 'msk') {
        containers.forEach(ele => {
          let xoid = ele.xoid
          if (xoid !== this.source.oid) {
              Object.assign(base, {
                oid: '',
                shipmentId: '',
                orderVgmId: '',
              })
          }
          data.push({
            ...base,
            bookingNo: ele.bookingNo,
            containers: [ele],
          })
        })
      } else {
        const bookingNos = Array.from(new Set(containers.map((ele) => ele.bookingNo)))
        if (bookingNos.length > 1) {
          bookingNos.forEach((ele) => {
            const containers = this.option1.data.filter((op) => op.bookingNo === ele)
            let xoid = containers[0].xoid
            if (xoid !== this.source.oid) {
              Object.assign(base, {
                oid: '',
                shipmentId: '',
                orderVgmId: '',
              })
            }
            data.push({
              ...base,
              bookingNo: ele,
              containers,
            })
          })
        } else {
          data = [
            {
              ...base,
              bookingNo: bookingNos[0],
              containers,
            },
          ]
        }
      }
      console.log(data)
      vgmSave(data)
        .then((res) => {
          if (res.code === 0) {
            this.$msgSucClose('VGM提交成功！')
          }
        })
        .catch(() => {})
        .finally(() => {
          this.btnLoad = false
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.vgm-cnt {
  .btn-box {
    margin: 10px;
    text-align: right;
  }
  .carrier-box {
    margin: 8px 8px 15px;
    display: flex;
    .item {
      display: flex;
      align-items: center;
      margin-right: 20px;
      .large-select {
        flex: 1;
        //   /deep/ .el-input{
        //     height: 32px !important;
        //     line-height: 32px !important;
        //   }
        //  /deep/ .el-input__inner{
        //     height: 32px !important;
        //     line-height: 32px !important;
        //   }
        min-width: 200px;
      }
    }
    /deep/ .el-radio-button__orig-radio:checked + .el-radio-button__inner {
      color: #ffffff;
      background-color: #1890ff;
    }
  }
  /deep/ .el-input__inner {
    text-align: center;
  }
}
</style>
