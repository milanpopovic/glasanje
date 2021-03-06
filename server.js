// Potrebni Node moduli
var http = require("http");
var fs = require("fs");

// Keširanje statičkih fajlova
var json = JSON.parse(fs.readFileSync("opis-glasanja.json","utf8"));
var index = fs.readFileSync("index-tpl.html","utf8");
var stilovi = fs.readFileSync("glasanje.css","utf8");
var glasanjejs = fs.readFileSync("glasanje.js","utf8");
var icon = fs.readFileSync("favicon.ico");

// Rezultati glasanja
var glasovi={};

// IP adresa glasača
var poslednjaIP = "";

// Helper funkcija
function trim(s){ 
  return ( s || '' ).replace( /^\s+|\s+$/g, '' ); 
} 

// Priprema index fajla
function renderIndexTemplate() {
	index = index.replace('{{predmetGlasanja}}','<div id="predmetGlasanja">'+json.predmetGlasanja+'</div>')
	formaZaGlasanje = "<form>"
	for (i in json.formaZaGlasanje) {
		 formaZaGlasanje +='<div class="cb-tekst"><input type="checkbox"> '+json.formaZaGlasanje[i]+'</div>'
     glasovi[json.formaZaGlasanje[i]] = 0;
	}
	formaZaGlasanje+='<span id="dugme-za-glasanje">Glasaj</span>'
	index = index.replace('{{formaZaGlasanje}}', formaZaGlasanje)
  uputstva = json.uputstvo
  uputstvo='<div id="uputstvo">'
  for (i in uputstva){
    uputstvo += uputstva[i]+'<br>'
  }
  uputstvo += '</div>'
  index = index.replace('{{uputstvo}}',uputstvo)
}
renderIndexTemplate()
// Kreiranje servera
var server = http.createServer(function(request, response) {
     
        // Rutiranje zahteva
        switch(request.url) {
          
          case "/": 
        						response.writeHead(200, {"Content-Type": "text/html"});
                    response.end(index);
                    break;
          case "/glasanje.css":
                    response.writeHead(200, {"Content-Type": "text/css"});
                    response.end(stilovi);
                    break;
          case "/favicon.ico":
                    response.writeHead(200, {'Content-Type': 'image/gif' });
        						response.end(icon, 'binary');
                    break;
          case "/glasanje.js":
										response.writeHead(200, {"Content-Type": "text/plain"});
                    response.end(glasanjejs);
                    break;
          case "/glasanje":
                    ip = request.connection.remoteAddress
/*
        						if (ip === poslednjaIP) {
          					  response.end("Ne možete da glasate više puta")
          						return
        						}
*/
        						poslednjaIP = ip
                    var glas = ""
										request.on('data', function (data) {
												glas += data.toString('utf8');
										});
                    request.on('end', function () {                            
                        glas = trim(glas)
												glasovi[glas]=glasovi[glas]+1;
                        response.end("Glasanje prihvaceno: "+glas)	
										});	
                    break;
          case "/rezultat":
                    response.writeHead(200, {"Content-Type": "text/plain"});
                    response.end(JSON.stringify(glasovi));
                    break;
          default: break;
        }
});
var port = process.env.PORT || 8000;
console.log("Cekam zahteve na portu: 8000")
server.listen(port);
