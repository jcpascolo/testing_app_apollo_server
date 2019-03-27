
const list = (sequelize, DataTypes) => {
    const List = sequelize.define('list', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });
  
    List.associate = models => {
      List.hasMany(models.Task, { onDelete: 'CASCADE' });
    };
  
    return List;
  };
  
  export default list;
