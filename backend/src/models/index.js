import { sequelize } from "../config/database.js";
import { User } from "./User.js";

export const db = { sequelize, User };
export { User };
