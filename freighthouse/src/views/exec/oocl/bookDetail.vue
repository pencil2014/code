<template>
	<div class="edit-container-exec">
		<div class="edit-row">
			<div class="row-tit">
				<span class="tit">即刻订舱产品/产品详情</span>
				<div class="row-tit-operate">
					<div style="width: 20px"></div>
					<el-button style="float: right" size="mini" ref="btnCancel" @click="handleCancel" plain>返回</el-button>
				</div>
			</div>
		</div>
		<div class="edit-row" v-loading="loading" >
			<div class="orderCard">
				<section class="order-section">
					<header class="order-section-header">
						<h2>{{ porCityFullNameCn }}-{{ fndCityFullNameCn }}</h2>
					</header>
					<div>
						<el-table :data="shippingLineList" :span-method="arraySpanMethod">
							<el-table-column header-align="center" align="left" label="出发地" width="140px">
								<template slot-scope="scope">
									<div class="shippingLines">
										<div class="schedule-data" style="width: 550px">
											<el-row class="time-display">
												<el-col :span="6">
													<div>
														<div class="horizontal-content-div">
															<span v-if="scope.row.scheduleData.legs.length > 1">ETD</span>
														</div>
														<div class="horizontal-content-div">
															<span v-if="scope.row.scheduleData.legs.length > 1">{{ scope.row.scheduleData.legs[0].pol.etd ? scope.row.scheduleData.legs[0].pol.etd.substring(0, 10) : '' }}</span>
														</div>
													</div>
												</el-col>
												<el-col :span="6">
													<div v-if="scope.row.scheduleData.legs.length > 1">
														<div class="horizontal-content-div">ETD</div>
														<div class="horizontal-content-div">
															{{ scope.row.scheduleData.legs[1].pol.etd ? scope.row.scheduleData.legs[1].pol.etd.substring(0, 10) : '' }}
														</div>
													</div>
													<div v-if="scope.row.scheduleData.legs.length == 1">
														<div class="horizontal-content-div">ETD</div>
														<div class="horizontal-content-div">
															{{ scope.row.scheduleData.legs[0].pol.etd ? scope.row.scheduleData.legs[0].pol.etd.substring(0, 10) : '' }}
														</div>
													</div>
												</el-col>
												<el-col :span="6">
													<div class="horizontal-content-div">ETA</div>
													<div class="horizontal-content-div">
														{{ scope.row.eta ? scope.row.eta.substring(0, 10) : '' }}
													</div>
												</el-col>
												<el-col :span="6">
													<div class="horizontal-content-div"></div>
													<div class="horizontal-content-div"></div>
												</el-col>
											</el-row>
											<el-row class="circle-center">
												<el-col :span="6">
													<div class="hollow-circle"></div>
													<div class="beeline"></div>
												</el-col>
												<el-col :span="6">
													<div class="solid-circle"></div>
													<div class="beeline"></div>
												</el-col>
												<el-col :span="6">
													<div class="solid-circle"></div>
													<div class="beeline"></div>
												</el-col>
												<el-col :span="6">
													<div class="hollow-circle"></div>
												</el-col>
											</el-row>
											<el-row class="time-display">
												<el-col :span="6">
													<div class="horizontal-content-div">
														{{ scope.row.porCity.cityFullNameCn }}
													</div>
													<div class="horizontal-content-div">
														{{ scope.row.porCity.cityFullNameEn }}
													</div>
													<div class="horizontal-content-div">
														{{ scope.row.porFacilityCode }}
													</div>
												</el-col>
												<el-col :span="6">
													<div class="horizontal-content-div">
														{{ scope.row.scheduleData.legs[scope.row.scheduleData.legs.length - 1].pol.port.portFullNameCn }}
													</div>
													<div class="horizontal-content-div">
														{{ scope.row.scheduleData.legs[scope.row.scheduleData.legs.length - 1].pol.port.portFullNameEn }}
													</div>
												</el-col>
												<el-col :span="6">
													<div class="horizontal-content-div">
														{{ scope.row.scheduleData.legs[scope.row.scheduleData.legs.length - 1].pod.port.portFullNameCn }}
													</div>
													<div class="horizontal-content-div">
														{{ scope.row.scheduleData.legs[scope.row.scheduleData.legs.length - 1].pod.port.portFullNameEn }}
													</div>
												</el-col>
												<el-col :span="6">
													<div class="horizontal-content-div">
														{{ scope.row.fndCity.cityFullNameCn }}
													</div>
													<div class="horizontal-content-div">
														{{ scope.row.fndCity.cityFullNameEn }}
													</div>
													<div class="horizontal-content-div">
														{{ scope.row.fndFacilityCode }}
													</div>
												</el-col>
											</el-row>
										</div>
										<!-- <div style="padding-left:100px"></div> -->
										<!-- 预期交货时间 -->
										<div style="width: 100px; text-align: center">{{ scope.row.estimatedTransitTimeInDays }}天</div>
										<!-- 有效期 -->
										<div style="width: 130px; text-align: center">
											{{ scope.row.effectiveStartDate ? scope.row.effectiveStartDate.substring(0, 10) : '' }}~
											<br />
											{{ scope.row.effectiveEndDate ? scope.row.effectiveEndDate.substring(0, 10) : '' }}
										</div>
										<!-- <div class="symbol"></div>
                    <div class="symbol"></div>-->
										<!-- 条款 -->
										<div style="width: 120px; text-align: center">
											{{ scope.row.haulageType }}
										</div>
										<!--货品-->
										<!-- <div class="symbol"></div> -->
										<!--船名航次-->
										<div style="width: 140px; text-align: center">
											{{ scope.row.scheduleData.vesselName }}
											{{ scope.row.scheduleData.voyageNo }}{{ scope.row.direction }}/{{ scope.row.scheduleData.serviceCode }}
										</div>
									</div>
								</template>
							</el-table-column>
							<el-table-column header-align="center" align="left" label="装货(中转港)/ETD" width="140px"></el-table-column>
							<el-table-column header-align="center" align="left" label="卸货港/ETA" width="140px"></el-table-column>
							<el-table-column header-align="center" align="left" label="目的地" width="140px"></el-table-column>
							<el-table-column header-align="center" align="left" label="预期交货时间" width="100px"></el-table-column>
							<el-table-column header-align="center" align="left" label="运价有效期" width="130px"></el-table-column>
							<el-table-column header-align="center" align="left" label="条款" width="120px"></el-table-column>
							<!-- <el-table-column header-align="center" align="left" label="运输货品" width="100px"> </el-table-column> -->
							<el-table-column header-align="center" align="left" label="船名和航次" width="150px"></el-table-column>
						</el-table>
					</div>
				</section>
			</div>
			<!-- <div class="orderCard">
				<section class="order-section">
					<header class="order-section-header">
						<h2>联运服务</h2>
					</header>
					<div style="padding: 0 0 8px 0; font-size: 14px">卸港转运服务</div>
					<div style="padding: 0 0 8px 0">
						目的地：
						<el-select style="width: 280px" clearable filterable size="mini" value-key="intermodalServiceNo" v-model="createItem.intermodalService" @change="intermodalServiceChange">
							<el-option v-for="(o, key) in dischargeServices.selectOptions" :key="key" :label="`${o.cityFullName} (${o.transshipmentModel})`" :value="o"></el-option>
						</el-select>
					</div>

					<div v-if="createItem.intermodalService" style="padding: 0 0 8px 0">
						<span style="padding: 0 18px 0 0">驳船天数：{{ dischargeServices.bargeDay }}</span>
						<span style="padding: 0 18px 0 0">运输天数：{{ dischargeServices.transitDay }}</span>
						<span style="padding: 0 18px 0 0">运输条款：{{ dischargeServices.transportTerms }}</span>
						<span style="padding: 0 18px 0 0">转运方式：{{ dischargeServices.transshipmentModel }}</span>
					</div>
					<el-table v-if="createItem.intermodalService" :data="dischargeServices.list" style="width: 600px">
						<el-table-column v-for="item in dischargeServices.tableList" header-align="center" align="center" :property="item.prop" :label="item.label" :key="item.prop"></el-table-column>
					</el-table>
				</section>
			</div> -->
			<div class="orderCard">
				<section class="order-section">
					<header class="order-section-header">
						<h2>箱型&单证数量</h2>
					</header>
					<el-table :default-sort="{ prop: 'cntrType', order: 'ascending' }" :data="containerPriceList" :span-method="priceFeeArraySpanMethod">
						<el-table-column width="150" header-align="center" align="center" property="cntrType" label="箱型"></el-table-column>
						<el-table-column width="200" header-align="center" align="center" property="unit" label="海运费">
							<template slot-scope="scope">{{ scope.row.currency }}{{ scope.row.tradePrice }}</template>
						</el-table-column>
						<el-table-column width="150" header-align="center" align="center" property="billPrice" label="装港驳船费">--</el-table-column>
						<el-table-column width="150" header-align="center" align="center" property="20GP" label="装港转运费">--</el-table-column>
						<el-table-column width="150" header-align="center" align="center" property="40GP" label="卸港转运费">--</el-table-column>
						<el-table-column width="150" header-align="center" align="center" property="quantity" label="数量">
							<template slot-scope="scope">
								<div style="display: flex; justify-content: space-between">
									<el-input
										type="number"
										style="width: 100px"
										size="mini"
										@change="quantityChange"
										min="0"
										v-model="scope.row.quantity"
										oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"
									></el-input>
								</div>
							</template>
						</el-table-column>
						<el-table-column width="110" header-align="center" align="center" property="inventory" label="总库存">{{ remainQuantity }}TEU</el-table-column>
					</el-table>
					<div class="blQuantity">
            <div class="number">
							单证数量&nbsp;&nbsp;
							<el-input
								type="number"
								style="width: 100px"
								size="mini"
								@change="blQuantityChange"
								min="1"
								v-model="createItem.blQuantity"
								oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"
							></el-input
							>&nbsp;票
						</div>
						<!-- <div class="check">
							<el-checkbox v-model="createItem.includeInsurance">保价服务</el-checkbox>
						</div> -->
					</div>
				</section>
			</div>
      <el-form :model="createItem" :rules="rules" ref="createItemForm" @keyup.enter.native="submitForm('createItemForm')" label-suffix=":" label-width="80px">
				<div class="orderCard">
					<section class="order-section">
						<header class="order-section-header">
							<h2>货物信息</h2>
						</header>
						<div>
							<el-row>
								<el-col :span="8">
									<el-form-item label="货物描述" prop="cargoInfo.desc">
										<el-input style="width: 80%" size="mini" v-model="createItem.cargoInfo.desc"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="包装类型" prop="cargoInfo.packageType">
										<el-select style="width: 80%" clearable filterable size="mini" v-model="createItem.cargoInfo.packageType" :remote-method="getPackageType" @visible-change="getPackageType">
											<el-option v-for="(o, key) in packageTypeList" :key="key" :label="`${o.value} (${o.descpt})`" :value="o.value"></el-option>
										</el-select>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="货物数量" prop="cargoInfo.quantity">
										<el-input size="mini" min="1" v-model="createItem.cargoInfo.quantity" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" style="width: 80%"></el-input>
									</el-form-item>
								</el-col>
							</el-row>
							<el-row>
								<el-col :span="8">
									<el-form-item label="重量" prop="cargoInfo.weight">
										<el-input style="width: 80%" size="mini" v-model="createItem.cargoInfo.weight" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}">
											<i slot="suffix" style="font-style: normal; margin-right: 10px">KG</i>
										</el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="体积" prop="cargoInfo.volume">
										<el-input style="width: 80%" size="mini" v-model="createItem.cargoInfo.volume" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}">
											<i slot="suffix" style="font-style: normal; margin-right: 10px">M³</i>
										</el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="备注" prop="cargoInfo.remarks">
										<el-input size="mini" style="width: 80%" v-model="createItem.cargoInfo.remarks"></el-input>
									</el-form-item>
								</el-col>
							</el-row>
						</div>
					</section>
				</div>
				<div class="orderCard">
					<section class="order-section">
						<header class="order-section-header">
							<h2>紧急联系人信息</h2>
						</header>
						<div>
							<el-row>
								<el-col :span="8">
									<el-form-item label="邮箱" prop="emergencyContactInfo.email">
										<el-input style="width: 80%" size="mini" v-model="createItem.emergencyContactInfo.email"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="姓名" prop="emergencyContactInfo.name">
										<el-input style="width: 80%" size="mini" v-model="createItem.emergencyContactInfo.name"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="手机号" prop="emergencyContactInfo.mobile">
										<el-input style="width: 80%" size="mini" v-model="createItem.emergencyContactInfo.mobile"></el-input>
									</el-form-item>
								</el-col>
							</el-row>
							<el-row>
								<el-col :span="8">
									<el-form-item label="固定电话" prop="emergencyContactInfo.phone">
										<el-input style="width: 80%" size="mini" v-model="createItem.emergencyContactInfo.phone"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="15">
									<el-form-item label="地址" prop="emergencyContactInfo.address">
										<el-input size="mini" min="1" v-model="createItem.emergencyContactInfo.address"  style="width: 97.5%"></el-input>
									</el-form-item>
								</el-col>
							</el-row>
						</div>
					</section>
				</div>
			</el-form>
			<div class="orderCard">
				<section class="order-section">
					<header class="order-section-header">
						<h2>附加费收费标准</h2>
					</header>
					<div v-if="oceanFeeList.length > 0">
						<div class="price-detail-header">海运附加费</div>
						<el-table :data="oceanFeeList">
							<el-table-column width="180" header-align="center" align="center" property="chargeName" label="费用名称"></el-table-column>
							<el-table-column width="80" header-align="center" align="center" property="unitType" label="单位"></el-table-column>
							<el-table-column width="200" header-align="center" align="center" label="单票价格">
								<template slot-scope="scope">
									{{ scope.row | billPriceFilter }}
								</template>
							</el-table-column>
							<el-table-column width="200" header-align="center" align="center" label="20GP">
								<template slot-scope="scope">
									{{ scope.row | price20GpFilter }}
								</template>
							</el-table-column>
							<el-table-column width="200" header-align="center" align="center" label="40GP">
								<template slot-scope="scope">
									{{ scope.row | price40GpFilter }}
								</template>
							</el-table-column>
							<el-table-column width="200" header-align="center" align="center" label="40HQ">
								<template slot-scope="scope">
									{{ scope.row | price40HqFilter }}
								</template>
							</el-table-column>
							<el-table-column width="200" header-align="center" align="left" label="预付-到付">
								<template slot-scope="scope">
									<el-radio-group @change="handleChange('oceanFeeList', scope.row)" v-model="scope.row.paymentTerm">
										<el-radio :disabled="scope.row.followOceanFee" v-if="scope.row.paymentTerms.includes('P')" label="P">预付</el-radio>
										<el-radio :disabled="scope.row.followOceanFee" v-if="scope.row.paymentTerms.includes('C')" label="C">到付</el-radio>
									</el-radio-group>
								</template>
							</el-table-column>
						</el-table>
					</div>
					<div v-if="porExtraFeeList.length > 0">
						<div class="price-detail-header">起运地附加费</div>
						<el-table :data="porExtraFeeList">
							<el-table-column width="180" header-align="center" align="center" property="chargeName" label="费用名称"></el-table-column>
							<el-table-column width="80" header-align="center" align="center" property="unitType" label="单位"></el-table-column>
							<el-table-column width="200" header-align="center" align="center" property="billPrice" label="单票价格">
								<template slot-scope="scope">
									{{ scope.row | billPriceFilter }}
								</template>
							</el-table-column>
							<el-table-column width="200" header-align="center" align="center" property="20GP" label="20GP">
								<template slot-scope="scope">
									{{ scope.row | price20GpFilter }}
								</template>
							</el-table-column>
							<el-table-column width="200" header-align="center" align="center" property="40GP" label="40GP">
								<template slot-scope="scope">
									{{ scope.row | price40GpFilter }}
								</template>
							</el-table-column>
							<el-table-column width="200" header-align="center" align="center" property="40HQ" label="40HQ">
								<template slot-scope="scope">
									{{ scope.row | price40HqFilter }}
								</template>
							</el-table-column>
							<el-table-column width="200" header-align="center" align="left" label="预付-到付">
								<template slot-scope="scope">
									<el-radio-group @change="handleChange('porExtraFeeList', scope.row)" v-model="scope.row.paymentTerm">
										<el-radio :disabled="scope.row.followOceanFee" v-if="scope.row.paymentTerms.includes('P')" label="P">预付</el-radio>
										<el-radio :disabled="scope.row.followOceanFee" v-if="scope.row.paymentTerms.includes('C')" label="C">到付</el-radio>
									</el-radio-group>
								</template>
							</el-table-column>
						</el-table>
					</div>
				</section>
			</div>
			<el-form :model="createItem" :rules="rules" ref="createItemForm2" @keyup.enter.native="submitForm('createItemForm')" label-suffix=":" label-width="80px">
				<div class="orderCard">
					<section class="order-section">
						<header class="order-section-header">
							<h2>托运人信息 <span class="tips">(如果填写，所有信息必须同时填写，其中邮箱非必填)</span></h2>
						</header>
						<div>
							<el-row>
								<el-col :span="8">
									<el-form-item label="姓名" prop="shipperInfo.name">
										<el-input style="width: 80%" size="mini" v-model="createItem.shipperInfo.name"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="省市区" prop="shipperInfo.addressLine1">
										<el-input style="width: 80%" size="mini" v-model="createItem.shipperInfo.addressLine1" maxlength="35"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="街道地址" prop="shipperInfo.addressLine2">
										<el-input style="width: 80%" size="mini" v-model="createItem.shipperInfo.addressLine2" maxlength="35"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="手机" prop="shipperInfo.phone">
										<el-input style="width: 80%" size="mini" v-model="createItem.shipperInfo.phone"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="邮箱" prop="shipperInfo.email">
										<el-input style="width: 80%" size="mini" v-model="createItem.shipperInfo.email"></el-input>
									</el-form-item>
								</el-col>
							</el-row>
						</div>
					</section>
				</div>
				<div class="orderCard">
					<section class="order-section">
						<header class="order-section-header">
							<h2>收货人信息 <span class="tips">(如果填写，所有信息必须同时填写，其中邮箱非必填)</span></h2>
						</header>
						<div>
							<el-row>
								<el-col :span="8">
									<el-form-item label="姓名" prop="consigneeInfo.name">
										<el-input style="width: 80%" size="mini" v-model="createItem.consigneeInfo.name"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="省市区" prop="consigneeInfo.addressLine1">
										<el-input style="width: 80%" size="mini" v-model="createItem.consigneeInfo.addressLine1" maxlength="35"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="街道地址" prop="consigneeInfo.addressLine2">
										<el-input style="width: 80%" size="mini" v-model="createItem.consigneeInfo.addressLine2" maxlength="35"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="手机" prop="consigneeInfo.phone">
										<el-input style="width: 80%" size="mini" v-model="createItem.consigneeInfo.phone"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="邮箱" prop="consigneeInfo.email">
										<el-input style="width: 80%" size="mini" v-model="createItem.consigneeInfo.email"></el-input>
									</el-form-item>
								</el-col>
							</el-row>
						</div>
					</section>
				</div>
				<div class="orderCard">
					<section class="order-section">
						<header class="order-section-header">
							<h2>优惠券信息</h2>
						</header>
						<div class="bottom-box">
							<el-form-item label="优惠券">
								<el-select style="width: 500px" clearable filterable size="mini" v-model="createItem.couponId">
									<el-option v-for="(o, key) in couponsOptions" :key="key" :label="o.label" :value="o.value"></el-option>
								</el-select>
							</el-form-item>
							<div class="submitButton">
                <!-- :loading="disabledBtn" :disabled="disabledBtn" -->
								<el-button type="primary" size="mini" ref="btnCancel"  @click="payOrder('createItemForm')">立即订舱</el-button>
							</div>
						</div>
					</section>
				</div>
			</el-form>
		</div>
		<el-dialog title="海运费预付切换提示" :visible.sync="dialogVisible" width="30%">
			<div class="switch-tip-wrap">
				<div class="switch-tip-title"><i class="el-icon-warning"></i>海运费到付加价提示</div>
				<div class="switch-tip-subtitle">海运费切换到付后，将会收取到付加价费用，明细如下：</div>
				<ul class="switch-tip-content">
					<li v-for="(item, index) in collectExtraCharges" :key="index">{{ item.cntrType }}: {{ item.price }} {{ item.currency }}</li>
				</ul>
			</div>

			<span slot="footer" class="dialog-footer">
				<el-button size="mini" @click="handleDlgCancel">取 消</el-button>
				<el-button size="mini" type="primary" @click="dialogVisible = false">确 定</el-button>
			</span>
		</el-dialog>
    <!-- 订舱按钮 -->
    <template v-if="showBtnBox">
      <div class="but-box">
        	<p class="email">
            <span>邮箱：</span><el-input style="width: 80%" size="mini" v-model="createItem.emergencyContactInfo.email"></el-input>
          </p>
          <p class="btn">
            <el-button type="primary" size="mini" ref="btnCancel"  @click="payOrder('createItemForm')">立即订舱</el-button>
          </p>
      </div>
    </template>
	</div>
