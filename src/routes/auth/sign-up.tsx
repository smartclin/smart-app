import { createFileRoute } from "@tanstack/react-router";

import SignUpViewPage from "../../components/auth/signup-view";

export const Route = createFileRoute("/auth/sign-up")({
	component: SignUpViewPage
});
