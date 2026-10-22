import { sequelize } from "../config/database.js";
import { User } from "./User.js";
import { CV } from "./Cv.js";
import { JobOffer } from "./JobOffer.js";

User.hasMany(CV, { foreignKey: "userId", as: "cvs", onDelete: "CASCADE" });
CV.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(JobOffer, {
  foreignKey: "userId",
  as: "jobOffers",
  onDelete: "CASCADE",
});
JobOffer.belongsTo(User, { foreignKey: "userId", as: "user" });

export const db = { sequelize, User, CV, JobOffer };
export { User, CV, JobOffer };
