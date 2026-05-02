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

// 🔥 TRANSPORT MESAFE LİMİTİ
function getMaxDistance(transport) {
  if (transport === "Yürüyüş") return 3;
  if (transport === "Toplu taşıma") return 15;
  return Infinity;
}

// 🔥🔥 SMART FILTER
function applySmartFilters(places, prefs, userLat, userLng) {

  let result = [...places];

  // 1️⃣ CATEGORY
  if (prefs.interest) {
    const key = normalizeCategory(prefs.interest);

    result = result.filter(p => {
      const cats = [];

      if (Array.isArray(p.categories)) {
        cats.push(...p.categories.map(c => normalizeCategory(c)));
      }

      if (p.category) {
        cats.push(normalizeCategory(p.category));
      }

      return cats.some(c => c.includes(key));
    });
  }

  if (result.length === 0) result = [...places];

  // 2️⃣ BUDGET
  if (prefs.budget === "low") {
    result = result.filter(p => (p.cost || 0) <= 2);
  }

  if (prefs.budget === "high") {
    result = result.filter(p => (p.cost || 0) >= 3);
  }

  if (result.length === 0) result = [...places];

  // 3️⃣ DISTANCE
  const maxDist = getMaxDistance(prefs.transport);

  if (maxDist !== Infinity) {
    result = result.filter(p => {
      const d = calculateDistance(userLat, userLng, p.lat, p.lng);
      return d <= maxDist;
    });
  }

  // 🔥 fallback ama EN YAKIN + EN POPÜLER
  if (result.length === 0) {
    result = [...places]
      .sort((a, b) => {
        const da = calculateDistance(userLat, userLng, a.lat, a.lng);
        const db = calculateDistance(userLat, userLng, b.lat, b.lng);

        // önce yakınlık sonra popularity
        if (da !== db) return da - db;
        return (b.popularity || 0) - (a.popularity || 0);
      })
      .slice(0, 5);
  }

  return result;
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

// 🔥 SCORE (GÜÇLENDİRİLDİ)
function calculateSmartScore(current, place, prefs) {

  const distance = calculateDistance(
    current.lat,
    current.lng,
    place.lat,
    place.lng
  );

  let score = 0;

  // 🔥🔥 EN ÖNEMLİ FIX
  score += (place.popularity || 0) * 10;

  // 🔥 INTEREST BOOST
  if (prefs.interest && place.category) {
    if (
      normalizeCategory(place.category).includes(
        normalizeCategory(prefs.interest)
      )
    ) {
      score += 50;
    }
  }

  // 🔥 DISTANCE
  if (prefs.transport === "Yürüyüş") {
    if (distance > 3) return -9999;
    score -= distance * 5;
  }
  else if (prefs.transport === "Toplu taşıma") {
    score -= distance * 2;
  }
  else {
    score -= distance * 1;
  }

  // 🔥 BUDGET
  if (prefs.budget === "low") {
    if ((place.cost || 0) <= 2) score += 15;
    else score -= 20;
  }

  if (prefs.budget === "high") {
    if ((place.cost || 0) >= 3) score += 15;
  }

  return score;
}

// 🔥 NEXT PLACE
function selectNextPlace(current, places, prefs, prev = null) {
  let best = null;
  let bestScore = -Infinity;

  for (const place of places) {

    let score = calculateSmartScore(current, place, prefs);

    if (score === -9999) continue;

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

  places = applySmartFilters(
    places,
    prefs,
    startLocation.lat,
    startLocation.lng
  );

  // 🔥 POPULARITY + DISTANCE ORDER
  places = [...places].sort((a, b) => {
    const pa = b.popularity || 0;
    const pb = a.popularity || 0;
    return pa - pb;
  });

  let route = [];
  let current = { lat: startLocation.lat, lng: startLocation.lng };
  let prev = null;

  let remaining = [...places];

  while (remaining.length > 0) {

    const next = selectNextPlace(current, remaining, prefs, prev);

    if (!next) break;

    route.push(next);

    prev = current;
    current = { lat: next.lat, lng: next.lng };

    remaining = remaining.filter(p => p !== next);
  }

  return route;
}

// 🔥 SCORE
function scorePlaces(placesList, prefs, userLat, userLon) {
  return placesList.map((place) => {

    const distance = calculateDistance(
      userLat,
      userLon,
      place.lat,
      place.lng
    );

    let score = (place.popularity || 0) * 5;

    if (prefs.transport === "Yürüyüş" && distance > 3) {
      score -= 999;
    }

    score -= distance * 2;

    return {
      ...place,
      score,
      distance
    };
  });
}

// 🔥 TOP (POPÜLER ÖNCE)
function selectTopPlaces(scoredPlaces, limit) {
  const safeLimit = Number(limit) || 5;

  return [...scoredPlaces]
    .sort((a, b) => {
      if ((b.popularity || 0) !== (a.popularity || 0)) {
        return (b.popularity || 0) - (a.popularity || 0);
      }
      return (b.score || 0) - (a.score || 0);
    })
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