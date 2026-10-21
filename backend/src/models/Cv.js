import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class CV extends Model {}

CV.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    originalFileName: { type: DataTypes.STRING(255), allowNull: false },
    storagePath: { type: DataTypes.STRING(500), allowNull: false },
    mimeType: { type: DataTypes.STRING(100), allowNull: false },
    fileSize: { type: DataTypes.INTEGER, allowNull: false },
    extractedText: { type: DataTypes.TEXT, allowNull: true },
    parsedData: { type: DataTypes.JSONB, allowNull: true },
    processingStatus: {
      type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
      defaultValue: "pending",
    },
    processingError: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: "cvs",
    timestamps: true,
    indexes: [{ fields: ["userId"] }],
  },
);
