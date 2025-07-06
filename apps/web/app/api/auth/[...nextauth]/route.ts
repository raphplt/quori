// Plus d’appel à NextAuth ici !
// On récupère seulement les handlers pré-générés
import { handlers } from "../../../../lib/auth";

export const { GET, POST } = handlers;
