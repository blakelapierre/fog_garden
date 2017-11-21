import { h, render } from 'preact-cycle';

const ADD_TO_MIX = ({
  items,
  itemMap,
  plantIndex,
  plants
}) => {
  if (itemMap[plantIndex]) return;

  const plant = plants[plantIndex],
        item = {plant, amount: 100};

  console.log('plant', plant, plantIndex); 
  items.push(item);
  
  itemMap[plantIndex] = item;
};

const CHANGE_AMOUNT = ({items}, item, {target:{value}}) => {
  item.amount = parseInt(value);
};

const fromEvent = (prev, {target:{value}}) => value;

const MakeAMix = ({items, amount}) => (
  // jshint ignore:start
  <make-a-mix>
    <CurrentMix items={items} />
    <MixInput amount={amount} />
  </make-a-mix>
  // jshint ignore:end
);

const CurrentMix = ({items}) => (
  // jshint ignore:start
  <current-mix>
    {items.map(item => <Item item={item} />)}
  </current-mix>
  // jshint ignore:end
);

const Item = ({item}, {mutation}) => (
  // jshint ignore:start
  <item>
    <plant>
      <name>{item.plant[0]}</name>
      {
        item.plant[1] ?
                        <varieties>
                          {item.plant[1].map(plant => <span>{plant}</span>)}
                        </varieties>
                      :
                        undefined
      }
    </plant>
    <Range value={item.amount} onInput={mutation(CHANGE_AMOUNT, item)} />
  </item>
  // jshint ignore:end
);

const MixInput = ({amount}, {seedTypes, mutation}) => (
  // jshint ignore:start
  <mix-input>
    <SeedTypeSelect seedTypes={seedTypes} onInput={mutation('plantIndex', fromEvent)} />
    <button onClick={mutation(ADD_TO_MIX)}>Add To Mix</button>
  </mix-input>
  // jshint ignore:end
);

const SeedTypeSelect = ({seedTypes, value, ...props}) => (
  // jshint ignore:start
  <select {...props}>
    {seedTypes.map(({id, name}) => id === value ? <option selected="selected" value={value}>{name}</option>
                                                : <option value={id}>{name}</option>)}
  </select>
  // jshint ignore:end
);

const Range = ({value, onInput, step, min, max}) => (
  // jshint ignore:start
  <input type="range" step={step || 1} min={min || 1} max={max || 100} onInput={onInput} value={value} />
  // jshint ignore:end
);

const plants = [
  ['Mint'],
  ['Beet', ['Detroit Dark Red']],
  ['Radish', ['China Rose']],
  ['Clover', ['Red']],
  ['Kale', ['Red Russian', 'Vates Blue Scotch Curled']],
  ['Sunflower', ['Blackoil']],
  ['Pea', ['Dun', 'Speckled']],
  ['Radish', ['Sango Purple', 'Rambo', 'Triton Purple']],
  ['Cilantro'],
  ['Amaranth', ['Red Garnet']],
  ['Basil', ['Dark Opal', 'Genovese', 'Thai']],
  ['Parsley', ['Dark Green Italian Flat-Leaf']],
  ['Cauliflower', ['Snowball Y Improved']],
  ['Turnip', ['Purple Top White']],
  ['Cabbage', ['Red Acre', 'Golden Acre', 'Mammoth Red Rock']],
  ['Swiss Chard', ['Rainbow Mixture', 'Ruby Red']],
  ['Celery', ['Utah 52-70']],
  ['Brussels Sprouts', ['Long Island Improved']],
  ['Mustard', ['Mizuna Red Leaf', 'Osaka Purple', 'Mizuna', 'Tokyo Bekana']],
  ['Kholrabi', ['Purple Vienna']],
  ['Chives'],
  ['Cress', ['Curled']],
  ['Buckwheat'],
  ['Lettuce', ['Waldmann\'s Green']],
  ['Leek', ['Large American Flag']],
  ['Fennel', ['Florence']],
  ['Sorrel', ['Large Leaf']]
].sort(([aPlant], [bPlant]) => aPlant.localeCompare(bPlant));

const seedTypes = plants.reduce((_, [name, varieties = []]) => {
  
  if (varieties.length > 0) 
    varieties.forEach(variety => _.push({id: _.length, name: `${name} - ${variety}`}));
  else 
    _.push({
      id: _.length,
      name
    });

  return _;
}, []);

console.log(seedTypes);

const plantMap = plants.reduce((map, [plant, varieties], index) => {
  map[plant] = index;
  return map;
}, {});

const renderMakeAMix = 
  () => render(
    // jshint ignore:start
    MakeAMix, {
      items: [],
      itemMap: {},
      plantIndex: 0,
      amount: 100,
      plants,
      seedTypes,
      plantMap,
    }, document.body
    // jshint ignore:end
  );

const ADD_TRAY = ({seedTypes, trays}, tray) => {
  trays.push((tray = {mats:[], configuration: {matSize: {width: 4, height: 4}, width: 1, length: 2}}));

  const mats = tray.configuration.width * tray.configuration.length;

  for (let i = 0; i < mats; i++) 
    tray.mats.push({seedType: seedTypes[0], seedMass: 5});
};


const ADD_MAT = (_, mat) => {
  _.mats.push((mat = {name: '', seedType: _.seedTypes[0], seedMass: 5}));
  SELECT_MAT(_, mat); 
};

const SELECT_TRAY = (_, tray) => {
  _.editors.trays.tray = tray;

  Object.assign(_.editors.trays, tray);

  // _.editors

  console.log('editor', _.editors, tray);
};

const SAVE_MAT = ({editor: {mat, name, seedType, seedMass}}) => {
  mat.name = name;
  mat.seedType = seedType;
  mat.seedMass = seedMass;
};

