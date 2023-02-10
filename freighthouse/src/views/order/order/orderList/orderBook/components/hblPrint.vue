<template>
	<div class="edit-row printForm">
		<div class="set-style-cont" v-if="true">
			<div class="control-row">
				<div class="fl item item66">
					<span class="fl label">文件类型:</span>
					<div class="fl ml10">
						<el-radio v-model="fileType" :label="item.label" v-for="item in fileTypeOptions" :key="item.label" @change="handleChangeFileType">{{ item.txt }}</el-radio>
					</div>
				</div>
				<div class="fl item item33">
					<span class="fl label">显示MBL NO:</span>
					<div class="fl ml10">
						<el-radio v-model="mblNo" :label="item.label" v-for="item in yesOrNoOptions" :key="item.label" @change="handleChangeMblNo">{{ item.txt }}</el-radio>
					</div>
				</div>

				<div class="fl item item33">
					<span class="fl label">第2页打印到空白纸:</span>
					<div class="fl ml10">
						<el-radio v-model="onlyCnInfo" :label="item.label" v-for="item in yesOrNoOptions" :key="item.label" @change="handleChangePaper">{{ item.txt }}</el-radio>
					</div>
				</div>

				<div class="fl item item33">
					<span class="fl label" style="width: 60px;">H单类型:</span>
					<div class="fl ml10">
						<el-radio v-model="hblType" :label="item.label" v-for="item in hblTypeOptions" :key="item.label" :disabled="orderInfo.barge ? false : true" @change="handleChangeHblType">{{ item.txt }}</el-radio>
					</div>
				</div>
				<div v-if="orderInfo.businessType === 'ship_export_lcl'" class="fl item item33">
					<span class="fl label">显示柜封号:</span>
					<div class="fl ml10">
						<el-radio v-model="showCnSn" :label="item.label" v-for="item in yesOrNoOptions" :key="item.label" @change="handleChangeSnNo">{{ item.txt }}</el-radio>
					</div>
				</div>
				<div class="fl item item33">
					<span class="fl label">选择提单纸:</span>
					<div class="fl ml10">
						<el-radio v-model="paperType" :label="item.label" v-for="item in PaperTypeOptions" :key="item.label" @change="handleChangePaperType">{{ item.txt }}</el-radio>
					</div>
				</div>
				<div class="fl item item33">
					<span class="fl label">提单总页数:</span>
					<div class="fl ml10">{{totalPage}}页</div>
				</div>
			</div>
			<!-- <div class="control-row">
				<div class="fl item item33">
					<span class="fl label">偏移量X:</span>
					<div class="fl ml10">
						<el-input type="text" size="mini" placeholder="请输入" style="width: 115px" v-model="transform.x" @blur="handleTransform('x', transform.x)"></el-input>
					</div>
				</div>
				<div class="fl item item33">
					<span class="fl label">偏移量Y:</span>
					<div class="fl ml10">
						<el-input type="text" size="mini" placeholder="请输入" style="width: 115px" v-model="transform.y" @blur="handleTransform('y', transform.y)"></el-input>
					</div>
				</div>
			</div> -->
			<div class="operate-cont">
				<!-- <el-button type="primary" size="mini" @click="getPrintData">确定</el-button> -->
				<el-button type="primary" size="mini" v-print="printObj" @click="handleHitPrint">打印</el-button>
				<el-button @click="cancelBack" type="default" size="mini">取消</el-button>
			</div>
		</div>
		<!-- HBL不盖章AS AGENT, HBL不盖章AS CARRIER预览 -->
		<div class="print-container preview" v-if="['agent','carrier'].includes(fileType)">
			<div class="top">
				<div class="blNo">{{ formData.blNo }}</div>
				<div class="mblNo" v-if="formData.mblNo && mblNo === 'y'">Mbl:{{ formData.mblNo }}</div>
				<div class="shipper" v-html="formData.shipper"></div>
				<div class="consignee" v-html="formData.consignee"></div>
				<div class="notifyParty" v-html="formData.notify"></div>
				<div class="preCarriage">{{ formData.firstTrip }}</div>
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
						<div class="mark" v-html="formData.cargoMark"></div>
						<div class="package">{{ formData.cargoPackages }}</div>
						<div class="desc">
							<div>
								<div class="info">{{ formData.containerInfoDesc }} {{ formData.transportTerm }}</div>
								<div class="weight">{{ formData.cargoWeight }}</div>
								<div class="volume">{{ formData.cargoVolume }}</div>
							</div>
							<!-- <div class="transportTerm-row" ref="transportTerm"></div> -->
							<div class="cargoDesc-row" ref="cargoDesc">
								<div class="desc" v-html="formData.cargoDesc"></div>
							</div>
						</div>
					</div>
					<div v-show="showCnSn==='y' && containerInfoList.length" class="containerInfoList-row" ref="containerInfoList">
						<div class="tit">CONTAINER/SEAL NO.:</div>
						<div class="list" v-for="(item, index) in containerInfoList" :key="index">
							{{ `${item.containerItemInfo}` }}
						</div>
					</div>
					<!-- <div class="containerInfo-row" ref="containerInfo">{{ formData.containerInfo }}</div> -->
				</div>
			</div>
			<div class="containerInfo-row" ref="containerInfo">{{ formData.containerInfo }}</div>
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
		<!-- USA不盖章预览 -->
		<div class="print-container preview usa-nosign" v-if="['usa_no_sign'].includes(fileType)">
			<div class="top">
				<div class="so">{{ formData.so }}</div>
				<div class="blNo">{{ formData.blNo }}</div>
				<div class="shipper" v-html="formData.shipper"></div>
				<div class="consignee" v-html="formData.consignee"></div>
				<div class="notifyParty" v-html="formData.notify"></div>
				<div class="forwardingAgent" v-html="formData.forwardingAgent"></div>
				<div class="firstTrip">{{ formData.firstTrip }}</div>
				<div class="por">{{ formData.porName }}</div>
				<div class="vesselVoyage">{{ formData.vesselVoyage }}</div>
				<div class="pol">{{ formData.polName }}</div>
				<div class="unloading">{{ formData.unloadingName }}</div>
				<div class="pod">{{ formData.podName }}</div>
				<div class="tdTime">{{ formData.tdTime }}</div>
				<div class="originalNumber">{{ formData.originalNumber }}</div>
				<div class="issuePlace">{{ formData.issuePlace }}</div>
				<div class="issueDate">{{ formData.issueDate }}</div>
			</div>
			<div class="middle">
				<div class="cargo-cont">
					<div class="cargo-row" ref="usaCargo">
						<div class="cargoMark" v-html="formData.cargoMark"></div>
						<div class="cargoPackages">{{formData.cargoPackages}}</div>
						<div class="container-list">
							<div>
								<div class="info">{{ formData.containerInfoDesc }} {{ formData.transportTerm }}</div>
							</div>
							<!-- <div class="transportTerm-row" ref="transportTerm"></div> -->
							<div class="cargoDesc-row" ref="cargoDesc">
								<div class="desc" v-html="formData.cargoDesc"></div>
							</div>
						</div>
						<div class="cargoWeight">{{formData.cargoWeight}}</div>
						<div class="cargoVolume">{{formData.cargoVolume}}</div>
					</div>
					<div v-show="showCnSn==='y' && containerInfoList.length" class="containerInfoList-row" ref="usaContainerInfoList">
						<div class="tit">CONTAINER/SEAL NO.:</div>
						<div class="list" v-for="(item, index) in containerInfoList" :key="index">
							{{ `${item.containerItemInfo}` }}
						</div>
					</div>
				</div>
			</div>
			<div class="containerInfo-row" ref="usaContainerInfo">{{ formData.containerInfo }}</div>
			<div class="bottom">
				<div class="payMode">{{ formData.payMode }}</div>
				<div class="issueDate">{{ formData.issueDate }}</div>
			</div>
		</div>
		<!-- 打印 -->
		<div ref="printCont" id="hblPrintCont">
			<!-- HBL不盖章AS AGENT, HBL不盖章AS CARRIER打印 -->
			<template v-if="['agent','carrier'].includes(fileType)">
				<div class="print-container" v-for="(item, index) in totalPage" :key="item" :class="onlyCnInfo === 'y' && index ? 'whitePaper' : ''">
					<!-- 第二页为白纸，只打印箱型货物部分 -->
					<template v-if="onlyCnInfo === 'y' && index">
						<div class="" style="height: 42px"></div>
						<div class="middle">
							<div class="cargo-cont-print" :style="{ transform: `translateY(-${pageHgt + (index - 1) * whitePageHgt}px)`, height: `${pageHgt + index * whitePageHgt}px` }">
								<div class="cargo-row">
									<div class="mark" v-html="formData.cargoMark"></div>
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
								<div v-show="showCnSn==='y' && containerInfoList.length" class="containerInfoList-row">
									<div class="tit">CONTAINER/SEAL NO.:</div>
									<div class="list" v-for="(item, index) in containerInfoList" :key="index">
										{{ `${item.containerItemInfo}` }}
									</div>
								</div>
								<!-- <div class="containerInfo-row">{{ formData.containerInfo }}</div> -->
							</div>
						</div>
						<div class="" style="height: 42px"></div>
					</template>
					<!-- 打印到提单纸上 -->
					<template v-else>
						<div class="top">
							<div class="blNo">{{ formData.blNo }}</div>
							<div class="mblNo" v-if="formData.mblNo && mblNo === 'y'">Mbl:{{ formData.mblNo }}</div>
							<div class="shipper" v-html="formData.shipper"></div>
							<div class="consignee" v-html="formData.consignee"></div>
							<div class="notifyParty" v-html="formData.notify"></div>
							<div class="preCarriage">{{ formData.firstTrip }}</div>
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
									<div class="mark" v-html="formData.cargoMark"></div>
									<div class="package">{{ formData.cargoPackages }}</div>
									<div class="desc">
										<div>
											<div class="info">{{ formData.containerInfoDesc }} {{ formData.transportTerm }}</div>
											<div class="weight">{{ formData.cargoWeight }}</div>
											<div class="volume">{{ formData.cargoVolume }}</div>
										</div>
										<!-- <div class="transportTerm-row" ref="transportTerm">{{ formData.transportTerm }}</div> -->
										<div class="cargoDesc-row">
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
								<div v-show="showCnSn==='y' && containerInfoList.length" class="containerInfoList-row">
									<div class="tit">CONTAINER/SEAL NO.:</div>
									<div class="list" v-for="(item, index) in containerInfoList" :key="index">
										{{ `${item.containerItemInfo}` }}
									</div>
								</div>
								<!-- <div class="containerInfo-row">{{ formData.containerInfo }}</div> -->
							</div>
						</div>
						<div class="containerInfo-row" ref="containerInfo">
							<span v-if="index === 0">{{ formData.containerInfo }}</span>
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
			</template>
			<!-- USA不盖章打印 -->
			<template v-if="['usa_no_sign'].includes(fileType)">
				<div class="print-container usa-nosign" v-for="(item, index) in totalPage" :key="item" :class="onlyCnInfo === 'y' && index ? 'whitePaper' : ''">
					<!-- 第二页为白纸，只打印箱型货物部分 -->
					<template v-if="onlyCnInfo === 'y' && index">
						<div class="" style="height: 42px"></div>
						<div class="middle">
							<div class="cargo-cont-print" :style="{ transform: `translateY(-${usaPageHgt + (index - 1) * whitePageHgt}px)`, height: `${usaPageHgt + index * whitePageHgt}px` }">
								<div class="cargo-row">
									<div class="cargoMark" v-html="formData.cargoMark"></div>
									<div class="cargoPackages">{{formData.cargoPackages}}</div>
									<div class="container-list">
										<div>
											<div class="info">{{ formData.containerInfoDesc }} {{ formData.transportTerm }}</div>
										</div>
										<!-- <div class="transportTerm-row" ref="transportTerm"></div> -->
										<div class="cargoDesc-row">
											<div class="desc" v-html="formData.cargoDesc"></div>
										</div>
									</div>
									<div class="cargoWeight">{{formData.cargoWeight}}</div>
									<div class="cargoVolume">{{formData.cargoVolume}}</div>
								</div>
								<div v-show="showCnSn==='y' && containerInfoList.length" class="containerInfoList-row">
									<div class="tit">CONTAINER/SEAL NO.:</div>
									<div class="list" v-for="(item, index) in containerInfoList" :key="index">
										{{ `${item.containerItemInfo}` }}
									</div>
								</div>
							</div>
						</div>
						<div class="" style="height: 42px"></div>
					</template>
					<!-- 打印到提单纸上 -->
					<template v-else>
						<div class="top">
							<div class="so">{{ formData.so }}</div>
							<div class="blNo">{{ formData.blNo }}</div>
							<div class="shipper" v-html="formData.shipper"></div>
							<div class="consignee" v-html="formData.consignee"></div>
							<div class="notifyParty" v-html="formData.notify"></div>
							<div class="forwardingAgent" v-html="formData.forwardingAgent"></div>
							<div class="firstTrip">{{ formData.firstTrip }}</div>
							<div class="por">{{ formData.porName }}</div>
							<div class="vesselVoyage">{{ formData.vesselVoyage }}</div>
							<div class="pol">{{ formData.polName }}</div>
							<div class="unloading">{{ formData.unloadingName }}</div>
							<div class="pod">{{ formData.podName }}</div>
							<div class="tdTime">{{ formData.tdTime }}</div>
							<div class="originalNumber">{{ formData.originalNumber }}</div>
							<div class="issuePlace">{{ formData.issuePlace }}</div>
							<div class="issueDate">{{ formData.issueDate }}</div>
						</div>
						<div class="middle">
							<div class="cargo-cont-print" :style="{ transform: `translateY(-${index * pageHgt}px)`, height: `${(index + 1) * pageHgt}px` }">
								<div class="cargo-row">
									<div class="cargoMark" v-html="formData.cargoMark"></div>
									<div class="cargoPackages">{{formData.cargoPackages}}</div>
									<div class="container-list">
										<div>
											<div class="info">{{ formData.containerInfoDesc }} {{ formData.transportTerm }}</div>
										</div>
										<!-- <div class="transportTerm-row" ref="transportTerm"></div> -->
										<div class="cargoDesc-row">
											<div class="desc" v-html="formData.cargoDesc"></div>
										</div>
									</div>
									<div class="cargoWeight">{{formData.cargoWeight}}</div>
									<div class="cargoVolume">{{formData.cargoVolume}}</div>
								</div>
								<div v-show="showCnSn==='y' && containerInfoList.length" class="containerInfoList-row">
									<div class="tit">CONTAINER/SEAL NO.:</div>
									<div class="list" v-for="(item, index) in containerInfoList" :key="index">
										{{ `${item.containerItemInfo}` }}
									</div>
								</div>
							</div>
						</div>
						<div class="containerInfo-row">
							<span v-if="index === 0">{{ formData.containerInfo }}</span>
						</div>
						<div class="bottom">
							<div class="payMode">{{ formData.payMode }}</div>
							<div class="issueDate">{{ formData.issueDate }}</div>
						</div>
					</template>
				</div>
			</template>
		</div>
		<!-- <div class="btnGroup-fixed">
      <el-button type="primary" size="mini" v-print="printObj">打印</el-button>
      <el-button @click="cancelBack" type="default" size="mini">取消</el-button>
    </div> -->
	</div>
