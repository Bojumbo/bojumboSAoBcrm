'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ProjectsKanban from '@/components/ProjectsKanban';
import { Project } from '@/types/projects';

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const router = useRouter();

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    // Переходимо на детальну сторінку проекту
    router.push(`/projects/${project.project_id}`);
  };

  const handleCreateProject = () => {
    // Тут можна відкрити форму створення нового проекту
    console.log('Створити новий проект');
  };

  return (
    <DashboardLayout>
      <div className="h-full overflow-hidden">
        <ProjectsKanban 
          onProjectClick={handleProjectClick}
          onCreateProject={handleCreateProject}
        />
      </div>
    </DashboardLayout>
  );
}
