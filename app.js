/* =========================================================
   볼만한픽 / Pick to Watch
========================================================= */


/* =========================================================
   1. 기본 설정
========================================================= */

const CONFIG = {

    apiUrl:
        "/api/recommend",

    imageBaseUrl:
        "https://image.tmdb.org/t/p/w342",

    defaultMediaType:
        "movie",

    defaultOtt:
        "all",

    luckyCount:
        3,

};


/* =========================================================
   2. 문구
========================================================= */

const TEXT = {

    ko: {

        pageTitle:
            "볼만한픽 | Pick to Watch",

        metaDescription:
            "OTT, 장르, 제작 지역과 연도를 골라 지금 볼 영화와 시리즈를 빠르게 추천받아 보세요. 평가가 좋은 작품, 행운의 발견, 최신 작품을 한눈에 확인할 수 있습니다.",

        ogDescription:
            "OTT, 장르, 제작 지역과 연도를 골라 지금 볼 영화와 시리즈를 빠르게 추천받아 보세요.",


        languageButton:
            "EN",

        siteTitle:
            "볼만한픽",

        siteSubtitle:
            "오늘 볼 작품을 빠르게 골라보세요.",


        mediaTypeTitle:
            "뭘 볼까요?",

        ottTitle:
            "어디서 볼까요?",

        ottHint:
            "여러 개를 선택할 수 있어요.",

        genreTitle:
            "어떤 장르가 좋나요?",

        genreHint:
            "여러 개를 선택할 수 있어요.",

        genreModeLabel:
            "여러 장르를 선택했어요",

        genreAny:
            "하나라도 포함",

        genreAll:
            "모두 포함",

        regionTitle:
            "어디서 만든 작품을 볼까요?",

        regionHint:
            "여러 지역을 선택할 수 있어요.",

        yearTitle:
            "연도도 골라볼까요?",

        pick:
            "PICK",


        resultsTitle:
            "오늘의 픽",

        clickHint:
            "작품 카드를 누르면 상세 정보를 확인할 수 있어요.",

        topRatedTitle:
            "평가 Top 5",

        topRatedDescription:
            "평가가 좋은 작품부터 골랐어요.",

        luckyTitle:
            "행운의 발견",

        luckyDescription:
            "평가 Top 5에는 들지 못했지만 충분히 좋은 작품 중 골랐어요.",

        recentTitle:
            "최신 작품",

        recentDescription:
            "최근에 나온 작품부터 보여드려요.",

        reroll:
            "재추첨",


        refineTitle:
            "시간이 부족하다면 결과를 더 좁혀보세요.",

        refineDescription:
            "현재 추천 후보 안에서 분량 기준으로 다시 골라드려요.",

        refinePick:
            "다시 PICK",


        sourceTmdb:
            "영화·시리즈 정보 및 이미지는 TMDB를 기반으로 제공합니다.",

        sourceOtt:
            "OTT 제공 정보는 JustWatch를 기반으로 하며 대한민국 기준입니다.",

        privacy:
            "개인정보처리방침 / Privacy Policy",

        support:
            "유용했다면 ☕ 커피 후원",


        detail:
            "상세 보기 ›",

        overview:
            "작품 소개",

        productionCountry:
            "제작국",

        availableOn:
            "볼 수 있는 OTT",

        runtime:
            "재생시간",

        episodeCount:
            "총 에피소드",

        seasonCount:
            "시즌",

        movie:
            "영화",

        series:
            "시리즈",

        completed:
            "완결",

        ongoing:
            "방영 중",

        canceled:
            "종료",

        planned:
            "예정",

        minutes:
            "분",

        episodes:
            "화",


        loadingTop:
            "평가가 좋은 작품을 찾는 중...",

        loadingLucky:
            "좋은 후보를 고르는 중...",

        loadingRecent:
            "최근 작품을 찾는 중...",

        movieRefineLoading:
            "작품의 재생시간을 확인하고 있어요...",

        seriesRefineLoading:
            "시리즈의 에피소드 수를 확인하고 있어요...",

        noProvider:
            "OTT 정보 없음",

        detailLoading:
            "상세 정보를 불러오는 중...",

        noResults:
            "조건에 맞는 작품이 없습니다.",

        error:
            "작품 정보를 불러오지 못했습니다.",


        ratingsPrefix:
            "평가",

        ratingsSuffix:
            "명",

    },


    en: {

        pageTitle:
            "Pick to Watch | 볼만한픽",

        metaDescription:
            "Choose a streaming service, genre, production region and release period to quickly discover movies and series worth watching.",

        ogDescription:
            "Quickly discover movies and series based on your streaming services and preferences.",


        languageButton:
            "한국어",

        siteTitle:
            "Pick to Watch",

        siteSubtitle:
            "Find something worth watching, quickly.",


        mediaTypeTitle:
            "What do you want to watch?",

        ottTitle:
            "Where do you want to watch?",

        ottHint:
            "You can select multiple services.",

        genreTitle:
            "What genres are you in the mood for?",

        genreHint:
            "You can select multiple genres.",

        genreModeLabel:
            "Multiple genres selected",

        genreAny:
            "Match any",

        genreAll:
            "Match all",

        regionTitle:
            "Where should it be made?",

        regionHint:
            "You can select multiple regions.",

        yearTitle:
            "How recent?",

        pick:
            "PICK",


        resultsTitle:
            "Today's Picks",

        clickHint:
            "Tap a title to view more details.",

        topRatedTitle:
            "Top Rated",

        topRatedDescription:
            "Highly rated picks from your results.",

        luckyTitle:
            "Lucky Picks",

        luckyDescription:
            "Good picks that just missed the Top 5.",

        recentTitle:
            "Latest",

        recentDescription:
            "The most recent releases from your results.",

        reroll:
            "Pick Again",


        refineTitle:
            "Short on time? Narrow the results.",

        refineDescription:
            "We'll narrow your current recommendations by length.",

        refinePick:
            "PICK AGAIN",


        sourceTmdb:
            "Movie, series and image data is provided by TMDB.",

        sourceOtt:
            "Streaming availability is sourced from JustWatch and is based on South Korea.",

        privacy:
            "Privacy Policy",

        support:
            "Enjoying this? ☕ Buy me a coffee",


        detail:
            "View details ›",

        overview:
            "Overview",

        productionCountry:
            "Production country",

        availableOn:
            "Available on",

        runtime:
            "Runtime",

        episodeCount:
            "Episodes",

        seasonCount:
            "Seasons",

        movie:
            "Movie",

        series:
            "Series",

        completed:
            "Ended",

        ongoing:
            "Ongoing",

        canceled:
            "Ended",

        planned:
            "Planned",

        minutes:
            " min",

        episodes:
            " episodes",


        loadingTop:
            "Finding highly rated picks...",

        loadingLucky:
            "Choosing some good discoveries...",

        loadingRecent:
            "Finding recent releases...",

        movieRefineLoading:
            "Checking runtimes...",

        seriesRefineLoading:
            "Checking episode counts...",

        noProvider:
            "Streaming info unavailable",

        detailLoading:
            "Loading details...",

        noResults:
            "No matching titles were found.",

        error:
            "Could not load recommendations.",


        ratingsPrefix:
            "",

        ratingsSuffix:
            " ratings",

    },

};


