var fs = require('fs'),
  xml2js = require('xml2js');

var parser = new xml2js.Parser();

// const href = window.location.href;
// const url = new URL(href);
// const test = url.searchParams.get('test');
//
// let path = null;
//
// switch (test) {
//   case '1':
//     path = './app/xml/test-0.xml';
//     break;
//   default:
//
// }

fs.readFile('./app/xml/test-5.xml', function (err, data) {

  parser.parseString(data, function (err, result) {

    fs.writeFile('app/json/test-5.json', JSON.stringify(result, null, '\t'), (err) => {
      if (err) throw err;
    });
  });
});
