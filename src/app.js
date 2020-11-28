import _ from 'lodash';
import * as THREE from 'three';

import DioramaViewer from './DioramaViewer';

const MODE = {
  INIT : 'initializing',
  DIORAMA : 'diorama-mode',
  EDITOR : 'editor-mode'
};
let mode = MODE.INIT;

function init() {
  DioramaViewer.init();
  mode = MODE.DIORAMA;
  DioramaViewer.focus();
}

export default {init};