'use client';

import { Week } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWeekDateString } from '@/lib/date-utils';

interface PreviewPanelProps {
  weeks: Week[];
  currentWeekNumber: number;
  onWeekClick?: (weekNumber: number) => void;
  semesterStartDate?: string;
}

export default function PreviewPanel({
  weeks,
  currentWeekNumber,
  onWeekClick,
  semesterStartDate,
}: PreviewPanelProps) {
  const getContentPreview = (content: string, maxLength: number = 100) => {
    if (!content.trim()) return 'No content yet';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const hasContent = (week: Week) => week.content.trim().length > 0;

  // Check for repeated content
  const findRepeatedContent = () => {
    const contentMap = new Map<string, number[]>();
    weeks.forEach((week) => {
      const normalized = week.content.trim().toLowerCase();
      if (normalized.length > 20) {
        if (!contentMap.has(normalized)) {
          contentMap.set(normalized, []);
        }
        contentMap.get(normalized)?.push(week.weekNumber);
      }
    });

    const repeated: { content: string; weeks: number[] }[] = [];
    contentMap.forEach((weekNumbers, content) => {
      if (weekNumbers.length > 1) {
        repeated.push({ content, weeks: weekNumbers });
      }
    });

    return repeated;
  };

  const repeatedContent = findRepeatedContent();

  // Sort weeks by weekNumber
  const sortedWeeks = [...weeks].sort((a, b) => a.weekNumber - b.weekNumber);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Weeks Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] lg:h-[600px]">
            <div className="space-y-3">
              {sortedWeeks.map((week) => {
                const isCurrent = week.weekNumber === currentWeekNumber;
                const completed = hasContent(week);

                return (
                  <Card
                    key={week.id}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary",
                      isCurrent && "border-primary border-2",
                      !completed && "opacity-60"
                    )}
                    onClick={() => onWeekClick?.(week.weekNumber)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {completed ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-sm">
                                Week {week.weekNumber}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {getWeekDateString(week.weekNumber, semesterStartDate)}
                              </p>
                            </div>
                            {isCurrent && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {getContentPreview(week.content)}
                          </p>
                          {week.resources && week.resources.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {week.resources.length} resource{week.resources.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {repeatedContent.length > 0 && (
        <Card className="border-yellow-500 dark:border-yellow-600">
          <CardHeader>
            <CardTitle className="text-lg text-yellow-600 dark:text-yellow-500">⚠️ Repeated Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {repeatedContent.map((item, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium mb-1">
                    Found in weeks: {item.weeks.join(', ')}
                  </p>
                  <p className="text-muted-foreground line-clamp-2">
                    {item.content.substring(0, 150)}...
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
