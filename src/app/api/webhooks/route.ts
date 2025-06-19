import { User } from "@/generated/prisma";
import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    const eventType = evt.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      const userData = evt.data;
      const currentUser: Partial<User> = {
        id: userData.id,
        name:
          userData.first_name && userData.last_name
            ? `${userData.first_name} ${userData.last_name}`
            : userData.email_addresses[0].email_address,
        email: userData.email_addresses[0].email_address,
        picture: userData.image_url,
      };

      if (!currentUser) {
        return new Response("Invalid user data", { status: 400 });
      }

      await db.user.upsert({
        where: { email: currentUser.email },
        update: currentUser,
        create: {
          name: currentUser.name!,
          id: currentUser.id!,
          email: currentUser.email!,
          picture: currentUser.picture!,
          role: currentUser.role || "USER",
        },
      });

      const clerk = await clerkClient();
      clerk.users.updateUser(userData.id, {
        privateMetadata: {
          role: currentUser.role || "USER",
        },
      });

      return new Response("User synced", { status: 200 });
    }

    if (eventType === "user.deleted") {
      const userId = evt.data.id;

      await db.user.delete({ where: { id: userId } });
    }

    return new Response("Event ignored", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
