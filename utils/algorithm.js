// ============================================================
// 🧠 AKILLI TUR PLANLAYICI ALGORİTMASI v3.1
// FIX: Mesafe hesabı kullanıcı konumu yerine şehir merkezi bazlı
//      + lat/lng null koruması
//      + yürüyüş → hard elenme yok, sadece skor cezası
// ============================================================

// ─────────────────────────────────────────────────────────────
// BÖLÜM 1: SABİT HARİTALAR
// ─────────────────────────────────────────────────────────────

const INTEREST_MAP = {
  "tarihi yerler": [
    "tarihi", "historical", "müze", "museum",
    "arkeoloji", "archaeology", "antik", "ancient",
    "saray", "palace", "kale", "castle",
    "cami", "mosque", "kilise", "church", "anıt", "monument",
    "tarihi yerler"
  ],
  "doğa": [
    "doğa", "nature", "park", "orman", "forest",
    "göl", "lake", "nehir", "river", "dağ", "mountain",
    "plaj", "beach", "bahçe", "garden", "şelale", "waterfall"
  ],
  "müze & kültür": [
    "müze", "museum", "kültür", "culture",
    "sanat", "art", "galeri", "gallery", "sergi", "exhibition",
    "tiyatro", "theatre", "opera", "sinema"
  ],
  "yemek & kafe": [
    "yemek", "food", "restoran", "restaurant",
    "cafe", "kafe", "coffee", "pastane", "bakery",
    "bar", "lokanta", "bistro"
  ],
};

const TRAVEL_TYPE_TAGS = {
  "aile": {
    bonus:   ["çocuk", "family", "kids", "park", "bahçe", "hayvanat", "zoo", "eğlence", "akvaryum"],
    penalty: ["bar", "gece", "nightlife", "club"]
  },
  "eş/sevgili": {
    bonus:   ["romantik", "romantic", "sunset", "gün batımı", "cafe", "terrace", "teras", "manzara"],
    penalty: ["hayvanat", "zoo", "çocuk", "kids"]
  },
  "arkadaş": {
    bonus:   ["eğlence", "entertainment", "cafe", "bar", "aktivite", "activity", "spor"],
    penalty: []
  },
  "yalnız": {
    bonus:   ["müze", "museum", "kütüphane", "library", "tarihi", "historical", "sanat", "art"],
    penalty: []
  },
};

const DURATION_MINUTES = {
  "yarım gün": 240,
  "1 gün":     480,
  "2 gün":     480,
  "3+ gün":    480,
};

// ─────────────────────────────────────────────────────────────
// BÖLÜM 2: YARDIMCI FONKSİYONLAR
// ─────────────────────────────────────────────────────────────

function normalize(value) {
  if (!value) return "";
  return value.toLowerCase().trim();
}

