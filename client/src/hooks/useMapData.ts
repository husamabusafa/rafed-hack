import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface UseDataResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch student location data for density maps
 */
export function useStudentLocations(): UseDataResult<{
  lat: number;
  lon: number;
  bus_eligible?: number;
  student_id?: string;
}> {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try students table first (matching apps/deckgl_density_heatmap.html)
      let result = await api.queryClickHouse(`
        SELECT 
          toFloat64(lat) as lat, 
          toFloat64(lon) as lon,
          bus_elig as bus_eligible,
          1 as student_type
        FROM students
        WHERE lat IS NOT NULL AND lon IS NOT NULL
        LIMIT 500000
      `);

      // Fallback to unassigned_students if empty
      if (!result.success || result.data.length === 0) {
        result = await api.queryClickHouse(`
          SELECT 
            toFloat64(lat) as lat, 
            toFloat64(lon) as lon,
            1 as bus_eligible,
            2 as student_type
          FROM unassigned_students
          WHERE lat IS NOT NULL AND lon IS NOT NULL
          LIMIT 100000
        `);
      }

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch student locations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch route geometry data for animated routes
 */
export function useRouteGeometry(): UseDataResult<{
  route_id: string;
  school_id: string;
  student_count: number;
  capacity: number;
  utilization: number;
  duration_s: number;
  distance_m: number;
  geometry: string;
  shift: string;
  lat: number;
  lon: number;
}> {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Query matching apps/deckgl_animated_routes.html
      const result = await api.queryClickHouse(`
        SELECT 
          route_id,
          school_id,
          student_count,
          capacity,
          utilization,
          duration_s,
          distance_m,
          geometry,
          shift,
          lat,
          lon
        FROM school_routes
        WHERE geometry IS NOT NULL AND geometry != ''
          AND lat BETWEEN 24.3 AND 25.2
          AND lon BETWEEN 46.3 AND 47.3
      `);

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch route geometry');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch school locations
 */
export function useSchoolLocations(): UseDataResult<{
  school_id: string;
  school_name: string;
  lat: number;
  lon: number;
  student_count?: number;
}> {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.queryClickHouse(`
        SELECT 
          school_id,
          school_name,
          toFloat64(lat) as lat,
          toFloat64(lon) as lon,
          student_count
        FROM schools
        WHERE lat IS NOT NULL AND lon IS NOT NULL
        LIMIT 10000
      `);

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch school locations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch distance analysis data
 */
export function useDistanceAnalysis(): UseDataResult<{
  student_lat: number;
  student_lon: number;
  school_lat: number;
  school_lon: number;
  distance: number;
  student_id: string;
}> {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.queryClickHouse(`
        SELECT 
          toFloat64(student_lat) as student_lat,
          toFloat64(student_lon) as student_lon,
          toFloat64(school_lat) as school_lat,
          toFloat64(school_lon) as school_lon,
          distance,
          student_id
        FROM student_school_distances
        WHERE distance > 0
        LIMIT 5000
      `);

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch distance analysis');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch regional analytics data
 */
export function useRegionalAnalytics(): UseDataResult<{
  region_id: string;
  region_name: string;
  geometry: any;
  student_count: number;
  school_count: number;
  avg_distance: number;
}> {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try PostgreSQL for GIS data
      const result = await api.queryPostgres(`
        SELECT 
          region_id,
          region_name,
          ST_AsGeoJSON(geom) as geometry,
          student_count,
          school_count,
          avg_distance
        FROM regions
        LIMIT 100
      `);

      if (result.success) {
        setData(result.data.map(row => ({
          ...row,
          geometry: row.geometry ? JSON.parse(row.geometry) : null
        })));
      } else {
        setError(result.error || 'Failed to fetch regional analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch route utilization data
 */
export function useRouteUtilization(): UseDataResult<{
  route_id: string;
  school_id: string;
  student_count: number;
  capacity: number;
  utilization: number;
  duration_s: number;
  distance_m: number;
  geometry: string;
  shift: string;
  lat: number;
  lon: number;
}> {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Query matching the route utilization needs
      const result = await api.queryClickHouse(`
        SELECT 
          route_id,
          school_id,
          student_count,
          capacity,
          utilization,
          duration_s,
          distance_m,
          geometry,
          shift,
          lat,
          lon
        FROM school_routes
        WHERE geometry IS NOT NULL AND geometry != ''
          AND capacity > 0
      `);

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch route utilization');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}
