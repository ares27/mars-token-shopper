import { Router, Request, Response } from "express";
import { db } from "../lib/firebaseAdmin";
import * as admin from "firebase-admin";
import { verifyToken, isAdmin } from "../middleware/auth";

const router = Router();

// Redemption scanner - Staff-only
router.post("/redeem", verifyToken, async (req: Request, res: Response) => {
  const { collectionCode } = req.body;
  const staffId = (req as any).user.uid;

  if (!collectionCode) {
    return res.status(400).json({ error: "collectionCode is required" });
  }

  try {
    const result = await db.runTransaction(async (transaction) => {
      // Find order with matching collectionCode and PENDING status
      const orderQuery = db
        .collection("orders")
        .where("collectionCode", "==", collectionCode)
        .where("status", "==", "PENDING");

      const orderSnapshot = await transaction.get(orderQuery);

      if (orderSnapshot.empty) {
        throw new Error("Invalid or already redeemed collection code");
      }

      const orderRef = orderSnapshot.docs[0].ref;
      const orderData = orderSnapshot.docs[0].data();

      // Mark order as collected
      transaction.update(orderRef, {
        status: "COLLECTED",
        collectedAt: admin.firestore.FieldValue.serverTimestamp(),
        staffId,
      });

      return { orderId: orderRef.id, itemName: orderData.itemName };
    });

    res.json({ message: "Redemption successful!", ...result });
  } catch (error: any) {
    console.error("Redemption error:", error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
