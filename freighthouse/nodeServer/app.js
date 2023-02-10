let app = require("./ashesNode.js");
let config = require("./api/config");
let tools = require("./tools");

global.App = app;
global.Tools = tools;

process.on('uncaughtException', (err) => {
    console.error('=====================错误=====================');
    console.error(err.stack);
});

app.set("port", 7701);
app.set("staticResource", "publicView");
app.set("staticLimit", 1024 * 1024 * 10);
app.Server();

// 注册路由
for (let i = 0; i < config.length; i++) {
    if (config[i] === 'demo') continue;
    require('./bindRouter')(config[i]);
    // try {
    //     require( "./api/" + config[i] + "/controller.js" );
    // } catch (err) {}
}

// 中间件
app.use

    // 注册cookie
    .cookie()

    // 404
    .notFound((options) => {
        let err = new Error('Not Found');
        err.status = 404;
        err.path = options.path;
        options.res.send("json", err);
    })

    // 错误捕获
    .error((options) => {
        options.res.send("json", options);
    });
