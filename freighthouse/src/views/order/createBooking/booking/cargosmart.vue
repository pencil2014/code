<template>
  <div
    class="booking-cnt"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="cnt-box">
      <div class="sub-title">
        <div class="title">General Details</div>
        <span class="tips"></span>
      </div>
      <div class="overall-details items">
        <Overall
          :overallOption.sync="overallOption"
          ref="overallForm"
          @changeCarrier="changeCarrier"
        />
      </div>
      <div class="sub-title">
        <div class="title">Parties</div>
        <span class="tips">Shipper is required.</span>
      </div>
      <div class="interested items">
        <Interested
          :interestedOption.sync="interestedOption"
          ref="interestedForm"
          :replaceChinese="replaceChinese"
        />
      </div>
      <div class="sub-title">
        <div class="title">References</div>
        <span class="tips">(multiples allowed ex. 123, 456)</span>
      </div>
      <div class="reference items">
        <Reference
          :referenceOption.sync="referenceOption"
          ref="referenceForm"
        />
      </div>
      <div class="sub-title">
        <div class="title">Transport</div>
        <span class="tips">
          Earliest Departure Date, Latest Delivery Date, or Vessel and Voyage is
          required.
        </span>
      </div>
      <div class="transport items">
        <Transport
          :transportOption.sync="transportOption"
          ref="transportForm"
          @showSchedule="showSchedule"
        />
      </div>
      <div class="sub-title">
        <div class="title">Cargo</div>
        <span class="tips">
          **NOTE: The sum of all Cargo Weights reflects the Gross Weight of the
          Cargo (excluding Tare) for the entire Booking. Inaccurate declaration
          of cargo weight may endanger crew, port worker, and vessel safety.
          Please verify the reasonable accuracy of this information prior to
          submission.
        </span>
      </div>
      <div class="goods items">
        <Goods :goodsOption.sync="goodsOption" ref="goodsForm" />
      </div>
      <div class="sub-title">Container</div>
      <div class="container items">
        <Container
          :containerOption.sync="containerOption"
          ref="containerForm"
        />
      </div>
      <div class="sub-title">Payment Details</div>
      <div class="payment items">
        <Payment :paymentOption.sync="paymentOption" ref="paymentForm" />
      </div>
      <div class="sub-title">Comments & Notifications</div>
      <div class="remarks items">
        <Remarks :remarksOption.sync="remarksOption" ref="remarksForm" />
      </div>
      <div class="submit">
        <el-button
          @click="submitOriginal('draft')"
          icon="el-icon-edit"
          type="warning"
          :disabled="disabledBtnDraft"
          :loading="isLoading"
        >
          Save Draft
        </el-button>

        <el-button
          @click="submitOriginal(false)"
          icon="el-icon-s-claim"
          type="primary"
          :disabled="disabledBtn"
          :loading="isLoading"
        >
          Submit Booking
        </el-button>
      </div>
    </div>
    <Schedule v-if="scheduleOptions.show" :scheduleOptions='scheduleOptions' @cancle="closeSchedule" @submit="submitSchedule" />
  </div>
</template>

