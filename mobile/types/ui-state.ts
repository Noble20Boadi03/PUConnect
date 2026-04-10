/**
 * UiState — the TypeScript equivalent of a Kotlin sealed class.
 *
 * Each screen's ViewModel exposes a single UiState<T> value that
 * the UI renders exhaustively. This is the single source of truth
 * for all screen state, replacing scattered loading/error/data booleans.
 *
 * Usage:
 *   type HomeUiState = UiState<HomeDashboardData>;
 *   const [uiState, setUiState] = useState<HomeUiState>({ status: 'loading' });
 */
export type UiState<T> =
    | { status: 'loading' }
    | { status: 'content'; data: T; isRefreshing?: boolean }
    | { status: 'error'; message: string }
    | { status: 'empty' };
