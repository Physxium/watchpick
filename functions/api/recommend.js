/* =========================================================
   볼만한픽 / Pick to Watch
   Cloudflare Pages Function

   Endpoint:
   /api/recommend

   Cloudflare Secret:
   TMDB_TOKEN
========================================================= */


const TMDB_BASE_URL =
    "https://api.themoviedb.org/3";


/* =========================================================
   1. 기본 설정
========================================================= */

const CONFIG = {

    watchRegion:
        "KR",

    topRatedCount:
        5,

    recentCount:
        5,

    luckyPoolSize:
        20,

    minimumRecommendationCount:
        13,

    bayesianM:
        200,

    discoverPages:
        3,

    seriesRefineDiscoverPages:
        4,

    seriesDetailLimit:
        40,

    parallelRequestLimit:
        8,

    /*
       실제 KR flatrate 검증

       일반 추천:
       Top 5 + Latest 5 + Lucky 후보 20
       = 최대 30개면 충분
    */
    verifiedTargetCount:
        30,

    /*
       에피소드 수 필터를 거치면
       일부가 추가 탈락하므로 조금 더 확보
    */
    verifiedSeriesRefineTargetCount:
        40,

    /*
       Discover 자체가 이미 OTT로 후보를 좁히므로
       보통 이 수치까지 갈 일은 없음.

       단, Wavve처럼 Discover 결과와
       작품별 availability가 어긋나는 경우를 대비.
    */
    maxProviderChecks:
        80,

};


/* =========================================================
   2. 품질 기준
========================================================= */

const QUALITY_LEVELS = [

    {
        id:
            "base",

        minVoteCount:
            100,

        minRating:
            6.5,
    },

    {
        id:
            "fallback",

        minVoteCount:
            50,

        minRating:
            6.0,
    },

];


/* =========================================================
   3. 지원 OTT

   확인된 provider ID는 고정.

   TVING은 TMDB provider 목록에서
   이름으로 찾아 사용한다.
========================================================= */

const OTT_PROVIDERS = {

    netflix: {

        ids: [
            8,
        ],

        names: [
            "Netflix",
        ],
    },


    disney: {

        ids: [
            337,
        ],

        names: [
            "Disney Plus",
            "Disney+",
        ],
    },


    prime: {

        ids: [
            119,
        ],

        names: [
            "Amazon Prime Video",
            "Prime Video",
        ],
    },


    apple: {

        ids: [
            350,
        ],

        names: [
            "Apple TV Plus",
            "Apple TV+",
        ],
    },


    wavve: {

        ids: [
            356,
        ],

        names: [
            "wavve",
            "Wavve",
        ],
    },


    tving: {

        /*
           현재 TMDB 목록에서 동적으로 찾음.
           Cloudflare 인스턴스에서 캐시됨.
        */
        ids: [],

        names: [
            "TVING",
            "Tving",
        ],
    },


    watcha: {

        ids: [
            97,
        ],

        names: [
            "Watcha",
            "WATCHA",
        ],
    },

};


/* =========================================================
   4. 영화 장르 그룹
========================================================= */

const MOVIE_GENRE_GROUPS = {

    action: [
        28,
        12,
        10752,
        37,
    ],

    comedy: [
        35,
    ],

    crime: [
        80,
    ],

    thriller: [
        53,
    ],

    mystery: [
        9648,
    ],

    sf_fantasy: [
        878,
        14,
    ],

    romance: [
        10749,
    ],

    drama: [
        18,
        36,
        10752,
        37,
    ],

    horror: [
        27,
    ],

    animation: [
        16,
        10751,
    ],

    documentary: [
        99,
    ],

};


/* =========================================================
   5. 시리즈 장르 그룹
========================================================= */

const SERIES_GENRE_GROUPS = {

    action_adventure: [
        10759,
        10768,
        37,
    ],

    comedy: [
        35,
    ],

    crime: [
        80,
    ],

    mystery: [
        9648,
    ],

    sf_fantasy: [
        10765,
    ],

    drama: [
        18,
        10766,
        10768,
    ],

    animation: [
        16,
    ],

    documentary: [
        99,
    ],

    reality: [
        10764,
    ],

    family_kids: [
        10751,
        10762,
    ],

};


const SERIES_ALWAYS_EXCLUDED_GENRES = [

    10763, // News
    10767, // Talk

];


/* =========================================================
   6. 제작지역

   일본을 기타 아시아에서 분리.
========================================================= */

const REGION_GROUPS = {

    korea: [
        "KR",
    ],


    japan: [
        "JP",
    ],


    north_america: [
        "US",
        "CA",
    ],


    europe: [

        "GB",
        "FR",
        "DE",
        "ES",
        "IT",

        "NL",
        "BE",
        "SE",
        "NO",
        "DK",

        "FI",
        "PL",
        "AT",
        "CH",
        "IE",

        "PT",
        "CZ",
        "HU",
        "GR",
        "RO",

        "BG",
        "HR",
        "SI",
        "SK",

        "EE",
        "LV",
        "LT",

        "IS",
        "LU",

        "RS",
        "BA",
        "ME",
        "MK",
        "AL",
    ],


    other_asia: [

        "CN",
        "HK",
        "TW",

        "IN",
        "PK",
        "BD",
        "LK",

        "TH",
        "VN",
        "PH",
        "ID",

        "MY",
        "SG",
        "KH",
        "MM",

        "MN",
        "NP",
    ],

};


