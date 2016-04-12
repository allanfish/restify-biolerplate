import 'babel-register'
import http from 'http'
import path from 'path'
import domain from 'domain'
import os from 'os'
import nconf from 'nconf'
import _ from 'lodash'
import bunyan from 'bunyan'
import restify from 'restify'
import {joiMiddleware} from './middlewares'

nconf.argv().env().file({
  file: path.join(__dirname, '../config/config.json')
});

const NAME = "BETA2.0";

const log = bunyan.createLogger({
  name: NAME,
  streams: [
    {
      level: (process.env.LOG_LEVEL || 'info'),
      stream: process.stderr
    },
    {
      level: (process.env.LOG_LEVEL || 'info'),
      path: '/tmp/logs/nodejs/beta.log'
    },
    {
      level: 'debug',
      type: 'raw',
      stream: new restify.bunyan.RequestCaptureStream({
        level: bunyan.WARN,
        maxRecords: 100,
        maxRequests: 1000,
        stream: process.stderr
      })
    }],
  serializers: restify.bunyan.serializers
});

const server = restify.createServer({
  log: log,
});
server.pre(restify.pre.sanitizePath());
server.use(restify.acceptParser(server.acceptable));
server.use(restify.authorizationParser());
server.use(restify.dateParser());
server.use(restify.queryParser({ mapParams: false }));
// server.use(restify.jsonp());
// server.use(restify.gzipResponse());
server.use(restify.bodyParser({
  maxBodySize: 300000000, // 300M
  mapParams: true,
  mapFiles: false,
  overrideParams: false,
  keepExtensions: false,
  uploadDir: os.tmpdir(),
  multiples: true,
  hash: 'sha1'
}));
// 设置响应的过期时间
// server.use(restify.requestExpiry({}));

// throttle非常耗性能, 应该通过nginx去处理
// server.use(restify.throttle({
//   burst: 100,
//   rate: 50,
//   ip: true,
//   overrides: {
//     '192.168.1.1': {
//       rate: 0,        // unlimited
//       burst: 0
//     }
//   }
// }));
server.use(restify.conditionalRequest());
server.use(joiMiddleware());
server.on('after', restify.auditLogger({
  log: bunyan.createLogger({
    name: 'audit',
    streams: [{
      stream: process.stdout
    }, {path: '/tmp/logs/nodejs/audit.log'}]
  })
}));

function sendV1(req, res, next) {
  res.send('hello: ' + req.params.name);
  return next();
}

function sendV2(req, res, next) {
  res.send({ hello: req.params.name });
  return next();
}

server.get({ path: '/hello/:name', version: '1.1.3' }, sendV1);
server.get({ path: '/hello/:name', version: '2.0.0' }, sendV2);

server.get('/hello', (req, res, next) => res.send(200, "hello world"))


server.get({ path: '/version/test', version: ['2.0.0', '2.1.0', '2.2.0'] }, function(req, res) {
  res.send(200, {
    requestedVersion: req.version(),
    matchedVersion: req.matchedVersion()
  });
});

server.get('/hello2', function(req, res, next) {
  // some internal unrecoverable error
  var err = new restify.errors.InternalServerError('oh noes!');
  return next(err);
});

server.on('InternalServer', function(req, res, err, cb) {
  err.body = 'something is wrong!';
  return cb();
});

server.listen((nconf.get('port') || 7000), () => {
  log.info(`listening at ${server.url}`);
});


export default server

