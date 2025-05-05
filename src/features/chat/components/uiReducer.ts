export interface UIState {
  replyingMessage: any | null
  showMediaUploader: boolean
  showDocsUploader: boolean
  showHeaderOptions: boolean
  showWallpaperEditor: boolean
  wallpaperUrl: string | null
}
  
export const uiInitial: UIState = {
  replyingMessage: null,
  showMediaUploader: false,
  showDocsUploader: false,
  showHeaderOptions: false,
  showWallpaperEditor: false,
  wallpaperUrl: null
}
  
export type UIAction =
  | { type: 'SET_REPLY'; payload: any | null }
  | { type: 'TOGGLE_MEDIA_UPLOADER' }
  | { type: 'TOGGLE_DOCS_UPLOADER' }
  | { type: 'TOGGLE_HEADER_OPTIONS' }
  | { type: 'TOGGLE_WALLPAPER_EDITOR' }
  | { type: 'SET_WALLPAPER'; payload: string }
  
export function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_REPLY':
      return { ...state, replyingMessage: action.payload }
    case 'TOGGLE_MEDIA_UPLOADER':
      return { ...state, showMediaUploader: !state.showMediaUploader }
    case 'TOGGLE_DOCS_UPLOADER':
      return { ...state, showDocsUploader: !state.showDocsUploader }
    case 'TOGGLE_HEADER_OPTIONS':
      return { ...state, showHeaderOptions: !state.showHeaderOptions }
    case 'TOGGLE_WALLPAPER_EDITOR':
      return { ...state, showWallpaperEditor: !state.showWallpaperEditor }
    case 'SET_WALLPAPER':
      localStorage.setItem('chatWallpaper', action.payload)
      return { ...state, wallpaperUrl: action.payload }
    default:
      return state
  }
}