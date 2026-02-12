"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ConfigPage() {
	const router = useRouter();
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [theme, setTheme] = useState<"tmava" | "svetla">("tmava");
	const [accent, setAccent] = useState<
		"purple" | "blue" | "green" | "orange" | "pink" | "red" | "yellow" | "teal" | "gray"
	>("purple");
	const [accentCustom, setAccentCustom] = useState("");
	const [mail, setMail] = useState<"potrebujem" | "mam">("potrebujem");
	const [sectionAbout, setSectionAbout] = useState(false);
	const [sectionCards, setSectionCards] = useState(false);
	const [sectionFaq, setSectionFaq] = useState(false);
	const [sectionGallery, setSectionGallery] = useState(false);
	const [sectionOffer, setSectionOffer] = useState(false);
	const [sectionContactForm, setSectionContactForm] = useState(false);
	const [customFont, setCustomFont] = useState("");
	const [domainOption, setDomainOption] = useState<"own" | "request" | "">("request");
	const [domainOwn, setDomainOwn] = useState("");
	const [domainRequest, setDomainRequest] = useState("");
	const [domainChecking, setDomainChecking] = useState(false);
	const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);
	const [domainCheckMessage, setDomainCheckMessage] = useState<string | null>(null);
	const [mailLocalPart, setMailLocalPart] = useState("");
	const [existingEmail, setExistingEmail] = useState("");
	const [mailNote, setMailNote] = useState("");
	const [fastDelivery, setFastDelivery] = useState<"yes" | "no">("no");
	const [prices, setPrices] = useState<Record<string, number>>({});
	const [submitting, setSubmitting] = useState(false);
	const [submitMessage, setSubmitMessage] = useState<string | null>(null);
	const [emailDialogOpen, setEmailDialogOpen] = useState(false);
	const [userEmail, setUserEmail] = useState("");
	const [emailError, setEmailError] = useState<string | null>(null);
	const [missingFieldsError, setMissingFieldsError] = useState<string | null>(null);
	const [existingDialogOpen, setExistingDialogOpen] = useState(false);
	const [existingConfigEmail, setExistingConfigEmail] = useState("");
	const [existingConfigEmailError, setExistingConfigEmailError] = useState<string | null>(null);
	const [existingConfigChecking, setExistingConfigChecking] = useState(false);
	const [loadedFromOrder, setLoadedFromOrder] = useState(false);
	const [existingOrderId, setExistingOrderId] = useState<number | null>(null);

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (!emailDialogOpen && !existingDialogOpen) return;

		// Scroll the main config card into view so the popup is visible
		if (containerRef.current) {
			containerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
		} else {
			const middle = Math.max(
				0,
				(document.documentElement.scrollHeight - window.innerHeight) / 2,
			);
			window.scrollTo({ top: middle, behavior: "smooth" });
		}
	}, [emailDialogOpen, existingDialogOpen]);

	useEffect(() => {
		async function loadPrices() {
			try {
				const res = await fetch("/api/prices");
				if (!res.ok) return;
				const data = await res.json();
				if (Array.isArray(data.prices)) {
					const map: Record<string, number> = {};
					for (const p of data.prices) {
						if (typeof p.code === "string" && p.amount != null) {
							const numeric = Number(p.amount);
							if (!Number.isNaN(numeric)) {
								map[p.code] = numeric;
							}
						}
					}
					setPrices(map);
				}
			} catch (error) {
				console.error("Failed to load prices", error);
			}
		}

		loadPrices();
	}, []);

	useEffect(() => {
		async function loadExistingOrder() {
			if (loadedFromOrder) return;
			let email: string | null = null;
			let isEditMode = false;
			if (typeof window !== "undefined") {
				try {
					const url = new URL(window.location.href);
					isEditMode = url.searchParams.get("edit") === "1";
					if (isEditMode) {
						email = window.localStorage.getItem("vwebOrderEmail");
					}
				} catch {
					isEditMode = false;
					email = null;
				}
			}

			if (!isEditMode || !email) return;

			try {
				const res = await fetch("/api/orders/find-by-email", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email }),
				});

				if (!res.ok) return;

				const data = await res.json();
				if (!data.success || !data.found || !data.order) return;

				const order = data.order as any;
				setExistingOrderId(order.id);
				setTheme(order.theme === "svetla" ? "svetla" : "tmava");
				setAccent(typeof order.accent_color === "string" ? order.accent_color : "purple");
				setMail(order.mail_option === "mam" ? "mam" : "potrebujem");
				setMailLocalPart(order.mail_local_part ?? "");
				setSectionAbout(Boolean(order.section_about));
				setSectionCards(Boolean(order.section_cards));
				setSectionFaq(Boolean(order.section_faq));
				setSectionGallery(Boolean(order.section_gallery));
				setSectionOffer(Boolean(order.section_offer));
				setSectionContactForm(Boolean(order.section_contact_form));
				setCustomFont(order.custom_font ?? "");
				setDomainOption(order.domain_option === "own" ? "own" : "request");
				setDomainOwn(order.domain_own ?? "");
				setDomainRequest(order.domain_request ?? "");
				setFastDelivery(order.delivery_speed === "24h" ? "yes" : "no");
				setLoadedFromOrder(true);
			} catch (e) {
				console.error("Failed to preload existing order into config", e);
			}
		}

		loadExistingOrder();
	}, [loadedFromOrder]);

	async function checkDomainAvailability() {
		if (domainOption !== "request") return;

		const rawDomain = domainRequest;
		const trimmedDomain = rawDomain.trim();
		const cleanedDomain = trimmedDomain
			.replace(/^https?:\/\//i, "")
			.replace(/^www\./i, "");
		const lowerRaw = trimmedDomain.toLowerCase();
		const domainPattern = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

		if (!cleanedDomain) {
			setDomainAvailable(null);
			setDomainCheckMessage("Prosím zadaj doménu, ktorú chceš skontrolovať.");
			return;
		}

		if (!domainPattern.test(cleanedDomain) || /^ww[^.]/.test(lowerRaw)) {
			setDomainAvailable(null);
			setDomainCheckMessage("Doména nie je v správnom tvare.");
			return;
		}

		try {
			setDomainChecking(true);
			setDomainCheckMessage(null);

			const response = await fetch("/api/domain-check", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ domain: cleanedDomain }),
			});

			if (!response.ok) {
				setDomainAvailable(null);
				setDomainCheckMessage("Nepodarilo sa overiť doménu. Skús to neskôr.");
				return;
			}

			const data = await response.json();

			if (data.available) {
				setDomainAvailable(true);
				setDomainCheckMessage("Doména je voľná – super!");
			} else {
				setDomainAvailable(false);
				setDomainCheckMessage("Domena je obsadena");
			}
		} catch (error) {
			console.error("Error checking domain", error);
			setDomainAvailable(null);
			setDomainCheckMessage("Nepodarilo sa overiť doménu. Skús to neskôr.");
		} finally {
			setDomainChecking(false);
		}
	}

	function validateRequiredFields() {
		const missing: string[] = [];

		// aspoň jedna sekcia musí byť vybraná
		if (selectedSectionsCount === 0) {
			missing.push("aspoň jednu sekciu");
		}

		// doména je povinná a musí byť v správnom tvare
		const rawDomain = domainOption === "own" ? domainOwn : domainRequest;
		const trimmedDomain = rawDomain.trim();
		const cleanedDomain = trimmedDomain
			.replace(/^https?:\/\//i, "")
			.replace(/^www\./i, "");
		const domainPattern = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
		const lowerRaw = trimmedDomain.toLowerCase();

		if (!domainOption || cleanedDomain.length === 0) {
			missing.push("doménu");
		} else if (!domainPattern.test(cleanedDomain)) {
			setMissingFieldsError("Doména nie je v správnom tvare.");
			return false;
		} else if (/^ww[^.]/.test(lowerRaw)) {
			setMissingFieldsError("Doména nie je v správnom tvare.");
			return false;
		} else if (domainOption === "request" && domainAvailable === false) {
			setMissingFieldsError("Doména je obsadená – vyber prosím inú.");
			return false;
		}

		// sekcia Mail – povinné podľa zvolenej možnosti
		if (mail === "potrebujem") {
			const local = mailLocalPart.trim();
			if (!local) {
				missing.push("e-mail pre web");
			} else {
				const localPattern = /^[A-Za-z0-9._%+-]+$/;
				if (!localPattern.test(local)) {
					setMissingFieldsError("E-mail v sekcii Mail nie je v správnom tvare.");
					return false;
				}
			}
		} else if (mail === "mam" && !sectionContactForm) {
			const ex = existingEmail.trim();
			if (!ex) {
				missing.push("e-mail v sekcii Mail");
			} else {
				const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailPattern.test(ex)) {
					setMissingFieldsError("Zadaj prosím platnú e-mailovú adresu v sekcii Mail.");
					return false;
				}
			}
		}
		// mail === "mam" a sectionContactForm === true – nevyžadujeme e-mail, pošle údaje neskôr

		if (missing.length > 0) {
			setMissingFieldsError(`Nevyplnili ste: ${missing.join(", ")}.`);
			return false;
		}

		setMissingFieldsError(null);
		return true;
	}

	async function handleSubmit(email: string) {
		setSubmitting(true);
		setSubmitMessage(null);

		if (!validateRequiredFields()) {
			setSubmitting(false);
			return;
		}

		try {
			const payload = {
				theme,
				accentColor: accent,
				accentCustom,
				mailOption: mail,
				mailLocalPart: mail === "potrebujem" ? mailLocalPart.trim() : null,
				sectionAbout,
				sectionCards,
				sectionFaq,
				sectionGallery,
				sectionOffer,
				sectionContactForm,
				customFont,
				domainOption,
				domainOwn,
				domainRequest,
				userEmail: email,
				totalPrice: estimatedPrice,
				deliverySpeed: fastDelivery === "yes" ? "24h" : "48h",
			};

			const url = existingOrderId ? "/api/orders/update" : "/api/orders";
			const body = existingOrderId ? { ...payload, orderId: existingOrderId } : payload;

			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				throw new Error("Request failed");
			}

			setSubmitMessage("Konfigurácia bola odoslaná. Čoskoro sa ti ozvem.");
			router.push("/summary");
		} catch (error) {
			console.error("Error submitting order", error);
			setSubmitMessage(
				"Pri odosielaní nastala chyba. Skús to prosím znova alebo neskôr."
			);
		} finally {
			setSubmitting(false);
		}
	}

	const domainForEmail = (() => {
		const raw = domainOption === "own" ? domainOwn : domainRequest;
		const trimmed = raw.trim();
		// odstráni prípadné "http(s)://" a "www." z domény
		return trimmed.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
	})();

	const selectedSectionsCount = [
		sectionAbout,
		sectionCards,
		sectionFaq,
		sectionGallery,
		sectionOffer,
		sectionContactForm,
	].filter(Boolean).length;

	const estimatedPrice = (() => {
		let total = 0;
		if (prices.base) total += prices.base;
		if (selectedSectionsCount > 4 && prices.sections) total += prices.sections;

		const wantsDomain = domainOption === "request";
		const wantsMail = mail === "potrebujem";
		const hasCombo = prices.combo != null;

		if (wantsDomain && wantsMail) {
			if (hasCombo) {
				total += prices.combo;
			} else {
				if (prices.domain) total += prices.domain;
				if (prices.mail) total += prices.mail;
			}
		} else {
			if (wantsDomain && prices.domain) total += prices.domain;
			if (wantsMail && prices.mail) total += prices.mail;
		}

		if (fastDelivery === "yes" && prices["24h"]) total += prices["24h"];
		return total;
	})();

	async function handleEmailConfirm() {
		setEmailError(null);
		const trimmed = userEmail.trim();
		if (!trimmed) {
			setEmailError("Prosím zadaj svoj e-mail, aby sa ti konfigurácia nestratila.");
			return;
		}

		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailPattern.test(trimmed)) {
			setEmailError("Zadaj prosím platnú e-mailovú adresu.");
			return;
		}

		// Ak už existuje objednávka s týmto emailom a statusom 0,
		// len zobrazíme informáciu o registrácii a čakaní na úhradu
		// a novú objednávku nevytvárame.
		try {
			const res = await fetch("/api/orders/find-by-email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: trimmed }),
			});

			if (res.ok) {
				const data = await res.json();
				if (data.success && data.found && data.order && typeof data.order.status === "number") {
					if (data.order.status === 0) {
						alert("Vasu objednávku registrujeme a čakáme na jej úhradu, Podrobné informácie boli zaslané na Váš email.");
						setEmailDialogOpen(false);
						setUserEmail("");
						return;
					}
				}
			}
		} catch (err) {
			console.error("Failed to check existing order by email", err);
		}

		if (typeof window !== "undefined") {
			try {
				window.localStorage.setItem("vwebOrderEmail", trimmed);
			} catch {}
		}

		// track finished configuration (email submitted)
		try {
			await fetch("/api/analytics/increment", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: 2 }),
			});
		} catch (err) {
			console.error("Failed to track finished config", err);
		}

		await handleSubmit(trimmed);
		setEmailDialogOpen(false);
		setUserEmail("");
	}

	async function handleContinueClick() {
		// základná validácia domény a mailu
		if (!validateRequiredFields()) return;

		// ak chceš novú doménu, over jej dostupnosť pri Pokračovať
		if (domainOption === "request") {
			const trimmedDomain = domainRequest.trim();
			const cleanedDomain = trimmedDomain
				.replace(/^https?:\/\//i, "")
				.replace(/^www\./i, "");
			const domain = cleanedDomain;
			try {
				setDomainChecking(true);
				setDomainCheckMessage(null);

				const response = await fetch("/api/domain-check", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ domain }),
				});

				if (!response.ok) {
					setDomainAvailable(null);
					setDomainCheckMessage("Nepodarilo sa overiť doménu. Skús to neskôr.");
					return;
				}

				const data = await response.json();

				if (!data.available) {
					setDomainAvailable(false);
					setDomainCheckMessage("Domena je obsadena");
					setMissingFieldsError("Doména je obsadená – vyber prosím inú.");
					return;
				}

				setDomainAvailable(true);
				setDomainCheckMessage("Doména je voľná – super!");
			} catch (error) {
				console.error("Error checking domain from Pokračovať", error);
				setDomainAvailable(null);
				setDomainCheckMessage("Nepodarilo sa overiť doménu. Skús to neskôr.");
				return;
			} finally {
				setDomainChecking(false);
			}
		}

		// ak už máme email v localStorage (napr. po "už mám konfiguráciu"),
		// nepýtame si ho znova a rovno odošleme konfiguráciu
		let storedEmail: string | null = null;
		let isEditMode = false;
		if (typeof window !== "undefined") {
			try {
				const url = new URL(window.location.href);
				isEditMode = url.searchParams.get("edit") === "1";
				storedEmail = window.localStorage.getItem("vwebOrderEmail");
			} catch {
				storedEmail = null;
				isEditMode = false;
			}
		}

		if (isEditMode && storedEmail && storedEmail.trim().length > 0) {
			await handleSubmit(storedEmail.trim());
			return;
		}

		// ak sme prešli všetky kontroly a nemáme (alebo nechceme použiť) email, otvoríme email popup
		setEmailDialogOpen(true);
	}

	async function handleExistingConfirm() {
		setExistingConfigEmailError(null);
		const trimmed = existingConfigEmail.trim();
		if (!trimmed) {
			setExistingConfigEmailError("Prosím zadaj e-mail použitý pri konfigurácii.");
			return;
		}

		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailPattern.test(trimmed)) {
			setExistingConfigEmailError("Zadaj prosím platnú e-mailovú adresu.");
			return;
		}

		try {
			setExistingConfigChecking(true);
			const res = await fetch("/api/orders/find-by-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: trimmed }),
			});

			if (!res.ok) {
				setExistingConfigEmailError("Nepodarilo sa overiť konfiguráciu. Skús to neskôr.");
				return;
			}

			const data = await res.json();
			if (!data.success || !data.found) {
				setExistingConfigEmailError("Pre tento e-mail sme nenašli konfiguráciu.");
				return;
			}

			// Ak má objednávka status 0 (odoslaná, čaká sa na platbu),
			// zobrazíme informačný alert a nepresmerujeme na zhrnutie.
			const orderStatus = (data.order && typeof data.order.status === "number") ? data.order.status : null;
			if (orderStatus === 0) {
				alert("Vasu objednávku registrujeme a čakáme na jej úhradu, Podrobné informácie boli zaslané na Váš email.");
				setExistingDialogOpen(false);
				setExistingConfigEmail("");
				return;
			}

			// Ak má objednávka status 1 alebo 2, používateľ dostane prázdnu konfiguráciu
			// a jeho ďalšie odoslanie sa zaregistruje ako nová objednávka.
			if (orderStatus === 1 || orderStatus === 2) {
				if (typeof window !== "undefined") {
					try {
						window.localStorage.setItem("vwebOrderEmail", trimmed);
					} catch {}
				}
				setExistingDialogOpen(false);
				setExistingConfigEmail("");
				if (typeof window !== "undefined") {
					window.location.href = "/config";
				}
				return;
			}
			if (typeof window !== "undefined") {
				try {
					window.localStorage.setItem("vwebOrderEmail", trimmed);
				} catch {}
			}
			setExistingDialogOpen(false);
			setExistingConfigEmail("");
			router.push("/summary");
		} catch (error) {
			console.error("Error looking up existing configuration", error);
			setExistingConfigEmailError("Pri overovaní nastala chyba. Skús to neskôr.");
		} finally {
			setExistingConfigChecking(false);
		}
	}

	return (
		<section className="flex min-h-screen w-full items-center justify-center px-4 py-16 text-zinc-50 sm:px-8">
			<div ref={containerRef} className="relative w-full max-w-6xl sm:w-4/5 lg:w-2/3">
				<div
					className="pointer-events-none absolute -inset-[3px] rounded-2xl bg-gradient-to-b from-purple-500/45 via-transparent to-transparent opacity-70 blur-xl"
					aria-hidden
				/>

				<div className="relative overflow-hidden rounded-2xl border border-purple-300/20 bg-black/60 px-7 py-10 shadow-[0_24px_80px_rgba(0,0,0,0.95)] backdrop-blur-3xl sm:px-11 sm:py-12">
					<div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70" />

					<header className="mb-10">
						<p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-200/80">
							Konfigurátor
						</p>
								<div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
									<h1 className="text-3xl font-semibold sm:text-4xl md:text-5xl">
								Vyber si, z akých častí sa má tvoj web skladať.
							</h1>
							<button
								type="button"
								onClick={() => {
									setExistingDialogOpen(true);
									setExistingConfigEmailError(null);
								}}
										className="inline-flex items-center justify-center rounded-full border border-purple-300/40 bg-black/40 px-4 py-1.5 text-xs font-semibold text-purple-100 shadow-[0_0_12px_rgba(168,85,247,0.35)] transition hover:border-transparent hover:bg-purple-500/70 hover:text-white sm:text-sm"
							>
								Konfiguráciu už mám
							</button>
						</div>
						
								<div className="mt-6 w-full rounded-2xl border border-purple-300/30 bg-black/50 px-5 py-4 text-base text-zinc-100 shadow-[0_18px_60px_rgba(0,0,0,0.7)] sm:px-6 sm:py-5">
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<p className="text-sm leading-relaxed text-zinc-200/90 sm:max-w-xl sm:text-base">
									Najprv si prezri demo stránku, aby si videl, ako môžu jednotlivé bloky
									pôsobiť v praxi. Potom sa tu v konfigurátore rozhodni, ktoré komponenty
									potrebuješ.
								</p>
										<a
											href="/preview"
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center justify-center rounded-full bg-purple-500/90 px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_36px_rgba(88,28,135,0.75)] transition hover:bg-purple-400 hover:shadow-[0_16px_48px_rgba(88,28,135,0.9)] sm:text-base"
										>
									Pozrieť demo stránku
								</a>
							</div>
						</div>
					</header>

					<div className="grid gap-8 md:grid-cols-[1.6fr,1fr]">
						<div className="space-y-8">
							<div className="space-y-3">
								<label className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-300/90">
									Vyberte, aké komponenty potrebujete na vašej webke
								</label>
								<p className="text-sm text-zinc-400/90 sm:text-base">
									Zaškrtnite sekcie, ktoré chcete mať na stránke. 
								</p>

								<div className="space-y-4">
									<label className="group flex cursor-pointer items-center gap-6 rounded-xl border border-purple-300/40 bg-black/40 p-4 text-left text-base text-zinc-100 transition hover:border-purple-200/80 hover:bg-black/70">
										<input
											type="checkbox"
											className="h-4 w-4 accent-purple-500"
											checked={sectionAbout}
											onChange={(e) => setSectionAbout(e.target.checked)}
										/>
										<div className="h-40 w-72 flex-none overflow-hidden rounded-lg bg-black/40">
											<Image
												src="/previews/about.png"
												alt="Náhľad sekcie O nás"
												width={288}
												height={160}
												className="h-full w-full object-cover"
											/>
										</div>
										<div>
											<div className="text-xl font-semibold sm:text-2xl">O nás</div>
											<p className="mt-1 text-sm text-zinc-400/90">
												Krátke predstavenie firmy alebo projektu.
											</p>
										</div>
									</label>

									<label className="group flex cursor-pointer items-center gap-6 rounded-xl border border-purple-300/40 bg-black/40 p-4 text-left text-base text-zinc-100 transition hover:border-purple-200/80 hover:bg-black/70">
										<input
											type="checkbox"
											className="h-4 w-4 accent-purple-500"
											checked={sectionCards}
											onChange={(e) => setSectionCards(e.target.checked)}
										/>
										<div className="h-40 w-72 flex-none overflow-hidden rounded-lg bg-black/40">
											<Image
													src="/previews/cards.png"
													alt="Náhľad sekcie Karty"
													width={288}
													height={160}
													className="h-full w-full object-cover"
												/>
										</div>
										<div>
											<div className="text-xl font-semibold sm:text-2xl">Karty</div>
											<p className="mt-1 text-sm text-zinc-400/90">
												Prehľadné boxy napríklad pre služby alebo benefity.
											</p>
										</div>
									</label>

									<label className="group flex cursor-pointer items-center gap-6 rounded-xl border border-purple-300/40 bg-black/40 p-4 text-left text-base text-zinc-100 transition hover:border-purple-200/80 hover:bg-black/70">
										<input
											type="checkbox"
											className="h-4 w-4 accent-purple-500"
											checked={sectionFaq}
											onChange={(e) => setSectionFaq(e.target.checked)}
										/>
										<div className="h-40 w-72 flex-none overflow-hidden rounded-lg bg-black/40">
											<Image
													src="/previews/faq.png"
													alt="Náhľad sekcie Často kladené otázky"
													width={288}
													height={160}
													className="h-full w-full object-cover"
												/>
										</div>
										<div>
											<div className="text-xl font-semibold sm:text-2xl">Často kladené otázky</div>
											<p className="mt-1 text-sm text-zinc-400/90">
												FAQ blok s najčastejšími otázkami a odpoveďami.
											</p>
										</div>
									</label>

									<label className="group flex cursor-pointer items-center gap-6 rounded-xl border border-purple-300/40 bg-black/40 p-4 text-left text-base text-zinc-100 transition hover:border-purple-200/80 hover:bg-black/70">
										<input
											type="checkbox"
											className="h-4 w-4 accent-purple-500"
											checked={sectionGallery}
											onChange={(e) => setSectionGallery(e.target.checked)}
										/>
										<div className="h-40 w-72 flex-none overflow-hidden rounded-lg bg-black/40">
											<Image
													src="/previews/gallery.png"
													alt="Náhľad sekcie Galéria"
													width={288}
													height={160}
													className="h-full w-full object-cover"
												/>
										</div>
										<div>
											<div className="text-xl font-semibold sm:text-2xl">Galéria</div>
											<p className="mt-1 text-sm text-zinc-400/90">
												Obrázková galéria alebo ukážky realizácií.
											</p>
										</div>
									</label>

									<label className="group flex cursor-pointer items-center gap-6 rounded-xl border border-purple-300/40 bg-black/40 p-4 text-left text-base text-zinc-100 transition hover:border-purple-200/80 hover:bg-black/70">
										<input
											type="checkbox"
											className="h-4 w-4 accent-purple-500"
											checked={sectionOffer}
											onChange={(e) => setSectionOffer(e.target.checked)}
										/>
										<div className="h-40 w-72 flex-none overflow-hidden rounded-lg bg-black/40">
											<Image
													src="/previews/services.png"
													alt="Náhľad sekcie Ponuka"
													width={288}
													height={160}
													className="h-full w-full object-cover"
												/>
										</div>
										<div>
											<div className="text-xl font-semibold sm:text-2xl">Ponuka</div>
											<p className="mt-1 text-sm text-zinc-400/90">
												Cenník, balíčky služieb alebo produktov.
											</p>
										</div>
									</label>

									<label className="group flex cursor-pointer items-center gap-6 rounded-xl border border-purple-300/40 bg-black/40 p-4 text-left text-base text-zinc-100 transition hover:border-purple-200/80 hover:bg-black/70">
										<input
											type="checkbox"
											className="h-4 w-4 accent-purple-500"
											checked={sectionContactForm}
											onChange={(e) => setSectionContactForm(e.target.checked)}
										/>
										<div className="h-40 w-72 flex-none overflow-hidden rounded-lg bg-black/40">
											<Image
													src="/previews/mailer.png"
													alt="Náhľad sekcie Kontaktný formulár"
													width={288}
													height={160}
													className="h-full w-full object-cover"
												/>
										</div>
										<div>
											<div className="text-xl font-semibold sm:text-2xl">Kontaktný formulár</div>
											<p className="mt-1 text-sm text-zinc-400/90">
												Jednoduchý formulár pre dopyty a správy.
											</p>
										</div>
									</label>
								</div>
							</div>

							<div className="space-y-6 rounded-2xl border border-purple-300/25 bg-black/40 px-7 py-9 text-base text-zinc-100 shadow-[0_18px_60px_rgba(0,0,0,0.9)]">
								<p className="text-base font-semibold uppercase tracking-[0.3em] text-purple-200/80">
									Nastavenia vzhľadu a techniky
								</p>

									<div className="space-y-12">
									<div className="space-y-3">
										<p className="text-base font-medium uppercase tracking-[0.2em] text-zinc-200">
											Téma
										</p>
										<div className="inline-flex rounded-full border border-purple-300/40 bg-black/40 p-0.5 text-sm">
											<button
												type="button"
												onClick={() => setTheme("tmava")}
												className={`rounded-full px-4 py-1.5 font-semibold transition ${
													theme === "tmava" ? "bg-purple-500/90 text-white" : "text-zinc-200"
												}`}
											>
												Tmavá
											</button>
											<button
												type="button"
												onClick={() => setTheme("svetla")}
												className={`rounded-full px-4 py-1.5 font-semibold transition ${
													theme === "svetla" ? "bg-purple-500/90 text-white" : "text-zinc-200"
												}`}
											>
												Svetlá
											</button>
										</div>
									</div>

									<div className="space-y-3">
										<p className="text-base font-medium uppercase tracking-[0.2em] text-zinc-200">
											Akcent farba
										</p>
										<div className="space-y-2 text-sm">
											<label className="flex items-center gap-3 text-base">
												<input
													type="radio"
													name="accent"
													value="purple"
													checked={accent === "purple"}
													onChange={() => setAccent("purple")}
													className="h-3.5 w-3.5 accent-purple-500"
												/>
												<span className="inline-flex items-center gap-2">
													<span className="h-3 w-3 rounded-full bg-purple-500" />
													<span>Fialová</span>
												</span>
											</label>
											<label className="flex items-center gap-3 text-base">
												<input
													type="radio"
													name="accent"
													value="blue"
													checked={accent === "blue"}
													onChange={() => setAccent("blue")}
													className="h-3.5 w-3.5 accent-purple-500"
												/>
												<span className="inline-flex items-center gap-2">
													<span className="h-3 w-3 rounded-full bg-blue-500" />
													<span>Modrá</span>
												</span>
											</label>
											<label className="flex items-center gap-3 text-base">
												<input
													type="radio"
													name="accent"
													value="green"
													checked={accent === "green"}
													onChange={() => setAccent("green")}
													className="h-3.5 w-3.5 accent-purple-500"
												/>
												<span className="inline-flex items-center gap-2">
													<span className="h-3 w-3 rounded-full bg-emerald-500" />
													<span>Zelená</span>
												</span>
											</label>
											<label className="flex items-center gap-3 text-base">
												<input
													type="radio"
													name="accent"
													value="orange"
													checked={accent === "orange"}
													onChange={() => setAccent("orange")}
													className="h-3.5 w-3.5 accent-purple-500"
												/>
												<span className="inline-flex items-center gap-2">
													<span className="h-3 w-3 rounded-full bg-amber-400" />
													<span>Oranžová</span>
												</span>
											</label>
											<label className="flex items-center gap-3 text-base">
												<input
													type="radio"
													name="accent"
													value="pink"
													checked={accent === "pink"}
													onChange={() => setAccent("pink")}
													className="h-3.5 w-3.5 accent-purple-500"
												/>
												<span className="inline-flex items-center gap-2">
													<span className="h-3 w-3 rounded-full bg-pink-500" />
													<span>Ružová</span>
												</span>
											</label>
											<label className="flex items-center gap-3 text-base">
												<input
													type="radio"
													name="accent"
													value="red"
													checked={accent === "red"}
													onChange={() => setAccent("red")}
													className="h-3.5 w-3.5 accent-purple-500"
												/>
												<span className="inline-flex items-center gap-2">
													<span className="h-3 w-3 rounded-full bg-red-500" />
													<span>Červená</span>
												</span>
											</label>
											<label className="flex items-center gap-3 text-base">
												<input
													type="radio"
													name="accent"
													value="yellow"
													checked={accent === "yellow"}
													onChange={() => setAccent("yellow")}
													className="h-3.5 w-3.5 accent-purple-500"
												/>
												<span className="inline-flex items-center gap-2">
													<span className="h-3 w-3 rounded-full bg-yellow-400" />
													<span>Žltá</span>
												</span>
											</label>
											<label className="flex items-center gap-3 text-base">
												<input
													type="radio"
													name="accent"
													value="teal"
													checked={accent === "teal"}
													onChange={() => setAccent("teal")}
													className="h-3.5 w-3.5 accent-purple-500"
												/>
												<span className="inline-flex items-center gap-2">
													<span className="h-3 w-3 rounded-full bg-teal-400" />
													<span>Tyrkysová</span>
												</span>
											</label>
											<label className="flex items-center gap-3 text-base">
												<input
													type="radio"
													name="accent"
													value="gray"
													checked={accent === "gray"}
													onChange={() => setAccent("gray")}
													className="h-3.5 w-3.5 accent-purple-500"
												/>
												<span className="inline-flex items-center gap-2">
													<span className="h-3 w-3 rounded-full bg-zinc-400" />
													<span>Neutrálna</span>
												</span>
											</label>
											<div className="pt-1">
												<input
													type="text"
													placeholder="#A855F7 (vlastný kód, voliteľné)"
													value={accentCustom}
													onChange={(e) => setAccentCustom(e.target.value)}
													className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2.5 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
												/>
											</div>
										</div>
									</div>

									<div className="space-y-3">
										<p className="text-base font-medium uppercase tracking-[0.2em] text-zinc-200">
											Vlastný font <span className="text-zinc-500">(voliteľné)</span>
										</p>
										<input
											type="text"
											placeholder="Napr. 'Inter', 'Space Grotesk'"
											className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2.5 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
											value={customFont}
											onChange={(e) => setCustomFont(e.target.value)}
										/>
									</div>

									<div className="space-y-3">
										<p className="text-base font-medium uppercase tracking-[0.2em] text-zinc-200">
											Doména
											{prices.domain && (
												<span className="ml-2 text-xs font-normal tracking-normal text-zinc-400/90">
													+ {prices.domain.toFixed(2)} € – Ak si zakúpite službu Doména a Mail spolu, Ušetríte 10€ !
												</span>
											)}
										</p>
										<div className="space-y-2 text-base">
											<label className="flex items-center gap-3 text-base">
												<input
													type="radio"
													name="domain"
													className="h-3.5 w-3.5 accent-purple-500"
													checked={domainOption === "request"}
													onChange={() => {
														setDomainOption("request");
														setDomainAvailable(null);
														setDomainCheckMessage(null);
													}}
												/>
												<span>Chcem takúto:</span>
												<div className="flex flex-1 items-center gap-2">
													<span className="rounded-lg border border-white/15 bg-black/60 px-3 py-2.5 text-base text-zinc-400">
														www.
													</span>
													<input
														type="text"
														placeholder="napr. vasweb.sk"
														className="flex-1 rounded-lg border border-white/15 bg-black/50 px-3 py-2.5 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
														value={domainRequest}
														onChange={(e) => {
															setDomainRequest(e.target.value);
															setDomainAvailable(null);
															setDomainCheckMessage(null);
														}}
													/>
													<button
														type="button"
														onClick={checkDomainAvailability}
														disabled={domainChecking}
														className="whitespace-nowrap rounded-full bg-purple-500/90 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
													>
														{domainChecking ? "Kontrolujem..." : "Skontrolovať"}
													</button>
												</div>
											</label>
											{domainOption === "request" && domainCheckMessage && (
												<div
													className={`mt-2 rounded-lg border px-3 py-2 text-sm ${
														domainAvailable === true
															? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
															: "border-red-500/50 bg-red-500/15 text-red-200"
													}`}
												>
													{domainCheckMessage}
												</div>
											)}
											<label className="flex items-center gap-3 text-base">
												<input
													type="radio"
													name="domain"
													className="h-3.5 w-3.5 accent-purple-500"
													checked={domainOption === "own"}
													onChange={() => {
														setDomainOption("own");
														setDomainAvailable(null);
														setDomainCheckMessage(null);
													}}
												/>
												<span>Mám vlastnú:</span>
												{domainOption === "own" && (
													<input
														type="text"
														placeholder="napr. www.mojadomena.sk"
														className="flex-1 rounded-lg border border-white/15 bg-black/50 px-3 py-2.5 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
														value={domainOwn}
														onChange={(e) => setDomainOwn(e.target.value)}
													/>
												)}
											</label>
										</div>
									</div>

									<div className="space-y-3">
										<p className="text-base font-medium uppercase tracking-[0.2em] text-zinc-200">
											Mail
											{prices.mail && (
												<span className="ml-2 text-xs font-normal tracking-normal text-zinc-400/90">
													+ {prices.mail.toFixed(2)} € – Ak si zakúpite službu Doména a Mail spolu, Ušetríte 10€ !
												</span>
											)}
										</p>
										<div className="inline-flex rounded-full border border-purple-300/40 bg-black/40 p-1 text-base">
											<button
												type="button"
												onClick={() => setMail("potrebujem")}
												className={`rounded-full px-5 py-2 font-semibold transition ${
													mail === "potrebujem" ? "bg-purple-500/90 text-white" : "text-zinc-200"
												}`}
											>
												Potrebujem
											</button>
											<button
												type="button"
												onClick={() => setMail("mam")}
												className={`rounded-full px-5 py-2 font-semibold transition ${
													mail === "mam" ? "bg-purple-500/90 text-white" : "text-zinc-200"
												}`}
											>
												Mám vlastný
											</button>
										</div>
										{mail === "potrebujem" && (
											<div className="mt-3 space-y-1 text-base text-zinc-200">
												<p>Zadaj, aký mail by si chcel používať:</p>
												<div className="flex items-center gap-2">
													<input
														type="text"
														placeholder="napr. info"
														className="w-32 rounded-lg border border-white/15 bg-black/50 px-3 py-2.5 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
														value={mailLocalPart}
														onChange={(e) => setMailLocalPart(e.target.value)}
													/>
													<span className="text-base text-zinc-300">
														@{domainForEmail}
													</span>
												</div>
											</div>
										)}
										{mail === "mam" && sectionContactForm && (
											<div className="mt-3 space-y-2 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-3 text-sm text-amber-100 sm:text-base">
												<p className="font-semibold">
													Máte nakonfigurovanú možnosť kontaktného formulára.
												</p>
												<p>
													Pre správne fungovanie od vás potrebujeme tieto prihlasovacie údaje
													do vášho mail providera:
												</p>
												<ul className="mt-1 list-disc space-y-1 pl-4">
													<li>SMTP server (hostname)</li>
													<li>SMTP port (napr. 465 alebo 587)</li>
													<li>Typ zabezpečenia (SSL/TLS)</li>
													<li>Prihlasovacie meno (celá e-mailová adresa)</li>
													<li>Heslo k e-mailovému účtu</li>
												</ul>
												<p className="mt-2">
													Tieto údaje mi prosím zašlite na e-mail ideálne hneď po objednaní
													stránky.
												</p>
												<p className="mt-2 font-semibold text-amber-200">
													Pozor: Ak máte Gmail, automatický formulár nebude možné nakonfigurovať.
												</p>
												<p>
													V takomto prípade zvoľte prvú možnosť a my vám mail vytvoríme k
													vašej doméne.
												</p>
											</div>
										)}
										{mail === "mam" && !sectionContactForm && (
											<div className="mt-3 space-y-1 text-sm text-zinc-200">
												<p>Zadaj svoj aktuálny e-mail, ktorý použijem v pätičke webu:</p>
												<input
													type="email"
													placeholder="napr. studio@vasweb.sk"
													className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
													value={existingEmail}
													onChange={(e) => setExistingEmail(e.target.value)}
												/>
											</div>
										)}
										{mail && (
											<div className="mt-6 space-y-2">
												<p className="text-base font-medium uppercase tracking-[0.2em] text-zinc-200">Poznámka</p>
												<textarea
													rows={3}
													placeholder="Sem si môžeš dopísať špeciálne požiadavky k e-mailom alebo odosielaniu formulára."
													className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2.5 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
													value={mailNote}
													onChange={(e) => setMailNote(e.target.value)}
												/>
											</div>
										)}
										<div className="space-y-3 pt-4">
											<p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-200">
												Rýchle dodanie
												{prices["24h"] && (
													<span className="ml-2 text-[0.7rem] font-normal tracking-normal text-zinc-400/90">
														+ {prices["24h"].toFixed(2)} €
													</span>
												)}
											</p>
											<div className="flex items-center justify-start gap-4 text-base">
												<div className="inline-flex rounded-full border border-purple-300/40 bg-black/40 p-1 text-base">
													<button
														type="button"
														onClick={() => setFastDelivery("no")}
														className={`rounded-full px-6 py-2 font-semibold transition ${
															fastDelivery === "no" ? "bg-purple-500/90 text-white" : "text-zinc-200"
														}`}
													>
														48 h
													</button>
													<button
														type="button"
														onClick={() => setFastDelivery("yes")}
														className={`rounded-full px-6 py-2 font-semibold transition ${
															fastDelivery === "yes" ? "bg-purple-500/90 text-white" : "text-zinc-200"
														}`}
													>
														24 h
													</button>
												</div>
											</div>
											<div className="mt-4 space-y-2 rounded-2xl border border-purple-400/40 bg-black/40 px-4 py-4 text-sm text-zinc-100">
												<p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-purple-200">
													Cena projektu
												</p>
												{Object.keys(prices).length === 0 ? (
													<p className="text-xs text-zinc-400">
														Načítavam cenník... skús o chvíľu znova.
													</p>
												) : (
													<>
														<p className="text-3xl font-bold tracking-tight text-zinc-50">
															{estimatedPrice.toFixed(2)} €
														</p>
														<div className="text-[0.8rem] text-zinc-300">
															<p>Základ: {prices.base?.toFixed(2)} €</p>
															{selectedSectionsCount >= 4 && prices.sections && (
																<p>+ Sekcie (4+): {prices.sections.toFixed(2)} €</p>
															)}
															{domainOption === "request" && mail === "potrebujem" && prices.combo && (
																<p>+ Doména + mail (combo): {prices.combo.toFixed(2)} €</p>
															)}
															{(!(domainOption === "request" && mail === "potrebujem" && prices.combo) &&
																 domainOption === "request" &&
																 prices.domain) && (
																<p>+ Doména: {prices.domain.toFixed(2)} €</p>
															)}
															{(!(domainOption === "request" && mail === "potrebujem" && prices.combo) &&
																 mail === "potrebujem" &&
																 prices.mail) && (
																<p>+ Mail: {prices.mail.toFixed(2)} €</p>
															)}
															{fastDelivery === "yes" && prices["24h"] && (
																<p>+ Rýchle dodanie: {prices["24h"].toFixed(2)} €</p>
															)}
														</div>
													</>
												)}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{emailDialogOpen && (
							<div className="fixed inset-0 z-50 bg-black/70">
								<div className="fixed left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-purple-300/40 bg-black/90 px-6 py-7 text-sm text-zinc-100 shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
									<h2 className="text-lg font-semibold">Zadajte váš e-mail</h2>
									<p className="mt-2 text-sm text-zinc-300">
										Zadajte svoj e-mail, aby sa vám konfigurácia nestratila a vedeli sme ju priradiť k vám.
									</p>
									<input
										type="email"
										className="mt-4 w-full rounded-lg border border-white/20 bg-black/60 px-4 py-2.5 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
										placeholder="napr. studio@vasweb.sk"
										value={userEmail}
										onChange={(e) => setUserEmail(e.target.value)}
									/>
									{emailError && (
										<div className="mt-2 rounded-lg border border-red-500/50 bg-red-500/15 px-3 py-2 text-sm text-red-200">
											{emailError}
										</div>
									)}
									<div className="mt-4 flex justify-end gap-2 text-sm">
										<button
											type="button"
											onClick={() => {
												setEmailDialogOpen(false);
												setEmailError(null);
											}}
											className="rounded-full border border-zinc-600/70 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-400/90 hover:text-zinc-50"
										>
											Zrušiť
										</button>
										<button
											type="button"
											onClick={handleEmailConfirm}
											disabled={submitting}
											className="rounded-full bg-purple-500/90 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-500/60"
										>
											{submitting ? "Odosielam konfiguráciu..." : "Potvrdiť a odoslať"}
										</button>
									</div>
								</div>
							</div>
						)}

						{existingDialogOpen && (
							<div className="fixed inset-0 z-50 bg-black/70">
								<div className="fixed left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-purple-300/40 bg-black/90 px-6 py-7 text-sm text-zinc-100 shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
									<h2 className="text-lg font-semibold">Mám už konfiguráciu</h2>
									<p className="mt-2 text-sm text-zinc-300">
										Zadaj e-mail, ktorý si použil pri konfigurácii, aby sme ťa vedeli prepojiť na ďalší krok.
									</p>
									<input
										type="email"
										className="mt-4 w-full rounded-lg border border-white/20 bg-black/60 px-4 py-2.5 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
										placeholder="napr. studio@vasweb.sk"
										value={existingConfigEmail}
										onChange={(e) => setExistingConfigEmail(e.target.value)}
									/>
									{existingConfigEmailError && (
										<div className="mt-2 rounded-lg border border-red-500/50 bg-red-500/15 px-3 py-2 text-sm text-red-200">
											{existingConfigEmailError}
										</div>
									)}
									<div className="mt-4 flex justify-end gap-2 text-sm">
										<button
											type="button"
											onClick={() => {
												setExistingDialogOpen(false);
												setExistingConfigEmailError(null);
											}}
											className="rounded-full border border-zinc-600/70 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-400/90 hover:text-zinc-50"
										>
											Zrušiť
										</button>
										<button
											type="button"
											onClick={handleExistingConfirm}
											disabled={existingConfigChecking}
											className="rounded-full bg-purple-500/90 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-500/60"
										>
											{existingConfigChecking ? "Kontrolujem..." : "Pokračovať"}
										</button>
									</div>
								</div>
							</div>
						)}

						<aside>
							{missingFieldsError && (
								<div className="mb-3 rounded-lg border border-red-500/50 bg-red-500/15 px-3 py-2 text-sm text-red-200">
									{missingFieldsError}
								</div>
							)}
							<button
								type="button"
								onClick={handleContinueClick}
								disabled={submitting}
								className="mt-3 w-full rounded-full bg-purple-500/90 px-5 py-2.5 text-sm font-semibold tracking-wide text-white shadow-[0_0_25px_rgba(168,85,247,0.6)] transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-500/60"
							>
								Pokračovať
							</button>
						</aside>
					</div>
				</div>
			</div>
		</section>
	);
}
