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

    if (Array.isArray(place.categories)) {
      return place.categories.some(
        (cat) => normalizeCategory(cat).includes(normalizedInterest)
      );
    }

    if (place.category) {
      return normalizeCategory(place.category).includes(normalizedInterest);
    }

    return false;
  });
}

// 🔥 MESAFE
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

// 🔥 açı
function calculateAngle(prev, current, next) {
  if (!prev) return 0;

  const v1 = {
    x: current.lng - prev.lng,
    y: current.lat - prev.lat
  };

  const v2 = {
    x: next.lng - current.lng,
    y: next.lat - current.lat
  };

  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

  if (mag1 === 0 || mag2 === 0) return 0;

  const cos = dot / (mag1 * mag2);
  return Math.acos(Math.max(-1, Math.min(1, cos)));
}

// 🔥🔥 GÜNCELLENDİ (EN KRİTİK)
export function calculateSmartScore(current, place, prefs) {

  const distance = calculateDistance(
    current.lat,
    current.lng,
    place.lat,
    place.lng
  );

  let score = 0;

  // ⭐ POPULARITY
  score += (place.popularity || 0) * 3;

  // 📍 DISTANCE (yakınlık avantaj)
  score -= distance * 2;

  // 🚶 TRANSPORT
  if (prefs.transport === "Yürüyüş") {
    score -= distance * 3; // daha yakın tercih
  }

  if (prefs.transport === "Araba") {
    score -= distance * 1; // daha esnek
  }

  // 💰 BUDGET (FIX)
  if (prefs.budget === "low") {
    if ((place.cost || 0) <= 2) score += 20;
    else score -= 20;
  }

  if (prefs.budget === "high") {
    if ((place.cost || 0) >= 3) score += 20;
  }

  // ⏱ DURATION
  if (prefs.duration) {
    if (place.duration > prefs.duration) score -= 10;
  }

  return score;
}

// 🔥 NEXT PLACE
export function selectNextPlace(current, places, prefs, prev = null) {
  let best = null;
  let bestScore = -Infinity;

  for (const place of places) {

    let score = calculateSmartScore(current, place, prefs);

    const angle = calculateAngle(prev, current, place);

    if (angle > Math.PI / 2) {
      score -= 10; // zigzag cezası
    }

    if (score > bestScore) {
      bestScore = score;
      best = place;
    }
  }

  return best;
}

// 🔥 ROUTE
export function buildSmartRoute(startLocation, places, prefs) {

  if (!places || places.length === 0) return [];

  let closestStart = places[0];
  let minDist = Infinity;

  for (const p of places) {
    const dist = calculateDistance(
      startLocation.lat,
      startLocation.lng,
      p.lat,
      p.lng
    );

    if (dist < minDist) {
      minDist = dist;
      closestStart = p;
    }
  }

  const route = [];
  let current = { lat: closestStart.lat, lng: closestStart.lng };
  let prev = null;

  let remaining = places.filter(p => p !== closestStart);

  route.push(closestStart);

  while (remaining.length > 0) {
    const next = selectNextPlace(current, remaining, prefs, prev);

    route.push(next);

    prev = current;
    current = { lat: next.lat, lng: next.lng };

    remaining = remaining.filter((p) => p !== next);
  }

  return route;
}

// 🔥 SCORE + FILTER
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
    score -= distance * 2;

    if (prefs.budget === "low" && place.cost > 2) score -= 10;
    if (prefs.budget === "high" && place.cost >= 3) score += 10;

    return {
      ...place,
      score,
      distance
    };
  });
}

// 🔥 TOP SELECTION
export function selectTopPlaces(scoredPlaces, limit) {

  if (!Array.isArray(scoredPlaces)) return [];

  const safeLimit = Number(limit) || 5;

  return [...scoredPlaces]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, safeLimit);
}

// 🔥 ALTERNATİF
export function getAlternativePlaces(allPlaces, selectedPlaces) {
  return allPlaces
    .filter((p) => !selectedPlaces.includes(p))
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 3);
}

// 🔥 TIME SLOT
export function assignTimeSlots(dayPlaces) {
  return {
    morning: dayPlaces.slice(0, 2),
    afternoon: dayPlaces.slice(2, 5),
    evening: dayPlaces.slice(5)
  };
}

// 🔥 DAY SPLIT
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

// 🔥 CLUSTER
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