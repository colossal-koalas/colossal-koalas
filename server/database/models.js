var Sequelize = require('sequelize');
var Bluebird = require('bluebird');
var bcrypt = Bluebird.promisifyAll(require('bcrypt-nodejs'));

// Function for hashing user's password before storage
// Returns a promise that will fulfill to undefined, or reject with error
// This is attached as a hook, so it takes the model as its argument.
// See http://docs.sequelizejs.com/en/latest/docs/hooks/
function hashPassword(user) {
  return bcrypt.hashAsync(user.password, null, null)
    .then(function(hash) {
      user.password = hash;
    });
}

// Function for comparing a password at login
// Returns a promise that will fulfill with a boolean
// The `this` keyword is used here since this is passed
// to the model definition as an instance method.
function comparePassword(password) {
  return bcrypt.compareAsync(password, this.password);
}

//// Model schemata ////////////////

// Attributes and options for User model.
exports.User = {

  attributes: {

    name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },

    password: {
      type: Sequelize.STRING,
      allowNull: false
    },

    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }

  },

  options: {

    hooks: {
      beforeCreate: hashPassword,
      beforeUpdate: hashPassword
    },

    instanceMethods: {
      comparePassword: comparePassword
    }

  }

};

// Attributes and options for Entry model.
exports.Entry = {

  attributes: {

    emotion: Sequelize.INTEGER,

    text: Sequelize.TEXT,

    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }

  },

  options: {

    // To make sure our table names don't cause confusion,
    // we specify the specific irregular plural of 'entry'.
    // See http://docs.sequelizejs.com/en/latest/docs/associations/#naming-strategy
    name: {
      singular: 'entry',
      plural: 'entries'
    }

  }

};

// Attributes and options for Prompt model.
exports.Prompt = {

  attributes: {

    text: Sequelize.STRING,

    // Emotion represents the selected emotion that causes the
    // prompt to display. Initial prompts will have -1 as their 'emotion'.
    emotion: Sequelize.INTEGER,

    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }

  },

  options: {}

};

exports.Word = {

  attributes: {

    word: Sequelize.STRING,

    averageSentiment: Sequelize.FLOAT,

    frequency: Sequelize.INTEGER,

    emotion: Sequelize.INTEGER,

    id: {

      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true

    }

  },

  options: {}

};
