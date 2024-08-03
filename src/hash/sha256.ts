import { encodeHex } from "@std/encoding";

export const sha256 = async (input: string): Promise<string> => {
  const buffer = new TextEncoder().encode(input);

  return encodeHex(
    await crypto.subtle.digest("SHA-256", buffer),
  );
};
