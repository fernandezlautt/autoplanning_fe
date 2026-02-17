'use client';

import { useState, useEffect } from 'react';
import { Week, Resource } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { getWeekDateString } from '@/lib/date-utils';

interface WeekEditorProps {
  week: Week;
  onUpdate: (weekId: number, content: string) => Promise<void>;
  onResourceAdd: (weekId: number, url: string, title?: string, description?: string) => Promise<void>;
  onResourceDelete: (resourceId: number) => Promise<void>;
  onSaveAndContinue?: () => void;
  isLastWeek?: boolean;
  semesterStartDate?: string;
}

export default function WeekEditor({
  week,
  onUpdate,
  onResourceAdd,
  onResourceDelete,
  onSaveAndContinue,
  isLastWeek = false,
  semesterStartDate,
}: WeekEditorProps) {
  const [content, setContent] = useState(week.content);
  const [saving, setSaving] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    url: '',
    title: '',
    description: '',
  });

  useEffect(() => {
    setContent(week.content);
  }, [week.id, week.content]);

  const handleSave = async () => {
    if (content === week.content) return;

    try {
      setSaving(true);
      await onUpdate(week.id, content);
    } catch (err) {
      console.error('Failed to save week:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (content !== week.content) {
      await handleSave();
    }
    if (onSaveAndContinue) {
      onSaveAndContinue();
    }
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceForm.url.trim()) return;

    try {
      await onResourceAdd(
        week.id,
        resourceForm.url,
        resourceForm.title || undefined,
        resourceForm.description || undefined
      );
      setResourceForm({ url: '', title: '', description: '' });
      setShowResourceForm(false);
    } catch (err) {
      console.error('Failed to add resource:', err);
    }
  };

  const hasContent = content.trim().length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Week {week.weekNumber} Content</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {getWeekDateString(week.weekNumber, semesterStartDate)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter the content for this week..."
              rows={10}
              className="font-mono text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving || content === week.content}
              variant={hasContent ? "default" : "outline"}
            >
              {saving ? 'Saving...' : 'Save Content'}
            </Button>
            {!isLastWeek && (
              <Button
                onClick={handleSaveAndContinue}
                disabled={saving || !hasContent}
                variant="default"
              >
                Save & Continue to Week {week.weekNumber + 1}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Resources</CardTitle>
            <Button
              onClick={() => setShowResourceForm(!showResourceForm)}
              variant="outline"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              {showResourceForm ? 'Cancel' : 'Add Resource'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showResourceForm && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resource-url">URL *</Label>
                  <Input
                    id="resource-url"
                    type="url"
                    value={resourceForm.url}
                    onChange={(e) =>
                      setResourceForm({ ...resourceForm, url: e.target.value })
                    }
                    placeholder="https://..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resource-title">Title</Label>
                  <Input
                    id="resource-title"
                    type="text"
                    value={resourceForm.title}
                    onChange={(e) =>
                      setResourceForm({ ...resourceForm, title: e.target.value })
                    }
                    placeholder="Resource title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resource-description">Description</Label>
                  <Textarea
                    id="resource-description"
                    value={resourceForm.description}
                    onChange={(e) =>
                      setResourceForm({ ...resourceForm, description: e.target.value })
                    }
                    placeholder="Resource description"
                    rows={3}
                  />
                </div>
                <Button onClick={handleResourceSubmit} type="button">
                  Add Resource
                </Button>
              </CardContent>
            </Card>
          )}

          {week.resources && week.resources.length > 0 ? (
            <div className="space-y-3">
              {week.resources.map((resource) => (
                <Card key={resource.id} className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {resource.title && (
                          <h4 className="font-semibold text-sm">{resource.title}</h4>
                        )}
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          {resource.url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                        )}
                      </div>
                      <Button
                        onClick={() => onResourceDelete(resource.id)}
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              No resources added yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
