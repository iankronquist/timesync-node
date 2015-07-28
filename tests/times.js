module.exports = function(expect, request, baseUrl) {
    describe('GET /times', function() {
        it('should return all times in the database', function(done) {
            request.get(baseUrl + 'times', function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        //jscs:disable
                        duration: 12,
                        user: 'tschuy',
                        project: ['wf'],
                        activity: ['dev'],
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
                expect(err).to.be(null);
                expect(res.statusCode).to.be(200);
                expect(JSON.parse(bodyAsString)).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times/:id', function() {
        it('should return times by id', function(done) {
            request.get(baseUrl + 'times/1', function(err, res) {
                var jsonBody = JSON.parse(String.fromCharCode.apply(
                    null, res.body));
                var expectedResult = {
                    //jscs:disable
                    duration: 12,
                    user: 'tschuy',
                    project: ['wf'],
                    activity: ['dev'],
                    notes: '',
                    issue_uri: 'https://github.com/osu-cass/whats-fresh-api' +
                        '/issues/56',
                    date_worked: null,
                    created_at: null,
                    updated_at: null,
                    id: 1
                    //jscs:enable
                };

                expectedResult.project.sort();
                expectedResult.activity.sort();
                jsonBody.project.sort();
                jsonBody.activity.sort();

                expect(err).to.be(null);
                expect(res.statusCode).to.be(200);

                expect(jsonBody).to.eql(expectedResult);
                done();
            });
        });

        it('should fail with Object not found error', function(done) {
            request.get(baseUrl + 'times/404', function(err, res) {
                var jsonBody = JSON.parse(String.fromCharCode.apply(
                    null, res.body));
                var expectedResult = {
                    error: 'Object not found',
                    errno: 1,
                    text: 'Invalid time id'
                };

                expect(jsonBody).to.eql(expectedResult);
                expect(res.statusCode).to.equal(404);

                done();
            });
        });
    });
};
