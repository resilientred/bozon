var bozon = require('../lib/bozon');
var path = require('path');
var childProcess = require('child_process');

var env = bozon.utils.argument('env') || 'production';

var settings = bozon.utils.settings();

var spawnSync = function(command, options) {
  childProcess.spawnSync(command, options, {
    shell: true,
    stdio: 'inherit'
  });
};

var packager = function() {
  return path.join('.', 'node_modules', '.bin', 'electron-packager');
}

var iconPath = function(os) {
  return settings.packaging.platformResources[os].icon;
}

var testOptions = function() {
  return [
    './builds/test',
    settings.name,
    "--platform=" + process.platform,
    "--arch=" + process.arch,
    "--out=.tmp",
    "--icon=" + iconPath(process.platform),
    "--overwrite"
  ];
};

var productionOptions = function(os, arch) {
  var args = [
    bozon.utils.buildSource(env, os),
    settings.name,
    "--platform=" + os,
    "--arch=" + arch,
    "--out=" + bozon.utils.release(env),
    "--icon=" + iconPath(os)
  ];
  if (settings.packaging.overwrite) {
    args.push('--overwrite');
  }
  if (settings.packaging.archive) {
    args.push('--asar');
  }
  return args;
};

bozon.task('package', function() {
  var platforms = settings.packaging.platforms;
  for (i = 0; i < platforms.length; i++) {
    var os = platforms[i].split('-')[0];
    var arch = platforms[i].split('-')[1];
    spawnSync('gulp', ['compile', "--env=" + env, "--platform=" + os])
    spawnSync(packager(), productionOptions(os, arch))
  }
});

bozon.task('package:test', ['build:test'], function() {
  spawnSync(packager(), testOptions())
});
