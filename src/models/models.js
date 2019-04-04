
import Sequelize from 'sequelize';
import bcrypt from 'bcrypt';
const list_model = require('./list_model')
const user_model = require('./user_model')
const task_model = require('./task_model')


const SALT_ROUND = 10;

const sequelize = new Sequelize(
    //database
    process.env.DB_NAME || 'tstododb',

    //database user
    process.env.DB_USER || 'postgres',

    //database password
    process.env.DB_PASS || 'testing',

    {
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'postgres',
        port: parseInt(process.env.DB_PORT || '5432'),
    },
);

/*
const list = (sequelize, DataTypes) => {
    const List = sequelize.define('list', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        public: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        }
    });

    List.associate = models => {
        List.hasMany(models.Task, { onDelete: 'CASCADE' });
        List.belongsTo(models.User, { onDelete: 'SET NULL' })
    };

    return List;
};


const task = (sequelize, DataTypes) => {
    const Task = sequelize.define('task', {
        text: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'No puede añadirse una tarea vacía'
                }
            },
        },
        done: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    });
    Task.associate = models => {
        Task.belongsTo(models.List, { onDelete: 'CASCADE' });
        Task.belongsTo(models.User, { onDelete: 'SET NULL' });
    };
    return Task;
};




const user = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true,
                isEmail: true,
            },
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [3, 16],
            },
        },
    });

    User.associate = models => {
        User.hasMany(models.Task, { onDelete: 'SET NULL' });
        User.hasMany(models.List, { onDelete: '' });
    };

    User.beforeCreate(async (user) => {
        user.password = await bcrypt.hash(user.password, SALT_ROUND);
    })

    return User;
};
*/


const models = {
    List: list_model,
    Task: task_model,
    User: user_model
};

Object.keys(models).forEach(key => {
    if ('associate' in models[key]) {
        models[key].associate(models);
    }
});

export { sequelize };

export default models;
