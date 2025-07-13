import { GitHubEvent } from "@/types/githubEvent";
import { CheckCircle, RefreshCw, Sparkles } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import Link from "next/link";
import { getEventTypeLabel, getIcon } from "@/utils/events";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

type Props = {
  activity: GitHubEvent;
  generatingForEvent: string | null;
  handleGeneratePost: (event: GitHubEvent, e: React.MouseEvent) => void;
};

const EventCard = ({
  activity,
  generatingForEvent,
  handleGeneratePost,
}: Props) => {
  const isLoading =
    generatingForEvent === activity.delivery_id ||
    activity.status === "processing";
  const formateDate = activity.received_at
    ? formatDistanceToNow(new Date(activity.received_at), {
        addSuffix: true,
        locale: fr,
      })
    : "Date inconnue";

  return (
    <Card className="shadow-md p-4 rounded-xl border border-border space-y-4">
      <CardHeader className="p-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getIcon(activity.event)}
            <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
              {getEventTypeLabel(activity.event_type)}
            </span>
          </div>
          <span className="text-muted-foreground text-sm">{formateDate}</span>
        </div>
        <CardTitle className="text-lg font-semibold leading-tight">
          <Link
            href={`/event/${activity.delivery_id}`}
            className="hover:underline transition-colors"
          >
            {activity.metadata?.title || "Événement GitHub"}
          </Link>
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {activity.repo_full_name}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {activity.metadata?.desc && (
          <p className="text-sm text-muted-foreground leading-snug line-clamp-2 w-10/12">
            {activity.metadata.desc}
          </p>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {/* Placeholder pour d'autres infos ou actions */}
          </div>

          {activity.status === "processed" ? (
            <Button
              size="sm"
              variant="outline"
              disabled
              className="opacity-50 cursor-not-allowed"
            >
              <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
              Post généré
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={e => handleGeneratePost(activity, e)}
              disabled={isLoading}
              className="bg-primary text-white hover:bg-primary/90 transition-all duration-150"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Générer un post
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
