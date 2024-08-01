import { crypto } from "@std/crypto";
import { encodeHex } from "@std/encoding/hex";
import { defaultAvatarImage } from "../config/values.ts";

export const generateGravatarImageLink = async (
  email: string,
  size: number = 64,
) => {
  const emailBuffer = new TextEncoder().encode(email);
  const hashedEmail = encodeHex(
    await crypto.subtle.digest("SHA-256", emailBuffer),
  );
  return `https://www.gravatar.com/avatar/${hashedEmail}?s=${size}&d=${defaultAvatarImage}`;
};
