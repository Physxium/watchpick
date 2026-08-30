/* =========================================================
   볼만한픽 / Pick to Watch

   1. 사이트 설정
   2. 한/영 문구
   3. 필터 목록
   4. 상태
   5. UI 렌더링
   6. API
   7. 추천 / 재추첨
   8. 상세 팝업

   자주 수정할 내용은 위쪽에 모아두었습니다.
========================================================= */


/* =========================================================
   1. 사이트 설정
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
   2. 한 / 영 문구

   사이트 문구를 고치고 싶으면
   대부분 이 부분만 수정하면 됩니다.
========================================================= */

const TEXT = {

    ko: {

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
            "선택한 분량 기준으로 다시 추천해드려요.",

        refinePick:
            "다시 PICK",

        sourceText:
            "영화·시리즈 정보는 TMDB를, OTT 제공 정보는 JustWatch 기반 TMDB 데이터를 사용합니다.",

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

        loadingProviders:
            "OTT 확인 중...",

        noProvider:
            "OTT 정보 없음",

        detailLoading:
            "상세 정보를 불러오는 중...",

        seriesRefineLoading:
            "시리즈의 에피소드 수를 확인하고 있어요...",

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
            "Pick a length and we'll refine the recommendations.",

        refinePick:
            "PICK AGAIN",

        sourceText:
            "Movie and series data is provided by TMDB. Streaming availability is sourced from JustWatch via TMDB.",

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
            "min",

        episodes:
            "episodes",

        loadingTop:
            "Finding highly rated picks...",

        loadingLucky:
            "Choosing some good discoveries...",

        loadingRecent:
            "Finding recent releases...",

        loadingProviders:
            "Checking streaming...",

        noProvider:
            "Streaming info unavailable",

        detailLoading:
            "Loading details...",

        seriesRefineLoading:
            "Checking episode counts...",

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
   3. 콘텐츠 유형
========================================================= */

const MEDIA_TYPES = [

    {
        id:
            "movie",

        ko:
            "영화",

        en:
            "Movie",
    },

    {
        id:
            "series",

        ko:
            "시리즈",

        en:
            "Series",
    },

];


/* =========================================================
   4. OTT

   id는 recommend.js의 OTT_ALIASES와 맞춰야 합니다.
========================================================= */

const OTT_PROVIDERS = [

    {
        id:
            "all",

        ko:
            "전체",

        en:
            "All",
    },

    {
        id:
            "netflix",

        ko:
            "Netflix",

        en:
            "Netflix",
    },

    {
        id:
            "disney",

        ko:
            "Disney+",

        en:
            "Disney+",
    },

    {
        id:
            "wavve",

        ko:
            "Wavve",

        en:
            "Wavve",
    },

    {
        id:
            "tving",

        ko:
            "TVING",

        en:
            "TVING",
    },

    {
        id:
            "watcha",

        ko:
            "WATCHA",

        en:
            "WATCHA",
    },

];


/* =========================================================
   5. 영화 장르

   id는 recommend.js의
   MOVIE_GENRE_GROUPS와 맞춰야 합니다.
========================================================= */

const MOVIE_GENRES = [

    {
        id: "action",
        ko: "액션",
        en: "Action",
    },

    {
        id: "comedy",
        ko: "코미디",
        en: "Comedy",
    },

    {
        id: "crime",
        ko: "범죄",
        en: "Crime",
    },

    {
        id: "thriller",
        ko: "스릴러",
        en: "Thriller",
    },

    {
        id: "mystery",
        ko: "미스터리",
        en: "Mystery",
    },

    {
        id: "sf_fantasy",
        ko: "SF·판타지",
        en: "Sci-Fi & Fantasy",
    },

    {
        id: "romance",
        ko: "로맨스",
        en: "Romance",
    },

    {
        id: "drama",
        ko: "드라마",
        en: "Drama",
    },

    {
        id: "horror",
        ko: "공포",
        en: "Horror",
    },

    {
        id: "animation",
        ko: "애니메이션",
        en: "Animation",
    },

    {
        id: "documentary",
        ko: "다큐멘터리",
        en: "Documentary",
    },

];


/* =========================================================
   6. 시리즈 장르

   id는 recommend.js의
   SERIES_GENRE_GROUPS와 맞춰야 합니다.
========================================================= */

const SERIES_GENRES = [

    {
        id: "action_adventure",
        ko: "액션·어드벤처",
        en: "Action & Adventure",
    },

    {
        id: "comedy",
        ko: "코미디",
        en: "Comedy",
    },

    {
        id: "crime",
        ko: "범죄",
        en: "Crime",
    },

    {
        id: "mystery",
        ko: "미스터리",
        en: "Mystery",
    },

    {
        id: "sf_fantasy",
        ko: "SF·판타지",
        en: "Sci-Fi & Fantasy",
    },

    {
        id: "drama",
        ko: "드라마",
        en: "Drama",
    },

    {
        id: "animation",
        ko: "애니메이션",
        en: "Animation",
    },

    {
        id: "documentary",
        ko: "다큐멘터리",
        en: "Documentary",
    },

    {
        id: "reality",
        ko: "리얼리티",
        en: "Reality",
    },

    {
        id: "family_kids",
        ko: "가족·키즈",
        en: "Family & Kids",
    },

];


/* =========================================================
   7. 제작지역
========================================================= */

const REGIONS = [

    {
        id: "korea",
        ko: "한국",
        en: "Korea",
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


/* =========================================================
   8. 연도
========================================================= */

const YEAR_OPTIONS = [

    {
        id:
            "all",

        ko:
            "상관없음",

        en:
            "Any year",
    },

    {
        id:
            "3",

        ko:
            "최근 3년 이내",

        en:
            "Within 3 years",
    },

    {
        id:
            "10",

        ko:
            "최근 10년 이내",

        en:
            "Within 10 years",
    },

    {
        id:
            "20",

        ko:
            "최근 20년 이내",

        en:
            "Within 20 years",
    },

];


/* =========================================================
   9. 2차 영화 분량
========================================================= */

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


/* =========================================================
   10. 2차 시리즈 분량
========================================================= */

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
   11. 상태
========================================================= */

const state = {

    language:
        (
            navigator.language ||
            navigator.userLanguage ||
            ""
        )
            .toLowerCase()
            .startsWith(
                "ko"
            )
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

    /*
       연도는 사용자가 직접 하나 선택해야 하므로
       기본값 없음.
    */
    selectedYear:
        null,

    selectedRefine:
        "all",

    topRated:
        [],

    luckyPool:
        [],

    currentLucky:
        [],

    luckySeenIds:
        new Set(),

    recent:
        [],

    notice:
        null,

};


/* =========================================================
   12. DOM
========================================================= */

const languageButton =
    document.getElementById(
        "languageButton"
    );

const mediaTypeFilters =
    document.getElementById(
        "mediaTypeFilters"
    );

const ottFilters =
    document.getElementById(
        "ottFilters"
    );

const genreFilters =
    document.getElementById(
        "genreFilters"
    );

const genreModeWrap =
    document.getElementById(
        "genreModeWrap"
    );

const regionFilters =
    document.getElementById(
        "regionFilters"
    );

const yearFilters =
    document.getElementById(
        "yearFilters"
    );

const pickButton =
    document.getElementById(
        "pickButton"
    );

const resultsSection =
    document.getElementById(
        "resultsSection"
    );

const topRatedGrid =
    document.getElementById(
        "topRatedGrid"
    );

const luckyGrid =
    document.getElementById(
        "luckyGrid"
    );

const recentGrid =
    document.getElementById(
        "recentGrid"
    );

const rerollButton =
    document.getElementById(
        "rerollButton"
    );

const refineFilters =
    document.getElementById(
        "refineFilters"
    );

const refineButton =
    document.getElementById(
        "refineButton"
    );

const detailModal =
    document.getElementById(
        "detailModal"
    );

const modalContent =
    document.getElementById(
        "modalContent"
    );

const modalClose =
    document.getElementById(
        "modalClose"
    );


/* =========================================================
   13. 기본 Helpers
========================================================= */

function getText() {

    return TEXT[
        state.language
    ];
}


function getLabel(
    item
) {

    return item[
        state.language
    ];
}


function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


function getCurrentGenres() {

    return state.mediaType ===
        "movie"
        ? MOVIE_GENRES
        : SERIES_GENRES;
}


function getGenreById(
    id
) {

    return getCurrentGenres()
        .find(
            genre =>
                genre.id === id
        );
}


function getRefineOptions() {

    return state.mediaType ===
        "movie"
        ? MOVIE_RUNTIME_OPTIONS
        : SERIES_EPISODE_OPTIONS;
}


/* =========================================================
   14. 결과 무효화
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


    if (
        resetRefine
    ) {

        state.selectedRefine =
            "all";

        renderRefineFilters();
    }
}


/* =========================================================
   15. 영화 / 시리즈
========================================================= */

function renderMediaTypes() {

    mediaTypeFilters.innerHTML =
        MEDIA_TYPES
            .map(
                item => `
                    <button
                        class="
                            choice-button
                            ${state.mediaType ===
                        item.id
                        ? "active"
                        : ""
                    }
                        "
                        type="button"
                        data-media-type="${item.id}"
                    >
                        ${escapeHtml(
                        getLabel(
                            item
                        )
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


                        /*
                           영화와 시리즈의 장르 체계가 다르므로
                           콘텐츠 유형 변경 시 기존 장르 초기화.
                        */
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
   16. OTT
========================================================= */

function renderOttFilters() {

    ottFilters.innerHTML =
        OTT_PROVIDERS
            .map(
                item => `
                    <button
                        class="
                            choice-button
                            ${state.selectedOtt.has(
                    item.id
                )
                        ? "active"
                        : ""
                    }
                        "
                        type="button"
                        data-ott="${item.id}"
                    >
                        ${escapeHtml(
                        getLabel(
                            item
                        )
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
                            button.dataset
                                .ott;


                        if (
                            id ===
                            "all"
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


                            /*
                               아무 OTT도 안 남으면
                               자동으로 전체로 복귀.
                            */
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
   17. 장르
========================================================= */

function renderGenres() {

    const genres =
        getCurrentGenres();


    genreFilters.innerHTML =
        genres
            .map(
                item => `
                    <button
                        class="
                            choice-button
                            ${state.selectedGenres.has(
                    item.id
                )
                        ? "active"
                        : ""
                    }
                        "
                        type="button"
                        data-genre="${item.id}"
                    >
                        ${escapeHtml(
                        getLabel(
                            item
                        )
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
                            button.dataset
                                .genre;


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


                        /*
                           장르가 하나 이하가 되면
                           AND/OR 의미가 없으므로 기본 any로 복귀.
                        */
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
   18. 장르 AND / OR
========================================================= */

function renderGenreMode() {

    const visible =
        state.selectedGenres.size >=
        2;


    genreModeWrap.classList.toggle(
        "hidden",
        !visible
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
   19. 제작지역
========================================================= */

function renderRegions() {

    regionFilters.innerHTML =
        REGIONS
            .map(
                item => `
                    <button
                        class="
                            choice-button
                            ${state.selectedRegions.has(
                    item.id
                )
                        ? "active"
                        : ""
                    }
                        "
                        type="button"
                        data-region="${item.id}"
                    >
                        ${escapeHtml(
                        getLabel(
                            item
                        )
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
                            button.dataset
                                .region;


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
   20. 연도
========================================================= */

function renderYears() {

    yearFilters.innerHTML =
        YEAR_OPTIONS
            .map(
                item => `
                    <button
                        class="
                            choice-button
                            ${state.selectedYear ===
                        item.id
                        ? "active"
                        : ""
                    }
                        "
                        type="button"
                        data-year="${item.id}"
                    >
                        ${escapeHtml(
                        getLabel(
                            item
                        )
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
                            button.dataset
                                .year;


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
   21. 완료 체크
========================================================= */

function setComplete(
    elementId,
    complete
) {

    document
        .getElementById(
            elementId
        )
        .classList
        .toggle(
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
        state.selectedGenres.size >
        0
    );


    setComplete(
        "regionCheck",
        state.selectedRegions.size >
        0
    );


    setComplete(
        "yearCheck",
        state.selectedYear !==
        null
    );


    const ready =
        state.selectedGenres.size >
        0 &&
        state.selectedRegions.size >
        0 &&
        state.selectedYear !==
        null;


    pickButton.disabled =
        !ready;
}


/* =========================================================
   22. API
========================================================= */

async function callApi(
    payload
) {

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
            `HTTP ${response.status}`
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
   23. 추천 요청 Payload
========================================================= */

function buildRecommendPayload(
    useRefine
) {

    let maxRuntime =
        null;

    let maxEpisodes =
        null;


    if (
        useRefine &&
        state.selectedRefine !==
        "all"
    ) {

        const option =
            getRefineOptions()
                .find(
                    item =>
                        item.id ===
                        state.selectedRefine
                );


        if (
            option
        ) {

            if (
                state.mediaType ===
                "movie"
            ) {

                maxRuntime =
                    option.value;

            } else {

                maxEpisodes =
                    option.value;
            }
        }
    }


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

        maxRuntime,

        maxEpisodes,
    };
}


/* =========================================================
   24. 로딩
========================================================= */

function showLoading(
    refine = false
) {

    const text =
        getText();


    const seriesRefining =
        refine &&
        state.mediaType ===
        "series" &&
        state.selectedRefine !==
        "all";


    topRatedGrid.innerHTML = `
        <div class="loading-card">
            ${seriesRefining
            ? escapeHtml(
                text.seriesRefineLoading
            )
            : escapeHtml(
                text.loadingTop
            )
        }
        </div>
    `;


    luckyGrid.innerHTML = `
        <div class="loading-card">
            ${seriesRefining
            ? escapeHtml(
                text.seriesRefineLoading
            )
            : escapeHtml(
                text.loadingLucky
            )
        }
        </div>
    `;


    recentGrid.innerHTML = `
        <div class="loading-card">
            ${seriesRefining
            ? escapeHtml(
                text.seriesRefineLoading
            )
            : escapeHtml(
                text.loadingRecent
            )
        }
        </div>
    `;
}


/* =========================================================
   25. 행운 추첨
========================================================= */

function shuffle(
    items
) {

    const copy =
        [
            ...items,
        ];


    for (
        let index =
            copy.length - 1;
        index > 0;
        index--
    ) {

        const target =
            Math.floor(
                Math.random() *
                (
                    index +
                    1
                )
            );


        [
            copy[
            index
            ],
            copy[
            target
            ],
        ] = [
                copy[
                target
                ],
                copy[
                index
                ],
            ];
    }


    return copy;
}


function pickLucky() {

    let available =
        state.luckyPool
            .filter(
                item =>
                    !state.luckySeenIds.has(
                        item.id
                    )
            );


    /*
       후보가 한 바퀴 돌았으면
       다시 전체 풀을 사용할 수 있게 함.
    */
    if (
        available.length <
        Math.min(
            CONFIG.luckyCount,
            state.luckyPool.length
        )
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
                CONFIG.luckyCount
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
   26. 평점/평가수
========================================================= */

function formatRating(
    item
) {

    const text =
        getText();


    const locale =
        state.language === "ko"
            ? "ko-KR"
            : "en-US";


    const voteCount =
        Number(
            item.voteCount ||
            0
        )
            .toLocaleString(
                locale
            );


    if (
        state.language ===
        "ko"
    ) {

        return (
            `★ ${Number(item.rating).toFixed(1)} ` +
            `· ${text.ratingsPrefix} ${voteCount}${text.ratingsSuffix}`
        );
    }


    return (
        `★ ${Number(item.rating).toFixed(1)} ` +
        `· ${voteCount}${text.ratingsSuffix}`
    );
}


/* =========================================================
   27. 상태
========================================================= */

function getStatusLabel(
    status
) {

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
        status ===
        "Returning Series" ||
        status ===
        "In Production"
    ) {

        return text.ongoing;
    }


    if (
        status ===
        "Canceled"
    ) {

        return text.canceled;
    }


    if (
        status ===
        "Planned" ||
        status ===
        "Pilot"
    ) {

        return text.planned;
    }


    return status;
}


/* =========================================================
   28. 콘텐츠 유형 메타
========================================================= */

function getTypeMeta(
    item
) {

    const text =
        getText();


    if (
        item.type ===
        "movie"
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


    if (
        status
    ) {

        parts.push(
            status
        );
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


/* =========================================================
   29. 장르 표시
========================================================= */

function getItemGenreLabels(
    item
) {

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
                    ? getLabel(
                        genre
                    )
                    : null;
            }
        )
        .filter(
            Boolean
        )
        .slice(
            0,
            3
        );
}


/* =========================================================
   30. OTT 표시
========================================================= */

function formatProviderText(
    item
) {

    const text =
        getText();


    if (
        !Array.isArray(
            item.providers
        )
    ) {

        return text.loadingProviders;
    }


    if (
        item.providers.length ===
        0
    ) {

        return text.noProvider;
    }


    /*
       카드가 좁으므로 최대 2개까지만 표시.
       상세 팝업에서는 전부 표시합니다.
    */
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


/* =========================================================
   31. 포스터
========================================================= */

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
   32. 포스터 카드
========================================================= */

function posterCard(
    item
) {

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
            data-item-type="${escapeHtml(
        item.type
    )}"
        >

            <div class="poster-image-wrap">

                ${posterUrl
            ? `
                            <img
                                class="poster-image"
                                src="${escapeHtml(
                posterUrl
            )}"
                                alt="${escapeHtml(
                item.title
            )}"
                                loading="lazy"
                            >
                        `
            : `
                            <div class="poster-placeholder">
                                ${escapeHtml(
                item.title
            )}
                            </div>
                        `
        }

            </div>


            <div class="poster-info">

                <h4 class="poster-title">
                    ${escapeHtml(
            item.title
        )}
                </h4>


                <p class="poster-meta">
                    ${escapeHtml(
            getTypeMeta(
                item
            )
        )}
                </p>


                ${genres.length
            ? `
                            <div class="poster-genres">

                                ${genres
                .map(
                    genre => `
                                                <span class="poster-genre">
                                                    ${escapeHtml(
                        genre
                    )}
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
            formatRating(
                item
            )
        )}
                </p>


                <p class="poster-bottom">
                    ${escapeHtml(
            item.year ||
            "-"
        )}
                    ·
                    ${escapeHtml(
            formatProviderText(
                item
            )
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
   33. 카드 이미지 오류 처리
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
                                ${escapeHtml(
                            image.alt
                        )
                            }
                            </div>
                        `;
                    },
                    {
                        once:
                            true,
                    }
                );
            }
        );
}


/* =========================================================
   34. 카드 렌더링
========================================================= */

function findRecommendationItem(
    type,
    id
) {

    const numericId =
        Number(
            id
        );


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
                item =>
                    posterCard(
                        item
                    )
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
                                card.dataset
                                    .itemType,

                                card.dataset
                                    .itemId
                            );


                        if (
                            item
                        ) {

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
                            event.key ===
                            "Enter" ||
                            event.key ===
                            " "
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


    if (
        state.notice
    ) {

        clickHint.textContent =
            `${state.notice} ${getText().clickHint}`;

    } else {

        clickHint.textContent =
            getText().clickHint;
    }
}


/* =========================================================
   35. OTT 정보 병합
========================================================= */

function allStoredItems() {

    return [
        ...state.topRated,
        ...state.luckyPool,
        ...state.recent,
    ];
}


function applyProviderMap(
    providerMap
) {

    allStoredItems()
        .forEach(
            item => {

                const key =
                    `${item.type}:${item.id}`;


                if (
                    Object.prototype
                        .hasOwnProperty
                        .call(
                            providerMap,
                            key
                        )
                ) {

                    item.providers =
                        providerMap[
                        key
                        ];
                }
            }
        );
}


async function loadProvidersForItems(
    items
) {

    const missing =
        items
            .filter(
                item =>
                    !Array.isArray(
                        item.providers
                    )
            );


    if (
        missing.length ===
        0
    ) {
        return;
    }


    const data =
        await callApi({
            action:
                "providers",

            items:
                missing.map(
                    item => ({
                        id:
                            item.id,

                        type:
                            item.type,
                    })
                ),
        });


    applyProviderMap(
        data.providers ||
        {}
    );
}


/* =========================================================
   36. 추천 실행
========================================================= */

async function performRecommendation(
    useRefine = false
) {

    resultsSection.classList.remove(
        "hidden"
    );


    showLoading(
        useRefine
    );


    try {

        const data =
            await callApi(
                buildRecommendPayload(
                    useRefine
                )
            );


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


        /*
           추천 결과는 먼저 바로 표시.
           OTT 정보는 뒤에서 추가로 채웁니다.
        */
        renderAllResults();


        const visibleItems = [
            ...state.topRated,
            ...state.currentLucky,
            ...state.recent,
        ];


        try {

            await loadProvidersForItems(
                visibleItems
            );


            renderAllResults();


        } catch (
        providerError
        ) {

            console.error(
                "OTT 정보:",
                providerError
            );


            /*
               OTT 부가정보 실패 때문에
               추천 결과 전체를 실패시키지는 않음.
            */
            allStoredItems()
                .forEach(
                    item => {

                        if (
                            !Array.isArray(
                                item.providers
                            )
                        ) {

                            item.providers =
                                [];
                        }
                    }
                );


            renderAllResults();
        }


    } catch (
    error
    ) {

        console.error(
            error
        );


        const message =
            escapeHtml(
                getText().error
            );


        topRatedGrid.innerHTML = `
            <div class="loading-card">
                ${message}
            </div>
        `;


        luckyGrid.innerHTML = `
            <div class="loading-card">
                ${message}
            </div>
        `;


        recentGrid.innerHTML = `
            <div class="loading-card">
                ${message}
            </div>
        `;
    }
}


/* =========================================================
   37. 재추첨
========================================================= */

async function rerollLucky() {

    if (
        state.luckyPool.length ===
        0
    ) {
        return;
    }


    pickLucky();


    renderLucky();


    try {

        await loadProvidersForItems(
            state.currentLucky
        );


        renderLucky();


    } catch (
    error
    ) {

        console.error(
            error
        );


        state.currentLucky
            .forEach(
                item => {

                    if (
                        !Array.isArray(
                            item.providers
                        )
                    ) {

                        item.providers =
                            [];
                    }
                }
            );


        renderLucky();
    }
}


/* =========================================================
   38. 2차 분량 필터
========================================================= */

function renderRefineFilters() {

    const options =
        getRefineOptions();


    refineFilters.innerHTML =
        options
            .map(
                item => `
                    <button
                        class="
                            choice-button
                            ${state.selectedRefine ===
                        item.id
                        ? "active"
                        : ""
                    }
                        "
                        type="button"
                        data-refine="${item.id}"
                    >
                        ${escapeHtml(
                        getLabel(
                            item
                        )
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
                            button.dataset
                                .refine;


                        renderRefineFilters();
                    }
                );
            }
        );
}


/* =========================================================
   39. 국가 표시
========================================================= */

function formatCountries(
    countryCodes
) {

    if (
        !Array.isArray(
            countryCodes
        ) ||
        countryCodes.length ===
        0
    ) {

        return "-";
    }


    try {

        const displayNames =
            new Intl.DisplayNames(
                [
                    state.language ===
                        "ko"
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
                    displayNames.of(
                        code
                    ) ||
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


/* =========================================================
   40. 상세 팝업
========================================================= */

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


async function openDetailModal(
    item
) {

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


function renderDetailModal(
    detail
) {

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
            ? detail.providers.join(
                ", "
            )
            : text.noProvider;


    const extraInfo =
        [];


    if (
        detail.type ===
        "movie" &&
        detail.runtime
    ) {

        extraInfo.push(
            `${text.runtime} · ${detail.runtime}${text.minutes}`
        );
    }


    if (
        detail.type ===
        "series"
    ) {

        const status =
            getStatusLabel(
                detail.status
            );


        if (
            status
        ) {

            extraInfo.push(
                status
            );
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
                `${text.episodeCount} ${detail.episodes}${text.episodes}`
            );
        }
    }


    modalContent.innerHTML = `

        ${posterUrl
            ? `
                    <img
                        class="modal-poster"
                        src="${escapeHtml(
                posterUrl
            )}"
                        alt="${escapeHtml(
                detail.title
            )}"
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
                extraInfo.join(
                    " · "
                )
            )}
                    `
            : ""
        }

            <br>

            ${escapeHtml(
            formatRating(
                detail
            )
        )}

            <br>

            ${escapeHtml(
            detail.year ||
            "-"
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
   41. 한 / 영
========================================================= */

function renderLanguage() {

    const text =
        getText();


    document.documentElement.lang =
        state.language;


    document.title =
        state.language === "ko"
            ? "볼만한픽 | Pick to Watch"
            : "Pick to Watch | 볼만한픽";


    languageButton.textContent =
        text.languageButton;


    document
        .getElementById(
            "siteTitle"
        )
        .textContent =
        text.siteTitle;


    document
        .getElementById(
            "siteSubtitle"
        )
        .textContent =
        text.siteSubtitle;


    document
        .getElementById(
            "mediaTypeTitle"
        )
        .textContent =
        text.mediaTypeTitle;


    document
        .getElementById(
            "ottTitle"
        )
        .textContent =
        text.ottTitle;


    document
        .getElementById(
            "genreTitle"
        )
        .textContent =
        text.genreTitle;


    document
        .getElementById(
            "genreHint"
        )
        .textContent =
        text.genreHint;


    document
        .getElementById(
            "genreModeLabel"
        )
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
        .getElementById(
            "regionTitle"
        )
        .textContent =
        text.regionTitle;


    document
        .getElementById(
            "regionHint"
        )
        .textContent =
        text.regionHint;


    document
        .getElementById(
            "yearTitle"
        )
        .textContent =
        text.yearTitle;


    pickButton.textContent =
        text.pick;


    document
        .getElementById(
            "resultsTitle"
        )
        .textContent =
        text.resultsTitle;


    document
        .getElementById(
            "clickHint"
        )
        .textContent =
        state.notice
            ? `${state.notice} ${text.clickHint}`
            : text.clickHint;


    document
        .getElementById(
            "topRatedTitle"
        )
        .textContent =
        text.topRatedTitle;


    document
        .getElementById(
            "topRatedDescription"
        )
        .textContent =
        text.topRatedDescription;


    document
        .getElementById(
            "luckyTitle"
        )
        .textContent =
        text.luckyTitle;


    document
        .getElementById(
            "luckyDescription"
        )
        .textContent =
        text.luckyDescription;


    document
        .getElementById(
            "recentTitle"
        )
        .textContent =
        text.recentTitle;


    document
        .getElementById(
            "recentDescription"
        )
        .textContent =
        text.recentDescription;


    rerollButton.textContent =
        text.reroll;


    document
        .getElementById(
            "refineTitle"
        )
        .textContent =
        text.refineTitle;


    document
        .getElementById(
            "refineDescription"
        )
        .textContent =
        text.refineDescription;


    refineButton.textContent =
        text.refinePick;


    document
        .getElementById(
            "sourceText"
        )
        .textContent =
        text.sourceText;


    document
        .getElementById(
            "privacyLink"
        )
        .textContent =
        text.privacy;


    document
        .getElementById(
            "supportLink"
        )
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
   42. 이벤트
========================================================= */

function setupLanguageButton() {

    languageButton.addEventListener(
        "click",
        async () => {

            state.language =
                state.language === "ko"
                    ? "en"
                    : "ko";


            closeDetailModal();


            const hadResults =
                !resultsSection
                    .classList
                    .contains(
                        "hidden"
                    );


            renderLanguage();


            /*
               TMDB 제목/overview도 언어별로 받아야 하므로
               결과가 이미 있었다면 같은 조건으로 다시 요청.
            */
            if (
                hadResults
            ) {

                await performRecommendation(
                    state.selectedRefine !==
                    "all"
                );
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


            await performRecommendation(
                false
            );


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
        async () => {

            await rerollLucky();
        }
    );
}


function setupRefineButton() {

    refineButton.addEventListener(
        "click",
        async () => {

            await performRecommendation(
                true
            );
        }
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
                event.key ===
                "Escape" &&
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
   43. 시작
========================================================= */

setupGenreMode();
setupLanguageButton();
setupPickButton();
setupRerollButton();
setupRefineButton();
setupModal();

renderLanguage();