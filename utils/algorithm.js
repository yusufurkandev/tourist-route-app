// 🔥 normalize (Türkçe güvenli)
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

// 🔥 SIRALA
export function sortByDistance(placesList, userLat, userLon) {
  return [...placesList].sort((a, b) => {
    const distA = calculateDistance(userLat, userLon, a.lat, a.lng);
    const distB = calculateDistance(userLat, userLon, b.lat, b.lng);
    return distA - distB;
  });
}

// 🔥 SKOR
export function scorePlaces(placesList, prefs, userLat, userLon) {

  if (prefs.transport === "Yürüyüş") {
    placesList = placesList.filter(p =>
      calculateDistance(userLat, userLon, p.lat, p.lng) < 5
    );
  }

  if (prefs.transport === "Toplu Taşıma") {
    placesList = placesList.filter(p =>
      calculateDistance(userLat, userLon, p.lat, p.lng) < 15
    );
  }

  return placesList.map((place) => {

    let score = 0;

    const distance = calculateDistance(
      userLat,
      userLon,
      place.lat,
      place.lng
    );

    if (prefs.transport === "Yürüyüş") {
      if (distance < 1) score += 6;
      else if (distance < 3) score += 4;
      else if (distance < 5) score += 1;
      else score -= 6;
    }

    if (prefs.transport === "Toplu Taşıma") {
      if (distance < 1) score += 1;
      else if (distance < 5) score += 4;
      else if (distance < 10) score += 3;
      else if (distance < 15) score += 2;
      else score -= 3;
    }

    if (prefs.transport === "Araba") {
      if (distance < 2) score += 1;
      else if (distance < 10) score += 3;
      else score += 2;
    }

    if (prefs.duration) {
      const userDuration = parseInt(prefs.duration);
      if (!isNaN(userDuration)) {
        if (place.duration <= userDuration) score += 2;
        else score -= 1;
      }
    }

    if (prefs.budget) {
      const userBudget = parseInt(prefs.budget);
      if (!isNaN(userBudget)) {
        if (place.cost <= userBudget) score += 2;
        else score -= 1;
      }
    }

    score += (place.popularity || 0) * 0.5;

    return {
      ...place,
      score,
      distance
    };
  });
}

// 🔥 TOP
export function selectTopPlaces(scoredPlaces, limit) {
  return [...scoredPlaces]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit > 0 ? limit : 5);
}

// 🔥 ROUTE
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

// 🔥🔥 SMART GÜN BÖLME (ASIL OLAY)
export function splitIntoDaysSmart(routePlaces, totalDays = 1) {

  if (totalDays <= 1) return [routePlaces];

  const clusters = Array.from({ length: totalDays }, () => []);

  // ilk noktaları merkez al
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