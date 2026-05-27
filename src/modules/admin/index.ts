export { useAdminCatalog } from './composables/useAdminCatalog'
export {
  getPlatformIcon,
  getRequiredTagTypes,
  getTagRuleText,
  getTagRuleTextKey,
  getTagTypeLabel,
  getTagTypeLabelKey,
  getTagTypeName,
  getTagTypeValidationMessage,
  getTagTypeValidationMessageKey,
  isSingleSelectTagType,
  normalizeTagTypeName,
  toAdminTag,
} from './lib/tags'
export type {
  AdminGame,
  AdminGameFormPayload,
  AdminGameImage,
  AdminGameListParams,
  AdminGameListItem,
  AdminGameListTag,
  AdminGameRating,
  AdminGameTag,
  AdminGameUpdatePayload,
  AdminGameVideo,
  AdminPaginationState,
  AdminTag,
  AdminTagListParams,
  AdminTagPayload,
  AdminTagType,
  AdminTagTypeSummary,
} from './types/admin'
export { default as AdminGameCard } from './ui/AdminGameCard.vue'
export { default as AdminGameEditDialog } from './ui/AdminGameEditDialog.vue'
export { default as AdminGameForm } from './ui/AdminGameForm.vue'
export { default as AdminGameImageManager } from './ui/AdminGameImageManager.vue'
export { default as AdminGameList } from './ui/AdminGameList.vue'
export { default as AdminGameTagSelector } from './ui/AdminGameTagSelector.vue'
export { default as AdminImagePicker } from './ui/AdminImagePicker.vue'
export { default as AdminSearchField } from './ui/AdminSearchField.vue'
export { default as AdminShell } from './ui/AdminShell.vue'
export { default as AdminTagBoard } from './ui/AdminTagBoard.vue'
