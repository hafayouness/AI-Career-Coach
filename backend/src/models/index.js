import { sequelize } from "../config/database.js";
import { User } from "./User.js";
import { CV } from "./CV.js";
import { JobOffer } from "./JobOffer.js";
import { JobAnalysis } from "./JobAnalysis.js";
import { CVVersion } from "./CVVersion.js";
import { Presentation } from "./Presentation.js";
import { Application } from "./Application.js";

import { InterviewQuestion } from "./InterviewQuestion.js";
import { InterviewSession } from "./InterviewSession.js";

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

User.hasMany(Presentation, {
  foreignKey: "userId",
  as: "presentations",
  onDelete: "CASCADE",
});
Presentation.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(InterviewQuestion, {
  foreignKey: "userId",
  as: "questions",
  onDelete: "CASCADE",
});
InterviewQuestion.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(InterviewSession, {
  foreignKey: "userId",
  as: "sessions",
  onDelete: "CASCADE",
});
InterviewSession.belongsTo(User, { foreignKey: "userId", as: "user" });

CV.hasMany(CVVersion, {
  foreignKey: "cvId",
  as: "versions",
  onDelete: "CASCADE",
});
CVVersion.belongsTo(CV, { foreignKey: "cvId", as: "cv" });

CV.hasMany(JobAnalysis, {
  foreignKey: "cvId",
  as: "analyses",
  onDelete: "CASCADE",
});
JobAnalysis.belongsTo(CV, { foreignKey: "cvId", as: "cv" });

CV.hasMany(Presentation, {
  foreignKey: "cvId",
  as: "presentations",
  onDelete: "SET NULL",
});
Presentation.belongsTo(CV, { foreignKey: "cvId", as: "cv" });

CV.hasMany(InterviewQuestion, {
  foreignKey: "cvId",
  as: "questions",
  onDelete: "SET NULL",
});
InterviewQuestion.belongsTo(CV, { foreignKey: "cvId", as: "cv" });

CV.hasMany(InterviewSession, {
  foreignKey: "cvId",
  as: "sessions",
  onDelete: "SET NULL",
});
InterviewSession.belongsTo(CV, { foreignKey: "cvId", as: "cv" });

JobOffer.hasMany(JobAnalysis, {
  foreignKey: "jobOfferId",
  as: "analyses",
  onDelete: "CASCADE",
});
JobAnalysis.belongsTo(JobOffer, { foreignKey: "jobOfferId", as: "jobOffer" });

JobOffer.hasMany(CVVersion, {
  foreignKey: "jobOfferId",
  as: "cvVersions",
  onDelete: "SET NULL",
});
CVVersion.belongsTo(JobOffer, { foreignKey: "jobOfferId", as: "jobOffer" });

JobOffer.hasMany(Presentation, {
  foreignKey: "jobOfferId",
  as: "presentations",
  onDelete: "SET NULL",
});
Presentation.belongsTo(JobOffer, { foreignKey: "jobOfferId", as: "jobOffer" });

JobOffer.hasMany(InterviewQuestion, {
  foreignKey: "jobOfferId",
  as: "questions",
  onDelete: "SET NULL",
});
InterviewQuestion.belongsTo(JobOffer, {
  foreignKey: "jobOfferId",
  as: "jobOffer",
});

JobOffer.hasMany(InterviewSession, {
  foreignKey: "jobOfferId",
  as: "sessions",
  onDelete: "SET NULL",
});
InterviewSession.belongsTo(JobOffer, {
  foreignKey: "jobOfferId",
  as: "jobOffer",
});
User.hasMany(Application, {
  foreignKey: "userId",
  as: "applications",
  onDelete: "CASCADE",
});
Application.belongsTo(User, { foreignKey: "userId", as: "user" });

JobOffer.hasMany(Application, {
  foreignKey: "jobOfferId",
  as: "applications",
  onDelete: "SET NULL",
});
Application.belongsTo(JobOffer, { foreignKey: "jobOfferId", as: "jobOffer" });

CVVersion.hasMany(Application, {
  foreignKey: "cvVersionId",
  as: "applications",
  onDelete: "SET NULL",
});
Application.belongsTo(CVVersion, {
  foreignKey: "cvVersionId",
  as: "cvVersion",
});

export const db = {
  sequelize,
  User,
  CV,
  JobOffer,
  JobAnalysis,
  CVVersion,
  Presentation,

  InterviewQuestion,
  InterviewSession,
  Application,
};

export {
  User,
  CV,
  JobOffer,
  JobAnalysis,
  CVVersion,
  Presentation,
  InterviewQuestion,
  InterviewSession,
  Application,
};
