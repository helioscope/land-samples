import app from './app.js';

document.body.onload = () => {
  console.log('document loaded!');
  app.init();
}