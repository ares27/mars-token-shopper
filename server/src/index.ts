import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import webhooksRouter from "./routes/webhooks";
import storeRouter from "./routes/store";
import redemptionRouter from "./routes/redemption";
import adminRouter from "./routes/admin";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/webhooks", webhooksRouter);
app.use("/api/store", storeRouter);
app.use("/api/redemption", redemptionRouter);
app.use("/api/admin", adminRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`MarsGrow server running on http://localhost:${PORT}`);
});
