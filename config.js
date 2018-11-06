var config = {}

config.endpoint = "https://dbproyecto2arqui.documents.azure.com:443/";
config.primaryKey = "xtkLxTp3DN43grsXeYdPjsaqJbpxmL4X0hYuY96ENTTxDZiSyiCm65TnVAKH0Gyv752CGU1G09tFiSkb68EbAg==";

config.database = {
    "id": "DBproyecto2"
};

config.collection = {
    "id": "Cola"
};

config.document1 = {
   
        "Tipo": "Figura",
        "Contenido": "Cilindro"
     
};
config.document2 = {
    "Tipo": "Figura",
    "Contenido": "Corazon"

};
config.document3 = {

    "Tipo": "Figura",
    "Contenido": "Piramide"
};
config.document4 = {
  
    "Tipo": "Figura",
    "Contenido": "Cubo"

};


module.exports = config;