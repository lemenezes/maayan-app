import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";

interface LoadingOverlayContextValue {
  visible: boolean;
  message: string | null;
  showLoading: (message: string) => void;
  hideLoading: () => void;
  withLoading: <T>(message: string, action: () => Promise<T>) => Promise<T>;
}

const LoadingOverlayContext = createContext<LoadingOverlayContextValue>({
  visible: false,
  message: null,
  showLoading: () => {},
  hideLoading: () => {},
  withLoading: async (_message, action) => action()
});

export function LoadingOverlayProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [activeCount, setActiveCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const showLoading = useCallback((nextMessage: string) => {
    setMessage(nextMessage);
    setActiveCount(prev => prev + 1);
  }, []);

  const hideLoading = useCallback(() => {
    setActiveCount(prev => {
      const nextCount = Math.max(0, prev - 1);
      if (nextCount === 0) {
        setMessage(null);
      }
      return nextCount;
    });
  }, []);

  const withLoading = useCallback(
    async <T,>(nextMessage: string, action: () => Promise<T>): Promise<T> => {
      showLoading(nextMessage);
      try {
        return await action();
      } finally {
        hideLoading();
      }
    },
    [hideLoading, showLoading]
  );

  const value = useMemo(
    () => ({
      visible: activeCount > 0,
      message,
      showLoading,
      hideLoading,
      withLoading
    }),
    [activeCount, hideLoading, message, showLoading, withLoading]
  );

  return (
    <LoadingOverlayContext.Provider value={value}>
      {children}
    </LoadingOverlayContext.Provider>
  );
}

export const useLoadingOverlay = () => useContext(LoadingOverlayContext);
