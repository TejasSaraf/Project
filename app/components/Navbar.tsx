"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-black flex items-center justify-between h-14 w-full px-8 py-4 mx-auto">
      <div className="flex items-center">
        <Image src="/flick.png" width={100} height={150} alt="CodeHive Logo" />
      </div>

      <div className="flex items-center gap-4">
        {session ? (
          <>
            <button
              onClick={() => signOut()}
              className="bg-white px-4 py-2 rounded-md"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <div className="bg-white px-4 py-2 rounded-md">
              <Link
                href="/signup"
                className="px-4 py-2 text-base hover:text-gray-300"
              >
                Signup
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
