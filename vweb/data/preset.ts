export type Project = {
  name: string;
  visible_name: string;
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
    name: "section_header",
    visible_name: "Náhľad",
    small_title: 1,
    small_title_value: "Modrý text",
    title: 1,
    title_value: "Tučný čierny text",
    text: 1,
    images: 1,
    default: 0,
  },
  {
    name: "section_about",
    visible_name: "O nás",
    small_title: 1,
    small_title_value: "Modrý text",
    title: 1,
    title_value: "Tučný čierny text",
    text: 1,
    images: 1,
    default: 0,
  },
  {
    name: "section_cards",
    visible_name: "Info Karty",
    small_title: 1,
    small_title_value: "Modrý text",
    title: 1,
    title_value: "Tučný čierny text",
    text: 0,
    images: 0,
    default: 4,
  },
  {
    name: "section_offer",
    visible_name: "Ukážka služieb",
    small_title: 1,
    small_title_value: "Modrý text",
    title: 1,
    title_value: "Tučný čierny text",
    text: 1,
    images: 0,
    default: 10,
  },
  {
    name: "section_gallery",
    visible_name: "Galéria",
    small_title: 1,
    small_title_value: "Modrý text",
    title: 1,
    title_value: "Tučný čierny text",
    text: 0,
    images: 9,
    default: 0,
  },
  {
    name: "section_faq",
    visible_name: "Často kladené otázky ",
    small_title: 1,
    small_title_value: "Modrý text",
    title: 1,
    title_value: "Tučný čierny text",
    text: 0,
    images: 0,
    default: 20,
  },
  {
    name: "section_contatct_form",
    visible_name: "Email Formulár",
    small_title: 1,
    small_title_value: "Modrý text",
    title: 1,
    title_value: "Tučný čierny text",
    text: 1,
    images: 0,
    default: 0,
  },
  {
    name: "default_section_cards",
    visible_name: "",
    small_title: 1,
    small_title_value: "Modrý text",
    title: 1,
    title_value: "Tučný čierny text",
    text: 1,
    images: 0,
    default: 0,
  },
  {
    name: "default_section_offer",
    visible_name: "",
    small_title: 0,
    small_title_value: "Modrý text",
    title: 1,
    title_value: "Tučný čierny text",
    text: 1,
    images: 1,
    default: 0,
  },
  {
    name: "default_section_faq",
    visible_name: "",
    small_title: 0,
    small_title_value: "Modrý text",
    title: 1,
    title_value: "Tučný čierny text",
    text: 1,
    images: 0,
    default: 0,
  },
  {
    name: "section_footer",
    visible_name: "Pätička",
    small_title: 0,
    small_title_value: "Modrý text",
    title: 1,
    title_value: "Tučný čierny text",
    text: 1,
    images: 0,
    default: 0,
  },

]