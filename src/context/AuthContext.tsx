import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Profile } from "../types";

export type AuthOperation = "sign-in" | "sign-out" | null;

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authOperation: AuthOperation;
  isAuthOperationPending: boolean;
  profile: Profile | null;
  profileLoading: boolean;
  profileError: string | null;
  refreshProfile: () => Promise<void>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  authOperation: null,
  isAuthOperationPending: false,
  profile: null,
  profileLoading: false,
  profileError: null,
  refreshProfile: async () => {},
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {}
});

// ─── Mock para testes E2E (VITE_USE_MOCK_AUTH=true) ─────────────────────────
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === "true";
const USE_LOCAL_TEST_LOGIN =
  import.meta.env.VITE_USE_LOCAL_TEST_LOGIN === "true";
const LOCAL_TEST_EMAIL = import.meta.env.LOCAL_TEST_EMAIL as string | undefined;
const LOCAL_TEST_PASSWORD = import.meta.env.LOCAL_TEST_PASSWORD as
  | string
  | undefined;
const AUTH_OVERLAY_MIN_DURATION_MS = 3000;

function wait(ms: number) {
  return new Promise(resolve => {
    window.setTimeout(resolve, ms);
  });
}

const MOCK_USER = {
  id: "mock-user-id",
  email: "morador@maayan.app",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: "2026-01-01T00:00:00Z"
} as unknown as User;

const MOCK_PROFILE: Profile = {
  id: "mock-user-id",
  full_name: "Morador Teste",
  email: "morador@maayan.app",
  whatsapp: "(11) 99999-9999",
  block: "A",
  apartment: "101",
  role: "resident",
  status: "approved",
  created_at: "2026-01-01T00:00:00Z"
};
// ─────────────────────────────────────────────────────────────────────────────

async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, whatsapp, block, apartment, role, status, created_at"
    )
    .eq("id", userId)
    .single();

  // Perfil ainda não criado para o usuário: trata como ausência temporária de dados.
  if (error?.code === "PGRST116") return null;
  if (error) throw error;

  return (data as Profile | null) ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(USE_MOCK ? MOCK_USER : null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [authOperation, setAuthOperation] = useState<AuthOperation>(null);
  const [profile, setProfile] = useState<Profile | null>(
    USE_MOCK ? MOCK_PROFILE : null
  );
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const profileRef = useRef<Profile | null>(profile);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const loadProfile = useCallback(
    async (userId: string, showBlockingLoading: boolean) => {
      if (USE_MOCK || !userId) return;

      if (showBlockingLoading) {
        setProfileLoading(true);
      }
      setProfileError(null);

      try {
        const loadedProfile = await fetchProfile(userId);
        setProfile(loadedProfile);
      } catch (error) {
        // Não limpa profile em erro temporário: mantém UI estável.
        setProfileError(
          error instanceof Error ? error.message : "Falha ao carregar perfil."
        );
      } finally {
        if (showBlockingLoading) {
          setProfileLoading(false);
        }
      }
    },
    []
  );

  const refreshProfile = useCallback(async () => {
    if (USE_MOCK || !user?.id) return;

    // Se já temos profile, revalida sem loader bloqueante.
    const shouldBlockUI = !profileRef.current;
    await loadProfile(user.id, shouldBlockUI);
  }, [loadProfile, user?.id]);

  useEffect(() => {
    if (USE_MOCK) return; // não chama Supabase em modo mock

    let isMounted = true;

    // Restore session on mount (loading inicial)
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;

      switch (event) {
        case "INITIAL_SESSION":
        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
        case "USER_UPDATED":
          // Atualiza sessão/usuário sem reset agressivo da UI.
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setLoading(false);
          break;

        case "SIGNED_OUT":
          // Logout: limpa tudo de forma explícita.
          setSession(null);
          setUser(null);
          setProfile(null);
          setProfileError(null);
          setProfileLoading(false);
          setLoading(false);
          break;

        default:
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setLoading(false);
          break;
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Carrega perfil quando id do usuário muda.
  useEffect(() => {
    if (USE_MOCK) return;

    const userId = user?.id;

    if (!userId) {
      setProfile(null);
      setProfileError(null);
      setProfileLoading(false);
      return;
    }

    const shouldBlockUI = !profileRef.current;
    void loadProfile(userId, shouldBlockUI);
  }, [loadProfile, user?.id]);

  const signUp = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    if (USE_MOCK) {
      setUser({ ...MOCK_USER, email } as User);
      setProfile({ ...MOCK_PROFILE, email });
      setSession(null);
      setLoading(false);
      return { error: null };
    }

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    setAuthOperation("sign-in");
    const startedAt = Date.now();

    try {
      if (
        USE_LOCAL_TEST_LOGIN &&
        LOCAL_TEST_EMAIL &&
        LOCAL_TEST_PASSWORD &&
        email === LOCAL_TEST_EMAIL &&
        password === LOCAL_TEST_PASSWORD
      ) {
        setUser({ ...MOCK_USER, email } as User);
        setProfile({ ...MOCK_PROFILE, email });
        setSession(null);
        setLoading(false);
        return { error: null };
      }

      if (USE_MOCK) {
        setUser({ ...MOCK_USER, email } as User);
        setProfile({ ...MOCK_PROFILE, email });
        setSession(null);
        setLoading(false);
        return { error: null };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) return { error: error.message };
      return { error: null };
    } finally {
      const elapsed = Date.now() - startedAt;
      const remaining = AUTH_OVERLAY_MIN_DURATION_MS - elapsed;
      if (remaining > 0) {
        await wait(remaining);
      }
      setAuthOperation(null);
    }
  };

  const signOut = async () => {
    setAuthOperation("sign-out");
    const startedAt = Date.now();

    try {
      if (USE_MOCK) {
        setSession(null);
        setUser(null);
        setProfile(null);
        setProfileError(null);
        setProfileLoading(false);
        setLoading(false);
        return;
      }

      await supabase.auth.signOut();
    } finally {
      const elapsed = Date.now() - startedAt;
      const remaining = AUTH_OVERLAY_MIN_DURATION_MS - elapsed;
      if (remaining > 0) {
        await wait(remaining);
      }
      setAuthOperation(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        authOperation,
        isAuthOperationPending: authOperation !== null,
        profile,
        profileLoading,
        profileError,
        refreshProfile,
        signUp,
        signIn,
        signOut
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
