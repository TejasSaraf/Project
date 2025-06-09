"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.scrollTo(0, 0);
    router.push("/");
  };

  return (
    <nav className="bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center w-40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="90"
              height="30"
              viewBox="0 0 103 33"
              fill="none"
            >
              <path
                d="M0.828125 4.38281H19.7344V9.5H9.57812V15.3984H18.4844V21.0234H9.57812V32H0.828125V4.38281ZM23.9727 2H32.4102V32H23.9727V2ZM38.6211 10.9258H47.0586V32H38.6211V10.9258ZM42.8594 6.58984C42.1172 6.58984 41.4206 6.51172 40.7695 6.35547C40.1185 6.19922 39.5521 5.98438 39.0703 5.71094C38.6016 5.4375 38.224 5.10547 37.9375 4.71484C37.6641 4.32422 37.5273 3.89453 37.5273 3.42578C37.5273 2.90495 37.6641 2.44922 37.9375 2.05859C38.2109 1.65495 38.5885 1.32292 39.0703 1.0625C39.5521 0.802083 40.1185 0.606771 40.7695 0.476562C41.4206 0.346354 42.1237 0.28125 42.8789 0.28125C43.6341 0.28125 44.3372 0.346354 44.9883 0.476562C45.6523 0.606771 46.2253 0.802083 46.707 1.0625C47.1888 1.32292 47.5664 1.65495 47.8398 2.05859C48.1133 2.44922 48.25 2.90495 48.25 3.42578C48.25 3.89453 48.1068 4.32422 47.8203 4.71484C47.5469 5.10547 47.1693 5.4375 46.6875 5.71094C46.2057 5.98438 45.6328 6.19922 44.9688 6.35547C44.3177 6.51172 43.6146 6.58984 42.8594 6.58984ZM60.3398 21.4922C60.3398 22.4427 60.4505 23.2695 60.6719 23.9727C60.9062 24.6758 61.2318 25.2617 61.6484 25.7305C62.0651 26.1862 62.5664 26.5312 63.1523 26.7656C63.7383 26.987 64.3958 27.0977 65.125 27.0977C66.0625 27.0977 66.9479 26.974 67.7812 26.7266C68.6146 26.4661 69.4674 26.1146 70.3398 25.6719L71.5898 30.75C71.0169 31.0495 70.3984 31.3164 69.7344 31.5508C69.0703 31.7721 68.3867 31.9544 67.6836 32.0977C66.9805 32.2539 66.2643 32.3711 65.5352 32.4492C64.819 32.5273 64.1159 32.5664 63.4258 32.5664C61.8503 32.5664 60.3659 32.3451 58.9727 31.9023C57.5794 31.4596 56.3555 30.7826 55.3008 29.8711C54.2591 28.9596 53.4323 27.8073 52.8203 26.4141C52.2083 25.0208 51.9023 23.3737 51.9023 21.4727C51.9023 19.5716 52.2083 17.9245 52.8203 16.5312C53.4323 15.138 54.2591 13.9857 55.3008 13.0742C56.3555 12.1628 57.5794 11.4857 58.9727 11.043C60.3659 10.6003 61.8503 10.3789 63.4258 10.3789C64.1159 10.3789 64.819 10.418 65.5352 10.4961C66.2643 10.5742 66.9805 10.6914 67.6836 10.8477C68.3867 10.9909 69.0703 11.1797 69.7344 11.4141C70.3984 11.6354 71.0169 11.8958 71.5898 12.1953L70.3398 17.2734C69.4674 16.8307 68.6146 16.4857 67.7812 16.2383C66.9479 15.9779 66.0625 15.8477 65.125 15.8477C64.3958 15.8477 63.7383 15.9648 63.1523 16.1992C62.5664 16.4206 62.0651 16.7656 61.6484 17.2344C61.2318 17.7031 60.9062 18.2956 60.6719 19.0117C60.4505 19.7148 60.3398 20.5417 60.3398 21.4922ZM93.2695 10.9258H101.922L93.8945 20.8477L102.312 32H92.5469L86.1992 22.0586L85.5352 22.7422V32H77.0977V2H85.5352V20.3203L93.2695 10.9258Z"
                fill="#00C2FF"
              />
            </svg>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.user?.image || ""}
                        alt={session.user?.name || ""}
                      />
                      <AvatarFallback>
                        {session.user?.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button className="bg-white text-black border border-black">
                <Link href="/signup" className="text-black">Sign up</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
