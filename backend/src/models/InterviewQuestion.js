import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class InterviewQuestion extends Model {}

InterviewQuestion.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    cvId: { type: DataTypes.INTEGER, allowNull: true },
    jobOfferId: { type: DataTypes.INTEGER, allowNull: true },
    category: {
      type: DataTypes.ENUM("RH", "Technique", "Comportemental", "Projet"),
      allowNull: false,
    },
    questionText: { type: DataTypes.TEXT, allowNull: false },
    objective: { type: DataTypes.TEXT, allowNull: true }, // Objectif du recruteur
    method: { type: DataTypes.TEXT, allowNull: true }, // Méthode de réponse (ex: STAR)
    exampleAnswer: { type: DataTypes.TEXT, allowNull: true }, // Exemple de réponse
    mistakesToAvoid: { type: DataTypes.TEXT, allowNull: true }, // Erreurs à éviter
  },
  {
    sequelize,
    tableName: "interview_questions",
    timestamps: true,
    indexes: [{ fields: ["userId"] }],
  },
);
