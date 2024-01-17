'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Blog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Blog.belongsTo(models.User,{
        foreignKey: 'userID',
      })
    }
  }
  Blog.init({
    blogTitle: DataTypes.STRING,
    blogThumbnail: DataTypes.TEXT,
    blogDescription: DataTypes.STRING,
    location: DataTypes.STRING,
    date: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Blog',
  });
  return Blog;
};