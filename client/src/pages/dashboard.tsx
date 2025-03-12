import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@shared/schema";
import { Loader2, CheckCircle2, Circle, Calendar, BarChart3, ListTodo } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { format, subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const confirmTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiRequest("POST", `/api/tasks/${taskId}/confirm`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task Confirmed",
        description: "The task has been confirmed and saved.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate analytics data
  const totalTasks = tasks?.length || 0;
  const confirmedTasks = tasks?.filter(task => task.isConfirmed).length || 0;
  const tasksByDate = tasks?.reduce((acc: { [key: string]: number }, task) => {
    const date = format(new Date(task.createdAt), 'MMM d');
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Task Dashboard
        </h1>
        <p className="text-muted-foreground mb-8">
          Track, manage, and complete your AI-generated tasks
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5" />
                  Task Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{totalTasks}</p>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${(confirmedTasks / totalTasks) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {confirmedTasks} of {totalTasks} tasks completed
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Task Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))"
                      }}
                    />
                    <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Calendar View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  {last7Days.map(date => {
                    const dayTasks = tasks?.filter(task => 
                      format(new Date(task.createdAt), 'yyyy-MM-dd') === date
                    );
                    return (
                      <motion.div
                        key={date}
                        whileHover={{ scale: 1.1 }}
                        className={`p-2 rounded-lg transition-colors ${
                          dayTasks?.length 
                            ? 'bg-primary/10 hover:bg-primary/20 cursor-pointer' 
                            : 'bg-muted/5'
                        }`}
                      >
                        <div className="font-medium">{format(new Date(date), 'd')}</div>
                        {dayTasks?.length > 0 && (
                          <div className="text-xs text-primary font-medium mt-1">
                            {dayTasks.length} tasks
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              Task List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              <div className="space-y-4">
                {tasks?.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`border rounded-lg p-6 transition-all duration-300 ${
                      task.isConfirmed 
                        ? 'bg-primary/5 border-primary/20' 
                        : 'hover:border-primary/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold">{task.summary}</h3>
                      <Button
                        variant={task.isConfirmed ? "ghost" : "outline"}
                        size="sm"
                        onClick={() => !task.isConfirmed && confirmTaskMutation.mutate(task.id)}
                        disabled={task.isConfirmed || confirmTaskMutation.isPending}
                        className="transition-all duration-300"
                      >
                        {task.isConfirmed ? (
                          <div className="flex items-center gap-2 text-green-500">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Completed</span>
                          </div>
                        ) : (
                          "Confirm Task"
                        )}
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Original Transcript
                        </h4>
                        <p className="italic text-sm bg-muted/10 p-3 rounded-md">
                          {task.transcript}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Priorities
                        </h4>
                        <ul className="grid gap-2">
                          {task.priorities.map((priority, index) => (
                            <li key={index} className="flex items-center gap-2 bg-background/50 p-2 rounded-md">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              {priority}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Daily Tasks
                        </h4>
                        <ul className="space-y-2">
                          {task.dailyTasks.map((dailyTask, index) => (
                            <li key={index} className="flex items-center gap-3 bg-background/50 p-2 rounded-md">
                              <Circle className="h-4 w-4 text-primary" />
                              {dailyTask}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Long-term Goals
                        </h4>
                        <ul className="grid gap-2">
                          {task.longTermGoals.map((goal, index) => (
                            <li key={index} className="flex items-center gap-2 bg-background/50 p-2 rounded-md">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                        <Calendar className="h-3 w-3" />
                        Created: {format(new Date(task.createdAt), 'PPP p')}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}