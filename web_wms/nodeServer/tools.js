

module.exports = {

    /**
     * @method json
     * @description 设置返回json的数据
     * @param {Object} res response
     * @param {*} data 返回给前端的数据
     * @param {*} errMsg 服务端报错的信息
     *
     * @param {Object} options
     *  - {Object, Array} cookies 设置cookie [ 可跨域 ], 跨域需要指定Origin 可传对象, 或者数组
     */
    json: function( res, data, errMsg, options ) {

        options = options || {};
        options.cookies && this.setCookies( res, options.cookies );
        options.headers && this.setResponseHeaders(res, options.headers );

        res.send( "header", Tools.setHeader );
        res.send( "json", this.returnFactory(data), errMsg );
    },

    html: function( res, data, options ) {

        options = options || {};
        options.cookies && this.setCookies( res, options.cookies );
        options.headers && this.setResponseHeaders(res, options.headers );

        res.send( "header", Tools.setHeader );
        res.send( "json", data );
    },

    jsonp: function( res, data ) {
        res.send( "end", data );
    },

    images: function( res, data, type, options  ) {
        type = type || "png";
	    options = options || {};
        options.headers && this.setResponseHeaders(res, options.headers );
	    Tools.setHeader["Access-Control-Allow-Credentials"] = "true";
	    res.send( "header", Tools.setHeader );
        res.send( "images", data, type );
    },

    /**
     * @method setAllowHeaders
     * @description 设置自定义通过的请求头的权限, 针对非简单跨域请求的验证, 带预检方式
     *  简单请求定义[get,post,option]( application/x-www-form-urlencoded, multipart/form-data, text/plain ), 且不携带自定义请求头
     */
    setAllowHeaders: function( arr ) {
        var headers = this.setHeader[ 'Access-Control-Allow-Headers' ];

        arr = arr || "";
        arr = typeof arr === "string" ? [ arr ] : arr;
        this.setHeader[ 'Access-Control-Allow-Headers' ] = headers + arr.toString();
    },

    // 设置跨域允许的域
    setAllowOrigin: function( arr ) {
        var origin = this.setHeader[ 'Access-Control-Allow-Origin' ];

        arr = arr || "";
        arr = typeof arr === "string" ? [ arr ] : arr;
        this.setHeader[ 'Access-Control-Allow-Origin' ] = origin + arr.toString();
    },
    /**
     * @method setCookies
     * @description 设置cookie信息
     * @param {Object} res
     * @param {Object} options
     *  - {String} cors 指定域名
     *  - {Object} data cookie的数据
     *
     * @demo options: { data: { name: 'a', value: '1' }, cors: 'http://10.45.131.209:8081' }
     */
    setCookies: function( res, options ) {

        options = options || {};
        if ( options.data ) {
            this.setHeader[ "Set-Cookie" ] = res.cookie.set( options.data );
        }

        // 跨域需要指定域名
        if ( options.cors ) {
            this.setHeader[ "Access-Control-Allow-Credentials" ] = "true";
            this.setHeader[ "Access-Control-Allow-Origin" ] = options.cors;
        }
    },

    // 设置响应头
    setResponseHeaders: function(res, options ) {
        var setHeader = this.setHeader;
        console.log(99, res)
        options = options || {};
        for ( var i in options ) {
            // if (i === '') {
            //     setHeader['Access-Control-Allow-Origin'] = res
            // }
            if (options[i]) {
                setHeader[i] = options[i];
            }
        }
    },

    // 设置跨域
    setHeader: {
        "Access-Control-Allow-Credentials": "true", // 设置跨域允许开关
        "Access-Control-Allow-Origin": "*", //http://localhost:7003, http://172.16.50.123:7000
        'Access-Control-Allow-Headers': 'Content-Type,Content-Length,Accept,token,X-TOKEN,x-token,fromSystem,toSystem,requestId,requestTime,Authorization',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,PATCH,OPTIONS',
        'Access-Control-Max-Age': 3600
    },

    /**
     * @method tools.day
     * @description 时间格式化
     *
     * @method generate 生成基准时间对象
     * @method timeStamp 返回时间戳, 1486779531201
     * @method date 返回年月日, 2017-02-11
     * @method hours 返回时分秒, 10:18:51
     * @method seconds 返回毫秒, 204
     * @method timeSeconds 返回年月日-时分秒-毫秒, 2017-02-11 10:18:51:205
     * @method time 返回年月日-时分秒, 2017-02-11 10:18:51
     *
     */
    day: {
        generate: function() {
            var time = new Date(), day, hours,
                getMilliseconds = time.getMilliseconds(),
                timeFormat = function( num ) {
                    if ( num < 10 ) {
                        return "0" + num;
                    }
                    return num;
                };

            day = time.getFullYear() + "-" + timeFormat( time.getMonth() + 1 ) + "-" + timeFormat( time.getDate() );
            hours = time.toTimeString().slice( 0, 8 );

            return {
                timeStamp: +time,
                day: day,
                hours: hours,
                seconds: getMilliseconds
            }
        },
        timeStamp: function() {
            return this.generate().timeStamp;
        },
        date: function() {
            return this.generate().day;
        },
        hours: function() {
            return this.generate().hours;
        },
        seconds: function() {
            return this.generate().seconds;
        },
        timeSeconds: function() {
            var o = this.generate();
            return o.day + ' ' + o.hours + ':' + o.seconds;
        },
        time: function( timeStamp ) {
            var o = this.generate( timeStamp );
            return o.day + ' ' + o.hours;
        }
    },

    returnFactory(params) {
        let that = this;
        return Object.assign({
            time: that.day.timeSeconds(),
            msg: '',
            code: 0,
            data: null
        }, params);
    }
};


/*
var options = {
    headers: {
        ooxx: "1111"
    },
    cookies: {
        data: {
            name: "one",
            value: "123"
        },
        cors: "http://10.45.131.209:8081"
    }
};
Tools.json( res, require( './wxGetPkgList' ), "", options );
*/
