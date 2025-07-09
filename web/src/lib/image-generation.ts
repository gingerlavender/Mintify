import { User } from "@/generated/prisma";

export const createURIForUser = (user: User) => {
  if (user) {
    return "bafkreicz6mvnygsj272scqf2qpdsptn4hqhbs2qmbft4cbno7xat3uqboy";
  }

  throw new Error("Missing user");
};
