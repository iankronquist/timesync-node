module.exports = function(expect, request, baseUrl) {
    /* GET one of the /times endpoints and check its response against
       what should be returned */
    describe('GET /times', function() {
        it('should return all times in the database', function(done) {
            request.get(baseUrl + 'times', function(err, res, body) {
                var expectedResults = [
                    {
                        //jscs:disable
                        duration: 12,
                        user: 'tschuy',
                        project: ['wf'],
                        activities: ['docs', 'dev'],
                        notes: '',
                        issue_uri: 'https://github.com/osu-cass' +
                            '/whats-fresh-api/issues/56',
                        date_worked: null,
                        created_at: null,
                        updated_at: null,
                        id: 1
                        //jscs:enable
                    }
                ];

                expect(err).to.equal(null);
                expect(res.statusCode).to.equal(200);
                expect(JSON.parse(body)).to.deep.equal(expectedResults);
                done();
            });
        });
    });

    describe('GET /times/:id', function() {
        it('should return times by id', function(done) {
            request.get(baseUrl + 'times/1', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    //jscs:disable
                    duration: 12,
                    user: 'tschuy',
                    project: ['wf'],
                    activities: ['docs', 'dev'],
                    notes: '',
                    issue_uri: 'https://github.com/osu-cass/whats-fresh-api' +
                        '/issues/56',
                    date_worked: null,
                    created_at: null,
                    updated_at: null,
                    id: 1
                    //jscs:enable
                };

                expect(err).to.equal(null);
                expect(res.statusCode).to.equal(200);

                expect(jsonBody).to.deep.equal(expectedResult);
                done();
            });
        });

        it('should fail with Object not found error', function(done) {
            request.get(baseUrl + 'times/404', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    error: 'Object not found',
                    status: 404,
                    text: 'Nonexistent time'
                };

                expect(jsonBody).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(404);

                done();
            });
        });

        it('fails with Invalid Identifier error', function(done) {
            request.get(baseUrl + 'times/cat', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    error: 'The provided identifier was invalid',
                    status: 400,
                    text: 'Expected ID but received cat',
                    values: ['cat']
                };

                expect(jsonBody).to.eql(expectedResult);
                expect(res.statusCode).to.equal(400);

                done();
            });
        });
    });

    describe('POST /times/:id', function() {
        // The database's entry for `Whats Fresh`'s time entry
        var originalTime = {
            duration:    12,
            user:        'tschuy',
            project:     ['wf'],
            notes:       '',
            activities:  ['docs', 'dev'],
            // jscs:disable
            issue_uri:
               'https:://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: null,
            created_at:  null,
            updated_at:  null,
            // jscs:enable
            id:          1
        };

        // A completely patched version of the above time entry
        // Only contains valid patch elements.
        var patchedTime = {
            duration:    15,
            user:        'deanj',
            project:     ['pgd'],
            activities:  ['docs', 'sys'],
            notes:       'Now this is a note',
            // jscs:disable
            issue_uri:   'https://github.com/osuosl/pgd/pull/19',
            date_worked: '2015-04-28',
            // jscs:enable
        };

        // Individual pieces of the above JSON object
        // Used for sending individual patches
        patchedTimeDuration   = {duration:    patchedTime.duration};
        patchedTimeUser       = {user:        patchedTime.user};
        patchedTimeProject    = {project:     patchedTime.project};
        patchedTimeActivities = {activities:  patchedTime.activities};
        patchedTimeNotes      = {notes:       patchedTime.notes};
        // jscs:disable
        patchedTimeIssueUri   = {issue_uri:   patchedTime.issue_uri};
        patchedTimeDateWorked = {date_worked: patchedTime.date_worked};
        // jscs:enable

        // Sends invalid data to the /times/:id endpoint
        var invalidTime = {
            duration:    undefined,
            user:        undefined,
            project:     undefined,
            activities:  undefined,
            notes:       undefined,
            // jscs:disable
            issue_uri:   undefined,
            date_worked: undefined,
            // jscs:enable
            key: 'this is a string',
        };

        // Individual pieces of the above JSON object
        // Used for sending individual patches
        invalidTimeDuration   = {duration:    invalidTime.duration};
        invalidTimeUser       = {user:        invalidTime.user};
        invalidTimeProject    = {project:     invalidTime.project};
        invalidTimeActivities = {activities:  invalidTime.activities};
        invalidTimeNotes      = {notes:       invalidTime.notes};
        // jscs:disable
        invalidTimeIssueUri   = {issue_uri:   invalidTime.issue_uri};
        invalidTimeDateWorked = {date_worked: invalidTime.date_worked};
        // jscs:enable
        invalidTimeKey        = {key:         invalidTime.key};

        var postArg = {
            auth: {
                user: 'tschuy',
                password: '$2a$10$6jHQo4XTceYyQ/SzgtdhleQqkuy2G27omuIR8M' +
                          'PvSG8rwN4xyaF5W'
            },
        };

        var requestOptions = {
            url: baseUrl + 'times/1',
            json: true
        };

        function copyJsonObject(obj) {
            // This allows us to change object properties
            // without effecting other tests
            return JSON.parse(JSON.stringify(obj));
        }

        /*
         * Okay so here's the deal.
         * This endpoint has ~26 tests, which are honestly just 3 tests
         * repeated 7 or 8 times (with a few exceptions).
         * This function in theory gets rid of a lot of the repeated code in
         * the tests.
         * Without this function you would see this exact code pretty 26
         * times over.
         */
        function sendDataToEndpoint(done,
                                    postObj,
                                    expectedResults,
                                    error,
                                    statusCode,
                                    postBodies) {
            postArg.object = copyJsonObject(postObj);
            requestOptions.form = copyJsonObject(postArg);

            // make a given post request
            // check the error
            // check the statusCode
            // Also check the body of the request
            request.post(requestOptions, function(err, res, body) {
                expect(err).to.be.a(error);
                expect(res.statusCode).to.equal(statusCode);

                if (postBody !== undefined) {
                    expect(postBodies).to.include.members(body);
                    console.log(postBodies);
                }

                // Always checks for valid get request
                // err is always 'null'
                // res.statusCode is always 200
                // body always equals expectedresults
                request.get(requestOptions.url, function(err, res, body) {
                    expect(err).to.be.a('null');
                    expect(res.statusCode).to.equal(200);
                    console.log(body);
                    expect(body).to.deep.equal(expectedResults);
                    done();
                });
            });
        }

        // Tests all valid fields
        it('succesfully patches time with valid duration, user, project,' +
           ' activity notes, issue_uri, and date_worked', function(done) {
            postObj = copyJsonObject(patchedTime);
            expectedResults = copyJsonObject(patchedTime);
            expectedResults.id = originalTime.id;
            error = 'null';
            statusCode = 200;
            postBody = undefined;

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests valid duration field
        it('successfully patches time with valid duration', function(done) {
            postObj = copyJsonObject(patchedTimeDuration);
            expectedResults = copyJsonObject(originalTime);
            expectedResults.duration = patchedTime.duration;
            error = 'null';
            statusCode = 200;
            postBody = undefined;

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests valid user field
        // This test's functionality will be implemented at a later date
        // (after the rest of the /time/:id functionality is implemented)
        it('successfully patches time with valid user', function(done) {
            postObj = copyJsonObject(patchedTimeUser);
            expectedResults = copyJsonObject(originalTime);
            expectedResults.user = patchedTime.user;
            error = 'null';
            statusCode = 200;
            postBody = undefined;

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests valid project field
        it('successfully patches time with valid project', function(done) {
            postObj = copyJsonObject(patchedTimeProject);
            expectedResults = copyJsonObject(originalTime);
            expectedResults.project = patchedTime.project;
            error = 'null';
            statusCode = 200;
            postBody = undefined;

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests valid activities field
        it('successfully patches time with valid activities', function(done) {
            postObj = copyJsonObject(patchedTimeActivities);
            expectedResults = copyJsonObject(originalTime);
            expectedResults.activities = patchedTime.activities;
            error = 'null';
            statusCode = 200;
            postBody = undefined;

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests valid notes field
        it('successfully patches time with valid notes', function(done) {
            postObj = copyJsonObject(patchedTimeNotes);
            expectedResults = copyJsonObject(originalTime);
            expectedResults.notes = patchedTime.notes;
            error = 'null';
            statusCode = 200;
            postBody = undefined;

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests valid issue_uri field
        it('successfully patches time with valid issue_uri', function(done) {
            postObj = copyJsonObject(patchedTimeIssueUri);
            expectedResults = copyJsonObject(originalTime);
            // jscs:disable
            expectedResults.issue_uri = patchedTime.issue_uri;
            // jscs:enable
            error = 'null';
            statusCode = 200;
            postBody = undefined;

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests valid date_worked field
        it('successfully patches time with valid date_worked', function(done) {
            postObj = copyJsonObject(patchedTimeDateWorked);
            expectedResults = copyJsonObject(originalTime);
            // jscs:disable
            expectedResults.date_worked = patchedTime.date_worked;
            // jscs:enable
            error = 'null';
            statusCode = 200;
            postBody = undefined;

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests all invalid fields
        it('unsuccesfully patches time with invalid duration, user, project,' +
           ' activity notes, issue_uri, and date_worked', function(done) {
            postObj = copyJsonObject(invalidTime);
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field duration of time should be ' +
                        'string but was sent as undefined'
            },
            {
                status: 400,
                error: 'Bad object',
                text: 'Field user of time should be ' +
                        'string but was sent as undefined'
            },
            {
                status: 400,
                error: 'Bad object',
                text: 'Field project of time should be ' +
                        'string but was sent as undefined'
            },
            {
                status: 400,
                error: 'Bad object',
                text: 'Field activities of time should be ' +
                        'array but was sent as undefined'
            },
            {
                status: 400,
                error: 'Bad object',
                text: 'Field notes of time should be ' +
                        'string but was sent as undefined'
            },
            {
                status: 400,
                error: 'Bad object',
                text: 'Field issue_uri of time should be ' +
                        'string but was sent as undefined'
            },
            {
                status: 400,
                error: 'Bad object',
                text: 'Field date_worked of time should be ' +
                        'string but was sent as undefined'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests invalid duration field
        it('unsuccessfully patches time with just invalid duration',
           function(done) {
            postObj = copyJsonObject(invalidTimeDuration);
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field duration of time should be ' +
                        'string but was sent as undefined'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests invalid user field
        // This test's functionality will be implemented at a later date
        // (after the rest of the /time/:id functionality is implemented)
        it('unsuccessfully patches time with just invalid user',
           function(done) {
            postObj = copyJsonObject(invalidTimeUser);
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field user of time should be ' +
                        'string but was sent as undefined'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests invalid project field
        it('unsuccessfully patches time with just invalid project',
           function(done) {
            postObj = copyJsonObject(invalidTimeProject);
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field project of time should be ' +
                        'string but was sent as undefined'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests invalid activities field
        it('unsuccessfully patches time with just invalid activites',
           function(done) {
            postObj = copyJsonObject(invalidTimeActivities);
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field activities of time should be ' +
                        'array but was sent as undefined'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests invalid notes field
        it('unsuccessfully patches time with just invalid notes',
           function(done) {
            postObj = copyJsonObject(invalidTimeNotes);
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field notes of time should be ' +
                        'string but was sent as undefined'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests invalid issue_uri field
        it('unsuccessfully patches time with just invalid issue_uri',
           function(done) {
            postObj = copyJsonObject(invalidTimeIssueUri);
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field issue_uri of time should be ' +
                        'string but was sent as undefined'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests invalid date_worked field
        it('unsuccessfully patches time with just invalid date_worked',
           function(done) {
            postObj = copyJsonObject(invalidTimeDateWorked);
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field date_worked of time should be ' +
                        'string but was sent as undefined'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests invalid key field
        it('unsuccessfully patches time with just invalid key',
           function(done) {
            postObj = copyJsonObject(invalidTimeKey);
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'time does not have a key field',
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests all valid fields except invalid duration
        it('unsuccessfully patches time with an invalid duration',
           function(done) {
            postObj = copyJsonObject(originalTime);
            postObj.duration = invalidTime.duration;
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field duration of time should be ' +
                        'string but was sent as undefined'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests all valid fields except invalid user
        // This test's functionality will be implemented at a later date
        // (after the rest of the /time/:id functionality is implemented)
        it('unsuccessfully patches time with an invalid user',
           function(done) {
            postObj = copyJsonObject(originalTime);
            postObj.user = invalidTime.user;
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field user of time should be ' +
                        'string but was sent as undefined'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests all valid fields except invalid project
        it('unsuccessfully patches time with an invalid project',
           function(done) {
            postObj = copyJsonObject(originalTime);
            postObj.project = invalidTime.project;
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field project of time should be ' +
                        'string but was sent as undefined'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests all valid fields except invalid activities
        it('unsuccessfully patches time with an invalid activities',
           function(done) {
            postObj = copyJsonObject(originalTime);
            postObj.activities = invalidTime.activities;
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field activities of time should be ' +
                        'array but was sent as undefined'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests all valid fields except invalid notes
        it('unsuccessfully patches time with an invalid notes',
            function(done) {
            postObj = copyJsonObject(originalTime);
            postObj.notes = invalidTime.notes;
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field notes of time should be ' +
                        'string but was sent as undefined'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests all valid fields except invalid issue_uri
        it('unsuccessfully patches time with an invalid issue_uri',
            function(done) {
            postObj = copyJsonObject(originalTime);
            // jscs:disable
            postObj.issue_uri = invalidTime.issue_uri;
            // jscs:enable
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field issue_uri of time should be ' +
                        'string but was sent as undefined'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests all valid fields except invalid date_worked
        it('unsuccessfully patches time with an invalid date_worked',
            function(done) {
            postObj = copyJsonObject(originalTime);
            // jscs:disable
            postObj.date_worked = invalidTime.date_worked;
            // jscs:enable
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field date_worked of time should be ' +
                        'string but was sent as undefined'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests all valid fields except invalid key
        it('unsuccessfully patches time with an invalid key',
            function(done) {
            postObj = copyJsonObject(originalTime);
            postObj.key = invalidTime.key;
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'time does not have a key field'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });
    });
};
