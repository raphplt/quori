"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import QuotaRate from "@/components/profile/QuotaRate";
import { useGitHubEvents } from "@/hooks/useGitHubEvents";
import {
  useGeneratePost,
  createGenerateRequestFromEvent,
} from "@/hooks/useGeneratePost";
import { Spinner } from "@/components/ui/spinner";
import EventCard from "@/components/activity/EventCard";
import { z } from "zod";
import { UserPreferencesForm } from "@/components/profile/UserPreferencesForm";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";

const postFormSchema = z.object({
  summary: z.string().min(10, "Résumé trop court"),
  postContent: z.string().min(10, "Contenu trop court"),
  template: z.string().optional(),
  tone: z.string().optional(),
  scheduledAt: z.string().optional(),
});

type PostForm = z.infer<typeof postFormSchema>;

const TONES = [
  { value: "professionnel", label: "Professionnel" },
  { value: "enthousiaste", label: "Enthousiaste" },
  { value: "humoristique", label: "Humoristique" },
  { value: "inspirant", label: "Inspirant" },
];

const DEFAULT_TEMPLATE = "LinkedIn";

export default function NewPostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const { events: allEvents, isLoading: eventsLoading } = useGitHubEvents();
  const [form, setForm] = useState<PostForm>({
    summary: "",
    postContent: "",
    template: DEFAULT_TEMPLATE,
    tone: TONES[0].value,
    scheduledAt: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    summary: string;
    post: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  // Récupération de l'event sélectionné
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    eventId
  );
  const event = useMemo(() => {
    if (!selectedEventId || !allEvents) return null;
    return allEvents.find(e => e.delivery_id === selectedEventId) || null;
  }, [selectedEventId, allEvents]);

  // Préremplir le formulaire si event
  useMemo(() => {
    if (event) {
      setForm(f => ({
        ...f,
        summary: event.metadata?.title || event.metadata?.desc || "",
        // Le contenu du post est vide par défaut, il sera généré par l'IA
        postContent: "",
      }));
    }
  }, [event]);

  // Génération IA
  const generateMutation = useGeneratePost();
  const handleGenerate = async () => {
    setStatus("loading");
    setError(null);
    try {
      if (!event) throw new Error("Aucun événement sélectionné");
      const request = createGenerateRequestFromEvent(event);
      request.options = {
        ...request.options,
        tone: form.tone,
        output: [form.template || DEFAULT_TEMPLATE],
      };
      const res = await generateMutation.mutateAsync({ request, event });
      setPreview(res);
      setForm(f => ({ ...f, summary: res.summary, postContent: res.post }));
      setStatus("success");
    } catch (e: any) {
      setError(e.message || "Erreur lors de la génération");
      setStatus("error");
    }
  };

  // Enregistrer en draft
  const handleSaveDraft = async () => {
    setSaving(true);
    setError(null);
    try {
      // TODO: POST /api/posts (adapter selon votre API)
      // await apiClient.post("/posts", { ...form, eventId });
      setSaving(false);
      setStatus("success");
      router.push("/posts");
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'enregistrement");
      setSaving(false);
      setStatus("error");
    }
  };

  // Programmer/Publier
  const handleScheduleOrPublish = async (action: "schedule" | "publish") => {
    setPublishing(true);
    setError(null);
    try {
      // TODO: POST /api/posts/:id/schedule ou /api/posts/:id/publish
      // await apiClient.post(`/posts/${postId}/${action}`);
      setPublishing(false);
      setStatus("success");
      router.push("/posts");
    } catch (e: any) {
      setError(
        e.message ||
          `Erreur lors de la ${action === "schedule" ? "programmation" : "publication"}`
      );
      setPublishing(false);
      setStatus("error");
    }
  };

  return (
    <ProtectedRoute>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-8">
        {/* Zone de texte principale */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Créer un post LinkedIn</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Textarea
                placeholder="Résumé (généré ou manuel)"
                value={form.summary}
                onChange={e =>
                  setForm(f => ({ ...f, summary: e.target.value }))
                }
                rows={3}
                className="mb-2"
              />
              <Textarea
                placeholder="Contenu du post LinkedIn"
                value={form.postContent}
                onChange={e =>
                  setForm(f => ({ ...f, postContent: e.target.value }))
                }
                rows={6}
                className="mb-2"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={saving || status === "loading"}
                >
                  {saving ? <Spinner className="mr-2 h-4 w-4" /> : null}
                  Enregistrer en draft
                </Button>
                <Button
                  onClick={() => handleScheduleOrPublish("schedule")}
                  disabled={publishing || status === "loading"}
                  variant="secondary"
                >
                  {publishing ? <Spinner className="mr-2 h-4 w-4" /> : null}
                  Programmer
                </Button>
                <Button
                  onClick={() => handleScheduleOrPublish("publish")}
                  disabled={publishing || status === "loading"}
                >
                  {publishing ? <Spinner className="mr-2 h-4 w-4" /> : null}
                  Publier
                </Button>
              </div>
              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}
              {status === "success" && (
                <div className="text-green-600 text-sm mt-2">Succès !</div>
              )}
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={handleGenerate}
              disabled={status === "loading" || !event}
            >
              {status === "loading" ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : null}
              Générer via IA
            </Button>
            <span className="text-muted-foreground text-xs self-center">
              (Utilise 1 quota IA)
            </span>
          </div>
          {/* Aperçu résumé/post */}
          {preview && (
            <Card className="mt-2">
              <CardHeader>
                <CardTitle>Aperçu généré</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 font-semibold">Résumé :</div>
                <div className="mb-4 bg-muted p-2 rounded text-sm">
                  {preview.summary}
                </div>
                <div className="mb-2 font-semibold">Post LinkedIn :</div>
                <div className="bg-muted p-2 rounded text-sm whitespace-pre-line">
                  {preview.post}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <Spinner />
              ) : allEvents && allEvents.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {allEvents.slice(0, 2).map(activity => (
                    <div
                      key={activity.delivery_id}
                      className={`cursor-pointer rounded transition border p-1 ${selectedEventId === activity.delivery_id ? "border-primary bg-primary/10" : "border-transparent"}`}
                      onClick={() => setSelectedEventId(activity.delivery_id)}
                    >
                      <EventCard
                        activity={activity}
                        generatingForEvent={null}
                        handleGeneratePost={() => {}}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  Aucun événement trouvé.
                </div>
              )}
            </CardContent>
          </Card>
          {/* Préférences utilisateur (modale) */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full mb-2">
                <Settings className="mr-2 h-4 w-4" />
                Préférences IA
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg w-full">
              <DialogHeader>
                <DialogTitle>Préférences de génération IA</DialogTitle>
                <DialogDescription>
                  Personnalisez le ton, la langue, les formats de sortie, le
                  contexte et les réglages avancés pour la génération de vos
                  posts.
                </DialogDescription>
              </DialogHeader>
              <UserPreferencesForm />
              <DialogClose asChild>
                <Button variant="secondary" className="mt-4 w-full">
                  Fermer
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>

          {/* Quota IA restant */}
          <QuotaRate />
        </div>
      </div>
    </ProtectedRoute>
  );
}
