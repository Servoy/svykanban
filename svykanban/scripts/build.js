var AdmZip = require('adm-zip');

// creating archives
var zip = new AdmZip();

zip.addLocalFolder("./META-INF/", "/META-INF/");
zip.addLocalFolder("./dist/servoy/svykanban/", "/dist/servoy/svykanban/");
zip.addLocalFolder("./board/", "/board/");

zip.writeZip("svykanban.zip");