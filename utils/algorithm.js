//
// ❗ ARTIK DIŞ DATA IMPORT YOK
//

// 🔥 KATEGORİ MAP (TR → EN)
const categoryMap = {
  Doğa: "nature",
  Tarih: "history",
  Alışveriş: "shopping",
};

// 🔥 KATEGORİ FİLTRE (FIX)
export function filterByInterest(placesList, interest) {
  if (!interest) return placesList;

  const mapped = categoryMap[interest] || interest;

  return placesList.filter(
    (place) => place.category?.toLowerCase() === mapped.toLowerCase()
  );
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

// 🔥 MESAFEYE GÖRE SIRALA (lng FIX)
export function sortByDistance(placesList, userLat, userLon) {
  return [...placesList].sort((a, b) => {
    const distA = calculateDistance(userLat, userLon, a.lat, a.lng);
    const distB = calculateDistance(userLat, userLon, b.lat, b.lng);
    return distA - distB;
  });
}

// 🔥 SKOR (cost FIX)
export function scorePlaces(placesList, prefs) {
  return placesList.map((place) => {
    let score = 0;

    // süre
    if (prefs.duration && place.duration <= parseInt(prefs.duration)) {
      score += 2;
    }

    // bütçe
    if (prefs.budget && place.cost <= parseInt(prefs.budget)) {
      score += 2;
    }

    // ulaşım
    if (prefs.transport === "Yürüyüş" && place.category === "nature") {
      score += 1;
    }

    if (prefs.transport === "Araba") {
      score += 1;
    }

    // popülerlik bonusu
    score += place.popularity || 0;

    return {
      ...place,
      score,
    };
  });
}

// 🔥 TOP SELECTION
export function selectTopPlaces(scoredPlaces, limit) {
  return [...scoredPlaces]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit);
}

// 🔥 ROUTE (lng FIX)
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