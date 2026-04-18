// =====================
// Permamap U — Hook useUniversity
// =====================

import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {
  CuratedSource,
  Course,
  CourseCategory,
  CourseStatus,
  SourceStatus,
  CreateSourceInput,
  UpdateSourceInput,
  GenerateCourseInput,
} from '../types/university';

interface UseUniversity {
  sources: CuratedSource[];
  sourcesLoading: boolean;
  sourcesError: string | null;
  courses: Course[];
  coursesLoading: boolean;
  coursesError: string | null;
  selectedCourse: Course | null;
  fetchSources: (filters?: { category?: CourseCategory; status?: SourceStatus }) => Promise<void>;
  createSource: (input: CreateSourceInput) => Promise<CuratedSource>;
  updateSource: (id: string, input: UpdateSourceInput) => Promise<CuratedSource>;
  archiveSource: (id: string) => Promise<void>;
  fetchCourses: (filters?: { category?: CourseCategory; status?: CourseStatus }) => Promise<void>;
  fetchCourseById: (id: string) => Promise<Course>;
  generateCourse: (input: GenerateCourseInput) => Promise<Course>;
  publishCourse: (id: string) => Promise<void>;
  archiveCourse: (id: string) => Promise<void>;
  regenerateCourse: (id: string) => Promise<Course>;
  selectCourse: (course: Course | null) => void;
}

export function useUniversity(): UseUniversity {
  const [sources, setSources] = useState<CuratedSource[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [sourcesError, setSourcesError] = useState<string | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // --- Sources ---

  const fetchSources = useCallback(
    async (filters?: { category?: CourseCategory; status?: SourceStatus }) => {
      setSourcesLoading(true);
      setSourcesError(null);
      try {
        let query = supabase
          .from('curated_sources')
          .select('*')
          .order('created_at', { ascending: false });

        if (filters?.category) query = query.eq('category', filters.category);
        if (filters?.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        setSources((data ?? []) as CuratedSource[]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Falha ao carregar fontes';
        setSourcesError(msg);
        throw new Error(msg);
      } finally {
        setSourcesLoading(false);
      }
    },
    []
  );

  const createSource = useCallback(async (input: CreateSourceInput): Promise<CuratedSource> => {
    const { data, error } = await supabase
      .from('curated_sources')
      .insert(input)
      .select()
      .single();

    if (error) throw new Error(`Falha ao criar fonte: ${error.message}`);
    const created = data as CuratedSource;
    setSources((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateSource = useCallback(
    async (id: string, input: UpdateSourceInput): Promise<CuratedSource> => {
      const { data, error } = await supabase
        .from('curated_sources')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(`Falha ao atualizar fonte: ${error.message}`);
      const updated = data as CuratedSource;
      setSources((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    },
    []
  );

  const archiveSource = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('curated_sources')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) throw new Error(`Falha ao arquivar fonte: ${error.message}`);
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'archived' as SourceStatus } : s))
    );
  }, []);

  // --- Courses ---

  const fetchCourses = useCallback(
    async (filters?: { category?: CourseCategory; status?: CourseStatus }) => {
      setCoursesLoading(true);
      setCoursesError(null);
      try {
        let query = supabase
          .from('courses')
          .select(
            'id, created_by, title, slug, category, description, status, generation_error, generation_metadata, created_at, updated_at, published_at'
          )
          .order('created_at', { ascending: false });

        if (filters?.category) query = query.eq('category', filters.category);
        if (filters?.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        setCourses((data ?? []) as Course[]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Falha ao carregar cursos';
        setCoursesError(msg);
        throw new Error(msg);
      } finally {
        setCoursesLoading(false);
      }
    },
    []
  );

  const fetchCourseById = useCallback(async (id: string): Promise<Course> => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Falha ao carregar curso: ${error.message}`);
    return data as Course;
  }, []);

  const generateCourse = useCallback(
    async (input: GenerateCourseInput): Promise<Course> => {
      const { data, error } = await supabase.functions.invoke<Course>('generate-course', {
        body: input,
      });

      if (error) throw new Error(`Falha ao gerar curso: ${error.message}`);
      if (!data) throw new Error('Falha ao gerar curso: resposta vazia');

      const course = data as Course;
      setCourses((prev) => [course, ...prev]);
      return course;
    },
    []
  );

  const publishCourse = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('courses')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`Falha ao publicar curso: ${error.message}`);
    setCourses((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: 'published' as CourseStatus, published_at: new Date().toISOString() }
          : c
      )
    );
  }, []);

  const archiveCourse = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('courses')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) throw new Error(`Falha ao arquivar curso: ${error.message}`);
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'archived' as CourseStatus } : c))
    );
  }, []);

  const regenerateCourse = useCallback(async (id: string): Promise<Course> => {
    // Buscar fontes associadas ao curso
    const { data: cSources, error: csError } = await supabase
      .from('course_sources')
      .select('source_id')
      .eq('course_id', id);

    if (csError) throw new Error(`Falha ao regenerar curso: ${csError.message}`);

    const sourceIds = (cSources ?? []).map(
      (row: { source_id: string }) => row.source_id
    );

    // Buscar dados do curso para título e categoria
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('title, category')
      .eq('id', id)
      .single();

    if (courseError) throw new Error(`Falha ao regenerar curso: ${courseError.message}`);

    const { title, category } = courseData as Pick<Course, 'title' | 'category'>;

    const { data, error } = await supabase.functions.invoke<Course>('generate-course', {
      body: { title, category, source_ids: sourceIds } satisfies GenerateCourseInput,
    });

    if (error) throw new Error(`Falha ao regenerar curso: ${error.message}`);
    if (!data) throw new Error('Falha ao regenerar curso: resposta vazia');

    const updated = data as Course;
    setCourses((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const selectCourse = useCallback((course: Course | null) => {
    setSelectedCourse(course);
  }, []);

  return {
    sources,
    sourcesLoading,
    sourcesError,
    courses,
    coursesLoading,
    coursesError,
    selectedCourse,
    fetchSources,
    createSource,
    updateSource,
    archiveSource,
    fetchCourses,
    fetchCourseById,
    generateCourse,
    publishCourse,
    archiveCourse,
    regenerateCourse,
    selectCourse,
  };
}
