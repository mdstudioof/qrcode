// Integração com Abacate Pay removida conforme solicitado.
// Este arquivo pode ser deletado futuramente.

export const createCheckoutSession = async () => {
  console.warn("Pagamentos via Abacate Pay foram desativados.");
  return { success: false, error: "Pagamentos desativados." };
};