/* =========================================================
   7. 메모리 캐시
========================================================= */

let countryCodesCache =
    null;


const providerListCache = {

    movie:
        null,

    series:
        null,

};


/* =========================================================
   8. 응답
========================================================= */

function jsonResponse(
    data,
    status = 200
) {

    return new Response(
        JSON.stringify(
            data
        ),
        {
            status,

            headers: {

                "Content-Type":
                    "application/json; charset=utf-8",

            },
        }
    );
}


/* =========================================================
   9. TMDB 요청
========================================================= */

async function tmdbGet(
    token,
    endpoint,
    params = {}
) {

    const url =
        new URL(
            `${TMDB_BASE_URL}${endpoint}`
        );


    for (
        const [
            key,
            value,
        ]
        of Object.entries(
            params
        )
    ) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            continue;
        }


        url.searchParams.set(
            key,
            String(
                value
            )
        );
    }


    const response =
        await fetch(
            url,
            {
                headers: {

                    Authorization:
                        `Bearer ${token}`,

                    Accept:
                        "application/json",

                },
            }
        );


    if (
        !response.ok
    ) {

        const errorText =
            await response.text();


        throw new Error(
            `TMDB ${response.status}: ${errorText}`
        );
    }


    return response.json();
}


/* =========================================================
   10. 언어
========================================================= */

function getTmdbLanguage(
    language
) {

    return language === "en"
        ? "en-US"
        : "ko-KR";
}


/* =========================================================
   11. 날짜
========================================================= */

function formatDate(
    date
) {

    return date
        .toISOString()
        .slice(
            0,
            10
        );
}


function subtractYears(
    date,
    years
) {

    const result =
        new Date(
            date
        );


    result.setFullYear(
        result.getFullYear() -
        years
    );


    return result;
}


/* =========================================================
   12. 국가
========================================================= */

async function getAllCountryCodes(
    token
) {

    if (
        countryCodesCache
    ) {

        return countryCodesCache;
    }


    const data =
        await tmdbGet(
            token,
            "/configuration/countries",
            {
                language:
                    "en-US",
            }
        );


    countryCodesCache =
        data
            .map(
                country =>
                    country.iso_3166_1
            )
            .filter(
                Boolean
            );


    return countryCodesCache;
}


async function resolveRegionCodes(
    token,
    selectedRegions
) {

    const result =
        new Set();


    const mappedCodes =
        new Set(
            Object
                .values(
                    REGION_GROUPS
                )
                .flat()
        );


    for (
        const regionId
        of selectedRegions
    ) {

        if (
            regionId !== "other"
        ) {

            const codes =
                REGION_GROUPS[
                regionId
                ] || [];


            codes.forEach(
                code =>
                    result.add(
                        code
                    )
            );


            continue;
        }


        const allCountries =
            await getAllCountryCodes(
                token
            );


        allCountries
            .filter(
                code =>
                    !mappedCodes.has(
                        code
                    )
            )
            .forEach(
                code =>
                    result.add(
                        code
                    )
            );
    }


    return [
        ...result,
    ];
}


/* =========================================================
   13. OTT Provider 목록
========================================================= */

function normalizeProviderName(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .toLowerCase();
}


async function getKoreanProviderList(
    token,
    mediaType
) {

    if (
        providerListCache[
        mediaType
        ]
    ) {

        return providerListCache[
            mediaType
        ];
    }


    const endpoint =
        mediaType === "movie"
            ? "/watch/providers/movie"
            : "/watch/providers/tv";


    const data =
        await tmdbGet(
            token,
            endpoint,
            {
                language:
                    "en-US",

                watch_region:
                    CONFIG.watchRegion,
            }
        );


    providerListCache[
        mediaType
    ] =
        data.results || [];


    return providerListCache[
        mediaType
    ];
}


/* =========================================================
   14. OTT ID 해결

   고정 ID가 있으면 그대로 사용.
   TVING처럼 동적 항목만 provider 목록에서 탐색.
========================================================= */

async function getOttProviderIds(
    token,
    mediaType,
    ottId
) {

    const definition =
        OTT_PROVIDERS[
        ottId
        ];


    if (
        !definition
    ) {

        return [];
    }


    if (
        definition.ids.length >
        0
    ) {

        return [
            ...definition.ids,
        ];
    }


    const providerList =
        await getKoreanProviderList(
            token,
            mediaType
        );


    const wantedNames =
        new Set(
            definition.names.map(
                normalizeProviderName
            )
        );


    return providerList
        .filter(
            provider =>
                wantedNames.has(
                    normalizeProviderName(
                        provider.provider_name
                    )
                )
        )
        .map(
            provider =>
                provider.provider_id
        )
        .filter(
            Boolean
        );
}


/* =========================================================
   15. 현재 검색에 적용할 OTT
========================================================= */

function getRequestedOttKeys(
    selectedOtt
) {

    if (
        !Array.isArray(
            selectedOtt
        ) ||
        selectedOtt.length ===
        0 ||
        selectedOtt.includes(
            "all"
        )
    ) {

        return Object.keys(
            OTT_PROVIDERS
        );
    }


    return selectedOtt
        .filter(
            id =>
                Object.prototype
                    .hasOwnProperty
                    .call(
                        OTT_PROVIDERS,
                        id
                    )
        );
}


