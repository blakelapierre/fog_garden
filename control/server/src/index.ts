import * as http from 'http';

import * as koa from 'koa';
import * as Router from 'koa-trie-router';

const router = new Router();

import * as wpi from 'wiring-pi';

import mainRelay from './mainRelay';

// const minifarm = new Gpio(28, 'out');

const port = process.env.port || 9999,
      name = process.env.name || 'fog',
      pass = process.env.pass || 'garden';

wpi.setup('wpi');

const app = new koa();

router
  .get('/', async function (ctx) {
    ctx.body = 'test';
  })
  .get('/gpio/:pin', async function (ctx, next) {
    const {pin} = ctx.params,
          value = wpi.digitalRead(parseInt(pin));

    ctx.body = value;

    console.log('checked', pin, 'value was', value);
  })
  .put('/gpio/:pin/:value', async function (ctx, next) {
    const {pin, value} = ctx.params;

    if (value !== '0' && value !== '1') {
      ctx.status = 500;
      ctx.body = 'Invalid value';

      return;
    }

    ctx.body = value;

    wpi.digitalWrite(parseInt(pin), parseInt(value));

    console.log('set', pin, 'value was', value);
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
      wpi.digitalWrite(parseInt(pin), parseValue(value));

      console.log('wrote', value, 'to', component.pin);
    }

    ctx.body = component;
  });

app.use(router.middleware());

http.createServer(app.callback()).listen(port);
console.log('HTTP server listing on port', port);