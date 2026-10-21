import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class JobAnalysis extends Model {}

JobAnalysis.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    cvId: { type: DataTypes.INTEGER, allowNull: false },
    jobOfferId: { type: DataTypes.INTEGER, allowNull: false },
    matchingScore: { type: DataTypes.INTEGER, allowNull: false },
    matchingDetails: { type: DataTypes.JSONB, allowNull: false },
    recommendations: { type: DataTypes.JSONB, allowNull: true },
  },
  {
    sequelize,
    tableName: "job_analyses",
    timestamps: true,
    indexes: [
      { fields: ["userId"] },
      { fields: ["cvId"] },
      { fields: ["jobOfferId"] },
    ],
  },
);
