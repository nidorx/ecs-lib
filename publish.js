/**
 * Faz o build publicação no repositorio e tag do github.
 *
 * O versionamento do package.json não é feito automaticamente, afim de permitir um maior controle sobre o deploy.
 *
 * Os passos para usar esses script são:
 *
 * 1 - Após fazer alterações de código, conduzir normalmente com os commits no git
 * 2 - No momento de fazer a publicação de uma versão, no terminal:
 *    a) git add --all
 *    b) git commit -m "Mensagem das alterações feitas"
 *    c) node ./publish.js
 */

const fs = require('fs');
const cpExec = require('child_process').exec;

function exec(command, callback) {
    callback = callback || function () {
    };

    return new Promise(function (accept, reject) {
        console.log('[' + command + ']');
        const com = cpExec(command);

        com.stdout.on('data', function (data) {
            console.log(data.toString());
        });

        com.stderr.on('data', function (data) {
            console.error(data.toString());
        });

        com.on('exit', function (code, signal) {
            if (signal) {
                reject({
                    code: code,
                    signal: signal
                });
                callback(code);
            } else {
                accept({
                    code: code,
                    signal: signal
                });
                callback(null, signal);
            }
        });
    });
}

if (fs.existsSync('./index.js')) {
    fs.unlinkSync('./index.js');
}

if (fs.existsSync('./index.d.ts')) {
    fs.unlinkSync('./index.d.ts');
}

var package = JSON.parse(fs.readFileSync(__dirname + '/package.json'));

exec('npm run-script build')
    .then(exec.bind(undefined, 'npm publish', null))
    .then(exec.bind(undefined, 'git add --all', null))
    .then(exec.bind(undefined, 'git commit -m "Publicação da versão v' + package.version + '"', null))
    .then(exec.bind(undefined, 'git push', null))
    .then(exec.bind(undefined, 'git tag v' + package.version, null))
    .then(exec.bind(undefined, 'git push --tags', null))
    .catch(err => {
        console.error(err);
    });
