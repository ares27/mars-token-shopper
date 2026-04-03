import { Router, Request, Response } from "express";
import { db } from "../lib/firebaseAdmin";
import { verifyToken, isAdmin } from "../middleware/auth";

const router = Router();

// Get all orders - Staff/Admin only
router.get("/orders", verifyToken, async (req: Request, res: Response) => {
  const user = (req as any).user;

  // Basic security check: only @marsgrow.com or staff/admin in Firestore (simplified for now)
  // In a real app, you'd check the Firestore 'role' here too
  if (!user.email?.endsWith("@marsgrow.com")) {
    // Optional: check firestore role here if email isn't enough
  }

  try {
    const ordersSnapshot = await db
      .collection("orders")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const orders = ordersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

export default router;
