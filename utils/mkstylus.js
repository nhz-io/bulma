var exec = require('child_process').exec;
var fs = require('fs');
var glob = require('glob');
var path = require('path');
var findRoot = require('find-project-root');

var ROOT_PATH = findRoot(process.env.PWD || __dirname);
var converter = path.resolve(ROOT_PATH, '/node_modules/sass2stylus/node_converter.rb');

var preparation = [
  'git checkout -f master',
  'git reset --hard',
  'git pull -f origin master',
  'git branch -D stylus',
  'git checkout -b stylus',
].join(' && ');

exec(preparation, function(error, stdout, stderr) {
  if(error) {
    console.log(stderr);
    process.exit(1);
  }

  glob(ROOT_PATH + "/**/*.sass", {}, function(error, files) {
    if(error) {
      console.log(error);
      process.exit(1);
    }
    for(var i=0;i<files.length;i++) {
      var sassFile = files[i];
      var stylusFile = sassFile.replace(/\.sass$/i, '.styl');
      exec('ruby ' + converter + ' ' + file, function(error, stdout, stderr) {
        if(error) {
          console.log(stderr);
          process.exit(1);
        }
        console.log('% convert ', sassFile, ' => ', stylusFile);
        fs.writeFileSync(stylusFile, stdout);
        console.log('% unlink ', sassFile);
        fs.unlinkFileSync(sassFile);
      });
    }
  });
});