async function resolveRequestedProviderIds(
    token,
    mediaType,
    selectedOtt
) {

    const requestedKeys =
        getRequestedOttKeys(
            selectedOtt
        );


    const arrays =
        await Promise.all(
            requestedKeys.map(
                ottId =>
                    getOttProviderIds(
                        token,
                        mediaType,
                        ottId
                    )
            )
        );


    const ids =
        [
            ...new Set(
                arrays.flat()
            ),
        ];


    return {

        requestedKeys,

        ids,

    };
}


/* =========================================================
   16. 작품별 KR flatrate 추출
========================================================= */

function extractKoreanFlatRateProviders(
    data
) {

    const providers =
        data
            ?.results
            ?.[
            CONFIG.watchRegion
        ]
            ?.flatrate ||
        [];


    return providers
        .map(
            provider => ({

                id:
                    Number(
                        provider.provider_id
                    ),

                name:
                    provider.provider_name,

                priority:
                    provider.display_priority ??
                    999,

            })
        )
        .filter(
            provider =>
                Number.isInteger(
                    provider.id
                )
        )
        .sort(
            (
                a,
                b
            ) =>
                a.priority -
                b.priority
        );
}


/* =========================================================
   17. 작품별 Provider 조회
========================================================= */

async function getItemProviderData(
    token,
    item,
    mediaType,
    providerCache
) {

    const cacheKey =
        `${mediaType}:${item.id}`;


    if (
        providerCache.has(
            cacheKey
        )
    ) {

        return providerCache.get(
            cacheKey
        );
    }


    const endpoint =
        mediaType === "movie"
            ? `/movie/${item.id}/watch/providers`
            : `/tv/${item.id}/watch/providers`;


    const data =
        await tmdbGet(
            token,
            endpoint
        );


    const providers =
        extractKoreanFlatRateProviders(
            data
        );


    providerCache.set(
        cacheKey,
        providers
    );


    return providers;
}


/* =========================================================
   18. 장르
========================================================= */

function getGenreGroups(
    mediaType
) {

    return mediaType === "movie"
        ? MOVIE_GENRE_GROUPS
        : SERIES_GENRE_GROUPS;
}


function getSelectedRawGenreIds(
    mediaType,
    selectedGenres
) {

    const groups =
        getGenreGroups(
            mediaType
        );


    const ids =
        new Set();


    for (
        const genreKey
        of selectedGenres
    ) {

        const rawIds =
            groups[
            genreKey
            ] || [];


        rawIds.forEach(
            id =>
                ids.add(
                    id
                )
        );
    }


    return [
        ...ids,
    ];
}


function itemMatchesSelectedGenres(
    item,
    mediaType,
    selectedGenres,
    genreMode
) {

    const groups =
        getGenreGroups(
            mediaType
        );


    const itemGenres =
        new Set(
            item.genre_ids || []
        );


    if (
        mediaType === "series" &&
        SERIES_ALWAYS_EXCLUDED_GENRES
            .some(
                id =>
                    itemGenres.has(
                        id
                    )
            )
    ) {

        return false;
    }


    if (
        !selectedGenres.includes(
            "documentary"
        ) &&
        itemGenres.has(
            99
        )
    ) {

        return false;
    }


    const matches =
        selectedGenres.map(
            genreKey => {

                const rawIds =
                    groups[
                    genreKey
                    ] || [];


                return rawIds.some(
                    id =>
                        itemGenres.has(
                            id
                        )
                );
            }
        );


    return genreMode === "all"
        ? matches.every(
            Boolean
        )
        : matches.some(
            Boolean
        );
}


function getItemGenreKeys(
    item,
    mediaType
) {

    const groups =
        getGenreGroups(
            mediaType
        );


    const itemGenres =
        new Set(
            item.genre_ids || []
        );


    return Object
        .entries(
            groups
        )
        .filter(
            ([
                ,
                rawIds,
            ]) =>
                rawIds.some(
                    id =>
                        itemGenres.has(
                            id
                        )
                )
        )
        .map(
            ([
                key,
            ]) =>
                key
        );
}


/* =========================================================
   19. Discover 파라미터
========================================================= */

