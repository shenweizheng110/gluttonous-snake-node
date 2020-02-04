import * as express from 'express';
import * as morgan from 'morgan';
import * as path from 'path';
import * as fs from 'fs';
import * as bodyParser from 'body-parser';
import * as expressWs from 'express-ws';
import * as cookieParser from 'cookie-parser';
import registerRouter from './router';
import sendHelper from './helper/sendHelper';

/* import * as session from 'express-session';
import * as connectRedis from 'connect-redis'; */

const appBase = express();

const logDirectory = path.join(__dirname, 'log');

const FileStreamRotator = require('file-stream-rotator');

// const RedisStore = connectRedis(session);

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const accessLogStream = FileStreamRotator.getStream({
    date_format: 'YYYYMMDD',  // eslint-disable-line
    filename: path.join(logDirectory, 'access-%DATE%.log'),
    frequency: 'daliy',
    verbose: false
});

// 引入 websocket
let wsInstance = expressWs(appBase);

let { app } = wsInstance;

// 跨域
app.all('*', function(req: any, res: any, next: any) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:6688');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    res.header('X-Powered-By', '3.2.1');
    res.header('Content-Type', 'application/json;charest=utf-8');
    next();
});

// 使用cookie-parser 不带签名的cookie解析
app.use(cookieParser());

// session 持久化
/* app.use(session({
    name: 'session_id',
    secret: 'test',
    store: new RedisStore({
        client
    }),
    saveUninitialized: false,
    resave: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 12
    }
})) */

// 路由过滤器 检测路由 检测是否未登录
/* app.use((req: any, res: any, next: any) => {
    let filter = /^\/api\/login/;
    if(!filter.test(req.url)){
        if(!req.session.user_id){
            return res.send(result(2, '未登录', null));
        }
    }
    next();
}) */

// morgan 日志中间件
app.use(morgan('combined', { stream: accessLogStream }));

// 解析 application/x-www-form-urlencoded格式
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(sendHelper);

// 解析 application/json
app.use(bodyParser.json());

// 处理文件传输
/* app.use(connectMultiparty()); */

// 注册路由
registerRouter(wsInstance);

// 设定端口
app.listen(3000);