/* =========================================================
   3. 필터 데이터
========================================================= */

const MEDIA_TYPES = [

    {
        id: "movie",
        ko: "영화",
        en: "Movie",
    },

    {
        id: "series",
        ko: "시리즈",
        en: "Series",
    },

];


const OTT_PROVIDERS = [

    {
        id: "all",
        ko: "전체",
        en: "All",
    },

    {
        id: "netflix",
        ko: "Netflix",
        en: "Netflix",
    },

    {
        id: "disney",
        ko: "Disney+",
        en: "Disney+",
    },

    {
        id: "prime",
        ko: "Prime Video",
        en: "Prime Video",
    },

    {
        id: "apple",
        ko: "Apple TV+",
        en: "Apple TV+",
    },

    {
        id: "wavve",
        ko: "Wavve",
        en: "Wavve",
    },

    {
        id: "tving",
        ko: "TVING",
        en: "TVING",
    },

    {
        id: "watcha",
        ko: "WATCHA",
        en: "WATCHA",
    },

];


const MOVIE_GENRES = [

    { id: "action", ko: "액션", en: "Action" },
    { id: "comedy", ko: "코미디", en: "Comedy" },
    { id: "crime", ko: "범죄", en: "Crime" },
    { id: "thriller", ko: "스릴러", en: "Thriller" },
    { id: "mystery", ko: "미스터리", en: "Mystery" },
    { id: "sf_fantasy", ko: "SF·판타지", en: "Sci-Fi & Fantasy" },
    { id: "romance", ko: "로맨스", en: "Romance" },
    { id: "drama", ko: "드라마", en: "Drama" },
    { id: "horror", ko: "공포", en: "Horror" },
    { id: "animation", ko: "애니메이션", en: "Animation" },
    { id: "documentary", ko: "다큐멘터리", en: "Documentary" },

];


const SERIES_GENRES = [

    { id: "action_adventure", ko: "액션·어드벤처", en: "Action & Adventure" },
    { id: "comedy", ko: "코미디", en: "Comedy" },
    { id: "crime", ko: "범죄", en: "Crime" },
    { id: "mystery", ko: "미스터리", en: "Mystery" },
    { id: "sf_fantasy", ko: "SF·판타지", en: "Sci-Fi & Fantasy" },
    { id: "drama", ko: "드라마", en: "Drama" },
    { id: "animation", ko: "애니메이션", en: "Animation" },
    { id: "documentary", ko: "다큐멘터리", en: "Documentary" },
    { id: "reality", ko: "리얼리티", en: "Reality" },
    { id: "family_kids", ko: "가족·키즈", en: "Family & Kids" },

];


const REGIONS = [

    {
        id: "korea",
        ko: "한국",
        en: "Korea",
    },

    {
        id: "japan",
        ko: "일본",
        en: "Japan",
    },

    {
        id: "north_america",
        ko: "북미",
        en: "North America",
    },

    {
        id: "europe",
        ko: "유럽",
        en: "Europe",
    },

    {
        id: "other_asia",
        ko: "기타 아시아",
        en: "Other Asia",
    },

    {
        id: "other",
        ko: "그 외",
        en: "Other",
    },

];


const YEAR_OPTIONS = [

    {
        id: "all",
        ko: "상관없음",
        en: "Any year",
    },

    {
        id: "3",
        ko: "최근 3년 이내",
        en: "Within 3 years",
    },

    {
        id: "10",
        ko: "최근 10년 이내",
        en: "Within 10 years",
    },

    {
        id: "20",
        ko: "최근 20년 이내",
        en: "Within 20 years",
    },

];


const MOVIE_RUNTIME_OPTIONS = [

    {
        id: "all",
        value: null,
        ko: "상관없음",
        en: "Any length",
    },

    {
        id: "90",
        value: 90,
        ko: "90분 이하",
        en: "90 min or less",
    },

    {
        id: "120",
        value: 120,
        ko: "120분 이하",
        en: "120 min or less",
    },

    {
        id: "180",
        value: 180,
        ko: "180분 이하",
        en: "180 min or less",
    },

];


