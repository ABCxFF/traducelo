#!/usr/bin/env node

const colores = require('colors/safe');
const fs = require('fs');
const path = require('path');
const {exec} = require('child_process');
const argv = process.argv.slice(2);

const { Parser } = require("acorn")

const mapaDeTraducción = new Map([
    ["por", "for"],
    ["mientras", "while"],
    ["haz", "do"],
    ["el", "let"],
    ["la", "let"],
    ["de", "of"],
    ["del", "of"],
    ["en", "in"],
    ["si", "if"],
    ["más", "else"],
    ["función", "function"],
    ["importa", "import"],
    ["exporta", "export"],
    ["nueva", "new"],
    ["nuevo", "new"],
    ["clase", "class"],
    ["extiende", "extends"],
    ["estático", "static"],
    ["estática", "static"],
    ["depurador", "debugger"],
    ["rompe", "break"],
    ["continúa", "continue"],
    ["regresa", "return"],
    ["tira", "throw"],
    ["aggara", "catch"],
    ["finalmente", "finally"],
    ["cambia", "switch"],
    ["asínc", "async"],
    ["espera", "await"],
    ["con", "with"],
    ["resto", "rest"],
    ["caso", "case"],
    ["elimina", "delete"],
    ["cierto", "true"],
    ["falso", "false"],
    ["nulo", "null"],
    ["padre", "super"],
    ["este", "this"],
    ["esta", "this"],
    // ["vacío", "void"],
    ["tipode", "typeof"],
    ["instanciade", "instanceof"],
    ["da", "yield"]
])
class Traductor extends Parser {
    readWord1(...b) {
        let pos = this.pos;
        let out = super.readWord1(...b);
        let endPos = this.pos;
        
        if (mapaDeTraducción.has(out)) {
            out = mapaDeTraducción.get(out);
            this.input = this.input.slice(0, pos) + out + this.input.slice(endPos);
            this.pos = endPos = pos + out.length;
        }
        return out;
    }

    finishNode(node, type) {
        if (type === 'Program') Traductor.producción = this.input
        return super.finishNode(node, type)
    }

    static traduce(input) {
        Traductor.parse(input, {ecmaVersion: 20})

        return Traductor.producción;
    }
}

function imprimePáginaAyuda() {
    console.log(colores.bold(`Uso de traducelo`));
    console.log(`traducelo <nombre del archivo> [--dir=_____]`);
}

if (!argv.length) {
    imprimePáginaAyuda();
} else MAIN: {
    const marcadores = new Map();
    const origen = process.cwd();

    let nombres = [];
    for (const argumento of argv) {
        if (argumento.startsWith('--')) {
            if (argumento.includes('=')) {
                const [arg, parem] = argumento.split('=')
                marcadores.set(arg, parem);
            } else {
                marcadores.set(argumento, true);
            }
        }
        else { // if (!archivo) {
            nombres.push(argumento);
        }
        // } else {
        //     console.log("Solo se permite un archivo");
        // }
    }

    nombres = new Set(nombres);

    // const imprime = marcadores.has('--imprime');
    const directerioProducción = marcadores.get("--dir") || null;
    const imprime = nombres.size === 1 && directerioProducción === null;
    if (!imprime && directerioProducción !== null) {
        console.log("Necesitas un --dir, cuando tienes más de uno argumento")
        break MAIN;
    }
    const vm = fs.readFileSync(path.join(__dirname, "./vm.js"), 'utf-8');

    for (const nombre of nombres) {
        const archivo = fs.readFileSync(path.resolve(origen, nombre), "utf8");
        const traducción = Traductor.traduce(archivo);
    
        const final = vm + traducción;
        if (imprime) console.log(final);
        else if (directerioProducción) {
            fs.writeFileSync(path.resolve(origen, directerioProducción, nombre), final);
        }
        // else {
        //     exec("node " + path.join(__dirname, './vm.js') + " " + nombreDelArchivo, (error, stdout, stderr) => {
        //         if (error) throw error;
        //         if (stdout) process.stdout.write(stdout);
        //         if (stdout) process.stdout.write(stderr);
        //     });
        // }
    }
}