async function buildDiscoverParams(
    token,
    requestData,
    quality,
    sortBy,
    page
) {

    const today =
        new Date();


    const params = {

        language:
            getTmdbLanguage(
                requestData.language
            ),

        page,

        sort_by:
            sortBy,

        include_adult:
            false,

        "vote_count.gte":
            quality.minVoteCount,

        "vote_average.gte":
            quality.minRating,

        watch_region:
            CONFIG.watchRegion,

        with_watch_monetization_types:
            "flatrate",

    };


    /* 미래 작품 제외 */

    if (
        requestData.mediaType ===
        "movie"
    ) {

        params[
            "primary_release_date.lte"
        ] =
            formatDate(
                today
            );

    } else {

        params[
            "first_air_date.lte"
        ] =
            formatDate(
                today
            );
    }


    /* 연도 */

    if (
        requestData.selectedYear !==
        "all"
    ) {

        const years =
            Number(
                requestData.selectedYear
            );


        const fromDate =
            subtractYears(
                today,
                years
            );


        if (
            requestData.mediaType ===
            "movie"
        ) {

            params[
                "primary_release_date.gte"
            ] =
                formatDate(
                    fromDate
                );

        } else {

            params[
                "first_air_date.gte"
            ] =
                formatDate(
                    fromDate
                );
        }
    }


    /* 제작지역 */

    if (
        requestData.regionCodes.length
    ) {

        params.with_origin_country =
            requestData.regionCodes.join(
                "|"
            );
    }


    /* OTT */

    if (
        requestData.providerIds.length
    ) {

        params.with_watch_providers =
            requestData.providerIds.join(
                "|"
            );

    } else {

        /*
           선택한 OTT의 provider를 하나도 찾지 못했다면
           Discover가 전체 작품을 반환하면 안 됨.

           존재하지 않는 ID를 넣어 결과를 0으로 만든다.
        */
        params.with_watch_providers =
            "-1";
    }


    /* 장르 */

    const rawGenreIds =
        getSelectedRawGenreIds(
            requestData.mediaType,
            requestData.selectedGenres
        );


    if (
        rawGenreIds.length
    ) {

        params.with_genres =
            rawGenreIds.join(
                "|"
            );
    }


    /* 제외 장르 */

    const excludedGenres =
        [];


    if (
        !requestData.selectedGenres
            .includes(
                "documentary"
            )
    ) {

        excludedGenres.push(
            99
        );
    }


    if (
        requestData.mediaType ===
        "series"
    ) {

        excludedGenres.push(
            ...SERIES_ALWAYS_EXCLUDED_GENRES
        );
    }


    if (
        excludedGenres.length
    ) {

        params.without_genres =
            [
                ...new Set(
                    excludedGenres
                ),
            ]
                .join(
                    "|"
                );
    }


    /* 영화 길이 */

    if (
        requestData.mediaType ===
        "movie" &&
        requestData.maxRuntime
    ) {

        params[
            "with_runtime.lte"
        ] =
            requestData.maxRuntime;
    }


    return params;
}


/* =========================================================
   20. Discover
========================================================= */

async function fetchDiscoverPages(
    token,
    requestData,
    quality,
    sortBy,
    maxPages
) {

    const endpoint =
        requestData.mediaType ===
            "movie"
            ? "/discover/movie"
            : "/discover/tv";


    const firstParams =
        await buildDiscoverParams(
            token,
            requestData,
            quality,
            sortBy,
            1
        );


    const firstPage =
        await tmdbGet(
            token,
            endpoint,
            firstParams
        );


    const results =
        [
            ...(
                firstPage.results ||
                []
            ),
        ];


    const totalPages =
        Math.min(
            Number(
                firstPage.total_pages ||
                1
            ),
            maxPages
        );


    if (
        totalPages <= 1
    ) {

        return results;
    }


    const jobs =
        [];


    for (
        let page = 2;
        page <= totalPages;
        page++
    ) {

        jobs.push(

            buildDiscoverParams(
                token,
                requestData,
                quality,
                sortBy,
                page
            )
                .then(
                    params =>
                        tmdbGet(
                            token,
                            endpoint,
                            params
                        )
                )

        );
    }


    const remaining =
        await Promise.all(
            jobs
        );


    remaining.forEach(
        pageData => {

            results.push(
                ...(
                    pageData.results ||
                    []
                )
            );
        }
    );


    return results;
}


/* =========================================================
   21. Discover 후보 수집
========================================================= */

async function collectCandidates(
    token,
    requestData,
    quality
) {

    const isSeriesRefine =
        requestData.mediaType ===
        "series" &&
        requestData.maxEpisodes;


    const maxPages =
        isSeriesRefine
            ? CONFIG.seriesRefineDiscoverPages
            : CONFIG.discoverPages;


    const recentSort =
        requestData.mediaType ===
            "movie"
            ? "primary_release_date.desc"
            : "first_air_date.desc";


    const [
        scoreResults,
        recentResults,
    ] =
        await Promise.all([

            fetchDiscoverPages(
                token,
                requestData,
                quality,
                "vote_average.desc",
                maxPages
            ),

            fetchDiscoverPages(
                token,
                requestData,
                quality,
                recentSort,
                maxPages
            ),

        ]);


    const candidateMap =
        new Map();


    [
        ...scoreResults,
        ...recentResults,
    ]
        .forEach(
            item => {

                if (
                    !item ||
                    !item.id
                ) {

                    return;
                }


                if (
                    !itemMatchesSelectedGenres(
                        item,
                        requestData.mediaType,
                        requestData.selectedGenres,
                        requestData.genreMode
                    )
                ) {

                    return;
                }


                candidateMap.set(
                    item.id,
                    item
                );
            }
        );


    return [
        ...candidateMap.values(),
    ];
}


/* =========================================================
   22. Bayesian 점수
========================================================= */

function calculateAdjustedScore(
    item,
    quality
) {

    const rating =
        Number(
            item.vote_average ||
            0
        );


    const votes =
        Number(
            item.vote_count ||
            0
        );


    const m =
        CONFIG.bayesianM;


    const prior =
        quality.minRating;


    return (
        (
            votes /
            (
                votes +
                m
            )
        ) *
        rating
    ) +
        (
            (
                m /
                (
                    votes +
                    m
                )
            ) *
            prior
        );
}


