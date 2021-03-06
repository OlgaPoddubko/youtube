const service = require('./youtubeService');
const pagination = require('./newPagination');

let nextPageToken;
let itemsNumber = 0;

function fillSection(item, publishDate, views) {
  const tmpl = '<div class="thumbnail">' +
        '<a href="http://www.youtube.com/watch?v=<%=id.videoId%>" class="link">' +
        '<img src="<%=snippet.thumbnails.medium.url%>" alt="" width="100%" height="auto">' +
        '<i class="fa fa-play-circle" aria-hidden="true"></i>' +
        '</a>' +
        '</div>' +
        '<div class="information">' +
        '<h2><a href="http://www.youtube.com/watch?v=<%=id.videoId%>" class="link title"><%=snippet.title%></a></h2>' +
        '<ul>' +
        '<li class="cannel"><i class="fa fa-user" aria-hidden="true"></i><%=snippet.channelTitle%></li>' +
        '<li class="published-at"><i class="fa fa-calendar" aria-hidden="true"></i></li>' +
        '<li class="views"><i class="fa fa-eye" aria-hidden="true"></i></li>' +
        '</ul>' +
        '<p class="description"><%=snippet.description%></p>' +
        '</div>';

  const gallery = document.body.querySelector('.gallery');
  const newSection = document.createElement('section');
  newSection.innerHTML = _.template(tmpl)(item);

  newSection.querySelector('.published-at').insertAdjacentText('beforeEnd', publishDate);
  newSection.querySelector('.views').insertAdjacentText('beforeEnd', views);
  gallery.appendChild(newSection);
}

function addSection(resp) {
  const items = resp.items;
  itemsNumber += items.length;

  for (let i = 1; i < items.length; i += 1) {
    const item = resp.items[i];

    const date = new Date(Date.parse(item.snippet.publishedAt));
    let day = date.getDate();
    if (day < 10) {
      day = `0${day}`;
    }
    let month = date.getMonth() + 1;
    if (month < 10) {
      month = `0${month}`;
    }
    const publishDate = (`${day}.${month}.${date.getFullYear()}`);

    const videoId = item.id.videoId;
    service.videoStatistics(videoId).then((response) => {
      const views = response.items[0].statistics.viewCount;
      fillSection(item, publishDate, views);
    }).catch((error) => {
      console.warn(error);
    });
  }
  nextPageToken = resp.nextPageToken;
}


function renderMain(resp) {
  let tmpl;
  const items = resp.items;

  if (items.length === 0) {
    tmpl = '<p class="empty-result">Sorry, no items to your query :(</p>';
  } else {
    tmpl = '<div class="main-inner">' +
            '<div class="gallery">' +
            '</div>' +
            '</div>' +
            '<div class="paging">' +
            '<span class="page curr"><span class="tooltip">1</span></span>' +
            '<span class="page next"><span class="tooltip">2</span></span>' +
            '</div>';
  }

  const main = document.body.querySelector('main');
  main.innerHTML = _.template(tmpl)();

  addSection(resp);
  pagination.pagination(nextPageToken, itemsNumber);
}

module.exports.renderMain = renderMain;
module.exports.addSection = addSection;
