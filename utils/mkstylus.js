var exec = require('child_process').exec;
var fs = require('fs');
var glob = require('glob');
var path = require('path');
var findRoot = require('find-project-root');

var ROOT_PATH = findRoot(process.env.PWD || __dirname);
var sass2stylus = 'cd ' + path.resolve(ROOT_PATH, 'node_modules/sass2stylus');
var converter = path.resolve(ROOT_PATH, 'node_modules/sass2stylus/node_converter.rb');

var preparation = [
  'git checkout -f master',
  'git reset --hard',
  'git pull -f origin master',
  'git branch -D stylus',
  'git checkout -b stylus'
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

    var convert = function(files) {
      var sassFile = files.shift();
      if(sassFile) {
        var stylusFile = sassFile.replace(/\.sass$/i, '.styl');
        console.log('% convert ', sassFile, ' => ', stylusFile);
        exec(sass2stylus + ' && ruby node_converter.rb ' + sassFile, function(error, stdout, stderr) {
          if(error) {
            console.log(stderr);
            process.exit(1);
          }
          fs.writeFileSync(stylusFile, stdout);
          console.log('% unlink ', sassFile);
          fs.unlinkFileSync(sassFile);
          convert(files);
        });
      }
    }

    convert(files);
  });
});
