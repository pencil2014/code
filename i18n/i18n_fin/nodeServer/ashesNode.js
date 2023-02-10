
var http = require( "http" ),
    path = require( 'path' ),
    crypto = require("crypto"),
    zlib = require('zlib'),
    url = require( "url" ),
    fs = require('fs'),
    queryString  = require( "querystring" ),
    toString = Object.prototype.toString,
    _slice = Array.prototype.slice,
    ashesNode = {},
    // 工具类
    privateTools = {
        config: {

            // 缓存, must-revalidate, max-age
            Expires: {
                fileMatch: /^(gif|png|jpg|js|css)$/ig,
                maxAge: 60 * 60 * 24
            },

            // 压缩( 只支持gzip )
            Compress: {
                isEnd: true,
                match: /css|js/ig
            },

            // 静态目录
            staticResource: "",

            // 设置静态资源的最大预览值, 默认20M
            staticLimit: 1024 * 1024 * 20,
            port: 80
        }
    };

privateTools.docType = {
    "ico"   : "image/x-icon",
    "svg"   : "image/svg+xml",
    "swf"   : "application/x-shockwave-flash",
    "tiff"  : "image/tiff",
    "wav"   : "audio/x-wav",
    "wma"   : "audio/x-ms-wma",
    "wmv"   : "video/x-ms-wmv",

    "text"  : "text/plain",
    "html"  : "text/html",
    "json"  : "application/json",
    "xml"   : "application/xml",
    "pdf"   : "application/pdf",
    "js"    : "text/javascript",
    "txt"   : "text/plain",
    "css"   : "text/css",
    "jpeg"  : "image/jpeg",
    "jpg"   : "image/jpeg",
    "png"   : "image/png",
    "gif"   : "image/gif"
};

[ "isFunction", "isObject", "isArray" ].forEach(function( value ) {
    var oName = value.substr( 2 );
    privateTools[ value ] = function( v ) {
        if ( toString.call( v ) === "[object "+ oName +"]" ) return true;
        return false;
    };
});

privateTools.error = function( fn, options ) {
    options = options || {};
    try {
        fn();
    } catch( ex ) {
        options.msg = ex;
        ashesNode.use.trigger( "error", options );
    }
};

/*
 * @method copy
 * @description 深复制浅复制
 *
 * @param {object} child 目标对象
 * @param {object} parent 当前对象
 * @param {boolean} isCopy 是否深复制
 */
privateTools.copy = function( child, parent, isCopy ) {
    if ( !privateTools.isObject( parent ) ) return;
    var i;
    child = child || {};
    for ( i in parent ) {
        if ( parent.hasOwnProperty( i ) ) {
            if ( privateTools.isObject( parent[i] ) && isCopy ) {
                child[i] = privateTools.isArray( parent[i] ) ? [] : {};
                privateTools.copy( child[i], parent[i], isCopy );
            } else {
                child[i] = parent[i];
            }
        }
    }
    return child;
};

// cookie
privateTools.cookie = (function() {

    var init, getCookie, setCookie, serialize,

        oTime = {
            minute: function( value ) {
                return value * 60 * 1000;
            },
            hours: function( value ) {
                return value * 60 * 60 * 1000;
            },
            day: function( value ) {
                return value * 24 * 60 * 60 * 1000;
            },
            month: function( value ) {
                return value * 30 * 24 * 60 * 60 * 1000;
            }
        },
        self = null;

    init = function() {
        self = this;
    };

    serialize = function( options ) {
        var exp = new Date(), pairs,
            type = options.type || "minute",
            timeNum = options.time || "",
            path = options.path || "",
            domain = options.domain || "",
            httpOnly = options.httpOnly ? true : false,
            Secure = options.Secure ? true : false;

        exp.setTime( exp.getTime() + oTime[ type ]( timeNum ) );
        pairs = [ options.name + "=" + escape( options.value ) ];

        if ( timeNum ) pairs.push( "Expires=" + exp.toGMTString() );
        if ( path ) pairs.push( "Path=" + path );
        if ( domain ) pairs.push( "Domain=" + domain );
        if ( httpOnly ) pairs.push( "httpOnly" );
        if ( Secure ) pairs.push( "Secure" );

        return pairs.join( "; " );
    };

    /*
        @method setCookie
        @description 设置cookie
        @param {Object || Array} str cookie设置内容
            { name=名称, value=值, time=过期时间, type=过期类型, path=指定目录, domain=可访问的主机名, Secure=是否能读取cookie, httpOnly=是否安全传输 }
     */
    setCookie = function( opt ) {

        if ( !opt ) return;
        var options,
            valueArr = [];

        options = privateTools.isObject( opt ) ? [ opt ] : opt;
        options.forEach(function( value ) {
            valueArr.push( serialize( value ) );
        });

        return valueArr;
    };

    // 获取cookie
    getCookie = function( ckName ) {
        var i = 0, ii, arr, value, ckArr,
            str = self.headers.cookie;

        if ( !str ) return;
        ckArr = str.split( ";" );
        if ( !ckArr.length || !ckName ) return value;

        for ( ii = ckArr.length; i < ii; i++ ) {
            arr = ckArr[ i ].split( "=" );
            if ( ckName === arr[0] ) {
                value = arr[1];
                break;
            }
        }
        return value;
    };

    return {
        get: getCookie,
        set: setCookie,
        init: init
    }
})();

