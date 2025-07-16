export class DiffStatDto {
  filePath!: string;
  additions!: number;
  deletions!: number;
  changes!: number;
}

export class EventDto {
  title!: string;
  desc!: string;
  filesChanged!: string[];
  diffStats!: DiffStatDto[];
  repoFullName!: string;
  commitCount!: number;
  timestamp!: string;
}

export class GenerateOptionsDto {
  lang?: string;
  tone?: string;
  output?: string[];
}

export class GenerateDto {
  event!: EventDto;
  options?: GenerateOptionsDto;
  templateId?: number;
}

export class GenerateResultDto {
  summary!: string;
  post!: string;
}
