import _ from 'lodash';

import DioramaViewer from './DioramaViewer';
import GeneratedMeshEditor from './GeneratedMeshEditor';
import { DeadTreeMaker } from './treeMaker';

const MODE = {
  INIT : 'initializing',
  DIORAMA : 'diorama-mode',
  EDITOR : 'editor-mode'
};
let mode = MODE.INIT;

function init() {
  // DioramaViewer.init();
  // mode = MODE.DIORAMA;
  // DioramaViewer.focus();
  GeneratedMeshEditor.init();
  GeneratedMeshEditor.openEditorForGenerator(DeadTreeMaker);
}

export default {init};