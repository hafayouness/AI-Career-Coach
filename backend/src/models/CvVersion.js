import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class CVVersion extends Model {}

CVVersion.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cvId: { type: DataTypes.INTEGER, allowNull: false },
    jobOfferId: { type: DataTypes.INTEGER, allowNull: true },
    versionNumber: { type: DataTypes.INTEGER, defaultValue: 1 },

    content: { type: DataTypes.JSONB, allowNull: false },

    changeSummary: { type: DataTypes.JSONB, allowNull: true },

    validated: { type: DataTypes.BOOLEAN, defaultValue: false },
    validatedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: "cv_versions",
    timestamps: true,
    indexes: [{ fields: ["cvId"] }, { fields: ["jobOfferId"] }],
  },
);
