import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class User extends Model {}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    preferredLanguage: { type: DataTypes.STRING(5), defaultValue: "fr" },
    resetToken: { type: DataTypes.STRING, allowNull: true },
    resetTokenExpiry: { type: DataTypes.DATE, allowNull: true },
    resetCode: { type: DataTypes.STRING(6), allowNull: true },
    resetCodeExpiry: { type: DataTypes.DATE, allowNull: true },
  },

  {
    sequelize,
    tableName: "users",
    timestamps: true,
  },
);