/* =========================================================
   23. 날짜
========================================================= */

function getItemDate(
    item,
    mediaType
) {

    return mediaType === "movie"
        ? (
            item.release_date ||
            ""
        )
        : (
            item.first_air_date ||
            ""
        );
}


/* =========================================================
   24. Provider 검증 우선순위

   평가순과 최신순을 번갈아 넣어
   어느 한쪽만 검증되는 것을 방지.
========================================================= */

function prioritizeCandidates(
    candidates,
    quality,
    mediaType
) {

    const rated =
        [
            ...candidates,
        ]
            .sort(
                (
                    a,
                    b
                ) => {

                    const difference =
                        calculateAdjustedScore(
                            b,
                            quality
                        ) -
                        calculateAdjustedScore(
                            a,
                            quality
                        );


                    if (
                        difference !== 0
                    ) {

                        return difference;
                    }


                    return (
                        b.vote_count ||
                        0
                    ) -
                        (
                            a.vote_count ||
                            0
                        );
                }
            );


    const recent =
        [
            ...candidates,
        ]
            .sort(
                (
                    a,
                    b
                ) =>
                    getItemDate(
                        b,
                        mediaType
                    )
                        .localeCompare(
                            getItemDate(
                                a,
                                mediaType
                            )
                        )
            );


    const ordered =
        [];

    const seen =
        new Set();


    let index =
        0;


    while (
        ordered.length <
        candidates.length &&
        (
            index <
            rated.length ||
            index <
            recent.length
        )
    ) {

        const pair = [

            rated[
            index
            ],

            recent[
            index
            ],

        ];


        for (
            const item
            of pair
        ) {

            if (
                !item ||
                seen.has(
                    item.id
                )
            ) {

                continue;
            }


            seen.add(
                item.id
            );


            ordered.push(
                item
            );
        }


        index++;
    }


    return ordered;
}


/* =========================================================
   25. 실제 KR flatrate 검증

   이 부분이 Wavve 오탐을 막는 핵심.
========================================================= */

async function verifyCandidatesByProviders(
    token,
    candidates,
    requestData,
    quality,
    providerCache
) {

    if (
        requestData.providerIds.length ===
        0
    ) {

        return [];
    }


    const selectedIds =
        new Set(
            requestData.providerIds
        );


    const ordered =
        prioritizeCandidates(
            candidates,
            quality,
            requestData.mediaType
        );


    const targetCount =
        (
            requestData.mediaType ===
            "series" &&
            requestData.maxEpisodes
        )
            ? CONFIG
                .verifiedSeriesRefineTargetCount
            : CONFIG
                .verifiedTargetCount;


    const maxChecks =
        Math.min(
            CONFIG.maxProviderChecks,
            ordered.length
        );


    const verified =
        [];


    let checked =
        0;


    /*
       한 번에 너무 많은 API 요청을 하지 않고
       8개씩 확인한다.
    */
    while (
        checked <
        maxChecks &&
        verified.length <
        targetCount
    ) {

        const batch =
            ordered.slice(
                checked,
                Math.min(
                    checked +
                    CONFIG.parallelRequestLimit,
                    maxChecks
                )
            );


        const checkedBatch =
            await Promise.all(
                batch.map(
                    async item => {

                        try {

                            const providers =
                                await getItemProviderData(
                                    token,
                                    item,
                                    requestData.mediaType,
                                    providerCache
                                );


                            const matches =
                                providers.some(
                                    provider =>
                                        selectedIds.has(
                                            provider.id
                                        )
                                );


                            if (
                                !matches
                            ) {

                                return null;
                            }


                            return {

                                ...item,

                                /*
                                   카드에서 그대로 사용할 수 있으므로
                                   provider 요청을 다시 할 필요 없음.
                                */
                                _providers:
                                    providers.map(
                                        provider =>
                                            provider.name
                                    ),

                            };


                        } catch (
                        error
                        ) {

                            console.error(
                                `Provider verification failed: ${requestData.mediaType}:${item.id}`,
                                error
                            );


                            return null;
                        }
                    }
                )
            );


        for (
            const item
            of checkedBatch
        ) {

            if (
                item
            ) {

                verified.push(
                    item
                );
            }
        }


        checked +=
            batch.length;
    }


    return verified;
}


/* =========================================================
   26. 제한 병렬 처리
========================================================= */

async function mapWithConcurrency(
    items,
    limit,
    mapper
) {

    if (
        items.length === 0
    ) {

        return [];
    }


    const results =
        new Array(
            items.length
        );


    let nextIndex =
        0;


    async function worker() {

        while (
            nextIndex <
            items.length
        ) {

            const index =
                nextIndex++;


            results[
                index
            ] =
                await mapper(
                    items[
                    index
                    ],
                    index
                );
        }
    }


    const count =
        Math.min(
            limit,
            items.length
        );


    await Promise.all(
        Array.from(
            {
                length:
                    count,
            },
            () =>
                worker()
        )
    );


    return results;
}


/* =========================================================
   27. 시리즈 에피소드 필터
========================================================= */

