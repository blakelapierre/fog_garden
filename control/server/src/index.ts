import * as http from 'http';

import * as koa from 'koa';
import * as Router from 'koa-trie-router';

const router = new Router();

import {spawn, spawnSync} from 'child_process';

import mainRelay from './mainRelay';

mainRelay.components.forEach(component => component.status = parseInt(readSync(component.pin)));

// const minifarm = new Gpio(28, 'out');

const port = process.env.port || 9999,
      name = process.env.name || 'fog',
      pass = process.env.pass || 'garden';

const app = new koa();

router
  .get('/', async function (ctx) {
    mainRelay.components.forEach(component => console.log(readSync(component.pin)));
    mainRelay.components.forEach(component => component.status = parseInt(readSync(component.pin)));
    console.log(mainRelay.components);

    ctx.body =
`<!doctype html>
<html>
  <head>
    <title>Fog Garden</title>
  </head>
  <body>
    ${mainRelay.components.map(({name, relay, pin, status}) => `<button onclick="toggle(${relay}, ${1 - status})">${relay} - ${name} (${status === 0 ? 'off' : 'on'})</button>`).join('\n')}

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
          value = readSync(parseInt(pin));

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

    writeSync(parseInt(pin), parseInt(value));

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
      writeSync(component.pin, parseInt(value));

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


function readSync(pin : number) {
  return spawnSync(`gpio read ${pin}`, {shell: true}).output[1].toString().replace(/\n$/, '');
}

function writeSync(pin : number, value : number) {
  return spawnSync(`gpio write ${pin} ${value}`, {shell: true}).output[1].toString().replace(/\n$/, '');
}