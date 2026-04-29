import { places } from "../data/places";

// 📍 ŞEHİR MERKEZLERİ
const cityCenters = {
  Istanbul: { lat: 41.0082, lon: 28.9784 },
  Ankara: { lat: 39.9334, lon: 32.8597 },
  Izmir: { lat: 38.4237, lon: 27.1428 },
  Antalya: { lat: 36.8969, lon: 30.7133 },
  Bursa: { lat: 40.1885, lon: 29.0610 },
  Adana: { lat: 37.0000, lon: 35.3213 },
  Gaziantep: { lat: 37.0662, lon: 37.3833 },
};

// 🎲 RANDOM KOORDİNAT
function randomOffset() {
  return (Math.random() - 0.5) * 0.1;
}

// 🔥 KOORDİNAT EKLE
function addCoordinates(place) {
  const center = cityCenters[place.location];

  return {
    ...place,
    lat: center.lat + randomOffset(),
    lon: center.lon + randomOffset(),
  };
}

// 🔥 ŞEHİR FİLTRE
export function getPlacesByCity(city) {
  return places
    .filter((place) => place.location === city)
    .map(addCoordinates);
}

// 🔥 KATEGORİ FİLTRE
export function filterByInterest(placesList, interest) {
  if (!interest) return placesList;
  return placesList.filter((place) => place.category === interest);
}

// 🔥 MESAFE HESAPLA
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 🔥 MESAFEYE GÖRE SIRALA
export function sortByDistance(placesList, userLat, userLon) {
  return [...placesList].sort((a, b) => {
    const distA = calculateDistance(userLat, userLon, a.lat, a.lon);
    const distB = calculateDistance(userLat, userLon, b.lat, b.lon);
    return distA - distB;
  });
}

// 🔥 SKOR ALGORİTMASI (EN KRİTİK)
export function scorePlaces(placesList, prefs) {
  return placesList.map((place) => {
    let score = 0;

    // 🎯 süre uyumu
    if (prefs.duration && place.duration === prefs.duration) {
      score += 3;
    }

    // 💰 bütçe uyumu
    if (prefs.budget && place.price === prefs.budget) {
      score += 2;
    }

    // 🚗 ulaşım uyumu (basit mantık)
    if (prefs.transport === "Yürüyüş" && place.category === "Doğa") {
      score += 1;
    }

    if (prefs.transport === "Araba") {
      score += 1;
    }

    return {
      ...place,
      score,
    };
  });
}

// 🔥 SON SEÇİM (LIMIT + SORT)
export function selectTopPlaces(scoredPlaces, limit) {
  return scoredPlaces
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}