async function filterSeriesByEpisodeCount(
    token,
    candidates,
    maxEpisodes,
    language
) {

    const limited =
        candidates.slice(
            0,
            CONFIG.seriesDetailLimit
        );


    const details =
        await mapWithConcurrency(
            limited,
            CONFIG.parallelRequestLimit,
            async item => {

                const detail =
                    await tmdbGet(
                        token,
                        `/tv/${item.id}`,
                        {
                            language:
                                getTmdbLanguage(
                                    language
                                ),
                        }
                    );


                return {

                    ...item,

                    _episodes:
                        detail.number_of_episodes ||
                        0,

                    _status:
                        detail.status ||
                        null,

                };
            }
        );


    return details
        .filter(
            item =>
                item._episodes >
                0 &&
                item._episodes <=
                maxEpisodes
        );
}


/* =========================================================
   28. 후보풀 결정
========================================================= */

async function chooseCandidatePool(
    token,
    requestData
) {

    let finalCandidates =
        [];

    let finalQuality =
        QUALITY_LEVELS[
        QUALITY_LEVELS.length -
        1
        ];


    /*
       base / fallback 사이에서
       provider 결과를 재사용.
    */
    const providerCache =
        new Map();


    for (
        const quality
        of QUALITY_LEVELS
    ) {

        /*
           1. Discover에서 OTT 포함 모든 기본 조건 적용
        */
        let candidates =
            await collectCandidates(
                token,
                requestData,
                quality
            );


        /*
           2. 실제 KR flatrate에
              선택한 OTT가 있는지 확인
        */
        candidates =
            await verifyCandidatesByProviders(
                token,
                candidates,
                requestData,
                quality,
                providerCache
            );


        /*
           3. 시리즈 분량 필터가 있다면
              provider 검증을 통과한 작품만 상세조회
        */
        if (
            requestData.mediaType ===
            "series" &&
            requestData.maxEpisodes
        ) {

            candidates =
                await filterSeriesByEpisodeCount(
                    token,
                    candidates,
                    requestData.maxEpisodes,
                    requestData.language
                );
        }


        finalCandidates =
            candidates;

        finalQuality =
            quality;


        if (
            candidates.length >=
            CONFIG.minimumRecommendationCount
        ) {

            break;
        }
    }


    return {

        candidates:
            finalCandidates,

        quality:
            finalQuality,

    };
}


/* =========================================================
   29. 추천 구성
========================================================= */

function buildRecommendations(
    candidates,
    quality,
    mediaType
) {

    const scored =
        candidates.map(
            item => ({

                ...item,

                _adjustedScore:
                    calculateAdjustedScore(
                        item,
                        quality
                    ),

            })
        );


    /* 평가 Top 5 */

    const topRated =
        [
            ...scored,
        ]
            .sort(
                (
                    a,
                    b
                ) => {

                    if (
                        b._adjustedScore !==
                        a._adjustedScore
                    ) {

                        return (
                            b._adjustedScore -
                            a._adjustedScore
                        );
                    }


                    return (
                        b.vote_count ||
                        0
                    ) -
                        (
                            a.vote_count ||
                            0
                        );
                }
            )
            .slice(
                0,
                CONFIG.topRatedCount
            );


    const usedIds =
        new Set(
            topRated.map(
                item =>
                    item.id
            )
        );


    /* 최신 5 */

    const recent =
        scored
            .filter(
                item =>
                    !usedIds.has(
                        item.id
                    )
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    getItemDate(
                        b,
                        mediaType
                    )
                        .localeCompare(
                            getItemDate(
                                a,
                                mediaType
                            )
                        )
            )
            .slice(
                0,
                CONFIG.recentCount
            );


    recent.forEach(
        item =>
            usedIds.add(
                item.id
            )
    );


    /* Lucky 후보 20 */

    const luckyPool =
        scored
            .filter(
                item =>
                    !usedIds.has(
                        item.id
                    )
            )
            .sort(
                (
                    a,
                    b
                ) => {

                    if (
                        b._adjustedScore !==
                        a._adjustedScore
                    ) {

                        return (
                            b._adjustedScore -
                            a._adjustedScore
                        );
                    }


                    return (
                        b.vote_count ||
                        0
                    ) -
                        (
                            a.vote_count ||
                            0
                        );
                }
            )
            .slice(
                0,
                CONFIG.luckyPoolSize
            );


    return {

        topRated,
        recent,
        luckyPool,

    };
}


/* =========================================================
   30. 브라우저 전달 형태
========================================================= */

function toPublicItem(
    item,
    mediaType
) {

    const releaseDate =
        getItemDate(
            item,
            mediaType
        );


    return {

        id:
            item.id,

        type:
            mediaType,

        title:
            mediaType === "movie"
                ? (
                    item.title ||
                    item.original_title ||
                    ""
                )
                : (
                    item.name ||
                    item.original_name ||
                    ""
                ),

        posterPath:
            item.poster_path ||
            null,

        rating:
            Number(
                item.vote_average ||
                0
            ),

        voteCount:
            Number(
                item.vote_count ||
                0
            ),

        releaseDate,

        year:
            releaseDate
                ? releaseDate.slice(
                    0,
                    4
                )
                : "",

        genreKeys:
            getItemGenreKeys(
                item,
                mediaType
            ),

        episodes:
            item._episodes ||
            null,

        status:
            item._status ||
            null,

        /*
           OTT 검증 단계에서 이미 얻은 값.
           이제 카드에서 추가 조회할 필요가 없음.
        */
        providers:
            Array.isArray(
                item._providers
            )
                ? item._providers
                : null,

    };
}


