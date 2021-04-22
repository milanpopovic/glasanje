import http.server, os, json, pickle
BaseHandler = http.server.BaseHTTPRequestHandler

# Globalne vrijable i keširani fajlovi

glasovi = {}
korisceneIP = []

indexTemplejt = open("index-tpl.html","r").read();
opisGlasanja = json.loads(open("opis-glasanja.json","r").read());
css = open("glasanje.css","r").read();
js = open("glasanje.js","r").read();
icon = open("favicon.ico","rb").read()

def renderujTemplejt(templejt, opis):
    templejt = templejt.replace('{{predmetGlasanja}}','<div id="predmetGlasanja">'+opisGlasanja['predmetGlasanja']+'</div>')
    formaZaGlasanje = "<form>"
    for o in opisGlasanja['formaZaGlasanje']:
        formaZaGlasanje +='<div class="cb-tekst"><input type="checkbox"> '+o+'</div>'
        glasovi[o] = 0;
    templejt = templejt.replace('{{formaZaGlasanje}}', formaZaGlasanje + '<span id="dugme-za-glasanje">Glasaj</span>')
    uputstva = opisGlasanja['uputstvo']
    uputstvo='<div id="uputstvo">'
    for u in uputstva:
        uputstvo += u +'<br>'
    uputstvo += '</div>'
    templejt = templejt.replace('{{uputstvo}}',uputstvo)
    return templejt

index = renderujTemplejt(indexTemplejt, opisGlasanja)

class Handler(BaseHandler):
        
    def _set_headers(self, type):
        self.send_response(200)
        self.send_header('Content-type', type)
        self.end_headers()
        
    def do_GET(self):
        global glasovi, index, glasanjejs, stilovi
        if self.path == "/":
            self._set_headers("text/html")
            self.wfile.write(str.encode(index))
        elif self.path == "/glasanje.js":
            self._set_headers("text/plain")
            self.wfile.write(str.encode(js))
        elif self.path == "/glasanje.css":
            self._set_headers("text/css")
            self.wfile.write(str.encode(css))
        elif self.path == "/favicon.ico":
            self._set_headers("image/ico")
            self.wfile.write(icon)
        elif self.path == "/rezultat":
            self._set_headers("text/plain")
            self.wfile.write(str.encode(str(glasovi).replace("'",'"')))
            
    def do_POST(self):
        global glasovi, korisceniIP
        if self.path == "/glasanje":
            ip = self.client_address[0]
            if ip in korisceneIP:
                self._set_headers("text/plain")
                self.wfile.write(str.encode(str("Ne možete glasati više puta")))
                return
            korisceneIP.append(ip)
            duzina_sadrzaja = int(self.headers['Content-Length'])
            izabran = self.rfile.read(duzina_sadrzaja).decode("utf-8").strip()
            glasovi[izabran] +=1
            self._set_headers("text/plain")
            self.wfile.write(str.encode("Glasanje prihvaćeno"))
        
try:
    port = int(os.environ["PORT"])
    httpd = http.server.HTTPServer(('0.0.0.0',port), Handler)
    #port = 8888
    #httpd = http.server.HTTPServer(('',port), Handler)
    print("Server startovan...port:",port)
    httpd.serve_forever()
except:
    print("Server stopiran")
