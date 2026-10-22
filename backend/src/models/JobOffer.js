import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class JobOffer extends Model {}

JobOffer.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    company: { type: DataTypes.STRING(200), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: false },
    sourceUrl: { type: DataTypes.STRING(500), allowNull: true },
    location: { type: DataTypes.STRING(200), allowNull: true },
    requirements: { type: DataTypes.JSONB, allowNull: true },
    parsingStatus: {
      type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
      defaultValue: "pending",
    },
    parsingError: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: "job_offers",
    timestamps: true,
    indexes: [{ fields: ["userId"] }],
  },
);
