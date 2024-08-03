import { defaultAvatarImage } from "../config/values.ts";
import { sha256 } from "../hash/sha256.ts";

export const generateGravatarImageLink = async (
  email: string,
  size: number = 64,
) => {
  const hashedEmail = await sha256(email);
  return `https://www.gravatar.com/avatar/${hashedEmail}?s=${size}&d=${defaultAvatarImage}`;
};
