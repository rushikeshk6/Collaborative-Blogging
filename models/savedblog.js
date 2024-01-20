'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SavedBlog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SavedBlog.belongsTo(models.Blog,{
        foreignKey: 'blogID',
      }) 
      SavedBlog.belongsTo(models.User,{
        foreignKey: 'userID',
      }) 
    }
  }
  SavedBlog.init({
    blogID: DataTypes.INTEGER,
    userID: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'SavedBlog',
  });
  return SavedBlog;
};