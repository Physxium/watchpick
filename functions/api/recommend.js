/* =========================================================
   볼만한픽 / Pick to Watch
   Cloudflare Pages Function

   Cloudflare Secret:
   TMDB_TOKEN
========================================================= */


const TMDB_BASE_URL =
    "https://api.themoviedb.org/3";


/* =========================================================
   1. 설정
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

    parallelRequestLimit:
        8,

    verifiedTargetCount:
        30,

    maxProviderChecks:
        80,

    /*
       브라우저에서 2차 필터용으로 다시 보내는
       최대 후보 수.
    */
    refineCandidateLimit:
        30,

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
========================================================= */

const OTT_PROVIDERS = {

    netflix: {
        ids: [8],
        names: ["Netflix"],
    },

    disney: {
        ids: [337],
        names: [
            "Disney Plus",
            "Disney+",
        ],
    },

    prime: {
        ids: [119],
        names: [
            "Amazon Prime Video",
            "Prime Video",
        ],
    },

    apple: {
        ids: [350],
        names: [
            "Apple TV Plus",
            "Apple TV+",
        ],
    },

    wavve: {
        ids: [356],
        names: [
            "wavve",
            "Wavve",
        ],
    },

    /*
       현재 정상 작동 중인 TVING은
       한국 provider 목록에서 이름으로 탐색.
    */
    tving: {
        ids: [],
        names: [
            "TVING",
            "Tving",
        ],
    },

    watcha: {
        ids: [97],
        names: [
            "Watcha",
            "WATCHA",
        ],
    },

};


/* =========================================================
   4. 장르
========================================================= */

const MOVIE_GENRE_GROUPS = {

    action: [
        28,
        12,
        10752,
        37,
    ],

    comedy: [35],

    crime: [80],

    thriller: [53],

    mystery: [9648],

    sf_fantasy: [
        878,
        14,
    ],

    romance: [10749],

    drama: [
        18,
        36,
        10752,
        37,
    ],

    horror: [27],

    animation: [
        16,
        10751,
    ],

    documentary: [99],

};


const SERIES_GENRE_GROUPS = {

    action_adventure: [
        10759,
        10768,
        37,
    ],

    comedy: [35],

    crime: [80],

    mystery: [9648],

    sf_fantasy: [10765],

    drama: [
        18,
        10766,
        10768,
    ],

    animation: [16],

    documentary: [99],

    reality: [10764],

    family_kids: [
        10751,
        10762,
    ],

};


const SERIES_ALWAYS_EXCLUDED_GENRES = [

    10763,
    10767,

];


