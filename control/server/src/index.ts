import * as http from 'http';

import * as koa from 'koa';
import * as Router from 'koa-trie-router';

const router = new Router();

import {spawn, spawnSync} from 'child_process';

import mainRelay from './mainRelay';

mainRelay.components.forEach(component => component.status = readPinSync(component.pin));

const port = process.env.port || 9999,
      name = process.env.name || 'fog',
      pass = process.env.pass || 'garden';

const app = new koa();

router
  .get('/', async function (ctx) {
    mainRelay.components.forEach(component => component.status = readPinSync(component.pin));
    console.log(mainRelay.components);

    ctx.body =
`<!doctype html>
<html>
  <head>
    <title>Fog Garden</title>
  </head>
  <body style="margin: 0; padding: 0; height: 100vh; display: flex; flex-direction: column; justify-content: space-between; font-size: 2em;">
  ${mainRelay.components.map(({name, relay, pin, status}) => `<relay-control style="display: flex; flex: 1 1 auto;"><button style="flex: 1 1 auto; padding-left: 1rem; font-size: 2em; text-align: left; background-color: ${status === 0 ? '#d00' : '#0d0'}" onclick="toggle(${relay}, ${1 - status})">${relay} - ${name} (${status === 0 ? 'off' : 'on'})</button></relay-control>`).join('\n')}

    <script>
      function toggle(relay, value) {
        var xhr = new XMLHttpRequest();

        xhr.open('PUT', '/relay/' + relay + '/' + value);
        xhr.send();

        window.location.reload();
      }
    </script>
  </body>
</html>
`;
  })

  .get('/gpio/:pin', async function (ctx, next) {
    const {pin} = ctx.params,
          value = readPinSync(parseInt(pin));

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

    writePinSync(parseInt(pin), parseInt(value));

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
      writePinSync(component.pin, parseInt(value));

      console.log('wrote', value, 'to', component.pin);
    }

    ctx.body = component;
  })
  .get('/relay', async function(ctx) {
    ctx.body = mainRelay;
  });

app.use(router.middleware());

http.createServer(app.callback()).listen(port);
console.log('HTTP server listing on port', port);


function readPinSync(pin : number) : number {
  return parseInt(spawnSync(`gpio read ${pin}`, {shell: true}).output[1].toString().replace(/\n$/, ''));
}

function writePinSync(pin : number, value : number) {
  return spawnSync(`gpio write ${pin} ${value}`, {shell: true}).output[1].toString().replace(/\n$/, '');
}