<script>
import Overall from './cargosmart/overall'
import Remarks from './cargosmart/remarks'
import Reference from './components/reference'
import Payment from './components/payment'
import Container from './msk/container'
import Goods from './cargosmart/goods'
import Transport from './components/transport'
import Interested from './cargosmart/interested'
import Schedule from './components/schedule'
import {
  shipId,
  booker,
  bkgOriginalCgm,
  dictAll,
  bkgDetail
} from '@/api/order/createBooking'
import { bookInfo } from '@/api/order/book/list'
export default {
  provide() {
    return {
      dictAll: this.dictAll,
      carrierSource: this.carrierSource,
    }
  },
  components: {
    Overall,
    Remarks,
    Reference,
    Payment,
    Container,
    Goods,
    Transport,
    Interested,
    Schedule,
  },
  props: {
    carrierSource: {
      type: String,
      default: 'inttra',
    },
  },
  data() {
    return {
      lsLoading: false,
      bkgReqNo: '',
      shipId: '',
      oid: '',
      mainContact: {},
      booker: {},
      overallOption: {
        contractNo: '',
        carrierScac: '',
        carrierName: '',
        bookingNo: '',
      },
      referenceOption: {
        freightForwardNo: '',
        blNo: '',
      },
      remarksOption: {
        remark: '',
        notifyEmails: [{ value: this.$store.state.user.userInfo.email }],
        notifyName: 'Longsail', // this.$store.state.user.userInfo.userName
      },
      paymentOption: {
        chargeType: '',
        chargeTerm: '',
      },
      containerOption: [
        {
          containerType: '',
          containerNum: '',
          containerSeperate: 'no',
          isUsedAsDry: 'no',
          // description: '',
          reeferDto: {
            humidity: '',
            airFlow: '',
            temperature: '',
            description: '',
          },
        },
      ],
      goodsOption: [
        {
          cargoName: '',
          description: '',
          hsCode: '',
          packageTypeCode: '',
          packageType: '',
          quantity: '',
          weight: '',
          volume: '',
          marks: '',
          dangerousDto: {
            cargoName: '',
            hazardCode: '',
            undgNo: '',
            flashPoint: '',
            dangerLevel: '',
            contact: {
              email: '',
              name: '',
              telPhone: '',
            },
          },
        },
      ],
      transportOption: {
        transport: '',
        placeOfDelivery: {
          locationCode: '',
          locationNmae: '',
          country: '',
          countryCode: '',
        },
        placeOfReceipt: {
          locationCode: '',
          locationName: '',
          country: '',
          countryCode: '',
        },
        etd: '',
        eta: '',
        pol: {
          locationCode: '',
          locationName: '',
          country: '',
          countryCode: '',
        },
        pod: {
          locationCode: '',
          locationName: '',
          country: '',
          countryCode: '',
        },
        transportDetail: {
          vessel: '',
          voyage: '',
        },
      },
      interestedOption: {
        shipper: {
          address: '',
          companyId: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
        },
        forwarder: {
          address: '',
          companyId: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
        },
        consignee: {
          address: '',
          companyId: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
        },
        notifyParty: {
          address: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
        },
        notifyParty2: {
          address: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
        },
        notifyParty3: {
          address: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
        },
        shipFrom: {
          address: '',
          companyId: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
        },
        shipTo: {
          address: '',
          companyId: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
        },
      },
      disabledBtn: false,
      disabledBtnDraft: false,
      isLoading: false,
      dictAll: {
        dictList: [],
      },
      scheduleOptions: {
        show: false,
        pol: '',
        pod: '',
        carrierScac: ''
      },
    }
  },
  created() {
    this.bkgReqNo = this.$route.query.bkgReqNo || ''
    this.getDictAll()
    this.reload()
  },
  methods: {
    // 显示船期
    showSchedule() {
      let carrierScac = this.overallOption.carrierScac
      let carrierCode = ''
      if (carrierScac) {
        carrierCode =
          this.$refs.overallForm.$data.carrierList.find((item) => item.value === carrierScac)
            ?.baseCarrierCode || ''
      }
      let pol = this.transportOption.pol?.locationCode?.cityUnCode || ''
      let pod = this.transportOption.pod?.locationCode?.cityUnCode || ''
      
      let carrierList = this.$refs.overallForm.$data.carrierList || []
      let { polCityList = [], podCityList = [] } = this.$refs.transportForm.$data
      this.scheduleOptions = Object.assign(this.scheduleOptions, {
        carrierCode,
        pol,
        pod,
        carrierList,
        polCityList,
        podCityList,
      })
      this.scheduleOptions.show = true
    },
    // 关闭船期查询
    closeSchedule () {
      this.scheduleOptions.show = false
    },
    // 提交船期数据
    submitSchedule (row) {
      let { vesselName:vessel, voyage, etd, eta} = row
      Object.assign(this.transportOption, {
        etd, 
        eta,
        transportDetail: {
          vessel,
          voyage,
        }
      }) 
      this.scheduleOptions.show = false
    },
    // 重新加载
    reload () {
      let shipmentId = this.$route.query.shipmentId
      if (shipmentId) {
        this.getDataSource(shipmentId)
      } else {
        this.getShipId()
        this.getBookInfo()
      }
    },
    // 获取重新提交的数据
    getDataSource(shipId) {
      let data = {
        shipId,
      }
      bkgDetail(data)
        .then((res) => {
          if (res.data.status === 'draft') {
            this.shipId = res.data.shipmentId
            this.oid = res.data.oid
          } else {
            this.getShipId()
          }
          let source = JSON.parse(res.data.requestData) 
          let {
            contractNo,
            carrierScac,
            carrierName,
            bookingNo,
            freightForwardNo,
            blNo,
            remark,
            notifyEmails,
            notifyName,
            chargeType,
            chargeTerm,
            containers,
            cargos,
            transport,
            placeOfDelivery,
            placeOfReceipt,
            etd,
            eta,
            pol,
            pod,
            transportDetail,
            shipper,
            forwarder,
            consignee,
            notifyParty,
            notifyParty2,
            notifyParty3,
            shipFrom,
            shipTo
          } = source
          this.overallOption = Object.assign(this.overallOption, {
            contractNo,
            carrierScac,
            carrierName,
            bookingNo,
          })
          this.referenceOption = Object.assign(this.referenceOption, {
            freightForwardNo,
            blNo
          })
          this.remarksOption = Object.assign(this.remarksOption, {
            remark,
            notifyEmails: notifyEmails.split(',').map(item => {
              return {'value': item}
            }),
            notifyName
          })
          this.paymentOption = Object.assign(this.paymentOption, {
            chargeType,
            chargeTerm
          })
          let containersArr = containers.map(item => {
            if (!item.reeferDto) {
              item.reeferDto = {
                humidity: '',
                airFlow: '',
                temperature: '',
                description: '',
              }
            }
            return {
              ...item
            }
          })
          this.containerOption = containersArr
          let cargosArr = cargos.map(item => {
            if (!item.dangerousDto) {
              item.dangerousDto = {
                hazardCode: '',
                undgNo: '',
                flashPoint: '',
                dangerLevel: '',
                contact: {
                  email: '',
                  name: '',
                  telPhone: '',
                }
              }
            }
            return {
              ...item
            }
          })
          this.goodsOption = cargosArr 
          this.transportOption = Object.assign(this.transportOption,{
            transport,
            placeOfDelivery: {
              locationCode: {
                cityUnCode: placeOfDelivery.locationCode,
                cityName: placeOfDelivery.locationName,
                countryName: placeOfDelivery.country,
                countryCode: placeOfDelivery.countryCode
              }
            },
            placeOfReceipt: {
              locationCode: {
                cityUnCode: placeOfReceipt.locationCode,
                cityName: placeOfReceipt.locationName,
                countryName: placeOfReceipt.country,
                countryCode: placeOfReceipt.countryCode
              }
            },
            etd,
            eta,
            pol: {
              locationCode: {
                cityUnCode: pol.locationCode,
                cityName: pol.locationName,
                countryName: pol.country,
                countryCode: pol.countryCode
              }
            },
            pod: {
              locationCode: {
                cityUnCode: pod.locationCode,
                cityName: pod.locationName,
                countryName: pod.country,
                countryCode: pod.countryCode
              }
            },
            transportDetail
          })
          shipper&&Object.assign(this.interestedOption,{shipper})
          forwarder&&Object.assign(this.interestedOption,{forwarder})
          consignee&&Object.assign(this.interestedOption,{consignee})
          notifyParty&&Object.assign(this.interestedOption,{notifyParty})
          notifyParty2&&Object.assign(this.interestedOption,{notifyParty2})
          notifyParty3&&Object.assign(this.interestedOption,{notifyParty3})
          shipFrom&&Object.assign(this.interestedOption,{shipFrom})
          shipTo&&Object.assign(this.interestedOption,{shipTo})
          this.$refs.transportForm.initData() // 初始化数据
        })
        .catch(() => {})
    },
    // 中英文标点符号替换
    replaceChinese(str = '') {
      if (!str) {
        return ''
      }
      var ChinesePunction = [
        '！',
        '“',
        '”',
        '；',
        '《',
        '》',
        '。',
        '、',
        '，',
        '【',
        '】',
        '（',
        '）',
        '？',
        '：',
        '\u00A0', // 不间断空格
      ]
      var EnglishPunction = [
        '!',
        '"',
        '"',
        ';',
        '<',
        '>',
        '.',
        ',',
        ',',
        '[',
        ']',
        '(',
        ')',
        '?',
        ':',
        ' ',
      ]
      ChinesePunction.forEach((ele, index) => {
        const reg = new RegExp(ele, 'g')
        str = str.replace(reg, EnglishPunction[index])
      })
      return str
    },
    // 改变船公司
    changeCarrier(source) {
      if (source) {
        this.getBooker(source.companyId, source.carrierSource)
        this.$refs.interestedForm.changeCarrier(source.companyId, source.carrierSource)
      }
    },
    // 获取订舱申请详情
    getBookInfo() {
      if (!this.bkgReqNo) {
        return
      }
      this.lsLoading = true
      const data = {
        bkgReqNo: this.bkgReqNo,
      }
      bookInfo(data)
        .then((res) => {
          if (res.code === 0) {
            const source = res.data
            const {
              bkgRemark,
              ship,
              soContainer,
              cargoList,
              transport,
              Barge,
            } = source

            if (bkgRemark) {
              this.remarksOption.remark = bkgRemark
            }
            const { porPortCode, porPortName } = Barge || {}
            const {
              shipCarrierCode,
              vessel,
              voyage,
              contractNo,
              polPortCode,
              podPortCode,
              polPortName,
              podPortName,
              etdTime,
              // tdTime
            } = ship || {}
            this.transportOption.transportDetail.vessel = vessel
            this.transportOption.transportDetail.voyage = voyage
            this.transportOption.pol.locationCode = polPortCode
            // this.transportOption.pol.locationName = polPortName
            this.transportOption.pod.locationCode = podPortCode
            // this.transportOption.pod.locationName = podPortName
            this.transportOption.placeOfDelivery.locationCode = podPortCode
            // this.transportOption.placeOfDelivery.locationName = polPortName
            this.transportOption.placeOfReceipt.locationCode =
              porPortCode || polPortCode
            // this.transportOption.placeOfReceipt.locationName =
            //   porPortName || podPortName
            this.$refs.transportForm.initData() // 初始化数据
            this.overallOption.contractNo = contractNo
            // this.$refs.overallForm.initData() // 初始化数据
            this.transportOption.etd = etdTime
            // this.transportOption.eta = tdTime
            if (soContainer.length) {
              const containerList = soContainer
                .map((item) => item.containerList)
                .flat(Infinity)
              this.containerOption = containerList.map((item) => {
                return {
                  containerType: item.containerType,
                  containerNum: item.containerNum,
                  containerSeperate: 'no',
                  isUsedAsDry: 'no',
                  // description: '',
                  reeferDto: {
                    humidity: item.humidity,
                    airFlow: item.airMete,
                    temperature: item.temperatureSet,
                    description: '',
                  },
                }
              })
            }
            if (cargoList.length) {
              let weight = 0
              let volume = 0
              if (soContainer.length) {
                weight = soContainer[0].containerList[0]?.weight
                volume = soContainer[0].containerList[0]?.volume
              }
              this.goodsOption = cargoList.map((item, index) => {
                return {
                  cargoName: item.ename || item.cname,
                  description: item.commodityDesc,
                  hsCode: item.hscode ? item.hscode.substr(0, 6) : '',
                  packageTypeCode: item.packageInfo || '',
                  packageType: '',
                  quantity: item.quantity || '',
                  weight: item.weight || weight,
                  volume: item.volume || volume,
                  marks: item.mark,
                  dangerousDto: {
                    cargoName: '',
                    hazardCode: item.dangerousGrade,
                    undgNo: item.dangerousCode,
                    flashPoint: '',
                    dangerLevel: '',
                    contact: {
                      email: '',
                      name: '',
                      telPhone: '',
                    },
                  },
                }
              })
            }
            const { shipper, consignee, notify1, notify2, notify3 } = transport
            this.interestedOption = Object.assign(this.interestedOption, {
              consignee: {
                address: '',
                companyId: '',
                contact: {
                  email: '',
                  name: '',
                  telPhone: '',
                  fax: '',
                },
                name: consignee,
              },
              notifyParty: {
                address: '',
                contact: {
                  email: '',
                  name: '',
                  telPhone: '',
                  fax: '',
                },
                name: notify1,
              },
              notifyParty2: {
                address: '',
                contact: {
                  email: '',
                  name: '',
                  telPhone: '',
                  fax: '',
                },
                name: notify2,
              },
              notifyParty3: {
                address: '',
                contact: {
                  email: '',
                  name: '',
                  telPhone: '',
                  fax: '',
                },
                name: notify3,
              },
            })
            this.$refs.interestedForm.initData() // 初始化数据
          }
        })
        .catch(() => {})
        .finally(() => {
          this.lsLoading = false
        })
    },
    // 获取shipId
    getShipId() {
      const data = {
        type: 'bkg',
      }
      shipId(data)
        .then((res) => {
          if (res.code === 0) {
            this.shipId = res.data.shipId
          }
        })
        .catch(() => {})
    },
    // 获取booker
    getBooker(companyId,carrierSource) {
      booker({
        companyId,
        carrierSource
      })
        .then((res) => {
          if (res.code === 0) {
            this.booker = res.data
            this.mainContact = res.data.contact
          }
        })
        .catch(() => {})
    },
    // 提交订舱
    submitOriginal(type) {
      // 汉字校验
      const reg =
        /[\u4e00-\u9fa5]|[\uFE30-\uFFA0]|[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/gi
      // 校验整体明细
      const sta1 = this.$refs.overallForm.validateForm()
      if (!sta1) {
        document.getElementsByClassName('overall-cnt')[0].scrollIntoView()
        return this.$msgErrClose('Carrier / NVOCC / Booking Agent is required')
      }
      if (reg.test(JSON.stringify(this.$refs.overallForm.$data.form))) {
        document.getElementsByClassName('overall-cnt')[0].scrollIntoView()
        return this.$msgErrClose(
          'Chinese characters and punctuation are not allowed for General Details'
        )
      }
      // 校验相关方
      const {
        shippernameError,
        consigneenameError,
        notifyPartynameError,
        notifyParty2nameError,
        notifyParty3nameError,
        shipTonameError,
        shipFromnameError,
      } = this.$refs.interestedForm.$data
      const generaError = [
        shippernameError,
        consigneenameError,
        notifyPartynameError,
        notifyParty2nameError,
        notifyParty3nameError,
        shipTonameError,
        shipFromnameError,
      ].some((item) => item === true)
      if (generaError) {
        document.getElementsByClassName('intereste-cnt')[0].scrollIntoView()
        return this.$msgErrClose('The names format in Parties is incorrect')
      }
      const sta2 = this.$refs.interestedForm.validateForm()
      if (!sta2) {
        document.getElementsByClassName('intereste-cnt')[0].scrollIntoView()
        return this.$msgErrClose('Shipper , Consignee and Booking Agent is required')
      }
      if (reg.test(JSON.stringify(this.$refs.interestedForm.$data.form))) {
        document.getElementsByClassName('intereste-cnt')[0].scrollIntoView()
        return this.$msgErrClose(
          'Chinese characters and punctuation are not allowed for Parties'
        )
      }
      // 校验运输
      const sta3 = this.$refs.transportForm.validateForm()
      if (!sta3) {
        document.getElementsByClassName('transport-cnt')[0].scrollIntoView()
        return this.$msgErrClose(
          'Earliest Departure Date, Latest Delivery Date, or Vessel and Voyage is required.'
        )
      }
      if (reg.test(JSON.stringify(this.$refs.transportForm.$data.form))) {
        document.getElementsByClassName('transport-cnt')[0].scrollIntoView()
        return this.$msgErrClose(
          'Chinese characters and punctuation are not allowed for Transport'
        )
      }
      // 货物
      const sta4 = this.$refs.goodsForm.validateForm()
      if (!sta4) {
        return this.$msgErrClose('Cargo Description is required')
      }
      if (reg.test(JSON.stringify(this.$refs.goodsForm.$data.form))) {
        document.getElementsByClassName('goods-cnt')[0].scrollIntoView()
        return this.$msgErrClose(
          'Chinese characters and punctuation are not allowed for Cargo'
        )
      }
      // 集装箱
      const sta5 = this.$refs.containerForm.validateForm()
      if (!sta5) {
        return this.$msgErrClose('Container Quantity/Type is required')
      }
      // 支付
      const { chargeType, chargeTerm } = this.paymentOption
      const sta6 = !!chargeType !== !!chargeTerm
      if (sta6) {
        return this.$msgErrClose(
          'Charge Type and Payment Term must be completed together'
        )
      }
      // 邮箱
      const sta7 = this.$refs.remarksForm.validateForm()
      if (!sta7) {
        return this.$msgErrClose('BKG Requestor Emails & Comments is required')
      }
      if (reg.test(JSON.stringify(this.$refs.remarksForm.$data.form))) {
        return this.$msgErrClose(
          'Chinese characters and punctuation are not allowed for Comments & Notifications'
        )
      }
      this.submitOriginalFn(type)
    },
    submitOriginalFn(type) {
      this.isLoading = true
      const { carrierName, carrierScac, contractNo } = this.overallOption
      const {
        shipper,
        consignee,
        notifyParty,
        notifyParty2,
        notifyParty3,
        shipFrom,
        shipTo,
        forwarder,
      } = this.interestedOption
      const { freightForwardNo, blNo } = this.referenceOption
      const {
        transport,
        placeOfDelivery,
        placeOfReceipt,
        etd,
        eta,
        pol,
        pod,
        transportDetail,
      } = this.transportOption
      const { chargeType, chargeTerm } = this.paymentOption
      const { notifyEmails, notifyName, remark } = this.remarksOption
      const data = {
        orderNo: this.$route.query.orderNo,
        baseCarrierCode: this.$route.query.carrierCode,
        carrierSource: this.carrierSource,
        shipId: this.shipId,
        oid: this.oid,
        orderBkgId: this.bkgReqNo,
        mainContact: this.mainContact,
        booker: forwarder,
        carrierScac,
        carrierName,
        contractNo,
        // bookingOffice: {
        //   locationCode: bookingOffice.locationCode.cityUnCode,
        //   locationName: bookingOffice.locationCode.cityName,
        //   country: bookingOffice.locationCode.countryName,
        //   countryCode: bookingOffice.locationCode.countryCode,
        // },
        shipper,
        consignee,
        notifyParty,
        notifyParty2,
        notifyParty3,
        shipFrom,
        shipTo,
        blNo,
        freightForwardNo,
        transport,
        placeOfDelivery: {
          locationCode: placeOfDelivery.locationCode.cityUnCode,
          locationName: placeOfDelivery.locationCode.cityName,
          country: placeOfDelivery.locationCode.countryName,
          countryCode: placeOfDelivery.locationCode.countryCode,
        },
        placeOfReceipt: {
          locationCode: placeOfReceipt.locationCode.cityUnCode,
          locationName: placeOfReceipt.locationCode.cityName,
          country: placeOfReceipt.locationCode.countryName,
          countryCode: placeOfReceipt.locationCode.countryCode,
        },
        pol: {
          locationCode: pol.locationCode.cityUnCode,
          locationName: pol.locationCode.cityName,
          country: pol.locationCode.countryName,
          countryCode: pol.locationCode.countryCode,
        },
        pod: {
          locationCode: pod.locationCode.cityUnCode,
          locationName: pod.locationCode.cityName,
          country: pod.locationCode.countryName,
          countryCode: pod.locationCode.countryCode,
        },
        etd,
        eta,
        transportDetail,
        containers: this.$refs.containerForm.$data.form,
        cargos: this.goodsOption.map((item) => {
          return Object.assign({}, item, {
            packageTypeCode: item.packageType?.packageCode,
            packageType: item.packageType?.descpt,
          })
        }),
        chargeType,
        chargeTerm,
        notifyEmails: notifyEmails.map((item) => item.value).join(','),
        notifyName,
        remark,
        containerSeperate: this.containerOption[0].containerSeperate,
      }
      // 没有填写的参数赋值为null
      const noticeStr = JSON.stringify({
        address: '',
        contact: {
          email: '',
          name: '',
          telPhone: '',
          fax: '',
        },
        name: '',
      })
      data.notifyParty =
        JSON.stringify(data.notifyParty) === noticeStr ? null : data.notifyParty
      data.notifyParty2 =
        JSON.stringify(data.notifyParty2) === noticeStr
          ? null
          : data.notifyParty2
      data.notifyParty3 =
        JSON.stringify(data.notifyParty3) === noticeStr
          ? null
          : data.notifyParty3
      const consigneeStr = JSON.stringify({
        address: '',
        contact: {
          email: '',
          name: '',
          telPhone: '',
          fax: '',
        },
        name: '',
      })
      let shipFromStr = JSON.stringify({
        address: '',
        code: '',
        companyId: '',
        contact: {
          email: '',
          name: '',
          telPhone: '',
          fax: '',
        },
        name: '',
      })
      data.consignee =
        JSON.stringify(data.consignee) === consigneeStr ? null : data.consignee
      data.shipper =
        JSON.stringify(data.shipper) === consigneeStr ? null : data.shipper
      data.shipFrom =
        JSON.stringify(data.shipFrom) === shipFromStr ? null : data.shipFrom
      data.shipTo =
        JSON.stringify(data.shipTo) === consigneeStr ? null : data.shipTo
      const cityStr = JSON.stringify({
        country: undefined,
        countryCode: '',
        locationCode: undefined,
        locationName: undefined,
      })
      data.pol = JSON.stringify(data.pol) === cityStr ? null : data.pol
      data.pod = JSON.stringify(data.pod) === cityStr ? null : data.pod
      data.containers.forEach((item) => {
        const reeferDtoStr = JSON.stringify({
          humidity: '',
          airFlow: '',
          temperature: '',
          description: '',
        })
        if (JSON.stringify(item.reeferDto) === reeferDtoStr) {
          item.reeferDto = null
        }
      })
      data.cargos.forEach((item) => {
        const dangerousDtoStr = JSON.stringify({
          cargoName: '',
          hazardCode: '',
          undgNo: '',
          flashPoint: '',
          dangerLevel: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
          },
        })
        if (JSON.stringify(item.dangerousDto) === dangerousDtoStr) {
          item.dangerousDto = null
        }
      })
      if (type) {
        data.status = 'draft'
      }
      bkgOriginalCgm(data)
        .then((res) => {
          if (res.code === 0) {
            let text = type === 'draft' ? 'Draft saved successfully' : 'Booking application submitted successfully'
            this.$msgSucClose(text)
            // this.$router.go(-1)
            if (type === 'draft') {
              this.disabledBtnDraft = true
            } else {
              this.disabledBtn = true
            }
           // 替换url参数
            const {...query} = this.$route.query
            let {shipId} = data
            this.$router.replace({query: {...query, shipmentId: shipId}})
            if (!this.disabledBtnDraft || !this.disabledBtn) {
              setTimeout(() => this.reload(), 100)
            }
          } else {
            // 失败重新查询shipid
            this.getShipId()
          }
        })
        .catch(() => {})
        .finally(() => {
          this.isLoading = false
        })
    },
    // 字典
    getDictAll() {
      dictAll({})
        .then((res) => {
          if (res.code === 0) {
            this.dictAll.dictList = res.data
          }
        })
        .catch(() => {})
    },
  },
  mounted() {},
}
</script>

