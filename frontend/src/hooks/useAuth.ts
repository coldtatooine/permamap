import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useMapStore } from '../store/useMapStore';

// =====================
// useAuth — operações de autenticação via Supabase
// =====================

export function useAuth() {
  async function signIn(
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: translateAuthError(error.message) };
    // Sucesso: onAuthStateChange no App.tsx atualiza o store automaticamente
    return { success: true };
  }

  async function signUp(
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { success: false, error: translateAuthError(error.message) };
    // needsConfirmation = true quando o Supabase exige confirmação por email
    return { success: true, needsConfirmation: !data.session };
  }

  async function signOut(): Promise<void> {
    await supabase.auth.signOut();
    // Limpar estado de auth e propriedade ativa
    useAuthStore.getState().setSession(null);
    useMapStore.getState().clearProperty();
  }

  async function resendConfirmation(
    email: string,
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  return { signIn, signUp, signOut, resendConfirmation };
}

// Traduz mensagens de erro do Supabase para português
function translateAuthError(msg: string): string {
  if (msg.includes('Invalid login credentials'))   return 'Email ou senha incorretos.';
  if (msg.includes('Email not confirmed'))         return 'Confirme seu email antes de entrar.';
  if (msg.includes('User already registered'))     return 'Este email já está cadastrado.';
  if (msg.includes('Password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
  if (msg.includes('rate limit'))                  return 'Muitas tentativas. Aguarde alguns minutos.';
  if (msg.includes('signup_disabled'))             return 'Cadastro de novos usuários desabilitado.';
  return msg;
}
