import app from "./app";
import sequelize from "./config/database";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`server is listening at PORT ${PORT}`);
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to database successfully");
  } catch (error) {
    console.log("database connection error", error);
  }
};
connectDB();
