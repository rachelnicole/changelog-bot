const config = require('./config');
const pg = require('pg');
const client = new pg.Client({
  host: config.HOST,
  port: config.PORT,
  user: config.USER,
  database: config.DATABASE,
  password: config.PASSWORD,
  ssl: false
})


module.exports = function (args, topic, callback) {

  const queryName = args;
  let query;

  const hostQuery = {
    name: 'find-user',
    text: 'SELECT name, email, github_handle, twitter_handle, bio, website, slack_id FROM people WHERE name ILIKE $1',
    values: [queryName]
  };

  const podcastQuery = {
    name: 'find-podcast',
    text: 'SELECT name, description, twitter_handle, itunes_url FROM podcasts WHERE name ILIKE $1',
    values: [queryName]
  };

  client.connect((err) => {
    console.log('connected');
    if (err) {
      throw err;
    }
    client.query(topic == "host" ? hostQuery : podcastQuery, (err, res) => {
      const returnData = res.rows[0];
      const completeData = {};

      Object.keys(returnData)
      .filter((key) => returnData[key])
      .forEach((key) => completeData[key] = returnData[key])

      callback(completeData);
    });
  });
};