const SERIES_EPISODE_OPTIONS = [

    {
        id: "all",
        value: null,
        ko: "상관없음",
        en: "Any length",
    },

    {
        id: "10",
        value: 10,
        ko: "10화 이하",
        en: "10 episodes or less",
    },

    {
        id: "20",
        value: 20,
        ko: "20화 이하",
        en: "20 episodes or less",
    },

    {
        id: "40",
        value: 40,
        ko: "40화 이하",
        en: "40 episodes or less",
    },

];


/* =========================================================
   4. 상태
========================================================= */

const state = {

    language:
        (
            navigator.language ||
            navigator.userLanguage ||
            ""
        )
            .toLowerCase()
            .startsWith("ko")
            ? "ko"
            : "en",

    mediaType:
        CONFIG.defaultMediaType,

    selectedOtt:
        new Set([
            CONFIG.defaultOtt,
        ]),

    selectedGenres:
        new Set(),

    genreMode:
        "any",

    selectedRegions:
        new Set(),

    selectedYear:
        null,

    selectedRefine:
        "all",


    /*
       현재 화면에 표시 중인 추천
    */

    topRated:
        [],

    luckyPool:
        [],

    currentLucky:
        [],

    recent:
        [],

    luckySeenIds:
        new Set(),

    notice:
        null,


    /*
       1차 PICK 결과.

       2차 분량 필터는 이 후보에서만 실행한다.
    */

    baseCandidates:
        [],

    baseRecommendation:
        null,

    baseQuality:
        null,

};


/* =========================================================
   5. DOM
========================================================= */

const languageButton =
    document.getElementById("languageButton");

const mediaTypeFilters =
    document.getElementById("mediaTypeFilters");

const ottFilters =
    document.getElementById("ottFilters");

const genreFilters =
    document.getElementById("genreFilters");

const genreModeWrap =
    document.getElementById("genreModeWrap");

const regionFilters =
    document.getElementById("regionFilters");

const yearFilters =
    document.getElementById("yearFilters");

const pickButton =
    document.getElementById("pickButton");

const resultsSection =
    document.getElementById("resultsSection");

const topRatedGrid =
    document.getElementById("topRatedGrid");

const luckyGrid =
    document.getElementById("luckyGrid");

const recentGrid =
    document.getElementById("recentGrid");

const rerollButton =
    document.getElementById("rerollButton");

const refineFilters =
    document.getElementById("refineFilters");

const refineButton =
    document.getElementById("refineButton");

const detailModal =
    document.getElementById("detailModal");

const modalContent =
    document.getElementById("modalContent");

const modalClose =
    document.getElementById("modalClose");


/* =========================================================
   6. Helpers
========================================================= */

function getText() {

    return TEXT[
        state.language
    ];
}


function getLabel(item) {

    return item[
        state.language
    ];
}


function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function getCurrentGenres() {

    return state.mediaType === "movie"
        ? MOVIE_GENRES
        : SERIES_GENRES;
}


function getGenreById(id) {

    return getCurrentGenres()
        .find(
            item =>
                item.id === id
        );
}


function getRefineOptions() {

    return state.mediaType === "movie"
        ? MOVIE_RUNTIME_OPTIONS
        : SERIES_EPISODE_OPTIONS;
}


function uniqueItems(items) {

    const map =
        new Map();


    for (
        const item
        of items
    ) {

        if (
            !item ||
            !item.id
        ) {
            continue;
        }


        map.set(
            `${item.type}:${item.id}`,
            item
        );
    }


    return [
        ...map.values(),
    ];
}


/* =========================================================
   7. 결과 초기화
========================================================= */

function invalidateResults(
    resetRefine = true
) {

    resultsSection.classList.add(
        "hidden"
    );


    state.topRated =
        [];

    state.luckyPool =
        [];

    state.currentLucky =
        [];

    state.recent =
        [];

    state.luckySeenIds =
        new Set();

    state.notice =
        null;


    state.baseCandidates =
        [];

    state.baseRecommendation =
        null;

    state.baseQuality =
        null;


    if (
        resetRefine
    ) {

        state.selectedRefine =
            "all";

        renderRefineFilters();
    }
}


/* =========================================================
   8. 미디어 타입
========================================================= */

function renderMediaTypes() {

    mediaTypeFilters.innerHTML =
        MEDIA_TYPES
            .map(
                item => `
                    <button
                        class="choice-button ${state.mediaType === item.id
                        ? "active"
                        : ""
                    }"
                        type="button"
                        data-media-type="${item.id}"
                    >
                        ${escapeHtml(
                        getLabel(item)
                    )}
                    </button>
                `
            )
            .join("");


    mediaTypeFilters
        .querySelectorAll(
            "[data-media-type]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const next =
                            button.dataset
                                .mediaType;


                        if (
                            next ===
                            state.mediaType
                        ) {
                            return;
                        }


                        state.mediaType =
                            next;


                        state.selectedGenres =
                            new Set();

                        state.genreMode =
                            "any";


                        invalidateResults(
                            true
                        );


                        renderMediaTypes();
                        renderGenres();
                        renderGenreMode();
                        renderCompletionState();
                    }
                );
            }
        );
}


/* =========================================================
   9. OTT
========================================================= */

function renderOttFilters() {

    ottFilters.innerHTML =
        OTT_PROVIDERS
            .map(
                item => `
                    <button
                        class="choice-button ${state.selectedOtt.has(
                    item.id
                )
                        ? "active"
                        : ""
                    }"
                        type="button"
                        data-ott="${item.id}"
                    >
                        ${escapeHtml(
                        getLabel(item)
                    )}
                    </button>
                `
            )
            .join("");


    ottFilters
        .querySelectorAll(
            "[data-ott]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.ott;


                        if (
                            id === "all"
                        ) {

                            state.selectedOtt =
                                new Set([
                                    "all",
                                ]);

                        } else {

                            state.selectedOtt.delete(
                                "all"
                            );


                            if (
                                state.selectedOtt.has(
                                    id
                                )
                            ) {

                                state.selectedOtt.delete(
                                    id
                                );

                            } else {

                                state.selectedOtt.add(
                                    id
                                );
                            }


                            if (
                                state.selectedOtt.size ===
                                0
                            ) {

                                state.selectedOtt.add(
                                    "all"
                                );
                            }
                        }


                        invalidateResults(
                            true
                        );

                        renderOttFilters();
                    }
                );
            }
        );
}


