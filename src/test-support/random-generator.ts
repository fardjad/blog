import { encodeHex } from "@std/encoding";

export const generateRandomString = (length: number) => {
  const array = new Uint8Array(length / 2);
  crypto.getRandomValues(array);
  return encodeHex(array);
};
