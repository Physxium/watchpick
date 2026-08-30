/* =========================================================
   볼만한픽 / Pick to Watch
   Cloudflare Pages Function

   URL:
   /api/recommend

   Cloudflare Secret:
   TMDB_TOKEN

   자주 수정할 설정값은 파일 위쪽에 모아두었습니다.
========================================================= */


/* =========================================================
   1. 기본 설정
========================================================= */

const TMDB_BASE_URL =
    "https://api.themoviedb.org/3";


const CONFIG = {

    watchRegion: "KR",

    /* 평가 Top */
    topRatedCount: 5,

    /* 최신 작품 */
    recentCount: 5,

    /* 행운 후보풀 */
    luckyPoolSize: 20,

    /* 최소 추천 목표 */
    minimumRecommendationCount: 13,

    /* Bayesian 보정 */
    bayesianM: 200,

    /*
       첫 검색에서 가져올 최대 페이지 수.

       평점순 + 최신순 각각 이만큼 조회합니다.
    */
    discoverPages: 3,

    /*
       시리즈 에피소드 수 필터를 사용했을 때만
       후보를 조금 더 넓게 찾습니다.
    */
    seriesRefineDiscoverPages: 4,

    /*
       시리즈 에피소드 수 확인을 위해
       상세조회할 작품의 최대 개수.
    */
    seriesDetailLimit: 40,

    /*
       TMDB 상세/OTT 조회 동시 요청 개수.
       너무 공격적으로 병렬 요청하지 않도록 제한합니다.
    */
    parallelRequestLimit: 8,

};


/* =========================================================
   2. 품질 기준
   점수 정책을 바꾸고 싶으면 여기만 수정
========================================================= */

const QUALITY_LEVELS = [

    {
        id: "base",

        minVoteCount: 100,
        minRating: 6.5,
    },

    {
        id: "fallback",

        minVoteCount: 50,
        minRating: 6.0,
    },

];


/* =========================================================
   3. OTT 이름
   프론트의 OTT id와 반드시 맞춰주세요.

   TMDB provider ID를 하드코딩하지 않고
   현재 한국 provider 목록에서 이름으로 찾습니다.
========================================================= */

const OTT_ALIASES = {

    netflix: [
        "Netflix",
    ],

    disney: [
        "Disney Plus",
        "Disney+",
    ],

    wavve: [
        "wavve",
        "Wavve",
    ],

    tving: [
        "TVING",
    ],

    watcha: [
        "Watcha",
        "WATCHA",
    ],

};


/* =========================================================
   4. 영화 장르 매핑

   key는 app.js의 MOVIE_GENRES id와 맞춰야 합니다.

   UI 장르는 단순하게 유지하고,
   내부에서는 TMDB 장르를 넓게 묶습니다.
========================================================= */

const MOVIE_GENRE_GROUPS = {

    action: [
        28,     // Action
        12,     // Adventure
        10752,  // War
        37,     // Western
    ],

    comedy: [
        35,     // Comedy
    ],

    crime: [
        80,     // Crime
    ],

    thriller: [
        53,     // Thriller
    ],

    mystery: [
        9648,   // Mystery
    ],

    sf_fantasy: [
        878,    // Science Fiction
        14,     // Fantasy
    ],

    romance: [
        10749,  // Romance
    ],

    drama: [
        18,     // Drama
        36,     // History
        10752,  // War
        37,     // Western
    ],

    horror: [
        27,     // Horror
    ],

    animation: [
        16,     // Animation
        10751,  // Family
    ],

    documentary: [
        99,     // Documentary
    ],

};


/* =========================================================
   5. 시리즈 장르 매핑

   News / Talk는 추천 대상에서 제외합니다.
========================================================= */

const SERIES_GENRE_GROUPS = {

    action_adventure: [
        10759,  // Action & Adventure
        10768,  // War & Politics
        37,     // Western
    ],

    comedy: [
        35,     // Comedy
    ],

    crime: [
        80,     // Crime
    ],

    mystery: [
        9648,   // Mystery
    ],

    sf_fantasy: [
        10765,  // Sci-Fi & Fantasy
    ],

    drama: [
        18,     // Drama
        10766,  // Soap
        10768,  // War & Politics
    ],

    animation: [
        16,     // Animation
    ],

    documentary: [
        99,     // Documentary
    ],

    reality: [
        10764,  // Reality
    ],

    family_kids: [
        10751,  // Family
        10762,  // Kids
    ],

};


