/**
 * Altera a versão para SNAPSHOT antes do build
 */
const fs = require('fs');
const http = require('http');
const semver = require('semver');

var options = {
    hostname: 'registry.npmjs.org',
    port: 80,
    path: '/game-ecs',
    method: 'GET',
    headers: {
        'Accept': 'application/json'
    }
};

var req = http.request(options, function (res) {
    var json = '';
    res.setEncoding('utf8');
    res.on('data', function (data) {
        json += data;

    });

    res.on('end', function () {
        let info = JSON.parse(json);

        // No formato '0.1.0', '0.2.0'
        var release = '0.0.0';

        // No formato '0.1.0-pre.0', '0.1.0-pre.1', '0.1.0-pre.2'
        var snapshot = '0.0.0';
        var version = '';
        for (var v in info.versions) {
            if (semver.prerelease(v)) {
                // Pre-release
                if (semver.gt(v, snapshot)) {
                    snapshot = v;
                }
            } else if (semver.gt(v, release)) {
                release = v;
            }
        }

        // Se não possui snapshot da versão atual, zera para garantir o uso do preminor
        if (semver.gt(release, snapshot)) {
            snapshot = '0.0.0';
        }

        // Numero da nova versão SNAPHSOT (pre)
        // Se já possui um prerelease, apenas incrementa a versão do snapshot
        // Ex. Se existir '0.1.0-pre.0', a proxima será '0.1.0-pre.1'
        if (snapshot != '0.0.0') {
            version = semver.inc(snapshot, 'prerelease', 'pre');
        } else {
            version = semver.inc(release, 'preminor', 'pre');
        }

        console.log('Incrementing game-ecs version to: "' + version + '"');

        var packageJson = require('./package.json');

        packageJson.version = version;

        fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 4));
    });
});

req.on('error', function (e) {
    throw e;
});

req.end();
