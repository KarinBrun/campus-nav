const dns = require("dns");
dns.setServers(["1.1.1.1"]);
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../backend/.env"),
});

const User = require("../backend/models/User");
const Class = require("../backend/models/Class");
const Schedule = require("../backend/models/Schedule");

const RUN_ID = process.env.RUN_ID || "activity50";
const DATABASE = "campusNavTest";

function toMinutes(value) {
  const time = String(value).trim();

  // Handle 24-hour format (e.g., "12:00", "14:30")
  const match24 = time.match(/^(\d{1,2}):(\d{2})$/);

  if (match24) {
    const hours = Number(match24[1]);
    const minutes = Number(match24[2]);

    if (hours > 23 || minutes > 59) return null;

    return hours * 60 + minutes;
  }

  // Handle 12-hour format (e.g., "2:30 PM")
  const match12 = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (match12) {
    let hours = Number(match12[1]);
    const minutes = Number(match12[2]);

    if (hours < 1 || hours > 12 || minutes > 59) return null;

    hours %= 12;

    if (match12[3].toUpperCase() === "PM") {
      hours += 12;
    }

    return hours * 60 + minutes;
  }

  return null;
}

function overlaps(a, b) {
  const sharedDay = a.days.some((day) => b.days.includes(day));

  if (!sharedDay) return false;

  return (
    toMinutes(a.startTime) < toMinutes(b.endTime) &&
    toMinutes(b.startTime) < toMinutes(a.endTime)
  );
}

async function main() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing.");
  }

  const parsed = new URL(uri);

  if (decodeURIComponent(parsed.pathname.slice(1)) !== DATABASE) {
    throw new Error("Refusing to run: URI must target campusNavTest.");
  }

  await mongoose.connect(uri);

  if (mongoose.connection.name !== DATABASE) {
    throw new Error("Connected to an unexpected database.");
  }

  console.log("Connected to:", mongoose.connection.name);

  const users = await User.find({
    email: {
      $regex: `^loadtest-${RUN_ID}-\\d+@example\\.com$`,
    },
  });

  const classes = await Class.find().lean();

  console.log(`Found ${users.length} test users.`);
  console.log(`Found ${classes.length} classes.`);

  if (users.length !== 50 || classes.length !== 413) {
    throw new Error("Unexpected test data counts. No schedules created.");
  }

  let created = 0;
  let skipped = 0;

  for (const user of users) {
    const existing = await Schedule.findOne({ user: user._id });

    if (existing && existing.classes.length > 0) {
    skipped++;
    continue;
    }

    const shuffled = [...classes].sort(() => Math.random() - 0.5);
    const selected = [];
    const target = 4 + Math.floor(Math.random() * 3);

    for (const course of shuffled) {
      if (
        !Array.isArray(course.days) ||
        !course.days.length ||
        toMinutes(course.startTime) === null ||
        toMinutes(course.endTime) === null ||
        toMinutes(course.startTime) >= toMinutes(course.endTime)
      ) {
        continue;
      }

      if (
        selected.some(
          (c) =>
            c.courseCode === course.courseCode ||
            overlaps(c, course)
        )
      ) {
        continue;
      }

      selected.push(course);

      if (selected.length === target) break;
    }

    if (selected.length < 4) {
      console.warn(`Skipping ${user.email}: insufficient classes`);
      skipped++;
      continue;
    }

const classIds = selected.map((c) => c._id);

    if (existing) {
    const result = await Schedule.updateOne(
        { _id: existing._id, classes: { $size: 0 } },
        { $set: { classes: classIds } }
    );

    if (result.modifiedCount === 1) {
        created++;
    } else {
        skipped++;
    }
    } else {
    await Schedule.create({
        user: user._id,
        classes: classIds,
    });

    created++;
    }
  }

  console.log(`Created ${created} schedules.`);
  console.log(`Skipped ${skipped} users.`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
