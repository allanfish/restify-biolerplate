import fs from 'fs'
import path from 'path'
import request from 'request'

describe('upload test', function () {

  it('upload', async (done) => {

    request.post({
      url: 'http://127.0.0.1:3000/qm/upload',
      formData: {
        path: '/home/admin/allanyu',
        zip_file: fs.createReadStream(path.join(__dirname, './allinone.zip'))
      }
    })
  });
});