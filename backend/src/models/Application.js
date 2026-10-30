import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class Application extends Model {}

Application.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    jobOfferId: { type: DataTypes.INTEGER, allowNull: true },
    cvVersionId: { type: DataTypes.INTEGER, allowNull: true },
    status: {
      type: DataTypes.ENUM(
        "to_prepare",
        "sent",
        "interview_scheduled",
        "interview_done",
        "offer_received",
        "rejected",
        "withdrawn",
      ),
      defaultValue: "to_prepare",
    },
    notes: { type: DataTypes.TEXT, allowNull: true },
    appliedAt: { type: DataTypes.DATE, allowNull: true },
    interviewAt: { type: DataTypes.DATE, allowNull: true },
    nextAction: { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    sequelize,
    tableName: "applications",
    timestamps: true,
    indexes: [{ fields: ["userId"] }, { fields: ["status"] }],
  },
);
