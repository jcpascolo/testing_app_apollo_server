
import Sequelize from 'sequelize';

const sequelize = new Sequelize(
    //database
    process.env.DB_NAME,

    //database user
    process.env.DB_USER,

    //database password
    process.env.DB_PASS,
  
    {
        dialect: 'postgres',
        port: parseInt(process.env.DB_PORT || '5432'),
    },
);


const models = {
    List: sequelize.import('./list_model.js'),
    Task: sequelize.import('./task_model.js'),
    User: sequelize.import('./user_model.js')
};

Object.keys(models).forEach(key => {
    if ('associate' in models[key]) {
        models[key].associate(models);
    }
});

export { sequelize };

export default models;