/* =========================================================
   10. 장르
========================================================= */

function renderGenres() {

    genreFilters.innerHTML =
        getCurrentGenres()
            .map(
                item => `
                    <button
                        class="choice-button ${state.selectedGenres.has(
                    item.id
                )
                        ? "active"
                        : ""
                    }"
                        type="button"
                        data-genre="${item.id}"
                    >
                        ${escapeHtml(
                        getLabel(item)
                    )}
                    </button>
                `
            )
            .join("");


    genreFilters
        .querySelectorAll(
            "[data-genre]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.genre;


                        if (
                            state.selectedGenres.has(
                                id
                            )
                        ) {

                            state.selectedGenres.delete(
                                id
                            );

                        } else {

                            state.selectedGenres.add(
                                id
                            );
                        }


                        if (
                            state.selectedGenres.size <
                            2
                        ) {

                            state.genreMode =
                                "any";
                        }


                        invalidateResults(
                            true
                        );


                        renderGenres();
                        renderGenreMode();
                        renderCompletionState();
                    }
                );
            }
        );
}


/* =========================================================
   11. 장르 AND / OR
========================================================= */

function renderGenreMode() {

    genreModeWrap.classList.toggle(
        "hidden",
        state.selectedGenres.size < 2
    );


    genreModeWrap
        .querySelectorAll(
            "[data-genre-mode]"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.genreMode ===
                    state.genreMode
                );
            }
        );
}


function setupGenreMode() {

    document
        .querySelectorAll(
            "[data-genre-mode]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        state.genreMode =
                            button.dataset
                                .genreMode;


                        invalidateResults(
                            true
                        );


                        renderGenreMode();
                    }
                );
            }
        );
}


/* =========================================================
   12. 제작 지역
========================================================= */

function renderRegions() {

    regionFilters.innerHTML =
        REGIONS
            .map(
                item => `
                    <button
                        class="choice-button ${state.selectedRegions.has(
                    item.id
                )
                        ? "active"
                        : ""
                    }"
                        type="button"
                        data-region="${item.id}"
                    >
                        ${escapeHtml(
                        getLabel(item)
                    )}
                    </button>
                `
            )
            .join("");


    regionFilters
        .querySelectorAll(
            "[data-region]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.region;


                        if (
                            state.selectedRegions.has(
                                id
                            )
                        ) {

                            state.selectedRegions.delete(
                                id
                            );

                        } else {

                            state.selectedRegions.add(
                                id
                            );
                        }


                        invalidateResults(
                            true
                        );


                        renderRegions();
                        renderCompletionState();
                    }
                );
            }
        );
}


/* =========================================================
   13. 연도
========================================================= */

function renderYears() {

    yearFilters.innerHTML =
        YEAR_OPTIONS
            .map(
                item => `
                    <button
                        class="choice-button ${state.selectedYear ===
                        item.id
                        ? "active"
                        : ""
                    }"
                        type="button"
                        data-year="${item.id}"
                    >
                        ${escapeHtml(
                        getLabel(item)
                    )}
                    </button>
                `
            )
            .join("");


    yearFilters
        .querySelectorAll(
            "[data-year]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        state.selectedYear =
                            button.dataset.year;


                        invalidateResults(
                            true
                        );


                        renderYears();
                        renderCompletionState();
                    }
                );
            }
        );
}


/* =========================================================
   14. 완료 상태
========================================================= */

function setComplete(
    elementId,
    complete
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.classList.toggle(
        "complete",
        complete
    );
}


function renderCompletionState() {

    setComplete(
        "mediaTypeCheck",
        true
    );

    setComplete(
        "ottCheck",
        true
    );

    setComplete(
        "genreCheck",
        state.selectedGenres.size > 0
    );

    setComplete(
        "regionCheck",
        state.selectedRegions.size > 0
    );

    setComplete(
        "yearCheck",
        state.selectedYear !== null
    );


    pickButton.disabled =
        !(
            state.selectedGenres.size > 0 &&
            state.selectedRegions.size > 0 &&
            state.selectedYear !== null
        );
}


/* =========================================================
   15. API
========================================================= */

async function callApi(payload) {

    const response =
        await fetch(
            CONFIG.apiUrl,
            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body:
                    JSON.stringify(
                        payload
                    ),
            }
        );


    let data;


    try {

        data =
            await response.json();

    } catch {

        throw new Error(
            `TMDB ${response.status} | ${url.pathname}?${url.searchParams.toString()} | ${errorText}`
        );
    }


    if (
        !response.ok
    ) {

        throw new Error(
            data.error ||
            `HTTP ${response.status}`
        );
    }


    return data;
}


/* =========================================================
   16. 1차 PICK payload
========================================================= */

function buildRecommendPayload() {

    return {

        action:
            "recommend",

        language:
            state.language,

        mediaType:
            state.mediaType,

        selectedOtt:
            [
                ...state.selectedOtt,
            ],

        selectedGenres:
            [
                ...state.selectedGenres,
            ],

        genreMode:
            state.genreMode,

        selectedRegions:
            [
                ...state.selectedRegions,
            ],

        selectedYear:
            state.selectedYear,

    };
}


/* =========================================================
   17. 2차 필터 payload
========================================================= */