/* =========================================================
   5. 지역
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
   6. 캐시
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
   7. 공통
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
        of Object.entries(params)
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
            String(value)
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
            `TMDB ${response.status} | ${url.pathname}?${url.searchParams.toString()} | ${errorText}`
        );
    }


    return response.json();
}


function getTmdbLanguage(
    language
) {

    return language === "en"
        ? "en-US"
        : "ko-KR";
}


function formatDate(date) {

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
        new Date(date);


    result.setFullYear(
        result.getFullYear() -
        years
    );


    return result;
}


/* =========================================================
   8. 지역
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
            .filter(Boolean);


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
                    result.add(code)
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
                    result.add(code)
            );
    }


    return [
        ...result,
    ];
}


/* =========================================================
   9. Provider
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
                Number(
                    provider.provider_id
                )
        )
        .filter(
            Number.isInteger
        );
}


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


    return {

        requestedKeys,

        ids:
            [
                ...new Set(
                    arrays.flat()
                ),
            ],

    };
}


function extractKoreanFlatRateProviders(
    data
) {

    const providers =
        data
            ?.results
            ?.[CONFIG.watchRegion]
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
   10. 장르
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
                ids.add(id)
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
            item.genre_ids ||
            []
        );


    if (
        mediaType === "series" &&
        SERIES_ALWAYS_EXCLUDED_GENRES
            .some(
                id =>
                    itemGenres.has(id)
            )
    ) {

        return false;
    }


    if (
        !selectedGenres.includes(
            "documentary"
        ) &&
        itemGenres.has(99)
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
                        itemGenres.has(id)
                );
            }
        );


    return genreMode === "all"
        ? matches.every(Boolean)
        : matches.some(Boolean);
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
            item.genre_ids ||
            []
        );


    return Object
        .entries(groups)
        .filter(
            ([
                ,
                rawIds,
            ]) =>
                rawIds.some(
                    id =>
                        itemGenres.has(id)
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
   11. Discover
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


    if (
        requestData.mediaType ===
        "movie"
    ) {

        params[
            "primary_release_date.lte"
        ] =
            formatDate(today);

    } else {

        params[
            "first_air_date.lte"
        ] =
            formatDate(today);
    }


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


    if (
        requestData.regionCodes.length
    ) {

        params.with_origin_country =
            requestData.regionCodes
                .join("|");
    }


    params.with_watch_providers =
        requestData.providerIds.length
            ? requestData.providerIds
                .join("|")
            : "-1";


    const rawGenreIds =
        getSelectedRawGenreIds(
            requestData.mediaType,
            requestData.selectedGenres
        );


    if (
        rawGenreIds.length
    ) {

        params.with_genres =
            rawGenreIds.join("|");
    }


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
                .join("|");
    }


    return params;
}


async function fetchDiscoverPages(
    token,
    requestData,
    quality,
    sortBy
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
            CONFIG.discoverPages
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


async function collectCandidates(
    token,
    requestData,
    quality
) {

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
                "vote_average.desc"
            ),

            fetchDiscoverPages(
                token,
                requestData,
                quality,
                recentSort
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
   12. 점수 / 날짜
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


function calculatePublicAdjustedScore(
    item,
    quality
) {

    const rating =
        Number(
            item.rating ||
            0
        );


    const votes =
        Number(
            item.voteCount ||
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
   13. Provider 검증
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
            index < rated.length ||
            index < recent.length
        )
    ) {

        const pair = [

            rated[index],
            recent[index],

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


async function verifyCandidatesByProviders(
    token,
    candidates,
    requestData,
    quality,
    providerCache
) {

    const selectedIds =
        new Set(
            requestData.providerIds
        );


    if (
        selectedIds.size ===
        0
    ) {

        return [];
    }


    const ordered =
        prioritizeCandidates(
            candidates,
            quality,
            requestData.mediaType
        );


    const maxChecks =
        Math.min(
            CONFIG.maxProviderChecks,
            ordered.length
        );


    const verified =
        [];


    let checked =
        0;


    while (
        checked <
        maxChecks &&
        verified.length <
        CONFIG.verifiedTargetCount
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

            if (item) {

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
   14. 최초 후보풀
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


    const providerCache =
        new Map();


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


        candidates =
            await verifyCandidatesByProviders(
                token,
                candidates,
                requestData,
                quality,
                providerCache
            );


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
   15. 최초 추천 구성
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
   16. Public 추천 구성
   - 2차 필터에서 사용
========================================================= */

function buildPublicRecommendations(
    candidates,
    quality
) {

    const scored =
        candidates.map(
            item => ({

                ...item,

                _adjustedScore:
                    calculatePublicAdjustedScore(
                        item,
                        quality
                    ),

            })
        );


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
                        b.voteCount ||
                        0
                    ) -
                        (
                            a.voteCount ||
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
                    (
                        b.releaseDate ||
                        ""
                    )
                        .localeCompare(
                            a.releaseDate ||
                            ""
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
                        b.voteCount ||
                        0
                    ) -
                        (
                            a.voteCount ||
                            0
                        );
                }
            )
            .slice(
                0,
                CONFIG.luckyPoolSize
            );


    /*
       내부 계산값을 클라이언트에 노출하지 않는다.
    */

    const clean =
        item => {

            const {
                _adjustedScore,
                ...publicItem
            } =
                item;


            return publicItem;
        };


    return {

        topRated:
            topRated.map(clean),

        recent:
            recent.map(clean),

        luckyPool:
            luckyPool.map(clean),

    };
}


