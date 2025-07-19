export class CreatePreferenceDto {
  userId!: string;
  favoriteTone!: string;
  customContext?: string;
  preferredLanguage?: string;
  defaultOutputs?: string[];
  hashtagPreferences?: string[];
  modelSettings?: Record<string, any>;
}
