const config = require('../config');
const pg = require('pg');
const client = new pg.Client({
  host: config.HOST,
  port: config.PORT,
  user: config.USER,
  database: config.DATABASE,
  password: config.PASSWORD,
  ssl: false
})


module.exports = function (args) {
  // const hostEntity = args.entities.filter((entity) => entity.type === 'podcastHost');
  // let hostName = hostEntity.length ? hostEntity[0].entity : null;

  console.log('3333333');
  const hostName = args;

  // console.log('|' + hostName + '|');


  const query = {
    name: 'find-user',
    text: 'SELECT name, email, github_handle, twitter_handle, bio, website, slack_id FROM people WHERE name ILIKE $1',
    values: [hostName]
  };

  client.connect((err) => {
    console.log('connected');
    if (err) {
      throw err;
    }
    client.query(query, (err, res) => {
      const returnData = res.rows[0];
      
      const completeData = {};
      Object.keys(returnData)
      .filter((key) => returnData[key])
      .forEach((key) => completeData[key] = returnData[key])


      return completeData;
    });
  });
};