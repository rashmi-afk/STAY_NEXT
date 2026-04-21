const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");
const Property = require("../models/Property");

const demoHost = {
  name: "StayNext Demo Host",
  email: "demo.host@staynext.com",
  password: "DemoHost@123",
  role: "host",
};

const demoProperties = [
  {
    title: "Ocean Breeze Villa",
    description:
      "A bright sea-facing villa with a private plunge pool, fast Wi-Fi, and a relaxed coastal feel for family getaways.",
    location: "Goa, India",
    pricePerNight: 6200,
    maxGuests: 6,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Pool", "Wi-Fi", "Beach Access", "Kitchen", "Parking"],
  },
  {
    title: "Mountain Mist Cabin",
    description:
      "A cozy hillside cabin designed for peaceful stays, scenic mornings, and small group retreats near the mountains.",
    location: "Manali, India",
    pricePerNight: 4100,
    maxGuests: 4,
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Fireplace", "Mountain View", "Hot Water", "Wi-Fi"],
  },
  {
    title: "Urban Luxe Apartment",
    description:
      "Modern city apartment with stylish interiors, work-friendly setup, and easy access to dining and nightlife.",
    location: "Bengaluru, India",
    pricePerNight: 3500,
    maxGuests: 3,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Air Conditioning", "Wi-Fi", "Workspace", "Elevator"],
  },
  {
    title: "Royal Heritage Haveli",
    description:
      "A heritage-style stay with rich interiors, spacious rooms, and a classic Rajasthan-inspired hosting experience.",
    location: "Jaipur, India",
    pricePerNight: 5400,
    maxGuests: 5,
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Breakfast", "Courtyard", "Parking", "Air Conditioning"],
  },
  {
    title: "Lakeview Glass House",
    description:
      "Panoramic glass stay overlooking the lake, ideal for couples and creators looking for a premium scenic escape.",
    location: "Udaipur, India",
    pricePerNight: 7300,
    maxGuests: 2,
    images: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Lake View", "Breakfast", "Wi-Fi", "Private Deck"],
  },
  {
    title: "Palm Grove Retreat",
    description:
      "A calm retreat surrounded by greenery with open seating, airy rooms, and a slow-living vacation vibe.",
    location: "Kerala, India",
    pricePerNight: 4800,
    maxGuests: 4,
    images: [
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Garden", "Wi-Fi", "Breakfast", "Parking", "Kitchen"],
  },
  {
    title: "Skyline Studio Loft",
    description:
      "A compact but premium studio with skyline views, modern furnishings, and a smooth self-check-in experience for urban travelers.",
    location: "Mumbai, India",
    pricePerNight: 3900,
    maxGuests: 2,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["City View", "Wi-Fi", "Air Conditioning", "Self Check-in"],
  },
  {
    title: "Tea Garden Bungalow",
    description:
      "A peaceful plantation-side bungalow ideal for long walks, cool weather, and laid-back family stays in the hills.",
    location: "Darjeeling, India",
    pricePerNight: 4600,
    maxGuests: 5,
    images: [
      "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Valley View", "Caretaker", "Breakfast", "Parking"],
  },
  {
    title: "Riverside Bamboo Cottage",
    description:
      "A nature-first riverside escape with bamboo interiors, outdoor seating, and a calm setting for couples and small groups.",
    location: "Rishikesh, India",
    pricePerNight: 3300,
    maxGuests: 3,
    images: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["River View", "Wi-Fi", "Balcony", "Breakfast"],
  },
  {
    title: "Executive Business Suite",
    description:
      "A sleek business-friendly suite near commercial hubs with fast internet, workspace comfort, and premium interiors.",
    location: "Hyderabad, India",
    pricePerNight: 4400,
    maxGuests: 3,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Workspace", "Wi-Fi", "Air Conditioning", "Gym Access"],
  },
  {
    title: "Desert Moon Camp",
    description:
      "A luxury camp-style desert stay with cultural evenings, open skies, and a memorable glamping-style guest experience.",
    location: "Jaisalmer, India",
    pricePerNight: 5200,
    maxGuests: 4,
    images: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Cultural Show", "Dinner", "Desert View", "Parking"],
  },
  {
    title: "Art District Serviced Flat",
    description:
      "Colorful serviced apartment close to cafes and galleries, designed for short city stays and creative getaways.",
    location: "Delhi, India",
    pricePerNight: 3700,
    maxGuests: 3,
    images: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Wi-Fi", "Kitchen", "Smart TV", "Housekeeping"],
  },
  {
    title: "Backwater Canoe Stay",
    description:
      "A unique waterside stay near the backwaters with traditional design touches, local meals, and relaxing sunset views.",
    location: "Alleppey, India",
    pricePerNight: 5600,
    maxGuests: 4,
    images: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Backwater View", "Breakfast", "Private Sitout", "Boat Ride"],
  },
  {
    title: "Snowline Family Chalet",
    description:
      "A spacious family chalet with warm wooden interiors, mountain air, and comfortable room layouts for longer holidays.",
    location: "Shimla, India",
    pricePerNight: 5900,
    maxGuests: 6,
    images: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Heater", "Mountain View", "Family Rooms", "Wi-Fi"],
  },
  {
    title: "City Lights Penthouse",
    description:
      "A stylish penthouse with a private terrace, premium interiors, and dramatic night views for a luxury city stay.",
    location: "Pune, India",
    pricePerNight: 6800,
    maxGuests: 4,
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Terrace", "City View", "Wi-Fi", "Kitchen", "Parking"],
  },
  {
    title: "Temple View Residency",
    description:
      "A comfortable and elegant stay near major heritage landmarks with smooth access to local food and sightseeing.",
    location: "Varanasi, India",
    pricePerNight: 3100,
    maxGuests: 3,
    images: [
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Breakfast", "Wi-Fi", "Temple View", "Air Conditioning"],
  },
  {
    title: "Forest Edge Eco Home",
    description:
      "An eco-conscious stay on the forest edge with natural finishes, quiet mornings, and a slow-paced retreat feel.",
    location: "Coorg, India",
    pricePerNight: 4500,
    maxGuests: 4,
    images: [
      "https://images.unsplash.com/photo-1472220625704-91e1462799b2?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Coffee Estate", "Nature Walks", "Wi-Fi", "Parking"],
  },
];

async function seedDemoProperties() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const password = await bcrypt.hash(demoHost.password, 10);

    const host = await User.findOneAndUpdate(
      { email: demoHost.email },
      {
        name: demoHost.name,
        email: demoHost.email,
        password,
        role: demoHost.role,
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      }
    );

    let createdOrUpdated = 0;

    for (const property of demoProperties) {
      await Property.findOneAndUpdate(
        { title: property.title, host: host._id },
        { ...property, host: host._id },
        {
          upsert: true,
          returnDocument: "after",
          setDefaultsOnInsert: true,
        }
      );
      createdOrUpdated += 1;
    }

    console.log("Demo host ready:");
    console.log(`  email: ${demoHost.email}`);
    console.log(`  password: ${demoHost.password}`);
    console.log(`Demo properties created/updated: ${createdOrUpdated}`);
  } catch (error) {
    console.error("Demo seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seedDemoProperties();
