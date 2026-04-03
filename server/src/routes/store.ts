import { Router, Request, Response } from "express";
import { db } from "../lib/firebaseAdmin";
import * as admin from "firebase-admin";
import { verifyToken } from "../middleware/auth";

const router = Router();

// Storefront - Fetch items
router.get("/items", async (req: Request, res: Response) => {
  try {
    const itemsSnapshot = await db.collection("items").get();
    const items = itemsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// Checkout - Purchase multiple items with tokens
router.post("/checkout", verifyToken, async (req: Request, res: Response) => {
  const { itemIds } = req.body; // Expecting an array of itemIds
  const userId = (req as any).user.uid;

  if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
    return res.status(400).json({ error: "itemIds array is required" });
  }

  try {
    const result = await db.runTransaction(async (transaction) => {
      let totalPrice = 0;
      const itemsToBuy: any[] = [];

      for (const itemId of itemIds) {
        const itemRef = db.collection("items").doc(itemId);
        const itemDoc = await transaction.get(itemRef);

        if (!itemDoc.exists) {
          throw new Error(`Item ${itemId} not found`);
        }

        const itemData = itemDoc.data();
        totalPrice += itemData?.price || 0;
        itemsToBuy.push({
          id: itemId,
          name: itemData?.name,
          price: itemData?.price,
        });
      }

      const userRef = db.collection("users").doc(userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists || (userDoc.data()?.balance || 0) < totalPrice) {
        throw new Error("Insufficient balance for entire cart");
      }

      const previousBalance = userDoc.data()?.balance || 0;
      const newBalance = previousBalance - totalPrice;

      // Deduct balance
      transaction.update(userRef, { balance: newBalance });

      // Record in ledger
      const ledgerRef = db.collection("credits_ledger").doc();
      transaction.set(ledgerRef, {
        userId,
        amount: -totalPrice,
        type: "REDEMPTION",
        previousBalance,
        newBalance,
        itemIds,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Create Order & Collection Code
      const collectionCode = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();
      const orderRef = db.collection("orders").doc();
      const orderData = {
        userId,
        items: itemsToBuy,
        totalPrice,
        collectionCode,
        status: "PENDING",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      transaction.set(orderRef, orderData);

      return { orderId: orderRef.id, collectionCode };
    });

    res.json(result);
  } catch (error: any) {
    console.error("Checkout error:", error);
    res.status(400).json({ error: error.message });
  }
});

// User Order History
router.get("/orders", verifyToken, async (req: Request, res: Response) => {
  const userId = (req as any).user.uid;
  const limit = parseInt(req.query.limit as string) || 5;
  const page = parseInt(req.query.page as string) || 1;
  const offset = (page - 1) * limit;

  try {
    const ordersSnapshot = await db
      .collection("orders")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset(offset)
      .get();

    const orders = ordersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // For total count (simple for now)
    const countSnapshot = await db
      .collection("orders")
      .where("userId", "==", userId)
      .count()
      .get();
    const total = countSnapshot.data().count;

    res.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

export default router;
