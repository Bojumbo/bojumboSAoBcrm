'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import SubprojectsKanban from '@/components/SubprojectsKanban';
import { SubProject } from '@/types/projects';

export default function SubprojectsPage() {
  const [selectedSubproject, setSelectedSubproject] = useState<SubProject | null>(null);
  const router = useRouter();

  const handleSubprojectClick = (subproject: SubProject) => {
    setSelectedSubproject(subproject);
    // Переходимо на детальну сторінку підпроекту
    router.push(`/subprojects/${subproject.subproject_id}`);
  };

  const handleCreateSubproject = () => {
    // Тут можна відкрити форму створення нового підпроекту
    console.log('Створити новий підпроект');
  };

  return (
    <DashboardLayout>
      <div className="h-full overflow-hidden">
        <SubprojectsKanban 
          onSubprojectClick={handleSubprojectClick}
          onCreateSubproject={handleCreateSubproject}
        />
      </div>
    </DashboardLayout>
  );
}
