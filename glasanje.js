window.onload = function(){
  document.getElementById('dugme-za-glasanje').addEventListener('click',glasaj)
  document.getElementById('dugme-za-rezultat').addEventListener('click',rezultat)
}

function ajaxZahtev(options, callback) {
  var req = new XMLHttpRequest();
  req.open(options.metod, options.putanja, true);
  req.addEventListener("load", function() {
    if (req.status < 400) {
      callback(req.responseText);
    }
    else {
    callback(new Error("Zahtev odbijen: " + req.statusText));
    }
  });
  req.addEventListener("error", function() {
    callback(new Error("Greška na mreži"));
  });
  req.send(options.sadrzaj || null);
}

function glasaj(){
  cb = document.getElementsByTagName('input')
  brojCekiranih = 0
  for (i=0; i < cb.length; i++){
    if(cb[i].checked) {
      brojCekiranih++;
      izabran = cb[i].parentNode.innerText
    }
  }
  if (brojCekiranih !== 1) {
    alert("Nevažeći glas ")
    return
  }
  var options = {}
  options.metod = "POST"
  options.putanja  = "glasanje"
  options.sadrzaj = izabran
  ajaxZahtev(options, potvrdaGlasanja)
}

function rezultat() {
  var options = {}
  options.metod = "GET"
  options.putanja  = "rezultat"
  options.sadrzaj = ""
  ajaxZahtev(options, prikazRezultata)
}
function prikazRezultata(odgovor){
  odgovor = JSON.parse(odgovor)
  rezultat=""
  for (i in odgovor)
     rezultat += i+" "+odgovor[i]+"\n"
  alert(rezultat)
}
function potvrdaGlasanja(odgovor){
  alert(odgovor)
}