function buildRefinePayload() {

    const option =
        getRefineOptions()
            .find(
                item =>
                    item.id ===
                    state.selectedRefine
            );


    return {

        action:
            "refine",

        language:
            state.language,

        mediaType:
            state.mediaType,

        candidates:
            state.baseCandidates,

        quality:
            state.baseQuality,

        maxRuntime:
            state.mediaType === "movie"
                ? option?.value ?? null
                : null,

        maxEpisodes:
            state.mediaType === "series"
                ? option?.value ?? null
                : null,

    };
}


/* =========================================================
   18. 로딩
========================================================= */

function showInitialLoading() {

    const text =
        getText();


    topRatedGrid.innerHTML = `
        <div class="loading-card">
            ${escapeHtml(text.loadingTop)}
        </div>
    `;


    luckyGrid.innerHTML = `
        <div class="loading-card">
            ${escapeHtml(text.loadingLucky)}
        </div>
    `;


    recentGrid.innerHTML = `
        <div class="loading-card">
            ${escapeHtml(text.loadingRecent)}
        </div>
    `;
}


function showRefineLoading() {

    const text =
        getText();


    const message =
        state.mediaType === "movie"
            ? text.movieRefineLoading
            : text.seriesRefineLoading;


    const html = `
        <div class="loading-card">
            ${escapeHtml(message)}
        </div>
    `;


    topRatedGrid.innerHTML =
        html;

    luckyGrid.innerHTML =
        html;

    recentGrid.innerHTML =
        html;
}


/* =========================================================
   19. Lucky
========================================================= */

function shuffle(items) {

    const copy =
        [
            ...items,
        ];


    for (
        let i =
            copy.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (
                    i +
                    1
                )
            );


        [
            copy[i],
            copy[j],
        ] = [
                copy[j],
                copy[i],
            ];
    }


    return copy;
}


function pickLucky() {

    if (
        state.luckyPool.length ===
        0
    ) {

        state.currentLucky =
            [];

        return;
    }


    let available =
        state.luckyPool
            .filter(
                item =>
                    !state.luckySeenIds.has(
                        item.id
                    )
            );


    const needed =
        Math.min(
            CONFIG.luckyCount,
            state.luckyPool.length
        );


    if (
        available.length <
        needed
    ) {

        state.luckySeenIds.clear();


        available =
            [
                ...state.luckyPool,
            ];
    }


    state.currentLucky =
        shuffle(
            available
        )
            .slice(
                0,
                needed
            );


    state.currentLucky
        .forEach(
            item =>
                state.luckySeenIds.add(
                    item.id
                )
        );
}


/* =========================================================
   20. 평점
========================================================= */

function formatRating(item) {

    const text =
        getText();


    const locale =
        state.language === "ko"
            ? "ko-KR"
            : "en-US";


    const rating =
        Number(
            item.rating ||
            0
        )
            .toFixed(
                1
            );


    const voteCount =
        Number(
            item.voteCount ||
            0
        )
            .toLocaleString(
                locale
            );


    if (
        state.language === "ko"
    ) {

        return (
            `★ ${rating} · ` +
            `${text.ratingsPrefix} ` +
            `${voteCount}${text.ratingsSuffix}`
        );
    }


    return (
        `★ ${rating} · ` +
        `${voteCount}${text.ratingsSuffix}`
    );
}


/* =========================================================
   21. 카드 보조 함수
========================================================= */

function getStatusLabel(status) {

    const text =
        getText();


    if (!status) {
        return null;
    }


    if (
        status === "Ended"
    ) {
        return text.completed;
    }


    if (
        status === "Returning Series" ||
        status === "In Production"
    ) {
        return text.ongoing;
    }


    if (
        status === "Canceled"
    ) {
        return text.canceled;
    }


    if (
        status === "Planned" ||
        status === "Pilot"
    ) {
        return text.planned;
    }


    return status;
}


function getTypeMeta(item) {

    const text =
        getText();


    if (
        item.type === "movie"
    ) {

        if (
            item.runtime
        ) {

            return (
                `${text.movie} · ` +
                `${item.runtime}${text.minutes}`
            );
        }


        return text.movie;
    }


    const parts = [
        text.series,
    ];


    const status =
        getStatusLabel(
            item.status
        );


    if (status) {
        parts.push(status);
    }


    if (
        item.episodes
    ) {

        parts.push(
            `${item.episodes}${text.episodes}`
        );
    }


    return parts.join(
        " · "
    );
}


function getItemGenreLabels(item) {

    return (
        item.genreKeys ||
        []
    )
        .map(
            key => {

                const genre =
                    getGenreById(
                        key
                    );


                return genre
                    ? getLabel(genre)
                    : null;
            }
        )
        .filter(Boolean)
        .slice(
            0,
            3
        );
}


function formatProviderText(item) {

    if (
        !Array.isArray(
            item.providers
        ) ||
        item.providers.length ===
        0
    ) {

        return getText()
            .noProvider;
    }


    const visible =
        item.providers
            .slice(
                0,
                2
            );


    let result =
        visible.join(
            ", "
        );


    if (
        item.providers.length >
        2
    ) {

        result +=
            ` +${item.providers.length - 2}`;
    }


    return result;
}


function getPosterUrl(
    posterPath
) {

    if (
        !posterPath
    ) {
        return null;
    }


    return (
        CONFIG.imageBaseUrl +
        posterPath
    );
}


/* =========================================================
   22. 카드
========================================================= */

