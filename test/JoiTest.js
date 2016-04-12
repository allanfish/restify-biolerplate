'use strict';
import test from 'ava'
import Joi from 'joi'
import middleware from '../middlewares/restify-joi-middleware'

test("validation errors on invalid input", t => {
  const req = {
    params: {
      id: 'this-is-a-string'
    },
    route: {
      validation: {
        params: {
          id: Joi.number().required()
        }
      }
    }
  };

  return middleware()(req, {send: t.fail}, err => {
    t.truthy(err, 'Returns and error');
    t.is(err.statusCode, 400, 'Error has a statusCode of 400');
  });
});

test("validation allows valid input", t => {
  const req = {
    params: {
      id: 1
    },
    route: {
      validation: {
        params: {
          id: Joi.number().required()
        }
      }
    }
  };

  return middleware()(req, {send: t.fail}, err => {
    t.falsy(err, 'No error should be returned');
  });
});

test("validation blocks missing input", t => {
  // notice there's no req.params
  const req = {
    route: {
      validation: {
        params: {
          id: Joi.number().required()
        }
      }
    }
  };

  return middleware()(req, {send: t.fail}, err => {
    t.truthy(err, 'Returns and error');
    t.is(err.statusCode, 400, 'Error has a statusCode of 400');
  });
});

test.cb("allows Joi.object().keys validations", t => {
  const req = {
    body: {
      id: 1
    },
    params: {
      id: 1
    },
    route: {
      validation: Joi.object().keys({
        params: {
          id: Joi.number().required()
        },
        body: {
          id: Joi.number().required()
        }
      }).assert('params.id', Joi.ref('body.id'))
    }
  };

  middleware()(req, {send: t.fail}, err => {
    t.falsy(err, 'No error should be returned');
    t.end();
  });
});

test("fails on bad input via Joi.object().keys validations", t => {
  const req = {
    body: {
      id: 1
    },
    params: {
      id: 2
    },
    route: {
      validation: Joi.object().keys({
        params: {
          id: Joi.number().required()
        },
        body: {
          id: Joi.number().required()
        }
      }).assert('params.id', Joi.ref('body.id'))
    }
  };

  return middleware()(req, {send: t.fail}, err => {
    t.truthy(err, 'Returns and error');
    t.is(err.statusCode, 400, 'Error has a statusCode of 400');
  });
});