<style lang="scss" scoped>
.booking-cnt {
  font-family: Tahoma, Verdana, Arial, 'Helvetica Neue', Helvetica, sans-serif;
  font-weight: 300;
  font-size: 12px;
  color: #4a4e50;
  box-sizing: border-box;
  background-color: #fff;
  // margin: 10px 14px;
  // padding: 8px;
  .items {
    background-color: #f8f9fa;
    background-clip: border-box;
    border: 1px solid rgba(0, 0, 0, 0.125);
    border-radius: 4px;
    margin-bottom: 10px;
  }
  .title-box {
    h3 {
      font-weight: 400;
      font-size: 26px;
      line-height: 1.5;
    }
    margin-bottom: 16px;
  }
  .sub-title {
    font-weight: 400;
    font-size: 18px;
    line-height: 1.5;
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    .title {
      width: 30%;
    }
    .tips {
      flex: 1;
      font-size: 12px;
      text-align: right;
    }
  }
}
</style>

<style lang="scss">
.booking-cnt {
  .el-form--label-top .el-form-item__label {
    padding: 0;
    line-height: 22px;
  }
  .el-select .el-select--mini,
  .el-input--mini .el-input__inner {
    height: 22px;
    line-height: 22px;
    font-size: 12px;
  }
  .el-checkbox__label {
    font-size: 12px;
  }
  .submit {
    text-align: right;
  }
  .third-party {
    margin-bottom: 10px;
  }
}
</style>
