import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class InterviewSession extends Model {}

InterviewSession.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    cvId: { type: DataTypes.INTEGER, allowNull: true },
    jobOfferId: { type: DataTypes.INTEGER, allowNull: true },
    mode: { type: DataTypes.ENUM("training", "real"), defaultValue: "real" },
    status: {
      type: DataTypes.ENUM("in_progress", "completed"),
      defaultValue: "in_progress",
    },
    history: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    report: { type: DataTypes.JSONB, allowNull: true },
  },
  {
    sequelize,
    tableName: "interview_sessions",
    timestamps: true,
  },
);
