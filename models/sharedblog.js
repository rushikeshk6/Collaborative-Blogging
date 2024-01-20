'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class sharedBlog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      sharedBlog.belongsTo(models.Blog,{
        foreignKey: 'blogID',
      })
    }
  }
  sharedBlog.init({
    shareBlogLink: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'sharedBlog',
  });
  return sharedBlog;
};