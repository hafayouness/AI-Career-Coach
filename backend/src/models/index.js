import { sequelize } from "../config/database.js";
import { User } from "./User.js";
import { CV } from "./Cv.js";

User.hasMany(CV, { foreignKey: "userId", as: "cvs", onDelete: "CASCADE" });
CV.belongsTo(User, { foreignKey: "userId", as: "user" });

export const db = { sequelize, User, CV };
export { User, CV };
