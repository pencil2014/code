<template>
	<div class="edit-row printForm">
		<div class="set-style-cont" v-if="true">
			<div class="control-row">
				<div class="fl item">
					<span class="fl label">文件类型:</span>
					<div class="fl ml10">
						<el-radio v-model="fileType" :label="item.label" v-for="item in fileTypeOptions" :key="item.label" @change="handleChangeFileType">{{ item.txt }}</el-radio>
					</div>
				</div>
				<!-- <div class="fl item">
					<span class="fl label">显示MBL NO:</span>
					<div class="fl ml10">
						<el-radio v-model="mblNo" :label="item.label" v-for="item in yesOrNoOptions" :key="item.label" @change="handleChangeMblNo">{{ item.txt }}</el-radio>
					</div>
				</div> -->
				<div class="fl item">
					<span class="fl label">第2页打印到空白纸:</span>
					<div class="fl ml10">
						<el-radio v-model="onlyCnInfo" :label="item.label" v-for="item in yesOrNoOptions" :key="item.label" @change="handleChangePaper">{{ item.txt }}</el-radio>
					</div>
				</div>
				<div v-if="businessType === 'rail_export_lcl'" class="fl item">
					<span class="fl label">显示柜封号:</span>
					<div class="fl ml10">
						<el-radio v-model="showContainer" :label="item.label" v-for="item in yesOrNoOptions" :key="item.label" @change="handleChangeSnNo">{{ item.txt }}</el-radio>
					</div>
				</div>
			</div>
			<div class="operate-cont">
				<!-- <el-button type="primary" size="mini" @click="getPrintData">确定</el-button> -->
				<el-button type="primary" size="mini" v-print="printObj">打印</el-button>
				<el-button @click="cancelBack" type="default" size="mini">取消</el-button>
			</div>
		</div>
		<!-- 预览 -->
		<div class="rail-print-container preview">
			<div class="top">
				<div class="blNo">{{ formData.blNo }}</div>
				<div class="mblNo" v-if="formData.mblNo && mblNo === 'y'">Mbl:{{ formData.mblNo }}</div>
				<div class="shipper" v-html="formData.shipper"></div>
				<div class="consignee" v-html="formData.consignee"></div>
				<div class="notifyParty" v-html="formData.notify"></div>
				<div class="preCarriage"></div>
				<div class="por">{{ formData.porName }}</div>
				<div class="vesselVoyage">{{ formData.vesselVoyage }}</div>
				<div class="loadingPort">{{ formData.polName }}</div>
				<div class="dischargePort">{{ formData.unloadingName }}</div>
				<div class="deliveryPort">{{ formData.podName }}</div>
				<div class="finalDestination">{{ formData.finalDestination }}</div>
				<div class="issuePeople">{{ formData.issuePeople }}</div>
			</div>
			<div class="middle">
				<div class="cargo-cont">
					<div class="cargo-row" ref="cargo">
						<div class="mark">{{ formData.cargoMark }}</div>
						<div class="package">{{ formData.cargoPackages }}</div>
						<div class="desc">
							<div>
								<div class="info">{{ formData.containerInfoDesc }} {{ formData.transportTerm }}</div>
								<div class="weight">{{ formData.cargoWeight }}</div>
								<div class="volume">{{ formData.cargoVolume }}</div>
							</div>
							<!-- <div class="transportTerm-row" ref="transportTerm">{{ formData.transportTerm }}</div> -->
							<div class="cargoDesc-row" ref="cargoDesc">
								<div class="desc" v-html="formData.cargoDesc"></div>
							</div>
						</div>
					</div>
					<div class="containerInfoList-row" ref="containerInfoList">
						<div v-if="showContainer === 'y'" class="tit">CONTAINER/SEAL NO.:</div>
						<div class="list" v-for="(item, index) in containerInfoList" :key="index">
							{{ `${item.containerItemInfo}` }}
						</div>
					</div>
					<div class="containerInfo-row" ref="containerInfo">{{ formData.containerInfo }}</div>
				</div>
			</div>
			<div class="bottom">
				<div class="originalNumber">{{ formData.tdTime }}</div>
				<div class="affirmed">{{ formData.originalNumber }}</div>
				<div class="datedOn">{{ formData.issueDate }}</div>
				<div class="payMode">{{ formData.payMode }}</div>
				<div class="issuePlace">{{ formData.issuePlace }}</div>
				<div class="forward" v-html="formData.forwardingAgent"></div>
				<div class="asRole">
					<template v-if="fileType === 'agent'">
						AS AGENT FOR THE CARRIER:<br />
						LONG SAIL SHIPPING LINE S.A.LIMITED
					</template>
					<template v-if="fileType === 'carrier'"> AS CARRIER: <br />LONG SAIL SHIPPING LINE S.A.LIMITED </template>
				</div>
			</div>
		</div>
		<!-- 打印 -->
		<div ref="printCont" id="hblPrintCont">
			<div class="rail-print-container" v-for="(item, index) in totalPage" :key="item" :class="onlyCnInfo === 'y' && index ? 'whitePaper' : ''">
				<!-- 第二页为白纸，只打印箱型货物部分 -->
				<template v-if="onlyCnInfo === 'y' && index">
					<div class="middle">
						<div class="cargo-cont-print" :style="{ transform: `translateY(-${pageHgt + (index - 1) * whitePageHgt}px)`, height: `${pageHgt + index * whitePageHgt}px` }">
							<div class="cargo-row">
								<div class="mark">{{ formData.cargoMark }}</div>
								<div class="package">{{ formData.cargoPackages }}</div>
								<div class="desc">
									<div>
										<div class="info">{{ formData.containerInfoDesc }} {{ formData.transportTerm }}</div>
										<div class="weight">{{ formData.cargoWeight }}</div>
										<div class="volume">{{ formData.cargoVolume }}</div>
									</div>
									<!-- <div class="transportTerm-row">{{ formData.transportTerm }}</div> -->
									<div class="cargoDesc-row">
										<div class="desc" v-html="formData.cargoDesc"></div>
									</div>
								</div>
							</div>
							<div class="containerInfoList-row">
								<div v-if="showContainer === 'y'" class="tit">CONTAINER/SEAL NO.:</div>
								<div class="list" v-for="(item, index) in containerInfoList" :key="index">
									{{ `${item.containerItemInfo}` }}
								</div>
							</div>
							<div class="containerInfo-row">{{ formData.containerInfo }}</div>
						</div>
					</div>
				</template>
				<!-- 打印到提单纸上 -->
				<template v-else>
					<div class="top">
						<div class="blNo">{{ formData.blNo }}</div>
						<div class="mblNo" v-if="formData.mblNo && mblNo === 'y'">Mbl:{{ formData.mblNo }}</div>
						<div class="shipper" v-html="formData.shipper"></div>
						<div class="consignee" v-html="formData.consignee"></div>
						<div class="notifyParty" v-html="formData.notify"></div>
						<div class="preCarriage"></div>
						<div class="por">{{ formData.porName }}</div>
						<div class="vesselVoyage">{{ formData.vesselVoyage }}</div>
						<div class="loadingPort">{{ formData.polName }}</div>
						<div class="dischargePort">{{ formData.unloadingName }}</div>
						<div class="deliveryPort">{{ formData.podName }}</div>
						<div class="finalDestination">{{ formData.finalDestination }}</div>
						<div class="issuePeople">{{ formData.issuePeople }}</div>
					</div>
					<div class="middle">
						<div class="cargo-cont-print" :style="{ transform: `translateY(-${index * pageHgt}px)`, height: `${(index + 1) * pageHgt}px` }">
							<!-- <div style="position:absolute; right: 0;bottom: 0;">-{{index*pageHgt}}-{{index}}</div> -->
							<div class="cargo-row">
								<div class="mark">{{ formData.cargoMark }}</div>
								<div class="package">{{ formData.cargoPackages }}</div>
								<div class="desc">
									<div>
										<div class="info">{{ formData.containerInfoDesc }} {{ formData.transportTerm }}</div>
										<div class="weight">{{ formData.cargoWeight }}</div>
										<div class="volume">{{ formData.cargoVolume }}</div>
									</div>
									<!-- <div class="transportTerm-row" ref="transportTerm">{{ formData.transportTerm }}</div> -->
									<div class="cargoDesc-row" ref="cargoDesc">
										<div class="desc" v-html="formData.cargoDesc"></div>
									</div>
								</div>
							</div>
							<!-- <div class="transportTerm-row">{{formData.transportTerm}}</div>
              <div class="cargoDesc-row">
                <div class="desc">
                  {{formData.cargoDesc}}
                </div>
              </div> -->
							<div class="containerInfoList-row">
								<div v-if="showContainer === 'y'" class="tit">CONTAINER/SEAL NO.:</div>
								<div class="list" v-for="(item, index) in containerInfoList" :key="index">
									{{ `${item.containerItemInfo}` }}
								</div>
							</div>
							<div class="containerInfo-row">{{ formData.containerInfo }}</div>
						</div>
					</div>
					<div class="bottom">
						<div class="originalNumber">{{ formData.tdTime }}</div>
						<div class="affirmed">{{ formData.originalNumber }}</div>
						<div class="datedOn">{{ formData.issueDate }}</div>
						<div class="payMode">{{ formData.payMode }}</div>
						<div class="issuePlace">{{ formData.issuePlace }}</div>
						<div class="forward" v-html="formData.forwardingAgent"></div>
						<div class="asRole">
							<template v-if="fileType === 'agent'">
								AS AGENT FOR THE CARRIER:<br />
								LONG SAIL SHIPPING LINE S.A.LIMITED
							</template>
							<template v-if="fileType === 'carrier'"> AS CARRIER: <br />LONG SAIL SHIPPING LINE S.A.LIMITED </template>
						</div>
					</div>
				</template>
			</div>
		</div>
		<!-- <div class="btnGroup-fixed">
      <el-button type="primary" size="mini" v-print="printObj">打印</el-button>
      <el-button @click="cancelBack" type="default" size="mini">取消</el-button>
    </div> -->
	</div>
