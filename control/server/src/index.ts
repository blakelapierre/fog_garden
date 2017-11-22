import * as http from 'http';

import * as koa from 'koa';
import * as Router from 'koa-trie-router';

const router = new Router();

import {spawn, spawnSync} from 'child_process';

import mainRelay from './mainRelay';

const each = (structure, property, fn, scope = this) => structure.data[property].forEach(fn.bind(scope));
const map = (structure, property, fn, scope = this) => structure.data[property].map(({data}, i) => fn.call(scope, data, i));

const iter = (able, fn, scope = this) => able[fn].call(scope);

const readAndSetModuleStatus = relay => each(relay, 'modules', module => module.data.status = readPinSync(module.data.component.data.pin));

readAndSetModuleStatus(mainRelay);


const port = process.env.port || 9999,
      name = process.env.name || 'fog',
      pass = process.env.pass || 'garden';

const app = new koa();

router
  .get('/', async function (ctx) {
    readAndSetModuleStatus(mainRelay);

    console.log('current state:', mainRelay.data.modules);

    ctx.body =
`<!doctype html>
<html>
  <head>
    <title>Fog Garden</title>

    <style>
      body {
        margin: 0;
        padding: 0;

        height: 100vh;

        display: flex;

        flex-direction: column;
        justify-content: space-between;

        font-size: 2em;
      }

      relay-control {
        display: flex;
        flex: 1 1 auto;
      }

      relay-control button {
        flex: 1 1 auto;

        padding-left: 1rem;

        font-size: 2em;

        text-align: left;
      }

      relay-control button.off { background-color: #d00; }
      relay-control button.on { background-color: #0d0; }
    </style>
  </head>
  <body>${

    map(mainRelay, 'modules', ({
      index,
      component: {type, data: {name, pin}},
      status
    }) => `
    <relay-control>
      <button class="${status === 0 ? 'off' : 'on'}" onclick="toggle(${index}, ${1 - status})">${index} - ${type} - ${name} (${status === 0 ? 'off' : 'on'})</button>
    </relay-control>`).join('')
  }

    <script>
      function toggle(relayIndex, value) {
        var xhr = new XMLHttpRequest();

        xhr.open('PUT', '/relay/' + relayIndex + '/' + value);
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

    const module = mainRelay.data.modules[parseInt(number) - 1];

    if (module && module.data.component) {
      writePinSync(module.data.component.data.pin, parseInt(value));

      console.log('wrote', value, 'to', module.data.component.data.pin);
    }

    ctx.body = module;
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