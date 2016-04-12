import {Router} from 'express'

var router = new Router() ; 

router.get('/hello', (req, res) => {
  res.json({
    msg: 'ok',
    status: 'ok' 
  });
});

export default router