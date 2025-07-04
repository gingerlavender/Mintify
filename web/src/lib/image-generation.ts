import { User } from "@/generated/prisma";

export const createURIForUser = (user: User) => {
  if (user) {
    return "bafkreib2imobphpiera2ldobkxdcfij4e7clkc3z7ftghwsng357t4gdka";
  }

  throw new Error("Missing user");
};
