import { getOrderNoQuery } from '@/api/order/list'
const options = {
    FactoryDisagree: { // 提单列表
        fromParams: 'universalNo',
        toParams: 'orderNo',
        scenes: 'SHIP_ORDER_LIST'
    },
    WhOrderList: {  // 海外仓订单列表
        fromParams: 'universalNo',
        toParams: 'orderNo',
        scenes: 'SHIP_ORDER_LIST'
    },
    WhJointList: {  // 海外仓协同单列表
        fromParams: 'universalNo',
        toParams: 'orderNo',
        scenes: 'SHIP_ORDER_LIST'
    },
    OrderList: {  // 海运订单列表
        fromParams: 'universalNo',
        toParams: 'orderNo',
        scenes: 'SHIP_ORDER_LIST'
    },
    JointList: { // 海运协同单列表
        fromParams: 'universalNo',
        toParams: 'orderNo',
        scenes: 'SHIP_ORDER_LIST'
    },
    BookShip: { // 整柜订舱列表
        fromParams: 'universalNo',
        toParams: 'bkgReqNo',
        scenes: 'SHIP_SPACE_BOOK_LIST'
    },
    LclAuditList: { // 拼箱订仓列表
        fromParams: 'universalNo',
        toParams: 'orderNo',
        scenes: 'SHIP_ORDER_LIST'
    },
    LclOrderList: { // 外运订仓列表
        fromParams: 'universalNo',
        toParams: 'orderNo',
        scenes: 'SHIP_ORDER_LIST'
    },
    ShipBlList: { // 提单列表
        fromParams: 'universalNo',
        toParams: 'orderNo',
        scenes: 'SHIP_ORDER_LIST'
    },
    ORDER_LCL_LIST: { // 海运关联订单
        fromParams: 'universalNo',
        toParams: 'orderNo',
        scenes: 'SHIP_ORDER_LIST'
    },
    SiList: { // 补料列表
        fromParams: 'universalNo',
        toParams: 'oid',
        scenes: 'SHIP_BL_SI_LIST'
    },
    RailwayMblTakeList: {  // MBL取单列表
        fromParams: 'universalNo',
        toParams: 'oid',
        scenes: 'WO_TAKE_MBL_LIST'
    },
    RailwayHblTakeList: { // hbl取单列表
        fromParams: 'universalNo',
        toParams: 'oid',
        scenes: 'WO_TAKE_HBL_LIST'
    },
    RailwayHblPageManage: { // 提单纸列表
        fromParams: 'universalNo',
        toParams: 'oid',
        scenes: 'WO_TAKE_HBL_LIST'
    },
    RailwayTradeTakeList: { // 贸易单证取单列表
        fromParams: 'universalNo',
        toParams: 'oid',
        scenes: 'WO_TAKE_TRADE_LIST'
    },
    RailwayPutList: { // 放单列表
        fromParams: 'universalNo',
        toParams: 'oid',
        scenes: 'WO_PUT_LIST'
    },
    BlFinApplyList: { // 放单申请列表
        fromParams: 'universalNo',
        toParams: 'oid',
        scenes: 'WO_FIN_LIST'
    },
    BlFinList: { // 放单申请 财务审核列表
        fromParams: 'universalNo',
        toParams: 'oid',
        scenes: 'WO_FIN_LIST'
    },
    AirTransportOrderList: { // 空运订单列表
        fromParams: 'universalNo',
        toParams: 'orderNo',
        scenes: 'AIR_ORDER_LIST'
    },
    AirTransportOrderReport: { // 空运订单列表
        fromParams: 'universalNo',
        toParams: 'orderNo',
        scenes: 'AIR_ORDER_REPORT_LIST'
    },
    AirTransportJointList: { // 空运协同订单列表
        fromParams: 'universalNo',
        toParams: 'orderNo',
        scenes: 'AIR_ORDER_LIST'
    },
    RailwayOrderList: {  // 铁路订单列表
        fromParams: 'universalNo',
        toParams: 'orderNo',
        scenes: 'RAIL_ORDER_LIST'
    },
    RailwayJointList: { // 铁路协同订单列表
        fromParams: 'universalNo',
        toParams: 'orderNo',
        scenes: 'RAIL_ORDER_LIST'
    },
    RAIL_ORDER_LCL_LIST: { // 待拼箱的散货单 关联订单
        fromParams: 'universalNo',
        toParams: 'orderNo',
        scenes: 'RAIL_ORDER_LCL_LIST'
    },
    CustomsDeclarationOrderList: { // 报关单
        fromParams: 'universalNo',
        toParams: 'orderNo',
        scenes: 'SHIP_ORDER_LIST'
    },
    ShipBlInfoList: { // 提单信息列表
        fromParams: 'universalNo',
        toParams: 'orderNo',
        scenes: 'SHIP_ORDER_LIST'
    },
}
export function getParamMethod(routeName, initQuery) {
    // fromParams 需要被替换的参数  toParams 被替换的最终参数
    return new Promise((resolve, reject) => {
        const {fromParams, toParams, scenes } = options[routeName]
        let query = JSON.parse(JSON.stringify(initQuery))
        let ind =  getfromParamsIndex(query.query, fromParams)
        if(ind !== -1) {
            let no = query.query[ind].value.split(/[\s]/).filter(Boolean).join(',')
            // 空字符串的不转换工作号
            if (!no) return resolve(query)
            getOrderNoQuery({ no, scenes })
            .then(res => {
                if(res.data) {
                    query.query.splice(ind, 1)
                    query.query.push({
                        column: toParams,
                        type: 'in',
                        value: res.data.join('#')
                    })
                    resolve(query)
                } else {
                    resolve(query)
                }	
            })
            .catch(() => {
                resolve(query)
            })
        } else {
            resolve(query)
        }
    })
   
}
function getfromParamsIndex(arr, fromParams) {
    let index = -1
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].column === fromParams) {
            index = i
            break
        }
    }
    return index
}