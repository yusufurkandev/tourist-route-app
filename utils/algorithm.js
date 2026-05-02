// 🔥 normalize
function normalizeCategory(value) {
  if (!value) return "";
  return value.toLowerCase().trim();
}

// 🔥 FILTER (DOKUNMADIM)
function filterByInterest(placesList, interest) {
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

// 🔥 TRANSPORT MESAFE LİMİTİ (AYNI AMA DAHA NET)
function getMaxDistance(transport) {
  if (transport === "Yürüyüş") return 3;
  if (transport === "Toplu taşıma") return 15;
  return Infinity;
}

// 🔥 FİLTRE (EN KRİTİK FIX)
function filterByDistance(places, startLocation, transport) {

  const maxDist = getMaxDistance(transport);

  if (maxDist === Infinity) return places;

  const filtered = places.filter(p => {
    const dist = calculateDistance(
      startLocation.lat,
      startLocation.lng,
      p.lat,
      p.lng
    );

    return dist <= maxDist;
  });

  // 🔥 fallback (ama EN YAKINLARI SEÇ!)
  if (filtered.length === 0) {
    return [...places]
      .sort((a, b) => {
        const da = calculateDistance(startLocation.lat, startLocation.lng, a.lat, a.lng);
        const db = calculateDistance(startLocation.lat, startLocation.lng, b.lat, b.lng);
        return da - db;
      })
      .slice(0, 5);
  }

  return filtered;
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

// 🔥 SCORE (SENİN YAPI + GÜÇLENDİRME)
function calculateSmartScore(current, place, prefs) {

  const distance = calculateDistance(
    current.lat,
    current.lng,
    place.lat,
    place.lng
  );

  let score = 0;

  // ⭐ POPULARITY
  score += (place.popularity || 0) * 3;

  // 🔥 TRANSPORT DISTANCE
  if (prefs.transport === "Yürüyüş") {
    if (distance > 3) return -9999; // 🔥 HARD BLOCK
    score -= distance * 7;
  }
  else if (prefs.transport === "Toplu taşıma") {
    score -= distance * 3;
  }
  else {
    score -= distance * 1;
  }

  // 💰 BUDGET
  if (prefs.budget === "low") {
    if ((place.cost || 0) <= 2) score += 20;
    else score -= 25;
  }

  if (prefs.budget === "high") {
    if ((place.cost || 0) >= 3) score += 20;
  }

  // 🎯 INTEREST BOOST (EKLENDİ)
  if (prefs.interest && place.category) {
    if (normalizeCategory(place.category).includes(normalizeCategory(prefs.interest))) {
      score += 25;
    }
  }

  // ⏱ DURATION
  if (prefs.duration) {
    if (place.duration > prefs.duration) score -= 10;
  }

  return score;
}

// 🔥 NEXT PLACE
function selectNextPlace(current, places, prefs, prev = null) {
  let best = null;
  let bestScore = -Infinity;

  for (const place of places) {

    let score = calculateSmartScore(current, place, prefs);

    if (score === -9999) continue; // 🔥 HARD FILTER

    const angle = calculateAngle(prev, current, place);

    if (angle > Math.PI / 2) {
      score -= 10;
    }

    if (score > bestScore) {
      bestScore = score;
      best = place;
    }
  }

  return best;
}

// 🔥 ROUTE
function buildSmartRoute(startLocation, places, prefs) {

  if (!places || places.length === 0) return [];

  // 🔥 MESAFE FİLTRESİ
  places = filterByDistance(places, startLocation, prefs.transport);

  if (places.length === 0) return [];

  // 🔥 RANDOM (hafif karıştırma)
  places = [...places].sort(() => Math.random() - 0.3);

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

    if (!next) break;

    route.push(next);

    prev = current;
    current = { lat: next.lat, lng: next.lng };

    remaining = remaining.filter((p) => p !== next);
  }

  return route;
}

// 🔥 SCORE (GÜÇLENDİRİLDİ)
function scorePlaces(placesList, prefs, userLat, userLon) {
  return placesList.map((place) => {

    const distance = calculateDistance(
      userLat,
      userLon,
      place.lat,
      place.lng
    );

    let score = (place.popularity || 0) * 2;

    if (prefs.transport === "Yürüyüş" && distance > 3) {
      score -= 999;
    }

    score -= distance * 2;

    if (prefs.budget === "low" && place.cost > 2) score -= 15;
    if (prefs.budget === "high" && place.cost >= 3) score += 10;

    return {
      ...place,
      score,
      distance
    };
  });
}

// 🔥 TOP
function selectTopPlaces(scoredPlaces, limit) {
  const safeLimit = Number(limit) || 5;

  return [...scoredPlaces]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, safeLimit);
}

// 🔥 DAY SPLIT
function splitIntoDaysByCount(routePlaces, totalDays = 1) {
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

// 🔥 EXPORT
module.exports = {
  filterByInterest,
  calculateSmartScore,
  selectNextPlace,
  buildSmartRoute,
  scorePlaces,
  selectTopPlaces,
  splitIntoDaysByCount
};