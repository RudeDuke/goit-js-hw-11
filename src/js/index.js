import { fetchData } from './api.js';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const endOfGallery = document.querySelector('.end-of-gallery');

let page;
let allHits;
let loadedHits;
let searchQuery = '';

let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

// FUNCTION TO CREATE A MARK-UP FOR THE IMAGES

const makeMarkup = images => {
  images.forEach(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => {
      const html = `
      <div class="card">
        <a href="${largeImageURL}">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
        <div class="card-info">
          <div class="card-info-item">
            <b>Likes:</b>
            <span>${likes}</span>
          </div>
          <div class="card-info-item">
            <b>Views:</b>
            <span>${views}</span>
          </div>
          <div class="card-info-item">
            <b>Comments:</b>
            <span>${comments}</span>
          </div>
          <div class="card-info-item">
            <b>Downloads:</b>
            <span>${downloads}</span>
          </div>
        </div>
      </div>
    `;

      gallery.insertAdjacentHTML('beforeend', html);
    }
  );
};

// FUNCTION FOR SMOOTH SCROLLING

const scroll = () => {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
};

// FUNCTION TO GET THE FIRST GROUP OF IMAGES

const findImages = async event => {
  event.preventDefault();
  searchQuery = event.target.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    Notiflix.Notify.failure(
      'You left the search field empty. Please write something in.'
    );
    return;
  }

  try {
    const { images, totalHits: hits } = await fetchData(searchQuery, 1);
    allHits = hits;
    gallery.innerHTML = '';

    if (images.length === 0) {
      Notiflix.Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      searchForm.reset();

    } else {
      makeMarkup(images);
      lightbox.refresh();
      loadedHits = images.length;
      Notiflix.Notify.success(`Hooray! We found ${allHits} images.`);
    }

  } catch (error) {
    console.log(error);
    Notiflix.Notify.failure('An error occurred. Please try again later.');
  }
};

searchForm.addEventListener('submit', findImages);

// FUNCTION TO LOAD THE NEXT GROUP OF IMAGES WHEN THE BOTTOM IS REACHED

const loadMore = async entries => {
  entries.forEach(async entry => {
    if (entry.isIntersecting && loadedHits < allHits) {
      page += 1;
      try {
        const { images } = await fetchData(searchQuery, page);
        makeMarkup(images);
        lightbox.refresh();
        loadedHits += images.length;
        scroll();
      } catch (error) {
        console.log(error);
        Notiflix.Notify.failure('An error occurred. Please try again later.');
      }
    } else if (entry.isIntersecting && searchQuery && loadedHits === allHits) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  });
};



// ATTACHING A TRACKER WHICH SHOULD DETECT THE BOTTOM

const observerOptions = {
  root: null,
  rootMargin: '30px',
  threshold: 1.0,
};
const observer = new IntersectionObserver(loadMore, observerOptions);
observer.observe(endOfGallery);

// ANCHOR TO SCROLL-UP

const scrollToTop = document.querySelector('.scroll-to-top');

window.addEventListener('scroll', () => {
  const shouldShow = window.pageYOffset > 100;
  scrollToTop.classList.toggle('show', shouldShow);
});


scrollToTop.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
});
