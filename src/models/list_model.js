

module.exports = function(sequelize, DataTypes) {
    const List = sequelize.define('list', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      public: {
        type: DataTypes.BOOLEAN,
        allowNull:false,
      }
    });
  
    List.associate = models => {
      List.hasMany(models.Task, { onDelete: 'CASCADE' });
      List.belongsTo(models.User, { onDelete: 'SET NULL'})
    };
  
  return List;
}

  
//export default list;
