import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useUserPreferences, UserPreferences } from "@/hooks/useUserPreferences";

const TONES = [
  { value: "professionnel", label: "Professionnel" },
  { value: "enthousiaste", label: "Enthousiaste" },
  { value: "humoristique", label: "Humoristique" },
  { value: "inspirant", label: "Inspirant" },
];

const LANGUAGES = [
  { value: "français", label: "Français" },
  { value: "anglais", label: "Anglais" },
  { value: "espagnol", label: "Espagnol" },
];


export function UserPreferencesForm() {
  const { preferences, isLoading, error, savePreferences } = useUserPreferences();
  const [form, setForm] = useState<Partial<UserPreferences>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    if (preferences) setForm(preferences);
  }, [preferences]);

  const handleChange = (
    field: keyof UserPreferences,
    value: unknown
  ) => {
    setForm(f => ({ ...f, [field]: value as never }));
  };

  const handleArrayChange = (field: keyof UserPreferences, value: string) => {
    setForm(f => ({ ...f, [field]: value.split(",").map(s => s.trim()).filter(Boolean) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrMsg(null);
    setSuccess(false);
    try {
      await savePreferences(form);
      setSuccess(true);
    } catch (e: unknown) {
      setErrMsg(
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "Erreur lors de la sauvegarde"
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <div className="text-red-500">Erreur: {String(error)}</div>;

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <Label className="mb-2">Ton favori</Label>
        <Select
          value={form.favoriteTone || ""}
          onValueChange={val => handleChange("favoriteTone", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisir un ton" />
          </SelectTrigger>
          <SelectContent>
            {TONES.map(tone => (
              <SelectItem key={tone.value} value={tone.value}>
                {tone.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="mb-2">Langue préférée</Label>
        <Select
          value={form.preferredLanguage || ""}
          onValueChange={val => handleChange("preferredLanguage", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisir une langue" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map(lang => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="mb-2">Formats de sortie par défaut</Label>
        <Input
          placeholder="summary, post, tweet"
          value={form.defaultOutputs?.join(", ") || ""}
          onChange={e => handleArrayChange("defaultOutputs", e.target.value)}
        />
        <div className="text-xs text-muted-foreground mt-1">
          Séparez par des virgules (ex: summary, post, tweet)
        </div>
      </div>
      <div>
        <Label className="mb-2">Mots-clés/hashtags prioritaires</Label>
        <Input
          placeholder="#dev, #ai, #startup"
          value={form.hashtagPreferences?.join(", ") || ""}
          onChange={e =>
            handleArrayChange("hashtagPreferences", e.target.value)
          }
        />
        <div className="text-xs text-muted-foreground mt-1">
          Séparez par des virgules
        </div>
      </div>
      <div>
        <Label className="mb-2">Contexte personnalisé (Markdown ou JSON)</Label>
        <Textarea
          placeholder="Décrivez votre contexte, votre audience, vos objectifs..."
          value={form.customContext || ""}
          onChange={e => handleChange("customContext", e.target.value)}
          rows={4}
        />
      </div>
      <div>
        <Label className="mb-2">Réglages avancés du modèle (JSON)</Label>
        <Textarea
          placeholder='{"temperature":0.7, "top_p":0.9}'
          value={form.modelSettings ? JSON.stringify(form.modelSettings) : ""}
          onChange={e => {
            try {
              handleChange("modelSettings", JSON.parse(e.target.value));
              setErrMsg(null);
            } catch {
              setErrMsg("JSON invalide dans les réglages avancés");
            }
          }}
          rows={3}
        />
        <div className="text-xs text-muted-foreground mt-1">
          Exemple: {`{"temperature":0.7, "top_p":0.9}`}
        </div>
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? <Spinner className="mr-2 h-4 w-4" /> : null}
        Sauvegarder
      </Button>
      {success && (
        <div className="text-green-600 text-sm">Préférences sauvegardées !</div>
      )}
      {errMsg && <div className="text-red-500 text-sm">{errMsg}</div>}
    </form>
  );
}