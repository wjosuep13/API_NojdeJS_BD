"use strict";
var express = require('express');
var app = express();
var documentClient = require("documentdb").DocumentClient;
var config = require("./config");
var url = require('url');

var client = new documentClient(config.endpoint, { "masterKey": config.primaryKey });

var HttpStatusCodes = { NOTFOUND: 404 };
var databaseUrl = `dbs/${config.database.id}`;
var collectionUrl = `${databaseUrl}/colls/${config.collection.id}`;

/**
 * Get the database by ID, or create if it doesn't exist.
 * @param {string} database - The database to get or create
 */
function getDatabase() {
    console.log(`Getting database:\n${config.database.id}\n`);

    return new Promise((resolve, reject) => {
        client.readDatabase(databaseUrl, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createDatabase(config.database, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
}

/**
 * Get the collection by ID, or create if it doesn't exist.
 */
function getCollection() {
    console.log(`Getting collection:\n${config.collection.id}\n`);

    return new Promise((resolve, reject) => {
        client.readCollection(collectionUrl, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createCollection(databaseUrl, config.collection, { offerThroughput: 400 }, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
}

/**
 * Get the document by ID, or create if it doesn't exist.
 * @param {function} callback - The callback function on completion
 */
function getDocument(document) {
    let documentUrl = `${collectionUrl}/docs/${document.id}`;
    console.log(`Getting document:\n${document.id}\n`);

    return new Promise((resolve, reject) => {
        client.readDocument(documentUrl, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createDocument(collectionUrl,document, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
};

/**
 * Query the collection using SQL
 */
function queryCollection(res) {
    console.log(`Querying collection through index:\n${config.collection.id}`);

    return new Promise((resolve, reject) => {
        client.queryDocuments(
            collectionUrl,
            'SELECT * FROM notificaciones'
        ).toArray((err, results) => {
            if (err) reject(err)
            else {
                var resultString="";
                for (var queryResult of results) {
                    resultString=resultString+JSON.stringify(queryResult);
                    console.log(`\tQuery returned ${resultString}`);
                }
                res.send(resultString);
                console.log();
                resolve(results);
                
            }
        });
    });
};

/**
 * Replace the document by ID.
 */
function replaceDocument(document) {
    let documentUrl = `${collectionUrl}/docs/${document.id}`;
    console.log(`Replacing document:\n${document.id}\n`);
    document.children[0].grade = 6;

    return new Promise((resolve, reject) => {
        client.replaceDocument(documentUrl, document, (err, result) => {
            if (err) reject(err);
            else {
                resolve(result);
            }
        });
    });
};

/**
 * Delete the document by ID.
 */
function deleteDocument(document) {
    let documentUrl = `${collectionUrl}/docs/${document.id}`;
    console.log(`Deleting document:\n${document.id}\n`);

    return new Promise((resolve, reject) => {
        client.deleteDocument(documentUrl, (err, result) => {
            if (err) reject(err);
            else {
                resolve(result);
            }
        });
    });
};



/**
 * Cleanup the database and collection on completion
 */
function cleanup() {
    console.log(`Cleaning up by deleting database ${config.database.id}`);

    return new Promise((resolve, reject) => {
        client.deleteDatabase(databaseUrl, (err) => {
            if (err) reject(err)
            else resolve(null);
        });
    });
}
function exit(message) {
    console.log(message);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
};
/**
 * Exit the app with a prompt
 * @param {message} message - The message to display
 */

app.get('/:option',function(req,res) {
    var op =req.params.option;
    if(op==1){
      getDatabase()
      .then(() => getCollection())
      .then(() => getDocument(config.documents))
      .then(() => { exit(`Completed successfully`); })
      .catch((error) => { console.log(`Completed with error ${JSON.stringify(error)}`) });
      res.send(op);
    }else if(op==0){
        getDatabase()
        .then(() => queryCollection(res))
        .then(() => { exit(`Completed successfully`); })
    }
	
});
app.listen(process.env.PORT || 3000);
