// Database interface and initialization.
// This sets up the sequelize instance for interaction
// with the Postgres server using postgres.config.js and
// models.js.
var Sequelize = require('sequelize');

// Bring in our config file and models.
var config = require('./postgres.config.js');
var url = process.env.DATABASE_URL;
var models = require('./models');

// Declare variables for later use.
var db;
var schema;
var User;
var Entry;
var Prompt;
var Word;
var shouldForce;

// Read NODE_DB_ENV variable to see if we are entering
// test mode or not. If so, use test schema to sandbox
// our database abuse.
var dbEnvironment = process.env.NODE_ENV;

if (dbEnvironment === 'test') {
  schema = config.testSchema;
} else {
  schema = config.mainSchema;
}

// Initiate sequelize instance (representing the connection
// to the database) with the url from the config file and
// the appropriate schema we selected above.

db = new Sequelize(url, {ssl:true,sync: {schema: schema}});
// db = new Sequelize('database', 'username', 'password', {
//       dialect: "postgres", 
//       host: "amazon...",
//       port: "5432", 
//       ssl: true,
//       sync:{schema:schema}
//     });

// Each model must have the schema attached or Postgres will
// yell at you unhappily, even though you already specified
// the schema on the sequelize instance. There may be more
// options for the sequelize instance that would avoid this.
User = db.define('user', models.User.attributes, models.User.options);
User.schema(schema);

Entry = db.define('entry', models.Entry.attributes, models.Entry.options);
Entry.schema(schema);

Prompt = db.define('prompt', models.Prompt.attributes, models.Prompt.options);
Prompt.schema(schema);

Word = db.define('word', models.Word.attributes, models.Word.options);
Word.schema(schema);

// These lines set up the foreign key within Entry (userId)
// and create the methods {Entry.setUser, Entry.getUser} and
// {User.setEntries, User.getEntries}.
Entry.belongsTo(User);
User.hasMany(Entry);

Word.belongsTo(User);
User.hasMany(Word);

// If NODE_DB_ENV is set to 'reset' when this code executes,
// the sequelize instance will drop the tables before creating
// them anew. Otherwise, the extant tables will be loaded.
if (dbEnvironment === 'test' || dbEnvironment === 'reset') {
  shouldForce = true;
} else {
  shouldForce = false;
}

// Wrap actual db synchronization in a function that
// we can expose from module.exports. This function
// returns a promise, so that a module requiring the db
// knows to wait for the initial sync/setup to finish
// before proceeding.
function init() {
  return db.sync({force: shouldForce})
    .then(function() {
      // If we're executing our `reset-db` npm script,
      // we bail here
      if (dbEnvironment === 'reset') process.exit(0);
    });
}

// TODO: Export methods here
module.exports = {
  sequelize: db,
  User: User,
  Entry: Entry,
  Prompt: Prompt,
  Word: Word,
  init: init
};
