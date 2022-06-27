var gulp = require( 'gulp' );
var fontSpider = require( 'gulp-font-spider' );
var template = require('gulp-template');
var tap = require('gulp-tap');
var rename = require('gulp-rename');

function textToUnicode(text) {
  var temp = text.charCodeAt(0).toString(16).toUpperCase();
  if (temp.length > 2) {
    return temp;
  }
  return text;
}

function unicodeToChar(text) {
  return text.replace(/\\u[\dA-F]{4}/gi,
    function(match) {
      return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
    });
}

// 4E00 - 9FFF   19968 - 40959
// 3400 - 4DBF   13312 - 19903
// 20000 - 2A6DF 131072 - 173791
// 2A700 - 2B73F 173824 - 177983
// 2B740 - 2B81F 177984 - 178207
// 2B820 - 2CEAF 178208 - 183983
// F900 - FAFF   63744 - 64255
// 2F800 - 2FA1F 194560 - 195103

// var start = 63744;
// var end = 64255;

// var start = 65281;
// var end = 65295;

var start = 19968;
var end = 40959;

gulp.task('creatHtml', function () {
  for (var i = start; i <= end; i++) {
    (function (i) {
      var text = unicodeToChar('\\u' + parseInt(i, 10).toString(16));
      var unicode = textToUnicode(text);
      var index = i - start;

      setTimeout(function() {
        console.log(unicode);
        gulp.src('./template.html')
          .pipe(template({
            text: text,
            unicode: unicode
          }))
          .pipe(rename(unicode + '.html'))
          .pipe(gulp.dest('./pages/'));

        gulp.src('./style.html')
          .pipe(template({
            unicode: unicode
          }))
          .pipe(rename('KangxiDictU' + unicode + '.css'))
          .pipe(gulp.dest('./css/KangxiDict'));
      }, index * 20, text, unicode);
    })(i);
  }
});

gulp.task('fontSpider', function() {
  for (var i = start; i <= end; i++) {
    (function (i) {
      var text = unicodeToChar('\\u' + parseInt(i, 10).toString(16));
      var unicode = textToUnicode(text);
      var index = i - start;

      setTimeout(function() {
        console.log('Char index : ' + i);
        console.log('Char unicode : ' + unicode);
        Promise.all([
          new Promise(function(resolve, reject) {
            gulp.src('./font/*.ttf').pipe(rename('KangxiDictU' + unicode + '.ttf'))
              .on('error', reject)
              .pipe(gulp.dest('./css/font/'))
              .on('end', resolve)
          }),
          new Promise(function(resolve, reject) {
            gulp.src('./font/*.woff').pipe(rename('KangxiDictU' + unicode + '.woff'))
              .on('error', reject)
              .pipe(gulp.dest('./css/font/'))
              .on('end', resolve)
          })
        ]).then(function () {
          gulp.src('./pages/' + unicode + '.html')
            .pipe(fontSpider({
              backup: false,
              resourceCache: false
            }));
        });
      }, index * 2000, text, unicode, i);
    })(i);
  }
});


gulp.task('page', ['creatHtml']);
gulp.task('font', ['fontSpider']);
