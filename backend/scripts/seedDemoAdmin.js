const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");

const demoAdmin = {
  name: "StayNext Demo Admin",
  email: "demo.admin@staynext.com",
  password: "DemoAdmin@123",
  role: "admin",
  hostApprovalStatus: "not-applicable",
};

async function seedDemoAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const password = await bcrypt.hash(demoAdmin.password, 10);

    await User.findOneAndUpdate(
      { email: demoAdmin.email },
      {
        name: demoAdmin.name,
        email: demoAdmin.email,
        password,
        role: demoAdmin.role,
        hostApprovalStatus: demoAdmin.hostApprovalStatus,
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      }
    );

    console.log("Demo admin ready:");
    console.log(`  email: ${demoAdmin.email}`);
    console.log(`  password: ${demoAdmin.password}`);
  } catch (error) {
    console.error("Demo admin seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seedDemoAdmin();
