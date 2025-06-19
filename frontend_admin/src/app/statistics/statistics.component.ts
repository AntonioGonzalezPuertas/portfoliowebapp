import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { DoughnutChartComponent } from '../doughnut-chart/doughnut-chart.component';
import { LineChartComponent } from '../line-chart/line-chart.component';
import { ProjectService } from '../services/projects.service';
import { UserService } from '../services/user.service';
import { Project } from '../models/projects.model';
import { ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Session } from '../models/session.model';
import { SessionService } from '../services/session.service';


@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [MatCardModule, MatChipsModule, MatButtonModule, MatIconModule, DoughnutChartComponent, LineChartComponent],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent implements OnInit {

  showLineChart = false;
  selectedKey: string = 'users';

  projects: Project[] = [];
  sessions: Session[] = [];
  onlineSessions: Session[] = [];

  // ✅ Technology stats for the chart
  techLabels: string[] = [];
  techCounts: number[] = [];

  doughnutChartDataObject: any = {
    labels: [],
    datasets: [{ data: [] }]
  };

  lineChartLabels: string[] = [];
  lineChartCounts: number[] = [];

  users: any[] = []; // raw users
  userTechLabels: string[] = [];
  userTechCounts: number[] = [];

  userTechChartDataObject: any = {
    labels: [],
    datasets: [{ data: [] }]
  };

  period: 'day' | 'week' | 'month' = 'day'; // default


  constructor(private projectService: ProjectService, private userService: UserService, private cdr: ChangeDetectorRef, 
    private sessionService: SessionService
  ) { }

  ngOnInit(): void {

    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.computeTechnologyUsage();
        this.groupProjectsBy('month');
      }
    });

    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.computeUserTechnologyUsage();
      }
    });
    
    this.sessionService.getSessions().subscribe({
      next: (data) => {
        this.sessions = data;
        console.log ("Nbre de sessions:", this.sessions.length);
        console.log ("Nbre de sessions:", this.sessions);
      }
    });
    
    this.sessionService.getOnlineSessions().subscribe({
      next: (data) => {
        this.onlineSessions = data;
        console.log('nombre de sessions actives:', data.length);
        console.log('sessions actives:', data);
      }
    })
    
  }


  toggleLineChart(key: string): void {
    if (this.selectedKey === key && this.showLineChart) {
      this.showLineChart = false;
      return;
    }

    this.selectedKey = key;
    this.showLineChart = true;

    if (key === 'projects') {
      this.groupProjectsBy('day'); // or 'day', 'week'
    } else if (key === 'users') {
      this.groupUsersBy('day'); // or 'day', 'week'
    }
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}:${month}:${year}`;
  }

  setPeriod(p: 'day' | 'week' | 'month') {
    this.period = p;

    if (this.selectedKey === 'projects') {
      this.groupProjectsBy(this.period);
    } else if (this.selectedKey === 'users') {
      this.groupUsersBy(this.period);
    }
  }


  


  // ✅ Count tech usage
  computeTechnologyUsage(): void {
    const usageMap = new Map<string, number>();

    for (const project of this.projects) {
      for (const tech of project.technologies) {
        const count = usageMap.get(tech.name) ?? 0;
        usageMap.set(tech.name, count + 1);
      }
    }

    const labels = Array.from(usageMap.keys());
    const counts = Array.from(usageMap.values());

    this.doughnutChartDataObject = {
      labels,
      datasets: [{ data: counts }]
    };

    this.cdr.detectChanges(); // Force update

  }

  groupUsersBy(period: 'day' | 'week' | 'month'): void {
    const countsMap = new Map<string, number>();
    const dates: Date[] = this.users.map(u => new Date(u.createdAt));
    if (dates.length === 0) return;

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    let maxDate = new Date();
    if (period === 'day') {
      maxDate.setHours(0, 0, 0, 0); // Set to midnight today
    } else if (period === 'week') {
      // Set to start of **next** week
      const today = new Date();
      const day = today.getDay(); // 0 = Sunday
      const diffToMonday = (day === 0 ? -6 : 1 - day);
      const monday = new Date(today);
      monday.setDate(today.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);
      monday.setDate(monday.getDate() + 7); // next week
      maxDate = monday;
    } else if (period === 'month') {
      // Set to start of **next** month
      maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 1);
    }




    // Count sign-ins
    for (const user of this.users) {
      const date = new Date(user.createdAt);
      let key = '';

      if (period === 'day') {
        key = this.formatDate(date); // Format to dd:mm:yyyy
      } else if (period === 'week') {
        const year = date.getFullYear();
        const week = this.getWeekNumber(date);
        key = `${year}-W${week.toString().padStart(2, '0')}`;
      } else if (period === 'month') {
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      }

      countsMap.set(key, (countsMap.get(key) ?? 0) + 1);
    }

    const labels: string[] = [];
    const counts: number[] = [];

    let current = new Date(minDate);

    // Set time to midnight to match maxDate
    current.setHours(0, 0, 0, 0);

    // Generate until we pass maxDate, then stop
    while (current <= maxDate) {
      let key = '';

      if (period === 'day') {
        key = this.formatDate(current);
        current.setDate(current.getDate() + 1);
      } else if (period === 'week') {
        const year = current.getFullYear();
        const week = this.getWeekNumber(current);
        key = `${year}-W${week.toString().padStart(2, '0')}`;
        current.setDate(current.getDate() + 7);
      } else if (period === 'month') {
        key = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}`;
        current.setMonth(current.getMonth() + 1);
      }

      if (!labels.includes(key)) {
        labels.push(key);
        counts.push(countsMap.get(key) ?? 0);
      }
    }


    this.lineChartLabels = labels;
    this.lineChartCounts = counts;
  }



  groupProjectsBy(period: 'day' | 'week' | 'month'): void {
    const countsMap = new Map<string, number>();
    const dates: Date[] = this.projects.map(p => new Date(p.createdAt));
    if (dates.length === 0) return;

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    let maxDate = new Date(); // default to today

    if (period === 'day') {
      maxDate.setHours(0, 0, 0, 0); // today
    } else if (period === 'week') {
      // Set to start of **next** week
      const today = new Date();
      const day = today.getDay(); // 0 = Sunday
      const diffToMonday = (day === 0 ? -6 : 1 - day);
      const monday = new Date(today);
      monday.setDate(today.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);
      monday.setDate(monday.getDate() + 7); // next week
      maxDate = monday;
    } else if (period === 'month') {
      // Set to start of **next** month
      maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 1);
    }


    // Count projects
    for (const project of this.projects) {
      const date = new Date(project.createdAt);
      let key = '';

      if (period === 'day') {
        key = this.formatDate(date); // dd:mm:yyyy
      } else if (period === 'week') {
        const year = date.getFullYear();
        const week = this.getWeekNumber(date);
        key = `${year}-W${week.toString().padStart(2, '0')}`;
      } else if (period === 'month') {
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      }

      countsMap.set(key, (countsMap.get(key) ?? 0) + 1);
    }

    const labels: string[] = [];
    const counts: number[] = [];

    let current = new Date(minDate);

    // Set time to midnight to match maxDate
    current.setHours(0, 0, 0, 0);

    // Generate until we pass maxDate, then stop
    while (current <= maxDate) {
      let key = '';

      if (period === 'day') {
        key = this.formatDate(current);
        current.setDate(current.getDate() + 1);
      } else if (period === 'week') {
        const year = current.getFullYear();
        const week = this.getWeekNumber(current);
        key = `${year}-W${week.toString().padStart(2, '0')}`;
        current.setDate(current.getDate() + 7);
      } else if (period === 'month') {
        key = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}`;
        current.setMonth(current.getMonth() + 1);
      }

      if (!labels.includes(key)) {
        labels.push(key);
        counts.push(countsMap.get(key) ?? 0);
      }
    }


    this.lineChartLabels = labels;
    this.lineChartCounts = counts;
  }


  // Helper for week number
  getWeekNumber(date: Date): number {
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((+date - +firstJan) / 86400000);
    return Math.ceil((days + firstJan.getDay() + 1) / 7);
  }

  computeUserTechnologyUsage(): void {
    const techUserMap = new Map<string, Set<string>>(); // Map<techName, Set<userId>>

    for (const user of this.users) {
      for (const tech of user.technologies) {
        const techName = tech.name;
        if (!techUserMap.has(techName)) {
          techUserMap.set(techName, new Set());
        }
        techUserMap.get(techName)!.add(user._id);
      }
    }

    const labels = Array.from(techUserMap.keys());
    const counts = labels.map(label => techUserMap.get(label)!.size);

    this.userTechLabels = labels;
    this.userTechCounts = counts;

    this.userTechChartDataObject = {
      labels,
      datasets: [{ data: counts }]
    };
    this.cdr.detectChanges(); // Force update
  }

}
