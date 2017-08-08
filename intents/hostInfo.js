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
  const hostEntity = args.entities.filter((entity) => entity.type === 'podcastHost');
  let hostName = hostEntity.length ? hostEntity[0].entity : null;

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
  };

  hostName = toTitleCase(hostName);

  console.log('|' + hostName + '|');


  const query = {
    name: 'find-user',
    text: 'SELECT name FROM people WHERE name = $1',
    values: [hostName]
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
    });
  });

  session.send('you asked for information on a host');

};