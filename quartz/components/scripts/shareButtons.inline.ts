document.addEventListener("nav", () => {
  const twitterBtn = document.getElementById("share-twitter") as HTMLAnchorElement | null
  const linkedinBtn = document.getElementById("share-linkedin") as HTMLAnchorElement | null
  if (!twitterBtn && !linkedinBtn) return

  const url = window.location.href
  const title = document.querySelector("h1.article-title")?.textContent ?? document.title

  if (twitterBtn) {
    twitterBtn.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  }
  if (linkedinBtn) {
    linkedinBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  }
})
