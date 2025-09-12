'use client';

import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ProjectDetails from '@/components/ProjectDetails';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <DashboardLayout>
      <div className="h-full">
        <ProjectDetails projectId={parseInt(projectId)} />
      </div>
    </DashboardLayout>
  );
}
