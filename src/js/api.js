import axios from 'axios';

const API_KEY = '36855229-dc07620e38f9e8d214dc0242a';

const fetchData = async (searchQuery, page) => {
  const { data } = await axios.get('https://pixabay.com/api/', {
    params: {
      key: API_KEY,
      q: searchQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page,
      per_page: 40,
    },
  });

  const { hits: images, totalHits } = data;

  return {
    images,
    totalHits,
  };
};

export { fetchData };
