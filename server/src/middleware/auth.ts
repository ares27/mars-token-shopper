import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/firebaseAdmin";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = (req as any).user;
  if (user?.email?.endsWith("@marsgrow.com")) {
    next();
  } else {
    // Also check Firestore for admin role if email check isn't enough
    res.status(403).json({ error: "Forbidden: Admin access required" });
  }
};
