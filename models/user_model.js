import bcrypt from 'bcrypt';

const SALT_ROUND = 10;

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
        User.hasMany(models.Task, { onDelete: 'CASCADE' });
    };

    User.beforeCreate( async (user) => {
        user.password = await bcrypt.hash(user.password, SALT_ROUND);
    })
    
        return User;
    };
    
export default user;