// output
privateTools.send = function() {

    var
        // this指向res对象, system是系统方法
        self = this,

        // 适配器处理渲染对象
        render = {}, system = {};

    self.tempHeader = {};

    // output json
    render.json = function( content, errorMsg ) {

        errorMsg = errorMsg || "";
        self.tempHeader[ "content-type" ] = privateTools.docType[ "json" ];
        system.writeHead( 200, self.tempHeader );

        system.write( JSON.stringify( content ) );
        system.end( errorMsg );
        self.tempHeader = {};
    };

    // output html
    render.html = function( content ) {
        self.tempHeader[ "content-type" ] = privateTools.docType[ "html" ];
        system.writeHead( 200, self.tempHeader );

        system.write( content );
        system.end();
        self.tempHeader = {};
    };

    // output images
    render.images = function( content, type ) {
        self.tempHeader[ "content-type" ] = privateTools.docType[ type ];
        system.writeHead( 200, self.tempHeader );

        system.write( content, 'binary' );
        system.end();
        self.tempHeader = {};
    };

    // output jsonp
    render.end = function( content ) {
        self.tempHeader[ "content-type" ] = privateTools.docType[ "json" ];
        system.writeHead( 200, self.tempHeader );

        system.end( content );
        self.tempHeader = {};
    };

    // set response header
    render.header = function( options ) {
        self.tempHeader = options;
    };

    system.writeHead = function( state, options ) {
        self.writeHead( state, options );
    };

    system.write = function ( value, other ) {

        if ( other ) {
            return self.write( value, other );
        }
        self.write( value );
    };

    system.end = function( str ) {

        str = str || "";
        self.end( str );
    };

    return function( type, content ) {

        var arg = _slice.call( arguments).slice( 1 );
        type = type || 'html';

        privateTools.isFunction( render[ type ] ) && render[ type ].apply( self, arg );
    };

};


/**
 * @method contentType
 * @description 根据content type解析出对象形式
 *
 * 支持以下方式
 * application/json => [ json字符串方式, url拼接方式 ] { 转换过程, 先json字符串转, 在url拼接转 }
 * application/x-www-form-urlencoded => [ url拼接方式 ]
 *
 */
privateTools.contentType = {
    'application/x-www-form-urlencoded': function( str ) {
        return queryString.parse( str );
    },
    'multipart/form-data': function( str ) {
        try {
            str = JSON.parse( str );
        } catch ( err ) {}
        return str;
    },
    'application/json': function( str ) {
        try {
            str = JSON.parse( str );
        } catch ( err ) {
            str = queryString.parse( str );
        }
        return str;
    }
};

