import { createFileRoute } from "@tanstack/react-router";

import ForgotPasswordViewPage from "../../components/auth/forgot-password-view";

export const Route = createFileRoute("/auth/forgot-password")({
	component: ForgotPasswordViewPage
});
