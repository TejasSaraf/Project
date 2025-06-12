"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must have at least 8 characters"),
});

type SignInValues = z.infer<typeof FormSchema>;

const SignInForm = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInValues) => {
    const result = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });

    if (result?.error) {
      console.error("SignIn Error:", result.error);
    } else if (result?.ok && !result.error) {
      router.push("/");
    }
  };

  return (
    <div className="background min-h-screen">
      <div className="flex justify-between items-center pt-15 px-50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="90"
          height="30"
          viewBox="0 0 90 30"
          fill="none"
        >
          <path
            d="M7.776 22.192C6.368 22.192 5.024 22 3.744 21.616C2.48533 21.232 1.49333 20.7627 0.768 20.208L2.048 17.776C2.77333 18.2667 3.66933 18.6827 4.736 19.024C5.80267 19.3653 6.89067 19.536 8 19.536C9.42933 19.536 10.4533 19.3333 11.072 18.928C11.712 18.5227 12.032 17.9573 12.032 17.232C12.032 16.6987 11.84 16.2827 11.456 15.984C11.072 15.6853 10.56 15.4613 9.92 15.312C9.30133 15.1627 8.608 15.0347 7.84 14.928C7.072 14.8 6.304 14.6507 5.536 14.48C4.768 14.288 4.064 14.032 3.424 13.712C2.784 13.3707 2.272 12.912 1.888 12.336C1.504 11.7387 1.312 10.9493 1.312 9.968C1.312 8.944 1.6 8.048 2.176 7.28C2.752 6.512 3.56267 5.92533 4.608 5.52C5.67467 5.09333 6.93333 4.88 8.384 4.88C9.49333 4.88 10.6133 5.01867 11.744 5.296C12.896 5.552 13.8347 5.92533 14.56 6.416L13.248 8.848C12.48 8.336 11.68 7.984 10.848 7.792C10.016 7.6 9.184 7.504 8.352 7.504C7.008 7.504 6.00533 7.728 5.344 8.176C4.68267 8.60267 4.352 9.15733 4.352 9.84C4.352 10.416 4.544 10.864 4.928 11.184C5.33333 11.4827 5.84533 11.7173 6.464 11.888C7.104 12.0587 7.808 12.208 8.576 12.336C9.344 12.4427 10.112 12.592 10.88 12.784C11.648 12.9547 12.3413 13.2 12.96 13.52C13.6 13.84 14.112 14.288 14.496 14.864C14.9013 15.44 15.104 16.208 15.104 17.168C15.104 18.192 14.8053 19.0773 14.208 19.824C13.6107 20.5707 12.768 21.1573 11.68 21.584C10.592 21.9893 9.29067 22.192 7.776 22.192ZM18.0713 29.752V13.84C18.0713 12.6613 18.2866 11.5507 18.7173 10.508C19.1479 9.46533 19.7373 8.57 20.4853 7.822C21.2333 7.05133 22.1173 6.45067 23.1373 6.02C24.1573 5.56667 25.2453 5.34 26.4013 5.34C27.5573 5.34 28.6339 5.56667 29.6313 6.02C30.6513 6.45067 31.5353 7.05133 32.2833 7.822C33.0539 8.59267 33.6546 9.49933 34.0853 10.542C34.5159 11.562 34.7313 12.6613 34.7313 13.84C34.7313 15.0187 34.5159 16.1293 34.0853 17.172C33.6773 18.192 33.0993 19.0873 32.3513 19.858C31.6033 20.6287 30.7193 21.2407 29.6993 21.694C28.6793 22.1247 27.5799 22.34 26.4013 22.34C24.9506 22.34 23.6019 22 22.3553 21.32V18.26C23.4659 19.076 24.7806 19.484 26.2993 19.484C27.1153 19.484 27.8519 19.348 28.5093 19.076C29.1893 18.7813 29.7559 18.3847 30.2093 17.886C30.6853 17.3873 31.0479 16.798 31.2973 16.118C31.5466 15.4153 31.6713 14.656 31.6713 13.84C31.6713 13.024 31.5466 12.276 31.2973 11.596C31.0479 10.8933 30.6966 10.2927 30.2433 9.794C29.7899 9.29533 29.2346 8.91 28.5773 8.638C27.9426 8.34333 27.2173 8.196 26.4013 8.196C25.6079 8.196 24.8826 8.332 24.2253 8.604C23.5906 8.876 23.0353 9.26133 22.5593 9.76C22.1059 10.2587 21.7546 10.8593 21.5053 11.562C21.2559 12.242 21.1313 13.0013 21.1313 13.84V29.752H18.0713ZM37.692 22V13.264C37.692 10.8107 38.1506 9.11467 39.068 8.176C39.516 7.70667 40.06 7.35467 40.7 7.12C41.34 6.88533 41.8946 6.74667 42.364 6.704C42.8546 6.66133 43.516 6.64 44.348 6.64H47.164V9.328H43.772C43.3453 9.328 43.0146 9.33867 42.78 9.36C42.5453 9.38133 42.268 9.456 41.948 9.584C41.628 9.712 41.3506 9.91467 41.116 10.192C40.7106 10.704 40.508 11.728 40.508 13.264V22H37.692ZM53.3945 22H50.5785V9.328H47.9545L49.2345 6.64H53.3945V22ZM50.4505 3.44C50.1731 3.07733 50.0345 2.68267 50.0345 2.256C50.0345 1.82933 50.1731 1.44533 50.4505 1.104C50.7278 0.741332 51.1545 0.559999 51.7305 0.559999C52.3065 0.559999 52.7331 0.741332 53.0105 1.104C53.2878 1.44533 53.4265 1.82933 53.4265 2.256C53.4265 2.68267 53.2878 3.07733 53.0105 3.44C52.7331 3.78133 52.3065 3.952 51.7305 3.952C51.1545 3.952 50.7278 3.78133 50.4505 3.44ZM67.72 4.88C69.1066 4.88 70.3226 5.14667 71.368 5.68C72.4346 6.21333 73.2666 7.024 73.864 8.112C74.4613 9.2 74.76 10.576 74.76 12.24V22H71.688V12.592C71.688 10.9493 71.2826 9.712 70.472 8.88C69.6826 8.048 68.5626 7.632 67.112 7.632C66.024 7.632 65.0746 7.84533 64.264 8.272C63.4533 8.69867 62.824 9.328 62.376 10.16C61.9493 10.992 61.736 12.0267 61.736 13.264V22H58.664V5.04H61.608V9.616L61.128 8.4C61.6826 7.29067 62.536 6.42667 63.688 5.808C64.84 5.18933 66.184 4.88 67.72 4.88ZM86.2692 22.192C84.5625 22.192 83.2399 21.7333 82.3012 20.816C81.3625 19.8987 80.8932 18.5867 80.8932 16.88V1.328H83.9652V16.752C83.9652 17.6693 84.1892 18.3733 84.6372 18.864C85.1065 19.3547 85.7679 19.6 86.6212 19.6C87.5812 19.6 88.3812 19.3333 89.0212 18.8L89.9812 21.008C89.5119 21.4133 88.9465 21.712 88.2852 21.904C87.6452 22.096 86.9732 22.192 86.2692 22.192ZM78.0132 7.568V5.04H88.8292V7.568H78.0132Z"
            fill="black"
          />
        </svg>

        <div className="flex items-center">
          <p className="mr-2 text-sm">Don't have an account?</p>
          <Link
            href="/signup"
            className="bg-[rgb(0,194,255)] px-3 py-1 text-xs text-white rounded-xl shadow-sm"
          >
            Signup
          </Link>
        </div>
      </div>
      <div className="flex items-center justify-center flex-col pt-30 ">
        <h1 className="text-lg text-center mb-6">Log in to your account</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md mx-auto p-6 gradient-trasnparent"
        >
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              {...register("email")}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-sky-400 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              {...register("password")}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-sky-400 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-[var(--icon-blue-primary)] text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--icon-blue-primary)]"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          <div className="relative my-6 flex items-center">
            <span className="flex-grow h-px bg-gray-300"></span>
            <span className="px-3 text-sm text-gray-500">or</span>
            <span className="flex-grow h-px bg-gray-300"></span>
          </div>

          <button
            type="button"
            className="flex w-full gap-2 justify-center items-center border border-gray-300 rounded-md h-10 shadow-sm hover:bg-gray-100 mb-8"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignInForm;
