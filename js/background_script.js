console.log("execute background script")

/**
 * 탭의 정보를 가져와야 하는 작업은 백그라운드 스크립트에서 처리
 * 콘텐츠 페이지의 정보를 출력하거나 콘텐츠 페이지의 정로를 얻어서 처리해야 하는 작업은 콘텐츠 스크립트에서 처리
 */

/* ------------------------------ 상수정의 ------------------------------ */
const SEARCH_NAVER_REGEXP = new RegExp(/^https:\/\/search\.naver\.com/)
const BLOG_NAVER_REGEXP = new RegExp(/^https:\/\/blog\.naver\.com/)
const SEARCH_XEARCH_REGEXP = new RegExp(/\where\=nexearch/)
const SEARCH_VIEW_REGEXP = new RegExp(/\where\=view/)
const SEARCH_BLOG_REGEXP = new RegExp(/\where\=blog/)

const SEARCH_XEARCH_CODE = "_search_xearch"
const SEARCH_VIEW_CODE = "_search_view_all"
const SEARCH_BLOG_CODE = "_search_view_blog"
const BLOG_NAVER_CODE = "_blog_naver"

let HOST = "http://127.0.0.1:8080/"

/* ------------------------------ 변수정의 ------------------------------ */
let showSearchNaverPopupRule = {
    conditions: [
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'search.naver.com', schemes: ['https'] }
        })
    ],
    actions: [ new chrome.declarativeContent.ShowPageAction() ]
}

let showBlogNaverPopupRule = {
    conditions: [
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'blog.naver.com', schemes: ['https'] }
        })
    ],
    actions: [ new chrome.declarativeContent.ShowPageAction() ]
}


/* ------------------------------ 이벤트처리기 ------------------------------ */
chrome.runtime.onInstalled.addListener(function(details) {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([showSearchNaverPopupRule, showBlogNaverPopupRule]);
    })
})

chrome.pageAction.onClicked.addListener(tab => {

    let current_tab_id = tab.id
    let current_tab_url = tab.url
    let tab_code = getTabCode(current_tab_url)

    if (tab_code === SEARCH_XEARCH_CODE || tab_code === SEARCH_VIEW_CODE || tab_code === SEARCH_BLOG_CODE) {
        chrome.pageAction.setPopup({tabId: current_tab_id, popup: "search_naver_popup.html"})
    }
    if (tab_code === BLOG_NAVER_CODE) {
        chrome.pageAction.setPopup({tabId: current_tab_id, popup: "blog_naver_popup.html"})
    }

    console.log(tab_code)
})

chrome.tabs.onUpdated.addListener(tabId => {

    chrome.tabs.get(tabId, updateTab => {
        let updateTabUrl = updateTab.url
        let tabCode = getTabCode(updateTabUrl);

        console.log(updateTabUrl)

        chrome.tabs.sendMessage(tabId, {
            message: "tabCode",
            code: tabCode,
            url: updateTabUrl
        })

        // getAnalyzedInfo()
    })
})

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.message === "urlData") {
//
//     }
// })

/* ------------------------------ 함수정의 ------------------------------ */
let getTabCode = (current_url) => {
    let code

    if (SEARCH_NAVER_REGEXP.test(current_url)) {
        if (SEARCH_XEARCH_REGEXP.test(current_url)) {
            code = SEARCH_XEARCH_CODE
            return code
        }
        if (SEARCH_VIEW_REGEXP.test(current_url)) {
            code = SEARCH_VIEW_CODE
            return code
        }
        if (SEARCH_BLOG_REGEXP.test(current_url)) {
            code = SEARCH_BLOG_CODE
            return code
        }
    }
    if (BLOG_NAVER_REGEXP.test(current_url)) {
        code = BLOG_NAVER_CODE
        return code
    }
}

let getAnalyzedInfo = () => {
    let xhr = new XMLHttpRequest();

    // After server sent data, below code will run
    xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 201){
            const received_arr = JSON.parse(xhr.response)
            received_arr.forEach(function(elem){
                let status = elem.status;
                let message = elem.message;
                console.log('Status : ' + status + ', message : ' + message)

            });
        } else {
            alert('ERROR : ' + xhr.responseText);
            console.error(xhr.responseText);
        }
    }

/*    let request_url = HOST + 'myapp/user/analyzedinfo/get'

    xhr.open("POST", request_url)
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")

    // Send JSON array
    xhr.send(dataJSON);*/
}