
import Sequelize from 'sequelize';

const sequelize = new Sequelize(
    //database
    'tododb',

    //database user
    'postgres',

    //database password
    'testing',

    {
        dialect: 'postgres',
        port: 5432,
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