// 解析静态目录
privateTools.staticResource = function( req, res, ext, filePath ) {

    var contentType, stream, lastModified, ifModifiedSince, ifNoneMatch,
        process = require('process'),
        expires = privateTools.config.Expires,
        compress = privateTools.config.Compress,
        staticLimit = privateTools.config.staticLimit;

    ext = ext ? ext.slice( 1 ) : 'unknown';
    contentType = privateTools.docType[ ext ] || "text/plain";

    fs.stat( filePath, function( err, stats ) {

        var currentDate, gzip,
            encoding = req.headers['content-encoding'],
            acceptEncoding = req.headers['accept-encoding'];

        if ( err ) {
            res.writeHead( 404, { "content-type": "text/html" } );
            res.end( "<h1>404 Not Found</h1>" );
            return;
        }

        if ( staticLimit < stats.size ) {
            res.writeHead( 403, { "content-type": "text/html" } );
            res.write('<head><meta charset="utf-8"/></head>');
            res.end( "<h1>最大可预览" + ( staticLimit / 1024 ) + "k</h1>" );
            return;
        }

        //console.log( acceptEncoding, encoding )

        // 如果文件存在
        if ( stats.isFile() ) {

            //获得文件的修改时间
            lastModified = stats.mtime.toUTCString();
            ifModifiedSince = "If-Modified-Since".toLowerCase();
            ifNoneMatch = "If-None-Match".toLowerCase();
            res.setHeader( "Last-Modified", lastModified );
            if ( ext.match( expires.fileMatch ) ) {
                currentDate = new Date();
                currentDate.setTime( currentDate.getTime() + expires.maxAge * 1000 );
                res.setHeader( "Expires", currentDate.toUTCString() );

                /**
                 * Cache-Control设置
                 * [from-memory-cache] must-revalidate 表示缓存服务器资源没过期, 不会发起请求, 一旦过期就发起((校验, 可以触发304, 后面一直是304)), 他配合Expires使用
                 * [from-memory-cache] max-age 表示缓存时间, 在设置时间内, 直接使用缓存服务器资源, 不会发起请求. 过期时间一到(校验, 可以触发304), 再次访问依然是200 from cache
                 */
                //res.setHeader( "Cache-Control", "must-revalidate" );
                res.setHeader( "Cache-Control", "max-age=" + expires.maxAge );
            }

            // 如果文件修改时间和请求中ifModifiedSince相等, 走304
            if ( lastModified == req.headers[ ifModifiedSince ] ) {
                res.writeHead( 304, "Not Modified" );
                res.end();
            } else {

                if( encoding === 'undefined'){
                    res.setEncoding('utf-8');
                }

                stream = fs.createReadStream( filePath );

                stream.on( 'error', function() {
                    res.writeHead( 500, { "content-type": contentType } );
                    res.end( "<h1>500 Server Error</h1>" );
                });

                // 请求头携带gzip且是压缩类型且开启压缩 ( 动态压缩 )
                if ( /gzip/.test( acceptEncoding ) && ext.match( compress ) && compress.isEnd ) {
                    res.writeHead( 200, { "content-type": contentType, 'Content-Encoding': 'gzip' } );
                    gzip = zlib.createGzip();
                    stream.pipe( gzip ).pipe( res );
                } else {
                    res.writeHead( 200, { "content-type": contentType } );
                    stream.pipe( res );
                }
            }
        }
    });
};

// create server
ashesNode.Server = function() {

    var server = new http.Server(),
        staticResource = privateTools.config.staticResource;

    server.on( "request", function( req, res ) {

        var pathname = decodeURI( url.parse( req.url ).pathname ),
            filePath = path.resolve( __dirname + pathname ),
            ext = path.extname( pathname );

        // Accept: image/webp,image/apng,image/*,*/*;q=0.8

            const gzip = zlib.createGzip();
            gzip.pipe(res);

        if ( !pathname.indexOf( '/favicon.ico' ) ) return res.end();

        // 判断是否静态文件, 暂不支持在线预览目录下文件
        if ( ext && pathname.startsWith( "/" + staticResource ) ) {
            return privateTools.staticResource( req, res, ext, filePath );
        }

        // 中间件开启
        if ( ashesNode.use.useQueue[ "useCookie" ] ) {
            privateTools.cookie.init.call( req );
            privateTools.copy( req, {
                cookie: privateTools.cookie
            });
            privateTools.copy( res, {
                cookie: privateTools.cookie
            });
        }

        // send output agent
        privateTools.copy( res, {
            send: privateTools.send.call( res )
        });

        ashesNode.Router.init( req, res );
    });
    console.log( "监听"+ privateTools.config.port +"端口" );
    server.listen( privateTools.config.port );
};