</template>

<script>
import { blHblPrint } from '@/api/order/bl'

export default {
	data() {
		return {
			formData: {},
			containerInfoList: [],
			printObj: {
				id: 'hblPrintCont',
				popTitle: 'Hbl打印',
				extraCss: '',
				extraHead: '<style media="print">@page {size: A4 portrait!important; margin: 0 0 0 30px;}</style>'
			},
			totalPage: 1, // 打印总页数
			pageHgt: 276, // 打印分页区域的高度
			whitePageHgt: 1164, // 打印第2页白纸区域的高度
			fileTypeOptions: [
				{ label: 'agent', txt: 'HBL不盖章AS AGENT', asRoleTxt: 'AS AGENT FOR THE CARRIER: LONG SAIL SHIPPING LINE S.A.LIMITED' },
				{ label: 'carrier', txt: 'HBL不盖章AS CARRIER', asRoleTxt: 'AS CARRIER: LONG SAIL SHIPPING LINE S.A.LIMITED' }
			],
			fileType: 'agent',
			asRoleTxt: 'AS AGENT FOR THE CARRIER: LONG SAIL SHIPPING LINE S.A.LIMITED',
			yesOrNoOptions: [
				{ label: 'n', txt: '否' },
				{ label: 'y', txt: '是' }
			],
			showContainer: 'y',
			mblNo: 'n',
			onlyCnInfo: 'n'
		}
	},
	components: {},
	created() {
		this.getPrintData()
	},
	mounted() {},
	computed: {
		businessType() {
			return JSON.parse(sessionStorage.custStr).businessType
		}
	},
	methods: {
		handleChangeFileType(val) {
			let findItem = this.fileTypeOptions.find(item => item.label === val)
			this.asRoleTxt = findItem ? findItem.asRoleTxt : ''
			this.getPrintData()
		},
		handleChangeMblNo(val) {
			this.getPrintData()
		},
		handleChangePaper(val) {
			this.getPrintData()
		},
		handleChangeSnNo(val) {
			this.getPrintData()
		},
		// 获取货物箱型箱量区域高度做分页
		getCargoHeight() {
			this.$nextTick(() => {
				let cargoHgt = this.$refs.cargo.offsetHeight
				// let transportTermHgt = this.$refs.transportTerm.offsetHeight
				// let cargoDescHgt = this.$refs.cargoDesc.offsetHeight
				let cnInfoListHgt = this.$refs.containerInfoList.offsetHeight
				let cnInfoHgt = this.$refs.containerInfo.offsetHeight
				let totalCargoHgt = cargoHgt + cnInfoListHgt + cnInfoHgt

				// 第2页开始打印白纸的，头部尾部隐藏，只打印中间的货物信息
				if (this.onlyCnInfo === 'y') {
					if (totalCargoHgt <= this.pageHgt) {
						this.totalPage = 1
					} else {
						// 货物集装箱信息容器高度减去pageHgt的值除于空白a4纸 高度，给白纸设置分页
						let total2 = totalCargoHgt - this.pageHgt
						let totalPage2 = total2 % this.whitePageHgt == 0 ? total2 / this.whitePageHgt : total2 - parseInt(total2 / this.whitePageHgt) * this.whitePageHgt > 0 ? parseInt(total2 / this.whitePageHgt) + 1 : parseInt(total2 / this.whitePageHgt)
						this.totalPage = totalPage2 + 1
					}
				} else {
					// 正常的打印提单页头页尾固定，中间的货物信息做分页
					this.totalPage =
						totalCargoHgt % this.pageHgt == 0 ? totalCargoHgt / this.pageHgt : totalCargoHgt - parseInt(totalCargoHgt / this.pageHgt) * this.pageHgt > 0 ? parseInt(totalCargoHgt / this.pageHgt) + 1 : parseInt(totalCargoHgt / this.pageHgt)
				}
				console.log('totalPage', this.totalPage, cargoHgt, cnInfoListHgt, cnInfoHgt, totalCargoHgt)
			})
		},
		// 获取hbl打印数据
		getPrintData() {
			let { orderNo, blId } = this.$route.query
			let data = {
				orderNo,
				blId,
				fileType: 'RAIL_HBL_DRAFT',
				docType: 'xls',
				param: {
					asRoleTxt: this.asRoleTxt,
					mbl: this.mblNo
				}
			}
			this.businessType === 'rail_export_lcl' ? (data.param.showContainer = this.showContainer) : null
			blHblPrint(data).then(res => {
				this.formData = res.data
				this.containerInfoList = res.data.containerInfoList ? res.data.containerInfoList.data : []
				this.formData.shipper = res.data.shipper.replace(/\n/g, '<br>')
				console.log('🚀 ~ this.formData.shipper', this.formData.shipper)
				this.formData.consignee = res.data.consignee.replace(/\n/g, '<br>')
				this.formData.notify = res.data.notify.replace(/\n/g, '<br>')
				this.formData.cargoDesc = res.data.cargoDesc.replace(/\n/g, '<br>')
				this.formData.forwardingAgent = res.data.forwardingAgent.replace(/\n/g, '<br>')
				this.getCargoHeight()
			})
		},
		// 取消
		cancelBack() {
			this.$router.go(-1)
			// 关闭新窗口
			// window.close()
		}
	}
}
</script>
<style media="print" scoped>
@media print {
	@page {
		size: A4 portrait;
		margin: 0 0 0 30px;
	}
	/* body{
      margin-top: 0;
    } */
	.rail-print-container {
		width: 794px;
		height: 1160px;
		display: block;
		background: url(../../../../../../assets/hbl_bg.png) center center no-repeat;
		background-size: 100% 100%;
		background: none;
		/* background-color: #bbb; */
		font-size: 12px;
		/* line-height: 12px; */
		font-family: 'Times New Roman', Times, serif;
		page-break-after: always;
		color: #000;
		/* font-weight: bold; */
	}
}
</style>
<style lang="scss">
.printForm {
	position: relative;
}
.btnGroup-fixed {
	position: fixed;
	right: 50px;
	bottom: 30px;
}
.set-style-cont {
	width: 1000px;
	margin: 0 auto;
	// height: 100px;
	background-color: #ededed;
	padding: 10px;
	.control-row {
		clear: both;
		width: 100%;
		overflow: hidden;
		.fl {
			float: left;
			display: inline-block;
		}
		.item {
			width: 50%;
			margin-bottom: 10px;
			.label {
				text-align: right;
				width: 120px;
			}
			.el-radio {
				margin-right: 20px;
				&:last-child {
					margin-right: 0;
				}
			}
			.el-radio__label {
				font-size: 12px;
			}
		}
	}
	.operate-cont {
		text-align: right;
		.el-button--mini {
			padding: 3px 10px;
			height: 20px;
		}
	}
}
.rail-print-container {
	display: none;
	background: url(../../../../../../assets/hbl_bg.png) center center no-repeat;
	background-size: 100% 100%;
	position: relative;
	width: 794px;
	height: 1160px;
	// padding-bottom: 8px;
	margin: 0 auto;
	color: #2e4789;
	font-family: 'Times New Roman', Times, serif;
	font-size: 12px;
	line-height: 12px;
	.top {
		width: 100%;
		height: 418px;
		position: relative;
		// background-color: #888;
		.blNo {
			position: absolute;
			left: 615px;
			top: 72px;
		}
		.mblNo {
			position: absolute;
			left: 615px;
			top: 85px;
		}
		.shipper {
			font-size: 12px;
			letter-spacing: -0.5px;
			line-height: 12px;
			-webkit-transform-origin-x: 0;
			-webkit-transform: scale(0.85);
			position: absolute;
			left: 20px;
			top: 66px;
			width: 460px;
			height: 60px;
			white-space: normal;
			word-break: break-word;
		}
		.consignee {
			font-size: 12px;
			letter-spacing: -0.5px;
			line-height: 12px;
			-webkit-transform-origin-x: 0;
			-webkit-transform: scale(0.85);
			position: absolute;
			left: 20px;
			top: 146px;
			width: 460px;
			height: 60px;
			white-space: normal;
			word-break: break-word;
		}
		.notifyParty {
			font-size: 12px;
			letter-spacing: -0.5px;
			line-height: 12px;
			-webkit-transform-origin-x: 0;
			-webkit-transform: scale(0.85);
			position: absolute;
			left: 20px;
			top: 226px;
			width: 460px;
			height: 60px;
			white-space: normal;
			word-break: break-word;
		}
		.preCarriage {
			position: absolute;
			left: 30px;
			top: 305px;
			width: 175px;
			white-space: normal;
			word-break: break-word;
			text-align: center;
		}
		.por {
			position: absolute;
			left: 220px;
			top: 305px;
			width: 200px;
			white-space: normal;
			word-break: break-word;
			text-align: center;
		}
		.vesselVoyage {
			position: absolute;
			left: 30px;
			top: 348px;
			width: 175px;
			white-space: normal;
			word-break: break-word;
			text-align: center;
		}
		.loadingPort {
			position: absolute;
			left: 220px;
			top: 348px;
			width: 200px;
			white-space: normal;
			word-break: break-word;
			text-align: center;
		}
		.dischargePort {
			position: absolute;
			left: 30px;
			top: 384px;
			width: 175px;
			white-space: normal;
			word-break: break-word;
			text-align: center;
			line-height: 12px;
		}
		.deliveryPort {
			position: absolute;
			left: 220px;
			top: 390px;
			width: 200px;
			white-space: normal;
			word-break: break-word;
			text-align: center;
		}
		.finalDestination {
			position: absolute;
			left: 430px;
			top: 390px;
			width: 180px;
			text-align: center;
		}
		.issuePeople {
			position: absolute;
			left: 630px;
			top: 390px;
			text-align: center;
			width: 100px;
		}
	}
	.middle {
		width: 100%;
		height: 276px;
		position: relative;
		margin-top: 33px;
		margin-bottom: 44px;
		padding-left: 45px;
		overflow: hidden;
		// background-color: #aaa;
		&.pb20 {
			padding-bottom: 20px;
		}
		.cargo-cont {
			overflow-y: auto;
			height: 100%;
		}
		.cargo-cont-print {
			height: 276px;
			// background-color: #eee;
			overflow: hidden;
		}
		.cargo-row {
			clear: both;
			overflow: hidden;
			.mark {
				padding-right: 6px;
				float: left;
				display: inline-block;
				width: 154px;
				text-align: left;
				word-break: break-word;
			}
			.package {
				padding-right: 6px;
				float: left;
				display: inline-block;
				width: 65px;
				text-align: left;
				word-break: break-word;
			}
			.desc {
				padding-right: 6px;
				float: left;
				display: inline-block;
				width: 470px;
				text-align: left;
				word-break: break-word;
			}
			.info {
				padding-right: 6px;
				display: inline-block;
				width: 263px;
				text-align: left;
				word-break: break-word;
			}
			.weight {
				padding-right: 6px;
				display: inline-block;
				width: 93px;
				text-align: left;
				vertical-align: top;
				word-break: break-word;
			}
			.volume {
				display: inline-block;
				width: 100px;
				text-align: left;
				vertical-align: top;
				word-break: break-word;
			}
		}
		.transportTerm-row {
			margin: 0 auto;
			padding-top: 24px;
			line-height: 12px;
			width: 200px;
			text-align: center;
			word-break: break-word;
		}
		.cargoDesc-row {
			clear: both;
			margin: 0 auto;
			line-height: 12px;
			padding-top: 24px;
			.desc {
				width: 470px;
				margin: 0 auto;
				text-align: left;
				word-break: break-word;
			}
		}
		.containerInfoList-row {
			clear: both;
			margin: 0 auto;
			padding-top: 36px;
			.tit {
				margin-bottom: 12px;
				word-break: break-word;
			}
			.list {
				word-break: break-word;
			}
		}
		.containerInfo-row {
			clear: both;
			margin: 0 auto;
			padding-top: 48px;
			padding-right: 45px;
			// padding-bottom: 10px;
			text-align: right;
			word-break: break-word;
		}
	}
	.bottom {
		position: relative;
		width: 100%;
		height: 280px;
		// background-color: #999;
		.originalNumber {
			position: absolute;
			left: 500px;
			top: 8px;
			width: 200px;
			text-align: left;
		}
		.affirmed {
			position: absolute;
			left: 400px;
			top: 92px;
			width: 170px;
			text-align: center;
		}
		.datedOn {
			position: absolute;
			left: 460px;
			top: 122px;
			width: 140px;
			text-align: center;
		}
		.payMode {
			position: absolute;
			left: 30px;
			bottom: 115px;
			width: 150px;
		}
		.forward {
			font-size: 12px;
			line-height: 12px;
			letter-spacing: -0.5px;
			-webkit-transform-origin-x: 0;
			-webkit-transform: scale(0.85);
			position: absolute;
			top: 200px;
			left: 20px;
			width: 400px;
			text-align: left;
			white-space: normal;
			word-break: break-word;
		}
		.asRole {
			position: absolute;
			bottom: 45px;
			left: 480px;
			width: 256px;
			text-align: left;
			word-break: break-word;
		}
		.issuePlace {
			position: absolute;
			right: 20px;
			top: 127px;
			width: 140px;
			text-align: left;
			word-break: break-word;
		}
	}
	&.preview {
		display: block;
		background: url(../../../../../../assets/hbl_bg.png) center center no-repeat;
		background-size: 100% 100%;
		background-position-y: -8px;
		background-position-x: -2px;
		// background: none;
		.top {
			.shipper,
			.consignee,
			.notifyParty {
				overflow-y: auto;
			}
		}
	}
	&.whitePaper {
		background: none;
		background-color: #fff;
		.top,
		.bottom {
			display: none;
		}
		.middle {
			height: 1164px;
			margin-top: 0px;
		}
	}
}
</style>
