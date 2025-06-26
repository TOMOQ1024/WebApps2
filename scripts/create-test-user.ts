import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const username = "admin";
    const password = "password";
    const hash = createHash("sha512");
    const passhash = hash.update(password).digest("hex");

    // 既存のユーザーを確認
    const existingUser = await prisma.user.findFirst({
      where: { name: username },
    });

    if (existingUser) {
      // 既存のユーザーのパスワードを更新
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: { passhash: passhash },
      });
      console.log("Test user updated:", updatedUser);
    } else {
      // 新しいユーザーを作成
      const newUser = await prisma.user.create({
        data: {
          name: username,
          passhash: passhash,
        },
      });
      console.log("Test user created:", newUser);
    }
  } catch (error) {
    console.error("Error creating test user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
