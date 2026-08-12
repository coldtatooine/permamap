// =====================
// T022 — Painel de Administração da Universidade Permamap
// =====================

import { useState } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { SourceManager } from './SourceManager';
import { CourseGenerator } from './CourseGenerator';
import { CourseAdminList } from './CourseAdminList';

type AdminTab = 'sources' | 'courses';
type CourseSubTab = 'generate' | 'list';

const TAB_LABELS: Record<AdminTab, string> = {
  sources: 'Fontes',
  courses: 'Cursos',
};

const COURSE_SUB_TAB_LABELS: Record<CourseSubTab, string> = {
  generate: 'Gerar Curso',
  list:     'Meus Cursos',
};

export function UniversityAdmin() {
  const { isAdmin } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('sources');
  const [activeCourseSubTab, setActiveCourseSubTab] = useState<CourseSubTab>('generate');

  if (!isAdmin) {
    // UniversityView é renderizado pelo componente pai quando !isAdmin
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--pm-void)' }}>
      {/* Cabeçalho com abas principais */}
      <div style={{ padding: '20px 24px 0', borderBottom: '1px solid var(--pm-border)' }}>
        <h2
          style={{
            color: 'var(--pm-text)',
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-md)',
            letterSpacing: 'var(--tracking-display)',
            margin: '0 0 16px',
          }}
        >
          Permamap U — Administração
        </h2>
        <div style={{ display: 'flex', gap: '0' }}>
          {(['sources', 'courses'] as const).map((tab) => (
            <button
              key={tab}
              className="pm-btn pm-btn-ghost"
              onClick={() => setActiveTab(tab)}
              style={{
                borderRadius: '8px 8px 0 0',
                borderBottom:
                  activeTab === tab
                    ? '2px solid var(--pm-accent)'
                    : '2px solid transparent',
                color: activeTab === tab ? 'var(--color-accent-deep)' : 'var(--pm-text-2)',
                padding: '8px 16px',
              }}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
        {activeTab === 'sources' && <SourceManager />}

        {activeTab === 'courses' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Sub-abas de cursos */}
            <div
              style={{
                display: 'flex',
                gap: '4px',
                borderBottom: '1px solid var(--pm-border)',
                paddingBottom: '0',
              }}
            >
              {(['generate', 'list'] as const).map((sub) => (
                <button
                  key={sub}
                  className="pm-btn pm-btn-ghost"
                  onClick={() => setActiveCourseSubTab(sub)}
                  style={{
                    borderRadius: '6px 6px 0 0',
                    borderBottom:
                      activeCourseSubTab === sub
                        ? '2px solid var(--pm-accent)'
                        : '2px solid transparent',
                    color: activeCourseSubTab === sub ? 'var(--color-accent-deep)' : 'var(--pm-text-2)',
                    padding: '6px 14px',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  {COURSE_SUB_TAB_LABELS[sub]}
                </button>
              ))}
            </div>

            {/* Conteúdo da sub-aba */}
            <div>
              {activeCourseSubTab === 'generate' && <CourseGenerator />}
              {activeCourseSubTab === 'list' && <CourseAdminList />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
