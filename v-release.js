/**
 * Altera a versão para RELEASE antes do build
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

        var version = '';
        for (var v in info.versions) {
            if (semver.prerelease(v)) {
                continue;
            } else if (semver.gt(v, release)) {
                release = v;
            }
        }

        // Numero da nova versão SNAPHSOT (pre)
        var version = semver.inc(release, 'minor');
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
