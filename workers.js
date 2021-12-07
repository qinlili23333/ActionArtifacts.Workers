addEventListener("fetch", (event) => {
    event.respondWith(
        handleRequest(event.request).catch(
            (err) => new Response(err.stack, { status: 500 })
        )
    );
});
async function handleRequest(request) {
    let url = new URL(request.url);
    const { pathname } = new URL(request.url);
    var owner = url.searchParams.get("owner");
    var repo = url.searchParams.get("repo");
    if (!(owner && repo)) {
        return new Response('参数不完整', { status: 400 })
    }
    var link = await fileToLink(owner, repo);
    if (pathname.startsWith("/directlink")) {
        if (link) {
            return fetch(link, {
                "headers": {
                  "User-Agent":"Cloudflare Workers",
                    "Authorization": "token 你的token"
                },
                redirect: "manual"
            })
        } else {
            return new Response('文件不存在', { status: 404 })
        }
    }
    if (pathname.startsWith("/proxylink")) {
        if (link) {
            return fetch(link, {
                "headers": {
                  "User-Agent":"Cloudflare Workers",
                    "Authorization": "token 你的token"
                }
            })
        } else {
            return new Response('文件不存在', { status: 404 })
        }
    }
    return new Response('不支持的URL请求', { status: 404 })
}

async function fileToLink(owner, repo) {
    jsonurl = "https://api.github.com/repos/" + owner + "/" + repo + "/actions/artifacts"
    const response = await fetch(jsonurl, {
        "headers": {
          "User-Agent":"Cloudflare Workers",
            "Authorization": "token 你的token"
        },
    });
    jsonFile = await response.text()
    jsonText = JSON.parse(jsonFile);
    return jsonText.artifacts[0].archive_download_url;
}
