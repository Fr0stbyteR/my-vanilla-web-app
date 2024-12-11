import './style.css'
import { init, initHandLandmarker } from './init.js'
import { appContent } from './app-content.js';

document.querySelector('#app').innerHTML = appContent;
document.querySelector('#play').addEventListener("click", init);
initHandLandmarker();
