'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { subjectsApi, Subject } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectsApi.getAll();
      setSubjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to load subjects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (subject: Subject) => {
    setSubjectToDelete(subject);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subjectToDelete) return;

    try {
      setDeleting(true);
      await subjectsApi.delete(subjectToDelete.id);
      await loadSubjects();
      setDeleteDialogOpen(false);
      setSubjectToDelete(null);
    } catch (err) {
      setError('Failed to delete subject');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const getCompletedWeeks = (subject: Subject) => {
    if (!subject.weeks) return 0;
    return subject.weeks.filter(w => w.content.trim().length > 0).length;
  };

  const getTotalWeeks = (subject: Subject) => {
    return subject.endWeek - subject.startWeek + 1;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">AutoPlanning</h1>
            <p className="text-muted-foreground mt-2">Plan your subjects week by week</p>
          </div>
          <Link href="/subjects/new">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Create New Subject
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : subjects.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No subjects yet.</p>
                <Link href="/subjects/new">
                  <Button>Create your first subject</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => {
              const completed = getCompletedWeeks(subject);
              const total = getTotalWeeks(subject);
              const progress = total > 0 ? (completed / total) * 100 : 0;

              return (
                <Card key={subject.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{subject.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {subject.semester.toUpperCase()} Semester
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{completed} / {total} weeks</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Weeks {subject.startWeek} - {subject.endWeek}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Link href={`/subjects/${subject.id}`} className="flex-1">
                      <Button className="w-full" variant="default">
                        {completed === total && total > 0 ? (
                          <>
                            <Calendar className="mr-2 h-4 w-4" />
                            View Calendar
                          </>
                        ) : (
                          'Continue Planning'
                        )}
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteClick(subject)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle>Delete Subject</DialogTitle>
                <DialogDescription className="mt-1">
                  Are you sure you want to delete this subject? This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {subjectToDelete && (
            <div className="py-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="font-semibold">{subjectToDelete.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {subjectToDelete.semester.toUpperCase()} Semester • Weeks {subjectToDelete.startWeek} - {subjectToDelete.endWeek}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSubjectToDelete(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Subject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
