import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@shared/schema";
import { Loader2, CheckCircle2, Circle, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { format, subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const { toast } = useToast();
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const confirmTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiRequest("POST", `/api/tasks/${taskId}/confirm`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Task Confirmed",
        description: "The task has been confirmed and saved.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Calculate analytics data
  const totalTasks = tasks?.length || 0;
  const tasksByDate = tasks?.reduce((acc: { [key: string]: number }, task) => {
    const date = new Date(task.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(tasksByDate || {}).map(([date, count]) => ({
    date,
    tasks: count,
  }));

  // Get tasks for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  }).reverse();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Task Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalTasks}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="font-semibold">{day}</div>
              ))}
              {last7Days.map(date => {
                const dayTasks = tasks?.filter(task => 
                  format(new Date(task.createdAt), 'yyyy-MM-dd') === date
                );
                return (
                  <div 
                    key={date} 
                    className={`p-2 rounded-md ${dayTasks?.length ? 'bg-primary/10' : ''}`}
                  >
                    <div className="text-xs">{format(new Date(date), 'd')}</div>
                    {dayTasks?.length > 0 && (
                      <div className="text-xs text-primary">{dayTasks.length} tasks</div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks?.map((task) => (
              <div key={task.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{task.summary}</h3>
                  <Button
                    variant={task.isConfirmed ? "ghost" : "outline"}
                    size="sm"
                    onClick={() => !task.isConfirmed && confirmTaskMutation.mutate(task.id)}
                    disabled={task.isConfirmed || confirmTaskMutation.isPending}
                  >
                    {task.isConfirmed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      "Confirm Task"
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Original Transcript:</p>
                  <p className="italic text-sm mb-4">{task.transcript}</p>

                  <p className="text-sm text-muted-foreground">Priorities:</p>
                  <ul className="list-disc pl-4">
                    {task.priorities.map((priority, index) => (
                      <li key={index}>{priority}</li>
                    ))}
                  </ul>

                  <p className="text-sm text-muted-foreground mt-2">Daily Tasks:</p>
                  <ul className="space-y-1">
                    {task.dailyTasks.map((dailyTask, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Circle className="h-4 w-4" />
                        {dailyTask}
                      </li>
                    ))}
                  </ul>

                  <p className="text-sm text-muted-foreground mt-2">Long-term Goals:</p>
                  <ul className="list-disc pl-4">
                    {task.longTermGoals.map((goal, index) => (
                      <li key={index}>{goal}</li>
                    ))}
                  </ul>

                  <p className="text-xs text-muted-foreground mt-2">
                    Created: {new Date(task.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}