'use strict';
// Run with:
// NODE_ENV=mocha PORT=8851 DEBUG=true mocha --harmony tests/fuzz_test.js 2> out

const fuzzer = require('fuzzer')
const fs = require('fs');

const requestBuilder = require('request');
const expect = require('chai').expect;
const SqlFixtures = require('sql-fixtures');

const request = requestBuilder.defaults({encoding: null});
const testData = require('./fixtures/test_data');
const knexfile = require('../knexfile');
const knex = require('knex')(knexfile.mocha);
const fixtureCreator = new SqlFixtures(knex);

GLOBAL.knex = knex;
const app = require('../src/app');

const port = process.env.PORT || 8000;
const baseUrl = 'http://localhost:' + port + '/v1/';

function copyJsonObject(obj) {
  // This allows us to change object properties
  // without effecting other tests
  return JSON.parse(JSON.stringify(obj));
}

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

describe('Fuzz testing', function() {
  before(function(done) {
    // good enough source of randomness for a prototype
    let epoch = (new Date).getTime();
    fuzzer.seed(epoch);
    knex.migrate.latest().then(function() {
      clearDatabase(function() {
        reloadFixtures(done);
      });
    });
  });

  it('should return ', function(done) {
    const originalProject = {
      id: 1,
      name: 'Ganeti Web Manager',
      owner: 'tschuy',
      slugs: ['gwm', 'ganeti-webmgr'],
      uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
    };

    const requestOptions = {
      url: baseUrl + 'projects/gwm',
      json: true,
    };
    const postArg = {
      auth: {
        username: 'tschuy',
        password: 'password',
      },
    };




    this.timeout(15000);
    let expectedResultsGenerator = fuzzer.mutate.object(originalProject);
    for (let i = 0; i < 100; i++) {
        requestOptions.form = copyJsonObject(postArg);
        let expectedResults = expectedResultsGenerator();
        let sentResults = copyJsonObject(expectedResults);
        // remove id from post
        delete sentResults.id
        requestOptions.form.object = copyJsonObject(sentResults);

        request.post(requestOptions, function(err, res, body) {
          //console.log(requestOptions);
          expect(err).to.be.a('null');
              fs.writeSync(2, "\n");
              fs.writeSync(2, JSON.stringify(requestOptions));
              fs.writeSync(2, "\n");
              fs.fsyncSync(2);
          if (res.statusCode === 400) {
            if (body.text === "project does not have a id field") {
              expect(expectedResults.id).to.equal(undefined);
            } else {
              fs.writeSync(2, "error\n");
              fs.writeSync(2, JSON.stringify(body));
              fs.fsyncSync(2);
              //expect(false).to.equal(true);
            }
          } else if (res.statusCode === 200) {
            // expect body of post request to be the new state of gwm
            expect(body).to.deep.equal(expectedResults);
            expect(res.statusCode).to.equal(200);

            checkListEndpoint(done, expectedResults);
          } else  {
            expect(false).to.equal(true);
          }
      });
    }

    // Function used for validating that the object in the database
    // is in the correct state (change or unchanged based on if the POST
    // was valid)
    const checkListEndpoint = function(done, expectedResults) {
      // Make a get request
      request.get(requestOptions.url, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        const jsonBody = JSON.parse(body);
        expect(jsonBody).to.deep.equal(expectedResults);
        done();
      });
    };

  });

});
