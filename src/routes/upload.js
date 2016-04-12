import {Router} from 'express'
import log from '../utils/log'
import fs from 'fs'
import Promise from 'bluebird'
import mkdirp from 'mkdirp'
import path from 'path'
import multer from 'multer'

Promise.promisifyAll(fs);
Promise.promisifyAll(mkdirp);

const uploads = multer({
  dest: __dirname + "/uploads",
  limits: {
    fileSize: 100000000
  },
  // onFileSizeLimit: function(file){
  //   //如果大于100M,删除它
  //   if(file.size > 100000000) {
  //       fs.unlink('./' + file.path) // delete the partially written file
  //   }

  // }
});

fs.existsAsync = Promise.promisify(function exists2(path, exists2callback) {
  fs.exists(path, function callbackWrapper(exists) { exists2callback(null, exists); });
});

var router = new Router(); 

router.post("/receiver/receiver2.php", uploads.single('file'), (req, res) => {
  log.debug("=======================");
  log.debug("req.body", req.body.to);
  log.debug("req.file", req.file.path);

  let to = req.body && req.body.to,
    tmpfile = req.file && req.file.path;

  if (!to || !tmpfile) {
    return res.status(500).json({ "error": "request body must have to property and file object" });
  }

  fs.existsAsync(to).then((exists) => {
    log.debug("file exists: ", to, ", exists: ", exists);
    if (exists) {
      return fs.unlinkAsync(to);
    } else {
      return mkdirp.mkdirpAsync(path.dirname(to));
    }
  }).then(() => fs.renameAsync(tmpfile, to))
    .then(() => res.status(200).send('0'))
    .catch(err => {
      log.error(err.stack, err.message);
      return res.status(500).send("mkdirp fail: " + to)
    });
});


export default router 