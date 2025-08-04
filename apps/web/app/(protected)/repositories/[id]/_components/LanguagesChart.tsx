import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface LanguagesChartProps {
  languages: Record<string, number>;
}

export function LanguagesChart({ languages }: LanguagesChartProps) {
  if (!languages || Object.keys(languages).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Langages</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun langage détecté</p>
        </CardContent>
      </Card>
    );
  }

  // Calculer le total des bytes
  const totalBytes = Object.values(languages).reduce(
    (sum, bytes) => sum + bytes,
    0
  );

  // Trier par pourcentage décroissant
  const sortedLanguages = Object.entries(languages)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: (bytes / totalBytes) * 100,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // Couleurs pour les langages (peut être étendu)
  const languageColors: Record<string, string> = {
    JavaScript: "#f7df1e",
    TypeScript: "#3178c6",
    Python: "#3776ab",
    Java: "#ed8b00",
    "C++": "#00599c",
    C: "#a8b9cc",
    "C#": "#239120",
    PHP: "#777bb4",
    Ruby: "#cc342d",
    Go: "#00add8",
    Rust: "#dea584",
    Swift: "#fa7343",
    Kotlin: "#7f52ff",
    Dart: "#0175c2",
    Vue: "#4fc08d",
    HTML: "#e34f26",
    CSS: "#1572b6",
    SCSS: "#cf649a",
    Shell: "#89e051",
    Dockerfile: "#384d54",
  };

  const formatBytes = (bytes: number) => {
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Langages utilisés</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedLanguages.map((lang, index) => (
          <div key={lang.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      languageColors[lang.name] ||
                      `hsl(${index * 40}, 60%, 50%)`,
                  }}
                />
                <span className="font-medium">{lang.name}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{lang.percentage.toFixed(1)}%</span>
                <span>({formatBytes(lang.bytes)})</span>
              </div>
            </div>
            <Progress
              value={lang.percentage}
              className="h-2"
              style={{
                backgroundColor: `${languageColors[lang.name] || `hsl(${index * 40}, 60%, 50%)`}20`,
              }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
