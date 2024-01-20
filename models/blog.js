"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Blog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Blog.belongsTo(models.User, {
        foreignKey: "userID",
      });
      Blog.hasMany(models.sharedBlog,{
        foreignKey: 'blogID',
      })
      Blog.hasMany(models.Comment,{
        foreignKey: 'blogID',
      })
      Blog.hasMany(models.SavedBlog,{
        foreignKey: 'blogID',
      })
    }

    static async remove({ blogID, userID }) {
      return this.destroy({
        where: {
          id: blogID,
          userID,
        },
      });
    }

    static async likeBlog(blogID, userID) {
      const blog = await this.findByPk(blogID);

      if (!blog) {
        throw new Error("Blog not found");
      }

      // Check if the user has already liked the blog post
      if (blog.likes && blog.likedBy.includes(userID)) {
        throw new Error("Blog already liked by the user");
      }

      // Update the likes count and the array of user IDs who liked the blog
      blog.likes = blog.likes ? blog.likes + 1 : 1;
      blog.likedBy = blog.likedBy ? [...blog.likedBy, userID] : [userID];

      // Save the updated blog post
      await blog.save();

      return blog;
    }
  }
  Blog.init(
    {
      blogTitle: DataTypes.STRING,
      blogThumbnail: DataTypes.TEXT,
      blogDescription: DataTypes.STRING,
      location: DataTypes.STRING,
      date: DataTypes.STRING,
      likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      likedBy: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: "Blog",
    }
  );
  return Blog;
};
