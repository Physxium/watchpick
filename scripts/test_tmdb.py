import os
import random
from datetime import date
from pathlib import Path

import requests
from dotenv import load_dotenv


# ==================================================
# 기본 설정
# ==================================================

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

TMDB_TOKEN = os.getenv("TMDB_TOKEN")

if not TMDB_TOKEN:
    raise RuntimeError(
        "TMDB_TOKEN이 .env에 설정되어 있지 않습니다."
    )

BASE_URL = "https://api.themoviedb.org/3"

HEADERS = {
    "Authorization": f"Bearer {TMDB_TOKEN}",
    "accept": "application/json",
}


# ==================================================
# 테스트 조건
# ==================================================

TEST_CONFIG = {
    "provider": "Netflix",
    "provider_id": 8,
    "watch_region": "KR",

    "origin_country": "KR",

    "genres": [
        "범죄",
    ],

    "genre_mode": "AND",

    "years": 10,

    # 시리즈 총 에피소드 수
    # None = 제한 없음
    "max_episodes": 20,
}


# ==================================================
# 추천 설정
# ==================================================

QUALITY_LEVELS = [
    {
        "name": "기본",
        "min_vote_count": 100,
        "min_vote_average": 6.5,
    },
    {
        "name": "완화",
        "min_vote_count": 50,
        "min_vote_average": 6.0,
    },
]

BAYESIAN_M = 200

TOP_RATED_COUNT = 5
RECENT_COUNT = 5
LUCKY_COUNT = 3
LUCKY_POOL_SIZE = 20

# 테스트 단계에서 가져올 Discover 페이지 수
MAX_DISCOVER_PAGES = 3


# ==================================================
# TMDB 요청
# ==================================================

def tmdb_get(endpoint, params=None):
    response = requests.get(
        f"{BASE_URL}{endpoint}",
        headers=HEADERS,
        params=params or {},
        timeout=20,
    )

    response.raise_for_status()
    return response.json()


# ==================================================
# TV 장르
# ==================================================

def get_tv_genre_maps():
    data = tmdb_get(
        "/genre/tv/list",
        {
            "language": "ko-KR",
        },
    )

    id_to_name = {
        genre["id"]: genre["name"]
        for genre in data["genres"]
    }

    name_to_id = {
        genre["name"]: genre["id"]
        for genre in data["genres"]
    }

    return id_to_name, name_to_id


# ==================================================
# Discover 파라미터
# ==================================================

def build_discover_params(
    name_to_id,
    quality,
    sort_by,
    page,
):
    today = date.today()

    params = {
        "language": "ko-KR",
        "watch_region": TEST_CONFIG["watch_region"],
        "with_watch_providers": str(
            TEST_CONFIG["provider_id"]
        ),

        "sort_by": sort_by,
        "page": page,

        "first_air_date.lte": today.isoformat(),

        "vote_count.gte": (
            quality["min_vote_count"]
        ),

        "vote_average.gte": (
            quality["min_vote_average"]
        ),
    }

    # 제작국
    if TEST_CONFIG["origin_country"]:
        params["with_origin_country"] = (
            TEST_CONFIG["origin_country"]
        )

    # 최근 N년
    if TEST_CONFIG["years"]:
        min_year = (
            today.year
            - TEST_CONFIG["years"]
            + 1
        )

        params["first_air_date.gte"] = (
            f"{min_year}-01-01"
        )

    # 장르
    selected_genre_ids = []

    for genre_name in TEST_CONFIG["genres"]:
        genre_id = name_to_id.get(
            genre_name
        )

        if genre_id is None:
            print(
                f"[경고] 알 수 없는 장르: "
                f"{genre_name}"
            )
            continue

        selected_genre_ids.append(
            str(genre_id)
        )

    if selected_genre_ids:
        if TEST_CONFIG["genre_mode"] == "AND":
            params["with_genres"] = ",".join(
                selected_genre_ids
            )

        elif TEST_CONFIG["genre_mode"] == "OR":
            params["with_genres"] = "|".join(
                selected_genre_ids
            )

        else:
            raise ValueError(
                "genre_mode는 AND 또는 OR이어야 합니다."
            )

    return params


# ==================================================
# Discover 후보 수집
# ==================================================