function posterCard(item) {

    const posterUrl =
        getPosterUrl(
            item.posterPath
        );


    const genres =
        getItemGenreLabels(
            item
        );


    return `
        <article
            class="poster-card"
            tabindex="0"
            role="button"
            data-item-id="${item.id}"
            data-item-type="${escapeHtml(item.type)}"
        >

            <div class="poster-image-wrap">

                ${posterUrl
            ? `
                            <img
                                class="poster-image"
                                src="${escapeHtml(posterUrl)}"
                                alt="${escapeHtml(item.title)}"
                                loading="lazy"
                            >
                        `
            : `
                            <div class="poster-placeholder">
                                ${escapeHtml(item.title)}
                            </div>
                        `
        }

            </div>


            <div class="poster-info">

                <h4 class="poster-title">
                    ${escapeHtml(item.title)}
                </h4>


                <p class="poster-meta">
                    ${escapeHtml(
            getTypeMeta(item)
        )}
                </p>


                ${genres.length
            ? `
                            <div class="poster-genres">

                                ${genres
                .map(
                    genre => `
                                                <span class="poster-genre">
                                                    ${escapeHtml(genre)}
                                                </span>
                                            `
                )
                .join("")
            }

                            </div>
                        `
            : ""
        }


                <p class="poster-rating">
                    ${escapeHtml(
            formatRating(item)
        )}
                </p>


                <p class="poster-bottom">

                    ${escapeHtml(
            item.year || "-"
        )}

                    ·

                    ${escapeHtml(
            formatProviderText(item)
        )}

                </p>


                <span class="detail-hint">
                    ${escapeHtml(
            getText().detail
        )}
                </span>

            </div>

        </article>
    `;
}


/* =========================================================
   23. 카드 렌더
========================================================= */

function setupImageFallbacks(
    container
) {

    container
        .querySelectorAll(
            ".poster-image"
        )
        .forEach(
            image => {

                image.addEventListener(
                    "error",
                    () => {

                        const wrap =
                            image.parentElement;


                        wrap.innerHTML = `
                            <div class="poster-placeholder">
                                ${escapeHtml(image.alt)}
                            </div>
                        `;
                    },
                    {
                        once: true,
                    }
                );
            }
        );
}


function findRecommendationItem(
    type,
    id
) {

    const numericId =
        Number(id);


    return [
        ...state.topRated,
        ...state.luckyPool,
        ...state.recent,
    ]
        .find(
            item =>
                item.id === numericId &&
                item.type === type
        );
}


function renderCards(
    container,
    items
) {

    if (
        !items.length
    ) {

        container.innerHTML = `
            <div class="loading-card">
                ${escapeHtml(
            getText().noResults
        )}
            </div>
        `;

        return;
    }


    container.innerHTML =
        items
            .map(
                posterCard
            )
            .join("");


    setupImageFallbacks(
        container
    );


    container
        .querySelectorAll(
            ".poster-card"
        )
        .forEach(
            card => {

                const open =
                    () => {

                        const item =
                            findRecommendationItem(
                                card.dataset.itemType,
                                card.dataset.itemId
                            );


                        if (item) {

                            openDetailModal(
                                item
                            );
                        }
                    };


                card.addEventListener(
                    "click",
                    open
                );


                card.addEventListener(
                    "keydown",
                    event => {

                        if (
                            event.key === "Enter" ||
                            event.key === " "
                        ) {

                            event.preventDefault();

                            open();
                        }
                    }
                );
            }
        );
}


function renderLucky() {

    renderCards(
        luckyGrid,
        state.currentLucky
    );
}


function renderAllResults() {

    renderCards(
        topRatedGrid,
        state.topRated
    );


    renderLucky();


    renderCards(
        recentGrid,
        state.recent
    );


    const clickHint =
        document.getElementById(
            "clickHint"
        );


    clickHint.textContent =
        state.notice
            ? `${state.notice} ${getText().clickHint}`
            : getText().clickHint;
}


/* =========================================================
   24. 서버 결과 적용
========================================================= */

function applyRecommendationData(
    data
) {

    state.topRated =
        data.topRated ||
        [];

    state.luckyPool =
        data.luckyPool ||
        [];

    state.recent =
        data.recent ||
        [];

    state.notice =
        data.notice ||
        null;


    state.luckySeenIds =
        new Set();


    pickLucky();


    renderAllResults();
}


/* =========================================================
   25. 최초 PICK
========================================================= */

async function performInitialRecommendation() {

    resultsSection.classList.remove(
        "hidden"
    );


    showInitialLoading();


    try {

        const data =
            await callApi(
                buildRecommendPayload()
            );


        applyRecommendationData(
            data
        );


        /*
           2차 필터용 최초 후보를 보관한다.

           Top / Lucky Pool / Latest는
           서로 중복되지 않으므로 최대 약 30개.
        */

        state.baseCandidates =
            uniqueItems([
                ...(data.topRated || []),
                ...(data.luckyPool || []),
                ...(data.recent || []),
            ]);


        state.baseQuality =
            data.quality ||
            null;


        state.baseRecommendation = {

            topRated:
                [
                    ...(data.topRated || []),
                ],

            luckyPool:
                [
                    ...(data.luckyPool || []),
                ],

            recent:
                [
                    ...(data.recent || []),
                ],

            notice:
                data.notice ||
                null,

        };


    } catch (
    error
    ) {

        console.error(
            error
        );


        showRecommendationError();
    }
}


/* =========================================================
   26. 2차 시간 필터
========================================================= */

function restoreBaseRecommendation() {

    if (
        !state.baseRecommendation
    ) {
        return;
    }


    state.topRated =
        [
            ...state.baseRecommendation
                .topRated,
        ];

    state.luckyPool =
        [
            ...state.baseRecommendation
                .luckyPool,
        ];

    state.recent =
        [
            ...state.baseRecommendation
                .recent,
        ];

    state.notice =
        state.baseRecommendation
            .notice;


    state.luckySeenIds =
        new Set();


    pickLucky();


    renderAllResults();
}


