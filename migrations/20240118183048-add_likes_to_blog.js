'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Blogs', 'likes', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('Blogs', 'likedBy', {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      defaultValue: [],
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Blogs', 'likes');
    await queryInterface.removeColumn('Blogs', 'likedBy');
  }
};
