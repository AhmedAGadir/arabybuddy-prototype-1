import { SignIn } from "@clerk/nextjs";
import React from "react";

const SignInPage = () => {
	return (
		<div className="h-screen h-svh w-full bg-gradient bg-cover bg-center flex justify-center items-center">
			<SignIn />
		</div>
	);
};

export default SignInPage;
