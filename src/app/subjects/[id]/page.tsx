'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { subjectsApi, weeksApi, exportApi, Subject, Week } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stepper } from '@/components/ui/stepper';
import { Calendar } from '@/components/ui/calendar';
import WeekEditor from '@/components/WeekEditor';
import PreviewPanel from '@/components/PreviewPanel';
import { ArrowLeft, Download, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = parseInt(params.id as string);

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (!isNaN(subjectId)) {
      loadSubject();
    }
  }, [subjectId]);

  const loadSubject = async () => {
    try {
      setLoading(true);
      const data = await subjectsApi.getById(subjectId);
      setSubject(data);
      
      // Find first incomplete week or start at first week
      // Sort weeks by weekNumber to ensure correct order
      if (data.weeks && data.weeks.length > 0) {
        const sortedWeeks = [...data.weeks].sort((a, b) => a.weekNumber - b.weekNumber);
        const firstIncomplete = sortedWeeks.findIndex(w => !w.content.trim());
        // Find the index in the original array
        if (firstIncomplete >= 0) {
          const weekNumber = sortedWeeks[firstIncomplete].weekNumber;
          const originalIndex = data.weeks.findIndex(w => w.weekNumber === weekNumber);
          setCurrentWeekIndex(originalIndex >= 0 ? originalIndex : 0);
        } else {
          // All complete, start at first week
          const firstWeekNumber = sortedWeeks[0].weekNumber;
          const originalIndex = data.weeks.findIndex(w => w.weekNumber === firstWeekNumber);
          setCurrentWeekIndex(originalIndex >= 0 ? originalIndex : 0);
        }
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load subject');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportApi.exportSubject(subjectId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${subject?.name || 'subject'}-planning.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export subject');
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const handleWeekUpdate = async (weekId: number, content: string) => {
    try {
      await weeksApi.update(weekId, { content });
      await loadSubject();
    } catch (err) {
      setError('Failed to update week');
      console.error(err);
    }
  };

  const handleResourceAdd = async (
    weekId: number,
    url: string,
    title?: string,
    description?: string
  ) => {
    try {
      await weeksApi.createResource(weekId, { url, title, description });
      await loadSubject();
    } catch (err) {
      setError('Failed to add resource');
      console.error(err);
    }
  };

  const handleResourceDelete = async (resourceId: number) => {
    try {
      await weeksApi.deleteResource(resourceId);
      await loadSubject();
    } catch (err) {
      setError('Failed to delete resource');
      console.error(err);
    }
  };

  const handleSaveAndContinue = () => {
    if (!subject?.weeks || !currentWeek) return;
    
    // Find the next week by weekNumber (not just next index)
    const sortedWeeks = [...subject.weeks].sort((a, b) => a.weekNumber - b.weekNumber);
    const currentWeekIndexInSorted = sortedWeeks.findIndex(w => w.weekNumber === currentWeek.weekNumber);
    
    if (currentWeekIndexInSorted >= 0 && currentWeekIndexInSorted < sortedWeeks.length - 1) {
      const nextWeek = sortedWeeks[currentWeekIndexInSorted + 1];
      // Find the index in the original array
      const nextIndex = subject.weeks.findIndex(w => w.weekNumber === nextWeek.weekNumber);
      if (nextIndex >= 0) {
        setCurrentWeekIndex(nextIndex);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleStepClick = (step: number) => {
    // step is the week number, find the week by weekNumber
    if (!subject?.weeks) return;
    
    const weekIndex = subject.weeks.findIndex(w => w.weekNumber === step);
    if (weekIndex >= 0) {
      setCurrentWeekIndex(weekIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getCompletedWeeks = () => {
    if (!subject?.weeks) return [];
    // Return actual week numbers, not array indices
    return subject.weeks
      .filter(week => week.content.trim().length > 0)
      .map(week => week.weekNumber);
  };

  const isAllCompleted = () => {
    if (!subject?.weeks || subject.weeks.length === 0) return false;
    return subject.weeks.every(week => week.content.trim().length > 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-destructive mb-4">Subject not found</div>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const weeks = subject.weeks || [];
  const currentWeek = weeks[currentWeekIndex];
  const completedWeeks = getCompletedWeeks();
  const allCompleted = isAllCompleted();

  // Show calendar view if all weeks are completed
  if (showCalendar && allCompleted) {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), 0, 1); // Start of year
    const datesWithContent = weeks
      .filter(w => w.content.trim())
      .map((week, index) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + (week.weekNumber - 1) * 7);
        return { date, week };
      });

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">{subject.name}</h1>
              <p className="text-muted-foreground mt-1">
                Calendar View - All weeks completed
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCalendar(false)}
              >
                Back to Planning
              </Button>
              <Button onClick={handleExport} disabled={exporting}>
                <Download className="mr-2 h-4 w-4" />
                {exporting ? 'Exporting...' : 'Export Excel'}
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Planning Calendar</CardTitle>
              <CardDescription>
                View your completed weeks on the calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-6">
                <Calendar
                  mode="single"
                  selected={today}
                  className="rounded-md border"
                />
              </div>
              <div className="mt-6 space-y-2">
                <h3 className="font-semibold mb-4">Completed Weeks:</h3>
                <div className="grid gap-2">
                  {datesWithContent.map(({ date, week }) => (
                    <Card key={week.id} className="bg-muted/30">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">Week {week.weekNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(date, 'MMMM d, yyyy')}
                            </p>
                            <p className="text-sm mt-2 line-clamp-2">
                              {week.content.substring(0, 150)}...
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{subject.name}</h1>
              <p className="text-muted-foreground">
                {subject.semester.toUpperCase()} Semester • Weeks {subject.startWeek} - {subject.endWeek}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {allCompleted && (
              <Button
                variant="outline"
                onClick={() => setShowCalendar(true)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                View Calendar
              </Button>
            )}
            <Button onClick={handleExport} disabled={exporting} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {exporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor - Takes 2 columns */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {currentWeek ? (
              <WeekEditor
                week={currentWeek}
                onUpdate={handleWeekUpdate}
                onResourceAdd={handleResourceAdd}
                onResourceDelete={handleResourceDelete}
                onSaveAndContinue={handleSaveAndContinue}
                isLastWeek={(() => {
                  if (!currentWeek || weeks.length === 0) return false;
                  const sortedWeeks = [...weeks].sort((a, b) => a.weekNumber - b.weekNumber);
                  return currentWeek.weekNumber === sortedWeeks[sortedWeeks.length - 1]?.weekNumber;
                })()}
                semesterStartDate={subject.semesterStartDate}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">No weeks available</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview Panel - Takes 1 column */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <PreviewPanel
              weeks={weeks}
              currentWeekNumber={currentWeek?.weekNumber || 1}
              onWeekClick={(weekNumber) => {
                const index = weeks.findIndex(w => w.weekNumber === weekNumber);
                if (index >= 0) {
                  setCurrentWeekIndex(index);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              semesterStartDate={subject.semesterStartDate}
            />
          </div>
        </div>
      </div>

      {/* Stepper at Bottom */}
      {weeks.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
          <Stepper
            currentStep={currentWeek?.weekNumber || subject.startWeek}
            weekNumbers={weeks.map(w => w.weekNumber).sort((a, b) => a - b)}
            onStepClick={handleStepClick}
            completedSteps={completedWeeks}
            semesterStartDate={subject.semesterStartDate}
          />
        </div>
      )}
    </div>
  );
}
