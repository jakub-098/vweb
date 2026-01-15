import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Konfigurátor – Vas Web",
	description:
		"Nakonfiguruj si svoj moderný, responzívny web alebo e‑shop – vyber typ webu, rozsah a stručne popíš svoje požiadavky.",
};

export default function ConfigLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}

