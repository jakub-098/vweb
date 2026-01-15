"use client";

import { useState } from "react";

export default function ConfigPage() {
	const [theme, setTheme] = useState<"tmava" | "svetla">("tmava");
	const [accent, setAccent] = useState<"purple" | "blue" | "green" | "orange" | "pink">("purple");
	const [hosting, setHosting] = useState<"potrebujem" | "mam">("potrebujem");
	const [mail, setMail] = useState<"potrebujem" | "mam">("potrebujem");

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

							<div className="space-y-6 rounded-2xl border border-purple-300/25 bg-black/40 p-5 text-sm text-zinc-100 shadow-[0_18px_60px_rgba(0,0,0,0.9)]">
								<p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-purple-200/80">
									Nastavenia vzhľadu a techniky
								</p>

								<div className="grid gap-6 sm:grid-cols-2">
									{/* Ľavý stĺpec: téma, akcent, font */}
									<div className="space-y-4">
										<div className="space-y-2">
											<p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-300/90">
												Téma
											</p>
											<div className="inline-flex rounded-full border border-purple-300/40 bg-black/40 p-0.5 text-xs">
												<button
													type="button"
													onClick={() => setTheme("tmava")}
													className={`rounded-full px-3 py-1 font-medium transition ${
														theme === "tmava"
															? "bg-purple-500/80 text-white"
															: "text-zinc-300"
													}`}
												>
													Tmavá
												</button>
												<button
													type="button"
													onClick={() => setTheme("svetla")}
													className={`rounded-full px-3 py-1 font-medium transition ${
														theme === "svetla"
															? "bg-purple-500/80 text-white"
															: "text-zinc-300"
													}`}
												>
													Svetlá
												</button>
											</div>
										</div>

										<div className="space-y-2">
											<p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-300/90">
												Akcent farba
											</p>
											<div className="space-y-2 text-xs">
												<label className="flex items-center gap-3">
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
												<label className="flex items-center gap-3">
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
												<label className="flex items-center gap-3">
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
												<label className="flex items-center gap-3">
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
												<label className="flex items-center gap-3">
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
											</div>
										</div>

										<div className="space-y-2">
											<p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-300/90">
												Vlastný font <span className="text-zinc-500">(voliteľné)</span>
											</p>
											<input
												type="text"
												placeholder="Napr. 'Inter', 'Space Grotesk'"
												className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
											/>
										</div>
									</div>

									{/* Pravý stĺpec: doména, hosting, mail */}
									<div className="space-y-4">
										<div className="space-y-2">
											<p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-300/90">
												Doména
											</p>
											<div className="space-y-2 text-xs">
												<label className="flex items-center gap-2">
													<input type="radio" name="domain" className="h-3.5 w-3.5 accent-purple-500" />
													<span>Mám vlastnú:</span>
													<input
														type="text"
														placeholder="napr. www.mojadomena.sk"
														className="flex-1 rounded-lg border border-white/15 bg-black/50 px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
													/>
												</label>
												<label className="flex items-center gap-2">
													<input type="radio" name="domain" className="h-3.5 w-3.5 accent-purple-500" />
													<span>Nemám, ale chcem túto:</span>
													<input
														type="text"
														placeholder="napr. www.vasweb.sk"
														className="flex-1 rounded-lg border border-white/15 bg-black/50 px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
													/>
												</label>
											</div>
										</div>

										<div className="space-y-2">
											<p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-300/90">
												Hosting
											</p>
											<div className="inline-flex rounded-full border border-purple-300/40 bg-black/40 p-0.5 text-xs">
												<button
													type="button"
													onClick={() => setHosting("potrebujem")}
													className={`rounded-full px-3 py-1 font-medium transition ${
														hosting === "potrebujem"
															? "bg-purple-500/80 text-white"
															: "text-zinc-300"
													}`}
												>
													Potrebujem
												</button>
												<button
													type="button"
													onClick={() => setHosting("mam")}
													className={`rounded-full px-3 py-1 font-medium transition ${
														hosting === "mam"
															? "bg-purple-500/80 text-white"
															: "text-zinc-300"
													}`}
												>
													Mám vlastný
												</button>
											</div>
										</div>

										<div className="space-y-2">
											<p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-300/90">
												Mail
											</p>
											<div className="inline-flex rounded-full border border-purple-300/40 bg-black/40 p-0.5 text-xs">
												<button
													type="button"
													onClick={() => setMail("potrebujem")}
													className={`rounded-full px-3 py-1 font-medium transition ${
														mail === "potrebujem"
															? "bg-purple-500/80 text-white"
															: "text-zinc-300"
													}`}
												>
													Potrebujem
												</button>
												<button
													type="button"
													onClick={() => setMail("mam")}
													className={`rounded-full px-3 py-1 font-medium transition ${
														mail === "mam"
															? "bg-purple-500/80 text-white"
															: "text-zinc-300"
													}`}
												>
													Mám vlastný
												</button>
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
								Toto je zatiaľ len štruktúra – konkrétny proces a políčka
								vieš upraviť podľa toho, ako budeš s klientmi pracovať.
							</div>
						</aside>
					</div>
				</div>
			</div>
		</section>
	);
}

