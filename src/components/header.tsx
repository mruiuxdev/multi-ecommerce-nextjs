"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="flex justify-end items-center p-4 gap-4 h-16 fixed top-0 left-0 w-full">
      <SignedOut>
        <Button asChild variant="default" className="cursor-pointer">
          <SignInButton />
        </Button>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <ModeToggle />
    </header>
  );
}
