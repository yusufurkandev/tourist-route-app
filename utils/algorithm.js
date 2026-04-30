// 🔥 KATEGORİ NORMALIZE (TR)
function normalizeCategory(value) {
  if (!value) return "";

  return value.toLowerCase().trim();
}

// 🔥 KATEGORİ FİLTRE (ÇOKLU DESTEK)
export function filterByInterest(placesList, interest) {
  if (!interest) return placesList;

  const normalizedInterest = normalizeCategory(interest);

  return placesList.filter((place) => {
    // 🟢 yeni sistem (categories array)
    if (place.categories && place.categories.length > 0) {
      return place.categories.some(
        (cat) => normalizeCategory(cat) === normalizedInterest
      );
    }

    // 🟡 eski sistem fallback
    return normalizeCategory(place.category) === normalizedInterest;
  });
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
    const distA = calculateDistance(userLat, userLon, a.lat, a.lng);
    const distB = calculateDistance(userLat, userLon, b.lat, b.lng);
    return distA - distB;
  });
}

// 🔥 SKOR ALGORİTMASI (GELİŞTİRİLMİŞ)
export function scorePlaces(placesList, prefs) {
  return placesList.map((place) => {
    let score = 0;

    // ⏱️ süre uyumu
    if (prefs.duration) {
      const userDuration = parseInt(prefs.duration);
      if (place.duration <= userDuration) score += 2;
      else score -= 1;
    }

    // 💰 bütçe uyumu
    if (prefs.budget) {
      const userBudget = parseInt(prefs.budget);
      if (place.cost <= userBudget) score += 2;
      else score -= 1;
    }

    // 🚶 ulaşım uyumu
    if (prefs.transport === "Yürüyüş") {
      if (place.category === "Doğa") score += 1;
    }

    if (prefs.transport === "Araba") {
      score += 1;
    }

    // ⭐ popülerlik etkisi (normalize)
    score += (place.popularity || 0) * 0.5;

    return {
      ...place,
      score,
    };
  });
}

// 🔥 EN İYİLERİ SEÇ
export function selectTopPlaces(scoredPlaces, limit) {
  return [...scoredPlaces]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit > 0 ? limit : 5);
}

// 🔥 ROUTE (NEAREST NEIGHBOR)
export function buildRoute(placesList, startLat, startLon) {
  const route = [];

  let currentLat = startLat;
  let currentLon = startLon;

  let remaining = [...placesList];

  while (remaining.length > 0) {
    let closestIndex = 0;
    let closestDistance = Infinity;

    remaining.forEach((place, index) => {
      const dist = calculateDistance(
        currentLat,
        currentLon,
        place.lat,
        place.lng
      );

      if (dist < closestDistance) {
        closestDistance = dist;
        closestIndex = index;
      }
    });

    const nextPlace = remaining.splice(closestIndex, 1)[0];

    route.push(nextPlace);

    currentLat = nextPlace.lat;
    currentLon = nextPlace.lng;
  }

  return route;
}