/* =========================================================
   31. 상세 국가 코드
========================================================= */

function getCountryCodesFromDetail(
    detail
) {

    const productionCountries =
        (
            detail.production_countries ||
            []
        )
            .map(
                country =>
                    country.iso_3166_1
            )
            .filter(
                Boolean
            );


    if (
        productionCountries.length
    ) {

        return [
            ...new Set(
                productionCountries
            ),
        ];
    }


    return [
        ...new Set(
            detail.origin_country ||
            []
        ),
    ];
}


/* =========================================================
   32. 입력 검증
========================================================= */

function validateRecommendRequest(
    body
) {

    if (
        ![
            "movie",
            "series",
        ]
            .includes(
                body.mediaType
            )
    ) {

        throw new Error(
            "mediaType이 올바르지 않습니다."
        );
    }


    if (
        !Array.isArray(
            body.selectedGenres
        ) ||
        body.selectedGenres.length ===
        0
    ) {

        throw new Error(
            "장르를 하나 이상 선택해야 합니다."
        );
    }


    if (
        !Array.isArray(
            body.selectedRegions
        ) ||
        body.selectedRegions.length ===
        0
    ) {

        throw new Error(
            "제작지역을 하나 이상 선택해야 합니다."
        );
    }


    if (
        body.selectedYear === null ||
        body.selectedYear === undefined
    ) {

        throw new Error(
            "연도를 선택해야 합니다."
        );
    }
}


/* =========================================================
   33. 추천
========================================================= */

async function handleRecommend(
    token,
    body
) {

    validateRecommendRequest(
        body
    );


    const mediaType =
        body.mediaType;


    /*
       OTT ID는 추천 요청당 딱 한 번 해결.
    */
    const ottInfo =
        await resolveRequestedProviderIds(
            token,
            mediaType,
            body.selectedOtt
        );


    const regionCodes =
        await resolveRegionCodes(
            token,
            body.selectedRegions
        );


    const requestData = {

        mediaType,

        language:
            body.language === "en"
                ? "en"
                : "ko",

        selectedOtt:
            Array.isArray(
                body.selectedOtt
            )
                ? body.selectedOtt
                : [
                    "all",
                ],

        requestedOttKeys:
            ottInfo.requestedKeys,

        providerIds:
            ottInfo.ids,

        selectedGenres:
            body.selectedGenres,

        genreMode:
            body.genreMode === "all"
                ? "all"
                : "any",

        selectedRegions:
            body.selectedRegions,

        regionCodes,

        selectedYear:
            String(
                body.selectedYear
            ),

        maxRuntime:
            body.maxRuntime
                ? Number(
                    body.maxRuntime
                )
                : null,

        maxEpisodes:
            body.maxEpisodes
                ? Number(
                    body.maxEpisodes
                )
                : null,

    };


    /*
       provider 자체를 못 찾은 경우
       에러를 내지 않고 "결과 없음" 처리.

       Apple TV+에서 발생했던
       전체 요청 실패를 방지한다.
    */
    if (
        requestData.providerIds.length ===
        0
    ) {

        return {

            quality:
                null,

            candidateCount:
                0,

            notice:
                requestData.language === "ko"
                    ? "선택한 OTT의 대한민국 제공 정보를 찾지 못했어요."
                    : "Streaming availability for the selected service could not be found in South Korea.",

            topRated:
                [],

            luckyPool:
                [],

            recent:
                [],

        };
    }


    const {
        candidates,
        quality,
    } =
        await chooseCandidatePool(
            token,
            requestData
        );


    const recommendations =
        buildRecommendations(
            candidates,
            quality,
            mediaType
        );


    let notice =
        null;


    if (
        candidates.length <
        CONFIG.minimumRecommendationCount
    ) {

        notice =
            requestData.language === "ko"
                ? (
                    `선택한 조건에 맞는 충분히 좋은 작품이 ` +
                    `${candidates.length}개뿐이에요. 조건을 조금 넓혀보세요.`
                )
                : (
                    `Only ${candidates.length} good matches were found. ` +
                    `Try broadening your filters.`
                );
    }


    return {

        quality: {

            level:
                quality.id,

            minVoteCount:
                quality.minVoteCount,

            minRating:
                quality.minRating,

        },

        candidateCount:
            candidates.length,

        notice,

        topRated:
            recommendations.topRated
                .map(
                    item =>
                        toPublicItem(
                            item,
                            mediaType
                        )
                ),

        luckyPool:
            recommendations.luckyPool
                .map(
                    item =>
                        toPublicItem(
                            item,
                            mediaType
                        )
                ),

        recent:
            recommendations.recent
                .map(
                    item =>
                        toPublicItem(
                            item,
                            mediaType
                        )
                ),

    };
}


/* =========================================================
   34. 카드용 Provider API

   새 추천 결과는 이미 provider가 포함되어 있어
   대부분 호출될 필요가 없다.

   기존 frontend 호환을 위해 유지.
========================================================= */

