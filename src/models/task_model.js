
const task = (sequelize, DataTypes) => {
    const Task = sequelize.define('task', {
      text: {
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
          notEmpty: {
            args: true,
            msg: 'No puede añadirse una tarea vacía'
          }
        },
      },

      done:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    });
  
    Task.associate = models => {
      Task.belongsTo(models.List, {onDelete: 'CASCADE'});
      Task.belongsTo(models.User, {onDelete: 'SET NULL'});
    };

  
    return Task;
  };
  
  export default task;

