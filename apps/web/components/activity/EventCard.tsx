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
import { getBadge, getIcon } from "@/utils/events";

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
  return (
    <Card key={activity.delivery_id}>
      <Link href={`/event/${activity.delivery_id}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getIcon(activity.event)}
              <CardTitle className="text-lg">
                {activity.metadata?.title || activity.event}
              </CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {getBadge(activity.event, activity.status)}
            </div>
          </div>
          <CardDescription>
            {activity.repo_full_name} •{" "}
            {new Date(activity.received_at).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activity.metadata?.desc && (
            <p className="mb-2 text-sm text-muted-foreground">
              {activity.metadata.desc}
            </p>
          )}
          <div className="flex items-center space-x-2">
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
                disabled={
                  generatingForEvent === activity.delivery_id ||
                  activity.status === "processing"
                }
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {generatingForEvent === activity.delivery_id ||
                activity.status === "processing" ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-1" />
                    Générer un post
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default EventCard;
