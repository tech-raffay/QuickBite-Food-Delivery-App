import axios from 'axios';

const MEAL_API_BASE = 'https://www.themealdb.com/api/json/v1/1';
const DUMMY_JSON_BASE = 'https://dummyjson.com/products';

// Mapping grocery products from DummyJSON to stunning premium Restaurant cards
const REST_UNSPLASH_PHOTOS = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80', // Cozy bistro
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&auto=format&fit=crop&q=80', // Fine dining
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80', // Italian kitchen
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', // Steakhouse
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80', // Gourmet burger
  'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&auto=format&fit=crop&q=80', // Asian wok
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80', // Coffee bar
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80', // Salad and healthy bowl
];

const mapProductToRestaurant = (product, index) => {
  const titles = [
    'The Gourmet Steakhouse',
    'La Piazza Bella',
    'Chopstick House',
    'Burger & Craft Beer Co.',
    'Green & Fresh Salads',
    'Sweet Treats & Gelato',
    'Spice Garden Indian',
    'Taco Loco Grill',
  ];
  
  const selectedName = titles[index % titles.length] + ` (${product.title})`;
  const photo = REST_UNSPLASH_PHOTOS[index % REST_UNSPLASH_PHOTOS.length];
  
  return {
    id: `rest-${product.id}`,
    name: selectedName,
    rating: parseFloat(product.rating.toFixed(1)) || 4.2,
    address: `${product.id * 12 + 10} Foodie Street, Sector ${product.id % 5 + 1}`,
    image: photo,
    openingHours: '09:00 AM - 10:00 PM',
    distance: `${(product.id % 4 + 1.2).toFixed(1)} km`,
    deliveryTime: `${product.id % 15 + 20} mins`,
    deliveryFee: `$${(product.price % 3 + 1.99).toFixed(2)}`,
  };
};

export const fetchMeals = async (searchQuery = '') => {
  try {
    const response = await axios.get(`${MEAL_API_BASE}/search.php?s=${searchQuery}`);
    if (response.data && response.data.meals) {
      return response.data.meals.map((meal) => ({
        id: meal.idMeal,
        name: meal.strMeal,
        category: meal.strCategory,
        image: meal.strMealThumb,
        instructions: meal.strInstructions,
        ingredients: extractIngredients(meal),
        // Add artificial price/rating for premium visuals
        price: parseFloat((10 + (parseInt(meal.idMeal) % 15) + 0.99).toFixed(2)),
        rating: parseFloat((4 + (parseInt(meal.idMeal) % 10) / 10).toFixed(1)),
        deliveryTime: `${15 + (parseInt(meal.idMeal) % 25)} mins`,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching meals:', error);
    throw error;
  }
};

export const fetchMealDetails = async (mealId) => {
  try {
    const response = await axios.get(`${MEAL_API_BASE}/lookup.php?i=${mealId}`);
    if (response.data && response.data.meals && response.data.meals[0]) {
      const meal = response.data.meals[0];
      return {
        id: meal.idMeal,
        name: meal.strMeal,
        category: meal.strCategory,
        image: meal.strMealThumb,
        instructions: meal.strInstructions,
        ingredients: extractIngredients(meal),
        price: parseFloat((10 + (parseInt(meal.idMeal) % 15) + 0.99).toFixed(2)),
        rating: parseFloat((4 + (parseInt(meal.idMeal) % 10) / 10).toFixed(1)),
        deliveryTime: `${15 + (parseInt(meal.idMeal) % 25)} mins`,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching meal details:', error);
    throw error;
  }
};

export const fetchRestaurants = async () => {
  try {
    const response = await axios.get(`${DUMMY_JSON_BASE}/category/groceries`);
    if (response.data && response.data.products) {
      return response.data.products.map((product, idx) => mapProductToRestaurant(product, idx));
    }
    return [];
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    // Return custom mock restaurants as safe fallback
    return Array.from({ length: 6 }).map((_, idx) => mapProductToRestaurant({
      id: idx + 100,
      title: ['Beef', 'Chicken', 'Veggies', 'Desserts', 'Beverages', 'Pancakes'][idx],
      rating: 4.3 + (idx % 3) * 0.2,
      price: 15.99,
    }, idx));
  }
};

// Helper function to extract ingredients & measures from TheMealDB API response structure
const extractIngredients = (meal) => {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim() !== '') {
      ingredients.push({
        name: name.trim(),
        measure: measure ? measure.trim() : '',
      });
    }
  }
  return ingredients;
};
