// 🔥 normalize
function normalizeCategory(value) {
  if (!value) return "";
  return value.toLowerCase().trim();
}

// 🔥 FILTER
export function filterByInterest(placesList, interest) {
  if (!interest) return placesList;

  const normalizedInterest = normalizeCategory(interest);

  return placesList.filter((place) => {
    if (!place.categories) return false;

    return place.categories.some(
      (cat) => normalizeCategory(cat) === normalizedInterest
    );
  });
}

// 🔥 MESAFE (HAVERSINE)
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

// 🔥 SMART SCORE (YENİ SİSTEM)
export function calculateSmartScore(current, place, prefs) {
  const distance = calculateDistance(
    current.lat,
    current.lng,
    place.lat,
    place.lng
  );

  let score = 0;

  // 📍 Distance (en önemli)
  score += distance * 2;

  // ⭐ Popülerlik (yüksek iyidir → ters çeviriyoruz)
  score += (5 - (place.popularity || 0)) * 3;

  // 💸 Bütçe
  if (prefs.budget) {
    const userBudget = parseInt(prefs.budget);
    if (place.cost > userBudget) score += 50;
  }

  // ⏱ Süre
  if (prefs.duration) {
    const userDuration = parseInt(prefs.duration);
    if (place.duration > userDuration) score += 10;
  }

  return score;
}

// 🔥 SMART NEXT PLACE
export function selectNextPlace(current, places, prefs) {
  let best = null;
  let bestScore = Infinity;

  for (const place of places) {
    const score = calculateSmartScore(current, place, prefs);

    if (score < bestScore) {
      bestScore = score;
      best = place;
    }
  }

  return best;
}

// 🔥🔥 SMART ROUTE (EN ÖNEMLİ)
export function buildSmartRoute(startLocation, places, prefs) {
  const route = [];
  let current = { lat: startLocation.lat, lng: startLocation.lng };
  let remaining = [...places];

  while (remaining.length > 0) {
    const next = selectNextPlace(current, remaining, prefs);

    route.push(next);

    current = { lat: next.lat, lng: next.lng };
    remaining = remaining.filter((p) => p !== next);
  }

  return route;
}

// 🔥 SCORE + FILTER (ESKİ SİSTEM GÜNCELLENDİ)
export function scorePlaces(placesList, prefs, userLat, userLon) {
  return placesList.map((place) => {
    const distance = calculateDistance(
      userLat,
      userLon,
      place.lat,
      place.lng
    );

    let score = 0;

    score += (place.popularity || 0) * 2;

    if (prefs.budget && place.cost > prefs.budget) score -= 3;
    if (prefs.duration && place.duration > prefs.duration) score -= 2;

    return {
      ...place,
      score,
      distance
    };
  });
}

// 🔥 TOP SELECTION
export function selectTopPlaces(scoredPlaces, limit) {
  return [...scoredPlaces]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit > 0 ? limit : 5);
}

// 🔥 ALTERNATİF ÖNERİ
export function getAlternativePlaces(allPlaces, selectedPlaces) {
  return allPlaces
    .filter((p) => !selectedPlaces.includes(p))
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 3);
}

// 🔥 GÜN İÇİ ZAMAN PLANLAMA (YENİ)
export function assignTimeSlots(dayPlaces) {
  return {
    morning: dayPlaces.slice(0, 2),
    afternoon: dayPlaces.slice(2, 5),
    evening: dayPlaces.slice(5)
  };
}

// 🔥 BASİT GÜN BÖLME
export function splitIntoDaysByCount(routePlaces, totalDays = 1) {
  if (totalDays <= 1) return [routePlaces];

  const days = [];
  const perDay = Math.ceil(routePlaces.length / totalDays);

  let index = 0;

  for (let d = 0; d < totalDays; d++) {
    const dayPlaces = routePlaces.slice(index, index + perDay);
    if (dayPlaces.length > 0) days.push(dayPlaces);
    index += perDay;
  }

  return days;
}

// 🔥🔥 SMART CLUSTER GÜN BÖLME (KORUNDU)
export function splitIntoDaysSmart(routePlaces, totalDays = 1) {
  if (totalDays <= 1) return [routePlaces];

  const clusters = Array.from({ length: totalDays }, () => []);
  const seeds = routePlaces.slice(0, totalDays);

  routePlaces.forEach((place) => {
    let closestIndex = 0;
    let closestDistance = Infinity;

    seeds.forEach((seed, index) => {
      const dist = calculateDistance(
        place.lat,
        place.lng,
        seed.lat,
        seed.lng
      );

      if (dist < closestDistance) {
        closestDistance = dist;
        closestIndex = index;
      }
    });

    clusters[closestIndex].push(place);
  });

  return clusters;
}