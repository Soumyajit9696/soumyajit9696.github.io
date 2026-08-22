(function () {
  const blogUrl = 'https://sci-tech-science.blogspot.com';
  const postsContainer = document.getElementById('blogger-posts');

  if (!postsContainer) return;

  const getPostLink = (post) => {
    const alternateLink = (post.link || []).find((link) => link.rel === 'alternate');
    return alternateLink ? alternateLink.href : blogUrl;
  };

  const getExcerpt = (html) => {
    const content = document.createElement('div');
    content.innerHTML = html || '';
    content.querySelectorAll('style, script, noscript, iframe, svg, template').forEach((element) => element.remove());
    const text = (content.textContent || content.innerText || '').replace(/\s+/g, ' ').trim();
    return text.length > 150 ? `${text.slice(0, 147)}...` : text;
  };

  const createPost = (post, index) => {
    const postUrl = getPostLink(post);
    const title = post.title && post.title.$t ? post.title.$t : 'Untitled post';
    const published = new Date(post.published.$t);
    const tags = (post.category || []).slice(0, 2).map((category) => category.term);
    const image = post.media$thumbnail && post.media$thumbnail.url
      ? post.media$thumbnail.url.replace(/\/s\d+-c\//, '/s600/')
      : `images/blog/${index + 1}.jpg`;
    const postElement = document.createElement('div');

    postElement.className = 'blog-item padd-15';
    postElement.innerHTML = `
      <div class="blog-item-inner shadow-dark">
        <div class="blog-img">
          <img src="${image}" alt="">
          <div class="blog-date">${published.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
        <div class="blog-info">
          <h4 class="blog-title"></h4>
          <p class="blog-description"></p>
          <p class="blog-tags">Tags : </p>
        </div>
      </div>`;

    postElement.querySelector('.blog-title').textContent = title;
    postElement.querySelector('.blog-description').textContent = getExcerpt(post.content && post.content.$t);
    const tagsElement = postElement.querySelector('.blog-tags');
    const displayTags = tags.length ? tags : ['Blogger'];
    displayTags.forEach((tag, tagIndex) => {
      const tagLink = document.createElement('a');
      tagLink.href = postUrl;
      tagLink.target = '_blank';
      tagLink.rel = 'noopener';
      tagLink.textContent = tag;
      tagsElement.appendChild(tagLink);
      if (tagIndex < displayTags.length - 1) tagsElement.append(' , ');
    });

    postElement.querySelector('.blog-item-inner').addEventListener('click', (event) => {
      if (event.target.closest('.blog-img, .blog-title')) window.open(postUrl, '_blank', 'noopener');
    });

    return postElement;
  };

  const showError = () => {
    postsContainer.textContent = 'Unable to load the latest blog posts right now.';
  };

  window.bloggerPostsCallback = (data) => {
    const posts = data.feed && data.feed.entry ? data.feed.entry.slice(0, 3) : [];
    postsContainer.replaceChildren(...posts.map(createPost));
  };

  const feedScript = document.createElement('script');
  feedScript.src = `${blogUrl}/feeds/posts/default?alt=json-in-script&max-results=3&callback=bloggerPostsCallback`;
  feedScript.onerror = showError;
  document.body.appendChild(feedScript);
}());