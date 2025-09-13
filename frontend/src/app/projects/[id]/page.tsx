'use client';

import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ProjectDetailsComponent from '@/components/ProjectDetailsComponent';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <DashboardLayout>
      <div>
        <ProjectDetailsComponent projectId={parseInt(projectId)} />
      </div>
    </DashboardLayout>
  );
}
