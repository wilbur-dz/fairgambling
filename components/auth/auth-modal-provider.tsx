"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ModalState =
  | { type: "closed" }
  | { type: "login" }
  | { type: "register" };

type AuthModalContextValue = {
  modalState: ModalState;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<ModalState>({ type: "closed" });

  const openLoginModal = useCallback(() => {
    setModalState({ type: "login" });
  }, []);

  const openRegisterModal = useCallback(() => {
    setModalState({ type: "register" });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ type: "closed" });
  }, []);

  const value = useMemo(
    () => ({
      modalState,
      openLoginModal,
      openRegisterModal,
      closeModal,
    }),
    [modalState, openLoginModal, openRegisterModal, closeModal],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return ctx;
}
