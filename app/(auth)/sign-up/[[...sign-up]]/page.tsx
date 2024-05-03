import { SignUp } from "@clerk/nextjs";
import React from "react";

const SignUpPage = () => {
	return (
		<div className="h-screen h-svh w-full bg-gradient bg-cover bg-center flex justify-center items-center">
			<SignUp />
		</div>
	);
};

export default SignUpPage;
