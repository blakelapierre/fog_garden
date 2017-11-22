const Relay = (name, components) => t('Relay', {name, modules: components.map((c, i) => RelayModule(i + 1, c))});

const RelayModule = (index, component) => t('RelayModule', {index, component, status: 0});

const Light = (name, {pin} : {pin : number}) => t('Light', {name, pin});

const Fogger = (name, {pin} : {pin : number}) => t('Fogger', {name, pin});

const t = (type, data) => Object.setPrototypeOf({type, data}, dataPrototype);

const dataPrototype = {get(property) { return this.data[property]; }, set(property, value) { return (this.data[property] = value); }};


export {Relay, Light, Fogger};