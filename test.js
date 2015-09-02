const knexfile = require('./knexfile');
const knex = require('knex')(knexfile.mocha);
const SqlFixtures = require('sql-fixtures');
const fixtureCreator = new SqlFixtures(knex);
const testData = require('./tests/fixtures/test_data');

GLOBAL.knex = knex;
const app = require('./src/app');


const requestBuilder = require('request');
const request = requestBuilder.defaults({encoding: null});

const reloadFixtures = function(done) {
  // Clear SQLite indexes
  knex.raw('delete from sqlite_sequence').then(function() {
    fixtureCreator.create(testData).then(function() {
      done();
    });
  });
};

const clearDatabase = function(done) {
  knex('projects').del().then(function() {
    knex('activities').del().then(function() {
      knex('users').del().then(function() {
        knex('times').del().then(function() {
          knex('projectslugs').del().then(function() {
            knex('timesactivities').del().then(done);
          });
        });
      });
    });
  });
};


const requestOptions = {"url":"http://localhost:8000/v1/projects/gwm","json":true,"form":{"auth":{"username":"tschuy","password":"password"},"object":{"id":1,"name":"reganaM beW itenaG","owner":"tschuy","slugs":[],"uri":"ht3Ctps://code.osuosl.org/projects/ganeti-webmgr"}}}
//clearDatabase(function() {
    knex.migrate.latest().then(function() {
  reloadFixtures(function() {
      request.post(requestOptions, function(err, res, body) {
        console.log(requestOptions);
        console.log(err);
        console.log(res);
        process.exit();
      });
    });
  });
//});


