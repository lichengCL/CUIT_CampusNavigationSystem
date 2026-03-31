from rapidfuzz import fuzz


def search_pois(queryset, keyword, threshold=60):
    results = []
    for poi in queryset:
        score = max(
            fuzz.partial_ratio(keyword, poi.name),
            fuzz.partial_ratio(keyword, poi.description or ""),
        )
        if score >= threshold:
            results.append((poi, int(score)))
    results.sort(key=lambda item: item[1], reverse=True)
    return results
