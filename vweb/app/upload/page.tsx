"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/data/preset";
import { projects } from "@/data/preset";

type Order = {
	id: number;
	section_about?: number | boolean;
	section_cards?: number | boolean;
	section_faq?: number | boolean;
	section_gallery?: number | boolean;
	section_offer?: number | boolean;
	section_contact_form?: number | boolean;
};

type SectionDescriptor = {
	key: string;
	project: Project | null;
};

function isTruthyFlag(value: number | boolean | undefined | null): boolean {
	if (value == null) return false;
	if (typeof value === "boolean") return value;
	return value !== 0;
}

function findProjectForSection(sectionKey: string): Project | null {
	// preset má pre kontaktný formulár preklep v name
	const presetName =
		sectionKey === "section_contact_form" ? "section_contatct_form" : sectionKey;
	return projects.find((p) => p.name === presetName) ?? null;
}

function findDefaultProjectForSection(sectionKey: string): Project | null {
	let defaultName: string | null = null;
	if (sectionKey === "section_cards") defaultName = "default_section_cards";
	else if (sectionKey === "section_offer") defaultName = "default_section_offer";
	else if (sectionKey === "section_faq") defaultName = "default_section_faq";
	else return null;

	return projects.find((p) => p.name === defaultName) ?? null;
}

