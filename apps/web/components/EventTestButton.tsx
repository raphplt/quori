import { Button } from "@/components/ui/button";
import { useEvents } from "@/contexts/EventsContext";
import { useEventToasts } from "@/hooks/useEventToasts";

export default function EventTestButton() {
  const { createTestEvent } = useEvents();
  const { showCustomToast } = useEventToasts();

  const handleCreateTestEvent = async () => {
    try {
      showCustomToast("Création d'un événement de test...", "loading", "⏳");
      await createTestEvent();
      // Le toast de succès est géré automatiquement par le contexte
    } catch (error) {
      showCustomToast(
        "Erreur lors de la création de l'événement de test",
        "error"
      );
      console.error("Error creating test event:", error);
    }
  };

  return (
    <Button
      onClick={handleCreateTestEvent}
      variant="outline"
      className="flex items-center gap-2"
    >
      🧪 Créer un événement de test
    </Button>
  );
}