def collect_discover_candidates(
    name_to_id,
    quality,
):
    movies = {}

    # 평점순 + 최신순을 합쳐 후보 다양성 확보
    sort_modes = [
        "vote_average.desc",
        "first_air_date.desc",
    ]

    for sort_by in sort_modes:
        for page in range(
            1,
            MAX_DISCOVER_PAGES + 1,
        ):
            params = build_discover_params(
                name_to_id,
                quality,
                sort_by,
                page,
            )

            data = tmdb_get(
                "/discover/tv",
                params,
            )

            for tv in data.get(
                "results",
                [],
            ):
                movies[tv["id"]] = tv

            if page >= data.get(
                "total_pages",
                1,
            ):
                break

    return list(
        movies.values()
    )


# ==================================================
# TV 상세정보
# ==================================================

def get_tv_details(tv_id):
    return tmdb_get(
        f"/tv/{tv_id}",
        {
            "language": "ko-KR",
        },
    )


# ==================================================
# 상세정보 결합 + 에피소드 필터
# ==================================================

def enrich_candidates(
    discover_candidates,
):
    enriched = []

    for index, tv in enumerate(
        discover_candidates,
        start=1,
    ):
        details = get_tv_details(
            tv["id"]
        )

        number_of_episodes = details.get(
            "number_of_episodes",
            0,
        )

        # 에피소드 수 정보가 없으면 일단 제외
        if not number_of_episodes:
            continue

        # 분량 필터
        if (
            TEST_CONFIG["max_episodes"]
            and number_of_episodes
            > TEST_CONFIG["max_episodes"]
        ):
            continue

        item = tv.copy()

        item["_number_of_seasons"] = (
            details.get(
                "number_of_seasons",
                0,
            )
        )

        item["_number_of_episodes"] = (
            number_of_episodes
        )

        item["_status"] = (
            details.get(
                "status",
                ""
            )
        )

        enriched.append(
            item
        )

    return enriched


# ==================================================
# Bayesian 보정평점
# ==================================================

def weighted_rating(
    tv,
    quality,
):
    R = tv.get(
        "vote_average",
        0,
    )

    v = tv.get(
        "vote_count",
        0,
    )

    m = BAYESIAN_M

    # 후보 평균이 아니라 품질 하한선을 prior로 사용
    C = quality[
        "min_vote_average"
    ]

    return (
        (v / (v + m)) * R
        + (m / (v + m)) * C
    )


# ==================================================
# 품질 단계 선택
# ==================================================

def get_candidates_for_quality(
    name_to_id,
    quality,
):
    discover_candidates = (
        collect_discover_candidates(
            name_to_id,
            quality,
        )
    )

    return enrich_candidates(
        discover_candidates
    )


def choose_quality_level(
    name_to_id,
):
    for quality in QUALITY_LEVELS:
        candidates = (
            get_candidates_for_quality(
                name_to_id,
                quality,
            )
        )

        if len(candidates) >= 13:
            return (
                quality,
                candidates,
            )

        if quality is QUALITY_LEVELS[-1]:
            return (
                quality,
                candidates,
            )

    return (
        QUALITY_LEVELS[-1],
        [],
    )


# ==================================================
# 추천 생성
# ==================================================

def build_recommendations(
    candidates,
    quality,
):
    for tv in candidates:
        tv["_weighted_rating"] = (
            weighted_rating(
                tv,
                quality,
            )
        )

    # --------------------------------------------------
    # 평가 Top 5
    # --------------------------------------------------

    rated_sorted = sorted(
        candidates,
        key=lambda tv: (
            tv["_weighted_rating"],
            tv.get(
                "vote_count",
                0,
            ),
        ),
        reverse=True,
    )

    rated = rated_sorted[
        :TOP_RATED_COUNT
    ]

    used_ids = {
        tv["id"]
        for tv in rated
    }

    # --------------------------------------------------
    # 최신 Top 5
    # --------------------------------------------------

    recent_candidates = [
        tv
        for tv in candidates
        if tv["id"] not in used_ids
    ]

    recent_sorted = sorted(
        recent_candidates,
        key=lambda tv: (
            tv.get(
                "first_air_date",
                ""
            )
        ),
        reverse=True,
    )

    recent = recent_sorted[
        :RECENT_COUNT
    ]

    used_ids.update(
        tv["id"]
        for tv in recent
    )

    # --------------------------------------------------
    # 행운 후보
    # --------------------------------------------------

    lucky_candidates = [
        tv
        for tv in candidates
        if tv["id"] not in used_ids
    ]

    lucky_sorted = sorted(
        lucky_candidates,
        key=lambda tv: (
            tv["_weighted_rating"],
            tv.get(
                "vote_count",
                0,
            ),
        ),
        reverse=True,
    )

    lucky_pool = lucky_sorted[
        :LUCKY_POOL_SIZE
    ]

    lucky = random.sample(
        lucky_pool,
        min(
            LUCKY_COUNT,
            len(lucky_pool),
        ),
    )

    return {
        "rated": rated,
        "lucky": lucky,
        "recent": recent,
        "lucky_pool": lucky_pool,
    }