const SELECT_MAT = (_, mat) => {
  _.editors.mats.mat = mat;

  Object.assign(_.editors.mats, mat);

  // _.editors

  console.log('editor', _.editors, mat);
};

const SET_MATS_EDITOR_NAME = ({editors: {mats: editor}}, event) => {editor.name = fromEvent(undefined, event);};
const SET_MATS_EDITOR_SEED_TYPE = ({editors: {mats: editor}, seedTypes}, event) => {
  const id = fromEvent(undefined, event);
  editor.seedType = seedTypes[id];
};
const SET_MATS_EDITOR_SEEDMASS = ({editors: {mats: editor}}, event) => {editor.seedMass = fromEvent(undefined, event);};

const EDIT_MATS_NEW_SEED_TYPE = ({editors: {mats: editor}}) => {
  editor.newSeedType = {name: '', variety: ''};
};

const EDIT_MATS_SEED_TYPE_NAME = ({editors: {mats: editor}}, event) => {
  editor.newSeedType.name = fromEvent(undefined, event);
  console.log(editor);
};

const MATS_ADD_SEED_TYPE = ({editors: {mats: editor}, seedTypes}) => {
  let seedType;
  seedTypes.push(seedType = Object.assign({id: seedTypes.length}, editor.newSeedType));
  delete editor.newSeedType;
  editor.seedType = seedTypes[seedType.id]; // SET_MATS_EDITOR_SEED_TYPE
};

const MakeTrays = ({trays, editors: {trays: editor}}, {mutation}) => (
  // jshint ignore:start
  <make-trays>
    {console.log(trays)}
    <Trays trays={trays} />
    <button onClick={mutation(ADD_TRAY)}>New Tray</button>
    {editor.tray ? <Editor editor={editor} />
                : undefined}
  </make-trays>
  // jshint ignore:end
);

const Trays = ({trays}, {editors: {trays: editor}}) => (
  // jshint ignore:start
  <trays>
    {
      trays.map(tray => 
        tray === editor.tray ? <Tray className={{'selected': true}} tray={tray} />
                             : <Tray tray={tray} />)
    }
  </trays>
// jshint ignore:end
);

const Tray = ({tray, ...props}, {mutation}) => (
  // jshint ignore:start
  <tray onClick={mutation(SELECT_TRAY, tray)} {...props}>
    
  </tray>
  // jshint ignore:end
);

const MakeMats = ({mats, editors: {mats: editor}}, {mutation}) => (
  // jshint ignore:start
  <make-mats>
    {console.log(mats)}
    <Mats mats={mats} />
    <button onClick={mutation(ADD_MAT)}>New Mat</button>
    {editor.mat ? <Editor editor={editor} />
                : undefined}
  </make-mats>
  // jshint ignore:end
);

const Mats = ({mats}, {editors: {mats: editor}}) => (
  // jshint ignore:start
  <mats>
    {mats.map(mat => mat === editor.mat ? <Mat className={{'selected': true}} mat={mat} />
                                        : <Mat mat={mat} />)}
  </mats>
  // jshint ignore:end
);

const Mat = ({mat, ...props}, {mutation}) => (
  // jshint ignore:start
  <mat onClick={mutation(SELECT_MAT, mat)} {...props}>
    <div class="name">{mat.name}</div>
    <div class="seed-type">{mat.seedType.name}</div>
    <div class="seed-mass">{mat.seedMass} (g)</div>
  </mat>
  // jshint ignore:end
);

const Editor = ({editor: {mat, name, seedMass, seedType, newSeedType}}, {seedTypes, mutation}) => (
  // jshint ignore:start
  <editor>
    <table>
      <tbody>
        <tr>
          <td>Name:</td>
          <td><input type="text" value={name} onInput={mutation(SET_MATS_EDITOR_NAME)} /></td>
        </tr>
        <tr>
          <td>Seed Type:</td>
          <td>
            {
              newSeedType ? <NewSeedType newSeedType={newSeedType} />
                          : <div>
                              <SeedTypeSelect seedTypes={seedTypes} onInput={mutation(SET_MATS_EDITOR_SEED_TYPE)} value={seedType.id}/>
                              <button title="New Seed Type" onClick={mutation(EDIT_MATS_NEW_SEED_TYPE)}>+</button>
                            </div>
            }
          </td>
        </tr>
        <tr>
          <td>Seed Mass (g):</td>
          <td><input type="number" min={1} max={100} value={5} step={0.1} value={seedMass} onInput={mutation(SET_MATS_EDITOR_SEEDMASS)} /></td>
        </tr>
      </tbody>
    </table>
    <button onClick={mutation(SAVE_MAT)}>Save</button>
  </editor>
  // jshint ignore:end
);

const NewSeedType = ({newSeedType: {name}}, {mutation}) => (
  // jshint ignore:start
  <new-seed-type>
    <input autoFocus type="text" onInput={mutation(EDIT_MATS_SEED_TYPE_NAME)} value={name} />

    <button onClick={mutation(MATS_ADD_SEED_TYPE)}>Add</button>
  </new-seed-type>
  // jshint ignore:end
);

// <tr>
// <td>Sowed At:</td>
// <td><input type="date" valueAsDate={new Date()} /><input type="time" valueAsDate={new Date()} /></td>
// </tr>

const renderMakeMats = 
  () => render(
    // jshint ignore:start
    MakeTrays, {
      mats: [],
      trays: [],
      editors: {
        mats: {},
        trays: {}
      },
      seedTypes
    }, document.body
    // jshint ignore:end
  );

renderMakeMats();
renderMakeAMix();