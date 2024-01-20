'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint('SavedBlogs',{
      fields: ['blogID'],
      type: 'foreign key',
      references: {
        table: 'Blogs',
        field: 'id'
      }
    })

    await queryInterface.addConstraint('SavedBlogs',{
      fields: ['userID'],
      type: 'foreign key',
      references: {
        table: 'Users',
        field: 'id'
      }
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
