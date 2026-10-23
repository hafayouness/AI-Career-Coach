import { sequelize } from "../config/database.js";
import { User } from "./User.js";
import { CV } from "./CV.js";
import { JobOffer } from "./JobOffer.js";
import { JobAnalysis } from "./JobAnalysis.js";

User.hasMany(CV, { foreignKey: "userId", as: "cvs", onDelete: "CASCADE" });
CV.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(JobOffer, {
  foreignKey: "userId",
  as: "jobOffers",
  onDelete: "CASCADE",
});
JobOffer.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(JobAnalysis, {
  foreignKey: "userId",
  as: "analyses",
  onDelete: "CASCADE",
});
JobAnalysis.belongsTo(User, { foreignKey: "userId", as: "user" });

CV.hasMany(JobAnalysis, {
  foreignKey: "cvId",
  as: "analyses",
  onDelete: "CASCADE",
});
JobAnalysis.belongsTo(CV, { foreignKey: "cvId", as: "cv" });

JobOffer.hasMany(JobAnalysis, {
  foreignKey: "jobOfferId",
  as: "analyses",
  onDelete: "CASCADE",
});
JobAnalysis.belongsTo(JobOffer, { foreignKey: "jobOfferId", as: "jobOffer" });

export const db = { sequelize, User, CV, JobOffer, JobAnalysis };
export { User, CV, JobOffer, JobAnalysis };
