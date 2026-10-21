import "dotenv/config";
import { config } from "dotenv";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is required");
}

async function seed() {
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db();

  console.log("Seeding database...");

  await Promise.all([
    db.collection("products").deleteMany({}),
    db.collection("categories").deleteMany({}),
    db.collection("mediaItems").deleteMany({}),
    db.collection("storySections").deleteMany({}),
    db.collection("events").deleteMany({}),
    db.collection("pageContent").deleteMany({}),
    db.collection("users").deleteMany({}),
  ]);

  await db.collection("products").insertMany([
    {
      type: "home",
      title: "DARK ENERGY",
      tagline: "BRIGHTENS THE WORLD",
      image: "/images/Bitmap.png",
      link: "#",
      sortOrder: 1,
    },
    {
      type: "home",
      title: "ROBOTICS",
      tagline: "THEY ARE HERE AND THEY PLAY",
      image: "/images/Bitmap-1.png",
      link: "/robotics",
      sortOrder: 2,
    },
    {
      type: "home",
      title: "STRANGERS RISE",
      tagline: "ASCENSION GOES TECHNICAL",
      image: "/images/shutterstock_211091626.png",
      link: "#",
      sortOrder: 3,
    },
    {
      type: "robotics",
      title: "Globomantics Mark 1",
      tagline: "Defense-grade AI robotics",
      description:
        "Wars can be fought and won by value of your Globomantics Mark 1 upgrade selections.",
      image: "/images/shutterstock_645747736.png",
      link: "/robotics",
      sortOrder: 1,
    },
    {
      type: "robotics",
      title: "U bot v1",
      tagline: "It's U but better!",
      description:
        "Customize our U class humanoid robotic platform to be an exact physical and behavioral replica of yourself.",
      image: "/images/shutterstock_662279290.png",
      link: "/robotics",
      sortOrder: 2,
    },
  ]);

  await db.collection("categories").insertMany([
    {
      title: "medicine",
      image: "/images/shutterstock_734412034.png",
      sortOrder: 1,
    },
    {
      title: "AGRICULTURE",
      image: "/images/shutterstock_725256820.png",
      sortOrder: 2,
    },
    {
      title: "MANUFACTURING",
      image: "/images/shutterstock_645747736.png",
      sortOrder: 3,
    },
    {
      title: "ASSISTANTS",
      image: "/images/shutterstock_662279290.png",
      sortOrder: 4,
    },
  ]);

  await db.collection("mediaItems").insertMany([
    {
      title: "Sic Transit Gloria Mundi",
      body: "At the deepest level of its core, technology embodies the circle of life. And from an old age Larry Shepard unlearned how to harness that circle and perpetuate it through more technology. I need more copy here. At the deepest level of its core, technology embodies the circle of life. And from an old age Larry Shepard unlearned how to harness that circle and perpetuate it through more technology. At the deepest level of its core, technology embodies the circle of life.",
      image: "/images/girl.png",
      layout: "image-right",
      sortOrder: 1,
    },
    {
      title: "Sic Transit Gloria Mundi",
      body: "At the deepest level of its core, technology embodies the circle of life. And from an old age Larry Shepard unlearned how to harness that circle and perpetuate it through more technology. I need more copy here. At the deepest level of its core, technology embodies the circle of life. And from an old age Larry Shepard unlearned how to harness that circle and perpetuate it through more technology. At the deepest level of its core, technology embodies the circle of life.",
      image: "/images/sec2.jpg",
      layout: "image-left",
      sortOrder: 2,
    },
    {
      title: "Sic Transit Gloria Mundi",
      body: "At the deepest level of its core, technology embodies the circle of life. And from an old age Larry Shepard unlearned how to harness that circle and perpetuate it through more technology. I need more copy here. At the deepest level of its core, technology embodies the circle of life. And from an old age Larry Shepard unlearned how to harness that circle and perpetuate it through more technology. At the deepest level of its core, technology embodies the circle of life.",
      image: "/images/sec3.jpg",
      layout: "image-right",
      sortOrder: 3,
    },
  ]);

  await db.collection("storySections").insertMany([
    {
      title: "Sic Transit Gloria Mundi",
      paragraphs: [
        "At the deepest level of its core, technology embodies the circle of life. And from an old age Larry Shepard unlearned how to harness that circle and perpetuate it through more technology. He was graduating preschool, shaking his instructor’s hand while holding up his brand new diploma when he saw his mother drop her phone. The device caught a twinkle in Larry’s eyes as it fell, somehow still holding Larry perfectly in frame to immortialize the moment. That was the moment, the exact moment, when Larry knew what he would fix with his grant money. The world would never again feel the stinging pain experienced in one’s belly when a smart phone hits the ground. Never again would a parent have to worry about their two year old practicing their dropping skills with their pocket technology. Localized anti gravity was born and neither phone nor Larry ever touched the ground again.",
        "It has been nearly 40 years since Larry left us, but the impact of his genius is still felt today. They say that two brains are better than one, which is why Larry left us with copies of himself. Three perfect copies of his beautiful grey matter captured in the neural network technology that he helped perfect. Two brains are better than one, but nothing beats three Larrys.",
      ],
      sidebarTitle: "FIRST PAPER DATA CENTER",
      sidebarBody:
        "The boxes were stacked high and dry with no order whatsoever. The facility ran for 300 nano seconds before it disintegrated. This is the only known surviving photograph.",
      sidebarImage: "/images/shutterstock_252243790.png",
      sortOrder: 1,
    },
    {
      title: "The Journey Continued",
      paragraphs: [
        "Larry may have been the innovative entreprenuerial spark that lit the fire of progress and unified the seven islands on this ball of water hurdling through space, but that fire still rages. From the gamma mutation labs on mercury to the cryolabs of Pluto and Eres, Globomantics barrels forward into the unkown, into the impossible, the endless wonder of thoughts unthought... into the future. As a leader of the sentient beings on this vibration of string theory we drive onward, boldly trying the untried and solving the unresolvable unsolvable.",
        "Earth-anity and Beyond\n\nIt will be within our lifetime that lifetime ceases to exist. Confusion will be untangled and conflicts defeated through context. All lifeforms shall be unified and commited to a vision of othe future. With the advent of the Doolittle Algorithm, not even our dreams are the limit. A new level of harmony, undreamable to our predecessors, carries us down the stream of conciousnes and into the recesses of the deepest shadows of the largest questions. What is it to be? For that is in fact, the question.",
      ],
      sidebarTitle: "LARRY SHAPARD, CEO & MAGICIAN",
      sidebarBody: "The man, the myth, the legend.",
      sidebarImage: "/images/shutterstock_564197512.png",
      sortOrder: 2,
    },
  ]);

  await db.collection("events").insertOne({
    title: "FUTURE",
    subtitle: "CONFERENCE",
    description:
      "Tickets are selling fast get yours today and be there in the future",
    ctaLabel: "SIGN UP TODAY",
    active: true,
  });

  await db.collection("pageContent").insertMany([
    {
      slug: "home",
      title: "THE FUTURE",
      subtitle: "WAS FIVE MINUTES AGO",
      description: "We were there and it is going to be epic",
      heroImage: "/images/hero-image.png",
    },
    {
      slug: "our-story",
      title: "HUMBLE BEGINNINGS",
      subtitle: "A STORY OF LIFE",
      description:
        "How we became the farmers of the future, tilling the technology of tomorrow today.",
      heroImage: "/images/banner.png",
    },
    {
      slug: "robotics",
      title: "ROBOTICS",
      subtitle: "ALSO A STORY OF LIFE",
      description: "Life evolves, robotics are no different.",
      heroImage: "/images/hero.png",
      paragraphs: [
        "Building on existing research and working closely with the defense department and other defense industry partners, we are a proud to announce a new breakthrough that represents a massive leap forward in artificial intelligence and advanced robotics.",
        "This elegant combination technologies will revolutionize the human condition, changing everything from the way we protect our countries and police our people to how you clean your home.\n\nNo longer do the countries of the world have to settle disputes with needless expenditure of human life.  Now wars can be fought and won by value of your Globomantics Mark 1 upgrade selections.  More than any other time in history, wars will be won by the willingness to spend rather than the strength of will of the individual.",
        "“We look forward to fulfilling your human replacement needs.”",
        "But the applications don’t end there. Tired of being on the hook for being yourself 24/7 365?  Enter U bot v1.  It’s U but better! Using a proprietary DNA and behavior analysis technology, you can now customize our U class humanoid robotic platform to be an exact physical and behavioral replica of yourself!  No more washing dishes, video chatting with your i-laws, or watching your children, replace yourself with U!",
        "No matter the applications, all Globomantics Mark 1 and U line robots are hard coded to protect human life at all cost, even if the threat is humans themselves.  You should never feel safer than when integrating our robtics platforms into all aspects of your life and community.",
        "We look forward to fulfilling your human replacement needs.",
      ],
    },
    {
      slug: "media",
      title: "WATCH THIS VIDEO",
      subtitle: "WE DO THINGS IN IT",
      description: "Click for inspiration at cosmic levels",
      heroImage: "/images/banner3.png",
    },
  ]);

  const email = process.env.ADMIN_EMAIL || "admin@globomantics.local";
  const password = process.env.ADMIN_PASSWORD || "changeme";
  const passwordHash = await bcrypt.hash(password, 10);

  await db.collection("users").insertOne({
    email,
    passwordHash,
    name: "Admin",
  });

  console.log(`Seeded admin user: ${email}`);
  console.log("Seed complete.");
  await client.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