</template>

<script>
import { blHblPrint, blHitPrint } from '@/api/order/bl'
import { orderInfo } from '@/api/order/list'

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
			usaPageHgt: 288, 	// USA不盖章的货物信息区域的高度
			whitePageHgt: 1164, // 打印第2页白纸区域的高度
			fileTypeOptions: [
				{ label: 'agent', txt: 'HBL不盖章AS AGENT', asRoleTxt: 'AS AGENT FOR THE CARRIER: LONG SAIL SHIPPING LINE S.A.LIMITED' },
				{ label: 'carrier', txt: 'HBL不盖章AS CARRIER', asRoleTxt: 'AS CARRIER: LONG SAIL SHIPPING LINE S.A.LIMITED' },
				{ label: 'usa_no_sign', txt: 'USA不盖章', asRoleTxt: '' }
			],
			fileType: 'agent',
			asRoleTxt: 'AS AGENT FOR THE CARRIER: LONG SAIL SHIPPING LINE S.A.LIMITED',
			yesOrNoOptions: [
				{ label: 'n', txt: '否' },
				{ label: 'y', txt: '是' }
			],
			showCnSn: 'n',
			mblNo: 'n',
			onlyCnInfo: 'n',
			hblType: 'SHIP',
			hblTypeOptions: [
				{ label: 'BARGE', txt: '驳船' },
				{ label: 'SHIP', txt: '大船' },
				{ label: 'BARGE_SHIP', txt: '驳船+大船' }
			],
			paperType: 'ZB',
			PaperTypeOptions: [
				{ label: 'ZB', txt: '正本纸' },
				{ label: 'FB', txt: '副本纸' }
			],
			orderInfo: {},
			transform: {
				x: '',
				y: ''
			}
		}
	},
	components: {},
	created() {
		this.getOrderInfo()
	},
	mounted() {},
	computed: {
		businessType() {
			return JSON.parse(sessionStorage.custStr).businessType
		}
	},
	methods: {
		handleHitPrint() {
			blHitPrint({
				blId: this.$route.query.blId,
				orderNo: this.$route.query.orderNo
			}).then(res => {
			}).catch(err => {
				console.log(err)
			})
		},
		getOrderInfo() {
			orderInfo({ orderNo: this.$route.query.orderNo }).then(res => {
				this.orderInfo = res.data
				if (['ship_export_fcl', 'ship_import_fcl'].includes(this.orderInfo.businessType)) {
					this.showCnSn = 'y'
				}
				this.getPrintData()
			})
		},
		handleChangeFileType(val) {
			let findItem = this.fileTypeOptions.find(item => item.label === val)
			this.asRoleTxt = findItem ? findItem.asRoleTxt : ''
			this.getPrintData()
		},
		handleChangeMblNo(val) {
			this.getPrintData()
		},
		handleChangeSnNo(val) {
			this.getPrintData()
		},
		handleChangePaper(val) {
			this.getPrintData()
		},
		handleChangeHblType() {
			this.getPrintData()
		},
		// 选择提单纸为副本重新设置打印样式（因为副本的纸比正本的长一些）
		handleChangePaperType(val) {
			this.setFbBlStyle(val)
		},
		setFbBlStyle(type) {
			// // 正本的样式
			// if (type === 'ZB') {
			// 	document.querySelector(".print-container .top .shipper").style.top = '64px'
			// 	document.querySelector(".print-container .top .consignee").style.top = '144px'
			// 	document.querySelector(".print-container .top .notifyParty").style.top = '223px'
			// 	document.querySelector(".print-container .top .preCarriage").style.top = '305px'
			// 	document.querySelector(".print-container .top .por").style.top = '305px'
			// 	document.querySelector(".print-container .top .vesselVoyage").style.top = '345px'
			// 	document.querySelector(".print-container .top .loadingPort").style.top = '345px'
			// 	document.querySelector(".print-container .top .dischargePort").style.top = '384px'
			// 	document.querySelector(".print-container .top .deliveryPort").style.top = '384px'
			// 	document.querySelector(".print-container .top .finalDestination").style.top = '384px'
			// 	document.querySelector(".print-container .top .issuePeople").style.top = '384px'
			// } else {
			// 	// 副本样式
			// 	document.querySelector(".print-container .top .shipper").style.top = '65px'
			// 	document.querySelector(".print-container .top .consignee").style.top = '145px'
			// 	document.querySelector(".print-container .top .notifyParty").style.top = '224px'
			// 	document.querySelector(".print-container .top .preCarriage").style.top = '305.5px'
			// 	document.querySelector(".print-container .top .por").style.top = '305.5px'
			// 	document.querySelector(".print-container .top .vesselVoyage").style.top = '345.5px'
			// 	document.querySelector(".print-container .top .loadingPort").style.top = '345.5px'
			// 	document.querySelector(".print-container .top .dischargePort").style.top = '384.5px'
			// 	document.querySelector(".print-container .top .deliveryPort").style.top = '384.5px'
			// 	document.querySelector(".print-container .top .finalDestination").style.top = '384.5px'
			// 	document.querySelector(".print-container .top .issuePeople").style.top = '384.5px'
			// }
		},
		// 获取货物箱型箱量区域高度做分页
		getCargoHeight() {
			this.$nextTick(() => {
				let cargoHgt = this.$refs.cargo.offsetHeight
				// let transportTermHgt = this.$refs.transportTerm.offsetHeight
				// let cargoDescHgt = this.$refs.cargoDesc.offsetHeight
				let cnInfoListHgt = this.$refs.containerInfoList.offsetHeight
				// let cnInfoHgt = this.$refs.containerInfo.offsetHeight
				let cnInfoHgt = 0
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
		// 获取USA不盖章的货物箱型箱量区域高度做分页
		getUsaNoSignCargoHeight() {
			this.$nextTick(() => {
				let cargoHgt = this.$refs.usaCargo.offsetHeight
				// let transportTermHgt = this.$refs.transportTerm.offsetHeight
				// let cargoDescHgt = this.$refs.cargoDesc.offsetHeight
				let cnInfoListHgt = this.$refs.usaContainerInfoList.offsetHeight
				// let cnInfoHgt = this.$refs.containerInfo.offsetHeight
				let cnInfoHgt = 0
				let totalCargoHgt = cargoHgt + cnInfoListHgt + cnInfoHgt

				// 第2页开始打印白纸的，头部尾部隐藏，只打印中间的货物信息
				if (this.onlyCnInfo === 'y') {
					if (totalCargoHgt <= this.usaPageHgt) {
						this.totalPage = 1
					} else {
						// 货物集装箱信息容器高度减去usaPageHgt的值除于空白a4纸 高度，给白纸设置分页
						let total2 = totalCargoHgt - this.usaPageHgt
						let totalPage2 = total2 % this.whitePageHgt == 0 ? total2 / this.whitePageHgt : total2 - parseInt(total2 / this.whitePageHgt) * this.whitePageHgt > 0 ? parseInt(total2 / this.whitePageHgt) + 1 : parseInt(total2 / this.whitePageHgt)
						this.totalPage = totalPage2 + 1
					}
				} else {
					// 正常的打印提单页头页尾固定，中间的货物信息做分页
					this.totalPage =
						totalCargoHgt % this.usaPageHgt == 0 ? totalCargoHgt / this.usaPageHgt : totalCargoHgt - parseInt(totalCargoHgt / this.usaPageHgt) * this.usaPageHgt > 0 ? parseInt(totalCargoHgt / this.usaPageHgt) + 1 : parseInt(totalCargoHgt / this.usaPageHgt)
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
				fileType: 'hbl_draft',
				docType: 'xls',
				hblType: this.hblType,
				param: {
					asRoleTxt: this.asRoleTxt,
					mbl: this.mblNo
				}
			}
			this.orderInfo.businessType === 'ship_export_lcl' ? (data.param.showCnSn = this.showCnSn) : null
			blHblPrint(data).then(res => {
				this.formData = res.data
				let { shipper, consignee, notify, cargoDesc, cargoMark, forwardingAgent, porName, polName, unloadingName, podName, finalDestination } = res.data
				this.containerInfoList = res.data.containerInfoList.data
				this.formData.shipper = this.replaceStr(shipper)
				this.formData.consignee = this.replaceStr(consignee)
				this.formData.notify = this.replaceStr(notify)
				this.formData.cargoDesc = this.replaceStr(cargoDesc)
				this.formData.cargoMark = this.replaceStr(cargoMark)
				this.formData.forwardingAgent = this.replaceStr(forwardingAgent)
				this.formData.porName = this.replaceCommaStr(porName)
				this.formData.polName = this.replaceCommaStr(polName)
				this.formData.unloadingName = this.replaceCommaStr(unloadingName)
				this.formData.podName = this.replaceCommaStr(podName)
				if (['agent','carrier'].includes(this.fileType)) {
					this.getCargoHeight()
				} else if (['usa_no_sign'].includes(this.fileType)) {
					this.getUsaNoSignCargoHeight()
				}
			})
		},
		// 在字符串中的每个逗号后面加上空格，达到换行的效果
		replaceCommaStr(str) {
			return str.replace(/,/g, ", ")
		},
		// 替换掉v-html的<符号、>符号、\n符号
		replaceStr(str) {
			return str.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>')
		},
		// 取消
		cancelBack() {
			this.$router.go(-1)
			// 关闭新窗口
			// window.close()
		},
		handleTransform(axis, value) {
			if (!value) value = 0
			let hblPrintCont = document.getElementById('hblPrintCont')
			let printContainer = hblPrintCont.getElementsByClassName('print-container')
			// console.log('printContainer', printContainer)
			// x轴偏移
			if (axis === 'x') {
				for (var i = 0; i < printContainer.length; i++) {
					printContainer[i].style.marginLeft = value + 'px'
				}
			} else if (axis === 'y') {	// y轴偏移
				for (var i = 0; i < printContainer.length; i++) {
					printContainer[i].style.marginTop = value + 'px'
				}
			}
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
	.print-container {
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
			margin-bottom: 5px;
			line-height: 20px;
			.label {
				text-align: right;
				width: 120px;
				line-height: 20px;
			}
			.el-radio {
				margin-right: 20px;
				line-height: 20px;
				&:last-child {
					margin-right: 0;
				}
			}
			.el-radio__label {
				font-size: 12px;
				line-height: 20px;
			}
			.el-input__inner{
				line-height: 20px;
				height: 20px;
			}
		}
		.item.item75 {
			width: 75%;
		}
		.item.item25 {
			width: 25%;
		}
		.item.item66 {
			width: 66.66667%;
		}
		.item.item33 {
			width: 33.33333%;
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
.print-container {
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
			line-height: 0.92;
			-webkit-transform-origin-x: 0;
			-webkit-transform: scale(0.85);
			position: absolute;
			left: 25px;
			top: 65px;
			width: 460px;
			height: 60px;
			white-space: normal;
			word-break: break-word;
		}
		.consignee {
			font-size: 12px;
			letter-spacing: -0.5px;
			line-height: 0.92;
			-webkit-transform-origin-x: 0;
			-webkit-transform: scale(0.85);
			position: absolute;
			left: 25px;
			top: 145px;
			width: 460px;
			height: 60px;
			white-space: normal;
			word-break: break-word;
		}
		.notifyParty {
			font-size: 12px;
			letter-spacing: -0.5px;
			line-height: 0.92;
			-webkit-transform-origin-x: 0;
			-webkit-transform: scale(0.85);
			position: absolute;
			left: 25px;
			top: 224px;
			width: 460px;
			height: 60px;
			white-space: normal;
			word-break: break-word;
		}
		.preCarriage {
			position: absolute;
			left: 25px;
			top: 305.5px;
			width: 175px;
			line-height: 0.83333;
			white-space: normal;
			word-break: break-word;
			text-align: left;
		}
		.por {
			position: absolute;
			left: 221px;
			top: 305.5px;
			width: 200px;
			line-height: 0.83333;
			white-space: normal;
			word-break: break-word;
			text-align: left;
		}
		.vesselVoyage {
			position: absolute;
			left: 25px;
			top: 345.5px;
			width: 175px;
			line-height: 0.83333;
			white-space: normal;
			word-break: break-word;
			text-align: left;
		}
		.loadingPort {
			position: absolute;
			left: 221px;
			top: 345.5px;
			width: 200px;
			line-height: 0.83333;
			white-space: normal;
			word-break: break-word;
			text-align: left;
		}
		.dischargePort {
			position: absolute;
			left: 25px;
			top: 384.5px;
			width: 175px;
			line-height: 0.83333;
			white-space: normal;
			word-break: break-word;
			text-align: left;
			// line-height: 12px;
		}
		.deliveryPort {
			position: absolute;
			left: 221px;
			top: 384.5px;
			width: 200px;
			line-height: 0.83333;
			white-space: normal;
			word-break: break-word;
			text-align: left;
		}
		.finalDestination {
			position: absolute;
			left: 440px;
			top: 384.5px;
			width: 180px;
			line-height: 0.83333;
			text-align: left;
		}
		.issuePeople {
			position: absolute;
			left: 640px;
			top: 384.5px;
			text-align: left;
			width: 100px;
		}
	}
	.middle {
		width: 100%;
		height: 288px;
		position: relative;
		margin-top: 21px;
		// margin-bottom: 44px;
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
				// float: left;
				display: inline-block;
				width: 149px;
				text-align: left;
				word-break: break-word;
				min-height: 12px;
				vertical-align: top;
			}
			.package {
				padding-right: 6px;
				// float: left;
				display: inline-block;
				width: 70px;
				text-align: left;
				word-break: break-word;
				vertical-align: top;
			}
			.desc {
				padding-right: 6px;
				// float: left;
				display: inline-block;
				width: 470px;
				text-align: left;
				word-break: break-word;
				vertical-align: top;
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
			padding-top: 12px;
			.tit {
				margin-bottom: 12px;
				word-break: break-word;
			}
			.list {
				word-break: break-word;
			}
		}
		// .containerInfo-row {
		// 	clear: both;
		// 	margin: 0 auto;
		// 	// padding-top: 48px;
		// 	// padding-right: 45px;
		// 	// // padding-bottom: 10px;
		// 	text-align: right;
		// 	word-break: break-word;
		// 	position: absolute;
		// 	bottom: 0;
		// 	right: 45px;
		// }
	}
	.containerInfo-row {
		clear: both;
		margin: 6px auto 26px;
		padding-right: 45px;
		height: 12px;
		line-height: 12px;
		text-align: right;
		word-break: break-word;
	}
	.bottom {
		position: relative;
		width: 100%;
		height: 280px;
		// background-color: #999;
		.originalNumber {
			position: absolute;
			left: 500px;
			top: 6px;
			width: 200px;
			text-align: left;
		}
		.affirmed {
			position: absolute;
			left: 400px;
			top: 95px;
			width: 170px;
			text-align: center;
		}
		.datedOn {
			position: absolute;
			left: 460px;
			top: 129px;
			width: 140px;
			text-align: center;
		}
		.payMode {
			position: absolute;
			left: 30px;
			top: 156px;
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
			left: 30px;
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
			left: 640px;
			top: 129px;
			width: 140px;
			text-align: left;
			word-break: break-word;
		}
	}
	&.preview {
		display: block;
		background: url(../../../../../../assets/hbl_bg.png) center center no-repeat;
		background-size: 100% 100%;
		background-position-y: -5px;
		background-position-x: 5px;
		// background: none;
		.top {
			.shipper,
			.consignee,
			.notifyParty {
				overflow-y: auto;
			}
		}
		&.usa-nosign{
			display: block;
			background: url(../../../../../../assets/hbl_usa_no_sign.png) center center no-repeat;
			background-size: 100% 100%;
			background-position-y: 15px;
			.bottom{
				.issueDate{
					top: 170px;
				}
			}
		}
	}
	&.usa-nosign{
		// display: block;
		// background: url(../../../../../../assets/hbl_usa_no_sign.png) center center no-repeat;
		// background-size: 100% 100%;
		// background-color: #ddd;
		// background-position-y: -8px;
		// background-position-x: -2px;
		.top{
			height: 624px;
			.so{
				position: absolute;
				left: 380px;
				top: 194px;
			}
			.blNo{
				left: 560px;
				top: 194px;
			}
			.shipper{
				width: 400px;
				left: 8px;
    		top: 186px;
				height: 72px;
			}
			.consignee{
				width: 400px;
				left: 8px;
    		top: 280px;
				height: 72px;
			}
			.notifyParty{
				width: 400px;
				left: 8px;
				top: 392px;
				height: 72px;
			}
			.forwardingAgent{
				position: absolute;
				left: 380px;
				top: 404px;
			}
			.firstTrip{
				position: absolute;
				left: 8px;
				top: 495px;
			}
			.por{
				left: 190px;
				top: 495px;
				width: 170px;
				word-break: break-word;
			}
			.vesselVoyage{
				left: 8px;
				top: 532px;
				width: 170px;
				word-break: break-word;
			}
			.pol{
				position: absolute;
				left: 190px;
				top: 532px;
				width: 170px;
				word-break: break-word;
			}
			.unloading{
				position: absolute;
				left: 8px;
				top: 572px;
				width: 170px;
				word-break: break-word;
			}
			.pod{
				position: absolute;
				left: 190px;
				top: 572px;
				width: 170px;
				word-break: break-word;
			}
			.tdTime{
				position: absolute;
				left: 380px;
				top: 532px;
			}
			.originalNumber{
				position: absolute;
				left: 380px;
				top: 572px;
			}
			.issuePlace{
				position: absolute;
				left: 525px;
				top: 572px;
			}
			.issueDate{
				position: absolute;
				left: 637px;
				top: 572px;
			}
		}
		.middle{
			height: 288px;
			margin-top: 0;
			padding-left: 8px;
			.cargoMark{
				// float: left;
				display: inline-block;
				width: 133px;
				min-height: 12px;
				word-break: break-word;
				vertical-align: top;
			}
			.cargoPackages{
				width: 70px;
				// float: left;
				margin-left: 6px;
				display: inline-block;
				vertical-align: top;
			}
			.container-list{
				width: 385px;
				// height: 300px;
				margin-left: 6px;
				// float: left;
				display: inline-block;
				vertical-align: top;
			}
			.cargoWeight{
				width: 70px;
				margin-left: 4px;
				// float: left;
				display: inline-block;
				vertical-align: top;
			}
			.cargoVolume{
				width: 70px;
				margin-left: 4px;
				// float: left;
				display: inline-block;
				vertical-align: top;
			}
			.cargo-cont-print {
				height: 288px;
				// background-color: #eee;
				overflow: hidden;
			}
		}
		.containerInfo-row{
			margin-bottom: 0px;
			margin-top: 0px;
		}
		.bottom{
			height: 236px;
			.issueDate{
				position: absolute;
				left: 8px;
    		top: 164px;
			}
			.payMode{
				position: absolute;
				left: 395px;
				top: 60px;
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
			height: 1080px;
			margin-top: 0px;
		}
	}
}
</style>
