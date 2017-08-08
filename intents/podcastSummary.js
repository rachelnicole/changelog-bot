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


module.exports = function (session, args) {
  const podcastEntity = args.entities.filter((entity) => entity.type === 'podcastTitle');
  let podcastName = podcastEntity.length ? podcastEntity[0].entity : null;

  const query = {
    name: 'find-user',
    text: 'SELECT name FROM podcasts WHERE name ILIKE $1',
    values: [podcastName]
  };

  client.connect((err) => {
    if (err) {
      throw err;
    }
    client.query(query, (err, res) => {
      if (err) {
        console.log(err.stack)
      } else {
        console.log(res.rows[0])
      }
      client.end();
    });
  });

  session.send('you asked for information on a podcast');

};