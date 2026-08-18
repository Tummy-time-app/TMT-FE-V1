/** Shared between the onboarding preferences step and the profile page —
 *  keep these two option lists from drifting apart. */
export const dietaryOptions = [
  "Vegetarian",
  "Vegan",
  "Halal",
  "Kosher",
  "Gluten-free",
  "No restrictions",
] as const;

export const cuisineOptions = [
  "Nigerian",
  "Italian",
  "Chinese",
  "Indian",
  "Fast food",
  "Continental",
  "Seafood",
  "Desserts & bakery",
] as const;
