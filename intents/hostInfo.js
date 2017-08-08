const config = require('../config');
const pg = require('pg');
const client = new pg.Client({
  host: config.HOST,
  port: config.PORT,
  user: config.USER,
  password: config.PASSWORD,
})


module.exports = function (session, args) {
  const hostEntity = args.entities.filter((entity) => entity.type === 'podcastHost');
  const hostName = hostEntity.length ? hostEntity[0].entity : null;
  
  console.log(hostName);
  console.log('---------');

  ///client.connect()

  client.query('SELECT name FROM people', function (err, results) {
    console.log(err);
    console.log('~~~~~~~~~~');
    console.log(results);
  })

  session.send('you asked for information on a host');

};