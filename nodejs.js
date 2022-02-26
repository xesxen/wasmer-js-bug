const fs = require('fs');
const { WASI } = require('@wasmer/wasi');
const nodeBindings = require("@wasmer/wasi/lib/bindings/node")

const nextpnrFilePath = './static/nextpnr-ice40.wasm';
const dataBasePath = '/data';
const inputPath = '/input.json';
const pcfFilePath = '/upduino_v2.pcf';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Async function to run our WASI module/instance
const startWasiTask =
    async (pathToWasmFile, args) => {
        let wasmBytes = new Uint8Array(fs.readFileSync(pathToWasmFile)).buffer

        let wasi = new WASI({
            preopens: {
                '/tmp': './tmp',
                '/share': './share',
                [dataBasePath]: './static',
            },
            traceSyscalls: true,
            args: [
                pathToWasmFile,
                ...args,
            ],
            env: {},
            bindings: {
                ...(nodeBindings.default || nodeBindings),
                fs,
            }
        })

        // Instantiate the WebAssembly file
        let wasmModule = await WebAssembly.compile(wasmBytes);
        let instance = await WebAssembly.instantiate(wasmModule, {
            ...wasi.getImports(wasmModule)
        });

        try {
            wasi.start(instance);
        } catch (e) {
            if (!e.user && e.code !== 0) {
                console.error(e);
            }
        }
    }

startWasiTask(nextpnrFilePath, [
        '--up5k',
        '--package', 'sg48',
        '--asc', '/blinky.asc',
        '--pcf', dataBasePath + pcfFilePath,
        '--json', dataBasePath + inputPath,
    ])
    .then(_ => console.log('Done!'))
    .catch(y => console.log(y))

