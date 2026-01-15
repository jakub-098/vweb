"use client";

import { useEffect, useState } from "react";

export default function ConfigPage() {
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

	async function checkDomainAvailability() {
		if (domainOption !== "request") return;

		const domain = domainRequest.trim();
		if (!domain) {
			setDomainAvailable(null);
			setDomainCheckMessage("Prosím zadaj doménu, ktorú chceš skontrolovať.");
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
				body: JSON.stringify({ domain }),
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

	async function handleSubmit() {
		setSubmitting(true);
		setSubmitMessage(null);

		// doména je povinná
		if (
			!domainOption ||
			(domainOption === "own" && domainOwn.trim().length === 0) ||
			(domainOption === "request" && domainRequest.trim().length === 0)
		) {
			setSubmitting(false);
			setSubmitMessage("Prosím vyplň doménu – je povinná.");
			return;
		}

		// ak chceš novú doménu, over jej dostupnosť
		if (domainOption === "request") {
			const domain = domainRequest.trim();
			try {
				const response = await fetch("/api/domain-check", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ domain }),
				});

				if (!response.ok) {
					setSubmitting(false);
					setDomainAvailable(null);
					setDomainCheckMessage("Nepodarilo sa overiť doménu. Skús to neskôr.");
					return;
				}

				const data = await response.json();

				if (!data.available) {
					setSubmitting(false);
					setDomainAvailable(false);
					setDomainCheckMessage("Domena je obsadena");
					setSubmitMessage("Domena je obsadena – vyber prosím inú.");
					return;
				}

				setDomainAvailable(true);
				setDomainCheckMessage("Doména je voľná – super!");
			} catch (error) {
				console.error("Error checking domain before submit", error);
				setSubmitting(false);
				setDomainAvailable(null);
				setDomainCheckMessage("Nepodarilo sa overiť doménu. Skús to neskôr.");
				return;
			}
		}

		try {
			const response = await fetch("/api/orders", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					theme,
					accentColor: accent,
					accentCustom,
					mailOption: mail,
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
				}),
			});

			if (!response.ok) {
				throw new Error("Request failed");
			}

			setSubmitMessage("Konfigurácia bola odoslaná. Čoskoro sa ti ozvem.");
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

	return (
		<section className="flex min-h-screen w-full items-center justify-center px-4 py-16 text-zinc-50 sm:px-8">
			<div className="relative w-full max-w-6xl sm:w-4/5 lg:w-2/3">
				<div
					className="pointer-events-none absolute -inset-[3px] rounded-2xl bg-gradient-to-b from-purple-500/45 via-transparent to-transparent opacity-70 blur-xl"
					aria-hidden
				/>

				<div className="relative overflow-hidden rounded-2xl border border-purple-300/20 bg-black/60 px-7 py-10 shadow-[0_24px_80px_rgba(0,0,0,0.95)] backdrop-blur-3xl sm:px-11 sm:py-12">
					<div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70" />

					<header className="mb-10 max-w-2xl">
						<p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-purple-200/80">
							Konfigurátor
						</p>
						<h1 className="mt-3 text-2xl font-semibold sm:text-3xl md:text-4xl">
							Vyber si, z akých častí sa má tvoj web skladať.
						</h1>
						<p className="mt-4 text-sm leading-relaxed text-zinc-200/90 sm:text-base">
							Zaškrtni len tie sekcie, ktoré na svojej webke naozaj potrebuješ.
							Podľa výberu pripravím štruktúru a návrh riešenia.
						</p>
					</header>

					<div className="grid gap-8 md:grid-cols-[1.6fr,1fr]">
						<div className="space-y-8">
							<div className="space-y-3">
								<label className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-300/90">
									Vyberte, aké komponenty potrebujete na vašej webke
								</label>
								<p className="text-xs text-zinc-400/90 sm:text-sm">
									Zaškrtnite sekcie, ktoré chcete mať na stránke. Ku každej
									sekcii si neskôr vieš doplniť vlastný náhľad.
								</p>

								<div className="space-y-4">
									<label className="group flex cursor-pointer items-center gap-6 rounded-xl border border-purple-300/40 bg-black/40 p-4 text-left text-sm text-zinc-100 transition hover:border-purple-200/80 hover:bg-black/70">
										<input
											type="checkbox"
											className="h-4 w-4 accent-purple-500"
											checked={sectionAbout}
											onChange={(e) => setSectionAbout(e.target.checked)}
										/>
										<div className="h-40 w-72 flex-none rounded-lg bg-zinc-900/80" />
										<div>
											<div className="text-lg font-semibold sm:text-xl">O nás</div>
											<p className="mt-1 text-xs text-zinc-400/90">
												Krátke predstavenie firmy alebo projektu.
											</p>
										</div>
									</label>

									<label className="group flex cursor-pointer items-center gap-6 rounded-xl border border-purple-300/40 bg-black/40 p-4 text-left text-sm text-zinc-100 transition hover:border-purple-200/80 hover:bg-black/70">
										<input
											type="checkbox"
											className="h-4 w-4 accent-purple-500"
											checked={sectionCards}
											onChange={(e) => setSectionCards(e.target.checked)}
										/>
										<div className="h-40 w-72 flex-none rounded-lg bg-zinc-900/80" />
										<div>
											<div className="text-lg font-semibold sm:text-xl">Karty</div>
											<p className="mt-1 text-xs text-zinc-400/90">
												Prehľadné boxy napríklad pre služby alebo benefity.
											</p>
										</div>
									</label>

									<label className="group flex cursor-pointer items-center gap-6 rounded-xl border border-purple-300/40 bg-black/40 p-4 text-left text-sm text-zinc-100 transition hover:border-purple-200/80 hover:bg-black/70">
										<input
											type="checkbox"
											className="h-4 w-4 accent-purple-500"
											checked={sectionFaq}
											onChange={(e) => setSectionFaq(e.target.checked)}
										/>
										<div className="h-40 w-72 flex-none rounded-lg bg-zinc-900/80" />
										<div>
											<div className="text-lg font-semibold sm:text-xl">Často kladené otázky</div>
											<p className="mt-1 text-xs text-zinc-400/90">
												FAQ blok s najčastejšími otázkami a odpoveďami.
											</p>
										</div>
									</label>

									<label className="group flex cursor-pointer items-center gap-6 rounded-xl border border-purple-300/40 bg-black/40 p-4 text-left text-sm text-zinc-100 transition hover:border-purple-200/80 hover:bg-black/70">
										<input
											type="checkbox"
											className="h-4 w-4 accent-purple-500"
											checked={sectionGallery}
											onChange={(e) => setSectionGallery(e.target.checked)}
										/>
										<div className="h-40 w-72 flex-none rounded-lg bg-zinc-900/80" />
										<div>
											<div className="text-lg font-semibold sm:text-xl">Galéria</div>
											<p className="mt-1 text-xs text-zinc-400/90">
												Obrázková galéria alebo ukážky realizácií.
											</p>
										</div>
									</label>

									<label className="group flex cursor-pointer items-center gap-6 rounded-xl border border-purple-300/40 bg-black/40 p-4 text-left text-sm text-zinc-100 transition hover:border-purple-200/80 hover:bg-black/70">
										<input
											type="checkbox"
											className="h-4 w-4 accent-purple-500"
											checked={sectionOffer}
											onChange={(e) => setSectionOffer(e.target.checked)}
										/>
										<div className="h-40 w-72 flex-none rounded-lg bg-zinc-900/80" />
										<div>
											<div className="text-lg font-semibold sm:text-xl">Ponuka</div>
											<p className="mt-1 text-xs text-zinc-400/90">
												Cenník, balíčky služieb alebo produktov.
											</p>
										</div>
									</label>

									<label className="group flex cursor-pointer items-center gap-6 rounded-xl border border-purple-300/40 bg-black/40 p-4 text-left text-sm text-zinc-100 transition hover:border-purple-200/80 hover:bg-black/70">
										<input
											type="checkbox"
											className="h-4 w-4 accent-purple-500"
											checked={sectionContactForm}
											onChange={(e) => setSectionContactForm(e.target.checked)}
										/>
										<div className="h-40 w-72 flex-none rounded-lg bg-zinc-900/80" />
										<div>
											<div className="text-lg font-semibold sm:text-xl">Kontaktný formulár</div>
											<p className="mt-1 text-xs text-zinc-400/90">
												Jednoduchý formulár pre dopyty a správy.
											</p>
										</div>
									</label>
								</div>
							</div>

							<div className="space-y-6 rounded-2xl border border-purple-300/25 bg-black/40 px-7 py-9 text-base text-zinc-100 shadow-[0_18px_60px_rgba(0,0,0,0.9)]">
								<p className="text-xs sm:text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-purple-200/80">
									Nastavenia vzhľadu a techniky
								</p>

								<div className="space-y-6">
									<div className="space-y-3">
										<p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-200">
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
										<p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-200">
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
													className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
												/>
											</div>
										</div>
									</div>

									<div className="space-y-3">
										<p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-200">
											Vlastný font <span className="text-zinc-500">(voliteľné)</span>
										</p>
										<input
											type="text"
											placeholder="Napr. 'Inter', 'Space Grotesk'"
											className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
											value={customFont}
											onChange={(e) => setCustomFont(e.target.value)}
										/>
									</div>

									<div className="space-y-3">
										<p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-200">
											Doména
										</p>
										<div className="space-y-2 text-sm">
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
													<input
														type="text"
														placeholder="napr. www.vasweb.sk"
														className="flex-1 rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
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
														className="whitespace-nowrap rounded-full bg-purple-500/90 px-3 py-1.5 text-[0.7rem] font-semibold text-white shadow-sm transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
													>
														{domainChecking ? "Kontrolujem..." : "Skontrolovať"}
													</button>
												</div>
											</label>
											{domainOption === "request" && domainCheckMessage && (
												<div
													className={`mt-2 rounded-lg border px-3 py-2 text-xs ${
														domainAvailable === false
															? "border-red-500/50 bg-red-500/15 text-red-200"
															: "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
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
														className="flex-1 rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
														value={domainOwn}
														onChange={(e) => setDomainOwn(e.target.value)}
													/>
												)}
											</label>
										</div>
									</div>

									<div className="space-y-3">
										<p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-200">
											Mail
										</p>
										<div className="inline-flex rounded-full border border-purple-300/40 bg-black/40 p-0.5 text-sm">
											<button
												type="button"
												onClick={() => setMail("potrebujem")}
												className={`rounded-full px-4 py-1.5 font-semibold transition ${
													mail === "potrebujem" ? "bg-purple-500/90 text-white" : "text-zinc-200"
												}`}
											>
												Potrebujem
											</button>
											<button
												type="button"
												onClick={() => setMail("mam")}
												className={`rounded-full px-4 py-1.5 font-semibold transition ${
													mail === "mam" ? "bg-purple-500/90 text-white" : "text-zinc-200"
												}`}
											>
												Mám vlastný
											</button>
										</div>
										{mail === "potrebujem" && (
											<div className="mt-3 space-y-1 text-sm text-zinc-200">
												<p>Zadaj, aký mail by si chcel používať:</p>
												<div className="flex items-center gap-2">
													<input
														type="text"
														placeholder="napr. info"
														className="w-32 rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
														value={mailLocalPart}
														onChange={(e) => setMailLocalPart(e.target.value)}
													/>
													<span className="text-sm text-zinc-300">
														@{domainForEmail}
													</span>
												</div>
											</div>
										)}
										{mail === "mam" && sectionContactForm && (
											<div className="mt-3 space-y-2 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-3 text-xs text-amber-100 sm:text-[0.8rem]">
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
													className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
													value={existingEmail}
													onChange={(e) => setExistingEmail(e.target.value)}
												/>
											</div>
										)}
										{mail && (
											<div className="mt-4 space-y-1">
												<p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-200">Poznámka</p>
												<textarea
													rows={3}
													placeholder="Sem si môžeš dopísať špeciálne požiadavky k e-mailom alebo odosielaniu formulára."
													className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
													value={mailNote}
													onChange={(e) => setMailNote(e.target.value)}
												/>
											</div>
										)}
										<div className="space-y-3 pt-4">
											<p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-200">
												Rýchle dodanie
											</p>
											<div className="flex items-center justify-between gap-3 text-sm">
												<div className="text-zinc-300">Hotové do 24 h</div>
												<div className="inline-flex rounded-full border border-purple-300/40 bg-black/40 p-0.5 text-sm">
													<button
														type="button"
														onClick={() => setFastDelivery("no")}
														className={`rounded-full px-4 py-1.5 font-semibold transition ${
															fastDelivery === "no" ? "bg-purple-500/90 text-white" : "text-zinc-200"
														}`}
													>
														Nie
													</button>
													<button
														type="button"
														onClick={() => setFastDelivery("yes")}
														className={`rounded-full px-4 py-1.5 font-semibold transition ${
															fastDelivery === "yes" ? "bg-purple-500/90 text-white" : "text-zinc-200"
														}`}
													>
														Áno
													</button>
												</div>
											</div>
											<div className="mt-4 space-y-2 rounded-2xl border border-purple-400/40 bg-black/40 px-4 py-4 text-sm text-zinc-100">
												<p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-purple-200">
													Odhadovaná cena projektu
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

						<aside className="space-y-4 rounded-2xl border border-purple-300/25 bg-black/50 px-5 py-5 text-sm text-zinc-200/90 shadow-[0_18px_60px_rgba(0,0,0,0.9)]">
							<h2 className="text-sm font-semibold text-zinc-50">
								Čo sa stane ďalej?
							</h2>
							<ol className="list-decimal space-y-2 pl-4 text-xs sm:text-sm">
								<li>Po odoslaní konfigurácie si prejdem tvoje požiadavky.</li>
								<li>Do 24 hodín sa ozvem s návrhom riešenia a orientačnou cenou.</li>
								<li>Ak ti to sedí, pustíme sa do tvorby webu.</li>
							</ol>
							<div className="pt-1 text-xs text-zinc-400/90">
								Toto je zatiaľ len štruktúra – konkrétny proces a políčka vieš
								upraviť podľa toho, ako budeš s klientmi pracovať.
							</div>
							<button
								type="button"
								onClick={handleSubmit}
								disabled={submitting}
								className="mt-3 w-full rounded-full bg-purple-500/90 px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-[0_0_25px_rgba(168,85,247,0.6)] transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-500/60"
							>
								{submitting ? "Odosielam konfiguráciu..." : "Odoslať konfiguráciu"}
							</button>
							{submitMessage && (
								<p className="pt-1 text-[0.7rem] text-zinc-300/90">
									{submitMessage}
								</p>
							)}
						</aside>
					</div>
				</div>
			</div>
		</section>
	);
}