</template>
<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { bookInfo, extraChargeFeeList, booking, intermodalService, getPackageType } from '@/api/exec/oocl'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { validateChineseChart } from '@/views/exec/validate.js'
import {
	feeItemClassList, // 费用类别
	feeItemInfo // 详情
} from '@/api/fin/feeitem'
const RULES1 = {
	'emergencyContactInfo.email': [
		{ required: true, message: '联系人邮箱不能为空', trigger: 'blur' },
		{ validator: validateChineseChart('联系人邮箱'), trigger: 'blur'}
	],
	'emergencyContactInfo.name': [
		{ validator: validateChineseChart('姓名'), trigger: 'blur'}
	],
	'emergencyContactInfo.mobile': [
		{ validator: validateChineseChart('手机号'), trigger: 'blur'}
	],
	'emergencyContactInfo.phone': [
		{ validator: validateChineseChart('固定电话'), trigger: 'blur'}
	],
	'emergencyContactInfo.address': [
		{ validator: validateChineseChart('地址'), trigger: 'blur'}
	],
	'cargoInfo.desc': [
		{ required: true, message: '货物描述不能为空', trigger: 'blur' },
		{ validator: validateChineseChart('货物描述'), trigger: 'blur'}
	],
	'cargoInfo.packageType': [{ required: true, message: '包装类型不能为空', trigger: 'blur' }],
	'cargoInfo.quantity': [{ required: true, message: '数量不能为空', trigger: 'blur' }],
	'cargoInfo.weight': [{ required: true, message: '重量不能为空', trigger: 'blur' }],
	'cargoInfo.volume': [{ required: true, message: '体积不能为空', trigger: 'blur' }],
	'cargoInfo.remarks': [
		{ required: true, message: '备注不能为空', trigger: 'blur' },
		{ validator: validateChineseChart('备注'), trigger: 'blur'}
	]
}
const RULES2 = {
	'shipperInfo.name': [
		{ required: false, message: '托运人姓名不能为空', trigger: 'blur' },
		{ validator: validateChineseChart('托运人姓名'), trigger: 'blur'}
	],
	'shipperInfo.addressLine1': [
		{ required: false, message: '省市区不能为空', trigger: 'blur' },
		{ validator: validateChineseChart('省市区'), trigger: 'blur'}
	],
	'shipperInfo.addressLine2': [
		{ required: false, message: '街道地址不能为空', trigger: 'blur' },
		{ validator: validateChineseChart('街道地址'), trigger: 'blur'}
	],
	'shipperInfo.phone': [
		{ required: false, message: '手机不能为空', trigger: 'blur' },
		{ validator: validateChineseChart('手机'), trigger: 'blur'}
	],
	'shipperInfo.email': [
		{ required: false, message: '邮箱不能为空', trigger: 'blur' },
		{ validator: validateChineseChart('邮箱'), trigger: 'blur'}
	],
}
const RULES3 = {
	'consigneeInfo.name': [
		{ required: false, message: '收货人姓名不能为空', trigger: 'blur' },
	  { validator: validateChineseChart('收货人姓名'), trigger: 'blur'}
	],
	'consigneeInfo.addressLine1': [
		{ required: false, message: '省市区不能为空', trigger: 'blur' },
		{ validator: validateChineseChart('省市区'), trigger: 'blur'}
	],
	'consigneeInfo.addressLine2': [
		{ required: false, message: '街道地址不能为空', trigger: 'blur' },
		{ validator: validateChineseChart('街道地址'), trigger: 'blur'}
	],
	'consigneeInfo.phone': [
		{ required: false, message: '手机不能为空', trigger: 'blur' },
		{ validator: validateChineseChart('手机'), trigger: 'blur'}
	],
	'consigneeInfo.email': [
		{ required: false, message: '邮箱不能为空', trigger: 'blur' },
		{ validator: validateChineseChart('邮箱'), trigger: 'blur'}
	],
}
export default {
	mixins: [routerMixin],
	data() {
		return {
      loading: false,
			currRow: {},
			collectExtraCharges: [],
			currTable: 'oceanFeeList',
			currIndex: -1,
			dialogVisible: false,
			//明细信息汇总
			detailInfo: {},
			//获取箱型汇总信息
			shippingLineList: [],
			//详情页数据
			bookDetailInfo: {},
			//箱型数据列表
			containerPriceList: [],
			couponsInfoList: [],
			couponsOptions: [],
			createItem: {
				productId: '',
				couponId: '',
				containerInfos: [],
				blQuantity: 1,
				couponsInfo: null,
				//紧急联系人
				emergencyContactInfo: {
					name: '',
					address: '',
					mobile: '',
					phone: '',
					email: ''
				},
				// 托运人信息
				shipperInfo: {
					name: '',
					addressLine1: '',
					addressLine2: '',
					phone: '',
					email: ''
				},
				// 收货人信息
				consigneeInfo: {
					name: '',
					addressLine1: '',
					addressLine2: '',
					phone: '',
					email: ''
				},
				//货物信息
				cargoInfo: {
					desc: 'FURNITURE',
					packageType: 'IV',
					quantity: 1000,
					weight: 15000,
					volume: 1000.5,
					remarks: '94011000'
				},
				containerInfos: [],
				//备注
				remarks: '',
				//保价服务
				includeInsurance: false,
				dischargeServiceNo: ''
			},
			rules: Object.assign({}, RULES1, RULES2, RULES3),
			extraFeeList: '',
			//起运港费用
			porExtraFeeList: [],
			//目的地费用
			fndExtraFeeList: [],
			//附加费列表
			extraFeeList: [],
			oceanFeeList: [],
			remainQuantity: 0,
			porCityFullNameCn: '',
			fndCityFullNameCn: '',
			// 联运服务
			dischargeServices: {
				selectOptions: [],
				list: [],
				tableList: [],
				bargeDay: '',
				transitDay: '',
				transportTerms: ''
			},
			// 包装类型
			packageTypeList: [],
			disabledBtn: false,
      showBtnBox: true
		}
	},
	created() {
		this.cTimestamp = new Date().getTime()
		this.init()
	},
	activated() {
		let timestamp = new Date().getTime()
		if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
			this.init()
		}
	},
	computed: {
		...mapGetters(['dictMap', 'dictMapObj'])
	},
	filters: {
		billPriceFilter(row) {
			if (!row.priceTicket) return
			if (row.paymentTerm === 'P') {
				return row.priceTicket.P && `${row.priceTicket.P.currency} ${row.priceTicket.P.price}`
			} else {
				return row.priceTicket.C && `${row.priceTicket.C.currency} ${row.priceTicket.C.price}`
			}
		},
		price20GpFilter(row) {
			if (!row.price20Gp) return
			if (row.paymentTerm === 'P') {
				return row.price20Gp.P && `${row.price20Gp.P.currency} ${row.price20Gp.P.price}`
			} else {
				return row.price20Gp.C && `${row.price20Gp.C.currency} ${row.price20Gp.C.price}`
			}
		},
		price40GpFilter(row) {
			if (!row.price40Gp) return
			if (row.paymentTerm === 'P') {
				return row.price40Gp.P && `${row.price40Gp.P.currency} ${row.price40Gp.P.price}`
			} else {
				return row.price40Gp.C && `${row.price40Gp.C.currency} ${row.price40Gp.C.price}`
			}
		},
		price40HqFilter(row) {
			if (!row.price40Hq) return
			if (row.paymentTerm === 'P') {
				return row.price40Hq.P && `${row.price40Hq.P.currency} ${row.price40Hq.P.price}`
			} else {
				return row.price40Hq.C && `${row.price40Hq.C.currency} ${row.price40Hq.C.price}`
			}
		},
		yesNo(val) {
			return val === 'yes' ? '是' : val === 'no' ? '否' : ''
		}
	},
	methods: {
    // 滚动条距离底部的距离scrollBottom
    scrollBottom() {
      let ele = document.querySelector('.app-main')
      let {scrollHeight, scrollTop, clientHeight }= ele
      let scrollBottom = scrollHeight - scrollTop - clientHeight
      this.showBtnBox = scrollBottom > 200
    },
		//取消切换费用
		handleDlgCancel() {
			this.currRow.paymentTerm = 'P'
			if (this.currRow.oceanFlag) {
				//处理跟随海运数据
				this.oceanFeeList = this.oceanFeeList.map(item => {
					if (item.followOceanFee && item.paymentTerms.includes('P')) {
						item.paymentTerm = 'P'
					}
					return item
				})
				//处理跟随海运数据
				this.porExtraFeeList = this.porExtraFeeList.map(item => {
					if (item.followOceanFee && item.paymentTerms.includes('P')) {
						item.paymentTerm = 'P'
					}
					return item
				})
			}
			this.dialogVisible = false
		},
		handleChange(table, row) {
			this.currTable = table
			this.currRow = row
			if (row.oceanFlag) {
				//处理跟随海运数据
				this[table] = this[table].map(item => {
					if (item.followOceanFee && item.paymentTerms.includes(row.paymentTerm)) {
						item.paymentTerm = row.paymentTerm
					}
					return item
				})
				//处理跟随海运数据
				this.porExtraFeeList = this.porExtraFeeList.map(item => {
					if (item.followOceanFee && item.paymentTerms.includes(row.paymentTerm)) {
						item.paymentTerm = row.paymentTerm
					}
					return item
				})
			}

			//打开或关闭弹窗
			this.dialogVisible = row.paymentTerm === 'C'
		},

		init() {
			//清空表单数据
			this.clearFormData()
			let productId = this.$route.query.productId
			let sapid = this.$route.query.sapid
      this.loading = true
			bookInfo({ productId, sapid }).then(res => {
				this.detailInfo = res.data
				let data = res.data
				//初始话系统数据
				this.shippingLineList = []
				this.shippingLineList.push(res.data)
				this.bookDetailInfo = res.data
				this.containerPriceList = res.data.routeProductPricingList
				this.porCityFullNameCn = res.data.porCity.cityFullNameCn
				this.fndCityFullNameCn = res.data.fndCity.cityFullNameCn
				this.remainQuantity = this.bookDetailInfo.inventory
				this.couponsInfoList = res.data.couponInfos
				this.collectExtraCharges = res.data.collectExtraCharges
				this.hanlderCouponsOption()
			}).finally(() => {
        this.loading = false
      })
			// intermodalService({ productId, sapid }).then(({ data }) => {
			// 	if (data.code != 0) return this.$msgErrClose(data.msg)
			// 	let selectOptions = (data.data || {}).dischargeServices || []
			// 	this.dischargeServices.selectOptions.splice(0, 1000, ...selectOptions)
			// })
			//初始化附加费信息
			this.getExtraFeeList()
		},
		//处理优惠券信息
		hanlderCouponsOption() {
			if (this.couponsInfoList.length > 0) {
				this.couponsInfoList.map(item => {
					let coupons = {}
					let label = item.displayName + '(' + item.currency + item.value + ')'
					this.couponsOptions.push({ label: label, value: item.couponId })
				})
			}
		},
		clearFormData() {
			//起运港费用
			this.porExtraFeeList = []
			//目的地费用
			this.fndExtraFeeList = []
			//附加费列表
			this.oceanFeeList = []
			this.createItem.productId = this.$route.query.productId
			this.couponsOptions = []
		},
		// 取消
		handleCancel() {
			this.$router.replace({
				path: 'shippingLineSearch'
			})
		},
		// 箱型合并
		priceFeeArraySpanMethod({ row, column, rowIndex, columnIndex }) {
			if (rowIndex == 0 && columnIndex == 6) {
				return [3, 1]
			} else if (rowIndex > 0 && columnIndex == 6) {
				return [0, 0]
			}
		},
		arraySpanMethod({ row, column, rowIndex, columnIndex }) {
			// 附加费模板合并
			if (columnIndex == 0) {
				return [1, 8]
			}
		},
		quantityChange() {
			let totalQuantity = 0
			this.containerPriceList.map(item => {
				if (item.quantity) {
					totalQuantity = parseInt(totalQuantity) + parseInt(item.cntrType != '20GP' ? parseInt(item.quantity) * 2 : parseInt(item.quantity))
				}
			})

			this.remainQuantity = parseInt(this.bookDetailInfo.inventory) - parseInt(totalQuantity)
		},
		blQuantityChange() {},
		//立即订舱
		payOrder(formName) {
      if (!this.createItem.emergencyContactInfo.email) {
        this.$message.error('联系人邮箱不能为空')
				return false
      }
			this.buildCreatdItem()
			this.$refs[formName].validate(valid => {
				if (valid && this.validate()) {
					let data = JSON.parse(JSON.stringify(this.createItem))
					let res1 = Object.values(data.shipperInfo).every(item => item === '')
					if (res1) {
						delete data.shipperInfo
					} else {
						let res3 = false
						Object.keys(data.shipperInfo).forEach(key => {
							if (!data.shipperInfo[key] && key !== 'email') {
								res3 = true
							}
						})
						if (res3) {
							return this.$msgErrClose('托运人信息必须同时填写，邮箱非必填')
						}
					}
					let res2 = Object.values(data.consigneeInfo).every(item => item === '')
					if (res2) {
						delete data.consigneeInfo
					} else {
						let res4 = false
						Object.keys(data.consigneeInfo).forEach(key => {
							if (!data.consigneeInfo[key] && key !== 'email') {
								res4 = true
							}
						})
						if (res4) {
							return this.$msgErrClose('收货人信息必须同时填写,邮箱非必填')
						}
					}
          // 验证紧急联系人邮箱
          let email = this.createItem.emergencyContactInfo.email
          let reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,5}$/
          if (!reg.test(email)) {
            return this.$msgErrClose('紧急联系人邮箱格式不正确')
          }
					// this.disabledBtn = true
					data.dischargeServiceNo = (data.intermodalService && data.intermodalService.intermodalServiceNo) || undefined

					//v2新增参数
					data.preferPaymentTerms = 'P'

					data.specificPaymentTerms = this.getParams()
					data.sapid = this.$route.query.sapid
					console.log('🚀 ~ data', data)
					booking(data)
						.then(res => {
							this.$message({ message: '恭喜你，订舱成功', type: 'success' })
							this.visible = false
							this.$emit('refreshDataList')
							// this.isJumpRouteFromPage = true
							// this.$router.push({
							// 	path: 'orderSearch'
							// })
						})
						.catch(() => {})
						.finally(() => {
							// this.disabledBtn = false
						})
				} else {
					return false
				}
			})
		},
		//获取到付参数
		getParams() {
			return [...this.oceanFeeList, ...this.porExtraFeeList]
				.filter(item => item.paymentTerm === 'C')
				.map(item => {
          if (item.chargeType === 'OCEAN_FEE') {
            item.chargeName = null
          }
					return {
						chargeType: item.chargeType,
						chargeName: item.chargeName,
						paymentTerms: 'C'
					}
				})
		},
		validate() {
			if (this.createItem.containerInfos.length == 0) {
				this.$message.error('箱量不能为空')
				return false
			}
			if (this.remainQuantity < 0) {
				this.$message.error('没有可用舱位')
				return false
			}
			return true
		},
		buildCreatdItem() {
			this.createItem.containerInfos = []
			//构建需要提交的箱型箱量参数
			if (this.containerPriceList.length > 0) {
				this.containerPriceList.map(item => {
					if (item.quantity && item.quantity > 0) {
						this.createItem.containerInfos.push({
							containerType: item.cntrType,
							quantity: item.quantity
						})
					}
				})
			}
			this.createItem.couponsInfo = {}
			//处理优惠券信息
			if (this.createItem.couponId) {
				this.couponsInfoList.map(item => {
					if (this.createItem.couponId == item.couponId) {
						Object.assign(this.createItem.couponsInfo, {
							couponId: item.couponId,
							amount: item.value
						})
						return
					}
				})
			} else {
				this.createItem.couponsInfo = null
			}
		},
		//处理附加费相关数据  定义数据结构为双层map 结构  Map<chargeTag,Map<chargeCode,Fee>>
		getExtraFeeList() {
			//获取附加费明细数据
			extraChargeFeeList({ productId: this.createItem.productId, sapid: this.$route.query.sapid }).then(res => {
				this.extraFeeDataList = res.data
				let oceanFeeList = JSON.parse(JSON.stringify(res.data))
				let porExtraFeeList = JSON.parse(JSON.stringify(res.data))
				let oceanFeeListArr = oceanFeeList
					.filter(item => item.chargeTag === 'OCEAN')
					.map(item => {
						item.paymentTerm = item.paymentTerms[0]
						return item
					})
				let porExtraFeeListArr = porExtraFeeList
					.filter(item => item.chargeTag === 'POR')
					.map(item => {
						item.paymentTerm = item.paymentTerms[0]
						return item
					})

				let routeProductObj = this.containerPriceList.reduce(
					(obj, curr) => {
						let cntrType = ''
						switch (curr.cntrType) {
							case '20GP':
								cntrType = 'price20Gp'
								break
							case '40GP':
								cntrType = 'price40Gp'
								break
							case '40HQ':
								cntrType = 'price40Hq'
								break
							default:
								break
						}
						obj[cntrType] = {
							P: {
								price: curr.price,
								currency: curr.currency
							},
							C: {
								price: curr.price,
								currency: curr.currency
							}
						}
						return obj
					},
					{ oceanFlag: true, chargeType: 'OCEAN_FEE', chargeName: '海运费', chargeTag: 'OCEAN', paymentTerms: ['P', 'C'], paymentTerm: 'P', unitType: '箱型', priceTicket: {} }
				)
				this.oceanFeeList = [...[routeProductObj], ...oceanFeeListArr]
				this.porExtraFeeList = porExtraFeeListArr
			})
		},

		handlerExtraChargeFeeList() {
			this.extraFeeList = []
			var extraFeeMap = new Map()
			//1.遍历外层结构   通过 chargeModel 知道单位 箱型/票  通过  cntrSize知道具体是哪个箱型的费用
			this.extraFeeDataList.map(item => {
				//2.遍历内层明细机构   通过chargeTag 知道是哪种类型的费用  并且按费用进行分组
				item.chargeDetail.map(fee => {
					var extraFeeDetailMap = extraFeeMap.get(fee.chargeTag)
					//如果已经存在分组
					if (extraFeeDetailMap) {
						//查看chargeCode 是否存在
						var feeObject = extraFeeDetailMap.get(fee.chargeName)
						//如果已经存在相同的费用  设置其它箱型的费用
						if (feeObject) {
							//把当前最新的记录复制给之前的记录
							feeObject.price = fee.price
							feeObject.currency = fee.currency
							this.setExtraFee(feeObject, item.chargeModel, item.cntrSize)
						} else {
							//如果不存在费用  需要新增费用
							this.setExtraFee(fee, item.chargeModel, item.cntrSize)
							extraFeeDetailMap.set(fee.chargeName, fee)
						}
					} else {
						//如果不存在分组
						extraFeeDetailMap = new Map()
						this.setExtraFee(fee, item.chargeModel, item.cntrSize)
						extraFeeDetailMap.set(fee.chargeName, fee)
						extraFeeMap.set(fee.chargeTag, extraFeeDetailMap)
					}
				})
			})
			console.log('🚀 ~ extraFeeMap', extraFeeMap)
			//添加海运费
			this.pushExtraFeeIntoList(extraFeeMap, 'OCEAN')
			//添加起始地地费用
			this.pushExtraFeeIntoList(extraFeeMap, 'POR')
		},
		/**
		 * 设置附加费的费用项
		 * fee 费用项
		 * chargeModel 单位
		 * cntrSize 箱型
		 */
		setExtraFee(fee, chargeModel, cntrSize) {
			//单位
			if (chargeModel == 'BL') {
				//票结
				Vue.set(fee, 'unit', '票')
				Vue.set(fee, 'billPrice', fee.currency + ' ' + fee.price)
			} else if (chargeModel == 'CNTR') {
				//箱型
				Vue.set(fee, 'unit', '箱型')
				Vue.set(fee, cntrSize, fee.currency + ' ' + fee.price)
				Vue.set(fee, 'billPrice', '')
			}
		},
		/**
		 * 设置附加费列表展示数据
		 * feeMap 费用分组 Map
		 * groupCode 费用分组编码 string
		 */
		pushExtraFeeIntoList(extraFeeMap, groupCode) {
			// //将列表按顺序分割 OCEAN POR  POD
			var feeMap = new Map()
			feeMap = extraFeeMap.get(groupCode)
			if (feeMap) {
				feeMap.forEach((item, key) => {
					console.log(groupCode)
					if (groupCode === 'OCEAN') {
						this.oceanFeeList.push(item)
					} else if (groupCode === 'POR') {
						this.porExtraFeeList.push(item)
					} else if (groupCode === 'POD') {
						this.fndExtraFeeList.push(item)
					}
					this.extraFeeList.push(item)
				})
				console.log(this.extraFeeList)
			}
		},
		intermodalServiceChange(val) {
			let list = !val ? [] : val.containerInfoDTOList
			console.log(val)
			console.log(list)
			let tableList = [],
				obj = {}
			list.forEach(item => {
				tableList.push({ prop: item.cntrSizeType, label: item.cntrSizeType })
				obj[item.cntrSizeType] = item.cntrPrice + ' ' + item.currencyType
			})
			console.log(obj)
			this.dischargeServices.tableList.splice(0, 1000, ...tableList)
			this.dischargeServices.list.splice(0, 1000, obj)
			this.dischargeServices.bargeDay = val.bargeDay
			this.dischargeServices.transitDay = val.transitDay
			this.dischargeServices.transportTerms = val.transportTerms
			this.dischargeServices.transshipmentModel = val.transshipmentModel
			console.log(this.dischargeServices)
			// if (val) {
			// 	this.rules = Object.assign({}, RULES1, RULES2)
			// } else {
			// 	this.rules = Object.assign({}, RULES1)
			// }
			this.rules = Object.assign({}, RULES1, RULES2, RULES3)
			this.$nextTick(() => {
				this.$refs.createItemForm.clearValidate()
			})
		},
		getPackageType(str) {
			if (str === false) {
				return
			}
			str = str === true ? '' : str
			let data = {
				currPage: 1,
				pageSize: 100,
				keywords: str
			}
			getPackageType(data)
				.then(res => {
					if (res.code === 0) {
						this.packageTypeList = res.data.list
					}
				})
				.catch(() => {})
		}
	},
  mounted() {
    document.querySelector('.app-main').addEventListener('scroll', this.scrollBottom)
  },
  beforeDestroy() {
    document.querySelector('.app-main').removeEventListener('scroll', this.scrollBottom)
  },
}
</script>
<style lang="scss">
@import '/less/detail.scss';
@import '/less/index.scss';
.switch-tip-wrap {
	.el-icon-warning {
		color: orange;
		margin-right: 8px;
	}
	.switch-tip-title {
		font-weight: bold;
		color: #333;
	}
	.switch-tip-subtitle {
		margin-left: 20px;
		margin-top: 8px;
		margin-bottom: 6px;
	}
	.switch-tip-content {
		margin-left: 38px;
		li {
			list-style-type: disc;
			margin-bottom: 4px;
		}
	}
}
.span-label,
.span-value {
	display: inline-block;
	line-height: 18px;
	padding: 8px 0;
	font-size: 14px;
	color: #4a4a4a;
}

.row-form.fullWidth {
	padding: 20px !important;
	& > div {
		display: inline-block;
		width: 300px;
		&.full-width {
			width: 100%;
		}
	}

	.el-col {
		margin-left: 25px;
	}
}

.el-form--label-top .el-form-item__label {
	padding: 0 0 0;
}
.order-section-header span.tips {
	font-size: 12px;
	color: #999;
	font-weight: normal;
}
.bottom-box{
  display: flex;
  vertical-align: middle;
  .submitButton{
    text-align: right;
    flex: 1;
    margin: 0 5px 4px 0;
    padding: 0;
  }
}
.blQuantity {
    .check {
      margin-top: 10px;
      .el-checkbox__label {
        font-weight: bolder;
        color: #1890ff !important;
        font-size: 16px;
      }
    }
  }
.edit-container-exec {
	.el-form-item {
		margin-bottom: 17px !important;
	}
}	
</style>
