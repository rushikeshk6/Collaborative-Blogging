'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Blogs','userID',{
      type: Sequelize.DataTypes.INTEGER,
    })

    await queryInterface.addConstraint('Blogs',{
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
    await queryInterface.removeColumn('Blogs', 'userID')
  }
};
