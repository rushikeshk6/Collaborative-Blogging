'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Comments','blogID',{
      type: Sequelize.DataTypes.INTEGER,
    })

    await queryInterface.addConstraint('Comments',{
      fields: ['blogID'],
      type: 'foreign key',
      references: {
        table: 'Blogs',
        field: 'id'
      }
    })

    await queryInterface.addColumn('Comments','userID',{
      type: Sequelize.DataTypes.INTEGER,
    })

    await queryInterface.addConstraint('Comments',{
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
