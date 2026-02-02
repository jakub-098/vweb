"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/data/preset";
import { projects } from "@/data/preset";

const SECTION_PREVIEW_IMAGES: Record<string, string> = {
    section_header: "/previews/header.png",
	section_about: "/previews/about.png",
	section_cards: "/previews/cards.png",
	section_offer: "/previews/services.png",
	section_gallery: "/previews/gallery.png",
	section_faq: "/previews/faq.png",
	section_contact_form: "/previews/mailer.png",
};

type Order = {
	id: number;
	section_header?: number | boolean;
	section_about?: number | boolean;
	section_cards?: number | boolean;
	section_faq?: number | boolean;
	section_gallery?: number | boolean;
	section_offer?: number | boolean;
	section_contact_form?: number | boolean;
	section_footer?: number | boolean;
};

type SectionDescriptor = {
	key: string;
	project: Project | null;
};

function formatSectionHeader(sectionKey: string): string {
	return sectionKey.replace(/_/g, " ");
}

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
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [order, setOrder] = useState<Order | null>(null);
	const [sections, setSections] = useState<SectionDescriptor[]>([]);
	const [values, setValues] = useState<Record<string, string>>({});
	const [imagesBySection, setImagesBySection] = useState<Record<string, File[]>>({});
	const [existingImagesBySection, setExistingImagesBySection] = useState<Record<string, string[]>>({});
	const [defaultItemsBySection, setDefaultItemsBySection] = useState<Record<string, number[]>>({});
	const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
	const [sectionError, setSectionError] = useState<string | null>(null);
	const [imageModalOpen, setImageModalOpen] = useState(false);
	const [imageModalSectionKey, setImageModalSectionKey] = useState<string | null>(null);
	const [imageModalLimit, setImageModalLimit] = useState(0);
	const [imageModalError, setImageModalError] = useState<string | null>(null);

	async function loadExistingSections(orderId: number, active: SectionDescriptor[]) {
		try {
			const newValues: Record<string, string> = {};
			const newDefaults: Record<string, number[]> = {};
			const newExistingImages: Record<string, string[]> = {};

			for (const { key, project } of active) {
				if (!project) continue;

				if (key === "section_header") {
					const res = await fetch(`/api/sections/header?orderId=${orderId}`);
					if (!res.ok) continue;
					const data = await res.json();
					if (!data.success || !data.found || !data.section) continue;
					const section = data.section as any;
					newValues["section_header.small_title.0"] = section.small_title ?? "";
					newValues["section_header.title.0"] = section.title ?? "";
					newValues["section_header.text.0"] = section.text ?? "";
					if (
						section.image_name &&
						typeof section.image_name === "string" &&
						section.image_name.trim().length > 0
					) {
						newExistingImages["section_header"] = [section.image_name];
					}
				}

				if (key === "section_about") {
					const res = await fetch(`/api/sections/about?orderId=${orderId}`);
					if (!res.ok) continue;
					const data = await res.json();
					if (!data.success || !data.found || !data.section) continue;
					const section = data.section as any;
					newValues["section_about.small_title.0"] = section.small_title ?? "";
					newValues["section_about.title.0"] = section.title ?? "";
					newValues["section_about.text.0"] = section.text ?? "";
					if (section.image_name && typeof section.image_name === "string" && section.image_name.trim().length > 0) {
						newExistingImages["section_about"] = [section.image_name];
					}
				}

				if (key === "section_cards") {
					const res = await fetch(`/api/sections/cards?orderId=${orderId}`);
					if (!res.ok) continue;
					const data = await res.json();
					if (!data.success || !data.found || !data.section) continue;
					const section = data.section as any;
					newValues["section_cards.small_title.0"] = section.small_title ?? "";
					newValues["section_cards.title.0"] = section.title ?? "";
					if (section.items_json) {
						let items: any[] = [];
						const raw = section.items_json;
						if (Array.isArray(raw)) {
							items = raw;
						} else if (typeof raw === "string") {
							try {
								items = JSON.parse(raw);
							} catch {
								items = [];
							}
						} else if (raw && typeof raw === "object") {
							items = Array.isArray((raw as any)) ? (raw as any) : [];
						}
						const ids: number[] = [];
						items.forEach((item, index) => {
							const id = index;
							ids.push(id);
							const baseKey = `section_cards.default.${id}`;
							newValues[`${baseKey}.small_title.0`] = item.small_title ?? "";
							newValues[`${baseKey}.title.0`] = item.title ?? "";
							newValues[`${baseKey}.text.0`] = item.text ?? "";
						});
						newDefaults["section_cards"] = ids;
					}
				}

				if (key === "section_offer") {
					const res = await fetch(`/api/sections/offer?orderId=${orderId}`);
					if (!res.ok) continue;
					const data = await res.json();
					if (!data.success || !data.found || !data.section) continue;
					const section = data.section as any;
					newValues["section_offer.small_title.0"] = section.small_title ?? "";
					newValues["section_offer.title.0"] = section.title ?? "";
					newValues["section_offer.text.0"] = section.text ?? "";
					if (section.items_json) {
						let items: any[] = [];
						const raw = section.items_json;
						if (Array.isArray(raw)) {
							items = raw;
						} else if (typeof raw === "string") {
							try {
								items = JSON.parse(raw);
							} catch {
								items = [];
							}
						} else if (raw && typeof raw === "object") {
							items = Array.isArray((raw as any)) ? (raw as any) : [];
						}
						const ids: number[] = [];
						items.forEach((item, index) => {
							const id = index;
							ids.push(id);
							const baseKey = `section_offer.default.${id}`;
							newValues[`${baseKey}.title.0`] = item.title ?? "";
							newValues[`${baseKey}.text.0`] = item.text ?? "";
							if (item.image_name && typeof item.image_name === "string" && item.image_name.trim().length > 0) {
								const itemImageKey = `${baseKey}.images`;
								newExistingImages[itemImageKey] = [item.image_name];
							}
						});
						newDefaults["section_offer"] = ids;
					}
				}

				if (key === "section_gallery") {
					const res = await fetch(`/api/sections/gallery?orderId=${orderId}`);
					if (!res.ok) continue;
					const data = await res.json();
					if (!data.success || !data.found || !data.section) continue;
					const section = data.section as any;
					newValues["section_gallery.small_title.0"] = section.small_title ?? "";
					newValues["section_gallery.title.0"] = section.title ?? "";
					if (section.images_json) {
						let names: string[] = [];
						const raw = section.images_json;
						if (Array.isArray(raw)) {
							names = raw.filter((n: any) => typeof n === "string");
						} else if (typeof raw === "string") {
							try {
								const parsed = JSON.parse(raw);
								if (Array.isArray(parsed)) {
									names = parsed.filter((n: any) => typeof n === "string");
								}
							} catch {
								names = [];
							}
						}
						if (names.length > 0) {
							newExistingImages["section_gallery"] = names;
						}
					}
				}

				if (key === "section_faq") {
					const res = await fetch(`/api/sections/faq?orderId=${orderId}`);
					if (!res.ok) continue;
					const data = await res.json();
					if (!data.success || !data.found || !data.section) continue;
					const section = data.section as any;
					newValues["section_faq.small_title.0"] = section.small_title ?? "";
					newValues["section_faq.title.0"] = section.title ?? "";
					if (section.items_json) {
						let items: any[] = [];
						const raw = section.items_json;
						if (Array.isArray(raw)) {
							items = raw;
						} else if (typeof raw === "string") {
							try {
								items = JSON.parse(raw);
							} catch {
								items = [];
							}
						} else if (raw && typeof raw === "object") {
							items = Array.isArray((raw as any)) ? (raw as any) : [];
						}
						const ids: number[] = [];
						items.forEach((item, index) => {
							const id = index;
							ids.push(id);
							const baseKey = `section_faq.default.${id}`;
							newValues[`${baseKey}.title.0`] = item.question ?? "";
							newValues[`${baseKey}.text.0`] = item.answer ?? "";
						});
						newDefaults["section_faq"] = ids;
					}
				}
				if (key === "section_contact_form") {
					const res = await fetch(`/api/sections/contact-form?orderId=${orderId}`);
					if (!res.ok) continue;
					const data = await res.json();
					if (!data.success || !data.found || !data.section) continue;
					const section = data.section as any;
					newValues["section_contact_form.small_title.0"] = section.small_title ?? "";
					newValues["section_contact_form.title.0"] = section.title ?? "";
					newValues["section_contact_form.text.0"] = section.text ?? "";
				}

				if (key === "section_footer") {
					const res = await fetch(`/api/sections/footer?orderId=${orderId}`);
					if (!res.ok) continue;
					const data = await res.json();
					if (!data.success || !data.found || !data.section) continue;
					const section = data.section as any;
					newValues["section_footer.title.0"] = section.title ?? "";
					newValues["section_footer.text.0"] = section.text ?? "";
					newValues["section_footer.mobile.0"] = section.mobile ?? "";
				}
			}

			if (Object.keys(newValues).length > 0) {
				setValues((prev) => ({ ...prev, ...newValues }));
			}
			if (Object.keys(newDefaults).length > 0) {
				setDefaultItemsBySection((prev) => ({ ...prev, ...newDefaults }));
			}
			if (Object.keys(newExistingImages).length > 0) {
				setExistingImagesBySection((prev) => ({ ...prev, ...newExistingImages }));
			}
		} catch (err) {
			console.error("Failed to load existing section content", err);
		}
	}

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
					router.replace("/config");
					return;
				}

				const res = await fetch("/api/orders/find-by-email", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email }),
				});

				if (!res.ok) {
					router.replace("/config");
					return;
				}

				const data = await res.json();
				if (!data.success || !data.found || !data.order) {
					router.replace("/config");
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

				// Header a footer sú povinné sekcie – pridáme ich na začiatok a koniec.
				const activeWithFixed: SectionDescriptor[] = [];
				const headerProject = findProjectForSection("section_header");
				if (headerProject) {
					activeWithFixed.push({ key: "section_header", project: headerProject });
				}
				activeWithFixed.push(...active);
				const footerProject = findProjectForSection("section_footer");
				if (footerProject) {
					activeWithFixed.push({ key: "section_footer", project: footerProject });
				}

				const initialDefaults: Record<string, number[]> = {};
				for (const { key, project } of activeWithFixed) {
					if (project && project.default > 0) {
						initialDefaults[key] = [0];
					}
				}
				setDefaultItemsBySection(initialDefaults);
				setSections(activeWithFixed);
				setCurrentSectionIndex(0);

				await loadExistingSections(fetchedOrder.id, activeWithFixed);
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

	async function deleteExistingImage(sectionKey: string, fileName: string, itemIndex?: number) {
		if (!order) return;
		const orderId = order.id;
		try {
			let url = "";
			if (sectionKey === "section_about") {
				url = `/api/sections/about?orderId=${orderId}`;
			} else if (sectionKey === "section_gallery") {
				url = `/api/sections/gallery?orderId=${orderId}&imageName=${encodeURIComponent(fileName)}`;
			} else if (sectionKey.startsWith("section_offer.default.")) {
				const match = sectionKey.match(/section_offer\.default\.(\d+)\.images/);
				const idx = match ? Number(match[1]) : Number.isFinite(itemIndex ?? NaN) ? (itemIndex as number) : NaN;
				if (!Number.isNaN(idx)) {
					url = `/api/sections/offer?orderId=${orderId}&itemIndex=${idx}`;
				}
			}

			if (!url) return;
			const res = await fetch(url, { method: "DELETE" });
			if (!res.ok) return;

			setExistingImagesBySection((prev) => {
				const current = prev[sectionKey] ?? [];
				const nextArray = current.filter((name) => name !== fileName);
				const next: Record<string, string[]> = { ...prev };
				if (nextArray.length > 0) {
					next[sectionKey] = nextArray;
				} else {
					delete next[sectionKey];
				}
				return next;
			});
		} catch (err) {
			console.error("Failed to delete existing image", err);
		}
	}

	function removeImageFromSection(sectionKey: string, index: number) {
		setImagesBySection((prev) => {
			const current = prev[sectionKey] ?? [];
			if (!current.length || index < 0 || index >= current.length) return prev;
			const nextArray = current.filter((_, i) => i !== index);
			const next: Record<string, File[]> = { ...prev };
			if (nextArray.length > 0) {
				next[sectionKey] = nextArray;
			} else {
				delete next[sectionKey];
			}
			return next;
		});
	}

	function addDefaultItem(sectionKey: string, maxItems: number) {
		if (maxItems <= 0) return;
		setDefaultItemsBySection((prev) => {
			const current = prev[sectionKey] ?? [];
			if (current.length >= maxItems) return prev;
			const nextId = current.length === 0 ? 0 : Math.max(...current) + 1;
			return { ...prev, [sectionKey]: [...current, nextId] };
		});
	}

	function validateSection(sectionKey: string, project: Project | null): boolean {
		if (!project) {
			return true;
		}

		const errors: string[] = [];

		function checkField(storageKey: string, presetValue: string | undefined) {
			const effective = (values[storageKey] ?? presetValue ?? "").trim();
			if (!effective) {
				errors.push(storageKey);
			}
		}

		if (project.small_title > 0) {
			for (let i = 0; i < project.small_title; i++) {
				const storageKey = `${sectionKey}.small_title.${i}`;
				const presetValue =
					project.small_title_defaults?.[i] ?? (i === 0 ? project.small_title_value : "");
				checkField(storageKey, presetValue);
			}
		}

		if (project.title > 0) {
			for (let i = 0; i < project.title; i++) {
				const storageKey = `${sectionKey}.title.${i}`;
				const presetValue = project.title_defaults?.[i] ?? (i === 0 ? project.title_value : "");
				checkField(storageKey, presetValue);
			}
		}

		if (project.text > 0) {
			for (let i = 0; i < project.text; i++) {
				const storageKey = `${sectionKey}.text.${i}`;
				const presetValue = project.text_defaults?.[i] ?? "";
				checkField(storageKey, presetValue);
			}
		}

		const defaultProject = findDefaultProjectForSection(sectionKey);
		const defaultItemIds = defaultItemsBySection[sectionKey] ?? [];

		if (defaultProject && defaultItemIds.length > 0) {
			for (const itemId of defaultItemIds) {
				const baseKey = `${sectionKey}.default.${itemId}`;

				if (defaultProject.small_title > 0) {
					for (let j = 0; j < defaultProject.small_title; j++) {
						const storageKey = `${baseKey}.small_title.${j}`;
						const presetValue = j === 0 ? defaultProject.small_title_value : "";
						checkField(storageKey, presetValue);
					}
				}

				if (defaultProject.title > 0) {
					for (let j = 0; j < defaultProject.title; j++) {
						const storageKey = `${baseKey}.title.${j}`;
						const presetValue = j === 0 ? defaultProject.title_value : "";
						checkField(storageKey, presetValue);
					}
				}

				if (defaultProject.text > 0) {
					for (let j = 0; j < defaultProject.text; j++) {
						const storageKey = `${baseKey}.text.${j}`;
						const presetValue = "";
						checkField(storageKey, presetValue);
					}
				}

				// Ak majú predvolené položky obrázky (napr. ponuka služieb), vyžadujeme aspoň jeden obrázok na položku
				if (defaultProject.images > 0) {
					const itemImageKey = `${sectionKey}.default.${itemId}.images`;
					const existingItemImages = existingImagesBySection[itemImageKey]?.length ?? 0;
					const newItemImages = imagesBySection[itemImageKey]?.length ?? 0;
					if (existingItemImages + newItemImages === 0) {
						setSectionError("Nahraj prosím aspoň jeden obrázok pre každú položku v tejto sekcii.");
						return false;
					}
				}
			}
		}

		// Ak má sekcia obrázky (okrem sekcie O nás), vyžadujeme aspoň jeden obrázok
		if (project.images > 0 && sectionKey !== "section_about") {
			const existingSectionImages = existingImagesBySection[sectionKey]?.length ?? 0;
			const newSectionImages = imagesBySection[sectionKey]?.length ?? 0;
			if (existingSectionImages + newSectionImages === 0) {
				setSectionError("Nahraj prosím aspoň jeden obrázok pre túto sekciu.");
				return false;
			}
		}

		if (errors.length > 0) {
			setSectionError("Vyplň prosím všetky textové polia v tejto sekcii.");
			return false;
		}

		// Špeciálna validácia pre footer – vyžadujeme aj telefónne číslo.
		if (sectionKey === "section_footer") {
			const mobileRaw = (values["section_footer.mobile.0"] ?? "").trim();
			if (!mobileRaw) {
				setSectionError("Vyplň prosím telefónne číslo v päte webu.");
				return false;
			}
		}

		setSectionError(null);
		return true;
	}

	function handleNextSection() {
		if (!sections.length) return;
		const current = sections[currentSectionIndex];
		if (!current) return;

		const isValid = validateSection(current.key, current.project);
		if (!isValid) return;

		// after validation send this section to API, then move on
		sendCurrentSection(current.key)
			.then((ok) => {
				if (!ok) return;
				if (currentSectionIndex < sections.length - 1) {
					setCurrentSectionIndex((prev) => prev + 1);
				} else {
					router.push("/summary");
				}
			})
			.catch((err) => {
				console.error("Failed to send section", err);
			});
	}

	function handlePrevSection() {
		if (currentSectionIndex === 0) return;
		setSectionError(null);
		setCurrentSectionIndex((prev) => Math.max(prev - 1, 0));
	}

	function removeDefaultItem(sectionKey: string, itemId: number) {
		setDefaultItemsBySection((prev) => {
			const current = prev[sectionKey] ?? [];
			const next = current.filter((id) => id !== itemId);
			return { ...prev, [sectionKey]: next };
		});
	}

	async function sendCurrentSection(sectionKey: string): Promise<boolean> {
		if (!order) return false;

		const userEmail = (order as any).user_email ?? null;
		const orderId = order.id;
		if (!userEmail || !orderId) return false;

		const project = findProjectForSection(sectionKey);
		if (!project) return true; // nothing to send

		try {
			if (sectionKey === "section_header") {
				const smallTitle = (
					values[`${sectionKey}.small_title.0`] ?? project.small_title_value ?? ""
				).trim();
				const title = (values[`${sectionKey}.title.0`] ?? project.title_value ?? "").trim();
				const text = (values[`${sectionKey}.text.0`] ?? "").trim();
				const imageFiles = imagesBySection[sectionKey] ?? [];
				const imageFile = imageFiles[0];

				const formData = new FormData();
				formData.append("orderId", String(orderId));
				formData.append("userEmail", String(userEmail));
				formData.append("smallTitle", smallTitle);
				formData.append("title", title);
				formData.append("text", text);
				if (imageFile) {
					formData.append("image", imageFile);
				}

				const res = await fetch("/api/sections/header", {
					method: "POST",
					body: formData,
				});
				return res.ok;
			}

			if (sectionKey === "section_about") {
				const smallTitle = (values[`${sectionKey}.small_title.0`] ?? project.small_title_value ?? "").trim();
				const title = (values[`${sectionKey}.title.0`] ?? project.title_value ?? "").trim();
				const text = (values[`${sectionKey}.text.0`] ?? "").trim();
				const imageFiles = imagesBySection[sectionKey] ?? [];
				const imageFile = imageFiles[0];

				const formData = new FormData();
				formData.append("orderId", String(orderId));
				formData.append("userEmail", String(userEmail));
				formData.append("smallTitle", smallTitle);
				formData.append("title", title);
				formData.append("text", text);
				if (imageFile) {
					formData.append("image", imageFile);
				}

				const res = await fetch("/api/sections/about", {
					method: "POST",
					body: formData,
				});
				return res.ok;
			}

			if (sectionKey === "section_cards") {
				const smallTitle = (values[`${sectionKey}.small_title.0`] ?? project.small_title_value ?? "").trim();
				const title = (values[`${sectionKey}.title.0`] ?? project.title_value ?? "").trim();
				const defaultProject = findDefaultProjectForSection(sectionKey);
				const defaultItemIds = defaultItemsBySection[sectionKey] ?? [];
				const items = defaultProject
					? defaultItemIds.map((itemId) => {
						const baseKey = `${sectionKey}.default.${itemId}`;
						return {
							small_title: (values[`${baseKey}.small_title.0`] ?? defaultProject.small_title_value ?? "").trim(),
							title: (values[`${baseKey}.title.0`] ?? defaultProject.title_value ?? "").trim(),
							text: (values[`${baseKey}.text.0`] ?? "").trim(),
						};
					})
					: [];

				const res = await fetch("/api/sections/cards", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ orderId, userEmail, smallTitle, title, items }),
				});
				return res.ok;
			}

			if (sectionKey === "section_offer") {
				const smallTitle = (values[`${sectionKey}.small_title.0`] ?? project.small_title_value ?? "").trim();
				const title = (values[`${sectionKey}.title.0`] ?? project.title_value ?? "").trim();
				const text = (values[`${sectionKey}.text.0`] ?? "").trim();
				const defaultProject = findDefaultProjectForSection(sectionKey);
				const defaultItemIds = defaultItemsBySection[sectionKey] ?? [];
				const items = defaultProject
					? defaultItemIds.map((itemId) => {
						const baseKey = `${sectionKey}.default.${itemId}`;
						return {
							title: (values[`${baseKey}.title.0`] ?? defaultProject.title_value ?? "").trim(),
							text: (values[`${baseKey}.text.0`] ?? "").trim(),
						};
					})
					: [];

				const formData = new FormData();
				formData.append("orderId", String(orderId));
				formData.append("userEmail", String(userEmail));
				formData.append("smallTitle", smallTitle);
				formData.append("title", title);
				formData.append("text", text);
				formData.append("items", JSON.stringify(items));

				if (defaultProject) {
					defaultItemIds.forEach((itemId, index) => {
						const baseKey = `${sectionKey}.default.${itemId}`;
						const itemImageKey = `${baseKey}.images`;
						const itemImages = imagesBySection[itemImageKey] ?? [];
						const file = itemImages[0];
						if (file) {
							formData.append(`itemImage_${index}`, file);
						}
					});
				}

				const res = await fetch("/api/sections/offer", {
					method: "POST",
					body: formData,
				});
				return res.ok;
			}

			if (sectionKey === "section_gallery") {
				const smallTitle = (values[`${sectionKey}.small_title.0`] ?? project.small_title_value ?? "").trim();
				const title = (values[`${sectionKey}.title.0`] ?? project.title_value ?? "").trim();
				const imageFiles = imagesBySection[sectionKey] ?? [];

				const formData = new FormData();
				formData.append("orderId", String(orderId));
				formData.append("userEmail", String(userEmail));
				formData.append("smallTitle", smallTitle);
				formData.append("title", title);
				imageFiles.forEach((file) => {
					formData.append("images", file);
				});

				const res = await fetch("/api/sections/gallery", {
					method: "POST",
					body: formData,
				});
				return res.ok;
			}

			if (sectionKey === "section_faq") {
				const smallTitle = (values[`${sectionKey}.small_title.0`] ?? project.small_title_value ?? "").trim();
				const title = (values[`${sectionKey}.title.0`] ?? project.title_value ?? "").trim();
				const defaultProject = findDefaultProjectForSection(sectionKey);
				const defaultItemIds = defaultItemsBySection[sectionKey] ?? [];
				const items = defaultProject
					? defaultItemIds.map((itemId) => {
						const baseKey = `${sectionKey}.default.${itemId}`;
						return {
							question: (values[`${baseKey}.title.0`] ?? defaultProject.title_value ?? "").trim(),
							answer: (values[`${baseKey}.text.0`] ?? "").trim(),
						};
					})
					: [];

				const res = await fetch("/api/sections/faq", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ orderId, userEmail, smallTitle, title, items }),
				});
				return res.ok;
			}

			if (sectionKey === "section_contact_form") {
				const smallTitle = (values[`${sectionKey}.small_title.0`] ?? project.small_title_value ?? "").trim();
				const title = (values[`${sectionKey}.title.0`] ?? project.title_value ?? "").trim();
				const text = (values[`${sectionKey}.text.0`] ?? "").trim();

				const res = await fetch("/api/sections/contact-form", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ orderId, userEmail, smallTitle, title, text }),
				});
				return res.ok;
			}

			if (sectionKey === "section_footer") {
				const title = (values["section_footer.title.0"] ?? project.title_value ?? "").trim();
				const text = (values["section_footer.text.0"] ?? "").trim();
				const mobile = (values["section_footer.mobile.0"] ?? "").trim();

				const res = await fetch("/api/sections/footer", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ orderId, userEmail, title, text, mobile }),
				});
				return res.ok;
			}

			return true;
		} catch (e) {
			console.error("Error sending section", e);
			return false;
		}
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
							{sections[currentSectionIndex] && (() => {
								const { key, project } = sections[currentSectionIndex]!;
										const imagesForSection = imagesBySection[key] ?? [];
										const existingSectionImages = existingImagesBySection[key] ?? [];
								const defaultProject = findDefaultProjectForSection(key);
								const defaultItemIds = defaultItemsBySection[key] ?? [];
								const maxDefaultItems = project?.default ?? 0;
								const currentDefaultCount = defaultItemIds.length;
								const previewImage = SECTION_PREVIEW_IMAGES[key];

								return (
									<div
										key={key}
										className="rounded-xl border border-purple-300/30 bg-black/60 px-4 py-4 text-sm text-zinc-100"
									>
										<p className="mt-2 mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-purple-100 sm:text-lg">
											{project?.visible_name ?? project?.small_title_value ?? formatSectionHeader(key)}
										</p>
										<div className="flex items-center justify-between gap-3 mb-3">
											<button
												type="button"
												className="text-xs font-medium text-purple-200 hover:text-purple-100 disabled:opacity-40"
												onClick={handlePrevSection}
												disabled={currentSectionIndex === 0}
											>
												<span className="mr-1">←</span> Späť
												</button>
												<p className="text-xs font-medium text-zinc-400">
													Sekcia {currentSectionIndex + 1} / {sections.length}
												</p>
										</div>
										{previewImage && (
											<div className="mb-4 overflow-hidden rounded-lg border border-white/10 bg-black/60 w-full">
												<div
													className="h-40 w-full bg-cover bg-center sm:h-52 md:h-64"
													style={{ backgroundImage: `url(${previewImage})` }}
													aria-label={`Náhľad sekcie ${project?.visible_name ?? project?.small_title_value ?? formatSectionHeader(key)}`}
												/>
											</div>
										)}
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
																	required
																	className="mt-1 w-full rounded-md border border-white/20 bg-black/60 px-3 py-1.5 text-[0.75rem] text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
																	    placeholder={presetValue || `Malý nadpis ${i + 1}`}
																		    value={values[storageKey] ?? ""}
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
																	required
																	className="mt-1 w-full rounded-md border border-white/20 bg-black/60 px-3 py-1.5 text-[0.75rem] text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
																	placeholder={presetValue || `Hlavný nadpis ${i + 1}`}
																	value={values[storageKey] ?? ""}
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
																	required
																	className="mt-1 w-full rounded-md border border-white/20 bg-black/60 px-3 py-1.5 text-[0.75rem] text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
																	placeholder={presetValue || `Text ${i + 1}`}
																	value={values[storageKey] ?? ""}
																	onChange={(e) => updateValue(key, "text", i, e.target.value)}
																/>
															);
														})}
													</div>
												)}
													{key === "section_footer" && (
														<div className="space-y-1">
															<p className="font-semibold text-zinc-100">Telefón</p>
															<input
																type="text"
																required
																className="mt-1 w-full rounded-md border border-white/20 bg-black/60 px-3 py-1.5 text-[0.75rem] text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
																placeholder="Napíš telefónne číslo, ktoré zobrazíme v päte"
																value={values["section_footer.mobile.0"] ?? ""}
																onChange={(e) => updateValue("section_footer", "mobile", 0, e.target.value)}
															/>
														</div>
													)}
												{project.images > 0 && key !== "section_about" && (
													<div className="space-y-2">
														<div className="flex items-center justify-between gap-3">
															<div className="flex flex-col gap-0.5">
																<p>
																	Obrázky: {existingSectionImages.length + imagesForSection.length}/{project.images} nahraných
																</p>
																{key === "section_header" && (
																	<p className="text-[0.65rem] text-zinc-400">
																		Pre túto sekciu nahraj 2 obrázky: <span className="font-medium">BG image</span> (pozadie) a <span className="font-medium">logo</span>.
																	</p>
																)}
															</div>
															<button
																type="button"
																className="rounded-md border border-purple-400/70 bg-purple-500/20 px-3 py-1 text-[0.7rem] font-medium text-purple-100 hover:bg-purple-500/30"
																onClick={() => openImageModal(key, project.images)}
															>
																Nahrať obrázky
															</button>
														</div>
														{(existingSectionImages.length > 0 || imagesForSection.length > 0) && (
															<ul className="space-y-1 text-[0.7rem] text-zinc-300">
																{existingSectionImages.map((name, idx) => (
																	<li
																		key={`${key}-existing-img-${idx}`}
																		className="flex items-center justify-between gap-2 truncate text-zinc-300"
																	>
																		<span className="truncate">{name}</span>
																		<button
																			type="button"
																			className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-red-500/70 text-[0.6rem] text-white hover:bg-red-500"
																			onClick={() => deleteExistingImage(key, name)}
																		>
																			×
																		</button>
																	</li>
																))}
																{imagesForSection.map((file, idx) => (
																	<li
																		key={`${key}-img-${idx}`}
																		className="flex items-center justify-between gap-2 truncate"
																	>
																		<span className="truncate">{file.name}</span>
																		<button
																			type="button"
																			className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-red-500/70 text-[0.6rem] text-white hover:bg-red-500"
																			onClick={() => removeImageFromSection(key, idx)}
																		>
																			×
																		</button>
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
																	Predvolené položky
																	<span className="ml-2 text-[0.7rem] font-normal text-zinc-400">
																		{currentDefaultCount}/{maxDefaultItems}
																	</span>
																</p>
																{defaultItemIds.map((itemId, visualIndex) => {
																	const baseKey = `${key}.default.${itemId}`;
																	const itemImageKey = `${baseKey}.images`;
																	const itemImages = imagesBySection[itemImageKey] ?? [];
																	const existingItemImages = existingImagesBySection[itemImageKey] ?? [];
																	return (
																		<div
																			key={baseKey}
																			className="space-y-2 rounded-lg border border-white/10 bg-black/40 px-3 py-3"
																		>
																			<div className="flex items-center justify-between gap-3">
																				<p className="text-[0.7rem] font-medium text-zinc-400">
																					Položka {visualIndex + 1}
																				</p>
																				<button
																					type="button"
																					className="rounded-md border border-red-500/60 bg-red-500/15 px-2 py-0.5 text-[0.7rem] font-medium text-red-100 hover:bg-red-500/25"
																					onClick={() => removeDefaultItem(key, itemId)}
																				>
																					Odstrániť
																				</button>
																			</div>
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
																								required
																								className="mt-1 w-full rounded-md border border-white/20 bg-black/60 px-3 py-1.5 text-[0.7rem] text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
																								placeholder={presetValue || `Malý nadpis ${j + 1}`}
																									value={values[storageKey] ?? ""}
																								onChange={(e) =>
																									updateValue(`${key}.default.${itemId}`, "small_title", j, e.target.value)
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
																								required
																								className="mt-1 w-full rounded-md border border-white/20 bg-black/60 px-3 py-1.5 text-[0.7rem] text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
																								placeholder={presetValue || `Hlavný nadpis ${j + 1}`}
																								value={values[storageKey] ?? ""}
																								onChange={(e) =>
																									updateValue(`${key}.default.${itemId}`, "title", j, e.target.value)
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
																								required
																								className="mt-1 w-full rounded-md border border-white/20 bg-black/60 px-3 py-1.5 text-[0.7rem] text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
																								placeholder={presetValue || `Text ${j + 1}`}
																								value={values[storageKey] ?? ""}
																								onChange={(e) =>
																									updateValue(`${key}.default.${itemId}`, "text", j, e.target.value)
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
																							Obrázky položky: {existingItemImages.length + itemImages.length}/{defaultProject.images} nahraných
																						</p>
																						<button
																							type="button"
																							className="rounded-md border border-purple-400/70 bg-purple-500/20 px-3 py-1 text-[0.7rem] font-medium text-purple-100 hover:bg-purple-500/30"
																							onClick={() => openImageModal(itemImageKey, defaultProject.images)}
																						>
																							Nahrať obrázky
																						</button>
																					</div>
																					{(existingItemImages.length > 0 || itemImages.length > 0) && (
																						<ul className="space-y-1 text-[0.7rem] text-zinc-300">
																							{existingItemImages.map((name, idx) => (
																								<li
																									key={`${itemImageKey}-existing-img-${idx}`}
																									className="flex items-center justify-between gap-2 truncate text-zinc-300"
																								>
																									<span className="truncate">{name}</span>
																									<button
																										type="button"
																										className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-red-500/70 text-[0.6rem] text-white hover:bg-red-500"
																										onClick={() => deleteExistingImage(itemImageKey, name, visualIndex)}
																									>
																										×
																									</button>
																								</li>
																							))}
																							{itemImages.map((file, idx) => (
																								<li
																									key={`${itemImageKey}-img-${idx}`}
																									className="flex items-center justify-between gap-2 truncate"
																								>
																									<span className="truncate">{file.name}</span>
																									<button
																										type="button"
																										className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-red-500/70 text-[0.6rem] text-white hover:bg-red-500"
																										onClick={() => removeImageFromSection(itemImageKey, idx)}
																									>
																										×
																									</button>
																								</li>
																							))}
																						</ul>
																					)}
																				</div>
																			)}
																	</div>
																);
															})}
															<button
																type="button"
																className="mt-1 inline-flex items-center rounded-md border border-purple-400/70 bg-purple-500/15 px-3 py-1 text-[0.7rem] font-medium text-purple-100 hover:bg-purple-500/25 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-400"
																onClick={() => addDefaultItem(key, maxDefaultItems)}
																disabled={currentDefaultCount >= maxDefaultItems}
															>
																Pridať položku
																<span className="ml-2 text-[0.7rem] text-zinc-300">
																	{currentDefaultCount}/{maxDefaultItems}
																</span>
															</button>
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
										{sectionError && (
											<p className="mt-4 text-xs text-red-300">{sectionError}</p>
										)}
										<div className="mt-4 flex justify-end">
											<button
													type="button"
													className="inline-flex items-center rounded-md border border-purple-400/70 bg-purple-500/30 px-4 py-1.5 text-[0.8rem] font-semibold text-purple-50 hover:bg-purple-500/40"
												onClick={handleNextSection}
											>
												{currentSectionIndex === sections.length - 1 ? "Dokončiť" : "Dalej"}
											</button>
										</div>
									</div>
								);
							})()}
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
										<li
											key={`modal-${imageModalSectionKey}-${idx}`}
											className="flex items-center justify-between gap-2 truncate"
										>
											<span className="truncate">{file.name}</span>
											<button
												type="button"
												className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-red-500/70 text-[0.6rem] text-white hover:bg-red-500"
												onClick={() => removeImageFromSection(imageModalSectionKey, idx)}
											>
												×
											</button>
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
