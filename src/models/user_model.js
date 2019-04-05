const bcrypt = require('bcrypt-nodejs');

const SALT_ROUND = 10;

module.exports = function(sequelize, DataTypes){
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
        await bcrypt.hash(user.password, bcrypt.genSaltSync(SALT_ROUND), null, function(err, hash){
            if(err){
                throw new Error("Problema al crear al usuario de forma segura" + err)
            }
            else{
                user.password = hash
            }
        });
    })

    return User;
}

/*
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
}


export default user;
*/
