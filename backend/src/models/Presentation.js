import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class Presentation extends Model {}

Presentation.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    cvId: { type: DataTypes.INTEGER, allowNull: true },
    jobOfferId: { type: DataTypes.INTEGER, allowNull: true },
    language: { type: DataTypes.STRING(5), defaultValue: "fr" },

    type: { type: DataTypes.STRING(50), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    sequelize,
    tableName: "presentations",
    timestamps: true,
    indexes: [{ fields: ["userId"] }],
  },
);
