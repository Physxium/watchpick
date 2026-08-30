/* =========================================================
   볼만한픽 / Pick to Watch
   Cloudflare Pages Function

   Endpoint:
   /api/recommend

   Cloudflare Secret:
   TMDB_TOKEN
========================================================= */


/* =========================================================
   1. 기본 설정
========================================================= */

const TMDB_BASE_URL =
    "https://api.themoviedb.org/3";


const CONFIG = {

    /*
       OTT 정보는 대한민국 기준
    */
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

    /*
       일반 추천:
       평점순 + 최신순 각각 최대 3페이지
    */
    discoverPages:
        3,

    /*
       시리즈 에피소드 수 2차 필터에서는
       조금 더 넓게 탐색
    */
    seriesRefineDiscoverPages:
        4,

    /*
       시리즈 상세조회 최대 수
    */
    seriesDetailLimit:
        40,

    /*
       동시에 상세 요청할 최대 개수
    */
    parallelRequestLimit:
        8,

};


/* =========================================================
   2. 품질 기준

   이 부분을 수정하면 추천 품질 기준을 쉽게 바꿀 수 있음
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

   app.js의 OTT id와 반드시 맞아야 함.

   aliases는 TMDB Provider 목록에서
   실제 provider ID를 찾기 위한 이름 후보.

   "Amazon Video"는 구매/대여 서비스이므로
   Prime Video alias에 넣지 않음.

   Apple TV Store도 Apple TV+와 별개이므로 제외.
========================================================= */

