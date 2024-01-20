'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('sharedBlogs','blogID',{
      type: Sequelize.DataTypes.INTEGER,
    })

    await queryInterface.addConstraint('sharedBlogs',{
      fields: ['blogID'],
      type: 'foreign key',
      references: {
        table: 'Blogs',
        field: 'id'
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('sharedBlogs', 'blogID')

  }
};
