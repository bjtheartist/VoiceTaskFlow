import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@shared/schema";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks?.map((task) => (
              <div key={task.id} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{task.summary}</h3>
                <div className="space-y-2">
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
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
