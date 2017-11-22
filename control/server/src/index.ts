import * as http from 'http';

import * as koa from 'koa';
import * as Router from 'koa-trie-router';

const router = new Router();

import {Gpio} from 'onoff';

import mainRelay from './mainRelay';

// const minifarm = new Gpio(28, 'out');

const port = process.env.port || 9999,
      name = process.env.name || 'fog',
      pass = process.env.pass || 'garden';

const app = new koa();

router
  .get('/', async function (ctx) {
    ctx.body = 'test';
  })
  .get('/gpio/:pin', async function (ctx, next) {
    const {pin} = ctx.params,
          gpio = new Gpio(pin);

    ctx.body = gpio.readSync();
  })
  .put('/gpio/:pin/:value', async function (ctx, next) {
    const {pin, value} = ctx.params;

    if (value !== '0' && value !== '1') {
      ctx.status = 500;
      ctx.body = 'Invalid value';

      return;
    }

    ctx.body = value;
    // const gpio = new Gpio(pin, 'out');

    // gpio.writeSync(value === '0' ? 0 : 1);
  })
  .put('/relay/:number/:value', async function (ctx, next) {

    const {number, value} = ctx.params;

    if (value !== '0' && value !== '1') {
      ctx.status = 500;
      ctx.body = 'Invalid value';

      return;
    }

    const component = mainRelay.components[parseInt(number) - 1];

    if (component) {
      const gpio = new Gpio(component.pin, 'out');

      gpio.writeSync(parseInt(value));
    }

    ctx.body = component;
  });

app.use(router.middleware());

http.createServer(app.callback()).listen(port);
console.log('HTTP server listing on port', port);