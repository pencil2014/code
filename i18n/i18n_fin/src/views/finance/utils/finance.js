/**
 * 人民币小写金额转换为大写
 * @param {Number} n 85
 * @returns {string} 捌拾伍元
 */
export function smalltoBIG(n) {
    var fraction = ['角', '分'];
    var digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    var unit = [
        ['元', '万', '亿'],
        ['', '拾', '佰', '仟']
    ];
    var head = n < 0 ? '欠' : '';
    n = Math.abs(n);
 
    var s = '';
 
    for (var i = 0; i < fraction.length; i++) {
        s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '');
    }
    s = s || '整';
    n = Math.floor(n);
 
    for (var i = 0; i < unit[0].length && n > 0; i++) {
        var p = '';
        for (var j = 0; j < unit[1].length && n > 0; j++) {
            p = digit[n % 10] + unit[1][j] + p;
            n = Math.floor(n / 10);
        }
        s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
    }
    return head + s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
  }
  /**
 * 日期时间的格式化
 * @param {String} 'yyyy-mm-dd'
 * @returns {string} '2019-06-06'
 */
export function dateFormat(fmt, date) {
  // 日期字符串 日期字符串最长长度19('2019-06-06 00:00:00')
  // 日期对象字符串 如果不设置format，日期对象转为字符串长度24('2021-07-20T16:00:00.000Z')
  // 保存的时候，如果设置了format按格式存为字符串，未设置则会保存为日期对象字符串，判断长度来判断是否是日期字符串
  if ((typeof date === 'string' && date.length < 24) || !date) {
    return date
  }
  let ret;
  // 保存搜索条件时，日期是字符串格式；请求参数时需转换为日期格式
  if(typeof date === 'string'){
    date = new Date(date)
  }
  const opt = {
      "y+": date.getFullYear().toString(),        // 年
      "m+": (date.getMonth() + 1).toString(),     // 月
      "d+": date.getDate().toString(),            // 日
      "H+": date.getHours().toString(),           // 时
      "M+": date.getMinutes().toString(),         // 分
      "S+": date.getSeconds().toString()          // 秒
      // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
      ret = new RegExp("(" + k + ")").exec(fmt);
      if (ret) {
          fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
      };
  };
  return fmt;
}

  /**
 * 多于两位小数位的小数保留2个小数位
 * @param {Number} 4.23323
 * @returns {Number} 4.23
 */
export function decimalFixed2(x) {
    // var x = 4.23323;//测试的数字
    var y = String(x).indexOf(".") + 1;//获取小数点的位置
    // var count = String(x).length - y;//获取小数点后的个数
    if(y > 0) {
      // return Math.round(x * 100) / 100
      return new LSnum(x).toNum(2)
        // console.log("这个数字是小数，有" + count + "位小数");
    } else {
        return x
        // console.log("不是小数");
    }
}

// 数据的深拷贝
export function deepCloneLs(obj) {
    var objClone = Array.isArray(obj) ? [] : {};
    if (obj && typeof obj === "object" && !(obj instanceof Function)) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (obj[key] && typeof obj[key] === "object" && !(obj instanceof Function)) {
                    objClone[key] = deepCloneLs(obj[key]);
                } else {
                    objClone[key] = obj[key];
                }
            }
        }
    } else {
        objClone = obj
    }
    return objClone;
}

export function originalCurrencyFn(val) {
  return {
    systemRate: 1,
    settlementRateTitle: val + '-' + val,
    settlementRate: 1,
    exchangeRateId: '',
    lowerRate: 1,
    upperRate: 1,
    disabled: true,
    rate: 1,
    srcCurrency: val,
    toCurrency: val,
  }
}