const SERIES_ALWAYS_EXCLUDED_GENRES = [

    10763,  // News
    10767,  // Talk

];


/* =========================================================
   6. 제작지역 매핑

   "그 외"는 TMDB 국가 목록을 받아
   아래 네 지역에 포함되지 않은 국가를 자동 계산합니다.
========================================================= */

const REGION_GROUPS = {

    korea: [
        "KR",
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

    /*
       한국은 별도이므로 제외.
       일본은 기타 아시아에 포함.
    */
    other_asia: [

        "JP",

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
   Cloudflare 인스턴스가 살아 있는 동안만 유지됩니다.

   DB나 KV를 사용하는 캐시는 아닙니다.
========================================================= */

let countryCodesCache =
    null;


const providerIndexCache = {
    movie: null,
    series: null,
};


/* =========================================================
   8. 공통 응답
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


    if (!response.ok) {

        const text =
            await response.text();


        throw new Error(
            `TMDB ${response.status}: ${text}`
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

    return language === "ko"
        ? "ko-KR"
        : "en-US";
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

    if (countryCodesCache) {
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


    const normalRegionCodes =
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
            regionId !==
            "other"
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
                    !normalRegionCodes.has(
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
   13. OTT Provider ID 자동 확인
========================================================= */

function normalizeProviderName(
    name
) {

    return String(
        name || ""
    )
        .trim()
        .toLowerCase();
}


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

        index.set(
            normalizeProviderName(
                provider.provider_name
            ),
            provider.provider_id
        );
    }


    providerIndexCache[
        mediaType
    ] =
        index;


    return index;
}


async function resolveOttProviderIds(
    token,
    mediaType,
    selectedOtt
) {

    if (
        !selectedOtt.length ||
        selectedOtt.includes(
            "all"
        )
    ) {

        return [];
    }


    const providerIndex =
        await getProviderIndex(
            token,
            mediaType
        );


    const ids =
        [];


    for (
        const ottId
        of selectedOtt
    ) {

        const aliases =
            OTT_ALIASES[
            ottId
            ] || [];


        let providerId =
            null;


        for (
            const alias
            of aliases
        ) {

            const found =
                providerIndex.get(
                    normalizeProviderName(
                        alias
                    )
                );


            if (found) {

                providerId =
                    found;

                break;
            }
        }


        if (!providerId) {

            throw new Error(
                `TMDB에서 OTT provider를 찾지 못했습니다: ${ottId}`
            );
        }


        ids.push(
            providerId
        );
    }


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


    selectedGenres
        .forEach(
            key => {

                const group =
                    groups[
                    key
                    ] || [];


                group.forEach(
                    id =>
                        ids.add(
                            id
                        )
                );
            }
        );


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


    const itemGenreIds =
        new Set(
            item.genre_ids || []
        );


    /*
       TV News / Talk는 항상 제외
    */
    if (
        mediaType === "series" &&
        SERIES_ALWAYS_EXCLUDED_GENRES.some(
            id =>
                itemGenreIds.has(
                    id
                )
        )
    ) {

        return false;
    }


    /*
       Documentary를 직접 선택하지 않았다면
       다큐멘터리 작품은 다른 장르 검색에서도 제외.
    */
    if (
        !selectedGenres.includes(
            "documentary"
        ) &&
        itemGenreIds.has(
            99
        )
    ) {

        return false;
    }


    const matches =
        selectedGenres
            .map(
                key => {

                    const ids =
                        groups[
                        key
                        ] || [];


                    return ids.some(
                        id =>
                            itemGenreIds.has(
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


function getItemGenreKeys(
    item,
    mediaType
) {

    const groups =
        getGenreGroups(
            mediaType
        );


    const itemGenreIds =
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
                ids,
            ]) =>
                ids.some(
                    id =>
                        itemGenreIds.has(
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

    const {
        mediaType,
        language,
        selectedOtt,
        selectedGenres,
        selectedRegions,
        selectedYear,
        maxRuntime,
    } =
        requestData;


    const today =
        new Date();


    const params = {

        language:
            getTmdbLanguage(
                language
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
    };


    /*
       미래 작품 제외
    */
    if (
        mediaType === "movie"
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


    /*
       최근 N년
    */
    if (
        selectedYear !==
        "all"
    ) {

        const years =
            Number(
                selectedYear
            );


        const fromDate =
            subtractYears(
                today,
                years
            );


        if (
            mediaType === "movie"
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


    /*
       제작지역
    */
    const countryCodes =
        await resolveRegionCodes(
            token,
            selectedRegions
        );


    if (
        countryCodes.length
    ) {

        params.with_origin_country =
            countryCodes.join(
                "|"
            );
    }


    /*
       OTT

       여러 OTT = OR
    */
    const providerIds =
        await resolveOttProviderIds(
            token,
            mediaType,
            selectedOtt
        );


    if (
        providerIds.length
    ) {

        params.with_watch_providers =
            providerIds.join(
                "|"
            );


        /*
           렌트/구매가 아닌
           구독형 스트리밍 기준
        */
        params.with_watch_monetization_types =
            "flatrate";
    }


    /*
       UI 장르 그룹에 포함되는 원본 TMDB 장르들을
       Discover 단계에서는 넓게 OR로 가져옵니다.

       "모두 포함"의 정확한 판정은
       가져온 뒤 우리가 직접 합니다.
    */
    const rawGenreIds =
        getSelectedRawGenreIds(
            mediaType,
            selectedGenres
        );


    if (
        rawGenreIds.length
    ) {

        params.with_genres =
            rawGenreIds.join(
                "|"
            );
    }


    /*
       Documentary 미선택 시 제외
    */
    const excludedGenres =
        [];


    if (
        !selectedGenres.includes(
            "documentary"
        )
    ) {

        excludedGenres.push(
            99
        );
    }


    if (
        mediaType === "series"
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


    /*
       영화 2차 러닝타임 필터는
       Discover에서 바로 처리 가능
    */
    if (
        mediaType === "movie" &&
        maxRuntime
    ) {

        params[
            "with_runtime.lte"
        ] =
            maxRuntime;
    }


    return params;
}


/* =========================================================
   16. Discover 여러 페이지 조회
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


    const first =
        await tmdbGet(
            token,
            endpoint,
            firstParams
        );


    const results =
        [
            ...(
                first.results ||
                []
            ),
        ];


    const totalPages =
        Math.min(
            Number(
                first.total_pages ||
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


    const pages =
        await Promise.all(
            jobs
        );


    pages.forEach(
        data => {

            results.push(
                ...(
                    data.results ||
                    []
                )
            );
        }
    );


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


    const scoreSort =
        "vote_average.desc";


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
                scoreSort,
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


    const byId =
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


                byId.set(
                    item.id,
                    item
                );
            }
        );


    return [
        ...byId.values(),
    ];
}


/* =========================================================
   18. Bayesian 보정점수
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
       후보 평균이 아니라
       현재 품질 하한선을 prior로 사용.
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
   19. 날짜
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
   20. 제한 병렬 처리
========================================================= */

async function mapWithConcurrency(
    items,
    limit,
    asyncMapper
) {

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
                await asyncMapper(
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


    const workers =
        Array.from(
            {
                length:
                    workerCount,
            },
            () =>
                worker()
        );


    await Promise.all(
        workers
    );


    return results;
}


/* =========================================================
   21. 시리즈 분량 필터용 상세조회
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
       평가순과 최신순을 번갈아 넣어
       어느 한쪽 후보만 상세조회하지 않도록 합니다.
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

        const pair = [
            rated[
            index
            ],
            recent[
            index
            ],
        ];


        pair
            .filter(
                Boolean
            )
            .forEach(
                item => {

                    if (
                        ordered.length >=
                        CONFIG.seriesDetailLimit
                    ) {

                        return;
                    }


                    if (
                        seen.has(
                            item.id
                        )
                    ) {

                        return;
                    }


                    seen.add(
                        item.id
                    );


                    ordered.push(
                        item
                    );
                }
            );


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


    const tmdbLanguage =
        getTmdbLanguage(
            language
        );


    const detailed =
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
                                tmdbLanguage,
                        }
                    );


                return {
                    ...item,

                    _episodes:
                        detail
                            .number_of_episodes ||
                        0,

                    _status:
                        detail.status ||
                        "",
                };
            }
        );


    return detailed
        .filter(
            item =>
                item._episodes > 0 &&
                item._episodes <=
                maxEpisodes
        );
}


/* =========================================================
   22. 품질 단계 선택
========================================================= */

async function chooseCandidatePool(
    token,
    requestData
) {

    let lastCandidates =
        [];


    let lastQuality =
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
           시리즈 분량 필터를 사용한 경우에만
           총 에피소드 수 상세조회.
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


        lastCandidates =
            candidates;

        lastQuality =
            quality;


        if (
            candidates.length >=
            CONFIG.minimumRecommendationCount
        ) {

            return {
                candidates,
                quality,
            };
        }
    }


    return {
        candidates:
            lastCandidates,

        quality:
            lastQuality,
    };
}


/* =========================================================
   23. 추천 분리
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


    /*
       평가 Top 5
    */
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


    /*
       최신 작품 5
    */
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


    recent
        .forEach(
            item =>
                usedIds.add(
                    item.id
                )
        );


    /*
       행운 후보풀

       Top / 최신에서 사용하지 않은 후보 중
       보정점수 상위 20개.
    */
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
                ) =>
                    b._adjustedScore -
                    a._adjustedScore
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
   24. 클라이언트에 보낼 작품 형태
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
           시리즈 2차 분량 검색을 했을 때만 존재.
        */
        episodes:
            item._episodes ||
            null,

        status:
            item._status ||
            null,

        /*
           OTT는 프론트에서 보이는 카드에 대해서만
           별도 요청하여 채웁니다.
        */
        providers:
            null,
    };
}


/* =========================================================
   25. OTT 정보
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


    if (!korea) {
        return [];
    }


    /*
       현재는 구독형 스트리밍(flate rate)만 사용.
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
                            a.display_priority ||
                            999
                        ) -
                        (
                            b.display_priority ||
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
   26. 상세정보
========================================================= */

function countryCodesFromDetail(
    detail
) {

    const productionCodes =
        (
            detail
                .production_countries ||
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
        productionCodes.length
    ) {

        return [
            ...new Set(
                productionCodes
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
            recommendations
                .topRated
                .map(
                    item =>
                        toPublicItem(
                            item,
                            requestData.mediaType
                        )
                ),

        luckyPool:
            recommendations
                .luckyPool
                .map(
                    item =>
                        toPublicItem(
                            item,
                            requestData.mediaType
                        )
                ),

        recent:
            recommendations
                .recent
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
   29. 카드용 OTT 정보 요청
========================================================= */

async function handleProviders(
    token,
    body
) {

    const items =
        Array.isArray(
            body.items
        )
            ? body.items
            : [];


    /*
       한 번에 너무 많은 임의 ID를 보내지 못하도록 제한.
       현재 UI에서는 최대 13개 정도 요청합니다.
    */
    const safeItems =
        items
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

                const providers =
                    await getItemProviders(
                        token,
                        item
                    );


                return {
                    key:
                        `${item.type}:${item.id}`,

                    providers,
                };
            }
        );


    const providers =
        {};


    results
        .forEach(
            item => {

                providers[
                    item.key
                ] =
                    item.providers;
            }
        );


    return {
        providers,
    };
}


/* =========================================================
   30. 작품 상세 요청
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


    const tmdbLanguage =
        getTmdbLanguage(
            language
        );


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
                        tmdbLanguage,
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
            countryCodesFromDetail(
                detail
            ),

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


        if (!token) {

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
            action ===
            "recommend"
        ) {

            return jsonResponse(
                await handleRecommend(
                    token,
                    body
                )
            );
        }


        if (
            action ===
            "providers"
        ) {

            return jsonResponse(
                await handleProviders(
                    token,
                    body
                )
            );
        }


        if (
            action ===
            "detail"
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


    } catch (error) {

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
   GET 접근 방지
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