export default function UploadPage() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [order, setOrder] = useState<Order | null>(null);
	const [sections, setSections] = useState<SectionDescriptor[]>([]);
	const [values, setValues] = useState<Record<string, string>>({});
	const [imagesBySection, setImagesBySection] = useState<Record<string, File[]>>({});
	const [imageModalOpen, setImageModalOpen] = useState(false);
	const [imageModalSectionKey, setImageModalSectionKey] = useState<string | null>(null);
	const [imageModalLimit, setImageModalLimit] = useState(0);
	const [imageModalError, setImageModalError] = useState<string | null>(null);

	useEffect(() => {
		async function loadOrder() {
			try {
				let email: string | null = null;
				if (typeof window !== "undefined") {
					try {
						email = window.localStorage.getItem("vwebOrderEmail");
					} catch {
						email = null;
					}
				}

				if (!email) {
					setError("Nenašli sme e-mail konfigurácie. Vráť sa prosím do konfigurátora.");
					setLoading(false);
					return;
				}

				const res = await fetch("/api/orders/find-by-email", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email }),
				});

				if (!res.ok) {
					setError("Nepodarilo sa načítať konfiguráciu. Skús to neskôr.");
					setLoading(false);
					return;
				}

				const data = await res.json();
				if (!data.success || !data.found || !data.order) {
					setError("Pre tento e-mail sme nenašli konfiguráciu.");
					setLoading(false);
					return;
				}

				const fetchedOrder: Order = data.order;
				setOrder(fetchedOrder);

				const active: SectionDescriptor[] = [];
				if (isTruthyFlag(fetchedOrder.section_about)) {
					active.push({ key: "section_about", project: findProjectForSection("section_about") });
				}
				if (isTruthyFlag(fetchedOrder.section_cards)) {
					active.push({ key: "section_cards", project: findProjectForSection("section_cards") });
				}
				if (isTruthyFlag(fetchedOrder.section_offer)) {
					active.push({ key: "section_offer", project: findProjectForSection("section_offer") });
				}
				if (isTruthyFlag(fetchedOrder.section_gallery)) {
					active.push({ key: "section_gallery", project: findProjectForSection("section_gallery") });
				}
				if (isTruthyFlag(fetchedOrder.section_faq)) {
					active.push({ key: "section_faq", project: findProjectForSection("section_faq") });
				}
				if (isTruthyFlag(fetchedOrder.section_contact_form)) {
					active.push({
						key: "section_contact_form",
						project: findProjectForSection("section_contact_form"),
					});
				}

				setSections(active);
				setLoading(false);
			} catch (err) {
				console.error("Failed to load order for upload page", err);
				setError("Pri načítaní konfigurácie nastala chyba. Skús to neskôr.");
				setLoading(false);
			}
		}

		loadOrder();
	}, []);

	function updateValue(sectionKey: string, field: string, index: number, value: string) {
		const key = `${sectionKey}.${field}.${index}`;
		setValues((prev) => ({ ...prev, [key]: value }));
	}

	function openImageModal(sectionKey: string, maxImages: number) {
		setImageModalSectionKey(sectionKey);
		setImageModalLimit(maxImages);
		setImageModalError(null);
		setImageModalOpen(true);
	}

	function closeImageModal() {
		setImageModalOpen(false);
		setImageModalSectionKey(null);
		setImageModalLimit(0);
		setImageModalError(null);
	}

	function addFilesToCurrentSection(fileList: FileList | null) {
		if (!fileList || !imageModalSectionKey || imageModalLimit <= 0) return;
		const incoming = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
		if (incoming.length === 0) return;

		setImagesBySection((prev) => {
			const existing = prev[imageModalSectionKey!] ?? [];
			const availableSlots = Math.max(imageModalLimit - existing.length, 0);
			const toAdd = availableSlots > 0 ? incoming.slice(0, availableSlots) : [];
			const next = { ...prev };
			if (toAdd.length > 0) {
				next[imageModalSectionKey!] = [...existing, ...toAdd];
			}
			if (incoming.length > availableSlots) {
				setImageModalError(
					`Môžeš pridať maximálne ${imageModalLimit} obrázkov do tejto sekcie. Niektoré súbory sme nepridali.`,
				);
			} else {
				setImageModalError(null);
			}
			return next;
		});
	}

	return (
		<section className="min-h-screen w-full bg-gradient-to-b from-black via-zinc-950 to-black px-4 py-16 text-zinc-50 sm:px-8">
			<div className="mx-auto w-full max-w-4xl">
				<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
					Nahraj podklady k tvojej webke
				</h1>
				<p className="mt-3 max-w-2xl text-sm text-zinc-300 sm:text-base">
					Nižšie vidíš prehľad sekcií, ktoré si si vybral v konfigurátore,
					spolu s typmi podkladov, ktoré k nim budeme potrebovať.
				</p>

				<div className="mt-8 rounded-2xl border border-purple-300/25 bg-black/60 px-6 py-6 text-sm text-zinc-200 shadow-[0_24px_80px_rgba(0,0,0,0.95)]">
					{loading && <p>Načítavam tvoju konfiguráciu...</p>}
					{!loading && error && (
						<p className="text-sm text-red-300">{error}</p>
					)}
					{!loading && !error && sections.length === 0 && (
						<p>
							Pre túto konfiguráciu nemáme žiadne aktívne sekcie. Skús sa vrátiť do
							konfigurátora a vybrať aspoň jednu.
						</p>
					)}
					{!loading && !error && sections.length > 0 && (
						<div className="space-y-5">
								{sections.map(({ key, project }) => {
									const imagesForSection = imagesBySection[key] ?? [];
									const defaultProject = findDefaultProjectForSection(key);
									return (
										<div
											key={key}
											className="rounded-xl border border-purple-300/30 bg-black/60 px-4 py-4 text-sm text-zinc-100"
										>
											<p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-purple-200">
												{key}
											</p>
											{!project ? (
												<p className="mt-2 text-xs text-zinc-400">
													Pre túto sekciu nemáme definovaný preset – dohodneme sa individuálne.
												</p>
											) : (
												<div className="mt-3 space-y-3 text-xs text-zinc-200">
													{project.small_title > 0 && (
														<div className="space-y-1">
															<p className="font-semibold text-zinc-100">Malý nadpis</p>
															{Array.from({ length: project.small_title }).map((_, i) => {
																const storageKey = `${key}.small_title.${i}`;
																const presetValue =
																	project.small_title_defaults?.[i] ??
																	(i === 0 ? project.small_title_value : "");
																return (
																	<input
																		key={storageKey}
																		type="text"
																		className="mt-1 w-full rounded-md border border-white/20 bg-black/60 px-3 py-1.5 text-[0.75rem] text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
																		placeholder={`Malý nadpis ${i + 1}`}
																		value={values[storageKey] ?? presetValue}
																		onChange={(e) => updateValue(key, "small_title", i, e.target.value)}
																	/>
																);
															})}
														</div>
													)}
													{project.title > 0 && (
														<div className="space-y-1">
															<p className="font-semibold text-zinc-100">Hlavný nadpis</p>
															{Array.from({ length: project.title }).map((_, i) => {
																const storageKey = `${key}.title.${i}`;
																const presetValue =
																	project.title_defaults?.[i] ??
																	(i === 0 ? project.title_value : "");
																return (
																	<input
																		key={storageKey}
																		type="text"
																		className="mt-1 w-full rounded-md border border-white/20 bg-black/60 px-3 py-1.5 text-[0.75rem] text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
																		placeholder={`Hlavný nadpis ${i + 1}`}
																		value={values[storageKey] ?? presetValue}
																		onChange={(e) => updateValue(key, "title", i, e.target.value)}
																	/>
																);
															})}
														</div>
													)}
													{project.text > 0 && (
														<div className="space-y-1">
															<p className="font-semibold text-zinc-100">Text</p>
															{Array.from({ length: project.text }).map((_, i) => {
																const storageKey = `${key}.text.${i}`;
																const presetValue = project.text_defaults?.[i] ?? "";
																return (
																	<textarea
																		key={storageKey}
																		rows={3}
																		className="mt-1 w-full rounded-md border border-white/20 bg-black/60 px-3 py-1.5 text-[0.75rem] text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
																		placeholder={`Text ${i + 1}`}
																		value={values[storageKey] ?? presetValue}
																		onChange={(e) => updateValue(key, "text", i, e.target.value)}
																	/>
																);
															})}
														</div>
													)}
													{project.images > 0 && (
														<div className="space-y-2">
															<div className="flex items-center justify-between gap-3">
																<p>
																	Obrázky: {imagesForSection.length}/{project.images} nahraných
																</p>
																<button
																	type="button"
																	className="rounded-md border border-purple-400/70 bg-purple-500/20 px-3 py-1 text-[0.7rem] font-medium text-purple-100 hover:bg-purple-500/30"
																	onClick={() => openImageModal(key, project.images)}
																>
																	Nahrať obrázky
																</button>
															</div>
															{imagesForSection.length > 0 && (
																<ul className="space-y-1 text-[0.7rem] text-zinc-300">
																	{imagesForSection.map((file, idx) => (
																		<li key={`${key}-img-${idx}`} className="truncate">
																			{file.name}
																		</li>
																	))}
																</ul>
															)}
														</div>
													)}
													{project.default > 0 && (
														<div className="space-y-2">
															{defaultProject ? (
																<>
																	<p className="font-semibold text-zinc-100">
																		Predvolené položky ({project.default}×)
																	</p>
																	{Array.from({ length: project.default }).map((_, itemIndex) => {
																		const baseKey = `${key}.default.${itemIndex}`;
																		const itemImageKey = `${baseKey}.images`;
																		const itemImages = imagesBySection[itemImageKey] ?? [];
																		return (
																			<div
																				key={baseKey}
																				className="rounded-lg border border-white/10 bg-black/40 px-3 py-3 space-y-2"
																			>
																				<p className="text-[0.7rem] font-medium text-zinc-400">
																					Položka {itemIndex + 1}
																				</p>
																				{defaultProject.small_title > 0 && (
																					<div className="space-y-1">
																						<p className="font-semibold text-zinc-100">
																							Malý nadpis
																						</p>
																						{Array.from({ length: defaultProject.small_title }).map((_, j) => {
																							const storageKey = `${baseKey}.small_title.${j}`;
																							const presetValue =
																								j === 0 ? defaultProject.small_title_value : "";
																							return (
																								<input
																									key={storageKey}
																									type="text"
																									className="mt-1 w-full rounded-md border border-white/20 bg-black/60 px-3 py-1.5 text-[0.7rem] text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
																									placeholder={`Malý nadpis ${j + 1}`}
																									value={values[storageKey] ?? presetValue}
																									onChange={(e) =>
																										updateValue(`${key}.default.${itemIndex}`, "small_title", j, e.target.value)
																									}
																								/>
																							);
																						})}
																					</div>
																				)}
																				{defaultProject.title > 0 && (
																					<div className="space-y-1">
																						<p className="font-semibold text-zinc-100">Hlavný nadpis</p>
																						{Array.from({ length: defaultProject.title }).map((_, j) => {
																							const storageKey = `${baseKey}.title.${j}`;
																							const presetValue = j === 0 ? defaultProject.title_value : "";
																							return (
																								<input
																									key={storageKey}
																									type="text"
																									className="mt-1 w-full rounded-md border border-white/20 bg-black/60 px-3 py-1.5 text-[0.7rem] text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
																									placeholder={`Hlavný nadpis ${j + 1}`}
																									value={values[storageKey] ?? presetValue}
																									onChange={(e) =>
																										updateValue(`${key}.default.${itemIndex}`, "title", j, e.target.value)
																									}
																								/>
																							);
																						})}
																					</div>
																				)}
																				{defaultProject.text > 0 && (
																					<div className="space-y-1">
																						<p className="font-semibold text-zinc-100">Text</p>
																						{Array.from({ length: defaultProject.text }).map((_, j) => {
																							const storageKey = `${baseKey}.text.${j}`;
																							const presetValue = "";
																							return (
																								<textarea
																									key={storageKey}
																									rows={3}
																									className="mt-1 w-full rounded-md border border-white/20 bg-black/60 px-3 py-1.5 text-[0.7rem] text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
																									placeholder={`Text ${j + 1}`}
																									value={values[storageKey] ?? presetValue}
																									onChange={(e) =>
																										updateValue(`${key}.default.${itemIndex}`, "text", j, e.target.value)
																									}
																								/>
																							);
																						})}
																					</div>
																			)}
																			{defaultProject.images > 0 && (
																				<div className="space-y-1">
																					<div className="flex items-center justify-between gap-3">
																						<p>
																							Obrázky položky: {itemImages.length}/{defaultProject.images} nahraných
																						</p>
																						<button
																							type="button"
																							className="rounded-md border border-purple-400/70 bg-purple-500/20 px-3 py-1 text-[0.7rem] font-medium text-purple-100 hover:bg-purple-500/30"
																							onClick={() => openImageModal(itemImageKey, defaultProject.images)}
																						>
																							Nahrať obrázky
																						</button>
																					</div>
																					{itemImages.length > 0 && (
																							<ul className="space-y-1 text-[0.7rem] text-zinc-300">
																								{itemImages.map((file, idx) => (
																									<li key={`${itemImageKey}-img-${idx}`} className="truncate">
																										{file.name}
																									</li>
																								))}
																						</ul>
																					)}
																				</div>
																				)}
																		</div>
																	);
																})}
															</>
														) : (
																<p>
																	Predvolené prvky: {project.default}
																</p>
															)}
														</div>
													)}
												</div>
											)}
										</div>
									);
								})}
						</div>
					)}
				</div>
			</div>

			{imageModalOpen && imageModalSectionKey && (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
					<div className="w-full max-w-md rounded-2xl border border-purple-400/40 bg-zinc-950/95 p-6 text-sm text-zinc-100 shadow-[0_24px_80px_rgba(0,0,0,0.95)]">
						<h2 className="text-base font-semibold text-zinc-50">
							Obrázky pre sekciu {imageModalSectionKey}
						</h2>
						<p className="mt-2 text-xs text-zinc-400">
							Sem presuň obrázky alebo klikni na tlačidlo nižšie. Môžeš pridať
							 maximálne {imageModalLimit} obrázkov.
						</p>
						{imageModalError && (
							<p className="mt-3 rounded-md bg-red-500/15 px-3 py-2 text-[0.7rem] text-red-200">
								{imageModalError}
							</p>
						)}
						<div
							className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-purple-400/60 bg-purple-950/20 px-4 py-8 text-center text-xs text-zinc-300"
							onDragOver={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
							onDrop={(e) => {
								e.preventDefault();
								e.stopPropagation();
								addFilesToCurrentSection(e.dataTransfer.files);
							}}
						>
							<p className="font-medium text-zinc-100">Presuň sem svoje obrázky</p>
							<p className="mt-1 text-[0.7rem] text-zinc-400">
								Podporujeme bežné formáty (JPG, PNG, WEBP...).
							</p>
							<label className="mt-4 inline-flex cursor-pointer items-center rounded-md border border-purple-400/70 bg-purple-500/20 px-3 py-1.5 text-[0.7rem] font-medium text-purple-100 hover:bg-purple-500/30">
								<input
									type="file"
									accept="image/*"
									multiple
									className="hidden"
									onChange={(e) => addFilesToCurrentSection(e.target.files)}
								/>
								<span>Vybrať súbory</span>
							</label>
						</div>
						{imagesBySection[imageModalSectionKey]?.length ? (
							<div className="mt-4 space-y-1 text-[0.7rem] text-zinc-300">
								<p className="font-medium">
									Aktuálne nahraté: {imagesBySection[imageModalSectionKey]!.length}/
									{imageModalLimit}
								</p>
								<ul className="max-h-32 space-y-1 overflow-y-auto rounded-md bg-black/40 px-2 py-2">
									{imagesBySection[imageModalSectionKey]!.map((file, idx) => (
										<li key={`modal-${imageModalSectionKey}-${idx}`} className="truncate">
											{file.name}
										</li>
									))}
								</ul>
							</div>
						) : null}
						<div className="mt-6 flex justify-end gap-2 text-[0.75rem]">
							<button
								type="button"
								className="rounded-md border border-zinc-600 bg-zinc-900 px-3 py-1.5 text-zinc-200 hover:bg-zinc-800"
								onClick={closeImageModal}
							>
								Zavrieť
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
