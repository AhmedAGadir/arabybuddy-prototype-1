import React from "react";
import { NATIVE_LANGUAGES, ARABIC_DIALECTS } from "@/types/languagesTypes";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
	nativeLanguage: z.string().min(2).max(50),
	arabicDialect: z.string().min(2).max(50),
});

const TryForFreeForm = ({ onSubmit }: { onSubmit?: (values: any) => void }) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			nativeLanguage: "English",
			arabicDialect: "Modern Standard Arabic",
		},
	});

	const formSubmitHandler = (values: z.infer<typeof formSchema>) => {
		onSubmit?.(values);
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(formSubmitHandler)}
				className="space-y-6 md:space-y-8 w-full md:w-fit"
			>
				<FormField
					control={form.control}
					name="nativeLanguage"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Native Language</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
								{...field}
							>
								<FormControl>
									<SelectTrigger className="w-full md:w-[250px] mx-auto">
										<SelectValue placeholder="Select Language" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{NATIVE_LANGUAGES.map((language) => (
										<SelectItem value={language} key={language}>
											{language}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="arabicDialect"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Arabic Dialect</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
								{...field}
							>
								<FormControl>
									<SelectTrigger className="w-full md:w-[250px] mx-auto">
										<SelectValue placeholder="Select Dialect" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{ARABIC_DIALECTS.map((dialect) => (
										<SelectItem value={dialect} key={dialect}>
											{dialect}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					size="lg"
					className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-8 h-11 text-center me-2 mb-2 w-full md:w-fit"
				>
					Try for free
				</Button>
			</form>
		</Form>
	);
};

export default TryForFreeForm;