/** Haversine mesafe (km) — null korumalı */
function calculateDistance(lat1, lon1, lat2, lon2) {
  // 🔥 FIX: herhangi bir değer null/undefined/NaN ise 0 döner
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return 0;

  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Ulaşım türüne göre mesafe ceza katsayısı */
function getDistancePenalty(transport) {
  const t = normalize(transport);
  if (t.includes("yürüyüş") || t.includes("yuruyus")) return 2;  // yakın yerler önce ama elenme yok
  if (t.includes("toplu"))                              return 0.8;
  return 0.3; // araba: çok minimal
}

/** Bir yerin tüm kategori tag'larını döner */
function getPlaceTags(place) {
  const tags = [];
  if (Array.isArray(place.categories)) tags.push(...place.categories.map(normalize));
  if (place.category) tags.push(normalize(place.category));
  if (Array.isArray(place.tags)) tags.push(...place.tags.map(normalize));
  if (place.name) tags.push(normalize(place.name));
  return tags;
}

function tagsMatch(placeTags, keywords) {
  if (!keywords || keywords.length === 0) return false;
  return keywords.some(kw => placeTags.some(tag => tag.includes(kw)));
}

function getInterestKeywords(interest) {
  if (!interest) return [];
  const key = normalize(interest);
  if (INTEREST_MAP[key]) return INTEREST_MAP[key];
  for (const [k, v] of Object.entries(INTEREST_MAP)) {
    if (k.includes(key) || key.includes(k)) return v;
  }
  return [key];
}

// ─────────────────────────────────────────────────────────────
// BÖLÜM 3: ŞEHİR MERKEZİ HESAPLAMA
// ─────────────────────────────────────────────────────────────

/**
 * 🔥 TEMEL FIX
 * Kullanıcı konumu ile şehirdeki yerler arasındaki mesafe
 * çok büyük olabileceği için (farklı şehirde test verisi, konum izni yok vb.)
 * mesafe referans noktası olarak şehirdeki yerlerin coğrafi merkezini kullanıyoruz.
 *
 * Bu sayede:
 * - Kullanıcı İstanbul'dayken İzmir verileri test edilse bile çalışır
 * - Konum izni reddedilse bile çalışır
 * - Gerçek kullanımda da zaten şehir içi mesafeler önemli
 */
function getCityCenter(places) {
  const validPlaces = places.filter(p =>
    p.lat && p.lng && !isNaN(p.lat) && !isNaN(p.lng)
  );

  if (validPlaces.length === 0) return { lat: 41.0082, lng: 28.9784 }; // İstanbul fallback

  const lat = validPlaces.reduce((s, p) => s + parseFloat(p.lat), 0) / validPlaces.length;
  const lng = validPlaces.reduce((s, p) => s + parseFloat(p.lng), 0) / validPlaces.length;
  return { lat, lng };
}

// ─────────────────────────────────────────────────────────────
// BÖLÜM 4: AĞIRLIKLI SKORLAMA
// ─────────────────────────────────────────────────────────────

const WEIGHTS = {
  INTEREST_MATCH:      60,
  POPULARITY:          15,
  TRAVEL_TYPE_BONUS:   25,
  TRAVEL_TYPE_PENALTY: 30,
  BUDGET_MATCH:        20,
  BUDGET_MISMATCH:    -15,
  DURATION_BONUS:       5,
};

/**
 * Bir yer için tam skor hesapla.
 * referansLat/Lng = şehir merkezi (kullanıcı konumu DEĞİL)
 */
function scorePlace(place, prefs, refLat, refLng) {
  // lat/lng yoksa parse et, yoksa 0
  const pLat = parseFloat(place.lat) || 0;
  const pLng = parseFloat(place.lng) || 0;

  const dist    = calculateDistance(refLat, refLng, pLat, pLng);
  const tags    = getPlaceTags(place);
  const penalty = getDistancePenalty(prefs.transport);

  let score = 0;

  // 1) MESAFE — sadece ceza, hiçbir zaman hard elenme yok
  score -= dist * penalty;

  // 2) İLGİ ALANI
  const interestKw = getInterestKeywords(prefs.interest);
  if (interestKw.length > 0) {
    if (tagsMatch(tags, interestKw)) {
      score += WEIGHTS.INTEREST_MATCH;
      const matchCount = interestKw.filter(kw => tags.some(tg => tg.includes(kw))).length;
      score += Math.min(matchCount * 5, 20);
    } else {
      score -= 20;
    }
  }

  // 3) POPÜLERLİK
  score += (parseFloat(place.popularity) || 0) * WEIGHTS.POPULARITY;

  // 4) KİMİNLE
  const travelKey  = normalize(prefs.travelType || "");
  const travelRule = Object.entries(TRAVEL_TYPE_TAGS).find(([k]) => travelKey.includes(k));
  if (travelRule) {
    const [, rule] = travelRule;
    if (tagsMatch(tags, rule.bonus))   score += WEIGHTS.TRAVEL_TYPE_BONUS;
    if (tagsMatch(tags, rule.penalty)) score -= WEIGHTS.TRAVEL_TYPE_PENALTY;
  }

  // 5) BÜTÇE (DB cost: 0=ücretsiz, 1-100=düşük, 101-300=orta, 300+=yüksek)
  const cost = parseFloat(place.cost) ?? 0;
  const b    = normalize(prefs.budget || "");
  if (b === "düşük" || b === "low") {
    if (cost === 0 || cost <= 100)  score += WEIGHTS.BUDGET_MATCH;
    else if (cost > 300)            score += WEIGHTS.BUDGET_MISMATCH;
  } else if (b === "orta" || b === "medium") {
    if (cost > 50 && cost <= 300)   score += WEIGHTS.BUDGET_MATCH;
  } else if (b === "yüksek" || b === "high") {
    if (cost > 200)                 score += WEIGHTS.BUDGET_MATCH;
    else if (cost === 0)            score += WEIGHTS.BUDGET_MISMATCH;
  }

  // 6) SÜRE UYUMU
  const maxDailyMin = DURATION_MINUTES[normalize(prefs.duration || "1 gün")] || 480;
  const placeDur    = parseFloat(place.duration) || 60;
  if (placeDur <= maxDailyMin * 0.4) score += WEIGHTS.DURATION_BONUS;

  return { ...place, score, distance: dist };
}

// ─────────────────────────────────────────────────────────────
// BÖLÜM 5: KATMANLI FİLTRELEME
// ─────────────────────────────────────────────────────────────

/**
 * 🔥 FIX: Mesafe filtresi kaldırıldı (hard constraint yoktu zaten).
 * Mesafe artık sadece skor üzerinden etki ediyor.
 * Filtreler sadece ilgi alanı, bütçe ve kiminle üzerinden çalışıyor.
 */
function filterPlaces(places, prefs) {
  const interestKw = getInterestKeywords(prefs.interest);

  const matchInterest = p => interestKw.length === 0 || tagsMatch(getPlaceTags(p), interestKw);
  const matchBudget   = p => {
    const cost = parseFloat(p.cost) ?? 0;
    const b = normalize(prefs.budget || "");
    if (b === "düşük" || b === "low")   return cost <= 100;
    if (b === "yüksek" || b === "high") return cost >= 100;
    return true; // orta = hepsi geçer
  };
  const matchTravel = p => {
    const key  = normalize(prefs.travelType || "");
    const rule = Object.entries(TRAVEL_TYPE_TAGS).find(([k]) => key.includes(k));
    if (!rule) return true;
    return !tagsMatch(getPlaceTags(p), rule[1].penalty);
  };

  // KAT 1: ilgi + bütçe + kiminle
  let result = places.filter(p => matchInterest(p) && matchBudget(p) && matchTravel(p));
  if (result.length >= 3) return result;

  // KAT 2: ilgi + kiminle
  result = places.filter(p => matchInterest(p) && matchTravel(p));
  if (result.length >= 3) return result;

  // KAT 3: sadece ilgi
  result = places.filter(p => matchInterest(p));
  if (result.length >= 3) return result;

  // KAT 4: tümü (her koşulda bir şey dönmeli)
  return places;
}

// ─────────────────────────────────────────────────────────────
// BÖLÜM 6: K-MEANS KÜMELEME
// ─────────────────────────────────────────────────────────────

function kMeansClusters(places, k) {
  const valid = places.filter(p => p.lat && p.lng && !isNaN(p.lat) && !isNaN(p.lng));
  if (valid.length === 0) return [places];
  if (valid.length <= k)  return valid.map(p => [p]);
  k = Math.min(k, valid.length);

  let centers = Array.from({ length: k }, (_, i) =>
    valid[Math.floor(i * valid.length / k)]
  );
  let assignments = new Array(valid.length).fill(0);
  let changed = true, iter = 0;

  while (changed && iter < 20) {
    changed = false; iter++;
    valid.forEach((p, i) => {
      let best = 0, bestDist = Infinity;
      centers.forEach((c, j) => {
        const d = calculateDistance(parseFloat(p.lat), parseFloat(p.lng), c.lat, c.lng);
        if (d < bestDist) { bestDist = d; best = j; }
      });
      if (assignments[i] !== best) { assignments[i] = best; changed = true; }
    });
    centers = centers.map((c, j) => {
      const members = valid.filter((_, i) => assignments[i] === j);
      if (!members.length) return c;
      return {
        lat: members.reduce((s, p) => s + parseFloat(p.lat), 0) / members.length,
        lng: members.reduce((s, p) => s + parseFloat(p.lng), 0) / members.length,
      };
    });
  }

  const clusters = Array.from({ length: k }, () => []);
  valid.forEach((p, i) => clusters[assignments[i]].push(p));
  return clusters.filter(c => c.length > 0);
}

// ─────────────────────────────────────────────────────────────
// BÖLÜM 7: ROTA OLUŞTURMA
// ─────────────────────────────────────────────────────────────

function nearestNeighborRoute(start, places) {
  if (!places.length) return [];
  let route = [], current = start, remaining = [...places];

  while (remaining.length > 0) {
    let best = null, bestVal = -Infinity;
    for (const p of remaining) {
      const dist = calculateDistance(
        current.lat, current.lng,
        parseFloat(p.lat) || current.lat,
        parseFloat(p.lng) || current.lng
      );
      const val = (p.score || 0) - dist * 4;
      if (val > bestVal) { bestVal = val; best = p; }
    }
    if (!best) break;
    route.push(best);
    current = { lat: parseFloat(best.lat) || current.lat, lng: parseFloat(best.lng) || current.lng };
    remaining = remaining.filter(p => p !== best);
  }

  return route;
}

function twoOptImprove(route) {
  if (route.length < 4) return route;
  let best = [...route], improved = true;

  while (improved) {
    improved = false;
    for (let i = 0; i < best.length - 1; i++) {
      for (let j = i + 2; j < best.length; j++) {
        const nj = (j + 1) % best.length;
        const d1 =
          calculateDistance(best[i].lat, best[i].lng, best[i+1].lat, best[i+1].lng) +
          calculateDistance(best[j].lat, best[j].lng, best[nj].lat, best[nj].lng);
        const d2 =
          calculateDistance(best[i].lat, best[i].lng, best[j].lat, best[j].lng) +
          calculateDistance(best[i+1].lat, best[i+1].lng, best[nj].lat, best[nj].lng);
        if (d2 < d1 - 0.01) {
          best = [
            ...best.slice(0, i + 1),
            ...best.slice(i + 1, j + 1).reverse(),
            ...best.slice(j + 1)
          ];
          improved = true;
        }
      }
    }
  }
  return best;
}

// ─────────────────────────────────────────────────────────────
// BÖLÜM 8: ANA ROTA FONKSİYONU
// ─────────────────────────────────────────────────────────────

function buildSmartRoute(startLocation, places, prefs) {
  if (!places || places.length === 0) return [];

  // Referans nokta: kullanıcı konumu geldiyse onu kullan,
  // gelmediyse şehirdeki yerlerin coğrafi ortalamasını al.
  const cityCenter = getCityCenter(places);
  const refLat = (startLocation && startLocation.lat) ? startLocation.lat : cityCenter.lat;
  const refLng = (startLocation && startLocation.lng) ? startLocation.lng : cityCenter.lng;
  const ref    = { lat: refLat, lng: refLng };

  // 1) Filtrele
  let filtered = filterPlaces(places, prefs);

  // 2) Yürüyüş ise: Haversine ile gerçek km hesabı yap,
  //    3 km içindeki yerleri önce dene, yoksa en yakın 6 yeri al.
  //    Bu adım server.js'de DEĞİL burada yapılıyor — tutarlılık için.
  const isWalking = normalize(prefs.transport || "").includes("yürüyüş");
  if (isWalking) {
    const within3km = filtered.filter(p => {
      const d = calculateDistance(refLat, refLng, parseFloat(p.lat) || 0, parseFloat(p.lng) || 0);
      return d <= 3;
    });
    // 3 km içinde en az 2 yer varsa onları kullan, yoksa en yakın 6'yı al
    if (within3km.length >= 2) {
      filtered = within3km;
    } else {
      filtered = [...filtered]
        .sort((a, b) => {
          const da = calculateDistance(refLat, refLng, parseFloat(a.lat) || 0, parseFloat(a.lng) || 0);
          const db = calculateDistance(refLat, refLng, parseFloat(b.lat) || 0, parseFloat(b.lng) || 0);
          return da - db;
        })
        .slice(0, 6);
    }
  }

  // 3) Skor hesapla (referans noktasına göre)
  const scored = filtered.map(p => scorePlace(p, prefs, refLat, refLng));

  // 4) Kümeleme (aynı güne yakın yerler gitsin)
  const days         = parseInt(prefs.days) || 1;
  const clusterCount = Math.max(1, Math.min(days * 2, Math.floor(scored.length / 2)));
  const clusters     = kMeansClusters(scored, clusterCount);

  const sortedClusters = clusters
    .map(c => {
      const sorted   = c.sort((a, b) => b.score - a.score);
      const avgScore = sorted.reduce((s, p) => s + p.score, 0) / sorted.length;
      return { places: sorted, avgScore };
    })
    .sort((a, b) => b.avgScore - a.avgScore);

  const orderedPool = sortedClusters.flatMap(c => c.places);

  // 5) Nearest neighbor rota (referans noktasından başla)
  let route = nearestNeighborRoute(ref, orderedPool);

  // 6) 2-Opt
  if (route.length >= 4) route = twoOptImprove(route);

  return route;
}

// ─────────────────────────────────────────────────────────────
// BÖLÜM 9: SERVER.JS UYUMLU FONKSİYONLAR
// ─────────────────────────────────────────────────────────────

function scorePlaces(places, prefs, userLat, userLng) {
  // 🔥 FIX: Kullanıcı konumu yerine şehir merkezini kullan
  const cityCenter = getCityCenter(places);
  return places.map(p => scorePlace(p, prefs, cityCenter.lat, cityCenter.lng));
}

function selectTopPlaces(scoredPlaces, limit) {
  const n = Number(limit) || 5;
  return [...scoredPlaces]
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

function filterByInterest(placesList, interest) {
  const kw = getInterestKeywords(interest);
  if (!kw.length) return placesList;
  return placesList.filter(p => tagsMatch(getPlaceTags(p), kw));
}

function splitIntoDaysByCount(routePlaces, totalDays = 1, durationPref = "1 gün") {
  if (!routePlaces || routePlaces.length === 0) return [];
  if (totalDays <= 1) return [routePlaces];

  const maxDailyMin = DURATION_MINUTES[normalize(durationPref)] || 480;
  const days = [];
  let i = 0;

  for (let d = 0; d < totalDays; d++) {
    const dayPlaces = [];
    let usedTime = 0;

    while (i < routePlaces.length) {
      const placeDur = parseFloat(routePlaces[i].duration) || 60;
      if (usedTime + placeDur > maxDailyMin && dayPlaces.length > 0) break;
      dayPlaces.push(routePlaces[i]);
      usedTime += placeDur;
      i++;
    }

    if (dayPlaces.length > 0) days.push(dayPlaces);
  }

  if (i < routePlaces.length && days.length > 0) {
    days[days.length - 1].push(...routePlaces.slice(i));
  }

  return days;
}

// ─────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────

module.exports = {
  scorePlaces,
  selectTopPlaces,
  buildSmartRoute,
  splitIntoDaysByCount,
  filterByInterest,

  // debug/test
  scorePlace,
  filterPlaces,
  getCityCenter,
  kMeansClusters,
  nearestNeighborRoute,
  twoOptImprove,
  getInterestKeywords,
  calculateDistance,
  WEIGHTS,
  INTEREST_MAP,
  TRAVEL_TYPE_TAGS,
};