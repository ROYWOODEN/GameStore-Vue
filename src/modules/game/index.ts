export { useGame } from './composables/useGame'
export { useGameReviews } from './composables/useGameReviews'
export { useGameSearch } from './composables/useGameSearch'
export { useGames } from './composables/useGames'
export { fetchCatalogGenres } from './api/games.api'
export type {
  CatalogGenre,
  CatalogGenreCover,
  Game,
  GameImage,
  GameListItem,
  GameListParams,
  GameListTag,
  GameListTagType,
  GameMedia,
  GamePaginationState,
  GameRating,
  GameSearchTag,
  GameTag,
  GameTagType,
  GameTagTypeWithTags,
  GameVideo,
} from './types/game'
export type { GameDetailMediaItem } from './types/media'
export type { GameReview, GameReviewPayload, GameReviewUser } from './types/review'
export { default as GameCardGrid } from './ui/GameCardGrid.vue'
export { default as GameCardItem } from './ui/GameCardItem.vue'
export { default as GameSearchFilters } from './ui/GameSearchFilters.vue'
export { default as HeaderGameSearch } from './ui/HeaderGameSearch.vue'