async function handleProviders(
    token,
    body
) {

    const inputItems =
        Array.isArray(
            body.items
        )
            ? body.items
            : [];


    const safeItems =
        inputItems
            .filter(
                item =>
                    item &&
                    Number.isInteger(
                        Number(
                            item.id
                        )
                    ) &&
                    [
                        "movie",
                        "series",
                    ]
                        .includes(
                            item.type
                        )
            )
            .slice(
                0,
                20
            );


    const results =
        await mapWithConcurrency(
            safeItems,
            CONFIG.parallelRequestLimit,
            async item => {

                const endpoint =
                    item.type === "movie"
                        ? `/movie/${item.id}/watch/providers`
                        : `/tv/${item.id}/watch/providers`;


                const data =
                    await tmdbGet(
                        token,
                        endpoint
                    );


                const providers =
                    extractKoreanFlatRateProviders(
                        data
                    )
                        .map(
                            provider =>
                                provider.name
                        );


                return {

                    key:
                        `${item.type}:${item.id}`,

                    providers,

                };
            }
        );


    const providerMap =
        {};


    for (
        const result
        of results
    ) {

        providerMap[
            result.key
        ] =
            result.providers;
    }


    return {

        providers:
            providerMap,

    };
}


/* =========================================================
   35. 상세정보
========================================================= */

async function handleDetail(
    token,
    body
) {

    const type =
        body.type;


    const id =
        Number(
            body.id
        );


    if (
        ![
            "movie",
            "series",
        ]
            .includes(
                type
            ) ||
        !Number.isInteger(
            id
        )
    ) {

        throw new Error(
            "상세정보 요청이 올바르지 않습니다."
        );
    }


    const language =
        body.language === "en"
            ? "en"
            : "ko";


    const detailEndpoint =
        type === "movie"
            ? `/movie/${id}`
            : `/tv/${id}`;


    const providerEndpoint =
        type === "movie"
            ? `/movie/${id}/watch/providers`
            : `/tv/${id}/watch/providers`;


    const [
        detail,
        providerData,
    ] =
        await Promise.all([

            tmdbGet(
                token,
                detailEndpoint,
                {
                    language:
                        getTmdbLanguage(
                            language
                        ),
                }
            ),

            tmdbGet(
                token,
                providerEndpoint
            ),

        ]);


    const releaseDate =
        type === "movie"
            ? (
                detail.release_date ||
                ""
            )
            : (
                detail.first_air_date ||
                ""
            );


    const providerNames =
        extractKoreanFlatRateProviders(
            providerData
        )
            .map(
                provider =>
                    provider.name
            );


    return {

        id,

        type,

        title:
            type === "movie"
                ? (
                    detail.title ||
                    detail.original_title ||
                    ""
                )
                : (
                    detail.name ||
                    detail.original_name ||
                    ""
                ),

        posterPath:
            detail.poster_path ||
            null,

        rating:
            Number(
                detail.vote_average ||
                0
            ),

        voteCount:
            Number(
                detail.vote_count ||
                0
            ),

        releaseDate,

        year:
            releaseDate
                ? releaseDate.slice(
                    0,
                    4
                )
                : "",

        genreKeys:
            getItemGenreKeys(
                {
                    genre_ids:
                        (
                            detail.genres ||
                            []
                        )
                            .map(
                                genre =>
                                    genre.id
                            ),
                },
                type
            ),

        runtime:
            type === "movie"
                ? (
                    detail.runtime ||
                    null
                )
                : null,

        episodes:
            type === "series"
                ? (
                    detail.number_of_episodes ||
                    null
                )
                : null,

        seasons:
            type === "series"
                ? (
                    detail.number_of_seasons ||
                    null
                )
                : null,

        status:
            type === "series"
                ? (
                    detail.status ||
                    null
                )
                : null,

        countryCodes:
            getCountryCodesFromDetail(
                detail
            ),

        overview:
            detail.overview ||
            "",

        providers:
            providerNames,

    };
}


/* =========================================================
   36. Cloudflare Pages Function
========================================================= */

export async function onRequestPost(
    context
) {

    try {

        const token =
            context.env
                .TMDB_TOKEN;


        if (
            !token
        ) {

            return jsonResponse(
                {
                    error:
                        "TMDB_TOKEN이 Cloudflare 환경변수에 설정되어 있지 않습니다.",
                },
                500
            );
        }


        const body =
            await context
                .request
                .json();


        const action =
            body.action ||
            "recommend";


        if (
            action === "recommend"
        ) {

            return jsonResponse(
                await handleRecommend(
                    token,
                    body
                )
            );
        }


        if (
            action === "providers"
        ) {

            return jsonResponse(
                await handleProviders(
                    token,
                    body
                )
            );
        }


        if (
            action === "detail"
        ) {

            return jsonResponse(
                await handleDetail(
                    token,
                    body
                )
            );
        }


        return jsonResponse(
            {
                error:
                    "알 수 없는 action입니다.",
            },
            400
        );


    } catch (
    error
    ) {

        console.error(
            error
        );


        return jsonResponse(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "알 수 없는 오류가 발생했습니다.",
            },
            500
        );
    }
}


/* =========================================================
   37. GET
========================================================= */

export function onRequestGet() {

    return jsonResponse(
        {
            message:
                "POST 요청을 사용해주세요.",
        },
        405
    );
}