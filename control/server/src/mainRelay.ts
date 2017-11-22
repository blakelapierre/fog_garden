const Relay = (name, components) => t('Relay', {name, modules: components.map((c, i) => RelayModule(i + 1, c))});

const RelayModule = (index, component) => t('RelayModule', {index, component, status: 0});

const Light = (name, {pin} : {pin : number}) => t('Light', {name, pin});

const Fogger = (name, {pin} : {pin : number}) => t('Fogger', {name, pin});

const t = (type, data) => ({type, data});

const mainRelay =
  Relay('main', [
    Light('All-white', {pin: 29}),
    Light('Minifarm', {pin: 28}),
    Light('Hi-density', {pin: 27}),
    Light('Cloner', {pin: 25}),
    Fogger('Minifarm', {pin: 5})
  ]);

console.log(mainRelay);
// const mainRelay = {
//   components: [{
//     name: 'All-white light',
//     relay: 1,
//     pin: 29,
//     status: 0
//   },{
//     name: 'Minifarm light',
//     relay: 2,
//     pin: 28,
//     status: 0
//   },{
//     name: 'Hi density light',
//     relay: 3,
//     pin: 27,
//     status: 0
//   },{
//     name: 'Cloner light',
//     relay: 4,
//     pin: 25,
//     status: 0
//   },{
//     name: 'Minifarm fogger',
//     relay: 5,
//     pin: 5,
//     status: 0
//   }]
// };

export default mainRelay;

/*
                  CircuitComponent
                         |
                         |
                         |
                SwitchableComponent
                         |
                         |
                         |
                -------------------
                |                 |
              OnOff             Multi
                |                 |
          ------------            --------
          |          |            |      |
        Light      Fogger       Relay    ?


*/

// class CircuitComponent {
//   constructor (public name : string) {}
// }

// class Light extends CircuitComponent {

// }

// class Fogger extends CircuitComponent {

// }

// class Relay extends CircuitComponent {
//   constructor (public name : string, components : CircuitComponent[]) {}
// }