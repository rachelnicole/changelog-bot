const request = require("request");
const pg = require('pg');
const connectionString = config.DATABASE_URL;


module.exports = function (session, args) {
  const hostEntity = args.entities.filter((entity) => entity.type === 'podcastHost');
  const hostName = hostEntity.length ? hostEntity[0].entity : null;
  
  console.log(hostName);
  console.log('---------');
  session.send('you asked for information on a host');

};