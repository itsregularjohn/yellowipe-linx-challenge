import { sign, verify } from "jsonwebtoken";
import { User } from "@yellowipe/schemas";
import { env } from "../../../core";

export function generateToken(user: User): string {
  return sign(
    {
      email: user.email,
    },
    env.JWT_SECRET,
    { expiresIn: "7d", subject: user.id },
  );
}

export function verifyToken(token: string): any {
  try {
    return verify(token, env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
}