// 路由
ashesNode.Router = (function() {

    var init, getRoute, postRoute, putRoute, patchRoute, deleteRoute, addQueue, globalRoute, matchRoute, optionsRoute,
        contentTypeHeaders, matchHeaders, matchRouteDynamic,

        // 格式化数据
        oFormat = {},

        // route storage catalog
        queue = {
            // "GET,/index": {
            //     guId: 0,
            //     fn: [ function() {} ]
            // }
        },
        guId = 0;

    oFormat.hasBody = function( req ) {
        var headers = req.headers || {};
        return "Transfer-Encoding" in headers || "content-length" in headers;
    };

    oFormat.OPTIONS = function( req, fn ) {
        var oUrl, oString, handle;
        req = req || null;
        if ( !req ) return;

        handle = function( o ) {
            privateTools.isFunction( fn ) && fn( o );
        };

        oUrl = url.parse( req.url );
        oString = queryString.parse( oUrl.query );

        req.params = oString;
        req.pathname = oUrl.pathname;
        handle( req );
    };

    oFormat.GET = function( req, fn ) {
        var oUrl, oString, handle;
        req = req || null;
        if ( !req ) return;

        handle = function( o ) {
            privateTools.isFunction( fn ) && fn( o );
        };

        oUrl = url.parse( req.url );
        oString = queryString.parse( oUrl.query );

        req.params = oString;
        req.pathname = oUrl.pathname;
        handle( req );
    };

    oFormat.POST = function( req, fn ) {
        var buffers = [], handle;

        handle = function( o ) {
            privateTools.isFunction( fn ) && fn( o );
        };

        if ( this.hasBody( req ) ) {
            req.on( "data", function( chunk ) {
                buffers.push( chunk );
            });

            req.on( "end", function() {

                req.rawBody = Buffer.concat( buffers ).toString();
                req.rawBody = contentTypeHeaders( req.headers, req.rawBody );
                handle( req );
            });
        } else {
            handle( req );
        }
    };
    
    oFormat.PUT = oFormat.POST
    oFormat.PATCH = oFormat.PATCH
    oFormat.DELETE = oFormat.DELETE

    // 浅解析 contentType类型
    contentTypeHeaders = function( headers, str ) {
        var type = headers[ 'content-type' ],
            oContentType = privateTools.contentType,
            values = null;

        if ( !type ) return str;

        type = type.split( ";" )[0];
        if ( type in oContentType ) {
            return oContentType[ type ]( str );
        } else {
            return str;
        }
    };

    // 处理协议头, 待续
    matchHeaders = function( options ) {
        options = options || {};
        var o = {};
        o.host = options.host;
        return o;
    };

    // 添加队列
    addQueue = function( method, pathName, callBack ) {

        var indexName;
        if ( !pathName || !privateTools.isFunction( callBack ) ) return;

        indexName = method + "," + pathName;
        if ( !queue[ indexName ] ) {
            queue[ indexName ] = {
                guId: guId++,
                fn: [ callBack ]
            };
            return;
        }
        queue[ indexName ].fn.push( callBack );
    };

    // 匹配动态路由
    // @description 长帆动态路由修改判断条件, 循环遍历每一项, 有不同的一个目录则匹配不上
    // [project, a, b] == [project, a, c] => false
    matchRouteDynamic = function( indexPathArr, pathArr ) {
        var isPass = true;
        indexPathArr = indexPathArr.split( "/" );
        pathArr = pathArr.split( "/" );

        //if ( ( indexPathArr.length === pathArr.length ) && ( indexPathArr[0] === pathArr[0] ) && ( indexPathArr[1] === pathArr[1] )  && ( indexPathArr[2] === pathArr[2] )) isPass = true;
        for (let i = 0; i < indexPathArr.length; i++) {
            if (indexPathArr[i].indexOf(":") > -1) continue
            if (pathArr[i] !== indexPathArr[i]) {
                isPass = false
            }
        }

        //console.log( "isPass", isPass, indexPathArr, pathArr );
        return isPass;
    };

    // 精确匹配路由
    matchRoute = function( reqUrl, method ) {

        var i, arr, indexMethod, indexPathArr,
            fnArr = [], result = false,
            pathName = reqUrl.pathname,
            pathArr = pathName.substr( 1 );

        for ( i in queue ) {
            arr = i.split( "," );
            indexMethod = arr[0];
            indexPathArr = arr[1].substr( 1 );

            if ( indexPathArr.indexOf( ":" ) > -1 ) {
                result = matchRouteDynamic( indexPathArr, pathArr );
                if ( !result ) continue;
            } else {

                // 匹配路由名, 长度
                if ( indexPathArr !== pathArr ) continue;
                if ( indexPathArr.length !== pathArr.length  ) continue;
                //console.log(indexPathArr, pathArr)
            }

            //console.log( indexMethod, method, indexPathArr, pathArr );

            // 匹配请求类型, 是否全局
            if ( indexMethod === method || indexMethod === "GLOBAL" ) {
                fnArr = fnArr.concat( queue[ i ].fn );
            }
        }

        return fnArr;
    };

    init = function( req, res ) {

        var executeArr, that = this,
            i = 0, ii,
            oHeaders = req.headers,
            oUrl = url.parse( req.url ),
            method = req.method;

        //console.log('get',req.headers.accept)
        matchHeaders( oHeaders );
        executeArr = matchRoute( oUrl, method );

        // 404
        if ( !executeArr.length ) {
            ashesNode.use.trigger( "404", {
                notFound: "404",
                res: res,
                req: req,
                path: method + " " +oHeaders.host + oUrl.pathname
            });
            return;
        }

        // 执行匹配成功的路由, 并格式化req[ get, post]
        for ( ii = executeArr.length; i < ii; i++ ) {
            (function( request, response, m, n ) {

                oFormat[ m ]( request, function( formatReq ) {
                    executeArr[ n ]( formatReq, response );
                });
            })( req, res, method, i );
        }
    };

    getRoute = function( pName, fn ) {
        addQueue( "GET", pName, fn );
        return this;
    };

    postRoute = function( pName, fn ) {
        addQueue( "POST", pName, fn );
        return this;
    };

    putRoute = function( pName, fn ) {
        addQueue( "PUT", pName, fn );
        return this;
    };

    patchRoute = function( pName, fn ) {
        addQueue( "PATCH", pName, fn );
        return this;
    };

    deleteRoute = function( pName, fn ) {
        addQueue( "DELETE", pName, fn );
        return this;
    };

    globalRoute = function( pName, fn ) {
        addQueue( "GLOBAL", pName, fn );
        return this;
    };

    optionsRoute = function( pName, fn ) {
        addQueue( "OPTIONS", pName, fn );
        return this;
    };

    return {
        init: init,
        globalRoute: globalRoute,
        get: getRoute,
        post: postRoute,
        put: putRoute,
        patch: patchRoute,
        delete: deleteRoute,
        options: optionsRoute
    };
})();

// 中间件
ashesNode.use = (function() {

    var trigger, notFound, error, router, cookie,

        // 存储中间件对象
        useQueue = {};

    // 触发器
    trigger = function( indexName, options ) {
        options = options || {};
        useQueue[ indexName ]( options );
    };

    // 404
    notFound = function( callBack ) {
        if ( !privateTools.isFunction( callBack ) ) return;
        useQueue[ "404" ] = callBack;
        return this;
    };

    // 错误处理
    error = function( callBack ) {
        if ( !privateTools.isFunction( callBack ) ) return;
        useQueue[ "error" ] = callBack;
        return this;
    };

    // use agent route
    router = function( pathName, fn ) {
        ashesNode.Router.globalRoute( pathName, fn );
        return this;
    };

    // cookie
    cookie = function() {
        useQueue[ "useCookie" ] = true;
        return this;
    };

    return {
        useQueue: useQueue,
        trigger: trigger,
        notFound: notFound,
        error: error,
        router: router,
        cookie: cookie
    }
})();

// global set
ashesNode.set = function( name, value ) {
    privateTools.config[ name ] = value;
};

module.exports = ashesNode;
