export default {
  async fetch(request, env) {
    let response = await env.ASSETS.fetch(request)

    if (response.status === 404 && !new URL(request.url).pathname.includes('.')) {
      const indexUrl = new URL(request.url)
      indexUrl.pathname = '/index.html'
      response = await env.ASSETS.fetch(new Request(indexUrl, request))
    }

    return response
  },
}