const SUPPORTED_OTT = {

    netflix: {
        aliases: [
            "Netflix",
        ],
    },

    disney: {
        aliases: [
            "Disney Plus",
            "Disney+",
        ],
    },

    prime: {
        aliases: [
            "Amazon Prime Video",
            "Prime Video",
        ],
    },

    apple: {
        aliases: [
            "Apple TV Plus",
            "Apple TV+",
        ],
    },

    wavve: {
        aliases: [
            "wavve",
            "Wavve",
        ],
    },

    tving: {
        aliases: [
            "TVING",
            "Tving",
        ],
    },

    watcha: {
        aliases: [
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
        28,     // Action
        12,     // Adventure
        10752,  // War
        37,     // Western
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
        878,    // Science Fiction
        14,     // Fantasy
    ],

    romance: [
        10749,
    ],

    drama: [
        18,
        36,     // History
        10752,  // War
        37,     // Western
    ],

    horror: [
        27,
    ],

    animation: [
        16,
        10751,  // Family
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
        10768,  // War & Politics
        37,     // Western
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
        10766,  // Soap
        10768,  // War & Politics
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


/*
   News / Talk는 추천에서 제외
*/
const SERIES_ALWAYS_EXCLUDED_GENRES = [

    10763,  // News
    10767,  // Talk

];


/* =========================================================
   6. 제작지역
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

   Cloudflare Worker 인스턴스가 살아 있는 동안만 유지.
   DB/KV를 사용하는 영구 캐시가 아님.
========================================================= */

let countryCodesCache =
    null;


const providerIndexCache = {

    movie:
        null,

    series:
        null,

};


/* =========================================================
   8. JSON 응답
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


    Object.entries(
        params
    )
        .forEach(
            ([
                key,
                value,
            ]) => {

                if (
                    value === null ||
                    value === undefined ||
                    value === ""
                ) {
                    return;
                }


                url.searchParams.set(
                    key,
                    String(
                        value
                    )
                );
            }
        );


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
   12. 제작지역 코드
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

        /*
           "그 외"가 아닌 일반 지역
        */
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


        /*
           "그 외"

           이미 한국/북미/유럽/기타아시아로
           분류된 국가를 제외한 모든 국가
        */
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
   13. OTT Provider
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


/*
   대한민국 기준 provider 목록을 한 번 가져와
   이름 -> provider ID Map 생성
*/
async function getProviderIndex(
    token,
    mediaType
) {

    if (
        providerIndexCache[
        mediaType
        ]
    ) {

        return providerIndexCache[
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


    const index =
        new Map();


    for (
        const provider
        of data.results || []
    ) {

        const name =
            normalizeProviderName(
                provider.provider_name
            );


        if (
            name
        ) {

            index.set(
                name,
                provider.provider_id
            );
        }
    }


    providerIndexCache[
        mediaType
    ] =
        index;


    return index;
}


/*
   하나의 OTT id를 실제 TMDB provider ID로 변환
*/
async function resolveSingleOttProviderId(
    token,
    mediaType,
    ottId
) {

    const definition =
        SUPPORTED_OTT[
        ottId
        ];


    if (
        !definition
    ) {

        throw new Error(
            `알 수 없는 OTT입니다: ${ottId}`
        );
    }


    const index =
        await getProviderIndex(
            token,
            mediaType
        );


    for (
        const alias
        of definition.aliases
    ) {

        const providerId =
            index.get(
                normalizeProviderName(
                    alias
                )
            );


        if (
            providerId
        ) {

            return providerId;
        }
    }


    throw new Error(
        `TMDB 대한민국 provider 목록에서 ${ottId}를 찾지 못했습니다.`
    );
}


/*
   실제 Discover에 사용할 provider ID 목록 생성

   중요:
   - "전체"도 provider 필터를 제거하지 않음.
   - 지원하는 7개 OTT 전체를 OR 조건으로 넣음.
   - 따라서 어떤 지원 OTT에도 없는 작품은 후보가 되지 않음.
*/
async function resolveOttProviderIds(
    token,
    mediaType,
    selectedOtt
) {

    let requestedOttIds;


    if (
        !Array.isArray(
            selectedOtt
        ) ||
        selectedOtt.length === 0 ||
        selectedOtt.includes(
            "all"
        )
    ) {

        requestedOttIds =
            Object.keys(
                SUPPORTED_OTT
            );

    } else {

        requestedOttIds =
            selectedOtt;
    }


    const ids =
        await Promise.all(
            requestedOttIds
                .map(
                    ottId =>
                        resolveSingleOttProviderId(
                            token,
                            mediaType,
                            ottId
                        )
                )
        );


    return [
        ...new Set(
            ids
        ),
    ];
}


/* =========================================================
   14. 장르
========================================================= */

function getGenreGroups(
    mediaType
) {

    return mediaType === "movie"
        ? MOVIE_GENRE_GROUPS
        : SERIES_GENRE_GROUPS;
}


/*
   선택한 UI 장르를
   원본 TMDB 장르 ID 목록으로 넓게 변환
*/
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

        const group =
            groups[
            genreKey
            ] || [];


        group.forEach(
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


/*
   Discover에서 넓게 가져온 뒤
   UI 장르의 AND/OR 의미를 정확히 판정
*/
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


    /*
       시리즈 News / Talk 제외
    */
    if (
        mediaType === "series" &&
        SERIES_ALWAYS_EXCLUDED_GENRES
            .some(
                genreId =>
                    itemGenres.has(
                        genreId
                    )
            )
    ) {

        return false;
    }


    /*
       다큐멘터리를 직접 고르지 않았다면
       다른 장르에 걸린 다큐도 제외
    */
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
        selectedGenres
            .map(
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


    if (
        genreMode === "all"
    ) {

        return matches.every(
            Boolean
        );
    }


    return matches.some(
        Boolean
    );
}


/*
   카드에 표시할 UI 장르 key 계산
*/
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
   15. Discover 파라미터
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

        /*
           OTT는 모든 검색에서
           대한민국 기준
        */
        watch_region:
            CONFIG.watchRegion,

        /*
           지원 OTT는 구독형(flatrate)만
        */
        with_watch_monetization_types:
            "flatrate",

    };


    /* -----------------------------------------------------
       미래 작품 제외
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       연도
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       제작지역
    ----------------------------------------------------- */

    const regionCodes =
        await resolveRegionCodes(
            token,
            requestData.selectedRegions
        );


    if (
        regionCodes.length
    ) {

        params.with_origin_country =
            regionCodes.join(
                "|"
            );
    }


    /* -----------------------------------------------------
       OTT

       매우 중요:
       전체든 특정 OTT든 항상 provider ID 적용.

       pipe(|) = OR
    ----------------------------------------------------- */

    const providerIds =
        await resolveOttProviderIds(
            token,
            requestData.mediaType,
            requestData.selectedOtt
        );


    params.with_watch_providers =
        providerIds.join(
            "|"
        );


    /* -----------------------------------------------------
       장르

       Discover에서는 넓게 OR로 확보.
       정확한 AND/OR는 수집 후 직접 판정.
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       제외 장르
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       영화 러닝타임 2차 필터
    ----------------------------------------------------- */

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
   16. Discover 페이지 조회
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


    const remainingPages =
        await Promise.all(
            jobs
        );


    for (
        const pageData
        of remainingPages
    ) {

        results.push(
            ...(
                pageData.results ||
                []
            )
        );
    }


    return results;
}


/* =========================================================
   17. 후보 수집
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
   18. Bayesian 보정 점수
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


    /*
       prior = 후보 평균이 아니라
       현재 품질 하한
    */
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
   19. 작품 날짜
========================================================= */

function getItemDate(
    item,
    mediaType
) {

    if (
        mediaType === "movie"
    ) {

        return (
            item.release_date ||
            ""
        );
    }


    return (
        item.first_air_date ||
        ""
    );
}


/* =========================================================
   20. 제한 병렬 처리
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


    const workerCount =
        Math.min(
            limit,
            items.length
        );


    await Promise.all(
        Array.from(
            {
                length:
                    workerCount,
            },
            () =>
                worker()
        )
    );


    return results;
}


/* =========================================================
   21. 시리즈 2차 에피소드 필터
========================================================= */

function prioritizeSeriesDetailCandidates(
    candidates,
    quality
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

                    const scoreDifference =
                        calculateAdjustedScore(
                            b,
                            quality
                        ) -
                        calculateAdjustedScore(
                            a,
                            quality
                        );


                    if (
                        scoreDifference !==
                        0
                    ) {

                        return scoreDifference;
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
                        "series"
                    )
                        .localeCompare(
                            getItemDate(
                                a,
                                "series"
                            )
                        )
            );


    /*
       평가순 / 최신순을 번갈아 상세조회
    */
    const ordered =
        [];

    const seen =
        new Set();


    let index =
        0;


    while (
        ordered.length <
        CONFIG.seriesDetailLimit &&
        (
            index <
            rated.length ||
            index <
            recent.length
        )
    ) {

        const items = [

            rated[
            index
            ],

            recent[
            index
            ],

        ];


        for (
            const item
            of items
        ) {

            if (
                !item ||
                ordered.length >=
                CONFIG.seriesDetailLimit ||
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


async function filterSeriesByEpisodeCount(
    token,
    candidates,
    quality,
    maxEpisodes,
    language
) {

    const prioritized =
        prioritizeSeriesDetailCandidates(
            candidates,
            quality
        );


    const details =
        await mapWithConcurrency(
            prioritized,
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
                item._episodes > 0 &&
                item._episodes <=
                maxEpisodes
        );
}


/* =========================================================
   22. 품질 fallback
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


    for (
        const quality
        of QUALITY_LEVELS
    ) {

        let candidates =
            await collectCandidates(
                token,
                requestData,
                quality
            );


        /*
           시리즈 에피소드 수 제한은
           이때만 상세조회
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
                    quality,
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
   23. 추천 구성
========================================================= */

function buildRecommendations(
    candidates,
    quality,
    mediaType
) {

    const scored =
        candidates
            .map(
                item => ({

                    ...item,

                    _adjustedScore:
                        calculateAdjustedScore(
                            item,
                            quality
                        ),

                })
            );


    /* -----------------------------------------------------
       평가 Top 5
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       최신 작품 5
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       행운 후보풀
    ----------------------------------------------------- */

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
   24. 브라우저에 전달할 작품 형태
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

        /*
           시리즈 2차 검색 시에만 존재
        */
        episodes:
            item._episodes ||
            null,

        status:
            item._status ||
            null,

        /*
           카드용 OTT는 별도 API에서 채움
        */
        providers:
            null,

    };
}


/* =========================================================
   25. 작품별 OTT 정보
========================================================= */

function extractKoreanStreamingProviders(
    providerData
) {

    const korea =
        providerData
            ?.results
        ?.[
        CONFIG.watchRegion
        ];


    if (
        !korea
    ) {

        return [];
    }


    /*
       구독형 서비스만 표시
    */
    const providers =
        korea.flatrate ||
        [];


    return [
        ...new Set(
            providers
                .sort(
                    (
                        a,
                        b
                    ) =>
                        (
                            a.display_priority ??
                            999
                        ) -
                        (
                            b.display_priority ??
                            999
                        )
                )
                .map(
                    provider =>
                        provider.provider_name
                )
                .filter(
                    Boolean
                )
        ),
    ];
}


async function getItemProviders(
    token,
    item
) {

    const endpoint =
        item.type === "movie"
            ? `/movie/${item.id}/watch/providers`
            : `/tv/${item.id}/watch/providers`;


    const data =
        await tmdbGet(
            token,
            endpoint
        );


    return extractKoreanStreamingProviders(
        data
    );
}


/* =========================================================
   26. 상세 정보 국가 코드
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
   27. 입력 검증
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
        body.selectedYear ===
        null ||
        body.selectedYear ===
        undefined
    ) {

        throw new Error(
            "연도를 선택해야 합니다."
        );
    }
}


/* =========================================================
   28. 추천 요청
========================================================= */

async function handleRecommend(
    token,
    body
) {

    validateRecommendRequest(
        body
    );


    const requestData = {

        mediaType:
            body.mediaType,

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

        selectedGenres:
            body.selectedGenres,

        genreMode:
            body.genreMode === "all"
                ? "all"
                : "any",

        selectedRegions:
            body.selectedRegions,

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
            requestData.mediaType
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
                            requestData.mediaType
                        )
                ),

        luckyPool:
            recommendations.luckyPool
                .map(
                    item =>
                        toPublicItem(
                            item,
                            requestData.mediaType
                        )
                ),

        recent:
            recommendations.recent
                .map(
                    item =>
                        toPublicItem(
                            item,
                            requestData.mediaType
                        )
                ),

    };
}


/* =========================================================
   29. 카드용 OTT 조회
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
            async item => ({

                key:
                    `${item.type}:${item.id}`,

                providers:
                    await getItemProviders(
                        token,
                        item
                    ),

            })
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
   30. 상세정보
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

        /*
           요청한 언어의 overview가 없으면
           빈 문자열 그대로 반환.

           다른 언어로 강제 fallback하지 않음.
        */
        overview:
            detail.overview ||
            "",

        providers:
            extractKoreanStreamingProviders(
                providerData
            ),

    };
}


/* =========================================================
   31. Cloudflare Pages Function
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
   32. GET
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