/* =========================================================
   17. 최초 Public item
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

        runtime:
            null,

        episodes:
            null,

        status:
            null,

        providers:
            Array.isArray(
                item._providers
            )
                ? item._providers
                : [],

    };
}


/* =========================================================
   18. 병렬 처리
========================================================= */

async function mapWithConcurrency(
    items,
    limit,
    mapper
) {

    if (
        items.length ===
        0
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


            results[index] =
                await mapper(
                    items[index],
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
   19. 2차 필터용 후보 정리
========================================================= */

function sanitizeRefineCandidates(
    candidates,
    mediaType
) {

    if (
        !Array.isArray(
            candidates
        )
    ) {

        return [];
    }


    const map =
        new Map();


    for (
        const input
        of candidates
            .slice(
                0,
                CONFIG.refineCandidateLimit
            )
    ) {

        const id =
            Number(
                input?.id
            );


        if (
            !Number.isInteger(id) ||
            input?.type !== mediaType
        ) {
            continue;
        }


        const item = {

            id,

            type:
                mediaType,

            title:
                String(
                    input.title ||
                    ""
                ),

            posterPath:
                input.posterPath ||
                null,

            rating:
                Number(
                    input.rating ||
                    0
                ),

            voteCount:
                Number(
                    input.voteCount ||
                    0
                ),

            releaseDate:
                String(
                    input.releaseDate ||
                    ""
                ),

            year:
                String(
                    input.year ||
                    ""
                ),

            genreKeys:
                Array.isArray(
                    input.genreKeys
                )
                    ? input.genreKeys
                    : [],

            providers:
                Array.isArray(
                    input.providers
                )
                    ? input.providers
                    : [],

            runtime:
                null,

            episodes:
                null,

            status:
                null,

        };


        map.set(
            `${mediaType}:${id}`,
            item
        );
    }


    return [
        ...map.values(),
    ];
}


function normalizeQuality(
    quality
) {

    const minRating =
        Number(
            quality?.minRating
        );


    const minVoteCount =
        Number(
            quality?.minVoteCount
        );


    if (
        Number.isFinite(
            minRating
        ) &&
        Number.isFinite(
            minVoteCount
        )
    ) {

        return {

            id:
                quality?.level ||
                "base",

            minRating,

            minVoteCount,

        };
    }


    return {
        ...QUALITY_LEVELS[0],
    };
}


/* =========================================================
   20. 2차 상세조회

   중요:
   - Discover 없음
   - watch/providers 없음
   - 기존 최대 30개 후보의 detail만 조회
========================================================= */

async function enrichRefineCandidates(
    token,
    candidates,
    mediaType,
    language
) {

    return mapWithConcurrency(
        candidates,
        CONFIG.parallelRequestLimit,
        async item => {

            const endpoint =
                mediaType === "movie"
                    ? `/movie/${item.id}`
                    : `/tv/${item.id}`;


            try {

                const detail =
                    await tmdbGet(
                        token,
                        endpoint,
                        {
                            language:
                                getTmdbLanguage(
                                    language
                                ),
                        }
                    );


                if (
                    mediaType ===
                    "movie"
                ) {

                    return {

                        ...item,

                        runtime:
                            Number(
                                detail.runtime ||
                                0
                            ) ||
                            null,

                    };
                }


                return {

                    ...item,

                    episodes:
                        Number(
                            detail.number_of_episodes ||
                            0
                        ) ||
                        null,

                    status:
                        detail.status ||
                        null,

                };


            } catch (
            error
            ) {

                /*
                   특정 작품 상세조회 하나가 실패해도
                   2차 필터 전체를 실패시키지 않는다.
                */

                console.error(
                    `Refine detail failed: ${mediaType}:${item.id}`,
                    error
                );


                return null;
            }
        }
    );
}


/* =========================================================
   21. 2차 필터 요청
========================================================= */

async function handleRefine(
    token,
    body
) {

    const mediaType =
        body.mediaType;


    if (
        ![
            "movie",
            "series",
        ]
            .includes(
                mediaType
            )
    ) {

        throw new Error(
            "mediaType이 올바르지 않습니다."
        );
    }


    const language =
        body.language === "en"
            ? "en"
            : "ko";


    const candidates =
        sanitizeRefineCandidates(
            body.candidates,
            mediaType
        );


    const quality =
        normalizeQuality(
            body.quality
        );


    if (
        candidates.length ===
        0
    ) {

        return {

            quality,

            candidateCount:
                0,

            notice:
                language === "ko"
                    ? "현재 추천 후보가 없습니다."
                    : "There are no recommendation candidates to refine.",

            topRated:
                [],

            luckyPool:
                [],

            recent:
                [],

        };
    }


    const maxRuntime =
        Number(
            body.maxRuntime
        );


    const maxEpisodes =
        Number(
            body.maxEpisodes
        );


    const detailed =
        (
            await enrichRefineCandidates(
                token,
                candidates,
                mediaType,
                language
            )
        )
            .filter(Boolean);


    let filtered;


    if (
        mediaType === "movie"
    ) {

        if (
            !Number.isFinite(
                maxRuntime
            ) ||
            maxRuntime <= 0
        ) {

            filtered =
                detailed;

        } else {

            filtered =
                detailed
                    .filter(
                        item =>
                            item.runtime &&
                            item.runtime <=
                            maxRuntime
                    );
        }

    } else {

        if (
            !Number.isFinite(
                maxEpisodes
            ) ||
            maxEpisodes <= 0
        ) {

            filtered =
                detailed;

        } else {

            filtered =
                detailed
                    .filter(
                        item =>
                            item.episodes &&
                            item.episodes <=
                            maxEpisodes
                    );
        }
    }


    const recommendations =
        buildPublicRecommendations(
            filtered,
            quality
        );


    let notice =
        null;


    if (
        filtered.length <
        CONFIG.minimumRecommendationCount
    ) {

        notice =
            language === "ko"
                ? (
                    `현재 추천 후보 중 조건에 맞는 작품이 ` +
                    `${filtered.length}개예요.`
                )
                : (
                    `${filtered.length} titles in your current recommendations match this length.`
                );
    }


    return {

        quality,

        candidateCount:
            filtered.length,

        notice,

        topRated:
            recommendations.topRated,

        luckyPool:
            recommendations.luckyPool,

        recent:
            recommendations.recent,

    };
}


/* =========================================================
   22. 최초 추천 입력 검증
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
   23. 최초 추천
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

        providerIds:
            ottInfo.ids,

        selectedGenres:
            body.selectedGenres,

        genreMode:
            body.genreMode === "all"
                ? "all"
                : "any",

        regionCodes,

        selectedYear:
            String(
                body.selectedYear
            ),

    };


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
   24. 상세 정보
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
            .filter(Boolean);


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
        !Number.isInteger(id)
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

        overview:
            detail.overview ||
            "",

        providers:
            extractKoreanFlatRateProviders(
                providerData
            )
                .map(
                    provider =>
                        provider.name
                ),

    };
}


/* =========================================================
   25. 기존 frontend 호환용 providers
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


                return {

                    key:
                        `${item.type}:${item.id}`,

                    providers:
                        extractKoreanFlatRateProviders(
                            data
                        )
                            .map(
                                provider =>
                                    provider.name
                            ),

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
   26. Cloudflare Pages Function
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
            action === "refine"
        ) {

            return jsonResponse(
                await handleRefine(
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
   27. GET
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