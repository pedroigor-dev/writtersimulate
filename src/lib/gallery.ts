export type GalleryItem = {
  id: string;
  title: string;
  artist: string;
  year: string;
  path: string;
  fx: number;
  fy: number;
};

const BASE = "https://thumb.wikimedia.org/wikipedia/commons/thumb/";

export function galleryUrl(item: GalleryItem, width: number) {
  const name = item.path.split("/").pop();
  return `${BASE}${item.path}/${width}px-${name}`;
}

export function galleryPage(item: GalleryItem) {
  return `https://commons.wikimedia.org/wiki/File:${item.path.split("/").pop()}`;
}

export const GALLERY: GalleryItem[] = [
  { id: "wanderer", title: "O Caminhante sobre o Mar de Névoa", artist: "Caspar David Friedrich", year: "1818", path: "a/af/Caspar_David_Friedrich_-_Wanderer_above_the_Sea_of_Fog.jpeg", fx: 0.5, fy: 0.5 },
  { id: "scream", title: "O Grito", artist: "Edvard Munch", year: "1893", path: "c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg", fx: 0.5, fy: 0.5 },
  { id: "starry", title: "A Noite Estrelada", artist: "Vincent van Gogh", year: "1889", path: "0/01/Vincent_van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg", fx: 0.45, fy: 0.5 },
  { id: "wave", title: "A Grande Onda de Kanagawa", artist: "Katsushika Hokusai", year: "c. 1831", path: "0/0d/Great_Wave_off_Kanagawa2.jpg", fx: 0.28, fy: 0.5 },
  { id: "ophelia", title: "Ofélia", artist: "John Everett Millais", year: "1852", path: "9/94/John_Everett_Millais_-_Ophelia_-_Google_Art_Project.jpg", fx: 0.42, fy: 0.5 },
  { id: "ninth-wave", title: "A Nona Onda", artist: "Ivan Aivazovsky", year: "1850", path: "4/4a/Hovhannes_Aivazovsky_-_The_Ninth_Wave_-_Google_Art_Project.jpg", fx: 0.5, fy: 0.5 },
  { id: "isle", title: "A Ilha dos Mortos", artist: "Arnold Böcklin", year: "1880", path: "d/de/Arnold_B%C3%B6cklin_-_Die_Toteninsel_I_%28Basel%2C_Kunstmuseum%29.jpg", fx: 0.5, fy: 0.5 },
  { id: "bears", title: "Manhã numa Floresta de Pinheiros", artist: "Ivan Shishkin", year: "1889", path: "1/1e/Shishkin%2C_Ivan_-_Morning_in_a_Pine_Forest.jpg", fx: 0.5, fy: 0.5 },
  { id: "knight", title: "Cavaleiro na Encruzilhada", artist: "Viktor Vasnetsov", year: "1878", path: "1/12/Victor_Vasnetsov_-_Knight_at_the_Crossroads_-_Google_Art_Project.jpg", fx: 0.5, fy: 0.5 },
  { id: "dnieper", title: "Noite de Luar no Dnieper", artist: "Arkhip Kuindzhi", year: "1880", path: "2/2b/Kuindzhi_Moonlit_night_on_the_Dnieper_1880_grm_x2.jpg", fx: 0.5, fy: 0.5 },
  { id: "cossacks", title: "Resposta dos Cossacos Zaporozhianos", artist: "Ilya Repin", year: "1891", path: "7/79/Ilja_Jefimowitsch_Repin_-_Reply_of_the_Zaporozhian_Cossacks_-_Yorck.jpg", fx: 0.5, fy: 0.5 },
  { id: "desolation", title: "O Curso do Império: Desolação", artist: "Thomas Cole", year: "1836", path: "7/77/Cole_Thomas_The_Course_of_Empire_Desolation_1836.jpg", fx: 0.5, fy: 0.5 },
  { id: "sunrise", title: "Impressão, Nascer do Sol", artist: "Claude Monet", year: "1872", path: "5/59/Monet_-_Impression%2C_Sunrise.jpg", fx: 0.5, fy: 0.5 },
  { id: "shalott", title: "A Dama de Shalott", artist: "John William Waterhouse", year: "1888", path: "7/70/John_William_Waterhouse_The_Lady_of_Shalott.jpg", fx: 0.5, fy: 0.5 },
];