# ==================================================
# 출력
# ==================================================

def get_status_label(status):
    if status == "Ended":
        return "완결"

    if status in (
        "Returning Series",
        "In Production",
    ):
        return "방영 중"

    if status == "Canceled":
        return "종료"

    return status or "-"


def print_tv(
    tv,
    index,
):
    print(
        f"[{index}] "
        f"{tv.get('name')}"
    )

    print(
        f"평점: "
        f"{tv.get('vote_average')}"
        f" / 평가수: "
        f"{tv.get('vote_count')}"
    )

    print(
        f"첫 방영: "
        f"{tv.get('first_air_date') or '-'}"
    )

    print(
        f"시즌: "
        f"{tv['_number_of_seasons']}"
        f" / 에피소드: "
        f"{tv['_number_of_episodes']}"
        f" / 상태: "
        f"{get_status_label(tv['_status'])}"
    )

    print(
        f"내부 보정평점: "
        f"{tv['_weighted_rating']:.3f}"
    )

    print(
        "-" * 90
    )


def print_section(
    title,
    items,
):
    print()
    print("#" * 90)
    print(title)
    print("#" * 90)

    if not items:
        print(
            "추천 가능한 작품이 없습니다."
        )
        return

    for index, tv in enumerate(
        items,
        start=1,
    ):
        print_tv(
            tv,
            index,
        )


# ==================================================
# 실행
# ==================================================

def main():
    _, name_to_id = (
        get_tv_genre_maps()
    )

    quality, candidates = (
        choose_quality_level(
            name_to_id
        )
    )

    recommendations = (
        build_recommendations(
            candidates,
            quality,
        )
    )

    print()
    print("=" * 90)
    print("볼만한픽 시리즈 추천 테스트")
    print("=" * 90)

    print(
        f"OTT: "
        f"{TEST_CONFIG['provider']}"
    )

    print(
        f"제작국: "
        f"{TEST_CONFIG['origin_country']}"
    )

    print(
        f"장르: "
        f"{', '.join(TEST_CONFIG['genres'])} "
        f"({TEST_CONFIG['genre_mode']})"
    )

    print(
        f"최근: "
        f"{TEST_CONFIG['years']}년"
    )

    if TEST_CONFIG["max_episodes"]:
        print(
            f"분량: "
            f"{TEST_CONFIG['max_episodes']}화 이하"
        )
    else:
        print(
            "분량: 상관없음"
        )

    print()

    print(
        f"품질 기준: "
        f"{quality['name']}"
    )

    print(
        f"평가수 ≥ "
        f"{quality['min_vote_count']}"
        f" / 평점 ≥ "
        f"{quality['min_vote_average']}"
    )

    print(
        f"최종 후보 수: "
        f"{len(candidates)}"
    )

    print(
        f"Bayesian m: "
        f"{BAYESIAN_M}"
    )

    print("=" * 90)

    if len(candidates) < 13:
        print()
        print(
            "※ 선택한 조건에 맞는 충분히 좋은 "
            f"시리즈가 {len(candidates)}개뿐입니다."
        )

    print_section(
        "⭐ 평가 Top 5",
        recommendations["rated"],
    )

    print_section(
        "🍀 행운의 발견",
        recommendations["lucky"],
    )

    print_section(
        "🆕 최신 작품 Top 5",
        recommendations["recent"],
    )

    print()

    print(
        f"행운의 발견 리롤 후보풀: "
        f"{len(recommendations['lucky_pool'])}개"
    )


if __name__ == "__main__":
    main()