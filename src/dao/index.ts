const NodeBatis = require('nodebatis');
const path = require('path');
const config = require(`../conf/conf.${process.env.NODE_ENV === 'development' ? 'dev' : 'prod'}.ts`);

const nodebatis = new NodeBatis(path.resolve(__dirname, './models'), {
    dialect: 'mysql',
    debug: config.db.debug,
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.pwd,
    camelCase: true,
    pool: {
        minSize: 5,
        maxSize: 20,
        acquireIncrement: 5
    }
});

export default nodebatis;
