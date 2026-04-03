import { Router, Request, Response } from "express";
import crypto from "crypto";
import { db } from "../lib/firebaseAdmin";
import * as admin from "firebase-admin";

const router = Router();

router.post("/paystack", async (req: Request, res: Response) => {
  const secret = process.env.PAYSTACK_SECRET_KEY || "";
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(401).send("Unauthorized");
  }

  const event = req.body;

  // Log the event
  await db.collection("webhook_logs").add({
    event: event.event,
    data: event.data,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (event.event === "charge.success") {
    const { reference, metadata, amount } = event.data;
    const userId = metadata?.userId;
    const tokensToCredit = amount / 100; // Example 1:1 conversion

    if (!userId) {
      console.error("No userId in metadata for reference:", reference);
      return res.status(200).send("No userId in metadata");
    }

    try {
      await db.runTransaction(async (transaction) => {
        const userRef = db.collection("users").doc(userId);
        const userDoc = await transaction.get(userRef);

        let previousBalance = 0;
        if (userDoc.exists) {
          previousBalance = userDoc.data()?.balance || 0;
        }

        const newBalance = previousBalance + tokensToCredit;

        // Update user balance
        transaction.set(userRef, { balance: newBalance }, { merge: true });

        // Record in ledger
        const ledgerRef = db.collection("credits_ledger").doc();
        transaction.set(ledgerRef, {
          userId,
          amount: tokensToCredit,
          type: "PURCHASE",
          previousBalance,
          newBalance,
          reference,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Mark buy_request as success
        const buyRequestRef = db.collection("buy_requests").doc(reference);
        transaction.update(buyRequestRef, { status: "success" });
      });

      console.log(
        `Successfully credited ${tokensToCredit} tokens to ${userId}`,
      );
    } catch (error) {
      console.error("Transaction failure:", error);
      return res.status(500).send("Transaction failure");
    }
  }

  res.status(200).send("Webhook processed");
});

export default router;
