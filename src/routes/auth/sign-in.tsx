import { createFileRoute } from "@tanstack/react-router";

import SignInViewPage from "../../components/auth/signin-view";

export const Route = createFileRoute("/auth/sign-in")({
	component: SignInViewPage
});
