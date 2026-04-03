import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import { join } from "path";

// Load env from server directory
dotenv.config({ path: join(__dirname, "../.env") });

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

const items = [
  {
    name: "Purple Haze Indoor",
    category: "indoor",
    price: 150,
    description:
      "Premium indoor-grown Purple Haze. High THC, sweet berry aroma.",
    image:
      "https://images.unsplash.com/photo-1596431940901-4470876f2b96?auto=format&fit=crop&q=80&w=400",
    attributes: { thc: "22%", type: "Sativa" },
    stock: 50,
  },
  {
    name: "OG Kush Greenhouse",
    category: "greenhouse",
    price: 100,
    description:
      "Sun-assisted greenhouse OG Kush. Balanced hybrid, earthy notes.",
    image:
      "https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&q=80&w=400",
    attributes: { thc: "18%", type: "Hybrid" },
    stock: 100,
  },
  {
    name: "Durban Poison Outdoor",
    category: "outdoor",
    price: 60,
    description:
      "Pure South African Sativa. Sun-grown, energetic and uplifted.",
    image:
      "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&q=80&w=400",
    attributes: { thc: "15%", type: "Sativa" },
    stock: 200,
  },
  {
    name: "Northern Lights Indoor",
    category: "indoor",
    price: 140,
    description: "Classic Indica. Dense buds, resinous, deep relaxation.",
    image:
      "https://images.unsplash.com/photo-1602166943806-0563df330396?auto=format&fit=crop&q=80&w=400",
    attributes: { thc: "20%", type: "Indica" },
    stock: 45,
  },
];

async function seed() {
  console.log("Seeding MarsGrow Store Items...");
  const batch = db.batch();

  for (const item of items) {
    const ref = db.collection("items").doc();
    batch.set(ref, {
      ...item,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log("Seeding complete! Added 4 premium strains.");
  process.exit();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
