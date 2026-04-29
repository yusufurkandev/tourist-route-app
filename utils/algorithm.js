import { places } from "../data/places";

// 🔥 ŞEHRE GÖRE FİLTRE
export function getPlacesByCity(city) {
  return places.filter((place) => place.location === city);
}

// 🔥 İLGİ ALANINA GÖRE FİLTRE
export function filterByInterest(placesList, interest) {
  return placesList.filter((place) => place.category === interest);
}