async function performRefineRecommendation() {

    /*
       상관없음이면 API 호출조차 하지 않고
       최초 추천으로 복원한다.
    */

    if (
        state.selectedRefine ===
        "all"
    ) {

        restoreBaseRecommendation();

        return;
    }


    if (
        state.baseCandidates.length ===
        0
    ) {

        await performInitialRecommendation();

        return;
    }


    showRefineLoading();


    try {

        const data =
            await callApi(
                buildRefinePayload()
            );


        applyRecommendationData(
            data
        );


    } catch (
    error
    ) {

        console.error(
            error
        );


        showRecommendationError();
    }
}


function showRecommendationError() {

    const message =
        escapeHtml(
            getText().error
        );


    const html = `
        <div class="loading-card">
            ${message}
        </div>
    `;


    topRatedGrid.innerHTML =
        html;

    luckyGrid.innerHTML =
        html;

    recentGrid.innerHTML =
        html;
}


/* =========================================================
   27. 재추첨
========================================================= */

function rerollLucky() {

    if (
        state.luckyPool.length ===
        0
    ) {
        return;
    }


    pickLucky();

    renderLucky();
}


/* =========================================================
   28. 2차 필터 UI
========================================================= */

function renderRefineFilters() {

    refineFilters.innerHTML =
        getRefineOptions()
            .map(
                item => `
                    <button
                        class="choice-button ${state.selectedRefine ===
                        item.id
                        ? "active"
                        : ""
                    }"
                        type="button"
                        data-refine="${item.id}"
                    >
                        ${escapeHtml(
                        getLabel(item)
                    )}
                    </button>
                `
            )
            .join("");


    refineFilters
        .querySelectorAll(
            "[data-refine]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        state.selectedRefine =
                            button.dataset.refine;


                        renderRefineFilters();
                    }
                );
            }
        );
}


/* =========================================================
   29. 상세 모달
========================================================= */

function formatCountries(
    countryCodes
) {

    if (
        !Array.isArray(
            countryCodes
        ) ||
        countryCodes.length === 0
    ) {
        return "-";
    }


    try {

        const displayNames =
            new Intl.DisplayNames(
                [
                    state.language === "ko"
                        ? "ko"
                        : "en",
                ],
                {
                    type:
                        "region",
                }
            );


        return countryCodes
            .map(
                code =>
                    displayNames.of(code) ||
                    code
            )
            .join(
                ", "
            );


    } catch {

        return countryCodes.join(
            ", "
        );
    }
}


function openModalShell() {

    detailModal.classList.add(
        "open"
    );


    detailModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );
}


async function openDetailModal(item) {

    openModalShell();


    modalContent.innerHTML = `
        <div class="loading-card">
            ${escapeHtml(
        getText().detailLoading
    )}
        </div>
    `;


    try {

        const detail =
            await callApi({

                action:
                    "detail",

                language:
                    state.language,

                type:
                    item.type,

                id:
                    item.id,

            });


        renderDetailModal(
            detail
        );


    } catch (
    error
    ) {

        console.error(
            error
        );


        modalContent.innerHTML = `
            <div class="loading-card">
                ${escapeHtml(
            getText().error
        )}
            </div>
        `;
    }
}


function renderDetailModal(detail) {

    const text =
        getText();


    const posterUrl =
        getPosterUrl(
            detail.posterPath
        );


    const providerText =
        Array.isArray(
            detail.providers
        ) &&
            detail.providers.length
            ? detail.providers.join(", ")
            : text.noProvider;


    const extraInfo =
        [];


    if (
        detail.type === "movie" &&
        detail.runtime
    ) {

        extraInfo.push(
            `${text.runtime} · ` +
            `${detail.runtime}${text.minutes}`
        );
    }


    if (
        detail.type === "series"
    ) {

        const status =
            getStatusLabel(
                detail.status
            );


        if (status) {
            extraInfo.push(status);
        }


        if (
            detail.seasons
        ) {

            extraInfo.push(
                `${text.seasonCount} ${detail.seasons}`
            );
        }


        if (
            detail.episodes
        ) {

            extraInfo.push(
                `${text.episodeCount} ` +
                `${detail.episodes}${text.episodes}`
            );
        }
    }


    modalContent.innerHTML = `

        ${posterUrl
            ? `
                    <img
                        class="modal-poster"
                        src="${escapeHtml(posterUrl)}"
                        alt="${escapeHtml(detail.title)}"
                    >
                `
            : ""
        }


        <h2
            id="modalTitle"
            class="modal-title"
        >
            ${escapeHtml(
            detail.title
        )}
        </h2>


        <p class="modal-meta">

            ${escapeHtml(
            detail.type === "movie"
                ? text.movie
                : text.series
        )}

            ${extraInfo.length
            ? `
                        <br>
                        ${escapeHtml(
                extraInfo.join(" · ")
            )}
                    `
            : ""
        }

            <br>

            ${escapeHtml(
            formatRating(detail)
        )}

            <br>

            ${escapeHtml(
            detail.year || "-"
        )}

            <br>

            ${escapeHtml(
            text.productionCountry
        )}
            ·
            ${escapeHtml(
            formatCountries(
                detail.countryCodes
            )
        )}

            <br>

            ${escapeHtml(
            text.availableOn
        )}
            ·
            ${escapeHtml(
            providerText
        )}

        </p>


        ${detail.overview
            ? `
                    <section class="modal-overview">

                        <h3 class="modal-section-title">
                            ${escapeHtml(
                text.overview
            )}
                        </h3>

                        <p>
                            ${escapeHtml(
                detail.overview
            )}
                        </p>

                    </section>
                `
            : ""
        }

    `;
}


function closeDetailModal() {

    detailModal.classList.remove(
        "open"
    );


    detailModal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "modal-open"
    );
}


/* =========================================================
   30. 언어
========================================================= */

