import init, { myFunction } from './my_wasm_module.wasm';
// Wasmモジュールが初期化された後に、myFunction を呼び出すことができます。
init().then(() => {
  myFunction();
});