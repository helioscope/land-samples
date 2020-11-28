/*
goals: 
- less randomization code
- readable parameters
- simple addition & revision of parameters
- less repeated code (extending default params with provided params, handling seeds)
- simple interface, so can experiment without necessarily using MeshGenerator (still learning, so let's not paint ourselves into a corner)

should also:
- be flexible enough to handle customized randomization methods (`{randomizer: (propertyName, currentParams)=>{}}`?)
- be flexible enough to handle custom editor handling (`{type: 'custom', editorSetup: ()=>{}}`, ?)
- able to accept randomization params for different kinda of random variations (e.g. generate only younger-looking trees for new growth)
*/

import _ from 'lodash';
import * as THREE from 'three';

import {
  randomRangeFromArray,
  randomRangeIntFromArray,
  randomPickOne,
  getNewRandomSeed,
  setRandomSeed
} from './util';


function returnParameterValue(param, paramName, allParams) {
  return param.value;
}

function returnRandomRange(param, paramName, allParams) {
  return randomRangeFromArray(param.range);
}

function returnRandomRangeInt(param, paramName, allParams) {
  return randomRangeIntFromArray(param.range);
}

function returnRandomChoice(param, paramName, allParams) {
  return randomPickOne(param.options);
}

function returnRandomSeed(param, paramName, allParams) {
  return getNewRandomSeed();
}

export class MeshGenerator {
  constructor(options) {
    this.generatorParams = options.generatorParams;
    this.generatorFunction = options.generatorFunction;
  }

  getRandomizerFunction(param) {
    if (param.randomizerFunction) {
      return param.randomizer;
    } else if (param.options) {
      return returnRandomChoice;
    } else if (param.range) {
      if (param.type === 'int') {
        return returnRandomRangeInt;
      } else {
        return returnRandomRange;
      }
    } else if (param.type === 'seed') {
      return returnRandomSeed;
    } else if (param.value) {
      return returnParameterValue;
    }
    console.error("could not get randomizerFunction for parameter '" + paramName + "'. things might break", param);
    return undefined;
  }

  getRandomParams() {
    let paramsOut = {};
    _.each(this.generatorParams, (param, paramName) => {
      paramsOut[paramName] = this.getRandomizerFunction(param)(param, paramName, this.generatorParams); // todo: cache functions? revise how this works?
    });
    return paramsOut;
  }

  makeRandomMesh() {
    return this.makeMesh(this.getRandomParams());
  }

  makeMesh(generatorParams) {
    if (generatorParams.seed) {
      setRandomSeed(generatorParams.seed);
    }

    let mesh = this.generatorFunction(generatorParams);
    
    mesh.userData = {
      generator : this,
      params : _.cloneDeep(generatorParams)
    };

    return mesh;
  }

  prepEditorPanel(pane, params, updateHandler) {
    _.each(this.generatorParams, (param, paramName) => {
      if (param.hidden) {
        return;
      } else if (param.type == 'color') { 
        // we're often using a numeric format (e.g. 0xFF0000), which can mislead many of these gui libraries
        pane.addColor(params, paramName).onChange(updateHandler);
        // pane.addInput(params, paramName, {input: 'color'});
      } else if (param.type == 'range') { 
        let folder = pane.addFolder(paramName);
        folder.add(param.value, 0).name('min').onChange(updateHandler);
        folder.add(param.value, 1).name('max').onChange(updateHandler);
        folder.open();
      } else if (param.type == 'array:number') { 
        let folder = pane.addFolder(paramName);
        _.each(param.value, (val, index) => {
          folder.add(param.value, index).name(index.toString()).onChange(updateHandler);
        });
        folder.open();
      } else if (param.type == 'options:color') { 
        let folder = pane.addFolder(paramName);
        _.each(param.value, (val, index) => {
          folder.addColor(param.value, index).name(index.toString()).onChange(updateHandler);
        });
        folder.open();
      } else {
        // pane.addInput(params, paramName);
        pane.add(params, paramName).onChange(updateHandler);
      }
    });
  }
}