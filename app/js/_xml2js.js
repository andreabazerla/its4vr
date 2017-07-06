var fs = require('fs'),
  xml2js = require('xml2js');

var parser = new xml2js.Parser();

fs.readFile('./app/xml/verona.xml', function (err, data) {

  parser.parseString(data, function (err, result) {

    fs.writeFile('app/json/verona.json', JSON.stringify(result, null, '\t'), (err) => {
      if (err) throw err;
    });
  });
});
