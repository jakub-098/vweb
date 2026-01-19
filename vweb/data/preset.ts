export type Project = {
  name: string;
  small_title: number;
  small_title_value: string;
  title: number;
  title_value: string;
  text: number;
  images: number;
  default: number

  
};

export const projects: Project[] = [
  {
    name: "section_about",
    small_title: 1,
    small_title_value: "O projekte",
    title: 1,
    title_value: "O nás",
    text: 1,
    images: 1,
    default: 0,
  },
  {
    name: "section_cards",
    small_title: 1,
    small_title_value: "čo získate",
    title: 1,
    title_value: "Kľúčové výhody",
    text: 0,
    images: 0,
    default: 4,
  },
  {
    name: "section_offer",
    small_title: 1,
    small_title_value: "Služby",
    title: 1,
    title_value: "Naše Služby",
    text: 1,
    images: 0,
    default: 10,
  },
  {
    name: "section_gallery",
    small_title: 1,
    small_title_value: "Galéria",
    title: 1,
    title_value: "Ukážky našej práce",
    text: 0,
    images: 9,
    default: 0,
  },
  {
    name: "section_faq",
    small_title: 1,
    small_title_value: "Faq",
    title: 1,
    title_value: "Často kladené otázky",
    text: 0,
    images: 0,
    default: 20,
  },
  {
    name: "section_contatct_form",
    small_title: 1,
    small_title_value: "Kontakt",
    title: 1,
    title_value: "Napíšte nám správu",
    text: 1,
    images: 0,
    default: 0,
  },
  {
    name: "default_section_cards",
    small_title: 1,
    small_title_value: "Karta",
    title: 1,
    title_value: "",
    text: 1,
    images: 0,
    default: 0,
  },
  {
    name: "default_section_offer",
    small_title: 0,
    small_title_value: "",
    title: 1,
    title_value: "",
    text: 1,
    images: 1,
    default: 0,
  },
  {
    name: "default_section_faq",
    small_title: 0,
    small_title_value: "",
    title: 1,
    title_value: "",
    text: 1,
    images: 0,
    default: 0,
  },

]