function renderLanguage() {

    const text =
        getText();


    document.documentElement.lang =
        state.language;


    document.title =
        text.pageTitle;


    const metaDescription =
        document.getElementById(
            "metaDescription"
        );


    if (metaDescription) {

        metaDescription.setAttribute(
            "content",
            text.metaDescription
        );
    }


    const ogTitle =
        document.getElementById(
            "ogTitle"
        );


    if (ogTitle) {

        ogTitle.setAttribute(
            "content",
            text.pageTitle
        );
    }


    const ogDescription =
        document.getElementById(
            "ogDescription"
        );


    if (ogDescription) {

        ogDescription.setAttribute(
            "content",
            text.ogDescription
        );
    }


    languageButton.textContent =
        text.languageButton;


    document
        .getElementById("siteTitle")
        .textContent =
        text.siteTitle;


    document
        .getElementById("siteSubtitle")
        .textContent =
        text.siteSubtitle;


    document
        .getElementById("mediaTypeTitle")
        .textContent =
        text.mediaTypeTitle;


    document
        .getElementById("ottTitle")
        .textContent =
        text.ottTitle;


    const ottHint =
        document.getElementById(
            "ottHint"
        );


    if (ottHint) {

        ottHint.textContent =
            text.ottHint;
    }


    document
        .getElementById("genreTitle")
        .textContent =
        text.genreTitle;


    document
        .getElementById("genreHint")
        .textContent =
        text.genreHint;


    document
        .getElementById("genreModeLabel")
        .textContent =
        text.genreModeLabel;


    document
        .querySelector(
            '[data-genre-mode="any"]'
        )
        .textContent =
        text.genreAny;


    document
        .querySelector(
            '[data-genre-mode="all"]'
        )
        .textContent =
        text.genreAll;


    document
        .getElementById("regionTitle")
        .textContent =
        text.regionTitle;


    document
        .getElementById("regionHint")
        .textContent =
        text.regionHint;


    document
        .getElementById("yearTitle")
        .textContent =
        text.yearTitle;


    pickButton.textContent =
        text.pick;


    document
        .getElementById("resultsTitle")
        .textContent =
        text.resultsTitle;


    document
        .getElementById("clickHint")
        .textContent =
        state.notice
            ? `${state.notice} ${text.clickHint}`
            : text.clickHint;


    document
        .getElementById("topRatedTitle")
        .textContent =
        text.topRatedTitle;


    document
        .getElementById("topRatedDescription")
        .textContent =
        text.topRatedDescription;


    document
        .getElementById("luckyTitle")
        .textContent =
        text.luckyTitle;


    document
        .getElementById("luckyDescription")
        .textContent =
        text.luckyDescription;


    document
        .getElementById("recentTitle")
        .textContent =
        text.recentTitle;


    document
        .getElementById("recentDescription")
        .textContent =
        text.recentDescription;


    rerollButton.textContent =
        text.reroll;


    document
        .getElementById("refineTitle")
        .textContent =
        text.refineTitle;


    document
        .getElementById("refineDescription")
        .textContent =
        text.refineDescription;


    refineButton.textContent =
        text.refinePick;


    const sourceTmdb =
        document.getElementById(
            "sourceTmdb"
        );


    if (sourceTmdb) {

        sourceTmdb.textContent =
            text.sourceTmdb;
    }


    const sourceOtt =
        document.getElementById(
            "sourceOtt"
        );


    if (sourceOtt) {

        sourceOtt.textContent =
            text.sourceOtt;
    }


    document
        .getElementById("privacyLink")
        .textContent =
        text.privacy;


    document
        .getElementById("supportLink")
        .textContent =
        text.support;


    renderMediaTypes();
    renderOttFilters();
    renderGenres();
    renderRegions();
    renderYears();
    renderGenreMode();
    renderRefineFilters();
    renderCompletionState();


    if (
        !resultsSection.classList.contains(
            "hidden"
        )
    ) {

        renderAllResults();
    }
}


/* =========================================================
   31. 이벤트
========================================================= */

function setupLanguageButton() {

    languageButton.addEventListener(
        "click",
        async () => {

            const hadResults =
                !resultsSection
                    .classList
                    .contains(
                        "hidden"
                    );


            const previousRefine =
                state.selectedRefine;


            state.language =
                state.language === "ko"
                    ? "en"
                    : "ko";


            closeDetailModal();

            renderLanguage();


            /*
               제목 / overview도 언어별 TMDB 응답이므로
               첫 검색부터 새 언어로 다시 수행한다.
            */

            if (
                hadResults
            ) {

                await performInitialRecommendation();


                state.selectedRefine =
                    previousRefine;


                renderRefineFilters();


                if (
                    previousRefine !==
                    "all"
                ) {

                    await performRefineRecommendation();
                }
            }
        }
    );
}


function setupPickButton() {

    pickButton.addEventListener(
        "click",
        async () => {

            state.selectedRefine =
                "all";


            renderRefineFilters();


            await performInitialRecommendation();


            resultsSection.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start",

            });
        }
    );
}


function setupRerollButton() {

    rerollButton.addEventListener(
        "click",
        rerollLucky
    );
}


function setupRefineButton() {

    refineButton.addEventListener(
        "click",
        performRefineRecommendation
    );
}


function setupModal() {

    modalClose.addEventListener(
        "click",
        closeDetailModal
    );


    detailModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                detailModal
            ) {

                closeDetailModal();
            }
        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                detailModal.classList.contains(
                    "open"
                )
            ) {

                closeDetailModal();
            }
        }
    );
}


/* =========================================================
   32. 시작
========================================================= */

setupGenreMode();
setupLanguageButton();
setupPickButton();
setupRerollButton();
setupRefineButton();
setupModal();

renderLanguage();